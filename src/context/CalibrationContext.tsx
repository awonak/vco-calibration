/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { detectPitch, frequencyToCents, type PitchResult } from '../utils/pitchDetector';
import {
  requestMIDIAccessSafe,
  sendNoteOn,
  sendNoteOff,
  sendPanic,
  type WebMIDIOutput,
  type WebMIDIAccess,
} from '../utils/midiHelper';
import {
  type CalibrationStep,
  CALIBRATION_STEPS,
  type HistoryEntry,
  type TunerSnapshot,
} from '../types/calibration';

interface CalibrationContextType {
  // Navigation & Steps
  activeStepIndex: number;
  setActiveStepIndex: (index: number) => void;
  goToNextStep: (method?: 'auto' | 'manual') => void;
  goToPrevStep: () => void;
  steps: CalibrationStep[];

  // Settings
  toleranceCents: number;
  setToleranceCents: (val: number) => void;
  autoAdvanceSecs: number;
  setAutoAdvanceSecs: (val: number) => void;

  // MIDI Connection
  midiSupported: boolean;
  midiOutputs: WebMIDIOutput[];
  selectedMidiId: string;
  setSelectedMidiId: (id: string) => void;
  midiActive: boolean;
  setMidiActive: (active: boolean) => void;
  triggerMidiPanic: () => void;

  // Web Audio & Tuner
  audioSupported: boolean;
  audioActive: boolean;
  startAudio: () => Promise<boolean>;
  stopAudio: () => void;
  analyserNode: AnalyserNode | null;
  tunerData: TunerSnapshot;
  monitorActive: boolean;
  setMonitorActive: (active: boolean) => void;

  // History Log
  historyLog: HistoryEntry[];
  clearHistory: () => void;
  addHistoryEntry: (measuredHz: number, method?: 'auto' | 'manual') => void;

  // Onboarding Guided Tour
  activeTourStep: number | null;
  setActiveTourStep: (step: number | null) => void;
}

const CalibrationContext = createContext<CalibrationContextType | undefined>(undefined);

