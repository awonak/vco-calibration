import React, { useState } from 'react';
import { useCalibration } from '../context/CalibrationContext';

export const HistoryLog: React.FC = () => {
  const { historyLog, clearHistory } = useCalibration();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768;
    }
    return false;
  });

  return (
    <div id="history-log-panel" className="panel p-5 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-lg font-semibold cursor-pointer flex items-center justify-between flex-1 select-none"
        >
          <span>Session History Log {historyLog.length > 0 && `(${historyLog.length})`}</span>
          <span className="text-xs text-secondary font-medium" style={{ marginRight: historyLog.length > 0 && !isCollapsed ? '16px' : '0px' }}>
            {isCollapsed ? '▼ Show' : '▲ Hide'}
          </span>
        </h3>

        {historyLog.length > 0 && !isCollapsed && (
          <button
            onClick={clearHistory}
            className="btn-tour-skip text-xs font-medium cursor-pointer underline text-danger"
          >
            Clear Log
          </button>
        )}
      </div>

      {!isCollapsed && (
        <>
          {historyLog.length === 0 ? (
            <div className="text-center p-6 text-sm text-muted rounded border border-dashed border-panel">
              No calibration measurements logged yet. Locks steps automatically or click 'Next' to log measurements.
            </div>
          ) : (
            <div className="history-table-container">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Note</th>
                    <th>Target</th>
                    <th>Measured</th>
                    <th>Dev (Hz)</th>
                    <th>Dev (¢)</th>
                    <th className="text-right">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {historyLog.map((entry) => {
                    const absCents = Math.abs(entry.deltaCents);
                    let centsColor: string;

                    if (absCents <= 2.0) {
                      centsColor = 'var(--color-success)'; // Perfect
                    } else if (absCents <= 5.0) {
                      centsColor = 'var(--color-success)'; // Normal
                    } else if (absCents <= 12.0) {
                      centsColor = 'var(--color-warning)'; // Warning
                    } else {
                      centsColor = 'var(--color-danger)'; // Error
                    }

                    return (
                      <tr key={entry.id}>
                        <td className="font-semibold">{entry.noteName}</td>
                        <td className="font-mono-data text-secondary">
                          {entry.targetHz.toFixed(2)}
                        </td>
                        <td className="font-mono-data">
                          {entry.measuredHz.toFixed(2)}
                        </td>
                        <td className="font-mono-data" style={{
                          color: entry.deltaHz >= 0 ? 'var(--color-info)' : 'var(--color-danger)'
                        }}>
                          {entry.deltaHz >= 0 ? '+' : ''}{entry.deltaHz.toFixed(2)}
                        </td>
                        <td className="font-mono-data font-semibold" style={{ color: centsColor }}>
                          {entry.deltaCents >= 0 ? '+' : ''}{entry.deltaCents.toFixed(1)}¢
                        </td>
                        <td className="text-right text-muted text-xs">
                          {entry.method === 'auto' ? 'auto' : 'manual'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};
export default HistoryLog;
