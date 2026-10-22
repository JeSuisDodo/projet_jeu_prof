import { PYTHAGORE_3E } from '../../exercises/troisieme/pythagore';
import type { ChapterDef } from '../types';
import { creature } from './outils';

export const PYTHAGORE: ChapterDef = {
  id: '3e-pythagore',
  title: 'Théorème de Pythagore',
  region: 'Falaises de l’Angle Droit',
  theme: 'automne',
  terrain: 'montagne',
  skills: PYTHAGORE_3E,
  creatures: [
    creature('hypotenuse', 'Hypoténuse', 'Un oiseau qui vole toujours en face de l’angle droit.', ['3e-pythagore-hypotenuse'], 'oiseau', 25, 'c²'),
    creature('cathetou', 'Cathétou', 'Une bête qui se cache le long des côtés de l’angle droit.', ['3e-pythagore-cote', '3e-pythagore-hypotenuse'], 'bete', 30, 'a²'),
    creature('echellot', 'Échellot', 'Un golem en forme d’échelle, toujours appuyé contre un mur.', ['3e-pythagore-probleme'], 'golem', 35, '⊿'),
    creature('equerrine', 'Équerrine', 'Une plante qui vérifie si les triangles sont vraiment rectangles.', ['3e-pythagore-reciproque', '3e-pythagore-probleme'], 'plante', 15, '∟'),
  ],
  boss: creature('pythagoras', 'Gardien de l’Équerre', 'Le gardien des falaises, sculpté en triangle rectangle parfait.', PYTHAGORE_3E.map((s) => s.id), 'golem', 20, 'a²'),
  guide: ['Les Falaises de l’Angle Droit sont taillées en triangles rectangles.', 'Hypoténuse, réciproque : retrouve les longueurs cachées.'],
};
