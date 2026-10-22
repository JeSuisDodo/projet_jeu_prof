import { EQUATIONS_SKILLS } from '../../exercises/quatrieme/equations';
import type { ChapterDef } from '../types';
import { bossOf, creature } from './creature';

export const EQUATIONS: ChapterDef = {
  id: '4e-equations',
  title: 'Équations du premier degré',
  region: 'Lac des Équations',
  theme: 'prairie',
  terrain: 'lac',
  skills: EQUATIONS_SKILLS,
  creatures: [
    creature('4e-testeau', 'Testeau', 'Une goutte qui vérifie si un nombre fait déborder le lac… ou l’équilibre.', ['4e-tester-valeur'], { shape: 'poisson', hue: 190, symbol: '?' }),
    creature('4e-balancine', 'Balancine', 'Elle garde toujours ses deux plateaux en équilibre.', ['4e-equation-simple'], { shape: 'oiseau', hue: 140, symbol: '=' }),
    creature('4e-isolotte', 'Isolotte', 'Une loutre qui isole le $x$ sur sa petite île.', ['4e-equation-deux-membres'], { shape: 'bete', hue: 30, symbol: 'x' }),
    creature('4e-parenthon', 'Parenthon', 'Il développe avant de résoudre, toujours.', ['4e-equation-parentheses'], { shape: 'poisson', hue: 210, symbol: '()' }),
    creature('4e-inconnue', 'Inconnue', 'Personne ne connaît sa valeur… jusqu’à ce qu’on la mette en équation.', ['4e-mise-en-equation', '4e-equation-deux-membres'], { shape: 'spectre', hue: 170, symbol: 'x?' }),
  ],
  boss: bossOf('4e-equilibre', 'Équilibre, gardien du lac', 'Ce qu’on fait d’un côté du lac, il exige qu’on le fasse de l’autre.', EQUATIONS_SKILLS, { shape: 'golem', hue: 160, symbol: '⚖' }),
  guide: [
    'Au Lac des Équations, tout est question d’équilibre.',
    'Pour résoudre, on fait la même opération dans les deux membres jusqu’à isoler $x$.',
  ],
};
