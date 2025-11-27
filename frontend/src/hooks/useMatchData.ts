import {useEffect, useState} from 'react';
import {useAuth} from '../context/AuthContext';
import {API_ENDPOINTS} from '../utils/constants';
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

  const fetchData = async () => {
    try {
      setError(null);

      const [matchesRes, teamsRes, playersRes, resultsRes, statsRes] =
        await Promise.all([
          authenticatedFetch(API_ENDPOINTS.MATCHES, {method: 'GET'}),
          authenticatedFetch(API_ENDPOINTS.TEAMS, {
            method: 'GET',
          }),
          authenticatedFetch(API_ENDPOINTS.PLAYERS, {method: 'GET'}),
          authenticatedFetch(API_ENDPOINTS.MATCHES_RESULTS, {method: 'GET'}),
          authenticatedFetch(API_ENDPOINTS.PLAYER_MATCH_STATS, {
            method: 'GET',
          }),
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

  useEffect(() => {
    if (!isAuthenticated || isLoading) return;
    fetchData();
  }, [authenticatedFetch, isAuthenticated, isLoading]);

  return {...data, error, refetch: fetchData};
}

export function useUserData() {
  const {authenticatedFetch, isAuthenticated, isLoading} = useAuth();
  const [userInfo, setUserInfo] = useState<WhoAmIResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchUserInfo = async () => {
    try {
      setError(null);
      const userResponse = await authenticatedFetch(API_ENDPOINTS.WHO_AM_I, {
        method: 'GET',
      });
      if (!userResponse.ok)
        throw new Error(`User fetch failed: ${userResponse.status}`);
      const userData: WhoAmIResponse = await userResponse.json();
      setUserInfo(userData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load user data.'
      );
    }
  };

  useEffect(() => {
    if (!isAuthenticated || isLoading) return;
    fetchUserInfo();
  }, [authenticatedFetch, isAuthenticated, isLoading]);

  return {userInfo, error, refetchUserInfo: fetchUserInfo};
}
