import { type Fait, type Variantes, qcmBanque, vraiFauxBanque } from '../../licenceVariantes';
import { F, affine, fixedChoice, linComb, num, numF, pairOf, setOf, tex } from '../util';

/** Variantes du chapitre « Systèmes linéaires » (feuille bibmath « Systèmes linéaires »). */

const SYSTEMES: Fait[] = [
  { s: 'Un système linéaire homogène a toujours au moins une solution.', v: true, why: 'Le vecteur nul en est une.' },
  { s: 'Un système de $n$ équations à $n$ inconnues a toujours une unique solution.', v: false, why: '$x + y = 1$, $x + y = 2$ n’en a aucune.' },
  { s: 'Un système homogène avec plus d’inconnues que d’équations a une infinité de solutions.', v: true, why: 'Le rang est au plus le nombre d’équations, donc il reste des inconnues libres.' },
  { s: 'Un système linéaire peut avoir exactement deux solutions.', v: false, why: 'Si $X_1 \\neq X_2$ sont solutions, tous les $X_1 + t(X_2 - X_1)$ le sont aussi : il y en a alors une infinité.' },
  { s: 'Échanger deux lignes d’un système ne change pas l’ensemble des solutions.', v: true, why: 'C’est une opération élémentaire.' },
  { s: 'Remplacer $L_1$ par $0 \\cdot L_1 + L_2$ ne change pas l’ensemble des solutions.', v: false, why: 'Multiplier une ligne par $0$ perd de l’information : seules les dilatations par un scalaire non nul sont permises.' },
  { s: 'Un système carré a une unique solution si et seulement si son déterminant est non nul.', v: true, why: 'C’est le cas où la matrice est inversible (système de Cramer).' },
  { s: 'Si un système carré a un déterminant nul, il n’a aucune solution.', v: false, why: 'Il peut aussi en avoir une infinité, par exemple $x + y = 0$, $2x + 2y = 0$.' },
];

