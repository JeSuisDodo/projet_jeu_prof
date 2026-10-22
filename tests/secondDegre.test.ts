import { describe, expect, it } from 'vitest';
import { frac, fracLatex, parseFrac, parseFracList } from '../src/exercises/fraction';
import { canonicalLatex, factoredLatex, polyLatex } from '../src/exercises/latex';
import { Rng } from '../src/exercises/rng';
import { SECOND_DEGRE_SKILLS } from '../src/exercises/secondDegre';
import { type Answer, type Level, type Response, checkAnswer } from '../src/exercises/types';

/** Réponse qu'un élève taperait pour la bonne solution. */
function goodResponse(answer: Answer): Response {
  const text = (f: { n: number; d: number }) => (f.d === 1 ? String(f.n) : `${f.n}/${f.d}`);
  switch (answer.kind) {
    case 'number':
      return text(answer.value);
    case 'set':
      return answer.values.length ? answer.values.map(text).join(' ; ') : 'aucune';
    case 'pair':
      return [text(answer.values[0]), text(answer.values[1])];
    case 'choice':
      return answer.correct;
  }
}

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

/** Évalue le trinôme en un rationnel, pour vérifier que les racines annoncées en sont bien. */
function evalAt(prompt: string, x: { n: number; d: number }) {
  const m = /f\(x\) = ([^$]+)\$|l'équation \$([^$]+) = 0\$/.exec(prompt);
  const expr = (m?.[1] ?? m?.[2] ?? '').replace(/\s+/g, '');
  const poly = /^(-?\d*)x\^2(?:([+-]\d*)x)?([+-]\d+)?$/.exec(expr);
  if (!poly) throw new Error(`Trinôme illisible : ${expr}`);
  const coef = (s: string | undefined, dflt: number) =>
    s === undefined ? dflt : s === '' || s === '+' ? 1 : s === '-' ? -1 : Number(s);
  const a = coef(poly[1], 1);
  const b = coef(poly[2], 0);
  const c = poly[3] === undefined ? 0 : Number(poly[3]);
  // a x² + b x + c avec x = n/d, multiplié par d² pour rester entier.
  return a * x.n * x.n + b * x.n * x.d + c * x.d * x.d;
}

describe('fractions et saisie', () => {
  it('lit entiers, décimaux et fractions', () => {
    expect(parseFrac('-3')).toEqual(frac(-3));
    expect(parseFrac('2,5')).toEqual(frac(5, 2));
    expect(parseFrac(' 6 / -4 ')).toEqual(frac(-3, 2));
    expect(parseFrac('abc')).toBeNull();
    expect(parseFrac('1/0')).toBeNull();
  });

  it('lit des ensembles de solutions', () => {
    expect(parseFracList('-2 ; 3')).toEqual([frac(-2), frac(3)]);
    expect(parseFracList('x1 = 1/2 ; x2 = -4')).toEqual([frac(1, 2), frac(-4)]);
    expect(parseFracList('S = {2}')).toEqual([frac(2)]);
    expect(parseFracList('aucune')).toEqual([]);
    expect(parseFracList('2 ; truc')).toBeNull();
  });

  it('écrit le LaTeX attendu', () => {
    expect(fracLatex(frac(-3, 2))).toBe('-\\frac{3}{2}');
    expect(polyLatex(2, -2, -12)).toBe('2x^2 - 2x - 12');
    expect(polyLatex(-1, 1, 0)).toBe('-x^2 + x');
    expect(canonicalLatex(1, -3, 2)).toBe('(x + 3)^2 + 2');
    expect(canonicalLatex(-2, 0, -1)).toBe('-2x^2 - 1');
    expect(factoredLatex(3, 1, -2)).toBe('3(x - 1)(x + 2)');
  });
});

describe('modèles du second degré', () => {
  const levels: Level[] = [1, 2, 3];
  for (const skill of SECOND_DEGRE_SKILLS) {
    for (const level of levels) {
      it(`${skill.id}, niveau ${level} : la bonne réponse est acceptée, une mauvaise refusée`, () => {
        for (let seed = 1; seed <= 300; seed++) {
          const ex = skill.generate(new Rng(seed * 7919 + level), level);
          expect(ex.skill).toBe(skill.id);
          expect(ex.correction.length).toBeGreaterThan(0);
          expect(checkAnswer(ex.answer, goodResponse(ex.answer))).toBe(true);
          expect(checkAnswer(ex.answer, badResponse(ex.answer))).toBe(false);
          if (ex.answer.kind === 'choice') {
            expect(new Set(ex.answer.options).size).toBe(ex.answer.options.length);
            expect(ex.answer.options.length).toBeGreaterThanOrEqual(3);
          }
          expect(ex.prompt + ex.correction.join('')).not.toMatch(/undefined|NaN|\+ -|- -/);
        }
      });
    }
  }

  it('les solutions annoncées annulent bien le trinôme', () => {
    const resoudre = SECOND_DEGRE_SKILLS.find((s) => s.id === 'resoudre')!;
    for (let seed = 1; seed <= 500; seed++) {
      const level = ((seed % 3) + 1) as Level;
      const ex = resoudre.generate(new Rng(seed), level);
      if (ex.answer.kind !== 'set') throw new Error('ensemble attendu');
      for (const root of ex.answer.values) expect(evalAt(ex.prompt, root)).toBe(0);
    }
  });

  it("aucun leurre de factorisation n'est la bonne réponse réordonnée", () => {
    const skill = SECOND_DEGRE_SKILLS.find((s) => s.id === 'factorisation')!;
    const roots = (text: string) =>
      [...text.matchAll(/\(x ([+-]) (\d+)\)(\^2)?/g)]
        .flatMap((m) => {
          const r = (m[1] === '-' ? 1 : -1) * Number(m[2]);
          return m[3] ? [r, r] : [r];
        })
        .sort((p, q) => p - q)
        .join(',');
    for (let seed = 1; seed <= 500; seed++) {
      const ex = skill.generate(new Rng(seed), ((seed % 3) + 1) as Level);
      if (ex.answer.kind !== 'choice') throw new Error('QCM attendu');
      const { options, correct } = ex.answer;
      const good = roots(options[correct]);
      options.forEach((o, i) => {
        // Les formes avec un facteur x seul (racine 0) ne sont pas lues ici.
        if (i !== correct && !o.includes('x(') && !o.includes(')x')) expect(roots(o)).not.toBe(good);
      });
    }
  });

  it("la même graine redonne le même exercice", () => {
    for (const skill of SECOND_DEGRE_SKILLS) {
      expect(skill.generate(new Rng(42), 2)).toEqual(skill.generate(new Rng(42), 2));
    }
  });
});
