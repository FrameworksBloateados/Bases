import {Hono} from 'hono';
import {uploadMatchResults} from '../docs/routes/matchRoute';
import {uploadMatchResultsHandler} from '../controllers/matchController';

export const router = new Hono().post(
  '/:id/results',
  uploadMatchResults.describer,
  uploadMatchResults.validator,
  uploadMatchResultsHandler
);