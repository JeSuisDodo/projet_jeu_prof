import { DONNEES_SKILLS } from '../../exercises/sixieme/donnees';
import type { ChapterDef } from '../types';
import { creature } from './outils';

export const DONNEES: ChapterDef = {
  id: '6e-donnees',
  title: 'Tableaux et données',
  region: 'Lac des Relevés',
  theme: 'prairie',
  terrain: 'lac',
  skills: DONNEES_SKILLS,
  creatures: [
    creature('relevette', 'Relevette', 'Une grenouille qui note tout ce qu’elle voit dans un tableau.', ['6e-lire-tableau'], 'bete', 100, '▦'),
    creature('compteur', 'Compteur', 'Un canard qui compte les notes une par une sans en oublier.', ['6e-effectif'], 'oiseau', 60, '#'),
    creature('doublentree', 'Doublentrée', 'Un poisson aux nageoires quadrillées comme un tableau à double entrée.', ['6e-tableau-double', '6e-lire-tableau'], 'poisson', 180, '⊞'),
    creature('camemberon', 'Camemberon', 'Une créature ronde et rare, découpée en secteurs de couleur.', ['6e-diagramme-circulaire', '6e-effectif'], 'blob', 50, '◔'),
  ],
  boss: creature('statistor', 'Statistor, gardien du lac', 'Le gardien du lac, qui tient le registre de tout ce qui y vit.', DONNEES_SKILLS.map((s) => s.id), 'golem', 90, 'Σ'),
  guide: [
    'Au Lac des Relevés, on compte, on trie et on range les informations.',
    'Repère bien la ligne et la colonne avant de lire un tableau.',
  ],
};
