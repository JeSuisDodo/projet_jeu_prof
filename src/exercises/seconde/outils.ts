import { type Frac, frac, fracLatex } from '../fraction';
import type { Rng } from '../rng';
import { type Answer, makeChoice } from '../types';

/** Petits outils d'écriture partagés par les chapitres de 2nde. */

/** Nombre décimal en LaTeX, avec la virgule française. */
export const dec = (v: number): string => {
  return String(Math.round(v * 1e6) / 1e6 + 0).replace('.', '{,}');
};

/** Nombre décimal en texte (hors LaTeX), avec la virgule. */
export const decText = (v: number): string => String(Math.round(v * 1e6) / 1e6 + 0).replace('.', ',');

/** Fraction exacte d'un décimal (au plus six chiffres après la virgule). */
export const fracOf = (v: number): Frac => frac(Math.round(v * 1e6), 1e6);

/** Nombre entre parenthèses s'il est négatif. */
export const par = (v: number): string => (v < 0 ? `(${dec(v)})` : dec(v));

/** Somme de termes « coefficient × monôme » en LaTeX ; les coefficients nuls disparaissent. */
export function terms(parts: [number, string][]): string {
  let out = '';
  for (const [c, m] of parts) {
    if (c === 0) continue;
    const abs = Math.abs(c);
    const body = m === '' ? dec(abs) : `${abs === 1 ? '' : dec(abs)}${m}`;
    if (out === '') out = `${c < 0 ? '-' : ''}${body}`;
    else out += ` ${c < 0 ? '-' : '+'} ${body}`;
  }
  return out === '' ? '0' : out;
}

/** ax + b */
export const affine = (a: number, b: number, v = 'x') => terms([[a, v], [b, '']]);

/** ax² + bx + c */
export const poly2 = (a: number, b: number, c: number) => terms([[a, 'x^2'], [b, 'x'], [c, '']]);

/** Fraction rationnelle en LaTeX. */
export const fl = (n: number, d = 1) => fracLatex(frac(n, d));

/** « + 3 » ou « - 3 » pour écrire une somme. */
export const signed = (v: number) => `${v < 0 ? '-' : '+'} ${dec(Math.abs(v))}`;

/** QCM entouré de $…$. */
export function latexChoice(rng: Rng, correct: string, decoys: string[], filler: () => string): Answer {
  const wrap = (s: string) => `$${s}$`;
  return makeChoice(rng, wrap(correct), decoys.map(wrap), () => wrap(filler()));
}

/** QCM à options fixes (Oui / Non, ou les trois positions de deux droites…). */
export const fixedChoice = (options: string[], correct: number): Answer => ({ kind: 'choice', options, correct });

export const gcd = (a: number, b: number): number => {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
};

/** Crochets ouverts « à la française » : sans \\mathopen, KaTeX lit « ]-3 » comme une soustraction. */
const OPEN_LEFT = '\\mathopen{]}';
const OPEN_RIGHT = '\\mathclose{[}';

/** Intervalle en LaTeX ; null pour l'infini. */
export function interval(lo: number | null, loClosed: boolean, hi: number | null, hiClosed: boolean): string {
  const left = lo === null ? `${OPEN_LEFT}-\\infty` : `${loClosed ? '[' : OPEN_LEFT}${dec(lo)}`;
  const right = hi === null ? `+\\infty${OPEN_RIGHT}` : `${dec(hi)}${hiClosed ? ']' : OPEN_RIGHT}`;
  return `${left}\\,;\\,${right}`;
}

/** Intervalle dont les bornes sont des fractions. */
export function fracInterval(lo: Frac | null, loClosed: boolean, hi: Frac | null, hiClosed: boolean): string {
  const left = lo === null ? `${OPEN_LEFT}-\\infty` : `${loClosed ? '[' : OPEN_LEFT}${fracLatex(lo)}`;
  const right = hi === null ? `+\\infty${OPEN_RIGHT}` : `${fracLatex(hi)}${hiClosed ? ']' : OPEN_RIGHT}`;
  return `${left}\\,;\\,${right}`;
}

/** Tirage de n entiers distincts. */
export function distinctInts(rng: Rng, n: number, min: number, max: number): number[] {
  const out: number[] = [];
  while (out.length < n) {
    const v = rng.int(min, max);
    if (!out.includes(v)) out.push(v);
  }
  return out;
}
