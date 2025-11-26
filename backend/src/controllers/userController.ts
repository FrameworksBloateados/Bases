import type {Context} from 'hono';
import {generateTokenPair, setCookies} from '../utils/jwt';
import {findUserByEmail, addUser, findUserById} from '../models/user.model';
import {
  badRequest,
  conflict,
  internalServerError,
  unauthorized,
} from '../utils/replies';

export const registerHandler = async (c: Context) => {
  try {
    const body = await c.req.json();
    const email = (body?.email || '').toString().trim().toLowerCase();
    const password = (body?.password || '').toString();

    if (!email || !password)
      return badRequest(c, 'Email and password are required');
    if (password.length < 8)
      return badRequest(c, 'Password must be at least 8 characters');
    if (await findUserByEmail(email)) return conflict(c, 'User already exists');

    const passwordHash = await Bun.password.hash(password);
    const user = await addUser({email, passwordHash});
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
    const email = (body?.email || '').toString().trim().toLowerCase();
    const password = (body?.password || '').toString();

    if (!email || !password)
      return badRequest(c, 'Email and password are required');
    const user = await findUserByEmail(email);
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

export const changePasswordHandler = async (c: Context) => {
  try {
    const body = await c.req.json();
    const actualPassword = (body?.actualPassword || '').toString();
    const newPassword = (body?.newPassword || '').toString();
    if (!actualPassword || !newPassword)
      return badRequest(c, 'Both passwords are required');
    if (newPassword.length < 8)
      return badRequest(c, 'New password must be at least 8 characters');

    const user = await findUserById(c.user.id);
    if (
      !user ||
      !(await Bun.password.verify(actualPassword, user.password_hash))
    )
      return unauthorized(c);

    await user.updatePassword(newPassword);
    return c.json({message: 'Password changed successfully'});
  } catch (err: any) {
    console.error('Error occurred during password change:', err);
    return internalServerError(c);
  }
};
