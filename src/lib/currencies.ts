import { CurrencyInfo } from './types';

/** 支持的货币列表 */
export const SUPPORTED_CURRENCIES: CurrencyInfo[] = [
  { code: 'CNY', symbol: '¥', name: '人民币' },
  { code: 'USD', symbol: '$', name: '美元' },
  { code: 'EUR', symbol: '€', name: '欧元' },
  { code: 'JPY', symbol: '¥', name: '日元' },
  { code: 'GBP', symbol: '£', name: '英镑' },
  { code: 'KRW', symbol: '₩', name: '韩元' },
  { code: 'THB', symbol: '฿', name: '泰铢' },
  { code: 'HKD', symbol: 'HK$', name: '港币' },
  { code: 'TWD', symbol: 'NT$', name: '新台币' },
  { code: 'SGD', symbol: 'S$', name: '新加坡元' },
  { code: 'AUD', symbol: 'A$', name: '澳元' },
  { code: 'MYR', symbol: 'RM', name: '马来西亚林吉特' },
  { code: 'VND', symbol: '₫', name: '越南盾' },
  { code: 'PHP', symbol: '₱', name: '菲律宾比索' },
  { code: 'IDR', symbol: 'Rp', name: '印尼盾' },
  { code: 'INR', symbol: '₹', name: '印度卢比' },
];

/** 默认币种 */
export const DEFAULT_CURRENCY = 'CNY';

/** 根据 code 查找货币信息 */
export function getCurrencyInfo(code: string): CurrencyInfo | undefined {
  return SUPPORTED_CURRENCIES.find((c) => c.code === code);
}
