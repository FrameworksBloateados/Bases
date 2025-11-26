import {useState} from 'react';
import type {MatchWithDetails, Team, Player, PlayerMatchStats} from '../types/match.types';

type MatchDetailModalProps = {
  match: MatchWithDetails;
  teams: Team[];
  onClose: () => void;
};

export function MatchDetailModal({match, teams, onClose}: MatchDetailModalProps) {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const winningTeamName = teams.find(t => t.id === match.result?.winning_team_id)?.name || 'Unknown';

  return (
    <div 
      className={`fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-200 ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}
      onClick={handleClose}
    >
      <div 
        className={`bg-slate-800 border border-white/20 rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto ${isClosing ? 'animate-scale-out' : 'animate-scale-in'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <ModalHeader 
          matchDate={match.match_date}
          onClose={handleClose}
        />

        {match.result && (
          <MatchScore match={match} />
        )}

        <div className="grid grid-cols-2 gap-8">
          <TeamStats
            team={match.team_a}
            players={match.team_a_players || []}
            playerStats={match.player_stats || []}
          />
          <TeamStats
            team={match.team_b}
            players={match.team_b_players || []}
            playerStats={match.player_stats || []}
          />
        </div>

        {match.result && (
          <WinnerBanner winningTeamName={winningTeamName} />
        )}
      </div>
    </div>
  );
}

type ModalHeaderProps = {
  matchDate: string;
  onClose: () => void;
};

function ModalHeader({matchDate, onClose}: ModalHeaderProps) {
  return (
    <div className="flex justify-between items-start mb-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Detalles del Partido</h2>
        <p className="text-slate-400 text-sm">
          {new Date(matchDate).toLocaleString()}
        </p>
      </div>
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-white text-2xl"
      >
        ×
      </button>
    </div>
  );
}

function MatchScore({match}: {match: MatchWithDetails}) {
  if (!match.result) return null;

  return (
    <div className="mb-6 p-4 bg-slate-900/50 rounded-xl border border-white/10">
      <div className="flex items-center justify-center gap-8">
        <TeamScoreDisplay
          team={match.team_a}
          score={match.result.team_a_score}
          isWinner={match.result.winning_team_id === match.team_a_id}
        />
        <div className="text-slate-400 text-2xl font-bold">-</div>
        <TeamScoreDisplay
          team={match.team_b}
          score={match.result.team_b_score}
          isWinner={match.result.winning_team_id === match.team_b_id}
          reverse
        />
      </div>
    </div>
  );
}

type TeamScoreDisplayProps = {
  team?: Team;
  score: number;
  isWinner: boolean;
  reverse?: boolean;
};

function TeamScoreDisplay({team, score, isWinner, reverse = false}: TeamScoreDisplayProps) {
  const content = (
    <>
      {!reverse && team?.image_url && (
        <img src={team.image_url} alt={team.name} className="w-12 h-12 object-contain" />
      )}
      <div className="text-center">
        <p className="text-white font-semibold">{team?.name || 'Unknown'}</p>
        <p className={`text-3xl font-bold ${isWinner ? 'text-green-400' : 'text-slate-400'}`}>
          {score}
        </p>
      </div>
      {reverse && team?.image_url && (
        <img src={team.image_url} alt={team.name} className="w-12 h-12 object-contain" />
      )}
    </>
  );

  return <div className="flex items-center gap-3">{content}</div>;
}

type TeamStatsProps = {
  team?: Team;
  players: Player[];
  playerStats: PlayerMatchStats[];
};

function TeamStats({team, players, playerStats}: TeamStatsProps) {
  return (
    <div className="bg-slate-900/50 rounded-xl p-6 border border-white/10">
      <h3 className="text-xl font-bold text-white mb-4 text-center flex items-center justify-center gap-2">
        {team?.image_url && (
          <img src={team.image_url} alt={team.name} className="w-8 h-8 object-contain" />
        )}
        {team?.name || 'Unknown'}
      </h3>
      <div className="space-y-2">
        {players.length > 0 ? (
          players.map(player => (
            <PlayerCard
              key={player.id}
              player={player}
              stats={playerStats.find(s => s.player_id === player.id)}
            />
          ))
        ) : (
          <p className="text-slate-500 text-sm">No hay jugadores registrados</p>
        )}
      </div>
    </div>
  );
}

type PlayerCardProps = {
  player: Player;
  stats?: PlayerMatchStats;
};

function PlayerCard({player, stats}: PlayerCardProps) {
  return (
    <div className="text-white bg-slate-800/50 px-3 py-2 rounded">
      <div className="font-semibold">{player.name}</div>
      {stats && (
        <div className="text-xs text-slate-400 mt-1 grid grid-cols-4 gap-2">
          <span title="Kills">K: {stats.kills}</span>
          <span title="Deaths">D: {stats.deaths}</span>
          <span title="Assists">A: {stats.assists}</span>
          <span title="Headshot Kills">HS: {stats.headshot_kills}</span>
        </div>
      )}
    </div>
  );
}

function WinnerBanner({winningTeamName}: {winningTeamName: string}) {
  return (
    <div className="mt-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-center">
      <p className="text-green-400 font-bold text-lg">
        🏆 {winningTeamName}
      </p>
    </div>
  );
}
