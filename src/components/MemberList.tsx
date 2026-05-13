import { useState } from 'react';
import { MemberRow } from '@/lib/types';
import Button from './ui/Button';
import Input from './ui/Input';

interface MemberListProps {
  members: MemberRow[];
  onAdd: (name: string) => Promise<void>;
  onRemove: (memberId: string) => Promise<void>;
}

const AVATAR_COLORS = [
  'bg-teal-500', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500',
  'bg-orange-500', 'bg-green-500', 'bg-cyan-500', 'bg-amber-500',
];

export default function MemberList({ members, onAdd, onRemove }: MemberListProps) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);

  async function addMember() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setBusy(true);
    try {
      await onAdd(trimmed);
      setName('');
      setAdding(false);
    } catch {
      // 错误由父组件处理
    } finally {
      setBusy(false);
    }
  }

  async function removeMember(memberId: string) {
    setBusy(true);
    try {
      await onRemove(memberId);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
          成员 ({members.length})
        </h3>
        <Button variant="ghost" size="sm" onClick={() => setAdding(true)} disabled={busy}>
          + 添加
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
        {members.map((member, idx) => (
          <div
            key={member.id}
            className="flex flex-col items-center gap-1 flex-shrink-0 group relative"
          >
            <div
              className={`w-12 h-12 rounded-full ${AVATAR_COLORS[idx % AVATAR_COLORS.length]} flex items-center justify-center text-white font-bold text-lg`}
            >
              {member.name.charAt(0)}
            </div>
            <span className="text-xs text-zinc-600 dark:text-zinc-400 max-w-[64px] truncate">
              {member.name}
            </span>
            <button
              onClick={() => removeMember(member.id)}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label={`删除 ${member.name}`}
              disabled={busy}
            >
              &times;
            </button>
          </div>
        ))}

        {members.length === 0 && (
          <p className="text-sm text-zinc-400 dark:text-zinc-500 py-2">还没有成员，点击添加</p>
        )}
      </div>

      {adding && (
        <div className="flex items-end gap-2 mt-3">
          <Input
            label="成员名称"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addMember()}
            placeholder="输入姓名"
            autoFocus
          />
          <Button size="sm" onClick={addMember} disabled={busy || !name.trim()}>
            添加
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>
            取消
          </Button>
        </div>
      )}
    </div>
  );
}
