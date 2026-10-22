import { PRIMITIVES_SKILLS } from '../../exercises/terminale/primitives';
import type { ChapterDef } from '../types';
import { bossOf, creature } from './creature';

export const PRIMITIVES: ChapterDef = {
  id: 'tle-primitives-equadiff',
  title: 'Primitives et équations différentielles',
  region: 'Bois des Primitives',
  theme: 'foret',
  terrain: 'foret',
  skills: PRIMITIVES_SKILLS,
  creatures: [
    creature('tle-remontrelle', 'Remontrelle', 'Une fourmi qui remonte toujours de la dérivée vers la fonction.', ['tle-primitive-polynome', 'tle-primitive-forme'], { shape: 'insecte', hue: 60, symbol: 'F' }),
    creature('tle-equadrille', 'Équadrille', 'Un champignon dont la croissance obéit à y′ = ay.', ['tle-equadiff-homogene', 'tle-equadiff-condition'], { shape: 'plante', hue: 20, symbol: 'y′' }),
    creature('tle-constanthibou', 'Constanthibou', 'Un hibou immobile : il est la solution constante de toute équation.', ['tle-equadiff-constante', 'tle-equadiff-generale'], { shape: 'oiseau', hue: 35, symbol: 'C' }),
    creature('tle-forminule', 'Forminule', 'Un lutin des bois qui reconnaît toutes les formes u′eᵘ, u′/u, u′uⁿ…', ['tle-primitive-forme', 'tle-equadiff-generale'], { shape: 'spectre', hue: 100, symbol: 'u′' }),
  ],
  boss: bossOf('tle-differentor', 'Différentor, gardien du bois', 'Un arbre millénaire qui pousse selon une équation différentielle.', PRIMITIVES_SKILLS, { shape: 'golem', hue: 70, symbol: 'dy' }),
  guide: [
    'Le Bois des Primitives remonte le temps : ici, on cherche la fonction dont on connaît la dérivée.',
    "Les équations différentielles y poussent comme des champignons : $y' = ay + b$ !",
  ],
};
