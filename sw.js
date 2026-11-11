// 콕콕 놀이터 - 오프라인 저장
// 게임을 고친 뒤 다시 올릴 때는 아래 버전 숫자를 하나 올려 주세요.
const CACHE = 'kokkok-v22';
const FILES = ['./same-picture.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  // 새 파일을 서버에서 직접(캐시 건너뛰고) 받아 저장
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(FILES.map(f => fetch(f, { cache: 'reload' }).then(r => { if (r.ok) return c.put(f, r); }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// 인터넷이 되면 늘 서버에 새 버전이 있는지 물어보고, 안 되면 저장해 둔 것으로 열기
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req.url, { cache: 'no-cache' })
      .then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('./same-picture.html')))
  );
});
