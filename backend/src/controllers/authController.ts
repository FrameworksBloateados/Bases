import type {Context} from 'hono';
import {
  generateTokenPair,
  getRefreshTokenPayload,
  regenerateAccessToken,
  setCookies,
  getUserFromPayload,
} from '../utils/jwt';
import {
  findUserByEmail,
  addUser,
  findUserByUsername,
} from '../models/user.model';
import {deleteCookie, getCookie} from 'hono/cookie';
import {
  badRequest,
  conflict,
  internalServerError,
  unauthorized,
} from '../utils/replies';
import {cookieNamePrefix} from '../utils/jwt';

export const registerHandler = async (c: Context) => {
  try {
    const body = await c.req.json();
    const username = (body?.username || '').toString().trim();
    const email = (body?.email || '').toString().trim().toLowerCase();
    const password = (body?.password || '').toString();

    if (!username || !email || !password)
      return badRequest(c, 'Username, email and password are required');
    if (password.length < 8)
      return badRequest(c, 'Password must be at least 8 characters');
    if ((await findUserByUsername(username)) || (await findUserByEmail(email)))
      return conflict(c, 'Username or email already in use');

    const passwordHash = await Bun.password.hash(password);
    const user = await addUser({username, email, passwordHash});
    const userId = user.id.toString();
    const admin = user.admin;
    const {accessToken, refreshToken, fingerprint} = await generateTokenPair(
      userId,
      admin
    );

    setCookies(c, fingerprint, refreshToken);
    return c.json({accessToken});
  } catch (err: any) {
    console.error('Error occurred during registration:', err);
    return internalServerError(c);
  }
};

export const loginHandler = async (c: Context) => {
  try {
    const body = await c.req.json();
    const username = (body?.username || '').toString().trim();
    const password = (body?.password || '').toString();

    if (!username || !password)
      return badRequest(c, 'Username and password are required');
    const user = await findUserByUsername(username);
    if (!user || !(await Bun.password.verify(password, user.password_hash)))
      return unauthorized(c);

    const userId = user.id.toString();
    const admin = user.admin;
    const {accessToken, refreshToken, fingerprint} = await generateTokenPair(
      userId,
      admin
    );

    setCookies(c, fingerprint, refreshToken);
    return c.json({accessToken});
  } catch (err: any) {
    console.error('Error occurred during login:', err);
    return internalServerError(c);
  }
};

export const refreshAccessTokenHandler = async (c: Context) => {
  try {
    await refreshAccessToken(c);
    return c.json({accessToken: c.user.accessToken});
  } catch (err: any) {
    return unauthorized(c);
  }
};

const refreshAccessToken = async (c: Context) => {
  const refreshToken = getCookie(c, `${cookieNamePrefix}JWT`);
  const fingerprint = getCookie(c, `${cookieNamePrefix}Fgp`);

  try {
    if (!refreshToken || !fingerprint) return unauthorized(c);

    const payload = await getRefreshTokenPayload(refreshToken, fingerprint);
    const user = await getUserFromPayload(payload);
    if (!user) throw new Error('User not found');

    const accessToken = await regenerateAccessToken(
      user.id.toString(),
      user.admin,
      fingerprint
    );
    c.user = {
      id: user.id,
      admin: user.admin,
      username: user.username,
      email: user.email,
      balance: user.balance,
      created_at: user.created_at,
      updated_at: user.updated_at,
      accessToken,
    };
  } catch (err: any) {
    const errorMessage = 'Error refreshing access token';
    console.error(`${errorMessage}:`, err);
    throw new Error(errorMessage);
  }
};

export const logoutHandler = async (c: Context) => {
  try {
    deleteCookie(c, `${cookieNamePrefix}JWT`);
    deleteCookie(c, `${cookieNamePrefix}Fgp`);
    return c.json({message: 'Logged out successfully'});
  } catch (err: any) {
    console.error('Error occurred during logout:', err);
    return internalServerError(c);
  }
};
