import { SUITES_SKILLS } from '../../exercises/terminale/suites';
import type { ChapterDef } from '../types';
import { bossOf, creature } from './creature';

export const SUITES: ChapterDef = {
  id: 'tle-suites-recurrence',
  title: 'Suites et raisonnement par récurrence',
  region: 'Escalier des Récurrences',
  theme: 'automne',
  terrain: 'montagne',
  skills: SUITES_SKILLS,
  creatures: [
    creature('tle-marchon', 'Marchon', 'Il ne monte jamais deux marches à la fois : il calcule chaque terme à partir du précédent.', ['tle-terme-recurrence', 'tle-terme-geometrique'], { shape: 'bete', hue: 30, symbol: 'u' }),
    creature('tle-sommelier', 'Sommelier', 'Une chenille qui additionne ses anneaux plus vite que son ombre.', ['tle-somme-entiers', 'tle-somme-geometrique'], { shape: 'insecte', hue: 45, symbol: 'Σ' }),
    creature('tle-montefeuille', 'Montefeuille', 'Une feuille rousse qui sait toujours si elle monte ou si elle descend.', ['tle-sens-variation', 'tle-terme-geometrique'], { shape: 'plante', hue: 20, symbol: '↗' }),
    creature('tle-heredon', 'Héredon', 'Un oiseau prudent : il ne s’envole qu’après avoir vérifié l’initialisation et l’hérédité.', ['tle-heredite', 'tle-conjecture'], { shape: 'oiseau', hue: 10, symbol: 'n+1' }),
  ],
  boss: bossOf('tle-recurrix', 'Récurrix, gardien de l’escalier', 'Gardien des marches infinies. Il exige des preuves pour chaque rang.', SUITES_SKILLS, { shape: 'golem', hue: 25, symbol: '∀n' }),
  guide: [
    'Bienvenue sur l’Île des Sommets ! Ici, chaque marche de l’Escalier des Récurrences se déduit de la précédente.',
    'Pour monter, il faut savoir passer du rang $n$ au rang $n+1$. C’est tout l’esprit de la récurrence.',
  ],
};
