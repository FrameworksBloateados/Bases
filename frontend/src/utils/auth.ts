import {logger} from './logger';

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

export const authenticatedFetch = async (
  url: string,
  accessToken: string,
  options: RequestInit = {}
): Promise<Response> => {
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
};
