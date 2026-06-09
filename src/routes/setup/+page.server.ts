import type { Actions, PageServerLoad } from './$types';
import { countUsers, createUser, setSessionCookie, touchLastLogin } from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
  const c = countUsers();
  if (c > 0) throw redirect(303, '/login');
  return {};
};

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    if (countUsers() > 0) throw redirect(303, '/login');

    const data = await request.formData();
    const username = String(data.get('username') ?? '').trim();
    const password = String(data.get('password') ?? '');

    if (!username || username.length < 3)
      return fail(400, { username, error: 'Username must be at least 3 characters.' });
    if (!password || password.length < 8)
      return fail(400, { username, error: 'Password must be at least 8 characters.' });

    try {
      const u = await createUser(username, password);
      touchLastLogin(u.id);
      setSessionCookie(cookies, u.id);
    } catch (e: any) {
      return fail(400, { username, error: e?.message ?? 'Failed to create user.' });
    }

    throw redirect(303, '/admin');
  }
};
