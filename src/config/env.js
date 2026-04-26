import path from "node:path";

const rootDir = process.cwd();

export function getEnv() {
  return {
    nodeEnv: process.env.NODE_ENV || "development",
    host: process.env.HOST || "0.0.0.0",
    port: Number(process.env.PORT || 3000),
    dbClient: process.env.DB_CLIENT || "sqlite",
    sqlitePath: path.resolve(rootDir, process.env.SQLITE_PATH || "./data/app.db"),
    sessionSecret: process.env.SESSION_SECRET || "dev-only-secret-change-me"
  };
}
