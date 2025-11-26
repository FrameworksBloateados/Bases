import {Hono} from 'hono';
import {changePassword, whoami} from '../docs/routes/userRoute';
import {
  changePasswordHandler,
  whoamiHandler,
} from '../controllers/userController';

export const router = new Hono()
  .post(
    '/changePassword',
    changePassword.describer,
    changePassword.validator,
    changePasswordHandler
  )
  .get('/whoami', whoami.describer, whoamiHandler);
