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
