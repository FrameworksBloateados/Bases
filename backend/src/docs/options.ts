import {SwaggerUI} from '@hono/swagger-ui';
import {cookieNamePrefix} from '../utils/jwt';

export const openAPIOptions = {
  openapi: '3.1.1',
  documentation: {
    info: {
      title: 'Fundamentalistas de Frameworks Bloateados',
      version: '0.0.0',
      description: 'Documentación con Swagger',
    },
    servers: [
      {
        url: '/api/v1',
        description: 'Servidor API',
      },
    ],
    tags: [
      {name: 'Auth', description: 'Endpoints de autenticación'},
      {name: 'User', description: 'Endpoints del usuario'},
      {name: 'Bets', description: 'Endpoints de apuestas'},
      {
        name: 'AntiPareto',
        description:
          'Endpoints CRUD generados automáticamente para todas las tablas',
      },
    ],
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
          name: `${cookieNamePrefix}JWT`,
          description: 'Refresh token',
        },
        cookieFingerprint: {
          type: 'apiKey' as const,
          in: 'cookie',
          name: `${cookieNamePrefix}Fgp`,
          description: 'Fingerprint para el refresh token y el access token',
        },
      },
    },
  },
};

export const renderSwaggerUI = (openapiUrl: string) => (c: any) => {
  return c.html(getSwaggerHTML(openapiUrl));
};

const getSwaggerHTML = (openapiUrl: string) => `
  <html lang="es">
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Swagger UI</title>
      <style>${swaggerCSS}</style>
    </head>
    <body>
      ${SwaggerUI({url: openapiUrl})}
    </body>
  </html>
`;

const swaggerCSS = ``;
