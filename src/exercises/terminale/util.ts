import { type Frac, frac, fracLatex } from '../fraction';
import type { Rng } from '../rng';
import { type Answer, type Exercise, type Level, type Skill, makeChoice } from '../types';

/** Outils partagés par les chapitres de Terminale. */

export type Draft = Omit<Exercise, 'skill' | 'level'>;

/** Déclare une compétence : l'identifiant et le niveau sont recopiés dans chaque exercice. */
export function skill(id: string, name: string, make: (rng: Rng, level: Level) => Draft): Skill {
  return { id, name, generate: (rng, level) => ({ skill: id, level, ...make(rng, level) }) };
}

export const add = (a: Frac, b: Frac) => frac(a.n * b.d + b.n * a.d, a.d * b.d);
export const sub = (a: Frac, b: Frac) => frac(a.n * b.d - b.n * a.d, a.d * b.d);
export const mul = (a: Frac, b: Frac) => frac(a.n * b.n, a.d * b.d);
export const div = (a: Frac, b: Frac) => frac(a.n * b.d, a.d * b.n);
export const fpow = (a: Frac, k: number) => frac(a.n ** k, a.d ** k);
export const F = (n: number, d = 1) => frac(n, d);
export const tex = fracLatex;

/** Nombre entre parenthèses s'il est négatif. */
export const par = (v: number | Frac) => {
  const s = typeof v === 'number' ? String(v) : tex(v);
  return s.startsWith('-') ? `(${s})` : s;
};

/** Écrit c·x^k en tête (first) ou comme terme suivant (« + 3x », « - x »). */
function monomial(c: number, power: number, v: string, first: boolean): string {
  if (c === 0) return '';
  const abs = Math.abs(c);
  const coef = power > 0 && abs === 1 ? '' : String(abs);
  const varPart = power === 0 ? '' : power === 1 ? v : `${v}^{${power}}`;
  const sign = c < 0 ? (first ? '-' : ' - ') : first ? '' : ' + ';
  return `${sign}${coef}${varPart}`;
}

/** Polynôme à coefficients entiers, du plus haut degré au terme constant. */
export function poly(coefs: number[], v = 'x'): string {
  let out = '';
  coefs.forEach((c, i) => {
    out += monomial(c, coefs.length - 1 - i, v, out === '');
  });
  return out || '0';
}

/** « + 3 » ou « - 3 » pour continuer une expression ; vide si nul. */
export const plus = (v: number) => (v === 0 ? '' : ` ${v < 0 ? '-' : '+'} ${Math.abs(v)}`);

/** Facteur affine ax + b, sans parenthèses. */
export const affine = (a: number, b: number, v = 'x') => poly([a, b], v);

/** Coordonnées d'un point ou d'un vecteur de l'espace. */
export const coords = (p: readonly number[]) => `(${p.join('\\,;\\,')})`;
export const vec = (p: readonly number[]) => `\\begin{pmatrix}${p.join('\\\\')}\\end{pmatrix}`;

export const dot = (u: readonly number[], v: readonly number[]) => u.reduce((s, x, i) => s + x * v[i], 0);
export const cross = (u: readonly number[], v: readonly number[]) => [
  u[1] * v[2] - u[2] * v[1],
  u[2] * v[0] - u[0] * v[2],
  u[0] * v[1] - u[1] * v[0],
];

export const fact = (n: number): number => (n <= 1 ? 1 : n * fact(n - 1));
export const binom = (n: number, k: number): number => (k < 0 || k > n ? 0 : fact(n) / (fact(k) * fact(n - k)));

export const num = (n: number): Answer => ({ kind: 'number', value: frac(n) });
export const numF = (f: Frac): Answer => ({ kind: 'number', value: f });

/** QCM dont les options sont des formules : chaque option est entourée de $…$. */
export function choiceTex(rng: Rng, correct: string, decoys: string[], filler: () => string): Answer {
  const wrap = (s: string) => `$${s}$`;
  return makeChoice(rng, wrap(correct), decoys.map(wrap), () => wrap(filler()));
}

/** QCM à options fixes, dans un ordre fixe (par exemple « croissante / décroissante / constante »). */
export const fixedChoice = (options: string[], correct: number): Answer => ({ kind: 'choice', options, correct });

/** Borne des coefficients selon le niveau. */
export const bound = (level: Level, l1: number, l2: number, l3: number) => (level === 1 ? l1 : level === 2 ? l2 : l3);
