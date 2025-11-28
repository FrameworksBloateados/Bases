import {useState} from 'react';

type UseFormErrorReturn = {
  displayError: string | null;
  setError: (error: string) => void;
  clearError: () => void;
};

/**
 * Hook to manage form error state, combining local and external errors
 * @param externalError - Optional external error (e.g., from API)
 * @returns Object with displayError, setError, and clearError functions
 */
export function useFormError(
  externalError?: string | null
): UseFormErrorReturn {
  const [localError, setLocalError] = useState<string | null>(null);
  const displayError = localError || externalError || null;

  const clearError = () => setLocalError(null);
  const setError = (error: string) => setLocalError(error);

  return {displayError, setError, clearError};
}
