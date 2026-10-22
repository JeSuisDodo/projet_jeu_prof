import { TRIANGLES_SKILLS } from '../../exercises/cinquieme/triangles';
import type { ChapterDef } from '../types';
import { creature } from './outils';

export const TRIANGLES: ChapterDef = {
  id: '5e-triangles',
  title: 'Triangles',
  region: 'Volcan des Triangles',
  theme: 'volcan',
  terrain: 'montagne',
  skills: TRIANGLES_SKILLS,
  creatures: [
    creature('cent-quatre-vingt', 'Centquatrevin', 'Un blob de lave dont les trois coins font toujours 180° ensemble.', ['5e-somme-angles'], 'blob', 15, '180'),
    creature('isocelle', 'Isocelle', 'Un oiseau aux ailes égales, aussi symétrique qu’un triangle isocèle.', ['5e-angles-isocele', '5e-somme-angles'], 'oiseau', 30, 'Δ'),
    creature('inegaleon', 'Inégaléon', 'Une bête qui vérifie qu’un côté n’est jamais plus long que les deux autres réunis.', ['5e-inegalite-triangulaire'], 'bete', 5, '≤'),
    creature('naturel', 'Naturix', 'Un insecte de braise qui devine la nature d’un triangle à ses angles.', ['5e-nature-triangle'], 'insecte', 25, '∟'),
    creature('troisiecote', 'Troisiècôte', 'Un spectre de fumée qui cherche la longueur du troisième côté.', ['5e-longueur-possible', '5e-inegalite-triangulaire'], 'spectre', 350, '?'),
  ],
  boss: creature('trigonor', 'Trigonor, gardien du volcan', 'Le gardien du volcan est un triangle de magma parfait.', TRIANGLES_SKILLS.map((s) => s.id), 'golem', 10, 'Δ'),
  guide: [
    'Le Volcan des Triangles gronde !',
    'Angles, côtés et triangles particuliers : la somme fait toujours 180°.',
  ],
};
