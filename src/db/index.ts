import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";

const connectionString =
  process.env.DATABASE_URL || process.env.POSTGRES_URL || "";

if (!connectionString) {
  throw new Error(
    "Missing database URL. Set DATABASE_URL (or POSTGRES_URL on Vercel).",
  );
}

export const db = drizzle(connectionString);
