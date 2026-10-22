import { GEOMETRIE_PLAN_SKILLS } from '../../exercises/seconde/geometriePlan';
import type { ChapterDef } from '../types';
import { creature } from './outils';

export const GEOMETRIE_PLAN: ChapterDef = {
  id: '2nde-geometrie-plan',
  title: 'Géométrie dans le plan',
  region: 'Désert de Pythagore',
  theme: 'desert',
  skills: GEOMETRIE_PLAN_SKILLS,
  creatures: [
    creature('milieuse', 'Milieuse', 'Un blob qui s’installe toujours pile au milieu de deux points.', ['2nde-milieu', '2nde-symetrique'], 'blob', 45, 'M'),
    creature('hypotenor', 'Hypoténor', 'Un scorpion à trois pattes, dont la plus longue fait face à l’angle droit.', ['2nde-pythagore', '2nde-reciproque'], 'insecte', 30, '⊾'),
    creature('distancier', 'Distancier', 'Une bête du désert qui mesure la distance entre deux oasis d’un seul bond.', ['2nde-longueur', '2nde-milieu'], 'bete', 20, 'AB'),
    creature('cosinelle', 'Cosinelle', 'Un oiseau qui plane en angle et connaît par cœur CAH SOH TOA.', ['2nde-trigo', '2nde-reciproque'], 'oiseau', 15, 'cos'),
  ],
  boss: creature('pyramidor', 'Pyramidor, gardien du désert', 'Le gardien du désert, une pyramide vivante aux angles parfaitement droits.', GEOMETRIE_PLAN_SKILLS.map((s) => s.id), 'golem', 40, '△'),
  guide: [
    'Voici le Désert de Pythagore. Les dunes y sont rangées dans un repère orthonormé.',
    'Milieux, distances, triangles rectangles et trigonométrie : garde ta règle à portée de main.',
  ],
};
