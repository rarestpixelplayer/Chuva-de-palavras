/**
 * Gerador de efeitos sonoros procedural remasterizado usando Web Audio API.
 * Sem dependências de arquivos externos: 100% confiável, com zero latência e mixagem dinâmica.
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private muted: boolean = false;
  private volume: number = 0.8;
  private musicVolume: number = 0.4;
  private currentTrack: 'menu' | 'classic' | 'time_attack' | 'blindness' | 'bonus' | 'duel' | null = null;
  private bgmIntervalId: any = null;
  private nextNoteTime: number = 0;
  private currentStep: number = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      const savedMute = localStorage.getItem('chuva_palavras_mute');
      this.muted = savedMute === 'true';
      const savedVol = localStorage.getItem('chuva_palavras_volume');
      if (savedVol) {
        this.volume = Math.max(0, Math.min(1, parseFloat(savedVol)));
      }
      const savedMusicVol = localStorage.getItem('chuva_palavras_music_volume');
      if (savedMusicVol !== null) {
        this.musicVolume = Math.max(0, Math.min(1, parseFloat(savedMusicVol)));
      }
    }
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        // Ganho dedicado à trilha de fundo 8-bit
        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
        this.musicGain.connect(this.masterGain);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private getDestination(): AudioNode | null {
    this.initCtx();
    if (!this.ctx) return null;
    if (this.masterGain) return this.masterGain;
    return this.ctx.destination;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('chuva_palavras_mute', String(this.muted));
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime, 0.02);
    }
    return this.muted;
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('chuva_palavras_mute', String(this.muted));
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime, 0.02);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    if (typeof window !== 'undefined') {
      localStorage.setItem('chuva_palavras_volume', String(this.volume));
    }
    if (this.masterGain && this.ctx && !this.muted) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.02);
    }
  }

  public getMusicVolume(): number {
    return this.musicVolume;
  }

  public setMusicVolume(vol: number): void {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    if (typeof window !== 'undefined') {
      localStorage.setItem('chuva_palavras_music_volume', String(this.musicVolume));
    }
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setTargetAtTime(this.musicVolume, this.ctx.currentTime, 0.03);
    }
  }

  // ==========================================
  // SISTEMA DE MÚSICA DE FUNDO CHIPTUNE 8-BIT
  // ==========================================
  public playBGM(track: 'menu' | 'classic' | 'time_attack' | 'blindness' | 'bonus' | 'duel'): void {
    if (this.currentTrack === track && this.bgmIntervalId) return;
    this.stopBGM();
    this.initCtx();
    if (!this.ctx || !this.musicGain) return;

    this.currentTrack = track;
    this.currentStep = 0;
    this.nextNoteTime = this.ctx.currentTime + 0.05;

    // Definição das trilhas procedurais 8-bit (frequências em Hz: [lead, bass])
    // Formato de steps de semicolcheia
    const TRACK_CONFIGS: Record<string, { tempo: number; steps: Array<[number | null, number | null]> }> = {
      menu: {
        tempo: 110, // BPM calmo e nostálgico
        steps: [
          [523.25, 130.81], [null, null], [659.25, 130.81], [null, null],
          [783.99, 164.81], [null, null], [659.25, 164.81], [null, null],
          [880.00, 174.61], [null, null], [783.99, 174.61], [null, null],
          [659.25, 196.00], [587.33, null], [523.25, 196.00], [null, null],
          [587.33, 146.83], [null, null], [659.25, 146.83], [null, null],
          [783.99, 196.00], [null, null], [880.00, 196.00], [null, null],
          [987.77, 246.94], [null, null], [880.00, 246.94], [null, null],
          [783.99, 196.00], [null, null], [659.25, 130.81], [null, null],
        ],
      },
      classic: {
        tempo: 128, // BPM arcade aventureiro
        steps: [
          [261.63, 65.41], [null, 65.41], [329.63, 130.81], [392.00, 65.41],
          [523.25, 130.81], [null, 65.41], [392.00, 130.81], [329.63, 65.41],
          [220.00, 55.00], [null, 55.00], [261.63, 110.00], [329.63, 55.00],
          [440.00, 110.00], [null, 55.00], [329.63, 110.00], [261.63, 55.00],
          [174.61, 43.65], [null, 43.65], [220.00, 87.31], [261.63, 43.65],
          [349.23, 87.31], [null, 43.65], [261.63, 87.31], [220.00, 43.65],
          [196.00, 49.00], [null, 49.00], [246.94, 98.00], [293.66, 49.00],
          [392.00, 98.00], [349.23, 49.00], [329.63, 98.00], [293.66, 49.00],
        ],
      },
      time_attack: {
        tempo: 154, // BPM acelerado, frenético, tenso
        steps: [
          [440.00, 110.00], [523.25, null], [659.25, 110.00], [880.00, null],
          [659.25, 110.00], [523.25, null], [440.00, 110.00], [523.25, null],
          [392.00, 98.00], [493.88, null], [587.33, 98.00], [783.99, null],
          [587.33, 98.00], [493.88, null], [392.00, 98.00], [493.88, null],
          [349.23, 87.31], [440.00, null], [523.25, 87.31], [698.46, null],
          [523.25, 87.31], [440.00, null], [349.23, 87.31], [440.00, null],
          [329.63, 82.41], [392.00, null], [493.88, 82.41], [659.25, null],
          [783.99, 82.41], [659.25, null], [587.33, 82.41], [493.88, null],
        ],
      },
      blindness: {
        tempo: 114, // BPM misterioso, tenso e sombrio
        steps: [
          [293.66, 73.42], [null, null], [349.23, 73.42], [null, null],
          [440.00, 73.42], [null, null], [587.33, 73.42], [null, null],
          [233.08, 58.27], [null, null], [293.66, 58.27], [null, null],
          [349.23, 58.27], [null, null], [466.16, 58.27], [null, null],
          [196.00, 49.00], [null, null], [233.08, 49.00], [null, null],
          [293.66, 49.00], [null, null], [392.00, 49.00], [null, null],
          [220.00, 55.00], [null, null], [277.18, 55.00], [null, null],
          [329.63, 55.00], [null, null], [440.00, 55.00], [null, null],
        ],
      },
      bonus: {
        tempo: 144, // Bouncy e vitorioso
        steps: [
          [523.25, 130.81], [659.25, null], [783.99, 130.81], [1046.50, null],
          [783.99, 130.81], [659.25, null], [523.25, 130.81], [659.25, null],
          [587.33, 146.83], [698.46, null], [880.00, 146.83], [1174.66, null],
          [880.00, 146.83], [698.46, null], [587.33, 146.83], [698.46, null],
          [659.25, 164.81], [783.99, null], [987.77, 164.81], [1318.51, null],
          [987.77, 164.81], [783.99, null], [659.25, 164.81], [783.99, null],
          [783.99, 196.00], [987.77, null], [1174.66, 196.00], [1567.98, null],
          [1318.51, 196.00], [1046.50, null], [783.99, 196.00], [1046.50, null],
        ],
      },
      duel: {
        tempo: 142, // Tensão competitiva
        steps: [
          [392.00, 98.00], [null, 98.00], [440.00, 98.00], [523.25, 98.00],
          [659.25, 98.00], [null, 98.00], [523.25, 98.00], [440.00, 98.00],
          [349.23, 87.31], [null, 87.31], [392.00, 87.31], [440.00, 87.31],
          [587.33, 87.31], [null, 87.31], [440.00, 87.31], [392.00, 87.31],
        ],
      },
    };

    const config = TRACK_CONFIGS[track] || TRACK_CONFIGS.menu;
    const stepDuration = 60 / config.tempo / 4; // 16th note

    const scheduleAudio = () => {
      if (!this.ctx || !this.musicGain || this.currentTrack !== track) return;

      while (this.nextNoteTime < this.ctx.currentTime + 0.25) {
        const step = config.steps[this.currentStep % config.steps.length];
        const [leadFreq, bassFreq] = step;

        // Lead synth 8-bit (onda quadrada com envelope curto)
        if (leadFreq && !this.muted && this.musicVolume > 0) {
          const osc = this.ctx.createOscillator();
          const noteGain = this.ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(leadFreq, this.nextNoteTime);

          const dur = stepDuration * 0.75;
          noteGain.gain.setValueAtTime(0.08, this.nextNoteTime);
          noteGain.gain.exponentialRampToValueAtTime(0.001, this.nextNoteTime + dur);

          osc.connect(noteGain);
          noteGain.connect(this.musicGain);

          osc.start(this.nextNoteTime);
          osc.stop(this.nextNoteTime + dur);
        }

        // Bass synth 8-bit (onda triangular rica e redonda)
        if (bassFreq && !this.muted && this.musicVolume > 0) {
          const bassOsc = this.ctx.createOscillator();
          const bassGain = this.ctx.createGain();
          bassOsc.type = 'triangle';
          bassOsc.frequency.setValueAtTime(bassFreq, this.nextNoteTime);

          const bassDur = stepDuration * 0.9;
          bassGain.gain.setValueAtTime(0.14, this.nextNoteTime);
          bassGain.gain.exponentialRampToValueAtTime(0.001, this.nextNoteTime + bassDur);

          bassOsc.connect(bassGain);
          bassGain.connect(this.musicGain);

          bassOsc.start(this.nextNoteTime);
          bassOsc.stop(this.nextNoteTime + bassDur);
        }

        this.nextNoteTime += stepDuration;
        this.currentStep++;
      }
    };

    this.bgmIntervalId = setInterval(scheduleAudio, 60);
  }

  public stopBGM(): void {
    if (this.bgmIntervalId) {
      clearInterval(this.bgmIntervalId);
      this.bgmIntervalId = null;
    }
    this.currentTrack = null;
  }

  public getCurrentTrack(): string | null {
    return this.currentTrack;
  }

  // 1. DISPARO DE CANHÃO REMASTERIZADO (Punchy Sub + Ruído de Boca de Cano + Snap)
  public playCannonFire() {
    if (this.muted) return;
    this.initCtx();
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    try {
      const now = this.ctx.currentTime;

      // Camada 1: Estrondo Grave (Sub Boom com drop exponencial)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(190, now);
      osc.frequency.exponentialRampToValueAtTime(32, now + 0.18);

      gain.gain.setValueAtTime(0.42, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.19);

      osc.connect(gain);
      gain.connect(dest);
      osc.start(now);
      osc.stop(now + 0.2);

      // Camada 2: Estalo Inicial (Transient Punch)
      const click = this.ctx.createOscillator();
      const clickGain = this.ctx.createGain();
      click.type = 'square';
      click.frequency.setValueAtTime(450, now);
      click.frequency.exponentialRampToValueAtTime(80, now + 0.04);
      clickGain.gain.setValueAtTime(0.2, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
      click.connect(clickGain);
      clickGain.connect(dest);
      click.start(now);
      click.stop(now + 0.05);

      // Camada 3: Ruído de Pólvora / Sopro de Ar do Cano
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.12);
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, now);
      filter.frequency.exponentialRampToValueAtTime(100, now + 0.12);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.28, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      whiteNoise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(dest);

      whiteNoise.start(now);
      whiteNoise.stop(now + 0.12);
    } catch {
      // Ignora erros de áudio silenciosamente
    }
  }

  // 2. SOM DE TECLA / DIGITAÇÃO DINÂMICA (Nota musical progressiva que varia com o combo!)
  public playKeyStroke(comboCount: number = 0) {
    if (this.muted) return;
    this.initCtx();
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    try {
      const now = this.ctx.currentTime;

      // Escala pentatônica alegre (C5, D5, E5, G5, A5, C6) que sobe conforme o combo
      const scale = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
      const noteIdx = comboCount > 0 ? (comboCount - 1) % scale.length : 0;
      const baseFreq = scale[noteIdx];

      // Oscilador suave e cristalino
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.95, now + 0.06);

      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(dest);
      osc.start(now);
      osc.stop(now + 0.07);

      // Leve click tátil
      const click = this.ctx.createOscillator();
      const clickGain = this.ctx.createGain();
      click.type = 'triangle';
      click.frequency.setValueAtTime(1200, now);
      clickGain.gain.setValueAtTime(0.08, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
      click.connect(clickGain);
      clickGain.connect(dest);
      click.start(now);
      click.stop(now + 0.025);
    } catch {
      // Ignora erros
    }
  }

  // 3. IMPACTO DA BOLA DE CANHÃO REMASTERIZADO (Acerto com som de fragmentação)
  public playCannonImpact(isFinal: boolean = false) {
    if (this.muted) return;
    this.initCtx();
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = isFinal ? 'triangle' : 'sine';
      const baseFreq = isFinal ? 520 : 340;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.45, now + 0.09);

      gain.gain.setValueAtTime(0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(dest);
      osc.start(now);
      osc.stop(now + 0.1);

      if (isFinal) {
        // Brilho harmônico na letra final
        const spark = this.ctx.createOscillator();
        const sparkGain = this.ctx.createGain();
        spark.type = 'sine';
        spark.frequency.setValueAtTime(880, now);
        spark.frequency.exponentialRampToValueAtTime(1320, now + 0.08);
        sparkGain.gain.setValueAtTime(0.14, now);
        sparkGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        spark.connect(sparkGain);
        sparkGain.connect(dest);
        spark.start(now);
        spark.stop(now + 0.09);
      }
    } catch {
      // Ignora erros
    }
  }

  // 4. PALAVRA DESTRUÍDA REMASTERIZADA (Acorde festivo com ressonância cintilante)
  public playWordDestroyed(isBonus: boolean = false) {
    if (this.muted) return;
    this.initCtx();
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    try {
      const now = this.ctx.currentTime;
      // Acorde maior arpegiado rápido
      const notes = isBonus
        ? [587.33, 739.99, 880, 1174.66, 1479.98] // D Maior triunfante
        : [440, 554.37, 659.25, 880, 1108.73]; // A Maior cintilante

      notes.forEach((freq, i) => {
        if (!this.ctx || !dest) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = isBonus ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.03);

        gain.gain.setValueAtTime(0.22, now + i * 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.03 + 0.22);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(now + i * 0.03);
        osc.stop(now + i * 0.03 + 0.23);
      });
    } catch {
      // Ignora erros
    }
  }

  // 5. ERRO DE DIGITAÇÃO (Typo / Tom desanimado curto e não irritante)
  public playTypo() {
    if (this.muted) return;
    this.initCtx();
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.09);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch {
      // Ignora erros
    }
  }

  // 6. ALERTA DE PERIGO / IMPACTO NO CHÃO (Terremoto grave + Alarme vibrante)
  public playDangerAlert() {
    if (this.muted) return;
    this.initCtx();
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    try {
      const now = this.ctx.currentTime;

      // 1. Estrondo Sub-Grave Sísmico Brutal (Earthquake Sub-Drop de alta energia)
      const sub = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();

      sub.type = 'triangle';
      sub.frequency.setValueAtTime(170, now);
      sub.frequency.exponentialRampToValueAtTime(26, now + 0.45);

      subGain.gain.setValueAtTime(0.72, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);

      sub.connect(subGain);
      subGain.connect(dest);
      sub.start(now);
      sub.stop(now + 0.5);

      // 2. Sub-Rumble de tremor contínuo (Segunda onda de choque grave profunda)
      const sub2 = this.ctx.createOscillator();
      const sub2Gain = this.ctx.createGain();
      sub2.type = 'sine';
      sub2.frequency.setValueAtTime(105, now);
      sub2.frequency.exponentialRampToValueAtTime(32, now + 0.4);
      sub2Gain.gain.setValueAtTime(0.55, now);
      sub2Gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
      sub2.connect(sub2Gain);
      sub2Gain.connect(dest);
      sub2.start(now);
      sub2.stop(now + 0.44);

      // 3. Crunch Metálico de Destruição / Estilhaço de Barreira
      const crunch = this.ctx.createOscillator();
      const crunchFilter = this.ctx.createBiquadFilter();
      const crunchGain = this.ctx.createGain();

      crunch.type = 'sawtooth';
      crunch.frequency.setValueAtTime(650, now);
      crunch.frequency.exponentialRampToValueAtTime(80, now + 0.16);

      crunchFilter.type = 'bandpass';
      crunchFilter.frequency.setValueAtTime(950, now);
      crunchFilter.frequency.exponentialRampToValueAtTime(180, now + 0.16);
      crunchFilter.Q.setValueAtTime(2.6, now);

      crunchGain.gain.setValueAtTime(0.48, now);
      crunchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);

      crunch.connect(crunchFilter);
      crunchFilter.connect(crunchGain);
      crunchGain.connect(dest);
      crunch.start(now);
      crunch.stop(now + 0.18);

      // 4. Ruído de Destroços e Explosão de Poeira (Filtro passa-baixas encorpado)
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.4);
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(480, now);
      filter.frequency.exponentialRampToValueAtTime(60, now + 0.4);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.6, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(dest);
      noise.start(now);
      noise.stop(now + 0.42);

      // 5. Sirene / Klaxon de Emergência Estridente (Alerta imediato de vida perdida)
      const sirenChirp = (freq: number, startDelay: number) => {
        if (!this.ctx || !dest) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + startDelay);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.68, now + startDelay + 0.14);

        gain.gain.setValueAtTime(0.35, now + startDelay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + startDelay + 0.15);

        osc.connect(gain);
        gain.connect(dest);
        osc.start(now + startDelay);
        osc.stop(now + startDelay + 0.16);
      };

      // Dois bips de sirene de emergência cortantes
      sirenChirp(380, 0.04);
      sirenChirp(310, 0.18);
    } catch {
      // Ignora erros
    }
  }

  // 7. SURGIMENTO DE NOVA PALAVRA (Efeito suave de gota / entrada aérea)
  public playWordSpawn() {
    if (this.muted) return;
    this.initCtx();
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.05);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch {
      // Ignora erros
    }
  }

  // 8. SURGIMENTO DE PALAVRA VERDE (Prioridade Máxima! Som super chamativo, eletrizante e inconfundível)
  public playGreenWordSpawn() {
    if (this.muted) return;
    this.initCtx();
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    try {
      const now = this.ctx.currentTime;

      // Camada 1: Triplo Chime de Alerta Esmeralda Ascendente (Plim-Plim-PLIIIING!)
      // Frequências bem altas e brilhantes que cortam o grave dos canhões instantaneamente
      const pulses = [
        { start: 880, end: 1174.66, time: 0.0, dur: 0.09, vol: 0.3 },
        { start: 1174.66, end: 1567.98, time: 0.08, dur: 0.10, vol: 0.34 },
        { start: 1567.98, end: 2349.32, time: 0.17, dur: 0.22, vol: 0.38 },
      ];

      pulses.forEach(({ start, end, time, dur, vol }) => {
        if (!this.ctx || !dest) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(start, now + time);
        osc.frequency.exponentialRampToValueAtTime(end, now + time + dur * 0.8);

        gain.gain.setValueAtTime(vol, now + time);
        gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(now + time);
        osc.stop(now + time + dur + 0.01);
      });

      // Camada 2: Glissando Laser Sci-Fi Eletrizante (Whoosh de raio laser chamador)
      const laser = this.ctx.createOscillator();
      const laserFilter = this.ctx.createBiquadFilter();
      const laserGain = this.ctx.createGain();

      laser.type = 'sawtooth';
      laser.frequency.setValueAtTime(550, now);
      laser.frequency.exponentialRampToValueAtTime(1900, now + 0.24);

      laserFilter.type = 'bandpass';
      laserFilter.frequency.setValueAtTime(1200, now);
      laserFilter.frequency.exponentialRampToValueAtTime(2400, now + 0.24);
      laserFilter.Q.setValueAtTime(3.2, now);

      laserGain.gain.setValueAtTime(0.26, now);
      laserGain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);

      laser.connect(laserFilter);
      laserFilter.connect(laserGain);
      laserGain.connect(dest);

      laser.start(now);
      laser.stop(now + 0.27);

      // Camada 3: Eco de Sino de Cristal / Radar Esmeralda (Sustain ressonante cintilante)
      const crystal = this.ctx.createOscillator();
      const crystalGain = this.ctx.createGain();

      crystal.type = 'sine';
      crystal.frequency.setValueAtTime(2093, now + 0.17); // C7 brilhante
      crystal.frequency.exponentialRampToValueAtTime(2637, now + 0.36); // E7

      crystalGain.gain.setValueAtTime(0.24, now + 0.17);
      crystalGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      crystal.connect(crystalGain);
      crystalGain.connect(dest);

      crystal.start(now + 0.17);
      crystal.stop(now + 0.39);

      // Camada 4: Punch grave sutil de impacto aéreo (presença física na chegada)
      const punch = this.ctx.createOscillator();
      const punchGain = this.ctx.createGain();
      punch.type = 'sine';
      punch.frequency.setValueAtTime(240, now);
      punch.frequency.exponentialRampToValueAtTime(75, now + 0.08);

      punchGain.gain.setValueAtTime(0.22, now);
      punchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      punch.connect(punchGain);
      punchGain.connect(dest);

      punch.start(now);
      punch.stop(now + 0.09);
    } catch {
      // Ignora erros
    }
  }

  // 9. DESTRUIÇÃO DE PALAVRA VERDE (Feixe plasma + harpa mágica)
  public playGreenWordDestroyed() {
    if (this.muted) return;
    this.initCtx();
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    try {
      const now = this.ctx.currentTime;
      // Arpejo ascendente de alta energia
      const chord = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98];
      chord.forEach((freq, idx) => {
        if (!this.ctx || !dest) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.02);

        gain.gain.setValueAtTime(0.25, now + idx * 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.02 + 0.25);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(now + idx * 0.02);
        osc.stop(now + idx * 0.02 + 0.26);
      });

      // Raio laser elétrico
      const zap = this.ctx.createOscillator();
      const zapGain = this.ctx.createGain();
      zap.type = 'sawtooth';
      zap.frequency.setValueAtTime(1400, now);
      zap.frequency.exponentialRampToValueAtTime(320, now + 0.14);
      zapGain.gain.setValueAtTime(0.18, now);
      zapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      zap.connect(zapGain);
      zapGain.connect(dest);
      zap.start(now);
      zap.stop(now + 0.15);
    } catch {
      // Ignora erros
    }
  }

  // 10. SURGIMENTO DE PALAVRA AZUL / REVERSA (Filtro espacial retrocesso de alta definição)
  public playReverseWordSpawn() {
    if (this.muted) return;
    this.initCtx();
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    try {
      const now = this.ctx.currentTime;

      // Camada 1: Time-warp reverso com modulação e sweep de frequência invertida
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(1180, now + 0.18);
      osc.frequency.exponentialRampToValueAtTime(540, now + 0.28);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(400, now);
      filter.frequency.exponentialRampToValueAtTime(2200, now + 0.18);
      filter.Q.setValueAtTime(4.5, now);

      gain.gain.setValueAtTime(0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(dest);
      osc.start(now);
      osc.stop(now + 0.32);

      // Camada 2: Brilho cósmico cristalino (arpejo reverso de alta frequência)
      const reverseNotes = [1760, 1480, 1174.66, 880];
      reverseNotes.forEach((freq, idx) => {
        if (!this.ctx || !dest) return;
        const chime = this.ctx.createOscillator();
        const chimeGain = this.ctx.createGain();
        chime.type = 'sine';
        chime.frequency.setValueAtTime(freq, now + idx * 0.04);
        chimeGain.gain.setValueAtTime(0.18, now + idx * 0.04);
        chimeGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.16);
        chime.connect(chimeGain);
        chimeGain.connect(dest);
        chime.start(now + idx * 0.04);
        chime.stop(now + idx * 0.04 + 0.18);
      });

      // Camada 3: Sub drop cósmico
      const sub = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(180, now);
      sub.frequency.exponentialRampToValueAtTime(65, now + 0.15);
      subGain.gain.setValueAtTime(0.2, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      sub.connect(subGain);
      subGain.connect(dest);
      sub.start(now);
      sub.stop(now + 0.17);
    } catch {
      // Ignora erros
    }
  }

  // 11. LEVEL UP FANFARRA
  public playLevelUp() {
    if (this.muted) return;
    this.initCtx();
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
      notes.forEach((freq, i) => {
        if (!this.ctx || !dest) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.07);

        gain.gain.setValueAtTime(0.26, now + i * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.3);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(now + i * 0.07);
        osc.stop(now + i * 0.07 + 0.32);
      });
    } catch {
      // Ignora erros
    }
  }

  // 12. MARCO DE COMBO (5x, 10x, 15x...)
  public playComboMilestone(combo: number) {
    if (this.muted) return;
    this.initCtx();
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    try {
      const now = this.ctx.currentTime;
      const baseFreq = Math.min(1400, 650 + (combo / 5) * 120);
      const notes = [baseFreq, baseFreq * 1.25, baseFreq * 1.5, baseFreq * 2];

      notes.forEach((freq, idx) => {
        if (!this.ctx || !dest) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.045);

        gain.gain.setValueAtTime(0.2, now + idx * 0.045);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.045 + 0.22);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(now + idx * 0.045);
        osc.stop(now + idx * 0.045 + 0.24);
      });
    } catch {
      // Ignora erros
    }
  }

  // 13. VIDA EXTRA (1-Up cintilante)
  public playExtraLife() {
    if (this.muted) return;
    this.initCtx();
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [330, 392, 659, 523, 587, 784, 1046.5];
      notes.forEach((freq, idx) => {
        if (!this.ctx || !dest) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.055);

        gain.gain.setValueAtTime(0.22, now + idx * 0.055);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.055 + 0.24);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(now + idx * 0.055);
        osc.stop(now + idx * 0.055 + 0.26);
      });
    } catch {
      // Ignora erros
    }
  }

  // 14. RODADA BÔNUS (Fanfarra empolgante)
  public playBonusStart() {
    if (this.muted) return;
    this.initCtx();
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    try {
      const now = this.ctx.currentTime;
      const arpeggio = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];

      arpeggio.forEach((freq, idx) => {
        if (!this.ctx || !dest) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0.28, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.28);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.3);
      });
    } catch {
      // Ignora erros
    }
  }

  // 15. GAME OVER
  public playGameOver() {
    if (this.muted) return;
    this.initCtx();
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [440, 392, 349.23, 293.66, 220, 164.81];

      notes.forEach((freq, idx) => {
        if (!this.ctx || !dest) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.13);

        gain.gain.setValueAtTime(0.22, now + idx * 0.13);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.13 + 0.28);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(now + idx * 0.13);
        osc.stop(now + idx * 0.13 + 0.3);
      });
    } catch {
      // Ignora erros
    }
  }

  // 16. NOVO RECORDE QUEBRADO
  public playHighScoreBeaten() {
    if (this.muted) return;
    this.initCtx();
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    try {
      const now = this.ctx.currentTime;
      const arpeggio = [440, 554.37, 659.25, 880, 1108.73, 1318.51, 1760];
      arpeggio.forEach((freq, idx) => {
        if (!this.ctx || !dest) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);

        gain.gain.setValueAtTime(0.24, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.3);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.32);
      });
    } catch {
      // Ignora erros
    }
  }

  // 17. CONTAGEM REGRESSIVA (Tique-taque)
  public playCountdownTick(isLastOne: boolean = false) {
    if (this.muted) return;
    this.initCtx();
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = isLastOne ? 'square' : 'sine';
      osc.frequency.setValueAtTime(isLastOne ? 1046.5 : 659.25, now);

      gain.gain.setValueAtTime(isLastOne ? 0.25 : 0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (isLastOne ? 0.2 : 0.07));

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + (isLastOne ? 0.22 : 0.08));
    } catch {
      // Ignora erros
    }
  }

  // 18. CLIQUES E HOVERS DE INTERFACE
  public playButtonClick() {
    if (this.muted) return;
    this.initCtx();
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(840, now);
      osc.frequency.exponentialRampToValueAtTime(420, now + 0.04);

      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + 0.045);
    } catch {
      // Ignora erros
    }
  }

  public playButtonHover() {
    if (this.muted) return;
    this.initCtx();
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(950, now);

      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + 0.025);
    } catch {
      // Ignora erros
    }
  }

  // 19. MODO REFLEXO (Alerta eletrizante de spawn e sucesso triunfante)
  public playReflexSpawn() {
    if (this.muted) return;
    this.initCtx();
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(700, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.07);

      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch {
      // Ignora erros
    }
  }

  public playReflexSuccess() {
    if (this.muted) return;
    this.initCtx();
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [659.25, 880, 1046.5, 1318.5];
      notes.forEach((freq, idx) => {
        if (!this.ctx || !dest) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.035);

        gain.gain.setValueAtTime(0.2, now + idx * 0.035);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.035 + 0.16);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(now + idx * 0.035);
        osc.stop(now + idx * 0.035 + 0.18);
      });
    } catch {
      // Ignora erros
    }
  }

  // 20. TROCADOR DE PALAVRA (Beep mecânico / mira do canhão)
  public playTargetSwitch() {
    if (this.muted) return;
    this.initCtx();
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.06);

      gain.gain.setValueAtTime(0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // Ignora erros
    }
  }

  // 21. MISSÃO DIÁRIA CONCLUÍDA (Fanfarra 8-bit triunfante de recompensa)
  public playDailyMissionComplete() {
    if (this.muted) return;
    this.initCtx();
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    try {
      const now = this.ctx.currentTime;
      // Arpejo clássico estilo arcade coin/quest
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98, 2093];
      notes.forEach((freq, idx) => {
        if (!this.ctx || !dest) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);

        gain.gain.setValueAtTime(0.2, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.2);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.22);
      });
    } catch {
      // Ignora erros
    }
  }

  // 22. OFENSIVA / DAILY STREAK BADGE (Brilho cintilante 8-bit)
  public playDailyStreakBadge() {
    if (this.muted) return;
    this.initCtx();
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [659.25, 880, 1174.66, 1760];
      notes.forEach((freq, idx) => {
        if (!this.ctx || !dest) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0.22, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.25);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.28);
      });
    } catch {
      // Ignora erros
    }
  }

  // 23. CONQUISTA DESBLOQUEADA (8-bit com intensidade crescente por dificuldade)
  public playAchievementUnlocked(difficulty: 'bronze' | 'silver' | 'gold' = 'bronze') {
    if (this.muted) return;
    this.initCtx();
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    try {
      const now = this.ctx.currentTime;
      if (difficulty === 'bronze') {
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, idx) => {
          if (!this.ctx || !dest) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(freq, now + idx * 0.055);
          gain.gain.setValueAtTime(0.2, now + idx * 0.055);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.055 + 0.2);
          osc.connect(gain);
          gain.connect(dest);
          osc.start(now + idx * 0.055);
          osc.stop(now + idx * 0.055 + 0.22);
        });
      } else if (difficulty === 'silver') {
        const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51, 1760];
        notes.forEach((freq, idx) => {
          if (!this.ctx || !dest) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(freq, now + idx * 0.045);
          gain.gain.setValueAtTime(0.24, now + idx * 0.045);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.045 + 0.25);
          osc.connect(gain);
          gain.connect(dest);
          osc.start(now + idx * 0.045);
          osc.stop(now + idx * 0.045 + 0.28);
        });
      } else {
        // GOLD: Grande Fanfarra Épica de Campeão 8-bit
        const melody = [
          { f: 523.25, d: 0.08 },
          { f: 659.25, d: 0.08 },
          { f: 783.99, d: 0.08 },
          { f: 1046.5, d: 0.12 },
          { f: 880, d: 0.08 },
          { f: 1046.5, d: 0.08 },
          { f: 1318.51, d: 0.14 },
          { f: 1567.98, d: 0.14 },
          { f: 2093.0, d: 0.35 },
        ];
        let offset = 0;
        melody.forEach((item) => {
          if (!this.ctx || !dest) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(item.f, now + offset);
          gain.gain.setValueAtTime(0.28, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.001, now + offset + item.d + 0.1);
          osc.connect(gain);
          gain.connect(dest);
          osc.start(now + offset);
          osc.stop(now + offset + item.d + 0.12);
          offset += item.d;
        });
      }
    } catch {
      // Ignora erros
    }
  }

  // 24. SOM DE DESÂNIMO / ERRO DE DIGITAÇÃO COM RESET DE COMBO (Wah-wah-wah cômico/retro)
  public playComboBreakDiscouraged() {
    if (this.muted) return;
    this.initCtx();
    const dest = this.getDestination();
    if (!this.ctx || !dest) return;

    try {
      const now = this.ctx.currentTime;
      // Três tons descendentes melancólicos
      const sadNotes = [330, 311, 293, 246];
      sadNotes.forEach((freq, idx) => {
        if (!this.ctx || !dest) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';

        const noteStart = now + idx * 0.12;
        osc.frequency.setValueAtTime(freq, noteStart);
        // Wobble de desânimo na última nota
        if (idx === sadNotes.length - 1) {
          osc.frequency.linearRampToValueAtTime(180, noteStart + 0.28);
        }

        gain.gain.setValueAtTime(0.22, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.25);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(noteStart);
        osc.stop(noteStart + 0.3);
      });
    } catch {
      // Ignora erros
    }
  }
}

export const soundManager = new SoundManager();
