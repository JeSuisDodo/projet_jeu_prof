import { ESPACE_3E } from '../../exercises/troisieme/espace';
import type { ChapterDef } from '../types';
import { creature } from './outils';

export const ESPACE: ChapterDef = {
  id: '3e-espace',
  title: 'Géométrie dans l’espace',
  region: 'Cratère des Solides',
  theme: 'volcan',
  terrain: 'montagne',
  skills: ESPACE_3E,
  creatures: [
    creature('cubinot', 'Cubinot', 'Un golem cubique qui connaît son volume au cm³ près.', ['3e-volume'], 'golem', 20, 'V'),
    creature('litrou', 'Litrou', 'Un blob liquide qui passe des litres aux cm³ sans en perdre une goutte.', ['3e-conversion-volume'], 'blob', 200, 'L'),
    creature('trancheur', 'Trancheur', 'Une bête qui découpe les solides et observe leurs sections.', ['3e-section', '3e-volume'], 'bete', 5, '∕'),
    creature('conifeu', 'Conifeu', 'Une plante en forme de cône volcanique.', ['3e-volume', '3e-conversion-volume'], 'plante', 25, '⅓'),
    creature('spherolithe', 'Sphérolithe', 'Une boule de lave parfaitement sphérique.', ['3e-sphere', '3e-section'], 'spectre', 15, 'πr²'),
  ],
  boss: creature('magmapyramide', 'Magmapyramide, gardienne du cratère', 'La gardienne du cratère, pyramide de basalte au volume colossal.', ESPACE_3E.map((s) => s.id), 'golem', 0, 'V'),
  guide: ['Le Cratère des Solides fume de cubes, de cônes et de sphères.', 'Volumes, sections et conversions : prends tes mesures !'],
};
