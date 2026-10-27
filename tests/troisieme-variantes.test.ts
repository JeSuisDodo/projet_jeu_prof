import { describe, expect, it } from 'vitest';
import { TROISIEME } from '../src/content/troisieme';
import { Rng } from '../src/exercises/rng';
import type { Answer, Exercise, Level } from '../src/exercises/types';
import { variantOf } from '../src/exercises/variantes';
import { texEval } from './helpers/texEval';

/** Justesse des variantes d'exercices de 3e : chaque réponse est recalculée à partir de l'énoncé. */

const skills = TROISIEME.chapters.flatMap((c) => c.skills);

function* draws(id: string, name: string, count = 80): Generator<Exercise> {
  const s = skills.find((x) => x.id === id);
  if (!s) throw new Error(`Compétence absente : ${id}`);
  const gen = variantOf(s, name);
  const from = s.variants!.find((v) => v.name === name)!.from;
  for (const level of [1, 2, 3] as Level[]) if (level >= from) for (let seed = 1; seed <= count; seed++) yield gen(new Rng(seed * 7727 + level), level);
}

const value = (a: Answer) => {
  if (a.kind !== 'number') throw new Error(`réponse numérique attendue, pas ${a.kind}`);
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
/** Nombres d'un texte (LaTeX ou non) : « 2{,}5 » → 2.5, espaces fines ignorées. */
const numbers = (s: string) => [...s.replace(/(\d)\\,(?=\d{3})/g, '$1').matchAll(/-?\d+(?:\{,\}\d+)?/g)].map((m) => Number(m[0].replace('{,}', '.')));
const near = (a: number, b: number, eps = 1e-6) => Math.abs(a - b) < eps;
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a));
const isPrime = (n: number) => n > 1 && Array.from({ length: Math.floor(Math.sqrt(n)) - 1 }, (_, i) => i + 2).every((d) => n % d);

