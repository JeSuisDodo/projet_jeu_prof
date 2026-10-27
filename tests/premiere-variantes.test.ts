import { afterEach, describe, expect, it } from 'vitest';
import { PREMIERE } from '../src/content/premiere';
import type { Exercise } from '../src/exercises/types';
import { texEval } from './helpers/texEval';
import { ensemble, nombres, optionJuste, tirages, valeur, variantesDe } from './helpers/variantes';

/** Justesse des variantes d'exercices de 1re spécialité : chaque réponse est recalculée à partir de l'énoncé. */

const skills = PREMIERE.chapters.flatMap((c) => c.skills);
const t = (id: string, nom: string, count?: number) => tirages(skills, id, nom, count);
// Rend la main à la boucle d'événements entre deux tests (voir tests/variantes.test.ts).
afterEach(() => new Promise((resolve) => setTimeout(resolve, 0)));
/** Formule après « f(x) = » (ou d(t) = …), jusqu'au $ fermant. */
const formule = (s: string, nom = 'f', v = 'x') => new RegExp(`${nom}\\(${v}\\) = ([^$]+)\\$`).exec(s)![1].replace(new RegExp(`(?<!\\\\[a-z]*)${v}`, 'g'), 'x');
const f = (tex: string) => (x: number) => texEval(tex, x);
const derivee = (g: (x: number) => number, a: number) => (g(a + 1e-5) - g(a - 1e-5)) / 2e-5;

describe('variantes de 1re', () => {
  it('en propose au moins deux par compétence', () => {
    for (const s of skills) expect(variantesDe([s]).length, s.id).toBeGreaterThanOrEqual(2);
  });
});

