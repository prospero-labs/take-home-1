import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DB_NAME,
  password: process.env.PG_PASSWORD,
  port: Number(process.env.PG_PORT),
});

export const db = drizzle(pool, { schema });

export default db;
