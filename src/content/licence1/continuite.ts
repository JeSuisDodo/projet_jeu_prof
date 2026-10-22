import { CONTINUITE_SKILLS } from '../../exercises/licence1/continuite';
import type { ChapterDef } from '../types';
import { bossOf, creature } from './creature';

export const CONTINUITE: ChapterDef = {
  id: 'l1-limites-continuite',
  title: 'Limites et continuité',
  region: 'Lac des Limites',
  theme: 'neige',
  terrain: 'lac',
  skills: CONTINUITE_SKILLS,
  creatures: [
    creature('l1-indeterminou', 'Indéterminou', 'Un phoque qui hésite entre 0 et ∞ : il faut factoriser pour le décider.', ['l1-limite-forme-indeterminee', 'l1-partie-entiere'], { shape: 'blob', hue: 200, symbol: '0/0' }),
    creature('l1-sinusnow', 'Sinusneige', 'Un flocon pour qui sin(x)/x tend vers 1.', ['l1-limites-usuelles', 'l1-limite-forme-indeterminee'], { shape: 'oiseau', hue: 190, symbol: 'sin' }),
    creature('l1-recolleur', 'Recolleur', 'Il recolle les deux morceaux d’une courbe brisée par la glace.', ['l1-continuite-parametre', 'l1-partie-entiere'], { shape: 'bete', hue: 210, symbol: '⌊x⌋' }),
    creature('l1-equivalune', 'Équivalune', 'Un reflet sur le lac qui ne garde que le terme dominant.', ['l1-equivalents-simples', 'l1-limites-usuelles'], { shape: 'spectre', hue: 220, symbol: '∼' }),
  ],
  boss: bossOf('l1-continuum', 'Continuum, gardien du lac', 'On peut tracer sa silhouette sans jamais lever le crayon.', CONTINUITE_SKILLS, { shape: 'golem', hue: 205, symbol: 'C⁰' }),
  guide: [
    'Le lac est gelé, mais attention aux trous : certaines fonctions ne sont pas continues.',
    'Une forme $\\frac{0}{0}$ se lève souvent en factorisant le numérateur et le dénominateur.',
  ],
};
