import type {Context} from 'hono';
import {findUserById, findUserByEmail} from '../models/user.model';
import {badRequest, internalServerError, unauthorized} from '../utils/replies';

export const changePasswordHandler = async (c: Context) => {
  try {
    const body = await c.req.json();
    const actualPassword = (body?.actualPassword || '').toString();
    const newPassword = (body?.newPassword || '').toString();
    if (!actualPassword || !newPassword)
      return badRequest(c, 'Ambas contraseñas son requeridas');
    if (newPassword.length < 8)
      return badRequest(
        c,
        'La nueva contraseña debe tener al menos 8 caracteres'
      );

    const user = await findUserById(c.user.id);
    if (
      !user ||
      !(await Bun.password.verify(actualPassword, user.password_hash))
    )
      return unauthorized(c, 'Contraseña incorrecta');

    await user.updatePassword(newPassword);
    return c.json({message: 'Contraseña cambiada exitosamente'});
  } catch (err: any) {
    console.error('Error occurred during password change:', err);
    return internalServerError(c);
  }
};

export const changeEmailHandler = async (c: Context) => {
  try {
    const body = await c.req.json();
    const password = (body?.password || '').toString();
    const newEmail = (body?.newEmail || '').toString();
    if (!password || !newEmail)
      return badRequest(c, 'La contraseña y el nuevo email son requeridos');
    if (!newEmail.includes('@'))
      return badRequest(c, 'Formato de email inválido');

    const user = await findUserById(c.user.id);
    if (!user || !(await Bun.password.verify(password, user.password_hash)))
      return unauthorized(c, 'Contraseña incorrecta');

    const existingUser = await findUserByEmail(newEmail);
    if (existingUser) return badRequest(c, 'El email ya está en uso');

    await user.updateEmail(newEmail);
    return c.json({message: 'Email cambiado exitosamente'});
  } catch (err: any) {
    console.error('Error occurred during email change:', err);
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
