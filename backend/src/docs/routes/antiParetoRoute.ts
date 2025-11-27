import z from 'zod';
import {resolver, describeRoute} from 'hono-openapi';
import type {RouteDocumentationWithoutValidator} from '../types/routes';
import {sql} from '../../utils/database/connect';

interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: string;
}

// Type map from PostGresSQL to Zod (OpenAPI library: https://zod.dev/)
const mapPostgresToZod = (pgType: string, isNullable: boolean) => {
  const baseType = pgType.toLowerCase();
  let zodType: z.ZodTypeAny;

  if (baseType.includes('int') || baseType.includes('serial')) {
    zodType = z.number().int();
  } else if (
    baseType.includes('numeric') ||
    baseType.includes('decimal') ||
    baseType.includes('float') ||
    baseType.includes('double')
  ) {
    zodType = z.number();
  } else if (baseType.includes('bool')) {
    zodType = z.boolean();
  } else if (baseType.includes('json')) {
    zodType = z.record(z.string(), z.unknown());
  } else if (
    baseType.includes('timestamp') ||
    baseType.includes('date') ||
    baseType.includes('time')
  ) {
    zodType = z.string().datetime();
  } else {
    zodType = z.string();
  }

  return isNullable ? zodType.nullable() : zodType;
};

const mapPostgresToOpenAPIType = (
  pgType: string
): {type: string; format?: string} => {
  const baseType = pgType.toLowerCase();

  if (baseType.includes('int') || baseType.includes('serial')) {
    return {type: 'integer'};
  } else if (
    baseType.includes('numeric') ||
    baseType.includes('decimal') ||
    baseType.includes('float') ||
    baseType.includes('double')
  ) {
    return {type: 'number'};
  } else if (baseType.includes('bool')) {
    return {type: 'boolean'};
  } else if (baseType.includes('json')) {
    return {type: 'object'};
  } else if (baseType.includes('timestamp') || baseType.includes('date')) {
    return {type: 'string', format: 'date-time'};
  } else if (baseType.includes('time')) {
    return {type: 'string', format: 'time'};
  } else {
    return {type: 'string'};
  }
};

const getTableColumns = async (tableName: string): Promise<ColumnInfo[]> => {
  const columns = await sql`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = ${tableName}
    ORDER BY ordinal_position
  `;
  return columns as ColumnInfo[];
};

const generateZodSchema = (columns: ColumnInfo[]) => {
  const schemaObject: Record<string, z.ZodTypeAny> = {};

  for (const col of columns) {
    schemaObject[col.column_name] = mapPostgresToZod(
      col.data_type,
      col.is_nullable === 'YES'
    );
  }

  return z.object(schemaObject);
};

const generateOpenAPISchema = (columns: ColumnInfo[]) => {
  const properties: Record<string, any> = {};
  const required: string[] = [];

  for (const col of columns) {
    const typeInfo = mapPostgresToOpenAPIType(col.data_type);
    properties[col.column_name] = {
      ...typeInfo,
      description: `${col.column_name} (${col.data_type})`,
    };

    if (col.is_nullable === 'NO') {
      required.push(col.column_name);
    }
  }

  return {
    type: 'object' as const,
    properties,
    ...(required.length > 0 ? {required} : {}),
  };
};

export const createGetAllDoc = async (
  tableName: string,
  isPublic: boolean = false
): Promise<RouteDocumentationWithoutValidator> => {
  const columns = await getTableColumns(tableName);
  const zodSchema = generateZodSchema(columns);

  const description = `Obtiene todos los registros de la tabla '${tableName}'.${
    isPublic ? '' : ' Requiere permisos de administrador.'
  }`;

  return {
    describer: describeRoute({
      tags: ['AntiPareto'],
      description,
      security: [{bearerAuth: []}, {cookieAuth: []}, {cookieFingerprint: []}],
      responses: {
        200: {
          description: 'Lista de registros obtenida exitosamente',
          content: {
            'application/json': {
              schema: resolver(z.array(zodSchema)),
            },
          },
        },
        403: {
          description: 'Forbidden',
          content: {
            'application/json': {
              schema: resolver(
                z.object({
                  error: z.string(),
                })
              ),
            },
          },
        },
        401: {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: resolver(
                z.object({
                  error: z.string(),
                })
              ),
            },
          },
        },
      },
    }),
  };
};

