import katex from 'katex';
import { describe, expect, it } from 'vitest';
import { QUATRIEME } from '../src/content/quatrieme';
import { Rng } from '../src/exercises/rng';
import { baseOf } from '../src/exercises/variantes';
import { type Answer, type Level, type Response, checkAnswer } from '../src/exercises/types';
import { skillById } from '../src/content';

/** Vérifications propres à la 4e, en plus de tests/content.test.ts. */

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

const skills = QUATRIEME.chapters.flatMap((c) => c.skills);
const value = (a: Answer) => (a.kind === 'number' ? a.value.n / a.value.d : NaN);

describe('4e', () => {
  it('couvre le programme de 4e (un chapitre par région)', () => {
    expect(QUATRIEME.chapters.length).toBeGreaterThanOrEqual(14);
    for (const c of QUATRIEME.chapters) expect(c.id.startsWith('4e-')).toBe(true);
    for (const s of skills) expect(s.id.startsWith('4e-')).toBe(true);
  });

  for (const skill of skills)
    it(`${skill.id} : mauvaise réponse refusée, textes propres, tirage reproductible`, async () => {
      for (const level of [1, 2, 3] as Level[])
        for (let seed = 1; seed <= 200; seed++) {
          const ex = skill.generate(new Rng(seed * 104729 + level), level);
          const where = `${skill.id} niv. ${level} graine ${seed}`;
          expect(checkAnswer(ex.answer, badResponse(ex.answer)), where).toBe(false);
          const texts = [ex.prompt, ex.hint, ...ex.correction, ...(ex.answer.kind === 'choice' ? ex.answer.options : [])];
          expect(texts.join(' '), where).not.toMatch(/NaN|undefined|Infinity|\+ -|- -|\[object|e-\d|e\+\d/);
          for (const t of texts) {
            expect((t.match(/\$/g) ?? []).length % 2, `${where} : ${t}`).toBe(0);
            for (const m of t.matchAll(/\$([^$]+)\$/g)) expect(() => katex.renderToString(m[1], { throwOnError: true }), `${where} : ${m[1]}`).not.toThrow();
          }
        }
      expect(skill.generate(new Rng(42), 2)).toEqual(skill.generate(new Rng(42), 2));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
});

/** Relit les nombres d'un énoncé (virgule décimale, signe moins). */
const numbers = (s: string) => [...s.replace(/{,}/g, ',').matchAll(/-?\d+(?:[.,]\d+)?/g)].map((m) => Number(m[0].replace(',', '.')));

describe('4e : justesse des calculs', () => {
  const gen = (id: string, level: Level, seed: number) => baseOf(skillById(id)).generate(new Rng(seed), level);

  it('Pythagore : hypoténuse² = somme des carrés', () => {
    for (let seed = 1; seed <= 300; seed++) {
      const ex = gen('4e-hypotenuse', 2, seed);
      const [a, b] = numbers(ex.prompt.split('avec')[1]);
      expect(value(ex.answer)).toBeCloseTo(Math.sqrt(a * a + b * b), 6);
    }
  });

  it('équations : la solution vérifie l’équation', () => {
    for (let seed = 1; seed <= 300; seed++)
      for (const level of [1, 2, 3] as Level[]) {
        const ex = gen('4e-equation-deux-membres', level, seed);
        const m = /\$(-?\d*)x(?: ([+-]) (\d+))? = (-?\d*)x(?: ([+-]) (\d+))?\$/.exec(ex.prompt.replace(/\\/g, ''))!;
        expect(m, ex.prompt).not.toBeNull();
        const coef = (s: string) => (s === '' ? 1 : s === '-' ? -1 : Number(s));
        const cst = (sign?: string, v?: string) => (v ? (sign === '-' ? -1 : 1) * Number(v) : 0);
        const x = value(ex.answer);
        expect(coef(m[1]) * x + cst(m[2], m[3])).toBeCloseTo(coef(m[4]) * x + cst(m[5], m[6]), 9);
      }
  });

  it('notation scientifique : 1 ≤ a < 10', () => {
    for (let seed = 1; seed <= 300; seed++)
      for (const level of [1, 2, 3] as Level[]) {
        const ex = gen('4e-notation-scientifique', level, seed);
        if (ex.answer.kind !== 'pair') throw new Error('couple attendu');
        const a = ex.answer.values[0].n / ex.answer.values[0].d;
        expect(a).toBeGreaterThanOrEqual(1);
        expect(a).toBeLessThan(10);
      }
  });

  it('accepte la virgule décimale et la fraction équivalente', () => {
    const ex = gen('4e-evolution', 2, 3);
    const v = value(ex.answer);
    expect(checkAnswer(ex.answer, String(v).replace('.', ','))).toBe(true);
    const q = gen('4e-quotient-fractions', 2, 5);
    if (q.answer.kind !== 'number') throw new Error();
    expect(checkAnswer(q.answer, `${q.answer.value.n * 3}/${q.answer.value.d * 3}`)).toBe(true);
  });
});
