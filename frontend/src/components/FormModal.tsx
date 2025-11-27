import type {ReactNode} from 'react';
import {ModalOverlay, ModalHeader} from './ModalOverlay';
import {Button} from './Button';
import {FormError} from './FormError';

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
  cancelText?: string;
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
  cancelText = 'Cancelar',
}: FormModalProps) {
  return (
    <ModalOverlay isOpen={isOpen} isClosing={isClosing} onClose={onClose}>
      <ModalHeader title={title} subtitle={subtitle} onClose={onClose} />

      <div className="space-y-4">
        {children}
        <FormError message={error || null} />
      </div>

      <div className="mt-6 flex gap-3 justify-end">
        <Button variant="ghost" onClick={onClose} disabled={isLoading}>
          {cancelText}
        </Button>
        <Button variant="primary" onClick={onSubmit} isLoading={isLoading}>
          {submitText}
        </Button>
      </div>
    </ModalOverlay>
  );
}
