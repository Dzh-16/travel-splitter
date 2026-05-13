import { Trip, Expense } from '@/lib/types';
import { formatAmount } from '@/lib/settlement';
import { saveTrip } from '@/lib/storage';

interface ExpenseListProps {
  trip: Trip;
  onUpdate: (trip: Trip) => void;
  onAddExpense: () => void;
}

function getMemberName(trip: Trip, memberId: string): string {
  return trip.members.find((m) => m.id === memberId)?.name ?? '未知';
}

export default function ExpenseList({ trip, onUpdate, onAddExpense }: ExpenseListProps) {
  function removeExpense(expenseId: string) {
    const updated = {
      ...trip,
      expenses: trip.expenses.filter((e) => e.id !== expenseId),
    };
    saveTrip(updated);
    onUpdate(updated);
  }

  const sortedExpenses = [...trip.expenses].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
          支出 ({trip.expenses.length})
        </h3>
      </div>

      {sortedExpenses.length === 0 ? (
        <div className="text-center py-10">
          <div className="text-4xl mb-3">💸</div>
          <p className="text-zinc-400 dark:text-zinc-500 text-sm">还没有支出记录</p>
          <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-1">点击下方按钮添加第一笔</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedExpenses.map((expense) => (
            <ExpenseItem
              key={expense.id}
              expense={expense}
              payerName={getMemberName(trip, expense.payerId)}
              involvedNames={expense.involvedMemberIds.map((id) => getMemberName(trip, id))}
              onDelete={() => removeExpense(expense.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ExpenseItem({
  expense,
  payerName,
  involvedNames,
  onDelete,
}: {
  expense: Expense;
  payerName: string;
  involvedNames: string[];
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl group">
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
          {expense.title}
        </h4>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          {payerName} 支付 · {involvedNames.length} 人分摊（{involvedNames.join('、')}）
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="font-semibold text-zinc-900 dark:text-zinc-100">
          ¥{formatAmount(expense.amount)}
        </p>
        <p className="text-xs text-zinc-400">
          人均 ¥{formatAmount(Math.floor(expense.amount / expense.involvedMemberIds.length))}
        </p>
      </div>
      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-red-500 p-1"
        aria-label="删除支出"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
