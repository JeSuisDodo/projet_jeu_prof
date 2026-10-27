import { describe, expect, it } from 'vitest';
import { QUATRIEME } from '../src/content/quatrieme';
import { Rng } from '../src/exercises/rng';
import type { Answer, Exercise, Level } from '../src/exercises/types';
import { variantOf } from '../src/exercises/variantes';

/**
 * Justesse des variantes propres à la 4e (celles reprises de la 3e sont vérifiées dans
 * tests/troisieme-variantes.test.ts) : chaque réponse est recalculée à partir de l'énoncé.
 */

const skills = QUATRIEME.chapters.flatMap((c) => c.skills);

function* draws(id: string, name: string, count = 80): Generator<Exercise> {
  const s = skills.find((x) => x.id === id);
  if (!s) throw new Error(`Compétence absente : ${id}`);
  const gen = variantOf(s, name);
  const from = s.variants!.find((v) => v.name === name)!.from;
  for (const level of [1, 2, 3] as Level[]) if (level >= from) for (let seed = 1; seed <= count; seed++) yield gen(new Rng(seed * 4241 + level), level);
}

const value = (a: Answer) => {
  if (a.kind !== 'number') throw new Error('réponse numérique attendue');
  return a.value.n / a.value.d;
};
const pairOf = (a: Answer) => {
  if (a.kind !== 'pair') throw new Error('couple attendu');
  return a.values.map((f) => f.n / f.d);
};
const setOf = (a: Answer) => {
  if (a.kind !== 'set') throw new Error('ensemble attendu');
  return a.values.map((f) => f.n / f.d).sort((x, y) => x - y);
};
const chosen = (a: Answer) => {
  if (a.kind !== 'choice') throw new Error('QCM attendu');
  return a.options[a.correct];
};
const numbers = (s: string) => [...s.matchAll(/-?\d+(?:\{,\}\d+)?/g)].map((m) => Number(m[0].replace('{,}', '.')));
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
/** Valeur d'une fraction LaTeX « \frac{3}{4} » ou « -\frac{3}{4} ». */
const fracVal = (t: string) => {
  const m = t.match(/(-?)\\frac\{(\d+)\}\{(\d+)\}/)!;
  return (m[1] ? -1 : 1) * (Number(m[2]) / Number(m[3]));
};
const fracs = (t: string) => [...t.matchAll(/(-?)\\frac\{(\d+)\}\{(\d+)\}/g)].map((m) => (m[1] ? -1 : 1) * (Number(m[2]) / Number(m[3])));

