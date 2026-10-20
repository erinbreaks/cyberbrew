/**
 * ==========================================================================
 * CYBERBREW — WEB AUDIO API ENGINE
 * Authentic Procedural Ambient Synthesis • Zero External Dependencies
 * ==========================================================================
 */

class CyberbrewAudioEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.isMuted = false;
    this.masterVolume = 0.75;

    // Track state: volume (0-1), gainNode, active state
    this.channels = {
      rain: { volume: 0.65, gain: null, node: null, timer: null },
      espresso: { volume: 0.35, gain: null, node: null, timer: null },
      chatter: { volume: 0.25, gain: null, node: null, timer: null },
      vinyl: { volume: 0.40, gain: null, node: null, timer: null },
      music: { volume: 0.50, gain: null, node: null, timer: null },
      fireplace: { volume: 0.00, gain: null, node: null, timer: null },
      traffic: { volume: 0.15, gain: null, node: null, timer: null },
      wind: { volume: 0.20, gain: null, node: null, timer: null }
    };

    this.masterGain = null;
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();

    // Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // Initialize individual channel gain nodes
    Object.keys(this.channels).forEach(channelName => {
      const ch = this.channels[channelName];
      ch.gain = this.ctx.createGain();
      ch.gain.gain.setValueAtTime(ch.volume, this.ctx.currentTime);
      ch.gain.connect(this.masterGain);
    });
  }

  async resume() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  start() {
    if (this.isPlaying) return;
    this.resume();
    this.isPlaying = true;

    // Start all generators
    this.startRain();
    this.startEspresso();
    this.startChatter();
    this.startVinyl();
    this.startMusic();
    this.startFireplace();
    this.startTraffic();
    this.startWind();

    // Fade in master volume smoothly
    if (this.masterGain) {
      const target = this.isMuted ? 0 : this.masterVolume;
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.masterGain.gain.exponentialRampToValueAtTime(target, this.ctx.currentTime + 1.2);
    }
  }

  stop() {
    if (!this.isPlaying) return;
    this.isPlaying = false;

    if (this.masterGain && this.ctx) {
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);
      setTimeout(() => {
        this.cleanupNodes();
      }, 850);
    }
  }

  cleanupNodes() {
    Object.keys(this.channels).forEach(name => {
      const ch = this.channels[name];
      if (ch.timer) {
        clearInterval(ch.timer);
        ch.timer = null;
      }
      if (ch.node) {
        try { ch.node.stop(); ch.node.disconnect(); } catch (e) {}
        ch.node = null;
      }
    });
  }

  setMasterVolume(val) {
    this.masterVolume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(this.masterVolume, this.ctx.currentTime + 0.05);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      const target = this.isMuted ? 0 : this.masterVolume;
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(target, this.ctx.currentTime + 0.08);
    }
    return this.isMuted;
  }

  setChannelVolume(name, val) {
    const ch = this.channels[name];
    if (!ch) return;
    ch.volume = Math.max(0, Math.min(1, val));
    if (ch.gain && this.ctx) {
      ch.gain.gain.cancelScheduledValues(this.ctx.currentTime);
      ch.gain.gain.linearRampToValueAtTime(ch.volume, this.ctx.currentTime + 0.05);
    }
  }

  /* ------------------------------------------------------------------------
     1. RAIN SYNTHESIS: Pink noise + random glass droplet impulses
     ------------------------------------------------------------------------ */
  startRain() {
    const ch = this.channels.rain;
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1100;

    whiteNoise.connect(filter);
    filter.connect(ch.gain);
    whiteNoise.start();
    ch.node = whiteNoise;

    // Random window tap droplets
    ch.timer = setInterval(() => {
      if (!this.isPlaying || ch.volume < 0.05) return;
      const osc = this.ctx.createOscillator();
      const dropGain = this.ctx.createGain();
      osc.type = 'sine';
      const freq = 1200 + Math.random() * 1600;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.4, this.ctx.currentTime + 0.06);

      dropGain.gain.setValueAtTime(0.04 * ch.volume, this.ctx.currentTime);
      dropGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.06);

      osc.connect(dropGain);
      dropGain.connect(ch.gain);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.07);
    }, 450);
  }

  /* ------------------------------------------------------------------------
     2. ESPRESSO & CUPS: Periodic steam sweeps + ceramic clinks
     ------------------------------------------------------------------------ */
  startEspresso() {
    const ch = this.channels.espresso;

    // Occasional steam wand & cup clinking
    ch.timer = setInterval(() => {
      if (!this.isPlaying || ch.volume < 0.05) return;
      if (Math.random() > 0.45) {
        // Cup clink
        const osc = this.ctx.createOscillator();
        const clinkGain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(2400 + Math.random() * 800, this.ctx.currentTime);
        clinkGain.gain.setValueAtTime(0.08 * ch.volume, this.ctx.currentTime);
        clinkGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.25);

        osc.connect(clinkGain);
        clinkGain.connect(ch.gain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.26);
      } else {
        // Steam wand hiss
        const bufferSize = this.ctx.sampleRate * 1.5;
        const noise = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = noise.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.08;

        const source = this.ctx.createBufferSource();
        source.buffer = noise;
        const bq = this.ctx.createBiquadFilter();
        bq.type = 'bandpass';
        bq.frequency.setValueAtTime(1800, this.ctx.currentTime);
        bq.Q.value = 3.0;

        const sGain = this.ctx.createGain();
        sGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
        sGain.gain.linearRampToValueAtTime(0.12 * ch.volume, this.ctx.currentTime + 0.4);
        sGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.4);

        source.connect(bq);
        bq.connect(sGain);
        sGain.connect(ch.gain);
        source.start();
        source.stop(this.ctx.currentTime + 1.5);
      }
    }, 3800);
  }

  /* ------------------------------------------------------------------------
     3. CAFE CHATTER: Resonant formant noise
     ------------------------------------------------------------------------ */
  startChatter() {
    const ch = this.channels.chatter;
    const bufferSize = this.ctx.sampleRate * 3;
    const buf = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.05;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buf;
    source.loop = true;

    const formant1 = this.ctx.createBiquadFilter();
    formant1.type = 'bandpass';
    formant1.frequency.value = 650;
    formant1.Q.value = 4.0;

    const formant2 = this.ctx.createBiquadFilter();
    formant2.type = 'bandpass';
    formant2.frequency.value = 1400;
    formant2.Q.value = 3.0;

    source.connect(formant1);
    source.connect(formant2);
    formant1.connect(ch.gain);
    formant2.connect(ch.gain);
    source.start();
    ch.node = source;
  }

  /* ------------------------------------------------------------------------
     4. VINYL CRACKLE: Needle friction + dust pops
     ------------------------------------------------------------------------ */
  startVinyl() {
    const ch = this.channels.vinyl;
    const bufferSize = this.ctx.sampleRate * 2;
    const buf = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buf.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      let sample = (Math.random() * 2 - 1) * 0.015;
      if (Math.random() < 0.0008) {
        sample += (Math.random() * 2 - 1) * 0.35; // crackle pop
      }
      data[i] = sample;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buf;
    source.loop = true;

    const hp = this.ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 1800;

    source.connect(hp);
    hp.connect(ch.gain);
    source.start();
    ch.node = source;
  }

  /* ------------------------------------------------------------------------
     5. SOFT LO-FI / PIANO: Generative ambient Rhodes chord progression
     ------------------------------------------------------------------------ */
  startMusic() {
    const ch = this.channels.music;
    // Chords: Ebmaj9, Cm9, Abmaj7, Bb7
    const chords = [
      [155.56, 196.00, 233.08, 293.66, 349.23], // Ebmaj9
      [130.81, 155.56, 196.00, 233.08, 293.66], // Cm9
      [103.83, 155.56, 207.65, 261.63, 311.13], // Abmaj7
      [116.54, 174.61, 233.08, 293.66, 349.23], // Bb9
    ];

    let chordIndex = 0;

    const playNextChord = () => {
      if (!this.isPlaying) return;
      if (ch.volume > 0.02) {
        const chord = chords[chordIndex];
        chordIndex = (chordIndex + 1) % chords.length;

        chord.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

          // Soft bell attack & lingering slow decay
          const startTime = this.ctx.currentTime + (idx * 0.08);
          gain.gain.setValueAtTime(0.0001, startTime);
          gain.gain.linearRampToValueAtTime(0.06 * ch.volume, startTime + 0.15);
          gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 4.8);

          osc.connect(gain);
          gain.connect(ch.gain);
          osc.start(startTime);
          osc.stop(startTime + 5.0);
        });
      }
    };

    playNextChord();
    ch.timer = setInterval(playNextChord, 5200);
  }

  /* ------------------------------------------------------------------------
     6. FIREPLACE HEARTH: Low rumble & ember crackles
     ------------------------------------------------------------------------ */
  startFireplace() {
    const ch = this.channels.fireplace;
    const bufferSize = this.ctx.sampleRate * 2;
    const buf = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buf.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      let sample = (Math.random() * 2 - 1) * 0.02;
      if (Math.random() < 0.0012) {
        sample += (Math.random() * 2 - 1) * 0.4; // crackle
      }
      data[i] = sample;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buf;
    source.loop = true;

    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 650;

    source.connect(lp);
    lp.connect(ch.gain);
    source.start();
    ch.node = source;
  }

  /* ------------------------------------------------------------------------
     7. DISTANT TRAFFIC: Subdued low-pass street hum
     ------------------------------------------------------------------------ */
  startTraffic() {
    const ch = this.channels.traffic;
    const bufferSize = this.ctx.sampleRate * 3;
    const buf = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.06;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buf;
    source.loop = true;

    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 160;

    source.connect(lp);
    lp.connect(ch.gain);
    source.start();
    ch.node = source;
  }

  /* ------------------------------------------------------------------------
     8. NIGHT WIND: Resonant bandpass filter modulated by slow LFO
     ------------------------------------------------------------------------ */
  startWind() {
    const ch = this.channels.wind;
    const bufferSize = this.ctx.sampleRate * 3;
    const buf = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.04;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buf;
    source.loop = true;

    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 320;
    bp.Q.value = 2.5;

    source.connect(bp);
    bp.connect(ch.gain);
    source.start();
    ch.node = source;
  }

  /* ------------------------------------------------------------------------
     9. GENTLE CHIME (For Timer & Cup Sips)
     ------------------------------------------------------------------------ */
  playChime() {
    this.resume();
    if (!this.ctx) return;
    const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      const start = this.ctx.currentTime + (idx * 0.12);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(0.12, start + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 2.4);

      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(start);
      osc.stop(start + 2.5);
    });
  }
}

// Global instance
window.cyberAudio = new CyberbrewAudioEngine();
