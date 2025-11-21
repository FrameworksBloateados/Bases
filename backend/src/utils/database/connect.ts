import {SQL} from 'bun';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('Missing DATABASE_URL environment variable');
}

export const sql = new SQL(connectionString);
