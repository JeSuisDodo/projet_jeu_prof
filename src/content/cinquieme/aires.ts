import { AIRES_SKILLS } from '../../exercises/cinquieme/aires';
import type { ChapterDef } from '../types';
import { creature } from './outils';

export const AIRES: ChapterDef = {
  id: '5e-aires',
  title: 'Périmètres et aires',
  region: 'Canyon des Aires',
  theme: 'desert',
  terrain: 'canyon',
  skills: AIRES_SKILLS,
  creatures: [
    creature('trianglet', 'Trianglet', 'Un blob triangulaire qui divise toujours base × hauteur par deux.', ['5e-aire-triangle'], 'blob', 35, '½'),
    creature('penchou', 'Penchou', 'Une bête penchée comme un parallélogramme : seule sa hauteur compte.', ['5e-aire-parallelogramme'], 'bete', 25, 'bh'),
    creature('circonfle', 'Circonflé', 'Un serpent enroulé qui mesure le tour des cercles avec π.', ['5e-perimetre-cercle'], 'insecte', 15, 'π'),
    creature('disquette', 'Disquette', 'Un oiseau rond dont l’aire vaut π × r × r.', ['5e-aire-disque', '5e-perimetre-cercle'], 'oiseau', 50, 'πr²'),
    creature('convertor', 'Convertor', 'Un spectre des falaises qui convertit les m² en cm² par paquets de 100.', ['5e-conversion-aires'], 'spectre', 45, 'm²'),
    creature('assemblon', 'Assemblon', 'Un golem fait de morceaux : rectangles, triangles et demi-disques.', ['5e-aire-composee', '5e-aire-triangle'], 'plante', 60, '+'),
  ],
  boss: creature('arpentor', 'Arpentor, gardien du canyon', 'Le gardien du canyon mesure chaque recoin de son territoire.', AIRES_SKILLS.map((s) => s.id), 'golem', 30, 'A'),
  guide: [
    'Le Canyon des Aires est fait de figures géantes taillées dans la roche.',
    'Triangles, parallélogrammes, disques : à toi de mesurer !',
  ],
};
