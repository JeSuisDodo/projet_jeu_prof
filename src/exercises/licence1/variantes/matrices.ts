import { type Fait, type Variantes, qcmBanque, vraiFaux, vraiFauxBanque } from '../../licenceVariantes';
import { F, det, mat, matMul, num, numF, par, rank, tex } from '../util';

/** Variantes du chapitre « Calcul matriciel » (feuilles bibmath « Calcul matriciel » et « Matrices et applications linéaires »). */

const ORD = ['première', 'deuxième', 'troisième'];

const MATRICES: Fait[] = [
  { s: '$AB = BA$ pour toutes matrices carrées $A, B$ de même taille.', v: false, why: 'Avec $A = \\begin{pmatrix}0 & 1 \\\\ 0 & 0\\end{pmatrix}$ et $B = {}^t\\!A$ : $AB \\neq BA$.' },
  { s: '${}^t(AB) = {}^tB\\,{}^tA$.', v: true, why: 'Le coefficient $(i, j)$ des deux membres vaut $\\sum_k a_{jk}b_{ki}$.' },
  { s: 'Si $AB = 0$, alors $A = 0$ ou $B = 0$.', v: false, why: '$\\begin{pmatrix}0 & 1 \\\\ 0 & 0\\end{pmatrix}^2 = 0$ : l’anneau des matrices a des diviseurs de zéro.' },
  { s: '$(A + B)^2 = A^2 + 2AB + B^2$ pour toutes matrices carrées $A, B$.', v: false, why: '$(A + B)^2 = A^2 + AB + BA + B^2$ : il faut que $A$ et $B$ commutent.' },
  { s: 'Si $A$ et $B$ sont inversibles, $(AB)^{-1} = B^{-1}A^{-1}$.', v: true, why: '$AB \\cdot B^{-1}A^{-1} = I$.' },
  { s: 'Si $A$ et $B$ sont inversibles, $A + B$ est inversible.', v: false, why: '$I + (-I) = 0$.' },
  { s: '$\\operatorname{tr}(AB) = \\operatorname{tr}(BA)$.', v: true, why: 'Les deux valent $\\sum_{i, j} a_{ij}b_{ji}$.' },
  { s: '$\\operatorname{tr}(AB) = \\operatorname{tr}(A)\\operatorname{tr}(B)$.', v: false, why: 'Avec $A = B = I_2$ : $2 \\neq 4$.' },
  { s: '$\\det(A + B) = \\det A + \\det B$.', v: false, why: 'Avec $A = B = I_2$ : $\\det(2I_2) = 4 \\neq 2$.' },
  { s: '$\\det(AB) = \\det A \\det B$.', v: true, why: 'Le déterminant est multiplicatif.' },
  { s: '$\\det(2A) = 2\\det A$ pour $A$ de taille $3$.', v: false, why: '$\\det(2A) = 2^3\\det A = 8\\det A$.' },
  { s: 'Une matrice carrée est inversible si et seulement si son déterminant est non nul.', v: true, why: 'C’est la caractérisation de l’inversibilité.' },
  { s: 'Une matrice triangulaire est inversible si et seulement si ses coefficients diagonaux sont non nuls.', v: true, why: 'Son déterminant est le produit des coefficients diagonaux.' },
  { s: 'Le rang d’une matrice est égal à celui de sa transposée.', v: true, why: 'Rang des lignes = rang des colonnes.' },
  { s: 'Si $A^2 = I$, alors $A = I$ ou $A = -I$.', v: false, why: '$A = \\begin{pmatrix}0 & 1 \\\\ 1 & 0\\end{pmatrix}$ vérifie $A^2 = I$.' },
];

