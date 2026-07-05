import React, { useEffect, useState, useRef } from 'react';
import { useCalibration } from '../context/CalibrationContext';

interface TourStep {
  targetId: string | null;
  title: string;
  content: React.ReactNode;
  placement: 'bottom' | 'top' | 'left' | 'right' | 'center';
  width?: number;
  offset?: number;
}

const TOUR_STEPS: TourStep[] = [
  {
    targetId: null,
    title: "👋 Welcome to VCO Calibration Studio!",
    content: (
      <>
        <div className="mb-2">
          This guided tour will walk you through the features of the Analog VCO Calibration Studio. This app assists you in calibrating an analog VCO using Web MIDI reference signals and high-precision Web Audio analysis for live visual feedback.
        </div>
        <div>
          🎬 Watch the <a href="https://youtu.be/DeOrSrbVILY?si=QfmlCPebyw14agCP" target="_blank" rel="noopener noreferrer" className="text-accent font-semibold hover-text-primary">calibration demo video</a> to see it in action!
        </div>
      </>
    ),
    placement: 'center'
  },
  {
    targetId: "midi-config-panel",
    title: "🔌 1. MIDI Output Setup",
    content: (
      <>
        <div className="mb-2">
          Click 'Enable MIDI Output' and grant Web MIDI permissions. This will initialize the interface, discover your hardware ports, and allow you to transmit reference gate and pitch notes to control your physical synthesizer's voice.
        </div>
        <div className="mb-2">
          You can use any USB MIDI interface eurorack module like <a href="https://intellijel.com/shop/eurorack/umidi/" target="_blank" rel="noopener noreferrer" className="text-accent font-semibold hover-text-primary">Intellijel µMIDI</a> or a USB MIDI keyboard with CV pitch output like the <a href="https://www.arturia.com/products/hybrid-synths/keystep-mk2/keystep-32-mk2" target="_blank" rel="noopener noreferrer" className="text-accent font-semibold hover-text-primary">Arturia Keystep</a>.
        </div>
        <div>
          💡 <strong>Note:</strong> Using the MIDI output is optional and is only used to auto-advance the reference note. You can still manually change the reference note with the Previous / Next Step buttons.
        </div>
      </>
    ),
    placement: 'bottom'
  },
  {
    targetId: "tuner-start-btn",
    title: "🎙️ 2. Start Tuner Input",
    content: (
      <>
        <div className="mb-2">
          Click 'Start Tuner Input' and grant microphone/audio permissions. This will initialize the autocorrelation pitch detection engine to capture your synthesizer's fundamental frequency.
        </div>
        <div>
          You can capture your VCO's output using your computer or phone's built-in microphone if the room is quiet and the VCO can be clearly heard. To get maximum frequency detection precision, use a direct cable connection into the Aux / Line Input of your computer.
        </div>
      </>
    ),
    placement: 'bottom'
  },
  {
    targetId: "tuner-preview-btn",
    title: "🔊 3. Speaker Preview Monitoring",
    content: (
      <>
        <div className="mb-2">
          Toggle 'Preview ON/OFF' to monitor the raw incoming synthesizer audio directly through your speakers, calibrated with click-free volume transitions.
        </div>
        <div>
          ⚠️ <strong>Note:</strong> Only use this feature when using a direct connection to the Aux / Line Input of your computer, otherwise you'll experience audio feedback screeching!
        </div>
      </>
    ),
    placement: 'bottom'
  },
  {
    targetId: "pitch-reading-card",
    title: "🎯 4. Real-time Cents Pitch Tuner",
    content: "Displays the detected fundamental frequency (f₀) with sub-Hz precision, the cents deviation, and a responsive needle gauge spanning -50¢ to +50¢.",
    placement: 'bottom',
    offset: 24
  },
  {
    targetId: "tuner-settings-card",
    title: "⚙️ 5. Auto-Advance Hold & Tolerance",
    content: (
      <>
        <div className="mb-2 font-semibold text-accent">
          This is the key feature of the VCO Calibration Studio!
        </div>
        <div className="mb-2">
          If you have a MIDI device connected, the system will automatically advance to the next step once the pitch stabilizes within your tolerance range. This eliminates the need to manually change octaves and allows you to keep your hands on the VCO tracking tuner.
        </div>
        <div className="mb-2">
          Configure your lock tolerance (cents) based on your desired precision. Some oscillators are inherently unstable and will need a looser lock tolerance. Next set the auto-advance hold delay to your preferred duration before advancing to the next step.
        </div>
        <div>
          You can always use the Previous / Next Step buttons if you do not have a MIDI device connected, or if you want to manually change steps.
        </div>
      </>
    ),
    placement: 'top',
    width: 480
  },
  {
    targetId: "waveform-card",
    title: "📈 6. Oscilloscope Display",
    content: "Renders the raw time-domain audio waveform at 60fps, providing immediate visual feedback of connection health and signal stability.",
    placement: 'top'
  },
  {
    targetId: "calibration-steps-timeline",
    title: "🔄 7. Octave Calibration Steps",
    content: "Tracks progress from C1 through C5. Displays the active octave note and the saved cents tracking offset for each calibrated step.",
    placement: 'top'
  },
  {
    targetId: "history-log-panel",
    title: "📊 8. Session History Log",
    content: (
      <>
        <div className="mb-2">
          Records the initial tracking error deviation of each octave step as soon as you transition to it, helping you review your VCO's tracking curve.
        </div>
        <div>
          📈 <strong>Calibration Tip:</strong> Make a note of the error deviation trend across all 5 steps to inform how much you should be adjusting your v/oct tracking.
        </div>
      </>
    ),
    placement: 'top',
    width: 400
  },
  {
    targetId: null,
    title: "🏁 Ready to Calibrate!",
    content: "Start at C1, adjust your hardware coarse/fine pitch pots, and then advance up the register to adjust your synth's Volt-per-Octave trimmer pots. Click 'Finish' to start tuning!",
    placement: 'center'
  }
];

