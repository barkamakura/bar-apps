// Bar KAMAKURA 業務アプリ — オフライン用サービスワーカー
// アプリの画面ファイルだけを端末に保存します。
// お店のデータ(jsonbin)は必ずネット経由で取りに行くので、古いデータが表示されることはありません。
// 画面のファイルもネット優先。オフラインのときだけ保存分を使います。

const CACHE = "bk-app-v34";
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

  // 画面のファイルは「ネット優先」。
  // キャッシュ優先にしていたせいで、GitHubに新しい版を上げても
  // 端末には古い画面が出続けることがあった(v32で変更)。
  // ネットがつながらないときだけ、保存してあるものを出す。
  e.respondWith(
    fetch(req)
      .then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req).then(hit => hit || Response.error()))
  );
});
