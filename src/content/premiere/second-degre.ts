import { SECOND_DEGRE_SKILLS } from '../../exercises/secondDegre';
import { CREATURES } from '../../game/creatures';
import type { ChapterDef, CreatureDef, CreatureLook } from '../types';

const creature = (id: string, look: CreatureLook): CreatureDef => {
  const { boss: _boss, ...c } = CREATURES.find((x) => x.id === id)!;
  return { ...c, look };
};

export const SECOND_DEGRE: ChapterDef = {
  id: '1re-second-degre',
  title: 'Second degré',
  region: 'Volcan du Second degré',
  theme: 'volcan',
  terrain: 'riviere',
  skills: SECOND_DEGRE_SKILLS,
  creatures: [
    creature('parabolux', { shape: 'bete', hue: 25 }),
    creature('deltaire', { shape: 'oiseau', hue: 45, symbol: 'Δ' }),
    creature('racinelle', { shape: 'plante', hue: 120 }),
    creature('canonyx', { shape: 'insecte', hue: 10 }),
    creature('signombre', { shape: 'spectre', hue: 270 }),
  ],
  boss: creature('trinomax', { shape: 'golem', hue: 15 }),
};
