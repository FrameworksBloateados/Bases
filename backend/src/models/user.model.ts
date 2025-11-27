import {sql} from '../utils/database/connect';

export class User {
  id: number;
  admin: boolean;
  username: string;
  email: string;
  password_hash: string;
  balance: number;
  created_at: string; // ISO string
  updated_at: string; // ISO string

  constructor(data: {
    id: number;
    admin: boolean;
    username: string;
    email: string;
    password_hash: string;
    balance: number;
    created_at: string;
    updated_at: string;
  }) {
    this.id = data.id;
    this.admin = data.admin;
    this.username = data.username;
    this.email = data.email;
    this.password_hash = data.password_hash;
    this.balance = data.balance;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  async updatePassword(password: string): Promise<void> {
    const passwordHash = await Bun.password.hash(password);
    await sql`
      UPDATE users SET password_hash = ${passwordHash} WHERE id = ${this.id};
    `;
    this.password_hash = passwordHash;
  }

  async updateEmail(email: string): Promise<void> {
    await sql`
      UPDATE users SET email = ${email} WHERE id = ${this.id};
    `;
    this.email = email;
  }
}

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const result = await sql<any[]>`
    SELECT * FROM users WHERE email = ${email} LIMIT 1;
  `;
  return result.length > 0 && result[0] ? new User(result[0]) : null;
};

export const findUserByUsername = async (
  username: string
): Promise<User | null> => {
  const result = await sql<any[]>`
    SELECT * FROM users WHERE username = ${username} LIMIT 1;
  `;
  return result.length > 0 && result[0] ? new User(result[0]) : null;
};

export const addUser = async ({
  username,
  email,
  passwordHash,
}: {
  username: string;
  email: string;
  passwordHash: string;
}): Promise<User> => {
  const result = await sql<any[]>`
    INSERT INTO users (username, email, password_hash)
    VALUES (${username}, ${email}, ${passwordHash})
    RETURNING *;
  `;
  if (!result.length || !result[0]) throw new Error('Failed to insert user');
  return new User(result[0]);
};

export const findUserById = async (id: number): Promise<User | null> => {
  const result = await sql<any[]>`
    SELECT * FROM users WHERE id = ${id} LIMIT 1;
  `;

  return result.length > 0 && result[0] ? new User(result[0]) : null;
};
