import { useState } from 'react';
import { MemberRow } from '@/lib/types';
import { computeShares } from '@/lib/settlement';
import { getCurrencyInfo } from '@/lib/currencies';
import { getExchangeRates } from '@/lib/currency';
import CurrencySelect from './CurrencySelect';
import Button from './ui/Button';
import Input from './ui/Input';

interface ExpenseFormProps {
  members: MemberRow[];
  defaultCurrency: string;
  onSubmit: (input: {
    title: string;
    amount: number;
    currency: string;
    payerId: string;
    exchangeRate: number | null; // 该币种 → CNY 的汇率（添加时锁定）
    shares: Record<string, number>;
  }) => Promise<void>;
  onClose: () => void;
}

export default function ExpenseForm({
  members,
  defaultCurrency,
  onSubmit,
  onClose,
}: ExpenseFormProps) {
  const [title, setTitle] = useState('');
  const [amountYuan, setAmountYuan] = useState('');
  const [currency, setCurrency] = useState(defaultCurrency);
  const [payerId, setPayerId] = useState(members[0]?.id ?? '');
  const [involvedIds, setInvolvedIds] = useState<Set<string>>(
    new Set(members.map((m) => m.id))
  );
  const [submitting, setSubmitting] = useState(false);

  const currencyInfo = getCurrencyInfo(currency);
  const symbol = currencyInfo?.symbol ?? '¥';
  const isForeign = currency !== 'CNY';

  // 预览：外币时同时显示原始金额和 CNY 估算
  const amountNum = parseFloat(amountYuan);
  const perPerson = amountNum > 0 ? amountNum / involvedIds.size : 0;

  function toggleMember(memberId: string) {
    const next = new Set(involvedIds);
    if (next.has(memberId)) {
      if (next.size > 1) next.delete(memberId);
    } else {
      next.add(memberId);
    }
    setInvolvedIds(next);
  }

  async function submit() {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    const num = parseFloat(amountYuan);
    if (isNaN(num) || num <= 0) return;

    if (!payerId) return;
    if (involvedIds.size === 0) return;

    setSubmitting(true);
    try {
      // 外币支出：获取当前汇率并锁定
      let exchangeRate: number | null = null;
      if (isForeign) {
        const rates = await getExchangeRates('CNY');
        exchangeRate = rates[currency] ?? null;
      }

      const amountCents = Math.round(num * 100);
      const involvedArray = [...involvedIds];
      const shares = computeShares(amountCents, involvedArray, payerId);

      await onSubmit({
        title: trimmedTitle,
        amount: amountCents,
        currency,
        payerId,
        exchangeRate,
        shares,
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (members.length === 0) {
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

      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            label="金额"
            type="number"
            inputMode="decimal"
            value={amountYuan}
            onChange={(e) => setAmountYuan(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0"
          />
        </div>
        <div className="w-[120px]">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-1.5">
            币种
          </label>
          <CurrencySelect value={currency} onChange={setCurrency} />
        </div>
      </div>

      {/* 付款人 */}
      <div>
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-2">
          付款人
        </label>
        <div className="flex flex-wrap gap-2">
          {members.map((m) => (
            <button
              key={m.id}
              onClick={() => setPayerId(m.id)}
              type="button"
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
          {members.map((m) => (
            <button
              key={m.id}
              onClick={() => toggleMember(m.id)}
              type="button"
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

      {/* 预览：显示所选币种符号 */}
      {amountNum > 0 && (
        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 text-sm text-zinc-600 dark:text-zinc-400">
          人均 {symbol}{perPerson.toFixed(2)} · {involvedIds.size} 人分摊
        </div>
      )}

      <div className="flex gap-3 mt-2">
        <Button
          onClick={submit}
          className="flex-1"
          disabled={!title.trim() || !amountYuan || !payerId || submitting}
        >
          {submitting ? '添加中...' : '确认添加'}
        </Button>
        <Button variant="ghost" onClick={onClose}>
          取消
        </Button>
      </div>
    </div>
  );
}
