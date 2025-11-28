import type {MatchWithDetails} from '../types/match.types';

type MatchColumnProps = {
  title: string;
  statusColor: 'green' | 'yellow' | 'blue';
  matches: MatchWithDetails[];
  emptyMessage: string;
  showBetting?: boolean;
  onMatchClick: (match: MatchWithDetails) => void;
  onBetClick: (matchId: number, teamId: number, teamName: string) => void;
};

export function MatchColumn({
  title,
  statusColor,
  matches,
  emptyMessage,
}: MatchColumnProps) {
  const colorClasses = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    blue: 'bg-blue-500',
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span
          className={`w-3 h-3 ${colorClasses[statusColor]} rounded-full`}
        ></span>
        {title}
      </h2>
      <div className="space-y-3">
        {matches.length === 0 ? (
          <p className="text-slate-400 text-sm">{emptyMessage}</p>
        ) : (
          matches.map(match => (
            <div key={match.id}>
              {/* MatchCard component will be rendered here */}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
