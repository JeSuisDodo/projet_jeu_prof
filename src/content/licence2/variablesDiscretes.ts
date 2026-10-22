import { VARIABLES_DISCRETES_SKILLS } from '../../exercises/licence2/variablesDiscretes';
import type { ChapterDef } from '../types';
import { bossOf, creature } from './creature';

export const VARIABLES_DISCRETES: ChapterDef = {
  id: 'l2-variables-discretes',
  title: 'Variables aléatoires discrètes',
  region: 'Grottes du Hasard',
  theme: 'plage',
  terrain: 'canyon',
  skills: VARIABLES_DISCRETES_SKILLS,
  creatures: [
    creature('l2-geomouche', 'Géomouche', 'Elle essaie jusqu’au premier succès, puis s’arrête.', ['l2-loi-geometrique', 'l2-somme-independantes'], { shape: 'insecte', hue: 190, symbol: '𝒢' }),
    creature('l2-poissonnet', 'Poissonnet', 'Un petit poisson qui compte les évènements rares.', ['l2-loi-poisson', 'l2-loi-geometrique'], { shape: 'poisson', hue: 200, symbol: '𝒫' }),
    creature('l2-generatrix', 'Génératrix', 'Elle range toute une loi dans un seul polynôme en t.', ['l2-fonction-generatrice', 'l2-loi-poisson'], { shape: 'spectre', hue: 170, symbol: 'G' }),
    creature('l2-covarion', 'Covarion', 'Deux chauves-souris liées qui volent toujours ensemble.', ['l2-couple-discret', 'l2-somme-independantes', 'l2-fonction-generatrice'], { shape: 'oiseau', hue: 210, symbol: 'Cov' }),
  ],
  boss: bossOf('l2-esperantix', 'Espérantix, gardien des grottes', 'Il connaît la moyenne de tous les tirages possibles.', VARIABLES_DISCRETES_SKILLS, { shape: 'golem', hue: 185, symbol: 'E' }),
  guide: ['Dans les Grottes du Hasard, chaque galerie est une issue possible.', 'Pour $X \\sim \\mathcal{P}(\\lambda)$ : $E(X) = V(X) = \\lambda$.'],
};
