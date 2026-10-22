import { sumLatex } from '../latex';
import type { Skill } from '../types';
import { F, type Mat, fixedChoice, mat, matMul, numF, pairOf, par, setOf, skill, tex } from './util';

/** Chapitre « Formes quadratiques et matrices symétriques » (L2). */

const VARS = ['x', 'y', 'z'];

/** q(X) = ᵗX S X écrite en développant : a x² + 2b xy + … */
function qTex(S: Mat): string {
  const n = S.length;
  const terms: [number, string][] = [];
  for (let i = 0; i < n; i++) terms.push([S[i][i], `${VARS[i]}^2`]);
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) terms.push([2 * S[i][j], `${VARS[i]}${VARS[j]}`]);
  return sumLatex(terms);
}

function randomSym(rng: { int: (a: number, b: number) => number }, n: number, b: number): Mat {
  const S = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++)
    for (let j = i; j < n; j++) {
      const v = rng.int(-b, b);
      S[i][j] = v;
      S[j][i] = v;
    }
  if (S.every((row) => row.every((v) => v === 0))) S[0][0] = 1;
  return S;
}

const matrice = skill('l2-matrice-forme-quadratique', 'Écrire la matrice d’une forme quadratique', (rng, level) => {
  const n = level === 1 ? 2 : 3;
  // Coefficients de q : diagonale entière, termes croisés quelconques (la matrice a des demi-entiers).
  const diagC = Array.from({ length: n }, () => rng.int(-4, 4));
  const cross: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) cross[i][j] = rng.nonZero(-5, 5);
  const terms: [number, string][] = [];
  for (let i = 0; i < n; i++) terms.push([diagC[i], `${VARS[i]}^2`]);
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) terms.push([cross[i][j], `${VARS[i]}${VARS[j]}`]);
  const i = rng.int(0, n - 2);
  const j = rng.int(i + 1, n - 1);
  const ask = level === 3 || rng.next() < 0.7 ? [i, j] : [i, i];
  const value = ask[0] === ask[1] ? F(diagC[ask[0]]) : F(cross[ask[0]][ask[1]], 2);
  return {
    prompt: `$q(${VARS.slice(0, n).join(', ')}) = ${sumLatex(terms)}$. Donne le coefficient en ligne ${ask[0] + 1}, colonne ${ask[1] + 1} de la matrice symétrique $S$ de $q$.`,
    answer: numF(value),
    hint: 'Le coefficient de $x_i^2$ va sur la diagonale ; celui de $x_ix_j$ ($i \\neq j$) est partagé en deux moitiés, en $(i, j)$ et en $(j, i)$.',
    correction: [ask[0] === ask[1] ? `Coefficient de $${VARS[ask[0]]}^2$ : $${tex(value)}$.` : `Coefficient de $${VARS[ask[0]]}${VARS[ask[1]]}$ : $${cross[ask[0]][ask[1]]}$, divisé par 2 : $${tex(value)}$.`],
  };
});

const polaire = skill('l2-forme-polaire', 'Calculer avec la forme polaire', (rng, level) => {
  const n = level === 1 ? 2 : 3;
  const S = randomSym(rng, n, 3);
  const u = Array.from({ length: n }, () => rng.int(-2, 2));
  const v = Array.from({ length: n }, () => rng.int(-2, 2));
  const Sv = matMul(S, v.map((x) => [x])).map((r) => r[0]);
  const value = u.reduce((s, x, k) => s + x * Sv[k], 0);
  const vecTex = (w: number[]) => `(${w.join('\\,;\\,')})`;
  return {
    prompt: `$q(${VARS.slice(0, n).join(', ')}) = ${qTex(S)}$ et $\\varphi$ est sa forme polaire. Calcule $\\varphi(u, v)$ pour $u = ${vecTex(u)}$ et $v = ${vecTex(v)}$.`,
    answer: numF(F(value)),
    hint: '$\\varphi(u, v) = {}^tU\\,S\\,V$, où $S$ est la matrice symétrique de $q$.',
    correction: [`$S = ${mat(S)}$`, `$SV = ${mat(Sv.map((x) => [x]))}$`, `$\\varphi(u, v) = ${u.map((x, k) => `${par(x)}\\times ${par(Sv[k])}`).join(' + ')} = ${value}$`],
  };
});

