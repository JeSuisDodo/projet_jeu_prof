import { VECTEURS_SKILLS } from '../../exercises/seconde/vecteurs';
import type { ChapterDef } from '../types';
import { creature } from './outils';

export const VECTEURS: ChapterDef = {
  id: '2nde-vecteurs',
  title: 'Vecteurs',
  region: 'Côte des Vecteurs',
  theme: 'plage',
  skills: VECTEURS_SKILLS,
  creatures: [
    creature('flechon', 'Fléchon', 'Un poisson-flèche qui file toujours de son point de départ vers son point d’arrivée.', ['2nde-coord-vecteur', '2nde-translation'], 'poisson', 195, '→'),
    creature('sommouette', 'Sommouette', 'Une mouette qui additionne les vents pour savoir où elle va atterrir.', ['2nde-combinaison', '2nde-coord-vecteur'], 'oiseau', 210, '+'),
    creature('parallelocrabe', 'Parallélocrabe', 'Un crabe qui marche de travers en dessinant des parallélogrammes.', ['2nde-parallelogramme', '2nde-translation'], 'insecte', 10, '▱'),
    creature('colinette', 'Colinette', 'Une méduse qui ne nage qu’en ligne droite, dans la même direction que ses sœurs.', ['2nde-colinearite', '2nde-colineaire-m'], 'spectre', 230, '∥'),
  ],
  boss: creature('translatus', 'Translatus, gardien de la côte', 'Le gardien de la côte. Il déplace les vagues d’un seul vecteur.', VECTEURS_SKILLS.map((s) => s.id), 'golem', 200, 'u⃗'),
  guide: [
    'Bienvenue sur la Côte des Vecteurs, où les courants marins ont une direction, un sens et une longueur.',
    'Coordonnées, sommes, translations et colinéarité t’attendent sur le sable.',
  ],
};
