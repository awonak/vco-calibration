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
    <div id="history-log-panel" className="panel-glass" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            fontSize: '18px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            userSelect: 'none'
          }}
        >
          Session History Log {historyLog.length > 0 && `(${historyLog.length})`}
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {isCollapsed ? '▼ Show' : '▲ Hide'}
          </span>
        </h3>
        
        {historyLog.length > 0 && !isCollapsed && (
          <button
            onClick={clearHistory}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fca5a5',
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: 500,
              textDecoration: 'underline'
            }}
          >
            Clear Log
          </button>
        )}
      </div>

      {!isCollapsed && (
        <>
          {historyLog.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '24px',
              color: 'var(--text-muted)',
              fontSize: '14px',
              border: '1px dashed rgba(255, 255, 255, 0.05)',
              borderRadius: '8px'
            }}>
              No calibration measurements logged yet. Locks steps automatically or click 'Next' to log measurements.
            </div>
          ) : (
            <div style={{
              maxHeight: '220px',
              overflowY: 'auto',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.05)'
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '13px',
                textAlign: 'left'
              }}>
                <thead>
                  <tr style={{
                    background: 'rgba(15, 23, 42, 0.8)',
                    color: 'var(--text-secondary)',
                    borderBottom: '1px solid rgba(255,255,255,0.08)'
                  }}>
                    <th style={{ padding: '8px 12px', fontWeight: 500 }}>Note</th>
                    <th style={{ padding: '8px 12px', fontWeight: 500 }}>Target</th>
                    <th style={{ padding: '8px 12px', fontWeight: 500 }}>Measured</th>
                    <th style={{ padding: '8px 12px', fontWeight: 500 }}>Dev (Hz)</th>
                    <th style={{ padding: '8px 12px', fontWeight: 500 }}>Dev (¢)</th>
                    <th style={{ padding: '8px 12px', fontWeight: 500, textAlign: 'right' }}>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {historyLog.map((entry) => {
                    const absCents = Math.abs(entry.deltaCents);
                    let centsColor: string;
                    
                    if (absCents <= 2.0) {
                      centsColor = '#6ee7b7'; // Perfect green
                    } else if (absCents <= 5.0) {
                      centsColor = 'var(--color-success)'; // Normal green
                    } else if (absCents <= 12.0) {
                      centsColor = 'var(--color-warning)'; // Warning amber
                    } else {
                      centsColor = '#fca5a5'; // Error red
                    }

                    return (
                      <tr
                        key={entry.id}
                        style={{
                          borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
                          background: 'rgba(255, 255, 255, 0.01)',
                          transition: 'background 0.2s ease'
                        }}
                      >
                        <td style={{ padding: '8px 12px', fontWeight: 600 }}>{entry.noteName}</td>
                        <td className="font-mono-data" style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>
                          {entry.targetHz.toFixed(2)}
                        </td>
                        <td className="font-mono-data" style={{ padding: '8px 12px' }}>
                          {entry.measuredHz.toFixed(2)}
                        </td>
                        <td className="font-mono-data" style={{
                          padding: '8px 12px',
                          color: entry.deltaHz >= 0 ? '#67e8f9' : '#f472b6' // Cyan for positive, pink for negative
                        }}>
                          {entry.deltaHz >= 0 ? '+' : ''}{entry.deltaHz.toFixed(2)}
                        </td>
                        <td className="font-mono-data" style={{ padding: '8px 12px', color: centsColor, fontWeight: 600 }}>
                          {entry.deltaCents >= 0 ? '+' : ''}{entry.deltaCents.toFixed(1)}¢
                        </td>
                        <td style={{
                          padding: '8px 12px',
                          textAlign: 'right',
                          color: 'var(--text-muted)',
                          fontSize: '11px'
                        }}>
                          {entry.method === 'auto' ? '🤖 auto' : '👤 manual'}
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
