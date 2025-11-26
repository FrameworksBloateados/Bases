import z from 'zod';
import {validator as zValidator, resolver, describeRoute} from 'hono-openapi';
import type {RouteDocumentation} from '../types/routes';

export const changePassword: RouteDocumentation = {
  describer: describeRoute({
    tags: ['User'],
    security: [{cookieAuth: []}, {cookieFingerprint: []}],
    responses: {
      200: {
        description: 'Password changed successfully',
        content: {
          'application/json': {
            schema: resolver(
              z.object({
                message: z.string(),
              })
            ),
          },
        },
      },
      400: {
        description: 'Bad Request',
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
      actualPassword: z.string().min(8),
      newPassword: z.string().min(8),
    })
  ),
};
