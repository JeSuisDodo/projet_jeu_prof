import type { Skill } from '../types';
import { F, type Mat, bound, det2, det3, div, mat, num, numF, par, setOf, skill, tex } from './util';

/** Chapitre « Déterminants » (L2). */

const det2x2 = skill('l2-det-2x2', 'Calculer un déterminant 2×2', (rng, level) => {
  const b = bound(level, 4, 7, 12);
  const m = [
    [rng.int(-b, b), rng.int(-b, b)],
    [rng.int(-b, b), rng.int(-b, b)],
  ];
  const d = det2(m);
  return {
    prompt: `Calcule $\\det A$ pour $A = ${mat(m)}$.`,
    answer: num(d),
    hint: '$\\begin{vmatrix} a & b \\\\ c & d\\end{vmatrix} = ad - bc$',
    correction: [`$\\det A = ${par(m[0][0])}\\times ${par(m[1][1])} - ${par(m[0][1])}\\times ${par(m[1][0])} = ${d}$`],
  };
});

const det3x3 = skill('l2-det-3x3', 'Calculer un déterminant 3×3', (rng, level) => {
  const b = bound(level, 3, 3, 4);
  let m: Mat;
  if (level === 1) {
    // Triangulaire : le déterminant est le produit des coefficients diagonaux.
    const upper = rng.next() < 0.5;
    m = [0, 1, 2].map((i) => [0, 1, 2].map((j) => (i === j ? rng.nonZero(-b, b) : (upper ? j > i : j < i) ? rng.int(-b, b) : 0)));
  } else {
    m = [0, 1, 2].map(() => [0, 1, 2].map(() => rng.int(-b, b)));
    // Un zéro au niveau 2 pour faciliter le développement.
    if (level === 2) m[rng.int(0, 2)][0] = 0;
  }
  const d = det3(m);
  const minor = (i: number, j: number) => det2(m.filter((_, r) => r !== i).map((row) => row.filter((_, c) => c !== j)));
  return {
    prompt: `Calcule $\\det A$ pour $A = ${mat(m)}$.`,
    answer: num(d),
    hint: level === 1 ? 'La matrice est triangulaire : son déterminant est le produit des coefficients diagonaux.' : 'Développe selon la première colonne (ou utilise la règle de Sarrus).',
    correction:
      level === 1
        ? [`$\\det A = ${par(m[0][0])}\\times ${par(m[1][1])}\\times ${par(m[2][2])} = ${d}$`]
        : [
            'Développement selon la première colonne :',
            `$\\det A = ${par(m[0][0])}\\times ${par(minor(0, 0))} - ${par(m[1][0])}\\times ${par(minor(1, 0))} + ${par(m[2][0])}\\times ${par(minor(2, 0))} = ${d}$`,
          ],
  };
});

const proprietes = skill('l2-det-proprietes', 'Utiliser les propriétés du déterminant', (rng, level) => {
  const n = rng.int(2, level === 1 ? 3 : 4);
  const d = rng.nonZero(-5, 5);
  const e = rng.nonZero(-4, 4);
  const k = rng.pick([-2, -1, 2, 3]);
  const cases = [
    { q: `\\det(${k}A)`, v: F(k ** n * d), why: `$\\det(${k}A) = (${k})^{${n}}\\det A = ${k ** n}\\times ${par(d)}$` },
    { q: `\\det({}^t\\!A)`, v: F(d), why: 'Une matrice et sa transposée ont le même déterminant.' },
    { q: `\\det(A^{2})`, v: F(d * d), why: `$\\det(A^2) = (\\det A)^2 = ${par(d)}^2$` },
    { q: `\\det(A^{-1})`, v: F(1, d), why: `$\\det(A^{-1}) = \\dfrac{1}{\\det A}$` },
    { q: `\\det(AB)`, v: F(d * e), why: `$\\det(AB) = \\det A \\times \\det B = ${par(d)}\\times ${par(e)}$` },
    { q: `\\det(${k}A^{-1}B)`, v: div(F(k ** n * e), F(d)), why: `$\\det(${k}A^{-1}B) = (${k})^{${n}}\\times\\dfrac{\\det B}{\\det A} = ${k ** n}\\times\\dfrac{${e}}{${d}}$` },
  ];
  const c = rng.pick(level === 1 ? cases.slice(1, 3) : level === 2 ? cases.slice(0, 5) : [cases[0], cases[3], cases[5]]);
  return {
    prompt: `$A$ et $B$ sont des matrices carrées de taille ${n}, avec $\\det A = ${d}$ et $\\det B = ${e}$. Calcule $${c.q}$.`,
    answer: numF(c.v),
    hint: '$\\det(AB) = \\det A\\det B$ et $\\det(\\lambda A) = \\lambda^n \\det A$ pour une matrice de taille $n$.',
    correction: [c.why, `$${c.q} = ${tex(c.v)}$`],
  };
});

