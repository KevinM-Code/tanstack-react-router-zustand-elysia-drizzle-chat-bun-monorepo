import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite", // used for kit, orm will use bun:sqlite
  dbCredentials: {
    url: "./local.db",
  },
} satisfies Config;
