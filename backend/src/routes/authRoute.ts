import {Hono} from 'hono';
import {refresh, register, login, logout} from '../docs/routes/authRoute';
import {
  registerHandler,
  loginHandler,
  refreshAccessTokenHandler,
  logoutHandler,
} from '../controllers/authController';

export const router = new Hono()
  .post('/register', register.describer, register.validator, registerHandler)
  .post('/login', login.describer, login.validator, loginHandler)
  .post('/refresh', refresh.describer, refreshAccessTokenHandler)
  .post('/logout', logout.describer, logoutHandler);
