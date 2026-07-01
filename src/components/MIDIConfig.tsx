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
    <div id="midi-config-panel" className="panel-glass" style={{ padding: '20px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        MIDI Output Interface
      </h3>

      {!midiSupported ? (
        <div style={{
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '8px',
          padding: '12px 16px',
          fontSize: '14px',
          color: '#fca5a5',
          lineHeight: '1.5'
        }}>
          <strong>MIDI Support Blocked or Unavailable:</strong> Make sure your browser supports the Web MIDI API and you have granted MIDI permissions.
        </div>
      ) : !midiInitialized ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            To transmit reference notes to your VCO, enable the Web MIDI interface. This will request MIDI device access permissions.
          </div>
          
          <button
            id="midi-init-btn"
            className="btn-primary"
            style={{
              width: '100%',
              background: 'var(--accent-gradient)',
              boxShadow: '0 4px 12px var(--accent-glow)'
            }}
            onClick={initializeMidi}
          >
            🔌 Enable MIDI Output
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 500 }}>
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

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              className="btn-primary"
              style={{
                flex: 1,
                background: midiActive ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'var(--accent-gradient)',
                boxShadow: midiActive ? '0 4px 12px rgba(16, 185, 129, 0.3)' : '0 4px 12px var(--accent-glow)'
              }}
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
          
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
            {midiActive 
              ? 'Transmitting continuous reference pitches relative to the active octave step.' 
              : 'MIDI transmissions disabled. Send note gates automatically during VCO calibration steps.'}
          </div>
        </div>
      )}
    </div>
  );
};
