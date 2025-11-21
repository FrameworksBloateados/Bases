import {Hono} from 'hono';
import {sql} from './utils/database/connect';

export function createGenericAPICrudForTheAntiParetoRule(
  App: Hono,
  APIRoute: string
) {
  App.get(`${APIRoute}`, async c => {
    const result = await sql`SELECT * FROM ${sql(APIRoute)}`; // Safe from SQL injection, see https://bun.com/docs/runtime/sql.
    return c.json(result);
  });

  App.post(`${APIRoute}`, async c => {
    const body = await c.req.json();
    await sql`INSERT INTO ${sql(APIRoute)} ${sql(body)}`;
    return c.json({message: `POST request to ${APIRoute}`});
  });

  App.put(`${APIRoute}/:id`, c => {
    const {id} = c.req.param();
    return c.json({message: `PUT request to ${APIRoute} with id ${id}`});
  });

  App.delete(`${APIRoute}/:id`, c => {
    const {id} = c.req.param();
    return c.json({message: `DELETE request to ${APIRoute} with id ${id}`});
  });
}
