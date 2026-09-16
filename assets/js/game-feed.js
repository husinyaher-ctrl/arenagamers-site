const GAMEMONETIZE_FEED_URL = "";
async function getGamesCatalog(){
  const files = [
    './assets/json/data-game.json',
    './assets/json/game-data.json',
    './assets/json/data-games.json',
    'assets/json/data-game.json'
  ];
  for(const path of files){
    try{
      const res = await fetch(path + '?v=' + Date.now(), {cache:'no-store'});
      if(res.ok){
        const data = await res.json();
        if(Array.isArray(data) && data.length > 0){
          console.log('Loaded', data.length, 'games from', path);
          return data;
        }
      }
    }catch(e){ console.warn('fail', path, e); }
  }
  console.error('Semua path data-game.json gagal');
  return [];
}
function getThumb(g){ return g.thumb || g.thumbnail || g.image || ''; }
function getGameUrl(g){ return g.url || g.game_url || ''; }
function getGameId(g){ return String(g.id || g.slug || ''); }
function getGameTitle(g){ return g.title || 'Game'; }
