import { INTEGRALES_SKILLS } from '../../exercises/terminale/integrales';
import type { ChapterDef } from '../types';
import { bossOf, creature } from './creature';

export const INTEGRALES: ChapterDef = {
  id: 'tle-calcul-integral',
  title: 'Calcul intégral',
  region: 'Lac des Aires',
  theme: 'cristal',
  skills: INTEGRALES_SKILLS,
  creatures: [
    creature('tle-airignon', 'Airignon', 'Un poisson plat qui mesure l’aire sous chaque vague.', ['tle-integrale-polynome', 'tle-integrale-linearite'], { shape: 'poisson', hue: 270, symbol: '∫' }),
    creature('tle-moyennette', 'Moyennette', 'Un cristal qui brille de la valeur moyenne de sa fonction.', ['tle-valeur-moyenne', 'tle-integrale-polynome'], { shape: 'blob', hue: 290, symbol: 'μ' }),
    creature('tle-expocristal', 'Expocristal', 'Un cristal qui pousse de façon exponentielle.', ['tle-integrale-exp', 'tle-integration-parties'], { shape: 'golem', hue: 250, symbol: 'eˣ' }),
    creature('tle-entredeux', 'Entredeux', 'Un esprit du lac qui vit entre deux courbes.', ['tle-aire-entre-courbes', 'tle-integrale-linearite'], { shape: 'spectre', hue: 280, symbol: 'f−g' }),
  ],
  boss: bossOf('tle-integralius', 'Intégralius, gardien du lac', 'Il additionne une infinité de tranches infiniment fines.', INTEGRALES_SKILLS, { shape: 'golem', hue: 265, symbol: '∫' }),
  guide: [
    'Le Lac des Aires est tapissé de cristaux : chacun mesure exactement l’aire sous une courbe.',
    'Pour calculer $\\int_a^b f$, trouve une primitive et calcule $F(b) - F(a)$.',
  ],
};
