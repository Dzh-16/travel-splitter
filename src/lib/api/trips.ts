import { getSupabase } from '../supabase';
import { TripRow } from '../types';

const TRIP_IDS_KEY = 'travel-splitter-my-trip-ids';

/** 获取当前用户关联的旅行 ID 列表（存储在 localStorage 中） */
function getMyTripIds(): string[] {
  try {
    const raw = localStorage.getItem(TRIP_IDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** 将旅行 ID 加入 myTripIds 列表 */
export function addMyTripId(id: string): void {
  const ids = getMyTripIds();
  if (!ids.includes(id)) {
    ids.push(id);
    localStorage.setItem(TRIP_IDS_KEY, JSON.stringify(ids));
  }
}

/** 从 myTripIds 列表移除旅行 ID */
export function removeMyTripId(id: string): void {
  const ids = getMyTripIds().filter((i) => i !== id);
  localStorage.setItem(TRIP_IDS_KEY, JSON.stringify(ids));
}

/** 创建旅行：插入 trips 表，生成邀请码 */
export async function createTrip(
  name: string,
  inviteCode: string,
  defaultCurrency = 'CNY'
): Promise<TripRow | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('trips')
    .insert({
      name,
      invite_code: inviteCode,
      default_currency: defaultCurrency,
    })
    .select()
    .single();

  if (error) throw error;
  return data as TripRow;
}

/** 获取用户关联的旅行列表 */
export async function getMyTrips(): Promise<TripRow[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const ids = getMyTripIds();
  if (ids.length === 0) return [];

  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .in('id', ids)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as TripRow[];
}

/** 根据 ID 获取单个旅行 */
export async function getTrip(id: string): Promise<TripRow | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data as TripRow;
}

/** 根据邀请码查找旅行（用于加入流程） */
export async function getTripByInviteCode(code: string): Promise<TripRow | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('invite_code', code.toUpperCase())
    .single();

  if (error) return null;
  return data as TripRow;
}

/** 更新旅行信息 */
export async function updateTrip(
  id: string,
  updates: Partial<Pick<TripRow, 'name' | 'default_currency'>>
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  const { error } = await supabase.from('trips').update(updates).eq('id', id);
  if (error) throw error;
}

/** 删除旅行（级联删除成员、支出、参与人由数据库 CASCADE 处理） */
export async function deleteTrip(id: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  const { error } = await supabase.from('trips').delete().eq('id', id);
  if (error) throw error;
  removeMyTripId(id);
}
