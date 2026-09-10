// Bar KAMAKURA 業務アプリ — オフライン用サービスワーカー
// アプリの画面ファイルだけを端末に保存します。
// お店のデータ(jsonbin)は必ずネット経由で取りに行くので、古いデータが表示されることはありません。

const CACHE = "bk-app-v27";
const SHELL = [
  "./",
  "./index.html",
  "./price.html",
  "./slip.html",
  "./records.html",
  "./manifest.json",
  "./icon-32.png",
  "./icon-180.png",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-512-maskable.png"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  // 他サイト(jsonbin など)は常にネットワークへ。キャッシュしない。
  if (url.origin !== self.location.origin) return;

  // 自サイトのファイルはキャッシュ優先。裏で最新版を取り直す。
  e.respondWith(
    caches.match(req).then(hit => {
      const fresh = fetch(req)
        .then(res => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then(c => c.put(req, copy));
          }
          return res;
        })
        .catch(() => hit);
      return hit || fresh;
    })
  );
});
