// Web Audio synthesizer for TRACE & DGAOS communications
// Synthesizes authentic US Agency phone rings, DTMF tones, and cardiac beeps with zero external asset dependencies.

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    void audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Standard DTMF frequencies (Hz) for telephone keypads
 */
const DTMF_FREQS: Record<string, [number, number]> = {
  '1': [697, 1209],
  '2': [697, 1336],
  '3': [697, 1477],
  '4': [770, 1209],
  '5': [770, 1336],
  '6': [770, 1477],
  '7': [852, 1209],
  '8': [852, 1336],
  '9': [852, 1477],
  '*': [941, 1209],
  '0': [941, 1336],
  '#': [941, 1477],
};

/**
 * Play an authentic dual-tone multi-frequency (DTMF) telephone keypad beep
 */
export function playDtmfTone(key: string, durationMs: number = 140): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const freqs = DTMF_FREQS[key] || [770, 1336];
    const now = ctx.currentTime;
    const dur = durationMs / 1000;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freqs[0], now);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freqs[1], now);

    gainNode.gain.setValueAtTime(0.08, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + dur);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + dur);
    osc2.stop(now + dur);
  } catch {
    // Graceful fallback if user hasn't interacted with audio yet
  }
}

/**
 * Synthesizes an authentic government/agency telephone ring pattern:
 * Dual frequency (440Hz + 480Hz) pulsed for 1.8 seconds on, followed by silence
 */
export function playPhoneRingTone(): () => void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return () => {};

    let isPlaying = true;
    let timerId: ReturnType<typeof setTimeout> | null = null;

    const ringPulse = () => {
      if (!isPlaying || !ctx) return;
      const now = ctx.currentTime;
      const ringDuration = 1.6;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(440, now);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(480, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.05);
      gain.gain.setValueAtTime(0.12, now + ringDuration - 0.08);
      gain.gain.linearRampToValueAtTime(0.001, now + ringDuration);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + ringDuration);
      osc2.stop(now + ringDuration);

      timerId = setTimeout(() => {
        if (isPlaying) {
          ringPulse();
        }
      }, 3500);
    };

    ringPulse();

    return () => {
      isPlaying = false;
      if (timerId) clearTimeout(timerId);
    };
  } catch {
    return () => {};
  }
}

/**
 * Synthesizes cardiac telemetry beep (ECG QRS complex chirp)
 */
export function playCardiacBeep(isAlarm: boolean = false): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = isAlarm ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(isAlarm ? 880 : 540, now);
    if (!isAlarm) {
      osc.frequency.exponentialRampToValueAtTime(620, now + 0.04);
    }

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (isAlarm ? 0.15 : 0.08));

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + (isAlarm ? 0.15 : 0.08));
  } catch {
    // Ignore audio errors
  }
}

/**
 * Radio squelch / transmission chirp
 */
export function playRadioChirp(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.setValueAtTime(1800, now + 0.02);
    osc.frequency.setValueAtTime(2400, now + 0.04);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  } catch {
    // Ignore
  }
}
