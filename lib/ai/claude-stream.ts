/**
 * 呼叫 Claude 并把回答转成前端既有的 SSE 格式：
 *   data: {"delta":{"text":"..."}}\n\n  ……  data: [DONE]\n\n
 * InsightPanel / ChatPanel / 合盘页都按这个格式逐行解析。
 */

import Anthropic from '@anthropic-ai/sdk';
import { generateChart } from '@/lib/ziwei/algorithm';
import type { BirthInfo, ZiweiChart } from '@/lib/ziwei/types';

/** 预设用 Claude Opus 5.5；要换模型在环境变量设 ANTHROPIC_MODEL */
const DEFAULT_MODEL = 'claude-opus-5-5';

const MAX_MESSAGES = 24;
const MAX_MESSAGE_CHARS = 4000;
const MAX_TOTAL_CHARS = 24000;

export class BadRequest extends Error {}

/**
 * 只信任前端送来的出生资料，命盘在服务端用同一套引擎重排，
 * 避免有人塞一张伪造的大命盘进来灌 prompt。
 */
export function chartFromBody(raw: unknown): ZiweiChart {
  const b = (raw as { birthInfo?: Partial<BirthInfo> } | null)?.birthInfo;
  if (!b) throw new BadRequest('缺少出生资料');
  const { year, month, day, hour, gender } = b;
  if (
    !Number.isInteger(year) || year! < 1900 || year! > 2100 ||
    !Number.isInteger(month) || !Number.isInteger(day) || !Number.isInteger(hour) ||
    (gender !== 'male' && gender !== 'female')
  ) {
    throw new BadRequest('出生资料格式不正确');
  }
  try {
    return generateChart({ year: year!, month: month!, day: day!, hour: hour!, gender });
  } catch {
    throw new BadRequest('无法用这组出生资料排盘');
  }
}

export function messagesFromBody(raw: unknown): Anthropic.MessageParam[] {
  if (!Array.isArray(raw)) throw new BadRequest('messages 必须是阵列');
  const msgs = raw
    .filter((m): m is { role: 'user' | 'assistant'; content: string } =>
      !!m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim() !== '')
    .slice(-MAX_MESSAGES);
  // 对话必须从 user 开始
  while (msgs.length && msgs[0].role !== 'user') msgs.shift();
  if (!msgs.length || msgs[msgs.length - 1].role !== 'user') throw new BadRequest('最后一则讯息必须来自使用者');
  let total = 0;
  for (const m of msgs) {
    if (m.content.length > MAX_MESSAGE_CHARS) throw new BadRequest('单则讯息太长');
    total += m.content.length;
  }
  if (total > MAX_TOTAL_CHARS) throw new BadRequest('对话太长，请开新的对话');
  return msgs.map(m => ({ role: m.role, content: m.content }));
}

export function jsonError(status: number, message: string): Response {
  return Response.json({ error: message }, { status });
}

/**
 * system 分两段：固定的规则在前、这张命盘在后，各自打快取断点，
 * 同一张盘的多轮追问可以重用快取。
 */
export function streamClaude(opts: {
  system: string;
  context: string;
  messages: Anthropic.MessageParam[];
  signal?: AbortSignal;
}): Response {
  const client = new Anthropic();
  const encoder = new TextEncoder();
  const send = (controller: ReadableStreamDefaultController<Uint8Array>, data: unknown) =>
    controller.enqueue(encoder.encode(`data: ${typeof data === 'string' ? data : JSON.stringify(data)}\n\n`));

  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const stream = client.beta.messages.stream(
          {
            model: process.env.ANTHROPIC_MODEL || DEFAULT_MODEL,
            max_tokens: 16000,
            output_config: { effort: 'medium' },
            // 模型因政策婉拒时，由服务端自动改用预设的备援模型接手
            betas: ['server-side-fallback-2026-07-01'],
            fallbacks: 'default',
            system: [
              { type: 'text', text: opts.system, cache_control: { type: 'ephemeral' } },
              { type: 'text', text: opts.context, cache_control: { type: 'ephemeral' } },
            ],
            messages: opts.messages,
          },
          { signal: opts.signal },
        );
        stream.on('text', text => send(controller, { delta: { text } }));
        const final = await stream.finalMessage();
        if (final.stop_reason === 'refusal') {
          send(controller, { delta: { text: '\n\n（这个问题无法回答，请换个方式提问。）' } });
        } else if (final.stop_reason === 'max_tokens') {
          send(controller, { delta: { text: '\n\n（回答太长被截断，可以请我接着说。）' } });
        }
      } catch (err) {
        if (!opts.signal?.aborted) {
          console.error('[claude-stream]', err instanceof Anthropic.APIError ? `${err.status} ${err.message}` : err);
          const msg = err instanceof Anthropic.RateLimitError
            ? '目前使用人数较多，请稍后再试。'
            : err instanceof Anthropic.AuthenticationError
              ? '服务端的 ANTHROPIC_API_KEY 无效或未设定。'
              : '解读暂时失败，请稍后再试。';
          send(controller, { delta: { text: `\n\n（${msg}）` } });
        }
      } finally {
        send(controller, '[DONE]');
        controller.close();
      }
    },
  });

  return new Response(body, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  });
}
