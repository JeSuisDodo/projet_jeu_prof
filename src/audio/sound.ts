/**
 * Musique et bruitages synthétisés dans le navigateur (Web Audio) : aucun fichier son,
 * donc rien à télécharger ni de droits à gérer. Les mélodies sont des compositions originales.
 */

export type TrackName = 'explore' | 'battle' | 'boss';
export type Effect =
  | 'click'
  | 'dialog'
  | 'rustle'
  | 'encounter'
  | 'correct'
  | 'wrong'
  | 'capture'
  | 'flee'
  | 'sign'
  | 'boss'
  | 'victory'
  | 'jump'
  | 'rare';

/** Une voix d'un morceau : une note (« A4 »), un silence « - », une tenue « _ », ou « x » pour une percussion. */
interface Part {
  voice: OscillatorType | 'kick' | 'snare' | 'hat';
  gain: number;
  notes: string;
}

interface Track {
  bpm: number;
  /** Nombre de pas par temps (2 = croches). */
  steps: number;
  transpose?: number;
  parts: Part[];
}

export const TRACKS: Record<TrackName, Track> = {
  // Exploration : fa majeur, tranquille.
  explore: {
    bpm: 96,
    steps: 2,
    parts: [
      {
        voice: 'square',
        gain: 0.045,
        notes: `A4 _ C5 _ A4 G4 F4 _   D5 _ C5 _ A4 _ F4 _   D5 _ F5 _ D5 C5 A#4 _   C5 _ G4 _ A4 _ G4 _
                A4 C5 F5 _ E5 C5 A4 _  F4 A4 D5 _ C5 A4 F4 _  A#4 D5 F5 _ D5 _ A#4 _  C5 _ E5 _ G5 _ _ _`,
      },
      {
        voice: 'triangle',
        gain: 0.12,
        notes: `F2 _ C3 _ F2 _ C3 _   D2 _ A2 _ D2 _ A2 _   A#1 _ F2 _ A#1 _ F2 _   C2 _ G2 _ C2 _ G2 _`,
      },
      {
        voice: 'sine',
        gain: 0.035,
        notes: `F4 A4 C5 A4 F4 A4 C5 A4   D4 F4 A4 F4 D4 F4 A4 F4   D4 F4 A#4 F4 D4 F4 A#4 F4   E4 G4 C5 G4 E4 G4 C5 G4`,
      },
      { voice: 'hat', gain: 0.025, notes: '- x - x - x - x' },
    ],
  },
  // Combat : la mineur, plus rapide.
  battle: {
    bpm: 150,
    steps: 2,
    parts: [
      {
        voice: 'square',
        gain: 0.045,
        notes: `E5 _ A5 _ G5 E5 C5 D5   E5 _ _ C5 A4 _ C5 _   D5 _ G5 _ F5 D5 B4 C5   B4 _ G#4 _ B4 _ E5 _`,
      },
      {
        voice: 'square',
        gain: 0.03,
        notes: `A2 A2 A3 A2 A2 A2 A3 A2   F2 F2 F3 F2 F2 F2 F3 F2   G2 G2 G3 G2 G2 G2 G3 G2   E2 E2 E3 E2 E2 E2 G#2 B2`,
      },
      { voice: 'kick', gain: 0.35, notes: 'x - - - x - - -' },
      { voice: 'snare', gain: 0.08, notes: '- - x - - - x -' },
      { voice: 'hat', gain: 0.02, notes: 'x x x x x x x x' },
    ],
  },
  boss: { bpm: 164, steps: 2, transpose: -2, parts: [] },
};
TRACKS.boss.parts = TRACKS.battle.parts;

const SEMITONES: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

