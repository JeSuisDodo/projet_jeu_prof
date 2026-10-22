import { describe, expect, it } from 'vitest';
import { SUITES_ARITH_GEO } from '../src/content/premiere/suites-arith-geo';
import { SUITES_NUMERIQUES } from '../src/content/premiere/suites-numeriques';
import { Rng } from '../src/exercises/rng';
import type { Exercise, Level, Skill } from '../src/exercises/types';

/** Recalcule indépendamment la réponse attendue à partir de l'énoncé. */

const skill = (chapter: { skills: Skill[] }, id: string) => chapter.skills.find((s) => s.id === id)!;

function* exercises(s: Skill, n = 200): Generator<Exercise> {
  for (const level of [1, 2, 3] as Level[]) for (let seed = 1; seed <= n; seed++) yield s.generate(new Rng(seed * 104729 + level), level);
}

/** Évalue « 3n^2 - n + 5 » (sortie de sumLatex) en n. */
function evalPoly(expr: string, n: number): number {
  let total = 0;
  for (const m of expr.replace(/\s+/g, '').matchAll(/([+-]?)(\d*)(n\^2|n)?/g)) {
    if (!m[0]) continue;
    const coef = (m[1] === '-' ? -1 : 1) * (m[2] === '' ? 1 : Number(m[2]));
    total += coef * (m[3] === 'n^2' ? n * n : m[3] === 'n' ? n : 1);
  }
  return total;
}

const value = (ex: Exercise) => {
  if (ex.answer.kind !== 'number') throw new Error('réponse numérique attendue');
  return ex.answer.value.n / ex.answer.value.d;
};

describe('Suites numériques : calculs justes', () => {
  it('formule explicite', () => {
    for (const ex of exercises(skill(SUITES_NUMERIQUES, '1re-suite-explicite'))) {
      const [, expr, k] = /u_n = ([^$]+)\$\. Calcule \$u_\{(\d+)\}/.exec(ex.prompt)!;
      expect(value(ex), ex.prompt).toBe(evalPoly(expr, Number(k)));
    }
  });

  it('récurrence', () => {
    for (const ex of exercises(skill(SUITES_NUMERIQUES, '1re-suite-recurrente'))) {
      const [, u0, rule, k] = /u_0 = (-?\d+)\$.*u_\{n\+1\} = ([^$]+)\$\. Calcule \$u_\{(\d+)\}/.exec(ex.prompt)!;
      let u = Number(u0);
      for (let i = 0; i < Number(k); i++) u = evalPoly(rule.replace(/u_n/g, 'n'), u);
      expect(value(ex), ex.prompt).toBe(u);
    }
  });

  it('terme suivant : la bonne option est le développement de u(n+1)', () => {
    for (const ex of exercises(skill(SUITES_NUMERIQUES, '1re-suite-suivant'))) {
      const [, expr] = /u_n = ([^$]+)\$/.exec(ex.prompt)!;
      if (ex.answer.kind !== 'choice') throw new Error();
      ex.answer.options.forEach((opt, i) => {
        const e = /= ([^$]+)\$/.exec(opt)![1];
        const ok = [0, 1, 2, 5].every((n) => evalPoly(e, n) === evalPoly(expr, n + 1));
        expect(ok, `${ex.prompt} ${opt}`).toBe(i === (ex.answer as { correct: number }).correct);
      });
    }
  });

  it('sens de variation, vérifié sur les 40 premiers termes', () => {
    for (const ex of exercises(skill(SUITES_NUMERIQUES, '1re-suite-variation'))) {
      const [, expr] = /u_n = ([^$]+)\$/.exec(ex.prompt)!;
      const diffs = Array.from({ length: 40 }, (_, n) => evalPoly(expr, n + 1) - evalPoly(expr, n));
      const expected = diffs.every((d) => d > 0) ? 0 : diffs.every((d) => d < 0) ? 1 : 2;
      expect(ex.answer.kind === 'choice' && ex.answer.correct, ex.prompt).toBe(expected);
    }
  });

  it('seuil', () => {
    for (const ex of exercises(skill(SUITES_NUMERIQUES, '1re-suite-seuil'))) {
      const [, u0, rule, target] = /u_0 = (-?\d+)\$ et \$u_\{n\+1\} = ([^$]+)\$.*u_n > (-?\d+)/.exec(ex.prompt)!;
      let u = Number(u0);
      let n = 0;
      while (u <= Number(target)) {
        u = evalPoly(rule.replace(/u_n/g, 'n'), u);
        n++;
      }
      expect(value(ex), ex.prompt).toBe(n);
    }
  });
});

describe('Suites arithmétiques et géométriques : calculs justes', () => {
  it('terme arithmétique', () => {
    for (const ex of exercises(skill(SUITES_ARITH_GEO, '1re-arith-terme'))) {
      const [, p, up, r, n] = /u_\{(\d+)\} = (-?\d+)\$ et de raison \$r = (-?\d+)\$\. Calcule \$u_\{(\d+)\}/.exec(ex.prompt)!.map(Number);
      expect(value(ex), ex.prompt).toBe(up + (n - p) * r);
    }
  });

  it('raison arithmétique', () => {
    for (const ex of exercises(skill(SUITES_ARITH_GEO, '1re-arith-raison'))) {
      const [, p, up, q, uq] = /u_\{(\d+)\} = (-?\d+)\$ et \$u_\{(\d+)\} = (-?\d+)\$/.exec(ex.prompt)!.map(Number);
      expect(value(ex), ex.prompt).toBeCloseTo((uq - up) / (q - p), 10);
    }
  });

  it('raison géométrique', () => {
    for (const ex of exercises(skill(SUITES_ARITH_GEO, '1re-geo-raison'))) {
      const [, a, ua, b, ub] = /u_\{?(\d+)\}? = (-?\d+)\$ et \$u_\{?(\d+)\}? = (-?\d+)\$/.exec(ex.prompt)!.map(Number);
      const q = value(ex);
      expect(ua * q ** (b - a), ex.prompt).toBeCloseTo(ub, 8);
    }
  });

  it('sommes', () => {
    for (const ex of exercises(skill(SUITES_ARITH_GEO, '1re-arith-somme'))) {
      const m = /u_0 = (-?\d+)\$ et de raison \$(-?\d+)\$.*u_\{(\d+)\}/.exec(ex.prompt);
      const [u0, r, n] = m ? m.slice(1).map(Number) : [1, 1, Number(/\\dots \+ (\d+)/.exec(ex.prompt)![1]) - 1];
      let s = 0;
      for (let i = 0; i <= n; i++) s += u0 + i * r;
      expect(value(ex), ex.prompt).toBe(s);
    }
    for (const ex of exercises(skill(SUITES_ARITH_GEO, '1re-geo-somme'))) {
      const m = /u_0 = (-?\d+)\$ et de raison \$q = (-?\d+)\$.*u_\{(\d+)\}/.exec(ex.prompt);
      const [u0, q, n] = m ? m.slice(1).map(Number) : [1, Number(/^Calcule \$S = 1 \+ \(?(-?\d+)/.exec(ex.prompt)![1]), Number(/\^\{(\d+)\}\$\.$/.exec(ex.prompt)![1])];
      let s = 0;
      for (let i = 0; i <= n; i++) s += u0 * q ** i;
      expect(value(ex), ex.prompt).toBe(s);
    }
  });
});
