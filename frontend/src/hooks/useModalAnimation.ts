import {useState, useCallback} from 'react';

export function useModalAnimation(onCloseFinal?: () => void) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const open = useCallback(() => {
    setIsOpen(true);
    setIsClosing(false);
  }, []);

  const close = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
      onCloseFinal?.();
    }, 300);
  }, [onCloseFinal]);

  return {isOpen, isClosing, open, close};
}
