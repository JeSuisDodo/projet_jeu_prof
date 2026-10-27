import { expect, it } from 'vitest';
import { Rng } from '../../src/exercises/rng';
import type { Exercise, Level, Skill } from '../../src/exercises/types';

/**
 * Outils des tests de justesse des variantes de Licence. Les vérifications de forme (textes propres,
 * LaTeX lisible, bonne réponse acceptée, mauvaise refusée) sont faites pour toutes les variantes par
 * tests/variantes.test.ts.
 */

/** Tous les tirages de la variante « forme-k » d'une compétence, niveaux 1 à 3. */
export function drawsOf(skills: Skill[], id: string, k: number, count = 60): Exercise[] {
  const s = skills.find((x) => x.id === id);
  if (!s) throw new Error(`compétence inconnue : ${id}`);
  const v = s.variants?.find((x) => x.name === `forme-${k + 1}`);
  if (!v) throw new Error(`${id} : pas de variante ${k}`);
  return [1, 2, 3].flatMap((level) => Array.from({ length: count }, (_, seed) => v.generate(new Rng(seed * 7 + level * 1000), level as Level)));
}

export const numberOf = (ex: Exercise) => {
  if (ex.answer.kind !== 'number') throw new Error(`${ex.skill} : réponse non numérique`);
  return ex.answer.value.n / ex.answer.value.d;
};

export const pairValues = (ex: Exercise) => {
  if (ex.answer.kind !== 'pair') throw new Error(`${ex.skill} : couple attendu`);
  return ex.answer.values.map((f) => f.n / f.d);
};

/** Chaque compétence du niveau a au moins `min` nouvelles formes. */
export function checkVariantCount(skills: Skill[], min: number) {
  it(`chaque compétence a au moins ${min} nouvelles formes de questions`, () => {
    for (const s of skills) expect((s.variants?.length ?? 1) - 1, s.id).toBeGreaterThanOrEqual(min);
  });
}
