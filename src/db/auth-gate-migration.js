export function runAuthGateMigration(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS client_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'client' CHECK(role IN ('admin', 'client')),
      archived_at TEXT DEFAULT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS client_sessions (
      id TEXT PRIMARY KEY,
      client_user_id INTEGER NOT NULL REFERENCES client_users(id),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      expires_at TEXT NOT NULL
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS registration_sessions (
      token TEXT PRIMARY KEY,
      email TEXT,
      step_reached INTEGER DEFAULT 0,
      partial_data TEXT,
      completed_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      expires_at TEXT
    )
  `);

  const alterations = [
    "ALTER TABLE client_users ADD COLUMN role TEXT NOT NULL DEFAULT 'client'",
    "ALTER TABLE client_users ADD COLUMN archived_at TEXT DEFAULT NULL",
    "ALTER TABLE registration_sessions ADD COLUMN expires_at TEXT",
  ];
  for (const sql of alterations) {
    try { db.exec(sql); } catch (_) { /* column already exists */ }
  }

  // Rename 'owner' role to 'admin' if still on old schema
  try {
    const info = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='client_users'").get();
    if (info && info.sql && info.sql.includes("'owner'")) {
      db.exec(`
        DROP TABLE IF EXISTS client_users_new;
        CREATE TABLE client_users_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'client' CHECK(role IN ('admin', 'client')),
          archived_at TEXT DEFAULT NULL,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
        INSERT INTO client_users_new (id, username, password_hash, role, archived_at, created_at)
          SELECT id, username, password_hash,
            CASE WHEN role = 'owner' THEN 'admin' ELSE role END,
            archived_at, created_at
          FROM client_users;
        DROP TABLE client_users;
        ALTER TABLE client_users_new RENAME TO client_users;
      `);
    }
  } catch (e) {
    console.error('auth-gate: role migration failed', e.message);
  }
}
