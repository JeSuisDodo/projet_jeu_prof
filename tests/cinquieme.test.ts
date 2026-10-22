import katex from 'katex';
import { describe, expect, it } from 'vitest';
import { CINQUIEME } from '../src/content/cinquieme';
import { decFrac } from '../src/exercises/cinquieme/outils';
import { divisors, isPrime } from '../src/exercises/cinquieme/divisibilite';
import { frac } from '../src/exercises/fraction';
import { Rng } from '../src/exercises/rng';
import { type Answer, type Exercise, type Level, type Response, checkAnswer } from '../src/exercises/types';

/** Vérifications propres à la 5e, en plus des tests communs de tests/content.test.ts. */

const skills = CINQUIEME.chapters.flatMap((c) => c.skills);
const skill = (id: string) => {
  const s = skills.find((x) => x.id === id);
  if (!s) throw new Error(`Compétence inconnue : ${id}`);
  return s;
};

function* draws(id: string, count = 120): Generator<Exercise> {
  for (const level of [1, 2, 3] as Level[])
    for (let seed = 1; seed <= count; seed++) yield skill(id).generate(new Rng(seed * 104729 + level), level);
}

const value = (a: Answer) => {
  if (a.kind !== 'number') throw new Error(`Réponse numérique attendue, pas ${a.kind}`);
  return a.value.n / a.value.d;
};

function badResponse(answer: Answer): Response {
  switch (answer.kind) {
    case 'number':
      return String(answer.value.n / answer.value.d + 1000);
    case 'set':
      return answer.values.length ? '1000' : '0';
    case 'pair':
      return ['1000', '1000'];
    case 'choice':
      return (answer.correct + 1) % answer.options.length;
  }
}

/** Évalue un calcul LaTeX de 5e : entiers, décimaux, + − × ÷, parenthèses, crochets, \dfrac. */
function evalTex(tex: string): number {
  let s = tex.replace(/\{,\}/g, '.');
  while (s.includes('\\dfrac')) s = s.replace(/\\dfrac\{([^{}]*)\}\{([^{}]*)\}/, '(($1)/($2))');
  s = s.replace(/\\times/g, '*').replace(/\\div/g, '/').replace(/\[/g, '(').replace(/\]/g, ')');
  if (!/^[\d\s.+\-*/()]+$/.test(s)) throw new Error(`Calcul illisible : ${tex}`);
  return Function(`return (${s});`)() as number;
}

const inside = (prompt: string) => /\$[A-E] = (.+)\$/.exec(prompt)?.[1] ?? /\$(.+)\$/.exec(prompt)![1];

describe('outils de 5e', () => {
  it('écrit les décimaux exacts', () => {
    expect(decFrac(frac(3, 4))).toBe('0{,}75');
    expect(decFrac(frac(-1, 8))).toBe('-0{,}125');
    expect(decFrac(frac(45, 1000000))).toBe('0{,}000045');
    expect(decFrac(frac(12))).toBe('12');
  });

  it('reconnaît premiers et diviseurs', () => {
    expect(isPrime(97)).toBe(true);
    expect(isPrime(91)).toBe(false);
    expect(divisors(12)).toEqual([1, 2, 3, 4, 6, 12]);
  });
});

describe('contenu de 5e', () => {
  it('couvre les 15 chapitres, avec des identifiants préfixés « 5e- »', () => {
    expect(CINQUIEME.chapters).toHaveLength(15);
    for (const c of CINQUIEME.chapters) {
      expect(c.id.startsWith('5e-')).toBe(true);
      for (const s of c.skills) expect(s.id.startsWith('5e-'), s.id).toBe(true);
      for (const cr of [...c.creatures, c.boss]) {
        expect(cr.id.startsWith('5e-'), cr.id).toBe(true);
        expect([...(cr.look.symbol ?? '')].length, cr.id).toBeLessThanOrEqual(3);
      }
    }
  });

  it('refuse une mauvaise réponse', () => {
    for (const s of skills)
      for (const ex of draws(s.id, 40)) expect(checkAnswer(ex.answer, badResponse(ex.answer)), `${s.id} : ${ex.prompt}`).toBe(false);
  });

  it('calcule juste les enchaînements d’opérations', () => {
    for (const id of ['5e-priorites', '5e-parentheses', '5e-trait-fraction', '5e-calcul-astucieux'])
      for (const ex of draws(id)) expect(value(ex.answer), `${id} : ${ex.prompt}`).toBeCloseTo(evalTex(inside(ex.prompt)), 9);
  });

  it('calcule juste avec les relatifs', () => {
    for (const id of ['5e-relatifs-addition', '5e-relatifs-soustraction', '5e-relatifs-somme'])
      for (const ex of draws(id)) {
        const expr = inside(ex.prompt).replace(/\(\+/g, '(');
        expect(value(ex.answer), `${id} : ${ex.prompt}`).toBeCloseTo(evalTex(expr), 9);
      }
  });

  it('additionne juste les fractions', () => {
    for (const ex of draws('5e-fraction-somme')) {
      const expr = /\$(.+)\$/.exec(ex.prompt)![1];
      expect(value(ex.answer), ex.prompt).toBeCloseTo(evalTex(expr), 9);
    }
  });

  it('donne des probabilités entre 0 et 1', () => {
    for (const id of ['5e-proba-de', '5e-proba-urne', '5e-proba-contraire'])
      for (const ex of draws(id)) {
        const v = value(ex.answer);
        expect(v, `${id} : ${ex.prompt}`).toBeGreaterThanOrEqual(0);
        expect(v, `${id} : ${ex.prompt}`).toBeLessThanOrEqual(1);
      }
  });

  it('donne des angles de triangle positifs', () => {
    for (const id of ['5e-somme-angles', '5e-angles-isocele'])
      for (const ex of draws(id)) {
        const v = value(ex.answer);
        expect(v, ex.prompt).toBeGreaterThan(0);
        expect(v, ex.prompt).toBeLessThan(180);
      }
  });

  it('respecte l’inégalité triangulaire', () => {
    for (const ex of draws('5e-inegalite-triangulaire')) {
      const sides = [...ex.prompt.matchAll(/= (\d+(?:\{,\}\d+)?)\\text/g)].map((m) => Number(m[1].replace('{,}', '.')));
      expect(sides).toHaveLength(3);
      const [a, b, c] = [...sides].sort((x, y) => x - y);
      if (ex.answer.kind !== 'choice') throw new Error();
      const expected = c < a + b - 1e-9 ? 0 : c > a + b + 1e-9 ? 1 : 2;
      expect(ex.answer.correct, ex.prompt).toBe(expected);
    }
  });

  it('écrit un LaTeX valide partout (énoncés, options, indices, corrections, répliques)', () => {
    const check = (text: string, where: string) => {
      const parts = text.split('$');
      expect(parts.length % 2, `$ non appariés : ${where} : ${text}`).toBe(1);
      parts.forEach((part, i) => {
        if (i % 2) expect(() => katex.renderToString(part, { throwOnError: true, strict: 'error' }), `${where} : ${part}`).not.toThrow();
      });
    };
    for (const s of skills)
      for (const ex of draws(s.id, 10)) {
        const texts = [ex.prompt, ex.hint, ...ex.correction, ...(ex.answer.kind === 'choice' ? ex.answer.options : [])];
        texts.forEach((t) => check(t, s.id));
      }
    for (const c of CINQUIEME.chapters) (c.guide ?? []).forEach((t) => check(t, c.id));
  }, 60_000);
});
