import { STATISTIQUES_SKILLS } from '../../exercises/cinquieme/statistiques';
import type { ChapterDef } from '../types';
import { creature } from './outils';

export const STATISTIQUES: ChapterDef = {
  id: '5e-statistiques',
  title: 'Statistiques',
  region: 'Désert des Moyennes',
  theme: 'desert',
  terrain: 'desert',
  skills: STATISTIQUES_SKILLS,
  creatures: [
    creature('comptadune', 'Comptadune', 'Un blob de sable qui compte les grains par catégories.', ['5e-effectif'], 'blob', 45, 'n'),
    creature('frequentin', 'Fréquentin', 'Un insecte des dunes qui exprime tout en pourcentage du total.', ['5e-frequence', '5e-effectif'], 'insecte', 35, 'f'),
    creature('moyennard', 'Moyennard', 'Un chameau qui équilibre ses bosses pour toujours être dans la moyenne.', ['5e-moyenne'], 'bete', 30, 'x̄'),
    creature('ponderos', 'Pondéros', 'Un golem de pierre qui pèse chaque valeur selon son effectif.', ['5e-moyenne-ponderee'], 'plante', 55, 'Σ'),
    creature('etendor', 'Étendor', 'Un oiseau des mirages qui mesure l’écart entre le plus chaud et le plus froid.', ['5e-etendue', '5e-moyenne'], 'oiseau', 20, '↔'),
  ],
  boss: creature('statisphinx', 'Statisphinx, gardien du désert', 'Le gardien du désert ne laisse passer que ceux qui savent résumer une série.', STATISTIQUES_SKILLS.map((s) => s.id), 'golem', 40, 'x̄'),
  guide: [
    'Le Désert des Moyennes s’étend à perte de vue.',
    'Effectifs, fréquences et moyennes : les dunes sont pleines de données.',
  ],
};
