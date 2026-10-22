import { PRIORITES_SKILLS } from '../../exercises/cinquieme/priorites';
import type { ChapterDef } from '../types';
import { creature } from './outils';

export const PRIORITES: ChapterDef = {
  id: '5e-priorites',
  title: 'Enchaînement d’opérations',
  region: 'Plaine des Priorités',
  theme: 'prairie',
  terrain: 'riviere',
  skills: PRIORITES_SKILLS,
  creatures: [
    creature('plusou', 'Plusou', 'Un petit blob pressé qui veut toujours additionner en premier… et se trompe une fois sur deux.', ['5e-priorites'], 'blob', 120, '+'),
    creature('parenthe', 'Parenthé', 'Un oiseau aux ailes en forme de parenthèses : ce qu’il abrite dessous passe toujours avant le reste.', ['5e-parentheses'], 'oiseau', 200, '()'),
    creature('fractilou', 'Traitilou', 'Une plante dont la tige est un trait de fraction : elle calcule le haut et le bas avant de diviser.', ['5e-trait-fraction', '5e-priorites'], 'plante', 90, '—'),
    creature('phrasix', 'Phrasix', 'Un insecte bavard qui transforme chaque phrase en calcul.', ['5e-traduire-phrase'], 'insecte', 50, '≡'),
    creature('distribulle', 'Distribulle', 'Un poisson malin qui distribue les multiplications pour calculer de tête.', ['5e-calcul-astucieux', '5e-parentheses'], 'poisson', 180, '×'),
  ],
  boss: creature('priorion', 'Priorion, gardien de la plaine', 'Le gardien de la plaine fait respecter l’ordre des opérations : multiplications d’abord, additions ensuite.', PRIORITES_SKILLS.map((s) => s.id), 'golem', 140, '×+'),
  guide: [
    'Bienvenue dans la Plaine des Priorités !',
    'Ici, les multiplications passent avant les additions, et les parenthèses avant tout le monde.',
  ],
};
