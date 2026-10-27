import { sumLatex } from '../../latex';
import { type Fait, type Variantes, qcmBanque, vraiFauxBanque } from '../../licenceVariantes';
import { F, add, div, mul, num, numF, par, sub, tex } from '../util';

/**
 * Variantes des chapitres « Fonctions de plusieurs variables » et « Intégrales doubles » de L2
 * (feuilles bibmath « Calcul différentiel », « Intégrales multiples »).
 */

const DIFFERENTIEL: Fait[] = [
  { s: 'Si $f$ admet des dérivées partielles en un point, elle est continue en ce point.', v: false, why: '$f(x, y) = \\frac{xy}{x^2 + y^2}$, $f(0, 0) = 0$ : dérivées partielles nulles en $0$, mais $f$ n’est pas continue en $0$.' },
  { s: 'Une fonction de classe $\\mathcal{C}^1$ est différentiable.', v: true, why: 'C’est le théorème fondamental du calcul différentiel.' },
  { s: 'En un extremum local intérieur d’une fonction différentiable, le gradient est nul.', v: true, why: 'Chaque fonction partielle a un extremum, donc une dérivée nulle.' },
  { s: 'Un point où le gradient est nul est un extremum local.', v: false, why: '$f(x, y) = x^2 - y^2$ : gradient nul en $(0, 0)$, qui est un point col.' },
  { s: 'Si $f$ est $\\mathcal{C}^2$, alors $\\frac{\\partial^2 f}{\\partial x \\partial y} = \\frac{\\partial^2 f}{\\partial y \\partial x}$.', v: true, why: 'C’est le théorème de Schwarz.' },
  { s: 'En un point critique, si $rt - s^2 > 0$ et $r > 0$, c’est un minimum local.', v: true, why: 'La hessienne est alors définie positive.' },
  { s: 'En un point critique, si $rt - s^2 < 0$, c’est un point col.', v: true, why: 'La hessienne a une valeur propre positive et une négative.' },
  { s: 'En un point critique, si $rt - s^2 = 0$, ce n’est jamais un extremum.', v: false, why: 'On ne peut pas conclure : $x^4 + y^4$ a un minimum en $(0, 0)$ avec $rt - s^2 = 0$.' },
  { s: 'Le gradient indique la direction de plus forte croissance de $f$.', v: true, why: '$D_uf = \\langle \\nabla f, u\\rangle$ est maximale quand $u$ est colinéaire à $\\nabla f$, de même sens.' },
  { s: 'Le gradient est orthogonal aux lignes de niveau.', v: true, why: 'Le long d’une ligne de niveau, $f$ est constante : $\\langle \\nabla f, \\gamma\'\\rangle = 0$.' },
  { s: 'Une fonction continue sur un fermé borné de $\\mathbb{R}^2$ y atteint ses bornes.', v: true, why: 'Un fermé borné de $\\mathbb{R}^2$ est compact.' },
];

const DOUBLES: Fait[] = [
  { s: 'Si $f$ est continue sur $[a, b] \\times [c, d]$, on peut intégrer dans l’ordre que l’on veut.', v: true, why: 'C’est le théorème de Fubini.' },
  { s: '$\\iint_{[a, b] \\times [c, d]} g(x)h(y)\\,dx\\,dy = \\int_a^b g \\times \\int_c^d h$.', v: true, why: 'Fubini sur un produit de fonctions à variables séparées.' },
  { s: 'En coordonnées polaires, $dx\\,dy = dr\\,d\\theta$.', v: false, why: 'Il manque le jacobien : $dx\\,dy = r\\,dr\\,d\\theta$.' },
  { s: '$\\iint_D 1\\,dx\\,dy$ est l’aire de $D$.', v: true, why: 'C’est la définition de l’aire d’un domaine.' },
  { s: 'Si $f \\geq 0$ et $\\iint_D f = 0$ avec $f$ continue sur le disque $D$, alors $f = 0$ sur $D$.', v: true, why: 'Sinon $f$ serait $> 0$ sur un petit disque, d’intégrale strictement positive.' },
  { s: 'Le jacobien d’un changement de variables linéaire est son déterminant.', v: true, why: 'La différentielle d’une application linéaire est elle-même.' },
  { s: 'Une application linéaire de déterminant $3$ multiplie les aires par $9$.', v: false, why: 'Elle les multiplie par $|\\det| = 3$.' },
  { s: '$\\iint_{x^2 + y^2 \\leq R^2} dx\\,dy = 2\\pi R$.', v: false, why: 'C’est le périmètre ; l’aire vaut $\\int_0^{2\\pi}\\int_0^R r\\,dr\\,d\\theta = \\pi R^2$.' },
  { s: 'Si $f(-x, y) = -f(x, y)$ et $D$ est symétrique par rapport à l’axe des ordonnées, alors $\\iint_D f = 0$.', v: true, why: 'Les contributions de $D \\cap \\{x > 0\\}$ et $D \\cap \\{x < 0\\}$ se compensent.' },
  { s: '$\\int_{-\\infty}^{+\\infty} e^{-x^2}\\,dx = \\sqrt{\\pi}$.', v: true, why: 'On calcule son carré comme intégrale double en polaires : $\\pi$.' },
];

