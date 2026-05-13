# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 版本警告

这是 **Next.js 16.2.6**，API 和约定与旧版有显著差异。遇到不确定的 API 时，先查阅 `node_modules/next/dist/docs/` 中的文档。

## 常用命令

```bash
npm run dev      # 开发服务器 (Turbopack, 默认端口 3000)
npm run build    # 生产构建 + TypeScript 类型检查
```

数据库迁移脚本位于 `supabase/migrations/001_init.sql`，需在 Supabase SQL Editor 中手动执行。

项目无测试框架，结算算法可通过 Node.js 脚本直接验证：`node -e "import { calculateBalances } from './src/lib/settlement'"` (需 tsx 或 ts-node)。

## 技术栈

- Next.js 16.2.6 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 (`@import "tailwindcss"` 语法, `@theme inline`)
- Supabase (PostgreSQL + Realtime)
- frankfurter.app (免费汇率 API)

## 架构概览

```
src/lib/
  types.ts          # DB 行类型 (TripRow, MemberRow, ExpenseRow, ExpenseParticipantRow) + 结算类型
  supabase.ts       # Supabase 客户端单例 (检测环境变量配置)
  invite.ts         # 6位邀请码生成 (排除 0/O/1/I/L)
  currencies.ts     # 支持的货币列表 (16种)
  currency.ts       # 汇率获取 (frankfurter.app) + 缓存 (1h TTL, localStorage) + 转换函数
  settlement.ts     # 多币种结算: calculateBalances, calculateTransfers, computeShares, formatAmount
  api/
    trips.ts        # 旅行 CRUD + 邀请码查询 + myTripIds (localStorage 用户关联)
    members.ts      # 成员 CRUD
    expenses.ts     # 支出 CRUD + 参与人批量插入
  hooks/
    useTrip.ts      # 核心 hook: 旅行数据 + Realtime 订阅 + 变更方法
    useTrips.ts     # 首页 hook: myTripIds → Supabase 查询
src/components/
  ui/               # Button, Input, Modal, BottomSheet (无变化)
  TripCard.tsx       # 旅行卡片 (显示邀请码)
  MemberList.tsx     # 成员管理 (onAdd/onRemove 回调)
  ExpenseList.tsx    # 支出列表 (显示币种标识)
  ExpenseForm.tsx    # 支出表单 (币种选择器 + computeShares)
  SettlementView.tsx # 结算视图 (异步汇率 + 多币种换算)
  InviteCode.tsx     # 邀请码展示 + 复制 (新增)
  CurrencySelect.tsx # 币种下拉选择器 (新增)
```

**路由**: `/`, `/join`, `/trip/[id]`, `/trip/[id]/settle`

## 关键设计决策

### 金额用"分"存储

所有 `amount` 字段单位为**分** (整数)。用户输入元，`Math.round(yuan * 100)` 转换。显示用 `formatAmount(cents)` 除以 100。

### 无认证方案

- Supabase RLS: `FOR ALL USING (true)` 完全公开
- 首页用 localStorage 存储 `myTripIds: string[]` 关联用户和旅行
- 邀请码作为软访问控制，UUID 不可猜测

### 多币种结算

1. 每个支出有 `currency` 字段 (CNY/USD/EUR 等)
2. 结算时从 frankfurter.app 获取最新汇率 (1h 缓存)
3. `convertToCNY()` 将所有金额换算为人民币后计算余额
4. 分摊金额 (`share_amount`) 预存在 `expense_participants` 表中

### 实时同步

`useTrip` hook 订阅 Supabase Realtime `members` 和 `expenses` 表的 `postgres_changes`。数据变化时自动重新加载相关数据。

### 组件通信

v2 不再使用 `trip + onUpdate` 的 prop-drilling 模式。改用 hooks：
- `useTrip(id)` 持有全部状态（trip, members, expenses, participantsByExpense），返回数据切片 + 异步变更函数
- 子组件接收扁平化的数据和回调（如 `members: MemberRow[]`, `onAdd: (name: string) => Promise<void>`）
- 变更函数内部写 Supabase，成功后乐观更新本地状态（Realtime 订阅作为兜底）

### Next.js 16 动态路由

`params` 是 `Promise`，必须用 `use()` 解包：
```typescript
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
}
```

### 结算算法

`calculateBalances(expenses, members, participantsByExpense, rates, baseCurrency)`:
- 从 `expense_participants.share_amount` 读取分摊额（非运行时计算）
- 所有金额通过 `convertToCNY()` 转人民币后累加

`calculateTransfers(balances)`:
- 贪心算法，最大债务方付给最大债权方
- **重要**: creditors 必须先 `.map(b => ({...b}))` 创建副本，避免 `-=` 污染原数组

## Supabase 配置

1. 在 Supabase Dashboard 创建项目
2. 在 SQL Editor 执行 `supabase/migrations/001_init.sql`
3. 将 URL 和 anon key 填入 `.env.local` (参考 `.env.example`)
4. 在 Supabase Dashboard → Database → Replication 确认 `members` 和 `expenses` 表已启用 Realtime
