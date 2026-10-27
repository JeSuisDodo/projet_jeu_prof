import { describe, expect, it } from 'vitest';
import { CINQUIEME } from '../src/content/cinquieme';
import { Rng } from '../src/exercises/rng';
import type { Answer, Exercise, Level } from '../src/exercises/types';
import { variantOf } from '../src/exercises/variantes';

/**
 * Justesse des variantes propres à la 5e (celles reprises de la 3e et de la 4e sont vérifiées
 * dans leurs propres fichiers) : chaque réponse est recalculée à partir de l'énoncé.
 */

const skills = CINQUIEME.chapters.flatMap((c) => c.skills);

function* draws(id: string, name: string, count = 80): Generator<Exercise> {
  const s = skills.find((x) => x.id === id);
  if (!s) throw new Error(`Compétence absente : ${id}`);
  const gen = variantOf(s, name);
  const from = s.variants!.find((v) => v.name === name)!.from;
  for (const level of [1, 2, 3] as Level[]) if (level >= from) for (let seed = 1; seed <= count; seed++) yield gen(new Rng(seed * 3907 + level), level);
}

const value = (a: Answer) => {
  if (a.kind !== 'number') throw new Error('réponse numérique attendue');
  return a.value.n / a.value.d;
};
const pairOf = (a: Answer) => {
  if (a.kind !== 'pair') throw new Error('couple attendu');
  return a.values.map((f) => f.n / f.d);
};
const chosen = (a: Answer) => {
  if (a.kind !== 'choice') throw new Error('QCM attendu');
  return a.options[a.correct];
};
const numbers = (s: string) => [...s.replace(/(\d)\\,(?=\d{3})/g, '$1').matchAll(/-?\d+(?:\{,\}\d+)?/g)].map((m) => Number(m[0].replace('{,}', '.')));
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a));

