import { Trip, Balance, Transfer } from './types';

/**
 * 计算每个成员的收支余额。
 * 金额全部以"分"为单位，避免浮点精度问题。
 */
export function calculateBalances(trip: Trip): Balance[] {
  const { members, expenses } = trip;
  if (members.length === 0) return [];

  const paidMap = new Map<string, number>();
  const owedMap = new Map<string, number>();

  for (const m of members) {
    paidMap.set(m.id, 0);
    owedMap.set(m.id, 0);
  }

  for (const expense of expenses) {
    const payerId = expense.payerId;
    const involved = expense.involvedMemberIds;
    if (involved.length === 0) continue;

    // 付款人已付金额增加
    paidMap.set(payerId, (paidMap.get(payerId) ?? 0) + expense.amount);

    // 每个参与人应付 = 金额 / 参与人数（取整，余数归付款人）
    const share = Math.floor(expense.amount / involved.length);
    let remainder = expense.amount - share * involved.length;

    for (const memberId of involved) {
      let owed = share;
      // 余数分配给付款人（多出的 1 分归付款人承担）
      if (remainder > 0 && memberId === payerId) {
        owed += remainder;
        remainder = 0;
      }
      owedMap.set(memberId, (owedMap.get(memberId) ?? 0) + owed);
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
 * 正余额=应收，负余额=应付。
 */
export function calculateTransfers(balances: Balance[]): Transfer[] {
  // 过滤掉已结清的（允许 1 分的误差）
  const epsilon = 1;
  const debtors = balances
    .filter((b) => b.balance < -epsilon)
    .map((b) => ({ ...b, balance: -b.balance })) // 转为正数方便计算
    .sort((a, b) => b.balance - a.balance);

  const creditors = balances
    .filter((b) => b.balance > epsilon)
    .map((b) => ({ ...b })) // 创建副本，避免修改原始 balances
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
