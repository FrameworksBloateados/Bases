import {useEffect, useState} from 'react';
import {useAuth} from '../context/AuthContext';
import type {
  WhoAmIResponse,
  Match,
  Team,
  Player,
  MatchResult,
  PlayerMatchStats,
} from '../types/match.types';

type MatchData = {
  matches: Match[];
  teams: Team[];
  players: Player[];
  results: MatchResult[];
  playerStats: PlayerMatchStats[];
};

export function useMatchData() {
  const {authenticatedFetch, isAuthenticated, isLoading} = useAuth();
  const [data, setData] = useState<MatchData>({
    matches: [],
    teams: [],
    players: [],
    results: [],
    playerStats: [],
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || isLoading) return;

    const fetchData = async () => {
      try {
        setError(null);
        
        const [matchesRes, teamsRes, playersRes, resultsRes, statsRes] = await Promise.all([
          authenticatedFetch('http://ffb.dev.internal/api/v1/matches/json', {method: 'GET'}),
          authenticatedFetch('http://ffb.dev.internal/api/v1/teams/json', {method: 'GET'}),
          authenticatedFetch('http://ffb.dev.internal/api/v1/players/json', {method: 'GET'}),
          authenticatedFetch('http://ffb.dev.internal/api/v1/matches_results/json', {method: 'GET'}),
          authenticatedFetch('http://ffb.dev.internal/api/v1/player_match_stats/json', {method: 'GET'}),
        ]);

        const matchesData: Match[] = await matchesRes.json();
        const teamsData: Team[] = await teamsRes.json();
        const playersData: Player[] = await playersRes.json();
        const resultsData: MatchResult[] = await resultsRes.json();
        const statsData: PlayerMatchStats[] = await statsRes.json();

        setData({
          matches: matchesData,
          teams: teamsData,
          players: playersData,
          results: resultsData,
          playerStats: statsData,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load match data.');
      }
    };

    fetchData();
  }, [authenticatedFetch, isAuthenticated, isLoading]);

  return {...data, error};
}

export function useUserData() {
  const {authenticatedFetch, isAuthenticated, isLoading} = useAuth();
  const [userInfo, setUserInfo] = useState<WhoAmIResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchUserInfo = async () => {
    try {
      setError(null);
      const userResponse = await authenticatedFetch(
        'http://ffb.dev.internal/api/v1/user/whoami',
        {method: 'GET'}
      );
      if (!userResponse.ok) throw new Error(`User fetch failed: ${userResponse.status}`);
      const userData: WhoAmIResponse = await userResponse.json();
      setUserInfo(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user data.');
    }
  };

  useEffect(() => {
    if (!isAuthenticated || isLoading) return;
    fetchUserInfo();
  }, [authenticatedFetch, isAuthenticated, isLoading]);

  return {userInfo, error, refetchUserInfo: fetchUserInfo};
}
