import type {Context} from 'hono';
import {sql} from '../utils/database/connect';
import {
  badRequest,
  internalServerError,
  forbidden,
} from '../utils/replies';
import csvToJson from 'convert-csv-to-json';

export const uploadMatchResultsHandler = async (c: Context) => {
  if (!c.user.admin)
    return forbidden(c);

  try {
    const matchId = validateMatchId(c.req.param('id'));

    const { resultsFile, statsFile } = await parseAndValidateFiles(c.req);

    const resultsCsv = await resultsFile.text();
    const statsCsv = await statsFile.text();

    const resultsData = parseResultsCsv(resultsCsv);
    const statsData = parseStatsCsv(statsCsv);

    const { winningTeamId, teamAScore, teamBScore } = validateResultsData(resultsData);

    // Transacción
    await sql.begin(async tx => {
      await insertResultsAndStats(tx, matchId, winningTeamId, teamAScore, teamBScore, statsData);
      await calculateAndDistributePayouts(tx, matchId, winningTeamId);
    });

    return c.json({
      message: 'Resultados cargados exitosamente',
      success: true,
    });

  } catch (err: any) {
    console.error('Error al cargar resultados:', err);

    if (err.message.includes('no encontrado') ||
        err.message.includes('no se puede cargar') ||
        err.message.includes('ya tiene resultados') ||
        err.message.includes('no pertenece')) {
      return badRequest(c, err.message);
    }

    return internalServerError(c);
  }
};

function validateMatchId(id: string): number {
  const matchId = Number(id);
  if (!matchId || isNaN(matchId)) {
    throw new Error('ID de partido inválido');
  }
  return matchId;
}

async function parseAndValidateFiles(req: any): Promise<{ resultsFile: File; statsFile: File }> {
  const body = await req.parseBody();
  const resultsFile = body['results'] as File;
  const statsFile = body['stats'] as File;

  if (!resultsFile || !statsFile) {
    throw new Error('Se requieren los archivos results.csv y stats.csv');
  }

  return { resultsFile, statsFile };
}

function parseResultsCsv(csv: string): any[] {
  const data = csvToJson.csvStringToJson(csv);
  if (data.length === 0) {
    throw new Error('El archivo results.csv está vacío o mal formateado');
  }
  return data;
}

function parseStatsCsv(csv: string): any[] {
  return csvToJson.csvStringToJson(csv);
}

function validateResultsData(data: any[]): { winningTeamId: number; teamAScore: number; teamBScore: number } {
  const resultRow = data[0];
  const winningTeamId = Number(resultRow.winning_team_id);
  const teamAScore = Number(resultRow.team_a_score);
  const teamBScore = Number(resultRow.team_b_score);

  if (!winningTeamId || isNaN(winningTeamId) || teamAScore === undefined || isNaN(teamAScore) || teamBScore === undefined || isNaN(teamBScore)) {
    throw new Error('Datos inválidos en results.csv');
  }

  return { winningTeamId, teamAScore, teamBScore };
}

async function insertResultsAndStats(tx: any, matchId: number, winningTeamId: number, teamAScore: number, teamBScore: number, statsData: any[]): Promise<void> {
  const matchData = await tx`
    SELECT m.team_a_id, m.team_b_id, m.match_date, mr.id as result_id
    FROM matches m
    LEFT JOIN matches_results mr ON mr.match_id = m.id
    WHERE m.id = ${matchId}
  `;

  if (!matchData || matchData.length === 0) {
    throw new Error('Partido no encontrado');
  }

  const match = matchData[0];
  const matchDate = new Date(match.match_date);
  const now = new Date();

  if (matchDate > now) {
    throw new Error('No se puede cargar resultados de partidos que no han finalizado');
  }

  if (match.result_id) {
    throw new Error('El partido ya tiene resultados cargados');
  }

  if (match.team_a_id !== winningTeamId && match.team_b_id !== winningTeamId) {
    throw new Error('El equipo ganador no pertenece al partido');
  }

  await tx`
    INSERT INTO matches_results (match_id, winning_team_id, team_a_score, team_b_score)
    VALUES (${matchId}, ${winningTeamId}, ${teamAScore}, ${teamBScore})
  `;

  for (const stat of statsData) {
    const playerId = Number(stat.player_id);
    const kills = Number(stat.kills) || 0;
    const headshotKills = Number(stat.headshot_kills) || 0;
    const assists = Number(stat.assists) || 0;
    const deaths = Number(stat.deaths) || 0;

    if (!playerId || isNaN(playerId)) continue;

    await tx`
      INSERT INTO player_match_stats (match_id, player_id, kills, headshot_kills, assists, deaths)
      VALUES (${matchId}, ${playerId}, ${kills}, ${headshotKills}, ${assists}, ${deaths})
    `;
  }
}

async function calculateAndDistributePayouts(tx: any, matchId: number, winningTeamId: number): Promise<void> {
  const betsSummary = await tx`
    SELECT
      SUM(amount) as total_all,
      SUM(CASE WHEN team_id = ${winningTeamId} THEN amount ELSE 0 END) as total_winner
    FROM bets WHERE match_id = ${matchId}
  `;

  const totalBets = Number(betsSummary[0].total_all) || 0;
  const totalWinnerBets = Number(betsSummary[0].total_winner) || 0;

  if (totalBets === 0 || totalWinnerBets === 0) {
    return;
  }

  const totalLoserBets = totalBets - totalWinnerBets;

  const winnerBets = await tx`
    SELECT user_id, amount FROM bets WHERE match_id = ${matchId} AND team_id = ${winningTeamId}
  `;

  for (const bet of winnerBets) {
    const userId = bet.user_id;
    const amount = Number(bet.amount);
    const payout = (amount / totalWinnerBets) * totalLoserBets + amount;

    await tx`
      UPDATE users
      SET balance = balance + ${payout}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${userId}
    `;
  }
}