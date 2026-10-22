import katex from 'katex';
import { describe, expect, it } from 'vitest';
import { SECONDE } from '../src/content/seconde';
import { frac, fracEq } from '../src/exercises/fraction';
import { Rng } from '../src/exercises/rng';
import { factorize, isPrime } from '../src/exercises/seconde/arithmetique';
import { reduite } from '../src/exercises/seconde/droites';
import { affine, dec, interval, poly2 } from '../src/exercises/seconde/outils';
import { median, quartile } from '../src/exercises/seconde/statistiques';
import { type Answer, type Exercise, type Level, type Response, checkAnswer } from '../src/exercises/types';

/** Vérifications propres à la 2nde, en plus des tests communes de tests/content.test.ts. */

const skills = SECONDE.chapters.flatMap((c) => c.skills);
const skill = (id: string) => skills.find((s) => s.id === id)!;

function* draws(id: string, count = 120): Generator<Exercise> {
  for (const level of [1, 2, 3] as Level[])
    for (let seed = 1; seed <= count; seed++) yield skill(id).generate(new Rng(seed * 104729 + level), level);
}

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

/** Lit « ax + b » (ou « -x », « 7 »…) écrit par `affine`. */
function readAffine(s: string): [number, number] {
  const m = /^(-?\d*)x(?: ([+-]) (\d+))?$|^(-?\d+)$/.exec(s.trim());
  if (!m) throw new Error(`Expression illisible : ${s}`);
  if (m[4] !== undefined) return [0, Number(m[4])];
  const a = m[1] === '' ? 1 : m[1] === '-' ? -1 : Number(m[1]);
  const b = m[2] === undefined ? 0 : (m[2] === '-' ? -1 : 1) * Number(m[3]);
  return [a, b];
}

describe('outils de 2nde', () => {
  it('écrit les expressions proprement', () => {
    expect(affine(1, -3)).toBe('x - 3');
    expect(affine(-1, 0)).toBe('-x');
    expect(affine(0, 0)).toBe('0');
    expect(poly2(4, -12, 9)).toBe('4x^2 - 12x + 9');
    expect(dec(-2.5)).toBe('-2{,}5');
    expect(dec(0.1 + 0.2)).toBe('0{,}3');
    expect(interval(null, false, 3, true)).toBe('\\mathopen{]}-\\infty\\,;\\,3]');
    expect(reduite(frac(-2, 3), frac(4))).toBe('y = -\\frac{2}{3}x + 4');
    expect(reduite(frac(1), frac(0))).toBe('y = x');
    expect(reduite(frac(0), frac(-5))).toBe('y = -5');
  });

  it('décompose en facteurs premiers', () => {
    expect(factorize(360)).toEqual([
      [2, 3],
      [3, 2],
      [5, 1],
    ]);
    expect(isPrime(97)).toBe(true);
    expect(isPrime(91)).toBe(false);
  });

  it('calcule médiane et quartiles comme au programme', () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 3, 2])).toBe(2.5);
    expect(quartile([1, 2, 3, 4, 5, 6, 7, 8], 1)).toBe(2);
    expect(quartile([1, 2, 3, 4, 5, 6, 7, 8], 3)).toBe(6);
    expect(quartile([1, 2, 3, 4, 5, 6, 7, 8, 9], 1)).toBe(3);
  });

  it('accepte « 15 % » comme réponse 15', () => {
    expect(checkAnswer({ kind: 'number', value: frac(15) }, '15 %')).toBe(true);
    expect(checkAnswer({ kind: 'number', value: frac(-12, 1) }, '-12%')).toBe(true);
  });
});

