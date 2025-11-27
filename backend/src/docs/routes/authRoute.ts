import z from 'zod';
import {validator as zValidator, resolver, describeRoute} from 'hono-openapi';
import type {
  RouteDocumentation,
  RouteDocumentationWithoutValidator,
} from '../types/routes';
import {cookieNamePrefix} from '../../utils/jwt';

export const register: RouteDocumentation = {
  describer: describeRoute({
    tags: ['Auth'],
    responses: {
      200: {
        description: 'Successful registration',
        content: {
          'application/json': {
            schema: resolver(
              z.object({
                accessToken: z.string(),
              })
            ),
          },
        },
        headers: {
          'Set-Cookie': {
            schema: {
              type: 'string',
              example: `${cookieNamePrefix}JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Secure; SameSite=Strict; ${cookieNamePrefix}Fgp=fingerprint; HttpOnly; Secure; SameSite=Strict`,
              description:
                'Set-Cookie header containing the JWT refresh token and fingerprint',
            },
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
      409: {
        description: 'Conflict',
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
      username: z.string(),
      email: z.string(),
      password: z.string().min(8),
    })
  ),
};

export const login: RouteDocumentation = {
  describer: describeRoute({
    tags: ['Auth'],
    responses: {
      200: {
        description: 'Successful registration',
        content: {
          'application/json': {
            schema: resolver(
              z.object({
                accessToken: z.string(),
              })
            ),
          },
        },
        headers: {
          'Set-Cookie': {
            schema: {
              type: 'string',
              example: `${cookieNamePrefix}JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Secure; SameSite=Strict; ${cookieNamePrefix}Fgp=fingerprint; HttpOnly; Secure; SameSite=Strict`,
              description:
                'Set-Cookie header containing the JWT refresh token and fingerprint',
            },
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
      409: {
        description: 'Conflict',
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
      username: z.string(),
      password: z.string().min(8),
    })
  ),
};

export const refresh: RouteDocumentationWithoutValidator = {
  describer: describeRoute({
    tags: ['Auth'],
    security: [{cookieAuth: []}, {cookieFingerprint: []}],
    responses: {
      200: {
        description: 'Successful token refresh',
        content: {
          'application/json': {
            schema: resolver(
              z.object({
                accessToken: z.string(),
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

export const logout: RouteDocumentationWithoutValidator = {
  describer: describeRoute({
    tags: ['Auth'],
    responses: {
      200: {
        description: 'Successful logout',
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
    },
  }),
};
