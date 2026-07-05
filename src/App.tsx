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
      <header className="panel app-header">
        <div className="app-title-container">
          <div>
            <h1 className="app-title">Analog VCO Calibration Studio</h1>
            <p className="text-xs text-secondary font-medium mt-1">
              ANALOG VOLTAGE-CONTROLLED OSCILLATOR CALIBRATOR
            </p>
          </div>
        </div>

        <button
          id="help-tour-btn"
          className="btn-secondary text-xs"
          onClick={() => setActiveTourStep(0)}
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
          <div id="calibration-guide-panel" className="panel p-5 text-sm text-secondary">
            <h3
              onClick={() => setGuideCollapsed(!guideCollapsed)}
              className={`text-primary font-semibold text-lg flex items-center justify-between cursor-pointer select-none ${guideCollapsed ? 'mb-0' : 'mb-2'}`}
            >
              <span className="flex items-center gap-2">
                Calibration Guide
              </span>
              <span className="text-xs text-secondary font-medium">
                {guideCollapsed ? '▼ Show' : '▲ Hide'}
              </span>
            </h3>

            {!guideCollapsed && (
              <>
                <p className="mb-2">
                  Analog VCOs drift due to temperature changes and component aging. To calibrate:
                </p>
                <ol className="flex flex-col gap-1 pl-4">
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

      <footer className="text-center text-muted text-xs flex flex-col items-center gap-3 mt-auto p-5 border-t border-panel">
        <div>
          VCO Calibration Studio &copy; {new Date().getFullYear()} &bull; <a href="https://github.com/awonak/vco-calibration" target="_blank" rel="noopener noreferrer" className="text-accent hover-text-primary font-medium">GitHub</a>
        </div>
        <img src={logo} alt="AWSM Logo" className="footer-logo" />
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
