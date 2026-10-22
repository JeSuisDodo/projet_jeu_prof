import { VOLUMES_SKILLS } from '../../exercises/cinquieme/volumes';
import type { ChapterDef } from '../types';
import { creature } from './outils';

export const VOLUMES: ChapterDef = {
  id: '5e-volumes',
  title: 'Volumes',
  region: 'Lagune des Volumes',
  theme: 'plage',
  terrain: 'lac',
  skills: VOLUMES_SKILLS,
  creatures: [
    creature('pavou', 'Pavou', 'Un blob en forme de pavé qui multiplie ses trois dimensions.', ['5e-volume-pave'], 'blob', 200, 'V'),
    creature('prismo', 'Prismo', 'Un poisson prismatique : aire de la base × hauteur.', ['5e-volume-prisme'], 'poisson', 180, '▲'),
    creature('cylindrelle', 'Cylindrelle', 'Une plante au tronc parfaitement cylindrique.', ['5e-volume-cylindre'], 'plante', 140, 'πh'),
    creature('litron', 'Litron', 'Une bête qui jongle entre litres, dm³ et cm³.', ['5e-conversion-volumes', '5e-contenance'], 'bete', 210, 'L'),
    creature('aquarion', 'Aquarion', 'Un spectre d’eau qui sait combien de litres contient chaque bassin.', ['5e-contenance', '5e-volume-pave'], 'spectre', 190, 'cm³'),
  ],
  boss: creature('volumor', 'Volumor, gardien de la lagune', 'Le gardien de la lagune remplit et vide les bassins sans jamais déborder.', VOLUMES_SKILLS.map((s) => s.id), 'golem', 195, 'V'),
  guide: [
    'La Lagune des Volumes : bassins, prismes et cylindres remplis d’eau.',
    'Volumes et contenances : combien de litres peux-tu y verser ?',
  ],
};
