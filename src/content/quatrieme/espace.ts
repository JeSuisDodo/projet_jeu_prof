import { ESPACE_SKILLS } from '../../exercises/quatrieme/espace';
import type { ChapterDef } from '../types';
import { bossOf, creature } from './creature';

export const ESPACE: ChapterDef = {
  id: '4e-espace',
  title: 'Pyramides et cônes',
  region: 'Désert des Pyramides',
  theme: 'desert',
  terrain: 'desert',
  skills: ESPACE_SKILLS,
  creatures: [
    creature('4e-sommeton', 'Sommeton', 'Il compte les faces, les arêtes et les sommets de chaque pyramide.', ['4e-decrire-pyramide'], { shape: 'insecte', hue: 45, symbol: '△' }),
    creature('4e-litron', 'Litron', 'Un scarabée qui transporte des litres d’eau dans ses cm³.', ['4e-conversion-volumes'], { shape: 'bete', hue: 35, symbol: 'L' }),
    creature('4e-pyramidon', 'Pyramidon', 'Une petite pyramide qui connaît son volume par cœur.', ['4e-volume-pyramide'], { shape: 'golem', hue: 40, symbol: 'V' }),
    creature('4e-conifere', 'Conifère', 'Un cactus en forme de cône, rempli de $\\pi$.', ['4e-volume-cone', '4e-volume-pyramide'], { shape: 'plante', hue: 90, symbol: 'π' }),
  ],
  boss: bossOf('4e-pharaonix', 'Pharaonix, gardien du désert', 'Il garde la plus grande pyramide et divise toujours par 3.', ESPACE_SKILLS, { shape: 'golem', hue: 50, symbol: '⅓' }),
  guide: [
    'Le Désert des Pyramides cache des solides de toutes tailles.',
    'Volume d’une pyramide ou d’un cône : $V = \\dfrac{\\text{aire de la base} \\times \\text{hauteur}}{3}$.',
  ],
};
