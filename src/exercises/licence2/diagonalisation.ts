import { sumLatex } from '../latex';
import type { Skill } from '../types';
import { type Mat, conjugate, diag, fixedChoice, mat, matMul, num, pairOf, par, poly, skill, trace, det2, unimodular } from './util';

/** Chapitre « Diagonalisation » (L2). */

const DIAG = ['Diagonalisable dans $\\mathbb{R}$', 'Non diagonalisable dans $\\mathbb{R}$'];

const diagonalisable = skill('l2-diagonalisable', 'Décider si une matrice est diagonalisable', (rng, level) => {
  const { P, Pinv } = unimodular(rng, level === 1);
  const kind = rng.pick(level === 1 ? ['distinct', 'jordan'] : ['distinct', 'jordan', 'rotation', 'scalaire']);
  const l = rng.int(-3, 3);
  let A: Mat;
  let why: string;
  let ok: boolean;
  if (kind === 'distinct') {
    const m = l + rng.pick([-2, -1, 1, 2, 3]);
    A = conjugate(P, Pinv, diag([l, m]));
    ok = true;
    why = `$\\chi_A(X) = ${poly([1, -(l + m), l * m], 'X')}$ a deux racines réelles distinctes ($${Math.min(l, m)}$ et $${Math.max(l, m)}$) : $A$ est diagonalisable.`;
  } else if (kind === 'jordan') {
    const b = rng.nonZero(-2, 2);
    A = conjugate(P, Pinv, [
      [l, b],
      [0, l],
    ]);
    ok = false;
    why = `$\\chi_A(X) = (X ${l < 0 ? '+' : '-'} ${Math.abs(l)})^2$ mais $A \\neq ${l}I$ : le sous-espace propre est de dimension 1, $A$ n’est pas diagonalisable.`.replace('(X - 0)', 'X').replace('(X + 0)', 'X');
  } else if (kind === 'rotation') {
    const b = rng.nonZero(-3, 3);
    A = [
      [l, -b],
      [b, l],
    ];
    ok = false;
    why = `$\\chi_A(X) = ${poly([1, -2 * l, l * l + b * b], 'X')}$ a un discriminant $${-4 * b * b} < 0$ : pas de valeur propre réelle.`;
  } else {
    A = diag([l, l]);
    ok = true;
    why = `$A = ${l}I$ est déjà diagonale.`;
  }
  return {
    prompt: `La matrice $A = ${mat(A)}$ est-elle diagonalisable dans $\\mathbb{R}$ ?`,
    answer: fixedChoice(DIAG, ok ? 0 : 1),
    hint: 'Calcule $\\chi_A$ : racines réelles distinctes ⇒ diagonalisable ; racine double ⇒ il faut $A = \\lambda I$ (en taille 2).',
    correction: [`$\\mathrm{tr}(A) = ${trace(A)}$, $\\det A = ${det2(A)}$`, why],
  };
});

const dimension = skill('l2-dim-sous-espace-propre', 'Trouver la dimension d’un sous-espace propre', (rng, level) => {
  const l = rng.int(-3, 3);
  const mu = l + rng.pick([-2, -1, 1, 2]);
  const a = level === 1 ? 0 : rng.pick([0, 0, rng.nonZero(-3, 3)]);
  const c = rng.int(-3, 3);
  const A = [
    [l, a, c],
    [0, l, 0],
    [0, 0, mu],
  ];
  const shifted = l === 0 ? 'A' : `A ${l < 0 ? '+' : '-'} ${Math.abs(l)}I`;
  // A − lI = [[0, a, c], [0, 0, 0], [0, 0, mu − l]] : rang 1 si a = 0, sinon 2.
  const rank = a === 0 ? 1 : 2;
  return {
    prompt: `$A = ${mat(A)}$. Quelle est la dimension du sous-espace propre $E_{${l}}(A) = \\ker(${shifted})$ ?`,
    answer: num(3 - rank),
    hint: 'Théorème du rang : $\\dim\\ker(A - \\lambda I) = 3 - \\mathrm{rg}(A - \\lambda I)$.',
    correction: [
      `$${shifted} = ${mat(A.map((row, i) => row.map((v, j) => (i === j ? v - l : v))))}$`,
      `Son rang vaut ${rank}, donc $\\dim E_{${l}} = 3 - ${rank} = ${3 - rank}$.`,
      a === 0 ? `La valeur propre $${l}$ est double et $\\dim E_{${l}} = 2$.` : `La valeur propre $${l}$ est double mais $\\dim E_{${l}} = 1$ : $A$ n’est pas diagonalisable.`,
    ],
  };
});