const parametre = skill('l2-det-parametre', 'Trouver quand une matrice n’est pas inversible', (rng, level) => {
  // det = (m - p)(m - s) - qr, qu'on veut égal à (m - α)(m - β).
  const alpha = rng.int(-4, 4);
  let beta = rng.int(-4, 4);
  if (level > 1 && beta === alpha) beta = alpha + 1;
  const p = level === 1 ? alpha : rng.int(-3, 3);
  const s = alpha + beta - p;
  const q = level === 1 ? 0 : rng.pick([1, -1, 2]);
  const prod = p * s - alpha * beta;
  // Il faut q · r = p·s − αβ avec r entier.
  const r = q === 0 ? rng.int(-3, 3) : prod / q;
  if (!Number.isInteger(r)) return parametreFallback(alpha, beta);
  const m = (shift: number) => (shift === 0 ? 'm' : `m ${shift > 0 ? '-' : '+'} ${Math.abs(shift)}`);
  const fm = (shift: number) => (shift === 0 ? 'm' : `(${m(shift)})`);
  return {
    prompt: `Pour quelles valeurs du réel $m$ la matrice $\\begin{pmatrix} ${m(p)} & ${q} \\\\ ${r} & ${m(s)}\\end{pmatrix}$ n’est-elle pas inversible ?`,
    answer: setOf([alpha, beta]),
    hint: 'Une matrice est inversible si et seulement si son déterminant est non nul.',
    correction: [
      `$\\det = ${fm(p)}${fm(s)} - ${par(q)}\\times ${par(r)}$`,
      `$= ${polyM([1, -(alpha + beta), alpha * beta])} = ${alpha === beta ? `${fm(alpha)}^2` : `${fm(alpha)}${fm(beta)}`}$`,
      alpha === beta ? `Le déterminant s’annule pour $m = ${alpha}$.` : `Le déterminant s’annule pour $m = ${alpha}$ et $m = ${beta}$.`,
    ],
  };
});

function polyM(c: number[]): string {
  const [a, b, k] = c;
  let s = a === 1 ? 'm^2' : `${a}m^2`;
  if (b) s += ` ${b < 0 ? '-' : '+'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}m`;
  if (k) s += ` ${k < 0 ? '-' : '+'} ${Math.abs(k)}`;
  return s;
}

function parametreFallback(alpha: number, beta: number) {
  const m = (shift: number) => (shift === 0 ? 'm' : `m ${shift > 0 ? '-' : '+'} ${Math.abs(shift)}`);
  return {
    prompt: `Pour quelles valeurs du réel $m$ la matrice $\\begin{pmatrix} ${m(alpha)} & 1 \\\\ 0 & ${m(beta)}\\end{pmatrix}$ n’est-elle pas inversible ?`,
    answer: setOf([alpha, beta]),
    hint: 'Une matrice triangulaire est inversible si et seulement si ses coefficients diagonaux sont non nuls.',
    correction: [`$\\det = ${alpha === 0 ? 'm' : `(${m(alpha)})`}${beta === 0 ? 'm' : `(${m(beta)})`}$, nul pour $m = ${alpha}$${alpha === beta ? '' : ` ou $m = ${beta}$`}.`],
  };
}

const inverse = skill('l2-det-inverse', 'Calculer un coefficient de l’inverse (comatrice)', (rng, level) => {
  const b = bound(level, 3, 5, 6);
  let m: Mat;
  let d: number;
  do {
    m = [
      [rng.int(-b, b), rng.int(-b, b)],
      [rng.int(-b, b), rng.int(-b, b)],
    ];
    d = det2(m);
  } while (d === 0 || (level === 1 && Math.abs(d) !== 1));
  const i = rng.int(0, 1);
  const j = rng.int(0, 1);
  // A⁻¹ = (1/det) · ᵗcom(A) = (1/det) [[d, -b], [-c, a]].
  const adj = [
    [m[1][1], -m[0][1]],
    [-m[1][0], m[0][0]],
  ];
  const value = F(adj[i][j], d);
  return {
    prompt: `$A = ${mat(m)}$. Donne le coefficient en ligne ${i + 1}, colonne ${j + 1} de $A^{-1}$.`,
    answer: numF(value),
    hint: '$A^{-1} = \\dfrac{1}{\\det A}\\,{}^t\\mathrm{com}(A)$ ; en taille 2 : $\\dfrac{1}{ad - bc}\\begin{pmatrix} d & -b \\\\ -c & a\\end{pmatrix}$.',
    correction: [`$\\det A = ${d}$`, `$A^{-1} = \\dfrac{1}{${d}}${mat(adj)}$`, `Coefficient $(${i + 1}, ${j + 1})$ : $${tex(value)}$`],
  };
});

/** Déterminant de Vandermonde 3×3 : (b − a)(c − a)(c − b). */
const vandermonde = skill('l2-det-vandermonde', 'Calculer un déterminant de Vandermonde', (rng, level) => {
  const pool = rng.shuffle([-3, -2, -1, 0, 1, 2, 3, 4]).slice(0, 3);
  const [a, b, c] = level === 1 ? [...pool].sort((x, y) => x - y) : pool;
  const v = (b - a) * (c - a) * (c - b);
  return {
    prompt: `Calcule $\\begin{vmatrix} 1 & 1 & 1 \\\\ ${a} & ${b} & ${c} \\\\ ${a * a} & ${b * b} & ${c * c}\\end{vmatrix}$.`,
    answer: num(v),
    hint: 'Déterminant de Vandermonde : $\\begin{vmatrix} 1 & 1 & 1 \\\\ a & b & c \\\\ a^2 & b^2 & c^2\\end{vmatrix} = (b - a)(c - a)(c - b)$.',
    correction: [`$(${b} - ${par(a)})(${c} - ${par(a)})(${c} - ${par(b)}) = ${par(b - a)}\\times ${par(c - a)}\\times ${par(c - b)} = ${v}$`],
  };
});

export const DETERMINANTS_SKILLS: Skill[] = [det2x2, det3x3, proprietes, parametre, inverse, vandermonde];
