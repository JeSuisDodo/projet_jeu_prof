import { describe, expect, it } from 'vitest';
import { APPLICATIONS_DERIVATION } from '../src/content/premiere/applications-derivation';
import { DERIVATION } from '../src/content/premiere/derivation';
import { baseOf } from '../src/exercises/variantes';
import { Rng } from '../src/exercises/rng';
import type { Exercise, Level, Skill } from '../src/exercises/types';

/** Recalcule indépendamment les réponses à partir de l'énoncé (dérivée numérique, recherche de racines…). */

const skill = (chapter: { skills: Skill[] }, id: string) => baseOf(chapter.skills.find((s) => s.id === id)!);

function* exercises(s: Skill, n = 200): Generator<Exercise> {
  for (const level of [1, 2, 3] as Level[]) for (let seed = 1; seed <= n; seed++) yield s.generate(new Rng(seed * 15485863 + level), level);
}

/** Évalue un polynôme écrit par sumLatex (« -2x^3 + x - 4 ») en x. */
function evalPoly(expr: string, x: number): number {
  let total = 0;
  for (const m of expr.replace(/\s+/g, '').matchAll(/([+-]?)(\d*)(x(?:\^(\d))?)?/g)) {
    if (!m[0]) continue;
    const coef = (m[1] === '-' ? -1 : 1) * (m[2] === '' ? 1 : Number(m[2]));
    total += coef * (m[3] ? x ** Number(m[4] ?? 1) : 1);
  }
  return total;
}

const fOf = (ex: Exercise) => /(?:f|B)\(x\) = ([^$]+)\$/.exec(ex.prompt)![1];
const num = (ex: Exercise) => {
  if (ex.answer.kind !== 'number') throw new Error('réponse numérique attendue');
  return ex.answer.value.n / ex.answer.value.d;
};
const deriv = (expr: string, x: number) => (evalPoly(expr, x + 1e-4) - evalPoly(expr, x - 1e-4)) / 2e-4;

describe('Dérivation : calculs justes', () => {
  it('taux de variation', () => {
    for (const ex of exercises(skill(DERIVATION, '1re-taux-variation'))) {
      const [, a, b] = /entre \$(-?\d+)\$ et \$(-?\d+)\$/.exec(ex.prompt)!.map(Number);
      const f = fOf(ex);
      expect(num(ex), ex.prompt).toBeCloseTo((evalPoly(f, b) - evalPoly(f, a)) / (b - a), 8);
    }
  });

  it('nombre dérivé', () => {
    for (const ex of exercises(skill(DERIVATION, '1re-nombre-derive'))) {
      const a = Number(/Calcule \$f'\((-?\d+)\)/.exec(ex.prompt)![1]);
      expect(num(ex), ex.prompt).toBeCloseTo(deriv(fOf(ex), a), 4);
    }
  });

  it('dérivée d’un polynôme : seule la bonne option est juste', () => {
    for (const ex of exercises(skill(DERIVATION, '1re-derivee-polynome'))) {
      if (ex.answer.kind !== 'choice') throw new Error();
      const f = fOf(ex);
      ex.answer.options.forEach((opt, i) => {
        const d = /= ([^$]+)\$/.exec(opt)![1];
        const ok = [-2, -1, 0, 1, 3].every((x) => Math.abs(evalPoly(d, x) - deriv(f, x)) < 1e-3);
        expect(ok, `${ex.prompt} ${opt}`).toBe(i === (ex.answer as { correct: number }).correct);
      });
    }
  });

  it('tangente', () => {
    for (const ex of exercises(skill(DERIVATION, '1re-tangente'))) {
      const a = Number(/abscisse \$(-?\d+)\$/.exec(ex.prompt)![1]);
      const f = fOf(ex);
      if (ex.answer.kind !== 'pair') throw new Error();
      const [m, p] = ex.answer.values.map((v) => v.n / v.d);
      expect(m, ex.prompt).toBeCloseTo(deriv(f, a), 4);
      expect(m * a + p, ex.prompt).toBeCloseTo(evalPoly(f, a), 8);
    }
  });
});

describe('Applications de la dérivation : calculs justes', () => {
  it('f′(x) = 0', () => {
    for (const ex of exercises(skill(APPLICATIONS_DERIVATION, '1re-points-critiques'))) {
      if (ex.answer.kind !== 'set') throw new Error();
      const f = fOf(ex);
      for (const r of ex.answer.values) expect(deriv(f, r.n / r.d), ex.prompt).toBeCloseTo(0, 4);
      expect(ex.answer.values.length).toBe(2);
    }
  });

  it('extremum local : vérifié sur une grille autour du point', () => {
    for (const ex of exercises(skill(APPLICATIONS_DERIVATION, '1re-extremum-local'))) {
      const f = fOf(ex);
      const max = ex.prompt.includes('maximum');
      // Points où f' s'annule (entiers entre -12 et 12) : celui qui est un extremum du bon type.
      const crit = Array.from({ length: 25 }, (_, i) => i - 12).filter((x) => Math.abs(deriv(f, x)) < 1e-3);
      const at = crit.find((x) => (max ? evalPoly(f, x) > evalPoly(f, x - 0.5) && evalPoly(f, x) > evalPoly(f, x + 0.5) : evalPoly(f, x) < evalPoly(f, x - 0.5) && evalPoly(f, x) < evalPoly(f, x + 0.5)))!;
      expect(num(ex), ex.prompt).toBe(ex.prompt.includes('valeur') ? evalPoly(f, at) : at);
    }
  });

  it('optimisation', () => {
    for (const ex of exercises(skill(APPLICATIONS_DERIVATION, '1re-optimisation'))) {
      const f = fOf(ex);
      const best = num(ex);
      for (const x of [0, best / 2, best - 0.5, best + 0.5, best * 2]) expect(evalPoly(f, x), ex.prompt).toBeLessThanOrEqual(evalPoly(f, best) + 1e-9);
    }
  });
});
