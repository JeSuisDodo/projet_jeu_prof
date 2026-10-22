import { STATISTIQUES_3E } from '../../exercises/troisieme/statistiques';
import type { ChapterDef } from '../types';
import { creature } from './outils';

export const STATISTIQUES: ChapterDef = {
  id: '3e-statistiques',
  title: 'Statistiques',
  region: 'Vallée des Moyennes',
  theme: 'automne',
  terrain: 'riviere',
  skills: STATISTIQUES_3E,
  creatures: [
    creature('moyennard', 'Moyennard', 'Un blob jamais trop grand, jamais trop petit : pile dans la moyenne.', ['3e-moyenne'], 'blob', 35, 'x̄'),
    creature('etendou', 'Étendou', 'Un oiseau qui mesure l’écart entre la plus haute et la plus basse branche.', ['3e-etendue', '3e-moyenne'], 'oiseau', 25, '↕'),
    creature('frequenceuil', 'Fréquenceuil', 'Un écureuil qui compte tout en pourcentages.', ['3e-frequence'], 'bete', 20, '%'),
    creature('medianne', 'Médianne', 'Une plante qui pousse exactement au milieu de la série.', ['3e-mediane', '3e-etendue'], 'plante', 45, 'Me'),
    creature('coefficerf', 'Coefficerf', 'Un cerf majestueux dont chaque bois a un coefficient différent.', ['3e-moyenne-ponderee', '3e-mediane'], 'bete', 30, 'Σ'),
  ],
  boss: creature('statistor', 'Statistor, gardien de la vallée', 'Le gardien de la vallée, qui résume chaque série en un seul nombre.', STATISTIQUES_3E.map((s) => s.id), 'golem', 40, 'x̄'),
  guide: ['La Vallée des Moyennes est pleine de données à résumer.', 'Moyennes, médianes, étendues : trouve le bon indicateur.'],
};
