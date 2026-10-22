import { type Frac, frac } from '../fraction';
import type { Rng } from '../rng';
import { type Answer, type Exercise, type Level, type Skill, makeChoice } from '../types';

/** Petits outils d'écriture partagés par les chapitres de 6e. */

/** Supprime les erreurs d'arrondi des calculs décimaux (0,1 + 0,2). */
export const fix = (v: number): number => Math.round(v * 1e6) / 1e6 + 0;

/** Nombre en LaTeX à la française : virgule décimale et espace fine entre les classes. */
export function num(v: number): string {
  const [int, decs] = String(Math.abs(fix(v))).split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, '\\,');
  return `${fix(v) < 0 ? '-' : ''}${grouped}${decs ? `{,}${decs}` : ''}`;
}

/** Fraction exacte d'un décimal. */
export const exact = (v: number): Frac => frac(Math.round(v * 1e6), 1e6);

/** Réponse numérique. */
export const numAnswer = (v: number): Answer => ({ kind: 'number', value: exact(v) });

/** Réponse en deux nombres (quotient et reste, heures et minutes…). */
export const pairAnswer = (a: number, b: number, labels: [string, string]): Answer => ({
  kind: 'pair',
  values: [exact(a), exact(b)],
  labels,
});

/** QCM aux options écrites en LaTeX (entourées de $…$). */
export function mathChoice(rng: Rng, correct: string, decoys: string[], filler: () => string): Answer {
  const wrap = (s: string) => `$${s}$`;
  return makeChoice(rng, wrap(correct), decoys.map(wrap), () => wrap(filler()));
}

/** QCM à options fixes, dans un ordre fixe (Oui / Non, aigu / droit / obtus…). */
export const fixedChoice = (options: string[], correct: number): Answer => ({ kind: 'choice', options, correct });

export const yesNo = (yes: boolean): Answer => fixedChoice(['Oui', 'Non'], yes ? 0 : 1);

/** Valeur selon le niveau. */
export const byLevel = <T>(level: Level, easy: T, medium: T, hard: T): T => (level === 1 ? easy : level === 2 ? medium : hard);

/** Déclare une compétence de 6e : l'identifiant est préfixé par « 6e- ». */
export function skill(id: string, name: string, generate: (rng: Rng, level: Level) => Omit<Exercise, 'skill' | 'level'>): Skill {
  const full = `6e-${id}`;
  return { id: full, name, generate: (rng, level) => ({ skill: full, level, ...generate(rng, level) }) };
}

/** Décimal tiré au hasard : entre min et max, avec `decimals` chiffres après la virgule. */
export function decimal(rng: Rng, min: number, max: number, decimals: number): number {
  const scale = 10 ** decimals;
  return fix(rng.int(Math.round(min * scale), Math.round(max * scale)) / scale);
}

/** Nombre de chiffres après la virgule. */
export const decimalsOf = (v: number): number => (String(fix(v)).split('.')[1] ?? '').length;

export const gcd = (a: number, b: number): number => {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
};

/** Fraction en LaTeX (sans simplifier). */
export const fr = (n: number | string, d: number | string): string => `\\frac{${n}}{${d}}`;

/** Tableau LaTeX à bordures : une ligne d'en-tête puis des lignes de valeurs. */
export function table(rows: string[][]): string {
  const cols = rows[0].length;
  const body = rows.map((r) => r.join(' & ')).join(' \\\\ \\hline ');
  return `\\begin{array}{|${'c|'.repeat(cols)}} \\hline ${body} \\\\ \\hline \\end{array}`;
}

/** Texte dans une formule LaTeX. */
export const tx = (s: string): string => `\\text{${s}}`;

/** Prénom pour les énoncés. */
export const prenom = (rng: Rng): string =>
  rng.pick(['Léa', 'Tom', 'Inès', 'Noah', 'Jade', 'Lucas', 'Chloé', 'Adam', 'Emma', 'Yanis', 'Lina', 'Hugo', 'Sofia', 'Malik']);

/** Tirage de n entiers distincts. */
export function distinctInts(rng: Rng, n: number, min: number, max: number): number[] {
  const out: number[] = [];
  while (out.length < n) {
    const v = rng.int(min, max);
    if (!out.includes(v)) out.push(v);
  }
  return out;
}

export { makeChoice };

/** Mesure d'angle en degrés, en LaTeX. */
export const deg = (v: number): string => `${num(v)}^\\circ`;
