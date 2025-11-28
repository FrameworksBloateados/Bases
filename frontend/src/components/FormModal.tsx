import type {ReactNode} from 'react';
import {ModalOverlay, ModalHeader} from './ModalOverlay';
import {Button} from './Button';
import {ErrorMessage} from './ErrorMessage';

type FormModalProps = {
  isOpen: boolean;
  isClosing: boolean;
  onClose: () => void;
  onSubmit: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  isLoading?: boolean;
  error?: string | null;
  submitText?: string;
};

export function FormModal({
  isOpen,
  isClosing,
  onClose,
  onSubmit,
  title,
  subtitle,
  children,
  isLoading = false,
  error,
  submitText = 'Guardar',
}: FormModalProps) {
  return (
    <ModalOverlay isOpen={isOpen} isClosing={isClosing} onClose={onClose}>
      <ModalHeader title={title} subtitle={subtitle} onClose={onClose} />

      <div className="space-y-4">
        {children}
        <ErrorMessage message={error || null} />
      </div>

      <div className="mt-6 flex gap-3 justify-end">
        <Button
          variant="primary"
          onClick={onSubmit}
          isLoading={isLoading}
          className="bg-linear-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800"
        >
          {submitText}
        </Button>
      </div>
    </ModalOverlay>
  );
}
