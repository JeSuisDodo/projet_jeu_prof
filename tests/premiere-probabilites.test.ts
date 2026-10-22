import { describe, expect, it } from 'vitest';
import { PROBABILITES_CONDITIONNELLES } from '../src/content/premiere/probabilites-conditionnelles';
import { VARIABLES_ALEATOIRES } from '../src/content/premiere/variables-aleatoires';
import { Rng } from '../src/exercises/rng';
import type { Exercise, Level, Skill } from '../src/exercises/types';

/** Recalcule chaque réponse à partir des nombres lus dans l'énoncé. */

const skill = (chapter: { skills: Skill[] }, id: string) => chapter.skills.find((s) => s.id === id)!;

function* exercises(s: Skill, n = 200): Generator<Exercise> {
  for (const level of [1, 2, 3] as Level[]) for (let seed = 1; seed <= n; seed++) yield s.generate(new Rng(seed * 1299709 + level), level);
}

const num = (ex: Exercise) => {
  if (ex.answer.kind !== 'number') throw new Error('réponse numérique attendue');
  return ex.answer.value.n / ex.answer.value.d;
};

const decimal = (s: string) => Number(s.replace('{,}', '.'));
/** Valeur écrite juste après « label = ». */
const after = (s: string, label: string) => decimal(new RegExp(`${label.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&')} = (-?\\d+(?:\\{,\\}\\d+)?)`).exec(s)![1]);
/** Lignes d'un tableau array : cellules numériques de chaque ligne. */
const rows = (s: string) =>
  /\\begin\{array\}.*?\\end\{array\}/
    .exec(s)![0]
    .split('\\\\')
    .map((r) => r.split('&').map((c) => c.replace(/\\hline|\\begin\{array\}\{[^}]*\}/g, '').trim()));

const tree = (s: string) => [after(s, 'P(A)'), after(s, 'P_{A}(B)'), after(s, 'P_{\\overline{A}}(B)')];

describe('Probabilités conditionnelles : calculs justes', () => {
  it('tableau croisé', () => {
    for (const ex of exercises(skill(PROBABILITES_CONDITIONNELLES, '1re-proba-tableau'))) {
      const r = rows(ex.prompt);
      const [ab, anb] = [Number(r[1][1]), Number(r[1][2])];
      const [nab, nanb] = [Number(r[2][1]), Number(r[2][2])];
      const asked = /Calcule \$([^$]+)\$/.exec(ex.prompt)![1];
      const expected = asked === 'P_{A}(B)' ? ab / (ab + anb) : asked === 'P_{B}(A)' ? ab / (ab + nab) : nab / (nab + nanb);
      expect(num(ex), ex.prompt).toBeCloseTo(expected, 12);
    }
  });

  it('intersection', () => {
    for (const ex of exercises(skill(PROBABILITES_CONDITIONNELLES, '1re-proba-intersection'))) {
      const [a, b] = [after(ex.prompt, 'P(A)'), after(ex.prompt, 'P_{A}(B)')];
      expect(num(ex), ex.prompt).toBeCloseTo(a * (ex.prompt.includes('\\overline{B})$.') ? 1 - b : b), 12);
    }
  });

  it('probabilités totales', () => {
    for (const ex of exercises(skill(PROBABILITES_CONDITIONNELLES, '1re-proba-totales'))) {
      const [a, b, c] = tree(ex.prompt);
      const pB = a * b + (1 - a) * c;
      expect(num(ex), ex.prompt).toBeCloseTo(ex.prompt.includes('Calcule $P(\\overline{B})$') ? 1 - pB : pB, 12);
    }
  });

  it('inversion du conditionnement', () => {
    for (const ex of exercises(skill(PROBABILITES_CONDITIONNELLES, '1re-proba-inversion'))) {
      const [a, b, c] = tree(ex.prompt);
      expect(num(ex), ex.prompt).toBeCloseTo((a * b) / (a * b + (1 - a) * c), 12);
    }
  });

  it('indépendance', () => {
    let both = 0;
    for (const ex of exercises(skill(PROBABILITES_CONDITIONNELLES, '1re-proba-independance'))) {
      if (ex.answer.kind !== 'choice') throw new Error();
      const [a, b] = [after(ex.prompt, 'P(A)'), after(ex.prompt, 'P(B)')];
      const inter = ex.prompt.includes('\\cup') ? a + b - after(ex.prompt, 'P(A \\cup B)') : after(ex.prompt, 'P(A \\cap B)');
      expect(inter > 0 && inter <= Math.min(a, b) && a + b - inter <= 1, ex.prompt).toBe(true);
      const indep = Math.abs(inter - a * b) < 1e-9;
      expect(ex.answer.correct, ex.prompt).toBe(indep ? 0 : 1);
      both += indep ? 1 : 0;
    }
    expect(both > 50 && both < 550).toBe(true);
  });
});

