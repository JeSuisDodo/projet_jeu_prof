import { TRANSFORMATIONS_SKILLS } from '../../exercises/quatrieme/transformations';
import type { ChapterDef } from '../types';
import { bossOf, creature } from './creature';

export const TRANSFORMATIONS: ChapterDef = {
  id: '4e-transformations',
  title: 'Transformations du plan',
  region: 'Lac des Miroirs',
  theme: 'cristal',
  terrain: 'lac',
  skills: TRANSFORMATIONS_SKILLS,
  creatures: [
    creature('4e-glissou', 'Glissou', 'Il glisse sur la glace sans jamais tourner.', ['4e-translation'], { shape: 'blob', hue: 260, symbol: '→' }),
    creature('4e-reflet', 'Reflet', 'Son double tourne autour d’un point pour lui faire face.', ['4e-symetrie-centrale'], { shape: 'spectre', hue: 280, symbol: 'O' }),
    creature('4e-tourbillon', 'Tourbillon', 'Il tourne d’un quart de tour à chaque pas.', ['4e-rotation'], { shape: 'insecte', hue: 300, symbol: '↻' }),
    creature('4e-isometrix', 'Isométrix', 'Il reconnaît d’un coup d’œil la transformation qui a déplacé une figure.', ['4e-reconnaitre-transformation', '4e-translation'], { shape: 'oiseau', hue: 250, symbol: '≅' }),
  ],
  boss: bossOf('4e-kaleidos', 'Kaléidos, gardienne du lac', 'Dans son lac, chaque figure a son image par une transformation.', TRANSFORMATIONS_SKILLS, { shape: 'golem', hue: 270, symbol: '↻→' }),
  guide: [
    'Le Lac des Miroirs déplace les figures sans jamais les déformer.',
    'Translation, rotation, symétries : les longueurs et les angles sont conservés.',
  ],
};
