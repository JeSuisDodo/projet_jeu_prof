import type { Frac } from '../fraction';
import type { Skill } from '../types';
import { F, add, div, fixedChoice, mul, num, numF, plusT, poly, skill, sumF, tex } from './util';

/** Chapitre « Analyse numérique » (Licence 3). */

const newton = skill('l3-methode-newton', 'Itérer la méthode de Newton', (rng, level) => {
  const a = rng.pick([2, 3, 5, 6, 7, 10]);
  const x0 = F(rng.int(1, 3));
  const step = (x: Frac) => div(add(x, div(F(a), x)), F(2));
  const x1 = step(x0);
  const x2 = step(x1);
  const two = level === 3;
  return {
    prompt: `On applique la méthode de Newton à $f(x) = x^2 - ${a}$ en partant de $x_0 = ${tex(x0)}$. Donne $x_${two ? 2 : 1}$ (fraction exacte).`,
    answer: numF(two ? x2 : x1),
    hint: '$x_{n+1} = x_n - \\frac{f(x_n)}{f\'(x_n)} = \\frac{1}{2}\\left(x_n + \\frac{a}{x_n}\\right)$.',
    correction: [`$x_1 = \\frac{1}{2}\\left(${tex(x0)} + \\frac{${a}}{${tex(x0)}}\\right) = ${tex(x1)}$`, ...(two ? [`$x_2 = \\frac{1}{2}\\left(${tex(x1)} + \\frac{${a}}{${tex(x1)}}\\right) = ${tex(x2)}$`] : [])],
  };
});

const dichotomie = skill('l3-dichotomie', 'Compter les étapes d’une dichotomie', (rng, level) => {
  const L = rng.pick([1, 2, 4, 8]);
  if (level === 1) {
    const k = rng.int(2, 6);
    const value = F(L, 2 ** k);
    return {
      prompt: `On applique la dichotomie à partir d’un intervalle de longueur $${L}$. Quelle est la longueur de l’intervalle après $${k}$ étapes ?`,
      answer: numF(value),
      hint: 'Chaque étape divise la longueur par $2$.',
      correction: [`$\\frac{${L}}{2^{${k}}} = ${tex(value)}$`],
    };
  }
  const p = level === 2 ? rng.int(2, 4) : rng.int(4, 8);
  const eps = level === 2 ? F(1, 10 ** (p - 1)) : F(1, 10 ** Math.floor(p / 2));
  let n = 0;
  while (L / 2 ** n > eps.n / eps.d) n++;
  return {
    prompt: `On applique la dichotomie sur un intervalle de longueur $${L}$. Combien d’étapes faut-il au minimum pour que la longueur soit inférieure ou égale à $${tex(eps)}$ ?`,
    answer: num(n),
    hint: 'Cherche le plus petit $n$ tel que $\\frac{L}{2^n} \\leq \\varepsilon$, soit $2^n \\geq \\frac{L}{\\varepsilon}$.',
    correction: [`$\\frac{L}{\\varepsilon} = ${L * (eps.d / eps.n)}$ et $2^{${n - 1}} = ${2 ** (n - 1)} < ${L * (eps.d / eps.n)} \\leq 2^{${n}} = ${2 ** n}$.`, `Il faut $${n}$ étapes.`],
  };
});

const evalPoly = (c: number[], x: Frac) => c.reduce((s, v) => add(mul(s, x), F(v)), F(0));

const quadrature = skill('l3-quadrature', 'Appliquer une méthode de quadrature', (rng, level) => {
  const c = [rng.nonZero(-2, 3), rng.int(-3, 3), rng.int(-3, 3)];
  const n = level === 1 ? 2 : rng.int(2, 4);
  const b = n;
  const h = F(1);
  const xs = Array.from({ length: n + 1 }, (_, i) => F(i));
  const ys = xs.map((x) => evalPoly(c, x));
  const method = level === 1 ? 'rectangles' : level === 2 ? 'trapezes' : rng.pick(['trapezes', 'milieux'] as const);
  let value: Frac;
  let detail: string;
  if (method === 'rectangles') {
    value = mul(h, sumF(ys.slice(0, n)));
    detail = `$h\\,(f(0) + \\dots + f(${n - 1})) = ${ys
      .slice(0, n)
      .map(tex)
      .reduce((acc, t, i) => (i === 0 ? t : acc + plusT(t)), '')}$`;
  } else if (method === 'trapezes') {
    value = mul(h, add(div(add(ys[0], ys[n]), F(2)), sumF(ys.slice(1, n))));
    detail = `$h\\left(\\frac{f(0) + f(${n})}{2} + ${ys.slice(1, n).length ? `f(1)${n > 2 ? ` + \\dots + f(${n - 1})` : ''}` : '0'}\\right)$`;
  } else {
    const mids = Array.from({ length: n }, (_, i) => evalPoly(c, F(2 * i + 1, 2)));
    value = mul(h, sumF(mids));
    detail = `$h\\left(f\\left(\\tfrac{1}{2}\\right) + \\dots + f\\left(${tex(F(2 * n - 1, 2))}\\right)\\right)$`;
  }
  const name = method === 'rectangles' ? 'des rectangles à gauche' : method === 'trapezes' ? 'des trapèzes' : 'du point milieu';
  return {
    prompt: `Approche $\\displaystyle\\int_0^{${b}} (${poly(c)})\\,dx$ par la méthode ${name} avec $${n}$ sous-intervalles de longueur $h = 1$.`,
    answer: numF(value),
    hint: method === 'rectangles' ? 'Somme des $h\\,f(x_i)$ aux bords gauches.' : method === 'trapezes' ? 'Trapèzes : $h\\left(\\frac{f(x_0) + f(x_n)}{2} + \\sum_{0 < i < n} f(x_i)\\right)$.' : 'Point milieu : $h\\sum f\\left(\\frac{x_i + x_{i+1}}{2}\\right)$.',
    correction: [`Valeurs : ${xs.map((x, i) => `$f(${tex(x)}) = ${tex(ys[i])}$`).join(', ')}.`, detail, `Résultat : $${tex(value)}$`],
  };
});

