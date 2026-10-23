# bz — 掛谷紫微（bz.zhoujiayu.app）

Tim 一個人用的命理工具：以出生時刻的真實星空為中心，統整紫微斗數、八字、西洋占星。不公開、repo 私有。
改自開源專案 `Renhuai123/ziwei-doushu`（MIT），排盤內核 iztro + lunar-javascript。

## 開工先讀

1. `docs/ROADMAP.md`：現在做到哪、下一步、待 Tim 決定的事。
2. `docs/design/concept.md`：這個站想說什麼（天時地人、針的階層、掛谷隱喻的邊界）。
3. `docs/design/unified-architecture.md`：八字／紫微／西洋的共同根源與分層架構。
4. `docs/design/ux-flow.md`：從輸入出生資料到每一頁。
5. `docs/SOURCES.md`：用了哪些資料與方法、各自的授權與精度。
6. `docs/DECISIONS.md`：決定紀錄，改方向前先看有沒有已經決定過。

## 硬線

- **排盤口徑**：改動 `lib/ziwei/` 的任何運算必須跑 `npm test`。`engine-fingerprint` 變了，commit 訊息要寫新指紋與依據（古籍原文或對照盤）；只是改分類、文案、介面，指紋必須不變。
- **出生資料不進 repo**：個人檔案只存瀏覽器 localStorage；程式碼、文件、測試裡不出現任何真人的出生資料（範例一律用 1990-06-15 午時 女 這組）。
- **金鑰不進 repo**：`ANTHROPIC_API_KEY` 用 `wrangler secret put`；本機用 `.env.local`。
- **授權**：代碼 MIT（保留上游 LICENSE）；`docs/tianji-ziwei/`（倪師原話）CC BY-NC-SA，只做非商業使用；`lib/classics/data/` 三個檔是白話整理，不是古籍原文，不得標為公版原文；星表與星官資料 d3-celestial（BSD-3）。
- **引文**：任何標「倪師說」「《全書》云」的句子，必須逐字可查；查不到就用自己的話。`lib/ziwei/star-lineage.ts` 的 `verified` 欄位是這條規則的落實。
- **語言**：介面與新文件用繁體中文（台灣用語）；引擎程式碼內的星名沿用上游簡體寫法，不改（改了會動到 iztro 的對照）。
- **不公開**：`bz.zhoujiayu.app` 上線前要在 Cloudflare 後台掛 Access（wrangler 的 token 沒有 Access 權限，只能在後台做）。

## 指令

```
npm run typecheck    # next typegen + tsc
npm test             # 11 組回歸（排盤完整性、夏令時、立春、星曜譜系、引擎指紋…）
npm run build        # next build
npm run cf:preview   # OpenNext build + 本機 Worker 預覽（含靜態快取）
npm run cf:deploy    # 部署到 Cloudflare Workers（bz.zhoujiayu.app）
```

## 工作方式

- 分支開發、合進 `main` 前跑過 typecheck + test + build。小的文件修改可直接推 `main`。
- 上游同步：`git fetch upstream`，只 cherry-pick `lib/ziwei/`、`scripts/regression/` 的引擎層更新；上游的 README、介面不跟。
- 原型檔在 `docs/design/kakeya-prototype.html`，是設計依據，不是產品程式碼。
- 寫文件的標記：✔ 程式裡驗證過；📜 古籍或文獻逐字；◇ 類比或推想。

## 目錄

```
app/                 Next.js 16 App Router；/api/interpret、/api/heming 接 Claude
components/          上游 Demo 介面（將依原型重做）
lib/ziwei/           排盤引擎（上游，持續同步）+ star-lineage.ts（本專案）
lib/ai/              Claude 串流、命盤→文字、流量限制
lib/classics/        白話導讀三篇（非原文）
lib/sky|bazi|astro|advice/   規劃中，見 unified-architecture.md
scripts/regression/  回歸測試
docs/design/         概念、架構、流程、原型
docs/tianji-ziwei/   倪師原話語料（CC BY-NC-SA）
wrangler.jsonc, open-next.config.ts   Cloudflare 部署
```
