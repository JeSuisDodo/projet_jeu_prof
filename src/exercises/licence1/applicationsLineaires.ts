import type { Skill } from '../types';
import { F, det, mat, matMul, num, numF, pairOf, par, randomMatrix, rank, skill, tex, vec } from './util';

/** Chapitre « Applications linéaires » (Licence 1). */

const VARS = ['x', 'y', 'z', 't'];

/** « 2x - y + 3z » : combinaison linéaire des variables. */
function linear(coefs: number[]): string {
  let out = '';
  coefs.forEach((c, i) => {
    if (c === 0) return;
    const abs = Math.abs(c) === 1 ? '' : String(Math.abs(c));
    out += out === '' ? `${c < 0 ? '-' : ''}${abs}${VARS[i]}` : ` ${c < 0 ? '-' : '+'} ${abs}${VARS[i]}`;
  });
  return out || '0';
}

const defined = (M: number[][]) => `f(${VARS.slice(0, M[0].length).join(', ')}) = (${M.map(linear).join(',\\ ')})`;

const image = skill('l1-image-vecteur', 'Calculer l’image d’un vecteur', (rng, level) => {
  const n = level === 1 ? 2 : 3;
  const M = randomMatrix(rng, 2, n, 3);
  const u = Array.from({ length: n }, () => rng.int(-3, 3));
  const fu = M.map((row) => row.reduce((s, c, i) => s + c * u[i], 0));
  const given = level === 3 ? `l’application linéaire de matrice $${mat(M)}$ dans les bases canoniques` : `$${defined(M)}$`;
  return {
    prompt: `$f$ est ${given}. Calcule $f(${u.join(', ')})$ : donne ses deux coordonnées.`,
    answer: pairOf(fu[0], fu[1], ['a', 'b']),
    hint: level === 3 ? 'Multiplie la matrice par le vecteur colonne.' : 'Remplace chaque variable par la coordonnée correspondante.',
    correction: [`$f(${u.join(', ')}) = (${fu.join(', ')})$`],
  };
});

const rangNoyau = skill('l1-rang-noyau', 'Utiliser le théorème du rang', (rng, level) => {
  const n = level === 1 ? 3 : rng.int(3, 4);
  const p = 3;
  const r = rng.int(1, level === 1 ? 2 : 3);
  let M = matMul(randomMatrix(rng, p, r, 2), randomMatrix(rng, r, n, 2));
  if (M.every((row) => row.every((v) => v === 0))) M = M.map((row, i) => row.map((v, j) => (i === j ? 1 : v)));
  const rk = rank(M);
  const askKer = level === 1 || rng.next() < 0.6;
  return {
    prompt: `$f : \\mathbb{R}^${n} \\to \\mathbb{R}^${p}$ est définie par $${defined(M)}$. Quelle est la dimension ${askKer ? 'de son noyau' : 'de son image'} ?`,
    answer: num(askKer ? n - rk : rk),
    hint: 'Le rang de $f$ est celui de sa matrice ; théorème du rang : $\\dim\\ker f + \\operatorname{rg} f = \\dim E$.',
    correction: [`Matrice : $${mat(M)}$, de rang $${rk}$.`, askKer ? `$\\dim\\ker f = ${n} - ${rk} = ${n - rk}$` : `$\\dim\\operatorname{Im} f = \\operatorname{rg} f = ${rk}$`],
  };
});

const ORD = ['première', 'deuxième', 'troisième'];

const matrice = skill('l1-matrice-application', 'Écrire la matrice d’une application linéaire', (rng, level) => {
  if (level === 3) {
    // Dérivation sur ℝ_n[X] dans la base (1, X, …, X^n) : coefficient (k, k + 1) = k.
    const n = rng.int(2, 4);
    const k = rng.int(1, n);
    return {
      prompt: `$D : P \\mapsto P'$ sur $\\mathbb{R}_{${n}}[X]$, dans la base $(1, X, \\dots, X^{${n}})$. Quel est le coefficient de la matrice de $D$ en ligne $${k}$, colonne $${k + 1}$ (en numérotant à partir de $1$) ?`,
      answer: num(k),
      hint: 'La colonne $j$ contient les coordonnées de $D(X^{j-1}) = (j-1)X^{j-2}$.',
      correction: [`$D(X^{${k}}) = ${k === 1 ? '1' : `${k}X^{${k - 1}}`}$ : sa colonne (la $${k + 1}$e) a un $${k}$ en ligne $${k}$.`],
    };
  }
  const n = level === 1 ? 2 : 3;
  const M = randomMatrix(rng, n, n, 4);
  const i = rng.int(0, n - 1);
  const j = rng.int(0, n - 1);
  return {
    prompt: `$${defined(M)}$. Quel est le coefficient de la matrice de $f$ dans la base canonique situé ${ORD[i]} ligne, ${ORD[j]} colonne ?`,
    answer: num(M[i][j]),
    hint: 'La colonne $j$ de la matrice contient les coordonnées de $f(e_j)$.',
    correction: [`$f(e_${j + 1}) = ${vec(M.map((row) => row[j]))}$`, `Coefficient : $${M[i][j]}$`],
  };
});

