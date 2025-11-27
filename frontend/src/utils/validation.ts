import {VALIDATION, ERROR_MESSAGES} from './constants';

export function validateEmail(email: string): string | null {
  if (!email) return ERROR_MESSAGES.ALL_FIELDS_REQUIRED;
  if (!VALIDATION.EMAIL_REGEX.test(email)) return ERROR_MESSAGES.INVALID_EMAIL;
  return null;
}

export function validatePassword(
  password: string,
  minLength = VALIDATION.MIN_PASSWORD_LENGTH
): string | null {
  if (!password) return ERROR_MESSAGES.ALL_FIELDS_REQUIRED;
  if (password.length < minLength) return ERROR_MESSAGES.PASSWORD_MIN_LENGTH;
  return null;
}

export function validatePasswordMatch(
  password: string,
  confirmPassword: string
): string | null {
  if (password !== confirmPassword) return ERROR_MESSAGES.PASSWORDS_DONT_MATCH;
  return null;
}

export function validateRequired(value: string): string | null {
  if (!value) return ERROR_MESSAGES.ALL_FIELDS_REQUIRED;
  return null;
}
