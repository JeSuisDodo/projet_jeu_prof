import { describe, expect, it } from 'vitest';
import { TRACKS, noteFreq, tokens } from '../src/audio/sound';
import { defaultSettings, sanitizeSettings } from '../src/game/settings';

describe('musique', () => {
  it('calcule la fréquence des notes', () => {
    expect(noteFreq('A4')).toBeCloseTo(440);
    expect(noteFreq('A5')).toBeCloseTo(880);
    expect(noteFreq('C4')).toBeCloseTo(261.63, 1);
    expect(noteFreq('A4', -12)).toBeCloseTo(220);
    expect(noteFreq('-')).toBeNull();
  });

  it("n'écrit que des notes, des silences, des tenues ou des frappes", () => {
    for (const [name, track] of Object.entries(TRACKS)) {
      expect(track.parts.length, name).toBeGreaterThan(0);
      for (const part of track.parts) {
        const seq = tokens(part.notes);
        // Les voix d'un morceau bouclent sur des mesures entières de 8 croches.
        expect(seq.length % 8, `${name} ${part.voice}`).toBe(0);
        for (const t of seq) {
          const percussion = ['kick', 'snare', 'hat'].includes(part.voice);
          const ok = t === '-' || t === '_' || (percussion ? t === 'x' : noteFreq(t) !== null);
          expect(ok, `${name} ${part.voice} « ${t} »`).toBe(true);
        }
      }
    }
  });
});

describe('paramètres', () => {
  it('complète et borne des réglages abîmés', () => {
    expect(sanitizeSettings(null)).toEqual(defaultSettings());
    expect(sanitizeSettings({ music: 3, effects: -1, muted: 'oui', bigText: true })).toEqual({
      ...defaultSettings(),
      music: 1,
      effects: 0,
      bigText: true,
    });
  });
});
