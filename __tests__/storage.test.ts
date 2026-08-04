import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  clearAttendance,
  getAttendanceByDate,
  getAttendanceHistory,
  saveAttendance,
} from '../src/services/storage.service';
import { AttendanceRecord } from '../src/types';

function makeRecord(overrides: Partial<AttendanceRecord> = {}): AttendanceRecord {
  return {
    id: 'rec-1',
    date: '2026-08-04',
    time: '09:30 AM',
    timestamp: 1722750600000,
    latitude: 28.6139,
    longitude: 77.209,
    distance: 12,
    ...overrides,
  };
}

describe('attendance storage service', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('returns an empty history when nothing is stored', async () => {
    await expect(getAttendanceHistory()).resolves.toEqual([]);
  });

  it('saves and reads back a record', async () => {
    const record = makeRecord();
    await saveAttendance(record);

    const history = await getAttendanceHistory();
    expect(history).toHaveLength(1);
    expect(history[0]).toEqual(record);
  });

  it('sorts records newest first', async () => {
    const older = makeRecord({ id: 'old', timestamp: 1000 });
    const newer = makeRecord({ id: 'new', timestamp: 2000 });
    await saveAttendance(older);
    await saveAttendance(newer);

    const history = await getAttendanceHistory();
    expect(history.map(r => r.id)).toEqual(['new', 'old']);
  });

  it('finds a record by date', async () => {
    await saveAttendance(makeRecord());
    const found = await getAttendanceByDate('2026-08-04');
    expect(found?.id).toBe('rec-1');
    await expect(getAttendanceByDate('2020-01-01')).resolves.toBeNull();
  });

  it('clears all records', async () => {
    await saveAttendance(makeRecord());
    await clearAttendance();
    await expect(getAttendanceHistory()).resolves.toEqual([]);
  });

  it('returns an empty array for corrupted data', async () => {
    await AsyncStorage.setItem('@geo_attendance/records', '{not json');
    await expect(getAttendanceHistory()).resolves.toEqual([]);
  });
});
