import { LOGARITHME_SKILLS } from '../../exercises/terminale/logarithme';
import type { ChapterDef } from '../types';
import { bossOf, creature } from './creature';

export const LOGARITHME: ChapterDef = {
  id: 'tle-logarithme',
  title: 'Fonction logarithme',
  region: 'Marais du Logarithme',
  theme: 'marais',
  skills: LOGARITHME_SKILLS,
  creatures: [
    creature('tle-lenteuil', 'Lenteuil', 'Une tortue des marais : elle grandit, mais de plus en plus lentement.', ['tle-ln-limites', 'tle-ln-variations'], { shape: 'bete', hue: 90, symbol: 'ln' }),
    creature('tle-produisette', 'Produisette', 'Une grenouille qui transforme chaque produit en somme d’un coup de langue.', ['tle-ln-proprietes', 'tle-ln-equation'], { shape: 'blob', hue: 140, symbol: '×' }),
    creature('tle-expolotl', 'Expolotl', 'Une salamandre qui sait défaire une exponentielle en un clin d’œil.', ['tle-exp-equation', 'tle-ln-equation'], { shape: 'poisson', hue: 170, symbol: 'eˣ' }),
    creature('tle-seuilibellule', 'Seuilibellule', 'Une libellule qui trouve le rang exact où une puissance passe sous un seuil.', ['tle-ln-seuil', 'tle-ln-derivee'], { shape: 'insecte', hue: 160, symbol: '⅟x' }),
  ],
  boss: bossOf('tle-neperion', 'Népérion, gardien du marais', 'Un esprit ancien du marais, né en même temps que les tables de logarithmes.', LOGARITHME_SKILLS, { shape: 'spectre', hue: 120, symbol: 'e' }),
  guide: [
    'Le Marais du Logarithme est lent et profond : ici, les produits deviennent des sommes.',
    'Retiens bien : $\\ln(ab) = \\ln a + \\ln b$, et $\\ln$ défait ce que fait l’exponentielle.',
  ],
};
