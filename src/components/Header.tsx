import React, { useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  RotateCcw, 
  Copy, 
  Download, 
  Upload, 
  Save,
  Undo2,
  CheckCircle2
} from 'lucide-react';
import { 
  formatFriendlyDate, 
  getTodayDateString, 
  offsetDays, 
  parseDateString, 
  formatDateString, 
  getValidDateWindow 
} from '../utils/timeHelpers';

interface HeaderProps {
  currentDate: string;
  onDateChange: (newDate: string) => void;
  onClearDay: () => void;
  onCopyPreviousDay: () => void;
  onExportData: () => void;
  onImportData: (file: File) => void;
  savedSnapshotAt?: number | null;
  onSaveSnapshot: () => void;
  onRestoreSnapshot: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDate,
  onDateChange,
  onClearDay,
  onCopyPreviousDay,
  onExportData,
  onImportData,
  savedSnapshotAt,
  onSaveSnapshot,
  onRestoreSnapshot,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const todayStr = getTodayDateString();
  const validDates = getValidDateWindow(todayStr);

  const isToday = currentDate === todayStr;
  const isOldest = validDates[validDates.length - 1] === currentDate;

  const handlePrevDay = () => {
    const current = parseDateString(currentDate);
    const prev = formatDateString(offsetDays(current, -1));
    if (validDates.includes(prev)) {
      onDateChange(prev);
    }
  };

  const handleNextDay = () => {
    const current = parseDateString(currentDate);
    const next = formatDateString(offsetDays(current, 1));
    if (validDates.includes(next)) {
      onDateChange(next);
    }
  };

  const handleDateSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onDateChange(e.target.value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportData(file);
    }
  };

  const formattedSavedTime = savedSnapshotAt
    ? new Date(savedSnapshotAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div className="glass-panel header-container" style={{ padding: '0.85rem 1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.85rem' }}>
        
        {/* Date Navigator & Save Status Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-sm" 
            onClick={handlePrevDay} 
            disabled={isOldest} 
            title="Previous Day"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Date Selector Dropdown */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Calendar size={16} style={{ position: 'absolute', left: '0.75rem', color: 'var(--accent-primary)', pointerEvents: 'none' }} />
            <select
              value={currentDate}
              onChange={handleDateSelect}
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

          <button 
            className="btn btn-sm" 
            onClick={handleNextDay} 
            disabled={isToday} 
            title="Next Day"
          >
            <ChevronRight size={16} />
          </button>

          {!isToday && (
            <button 
              className="btn btn-sm btn-primary" 
              onClick={() => onDateChange(todayStr)}
              style={{ marginLeft: '0.15rem' }}
            >
              Today
            </button>
          )}

          {formattedSavedTime && (
            <span style={{
              fontSize: '0.7rem',
              color: '#10b981',
              background: 'rgba(16, 185, 129, 0.15)',
              padding: '4px 8px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontWeight: '600',
              marginLeft: '0.25rem'
            }}>
              <CheckCircle2 size={12} /> Saved {formattedSavedTime}
            </span>
          )}
        </div>

        {/* Timesheet Actions Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          
          {/* Save Day Progress Button */}
          <button
            className="btn btn-sm btn-primary"
            onClick={onSaveSnapshot}
            title="Save current progress snapshot for this day"
            style={{ background: '#10b981', borderColor: '#10b981', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}
          >
            <Save size={14} />
            <span>Save Progress</span>
          </button>

          {/* Restore Saved Snapshot Button */}
          {savedSnapshotAt && (
            <button
              className="btn btn-sm"
              onClick={onRestoreSnapshot}
              title={`Restore saved snapshot from ${formattedSavedTime}`}
              style={{ background: 'rgba(234, 179, 8, 0.15)', borderColor: 'rgba(234, 179, 8, 0.3)', color: '#eab308' }}
            >
              <Undo2 size={14} />
              <span className="hide-mobile">Restore Snapshot</span>
            </button>
          )}

          <div style={{ borderLeft: '1px solid var(--bg-card-border)', height: '20px', margin: '0 0.15rem' }} />

          <button 
            className="btn btn-sm" 
            onClick={onCopyPreviousDay} 
            title="Copy schedule from previous day"
          >
            <Copy size={14} />
            <span className="hide-mobile">Copy Prev Day</span>
          </button>

          <button 
            className="btn btn-sm btn-danger" 
            onClick={onClearDay} 
            title="Clear all blocks for current date"
          >
            <RotateCcw size={14} />
            <span className="hide-mobile">Clear Day</span>
          </button>

          <div style={{ borderLeft: '1px solid var(--bg-card-border)', height: '20px', margin: '0 0.15rem' }} />

          <button className="btn btn-sm" onClick={onExportData} title="Export backup JSON">
            <Download size={14} />
          </button>

          <button className="btn btn-sm" onClick={() => fileInputRef.current?.click()} title="Import JSON backup">
            <Upload size={14} />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".json" 
            style={{ display: 'none' }} 
          />
        </div>

      </div>
    </div>
  );
};