const interpolation = skill('l3-interpolation-lagrange', 'Utiliser l’interpolation de Lagrange', (rng, level) => {
  const count = level === 1 ? 2 : 3;
  const xs = rng.shuffle([-2, -1, 0, 1, 2, 3]).slice(0, count).sort((a, b) => a - b);
  const ys = xs.map(() => rng.int(-5, 5));
  let t = rng.int(-3, 4);
  while (xs.includes(t)) t++;
  // P(t) = Σ y_i Π (t - x_j)/(x_i - x_j)
  const value = sumF(xs.map((xi, i) => mul(F(ys[i]), xs.reduce((p, xj, j) => (j === i ? p : mul(p, F(t - xj, xi - xj))), F(1)))));
  return {
    prompt: `$P$ est le polynôme de degré $\\leq ${count - 1}$ qui passe par ${xs.map((x, i) => `$(${x}, ${ys[i]})$`).join(', ')}. Calcule $P(${t})$.`,
    answer: numF(value),
    hint: 'Formule de Lagrange : $P(t) = \\sum_i y_i \\prod_{j \\neq i} \\frac{t - x_j}{x_i - x_j}$ (ou différences divisées de Newton).',
    correction: [
      ...xs.map((xi, i) => `$L_{${i}}(${t}) = ${tex(xs.reduce((p, xj, j) => (j === i ? p : mul(p, F(t - xj, xi - xj))), F(1)))}$`),
      `$P(${t}) = ${tex(value)}$`,
    ],
  };
});

const euler = skill('l3-euler-explicite', 'Appliquer le schéma d’Euler explicite', (rng, level) => {
  const a = rng.nonZero(-3, 3);
  const b = rng.int(-3, 3);
  const y0 = rng.int(-3, 4);
  const h = F(1, rng.pick([2, 4, 5, 10]));
  const steps = level === 1 ? 1 : 2;
  let y = F(y0);
  const lines: string[] = [];
  for (let k = 0; k < steps; k++) {
    const next = add(y, mul(h, add(mul(F(a), y), F(b))));
    lines.push(`$y_{${k + 1}} = ${tex(y)} + ${tex(h)}\\left(${a}\\times ${y.n < 0 ? `\\left(${tex(y)}\\right)` : tex(y)}${b === 0 ? '' : b < 0 ? ` - ${-b}` : ` + ${b}`}\\right) = ${tex(next)}$`);
    y = next;
  }
  const t = mul(h, F(steps));
  return {
    prompt: `On résout $y' = ${a === 1 ? '' : a === -1 ? '-' : a}y${b === 0 ? '' : b < 0 ? ` - ${-b}` : ` + ${b}`}$, $y(0) = ${y0}$, par le schéma d’Euler explicite de pas $h = ${tex(h)}$. Donne l’approximation $y_{${steps}}$ de $y(${tex(t)})$.`,
    answer: numF(y),
    hint: '$y_{k+1} = y_k + h\\,f(t_k, y_k)$.',
    correction: lines,
  };
});

const ORDRES: [string, string, string[], string][] = [
  ['Quel est l’ordre de convergence de la méthode de Newton vers une racine simple ?', '2', ['1', '3', '\\frac{1 + \\sqrt 5}{2}'], 'Newton converge quadratiquement : l’erreur est élevée au carré à chaque étape.'],
  ['Quel est l’ordre de convergence de la méthode de la sécante ?', '\\frac{1 + \\sqrt 5}{2}', ['1', '2', '3'], 'C’est le nombre d’or, environ $1{,}618$.'],
  ['L’erreur de la méthode composite des trapèzes est en :', 'O(h^2)', ['O(h)', 'O(h^3)', 'O(h^4)'], 'L’erreur globale est $-\\frac{(b - a)h^2}{12}f\'\'(\\xi)$.'],
  ['L’erreur de la méthode composite de Simpson est en :', 'O(h^4)', ['O(h)', 'O(h^2)', 'O(h^3)'], 'Simpson est exacte sur les polynômes de degré $3$ ; erreur en $h^4$.'],
  ['L’erreur globale du schéma d’Euler explicite est en :', 'O(h)', ['O(h^2)', 'O(h^3)', 'O(1)'], 'Euler est une méthode d’ordre $1$.'],
  ['À chaque étape, la dichotomie divise l’erreur (majorée) par :', '2', ['1', '3', '4'], 'La longueur de l’intervalle est divisée par $2$ : convergence linéaire de rapport $\\frac{1}{2}$.'],
];

const ordres = skill('l3-ordres-convergence', 'Connaître les ordres des méthodes', (rng) => {
  const [question, correct, decoys, why] = rng.pick(ORDRES);
  const options = rng.shuffle([correct, ...decoys]).map((o) => `$${o}$`);
  return {
    prompt: question,
    answer: fixedChoice(options, options.indexOf(`$${correct}$`)),
    hint: 'Pense au nombre de chiffres exacts gagnés à chaque étape, ou au degré des polynômes intégrés exactement.',
    correction: [why],
  };
});

export const ANALYSE_NUMERIQUE_SKILLS: Skill[] = [newton, dichotomie, quadrature, interpolation, euler, ordres];
