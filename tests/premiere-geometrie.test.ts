import { describe, expect, it } from 'vitest';
import { GEOMETRIE_REPEREE } from '../src/content/premiere/geometrie-reperee';
import { PRODUIT_SCALAIRE } from '../src/content/premiere/produit-scalaire';
import { Rng } from '../src/exercises/rng';
import type { Exercise, Level, Skill } from '../src/exercises/types';
import { texEval } from './helpers/texEval';

/** Recalcule chaque réponse à partir des nombres lus dans l'énoncé. */

const skill = (chapter: { skills: Skill[] }, id: string) => chapter.skills.find((s) => s.id === id)!;

function* exercises(s: Skill, n = 200): Generator<Exercise> {
  for (const level of [1, 2, 3] as Level[]) for (let seed = 1; seed <= n; seed++) yield s.generate(new Rng(seed * 104729 + level), level);
}

const num = (ex: Exercise) => {
  if (ex.answer.kind !== 'number') throw new Error('réponse numérique attendue');
  return ex.answer.value.n / ex.answer.value.d + 0; // + 0 : pas de -0
};

function onlyCorrect(ex: Exercise, ok: (option: string) => boolean) {
  if (ex.answer.kind !== 'choice') throw new Error('QCM attendu');
  const { correct } = ex.answer;
  ex.answer.options.forEach((opt, i) => expect(ok(opt), `${ex.prompt} → ${opt}`).toBe(i === correct));
}

const ints = (s: string, re: RegExp) => [...s.matchAll(re)].flatMap((m) => m.slice(1).map(Number));
const columns = (s: string) => ints(s, /pmatrix\} (-?\d+) \\\\ (-?\d+) \\end/g);
const points = (s: string) => ints(s, /\((-?\d+)\\,;\\,(-?\d+)\)/g);
const norms = (s: string) => ints(s, /\\\|\\vec\{[uv]\}\\\| = (\d+)/g);
/** Coefficients [a, b, c] de « ax + by + c = 0 ». */
const lineOf = (s: string) => {
  const e = /([^$:]+) = 0/.exec(s)![1];
  const c = texEval(e, 0, 0);
  return [texEval(e, 1, 0) - c, texEval(e, 0, 1) - c, c];
};

describe('Produit scalaire : calculs justes', () => {
  it('coordonnées', () => {
    for (const ex of exercises(skill(PRODUIT_SCALAIRE, '1re-ps-coordonnees'))) {
      const [a, b, c, d] = columns(ex.prompt);
      expect(num(ex), ex.prompt).toBe(a * c + b * d + 0);
    }
  });

  it('normes et angle', () => {
    for (const ex of exercises(skill(PRODUIT_SCALAIRE, '1re-ps-norme-angle'))) {
      const [nu, nv] = norms(ex.prompt);
      if (ex.answer.kind === 'number') {
        const angle = texEval(/mesure \$([^$]+)\$/.exec(ex.prompt)![1]);
        expect(num(ex), ex.prompt).toBeCloseTo(nu * nv * Math.cos(angle), 9);
      } else {
        const dot = texEval(/\\cdot \\vec\{v\} = ([^$]+)\$/.exec(ex.prompt)![1]);
        onlyCorrect(ex, (opt) => Math.abs(nu * nv * Math.cos(texEval(/\$([^$]+)\$/.exec(opt)![1])) - dot) < 1e-9);
      }
    }
  });

  it('orthogonalité', () => {
    for (const ex of exercises(skill(PRODUIT_SCALAIRE, '1re-ps-orthogonal'))) {
      const [a] = ints(ex.prompt, /pmatrix\} m \\\\ (-?\d+)/g);
      const [b, c] = columns(ex.prompt);
      expect(num(ex) * b + a * c, ex.prompt).toBeCloseTo(0, 9);
    }
  });

  it('Al-Kashi', () => {
    for (const ex of exercises(skill(PRODUIT_SCALAIRE, '1re-ps-al-kashi'))) {
      const [c, b] = ints(ex.prompt, /A[BC] = (\d+)/g);
      const angle = texEval(/\\widehat\{BAC\} = ([^$]+)\$/.exec(ex.prompt)![1]);
      expect(num(ex), ex.prompt).toBeCloseTo(b * b + c * c - 2 * b * c * Math.cos(angle), 9);
    }
  });

  it('polarisation', () => {
    for (const ex of exercises(skill(PRODUIT_SCALAIRE, '1re-ps-polarisation'))) {
      const [nu, nv] = norms(ex.prompt);
      const [, op, sq] = /\\vec\{u\} ([+-]) \\vec\{v\}\\\|\^2 = (\d+)/.exec(ex.prompt)!;
      const p = num(ex);
      expect(nu * nu + nv * nv + (op === '+' ? 2 : -2) * p, ex.prompt).toBe(Number(sq));
      expect(Math.abs(p) <= nu * nv, `Cauchy-Schwarz : ${ex.prompt}`).toBe(true);
    }
  });

  it('dans un rectangle', () => {
    for (const ex of exercises(skill(PRODUIT_SCALAIRE, '1re-ps-figure'))) {
      const side = ints(ex.prompt, /(?:côté|AB =|AD =) \$?(\d+)/g);
      const [L, l] = side.length === 1 ? [side[0], side[0]] : side;
      const P: Record<string, [number, number]> = { A: [0, 0], B: [L, 0], C: [L, l], D: [0, l] };
      const [[p1, p2], [q1, q2]] = [...ex.prompt.matchAll(/overrightarrow\{([A-D])([A-D])\}/g)].map((m) => [m[1], m[2]]);
      const u = [P[p2][0] - P[p1][0], P[p2][1] - P[p1][1]];
      const v = [P[q2][0] - P[q1][0], P[q2][1] - P[q1][1]];
      expect(num(ex), ex.prompt).toBe(u[0] * v[0] + u[1] * v[1] + 0);
    }
  });
});

