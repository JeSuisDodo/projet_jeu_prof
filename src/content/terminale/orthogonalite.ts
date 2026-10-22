import { ORTHOGONALITE_SKILLS } from '../../exercises/terminale/espace';
import type { ChapterDef } from '../types';
import { bossOf, creature } from './creature';

export const ORTHOGONALITE: ChapterDef = {
  id: 'tle-orthogonalite-distances',
  title: 'Orthogonalité et distances dans l’espace',
  region: 'Glacier Orthogonal',
  theme: 'neige',
  skills: ORTHOGONALITE_SKILLS,
  creatures: [
    creature('tle-scalairon', 'Scalairon', 'Un pingouin qui multiplie les coordonnées deux à deux puis les additionne.', ['tle-produit-scalaire', 'tle-orthogonalite'], { shape: 'oiseau', hue: 195, symbol: 'u·v' }),
    creature('tle-normelan', 'Normélan', 'Un élan qui mesure toutes les distances du glacier.', ['tle-norme', 'tle-produit-scalaire'], { shape: 'bete', hue: 205, symbol: '‖u‖' }),
    creature('tle-normalouette', 'Normalouette', 'Une alouette qui vole toujours perpendiculairement au plan.', ['tle-vecteur-normal', 'tle-equation-plan'], { shape: 'oiseau', hue: 180, symbol: 'n⊥' }),
    creature('tle-projetoile', 'Projétoile', 'Un esprit qui tombe à la verticale sur le plan le plus proche.', ['tle-distance-point-plan', 'tle-orthogonalite'], { shape: 'spectre', hue: 225, symbol: 'MH' }),
  ],
  boss: bossOf('tle-perpendicule', 'Perpendicule, gardien du glacier', 'Un colosse à angles droits.', ORTHOGONALITE_SKILLS, { shape: 'golem', hue: 200, symbol: '⊥' }),
  guide: [
    'Le Glacier Orthogonal est taillé à angles droits.',
    'Le produit scalaire est ton piolet : s’il est nul, les vecteurs sont orthogonaux.',
  ],
};
