/**
 * Seed 3 test containers + cards for the ORI lab overhaul.
 * Safe to re-run — uses INSERT OR IGNORE for containers.
 */
import { getDb } from '../src/db/client.js';

const db = getDb();

// ── Containers ──────────────────────────────────────────────────────────

const insertContainer = db.prepare(`
  INSERT OR IGNORE INTO card_containers
    (section_key, title, category, layout, description, display_order, is_shown)
  VALUES (?, ?, ?, ?, ?, ?, 1)
`);

insertContainer.run('services',    'services',    'general', 'tiles', 'Active silverstone services — web, media, file sharing, and gaming.', 10);
insertContainer.run('apache',      'apache',      'infra',   'tiles', 'Apache vhosts running on silverstone. Each proxies to a backend app or serves static files.', 20);
insertContainer.run('about_node',  'about',       'general', 'tiles', 'Silverstone is a Ryzen 5 5500GT homelab running Ubuntu 24.04 LTS. Cloudflare orange-cloud in front, key-only SSH, full ufw deny-default.', 30);

// ── Cards: //services ───────────────────────────────────────────────────

const insertCard = db.prepare(`
  INSERT OR IGNORE INTO cards
    (section, title, description, url, tag, icon, sort_order, open_new_tab)
  VALUES (?, ?, ?, ?, ?, ?, ?, 0)
`);

// Use a unique title check to make it idempotent
function cardExists(section, title) {
  return db.prepare('SELECT 1 FROM cards WHERE section = ? AND title = ?').get(section, title);
}

const serviceCards = [
  ['Nextcloud',       'Files, sync, and media library. v33 · Docker · HTTPS.',                  'https://cloud.silverstonesecure.com',     'wan',     '☁',  1],
  ['Jellyfin',        'Media server. ~1.2 TB library of movies, TV, and music.',                 'https://jellyfin.silverstonesecure.com',  'wan',     '▶',  2],
  ['SilverStoneLab',  'This dashboard. Fastify + SQLite homelab control plane.',                  'https://lab.silverstonesecure.com',       'wan',     '⌗',  3],
  ['Landing',         'Public-facing node status page at silverstonesecure.com.',                 'https://silverstonesecure.com',           'wan',     '◈',  4],
  ['SMB',             'Network file shares. LAN only — auth required.',                           'smb://192.168.1.200',                     'lan',     '📁', 5],
  ['Minecraft',       'Java Edition · whitelist on · online mode · port 25565.',                  'mc://mc.silverstonesecure.com:25565',     'service', '⛏',  6],
  ['AIO (WAN)',       'Artifact looker — rendered HTML outputs from Claude sessions.',             'https://aio.silverstonesecure.com',       'wan',     '⌗',  7],
  ['AIO (LAN)',       'AIO looker on the local network — faster, no auth.',                       'http://192.168.1.200:8080/aio/',          'lan',     '⌗',  8],
];

for (const [title, description, url, tag, icon, sort_order] of serviceCards) {
  if (!cardExists('services', title)) {
    insertCard.run('services', title, description, url, tag, icon, sort_order);
  }
}

// ── Cards: //apache ─────────────────────────────────────────────────────

const apacheCards = [
  ['lab.sss',        'Lab dashboard — Fastify proxy to :3001.',              'https://lab.silverstonesecure.com',       'wan',  '⌗',  1],
  ['cloud.sss',      'Nextcloud — Docker proxy to :8181.',                    'https://cloud.silverstonesecure.com',    'wan',  '☁',  2],
  ['jellyfin.sss',   'Jellyfin — Docker proxy to :8096, WebSocket enabled.', 'https://jellyfin.silverstonesecure.com', 'wan',  '▶',  3],
];

for (const [title, description, url, tag, icon, sort_order] of apacheCards) {
  if (!cardExists('apache', title)) {
    insertCard.run('apache', title, description, url, tag, icon, sort_order);
  }
}

console.log('Seed complete — services (8 cards), apache (3 cards), about_node (note container).');
