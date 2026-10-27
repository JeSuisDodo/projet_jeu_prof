import { Rng } from '../../src/exercises/rng';
import type { Exercise, Level, Skill } from '../../src/exercises/types';
import { variantOf } from '../../src/exercises/variantes';

/**
 * Outils pour tester la justesse des variantes d'exercices (voir src/exercises/variantes.ts) ;
 * la forme (LaTeX, réponses acceptées ou refusées) est vérifiée pour toutes par tests/variantes.test.ts.
 */

/** Les variantes (hors forme d'origine) d'une liste de compétences. */
export const variantesDe = (skills: Skill[]) => skills.flatMap((s) => (s.variants ?? []).slice(1).map((v) => ({ skill: s, nom: v.name })));

/** Tirages d'une variante précise, sur les trois niveaux. */
export function* tirages(skills: Skill[], id: string, nom: string, count = 80): Generator<Exercise> {
  const skill = skills.find((s) => s.id === id);
  if (!skill) throw new Error(`Compétence inconnue : ${id}`);
  const generate = variantOf(skill, nom);
  for (const level of [1, 2, 3] as Level[]) for (let seed = 1; seed <= count; seed++) yield generate(new Rng(seed * 7727 + level), level);
}

/** Nombre décimal écrit « 2{,}5 » ou « 2,5 » → 2.5. */
export const lireNombre = (s: string) => Number(s.replace('{,}', '.').replace(',', '.').replace(/\s/g, ''));

/** Valeur numérique d'une réponse de type nombre. */
export function valeur(ex: Exercise): number {
  if (ex.answer.kind !== 'number') throw new Error(`réponse non numérique : ${ex.prompt}`);
  return ex.answer.value.n / ex.answer.value.d;
}

/** Texte de l'option juste d'un QCM. */
export function optionJuste(ex: Exercise): string {
  if (ex.answer.kind !== 'choice') throw new Error(`pas un QCM : ${ex.prompt}`);
  return ex.answer.options[ex.answer.correct];
}

/** Nombres entiers (ou décimaux) écrits entre $…$ seuls, dans l'ordre. */
export const nombres = (s: string) => [...s.matchAll(/\$(-?\d+(?:\{,\}\d+)?)\$/g)].map((m) => lireNombre(m[1]));

/** Valeur d'une borne d'intervalle écrite en LaTeX (« -\infty », « 2{,}5 », « -\frac{3}{2} »). */
function borne(tex: string, evaluer: (s: string) => number): number {
  if (tex === '-\\infty') return -Infinity;
  if (tex === '+\\infty') return Infinity;
  return evaluer(tex.replace('{,}', '.'));
}

/**
 * Prédicat d'appartenance à un ensemble écrit en LaTeX : intervalles (crochets « à la française »),
 * réunions avec \cup, \varnothing, \mathbb{R}. Les bornes sont lues une seule fois.
 */
export function ensemble(tex: string, evaluer: (s: string) => number): (x: number) => boolean {
  const s = tex.replace(/\$/g, '').trim();
  if (s === '\\varnothing') return () => false;
  if (s === '\\mathbb{R}') return () => true;
  const parts = s.split(' \\cup ').map((part) => {
    const m = /^(\[|\\mathopen\{\]\})(.+)\\,;\\,(.+?)(\]|\\mathclose\{\[\})$/.exec(part.trim());
    if (!m) throw new Error(`intervalle illisible : ${part}`);
    return { lo: borne(m[2], evaluer), hi: borne(m[3], evaluer), lc: m[1] === '[', hc: m[4] === ']' };
  });
  return (x) => parts.some(({ lo, hi, lc, hc }) => (lc ? x >= lo - 1e-12 : x > lo + 1e-12) && (hc ? x <= hi + 1e-12 : x < hi - 1e-12));
}

export const dansEnsemble = (tex: string, x: number, evaluer: (s: string) => number) => ensemble(tex, evaluer)(x);
