import { describe, expect, it } from 'vitest';
import { SECONDE } from '../src/content/seconde';
import { factorize, isPrime } from '../src/exercises/seconde/arithmetique';
import { gcd } from '../src/exercises/seconde/outils';
import { texEval } from './helpers/texEval';
import { lireNombre, nombres, optionJuste, tirages, valeur, variantesDe, verifierToutesLesVariantes } from './helpers/variantes';

/** Justesse des variantes d'exercices de 2nde : chaque réponse est recalculée à partir de l'énoncé. */

const skills = SECONDE.chapters.flatMap((c) => c.skills);
const t = (id: string, nom: string, count?: number) => tirages(skills, id, nom, count);

describe('variantes de 2nde : forme', () => {
  it('en propose beaucoup', () => {
    expect(variantesDe(skills).length).toBeGreaterThanOrEqual(skills.length * 2);
  });

  for (const chapter of SECONDE.chapters)
    it(`${chapter.title} : textes propres, KaTeX valide, réponses acceptées ou refusées`, () => verifierToutesLesVariantes(chapter.skills), 60_000);
});

describe('variantes de 2nde : arithmétique', () => {
  it('trouve le plus petit diviseur premier', () => {
    for (const ex of t('2nde-premier', 'plus-petit-diviseur')) {
      const [n] = nombres(ex.prompt);
      const d = valeur(ex);
      expect(n % d).toBe(0);
      expect(isPrime(d)).toBe(true);
      for (let p = 2; p < d; p++) expect(n % p, ex.prompt).not.toBe(0);
    }
  });

  it('compte les nombres premiers d’un intervalle', () => {
    for (const ex of t('2nde-premier', 'compter-premiers')) {
      const [a, b] = nombres(ex.prompt);
      let c = 0;
      for (let k = a; k <= b; k++) if (isPrime(k)) c++;
      expect(valeur(ex)).toBe(c);
    }
  });

  it('juge le raisonnement incomplet', () => {
    for (const ex of t('2nde-premier', 'raisonnement-faux')) {
      const [n] = nombres(ex.prompt);
      expect(n % 2 && n % 3 && n % 5, ex.prompt).toBeTruthy();
      expect(optionJuste(ex)).toBe(isPrime(n) ? 'Oui' : 'Non');
    }
  });

  it('recompose une décomposition', () => {
    for (const ex of t('2nde-decomposition', 'recomposer')) {
      const f = [...ex.prompt.matchAll(/(\d+)(?:\^\{(\d+)\})?/g)].map((m) => Number(m[1]) ** Number(m[2] ?? 1));
      expect(valeur(ex)).toBe(f.reduce((a, b) => a * b, 1));
    }
  });

  it('lit un exposant', () => {
    for (const ex of t('2nde-decomposition', 'exposant')) {
      const [n, p] = nombres(ex.prompt);
      expect(valeur(ex)).toBe(factorize(n).find(([q]) => q === p)![1]);
    }
  });

  it('complète en carré parfait avec le plus petit facteur', () => {
    for (const ex of t('2nde-decomposition', 'carre-parfait')) {
      const [n] = nombres(ex.prompt);
      const k = valeur(ex);
      expect(Number.isInteger(Math.sqrt(n * k))).toBe(true);
      for (let j = 1; j < k; j++) expect(Number.isInteger(Math.sqrt(n * j))).toBe(false);
    }
  });

  it('compte les rectangles et trouve le plus grand diviseur propre', () => {
    for (const ex of t('2nde-diviseurs', 'rectangles')) {
      const n = Number(/aire \$(\d+)\$/.exec(ex.prompt)![1]);
      let c = 0;
      for (let l = 1; l <= n; l++) for (let L = l; L <= n; L++) if (l * L === n) c++;
      expect(valeur(ex)).toBe(c);
    }
    for (const ex of t('2nde-diviseurs', 'plus-grand-diviseur')) {
      const [n] = nombres(ex.prompt);
      let best = 1;
      for (let d = 1; d < n; d++) if (n % d === 0) best = d;
      expect(valeur(ex)).toBe(best);
    }
  });

  it('reconnaît les fractions irréductibles et complète une égalité', () => {
    for (const ex of t('2nde-irreductible', 'est-irreductible')) {
      const [, n, d] = /\\frac\{(\d+)\}\{(\d+)\}/.exec(ex.prompt)!.map(Number);
      expect(optionJuste(ex)).toBe(gcd(n, d) === 1 ? 'Oui' : 'Non');
    }
    for (const ex of t('2nde-irreductible', 'completer')) {
      const [, p, q, d] = /\\frac\{(\d+)\}\{(\d+)\} = \\frac\{\\ldots\}\{(\d+)\}/.exec(ex.prompt)!.map(Number);
      expect(valeur(ex) * q).toBe(p * d);
    }
  });

  it('calcule jours, dividendes et boîtes', () => {
    const jours = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
    for (const ex of t('2nde-reste', 'jour-semaine')) {
      const start = jours.indexOf(/sommes (\w+)/.exec(ex.prompt)![1]);
      const [n] = nombres(ex.prompt);
      expect(optionJuste(ex).toLowerCase()).toBe(jours[(start + n) % 7]);
    }
    for (const ex of t('2nde-reste', 'dividende')) {
      const [b, q, r] = nombres(ex.prompt);
      expect(r).toBeLessThan(b);
      expect(valeur(ex)).toBe(b * q + r);
    }
    for (const ex of t('2nde-reste', 'boites')) {
      const [n, b] = nombres(ex.prompt);
      expect(valeur(ex)).toBe(ex.prompt.includes('obtient-on') ? Math.floor(n / b) : n % b);
    }
  });

  it('trouve le plus grand diviseur commun', () => {
    for (const nom of ['carrelage', 'direct'])
      for (const ex of t('2nde-pgcd', nom)) {
        const [a, b] = nombres(ex.prompt);
        expect(valeur(ex), ex.prompt).toBe(gcd(a, b));
      }
  });
});

