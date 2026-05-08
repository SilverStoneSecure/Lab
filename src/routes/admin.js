import { readSession } from "../auth/session.js";
import { SNIPPET_KEYS } from "../db/siteContent.js";

const ALLOWED_TAGS = new Set(["lan", "wan", "service", "device", "folder", "template"]);
const ALLOWED_LAYOUTS = new Set(["tiles", "rail", "gallery"]);
const SNIPPET_KEY_SET = new Set(SNIPPET_KEYS);

function normalizeTag(raw) {
  const t = String(raw || "lan").toLowerCase();
  return ALLOWED_TAGS.has(t) ? t : "lan";
}

function normalizeLayout(raw) {
  const v = String(raw || "tiles").toLowerCase();
  return ALLOWED_LAYOUTS.has(v) ? v : "tiles";
}

function requireAdmin(request, reply) {
  const session = readSession(request);
  if (!session || session.role !== "admin") {
    reply.code(403).send({ error: "Admin only" });
    return null;
  }
  return session;
}

function truthyCheckbox(v) {
  return v === "1" || v === "on" || v === "true";
}

function toInt(raw, fallback) {
  const n = Number.parseInt(String(raw ?? ""), 10);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeSectionKey(raw) {
  return String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function resolveCardSection(db, raw, fallback) {
  const normalized = normalizeSectionKey(raw);
  const defaultSection = normalizeSectionKey(fallback) || "internal";
  if (!normalized) return defaultSection;
  const hit = db.prepare("SELECT section_key FROM card_containers WHERE section_key = ?").get(normalized);
  return hit?.section_key || defaultSection;
}

function nextContainerSectionKey(db, baseKey) {
  const base = normalizeSectionKey(baseKey) || "container_copy";
  const exists = db.prepare("SELECT 1 FROM card_containers WHERE section_key = ?").get(base);
  if (!exists) return base;
  for (let i = 2; i < 10_000; i += 1) {
    const candidate = `${base}_${i}`;
    const hit = db.prepare("SELECT 1 FROM card_containers WHERE section_key = ?").get(candidate);
    if (!hit) return candidate;
  }
  return `${base}_${Date.now()}`;
}

/** After POST /admin/site-snippets, send user back to the block they edited. */
function siteSnippetsRedirectTarget(body) {
  const next = String(body?._next ?? "").trim();
  if (next === "about") return "/#about";
  if (next === "info") return "/#info";
  const anchor = String(body?._snippet_anchor ?? "").trim();
  if (anchor && /^[a-zA-Z0-9_]+$/.test(anchor)) return `/#snippet-${anchor}`;
  return "/";
}

export async function registerAdminRoutes(fastify) {
  fastify.post("/admin/inventory", async (request, reply) => {
    if (!requireAdmin(request, reply)) return;
    const { host, link, mac, ipv4, notes, pill, pill_caption } = request.body || {};
    fastify.db
      .prepare(
        "INSERT INTO inventory_rows (host, link, mac, ipv4, notes, pill, pill_caption, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
      )
      .run(host || "New host", link || "", mac || "", ipv4 || "", notes || "", normalizePill(pill), pill_caption || "", "");
    return reply.redirect("/");
  });

  fastify.post("/admin/inventory/:id", async (request, reply) => {
    if (!requireAdmin(request, reply)) return;
    const { id } = request.params;
    const { host, link, mac, ipv4, notes, pill, pill_caption } = request.body || {};
    fastify.db
      .prepare(
        "UPDATE inventory_rows SET host=?, link=?, mac=?, ipv4=?, notes=?, pill=?, pill_caption=?, status='', updated_at=CURRENT_TIMESTAMP WHERE id=?"
      )
      .run(host, link, mac, ipv4, notes || "", normalizePill(pill), pill_caption || "", id);
    return reply.redirect("/");
  });

  fastify.post("/admin/inventory/:id/delete", async (request, reply) => {
    if (!requireAdmin(request, reply)) return;
    const { id } = request.params;
    fastify.db.prepare("DELETE FROM inventory_rows WHERE id = ?").run(id);
    return reply.redirect("/");
  });

  fastify.post("/admin/cards", async (request, reply) => {
    if (!requireAdmin(request, reply)) return;
    const { section, title, description, url, tag, image_url } = request.body || {};
    const openNew = truthyCheckbox(request.body?.open_new_tab) ? 1 : 0;
    const sec = resolveCardSection(fastify.db, section, "internal");
    const maxRow = fastify.db.prepare("SELECT COALESCE(MAX(sort_order), 0) AS m FROM cards WHERE section = ?").get(sec);
    const sortOrder = toInt(request.body?.sort_order, (maxRow?.m ?? 0) + 1);
    fastify.db
      .prepare(
        "INSERT INTO cards (section, title, description, url, tag, sort_order, image_url, open_new_tab) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
      )
      .run(
        sec,
        title || "New card",
        description || "",
        url || "#",
        normalizeTag(tag),
        sortOrder,
        image_url || "",
        openNew
      );
    return reply.redirect("/");
  });

  fastify.post("/admin/cards/:id", async (request, reply) => {
    if (!requireAdmin(request, reply)) return;
    const { id } = request.params;
    const { section, title, description, url, tag, image_url } = request.body || {};
    const openNew = truthyCheckbox(request.body?.open_new_tab) ? 1 : 0;
    const existing = fastify.db.prepare("SELECT section FROM cards WHERE id = ?").get(id);
    const sec = resolveCardSection(fastify.db, section, existing?.section || "internal");
    const sortOrder = toInt(request.body?.sort_order, 0);
    fastify.db
      .prepare(
        "UPDATE cards SET section=?, title=?, description=?, url=?, tag=?, sort_order=?, image_url=?, open_new_tab=?, updated_at=CURRENT_TIMESTAMP WHERE id=?"
      )
      .run(
        sec,
        title || "Untitled",
        description || "",
        url || "#",
        normalizeTag(tag),
        sortOrder,
        image_url || "",
        openNew,
        id
      );
    return reply.redirect("/");
  });

  fastify.post("/admin/cards/:id/delete", async (request, reply) => {
    if (!requireAdmin(request, reply)) return;
    const { id } = request.params;
    fastify.db.prepare("DELETE FROM cards WHERE id = ?").run(id);
    return reply.redirect("/");
  });

  fastify.post("/admin/card-containers", async (request, reply) => {
    if (!requireAdmin(request, reply)) return;
    const { section_key, title, category } = request.body || {};
    const row = fastify.db
      .prepare("SELECT COALESCE(MAX(display_order), 0) AS m FROM card_containers")
      .get();
    const displayOrder = toInt(request.body?.display_order, (row?.m ?? 0) + 1);
    const isShown = truthyCheckbox(request.body?.is_shown) ? 1 : 0;
    const layout = normalizeLayout(request.body?.layout);

    const key = normalizeSectionKey(section_key);
    if (!key) return reply.redirect("/");

    fastify.db
      .prepare(
        "INSERT INTO card_containers (section_key, title, category, layout, display_order, is_shown) VALUES (?, ?, ?, ?, ?, ?)"
      )
      .run(key, String(title || key), String(category || "general"), layout, displayOrder, isShown);
    return reply.redirect("/#card-containers-manager");
  });

  fastify.post("/admin/card-containers/:id", async (request, reply) => {
    if (!requireAdmin(request, reply)) return;
    const { id } = request.params;
    const { title, category } = request.body || {};
    const displayOrder = toInt(request.body?.display_order, 0);
    const isShown = truthyCheckbox(request.body?.is_shown) ? 1 : 0;
    const layout = normalizeLayout(request.body?.layout);
    fastify.db
      .prepare(
        "UPDATE card_containers SET title=?, category=?, layout=?, display_order=?, is_shown=?, updated_at=CURRENT_TIMESTAMP WHERE id=?"
      )
      .run(String(title || "Untitled"), String(category || "general"), layout, displayOrder, isShown, id);
    return reply.redirect("/#card-containers-manager");
  });

  fastify.post("/admin/card-containers/:id/duplicate", async (request, reply) => {
    if (!requireAdmin(request, reply)) return;
    const { id } = request.params;
    const current = fastify.db
      .prepare(
        "SELECT section_key, title, category, layout, display_order, is_shown FROM card_containers WHERE id = ?"
      )
      .get(id);
    if (!current) return reply.redirect("/#card-containers-manager");

    const sectionKey = nextContainerSectionKey(fastify.db, `${current.section_key}_copy`);
    const title = `${String(current.title || "Container").trim()} (copy)`;
    const layout = normalizeLayout(current.layout);
    fastify.db
      .prepare(
        "INSERT INTO card_containers (section_key, title, category, layout, display_order, is_shown) VALUES (?, ?, ?, ?, ?, ?)"
      )
      .run(
        sectionKey,
        title,
        String(current.category || "general"),
        layout,
        Number(current.display_order || 0) + 1,
        current.is_shown ? 1 : 0
      );
    return reply.redirect("/#card-containers-manager");
  });

  fastify.post("/admin/card-containers/:id/delete", async (request, reply) => {
    if (!requireAdmin(request, reply)) return;
    const { id } = request.params;
    const current = fastify.db
      .prepare("SELECT id, section_key FROM card_containers WHERE id = ?")
      .get(id);
    if (!current) return reply.redirect("/#card-containers-manager");

    const fallback = fastify.db
      .prepare(
        `SELECT section_key
         FROM card_containers
         WHERE id != ?
         ORDER BY CASE WHEN section_key = 'internal' THEN 0 ELSE 1 END, display_order, id
         LIMIT 1`
      )
      .get(id);
    const fallbackSection = fallback?.section_key || "internal";

    const tx = fastify.db.transaction(() => {
      fastify.db
        .prepare("UPDATE cards SET section = ?, updated_at = CURRENT_TIMESTAMP WHERE section = ?")
        .run(fallbackSection, current.section_key);
      fastify.db.prepare("DELETE FROM card_containers WHERE id = ?").run(id);
    });
    tx();
    return reply.redirect("/#card-containers-manager");
  });

  const upsertSnippet = fastify.db.prepare(
    `INSERT INTO site_snippets (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`
  );

  fastify.post("/admin/site-snippets", async (request, reply) => {
    if (!requireAdmin(request, reply)) return;
    const body = request.body || {};
    for (const key of SNIPPET_KEYS) {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        upsertSnippet.run(key, String(body[key] ?? ""));
      }
    }
    return reply.redirect(siteSnippetsRedirectTarget(body));
  });

  fastify.post("/admin/status-lines", async (request, reply) => {
    if (!requireAdmin(request, reply)) return;
    const text = String(request.body?.body ?? "").trim() || "New status line";
    const maxRow = fastify.db.prepare("SELECT COALESCE(MAX(sort_order), 0) AS m FROM status_lines").get();
    const sortOrder = (maxRow?.m ?? 0) + 1;
    fastify.db.prepare("INSERT INTO status_lines (sort_order, body) VALUES (?, ?)").run(sortOrder, text);
    return reply.redirect("/");
  });

  fastify.post("/admin/status-lines/:id", async (request, reply) => {
    if (!requireAdmin(request, reply)) return;
    const { id } = request.params;
    const text = String(request.body?.body ?? "");
    fastify.db
      .prepare("UPDATE status_lines SET body = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .run(text, id);
    return reply.redirect("/");
  });

  fastify.post("/admin/status-lines/:id/delete", async (request, reply) => {
    if (!requireAdmin(request, reply)) return;
    const { id } = request.params;
    fastify.db.prepare("DELETE FROM status_lines WHERE id = ?").run(id);
    return reply.redirect("/");
  });
}

function normalizePill(raw) {
  const p = String(raw || "").toLowerCase();
  if (p === "ok" || p === "q") return p;
  return "";
}
