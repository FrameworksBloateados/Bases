import {logger} from './Logger';

const authenticate = async (email: string, password: string, url: string) => {
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({email, password}),
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Authentication failed: ${errorText}`);
  }

  const {accessToken} = await response.json();
  return accessToken;
};

export const login = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const accessToken = await authenticate(
    email,
    password,
    `http://ffb.dev.internal/api/v1/auth/login`
  );
  logger.info('Login successful');
  return accessToken;
};

export const register = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const accessToken = await authenticate(
    email,
    password,
    `http://ffb.dev.internal/api/v1/auth/register`
  );
  logger.info('Registration successful');
  return accessToken;
};

export const logout = async () => {
  const response = await fetch(`http://ffb.dev.internal/api/v1/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Logout failed: ${errorText}`);
  }

  logger.info('Logout successful');
}

export const refreshToken = async () => {
  const response = await fetch(
    `http://ffb.dev.internal/api/v1/auth/refresh`,
    {
      method: 'POST',
      credentials: 'include',
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Token refresh failed: ${errorText}`);
  }

  const {accessToken} = await response.json();
  logger.info('Token refresh successful');
  return accessToken;
}

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const authenticatedFetch = async (
  url: string,
  accessToken: string,
  options: RequestInit = {}
) => {
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${accessToken}`,
  } as HeadersInit;

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new HttpError(response.status, `Request failed: ${errorText}`);
  }

  return response;
};