export const SYSTEMES_VARIANTES: Variantes = {
  'l1-systeme-2x2': [
    // Problème concret : tarifs.
    (rng) => {
      const [x, y] = [rng.int(4, 15), rng.int(2, 10)];
      let [a, b, c, d] = [rng.int(1, 5), rng.int(1, 5), rng.int(1, 5), rng.int(1, 5)];
      while (a * d - b * c === 0) [a, b, c, d] = [rng.int(1, 5), rng.int(1, 5), rng.int(1, 5), rng.int(1, 5)];
      const [lieu, [s1, p1, art1], [s2, p2, art2]] = rng.pick([
        ['Au cinéma', ['place adulte', 'places adultes', 'une'], ['place enfant', 'places enfants', 'une']],
        ['À la boulangerie', ['baguette', 'baguettes', 'une'], ['croissant', 'croissants', 'un']],
        ['Au parc aquatique', ['entrée adulte', 'entrées adultes', 'une'], ['entrée étudiante', 'entrées étudiantes', 'une']],
      ] as const);
      const w = (n: number, sing: string, plur: string) => `$${n}$ ${n > 1 ? plur : sing}`;
      return {
        prompt: `${lieu}, ${w(a, s1, p1)} et ${w(c, s2, p2)} coûtent $${a * x + c * y}$ €, tandis que ${w(b, s1, p1)} et ${w(d, s2, p2)} coûtent $${b * x + d * y}$ €. Donne le prix $x$ d’${art1} ${s1} et le prix $y$ d’${art2} ${s2}.`,
        answer: pairOf(x, y, ['x', 'y']),
        hint: 'Traduis l’énoncé en un système de deux équations, puis résous par combinaison.',
        correction: [`$\\begin{cases} ${a}x + ${c}y &= ${a * x + c * y} \\\\ ${b}x + ${d}y &= ${b * x + d * y} \\end{cases}$`, `$x = ${x}$ et $y = ${y}$`],
      };
    },
    // Intersection de deux droites.
    (rng) => {
      const x = rng.int(-5, 5);
      const y = rng.int(-5, 5);
      const a = rng.nonZero(-4, 4);
      let c = rng.nonZero(-4, 4);
      while (c === a) c = rng.nonZero(-4, 4);
      const b = y - a * x;
      const d = y - c * x;
      return {
        prompt: `Donne les coordonnées du point d’intersection des droites $y = ${affine(a, b)}$ et $y = ${affine(c, d)}$.`,
        answer: pairOf(x, y, ['x', 'y']),
        hint: 'Égalise les deux expressions de $y$.',
        correction: [`$${affine(a, b)} = ${affine(c, d)} \\iff ${a - c === 1 ? '' : a - c === -1 ? '-' : a - c}x = ${d - b}$, donc $x = ${x}$`, `$y = ${y}$`],
      };
    },
    // Problème d'âges.
    (rng) => {
      const enfant = rng.int(5, 15);
      const parent = enfant + rng.int(20, 35);
      const n = rng.int(3, 10);
      const sum = parent + enfant;
      return {
        prompt: `Un parent et son enfant ont ensemble $${sum}$ ans. Dans $${n}$ ans, l’écart d’âge sera toujours de $${parent - enfant}$ ans. Donne l’âge $x$ du parent et $y$ de l’enfant aujourd’hui.`,
        answer: pairOf(parent, enfant, ['x', 'y']),
        hint: 'L’écart d’âge ne change pas avec le temps : $x - y$ est connu.',
        correction: [`$x + y = ${sum}$ et $x - y = ${parent - enfant}$`, `$x = ${parent}$ et $y = ${enfant}$`],
      };
    },
  ],
  'l1-systeme-3x3': [
    // Parabole passant par trois points.
    (rng) => {
      const [a, b, c] = [rng.nonZero(-3, 3), rng.int(-4, 4), rng.int(-5, 5)];
      const xs = rng.shuffle([-2, -1, 0, 1, 2, 3]).slice(0, 3).sort((u, v) => u - v);
      const pts = xs.map((x) => [x, a * x * x + b * x + c]);
      const ask = rng.pick(['a', 'b', 'c'] as const);
      return {
        prompt: `La parabole $y = ax^2 + bx + c$ passe par les points $${pts.map(([x, y]) => `(${x}, ${y})`).join(', ')}$. Que vaut $${ask}$ ?`,
        answer: num({ a, b, c }[ask]),
        hint: 'Chaque point donne une équation linéaire en $(a, b, c)$.',
        correction: [`$${pts.map(([x, y]) => `${linComb([[x * x, 'a'], [x, 'b'], [1, 'c']])} = ${y}`).join(',\\ ')}$`, `On trouve $a = ${a}$, $b = ${b}$, $c = ${c}$.`],
      };
    },
    // Problème concret à trois inconnues.
    (rng) => {
      const [r, t] = [rng.int(1, 5), rng.int(1, 5)];
      const l = r + t;
      let [p, q] = [rng.int(1, 5), rng.int(1, 5)];
      while (p === q) q = rng.int(1, 5);
      const s = rng.int(1, 4);
      const A = p * r + q * t + s * l;
      const ask = rng.pick(['rose', 'tulipe', 'lys'] as const);
      return {
        prompt: `Chez un fleuriste, un bouquet de $${p}$ roses, $${q}$ tulipes et $${s}$ lys coûte $${A}$ € ; un bouquet d’une fleur de chaque coûte $${2 * l}$ € ; un lys coûte autant qu’une rose et une tulipe ensemble. Combien coûte ${ask === 'lys' ? 'un lys' : `une ${ask}`} (en €) ?`,
        answer: num({ rose: r, tulipe: t, lys: l }[ask]),
        hint: 'Avec $L = R + T$, la deuxième information donne $L$ directement.',
        correction: [`$R + T + L = 2L = ${2 * l}$, donc $L = ${l}$ et $R + T = ${l}$.`, `Puis $${p}R + ${q}T = ${A - s * l}$ donne $R = ${r}$ et $T = ${t}$.`],
      };
    },
  ],
  'l1-systeme-nombre-solutions': [
    (rng) => vraiFauxBanque(rng, SYSTEMES),
    (rng) => qcmBanque(rng, SYSTEMES, rng.next() < 0.5),
    // Droites sécantes, parallèles ou confondues.
    (rng) => {
      const a = rng.nonZero(-4, 4);
      const b = rng.nonZero(-4, 4);
      const c = rng.int(-6, 6);
      const kind = rng.int(0, 2);
      const k = rng.pick([2, -1, 3, -2]);
      const [a2, b2, c2] = kind === 0 ? [a + rng.nonZero(1, 2), b, c + 1] : kind === 1 ? [k * a, k * b, k * c + rng.nonZero(-3, 3)] : [k * a, k * b, k * c];
      const det = a * b2 - a2 * b;
      const n = det !== 0 ? 1 : c2 === k * c ? 2 : 0;
      return {
        prompt: `Combien le système $\\begin{cases} ${linComb([[a, 'x'], [b, 'y']])} &= ${c} \\\\ ${linComb([[a2, 'x'], [b2, 'y']])} &= ${c2} \\end{cases}$ a-t-il de solutions ?`,
        answer: fixedChoice(['Aucune', 'Une seule', 'Une infinité'], n === 0 ? 0 : n === 1 ? 1 : 2),
        hint: 'Ce sont deux droites du plan : sécantes, parallèles ou confondues ?',
        correction: [det !== 0 ? `Déterminant $${det} \\neq 0$ : droites sécantes, une seule solution.` : n === 2 ? `La seconde équation est $${k}$ fois la première : droites confondues, une infinité de solutions.` : 'Coefficients proportionnels mais seconds membres non : droites parallèles, aucune solution.'],
      };
    },
  ],
  'l1-systeme-parametre': [
    // Second membre pour une infinité de solutions.
    (rng) => {
      const a = rng.nonZero(1, 4);
      const b = rng.nonZero(-4, 4);
      const c = rng.int(-6, 6);
      const k = rng.pick([2, 3, -2]);
      return {
        prompt: `Pour quelle valeur de $m$ le système $\\begin{cases} ${linComb([[a, 'x'], [b, 'y']])} &= ${c} \\\\ ${linComb([[k * a, 'x'], [k * b, 'y']])} &= m \\end{cases}$ a-t-il une infinité de solutions ?`,
        answer: num(k * c),
        hint: 'La seconde ligne doit être exactement un multiple de la première.',
        correction: [`$L_2 = ${k}L_1$ si et seulement si $m = ${k} \\times ${c < 0 ? `(${c})` : c} = ${k * c}$.`],
      };
    },
    // Déterminant en m : m² = ab.
    (rng) => {
      const s = rng.int(1, 5);
      const [p, q] = rng.pick([[1, s * s], [s, s], [s * s, 1]]);
      return {
        prompt: `Pour quelles valeurs de $m$ le système $\\begin{cases} mx + ${p === 1 ? '' : p}y &= 1 \\\\ ${q === 1 ? '' : q}x + my &= 0 \\end{cases}$ n’a-t-il pas une unique solution ?`,
        answer: setOf([s, -s]),
        hint: 'Il n’y a pas unicité quand le déterminant s’annule.',
        correction: [`$\\det = m^2 - ${p * q} = 0 \\iff m = \\pm ${s}$`],
      };
    },
    // Paramètre dans le second membre et solution.
    (rng) => {
      const a = rng.int(1, 3);
      const m = rng.int(-5, 5);
      // x + y = m, x − y = a : x = (m + a)/2.
      return {
        prompt: `$\\begin{cases} x + y &= m \\\\ x - y &= ${a} \\end{cases}$. Pour quelle valeur de $m$ a-t-on $x = ${tex(F(m + a, 2))}$ ?`,
        answer: numF(F(m)),
        hint: 'Additionne les deux équations.',
        correction: [`$2x = m + ${a}$, donc $m = 2x - ${a} = ${m}$`],
      };
    },
  ],
};

export const BANQUES_SYSTEMES = { SYSTEMES };
