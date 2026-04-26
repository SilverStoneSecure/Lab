import { getDb } from "../src/db/client.js";
import { hashPassword } from "../src/auth/password.js";

const username = process.argv[2];
const password = process.argv[3];

if (!username || !password) {
  console.error("Usage: node scripts/create-admin.js <username> <password>");
  process.exit(1);
}

const db = getDb();
const existing = db.prepare("SELECT id FROM users WHERE username = ?").get(username);
if (existing) {
  console.error("User already exists.");
  process.exit(1);
}

const hash = await hashPassword(password);
db.prepare("INSERT INTO users (username, password_hash, role) VALUES (?, ?, 'admin')").run(username, hash);
console.log(`Admin created: ${username}`);
