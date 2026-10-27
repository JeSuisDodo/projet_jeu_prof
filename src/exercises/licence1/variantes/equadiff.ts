import { type Fait, type Variantes, qcmBanque, vraiFauxBanque } from '../../licenceVariantes';
import { F, div, fixedChoice, linComb, num, numF, pairOf, par, tex } from '../util';

/** Variantes du chapitre « Équations différentielles » (feuille bibmath « Équations différentielles linéaires »). */

const lhs = (terms: [number, string][]) => linComb(terms);

const ED: Fait[] = [
  { s: 'Les solutions de $y\' = ay$ sur $\\mathbb{R}$ sont les fonctions $x \\mapsto Ce^{ax}$, $C \\in \\mathbb{R}$.', v: true, why: '$(ye^{-ax})\' = 0$ : $ye^{-ax}$ est constante.' },
  { s: 'Les solutions de $y\' = ay$ sont les fonctions $x \\mapsto e^{ax} + C$.', v: false, why: '$e^{ax} + C$ n’est solution que pour $C = 0$ (si $a \\neq 0$) : la constante multiplie, elle ne s’ajoute pas.' },
  { s: 'L’ensemble des solutions de $y\'\' + py\' + qy = 0$ est un espace vectoriel de dimension $2$.', v: true, why: 'Une solution est déterminée par $(y(0), y\'(0))$.' },
  { s: 'La somme de deux solutions de $y\' + ay = b$ (avec $b \\neq 0$) est encore une solution.', v: false, why: 'Elle vérifie $y\' + ay = 2b$ : seules les équations homogènes ont cette propriété.' },
  { s: 'La différence de deux solutions de $y\' + ay = b$ est solution de $y\' + ay = 0$.', v: true, why: 'Par linéarité, $b - b = 0$.' },
  { s: 'Une solution de $y\'\' + y = 0$ avec $y(0) = 0$ et $y\'(0) = 0$ est la fonction nulle.', v: true, why: 'Par unicité dans le théorème de Cauchy-Lipschitz linéaire.' },
  { s: 'Toute solution de $y\'\' + y = 0$ est bornée sur $\\mathbb{R}$.', v: true, why: 'Elle s’écrit $A\\cos x + B\\sin x$.' },
  { s: 'Toute solution de $y\'\' - y = 0$ est bornée sur $\\mathbb{R}$.', v: false, why: '$e^x$ en est une.' },
  { s: 'Si $r$ est racine double de l’équation caractéristique, $xe^{rx}$ est solution.', v: true, why: 'Les solutions sont $(\\lambda + \\mu x)e^{rx}$.' },
  { s: 'Si l’équation caractéristique a pour racines $\\alpha \\pm i\\beta$, les solutions réelles sont $e^{\\alpha x}(A\\cos\\beta x + B\\sin\\beta x)$.', v: true, why: 'On prend parties réelle et imaginaire de $e^{(\\alpha + i\\beta)x}$.' },
];

