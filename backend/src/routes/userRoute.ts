import {Hono} from 'hono';
import {changePassword, logout} from '../docs/routes/userRoute';
import {
  changePasswordHandler,
  logoutHandler,
} from '../controllers/userController';

export const router = new Hono()
  .post(
    '/changePassword',
    changePassword.describer,
    changePassword.validator,
    changePasswordHandler
  )
  .post('/logout', logout.describer, logoutHandler);
