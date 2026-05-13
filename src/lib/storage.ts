import { Trip } from './types';

const TRIPS_KEY = 'travel-splitter-trips';

export function getTrips(): Trip[] {
  try {
    const raw = localStorage.getItem(TRIPS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Trip[];
  } catch {
    return [];
  }
}

export function getTrip(id: string): Trip | undefined {
  return getTrips().find((t) => t.id === id);
}

export function saveTrip(trip: Trip): void {
  const trips = getTrips();
  const idx = trips.findIndex((t) => t.id === trip.id);
  if (idx >= 0) {
    trips[idx] = trip;
  } else {
    trips.unshift(trip);
  }
  localStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
}

export function deleteTrip(id: string): void {
  const trips = getTrips().filter((t) => t.id !== id);
  localStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
}
