import z from 'zod';
import {validator as zValidator, resolver, describeRoute} from 'hono-openapi';
import type {RouteDocumentation} from '../types/routes';

export const placeBet: RouteDocumentation = {
  describer: describeRoute({
    tags: ['Bets'],
    summary: 'Realizar una apuesta',
    description: 'Realiza una apuesta en un partido. Descuenta el balance del usuario de forma transaccional.',
    security: [{bearerAuth: []}, {cookieAuth: []}, {cookieFingerprint: []}],
    responses: {
      200: {
        description: 'Apuesta realizada exitosamente',
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
        description: 'Bad Request - Datos inválidos, saldo insuficiente o partido no disponible',
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
    'json',
    z.object({
      match_id: z.number().int().positive(),
      team_id: z.number().int().positive(),
      amount: z.number().positive(),
    })
  ),
};
