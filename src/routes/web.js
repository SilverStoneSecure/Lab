import { readClientSession, authGateGuard } from "../auth/auth-gate.js";
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
  fastify.get("/template", async (request, reply) => {
    const rawSession = authGateGuard(request, reply);
    if (!rawSession) return;
    const db = fastify.db;
    const userRow = db
      .prepare("SELECT username, role FROM client_users WHERE id = ? AND archived_at IS NULL")
      .get(rawSession.userId);
    if (!userRow) {
      const { clearClientSession } = await import("../auth/auth-gate.js");
      clearClientSession(reply);
      return reply.redirect("/portal/login");
    }
    const session = { id: rawSession.userId, username: userRow.username, role: userRow.role };
    return reply.view("pages/template.njk", {
      session,
      site: loadSiteSnippets(db)
    });
  });

  fastify.get("/", async (request, reply) => {
    const rawSession = authGateGuard(request, reply);
    if (!rawSession) return;

    const db = fastify.db;
    const userRow = db
      .prepare("SELECT username, role FROM client_users WHERE id = ? AND archived_at IS NULL")
      .get(rawSession.userId);
    if (!userRow) {
      const { clearClientSession } = await import("../auth/auth-gate.js");
      clearClientSession(reply);
      return reply.redirect("/portal/login");
    }

    const session = { id: rawSession.userId, username: userRow.username, role: userRow.role };

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
}
