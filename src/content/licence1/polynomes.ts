import { POLYNOMES_SKILLS } from '../../exercises/licence1/polynomes';
import type { ChapterDef } from '../types';
import { bossOf, creature } from './creature';

export const POLYNOMES: ChapterDef = {
  id: 'l1-polynomes',
  title: 'Polynômes',
  region: 'Volcan des Racines',
  theme: 'volcan',
  terrain: 'montagne',
  skills: POLYNOMES_SKILLS,
  creatures: [
    creature('l1-divisaure', 'Divisaure', 'Un petit dinosaure qui pose la division euclidienne comme à l’école.', ['l1-division-euclidienne', 'l1-degre-coefficient'], { shape: 'bete', hue: 10, symbol: 'R' }),
    creature('l1-racinelle', 'Racinelle', 'Une plante de lave dont les racines sont les zéros du polynôme.', ['l1-racines-polynome', 'l1-division-euclidienne'], { shape: 'plante', hue: 20, symbol: 'P(a)' }),
    creature('l1-multiplix', 'Multiplix', 'Une salamandre qui s’enroule plusieurs fois autour de la même racine.', ['l1-multiplicite', 'l1-relations-coefficients-racines'], { shape: 'spectre', hue: 5, symbol: '×m' }),
    creature('l1-tayloreille', 'Tayloreille', 'Un oiseau de braise qui réécrit tout polynôme autour d’un point.', ['l1-formule-taylor-polynome', 'l1-relations-coefficients-racines'], { shape: 'oiseau', hue: 30, symbol: 'P⁽ᵏ⁾' }),
  ],
  boss: bossOf('l1-polynomax', 'Polynomax, gardien du volcan', 'Son magma prend la forme de polynômes de tous degrés.', POLYNOMES_SKILLS, { shape: 'golem', hue: 15, symbol: 'deg' }),
  guide: [
    'Au fond du cratère bouillonnent des polynômes : trouve leurs racines pour avancer.',
    'Le reste de la division de $P$ par $X - a$ est $P(a)$.',
  ],
};
