import {Hono} from 'hono';
import {OpenAPIHono} from '@hono/zod-openapi';
import {swaggerUI} from '@hono/swagger-ui';
import {openAPIRouteHandler} from 'hono-openapi';
import type {GenerateSpecOptions} from 'hono-openapi';
import {logger} from 'hono/logger';
import {serve} from 'bun';
import {router as auth} from './src/routes/authRoute';
import {authenticator} from './src/middlewares/authMiddleware';

const port = Number(process.env.PORT) || 3000;

const options = {
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
          description: 'Fingerprint para el refresh token y access token',
        },
      },
    },
  },
};

const routes = new Hono()
  .route('/auth', auth)
  .get('/', c =>
    c.json({
      userId: c.user?.id,
      email: c.user?.email,
      accessToken: c.user?.accessToken,
    })
  );

const app = new Hono()
  .use(logger())
  .use(authenticator)
  .get('/openapi.json', openAPIRouteHandler(routes, options))
  .get('/docs', swaggerUI({url: '/openapi.json'}))
  .route('/', routes);

serve({
  fetch: app.fetch,
  port,
});

console.log(`Server running at http://localhost:${port}`);
