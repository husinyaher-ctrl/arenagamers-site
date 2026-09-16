/**
 * ArenaGamers - Game Catalog Loader
 * Menggunakan feed resmi dari GameMonetize RSS Builder:
 * https://gamemonetize.com/feed.php?format=0&num=20&page=1
 *
 * Priority:
 *  1. Live feed GameMonetize
 *  2. Fallback ke assets/json/data-game.json
 */

const GM_FEED_URL =
  'https://gamemonetize.com/feed.php?format=0&num=50&page=1';

async function getGamesCatalog() {
  // 1) Coba live feed dulu
  try {
    const res = await fetch(GM_FEED_URL, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        console.log('[ArenaGamers] Live feed OK:', data.length, 'game');
        return data.map(normalizeGame);
      }
    }
  } catch (e) {
    console.warn('[ArenaGamers] Live feed gagal, pakai data lokal:', e.message);
  }

  // 2) Fallback lokal
  const res = await fetch('./assets/json/data-game.json?v=' + Date.now(), {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('data-game.json tidak ketemu');
  const data = await res.json();
  return Array.isArray(data) ? data.map(normalizeGame) : [];
}

/** Samakan struktur field dari feed resmi / lokal */
function normalizeGame(g) {
  return {
    id: String(g.id || ''),
    title: String(g.title || 'Untitled').replace(/&amp;/g, '&'),
    thumb: g.thumb || g.thumbnail || '',
    url: g.url || g.game_url || '',
    category: g.category || g.categories || 'Arcade',
    description: g.description || '',
    width: g.width || '800',
    height: g.height || '600',
  };
}

function getThumb(g) {
  return g.thumb || '';
}

function getGameId(g) {
  return String(g.id);
}

function getGameTitle(g) {
  return g.title || 'Untitled';
                            }
