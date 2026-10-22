import { DETERMINANTS_SKILLS } from '../../exercises/licence2/determinants';
import type { ChapterDef } from '../types';
import { bossOf, creature } from './creature';

export const DETERMINANTS: ChapterDef = {
  id: 'l2-determinants',
  title: 'Déterminants',
  region: 'Gorges des Déterminants',
  theme: 'volcan',
  terrain: 'canyon',
  skills: DETERMINANTS_SKILLS,
  creatures: [
    creature('l2-detoursier', 'Détoursier', 'Un petit golem qui multiplie en croix tout ce qu’il croise.', ['l2-det-2x2', 'l2-det-proprietes'], { shape: 'golem', hue: 15, symbol: '×' }),
    creature('l2-sarrusard', 'Sarrusard', 'Un lézard des gorges qui trace des diagonales sur la roche.', ['l2-det-3x3', 'l2-det-2x2'], { shape: 'bete', hue: 25, symbol: '|A|' }),
    creature('l2-comatrix', 'Comatrix', 'Il garde les cofacteurs au chaud dans ses écailles.', ['l2-det-inverse', 'l2-det-parametre'], { shape: 'insecte', hue: 5, symbol: 'com' }),
    creature('l2-vandermouche', 'Vandermouche', 'Une mouche rare qui ne vole que sur des puissances successives.', ['l2-det-vandermonde', 'l2-det-proprietes', 'l2-det-3x3'], { shape: 'insecte', hue: 35, symbol: 'V' }),
  ],
  boss: bossOf('l2-volumax', 'Volumax, gardien des gorges', 'Il mesure le volume orienté de chaque parallélépipède.', DETERMINANTS_SKILLS, { shape: 'golem', hue: 10, symbol: 'det' }),
  guide: ['Les Gorges des Déterminants sont taillées en parallélépipèdes : leur volume, c’est le déterminant.', 'Une matrice est inversible si et seulement si son déterminant est non nul.'],
};
