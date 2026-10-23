import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import staticAssetsIncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache';

// 站內頁面都是建置時預先產生、不做 revalidate，直接從靜態資產讀，不需要另外開 R2 bucket。
// 快取檔由 `opennextjs-cloudflare deploy / preview` 的 populateCache 步驟放進 assets；
// 只跑 build 再直接用 `wrangler dev` 會每次重新渲染並報「read-only cache」錯誤。
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true,
});
