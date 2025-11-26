import {Hono} from 'hono';
import {changePassword} from '../docs/routes/userRoute';
import {
  changePasswordHandler,
} from '../controllers/userController';

export const router = new Hono()
  .post(
    '/changePassword',
    changePassword.describer,
    changePassword.validator,
    changePasswordHandler
  )
