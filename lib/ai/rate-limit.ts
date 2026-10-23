/**
 * AI 介面的流量限制，用 Cloudflare Workers 的 Rate Limiting binding（設定在 wrangler.jsonc）。
 *
 * 兩層：
 *   AI_RATE_LIMITER   每個來源 IP 每分鐘的次數，擋單一來源狂刷
 *   AI_GLOBAL_LIMITER 全站每分鐘的總次數，替 Claude API 的花費設上限
 * 網站沒有登入，只能用 IP 當 key；同一個 NAT 後面的人會共用額度，上限因此放寬一點。
 * 計數以 Cloudflare 機房為單位、是近似值。
 *
 * 本機 `next dev` 沒有 Cloudflare 環境，取不到 binding 時直接放行。
 */

import { getCloudflareContext } from '@opennextjs/cloudflare';

interface RateLimiter {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

interface LimiterEnv {
  AI_RATE_LIMITER?: RateLimiter;
  AI_GLOBAL_LIMITER?: RateLimiter;
}

function limiters(): LimiterEnv | null {
  try {
    return getCloudflareContext().env as unknown as LimiterEnv;
  } catch {
    return null;
  }
}

/** 超過限制時回傳 429 Response；沒超過回傳 null */
export async function checkAiRateLimit(req: Request): Promise<Response | null> {
  const env = limiters();
  if (!env) return null;
  const ip = req.headers.get('cf-connecting-ip') ?? 'unknown';
  const [perIp, global] = await Promise.all([
    env.AI_RATE_LIMITER?.limit({ key: `ai:${ip}` }),
    env.AI_GLOBAL_LIMITER?.limit({ key: 'ai:global' }),
  ]);
  if (perIp && !perIp.success) {
    return Response.json({ error: '提問太頻繁，請一分鐘後再試。' }, { status: 429, headers: { 'Retry-After': '60' } });
  }
  if (global && !global.success) {
    return Response.json({ error: '目前使用人數較多，請稍後再試。' }, { status: 429, headers: { 'Retry-After': '60' } });
  }
  return null;
}
