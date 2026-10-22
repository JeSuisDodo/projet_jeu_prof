import type { Frac } from '../fraction';
import type { Rng } from '../rng';
import type { Skill } from '../types';
import { F, add, combo, div, fixedChoice, mul, num, numF, poly, skill, sub, sumF, tex } from './util';

/** Chapitre « Espaces de Hilbert et séries de Fourier » (Licence 3). */

const k_ = (k: number) => (k === 1 ? '' : String(k));

/** Coefficient devant une fonction : « », « - », « 3 », « -3 ». */
const coefTex = (c: number) => (c === 1 ? '' : c === -1 ? '-' : String(c));

/** f(x) = a₀ + Σ aₙ cos(nx) + bₙ sin(nx) avec deux ou trois termes. */
function trigPoly(rng: Rng) {
  const a0 = rng.int(-4, 4);
  const p = rng.int(1, 4);
  let q = rng.int(1, 4);
  if (q === p) q = (p % 4) + 1;
  const a = rng.nonZero(-5, 5);
  const b = rng.nonZero(-5, 5);
  const text = combo([
    [a0, ''],
    [a, `\\cos(${k_(p)}x)`],
    [b, `\\sin(${k_(q)}x)`],
  ]);
  return { a0, p, q, a, b, text };
}

const CONVENTION = '$f(x) = a_0 + \\sum_{n \\geq 1} \\left(a_n\\cos(nx) + b_n\\sin(nx)\\right)$';

const coefficients = skill('l3-coefficients-fourier', 'Lire des coefficients de Fourier', (rng, level) => {
  if (level === 1) {
    const { a0, p, q, a, b, text } = trigPoly(rng);
    const askCos = rng.next() < 0.5;
    const askZero = rng.next() < 0.2;
    const [name, value] = askZero ? ['a_0', a0] : askCos ? [`a_{${p}}`, a] : [`b_{${q}}`, b];
    return {
      prompt: `Avec la convention ${CONVENTION}, donne $${name}$ pour $f(x) = ${text}$.`,
      answer: num(value),
      hint: 'Un polynôme trigonométrique est sa propre série de Fourier : lis les coefficients.',
      correction: [`Par unicité des coefficients de Fourier, $${name} = ${value}$.`],
    };
  }
  if (level === 2) {
    const c = rng.nonZero(-4, 4);
    const k = rng.int(1, 3);
    const cases: [string, string, Frac, string][] = [
      [`${k_(Math.abs(c))}\\cos^2(${k_(k)}x)`, `a_{${2 * k}}`, F(c, 2), `$\\cos^2(${k_(k)}x) = \\frac{1 + \\cos(${2 * k}x)}{2}$`],
      [`${k_(Math.abs(c))}\\sin^2(${k_(k)}x)`, `a_{${2 * k}}`, F(-c, 2), `$\\sin^2(${k_(k)}x) = \\frac{1 - \\cos(${2 * k}x)}{2}$`],
      [`${k_(Math.abs(c))}\\sin(${k_(k)}x)\\cos(${k_(k)}x)`, `b_{${2 * k}}`, F(c, 2), `$\\sin(${k_(k)}x)\\cos(${k_(k)}x) = \\frac{\\sin(${2 * k}x)}{2}$`],
      [`${k_(Math.abs(c))}\\cos^2(${k_(k)}x)`, 'a_0', F(c, 2), `$\\cos^2(${k_(k)}x) = \\frac{1 + \\cos(${2 * k}x)}{2}$`],
    ];
    const [f, name, value, why] = rng.pick(cases);
    const ff = c < 0 ? `-${f}` : f;
    return {
      prompt: `Avec la convention ${CONVENTION}, donne $${name}$ pour $f(x) = ${ff}$.`,
      answer: numF(value),
      hint: 'Linéarise avec les formules de duplication.',
      correction: [why, `$${name} = ${tex(value)}$`],
    };
  }
  const A = rng.nonZero(-6, 6);
  const k = rng.int(1, 4);
  const isCos = rng.next() < 0.5;
  const value = F(isCos ? A : -A, 2);
  return {
    prompt: isCos
      ? `On note $c_n = \\frac{1}{2\\pi}\\int_{-\\pi}^{\\pi} f(x)e^{-inx}\\,dx$. Pour $f(x) = ${coefTex(A)}\\cos(${k_(k)}x)$, donne $c_{${k}}$.`
      : `On note $c_n = \\frac{1}{2\\pi}\\int_{-\\pi}^{\\pi} f(x)e^{-inx}\\,dx$. Pour $f(x) = ${coefTex(A)}\\sin(${k_(k)}x)$, on a $c_{${k}} = i\\,m$ avec $m$ réel : donne $m$.`,
    answer: numF(value),
    hint: isCos ? '$\\cos(kx) = \\frac{e^{ikx} + e^{-ikx}}{2}$.' : '$\\sin(kx) = \\frac{e^{ikx} - e^{-ikx}}{2i}$ et $\\frac{1}{i} = -i$.',
    correction: isCos
      ? [`$${coefTex(A)}\\cos(${k_(k)}x) = \\frac{${A}}{2}e^{i${k_(k)}x} + \\frac{${A}}{2}e^{-i${k_(k)}x}$`, `$c_{${k}} = ${tex(value)}$`]
      : [`$${coefTex(A)}\\sin(${k_(k)}x) = \\frac{${A}}{2i}e^{i${k_(k)}x} - \\frac{${A}}{2i}e^{-i${k_(k)}x}$`, `$c_{${k}} = \\frac{${A}}{2i} = ${tex(value)}\\,i$, donc $m = ${tex(value)}$.`],
  };
});

