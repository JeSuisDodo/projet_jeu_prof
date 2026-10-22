import { SUITES_FONCTIONS_SKILLS } from '../../exercises/licence2/suitesFonctions';
import type { ChapterDef } from '../types';
import { bossOf, creature } from './creature';

export const SUITES_FONCTIONS: ChapterDef = {
  id: 'l2-suites-series-fonctions',
  title: 'Suites et séries de fonctions',
  region: 'Rivière des Convergences',
  theme: 'automne',
  terrain: 'riviere',
  skills: SUITES_FONCTIONS_SKILLS,
  creatures: [
    creature('l2-simplette', 'Simplette', 'Une feuille qui suit le courant, point par point.', ['l2-limite-simple', 'l2-convergence-uniforme'], { shape: 'plante', hue: 30, symbol: 'fₙ' }),
    creature('l2-uniformouette', 'Uniformouette', 'Un oiseau qui vole à la même distance de la rive sur tout le parcours.', ['l2-convergence-uniforme', 'l2-norme-infinie'], { shape: 'oiseau', hue: 20, symbol: '‖∞' }),
    creature('l2-supremus', 'Suprémus', 'Il cherche toujours le plus haut sommet de chaque fonction.', ['l2-norme-infinie', 'l2-limite-simple'], { shape: 'golem', hue: 40, symbol: 'sup' }),
    creature('l2-normalis', 'Normalis', 'Un saumon rare qui remonte les séries normalement convergentes.', ['l2-convergence-normale', 'l2-limite-integrale', 'l2-convergence-uniforme'], { shape: 'poisson', hue: 15, symbol: 'Σf' }),
  ],
  boss: bossOf('l2-weierstrouf', 'Weierstrouf, gardien de la rivière', 'Il sait quand on peut échanger la limite et l’intégrale.', SUITES_FONCTIONS_SKILLS, { shape: 'bete', hue: 25, symbol: '∫' }),
  guide: ['La Rivière des Convergences charrie des fonctions : certaines arrivent toutes ensemble, d’autres en ordre dispersé.', 'Convergence uniforme : $\\sup_I |f_n - f| \\to 0$.'],
};