const NATURES_COL = ['Minimum local', 'Maximum local', 'Point col', 'On ne peut pas conclure'];

/** a x² + b xy + c y² en LaTeX. */
const q2 = (a: number, b: number, c: number) => sumLatex([
  [a, 'x^2'],
  [b, 'xy'],
  [c, 'y^2'],
]);

export const PLUSIEURS_VARIABLES_L2_VARIANTES: Variantes = {
  'l2-derivee-partielle': [
    // Dérivée seconde croisée d'un monôme.
    (rng, level) => {
      const c = rng.nonZero(-3, 3);
      const p = rng.int(1, level + 1);
      const q = rng.int(1, level + 1);
      const a = rng.int(-2, 2);
      const b = rng.int(-2, 2);
      const v = c * p * q * a ** (p - 1) * b ** (q - 1);
      return {
        prompt: `$f(x, y) = ${c === 1 ? '' : c === -1 ? '-' : c}x^{${p}}y^{${q}}$. Calcule $\\dfrac{\\partial^2 f}{\\partial x\\,\\partial y}(${a}, ${b})$.`,
        answer: num(v),
        hint: 'Dérive par rapport à $y$, puis par rapport à $x$ (l’ordre n’importe pas, d’après Schwarz).',
        correction: [`$\\dfrac{\\partial^2 f}{\\partial x\\,\\partial y} = ${c * p * q}x^{${p - 1}}y^{${q - 1}}$`.replace(/[xy]\^\{0\}/g, ''), `En $(${a}, ${b})$ : $${v}$`],
      };
    },
    (rng) => vraiFauxBanque(rng, DIFFERENTIEL),
  ],
  'l2-gradient': [
    // Question inverse : retrouver f à partir de son gradient.
    (rng) => {
      const a = rng.int(-3, 3);
      const b = rng.nonZero(-3, 3);
      const c = rng.int(-3, 3);
      const [p, q] = [rng.int(-3, 3), rng.int(-3, 3)];
      const v = a * p * p + b * p * q + c * q * q;
      return {
        prompt: `$f$ vérifie $f(0, 0) = 0$ et $\\nabla f(x, y) = \\left(${sumLatex([[2 * a, 'x'], [b, 'y']])},\\ ${sumLatex([[b, 'x'], [2 * c, 'y']])}\\right)$. Calcule $f(${p}, ${q})$.`,
        answer: num(v),
        hint: 'Cherche $f$ de la forme $ax^2 + bxy + cy^2$ et identifie ses dérivées partielles.',
        correction: [`$f(x, y) = ${q2(a, b, c)}$`, `$f(${p}, ${q}) = ${v}$`],
      };
    },
    (rng) => qcmBanque(rng, DIFFERENTIEL),
  ],
  'l2-point-critique': [
    // Nombre de points critiques de x³ − 3a x + y² + b y.
    (rng) => {
      const a = rng.pick([-4, -1, 0, 1, 4, 9]);
      const b = rng.int(-4, 4);
      const n = a > 0 ? 2 : a === 0 ? 1 : 0;
      return {
        prompt: `Combien de points critiques a la fonction $f(x, y) = ${sumLatex([
          [1, 'x^3'],
          [-3 * a, 'x'],
          [1, 'y^2'],
          [b, 'y'],
        ])}$ ?`,
        answer: num(n),
        hint: 'Résous $\\frac{\\partial f}{\\partial x} = 0$ et $\\frac{\\partial f}{\\partial y} = 0$ séparément.',
        correction: [`$\\frac{\\partial f}{\\partial x} = ${sumLatex([[3, 'x^2'], [-3 * a, '']])} = 0 \\iff x^2 = ${a}$`, `$\\frac{\\partial f}{\\partial y} = 0$ donne une seule valeur de $y$.`, `Nombre de points critiques : $${n}$`],
      };
    },
    (rng) => vraiFauxBanque(rng, DIFFERENTIEL),
  ],
  'l2-nature-point-critique': [
    // Calcul de rt − s² pour une forme quadratique.
    (rng) => {
      const a = rng.nonZero(-4, 4);
      const b = rng.int(-5, 5);
      const c = rng.nonZero(-4, 4);
      const d = 4 * a * c - b * b;
      const kind = d > 0 ? (a > 0 ? 0 : 1) : d < 0 ? 2 : 3;
      return {
        prompt: `$f(x, y) = ${q2(a, b, c)}$ a un point critique en $(0, 0)$. En notant $r = \\frac{\\partial^2 f}{\\partial x^2}$, $s = \\frac{\\partial^2 f}{\\partial x \\partial y}$, $t = \\frac{\\partial^2 f}{\\partial y^2}$, calcule $rt - s^2$.`,
        answer: num(d),
        hint: 'Pour $ax^2 + bxy + cy^2$ : $r = 2a$, $s = b$, $t = 2c$.',
        correction: [`$r = ${2 * a}$, $s = ${b}$, $t = ${2 * c}$`, `$rt - s^2 = ${2 * a}\\times${par(2 * c)} - ${par(b)}^2 = ${d}$ : ${NATURES_COL[kind].toLowerCase()}.`],
      };
    },
    (rng) => qcmBanque(rng, DIFFERENTIEL),
  ],
  'l2-derivee-directionnelle': [
    // Dérivée selon un vecteur unitaire pythagoricien.
    (rng) => {
      const [u1, u2, n] = rng.pick([
        [3, 4, 5],
        [4, 3, 5],
        [5, 12, 13],
        [-3, 4, 5],
        [3, -4, 5],
      ]);
      const a = rng.int(-3, 3);
      const b = rng.int(-3, 3);
      const c = rng.int(-3, 3);
      const [x, y] = [rng.int(-2, 2), rng.int(-2, 2)];
      const gx = 2 * a * x + b * y;
      const gy = b * x + 2 * c * y;
      const v = F(u1 * gx + u2 * gy, n);
      return {
        prompt: `$f(x, y) = ${q2(a, b, c)}$ et $u = \\left(${tex(F(u1, n))}, ${tex(F(u2, n))}\\right)$. Calcule la dérivée de $f$ en $(${x}, ${y})$ dans la direction $u$.`,
        answer: numF(v),
        hint: '$D_uf(p) = \\langle \\nabla f(p), u\\rangle$.',
        correction: [`$\\nabla f(${x}, ${y}) = (${gx}, ${gy})$`, `$D_uf = \\frac{${u1}\\times${par(gx)} + ${par(u2)}\\times${par(gy)}}{${n}} = ${tex(v)}$`],
      };
    },
    (rng) => vraiFauxBanque(rng, DIFFERENTIEL),
  ],
  'l2-double-rectangle': [
    // Valeur moyenne d'une fonction affine sur un rectangle.
    (rng) => {
      const [a, b] = [rng.int(1, 6), rng.int(1, 6)];
      const [al, be, ga] = [rng.int(-3, 3), rng.nonZero(-3, 3), rng.int(-4, 4)];
      const v = add(add(F(al * a, 2), F(be * b, 2)), F(ga));
      return {
        prompt: `Quelle est la valeur moyenne de $f(x, y) = ${sumLatex([[al, 'x'], [be, 'y'], [ga, '']])}$ sur le rectangle $[0\\,;\\,${a}]\\times[0\\,;\\,${b}]$ ?`,
        answer: numF(v),
        hint: 'Valeur moyenne $= \\dfrac{1}{\\text{aire}}\\iint_R f$. Pour une fonction affine, c’est la valeur au centre du rectangle.',
        correction: [`Centre : $\\left(${tex(F(a, 2))}, ${tex(F(b, 2))}\\right)$`, `$f$ y vaut $${tex(v)}$`],
      };
    },
    (rng) => vraiFauxBanque(rng, DOUBLES),
  ],
  'l2-double-polynome': [
    // Question inverse : quel coefficient donne une intégrale imposée ?
    (rng) => {
      const a = rng.nonZero(-4, 4);
      const m = rng.int(1, 3);
      const n = rng.int(1, 3);
      const V = rng.int(-2, 3);
      const k = mul(F(n + 1), sub(F(V), F(a, m + 1)));
      return {
        prompt: `Pour quelle valeur de $k$ a-t-on $\\displaystyle\\iint_{[0,1]^2} \\left(${a === 1 ? '' : a === -1 ? '-' : a}x^{${m}} + k\\,y^{${n}}\\right)dx\\,dy = ${V}$ ?`,
        answer: numF(k),
        hint: '$\\iint_{[0,1]^2} x^m\\,dx\\,dy = \\frac{1}{m + 1}$.',
        correction: [`$\\frac{${a}}{${m + 1}} + \\frac{k}{${n + 1}} = ${V}$`, `$k = ${n + 1}\\left(${V} - ${tex(F(a, m + 1)).startsWith('-') ? `\\left(${tex(F(a, m + 1))}\\right)` : tex(F(a, m + 1))}\\right) = ${tex(k)}$`],
      };
    },
    (rng) => qcmBanque(rng, DOUBLES),
  ],
  'l2-double-triangle': [
    // Aire entre deux courbes y = x^p et y = x^q sur [0, 1].
    (rng) => {
      const p = rng.int(1, 4);
      let q = rng.int(1, 5);
      if (q === p) q++;
      const [lo, hi] = p < q ? [q, p] : [p, q];
      const v = sub(F(1, hi + 1), F(1, lo + 1));
      return {
        prompt: `$D = \\{(x, y) : 0 \\leq x \\leq 1,\\ x^{${lo}} \\leq y \\leq x^{${hi}}\\}$. Calcule l’aire $\\displaystyle\\iint_D dx\\,dy$.`,
        answer: numF(v),
        hint: 'À $x$ fixé, $y$ parcourt $[x^{q}, x^{p}]$ : intègre d’abord en $y$.',
        correction: [`$\\displaystyle\\int_0^1 (x^{${hi}} - x^{${lo}})\\,dx = \\frac{1}{${hi + 1}} - \\frac{1}{${lo + 1}} = ${tex(v)}$`],
      };
    },
    (rng) => vraiFauxBanque(rng, DOUBLES),
  ],
  'l2-coordonnees-polaires': [
    // ∬ (x² + y²)^m sur un disque, un demi-disque ou un quart de disque.
    (rng, level) => {
      const R = rng.int(1, 3);
      const m = rng.int(0, level === 1 ? 1 : 2);
      const [part, f] = rng.pick([
        ['le disque', F(1)],
        ['le demi-disque supérieur', F(1, 2)],
        ['le quart de disque $x \\geq 0$, $y \\geq 0$', F(1, 4)],
      ] as const);
      // ∫₀^{2π}∫₀^R r^{2m+1} dr dθ = π R^{2m+2}/(m + 1)
      const k = mul(f, F(R ** (2 * m + 2), m + 1));
      const g = m === 0 ? '1' : m === 1 ? '(x^2 + y^2)' : `(x^2 + y^2)^{${m}}`;
      return {
        prompt: `$D$ est ${part} de centre $O$ et de rayon $${R}$. On a $\\displaystyle\\iint_D ${g}\\,dx\\,dy = k\\pi$ : donne $k$.`,
        answer: numF(k),
        hint: 'En polaires : $x^2 + y^2 = r^2$ et $dx\\,dy = r\\,dr\\,d\\theta$.',
        correction: [`$\\displaystyle\\int\\int r^{${2 * m + 1}}\\,dr\\,d\\theta = (\\text{angle}) \\times \\frac{${R}^{${2 * m + 2}}}{${2 * m + 2}}$`, `$k = ${tex(k)}$`],
      };
    },
    (rng) => qcmBanque(rng, DOUBLES, true),
  ],
  'l2-jacobien': [
    // Question inverse : choisir un coefficient pour obtenir un jacobien donné.
    (rng) => {
      const a = rng.nonZero(-3, 3);
      const b = rng.int(-3, 3);
      const c = rng.int(-3, 3);
      const J = rng.nonZero(-6, 6);
      // a k − b c = J
      const k = div(F(J + b * c), F(a));
      return {
        prompt: `$\\varphi(u, v) = (${sumLatex([[a, 'u'], [b, 'v']])},\\ ${c === 0 ? 'k\\,v' : `${sumLatex([[c, 'u']])} + k\\,v`})$. Pour quelle valeur de $k$ le jacobien de $\\varphi$ vaut-il $${J}$ ?`,
        answer: numF(k),
        hint: 'Le jacobien est le déterminant de la matrice $\\begin{pmatrix} \\partial_u x & \\partial_v x \\\\ \\partial_u y & \\partial_v y\\end{pmatrix}$.',
        correction: [`$J = ${a === 1 ? '' : a === -1 ? '-' : a}k - ${par(b)}\\times${par(c)} = ${J}$`, `$k = ${tex(k)}$`],
      };
    },
    (rng) => vraiFauxBanque(rng, DOUBLES),
  ],
};

export const BANQUES_PLUSIEURS_VARIABLES_L2 = { DIFFERENTIEL, DOUBLES };
