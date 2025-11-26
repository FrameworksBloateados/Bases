import {sql} from '../utils/database/connect';

export class User {
  id: number;
  admin: boolean;
  email: string;
  password_hash: string;
  balance: number;
  created_at: string; // ISO string

  constructor(data: {
    id: number;
    admin: boolean;
    email: string;
    password_hash: string;
    balance: number;
    created_at: string;
  }) {
    this.id = data.id;
    this.admin = data.admin;
    this.email = data.email;
    this.password_hash = data.password_hash;
    this.balance = data.balance;
    this.created_at = data.created_at;
  }

  async updatePassword(password: string): Promise<void> {
    const passwordHash = await Bun.password.hash(password);
    await sql`
      UPDATE users SET password_hash = ${passwordHash} WHERE id = ${this.id};
    `;
    this.password_hash = passwordHash;
  }
}

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const result = await sql<any[]>`
    SELECT * FROM users WHERE email = ${email} LIMIT 1;
  `;
  return result.length > 0 && result[0] ? new User(result[0]) : null;
};

export const addUser = async ({
  email,
  passwordHash,
}: {
  email: string;
  passwordHash: string;
}): Promise<User> => {
  const result = await sql<any[]>`
    INSERT INTO users (email, password_hash, created_at)
    VALUES (${email}, ${passwordHash}, CURRENT_TIMESTAMP)
    RETURNING id, admin, email, password_hash, balance, created_at;
  `;
  if (!result.length || !result[0]) throw new Error('Failed to insert user');
  return new User(result[0]);
};

export const findUserById = async (id: number): Promise<User | null> => {
  const result = await sql<any[]>`
    SELECT id, admin, email, password_hash, balance, created_at FROM users WHERE id = ${id} LIMIT 1;
  `;
  return result.length > 0 && result[0] ? new User(result[0]) : null;
};
