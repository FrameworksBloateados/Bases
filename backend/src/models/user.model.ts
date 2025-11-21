import {sql} from '../utils/database/connect';

export type User = {
  id: number;
  admin: boolean;
  email: string;
  password_hash: string;
  balance: number;
  created_at: string; // ISO string
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const result = await sql<User[]>`
    SELECT * FROM users WHERE email = ${email} LIMIT 1;
  `;
  return result.length > 0 && result[0] ? result[0] : null;
};

export const addUser = async ({
  email,
  passwordHash,
}: {
  email: string;
  passwordHash: string;
}): Promise<User> => {
  const result = await sql<User[]>`
    INSERT INTO users (email, password_hash, created_at)
    VALUES (${email}, ${passwordHash}, CURRENT_TIMESTAMP)
    RETURNING id, email, password_hash, created_at;
  `;
  if (!result.length || !result[0]) throw new Error('Failed to insert user');
  return result[0];
};

export const findUserById = async (id: number): Promise<User | null> => {
  const result = await sql<User[]>`
    SELECT id, email, password_hash, created_at FROM users WHERE id = ${id} LIMIT 1;
  `;
  return result.length > 0 && result[0] ? result[0] : null;
};
