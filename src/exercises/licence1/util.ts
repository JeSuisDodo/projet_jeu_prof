import { type Frac, frac } from '../fraction';
import type { Rng } from '../rng';
import type { Answer } from '../types';
import { add, choiceTex, mul, sub, tex } from '../terminale/util';

/** Outils partagés par les chapitres de Licence 1 (en plus de ceux de Terminale). */

export * from '../terminale/util';

export type Matrix = number[][];

/** Matrice en LaTeX (crochets ronds), entiers ou fractions. */
export const mat = (m: readonly (readonly (number | Frac)[])[]) =>
  `\\begin{pmatrix}${m.map((row) => row.map((v) => (typeof v === 'number' ? String(v) : tex(v))).join(' & ')).join(' \\\\ ')}\\end{pmatrix}`;

export const matMul = (a: Matrix, b: Matrix): Matrix => a.map((row) => b[0].map((_, j) => row.reduce((s, v, k) => s + v * b[k][j], 0)));

export const transpose = (a: Matrix): Matrix => a[0].map((_, j) => a.map((row) => row[j]));

/** Déterminant par développement selon la première ligne (petites matrices entières). */
export function det(a: Matrix): number {
  if (a.length === 1) return a[0][0];
  if (a.length === 2) return a[0][0] * a[1][1] - a[0][1] * a[1][0];
  return a[0].reduce((s, v, j) => s + (j % 2 ? -1 : 1) * v * det(a.slice(1).map((row) => row.filter((_, k) => k !== j))), 0);
}

/** Rang d'une matrice entière, par pivot de Gauss en fractions exactes. */
export function rank(a: Matrix): number {
  const m: Frac[][] = a.map((row) => row.map((v) => frac(v)));
  let r = 0;
  for (let col = 0; col < (m[0]?.length ?? 0) && r < m.length; col++) {
    const p = m.findIndex((row, i) => i >= r && row[col].n !== 0);
    if (p < 0) continue;
    [m[r], m[p]] = [m[p], m[r]];
    for (let i = 0; i < m.length; i++) {
      if (i === r || m[i][col].n === 0) continue;
      const k = frac(m[i][col].n * m[r][col].d, m[i][col].d * m[r][col].n);
      m[i] = m[i].map((v, j) => sub(v, mul(k, m[r][j])));
    }
    r++;
  }
  return r;
}

/** Matrice entière aléatoire de taille rows × cols, coefficients entre -b et b. */
export const randomMatrix = (rng: { int: (a: number, b: number) => number }, rows: number, cols: number, b: number): Matrix =>
  Array.from({ length: rows }, () => Array.from({ length: cols }, () => rng.int(-b, b)));

export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}

/** Reste positif de a modulo n. */
export const mod = (a: number, n: number) => ((a % n) + n) % n;

/** Coefficients (u, v) de Bézout : au + bv = pgcd(a, b). */
export function bezout(a: number, b: number): [number, number] {
  let [r0, r1, u0, u1, v0, v1] = [a, b, 1, 0, 0, 1];
  while (r1) {
    const q = Math.floor(r0 / r1);
    [r0, r1] = [r1, r0 - q * r1];
    [u0, u1] = [u1, u0 - q * u1];
    [v0, v1] = [v1, v0 - q * v1];
  }
  return [u0, v0];
}

/** Nombre complexe à parties réelle et imaginaire rationnelles. */
export interface Cx {
  re: Frac;
  im: Frac;
}

export const cx = (re: number | Frac, im: number | Frac): Cx => ({
  re: typeof re === 'number' ? frac(re) : re,
  im: typeof im === 'number' ? frac(im) : im,
});
export const cxAdd = (a: Cx, b: Cx): Cx => ({ re: add(a.re, b.re), im: add(a.im, b.im) });
export const cxMul = (a: Cx, b: Cx): Cx => ({ re: sub(mul(a.re, b.re), mul(a.im, b.im)), im: add(mul(a.re, b.im), mul(a.im, b.re)) });
export function cxDiv(a: Cx, b: Cx): Cx {
  const n2 = add(mul(b.re, b.re), mul(b.im, b.im));
  const p = cxMul(a, { re: b.re, im: frac(-b.im.n, b.im.d) });
  return { re: frac(p.re.n * n2.d, p.re.d * n2.n), im: frac(p.im.n * n2.d, p.im.d * n2.n) };
}

/** Écriture algébrique a + bi en LaTeX. */
export function cxTex(z: Cx): string {
  const re = z.re.n === 0 ? '' : tex(z.re);
  if (z.im.n === 0) return re || '0';
  const abs = { n: Math.abs(z.im.n), d: z.im.d };
  const imAbs = abs.n === 1 && abs.d === 1 ? 'i' : abs.d === 1 ? `${abs.n}i` : `${tex(abs)}i`;
  if (!re) return `${z.im.n < 0 ? '-' : ''}${imAbs}`;
  return `${re} ${z.im.n < 0 ? '-' : '+'} ${imAbs}`;
}

/** Réponse « partie réelle, partie imaginaire ». */
export const cxAnswer = (z: Cx): Answer => ({ kind: 'pair', values: [z.re, z.im], labels: ['\\mathrm{Re}(z)', '\\mathrm{Im}(z)'] });

/** Réponse en couple, avec ses étiquettes. */
export const pairOf = (a: number | Frac, b: number | Frac, labels: [string, string]): Answer => ({
  kind: 'pair',
  values: [typeof a === 'number' ? frac(a) : a, typeof b === 'number' ? frac(b) : b],
  labels,
});

export const setOf = (values: (number | Frac)[]): Answer => ({ kind: 'set', values: values.map((v) => (typeof v === 'number' ? frac(v) : v)) });

/** Ensemble fini d'entiers en LaTeX : {1, 3, 5}, ou ∅. */
export const setTex = (s: readonly number[]) => (s.length ? `\\{${[...s].sort((a, b) => a - b).join(',\\,')}\\}` : '\\varnothing');

/** QCM à formules dont les trois leurres sont donnés (options entourées de $…$). */
export function texChoice(rng: Rng, correct: string, decoys: string[], filler: () => string = () => '\\text{aucune de ces réponses}'): Answer {
  return choiceTex(rng, correct, decoys, filler);
}

/** Combinaison linéaire : linComb([[2, "y'"], [-1, 'y'], [3, '']]) donne « 2y' - y + 3 ». */
export function linComb(terms: [number, string][]): string {
  let out = '';
  for (const [c, v] of terms) {
    if (c === 0) continue;
    const abs = Math.abs(c) === 1 && v ? '' : String(Math.abs(c));
    out += out === '' ? `${c < 0 ? '-' : ''}${abs}${v}` : ` ${c < 0 ? '-' : '+'} ${abs}${v}`;
  }
  return out || '0';
}
