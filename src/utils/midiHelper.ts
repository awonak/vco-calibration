/**
 * MIDI helper utilities using the Web MIDI API.
 * Safely handles device discovery, message transmission, and panic states.
 */

// Define Web MIDI types locally in case standard typings are missing
export interface WebMIDIPort {
  id: string;
  name?: string;
  manufacturer?: string;
  state: 'connected' | 'disconnected';
  type: 'input' | 'output';
}

export interface WebMIDIOutput extends WebMIDIPort {
  send(data: number[] | Uint8Array, timestamp?: number): void;
}

export interface WebMIDIAccess {
  outputs: Map<string, WebMIDIOutput>;
  onstatechange?: (event: Event) => void;
}

/**
 * Checks if the browser supports Web MIDI and requests access.
 */
export async function requestMIDIAccessSafe(): Promise<WebMIDIAccess | null> {
  if (typeof navigator === 'undefined' || !navigator.requestMIDIAccess) {
    console.warn('Web MIDI API is not supported in this browser.');
    return null;
  }
  try {
    const access = await navigator.requestMIDIAccess();
    return access as unknown as WebMIDIAccess;
  } catch (err) {
    console.error('Failed to get MIDI access:', err);
    return null;
  }
}

/**
 * Sends a MIDI Note On message.
 * Format: [0x90 + channel, noteNumber, velocity]
 */
export function sendNoteOn(output: WebMIDIOutput | null, note: number, velocity: number = 100, channel: number = 0): void {
  if (!output) return;
  const status = 0x90 + (channel & 0x0F);
  try {
    output.send([status, note & 0x7F, velocity & 0x7F]);
  } catch (err) {
    console.error('Failed to send MIDI Note On:', err);
  }
}

/**
 * Sends a MIDI Note Off message.
 * Format: [0x80 + channel, noteNumber, velocity]
 */
export function sendNoteOff(output: WebMIDIOutput | null, note: number, channel: number = 0): void {
  if (!output) return;
  const status = 0x80 + (channel & 0x0F);
  try {
    output.send([status, note & 0x7F, 0]);
  } catch (err) {
    console.error('Failed to send MIDI Note Off:', err);
  }
}

/**
 * Sends MIDI Panic (All Notes Off & All Sound Off) messages to silence hung notes.
 * CC 123: All Notes Off, CC 120: All Sound Off
 */
export function sendPanic(output: WebMIDIOutput | null, channel: number = 0): void {
  if (!output) return;
  const status = 0xB0 + (channel & 0x0F);
  try {
    // CC 123 (All Notes Off)
    output.send([status, 123, 0]);
    // CC 120 (All Sound Off)
    output.send([status, 120, 0]);
  } catch (err) {
    console.error('Failed to send MIDI Panic:', err);
  }
}
