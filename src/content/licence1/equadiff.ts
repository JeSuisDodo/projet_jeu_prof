import { EQUADIFF_SKILLS } from '../../exercises/licence1/equadiff';
import type { ChapterDef } from '../types';
import { bossOf, creature } from './creature';

export const EQUADIFF: ChapterDef = {
  id: 'l1-equations-differentielles',
  title: 'Équations différentielles linéaires',
  region: 'Delta des Équations',
  theme: 'foret',
  terrain: 'riviere',
  skills: EQUADIFF_SKILLS,
  creatures: [
    creature('l1-exponentil', 'Exponentil', 'Un têtard qui grandit proportionnellement à sa taille : y′ = ay.', ['l1-ed-ordre1', 'l1-ed-solution-particuliere'], { shape: 'poisson', hue: 150, symbol: 'y′' }),
    creature('l1-caracterix', 'Caractérix', 'Il transforme chaque équation en une équation du second degré.', ['l1-ed-equation-caracteristique', 'l1-ed-ordre1'], { shape: 'insecte', hue: 130, symbol: 'r²' }),
    creature('l1-oscillame', 'Oscillame', 'Une liane qui oscille comme A·cos(ωx) + B·sin(ωx).', ['l1-ed-forme-solutions', 'l1-ed-solution-particuliere'], { shape: 'plante', hue: 110, symbol: '∿' }),
    creature('l1-cauchelin', 'Cauchelin', 'Donne-lui y(0) et y′(0) : il trace toute la rivière.', ['l1-ed-ordre2-conditions', 'l1-ed-equation-caracteristique'], { shape: 'oiseau', hue: 160, symbol: 'y(0)' }),
  ],
  boss: bossOf('l1-differentior', 'Différentior, gardien du delta', 'Chaque bras du delta est une solution de son équation.', EQUADIFF_SKILLS, { shape: 'golem', hue: 140, symbol: 'y″' }),
  guide: [
    'Les bras de ce delta suivent tous la même loi : une équation différentielle.',
    'Pour $y\'\' + py\' + qy = 0$, commence par résoudre $r^2 + pr + q = 0$.',
  ],
};
