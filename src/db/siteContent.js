/** Default copy for header, headings, about, notes, footer. Keys match `site_snippets.key`. */

export const SNIPPET_DEFAULTS = Object.freeze({
  brand_badge: "Homelab v1.1",
  brand_title: "SilverStone LAN Homelab - One Page",
  brand_subtitle:
    "Quick links and a living inventory for <code>192.168.1.0/24</code>.",
  meta_description:
    "SilverStone homelab — one-page dashboard: LAN and WAN links, device inventory, media, and notes.",
  page_title: "SilverStoneLab",
  nav_label_home: "Home",
  nav_label_devices: "Devices",
  nav_label_internal: "LAN links",
  nav_label_inventory: "Inventory",
  nav_label_external: "WAN links",
  nav_label_about: "About",
  nav_label_contact: "Contact",
  nav_label_media: "Media",
  nav_label_page_text: "Page text",
  nav_label_categories: "Categories",
  nav_label_images_backgrounds: "Images / Backgrounds",
  nav_label_images_icons: "Images / Icons",
  nav_label_login: "Login",
  status_signed_in_as: "Signed in as",
  status_logout: "Logout",
  status_label_wan: "WAN:",
  status_wan: "50.99.15.26",
  status_host: "SilverStone (open)",
  inventory_col_host: "Host",
  inventory_col_link: "Link",
  inventory_col_mac: "MAC",
  inventory_col_ipv4: "IPv4",
  inventory_col_notes: "Notes",
  inventory_col_save: "Save",
  inventory_action_edit: "Edit",
  inventory_action_save_row: "Save row",
  inventory_action_cancel: "Cancel",
  inventory_action_delete_row: "Delete row",
  inventory_action_save_new_row: "Save new row",
  inventory_action_add_row: "Add row",
  inventory_label_host: "Host",
  inventory_label_link: "Link",
  inventory_label_mac: "MAC",
  inventory_label_ipv4: "IPv4",
  inventory_label_pill: "Pill",
  inventory_label_pill_caption: "Pill caption",
  inventory_label_pill_caption_q: "Pill caption (q)",
  inventory_label_notes: "Notes",
  inventory_new_host_default: "New host",
  inventory_confirm_delete: "Delete this row?",
  pill_none: "(none)",
  pill_ok: "confirmed (ok)",
  pill_q: "question (q)",
  pill_confirmed: "confirmed",
  card_col_title: "Title",
  card_col_tag: "Tag",
  card_col_description: "Description",
  card_col_url: "URL",
  card_col_save: "Save",
  card_action_edit: "Edit",
  card_action_save: "Save",
  card_action_cancel: "Cancel",
  card_action_delete: "Delete",
  card_action_save_new: "Save new card",
  card_action_add: "Add card",
  card_confirm_delete: "Delete this card?",
  card_label_title: "Title",
  card_label_tag: "Tag",
  card_label_description: "Description",
  card_label_url: "URL",
  card_label_image_url: "Image URL",
  card_label_open_new_tab: "Open in new window",
  card_action_add_row: "Add another row",
  card_placeholder_title: "Add title",
  card_placeholder_description: "Add description (HTML allowed)",
  card_placeholder_image_url: "/public/…",
  status_action_add_line: "Add status line",
  status_action_save_line: "Save line",
  status_action_delete_line: "Delete line",
  status_action_save_new_line: "Save new line",
  status_confirm_delete_line: "Delete this line?",
  media_action_save_gallery_card: "Save gallery card",
  tag_lan: "LAN",
  tag_wan: "WAN",
  tag_service: "Service",
  tag_device: "Device",
  tag_folder: "Folder",
  tag_template: "Template",
  page_admin_heading: "Page text",
  page_admin_lead:
    "These fields control visible copy on the public page (titles, headings, paragraphs, footer). Nav labels, buttons, and form strings stay in the template.",
  page_admin_col_key: "Snippet key",
  page_admin_col_value: "Value (HTML allowed)",
  page_admin_action_save: "Save page text",
  page_admin_status_heading: "Status list (WAN panel)",
  page_admin_status_col_line: "Line (HTML)",
  page_admin_status_new_placeholder: "New status line",
  page_admin_status_label_line_html: "Line HTML",
  login_badge: "Portable Lab",
  login_title: "Login",
  login_subtitle: "Sign in to edit cards and inventory.",
  login_label_username: "Username",
  login_label_password: "Password",
  login_action_sign_in: "Sign in",
  login_action_back: "Back",
  login_dev_label: "Revision login",
  login_dev_username: "admin",
  login_dev_password: "Admin123!pass",
  auth_invalid_credentials: "Invalid credentials.",
  heading_devices: "Devices",
  heading_internal: "On the LAN",
  heading_external: "From the internet",
  heading_contact: "Admin contacts",
  heading_inventory: "Device inventory",
  heading_about: "About",
  heading_notes: "Notes",
  heading_media: "Media",
  heading_media_folders: "Folders",
  heading_media_gallery: "Background gallery",
  about_p1:
    "This site is a central entry point for your internal and external homelab services.",
  about_p2:
    "Keep sensitive details LAN-only when possible, and prefer VPN access over exposed ports.",
  notes_p1:
    "Host this file with <code>nginx</code>, <code>Caddy</code>, or <code>python -m http.server</code>. If the page is reachable from the public internet, WAN IP and port-forward details help attackers map your network — keep this copy LAN-only or strip sensitive rows.",
  notes_p2:
    "You had <code>50.99.15.26/weather</code> in your notes; only the address is shown above. Add a separate link if that was a real URL.",
  footer_line1: "SilverStone Homelab v1.1 — static HTML. Last updated: 2026-04-18",
  footer_line2:
    '<a href="https://github.com/SilverStone/Lab" target="_blank" rel="noopener noreferrer">GitHub · SilverStone/Lab</a>'
});

const STATUS_LINE_DEFAULTS = [
  "Minecraft — TCP/UDP 25565 <span class=\"status-note\">(WAN forwarded)</span>",
  "Nextcloud — TCP 80",
  "Apache2 — TCP 8080"
];

export function ensureSiteDefaults(db) {
  const insSnip = db.prepare(
    "INSERT OR IGNORE INTO site_snippets (key, value) VALUES (?, ?)"
  );
  for (const [key, value] of Object.entries(SNIPPET_DEFAULTS)) {
    insSnip.run(key, value);
  }
  const n = db.prepare("SELECT COUNT(*) AS c FROM status_lines").get().c;
  if (n === 0) {
    const insLine = db.prepare(
      "INSERT INTO status_lines (sort_order, body) VALUES (?, ?)"
    );
    STATUS_LINE_DEFAULTS.forEach((body, i) => insLine.run(i + 1, body));
  }
}

export function loadSiteSnippets(db) {
  const rows = db.prepare("SELECT key, value FROM site_snippets").all();
  const site = { ...SNIPPET_DEFAULTS };
  for (const r of rows) site[r.key] = r.value;
  return site;
}

export function loadStatusLines(db) {
  return db.prepare("SELECT * FROM status_lines ORDER BY sort_order, id").all();
}

export const SNIPPET_KEYS = Object.freeze(Object.keys(SNIPPET_DEFAULTS));
