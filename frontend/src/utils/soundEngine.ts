/**
 * MIRAVERSE OSX - Synthetic Web Audio Sound Engine
 * Zero-asset procedural Web Audio synthesizer generating Y2K UI clicks,
 * window chimes, MAI voice pulses, and ambient synth pads.
 */

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

class SoundEngine {
  ctx: AudioContext | null = null;
  isMuted: boolean = false;
  masterGain: GainNode | null = null;
  ambientOsc: OscillatorNode | null = null;

  init(): void {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    } catch (e) {
      console.warn('Web Audio API not supported in this browser.');
    }
  }

  ensureContext(): boolean {
    try {
      if (!this.ctx) this.init();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return !!(this.ctx && this.masterGain);
    } catch (e) {
      return false;
    }
  }

  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      try {
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.15, this.ctx.currentTime);
      } catch (e) { /* ignore */ }
    }
    return this.isMuted;
  }

  // Helper to play WAV audio file from public/sounds/
  playAudioFile(filename: string, volume: number = 0.4): void {
    if (this.isMuted) return;
    try {
      const audio = new Audio(`/sounds/${filename}`);
      audio.volume = volume;
      audio.play().catch(() => { });
    } catch (e) {
      // Fallback silently if audio fails
    }
  }

  // --- Sound Effects ---

  // Subtle Y2K UI Click
  playClick(): void {
    if (this.isMuted) return;
    this.playAudioFile('mixkit-water-sci-fi-bleep-902.wav', 0.2);
    try {
      if (!this.ensureContext()) return;

      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const now = this.ctx!.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) { /* gracefully fail */ }
  }

  // Window Open Chime
  playWindowOpen(): void {
    if (this.isMuted) return;
    this.playAudioFile('mixkit-sci-fi-high-tech-sounds-860.wav', 0.3);
    try {
      if (!this.ensureContext()) return;

      const now = this.ctx!.currentTime;
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.04);

        gain.gain.setValueAtTime(0.15, now + i * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.18);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now + i * 0.04);
        osc.stop(now + i * 0.04 + 0.18);
      });
    } catch (e) { /* gracefully fail */ }
  }

  // Window Close Chime
  playWindowClose(): void {
    if (this.isMuted) return;
    this.playAudioFile('mixkit-glitch-sci-fi-rewind-transition-1093.wav', 0.2);
    try {
      if (!this.ensureContext()) return;

      const now = this.ctx!.currentTime;
      [659.25, 523.25].forEach((freq, i) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.04);

        gain.gain.setValueAtTime(0.15, now + i * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.15);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now + i * 0.04);
        osc.stop(now + i * 0.04 + 0.15);
      });
    } catch (e) { /* gracefully fail */ }
  }

  // MAI Agent Voice Pulse Chirp
  playMAIPulse(): void {
    if (this.isMuted) return;
    this.playAudioFile('mixkit-intro-text-glitch-2950.wav', 0.3);
    try {
      if (!this.ensureContext()) return;

      const now = this.ctx!.currentTime;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(1800, now + 0.06);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch (e) { /* gracefully fail */ }
  }

  // Success / Reward Notification Chime
  playSuccess(): void {
    if (this.isMuted) return;
    this.playAudioFile('mixkit-crystal-chime-3108.wav', 0.4);
    try {
      if (!this.ensureContext()) return;

      const now = this.ctx!.currentTime;
      [587.33, 880.00].forEach((freq, i) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.06);

        gain.gain.setValueAtTime(0.2, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.25);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.25);
      });
    } catch (e) { /* gracefully fail */ }
  }

  // Soft UI snap / focus switch
  playTick(): void {
    if (this.isMuted) return;
    try {
      if (!this.ensureContext()) return;

      const now = this.ctx!.currentTime;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(780, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.035);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(now);
      osc.stop(now + 0.035);
    } catch (e) { /* gracefully fail */ }
  }

  // UI chime alias for window-open / system alert cadence
  playChime(): void {
    this.playWindowOpen();
  }
}

export const soundEngine = new SoundEngine();

export const SoundFX = {
  playButtonTap: () => { try { soundEngine.playClick(); } catch (e) { /* safe */ } },
  playSnap: () => { try { soundEngine.playTick(); } catch (e) { /* safe */ } },
  playSuccess: () => { try { soundEngine.playSuccess(); } catch (e) { /* safe */ } },
  playChime: () => { try { soundEngine.playChime(); } catch (e) { /* safe */ } },
};

export default soundEngine;