const parseval = skill('l3-parseval', 'Appliquer l’égalité de Parseval', (rng, level) => {
  const { a0, a, b, text } = trigPoly(rng);
  const value = add(F(a0 * a0), F(a * a + b * b, 2));
  const full = level === 3;
  const total = full ? mul(value, F(2)) : value;
  return {
    prompt: full
      ? `Pour $f(x) = ${text}$, calcule $\\dfrac{1}{\\pi}\\displaystyle\\int_{-\\pi}^{\\pi} f(x)^2\\,dx$.`
      : `Pour $f(x) = ${text}$, calcule $\\dfrac{1}{2\\pi}\\displaystyle\\int_{-\\pi}^{\\pi} f(x)^2\\,dx$.`,
    answer: numF(total),
    hint: 'Parseval : $\\frac{1}{2\\pi}\\int_{-\\pi}^{\\pi} f^2 = a_0^2 + \\frac{1}{2}\\sum_{n \\geq 1} (a_n^2 + b_n^2)$.',
    correction: [
      `$\\frac{1}{2\\pi}\\int f^2 = ${a0 * a0} + \\frac{${a * a} + ${b * b}}{2} = ${tex(value)}$`,
      ...(full ? [`En multipliant par $2$ : $${tex(total)}$`] : []),
    ],
  };
});

/** Produit de deux polynômes (coefficients du plus haut degré au constant). */
const polyMul = (p: number[], q: number[]) => {
  const out = Array(p.length + q.length - 1).fill(0);
  p.forEach((a, i) => q.forEach((b, j) => (out[i + j] += a * b)));
  return out;
};

/** ∫₀¹ P(x) dx. */
const int01 = (p: number[]) => sumF(p.map((c, i) => F(c, p.length - i)));

const produitScalaire = skill('l3-produit-scalaire-l2', 'Calculer un produit scalaire dans $L^2$', (rng, level) => {
  const f = level === 1 ? [rng.nonZero(-3, 3), rng.int(-3, 3)] : [rng.nonZero(-2, 2), rng.int(-3, 3), rng.int(-3, 3)];
  const g = [rng.nonZero(-3, 3), rng.int(-3, 3)];
  const same = level === 3 && rng.next() < 0.5;
  const prod = same ? polyMul(f, f) : polyMul(f, g);
  const value = int01(prod);
  return {
    prompt: same
      ? `Dans $L^2([0\\,;\\,1])$, calcule $\\|f\\|_2^2$ pour $f(x) = ${poly(f)}$.`
      : `Dans $L^2([0\\,;\\,1])$ muni de $\\langle f, g\\rangle = \\int_0^1 f(x)g(x)\\,dx$, calcule $\\langle f, g\\rangle$ pour $f(x) = ${poly(f)}$ et $g(x) = ${poly(g)}$.`,
    answer: numF(value),
    hint: 'Développe le produit, puis intègre terme à terme : $\\int_0^1 x^k\\,dx = \\frac{1}{k + 1}$.',
    correction: [`$${same ? 'f(x)^2' : 'f(x)g(x)'} = ${poly(prod)}$`, `$\\int_0^1 ${same ? 'f^2' : 'fg'} = ${tex(value)}$`],
  };
});

