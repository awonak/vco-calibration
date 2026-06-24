import { CalibrationProvider } from './context/CalibrationContext';
import { LiveTuner } from './components/LiveTuner';
import { AudioVisualizer } from './components/AudioVisualizer';
import { CalibrationSteps } from './components/CalibrationSteps';
import { MIDIConfig } from './components/MIDIConfig';
import { HistoryLog } from './components/HistoryLog';
import logo from './assets/logo.png';

function App() {
  return (
    <CalibrationProvider>
      <div className="app-container">
        
        {/* Header */}
        <header className="panel-glass app-header">
          <div className="app-title-container">
            <span className="logo-glow">🎛️</span>
            <div>
              <h1 className="app-title">VCO Calibration Studio</h1>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', fontWeight: 500 }}>
                ANALOG VOLTAGE-CONTROLLED OSCILLATOR CALIBRATOR
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <span className="glow-animation" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'inline-block' }}></span>
              Precision Mode
            </div>
          </div>
        </header>

        {/* Core Layout Grid */}
        <main className="app-grid">
          
          {/* Left Column: Tuner, Waveform, Steps */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <LiveTuner />
            <AudioVisualizer />
            <CalibrationSteps />
          </section>

          {/* Right Column: MIDI Configuration, History Log, Manual Guide */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <MIDIConfig />
            
            <HistoryLog />

            {/* Analog Calibration Guidance panel */}
            <div className="panel-glass" style={{ padding: '20px', fontSize: '13px', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '8px', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                💡 Calibration Guide
              </h4>
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
    </CalibrationProvider>
  );
}

export default App;
