import katex from 'katex';
import { describe, expect, it } from 'vitest';
import { LICENCE3 } from '../src/content/licence3';
import { baseOf } from '../src/exercises/variantes';
import { Rng } from '../src/exercises/rng';
import { type Answer, type Level, type Response, checkAnswer } from '../src/exercises/types';
import { divisors, gcd, lcm, modInverse, phi } from '../src/exercises/licence3/util';
import { dx, dy, evalP } from '../src/exercises/licence3/calculDifferentiel';
import { checkVariantCount, drawsOf, numberOf } from './helpers/licenceVariantes';

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

describe('Licence 3 : variantes', () => {
  checkVariantCount(skills, 2);
});

describe('Licence 3 : variantes justes, recalculées depuis l’énoncé', () => {
  const all = (id: string, k = 1) => drawsOf(skills, id, k);
  const ints = (t: string) => [...t.matchAll(/-?\d+/g)].map((m) => Number(m[0]));
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
  const order = (k: number, n: number) => {
    let o = 1;
    while ((k * o) % n !== 0) o++;
    return o;
  };

  it('groupes et anneaux', () => {
    for (const ex of all('l3-ordre-zn')) {
      const [d, n] = /exactement \$(\d+)\$ le groupe \$\\mathbb\{Z\}\/(\d+)/.exec(ex.prompt)!.slice(1).map(Number);
      expect(numberOf(ex), ex.prompt).toBe(Array.from({ length: n }, (_, k) => k).filter((k) => order(k, n) === d).length);
    }
    // Plus grand PPCM d'une partition de n (fonction de Landau), par force brute.
    const landau = (n: number, max = n): number => {
      if (n === 0) return 1;
      let best = 1;
      for (let k = Math.min(n, max); k >= 1; k--) best = Math.max(best, lcm(k, landau(n - k, k)));
      return best;
    };
    for (const ex of all('l3-ordre-permutation')) {
      const m = /élément de \$\\mathfrak\{S\}_\{(\d+)\}/.exec(ex.prompt);
      if (m) expect(numberOf(ex), ex.prompt).toBe(landau(Number(m[1])));
      else expect(numberOf(ex), ex.prompt).toBe(ints(/longueurs \$(.*)\$\./.exec(ex.prompt)![1]).reduce(lcm, 1));
    }
    for (const ex of all('l3-signature')) {
      const line = ints(/\\\\ (.*)\\end\{pmatrix\}/.exec(ex.prompt)![1]);
      let inv = 0;
      for (let i = 0; i < line.length; i++) for (let j = i + 1; j < line.length; j++) if (line[i] > line[j]) inv++;
      expect(numberOf(ex), ex.prompt).toBe(inv);
    }
    for (const ex of all('l3-generateurs-cycliques')) {
      const p = Number(/\\mathbb\{Z\}\/(\d+)/.exec(ex.prompt)![1]);
      const mulOrder = (g: number) => {
        let [x, o] = [g, 1];
        while (x !== 1) (x = (x * g) % p), o++;
        return o;
      };
      expect(numberOf(ex), ex.prompt).toBe(Array.from({ length: p - 1 }, (_, i) => i + 1).filter((g) => mulOrder(g) === p - 1).length);
    }
    for (const ex of all('l3-inverse-modulaire')) {
      const [a, b, n] = /\$(\d+)x \\equiv (\d+) \\pmod\{(\d+)\}/.exec(ex.prompt)!.slice(1).map(Number);
      expect((a * numberOf(ex)) % n, ex.prompt).toBe(b % n);
    }
    for (const ex of all('l3-indicatrice-euler')) {
      const [a, e, n] = /\$(\d+)\^\{(\d+)\}\$ par \$(\d+)\$/.exec(ex.prompt)!.slice(1).map(Number);
      expect(numberOf(ex), ex.prompt).toBe(Number(BigInt(a) ** BigInt(e) % BigInt(n)));
    }
    for (const ex of all('l3-restes-chinois')) {
      const [m1, r1, m2, r2, m3, r3] = ints(ex.prompt.split('Elle a')[0]);
      const N = numberOf(ex);
      expect([N % m1, N % m2, N % m3], ex.prompt).toEqual([r1, r2, r3]);
      expect(N, ex.prompt).toBeLessThan(m1 * m2 * m3);
    }
    for (const ex of all('l3-ideaux-z')) {
      const n = Number(/\\mathbb\{Z\}\/(\d+)/.exec(ex.prompt)![1]);
      // Sous-groupes additifs (= idéaux) : ceux engendrés par chaque élément.
      const subgroups = new Set(Array.from({ length: n }, (_, k) => Array.from({ length: n }, (_, j) => (j * k) % n).sort((x, y) => x - y).filter((x, i, t) => t.indexOf(x) === i).join(',')));
      expect(numberOf(ex), ex.prompt).toBe(subgroups.size);
    }
    for (const ex of all('l3-corps-fini')) {
      const p = Number(/\\mathbb\{F\}_\{(\d+)\}/.exec(ex.prompt)![1]);
      let count = 0;
      for (let b = 0; b < p; b++) for (let c = 0; c < p; c++) if (!Array.from({ length: p }, (_, x) => x).some((x) => (x * x + b * x + c) % p === 0)) count++;
      expect(numberOf(ex), ex.prompt).toBe(count);
    }
  });

  it('analyse', () => {
    for (const ex of all('l3-distance-ensemble')) {
      const z = /de \$(.+)\$ à \$\\mathbb\{Z\}/.exec(ex.prompt);
      if (z) {
        const x = texValue(z[1]);
        expect(numberOf(ex), ex.prompt).toBeCloseTo(Math.abs(x - Math.round(x)), 10);
      } else {
        const [x, y, R] = ints(ex.prompt.split('point')[1]);
        expect(numberOf(ex), ex.prompt).toBeCloseTo(Math.abs(Math.hypot(x, y) - R), 10);
      }
    }
    for (const ex of all('l3-lipschitz')) {
      const c = Number(/= (-?\d*)x\^3/.exec(ex.prompt)![1].replace(/^(-?)$/, '$11'));
      const a = Number(/\[-(\d+)/.exec(ex.prompt)![1]);
      let best = 0;
      for (let i = 0; i < 2000; i++) {
        const [x, y] = [-a + (2 * a * i) / 2000, -a + (2 * a * (i + 1)) / 2000];
        best = Math.max(best, Math.abs(c * (y ** 3 - x ** 3)) / (y - x));
      }
      expect(Math.abs(numberOf(ex) - best) / best, ex.prompt).toBeLessThan(0.01);
    }
    for (const ex of all('l3-mesure-lebesgue')) {
      const N = Number(/\[0\\,;\\,(\d+)\]/.exec(ex.prompt)![1]);
      const t = texValue(/< (.+)\\\}\\right\)/.exec(ex.prompt)![1]);
      const M = 100000;
      const hits = Array.from({ length: M }, (_, i) => ((i + 0.5) / M) * N).filter((x) => x - Math.floor(x) < t).length;
      expect(numberOf(ex), ex.prompt).toBeCloseTo((hits / M) * N, 3);
    }
    for (const ex of all('l3-fubini')) {
      const a = Number(/x \\leq (\d+)/.exec(ex.prompt)![1]);
      const k = Number(/\} x(?:\^\{(\d+)\})?\\,dx/.exec(ex.prompt)![1] ?? 1);
      expect(numberOf(ex), ex.prompt).toBeCloseTo(simpson((x) => simpson((y) => (y <= x ? x ** k : 0), 0, x, 40), 0, a, 400), 4);
    }
    for (const ex of all('l3-projection-orthogonale')) {
      const k = Number(/f\(x\) = x(?:\^\{(\d+)\})?\$/.exec(ex.prompt)![1] ?? 1);
      const c = simpson((x) => x ** k, 0, 1);
      expect(numberOf(ex), ex.prompt).toBeCloseTo(simpson((x) => (x ** k - c) ** 2, 0, 1), 8);
    }
    for (const ex of all('l3-produit-scalaire-l2')) {
      const [m, n] = /cos\((\d)x\)\\cos\((\d)x\)/.exec(ex.prompt)!.slice(1).map(Number);
      expect(numberOf(ex), ex.prompt).toBeCloseTo(simpson((x) => Math.cos(m * x) * Math.cos(n * x), 0, 2 * Math.PI) / Math.PI, 8);
    }
    for (const ex of all('l3-residu-pole-multiple')) {
      const k = Number(/z\^\{(\d+)\}/.exec(ex.prompt)![1]);
      const m = /\(1 ([+-]) (\d*)z\)/.exec(ex.prompt)!;
      const a = (m[1] === '-' ? 1 : -1) * Number(m[2] || 1);
      // Résidu = intégrale sur le cercle |z| = r < 1/|a|, divisée par 2iπ (partie réelle de la moyenne de z·f(z)).
      const r = 0.5 / Math.abs(a);
      const mean = simpson((t) => {
        const [x, y] = [r * Math.cos(t), r * Math.sin(t)];
        // z f(z) = z^{1−k}/(1 − az) ; on calcule sa partie réelle.
        const [re1, im1] = [Math.cos((1 - k) * t) * r ** (1 - k), Math.sin((1 - k) * t) * r ** (1 - k)];
        const [dr, di] = [1 - a * x, -a * y];
        return (re1 * dr + im1 * di) / (dr * dr + di * di);
      }, 0, 2 * Math.PI) / (2 * Math.PI);
      expect(numberOf(ex), ex.prompt).toBeCloseTo(mean, 6);
    }
  });

  it('calcul différentiel, équations différentielles, analyse numérique', () => {
    for (const ex of all('l3-fonctions-implicites')) {
      const [R2, x0, y0] = ints(ex.prompt.split('Calcule')[0].replace('x^2 + y^2', ''));
      const phi = (x: number) => Math.sign(y0) * Math.sqrt(R2 - x * x);
      expect(numberOf(ex), ex.prompt).toBeCloseTo((phi(x0 + 1e-6) - phi(x0 - 1e-6)) / 2e-6, 5);
    }
    for (const ex of all('l3-methode-newton')) {
      const [a, x0] = /x\^3 - (\d+)\$ en partant de \$x_0 = (\d+)/.exec(ex.prompt)!.slice(1).map(Number);
      expect(numberOf(ex), ex.prompt).toBeCloseTo(x0 - (x0 ** 3 - a) / (3 * x0 ** 2), 10);
    }
    for (const ex of all('l3-quadrature')) {
      const b = Number(/int_0\^\{(\d+)\}/.exec(ex.prompt)![1]);
      const P = /P\(x\) = (.+)\$, par/.exec(ex.prompt)![1];
      const coef = (pow: string) => {
        const m = new RegExp(`(?:^|([+-]) )(\\d*)x${pow}(?![\\^\\d])`).exec(P.replace(/^-/, '- '));
        return m ? (m[1] === '-' ? -1 : 1) * Number(m[2] || 1) : 0;
      };
      const c0 = Number(/([+-]) (\d+)$/.exec(P)?.slice(1).join('') ?? (/^-?\d+$/.test(P) ? P : 0));
      const [c3, c2, c1] = [coef('\\^3'), coef('\\^2'), coef('')];
      expect(numberOf(ex), ex.prompt).toBeCloseTo(simpson((x) => c3 * x ** 3 + c2 * x ** 2 + c1 * x + c0, 0, b), 6);
    }
    for (const ex of all('l3-interpolation-lagrange')) {
      const xs = ints(/nœuds d’interpolation sont \$(.+?)\$/.exec(ex.prompt)![1]);
      const [i, t] = /L_\{(\d)\}\((-?\d+)\)/.exec(ex.prompt)!.slice(1).map(Number);
      // Base de Lagrange : vérifie qu'elle vaut 1 en x_i, 0 ailleurs, en résolvant le système de Vandermonde.
      const ys = xs.map((_, j) => (j === i ? 1 : 0));
      const L = (x: number) => xs.reduce((s, xj, j) => s + ys[j] * xs.filter((_, k) => k !== j).reduce((p, xk) => (p * (x - xk)) / (xj - xk), 1), 0);
      expect(numberOf(ex), ex.prompt).toBeCloseTo(L(t), 10);
    }
    for (const ex of all('l3-euler-explicite')) {
      const n = Number(/frac\{1\}\{(\d+)\}/.exec(ex.prompt)![1]);
      let y = 1;
      for (let k = 0; k < n; k++) y += y / n;
      expect(numberOf(ex), ex.prompt).toBeCloseTo(y, 10);
    }
    for (const ex of all('l3-temps-explosion')) {
      const y0 = texValue(/y\(0\) = (.+?)\$/.exec(ex.prompt)![1]);
      // T = ∫_{y₀}^{+∞} dy/y³ ; avec u = 1/y : ∫₀^{1/y₀} u du.
      expect(numberOf(ex), ex.prompt).toBeCloseTo(simpson((u) => u, 0, 1 / y0), 10);
    }
  });

  it('probabilités et statistique', () => {
    for (const ex of all('l3-esperance-conditionnelle')) {
      const [n, k] = ints(ex.prompt.replace(/\$E\(X.*/, '').replace('à', '')).concat(Number(/X > (\d+)/.exec(ex.prompt)![1])).filter((_, i, t) => i === 0 || i === t.length - 1);
      const faces = Array.from({ length: n }, (_, i) => i + 1).filter((x) => x > k);
      expect(numberOf(ex), ex.prompt).toBeCloseTo(faces.reduce((s, x) => s + x, 0) / faces.length, 10);
    }
    for (const ex of all('l3-moments-empiriques')) {
      const n = Number(/de \$(\d+)\$ valeurs/.exec(ex.prompt)![1]);
      const m = texValue(/pour moyenne \$(.+?)\$/.exec(ex.prompt)![1]);
      const data = ints(/d’entre elles : \$(.+)\$\./.exec(ex.prompt)![1]);
      expect((data.reduce((s, x) => s + x, 0) + numberOf(ex)) / n, ex.prompt).toBeCloseTo(m, 10);
    }
    for (const ex of all('l3-bienayme-tchebychev')) {
      const v = Number(/variance \$(\d+)\$/.exec(ex.prompt)![1]);
      const [a, alpha] = [...ex.prompt.matchAll(/\\geq (.+?)\\right\) \\leq (.+?)\$/g)][0].slice(1).map(texValue);
      const n = numberOf(ex);
      expect(v / (n * a * a), ex.prompt).toBeLessThanOrEqual(alpha + 1e-12);
      expect(v / ((n - 1) * a * a), ex.prompt).toBeGreaterThan(alpha);
    }
    for (const ex of all('l3-tcl')) {
      const [sigma, e] = ints(ex.prompt);
      const n = numberOf(ex);
      expect(sigma / Math.sqrt(n), ex.prompt).toBeLessThanOrEqual(e + 1e-12);
      expect(sigma / Math.sqrt(n - 1), ex.prompt).toBeGreaterThan(e);
    }
  });
});
