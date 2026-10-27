import { describe, expect, it } from 'vitest';
import { EXPONENTIELLE } from '../src/content/premiere/exponentielle';
import { TRIGONOMETRIE, exactTex, piTex } from '../src/content/premiere/trigonometrie';
import { baseOf } from '../src/exercises/variantes';
import { Rng } from '../src/exercises/rng';
import type { Exercise, Level, Skill } from '../src/exercises/types';
import { texEval } from './helpers/texEval';

/** Recalcule numériquement chaque réponse à partir de l'énoncé. */

const skill = (chapter: { skills: Skill[] }, id: string) => baseOf(chapter.skills.find((s) => s.id === id)!);

function* exercises(s: Skill, n = 200): Generator<Exercise> {
  for (const level of [1, 2, 3] as Level[]) for (let seed = 1; seed <= n; seed++) yield s.generate(new Rng(seed * 7919 + level), level);
}

const num = (ex: Exercise) => {
  if (ex.answer.kind !== 'number') throw new Error('réponse numérique attendue');
  return ex.answer.value.n / ex.answer.value.d;
};

/** Vérifie que seule l'option correcte satisfait le prédicat. */
function onlyCorrect(ex: Exercise, ok: (option: string) => boolean) {
  if (ex.answer.kind !== 'choice') throw new Error('QCM attendu');
  const { correct } = ex.answer;
  ex.answer.options.forEach((opt, i) => expect(ok(opt), `${ex.prompt} → ${opt}`).toBe(i === correct));
}

const math = (s: string) => [...s.matchAll(/\$([^$]+)\$/g)].pop()![1];
const rhs = (opt: string) => math(opt).split('= ').pop()!;
const fOf = (prompt: string) => /f\(x\) = ([^$]+)\$/.exec(prompt)![1];
const close = (a: number, b: number) => Math.abs(a - b) < 1e-6 * Math.max(1, Math.abs(b));
const POINTS = [-1.3, -0.4, 0.7, 1.9];

describe('Helpers trigonométriques', () => {
  it('piTex et exactTex', () => {
    expect(piTex(4, 12)).toBe('\\frac{\\pi}{3}');
    expect(piTex(-24, 12)).toBe('-2\\pi');
    expect(piTex(0, 5)).toBe('0');
    expect(exactTex(-Math.sqrt(3) / 2)).toBe('-\\frac{\\sqrt{3}}{2}');
    expect(exactTex(-1e-17)).toBe('0');
  });
});

describe('Exponentielle : calculs justes', () => {
  it('propriétés', () => {
    for (const ex of exercises(skill(EXPONENTIELLE, '1re-exp-proprietes'))) expect(Math.log(texEval(/Écris \$([^$]+)\$/.exec(ex.prompt)![1])), ex.prompt).toBeCloseTo(num(ex), 8);
  });

  it('équation : la solution vérifie l’équation', () => {
    for (const ex of exercises(skill(EXPONENTIELLE, '1re-exp-equation'))) {
      if (ex.answer.kind !== 'set') throw new Error();
      const [l, r] = math(ex.prompt).split(' = ');
      const x = ex.answer.values[0].n / ex.answer.values[0].d;
      expect(close(Math.log(texEval(l, x)), Math.log(texEval(r, x))), ex.prompt).toBe(true);
    }
  });

  it('inéquation : seul le bon intervalle convient', () => {
    for (const ex of exercises(skill(EXPONENTIELLE, '1re-exp-inequation'))) {
      const [, l, op, r] = /\$(e\^\{.+\}) ([<>]) ([^$]+)\$/.exec(ex.prompt)!;
      const holds = (x: number) => (op === '>' ? texEval(l, x) > texEval(r, x) : texEval(l, x) < texEval(r, x));
      onlyCorrect(ex, (opt) => {
        const up = opt.includes('+\\infty');
        const bound = texEval(/(?:\\left\]|;\\,)(-?(?:\\frac\{[^}]+\}\{[^}]+\}|\d+))/.exec(opt.replace('-\\infty', ''))![1]);
        return [0.01, 0.5, 3].every((h) => holds(bound + (up ? h : -h)) && !holds(bound + (up ? -h : h)));
      });
    }
  });

  it('dérivée : seule la bonne option est juste', () => {
    for (const ex of exercises(skill(EXPONENTIELLE, '1re-exp-derivee'))) {
      const f = fOf(ex.prompt);
      const d = (x: number) => (texEval(f, x + 1e-5) - texEval(f, x - 1e-5)) / 2e-5;
      onlyCorrect(ex, (opt) => POINTS.every((x) => Math.abs(texEval(rhs(opt), x) - d(x)) < 1e-4 * Math.max(1, Math.abs(d(x)))));
    }
  });

  it('extremum', () => {
    for (const ex of exercises(skill(EXPONENTIELLE, '1re-exp-extremum'))) {
      const f = fOf(ex.prompt);
      const x = num(ex);
      const isMin = ex.prompt.includes('minimum');
      for (const h of [0.1, 1, 3]) {
        expect(texEval(f, x + h) > texEval(f, x) === isMin, ex.prompt).toBe(true);
        expect(texEval(f, x - h) > texEval(f, x) === isMin, ex.prompt).toBe(true);
      }
    }
  });
});

