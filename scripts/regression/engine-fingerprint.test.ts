/**
 * 排盤引擎指紋：1,824 張盤（1950–2025 × 12 月 × 男女，日與時辰由年月決定）的 SHA-256。
 *
 * 用途：區分「改了分類／文案／介面」與「改了排盤口徑」。
 *  - 前者指紋必須不變（例如 lib/ziwei/star-lineage.ts 怎麼改都不該動到這裡）；
 *  - 後者指紋必變，請在 commit 訊息寫上新指紋與依據（古籍原文或對照盤），再更新下面的常數。
 *
 * 只取與「今天」無關的欄位（isCurrentDaXian、currentAge 會隨日期變，排除）。
 */
import { createHash } from 'node:crypto';
import { generateChart } from '../../lib/ziwei/algorithm';

export const ENGINE_FINGERPRINT = '18a73e90b1ded9f21742da23ad675d3296778427b85e82a0ae15ee62d586b1b4';

const h = createHash('sha256');
let n = 0;
for (let y = 1950; y < 2026; y++) for (let m = 1; m <= 12; m++) for (const g of ['male', 'female'] as const) {
  const c = generateChart({ year: y, month: m, day: 1 + ((y * 7 + m) % 28), hour: (y + m) % 12, gender: g });
  h.update(JSON.stringify({
    lunar: c.lunarInfo, ming: c.mingGongBranch, shen: c.shenGongBranch, ju: c.wuxingJu, zw: c.ziweiPos,
    mz: c.mingZhu, sz: c.shenZhu, yy: c.yinYangGender,
    palaces: c.palaces.map(p => ({ b: p.branch, s: p.stem, n: p.name, dx: p.daXianAge, m: p.isMingGong, sh: p.isShenGong, self: p.selfSihua, borrow: p.borrowedStars, stars: p.stars })),
    daXians: c.daXians.map(d => ({ a: d.startAge, z: d.endAge, b: d.palaceBranch, s: d.stemIndex, h: d.siHua })),
  }));
  n++;
}
const got = h.digest('hex');
console.log(`[engine-fingerprint] ${n} 張盤 → ${got}`);
if (got !== ENGINE_FINGERPRINT) {
  console.error(`[engine-fingerprint] ❌ 指紋改變（預期 ${ENGINE_FINGERPRINT}）。若是刻意改排盤口徑，請更新常數並在 commit 寫明依據。`);
  process.exit(1);
}
console.log('[engine-fingerprint] ✅ 與上次一致：這次改動沒有動到排盤結果');
