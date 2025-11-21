import {sql} from './connect';

export async function initDatabase() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      is_admin BOOLEAN DEFAULT FALSE,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      balance DECIMAL(15, 2) DEFAULT 0.00,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS teams (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS players (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      team_id INTEGER REFERENCES teams(id) ON DELETE SET NULL
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS matches (
      id SERIAL PRIMARY KEY,
      team_a_id INTEGER REFERENCES teams(id),
      team_b_id INTEGER REFERENCES teams(id),
      match_date TIMESTAMP NOT NULL
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS matches_results (
      id SERIAL PRIMARY KEY,
      match_id INTEGER REFERENCES matches(id),
      winning_team_id INTEGER REFERENCES teams(id)
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS bets (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      match_id INTEGER REFERENCES matches(id),
      team_id INTEGER REFERENCES teams(id),
      amount DECIMAL(10, 2) NOT NULL,
      placed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
}
