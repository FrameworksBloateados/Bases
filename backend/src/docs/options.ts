import {cookieNamePrefix} from '../utils/jwt';

export const openAPIOptions = {
  openapi: '3.1.1',
  documentation: {
    info: {
      title: 'Fundamentalistas de Frameworks Bloateados',
      version: '0.0.0',
      description: 'Documentación con Swagger',
    },
    tags: [
      {name: 'Auth', description: 'Endpoints de autenticación'},
      {name: 'User', description: 'Endpoints del usuario'},
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
