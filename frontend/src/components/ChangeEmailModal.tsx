import { useState } from 'react';
import { EmailField } from './EmailField';
import { PasswordField } from './PasswordField';

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
    
    if (!password || !newEmail) {
      setLocalError('Todos los campos son requeridos');
      return;
    }
    if (!newEmail.includes('@')) {
      setLocalError('El email no es válido');
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

  if (!isOpen) return null;

  const displayError = localError || error;

  return (
    <div
      className={`fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-200 ${
        isClosing ? 'animate-fade-out' : 'animate-fade-in'
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-slate-800 border border-white/20 rounded-2xl p-8 max-w-md w-full ${
          isClosing ? 'animate-scale-out' : 'animate-scale-in'
        }`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Cambiar email
            </h3>
            <p className="text-slate-400 text-sm">
              Ingresa el nuevo email y tu contraseña actual
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
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

          {displayError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 animate-slideDown">
              <p className="text-red-400 text-sm">{displayError}</p>
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-3 justify-end">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-bold text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg shadow-lg hover:shadow-xl transition-colors duration-300 active:scale-99 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-6 py-2 text-white bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 rounded-lg font-bold shadow-lg hover:shadow-xl transition-colors duration-300 active:scale-99 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Cambiando...
              </span>
            ) : (
              'Cambiar email'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
