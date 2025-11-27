import {logger} from './logger';

export const login = async ({
  username,
  password,
}: {
  username: string;
  password: string;
}) => {
  const response = await fetch('http://127-0-0-1.sslip.io/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({username, password}),
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = 'Error desconocido';

    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message || errorJson.error || errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }

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
  const response = await fetch(
    'http://127-0-0-1.sslip.io/api/v1/auth/register',
    {
      method: 'POST',
      body: JSON.stringify({username, email, password}),
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = 'Error desconocido';

    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message || errorJson.error || errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }

    throw new HttpError(response.status, errorMessage);
  }

  const {accessToken} = await response.json();
  return accessToken;
};

export const logout = async () => {
  const response = await fetch(`http://127-0-0-1.sslip.io/api/v1/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = 'Error desconocido';

    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message || errorJson.error || errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }

    throw new HttpError(response.status, errorMessage);
  }
};

export const refreshToken = async () => {
  const response = await fetch(
    `http://127-0-0-1.sslip.io/api/v1/auth/refresh`,
    {
      method: 'POST',
      credentials: 'include',
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = 'Error desconocido';

    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message || errorJson.error || errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }

    throw new HttpError(response.status, errorMessage);
  }

  const {accessToken} = await response.json();
  return accessToken;
};

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
    let errorMessage = 'Error desconocido';

    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message || errorJson.error || errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }

    throw new HttpError(response.status, errorMessage);
  }

  return response;
};
