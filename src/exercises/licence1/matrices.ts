import type { Rng } from '../rng';
import type { Skill } from '../types';
import { F, type Matrix, det, mat, matMul, num, numF, par, randomMatrix, rank, skill, tex, transpose } from './util';

/** Chapitre « Matrices » (Licence 1). */

const ORD = ['première', 'deuxième', 'troisième'];

const produit = skill('l1-produit-matriciel', 'Calculer un produit de matrices', (rng, level) => {
  const n = level === 1 ? 2 : 3;
  const A = randomMatrix(rng, level === 3 ? 2 : n, n, 3);
  const B = randomMatrix(rng, n, level === 3 ? 2 : n, 3);
  const P = matMul(A, B);
  const i = rng.int(0, P.length - 1);
  const j = rng.int(0, P[0].length - 1);
  return {
    prompt: `$A = ${mat(A)}$ et $B = ${mat(B)}$. Quel est le coefficient de $AB$ situé ${ORD[i]} ligne, ${ORD[j]} colonne ?`,
    answer: num(P[i][j]),
    hint: 'Le coefficient $(i, j)$ de $AB$ est le produit de la ligne $i$ de $A$ par la colonne $j$ de $B$ : $\\sum_k a_{ik}b_{kj}$.',
    correction: [`$${A[i].map((v, k) => `${par(v)}\\times${par(B[k][j])}`).join(' + ')} = ${P[i][j]}$`],
  };
});

const determinant = skill('l1-determinant', 'Calculer un déterminant 2 × 2 ou 3 × 3', (rng, level) => {
  const n = level === 1 ? 2 : 3;
  const A = randomMatrix(rng, n, n, level === 3 ? 4 : 3);
  if (level === 2) A[2][0] = 0;
  const D = det(A);
  const c = (r: number, k: number) => A.filter((_, x) => x !== r).map((row) => row.filter((_, y) => y !== k));
  return {
    prompt: `Calcule le déterminant de $${mat(A)}$.`,
    answer: num(D),
    hint: n === 2 ? '$\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix} = ad - bc$.' : 'Développe selon la première ligne (signes alternés $+$, $-$, $+$), ou utilise la règle de Sarrus.',
    correction:
      n === 2
        ? [`$${par(A[0][0])}\\times${par(A[1][1])} - ${par(A[0][1])}\\times${par(A[1][0])} = ${D}$`]
        : [`$${par(A[0][0])}\\times${par(det(c(0, 0)))} - ${par(A[0][1])}\\times${par(det(c(0, 1)))} + ${par(A[0][2])}\\times${par(det(c(0, 2)))} = ${D}$`],
  };
});

/** Matrice 2 × 2 inversible, de déterminant ±1 au niveau 1. */
function invertible(rng: Rng, level: number): Matrix {
  for (;;) {
    const A = randomMatrix(rng, 2, 2, level === 1 ? 3 : 5);
    const D = det(A);
    if (D !== 0 && (level > 1 || Math.abs(D) === 1)) return A;
  }
}

const inverse = skill('l1-inverse-matrice', 'Inverser une matrice', (rng, level) => {
  if (level === 3) {
    // Inverse d’une matrice triangulaire 3 × 3 à diagonale ±1 : coefficient (1, 3).
    const a = rng.nonZero(-3, 3);
    const b = rng.int(-3, 3);
    const c = rng.nonZero(-3, 3);
    const T = [[1, a, b], [0, 1, c], [0, 0, 1]];
    return {
      prompt: `Quel est le coefficient situé première ligne, troisième colonne de l’inverse de $${mat(T)}$ ?`,
      answer: num(a * c - b),
      hint: 'Résous $TX = Y$ en remontant, ou cherche l’inverse sous la forme triangulaire $\\begin{pmatrix} 1 & p & q \\\\ 0 & 1 & r \\\\ 0 & 0 & 1 \\end{pmatrix}$.',
      correction: [`$T^{-1} = ${mat([[1, -a, a * c - b], [0, 1, -c], [0, 0, 1]])}$`, `Le coefficient cherché vaut $${a * c - b}$.`],
    };
  }
  const A = invertible(rng, level);
  const D = det(A);
  const inv = [[F(A[1][1], D), F(-A[0][1], D)], [F(-A[1][0], D), F(A[0][0], D)]];
  const i = rng.int(0, 1);
  const j = rng.int(0, 1);
  return {
    prompt: `Quel est le coefficient situé ${ORD[i]} ligne, ${ORD[j]} colonne de l’inverse de $${mat(A)}$ ?`,
    answer: numF(inv[i][j]),
    hint: '$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}^{-1} = \\dfrac{1}{ad - bc}\\begin{pmatrix} d & -b \\\\ -c & a \\end{pmatrix}$.',
    correction: [`Déterminant : $${D}$.`, `$A^{-1} = ${mat(inv)}$`, `Coefficient cherché : $${tex(inv[i][j])}$`],
  };
});