const changementBase = skill('l1-changement-base', 'Changer de base', (rng, level) => {
  // P de déterminant ±1, D diagonale : A = P D P⁻¹, on demande un coefficient de P⁻¹AP (= D) ou de A.
  let P: number[][];
  do P = randomMatrix(rng, 2, 2, 2);
  while (Math.abs(det(P)) !== 1);
  const d = det(P);
  const Pinv = [[P[1][1] * d, -P[0][1] * d], [-P[1][0] * d, P[0][0] * d]];
  const l1 = rng.int(-3, 3);
  let l2 = rng.int(-3, 3);
  while (l2 === l1) l2 = rng.int(-3, 3);
  const D = [[l1, 0], [0, l2]];
  const A = matMul(matMul(P, D), Pinv);
  if (level === 1)
    return {
      prompt: `$A = ${mat(A)}$ et $P = ${mat(P)}$. On admet que $P^{-1}AP$ est diagonale. Quel est son premier coefficient diagonal ?`,
      answer: num(l1),
      hint: 'La première colonne de $P$ est un vecteur propre : calcule $A$ fois cette colonne.',
      correction: [`$A${vec(P.map((r) => r[0]))} = ${vec(A.map((r) => r[0] * P[0][0] + r[1] * P[1][0]))} = ${par(l1)}${vec(P.map((r) => r[0]))}$`, `Premier coefficient : $${l1}$`],
    };
  const n = rng.int(2, level === 2 ? 3 : 5);
  const An = matMul(matMul(P, [[l1 ** n, 0], [0, l2 ** n]]), Pinv);
  const i = rng.int(0, 1);
  const j = rng.int(0, 1);
  return {
    prompt: `$A = ${mat(A)}$ vérifie $A = PDP^{-1}$ avec $P = ${mat(P)}$ et $D = ${mat(D)}$. Quel est le coefficient de $A^{${n}}$ situé ${ORD[i]} ligne, ${ORD[j]} colonne ?`,
    answer: num(An[i][j]),
    hint: '$A^n = PD^nP^{-1}$, et $D^n$ s’obtient en élevant les coefficients diagonaux à la puissance $n$.',
    correction: [`$P^{-1} = ${mat(Pinv)}$`, `$A^{${n}} = P${mat([[l1 ** n, 0], [0, l2 ** n]])}P^{-1} = ${mat(An)}$`],
  };
});

const noyauForme = skill('l1-noyau-forme-lineaire', 'Trouver un vecteur du noyau', (rng, level) => {
  const a = rng.int(-4, 4);
  const b = rng.int(-4, 4);
  const c = rng.nonZero(-4, 4);
  const p = rng.int(-3, 3);
  const q = rng.int(-3, 3);
  if (level < 3) {
    const m = F(-(a * p + b * q), c);
    return {
      prompt: `$\\varphi(x, y, z) = ${linear([a, b, c])}$. Pour quelle valeur de $m$ le vecteur $(${p}, ${q}, m)$ est-il dans le noyau de $\\varphi$ ?`,
      answer: numF(m),
      hint: 'Un vecteur est dans le noyau si son image est nulle.',
      correction: [`$${par(a)}\\times${par(p)} + ${par(b)}\\times${par(q)} + ${par(c)}\\,m = 0$`, `$m = ${tex(m)}$`],
    };
  }
  // Noyau d’une application de ℝ³ dans ℝ² de rang 2 : dirigé par le produit vectoriel des lignes.
  let M: number[][];
  do M = randomMatrix(rng, 2, 3, 3);
  while (rank(M) < 2);
  const [r1, r2] = M;
  const w = [r1[1] * r2[2] - r1[2] * r2[1], r1[2] * r2[0] - r1[0] * r2[2], r1[0] * r2[1] - r1[1] * r2[0]];
  // On normalise pour que la première coordonnée non nulle vaille 1 : on demande les deux autres (fractions).
  const k = w.findIndex((x) => x !== 0);
  const others = [0, 1, 2].filter((x) => x !== k);
  const ratio = (x: number) => F(w[x], w[k]);
  return {
    prompt: `$${defined(M)}$. Son noyau est une droite dirigée par un vecteur $u$ dont la coordonnée $${VARS[k]}$ vaut $1$. Donne les deux autres coordonnées de $u$ ($${VARS[others[0]]}$ puis $${VARS[others[1]]}$).`,
    answer: pairOf(ratio(others[0]), ratio(others[1]), [VARS[others[0]], VARS[others[1]]]),
    hint: 'Résous le système $f(u) = 0$ en fixant la coordonnée imposée à $1$ (ou utilise le produit vectoriel des deux lignes).',
    correction: [`Un vecteur directeur est $${vec(w)}$.`, `En divisant par $${w[k]}$ : $${VARS[others[0]]} = ${tex(ratio(others[0]))}$, $${VARS[others[1]]} = ${tex(ratio(others[1]))}$.`],
  };
});

export const APPLICATIONS_LINEAIRES_SKILLS: Skill[] = [image, matrice, rangNoyau, noyauForme, changementBase];
