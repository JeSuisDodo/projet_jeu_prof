import { ANGLES_SKILLS } from '../../exercises/cinquieme/angles';
import type { ChapterDef } from '../types';
import { creature } from './outils';

export const ANGLES: ChapterDef = {
  id: '5e-angles',
  title: 'Angles et parallélisme',
  region: 'Lac des Parallèles',
  theme: 'prairie',
  terrain: 'lac',
  skills: ANGLES_SKILLS,
  creatures: [
    creature('complemou', 'Complémou', 'Un blob qui complète chaque angle jusqu’à 90° ou 180°.', ['5e-complementaire-supplementaire'], 'blob', 140, '90°'),
    creature('sommetin', 'Sommetin', 'Un oiseau en croix : ses angles opposés par le sommet sont jumeaux.', ['5e-angles-opposes'], 'oiseau', 160, 'X'),
    creature('alternelle', 'Alternelle', 'Un poisson qui nage entre deux droites parallèles et repère les angles alternes-internes.', ['5e-angles-paralleles'], 'poisson', 180, 'Z'),
    creature('correspondor', 'Correspondor', 'Une bête qui prouve que deux droites sont parallèles grâce aux angles.', ['5e-prouver-paralleles', '5e-angles-paralleles'], 'bete', 110, '//'),
  ],
  boss: creature('parallelion', 'Parallélion, gardien du lac', 'Le gardien du lac trace des droites qui ne se croisent jamais.', ANGLES_SKILLS.map((s) => s.id), 'golem', 150, '//'),
  guide: [
    'Le Lac des Parallèles est traversé de droites qui ne se croisent jamais.',
    'Alternes-internes, correspondants : les angles te diront tout.',
  ],
};
