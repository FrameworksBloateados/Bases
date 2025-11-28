import {ModalOverlay, ModalHeader} from './ModalOverlay';
import {Button} from './Button';
import {WarningIcon} from './Icons';
import {ErrorMessage} from './ErrorMessage';

type ConfirmModalProps = {
  isOpen: boolean;
  isClosing: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  isLoading?: boolean;
  variant?: 'danger' | 'warning' | 'info';
  error?: string | null;
};

export function ConfirmModal({
  isOpen,
  isClosing,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  isLoading = false,
  variant = 'danger',
  error,
}: ConfirmModalProps) {
  const variantColors = {
    danger: {
      bg: 'bg-red-500/20',
      text: 'text-red-400',
    },
    warning: {
      bg: 'bg-yellow-500/20',
      text: 'text-yellow-400',
    },
    info: {
      bg: 'bg-blue-500/20',
      text: 'text-blue-400',
    },
  };

  return (
    <ModalOverlay isOpen={isOpen} isClosing={isClosing} onClose={onClose}>
      <ModalHeader title={title} onClose={onClose} />
      <div className="flex items-start gap-4 mb-6">
        <div
          className={`shrink-0 w-12 h-12 rounded-full ${variantColors[variant].bg} flex items-center justify-center`}
        >
          <WarningIcon className={`w-6 h-6 ${variantColors[variant].text}`} />
        </div>
        <div className="flex-1">
          <p
            className="text-slate-300 text-sm"
            dangerouslySetInnerHTML={{__html: message}}
          />
        </div>
      </div>
      {/* Error Display */}
      <ErrorMessage message={error || null} className="mb-6" />
      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={onConfirm}
          isLoading={isLoading}
          className="bg-linear-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800"
        >
          {confirmText}
        </Button>
      </div>
    </ModalOverlay>
  );
}