export const createPostJsonDoc = async (
  tableName: string,
  isPublic: boolean = false
): Promise<RouteDocumentationWithoutValidator> => {
  const columns = await getTableColumns(tableName);
  const openAPISchema = generateOpenAPISchema(columns);
  const columnNames = columns.map(c => c.column_name).join(', ');

  const description = `Inserta registros en la tabla '${tableName}' desde JSON o subiendo un archivo CSV. Podés mandar un JSON (application/json) o subir un archivo CSV (multipart/form-data, campo 'file').${
    isPublic ? '' : ' Requiere permisos de administrador.'
  }`;

  return {
    describer: describeRoute({
      tags: ['AntiPareto'],
      description,
      security: [{bearerAuth: []}, {cookieAuth: []}, {cookieFingerprint: []}],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: openAPISchema,
          },
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: {
                file: {
                  type: 'string',
                  format: 'binary',
                  description: `Archivo CSV con columnas: ${columnNames}`,
                },
              },
              required: ['file'],
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Datos insertados exitosamente',
          content: {
            'application/json': {
              schema: resolver(
                z.object({
                  message: z.string(),
                })
              ),
            },
          },
        },
        400: {
          description: 'Bad Request',
          content: {
            'application/json': {
              schema: resolver(
                z.object({
                  message: z.string(),
                })
              ),
            },
          },
        },
        403: {
          description: 'Forbidden',
          content: {
            'application/json': {
              schema: resolver(
                z.object({
                  error: z.string(),
                })
              ),
            },
          },
        },
        401: {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: resolver(
                z.object({
                  error: z.string(),
                })
              ),
            },
          },
        },
      },
    }),
  };
};

export const createPostCsvDoc = async (
  tableName: string,
  isPublic: boolean = false
): Promise<RouteDocumentationWithoutValidator> => {
  const columns = await getTableColumns(tableName);
  const columnNames = columns.map(c => c.column_name).join(', ');

  const description = `Inserta registros en la tabla '${tableName}' desde archivo CSV. Columnas esperadas: ${columnNames}.${
    isPublic ? '' : ' Requiere permisos de administrador.'
  }`;

  return {
    describer: describeRoute({
      tags: ['AntiPareto'],
      description,
      security: [{bearerAuth: []}, {cookieAuth: []}, {cookieFingerprint: []}],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: {
                file: {
                  type: 'string',
                  format: 'binary',
                  description: `Archivo CSV con columnas: ${columnNames}`,
                },
              },
              required: ['file'],
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Datos insertados exitosamente',
          content: {
            'application/json': {
              schema: resolver(
                z.object({
                  message: z.string(),
                })
              ),
            },
          },
        },
        400: {
          description: 'Bad Request',
          content: {
            'application/json': {
              schema: resolver(
                z.object({
                  message: z.string(),
                })
              ),
            },
          },
        },
        403: {
          description: 'Forbidden',
          content: {
            'application/json': {
              schema: resolver(
                z.object({
                  error: z.string(),
                })
              ),
            },
          },
        },
        401: {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: resolver(
                z.object({
                  error: z.string(),
                })
              ),
            },
          },
        },
      },
    }),
  };
};

