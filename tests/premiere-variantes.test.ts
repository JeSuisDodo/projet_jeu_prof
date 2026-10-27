import { afterEach, describe, expect, it } from 'vitest';
import { PREMIERE } from '../src/content/premiere';
import type { Exercise } from '../src/exercises/types';
import { texEval } from './helpers/texEval';
import { ensemble, lireNombre, nombres, optionJuste, tirages, valeur, variantesDe } from './helpers/variantes';

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

describe('variantes de 1re : probabilités conditionnelles', () => {
  const pcts = (s: string) => [...s.matchAll(/\$(\d+)\\,\\%\$/g)].map((m) => Number(m[1]) / 100);
  /** Probabilités écrites « $P(…) = 0{,}35$ », par nom d'événement. */
  const probas = (s: string) => Object.fromEntries([...s.matchAll(/(P(?:_\{[^}]+\})?\([^)]+\)) = (\d+(?:\{,\}\d+)?)\$/g)].map((m) => [m[1], lireNombre(m[2])]));
  const entiers = (s: string) => [...s.matchAll(/\$(\d+)\$/g)].map((m) => Number(m[1]));
  const proche = (ex: Exercise, v: number) => expect(valeur(ex), ex.prompt).toBeCloseTo(v, 10);

  it('lit des effectifs', () => {
    for (const ex of t('1re-proba-tableau', 'urne')) {
      const [, r1, , b1] = entiers(ex.prompt);
      proche(ex, r1 / (r1 + b1));
    }
    for (const ex of t('1re-proba-tableau', 'effectifs')) {
      const [, nAB, , nnAB] = entiers(ex.prompt);
      proche(ex, nAB / (nAB + nnAB));
    }
    for (const ex of t('1re-proba-tableau', 'vrai-faux')) {
      const cells = /\\hline A & (\d+) & (\d+) & \d+ \\\\ \\hline \\overline\{A\} & (\d+) & (\d+)/.exec(ex.prompt)!.slice(1).map(Number);
      const [ab, anb, nab] = cells;
      expect(optionJuste(ex)).toBe(ab / (ab + anb) === ab / (ab + nab) ? 'Vrai' : 'Faux');
    }
  });

  it('calcule intersections et probabilités totales', () => {
    for (const ex of t('1re-proba-intersection', 'situation')) {
      const [a, b] = pcts(ex.prompt);
      proche(ex, a * b);
    }
    for (const ex of t('1re-proba-intersection', 'retrouver-conditionnelle')) {
      const p = probas(ex.prompt);
      proche(ex, p['P(A \\cap B)'] / p['P(A)']);
    }
    for (const ex of t('1re-proba-intersection', 'retrouver-pa')) {
      const p = probas(ex.prompt);
      proche(ex, p['P(A \\cap B)'] / p['P_{A}(B)']);
    }
    for (const ex of t('1re-proba-totales', 'depistage')) {
      const [a, b, c] = pcts(ex.prompt);
      proche(ex, a * b + (1 - a) * c);
    }
    for (const ex of t('1re-proba-totales', 'trois-machines')) {
      const [p1, p2, d1, d2, d3] = pcts(ex.prompt);
      proche(ex, p1 * d1 + p2 * d2 + (1 - p1 - p2) * d3);
    }
    for (const ex of t('1re-proba-totales', 'retrouver-branche')) {
      const p = probas(ex.prompt);
      // Probabilités totales avec l'inconnue remplacée par la réponse.
      expect(p['P(A)'] * p['P_{A}(B)'] + (1 - p['P(A)']) * valeur(ex)).toBeCloseTo(p['P(B)'], 10);
    }
  });

  it('inverse les conditionnements', () => {
    for (const ex of t('1re-proba-inversion', 'depistage')) {
      const [a, b, c] = pcts(ex.prompt);
      proche(ex, (a * b) / (a * b + (1 - a) * c));
    }
    for (const ex of t('1re-proba-inversion', 'trois-machines')) {
      const [p1, p2, d1, d2, d3] = pcts(ex.prompt);
      const parts = [p1 * d1, p2 * d2, (1 - p1 - p2) * d3];
      const k = Number(/de la machine (\d)/.exec(ex.prompt)![1]) - 1;
      proche(ex, parts[k] / (parts[0] + parts[1] + parts[2]));
    }
  });

  it('utilise l’indépendance', () => {
    for (const ex of t('1re-proba-independance', 'reunion')) {
      const p = probas(ex.prompt);
      proche(ex, p['P(A)'] + p['P(B)'] - p['P(A)'] * p['P(B)']);
    }
    for (const ex of t('1re-proba-independance', 'contraire')) {
      const p = probas(ex.prompt);
      proche(ex, p['P(A)'] * (1 - p['P(B)']));
    }
    const evenements: Record<string, (n: number) => boolean> = {
      pair: (n) => n % 2 === 0,
      impair: (n) => n % 2 === 1,
      'un multiple de 3': (n) => n % 3 === 0,
      'au plus 2': (n) => n <= 2,
      'au plus 4': (n) => n <= 4,
      premier: (n) => [2, 3, 5].includes(n),
      'au moins 5': (n) => n >= 5,
    };
    for (const ex of t('1re-proba-independance', 'de')) {
      const [A, B] = [...ex.prompt.matchAll(/« le nombre est (.+?) »/g)].map((m) => evenements[m[1]]);
      const faces = [1, 2, 3, 4, 5, 6];
      const n = (e: (k: number) => boolean) => faces.filter(e).length;
      const ok = n((k) => A(k) && B(k)) * 6 === n(A) * n(B);
      expect(optionJuste(ex).startsWith('Oui')).toBe(ok);
    }
  });
});

