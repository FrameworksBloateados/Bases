import {Hono} from 'hono';
import {sql} from './utils/database/connect';

// Blacklist certain tables from having CRUD routes generated, such as sensitive user data.
// Write them lowercase to ensure case-insensitive comparison.
const BLACKLISTED_TABLES = ['users'];

export const createAntiPareto = async (App: Hono) => {
  const tables =
    await sql`SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE'`;
  const blacklist = BLACKLISTED_TABLES.map(t => t.toLowerCase());
  for (const table of tables) {
    const tableName = table.table_name;
    if (blacklist.includes(tableName.toLowerCase())) continue;
    createGenericAPICrudForTheAntiParetoRule(App, tableName);
  }
};

const createGenericAPICrudForTheAntiParetoRule = (
  App: Hono,
  APIRoute: string
) => {
  App.get(`/${APIRoute}`, async c => {
    const result = await sql`SELECT * FROM ${sql(APIRoute)}`; // Safe from SQL injection, see https://bun.com/docs/runtime/sql.
    return c.json(result);
  });

  App.post(`/${APIRoute}`, async c => {
    try {
      const body = await c.req.json();
      await sql`INSERT INTO ${sql(APIRoute)} ${sql(body)}`;
      return c.json({message: `POST request to ${APIRoute}`});
    } catch (error) {
      return c.json({message: `Invalid request body for POST ${APIRoute}`}, 400);
    }
  });

  App.put(`/${APIRoute}/:id`, async c => {
    try {
      const {id} = c.req.param();
      const body = await c.req.json();
      await sql`UPDATE ${sql(APIRoute)} ${sql(body)}`;
      return c.json({message: `PUT request to ${APIRoute} with id ${id}`});
    } catch (error) {
      return c.json({message: `Invalid request body for PUT ${APIRoute}`}, 400);
    }
  });

  App.delete(`/${APIRoute}/:id`, async c => {
    const {id} = c.req.param();
    await sql`DELETE FROM ${sql(APIRoute)} WHERE id = ${id}`;
    return c.json({message: `DELETE request to ${APIRoute} with id ${id}`});
  });
};
