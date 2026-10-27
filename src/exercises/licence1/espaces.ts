import type { Skill } from '../types';
import { F, det, fixedChoice, num, numF, pairOf, randomMatrix, rank, skill, tex, vec } from './util';
import { equation } from './systemes';

/** Chapitre « Espaces vectoriels » (Licence 1). */

const famille = (vs: number[][]) => vs.map((v, i) => `u_${i + 1} = ${vec(v)}`).join(',\\ ');

const libre = skill('l1-famille-libre', 'Reconnaître une famille libre', (rng, level) => {
  const n = level === 1 ? 2 : 3;
  const vs = randomMatrix(rng, n, n, 3);
  if (rng.next() < 0.5) {
    // Rend la famille liée : le dernier vecteur est combinaison des autres.
    const a = rng.nonZero(-2, 2);
    const b = n === 3 ? rng.int(-2, 2) : 0;
    vs[n - 1] = vs[0].map((x, i) => a * x + (n === 3 ? b * vs[1][i] : 0));
  }
  const D = det(vs);
  return {
    prompt: `Dans $\\mathbb{R}^${n}$, la famille $${famille(vs)}$ est-elle libre ou liée ?`,
    answer: fixedChoice(['Libre', 'Liée'], D !== 0 ? 0 : 1),
    hint: `$${n}$ vecteurs de $\\mathbb{R}^${n}$ forment une famille libre si et seulement si leur déterminant est non nul.`,
    correction: [`$\\det(${n === 2 ? 'u_1, u_2' : 'u_1, u_2, u_3'}) = ${D}$`, D !== 0 ? 'Non nul : la famille est libre (c’est même une base).' : 'Nul : la famille est liée.'],
  };
});

const parametreLiee = skill('l1-famille-parametre', 'Trouver le paramètre qui rend une famille liée', (rng, level) => {
  const k = level === 1 ? 2 : rng.int(0, 2);
  // w = w0 avec m en position k : le déterminant est affine en m, D(m) = αm + β.
  let u: number[], v: number[], w0: number[], alpha: number, beta: number;
  do {
    u = [1, rng.int(-2, 2), rng.int(-2, 2)];
    v = [0, rng.nonZero(-2, 2), rng.int(-2, 2)];
    w0 = [rng.int(-3, 3), rng.int(-3, 3), rng.int(-3, 3)];
    w0[k] = 0;
    beta = det([u, v, w0]);
    const w1 = [...w0];
    w1[k] = 1;
    alpha = det([u, v, w1]) - beta;
  } while (alpha === 0);
  const m = F(-beta, alpha);
  const wTex = w0.map((x, i) => (i === k ? 'm' : String(x)));
  return {
    prompt: `Pour quelle valeur de $m$ les vecteurs $${vec(u)}$, $${vec(v)}$ et $\\begin{pmatrix}${wTex.join('\\\\')}\\end{pmatrix}$ sont-ils liés ?`,
    answer: numF(m),
    hint: 'Trois vecteurs de $\\mathbb{R}^3$ sont liés si et seulement si leur déterminant est nul.',
    correction: [`Le déterminant vaut $${alpha === 1 ? '' : alpha === -1 ? '-' : alpha}m${beta === 0 ? '' : ` ${beta < 0 ? '-' : '+'} ${Math.abs(beta)}`}$.`, `Il s’annule pour $m = ${tex(m)}$.`],
  };
});

const coordonnees = skill('l1-coordonnees-base', 'Trouver des coordonnées dans une base', (rng, level) => {
  let B: number[][];
  do B = randomMatrix(rng, 2, 2, 3);
  while (det(B) === 0 || (level === 1 && Math.abs(det(B)) !== 1));
  const [e1, e2] = B;
  let a = F(rng.int(-4, 4));
  let b = F(rng.int(-4, 4));
  let w = [a.n * e1[0] + b.n * e2[0], a.n * e1[1] + b.n * e2[1]];
  if (level === 3) {
    w = [rng.int(-6, 6), rng.int(-6, 6)];
    const D = e1[0] * e2[1] - e2[0] * e1[1];
    a = F(w[0] * e2[1] - e2[0] * w[1], D);
    b = F(e1[0] * w[1] - w[0] * e1[1], D);
  }
  return {
    prompt: `Dans la base $(e_1, e_2)$ de $\\mathbb{R}^2$ avec $e_1 = ${vec(e1)}$ et $e_2 = ${vec(e2)}$, donne les coordonnées $(a, b)$ de $w = ${vec(w)}$.`,
    answer: pairOf(a, b, ['a', 'b']),
    hint: 'Résous le système $ae_1 + be_2 = w$.',
    correction: [`$${tex(a)}\\,e_1 ${b.n < 0 ? '-' : '+'} ${tex(F(Math.abs(b.n), b.d))}\\,e_2 = ${vec(w)}$`, `$a = ${tex(a)}$, $b = ${tex(b)}$`],
  };
});

