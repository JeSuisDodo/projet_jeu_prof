import { STATISTIQUES_SKILLS } from '../../exercises/seconde/statistiques';
import type { ChapterDef } from '../types';
import { creature } from './outils';

export const STATISTIQUES: ChapterDef = {
  id: '2nde-statistiques',
  title: 'Statistique descriptive',
  region: 'Verger des Statistiques',
  theme: 'automne',
  terrain: 'riviere',
  skills: STATISTIQUES_SKILLS,
  creatures: [
    creature('moyennou', 'Moyennou', 'Un blob qui fait la moyenne de tout ce qu’il mange : ni trop, ni trop peu.', ['2nde-moyenne', '2nde-moyenne-transformee'], 'blob', 30, 'x̄'),
    creature('medianne', 'Médianne', 'Un oiseau qui se perche exactement au milieu de la branche, quand les fruits sont rangés.', ['2nde-mediane', '2nde-etendue'], 'oiseau', 15, 'Me'),
    creature('quartilou', 'Quartilou', 'Un écureuil qui coupe sa récolte en quatre tas égaux.', ['2nde-quartiles', '2nde-etendue'], 'bete', 25, 'Q₁'),
    creature('ponderatus', 'Pondératus', 'Une plante dont chaque fruit compte plus ou moins selon son poids.', ['2nde-moyenne-ponderee', '2nde-moyenne-transformee'], 'plante', 45, 'Σ'),
  ],
  boss: creature('statistor', 'Statistor, gardien du verger', 'Le gardien du verger. Il résume des milliers de fruits en quelques nombres.', STATISTIQUES_SKILLS.map((s) => s.id), 'golem', 20, 'σ'),
  guide: [
    'Bienvenue au Verger des Statistiques : des milliers de fruits à compter et à résumer.',
    'Moyenne, médiane, quartiles et étendue n’auront bientôt plus de secret pour toi.',
  ],
};
