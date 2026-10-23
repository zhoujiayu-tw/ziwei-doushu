import { describeChart, INTERPRET_SYSTEM } from '@/lib/ai/chart-prompt';
import { checkAiRateLimit } from '@/lib/ai/rate-limit';
import { BadRequest, chartFromBody, jsonError, messagesFromBody, streamClaude } from '@/lib/ai/claude-stream';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) return jsonError(503, '尚未设定 ANTHROPIC_API_KEY');
  const limited = await checkAiRateLimit(req);
  if (limited) return limited;
  let body: { chart?: unknown; messages?: unknown };
  try {
    body = await req.json();
  } catch {
    return jsonError(400, '请求格式不正确');
  }
  try {
    const chart = chartFromBody(body.chart);
    const messages = messagesFromBody(body.messages);
    const today = new Date().toISOString().slice(0, 10);
    return streamClaude({
      system: INTERPRET_SYSTEM,
      context: `今天日期：${today}\n\n${describeChart(chart)}`,
      messages,
      signal: req.signal,
    });
  } catch (e) {
    if (e instanceof BadRequest) return jsonError(400, e.message);
    throw e;
  }
}
