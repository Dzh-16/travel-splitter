import { getSupabase } from './supabase';

// 字符集：排除容易混淆的 0/O/1/I/L
const CHARSET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 6;

/** 生成随机邀请码 */
function generateCode(): string {
  const array = new Uint8Array(CODE_LENGTH);
  crypto.getRandomValues(array);
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CHARSET[array[i] % CHARSET.length];
  }
  return code;
}

/** 检查邀请码在数据库中的唯一性 */
async function isCodeUnique(code: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return true; // 未配置 Supabase 时默认通过

  const { data } = await supabase
    .from('trips')
    .select('id')
    .eq('invite_code', code)
    .maybeSingle();

  return data === null;
}

/** 生成唯一邀请码（带重试，最多 10 次） */
export async function generateUniqueInviteCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = generateCode();
    if (await isCodeUnique(code)) {
      return code;
    }
  }
  // 极端情况：10 次都冲突，增加长度重试
  throw new Error('无法生成唯一邀请码，请重试');
}
