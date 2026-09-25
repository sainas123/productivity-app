import React from 'react';
import type { Activity } from '../types/timeTracker';
import { Plus, Edit2, Trash2, Eraser, Info } from 'lucide-react';

interface ActivitiesPanelProps {
  activities: Activity[];
  activeActivityId: string | null; // null represents Eraser mode
  onSelectActivity: (id: string | null) => void;
  onAddActivityClick: () => void;
  onEditActivityClick: (activity: Activity) => void;
  onDeleteActivityClick: (id: string) => void;
  activityTotals: Record<string, number>; // Map activityId -> total block count today
}

export const ActivitiesPanel: React.FC<ActivitiesPanelProps> = ({
  activities,
  activeActivityId,
  onSelectActivity,
  onAddActivityClick,
  onEditActivityClick,
  onDeleteActivityClick,
  activityTotals,
}) => {
  return (
    <div className="glass-panel activities-panel" style={{ padding: '1.25rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* Panel Title & Add Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Activities Palette
          </h2>
          <p style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
            Select color or drag onto blocks
          </p>
        </div>
        
        <button 
          className="btn btn-sm btn-primary" 
          onClick={onAddActivityClick}
          title="Add new custom activity"
          style={{ padding: '0.4rem 0.65rem' }}
        >
          <Plus size={15} />
          <span>Add</span>
        </button>
      </div>

      {/* Eraser Tool */}
      <div style={{ marginBottom: '0.75rem' }}>
        <button
          onClick={() => onSelectActivity(null)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.65rem 0.85rem',
            borderRadius: '10px',
            border: activeActivityId === null 
              ? '2px solid #ef4444' 
              : '1px solid var(--bg-card-border)',
            background: activeActivityId === null 
              ? 'rgba(239, 68, 68, 0.15)' 
              : 'rgba(0, 0, 0, 0.25)',
            color: '#fff',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              background: 'rgba(239, 68, 68, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f87171'
            }}>
              <Eraser size={16} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#f87171' }}>
                Eraser / Clear
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Press 0 to activate
              </div>
            </div>
          </div>
          <span style={{ 
            fontSize: '0.7rem', 
            fontWeight: '700', 
            padding: '2px 6px', 
            background: 'rgba(255, 255, 255, 0.1)', 
            borderRadius: '4px',
            color: 'var(--text-secondary)'
          }}>
            [0]
          </span>
        </button>
      </div>

      {/* Activity List */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '0.5rem', 
        overflowY: 'auto', 
        flex: 1, 
        paddingRight: '0.2rem' 
      }}>
        {activities.map((act, index) => {
          const isSelected = activeActivityId === act.id;
          const shortcutNum = index + 1 <= 9 ? index + 1 : null;
          const blockCount = activityTotals[act.id] || 0;
          const totalMins = blockCount * 10;
          const hours = Math.floor(totalMins / 60);
          const mins = totalMins % 60;
          const formattedTime = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

          return (
            <div
              key={act.id}
              onClick={() => onSelectActivity(act.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.6rem 0.75rem',
                borderRadius: '10px',
                border: isSelected 
                  ? `2px solid ${act.color}` 
                  : '1px solid var(--bg-card-border)',
                background: isSelected 
                  ? `rgba(${hexToRgb(act.color)}, 0.18)` 
                  : 'rgba(0, 0, 0, 0.25)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: isSelected ? `0 0 12px rgba(${hexToRgb(act.color)}, 0.3)` : 'none'
              }}
              className="activity-item-card"
            >
              {/* Left Color Swatch & Details */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1, minWidth: 0 }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '7px',
                  backgroundColor: act.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.9rem',
                  boxShadow: `0 2px 8px rgba(${hexToRgb(act.color)}, 0.4)`,
                  flexShrink: 0
                }}>
                  {act.icon || '📌'}
                </div>
                
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ 
                    fontSize: '0.85rem', 
                    fontWeight: '600', 
                    color: isSelected ? '#fff' : 'var(--text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {act.name}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: isSelected ? act.color : 'var(--text-muted)' }}>
                    {formattedTime} logged
                  </div>
                </div>
              </div>

              {/* Right Side Shortcuts & Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                {shortcutNum && (
                  <span style={{ 
                    fontSize: '0.7rem', 
                    fontWeight: '700', 
                    padding: '2px 6px', 
                    background: 'rgba(255, 255, 255, 0.08)', 
                    borderRadius: '4px',
                    color: 'var(--text-muted)'
                  }}>
                    [{shortcutNum}]
                  </span>
                )}

                <button 
                  className="btn-icon" 
                  onClick={() => onEditActivityClick(act)}
                  title="Edit activity"
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '3px' }}
                >
                  <Edit2 size={13} />
                </button>

                <button 
                  className="btn-icon" 
                  onClick={() => onDeleteActivityClick(act.id)}
                  title="Delete activity"
                  style={{ background: 'none', border: 'none', color: 'rgba(239, 68, 68, 0.7)', cursor: 'pointer', padding: '3px' }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Keyboard Shortcut Info */}
      <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--bg-card-border)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.725rem', color: 'var(--text-muted)' }}>
        <Info size={13} />
        <span>Use keys 1-9 to select activities, 0 for eraser. Drag mouse to paint multiple blocks.</span>
      </div>

    </div>
  );
};

/** Helper to convert hex to rgb string for rgba opacity background */
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '99, 102, 241';
}