const trace = skill('l1-trace-transposee', 'Utiliser trace et transposée', (rng, level) => {
  const n = level === 1 ? 2 : 3;
  const A = randomMatrix(rng, n, n, 3);
  const tr = (M: Matrix) => M.reduce((s, row, i) => s + row[i], 0);
  if (level === 1)
    return {
      prompt: `Calcule la trace de $${mat(A)}$.`,
      answer: num(tr(A)),
      hint: 'La trace est la somme des coefficients diagonaux.',
      correction: [`$${A.map((row, i) => par(row[i])).join(' + ')} = ${tr(A)}$`],
    };
  const S = matMul(A, transpose(A));
  if (level === 2)
    return {
      prompt: `Calcule $\\operatorname{tr}(A\\,{}^t\\!A)$ pour $A = ${mat(A)}$.`,
      answer: num(tr(S)),
      hint: '$\\operatorname{tr}(A\\,{}^t\\!A)$ est la somme des carrés de tous les coefficients de $A$.',
      correction: [`$\\sum_{i,j} a_{ij}^2 = ${tr(S)}$`],
    };
  const B = randomMatrix(rng, n, n, 3);
  return {
    prompt: `$A = ${mat(A)}$ et $B = ${mat(B)}$. Calcule $\\operatorname{tr}(AB) - \\operatorname{tr}(BA) + \\operatorname{tr}(A + B)$.`,
    answer: num(tr(A) + tr(B)),
    hint: '$\\operatorname{tr}(AB) = \\operatorname{tr}(BA)$ toujours, et la trace est linéaire.',
    correction: ['$\\operatorname{tr}(AB) - \\operatorname{tr}(BA) = 0$.', `$\\operatorname{tr}(A + B) = ${tr(A)} + ${par(tr(B))} = ${tr(A) + tr(B)}$`],
  };
});

const puissance = skill('l1-puissance-matrice', 'Calculer une puissance de matrice', (rng, level) => {
  const n = rng.int(3, 10);
  if (level === 1) {
    const a = rng.nonZero(-4, 4);
    return {
      prompt: `$A = ${mat([[1, a], [0, 1]])}$. Quel est le coefficient situé première ligne, deuxième colonne de $A^{${n}}$ ?`,
      answer: num(n * a),
      hint: 'Calcule $A^2$, $A^3$ et devine la forme de $A^n$ (puis récurrence).',
      correction: [`$A^n = \\begin{pmatrix} 1 & na \\\\ 0 & 1 \\end{pmatrix}$ avec $a = ${a}$, donc le coefficient vaut $${n}\\times${par(a)} = ${n * a}$.`],
    };
  }
  if (level === 2) {
    const a = rng.pick([-2, -1, 1, 2]);
    const k = n > 6 ? 5 : n;
    const v = k * a ** (k - 1);
    return {
      prompt: `$A = ${mat([[a, 1], [0, a]])}$. Quel est le coefficient situé première ligne, deuxième colonne de $A^{${k}}$ ?`,
      answer: num(v),
      hint: '$A = aI + N$ avec $N^2 = 0$ : binôme de Newton (les matrices commutent).',
      correction: [`$A^{${k}} = a^{${k}}I + ${k}a^{${k - 1}}N$`, `Coefficient : $${k}\\times${par(a)}^{${k - 1}} = ${v}$`],
    };
  }
  // N nilpotente 3 × 3 strictement triangulaire : (I + N)^n, coefficient (1, 3) = n c + n(n − 1)/2 · a b.
  const a = rng.nonZero(-2, 2);
  const b = rng.nonZero(-2, 2);
  const c = rng.int(-2, 2);
  const v = n * c + ((n * (n - 1)) / 2) * a * b;
  return {
    prompt: `$A = ${mat([[1, a, c], [0, 1, b], [0, 0, 1]])}$. Quel est le coefficient situé première ligne, troisième colonne de $A^{${n}}$ ?`,
    answer: num(v),
    hint: '$A = I + N$ avec $N^3 = 0$ : $A^n = I + nN + \\binom{n}{2}N^2$.',
    correction: [`$N^2 = ${mat([[0, 0, a * b], [0, 0, 0], [0, 0, 0]])}$`, `Coefficient : $${n}\\times${par(c)} + \\binom{${n}}{2}\\times${par(a * b)} = ${v}$`],
  };
});

const rangMatrice = skill('l1-rang-matrice', 'Calculer le rang d’une matrice', (rng, level) => {
  const rows = 3;
  const cols = level === 3 ? 4 : 3;
  const r = rng.int(1, 3);
  // Produit d’une matrice 3 × r et d’une matrice r × cols : rang au plus r (on recalcule le vrai rang).
  const L = randomMatrix(rng, rows, r, 2);
  const R = randomMatrix(rng, r, cols, 2);
  let M = matMul(L, R);
  if (M.every((row) => row.every((v) => v === 0))) M = [[1, 2, 0, 1].slice(0, cols), [2, 4, 0, 2].slice(0, cols), [0, 0, 1, 1].slice(0, cols)];
  const rk = rank(M);
  return {
    prompt: `Quel est le rang de la matrice $${mat(M)}$ ?`,
    answer: num(rk),
    hint: 'Échelonne la matrice par pivot de Gauss : le rang est le nombre de pivots (lignes non nulles).',
    correction: [`Après échelonnement, il reste $${rk}$ ligne${rk > 1 ? 's' : ''} non nulle${rk > 1 ? 's' : ''} : le rang vaut $${rk}$.`],
  };
});

export const MATRICES_SKILLS: Skill[] = [produit, trace, determinant, inverse, puissance, rangMatrice];
