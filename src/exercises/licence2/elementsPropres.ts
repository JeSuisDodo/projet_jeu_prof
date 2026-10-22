import type { Rng } from '../rng';
import type { Skill } from '../types';
import { type Mat, conjugate, det2, diag, mat, matMul, num, pairOf, par, poly, setOf, skill, trace, unimodular } from './util';

/** Chapitre « Valeurs propres et vecteurs propres » (L2). */

/** Facteur (X − λ) d'un polynôme caractéristique. */
export const factor = (l: number) => (l === 0 ? 'X' : `(X ${l < 0 ? '+' : '-'} ${Math.abs(l)})`);

/** Matrice 2×2 entière de valeurs propres l1 et l2. */
export function withEigen(rng: Rng, l1: number, l2: number, small = false): Mat {
  const { P, Pinv } = unimodular(rng, small);
  return conjugate(P, Pinv, diag([l1, l2]));
}

const caracteristique = skill('l2-polynome-caracteristique', 'Calculer le polynôme caractéristique', (rng, level) => {
  const b = level === 1 ? 4 : 7;
  const m = [
    [rng.int(-b, b), rng.int(-b, b)],
    [rng.int(-b, b), rng.int(-b, b)],
  ];
  const t = trace(m);
  const d = det2(m);
  return {
    prompt: `$A = ${mat(m)}$. Son polynôme caractéristique s’écrit $\\chi_A(X) = X^2 + bX + c$. Donne $b$ et $c$.`,
    answer: pairOf(-t, d, ['b', 'c']),
    hint: 'En taille 2 : $\\chi_A(X) = X^2 - \\mathrm{tr}(A)\\,X + \\det A$.',
    correction: [`$\\mathrm{tr}(A) = ${t}$ et $\\det A = ${d}$`, `$\\chi_A(X) = ${poly([1, -t, d], 'X')}$, donc $b = ${-t}$ et $c = ${d}$.`],
  };
});

const valeursPropres = skill('l2-valeurs-propres-2x2', 'Trouver les valeurs propres d’une matrice 2×2', (rng, level) => {
  const l1 = rng.int(-3, 4);
  let l2 = rng.int(-3, 4);
  if (l2 === l1) l2 = l1 + rng.pick([-2, 1, 3]);
  const A = withEigen(rng, l1, l2, level === 1);
  const t = trace(A);
  const d = det2(A);
  return {
    prompt: `Quelles sont les valeurs propres de $A = ${mat(A)}$ ?`,
    answer: setOf([l1, l2]),
    hint: 'Les valeurs propres sont les racines de $\\chi_A(X) = X^2 - \\mathrm{tr}(A)X + \\det A$.',
    correction: [`$\\chi_A(X) = ${poly([1, -t, d], 'X')} = ${factor(l1)}${factor(l2)}$`, `$\\mathrm{Sp}(A) = \\{${Math.min(l1, l2)}\\,;\\,${Math.max(l1, l2)}\\}$`],
  };
});

const triangulaire = skill('l2-valeurs-propres-triangulaire', 'Lire les valeurs propres d’une matrice triangulaire', (rng, level) => {
  const n = level === 1 ? 3 : 4;
  const d = Array.from({ length: n }, () => rng.int(-4, 5));
  const upper = rng.next() < 0.5;
  const m = d.map((v, i) => d.map((_, j) => (i === j ? v : (upper ? j > i : j < i) ? rng.int(-5, 5) : 0)));
  const distinct = [...new Set(d)].sort((a, b) => a - b);
  return {
    prompt: `Quelles sont les valeurs propres de $T = ${mat(m)}$ ?`,
    answer: setOf(distinct),
    hint: 'Le polynôme caractéristique d’une matrice triangulaire est $\\prod (X - t_{ii})$.',
    correction: [`$\\chi_T(X) = ${distinct.map((v) => { const k = d.filter((x) => x === v).length; return k === 1 ? factor(v) : `${factor(v)}^{${k}}`; }).join('')}$`, `$\\mathrm{Sp}(T) = \\{${distinct.join('\\,;\\,')}\\}$`],
  };
});

