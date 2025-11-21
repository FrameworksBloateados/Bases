import {Hono} from 'hono';
import {sql} from './utils/database/connect';
import {forbidden} from './utils/replies';
import csvToJson from 'convert-csv-to-json';

// Blacklist certain tables from having CRUD routes generated, such as sensitive user data.
// Write them lowercase to ensure case-insensitive comparison.
const BLACKLISTED_TABLES = [''];

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
    if (!c.user.admin) return forbidden(c);
    const result = await sql`SELECT * FROM ${sql(APIRoute)}`; // Safe from SQL injection, see https://bun.com/docs/runtime/sql.
    return c.json(result);
  });

  const insertData = async (data: any) => {
    await sql`INSERT INTO ${sql(APIRoute)} ${sql(data)}`;
  };

  const updateData = async (data: any) => {
    await sql`UPDATE ${sql(APIRoute)} ${sql(data)}`;
  };

  App.post(`/${APIRoute}/json`, async c => {
    if (!c.user.admin) return forbidden(c);
    try {
      const body = await c.req.json();
      await insertData(body);
      return c.json({message: `POST request to ${APIRoute}`});
    } catch (error) {
      return c.json({message: `Invalid request for POST ${APIRoute}`}, 400);
    }
  });

  App.post(`/${APIRoute}/csv`, async c => {
    if (!c.user.admin) return forbidden(c);
    try {
      const body = await c.req.parseBody();
      const csv = body['file'] as File;
      const json = csvToJson.csvStringToJson(await csv.text());
      await insertData(json);
      return c.json({message: `POST request to ${APIRoute}`});
    } catch (error) {
      return c.json({message: `Invalid request for POST ${APIRoute}`}, 400);
    }
  });

  App.put(`/${APIRoute}/:id/json`, async c => {
    if (!c.user.admin) return forbidden(c);
    try {
      const {id} = c.req.param();
      const body = await c.req.json();
      await updateData(body);
      return c.json({message: `PUT request to ${APIRoute} with id ${id}`});
    } catch (error) {
      return c.json({message: `Invalid request body for PUT ${APIRoute}`}, 400);
    }
  });

  App.put(`/${APIRoute}/:id/csv`, async c => {
    if (!c.user.admin) return forbidden(c);
    try {
      const {id} = c.req.param();
      const body = await c.req.parseBody();
      const csv = body['file'] as File;
      const json = csvToJson.csvStringToJson(await csv.text());
      await updateData(json);
      return c.json({message: `PUT request to ${APIRoute} with id ${id}`});
    } catch (error) {
      return c.json({message: `Invalid request body for PUT ${APIRoute}`}, 400);
    }
  });

  App.delete(`/${APIRoute}/:id`, async c => {
    if (!c.user.admin) return forbidden(c);
    const {id} = c.req.param();
    await sql`DELETE FROM ${sql(APIRoute)} WHERE id = ${id}`;
    return c.json({message: `DELETE request to ${APIRoute} with id ${id}`});
  });
};
