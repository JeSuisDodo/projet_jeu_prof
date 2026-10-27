import katex from 'katex';
import { describe, expect, it } from 'vitest';
import { LICENCE2 } from '../src/content/licence2';
import { baseOf } from '../src/exercises/variantes';
import { Rng } from '../src/exercises/rng';
import { type Answer, type Level, type Response, checkAnswer } from '../src/exercises/types';
import { conjugate, det2, det3, diag, matMul, sumF, trace, unimodular, F } from '../src/exercises/licence2/util';
import { checkVariantCount, drawsOf, numberOf } from './helpers/licenceVariantes';

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

describe('Licence 2 : variantes', () => {
  checkVariantCount(skills, 2);
});

describe('Licence 2 : variantes justes, recalculées depuis l’énoncé', () => {
  const all = (id: string, k = 1) => drawsOf(skills, id, k);
  const ints = (t: string) => [...t.matchAll(/-?\d+/g)].map((m) => Number(m[0]));
  /** Valeur d'un nombre écrit en LaTeX : « 3 », « -\frac{2}{5} ». */
  const texValue = (t: string) => {
    const m = /^(-?)\\frac\{(\d+)\}\{(\d+)\}$/.exec(t.trim());
    return m ? (m[1] ? -1 : 1) * (Number(m[2]) / Number(m[3])) : Number(t);
  };
  const simpson = (f: (x: number) => number, a: number, b: number, N = 4000) => {
    const h = (b - a) / N;
    let s = f(a) + f(b);
    for (let i = 1; i < N; i++) s += (i % 2 ? 4 : 2) * f(a + i * h);
    return (s * h) / 3;
  };
  /** Intégrale sur [0, +∞[ par le changement x = u/(1 − u). */
  const onHalfLine = (f: (x: number) => number) => simpson((u) => f(u / (1 - u)) / (1 - u) ** 2, 0, 1 - 1e-9);

  it('déterminants et espaces euclidiens', () => {
    for (const ex of all('l2-det-2x2')) {
      const [a, b, c, d] = ints(ex.prompt.replace(/l’aire/, ''));
      const area = Math.abs(a * d - b * c) / (ex.prompt.includes('triangle') ? 2 : 1);
      expect(numberOf(ex), ex.prompt).toBeCloseTo(area, 10);
    }
    for (const ex of all('l2-produit-scalaire-integrale')) {
      const lo = Number(/int_\{(-?\d)\}\^1/.exec(ex.prompt)![1]);
      const [p, q] = /langle t(?:\^\{(\d+)\})?, t(?:\^\{(\d+)\})?\\rangle/.exec(ex.prompt)!.slice(1).map((e) => Number(e ?? 1));
      expect(numberOf(ex), ex.prompt).toBeCloseTo(simpson((t) => t ** p * t ** q, lo, 1), 8);
    }
    for (const ex of all('l2-orthogonalite-parametre')) {
      const [p, q] = /polynôme \$t(?:\^\{(\d+)\})? \+ a\$ est-il orthogonal à \$t(?:\^\{(\d+)\})?\$/.exec(ex.prompt)!.slice(1).map((e) => Number(e ?? 1));
      const a = numberOf(ex);
      expect(simpson((t) => (t ** p + a) * t ** q, 0, 1), ex.prompt).toBeCloseTo(0, 8);
    }
    for (const ex of all('l2-gram-schmidt')) {
      const [u1, u2] = [...ex.prompt.matchAll(/\((-?\d+)\\,;\\,(-?\d+)\\,;\\,(-?\d+)\)/g)].map((m) => m.slice(1).map(Number));
      const c = (u1[0] * u2[0] + u1[1] * u2[1] + u1[2] * u2[2]) / (u1[0] ** 2 + u1[1] ** 2 + u1[2] ** 2);
      const v2 = u2.map((x, i) => x - c * u1[i]);
      expect(numberOf(ex), ex.prompt).toBeCloseTo(v2.reduce((s, x) => s + x * x, 0), 8);
    }
    for (const ex of all('l2-forme-definie-positive')) {
      const [a, b2] = ints(/q\(x, y\) = (.*)xy/.exec(ex.prompt)![1].replace(/x\^2/, ' ').replace(/^ /, '1 ').replace(/^-? /, (m) => (m.startsWith('-') ? '-1 ' : '1 ')).replace(/ - /, ' -').replace(/ \+ /, ' '));
      const b = b2 / 2;
      const c = numberOf(ex);
      expect(a * c - b * b, ex.prompt).toBeGreaterThan(0);
      expect(a * (c - 1) - b * b, ex.prompt).toBeLessThanOrEqual(0);
    }
  });

  it('séries numériques et intégrales généralisées', () => {
    for (const ex of all('l2-serie-geometrique')) {
      const S = texValue(/= (.+)\$\. Que vaut/.exec(ex.prompt)![1]);
      const q = numberOf(ex);
      expect(Math.abs(q), ex.prompt).toBeLessThan(1);
      expect(1 / (1 - q), ex.prompt).toBeCloseTo(S, 10);
    }
    for (const ex of all('l2-serie-geometrique', 2)) {
      const h = Number(/lâchée de \$(\d+)\$/.exec(ex.prompt)![1]);
      const r = texValue(/aux \$(.+?)\$ de sa/.exec(ex.prompt)![1]);
      let [d, height] = [h, h];
      for (let i = 0; i < 2000; i++) (height *= r), (d += 2 * height);
      expect(numberOf(ex), ex.prompt).toBeCloseTo(d, 6);
    }
    for (const ex of all('l2-serie-telescopique')) {
      const [N, k] = /S_\{(\d+)\}.*\\frac\{(\d+)\}/.exec(ex.prompt)!.slice(1).map(Number);
      let s = 0;
      for (let n = 1; n <= N; n++) s += k / (n * (n + k));
      expect(numberOf(ex), ex.prompt).toBeCloseTo(s, 10);
    }
    for (const ex of all('l2-serie-telescopique', 2)) {
      const m = Number(/1 - \\frac\{1\}\{(\d+)\}\$ \?/.exec(ex.prompt)![1]);
      let [N, s] = [1, 1 / 2];
      while (s < 1 - 1 / m - 1e-12) (N++, (s += 1 / (N * (N + 1))));
      expect(numberOf(ex), ex.prompt).toBe(N);
    }
    for (const ex of all('l2-serie-exponentielle')) {
      const body = /\\frac\{(.+)\}\{n!\}/.exec(ex.prompt)![1];
      const coef = (re: RegExp) => {
        const m = re.exec(body);
        return m ? (m[1] === '' ? 1 : m[1] === '-' ? -1 : Number(m[1].replace(/ /g, ''))) : 0;
      };
      const a = coef(/(-?\d*)n\^2/);
      const b = coef(/(?:^|[+-] )(\d*)n(?!\^)/);
      const c = Number(/([+-]) (\d+)$/.exec(body)?.slice(1).join('') ?? 0);
      let s = 0;
      let f = 1;
      for (let n = 0; n < 30; n++) (s += (a * n * n + b * n + c) / f), (f *= n + 1);
      expect(numberOf(ex) * Math.E, ex.prompt).toBeCloseTo(s, 8);
    }
    for (const ex of all('l2-integrale-puissance')) {
      const v = texValue(/= (.+)\$ \?/.exec(ex.prompt)![1]);
      const alpha = numberOf(ex);
      // t = e^s : ∫₁^∞ t^{−α} dt = ∫₀^∞ e^{(1 − α)s} ds.
      expect(simpson((s) => Math.exp((1 - alpha) * s), 0, 400, 40000), ex.prompt).toBeCloseTo(v, 6);
    }
    for (const ex of all('l2-integrale-exponentielle')) {
      const n = Number(/t\^\{(\d+)\}/.exec(ex.prompt)?.[1] ?? 1);
      const a = Number(/e\^\{-(\d*)t\}/.exec(ex.prompt)![1] || 1);
      expect(numberOf(ex), ex.prompt).toBeCloseTo(onHalfLine((t) => t ** n * Math.exp(-a * t)), 6);
    }
    for (const ex of all('l2-integrale-rationnelle')) {
      const [a, m] = /\(t \+ (\d+)\)\^\{(\d+)\}/.exec(ex.prompt)!.slice(1).map(Number);
      expect(numberOf(ex), ex.prompt).toBeCloseTo(onHalfLine((t) => (t + a) ** -m), 6);
    }
  });

  it('suites et séries de fonctions, séries entières', () => {
    for (const ex of all('l2-norme-infinie')) {
      const n = Number(/x\^\{(\d+)\}\(1 - x\)/.exec(ex.prompt)?.[1] ?? 1);
      let max = 0;
      for (let i = 0; i <= 100000; i++) max = Math.max(max, (i / 1e5) ** n * (1 - i / 1e5));
      expect(numberOf(ex), ex.prompt).toBeCloseTo(max, 8);
    }
    for (const ex of all('l2-dse-coefficient')) {
      const n = Number(/x\^\{(\d+)\}/.exec(ex.prompt)![1]);
      const [a, b] = [...ex.prompt.matchAll(/\(1 ([+-]) (\d*)x\)/g)].map((m) => (m[1] === '-' ? 1 : -1) * Number(m[2] || 1));
      // Produit des séries Σ aᵏxᵏ et Σ bᵏxᵏ, tronqué.
      const c = Array.from({ length: n + 1 }, (_, k) => a ** k * b ** (n - k)).reduce((s, x) => s + x, 0);
      expect(numberOf(ex), ex.prompt).toBe(c);
    }
    for (const ex of all('l2-limite-simple')) {
      const x = Number(/Calcule \$f\((-?\d+)\)/.exec(ex.prompt)![1]);
      const f = new Function('n', 'x', `return ${/\\dfrac\{(.+)\}\{(.+)\}\$ converge/.exec(ex.prompt)!.slice(1).map((t) => `(${t.replace(/(\d)n/g, '$1*n').replace(/^-n/, '-1*n').replace(/nx\^2/g, 'n*x**2').replace(/n x/g, 'n*x')})`).join('/')}`) as (n: number, x: number) => number;
      expect(numberOf(ex), ex.prompt).toBeCloseTo(f(1e9, x), 6);
    }
  });

  it('plusieurs variables et intégrales doubles', () => {
    for (const ex of all('l2-double-triangle')) {
      const [lo, hi] = /x\^\{(\d+)\} \\leq y \\leq x(?:\^\{(\d+)\})?\\\}/.exec(ex.prompt)!.slice(1).map((e) => Number(e ?? 1));
      expect(numberOf(ex), ex.prompt).toBeCloseTo(simpson((x) => x ** hi - x ** lo, 0, 1), 8);
    }
    for (const ex of all('l2-double-polynome')) {
      const [a0, m0, n0] = /\\left\((-?\d*)x(?:\^\{(\d+)\})? \+ k\\,y(?:\^\{(\d+)\})?\\right\)/.exec(ex.prompt)!.slice(1);
      const a = Number(a0.replace(/^(-?)$/, '$11'));
      const [m, n] = [m0, n0].map((e) => Number(e ?? 1));
      const V = Number(/= (-?\d+)\$ \?/.exec(ex.prompt)![1]);
      expect(a / (m + 1) + numberOf(ex) / (n + 1), ex.prompt).toBeCloseTo(V, 10);
    }
    for (const ex of all('l2-derivee-partielle')) {
      const [c0, p0, q0] = /= (-?\d*)x(?:\^\{(\d+)\})?y(?:\^\{(\d+)\})?\$/.exec(ex.prompt)!.slice(1);
      const c = Number(c0.replace(/^(-?)$/, '$11'));
      const [p, q] = [p0, q0].map((e) => Number(e ?? 1));
      const [x, y] = /\((-?\d+), (-?\d+)\)\$\./.exec(ex.prompt)!.slice(1).map(Number);
      const f = (u: number, v: number) => c * u ** p * v ** q;
      const h = 1e-3;
      const mixed = (f(x + h, y + h) - f(x + h, y - h) - f(x - h, y + h) + f(x - h, y - h)) / (4 * h * h);
      expect(numberOf(ex), ex.prompt).toBeCloseTo(mixed, 3);
    }
  });

  it('probabilités', () => {
    for (const ex of all('l2-loi-poisson')) {
      const k = Number(/P\(X = (\d+)\)/.exec(ex.prompt)![1]);
      const lam = numberOf(ex);
      const r = /\) = (.+?)\\,P\(X/.exec(ex.prompt);
      const ratio = r ? texValue(r[1]) : 1;
      const first = Math.min(k, Number([...ex.prompt.matchAll(/P\(X = (\d+)\)/g)][1][1]));
      // P(X = j + 1)/P(X = j) = λ/(j + 1)
      expect(lam / (first + 1), ex.prompt).toBeCloseTo(ratio, 10);
    }
    for (const ex of all('l2-somme-independantes')) {
      const n = Number(/On lance \$(\d+)\$/.exec(ex.prompt)![1]);
      let law = new Map([[0, 1]]);
      for (let i = 0; i < n; i++) {
        const next = new Map<number, number>();
        for (const [s, p] of law) for (let f = 1; f <= 6; f++) next.set(s + f, (next.get(s + f) ?? 0) + p / 6);
        law = next;
      }
      const E = [...law].reduce((s, [v, p]) => s + v * p, 0);
      const V = [...law].reduce((s, [v, p]) => s + v * v * p, 0) - E * E;
      expect(numberOf(ex), ex.prompt).toBeCloseTo(ex.prompt.includes('V(S)') ? V : E, 8);
    }
    for (const ex of all('l2-constante-densite')) {
      const m = Number(/\(1 \+ x\)\^\{(\d+)\}/.exec(ex.prompt)![1]);
      expect(numberOf(ex) * onHalfLine((x) => (1 + x) ** -m), ex.prompt).toBeCloseTo(1, 6);
    }
    for (const ex of all('l2-esperance-densite')) {
      const [c, m] = /\\dfrac\{(\d+)\}\{\(1 \+ x\)\^\{(\d+)\}\}/.exec(ex.prompt)!.slice(1).map(Number);
      expect(numberOf(ex), ex.prompt).toBeCloseTo(onHalfLine((x) => (x * c) / (1 + x) ** m), 4);
    }
  });
});