/** Deux expressions en x égales en plusieurs points. */
const memeExpression = (a: string, b: string) => [-3, -1, 0, 0.5, 2, 7].every((x) => Math.abs(texEval(a, x) - texEval(b, x)) < 1e-9);
const sansDollars = (s: string) => s.replace(/\$/g, '');

describe('variantes de 2nde : calcul littéral', () => {
  it('trouve un coefficient du développement', () => {
    for (const ex of t('2nde-developper', 'coefficient')) {
      const prod = /\$(\(.+\)\(.+\))\$\.$/.exec(ex.prompt)![1];
      // Coefficients du polynôme par interpolation en 0, 1, -1.
      const p0 = texEval(prod, 0);
      const p1 = texEval(prod, 1);
      const m1 = texEval(prod, -1);
      const c2 = (p1 + m1) / 2 - p0;
      const c1 = (p1 - m1) / 2;
      const expected = ex.prompt.includes('constant') ? p0 : ex.prompt.includes('$x^2$') ? c2 : c1;
      expect(valeur(ex), ex.prompt).toBeCloseTo(expected);
    }
  });

  it('juge un développement et développe une aire', () => {
    for (const ex of t('2nde-developper', 'verifier-calcul')) {
      const [, lhs, rhs] = /\$(.+) = (.+)\$\. Son/.exec(ex.prompt)!;
      expect(optionJuste(ex), ex.prompt).toBe(memeExpression(lhs, rhs) ? 'Vrai' : 'Faux');
    }
    for (const ex of t('2nde-developper', 'aire-rectangle')) {
      const [, l, w] = /mesure \$(.+)\$ sur \$(.+)\$ \(/.exec(ex.prompt)!;
      expect(memeExpression(`(${l})(${w})`, sansDollars(optionJuste(ex))), ex.prompt).toBe(true);
    }
  });

  it('utilise les identités remarquables', () => {
    for (const ex of t('2nde-identite', 'calcul-mental')) expect(valeur(ex)).toBe(texEval(/\$(.+)\$ grâce/.exec(ex.prompt)![1]));
    for (const ex of t('2nde-identite', 'double-produit')) {
      const [, lhs, rhs] = /: \$(.+) = (.+)\$\. Quel/.exec(ex.prompt)!;
      expect(memeExpression(lhs.replace('\\ldots', String(valeur(ex))), rhs), ex.prompt).toBe(true);
    }
    for (const ex of t('2nde-identite', 'erreur-classique')) {
      const [, lhs, rhs] = /, \$(.+) = (.+)\$\.$/.exec(ex.prompt)!;
      expect(optionJuste(ex), ex.prompt).toBe(memeExpression(lhs, rhs) ? 'Vrai' : 'Faux');
    }
  });

  it('factorise juste', () => {
    for (const nom of ['carre-parfait', 'facteur-x'])
      for (const ex of t('2nde-factoriser', nom)) {
        const expr = /Factorise (?:au maximum )?\$(.+)\$\./.exec(ex.prompt)![1];
        expect(memeExpression(expr, sansDollars(optionJuste(ex))), ex.prompt).toBe(true);
      }
  });

  it('résout les problèmes du premier degré', () => {
    for (const ex of t('2nde-equation-1', 'nombre-mystere')) {
      const [a] = nombres(ex.prompt);
      const b = (ex.prompt.includes('ajoute') ? 1 : -1) * Number(/(?:ajoute|enlève) \$(\d+)\$/.exec(ex.prompt)![1]);
      const c = texEval(/trouve \$(.+)\$\. Quel/.exec(ex.prompt)![1]);
      expect(a * valeur(ex) + b).toBeCloseTo(c);
    }
    for (const ex of t('2nde-equation-1', 'tarifs')) {
      const [f, p, q] = nombres(ex.prompt);
      expect(f + p * valeur(ex)).toBe(q * valeur(ex));
    }
    for (const ex of t('2nde-equation-1', 'est-solution')) {
      const x0 = nombres(ex.prompt)[0];
      const [, l, r] = /l'équation \$(.+) = (.+)\$ \?/.exec(ex.prompt)!;
      expect(optionJuste(ex), ex.prompt).toBe(texEval(l, x0) === texEval(r, x0) ? 'Oui' : 'Non');
    }
  });

  it('résout les équations qui se ramènent à un produit nul', () => {
    for (const nom of ['facteur-commun', 'difference-carres', 'quotient-nul'])
      for (const ex of t('2nde-produit-nul', nom)) {
        const [, l, r] = /l'équation \$(.+) = (.+)\$\.$/.exec(ex.prompt)!;
        if (ex.answer.kind !== 'set') throw new Error();
        for (const s of ex.answer.values) expect(texEval(l, s.n / s.d) - texEval(r, s.n / s.d), ex.prompt).toBeCloseTo(0);
        // Aucune autre solution entière entre -30 et 30.
        for (let x = -30; x <= 30; x++)
          if (Math.abs(texEval(l, x) - texEval(r, x)) < 1e-9) expect(ex.answer.values.some((s) => s.n === x * s.d), `${ex.prompt} : ${x} oublié`).toBe(true);
      }
  });

  it('manipule puissances et écriture scientifique', () => {
    for (const ex of t('2nde-puissances', 'ecriture-scientifique')) {
      const [, written, mant] = /On écrit \$(.+)\$ en notation scientifique sous la forme \$(.+) \\times 10\^n\$/.exec(ex.prompt)!;
      const v = Number(written.replace(/\\,/g, '').replace('{,}', '.'));
      expect((Number(mant.replace('{,}', '.')) * 10 ** valeur(ex)) / v).toBeCloseTo(1, 9);
    }
    for (const ex of t('2nde-puissances', 'vrai-faux')) {
      const [, l, r] = /\$(.+) = (.+)\$\.$/.exec(ex.prompt)!;
      expect(optionJuste(ex), ex.prompt).toBe(Math.abs(texEval(l) - texEval(r)) < 1e-6 ? 'Vrai' : 'Faux');
    }
  });

  it('calcule avec les racines carrées', () => {
    for (const ex of t('2nde-racines', 'somme')) {
      const [, expr, b] = /Écris \$(.+)\$ sous la forme \$k\\sqrt\{(\d+)\}\$/.exec(ex.prompt)!;
      expect(valeur(ex) * Math.sqrt(Number(b))).toBeCloseTo(texEval(expr));
    }
    for (const ex of t('2nde-racines', 'produit')) expect(valeur(ex)).toBeCloseTo(texEval(/Calcule \$(.+)\$\./.exec(ex.prompt)![1]));
    for (const ex of t('2nde-racines', 'vrai-faux')) {
      const [, l, r] = /\$(.+) = (.+)\$\.$/.exec(ex.prompt)!;
      expect(optionJuste(ex), ex.prompt).toBe(Math.abs(texEval(l) - texEval(r)) < 1e-9 ? 'Vrai' : 'Faux');
    }
  });

  it('calcule avec les fractions', () => {
    for (const ex of t('2nde-fractions', 'reste')) {
      const [d1, d2] = [...ex.prompt.matchAll(/\\frac\{1\}\{(\d+)\}/g)].map((m) => Number(m[1]));
      expect(valeur(ex)).toBeCloseTo(1 - 1 / d1 - (1 - 1 / d1) / d2);
    }
    for (const ex of t('2nde-fractions', 'terme-manquant')) {
      const [a, c] = [...ex.prompt.matchAll(/\$(-?\\frac\{\d+\}\{\d+\})\$/g)].map((m) => texEval(m[1]));
      expect(a + valeur(ex)).toBeCloseTo(c);
    }
  });
});

/** « A(2\,;\,-3) » → [2, -3] pour chaque point nommé de l'énoncé. */
const points = (s: string) => Object.fromEntries([...s.matchAll(/([A-Z])\((-?[\d{},]+)\\,;\\,(-?[\d{},]+)\)/g)].map((m) => [m[1], [lireNombre(m[2]), lireNombre(m[3])]]));
/** Membre droit de « y = … » évalué en x. */
const droite = (eq: string, x: number) => texEval(eq.replace(/^\$?y = /, '').replace(/\$$/, ''), x);

describe('variantes de 2nde : équations de droites', () => {
  it('trouve coefficients directeurs et ordonnées à l’origine', () => {
    for (const ex of t('2nde-coef-directeur', 'cartesienne')) {
      const eq = /\$(.+) = 0\$/.exec(ex.prompt)![1];
      const a = texEval(eq, 1, 0) - texEval(eq, 0, 0);
      const b = texEval(eq, 0, 1) - texEval(eq, 0, 0);
      expect(valeur(ex)).toBeCloseTo(-a / b);
    }
    for (const nom of ['taxi', 'prise-en-charge'])
      for (const ex of t(nom === 'taxi' ? '2nde-coef-directeur' : '2nde-ordonnee-origine', nom)) {
        const [x1, y1, x2, y2] = nombres(ex.prompt);
        const m = (y2 - y1) / (x2 - x1);
        expect(valeur(ex)).toBeCloseTo(nom === 'taxi' ? m : y1 - m * x1);
      }
    for (const ex of t('2nde-coef-directeur', 'pente-route')) {
      const [h, d] = nombres(ex.prompt);
      expect(valeur(ex)).toBeCloseTo(h / d);
    }
    for (const ex of t('2nde-ordonnee-origine', 'deux-points')) {
      const { A, B } = points(ex.prompt);
      const m = (B[1] - A[1]) / (B[0] - A[0]);
      expect(valeur(ex)).toBeCloseTo(A[1] - m * A[0]);
    }
  });

  it('écrit les bonnes équations de droites', () => {
    for (const ex of t('2nde-equation-reduite', 'coef-et-point')) {
      const m = texEval(/coefficient directeur \$(.+)\$ passant/.exec(ex.prompt)![1]);
      const { A } = points(ex.prompt);
      const eq = optionJuste(ex);
      expect(droite(eq, A[0])).toBeCloseTo(A[1]);
      expect(droite(eq, A[0] + 1) - droite(eq, A[0])).toBeCloseTo(m);
    }
    for (const ex of t('2nde-equation-reduite', 'parallele-axe')) {
      const { A } = points(ex.prompt);
      expect(optionJuste(ex)).toBe(ex.prompt.includes('abscisses') ? `$y = ${A[1]}$` : `$x = ${A[0]}$`);
    }
    for (const ex of t('2nde-cartesienne-reduite', 'vers-cartesienne')) {
      const red = /réduite \$(.+)\$ \?/.exec(ex.prompt)![1];
      const cart = optionJuste(ex).replace(/\$/g, '').replace(' = 0', '');
      for (const x of [-2, 0, 3]) expect(texEval(cart, x, droite(red, x))).toBeCloseTo(0);
    }
    for (const ex of t('2nde-cartesienne-reduite', 'trouver-c')) {
      const eq = /équation \$(.+) \+ c = 0\$/.exec(ex.prompt)![1];
      const { A } = points(ex.prompt);
      expect(texEval(eq, A[0], A[1]) + valeur(ex)).toBe(0);
    }
  });

  it('place des points sur une droite et lit des vecteurs directeurs', () => {
    for (const ex of t('2nde-point-droite', 'trouver-ordonnee')) {
      const x = nombres(ex.prompt)[0];
      expect(valeur(ex)).toBeCloseTo(droite(/droite \$(.+)\$\./.exec(ex.prompt)![1], x));
    }
    for (const ex of t('2nde-point-droite', 'trouver-abscisse')) {
      const y = nombres(ex.prompt)[0];
      expect(droite(/droite \$(.+)\$\./.exec(ex.prompt)![1], valeur(ex))).toBeCloseTo(y);
    }
    for (const ex of t('2nde-vecteur-directeur', 'deux-points')) {
      const { A, B } = points(ex.prompt);
      if (ex.answer.kind !== 'pair') throw new Error();
      expect(ex.answer.values.map((f) => f.n)).toEqual([B[0] - A[0], B[1] - A[1]]);
    }
    for (const ex of t('2nde-vecteur-directeur', 'depuis-reduite')) {
      const eq = /équation \$(.+)\$ a un/.exec(ex.prompt)![1];
      expect(valeur(ex)).toBeCloseTo(droite(eq, 1) - droite(eq, 0));
    }
  });
});
