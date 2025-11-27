import {FormField} from './FormField';

interface PasswordFieldProps {
  label: string;
  password: string;
  onChangeHandler: (value: string) => void;
  minLength?: number;
  showValidation?: boolean;
}

export function PasswordField({
  label,
  password,
  onChangeHandler,
  minLength = 8,
  showValidation = true,
}: PasswordFieldProps) {
  const isValid = password.length === 0 || password.length >= minLength;
  const showError = showValidation && password.length > 0 && !isValid;

  return (
    <FormField
      label={label}
      value={password}
      onChangeHandler={onChangeHandler}
      type="password"
      required
      minLength={minLength}
      placeholder="••••••••"
      error={`La contraseña debe tener al menos ${minLength} caracteres`}
      showError={showError}
    />
  );
}
