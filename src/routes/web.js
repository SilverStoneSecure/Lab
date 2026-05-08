import { clearSession, readSession, setSession } from "../auth/session.js";
import { verifyPassword } from "../auth/password.js";
import { loadSiteSnippets, loadStatusLines } from "../db/siteContent.js";

function bySection(db, section) {
  return db.prepare("SELECT * FROM cards WHERE section = ? ORDER BY sort_order, id").all(section);
}

function loadCardContainers(db, onlyShown) {
  const whereClause = onlyShown ? "WHERE is_shown = 1" : "";
  return db
    .prepare(`SELECT * FROM card_containers ${whereClause} ORDER BY display_order, id`)
    .all();
}

export async function registerWebRoutes(fastify) {
  fastify.get("/", async (request, reply) => {
    const session = readSession(request);
    const db = fastify.db;
    const cardContainers = loadCardContainers(db, true);
    const cardsBySection = {};
    for (const container of cardContainers) {
      cardsBySection[container.section_key] = bySection(db, container.section_key);
    }

    return reply.view("pages/index.njk", {
      session,
      site: loadSiteSnippets(db),
      statusLines: loadStatusLines(db),
      cardContainers,
      cardsBySection,
      allCardContainers: loadCardContainers(db, false),
      inventory: db.prepare("SELECT * FROM inventory_rows ORDER BY sort_order, id").all()
    });
  });

  fastify.get("/login", async (_request, reply) => {
    return reply.view("pages/login.njk", { error: null, site: loadSiteSnippets(fastify.db) });
  });

  fastify.post("/login", async (request, reply) => {
    const { username, password } = request.body || {};
    const site = loadSiteSnippets(fastify.db);
    const user = fastify.db.prepare("SELECT * FROM users WHERE username = ?").get(username);
    if (!user) return reply.view("pages/login.njk", { error: site.auth_invalid_credentials, site });

    let ok = false;
    try {
      ok = await verifyPassword(user.password_hash, password);
    } catch {
      // Treat malformed/legacy hashes as invalid credentials for the UI.
      ok = false;
    }
    if (!ok) return reply.view("pages/login.njk", { error: site.auth_invalid_credentials, site });

    setSession(reply, user);
    return reply.redirect("/");
  });

  fastify.post("/logout", async (_request, reply) => {
    clearSession(reply);
    return reply.redirect("/");
  });
}
