import {useState} from 'react';
import {FormModal} from './FormModal';
import {PasswordField} from './PasswordField';
import {
  validatePassword,
  validatePasswordMatch,
  validateRequired,
} from '../utils/validation';
import {useFormError} from '../hooks/useFormError';

type ChangePasswordModalProps = {
  isOpen: boolean;
  isClosing: boolean;
  onClose: () => void;
  onSubmit: (actualPassword: string, newPassword: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
};

export function ChangePasswordModal({
  isOpen,
  isClosing,
  onClose,
  onSubmit,
  isLoading,
  error,
}: ChangePasswordModalProps) {
  const [actualPassword, setActualPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const {
    displayError,
    setError: setLocalError,
    clearError,
  } = useFormError(error);

  const handleSubmit = async () => {
    clearError();

    const actualPasswordError = validateRequired(actualPassword);
    if (actualPasswordError) {
      setLocalError(actualPasswordError);
      return;
    }

    const newPasswordError = validatePassword(newPassword);
    if (newPasswordError) {
      setLocalError(newPasswordError);
      return;
    }

    const confirmPasswordError = validateRequired(confirmPassword);
    if (confirmPasswordError) {
      setLocalError(confirmPasswordError);
      return;
    }

    const matchError = validatePasswordMatch(newPassword, confirmPassword);
    if (matchError) {
      setLocalError(matchError);
      return;
    }

    await onSubmit(actualPassword, newPassword);
  };

  const handleClose = () => {
    setActualPassword('');
    setNewPassword('');
    setConfirmPassword('');
    clearError();
    onClose();
  };

  return (
    <FormModal
      isOpen={isOpen}
      isClosing={isClosing}
      onClose={handleClose}
      onSubmit={handleSubmit}
      title="Cambiar contraseña"
      subtitle="Ingresá tu contraseña actual y la nueva"
      isLoading={isLoading}
      error={displayError}
      submitText="Cambiar contraseña"
    >
      <PasswordField
        label="Contraseña actual"
        password={actualPassword}
        onChangeHandler={setActualPassword}
      />

      <PasswordField
        label="Nueva contraseña"
        password={newPassword}
        onChangeHandler={setNewPassword}
      />

      <PasswordField
        label="Confirmar nueva contraseña"
        password={confirmPassword}
        onChangeHandler={setConfirmPassword}
      />
    </FormModal>
  );
}
