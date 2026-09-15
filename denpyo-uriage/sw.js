// Bar KAMAKURA 業務アプリ — サービスワーカーの停止版(v35)
//
// これまでオフライン用に画面ファイルを端末へ保存していましたが、
// 「GitHubに新しい版を上げても端末に古い画面が出続ける」原因になっていたため、
// v35で機能をやめました。このファイルは、すでに登録されている古いものを
// 自分で解除して、保存済みの画面を消すためだけに残しています。
//
// お店のデータ(jsonbin)はもともと毎回ネットから取っているので、
// この変更でデータが消えることはありません。

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    // 保存してある画面を全部消す
    const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));
    // 自分自身の登録を解除する
    try { await self.registration.unregister(); } catch (err) {}
    // 開いている画面を最新版で読み込み直す
    const list = await self.clients.matchAll({ type: "window" });
    list.forEach(c => { try { c.navigate(c.url); } catch (err) {} });
  })());
});

// fetch には一切割り込まない(常にネットから取る)