describe('contenu de 2nde', () => {
  it('couvre les 13 chapitres du manuel', () => {
    expect(SECONDE.chapters).toHaveLength(13);
    for (const c of SECONDE.chapters) {
      expect(c.id.startsWith('2nde-')).toBe(true);
      for (const s of c.skills) expect(s.id.startsWith('2nde-'), s.id).toBe(true);
      for (const cr of [...c.creatures, c.boss]) expect(cr.id.startsWith('2nde-'), cr.id).toBe(true);
    }
  });

  it('refuse une mauvaise réponse', () => {
    for (const s of skills)
      for (const ex of draws(s.id, 40)) expect(checkAnswer(ex.answer, badResponse(ex.answer)), `${s.id} : ${ex.prompt}`).toBe(false);
  });

  it('résout les équations du premier degré juste', () => {
    for (const ex of draws('2nde-equation-1')) {
      const m = /\$(.+) = (.+)\$/.exec(ex.prompt)!;
      const [a, b] = readAffine(m[1]);
      const [c, d] = readAffine(m[2]);
      if (ex.answer.kind !== 'number') throw new Error();
      const x = ex.answer.value;
      // a x + b = c x + d, multiplié par le dénominateur.
      expect(a * x.n + b * x.d, ex.prompt).toBe(c * x.n + d * x.d);
    }
  });

  it('trouve les racines des équations produit nul', () => {
    for (const ex of draws('2nde-produit-nul')) {
      const m = /\$\((.+)\)\((.+)\) = 0\$/.exec(ex.prompt)!;
      const [a, b] = readAffine(m[1]);
      const [c, d] = readAffine(m[2]);
      if (ex.answer.kind !== 'set') throw new Error();
      for (const x of ex.answer.values) expect(Math.abs((a * x.n + b * x.d) * (c * x.n + d * x.d)), ex.prompt).toBe(0);
    }
  });

  it('résout les systèmes juste', () => {
    for (const ex of draws('2nde-systeme')) {
      const rows = [...ex.prompt.matchAll(/(-?\d*x(?: [+-] \d*y)?) = (-?\d+)/g)];
      expect(rows).toHaveLength(2);
      if (ex.answer.kind !== 'pair') throw new Error();
      const [x, y] = ex.answer.values.map((f) => f.n);
      for (const [, lhs, rhs] of rows) {
        const t = /^(-?\d*)x(?: ([+-]) (\d*)y)?$/.exec(lhs)!;
        const a = t[1] === '' ? 1 : t[1] === '-' ? -1 : Number(t[1]);
        const b = (t[2] === '-' ? -1 : 1) * (t[3] === '' ? 1 : Number(t[3]));
        expect(a * x + b * y, ex.prompt).toBe(Number(rhs));
      }
    }
  });

  it('calcule le point d’intersection de deux droites sécantes', () => {
    for (const ex of draws('2nde-intersection')) {
      const lines = [...ex.prompt.matchAll(/y = ([^$]+)\$/g)].map((m) => readAffine(m[1]));
      if (ex.answer.kind !== 'pair') throw new Error();
      const [x, y] = ex.answer.values;
      for (const [m, p] of lines) expect(fracEq(frac(m * x.n + p * x.d, x.d), y), ex.prompt).toBe(true);
    }
  });

  it('donne des probabilités entre 0 et 1', () => {
    for (const id of ['2nde-proba-simple', '2nde-proba-contraire', '2nde-proba-reunion', '2nde-tableau-double', '2nde-deux-des'])
      for (const ex of draws(id)) {
        if (ex.answer.kind !== 'number') throw new Error();
        const v = ex.answer.value.n / ex.answer.value.d;
        expect(v, `${id} : ${ex.prompt}`).toBeGreaterThanOrEqual(0);
        expect(v, `${id} : ${ex.prompt}`).toBeLessThanOrEqual(1);
      }
  });

  it('simplifie les racines carrées', () => {
    for (const ex of draws('2nde-racines')) {
      const n = Number(/\\sqrt\{(\d+)\}/.exec(ex.prompt)![1]);
      if (ex.answer.kind !== 'pair') throw new Error();
      const [a, b] = ex.answer.values.map((f) => f.n);
      expect(a * a * b).toBe(n);
      for (let k = 2; k * k <= b; k++) expect(b % (k * k), `${b} a encore un carré`).not.toBe(0);
    }
  });

  it('cherche les quartiles et médianes sur des séries cohérentes', () => {
    for (const ex of draws('2nde-mediane')) {
      const xs = [...ex.prompt.matchAll(/\$(-?\d+)\$/g)].map((m) => Number(m[1]));
      if (ex.answer.kind !== 'number') throw new Error();
      expect(fracEq(ex.answer.value, frac(Math.round(median(xs) * 2), 2))).toBe(true);
    }
  });

  it('écrit un LaTeX valide partout (énoncés, options, indices, corrections, répliques)', () => {
    const check = (text: string, where: string) => {
      const parts = text.split('$');
      expect(parts.length % 2, `$ non appariés : ${where} : ${text}`).toBe(1);
      parts.forEach((part, i) => {
        if (i % 2) expect(() => katex.renderToString(part, { throwOnError: true }), `${where} : ${part}`).not.toThrow();
      });
    };
    for (const s of skills)
      for (const ex of draws(s.id, 10)) {
        const texts = [ex.prompt, ex.hint, ...ex.correction, ...(ex.answer.kind === 'choice' ? ex.answer.options : [])];
        texts.forEach((t) => check(t, s.id));
      }
    for (const c of SECONDE.chapters) (c.guide ?? []).forEach((t) => check(t, c.id));
  }, 60_000);
});
