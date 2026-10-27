import { afterEach, describe, expect, it } from 'vitest';
import { SECONDE } from '../src/content/seconde';
import { factorize, isPrime } from '../src/exercises/seconde/arithmetique';
import { gcd } from '../src/exercises/seconde/outils';
import { median, quartile } from '../src/exercises/seconde/statistiques';
import { texEval } from './helpers/texEval';
import { dansEnsemble, ensemble, lireNombre, nombres, optionJuste, tirages, valeur, variantesDe } from './helpers/variantes';

/** Justesse des variantes d'exercices de 2nde : chaque réponse est recalculée à partir de l'énoncé. */

const skills = SECONDE.chapters.flatMap((c) => c.skills);
const t = (id: string, nom: string, count?: number) => tirages(skills, id, nom, count);

// Rend la main à la boucle d'événements entre deux tests : sans cela, le worker calcule trop longtemps
// d'affilée sur les machines de CI et le dialogue avec vitest expire (« Timeout calling onTaskUpdate »).
afterEach(() => new Promise((resolve) => setTimeout(resolve, 0)));

describe('variantes de 2nde', () => {
  it('en propose au moins deux par compétence', () => {
    for (const s of skills) expect(variantesDe([s]).length, s.id).toBeGreaterThanOrEqual(2);
  });
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

const dans = (tex: string, x: number) => dansEnsemble(tex, x, (s) => texEval(s));

/** Plus petit ensemble (0 = ℕ … 4 = ℝ) d'un nombre écrit par sample(). */
function nature(tex: string): number {
  if (tex.includes('\\pi')) return 4;
  const sq = /\\sqrt\{(\d+)\}/.exec(tex);
  if (sq && !Number.isInteger(Math.sqrt(Number(sq[1])))) return 4;
  const v = texEval(tex.replace('{,}', '.'));
  if (Number.isInteger(v)) return v >= 0 ? 0 : 1;
  const fr = /\\frac\{(\d+)\}\{(\d+)\}/.exec(tex);
  let d = fr ? Number(fr[2]) / gcd(Number(fr[1]), Number(fr[2])) : 1;
  while (d % 2 === 0) d /= 2;
  while (d % 5 === 0) d /= 5;
  return d === 1 ? 2 : 3;
}
const ENSEMBLES = ['\\mathbb{N}', '\\mathbb{Z}', '\\mathbb{D}', '\\mathbb{Q}', '\\mathbb{R}'];

describe('variantes de 2nde : ensembles de nombres', () => {
  it('classe les nombres dans les ensembles', () => {
    for (const ex of t('2nde-ensemble', 'vrai-faux')) {
      const [, x, set] = /\$(.+) \\in (.+)\$\.$/.exec(ex.prompt)!;
      expect(optionJuste(ex), ex.prompt).toBe(nature(x) <= ENSEMBLES.indexOf(set) ? 'Vrai' : 'Faux');
    }
    for (const ex of t('2nde-ensemble', 'intrus')) {
      const k = ENSEMBLES.indexOf(/à \$(.+)\$ \?/.exec(ex.prompt)![1]);
      if (ex.answer.kind !== 'choice') throw new Error();
      const { options, correct } = ex.answer;
      options.forEach((o, i) => expect(nature(o.replace(/\$/g, '')) > k, `${ex.prompt} ${o}`).toBe(i === correct));
    }
  });

  it('lit les intervalles', () => {
    for (const ex of t('2nde-intervalle', 'appartient')) {
      const [, x, I] = /nombre \$(-?\d+)\$ appartient-il à l'intervalle \$(.+)\$ \?/.exec(ex.prompt)!;
      expect(optionJuste(ex), ex.prompt).toBe(dans(I, Number(x)) ? 'Oui' : 'Non');
    }
    for (const ex of t('2nde-intervalle', 'vers-inegalite')) {
      const I = /x \\in (.+)\$ \?/.exec(ex.prompt)![1];
      const [, a, o1, o2, b] = /^\$(-?\d+) (<|\\leq) x (<|\\leq) (-?\d+)\$$/.exec(optionJuste(ex))!;
      for (let k = -60; k <= 60; k++) {
        const x = k / 4;
        const ok = (o1 === '<' ? Number(a) < x : Number(a) <= x) && (o2 === '<' ? x < Number(b) : x <= Number(b));
        expect(ok, ex.prompt).toBe(dans(I, x));
      }
    }
    for (const ex of t('2nde-intervalle', 'compter-entiers')) {
      const I = /intervalle \$(.+)\$ \?/.exec(ex.prompt)![1];
      let c = 0;
      for (let x = -50; x <= 50; x++) if (dans(I, x)) c++;
      expect(valeur(ex)).toBe(c);
    }
  });

  it('calcule distances et valeurs absolues', () => {
    for (const ex of t('2nde-distance-abs', 'temperatures')) {
      const [a, b] = nombres(ex.prompt);
      expect(valeur(ex)).toBe(Math.abs(a - b));
    }
    for (const ex of t('2nde-distance-abs', 'expression')) {
      const e = /Calcule \$(.+)\$\./.exec(ex.prompt)![1].replace(/\|(-?\d+)\|/g, 'Math.abs($1)');
      expect(valeur(ex)).toBe(texEval(e));
    }
    for (const ex of t('2nde-abs-equation', 'en-mots')) {
      const [r, a] = nombres(ex.prompt);
      if (ex.answer.kind !== 'set') throw new Error();
      for (const v of ex.answer.values) expect(Math.abs(v.n - a)).toBe(r);
    }
    for (const ex of t('2nde-abs-equation', 'inequation')) {
      const [, inside, op, r] = /\$\|(.+)\| (<|>|\\leq|\\geq) (\d+)\$\.$/.exec(ex.prompt)!;
      const S = optionJuste(ex);
      for (let k = -100; k <= 100; k++) {
        const x = k / 4;
        const d = Math.abs(texEval(inside, x));
        const ok = op === '<' ? d < +r : op === '>' ? d > +r : op === '\\leq' ? d <= +r : d >= +r;
        expect(dans(S, x), `${ex.prompt} x = ${x}`).toBe(ok);
      }
    }
  });

  it('calcule intersections et réunions', () => {
    for (const nom of ['disjoints', 'inclus'])
      for (const ex of t('2nde-inter-union', nom)) {
        const [, I, J, op] = /\$I = (.+)\$ et \$J = (.+)\$\. Que vaut \$I (\\cap|\\cup) J\$/.exec(ex.prompt)!;
        const S = optionJuste(ex);
        for (let k = -100; k <= 100; k++) {
          const x = k / 4;
          expect(dans(S, x), ex.prompt).toBe(op === '\\cap' ? dans(I, x) && dans(J, x) : dans(I, x) || dans(J, x));
        }
      }
  });
});

const SIGNES = ['Strictement positif', 'Nul', 'Strictement négatif'];
const signe = (v: number) => SIGNES[v > 0 ? 0 : v === 0 ? 1 : 2];

describe('variantes de 2nde : étude de fonctions', () => {
  it('calcule des images', () => {
    for (const ex of t('2nde-image', 'programme')) {
      const k = Number(/choisissant \$(-?\d+)\$/.exec(ex.prompt)![1]);
      const a = (ex.prompt.includes('on ajoute') ? 1 : -1) * Number(/on (?:ajoute|soustrait) \$(\d+)\$, on/.exec(ex.prompt)![1]);
      const b = Number(/puis on soustrait \$(\d+)\$/.exec(ex.prompt)![1]);
      const mid = ex.prompt.includes('au carré') ? (k + a) ** 2 : 2 * (k + a);
      expect(valeur(ex)).toBe(mid - b);
    }
    for (const ex of t('2nde-image', 'sur-la-courbe')) {
      const f = /f\(x\) = (.+)\$\. Le point/.exec(ex.prompt)![1];
      const { A } = points(ex.prompt);
      expect(optionJuste(ex)).toBe(texEval(f, A[0]) === A[1] ? 'Oui' : 'Non');
    }
    for (const ex of t('2nde-image', 'cout')) {
      const C = /C\(x\) = (.+)\$ euros/.exec(ex.prompt)![1].replace('{,}', '.');
      const q = Number(/de \$(\d+)\$ objets/.exec(ex.prompt)![1]);
      expect(valeur(ex)).toBeCloseTo(texEval(C, q));
    }
  });

  it('trouve des antécédents', () => {
    for (const ex of t('2nde-antecedent-affine', 'location')) {
      const f = /f\(x\) = (.+)\$ euros/.exec(ex.prompt)![1];
      const prix = Number(/avec \$(\d+)\$/.exec(ex.prompt)![1]);
      expect(texEval(f, valeur(ex))).toBe(prix);
    }
    for (const ex of t('2nde-antecedent-affine', 'tableau')) {
      const y = Number(/antécédent de \$(-?\d+)\$/.exec(ex.prompt)![1]);
      expect(ex.prompt).toContain(`f(${valeur(ex)}) = ${y} `.trimEnd());
      // Une fonction affine non constante : un seul antécédent dans le tableau.
      expect([...ex.prompt.matchAll(new RegExp(`= ${y}(?! *\\d)(?: ;|\\$)`, 'g'))].length, ex.prompt).toBe(1);
    }
    for (const ex of t('2nde-antecedents-carre', 'combien')) {
      const f = /f\(x\) = (.+)\$\. Combien/.exec(ex.prompt)![1];
      const k = Number(/nombre \$(-?\d+)\$/.exec(ex.prompt)![1]);
      const min = Math.min(...Array.from({ length: 2001 }, (_, i) => texEval(f, -10 + i / 100)));
      expect(valeur(ex), ex.prompt).toBe(k < min - 1e-9 ? 0 : Math.abs(k - min) < 1e-9 ? 1 : 2);
    }
    for (const ex of t('2nde-antecedents-carre', 'forme-factorisee')) {
      const f = /f\(x\) = (.+)\$\. Quels/.exec(ex.prompt)![1];
      if (ex.answer.kind !== 'set') throw new Error();
      for (const v of ex.answer.values) expect(texEval(f, v.n) === 0).toBe(true);
      for (let x = -10; x <= 10; x++) if (texEval(f, x) === 0) expect(ex.answer.values.some((v) => v.n === x)).toBe(true);
    }
  });

  it('étudie des signes', () => {
    for (const ex of t('2nde-signe-affine', 'signe-en-un-point')) {
      const f = /f\(x\) = (.+)\$\. Quel/.exec(ex.prompt)![1];
      const k = Number(/f\((-?\d+)\)\$ \?/.exec(ex.prompt)![1]);
      expect(optionJuste(ex)).toBe(signe(texEval(f, k)));
    }
    for (const ex of t('2nde-signe-affine', 'benefice')) {
      const [p, fixe] = /B\(x\) = (\d+)x - (\d+)\$/.exec(ex.prompt)!.slice(1).map(Number);
      const n = valeur(ex);
      expect(p * n - fixe).toBeGreaterThan(0);
      expect(p * (n - 1) - fixe).toBeLessThanOrEqual(0);
    }
    for (const ex of t('2nde-signe-produit', 'quotient')) {
      const [, num, den, op] = /\$\\frac\{(.+)\}\{(.+)\} (\\geq|\\leq) 0\$/.exec(ex.prompt)!;
      const S = optionJuste(ex);
      for (let k = -40; k <= 40; k++) {
        const x = k / 4;
        const d = texEval(den, x);
        const ok = d !== 0 && (op === '\\geq' ? texEval(num, x) / d >= 0 : texEval(num, x) / d <= 0);
        expect(dans(S, x), `${ex.prompt} en ${x}`).toBe(ok);
      }
    }
    for (const ex of t('2nde-signe-produit', 'signe-en-un-point')) {
      const [, f, k] = /\$(.+)\$ pour \$x = (-?\d+)\$/.exec(ex.prompt)!;
      expect(optionJuste(ex)).toBe(signe(texEval(f, Number(k))));
    }
  });

  it('repère les valeurs interdites', () => {
    for (const ex of t('2nde-domaine', 'valeur-interdite')) {
      const den = /\\frac\{.+\}\{(.+)\}\$ \?/.exec(ex.prompt)![1];
      expect(texEval(den, valeur(ex))).toBeCloseTo(0);
    }
    for (const ex of t('2nde-domaine', 'appartient')) {
      const k = Number(/f\((-?\d+)\)/.exec(ex.prompt)![1]);
      const f = /f\(x\) = (.+)\$ \?/.exec(ex.prompt)![1];
      expect(optionJuste(ex), ex.prompt).toBe(Number.isFinite(texEval(f, k)) ? 'Oui' : 'Non');
    }
  });
});

/** Ensemble des solutions d'une inéquation, comparé point par point à l'intervalle proposé. */
function memeSolution(S: string, ok: (x: number) => boolean, where: string) {
  const inS = ensemble(S, (s) => texEval(s));
  for (let k = -400; k <= 400; k++) {
    const x = k / 8;
    if (inS(x) !== ok(x)) expect(inS(x), `${where} en ${x}`).toBe(ok(x));
  }
}

describe('variantes de 2nde : fonctions de référence', () => {
  it('résout des équations avec les fonctions de référence', () => {
    for (const ex of t('2nde-carre-equation', 'aire-carre')) expect(valeur(ex) ** 2).toBe(nombres(ex.prompt)[0]);
    for (const nom of ['decale'])
      for (const id of ['2nde-carre-equation', '2nde-racine-equation']) {
        for (const ex of t(id, nom)) {
          const [, l, r] = /l'équation \$(.+) = (-?\d+)\$\.$/.exec(ex.prompt)!;
          if (ex.answer.kind !== 'set') throw new Error();
          for (const v of ex.answer.values) expect(texEval(l, v.n), ex.prompt).toBeCloseTo(Number(r));
          for (let x = -100; x <= 100; x++) if (Math.abs(texEval(l, x) - Number(r)) < 1e-9) expect(ex.answer.values.some((v) => v.n === x), ex.prompt).toBe(true);
        }
      }
    for (const ex of t('2nde-inverse-equation', 'decale')) {
      const [, l, r] = /l'équation \$(.+) = (.+)\$\.$/.exec(ex.prompt)!;
      expect(texEval(l, valeur(ex))).toBeCloseTo(texEval(r));
    }
    for (const ex of t('2nde-cube-equation', 'volume')) expect(valeur(ex) ** 3).toBe(nombres(ex.prompt)[0]);
  });

  it('résout des inéquations avec les fonctions de référence', () => {
    for (const ex of t('2nde-carre-inequation', 'appartient')) {
      const [, x, op, k] = /nombre \$(-?\d+)\$ est-il solution de l'inéquation \$x\^2 (<|\\leq) (\d+)\$/.exec(ex.prompt)!;
      const v = Number(x) ** 2;
      expect(optionJuste(ex)).toBe((op === '<' ? v < +k : v <= +k) ? 'Oui' : 'Non');
    }
    for (const ex of t('2nde-inverse-equation', 'inequation')) {
      const [, op, k] = /\\frac\{1\}\{x\} (<|>) (.+)\$\.$/.exec(ex.prompt)!;
      const kv = texEval(k);
      memeSolution(optionJuste(ex), (x) => x !== 0 && (op === '>' ? 1 / x > kv : 1 / x < kv), ex.prompt);
    }
    for (const ex of t('2nde-racine-equation', 'inequation')) {
      const [, op, k] = /\\sqrt\{x\} (<|>) (\d+)\$\.$/.exec(ex.prompt)!;
      memeSolution(optionJuste(ex), (x) => x >= 0 && (op === '<' ? Math.sqrt(x) < +k : Math.sqrt(x) > +k), ex.prompt);
    }
  });

  it('compare et encadre sans calculatrice', () => {
    for (const ex of t('2nde-carre-inequation', 'encadrement')) {
      const [a, b] = nombres(ex.prompt.replace(' \\leq x \\leq ', '$ $'));
      const xs = Array.from({ length: 1001 }, (_, i) => a + ((b - a) * i) / 1000);
      const [, lo, hi] = /(-?\d+) \\leq x\^2 \\leq (-?\d+)/.exec(optionJuste(ex))!;
      expect(Number(lo)).toBeCloseTo(Math.min(...xs.map((x) => x * x)));
      expect(Number(hi)).toBeCloseTo(Math.max(...xs.map((x) => x * x)));
    }
    for (const ex of t('2nde-comparer-images', 'raisonnement-faux')) {
      const [, a, b] = /« \$(-?\d+) < (\d+)\$/.exec(ex.prompt)!;
      expect(optionJuste(ex)).toBe(Number(a) ** 2 < Number(b) ** 2 ? 'Vrai' : 'Faux');
    }
    for (const ex of t('2nde-comparer-images', 'encadrer-inverse')) {
      const [, lo, hi] = /\$(-?\d+) < x < (-?\d+)\$/.exec(ex.prompt)!;
      const [, l, h] = /^\$(.+) < \\frac\{1\}\{x\} < (.+)\$$/.exec(optionJuste(ex))!;
      const vals = [1 / Number(lo), 1 / Number(hi)];
      expect(texEval(l)).toBeCloseTo(Math.min(...vals));
      expect(texEval(h)).toBeCloseTo(Math.max(...vals));
    }
    for (const ex of t('2nde-cube-equation', 'comparer')) {
      const [a, b] = [...ex.prompt.matchAll(/\((-?[\d{},]+)\)\^3/g)].map((m) => lireNombre(m[1]) ** 3);
      expect(optionJuste(ex)).toContain(a < b ? '<' : '>');
    }
  });
});

const dist2 = (A: number[], B: number[]) => (B[0] - A[0]) ** 2 + (B[1] - A[1]) ** 2;
const paire = (ex: { answer: import('../src/exercises/types').Answer }) => {
  if (ex.answer.kind !== 'pair') throw new Error();
  return ex.answer.values.map((f) => f.n / f.d);
};

describe('variantes de 2nde : géométrie repérée', () => {
  it('calcule milieux, symétriques et quatrièmes sommets', () => {
    for (const ex of t('2nde-milieu', 'est-milieu')) {
      const { A, B, M } = points(ex.prompt);
      expect(optionJuste(ex)).toBe(M[0] * 2 === A[0] + B[0] && M[1] * 2 === A[1] + B[1] ? 'Oui' : 'Non');
    }
    for (const ex of t('2nde-milieu', 'centre-parallelogramme')) {
      const { A, C } = points(ex.prompt);
      expect(paire(ex)).toEqual([(A[0] + C[0]) / 2, (A[1] + C[1]) / 2]);
    }
    for (const ex of t('2nde-symetrique', 'symetrique-point')) {
      const { A, C } = points(ex.prompt);
      const [x, y] = paire(ex);
      expect([(A[0] + x) / 2, (A[1] + y) / 2]).toEqual(C);
    }
    for (const ex of t('2nde-symetrique', 'quatrieme-sommet')) {
      const { A, B, C } = points(ex.prompt);
      const D = paire(ex);
      // ABCD parallélogramme : AB = DC.
      expect([B[0] - A[0], B[1] - A[1]]).toEqual([C[0] - D[0], C[1] - D[1]]);
      expect((B[0] - A[0]) * (C[1] - A[1]) - (B[1] - A[1]) * (C[0] - A[0]), ex.prompt).not.toBe(0);
    }
  });

  it('calcule des distances et reconnaît les triangles', () => {
    for (const ex of t('2nde-longueur', 'carre-distance')) {
      const { A, B } = points(ex.prompt);
      expect(valeur(ex)).toBe(dist2(A, B));
    }
    for (const ex of t('2nde-longueur', 'isocele')) {
      const { A, B, C } = points(ex.prompt);
      expect((B[0] - A[0]) * (C[1] - A[1]) - (B[1] - A[1]) * (C[0] - A[0]), ex.prompt).not.toBe(0);
      expect(optionJuste(ex)).toBe(dist2(A, B) === dist2(A, C) ? 'Oui' : 'Non');
    }
    for (const ex of t('2nde-longueur', 'cercle')) {
      const { M, C } = points(ex.prompt);
      const r = Number(/rayon \$(\d+)\$/.exec(ex.prompt)![1]);
      expect(optionJuste(ex)).toBe(dist2(C, M) === r * r ? 'Oui' : 'Non');
    }
    for (const ex of t('2nde-reciproque', 'repere')) {
      const { A, B, C } = points(ex.prompt);
      const dot = (B[0] - A[0]) * (C[0] - A[0]) + (B[1] - A[1]) * (C[1] - A[1]);
      expect(optionJuste(ex)).toBe(dot === 0 ? 'Oui' : 'Non');
    }
    for (const ex of t('2nde-reciproque', 'troisieme-cote')) {
      const [a, b] = nombres(ex.prompt);
      expect(valeur(ex) ** 2).toBe(a * a + b * b);
    }
  });

  it('applique Pythagore et la trigonométrie à des situations', () => {
    for (const ex of t('2nde-pythagore', 'echelle')) {
      const [c, p] = nombres(ex.prompt);
      expect(valeur(ex) ** 2 + p * p).toBeCloseTo(c * c);
    }
    for (const ex of t('2nde-pythagore', 'diagonale')) {
      const [a, b] = nombres(ex.prompt);
      expect(valeur(ex) ** 2).toBe(a * a + b * b);
    }
    for (const ex of t('2nde-trigo', 'longueur')) {
      const bc = Number(/BC = (\d+)/.exec(ex.prompt)![1]);
      const r = texEval(/\(\\widehat\{ABC\}\) = (.+)\$\. Calcule/.exec(ex.prompt)![1]);
      expect(valeur(ex)).toBeCloseTo(bc * r);
    }
    for (const ex of t('2nde-trigo', 'hauteur-arbre')) {
      const [d, tan] = nombres(ex.prompt);
      expect(valeur(ex)).toBeCloseTo(d * tan);
    }
  });
});

/** Pourcentages signés lus dans « une hausse de $20\,\%$ » / « une baisse de $15\,\%$ ». */
const evolutions = (s: string) => [...s.matchAll(/(hausse|baisse) de \$([\d{},]+)\\,\\%\$/g)].map((m) => (m[1] === 'hausse' ? 1 : -1) * lireNombre(m[2]));
const pourcents = (s: string) => [...s.matchAll(/\$([\d{},]+)\\,\\%\$/g)].map((m) => lireNombre(m[1]));

describe('variantes de 2nde : information chiffrée', () => {
  it('calcule effectifs, totaux et proportions de proportions', () => {
    for (const ex of t('2nde-proportion', 'effectif')) {
      const [total] = nombres(ex.prompt);
      const [p] = pourcents(ex.prompt);
      expect(valeur(ex)).toBeCloseTo((total * p) / 100);
      expect(Number.isInteger(valeur(ex))).toBe(true);
    }
    for (const ex of t('2nde-proportion', 'total')) {
      const [part] = nombres(ex.prompt);
      const [p] = pourcents(ex.prompt);
      expect((valeur(ex) * p) / 100).toBeCloseTo(part);
    }
    for (const ex of t('2nde-proportion-proportion', 'retrouver')) {
      const [p1, g] = pourcents(ex.prompt);
      expect((p1 * valeur(ex)) / 100).toBeCloseTo(g);
    }
    for (const ex of t('2nde-proportion-proportion', 'effectif')) {
      const [total] = nombres(ex.prompt);
      const [p1, p2] = pourcents(ex.prompt);
      expect(valeur(ex)).toBeCloseTo((total * p1 * p2) / 10000);
      expect(Number.isInteger(valeur(ex))).toBe(true);
    }
  });

  it('relie taux et coefficients multiplicateurs', () => {
    for (const ex of t('2nde-taux-evolution', 'depuis-coef')) expect(1 + valeur(ex) / 100).toBeCloseTo(nombres(ex.prompt)[0]);
    for (const ex of t('2nde-taux-evolution', 'multiple')) {
      const k = /doublé/.test(ex.prompt) ? 2 : /triplé/.test(ex.prompt) ? 3 : /multiplié par 5/.test(ex.prompt) ? 5 : 1 / Number(/divisé par (\d)/.exec(ex.prompt)![1]);
      expect(1 + valeur(ex) / 100).toBeCloseTo(k);
    }
    for (const ex of t('2nde-coef-multiplicateur', 'entre-deux-valeurs')) {
      const [a, b] = nombres(ex.prompt);
      expect(valeur(ex)).toBeCloseTo(b / a);
    }
    for (const ex of t('2nde-coef-multiplicateur', 'erreur')) {
      const [p] = pourcents(ex.prompt);
      const [k] = nombres(ex.prompt.split('multiplie par')[1]);
      expect(optionJuste(ex)).toBe(Math.abs(k - (1 - p / 100)) < 1e-9 ? 'Oui' : 'Non');
    }
  });

  it('enchaîne et inverse des évolutions', () => {
    for (const nom of ['hausse-puis-baisse', 'trois-evolutions'])
      for (const ex of t('2nde-evolutions-successives', nom)) {
        const cm = evolutions(ex.prompt).reduce((acc, e) => acc * (1 + e / 100), 1);
        expect(valeur(ex)).toBeCloseTo((cm - 1) * 100);
      }
    for (const ex of t('2nde-evolutions-successives', 'vrai-faux')) {
      const [t1, t2, g] = pourcents(ex.prompt);
      expect(optionJuste(ex)).toBe(Math.abs((1 + t1 / 100) * (1 + t2 / 100) - (1 + g / 100)) < 1e-9 ? 'Vrai' : 'Faux');
    }
    for (const ex of t('2nde-evolution-reciproque', 'soldes')) {
      const [baisse] = pourcents(ex.prompt);
      expect((1 - baisse / 100) * (1 + valeur(ex) / 100)).toBeCloseTo(1);
    }
    for (const ex of t('2nde-evolution-reciproque', 'vrai-faux')) {
      const [e1, e2] = evolutions(ex.prompt);
      expect(optionJuste(ex)).toBe(Math.abs((1 + e1 / 100) * (1 + e2 / 100) - 1) < 1e-9 ? 'Vrai' : 'Faux');
    }
  });

  it('applique TVA et remises', () => {
    for (const ex of t('2nde-valeur-finale', 'tva')) {
      const [p] = nombres(ex.prompt);
      expect(valeur(ex)).toBeCloseTo(ex.prompt.includes('TTC, avec') ? p / 1.2 : p * 1.2);
    }
    for (const ex of t('2nde-valeur-finale', 'deux-remises')) {
      const [p] = nombres(ex.prompt);
      const [r1, r2] = pourcents(ex.prompt);
      expect(valeur(ex)).toBeCloseTo(p * (1 - r1 / 100) * (1 - r2 / 100));
    }
  });
});

/** Lignes « ax + by = e » d'un système \begin{cases}. */
function systemeLu(s: string): [number, number, number][] {
  const body = /\\begin\{cases\} (.+) \\end\{cases\}/.exec(s)![1];
  return body.split(' \\\\ ').map((row) => {
    const [lhs, rhs] = row.split(' = ');
    const o = texEval(lhs, 0, 0);
    return [texEval(lhs, 1, 0) - o, texEval(lhs, 0, 1) - o, Number(rhs)];
  });
}

describe('variantes de 2nde : positions relatives et systèmes', () => {
  it('compare des droites', () => {
    for (const ex of t('2nde-position-droites', 'parametre')) {
      const d = /d : (y = .+)\$ \?/.exec(ex.prompt)![1];
      expect(valeur(ex)).toBe(droite(d, 1) - droite(d, 0));
    }
    for (const ex of t('2nde-position-droites', 'cartesiennes')) {
      const [e1, e2] = [...ex.prompt.matchAll(/d_\d : (.+?) = 0\$/g)].map((m) => m[1]);
      const coef = (e: string) => [texEval(e, 1, 0) - texEval(e, 0, 0), texEval(e, 0, 1) - texEval(e, 0, 0), texEval(e, 0, 0)];
      const [a, b, c] = coef(e1);
      const [a2, b2, c2] = coef(e2);
      const det = a * b2 - b * a2;
      const conf = det === 0 && a * c2 === a2 * c && b * c2 === b2 * c;
      expect(optionJuste(ex)).toBe(det !== 0 ? 'Sécantes' : conf ? 'Confondues' : 'Strictement parallèles');
    }
    for (const ex of t('2nde-parallele-point', 'cartesienne')) {
      const eq = /forme \$(.+) \+ c' = 0\$/.exec(ex.prompt)![1];
      const { A } = points(ex.prompt);
      expect(texEval(eq, A[0], A[1]) + valeur(ex)).toBe(0);
    }
    for (const ex of t('2nde-parallele-point', 'quatre-points')) {
      const { A, B, C, D } = points(ex.prompt);
      expect(optionJuste(ex)).toBe((B[0] - A[0]) * (D[1] - C[1]) === (B[1] - A[1]) * (D[0] - C[0]) ? 'Oui' : 'Non');
    }
  });

  it('trouve des points d’intersection', () => {
    for (const ex of t('2nde-intersection', 'axe-abscisses')) {
      const [x, y] = paire(ex);
      expect(y).toBe(0);
      expect(droite(/droite \$(.+)\$ coupe/.exec(ex.prompt)![1], x)).toBeCloseTo(0);
    }
    for (const ex of t('2nde-intersection', 'verifier-point')) {
      const { I } = points(ex.prompt);
      const [d1, d2] = [...ex.prompt.matchAll(/d_\d : (y = [^$]+)\$/g)].map((m) => m[1]);
      expect(optionJuste(ex)).toBe(droite(d1, I[0]) === I[1] && droite(d2, I[0]) === I[1] ? 'Oui' : 'Non');
    }
  });

  it('met en équation et résout des systèmes', () => {
    for (const nom of ['achats', 'tetes-pattes'])
      for (const ex of t('2nde-systeme', nom)) {
        const [x, y] = paire(ex);
        for (const [a, b, e] of systemeLu(ex.correction[0])) expect(a * x + b * y, ex.prompt).toBe(e);
        expect(x).toBeGreaterThan(0);
        expect(y).toBeGreaterThan(0);
      }
    for (const ex of t('2nde-systeme', 'tetes-pattes')) {
      const [tetes, pattes] = nombres(ex.prompt);
      const [x, y] = paire(ex);
      expect([x + y, 2 * x + 4 * y]).toEqual([tetes, pattes]);
    }
    for (const ex of t('2nde-systeme-nb', 'parametre')) {
      const k = valeur(ex);
      const [[a, b], [c, d]] = systemeLu(ex.prompt.replace('ky', `${k}y`).replace('+ -', '- '));
      expect(a * d - b * c, ex.prompt).toBe(0);
    }
    for (const ex of t('2nde-systeme-nb', 'couple-solution')) {
      const [, x, y] = /couple \$\((-?\d+)\\,;\\,(-?\d+)\)\$/.exec(ex.prompt)!.map(Number);
      const ok = systemeLu(ex.prompt).every(([a, b, e]) => a * x + b * y === e);
      expect(optionJuste(ex)).toBe(ok ? 'Oui' : 'Non');
    }
  });
});

describe('variantes de 2nde : probabilités', () => {
  it('compte les cas favorables', () => {
    const jeu = [7, 8, 9, 10, 11, 12, 13, 14].flatMap((v) => ['coeur', 'carreau', 'pique', 'trefle'].map((c) => ({ v, c })));
    const rouge = (c: string) => c === 'coeur' || c === 'carreau';
    const figure = (v: number) => v >= 11 && v <= 13;
    const evenements: Record<string, (k: { v: number; c: string }) => boolean> = {
      'un roi': (k) => k.v === 13,
      'un cœur': (k) => k.c === 'coeur',
      'une figure (valet, dame ou roi)': (k) => figure(k.v),
      'une carte rouge': (k) => rouge(k.c),
      'un as ou un roi': (k) => k.v === 13 || k.v === 14,
      'le roi de cœur': (k) => k.v === 13 && k.c === 'coeur',
      'un cœur ou un roi': (k) => k.v === 13 || k.c === 'coeur',
      'une carte noire qui n’est pas une figure': (k) => !rouge(k.c) && !figure(k.v),
    };
    for (const ex of t('2nde-proba-simple', 'cartes')) {
      const ev = /tirer (.+) \?$/.exec(ex.prompt)![1];
      expect(valeur(ex)).toBeCloseTo(jeu.filter(evenements[ev]).length / 32);
    }
    for (const ex of t('2nde-proba-simple', 'composition')) {
      const [total] = nombres(ex.prompt);
      const p = texEval(/est \$(.+)\$\. Combien/.exec(ex.prompt)![1]);
      expect(valeur(ex)).toBeCloseTo(p * total);
    }
    for (const ex of t('2nde-deux-des', 'piece-et-de')) {
      const cond = /nombre (.+) \?$/.exec(ex.prompt)![1];
      const ok = (d: number) => (cond === 'pair' ? d % 2 === 0 : cond === 'un multiple de 3' ? d % 3 === 0 : cond === 'supérieur ou égal à 5' ? d >= 5 : d === 6);
      expect(valeur(ex)).toBeCloseTo([1, 2, 3, 4, 5, 6].filter(ok).length / 12);
    }
    for (const ex of t('2nde-deux-des', 'somme-au-moins')) {
      const s = nombres(ex.prompt).at(-1)!;
      let c = 0;
      for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (ex.prompt.includes('supérieure') ? a + b >= s : a + b <= s) c++;
      expect(valeur(ex)).toBeCloseTo(c / 36);
    }
  });

  it('utilise contraire, réunion et tableaux', () => {
    for (const ex of t('2nde-proba-contraire', 'au-moins-une')) expect(valeur(ex)).toBeCloseTo(1 - nombres(ex.prompt)[0]);
    for (const ex of t('2nde-proba-contraire', 'pourcentage')) expect(valeur(ex)).toBeCloseTo(1 - pourcents(ex.prompt)[0] / 100);
    for (const ex of t('2nde-proba-reunion', 'ni-l-un-ni-l-autre')) {
      const [a, b, both] = pourcents(ex.prompt);
      expect(valeur(ex)).toBeCloseTo(1 - (a + b - both) / 100);
      expect(valeur(ex)).toBeGreaterThanOrEqual(0);
    }
    for (const ex of t('2nde-proba-reunion', 'incompatibles')) {
      const [pa, pb] = [...ex.prompt.matchAll(/P\([AB]\) = ([\d{},]+)\$/g)].map((m) => lireNombre(m[1]));
      expect(optionJuste(ex)).toBe(pa + pb <= 1 + 1e-9 ? 'Oui' : 'Non');
    }
    for (const ex of t('2nde-tableau-double', 'completer')) {
      const cells = [...ex.prompt.matchAll(/& (\d+|\?)/g)].map((m) => m[1]);
      // Seconde : externe, ?, total ; Première : externe, demi, total ; Total : …, …, total général.
      const [ext, , tot] = cells.map(Number);
      expect(valeur(ex)).toBeCloseTo((tot - ext) / Number(cells[8]));
    }
    for (const ex of t('2nde-tableau-double', 'pourcentages')) {
      const [fl, fn, gl, gn] = [...ex.prompt.matchAll(/& (\d+)\\,\\%/g)].map((m) => Number(m[1]));
      expect(fl + fn + gl + gn).toBe(100);
      expect(valeur(ex)).toBeCloseTo((ex.prompt.includes('soit vaccinée') ? fl + gl : fl + fn) / 100);
    }
  });

  it('calcule les intervalles de fluctuation', () => {
    for (const ex of t('2nde-echantillonnage', 'borne')) {
      const [p, n] = nombres(ex.prompt.replace('p = ', '').replace('n = ', ''));
      expect(valeur(ex)).toBeCloseTo(p + (ex.prompt.includes('inférieure') ? -1 : 1) / Math.sqrt(n));
    }
    for (const ex of t('2nde-echantillonnage', 'taille')) {
      const m = lireNombre(/= ([\d{},]+)\$ \?/.exec(ex.prompt)![1]);
      expect(1 / Math.sqrt(valeur(ex))).toBeCloseTo(m);
    }
  });
});

/** Valeurs et effectifs d'un tableau « Valeur / Effectif ». */
function effectifs(s: string): number[] {
  const rows = [...s.matchAll(/\\text\{(?:Valeur|Effectif)\} & ([^\\]+?) \\\\/g)].map((m) => m[1].split(' & ').map(Number));
  return rows[0].flatMap((v, i) => Array<number>(rows[1][i]).fill(v));
}
/** Lignes x / f(x) d'un tableau de variations. */
function tableauVariations(s: string) {
  const top = /x & (.+?) \\\\ \\hline/.exec(s)![1].split(' & ').filter((c) => c !== '').map(Number);
  const bottom = /f\(x\) & (.+?) \\end\{array\}/.exec(s)![1].split(' & ').filter((c) => !c.includes('arrow')).map(Number);
  return { xs: top, ys: bottom };
}

describe('variantes de 2nde : statistiques', () => {
  it('calcule moyennes et notes manquantes', () => {
    for (const ex of t('2nde-moyenne', 'note-manquante')) {
      const xs = nombres(ex.prompt.split(' et une')[0]);
      const [n, mean] = nombres(ex.prompt.split('oubliée.')[1]);
      expect(valeur(ex)).toBeGreaterThanOrEqual(0);
      expect(valeur(ex)).toBeLessThanOrEqual(20);
      expect((xs.reduce((a, b) => a + b, 0) + valeur(ex)) / n).toBe(mean);
    }
    for (const ex of t('2nde-moyenne', 'ajout')) {
      const [n, mean, extra] = nombres(ex.prompt);
      expect(valeur(ex)).toBeCloseTo((n * mean + extra) / (n + 1));
    }
    for (const ex of t('2nde-moyenne-ponderee', 'coefficients')) {
      const pairs = [...ex.prompt.matchAll(/\$(\d+)\$ \(coefficient \$(\d+)\$\)/g)].map((m) => [Number(m[1]), Number(m[2])]);
      const C = pairs.reduce((a, [, c]) => a + c, 0);
      expect(valeur(ex)).toBeCloseTo(pairs.reduce((a, [v, c]) => a + v * c, 0) / C);
    }
    for (const ex of t('2nde-moyenne-ponderee', 'note-necessaire')) {
      const [m, C, c, target] = nombres(ex.prompt);
      expect((m * C + valeur(ex) * c) / (C + c)).toBeCloseTo(target);
      expect(m).toBeLessThanOrEqual(20);
    }
    for (const ex of t('2nde-moyenne-transformee', 'fahrenheit')) expect(valeur(ex)).toBeCloseTo(1.8 * nombres(ex.prompt)[0] + 32);
    for (const ex of t('2nde-moyenne-transformee', 'retrouver')) {
      const a = ex.prompt.includes('multiplie') ? 2 : 1;
      const b = (ex.prompt.includes('ajoute') ? 1 : -1) * Number(/(?:ajoute|retire) \$(\d+)\$/.exec(ex.prompt)![1]);
      const result = Number(/moyenne est \$(\d+)\$/.exec(ex.prompt)![1]);
      expect(a * valeur(ex) + b).toBe(result);
    }
  });

  it('lit médianes, quartiles et étendues', () => {
    for (const ex of t('2nde-mediane', 'tableau')) expect(valeur(ex)).toBeCloseTo(median(effectifs(ex.prompt)));
    for (const ex of t('2nde-quartiles', 'tableau')) {
      const q = ex.prompt.includes('premier') ? 1 : 3;
      expect(valeur(ex)).toBe(quartile(effectifs(ex.prompt), q));
    }
    for (const ex of t('2nde-mediane', 'moyenne-ou-mediane')) {
      const xs = nombres(ex.prompt);
      const mean = xs.reduce((a, b) => a + b, 0) / xs.length;
      const m = median(xs);
      expect(optionJuste(ex)).toBe(mean > m ? 'La moyenne' : mean < m ? 'La médiane' : 'Ils sont égaux');
    }
    for (const ex of t('2nde-quartiles', 'interpretation')) expect(optionJuste(ex)).toBe(ex.prompt.includes('premier') ? '$25\\,\\%$' : '$75\\,\\%$');
    for (const ex of t('2nde-etendue', 'valeur-manquante')) {
      const [e, v] = nombres(ex.prompt);
      expect(valeur(ex)).toBe(ex.prompt.includes('plus petite valeur est') ? v + e : v - e);
    }
    for (const ex of t('2nde-etendue', 'valeur-extreme')) {
      const xs = nombres(ex.prompt.split('. ')[0].split('on remplace')[0]);
      const [old, big] = nombres(ex.prompt.split('on remplace')[1]);
      const ys = [...xs.filter((_, i) => i !== xs.lastIndexOf(old)), big];
      const before = ex.prompt.includes('L’étendue') ? Math.max(...xs) - Math.min(...xs) : quartile(xs, 3) - quartile(xs, 1);
      const after = ex.prompt.includes('L’étendue') ? Math.max(...ys) - Math.min(...ys) : quartile(ys, 3) - quartile(ys, 1);
      expect(optionJuste(ex)).toBe(before !== after ? 'Oui' : 'Non');
    }
  });
});

describe('variantes de 2nde : variations', () => {
  it('lit les tableaux de variations', () => {
    for (const ex of t('2nde-extremum-tableau', 'nombre-solutions')) {
      const { xs, ys } = tableauVariations(ex.prompt);
      expect(xs.length).toBe(ys.length);
      const k = Number(/f\(x\) = (-?\d+)\$ a-t-elle/.exec(ex.prompt)![1]);
      let c = 0;
      for (let i = 0; i + 1 < ys.length; i++) if ((ys[i] - k) * (ys[i + 1] - k) < 0) c++;
      expect(ys.includes(k)).toBe(false);
      expect(valeur(ex)).toBe(c);
    }
    for (const ex of t('2nde-extremum-tableau', 'ou-atteint')) {
      const { xs, ys } = tableauVariations(ex.prompt);
      const v = ex.prompt.includes('maximum') ? Math.max(...ys) : Math.min(...ys);
      expect(valeur(ex)).toBe(xs[ys.indexOf(v)]);
    }
    for (const ex of t('2nde-comparer-tableau', 'tableau')) {
      const { xs, ys } = tableauVariations(ex.prompt);
      const [a, b] = [...ex.prompt.matchAll(/Compare \$f\((-?[\d{},]+)\)\$ et \$f\((-?[\d{},]+)\)\$/g)][0].slice(1).map(lireNombre);
      const i = xs.findIndex((x, j) => j + 1 < xs.length && a >= x && a <= xs[j + 1] && b >= x && b <= xs[j + 1]);
      expect(i, ex.prompt).toBeGreaterThanOrEqual(0);
      const smaller = (a < b) === ys[i + 1] > ys[i];
      expect(optionJuste(ex)).toContain(smaller ? '<' : '>');
    }
    for (const ex of t('2nde-comparer-tableau', 'sans-conclusion')) expect(optionJuste(ex)).toBe('On ne peut pas conclure');
  });

  it('étudie fonctions affines et du second degré', () => {
    for (const ex of t('2nde-sens-affine', 'deux-images')) {
      const [y1, y2] = [...ex.prompt.matchAll(/f\(-?\d+\) = (-?\d+)/g)].map((m) => Number(m[1]));
      expect(optionJuste(ex)).toBe(y2 > y1 ? 'Croissante' : y2 < y1 ? 'Décroissante' : 'Constante');
    }
    for (const ex of t('2nde-sens-affine', 'comparer')) {
      const f = /f\(x\) = (.+)\$\. Sans/.exec(ex.prompt)![1];
      const [a, b] = [...ex.prompt.matchAll(/compare \$f\((-?[\d{},]+)\)\$ et \$f\((-?[\d{},]+)\)\$/g)][0].slice(1).map(lireNombre);
      expect(optionJuste(ex)).toContain(texEval(f, a) < texEval(f, b) ? '<' : '>');
    }
    for (const ex of t('2nde-extremum-affine', 'image-intervalle')) {
      const f = /f\(x\) = (.+)\$\. Quand/.exec(ex.prompt)![1];
      const [, lo, hi] = /parcourt \$\[(-?\d+)\\,;\\,(-?\d+)\]\$/.exec(ex.prompt)!.map(Number);
      const vals = [texEval(f, lo), texEval(f, hi)];
      const S = optionJuste(ex);
      expect(dans(S, Math.min(...vals)) && dans(S, Math.max(...vals)) && !dans(S, Math.min(...vals) - 0.5) && !dans(S, Math.max(...vals) + 0.5)).toBe(true);
    }
    for (const ex of t('2nde-extremum-affine', 'concret')) {
      const f = /T\(x\) = (.+)\$, pour/.exec(ex.prompt)![1];
      const h = Number(/et \$(\d+)\$\./.exec(ex.prompt)![1]);
      expect(valeur(ex)).toBe(Math.min(texEval(f, 0), texEval(f, h)));
    }
    for (const ex of t('2nde-variations-carre', 'sur-un-intervalle')) {
      const f = /f\(x\) = (.+)\$ est-elle/.exec(ex.prompt)![1];
      const [, p, q] = /\$\[(-?\d+)\\,;\\,(-?\d+)\]\$/.exec(ex.prompt)!.map(Number);
      const up = texEval(f, q) > texEval(f, p) && texEval(f, (p + q) / 2) > texEval(f, p);
      expect(optionJuste(ex)).toBe(up ? 'Croissante' : 'Décroissante');
    }
    for (const ex of t('2nde-variations-carre', 'forme-developpee')) {
      const f = /f\(x\) = (.+)\$ s'écrit/.exec(ex.prompt)![1];
      const a = valeur(ex);
      expect(texEval(f, a - 1)).toBeCloseTo(texEval(f, a + 1));
      expect(texEval(f, a)).toBeLessThan(texEval(f, a + 1));
    }
    for (const ex of t('2nde-extremum-carre', 'balle')) {
      const f = /h\(t\) = (.+)\$, où/.exec(ex.prompt)![1].replace(/t/g, 'x');
      const max = Math.max(...Array.from({ length: 1001 }, (_, i) => texEval(f, i / 100)));
      expect(valeur(ex)).toBeCloseTo(max);
    }
    for (const ex of t('2nde-extremum-carre', 'vrai-faux')) {
      const [, f, op, k] = /\$(.+) (\\geq|\\leq) (-?\d+)\$\.$/.exec(ex.prompt)!;
      const vals = Array.from({ length: 2001 }, (_, i) => texEval(f.slice(f.lastIndexOf('$') + 1), -10 + i / 100));
      const ok = op === '\\geq' ? Math.min(...vals) >= Number(k) - 1e-9 : Math.max(...vals) <= Number(k) + 1e-9;
      expect(optionJuste(ex), ex.prompt).toBe(ok ? 'Vrai' : 'Faux');
    }
  });
});

describe('variantes de 2nde : vecteurs', () => {
  const vec = (s: string, name: string) => {
    const m = new RegExp(`\\\\vec\\{${name}\\}\\\\begin\\{pmatrix\\}(-?\\d+)\\\\\\\\(-?\\d+)\\\\end`).exec(s)!;
    return [Number(m[1]), Number(m[2])];
  };
  it('calcule avec les coordonnées', () => {
    for (const ex of t('2nde-coord-vecteur', 'extremite')) {
      const { A } = points(ex.prompt);
      const u = vec(ex.prompt, 'u');
      expect(paire(ex)).toEqual([A[0] + u[0], A[1] + u[1]]);
    }
    for (const ex of t('2nde-coord-vecteur', 'egalite')) {
      const { A, B, C, D } = points(ex.prompt);
      expect(optionJuste(ex)).toBe(B[0] - A[0] === D[0] - C[0] && B[1] - A[1] === D[1] - C[1] ? 'Oui' : 'Non');
    }
    for (const ex of t('2nde-combinaison', 'vecteur-manquant')) {
      const u = vec(ex.prompt, 'u');
      const w = vec(ex.prompt, 'w');
      expect(paire(ex)).toEqual([w[0] - u[0], w[1] - u[1]]);
    }
    for (const ex of t('2nde-combinaison', 'chasles')) {
      const m = /\\overrightarrow\{(\w)(\w)\} ([+-]) \\overrightarrow\{(\w)(\w)\}/.exec(ex.prompt)!;
      // Chaque point est un vecteur position aléatoire : on vérifie l'égalité vectorielle.
      const pos: Record<string, number> = {};
      for (const l of [m[1], m[2], m[4], m[5]]) pos[l] ??= l.charCodeAt(0) ** 2 % 97;
      const v = (a: string, b: string) => pos[b] - pos[a];
      const lhs = v(m[1], m[2]) + (m[3] === '+' ? 1 : -1) * v(m[4], m[5]);
      const r = /\\overrightarrow\{(\w)(\w)\}/.exec(optionJuste(ex))!;
      expect(v(r[1], r[2])).toBe(lhs);
    }
    for (const ex of t('2nde-translation', 'antecedent')) {
      const { A, B, D } = points(ex.prompt);
      const C = paire(ex);
      expect([D[0] - C[0], D[1] - C[1]]).toEqual([B[0] - A[0], B[1] - A[1]]);
    }
    for (const ex of t('2nde-translation', 'vecteur')) {
      const [A, A2] = [...ex.prompt.matchAll(/A'?\((-?\d+)\\,;\\,(-?\d+)\)/g)].map((m) => [Number(m[1]), Number(m[2])]);
      expect(paire(ex)).toEqual([A2[0] - A[0], A2[1] - A[1]]);
    }
    for (const ex of t('2nde-parallelogramme', 'est-parallelogramme')) {
      const { A, B, C, D } = points(ex.prompt);
      expect(optionJuste(ex)).toBe(B[0] - A[0] === C[0] - D[0] && B[1] - A[1] === C[1] - D[1] ? 'Oui' : 'Non');
    }
    for (const ex of t('2nde-parallelogramme', 'sommet-B')) {
      const { A, C, D } = points(ex.prompt);
      const B = paire(ex);
      expect([B[0] - A[0], B[1] - A[1]]).toEqual([C[0] - D[0], C[1] - D[1]]);
    }
  });

  it('teste colinéarités et alignements', () => {
    for (const ex of t('2nde-colinearite', 'alignes')) {
      const { A, B, C } = points(ex.prompt);
      const d = (B[0] - A[0]) * (C[1] - A[1]) - (B[1] - A[1]) * (C[0] - A[0]);
      expect(optionJuste(ex)).toBe(d === 0 ? 'Oui' : 'Non');
    }
    for (const ex of t('2nde-colinearite', 'coefficient')) {
      const u = vec(ex.prompt, 'u');
      const v = vec(ex.prompt, 'v');
      expect(v[0]).toBeCloseTo(valeur(ex) * u[0]);
      expect(v[1]).toBeCloseTo(valeur(ex) * u[1]);
    }
    for (const ex of t('2nde-colineaire-m', 'alignement')) {
      const { A, B } = points(ex.prompt);
      const cx = Number(/C\((-?\d+)\\,;\\,m\)/.exec(ex.prompt)![1]);
      const m = valeur(ex);
      expect((B[0] - A[0]) * (m - A[1]) - (B[1] - A[1]) * (cx - A[0])).toBe(0);
    }
    for (const ex of t('2nde-colineaire-m', 'paralleles')) {
      const [a, b, c] = [...ex.prompt.matchAll(/\\begin\{pmatrix\}(-?\d+)\\\\(-?\d+|m)\\end/g)].flatMap((m) => [m[1], m[2]]).filter((x) => x !== 'm').map(Number);
      expect(a * valeur(ex) - b * c).toBeCloseTo(0);
    }
  });
});
