import { SYMETRIE_SKILLS } from '../../exercises/cinquieme/symetrie';
import type { ChapterDef } from '../types';
import { creature } from './outils';

export const SYMETRIE: ChapterDef = {
  id: '5e-symetrie',
  title: 'Symétrie centrale',
  region: 'Archipel du Demi-Tour',
  theme: 'cristal',
  terrain: 'archipel',
  skills: SYMETRIE_SKILLS,
  creatures: [
    creature('demitour', 'Demitour', 'Un blob qui fait un demi-tour sur lui-même… et retombe identique.', ['5e-symetrique-point'], 'blob', 300, '↻'),
    creature('centrelle', 'Centrelle', 'Une méduse posée au milieu exact de chaque segment.', ['5e-centre-symetrie'], 'poisson', 270, 'I'),
    creature('lettrix', 'Lettrix', 'Un spectre qui ne garde que les lettres ayant un centre de symétrie : H, N, S, Z…', ['5e-figure-centre'], 'spectre', 250, 'S'),
    creature('conservor', 'Conservor', 'Une bête de cristal qui conserve longueurs, angles et aires.', ['5e-proprietes-symetrie', '5e-symetrique-point'], 'bete', 290, '='),
  ],
  boss: creature('symetron', 'Symétron, gardien de l’archipel', 'Le gardien de l’archipel est identique à lui-même après un demi-tour.', SYMETRIE_SKILLS.map((s) => s.id), 'golem', 280, '↻'),
  guide: [
    'L’Archipel du Demi-Tour : chaque île a son reflet de l’autre côté du centre.',
    'Fais un demi-tour autour d’un point : tout se conserve.',
  ],
};
