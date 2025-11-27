export type WhoAmIResponse = {
  id: number;
  admin: boolean;
  username: string;
  email: string;
  balance: number;
  created_at: string;
  updated_at: string;
};

export type Team = {
  id: number;
  name: string;
  image_url: string;
};

export type Player = {
  id: number;
  name: string;
  team_id: number;
};

export type Match = {
  id: number;
  team_a_id: number;
  team_b_id: number;
  match_date: string;
  streaming_platform?: 'KICK';
  streaming_username?: string;
};

export type MatchResult = {
  id: number;
  match_id: number;
  winning_team_id: number;
  team_a_score: number;
  team_b_score: number;
};

export type PlayerMatchStats = {
  id: number;
  match_id: number;
  player_id: number;
  kills: number;
  headshot_kills: number;
  assists: number;
  deaths: number;
};

export type MatchWithDetails = Match & {
  team_a?: Team;
  team_b?: Team;
  result?: MatchResult;
  team_a_players?: Player[];
  team_b_players?: Player[];
  player_stats?: PlayerMatchStats[];
};
