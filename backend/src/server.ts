import {Hono} from 'hono';
import {swaggerUI} from '@hono/swagger-ui';
import {openAPIRouteHandler} from 'hono-openapi';
import {logger} from 'hono/logger';
import {serve} from 'bun';
import {router as auth} from './routes/authRoute';
import {authenticator} from './middlewares/authMiddleware';
import {initDatabase} from './utils/database/init';

const port = Number(process.env.PORT) || 3000;

const openAPIOptions = {
  openapi: '3.1.1',
  documentation: {
    info: {
      title: 'Fundamentalistas de Frameworks Bloateados',
      version: '0.0.0',
      description: 'Documentación con Swagger',
    },
    tags: [{name: 'Auth', description: 'Endpoints de autenticación'}],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http' as const,
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Access token',
        },
        cookieAuth: {
          type: 'apiKey' as const,
          in: 'cookie',
          name: '__Secure-JWT',
          description: 'Refresh token',
        },
        cookieFingerprint: {
          type: 'apiKey' as const,
          in: 'cookie',
          name: '__Secure-Fgp',
          description: 'Fingerprint para el refresh token y el access token',
        },
      },
    },
  },
};

const routes = new Hono()
  .route('/auth', auth)
  .get('/', c => c.json({
    userId: c.user?.id,
    email: c.user?.email,
    accessToken: c.user?.accessToken,
  })
);

const app = new Hono()
  .use(logger())
  .use(authenticator)
  .get('/openapi.json', openAPIRouteHandler(routes, openAPIOptions))
  .get('/docs', swaggerUI({url: '/openapi.json'}))
  .route('/', routes);

initDatabase()
  .then(() => {
    serve({
      fetch: app.fetch,
      port,
    });
    console.log(` * Server is running on port: ${port}`);
    console.log(` * API documentation available at /docs`);
    console.log(` * (Press CTRL + C to quit)`);
    console.log(``);
  })
  .catch(err => {
    console.error(`Failed to initialize database: \n`, err);
    process.exit(1);
  });
