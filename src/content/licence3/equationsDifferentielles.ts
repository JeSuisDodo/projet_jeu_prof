import { EQUATIONS_DIFFERENTIELLES_SKILLS } from '../../exercises/licence3/equationsDifferentielles';
import { bossOf, creature } from '../terminale/creature';
import type { ChapterDef } from '../types';

export const EQUATIONS_DIFFERENTIELLES: ChapterDef = {
  id: 'l3-equations-differentielles',
  title: 'Équations différentielles',
  region: 'Marais de Cauchy',
  theme: 'marais',
  terrain: 'marais',
  skills: EQUATIONS_DIFFERENTIELLES_SKILLS,
  creatures: [
    creature('l3-caracterine', 'Caractérine', 'Un poisson du marais qui résout son équation caractéristique en nageant.', ['l3-equation-caracteristique'], { shape: 'poisson', hue: 100, symbol: 'r²' }),
    creature('l3-affinelle', 'Affinelle', 'Une bulle qui finit toujours par se stabiliser à l’équilibre.', ['l3-ordre1-affine', 'l3-solution-particuliere'], { shape: 'blob', hue: 90, symbol: 'y′' }),
    creature('l3-cauchyon', 'Cauchyon', 'Une bête qui ne choisit son chemin qu’une fois sa position et sa vitesse données.', ['l3-probleme-cauchy-ordre2', 'l3-equation-caracteristique'], { shape: 'bete', hue: 120, symbol: 'y₀' }),
    creature('l3-phasmo', 'Phasmo', 'Un insecte qui dessine des portraits de phase autour de l’origine.', ['l3-systeme-lineaire'], { shape: 'insecte', hue: 80, symbol: 'X′' }),
    creature('l3-explosaure', 'Explosaure', 'Un golem qui grandit si vite qu’il atteint l’infini en un temps fini.', ['l3-temps-explosion', 'l3-solution-particuliere'], { shape: 'golem', hue: 60, symbol: 'T' }),
  ],
  boss: bossOf('l3-flotmarais', 'Flotmarais, gardien du marais', 'Il fait couler chaque solution le long de son flot, sans jamais en croiser une autre.', EQUATIONS_DIFFERENTIELLES_SKILLS, { shape: 'spectre', hue: 110, symbol: 'Φ' }),
  guide: [
    'Dans le Marais de Cauchy, chaque condition initiale trace un unique chemin.',
    'Pour $y\'\' + py\' + qy = 0$, commence toujours par l’équation caractéristique.',
  ],
};
