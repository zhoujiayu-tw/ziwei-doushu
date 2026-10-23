# 資料、方法與授權

每一項寫清楚：用在哪、來源、授權、精度或已知限制。

## 排盤引擎

| 項 | 用途 | 來源 | 授權 | 精度／限制 |
|---|---|---|---|---|
| iztro 2.6.3 | 紫微安星、四化、亮度、運限 | npm `iztro`（SylarLong） | MIT | 本專案以 `config.brightness` 全量覆寫亮度表（《全書》口徑）；年界用正月初一（`yearDivide: normal`） |
| lunar-javascript 1.7.7 | 農曆、節氣、四柱、閏月 | npm `lunar-javascript`（6tail） | MIT | 曆表可靠區間 1900–2100；節氣時刻對照太陽黃經公式誤差 < 0.02° ✔ |
| 上游引擎層 `lib/ziwei/` | 真太陽時、中國夏令時 1986–1991、閏月四種口徑、晚子時換日、十二神煞、格局規則 | `Renhuai123/ziwei-doushu` | MIT | 臺灣夏令時 1945–1979 尚未實作（A 階段） |
| 引擎指紋 | 1,824 盤 SHA-256 `18a73e90…b1b4` | 本專案 | | 任何排盤口徑變動都會改變它 |

## 星曜與古籍

| 項 | 用途 | 來源 | 授權 | 狀態 |
|---|---|---|---|---|
| `lib/ziwei/star-lineage.ts` | 斗屬、序號、安星鏈、北斗七星天文對應 | 本專案，口徑依《紫微斗數全書》卷一〈諸星問答〉 | MIT | 14 顆中 4 顆有逐字引文，其餘待對善本 |
| `docs/tianji-ziwei/` | 倪海廈《天紀》紫微原話 1,848 條（含勘誤） | `Renhuai123/nihai-tianji-corpus` | **CC BY-NC-SA 4.0**，非商業 | 標籤「天機（北斗）」與《全書》不符，待修 |
| `lib/classics/data/` | 骨髓賦、全集、全書的**白話整理** | 上游 | 上游標 MIT（內容非原文） | 不是古籍原文；「南斗六星論／北斗六星論」章名誤標，待修 |
| `lib/nihai/` | 倪師傳記、三紀模組摘要 | 上游 | MIT 名義，內容源自倪師課程 | 只作非商業使用 |
| 13 維解讀資料集 v4.0 | 可作 RAG／微調語料（尚未使用） | 上游 Releases `v4.0-13d` | CC BY 4.0，需標註來源 | 以舊亮度預設生成，與現行引擎有少量差異 |

## 天文

| 項 | 用途 | 來源 | 授權 | 精度 |
|---|---|---|---|---|
| astronomy-engine 2.1.19（規劃中） | 日月行星黃經、節氣時刻、朔、逆行、ASC/MC | npm `astronomy-engine`（Don Cross） | MIT | 行星 ±1′ 等級，足夠占星用途 |
| 太陽黃經低精度公式 | 原型 HUD、舊 app | 天文年曆常用近似式 | 公式 | 太陽 < 0.01°、月亮 < 0.3°（舊 app 已對照 Swiss Ephemeris） |
| 星表 1,608 顆（視星等 < 5） | 3D 天空 | d3-celestial `stars.6.json`（Hipparcos 衍生） | BSD-3（Olaf Frohn） | J2000 座標；未做歲差校正到出生年（< 0.5°，視覺可忽略） |
| 中國星官連線、星官名 | 3D 天空的紫微垣、北斗、斗宿等 | d3-celestial `constellations.lines.cn.json`、`constellations.cn.json` | BSD-3 | 轉繁體（opencc-js） |
| 地平座標轉換 | 恆星時 = GMST + 經度；赤道→地平旋轉矩陣 | 標準公式（Meeus） | | 原型用 J2000 不加章動，誤差分級 |
| 歲差 | 概念章節 | 25,772 年／圈 | | 僅用於說明 |

## 八字（規劃中）

| 項 | 方法 | 驗證 |
|---|---|---|
| 四柱 | 直接取引擎 `lunarInfo.fourPillars`（節氣四柱） | 已在引擎指紋內 |
| 十神 | 日主與他干的五行生剋 × 陰陽同異 | 對照舊 app `tenGod()` 100 組 |
| 大運 | 陽男陰女順、陰男陽女逆；起運以出生到節的天數 ÷ 3 | 待寫回歸 |
| 配色 | 五行色票 × 日主喜忌 × 當日／當月五行 | 純函數表格測試 |

## 西洋占星（規劃中）

| 項 | 方法 | 驗證 |
|---|---|---|
| 星座 | 回歸黃道，λ ÷ 30 | 與節氣中氣同線（unified-architecture §2.1）✔ |
| 上升／天頂 | 地方恆星時 + 緯度 + 黃赤交角 | 對照舊 app 女命本命點 |
| 相位 | 合 0°、六合 60°、刑 90°、拱 120°、沖 180°；太陽軌 6°、月亮軌 3° | 沿用舊 app 規則 |
| 逆行 | 行星黃經逐日遞減 | 對照舊 app 2026–2028 水逆區間 |

## 介面與視覺

| 項 | 來源 | 授權 |
|---|---|---|
| three.js r147 + UnrealBloom、Afterimage 後製 | three.js | MIT |
| 字體：霞鶩文楷 TC、Noto Sans TC、IBM Plex Mono | Google Fonts | OFL |
| opencc-js | 簡→繁 | MIT / Apache-2.0 |
| 原型 `docs/design/kakeya-prototype.html` | 本專案 | |

## 部署

| 項 | 說明 |
|---|---|
| Cloudflare Workers + OpenNext 1.20 | 靜態頁預先產生、`populateCache` 放進 assets；Worker 約 1.9 MB gzip |
| Rate Limiting binding | 每 IP 6 次／分、全站 60 次／分（近似、各機房分開計） |
| Cloudflare Access | 上線前在後台掛（wrangler token 無此權限） |
| Claude API | `claude-opus-5-5`、effort medium、伺服器端備援模型；金鑰用 `wrangler secret` |
