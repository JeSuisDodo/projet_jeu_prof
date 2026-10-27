import katex from 'katex';
import { describe, expect, it } from 'vitest';
import { LICENCE2 } from '../src/content/licence2';
import { baseOf } from '../src/exercises/variantes';
import { Rng } from '../src/exercises/rng';
import { type Answer, type Level, type Response, checkAnswer } from '../src/exercises/types';
import { conjugate, det2, det3, diag, matMul, sumF, trace, unimodular, F } from '../src/exercises/licence2/util';

/** Vérifications propres à la Licence 2, en plus de tests/content.test.ts. */

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

const skills = LICENCE2.chapters.flatMap((c) => c.skills);

describe('Licence 2', () => {
  it('couvre le programme de L2 (un chapitre par région) dans la catégorie Université', () => {
    expect(LICENCE2.chapters.length).toBeGreaterThanOrEqual(12);
    expect(LICENCE2.stage).toBe('universite');
    for (const c of LICENCE2.chapters) {
      expect(c.id.startsWith('l2-')).toBe(true);
      for (const s of c.skills) expect(s.id.startsWith('l2-'), s.id).toBe(true);
      for (const x of [...c.creatures, c.boss]) expect(x.id, x.id).toMatch(/^l2-[a-z0-9-]+$/);
    }
  });

  for (const skill of skills)
    it(`${skill.id} : mauvaise réponse refusée, textes propres, formules lisibles`, async () => {
      for (const level of [1, 2, 3] as Level[])
        for (let seed = 1; seed <= 200; seed++) {
          const ex = skill.generate(new Rng(seed * 7919 + level), level);
          const where = `${skill.id} niv. ${level} graine ${seed}`;
          expect(checkAnswer(ex.answer, badResponse(ex.answer)), where).toBe(false);
          const texts = [ex.prompt, ex.hint, ...ex.correction, ...(ex.answer.kind === 'choice' ? ex.answer.options : [])];
          expect(texts.join(' '), where).not.toMatch(/NaN|undefined|Infinity|\+ -|- -|\[object|[a-zA-Z)]\^\{1\}|\b1x\b|\\frac\{[^}]*\}\{1\}/);
          for (const t of texts) {
            expect((t.match(/\$/g) ?? []).length % 2, `${where} : ${t}`).toBe(0);
            for (const m of t.matchAll(/\$([^$]+)\$/g)) expect(() => katex.renderToString(m[1], { throwOnError: true }), `${where} : ${m[1]}`).not.toThrow();
          }
          if (ex.answer.kind === 'choice') expect(new Set(ex.answer.options).size, where).toBe(ex.answer.options.length);
        }
      expect(skill.generate(new Rng(42), 2)).toEqual(skill.generate(new Rng(42), 2));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
});

describe('Licence 2 : outils de calcul', () => {
  it('les matrices de passage sont inversibles et A = PDP⁻¹ a le bon spectre', () => {
    const rng = new Rng(3);
    for (let i = 0; i < 200; i++) {
      const { P, Pinv } = unimodular(rng);
      expect(matMul(P, Pinv).map((r) => r.map((v) => v + 0))).toEqual(diag([1, 1]));
      const [a, b] = [rng.int(-4, 4), rng.int(-4, 4)];
      const A = conjugate(P, Pinv, diag([a, b]));
      expect(trace(A) + 0).toBe(a + b + 0);
      expect(det2(A) + 0).toBe(a * b + 0);
      // A³ = P D³ P⁻¹
      const norm = (m: number[][]) => m.map((r) => r.map((v) => v + 0));
      expect(norm(matMul(A, matMul(A, A)))).toEqual(norm(conjugate(P, Pinv, diag([a ** 3, b ** 3]))));
    }
  });

  it('calcule un déterminant 3×3', () => {
    expect(
      det3([
        [2, -1, 0],
        [1, 3, 4],
        [0, 5, -2],
      ]),
    ).toBe(2 * (-6 - 20) + 1 * (-2 - 0));
  });

  it('écrit une somme de fractions sans « + - »', () => {
    expect(sumF([F(1, 3), F(-1, 2), F(0), F(4)])).toBe('\\frac{1}{3} - \\frac{1}{2} + 4');
    expect(sumF([F(-2, 3)])).toBe('-\\frac{2}{3}');
  });

  it('les bonnes réponses sont justes sur quelques cas connus', () => {
    const byId = (id: string) => baseOf(skills.find((s) => s.id === id)!);
    // Vandermonde : la réponse est le produit (b − a)(c − a)(c − b) des valeurs lues dans l'énoncé.
    for (let seed = 1; seed <= 50; seed++) {
      const ex = byId('l2-det-vandermonde').generate(new Rng(seed), 2);
      const [a, b, c] = /\\\\ (-?\d+) & (-?\d+) & (-?\d+) \\\\/.exec(ex.prompt)!.slice(1).map(Number);
      expect(ex.answer).toEqual({ kind: 'number', value: F((b - a) * (c - a) * (c - b)) });
    }
  });
});
