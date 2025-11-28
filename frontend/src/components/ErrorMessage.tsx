import {ErrorCircleIcon} from './Icons';

type ErrorMessageProps = {
  message: string | null;
  variant?: 'form' | 'display';
  className?: string;
};

/**
 * Unified error message component
 * Replaces both ErrorDisplay and FormError components
 */
export function ErrorMessage({
  message,
  variant = 'form',
  className = '',
}: ErrorMessageProps) {
  if (!message) return null;

  if (variant === 'display') {
    // Previously ErrorDisplay style
    return (
      <div className={`max-w-[1600px] mx-auto ${className}`}>
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg backdrop-blur-sm animate-slideDown animate-shake">
          <p className="text-sm text-red-200 font-medium">{message}</p>
        </div>
      </div>
    );
  }

  // Previously FormError style (default)
  return (
    <div
      className={`bg-red-500/10 border border-red-500/20 rounded-lg p-3 animate-slideDown animate-shake ${className}`}
    >
      <p className="text-red-400 text-sm">{message}</p>
    </div>
  );
}

/**
 * Inline error display with icon (alternative variant)
 */
export function InlineErrorMessage({
  message,
  className = '',
}: {
  message: string;
  className?: string;
}) {
  return (
    <div
      className={`p-3 bg-red-500/10 border border-red-500/30 rounded-lg ${className}`}
    >
      <div className="flex items-start gap-2">
        <ErrorCircleIcon className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
        <p className="text-red-300 text-sm">{message}</p>
      </div>
    </div>
  );
}
