import { DROITES_SKILLS } from '../../exercises/sixieme/droites';
import type { ChapterDef } from '../types';
import { creature } from './outils';

export const DROITES: ChapterDef = {
  id: '6e-droites',
  title: 'Droites, segments et cercles',
  region: 'Archipel des Droites',
  theme: 'nuit',
  terrain: 'archipel',
  skills: DROITES_SKILLS,
  creatures: [
    creature('segmentin', 'Segmentin', 'Un ver de lumière aux deux extrémités bien nettes, noté entre crochets.', ['6e-notations', '6e-points-alignes'], 'insecte', 60, '[ ]'),
    creature('milieuse', 'Milieuse', 'Une luciole qui se pose toujours pile au milieu des segments.', ['6e-milieu', '6e-points-alignes'], 'insecte', 80, 'I'),
    creature('perpendicu', 'Perpendicu', 'Un oiseau de nuit aux ailes parfaitement à angle droit.', ['6e-paralleles-perpendiculaires'], 'oiseau', 230, '⊥'),
    creature('cerclou', 'Cerclou', 'Un blob parfaitement rond, à égale distance de son centre partout.', ['6e-cercle', '6e-vocabulaire-cercle'], 'blob', 260, '○'),
    creature('compassor', 'Compassor', 'Un spectre étoilé, rare, qui trace des cercles dans le ciel.', ['6e-cercle', '6e-paralleles-perpendiculaires', '6e-notations'], 'spectre', 280, 'r'),
  ],
  boss: creature('rectiligne', 'Rectiligne, gardien de l’archipel', 'Le gardien de l’archipel, qui relie les îles par des droites parfaites.', DROITES_SKILLS.map((s) => s.id), 'golem', 240, '∥'),
  guide: [
    'L’Archipel des Droites est relié par de longues passerelles parfaitement droites.',
    'Droite, segment ou demi-droite : regarde bien les parenthèses et les crochets.',
  ],
};
