import z from 'zod';
import {Hono} from 'hono';
import {validator as zValidator, resolver, describeRoute} from 'hono-openapi';
import {
  registerHandler,
  loginHandler,
  refreshAccessTokenHandler,
} from '../controllers/authController';

export const router = new Hono()
  .post(
    '/register',
    describeRoute({
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
                example:
                  '__Secure-JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Secure; SameSite=Strict; __Secure-Fgp=fingerprint; HttpOnly; Secure; SameSite=Strict',
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
    zValidator(
      'json',
      z.object({
        email: z.string(),
        password: z.string().min(8),
      })
    ),
    registerHandler
  )
  .post(
    '/login',
    describeRoute({
      tags: ['Auth'],
      responses: {
        200: {
          description: 'Successful login',
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
                example:
                  '__Secure-JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Secure; SameSite=Strict; __Secure-Fgp=fingerprint; HttpOnly; Secure; SameSite=Strict',
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
    zValidator(
      'json',
      z.object({
        email: z.string(),
        password: z.string().min(8),
      })
    ),
    loginHandler
  )
  .post(
    '/refresh',
    describeRoute({
      tags: ['Auth'],
      security: [
        {cookieAuth: []},
        {cookieFingerprint: []},
      ],
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
    refreshAccessTokenHandler
  );
