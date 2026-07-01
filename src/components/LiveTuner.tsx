import { useCalibration } from '../context/CalibrationContext';

export const LiveTuner: React.FC = () => {
  const {
    activeStepIndex,
    goToNextStep,
    goToPrevStep,
    steps,
    toleranceCents,
    setToleranceCents,
    autoAdvanceSecs,
    setAutoAdvanceSecs,
    audioActive,
    startAudio,
    stopAudio,
    tunerData,
    monitorActive,
    setMonitorActive,
  } = useCalibration();

  const currentStep = steps[activeStepIndex];
  const hasDetectedPitch = tunerData.frequency > 0;
  const isWithinTolerance = hasDetectedPitch && Math.abs(tunerData.deltaCents) <= toleranceCents;

  // Render status text
  let statusMessage = 'Idle - Initialize audio input to start tuning';
  let tunerThemeClass = '';

  if (audioActive) {
    if (!hasDetectedPitch) {
      statusMessage = 'Waiting for input signal...';
    } else if (isWithinTolerance) {
      if (tunerData.isStable) {
        statusMessage = '🎯 Calibration Locked! Advancing...';
      } else {
        statusMessage = `🟢 Holding Pitch stable: ${(tunerData.stabilityProgress * autoAdvanceSecs).toFixed(1)}s / ${autoAdvanceSecs}s`;
      }
      tunerThemeClass = 'panel-glow-green';
    } else {
      statusMessage = tunerData.deltaCents > 0
        ? '⚠️ High - Adjust VCO pitch lower'
        : '⚠️ Low - Adjust VCO pitch higher';
      tunerThemeClass = 'panel-glow-amber';
    }
  }

  // Format pitch value for huge display
  const frequencyDisplay = hasDetectedPitch 
    ? tunerData.frequency.toFixed(3) 
    : '---';

  const deltaHzDisplay = hasDetectedPitch 
    ? `${tunerData.deltaHz >= 0 ? '+' : ''}${tunerData.deltaHz.toFixed(3)} Hz`
    : '-- Hz';

  const deltaCentsDisplay = hasDetectedPitch
    ? `${tunerData.deltaCents >= 0 ? '+' : ''}${tunerData.deltaCents.toFixed(1)}¢`
    : '--¢';

  return (
    <div id="tuner-panel" className="panel-glass" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Header: Target vs Audio Input Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
            Target Pitch
          </span>
          <h2 style={{ fontSize: '32px', fontWeight: 800, marginTop: '2px' }}>
            {currentStep.noteName} <span style={{ fontSize: '18px', fontWeight: 400, color: 'var(--text-secondary)' }}>({currentStep.targetHz.toFixed(3)} Hz)</span>
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button 
            id="tuner-start-btn" 
            className="btn-primary" 
            onClick={audioActive ? stopAudio : startAudio}
            style={{
              background: audioActive ? 'rgba(239, 68, 68, 0.15)' : undefined,
              borderColor: audioActive ? 'rgba(239, 68, 68, 0.3)' : undefined,
              color: audioActive ? '#fca5a5' : undefined,
              fontSize: '14px',
              padding: '10px 14px'
            }}
          >
            {audioActive ? '⏹️ Stop Audio' : '🎙️ Start Tuner Input'}
          </button>
          
          <button
            id="tuner-preview-btn"
            className="btn-secondary"
            onClick={() => setMonitorActive(!monitorActive)}
            disabled={!audioActive}
            style={{
              borderColor: monitorActive && audioActive ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.1)',
              color: !audioActive ? 'var(--text-muted)' : (monitorActive ? '#fff' : 'var(--text-secondary)'),
              background: monitorActive && audioActive ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.06)',
              boxShadow: monitorActive && audioActive ? '0 0 10px rgba(139, 92, 246, 0.2)' : 'none',
              fontSize: '14px',
              padding: '10px 14px',
              opacity: !audioActive ? 0.5 : 1,
              cursor: !audioActive ? 'not-allowed' : 'pointer'
            }}
          >
            {monitorActive && audioActive ? '🔊 Preview ON' : '🔈 Preview OFF'}
          </button>
        </div>
      </div>

      {/* Main Large Pitch Deviation Display Card */}
      <div id="pitch-reading-card" className={`panel-glass ${tunerThemeClass}`} style={{
        background: 'rgba(5, 7, 14, 0.5)',
        padding: '30px 20px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        
        {/* Real-time Stability Progress Bar Overlay */}
        {audioActive && isWithinTolerance && autoAdvanceSecs > 0 && (
          <div style={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            height: '4px',
            background: 'var(--color-success)',
            width: `${tunerData.stabilityProgress * 100}%`,
            boxShadow: '0 0 10px var(--color-success)',
            transition: 'width 0.1s linear'
          }} />
        )}

        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 500, letterSpacing: '0.05em', marginBottom: '8px' }}>
          Detected Fundamental Frequency (<span style={{ textTransform: 'none' }}>f<sub>0</sub></span>)
        </div>

        {/* Massive Digit reading */}
        <div className="font-mono-data" style={{
          fontSize: '64px',
          fontWeight: 700,
          color: isWithinTolerance ? 'var(--color-success)' : hasDetectedPitch ? 'var(--color-warning)' : 'var(--text-muted)',
          textShadow: isWithinTolerance 
            ? '0 0 30px rgba(16, 185, 129, 0.2)' 
            : hasDetectedPitch 
              ? '0 0 30px rgba(245, 158, 11, 0.15)' 
              : 'none',
          lineHeight: '1.1',
          marginBottom: '10px'
        }}>
          {frequencyDisplay} <span style={{ fontSize: '24px', fontWeight: 400 }}>Hz</span>
        </div>

        {/* Guitar-style Tuner Bar */}
        <div style={{
          marginTop: '24px',
          marginBottom: '24px',
          padding: '0 12px',
          position: 'relative'
        }}>
          {/* Cents Scale Markers */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '10px',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            marginBottom: '6px'
          }}>
            <span>-50¢</span>
            <span>-25¢</span>
            <span style={{ color: isWithinTolerance ? 'var(--color-success)' : 'var(--text-secondary)', fontWeight: 600 }}>0¢</span>
            <span>+25¢</span>
            <span>+50¢</span>
          </div>

          {/* Bar Track */}
          <div style={{
            height: '10px',
            background: 'rgba(255, 255, 255, 0.04)',
            borderRadius: '5px',
            position: 'relative',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)',
          }}>
            {/* Center target tolerance zone indicator */}
            <div style={{
              position: 'absolute',
              left: `${50 - (toleranceCents / 100) * 100}%`,
              width: `${(toleranceCents / 50) * 100}%`,
              height: '100%',
              background: isWithinTolerance ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.01)',
              borderLeft: isWithinTolerance ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(255, 255, 255, 0.05)',
              borderRight: isWithinTolerance ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(255, 255, 255, 0.05)',
              transition: 'background 0.3s ease, border-color 0.3s ease',
              top: 0
            }} />

            {/* Center perfect mark line */}
            <div style={{
              position: 'absolute',
              left: '50%',
              width: '1px',
              height: '16px',
              background: isWithinTolerance ? 'var(--color-success)' : 'rgba(255, 255, 255, 0.2)',
              top: '-3px',
              zIndex: 1
            }} />

            {/* Moving Needle Indicator */}
            {hasDetectedPitch && (
              <div style={{
                position: 'absolute',
                // Bound cents between -50 and +50
                left: `${Math.max(0, Math.min(100, ((tunerData.deltaCents + 50) / 100) * 100))}%`,
                width: '10px',
                height: '18px',
                background: isWithinTolerance 
                  ? 'var(--color-success)' 
                  : tunerData.deltaCents > 0 
                    ? 'var(--color-warning)' 
                    : '#f472b6',
                borderRadius: '3px',
                transform: 'translateX(-50%)',
                top: '-4px',
                boxShadow: isWithinTolerance 
                  ? '0 0 10px var(--color-success)' 
                  : tunerData.deltaCents > 0 
                    ? '0 0 10px var(--color-warning)' 
                    : '0 0 10px #f472b6',
                transition: 'left 0.1s linear, background-color 0.2s ease',
                zIndex: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {/* Needle center indicator pin */}
                <div style={{
                  width: '2px',
                  height: '10px',
                  background: '#000',
                  borderRadius: '1px'
                }} />
              </div>
            )}
          </div>
        </div>

        {/* Details: Delta Hz and Delta Cents */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginTop: '16px' }}>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              FREQUENCY DEVIATION
            </div>
            <div className="font-mono-data" style={{
              fontSize: '18px',
              fontWeight: 600,
              marginTop: '4px',
              color: hasDetectedPitch ? (tunerData.deltaHz >= 0 ? '#67e8f9' : '#f472b6') : 'var(--text-muted)'
            }}>
              {deltaHzDisplay}
            </div>
          </div>
          
          <div style={{ width: '1px', background: 'rgba(255,255,255,0.06)' }} />

          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              CENTS DEVIATION
            </div>
            <div className="font-mono-data" style={{
              fontSize: '18px',
              fontWeight: 600,
              marginTop: '4px',
              color: isWithinTolerance ? 'var(--color-success)' : hasDetectedPitch ? 'var(--color-warning)' : 'var(--text-muted)'
            }}>
              {deltaCentsDisplay}
            </div>
          </div>
        </div>

        {/* Live Status Message */}
        <div style={{
          fontSize: '13px',
          marginTop: '24px',
          color: isWithinTolerance ? '#6ee7b7' : hasDetectedPitch ? 'rgba(245, 158, 11, 0.8)' : 'var(--text-muted)',
          fontWeight: isWithinTolerance || hasDetectedPitch ? 600 : 400
        }}>
          {statusMessage}
        </div>
      </div>

      {/* Settings & Manual Controls Group Wrapper */}
      <div 
        id="tuner-settings-card" 
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '20px',
          padding: '12px',
          margin: '-12px',
          borderRadius: '12px'
        }}
      >
        {/* Manual Workflow Controls (Prev / Next manual overrides) */}
        <div style={{ display: 'flex', gap: '16px' }}>
          <button className="btn-secondary" onClick={goToPrevStep} style={{ flex: 1 }}>
            ⏮️ Previous Step
          </button>
          <button
            className="btn-primary"
            onClick={() => goToNextStep('manual')}
            style={{ flex: 1 }}
          >
            Next Step ⏭️
          </button>
        </div>

        <hr style={{ border: 'none', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', margin: '0' }} />

        {/* Calibration settings options */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 500, textTransform: 'uppercase' }}>
              Lock Tolerance (Cents)
            </label>
            <select
              className="form-select"
              value={toleranceCents}
              onChange={(e) => setToleranceCents(parseFloat(e.target.value))}
            >
              <option value="1">± 1.0 Cent (Extremely Strict)</option>
              <option value="2">± 2.0 Cents (Strict - Default)</option>
              <option value="5">± 5.0 Cents (Normal)</option>
              <option value="10">± 10.0 Cents (Loose)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 500, textTransform: 'uppercase' }}>
              Auto-Advance Lock Hold
            </label>
            <select
              className="form-select"
              value={autoAdvanceSecs}
              onChange={(e) => setAutoAdvanceSecs(parseFloat(e.target.value))}
            >
              <option value="1">1.0 Seconds</option>
              <option value="1.5">1.5 Seconds</option>
              <option value="2">2.0 Seconds</option>
              <option value="3">3.0 Seconds</option>
              <option value="5">5.0 Seconds (Default)</option>
              <option value="0">Disabled (Manual Only)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LiveTuner;