describe('Géométrie repérée : calculs justes', () => {
  it('vecteur normal', () => {
    for (const ex of exercises(skill(GEOMETRIE_REPEREE, '1re-geo-vecteur-normal'))) {
      const [a, b] = lineOf(ex.prompt);
      onlyCorrect(ex, (opt) => {
        const [x, y] = columns(opt);
        return x * b - y * a === 0;
      });
    }
  });

  it('équation avec un vecteur normal', () => {
    for (const ex of exercises(skill(GEOMETRIE_REPEREE, '1re-geo-equation-normale'))) {
      const [x0, y0] = points(ex.prompt);
      const [a, b] = columns(ex.prompt);
      expect(a * x0 + b * y0 + num(ex) + 0, ex.prompt).toBe(0);
    }
  });

  it('perpendiculaire', () => {
    for (const ex of exercises(skill(GEOMETRIE_REPEREE, '1re-geo-perpendiculaire'))) {
      const [a, b] = lineOf(ex.prompt);
      const [x0, y0] = points(ex.prompt);
      onlyCorrect(ex, (opt) => {
        const [p, q, r] = lineOf(opt);
        return p * a + q * b === 0 && p * x0 + q * y0 + r === 0;
      });
    }
  });

  it('centre d’un cercle', () => {
    for (const ex of exercises(skill(GEOMETRIE_REPEREE, '1re-geo-cercle-centre'))) {
      if (ex.answer.kind !== 'pair') throw new Error();
      const [l, r] = /équation \$([^$]+)\$/.exec(ex.prompt)![1].split(' = ');
      const F = (x: number, y: number) => texEval(l, x, y) - texEval(r, x, y);
      // F(x, y) = x² + y² + Dx + Ey + F0 : centre (-D/2 ; -E/2), rayon² = -F(centre).
      const cx = -(F(1, 0) - F(-1, 0)) / 4;
      const cy = -(F(0, 1) - F(0, -1)) / 4;
      expect([cx + 0, cy + 0], ex.prompt).toEqual(ex.answer.values.map((v) => v.n / v.d + 0));
      expect(-F(cx, cy) > 0, ex.prompt).toBe(true);
    }
  });

  it('équation d’un cercle', () => {
    for (const ex of exercises(skill(GEOMETRIE_REPEREE, '1re-geo-cercle-rayon'))) {
      const [x1, y1, x2, y2] = points(ex.prompt);
      const d2 = (x2 - x1) ** 2 + (y2 - y1) ** 2;
      expect(num(ex), ex.prompt).toBe((ex.prompt.includes('diamètre') ? d2 / 4 : d2) + 0);
    }
  });

  it('distance à une droite', () => {
    for (const ex of exercises(skill(GEOMETRIE_REPEREE, '1re-geo-distance-droite'))) {
      const [mx, my] = points(ex.prompt);
      const [a, b, c] = lineOf(ex.prompt);
      expect(num(ex), ex.prompt).toBeCloseTo(Math.abs(a * mx + b * my + c) / Math.hypot(a, b), 9);
    }
  });
});
