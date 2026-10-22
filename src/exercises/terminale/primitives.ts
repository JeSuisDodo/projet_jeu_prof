import type { Skill } from '../types';
import { F, add, choiceTex, mul, numF, plus, poly, skill, tex } from './util';
import type { Frac } from '../fraction';

/** Chapitre « Primitives et équations différentielles » (Terminale spécialité). */

/** Primitive d'un polynôme à coefficients entiers (du plus haut degré au terme constant), constante nulle. */
export function primitiveCoefs(c: number[]): Frac[] {
  const deg = c.length - 1;
  return [...c.map((v, i) => F(v, deg - i + 1)), F(0)];
}

export const evalFrac = (coefs: Frac[], x: number) => coefs.reduce((s, v, i) => add(s, mul(v, F(x ** (coefs.length - 1 - i)))), F(0));

/** Polynôme à coefficients rationnels en LaTeX. */
export function polyFrac(coefs: Frac[], v = 'x'): string {
  let out = '';
  coefs.forEach((c, i) => {
    if (c.n === 0) return;
    const p = coefs.length - 1 - i;
    const abs = { n: Math.abs(c.n), d: c.d };
    const coef = p > 0 && abs.n === 1 && abs.d === 1 ? '' : tex(abs);
    const vp = p === 0 ? '' : p === 1 ? v : `${v}^{${p}}`;
    const sign = c.n < 0 ? (out ? ' - ' : '-') : out ? ' + ' : '';
    out += `${sign}${coef}${vp}`;
  });
  return out || '0';
}

const primitivePoly = skill('tle-primitive-polynome', 'Trouver la primitive qui vérifie une condition', (rng, level) => {
  const c = [rng.nonZero(-3, 3) * (level === 1 ? 2 : 1), rng.int(-5, 5)];
  if (level > 1) c.unshift(rng.nonZero(-2, 2) * 3);
  const P = primitiveCoefs(c);
  const y0 = rng.int(-5, 5);
  const x1 = rng.int(1, 3);
  // F(x) = P(x) + y0, de sorte que F(0) = y0.
  const value = add(evalFrac(P, x1), F(y0));
  return {
    prompt: `$F$ est la primitive de $f(x) = ${poly(c)}$ sur $\\mathbb{R}$ telle que $F(0) = ${y0}$. Calcule $F(${x1})$.`,
    answer: numF(value),
    hint: 'Une primitive de $x^n$ est $\\frac{x^{n+1}}{n+1}$ ; la constante se trouve avec la condition $F(0)$.',
    correction: [`$F(x) = ${polyFrac(P)} + k$ et $F(0) = k = ${y0}$.`, `$F(${x1}) = ${tex(evalFrac(P, x1))}${plus(y0)} = ${tex(value)}$`],
  };
});

const formes = skill('tle-primitive-forme', 'Reconnaître une forme usuelle de primitive', (rng) => {
  const a = rng.int(2, 6);
  const b = rng.int(1, 5);
  const cases = [
    { f: `${2 * a}xe^{${a}x^2}`, F: `e^{${a}x^2}`, d: [`${a}x^2e^{${a}x^2}`, `${2 * a}e^{${a}x^2}`, `\\frac{e^{${a}x^2}}{${a}}`] },
    { f: `\\frac{${a}}{${a}x + ${b}}`, F: `\\ln(${a}x + ${b})`, d: [`\\frac{1}{${a}}\\ln(${a}x + ${b})`, `${a}\\ln(${a}x + ${b})`, `-\\frac{${a}}{(${a}x + ${b})^2}`] },
    { f: `e^{${a}x}`, F: `\\frac{1}{${a}}e^{${a}x}`, d: [`${a}e^{${a}x}`, `e^{${a}x}`, `\\frac{1}{${a + 1}}e^{${a + 1}x}`] },
    { f: `${a}(${a}x + ${b})^{${b + 1}}`, F: `\\frac{(${a}x + ${b})^{${b + 2}}}{${b + 2}}`, d: [`(${a}x + ${b})^{${b + 2}}`, `\\frac{(${a}x + ${b})^{${b}}}{${b}}`, `${a}(${a}x + ${b})^{${b + 2}}`] },
    { f: `\\cos(${a}x)`, F: `\\frac{1}{${a}}\\sin(${a}x)`, d: [`${a}\\sin(${a}x)`, `-\\frac{1}{${a}}\\sin(${a}x)`, `\\sin(${a}x)`] },
    { f: `\\frac{${2 * a}x}{x^2 + ${b}}`, F: `${a}\\ln(x^2 + ${b})`, d: [`\\ln(x^2 + ${b})`, `${2 * a}\\ln(x^2 + ${b})`, `\\frac{${a}}{x^2 + ${b}}`] },
  ];
  const c = rng.pick(cases);
  return {
    prompt: `Quelle fonction est une primitive de $f(x) = ${c.f}$ ?`,
    answer: choiceTex(rng, `F(x) = ${c.F}`, c.d.map((d) => `F(x) = ${d}`), () => `F(x) = ${c.f}`),
    hint: 'Repère une forme $u\'e^u$, $\\frac{u\'}{u}$ ou $u\'u^n$, puis vérifie en dérivant ta réponse.',
    correction: [`On vérifie en dérivant : $\\left(${c.F}\\right)' = ${c.f}$.`],
  };
});