const puissance = skill('l2-puissance-matrice', 'Calculer une puissance par diagonalisation', (rng, level) => {
  const l1 = rng.pick([-1, 0, 1, 2]);
  let l2 = rng.pick([-1, 1, 2, 3]);
  if (l2 === l1) l2 = l1 === 2 ? -1 : 2;
  const { P, Pinv } = unimodular(rng, level === 1);
  const A = conjugate(P, Pinv, diag([l1, l2]));
  const n = rng.int(level === 1 ? 2 : 4, level === 1 ? 4 : 7);
  const An = conjugate(P, Pinv, diag([l1 ** n, l2 ** n]));
  const i = rng.int(0, 1);
  const j = rng.int(0, 1);
  return {
    prompt: `$A = ${mat(A)} = PDP^{-1}$ avec $P = ${mat(P)}$, $D = ${mat(diag([l1, l2]))}$ et $P^{-1} = ${mat(Pinv)}$. Donne le coefficient en ligne ${i + 1}, colonne ${j + 1} de $A^{${n}}$.`,
    answer: num(An[i][j]),
    hint: '$A^n = PD^nP^{-1}$, et $D^n$ s’obtient en élevant les coefficients diagonaux à la puissance $n$.',
    correction: [`$D^{${n}} = ${mat(diag([l1 ** n, l2 ** n]))}$`, `$A^{${n}} = PD^{${n}}P^{-1} = ${mat(An)}$`, `Coefficient $(${i + 1}, ${j + 1})$ : $${An[i][j]}$`],
  };
});

const recurrence = skill('l2-suite-recurrente-lineaire', 'Résoudre une suite récurrente linéaire d’ordre 2', (rng, level) => {
  const r1 = rng.pick([-2, -1, 1, 2]);
  let r2 = rng.pick([-1, 2, 3]);
  if (r2 === r1) r2 = 3;
  const [a, b] = [r1 + r2, -r1 * r2];
  const alpha = rng.nonZero(-3, 3);
  const beta = level === 1 ? 1 : rng.nonZero(-3, 3);
  const u0 = alpha + beta;
  const u1 = alpha * r1 + beta * r2;
  const lo = Math.min(r1, r2);
  const hi = Math.max(r1, r2);
  const [cLo, cHi] = r1 < r2 ? [alpha, beta] : [beta, alpha];
  const rec = `u_{n+2} = ${sumLatex([
    [a, 'u_{n+1}'],
    [b, 'u_n'],
  ])}`;
  return {
    prompt: `$${rec}$ pour tout $n$, avec $u_0 = ${u0}$ et $u_1 = ${u1}$. On a $u_n = \\alpha\\,${par(lo)}^n + \\beta\\,${par(hi)}^n$. Donne $\\alpha$ et $\\beta$.`,
    answer: pairOf(cLo, cHi, ['α', 'β']),
    hint: 'Les racines de l’équation caractéristique $r^2 = ar + b$ donnent la forme de $u_n$ ; $u_0$ et $u_1$ donnent un système en $\\alpha, \\beta$.',
    correction: [
      `Équation caractéristique : $${poly([1, -a, -b], 'r')} = 0$, de racines $${lo}$ et $${hi}$.`,
      `$u_0 = \\alpha + \\beta = ${u0}$ et $u_1 = ${sumLatex([[lo, '\\alpha'], [hi, '\\beta']])} = ${u1}$`,
      `$\\alpha = ${cLo}$ et $\\beta = ${cHi}$`,
    ],
  };
});

const cayley = skill('l2-cayley-hamilton', 'Appliquer le théorème de Cayley-Hamilton', (rng, level) => {
  const b = level === 1 ? 3 : 6;
  const A = [
    [rng.int(-b, b), rng.int(-b, b)],
    [rng.int(-b, b), rng.int(-b, b)],
  ];
  const t = trace(A);
  const d = det2(A);
  const A2 = matMul(A, A);
  return {
    prompt: `$A = ${mat(A)}$. D’après Cayley-Hamilton, $A^2 = pA + qI$. Donne $p$ et $q$.`,
    answer: pairOf(t, -d, ['p', 'q']),
    hint: '$\\chi_A(A) = 0$ avec $\\chi_A(X) = X^2 - \\mathrm{tr}(A)X + \\det A$.',
    correction: [`$\\chi_A(X) = ${poly([1, -t, d], 'X')}$`, `donc $A^2 = ${t}A ${-d < 0 ? '-' : '+'} ${Math.abs(d)}I$ : $p = ${t}$, $q = ${-d}$.`, `Vérification : $A^2 = ${mat(A2)}$.`],
  };
});

export const DIAGONALISATION_SKILLS: Skill[] = [diagonalisable, dimension, puissance, recurrence, cayley];
