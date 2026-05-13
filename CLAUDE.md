# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 版本警告

这是 **Next.js 16.2.6**，API 和约定与旧版有显著差异。遇到不确定的 API 时，先查阅 `node_modules/next/dist/docs/` 中的文档。

## 常用命令

```bash
npm run dev      # 开发服务器 (Turbopack, 默认端口 3000)
npm run build    # 生产构建 + TypeScript 类型检查
```

## 技术栈

- Next.js 16.2.6 (App Router) + React 19 + TypeScript 5
- Tailwind CSS v4 (`@import "tailwindcss"` 语法, `@theme inline` 自定义变量)
- 暂无测试框架或后端

## 架构概览

```
src/
├── lib/              # 纯逻辑，无 React 依赖
│   ├── types.ts      # Trip, Member, Expense, Balance, Transfer 接口
│   ├── storage.ts    # localStorage 封装 (getTrips/saveTrip/deleteTrip)
│   └── settlement.ts # 结算算法 + formatAmount 工具
├── components/
│   ├── ui/           # 通用 UI 原语 (Button, Input, Modal, BottomSheet)
│   ├── TripCard.tsx       # 首页旅行卡片
│   ├── MemberList.tsx     # 成员管理 (含增删)
│   ├── ExpenseList.tsx    # 支出列表 (含删除，按时间倒序)
│   ├── ExpenseForm.tsx    # 添加支出表单 (付款人选择、参与人勾选)
│   └── SettlementView.tsx # 结算视图 (收支明细 + 转账方案)
└── app/
    ├── layout.tsx          # 根布局 (viewport/PWA meta, 顶部导航栏)
    ├── page.tsx            # 首页：旅行列表 + 创建
    └── trip/[id]/
        ├── page.tsx        # 旅行详情：成员 + 支出
        └── settle/page.tsx # 结算页：收支表 + 最小转账方案
```

**路由**: `/` (静态), `/trip/[id]` (动态), `/trip/[id]/settle` (动态)

## 关键设计决策

### 金额全部用"分"存储

类型中 `amount` 字段的单位是**分** (整数)，避免 JavaScript 浮点数精度问题。`ExpenseForm` 用户输入的是元，提交时 `Math.round(yuan * 100)` 转换。显示时通过 `formatAmount(cents)` 除以 100。

### 所有页面都是 Client Component

当前 MVP 无服务端渲染需求，所有页面标记 `"use client"`。直接从 `localStorage` 读写数据。

### 组件通信模式

子组件接收 `trip: Trip` 和 `onUpdate: (trip: Trip) => void`。子组件修改数据后：

1. 构造新的 trip 对象
2. 调用 `saveTrip(updated)` 持久化
3. 调用 `onUpdate(updated)` 通知父组件刷新状态

### Next.js 16 动态路由

`params` 现在是 `Promise`，必须用 `use()` 解包：

```typescript
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  // ...
}
```

### 结算算法

`calculateBalances(trip)` → `Balance[]`:
- 遍历支出，计算每人已付/应付
- 分摊取整时分余数归付款人承担

`calculateTransfers(balances)` → `Transfer[]`:
- 贪心算法：最大债务方付给最大债权方
- **重要**: creditors 必须先 `.map(b => ({...b}))` 创建副本再排序，否则循环中的 `-=` 会污染原始 balances 数组的余额显示

## 注意事项

- 项目无 `.env` 文件，无认证机制，数据全存 localStorage
- PWA 配置在 `public/manifest.json` 和 `layout.tsx` 的 `viewport`/`metadata` export
- Tailwind v4 使用 CSS-first 配置 (`@theme inline`)，不再有 `tailwind.config.js`
- 移动端 UI 使用 `max-w-lg mx-auto` 限制最大宽度，`safe-bottom` 适配安全区域
