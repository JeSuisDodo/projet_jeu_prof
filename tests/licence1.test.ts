import katex from 'katex';
import { describe, expect, it } from 'vitest';
import { LICENCE1 } from '../src/content/licence1';
import { frac } from '../src/exercises/fraction';
import { bezout, cx, cxDiv, cxMul, det, gcd, rank } from '../src/exercises/licence1/util';
import { baseOf } from '../src/exercises/variantes';
import { Rng } from '../src/exercises/rng';
import { compose, sMul, usual } from '../src/exercises/licence1/variantes/dl';
import { checkVariantCount, drawsOf, numberOf, pairValues } from './helpers/variantes';
import { type Answer, type Exercise, type Level, type Response, checkAnswer } from '../src/exercises/types';

/** Vérifications propres à la Licence 1, en plus de tests/content.test.ts. */

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

const skills = LICENCE1.chapters.flatMap((c) => c.skills);
const skillOf = (id: string) => baseOf(skills.find((s) => s.id === id)!);
const value = (ex: Exercise) => {
  if (ex.answer.kind !== 'number') throw new Error(`${ex.skill} : réponse non numérique`);
  return ex.answer.value.n / ex.answer.value.d;
};
/** Tous les tirages d'une compétence, niveaux 1 à 3. */
const draws = (id: string, count = 60) =>
  [1, 2, 3].flatMap((level) => Array.from({ length: count }, (_, seed) => skillOf(id).generate(new Rng(seed * 7 + level * 1000), level as Level)));
/** Matrice écrite par `mat` : \begin{pmatrix}1 & 2 \\ 3 & 4\end{pmatrix}. */
const matrixIn = (text: string) =>
  /\\begin\{pmatrix\}(.*?)\\end\{pmatrix\}/.exec(text)![1].split(' \\\\ ').map((row) => row.split(' & ').map(Number));

