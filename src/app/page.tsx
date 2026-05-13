'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTrips } from '@/lib/hooks/useTrips';
import TripCard from '@/components/TripCard';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';

export default function Home() {
  const { trips, loading, supabaseError, createTrip, deleteTrip } = useTrips();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  async function handleCreate() {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setCreating(true);
    try {
      const trip = await createTrip(trimmed);
      if (trip) {
        setNewName('');
        setShowCreate(false);
        router.push(`/trip/${trip.id}`);
      }
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('确定要删除这个旅行吗？')) return;
    await deleteTrip(id);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            我的旅行
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            记录并分摊旅行开销
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/join')}
        >
          加入旅行
        </Button>
      </div>

      {/* Supabase 未配置提示 */}
      {supabaseError && (
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Supabase 未配置。请在项目根目录创建 <code className="font-mono bg-amber-100 dark:bg-amber-900/40 px-1 rounded">.env.local</code> 并填入：
          </p>
          <pre className="text-xs text-amber-600 dark:text-amber-400 mt-2 bg-amber-100 dark:bg-amber-900/40 p-2 rounded-lg overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key`}
          </pre>
          <p className="text-xs text-amber-500 dark:text-amber-400 mt-2">
            参考 <code className="font-mono">.env.example</code> 文件。
          </p>
        </div>
      )}

      {/* 加载中 */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* 旅行列表 */}
      {!loading && trips.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="text-6xl">🧳</div>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            {supabaseError ? '配置 Supabase 后开始使用' : '还没有旅行记录'}
          </p>
          <Button
            onClick={() => setShowCreate(true)}
            size="lg"
            disabled={!!supabaseError}
          >
            创建第一次旅行
          </Button>
        </div>
      )}

      {!loading && trips.length > 0 && (
        <div className="space-y-3">
          {trips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              memberCount={trip.memberCount}
              expenseCount={trip.expenseCount}
              totalExpense={trip.totalExpense}
              onClick={() => router.push(`/trip/${trip.id}`)}
              onDelete={() => handleDelete(trip.id)}
            />
          ))}
        </div>
      )}

      {/* FAB 创建按钮 */}
      {trips.length > 0 && (
        <button
          onClick={() => setShowCreate(true)}
          className="fixed bottom-6 right-4 z-40 w-14 h-14 bg-teal-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-teal-600 active:scale-95 transition-all"
          aria-label="新建旅行"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      )}

      {/* 创建旅行 Modal */}
      <Modal
        open={showCreate}
        onClose={() => { setShowCreate(false); setNewName(''); }}
        title="新建旅行"
      >
        <div className="flex flex-col gap-4">
          <Input
            label="旅行名称"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="例如：三亚之旅、东京团建"
            autoFocus
          />
          <div className="flex gap-3">
            <Button
              onClick={handleCreate}
              className="flex-1"
              disabled={!newName.trim() || creating}
            >
              {creating ? '创建中...' : '创建'}
            </Button>
            <Button
              variant="ghost"
              onClick={() => { setShowCreate(false); setNewName(''); }}
            >
              取消
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
