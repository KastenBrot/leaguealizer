import crypto from 'node:crypto';
import { env } from '$env/dynamic/private';
import { sqlite } from '$lib/server/db';

const SESSION_COOKIE = 'league_session';

function getSessionSecret(): string {
  // Prefer process.env (Docker, tests); fall back to SvelteKit-loaded .env in `pnpm dev`.
  const s = process.env.SESSION_SECRET ?? env.SESSION_SECRET;
  if (!s || s.length < 16) {
    throw new Error(
      'SESSION_SECRET must be set (min 16 chars). Add it to .env or set the environment variable.'
    );
  }
  return s;
}

function b64url(buf: any): string {
  return buf
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function hmac(data: string): string {
  return b64url(crypto.createHmac('sha256', getSessionSecret()).update(data).digest());
}

export function signSession(payload: object): string {
  const body = b64url(Buffer.from(JSON.stringify(payload), 'utf8'));
  const sig = hmac(body);
  return `${body}.${sig}`;
}

export function verifySession(token: string): any | null {
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expected = hmac(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    return JSON.parse(
      Buffer.from(body.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
    );
  } catch {
    return null;
  }
}

export function getSessionCookieName() {
  return SESSION_COOKIE;
}

export function countUsers(): number {
  const row = sqlite.prepare('select count(1) as c from users').get() as { c: number };
  return row.c;
}

export function getUserById(id: number) {
  return sqlite
    .prepare(
      'select id, username, created_at as createdAt, last_login_at as lastLoginAt from users where id = ?'
    )
    .get(id) as
    | { id: number; username: string; createdAt: number; lastLoginAt: number | null }
    | undefined;
}

export function getUserForLogin(username: string) {
  return sqlite
    .prepare('select id, username, password_hash as passwordHash from users where username = ?')
    .get(username) as { id: number; username: string; passwordHash: string } | undefined;
}

export async function hashPassword(password: string): Promise<string> {
  const { default: bcrypt } = await import('bcryptjs');
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  const { default: bcrypt } = await import('bcryptjs');
  return bcrypt.compare(password, passwordHash);
}

export async function createUser(
  username: string,
  password: string
): Promise<{ id: number; username: string }> {
  const passwordHash = await hashPassword(password);
  const info = sqlite
    .prepare('insert into users (username, password_hash) values (?, ?)')
    .run(username.trim(), passwordHash);
  return { id: Number(info.lastInsertRowid), username: username.trim() };
}

export function touchLastLogin(userId: number) {
  sqlite
    .prepare("update users set last_login_at = (unixepoch('subsec') * 1000) where id = ?")
    .run(userId);
}
