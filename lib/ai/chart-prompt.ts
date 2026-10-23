/**
 * 把命盘整理成给 Claude 读的纯文字，以及解读 / 合盘用的系统提示。
 *
 * 只放引擎算得出来的事实（星曜、亮度、四化、大限、格局），不放断语；
 * 断语由模型依倪师体系现场推论，并被要求只引用查得到的原话。
 */

import { BRANCHES, STEMS } from '@/lib/ziwei/constants';
import { detectPatterns } from '@/lib/ziwei/patterns';
import { HEMING_METHODOLOGY } from '@/lib/ziwei/heming-knowledge';
import type { Palace, Star, ZiweiChart } from '@/lib/ziwei/types';

const LEVEL_LABEL = { excellent: '上格', good: '吉格', neutral: '中性', caution: '需留意' } as const;

function starText(s: Star): string {
  let t = s.name;
  if (s.brightnessRaw) t += `(${s.brightnessRaw})`;
  if (s.siHua) t += `化${s.siHua}`;
  return t;
}

function palaceLine(p: Palace): string {
  const gz = `${STEMS[p.stem] ?? ''}${BRANCHES[p.branch] ?? ''}`;
  const tags = [p.isMingGong && '命宫', p.isShenGong && '身宫', p.isCurrentDaXian && '当前大限'].filter(Boolean);
  const byType = (type: Star['type']) => p.stars.filter(s => s.type === type).map(starText).join('、');
  const major = byType('major') || (p.borrowedStars?.length ? `空宫（借对宫 ${p.borrowedStars.join('、')}）` : '空宫');
  const parts = [
    `主星：${major}`,
    byType('lucky') && `吉星：${byType('lucky')}`,
    byType('sha') && `煞星：${byType('sha')}`,
    byType('minor') && `杂曜：${byType('minor')}`,
    p.selfSihua?.length && `自化：${p.selfSihua.map(x => `${x.starName}化${x.siHua}`).join('、')}`,
    p.daXianAge && `大限 ${p.daXianAge[0]}–${p.daXianAge[1]} 岁`,
  ].filter(Boolean);
  const name = p.name.endsWith('宫') ? p.name : `${p.name}宫`;
  return `- ${name}（${gz}${tags.length ? '，' + tags.join('、') : ''}）${parts.join('；')}`;
}

/** 命盘的完整文字描述（不含任何解读） */
export function describeChart(chart: ZiweiChart, label = '命主'): string {
  const { birthInfo: b, lunarInfo: l } = chart;
  const lunarMonth = `${l.isLeapMonth ? '闰' : ''}${Math.abs(l.lunarMonth)}月`;
  const ordered = [...chart.palaces].sort((a, c) => a.branch - c.branch);
  const shen = chart.palaces.find(p => p.branch === chart.shenGongBranch);
  const cur = chart.daXians[chart.currentDaXianIndex];
  const patterns = detectPatterns(chart);

  const lines = [
    `### ${label}基本资料`,
    `- 性别：${b.gender === 'male' ? '男' : '女'}（${chart.yinYangGender ?? ''}）`,
    `- 公历：${b.year}-${b.month}-${b.day}，时辰：${BRANCHES[b.hour]}时`,
    `- 农历：${l.lunarYear}年${lunarMonth}${l.lunarDay}日`,
    l.fourPillars ? `- 四柱：${l.fourPillars.join(' ')}` : '',
    `- 五行局：${chart.wuxingJuName}；命主：${chart.mingZhu ?? ''}；身主：${chart.shenZhu ?? ''}`,
    `- 命宫在${BRANCHES[chart.mingGongBranch]}，身宫在${BRANCHES[chart.shenGongBranch]}${shen ? `（落${shen.name.endsWith('宫') ? shen.name : shen.name + '宫'}）` : ''}`,
    `- 目前虚岁约 ${chart.currentAge}${cur ? `，行${cur.palaceName}大限（${cur.startAge}–${cur.endAge} 岁）` : ''}`,
    '',
    `### ${label}十二宫`,
    ...ordered.map(palaceLine),
  ];
  if (patterns.length) {
    lines.push('', `### ${label}格局（引擎判定）`);
    for (const p of patterns) {
      lines.push(`- ${p.name}【${LEVEL_LABEL[p.level]}】${p.description}${p.source ? `（出处：${p.source}）` : ''}`);
    }
  }
  return lines.join('\n');
}

const COMMON_RULES = `
## 回答规则
- 一律用**繁体中文（台湾用语）**回答，使用 Markdown，标题清楚、段落简短。
- 只根据下面提供的命盘资料推论；资料里没有的星曜、四化或格局不要自行添加。
- 依倪海厦《天纪》的三合派看法：命宫为本、三方四正为用，四化以生年四化为主，不用飞星派的层层飞化。
- 引用倪师或《紫微斗数全书》时，只引用你确定逐字存在的原话；不确定就用自己的话说明，不要冠上出处。
- 六亲（父母、兄弟、子女）的判断，倪师说过「斗数批六亲本来就比较差一点」，相关分析要注明仅供参考。
- 健康只谈需要留意的方向，不做诊断；财务、法律、医疗等重大决定请对方咨询专业人士。
- 语气温和、具体、可执行，避免恐吓式断语；命理是参考，不是定论。
`;

export const INTERPRET_SYSTEM = `你是一位熟悉倪海厦《天纪》紫微斗数体系的解盘老师，正在为使用者解读他的紫微斗数命盘，并回答他的追问。
${COMMON_RULES}`;

export const HEMING_SYSTEM = `你是一位熟悉倪海厦《天纪》紫微斗数体系的解盘老师，正在为两个人做合盘分析。
${COMMON_RULES}
## 合盘方法
${HEMING_METHODOLOGY}`;
