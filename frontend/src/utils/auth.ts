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
  return response;
}

export const login = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const response = await authenticate(email, password, `${process.env.BACKEND_URL}/auth/login`);
  const {accessToken} = await response.json();
  logger.info(accessToken);
}
export const register = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const response = await authenticate(email, password, `${process.env.BACKEND_URL}/auth/register`);
  const {accessToken} = await response.json();
  logger.info(accessToken);
}
