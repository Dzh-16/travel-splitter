import { createClient, SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;
let initError: string | null = null;

/** 获取 Supabase 客户端单例。未配置时返回 null 并记录错误原因。 */
export function getSupabase(): SupabaseClient | null {
  if (client) return client;
  if (initError) return null;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    initError = 'Supabase 未配置：请在 .env.local 中设置 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY';
    return null;
  }

  client = createClient(url, key, {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });

  return client;
}

/** 检查 Supabase 是否可用 */
export function isSupabaseAvailable(): boolean {
  return getSupabase() !== null;
}

/** 获取配置错误信息 */
export function getSupabaseError(): string | null {
  getSupabase(); // 触发错误检测
  return initError;
}
