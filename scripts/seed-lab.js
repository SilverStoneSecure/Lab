/**
 * Replace all cards and inventory with an exact snapshot from Lab `index.html`
 * (see src/data/labSeed.mjs and reference/lab-index.html).
 */
import { getDb } from "../src/db/client.js";
import { labCards, labInventoryRows } from "../src/data/labSeed.mjs";

const db = getDb();
const insCard = db.prepare(
  "INSERT INTO cards (section, title, description, url, tag, sort_order, image_url, open_new_tab) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
);
const insInv = db.prepare(
  "INSERT INTO inventory_rows (host, link, mac, ipv4, notes, pill, pill_caption, status, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, '', ?)"
);

const tx = db.transaction(() => {
  db.exec("DELETE FROM cards");
  db.exec("DELETE FROM inventory_rows");
  for (const row of labCards) insCard.run(...row);
  for (const r of labInventoryRows) {
    insInv.run(r.host, r.link, r.mac, r.ipv4, r.notes, r.pill, r.pill_caption, r.sort_order);
  }
});

tx();
console.log(`Lab reseed: ${labCards.length} cards, ${labInventoryRows.length} inventory rows.`);
