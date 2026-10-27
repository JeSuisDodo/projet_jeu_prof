import { afterEach, describe, expect, it } from 'vitest';
import { TERMINALE } from '../src/content/terminale';
import { texEval } from './helpers/texEval';
import { lireNombre, optionJuste, tirages, valeur, variantesDe } from './helpers/variantes';

/** Justesse des variantes d'exercices de Terminale : chaque réponse est recalculée à partir de l'énoncé. */

const skills = TERMINALE.chapters.flatMap((c) => c.skills);
const t = (id: string, nom: string, count?: number) => tirages(skills, id, nom, count);
// Rend la main à la boucle d'événements entre deux tests (voir tests/variantes.test.ts).
afterEach(() => new Promise((resolve) => setTimeout(resolve, 0)));
/** Suite définie par u_0 et « u_{n+1} = … » (u_n et n dans la formule). */
const suite = (u0: number, rec: string, nb: number) => {
  const u = [u0];
  for (let n = 0; n < nb; n++) u.push(texEval(rec.replace(/u_n/g, `(${u[n]})`).replace(/n/g, `(${n})`), 0));
  return u;
};
const sens = (v: number[]) => {
  const d = v.slice(1).map((x, i) => x - v[i]);
  return d.every((x) => Math.abs(x) < 1e-12) ? 'Constante' : d.every((x) => x > 0) ? 'Croissante' : d.every((x) => x < 0) ? 'Décroissante' : 'Ni croissante ni décroissante';
};

describe('variantes de Terminale', () => {
  it('en propose au moins deux par compétence', () => {
    for (const s of skills) expect(variantesDe([s]).length, s.id).toBeGreaterThanOrEqual(2);
  });
});

describe('variantes de Terminale : suites et récurrence', () => {
  it('calcule des termes', () => {
    for (const ex of t('tle-terme-recurrence', 'homographique')) {
      const u0 = Number(/u_0 = (\d+)/.exec(ex.prompt)![1]);
      const rec = /u_\{n\+1\} = (.+?)\$/.exec(ex.prompt)![1];
      expect(valeur(ex)).toBeCloseTo(suite(u0, rec, 3)[3], 12);
    }
    for (const ex of t('tle-terme-recurrence', 'remonter')) {
      const rec = /u_\{n\+1\} = (.+?)\$/.exec(ex.prompt)![1];
      expect(suite(valeur(ex), rec, 3)[3] + 0).toBe(Number(/u_3 = (-?\d+)/.exec(ex.prompt)![1]));
    }
    for (const ex of t('tle-terme-recurrence', 'avec-n')) {
      const u0 = Number(/u_0 = (-?\d+)/.exec(ex.prompt)![1]);
      const rec = /u_\{n\+1\} = (.+?)\$/.exec(ex.prompt)![1];
      const k = Number(/u_\{(\d+)\}\$\.$/.exec(ex.prompt)![1]);
      expect(valeur(ex)).toBe(suite(u0, rec, k)[k]);
    }
    for (const ex of t('tle-conjecture', 'grand-rang')) {
      const u0 = Number(/u_0 = (-?\d+)/.exec(ex.prompt)![1]);
      const k = Number(/u_\{(\d+)\}\$\.$/.exec(ex.prompt)![1]);
      expect(valeur(ex)).toBe(suite(u0, 'u_n + 2n + 1', k)[k]);
    }
    for (const ex of t('tle-conjecture', 'arithmetico-geometrique')) {
      const u0 = Number(/u_0 = (-?\d+)/.exec(ex.prompt)![1]);
      const rec = /u_\{n\+1\} = (.+?)\$/.exec(ex.prompt)![1];
      const u = suite(u0, rec, 5);
      const formule = optionJuste(ex).replace(/^\$u_n = |\$$/g, '');
      for (let n = 0; n <= 5; n++) expect(texEval(formule.replace(/\^n/g, `^{${n}}`), 0)).toBeCloseTo(u[n], 9);
    }
    for (const ex of t('tle-terme-geometrique', 'premier-terme')) {
      const [n, un] = /u_\{(\d+)\} = (-?\d+)/.exec(ex.prompt)!.slice(1).map(Number);
      const q = Number(/q = (-?\d+)/.exec(ex.prompt)![1]);
      expect(valeur(ex) * q ** n).toBe(un);
    }
    for (const ex of t('tle-terme-geometrique', 'terme-general')) {
      const q = Number(/raison \$(-?\d+)\$/.exec(ex.prompt)![1]);
      const u1 = Number(/u_1 = (-?\d+)/.exec(ex.prompt)![1]);
      const formule = optionJuste(ex).replace(/^\$u_n = |\$$/g, '');
      for (let n = 1; n <= 4; n++) expect(texEval(formule.replace(/n/g, `(${n})`), 0)).toBeCloseTo(u1 * q ** (n - 1), 9);
    }
  });

  it('calcule des sommes', () => {
    const somme = (a: number, b: number, g: (k: number) => number) => Array.from({ length: b - a + 1 }, (_, i) => g(a + i)).reduce((s, v) => s + v, 0);
    for (const ex of t('tle-somme-entiers', 'carres')) {
      const n = Number(/\\dots \+ (\d+)\^2\$\.$/.exec(ex.prompt)![1]);
      expect(valeur(ex)).toBe(somme(1, n, (k) => k * k));
    }
    for (const ex of t('tle-somme-entiers', 'entre-deux-bornes')) {
      const [p, q] = [/S = (\d+)/, /\\dots \+ (\d+)\$/].map((r) => Number(r.exec(ex.prompt)![1]));
      expect(valeur(ex)).toBe(somme(p, q, (k) => k));
    }
    for (const ex of t('tle-somme-geometrique', 'puissances-inverses')) {
      const [q, n] = /\\frac\{1\}\{(\d)\^\{(\d+)\}\}\$/.exec(ex.prompt)!.slice(1).map(Number);
      expect(valeur(ex)).toBeCloseTo(somme(0, n, (k) => 1 / q ** k), 12);
    }
    for (const ex of t('tle-somme-geometrique', 'retrouver-n')) {
      const q = Number(/1 \+ (\d) \+/.exec(ex.prompt)![1]);
      const s = Number(/= (\d+)\$\. Que/.exec(ex.prompt)![1]);
      expect(somme(0, valeur(ex), (k) => q ** k)).toBe(s);
    }
  });

  it('étudie variations et récurrences', () => {
    for (const ex of t('tle-sens-variation', 'quotient')) {
      const u = (n: number) => texEval(/u_n = (.+?)\$/.exec(ex.prompt)![1].replace(/n/g, `(${n})`), 0);
      expect(optionJuste(ex), ex.prompt).toBe(sens(Array.from({ length: 30 }, (_, n) => u(n))));
    }
    for (const ex of t('tle-sens-variation', 'difference')) {
      const d = /u_n = (.+?)\$/.exec(ex.prompt)![1];
      expect(optionJuste(ex), ex.prompt).toBe(sens(suite(0, `u_n + ${d.startsWith('-') ? `(${d})` : `(${d})`}`, 20)));
    }
    for (const ex of t('tle-heredite', 'initialisation')) expect(optionJuste(ex)).toMatch(/u_0 = \d\^0/);
    for (const ex of t('tle-heredite', 'vrai-faux')) {
      // Les deux affirmations vraies sont le principe de récurrence et l'initialisation au premier rang concerné.
      const vrai = ex.prompt.startsWith('Vrai ou faux : si $P$ est') ? false : /\$P\(0\)\$ est vraie et si|initialiser au rang/.test(ex.prompt);
      expect(optionJuste(ex)).toBe(vrai ? 'Vrai' : 'Faux');
    }
  });
});