export const EQUADIFF_VARIANTES: Variantes = {
  'l1-ed-ordre1': [
    // Loi de refroidissement de Newton.
    (rng) => {
      const Ta = rng.int(15, 25);
      const T0 = rng.int(60, 95);
      const k = rng.pick([F(1, 10), F(1, 20), F(1, 5)]);
      const askC = rng.next() < 0.5;
      return {
        prompt: `Un café à $${T0}$ °C refroidit dans une pièce à $${Ta}$ °C selon $T'(t) = -${tex(k)}\\,(T(t) - ${Ta})$. ${askC ? 'On écrit $T(t) = ' + Ta + ' + Ce^{-' + tex(k) + 't}$ : que vaut $C$ ?' : 'Vers quelle température tend $T(t)$ quand $t \\to +\\infty$ ?'}`,
        answer: num(askC ? T0 - Ta : Ta),
        hint: '$z = T - T_a$ vérifie $z\' = -kz$, donc $z(t) = z(0)e^{-kt}$.',
        correction: [`$T(t) = ${Ta} + (${T0} - ${Ta})e^{-${tex(k)}t}$`, askC ? `$C = ${T0 - Ta}$` : `$e^{-${tex(k)}t} \\to 0$, donc $T(t) \\to ${Ta}$.`],
      };
    },
    // Solution d'équilibre de y' = ay + b.
    (rng) => {
      const a = rng.nonZero(-5, 5);
      const b = rng.nonZero(-8, 8);
      const v = F(-b, a);
      return {
        prompt: `Quelle est la solution constante de $y' = ${lhs([[a, 'y'], [b, '']])}$ ?`,
        answer: numF(v),
        hint: 'Une solution constante a une dérivée nulle.',
        correction: [`$0 = ${lhs([[a, 'y'], [b, '']])} \\iff y = ${tex(v)}$`],
      };
    },
    // Désintégration radioactive.
    (rng) => {
      const n = rng.int(1, 6);
      const T = rng.pick([5, 8, 12, 30]);
      return {
        prompt: `Un noyau radioactif suit $N' = -\\lambda N$, avec une demi-vie de $${T}$ ans. Quelle fraction de la quantité initiale reste-t-il au bout de $${n * T}$ ans ?`,
        answer: numF(F(1, 2 ** n)),
        hint: '$N(t) = N_0e^{-\\lambda t}$ et la quantité est divisée par $2$ à chaque demi-vie.',
        correction: [`$${n * T} = ${n} \\times ${T}$ : ${n} demi-vie${n > 1 ? 's' : ''}, donc $\\frac{1}{2^{${n}}} = ${tex(F(1, 2 ** n))}$.`],
      };
    },
  ],
  'l1-ed-equation-caracteristique': [
    // Équation dont on connaît deux solutions exponentielles.
    (rng) => {
      let r1 = rng.int(-4, 4);
      let r2 = rng.int(-4, 4);
      while (r1 === r2) r2 = rng.int(-4, 4);
      if (r1 > r2) [r1, r2] = [r2, r1];
      const e = (r: number) => (r === 0 ? '1' : `e^{${r === 1 ? '' : r === -1 ? '-' : r}x}`);
      return {
        prompt: `$x \\mapsto ${e(r1)}$ et $x \\mapsto ${e(r2)}$ sont solutions de $y'' + py' + qy = 0$. Donne $p$ et $q$.`,
        answer: pairOf(-(r1 + r2), r1 * r2, ['p', 'q']),
        hint: `$${r1}$ et $${r2}$ sont les racines de $r^2 + pr + q = 0$.`,
        correction: [`$p = -(${r1} + ${par(r2)}) = ${-(r1 + r2)}$ et $q = ${r1} \\times ${par(r2)} = ${r1 * r2}$`],
      };
    },
    // Oscillations : cos(ωx).
    (rng) => {
      const w = rng.int(1, 6);
      return {
        prompt: `$x \\mapsto \\cos(${w === 1 ? '' : w}x)$ est solution de $y'' + qy = 0$. Que vaut $q$ ?`,
        answer: num(w * w),
        hint: 'Dérive deux fois $\\cos(\\omega x)$.',
        correction: [`$(\\cos(${w === 1 ? '' : w}x))'' = -${w * w === 1 ? '' : w * w}\\cos(${w === 1 ? '' : w}x)$, donc $q = ${w * w}$.`],
      };
    },
    // Nature des racines.
    (rng) => {
      const p = rng.int(-6, 6);
      const q = rng.int(-6, 9);
      const d = p * p - 4 * q;
      return {
        prompt: `Pour $${lhs([[1, "y''"], [p, "y'"], [q, 'y']])} = 0$, l’équation caractéristique a :`,
        answer: fixedChoice(['Deux racines réelles distinctes', 'Une racine double', 'Deux racines complexes conjuguées'], d > 0 ? 0 : d === 0 ? 1 : 2),
        hint: 'Calcule le discriminant de $r^2 + pr + q$.',
        correction: [`$\\Delta = ${par(p)}^2 - 4 \\times ${par(q)} = ${d}$`],
      };
    },
  ],
  'l1-ed-ordre2-conditions': [
    // y'' + ω²y = 0.
    (rng) => {
      const w = rng.int(1, 4);
      const A = rng.int(-5, 5);
      const B = rng.int(-5, 5);
      const wx = `${w === 1 ? '' : w}x`;
      return {
        prompt: `$y'' + ${w * w === 1 ? '' : w * w}y = 0$ avec $y(0) = ${A}$ et $y'(0) = ${B * w}$. On écrit $y = A\\cos(${wx}) + B\\sin(${wx})$ : donne $A$ et $B$.`,
        answer: pairOf(A, B, ['A', 'B']),
        hint: '$y(0) = A$ et $y\'(0) = \\omega B$.',
        correction: [`$A = ${A}$ et $${w === 1 ? '' : w}B = ${B * w}$, soit $B = ${B}$.`],
      };
    },
    // Racine double.
    (rng) => {
      const r = rng.nonZero(-3, 3);
      const l = rng.int(-4, 4);
      const m = rng.int(-4, 4);
      const ex = `e^{${r === 1 ? '' : r === -1 ? '-' : r}x}`;
      return {
        prompt: `$${lhs([[1, "y''"], [-2 * r, "y'"], [r * r, 'y']])} = 0$ avec $y(0) = ${l}$ et $y'(0) = ${r * l + m}$. On écrit $y = (\\lambda + \\mu x)${ex}$ : donne $\\lambda$ et $\\mu$.`,
        answer: pairOf(l, m, ['\\lambda', '\\mu']),
        hint: '$y(0) = \\lambda$ et $y\'(0) = r\\lambda + \\mu$.',
        correction: [`$\\lambda = ${l}$, puis $${r}\\lambda + \\mu = ${r * l + m}$ donne $\\mu = ${m}$.`],
      };
    },
  ],
  'l1-ed-forme-solutions': [
    (rng) => vraiFauxBanque(rng, ED),
    (rng) => qcmBanque(rng, ED, rng.next() < 0.5),
    // Solutions bornées ?
    (rng) => {
      const p = rng.int(-4, 4);
      const q = rng.int(-4, 6);
      const d = p * p - 4 * q;
      // Toutes bornées sur ℝ seulement si racines imaginaires pures (p = 0, q > 0).
      const allBounded = p === 0 && q > 0;
      return {
        prompt: `Toutes les solutions de $${lhs([[1, "y''"], [p, "y'"], [q, 'y']])} = 0$ sont-elles bornées sur $\\mathbb{R}$ ?`,
        answer: fixedChoice(['Oui', 'Non'], allBounded ? 0 : 1),
        hint: 'Regarde les racines de l’équation caractéristique : une partie réelle non nulle fait exploser $e^{rx}$ d’un côté.',
        correction: [`$\\Delta = ${d}$.`, allBounded ? 'Racines imaginaires pures : solutions $A\\cos + B\\sin$, bornées.' : 'Une racine de partie réelle non nulle fait exploser $e^{rx}$ d’un côté ; une racine nulle (double, ou avec $q = 0$) donne des solutions comme $x$ ou $e^{-px}$, non bornées.'],
      };
    },
  ],
  'l1-ed-solution-particuliere': [
    // Second membre exponentiel.
    (rng) => {
      const a = rng.nonZero(-4, 4);
      let k = rng.nonZero(-3, 3);
      while (k + a === 0) k = rng.nonZero(-3, 3);
      const b = rng.nonZero(-6, 6);
      const C = F(b, k + a);
      const ek = `e^{${k === 1 ? '' : k === -1 ? '-' : k}x}`;
      return {
        prompt: `On cherche une solution $y = C${ek}$ de $${lhs([[1, "y'"], [a, 'y']])} = ${b === 1 ? '' : b === -1 ? '-' : b}${ek}$. Que vaut $C$ ?`,
        answer: numF(C),
        hint: `Remplace : $${k}C + ${par(a)}C = ${b}$.`,
        correction: [`$(${k} + ${par(a)})C = ${b}$, donc $C = ${tex(C)}$.`],
      };
    },
    // Second membre affine à l'ordre 2.
    (rng) => {
      const p = rng.int(-3, 3);
      const q = rng.nonZero(-4, 4);
      const alpha = rng.int(-3, 3);
      const beta = rng.int(-3, 3);
      const m = q * alpha;
      const n = p * alpha + q * beta;
      return {
        prompt: `On cherche une solution $y = \\alpha x + \\beta$ de $${lhs([[1, "y''"], [p, "y'"], [q, 'y']])} = ${lhs([[m, 'x'], [n, '']])}$. Donne $\\alpha$ et $\\beta$.`,
        answer: pairOf(alpha, beta, ['\\alpha', '\\beta']),
        hint: '$y\' = \\alpha$, $y\'\' = 0$ : identifie les coefficients.',
        correction: [`$${q}\\alpha = ${m}$ donne $\\alpha = ${alpha}$.`, `$${par(p)}\\alpha + ${par(q)}\\beta = ${n}$ donne $\\beta = ${beta}$.`],
      };
    },
    // Constante à l'ordre 2.
    (rng) => {
      const p = rng.int(-4, 4);
      const q = rng.nonZero(-5, 5);
      const c = rng.nonZero(-9, 9);
      const v = div(F(c), F(q));
      return {
        prompt: `Trouve la solution constante de $${lhs([[1, "y''"], [p, "y'"], [q, 'y']])} = ${c}$.`,
        answer: numF(v),
        hint: 'Une constante a des dérivées nulles.',
        correction: [`$${q}y = ${c}$, donc $y = ${tex(v)}$.`],
      };
    },
  ],
};

export const BANQUES_EQUADIFF = { ED };
