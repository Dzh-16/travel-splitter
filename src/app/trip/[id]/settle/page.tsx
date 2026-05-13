'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useTrip } from '@/lib/hooks/useTrip';
import SettlementView from '@/components/SettlementView';
import Button from '@/components/ui/Button';

export default function SettlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const {
    trip,
    members,
    expenses,
    participantsByExpense,
    loading,
    error,
    notJoined,
  } = useTrip(id);

  if (notJoined) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="text-6xl">🔒</div>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm text-center">你还没有加入此旅行</p>
        <Button onClick={() => router.push('/join')}>输入邀请码加入</Button>
        <Button variant="ghost" onClick={() => router.push('/')}>返回首页</Button>
      </div>
    );
  }

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
    <div className="flex flex-col gap-6">
      <button
        onClick={() => router.push(`/trip/${trip.id}`)}
        className="inline-flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        返回 {trip.name}
      </button>

      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">结算</h1>

      <SettlementView
        expenses={expenses}
        members={members}
        participantsByExpense={participantsByExpense}
        baseCurrency={trip.default_currency}
      />
    </div>
  );
}