describe('4e : variantes propres', () => {
  it('diviseurs', () => {
    for (const ex of draws('4e-liste-diviseurs', 'compter')) {
      const n = numbers(ex.prompt)[0];
      expect(value(ex.answer)).toBe(Array.from({ length: n }, (_, i) => i + 1).filter((d) => n % d === 0).length);
    }
    for (const ex of draws('4e-liste-diviseurs', 'communs')) {
      const [a, b] = numbers(ex.prompt);
      expect(setOf(ex.answer)).toEqual(Array.from({ length: a }, (_, i) => i + 1).filter((d) => a % d === 0 && b % d === 0));
    }
  });
  it('calcul littéral', () => {
    for (const ex of draws('4e-reduire', 'perimetre')) {
      const [L, l] = [...ex.prompt.matchAll(/\$([^$]+)\$/g)].map((m) => m[1]);
      const f = (t: string, x: number) => new Function('x', `return ${t.replace(/(\d)x/g, '$1*x')}`)(x) as number;
      const [p, q] = pairOf(ex.answer);
      for (const x of [1, 2, 5]) expect(near(2 * (f(L, x) + f(l, x)), p * x + q)).toBe(true);
    }
    for (const ex of draws('4e-reduire', 'vrai-faux')) {
      const [lhs, rhs] = ex.prompt.match(/\$(.+)\$/)![1].split(' = ');
      const js = (t: string) => t.replace(/\\times/g, '*').replace(/(\d)x/g, '$1*x').replace(/x\^2/g, '(x**2)');
      const ok = [1, 2, 3].every((x) => near(new Function('x', `return ${js(lhs)}`)(x), new Function('x', `return ${js(rhs)}`)(x)));
      expect(chosen(ex.answer)).toBe(ok ? 'Vrai' : 'Faux');
    }
    for (const ex of draws('4e-substituer', 'deux-lettres')) {
      const [p, q, a, b] = numbers(ex.prompt);
      const sign = ex.prompt.includes('a +') ? 1 : -1;
      expect(value(ex.answer)).toBe(p * a + sign * Math.abs(q) * b);
    }
  });
  it('équations : tester une valeur', () => {
    const lin = (t: string, x: number) => new Function('x', `return ${t.replace(/(\d)x/g, '$1*x').replace(/(^|[^\d*])x/g, '$1(x)')}`)(x) as number;
    for (const ex of draws('4e-tester-valeur', 'deux-membres')) {
      const x = numbers(ex.prompt)[0];
      const [l, r] = ex.prompt.match(/équation \$(.+)\$/)![1].split(' = ');
      expect(chosen(ex.answer)).toBe(near(lin(l, x), lin(r, x)) ? 'Oui' : 'Non');
    }
    for (const ex of draws('4e-tester-valeur', 'quel-nombre')) {
      const [l, r] = ex.prompt.match(/de \$(.+)\$/)![1].split(' = ');
      expect(near(lin(l, numbers(chosen(ex.answer))[0]), Number(r))).toBe(true);
    }
  });
  it('espace', () => {
    for (const ex of draws('4e-volume-pyramide', 'hauteur')) {
      const [c, V] = numbers(ex.prompt);
      expect(near((c * c * value(ex.answer)) / 3, V)).toBe(true);
    }
    for (const ex of draws('4e-volume-pyramide', 'dans-le-pave')) {
      const [L, l, h] = numbers(ex.prompt);
      expect(near(value(ex.answer), (L * l * h) / 3)).toBe(true);
    }
    for (const ex of draws('4e-volume-cone', 'cornet')) {
      const [r, h] = numbers(ex.prompt);
      expect(value(ex.answer)).toBe(Math.round((Math.PI * r * r * h) / 3));
    }
    for (const ex of draws('4e-volume-cone', 'rapport-cylindre')) expect(value(ex.answer) * 3).toBe(numbers(ex.prompt)[0]);
    for (const ex of draws('4e-decrire-pyramide', 'retrouver-base')) {
      const k = numbers(ex.prompt)[0];
      const n = value(ex.answer);
      expect(ex.prompt.includes('arêtes') ? 2 * n : n + 1).toBe(k);
    }
  });
  it('fractions', () => {
    for (const ex of draws('4e-somme-fractions', 'reste-du-gateau')) {
      const [a, b] = fracs(ex.prompt);
      expect(near(value(ex.answer), 1 - a - b)).toBe(true);
    }
    for (const ex of draws('4e-somme-fractions', 'entier-plus-fraction')) {
      const e = numbers(ex.prompt)[0];
      expect(near(value(ex.answer), e + fracVal(ex.prompt))).toBe(true);
    }
    const WORDS: Record<string, number> = { 'la moitié': 1 / 2, 'le tiers': 1 / 3, 'le quart': 1 / 4, 'les trois quarts': 3 / 4, 'les deux cinquièmes': 2 / 5 };
    for (const ex of draws('4e-produit-fractions', 'fraction-de-fraction')) {
      const w = Object.keys(WORDS).find((k) => ex.prompt.includes(`, et ${k} `))!;
      expect(near(value(ex.answer), WORDS[w] * fracVal(ex.prompt))).toBe(true);
    }
    for (const ex of draws('4e-quotient-fractions', 'combien-de-fois')) {
      const f = fracVal(ex.prompt);
      const k = numbers(ex.prompt.split('exactement')[1])[0];
      expect(near(value(ex.answer) * f, k)).toBe(true);
    }
    for (const ex of draws('4e-quotient-fractions', 'inverse')) expect(near(value(ex.answer) * fracVal(ex.prompt), 1)).toBe(true);
    for (const ex of draws('4e-fraction-de', 'retrouver-total')) {
      const part = numbers(ex.prompt.split('soit')[1])[0];
      expect(near(value(ex.answer) * fracVal(ex.prompt), part)).toBe(true);
    }
    for (const ex of draws('4e-comparer-fractions', 'la-plus-grande')) {
      const opts = ex.answer.kind === 'choice' ? ex.answer.options.filter((o) => o.includes('frac')).map(fracVal) : [];
      expect(fracVal(chosen(ex.answer))).toBe(Math.max(...opts));
    }
  });
  it('probabilités', () => {
    for (const ex of draws('4e-proba-cartes', 'ou')) {
      const deck = numbers(ex.prompt)[0];
      expect(near(value(ex.answer), (4 + deck / 4 - 1) / deck)).toBe(true);
    }
    for (const ex of draws('4e-proba-cartes', 'carte-retiree')) {
      const k = numbers(ex.prompt)[1];
      expect(near(value(ex.answer), (4 - k) / (32 - k))).toBe(true);
    }
  });
  it('proportionnalité et échelles', () => {
    for (const ex of draws('4e-echelle', 'distance-sur-carte')) {
      const [, e, km] = numbers(ex.prompt);
      expect(near(value(ex.answer) * e, km * 100000)).toBe(true);
    }
  });
  it('puissances', () => {
    for (const ex of draws('4e-regles-puissances-10', 'produit-quotient')) {
      const e = [...ex.prompt.matchAll(/10\^\{(-?\d+)\}/g)].map((m) => Number(m[1]));
      expect(value(ex.answer)).toBe(e[0] + e[1] - e[2]);
    }
    for (const ex of draws('4e-exposant-negatif', 'vrai-faux')) {
      const tex = ex.prompt.match(/\$(.+?)\$/)![1];
      const m = tex.match(/^(\d+)\^\{-(\d+)\}( = (.+))?$/);
      if (!m || !m[4]) continue;
      const v = Number(m[1]) ** -Number(m[2]);
      const rhs = m[4];
      const r = rhs.includes('frac') ? fracVal(rhs) : Number(rhs.replace('{,}', '.'));
      expect(chosen(ex.answer)).toBe(near(v, r) ? 'Vrai' : 'Faux');
    }
    for (const ex of draws('4e-prefixes', 'stockage')) expect(value(ex.answer)).toBe(numbers(ex.prompt)[0] * 1000);
    for (const ex of draws('4e-comparer-ecritures', 'le-plus-grand')) {
      const val = (o: string) => {
        const [a, , n] = numbers(o);
        return a * 10 ** n;
      };
      const opts = ex.answer.kind === 'choice' ? ex.answer.options.filter((o) => o.includes('times')).map(val) : [];
      expect(val(chosen(ex.answer))).toBe(Math.max(...opts));
    }
  });
  it('nombres relatifs', () => {
    for (const ex of draws('4e-produit-relatifs', 'facteur-manquant')) {
      const [a, p] = numbers(ex.prompt);
      expect(a * value(ex.answer)).toBe(p);
    }
    for (const ex of draws('4e-produit-relatifs', 'avec-zero')) expect(numbers(ex.prompt).includes(0) && value(ex.answer) === 0).toBe(true);
    for (const ex of draws('4e-quotient-relatifs', 'dividende-manquant')) {
      const [b, q] = numbers(ex.prompt);
      expect(value(ex.answer) / b).toBe(q);
    }
    for (const ex of draws('4e-signe-produit', 'nombre-negatifs')) expect(chosen(ex.answer)).toBe(numbers(ex.prompt)[1] % 2 === 0 ? 'Positif' : 'Négatif');
    for (const ex of draws('4e-priorites-relatifs', 'temperatures')) {
      const [t0, up, down] = numbers(ex.prompt);
      expect(value(ex.answer)).toBe(t0 + up - down);
    }
    for (const ex of draws('4e-priorites-relatifs', 'moins-devant-parenthese')) {
      const expr = ex.prompt.match(/\$(.+)\$/)![1].replace(/\\times/g, '*');
      expect(value(ex.answer)).toBe(new Function(`return ${expr}`)());
    }
  });
  it('géométrie plane et transformations', () => {
    for (const ex of draws('4e-coefficient-semblables', 'perimetre')) {
      const [a, b, c] = numbers(ex.prompt);
      const k = ex.prompt.includes('deux fois plus petits') ? 0.5 : numbers(ex.prompt.split('semblable')[1])[0];
      expect(near(value(ex.answer), (a + b + c) * k)).toBe(true);
    }
    for (const ex of draws('4e-symetrie-centrale', 'trouver-centre')) {
      const [qx, qy, px, py] = numbers(ex.prompt);
      const [ox, oy] = pairOf(ex.answer);
      expect([2 * ox - px, 2 * oy - py]).toEqual([qx, qy]);
    }
    for (const ex of draws('4e-rotation', 'polygone-regulier')) {
      const n: Record<string, number> = { triangle: 3, carré: 4, pentagone: 5, hexagone: 6, octogone: 8, décagone: 10, dodécagone: 12 };
      const k = Object.keys(n).find((w) => ex.prompt.includes(`d’un ${w}`))!;
      expect(near(value(ex.answer) * n[k], 360)).toBe(true);
    }
  });
});
