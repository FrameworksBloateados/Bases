import {useState} from 'react';
import {logger} from '../utils/logger';

type UseAsyncHandlerOptions = {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  modalToClose?: {close: () => void};
  clearErrorAfterMs?: number;
};

type UseAsyncHandlerReturn<T extends any[]> = {
  execute: (...args: T) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
};

/**
 * Hook for handling async operations with consistent loading/error states
 * Reduces boilerplate in async handlers
 *
 * @param handler - Async function to execute
 * @param options - Configuration options
 */
export function useAsyncHandler<T extends any[]>(
  handler: (...args: T) => Promise<void>,
  options?: UseAsyncHandlerOptions
): UseAsyncHandlerReturn<T> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async (...args: T) => {
    setIsLoading(true);
    setError(null);

    try {
      await handler(...args);

      options?.onSuccess?.();

      if (options?.modalToClose) {
        options.modalToClose.close();
        if (options.clearErrorAfterMs) {
          setTimeout(() => setError(null), options.clearErrorAfterMs);
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMsg);
      options?.onError?.(err as Error);
      logger.error('Error in async handler:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    execute,
    isLoading,
    error,
    clearError: () => setError(null),
  };
}
