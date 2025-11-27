import type {Context} from 'hono';
import {sql} from '../utils/database/connect';
import {
  badRequest,
  internalServerError,
  forbidden,
} from '../utils/replies';

export const placeBetHandler = async (c: Context) => {
  try {
    const body = await c.req.json();
    const matchId = Number(body?.match_id);
    const teamId = Number(body?.team_id);
    const amount = Number(body?.amount);

    if (!matchId || !teamId || !amount || isNaN(matchId) || isNaN(teamId) || isNaN(amount)) {
      return badRequest(c, 'match_id, team_id y amount son requeridos y deben ser números válidos');
    }

    if (amount <= 0) {
      return badRequest(c, 'El monto debe ser mayor a 0');
    }

    if (amount >= 100000000) {
      return badRequest(c, 'El monto máximo permitido es $99,999,999.99');
    }

    if (!Number.isInteger(amount * 100)) {
      return badRequest(c, 'El monto puede tener máximo 2 decimales');
    }

    const userId = c.user.id;

    await sql.begin(async tx => {
      const matchResult = await tx`
        SELECT team_a_id, team_b_id, match_date 
        FROM matches 
        WHERE id = ${matchId}
      `;

      if (!matchResult || matchResult.length === 0) {
        throw new Error('Partido no encontrado');
      }

      const match = matchResult[0];

      if (match.team_a_id !== teamId && match.team_b_id !== teamId) {
        throw new Error('El equipo no pertenece a este partido');
      }

      const matchDate = new Date(match.match_date);
      const now = new Date();
      if (matchDate <= now) {
        throw new Error('No se puede apostar en partidos que ya comenzaron o finalizaron');
      }

      const resultCheck = await tx`
        SELECT id FROM matches_results WHERE match_id = ${matchId}
      `;

      if (resultCheck && resultCheck.length > 0) {
        throw new Error('No se puede apostar en partidos que ya tienen resultado');
      }

      const userResult = await tx`
        SELECT balance FROM users WHERE id = ${userId} FOR UPDATE
      `;

      if (!userResult || userResult.length === 0) {
        throw new Error('Usuario no encontrado');
      }

      const currentBalance = Number(userResult[0].balance);

      if (currentBalance < amount) {
        throw new Error(`Saldo insuficiente. Balance actual: $${currentBalance}`);
      }

      const newBalance = currentBalance - amount;
      await tx`
        UPDATE users 
        SET balance = ${newBalance}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ${userId}
      `;

      await tx`
        INSERT INTO bets (user_id, match_id, team_id, amount, placed_at)
        VALUES (${userId}, ${matchId}, ${teamId}, ${amount}, CURRENT_TIMESTAMP)
      `;
    });

    return c.json({
      message: 'Apuesta realizada exitosamente',
      success: true,
    });

  } catch (err: any) {
    console.error('Error al realizar la apuesta:', err);
    
    if (err.message.includes('no encontrado') || 
        err.message.includes('no pertenece') || 
        err.message.includes('no se puede apostar') ||
        err.message.includes('Saldo insuficiente')) {
      return badRequest(c, err.message);
    }

    return internalServerError(c);
  }
};
