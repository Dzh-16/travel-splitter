import {
  ExpenseRow,
  MemberRow,
  ExpenseParticipantRow,
  Balance,
  Transfer,
} from './types';
import { convertToCNY } from './currency';

/**
 * 计算每个成员的收支余额。
 * 所有金额统一转为人民币（分）进行计算。
 */
export function calculateBalances(
  expenses: ExpenseRow[],
  members: MemberRow[],
  participantsByExpense: Record<string, ExpenseParticipantRow[]>,
  exchangeRates: Record<string, number>,
  baseCurrency = 'CNY'
): Balance[] {
  if (members.length === 0) return [];

  const paidMap = new Map<string, number>();
  const owedMap = new Map<string, number>();

  for (const m of members) {
    paidMap.set(m.id, 0);
    owedMap.set(m.id, 0);
  }

  for (const expense of expenses) {
    const payerId = expense.paid_by_member_id;
    const currency = expense.currency;

    // 付款人已付金额 → 转为人民币
    const paidInCNY = convertToCNY(expense.amount, currency, exchangeRates);
    paidMap.set(payerId, (paidMap.get(payerId) ?? 0) + paidInCNY);

    // 从 expense_participants 读取每个人的分摊金额
    const participants = participantsByExpense[expense.id] ?? [];
    for (const p of participants) {
      const shareInCNY = convertToCNY(p.share_amount, currency, exchangeRates);
      owedMap.set(p.member_id, (owedMap.get(p.member_id) ?? 0) + shareInCNY);
    }
  }

  const balances: Balance[] = [];
  for (const m of members) {
    const totalPaid = paidMap.get(m.id) ?? 0;
    const totalOwed = owedMap.get(m.id) ?? 0;
    balances.push({
      memberId: m.id,
      memberName: m.name,
      totalPaid,
      totalOwed,
      balance: totalPaid - totalOwed,
    });
  }

  return balances;
}

/**
 * 贪心算法生成最小转账方案。
 * 正余额 = 应收，负余额 = 应付。
 * 注意：creditors 必须创建副本，避免修改原始 balances。
 */
export function calculateTransfers(balances: Balance[]): Transfer[] {
  const epsilon = 1;
  const debtors = balances
    .filter((b) => b.balance < -epsilon)
    .map((b) => ({ ...b, balance: -b.balance }))
    .sort((a, b) => b.balance - a.balance);

  const creditors = balances
    .filter((b) => b.balance > epsilon)
    .map((b) => ({ ...b })) // 创建副本，避免污染原始 balances 数组
    .sort((a, b) => b.balance - a.balance);

  const transfers: Transfer[] = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = Math.min(debtor.balance, creditor.balance);

    transfers.push({
      from: debtor.memberId,
      to: creditor.memberId,
      fromName: debtor.memberName,
      toName: creditor.memberName,
      amount,
    });

    debtor.balance -= amount;
    creditor.balance -= amount;

    if (debtor.balance < epsilon) i++;
    if (creditor.balance < epsilon) j++;
  }

  return transfers;
}

/** 格式化金额（分 -> 元，保留两位小数） */
export function formatAmount(cents: number): string {
  return (cents / 100).toFixed(2);
}

/**
 * 为添加支出计算每人应摊金额。
 * 返回 Record<memberId, share_amount>，金额单位为分。
 * 余数分配给付款人。
 */
export function computeShares(
  totalAmount: number, // 分
  involvedMemberIds: string[],
  payerId: string
): Record<string, number> {
  const shares: Record<string, number> = {};
  const share = Math.floor(totalAmount / involvedMemberIds.length);
  let remainder = totalAmount - share * involvedMemberIds.length;

  for (const memberId of involvedMemberIds) {
    const s = remainder > 0 && memberId === payerId ? share + remainder : share;
    shares[memberId] = s;
    if (remainder > 0 && memberId === payerId) remainder = 0;
  }

  return shares;
}
