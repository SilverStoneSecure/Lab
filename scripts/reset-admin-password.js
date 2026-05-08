import { getDb } from "../src/db/client.js";
import { hashPassword } from "../src/auth/password.js";

const username = process.argv[2];
const password = process.argv[3];

if (!username || !password) {
  console.error("Usage: node scripts/reset-admin-password.js <username> <new-password>");
  process.exit(1);
}

const db = getDb();
const hash = await hashPassword(password);
const existing = db.prepare("SELECT id FROM users WHERE username = ?").get(username);

if (existing) {
  db.prepare("UPDATE users SET password_hash = ?, role = 'admin' WHERE username = ?").run(hash, username);
  console.log(`Password updated for: ${username}`);
} else {
  db.prepare("INSERT INTO users (username, password_hash, role) VALUES (?, ?, 'admin')").run(username, hash);
  console.log(`Admin created and password set for: ${username}`);
}