describe('variantes de 1re : produit scalaire', () => {
  const vecs = (s: string) => [...s.matchAll(/\\begin\{pmatrix\} (-?\w+) \\\\ (-?\d+) \\end\{pmatrix\}/g)].map((m) => [Number(m[1]), Number(m[2])]);
  const pts = (s: string) => Object.fromEntries([...s.matchAll(/([A-Z])\((-?\d+)\\,;\\,(-?\d+)\)/g)].map((m) => [m[1], [Number(m[2]), Number(m[3])]]));
  const egalites = (s: string) => Object.fromEntries([...s.matchAll(/\$([^$]+?) = (-?\d+)\$/g)].map((m) => [m[1], Number(m[2])]));
  const dot = (u: number[], v: number[]) => u[0] * v[0] + u[1] * v[1] + 0;
  const sub = (p: number[], q: number[]) => [q[0] - p[0], q[1] - p[1]];
  const nature = (d: number) => (d > 0 ? 'aigu' : d === 0 ? 'droit' : 'obtus');
  const U = '\\|\\vec{u}\\|';
  const V = '\\|\\vec{v}\\|';
  const UV = '\\vec{u} \\cdot \\vec{v}';

  it('calcule avec les coordonnées', () => {
    for (const ex of t('1re-ps-coordonnees', 'points')) {
      const { A, B, C } = pts(ex.prompt);
      expect(valeur(ex)).toBe(dot(sub(A, B), sub(A, C)));
    }
    for (const ex of t('1re-ps-coordonnees', 'norme-somme')) {
      const [u, v] = vecs(ex.prompt);
      const w = ex.prompt.includes('\\vec{u} -') ? [u[0] - v[0], u[1] - v[1]] : [u[0] + v[0], u[1] + v[1]];
      expect(valeur(ex)).toBe(dot(w, w));
    }
    for (const ex of t('1re-ps-coordonnees', 'vrai-faux-orthogonaux')) {
      const [u, v] = vecs(ex.prompt);
      expect(optionJuste(ex)).toBe(dot(u, v) === 0 ? 'Vrai' : 'Faux');
    }
    for (const ex of t('1re-ps-orthogonal', 'triangle-rectangle')) {
      const { A, B, C } = pts(ex.prompt);
      expect(optionJuste(ex)).toBe(dot(sub(A, B), sub(A, C)) === 0 ? 'Vrai' : 'Faux');
    }
    for (const ex of t('1re-ps-orthogonal', 'deux-valeurs')) {
      const [[, a], [, b]] = vecs(ex.prompt);
      if (ex.answer.kind !== 'set') throw new Error('ensemble attendu');
      const ms = ex.answer.values.map((v) => v.n / v.d);
      for (const m of ms) expect(m * m + a * b).toBe(0);
      expect(ms.length).toBe(2);
    }
  });

  it('utilise normes, angles et Al-Kashi', () => {
    for (const ex of t('1re-ps-norme-angle', 'nature-angle')) expect(optionJuste(ex)).toBe(nature(egalites(ex.prompt)[UV]));
    for (const ex of t('1re-ps-norme-angle', 'cosinus')) {
      const e = egalites(ex.prompt);
      expect(valeur(ex)).toBeCloseTo(e[UV] / (e[U] * e[V]), 12);
    }
    for (const ex of t('1re-ps-norme-angle', 'norme-inconnue')) {
      const nv = egalites(ex.prompt)[V];
      const angle = texEval(/mesure \$(.+?)\$/.exec(ex.prompt)![1], 0);
      const d = texEval(/\\cdot \\vec\{v\} = (.+?)\$/.exec(ex.prompt)![1], 0);
      expect(valeur(ex) * nv * Math.cos(angle)).toBeCloseTo(d, 9);
    }
    const cotes = (s: string) => /AB = (\d+)\$, \$AC = (\d+)\$ et \$BC = (\d+)/.exec(s)!.slice(1).map(Number);
    for (const ex of t('1re-ps-al-kashi', 'cosinus-angle')) {
      const [c, b, a] = cotes(ex.prompt);
      expect(valeur(ex)).toBeCloseTo((b * b + c * c - a * a) / (2 * b * c), 12);
      expect(a < b + c && b < a + c && c < a + b).toBe(true);
    }
    for (const ex of t('1re-ps-al-kashi', 'nature-triangle')) {
      const [c, b, a] = cotes(ex.prompt);
      expect(optionJuste(ex)).toBe(nature(b * b + c * c - a * a));
    }
    for (const ex of t('1re-ps-polarisation', 'somme-et-difference')) {
      const e = egalites(ex.prompt);
      expect(valeur(ex)).toBe((e['\\|\\vec{u} + \\vec{v}\\|^2'] - e['\\|\\vec{u} - \\vec{v}\\|^2']) / 4);
    }
    for (const ex of t('1re-ps-polarisation', 'norme-de-la-somme')) {
      const e = egalites(ex.prompt);
      const s = ex.prompt.includes('\\vec{u} - \\vec{v}') ? -1 : 1;
      expect(valeur(ex)).toBe(e[U] ** 2 + e[V] ** 2 + 2 * s * e[UV]);
    }
  });

  it('calcule dans des figures', () => {
    const produit = (ex: Exercise, P: Record<string, number[]>) => {
      const [p, q] = [...ex.prompt.matchAll(/\\overrightarrow\{(\w\w)\}/g)].map((m) => sub(P[m[1][0]], P[m[1][1]]));
      return dot(p, q);
    };
    for (const ex of t('1re-ps-figure', 'triangle-equilateral')) {
      const a = Number(/de côté \$(\d+)\$/.exec(ex.prompt)![1]);
      const P = { A: [0, 0], B: [a, 0], C: [a / 2, (a * Math.sqrt(3)) / 2] };
      expect(valeur(ex)).toBeCloseTo(produit(ex, P), 9);
    }
    for (const ex of t('1re-ps-figure', 'milieu')) {
      const [L, l] = /AB = (\d+)\$ et \$AD = (\d+)/.exec(ex.prompt)!.slice(1).map(Number);
      const P = { A: [0, 0], B: [L, 0], C: [L, l], D: [0, l], I: [L / 2, l] };
      expect(valeur(ex)).toBe(produit(ex, P));
    }
  });
});

