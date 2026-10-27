import { describe, expect, it } from 'vitest';
import { SIXIEME } from '../src/content/sixieme';
import { Rng } from '../src/exercises/rng';
import type { Answer, Exercise, Level } from '../src/exercises/types';
import { variantOf } from '../src/exercises/variantes';

/**
 * Justesse des variantes propres à la 6e (celles reprises des classes suivantes sont vérifiées
 * dans leurs propres fichiers) : chaque réponse est recalculée à partir de l'énoncé.
 */

const skills = SIXIEME.chapters.flatMap((c) => c.skills);

function* draws(id: string, name: string, count = 80): Generator<Exercise> {
  const s = skills.find((x) => x.id === id);
  if (!s) throw new Error(`Compétence absente : ${id}`);
  const gen = variantOf(s, name);
  const from = s.variants!.find((v) => v.name === name)!.from;
  for (const level of [1, 2, 3] as Level[]) if (level >= from) for (let seed = 1; seed <= count; seed++) yield gen(new Rng(seed * 4513 + level), level);
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
const hm = (h: number, m: number) => h * 60 + m;

describe('6e : variantes propres', () => {
  it('angles', () => {
    for (const ex of draws('6e-angles-adjacents', 'droit-partage')) {
      const k = numbers(ex.prompt)[0];
      expect(near(value(ex.answer) * (k + 1), 90)).toBe(true);
    }
    for (const ex of draws('6e-fraction-tour', 'vers-fraction')) expect(near(value(ex.answer) * 360, numbers(ex.prompt)[0])).toBe(true);
    for (const ex of draws('6e-bissectrice', 'angle-entier')) expect(value(ex.answer)).toBe(2 * numbers(ex.prompt)[0]);
  });
  it('division et multiples', () => {
    for (const ex of draws('6e-multiples', 'compter')) {
      const [k, , n] = numbers(ex.prompt);
      expect(value(ex.answer)).toBe(Array.from({ length: n }, (_, i) => i + 1).filter((x) => x % k === 0).length);
    }
    for (const ex of draws('6e-division-decimale', 'partage-argent')) {
      const [n, total] = numbers(ex.prompt);
      expect(near(value(ex.answer) * n, total)).toBe(true);
    }
    for (const ex of draws('6e-quotient-approche', 'bus')) {
      const [n, c] = numbers(ex.prompt);
      const cars = value(ex.answer);
      expect(cars * c >= n && (cars - 1) * c < n).toBe(true);
    }
    for (const ex of draws('6e-probleme-division', 'reste')) {
      const [n, b] = numbers(ex.prompt);
      expect(value(ex.answer)).toBe(n % b);
    }
    for (const ex of draws('6e-nombre-manquant', 'facteur')) {
      const [a, p] = numbers(ex.prompt);
      expect(a * value(ex.answer)).toBe(p);
    }
    for (const ex of draws('6e-parentheses', 'placer')) {
      const target = numbers(ex.prompt)[0];
      const [a, b, c] = numbers(chosen(ex.answer));
      expect((a + b) * c).toBe(target);
    }
  });
  it('données et proportionnalité', () => {
    for (const ex of draws('6e-diagramme-circulaire', 'angle')) {
      const [total, e] = numbers(ex.prompt);
      expect(near(value(ex.answer), (360 * e) / total)).toBe(true);
    }
    for (const ex of draws('6e-tableau-proportionnalite', 'coefficient')) {
      const ns = numbers(ex.prompt.replace(/\{\|c\|c\|c\|c\|\}/, ''));
      const k = value(ex.answer);
      for (let i = 0; i < 3; i++) expect(near(ns[i] * k, ns[i + 3])).toBe(true);
    }
    for (const ex of draws('6e-pourcentage', 'reduction')) {
      const [p, t] = numbers(ex.prompt);
      expect(near(value(ex.answer), p - (p * t) / 100)).toBe(true);
    }
  });
  it('durées', () => {
    for (const ex of draws('6e-convertir-duree', 'secondes')) {
      const [m, s] = pairOf(ex.answer);
      expect(60 * m + s).toBe(numbers(ex.prompt)[0]);
      expect(s < 60).toBe(true);
    }
    for (const ex of draws('6e-calcul-duree', 'nuit')) {
      const [h1, m1, h2, m2] = numbers(ex.prompt);
      const [h, m] = pairOf(ex.answer);
      expect(hm(h1, m1) + hm(h, m) - 24 * 60).toBe(hm(h2, m2));
      expect(m < 60).toBe(true);
    }
    for (const ex of draws('6e-heure-arrivee', 'heure-depart')) {
      const [h1, m1, length] = numbers(ex.prompt);
      const [h, m] = pairOf(ex.answer);
      expect(hm(h, m) + length).toBe(hm(h1, m1));
      expect(m < 60).toBe(true);
    }
    for (const ex of draws('6e-duree-decimale', 'vers-heures-minutes')) {
      const [h, m] = pairOf(ex.answer);
      expect(near(h + m / 60, numbers(ex.prompt)[0])).toBe(true);
    }
    for (const ex of draws('6e-somme-durees', 'difference')) {
      const [h1, m1, h2, m2] = numbers(ex.prompt);
      expect(value(ex.answer)).toBe(hm(h1, m1) - hm(h2, m2));
      expect(value(ex.answer)).toBeGreaterThan(0);
    }
  });
  it('nombres et opérations', () => {
    for (const ex of draws('6e-fraction-decimal', 'vers-fraction')) expect(near(value(ex.answer), numbers(ex.prompt)[0])).toBe(true);
    for (const ex of draws('6e-fraction-et-un', 'plus-grande-que-un')) {
      const [n, d] = numbers(chosen(ex.answer));
      expect(n > d).toBe(true);
      const a = ex.answer;
      if (a.kind === 'choice')
        for (const o of a.options.filter((_, i) => i !== a.correct)) {
          const [p, q] = numbers(o);
          expect(p < q).toBe(true);
        }
    }
    for (const ex of draws('6e-comparer', 'piege-chiffres')) {
      const [a, b] = numbers(ex.prompt);
      expect(numbers(chosen(ex.answer))[0]).toBe(Math.max(a, b));
    }
    for (const ex of draws('6e-arrondir', 'prix')) {
      const v = numbers(ex.prompt)[0];
      expect(near(value(ex.answer), Math.round(Math.round(v * 1000) / 10) / 100)).toBe(true);
    }
    for (const ex of draws('6e-soustraction', 'rendu-monnaie')) {
      const [price, paid] = numbers(ex.prompt);
      expect(near(value(ex.answer) + price, paid)).toBe(true);
      expect(value(ex.answer)).toBeGreaterThan(0);
    }
    for (const ex of draws('6e-multiplication', 'prix-au-kilo')) {
      const [p, m] = numbers(ex.prompt);
      expect(near(value(ex.answer), p * m)).toBe(true);
    }
    for (const ex of draws('6e-ordre-grandeur', 'courses')) {
      const [budget, ...prices] = numbers(ex.prompt);
      const total = prices.reduce((s, x) => s + x, 0);
      expect(chosen(ex.answer)).toBe(total <= budget ? 'Oui' : 'Non');
      expect(Math.abs(total - budget)).toBeGreaterThanOrEqual(4);
    }
  });
  it('grandeurs et mesures', () => {
    for (const ex of draws('6e-milieu', 'longueur-totale')) expect(value(ex.answer)).toBe(2 * numbers(ex.prompt)[0]);
    for (const ex of draws('6e-conversion-longueur', 'situation')) {
      const v = numbers(ex.prompt).at(-1)!;
      const unit = ex.prompt.match(/\$ (km|mm|cm|m)\b/)![1];
      const target = ex.prompt.match(/de (\S+) \?/)![1];
      const inMm: Record<string, number> = { km: 1e6, m: 1e3, cm: 10, mm: 1, kilomètres: 1e6, mètres: 1e3, centimètres: 10, millimètres: 1 };
      expect(near(value(ex.answer), (v * inMm[unit]) / inMm[target])).toBe(true);
    }
    for (const ex of draws('6e-perimetre-polygone', 'regulier')) {
      const n = ex.prompt.includes('pentagone') ? 5 : ex.prompt.includes('hexagone') ? 6 : ex.prompt.includes('octogone') ? 8 : 3;
      expect(near(value(ex.answer), n * numbers(ex.prompt)[0])).toBe(true);
    }
    for (const ex of draws('6e-aire-rectangle', 'cote-depuis-aire')) {
      const [A, l] = numbers(ex.prompt);
      expect(value(ex.answer) * l).toBe(A);
    }
    for (const ex of draws('6e-aire-rectangle', 'carrelage')) {
      const [L, l, c] = numbers(ex.prompt);
      expect(value(ex.answer) * c * c).toBe(L * l * 10000);
      expect(Number.isInteger(value(ex.answer))).toBe(true);
    }
    for (const ex of draws('6e-volume-pave', 'petits-cubes')) {
      const [, L, l, h] = numbers(ex.prompt);
      expect(value(ex.answer)).toBe(L * l * h);
    }
    const sides: Record<string, number> = { triangle: 3, quadrilatère: 4, pentagone: 5, hexagone: 6, heptagone: 7, octogone: 8 };
    for (const ex of draws('6e-elements-solide', 'prisme')) {
      const n = sides[ex.prompt.match(/un (\S+) \?/)![1]];
      const v = value(ex.answer);
      expect(v).toBe(ex.prompt.includes('faces') ? n + 2 : ex.prompt.includes('arêtes') ? 3 * n : 2 * n);
    }
  });
  it('symétrie et figures', () => {
    for (const ex of draws('6e-axes-symetrie', 'lettres')) {
      const l = ex.prompt.match(/« (\w) »/)![1];
      expect(value(ex.answer)).toBe('HIOX'.includes(l) ? 2 : 'FGNZ'.includes(l) ? 0 : 1);
    }
    for (const ex of draws('6e-vocabulaire-quadrilatere', 'nom-polygone')) {
      const n = numbers(ex.prompt)[0];
      expect(chosen(ex.answer)).toBe({ 3: 'Triangle', 4: 'Quadrilatère', 5: 'Pentagone', 6: 'Hexagone', 8: 'Octogone' }[n]);
    }
  });
});
