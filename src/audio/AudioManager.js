import { storage } from '../storage/StorageManager.js';

class AudioManager {
  constructor() {
    this.ctx = null;
    this.sfxGain = null;
    this.bgmGain = null;
    this.masterGain = null;
    this.bgmInterval = null;
    this.isBgmPlaying = false;

    const saved = storage.getAudioSettings();
    this.isMuted = saved.sfxMuted && saved.bgmMuted;
    this.sfxVolume = saved.sfxVol ?? 0.7;
    this.bgmVolume = saved.bgmVol ?? 0.35;

    // Temporary mute flag when ads are shown
    this.isAdMuted = false;

    this.initAudioContext();
  }

  initAudioContext() {
    if (typeof window === 'undefined') return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) {
      console.warn('Web Audio API not supported in this browser.');
      return;
    }

    const unlock = () => {
      if (!this.ctx) {
        this.ctx = new AudioCtx();
        this.setupGains();
        if (!this.isBgmPlaying && !this.isMuted) {
          this.startBGM();
        }
      } else if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };

    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
  }

  setupGains() {
    if (!this.ctx) return;
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.isMuted || this.isAdMuted ? 0 : 1, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
    this.sfxGain.connect(this.masterGain);

    this.bgmGain = this.ctx.createGain();
    this.bgmGain.gain.setValueAtTime(this.bgmVolume, this.ctx.currentTime);
    this.bgmGain.connect(this.masterGain);
  }

  resumeContext() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted || this.isAdMuted ? 0 : 1, this.ctx.currentTime, 0.05);
    }
    storage.setAudioSettings({
      sfxMuted: this.isMuted,
      bgmMuted: this.isMuted,
      sfxVol: this.sfxVolume,
      bgmVol: this.bgmVolume
    });
    if (!this.isMuted && !this.isBgmPlaying) {
      this.startBGM();
    }
    return this.isMuted;
  }

  setAdMute(mute) {
    this.isAdMuted = mute;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted || this.isAdMuted ? 0 : 1, this.ctx.currentTime, 0.05);
    }
  }

  // SFX: Standard Bullet shot
  playShoot() {
    if (!this.ctx || this.isMuted || this.isAdMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.1);
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.1);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.1);
  }

  // SFX: Laser Beam
  playLaser() {
    if (!this.ctx || this.isMuted || this.isAdMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(950, t);
    osc.frequency.exponentialRampToValueAtTime(220, t + 0.15);
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.15);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  // SFX: Missile Launch
  playMissileLaunch() {
    if (!this.ctx || this.isMuted || this.isAdMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(700, t + 0.18);
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.18);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.18);
  }

  // SFX: Explosion (Bomb / Enemy Death)
  playExplosion(intensity = 1) {
    if (!this.ctx || this.isMuted || this.isAdMuted) return;
    const duration = 0.35 * intensity;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450 * intensity, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4 * intensity, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    noise.start();
  }

  // SFX: Realistic Lightning Thunder Strike ("XẸT... ĐOÀNG!")
  playShock() {
    if (!this.ctx || this.isMuted || this.isAdMuted) return;
    const t = this.ctx.currentTime;

    // Phase 1: "XẸT" - High-voltage electric crackle / spark sizzle
    const crackleDur = 0.12;
    const crackleSize = Math.floor(this.ctx.sampleRate * crackleDur);
    const crackleBuf = this.ctx.createBuffer(1, crackleSize, this.ctx.sampleRate);
    const crackleData = crackleBuf.getChannelData(0);
    for (let i = 0; i < crackleSize; i++) {
      crackleData[i] = Math.random() < 0.28 ? (Math.random() * 2 - 1) * 2.2 : (Math.random() * 0.4 - 0.2);
    }
    const crackleSource = this.ctx.createBufferSource();
    crackleSource.buffer = crackleBuf;

    const crackleFilter = this.ctx.createBiquadFilter();
    crackleFilter.type = 'highpass';
    crackleFilter.frequency.setValueAtTime(1900, t);

    const crackleGain = this.ctx.createGain();
    crackleGain.gain.setValueAtTime(0.55, t);
    crackleGain.gain.exponentialRampToValueAtTime(0.01, t + crackleDur);

    crackleSource.connect(crackleFilter);
    crackleFilter.connect(crackleGain);
    crackleGain.connect(this.sfxGain);
    crackleSource.start(t);

    // Phase 2: "ĐOÀNG!" - Devastating thunderclap explosion + sub-bass rumble
    const thunderDur = 0.52;
    const thunderSize = Math.floor(this.ctx.sampleRate * thunderDur);
    const thunderBuf = this.ctx.createBuffer(1, thunderSize, this.ctx.sampleRate);
    const thunderData = thunderBuf.getChannelData(0);
    for (let i = 0; i < thunderSize; i++) {
      thunderData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (thunderSize * 0.32));
    }
    const thunderSource = this.ctx.createBufferSource();
    thunderSource.buffer = thunderBuf;

    const thunderFilter = this.ctx.createBiquadFilter();
    thunderFilter.type = 'lowpass';
    thunderFilter.frequency.setValueAtTime(600, t + 0.02);
    thunderFilter.frequency.exponentialRampToValueAtTime(45, t + thunderDur);

    const subOsc = this.ctx.createOscillator();
    subOsc.type = 'triangle';
    subOsc.frequency.setValueAtTime(160, t + 0.02);
    subOsc.frequency.exponentialRampToValueAtTime(32, t + 0.36);

    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(0, t);
    subGain.gain.setValueAtTime(0.65, t + 0.02);
    subGain.gain.exponentialRampToValueAtTime(0.01, t + 0.36);

    const thunderGain = this.ctx.createGain();
    thunderGain.gain.setValueAtTime(0, t);
    thunderGain.gain.setValueAtTime(0.7, t + 0.02);
    thunderGain.gain.exponentialRampToValueAtTime(0.01, t + thunderDur);

    thunderSource.connect(thunderFilter);
    thunderFilter.connect(thunderGain);
    thunderGain.connect(this.sfxGain);

    subOsc.connect(subGain);
    subGain.connect(this.sfxGain);

    thunderSource.start(t + 0.02);
    subOsc.start(t + 0.02);
    subOsc.stop(t + 0.38);
  }

  // SFX: Gem Collect Chime (Enhanced for Green Mega Gems)
  playGemCollect(isGreen = false) {
    if (!this.ctx || this.isMuted || this.isAdMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = isGreen ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(isGreen ? 880 : 660, t);
    osc.frequency.exponentialRampToValueAtTime(isGreen ? 1760 : 990, t + (isGreen ? 0.16 : 0.08));
    gain.gain.setValueAtTime(isGreen ? 0.35 : 0.15, t);
    gain.gain.linearRampToValueAtTime(0.01, t + (isGreen ? 0.18 : 0.08));
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + (isGreen ? 0.18 : 0.08));
  }

  // SFX: Flame burst
  playFlame() {
    if (!this.ctx || this.isMuted || this.isAdMuted) return;
    const duration = 0.12;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    noise.start();
  }

  // SFX: Shield Deflection / Hit (Throttled to avoid deafening audio build-up)
  playShieldHit() {
    if (!this.ctx || this.isMuted || this.isAdMuted) return;
    const t = this.ctx.currentTime;
    if (this.lastShieldHitTime && t - this.lastShieldHitTime < 0.20) return;
    this.lastShieldHitTime = t;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.10);
    gain.gain.setValueAtTime(0.18, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.10);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.10);
  }

  // SFX: Level Up Chime
  playLevelUp() {
    if (!this.ctx || this.isMuted || this.isAdMuted) return;
    const notes = [440, 554.37, 659.25, 880]; // A major arpeggio
    notes.forEach((freq, idx) => {
      const t = this.ctx.currentTime + idx * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.linearRampToValueAtTime(0.01, t + 0.25);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.25);
    });
  }

  // SFX: Button Click
  playClick() {
    if (!this.ctx || this.isMuted || this.isAdMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, t);
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.05);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.05);
  }

  // Ambient Cyberpunk Space Synthesizer BGM Loop
  startBGM() {
    if (!this.ctx || this.isBgmPlaying) return;
    this.isBgmPlaying = true;
    let step = 0;
    const bassline = [110, 110, 130.81, 110, 98, 110, 123.47, 98]; // A2, C3, G2 progression
    const melody = [440, 0, 523.25, 659.25, 0, 587.33, 440, 0];

    const playStep = () => {
      if (!this.isBgmPlaying || !this.ctx || this.ctx.state !== 'running') return;
      const t = this.ctx.currentTime;

      // Bass note
      const bassFreq = bassline[step % bassline.length];
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      bassOsc.type = 'sawtooth';
      bassOsc.frequency.setValueAtTime(bassFreq, t);
      bassGain.gain.setValueAtTime(0.12, t);
      bassGain.gain.exponentialRampToValueAtTime(0.005, t + 0.22);
      bassOsc.connect(bassGain);
      bassGain.connect(this.bgmGain);
      bassOsc.start(t);
      bassOsc.stop(t + 0.25);

      // Lead note
      const leadFreq = melody[step % melody.length];
      if (leadFreq > 0) {
        const leadOsc = this.ctx.createOscillator();
        const leadGain = this.ctx.createGain();
        leadOsc.type = 'sine';
        leadOsc.frequency.setValueAtTime(leadFreq, t);
        leadGain.gain.setValueAtTime(0.06, t);
        leadGain.gain.exponentialRampToValueAtTime(0.005, t + 0.35);
        leadOsc.connect(leadGain);
        leadGain.connect(this.bgmGain);
        leadOsc.start(t);
        leadOsc.stop(t + 0.38);
      }

      step++;
    };

    this.bgmInterval = setInterval(playStep, 260); // ~115 BPM 8th notes
  }

  stopBGM() {
    this.isBgmPlaying = false;
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }
}

export const audio = new AudioManager();
