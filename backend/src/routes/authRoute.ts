import {Hono} from 'hono';
import {register, login, logout, refresh} from '../docs/routes/authRoute';
import {
  registerHandler,
  loginHandler,
  logoutHandler,
  refreshAccessTokenHandler,
} from '../controllers/authController';

export const router = new Hono()
  .post('/register', register.describer, register.validator, registerHandler)
  .post('/login', login.describer, login.validator, loginHandler)
  .post('/logout', logout.describer, logoutHandler)
  .post('/refresh', refresh.describer, refreshAccessTokenHandler);
