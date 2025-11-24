import {Hono} from 'hono';

export const router = new Hono().get('/', c => {
  return c.json({
    userId: c.user.id,
    email: c.user.email,
    accessToken: c.user.accessToken,
  });
});
