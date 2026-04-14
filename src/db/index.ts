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

  const hasSslMode = /([?&])sslmode=/i.test(connectionString);
  const hasLibpqCompat = /([?&])uselibpqcompat=/i.test(connectionString);

  let normalized = connectionString;
  if (!hasSslMode) {
    normalized = normalized.includes("?")
      ? `${normalized}&sslmode=require`
      : `${normalized}?sslmode=require`;
  }

  if (!hasLibpqCompat) {
    normalized = normalized.includes("?")
      ? `${normalized}&uselibpqcompat=true`
      : `${normalized}?uselibpqcompat=true`;
  }

  return normalized;
}

const connectionString = normalizeConnectionString(rawConnectionString);

if (!connectionString) {
  throw new Error(
    "Missing database URL. Set DATABASE_URL (or POSTGRES_URL on Vercel).",
  );
}

export const db = drizzle(connectionString);
