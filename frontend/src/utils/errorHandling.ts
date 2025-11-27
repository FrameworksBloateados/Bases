import {ERROR_MESSAGES} from './constants';

/**
 * Parses error response from API and extracts error message
 */
export async function parseErrorMessage(
  response: Response,
  defaultMessage: string = ERROR_MESSAGES.UNKNOWN
): Promise<string> {
  try {
    const errorText = await response.text();
    const errorJson = JSON.parse(errorText);
    return errorJson.message || errorJson.error || defaultMessage;
  } catch {
    return defaultMessage;
  }
}

/**
 * Parses error response synchronously (for already fetched text)
 */
export function parseErrorFromText(
  errorText: string,
  defaultMessage: string = ERROR_MESSAGES.UNKNOWN
): string {
  try {
    const errorJson = JSON.parse(errorText);
    return errorJson.message || errorJson.error || defaultMessage;
  } catch {
    return errorText || defaultMessage;
  }
}

/**
 * Generic error handler for fetch responses
 */
export async function handleApiError(
  response: Response,
  defaultMessage?: string
): Promise<never> {
  const errorMessage = await parseErrorMessage(response, defaultMessage);
  throw new HttpError(response.status, errorMessage);
}

/**
 * HTTP Error class with status code
 */
export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'HttpError';
  }
}