describe('3e : variantes, arithmétique et puissances', () => {
  it('chiffre manquant : chaque chiffre proposé convient, et eux seuls', () => {
    for (const ex of draws('3e-divisibilite', 'chiffre-manquant')) {
      const shown = ex.prompt.match(/\$([\d\\star]+)\$ pour/)![1];
      const d = numbers(ex.prompt.split('divisible par')[1])[0];
      const good = Array.from({ length: 10 }, (_, c) => c).filter((c) => Number(shown.replace('\\star', String(c))) % d === 0);
      expect(setOf(ex.answer)).toEqual(good);
    }
  });
  it('diviseurs parmi 2, 3, 4, 5, 9', () => {
    for (const ex of draws('3e-divisibilite', 'diviseurs-communs')) {
      const n = numbers(ex.prompt)[5];
      expect(setOf(ex.answer)).toEqual([2, 3, 4, 5, 9].filter((d) => n % d === 0));
    }
  });
  it('nombres premiers : comptage, plus petit diviseur, piège', () => {
    for (const ex of draws('3e-premier', 'compter')) {
      const [a, b] = numbers(ex.prompt);
      let c = 0;
      for (let k = a; k <= b; k++) if (isPrime(k)) c++;
      expect(value(ex.answer)).toBe(c);
    }
    for (const ex of draws('3e-premier', 'plus-petit-diviseur')) {
      const n = numbers(ex.prompt)[0];
      const p = value(ex.answer);
      expect(n % p).toBe(0);
      expect(isPrime(p)).toBe(true);
      for (let q = 2; q < p; q++) expect(n % q).not.toBe(0);
    }
    for (const ex of draws('3e-premier', 'piege-impair')) expect(isPrime(numbers(ex.prompt)[0])).toBe(false);
  });
  it('décomposition : recomposer, compter les diviseurs, carré parfait', () => {
    for (const ex of draws('3e-decomposition', 'recomposer')) {
      const tex = ex.prompt.match(/\$([^$]+)\$ \?/)![1];
      const v = tex.split(' \\times ').reduce((acc, f) => {
        const [p, e] = f.replace(/[{}]/g, '').split('^').map(Number);
        return acc * p ** (e ?? 1);
      }, 1);
      expect(value(ex.answer)).toBe(v);
    }
    for (const ex of draws('3e-decomposition', 'nombre-diviseurs')) {
      const n = numbers(ex.prompt)[0];
      expect(value(ex.answer)).toBe(Array.from({ length: n }, (_, i) => i + 1).filter((d) => n % d === 0).length);
    }
    for (const ex of draws('3e-decomposition', 'carre-parfait')) {
      const n = numbers(ex.prompt)[0];
      let k = 1;
      while (!Number.isInteger(Math.sqrt(n * k))) k++;
      expect(value(ex.answer)).toBe(k);
    }
  });
  it('fractions irréductibles et plus grand diviseur commun', () => {
    for (const ex of draws('3e-irreductible', 'est-irreductible')) {
      const [n, d] = numbers(ex.prompt);
      expect(chosen(ex.answer)).toBe(gcd(n, d) === 1 ? 'Oui' : 'Non');
    }
    for (const name of ['pgcd', 'euclide']) for (const ex of draws('3e-irreductible', name)) {
      const [a, b] = numbers(ex.prompt);
      expect(value(ex.answer)).toBe(gcd(a, b));
    }
  });
  it('partages et multiples communs', () => {
    for (const ex of draws('3e-partage', 'carrelage')) {
      const [a, b] = numbers(ex.prompt);
      expect(value(ex.answer)).toBe(gcd(a, b));
    }
    for (const ex of draws('3e-partage', 'contenu-lot')) {
      const [a, b] = numbers(ex.prompt);
      expect(value(ex.answer)).toBe(a / gcd(a, b));
    }
    const lcm = (a: number, b: number) => (a * b) / gcd(a, b);
    for (const ex of draws('3e-multiples-communs', 'engrenage')) {
      const [a, b] = numbers(ex.prompt);
      expect(value(ex.answer)).toBe(lcm(a, b) / a);
    }
    for (const ex of draws('3e-multiples-communs', 'piles')) {
      const [a, b] = numbers(ex.prompt);
      expect(value(ex.answer)).toBe(lcm(a, b));
    }
  });
  it('puissances : puissances de 10, signes, règles', () => {
    for (const ex of draws('3e-puissance-calcul', 'puissance-de-dix')) {
      const written = ex.prompt.match(/\$([\d{},\\]+) = 10/)![1].replace(/\\,/g, '').replace('{,}', '.');
      expect(near(Number(written), 10 ** value(ex.answer), 1e-12)).toBe(true);
    }
    for (const ex of draws('3e-puissance-calcul', 'signe')) {
      const m = ex.prompt.match(/\$(\(-(\d+)\)|-(\d+))\^\{(\d+)\}\$/)!;
      const v = m[2] ? (-Number(m[2])) ** Number(m[4]) : -(Number(m[3]) ** Number(m[4]));
      expect(value(ex.answer)).toBe(v);
    }
    for (const ex of draws('3e-puissance-calcul', 'comparer')) {
      const opts = ex.answer.kind === 'choice' ? ex.answer.options : [];
      const val = (o: string) => {
        const [a, n] = numbers(o);
        return a ** n;
      };
      expect(val(chosen(ex.answer))).toBe(Math.max(...opts.map(val)));
    }
    for (const ex of draws('3e-regles-puissances', 'erreur-classique')) {
      const nb = numbers(ex.prompt);
      const [a, m, n] = ex.prompt.includes('(') ? nb : [nb[0], nb[1], nb[3]];
      const [b, e] = numbers(chosen(ex.answer));
      const expected = ex.prompt.includes('(') ? a ** (m * n) : a ** (m + n);
      expect(b ** e).toBe(expected);
    }
    for (const ex of draws('3e-regles-puissances', 'lettre')) {
      const [p, q, r] = numbers(ex.prompt.split('\\frac')[1]);
      expect(value(ex.answer)).toBe(p + q - r);
    }
  });
  it('notation scientifique d’un produit', () => {
    for (const ex of draws('3e-notation-scientifique', 'produit')) {
      const [a, m, b, n] = numbers(ex.prompt.split('de $(')[1]).filter((x) => x !== 10);
      const [mant, p] = pairOf(ex.answer);
      expect(mant >= 1 && mant < 10).toBe(true);
      expect(near(mant * 10 ** p, a * 10 ** m * b * 10 ** n, 1e-9 * a * b * 10 ** (m + n))).toBe(true);
    }
    for (const ex of draws('3e-notation-scientifique', 'grandeur-reelle')) {
      const written = ex.prompt.match(/\$([\d{},\\]+)\$/)![1].replace(/\\,/g, '').replace('{,}', '.');
      const [mant, p] = pairOf(ex.answer);
      expect(mant >= 1 && mant < 10).toBe(true);
      expect(near(mant * 10 ** p, Number(written), Number(written) * 1e-9)).toBe(true);
    }
  });
  it('racines carrées', () => {
    for (const ex of draws('3e-racine-carree', 'simplifier')) {
      const n = numbers(ex.prompt)[0];
      const [a, b] = pairOf(ex.answer);
      expect(a * a * b).toBe(n);
      for (let k = 2; k * k <= b; k++) expect(b % (k * k)).not.toBe(0);
    }
    for (const ex of draws('3e-racine-carree', 'somme-radicaux')) {
      const expr = ex.prompt.match(/\$(.+) = a\\sqrt\{(\d+)\}\$/)!;
      const v = new Function(`return ${expr[1].replace(/(\d*)\\sqrt\{(\d+)\}/g, (_, c, r) => `${c || 1}*Math.sqrt(${r})`)}`)() as number;
      expect(near(v, value(ex.answer) * Math.sqrt(Number(expr[2])))).toBe(true);
    }
    for (const ex of draws('3e-racine-carree', 'produit-racines')) {
      const [x, y] = numbers(ex.prompt);
      expect(near(Math.sqrt(x * y), value(ex.answer))).toBe(true);
    }
    for (const ex of draws('3e-racine-carree', 'vrai-faux')) {
      const tex = ex.prompt.match(/\$(.+)\$/)![1];
      const [lhs, rhs] = tex.split(' = ');
      const js = (t: string) => t.replace(/\\frac\{(\d+)\}\{(\d+)\}/g, '($1/$2)').replace(/\\sqrt\{([^}]+)\}/g, 'Math.sqrt($1)').replace(/\\times/g, '*').replace(/\(\\sqrt\{(\d+)\}\)\^2/g, 'Math.sqrt($1)**2').replace(/\^2/g, '**2');
      const ok = near(new Function(`return ${js(lhs)}`)() as number, new Function(`return ${js(rhs)}`)() as number);
      expect(chosen(ex.answer)).toBe(ok ? 'Vrai' : 'Faux');
    }
  });
  it('puissances et priorités', () => {
    for (const ex of draws('3e-puissances-priorites', 'moins-un')) {
      const expr = ex.prompt.match(/\$(.+)\$/)![1];
      const v = new Function(`return ${expr.replace(/\(-1\)\^\{(\d+)\}/g, '((-1)**$1)')}`)() as number;
      expect(value(ex.answer)).toBe(v);
    }
    for (const ex of draws('3e-puissances-priorites', 'quotient-puissances')) {
      const e = [...ex.prompt.matchAll(/\^\{(\d+)\}/g)].map((m) => Number(m[1]));
      expect(value(ex.answer)).toBe((2 ** e[0] * 3 ** e[1]) / (2 ** e[2] * 3 ** e[3]));
    }
    for (const ex of draws('3e-puissances-priorites', 'fraction-puissance')) {
      const [a, b, n, c] = numbers(ex.prompt.replace(/\\left|\\right/g, ''));
      const sign = ex.prompt.includes('} -') ? -1 : 1;
      expect(near(value(ex.answer), (a / b) ** n + sign * Math.abs(c))).toBe(true);
    }
  });
});

