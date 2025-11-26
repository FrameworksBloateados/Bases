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

    // Validación de datos
    if (!matchId || !teamId || !amount || isNaN(matchId) || isNaN(teamId) || isNaN(amount)) {
      return badRequest(c, 'match_id, team_id y amount son requeridos y deben ser números válidos');
    }

    if (amount <= 0) {
      return badRequest(c, 'El monto debe ser mayor a 0');
    }

    // Validar que el monto no exceda el límite de la base de datos (NUMERIC(10,2))
    if (amount >= 100000000) {
      return badRequest(c, 'El monto máximo permitido es $99,999,999.99');
    }

    // Validar que tenga máximo 2 decimales
    if (!Number.isInteger(amount * 100)) {
      return badRequest(c, 'El monto puede tener máximo 2 decimales');
    }

    const userId = c.user.id;

    // Transacción para garantizar consistencia
    await sql.begin(async tx => {
      // 1. Verificar que el partido exista y obtener los equipos
      const matchResult = await tx`
        SELECT team_a_id, team_b_id, match_date 
        FROM matches 
        WHERE id = ${matchId}
      `;

      if (!matchResult || matchResult.length === 0) {
        throw new Error('Partido no encontrado');
      }

      const match = matchResult[0];

      // 2. Verificar que el equipo pertenezca al partido
      if (match.team_a_id !== teamId && match.team_b_id !== teamId) {
        throw new Error('El equipo no pertenece a este partido');
      }

      // 3. Verificar que el partido no haya comenzado
      const matchDate = new Date(match.match_date);
      const now = new Date();
      if (matchDate <= now) {
        throw new Error('No se puede apostar en partidos que ya comenzaron o finalizaron');
      }

      // 4. Verificar que el partido no tenga resultado
      const resultCheck = await tx`
        SELECT id FROM matches_results WHERE match_id = ${matchId}
      `;

      if (resultCheck && resultCheck.length > 0) {
        throw new Error('No se puede apostar en partidos que ya tienen resultado');
      }

      // 5. Obtener el balance actual del usuario con bloqueo de fila
      const userResult = await tx`
        SELECT balance FROM users WHERE id = ${userId} FOR UPDATE
      `;

      if (!userResult || userResult.length === 0) {
        throw new Error('Usuario no encontrado');
      }

      const currentBalance = Number(userResult[0].balance);

      // 6. Verificar que el usuario tenga saldo suficiente
      if (currentBalance < amount) {
        throw new Error(`Saldo insuficiente. Balance actual: $${currentBalance}`);
      }

      // 7. Descontar el balance del usuario
      const newBalance = currentBalance - amount;
      await tx`
        UPDATE users 
        SET balance = ${newBalance}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ${userId}
      `;

      // 8. Registrar la apuesta
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
    
    // Errores de negocio
    if (err.message.includes('no encontrado') || 
        err.message.includes('no pertenece') || 
        err.message.includes('no se puede apostar') ||
        err.message.includes('Saldo insuficiente')) {
      return badRequest(c, err.message);
    }

    // Error interno del servidor
    return internalServerError(c);
  }
};
