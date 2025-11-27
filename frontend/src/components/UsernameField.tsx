import {FormField} from './FormField';

interface UsernameFieldProps {
  label: string;
  username: string;
  onChangeHandler: (value: string) => void;
}

export function UsernameField({
  label,
  username,
  onChangeHandler,
}: UsernameFieldProps) {
  return (
    <FormField
      label={label}
      value={username}
      onChangeHandler={onChangeHandler}
      type="text"
      required
      placeholder="bases"
    />
  );
}
