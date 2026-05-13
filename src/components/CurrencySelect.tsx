import { SUPPORTED_CURRENCIES } from '@/lib/currencies';

interface CurrencySelectProps {
  value: string;
  onChange: (code: string) => void;
  className?: string;
}

/** 币种下拉选择器 */
export default function CurrencySelect({
  value,
  onChange,
  className = '',
}: CurrencySelectProps) {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 px-4 rounded-xl border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 appearance-none w-full"
      >
        {SUPPORTED_CURRENCIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.symbol} {c.code} — {c.name}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