describe('Licence 1', () => {
  it('couvre tout le programme de L1 (un chapitre par région)', () => {
    expect(LICENCE1.chapters.length).toBeGreaterThanOrEqual(16);
    expect(LICENCE1.stage).toBe('universite');
  });

  it('deux régions voisines n’ont ni le même relief ni le même thème', () => {
    LICENCE1.chapters.slice(1).forEach((c, i) => {
      expect(c.terrain, c.id).not.toBe(LICENCE1.chapters[i].terrain);
      expect(c.theme, c.id).not.toBe(LICENCE1.chapters[i].theme);
    });
  });

  it('les identifiants commencent par « l1- » et les symboles restent courts', () => {
    for (const c of LICENCE1.chapters) {
      expect(c.id.startsWith('l1-')).toBe(true);
      for (const x of [...c.creatures, c.boss]) {
        expect(x.id.startsWith('l1-'), x.id).toBe(true);
        expect([...(x.look.symbol ?? '')].length, x.id).toBeLessThanOrEqual(4);
        expect(x.description, x.id).not.toContain('$');
      }
      for (const s of c.skills) expect(s.id.startsWith('l1-'), s.id).toBe(true);
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
          expect(texts.join(' '), where).not.toMatch(/NaN|undefined|Infinity|\+ -|- -|--|\[object/);
          for (const t of texts) {
            // Les $ vont par paires et chaque formule est lisible par KaTeX.
            expect((t.match(/\$/g) ?? []).length % 2, `${where} : ${t}`).toBe(0);
            for (const m of t.matchAll(/\$([^$]+)\$/g)) expect(() => katex.renderToString(m[1], { throwOnError: true }), `${where} : ${m[1]}`).not.toThrow();
          }
        }
      expect(skill.generate(new Rng(42), 2)).toEqual(skill.generate(new Rng(42), 2));
      // Rend la main à la boucle d'événements (voir tests/terminale.test.ts).
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
});

describe('Licence 1 : outils de calcul', () => {
  it('déterminant, rang, Bézout, PGCD', () => {
    expect(det([[2, 1], [5, 3]])).toBe(1);
    expect(det([[1, 2, 3], [4, 5, 6], [7, 8, 10]])).toBe(-3);
    expect(rank([[1, 2, 3], [2, 4, 6], [1, 0, 1]])).toBe(2);
    expect(rank([[0, 0], [0, 0]])).toBe(0);
    const [u, v] = bezout(240, 46);
    expect(240 * u + 46 * v).toBe(gcd(240, 46));
  });

  it('calcul complexe exact', () => {
    expect(cxMul(cx(1, 2), cx(3, -1))).toEqual(cx(5, 5));
    expect(cxDiv(cx(1, 0), cx(0, 2))).toEqual(cx(0, frac(-1, 2)));
  });
});

describe('Licence 1 : réponses justes, recalculées depuis l’énoncé', () => {
  it('PGCD et PPCM', () => {
    for (const ex of draws('l1-pgcd')) {
      const [a, b] = /\((\d+), (\d+)\)/.exec(ex.prompt)!.slice(1).map(Number);
      expect(value(ex), ex.prompt).toBe(ex.prompt.includes('ppcm') ? (a * b) / gcd(a, b) : gcd(a, b));
    }
  });

  it('inverse modulaire et Bézout', () => {
    for (const ex of draws('l1-inverse-modulaire')) {
      const [a, n] = /\$(\d+)x \\equiv 1 \\pmod\{(\d+)\}/.exec(ex.prompt)!.slice(1).map(Number);
      expect((a * value(ex)) % n, ex.prompt).toBe(1);
    }
    for (const ex of draws('l1-bezout')) {
      const [a, b, c] = /\$(\d+)u \+ (\d+)v = (\d+)\$/.exec(ex.prompt)!.slice(1).map(Number);
      const u = value(ex);
      expect(u >= 0 && u < b && (c - a * u) % b === 0, ex.prompt).toBe(true);
    }
  });

  it('restes de puissances', () => {
    for (const ex of draws('l1-congruences')) {
      const [a, k, n] = /\$(\d+)\^\{(\d+)\}\$ par \$(\d+)\$/.exec(ex.prompt)!.slice(1).map(BigInt);
      let r = 1n;
      for (let i = 0n; i < k; i++) r = (r * a) % n;
      expect(BigInt(value(ex)), ex.prompt).toBe(r);
    }
  });

  it('nombre de diviseurs', () => {
    for (const ex of draws('l1-diviseurs', 20)) {
      const n = Number(/entier \$(\d+)\$/.exec(ex.prompt)![1]);
      let count = 0;
      for (let d = 1; d * d <= n; d++) if (n % d === 0) count += d * d === n ? 1 : 2;
      expect(value(ex), ex.prompt).toBe(count);
    }
  });

  it('sommes usuelles', () => {
    for (const ex of draws('l1-sommes-usuelles')) {
      const [p, n, , e] = /sum_\{k=(\d+)\}\^\{(\d+)\} k(\^(\d))?/.exec(ex.prompt)!.slice(1);
      let s = 0;
      for (let k = Number(p); k <= Number(n); k++) s += k ** Number(e ?? 1);
      expect(value(ex), ex.prompt).toBe(s);
    }
  });

  it('déterminants et rangs', () => {
    for (const ex of draws('l1-determinant')) expect(value(ex), ex.prompt).toBe(det(matrixIn(ex.prompt)));
    for (const ex of draws('l1-rang-matrice')) expect(value(ex), ex.prompt).toBe(rank(matrixIn(ex.prompt)));
  });

  it('systèmes 2 × 2 : la solution vérifie les équations', () => {
    for (const ex of draws('l1-systeme-2x2')) {
      if (ex.answer.kind !== 'pair') throw new Error('couple attendu');
      const [x, y] = ex.answer.values.map((f) => f.n / f.d);
      const rows = /\\begin\{cases\} (.*) \\end\{cases\}/.exec(ex.prompt)![1].split(' \\\\ ');
      for (const row of rows) {
        const [lhs, rhs] = row.split(' &= ');
        const coef = (v: string) => {
          const m = new RegExp(`(^|[+-] ?)(\\d*)${v}`).exec(lhs.replace(/ /g, ''));
          if (!m) return 0;
          return (m[1].includes('-') ? -1 : 1) * (m[2] === '' ? 1 : Number(m[2]));
        };
        expect(coef('x') * x + coef('y') * y, `${ex.prompt} : ${row}`).toBeCloseTo(Number(rhs), 9);
      }
    }
  });
});

describe('Licence 1 : variantes', () => {
  checkVariantCount(skills, 2);
});

describe('Licence 1 : variantes justes, recalculées depuis l’énoncé', () => {
  const all = (id: string, k: number) => drawsOf(skills, id, k);
  const brute = (N: number, f: (k: number) => boolean) => Array.from({ length: N }, (_, i) => i + 1).filter(f).length;

  it('logique et ensembles', () => {
    for (const ex of all('l1-cardinal-union', 1)) {
      const [N, a, b] = /de \$1\$ à \$(\d+)\$.*par \$(\d+)\$.*par \$(\d+)\$/.exec(ex.prompt)!.slice(1).map(Number);
      const neither = ex.prompt.includes(' ni ');
      expect(numberOf(ex), ex.prompt).toBe(brute(N, (k) => (k % a === 0 || k % b === 0) !== neither));
    }
    for (const ex of all('l1-cardinal-union', 3)) {
      const [a, b, u] = /\|A\| = (\d+)\$, \$\|B\| = (\d+)\$ et \$\|A \\cup B\| = (\d+)/.exec(ex.prompt)!.slice(1).map(Number);
      expect(numberOf(ex), ex.prompt).toBe(a - (a + b - u));
    }
    const subsets = (n: number) => Array.from({ length: 2 ** n }, (_, m) => Array.from({ length: n }, (_, i) => i + 1).filter((x) => m & (1 << (x - 1))));
    for (const ex of all('l1-parties', 1)) {
      const n = Number(/\\dots, (\d+)/.exec(ex.prompt)![1]);
      const tests: [string, (s: number[]) => boolean][] = [
        ['contiennent l’élément', (s) => s.includes(1)],
        ['non vides', (s) => s.length > 0],
        ['ni $1$ ni $2$', (s) => !s.includes(1) && !s.includes(2)],
        ['au plus', (s) => s.length <= 2],
        ['mais pas', (s) => s.includes(1) && !s.includes(2)],
      ];
      const f = tests.find(([key]) => ex.prompt.includes(key))![1];
      expect(numberOf(ex), ex.prompt).toBe(subsets(n).filter(f).length);
    }
    for (const ex of all('l1-parties', 2)) {
      const n = Number(/a \$(\d+)\$ éléments/.exec(ex.prompt)![1]);
      const S = subsets(n);
      const ok = ex.prompt.includes('cap') ? (a: number[], b: number[]) => a.every((x) => !b.includes(x)) : (a: number[], b: number[]) => a.every((x) => b.includes(x));
      expect(numberOf(ex), ex.prompt).toBe(S.flatMap((a) => S.map((b) => ok(a, b))).filter(Boolean).length);
    }
    for (const ex of all('l1-operations-ensembles', 4)) {
      const [N, p, q] = /1, \\dots, (\d+)\\\}.*multiples de \$(\d+)\$.*multiples de \$(\d+)\$/.exec(ex.prompt)!.slice(1).map(Number);
      const diff = ex.prompt.includes('setminus');
      expect(numberOf(ex), ex.prompt).toBe(brute(N, (k) => k % p === 0 && (diff ? k % q !== 0 : k % q === 0)));
    }
  });

  const ints = (t: string) => [...t.matchAll(/-?\d+/g)].map((m) => Number(m[0]));
  const gcdN = (a: number, b: number): number => (b ? gcdN(b, a % b) : Math.abs(a));

  it('applications', () => {
    for (const ex of all('l1-image-directe', 1)) {
      const [c, a, b] = [/x\^2( [+-] \d+)?\$/.exec(ex.prompt)![1], ...ints(/f\(\[(.*?)\]\)/.exec(ex.prompt)![1])];
      const cc = c ? Number(c.replace(/ /g, '')) : 0;
      const vals = Array.from({ length: (b - a) * 100 + 1 }, (_, i) => (a + i / 100) ** 2 + cc);
      expect(pairValues(ex), ex.prompt).toEqual([Math.min(...vals), Math.max(...vals)].map((v) => Math.round(v * 1e6) / 1e6 + 0));
    }
    for (const ex of all('l1-image-directe', 3)) {
      const [a, b] = ints(/\\\{(-?\d+), \\dots, (-?\d+)\\\}/.exec(ex.prompt)![0]);
      expect(numberOf(ex), ex.prompt).toBe(new Set(Array.from({ length: b - a + 1 }, (_, i) => (a + i) ** 2)).size);
    }
    for (const ex of all('l1-composition', 2)) {
      const [, x0] = /\\,\((-?\d+)\)\$/.exec(ex.prompt)!;
      const n = (ex.prompt.match(/\\circ/g) ?? []).length + 1;
      const f = /f\(x\) = (.*?)\$/.exec(ex.prompt)![1];
      const m = /^(-?\d*)x(?: ([+-]) (\d+))?$/.exec(f)!;
      const a = m[1] === '' ? 1 : m[1] === '-' ? -1 : Number(m[1]);
      const b = m[2] ? (m[2] === '-' ? -1 : 1) * Number(m[3]) : 0;
      let v = Number(x0);
      for (let i = 0; i < n; i++) v = a * v + b;
      expect(numberOf(ex), ex.prompt).toBe(v);
    }
    const fact = (n: number): number => (n <= 1 ? 1 : n * fact(n - 1));
    for (const ex of all('l1-compter-applications', 2)) {
      const [n, p] = ints(ex.prompt);
      expect(numberOf(ex), ex.prompt).toBe(ex.prompt.includes('différente') ? fact(p) / fact(p - n) : p ** n);
    }
  });

  it('arithmétique', () => {
    for (const ex of all('l1-pgcd', 2)) {
      const [g, , a] = ints(ex.prompt);
      const lcm = ints(ex.prompt)[1];
      expect((a * numberOf(ex)) / g, ex.prompt).toBe(lcm);
      expect(gcdN(a, numberOf(ex)), ex.prompt).toBe(g);
    }
    for (const ex of all('l1-inverse-modulaire', 1)) {
      const [, a, b, n] = /\$(\d+)x \\equiv (\d+) \\pmod\{(\d+)\}/.exec(ex.prompt)!.map(Number);
      expect((a * numberOf(ex)) % n, ex.prompt).toBe(b);
    }
    for (const ex of all('l1-inverse-modulaire', 3)) {
      const n = Number(/\\dots, (\d+)\\\}/.exec(ex.prompt)![1]) + 1;
      expect(numberOf(ex), ex.prompt).toBe(Array.from({ length: n }, (_, k) => k).filter((k) => gcdN(k, n) === 1).length);
    }
    for (const ex of all('l1-bezout', 2)) {
      const [m1, r1, m2, r2] = ints(ex.prompt.split('Quel')[0]);
      const N = numberOf(ex);
      expect(N % m1 === r1 && N % m2 === r2 && N > 0, ex.prompt).toBe(true);
      for (let k = 1; k < N; k++) expect(k % m1 === r1 && k % m2 === r2, ex.prompt).toBe(false);
    }
    for (const ex of all('l1-bezout', 3)) {
      const [, a, b, c] = /\$(\d+)x \+ (\d+)y = (\d+)\$/.exec(ex.prompt)!.map(Number);
      let count = 0;
      for (let x = 0; x <= c; x++) for (let y = 0; y <= c; y++) if (a * x + b * y === c) count++;
      expect(numberOf(ex), ex.prompt).toBe(count);
    }
    for (const ex of all('l1-congruences', 1)) {
      const [, a, k] = /\$(\d+)\^\{(\d+)\}\$/.exec(ex.prompt)!.map(Number);
      let r = 1;
      for (let i = 0; i < k; i++) r = (r * a) % 10;
      expect(numberOf(ex), ex.prompt).toBe(r);
    }
    for (const ex of all('l1-congruences', 4)) {
      const [, n, m] = /de \$(\d+)\$ par \$(\d+)\$/.exec(ex.prompt)!;
      expect(numberOf(ex), ex.prompt).toBe(Number(BigInt(n) % BigInt(m)));
    }
    const divisors = (n: number) => Array.from({ length: n }, (_, i) => i + 1).filter((d) => n % d === 0);
    for (const ex of all('l1-diviseurs', 1)) {
      const n = ints(ex.prompt)[0];
      expect(numberOf(ex), ex.prompt).toBe(divisors(n).reduce((x, y) => x + y, 0));
    }
    for (const ex of all('l1-diviseurs', 2)) {
      const m = /\$n(?: ([+-]) (\d+))?\$ divise \$(\d+)n(?: ([+-]) (\d+))?\$/.exec(ex.prompt)!;
      const a = m[1] ? (m[1] === '-' ? 1 : -1) * Number(m[2]) : 0;
      const [b, c] = [Number(m[3]), m[4] ? (m[4] === '-' ? -1 : 1) * Number(m[5]) : 0];
      if (ex.answer.kind !== 'set') throw new Error('ensemble attendu');
      const got = ex.answer.values.map((f) => f.n).sort((x, y) => x - y);
      const want = Array.from({ length: 81 }, (_, i) => i - 40).filter((n) => n !== a && (b * n + c) % (n - a) === 0);
      expect(got, ex.prompt).toEqual(want);
    }
    for (const ex of all('l1-diviseurs', 3)) {
      const d = ints(ex.prompt)[0];
      const n = numberOf(ex);
      expect(divisors(n).length, ex.prompt).toBe(d);
      for (let k = 1; k < n; k++) expect(divisors(k).length === d, ex.prompt).toBe(false);
    }
    for (const ex of all('l1-valuation', 1)) {
      let f = 1n;
      const n = ints(ex.prompt)[0];
      for (let i = 2n; i <= BigInt(n); i++) f *= i;
      const zeros = f.toString().length - f.toString().replace(/0+$/, '').length;
      expect(numberOf(ex), ex.prompt).toBe(zeros);
    }
  });

  it('complexes', () => {
    for (const ex of all('l1-module', 3)) {
      const zs = [...ex.prompt.matchAll(/affixes \$(.*?)\$ et \$(.*?)\$/g)][0].slice(1);
      const parse = (z: string) => {
        const m = /^(-?\d+)?(?: ?([+-]) ?)?(\d*)i$|^(-?\d+)$/.exec(z.replace(/\s/g, ' ').trim());
        if (!m) throw new Error(z);
        if (m[4] !== undefined) return [Number(m[4]), 0];
        const re = m[1] ? Number(m[1]) : 0;
        const sign = m[2] === '-' || (!m[1] && z.trim().startsWith('-')) ? -1 : 1;
        const im = m[3] === '' ? 1 : Number(m[3]);
        return [re, sign * im];
      };
      const [a, b] = zs.map((z) => (/^-?\d*i$/.test(z) ? [0, z === 'i' ? 1 : z === '-i' ? -1 : Number(z.slice(0, -1))] : parse(z)));
      expect(numberOf(ex), ex.prompt).toBeCloseTo(Math.hypot(a[0] - b[0], a[1] - b[1]), 9);
    }
    for (const ex of all('l1-puissance-complexe', 3)) {
      const [n, m] = ints(ex.prompt);
      expect(numberOf(ex), ex.prompt).toBe(gcdN(n, m));
    }
    for (const ex of all('l1-puissance-complexe', 2)) {
      const n = ints(ex.prompt.split('^{')[1])[0];
      if (ex.answer.kind !== 'pair') throw new Error('couple');
      const re = Array.from({ length: n + 1 }, (_, k) => [1, 0, -1, 0][k % 4]).reduce((x, y) => x + y, 0);
      const im = Array.from({ length: n + 1 }, (_, k) => [0, 1, 0, -1][k % 4]).reduce((x, y) => x + y, 0);
      expect(pairValues(ex), ex.prompt).toEqual([re, im]);
    }
  });

  it('sommes', () => {
    for (const ex of all('l1-sommes-usuelles', 3)) {
      const n = Number(/\^\{(\d+)\}/.exec(ex.prompt)![1]);
      const f = ex.prompt.includes('k^3') ? (k: number) => k ** 3 : (k: number) => k * (k + 1);
      expect(numberOf(ex), ex.prompt).toBe(Array.from({ length: n }, (_, i) => f(i + 1)).reduce((x, y) => x + y, 0));
    }
    for (const ex of all('l1-somme-geometrique', 2)) {
      const [, p, n, q] = /sum_\{k=(\d+)\}\^\{(\d+)\} \(?(-?\d+)\)?\^k/.exec(ex.prompt)!.map(Number);
      let s = 0;
      for (let k = p; k <= n; k++) s += q ** k;
      expect(numberOf(ex), ex.prompt).toBe(s);
    }
    const C = (n: number, k: number): number => (k < 0 || k > n ? 0 : k === 0 ? 1 : (C(n - 1, k - 1) * n) / k);
    for (const ex of all('l1-somme-binomiale', 1)) {
      const n = Number(/n = (\d+)/.exec(ex.prompt)![1]);
      const f = ex.prompt.includes('k\\binom') ? (k: number) => k * C(n, k) : ex.prompt.includes('^2') ? (k: number) => C(n, k) ** 2 : (k: number) => (-1) ** k * C(n, k);
      expect(numberOf(ex), ex.prompt).toBe(Array.from({ length: n + 1 }, (_, k) => f(k)).reduce((x, y) => x + y, 0));
    }
    for (const ex of all('l1-somme-telescopique', 1)) {
      const n = Number(/\^\{(\d+)\}/.exec(ex.prompt)![1]);
      let v = 1;
      for (let k = 2; k <= n; k++) v *= 1 - 1 / (k * k);
      expect(numberOf(ex), ex.prompt).toBeCloseTo(v, 12);
    }
    for (const ex of all('l1-somme-double', 1)) {
      const n = Number(/n = (\d+)/.exec(ex.prompt)![1]);
      let v = 0;
      for (let i = 1; i <= n; i++)
        for (let j = 1; j <= n; j++) {
          if (ex.prompt.includes('ij')) v += i * j;
          else if (ex.prompt.includes('i \\leq j')) v += i <= j ? 1 : 0;
          else if (ex.prompt.includes('min')) v += Math.min(i, j);
          else if (ex.prompt.includes('i < j')) v += i < j ? i + j : 0;
          else v += i + j;
        }
      expect(numberOf(ex), ex.prompt).toBe(v);
    }
  });

  it('suites', () => {
    for (const ex of all('l1-recurrence-lineaire-ordre2', 1)) {
      const [u0, u1] = [/u_0 = (\d+)/, /u_1 = (\d+)/].map((r) => Number(r.exec(ex.prompt)![1]));
      const rec = /u_\{n\+2\} = (\d*)u_\{n\+1\} \+ (\d*)u_n/.exec(ex.prompt)!;
      const [a, b] = [Number(rec[1] || 1), Number(rec[2] || 1)];
      const k = Number(/Calcule \$u_\{(\d+)\}/.exec(ex.prompt)![1]);
      const u = [u0, u1];
      for (let i = 2; i <= k; i++) u.push(a * u[i - 1] + b * u[i - 2]);
      expect(numberOf(ex), ex.prompt).toBe(u[k]);
    }
    for (const ex of all('l1-suite-arithmetico-geometrique', 2)) {
      const [, u0, a, rest] = /u_0 = (-?\d+)\$ et \$u_\{n\+1\} = (-?\d+)u_n(.*?)\$/.exec(ex.prompt)!;
      const b = rest ? Number(rest.replace(/ /g, '')) : 0;
      const k = Number(/Calcule \$u_\{(\d+)\}/.exec(ex.prompt)![1]);
      let u = Number(u0);
      for (let i = 0; i < k; i++) u = Number(a) * u + b;
      expect(numberOf(ex), ex.prompt).toBe(u);
    }
    for (const ex of all('l1-seuil-convergence', 1)) {
      const [q, k] = /frac\{1\}\{(\d+)\}.*10\^\{-(\d+)\}/.exec(ex.prompt)!.slice(1).map(Number);
      const n = numberOf(ex);
      expect(q ** n > 10 ** k && q ** (n - 1) <= 10 ** k, ex.prompt).toBe(true);
    }
  });

  it('polynômes, dérivées, DL, intégrales : outils exacts', () => {
    for (const ex of all('l1-division-euclidienne', 1)) {
      const n = Number(/X\^\{(\d+)\}/.exec(ex.prompt)![1]);
      const [r, s0] = pairValues(ex);
      const B = /par \$(.*?)\$/.exec(ex.prompt)![1];
      // Les racines de B : on teste X^n ≡ rX + s aux deux racines entières entre -2 et 2.
      const roots = [-2, -1, 0, 1, 2].filter((x) => {
        const m = /^X\^\{2\}(?: ([+-]) (\d*)X)?(?: ([+-]) (\d+))?$/.exec(B)!;
        const b = m[1] ? (m[1] === '-' ? -1 : 1) * Number(m[2] || 1) : 0;
        const c = m[3] ? (m[3] === '-' ? -1 : 1) * Number(m[4]) : 0;
        return x * x + b * x + c === 0;
      });
      expect(roots.length, ex.prompt).toBe(2);
      for (const x of roots) expect(x ** n, ex.prompt).toBe(r * x + s0);
    }
    for (const ex of all('l1-extremum-local', 2)) {
      const k = ints(ex.prompt)[0];
      const xs = Array.from({ length: 20000 }, (_, i) => 0.001 + i * 0.001);
      const f = (x: number) => x + k / x;
      const best = xs.reduce((b, x) => (f(x) < f(b) ? x : b), xs[0]);
      expect(numberOf(ex), ex.prompt).toBeCloseTo(ex.prompt.includes('Quel est son minimum') ? f(best) : best, 2);
    }
    for (const ex of all('l1-changement-variable', 3)) {
      const n = Number(/\^\{(\d+)\}/.exec(ex.prompt)![1]);
      const g = ex.prompt.includes('\\cos^') ? (x: number) => Math.cos(x) ** n * Math.sin(x) : (x: number) => Math.sin(x) ** n * Math.cos(x);
      let s = 0;
      const N = 20000;
      for (let i = 0; i < N; i++) s += g(((i + 0.5) * Math.PI) / 2 / N) * (Math.PI / 2 / N);
      expect(numberOf(ex), ex.prompt).toBeCloseTo(s, 6);
    }
  });

  it('outils de DL : compositions connues', () => {
    const v = (s: { n: number; d: number }[]) => s.slice(0, 5).map((f) => f.n / f.d);
    const one = usual('exp', 0);
    const cosMinus1 = usual('cos').map((f, i) => (i === 0 ? { n: 0, d: 1 } : f));
    expect(v(compose('exp', usual('sin')))).toEqual([1, 1, 0.5, 0, -1 / 8]);
    expect(v(compose('ln', cosMinus1))).toEqual([0, 0, -0.5, 0, -1 / 12]);
    expect(v(compose('sqrt', cosMinus1))).toEqual([1, 0, -0.25, 0, -1 / 96]);
    expect(v(compose('geo', usual('cos').map((f, i) => (i === 0 ? { n: 0, d: 1 } : { n: -f.n, d: f.d }))))).toEqual([1, 0, 0.5, 0, 5 / 24]);
    expect(v(sMul(usual('exp'), usual('exp', -1)))).toEqual(v(one));
  });

  it('intégrales : valeurs exactes contre intégration numérique', () => {
    const simpson = (f: (x: number) => number, a: number, b: number, N = 2000) => {
      const h = (b - a) / N;
      let s = f(a) + f(b);
      for (let i = 1; i < N; i++) s += f(a + i * h) * (i % 2 ? 4 : 2);
      return (s * h) / 3;
    };
    for (const ex of all('l1-integration-parties', 1)) {
      const n = Number(/\^\{(\d+)\}/.exec(ex.prompt)![1]);
      expect(numberOf(ex), ex.prompt).toBeCloseTo(simpson((x) => x * (1 - x) ** n, 0, 1), 8);
    }
    for (const ex of all('l1-changement-variable', 1)) {
      const [a, c2] = /int_0\^\{(\d+)\} x\\sqrt\{x\^2 \+ (\d+)\}/.exec(ex.prompt)!.slice(1).map(Number);
      expect(numberOf(ex), ex.prompt).toBeCloseTo(simpson((x) => x * Math.sqrt(x * x + c2), 0, a), 6);
    }
    for (const ex of all('l1-sommes-riemann', 2)) {
      const p = Number(/k\^\{(\d+)\}/.exec(ex.prompt)![1]);
      expect(numberOf(ex), ex.prompt).toBeCloseTo(1 / (p + 1), 12);
    }
    for (const ex of all('l1-primitives-usuelles', 3)) {
      const [a, b] = ints(/\[(.*?)\]/.exec(ex.prompt)![1]);
      const coefs = /f\(x\) = (.*?)\$/.exec(ex.prompt)![1];
      const f = (x: number) => Function('x', `return ${coefs.replace(/\^\{(\d+)\}/g, '**$1').replace(/(\d)x/g, '$1*x').replace(/-x/g, '-1*x')}`)(x) as number;
      expect(numberOf(ex), ex.prompt).toBeCloseTo(simpson(f, a, b) / (b - a), 8);
    }
  });
});
