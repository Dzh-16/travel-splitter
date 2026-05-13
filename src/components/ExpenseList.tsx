import { ExpenseRow, MemberRow, ExpenseParticipantRow } from '@/lib/types';
import { formatAmount } from '@/lib/settlement';
import { getCurrencyInfo } from '@/lib/currencies';

interface ExpenseListProps {
  expenses: ExpenseRow[];
  members: MemberRow[];
  participantsByExpense: Record<string, ExpenseParticipantRow[]>;
  onRemove: (expenseId: string) => Promise<void>;
  onAddExpense: () => void;
}

function getMemberName(members: MemberRow[], id: string): string {
  return members.find((m) => m.id === id)?.name ?? '未知';
}

export default function ExpenseList({
  expenses,
  members,
  participantsByExpense,
  onRemove,
}: ExpenseListProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
          支出 ({expenses.length})
        </h3>
      </div>

      {expenses.length === 0 ? (
        <div className="text-center py-10">
          <div className="text-4xl mb-3">💸</div>
          <p className="text-zinc-400 dark:text-zinc-500 text-sm">还没有支出记录</p>
          <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-1">点击下方按钮添加第一笔</p>
        </div>
      ) : (
        <div className="space-y-2">
          {expenses.map((expense) => {
            const participants = participantsByExpense[expense.id] ?? [];
            const involvedNames = participants.map((p) =>
              getMemberName(members, p.member_id)
            );
            const currency = getCurrencyInfo(expense.currency);

            return (
              <div
                key={expense.id}
                className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                      {expense.title}
                    </h4>
                    <span className="text-xs text-zinc-400 bg-zinc-200 dark:bg-zinc-700 px-1.5 py-0.5 rounded">
                      {expense.currency}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {getMemberName(members, expense.paid_by_member_id)} 支付 ·{' '}
                    {involvedNames.length} 人分摊（{involvedNames.join('、')}）
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {currency?.symbol ?? '¥'}{(expense.amount / 100).toFixed(2)}
                  </p>
                  {/* 外币显示 CNY 等价，本币显示人均 */}
                  {expense.currency !== 'CNY' && expense.exchange_rate ? (
                    <p className="text-xs text-zinc-400">
                      约 ¥{(Math.round(expense.amount / expense.exchange_rate) / 100).toFixed(2)}
                    </p>
                  ) : (
                    <p className="text-xs text-zinc-400">
                      人均 {currency?.symbol ?? '¥'}
                      {participants.length > 0
                        ? (expense.amount / participants.length / 100).toFixed(2)
                        : '0.00'}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => onRemove(expense.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-red-500 p-1"
                  aria-label="删除支出"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
