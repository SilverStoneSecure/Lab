import { hashPassword } from "./password.js";

/**
 * If the users table is empty, insert one admin so first login matches the dev hints on /login.
 * In production (NODE_ENV=production), only runs when ALLOW_DEFAULT_ADMIN=1.
 */
export async function ensureBootstrapAdmin(db) {
  const row = db.prepare("SELECT COUNT(*) AS c FROM users").get();
  if (row.c > 0) return;

  const isProd = (process.env.NODE_ENV || "development") === "production";
  if (isProd && process.env.ALLOW_DEFAULT_ADMIN !== "1") {
    console.warn(
      "[auth] No users in database. Run: node scripts/create-admin.js <username> <password> — or for a one-time default in production, set ALLOW_DEFAULT_ADMIN=1 and restart."
    );
    return;
  }

  const username = process.env.BOOTSTRAP_ADMIN_USERNAME || "admin";
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD || "Admin123!pass";
  const hash = await hashPassword(password);
  db.prepare("INSERT INTO users (username, password_hash, role) VALUES (?, ?, 'admin')").run(username, hash);
  console.warn(
    `[auth] Created default admin user "${username}". Change the password in production; unset ALLOW_DEFAULT_ADMIN after first boot if you used it.`
  );
}
