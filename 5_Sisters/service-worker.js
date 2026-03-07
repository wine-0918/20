const CACHE_NAME = 'gotoubun-shiori-v3';
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
});

// リクエスト時にキャッシュから返す
self.addEventListener('fetch', event => {
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
});