describe('variantes de Terminale : limites de suites', () => {
  /** Valeur de u_n (formule après « u_n = ») pour un grand n. */
  const enN = (s: string, n: number) => texEval(/u_n = (.+?)\$/.exec(s)![1].replace(/n/g, `(${n})`), 0);

  it('calcule des limites', () => {
    for (const ex of t('tle-limite-quotient', 'conjuguee')) expect(valeur(ex)).toBeCloseTo(enN(ex.prompt, 1e6), 4);
    for (const ex of t('tle-limite-quotient', 'exponentielles')) expect(valeur(ex)).toBeCloseTo(enN(ex.prompt, 200), 9);
    for (const ex of t('tle-limite-qn', 'somme-infinie')) {
      const q = texEval(/\\left\(([^()]+?)\\right\)\^n/.exec(ex.prompt)![1], 0);
      const s = Array.from({ length: 200 }, (_, k) => q ** k).reduce((a, b) => a + b, 0);
      expect(valeur(ex)).toBeCloseTo(s, 9);
    }
    for (const ex of t('tle-limite-qn', 'vrai-faux')) {
      const q = texEval(/\\left\(\\left\((.+?)\\right\)\^n/.exec(ex.prompt)![1], 0);
      const [a, b] = [q ** 400, q ** 401];
      const converge = Number.isFinite(a) && Math.abs(a - b) < 1e-9;
      expect(optionJuste(ex), ex.prompt).toBe(converge ? 'Vrai' : 'Faux');
    }
    for (const ex of t('tle-limite-point-fixe', 'racine')) {
      const rec = /u_\{n\+1\} = (.+?)\$/.exec(ex.prompt)![1];
      expect(valeur(ex)).toBeCloseTo(suite(1, rec, 200)[200], 9);
    }
    for (const ex of t('tle-limite-point-fixe', 'retrouver-b')) {
      const rec = /u_\{n\+1\} = (.+?) \+ b\$/.exec(ex.prompt)![1];
      const l = Number(/converge vers \$(-?\d+)\$/.exec(ex.prompt)![1]);
      expect(suite(0, `${rec} + (${valeur(ex)})`, 300)[300]).toBeCloseTo(l, 9);
    }
    for (const ex of t('tle-gendarmes', 'somme')) {
      const a = Number(/\\frac\{(\d+)n\}/.exec(ex.prompt)![1]);
      const n = 20000;
      let s = 0;
      for (let k = 1; k <= n; k++) s += (a * n) / (n * n + k);
      expect(valeur(ex)).toBeCloseTo(s, 3);
    }
    for (const ex of t('tle-gendarmes', 'encadrement')) {
      const [lo, hi] = [...ex.prompt.matchAll(/\\frac\{(.+?)\}\{(.+?)\}/g)].map((m) => texEval(`\\frac{${m[1]}}{${m[2]}}`.replace(/n/g, '(1000000)'), 0));
      expect(valeur(ex)).toBeCloseTo(lo, 4);
      expect(valeur(ex)).toBeCloseTo(hi, 4);
    }
  });

  it('détermine des seuils et utilise les théorèmes', () => {
    for (const ex of t('tle-seuil', 'decroissante')) {
      const s = lireNombre(/u_n < (.+?)\$/.exec(ex.prompt)![1]);
      const n = valeur(ex);
      expect(enN(ex.prompt, n) < s && enN(ex.prompt, n - 1) >= s).toBe(true);
    }
    for (const ex of t('tle-seuil', 'arithmetique')) {
      const s = Number(/u_n > (-?\d+)\$/.exec(ex.prompt)![1]);
      const n = valeur(ex);
      expect(enN(ex.prompt, n) > s && enN(ex.prompt, n - 1) <= s).toBe(true);
    }
    for (const ex of t('tle-comparaison', 'conclusion')) {
      const borne = /\$u_n (\\geq|\\leq) (.+?)\$/.exec(ex.prompt)!;
      const loin = texEval(borne[2].replace(/n/g, '(1000000000000)'), 0);
      const attendu = borne[1] === '\\geq' && loin > 1e5 ? 0 : borne[1] === '\\leq' && loin < -1e5 ? 1 : 3;
      expect(optionJuste(ex), ex.prompt).toBe(['Elle tend vers $+\\infty$', 'Elle tend vers $-\\infty$', 'Elle converge vers $0$', 'On ne peut rien dire'][attendu]);
    }
    for (const ex of t('tle-comparaison', 'vrai-faux')) {
      const vrai = /u_n \\geq v_n\$ et \$v_n \\to|u_n \\leq v_n\$ et \$u_n \\to/.test(ex.prompt);
      expect(optionJuste(ex)).toBe(vrai ? 'Vrai' : 'Faux');
    }
    for (const ex of t('tle-convergence-monotone', 'exemple')) expect(valeur(ex)).toBeCloseTo(enN(ex.prompt, 1e9), 6);
    for (const ex of t('tle-convergence-monotone', 'vrai-faux')) {
      const vrai = /limite \$\\ell|non majorée/.test(ex.prompt);
      expect(optionJuste(ex)).toBe(vrai ? 'Vrai' : 'Faux');
    }
  });
});

describe('variantes de Terminale : limites de fonctions', () => {
  const ln = (tex: string) => tex.replace(/\\ln x/g, 'LN');
  /** Évalue une expression en x, avec \ln x pris en charge. */
  const ev = (tex: string, x: number) => texEval(ln(tex).replace(/LN/g, `(${Math.log(x)})`), x);
  /** Valeur numérique d'une option de limite (« +\infty » devient ±1e300). */
  const lu = (opt: string) => {
    const s = opt.replace(/\$/g, '');
    return s === '+\\infty' ? Infinity : s === '-\\infty' ? -Infinity : texEval(s, 0);
  };
  const proche = (calc: number, attendu: number) => (Math.abs(attendu) === Infinity ? Math.sign(calc) === Math.sign(attendu) && Math.abs(calc) > 1e3 : Math.abs(calc - attendu) < 1e-3);

  it('calcule des limites en l’infini et en un point', () => {
    for (const ex of t('tle-limite-infini', 'valeur')) expect(valeur(ex)).toBeCloseTo(ev(/f\(x\) = (.+?)\$/.exec(ex.prompt)![1], 1e6), 4);
    for (const ex of t('tle-limite-infini', 'conjuguee')) expect(valeur(ex)).toBeCloseTo(ev(/f\(x\) = (.+?)\$/.exec(ex.prompt)![1], 1e6), 4);
    for (const ex of t('tle-croissances-comparees', 'logarithme')) {
      const [expr, at] = /de \$(.+)\$ quand \$x \\to (.+?)\$/.exec(ex.prompt)!.slice(1);
      const x = at === '0^+' ? 1e-30 : 1e30;
      const v = ev(expr, x);
      expect(proche(v > 1e10 ? Infinity : v, lu(optionJuste(ex))), ex.prompt).toBe(true);
    }
    for (const ex of t('tle-croissances-comparees', 'vrai-faux')) {
      const [at, expr, lim] = /\\lim_\{x \\to (.+?)\} (.+) = (.+)\$\.$/.exec(ex.prompt)!.slice(1);
      const v = ev(expr, at === '+\\infty' ? 200 : -200);
      const ok = lim === '0' ? Math.abs(v) < 1e-20 : v > 1e20;
      expect(optionJuste(ex), ex.prompt).toBe(ok ? 'Vrai' : 'Faux');
    }
    for (const ex of t('tle-limite-en-a', 'forme-0-sur-0')) {
      const a = Number(/x \\to (-?\d+)\$/.exec(ex.prompt)![1]);
      expect(valeur(ex)).toBeCloseTo(ev(/f\(x\) = (.+?)\$/.exec(ex.prompt)![1], a + 1e-7), 5);
    }
    for (const ex of t('tle-limite-en-a', 'vrai-faux-asymptote')) {
      const g = /f\(x\) = (.+?)\$/.exec(ex.prompt)![1];
      const a = Number(/x = (-?\d+)\$ comme/.exec(ex.prompt)![1]);
      expect(optionJuste(ex), ex.prompt).toBe(Math.abs(ev(g, a + 1e-9)) > 1e6 ? 'Vrai' : 'Faux');
    }
    for (const ex of t('tle-asymptotes', 'horizontale')) expect(valeur(ex)).toBeCloseTo(ev(/f\(x\) = (.+?)\$/.exec(ex.prompt)![1], 1e7), 4);
    for (const ex of t('tle-asymptotes', 'nombre-verticales')) {
      const den = /\\frac\{1\}\{(.+?)\}\$/.exec(ex.prompt)![1];
      const zeros = Array.from({ length: 41 }, (_, i) => i - 20).filter((x) => texEval(den, x) === 0);
      expect(valeur(ex)).toBe(zeros.length);
    }
  });

  it('lève des indéterminations et compose', () => {
    for (const ex of t('tle-forme-indeterminee', 'nombre-derive')) expect(valeur(ex)).toBeCloseTo(ev(/limite de \$(.+?)\$ quand/.exec(ex.prompt)![1], 1e-7), 5);
    for (const ex of t('tle-forme-indeterminee', 'moins-infini')) {
      const v = ev(/f\(x\) = (.+?)\$/.exec(ex.prompt)![1], -1e4);
      expect(optionJuste(ex)).toBe(v > 0 ? '$+\\infty$' : '$-\\infty$');
    }
    for (const ex of t('tle-limite-composee', 'racine-rationnelle')) expect(valeur(ex)).toBeCloseTo(ev(/limite de \$(.+?)\$ quand/.exec(ex.prompt)![1], 1e7), 4);
    for (const ex of t('tle-limite-composee', 'exponentielle-rationnelle')) {
      const v = ev(/limite de \$(.+?)\$ quand/.exec(ex.prompt)![1], 1e8);
      expect(lu(optionJuste(ex))).toBeCloseTo(v, 4);
    }
  });
});

describe('variantes de Terminale : continuité', () => {
  const entier = (s: string) => Number(s);
  /** Solutions de f(x) = k pour f affine par morceaux passant par les points donnés (même monotonie que l'énoncé). */
  const solutions = (pts: [number, number][], k: number) => {
    const xs = new Set<number>();
    for (let i = 0; i + 1 < pts.length; i++) {
      const [[x0, y0], [x1, y1]] = [pts[i], pts[i + 1]];
      if ((k - y0) * (k - y1) <= 0) xs.add(Number((x0 + ((k - y0) * (x1 - x0)) / (y1 - y0)).toFixed(9)));
    }
    return xs.size;
  };

  it('applique le théorème des valeurs intermédiaires', () => {
    for (const ex of t('tle-tvi-encadrement', 'exponentielle')) {
      const f = /f\(x\) = (.+?)\$/.exec(ex.prompt)![1];
      const k = valeur(ex);
      expect(texEval(f, k)).toBeLessThan(0);
      expect(texEval(f, k + 1)).toBeGreaterThan(0);
    }
    for (const ex of t('tle-tvi-encadrement', 'vrai-faux')) {
      const m = /f\((-?\d+)\) = (-?\d+)\$ et \$f\((-?\d+)\) = (-?\d+)\$/.exec(ex.prompt)!;
      expect(optionJuste(ex)).toBe(entier(m[2]) * entier(m[4]) < 0 ? 'Vrai' : 'Faux');
    }
    for (const nom of ['decroissante-croissante']) {
      for (const ex of t('tle-tvi-tableau', nom)) {
        const v = [...ex.prompt.matchAll(/f\((-?\d+)\) = (-?\d+)\$/g)].map((m) => [entier(m[1]), entier(m[2])] as [number, number]);
        const k = entier(/f\(x\) = (-?\d+)\$/.exec(ex.prompt)![1]);
        expect(entier(optionJuste(ex)), ex.prompt).toBe(solutions(v, k));
      }
    }
    for (const ex of t('tle-tvi-tableau', 'monotone')) {
      const v = [...ex.prompt.matchAll(/f\((-?\d+)\) = (-?\d+)\$/g)].map((m) => [entier(m[1]), entier(m[2])] as [number, number]);
      const k = entier(/f\(x\) = (-?\d+)\$/.exec(ex.prompt)![1]);
      expect(entier(optionJuste(ex)), ex.prompt).toBe(solutions(v, k));
    }
  });

  it('mène une dichotomie', () => {
    for (const ex of t('tle-dichotomie', 'nombre-etapes')) {
      const L = entier(/longueur \$(\d+)\$/.exec(ex.prompt)![1]);
      const p = entier(/10\^\{-(\d+)\}/.exec(ex.prompt)![1]);
      const n = valeur(ex);
      expect(L / 2 ** n).toBeLessThan(10 ** -p);
      expect(L / 2 ** (n - 1)).toBeGreaterThanOrEqual(10 ** -p);
    }
    for (const ex of t('tle-dichotomie', 'deux-etapes')) {
      let [lo, hi] = [...ex.prompt.matchAll(/f\((-?\d+)\) [<>] 0\$ et \$f\((-?\d+)\)/g)].flatMap((m) => [entier(m[1]), entier(m[2])]);
      for (const m of ex.prompt.matchAll(/f\(([\d{},]+)\) ([<>]) 0\$/g)) {
        const x = lireNombre(m[1]);
        if (x === lo || x === hi) continue;
        if (m[2] === '>') hi = x;
        else lo = x;
      }
      const [g, d] = /^\$\[(.+)\\,;\\,(.+)\]\$$/.exec(optionJuste(ex))!.slice(1).map(lireNombre);
      expect([g, d], ex.prompt).toEqual([lo, hi]);
    }
  });

  it('rend continue et passe à la limite', () => {
    for (const ex of t('tle-continuite-morceaux', 'exponentielle')) {
      const droite = /et \$f\(x\) = (.+?)\$ si \$x \\geq 0/.exec(ex.prompt)![1];
      expect(1 + valeur(ex)).toBe(texEval(droite, 0) + 0);
    }
    for (const ex of t('tle-continuite-morceaux', 'vrai-faux')) {
      const [g, d] = [...ex.prompt.matchAll(/f\(x\) = (.+?)\$ si/g)].map((m) => m[1]);
      const k = entier(/x < (-?\d+)\$/.exec(ex.prompt)![1]);
      expect(optionJuste(ex)).toBe(texEval(g, k) === texEval(d, k) ? 'Vrai' : 'Faux');
    }
    for (const nom of ['homographique', 'moyenne']) {
      for (const ex of t('tle-suite-point-fixe', nom)) {
        const u0 = entier(/u_0 = (\d+)/.exec(ex.prompt)![1]);
        const rec = /u_\{n\+1\} = (.+?)\$/.exec(ex.prompt)![1];
        expect(valeur(ex), ex.prompt).toBeCloseTo(suite(u0, rec, 200)[200], 6);
      }
    }
  });
});

describe('variantes de Terminale : dérivation', () => {
  const h = 1e-4;
  const expr = (ex: { prompt: string }) => /f\(x\) = (.+?)\$/.exec(ex.prompt)![1];
  const d1 = (f: string, x: number) => (texEval(f, x + h) - texEval(f, x - h)) / (2 * h);
  const d2 = (f: string, x: number) => (texEval(f, x + h) - 2 * texEval(f, x) + texEval(f, x - h)) / h ** 2;
  const point = (ex: { prompt: string }) => Number(/f'\((-?\d+)\)/.exec(ex.prompt)![1]);

  it('calcule des dérivées de fonctions composées', () => {
    for (const [id, nom] of [
      ['tle-derivee-composee', 'inverse'],
      ['tle-derivee-racine', 'inverse'],
      ['tle-derivee-racine', 'carre'],
      ['tle-derivee-exp', 'carre'],
    ]) {
      for (const ex of t(id, nom)) expect(valeur(ex), ex.prompt).toBeCloseTo(d1(expr(ex), point(ex)), 3);
    }
    for (const ex of t('tle-derivee-exp', 'produit')) expect(valeur(ex), ex.prompt).toBeCloseTo(d1(expr(ex), 0), 3);
    for (const ex of t('tle-derivee-composee', 'vrai-faux')) {
      const claim = /f'\(x\) = (.+?)\$/.exec(ex.prompt)![1];
      const juste = [0.3, 1.7].every((x) => Math.abs(texEval(claim, x) - d1(expr(ex), x)) < 1e-3 * (1 + Math.abs(texEval(claim, x))));
      expect(optionJuste(ex), ex.prompt).toBe(juste ? 'Vrai' : 'Faux');
    }
  });

  it('utilise la dérivée seconde et la convexité', () => {
    for (const ex of t('tle-derivee-seconde', 'exponentielle')) expect(valeur(ex), ex.prompt).toBeCloseTo(d2(expr(ex), 0), 3);
    for (const ex of t('tle-derivee-seconde', 'retrouver-coefficient')) {
      const f = expr(ex).replace(/^m/, `${valeur(ex)}\\times `);
      const [x0, v] = /f''\((-?\d+)\) = (-?\d+)\$/.exec(ex.prompt)!.slice(1).map(Number);
      expect(d2(f, x0), ex.prompt).toBeCloseTo(v, 3);
    }
    for (const ex of t('tle-point-inflexion', 'ordonnee')) {
      const f = expr(ex);
      const x0 = [-2, -1, 0, 1, 2].find((x) => d2(f, x - 0.5) * d2(f, x + 0.5) < 0)!;
      expect(valeur(ex), ex.prompt).toBeCloseTo(texEval(f, x0), 9);
    }
    for (const ex of t('tle-point-inflexion', 'vrai-faux')) {
      const fpp = /f''\(x\) = (.+?)\$/.exec(ex.prompt)![1];
      const p = Number(/abscisse \$(-?\d+)\$/.exec(ex.prompt)![1]);
      expect(optionJuste(ex), ex.prompt).toBe(texEval(fpp, p - 0.1) * texEval(fpp, p + 0.1) < 0 ? 'Vrai' : 'Faux');
    }
    for (const ex of t('tle-convexite', 'polynome')) {
      const f = expr(ex);
      const k = Number(/\[(-?\d+)\\,;\\,\+\\infty/.exec(optionJuste(ex))![1]);
      const convexeAvant = optionJuste(ex).startsWith('Convexe');
      expect(d2(f, k - 1) > 0, ex.prompt).toBe(convexeAvant);
      expect(d2(f, k + 1) > 0, ex.prompt).toBe(!convexeAvant);
    }
    for (const ex of t('tle-convexite', 'derivee-monotone')) {
      expect(optionJuste(ex).startsWith('Convexe')).toBe(/f'\$ est croissante/.test(ex.prompt));
    }
  });

  it('détermine des tangentes', () => {
    for (const ex of t('tle-tangente', 'exponentielle')) {
      const x0 = Number(/en \$(-?\d+)\$/.exec(ex.prompt)![1]);
      const f = expr(ex);
      if (ex.answer.kind !== 'pair') throw new Error('couple attendu');
      const [m, p] = ex.answer.values.map((v) => v.n / v.d);
      expect(m).toBeCloseTo(d1(f, x0), 3);
      expect(m * x0 + p).toBeCloseTo(texEval(f, x0), 9);
    }
    for (const ex of t('tle-tangente', 'point-de-contact')) {
      const m = Number(/directeur \$(-?\d+)\$/.exec(ex.prompt)![1]);
      expect(d1(expr(ex), valeur(ex)), ex.prompt).toBeCloseTo(m, 3);
    }
  });
});

describe('variantes de Terminale : logarithme', () => {
  /** Évalue une expression où \ln(…) et \ln x sont remplacés par leur valeur. */
  const lnEval = (s: string, x = 0) =>
    texEval(
      s.replace(/\\ln\s*\(([^()]*)\)/g, (_, u: string) => `(${Math.log(texEval(u, x))})`).replace(/\\ln x/g, `(${Math.log(x)})`),
      x,
    );
  const expr = (ex: { prompt: string }) => /f\(x\) = (.+?)\$/.exec(ex.prompt)![1];
  const d1 = (f: string, x: number) => (lnEval(f, x + 1e-5) - lnEval(f, x - 1e-5)) / 2e-5;

  it('calcule avec les propriétés de ln et résout des équations', () => {
    for (const ex of t('tle-ln-proprietes', 'exponentielle')) expect(valeur(ex)).toBeCloseTo(lnEval(/A = (.+?)\$/.exec(ex.prompt)![1]), 9);
    for (const ex of t('tle-ln-proprietes', 'vrai-faux')) {
      const [g, d] = /\$(.+)\$/.exec(ex.prompt)![1].split(' = ').map((s) => lnEval(s));
      expect(optionJuste(ex), ex.prompt).toBe(Math.abs(g - d) < 1e-9 ? 'Vrai' : 'Faux');
    }
    for (const nom of ['ln-nul', 'carre']) {
      for (const ex of t('tle-ln-equation', nom)) {
        if (ex.answer.kind !== 'set') throw new Error('ensemble attendu');
        const [g, d] = /: \$(.+)\$/.exec(ex.prompt)![1].split(' = ');
        for (const v of ex.answer.values) expect(lnEval(g, v.n / v.d), ex.prompt).toBeCloseTo(lnEval(d), 9);
      }
    }
    for (const ex of t('tle-ln-equation', 'carre')) if (ex.answer.kind === 'set') expect(ex.answer.values).toHaveLength(2);
    for (const ex of t('tle-exp-equation', 'deux-exponentielles')) {
      const [g, d] = [...ex.prompt.matchAll(/e\^\{(.+?)\}/g)].map((m) => m[1]);
      expect(texEval(g, valeur(ex)) + 0).toBe(texEval(d, valeur(ex)) + 0);
    }
    for (const ex of t('tle-exp-equation', 'nombre-solutions')) {
      const g = /\$(.+) = 0\$/.exec(ex.prompt)![1];
      // Les racines X = e^x sont entières : on échantillonne X entre les entiers.
      const v = [0.01, 0.5, 1.5, 2.5, 3.5, 4.5, 5.5, 50].map((X) => texEval(g, Math.log(X)));
      const changes = v.slice(1).filter((y, i) => y * v[i] < 0).length;
      expect(Number(optionJuste(ex)), ex.prompt).toBe(changes);
    }
  });

  it('dérive, cherche des limites et des seuils', () => {
    for (const ex of t('tle-ln-derivee', 'ln-carre')) {
      const x0 = Number(/f'\((-?\d+)\)/.exec(ex.prompt)![1]);
      expect(valeur(ex)).toBeCloseTo(d1(expr(ex), x0), 5);
    }
    for (const ex of t('tle-ln-derivee', 'produit')) expect(valeur(ex)).toBeCloseTo(d1(expr(ex), 1), 5);
    for (const [nom, x] of [['polynome-ln', 1e9], ['en-zero', 1e-9]] as const) {
      for (const ex of t('tle-ln-limites', nom)) {
        const v = lnEval(/limite de \$(.+?)\$ quand/.exec(ex.prompt)![1], x);
        expect(optionJuste(ex), ex.prompt).toBe(v > 0 ? '$+\\infty$' : '$-\\infty$');
        expect(Math.abs(v)).toBeGreaterThan(1e6);
      }
    }
    for (const ex of t('tle-ln-seuil', 'croissance')) {
      const [n, d, s] = /\\frac\{(\d+)\}\{(\d+)\}\\right\)\^n > (\d+)/.exec(ex.prompt)!.slice(1).map(Number);
      const k = valeur(ex);
      expect((n / d) ** k).toBeGreaterThan(s);
      expect((n / d) ** (k - 1)).toBeLessThanOrEqual(s);
    }
    for (const ex of t('tle-ln-seuil', 'pourcentage')) {
      const q = 1 - Number(/de \$(\d+)\\,\\%/.exec(ex.prompt)![1]) / 100;
      const frac = ex.prompt.includes('moitié') ? 0.5 : ex.prompt.includes('quart') ? 0.25 : 0.1;
      const k = valeur(ex);
      expect(q ** k).toBeLessThan(frac);
      expect(q ** (k - 1)).toBeGreaterThanOrEqual(frac);
    }
  });

  it('trouve des extremums', () => {
    for (const [nom, signe] of [['maximum', -1], ['carre', 1]] as const) {
      for (const ex of t('tle-ln-variations', nom)) {
        const f = expr(ex);
        const x0 = valeur(ex);
        expect(d1(f, x0), ex.prompt).toBeCloseTo(0, 4);
        expect(signe * (lnEval(f, x0 * 0.9) - lnEval(f, x0)), ex.prompt).toBeGreaterThan(0);
        expect(signe * (lnEval(f, x0 * 1.1) - lnEval(f, x0)), ex.prompt).toBeGreaterThan(0);
      }
    }
  });
});

describe('variantes de Terminale : trigonométrie', () => {
  const ev = (s: string, x = 0) => texEval(s.replace(/\$/g, ''), x);
  const expr = (ex: { prompt: string }) => /f\(x\) = (.+?)\$/.exec(ex.prompt)![1];
  const d1 = (f: string, x: number) => (ev(f, x + 1e-6) - ev(f, x - 1e-6)) / 2e-6;

  it('connaît les valeurs et dérive', () => {
    for (const ex of t('tle-trigo-valeurs', 'tangente')) {
      const angle = ev(/\\tan\\left\((.+?)\\right\)\$/.exec(ex.prompt)![1]);
      expect(ev(optionJuste(ex)), ex.prompt).toBeCloseTo(Math.tan(angle), 9);
    }
    for (const ex of t('tle-trigo-valeurs', 'retrouver-angle')) {
      const [, fn, v] = /\\(cos|sin) x = (.+?)\$/.exec(ex.prompt)!;
      const x = ev(optionJuste(ex));
      expect(fn === 'cos' ? Math.cos(x) : Math.sin(x), ex.prompt).toBeCloseTo(ev(v), 9);
      if (fn === 'cos') expect(x >= -1e-9 && x <= Math.PI + 1e-9).toBe(true);
      else expect(Math.abs(x) <= Math.PI / 2 + 1e-9).toBe(true);
    }
    for (const ex of t('tle-trigo-derivee', 'valeur')) expect(valeur(ex), ex.prompt).toBeCloseTo(d1(expr(ex), Math.PI), 5);
    for (const ex of t('tle-trigo-derivee', 'produit')) {
      const x0 = ex.prompt.includes("f'\\left(0") ? 0 : Math.PI / 2;
      expect(valeur(ex), ex.prompt).toBeCloseTo(d1(expr(ex), x0), 5);
    }
  });

  it('étudie périodes et parité', () => {
    const periodique = (f: string, T: number) => [0.3, 1.1, 2.7].every((x) => Math.abs(ev(f, x + T) - ev(f, x)) < 1e-9);
    for (const ex of t('tle-trigo-periode', 'fraction')) {
      const f = expr(ex);
      const T = ev(optionJuste(ex));
      expect(periodique(f, T), ex.prompt).toBe(true);
      for (const m of [2, 3, 4]) expect(periodique(f, T / m), ex.prompt).toBe(false);
    }
    for (const ex of t('tle-trigo-periode', 'vrai-faux')) {
      const T = ev(/faux : \$(.+?)\$/.exec(ex.prompt)![1]);
      expect(optionJuste(ex), ex.prompt).toBe(periodique(expr(ex), T) ? 'Vrai' : 'Faux');
    }
    for (const [nom, options] of [
      ['combinaison', ['Paire', 'Impaire', 'Ni paire ni impaire']],
      ['symetrie', ['L’axe des ordonnées', 'L’origine du repère', 'Ni l’un ni l’autre']],
    ] as const) {
      for (const ex of t('tle-trigo-parite', nom)) {
        const f = expr(ex);
        const xs = [0.4, 1.3, 2.2];
        const type = xs.every((x) => Math.abs(ev(f, -x) - ev(f, x)) < 1e-9) ? 0 : xs.every((x) => Math.abs(ev(f, -x) + ev(f, x)) < 1e-9) ? 1 : 2;
        expect(optionJuste(ex), ex.prompt).toBe(options[type]);
      }
    }
  });

  it('compte des solutions et calcule des limites', () => {
    for (const ex of t('tle-trigo-equation', 'nombre-solutions')) {
      const [, fn, v] = /\\(cos|sin) x = (.+?)\$/.exec(ex.prompt)!;
      const fin = ev(/\[0\\,;\\,(\d\\pi)\[/.exec(ex.prompt)![1]);
      const c = ev(v);
      const g = (x: number) => (fn === 'cos' ? Math.cos(x) : Math.sin(x)) - c;
      // Compte les zéros, les changements de signe et les contacts (minimums de |g| sans changement de signe).
      const pas = 1e-3;
      const ys = Array.from({ length: Math.round(fin / pas) }, (_, i) => g(i * pas));
      let n = 0;
      ys.forEach((y, i) => {
        const [avant, apres] = [ys[i - 1], ys[i + 1]];
        if (y === 0 || (apres !== undefined && y * apres < 0)) n++;
        else if (avant !== undefined && apres !== undefined && Math.abs(y) < 1e-6 && Math.abs(y) < Math.abs(avant) && Math.abs(y) <= Math.abs(apres) && y * avant > 0 && y * apres > 0) n++;
      });
      expect(valeur(ex), ex.prompt).toBe(n);
    }
    for (const ex of t('tle-trigo-equation', 'angle-multiple')) {
      const g = /\$(.+) = 0\$/.exec(ex.prompt)![1];
      let n = 0;
      // Grille de [-0,003 ; 2π - 0,003] : on garde 0 et on exclut 2π.
      const xs = Array.from({ length: 201 }, (_, i) => -3e-3 + (i * 2 * Math.PI) / 200);
      for (let i = 0; i < 200; i++) if (ev(g, xs[i]) * ev(g, xs[i + 1]) < 0) n++;
      expect(valeur(ex), ex.prompt).toBe(n);
    }
    for (const nom of ['quotient-sinus', 'inverse']) {
      for (const ex of t('tle-trigo-limite', nom)) expect(valeur(ex), ex.prompt).toBeCloseTo(ev(/0\} (.+?)\$/.exec(ex.prompt)![1], 1e-6), 6);
    }
  });
});

describe('variantes de Terminale : primitives et équations différentielles', () => {
  const ev = (s: string, x = 0) =>
    texEval(
      s.replace(/\$/g, '').replace(/\\ln\(([^()]*)\)/g, (_, u: string) => `(${Math.log(texEval(u, x))})`),
      x,
    );
  const d1 = (f: string, x: number) => (ev(f, x + 1e-6) - ev(f, x - 1e-6)) / 2e-6;
  /** Intégrale par la méthode de Simpson. */
  const integrale = (f: string, a: number, b: number, n = 200) => {
    const h = (b - a) / n;
    let s = ev(f, a) + ev(f, b);
    for (let i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * ev(f, a + i * h);
    return (s * h) / 3;
  };
  const expr = (ex: { prompt: string }) => /f\(x\) = (.+?)\$/.exec(ex.prompt)![1];
  /** La fonction G est-elle une primitive de f sur ]0 ; +∞[ ? */
  const estPrimitive = (G: string, f: string) => [0.7, 1.3, 2.1].every((x) => Math.abs(d1(G, x) - ev(f, x)) < 1e-4 * (1 + Math.abs(ev(f, x))));

  it('calcule des primitives', () => {
    for (const ex of t('tle-primitive-polynome', 'inverse-carre')) {
      const [y0, x1] = [/F\(1\) = (-?\d+)/, /Calcule \$F\((\d+)\)/].map((r) => Number(r.exec(ex.prompt)![1]));
      expect(valeur(ex), ex.prompt).toBeCloseTo(y0 + integrale(expr(ex), 1, x1), 6);
    }
    for (const ex of t('tle-primitive-polynome', 'condition-ailleurs')) {
      const [, x1, y1] = /F\((-?\d+)\) = (-?\d+)\$/.exec(ex.prompt)!.map(Number);
      expect(valeur(ex), ex.prompt).toBeCloseTo(y1 - integrale(expr(ex), 0, x1), 6);
    }
    for (const ex of t('tle-primitive-forme', 'autres-formes')) {
      if (ex.answer.kind !== 'choice') throw new Error('QCM attendu');
      ex.answer.options.forEach((o, i) => expect(estPrimitive(o.replace(/\$F\(x\) = /, ''), expr(ex)), `${ex.prompt} ${o}`).toBe(i === (ex.answer as { correct: number }).correct));
    }
    for (const ex of t('tle-primitive-forme', 'verifier')) {
      const G = /F\(x\) = (.+?)\$/.exec(ex.prompt)![1];
      expect(optionJuste(ex), ex.prompt).toBe(estPrimitive(G, expr(ex)) ? 'Vrai' : 'Faux');
    }
  });

  it('résout des équations différentielles', () => {
    /** Coefficients a et b de « y' = ay + b » lus dans l'énoncé (forme résolue). */
    const ab = (s: string) => {
      const m = /y' = (-?\d*)y(?: ([+-]) (\d+))?\$/.exec(s)!;
      return [m[1] === '' ? 1 : m[1] === '-' ? -1 : Number(m[1]), m[3] ? Number(m[2] + m[3]) : 0];
    };
    for (const ex of t('tle-equadiff-homogene', 'derivee-en-zero')) {
      const [a] = ab(ex.prompt);
      expect(valeur(ex)).toBe(a * Number(/f\(0\) = (-?\d+)/.exec(ex.prompt)![1]));
    }
    for (const ex of t('tle-equadiff-homogene', 'vrai-faux')) {
      const y = /y\(x\) = (.+?)\$/.exec(ex.prompt)![1];
      const [a] = ab(ex.prompt);
      const ok = [0.2, 0.9].every((x) => Math.abs(d1(y, x) - a * ev(y, x)) < 1e-4 * (1 + Math.abs(ev(y, x))));
      expect(optionJuste(ex), ex.prompt).toBe(ok ? 'Vrai' : 'Faux');
    }
    for (const ex of t('tle-equadiff-constante', 'verifier')) {
      const [a, b] = ab(ex.prompt);
      const v = Number(/y = (-?\d+)\$/.exec(ex.prompt)![1]);
      expect(optionJuste(ex), ex.prompt).toBe(a * v + b === 0 ? 'Vrai' : 'Faux');
    }
    for (const ex of t('tle-equadiff-constante', 'forme-developpee')) {
      const m = /(\d*)y' ([+-]) (\d*)y = (-?\d+)\$/.exec(ex.prompt)!;
      const q = Number(m[2] + (m[3] || '1'));
      expect(q * valeur(ex), ex.prompt).toBeCloseTo(Number(m[4]), 9);
    }
    // Solutions générales : avec C = 1,7, la fonction proposée doit vérifier l'équation (et pas les leurres).
    for (const [nom, lire] of [
      ['forme-developpee', (s: string) => {
        const m = /y' ([+-]) (\d*)y = (-?\d+)\$/.exec(s)!;
        return [-Number(m[1] + (m[2] || '1')), Number(m[3])];
      }],
      ['homogene-signe', (s: string) => {
        const m = /y' ([+-]) (\d*)y = 0\$/.exec(s)!;
        return [-Number(m[1] + (m[2] || '1')), 0];
      }],
    ] as const) {
      for (const ex of t('tle-equadiff-generale', nom)) {
        const [a, b] = lire(ex.prompt);
        if (ex.answer.kind !== 'choice') throw new Error('QCM attendu');
        ex.answer.options.forEach((o, i) => {
          const y = o.replace(/\$y\(x\) = /, '').replace(/C/g, '(1.7)');
          const ok = [0.2, 0.9].every((x) => Math.abs(d1(y, x) - (a * ev(y, x) + b)) < 1e-4 * (1 + Math.abs(ev(y, x))));
          expect(ok, `${ex.prompt} ${o}`).toBe(i === (ex.answer as { correct: number }).correct);
        });
      }
    }
    for (const ex of t('tle-equadiff-condition', 'derivee-initiale')) {
      const [a] = ab(ex.prompt);
      expect(a * valeur(ex)).toBeCloseTo(Number(/y'\(0\) = (-?\d+)/.exec(ex.prompt)![1]), 9);
    }
    for (const ex of t('tle-equadiff-condition', 'limite')) expect(valeur(ex)).toBeCloseTo(ev(/y\(x\) = (.+?)\$/.exec(ex.prompt)![1], 50), 9);
  });
});