/** Évalue une expression écrite en LaTeX (« 3x^2 - 2x + 1 ») en x. */
const evalPoly = (tex: string, x: number) => texEval(tex, x);

describe('3e : variantes, calcul littéral et équations', () => {
  it('développements : valeurs vérifiées en plusieurs points', () => {
    for (const ex of draws('3e-developper-simple', 'deux-produits')) {
      const expr = ex.prompt.match(/réduis \$(.+)\$\. On/)![1];
      const [a, b] = pairOf(ex.answer);
      for (const x of [0, 1, 2]) expect(near(evalPoly(expr, x), a * x + b)).toBe(true);
    }
    for (const ex of draws('3e-developper-simple', 'erreur-signe')) {
      const [k, b] = numbers(ex.prompt);
      const res = ex.prompt.match(/= (.+)\$\. Est/)![1];
      const ok = [0, 1, 3].every((x) => near(evalPoly(res, x), k * (x - b)));
      expect(chosen(ex.answer)).toBe(ok ? 'Oui' : 'Non');
    }
    for (const ex of draws('3e-developper-double', 'coefficient')) {
      const expr = ex.prompt.match(/réduit \$(.+)\$\. Quel/)![1];
      // Coefficient de x = (P(1) - P(-1)) / 2.
      expect(near(value(ex.answer), (evalPoly(expr, 1) - evalPoly(expr, -1)) / 2)).toBe(true);
    }
    for (const ex of draws('3e-developper-double', 'aire-rectangle')) {
      const [a, b] = numbers(ex.prompt);
      const [p, q] = pairOf(ex.answer);
      for (const x of [0, 1, 5]) expect((x + a) * (x + b)).toBe(x * x + p * x + q);
    }
    for (const ex of draws('3e-developper-double', 'difference-produits')) {
      const expr = ex.prompt.match(/réduis \$(.+)\$\./)![1];
      const res = chosen(ex.answer).slice(1, -1);
      for (const x of [0, 1, -2, 3]) expect(near(evalPoly(expr, x), evalPoly(res, x))).toBe(true);
    }
  });
  it('identités remarquables', () => {
    for (const ex of draws('3e-identites', 'calcul-mental')) {
      const m = ex.prompt.match(/\$(\d+) \\times (\d+)\$/);
      if (m) expect(value(ex.answer)).toBe(Number(m[1]) * Number(m[2]));
      else expect(value(ex.answer)).toBe(numbers(ex.prompt)[0] ** 2);
    }
    for (const ex of draws('3e-identites', 'completer')) {
      const lhs = ex.prompt.match(/\(([^)]*)\\ldots\)\^2/)![1];
      const rhs = ex.prompt.match(/= (.+)\$\. Quel/)![1];
      const filled = `(${lhs}${value(ex.answer)})^2`;
      for (const x of [0, 1, 2]) expect(near(evalPoly(filled, x), evalPoly(rhs, x))).toBe(true);
    }
  });
  it('factorisations', () => {
    for (const ex of draws('3e-factoriser', 'facteur-x')) {
      const [lhs, rhs] = ex.prompt.match(/\$(.+)\$/)![1].split(' = ');
      const filled = rhs.replace('+ \\ldots', `+ (${value(ex.answer)})`);
      for (const x of [1, 2, -3]) expect(near(evalPoly(lhs, x), evalPoly(filled, x))).toBe(true);
    }
    for (const ex of draws('3e-factoriser', 'facteur-binome')) {
      const tex = ex.prompt.match(/\$(.+) = \((.+)\)\(ax \+ b\)\$/)!;
      const [a, b] = pairOf(ex.answer);
      for (const x of [0, 1, 2, -1]) expect(near(evalPoly(tex[1], x), evalPoly(tex[2], x) * (a * x + b))).toBe(true);
    }
    for (const ex of draws('3e-factoriser', 'plus-grand-facteur')) {
      const [p, q] = numbers(ex.prompt.match(/\$([^$]+)\$ en/)![1]);
      expect(value(ex.answer)).toBe(gcd(p, q));
    }
    for (const ex of draws('3e-factoriser-identite', 'coefficients')) {
      const lhs = ex.prompt.match(/\$(.+) = \(ax/)![1];
      const [a, b] = pairOf(ex.answer);
      for (const x of [0, 1, 3]) expect(near(evalPoly(lhs, x), (a * x - b) * (a * x + b))).toBe(true);
    }
    for (const ex of draws('3e-factoriser-identite', 'carre-parfait')) {
      const [lhs, rhs] = ex.prompt.match(/\$(.+)\$ avec/)![1].split(' = ');
      const filled = rhs.replace('c)', `${value(ex.answer)})`);
      for (const x of [0, 1, 3]) expect(near(evalPoly(lhs, x), evalPoly(filled, x))).toBe(true);
    }
    for (const ex of draws('3e-factoriser-identite', 'calcul-astucieux')) {
      const [x, , y] = numbers(ex.prompt);
      expect(value(ex.answer)).toBe(x * x - y * y);
    }
    for (const ex of draws('3e-factoriser-identite', 'binomes')) {
      const expr = ex.prompt.match(/\$(.+)\$/)![1];
      const res = chosen(ex.answer).slice(1, -1);
      for (const x of [0, 1, -2]) expect(near(evalPoly(expr, x), evalPoly(res, x))).toBe(true);
    }
  });
  it('programmes de calcul', () => {
    for (const ex of draws('3e-programme-calcul', 'retrouver-depart')) {
      const [a, b, c, r] = numbers(ex.prompt);
      expect((value(ex.answer) + a) * b - c).toBe(r);
    }
    for (const ex of draws('3e-programme-calcul', 'conjecture')) {
      const a = numbers(ex.prompt)[0];
      const prog = ex.prompt.includes('élever') ? (x: number) => (x + a) ** 2 - x * x : (x: number) => (x + a) * (x - a) + a * a;
      const res = chosen(ex.answer).slice(1, -1);
      for (const x of [0, 1, 4]) expect(near(prog(x), evalPoly(res, x))).toBe(true);
    }
  });
  it('équations : la solution vérifie l’équation', () => {
    const check = (name: string, sides: (p: string) => [string, string]) => {
      for (const ex of draws('3e-equation', name)) {
        const [l, r] = sides(ex.prompt);
        const x = value(ex.answer);
        expect(near(evalPoly(l, x), evalPoly(r, x)), ex.prompt).toBe(true);
      }
    };
    check('fraction', (p) => p.match(/\$(.+)\$/)![1].replace(/\\frac\{x\}\{(\d+)\}/, '(x/$1)').split(' = ') as [string, string]);
    check('deux-parentheses', (p) => p.match(/\$(.+)\$/)![1].split(' = ') as [string, string]);
    check('egalite-expressions', (p) => [p.match(/A = ([^$]+)\$/)![1], p.match(/B = ([^$]+)\$/)![1]]);
    for (const name of ['facteur-x', 'difference-carres'])
      for (const ex of draws('3e-produit-nul', name)) {
        const lhs = ex.prompt.match(/\$(.+) = 0\$/)![1].replace(/\)\^2 - (\d+)/, ')^2 - $1');
        for (const x of setOf(ex.answer)) expect(near(evalPoly(lhs, x), 0)).toBe(true);
        expect(setOf(ex.answer).length).toBe(2);
      }
    for (const ex of draws('3e-produit-nul', 'est-solution')) {
      const t = numbers(ex.prompt)[0];
      const lhs = ex.prompt.match(/\$(\(.+\)) = 0\$/)![1];
      expect(chosen(ex.answer)).toBe(near(evalPoly(lhs, t), 0) ? 'Oui' : 'Non');
    }
    for (const name of ['decale', 'coefficient'])
      for (const ex of draws('3e-equation-carre', name)) {
        const [l, r] = ex.prompt.match(/\$(.+)\$\. Donne/)![1].split(' = ');
        for (const x of setOf(ex.answer)) expect(near(evalPoly(l, x), Number(r))).toBe(true);
      }
    for (const ex of draws('3e-equation-carre', 'nombre-solutions')) {
      const k = numbers(ex.prompt)[1];
      expect(chosen(ex.answer)).toBe(k > 0 ? 'Deux' : k === 0 ? 'Une seule' : 'Aucune');
    }
  });
  it('inéquations', () => {
    for (const ex of draws('3e-inequation', 'plus-petit-entier')) {
      const [lhs, c] = ex.prompt.match(/\$(.+) > (-?\d+)\$/)!.slice(1);
      const n = value(ex.answer);
      expect(evalPoly(lhs, n) > Number(c)).toBe(true);
      expect(evalPoly(lhs, n - 1) > Number(c)).toBe(false);
    }
    for (const ex of draws('3e-inequation', 'tester')) {
      const t = numbers(ex.prompt)[0];
      const [, lhs, op, c] = ex.prompt.match(/\$([^$]+) (<|>|\\leq|\\geq) (-?\d+)\$/)!;
      const v = evalPoly(lhs, t);
      const ok = op === '<' ? v < +c : op === '>' ? v > +c : op === '\\leq' ? v <= +c : v >= +c;
      expect(chosen(ex.answer)).toBe(ok ? 'Oui' : 'Non');
    }
    for (const ex of draws('3e-inequation', 'probleme-tarif')) {
      const [fixe, p1, p2] = numbers(ex.prompt);
      const n = value(ex.answer);
      expect(fixe + p1 * n < p2 * n).toBe(true);
      expect(fixe + p1 * (n - 1) < p2 * (n - 1)).toBe(false);
    }
  });
  it('problèmes mis en équation', () => {
    for (const ex of draws('3e-mise-en-equation', 'ages-futurs')) {
      const [f, p] = numbers(ex.prompt);
      const k = ex.prompt.includes('double') ? 2 : 3;
      const n = value(ex.answer);
      expect(p + n).toBe(k * (f + n));
      expect(p - f).toBeGreaterThanOrEqual(20);
    }
    for (const ex of draws('3e-mise-en-equation', 'rencontre')) {
      const [d, v1, v2] = numbers(ex.prompt);
      expect(near((v1 + v2) * (value(ex.answer) / 60), d)).toBe(true);
    }
    for (const ex of draws('3e-mise-en-equation', 'poursuite')) {
      const [v2, v1, avance] = numbers(ex.prompt);
      expect(near((v1 - v2) * (value(ex.answer) / 60), avance)).toBe(true);
    }
    for (const ex of draws('3e-mise-en-equation', 'livres')) {
      const [N, e1, e2, L] = numbers(ex.prompt);
      const y = value(ex.answer);
      expect(e1 * (N - y) + e2 * y).toBe(L);
      expect(y >= 0 && y <= N).toBe(true);
    }
    for (const ex of draws('3e-mise-en-equation', 'consommations')) {
      const [ns, nc, total, ecart] = numbers(ex.prompt);
      const x = value(ex.answer);
      expect(near(ns * (x + ecart) + nc * x, total)).toBe(true);
    }
    for (const ex of draws('3e-mise-en-equation', 'banquet')) {
      const [p, g, q] = numbers(ex.prompt);
      const n = value(ex.answer);
      expect(p * n).toBe(q * (n - g));
    }
  });
});

