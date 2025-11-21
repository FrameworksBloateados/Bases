import {Hono} from 'hono';
import {register, login, refresh} from '../docs/routes/authRoute';
import {
  registerHandler,
  loginHandler,
  refreshAccessTokenHandler,
} from '../controllers/authController';

export const router = new Hono()
  .post('/register', register.describer, register.validator, registerHandler)
  .post('/login', login.describer, login.validator, loginHandler)
  .post('/refresh', refresh.describer, refreshAccessTokenHandler);
