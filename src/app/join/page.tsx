'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getTripByInviteCode } from '@/lib/api/trips';
import { addMyTripId } from '@/lib/api/trips';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function JoinPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [searching, setSearching] = useState(false);

  async function join() {
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length !== 6) {
      setError('请输入 6 位邀请码');
      return;
    }

    setSearching(true);
    setError('');

    try {
      const trip = await getTripByInviteCode(trimmed);
      if (!trip) {
        setError('无效的邀请码，未找到对应旅行');
        return;
      }
      addMyTripId(trip.id);
      router.push(`/trip/${trip.id}`);
    } catch {
      setError('网络错误，请重试');
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <button
        onClick={() => router.push('/')}
        className="inline-flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        返回
      </button>

      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          加入旅行
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          输入好友分享的 6 位邀请码加入旅行
        </p>
      </div>

      <Input
        label="邀请码"
        value={code}
        onChange={(e) => {
          setCode(e.target.value.toUpperCase().slice(0, 6));
          setError('');
        }}
        onKeyDown={(e) => e.key === 'Enter' && join()}
        placeholder="例如：ABC123"
        maxLength={6}
        autoFocus
        className="font-mono tracking-widest text-lg text-center"
      />

      {error && (
        <p className="text-sm text-red-500 -mt-4">{error}</p>
      )}

      <Button
        onClick={join}
        size="lg"
        className="w-full"
        disabled={code.length !== 6 || searching}
      >
        {searching ? '查找中...' : '加入旅行'}
      </Button>
    </div>
  );
}
