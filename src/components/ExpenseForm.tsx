import { useState } from 'react';
import { Trip, Expense } from '@/lib/types';
import { saveTrip } from '@/lib/storage';
import Button from './ui/Button';
import Input from './ui/Input';

interface ExpenseFormProps {
  trip: Trip;
  onUpdate: (trip: Trip) => void;
  onClose: () => void;
}

export default function ExpenseForm({ trip, onUpdate, onClose }: ExpenseFormProps) {
  const [title, setTitle] = useState('');
  const [amountYuan, setAmountYuan] = useState(''); // 用户输入的是"元"
  const [payerId, setPayerId] = useState(trip.members[0]?.id ?? '');
  const [involvedIds, setInvolvedIds] = useState<Set<string>>(
    new Set(trip.members.map((m) => m.id))
  );

  function toggleMember(memberId: string) {
    const next = new Set(involvedIds);
    if (next.has(memberId)) {
      if (next.size > 1) next.delete(memberId);
    } else {
      next.add(memberId);
    }
    setInvolvedIds(next);
  }

  function submit() {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    const yuan = parseFloat(amountYuan);
    if (isNaN(yuan) || yuan <= 0) return;

    if (!payerId) return;
    if (involvedIds.size === 0) return;

    const expense: Expense = {
      id: crypto.randomUUID(),
      title: trimmedTitle,
      amount: Math.round(yuan * 100), // 元 -> 分
      payerId,
      involvedMemberIds: [...involvedIds],
      createdAt: new Date().toISOString(),
    };

    const updated = { ...trip, expenses: [...trip.expenses, expense] };
    saveTrip(updated);
    onUpdate(updated);
    onClose();
  }

  if (trip.members.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-zinc-500 dark:text-zinc-400">请先添加成员</p>
        <Button variant="secondary" size="sm" className="mt-3" onClick={onClose}>
          关闭
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        label="名称"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="例如：酒店、晚餐、门票"
      />

      <Input
        label="金额 (元)"
        type="number"
        inputMode="decimal"
        value={amountYuan}
        onChange={(e) => setAmountYuan(e.target.value)}
        placeholder="0.00"
        step="0.01"
        min="0"
      />

      {/* 付款人 */}
      <div>
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-2">
          付款人
        </label>
        <div className="flex flex-wrap gap-2">
          {trip.members.map((m) => (
            <button
              key={m.id}
              onClick={() => setPayerId(m.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                payerId === m.id
                  ? 'bg-teal-500 text-white'
                  : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
              }`}
            >
              {m.name}
            </button>
          ))}
        </div>
      </div>

      {/* 参与成员 */}
      <div>
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-2">
          参与分摊成员
        </label>
        <div className="flex flex-wrap gap-2">
          {trip.members.map((m) => (
            <button
              key={m.id}
              onClick={() => toggleMember(m.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                involvedIds.has(m.id)
                  ? 'bg-teal-500 text-white'
                  : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 opacity-50'
              }`}
            >
              {m.name}
            </button>
          ))}
        </div>
      </div>

      {/* 预览 */}
      {amountYuan && parseFloat(amountYuan) > 0 && (
        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 text-sm text-zinc-600 dark:text-zinc-400">
          人均 ¥{(parseFloat(amountYuan) / involvedIds.size).toFixed(2)} ·{' '}
          {involvedIds.size} 人分摊
        </div>
      )}

      <div className="flex gap-3 mt-2">
        <Button onClick={submit} className="flex-1" disabled={!title.trim() || !amountYuan || !payerId}>
          确认添加
        </Button>
        <Button variant="ghost" onClick={onClose}>
          取消
        </Button>
      </div>
    </div>
  );
}
