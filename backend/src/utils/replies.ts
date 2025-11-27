import type {Context} from 'hono';

export const unauthorized = (c: Context, message: string = 'Unauthorized') =>
  c.json({error: message}, 401);
export const badRequest = (c: Context, message: string = 'Bad Request') =>
  c.json({error: message}, 400);
export const internalServerError = (
  c: Context,
  meessage: string = 'Internal Server Error'
) => c.json({error: meessage}, 500);
export const conflict = (c: Context, message: string = 'Conflict') =>
  c.json({error: message}, 409);
export const teapot = (c: Context, message: string = "I'm a teapot") =>
  c.json({error: message}, 418);
export const forbidden = (c: Context, message: string = 'Forbidden') =>
  c.json({error: message}, 403);
