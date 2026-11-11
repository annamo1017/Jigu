// 콕콕 놀이터 - 오프라인 저장 (같은 저장소의 다른 앱은 건드리지 않아요)
// 게임을 고친 뒤 다시 올릴 때는 아래 버전 숫자를 하나 올려 주세요.
const CACHE = 'kokkok-app-v26';
const FILES = ['./same-picture.html', './kokkok-manifest.json', './kokkok-icon-192.png', './kokkok-icon-512.png'];
const MINE = FILES.map(f => new URL(f, self.location).pathname);

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(FILES.map(f => fetch(f, { cache: 'reload' }).then(r => { if (r.ok) return c.put(f, r); }))))
      .then(() => self.skipWaiting())
  );
});

// 예전 콕콕 저장분만 지우기 (다른 앱의 저장분은 그대로)
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('kokkok') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// 콕콕 파일만: 인터넷이 되면 서버의 새 버전, 안 되면 저장해 둔 것
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin || !MINE.includes(url.pathname)) return;
  e.respondWith(
    fetch(url.pathname, { cache: 'no-cache' })
      .then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(url.pathname, copy)); }
        return res;
      })
      .catch(() => caches.match(url.pathname).then(r => r || caches.match('./same-picture.html')))
  );
});
