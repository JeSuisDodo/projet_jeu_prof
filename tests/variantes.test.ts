import katex from 'katex';
import { describe, expect, it } from 'vitest';
import { GRADES } from '../src/content';
import { Rng } from '../src/exercises/rng';
import { type Answer, type Level, type Response, checkAnswer } from '../src/exercises/types';

/**
 * Chaque variante d'exercice (voir src/exercises/variantes.ts) est tirée seule, à chaque niveau
 * où elle peut sortir : énoncé propre, LaTeX lisible, bonne réponse acceptée, mauvaise refusée.
 */

const text = (f: { n: number; d: number }) => (f.d === 1 ? String(f.n) : `${f.n}/${f.d}`);

function good(answer: Answer): Response {
  switch (answer.kind) {
    case 'number':
      return text(answer.value);
    case 'set':
      return answer.values.length ? answer.values.map(text).join(' ; ') : 'aucune';
    case 'pair':
      return [text(answer.values[0]), text(answer.values[1])];
    case 'choice':
      return answer.correct;
  }
}

function bad(answer: Answer): Response {
  switch (answer.kind) {
    case 'number':
      return text({ n: answer.value.n + answer.value.d, d: answer.value.d });
    case 'set':
      return answer.values.length ? '1000' : '0';
    case 'pair':
      return ['1000', '1000'];
    case 'choice':
      return (answer.correct + 1) % answer.options.length;
  }
}

const enriched = GRADES.flatMap((g) => g.chapters.flatMap((c) => c.skills.filter((s) => s.variants).map((s) => ({ grade: g.name, skill: s }))));

describe('variantes d’exercices', () => {
  it('existent', () => {
    expect(enriched.length).toBeGreaterThan(0);
  });

  for (const { grade, skill } of enriched)
    for (const v of skill.variants!.slice(1))
      it(`${grade} · ${skill.id} / ${v.name}`, () => {
        expect(skill.variants!.filter((x) => x.name === v.name).length, 'nom de variante en double').toBe(1);
        for (const level of [1, 2, 3] as Level[]) {
          if (level < v.from) continue;
          for (let seed = 1; seed <= 120; seed++) {
            const ex = v.generate(new Rng(seed * 6007 + level), level);
            const where = `${skill.id}/${v.name} niv. ${level} graine ${seed}`;
            expect(ex.skill, where).toBe(skill.id);
            expect(ex.level, where).toBe(level);
            expect(ex.correction.length, where).toBeGreaterThan(0);
            const texts = [ex.prompt, ex.hint, ...ex.correction, ...(ex.answer.kind === 'choice' ? ex.answer.options : [])];
            expect(texts.join(' '), where).not.toMatch(/NaN|undefined|Infinity|\[object|\+ -|- -|e-\d|e\+\d/);
            for (const t of texts) {
              expect((t.match(/\$/g) ?? []).length % 2, `${where} : ${t}`).toBe(0);
              for (const m of t.matchAll(/\$([^$]+)\$/g)) expect(() => katex.renderToString(m[1], { throwOnError: true }), `${where} : ${m[1]}`).not.toThrow();
            }
            if (ex.answer.kind === 'choice') {
              expect(new Set(ex.answer.options).size, `${where} : options en double`).toBe(ex.answer.options.length);
              expect(ex.answer.options.length, where).toBeGreaterThanOrEqual(2);
            }
            expect(checkAnswer(ex.answer, good(ex.answer)), where).toBe(true);
            expect(checkAnswer(ex.answer, bad(ex.answer)), where).toBe(false);
          }
        }
        expect(v.generate(new Rng(42), 3)).toEqual(v.generate(new Rng(42), 3));
      });

  it('la forme tirée change d’une graine à l’autre', () => {
    for (const { skill } of enriched) {
      const prompts = new Set(Array.from({ length: 60 }, (_, i) => skill.generate(new Rng(i + 1), 3).prompt.replace(/[-\d{},.\s]+/g, '')));
      expect(prompts.size, skill.id).toBeGreaterThan(1);
    }
  });
});
