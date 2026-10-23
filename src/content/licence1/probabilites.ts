import { PROBABILITES_SKILLS } from '../../exercises/licence1/probabilites';
import type { ChapterDef } from '../types';
import { bossOf, creature } from './creature';

export const PROBABILITES: ChapterDef = {
  id: 'l1-probabilites',
  title: 'Probabilités sur un univers fini',
  region: 'Côte du Hasard',
  theme: 'plage',
  terrain: 'cote',
  skills: PROBABILITES_SKILLS,
  creatures: [
    creature('l1-tirelure', 'Tirelure', 'Une mouette qui pioche des boules dans une urne posée sur le sable.', ['l1-proba-denombrement', 'l1-proba-independance'], { shape: 'oiseau', hue: 190, symbol: 'P(A)' }),
    creature('l1-independeau', 'Indépendeau', 'Deux vagues qui ne s’influencent jamais : P(A ∩ B) = P(A)P(B).', ['l1-proba-independance', 'l1-esperance-variance'], { shape: 'poisson', hue: 200, symbol: '⊥' }),
    creature('l1-esperoquet', 'Espéroquet', 'Il prédit la valeur moyenne de chaque variable aléatoire.', ['l1-esperance-variance', 'l1-loi-binomiale'], { shape: 'oiseau', hue: 170, symbol: 'E(X)' }),
    creature('l1-bayesard', 'Bayésard', 'Un crabe qui remonte des effets aux causes.', ['l1-proba-bayes', 'l1-proba-denombrement'], { shape: 'insecte', hue: 15, symbol: 'B|A' }),
  ],
  boss: bossOf('l1-bernoullix', 'Bernoullix, gardien de la côte', 'Il lance ses coquillages n fois et compte les succès.', PROBABILITES_SKILLS, { shape: 'golem', hue: 185, symbol: '𝓑' }),
  guide: [
    'Sur cette côte, rien n’est certain : tout est affaire de probabilités.',
    'Formule de Bayes : $P_B(A) = \\frac{P(A)P_A(B)}{P(B)}$.',
  ],
};
