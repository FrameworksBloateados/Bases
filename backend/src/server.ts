import {Hono} from 'hono';
import {swaggerUI} from '@hono/swagger-ui';
import {openAPIRouteHandler} from 'hono-openapi';
import {logger} from 'hono/logger';
import {cors} from 'hono/cors';
import {serve} from 'bun';
import {router as auth} from './routes/authRoute';
import {router as whoami} from './routes/whoamiRoute';
import {authenticator} from './middlewares/authMiddleware';
import {initDatabase} from './utils/database/init';
import {openAPIOptions} from './docs/options';
import {createAntiPareto} from './antiPareto';

const port = Number(process.env.PORT) || 3000;

(async () => {
  const routes = new Hono()
    .route('/auth', auth)
    .route('/whoami', whoami);
  await createAntiPareto(routes);

  const app = new Hono()
    .use(cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:80',
      credentials: true,
    }))
    .use(logger())
    .use(authenticator)
    .get('/openapi.json', openAPIRouteHandler(routes, openAPIOptions))
    .get('/docs', swaggerUI({url: '/openapi.json'}))
    .route('/', routes);

  try {
    await initDatabase();
    serve({
      fetch: app.fetch,
      port,
    });
    console.log(` * Server is running on port: ${port}`);
    console.log(` * API documentation available at /docs`);
    console.log(` * (Press CTRL + C to quit)`);
    console.log(``);
  } catch (err) {
    console.error(`Failed to initialize database: \n`, err);
    process.exit(1);
  }
})();
