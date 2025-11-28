import {API_ENDPOINTS} from './constants';
import {HttpError, parseErrorFromText} from './errorHandling';

export const login = async ({
  username,
  password,
}: {
  username: string;
  password: string;
}) => {
  const response = await fetch(API_ENDPOINTS.LOGIN, {
    method: 'POST',
    body: JSON.stringify({username, password}),
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorText = await response.text();
    const errorMessage = parseErrorFromText(errorText);
    throw new HttpError(response.status, errorMessage);
  }

  const {accessToken} = await response.json();
  return accessToken;
};

export const register = async ({
  username,
  email,
  password,
}: {
  username: string;
  password: string;
  email: string;
}) => {
  const response = await fetch(API_ENDPOINTS.REGISTER, {
    method: 'POST',
    body: JSON.stringify({username, email, password}),
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorText = await response.text();
    const errorMessage = parseErrorFromText(errorText);
    throw new HttpError(response.status, errorMessage);
  }

  const {accessToken} = await response.json();
  return accessToken;
};

export const logout = async () => {
  const response = await fetch(API_ENDPOINTS.LOGOUT, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    const errorText = await response.text();
    const errorMessage = parseErrorFromText(errorText);
    throw new HttpError(response.status, errorMessage);
  }
};

export const refreshToken = async () => {
  const response = await fetch(API_ENDPOINTS.REFRESH, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    const errorText = await response.text();
    const errorMessage = parseErrorFromText(errorText);
    throw new HttpError(response.status, errorMessage);
  }

  const {accessToken} = await response.json();
  return accessToken;
};

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
    const errorMessage = parseErrorFromText(errorText);
    throw new HttpError(response.status, errorMessage);
  }

  return response;
};