describe('Trigonométrie : calculs justes', () => {
  it('conversion degrés ↔ radians', () => {
    for (const ex of exercises(skill(TRIGONOMETRIE, '1re-trigo-conversion'))) {
      if (ex.answer.kind === 'number') {
        expect(num(ex), ex.prompt).toBeCloseTo((texEval(math(ex.prompt)) * 180) / Math.PI, 8);
      } else {
        const deg = Number(/\$(\d+)°\$/.exec(ex.prompt)![1]);
        onlyCorrect(ex, (opt) => close(texEval(math(opt)), (deg * Math.PI) / 180));
      }
    }
  });

  it('valeurs remarquables', () => {
    for (const ex of exercises(skill(TRIGONOMETRIE, '1re-trigo-valeurs'))) {
      const v = texEval(math(ex.prompt));
      onlyCorrect(ex, (opt) => Math.abs(texEval(math(opt)) - v) < 1e-9);
    }
  });

  it('angles associés', () => {
    for (const ex of exercises(skill(TRIGONOMETRIE, '1re-trigo-associes'))) {
      const e = math(ex.prompt);
      onlyCorrect(ex, (opt) => POINTS.every((x) => Math.abs(texEval(math(opt), x) - texEval(e, x)) < 1e-9));
    }
  });

  it('mesure principale', () => {
    for (const ex of exercises(skill(TRIGONOMETRIE, '1re-trigo-mesure-principale'))) {
      const a = texEval(/l'angle \$([^$]+)\$/.exec(ex.prompt)![1]);
      onlyCorrect(ex, (opt) => {
        const v = texEval(math(opt));
        const turns = (a - v) / (2 * Math.PI);
        return v > -Math.PI + 1e-9 && v <= Math.PI + 1e-9 && Math.abs(turns - Math.round(turns)) < 1e-9;
      });
    }
  });

  it('équations cos x = a et sin x = a', () => {
    for (const ex of exercises(skill(TRIGONOMETRIE, '1re-trigo-equation'))) {
      const [, fn, a] = /\\(cos|sin) x = ([^$]+)\$/.exec(ex.prompt)!;
      const v = texEval(a);
      const [lo, hi] = ex.prompt.includes('[0') ? [0, 2 * Math.PI - 1e-9] : [-Math.PI + 1e-9, Math.PI];
      const expected = Math.abs(Math.abs(v) - 1) < 1e-9 ? 1 : 2;
      onlyCorrect(ex, (opt) => {
        const inner = /\\left\\\{(.+)\\right\\\}/.exec(opt);
        const sols = inner ? inner[1].split('\\,;\\,').map((s) => texEval(s)) : [];
        return sols.length === expected && sols.every((s) => s >= lo - 1e-12 && s <= hi + 1e-12 && Math.abs(Math[fn as 'cos' | 'sin'](s) - v) < 1e-9);
      });
    }
  });

  it('parité', () => {
    for (const ex of exercises(skill(TRIGONOMETRIE, '1re-trigo-parite'))) {
      if (ex.answer.kind !== 'choice') throw new Error();
      const f = fOf(ex.prompt);
      const even = POINTS.every((x) => close(texEval(f, -x), texEval(f, x)));
      const odd = POINTS.every((x) => close(texEval(f, -x), -texEval(f, x)));
      expect(ex.answer.correct, ex.prompt).toBe(even ? 0 : odd ? 1 : 2);
    }
  });
});
