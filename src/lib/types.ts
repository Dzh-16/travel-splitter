// ── 数据库行类型（对应 Supabase 表结构）──

/** trips 表 */
export interface TripRow {
  id: string; // UUID
  name: string;
  invite_code: string; // 6位邀请码，唯一
  default_currency: string; // 默认币种，如 'CNY'
  created_at: string;
}

/** members 表 */
export interface MemberRow {
  id: string; // UUID
  trip_id: string; // FK → trips.id
  name: string;
  joined_at: string;
}

/** expenses 表 */
export interface ExpenseRow {
  id: string;
  trip_id: string;
  title: string;
  amount: number; // 整数，单位为分（原始币种）
  currency: string; // 原始币种，如 'CNY', 'USD'
  paid_by_member_id: string;
  exchange_rate: number | null; // 该币种 → CNY 的汇率（添加支出时锁定，CNY 为 null）
  created_at: string;
}

/** expense_participants 表 */
export interface ExpenseParticipantRow {
  id: string; // UUID
  expense_id: string; // FK → expenses.id
  member_id: string; // FK → members.id
  share_amount: number; // 该成员分摊金额，分（原始币种）
}

// ── UI 聚合类型 ──

/** 旅行完整视图（查询时组装） */
export interface TripView {
  trip: TripRow;
  members: MemberRow[];
  expenses: ExpenseRow[];
  participantsByExpense: Record<string, ExpenseParticipantRow[]>;
}

// ── 结算结果类型（与 v1 兼容）──

/** 成员收支余额 */
export interface Balance {
  memberId: string;
  memberName: string;
  totalPaid: number; // 总支付（基础币种，分）
  totalOwed: number; // 总应付（基础币种，分）
  balance: number; // 净余额（正=应收，负=应付）
}

/** 最小转账方案 */
export interface Transfer {
  from: string; // memberId
  to: string; // memberId
  fromName: string;
  toName: string;
  amount: number; // 转账金额（基础币种，分）
}

// ── 货币与汇率 ──

/** 货币信息 */
export interface CurrencyInfo {
  code: string; // ISO 4217，如 'CNY'
  symbol: string; // 如 '¥'
  name: string; // 中文名，如 '人民币'
}

/** 汇率缓存 */
export interface ExchangeRateCache {
  rates: Record<string, number>; // { USD: 7.25, EUR: 7.85, ... }
  base: string; // 基准币种（通常是 CNY）
  timestamp: number; // 缓存时间戳
}

// ── 新增支出输入 ──

export interface NewExpenseInput {
  title: string;
  amount: number; // 分（原始币种）
  currency: string;
  payerId: string;
  involvedMemberIds: string[];
  shares: Record<string, number>; // memberId → share_amount (分, 原始币种)
}
