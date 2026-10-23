# 掛谷紫微 · bz.zhoujiayu.app

一個人用的命理工具。輸入出生時刻與地點，看到那一刻的真實星空，以及由同一片天空算出來的三把尺：紫微斗數、八字、西洋占星。時間軸拉到今天，看三把尺怎麼走；問 Claude 時，它讀的是同一份事實。

私有專案，不公開、不商業化。

## 文件

| 要知道什麼 | 讀 |
|---|---|
| 現在做到哪、下一步 | [`docs/ROADMAP.md`](docs/ROADMAP.md) |
| 這個站想說什麼：天時地人、針的階層、掛谷隱喻 | [`docs/design/concept.md`](docs/design/concept.md) |
| 八字／紫微／西洋的共同根源與分層架構 | [`docs/design/unified-architecture.md`](docs/design/unified-architecture.md) |
| 從輸入出生資料到每一頁 | [`docs/design/ux-flow.md`](docs/design/ux-flow.md) |
| 用了哪些資料與方法、授權、精度 | [`docs/SOURCES.md`](docs/SOURCES.md) |
| 決定過的事 | [`docs/DECISIONS.md`](docs/DECISIONS.md) |
| 給 Claude Code 的工作規則 | [`CLAUDE.md`](CLAUDE.md) |
| 視覺原型（v3，天時地人立體空間） | [`docs/design/kakeya-prototype.html`](docs/design/kakeya-prototype.html) |

## 跑起來

```bash
npm ci
cp .env.example .env.local     # 填 ANTHROPIC_API_KEY（只有 AI 解讀需要）
npm run dev                    # http://localhost:3000
npm run typecheck && npm test  # 型別 + 11 組排盤回歸（含引擎指紋）
```

部署：`npx wrangler secret put ANTHROPIC_API_KEY`，再 `npm run cf:deploy`；上線前在 Cloudflare 後台替 `bz.zhoujiayu.app` 掛 Access。

## 來源與授權

- 排盤引擎改自 [Renhuai123/ziwei-doushu](https://github.com/Renhuai123/ziwei-doushu)（MIT，作者 王多魚AI），內核 [iztro](https://github.com/SylarLong/iztro) + lunar-javascript。引擎層持續從上游 cherry-pick。
- `docs/tianji-ziwei/` 倪海廈《天紀》原話：CC BY-NC-SA 4.0，僅非商業使用。
- 星表與中國星官：[d3-celestial](https://github.com/ofrohn/d3-celestial)（BSD-3）。
- 完整清單見 `docs/SOURCES.md`。命理內容僅供參考。
