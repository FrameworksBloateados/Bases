import {Hono} from 'hono';

export const router = new Hono().get('/', c => {
  return c.json({
    id: c.user.id,
    admin: c.user.admin,
    email: c.user.email,
    balance: c.user.balance,
    accessToken: c.user.accessToken,
  });
});
