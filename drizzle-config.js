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

  if (/sslmode=/i.test(connectionString)) {
    return connectionString;
  }

  return connectionString.includes("?")
    ? `${connectionString}&sslmode=require`
    : `${connectionString}?sslmode=require`;
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
