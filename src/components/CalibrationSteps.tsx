import React from 'react';
import { useCalibration } from '../context/CalibrationContext';

export const CalibrationSteps: React.FC = () => {
  const { steps, activeStepIndex, setActiveStepIndex, historyLog } = useCalibration();

  // Helper to find the latest log entry for a specific step index
  const getLatestLogForStep = (stepIdx: number) => {
    return historyLog.find((entry) => entry.stepIndex === stepIdx);
  };

  return (
    <div id="calibration-steps-timeline" className="panel-glass" style={{ padding: '20px' }}>
      <h4 style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '20px', textTransform: 'uppercase' }}>
        5-Octave Iterative Calibration Loop
      </h4>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        padding: '0 10px',
        marginTop: '10px'
      }}>
        {/* Progress Background Connecting Line */}
        <div className="step-connecting-line" />

        {steps.map((step, idx) => {
          const isActive = idx === activeStepIndex;
          const latestLog = getLatestLogForStep(idx);
          const hasBeenCalibrated = latestLog !== undefined;
          
          let statusBorderColor = 'rgba(255, 255, 255, 0.08)';
          let dotBg = '#0c0f1d';
          let textColor = 'var(--text-secondary)';
          let centsDisplayColor = 'var(--text-muted)';
          
          if (isActive) {
            statusBorderColor = 'var(--accent-primary)';
            dotBg = 'var(--accent-gradient)';
            textColor = '#fff';
          } else if (hasBeenCalibrated) {
            const absCents = Math.abs(latestLog.deltaCents);
            const inTolerance = absCents <= 5.0; // Show green if within normal target tolerance
            statusBorderColor = inTolerance ? 'var(--color-success)' : 'var(--color-warning)';
            dotBg = inTolerance ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)';
            textColor = 'var(--text-primary)';
            centsDisplayColor = inTolerance ? 'var(--color-success)' : 'var(--color-warning)';
          }

          return (
            <div
              key={step.noteName}
              onClick={() => setActiveStepIndex(idx)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                zIndex: 1,
                flex: 1,
                position: 'relative',
              }}
            >
              {/* Step Circle */}
              <div
                className="step-circle"
                style={{
                  background: dotBg,
                  border: `2px solid ${statusBorderColor}`,
                  boxShadow: isActive 
                    ? '0 0 16px var(--accent-glow)' 
                    : hasBeenCalibrated 
                      ? `0 0 12px ${statusBorderColor}44` 
                      : 'none',
                  color: textColor,
                  transform: isActive ? 'scale(1.15)' : 'scale(1)'
                }}
              >
                {step.noteName}
              </div>

              {/* Target Frequency Label */}
              <div className="font-mono-data step-hz-label" style={{
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 400
              }}>
                {step.targetHz.toFixed(1)} Hz
              </div>

              {/* Deviation Cents Display */}
              <div className="font-mono-data step-cents-label" style={{
                color: centsDisplayColor,
                minHeight: '14px',
                fontWeight: 500
              }}>
                {hasBeenCalibrated ? (
                  <>
                    {latestLog.deltaCents > 0 ? '+' : ''}
                    {latestLog.deltaCents.toFixed(1)}¢
                  </>
                ) : (
                  <span style={{ color: 'rgba(255,255,255,0.15)' }}>--</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default CalibrationSteps;
