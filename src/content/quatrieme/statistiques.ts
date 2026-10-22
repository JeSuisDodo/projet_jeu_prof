import { STATISTIQUES_SKILLS } from '../../exercises/quatrieme/statistiques';
import type { ChapterDef } from '../types';
import { bossOf, creature } from './creature';

export const STATISTIQUES: ChapterDef = {
  id: '4e-statistiques',
  title: 'Statistiques',
  region: 'Forêt des Moyennes',
  theme: 'foret',
  terrain: 'foret',
  skills: STATISTIQUES_SKILLS,
  creatures: [
    creature('4e-ecartor', 'Écartor', 'Il mesure l’écart entre la plus haute et la plus basse branche.', ['4e-etendue'], { shape: 'bete', hue: 100, symbol: 'e' }),
    creature('4e-moyennou', 'Moyennou', 'Il partage toutes ses noisettes à parts égales.', ['4e-moyenne'], { shape: 'blob', hue: 90, symbol: 'x̄' }),
    creature('4e-frequencia', 'Fréquencia', 'Elle compte les chants d’oiseaux et les convertit en pourcentages.', ['4e-frequence'], { shape: 'oiseau', hue: 120, symbol: 'f' }),
    creature('4e-medianne', 'Médianne', 'Elle se place toujours pile au milieu de la série.', ['4e-mediane'], { shape: 'plante', hue: 110, symbol: 'Me' }),
    creature('4e-ponderos', 'Pondéros', 'Un vieil arbre qui donne plus de poids aux valeurs fréquentes.', ['4e-moyenne-ponderee', '4e-mediane'], { shape: 'golem', hue: 95, symbol: 'Σ' }),
  ],
  boss: bossOf('4e-statisticus', 'Statisticus, gardien de la forêt', 'Il a recensé chaque arbre, chaque feuille, chaque champignon.', STATISTIQUES_SKILLS, { shape: 'golem', hue: 105, symbol: 'x̄' }),
  guide: [
    'La Forêt des Moyennes regorge de données à dépouiller.',
    'Moyenne, médiane, étendue : trois façons de résumer une série.',
  ],
};
