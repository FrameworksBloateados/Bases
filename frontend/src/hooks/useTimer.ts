import {useState, useEffect} from 'react';

type UseTimerProps = {
  startTime?: string;
  targetTime?: string;
  mode: 'countdown' | 'elapsed';
};

type TimerState = {
  displayTime: string;
  isClose?: boolean;
};

export function useTimer({
  startTime,
  targetTime,
  mode,
}: UseTimerProps): TimerState {
  const [displayTime, setDisplayTime] = useState('00:00:00');
  const [isClose, setIsClose] = useState(false);

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      let diffMs: number;

      if (mode === 'countdown' && targetTime) {
        const target = new Date(targetTime);
        diffMs = target.getTime() - now.getTime();

        if (diffMs <= 0) {
          setDisplayTime('00:00:00');
          return;
        }

        // Consider "close" if less than 1 hour remains
        setIsClose(diffMs < 60 * 60 * 1000);
      } else if (mode === 'elapsed' && startTime) {
        const start = new Date(startTime);
        diffMs = now.getTime() - start.getTime();
      } else {
        return;
      }

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      const hoursStr = hours.toString().padStart(2, '0');
      const minutesStr = minutes.toString().padStart(2, '0');
      const secondsStr = seconds.toString().padStart(2, '0');

      setDisplayTime(`${hoursStr}:${minutesStr}:${secondsStr}`);
    };

    // Calculate immediately
    calculateTime();

    // Update every second
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [startTime, targetTime, mode]);

  return {displayTime, isClose};
}
