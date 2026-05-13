'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useTrip } from '@/lib/hooks/useTrip';
import MemberList from '@/components/MemberList';
import ExpenseList from '@/components/ExpenseList';
import ExpenseForm from '@/components/ExpenseForm';
import InviteCode from '@/components/InviteCode';
import BottomSheet from '@/components/ui/BottomSheet';
import Button from '@/components/ui/Button';

export default function TripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const {
    trip,
    members,
    expenses,
    participantsByExpense,
    loading,
    error,
    addMember,
    removeMember,
    addExpense,
    removeExpense,
  } = useTrip(id);
  const [showAddExpense, setShowAddExpense] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="text-center py-20">
        <p className="text-zinc-500 dark:text-zinc-400">{error || '旅行不存在'}</p>
        <Button variant="secondary" className="mt-4" onClick={() => router.push('/')}>
          返回首页
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-24">
      {/* 返回按钮 */}
      <button
        onClick={() => router.push('/')}
        className="inline-flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        返回
      </button>

      {/* 旅行名称 + 邀请码 */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          {trip.name}
        </h1>
        <div className="mt-2">
          <InviteCode code={trip.invite_code} />
        </div>
      </div>

      {/* 成员列表 */}
      <MemberList members={members} onAdd={addMember} onRemove={removeMember} />

      {/* 分割线 */}
      <div className="border-t border-zinc-200 dark:border-zinc-800" />

      {/* 支出列表 */}
      <ExpenseList
        expenses={expenses}
        members={members}
        participantsByExpense={participantsByExpense}
        onRemove={removeExpense}
        onAddExpense={() => setShowAddExpense(true)}
      />

      {/* 底部操作栏 */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg border-t border-zinc-200/60 dark:border-zinc-800/60">
        <div className="max-w-lg mx-auto flex gap-3 px-4 py-3 safe-bottom">
          <Button
            variant="secondary"
            className="flex-1"
            size="lg"
            onClick={() => setShowAddExpense(true)}
          >
            + 添加支出
          </Button>
          <Button
            className="flex-1"
            size="lg"
            onClick={() => router.push(`/trip/${trip.id}/settle`)}
            disabled={expenses.length === 0}
          >
            查看结算
          </Button>
        </div>
      </div>

      {/* 添加支出 BottomSheet */}
      <BottomSheet
        open={showAddExpense}
        onClose={() => setShowAddExpense(false)}
        title="添加支出"
      >
        <ExpenseForm
          members={members}
          defaultCurrency={trip.default_currency}
          onSubmit={async (input) => {
            await addExpense(input);
            setShowAddExpense(false);
          }}
          onClose={() => setShowAddExpense(false)}
        />
      </BottomSheet>
    </div>
  );
}
