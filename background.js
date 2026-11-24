const API_URL = "https://www.premiumize.me/api/transfer/create";
const APP_NAME = "Premiumize";

function notify(title, message) {
  browser.notifications.create({ type: "basic", title, message });
}

// Human-readable name from the magnet's dn= parameter (same as the original script).
function torrentName(magnet) {
  try {
    return new URL(magnet).searchParams.get("dn") || "Unknown torrent";
  } catch (_) {
    return "Unknown torrent";
  }
}

async function sendMagnet(magnet) {
  magnet = (magnet || "").trim();

  if (!magnet) {
    notify(APP_NAME, "No magnet link provided.");
    return { ok: false, message: "No magnet link provided." };
  }
  if (!magnet.startsWith("magnet:")) {
    notify(APP_NAME, "Argument does not look like a magnet link.");
    return { ok: false, message: "Not a magnet link." };
  }

  const { apiKey } = await browser.storage.local.get({ apiKey: "" });
  if (!apiKey) {
    notify(APP_NAME, "API key not found. Open the extension settings to add it.");
    browser.runtime.openOptionsPage();
    return { ok: false, message: "API key not set." };
  }

  const name = torrentName(magnet);

  try {
    // Key goes in the POST body, matching the original curl call.
    const body = new URLSearchParams({ apikey: apiKey, src: magnet });
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);
    let res;
    try {
      res = await fetch(API_URL, { method: "POST", body, signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }

    if (!res.ok) throw new Error(`Network error (HTTP ${res.status}). Could not reach Premiumize API.`);

    const data = await res.json();
    if (data.status === "success") {
      notify(`${APP_NAME} — Added ✓`, name);
      return { ok: true, message: `Added: ${name}` };
    }
    const msg = data.message || "No message";
    notify(`${APP_NAME} — Failed ✗`, `${msg}\n\n${name}`);
    return { ok: false, message: msg };
  } catch (e) {
    const msg = e.name === "AbortError" ? "Request timed out." : String(e.message || e);
    notify(`${APP_NAME} — Failed ✗`, `${msg}\n\n${name}`);
    return { ok: false, message: msg };
  }
}

browser.runtime.onMessage.addListener((msg) => {
  if (msg && msg.type === "send-magnet") return sendMagnet(msg.magnet);
});

// Right-click a magnet link -> send it (works even if Firefox's handler is set to something else).
browser.runtime.onInstalled.addListener(() => {
  browser.contextMenus.create({
    id: "send-magnet",
    title: "Send magnet to Premiumize",
    contexts: ["link"],
    targetUrlPatterns: ["magnet:*"]
  });
});

browser.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "send-magnet") sendMagnet(info.linkUrl);
});