export const CalibrationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Navigation & Steps State
  const [activeStepIndex, setActiveStepIndexState] = useState<number>(0);

  // 2. Settings State
  const [toleranceCents, setToleranceCents] = useState<number>(2.0);
  const [autoAdvanceSecs, setAutoAdvanceSecs] = useState<number>(5.0);

  // 3. MIDI State
  const [midiSupported, setMidiSupported] = useState<boolean>(false);
  const [midiOutputs, setMidiOutputs] = useState<WebMIDIOutput[]>([]);
  const [selectedMidiId, setSelectedMidiId] = useState<string>('');
  const [midiActive, setMidiActive] = useState<boolean>(false);

  // 4. Audio State
  const [audioSupported, setAudioSupported] = useState<boolean>(true);
  const [audioActive, setAudioActive] = useState<boolean>(false);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
  const [tunerData, setTunerData] = useState<TunerSnapshot>({
    frequency: -1,
    rms: 0,
    deltaHz: 0,
    deltaCents: 0,
    isStable: false,
    stabilityProgress: 0,
  });
  const [monitorActive, setMonitorActive] = useState<boolean>(false);

  // 5. History State
  const [historyLog, setHistoryLog] = useState<HistoryEntry[]>([]);

  // 6. Onboarding Help Tour State
  const [activeTourStep, setActiveTourStep] = useState<number | null>(null);

  // Refs for high performance Web Audio rendering loop
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const monitorGainRef = useRef<GainNode | null>(null);

  // Shared ref for the selected output to avoid dependency cycles in requestAnimationFrame
  const selectedMidiOutputRef = useRef<WebMIDIOutput | null>(null);

  // Keep a ref of monitor active state to read inside callback without staleness
  const monitorActiveRef = useRef<boolean>(monitorActive);
  useEffect(() => {
    monitorActiveRef.current = monitorActive;
    if (monitorGainRef.current && audioContextRef.current) {
      const targetGain = monitorActive ? 1.0 : 0.0;
      monitorGainRef.current.gain.setTargetAtTime(targetGain, audioContextRef.current.currentTime, 0.01);
    }
  }, [monitorActive]);

  // Keep a ref of toleranceCents and autoAdvanceSecs to read inside requestAnimationFrame without staleness
  const toleranceCentsRef = useRef<number>(toleranceCents);
  const autoAdvanceSecsRef = useRef<number>(autoAdvanceSecs);
  
  useEffect(() => {
    toleranceCentsRef.current = toleranceCents;
  }, [toleranceCents]);

  useEffect(() => {
    autoAdvanceSecsRef.current = autoAdvanceSecs;
  }, [autoAdvanceSecs]);

  // Latest frequency tracked via Ref to prevent side-effects in state setters during Strict Mode
  const latestFrequencyRef = useRef<number>(-1);

  // Refs for tracking stability
  const stableStartTimeRef = useRef<number | null>(null);
  const lastAdvanceTimeRef = useRef<number>(0);

  // Throttle timer for numerical React state updates (10Hz / 100ms)
  const lastStateUpdateTimeRef = useRef<number>(0);

  // Refs for initial frequency log tracking on step transitions
  const pendingInitialLogRef = useRef<boolean>(false);
  const pendingLogMethodRef = useRef<'auto' | 'manual'>('manual');
  const stepTransitionTimeRef = useRef<number>(0);

  // Clean up midi notes ref tracking
  const activeStepIndexRef = useRef<number>(activeStepIndex);
  
  // Safe ref assignment outside render phase
  useEffect(() => {
    activeStepIndexRef.current = activeStepIndex;
  }, [activeStepIndex]);

  // Initialize MIDI Device access
  useEffect(() => {
    let midiAccessObj: WebMIDIAccess | null = null;

    async function initMidi() {
      const access = await requestMIDIAccessSafe();
      if (access) {
        setMidiSupported(true);
        midiAccessObj = access;

        const updateOutputs = () => {
          const list = Array.from(access.outputs.values());
          setMidiOutputs(list);
          if (list.length > 0 && !selectedMidiId) {
            // Default to first output
            setSelectedMidiId(list[0].id);
          }
        };

        updateOutputs();
        access.onstatechange = updateOutputs;
      } else {
        setMidiSupported(false);
      }
    }

    initMidi();

    return () => {
      if (midiAccessObj) {
        midiAccessObj.onstatechange = undefined;
      }
    };
  }, [selectedMidiId]);

  // Keep track of the active MIDI output object in a Ref
  useEffect(() => {
    const output = midiOutputs.find((o) => o.id === selectedMidiId) || null;
    selectedMidiOutputRef.current = output;

    // Send Panic to silence all notes on the old device
    if (output) {
      sendPanic(output);
      // If MIDI is active, start playing the current target note
      if (midiActive) {
        const activeNote = CALIBRATION_STEPS[activeStepIndex].noteNumber;
        sendNoteOn(output, activeNote, 100);
      }
    }
  }, [selectedMidiId, midiOutputs, midiActive, activeStepIndex]);

  // Handle Note triggers when step index changes
  const setActiveStepIndex = useCallback((index: number) => {
    const output = selectedMidiOutputRef.current;
    if (output && midiActive) {
      const prevNote = CALIBRATION_STEPS[activeStepIndexRef.current].noteNumber;
      sendNoteOff(output, prevNote);

      const nextNote = CALIBRATION_STEPS[index].noteNumber;
      sendNoteOn(output, nextNote, 100);
    }
    setActiveStepIndexState(index);
    stableStartTimeRef.current = null; // Reset stability timer
  }, [midiActive]);

  // Trigger Panic / Silence
  const triggerMidiPanic = useCallback(() => {
    const output = selectedMidiOutputRef.current;
    if (output) {
      sendPanic(output);
    }
  }, []);

  // Handle active midi state toggle
  useEffect(() => {
    const output = selectedMidiOutputRef.current;
    if (output) {
      if (midiActive) {
        const activeNote = CALIBRATION_STEPS[activeStepIndex].noteNumber;
        sendNoteOn(output, activeNote, 100);
      } else {
        sendPanic(output);
      }
    }
  }, [midiActive, activeStepIndex]);

  // Stop MIDI on unmount
  useEffect(() => {
    return () => {
      const output = selectedMidiOutputRef.current;
      if (output) {
        sendPanic(output);
      }
    };
  }, []);

  // History Log helper
  const addHistoryEntry = useCallback((measuredHz: number, method: 'auto' | 'manual' = 'manual') => {
    const step = CALIBRATION_STEPS[activeStepIndexRef.current];
    const cents = frequencyToCents(measuredHz, step.targetHz);
    const newEntry: HistoryEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      stepIndex: activeStepIndexRef.current,
      noteName: step.noteName,
      targetHz: step.targetHz,
      measuredHz,
      deltaHz: measuredHz - step.targetHz,
      deltaCents: cents,
      method,
    };
    
    setHistoryLog((prev) => {
      // Prevent duplicate log entries within a short time window (500ms) for the same step and same method
      if (prev.length > 0) {
        const lastEntry = prev[0];
        const timeDiff = Math.abs(newEntry.timestamp - lastEntry.timestamp);
        if (lastEntry.stepIndex === newEntry.stepIndex && 
            lastEntry.method === newEntry.method && 
            timeDiff < 500) {
          return prev;
        }
      }
      return [newEntry, ...prev];
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistoryLog([]);
  }, []);

  // Navigation handlers
  const goToNextStep = useCallback((method: 'auto' | 'manual' = 'manual') => {
    // Flag to record the initial measurement of the next octave once we switch and it settles
    pendingInitialLogRef.current = true;
    pendingLogMethodRef.current = method;
    stepTransitionTimeRef.current = performance.now();

    const nextIndex = (activeStepIndexRef.current + 1) % CALIBRATION_STEPS.length;
    setActiveStepIndex(nextIndex);
  }, [setActiveStepIndex]);

  const goToPrevStep = useCallback(() => {
    // Flag to record the initial measurement of the previous octave once we switch and it settles
    pendingInitialLogRef.current = true;
    pendingLogMethodRef.current = 'manual';
    stepTransitionTimeRef.current = performance.now();

    const prevIndex = (activeStepIndexRef.current - 1 + CALIBRATION_STEPS.length) % CALIBRATION_STEPS.length;
    setActiveStepIndex(prevIndex);
  }, [setActiveStepIndex]);

  // Audio Context operations
  const startAudio = async (): Promise<boolean> => {
    if (audioActive) return true;

    try {
      // Create new AudioContext
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      // Get user audio stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      streamRef.current = stream;

      // Create and configure AnalyserNode
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 8192; // 8192 samples for C1 (32Hz) pitch detection resolution
      analyserRef.current = analyser;
      setAnalyserNode(analyser); // Correct state update outside render

      // Connect source
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      // Connect source to monitor gain for audio preview/monitoring
      const monitorGain = audioCtx.createGain();
      monitorGain.gain.value = monitorActiveRef.current ? 1.0 : 0.0;
      source.connect(monitorGain);
      monitorGain.connect(audioCtx.destination);
      monitorGainRef.current = monitorGain;

      setAudioActive(true);
      setAudioSupported(true);

      // Start processing loop
      lastStateUpdateTimeRef.current = 0;
      stableStartTimeRef.current = null;
      
      const processLoop = (timestamp: number) => {
        if (!analyserRef.current || !audioCtx) return;

        const bufferLength = analyserRef.current.fftSize;
        const dataArray = new Float32Array(bufferLength);
        analyserRef.current.getFloatTimeDomainData(dataArray);

        // Run autocorrelation pitch detection
        const pitchResult: PitchResult = detectPitch(dataArray, audioCtx.sampleRate);
        latestFrequencyRef.current = pitchResult.frequency; // Update ref directly outside React rendering
        const target = CALIBRATION_STEPS[activeStepIndexRef.current];

        let deltaHz = 0;
        let deltaCents = 0;
        let isStable = false;
        let stabilityProgress = 0;

        if (pitchResult.frequency > 0) {
          deltaHz = pitchResult.frequency - target.targetHz;
          deltaCents = frequencyToCents(pitchResult.frequency, target.targetHz);

          // Record the initial frequency deviation of the new octave if a step transition is pending
          // We wait at least 400ms after the transition started to allow the physical VCO and pitch engine to settle.
          if (pendingInitialLogRef.current && (timestamp - stepTransitionTimeRef.current >= 400)) {
            pendingInitialLogRef.current = false;
            addHistoryEntry(pitchResult.frequency, pendingLogMethodRef.current);
          }

          // Check if within tolerance using ref to avoid stale closure values
          if (Math.abs(deltaCents) <= toleranceCentsRef.current) {
            if (stableStartTimeRef.current === null) {
              stableStartTimeRef.current = timestamp;
            } else {
              const elapsedSecs = (timestamp - stableStartTimeRef.current) / 1000;
              const currentAutoAdvanceSecs = autoAdvanceSecsRef.current;
              
              if (currentAutoAdvanceSecs > 0) {
                stabilityProgress = Math.min(1.0, elapsedSecs / currentAutoAdvanceSecs);
                
                if (elapsedSecs >= currentAutoAdvanceSecs) {
                  isStable = true;
                  
                  // Throttle automatic step advances to prevent double trigger jumps
                  if (timestamp - lastAdvanceTimeRef.current > 3000) {
                    lastAdvanceTimeRef.current = timestamp;
                    stableStartTimeRef.current = null;
                    
                    // Auto-advance triggers after short delay so user sees "100%" locked
                    setTimeout(() => {
                      goToNextStep('auto');
                    }, 100);
                  }
                }
              } else {
                stabilityProgress = 0;
              }
            }
          } else {
            // Reset stability tracker if pitch slips out of tolerance
            stableStartTimeRef.current = null;
          }
        } else {
          // Reset stability tracker if pitch detection drops out
          stableStartTimeRef.current = null;
        }

        // Throttle React state updates to 10Hz (100ms) for numerical readouts
        if (timestamp - lastStateUpdateTimeRef.current >= 100) {
          lastStateUpdateTimeRef.current = timestamp;
          setTunerData({
            frequency: pitchResult.frequency,
            rms: pitchResult.rms,
            deltaHz,
            deltaCents,
            isStable,
            stabilityProgress,
          });
        }

        // Keep loop running
        animationFrameIdRef.current = requestAnimationFrame(processLoop);
      };

      animationFrameIdRef.current = requestAnimationFrame(processLoop);
      return true;
    } catch (err) {
      console.error('Failed to access audio device:', err);
      setAudioSupported(false);
      setAudioActive(false);
      return false;
    }
  };

  const stopAudio = useCallback(() => {
    if (animationFrameIdRef.current !== null) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close().catch((err) => console.error('Error closing AudioContext:', err));
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    monitorGainRef.current = null;
    setAnalyserNode(null); // Safe state update
    setAudioActive(false);
    latestFrequencyRef.current = -1; // Reset ref on stop
    
    // Reset tuner displays
    setTunerData({
      frequency: -1,
      rms: 0,
      deltaHz: 0,
      deltaCents: 0,
      isStable: false,
      stabilityProgress: 0,
    });
  }, []);

  // Stop audio loop on unmount
  useEffect(() => {
    return () => {
      if (animationFrameIdRef.current !== null) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, []);

  return (
    <CalibrationContext.Provider
      value={{
        activeStepIndex,
        setActiveStepIndex,
        goToNextStep,
        goToPrevStep,
        steps: CALIBRATION_STEPS,
        toleranceCents,
        setToleranceCents,
        autoAdvanceSecs,
        setAutoAdvanceSecs,
        midiSupported,
        midiOutputs,
        selectedMidiId,
        setSelectedMidiId,
        midiActive,
        setMidiActive,
        triggerMidiPanic,
        audioSupported,
        audioActive,
        startAudio,
        stopAudio,
        analyserNode, // Read state directly during render
        tunerData,
        monitorActive,
        setMonitorActive,
        historyLog,
        clearHistory,
        addHistoryEntry,
        activeTourStep,
        setActiveTourStep,
      }}
    >
      {children}
    </CalibrationContext.Provider>
  );
};

export const useCalibration = () => {
  const context = useContext(CalibrationContext);
  if (!context) {
    throw new Error('useCalibration must be used within a CalibrationProvider');
  }
  return context;
};
