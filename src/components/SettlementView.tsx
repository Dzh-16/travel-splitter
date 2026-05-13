import { calculateBalances, calculateTransfers, formatAmount } from '@/lib/settlement';
import { Trip } from '@/lib/types';

interface SettlementViewProps {
  trip: Trip;
}

export default function SettlementView({ trip }: SettlementViewProps) {
  const balances = calculateBalances(trip);
  const transfers = calculateTransfers(balances);
  const totalExpense = trip.expenses.reduce((sum, e) => sum + e.amount, 0);

  if (balances.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="text-4xl mb-3">🧾</div>
        <p className="text-zinc-400 dark:text-zinc-500">还没有成员数据</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 总支出 */}
      <div className="text-center">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">总支出</p>
        <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          ¥{formatAmount(totalExpense)}
        </p>
      </div>

      {/* 每人余额卡片 */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-3">
          收支明细
        </h3>
        <div className="space-y-2">
          {balances.map((b) => (
            <div
              key={b.memberId}
              className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl"
            >
              <div>
                <p className="font-medium text-zinc-900 dark:text-zinc-100">
                  {b.memberName}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  已付 ¥{formatAmount(b.totalPaid)} · 应付 ¥{formatAmount(b.totalOwed)}
                </p>
              </div>
              <div
                className={`text-lg font-bold ${
                  b.balance >= 0
                    ? 'text-green-500'
                    : 'text-red-500'
                }`}
              >
                {b.balance >= 0 ? '+' : '-'}¥{formatAmount(Math.abs(b.balance))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 转账方案 */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-3">
          结算方案
        </h3>

        {transfers.length === 0 ? (
          <div className="text-center py-6 bg-green-50 dark:bg-green-900/20 rounded-xl">
            <div className="text-2xl mb-2">✅</div>
            <p className="text-sm text-green-700 dark:text-green-300">所有账目已结清</p>
          </div>
        ) : (
          <div className="space-y-2">
            {transfers.map((t, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-900 dark:text-zinc-100">
                    <span className="font-semibold text-red-500">{t.fromName}</span>
                    <span className="mx-2 text-zinc-400">转账给</span>
                    <span className="font-semibold text-green-500">{t.toName}</span>
                  </p>
                </div>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  ¥{formatAmount(t.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
