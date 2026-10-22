import type { Rng } from '../rng';
import type { Level, Skill } from '../types';
import { dec, decimal, fixedChoice, nearTie, round, skill } from './outils';

/** 3e : théorème de Pythagore et sa réciproque (révisions du brevet). */

const TRIPLES: [number, number, number][] = [
  [3, 4, 5],
  [5, 12, 13],
  [6, 8, 10],
  [8, 15, 17],
  [7, 24, 25],
  [20, 21, 29],
  [9, 12, 15],
  [12, 16, 20],
];

/** Côtés d'un triangle rectangle : exacts aux niveaux 1-2 (triplets, éventuellement décimaux), quelconques au niveau 3. */
function rightTriangle(rng: Rng, level: Level): { a: number; b: number; c: number; exact: boolean } {
  if (level < 3) {
    const [a, b, c] = rng.pick(level === 1 ? TRIPLES.slice(0, 4) : TRIPLES);
    const k = level === 1 ? rng.int(1, 3) : rng.pick([0.5, 1, 1.5, 2, 3]);
    return { a: a * k, b: b * k, c: c * k, exact: true };
  }
  let a: number;
  let b: number;
  do {
    a = rng.int(2, 15);
    b = rng.int(2, 15);
  } while (Number.isInteger(Math.hypot(a, b)) || nearTie(Math.hypot(a, b), 1));
  return { a, b, c: Math.hypot(a, b), exact: false };
}

const NAMES = [
  ['A', 'B', 'C'],
  ['E', 'F', 'G'],
  ['R', 'S', 'T'],
  ['K', 'L', 'M'],
];

const hypotenuse = skill('3e-pythagore-hypotenuse', 'Calculer l’hypoténuse', (rng, level) => {
  const [R, P, Q] = rng.pick(NAMES);
  const { a, b, c, exact } = rightTriangle(rng, level);
  const value = exact ? c : round(c, 1);
  return {
    prompt: `Le triangle $${R}${P}${Q}$ est rectangle en $${R}$, avec $${R}${P} = ${dec(a)}$ cm et $${R}${Q} = ${dec(b)}$ cm. Calcule $${P}${Q}$, en cm${exact ? '' : ', arrondie au dixième'}.`,
    answer: decimal(value),
    hint: `L'hypoténuse est le côté opposé à l'angle droit : $${P}${Q}^2 = ${R}${P}^2 + ${R}${Q}^2$.`,
    correction: [
      `D'après le théorème de Pythagore : $${P}${Q}^2 = ${dec(a)}^2 + ${dec(b)}^2 = ${dec(a * a)} + ${dec(b * b)} = ${dec(a * a + b * b)}$.`,
      `$${P}${Q} = \\sqrt{${dec(a * a + b * b)}} ${exact ? '=' : '\\approx'} ${dec(value)}$ cm`,
    ],
  };
});

const cote = skill('3e-pythagore-cote', 'Calculer un côté de l’angle droit', (rng, level) => {
  const [R, P, Q] = rng.pick(NAMES);
  let a: number;
  let c: number;
  let exact = true;
  if (level < 3) {
    const t = rightTriangle(rng, level);
    a = t.a;
    c = t.c;
  } else {
    do {
      c = rng.int(8, 20);
      a = rng.int(3, c - 2);
    } while (Number.isInteger(Math.sqrt(c * c - a * a)) || nearTie(Math.sqrt(c * c - a * a), 1));
    exact = false;
  }
  const b = Math.sqrt(c * c - a * a);
  const value = exact ? round(b, 6) : round(b, 1);
  return {
    prompt: `Le triangle $${R}${P}${Q}$ est rectangle en $${R}$, avec $${P}${Q} = ${dec(c)}$ cm et $${R}${P} = ${dec(a)}$ cm. Calcule $${R}${Q}$, en cm${exact ? '' : ', arrondie au dixième'}.`,
    answer: decimal(value),
    hint: `$${P}${Q}$ est l'hypoténuse : $${R}${Q}^2 = ${P}${Q}^2 - ${R}${P}^2$.`,
    correction: [
      `D'après le théorème de Pythagore : $${P}${Q}^2 = ${R}${P}^2 + ${R}${Q}^2$, donc $${R}${Q}^2 = ${dec(c)}^2 - ${dec(a)}^2 = ${dec(c * c - a * a)}$.`,
      `$${R}${Q} = \\sqrt{${dec(c * c - a * a)}} ${exact ? '=' : '\\approx'} ${dec(value)}$ cm`,
    ],
  };
});

