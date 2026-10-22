import { FONCTIONS_AFFINES_3E } from '../../exercises/troisieme/fonctions';
import type { ChapterDef } from '../types';
import { creature } from './outils';

export const FONCTIONS_AFFINES: ChapterDef = {
  id: '3e-fonctions-affines',
  title: 'Fonctions linéaires et affines',
  region: 'Plaine des Droites',
  theme: 'prairie',
  terrain: 'riviere',
  skills: FONCTIONS_AFFINES_3E,
  creatures: [
    creature('affinou', 'Affinou', 'Un blob qui se déplace toujours en ligne droite.', ['3e-affine-image'], 'blob', 130, 'ax'),
    creature('lineo', 'Linéo', 'Un oiseau qui passe toujours par l’origine du repère.', ['3e-lineaire', '3e-reconnaitre-affine'], 'oiseau', 50, 'ax'),
    creature('ordonnet', 'Ordonnet', 'Une bête qui repère d’un coup d’œil la pente et l’ordonnée à l’origine.', ['3e-affine-coefficients'], 'bete', 30, 'b'),
    creature('pentagrue', 'Pentagrue', 'Une grue élégante qui retrouve une droite à partir de deux de ses points.', ['3e-affine-deux-points', '3e-affine-coefficients'], 'oiseau', 350, 'Δ'),
    creature('droitosaure', 'Droitosaure', 'Une bête très rare qui ne reconnaît que les vraies fonctions affines.', ['3e-reconnaitre-affine', '3e-affine-deux-points'], 'bete', 75, '∕'),
  ],
  boss: creature('directrix', 'Directrix, gardienne de la plaine', 'La gardienne de la plaine, tracée d’un seul trait à la règle.', FONCTIONS_AFFINES_3E.map((s) => s.id), 'golem', 120, 'ax'),
  guide: ['La Plaine des Droites est parfaitement rectiligne.', 'Coefficient directeur, ordonnée à l’origine : tout est affaire de droites.'],
};
