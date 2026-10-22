import katex from 'katex';
import { describe, expect, it } from 'vitest';
import { TROISIEME } from '../src/content/troisieme';
import { frac, fracEq } from '../src/exercises/fraction';
import { Rng } from '../src/exercises/rng';
import { median } from '../src/exercises/troisieme/statistiques';
import { type Answer, type Exercise, type Level, type Response, checkAnswer } from '../src/exercises/types';

/** Vérifications propres à la 3e, en plus des tests communs de tests/content.test.ts. */

const skills = TROISIEME.chapters.flatMap((c) => c.skills);
const skill = (id: string) => {
  const s = skills.find((x) => x.id === id);
  if (!s) throw new Error(`Compétence absente : ${id}`);
  return s;
};

function* draws(id: string, count = 100): Generator<Exercise> {
  for (const level of [1, 2, 3] as Level[])
    for (let seed = 1; seed <= count; seed++) yield skill(id).generate(new Rng(seed * 104729 + level), level);
}

const value = (a: Answer) => {
  if (a.kind !== 'number') throw new Error(`réponse numérique attendue, pas ${a.kind}`);
  return a.value.n / a.value.d;
};

/** Nombres écrits en LaTeX dans un texte, virgule décimale comprise : « 2{,}5 » → 2.5. */
const numbers = (s: string) => [...s.matchAll(/-?\d+(?:\{,\}\d+)?/g)].map((m) => Number(m[0].replace('{,}', '.')));

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

describe('3e', () => {
  it('a seize régions aux identifiants préfixés « 3e- »', () => {
    expect(TROISIEME.chapters).toHaveLength(16);
    for (const c of TROISIEME.chapters) {
      expect(c.id.startsWith('3e-')).toBe(true);
      for (const s of c.skills) expect(s.id.startsWith('3e-'), s.id).toBe(true);
      for (const x of [...c.creatures, c.boss]) expect(x.id.startsWith('3e-'), x.id).toBe(true);
    }
  });

  it('refuse les mauvaises réponses et rejoue un exercice à l’identique', () => {
    for (const s of skills)
      for (const ex of draws(s.id, 30)) {
        expect(checkAnswer(ex.answer, badResponse(ex.answer)), `${s.id} : ${ex.prompt}`).toBe(false);
        const again = s.generate(new Rng(42), ex.level);
        expect(s.generate(new Rng(42), ex.level)).toEqual(again);
      }
  });

  it('résout juste les équations du premier degré', () => {
    for (const ex of draws('3e-equation')) {
      const m = /\$(.+) = (.+)\$/.exec(ex.prompt)!;
      const x = value(ex.answer);
      const evalSide = (side: string) => {
        // « ax + b », « -x - 3 » ou « 7 »
        const t = /^(-?\d*)x(?: ([+-]) (\d+))?$|^(-?\d+)$/.exec(side.trim())!;
        if (t[4] !== undefined) return Number(t[4]);
        const a = t[1] === '' ? 1 : t[1] === '-' ? -1 : Number(t[1]);
        return a * x + (t[2] === undefined ? 0 : (t[2] === '-' ? -1 : 1) * Number(t[3]));
      };
      expect(evalSide(m[1]), ex.prompt).toBeCloseTo(evalSide(m[2]), 9);
    }
  });

  it('calcule juste avec Pythagore', () => {
    for (const ex of draws('3e-pythagore-hypotenuse')) {
      const [a, b] = numbers(ex.prompt.replace(/[A-Z]{2,3}/g, ''));
      const c = Math.hypot(a, b);
      expect(Math.abs(value(ex.answer) - c), ex.prompt).toBeLessThanOrEqual(0.05 + 1e-9);
    }
    for (const ex of draws('3e-pythagore-cote')) {
      const [c, a] = numbers(ex.prompt.replace(/[A-Z]{2,3}/g, ''));
      expect(Math.abs(value(ex.answer) - Math.sqrt(c * c - a * a)), ex.prompt).toBeLessThanOrEqual(0.05 + 1e-9);
    }
  });

  it('calcule juste avec la trigonométrie', () => {
    for (const ex of draws('3e-trigo-angle')) {
      const [a, b] = numbers(ex.prompt.replace(/\$[A-Z]{2,3}\$|[A-Z]{2,3} =/g, '').replace(/ABC/g, ''));
      const fn = /\$AB = .*\$BC/.test(ex.prompt) ? Math.acos : /\$AC = .*\$BC/.test(ex.prompt) ? Math.asin : Math.atan;
      const deg = (fn(a / b) * 180) / Math.PI;
      expect(Math.abs(value(ex.answer) - deg), ex.prompt).toBeLessThanOrEqual(0.5 + 1e-9);
    }
  });

  it('calcule juste les probabilités d’une urne', () => {
    for (const ex of draws('3e-proba-urne')) {
      const [r, b, v = 0] = numbers(ex.prompt);
      const total = r + b + v;
      const color = /soit (?:pas )?(rouge|bleue|verte)/.exec(ex.prompt)![1];
      const count = color === 'rouge' ? r : color === 'bleue' ? b : v;
      const expected = ex.prompt.includes('ne soit pas') ? total - count : count;
      if (ex.answer.kind !== 'number') throw new Error();
      expect(fracEq(ex.answer.value, frac(expected, total)), ex.prompt).toBe(true);
    }
  });

  it('calcule juste les médianes', () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 3, 2])).toBe(2.5);
    for (const ex of draws('3e-mediane')) {
      const xs = numbers(ex.prompt.split(':')[1]);
      expect(value(ex.answer), ex.prompt).toBe(median(xs));
    }
  });

  it('applique juste les évolutions en pourcentage', () => {
    for (const ex of draws('3e-evolution')) {
      const reverse = ex.prompt.startsWith('Après');
      const [x, y] = numbers(ex.prompt);
      const [t, price] = reverse ? [x, y] : [y, x];
      const k = 1 + (/augmente|hausse/.test(ex.prompt) ? t : -t) / 100;
      if (reverse) expect(value(ex.answer) * k, ex.prompt).toBeCloseTo(price, 6);
      else expect(value(ex.answer), ex.prompt).toBeCloseTo(price * k, 6);
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
    for (const c of TROISIEME.chapters) (c.guide ?? []).forEach((t) => check(t, c.id));
  }, 60_000);
});
