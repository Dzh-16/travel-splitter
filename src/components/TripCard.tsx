import { TripRow } from '@/lib/types';

interface TripCardProps {
  trip: TripRow;
  memberCount: number;
  expenseCount: number;
  totalExpense: number; // 分
  onClick: () => void;
  onDelete: () => void;
}

export default function TripCard({
  trip,
  memberCount,
  expenseCount,
  totalExpense,
  onClick,
  onDelete,
}: TripCardProps) {
  return (
    <div
      onClick={onClick}
      className="relative bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm border border-zinc-100 dark:border-zinc-800 active:scale-[0.98] transition-transform cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 truncate">
            {trip.name}
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {memberCount} 位成员 · {expenseCount} 笔支出
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-zinc-400 hover:text-red-500 p-1 -mr-1 -mt-1"
          aria-label="删除旅行"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <div className="flex items-center justify-between mt-4">
        <span className="font-mono text-xs text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 px-2 py-1 rounded-lg">
          {trip.invite_code}
        </span>
        <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
          ¥{(totalExpense / 100).toFixed(2)}
        </span>
      </div>
    </div>
  );
}
