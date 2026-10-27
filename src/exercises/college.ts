import type { Rng } from './rng';
import type { Answer } from './types';
import { fixedChoice } from './terminale/util';

/** Outils communs aux variantes d'exercices du collège (6e à 3e). */

export { dec, decText, fl, gcd, par } from './seconde/outils';
export { choiceTex, fixedChoice, poly } from './terminale/util';
export { decimal, fraction, lcm, round } from './troisieme/outils';
export { makeChoice } from './types';

const PRENOMS = ['Léa', 'Tom', 'Inès', 'Hugo', 'Nina', 'Yanis', 'Jade', 'Malo', 'Sofia', 'Noé', 'Chloé', 'Rayan', 'Lina', 'Adam', 'Zoé', 'Lucas'];

export const prenom = (rng: Rng): string => rng.pick(PRENOMS);

/** Deux prénoms différents. */
export function deuxPrenoms(rng: Rng): [string, string] {
  const [a, b] = rng.shuffle(PRENOMS);
  return [a, b];
}

export const vraiFaux = (vrai: boolean): Answer => fixedChoice(['Vrai', 'Faux'], vrai ? 0 : 1);
export const ouiNon = (oui: boolean): Answer => fixedChoice(['Oui', 'Non'], oui ? 0 : 1);

/** Euros écrits en LaTeX avec deux décimales si besoin : « 12{,}50 ». */
export const euros = (v: number): string => {
  const r = Math.round(v * 100) / 100;
  return Number.isInteger(r) ? String(r) : r.toFixed(2).replace('.', '{,}');
};
