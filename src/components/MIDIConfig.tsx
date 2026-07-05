import React from 'react';
import { useCalibration } from '../context/CalibrationContext';

export const MIDIConfig: React.FC = () => {
  const {
    midiSupported,
    midiInitialized,
    initializeMidi,
    midiOutputs,
    selectedMidiId,
    setSelectedMidiId,
    midiActive,
    setMidiActive,
    triggerMidiPanic,
  } = useCalibration();

  return (
    <div id="midi-config-panel" className="panel-glass p-5">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        MIDI Output Interface
      </h3>

      {!midiSupported ? (
        <div className="alert-danger">
          <strong>MIDI Support Blocked or Unavailable:</strong> Make sure your browser supports the Web MIDI API and you have granted MIDI permissions.
        </div>
      ) : !midiInitialized ? (
        <div className="flex flex-col gap-4">
          <div className="text-[13px] text-secondary leading-relaxed">
            To transmit reference notes to your VCO, enable the Web MIDI interface. This will request MIDI device access permissions.
          </div>
          
          <button
            id="midi-init-btn"
            className="btn-primary w-full"
            onClick={initializeMidi}
          >
            🔌 Enable MIDI Output
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs text-secondary mb-1.5 font-medium uppercase">
              SELECT HARDWARE PORT
            </label>
            {midiOutputs.length === 0 ? (
              <select className="form-select" disabled>
                <option>No MIDI devices detected</option>
              </select>
            ) : (
              <select
                className="form-select"
                value={selectedMidiId}
                onChange={(e) => setSelectedMidiId(e.target.value)}
              >
                {midiOutputs.map((out) => (
                  <option key={out.id} value={out.id}>
                    {out.name || `Output Port ${out.id}`}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex gap-3 items-center">
            <button
              className={`btn-primary flex-1 ${midiActive ? 'btn-success-active' : ''}`}
              onClick={() => setMidiActive(!midiActive)}
              disabled={midiOutputs.length === 0}
            >
              {midiActive ? '🟢 MIDI Output Active' : '▶️ Start MIDI Output'}
            </button>
            
            <button
              className="btn-danger"
              style={{ padding: '10px 14px' }}
              title="Panic (All Notes Off)"
              onClick={triggerMidiPanic}
              disabled={midiOutputs.length === 0}
            >
              ⚠️ Panic
            </button>
          </div>
          
          <div className="text-xs text-muted leading-relaxed">
            {midiActive 
              ? 'Transmitting continuous reference pitches relative to the active octave step.' 
              : 'MIDI transmissions disabled. Send note gates automatically during VCO calibration steps.'}
          </div>
        </div>
      )}
    </div>
  );
};
