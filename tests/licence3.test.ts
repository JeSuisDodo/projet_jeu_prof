import katex from 'katex';
import { describe, expect, it } from 'vitest';
import { LICENCE3 } from '../src/content/licence3';
import { baseOf } from '../src/exercises/variantes';
import { Rng } from '../src/exercises/rng';
import { type Answer, type Level, type Response, checkAnswer } from '../src/exercises/types';
import { divisors, gcd, lcm, modInverse, phi } from '../src/exercises/licence3/util';
import { dx, dy, evalP } from '../src/exercises/licence3/calculDifferentiel';

/** Vérifications propres à la Licence 3, en plus de tests/content.test.ts. */

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

const skills = LICENCE3.chapters.flatMap((c) => c.skills);

describe('Licence 3', () => {
  it('a une île complète dans la catégorie Université', () => {
    expect(LICENCE3.stage).toBe('universite');
    expect(LICENCE3.chapters.length).toBeGreaterThanOrEqual(10);
    for (const c of LICENCE3.chapters) {
      expect(c.id.startsWith('l3-'), c.id).toBe(true);
      for (const s of c.skills) expect(s.id.startsWith('l3-'), s.id).toBe(true);
      for (const cr of [...c.creatures, c.boss]) {
        expect(cr.id.startsWith('l3-'), cr.id).toBe(true);
        expect([...(cr.look.symbol ?? '')].length, cr.id).toBeLessThanOrEqual(3);
        // La description s'affiche en texte brut dans le carnet.
        expect(cr.description, cr.id).not.toMatch(/\$/);
      }
    }
  });

  for (const skill of skills)
    it(`${skill.id} : mauvaise réponse refusée, textes propres, tirage reproductible`, async () => {
      for (const level of [1, 2, 3] as Level[])
        for (let seed = 1; seed <= 200; seed++) {
          const ex = skill.generate(new Rng(seed * 104729 + level), level);
          const where = `${skill.id} niv. ${level} graine ${seed}`;
          expect(checkAnswer(ex.answer, badResponse(ex.answer)), where).toBe(false);
          const texts = [ex.prompt, ex.hint, ...ex.correction, ...(ex.answer.kind === 'choice' ? ex.answer.options : [])];
          expect(texts.join(' '), where).not.toMatch(/NaN|undefined|Infinity|\+ -|- -|\[object|\$\{/);
          for (const t of texts) expect((t.match(/\$/g) ?? []).length % 2, `${where} : ${t}`).toBe(0);
          for (const t of texts)
            for (const m of t.matchAll(/\$([^$]+)\$/g)) expect(() => katex.renderToString(m[1], { throwOnError: true }), `${where} : ${m[1]}`).not.toThrow();
        }
      expect(skill.generate(new Rng(42), 2)).toEqual(skill.generate(new Rng(42), 2));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
});

describe('Licence 3 : outils de calcul', () => {
  it('arithmétique', () => {
    expect(gcd(84, 36)).toBe(12);
    expect(lcm(4, 6)).toBe(12);
    expect(phi(36)).toBe(12);
    expect(phi(13)).toBe(12);
    expect(modInverse(3, 7)).toBe(5);
    expect(modInverse(7, 26)).toBe(15);
    expect(divisors(12)).toEqual([1, 2, 3, 4, 6, 12]);
  });

  it('dérivées partielles d’un polynôme de deux variables', () => {
    // f = 3x²y - xy + 2y²
    const f: [number, number, number][] = [
      [3, 2, 1],
      [-1, 1, 1],
      [2, 0, 2],
    ];
    expect(evalP(f, 1, 2)).toBe(6 - 2 + 8);
    expect(evalP(dx(f), 1, 2)).toBe(12 - 2);
    expect(evalP(dy(f), 1, 2)).toBe(3 - 1 + 8);
  });

  it('les réponses numériques correspondent à des calculs indépendants', () => {
    const find = (id: string) => baseOf(skills.find((s) => s.id === id)!);
    for (let seed = 1; seed <= 100; seed++) {
      // Newton sur x² - a : x₁ = (x₀ + a/x₀)/2.
      const nw = find('l3-methode-newton').generate(new Rng(seed), 1);
      const [, a] = /x\^2 - (\d+)/.exec(nw.prompt)!;
      const [, x0] = /x_0 = (\d+)/.exec(nw.prompt)!;
      const expected = (Number(x0) + Number(a) / Number(x0)) / 2;
      if (nw.answer.kind !== 'number') throw new Error('nombre attendu');
      expect(nw.answer.value.n / nw.answer.value.d).toBeCloseTo(expected);

      // Ordre de ā dans ℤ/nℤ, vérifié par itération.
      const oz = find('l3-ordre-zn').generate(new Rng(seed), 2);
      const [, k, n] = /\\bar\{(\d+)\}.*\\mathbb\{Z\}\/(\d+)/.exec(oz.prompt)!;
      let order = 1;
      while ((order * Number(k)) % Number(n) !== 0) order++;
      if (oz.answer.kind !== 'number') throw new Error('nombre attendu');
      expect(oz.answer.value.n).toBe(order);

      // Restes chinois, vérifiés par recherche exhaustive.
      const ch = find('l3-restes-chinois').generate(new Rng(seed), 3);
      const [, r1, m1, r2, m2] = /x \\equiv (\d+) \\pmod\{(\d+)\}.*x \\equiv (\d+) \\pmod\{(\d+)\}/.exec(ch.prompt)!;
      let x = 0;
      while (x % Number(m1) !== Number(r1) || x % Number(m2) !== Number(r2)) x++;
      if (ch.answer.kind !== 'number') throw new Error('nombre attendu');
      expect(ch.answer.value.n).toBe(x);
    }
  });
});
