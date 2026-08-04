import AsyncStorage from '@react-native-async-storage/async-storage';
import { AttendanceRecord } from '../types';
import { STORAGE_KEYS } from '../constants';

const STORAGE_KEY = STORAGE_KEYS.ATTENDANCE;

/** Returns all saved attendance records, newest first. */
export async function getAttendanceHistory(): Promise<AttendanceRecord[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .filter(isAttendanceRecord)
      .sort((a, b) => b.timestamp - a.timestamp);
  } catch {
    return [];
  }
}

function isAttendanceRecord(value: unknown): value is AttendanceRecord {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === 'string' &&
    typeof record.date === 'string' &&
    typeof record.time === 'string' &&
    typeof record.timestamp === 'number' &&
    typeof record.latitude === 'number' &&
    typeof record.longitude === 'number' &&
    typeof record.distance === 'number'
  );
}

/** Saves a single attendance record. */
export async function saveAttendance(record: AttendanceRecord): Promise<void> {
  const history = await getAttendanceHistory();
  history.push(record);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

/** Returns the attendance record for a given `YYYY-MM-DD` date, if any. */
export async function getAttendanceByDate(
  dateKey: string,
): Promise<AttendanceRecord | null> {
  const history = await getAttendanceHistory();
  return history.find(record => record.date === dateKey) ?? null;
}

/** Removes every saved attendance record. */
export async function clearAttendance(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