const dimensionNoyau = skill('l1-dimension-sous-espace', 'Calculer la dimension d’un sous-espace défini par des équations', (rng, level) => {
  const n = level === 1 ? 3 : 4;
  const k = level === 1 ? 1 : rng.int(2, 3);
  let A = randomMatrix(rng, k, n, 2);
  if (level === 3 && k === 3) A[2] = A[0].map((x, i) => x + A[1][i]);
  if (A.some((row) => row.every((x) => x === 0))) A = A.map((row, i) => row.map((x, j) => (i === j ? 1 : x)));
  const r = rank(A);
  const vars = ['x', 'y', 'z', 't'];
  return {
    prompt: `Quelle est la dimension du sous-espace $F = \\left\\{ (${vars.slice(0, n).join(', ')}) \\in \\mathbb{R}^${n} \\;\\middle|\\; ${A.map((row) => equation(row, 0)).join(',\\ ')} \\right\\}$ ?`,
    answer: num(n - r),
    hint: 'La dimension vaut $n$ moins le rang du système (le nombre d’équations indépendantes).',
    correction: [`Le système est de rang $${r}$.`, `$\\dim F = ${n} - ${r} = ${n - r}$`],
  };
});

const dimensionsUsuelles = skill('l1-dimensions-usuelles', 'Connaître les dimensions usuelles', (rng, level) => {
  const n = rng.int(2, 6);
  const p = rng.int(2, 5);
  const kinds = [
    { tex: `\\mathbb{R}_{${n}}[X]`, what: `l’espace des polynômes de degré au plus $${n}$`, value: n + 1, why: `Base $(1, X, \\dots, X^{${n}})$ : $${n + 1}$ vecteurs.` },
    { tex: `\\mathcal{M}_{${n},${p}}(\\mathbb{R})`, what: `l’espace des matrices $${n}\\times${p}$`, value: n * p, why: `Les matrices élémentaires $E_{ij}$ forment une base : $${n}\\times${p}$.` },
    { tex: `\\mathcal{S}_{${n}}(\\mathbb{R})`, what: `l’espace des matrices symétriques $${n}\\times${n}$`, value: (n * (n + 1)) / 2, why: `On choisit librement les coefficients sur et au-dessus de la diagonale : $\\frac{${n}\\times${n + 1}}{2}$.` },
    { tex: `\\mathcal{A}_{${n}}(\\mathbb{R})`, what: `l’espace des matrices antisymétriques $${n}\\times${n}$`, value: (n * (n - 1)) / 2, why: `La diagonale est nulle, on choisit les coefficients au-dessus : $\\frac{${n}\\times${n - 1}}{2}$.` },
  ];
  if (level === 3 && rng.next() < 0.5) {
    const f = rng.int(2, 5);
    const g = rng.int(2, 5);
    const i = rng.int(0, Math.min(f, g) - 1);
    return {
      prompt: `$F$ et $G$ sont deux sous-espaces de dimensions $${f}$ et $${g}$, avec $\\dim(F \\cap G) = ${i}$. Quelle est la dimension de $F + G$ ?`,
      answer: num(f + g - i),
      hint: 'Formule de Grassmann : $\\dim(F + G) = \\dim F + \\dim G - \\dim(F\\cap G)$.',
      correction: [`$${f} + ${g} - ${i} = ${f + g - i}$`],
    };
  }
  const k = rng.pick(level === 1 ? kinds.slice(0, 2) : kinds);
  return {
    prompt: `Quelle est la dimension de $${k.tex}$, ${k.what} ?`,
    answer: num(k.value),
    hint: 'Trouve une base et compte ses vecteurs.',
    correction: [k.why],
  };
});

export const ESPACES_SKILLS: Skill[] = [libre, dimensionsUsuelles, coordonnees, dimensionNoyau, parametreLiee];
