import { PARAMETRIQUES_SKILLS } from '../../exercises/terminale/espace';
import type { ChapterDef } from '../types';
import { bossOf, creature } from './creature';

export const PARAMETRIQUES: ChapterDef = {
  id: 'tle-representations-parametriques',
  title: 'Représentations paramétriques et équations cartésiennes',
  region: 'Ciel des Plans',
  theme: 'nuit',
  skills: PARAMETRIQUES_SKILLS,
  creatures: [
    creature('tle-parametrix', 'Paramétrix', 'Une comète qui avance à chaque valeur du paramètre t.', ['tle-representation-parametrique', 'tle-point-plan'], { shape: 'spectre', hue: 250, symbol: 't' }),
    creature('tle-planuit', 'Planuit', 'Une raie qui plane le long d’un plan de lumière.', ['tle-point-plan', 'tle-intersection-droite-plan'], { shape: 'poisson', hue: 240, symbol: 'P' }),
    creature('tle-secantin', 'Sécantin', 'Un hibou qui sait où une droite traverse un plan.', ['tle-intersection-droite-plan', 'tle-position-droite-plan'], { shape: 'oiseau', hue: 270, symbol: '∩' }),
    creature('tle-noncopla', 'Noncopla', 'Une luciole qui sait quand deux droites ne se croiseront jamais.', ['tle-position-droites', 'tle-position-droite-plan'], { shape: 'insecte', hue: 60, symbol: '∥' }),
  ],
  boss: bossOf('tle-cartesior', 'Cartésior, gardien du ciel', 'Il a tracé chaque plan du ciel avec une équation.', PARAMETRIQUES_SKILLS, { shape: 'golem', hue: 255, symbol: 'P:' }),
  guide: [
    'Dans le Ciel des Plans, les droites sont des étoiles filantes et les plans de grandes nappes de lumière.',
    'Une droite se décrit par un point et un vecteur directeur, un plan par une équation $ax + by + cz + d = 0$.',
  ],
};
