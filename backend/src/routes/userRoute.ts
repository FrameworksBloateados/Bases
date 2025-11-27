import {Hono} from 'hono';
import {changePassword, changeEmail, whoami} from '../docs/routes/userRoute';
import {
  changePasswordHandler,
  changeEmailHandler,
  whoamiHandler,
} from '../controllers/userController';

export const router = new Hono()
  .post(
    '/changePassword',
    changePassword.describer,
    changePassword.validator,
    changePasswordHandler
  )
  .post(
    '/changeEmail',
    changeEmail.describer,
    changeEmail.validator,
    changeEmailHandler
  )
  .get('/whoami', whoami.describer, whoamiHandler);
