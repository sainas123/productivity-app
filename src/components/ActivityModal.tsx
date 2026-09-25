import React, { useState, useEffect } from 'react';
import type { Activity } from '../types/timeTracker';
import { X, Check } from 'lucide-react';

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (activity: Omit<Activity, 'id'> | Activity) => void;
  editingActivity?: Activity | null;
}

const PRESET_COLORS = [
  '#3b82f6', // Blue
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#a855f7', // Purple
  '#ec4899', // Pink
  '#f43f5e', // Rose
  '#ef4444', // Red
  '#f97316', // Orange
  '#f59e0b', // Amber
  '#eab308', // Yellow
  '#10b981', // Emerald
  '#14b8a6', // Teal
  '#06b6d4', // Cyan
  '#64748b', // Slate
];

const PRESET_EMOJIS = ['💼', '😴', '🍲', '🏋️', '📚', '🧹', '🎮', '🛋️', '💻', '🎨', '🚶', '🚗', '🎵', '📺'];

export const ActivityModal: React.FC<ActivityModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingActivity,
}) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [icon, setIcon] = useState('📌');

  useEffect(() => {
    if (editingActivity) {
      setName(editingActivity.name);
      setColor(editingActivity.color);
      setIcon(editingActivity.icon || '📌');
    } else {
      setName('');
      setColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]);
      setIcon(PRESET_EMOJIS[Math.floor(Math.random() * PRESET_EMOJIS.length)]);
    }
  }, [editingActivity, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingActivity) {
      onSave({
        ...editingActivity,
        name: name.trim(),
        color,
        icon,
      });
    } else {
      onSave({
        name: name.trim(),
        color,
        icon,
      });
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="glass-panel modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ borderRadius: '16px', background: 'rgba(15, 20, 32, 0.95)', border: '1px solid rgba(255, 255, 255, 0.12)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#fff' }}>
            {editingActivity ? 'Edit Activity' : 'Add New Activity'}
          </h2>
          <button className="btn btn-sm" onClick={onClose} style={{ padding: '0.25rem', borderRadius: '50%' }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Name Input */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Activity Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Deep Work, Reading, Workout"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              autoFocus
            />
          </div>

          {/* Emoji / Icon Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Icon / Emoji
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              {PRESET_EMOJIS.map((e) => (
                <button
                  type="button"
                  key={e}
                  onClick={() => setIcon(e)}
                  style={{
                    fontSize: '1.1rem',
                    padding: '0.35rem 0.5rem',
                    borderRadius: '8px',
                    border: icon === e ? '2px solid var(--accent-primary)' : '1px solid rgba(255, 255, 255, 0.08)',
                    background: icon === e ? 'rgba(99, 102, 241, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                    cursor: 'pointer'
                  }}
                >
                  {e}
                </button>
              ))}
            </div>
            <input
              type="text"
              maxLength={2}
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="input-field"
              style={{ width: '80px', textAlign: 'center' }}
            />
          </div>

          {/* Color Picker */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Activity Color
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              {PRESET_COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: c,
                    border: color === c ? '3px solid #fff' : 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: color === c ? `0 0 10px ${c}` : 'none'
                  }}
                >
                  {color === c && <Check size={16} color="#fff" />}
                </button>
              ))}
            </div>

            {/* Custom Hex Color input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <input 
                type="color" 
                value={color} 
                onChange={(e) => setColor(e.target.value)}
                style={{ width: '40px', height: '36px', border: 'none', borderRadius: '6px', cursor: 'pointer', background: 'transparent' }}
              />
              <input 
                type="text" 
                value={color} 
                onChange={(e) => setColor(e.target.value)}
                className="input-field"
                style={{ flex: 1 }}
              />
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingActivity ? 'Save Changes' : 'Create Activity'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
