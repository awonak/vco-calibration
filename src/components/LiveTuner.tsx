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
      tunerThemeClass = 'panel-glow-danger';
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
    <div id="tuner-panel" className="panel p-6 flex flex-col gap-5">
      
      {/* Top Header: Target vs Audio Input Button */}
      <div className="tuner-header">
        <div>
          <span className="text-[11px] text-secondary uppercase font-semibold tracking-wider">
            Target Pitch
          </span>
          <h2 className="tuner-target-note">
            {currentStep.noteName} <span className="text-lg font-normal text-secondary">({currentStep.targetHz.toFixed(3)} Hz)</span>
          </h2>
        </div>

        <div className="tuner-buttons">
          <button 
            id="tuner-start-btn" 
            className={`btn-primary px-3 text-sm ${audioActive ? 'btn-danger' : ''}`}
            onClick={audioActive ? stopAudio : startAudio}
          >
            {audioActive ? '⏹️ Stop Audio' : '🎙️ Start Tuner Input'}
          </button>
          
          <button
            id="tuner-preview-btn"
            className={`btn-secondary px-3 text-sm ${monitorActive && audioActive ? 'btn-active-accent' : ''}`}
            onClick={() => setMonitorActive(!monitorActive)}
            disabled={!audioActive}
          >
            {monitorActive && audioActive ? '🔊 Preview ON' : '🔈 Preview OFF'}
          </button>
        </div>
      </div>

      {/* Main Large Pitch Deviation Display Card */}
      <div id="pitch-reading-card" className={`recessed-screen ${tunerThemeClass} p-8 text-center relative overflow-hidden`}>
        
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

        <div className="text-[11px] text-secondary uppercase font-medium tracking-wider mb-2">
          Detected Fundamental Frequency (<span>f<sub>0</sub></span>)
        </div>

        {/* Massive Digit reading */}
        <div className="font-mono-data tuner-digits" style={{
          fontWeight: 700,
          color: isWithinTolerance ? 'var(--color-success)' : hasDetectedPitch ? 'var(--color-danger)' : 'var(--text-muted)',
          textShadow: isWithinTolerance 
            ? '0 0 30px rgba(16, 185, 129, 0.2)' 
            : hasDetectedPitch 
              ? '0 0 30px var(--color-danger-bg)' 
              : 'none',
          lineHeight: '1.1',
          marginBottom: '10px'
        }}>
          {frequencyDisplay} <span style={{ fontSize: '24px', fontWeight: 400 }}>Hz</span>
        </div>

        {/* Guitar-style Tuner Bar */}
        <div className="mt-6 mb-6 px-3 relative">
          {/* Cents Scale Markers */}
          <div className="flex justify-between text-[10px] text-muted font-mono mb-2">
            <span>-50¢</span>
            <span>-25¢</span>
            <span className={`font-semibold ${isWithinTolerance ? 'text-success' : 'text-secondary'}`}>0¢</span>
            <span>+25¢</span>
            <span>+50¢</span>
          </div>

          {/* Bar Track */}
          <div style={{
            height: '10px',
            background: 'var(--tuner-track-bg)',
            borderRadius: '5px',
            position: 'relative',
            border: '1px solid var(--tuner-track-border)',
            boxShadow: 'inset 0 1px 3px var(--tuner-track-shadow)',
          }}>
            {/* Center target tolerance zone indicator */}
            <div style={{
              position: 'absolute',
              left: `${50 - (toleranceCents / 100) * 100}%`,
              width: `${(toleranceCents / 50) * 100}%`,
              height: '100%',
              background: isWithinTolerance ? 'var(--tuner-zone-active)' : 'var(--tuner-zone-inactive)',
              borderLeft: isWithinTolerance ? '1px solid var(--tuner-zone-active-border)' : '1px solid var(--tuner-zone-inactive-border)',
              borderRight: isWithinTolerance ? '1px solid var(--tuner-zone-active-border)' : '1px solid var(--tuner-zone-inactive-border)',
              transition: 'background 0.3s ease, border-color 0.3s ease',
              top: 0
            }} />

            {/* Center perfect mark line */}
            <div style={{
              position: 'absolute',
              left: '50%',
              width: '1px',
              height: '16px',
              background: isWithinTolerance ? 'var(--color-success)' : 'var(--tuner-center-inactive)',
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
                  : 'var(--color-danger)',
                borderRadius: '3px',
                transform: 'translateX(-50%)',
                top: '-4px',
                boxShadow: isWithinTolerance 
                  ? '0 0 10px var(--color-success)' 
                  : '0 0 10px var(--color-danger)',
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
            <div className="text-[10px] text-muted uppercase font-semibold">
              FREQUENCY DEVIATION
            </div>
            <div className="font-mono-data text-lg font-semibold mt-1" style={{
              color: hasDetectedPitch ? (tunerData.deltaHz >= 0 ? 'var(--color-info)' : 'var(--color-danger)') : 'var(--text-muted)'
            }}>
              {deltaHzDisplay}
            </div>
          </div>
          
          <div style={{ width: '1px', background: 'var(--panel-border)' }} />

          <div>
            <div className="text-[10px] text-muted uppercase font-semibold">
              CENTS DEVIATION
            </div>
            <div className="font-mono-data text-lg font-semibold mt-1" style={{
              color: isWithinTolerance ? 'var(--color-success)' : hasDetectedPitch ? 'var(--color-danger)' : 'var(--text-muted)'
            }}>
              {deltaCentsDisplay}
            </div>
          </div>
        </div>

        {/* Live Status Message */}
        <div className={`text-[13px] mt-6 ${isWithinTolerance ? 'text-success font-semibold' : hasDetectedPitch ? 'text-danger font-semibold' : 'text-muted font-normal'}`}>
          {statusMessage}
        </div>
      </div>

      {/* Settings & Manual Controls Group Wrapper */}
      <div 
        id="tuner-settings-card" 
        className="flex flex-col gap-5 p-3 -m-3 rounded-sm"
      >
        {/* Manual Workflow Controls (Prev / Next manual overrides) */}
        <div className="flex gap-4">
          <button className="btn-secondary flex-1" onClick={goToPrevStep}>
            ⏮️ Previous Step
          </button>
          <button
            className="btn-primary flex-1"
            onClick={() => goToNextStep('manual')}
          >
            Next Step ⏭️
          </button>
        </div>

        <hr className="border-none border-b border-panel m-0" />

        {/* Calibration settings options */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '4px' }}>
          <div>
            <label className="block text-[11px] text-secondary mb-1 font-medium uppercase">
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
            <label className="block text-[11px] text-secondary mb-1 font-medium uppercase">
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
