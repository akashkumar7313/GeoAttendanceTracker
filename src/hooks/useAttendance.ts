import { useCallback, useEffect, useState } from 'react';
import { AttendanceRecord, Coordinates } from '../types';
import {
  clearAttendance,
  getAttendanceByDate,
  getAttendanceHistory,
  saveAttendance,
} from '../services/storage.service';
import { formatTime, getDateKey } from '../utils/date';

interface UseAttendance {
  history: AttendanceRecord[];
  todayRecord: AttendanceRecord | null;
  /** Reloads history and today's record from storage. */
  reload: () => Promise<void>;
  /**
   * Records an attendance check-in. Returns `false` when the user has
   * already checked in today (duplicate check-in is prevented).
   */
  checkIn: (location: Coordinates, distance: number) => Promise<boolean>;
  /** Removes every saved attendance record. */
  clearHistory: () => Promise<void>;
}

/** Generates a reasonably unique record id. */
function generateId(timestamp: number): string {
  const randomPart = Math.random().toString(36).slice(2, 10);
  return `${timestamp}-${randomPart}`;
}

/**
 * Encapsulates attendance state and all storage interactions.
 * Storage is the single source of truth, so this works fully offline.
 */
export function useAttendance(): UseAttendance {
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);

  const reload = useCallback(async () => {
    const records = await getAttendanceHistory();
    setHistory(records);
    const todayKey = getDateKey(new Date());
    setTodayRecord(records.find(record => record.date === todayKey) ?? null);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const checkIn = useCallback(
    async (location: Coordinates, distance: number): Promise<boolean> => {
      const now = new Date();
      const dateKey = getDateKey(now);

      const existing = await getAttendanceByDate(dateKey);
      if (existing) {
        return false;
      }

      const record: AttendanceRecord = {
        id: generateId(now.getTime()),
        date: dateKey,
        time: formatTime(now),
        timestamp: now.getTime(),
        latitude: location.latitude,
        longitude: location.longitude,
        distance,
      };

      await saveAttendance(record);
      setHistory(prev => [record, ...prev]);
      setTodayRecord(record);
      return true;
    },
    [],
  );

  const clearHistory = useCallback(async () => {
    await clearAttendance();
    setHistory([]);
    setTodayRecord(null);
  }, []);

  return { history, todayRecord, reload, checkIn, clearHistory };
}
