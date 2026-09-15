/**
 * games-feed.js - ArenaGamers
 * Update: 16 Sep 2026 - Auto feed 20 games JSON + Proxy Anti-CORS
 */

const GAMEMONETIZE_FEED_URL = "https://gamemonetize.com/feed.php?format=0&num=20&page=1";
const PROXY_URL = "https://api.allorigins.win/raw?url=" + encodeURIComponent(GAMEMONETIZE_FEED_URL);

const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 jam
const CACHE_KEY = "ag_games_cache_v1";

const FALLBACK_GAMES = [
  {
    id: "8S00G",
    title: "City Bus Simulator Driving Games",
    thumb: "https://img.gamemonetize.com/holgi1h8gmto1gsjmOvlaro74or9tlue/512x384.jpg",
    url: "https://html5.gamemonetize.com/holgi1h8gmto1gsjmOvlaro74or9tlue/",
    category: "Racing"
  },
  {
    id: "archer-clash",
    title: "Archer Clash",
    thumb: "https://img.gamemonetize.com/placeholder.jpg",
    url: "",
    category: "Action"
  }
];

function normalizeGame(raw, index) {
  return {
    id: raw.id || raw.slug || `game-${index}`,
    title: raw.title || raw.name || "Game",
    thumb: raw.thumb || raw.thumb_1 || raw.image || raw.icon || "../icon-192.png",
    url: raw.url || raw.embed || raw.iframe || raw.link || "",
    category: raw.category || raw.categories || "Lainnya",
    description: raw.description || ""
  };
}

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed.timestamp || !Array.isArray(parsed.games)) return null;
    return parsed;
  } catch (e) {
    return null;
  }
}

function writeCache(games) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), games }));
  } catch (e) {}
}

function isFeedConfigured() {
  return GAMEMONETIZE_FEED_URL && !GAMEMONETIZE_FEED_URL.includes("PASTE_URL");
}

async function getGamesCatalog() {
  const cached = readCache();
  const cacheFresh = cached && Date.now() - cached.timestamp < CACHE_TTL_MS;
  if (cacheFresh) return cached.games;

  if (!isFeedConfigured()) {
    console.warn("[ArenaGamers] FEED belum diisi.");
    return cached ? cached.games : FALLBACK_GAMES;
  }

  try {
    // Fetch via proxy biar lolos CORS di Github Pages
    const res = await fetch(PROXY_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`Feed status ${res.status}`);
    const data = await res.json();
    const rawList = Array.isArray(data) ? data : data.result || data.games || data.items || [];
    const games = rawList.map(normalizeGame);
    if (games.length === 0) throw new Error("Feed kosong");
    writeCache(games);
    return games;
  } catch (err) {
    console.error("[ArenaGamers] Gagal fetch:", err);
    // Coba direct tanpa proxy sebagai cadangan
    try {
      const res2 = await fetch(GAMEMONETIZE_FEED_URL, { cache: "no-store" });
      const data2 = await res2.json();
      const rawList2 = Array.isArray(data2) ? data2 : data2.result || data2.games || [];
      const games2 = rawList2.map(normalizeGame);
      if (games2.length > 0) {
        writeCache(games2);
        return games2;
      }
    } catch(e2) {}
    return cached ? cached.games : FALLBACK_GAMES;
  }
}

async function forceRefreshCatalog() {
  localStorage.removeItem(CACHE_KEY);
  return getGamesCatalog();
      }
