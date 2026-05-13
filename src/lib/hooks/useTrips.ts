'use client';

import { useState, useEffect, useCallback } from 'react';
import { TripRow } from '../types';
import { isSupabaseAvailable, getSupabaseError } from '../supabase';
import * as tripsApi from '../api/trips';
import { generateUniqueInviteCode } from '../invite';

interface UseTripsResult {
  trips: TripRow[];
  loading: boolean;
  supabaseError: string | null;
  createTrip: (name: string) => Promise<TripRow | null>;
  deleteTrip: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useTrips(): UseTripsResult {
  const [trips, setTrips] = useState<TripRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [supabaseError] = useState<string | null>(getSupabaseError());

  const loadTrips = useCallback(async () => {
    if (!isSupabaseAvailable()) {
      setLoading(false);
      return;
    }
    try {
      const data = await tripsApi.getMyTrips();
      setTrips(data);
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
      setTrips((prev) => [trip, ...prev]);
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
