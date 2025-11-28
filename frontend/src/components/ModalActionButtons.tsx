import {Button} from './Button';
import type {ButtonHTMLAttributes} from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'gradient';

type ModalActionButtonsProps = {
  onSubmit: () => void;
  onCancel?: () => void;
  submitText?: string;
  cancelText?: string;
  isLoading?: boolean;
  isDisabled?: boolean;
  submitVariant?: ButtonVariant;
  cancelVariant?: ButtonVariant;
  showCancel?: boolean;
  submitClassName?: string;
  className?: string;
};

/**
 * Reusable action buttons for modals
 * Provides consistent submit/cancel button layout
 */
export function ModalActionButtons({
  onSubmit,
  onCancel,
  submitText = 'Confirmar',
  cancelText = 'Cancelar',
  isLoading = false,
  isDisabled = false,
  submitVariant = 'gradient',
  cancelVariant = 'ghost',
  showCancel = true,
  submitClassName = '',
  className = '',
}: ModalActionButtonsProps) {
  return (
    <div
      className={`flex gap-3 ${
        showCancel ? 'justify-end' : 'justify-end'
      } ${className}`}
    >
      {showCancel && onCancel && (
        <Button variant={cancelVariant} onClick={onCancel} disabled={isLoading}>
          {cancelText}
        </Button>
      )}
      <Button
        variant={submitVariant}
        onClick={onSubmit}
        isLoading={isLoading}
        disabled={isDisabled}
        className={submitClassName}
      >
        {submitText}
      </Button>
    </div>
  );
}
