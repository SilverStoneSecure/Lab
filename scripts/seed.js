import { getDb } from "../src/db/client.js";
import { labCards, labInventoryRows } from "../src/data/labSeed.mjs";
import { ensureSiteDefaults } from "../src/db/siteContent.js";

const db = getDb();
ensureSiteDefaults(db);

const insCard = db.prepare(
  "INSERT INTO cards (section, title, description, url, tag, sort_order, image_url, open_new_tab) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
);
const insInv = db.prepare(
  "INSERT INTO inventory_rows (host, link, mac, ipv4, notes, pill, pill_caption, status, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, '', ?)"
);

const cardCount = db.prepare("SELECT COUNT(*) AS c FROM cards").get().c;
if (cardCount === 0) {
  for (const row of labCards) {
    insCard.run(...row);
  }
  console.log(`Seeded ${labCards.length} cards from Lab snapshot.`);
} else {
  console.log("Cards already present — skip card seed (use npm run seed:lab to replace).");
}

const invCount = db.prepare("SELECT COUNT(*) AS c FROM inventory_rows").get().c;
if (invCount === 0) {
  for (const r of labInventoryRows) {
    insInv.run(r.host, r.link, r.mac, r.ipv4, r.notes, r.pill, r.pill_caption, r.sort_order);
  }
  console.log(`Seeded ${labInventoryRows.length} inventory rows from Lab snapshot.`);
} else {
  console.log("Inventory already present — skip inventory seed (use npm run seed:lab to replace).");
}

console.log("Seed complete.");
