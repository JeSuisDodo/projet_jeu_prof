import katex from 'katex';
import { describe, expect, it } from 'vitest';
import { TERMINALE } from '../src/content/terminale';
import { evalFrac, primitiveCoefs } from '../src/exercises/terminale/primitives';
import { angleTex, exact } from '../src/exercises/terminale/trigonometrie';
import { Rng } from '../src/exercises/rng';
import { type Answer, type Level, type Response, checkAnswer } from '../src/exercises/types';

/** Vérifications propres à la Terminale, en plus de tests/content.test.ts. */

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

const skills = TERMINALE.chapters.flatMap((c) => c.skills);

describe('Terminale', () => {
  it('couvre tout le programme (un chapitre par région)', () => {
    expect(TERMINALE.chapters.length).toBeGreaterThanOrEqual(14);
  });

  for (const skill of skills)
    it(`${skill.id} : mauvaise réponse refusée, textes propres, tirage reproductible`, async () => {
      for (const level of [1, 2, 3] as Level[])
        for (let seed = 1; seed <= 200; seed++) {
          const ex = skill.generate(new Rng(seed * 104729 + level), level);
          const where = `${skill.id} niv. ${level} graine ${seed}`;
          expect(checkAnswer(ex.answer, badResponse(ex.answer)), where).toBe(false);
          const all = [ex.prompt, ex.hint, ...ex.correction, ...(ex.answer.kind === 'choice' ? ex.answer.options : [])].join(' ');
          expect(all, where).not.toMatch(/NaN|undefined|Infinity|\+ -|- -|\[object/);
          // Les $ doivent aller par paires pour que KaTeX rende chaque formule.
          for (const t of [ex.prompt, ex.hint, ...ex.correction]) expect((t.match(/\$/g) ?? []).length % 2, `${where} : ${t}`).toBe(0);
          // Chaque formule doit être lisible par KaTeX.
          for (const t of [ex.prompt, ex.hint, ...ex.correction, ...(ex.answer.kind === 'choice' ? ex.answer.options : [])])
            for (const m of t.matchAll(/\$([^$]+)\$/g)) expect(() => katex.renderToString(m[1], { throwOnError: true }), `${where} : ${m[1]}`).not.toThrow();
        }
      expect(skill.generate(new Rng(42), 2)).toEqual(skill.generate(new Rng(42), 2));
      // Rend la main à la boucle d'événements : sans cela, ce fichier calcule plus de 60 s d'affilée
      // sur les machines de CI et le dialogue entre vitest et son worker expire (« Timeout calling onTaskUpdate »).
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
});

describe('Terminale : outils de calcul', () => {
  it('la primitive d’un polynôme redonne le polynôme en dérivant', () => {
    const c = [6, -2, 5, 7];
    const P = primitiveCoefs(c);
    const deg = P.length - 1;
    const back = P.slice(0, -1).map((f, i) => (f.n * (deg - i)) / f.d);
    expect(back).toEqual(c);
    // ∫_0^2 (6x³ - 2x² + 5x + 7) dx = 24 - 16/3 + 10 + 14
    const v = evalFrac(P, 2);
    expect(v.n / v.d).toBeCloseTo(24 - 16 / 3 + 10 + 14);
  });

  it('les valeurs remarquables de cos et sin sont exactes', () => {
    expect(exact(Math.cos(Math.PI / 3))).toBe('\\frac{1}{2}');
    expect(exact(Math.sin((-5 * Math.PI) / 6))).toBe('-\\frac{1}{2}');
    expect(exact(Math.cos((3 * Math.PI) / 4))).toBe('-\\frac{\\sqrt{2}}{2}');
    expect(exact(Math.cos(Math.PI / 2))).toBe('0');
    expect(angleTex(-4, 6)).toBe('-\\frac{2\\pi}{3}');
    expect(angleTex(6, 6)).toBe('\\pi');
  });
});
