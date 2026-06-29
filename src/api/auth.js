import { client } from './client';

const USER_ID_KEY = 'ecomus_user_id';
const TOKEN_KEY = 'ecomus_token';
const EMAIL_KEY = 'ecomus_email';

let ensureUserPromise = null;

export const getStoredUserId = () => localStorage.getItem(USER_ID_KEY);

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY);

export const getStoredEmail = () => localStorage.getItem(EMAIL_KEY);

/** Clear all stored credentials so a fresh registration will happen on next ensureUser() call. */
export const clearStoredUser = () => {
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EMAIL_KEY);
  ensureUserPromise = null;
};

/**
 * Register + login a guest user; returns a valid MongoDB ObjectId for cart/orders.
 * @param {boolean} forceNew — if true, clears any stored credentials and registers a fresh user.
 */
export const ensureUser = async (forceNew = false) => {
  if (forceNew) {
    clearStoredUser();
  }

  const storedId = getStoredUserId();
  if (storedId && /^[a-f0-9]{24}$/i.test(storedId)) {
    return storedId;
  }

  // Clear any invalid stored ID so a fresh registration can happen
  if (storedId) {
    clearStoredUser();
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

    // Handle multiple possible API response shapes
    const resData = loginRes.data?.data || loginRes.data;
    const user = resData?.user || resData;
    const token = resData?.token || loginRes.data?.token;
    const userId = user?.id || user?._id;

    if (!userId) throw new Error('Failed to create guest account');

    localStorage.setItem(USER_ID_KEY, userId);
    localStorage.setItem(EMAIL_KEY, email);
    if (token) localStorage.setItem(TOKEN_KEY, token);

    return userId;
  })();

  try {
    return await ensureUserPromise;
  } finally {
    ensureUserPromise = null;
  }
};
