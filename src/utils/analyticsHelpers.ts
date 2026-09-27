import type { Activity, BlockValue, DayLog } from '../types/timeTracker';
import { parseDateString, formatDateString, offsetDays } from './timeHelpers';

export interface DayAnalyticsItem {
  activity: Activity;
  blockCount: number;
  totalMinutes: number;
  percentage: number; // Percentage of 24 hours
}

export interface WeeklyDayData {
  date: string;
  dayName: string; // 'Mon', 'Tue', etc.
  totalMinutes: number;
  activityMinutesMap: Record<string, number>; // activityId -> minutes
}

export interface WeeklyActivitySummary {
  activity: Activity;
  totalMinutes: number;
  percentageOfWeeklyTracked: number;
  avgDailyMinutes: number;
  peakDayName: string;
  peakDayMinutes: number;
}

export interface WeeklyAnalyticsResult {
  weekDates: string[];
  weekLabel: string;
  dayTotals: WeeklyDayData[];
  totalWeekMinutes: number;
  avgDailyMinutes: number;
  activitySummaries: WeeklyActivitySummary[];
}

/**
 * Given a date string (YYYY-MM-DD), returns the 7 date strings (Mon..Sun) for that week.
 */
export function getWeekDateRange(dateStr: string): string[] {
  const targetDate = parseDateString(dateStr);
  const dayOfWeek = targetDate.getDay(); // 0 is Sunday, 1 is Monday...
  
  // Convert to Monday-based index (0 = Mon, 6 = Sun)
  const distanceToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const mondayDate = offsetDays(targetDate, -distanceToMonday);

  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    dates.push(formatDateString(offsetDays(mondayDate, i)));
  }
  return dates;
}

/**
 * Formats week dates array to friendly label (e.g. "Sep 21 – Sep 27, 2026")
 */
export function formatWeekLabel(weekDates: string[]): string {
  if (weekDates.length < 7) return '';
  const start = parseDateString(weekDates[0]);
  const end = parseDateString(weekDates[6]);

  const startFormatted = start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const endFormatted = end.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  return `${startFormatted} – ${endFormatted}`;
}

/**
 * Calculates daily analytics for a single day
 */
export function calculateDayAnalytics(blocks: BlockValue[], activities: Activity[]): DayAnalyticsItem[] {
  const countsMap = new Map<string, number>();

  blocks.forEach((id) => {
    if (id) {
      countsMap.set(id, (countsMap.get(id) || 0) + 1);
    }
  });

  const totalDayBlocks = 144;
  const items: DayAnalyticsItem[] = [];

  activities.forEach((act) => {
    const blockCount = countsMap.get(act.id) || 0;
    if (blockCount > 0) {
      items.push({
        activity: act,
        blockCount,
        totalMinutes: blockCount * 10,
        percentage: (blockCount / totalDayBlocks) * 100,
      });
    }
  });

  items.sort((a, b) => b.totalMinutes - a.totalMinutes);
  return items;
}

/**
 * Calculates weekly analytics for a given 7-day date window
 */
export function calculateWeekAnalytics(
  logs: Record<string, DayLog>,
  weekDates: string[],
  activities: Activity[]
): WeeklyAnalyticsResult {
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayTotals: WeeklyDayData[] = [];
  const activityTotalsMap: Record<string, number> = {};
  const activityPeakDayMap: Record<string, { dayName: string; minutes: number }> = {};

  let totalWeekMinutes = 0;

  // Initialize maps
  activities.forEach((act) => {
    activityTotalsMap[act.id] = 0;
    activityPeakDayMap[act.id] = { dayName: 'N/A', minutes: 0 };
  });

  // Loop through 7 days
  weekDates.forEach((dateStr, idx) => {
    const dayName = dayNames[idx];
    const log = logs[dateStr];
    const blocks = log ? log.blocks : [];
    
    let dayMinutes = 0;
    const activityMinutesMap: Record<string, number> = {};

    blocks.forEach((id) => {
      if (id) {
        activityMinutesMap[id] = (activityMinutesMap[id] || 0) + 10;
        dayMinutes += 10;
      }
    });

    totalWeekMinutes += dayMinutes;

    // Track weekly activity totals & peak days
    Object.entries(activityMinutesMap).forEach(([actId, mins]) => {
      activityTotalsMap[actId] = (activityTotalsMap[actId] || 0) + mins;
      
      if (!activityPeakDayMap[actId] || mins > activityPeakDayMap[actId].minutes) {
        activityPeakDayMap[actId] = { dayName, minutes: mins };
      }
    });

    dayTotals.push({
      date: dateStr,
      dayName,
      totalMinutes: dayMinutes,
      activityMinutesMap,
    });
  });

  const avgDailyMinutes = Math.round(totalWeekMinutes / 7);

  // Generate activity summaries
  const activitySummaries: WeeklyActivitySummary[] = [];

  activities.forEach((act) => {
    const totalMinutes = activityTotalsMap[act.id] || 0;
    if (totalMinutes > 0) {
      activitySummaries.push({
        activity: act,
        totalMinutes,
        percentageOfWeeklyTracked: totalWeekMinutes > 0 ? (totalMinutes / totalWeekMinutes) * 100 : 0,
        avgDailyMinutes: Math.round(totalMinutes / 7),
        peakDayName: activityPeakDayMap[act.id]?.dayName || 'N/A',
        peakDayMinutes: activityPeakDayMap[act.id]?.minutes || 0,
      });
    }
  });

  activitySummaries.sort((a, b) => b.totalMinutes - a.totalMinutes);

  return {
    weekDates,
    weekLabel: formatWeekLabel(weekDates),
    dayTotals,
    totalWeekMinutes,
    avgDailyMinutes,
    activitySummaries,
  };
}

/**
 * Formats minutes into human friendly "Xh Ym" string (e.g. 150 -> "2h 30m")
 */
export function formatMinutes(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
