async function getGamesCatalog(){
  const paths = ['./assets/json/data-game.json','assets/json/data-game.json'];
  for(const p of paths){
    try{
      const res = await fetch(p+'?v='+Date.now());
      if(res.ok) return await res.json();
    }catch(e){}
  }
  return [];
}
function forceRefreshCatalog(){ return getGamesCatalog(); }
