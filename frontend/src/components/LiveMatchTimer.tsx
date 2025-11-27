import {useTimer} from '../hooks/useTimer';
import {PulseIndicator} from './PulseIndicator';

type LiveMatchTimerProps = {
  startTime: string;
};

export function LiveMatchTimer({startTime}: LiveMatchTimerProps) {
  const {displayTime} = useTimer({
    startTime,
    mode: 'elapsed',
  });

  return (
    <div className="flex items-center gap-1.5 text-yellow-400 font-mono text-sm">
      <PulseIndicator color="yellow" />
      <span>{displayTime}</span>
    </div>
  );
}
