import { type Frac, frac } from '../fraction';
import type { Rng } from '../rng';
import { type Answer, makeChoice } from '../types';
import { F, add, mul, tex } from '../terminale/util';

/** Outils partagés par les chapitres de Licence 3 (en plus de ceux de Terminale). */

export * from '../terminale/util';

export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}

export const lcm = (a: number, b: number) => (a / gcd(a, b)) * b;

/** Indicatrice d'Euler. */
export function phi(n: number): number {
  let count = 0;
  for (let k = 1; k <= n; k++) if (gcd(k, n) === 1) count++;
  return count;
}

/** Inverse de a modulo n, entre 0 et n - 1 (a premier avec n). */
export function modInverse(a: number, n: number): number {
  const r = ((a % n) + n) % n;
  for (let x = 1; x < n; x++) if ((r * x) % n === 1) return x;
  throw new Error(`${a} n'est pas inversible modulo ${n}`);
}

export const mod = (a: number, n: number) => ((a % n) + n) % n;

/** Diviseurs positifs de n. */
export const divisors = (n: number) => Array.from({ length: n }, (_, i) => i + 1).filter((d) => n % d === 0);

/** Valeur d'une fraction en nombre décimal. */
export const val = (f: Frac) => f.n / f.d;

/** Fraction entre parenthèses si elle est négative. */
export const parF = (f: Frac) => (f.n < 0 ? `\\left(${tex(f)}\\right)` : tex(f));

/** Somme de fractions. */
export const sumF = (list: Frac[]) => list.reduce((s, x) => add(s, x), F(0));

/** Produit de fractions. */
export const prodF = (list: Frac[]) => list.reduce((s, x) => mul(s, x), F(1));

/** a × b avec parenthèses autour de b s'il est négatif. */
export const times = (a: number | string, b: number) => `${a}\\times ${b < 0 ? `(${b})` : b}`;

/** Écrit « + 3 », « - 3 » devant un terme non nul déjà formaté (sans signe). */
export const signed = (c: number, term: string, first = false) => {
  if (c === 0) return '';
  const abs = Math.abs(c);
  const coef = abs === 1 && term !== '' ? '' : String(abs);
  const sign = c < 0 ? (first ? '-' : ' - ') : first ? '' : ' + ';
  return `${sign}${coef}${term}`;
};

/** Combinaison linéaire de termes : [[3, 'x^2'], [-1, 'xy'], [2, '']] → « 3x^2 - xy + 2 ». */
export function combo(terms: [number, string][]): string {
  let out = '';
  for (const [c, t] of terms) out += signed(c, t, out === '');
  return out || '0';
}

/** Tire k éléments distincts dans la liste. */
export const sample = <T>(rng: Rng, items: readonly T[], k: number): T[] => rng.shuffle(items).slice(0, k);

export const fr = frac;

/** « + t » ou « - |t| » pour enchaîner un terme déjà écrit (évite « + -3 »). */
export const plusT = (s: string) => (s.startsWith('-') ? ` - ${s.slice(1)}` : ` + ${s}`);

/** « - t » ou « + |t| » pour soustraire un terme déjà écrit (évite « - -3 »). */
export const minusT = (s: string) => (s.startsWith('-') ? ` + ${s.slice(1)}` : ` - ${s}`);

/** QCM dont les options sont des nombres entiers, chacun entre $…$. */
export const makeChoiceNum = (rng: Rng, correct: number, decoys: number[]): Answer =>
  makeChoice(
    rng,
    `$${correct}$`,
    decoys.map((d) => `$${d}$`),
    () => `$${correct + rng.int(1, 9)}$`,
  );

/** « \frac{n}{d} », suivi de « = forme réduite » quand la fraction se simplifie. */
export function fracSteps(n: number, d: number): string {
  const f = frac(n, d);
  const raw = `${n < 0 ? '-' : ''}\\frac{${Math.abs(n)}}{${d}}`;
  return f.n === n && f.d === d ? raw : `${raw} = ${tex(f)}`;
}