/** Fréquence d'une note « A4 », « C#5 »… ou null si ce n'est pas une note. */
export function noteFreq(note: string, transpose = 0): number | null {
  const m = /^([A-G])(#?)(\d)$/.exec(note);
  if (!m) return null;
  const midi = 12 * (Number(m[3]) + 1) + SEMITONES[m[1]] + (m[2] ? 1 : 0) + transpose;
  return 440 * 2 ** ((midi - 69) / 12);
}

export const tokens = (notes: string) => notes.trim().split(/\s+/);

let ctx: AudioContext | null = null;
let master: GainNode;
let musicBus: GainNode;
let fxBus: GainNode;
let noise: AudioBuffer;
let levels = { music: 0.5, effects: 0.7, muted: false };
let wanted: TrackName | null = null;

interface Playing {
  name: TrackName;
  track: Track;
  parts: string[][];
  out: GainNode;
  step: number;
  next: number;
}
let playing: Playing | null = null;

/** À appeler lors d'un geste de l'élève (clic, touche) : les navigateurs bloquent le son avant. */
export function unlockAudio(): void {
  if (typeof window === 'undefined' || !('AudioContext' in window)) return;
  if (!ctx) {
    ctx = new AudioContext();
    master = ctx.createGain();
    master.connect(ctx.destination);
    musicBus = ctx.createGain();
    fxBus = ctx.createGain();
    musicBus.connect(master);
    fxBus.connect(master);
    noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    applyLevels();
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) void ctx?.suspend();
      else void ctx?.resume();
    });
    window.setInterval(schedule, 25);
  }
  if (ctx.state === 'suspended' && !document.hidden) void ctx.resume();
  if (wanted && playing?.name !== wanted) setMusic(wanted);
}

function applyLevels(): void {
  if (!ctx) return;
  const t = ctx.currentTime;
  master.gain.setTargetAtTime(levels.muted ? 0 : 1, t, 0.05);
  // Volume perçu à peu près proportionnel au curseur.
  musicBus.gain.setTargetAtTime(levels.music ** 2, t, 0.05);
  fxBus.gain.setTargetAtTime(levels.effects ** 2, t, 0.05);
}

export function setLevels(music: number, effects: number, muted: boolean): void {
  levels = { music, effects, muted };
  applyLevels();
}

/** Change de morceau en fondu ; null coupe la musique. */
export function setMusic(name: TrackName | null): void {
  wanted = name;
  if (!ctx || playing?.name === name) return;
  const t = ctx.currentTime;
  if (playing) {
    const old = playing.out;
    old.gain.setTargetAtTime(0, t, 0.25);
    setTimeout(() => old.disconnect(), 2000);
    playing = null;
  }
  if (!name) return;
  const track = TRACKS[name];
  const out = ctx.createGain();
  out.gain.setValueAtTime(0, t);
  out.gain.linearRampToValueAtTime(1, t + 0.8);
  out.connect(musicBus);
  playing = { name, track, parts: track.parts.map((p) => tokens(p.notes)), out, step: 0, next: t + 0.1 };
}

/** Programme les notes des 100 prochaines millisecondes. */
function schedule(): void {
  if (!ctx || !playing || ctx.state !== 'running') return;
  const p = playing;
  const stepDur = 60 / p.track.bpm / p.track.steps;
  // Après une longue pause (onglet caché), on repart de maintenant au lieu de rattraper.
  if (p.next < ctx.currentTime) p.next = ctx.currentTime + 0.05;
  while (p.next < ctx.currentTime + 0.1) {
    p.track.parts.forEach((part, i) => {
      const seq = p.parts[i];
      const at = p.step % seq.length;
      const tok = seq[at];
      if (tok === '-' || tok === '_') return;
      let len = 1;
      while (seq[(at + len) % seq.length] === '_' && len < seq.length) len++;
      playVoice(part, tok, p.next, len * stepDur, p.out, p.track.transpose ?? 0);
    });
    p.step++;
    p.next += stepDur;
  }
}

function playVoice(part: Part, tok: string, t: number, dur: number, out: AudioNode, transpose: number): void {
  if (part.voice === 'kick') return kick(t, part.gain, out);
  if (part.voice === 'snare') return hiss(t, 0.12, part.gain, out, 1800, 'bandpass');
  if (part.voice === 'hat') return hiss(t, 0.04, part.gain, out, 7000, 'highpass');
  const f = noteFreq(tok, transpose);
  if (f) tone(f, t, dur * 0.9, part.voice, part.gain, out);
}

