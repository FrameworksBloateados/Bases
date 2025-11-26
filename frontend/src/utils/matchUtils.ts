import type {
  Match,
  Team,
  Player,
  MatchResult,
  PlayerMatchStats,
  MatchWithDetails,
} from '../types/match.types';

type EnrichMatchesParams = {
  matches: Match[];
  teams: Team[];
  players: Player[];
  results: MatchResult[];
  playerStats: PlayerMatchStats[];
};

export function enrichMatches({
  matches,
  teams,
  players,
  results,
  playerStats,
}: EnrichMatchesParams): MatchWithDetails[] {
  return matches.map(match => ({
    ...match,
    team_a: teams.find(t => t.id === match.team_a_id),
    team_b: teams.find(t => t.id === match.team_b_id),
    result: results.find(r => r.match_id === match.id),
    team_a_players: players.filter(p => p.team_id === match.team_a_id),
    team_b_players: players.filter(p => p.team_id === match.team_b_id),
    player_stats: playerStats.filter(s => s.match_id === match.id),
  }));
}

export function filterFinishedMatchesWithResults(matches: MatchWithDetails[]): MatchWithDetails[] {
  const now = new Date();
  return matches.filter(m => {
    const matchDate = new Date(m.match_date);
    return matchDate <= now && m.result;
  });
}

export function filterFinishedMatchesWithoutResults(matches: MatchWithDetails[]): MatchWithDetails[] {
  const now = new Date();
  return matches.filter(m => {
    const matchDate = new Date(m.match_date);
    return matchDate <= now && !m.result;
  });
}

export function filterUpcomingMatches(matches: MatchWithDetails[]): MatchWithDetails[] {
  const now = new Date();
  return matches.filter(m => {
    const matchDate = new Date(m.match_date);
    return matchDate > now;
  });
}
