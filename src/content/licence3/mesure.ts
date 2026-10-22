import { MESURE_SKILLS } from '../../exercises/licence3/mesure';
import { bossOf, creature } from '../terminale/creature';
import type { ChapterDef } from '../types';

export const MESURE: ChapterDef = {
  id: 'l3-mesure-integration',
  title: 'Mesure et intégrale de Lebesgue',
  region: 'Dunes de la Mesure',
  theme: 'desert',
  terrain: 'desert',
  skills: MESURE_SKILLS,
  creatures: [
    creature('l3-lambdune', 'Lambdune', 'Une bête des sables qui mesure la longueur de chaque dune.', ['l3-mesure-lebesgue'], { shape: 'bete', hue: 40, symbol: 'λ' }),
    creature('l3-etagine', 'Étagine', 'Un golem en escalier, constant par morceaux.', ['l3-fonction-etagee'], { shape: 'golem', hue: 30, symbol: '𝟙' }),
    creature('l3-tribulle', 'Tribulle', 'Une bulle qui contient toutes les réunions et tous les complémentaires.', ['l3-tribu-engendree'], { shape: 'blob', hue: 50, symbol: 'σ' }),
    creature('l3-dominor', 'Dominor', 'Un oiseau qui vole toujours sous une fonction intégrable.', ['l3-convergence-dominee', 'l3-integrabilite-riemann'], { shape: 'oiseau', hue: 20, symbol: '≤' }),
    creature('l3-fubinou', 'Fubinou', 'Un scarabée qui intègre d’abord en long, puis en large.', ['l3-fubini', 'l3-integrabilite-riemann'], { shape: 'insecte', hue: 35, symbol: '∬' }),
  ],
  boss: bossOf('l3-mesurion', 'Mesurion, gardien des dunes', 'Pour lui, un grain de sable de plus ou de moins ne change rien : il est négligeable.', MESURE_SKILLS, { shape: 'bete', hue: 45, symbol: 'μ' }),
  guide: [
    'Dans les Dunes de la Mesure, les ensembles dénombrables pèsent zéro.',
    'Le théorème de convergence dominée permet d’échanger limite et intégrale.',
  ],
};
