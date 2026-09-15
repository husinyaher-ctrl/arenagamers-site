// ArenaGamers - clean dummy SW for GameMonetize review
self.addEventListener('install', (e) => self.skipWaiting());
self.addEventListener('activate', (e) => {
  self.registration.unregister();
  console.log('SW cleaned');
});