async function getGamesCatalog(){
  const res = await fetch('./assets/json/data-game.json?v='+Date.now(), {cache:'no-store'});
  if(!res.ok) throw new Error('data-game.json tidak ketemu');
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}
function getThumb(g){ return g.thumb || ''; }
function getGameId(g){ return String(g.id); }