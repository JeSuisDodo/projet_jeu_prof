import { frac } from '../fraction';
import type { Skill } from '../types';
import { type Cx, cx, cxAnswer, cxDiv, cxMul, cxTex, num, numF, par, skill, tex, texChoice } from './util';

/** Chapitre « Nombres complexes » (Licence 1). */

const randomCx = (rng: { nonZero: (a: number, b: number) => number; int: (a: number, b: number) => number }, b: number) => cx(rng.int(-b, b), rng.nonZero(-b, b));

const algebrique = skill('l1-forme-algebrique', 'Calculer sous forme algébrique', (rng, level) => {
  const z1 = randomCx(rng, 5);
  const z2 = randomCx(rng, 4);
  if (level === 1) {
    const p = cxMul(z1, z2);
    return {
      prompt: `Écris $z = (${cxTex(z1)})(${cxTex(z2)})$ sous forme algébrique.`,
      answer: cxAnswer(p),
      hint: 'Développe et utilise $i^2 = -1$.',
      correction: [`$z = ${cxTex(p)}$`],
    };
  }
  // Quotient : z1 / z2, éventuellement fractionnaire.
  const q = level === 2 ? cxDiv(cxMul(z1, z2), z2) : cxDiv(z1, z2);
  const num1 = level === 2 ? cxMul(z1, z2) : z1;
  const conj = cx(z2.re, frac(-z2.im.n, z2.im.d));
  const n2 = z2.re.n ** 2 + z2.im.n ** 2;
  return {
    prompt: `Écris $z = \\dfrac{${cxTex(num1)}}{${cxTex(z2)}}$ sous forme algébrique.`,
    answer: cxAnswer(q),
    hint: 'Multiplie le numérateur et le dénominateur par le conjugué du dénominateur.',
    correction: [`$z = \\dfrac{(${cxTex(num1)})(${cxTex(conj)})}{${n2}} = \\dfrac{${cxTex(cxMul(num1, conj))}}{${n2}}$`, `$z = ${cxTex(q)}$`],
  };
});

const TRIPLES: [number, number, number][] = [
  [3, 4, 5],
  [6, 8, 10],
  [5, 12, 13],
  [8, 15, 17],
  [7, 24, 25],
  [9, 12, 15],
  [12, 16, 20],
];

const moduleSkill = skill('l1-module', 'Calculer un module', (rng, level) => {
  const pickZ = () => {
    const [a, b, r] = rng.pick(TRIPLES);
    const [x, y] = rng.next() < 0.5 ? [a, b] : [b, a];
    return { z: cx(x * rng.sign(), y * rng.sign()), r };
  };
  const u = pickZ();
  if (level === 1)
    return {
      prompt: `Calcule le module de $z = ${cxTex(u.z)}$.`,
      answer: num(u.r),
      hint: '$|a + ib| = \\sqrt{a^2 + b^2}$.',
      correction: [`$|z| = \\sqrt{${par(u.z.re.n)}^2 + ${par(u.z.im.n)}^2} = \\sqrt{${u.r ** 2}} = ${u.r}$`],
    };
  const v = pickZ();
  const k = rng.int(2, level === 2 ? 3 : 4);
  if (level === 2)
    return {
      prompt: `Calcule le module de $z = (${cxTex(u.z)})^{${k}}$.`,
      answer: num(u.r ** k),
      hint: 'Le module d’une puissance est la puissance du module : $|z^n| = |z|^n$.',
      correction: [`$|${cxTex(u.z)}| = ${u.r}$, donc $|z| = ${u.r}^{${k}} = ${u.r ** k}$.`],
    };
  return {
    prompt: `Calcule le module de $z = \\dfrac{(${cxTex(u.z)})^{${k}}}{${cxTex(v.z)}}$.`,
    answer: numF(frac(u.r ** k, v.r)),
    hint: '$\\left|\\frac{z_1}{z_2}\\right| = \\frac{|z_1|}{|z_2|}$ et $|z^n| = |z|^n$.',
    correction: [`$|z| = \\dfrac{${u.r}^{${k}}}{${v.r}} = ${tex(frac(u.r ** k, v.r))}$`],
  };
});

/** Angles remarquables de ]-π ; π], avec un représentant algébrique de module positif. */
const ANGLES: [string, string][] = [
  ['0', '1'],
  ['\\frac{\\pi}{6}', '\\sqrt{3} + i'],
  ['\\frac{\\pi}{4}', '1 + i'],
  ['\\frac{\\pi}{3}', '1 + i\\sqrt{3}'],
  ['\\frac{\\pi}{2}', 'i'],
  ['\\frac{2\\pi}{3}', '-1 + i\\sqrt{3}'],
  ['\\frac{3\\pi}{4}', '-1 + i'],
  ['\\frac{5\\pi}{6}', '-\\sqrt{3} + i'],
  ['\\pi', '-1'],
  ['-\\frac{\\pi}{6}', '\\sqrt{3} - i'],
  ['-\\frac{\\pi}{4}', '1 - i'],
  ['-\\frac{\\pi}{3}', '1 - i\\sqrt{3}'],
  ['-\\frac{\\pi}{2}', '-i'],
  ['-\\frac{2\\pi}{3}', '-1 - i\\sqrt{3}'],
  ['-\\frac{3\\pi}{4}', '-1 - i'],
  ['-\\frac{5\\pi}{6}', '-\\sqrt{3} - i'],
];

