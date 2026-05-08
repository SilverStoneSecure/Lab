import { getDb } from "../src/db/client.js";
import { migrationSql } from "../src/db/schema.js";
import { ensureSiteDefaults } from "../src/db/siteContent.js";
import { ensureBootstrapAdmin } from "../src/auth/bootstrapUser.js";

const db = getDb();
db.exec(migrationSql);
ensureSiteDefaults(db);

/** SQLite: add column if missing (existing DBs before new columns). */
function addColumnIfMissing(table, columnSql) {
  const colName = columnSql.trim().split(/\s+/)[0];
  const cols = db.prepare(`PRAGMA table_info(${table})`).all();
  if (cols.some((c) => c.name === colName)) return;
  db.exec(`ALTER TABLE ${table} ADD COLUMN ${columnSql}`);
}

try {
  addColumnIfMissing("cards", "image_url TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing("cards", "open_new_tab INTEGER NOT NULL DEFAULT 0");
  addColumnIfMissing("inventory_rows", "pill TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing("inventory_rows", "pill_caption TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing("card_containers", "layout TEXT NOT NULL DEFAULT 'tiles'");
  db.exec(
    `CREATE TABLE IF NOT EXISTS card_containers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      section_key TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'general',
      layout TEXT NOT NULL DEFAULT 'tiles',
      display_order INTEGER NOT NULL DEFAULT 0,
      is_shown INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`
  );
} catch (e) {
  console.error(e);
  process.exit(1);
}

// One-time: copy legacy status into pill when pill empty
try {
  db.exec(
    `UPDATE inventory_rows SET pill = status WHERE (pill IS NULL OR pill = '') AND status != '' AND status IN ('ok','q')`
  );
} catch {
  // ignore
}

// One-time text normalization for new-window wording.
try {
  db.exec(
    `UPDATE site_snippets
     SET value = 'Open in new window'
     WHERE key = 'card_label_open_new_tab'
       AND value IN ('Open in new tab', 'Open on new window')`
  );
} catch {
  // ignore
}

// One-time: backfill card containers from existing card sections.
try {
  const sections = db.prepare("SELECT DISTINCT section FROM cards ORDER BY section").all();
  const defaults = new Map([
    ["devices", { title: "Devices", category: "infrastructure", layout: "tiles", display_order: 10, is_shown: 1 }],
    ["internal", { title: "ON THE LAN", category: "network", layout: "rail", display_order: 20, is_shown: 1 }],
    ["external", { title: "From the internet", category: "network", layout: "tiles", display_order: 30, is_shown: 1 }],
    ["contact", { title: "Admin contacts", category: "people", layout: "tiles", display_order: 40, is_shown: 1 }],
    ["media_folder", { title: "Media folders", category: "media", layout: "tiles", display_order: 50, is_shown: 1 }],
    ["media_gallery", { title: "Background gallery", category: "media", layout: "gallery", display_order: 60, is_shown: 1 }]
  ]);
  const ins = db.prepare(
    `INSERT OR IGNORE INTO card_containers (section_key, title, category, layout, display_order, is_shown)
     VALUES (?, ?, ?, ?, ?, ?)`
  );
  sections.forEach((row, i) => {
    const section = row.section;
    const cfg = defaults.get(section) || {
      title: section,
      category: "general",
      layout: "tiles",
      display_order: 100 + i,
      is_shown: 1
    };
    ins.run(section, cfg.title, cfg.category, cfg.layout || "tiles", cfg.display_order, cfg.is_shown);
  });
} catch {
  // ignore
}

// Layout + visibility for existing installs (card containers already seeded).
try {
  db.exec(`UPDATE card_containers SET layout = 'rail' WHERE section_key = 'internal'`);
  db.exec(`UPDATE card_containers SET layout = 'gallery' WHERE section_key = 'media_gallery'`);
  db.exec(
    `UPDATE card_containers SET is_shown = 1 WHERE section_key IN ('devices','external','contact','media_folder','media_gallery')`
  );
} catch {
  // ignore
}

// Normalize legacy container title capitalization for the first container.
try {
  db.exec(
    `UPDATE card_containers
     SET title = 'ON THE LAN', updated_at = CURRENT_TIMESTAMP
     WHERE section_key = 'internal' AND title IN ('On the LAN', 'ON THE LAN')`
  );
} catch {
  // ignore
}

// Page admin section title / lead copy.
try {
  db.exec(
    `UPDATE site_snippets SET value = 'Page text', updated_at = CURRENT_TIMESTAMP
     WHERE key = 'page_admin_heading' AND value = 'Page text & status lines'`
  );
  db.exec(
    `UPDATE site_snippets SET value = 'These fields control visible copy on the public page (titles, headings, paragraphs, footer). Nav labels, buttons, and form strings stay in the template.', updated_at = CURRENT_TIMESTAMP
     WHERE key = 'page_admin_lead' AND value IN (
       'Every text snippet is stored in the database. Edit any key below and save.',
       'Edit the fields below. HTML is allowed where it makes sense (headings, notes, footer links). Use Save page text when done.'
     )`
  );
} catch {
  // ignore
}

await ensureBootstrapAdmin(db);

console.log("Migrations complete.");
