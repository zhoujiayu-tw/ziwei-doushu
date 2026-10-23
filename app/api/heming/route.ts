import { describeChart, HEMING_SYSTEM } from '@/lib/ai/chart-prompt';
import { BadRequest, chartFromBody, jsonError, streamClaude } from '@/lib/ai/claude-stream';

export const dynamic = 'force-dynamic';

const DEFAULT_QUESTION = '请依合盘方法，完整分析这两张命盘的契合度：先看双方命宫、夫妻宫、福德宫的对应，再谈相处模式、需要磨合之处与具体建议。';

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) return jsonError(503, '尚未设定 ANTHROPIC_API_KEY');
  let body: { chartA?: unknown; chartB?: unknown; question?: unknown };
  try {
    body = await req.json();
  } catch {
    return jsonError(400, '请求格式不正确');
  }
  try {
    const chartA = chartFromBody(body.chartA);
    const chartB = chartFromBody(body.chartB);
    const question = typeof body.question === 'string' && body.question.trim()
      ? body.question.trim().slice(0, 1000)
      : DEFAULT_QUESTION;
    const today = new Date().toISOString().slice(0, 10);
    return streamClaude({
      system: HEMING_SYSTEM,
      context: `今天日期：${today}\n\n${describeChart(chartA, '甲方')}\n\n${describeChart(chartB, '乙方')}`,
      messages: [{ role: 'user', content: question }],
      signal: req.signal,
    });
  } catch (e) {
    if (e instanceof BadRequest) return jsonError(400, e.message);
    throw e;
  }
}
