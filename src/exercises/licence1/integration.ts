import type { Skill } from '../types';
import { F, add, affine, mul, numF, pairOf, poly, skill, tex, texChoice } from './util';
import { enrichir } from '../licenceVariantes';
import { INTEGRATION_VARIANTES } from './variantes/integration';

/** Chapitre « Intégration » (Licence 1). */

const ePow = (k: number) => (k === 1 ? 'e' : `e^{${k}}`);
/** « 3e^{3} », « e » : coefficient entier devant une puissance de e. */
const co = (k: number) => (k === 1 ? '' : String(k));

const ipp = skill('l1-integration-parties', 'Intégrer par parties', (rng, level) => {
  const kinds = [
    () => {
      const k = rng.int(1, 4);
      // ∫_1^{e^k} ln x dx = (k − 1)e^k + 1
      const correct = k === 1 ? '1' : `${k === 2 ? '' : k - 1}${ePow(k)} + 1`;
      return {
        prompt: `Calcule $\\displaystyle\\int_1^{${ePow(k)}} \\ln x\\,dx$.`,
        correct,
        decoys: [`${co(k)}${ePow(k)}`, `${co(k)}${ePow(k)} - 1`, `${ePow(k)} - 1`, `${k + 1}${ePow(k)} + 1`, `${co(k)}${ePow(k)} + 1`],
        hint: 'Pose $u = \\ln x$, $v\' = 1$ : $\\int \\ln x\\,dx = x\\ln x - x$.',
        correction: [`$\\left[x\\ln x - x\\right]_1^{${ePow(k)}} = ${co(k)}${ePow(k)} - ${ePow(k)} - (0 - 1)$`, `$= ${correct}$`],
      };
    },
    () => ({
      prompt: 'Calcule $\\displaystyle\\int_0^{\\pi} x\\sin x\\,dx$.',
      correct: '\\pi',
      decoys: ['-\\pi', '0', '2', '\\pi - 2'],
      hint: 'Pose $u = x$, $v\' = \\sin x$.',
      correction: ['$\\left[-x\\cos x\\right]_0^{\\pi} + \\displaystyle\\int_0^{\\pi} \\cos x\\,dx = \\pi + 0$', '$= \\pi$'],
    }),
    () => ({
      prompt: 'Calcule $\\displaystyle\\int_0^{\\pi/2} x\\cos x\\,dx$.',
      correct: '\\frac{\\pi}{2} - 1',
      decoys: ['\\frac{\\pi}{2}', '\\frac{\\pi}{2} + 1', '1 - \\frac{\\pi}{2}', '1'],
      hint: 'Pose $u = x$, $v\' = \\cos x$.',
      correction: ['$\\left[x\\sin x\\right]_0^{\\pi/2} - \\displaystyle\\int_0^{\\pi/2} \\sin x\\,dx = \\frac{\\pi}{2} - 1$'],
    }),
    () => ({
      prompt: 'Calcule $\\displaystyle\\int_0^1 x^2 e^x\\,dx$.',
      correct: 'e - 2',
      decoys: ['e', 'e - 1', '2 - e', 'e + 2', '2e - 2'],
      hint: 'Deux intégrations par parties successives, avec $u = x^2$ puis $u = x$.',
      correction: ['$\\left[x^2e^x\\right]_0^1 - 2\\displaystyle\\int_0^1 xe^x\\,dx = e - 2\\times 1$', '$= e - 2$'],
    }),
    () => ({
      prompt: 'Calcule $\\displaystyle\\int_1^e x\\ln x\\,dx$.',
      correct: '\\frac{e^2 + 1}{4}',
      decoys: ['\\frac{e^2 - 1}{4}', '\\frac{e^2}{2}', '\\frac{e^2 + 1}{2}', '\\frac{e^2}{4}'],
      hint: 'Pose $u = \\ln x$, $v\' = x$.',
      correction: ['$\\left[\\frac{x^2}{2}\\ln x\\right]_1^e - \\displaystyle\\int_1^e \\frac{x}{2}\\,dx = \\frac{e^2}{2} - \\frac{e^2 - 1}{4}$', '$= \\frac{e^2 + 1}{4}$'],
    }),
  ];
  const ex = rng.pick(level === 1 ? kinds.slice(0, 2) : level === 2 ? kinds.slice(0, 4) : kinds.slice(2))();
  return { prompt: ex.prompt, answer: texChoice(rng, ex.correct, ex.decoys), hint: ex.hint, correction: ex.correction };
});

