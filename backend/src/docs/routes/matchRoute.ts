import z from 'zod';
import {validator as zValidator, resolver, describeRoute} from 'hono-openapi';
import type {RouteDocumentation} from '../types/routes';

export const uploadMatchResults: RouteDocumentation = {
  describer: describeRoute({
    tags: ['Matches'],
    summary: 'Cargar resultados de un partido',
    description: 'Carga los resultados de un partido finalizado, incluyendo estadísticas de jugadores y distribución de ganancias. Requiere permisos de administrador.',
    security: [{bearerAuth: []}, {cookieAuth: []}, {cookieFingerprint: []}],
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'integer' },
        description: 'ID del partido',
      },
    ],
    requestBody: {
      required: true,
      content: {
        'multipart/form-data': {
          schema: {
            type: 'object',
            properties: {
              results: {
                type: 'string',
                format: 'binary',
                description: 'Archivo CSV con resultados del partido (match_id, winning_team_id, team_a_score, team_b_score)',
              },
              stats: {
                type: 'string',
                format: 'binary',
                description: 'Archivo CSV con estadísticas de jugadores (match_id, player_id, kills, headshot_kills, assists, deaths)',
              },
            },
            required: ['results', 'stats'],
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Resultados cargados exitosamente',
        content: {
          'application/json': {
            schema: resolver(
              z.object({
                message: z.string(),
                success: z.boolean(),
              })
            ),
          },
        },
      },
      400: {
        description: 'Bad Request - Datos inválidos o partido no elegible',
        content: {
          'application/json': {
            schema: resolver(
              z.object({
                error: z.string(),
              })
            ),
          },
        },
      },
      401: {
        description: 'Unauthorized',
        content: {
          'application/json': {
            schema: resolver(
              z.object({
                error: z.string(),
              })
            ),
          },
        },
      },
      500: {
        description: 'Internal Server Error',
        content: {
          'application/json': {
            schema: resolver(z.string().describe('Internal Server Error')),
          },
        },
      },
    },
  }),
  validator: zValidator(
    'form',
    z.object({
      results: z.file(),
      stats: z.file(),
    })
  ),
};