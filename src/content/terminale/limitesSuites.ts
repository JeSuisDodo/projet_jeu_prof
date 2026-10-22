import { LIMITES_SUITES_SKILLS } from '../../exercises/terminale/limitesSuites';
import type { ChapterDef } from '../types';
import { bossOf, creature } from './creature';

export const LIMITES_SUITES: ChapterDef = {
  id: 'tle-limites-suites',
  title: 'Limites de suites',
  region: 'Plage de l’Infini',
  theme: 'plage',
  terrain: 'archipel',
  skills: LIMITES_SUITES_SKILLS,
  creatures: [
    creature('tle-vaguelim', 'Vaguelim', 'Une vague qui se rapproche toujours plus d’une ligne qu’elle ne franchit jamais.', ['tle-limite-qn', 'tle-limite-point-fixe'], { shape: 'poisson', hue: 200, symbol: 'ℓ' }),
    creature('tle-gendarmouette', 'Gendarmouette', 'Deux mouettes l’encadrent sans cesse : impossible pour elle de s’échapper.', ['tle-gendarmes', 'tle-comparaison'], { shape: 'oiseau', hue: 190, symbol: '≤' }),
    creature('tle-quotientacle', 'Quotientacle', 'Un poulpe qui factorise par le plus haut degré avec ses tentacules.', ['tle-limite-quotient', 'tle-limite-qn'], { shape: 'poisson', hue: 260, symbol: '∞' }),
    creature('tle-seuilmarin', 'Seuilmarin', 'Un crabe patient qui compte les vagues jusqu’à ce qu’elles dépassent le seuil.', ['tle-seuil', 'tle-convergence-monotone'], { shape: 'insecte', hue: 15, symbol: 'N' }),
  ],
  boss: bossOf('tle-asymptor', 'Asymptor, gardien du large', 'Gardien de l’horizon. Il connaît la limite de toute suite.', LIMITES_SUITES_SKILLS, { shape: 'spectre', hue: 210, symbol: '∞' }),
  guide: [
    'Les vagues de la Plage de l’Infini s’approchent du rivage sans jamais l’atteindre… ou filent vers le large.',
    'Ici, on apprend où va une suite quand $n$ devient très grand.',
  ],
};
