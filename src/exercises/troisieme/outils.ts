import { type Frac, frac } from '../fraction';
import type { Rng } from '../rng';
import type { Answer } from '../types';

/** Outils partagés par les chapitres de 3e (ceux de 2nde et de Terminale font déjà l'essentiel). */

export { dec, decText, fl, fracOf, gcd, par } from '../seconde/outils';
export { choiceTex, fixedChoice, num, numF, poly, skill, type Draft } from '../terminale/util';

export const lcm = (a: number, b: number): number => {
  let x = a;
  let y = b;
  while (y) [x, y] = [y, x % y];
  return (a / x) * b;
};

/** Arrondi à `digits` chiffres après la virgule (0 = à l'unité). */
export const round = (v: number, digits = 0): number => {
  const p = 10 ** digits;
  return Math.round(v * p + Number.EPSILON * Math.sign(v)) / p;
};

/** Vrai si la valeur tombe trop près d'un « 5 » pour être arrondie sans ambiguïté. */
export const nearTie = (v: number, digits = 0): boolean => {
  const x = Math.abs(v * 10 ** digits);
  return Math.abs(x - Math.floor(x) - 0.5) < 0.02;
};

/** Réponse décimale exacte (au plus six chiffres après la virgule). */
export const decimal = (v: number): Answer => ({ kind: 'number', value: frac(Math.round(v * 1e6), 1e6) });

/** Réponse fractionnaire. */
export const fraction = (n: number, d = 1): Answer => ({ kind: 'number', value: frac(n, d) });

export const fracValue = (f: Frac) => f.n / f.d;

/** Mesure d'angle en degrés vers radians. */
export const rad = (deg: number) => (deg * Math.PI) / 180;
export const deg = (r: number) => (r * 180) / Math.PI;

/** Tire au sort jusqu'à ce que la condition soit remplie (avec garde-fou). */
export function draw<T>(make: () => T, ok: (v: T) => boolean, tries = 200): T {
  let v = make();
  for (let i = 0; i < tries && !ok(v); i++) v = make();
  return v;
}

/** Choisit au hasard en évitant certaines valeurs. */
export const pickOther = <T>(rng: Rng, items: readonly T[], avoid: readonly T[]): T => rng.pick(items.filter((x) => !avoid.includes(x)));
