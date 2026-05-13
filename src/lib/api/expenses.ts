import { getSupabase } from '../supabase';
import { ExpenseRow, ExpenseParticipantRow } from '../types';

/** 获取旅行下所有支出 */
export async function getExpenses(tripId: string): Promise<ExpenseRow[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('trip_id', tripId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as ExpenseRow[];
}

/** 获取单笔支出的所有参与人 */
export async function getParticipants(
  expenseId: string
): Promise<ExpenseParticipantRow[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('expense_participants')
    .select('*')
    .eq('expense_id', expenseId);

  if (error) throw error;
  return (data ?? []) as ExpenseParticipantRow[];
}

/** 获取旅行下所有支出的参与人，按 expense_id 分组 */
export async function getAllParticipantsForTrip(
  tripId: string
): Promise<Record<string, ExpenseParticipantRow[]>> {
  const supabase = getSupabase();
  if (!supabase) return {};

  // 先获取该旅行所有支出 ID
  const { data: expenses, error: expError } = await supabase
    .from('expenses')
    .select('id')
    .eq('trip_id', tripId);

  if (expError || !expenses?.length) return {};

  const expenseIds = expenses.map((e) => e.id);

  const { data, error } = await supabase
    .from('expense_participants')
    .select('*')
    .in('expense_id', expenseIds);

  if (error) throw error;

  const result: Record<string, ExpenseParticipantRow[]> = {};
  for (const p of data ?? []) {
    const row = p as ExpenseParticipantRow;
    if (!result[row.expense_id]) result[row.expense_id] = [];
    result[row.expense_id].push(row);
  }
  return result;
}

/** 添加支出：插入 expenses 表 + 批量插入 expense_participants 表 */
export async function addExpense(
  tripId: string,
  expense: {
    title: string;
    amount: number;
    currency: string;
    payerId: string;
    exchangeRate: number | null; // 该币种 → CNY 的汇率（添加时锁定）
    shares: Record<string, number>;
  }
): Promise<ExpenseRow | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data: expData, error: expError } = await supabase
    .from('expenses')
    .insert({
      trip_id: tripId,
      title: expense.title,
      amount: expense.amount,
      currency: expense.currency,
      paid_by_member_id: expense.payerId,
      exchange_rate: expense.exchangeRate,
    })
    .select()
    .single();

  if (expError) throw expError;
  const expenseRow = expData as ExpenseRow;

  // 批量插入参与人记录
  const participants = Object.entries(expense.shares).map(
    ([memberId, shareAmount]) => ({
      expense_id: expenseRow.id,
      member_id: memberId,
      share_amount: shareAmount,
    })
  );

  const { error: partError } = await supabase
    .from('expense_participants')
    .insert(participants);

  if (partError) throw partError;

  return expenseRow;
}

/** 删除支出（级联删除参与人由数据库 CASCADE 处理） */
export async function removeExpense(expenseId: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', expenseId);

  if (error) throw error;
}
