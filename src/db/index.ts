import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";

const rawConnectionString =
  process.env.DATABASE_URL || process.env.POSTGRES_URL || "";

function normalizeConnectionString(connectionString: string): string {
  if (!connectionString) return "";

  // Keep local development URLs unchanged.
  if (
    connectionString.includes("localhost") ||
    connectionString.includes("127.0.0.1")
  ) {
    return connectionString;
  }

  // Most hosted Postgres providers (Supabase/Neon/Railway) require SSL.
  if (/sslmode=/i.test(connectionString)) {
    return connectionString;
  }

  return connectionString.includes("?")
    ? `${connectionString}&sslmode=require`
    : `${connectionString}?sslmode=require`;
}

const connectionString = normalizeConnectionString(rawConnectionString);

if (!connectionString) {
  throw new Error(
    "Missing database URL. Set DATABASE_URL (or POSTGRES_URL on Vercel).",
  );
}

export const db = drizzle(connectionString);
