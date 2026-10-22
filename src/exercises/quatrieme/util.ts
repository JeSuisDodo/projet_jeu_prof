import { type Frac, frac } from '../fraction';
import type { Rng } from '../rng';
import type { Answer } from '../types';

/** Outils partagés par les chapitres de 4e (on réutilise ceux de 2nde et de Terminale). */

export { dec, decText, fracOf } from '../seconde/outils';
export { makeChoice } from '../types';
export { F, add, bound, choiceTex, div, fixedChoice, mul, num, numF, poly, skill, sub, tex } from '../terminale/util';

/** Nombre entre parenthèses s'il est négatif (entiers ou décimaux). */
export const par = (v: number): string => {
  const s = String(Math.round(v * 1e6) / 1e6 + 0).replace('.', '{,}');
  return v < 0 ? `(${s})` : s;
};

export const gcd = (a: number, b: number): number => {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
};

export const lcm = (a: number, b: number) => (a / gcd(a, b)) * b;

/** Fraction en LaTeX avec un signe moins devant, jamais au dénominateur. */
export const ftex = (n: number, d: number) => {
  const f = frac(n, d);
  return f.d === 1 ? String(f.n) : `${f.n < 0 ? '-' : ''}\\frac{${Math.abs(f.n)}}{${f.d}}`;
};

/** Fraction non réduite telle qu'écrite dans l'énoncé : $\frac{6}{8}$. */
export const rawFrac = (n: number, d: number) => `${n < 0 ? '-' : ''}\\frac{${Math.abs(n)}}{${d}}`;

/** Réponse décimale exacte (au plus six chiffres après la virgule). */
export const numDec = (v: number): Answer => ({ kind: 'number', value: frac(Math.round(v * 1e6), 1e6) });

/** Couple de nombres (coordonnées d'un point, par exemple). */
export const pair = (a: number | Frac, b: number | Frac, labels: [string, string]): Answer => ({
  kind: 'pair',
  values: [typeof a === 'number' ? frac(Math.round(a * 1e6), 1e6) : a, typeof b === 'number' ? frac(Math.round(b * 1e6), 1e6) : b],
  labels,
});

/** Entiers distincts tirés entre min et max. */
export function distinct(rng: Rng, n: number, min: number, max: number): number[] {
  const out: number[] = [];
  let guard = 0;
  while (out.length < n && guard++ < 500) {
    const v = rng.int(min, max);
    if (!out.includes(v)) out.push(v);
  }
  return out;
}

export const isPrime = (n: number) => {
  if (n < 2) return false;
  for (let p = 2; p * p <= n; p++) if (n % p === 0) return false;
  return true;
};

export const divisors = (n: number) => Array.from({ length: n }, (_, i) => i + 1).filter((d) => n % d === 0);

/** Arrondi au dixième, sans erreur d'écriture flottante. */
export const round1 = (v: number) => Math.round(v * 10) / 10;
