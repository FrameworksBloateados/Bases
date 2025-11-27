type ConfirmModalProps = {
  isOpen: boolean;
  isClosing: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  variant?: 'danger' | 'warning' | 'info';
};

export function ConfirmModal({
  isOpen,
  isClosing,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isLoading = false,
  variant = 'danger',
}: ConfirmModalProps) {
  if (!isOpen) return null;

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
    <div
      className={`fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-200 ${
        isClosing ? 'animate-fade-out' : 'animate-fade-in'
      }`}
      onClick={onClose}
    >
      <div
        className={`bg-slate-800 border border-white/20 rounded-2xl p-8 max-w-md w-full ${
          isClosing ? 'animate-scale-out' : 'animate-scale-in'
        }`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start gap-4 mb-6">
          <div className={`shrink-0 w-12 h-12 rounded-full ${variantColors[variant].bg} flex items-center justify-center`}>
            <svg
              className={`w-6 h-6 ${variantColors[variant].text}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-slate-300 text-sm" dangerouslySetInnerHTML={{ __html: message }} />
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-bold text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg shadow-lg hover:shadow-xl transition-colors duration-300 active:scale-99 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-6 py-2 text-white bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 rounded-lg font-bold shadow-lg hover:shadow-xl transition-colors duration-300 active:scale-99 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Procesando...
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
