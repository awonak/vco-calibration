import { useState } from 'react';
import { CalibrationProvider, useCalibration } from './context/CalibrationContext';
import { LiveTuner } from './components/LiveTuner';
import { AudioVisualizer } from './components/AudioVisualizer';
import { CalibrationSteps } from './components/CalibrationSteps';
import { MIDIConfig } from './components/MIDIConfig';
import { HistoryLog } from './components/HistoryLog';
import { HelpTour } from './components/HelpTour';
import logo from './assets/logo.png';

function StudioLayout() {
  const { setActiveTourStep } = useCalibration();
  const [guideCollapsed, setGuideCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768;
    }
    return false;
  });

  return (
    <div className="app-container">
      <HelpTour />

      {/* Header */}
      <header className="panel-glass app-header">
        <div className="app-title-container">
          <div>
            <h1 className="app-title">Analog VCO Calibration Studio</h1>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', fontWeight: 500 }}>
              ANALOG VOLTAGE-CONTROLLED OSCILLATOR CALIBRATOR
            </p>
          </div>
        </div>

        <button
          id="help-tour-btn"
          className="btn-secondary"
          onClick={() => setActiveTourStep(0)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            fontSize: '12px',
            fontWeight: 600,
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          ❓ Help Tour
        </button>
      </header>

      {/* Core Layout Grid */}
      <main className="app-grid">

        {/* Left Column: Tuner, Waveform, Steps */}
        <section className="desktop-left-col">
          <LiveTuner />
          <AudioVisualizer />
          <CalibrationSteps />
        </section>

        {/* Right Column: MIDI Configuration, History Log, Manual Guide */}
        <section className="desktop-right-col">
          <MIDIConfig />

          <HistoryLog />

          {/* Analog Calibration Guidance panel */}
          <div id="calibration-guide-panel" className="panel-glass" style={{ padding: '20px', fontSize: '13px', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
            <h3
              onClick={() => setGuideCollapsed(!guideCollapsed)}
              style={{
                color: 'var(--text-primary)',
                marginBottom: guideCollapsed ? '0' : '8px',
                fontSize: '18px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                userSelect: 'none'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                Calibration Guide
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                {guideCollapsed ? '▼ Show' : '▲ Hide'}
              </span>
            </h3>

            {!guideCollapsed && (
              <>
                <p style={{ marginBottom: '10px' }}>
                  Analog VCOs drift due to temperature changes and component aging. To calibrate:
                </p>
                <ol style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <li>Connect your MIDI interface output to the pitch input of your physical VCO.</li>
                  <li>Feed the VCO audio output back into your computer's audio input.</li>
                  <li>Select the MIDI port above and trigger <strong>Enable MIDI Output</strong>.</li>
                  <li>Start at <strong>C1</strong>, adjust your hardware VCO coarse/fine pitch pots to zero out deviation.</li>
                  <li>Advance up the octaves (C2-C5), adjusting the VCO's volt-per-octave tracking trim pots.</li>
                  <li>Loop back to check for drift and iterate until all 5 octaves lock within tolerance!</li>
                </ol>
              </>
            )}
          </div>
        </section>

      </main>

      <footer style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: '11px', borderTop: '1px solid rgba(255, 255, 255, 0.03)', marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <div>
          VCO Calibration Studio &copy; {new Date().getFullYear()} &bull; <a href="https://github.com/awonak/vco-calibration" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s ease' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}>GitHub</a>
        </div>
        <img src={logo} alt="AWSM Logo" style={{ height: '32px', width: 'auto', opacity: 0.45, filter: 'invert(1)' }} />
      </footer>

    </div>
  );
}

function App() {
  return (
    <CalibrationProvider>
      <StudioLayout />
    </CalibrationProvider>
  );
}

export default App;