function tone(freq: number, t: number, dur: number, wave: OscillatorType, gain: number, out: AudioNode, slideTo?: number): void {
  if (!ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = wave;
  o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.01);
  g.gain.exponentialRampToValueAtTime(gain * 0.4, t + Math.max(0.02, dur * 0.7));
  g.gain.linearRampToValueAtTime(0, t + dur);
  o.connect(g).connect(out);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function hiss(t: number, dur: number, gain: number, out: AudioNode, freq: number, type: BiquadFilterType, sweepTo?: number): void {
  if (!ctx) return;
  const src = ctx.createBufferSource();
  src.buffer = noise;
  const filter = ctx.createBiquadFilter();
  filter.type = type;
  filter.frequency.setValueAtTime(freq, t);
  if (sweepTo) filter.frequency.exponentialRampToValueAtTime(sweepTo, t + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  src.connect(filter).connect(g).connect(out);
  src.start(t, Math.random() * 0.5);
  src.stop(t + dur);
}

function kick(t: number, gain: number, out: AudioNode): void {
  if (!ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.frequency.setValueAtTime(150, t);
  o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
  o.connect(g).connect(out);
  o.start(t);
  o.stop(t + 0.16);
}

/** Suite de notes rapides (arpège, petite fanfare). */
function melody(notes: string, step: number, wave: OscillatorType, gain: number, last = step): void {
  if (!ctx) return;
  const t = ctx.currentTime;
  tokens(notes).forEach((n, i, all) => {
    const f = noteFreq(n);
    if (f) tone(f, t + i * step, i === all.length - 1 ? last : step * 1.1, wave, gain, fxBus);
  });
}

export function play(effect: Effect): void {
  if (!ctx || ctx.state !== 'running') return;
  const t = ctx.currentTime;
  switch (effect) {
    case 'click':
      return tone(900, t, 0.05, 'square', 0.05, fxBus, 650);
    case 'dialog':
      return tone(520, t, 0.05, 'triangle', 0.12, fxBus);
    case 'rustle':
      return hiss(t, 0.14, 0.12, fxBus, 2600, 'bandpass', 1200);
    case 'sign':
      tone(190, t, 0.06, 'sine', 0.4, fxBus);
      return tone(170, t + 0.09, 0.06, 'sine', 0.35, fxBus);
    case 'encounter':
      hiss(t, 0.3, 0.1, fxBus, 800, 'highpass', 5000);
      return melody('A4 C5 E5 A5 E5 A5', 0.055, 'square', 0.07, 0.2);
    case 'correct':
      return melody('E5 A5', 0.09, 'square', 0.07, 0.25);
    case 'wrong':
      return tone(240, t, 0.4, 'sawtooth', 0.06, fxBus, 120);
    case 'capture':
      return melody('C5 E5 G5 C6 E6 G6', 0.06, 'triangle', 0.14, 0.5);
    case 'flee':
      hiss(t, 0.35, 0.12, fxBus, 3000, 'bandpass', 400);
      return tone(700, t, 0.35, 'sine', 0.1, fxBus, 180);
    case 'boss':
      hiss(t, 0.8, 0.25, fxBus, 300, 'lowpass', 60);
      return tone(70, t, 0.8, 'sawtooth', 0.08, fxBus, 40);
    case 'jump':
      tone(260, t, 0.16, 'square', 0.05, fxBus, 620);
      return hiss(t + 0.3, 0.1, 0.1, fxBus, 900, 'lowpass', 300);
    case 'rare':
      return melody('E6 B5 E6 G6 B6', 0.07, 'triangle', 0.1, 0.4);
    case 'victory':
      return melody('G4 C5 E5 G5 - E5 G5 _ C6', 0.12, 'square', 0.07, 0.7);
  }
}
