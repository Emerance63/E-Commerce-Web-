import { client } from './client';

const USER_ID_KEY = 'ecomus_user_id';
const TOKEN_KEY = 'ecomus_token';
const EMAIL_KEY = 'ecomus_email';

let ensureUserPromise = null;

export const getStoredUserId = () => localStorage.getItem(USER_ID_KEY);

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY);

export const getStoredEmail = () => localStorage.getItem(EMAIL_KEY);

/** Register + login a guest user; returns a valid MongoDB ObjectId for cart/orders. */
export const ensureUser = async () => {
  const storedId = getStoredUserId();
  if (storedId && /^[a-f0-9]{24}$/i.test(storedId)) {
    return storedId;
  }

  if (ensureUserPromise) return ensureUserPromise;

  ensureUserPromise = (async () => {
    const email = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 9)}@ecomus.local`;
    const password = `guest_${Math.random().toString(36).slice(2, 12)}`;

    await client.post('/users/register', {
      email,
      password,
      name: 'Guest Shopper',
    });

    const loginRes = await client.post('/users/login', { email, password });
    const user = loginRes.data?.data?.user;
    const token = loginRes.data?.data?.token;

    if (!user?.id) throw new Error('Failed to create guest account');

    localStorage.setItem(USER_ID_KEY, user.id);
    localStorage.setItem(EMAIL_KEY, email);
    if (token) localStorage.setItem(TOKEN_KEY, token);

    return user.id;
  })();

  try {
    return await ensureUserPromise;
  } finally {
    ensureUserPromise = null;
  }
};
