import { PROBABILITES_SKILLS } from '../../exercises/seconde/probabilites';
import type { ChapterDef } from '../types';
import { creature } from './outils';

export const PROBABILITES: ChapterDef = {
  id: '2nde-probabilites',
  title: 'Probabilités et échantillonnage',
  region: 'Bois du Hasard',
  theme: 'nuit',
  skills: PROBABILITES_SKILLS,
  creatures: [
    creature('desou', 'Désou', 'Un blob à six faces qui roule au hasard dans les feuilles.', ['2nde-deux-des', '2nde-proba-simple'], 'blob', 260, '⚀'),
    creature('urnelle', 'Urnelle', 'Une luciole qui tire des boules lumineuses de son urne, sans regarder.', ['2nde-proba-simple', '2nde-proba-contraire'], 'insecte', 55, 'P'),
    creature('contrariant', 'Contrariant', 'Un hibou qui fait toujours l’inverse : demande-lui un événement, il te parle de son contraire.', ['2nde-proba-contraire', '2nde-proba-reunion'], 'oiseau', 240, 'Ā'),
    creature('croisette', 'Croisette', 'Un esprit qui range les élèves dans les cases d’un tableau à double entrée.', ['2nde-tableau-double', '2nde-proba-reunion'], 'spectre', 280, '∪'),
    creature('sondeur', 'Sondeur', 'Une bête nocturne qui vérifie si un échantillon dit la vérité.', ['2nde-echantillonnage', '2nde-tableau-double'], 'bete', 250, 'f'),
  ],
  boss: creature('aleatorix', 'Aléatorix, gardien du bois', 'Le gardien du bois. On ne sait jamais ce qu’il va demander… mais on peut en calculer la probabilité.', PROBABILITES_SKILLS.map((s) => s.id), 'golem', 265, '?'),
  guide: [
    'Bienvenue dans le Bois du Hasard. La nuit, tout y est aléatoire.',
    'Dés, urnes, tableaux à double entrée et échantillons : calcule tes chances avant d’avancer.',
  ],
};
