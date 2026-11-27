/**
 * Syllable Dojo - 音效與自然語音合成引擎
 * 支援自然拼讀開閉音節與母音位置校正發音 (Phonetic Speech Correction)
 */

class SoundEngine {
  constructor() {
    this.audioCtx = null;
    this.speechSynth = window.speechSynthesis || null;
    this.englishVoice = null;
    this.isMuted = false;
    this.activeUtterances = [];
    this.speechTimer = null;

    // 初始化語音
    if (this.speechSynth) {
      this.initVoices();
      if (this.speechSynth.onvoiceschanged !== undefined) {
        this.speechSynth.onvoiceschanged = () => this.initVoices();
      }
    }
  }

  get canSpeak() {
    return Boolean(this.speechSynth && window.SpeechSynthesisUtterance && !this.isMuted);
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (muted) this.cancelSpeech();
  }

  cancelSpeech() {
    clearTimeout(this.speechTimer);
    this.speechTimer = null;
    this.activeUtterances = [];
    if (this.speechSynth) this.speechSynth.cancel();
  }

  ensureContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  initVoices() {
    if (!this.speechSynth) return;
    const voices = this.speechSynth.getVoices();
    // 優先挑選自然美式/英式發音
    this.englishVoice = voices.find(v => v.lang === 'en-US' && /Natural|Samantha|Google|Jenny|Zira|David/.test(v.name))
      || voices.find(v => v.lang === 'en-US')
      || voices.find(v => v.lang.startsWith('en'))
      || null;
  }

  /**
   * 手刀揮砍音效 (Whoosh + Air Slice)
   */
  playChopWhoosh() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.audioCtx) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    const bufferSize = ctx.sampleRate * 0.15;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1600, now);
    filter.frequency.exponentialRampToValueAtTime(300, now + 0.15);
    filter.Q.setValueAtTime(3, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.4, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
  }

  /**
   * 木板斷裂清脆打擊聲 (Snap / Crack)
   */
  playWoodCrack() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.audioCtx) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);

    oscGain.gain.setValueAtTime(0.7, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);

    const bufferSize = ctx.sampleRate * 0.08;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1200;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.6, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(now);
  }

  /**
   * 成功星星鈴聲 (Sparkle Chime)
   */
  playSuccessChime() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.audioCtx) return;

    const ctx = this.audioCtx;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const startTime = ctx.currentTime + idx * 0.06;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.18, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.4);
    });
  }

  /**
   * 切錯反彈聲 (Cartoon Boing / Thud)
   */
  playFailBoing() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.audioCtx) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.linearRampToValueAtTime(90, now + 0.1);
    osc.frequency.linearRampToValueAtTime(120, now + 0.2);
    osc.frequency.linearRampToValueAtTime(70, now + 0.35);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.4);
  }

  /**
   * 晉級腰帶道場歡呼樂 (Belt Up Fanfare)
   */
  playFanfare() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.audioCtx) return;

    const ctx = this.audioCtx;
    const melody = [
      { f: 440.0, d: 0.12 },
      { f: 554.37, d: 0.12 },
      { f: 659.25, d: 0.14 },
      { f: 880.0, d: 0.35 }
    ];

    let t = ctx.currentTime;
    melody.forEach(note => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, t);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + note.d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + note.d + 0.05);

      t += note.d * 0.85;
    });
  }

  /**
   * 游標微音
   */
  playHoverTick() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.audioCtx) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.03);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  speakPhonicsSequence(syllables, fullWord, { onStep, onDone } = {}) {
    if (!this.canSpeak) return;

    this.cancelSpeech();
    const steps = syllables.length > 1
      ? syllables.map(syllable => this.makeUtterance(syllable, 0.85))
      : [];
    steps.push(this.makeUtterance(fullWord, 0.95));
    this.activeUtterances = steps;

    const finish = () => {
      if (this.activeUtterances !== steps) return;
      this.activeUtterances = [];
      onDone?.();
    };
    steps.forEach((utterance, index) => {
      utterance.onstart = () => {
        if (this.activeUtterances === steps) onStep?.(index);
      };
      utterance.onend = () => {
        if (this.activeUtterances !== steps) return;
        const next = steps[index + 1];
        if (!next) {
          finish();
          return;
        }
        this.speechTimer = setTimeout(() => {
          this.speechTimer = null;
          if (this.activeUtterances === steps) this.speechSynth.speak(next);
        }, 350);
      };
      utterance.onerror = finish;
    });

    if (this.speechSynth.paused) this.speechSynth.resume();
    this.speechSynth.speak(steps[0]);
  }

  /**
   * 點擊個別音節木牌時重播該音節
   */
  speakSingleSyllable(spokenText) {
    this.speakWord(spokenText, 0.85);
  }

  speakWord(text, rate = 0.9) {
    if (!this.canSpeak) return;
    this.cancelSpeech();
    const utterance = this.makeUtterance(text, rate);
    this.activeUtterances = [utterance];
    const finish = () => {
      if (this.activeUtterances[0] === utterance) this.activeUtterances = [];
    };
    utterance.onend = finish;
    utterance.onerror = finish;
    if (this.speechSynth.paused) this.speechSynth.resume();
    this.speechSynth.speak(utterance);
  }

  makeUtterance(text, rate) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.lang = 'en-US';
    if (this.englishVoice) utterance.voice = this.englishVoice;
    return utterance;
  }
}

window.soundEngine = new SoundEngine();