describe('variantes de 1re : suites arithmétiques et géométriques', () => {
  const entiers = (s: string) => [...s.matchAll(/\$(-?\d+)\$/g)].map((m) => Number(m[1]));
  /** Indices et valeurs « u_{n} = v » (ou u_n, u_0). */
  const termes = (s: string) => [...s.matchAll(/u_\{?(\d+)\}? = (-?\d+)/g)].map((m) => [Number(m[1]), Number(m[2])]);
  const raison = (s: string) => Number(/raison \$(-?\d+)\$/.exec(s)![1]);

  it('calcule des termes', () => {
    for (const ex of t('1re-arith-terme', 'salaire')) {
      const [s0, r] = entiers(ex.prompt);
      const n = Number(/la (\d+)e année/.exec(ex.prompt)![1]);
      let s = s0;
      for (let k = 2; k <= n; k++) s += r;
      expect(valeur(ex)).toBe(s);
    }
    for (const ex of t('1re-arith-terme', 'rang')) {
      const [[, u0]] = termes(ex.prompt);
      const cible = Number(/u_n = (-?\d+)/.exec(ex.prompt)![1]);
      expect(u0 + valeur(ex) * raison(ex.prompt)).toBe(cible);
    }
    for (const ex of t('1re-arith-terme', 'premier-terme')) {
      const [[n, un]] = termes(ex.prompt);
      expect(valeur(ex) + n * raison(ex.prompt)).toBe(un);
    }
    for (const ex of t('1re-geo-terme', 'interets')) {
      const [c] = entiers(ex.prompt);
      const taux = Number(/taux annuel de \$(\d+)/.exec(ex.prompt)![1]);
      const n = Number(/au bout de (\d) ans/.exec(ex.prompt)![1]);
      expect(valeur(ex)).toBeCloseTo(c * (1 + taux / 100) ** n, 6);
    }
    for (const ex of t('1re-geo-terme', 'premier-terme')) {
      const [[n, un]] = termes(ex.prompt);
      expect(valeur(ex) * raison(ex.prompt) ** n).toBe(un);
    }
  });

  it('trouve des raisons', () => {
    for (const ex of t('1re-arith-raison', 'theatre')) {
      const [a, m] = entiers(ex.prompt);
      const k = Number(/Le (\d+)e rang/.exec(ex.prompt)![1]);
      expect(a + (k - 1) * valeur(ex)).toBe(m);
    }
    for (const ex of t('1re-arith-raison', 'trois-termes')) {
      const [a, b] = entiers(ex.prompt);
      expect(valeur(ex) - a).toBe(b - valeur(ex));
    }
    for (const ex of t('1re-geo-raison', 'pourcentage')) {
      const taux = Number(/de \$(\d+)\\,\\%/.exec(ex.prompt)![1]);
      // 1000 habitants la première année : l'année suivante, 1000 × q.
      const suivant = ex.prompt.includes('augmente') ? 1000 + 10 * taux : 1000 - 10 * taux;
      expect(1000 * valeur(ex)).toBeCloseTo(suivant, 9);
    }
    for (const ex of t('1re-geo-raison', 'trois-termes')) {
      const [a, b] = entiers(ex.prompt);
      expect(valeur(ex) / a).toBeCloseTo(b / valeur(ex), 12);
      expect(valeur(ex)).toBeGreaterThan(0);
    }
  });

  it('calcule des sommes', () => {
    const somme = (n: number, terme: (k: number) => number) => Array.from({ length: n }, (_, k) => terme(k)).reduce((s, v) => s + v, 0);
    for (const ex of t('1re-arith-somme', 'impairs')) {
      const last = Number(/\\dots \+ (\d+)\$/.exec(ex.prompt)![1]);
      expect(valeur(ex)).toBe(somme((last + 1) / 2, (k) => 2 * k + 1));
    }
    for (const ex of t('1re-arith-somme', 'theatre')) {
      const [a, r, k] = entiers(ex.prompt);
      expect(valeur(ex)).toBe(somme(k, (i) => a + i * r));
    }
    for (const ex of t('1re-geo-somme', 'grains')) {
      const [a] = entiers(ex.prompt);
      const q = ex.prompt.includes('deux fois') ? 2 : 3;
      const n = Number(/au bout de (\d+) jours/.exec(ex.prompt)![1]);
      expect(valeur(ex)).toBe(somme(n, (k) => a * q ** k));
    }
    for (const ex of t('1re-geo-somme', 'moities')) {
      const last = Number(/\\frac\{1\}\{(\d+)\}\$ \(/.exec(ex.prompt)![1]);
      expect(valeur(ex)).toBeCloseTo(somme(Math.log2(last) + 1, (k) => 1 / 2 ** k), 12);
    }
  });

  it('reconnaît la nature d’une suite', () => {
    for (const ex of t('1re-suite-nature', 'premiers-termes')) {
      const u = entiers(ex.prompt);
      const d = u.slice(1).map((v, i) => v - u[i]);
      const arith = d.every((v) => v === d[0]);
      const geo = u.every((v) => v !== 0) && u.slice(1).every((v, i) => v * u[0] === u[1] * u[i]);
      expect(optionJuste(ex)).toBe(arith ? 'Arithmétique' : geo ? 'Géométrique' : 'Ni l’une ni l’autre');
    }
    for (const ex of t('1re-suite-nature', 'suite-auxiliaire')) {
      const [[, u0]] = termes(ex.prompt);
      const rec = /u_\{n\+1\} = (.+?)\$/.exec(ex.prompt)![1];
      const next = (u: number) => texEval(rec.replace('u_n', `(${u})`), 0);
      const c = valeur(ex);
      const v = [u0, next(u0), next(next(u0))].map((x) => x - c);
      expect(v[1] * v[1]).toBeCloseTo(v[0] * v[2], 9);
    }
  });
});

describe('variantes de 1re : suites numériques', () => {
  const formuleU = (s: string) => /u_n = (.+?)\$/.exec(s)![1];
  const u = (s: string) => (n: number) => texEval(formuleU(s).replace(/n/g, `(${n})`), 0);
  const suite = (s: string, nb = 40) => {
    const u0 = Number(/u_0 = (-?\d+)/.exec(s)![1]);
    const rec = /u_\{n\+1\} = (.+?)\$/.exec(s)![1];
    const termes = [u0];
    for (let n = 0; n < nb; n++) termes.push(texEval(rec.replace(/u_n/g, `(${termes[n]})`).replace(/n/g, `(${n})`), 0));
    return termes;
  };
  const sens = (v: number[]) => {
    const d = v.slice(1).map((x, i) => x - v[i]);
    return d.every((x) => x > 0) ? 'Croissante' : d.every((x) => x < 0) ? 'Décroissante' : 'Ni croissante ni décroissante';
  };

  it('calcule des termes', () => {
    for (const ex of t('1re-suite-explicite', 'fraction')) {
      const k = Number(/u_\{(\d+)\}/.exec(ex.prompt)![1]);
      expect(valeur(ex)).toBeCloseTo(u(ex.prompt)(k), 12);
    }
    for (const ex of t('1re-suite-explicite', 'retrouver-rang')) {
      const v = Number(/u_n = (-?\d+)\$ \?/.exec(ex.prompt)![1]);
      const g = u(ex.prompt);
      const rangs = Array.from({ length: 100 }, (_, n) => n).filter((n) => g(n) === v);
      expect(rangs).toEqual([valeur(ex)]);
    }
    for (const ex of t('1re-suite-explicite', 'somme-des-premiers')) {
      const g = u(ex.prompt);
      expect(valeur(ex)).toBe(g(0) + g(1) + g(2) + g(3));
    }
    for (const ex of t('1re-suite-recurrente', 'remonter')) {
      const termes = suite(ex.prompt.replace('vérifie,', `vérifie $u_0 = ${valeur(ex)}$,`), 2);
      expect(termes[2]).toBe(Number(/u_2 = (-?\d+)/.exec(ex.prompt)![1]));
    }
    for (const ex of t('1re-suite-recurrente', 'carre')) expect(valeur(ex)).toBe(suite(ex.prompt, 3)[3]);
    for (const ex of t('1re-suite-recurrente', 'fibonacci')) {
      const [u0, u1] = [/u_0 = (-?\d+)/, /u_1 = (-?\d+)/].map((r) => Number(r.exec(ex.prompt)![1]));
      const v = [u0, u1];
      for (let i = 2; i <= 6; i++) v.push(v[i - 1] + v[i - 2]);
      expect(valeur(ex)).toBe(v[6]);
    }
  });

  it('exprime des termes en fonction de n', () => {
    for (const ex of t('1re-suite-suivant', 'u-2n')) {
      const g = u(ex.prompt);
      const h = optionJuste(ex).replace(/^\$u_\{2n\} = |\$$/g, '');
      for (const n of [0, 1, 3, 7]) expect(texEval(h.replace(/n/g, `(${n})`), 0)).toBeCloseTo(g(2 * n), 9);
    }
    for (const ex of t('1re-suite-suivant', 'difference')) {
      const g = u(ex.prompt);
      const h = optionJuste(ex).replace(/\$/g, '');
      for (const n of [0, 1, 3, 7]) expect(texEval(h.replace(/n/g, `(${n})`), 0)).toBeCloseTo(g(n + 1) - g(n), 9);
    }
  });

  it('étudie le sens de variation', () => {
    for (const ex of t('1re-suite-variation', 'geometrique')) {
      const g = u(ex.prompt);
      expect(optionJuste(ex), ex.prompt).toBe(sens(Array.from({ length: 12 }, (_, n) => g(n))));
    }
    for (const ex of t('1re-suite-variation', 'quotient')) {
      const g = u(ex.prompt);
      expect(optionJuste(ex), ex.prompt).toBe(sens(Array.from({ length: 30 }, (_, n) => g(n))));
    }
    for (const ex of t('1re-suite-variation', 'recurrence')) expect(optionJuste(ex), ex.prompt).toBe(sens(suite(ex.prompt, 20)));
  });

  it('détermine des seuils', () => {
    for (const ex of t('1re-suite-seuil', 'algorithme')) {
      const [u0, S] = [/u \\leftarrow (\d+)\$/, /u [<>] (\d+)\$/].map((r) => Number(r.exec(ex.prompt)![1]));
      const q = lireNombre(/u \\leftarrow (\d+(?:\{,\}\d+)?)u\$/.exec(ex.prompt)![1]);
      const baisse = ex.prompt.includes('u >');
      const n = valeur(ex);
      const terme = (k: number) => u0 * q ** k;
      expect(baisse ? terme(n) <= S && terme(n - 1) > S : terme(n) >= S && terme(n - 1) < S, ex.prompt).toBe(true);
    }
    for (const ex of t('1re-suite-seuil', 'doublement')) {
      const taux = Number(/taux annuel de \$(\d+)/.exec(ex.prompt)![1]) / 100;
      const n = valeur(ex);
      expect((1 + taux) ** n > 2 && (1 + taux) ** (n - 1) <= 2).toBe(true);
    }
  });
});
