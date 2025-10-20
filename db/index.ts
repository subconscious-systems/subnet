import 'dotenv/config';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';
import { drizzle as drizzleNode } from 'drizzle-orm/node-postgres';
import { neon } from '@neondatabase/serverless';
import { Pool } from 'pg';
import * as schema from './schema';

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error('DATABASE_URL must be set to a Postgres connection string.');
}

const env = process.env.ENV || 'LOCAL';

export const db =
  env === 'PROD'
    ? drizzleNeon(neon(url), { schema })
    : drizzleNode(new Pool({ connectionString: url }), { schema });