const changementVariable = skill('l1-changement-variable', 'Faire un changement de variable', (rng, level) => {
  // ∫_0^a 2x (x² + c)^n dx = [(x² + c)^{n+1}/(n+1)]_0^a
  const a = rng.int(1, 2);
  const c = level === 1 ? 1 : rng.int(1, 3);
  const n = rng.int(1, level === 3 ? 3 : 2);
  const k = level === 3 ? rng.int(1, 3) : 2;
  const top = (a * a + c) ** (n + 1);
  const bottom = c ** (n + 1);
  const value = mul(F(k, 2), F(top - bottom, n + 1));
  const half = k === 2 ? '' : tex(F(k, 2));
  return {
    prompt: `Calcule $\\displaystyle\\int_0^{${a}} ${k === 1 ? '' : k}x\\,(x^2 + ${c})^{${n}}\\,dx$.`,
    answer: numF(value),
    hint: 'Pose $t = x^2 + c$ : $dt = 2x\\,dx$.',
    correction: [`Avec $t = x^2 + ${c}$ : $\\displaystyle${half}\\int_{${c}}^{${a * a + c}} t^{${n}}\\,dt = ${half}\\left[\\frac{t^{${n + 1}}}{${n + 1}}\\right]_{${c}}^{${a * a + c}}$`, `$= ${half ? `${half}\\times` : ''}\\frac{${top} - ${bottom}}{${n + 1}} = ${tex(value)}$`],
  };
});

const elementsSimples = skill('l1-elements-simples', 'Décomposer une fraction rationnelle', (rng, level) => {
  const a = rng.int(-4, 4);
  let b = rng.int(-4, 4);
  while (b === a) b = rng.int(-4, 4);
  const p = level === 1 ? 0 : rng.int(-3, 3);
  const q = rng.nonZero(-5, 5);
  // (px + q)/((x − a)(x − b)) = A/(x − a) + B/(x − b) : A = (pa + q)/(a − b), B = (pb + q)/(b − a).
  const A = F(p * a + q, a - b);
  const B = F(p * b + q, b - a);
  const fac = (r: number) => (r === 0 ? 'x' : `(x ${r < 0 ? '+' : '-'} ${Math.abs(r)})`);
  const fac1 = (r: number) => (r === 0 ? 'x' : `x ${r < 0 ? '+' : '-'} ${Math.abs(r)}`);
  return {
    prompt: `Trouve $A$ et $B$ tels que $\\dfrac{${affine(p, q)}}{${fac(a)}${fac(b)}} = \\dfrac{A}{${fac1(a)}} + \\dfrac{B}{${fac1(b)}}$.`,
    answer: pairOf(A, B, ['A', 'B']),
    hint: 'Multiplie par $(x - a)$ puis fais $x = a$ ; de même pour $B$.',
    correction: [`$A = \\dfrac{${p * a + q}}{${a - b}} = ${tex(A)}$`, `$B = \\dfrac{${p * b + q}}{${b - a}} = ${tex(B)}$`],
  };
});

const riemann = skill('l1-sommes-riemann', 'Calculer la limite d’une somme de Riemann', (rng, level) => {
  // lim (1/n) Σ f(k/n) = ∫_0^1 f, avec f polynôme.
  const c = level === 1 ? [rng.nonZero(1, 4), rng.int(0, 3)] : [rng.nonZero(-3, 3), rng.int(-3, 3), rng.int(-3, 3)];
  const deg = c.length - 1;
  let integral = F(0);
  c.forEach((v, i) => (integral = add(integral, F(v, deg - i + 1))));
  const fk = poly(c, '\\frac{k}{n}').replace(/\\frac\{k\}\{n\}\^\{2\}/g, '\\frac{k^2}{n^2}');
  return {
    prompt: `Calcule $\\displaystyle\\lim_{n \\to +\\infty} \\frac{1}{n}\\sum_{k=1}^{n} \\left(${fk}\\right)$.`,
    answer: numF(integral),
    hint: 'Somme de Riemann : $\\frac{1}{n}\\sum_{k=1}^{n} f\\left(\\frac{k}{n}\\right) \\to \\int_0^1 f(x)\\,dx$.',
    correction: [`Avec $f(x) = ${poly(c)}$ : $\\displaystyle\\int_0^1 f(x)\\,dx = ${tex(integral)}$.`],
  };
});

