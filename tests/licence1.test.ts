import katex from 'katex';
import { describe, expect, it } from 'vitest';
import { LICENCE1 } from '../src/content/licence1';
import { frac } from '../src/exercises/fraction';
import { bezout, cx, cxDiv, cxMul, det, gcd, rank } from '../src/exercises/licence1/util';
import { Rng } from '../src/exercises/rng';
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
const skillOf = (id: string) => skills.find((s) => s.id === id)!;
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
