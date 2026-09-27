import React from 'react';
import { Sparkles, Clock, BarChart3 } from 'lucide-react';

interface NavbarProps {
  activeTab: 'timesheet' | 'summarizer';
  onTabChange: (tab: 'timesheet' | 'summarizer') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange }) => {
  return (
    <header className="glass-panel navbar-container" style={{ padding: '0.85rem 1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Left Brand Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, var(--accent-primary), #a855f7)', 
            width: '38px', 
            height: '38px', 
            borderRadius: '10px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
          }}>
            <Sparkles size={20} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '700', letterSpacing: '-0.02em', color: '#fff', lineHeight: 1.2 }}>
              Visual Time Tracker
            </h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Personal 24-Hour Time Logger & Screen Time Analytics
            </p>
          </div>
        </div>

        {/* Upper Navigation Tabs (Always Visible) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(0, 0, 0, 0.4)',
          padding: '4px',
          borderRadius: '12px',
          border: '1px solid var(--bg-card-border)',
          gap: '4px'
        }}>
          <button
            onClick={() => onTabChange('timesheet')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.55rem 1.25rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: '600',
              border: activeTab === 'timesheet' ? '1px solid var(--accent-primary)' : '1px solid transparent',
              background: activeTab === 'timesheet' ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === 'timesheet' ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: activeTab === 'timesheet' ? '0 4px 12px var(--accent-glow)' : 'none'
            }}
          >
            <Clock size={16} />
            <span>Timesheet</span>
          </button>

          <button
            onClick={() => onTabChange('summarizer')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.55rem 1.25rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: '600',
              border: activeTab === 'summarizer' ? '1px solid #a855f7' : '1px solid transparent',
              background: activeTab === 'summarizer' ? 'linear-gradient(135deg, #a855f7, #6366f1)' : 'transparent',
              color: activeTab === 'summarizer' ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: activeTab === 'summarizer' ? '0 4px 12px rgba(168, 85, 247, 0.4)' : 'none'
            }}
          >
            <BarChart3 size={16} />
            <span>Summarizer</span>
          </button>
        </div>

      </div>
    </header>
  );
};
