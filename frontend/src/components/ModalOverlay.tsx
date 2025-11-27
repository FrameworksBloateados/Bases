import type {ReactNode} from 'react';
import {CloseIcon} from './CloseIcon';

type ModalOverlayProps = {
  isOpen: boolean;
  isClosing: boolean;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
};

export function ModalOverlay({
  isOpen,
  isClosing,
  onClose,
  children,
  maxWidth = 'md',
}: ModalOverlayProps) {
  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div
      className={`fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-200 ${
        isClosing ? 'animate-fade-out' : 'animate-fade-in'
      }`}
      onClick={onClose}
    >
      <div
        className={`bg-slate-800 border border-white/20 rounded-2xl p-8 ${
          maxWidthClasses[maxWidth]
        } w-full ${isClosing ? 'animate-scale-out' : 'animate-scale-in'}`}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

type ModalHeaderProps = {
  title: string;
  subtitle?: string;
  onClose: () => void;
};

export function ModalHeader({title, subtitle, onClose}: ModalHeaderProps) {
  return (
    <div className="flex justify-between items-start mb-6">
      <div>
        <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
        {subtitle && <p className="text-slate-400 text-sm">{subtitle}</p>}
      </div>
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-white transition-colors"
      >
        <CloseIcon />
      </button>
    </div>
  );
}
