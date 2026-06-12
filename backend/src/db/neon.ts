import { neon } from "@neondatabase/serverless";
import { env } from "../config/env";

export function getDatabaseClient() {
  if (!env.databaseUrl) {
    return null;
  }

  return neon(env.databaseUrl);
}
