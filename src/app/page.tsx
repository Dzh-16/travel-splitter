"use client";

import { useState, useEffect } from "react";
import { Trip } from "@/lib/types";
import { getTrips, saveTrip, deleteTrip } from "@/lib/storage";
import TripCard from "@/components/TripCard";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { useRouter } from "next/navigation";

export default function Home() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const router = useRouter();

  useEffect(() => {
    setTrips(getTrips());
  }, []);

  function createTrip() {
    const trimmed = newName.trim();
    if (!trimmed) return;
    const trip: Trip = {
      id: crypto.randomUUID(),
      name: trimmed,
      members: [],
      expenses: [],
      createdAt: new Date().toISOString(),
    };
    saveTrip(trip);
    setTrips(getTrips());
    setNewName("");
    setShowCreate(false);
    router.push(`/trip/${trip.id}`);
  }

  function removeTrip(id: string) {
    if (!confirm("确定要删除这个旅行吗？")) return;
    deleteTrip(id);
    setTrips(getTrips());
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 头部区域 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">我的旅行</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            记录并分摊旅行开销
          </p>
        </div>
      </div>

      {/* 旅行列表 */}
      {trips.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="text-6xl">🧳</div>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">还没有旅行记录</p>
          <Button onClick={() => setShowCreate(true)} size="lg">
            创建第一次旅行
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {trips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              onClick={() => router.push(`/trip/${trip.id}`)}
              onDelete={() => removeTrip(trip.id)}
            />
          ))}
        </div>
      )}

      {/* 底部创建按钮 (有数据时浮在右下角) */}
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
        onClose={() => {
          setShowCreate(false);
          setNewName("");
        }}
        title="新建旅行"
      >
        <div className="flex flex-col gap-4">
          <Input
            label="旅行名称"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createTrip()}
            placeholder="例如：三亚之旅、东京团建"
            autoFocus
          />
          <div className="flex gap-3">
            <Button onClick={createTrip} className="flex-1" disabled={!newName.trim()}>
              创建
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setShowCreate(false);
                setNewName("");
              }}
            >
              取消
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
