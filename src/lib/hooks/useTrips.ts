'use client';

import { useState, useEffect, useCallback } from 'react';
import { TripRow } from '../types';
import { isSupabaseAvailable, getSupabaseError, getSupabase } from '../supabase';
import * as tripsApi from '../api/trips';
import { generateUniqueInviteCode } from '../invite';

export interface TripWithStats extends TripRow {
  memberCount: number;
  expenseCount: number;
  totalExpense: number; // 分（各币种原始金额之和，仅作参考）
}

interface UseTripsResult {
  trips: TripWithStats[];
  loading: boolean;
  supabaseError: string | null;
  createTrip: (name: string) => Promise<TripRow | null>;
  deleteTrip: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

async function fetchStats(tripIds: string[]): Promise<Map<string, { members: number; expenses: number; total: number }>> {
  const stats = new Map<string, { members: number; expenses: number; total: number }>();
  const supabase = getSupabase();
  if (!supabase || tripIds.length === 0) return stats;

  // 初始化
  for (const id of tripIds) stats.set(id, { members: 0, expenses: 0, total: 0 });

  // 查询成员数量
  const { data: memberData } = await supabase
    .from('members')
    .select('trip_id')
    .in('trip_id', tripIds);

  if (memberData) {
    for (const m of memberData) {
      const s = stats.get(m.trip_id);
      if (s) s.members++;
    }
  }

  // 查询支出：需要币种和锁定汇率，换算为人民币再合计
  const { data: expenseData } = await supabase
    .from('expenses')
    .select('trip_id, amount, currency, exchange_rate')
    .in('trip_id', tripIds);

  if (expenseData) {
    for (const e of expenseData) {
      const s = stats.get(e.trip_id);
      if (!s) continue;
      s.expenses++;

      if (e.currency === 'CNY' || !e.exchange_rate) {
        // 人民币或没有锁定汇率：直接用原始金额
        s.total += e.amount;
      } else {
        // 外币且有锁定汇率：换算为人民币分
        s.total += Math.round(e.amount / e.exchange_rate);
      }
    }
  }

  return stats;
}

export function useTrips(): UseTripsResult {
  const [trips, setTrips] = useState<TripWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [supabaseError] = useState<string | null>(getSupabaseError());

  const loadTrips = useCallback(async () => {
    if (!isSupabaseAvailable()) {
      setLoading(false);
      return;
    }
    try {
      const data = await tripsApi.getMyTrips();
      // 获取每个旅行的统计信息
      const stats = await fetchStats(data.map((t) => t.id));
      const enriched: TripWithStats[] = data.map((t) => {
        const s = stats.get(t.id);
        return {
          ...t,
          memberCount: s?.members ?? 0,
          expenseCount: s?.expenses ?? 0,
          totalExpense: s?.total ?? 0,
        };
      });
      setTrips(enriched);
    } catch {
      // 静默失败
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  const createTrip = useCallback(async (name: string): Promise<TripRow | null> => {
    if (!isSupabaseAvailable()) return null;
    const inviteCode = await generateUniqueInviteCode();
    const trip = await tripsApi.createTrip(name, inviteCode);
    if (trip) {
      tripsApi.addMyTripId(trip.id);
      setTrips((prev) => [
        { ...trip, memberCount: 0, expenseCount: 0, totalExpense: 0 },
        ...prev,
      ]);
    }
    return trip;
  }, []);

  const deleteTrip = useCallback(async (id: string) => {
    await tripsApi.deleteTrip(id);
    setTrips((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return {
    trips,
    loading,
    supabaseError,
    createTrip,
    deleteTrip,
    refresh: loadTrips,
  };
}
