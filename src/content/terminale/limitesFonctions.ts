import { LIMITES_FONCTIONS_SKILLS } from '../../exercises/terminale/limitesFonctions';
import type { ChapterDef } from '../types';
import { bossOf, creature } from './creature';

export const LIMITES_FONCTIONS: ChapterDef = {
  id: 'tle-limites-fonctions',
  title: 'Limites de fonctions',
  region: 'Falaises des Asymptotes',
  theme: 'neige',
  skills: LIMITES_FONCTIONS_SKILLS,
  creatures: [
    creature('tle-falaisard', 'Falaisard', 'Un bouquetin qui grimpe sans fin le long d’une asymptote verticale.', ['tle-limite-en-a', 'tle-asymptotes'], { shape: 'bete', hue: 200, symbol: '|' }),
    creature('tle-expoflocon', 'Expoflocon', 'Un flocon qui grossit plus vite que n’importe quelle puissance.', ['tle-croissances-comparees', 'tle-limite-composee'], { shape: 'spectre', hue: 190, symbol: 'eˣ' }),
    creature('tle-degrelin', 'Degrélin', 'Un petit golem de glace qui ne garde que les termes de plus haut degré.', ['tle-limite-infini', 'tle-forme-indeterminee'], { shape: 'golem', hue: 210, symbol: 'xⁿ' }),
    creature('tle-indetermouette', 'Indétermouette', 'Un oiseau des neiges qui adore les formes « ∞ − ∞ » et sait les dénouer.', ['tle-forme-indeterminee', 'tle-limite-composee'], { shape: 'oiseau', hue: 230, symbol: '?' }),
  ],
  boss: bossOf('tle-glaciasymp', 'Glaciasymp, gardienne des falaises', 'Elle longe chaque asymptote sans jamais la toucher.', LIMITES_FONCTIONS_SKILLS, { shape: 'golem', hue: 220, symbol: '→' }),
  guide: [
    'Au bord des Falaises des Asymptotes, les courbes filent vers le ciel ou longent des droites invisibles.',
    'Observe bien le comportement des fonctions en l’infini et près des valeurs interdites.',
  ],
};
