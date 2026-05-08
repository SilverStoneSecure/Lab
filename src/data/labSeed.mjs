/**
 * Exact content cloned from /home/chad/ProjectsLocal/Lab/index.html (SilverStone Lab).
 * Used by scripts/seed.js (empty DB) and scripts/seed-lab.js (force reimport).
 */

export const labInventoryRows = [
  { host: "JJNitro", link: "Ethernet", mac: "30:43:d7:e6:7c:a9", ipv4: "192.168.1.100", pill: "ok", pill_caption: "", notes: "", sort_order: 1 },
  {
    host: "JJNitro",
    link: "Wi‑Fi",
    mac: "58:02:05:cc:1a:a9",
    ipv4: "",
    pill: "q",
    pill_caption: "JJ confirmed · verify",
    notes: "Not assigned. ",
    sort_order: 2
  },
  {
    host: "SilverStone",
    link: "Ethernet",
    mac: "fc:9d:05:02:21:96",
    ipv4: "192.168.1.200",
    pill: "ok",
    pill_caption: "",
    notes: " · Nextcloud TCP 80 · Apache2 TCP 8080",
    sort_order: 3
  },
  { host: "SilverStone", link: "Wi‑Fi", mac: "48:45:e6:29:18:93", ipv4: "", pill: "", pill_caption: "", notes: "Not assigned", sort_order: 4 },
  { host: "T420 (Pop!_OS)", link: "Ethernet", mac: "12:aa:bb:16:c9:ee", ipv4: "", pill: "", pill_caption: "", notes: "Not assigned", sort_order: 5 },
  { host: "T420 (Pop!_OS)", link: "Wi‑Fi", mac: "10:0b:a9:87:2d:2c", ipv4: "192.168.1.120", pill: "ok", pill_caption: "", notes: "", sort_order: 6 },
  { host: "Supaporn’s Z Flip 7", link: "Wi‑Fi", mac: "56:0c:b6:80:3a:1e", ipv4: "", pill: "", pill_caption: "", notes: "Not assigned", sort_order: 7 }
];

export const labCards = [
  // --- On the LAN ---
  ["internal", "SilverStone · Nextcloud", "Ethernet host (confirmed). Nextcloud on TCP 80.", "http://192.168.1.200/", "lan", 1, "", 0],
  ["internal", "SilverStone · Apache2", "Apache2 on TCP 8080 (same machine as Nextcloud).", "http://192.168.1.200:8080/", "lan", 2, "", 0],
  ["internal", "T420", "Wi‑Fi address (confirmed).", "http://192.168.1.120/", "lan", 3, "", 0],
  ["internal", "JJNitro", "Ethernet host (confirmed).", "http://192.168.1.100/", "lan", 4, "", 0],
  ["internal", "Wi‑Fi admin", "Access point or wifi/mesh/IP controller UI.", "http://192.168.1.6/", "lan", 5, "", 0],
  ["internal", "Modem admin", "Modem web interface inc. port forwarding (HTTPS if HTTP fails).", "http://192.168.1.254/", "lan", 6, "", 0]
  // Commented out to keep only the "On the LAN" container active for now.
  // ,["external", "Minecraft", "Port 25565 forwarded to your server (TCP/UDP). Some clients use “Add server” with host and port instead.", "minecraft://50.99.15.26:25565", "wan", 1, "", 0]
  // ,["external", "PLEX", "Port XXXX forwarded to your server (TCP/UDP/XXX). Some clients use “Add server” with host and port instead.", "minecraft://50.99.15.26:25565", "wan", 2, "", 0]
  // ,["external", "DOCUWIKI", "Port XXXX forwarded to your server (TCP/UDP/XXX). Some clients use “Add server” with host and port instead.", "minecraft://50.99.15.26:25565", "wan", 3, "", 0]
  // ,["external", "LAMP", "Port XXXX forwarded to your server (TCP/UDP/XXX). Some clients use “Add server” with host and port instead.", "minecraft://50.99.15.26:25565", "wan", 4, "", 0]
  // ,["external", "GitHub · Lab repo", "Source and history for this static homelab dashboard.", "https://github.com/SilverStone/Lab", "wan", 5, "", 1]
  // ,["external", "GITLAB", "Port XXXX forwarded to your server (TCP/UDP/XXX). Some clients use “Add server” with host and port instead.", "minecraft://50.99.15.26:25565", "wan", 6, "", 0]
  // ,["external", "MEAN", "Port XXXX forwarded to your server (TCP/UDP/XXX). Some clients use “Add server” with host and port instead.", "minecraft://50.99.15.26:25565", "wan", 7, "", 0]
  // ,["external", "TORRENTING", "Port XXXX forwarded to your server (TCP/UDP/XXX). Some clients use “Add server” with host and port instead.", "minecraft://50.99.15.26:25565", "wan", 8, "", 0]
  // ,["external", "NEXTCLOUD", "SilverStone serves Nextcloud on TCP 80 (LAN <code>192.168.1.200:80</code>). Update this card if WAN forwarding differs.", "http://50.99.15.26/", "wan", 9, "", 0]
  // ,["external", "MIRC", "Port XXXX forwarded to your server (TCP/UDP/XXX). Some clients use “Add server” with host and port instead.", "minecraft://50.99.15.26:25565", "wan", 10, "", 0]
  // ,["external", "Add service", "Duplicate this card, then set real protocol, host, and forwarded port.", "#", "template", 11, "", 0]
  // ,["contact", "Primary admin", "Name: add your name here", "#", "device", 1, "", 0]
  // ,["contact", "Backup admin", "Name: add backup contact", "#", "device", 2, "", 0]
  // ,["media_folder", "Backgrounds", "Desktop wallpapers and rotating background sets.", "/public/images/backgrounds/", "folder", 1, "", 0]
  // ,["media_folder", "Icons", "Buff icon pack and service icon assets.", "/public/images/icons/", "folder", 2, "", 0]
  // ,["media_gallery", "Aurora set", "images/backgrounds/placeholder-aurora.svg", "/public/images/backgrounds/", "service", 1, "/public/images/backgrounds/placeholder-aurora.svg", 0]
  // ,["media_gallery", "Mountain set", "images/backgrounds/placeholder-mountain.svg", "/public/images/backgrounds/", "service", 2, "/public/images/backgrounds/placeholder-mountain.svg", 0]
  // ,["media_gallery", "Grid set", "images/backgrounds/placeholder-grid.svg", "/public/images/backgrounds/", "service", 3, "/public/images/backgrounds/placeholder-grid.svg", 0]
];