describe('5e : variantes propres', () => {
  it('triangles', () => {
    for (const ex of draws('5e-somme-angles', 'double')) {
      const c = numbers(ex.prompt)[0];
      const b = value(ex.answer);
      expect(2 * b + b + c).toBe(180);
    }
    for (const ex of draws('5e-somme-angles', 'vrai-faux')) {
      const m = ex.prompt.match(/angles de \$(\d+)\^\\circ\$, \$(\d+)\^\\circ\$ et \$(\d+)\^\\circ\$/);
      if (m) expect(chosen(ex.answer)).toBe(Number(m[1]) + Number(m[2]) + Number(m[3]) === 180 ? 'Vrai' : 'Faux');
    }
    for (const ex of draws('5e-inegalite-triangulaire', 'aplati')) {
      const [a, b, c] = numbers(ex.prompt);
      const expected = c < a + b ? 0 : c === a + b ? 1 : 2;
      expect(ex.answer.kind === 'choice' && ex.answer.correct).toBe(expected);
      expect(c > Math.abs(a - b) || c >= a + b).toBe(true);
    }
    for (const ex of draws('5e-nature-triangle', 'cotes')) {
      const sides = numbers(ex.prompt);
      const distinct = new Set(sides).size;
      expect(chosen(ex.answer)).toBe(distinct === 1 ? 'Équilatéral' : distinct === 2 ? 'Isocèle (non équilatéral)' : 'Quelconque');
      const [x, y, z] = [...sides].sort((p, q) => p - q);
      expect(z < x + y).toBe(true);
    }
    for (const ex of draws('5e-longueur-possible', 'plus-grand-entier')) {
      const [a, b] = numbers(ex.prompt);
      expect(value(ex.answer)).toBe(a + b - 1);
    }
  });
  it('nombres relatifs et repérage', () => {
    for (const ex of draws('5e-relatifs-comparer', 'entiers-entre')) {
      const [a, b] = numbers(ex.prompt);
      expect(value(ex.answer)).toBe(Array.from({ length: b - a - 1 }, (_, i) => a + 1 + i).length);
    }
    for (const ex of draws('5e-relatifs-addition', 'terme-manquant')) {
      const [a, s] = numbers(ex.prompt);
      expect(a + value(ex.answer)).toBe(s);
    }
    for (const ex of draws('5e-relatifs-soustraction', 'ecart-altitudes')) {
      const [low, high] = numbers(ex.prompt);
      expect(value(ex.answer)).toBe(high - low);
    }
    for (const ex of draws('5e-relatifs-somme', 'compte')) {
      const start = numbers(ex.prompt)[0];
      const ops = [...ex.prompt.matchAll(/(dépôt|retrait) de \$(\d+)\$/g)].map((m) => (m[1] === 'dépôt' ? 1 : -1) * Number(m[2]));
      expect(value(ex.answer)).toBe(ops.reduce((s, x) => s + x, start));
    }
    for (const ex of draws('5e-reperage', 'milieu')) {
      const [xa, ya, xb, yb] = numbers(ex.prompt);
      expect(pairOf(ex.answer)).toEqual([(xa + xb) / 2, (ya + yb) / 2]);
    }
    for (const ex of draws('5e-reperage', 'distance-horizontale')) {
      const [, xa, y1, xb, y2] = numbers(ex.prompt);
      expect(y1).toBe(y2);
      expect(value(ex.answer)).toBe(xb - xa);
    }
  });
  it('fractions et quotients', () => {
    for (const ex of draws('5e-fraction-egale', 'vrai-faux')) {
      const f = [...ex.prompt.matchAll(/\\frac\{(\d+)\}\{(\d+)\}/g)].map((m) => Number(m[1]) / Number(m[2]));
      expect(chosen(ex.answer)).toBe(near(f[0], f[1]) ? 'Vrai' : 'Faux');
    }
    for (const ex of draws('5e-fraction-simplifier', 'simplifiable')) {
      const [n, d] = numbers(ex.prompt);
      expect(chosen(ex.answer)).toBe(gcd(n, d) > 1 ? 'Oui' : 'Non');
    }
    for (const ex of draws('5e-quotient', 'partage')) {
      const [p, n] = numbers(ex.prompt);
      expect(near(value(ex.answer), p / n)).toBe(true);
    }
  });
  it('calcul littéral', () => {
    for (const ex of draws('5e-substituer', 'formule')) {
      const nums = numbers(ex.prompt);
      const [L, l] = nums.slice(-2);
      expect(value(ex.answer)).toBe(ex.prompt.includes('périmètre') ? 2 * (L + l) : L * l);
    }
    for (const ex of draws('5e-developper', 'aire-decoupee')) {
      const [k, a] = numbers(ex.prompt);
      const [p, q] = pairOf(ex.answer);
      for (const x of [0, 1, 7]) expect(k * (x + a)).toBe(p * x + q);
    }
    for (const ex of draws('5e-factoriser', 'nombre-manquant')) {
      const [k, kb, k2] = numbers(ex.prompt);
      expect(k).toBe(k2);
      for (const x of [0, 2, 5]) expect(k * x + kb).toBe(k * (x + value(ex.answer)));
    }
  });
  it('angles', () => {
    for (const ex of draws('5e-complementaire-supplementaire', 'egaux')) expect(2 * value(ex.answer)).toBe(ex.prompt.includes('supplémentaires') ? 180 : 90);
    for (const ex of draws('5e-complementaire-supplementaire', 'multiple')) {
      const k = numbers(ex.prompt)[0];
      const x = value(ex.answer);
      expect(near(x + k * x, ex.prompt.includes('supplémentaire') ? 180 : 90)).toBe(true);
    }
  });
  it('aires, périmètres, volumes', () => {
    for (const ex of draws('5e-aire-triangle', 'hauteur')) {
      const [A, b] = numbers(ex.prompt);
      expect(near((b * value(ex.answer)) / 2, A)).toBe(true);
    }
    for (const ex of draws('5e-aire-parallelogramme', 'base')) {
      const [A, h] = numbers(ex.prompt);
      expect(value(ex.answer) * h).toBe(A);
    }
    for (const ex of draws('5e-perimetre-cercle', 'rayon')) expect(2 * value(ex.answer)).toBe(numbers(ex.prompt)[0]);
    for (const ex of draws('5e-perimetre-cercle', 'tours-de-roue')) {
      const [d, n] = numbers(ex.prompt);
      expect(near(value(ex.answer), (n * d * 3.14) / 100)).toBe(true);
    }
    for (const ex of draws('5e-aire-disque', 'demi-disque')) expect(value(ex.answer)).toBe(numbers(ex.prompt)[0] ** 2 / 2);
    for (const ex of draws('5e-conversion-aires', 'hectares')) {
      const v = numbers(ex.prompt)[0];
      expect(near(value(ex.answer), ex.prompt.includes('en m²') ? v * 10000 : v / 10000)).toBe(true);
    }
    for (const ex of draws('5e-aire-composee', 'cadre')) {
      const [L, l, e] = numbers(ex.prompt);
      expect(value(ex.answer)).toBe(L * l - (L - 2 * e) * (l - 2 * e));
      expect(l - 2 * e).toBeGreaterThan(0);
    }
    for (const ex of draws('5e-volume-pave', 'arete-cube')) expect(value(ex.answer) ** 3).toBe(numbers(ex.prompt)[0]);
    for (const ex of draws('5e-volume-pave', 'hauteur')) {
      const [V, L, l] = numbers(ex.prompt);
      expect(L * l * value(ex.answer)).toBe(V);
    }
    for (const ex of draws('5e-volume-prisme', 'hauteur')) {
      const [V, B] = numbers(ex.prompt);
      expect(B * value(ex.answer)).toBe(V);
    }
    for (const ex of draws('5e-volume-cylindre', 'en-pi')) {
      const [r, h] = numbers(ex.prompt);
      expect(value(ex.answer)).toBe(r * r * h);
    }
  });
  it('division, priorités, calcul astucieux', () => {
    for (const ex of draws('5e-division-euclidienne', 'dividende')) {
      const [b, q, r] = numbers(ex.prompt);
      expect(value(ex.answer)).toBe(b * q + r);
      expect(r < b).toBe(true);
    }
    const days = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
    for (const ex of draws('5e-division-euclidienne', 'calendrier')) {
      const d0 = days.findIndex((d) => ex.prompt.includes(`sommes ${d}.`));
      const n = numbers(ex.prompt)[0];
      expect(chosen(ex.answer)).toBe(days[(d0 + n) % 7]);
    }
    for (const ex of draws('5e-priorites', 'erreur-classique')) {
      const [a, b, c] = numbers(ex.prompt);
      expect(value(ex.answer)).toBe(a + b * c);
    }
    for (const ex of draws('5e-trait-fraction', 'moyenne-deux')) {
      const [a, b] = numbers(ex.prompt);
      expect(value(ex.answer)).toBe((a + b) / 2);
    }
    for (const name of ['regrouper', 'presque-cent'])
      for (const ex of draws('5e-calcul-astucieux', name)) {
        const ns = numbers(ex.prompt);
        expect(value(ex.answer)).toBe(ns.reduce((p, x) => p * x, 1));
      }
  });
  it('symétrie et parallélogrammes', () => {
    const yes = ['H', 'I', 'N', 'O', 'S', 'X', 'Z'];
    for (const ex of draws('5e-centre-symetrie', 'lettres')) {
      const letter = ex.prompt.match(/« (\w) »/)![1];
      expect(chosen(ex.answer)).toBe(yes.includes(letter) ? 'Oui' : 'Non');
    }
    for (const ex of draws('5e-parallelogramme-cotes', 'losange')) expect(value(ex.answer) * 4).toBe(numbers(ex.prompt)[0]);
    for (const ex of draws('5e-parallelogramme-angles', 'somme')) expect(value(ex.answer)).toBe(360);
  });
});
