// games-feed.js - baca file JSON lokal (format=0 = JSON)
async function getGamesCatalog(){
  try{
    const res = await fetch('./assets/data/games.json?v='+Date.now());
    if(!res.ok) throw new Error('games.json not found');
    const data = await res.json();
    return data;
  }catch(e){
    console.error('Gagal load JSON:', e);
    return [];
  }
}
function forceRefreshCatalog(){ return getGamesCatalog(); }
