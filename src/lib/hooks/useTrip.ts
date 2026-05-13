'use client';

import { useState, useEffect, useCallback } from 'react';
import { TripRow, MemberRow, ExpenseRow, ExpenseParticipantRow } from '../types';
import { getSupabase } from '../supabase';
import * as tripsApi from '../api/trips';
import * as membersApi from '../api/members';
import * as expensesApi from '../api/expenses';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UseTripResult {
  trip: TripRow | null;
  members: MemberRow[];
  expenses: ExpenseRow[];
  participantsByExpense: Record<string, ExpenseParticipantRow[]>;
  loading: boolean;
  error: string | null;
  addMember: (name: string) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  addExpense: (input: {
    title: string;
    amount: number;
    currency: string;
    payerId: string;
    shares: Record<string, number>;
  }) => Promise<void>;
  removeExpense: (expenseId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useTrip(tripId: string): UseTripResult {
  const [trip, setTrip] = useState<TripRow | null>(null);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [participantsByExpense, setParticipants] = useState<
    Record<string, ExpenseParticipantRow[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /** 全量加载数据 */
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [tripData, membersData, expensesData, participantsData] =
        await Promise.all([
          tripsApi.getTrip(tripId),
          membersApi.getMembers(tripId),
          expensesApi.getExpenses(tripId),
          expensesApi.getAllParticipantsForTrip(tripId),
        ]);

      if (!tripData) {
        setError('旅行不存在');
        setLoading(false);
        return;
      }

      setTrip(tripData);
      setMembers(membersData);
      setExpenses(expensesData);
      setParticipants(participantsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  /** 首次加载 */
  useEffect(() => {
    loadData();
  }, [loadData]);

  /** Supabase Realtime 订阅 */
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;

    let channel: RealtimeChannel;

    try {
      channel = supabase
        .channel(`trip:${tripId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'members',
            filter: `trip_id=eq.${tripId}`,
          },
          () => {
            // 成员变化时重新加载成员列表
            membersApi.getMembers(tripId).then(setMembers).catch(console.error);
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'expenses',
            filter: `trip_id=eq.${tripId}`,
          },
          () => {
            // 支出变化时重新加载支出列表和参与人
            Promise.all([
              expensesApi.getExpenses(tripId),
              expensesApi.getAllParticipantsForTrip(tripId),
            ])
              .then(([exps, parts]) => {
                setExpenses(exps);
                setParticipants(parts);
              })
              .catch(console.error);
          }
        )
        .subscribe();
    } catch {
      // Realtime 订阅失败不影响数据加载
      return;
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tripId]);

  /** 添加成员 */
  const addMember = useCallback(
    async (name: string) => {
      setError(null);
      try {
        const newMember = await membersApi.addMember(tripId, name);
        if (newMember) {
          setMembers((prev) => [...prev, newMember]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '添加成员失败');
        throw err;
      }
    },
    [tripId]
  );

  /** 删除成员 */
  const removeMember = useCallback(
    async (memberId: string) => {
      setError(null);
      try {
        await membersApi.removeMember(memberId);
        setMembers((prev) => prev.filter((m) => m.id !== memberId));
        // 同时清理本地关联的支出和参与人
        setExpenses((prev) =>
          prev.filter((e) => e.paid_by_member_id !== memberId)
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : '删除成员失败');
        throw err;
      }
    },
    []
  );

  /** 添加支出 */
  const addExpense = useCallback(
    async (input: {
      title: string;
      amount: number;
      currency: string;
      payerId: string;
      shares: Record<string, number>;
    }) => {
      setError(null);
      try {
        const newExpense = await expensesApi.addExpense(tripId, input);
        if (newExpense) {
          setExpenses((prev) => [newExpense, ...prev]);
          // 刷新参与人数据
          const parts = await expensesApi.getAllParticipantsForTrip(tripId);
          setParticipants(parts);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '添加支出失败');
        throw err;
      }
    },
    [tripId]
  );

  /** 删除支出 */
  const removeExpense = useCallback(
    async (expenseId: string) => {
      setError(null);
      try {
        await expensesApi.removeExpense(expenseId);
        setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
      } catch (err) {
        setError(err instanceof Error ? err.message : '删除支出失败');
        throw err;
      }
    },
    []
  );

  return {
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
    refresh: loadData,
  };
}
