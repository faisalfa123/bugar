/**
 * Web Audio API Sound Synthesizer
 * Generates clear, high-quality audio beeps and interval whistles directly in the browser
 * with 0 KB audio files required!
 */

class AudioSynth {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  playTone(freq: number, durationSec: number, type: OscillatorType = 'sine', gainVal: number = 0.15) {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationSec);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + durationSec);
    } catch (e) {
      console.warn('Audio playback not permitted yet:', e);
    }
  }

  /** Short countdown tick (3, 2, 1) */
  playCountdownTick() {
    this.playTone(880, 0.08, 'sine', 0.2); // A5 note
  }

  /** Bright horn/whistle tone when WORK begins */
  playWorkWhistle() {
    const ctx = this.getContext();
    if (!ctx) return;
    this.playTone(1046.5, 0.12, 'triangle', 0.25); // C6
    setTimeout(() => {
      this.playTone(1318.5, 0.25, 'triangle', 0.3); // E6
    }, 100);
  }

  /** Gentle rest chime when REST period starts */
  playRestChime() {
    this.playTone(587.33, 0.15, 'sine', 0.2); // D5
    setTimeout(() => {
      this.playTone(440, 0.3, 'sine', 0.2); // A4
    }, 120);
  }

  /** Victory chime when program completes */
  playVictoryFanfare() {
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 - E5 - G5 - C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 0.35, 'triangle', 0.25);
      }, idx * 140);
    });
  }

  /** Rest timer completion chime for gym workout */
  playRestFinished() {
    this.playTone(880, 0.15, 'sine', 0.25);
    setTimeout(() => this.playTone(1174.66, 0.3, 'sine', 0.3), 150);
  }
}

export const audioSynth = new AudioSynth();
