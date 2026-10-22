import { ANGLES_SKILLS } from '../../exercises/sixieme/angles';
import type { ChapterDef } from '../types';
import { creature } from './outils';

export const ANGLES: ChapterDef = {
  id: '6e-angles',
  title: 'Angles',
  region: 'Monts des Angles',
  theme: 'neige',
  terrain: 'montagne',
  skills: ANGLES_SKILLS,
  creatures: [
    creature('aiguillon', 'Aiguillon', 'Un petit oiseau au bec aigu, toujours moins de 90 degrés.', ['6e-nature-angle'], 'oiseau', 200, '∠'),
    creature('sommital', 'Sommital', 'Une bête des neiges qui se tient toujours au sommet de l’angle.', ['6e-notation-angle', '6e-nature-angle'], 'bete', 210, '^'),
    creature('adjacent', 'Adjacent', 'Deux flocons collés qui partagent un même côté.', ['6e-angles-adjacents'], 'insecte', 190, '+°'),
    creature('horlogel', 'Horlogel', 'Un golem de glace dont les aiguilles marquent des fractions de tour.', ['6e-fraction-tour', '6e-angles-adjacents'], 'golem', 220, '12'),
    creature('bissectrix', 'Bissectrix', 'Un esprit des cimes, rare, qui coupe chaque angle en deux parts égales.', ['6e-bissectrice', '6e-fraction-tour', '6e-notation-angle'], 'spectre', 180, '½∠'),
  ],
  boss: creature('rapporteur', 'Rapporteur, gardien des monts', 'Le gardien des monts, en forme de demi-disque gradué de 0 à 180.', ANGLES_SKILLS.map((s) => s.id), 'golem', 205, '180'),
  guide: [
    'Dans les Monts des Angles, les pentes ont toutes une mesure précise.',
    'Aigu, droit, obtus, plat : mesure en degrés, et n’oublie pas le sommet !',
  ],
};
