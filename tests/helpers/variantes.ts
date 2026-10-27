import katex from 'katex';
import { expect, it } from 'vitest';
import type { VariedSkill } from '../../src/exercises/licenceVariantes';
import { Rng } from '../../src/exercises/rng';
import { type Answer, type Exercise, type Level, type Response, type Skill, checkAnswer } from '../../src/exercises/types';

/** Vérifications communes aux variantes des compétences de Licence. */

function badResponse(answer: Answer): Response {
  switch (answer.kind) {
    case 'number':
      return String(answer.value.n / answer.value.d + 1);
    case 'set':
      return answer.values.length ? '1000' : '0';
    case 'pair':
      return ['1000', '1000'];
    case 'choice':
      return (answer.correct + 1) % answer.options.length;
  }
}

export const variantsOf = (s: Skill): Skill[] => (s as Partial<VariedSkill>).variants?.slice(1) ?? [];

/** Tous les tirages de la variante k (k ≥ 1) d'une compétence, niveaux 1 à 3. */
export function drawsOf(skills: Skill[], id: string, k: number, count = 60): Exercise[] {
  const s = skills.find((x) => x.id === id);
  if (!s) throw new Error(`compétence inconnue : ${id}`);
  const v = (s as VariedSkill).variants?.[k];
  if (!v) throw new Error(`${id} : pas de variante ${k}`);
  return [1, 2, 3].flatMap((level) => Array.from({ length: count }, (_, seed) => v.generate(new Rng(seed * 7 + level * 1000), level as Level)));
}

export const numberOf = (ex: Exercise) => {
  if (ex.answer.kind !== 'number') throw new Error(`${ex.skill} : réponse non numérique`);
  return ex.answer.value.n / ex.answer.value.d;
};

/** La bonne option d'un QCM, sans les $ éventuels. */
export const choiceOf = (ex: Exercise) => {
  if (ex.answer.kind !== 'choice') throw new Error(`${ex.skill} : QCM attendu`);
  return ex.answer.options[ex.answer.correct];
};

/** Pour chaque variante : mauvaise réponse refusée, textes propres, formules lisibles, tirage reproductible. */
export function checkVariants(skills: Skill[], minPerSkill: number) {
  it(`chaque compétence a au moins ${minPerSkill} nouvelles variantes`, () => {
    for (const s of skills) expect(variantsOf(s).length, s.id).toBeGreaterThanOrEqual(minPerSkill);
  });
  for (const s of skills)
    variantsOf(s).forEach((v, i) =>
      it(`${s.id}, variante ${i + 1} : réponse refusée si fausse, textes propres`, async () => {
        for (const level of [1, 2, 3] as Level[])
          for (let seed = 1; seed <= 80; seed++) {
            const ex = v.generate(new Rng(seed * 15485863 + level), level);
            const where = `${s.id} v${i + 1} niv. ${level} graine ${seed}`;
            expect(ex.skill, where).toBe(s.id);
            expect(checkAnswer(ex.answer, badResponse(ex.answer)), where).toBe(false);
            const texts = [ex.prompt, ex.hint, ...ex.correction, ...(ex.answer.kind === 'choice' ? ex.answer.options : [])];
            expect(texts.join(' '), where).not.toMatch(/NaN|undefined|Infinity|\+ -|- -|--|\[object|\+ \+/);
            for (const t of texts) {
              expect((t.match(/\$/g) ?? []).length % 2, `${where} : ${t}`).toBe(0);
              for (const m of t.matchAll(/\$([^$]+)\$/g)) expect(() => katex.renderToString(m[1], { throwOnError: true }), `${where} : ${m[1]}`).not.toThrow();
            }
            if (ex.answer.kind === 'choice') {
              expect(new Set(ex.answer.options).size, where).toBe(ex.answer.options.length);
              expect(ex.answer.options.length, where).toBeGreaterThanOrEqual(2);
            }
          }
        expect(v.generate(new Rng(42), 2)).toEqual(v.generate(new Rng(42), 2));
        await new Promise((resolve) => setTimeout(resolve, 0));
      }),
    );
}
