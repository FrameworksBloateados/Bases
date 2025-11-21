import {createMiddleware} from 'hono/factory';
import {getAccessTokenPayload, getUserFromPayload} from '../utils/jwt';
import {getCookie} from 'hono/cookie';
import type {Context, Next} from 'hono';
import {unauthorized} from '../utils/replies';

function extractBearerToken(header?: string): string | null {
  if (!header) return null;
  const match = header.match(/^Bearer (.+)$/i);
  return match && match[1]?.trim() ? match[1].trim() : null;
}

const authenticateAccessToken = async (c: Context) => {
  const fingerprint = getCookie(c, '__Secure-Fgp');
  if (!fingerprint) throw new Error('Missing fingerprint cookie');

  const accessToken = extractBearerToken(c.req.header?.('authorization'));
  if (!accessToken) throw new Error('Missing access token');

  const payload = await getAccessTokenPayload(accessToken, fingerprint);
  const user = await getUserFromPayload(payload);
  if (!user) throw new Error('User not found');

  c.user = {id: user.id, admin: user.admin, email: user.email, balance: user.balance, accessToken};
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
