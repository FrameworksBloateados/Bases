import {useState, useEffect} from 'react';

type CountdownTimerProps = {
  targetTime: string;
};

export function CountdownTimer({targetTime}: CountdownTimerProps) {
  const [countdown, setCountdown] = useState('');
  const [isClose, setIsClose] = useState(false);

  useEffect(() => {
    const calculateCountdown = () => {
      const target = new Date(targetTime);
      const now = new Date();
      const diffMs = target.getTime() - now.getTime();

      if (diffMs <= 0) {
        setCountdown('00:00:00');
        return;
      }

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      const hoursStr = hours.toString().padStart(2, '0');
      const minutesStr = minutes.toString().padStart(2, '0');
      const secondsStr = seconds.toString().padStart(2, '0');

      setCountdown(`${hoursStr}:${minutesStr}:${secondsStr}`);

      // Considerar "cerca" si falta menos de 1 hora
      setIsClose(diffMs < 60 * 60 * 1000);
    };

    // Calcular inmediatamente
    calculateCountdown();

    // Actualizar cada segundo
    const interval = setInterval(calculateCountdown, 1000);

    return () => clearInterval(interval);
  }, [targetTime]);

  return (
    <div
      className={`flex items-center gap-1.5 font-mono text-sm ${
        isClose ? 'text-orange-400' : 'text-blue-400'
      }`}
    >
      <span className="relative flex h-2 w-2">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
            isClose ? 'bg-orange-400' : 'bg-blue-400'
          } opacity-75`}
        ></span>
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            isClose ? 'bg-orange-400' : 'bg-blue-400'
          }`}
        ></span>
      </span>
      <span>{countdown}</span>
    </div>
  );
}