const projection = skill('l3-projection-orthogonale', 'Projeter sur un sous-espace de $L^2$', (rng, level) => {
  if (level === 1) {
    const p = [rng.nonZero(-3, 3), rng.int(-4, 4), rng.int(-4, 4)];
    const value = int01(p);
    return {
      prompt: `Dans $L^2([0\\,;\\,1])$, la projection orthogonale de $f(x) = ${poly(p)}$ sur les fonctions constantes est la constante $c$. Donne $c$.`,
      answer: numF(value),
      hint: 'La projection sur $\\operatorname{Vect}(1)$ est $\\frac{\\langle f, 1\\rangle}{\\|1\\|^2} = \\int_0^1 f$.',
      correction: [`$c = \\int_0^1 f(x)\\,dx = ${tex(value)}$ (la valeur moyenne de $f$).`],
    };
  }
  if (level === 2) {
    const k = rng.int(2, 5);
    const value = F(3, k + 2);
    return {
      prompt: `Dans $L^2([0\\,;\\,1])$, la projection orthogonale de $x^{${k}}$ sur $\\operatorname{Vect}(x)$ est $\\beta x$. Donne $\\beta$.`,
      answer: numF(value),
      hint: '$\\beta = \\frac{\\langle x^k, x\\rangle}{\\langle x, x\\rangle}$.',
      correction: [`$\\langle x^{${k}}, x\\rangle = \\frac{1}{${k + 2}}$ et $\\langle x, x\\rangle = \\frac{1}{3}$.`, `$\\beta = \\frac{3}{${k + 2}}$${F(3, k + 2).d !== k + 2 ? ` $= ${tex(value)}$` : ''}`],
    };
  }
  // Meilleure approximation affine α + βx de x^k : système de Gram.
  const k = rng.int(2, 4);
  const m0 = F(1, k + 1);
  const m1 = F(1, k + 2);
  // [[1, 1/2], [1/2, 1/3]] (α, β) = (m0, m1) ; déterminant 1/12.
  const beta = div(sub(m1, mul(F(1, 2), m0)), F(1, 12));
  const alpha = sub(m0, mul(F(1, 2), beta));
  const askAlpha = rng.next() < 0.5;
  return {
    prompt: `Dans $L^2([0\\,;\\,1])$, la projection orthogonale de $x^{${k}}$ sur $\\operatorname{Vect}(1, x)$ est $\\alpha + \\beta x$. Donne $${askAlpha ? '\\alpha' : '\\beta'}$.`,
    answer: numF(askAlpha ? alpha : beta),
    hint: 'Écris $\\langle x^k - \\alpha - \\beta x, 1\\rangle = 0$ et $\\langle x^k - \\alpha - \\beta x, x\\rangle = 0$.',
    correction: [
      `$\\alpha + \\frac{\\beta}{2} = \\frac{1}{${k + 1}}$ et $\\frac{\\alpha}{2} + \\frac{\\beta}{3} = \\frac{1}{${k + 2}}$.`,
      `On trouve $\\beta = ${tex(beta)}$ et $\\alpha = ${tex(alpha)}$.`,
    ],
  };
});

const SOMMES: [string, string, string, number][] = [
  ['\\sum_{n \\geq 1} \\frac{1}{n^2}', '\\frac{\\pi^2}{6}', 'Parseval (ou Dirichlet) appliqué à $f(x) = x$ sur $]-\\pi\\,;\\,\\pi[$.', 1],
  ['\\sum_{n \\geq 1} \\frac{1}{n^4}', '\\frac{\\pi^4}{90}', 'Parseval appliqué à $f(x) = x^2$ sur $[-\\pi\\,;\\,\\pi]$.', 2],
  ['\\sum_{n \\geq 0} \\frac{1}{(2n + 1)^2}', '\\frac{\\pi^2}{8}', 'Dirichlet pour $f(x) = |x|$ en $0$, ou $\\frac{\\pi^2}{6} - \\frac{1}{4}\\cdot\\frac{\\pi^2}{6}$.', 2],
  ['\\sum_{n \\geq 1} \\frac{(-1)^{n+1}}{n^2}', '\\frac{\\pi^2}{12}', 'Dirichlet pour $f(x) = x^2$ en $0$.', 3],
  ['\\sum_{n \\geq 0} \\frac{(-1)^n}{2n + 1}', '\\frac{\\pi}{4}', 'Dirichlet pour le créneau impair en $\\frac{\\pi}{2}$.', 3],
];

const sommes = skill('l3-sommes-fourier', 'Calculer une somme grâce aux séries de Fourier', (rng, level) => {
  const [sum, value, why] = rng.pick(SOMMES.filter(([, , , l]) => l <= level));
  const all = ['\\frac{\\pi^2}{6}', '\\frac{\\pi^4}{90}', '\\frac{\\pi^2}{8}', '\\frac{\\pi^2}{12}', '\\frac{\\pi}{4}', '\\frac{\\pi^2}{4}'];
  const options = rng.shuffle([value, ...rng.shuffle(all.filter((o) => o !== value)).slice(0, 3)]).map((o) => `$${o}$`);
  return {
    prompt: `Que vaut $\\displaystyle ${sum}$ ?`,
    answer: fixedChoice(options, options.indexOf(`$${value}$`)),
    hint: 'Ces sommes s’obtiennent avec l’égalité de Parseval ou le théorème de Dirichlet appliqués à des fonctions simples.',
    correction: [why, `La somme vaut $${value}$.`],
  };
});

export const HILBERT_FOURIER_SKILLS: Skill[] = [coefficients, parseval, produitScalaire, projection, sommes];