describe('3e : variantes, fonctions et proportionnalité', () => {
  it('images et antécédents', () => {
    for (const ex of draws('3e-image', 'carre-negatif')) {
      const f = ex.prompt.match(/f\(x\) = ([^$]+)\$/)![1];
      const x = numbers(ex.prompt.split('Calcule')[1])[0];
      expect(near(evalPoly(f.replace(/(^|[^\d])x/g, '$1(x)'), x), value(ex.answer))).toBe(true);
    }
    for (const ex of draws('3e-image', 'tableur')) {
      const x = numbers(ex.prompt)[1];
      const formula = ex.prompt.match(/« =(.+) »/)![1].replace(/A1/g, `(${x})`).replace(/\^2/g, '**2');
      expect(value(ex.answer)).toBe(new Function(`return ${formula}`)());
    }
    for (const ex of draws('3e-antecedent', 'lineaire')) {
      const f = ex.prompt.match(/f\(x\) = ([^$]+)\$/)![1];
      const y = numbers(ex.prompt.split('image')[1])[0];
      expect(near(evalPoly(f.replace(/^-x/, '-1x').replace(/^x/, '1x'), value(ex.answer)), y)).toBe(true);
    }
    for (const ex of draws('3e-antecedent', 'carre')) {
      const f = ex.prompt.match(/f\(x\) = ([^$]+)\$/)![1];
      const y = numbers(ex.prompt.split('antécédents de')[1])[0];
      for (const x of setOf(ex.answer)) expect(near(evalPoly(f, x), y)).toBe(true);
    }
    for (const ex of draws('3e-tableau-valeurs', 'retrouver-formule')) {
      const row = ex.prompt.match(/f\(x\) & (.+?) \\\\/)![1].split(' & ').map(Number);
      const f = chosen(ex.answer).slice(1, -1).replace('f(x) = ', '');
      row.forEach((y, x) => expect(near(evalPoly(f.replace(/^-x/, '-1x').replace(/^x/, '1x'), x), y)).toBe(true));
    }
    for (const ex of draws('3e-vocabulaire-fonction', 'notation')) {
      const [x, y] = numbers(ex.prompt);
      expect(value(ex.answer)).toBe(ex.prompt.includes('image de') ? y : x);
    }
  });
  it('points et droites', () => {
    for (const ex of draws('3e-point-courbe', 'ordonnee')) {
      const x = numbers(ex.prompt)[0];
      const f = ex.prompt.match(/y = ([^$]+)\$/)![1];
      expect(near(evalPoly(f.replace(/^-x/, '-1x').replace(/^x/, '1x'), x), value(ex.answer))).toBe(true);
    }
    for (const ex of draws('3e-point-courbe', 'quel-point')) {
      const f = ex.prompt.match(/f\(x\) = ([^$]+)\$/)![1].replace(/^-x/, '-1x').replace(/^x/, '1x');
      const [x, y] = numbers(chosen(ex.answer));
      expect(near(evalPoly(f, x), y)).toBe(true);
    }
  });
  it('fonctions linéaires et affines', () => {
    for (const ex of draws('3e-lineaire', 'pourcentage')) {
      const t = numbers(ex.prompt)[0];
      expect(near(value(ex.answer), ex.prompt.startsWith('Augmenter') ? 1 + t / 100 : 1 - t / 100)).toBe(true);
    }
    for (const ex of draws('3e-lineaire', 'autre-image')) {
      const [x1, y1, x2] = numbers(ex.prompt);
      expect(near(value(ex.answer), (y1 / x1) * x2)).toBe(true);
    }
    for (const ex of draws('3e-affine-deux-points', 'coefficient')) {
      const [x1, y1, x2, y2] = numbers(ex.prompt);
      expect(near(value(ex.answer), (y2 - y1) / (x2 - x1))).toBe(true);
    }
    for (const ex of draws('3e-affine-deux-points', 'taxi')) {
      const [k1, p1, k2, p2] = numbers(ex.prompt);
      const [a, b] = pairOf(ex.answer);
      expect(near(a * k1 + b, p1)).toBe(true);
      expect(near(a * k2 + b, p2)).toBe(true);
    }
    for (const ex of draws('3e-affine-coefficients', 'forme-cachee')) {
      const f = ex.prompt.match(/f\(x\) = ([^$]+)\$/)![1];
      const [a, b] = pairOf(ex.answer);
      for (const x of [0, 1, 4]) expect(near(evalPoly(f, x), a * x + b)).toBe(true);
    }
    for (const ex of draws('3e-affine-coefficients', 'sens-variation')) {
      const f = ex.prompt.match(/f\(x\) = ([^$]+)\$/)![1].replace(/(^|[ (])x/g, '$11x');
      const slope = evalPoly(f, 1) - evalPoly(f, 0);
      expect(chosen(ex.answer)).toBe(slope > 0 ? 'Croissante' : slope < 0 ? 'Décroissante' : 'Constante');
    }
    for (const ex of draws('3e-affine-image', 'forfait')) {
      const [abo, prix, n] = numbers(ex.prompt);
      expect(near(value(ex.answer), abo + prix * n)).toBe(true);
    }
    for (const ex of draws('3e-affine-image', 'budget')) {
      const [fixe, unit, budget] = numbers(ex.prompt);
      const n = value(ex.answer);
      expect(fixe + unit * n <= budget + 1e-9).toBe(true);
      expect(fixe + unit * (n + 1) > budget + 1e-9).toBe(true);
    }
  });
  it('proportionnalité et pourcentages', () => {
    for (const ex of draws('3e-quatrieme-proportionnelle', 'recette')) {
      const [p1, g, p2] = numbers(ex.prompt);
      expect(near(value(ex.answer), (g / p1) * p2)).toBe(true);
    }
    for (const ex of draws('3e-quatrieme-proportionnelle', 'produit-en-croix')) {
      const [a, b, c] = numbers(ex.prompt);
      expect(near(value(ex.answer) / a, b / c)).toBe(true);
    }
    for (const ex of draws('3e-pourcentage', 'taux')) {
      const [total, part] = numbers(ex.prompt);
      expect(near(value(ex.answer), (part / total) * 100)).toBe(true);
    }
    for (const ex of draws('3e-pourcentage', 'total')) {
      const [t, part] = numbers(ex.prompt);
      expect(near((value(ex.answer) * t) / 100, part)).toBe(true);
    }
    for (const ex of draws('3e-coefficient-multiplicateur', 'lire-coefficient')) {
      expect(near(1 + value(ex.answer) / 100, numbers(ex.prompt)[0])).toBe(true);
    }
    for (const ex of draws('3e-evolution', 'taux-evolution')) {
      const [p, q] = numbers(ex.prompt);
      expect(near(value(ex.answer), ((q - p) / p) * 100)).toBe(true);
    }
    for (const ex of draws('3e-evolutions-successives', 'retour')) {
      const h = numbers(ex.prompt)[0];
      expect(near((1 + h / 100) * (1 - value(ex.answer) / 100), 1)).toBe(true);
    }
    for (const ex of draws('3e-evolutions-successives', 'deux-fois')) {
      const [p, t] = numbers(ex.prompt);
      const k = ex.prompt.includes('augmente') ? 1 + t / 100 : 1 - t / 100;
      expect(near(value(ex.answer), Math.round(p * k * k * 100) / 100)).toBe(true);
    }
    for (const ex of draws('3e-ratio', 'simplifier')) {
      const [x, y, a] = numbers(ex.prompt);
      expect(near(x / y, a / value(ex.answer))).toBe(true);
    }
    for (const ex of draws('3e-ratio', 'total')) {
      const [a, b, part] = numbers(ex.prompt);
      expect(near((value(ex.answer) * a) / (a + b), part)).toBe(true);
    }
  });
  it('vitesses, durées et débits', () => {
    for (const ex of draws('3e-vitesse', 'aller-retour')) {
      const [d, v1, v2] = numbers(ex.prompt);
      expect(near(value(ex.answer), (2 * d) / (d / v1 + d / v2))).toBe(true);
    }
    for (const ex of draws('3e-vitesse', 'distance')) {
      const [t, v] = numbers(ex.prompt);
      expect(near(value(ex.answer), (v * t) / 60)).toBe(true);
    }
    for (const ex of draws('3e-duree', 'heure-arrivee')) {
      const [h0, m0, v, d] = numbers(ex.prompt);
      const end = h0 * 60 + m0 + (d / v) * 60;
      const [h, m] = pairOf(ex.answer);
      expect(near(h * 60 + m, end)).toBe(true);
      expect(m < 60).toBe(true);
    }
    for (const ex of draws('3e-conversion-vitesse', 'par-minute')) expect(near(value(ex.answer), numbers(ex.prompt)[0] * 60)).toBe(true);
    for (const ex of draws('3e-conversion-vitesse', 'plus-rapide')) {
      const parts = ex.prompt.replace('Qui va le plus vite : ', '').replace(' ?', '').split(', ');
      const kmh = (p: string) => (p.includes('m/s') && !p.includes('km/h') ? numbers(p)[0] * 3.6 : numbers(p)[0]);
      const best = parts.reduce((m, p) => (kmh(p) > kmh(m) ? p : m));
      expect(best.startsWith(chosen(ex.answer))).toBe(true);
    }
    for (const ex of draws('3e-debit', 'deux-robinets')) {
      const [V, q1, q2] = numbers(ex.prompt);
      expect(near(value(ex.answer) * (q1 + q2), V)).toBe(true);
    }
    for (const ex of draws('3e-debit', 'conversion')) expect(near(value(ex.answer), (numbers(ex.prompt)[0] * 1000) / 60)).toBe(true);
  });
});

describe('3e : variantes, géométrie', () => {
  const r1 = (v: number) => Math.round(v * 10) / 10;
  it('Pythagore', () => {
    for (const ex of draws('3e-pythagore-hypotenuse', 'diagonale-carre')) expect(value(ex.answer)).toBe(r1(numbers(ex.prompt)[0] * Math.SQRT2));
    for (const ex of draws('3e-pythagore-hypotenuse', 'diagonale-pave')) {
      const [a, b, c] = numbers(ex.prompt);
      expect(value(ex.answer)).toBe(r1(Math.hypot(a, b, c)));
    }
    for (const ex of draws('3e-pythagore-cote', 'hauteur-isocele')) {
      const [s, base] = numbers(ex.prompt);
      expect(near(value(ex.answer) ** 2 + (base / 2) ** 2, s * s)).toBe(true);
    }
    for (const ex of draws('3e-pythagore-cote', 'cote-rectangle')) {
      const [d, L] = numbers(ex.prompt);
      expect(near(value(ex.answer) ** 2 + L * L, d * d)).toBe(true);
    }
    for (const ex of draws('3e-pythagore-reciproque', 'longueur-pour-rectangle')) {
      const [a, b] = numbers(ex.prompt);
      expect(near(value(ex.answer) ** 2, a * a + b * b)).toBe(true);
    }
    for (const ex of draws('3e-pythagore-reciproque', 'corde-noeuds')) {
      const [a, b, c] = numbers(ex.prompt).sort((x, y) => x - y);
      expect(chosen(ex.answer)).toBe(a * a + b * b === c * c ? 'Oui' : 'Non');
    }
    for (const ex of draws('3e-pythagore-probleme', 'cerf-volant')) {
      const [L, d] = numbers(ex.prompt);
      expect(near(value(ex.answer) ** 2 + d * d, L * L)).toBe(true);
    }
    for (const ex of draws('3e-pythagore-probleme', 'raccourci')) {
      const [a, b] = numbers(ex.prompt);
      expect(near(value(ex.answer), a + b - Math.hypot(a, b))).toBe(true);
    }
    for (const ex of draws('3e-pythagore-probleme', 'ecran-pouces')) {
      const [x, y] = numbers(ex.prompt);
      if (ex.prompt.includes('Quelle est sa diagonale')) expect(near(value(ex.answer), Math.hypot(x, y))).toBe(true);
      else expect(near(value(ex.answer) ** 2 + y * y, x * x)).toBe(true);
    }
  });
  it('Thalès', () => {
    for (const ex of draws('3e-thales-longueur', 'par-difference')) {
      const [am, an, nc] = numbers(ex.prompt);
      expect(near(am / value(ex.answer), an / (an + nc))).toBe(true);
    }
    for (const ex of draws('3e-thales-longueur', 'segment-restant')) {
      const [ab, ac, an] = numbers(ex.prompt);
      expect(near(ab - value(ex.answer), (ab * an) / ac)).toBe(true);
    }
    for (const ex of draws('3e-thales-rapports', 'valeur-rapport')) {
      const [am, ab] = numbers(ex.prompt);
      expect(near(value(ex.answer), am / ab)).toBe(true);
    }
    for (const ex of draws('3e-thales-reciproque', 'longueur-pour-parallele')) {
      const [am, ab, ac] = numbers(ex.prompt);
      expect(near(value(ex.answer) / ac, am / ab)).toBe(true);
    }
    for (const ex of draws('3e-thales-probleme', 'riviere')) {
      const [cd, db, de] = numbers(ex.prompt);
      expect(near(de / value(ex.answer), cd / (cd + db))).toBe(true);
    }
    for (const ex of draws('3e-thales-probleme', 'pyramide')) {
      const [baton, ombreB, ombreP, demi] = numbers(ex.prompt);
      expect(value(ex.answer)).toBe(Math.round(((demi + ombreP) * baton) / ombreB));
    }
  });
  it('trigonométrie', () => {
    const rad = (d: number) => (d * Math.PI) / 180;
    for (const ex of draws('3e-trigo-longueur', 'echelle')) {
      const [L, a] = numbers(ex.prompt);
      expect(value(ex.answer)).toBe(r1(L * Math.sin(rad(a))));
    }
    for (const ex of draws('3e-trigo-longueur', 'hauteur-arbre')) {
      const [d, a, eye] = numbers(ex.prompt);
      expect(value(ex.answer)).toBe(r1(eye + d * Math.tan(rad(a))));
    }
    for (const ex of draws('3e-trigo-angle', 'pente')) expect(value(ex.answer)).toBe(Math.round((Math.atan(numbers(ex.prompt)[0] / 100) * 180) / Math.PI));
    for (const ex of draws('3e-trigo-angle', 'rampe')) {
      const [L, h] = numbers(ex.prompt);
      expect(value(ex.answer)).toBe(Math.round((Math.asin(h / L) * 180) / Math.PI));
    }
    for (const ex of draws('3e-trigo-formule', 'valeur-impossible')) expect(chosen(ex.answer)).toBe(numbers(ex.prompt)[0] <= 1 ? 'Oui' : 'Non');
  });
  it('transformations, agrandissements, espace', () => {
    for (const ex of draws('3e-homothetie', 'rapport')) {
      const [l, img] = numbers(ex.prompt);
      expect(near(value(ex.answer), img / l)).toBe(true);
    }
    for (const ex of draws('3e-homothetie', 'rapport-negatif')) {
      const [l, k] = numbers(ex.prompt);
      expect(near(value(ex.answer), Math.abs(k) * l)).toBe(true);
    }
    for (const ex of draws('3e-agrandissement', 'aire-vers-longueur')) {
      const f = numbers(ex.prompt)[0];
      expect(near(value(ex.answer) ** (ex.prompt.includes('aires') ? 2 : 3), f)).toBe(true);
    }
    for (const ex of draws('3e-agrandissement', 'maquette')) {
      const [, e, v] = numbers(ex.prompt);
      expect(value(ex.answer)).toBe(v * e ** 3);
    }
    for (const ex of draws('3e-triangles-semblables', 'angles')) {
      const [a, b, b2, c2] = numbers(ex.prompt);
      const s1 = [a, b, 180 - a - b].sort((x, y) => x - y).join();
      const s2 = [b2, c2, 180 - b2 - c2].sort((x, y) => x - y).join();
      expect(chosen(ex.answer)).toBe(s1 === s2 ? 'Oui' : 'Non');
    }
    for (const ex of draws('3e-volume', 'boule')) expect(value(ex.answer)).toBe(Math.round((4 / 3) * Math.PI * numbers(ex.prompt)[0] ** 3));
    for (const ex of draws('3e-volume', 'compose')) {
      const [r, h, hc] = numbers(ex.prompt);
      expect(value(ex.answer)).toBe(Math.round(Math.PI * r * r * h + (Math.PI * r * r * hc) / 3));
    }
    for (const ex of draws('3e-conversion-volume', 'verres')) {
      const [g, b] = numbers(ex.prompt);
      expect(value(ex.answer)).toBe(Math.floor((b * 100) / g + 1e-9));
    }
    for (const ex of draws('3e-conversion-volume', 'aquarium')) {
      const [L, l, h] = numbers(ex.prompt);
      expect(near(value(ex.answer), (L * l * h) / 1000)).toBe(true);
    }
    for (const ex of draws('3e-section', 'rayon-section-sphere')) {
      const [R, d] = numbers(ex.prompt);
      expect(near(value(ex.answer) ** 2 + d * d, R * R)).toBe(true);
    }
    for (const ex of draws('3e-sphere', 'depuis-diametre')) expect(value(ex.answer)).toBe(Math.round(4 * Math.PI * (numbers(ex.prompt)[0] / 2) ** 2));
    for (const ex of draws('3e-sphere', 'rayon-depuis-aire')) expect(4 * value(ex.answer) ** 2).toBe(numbers(ex.prompt)[0]);
  });
});

describe('3e : variantes, données, hasard, algorithmique', () => {
  it('statistiques', () => {
    for (const ex of draws('3e-moyenne', 'note-manquante')) {
      const nums = numbers(ex.prompt);
      const target = nums[nums.length - 1];
      const n = nums[nums.length - 2];
      const notes = nums.slice(0, n - 1);
      expect(notes.reduce((s, x) => s + x, 0) + value(ex.answer)).toBe(n * target);
      expect(value(ex.answer) >= 0 && value(ex.answer) <= 20).toBe(true);
    }
    for (const ex of draws('3e-moyenne', 'ajout-valeur')) {
      const [n, m, v] = numbers(ex.prompt);
      expect(near(value(ex.answer), Math.round(((n * m + v) / (n + 1)) * 100) / 100)).toBe(true);
    }
    for (const ex of draws('3e-moyenne-ponderee', 'tableau-effectifs')) {
      const vals = ex.prompt.match(/Buts\} & (.+?) \\\\/)![1].split(' & ').map(Number);
      const eff = ex.prompt.match(/Matchs\} & (.+?) \\\\/)![1].split(' & ').map(Number);
      const m = vals.reduce((s, x, i) => s + x * eff[i], 0) / eff.reduce((s, x) => s + x, 0);
      expect(value(ex.answer)).toBe(Math.round(m * 10) / 10);
    }
    for (const ex of draws('3e-mediane', 'effectif-pair')) {
      const vals = numbers(ex.prompt.split(':')[1]).sort((a, b) => a - b);
      const n = vals.length;
      expect(value(ex.answer)).toBe((vals[n / 2 - 1] + vals[n / 2]) / 2);
    }
    for (const ex of draws('3e-etendue', 'valeur-manquante')) {
      const nums = numbers(ex.prompt);
      const e = nums[nums.length - 1];
      expect(value(ex.answer) - Math.min(...nums.slice(0, -1))).toBe(e);
      expect(value(ex.answer) >= Math.max(...nums.slice(0, -1))).toBe(true);
    }
    for (const ex of draws('3e-frequence', 'effectif')) {
      const [N, f] = numbers(ex.prompt);
      expect(near(value(ex.answer), (N * f) / 100)).toBe(true);
    }
    for (const ex of draws('3e-frequence', 'decimale')) {
      const [e, N] = numbers(ex.prompt);
      expect(near(value(ex.answer), e / N)).toBe(true);
    }
  });
  it('probabilités', () => {
    for (const ex of draws('3e-proba-urne', 'composition')) {
      const [total, p, q] = numbers(ex.prompt);
      expect(value(ex.answer)).toBe((total * p) / q);
    }
    for (const ex of draws('3e-proba-urne', 'ajouter')) {
      const [r, b] = numbers(ex.prompt);
      expect(r + value(ex.answer)).toBe(b);
    }
    for (const ex of draws('3e-proba-contraire', 'au-moins-un')) {
      if (ex.prompt.includes('dé')) expect(near(value(ex.answer), 1 - (5 / 6) ** 2)).toBe(true);
      else expect(near(value(ex.answer), 1 - 0.5 ** numbers(ex.prompt)[0])).toBe(true);
    }
    for (const ex of draws('3e-proba-contraire', 'pourcentage')) expect(value(ex.answer)).toBe(100 - numbers(ex.prompt)[0]);
    for (const ex of draws('3e-proba-de', 'multiple')) {
      const [faces, , , k] = numbers(ex.prompt);
      expect(near(value(ex.answer), Math.floor(faces / k) / faces)).toBe(true);
    }
    for (const ex of draws('3e-proba-deux-epreuves', 'meme-couleur')) {
      const [, r1, b1, , r2, b2] = numbers(ex.prompt);
      expect(near(value(ex.answer), (r1 * r2 + b1 * b2) / ((r1 + b1) * (r2 + b2)))).toBe(true);
    }
    for (const ex of draws('3e-proba-deux-epreuves', 'code')) {
      const [n, lo, hi] = numbers(ex.prompt);
      expect(near(value(ex.answer), 1 / (hi - lo + 1) ** n)).toBe(true);
    }
    for (const ex of draws('3e-proba-frequence', 'estimer-composition')) {
      const [total, n, k] = numbers(ex.prompt);
      expect(near(value(ex.answer), (k / n) * total)).toBe(true);
    }
  });
  it('algorithmique', () => {
    for (const ex of draws('3e-algo-boucle', 'tant-que')) {
      const [start, limit, k] = numbers(ex.prompt);
      let x = start;
      let c = 0;
      while (x < limit) {
        x *= k;
        c++;
      }
      expect(value(ex.answer)).toBe(c);
    }
    for (const ex of draws('3e-algo-boucle', 'somme')) {
      const n = numbers(ex.prompt)[2];
      const odd = ex.prompt.includes('2i - 1');
      let s = 0;
      for (let i = 1; i <= n; i++) s += odd ? 2 * i - 1 : i;
      expect(value(ex.answer)).toBe(s);
    }
    for (const ex of draws('3e-algo-condition', 'syracuse')) {
      const [, , , x0, steps] = numbers(ex.prompt);
      let x = x0;
      for (let i = 0; i < steps; i++) x = x % 2 === 0 ? x / 2 : 3 * x + 1;
      expect(value(ex.answer)).toBe(x);
    }
    for (const ex of draws('3e-algo-condition', 'tarif')) {
      const [, p1, , p3, p2, age] = numbers(ex.prompt);
      expect(value(ex.answer)).toBe(age < 12 ? p1 : age >= 65 ? p3 : p2);
    }
    for (const ex of draws('3e-algo-figure', 'nombre-cotes')) expect(value(ex.answer) * numbers(ex.prompt)[1]).toBe(360);
    for (const ex of draws('3e-algo-variables', 'echange')) {
      let [a, b] = numbers(ex.prompt);
      a = a + b;
      b = a - b;
      a = a - b;
      expect(value(ex.answer)).toBe(ex.prompt.includes('vaut $a$') ? a : b);
    }
  });
});
