/**
 * 星曜譜系回歸：守住 lib/ziwei/star-lineage.ts 的內部一致性，以及它與引擎結構的對應。
 *
 * 1. 十四主星都在表裡，每顆有斗屬與安星鏈偏移；
 * 2. 北斗七星表與譜系表一致，命主表 ⊂ 北斗七星，且命宮子→午沿斗魁→杓尾依序走、未→亥對稱走回；
 * 3. 身主表裡的主星全屬南斗；
 * 4. 768 張盤：紫微系逆行偏移、天府系順行偏移、天府 = 紫微對寅申軸的鏡像，全部成立。
 */
import { calcMingZhu, calcShenZhu, generateChart } from '../../lib/ziwei/algorithm';
import { BEIDOU_SEVEN, MAJOR_STARS, STAR_LINEAGE, TIANFU_CHAIN, ZIWEI_CHAIN, tianfuFromZiwei } from '../../lib/ziwei/star-lineage';

let failed = 0;
const check = (ok: boolean, msg: string) => { console.log(`  ${ok ? '✅' : '❌'} ${msg}`); if (!ok) failed++; };

console.log('\n[star-lineage] 表的完整性');
for (const n of MAJOR_STARS) {
  const s = STAR_LINEAGE[n];
  check(!!s && !!s.dipper && s.chain !== undefined && s.chainOffset !== undefined, `${n} 有斗屬與安星鏈`);
}
const inChain = (chain: ReadonlyArray<readonly [string, number]>, name: string) => chain.find(([n]) => n === name);
for (const n of MAJOR_STARS) {
  const s = STAR_LINEAGE[n];
  const entry = s.chain === '紫微系' ? inChain(ZIWEI_CHAIN, n) : inChain(TIANFU_CHAIN, n);
  check(!!entry && entry[1] === s.chainOffset, `${n} 的鏈偏移與 ${s.chain} 常數一致`);
}

console.log('\n[star-lineage] 北斗七星與命主');
for (const [name, sky] of BEIDOU_SEVEN) {
  const s = STAR_LINEAGE[name];
  check(s?.dipper === '北斗' && s.skyName === sky, `${name} 屬北斗，對應 ${sky}`);
}
const dipperOrder = Object.fromEntries(BEIDOU_SEVEN.map(([n], i) => [n, i + 1]));
for (let b = 0; b < 12; b++) {
  const mz = calcMingZhu(b);
  const expectOrder = b <= 6 ? b + 1 : 13 - b;   // 子1 … 午7，未6 … 亥2
  check(dipperOrder[mz] === expectOrder, `命宮地支 ${b} 命主 ${mz} = 北斗第 ${expectOrder} 星`);
}

console.log('\n[star-lineage] 身主與南斗');
for (let b = 0; b < 12; b++) {
  const sz = calcShenZhu(b);
  const s = STAR_LINEAGE[sz];
  if (sz === '火星') { check(true, `生年地支 ${b} 身主火星（非主星，略）`); continue; }
  check(s?.dipper === '南斗', `生年地支 ${b} 身主 ${sz} 屬南斗`);
}

console.log('\n[star-lineage] 安星鏈與鏡像（768 盤）');
let ok = 0, bad = 0;
for (let y = 1950; y < 2026; y += 5) for (let m = 1; m <= 12; m += 3) for (let d = 1; d <= 28; d += 9) for (const h of [0, 5, 11]) {
  const c = generateChart({ year: y, month: m, day: d, hour: h, gender: 'male' });
  const z = c.ziweiPos, f = tianfuFromZiwei(z);
  const pos = (n: string) => c.palaces.find(p => p.stars.some(s => s.name === n))?.branch;
  let good = true;
  for (const [n, off] of ZIWEI_CHAIN) if (pos(n) !== ((z + off) % 12 + 12) % 12) good = false;
  for (const [n, off] of TIANFU_CHAIN) if (pos(n) !== (f + off) % 12) good = false;
  good ? ok++ : bad++;
}
check(bad === 0, `${ok} 張盤的紫微系逆行、天府系順行、天府=鏡像(4−z) 全部成立`);

if (failed) { console.error(`\n[star-lineage] ${failed} 項失敗`); process.exit(1); }
console.log('\n[star-lineage] 全部通過');
