type PulseIndicatorProps = {
  color: 'blue' | 'yellow' | 'orange' | 'green' | 'red';
};

export function PulseIndicator({color}: PulseIndicatorProps) {
  const colorClasses = {
    blue: 'bg-blue-400',
    yellow: 'bg-yellow-400',
    orange: 'bg-orange-400',
    green: 'bg-green-400',
    red: 'bg-red-400',
  };

  return (
    <span className="relative flex h-2 w-2">
      <span
        className={`animate-ping absolute inline-flex h-full w-full rounded-full ${colorClasses[color]} opacity-75`}
      ></span>
      <span
        className={`relative inline-flex rounded-full h-2 w-2 ${colorClasses[color]}`}
      ></span>
    </span>
  );
}
