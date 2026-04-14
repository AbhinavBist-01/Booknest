import "dotenv/config";
import { defineConfig } from "drizzle-kit";

function normalizeConnectionString(connectionString) {
  if (!connectionString) return connectionString;

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

const dbUrl = normalizeConnectionString(
  process.env.DATABASE_URL || process.env.POSTGRES_URL,
);

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",

  dbCredentials: {
    url: dbUrl,
  },
});
