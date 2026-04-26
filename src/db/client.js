import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { getEnv } from "../config/env.js";

let sqliteDb = null;

export function getDb() {
  if (sqliteDb) return sqliteDb;

  const env = getEnv();
  if (env.dbClient !== "sqlite") {
    throw new Error(`DB_CLIENT '${env.dbClient}' not implemented yet. Use sqlite for now.`);
  }

  fs.mkdirSync(path.dirname(env.sqlitePath), { recursive: true });
  sqliteDb = new Database(env.sqlitePath);
  sqliteDb.pragma("journal_mode = WAL");
  return sqliteDb;
}
