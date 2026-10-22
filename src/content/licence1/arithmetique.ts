import { ARITHMETIQUE_SKILLS } from '../../exercises/licence1/arithmetique';
import type { ChapterDef } from '../types';
import { bossOf, creature } from './creature';

export const ARITHMETIQUE: ChapterDef = {
  id: 'l1-arithmetique',
  title: 'Arithmétique dans ℤ',
  region: 'Désert des Diviseurs',
  theme: 'desert',
  terrain: 'desert',
  skills: ARITHMETIQUE_SKILLS,
  creatures: [
    creature('l1-euclidune', 'Euclidune', 'Une dune qui se divise sans cesse jusqu’à ne laisser qu’un reste.', ['l1-pgcd', 'l1-diviseurs'], { shape: 'blob', hue: 40, symbol: 'pgcd' }),
    creature('l1-congruor', 'Congruor', 'Un scarabée qui tourne en rond : après n pas, il revient à son point de départ.', ['l1-congruences', 'l1-pgcd'], { shape: 'insecte', hue: 30, symbol: '≡' }),
    creature('l1-bezoutard', 'Bézoutard', 'Un fennec qui retrouve toujours deux entiers u et v cachés sous le sable.', ['l1-bezout', 'l1-inverse-modulaire'], { shape: 'bete', hue: 25, symbol: 'uv' }),
    creature('l1-premirage', 'Premirage', 'Un mirage fait de nombres premiers : on ne peut pas le décomposer.', ['l1-valuation', 'l1-diviseurs'], { shape: 'spectre', hue: 50, symbol: 'p' }),
  ],
  boss: bossOf('l1-modulon', 'Modulon, gardien du désert', 'Un colosse de grès gravé de restes et de congruences.', ARITHMETIQUE_SKILLS, { shape: 'golem', hue: 35, symbol: 'ℤ/n' }),
  guide: [
    'Le désert est fait de grains entiers : ici, on divise, on factorise et on compte les restes.',
    'L’algorithme d’Euclide donne le PGCD, et en remontant les calculs, les coefficients de Bézout.',
  ],
};