export const HelpTour: React.FC = () => {
  const { activeTourStep, setActiveTourStep } = useCalibration();
  const [coords, setCoords] = useState<React.CSSProperties>({});
  const popoverRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (activeTourStep === null) return;

    const currentStep = TOUR_STEPS[activeTourStep];
    const targetId = currentStep.targetId;

    // Handle highlighted element class toggling
    let targetEl: HTMLElement | null = null;
    let parentEl: HTMLElement | null = null;
    if (targetId) {
      targetEl = document.getElementById(targetId);
      if (targetEl) {
        targetEl.classList.add('tour-highlighted');
        parentEl = (targetEl.parentElement?.closest('.panel-glass') || targetEl) as HTMLElement;
        parentEl.classList.add('tour-parent-elevated');

        // Scroll the element into view dynamically based on placement to prevent tooltip cutoff
        const placement = currentStep.placement;
        let scrollBlock: ScrollIntoViewOptions['block'] = 'center';
        if (placement === 'top') {
          scrollBlock = 'end';
        } else if (placement === 'bottom') {
          scrollBlock = 'start';
        }

        targetEl.scrollIntoView({ behavior: 'smooth', block: scrollBlock });
      }
    }

    const updatePosition = () => {
      const popoverWidth = currentStep.width || 320;

      if (!targetId || !targetEl) {
        // Center of viewport
        setCoords({
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: `${popoverWidth}px`,
        });
        return;
      }

      const rect = targetEl.getBoundingClientRect();
      const popoverHeight = popoverRef.current ? popoverRef.current.offsetHeight : 200;
      const margin = currentStep.offset || 20;

      let top = 0;
      let left = 0;

      if (currentStep.placement === 'bottom') {
        top = rect.bottom + window.scrollY + margin;
        left = rect.left + window.scrollX + rect.width / 2 - popoverWidth / 2;
      } else if (currentStep.placement === 'top') {
        top = rect.top + window.scrollY - popoverHeight - margin;
        left = rect.left + window.scrollX + rect.width / 2 - popoverWidth / 2;
      } else if (currentStep.placement === 'left') {
        top = rect.top + window.scrollY + rect.height / 2 - popoverHeight / 2;
        left = rect.left + window.scrollX - popoverWidth - margin;
      } else if (currentStep.placement === 'right') {
        top = rect.top + window.scrollY + rect.height / 2 - popoverHeight / 2;
        left = rect.right + window.scrollX + margin;
      }

      // Constrain position within viewport boundaries
      const padding = 16;
      left = Math.max(padding, Math.min(left, window.innerWidth + window.scrollX - popoverWidth - padding));
      top = Math.max(padding, Math.min(top, document.documentElement.scrollHeight - popoverHeight - padding));

      setCoords({
        position: 'absolute',
        top: `${top}px`,
        left: `${left}px`,
        transform: 'none',
        width: `${popoverWidth}px`,
      });
    };

    // Run position update
    updatePosition();

    // Recompute on popover resize, window scroll, resize
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    // Timeout to re-run after scroll/render finishes layout
    const timeoutId = setTimeout(updatePosition, 100);

    return () => {
      if (targetEl) {
        targetEl.classList.remove('tour-highlighted');
      }
      if (parentEl) {
        parentEl.classList.remove('tour-parent-elevated');
      }
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
      clearTimeout(timeoutId);
    };
  }, [activeTourStep]);

  if (activeTourStep === null) return null;

  const currentStep = TOUR_STEPS[activeTourStep];
  const totalSteps = TOUR_STEPS.length;
  const isFirst = activeTourStep === 0;
  const isLast = activeTourStep === totalSteps - 1;

  const handleNext = () => {
    if (activeTourStep < totalSteps - 1) {
      setActiveTourStep(activeTourStep + 1);
    } else {
      setActiveTourStep(null);
    }
  };

  const handleBack = () => {
    if (activeTourStep > 0) {
      setActiveTourStep(activeTourStep - 1);
    }
  };

  const handleSkip = () => {
    setActiveTourStep(null);
  };

  return (
    <>
      {/* Semi-transparent Backdrop */}
      <div className="tour-backdrop" onClick={handleSkip} />

      {/* Floating Tooltip Card */}
      <div
        ref={popoverRef}
        className="tour-popover"
        style={coords}
      >
        <div className="tour-popover-header">
          <span className="tour-popover-step">
            {isFirst || isLast ? 'ℹ️ Intro' : `Step ${activeTourStep} / ${totalSteps - 2}`}
          </span>
          <button className="btn-tour-skip cursor-pointer text-sm" onClick={handleSkip} title="Exit Tour">
            ✕
          </button>
        </div>

        <h5>{currentStep.title}</h5>
        <div className="tour-popover-content">{currentStep.content}</div>

        <div className="tour-popover-buttons">
          {!isFirst && !isLast && (
            <button className="btn-tour-skip" onClick={handleSkip}>
              Skip
            </button>
          )}
          {isFirst && <div className="flex-1" />}

          <div className="flex gap-2 ml-auto">
            {!isFirst && (
              <button className="btn-tour-nav" onClick={handleBack}>
                ⏮️ Back
              </button>
            )}
            <button className="btn-tour-next" onClick={handleNext}>
              {isFirst ? '🚀 Start Tour' : isLast ? '🏁 Finish' : 'Next ⏭️'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