export const MATRICES_VARIANTES: Variantes = {
  'l1-produit-matriciel': [
    (rng) => vraiFauxBanque(rng, MATRICES),
    // Taille d'un produit.
    (rng) => {
      const [n, p, q] = [rng.int(1, 5), rng.int(1, 5), rng.int(1, 5)];
      const possible = rng.next() < 0.7;
      const p2 = possible ? p : p + rng.int(1, 2);
      return vraiFaux(
        `Le produit $AB$ d’une matrice $A$ de taille $${n} \\times ${p}$ par une matrice $B$ de taille $${p2} \\times ${q}$ est défini, et c’est une matrice de taille $${n} \\times ${q}$.`,
        possible,
        [possible ? `Le nombre de colonnes de $A$ ($${p}$) est égal au nombre de lignes de $B$.` : `$A$ a $${p}$ colonnes mais $B$ a $${p2}$ lignes : le produit n’est pas défini.`],
        '$AB$ existe quand le nombre de colonnes de $A$ égale le nombre de lignes de $B$.',
      );
    },
    // Problème concret : facture.
    (rng) => {
      const prices = [rng.int(2, 9), rng.int(1, 5), rng.int(3, 12)];
      const Q = [
        [rng.int(0, 5), rng.int(0, 5), rng.int(0, 5)],
        [rng.int(0, 5), rng.int(0, 5), rng.int(0, 5)],
      ];
      const i = rng.int(0, 1);
      const total = Q[i].reduce((s, qq, k) => s + qq * prices[k], 0);
      return {
        prompt: `Deux clients achètent des pains, des croissants et des tartes. La matrice des quantités est $Q = ${mat(Q)}$ (une ligne par client) et le vecteur des prix est $P = ${mat(prices.map((x) => [x]))}$. Combien paie le ${i === 0 ? 'premier' : 'second'} client (coefficient ${ORD[i]} ligne de $QP$) ?`,
        answer: num(total),
        hint: 'Le coefficient $i$ de $QP$ est $\\sum_k q_{ik}p_k$.',
        correction: [`$${Q[i].map((qq, k) => `${qq}\\times${prices[k]}`).join(' + ')} = ${total}$`],
      };
    },
  ],
  'l1-determinant': [
    // Propriétés : det(kA), det(A^{-1}), det(AB).
    (rng, level) => {
      const n = rng.int(2, 4);
      const d = rng.nonZero(-5, 5);
      const e = rng.nonZero(-4, 4);
      const k = rng.pick([2, -1, 3, -2]);
      const kinds = [
        { t: `${k}A`, v: F(k ** n * d), why: `$\\det(${k}A) = ${par(k)}^{${n}}\\det A$` },
        { t: 'A^{-1}', v: F(1, d), why: '$\\det(A^{-1}) = \\frac{1}{\\det A}$' },
        { t: '{}^t\\!A\\,B', v: F(d * e), why: '$\\det({}^tA\\,B) = \\det A \\det B$' },
        { t: 'A^{3}', v: F(d ** 3), why: '$\\det(A^3) = (\\det A)^3$' },
      ];
      const kk = rng.pick(level === 1 ? kinds.slice(0, 2) : kinds);
      return {
        prompt: `$A$ et $B$ sont des matrices carrées de taille $${n}$, avec $\\det A = ${d}$ et $\\det B = ${e}$. Calcule $\\det(${kk.t})$.`,
        answer: numF(kk.v),
        hint: 'Le déterminant est multiplicatif, invariant par transposition, et $n$-linéaire : $\\det(kA) = k^n\\det A$.',
        correction: [kk.why, `$= ${tex(kk.v)}$`],
      };
    },
    // Matrice triangulaire.
    (rng) => {
      const n = rng.int(3, 4);
      const M = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (j < i ? 0 : j === i ? rng.nonZero(-3, 3) : rng.int(-9, 9))));
      const lower = rng.next() < 0.5;
      const A = lower ? M[0].map((_, j) => M.map((row) => row[j])) : M;
      return {
        prompt: `Calcule le déterminant de $${mat(A)}$.`,
        answer: num(det(A)),
        hint: 'Pour une matrice triangulaire, c’est le produit des coefficients diagonaux.',
        correction: [`$${A.map((row, i) => par(row[i])).join(' \\times ')} = ${det(A)}$`],
      };
    },
    // Paramètre qui annule le déterminant.
    (rng) => {
      const a = rng.nonZero(-4, 4);
      const b = rng.nonZero(-4, 4);
      const c = rng.nonZero(-4, 4);
      // det [[a, b], [c, m]] = am − bc = 0.
      return {
        prompt: `Pour quelle valeur de $m$ la matrice $\\begin{pmatrix}${a} & ${b} \\\\ ${c} & m\\end{pmatrix}$ n’est-elle pas inversible ?`,
        answer: numF(F(b * c, a)),
        hint: 'Annule le déterminant $am - bc$.',
        correction: [`$${a}m - ${par(b * c)} = 0 \\iff m = ${tex(F(b * c, a))}$`],
      };
    },
  ],
  'l1-inverse-matrice': [
    (rng) => qcmBanque(rng, MATRICES, rng.next() < 0.5),
    // A² − sA + pI = 0 donne A⁻¹.
    (rng) => {
      let A: number[][];
      do A = [[rng.int(-3, 4), rng.int(-3, 3)], [rng.int(-3, 3), rng.int(-3, 4)]];
      while (det(A) === 0);
      const s = A[0][0] + A[1][1];
      const p = det(A);
      const [i, j] = [rng.int(0, 1), rng.int(0, 1)];
      // A⁻¹ = (sI − A)/p.
      const v = F((i === j ? s : 0) - A[i][j], p);
      return {
        prompt: `$A = ${mat(A)}$ vérifie $A^2 - ${par(s)}A + ${par(p)}I = 0$ (Cayley-Hamilton). En déduire le coefficient ${ORD[i]} ligne, ${ORD[j]} colonne de $A^{-1}$.`,
        answer: numF(v),
        hint: 'Factorise : $A(A - sI) = -pI$, donc $A^{-1} = \\frac{1}{p}(sI - A)$.',
        correction: [`$A^{-1} = \\frac{1}{${p}}\\left(${s}I - A\\right)$`, `Coefficient : $\\frac{${(i === j ? s : 0) - A[i][j]}}{${p}} = ${tex(v)}$`],
      };
    },
    // Matrice diagonale ou de permutation.
    (rng) => {
      if (rng.next() < 0.5) {
        const d = [rng.nonZero(-5, 5), rng.nonZero(-5, 5), rng.nonZero(-5, 5)];
        const i = rng.int(0, 2);
        return {
          prompt: `Quel est le coefficient ${ORD[i]} ligne, ${ORD[i]} colonne de l’inverse de $${mat(d.map((x, r) => d.map((_, c) => (r === c ? x : 0))))}$ ?`,
          answer: numF(F(1, d[i])),
          hint: 'L’inverse d’une matrice diagonale s’obtient en inversant chaque coefficient diagonal.',
          correction: [`$\\frac{1}{${d[i]}} = ${tex(F(1, d[i]))}$`],
        };
      }
      const perm = rng.shuffle([0, 1, 2]);
      const P = [0, 1, 2].map((r) => [0, 1, 2].map((c) => (perm[r] === c ? 1 : 0)));
      const i = rng.int(0, 2);
      const j = rng.int(0, 2);
      return {
        prompt: `$P = ${mat(P)}$ est une matrice de permutation. Quel est le coefficient ${ORD[i]} ligne, ${ORD[j]} colonne de $P^{-1}$ ?`,
        answer: num(P[j][i]),
        hint: 'Une matrice de permutation est orthogonale : $P^{-1} = {}^tP$.',
        correction: [`$P^{-1} = {}^tP = ${mat(P[0].map((_, c) => P.map((row) => row[c])))}$`],
      };
    },
  ],
  'l1-trace-transposee': [
    // tr(P⁻¹AP) = tr(A).
    (rng) => {
      const A = Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => rng.int(-6, 6)));
      const t = A[0][0] + A[1][1] + A[2][2];
      return {
        prompt: `$A = ${mat(A)}$ et $P$ est une matrice inversible quelconque de taille $3$. Calcule $\\operatorname{tr}(P^{-1}AP)$.`,
        answer: num(t),
        hint: '$\\operatorname{tr}(MN) = \\operatorname{tr}(NM)$ : la trace est invariante par changement de base.',
        correction: [`$\\operatorname{tr}(P^{-1}(AP)) = \\operatorname{tr}((AP)P^{-1}) = \\operatorname{tr}(A) = ${t}$`],
      };
    },
    // tr(A²) pour une matrice 2 × 2.
    (rng) => {
      const A = [[rng.int(-4, 4), rng.int(-4, 4)], [rng.int(-4, 4), rng.int(-4, 4)]];
      const A2 = matMul(A, A);
      const t = A2[0][0] + A2[1][1];
      return {
        prompt: `Calcule $\\operatorname{tr}(A^2)$ pour $A = ${mat(A)}$.`,
        answer: num(t),
        hint: '$\\operatorname{tr}(A^2) = a^2 + 2bc + d^2$ pour $A = \\begin{pmatrix}a & b \\\\ c & d\\end{pmatrix}$.',
        correction: [`$A^2 = ${mat(A2)}$`, `$\\operatorname{tr}(A^2) = ${t}$`],
      };
    },
    // Symétrique, antisymétrique.
    (rng) => {
      const a = rng.int(-5, 5);
      const b = rng.int(-5, 5);
      const c = rng.int(-5, 5);
      const sym = rng.next() < 0.5;
      const i = rng.int(0, 2);
      let j = rng.int(0, 2);
      while (j === i) j = rng.int(0, 2);
      const M = [[1, a, b], [c, 2, a], [b, c, 3]];
      const v = sym ? F(M[i][j] + M[j][i], 2) : F(M[i][j] - M[j][i], 2);
      return {
        prompt: `On écrit $M = ${mat(M)}$ comme $S + A$ avec $S$ symétrique et $A$ antisymétrique. Quel est le coefficient ${ORD[i]} ligne, ${ORD[j]} colonne de $${sym ? 'S' : 'A'}$ ?`,
        answer: numF(v),
        hint: '$S = \\frac{M + {}^tM}{2}$ et $A = \\frac{M - {}^tM}{2}$.',
        correction: [`$\\frac{${M[i][j]} ${sym ? '+' : '-'} ${par(M[j][i])}}{2} = ${tex(v)}$`],
      };
    },
  ],
  'l1-puissance-matrice': [
    // J matrice pleine de 1 : J^k = n^{k−1} J.
    (rng) => {
      const n = rng.int(2, 4);
      const k = rng.int(2, 8);
      const J = Array.from({ length: n }, () => Array(n).fill(1));
      return {
        prompt: `$J = ${mat(J)}$. Quel est le coefficient première ligne, première colonne de $J^{${k}}$ ?`,
        answer: num(n ** (k - 1)),
        hint: `Calcule $J^2$ : on trouve $${n}J$.`,
        correction: [`$J^2 = ${n}J$, donc $J^{${k}} = ${n}^{${k - 1}}J$.`, `Coefficient : $${n ** (k - 1)}$`],
      };
    },
    // Projecteur : A² = A.
    (rng) => {
      const a = rng.int(-4, 4);
      const A = [[1, a], [0, 0]];
      const k = rng.int(3, 50);
      return {
        prompt: `$A = ${mat(A)}$. Quel est le coefficient première ligne, deuxième colonne de $A^{${k}}$ ?`,
        answer: num(a),
        hint: 'Calcule $A^2$.',
        correction: [`$A^2 = A$, donc $A^{${k}} = A$.`, `Coefficient : $${a}$`],
      };
    },
    // (I + N)^n avec N nilpotente d'indice 2.
    (rng) => {
      const a = rng.nonZero(-4, 4);
      const lam = rng.pick([1, 2, -1]);
      const n = rng.int(3, 10);
      // (λI + N)^n = λ^n I + nλ^{n−1} N.
      return {
        prompt: `$A = ${mat([[lam, a], [0, lam]])} = ${lam === 1 ? '' : lam === -1 ? '-' : lam}I + N$ avec $N^2 = 0$. Quel est le coefficient première ligne, deuxième colonne de $A^{${n}}$ ?`,
        answer: num(n * lam ** (n - 1) * a),
        hint: '$I$ et $N$ commutent : formule du binôme, où seuls deux termes restent.',
        correction: [`$A^{${n}} = ${par(lam)}^{${n}}I + ${n}\\times${par(lam)}^{${n - 1}}N$`, `Coefficient : $${n} \\times ${par(lam ** (n - 1))} \\times ${par(a)} = ${n * lam ** (n - 1) * a}$`],
      };
    },
  ],
  'l1-rang-matrice': [
    // Rang d'un produit u·ᵗv.
    (rng) => {
      const u = [rng.int(-3, 3), rng.int(-3, 3), rng.nonZero(-3, 3)];
      const v = [rng.nonZero(-3, 3), rng.int(-3, 3), rng.int(-3, 3)];
      const M = u.map((x) => v.map((y) => x * y));
      return {
        prompt: `Quel est le rang de la matrice $${mat(M)}$ ?`,
        answer: num(rank(M)),
        hint: 'Regarde si les lignes sont proportionnelles.',
        correction: [`Toutes les lignes sont multiples de $(${v.join(', ')})$ : c’est $u\\,{}^tv$, de rang $${rank(M)}$.`],
      };
    },
    // Rang avec paramètre.
    (rng) => {
      const m = rng.pick([1, 1, -2, 0, 2, 3, -1]);
      const M = [[m, 1, 1], [1, m, 1], [1, 1, m]];
      const r = rank(M);
      return {
        prompt: `Quel est le rang de $${mat(M)}$ ?`,
        answer: num(r),
        hint: 'Le déterminant vaut $(m - 1)^2(m + 2)$ : les cas $m = 1$ et $m = -2$ sont particuliers.',
        correction: [`$\\det = (${m} - 1)^2(${m} + 2) = ${det(M)}$`, `Le rang vaut $${r}$.`],
      };
    },
    (rng) => vraiFauxBanque(rng, MATRICES),
  ],
};

export const BANQUES_MATRICES = { MATRICES };
