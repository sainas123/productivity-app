import React from 'react';
import type { Activity, BlockValue, ActivitySummary } from '../types/timeTracker';
import { TOTAL_BLOCKS } from '../utils/timeHelpers';
import { PieChart, AlertCircle } from 'lucide-react';

interface DailySummaryProps {
  blocks: BlockValue[];
  activities: Activity[];
}

export const DailySummary: React.FC<DailySummaryProps> = ({ blocks, activities }) => {
  // Compute summary metrics for each activity
  const summaries: ActivitySummary[] = React.useMemo(() => {
    const countsMap = new Map<string | null, number>();
    
    // Count blocks for each activity and unallocated (null)
    blocks.forEach((id) => {
      countsMap.set(id, (countsMap.get(id) || 0) + 1);
    });

    const result: ActivitySummary[] = [];

    // Add entries for defined activities
    activities.forEach((act) => {
      const count = countsMap.get(act.id) || 0;
      if (count > 0) {
        result.push({
          activity: act,
          blockCount: count,
          totalMinutes: count * 10,
          percentage: (count / TOTAL_BLOCKS) * 100,
        });
      }
    });

    // Sort by time spent (highest first)
    result.sort((a, b) => b.blockCount - a.blockCount);

    return result;
  }, [blocks, activities]);

  // Compute overall tracked vs unallocated
  const unallocatedBlocks = blocks.filter((b) => b === null).length;
  const trackedBlocks = TOTAL_BLOCKS - unallocatedBlocks;

  const trackedMins = trackedBlocks * 10;
  const unallocatedMins = unallocatedBlocks * 10;

  const formatHoursMins = (totalMinutes: number) => {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  const trackedPercentage = Math.round((trackedBlocks / TOTAL_BLOCKS) * 100);

  return (
    <div className="glass-panel summary-container" style={{ padding: '1.25rem' }}>
      
      {/* Summary Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#10b981',
            padding: '0.4rem',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <PieChart size={18} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#fff' }}>
              Daily Time Summary
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Calculated from 10-minute block recordings
            </p>
          </div>
        </div>

        {/* Quick Stat Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff' }}>
              {formatHoursMins(trackedMins)} <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>/ 24h</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: trackedPercentage >= 80 ? '#10b981' : 'var(--text-muted)' }}>
              {trackedPercentage}% Day Recorded
            </div>
          </div>
        </div>
      </div>

      {/* Visual Stacked 24-Hour Distribution Bar */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
          <span>Visual Distribution</span>
          <span>144 Blocks = 100% of 24h</span>
        </div>

        <div style={{ 
          height: '24px', 
          width: '100%', 
          backgroundColor: 'var(--cell-empty-bg)', 
          borderRadius: '8px', 
          overflow: 'hidden', 
          display: 'flex',
          border: '1px solid var(--bg-card-border)',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)'
        }}>
          {summaries.map((item) => (
            <div
              key={item.activity!.id}
              style={{
                width: `${item.percentage}%`,
                backgroundColor: item.activity!.color,
                height: '100%',
                transition: 'width 0.3s ease',
                position: 'relative'
              }}
              title={`${item.activity!.name}: ${formatHoursMins(item.totalMinutes)} (${item.percentage.toFixed(1)}%)`}
            />
          ))}
          {unallocatedBlocks > 0 && (
            <div
              style={{
                width: `${(unallocatedBlocks / TOTAL_BLOCKS) * 100}%`,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                height: '100%',
                transition: 'width 0.3s ease'
              }}
              title={`Unallocated: ${formatHoursMins(unallocatedMins)} (${((unallocatedBlocks / TOTAL_BLOCKS) * 100).toFixed(1)}%)`}
            />
          )}
        </div>
      </div>

      {/* Activity Breakdown Cards Grid */}
      {summaries.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
          gap: '0.75rem'
        }}>
          {summaries.map((item) => {
            const act = item.activity!;
            return (
              <div
                key={act.id}
                style={{
                  background: 'rgba(0, 0, 0, 0.25)',
                  border: '1px solid var(--bg-card-border)',
                  borderRadius: '10px',
                  padding: '0.75rem 0.85rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: act.color,
                      boxShadow: `0 0 6px ${act.color}`
                    }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#fff' }}>
                      {act.icon} {act.name}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: act.color }}>
                    {item.percentage.toFixed(1)}%
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff' }}>
                    {formatHoursMins(item.totalMinutes)}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {item.blockCount} {item.blockCount === 1 ? 'block' : 'blocks'}
                  </span>
                </div>

                {/* Progress fill */}
                <div style={{ height: '4px', width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${item.percentage}%`, height: '100%', backgroundColor: act.color, borderRadius: '2px' }} />
                </div>
              </div>
            );
          })}

          {/* Unallocated Card if any */}
          {unallocatedBlocks > 0 && (
            <div style={{
              background: 'rgba(0, 0, 0, 0.15)',
              border: '1px dashed rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              padding: '0.75rem 0.85rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                  <AlertCircle size={14} />
                  <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>Unallocated</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {((unallocatedBlocks / TOTAL_BLOCKS) * 100).toFixed(1)}%
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                  {formatHoursMins(unallocatedMins)}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {unallocatedBlocks} blocks empty
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          No activity recorded yet for this day. Click or drag on the timesheet grid above to start logging your day!
        </div>
      )}

    </div>
  );
};
