import { type Frac, frac } from '../fraction';
import type { Rng } from '../rng';
import type { Answer } from '../types';
import { dec, fixedChoice } from '../seconde/outils';

/** Petits outils d'écriture partagés par les chapitres de 5e. */

export { dec, decText, distinctInts, fixedChoice, fracOf, gcd, latexChoice, par } from '../seconde/outils';

/** Réponse numérique exacte à partir d'un décimal (au plus six chiffres après la virgule). */
export const num = (v: number): Answer => ({ kind: 'number', value: frac(Math.round(v * 1e6), 1e6) });

export const yesNo = (yes: boolean): Answer => fixedChoice(['Oui', 'Non'], yes ? 0 : 1);

/** Écriture décimale exacte d'une fraction décimale (dénominateur 2^a × 5^b), virgule française. */
export function decFrac(f: Frac): string {
  let power = 0;
  while (10 ** power % f.d !== 0) {
    if (++power > 12) throw new Error(`Pas un décimal : ${f.n}/${f.d}`);
  }
  const n = (Math.abs(f.n) * 10 ** power) / f.d;
  const digits = String(n).padStart(power + 1, '0');
  const out = power ? `${digits.slice(0, -power)}{,}${digits.slice(-power)}` : digits;
  return (f.n < 0 ? '-' : '') + out;
}

/** Valeur d'une mesure d'angle en LaTeX : « 47^\circ ». */
export const deg = (v: number) => `${dec(v)}^\\circ`;

/** Mesure avec unité en LaTeX : « 4{,}5\text{ cm} ». */
export const unit = (v: number, u: string) => `${dec(v)}\\text{ ${u}}`;

/** Nombre décimal arrondi à 0,1 près au hasard dans [min ; max]. */
export const tenth = (rng: Rng, min: number, max: number) => rng.int(min * 10, max * 10) / 10;