/** Loi lue dans le tableau : valeurs et probabilités (null pour l'inconnue p). */
function law(prompt: string) {
  const r = rows(prompt);
  const xs = r[0].slice(1).map(Number);
  const ps = r[1].slice(1).map((c) => (c === 'p' ? null : decimal(c)));
  return { xs, ps };
}

describe('Variables aléatoires : calculs justes', () => {
  it('loi manquante', () => {
    for (const ex of exercises(skill(VARIABLES_ALEATOIRES, '1re-va-loi-manquante'))) {
      const { xs, ps } = law(ex.prompt);
      expect(new Set(xs).size, ex.prompt).toBe(xs.length);
      const p = num(ex);
      expect(p > 0 && p < 1, ex.prompt).toBe(true);
      expect(ps.reduce((s: number, q) => s + (q ?? p), 0), ex.prompt).toBeCloseTo(1, 12);
    }
  });

  it('probabilité d’un événement', () => {
    for (const ex of exercises(skill(VARIABLES_ALEATOIRES, '1re-va-probabilite'))) {
      const { xs, ps } = law(ex.prompt);
      const [, op, k] = /P\(X (\\geq|\\leq|<|>) (-?\d+)\)\$\./.exec(ex.prompt)!;
      const test = { '\\geq': (x: number) => x >= +k, '\\leq': (x: number) => x <= +k, '<': (x: number) => x < +k, '>': (x: number) => x > +k }[op]!;
      expect(num(ex), ex.prompt).toBeCloseTo(xs.reduce((s, x, i) => s + (test(x) ? ps[i]! : 0), 0), 12);
    }
  });

  it('espérance et variance', () => {
    for (const id of ['1re-va-esperance', '1re-va-variance']) {
      for (const ex of exercises(skill(VARIABLES_ALEATOIRES, id))) {
        const { xs, ps } = law(ex.prompt);
        expect(ps.reduce((s: number, p) => s + p!, 0), ex.prompt).toBeCloseTo(1, 12);
        const e = xs.reduce((s, x, i) => s + x * ps[i]!, 0);
        const v = xs.reduce((s, x, i) => s + ps[i]! * (x - e) ** 2, 0);
        expect(num(ex), ex.prompt).toBeCloseTo(id.endsWith('esperance') ? e : v, 10);
      }
    }
  });

  it('linéarité', () => {
    for (const ex of exercises(skill(VARIABLES_ALEATOIRES, '1re-va-linearite'))) {
      const [e, v] = [after(ex.prompt, 'E(X)'), after(ex.prompt, 'V(X)')];
      const [, coef, sign, b] = /Y = (-?\d*)X ([+-]) (\d+)/.exec(ex.prompt)!;
      const a = coef === '' ? 1 : coef === '-' ? -1 : Number(coef);
      const shift = (sign === '-' ? -1 : 1) * Number(b);
      expect(num(ex), ex.prompt).toBe(ex.prompt.includes('Calcule $V(Y)$') ? a * a * v : a * e + shift);
    }
  });

  it('jeu équitable', () => {
    for (const ex of exercises(skill(VARIABLES_ALEATOIRES, '1re-va-jeu'))) {
      const [, n, r, v, k] = /contient (\d+) boules : (\d+) rouges?, (\d+) vertes et (\d+) noires/.exec(ex.prompt)!.map(Number);
      expect(r + v + k, ex.prompt).toBe(n);
      const [, g1, g2] = /rouge rapporte (\d+) €, une verte (\d+) €/.exec(ex.prompt)!.map(Number);
      const gain = (r * g1 + v * g2) / n;
      const mise = /coûte (\d+) €/.exec(ex.prompt);
      expect(num(ex), ex.prompt).toBeCloseTo(mise ? gain - Number(mise[1]) : gain, 12);
    }
  });
});
