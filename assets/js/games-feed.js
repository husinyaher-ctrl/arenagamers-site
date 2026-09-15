/**
 * games-feed.js
 * Modul terpusat untuk mengambil katalog game dari GameMonetize secara otomatis.
 *
 * =========================== PENTING - HARUS DIISI ===========================
 * Setelah akun publisher GameMonetize Anda di-approve, mereka akan memberikan
 * URL feed pribadi (biasanya berisi API key Anda) di dashboard mereka.
 * Ganti nilai GAMEMONETIZE_FEED_URL di bawah ini dengan URL asli tersebut.
 *
 * Contoh format umum yang biasa dipakai publisher GameMonetize:
 *   https://rss.gamemonetize.com/rssfeed.php?format=json&key=API_KEY_ANDA&num=40
 * Tapi WAJIB dicek ulang di dashboard Anda karena setiap publisher bisa beda.
 * ==============================================================================
 */

const GAMEMONETIZE_FEED_URL = "PASTE_URL_FEED_GAMEMONETIZE_ANDA_DI_SINI";

// Berapa lama cache dianggap masih segar sebelum fetch ulang (dalam milidetik)
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 jam
const CACHE_KEY = "ag_games_cache_v1";

// Game cadangan (fallback) yang selalu tampil kalau feed belum dikonfigurasi
// atau gagal diambil, supaya situs tidak pernah kosong.
const FALLBACK_GAMES = [
  {
    id: "labirin",
    title: "Labirin Putri",
    thumb: "../icon-192.png",
    url: "" // isi manual link embed game asli kalau mau dipakai permanen
  },
  {
    id: "balapan",
    title: "Balap Mobil 3D",
    thumb: "../icon-192.png",
    url: ""
  }
];

/**
 * Menormalkan satu item game dari berbagai kemungkinan bentuk response feed
 * menjadi bentuk standar { id, title, thumb, url }.
 * GameMonetize umumnya mengirim field seperti: title, url (embed), thumb, category.
 * Fungsi ini mencoba beberapa nama field yang mungkin dipakai supaya lebih tahan
 * terhadap perbedaan versi API.
 */
function normalizeGame(raw, index) {
  return {
    id: raw.id || raw.slug || `game-${index}`,
    title: raw.title || raw.name || "Game",
    thumb: raw.thumb || raw.thumb_1 || raw.image || raw.icon || "icon-192.png",
    url: raw.url || raw.embed || raw.iframe || raw.link || ""
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
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ timestamp: Date.now(), games })
    );
  } catch (e) {
    // localStorage penuh/diblokir - abaikan, tidak fatal
  }
}

function isFeedConfigured() {
  return (
    GAMEMONETIZE_FEED_URL &&
    !GAMEMONETIZE_FEED_URL.includes("PASTE_URL_FEED_GAMEMONETIZE_ANDA_DI_SINI")
  );
}

/**
 * Fungsi utama: mengambil daftar game.
 * - Kalau cache masih segar, pakai cache (tidak fetch ulang, hemat kuota).
 * - Kalau cache basi/tidak ada dan feed sudah dikonfigurasi, fetch ke GameMonetize.
 * - Kalau feed belum dikonfigurasi atau fetch gagal, pakai FALLBACK_GAMES.
 */
async function getGamesCatalog() {
  const cached = readCache();
  const cacheFresh = cached && Date.now() - cached.timestamp < CACHE_TTL_MS;

  if (cacheFresh) {
    return cached.games;
  }

  if (!isFeedConfigured()) {
    console.warn(
      "[ArenaGamers] GAMEMONETIZE_FEED_URL belum diisi. Memakai game fallback."
    );
    return cached ? cached.games : FALLBACK_GAMES;
  }

  try {
    const res = await fetch(GAMEMONETIZE_FEED_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`Feed merespons status ${res.status}`);
    const data = await res.json();

    // Beberapa feed membungkus daftar game di dalam properti seperti
    // data.result atau data.games — coba beberapa kemungkinan.
    const rawList = Array.isArray(data)
      ? data
      : data.result || data.games || data.items || [];

    const games = rawList.map(normalizeGame);

    if (games.length === 0) throw new Error("Feed mengembalikan daftar kosong");

    writeCache(games);
    return games;
  } catch (err) {
    console.error("[ArenaGamers] Gagal mengambil katalog GameMonetize:", err);
    // Kalau masih ada cache lama (walau sudah basi), lebih baik pakai itu
    // daripada langsung ke fallback statis.
    return cached ? cached.games : FALLBACK_GAMES;
  }
}

/**
 * Memaksa refresh katalog dari server, mengabaikan cache.
 * Dipanggil misalnya lewat tombol "Refresh Katalog" manual.
 */
async function forceRefreshCatalog() {
  localStorage.removeItem(CACHE_KEY);
  return getGamesCatalog();
}
