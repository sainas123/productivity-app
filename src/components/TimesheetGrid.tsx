import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Activity, BlockValue } from '../types/timeTracker';
import { 
  BLOCKS_PER_HOUR, 
  HOURS_PER_DAY, 
  MINUTE_INTERVALS, 
  formatHourLabel, 
  getBlockTimeRange,
  getTodayDateString 
} from '../utils/timeHelpers';
import { Clock, MousePointer } from 'lucide-react';

interface TimesheetGridProps {
  currentDate: string;
  blocks: BlockValue[];
  activities: Activity[];
  activeActivityId: string | null;
  onUpdateBlock: (blockIndex: number, activityId: string | null) => void;
  onUpdateBlockRange?: (startIdx: number, endIdx: number, activityId: string | null) => void;
}

export const TimesheetGrid: React.FC<TimesheetGridProps> = ({
  currentDate,
  blocks,
  activities,
  activeActivityId,
  onUpdateBlock,
}) => {
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const dragStartIndexRef = useRef<number | null>(null);

  const activeActivity = activities.find((a) => a.id === activeActivityId);
  const todayStr = getTodayDateString();
  const isToday = currentDate === todayStr;
  const currentHour = new Date().getHours();

  // Create quick lookup map for activities
  const activityMap = React.useMemo(() => {
    const map = new Map<string, Activity>();
    activities.forEach((act) => map.set(act.id, act));
    return map;
  }, [activities]);

  // Global mouse up event listener to stop dragging even if mouse leaves window
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsMouseDown(false);
      dragStartIndexRef.current = null;
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  // Handle painting a block
  const handleBlockClickOrDrag = useCallback(
    (index: number) => {
      onUpdateBlock(index, activeActivityId);
    },
    [activeActivityId, onUpdateBlock]
  );

  const handleMouseDown = (index: number) => {
    setIsMouseDown(true);
    dragStartIndexRef.current = index;
    handleBlockClickOrDrag(index);
  };

  const handleMouseEnter = (index: number) => {
    setHoveredIndex(index);
    if (isMouseDown) {
      handleBlockClickOrDrag(index);
    }
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  // Keyboard shortcut support when hovering over a cell
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (hoveredIndex === null) return;
      
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      const key = e.key;
      if (key === '0') {
        onUpdateBlock(hoveredIndex, null); // Eraser
      } else {
        const num = parseInt(key, 10);
        if (!isNaN(num) && num >= 1 && num <= 9) {
          const targetActivity = activities[num - 1];
          if (targetActivity) {
            onUpdateBlock(hoveredIndex, targetActivity.id);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hoveredIndex, activities, onUpdateBlock]);

  // Touch support for mobile touch drag painting
  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
    if (targetElement) {
      const blockIdxAttr = targetElement.getAttribute('data-block-index');
      if (blockIdxAttr !== null) {
        const idx = parseInt(blockIdxAttr, 10);
        if (!isNaN(idx)) {
          setHoveredIndex(idx);
          onUpdateBlock(idx, activeActivityId);
        }
      }
    }
  };

  return (
    <div className="glass-panel timesheet-container" style={{ padding: '1.25rem', position: 'relative' }}>
      
      {/* Top Grid Info Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            background: 'rgba(99, 102, 241, 0.15)',
            color: 'var(--accent-primary)',
            padding: '0.4rem',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Clock size={18} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#fff' }}>
              24-Hour Timesheet Sheet
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Rows = Hours (12 AM - 11 PM) • Columns = 10-Minute Blocks (:00 to :50)
            </p>
          </div>
        </div>

        {/* Current Active Brush Indicator */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          background: 'rgba(0, 0, 0, 0.4)', 
          padding: '0.4rem 0.85rem', 
          borderRadius: '20px', 
          border: '1px solid var(--bg-card-border)' 
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Active Brush:</span>
          {activeActivity ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: activeActivity.color,
                boxShadow: `0 0 8px ${activeActivity.color}`
              }} />
              <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#fff' }}>
                {activeActivity.icon} {activeActivity.name}
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f87171' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>🧹 Eraser / Clear Mode</span>
            </div>
          )}
        </div>
      </div>

      {/* Main 24-Hour Interactive Grid (Vertical Rows = Hours, Columns = 10-Min Blocks) */}
      <div 
        className="timesheet-grid-container"
        onTouchMove={handleTouchMove}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          overflowX: 'auto'
        }}
      >
        {/* Column Header (:00, :10, :20, :30, :40, :50) */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '90px repeat(6, minmax(65px, 1fr))', 
          gap: '8px',
          alignItems: 'center',
          padding: '0 0.5rem',
          minWidth: '520px'
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Hour
          </div>
          {MINUTE_INTERVALS.map((minLabel) => (
            <div 
              key={minLabel} 
              style={{ 
                textAlign: 'center', 
                fontSize: '0.75rem', 
                fontWeight: '700', 
                color: 'var(--text-secondary)',
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '0.25rem',
                borderRadius: '6px'
              }}
            >
              {minLabel}
            </div>
          ))}
        </div>

        {/* 24 Hour Rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '520px' }}>
          {Array.from({ length: HOURS_PER_DAY }).map((_, hour) => {
            const isCurrentHourNow = isToday && hour === currentHour;

            return (
              <div 
                key={hour}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '90px repeat(6, minmax(65px, 1fr))',
                  gap: '8px',
                  alignItems: 'center',
                  background: isCurrentHourNow ? 'rgba(99, 102, 241, 0.1)' : 'rgba(0, 0, 0, 0.25)',
                  borderRadius: '10px',
                  border: isCurrentHourNow ? '1px solid var(--accent-primary)' : '1px solid rgba(255, 255, 255, 0.05)',
                  padding: '0.35rem 0.5rem',
                  transition: 'background-color 0.15s ease'
                }}
              >
                {/* Hour Label Row Header */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.4rem',
                  fontSize: '0.85rem', 
                  fontWeight: '700', 
                  color: isCurrentHourNow ? 'var(--accent-primary)' : '#fff' 
                }}>
                  <span>{formatHourLabel(hour)}</span>
                  {isCurrentHourNow && (
                    <span style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--accent-primary)',
                      boxShadow: '0 0 6px var(--accent-primary)'
                    }} title="Current Hour" />
                  )}
                </div>

                {/* 6 Horizontal 10-Minute Block Cells */}
                {MINUTE_INTERVALS.map((minLabel, minuteIdx) => {
                  const blockIndex = hour * BLOCKS_PER_HOUR + minuteIdx;
                  const activityId = blocks[blockIndex];
                  const activity = activityId ? activityMap.get(activityId) : null;
                  const isHovered = hoveredIndex === blockIndex;

                  return (
                    <div
                      key={minuteIdx}
                      data-block-index={blockIndex}
                      onMouseDown={() => handleMouseDown(blockIndex)}
                      onMouseEnter={() => handleMouseEnter(blockIndex)}
                      onMouseLeave={handleMouseLeave}
                      title={`${getBlockTimeRange(blockIndex)}: ${activity ? `${activity.icon || ''} ${activity.name}` : 'Unallocated'}`}
                      style={{
                        height: '36px',
                        borderRadius: '6px',
                        backgroundColor: activity ? activity.color : 'var(--cell-empty-bg)',
                        border: activity 
                          ? `1px solid rgba(255, 255, 255, 0.2)` 
                          : isHovered 
                            ? '1px solid rgba(255, 255, 255, 0.3)' 
                            : '1px solid var(--cell-border)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem',
                        padding: '0 0.35rem',
                        transition: 'transform 0.08s ease, background-color 0.1s ease',
                        transform: isHovered ? 'scale(1.04)' : 'scale(1)',
                        boxShadow: isHovered 
                          ? activity 
                            ? `0 0 12px ${activity.color}` 
                            : '0 0 8px rgba(99, 102, 241, 0.3)'
                          : activity 
                            ? `0 2px 6px ${activity.color}40` 
                            : 'none',
                        zIndex: isHovered ? 10 : 1,
                        position: 'relative'
                      }}
                    >
                      {/* Cell Content: Plain color when filled, minute label when empty */}
                      {!activity && (
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: '500',
                          color: 'var(--text-muted)',
                          opacity: 0.7
                        }}>
                          {minLabel}
                        </span>
                      )}
                    </div>
                  );
                })}

              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Hover Tooltip & Instruction Bar */}
      <div style={{
        marginTop: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.5rem 0.85rem',
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '8px',
        border: '1px solid var(--bg-card-border)',
        fontSize: '0.8rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MousePointer size={14} color="var(--accent-primary)" />
          {hoveredIndex !== null ? (
            <span>
              <strong>{getBlockTimeRange(hoveredIndex)}</strong>: {' '}
              {blocks[hoveredIndex] ? (
                <span style={{ color: activityMap.get(blocks[hoveredIndex]!)?.color || '#fff' }}>
                  {activityMap.get(blocks[hoveredIndex]!)?.icon} {activityMap.get(blocks[hoveredIndex]!)?.name}
                </span>
              ) : (
                <span style={{ color: 'var(--text-muted)' }}>Unallocated / Empty</span>
              )}
            </span>
          ) : (
            <span style={{ color: 'var(--text-secondary)' }}>
              Hover over a block to view time slot details. Click or drag across blocks to paint.
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.725rem' }}>
          <span>24 hour rows • 144 blocks total</span>
        </div>
      </div>

    </div>
  );
};
