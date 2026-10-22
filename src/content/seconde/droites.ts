import { DROITES_SKILLS } from '../../exercises/seconde/droites';
import type { ChapterDef } from '../types';
import { creature } from './outils';

export const DROITES: ChapterDef = {
  id: '2nde-droites',
  title: 'Équations de droites',
  region: 'Vallée des Droites',
  theme: 'automne',
  skills: DROITES_SKILLS,
  creatures: [
    creature('pentou', 'Pentou', 'Un blob qui glisse le long des pentes : plus elles sont raides, plus son coefficient est grand.', ['2nde-coef-directeur', '2nde-point-droite'], 'blob', 30, 'm'),
    creature('origamo', 'Origamo', 'Un oiseau de feuilles mortes qui se pose toujours sur l’axe des ordonnées.', ['2nde-ordonnee-origine', '2nde-coef-directeur'], 'oiseau', 20, 'p'),
    creature('reduitor', 'Réduitor', 'Une bête qui met toutes les droites sous forme réduite.', ['2nde-equation-reduite', '2nde-cartesienne-reduite'], 'bete', 15, 'y='),
    creature('directeuil', 'Directeuil', 'Un écureuil qui indique la direction de chaque droite avec sa queue.', ['2nde-vecteur-directeur', '2nde-cartesienne-reduite'], 'bete', 35, 'u⃗'),
  ],
  boss: creature('rectiligne', 'Rectiligne, gardienne de la vallée', 'La gardienne de la vallée, droite comme un i. Elle connaît l’équation de chaque chemin.', DROITES_SKILLS.map((s) => s.id), 'golem', 25, '╱'),
  guide: [
    'Bienvenue dans la Vallée des Droites. Ici, chaque chemin a son équation.',
    'Coefficient directeur, ordonnée à l’origine, vecteur directeur : à toi de tracer la route.',
  ],
};
