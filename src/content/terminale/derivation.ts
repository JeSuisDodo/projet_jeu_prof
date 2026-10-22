import { DERIVATION_SKILLS } from '../../exercises/terminale/derivation';
import type { ChapterDef } from '../types';
import { bossOf, creature } from './creature';

export const DERIVATION: ChapterDef = {
  id: 'tle-derivation-convexite',
  title: 'Dérivation et convexité',
  region: 'Collines Convexes',
  theme: 'foret',
  skills: DERIVATION_SKILLS,
  creatures: [
    creature('tle-derivouille', 'Dérivouille', 'Une grenouille qui saute d’une fonction à sa dérivée.', ['tle-derivee-composee', 'tle-derivee-racine'], { shape: 'blob', hue: 100, symbol: 'f′' }),
    creature('tle-expousse', 'Expousse', 'Une pousse qui grandit exactement comme sa propre dérivée.', ['tle-derivee-exp', 'tle-tangente'], { shape: 'plante', hue: 120, symbol: 'eᵘ' }),
    creature('tle-convexin', 'Convexin', 'Un hérisson qui se met en boule au-dessus de toutes ses tangentes.', ['tle-convexite', 'tle-derivee-seconde'], { shape: 'bete', hue: 80, symbol: 'f″' }),
    creature('tle-inflexiboa', 'Inflexiboa', 'Un serpent qui change de courbure au milieu de son corps.', ['tle-point-inflexion', 'tle-derivee-seconde'], { shape: 'poisson', hue: 150, symbol: '∿' }),
  ],
  boss: bossOf('tle-courbatus', 'Courbatus, gardien des collines', 'Un vieux chêne qui connaît toutes les courbures de la forêt.', DERIVATION_SKILLS, { shape: 'golem', hue: 90, symbol: '∪∩' }),
  guide: [
    'Les Collines Convexes ondulent : parfois elles se creusent, parfois elles se bombent.',
    'Les créatures d’ici dérivent tout ce qu’elles voient, deux fois s’il le faut.',
  ],
};