const primitivesUsuelles = skill('l1-primitives-usuelles', 'Reconnaître une primitive usuelle', (rng, level) => {
  const pool: [string, string, string[], string][] = [
    ['\\int_0^1 \\frac{dx}{1 + x^2}', '\\frac{\\pi}{4}', ['\\frac{\\pi}{2}', '\\ln 2', '\\frac{\\pi}{3}', '1'], 'Une primitive de $\\frac{1}{1+x^2}$ est $\\arctan x$.'],
    ['\\int_0^{1/2} \\frac{dx}{\\sqrt{1 - x^2}}', '\\frac{\\pi}{6}', ['\\frac{\\pi}{3}', '\\frac{\\pi}{4}', '\\frac{1}{2}', '\\ln 2'], 'Une primitive de $\\frac{1}{\\sqrt{1-x^2}}$ est $\\arcsin x$.'],
    ['\\int_0^1 \\frac{dx}{1 + x}', '\\ln 2', ['1', '\\frac{1}{2}', '\\ln 3', '\\frac{\\pi}{4}'], 'Une primitive de $\\frac{1}{1+x}$ est $\\ln(1 + x)$.'],
    ['\\int_0^{\\pi/4} \\tan x\\,dx', '\\frac{\\ln 2}{2}', ['\\ln 2', '1', '\\frac{\\pi}{4}', '\\frac{\\sqrt{2}}{2}'], 'Une primitive de $\\tan$ est $-\\ln|\\cos x|$.'],
    ['\\int_0^1 \\frac{2x}{1 + x^2}\\,dx', '\\ln 2', ['\\frac{\\pi}{4}', '1', '\\frac{\\pi}{2}', '2\\ln 2'], 'C’est de la forme $\\frac{u\'}{u}$ : primitive $\\ln(1 + x^2)$.'],
    ['\\int_0^{\\sqrt{3}} \\frac{dx}{1 + x^2}', '\\frac{\\pi}{3}', ['\\frac{\\pi}{6}', '\\frac{\\pi}{4}', '\\sqrt{3}', '\\frac{\\pi}{2}'], '$\\arctan\\sqrt{3} = \\frac{\\pi}{3}$.'],
    ['\\int_0^{\\pi/2} \\cos^2 x\\,dx', '\\frac{\\pi}{4}', ['\\frac{\\pi}{2}', '1', '\\frac{1}{2}', '0'], 'Linéarise : $\\cos^2 x = \\frac{1 + \\cos 2x}{2}$.'],
    ['\\int_0^{1} \\frac{dx}{4 + x^2}', '\\frac{1}{2}\\arctan\\frac{1}{2}', ['\\arctan\\frac{1}{2}', '\\frac{\\pi}{8}', '2\\arctan\\frac{1}{2}', '\\frac{1}{4}\\arctan\\frac{1}{2}'], 'Une primitive de $\\frac{1}{a^2 + x^2}$ est $\\frac{1}{a}\\arctan\\frac{x}{a}$.'],
  ];
  const [integral, correct, decoys, why] = rng.pick(level === 1 ? pool.slice(0, 3) : level === 2 ? pool.slice(0, 6) : pool.slice(3));
  return {
    prompt: `Calcule $\\displaystyle${integral}$.`,
    answer: texChoice(rng, correct, decoys),
    hint: 'Primitives usuelles : $\\arctan$, $\\arcsin$, $\\ln|u|$ pour $\\frac{u\'}{u}$.',
    correction: [why, `Résultat : $${correct}$`],
  };
});

export const INTEGRATION_SKILLS: Skill[] = enrichir([primitivesUsuelles, changementVariable, elementsSimples, ipp, riemann], INTEGRATION_VARIANTES);
