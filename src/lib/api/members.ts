import { getSupabase } from '../supabase';
import { MemberRow } from '../types';

/** 获取旅行下所有成员 */
export async function getMembers(tripId: string): Promise<MemberRow[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('trip_id', tripId)
    .order('joined_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as MemberRow[];
}

/** 添加成员 */
export async function addMember(
  tripId: string,
  name: string
): Promise<MemberRow | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('members')
    .insert({ trip_id: tripId, name })
    .select()
    .single();

  if (error) throw error;
  return data as MemberRow;
}

/** 删除成员（级联删除其支出和参与记录由数据库 CASCADE 处理） */
export async function removeMember(memberId: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  const { error } = await supabase.from('members').delete().eq('id', memberId);
  if (error) throw error;
}
