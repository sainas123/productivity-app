export interface Activity {
  id: string;
  name: string;
  color: string; // Hex or HSL color code
  icon?: string; // Optional emoji or icon key
  isDefault?: boolean;
}

export type BlockValue = string | null; // activityId or null (empty/unallocated)

export interface DayLog {
  date: string; // ISO format 'YYYY-MM-DD'
  // Array of exactly 144 items (24 hours * 6 ten-minute blocks)
  // Index 0 = 00:00-00:10, Index 1 = 00:10-00:20 ... Index 143 = 23:50-24:00
  blocks: BlockValue[];
  note?: string;
  updatedAt: number;
  savedSnapshot?: {
    blocks: BlockValue[];
    savedAt: number;
  };
}

export interface ActivitySummary {
  activity: Activity | null; // null represents Unallocated / Empty
  blockCount: number;
  totalMinutes: number;
  percentage: number;
}

export interface TimeTrackerData {
  activities: Activity[];
  logs: Record<string, DayLog>; // Keyed by YYYY-MM-DD
  version: number;
}
