import {Hono} from 'hono';
import {placeBet} from '../docs/routes/betRoute';
import {placeBetHandler} from '../controllers/betController';

export const router = new Hono().post(
  '/',
  placeBet.describer,
  placeBet.validator,
  placeBetHandler
);
