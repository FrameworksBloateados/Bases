import type {MatchWithDetails} from '../types/match.types';
import {LiveMatchTimer} from './LiveMatchTimer';
import {CountdownTimer} from './CountdownTimer';

type MatchCardProps = {
  match: MatchWithDetails;
  showBetting?: boolean;
  onMatchClick: (match: MatchWithDetails) => void;
  onBetClick: (matchId: number, teamId: number, teamName: string) => void;
};

export function MatchCard({
  match,
  showBetting = false,
  onMatchClick,
  onBetClick,
}: MatchCardProps) {
  const isLive = !match.result && new Date(match.match_date) <= new Date();
  const isUpcoming = !match.result && new Date(match.match_date) > new Date();

  return (
    <div
      className="bg-slate-800/50 border border-white/10 rounded-lg p-4 mb-3 hover:border-white/30 transition-all cursor-pointer"
      onClick={() => onMatchClick(match)}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-slate-400">
          {new Date(match.match_date).toLocaleString()}
        </div>
        {isLive && <LiveMatchTimer startTime={match.match_date} />}
        {isUpcoming && <CountdownTimer targetTime={match.match_date} />}
      </div>

      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {match.team_a?.image_url && (
            <img
              src={match.team_a.image_url}
              alt={match.team_a.name}
              className="w-6 h-6 object-contain shrink-0"
            />
          )}
          <span className="font-semibold text-white text-sm wrap-break-word line-clamp-2">
            {match.team_a?.name || 'Unknown'}
          </span>
        </div>

        <span className="text-slate-400 px-2 shrink-0 text-xs">vs</span>

        <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
          <span className="font-semibold text-white text-sm text-right wrap-break-word line-clamp-2">
            {match.team_b?.name || 'Unknown'}
          </span>
          {match.team_b?.image_url && (
            <img
              src={match.team_b.image_url}
              alt={match.team_b.name}
              className="w-6 h-6 object-contain shrink-0"
            />
          )}
        </div>
      </div>

      {match.result && <MatchResult match={match} />}

      {showBetting && <BettingButtons match={match} onBetClick={onBetClick} />}
    </div>
  );
}

function MatchResult({match}: {match: MatchWithDetails}) {
  if (!match.result) return null;

  const winningTeamName =
    match.result.winning_team_id === match.team_a_id
      ? match.team_a?.name
      : match.team_b?.name;

  return (
    <div className="text-sm text-center mt-2">
      <div className="text-green-400 font-bold">
        {winningTeamName || 'Unknown'}
      </div>
      <div className="text-slate-300 text-xs mt-1">
        Score: {match.result.team_a_score} - {match.result.team_b_score}
      </div>
    </div>
  );
}

type BettingButtonsProps = {
  match: MatchWithDetails;
  onBetClick: (matchId: number, teamId: number, teamName: string) => void;
};

function BettingButtons({match, onBetClick}: BettingButtonsProps) {
  return (
    <div
      className="mt-3 pt-3 border-t border-white/10"
      onClick={e => e.stopPropagation()}
    >
      <div className="flex gap-2">
        <BetButton
          teamId={match.team_a_id}
          teamName={match.team_a?.name || 'Unknown'}
          teamImage={match.team_a?.image_url}
          matchId={match.id}
          onBetClick={onBetClick}
        />
        <BetButton
          teamId={match.team_b_id}
          teamName={match.team_b?.name || 'Unknown'}
          teamImage={match.team_b?.image_url}
          matchId={match.id}
          onBetClick={onBetClick}
        />
      </div>
    </div>
  );
}

type BetButtonProps = {
  teamId: number;
  teamName: string;
  teamImage?: string;
  matchId: number;
  onBetClick: (matchId: number, teamId: number, teamName: string) => void;
};

function BetButton({
  teamId,
  teamName,
  teamImage,
  matchId,
  onBetClick,
}: BetButtonProps) {
  return (
    <button
      onClick={() => onBetClick(matchId, teamId, teamName)}
      className="flex-1 px-3 py-2 bg-linear-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white text-sm rounded-lg shadow-lg hover:shadow-xl transition-colors duration-300 active:scale-99 font-semibold flex items-center justify-center gap-2 min-w-0"
    >
      {teamImage && (
        <img
          src={teamImage}
          alt={teamName}
          className="w-4 h-4 object-contain shrink-0"
        />
      )}
      <span className="truncate">{teamName}</span>
    </button>
  );
}