const exponentielle = skill('tle-equadiff-homogene', 'Résoudre y′ = ay avec une condition initiale', (rng, level) => {
  const a = level === 1 ? rng.int(2, 4) : rng.nonZero(-4, 4);
  const k = rng.nonZero(-5, 6);
  const front = (c: number) => (c === 1 ? '' : c === -1 ? '-' : String(c));
  const ax = `${front(a)}x`;
  const correct = `y(x) = ${front(k)}e^{${ax}}`;
  return {
    prompt: `Quelle est la solution de $y' = ${front(a)}y$ telle que $y(0) = ${k}$ ?`,
    answer: choiceTex(
      rng,
      correct,
      [`y(x) = ${front(a)}e^{${front(k)}x}`, `y(x) = ${front(k)}e^{${front(-a)}x}`, `y(x) = e^{${ax}}${plus(k - 1)}`, `y(x) = ${front(k * a)}e^{${ax}}`],
      () => `y(x) = ${front(k + 1)}e^{${ax}}`,
    ),
    hint: 'Les solutions de $y\' = ay$ sont les fonctions $x \\mapsto Ce^{ax}$.',
    correction: [`$y(x) = Ce^{${ax}}$ et $y(0) = C = ${k}$.`, `$${correct}$`],
  };
});

const constante = skill('tle-equadiff-constante', 'Trouver la solution constante de y′ = ay + b', (rng) => {
  const a = rng.nonZero(-5, 5);
  const b = rng.nonZero(-9, 9);
  const c = F(-b, a);
  return {
    prompt: `Quelle est la solution constante de l’équation différentielle $y' = ${a === 1 ? '' : a === -1 ? '-' : a}y${plus(b)}$ ?`,
    answer: numF(c),
    hint: 'Une fonction constante a une dérivée nulle : résous $0 = ay + b$.',
    correction: [`$0 = ${a}y${plus(b)}$ donne $y = -\\frac{b}{a} = ${tex(c)}$.`],
  };
});

const generale = skill('tle-equadiff-generale', 'Donner les solutions de y′ = ay + b', (rng) => {
  const a = rng.nonZero(-4, 4);
  const p = rng.nonZero(-5, 5);
  const b = -a * p; // p = -b/a est la solution particulière constante
  const front = (c: number) => (c === 1 ? '' : c === -1 ? '-' : String(c));
  const ax = `${front(a)}x`;
  const correct = `y(x) = Ce^{${ax}}${plus(p)}`;
  return {
    prompt: `Quelles sont les solutions sur $\\mathbb{R}$ de $y' = ${front(a)}y${plus(b)}$ ? ($C$ est une constante réelle.)`,
    answer: choiceTex(
      rng,
      correct,
      [`y(x) = Ce^{${ax}}${plus(-p)}`, `y(x) = Ce^{${front(-a)}x}${plus(p)}`, `y(x) = Ce^{${ax}}${plus(b)}`, `y(x) = Ce^{${front(b)}x}${plus(a)}`],
      () => `y(x) = Ce^{${ax}}${plus(p + 1)}`,
    ),
    hint: 'Solution générale = solution générale de $y\' = ay$ + une solution particulière (la constante $-\\frac{b}{a}$).',
    correction: [`Solution constante : $0 = ${a}y${plus(b)}$, soit $y = ${p}$.`, `Solutions de $y' = ${front(a)}y$ : $Ce^{${ax}}$.`, `Donc $${correct}$.`],
  };
});

const condition = skill('tle-equadiff-condition', 'Trouver la constante avec une condition initiale', (rng) => {
  // y' = a y + b, y(0) = y0 : y = (y0 - p) e^{ax} + p, avec p = -b/a. On demande C = y0 - p.
  const a = rng.nonZero(-3, 3);
  const p = rng.int(-6, 6);
  const b = -a * p;
  const y0 = rng.int(-6, 6);
  const C = y0 - p;
  const front = (c: number) => (c === 1 ? '' : c === -1 ? '-' : String(c));
  return {
    prompt: `Les solutions de $y' = ${front(a)}y${plus(b)}$ sont $y(x) = Ce^{${front(a)}x}${plus(p)}$. Quelle valeur de $C$ donne $y(0) = ${y0}$ ?`,
    answer: numF(F(C)),
    hint: 'Remplace $x$ par $0$ : $e^0 = 1$.',
    correction: [`$y(0) = C${plus(p)} = ${y0}$`, `$C = ${C}$`],
  };
});

export const PRIMITIVES_SKILLS: Skill[] = [primitivePoly, formes, exponentielle, constante, generale, condition];
