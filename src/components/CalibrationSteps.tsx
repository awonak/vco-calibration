import React from 'react';
import { useCalibration } from '../context/CalibrationContext';

export const CalibrationSteps: React.FC = () => {
  const { steps, activeStepIndex, setActiveStepIndex, historyLog } = useCalibration();

  // Helper to find the latest log entry for a specific step index
  const getLatestLogForStep = (stepIdx: number) => {
    return historyLog.find((entry) => entry.stepIndex === stepIdx);
  };

  return (
    <div id="calibration-steps-timeline" className="panel-glass p-5">
      <h4 className="text-xs text-secondary font-semibold tracking-wider mb-5 uppercase">
        5-Octave Iterative Calibration Loop
      </h4>

      <div className="calibration-steps-wrapper">
        {/* Progress Background Connecting Line */}
        <div className="step-connecting-line" />

        {steps.map((step, idx) => {
          const isActive = idx === activeStepIndex;
          const latestLog = getLatestLogForStep(idx);
          const hasBeenCalibrated = latestLog !== undefined;
          
          let statusBorderColor = 'var(--panel-border)';
          let dotBg = 'var(--panel-bg)';
          let textColor = 'var(--text-secondary)';
          let centsDisplayColor = 'var(--text-muted)';
          let stepBoxShadow = 'none';
          
          if (isActive) {
            statusBorderColor = 'var(--accent-primary)';
            dotBg = 'var(--accent-primary)';
            textColor = '#fff';
            stepBoxShadow = '0 0 16px var(--accent-glow)';
          } else if (hasBeenCalibrated) {
            const absCents = Math.abs(latestLog.deltaCents);
            const inTolerance = absCents <= 5.0; // Show green if within normal target tolerance
            statusBorderColor = inTolerance ? 'var(--color-success)' : 'var(--color-warning)';
            dotBg = inTolerance ? 'var(--color-success-bg)' : 'var(--color-warning-bg)';
            textColor = 'var(--text-primary)';
            centsDisplayColor = inTolerance ? 'var(--color-success)' : 'var(--color-warning)';
            stepBoxShadow = `0 0 12px ${inTolerance ? 'var(--color-success-glow)' : 'var(--color-warning-glow)'}`;
          }

          return (
            <div
              key={step.noteName}
              onClick={() => setActiveStepIndex(idx)}
              className="flex flex-col items-center cursor-pointer z-10 flex-1 relative"
            >
              {/* Step Circle */}
              <div
                className="step-circle"
                style={{
                  background: dotBg,
                  border: `2px solid ${statusBorderColor}`,
                  boxShadow: stepBoxShadow,
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
                  <span style={{ color: 'var(--text-muted)', opacity: 0.5 }}>--</span>
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
