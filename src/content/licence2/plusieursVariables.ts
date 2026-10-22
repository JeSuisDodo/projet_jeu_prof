import { PLUSIEURS_VARIABLES_SKILLS } from '../../exercises/licence2/plusieursVariables';
import type { ChapterDef } from '../types';
import { bossOf, creature } from './creature';

export const PLUSIEURS_VARIABLES: ChapterDef = {
  id: 'l2-plusieurs-variables',
  title: 'Fonctions de plusieurs variables',
  region: 'Monts des Gradients',
  theme: 'neige',
  terrain: 'montagne',
  skills: PLUSIEURS_VARIABLES_SKILLS,
  creatures: [
    creature('l2-partiellou', 'Partiellou', 'Un bouquetin qui ne grimpe que dans une direction à la fois.', ['l2-derivee-partielle', 'l2-gradient'], { shape: 'bete', hue: 200, symbol: '∂' }),
    creature('l2-gradiflocon', 'Gradiflocon', 'Un flocon qui tombe toujours dans le sens de la plus forte pente.', ['l2-gradient', 'l2-derivee-directionnelle'], { shape: 'oiseau', hue: 190, symbol: '∇' }),
    creature('l2-cricrit', 'Cricrit', 'Un insecte qui s’arrête là où le gradient s’annule.', ['l2-point-critique', 'l2-derivee-partielle'], { shape: 'insecte', hue: 210, symbol: '∇0' }),
    creature('l2-selleron', 'Selleron', 'Un golem rare en forme de col : un minimum d’un côté, un maximum de l’autre.', ['l2-nature-point-critique', 'l2-point-critique', 'l2-derivee-directionnelle'], { shape: 'golem', hue: 220, symbol: '∂²' }),
  ],
  boss: bossOf('l2-hessior', 'Hessior, gardien des monts', 'Il lit la courbure des montagnes dans sa matrice hessienne.', PLUSIEURS_VARIABLES_SKILLS, { shape: 'golem', hue: 205, symbol: 'H' }),
  guide: ['Les Monts des Gradients ont des pentes dans toutes les directions.', 'Un extremum local d’une fonction différentiable sur un ouvert est un point critique : $\\nabla f = 0$.'],
};
