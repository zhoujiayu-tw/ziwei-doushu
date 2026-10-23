# 開發方向與進度

更新：2026-10-23

## 目標

一個只給自己用的命理工具：輸入出生時刻與地點，看到那一刻的真實星空，以及由同一片天空算出來的紫微斗數、八字、西洋占星三把尺；時間軸拉到今天，看三把尺怎麼走；問 Claude 時，它讀的是同一份事實。

## 已完成

| 日期 | 事 | 位置 |
|---|---|---|
| 10-23 | 升 Next 16.4.3（修 RCE）、移除未用依賴、改部署到 Cloudflare Workers（OpenNext） | `wrangler.jsonc` |
| 10-23 | `/api/interpret`、`/api/heming` 接 Claude（串流、伺服器端重排、快取斷點、備援模型） | `lib/ai/` |
| 10-23 | 綁 `bz.zhoujiayu.app`；流量限制每 IP 6 次／分、全站 60 次／分 | `lib/ai/rate-limit.ts` |
| 10-23 | iztro 2.6.1 → 2.6.3（1,824 盤輸出逐位元組相同） | |
| 10-23 | 原型 v1→v3：掛谷針 → 深色光場 → 天時地人立體空間（真實星表） | `docs/design/kakeya-prototype.html` |
| 10-23 | 星曜譜系單一真源 + 引擎指紋測試 | `lib/ziwei/star-lineage.ts`、`scripts/regression/` |
| 10-23 | 概念、架構、流程三份文件 | `docs/design/` |

## 進行中 → 下一步（依序）

1. **`lib/sky`**：接 astronomy-engine；節氣時刻、朔、月相、日月行星黃經、恆星時、ASC/MC、逆行。原型的太陽改用它。
2. **建檔表單 + 即時換算**（ux-flow §2）：這是正式版的起點。
3. **`lib/bazi`**：四柱取引擎 `fourPillars`、十神、大運、流年流月流日；每日配色。
4. **本命頁、今日頁**（ux-flow §3–4）：依原型 v3 以 React + three.js 重做，繁體。
5. **`lib/astro`**：星座、本命點、相位、外行星行運。
6. **`lib/advice`**：搬舊 app 文案並去個人化。
7. **運頁四尺度、雙人、配色頁、設定**。
8. **A 階段在地化**：臺灣 1945–1979 夏令時表 + 回歸；臺灣縣市經度補齊；介面全繁體。
9. **上線前**：Cloudflare Access（後台）、`wrangler secret put ANTHROPIC_API_KEY`、`npm run cf:deploy`。

## 待 Tim 決定

- 語料標籤「天機（北斗）」改南斗；`lib/classics` 三檔改標「白話導讀」並修 README（concept.md §8）。
- 舊 app 的個人喜忌結論（配飾表）要不要直接沿用為預設覆寫。
- 是否要跨裝置同步個人檔案（需要 Access + KV）。

## 不做

- 公開、商業化、會員、付費。
- 舊 app 的目標看板與檢核清單（留在 `ours`）。
- 飛星派層層飛化（倪師：大道至簡，只用生年四化）。
