import {useState} from 'react';
import {FormModal} from './FormModal';
import {EmailField} from './EmailField';
import {PasswordField} from './PasswordField';
import {validateEmail, validateRequired} from '../utils/validation';

type ChangeEmailModalProps = {
  isOpen: boolean;
  isClosing: boolean;
  onClose: () => void;
  onSubmit: (password: string, newEmail: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
};

export function ChangeEmailModal({
  isOpen,
  isClosing,
  onClose,
  onSubmit,
  isLoading,
  error,
}: ChangeEmailModalProps) {
  const [password, setPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLocalError(null);

    const passwordError = validateRequired(password);
    if (passwordError) {
      setLocalError(passwordError);
      return;
    }

    const emailError = validateEmail(newEmail);
    if (emailError) {
      setLocalError(emailError);
      return;
    }

    await onSubmit(password, newEmail);
  };

  const handleClose = () => {
    setPassword('');
    setNewEmail('');
    setLocalError(null);
    onClose();
  };

  const displayError = localError || error;

  return (
    <FormModal
      isOpen={isOpen}
      isClosing={isClosing}
      onClose={handleClose}
      onSubmit={handleSubmit}
      title="Cambiar email"
      subtitle="Ingresa el nuevo email y tu contraseña actual"
      isLoading={isLoading}
      submitText="Cambiar email"
      error={displayError}
    >
      <EmailField
        label="Nuevo email"
        email={newEmail}
        onChangeHandler={setNewEmail}
      />

      <PasswordField
        label="Contraseña actual"
        password={password}
        onChangeHandler={setPassword}
      />
    </FormModal>
  );
}