const signature = skill('l2-signature', 'Trouver la signature (méthode de Gauss)', (rng, level) => {
  const n = level === 1 ? 2 : 3;
  // q = Σ εᵢ kᵢ Lᵢ², avec Lᵢ = xᵢ + Σ_{j>i} cᵢⱼ xⱼ (formes linéaires indépendantes).
  const eps = Array.from({ length: n }, (_, i) => (i === 0 ? rng.pick([1, -1]) : rng.pick([1, -1, 0])));
  const k = eps.map(() => rng.int(1, 2));
  const L = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (j === i ? 1 : j > i ? rng.int(-2, 2) : 0)));
  const S: Mat = Array.from({ length: n }, () => Array(n).fill(0));
  for (let r = 0; r < n; r++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) S[i][j] += eps[r] * k[r] * L[r][i] * L[r][j];
  const pos = eps.filter((e) => e > 0).length;
  const neg = eps.filter((e) => e < 0).length;
  const Ltex = (r: number) => sumLatex(L[r].map((c, j) => [c, VARS[j]] as [number, string]));
  return {
    prompt: `Donne la signature $(p, q)$ de la forme quadratique $Q(${VARS.slice(0, n).join(', ')}) = ${qTex(S)}$.`,
    answer: pairOf(pos, neg, ['p', 'q']),
    hint: 'Méthode de Gauss : regroupe les termes en $x$ dans un carré, puis recommence avec les variables restantes. $p$ compte les carrés affectés d’un signe +, $q$ ceux affectés d’un signe −.',
    correction: [
      `$Q = ${eps
        .map((e, r) => [e * k[r], `(${Ltex(r)})^2`] as [number, string])
        .filter(([c]) => c !== 0)
        .map(([c, t], idx) => `${c < 0 ? '-' : idx === 0 ? '' : '+'} ${Math.abs(c) === 1 ? '' : Math.abs(c)}${t}`)
        .join(' ')
        .replace(/\(([xyz])\)\^2/g, '$1^2')}$`,
      `Les formes linéaires sont indépendantes : signature $(${pos}, ${neg})$.`,
    ],
  };
});

const NATURES = ['Définie positive', 'Définie négative', 'Non dégénérée, ni positive ni négative', 'Dégénérée'];

const nature = skill('l2-forme-definie-positive', 'Reconnaître une forme définie positive', (rng, level) => {
  // Matrice [[a, b], [b, c]] : on choisit d'abord la nature voulue.
  const want = rng.int(0, 3);
  let a: number;
  let b: number;
  let c: number;
  do {
    a = rng.nonZero(-4, 4);
    b = rng.int(-3, 3);
    c = rng.int(-4, 4);
    if (want === 3) c = (b * b) / a;
  } while (!Number.isInteger(c) || natureOf(a, b, c) !== want || (level === 1 && b === 0 && want !== 3 && rng.next() < 0.5));
  const S = [
    [a, b],
    [b, c],
  ];
  const d = a * c - b * b;
  return {
    prompt: `Quelle est la nature de la forme quadratique $q(x, y) = ${qTex(S)}$ ?`,
    answer: fixedChoice(NATURES, want),
    hint: 'Avec $S = \\begin{pmatrix} a & b \\\\ b & c\\end{pmatrix}$ : $\\det S > 0$ et $a > 0$ ⇒ définie positive ; $\\det S < 0$ ⇒ ni positive ni négative ; $\\det S = 0$ ⇒ dégénérée.',
    correction: [`$S = ${mat(S)}$, $\\det S = ${d}$`, `$q$ est : ${NATURES[want].toLowerCase()}.`],
  };
});

function natureOf(a: number, b: number, c: number): number {
  const d = a * c - b * b;
  if (d === 0) return 3;
  if (d < 0) return 2;
  return a > 0 ? 0 : 1;
}

/** (a − c, 2b) dont la somme des carrés est un carré parfait de même parité que a + c. */
const SPLITS = [
  [0, 2],
  [0, 4],
  [3, 4],
  [8, 6],
  [6, 8],
  [0, 6],
];

const spectre = skill('l2-vp-symetrique', 'Valeurs propres d’une matrice symétrique', (rng, level) => {
  let a: number;
  let b: number;
  let c: number;
  let disc: number;
  do {
    const [diff, twoB] = rng.pick(level === 1 ? SPLITS.slice(0, 2) : SPLITS);
    b = (twoB / 2) * rng.sign();
    c = rng.int(-3, 3);
    a = c + diff * (level === 1 ? 1 : rng.sign());
    disc = Math.sqrt((a - c) ** 2 + 4 * b * b);
  } while (!Number.isInteger(b) || (a + c + disc) % 2 !== 0);
  const l1 = (a + c - disc) / 2;
  const l2 = (a + c + disc) / 2;
  return {
    prompt: `Quelles sont les valeurs propres de la matrice symétrique $S = ${mat([
      [a, b],
      [b, c],
    ])}$ ?`,
    answer: setOf([l1, l2]),
    hint: 'Une matrice symétrique réelle est diagonalisable dans une base orthonormée ; ses valeurs propres sont les racines de $X^2 - \\mathrm{tr}(S)X + \\det S$.',
    correction: [`$\\mathrm{tr}(S) = ${a + c}$, $\\det S = ${a * c - b * b}$`, `Les racines sont $${l1}$ et $${l2}$ (somme $${a + c}$, produit $${l1 * l2}$).`],
  };
});

export const FORMES_QUADRATIQUES_SKILLS: Skill[] = [matrice, polaire, signature, nature, spectre];
