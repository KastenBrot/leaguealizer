#!/usr/bin/env bash
set -euo pipefail

# Inputs (provided via ssh env):
#   IMAGE              - fully qualified image ref to deploy (e.g. ghcr.io/owner/repo:sha)
#   GHCR_USER          - username for ghcr.io (github.actor)
#   GHCR_TOKEN         - token with read:packages for ghcr.io (GITHUB_TOKEN)
APP_DIR="/opt/league"
ENV_FILE="${APP_DIR}/.env"
COMPOSE_FILE="${APP_DIR}/deploy/docker-compose.prod.yml"

mkdir -p "${APP_DIR}/data" "${APP_DIR}/deploy"
cd "${APP_DIR}"

# --- Install Docker if missing ---------------------------------------------
if ! command -v docker >/dev/null 2>&1; then
  export DEBIAN_FRONTEND=noninteractive
  apt-get update -y
  apt-get install -y ca-certificates curl gnupg
  install -m 0755 -d /etc/apt/keyrings
  if [ ! -f /etc/apt/keyrings/docker.gpg ]; then
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
      | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg
  fi
  . /etc/os-release
  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu ${VERSION_CODENAME} stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  systemctl enable --now docker
fi

# --- Upsert env file --------------------------------------------------------
upsert_env() {
  local key="$1"
  local value="$2"
  touch "$ENV_FILE"
  chmod 600 "$ENV_FILE"
  if grep -qE "^${key}=" "$ENV_FILE"; then
    local escaped
    escaped=$(printf '%s' "$value" | sed -e 's/[\/&]/\\&/g')
    sed -i "s/^${key}=.*/${key}=${escaped}/" "$ENV_FILE"
  else
    printf '%s=%s\n' "$key" "$value" >> "$ENV_FILE"
  fi
}

# Generate SESSION_SECRET once, preserve across deploys.
if ! grep -qE '^SESSION_SECRET=' "$ENV_FILE" 2>/dev/null; then
  secret="$(openssl rand -hex 32 2>/dev/null || head -c 32 /dev/urandom | xxd -p -c 64)"
  upsert_env SESSION_SECRET "$secret"
fi

upsert_env IMAGE "${IMAGE}"

# --- Registry login ---------------------------------------------------------
echo "${GHCR_TOKEN}" | docker login ghcr.io -u "${GHCR_USER}" --password-stdin

# --- Pull & roll ------------------------------------------------------------
docker compose -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" pull
docker compose -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" up -d --remove-orphans

# --- Cleanup ----------------------------------------------------------------
docker image prune -f
docker logout ghcr.io >/dev/null 2>&1 || true

docker compose -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" ps
