import { THALES_SKILLS } from '../../exercises/quatrieme/thales';
import type { ChapterDef } from '../types';
import { bossOf, creature } from './creature';

export const THALES: ChapterDef = {
  id: '4e-thales',
  title: 'Triangles semblables et théorème de Thalès',
  region: 'Archipel de Thalès',
  theme: 'plage',
  terrain: 'archipel',
  skills: THALES_SKILLS,
  creatures: [
    creature('4e-parallelot', 'Parallélot', 'Il nage toujours parallèlement au rivage.', ['4e-thales-egalite'], { shape: 'poisson', hue: 190, symbol: '//' }),
    creature('4e-zoomouette', 'Zoomouette', 'Elle agrandit et réduit tout ce qu’elle survole.', ['4e-agrandissement-reduction'], { shape: 'oiseau', hue: 200, symbol: '×k' }),
    creature('4e-semblabe', 'Semblabe', 'Deux crabes de tailles différentes, mais de mêmes proportions.', ['4e-coefficient-semblables'], { shape: 'bete', hue: 15, symbol: '∼' }),
    creature('4e-milesien', 'Milésien', 'Il mesure la hauteur des phares avec leur ombre, comme le savant grec.', ['4e-thales-longueur', '4e-thales-egalite'], { shape: 'spectre', hue: 210, symbol: 'k' }),
  ],
  boss: bossOf('4e-thalassos', 'Thalassos, gardien de l’archipel', 'Ses îles sont emboîtées comme des triangles en configuration de Thalès.', THALES_SKILLS, { shape: 'golem', hue: 195, symbol: '∥' }),
  guide: [
    'L’Archipel de Thalès porte le nom d’un savant grec qui aurait mesuré la hauteur d’une pyramide grâce à son ombre.',
    'Si $(MN)$ est parallèle à $(BC)$, les triangles $AMN$ et $ABC$ ont des côtés proportionnels.',
  ],
};
