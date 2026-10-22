import { INTEGRALES_GENERALISEES_SKILLS } from '../../exercises/licence2/integralesGeneralisees';
import type { ChapterDef } from '../types';
import { bossOf, creature } from './creature';

export const INTEGRALES_GENERALISEES: ChapterDef = {
  id: 'l2-integrales-generalisees',
  title: 'Intégrales généralisées',
  region: 'Marais de l’Infini',
  theme: 'marais',
  terrain: 'marais',
  skills: INTEGRALES_GENERALISEES_SKILLS,
  creatures: [
    creature('l2-impropet', 'Impropet', 'Une grenouille qui saute jusqu’à l’infini sans jamais arriver.', ['l2-integrale-riemann', 'l2-integrale-puissance'], { shape: 'bete', hue: 100, symbol: '∫∞' }),
    creature('l2-decroissance', 'Décroissance', 'Une libellule dont l’aile s’amincit en exponentielle.', ['l2-integrale-exponentielle', 'l2-integrale-riemann'], { shape: 'insecte', hue: 85, symbol: 'e⁻ᵗ' }),
    creature('l2-arctangue', 'Arctangue', 'Un poisson qui nage jusqu’à π/2 sans dépasser.', ['l2-integrale-rationnelle', 'l2-integrale-puissance'], { shape: 'poisson', hue: 120, symbol: 'π/2' }),
    creature('l2-equivalase', 'Équivalase', 'Une vase qui ressemble à une autre, à l’infini près.', ['l2-integrale-nature-equivalent', 'l2-integrale-exponentielle', 'l2-integrale-rationnelle'], { shape: 'blob', hue: 75, symbol: '∼' }),
  ],
  boss: bossOf('l2-convergor', 'Convergor, gardien du marais', 'Il décide quelles aires infinies restent finies.', INTEGRALES_GENERALISEES_SKILLS, { shape: 'spectre', hue: 95, symbol: '∫' }),
  guide: ['Le Marais de l’Infini s’étend sans fin… mais certaines aires y restent finies.', '$\\int_1^{+\\infty} \\frac{dt}{t^\\alpha}$ converge si et seulement si $\\alpha > 1$.'],
};
