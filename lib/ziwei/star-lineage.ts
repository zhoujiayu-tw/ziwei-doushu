/**
 * 星曜譜系：斗屬（北斗／南斗／中天）、安星鏈、天文對應、古籍出處 —— 單一真源。
 *
 * 排盤運算（algorithm.ts）完全不讀這張表；它只供解讀、文案、視覺化使用。
 * 改這張表不會改變任何命盤輸出，由 scripts/regression/engine-fingerprint.test.ts 守住；
 * 表本身的內部一致性由 scripts/regression/star-lineage.test.ts 守住。
 *
 * 口徑：以《紫微斗數全書》卷一〈諸星問答〉為準。
 * `verified: true` 表示 repo 內（docs/tianji-ziwei 勘誤或 lib/classics）有逐字引文；
 * `verified: false` 表示依通行說法，待對照善本逐字補上。
 *
 * 星名用引擎的簡體寫法，與 algorithm.ts / constants.ts 一致。
 */

export type Dipper = '北斗' | '南斗' | '中天';
export type Chain = '紫微系' | '天府系';

export interface StarLineage {
  name: string;
  dipper: Dipper;
  /** 在該斗中的序號；主星／令星為 0 */
  order?: number;
  /** 十四主星才有：安星鏈與相對鏈首的偏移（紫微系逆行取負，天府系順行取正） */
  chain?: Chain;
  chainOffset?: number;
  /** 天文對應（北斗七星的現代星名） */
  skyName?: string;
  /** 古籍逐字引文（有的話） */
  quote?: string;
  source: string;
  verified: boolean;
}

/** 北斗七星：道教星名 ↔ 中國星官名，從斗魁到杓尾 */
export const BEIDOU_SEVEN: ReadonlyArray<readonly [name: string, skyName: string]> = [
  ['贪狼', '天枢'],
  ['巨门', '天璇'],
  ['禄存', '天玑'],
  ['文曲', '天权'],
  ['廉贞', '玉衡'],
  ['武曲', '开阳'],
  ['破军', '摇光'],
];

/** 紫微系從紫微起逆行的偏移（地支遞減） */
export const ZIWEI_CHAIN: ReadonlyArray<readonly [name: string, offset: number]> = [
  ['紫微', 0], ['天机', -1], ['太阳', -3], ['武曲', -4], ['天同', -5], ['廉贞', -8],
];
/** 天府系從天府起順行的偏移（地支遞增） */
export const TIANFU_CHAIN: ReadonlyArray<readonly [name: string, offset: number]> = [
  ['天府', 0], ['太阴', 1], ['贪狼', 2], ['巨门', 3], ['天相', 4], ['天梁', 5], ['七杀', 6], ['破军', 10],
];
/** 天府位置 = 紫微位置對「寅—申」軸的鏡像 */
export const tianfuFromZiwei = (ziweiBranch: number): number => ((4 - ziweiBranch) % 12 + 12) % 12;

const QUANSHU = '《紫微斗数全书》卷一〈诸星问答〉';
const ERRATA = 'docs/tianji-ziwei 勘误（引《全书》）';

export const STAR_LINEAGE: Record<string, StarLineage> = {
  // ── 北斗 ──
  '紫微': { name: '紫微', dipper: '北斗', order: 0, chain: '紫微系', chainOffset: 0, source: `${QUANSHU}：北斗主星、帝座`, verified: false },
  '贪狼': { name: '贪狼', dipper: '北斗', order: 1, chain: '天府系', chainOffset: 2, skyName: '天枢', quote: '贪狼北斗解厄之神，第一星也', source: ERRATA, verified: true },
  '巨门': { name: '巨门', dipper: '北斗', order: 2, chain: '天府系', chainOffset: 3, skyName: '天璇', source: `${QUANSHU}：北斗第二星`, verified: false },
  '禄存': { name: '禄存', dipper: '北斗', order: 3, skyName: '天玑', source: '北斗七星道教星名；《全书》待对', verified: false },
  '文曲': { name: '文曲', dipper: '北斗', order: 4, skyName: '天权', source: '北斗七星道教星名；《全书》待对', verified: false },
  '廉贞': { name: '廉贞', dipper: '北斗', order: 5, chain: '紫微系', chainOffset: -8, skyName: '玉衡', source: `${QUANSHU}：北斗第五星`, verified: false },
  '武曲': { name: '武曲', dipper: '北斗', order: 6, chain: '紫微系', chainOffset: -4, skyName: '开阳', source: `${QUANSHU}：北斗第六星`, verified: false },
  '破军': { name: '破军', dipper: '北斗', order: 7, chain: '天府系', chainOffset: 10, skyName: '摇光', quote: '破军属水，北斗第七星也', source: ERRATA, verified: true },
  // ── 南斗 ──
  '天府': { name: '天府', dipper: '南斗', order: 0, chain: '天府系', chainOffset: 0, quote: '天府令星', source: '骨髓赋（lib/classics/data/gusuifu.ts）；「南斗令星」待对善本', verified: true },
  '天梁': { name: '天梁', dipper: '南斗', order: 2, chain: '天府系', chainOffset: 5, source: `${QUANSHU}：南斗第二星`, verified: false },
  '天机': { name: '天机', dipper: '南斗', order: 3, chain: '紫微系', chainOffset: -1, source: `${QUANSHU}：南斗第三星`, verified: false },
  '天同': { name: '天同', dipper: '南斗', order: 4, chain: '紫微系', chainOffset: -5, quote: '天同南斗益算保生之星', source: ERRATA, verified: true },
  '天相': { name: '天相', dipper: '南斗', order: 5, chain: '天府系', chainOffset: 4, source: `${QUANSHU}：南斗第五星`, verified: false },
  '七杀': { name: '七杀', dipper: '南斗', order: 6, chain: '天府系', chainOffset: 6, quote: '七杀南斗第六星也', source: ERRATA, verified: true },
  // ── 中天 ──
  '太阳': { name: '太阳', dipper: '中天', chain: '紫微系', chainOffset: -3, source: `${QUANSHU}：中天`, verified: false },
  '太阴': { name: '太阴', dipper: '中天', chain: '天府系', chainOffset: 1, source: `${QUANSHU}：中天主星`, verified: false },
  // ── 身主會用到的輔星 ──
  '文昌': { name: '文昌', dipper: '南斗', source: '通行说法；《全书》待对', verified: false },
};

export const MAJOR_STARS = ['紫微', '天机', '太阳', '武曲', '天同', '廉贞', '天府', '太阴', '贪狼', '巨门', '天相', '天梁', '七杀', '破军'] as const;

export const starDipper = (name: string): Dipper | undefined => STAR_LINEAGE[name]?.dipper;
export const starSkyName = (name: string): string | undefined => STAR_LINEAGE[name]?.skyName;
