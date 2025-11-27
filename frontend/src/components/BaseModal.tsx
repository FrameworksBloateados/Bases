import type {ReactNode} from 'react';
import {ModalOverlay, ModalHeader} from './ModalOverlay';

type BaseModalProps = {
  isOpen: boolean;
  isClosing: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function BaseModal({
  isOpen,
  isClosing,
  onClose,
  title,
  subtitle,
  children,
}: BaseModalProps) {
  return (
    <ModalOverlay isOpen={isOpen} isClosing={isClosing} onClose={onClose}>
      <ModalHeader title={title} subtitle={subtitle} onClose={onClose} />
      {children}
    </ModalOverlay>
  );
}
