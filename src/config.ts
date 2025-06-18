import type { MigrationConfig } from "drizzle-orm/migrator";

process.loadEnvFile();

function envOrThrow(key: string): string {
  const value = process.env[key];
  if (value === undefined) {
    throw new Error(`Required environment variable "${key}" is missing`);
  }
  return value;
}

type DBConfig = {
  url: string;
  migrationConfig: MigrationConfig;
};

type APIConfig = {
    fileserverHits: number;
    db: DBConfig;
    platform: string;
}

// create a config object that will hold the stateful data and this object can be imported in other files

const config: APIConfig = {
    fileserverHits: 0,
    db: {
    url: envOrThrow("DB_URL"),
    migrationConfig: {
      migrationsFolder: "./src/db/migrations",
    },
  },
  platform: process.env.PLATFORM || "production",
};

export { config };