const argument = skill('l1-argument', 'Trouver un argument', (rng, level) => {
  const pool = level === 1 ? ANGLES.filter((_, i) => [0, 2, 4, 6, 8, 10, 12, 14].includes(i)) : ANGLES;
  const [angle, z] = rng.pick(pool);
  const k = level === 3 ? rng.int(2, 5) : 1;
  const zTex = k === 1 ? z : /^-?(1|i)$/.test(z) ? z.replace('1', '').replace(/^(-?)/, `$1${k}`) : `${k}(${z})`;
  const decoys = rng.shuffle(pool.filter(([a]) => a !== angle).map(([a]) => a)).slice(0, 3);
  return {
    prompt: `Quel est l’argument principal (dans $]-\\pi\\,;\\pi]$) de $z = ${zTex}$ ?`,
    answer: texChoice(rng, angle, decoys),
    hint: 'Écris $z = |z|(\\cos\\theta + i\\sin\\theta)$ : un facteur réel positif ne change pas l’argument.',
    correction: [`$\\dfrac{z}{|z|}$ a pour cosinus et sinus ceux de $${angle}$.`, `$\\arg z = ${angle}$`],
  };
});

const puissance = skill('l1-puissance-complexe', 'Calculer une puissance (Moivre)', (rng, level) => {
  const base = level === 1 ? cx(0, 1) : rng.pick([cx(1, 1), cx(1, -1), cx(-1, 1)]);
  const n = level === 1 ? rng.int(5, 40) : rng.int(3, level === 2 ? 8 : 12);
  let p: Cx = cx(1, 0);
  for (let i = 0; i < n; i++) p = cxMul(p, base);
  return {
    prompt: `Écris $z = ${level === 1 ? 'i' : `(${cxTex(base)})`}^{${n}}$ sous forme algébrique.`,
    answer: cxAnswer(p),
    hint: level === 1 ? '$i^2 = -1$, $i^4 = 1$ : regarde le reste de l’exposant modulo $4$.' : '$(1 + i)^2 = 2i$. Ou bien $1 + i = \\sqrt{2}\\,e^{i\\pi/4}$ et formule de Moivre.',
    correction: level === 1 ? [`$${n} = 4\\times${Math.floor(n / 4)} + ${n % 4}$, donc $i^{${n}} = i^{${n % 4}} = ${cxTex(p)}$.`] : [`Avec la forme exponentielle (module $\\sqrt{2}$, argument multiple de $\\frac{\\pi}{4}$) : $z = ${cxTex(p)}$.`],
  };
});

const racineCarree = skill('l1-racine-carree-complexe', 'Calculer une racine carrée complexe', (rng, level) => {
  const p = rng.int(1, level === 1 ? 3 : 6);
  const q = rng.nonZero(-6, 6);
  const w = cx(p, q);
  const z = cxMul(w, w);
  return {
    prompt: `Les racines carrées de $${cxTex(z)}$ sont $\\pm w$. Donne celle de partie réelle positive.`,
    answer: cxAnswer(w),
    hint: 'Pose $w = x + iy$ : $x^2 - y^2 = \\mathrm{Re}$, $2xy = \\mathrm{Im}$ et $x^2 + y^2 = |z|$.',
    correction: [`$|z| = ${p * p + q * q}$, donc $x^2 + y^2 = ${p * p + q * q}$ et $x^2 - y^2 = ${z.re.n}$ : $x^2 = ${p * p}$, $y^2 = ${q * q}$.`, `$2xy = ${z.im.n}$ fixe le signe : $w = ${cxTex(w)}$.`],
  };
});

const equation = skill('l1-equation-second-degre-complexe', 'Résoudre une équation du second degré dans ℂ', (rng, level) => {
  const alpha = rng.int(-4, 4);
  const beta = rng.int(1, level === 1 ? 3 : 5);
  // Racines α ± iβ : z² - 2αz + α² + β² = 0.
  const b = -2 * alpha;
  const c = alpha * alpha + beta * beta;
  const bTerm = b === 0 ? '' : ` ${b < 0 ? '-' : '+'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}z`;
  return {
    prompt: `Résous $z^2${bTerm} + ${c} = 0$ dans $\\mathbb{C}$ et donne la solution de partie imaginaire positive.`,
    answer: cxAnswer(cx(alpha, beta)),
    hint: 'Si $\\Delta < 0$, les solutions sont $\\frac{-b \\pm i\\sqrt{-\\Delta}}{2a}$.',
    correction: [`$\\Delta = ${b * b} - ${4 * c} = ${b * b - 4 * c} = (${2 * beta}i)^2$`, `$z = \\frac{${-b} \\pm ${2 * beta}i}{2}$, et la solution cherchée est $${cxTex(cx(alpha, beta))}$.`],
  };
});

export const COMPLEXES_SKILLS: Skill[] = [algebrique, moduleSkill, equation, argument, puissance, racineCarree];
