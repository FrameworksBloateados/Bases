import {useEffect, useState} from 'react';

type ToastProps = {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
};

export function Toast({message, type, onClose, duration = 3000}: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeStyles = {
    success: 'bg-green-500/90 border-green-400',
    error: 'bg-red-500/90 border-red-400',
    info: 'bg-blue-500/90 border-blue-400',
  };

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
  };

  return (
    <div
      className={`fixed top-4 right-4 z-300 ${isExiting ? 'animate-fade-out' : 'animate-scale-in'}`}
    >
      <div
        className={`flex items-center gap-3 px-6 py-4 ${typeStyles[type]} border-2 text-white rounded-lg shadow-2xl backdrop-blur-lg min-w-[300px] max-w-md`}
      >
        <span className="text-2xl font-bold">{icons[type]}</span>
        <p className="flex-1 font-medium">{message}</p>
        <button
          onClick={() => {
            setIsExiting(true);
            setTimeout(onClose, 300);
          }}
          className="text-white/80 hover:text-white text-xl font-bold"
        >
          ×
        </button>
      </div>
    </div>
  );
}
