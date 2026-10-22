import { ANALYSE_COMPLEXE_SKILLS } from '../../exercises/licence3/analyseComplexe';
import { bossOf, creature } from '../terminale/creature';
import type { ChapterDef } from '../types';

export const ANALYSE_COMPLEXE: ChapterDef = {
  id: 'l3-analyse-complexe',
  title: 'Analyse complexe',
  region: 'Côte des Résidus',
  theme: 'plage',
  terrain: 'cote',
  skills: ANALYSE_COMPLEXE_SKILLS,
  creatures: [
    creature('l3-holomorphin', 'Holomorphin', 'Un dauphin parfaitement lisse : il vérifie Cauchy-Riemann à chaque saut.', ['l3-holomorphie'], { shape: 'poisson', hue: 190, symbol: '∂' }),
    creature('l3-rayonne', 'Rayonne', 'Une mouette qui ne s’éloigne jamais au-delà de son rayon de convergence.', ['l3-rayon-convergence'], { shape: 'oiseau', hue: 180, symbol: 'R' }),
    creature('l3-residou', 'Résidou', 'Un coquillage qui garde ce qui reste quand on fait le tour d’un pôle.', ['l3-residu-pole-simple'], { shape: 'blob', hue: 170, symbol: 'Res' }),
    creature('l3-zerotine', 'Zérotine', 'Une algue qui s’annule à l’ordre exact de sa première dérivée non nulle.', ['l3-ordre-zero', 'l3-rayon-convergence'], { shape: 'plante', hue: 160, symbol: '0' }),
    creature('l3-lacetor', 'Lacetor', 'Un spectre qui tourne en rond sur un cercle et additionne les résidus.', ['l3-theoreme-residus', 'l3-residu-pole-multiple'], { shape: 'spectre', hue: 200, symbol: '∮' }),
  ],
  boss: bossOf('l3-meromorphe', 'Méromorphe, gardienne de la côte', 'Holomorphe partout, sauf en quelques pôles isolés où elle cache ses résidus.', ANALYSE_COMPLEXE_SKILLS, { shape: 'poisson', hue: 185, symbol: '∮' }),
  guide: [
    'Sur la Côte des Résidus, chaque intégrale sur un lacet se réduit à une somme de résidus.',
    '$\\oint f = 2i\\pi \\sum \\operatorname{Res}$ sur les pôles entourés.',
  ],
};
