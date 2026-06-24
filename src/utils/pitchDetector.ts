/**
 * High-precision Autocorrelation pitch detector with parabolic peak interpolation.
 * Optimized for low frequencies (C1, ~32.7 Hz) through C5 (~523.25 Hz).
 */

export interface PitchResult {
  frequency: number;
  rms: number;
}

export function detectPitch(
  buffer: Float32Array,
  sampleRate: number,
  minFreq: number = 25,
  maxFreq: number = 600
): PitchResult {
  const bufferSize = buffer.length;

  // 1. Calculate Root-Mean-Square (RMS) to check signal level
  let rms = 0;
  for (let i = 0; i < bufferSize; i++) {
    const val = buffer[i];
    rms += val * val;
  }
  rms = Math.sqrt(rms / bufferSize);

  // Noise gate threshold: if signal is too quiet, do not calculate pitch
  if (rms < 0.006) {
    return { frequency: -1, rms };
  }

  // 2. Determine Search Range (Lags)
  // Lag = sampleRate / frequency
  const maxLag = Math.min(bufferSize - 2, Math.ceil(sampleRate / minFreq));
  const minLag = Math.max(2, Math.floor(sampleRate / maxFreq));

  // 3. Compute Autocorrelation
  const r = new Float32Array(maxLag + 1);
  for (let lag = minLag; lag <= maxLag; lag++) {
    let sum = 0;
    const limit = bufferSize - lag;
    for (let i = 0; i < limit; i++) {
      sum += buffer[i] * buffer[i + lag];
    }
    r[lag] = sum;
  }

  // 4. Find the first local minimum to avoid the zero-lag peak
  let localMinLag = minLag;
  for (let lag = minLag + 1; lag < maxLag; lag++) {
    if (r[lag] > r[lag - 1]) {
      localMinLag = lag - 1;
      break;
    }
  }

  // If we couldn't find a local minimum, fall back to search from minLag
  if (localMinLag === minLag) {
    localMinLag = minLag;
  }

  // 5. Find the maximum correlation peak after the local minimum
  let maxVal = -Infinity;
  let peakLag = -1;

  for (let lag = localMinLag; lag <= maxLag; lag++) {
    if (r[lag] > maxVal) {
      maxVal = r[lag];
      peakLag = lag;
    }
  }

  // 6. Refine peak using Parabolic Interpolation
  if (peakLag > minLag && peakLag < maxLag) {
    const alpha = r[peakLag - 1];
    const beta = r[peakLag];
    const gamma = r[peakLag + 1];

    // Compute denominator
    const denom = alpha - 2 * beta + gamma;
    if (Math.abs(denom) > 1e-5) {
      const p = 0.5 * (alpha - gamma) / denom;
      const preciseLag = peakLag + p;
      const frequency = sampleRate / preciseLag;
      
      // Secondary sanity check: check if frequency is in bounds
      if (frequency >= minFreq && frequency <= maxFreq) {
        return { frequency, rms };
      }
    }
  }

  // Fallback to integer lag frequency if interpolation fails
  if (peakLag !== -1) {
    const frequency = sampleRate / peakLag;
    if (frequency >= minFreq && frequency <= maxFreq) {
      return { frequency, rms };
    }
  }

  return { frequency: -1, rms };
}

/**
 * Converts frequency to cents offset relative to a target frequency.
 */
export function frequencyToCents(detected: number, target: number): number {
  if (detected <= 0 || target <= 0) return 0;
  return 1200 * Math.log2(detected / target);
}
