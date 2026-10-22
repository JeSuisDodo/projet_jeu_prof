import { INTEGRALES_DOUBLES_SKILLS } from '../../exercises/licence2/integralesDoubles';
import type { ChapterDef } from '../types';
import { bossOf, creature } from './creature';

export const INTEGRALES_DOUBLES: ChapterDef = {
  id: 'l2-integrales-doubles',
  title: 'Intégrales doubles',
  region: 'Côte des Volumes',
  theme: 'prairie',
  terrain: 'cote',
  skills: INTEGRALES_DOUBLES_SKILLS,
  creatures: [
    creature('l2-fubinou', 'Fubinou', 'Un crabe qui coupe tout en tranches, d’abord en x, puis en y.', ['l2-double-rectangle', 'l2-double-polynome'], { shape: 'insecte', hue: 90, symbol: '∬' }),
    creature('l2-triangulon', 'Triangulon', 'Il ne se plaît que sur les plages triangulaires.', ['l2-double-triangle', 'l2-double-polynome'], { shape: 'bete', hue: 70, symbol: '△' }),
    creature('l2-polairon', 'Polairon', 'Une méduse qui ondule en cercles : r dr dθ.', ['l2-coordonnees-polaires', 'l2-double-rectangle'], { shape: 'poisson', hue: 180, symbol: 'r' }),
    creature('l2-jacobulle', 'Jacobulle', 'Une bulle rare qui se déforme sans perdre le compte de son aire.', ['l2-jacobien', 'l2-coordonnees-polaires', 'l2-double-triangle'], { shape: 'blob', hue: 160, symbol: 'J' }),
  ],
  boss: bossOf('l2-volumine', 'Volumine, gardienne de la côte', 'Elle mesure le volume sous chaque dune.', INTEGRALES_DOUBLES_SKILLS, { shape: 'golem', hue: 100, symbol: '∬' }),
  guide: ['Sur la Côte des Volumes, on mesure le sable sous chaque dune en le découpant en tranches.', 'Fubini : sur un rectangle, on intègre en $x$ puis en $y$ (ou l’inverse).'],
};
