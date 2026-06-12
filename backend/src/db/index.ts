import { Pool } from "@neondatabase/serverless";
import { env } from "../config/env";

// Create a connection pool if the database URL is provided
export const pool = env.databaseUrl ? new Pool({ connectionString: env.databaseUrl }) : null;

/**
 * Utility function to execute a query
 */
export async function query(text: string, params?: any[]) {
  if (!pool) {
    throw new Error("Database URL not configured");
  }
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res;
  } finally {
    client.release();
  }
}
