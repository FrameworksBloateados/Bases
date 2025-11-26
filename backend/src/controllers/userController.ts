import type {Context} from 'hono';
import {
  findUserById,
} from '../models/user.model';
import {
  badRequest,
  internalServerError,
  unauthorized,
} from '../utils/replies';

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

export const whoamiHandler = async (c: Context) => {
  try {
    const user = await findUserById(c.user.id);
    if (!user) return unauthorized(c);

    return c.json({
      id: user.id,
      username: user.username,
      email: user.email,
      admin: user.admin,
      balance: user.balance,
      created_at: user.created_at,
      updated_at: user.updated_at,
    });
  } catch (err: any) {
    console.error('Error occurred during whoami:', err);
    return internalServerError(c);
  }
};
