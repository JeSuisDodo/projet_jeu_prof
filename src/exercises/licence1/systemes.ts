import type { Skill } from '../types';
import { F, det, fixedChoice, num, pairOf, setOf, skill, tex } from './util';

/** Chapitre « Systèmes linéaires » (Licence 1). */

const VARS = ['x', 'y', 'z', 't'];

/** Une équation « 2x - y + 3z = 4 ». */
export function equation(coefs: number[], rhs: number, vars = VARS): string {
  let out = '';
  coefs.forEach((c, i) => {
    if (c === 0) return;
    const abs = Math.abs(c) === 1 ? '' : String(Math.abs(c));
    out += out === '' ? `${c < 0 ? '-' : ''}${abs}${vars[i]}` : ` ${c < 0 ? '-' : '+'} ${abs}${vars[i]}`;
  });
  return `${out || '0'} = ${rhs}`;
}

export const system = (rows: number[][], rhs: number[]) => `\\begin{cases} ${rows.map((r, i) => equation(r, rhs[i]).replace(' = ', ' &= ')).join(' \\\\ ')} \\end{cases}`;

const systeme2 = skill('l1-systeme-2x2', 'Résoudre un système 2 × 2', (rng, level) => {
  let A: number[][];
  do A = [[rng.nonZero(-4, 4), rng.int(-4, 4)], [rng.int(-4, 4), rng.nonZero(-4, 4)]];
  while (det(A) === 0 || (level === 1 && Math.abs(det(A)) !== 1 && rng.next() < 0.7));
  const D = det(A);
  let x = F(rng.int(-5, 5));
  let y = F(rng.int(-5, 5));
  let rhs = A.map((r) => r[0] * x.n + r[1] * y.n);
  if (level === 3) {
    // Second membre quelconque : solution fractionnaire (Cramer).
    rhs = [rng.int(-6, 6), rng.int(-6, 6)];
    x = F(rhs[0] * A[1][1] - A[0][1] * rhs[1], D);
    y = F(A[0][0] * rhs[1] - rhs[0] * A[1][0], D);
  }
  return {
    prompt: `Résous le système $${system(A, rhs)}$.`,
    answer: pairOf(x, y, ['x', 'y']),
    hint: 'Combine les lignes pour éliminer une inconnue, ou utilise les formules de Cramer.',
    correction: [`Déterminant : $${D}$.`, `$x = ${tex(x)}$ et $y = ${tex(y)}$`],
  };
});

const systeme3 = skill('l1-systeme-3x3', 'Résoudre un système 3 × 3 (pivot de Gauss)', (rng, level) => {
  // Système triangulaire (niveau 1) ou matrice unimodulaire déguisée.
  let A: number[][];
  if (level === 1) A = [[1, rng.int(-3, 3), rng.int(-3, 3)], [0, 1, rng.int(-3, 3)], [0, 0, rng.nonZero(-3, 3)]];
  else {
    const L = [[1, 0, 0], [rng.int(-2, 2), 1, 0], [rng.int(-2, 2), rng.int(-2, 2), 1]];
    const U = [[rng.pick([1, -1, 2]), rng.int(-2, 2), rng.int(-2, 2)], [0, rng.pick([1, -1]), rng.int(-2, 2)], [0, 0, rng.pick([1, -1, 2])]];
    A = L.map((row) => U[0].map((_, j) => row.reduce((s, v, k) => s + v * U[k][j], 0)));
  }
  const sol = [rng.int(-4, 4), rng.int(-4, 4), rng.int(-4, 4)];
  const rhs = A.map((r) => r.reduce((s, v, i) => s + v * sol[i], 0));
  const ask = level === 3 ? rng.int(0, 2) : 2;
  return {
    prompt: `Le système $${system(A, rhs)}$ a une unique solution. Que vaut $${VARS[ask]}$ ?`,
    answer: num(sol[ask]),
    hint: 'Pivot de Gauss : élimine $x$ des lignes 2 et 3 avec la ligne 1, puis $y$ de la ligne 3.',
    correction: [`Après échelonnement et remontée : $(x, y, z) = (${sol.join(',\\ ')})$.`, `$${VARS[ask]} = ${sol[ask]}$`],
  };
});

