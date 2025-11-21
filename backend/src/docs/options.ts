export const openAPIOptions = {
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
