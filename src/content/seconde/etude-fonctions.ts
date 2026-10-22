import { ETUDE_FONCTIONS_SKILLS } from '../../exercises/seconde/etudeFonctions';
import type { ChapterDef } from '../types';
import { creature } from './outils';

export const ETUDE_FONCTIONS: ChapterDef = {
  id: '2nde-etude-fonctions',
  title: 'Étude graphique et algébrique de fonctions',
  region: 'Plaine des Antécédents',
  theme: 'prairie',
  terrain: 'lac',
  skills: ETUDE_FONCTIONS_SKILLS,
  creatures: [
    creature('imageon', 'Imageon', 'Un blob-miroir : donne-lui un nombre, il te renvoie son image.', ['2nde-image', '2nde-domaine'], 'blob', 60, 'f(x)'),
    creature('antecedor', 'Antécédor', 'Un oiseau qui remonte le temps pour retrouver d’où vient chaque image.', ['2nde-antecedent-affine', '2nde-antecedents-carre'], 'oiseau', 75, 'f⁻'),
    creature('signal', 'Signal', 'Une bête qui sait toujours si une fonction est au-dessus ou en dessous de l’axe.', ['2nde-signe-affine', '2nde-signe-produit'], 'bete', 50, '±'),
    creature('domainette', 'Domainette', 'Un insecte qui garde les frontières : pas de division par zéro sur son territoire !', ['2nde-domaine', '2nde-antecedents-carre', '2nde-signe-produit'], 'insecte', 85, 'D'),
  ],
  boss: creature('graphix', 'Graphix, gardien de la plaine', 'Le gardien de la plaine. Il lit les courbes comme d’autres lisent les livres.', ETUDE_FONCTIONS_SKILLS.map((s) => s.id), 'golem', 70, 'Cf'),
  guide: [
    'Bienvenue dans la Plaine des Antécédents.',
    'Images, antécédents, signes et ensembles de définition : ici on étudie les fonctions par le calcul.',
  ],
};