const nombreSolutions = skill('l1-systeme-nombre-solutions', 'Compter les solutions d’un système', (rng, level) => {
  const kind = rng.int(0, 2);
  const a = rng.nonZero(-4, 4);
  const b = rng.nonZero(-4, 4);
  const k = rng.pick([-3, -2, 2, 3]);
  const c = rng.int(-6, 6);
  let rows: number[][];
  let rhs: number[];
  if (kind === 0) {
    let d = rng.nonZero(-4, 4);
    while (a * d - b * k === 0) d = rng.nonZero(-4, 4);
    rows = [[a, b], [k, d]];
    rhs = [c, rng.int(-6, 6)];
  } else {
    rows = [[a, b], [k * a, k * b]];
    rhs = kind === 1 ? [c, k * c] : [c, k * c + rng.nonZero(-3, 3)];
  }
  const answer = kind === 0 ? 0 : kind === 1 ? 2 : 1;
  const options = ['Une seule', 'Aucune', 'Une infinité'];
  if (level === 3) {
    // Variante 3 × 3 : la troisième ligne est somme des deux premières (ou pas).
    const r1 = [1, rng.int(-2, 2), rng.int(-2, 2)];
    const r2 = [0, 1, rng.int(-2, 2)];
    const r3 = r1.map((v, i) => v + r2[i]);
    const s1 = rng.int(-4, 4);
    const s2 = rng.int(-4, 4);
    const compatible = rng.next() < 0.5;
    const s3 = compatible ? s1 + s2 : s1 + s2 + rng.nonZero(-2, 2);
    return {
      prompt: `Combien le système $${system([r1, r2, r3], [s1, s2, s3])}$ a-t-il de solutions ?`,
      answer: fixedChoice(options, compatible ? 2 : 1),
      hint: 'Compare la troisième ligne à la somme des deux premières.',
      correction: [`$L_3 - L_1 - L_2$ donne $0 = ${s3 - s1 - s2}$.`, compatible ? 'Cette ligne est toujours vraie : il reste 2 équations pour 3 inconnues, une infinité de solutions.' : 'Cette ligne est impossible : aucune solution.'],
    };
  }
  return {
    prompt: `Combien le système $${system(rows, rhs)}$ a-t-il de solutions ?`,
    answer: fixedChoice(options, answer),
    hint: 'Calcule le déterminant ; s’il est nul, regarde si les équations sont compatibles.',
    correction: kind === 0 ? [`Déterminant $${det(rows)} \\neq 0$ : une seule solution.`] : [`Déterminant nul : la ligne 2 a les coefficients de la ligne 1 multipliés par $${k}$.`, kind === 1 ? 'Le second membre aussi : les équations sont les mêmes, une infinité de solutions.' : 'Mais pas le second membre : aucune solution.'],
  };
});

const parametre = skill('l1-systeme-parametre', 'Trouver les paramètres qui rendent un système non inversible', (rng, level) => {
  // Système { a x + m y = 1 ; m x + b y = 2 } de déterminant ab − m², avec ab carré parfait.
  const s = rng.int(1, level === 1 ? 3 : 6);
  const divs = Array.from({ length: s * s }, (_, i) => i + 1).filter((d) => (s * s) % d === 0);
  const a = rng.pick(divs);
  const b = (s * s) / a;
  if (level === 3) {
    // Diagonale m + k, des 1 ailleurs : déterminant (m + k − 1)²(m + k + 2).
    const k = rng.int(-3, 3);
    const diag = k === 0 ? 'm' : `(m ${k < 0 ? '-' : '+'} ${Math.abs(k)})`;
    return {
      prompt: `Pour quelles valeurs de $m$ le système $\\begin{cases} ${diag}x + y + z &= 1 \\\\ x + ${diag}y + z &= 1 \\\\ x + y + ${diag}z &= 1 \\end{cases}$ n’a-t-il pas une unique solution ?`,
      answer: setOf([1 - k, -2 - k]),
      hint: 'Calcule le déterminant en ajoutant toutes les colonnes à la première : on peut factoriser.',
      correction: [`Avec $a = ${diag.replace(/[()]/g, '')}$, le déterminant vaut $(a + 2)(a - 1)^2$.`, `Il s’annule pour $a = 1$ ou $a = -2$, soit $m = ${1 - k}$ ou $m = ${-2 - k}$.`],
    };
  }
  return {
    prompt: `Pour quelles valeurs de $m$ le système $\\begin{cases} ${a === 1 ? '' : a}x + my &= 1 \\\\ mx + ${b === 1 ? '' : b}y &= 2 \\end{cases}$ n’a-t-il pas une unique solution ?`,
    answer: setOf([s, -s]),
    hint: 'Un système carré a une unique solution si et seulement si son déterminant est non nul.',
    correction: [`Déterminant : $${a * b} - m^2$.`, `Il s’annule pour $m = ${s}$ et $m = -${s}$.`],
  };
});

export const SYSTEMES_SKILLS: Skill[] = [systeme2, nombreSolutions, systeme3, parametre];
