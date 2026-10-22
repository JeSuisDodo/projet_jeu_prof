import { SERIES_ENTIERES_SKILLS } from '../../exercises/licence2/seriesEntieres';
import type { ChapterDef } from '../types';
import { bossOf, creature } from './creature';

export const SERIES_ENTIERES: ChapterDef = {
  id: 'l2-series-entieres',
  title: 'Séries entières',
  region: 'Lac des Rayons',
  theme: 'nuit',
  terrain: 'lac',
  skills: SERIES_ENTIERES_SKILLS,
  creatures: [
    creature('l2-rayonnet', 'Rayonnet', 'Une luciole qui n’éclaire que le disque de convergence.', ['l2-rayon-convergence', 'l2-convergence-point'], { shape: 'insecte', hue: 55, symbol: 'R' }),
    creature('l2-sommelune', 'Sommelune', 'Un reflet de lune qui additionne les puissances de x.', ['l2-somme-serie-entiere', 'l2-rayon-convergence'], { shape: 'spectre', hue: 230, symbol: 'xⁿ' }),
    creature('l2-taylorin', 'Taylorin', 'Un poisson qui développe toute fonction en série.', ['l2-dse-coefficient', 'l2-dse-usuels'], { shape: 'poisson', hue: 210, symbol: 'aₙ' }),
    creature('l2-cosinelle', 'Cosinelle', 'Une coccinelle rare qui alterne les signes et les puissances paires.', ['l2-dse-usuels', 'l2-dse-coefficient', 'l2-somme-serie-entiere'], { shape: 'insecte', hue: 250, symbol: 'cos' }),
  ],
  boss: bossOf('l2-abelune', 'Abélune, gardienne du lac', 'Elle connaît le rayon exact de chaque cercle sur l’eau.', SERIES_ENTIERES_SKILLS, { shape: 'poisson', hue: 240, symbol: 'Σ' }),
  guide: ['Sur le Lac des Rayons, chaque série entière dessine un cercle sur l’eau : son disque de convergence.', 'Si $\\left|\\frac{a_{n+1}}{a_n}\\right| \\to \\ell$, le rayon vaut $\\frac{1}{\\ell}$.'],
};
