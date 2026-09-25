/**
 * Helper utility for handling 24-hour block calculations and date formats.
 */

export const BLOCKS_PER_HOUR = 6;
export const HOURS_PER_DAY = 24;
export const TOTAL_BLOCKS = HOURS_PER_DAY * BLOCKS_PER_HOUR; // 144 blocks
export const RETENTION_DAYS = 15;

export const MINUTE_INTERVALS = [':00', ':10', ':20', ':30', ':40', ':50'];

/**
 * Returns today's date in YYYY-MM-DD format using local time zone.
 */
export function getTodayDateString(): string {
  const now = new Date();
  return formatDateString(now);
}

/**
 * Formats a Date object to YYYY-MM-DD
 */
export function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses YYYY-MM-DD into a Date object (midnight local time)
 */
export function parseDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Formats a YYYY-MM-DD string into human-readable label (e.g., "Friday, Sep 25, 2026")
 */
export function formatFriendlyDate(dateStr: string): string {
  const date = parseDateString(dateStr);
  const today = getTodayDateString();
  
  if (dateStr === today) {
    return `Today (${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })})`;
  }
  
  const yesterday = formatDateString(offsetDays(new Date(), -1));
  if (dateStr === yesterday) {
    return `Yesterday (${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })})`;
  }

  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Offsets a date by N days
 */
export function offsetDays(date: Date, offset: number): Date {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + offset);
  return newDate;
}

/**
 * Returns list of valid dates for the 30-day window (today and past 29 days)
 */
export function getValidDateWindow(todayStr: string = getTodayDateString()): string[] {
  const today = parseDateString(todayStr);
  const dates: string[] = [];
  
  for (let i = 0; i < RETENTION_DAYS; i++) {
    const d = offsetDays(today, -i);
    dates.push(formatDateString(d));
  }
  return dates;
}

/**
 * Checks if a date string is within the allowed 30-day window
 */
export function isDateInRetentionWindow(dateStr: string, todayStr: string = getTodayDateString()): boolean {
  const target = parseDateString(dateStr).getTime();
  const today = parseDateString(todayStr).getTime();
  
  // Cutoff is 29 days prior to today (total 30 days inclusive)
  const oldestAllowed = parseDateString(formatDateString(offsetDays(parseDateString(todayStr), -(RETENTION_DAYS - 1)))).getTime();
  
  return target >= oldestAllowed && target <= today;
}

/**
 * Formats hour number (0..23) to 12-hour format string (e.g. 0 -> "12 AM", 13 -> "1 PM")
 */
export function formatHourLabel(hour: number): string {
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  if (hour > 12) return `${hour - 12} PM`;
  return `${hour} AM`;
}

/**
 * Returns an array of 24 hour labels (12 AM to 11 PM)
 */
export function get24HourLabels(): string[] {
  return Array.from({ length: 24 }, (_, i) => formatHourLabel(i));
}

/**
 * Converts a block index (0..143) to time interval text (e.g. "09:20 - 09:30")
 */
export function getBlockTimeRange(blockIndex: number): string {
  const hour = Math.floor(blockIndex / BLOCKS_PER_HOUR);
  const minuteIndex = blockIndex % BLOCKS_PER_HOUR;
  const startMinute = minuteIndex * 10;
  const endMinute = startMinute + 10;

  const formatTime = (h: number, m: number) => {
    const period = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 === 0 ? 12 : h % 12;
    const displayMin = String(m === 60 ? 0 : m).padStart(2, '0');
    const actualHour = m === 60 ? (h + 1) % 24 : displayHour;
    return `${actualHour}:${displayMin} ${m === 60 ? (h + 1 >= 12 && h + 1 < 24 ? 'PM' : 'AM') : period}`;
  };

  const startFormatted = formatTime(hour, startMinute);
  const endFormatted = formatTime(hour, endMinute);

  return `${startFormatted} – ${endFormatted}`;
}

/**
 * Generates an empty array of 144 blocks
 */
export function createEmptyDayBlocks(): (string | null)[] {
  return new Array(TOTAL_BLOCKS).fill(null);
}
