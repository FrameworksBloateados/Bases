import {FormField} from './FormField';
import {VALIDATION} from '../utils/constants';

interface EmailFieldProps {
  label: string;
  email: string;
  onChangeHandler: (value: string) => void;
  showValidation?: boolean;
}

export function EmailField({
  label,
  email,
  onChangeHandler,
  showValidation = true,
}: EmailFieldProps) {
  const isValid = email.length === 0 || VALIDATION.EMAIL_REGEX.test(email);
  const showError = showValidation && email.length > 0 && !isValid;

  return (
    <FormField
      label={label}
      value={email}
      onChangeHandler={onChangeHandler}
      type="email"
      required
      pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]"
      placeholder="vos@dominio.tld"
      error="Ingresá un email válido"
      showError={showError}
    />
  );
}
