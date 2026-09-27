import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Activity, TimeTrackerData, DayLog } from './types/timeTracker';
import { loadStorageData, saveStorageData } from './utils/storage';
import { getTodayDateString, createEmptyDayBlocks, parseDateString, offsetDays, formatDateString } from './utils/timeHelpers';
import { Navbar } from './components/Navbar';
import { Header } from './components/Header';
import { ActivitiesPanel } from './components/ActivitiesPanel';
import { TimesheetGrid } from './components/TimesheetGrid';
import { DailySummary } from './components/DailySummary';
import { Summarizer } from './components/Summarizer';
import { ActivityModal } from './components/ActivityModal';

export const App: React.FC = () => {
  const [data, setData] = useState<TimeTrackerData>(() => loadStorageData());
  const [currentDate, setCurrentDate] = useState<string>(() => getTodayDateString());
  const [activeTab, setActiveTab] = useState<'timesheet' | 'summarizer'>('timesheet');
  const [activeActivityId, setActiveActivityId] = useState<string | null>(() => {
    return data.activities.length > 0 ? data.activities[0].id : null;
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  // Auto-save data whenever it changes
  useEffect(() => {
    saveStorageData(data);
  }, [data]);

  // Ensure current date has a log entry initialized
  const currentDayLog: DayLog = useMemo(() => {
    if (data.logs[currentDate]) {
      return data.logs[currentDate];
    }
    return {
      date: currentDate,
      blocks: createEmptyDayBlocks(),
      updatedAt: Date.now(),
    };
  }, [data.logs, currentDate]);

  // Handler: Update a single block index
  const handleUpdateBlock = useCallback(
    (blockIndex: number, activityId: string | null) => {
      setData((prevData) => {
        const existingLog = prevData.logs[currentDate] || {
          date: currentDate,
          blocks: createEmptyDayBlocks(),
          updatedAt: Date.now(),
        };

        if (existingLog.blocks[blockIndex] === activityId) {
          return prevData;
        }

        const newBlocks = [...existingLog.blocks];
        newBlocks[blockIndex] = activityId;

        return {
          ...prevData,
          logs: {
            ...prevData.logs,
            [currentDate]: {
              ...existingLog,
              blocks: newBlocks,
              updatedAt: Date.now(),
            },
          },
        };
      });
    },
    [currentDate]
  );

  // Handler: Range update
  const handleUpdateBlockRange = useCallback(
    (startIdx: number, endIdx: number, activityId: string | null) => {
      setData((prevData) => {
        const existingLog = prevData.logs[currentDate] || {
          date: currentDate,
          blocks: createEmptyDayBlocks(),
          updatedAt: Date.now(),
        };

        const newBlocks = [...existingLog.blocks];
        const min = Math.min(startIdx, endIdx);
        const max = Math.max(startIdx, endIdx);

        for (let i = min; i <= max; i++) {
          newBlocks[i] = activityId;
        }

        return {
          ...prevData,
          logs: {
            ...prevData.logs,
            [currentDate]: {
              ...existingLog,
              blocks: newBlocks,
              updatedAt: Date.now(),
            },
          },
        };
      });
    },
    [currentDate]
  );

  // Handler: Save Snapshot / Save Progress
  const handleSaveSnapshot = useCallback(() => {
    setData((prev) => {
      const existingLog = prev.logs[currentDate] || {
        date: currentDate,
        blocks: createEmptyDayBlocks(),
        updatedAt: Date.now(),
      };

      return {
        ...prev,
        logs: {
          ...prev.logs,
          [currentDate]: {
            ...existingLog,
            savedSnapshot: {
              blocks: [...existingLog.blocks],
              savedAt: Date.now(),
            },
            updatedAt: Date.now(),
          },
        },
      };
    });
    alert(`Progress for ${currentDate} saved! You can modify it further or restore to this checkpoint anytime.`);
  }, [currentDate]);

  // Handler: Restore Saved Snapshot
  const handleRestoreSnapshot = useCallback(() => {
    const currentLog = data.logs[currentDate];
    if (!currentLog?.savedSnapshot) return;

    const timeStr = new Date(currentLog.savedSnapshot.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (window.confirm(`Restore to saved progress checkpoint from ${timeStr}?`)) {
      setData((prev) => ({
        ...prev,
        logs: {
          ...prev.logs,
          [currentDate]: {
            ...currentLog,
            blocks: [...currentLog.savedSnapshot!.blocks],
            updatedAt: Date.now(),
          },
        },
      }));
    }
  }, [currentDate, data.logs]);

  // Handler: Clear Day
  const handleClearDay = useCallback(() => {
    if (window.confirm(`Are you sure you want to clear all 24-hour recordings for ${currentDate}?`)) {
      setData((prev) => ({
        ...prev,
        logs: {
          ...prev.logs,
          [currentDate]: {
            ...prev.logs[currentDate],
            date: currentDate,
            blocks: createEmptyDayBlocks(),
            updatedAt: Date.now(),
          },
        },
      }));
    }
  }, [currentDate]);

  // Handler: Copy Previous Day
  const handleCopyPreviousDay = useCallback(() => {
    const prevDateStr = formatDateString(offsetDays(parseDateString(currentDate), -1));
    const prevLog = data.logs[prevDateStr];

    if (!prevLog || prevLog.blocks.every((b) => b === null)) {
      alert(`No recorded schedule found for yesterday (${prevDateStr}) to copy.`);
      return;
    }

    if (window.confirm(`Copy all recordings from ${prevDateStr} to ${currentDate}?`)) {
      setData((prev) => ({
        ...prev,
        logs: {
          ...prev.logs,
          [currentDate]: {
            ...prev.logs[currentDate],
            date: currentDate,
            blocks: [...prevLog.blocks],
            updatedAt: Date.now(),
          },
        },
      }));
    }
  }, [currentDate, data.logs]);

  // Activity Handlers
  const handleSaveActivity = (actData: Omit<Activity, 'id'> | Activity) => {
    if ('id' in actData) {
      // Editing existing activity
      setData((prev) => ({
        ...prev,
        activities: prev.activities.map((a) => (a.id === actData.id ? actData : a)),
      }));
    } else {
      // Creating new activity
      const newActivity: Activity = {
        ...actData,
        id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      };
      setData((prev) => ({
        ...prev,
        activities: [...prev.activities, newActivity],
      }));
      setActiveActivityId(newActivity.id);
    }
  };

  const handleDeleteActivity = (activityId: string) => {
    const target = data.activities.find((a) => a.id === activityId);
    if (!target) return;

    setData((prev) => {
      const updatedActivities = prev.activities.filter((a) => a.id !== activityId);
      
      const updatedLogs: Record<string, DayLog> = {};
      Object.entries(prev.logs).forEach(([dateStr, log]) => {
        updatedLogs[dateStr] = {
          ...log,
          blocks: log.blocks.map((b) => (b === activityId ? null : b)),
        };
      });

      return {
        ...prev,
        activities: updatedActivities,
        logs: updatedLogs,
      };
    });

    if (activeActivityId === activityId) {
      const remaining = data.activities.filter((a) => a.id !== activityId);
      setActiveActivityId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  // Export Data JSON
  const handleExportData = () => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `time_tracker_backup_${currentDate}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import Data JSON
  const handleImportData = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content) as TimeTrackerData;
        if (parsed.activities && parsed.logs) {
          setData(parsed);
          alert('Data backup successfully restored!');
        } else {
          alert('Invalid backup file format.');
        }
      } catch (err) {
        alert('Failed to parse backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  // Calculate daily totals for activities panel
  const activityTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    currentDayLog.blocks.forEach((b) => {
      if (b) {
        totals[b] = (totals[b] || 0) + 1;
      }
    });
    return totals;
  }, [currentDayLog.blocks]);

  return (
    <div className="app-container">
      {/* Top Navbar (Always Visible) */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Content Area */}
      {activeTab === 'timesheet' ? (
        <>
          {/* Sub Header Date Navigator for Timesheet */}
          <Header
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            onClearDay={handleClearDay}
            onCopyPreviousDay={handleCopyPreviousDay}
            onExportData={handleExportData}
            onImportData={handleImportData}
            savedSnapshotAt={currentDayLog.savedSnapshot?.savedAt || null}
            onSaveSnapshot={handleSaveSnapshot}
            onRestoreSnapshot={handleRestoreSnapshot}
          />

          {/* Main Grid + Activities Panel Split View */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '300px 1fr',
            gap: '1.25rem',
            alignItems: 'start'
          }} className="main-content-grid">
            
            {/* Left Side: Activities Panel */}
            <aside style={{ position: 'sticky', top: '1.25rem' }}>
              <ActivitiesPanel
                activities={data.activities}
                activeActivityId={activeActivityId}
                onSelectActivity={setActiveActivityId}
                onAddActivityClick={() => {
                  setEditingActivity(null);
                  setIsModalOpen(true);
                }}
                onEditActivityClick={(act) => {
                  setEditingActivity(act);
                  setIsModalOpen(true);
                }}
                onDeleteActivityClick={handleDeleteActivity}
                activityTotals={activityTotals}
              />
            </aside>

            {/* Right Side: 24-Hour Timesheet Grid */}
            <main>
              <TimesheetGrid
                currentDate={currentDate}
                blocks={currentDayLog.blocks}
                activities={data.activities}
                activeActivityId={activeActivityId}
                onUpdateBlock={handleUpdateBlock}
                onUpdateBlockRange={handleUpdateBlockRange}
              />
            </main>
          </div>

          {/* Daily Summary Analytics Footer */}
          <DailySummary
            blocks={currentDayLog.blocks}
            activities={data.activities}
          />
        </>
      ) : (
        /* Screen Time Analytics Summarizer Dashboard */
        <Summarizer
          data={data}
          currentDate={currentDate}
          onDateChange={setCurrentDate}
        />
      )}

      {/* Add / Edit Activity Modal */}
      <ActivityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveActivity}
        editingActivity={editingActivity}
      />
    </div>
  );
};

export default App;
