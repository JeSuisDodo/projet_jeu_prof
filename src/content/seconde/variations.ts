import { VARIATIONS_SKILLS } from '../../exercises/seconde/variations';
import type { ChapterDef } from '../types';
import { creature } from './outils';

export const VARIATIONS: ChapterDef = {
  id: '2nde-variations',
  title: 'Étude des variations d’une fonction',
  region: 'Monts des Variations',
  theme: 'volcan',
  skills: VARIATIONS_SKILLS,
  creatures: [
    creature('montedescend', 'Montedescend', 'Une chèvre des montagnes : elle sait à chaque pas si le chemin monte ou descend.', ['2nde-sens-affine', '2nde-comparer-tableau'], 'bete', 25, '↗'),
    creature('sommital', 'Sommital', 'Un oiseau qui se perche toujours sur le point le plus haut du tableau de variations.', ['2nde-extremum-tableau', '2nde-extremum-affine'], 'oiseau', 5, 'max'),
    creature('valleon', 'Valléon', 'Un blob qui roule jusqu’au creux le plus bas de chaque parabole.', ['2nde-extremum-carre', '2nde-variations-carre'], 'blob', 35, 'min'),
    creature('ordonnet', 'Ordonnet', 'Un esprit des cimes qui range les images dans l’ordre, ou dans l’ordre inverse.', ['2nde-comparer-tableau', '2nde-variations-carre', '2nde-extremum-affine'], 'spectre', 15, '↘'),
  ],
  boss: creature('extremon', 'Extrémon, gardien des monts', 'Le gardien des monts. Il règne sur tous les maximums et minimums de la région.', VARIATIONS_SKILLS.map((s) => s.id), 'golem', 10, '⇅'),
  guide: [
    'Voici les Monts des Variations : ça monte, ça descend, et il faut savoir où.',
    'Tableaux de variations, maximums et minimums : les créatures d’ici adorent les sommets.',
  ],
};