const vecteurPropre = skill('l2-vecteur-propre', 'Vérifier un vecteur propre', (rng, level) => {
  const l1 = rng.int(-3, 4);
  let l2 = rng.int(-3, 4);
  if (l2 === l1) l2 = l1 + 2;
  const { P, Pinv } = unimodular(rng, level === 1);
  const A = conjugate(P, Pinv, diag([l1, l2]));
  const k = rng.pick(level === 3 ? [-2, 2, 3] : [1]);
  const col = rng.int(0, 1);
  const v = [P[0][col] * k, P[1][col] * k];
  const lambda = col === 0 ? l1 : l2;
  const Av = matMul(A, [[v[0]], [v[1]]]).map((r) => r[0]);
  return {
    prompt: `$A = ${mat(A)}$ et $v = ${mat([[v[0]], [v[1]]])}$. Le vecteur $v$ est propre : donne la valeur propre associée.`,
    answer: num(lambda),
    hint: 'Calcule $Av$ et compare-le à $v$ : $Av = \\lambda v$.',
    correction: [`$Av = ${mat([[Av[0]], [Av[1]]])} = ${par(lambda)}\\,${mat([[v[0]], [v[1]]])}$`, `Donc $\\lambda = ${lambda}$.`],
  };
});

const traceDet = skill('l2-trace-det-vp', 'Utiliser trace et déterminant pour une valeur propre', (rng, level) => {
  const a = rng.nonZero(-3, 3);
  const b = rng.nonZero(-3, 4);
  const c = rng.nonZero(-3, 3);
  const useDet = level > 1 && rng.next() < 0.5;
  if (useDet)
    return {
      prompt: `Une matrice $A \\in \\mathcal{M}_3(\\mathbb{R})$ a pour valeurs propres $${a}$, $${b}$ et $\\lambda$, avec $\\det A = ${a * b * c}$. Calcule $\\lambda$.`,
      answer: num(c),
      hint: 'Le déterminant est le produit des valeurs propres (comptées avec multiplicité).',
      correction: [`$${par(a)}\\times ${par(b)}\\times\\lambda = ${a * b * c}$`, `$\\lambda = ${c}$`],
    };
  return {
    prompt: `Une matrice $A \\in \\mathcal{M}_3(\\mathbb{R})$ a pour valeurs propres $${a}$, $${b}$ et $\\lambda$, avec $\\mathrm{tr}(A) = ${a + b + c}$. Calcule $\\lambda$.`,
    answer: num(c),
    hint: 'La trace est la somme des valeurs propres (comptées avec multiplicité).',
    correction: [`$${a} + ${par(b)} + \\lambda = ${a + b + c}$`, `$\\lambda = ${c}$`],
  };
});

const polynomeMatrice = skill('l2-spectre-polynome', 'Trouver le spectre de P(A)', (rng, level) => {
  const sp = rng.shuffle([-2, -1, 0, 1, 2, 3]).slice(0, level === 1 ? 2 : 3).sort((x, y) => x - y);
  const a = level === 1 ? 0 : rng.int(-3, 3);
  const c = rng.int(-2, 2);
  const P = (x: number) => x * x + a * x + c;
  const image = sp.map(P);
  return {
    prompt: `Le spectre de $A$ est $\\{${sp.join('\\,;\\,')}\\}$. Quel est le spectre de $${poly([1, a, 0], 'A')}${c === 0 ? '' : ` ${c < 0 ? '-' : '+'} ${Math.abs(c) === 1 ? '' : Math.abs(c)}I`}$ ?`,
    answer: setOf(image),
    hint: 'Si $Av = \\lambda v$, alors $P(A)v = P(\\lambda)v$ : les valeurs propres de $P(A)$ sont les $P(\\lambda)$.',
    correction: [`$P(X) = ${poly([1, a, c], 'X')}$`, ...sp.map((l) => `$P(${l}) = ${P(l)}$`), `$\\mathrm{Sp}(P(A)) = \\{${[...new Set(image)].sort((x, y) => x - y).join('\\,;\\,')}\\}$`],
  };
});

export const ELEMENTS_PROPRES_SKILLS: Skill[] = [caracteristique, valeursPropres, triangulaire, vecteurPropre, traceDet, polynomeMatrice];