export const createPutJsonDoc = async (
  tableName: string,
  isPublic: boolean = false
): Promise<RouteDocumentationWithoutValidator> => {
  const columns = await getTableColumns(tableName);
  const openAPISchema = generateOpenAPISchema(columns);

  const description = `Actualiza registros en la tabla '${tableName}' desde JSON.${
    isPublic ? '' : ' Requiere permisos de administrador.'
  }`;

  return {
    describer: describeRoute({
      tags: ['AntiPareto'],
      description,
      security: [{bearerAuth: []}, {cookieAuth: []}, {cookieFingerprint: []}],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: openAPISchema,
          },
        },
      },
      responses: {
        200: {
          description: 'Datos actualizados exitosamente',
          content: {
            'application/json': {
              schema: resolver(
                z.object({
                  message: z.string(),
                })
              ),
            },
          },
        },
        400: {
          description: 'Bad Request',
          content: {
            'application/json': {
              schema: resolver(
                z.object({
                  message: z.string(),
                })
              ),
            },
          },
        },
        403: {
          description: 'Forbidden',
          content: {
            'application/json': {
              schema: resolver(
                z.object({
                  error: z.string(),
                })
              ),
            },
          },
        },
        401: {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: resolver(
                z.object({
                  error: z.string(),
                })
              ),
            },
          },
        },
      },
    }),
  };
};

export const createGetByIdDoc = async (
  tableName: string,
  isPublic: boolean = false
): Promise<RouteDocumentationWithoutValidator> => {
  const columns = await getTableColumns(tableName);
  const zodSchema = generateZodSchema(columns);

  const description = `Obtiene un registro específico de la tabla '${tableName}' por ID.${
    isPublic ? '' : ' Requiere permisos de administrador.'
  }`;

  return {
    describer: describeRoute({
      tags: ['AntiPareto'],
      description,
      security: [{bearerAuth: []}, {cookieAuth: []}, {cookieFingerprint: []}],
      responses: {
        200: {
          description: 'Registro obtenido exitosamente',
          content: {
            'application/json': {
              schema: resolver(zodSchema),
            },
          },
        },
        404: {
          description: 'Not Found',
          content: {
            'application/json': {
              schema: resolver(
                z.object({
                  message: z.string(),
                })
              ),
            },
          },
        },
        403: {
          description: 'Forbidden',
          content: {
            'application/json': {
              schema: resolver(
                z.object({
                  error: z.string(),
                })
              ),
            },
          },
        },
        401: {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: resolver(
                z.object({
                  error: z.string(),
                })
              ),
            },
          },
        },
      },
    }),
  };
};

export const createDeleteDoc = async (
  tableName: string,
  isPublic: boolean = false
): Promise<RouteDocumentationWithoutValidator> => {
  const description = `Elimina un registro de la tabla '${tableName}' por ID.${
    isPublic ? '' : ' Requiere permisos de administrador.'
  }`;

  return {
    describer: describeRoute({
      tags: ['AntiPareto'],
      description,
      security: [{bearerAuth: []}, {cookieAuth: []}, {cookieFingerprint: []}],
      responses: {
        200: {
          description: 'Registro eliminado exitosamente',
          content: {
            'application/json': {
              schema: resolver(
                z.object({
                  message: z.string(),
                })
              ),
            },
          },
        },
        403: {
          description: 'Forbidden',
          content: {
            'application/json': {
              schema: resolver(
                z.object({
                  error: z.string(),
                })
              ),
            },
          },
        },
        401: {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: resolver(
                z.object({
                  error: z.string(),
                })
              ),
            },
          },
        },
      },
    }),
  };
};

export const createGetTablesDoc = async (): Promise<RouteDocumentationWithoutValidator> => {
  const tableSchema = z.object({
    name: z.string(),
    columns: z.array(
      z.object({
        name: z.string(),
        type: z.string(),
        nullable: z.boolean(),
        default: z.string().nullable(),
      })
    ),
  });

  return {
    describer: describeRoute({
      tags: ['AntiPareto'],
      description: 'Obtiene la lista de todas las tablas disponibles con su estructura de columnas. Requiere permisos de administrador.',
      security: [{bearerAuth: []}, {cookieAuth: []}, {cookieFingerprint: []}],
      responses: {
        200: {
          description: 'Lista de tablas y su estructura obtenida exitosamente',
          content: {
            'application/json': {
              schema: resolver(z.array(tableSchema)),
            },
          },
        },
        403: {
          description: 'Forbidden',
          content: {
            'application/json': {
              schema: resolver(
                z.object({
                  error: z.string(),
                })
              ),
            },
          },
        },
        401: {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: resolver(
                z.object({
                  error: z.string(),
                })
              ),
            },
          },
        },
      },
    }),
  };
};

