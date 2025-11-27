import {Hono} from 'hono';
import {sql} from './utils/database/connect';
import {forbidden} from './utils/replies';
import csvToJson from 'convert-csv-to-json';
import * as antiParetoDoc from './docs/routes/antiParetoRoute';

// Blacklist certain tables from having CRUD routes generated, such as sensitive user data.
// Write them lowercase to ensure case-insensitive comparison.
const BLACKLISTED_TABLES = [''];

// Public get tables are tables that can be accessed without admin privileges.
const PUBLIC_GET_TABLES = ['matches', 'matches_results', 'players', 'teams', 'player_match_stats'];
// Public post tables are tables that can be posted to without admin privileges.
const PUBLIC_POST_TABLES = [''];
// Public put tables are tables that can be put to without admin privileges.
const PUBLIC_PUT_TABLES = [''];
// Public delete tables are tables that can be deleted from without admin privileges.
const PUBLIC_DELETE_TABLES = [''];

export const createAntiPareto = async (App: Hono) => {
  const tables =
    await sql`SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE'`;
  const blacklist = BLACKLISTED_TABLES.map(t => t.toLowerCase());
  
  // Endpoint para listar todas las tablas y su estructura
  const getTablesDoc = await antiParetoDoc.createGetTablesDoc();
  App.get('/tables', getTablesDoc.describer, async c => {
    if (!c.user.admin) return forbidden(c);
    
    const tablesInfo = [];
    
    for (const table of tables) {
      const tableName = table.table_name;
      if (blacklist.includes(tableName.toLowerCase())) continue;
      
      const columns = await sql`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = ${tableName}
        ORDER BY ordinal_position
      `;
      
      tablesInfo.push({
        name: tableName,
        columns: columns.map((col: any) => ({
          name: col.column_name,
          type: col.data_type,
          nullable: col.is_nullable === 'YES',
          default: col.column_default
        }))
      });
    }
    
    return c.json(tablesInfo);
  });
  
  for (const table of tables) {
    const tableName = table.table_name;
    if (blacklist.includes(tableName.toLowerCase())) continue;
    await createGenericAPICrudForTheAntiParetoRule(App, tableName);
  }
};

const createGenericAPICrudForTheAntiParetoRule = async (
  App: Hono,
  APIRoute: string
) => {
  const isPublicGet = PUBLIC_GET_TABLES.map(t => t.toLowerCase()).includes(
    APIRoute.toLowerCase()
  );
  const isPublicPost = PUBLIC_POST_TABLES.map(t => t.toLowerCase()).includes(
    APIRoute.toLowerCase()
  );
  const isPublicPut = PUBLIC_PUT_TABLES.map(t => t.toLowerCase()).includes(
    APIRoute.toLowerCase()
  );
  const isPublicDelete = PUBLIC_DELETE_TABLES.map(t =>
    t.toLowerCase()
  ).includes(APIRoute.toLowerCase());

  const getAllDoc = await antiParetoDoc.createGetAllDoc(APIRoute, isPublicGet);
  const getByIdDoc = await antiParetoDoc.createGetByIdDoc(
    APIRoute,
    isPublicGet
  );
  const postJsonDoc = await antiParetoDoc.createPostJsonDoc(
    APIRoute,
    isPublicPost
  );
  const postCsvDoc = await antiParetoDoc.createPostCsvDoc(
    APIRoute,
    isPublicPost
  );
  const putJsonDoc = await antiParetoDoc.createPutJsonDoc(
    APIRoute,
    isPublicPut
  );
  const deleteDoc = await antiParetoDoc.createDeleteDoc(
    APIRoute,
    isPublicDelete
  );

  App.get(`/${APIRoute}/json`, getAllDoc.describer, async c => {
    if (!isPublicGet && !c.user.admin) return forbidden(c);
    const result = await sql`SELECT * FROM ${sql(APIRoute)}`; // Safe from SQL injection, see https://bun.com/docs/runtime/sql.
    return c.json(result);
  });

  App.get(`/${APIRoute}/:id/json`, getByIdDoc.describer, async c => {
    if (!isPublicGet && !c.user.admin) return forbidden(c);
    const {id} = c.req.param();
    const result = await sql`SELECT * FROM ${sql(APIRoute)} WHERE id = ${id}`;
    if (result.length === 0) {
      return c.json(
        {message: `Record not found in ${APIRoute} with id ${id}`},
        404
      );
    }
    return c.json(result[0]);
  });

  const insertData = async (data: any) => {
    await sql`INSERT INTO ${sql(APIRoute)} ${sql(data)}`;
  };

  const updated_ata = async (data: any) => {
    await sql`UPDATE ${sql(APIRoute)} ${sql(data)}`;
  };

  App.post(`/${APIRoute}/json`, postJsonDoc.describer, async c => {
    if (!isPublicPost && !c.user.admin) return forbidden(c);
    try {
      const body = await c.req.json();
      await insertData(body);
      return c.json({message: `POST request to ${APIRoute}`});
    } catch (error) {
      return c.json({message: `Invalid request for POST ${APIRoute}`}, 400);
    }
  });

  App.post(`/${APIRoute}/csv`, postCsvDoc.describer, async c => {
    if (!isPublicPost && !c.user.admin) return forbidden(c);
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

  App.put(`/${APIRoute}/:id/json`, putJsonDoc.describer, async c => {
    if (!isPublicPut && !c.user.admin) return forbidden(c);
    try {
      const {id} = c.req.param();
      const body = await c.req.json();
      await updated_ata(body);
      return c.json({message: `PUT request to ${APIRoute} with id ${id}`});
    } catch (error) {
      return c.json({message: `Invalid request body for PUT ${APIRoute}`}, 400);
    }
  });

  App.delete(`/${APIRoute}/:id`, deleteDoc.describer, async c => {
    if (!isPublicDelete && !c.user.admin) return forbidden(c);
    const {id} = c.req.param();
    await sql`DELETE FROM ${sql(APIRoute)} WHERE id = ${id}`;
    return c.json({message: `DELETE request to ${APIRoute} with id ${id}`});
  });
};
