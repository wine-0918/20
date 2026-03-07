const CACHE_NAME = 'gotoubun-shiori-v20260307-2';
const urlsToCache = [
  './html/quintuplets.html',
  './css/quintuplets.css',
  './js/quintuplets.js',
  './data/schedule_data.json',
  '../Pictures/5_sisters/itika.png',
  '../Pictures/5_sisters/nino.png',
  '../Pictures/5_sisters/miku.png',
  '../Pictures/5_sisters/yotuba.png',
  '../Pictures/5_sisters/ituki.png',
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=Noto+Serif+JP:wght@300;500;700&display=swap'
];

// インストール時にキャッシュ
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );

  self.skipWaiting();
});

// ページ側からの指示で待機中SWを即時有効化
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// リクエスト時にキャッシュから返す
self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);

  // 画面本体とデータは常に最新を優先（network first）
  const isScheduleData = requestUrl.pathname.endsWith('/data/schedule_data.json');
  const isAppShell =
    event.request.mode === 'navigate' ||
    requestUrl.pathname.endsWith('.html') ||
    requestUrl.pathname.endsWith('.js') ||
    requestUrl.pathname.endsWith('.css');

  if (isScheduleData || isAppShell) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // キャッシュにあればそれを返し、なければネットワークから取得
        if (response) {
          return response;
        }
        
        return fetch(event.request).then(
          response => {
            // レスポンスが有効かチェック
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // レスポンスをクローンしてキャッシュに保存
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

// 古いキャッシュを削除
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  event.waitUntil(self.clients.claim());
});
