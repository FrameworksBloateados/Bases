import z from 'zod';
import {validator as zValidator, resolver, describeRoute} from 'hono-openapi';
import type {
  RouteDocumentation,
  RouteDocumentationWithoutValidator,
} from '../types/routes';

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

export const changeEmail: RouteDocumentation = {
  describer: describeRoute({
    tags: ['User'],
    security: [{cookieAuth: []}, {cookieFingerprint: []}],
    responses: {
      200: {
        description: 'Email changed successfully',
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
      password: z.string().min(8),
      newEmail: z.string(),
    })
  ),
};

export const whoami: RouteDocumentationWithoutValidator = {
  describer: describeRoute({
    tags: ['User'],
    security: [{cookieAuth: []}, {cookieFingerprint: []}],
    responses: {
      200: {
        description: 'Returns information about the authenticated user',
        content: {
          'application/json': {
            schema: resolver(
              z.object({
                id: z.string(),
                admin: z.boolean(),
                username: z.string(),
                email: z.string(),
                balance: z.number(),
                created_at: z.string(),
                updated_at: z.string(),
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
};
