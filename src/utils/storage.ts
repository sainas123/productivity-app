import type { Activity, TimeTrackerData, DayLog } from '../types/timeTracker';
import { getTodayDateString, isDateInRetentionWindow, createEmptyDayBlocks, RETENTION_DAYS } from './timeHelpers';

const STORAGE_KEY = 'visual_time_tracker_data_v1';

export const DEFAULT_ACTIVITIES: Activity[] = [
  { id: 'act_sleep', name: 'Sleep & Rest', color: '#6366f1', icon: '😴', isDefault: true },
  { id: 'act_work', name: 'Deep Work / Jobs', color: '#3b82f6', icon: '💼', isDefault: true },
  { id: 'act_meals', name: 'Meals & Cooking', color: '#f97316', icon: '🍲', isDefault: true },
  { id: 'act_exercise', name: 'Exercise & Fitness', color: '#10b981', icon: '🏋️', isDefault: true },
  { id: 'act_learning', name: 'Reading & Study', color: '#eab308', icon: '📚', isDefault: true },
  { id: 'act_chores', name: 'Chores & Errands', color: '#14b8a6', icon: '🧹', isDefault: true },
  { id: 'act_leisure', name: 'Leisure & Gaming', color: '#a855f7', icon: '🎮', isDefault: true },
  { id: 'act_relax', name: 'Relax & Social', color: '#ec4899', icon: '🛋️', isDefault: true },
];

/**
 * Loads data from localStorage and automatically purges logs older than retention limit.
 */
export function loadStorageData(): TimeTrackerData {
  const todayStr = getTodayDateString();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return initializeDefaultData(todayStr);
    }

    const parsed: TimeTrackerData = JSON.parse(raw);
    if (!parsed.logs || !parsed.activities) {
      return initializeDefaultData(todayStr);
    }

    // Auto-purge logs older than retention window
    const sanitizedLogs: Record<string, DayLog> = {};
    let purgedCount = 0;

    Object.entries(parsed.logs).forEach(([dateStr, log]) => {
      if (isDateInRetentionWindow(dateStr, todayStr)) {
        sanitizedLogs[dateStr] = log;
      } else {
        purgedCount++;
      }
    });

    if (purgedCount > 0) {
      console.log(`[Time Tracker] Auto-purged ${purgedCount} log(s) older than ${RETENTION_DAYS} days.`);
    }

    const updatedData: TimeTrackerData = {
      version: 1,
      activities: parsed.activities.length > 0 ? parsed.activities : DEFAULT_ACTIVITIES,
      logs: sanitizedLogs,
    };

    // Save cleaned data back
    saveStorageData(updatedData);
    return updatedData;
  } catch (error) {
    console.error('Failed to load local storage time tracker data:', error);
    return initializeDefaultData(todayStr);
  }
}

/**
 * Saves current time tracker data state to localStorage.
 */
export function saveStorageData(data: TimeTrackerData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

/**
 * Initializes a new dataset with default activities and empty log for today.
 */
function initializeDefaultData(todayStr: string): TimeTrackerData {
  const defaultData: TimeTrackerData = {
    version: 1,
    activities: DEFAULT_ACTIVITIES,
    logs: {
      [todayStr]: {
        date: todayStr,
        blocks: createEmptyDayBlocks(),
        updatedAt: Date.now(),
      }
    }
  };
  saveStorageData(defaultData);
  return defaultData;
}
