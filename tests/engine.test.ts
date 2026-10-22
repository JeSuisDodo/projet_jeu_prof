import { describe, expect, it } from 'vitest';
import { allChapters } from '../src/content';
import type { CreatureShape } from '../src/content/types';
import { creatureSvg } from '../src/game/creatureArt';
import { migrate } from '../src/game/save';
import { THEMES, shade } from '../src/game/themes';

describe('moteur multi-régions', () => {
  it('reprend une sauvegarde du prototype dans la région du Volcan', () => {
    const v1 = { version: 1 as const, pseudo: 'Lina', xp: 40, captures: { parabolux: 2 }, skills: {}, badges: ['volcan'] };
    expect(migrate(v1)).toEqual({
      version: 2,
      pseudo: 'Lina',
      grade: '1re-spe',
      region: '1re-second-degre',
      xp: 40,
      captures: { parabolux: 2 },
      skills: {},
      badges: ['1re-second-degre'],
    });
  });

  it('dessine chaque silhouette sans valeur manquante, toujours de la même façon', () => {
    const shapes: CreatureShape[] = ['blob', 'oiseau', 'bete', 'plante', 'golem', 'poisson', 'spectre', 'insecte'];
    for (const shape of shapes) {
      const def = { id: `test-${shape}`, look: { shape, hue: 200, symbol: 'Δ<' } };
      const svg = creatureSvg(def);
      expect(svg, shape).toMatch(/^<svg[\s\S]*<\/svg>$/);
      expect(svg, shape).not.toMatch(/NaN|undefined/);
      expect(svg, shape).toContain('Δ&lt;');
      expect(creatureSvg(def)).toBe(svg);
    }
  });

  it('a un thème pour chaque région', () => {
    for (const c of allChapters()) expect(THEMES[c.theme], c.id).toBeDefined();
  });

  it('éclaircit et assombrit les couleurs', () => {
    expect(shade(0x808080, 1)).toBe(0xffffff);
    expect(shade(0x808080, -1)).toBe(0x000000);
    expect(shade(0x123456, 0)).toBe(0x123456);
  });
});
