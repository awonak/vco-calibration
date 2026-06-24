// Calibration octave target definitions
export interface CalibrationStep {
  noteNumber: number; // MIDI note number
  noteName: string;   // e.g. "C1"
  targetHz: number;   // Expected fundamental frequency
}

export const CALIBRATION_STEPS: CalibrationStep[] = [
  { noteNumber: 24, noteName: 'C1', targetHz: 32.7032 },
  { noteNumber: 36, noteName: 'C2', targetHz: 65.4064 },
  { noteNumber: 48, noteName: 'C3', targetHz: 130.8128 },
  { noteNumber: 60, noteName: 'C4', targetHz: 261.6256 },
  { noteNumber: 72, noteName: 'C5', targetHz: 523.2511 },
];

export interface HistoryEntry {
  id: string;
  timestamp: number;
  stepIndex: number;
  noteName: string;
  targetHz: number;
  measuredHz: number;
  deltaHz: number;
  deltaCents: number;
  method: 'auto' | 'manual';
}

export interface TunerSnapshot {
  frequency: number;
  rms: number;
  deltaHz: number;
  deltaCents: number;
  isStable: boolean;
  stabilityProgress: number; // 0.0 to 1.0
}
