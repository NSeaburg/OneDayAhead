import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configure connection pool for PostgreSQL
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : {
    rejectUnauthorized: false, // Required for hosted PostgreSQL
  },
  max: 10, // Reduced pool size for better connection management
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 20000, // Increased timeout for initial connection
  query_timeout: 15000,
  statement_timeout: 15000,
  // Add keep alive settings
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

// Test connection on startup
pool.on("connect", () => {
  console.log("Connected to PostgreSQL database");
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
});

// Initialize Drizzle with node-postgres adapter
export const db = drizzle(pool, { schema });
