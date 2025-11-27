import {createMiddleware} from 'hono/factory';
import {getAccessTokenPayload, getUserFromPayload} from '../utils/jwt';
import {getCookie} from 'hono/cookie';
import type {Context, Next} from 'hono';
import {unauthorized} from '../utils/replies';
import {cookieNamePrefix} from '../utils/jwt';

function extractBearerToken(header?: string): string | null {
  if (!header) return null;
  const match = header.match(/^Bearer (.+)$/i);
  return match && match[1]?.trim() ? match[1].trim() : null;
}

const authenticateAccessToken = async (c: Context) => {
  const fingerprint = getCookie(c, `${cookieNamePrefix}Fgp`);
  if (!fingerprint) throw new Error('Falta la cookie de huella digital');

  const accessToken = extractBearerToken(c.req.header?.('authorization'));
  if (!accessToken) throw new Error('Falta el token de acceso');

  const payload = await getAccessTokenPayload(accessToken, fingerprint);
  const user = await getUserFromPayload(payload);
  if (!user) throw new Error('Usuario no encontrado');

  c.user = {
    id: user.id,
    admin: user.admin,
    username: user.username,
    email: user.email,
    balance: user.balance,
    created_at: user.created_at,
    updated_at: user.updated_at,
    accessToken,
  };
};

export const authenticator = createMiddleware(
  async (c: Context, next: Next) => {
    const url = new URL(c.req.url);
    const skipPaths = ['/favicon.ico', '/openapi.json', '/docs', '/auth'];
    if (skipPaths.some(path => url.pathname.startsWith(path))) {
      return await next();
    }
    try {
      await authenticateAccessToken(c);
      return await next();
    } catch (err) {
      return unauthorized(c);
    }
  }
);
