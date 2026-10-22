import type { Skill } from '../types';
import { dec, fixedChoice, numDec, round1, skill } from './util';

/** Chapitre « Théorème de Pythagore » (4e). */

const TRIPLES: [number, number, number][] = [
  [3, 4, 5],
  [5, 12, 13],
  [8, 15, 17],
  [7, 24, 25],
  [20, 21, 29],
  [9, 40, 41],
];

const NAMES = [
  ['A', 'B', 'C'],
  ['E', 'F', 'G'],
  ['R', 'S', 'T'],
  ['K', 'L', 'M'],
];

/** Côtés de l'angle droit a, b et hypoténuse c ; entiers au niveau 1-2, quelconques au niveau 3. */
function triangle(rng: { pick: <T>(x: readonly T[]) => T; int: (a: number, b: number) => number }, level: 1 | 2 | 3) {
  if (level === 3) {
    const a = rng.int(2, 15);
    const b = rng.int(2, 15);
    return { a, b, c: Math.sqrt(a * a + b * b), exact: false };
  }
  const [x, y, z] = rng.pick(level === 1 ? TRIPLES.slice(0, 2) : TRIPLES);
  const k = level === 1 ? rng.int(1, 3) : rng.pick([1, 1, 2, 0.5, 0.1]);
  return { a: x * k, b: y * k, c: z * k, exact: true };
}

const hypotenuse = skill('4e-hypotenuse', 'Calculer l’hypoténuse', (rng, level) => {
  const [P, Q, R] = rng.pick(NAMES);
  const t = triangle(rng, level);
  const a = round1(t.a);
  const b = round1(t.b);
  const c2 = Math.round((a * a + b * b) * 100) / 100;
  const value = t.exact ? Math.round(t.c * 10) / 10 : round1(Math.sqrt(c2));
  return {
    prompt: `Le triangle $${P}${Q}${R}$ est rectangle en $${P}$, avec $${P}${Q} = ${dec(a)}$ cm et $${P}${R} = ${dec(b)}$ cm. Calcule $${Q}${R}$, en cm${t.exact ? '' : ' (arrondi au dixième)'}.`,
    answer: numDec(value),
    hint: `L’hypoténuse est le côté opposé à l’angle droit : $${Q}${R}^2 = ${P}${Q}^2 + ${P}${R}^2$.`,
    correction: [
      `D’après le théorème de Pythagore, $${Q}${R}^2 = ${dec(a)}^2 + ${dec(b)}^2 = ${dec(Math.round(a * a * 100) / 100)} + ${dec(Math.round(b * b * 100) / 100)} = ${dec(c2)}$.`,
      t.exact ? `$${Q}${R} = \\sqrt{${dec(c2)}} = ${dec(value)}$ cm` : `$${Q}${R} = \\sqrt{${dec(c2)}} \\approx ${dec(value)}$ cm`,
    ],
  };
});

const cote = skill('4e-cote-angle-droit', 'Calculer un côté de l’angle droit', (rng, level) => {
  const [P, Q, R] = rng.pick(NAMES);
  let a: number;
  let c: number;
  let exact = true;
  if (level === 3) {
    a = rng.int(2, 12);
    c = a + rng.int(1, 8);
    exact = false;
  } else {
    const t = triangle(rng, level);
    a = round1(t.a);
    c = round1(t.c);
  }
  const b2 = Math.round((c * c - a * a) * 100) / 100;
  const b = round1(Math.sqrt(b2));
  return {
    prompt: `Le triangle $${P}${Q}${R}$ est rectangle en $${P}$, avec $${Q}${R} = ${dec(c)}$ cm et $${P}${Q} = ${dec(a)}$ cm. Calcule $${P}${R}$, en cm${exact ? '' : ' (arrondi au dixième)'}.`,
    answer: numDec(b),
    hint: `$${Q}${R}$ est l’hypoténuse : $${P}${R}^2 = ${Q}${R}^2 - ${P}${Q}^2$.`,
    correction: [
      `D’après le théorème de Pythagore, $${Q}${R}^2 = ${P}${Q}^2 + ${P}${R}^2$, donc $${P}${R}^2 = ${dec(c)}^2 - ${dec(a)}^2 = ${dec(b2)}$.`,
      `$${P}${R} = \\sqrt{${dec(b2)}} ${exact ? '=' : '\\approx'} ${dec(b)}$ cm`,
    ],
  };
});