const reciproque = skill('3e-pythagore-reciproque', 'Démontrer qu’un triangle est rectangle (ou non)', (rng, level) => {
  const [R, P, Q] = rng.pick(NAMES);
  let { a, b, c } = rightTriangle(rng, level === 3 ? 2 : level);
  const right = rng.next() < 0.5;
  if (!right) c += level === 1 ? 1 : rng.pick([1, -1, 0.5]);
  if (!right && level === 3) [a, b] = [a + 1, b];
  const sides = rng.shuffle([
    [`${R}${P}`, a],
    [`${R}${Q}`, b],
    [`${P}${Q}`, c],
  ] as [string, number][]);
  const longest = sides.reduce((m, s) => (s[1] > m[1] ? s : m));
  const others = sides.filter((s) => s !== longest);
  const sumSq = others[0][1] ** 2 + others[1][1] ** 2;
  const isRight = Math.abs(sumSq - longest[1] ** 2) < 1e-9;
  return {
    prompt: `Le triangle $${R}${P}${Q}$ a pour côtés ${sides.map(([n, v]) => `$${n} = ${dec(v)}$ cm`).join(', ')}. Est-il rectangle ?`,
    answer: fixedChoice(['Oui', 'Non'], isRight ? 0 : 1),
    hint: 'Compare le carré du plus grand côté avec la somme des carrés des deux autres.',
    correction: [
      `Plus grand côté : $${longest[0]}$. $${longest[0]}^2 = ${dec(longest[1] ** 2)}$.`,
      `$${others[0][0]}^2 + ${others[1][0]}^2 = ${dec(others[0][1] ** 2)} + ${dec(others[1][1] ** 2)} = ${dec(sumSq)}$.`,
      isRight
        ? `Les deux résultats sont égaux : d'après la réciproque du théorème de Pythagore, le triangle est rectangle.`
        : `Les deux résultats sont différents : d'après le théorème de Pythagore, le triangle n'est pas rectangle.`,
    ],
  };
});

const probleme = skill('3e-pythagore-probleme', 'Utiliser Pythagore dans un problème', (rng, level) => {
  const { a, b, c, exact } = rightTriangle(rng, level);
  const kind = rng.pick(['echelle', 'diagonale', 'ecran'] as const);
  const v = exact ? c : round(c, 1);
  const end = exact ? '' : ' Arrondis au dixième.';
  const prompt =
    kind === 'echelle'
      ? `Une échelle est posée contre un mur vertical. Son pied est à $${dec(a)}$ m du mur et son sommet touche le mur à $${dec(b)}$ m du sol. Quelle est la longueur de l'échelle, en m ?${end}`
      : kind === 'diagonale'
        ? `Un terrain rectangulaire mesure $${dec(a)}$ m sur $${dec(b)}$ m. Quelle est la longueur de sa diagonale, en m ?${end}`
        : `Un écran rectangulaire mesure $${dec(a)}$ dm de large et $${dec(b)}$ dm de haut. Quelle est la longueur de sa diagonale, en dm ?${end}`;
  return {
    prompt,
    answer: decimal(v),
    hint: 'Repère le triangle rectangle caché dans la situation, puis applique le théorème de Pythagore.',
    correction: [`$d^2 = ${dec(a)}^2 + ${dec(b)}^2 = ${dec(a * a + b * b)}$`, `$d = \\sqrt{${dec(a * a + b * b)}} ${exact ? '=' : '\\approx'} ${dec(v)}$`],
  };
});

export const PYTHAGORE_3E: Skill[] = [hypotenuse, cote, reciproque, probleme];
