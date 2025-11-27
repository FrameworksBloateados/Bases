import {useTimer} from '../hooks/useTimer';
import {PulseIndicator} from './PulseIndicator';

type CountdownTimerProps = {
  targetTime: string;
};

export function CountdownTimer({targetTime}: CountdownTimerProps) {
  const {displayTime, isClose} = useTimer({
    targetTime,
    mode: 'countdown',
  });

  return (
    <div
      className={`flex items-center gap-1.5 font-mono text-sm ${
        isClose ? 'text-orange-400' : 'text-blue-400'
      }`}
    >
      <PulseIndicator color={isClose ? 'orange' : 'blue'} />
      <span>{displayTime}</span>
    </div>
  );
}