const reciproque = skill('4e-reciproque-pythagore', 'Savoir si un triangle est rectangle', (rng, level) => {
  const [P, Q, R] = rng.pick(NAMES);
  const [x, y, z] = rng.pick(TRIPLES);
  const k = rng.pick(level === 1 ? [1, 2] : [1, 2, 3, 0.5]);
  const right = rng.next() < 0.5;
  const sides = [x * k, y * k, z * k];
  if (!right) sides[rng.int(0, 1)] += rng.pick(level === 3 ? [0.5, 1] : [1, 2]);
  const [a, b, c] = sides;
  const big = Math.max(a, b, c);
  const sq = (v: number) => Math.round(v * v * 100) / 100;
  // On mélange l'ordre des côtés dans l'énoncé.
  const labels = rng.shuffle([`${P}${Q}`, `${Q}${R}`, `${P}${R}`]);
  const order = rng.shuffle([a, b, c]);
  const named = labels.map((l, i) => ({ l, v: order[i] }));
  const longest = named.find((n) => n.v === big)!;
  const others = named.filter((n) => n !== longest);
  const sum = Math.round((sq(others[0].v) + sq(others[1].v)) * 100) / 100;
  const isRight = Math.abs(sum - sq(big)) < 1e-9;
  return {
    prompt: `Dans le triangle $${P}${Q}${R}$, ${named.map((n) => `$${n.l} = ${dec(n.v)}$`).join(', ')} (en cm). Ce triangle est-il rectangle ?`,
    answer: fixedChoice(['oui', 'non'], isRight ? 0 : 1),
    hint: 'Compare le carré du plus grand côté à la somme des carrés des deux autres.',
    correction: [
      `Plus grand côté : $${longest.l}$. $${longest.l}^2 = ${dec(sq(big))}$.`,
      `$${others[0].l}^2 + ${others[1].l}^2 = ${dec(sq(others[0].v))} + ${dec(sq(others[1].v))} = ${dec(sum)}$.`,
      isRight ? `Les deux résultats sont égaux : d’après la réciproque du théorème de Pythagore, le triangle est rectangle (l’angle droit est opposé à $[${longest.l}]$).` : 'Les deux résultats sont différents : le triangle n’est pas rectangle.',
    ],
  };
});

const probleme = skill('4e-pythagore-probleme', 'Résoudre un problème avec Pythagore', (rng, level) => {
  const cases = [
    () => {
      const [x, y, z] = rng.pick(TRIPLES.slice(0, 3));
      const k = rng.pick([1, 2]) * (level === 1 ? 1 : 0.5);
      const H = y * k;
      const L = z * k;
      return {
        prompt: `Une échelle de ${dec(L).replace('{,}', ',')} m est posée contre un mur vertical. Son pied est à ${dec(x * k).replace('{,}', ',')} m du mur. À quelle hauteur touche-t-elle le mur, en m ?`,
        value: H,
        corr: [`Le mur, le sol et l’échelle forment un triangle rectangle d’hypoténuse l’échelle.`, `$h^2 = ${dec(L)}^2 - ${dec(x * k)}^2 = ${dec(Math.round(H * H * 100) / 100)}$, donc $h = ${dec(H)}$ m.`],
      };
    },
    () => {
      const L = rng.int(10, 30);
      const l = rng.int(5, L - 2);
      const d2 = L * L + l * l;
      const d = round1(Math.sqrt(d2));
      const exact = Number.isInteger(Math.sqrt(d2));
      return {
        prompt: `Un écran rectangulaire mesure ${L} cm sur ${l} cm. Quelle est la longueur de sa diagonale, en cm${exact ? '' : ' (arrondie au dixième)'} ?`,
        value: d,
        corr: [`La diagonale est l’hypoténuse d’un triangle rectangle : $d^2 = ${L}^2 + ${l}^2 = ${d2}$.`, `$d = \\sqrt{${d2}} ${exact ? '=' : '\\approx'} ${dec(d)}$ cm`],
      };
    },
  ];
  if (level >= 2)
    cases.push(() => {
      const xA = rng.int(-6, 6);
      const yA = rng.int(-6, 6);
      const [x, y] = rng.pick(TRIPLES.slice(0, 2));
      const sx = rng.pick([1, -1]);
      const sy = rng.pick([1, -1]);
      const flip = rng.next() < 0.5;
      const dx = (flip ? y : x) * sx;
      const dy = (flip ? x : y) * sy;
      const d = Math.sqrt(dx * dx + dy * dy);
      return {
        prompt: `Dans un repère orthonormé (unité 1 cm), on a $A(${xA}\\,;\\,${yA})$ et $B(${xA + dx}\\,;\\,${yA + dy})$. Calcule la distance $AB$, en cm.`,
        value: d,
        corr: [`On forme un triangle rectangle de côtés $${Math.abs(dx)}$ et $${Math.abs(dy)}$ (écarts des abscisses et des ordonnées).`, `$AB^2 = ${Math.abs(dx)}^2 + ${Math.abs(dy)}^2 = ${dx * dx + dy * dy}$, donc $AB = ${d}$ cm.`],
      };
    });
  const c = rng.pick(cases)();
  return { prompt: c.prompt, answer: numDec(c.value), hint: 'Repère le triangle rectangle et son hypoténuse, puis applique le théorème de Pythagore.', correction: c.corr };
});

export const PYTHAGORE_SKILLS: Skill[] = [hypotenuse, cote, reciproque, probleme];