describe('variantes de 1re : dérivation', () => {
  it('calcule taux de variation et vitesses', () => {
    for (const ex of t('1re-taux-variation', 'vitesse-moyenne')) {
      const d = f(formule(ex.prompt, 'd', 't'));
      const [t1, t2] = [...ex.prompt.matchAll(/t = (\d+)/g)].map((m) => Number(m[1]));
      expect(valeur(ex)).toBeCloseTo((d(t2) - d(t1)) / (t2 - t1));
    }
    for (const ex of t('1re-taux-variation', 'expression')) {
      const g = f(formule(ex.prompt));
      // a ↦ x, h ↦ y dans l'option.
      const opt = optionJuste(ex).replace(/\$/g, '').replace(/(?<!\\[a-z]*)a/g, 'x').replace(/(?<!\\[a-z]*)h/g, 'y');
      for (const [a, h] of [[1, 2], [-3, 0.5], [2, -1]]) expect(texEval(opt, a, h)).toBeCloseTo((g(a + h) - g(a)) / h);
    }
    for (const ex of t('1re-nombre-derive', 'vitesse-instantanee')) {
      const d = f(formule(ex.prompt, 'd', 't'));
      const t0 = Number(/à \$t = (\d+)\$/.exec(ex.prompt)![1]);
      expect(valeur(ex)).toBeCloseTo(derivee(d, t0), 4);
    }
  });

  it('relie nombre dérivé et tangente', () => {
    for (const ex of t('1re-derive-tangente', 'lire-equation')) {
      const eq = /équation \$y = (.+)\$\. Que/.exec(ex.prompt)![1];
      expect(valeur(ex)).toBeCloseTo(texEval(eq, 1) - texEval(eq, 0));
    }
    for (const ex of t('1re-derive-tangente', 'tangente-horizontale')) expect(derivee(f(formule(ex.prompt)), valeur(ex))).toBeCloseTo(0, 4);
    for (const ex of t('1re-nombre-derive', 'retrouver-coefficient')) {
      const tex = formule(ex.prompt).replace('a', `(${valeur(ex)})`);
      const [, x0, k] = /f'\((-?\d+)\) = (-?\d+)/.exec(ex.prompt)!.map(Number);
      expect(derivee(f(tex), x0)).toBeCloseTo(k, 4);
    }
    for (const ex of t('1re-tangente', 'ordonnee-origine')) {
      const g = f(formule(ex.prompt));
      const a = Number(/en \$x = (-?\d+)\$/.exec(ex.prompt)![1]);
      expect(valeur(ex)).toBeCloseTo(g(a) - a * derivee(g, a), 4);
    }
    for (const ex of t('1re-tangente', 'parallele')) {
      const g = f(formule(ex.prompt));
      const line = /droite \$y = (.+)\$ \?/.exec(ex.prompt)![1];
      expect(derivee(g, valeur(ex))).toBeCloseTo(texEval(line, 1) - texEval(line, 0), 4);
    }
  });

  it('dérive polynômes, produits et inverses', () => {
    for (const ex of t('1re-derivee-polynome', 'vrai-faux')) {
      const g = f(formule(ex.prompt));
      const shown = /f'\(x\) = (.+)\$\.$/.exec(ex.prompt)![1];
      const ok = [-2, 0.5, 1.7].every((x) => Math.abs(derivee(g, x) - texEval(shown, x)) < 1e-3);
      expect(optionJuste(ex), ex.prompt).toBe(ok ? 'Vrai' : 'Faux');
    }
    for (const ex of t('1re-derivee-polynome', 'retrouver-f')) {
      const d = /f'\(x\) = (.+)\$ \?/.exec(ex.prompt)![1];
      const g = f(optionJuste(ex).replace(/^\$f\(x\) = |\$$/g, ''));
      for (const x of [-2, 0.5, 1.7]) expect(derivee(g, x)).toBeCloseTo(texEval(d, x), 3);
    }
    for (const nom of ['produit-en-un-point', 'inverse-en-un-point'])
      for (const ex of t('1re-derivee-operations', nom)) {
        const g = f(formule(ex.prompt));
        const k = Number(/f'\((-?\d+)\)/.exec(ex.prompt)![1]);
        expect(valeur(ex)).toBeCloseTo(derivee(g, k), 4);
      }
  });
});

describe('variantes de 1re : applications de la dérivation', () => {
  /** Valeurs de f' sur une grille fine de [p ; q]. */
  const grille = (p: number, q: number) => Array.from({ length: 201 }, (_, i) => p + ((q - p) * i) / 200);

  it('trouve les points à tangente horizontale', () => {
    for (const ex of t('1re-points-critiques', 'parametre')) {
      const r = Number(/d'abscisse \$(-?\d+)\$/.exec(ex.prompt)![1]);
      const g = f(formule(ex.prompt).replace('m', `(${valeur(ex)})`));
      expect(derivee(g, r)).toBeCloseTo(0, 4);
    }
    for (const ex of t('1re-points-critiques', 'nombre-tangentes-horizontales')) {
      const g = f(formule(ex.prompt));
      // f'(x) = Ax² + Bx + C, retrouvé par différences finies exactes sur un polynôme.
      const [d0, d1, dm] = [derivee(g, 0), derivee(g, 1), derivee(g, -1)];
      const A = (d1 + dm - 2 * d0) / 2;
      const B = (d1 - dm) / 2;
      const delta = Math.round(B * B - 4 * A * d0);
      expect(valeur(ex), ex.prompt).toBe(delta > 0 ? 2 : delta === 0 ? 1 : 0);
    }
    for (const ex of t('1re-points-critiques', 'vrai-faux-extremum')) {
      const g = f(formule(ex.prompt));
      const a = Number(/f'\((-?\d+)\) = 0/.exec(ex.prompt)![1]);
      const extremum = (g(a - 0.1) - g(a)) * (g(a + 0.1) - g(a)) > 0;
      expect(optionJuste(ex)).toBe(extremum ? 'Vrai' : 'Faux');
    }
  });

  it('étudie les variations', () => {
    for (const ex of t('1re-variations', 'croissante-sur')) {
      const g = f(formule(ex.prompt));
      const [p, q] = /\[(-?\d+)\\,;\\,(-?\d+)\]/.exec(ex.prompt)!.slice(1).map(Number);
      const ok = grille(p, q).every((x) => derivee(g, x) >= -1e-6);
      expect(optionJuste(ex), ex.prompt).toBe(ok ? 'Vrai' : 'Faux');
    }
    for (const ex of t('1re-variations', 'second-degre')) {
      const g = f(formule(ex.prompt));
      const sommet = -derivee(g, 0) / (derivee(g, 1) - derivee(g, 0));
      const croissante = (x: number) => derivee(g, x) > 0;
      const opt = optionJuste(ex);
      expect(opt).toMatch(new RegExp(`${Math.round(sommet)}`));
      expect(croissante(sommet + 1)).toBe(opt.startsWith('$['));
    }
    for (const ex of t('1re-variations', 'signe-derivee')) {
      const g = f(formule(ex.prompt));
      const x0 = Number(/f'\((-?\d+)\)/.exec(ex.prompt)![1]);
      expect(optionJuste(ex)).toBe(derivee(g, x0) > 0 ? 'croissante' : 'décroissante');
    }
  });

  it('trouve les extremums', () => {
    for (const ex of t('1re-extremum-local', 'nature')) {
      const d = f(/f'\(x\) = (.+)\$\. En/.exec(ex.prompt)![1]);
      const a = Number(/En \$x = (-?\d+)\$/.exec(ex.prompt)![1]);
      const [avant, apres] = [d(a - 0.01), d(a + 0.01)];
      expect(optionJuste(ex)).toBe(avant > 0 && apres < 0 ? 'un maximum local' : avant < 0 && apres > 0 ? 'un minimum local' : 'ni maximum ni minimum');
    }
    for (const ex of t('1re-extremum-local', 'second-degre')) {
      const g = f(formule(ex.prompt));
      const xs = grille(-10, 10);
      const vals = xs.map(g);
      expect(valeur(ex)).toBeCloseTo(ex.prompt.includes('minimum') ? Math.min(...vals) : Math.max(...vals), 6);
    }
    for (const ex of t('1re-extremum-local', 'sur-un-segment')) {
      const g = f(formule(ex.prompt));
      const [p, q] = /\[(-?\d+)\\,;\\,(-?\d+)\]/.exec(ex.prompt)!.slice(1).map(Number);
      // Les extremums tombent sur des entiers : la grille des entiers de [p ; q] suffit.
      const vals = Array.from({ length: q - p + 1 }, (_, i) => g(p + i));
      expect(valeur(ex)).toBe(ex.prompt.includes('maximum') ? Math.max(...vals) : Math.min(...vals));
    }
  });

  it('dérive f(ax + b)', () => {
    for (const ex of t('1re-derivee-composee', 'nombre-derive')) {
      const g = f(formule(ex.prompt, 'g'));
      const x0 = Number(/g'\((-?\d+)\)/.exec(ex.prompt)![1]);
      expect(valeur(ex)).toBeCloseTo(derivee(g, x0), 4);
    }
    for (const ex of t('1re-derivee-composee', 'vrai-faux')) {
      const g = f(/g\(x\) = (.+)\$ est/.exec(ex.prompt)![1]);
      const shown = f(/g'\(x\) = (.+)\$\.$/.exec(ex.prompt)![1]);
      const ok = [-1.3, 0.4, 2.2].every((x) => Math.abs(derivee(g, x) - shown(x)) < 1e-3 * Math.max(1, Math.abs(shown(x))));
      expect(optionJuste(ex), ex.prompt).toBe(ok ? 'Vrai' : 'Faux');
    }
    for (const ex of t('1re-derivee-composee', 'racine-en-un-point')) {
      const g = f(formule(ex.prompt, 'g'));
      const x0 = Number(/g'\((-?\d+)\)/.exec(ex.prompt)![1]);
      expect(valeur(ex)).toBeCloseTo(derivee(g, x0), 5);
    }
  });

  it('résout les problèmes d’optimisation', () => {
    const argmax = (g: (x: number) => number, lo: number, hi: number) => {
      const xs = Array.from({ length: Math.round((hi - lo) * 100) + 1 }, (_, i) => lo + i / 100);
      return xs.reduce((best, x) => (g(x) > g(best) ? x : best), lo);
    };
    for (const ex of t('1re-optimisation', 'enclos')) {
      const L = nombres(ex.prompt)[0];
      expect(valeur(ex)).toBeCloseTo(argmax((x) => x * (L - 2 * x), 0, L / 2), 2);
    }
    for (const ex of t('1re-optimisation', 'boite')) {
      const c = nombres(ex.prompt)[0];
      expect(valeur(ex)).toBeCloseTo(argmax((x) => x * (c - 2 * x) ** 2, 0, c / 2), 2);
    }
    for (const ex of t('1re-optimisation', 'produit-maximal')) {
      const S = nombres(ex.prompt)[0];
      const x = argmax((v) => v * (S - v), 0, S);
      expect(valeur(ex)).toBeCloseTo(x * (S - x), 6);
    }
  });
});

describe('variantes de 1re : exponentielle', () => {
  /** Évalue les deux membres d'une égalité « A = B » écrite en LaTeX. */
  const membres = (tex: string, x = 0) => {
    const [a, b] = tex.split(' = ');
    return [texEval(a, x), texEval(b, x)];
  };
  const egaux = (u: number, v: number) => Math.abs(u - v) <= 1e-9 * Math.max(1, Math.abs(u), Math.abs(v));

  it('applique les propriétés algébriques', () => {
    for (const ex of t('1re-exp-proprietes', 'vrai-faux')) {
      const [a, b] = membres(/\$(.+)\$\.$/.exec(ex.prompt)![1]);
      expect(optionJuste(ex), ex.prompt).toBe(egaux(a, b) ? 'Vrai' : 'Faux');
    }
    for (const ex of t('1re-exp-proprietes', 'exposant-inconnu')) {
      const [a, b] = membres(/vérifie \$(.+)\$ \?/.exec(ex.prompt)![1].replace('e^{k}', `e^{${valeur(ex)}}`));
      expect(egaux(a, b), ex.prompt).toBe(true);
    }
    for (const ex of t('1re-exp-proprietes', 'simplifier-en-x')) {
      const expr = /A\(x\) = (.+)\$\.$/.exec(ex.prompt)![1];
      const opt = optionJuste(ex).replace(/^\$A\(x\) = |\$$/g, '');
      for (const x of [-1.2, 0.3, 0.9]) expect(egaux(texEval(expr, x), texEval(opt, x)), ex.prompt).toBe(true);
    }
  });

  it('résout équations et inéquations', () => {
    const solutions = (ex: Exercise) => (ex.answer.kind === 'set' ? ex.answer.values.map((v) => v.n / v.d) : []);
    for (const ex of t('1re-exp-equation', 'produit-nul')) {
      const lhs = /équation \$(.+) = 0\$/.exec(ex.prompt)![1];
      for (const x of solutions(ex)) expect(texEval(lhs, x)).toBeCloseTo(0, 9);
    }
    for (const ex of t('1re-exp-equation', 'second-degre')) {
      const rhs = /\$e\^\{x\^2\} = (.+)\$\.$/.exec(ex.prompt)![1];
      const g = (x: number) => Math.round(x * x - Math.log(texEval(rhs, x)));
      // Polynôme unitaire de degré 2 : ses racines entières sont toutes dans [-15 ; 15].
      const racines = Array.from({ length: 31 }, (_, i) => i - 15).filter((x) => g(x) === 0);
      expect(solutions(ex)).toEqual(racines);
    }
    for (const ex of t('1re-exp-equation', 'inverse')) {
      const [x] = solutions(ex);
      const [a, b] = membres(/équation \$(.+)\$\.$/.exec(ex.prompt)![1], x);
      expect(egaux(a, b), ex.prompt).toBe(true);
    }
    for (const ex of t('1re-exp-inequation', 'vrai-faux')) {
      const m = /^Vrai ou faux : pour tout (réel \$x\$|\$x \\geq 0\$), \$(.+) (>|\\geq|\\leq) (.+)\$\.$/.exec(ex.prompt)!;
      const xs = Array.from({ length: 241 }, (_, i) => -6 + i / 20).filter((x) => m[1].startsWith('réel') || x >= 0);
      const ok = xs.every((x) => {
        const [a, b] = [texEval(m[2], x), texEval(m[4], x)];
        return m[3] === '>' ? a > b : m[3] === '\\geq' ? a >= b - 1e-12 : a <= b + 1e-12;
      });
      expect(optionJuste(ex), ex.prompt).toBe(ok ? 'Vrai' : 'Faux');
    }
    for (const ex of t('1re-exp-inequation', 'plus-petit-entier')) {
      const [lhs, rhs] = /tel que \$(.+) > (.+)\$ \?/.exec(ex.prompt)!.slice(1);
      const ok = (n: number) => texEval(lhs.replace(/n/g, `(${n})`), 0) > texEval(rhs, 0);
      expect(ok(valeur(ex)) && !ok(valeur(ex) - 1), ex.prompt).toBe(true);
    }
  });

  it('dérive et étudie', () => {
    for (const ex of t('1re-exp-derivee', 'nombre-derive-en-0')) expect(valeur(ex)).toBeCloseTo(derivee(f(formule(ex.prompt)), 0), 4);
    for (const ex of t('1re-exp-derivee', 'tangente-en-0')) {
      const g = f(formule(ex.prompt));
      const line = optionJuste(ex).replace(/^\$y = |\$$/g, '');
      expect(texEval(line, 0)).toBeCloseTo(g(0), 9);
      expect(texEval(line, 1) - texEval(line, 0)).toBeCloseTo(derivee(g, 0), 4);
    }
    for (const ex of t('1re-exp-extremum', 'croissante-sur')) {
      const g = f(formule(ex.prompt));
      const dans = ensemble(optionJuste(ex), (s) => texEval(s, 0));
      for (const x of Array.from({ length: 81 }, (_, i) => -10 + i / 4 + 0.01)) expect(dans(x), `${ex.prompt} x = ${x}`).toBe(derivee(g, x) > 0);
    }
    for (const ex of t('1re-exp-extremum', 'valeur-minimum')) {
      const g = f(formule(ex.prompt));
      const min = Math.min(...Array.from({ length: 2001 }, (_, i) => g(-10 + i / 100)));
      expect(texEval(optionJuste(ex).replace(/\$/g, ''), 0)).toBeCloseTo(min, 6);
    }
  });
});

describe('variantes de 1re : géométrie repérée', () => {
  /** Coefficients (a, b, c) d'une droite « ax + by + c = 0 ». */
  const coefs = (tex: string) => {
    const L = (x: number, y: number) => texEval(tex.replace(/ = 0$/, ''), x, y);
    return [L(1, 0) - L(0, 0), L(0, 1) - L(0, 0), L(0, 0)];
  };
  const droites = (s: string) => [...s.matchAll(/d'? : ([^$]+ = 0)\$/g)].map((m) => coefs(m[1]));
  const vecteurs = (s: string) => [...s.matchAll(/\\begin\{pmatrix\} (-?\w+) \\\\ (-?\d+) \\end\{pmatrix\}/g)].map((m) => [Number(m[1]), Number(m[2])]);
  const pointsDe = (s: string) => Object.fromEntries([...s.matchAll(/(A|B|M|\\Omega)\((-?\d+)\\,;\\,(-?\d+)\)/g)].map((m) => [m[1], [Number(m[2]), Number(m[3])]]));
  /** Membre de gauche d'un cercle, moins le second membre : nul sur le cercle. */
  const cercle = (s: string) => {
    const [lhs, rhs] = /équation \$(.+)\$/.exec(s)![1].split(' = ');
    return (x: number, y: number) => texEval(lhs, x, y) - texEval(rhs.replace(/k$/, '0'), x, y);
  };
  const paire = (ex: Exercise) => (ex.answer.kind === 'pair' ? ex.answer.values.map((v) => v.n / v.d) : []);

  it('lit vecteurs normaux et directeurs', () => {
    for (const ex of t('1re-geo-vecteur-normal', 'vecteur-directeur')) {
      const [[a, b]] = droites(ex.prompt);
      const [[ux, uy]] = vecteurs(optionJuste(ex));
      expect(a * ux + b * uy).toBeCloseTo(0, 9);
    }
    for (const ex of t('1re-geo-vecteur-normal', 'vrai-faux')) {
      const [[a, b]] = droites(ex.prompt);
      const [[p, q]] = vecteurs(ex.prompt);
      expect(optionJuste(ex)).toBe(p * b - q * a === 0 ? 'Vrai' : 'Faux');
    }
    for (const ex of t('1re-geo-vecteur-normal', 'parametre')) {
      const [[a, b]] = droites(ex.prompt);
      const q = Number(/pmatrix\} m \\\\ (-?\d+)/.exec(ex.prompt)![1]);
      expect(valeur(ex) * b - q * a).toBeCloseTo(0, 9);
    }
  });

  it('écrit des équations de droites', () => {
    for (const ex of t('1re-geo-equation-normale', 'mediatrice')) {
      const { A, B } = pointsDe(ex.prompt);
      const [a, b] = [B[0] - A[0], B[1] - A[1]];
      const L = (x: number, y: number) => a * x + b * y + valeur(ex);
      // Équidistance : tout point de la droite est à même distance de A et B ; on teste le milieu.
      expect(L((A[0] + B[0]) / 2, (A[1] + B[1]) / 2)).toBeCloseTo(0, 9);
    }
    for (const ex of t('1re-geo-equation-normale', 'tangente-cercle')) {
      const { A } = pointsDe(ex.prompt);
      const O = pointsDe(ex.prompt)['\\Omega'];
      expect((A[0] - O[0]) * A[0] + (A[1] - O[1]) * A[1] + valeur(ex)).toBeCloseTo(0, 9);
    }
    for (const ex of t('1re-geo-equation-normale', 'point-sur-droite')) {
      const [[a, b, c]] = droites(ex.prompt);
      const x0 = Number(/A\((-?\d+)\\,;\\,y\)/.exec(ex.prompt)![1]);
      expect(a * x0 + b * valeur(ex) + c).toBeCloseTo(0, 9);
    }
    for (const ex of t('1re-geo-perpendiculaire', 'vrai-faux')) {
      const [[a, b], [p, q]] = droites(ex.prompt);
      expect(optionJuste(ex)).toBe(a * p + b * q === 0 ? 'Vrai' : 'Faux');
    }
    for (const ex of t('1re-geo-perpendiculaire', 'parametre')) {
      const dp = /d' : (.+ = 0)\$ est/.exec(ex.prompt)![1].replace('m', `(${valeur(ex)})`);
      const [[p, q]] = [coefs(dp)];
      const [[a, b]] = droites(ex.prompt.slice(ex.prompt.indexOf('perpendiculaire')));
      expect(a * p + b * q).toBeCloseTo(0, 9);
    }
  });

  it('étudie des cercles', () => {
    for (const ex of t('1re-geo-cercle-centre', 'rayon')) {
      const g = cercle(ex.prompt);
      // Le minimum de g est atteint au centre et vaut -r².
      const xs = Array.from({ length: 21 }, (_, i) => i - 10);
      const min = Math.min(...xs.flatMap((x) => xs.map((y) => g(x, y))));
      expect(valeur(ex) ** 2).toBe(-min);
    }
    for (const ex of t('1re-geo-cercle-centre', 'point-sur-cercle')) {
      const { A } = pointsDe(ex.prompt);
      expect(optionJuste(ex)).toBe(cercle(ex.prompt)(A[0], A[1]) === 0 ? 'Vrai' : 'Faux');
    }
    for (const ex of t('1re-geo-cercle-centre', 'est-un-cercle')) {
      const eq = /tels que \$(.+) = 0\$/.exec(ex.prompt)![1];
      const xs = Array.from({ length: 21 }, (_, i) => i - 10);
      const min = Math.min(...xs.flatMap((x) => xs.map((y) => texEval(eq, x, y))));
      expect(optionJuste(ex), ex.prompt).toBe(min < 0 ? 'Vrai' : 'Faux');
    }
    for (const ex of t('1re-geo-cercle-rayon', 'tangent-axe')) {
      const O = pointsDe(ex.prompt)['\\Omega'];
      const r = ex.prompt.includes('abscisses') ? O[1] : O[0];
      expect(valeur(ex)).toBe(r * r);
    }
    for (const ex of t('1re-geo-cercle-rayon', 'centre-diametre')) {
      const { A, B } = pointsDe(ex.prompt);
      expect(paire(ex)).toEqual([(A[0] + B[0]) / 2, (A[1] + B[1]) / 2]);
    }
    for (const ex of t('1re-geo-cercle-rayon', 'intersection-axe')) {
      const g = cercle(ex.prompt);
      // g(x, 0) est un trinôme unitaire en x : on compte ses racines avec le discriminant.
      const [g0, g1, gm] = [g(0, 0), g(1, 0), g(-1, 0)];
      const B = (g1 - gm) / 2;
      const delta = B * B - 4 * g0;
      expect(valeur(ex)).toBe(delta > 0 ? 2 : delta === 0 ? 1 : 0);
    }
  });

  it('calcule projetés et distances', () => {
    for (const ex of t('1re-geo-distance-droite', 'projete')) {
      const [[a, b, c]] = droites(ex.prompt);
      const { M } = pointsDe(ex.prompt);
      const [hx, hy] = paire(ex);
      expect(a * hx + b * hy + c).toBeCloseTo(0, 9);
      expect((M[0] - hx) * b - (M[1] - hy) * a).toBeCloseTo(0, 9);
    }
    for (const ex of t('1re-geo-distance-droite', 'droites-paralleles')) {
      const [[a, b, c], [, , c2]] = droites(ex.prompt);
      expect(valeur(ex)).toBeCloseTo(Math.abs(c - c2) / Math.hypot(a, b), 9);
    }
  });
});
