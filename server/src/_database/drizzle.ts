import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as authSchema from "./schema/auth-schema";
import * as appSchema from "./schema/app-schema";

/** Used to prevent configuration drift due to schema splitting.
 * 
 * https://orm.drizzle.team/docs/sql-schema-declaration
 */
const schema = {
  ...authSchema,
  ...appSchema,
};

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

export const db = drizzle(pool, { schema });

export type DB = typeof db;
export type Schema = typeof schema;
