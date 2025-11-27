import './index.css';
import {useState} from 'react';
import {useAuth} from './context/AuthContext';
import {useMatchData, useUserData} from './hooks/useMatchData';
import {
  enrichMatches,
  filterFinishedMatchesWithResults,
  filterFinishedMatchesWithoutResults,
  filterUpcomingMatches,
} from './utils/matchUtils';
import {Header} from './components/Header';
import {MatchCard} from './components/MatchCard';
import {MatchDetailModal} from './components/MatchDetailModal';
import {BetModal} from './components/BetModal';
import {ErrorDisplay} from './components/ErrorDisplay';
import {Toast} from './components/Toast';
import type {MatchWithDetails} from './types/match.types';

type ToastMessage = {
  message: string;
  type: 'success' | 'error' | 'info';
};

export function App() {
  const {authenticatedFetch, isAuthenticated, isLoading, logout} = useAuth();
  const {userInfo, error: userError, refetchUserInfo} = useUserData();
  const {
    matches,
    teams,
    players,
    results,
    playerStats,
    error: matchError,
  } = useMatchData();

  const [selectedMatch, setSelectedMatch] = useState<MatchWithDetails | null>(
    null
  );
  const [selectedBetMatch, setSelectedBetMatch] = useState<{
    matchId: number;
    teamId: number;
    teamName: string;
  } | null>(null);
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);

  const error = userError || matchError;

  const enrichedMatches = enrichMatches({
    matches,
    teams,
    players,
    results,
    playerStats,
  });
  const finishedWithResults = filterFinishedMatchesWithResults(enrichedMatches);
  const finishedWithoutResults =
    filterFinishedMatchesWithoutResults(enrichedMatches);
  const upcomingMatches = filterUpcomingMatches(enrichedMatches);

  const handleBet = async (matchId: number, teamId: number, amount: number) => {
    try {
      const response = await authenticatedFetch(
        'http://127-0-0-1.sslip.io/api/v1/bet',
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            match_id: matchId,
            team_id: teamId,
            amount: amount,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({error: 'Error desconocido'}));
        // Solo lanzar el mensaje de error, sin el prefijo
        throw new Error(errorData.error || 'Error al realizar la apuesta');
      }

      await refetchUserInfo();
    } catch (error) {
      // Re-lanzar el error para que el BetModal lo capture y muestre
      throw error;
    }
  };

  const openBetModal = (matchId: number, teamId: number, teamName: string) => {
    setSelectedBetMatch({matchId, teamId, teamName});
  };

  const closeBetModal = () => {
    setSelectedBetMatch(null);
  };

  const handleBetSuccess = () => {
    setToastMessage({
      message: '¡Apuesta realizada exitosamente! 🎉',
      type: 'success',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-700">
        <p className="text-slate-200 text-lg font-semibold">
          Loading session...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-700">
        <p className="text-slate-200 text-lg font-semibold">
          You are not authenticated. Please sign in.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-700 py-8 px-4">
      <Header userInfo={userInfo} onLogout={logout} />

      {error && <ErrorDisplay message={error} />}

      <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 relative z-50">
        <MatchesColumn
          title="Finalizados"
          statusColor="green"
          matches={finishedWithResults}
          emptyMessage="No hay partidos finalizados con resultados"
          onMatchClick={setSelectedMatch}
          onBetClick={openBetModal}
        />

        <MatchesColumn
          title="En curso"
          statusColor="yellow"
          matches={finishedWithoutResults}
          emptyMessage="No hay partidos finalizados sin resultados"
          onMatchClick={setSelectedMatch}
          onBetClick={openBetModal}
        />

        <MatchesColumn
          title="Próximos partidos"
          statusColor="blue"
          matches={upcomingMatches}
          emptyMessage="No hay partidos próximos disponibles"
          showBetting
          onMatchClick={setSelectedMatch}
          onBetClick={openBetModal}
        />
      </div>

      {selectedMatch && (
        <MatchDetailModal
          match={selectedMatch}
          teams={teams}
          onClose={() => setSelectedMatch(null)}
          onBetClick={openBetModal}
        />
      )}

      {selectedBetMatch && (
        <BetModal
          matchId={selectedBetMatch.matchId}
          teamId={selectedBetMatch.teamId}
          teamName={selectedBetMatch.teamName}
          userBalance={userInfo?.balance || 0}
          onClose={closeBetModal}
          onConfirm={handleBet}
          onSuccess={handleBetSuccess}
        />
      )}

      {toastMessage && (
        <Toast
          message={toastMessage.message}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
}

type MatchesColumnProps = {
  title: string;
  statusColor: 'green' | 'yellow' | 'blue';
  matches: MatchWithDetails[];
  emptyMessage: string;
  showBetting?: boolean;
  onMatchClick: (match: MatchWithDetails) => void;
  onBetClick: (matchId: number, teamId: number, teamName: string) => void;
};

function MatchesColumn({
  title,
  statusColor,
  matches,
  emptyMessage,
  showBetting = false,
  onMatchClick,
  onBetClick,
}: MatchesColumnProps) {
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
            <MatchCard
              key={match.id}
              match={match}
              showBetting={showBetting}
              onMatchClick={onMatchClick}
              onBetClick={onBetClick}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default App;
