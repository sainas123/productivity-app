import React, { useState, useMemo } from 'react';
import type { TimeTrackerData } from '../types/timeTracker';
import { 
  getTodayDateString, 
  getValidDateWindow, 
  formatFriendlyDate, 
  parseDateString, 
  formatDateString, 
  offsetDays 
} from '../utils/timeHelpers';
import { 
  getWeekDateRange, 
  calculateDayAnalytics, 
  calculateWeekAnalytics, 
  formatMinutes 
} from '../utils/analyticsHelpers';
import { 
  BarChart3, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  TrendingUp, 
  Award, 
  PieChart 
} from 'lucide-react';

interface SummarizerProps {
  data: TimeTrackerData;
  currentDate: string;
  onDateChange: (date: string) => void;
}

export const Summarizer: React.FC<SummarizerProps> = ({ data, currentDate, onDateChange }) => {
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const todayStr = getTodayDateString();
  const validDates = getValidDateWindow(todayStr);

  // Computed Week Dates (Mon..Sun)
  const currentWeekDates = useMemo(() => getWeekDateRange(currentDate), [currentDate]);

  // Compute Daily Analytics
  const dayLog = data.logs[currentDate];
  const dayBlocks = dayLog ? dayLog.blocks : [];
  const dayAnalytics = useMemo(
    () => calculateDayAnalytics(dayBlocks, data.activities),
    [dayBlocks, data.activities]
  );

  // Compute Weekly Analytics
  const weekAnalytics = useMemo(
    () => calculateWeekAnalytics(data.logs, currentWeekDates, data.activities),
    [data.logs, currentWeekDates, data.activities]
  );

  // Navigation handlers
  const handlePrevDay = () => {
    const prev = formatDateString(offsetDays(parseDateString(currentDate), -1));
    if (validDates.includes(prev)) onDateChange(prev);
  };

  const handleNextDay = () => {
    const next = formatDateString(offsetDays(parseDateString(currentDate), 1));
    if (validDates.includes(next)) onDateChange(next);
  };

  const handlePrevWeek = () => {
    const prevWeekDate = formatDateString(offsetDays(parseDateString(currentWeekDates[0]), -7));
    onDateChange(prevWeekDate);
  };

  const handleNextWeek = () => {
    const nextWeekDate = formatDateString(offsetDays(parseDateString(currentWeekDates[0]), 7));
    if (parseDateString(nextWeekDate) <= parseDateString(todayStr)) {
      onDateChange(nextWeekDate);
    }
  };

  // Stats calculation for day
  const totalDayTrackedMins = dayAnalytics.reduce((acc, item) => acc + item.totalMinutes, 0);
  const totalDayUnallocatedMins = 1440 - totalDayTrackedMins; // 24h = 1440 mins
  const topDayActivity = dayAnalytics[0] || null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Top Header Card & Mode Switcher */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              background: 'rgba(168, 85, 247, 0.15)',
              color: '#a855f7',
              padding: '0.5rem',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BarChart3 size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#fff' }}>
                Time Summarizer & Screen Time Analytics
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Visual stats, hours logged, percentages, and weekly activity charts
              </p>
            </div>
          </div>

          {/* View Toggle Pill (Day vs Week) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(0, 0, 0, 0.3)',
            padding: '3px',
            borderRadius: '10px',
            border: '1px solid var(--bg-card-border)',
            gap: '4px'
          }}>
            <button
              onClick={() => setViewMode('day')}
              style={{
                padding: '0.4rem 0.9rem',
                borderRadius: '7px',
                fontSize: '0.8rem',
                fontWeight: '600',
                border: 'none',
                background: viewMode === 'day' ? 'var(--accent-primary)' : 'transparent',
                color: viewMode === 'day' ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Daily View
            </button>
            <button
              onClick={() => setViewMode('week')}
              style={{
                padding: '0.4rem 0.9rem',
                borderRadius: '7px',
                fontSize: '0.8rem',
                fontWeight: '600',
                border: 'none',
                background: viewMode === 'week' ? '#a855f7' : 'transparent',
                color: viewMode === 'week' ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Weekly View
            </button>
          </div>

        </div>

        {/* Date / Week Navigator Sub-bar */}
        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--bg-card-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          
          {viewMode === 'day' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button className="btn btn-sm" onClick={handlePrevDay} title="Previous Day">
                <ChevronLeft size={16} />
              </button>
              
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Calendar size={15} style={{ position: 'absolute', left: '0.75rem', color: 'var(--accent-primary)', pointerEvents: 'none' }} />
                <select
                  value={currentDate}
                  onChange={(e) => onDateChange(e.target.value)}
                  className="input-field"
                  style={{
                    paddingLeft: '2.3rem',
                    paddingRight: '1rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    background: 'rgba(0, 0, 0, 0.4)',
                    minWidth: '220px',
                    appearance: 'auto'
                  }}
                >
                  {validDates.map((dateStr) => (
                    <option key={dateStr} value={dateStr} style={{ background: '#111827', color: '#fff' }}>
                      {formatFriendlyDate(dateStr)}
                    </option>
                  ))}
                </select>
              </div>

              <button className="btn btn-sm" onClick={handleNextDay} disabled={currentDate === todayStr} title="Next Day">
                <ChevronRight size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button className="btn btn-sm" onClick={handlePrevWeek} title="Previous Week">
                <ChevronLeft size={16} />
              </button>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                padding: '0.45rem 0.85rem', 
                background: 'rgba(0, 0, 0, 0.4)', 
                borderRadius: '8px', 
                border: '1px solid var(--bg-card-border)',
                fontWeight: '600',
                fontSize: '0.875rem'
              }}>
                <Calendar size={15} color="#a855f7" />
                <span>Week: {weekAnalytics.weekLabel}</span>
              </div>
              <button className="btn btn-sm" onClick={handleNextWeek} title="Next Week">
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {viewMode === 'day' ? 'Showing 24-Hour Day Allocation' : 'Showing 7-Day Weekly Screen Time Allocation'}
          </div>

        </div>
      </div>

      {/* =================================================================== */}
      {/* DAILY ANALYTICS VIEW */}
      {/* =================================================================== */}
      {viewMode === 'day' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Daily Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                <span>Total Tracked</span>
                <Clock size={14} color="var(--accent-primary)" />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#fff' }}>
                {formatMinutes(totalDayTrackedMins)}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {Math.round((totalDayTrackedMins / 1440) * 100)}% of 24 hours
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                <span>Unallocated</span>
                <PieChart size={14} color="#f59e0b" />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#fff' }}>
                {formatMinutes(totalDayUnallocatedMins)}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {Math.round((totalDayUnallocatedMins / 1440) * 100)}% remaining
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                <span>Top Activity Today</span>
                <Award size={14} color="#10b981" />
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {topDayActivity ? `${topDayActivity.activity.icon} ${topDayActivity.activity.name}` : 'None'}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#10b981' }}>
                {topDayActivity ? formatMinutes(topDayActivity.totalMinutes) : '0m'}
              </div>
            </div>
          </div>

          {/* Daily Activity Bar Chart */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#fff', marginBottom: '1rem' }}>
              Daily Hours per Activity
            </h3>
            
            {dayAnalytics.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {dayAnalytics.map((item) => {
                  const act = item.activity;
                  const hoursStr = formatMinutes(item.totalMinutes);
                  return (
                    <div key={act.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            backgroundColor: act.color,
                            boxShadow: `0 0 6px ${act.color}`
                          }} />
                          <span style={{ fontWeight: '600', color: '#fff' }}>
                            {act.icon} {act.name}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                          <span style={{ fontWeight: '700', color: '#fff' }}>{hoursStr}</span>
                          <span style={{ fontSize: '0.75rem', color: act.color, fontWeight: '600' }}>
                            {item.percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      {/* Bar Fill */}
                      <div style={{ 
                        height: '10px', 
                        width: '100%', 
                        backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                        borderRadius: '5px', 
                        overflow: 'hidden' 
                      }}>
                        <div style={{ 
                          width: `${item.percentage}%`, 
                          height: '100%', 
                          backgroundColor: act.color, 
                          borderRadius: '5px',
                          transition: 'width 0.4s ease'
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No activity recorded for this day yet. Switch to the Timesheet tab to paint blocks!
              </div>
            )}
          </div>

        </div>
      )}

      {/* =================================================================== */}
      {/* WEEKLY ANALYTICS VIEW */}
      {/* =================================================================== */}
      {viewMode === 'week' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Weekly Overview Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                <span>Weekly Total</span>
                <Clock size={14} color="#a855f7" />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#fff' }}>
                {formatMinutes(weekAnalytics.totalWeekMinutes)}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Across 7 days (Mon – Sun)
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                <span>Daily Average</span>
                <TrendingUp size={14} color="var(--accent-primary)" />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#fff' }}>
                {formatMinutes(weekAnalytics.avgDailyMinutes)} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ day</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Average daily tracked time
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                <span>Top Activity This Week</span>
                <Award size={14} color="#10b981" />
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {weekAnalytics.activitySummaries[0] ? `${weekAnalytics.activitySummaries[0].activity.icon} ${weekAnalytics.activitySummaries[0].activity.name}` : 'None'}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#10b981' }}>
                {weekAnalytics.activitySummaries[0] ? formatMinutes(weekAnalytics.activitySummaries[0].totalMinutes) : '0m'}
              </div>
            </div>
          </div>

          {/* Weekly Stacked Columns Bar Chart (Mon - Sun) */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#fff', marginBottom: '1rem' }}>
              Weekly Screen Time Distribution (Mon – Sun)
            </h3>

            {/* 7 Columns Container */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.75rem', alignItems: 'end', minHeight: '220px', paddingBottom: '0.5rem' }}>
              {weekAnalytics.dayTotals.map((dayData) => {
                const dayMins = dayData.totalMinutes;
                const maxPossibleMins = 1440; // 24 hours
                const colHeightPercent = Math.max((dayMins / maxPossibleMins) * 100, 4);

                return (
                  <div key={dayData.date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', height: '100%', justifyContent: 'flex-end' }}>
                    
                    {/* Hours label on top of bar */}
                    <span style={{ fontSize: '0.7rem', fontWeight: '700', color: dayMins > 0 ? '#fff' : 'var(--text-muted)' }}>
                      {formatMinutes(dayMins)}
                    </span>

                    {/* Stacked Vertical Bar Column */}
                    <div style={{ 
                      width: '100%', 
                      maxWidth: '42px',
                      height: `${colHeightPercent}%`, 
                      backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                      borderRadius: '8px', 
                      overflow: 'hidden', 
                      display: 'flex',
                      flexDirection: 'column-reverse',
                      border: '1px solid var(--bg-card-border)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                    }}>
                      {Object.entries(dayData.activityMinutesMap).map(([actId, mins]) => {
                        const act = data.activities.find((a) => a.id === actId);
                        if (!act || mins === 0) return null;
                        const segmentPercent = (mins / dayMins) * 100;
                        return (
                          <div
                            key={actId}
                            style={{
                              height: `${segmentPercent}%`,
                              backgroundColor: act.color,
                              width: '100%'
                            }}
                            title={`${dayData.dayName}: ${act.name} (${formatMinutes(mins)})`}
                          />
                        );
                      })}
                    </div>

                    {/* Day Name Label */}
                    <span style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: '700', 
                      color: dayData.date === currentDate ? 'var(--accent-primary)' : 'var(--text-secondary)' 
                    }}>
                      {dayData.dayName}
                    </span>

                  </div>
                );
              })}
            </div>
          </div>

          {/* Weekly Activity Breakdown Cards Table */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#fff', marginBottom: '1rem' }}>
              Weekly Activity Summary Table
            </h3>

            {weekAnalytics.activitySummaries.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {weekAnalytics.activitySummaries.map((item) => {
                  const act = item.activity;
                  return (
                    <div
                      key={act.id}
                      style={{
                        background: 'rgba(0, 0, 0, 0.25)',
                        border: '1px solid var(--bg-card-border)',
                        borderRadius: '10px',
                        padding: '0.85rem 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '0.75rem'
                      }}
                    >
                      {/* Left Activity Info */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: '180px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          backgroundColor: act.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1rem',
                          boxShadow: `0 2px 8px ${act.color}50`
                        }}>
                          {act.icon}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#fff' }}>
                            {act.name}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {item.percentageOfWeeklyTracked.toFixed(1)}% of weekly tracked time
                          </div>
                        </div>
                      </div>

                      {/* Right Stats */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Weekly Total</div>
                          <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff' }}>
                            {formatMinutes(item.totalMinutes)}
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Daily Avg</div>
                          <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--accent-primary)' }}>
                            {formatMinutes(item.avgDailyMinutes)} / day
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Peak Day</div>
                          <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#10b981' }}>
                            {item.peakDayName} ({formatMinutes(item.peakDayMinutes)})
                          </div>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No activity recorded for this week.
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
