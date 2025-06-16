process.loadEnvFile();

function envOrThrow(key: string): string {
  const value = process.env[key];
  if (value === undefined) {
    throw new Error(`Required environment variable "${key}" is missing`);
  }
  return value;
}

type APIConfig = {
    fileserverHits: number;
    dbURL: string;
}

// create a config object that will hold the stateful data and this object can be imported in other files

const config: APIConfig = {
    fileserverHits: 0,
    dbURL: envOrThrow("DB_URL"),
};

export { config };