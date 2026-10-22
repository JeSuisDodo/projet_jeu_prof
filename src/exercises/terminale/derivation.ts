import type { Skill } from '../types';
import { F, affine, choiceTex, fixedChoice, num, numF, par, plus, poly, skill, tex } from './util';

/** Chapitre « Compléments sur la dérivation » et convexité (Terminale spécialité). */

const pw = (k: number) => (k === 1 ? '' : `^{${k}}`);

const puissance = skill('tle-derivee-composee', 'Dériver une puissance d’une fonction affine', (rng, level) => {
  const a = rng.nonZero(-3, 3);
  const b = rng.int(-4, 4);
  const n = rng.int(2, level === 1 ? 3 : 5);
  const x0 = rng.int(-2, 2);
  const inner = a * x0 + b;
  const value = n * a * inner ** (n - 1);
  return {
    prompt: `$f(x) = (${affine(a, b)})^{${n}}$. Calcule $f'(${x0})$.`,
    answer: num(value),
    hint: 'Si $f = u^n$, alors $f\' = n\\,u\'\\,u^{n-1}$.',
    correction: [
      `$f'(x) = ${n}\\times ${par(a)}\\times (${affine(a, b)})${pw(n - 1)}$`,
      `$f'(${x0}) = ${n * a}\\times ${par(inner)}${pw(n - 1)} = ${value}$`,
    ],
  };
});

const racine = skill('tle-derivee-racine', 'Dériver la racine d’une fonction', (rng) => {
  const a = rng.nonZero(-4, 6);
  const s = rng.int(1, 5);
  // On choisit x0 pour que a x0 + b = s².
  const x0 = rng.int(-3, 3);
  const b = s * s - a * x0;
  const value = F(a, 2 * s);
  return {
    prompt: `$f(x) = \\sqrt{${affine(a, b)}}$. Calcule $f'(${x0})$.`,
    answer: numF(value),
    hint: 'Si $f = \\sqrt{u}$, alors $f\' = \\frac{u\'}{2\\sqrt{u}}$.',
    correction: [
      `$f'(x) = \\frac{${a}}{2\\sqrt{${affine(a, b)}}}$`,
      `En $${x0}$ : $${a}\\times ${par(x0)}${plus(b)} = ${s * s}$, donc $f'(${x0}) = \\frac{${a}}{2\\times ${s}} = ${tex(value)}$.`,
    ],
  };
});

const expComposee = skill('tle-derivee-exp', 'Dériver une exponentielle composée', (rng, level) => {
  const a = rng.nonZero(-4, 4);
  const b = rng.int(-3, 3);
  const k = level === 1 ? 1 : rng.nonZero(-3, 3);
  const u = affine(a, b);
  const front = (c: number) => (c === 1 ? '' : c === -1 ? '-' : String(c));
  const correct = `f'(x) = ${front(k * a)}e^{${u}}`;
  return {
    prompt: `$f(x) = ${front(k)}e^{${u}}$. Quelle est sa dérivée ?`,
    answer: choiceTex(
      rng,
      correct,
      [`f'(x) = ${front(k)}e^{${u}}`, `f'(x) = ${front(k * a)}e^{${a}}`, `f'(x) = ${front(k)}(${u})e^{${poly([a, b - 1])}}`, `f'(x) = ${front(k * b || 1)}e^{${u}}`],
      () => `f'(x) = ${front(k * a + 1)}e^{${u}}`,
    ),
    hint: 'Si $f = e^u$, alors $f\' = u\'e^u$.',
    correction: [`$u(x) = ${u}$ et $u'(x) = ${a}$.`, `$${correct}$`],
  };
});

const seconde = skill('tle-derivee-seconde', 'Calculer une dérivée seconde', (rng, level) => {
  const c = [rng.nonZero(-3, 3), rng.int(-5, 5), rng.int(-5, 5), rng.int(-5, 5)];
  if (level === 3) c.unshift(rng.nonZero(-2, 2));
  const deg = c.length - 1;
  const d1 = c.slice(0, -1).map((v, i) => v * (deg - i));
  const d2 = d1.slice(0, -1).map((v, i) => v * (deg - 1 - i));
  const x0 = rng.int(-2, 2);
  const value = d2.reduce((s, v, i) => s + v * x0 ** (d2.length - 1 - i), 0);
  return {
    prompt: `$f(x) = ${poly(c)}$. Calcule $f''(${x0})$.`,
    answer: num(value),
    hint: 'Dérive deux fois de suite.',
    correction: [`$f'(x) = ${poly(d1)}$`, `$f''(x) = ${poly(d2)}$`, `$f''(${x0}) = ${value}$`],
  };
});

const inflexion = skill('tle-point-inflexion', 'Trouver un point d’inflexion', (rng, level) => {
  const a = level === 1 ? 1 : rng.nonZero(-3, 3);
  // f''(x) = 6a x + 2b s'annule en -b/(3a) ; pour un résultat entier, on part de l'abscisse.
  const x0 = rng.int(-3, 3);
  const b = -3 * a * x0;
  const c = rng.int(-6, 6);
  const d = rng.int(-6, 6);
  return {
    prompt: `$f(x) = ${poly([a, b, c, d])}$. Quelle est l’abscisse de son point d’inflexion ?`,
    answer: num(x0),
    hint: 'Un point d’inflexion est un point où $f\'\'$ s’annule en changeant de signe.',
    correction: [
      `$f'(x) = ${poly([3 * a, 2 * b, c])}$ et $f''(x) = ${poly([6 * a, 2 * b])}$.`,
      `$f''(x) = 0 \\iff x = ${x0}$, et $f''$ (affine) change de signe en $${x0}$.`,
    ],
  };
});

const convexite = skill('tle-convexite', 'Étudier la convexité', (rng) => {
  const k = rng.int(-4, 4);
  const s = rng.pick([1, -1]);
  const fpp = `${s === 1 ? '' : '-'}(${poly([1, -k])})e^{x}`;
  const convexRight = s === 1;
  const options = [
    `Convexe sur $]-\\infty\\,;\\,${k}]$, concave sur $[${k}\\,;\\,+\\infty[$`,
    `Concave sur $]-\\infty\\,;\\,${k}]$, convexe sur $[${k}\\,;\\,+\\infty[$`,
    'Convexe sur $\\mathbb{R}$',
    'Concave sur $\\mathbb{R}$',
  ];
  return {
    prompt: `Pour tout réel $x$, $f''(x) = ${fpp}$. Que peut-on dire de la convexité de $f$ ?`,
    answer: fixedChoice(options, convexRight ? 1 : 0),
    hint: '$f$ est convexe là où $f\'\' \\geq 0$ et concave là où $f\'\' \\leq 0$. Ici $e^x > 0$.',
    correction: [
      `$e^x > 0$, donc $f''(x)$ a le signe de $${s === 1 ? '' : '-'}(${poly([1, -k])})$.`,
      convexRight
        ? `$f'' \\leq 0$ sur $]-\\infty\\,;\\,${k}]$ (concave) et $f'' \\geq 0$ sur $[${k}\\,;\\,+\\infty[$ (convexe).`
        : `$f'' \\geq 0$ sur $]-\\infty\\,;\\,${k}]$ (convexe) et $f'' \\leq 0$ sur $[${k}\\,;\\,+\\infty[$ (concave).`,
    ],
  };
});

const tangente = skill('tle-tangente', 'Équation d’une tangente', (rng, level) => {
  const c = [rng.nonZero(-2, 2), rng.int(-4, 4), rng.int(-4, 4)];
  if (level === 3) c.unshift(rng.nonZero(-1, 1));
  const deg = c.length - 1;
  const x0 = rng.int(-2, 2);
  const f = (x: number) => c.reduce((s, v, i) => s + v * x ** (deg - i), 0);
  const d1 = c.slice(0, -1).map((v, i) => v * (deg - i));
  const fp = d1.reduce((s, v, i) => s + v * x0 ** (d1.length - 1 - i), 0);
  const p = f(x0) - fp * x0;
  return {
    prompt: `$f(x) = ${poly(c)}$. La tangente à sa courbe en $${x0}$ a pour équation $y = mx + p$. Donne $m$ et $p$.`,
    answer: { kind: 'pair', values: [F(fp), F(p)], labels: ['m', 'p'] },
    hint: 'La tangente en $a$ a pour équation $y = f\'(a)(x - a) + f(a)$.',
    correction: [
      `$f'(x) = ${poly(d1)}$, donc $f'(${x0}) = ${fp}$ et $f(${x0}) = ${f(x0)}$.`,
      `$y = ${fp}(x - ${par(x0)})${plus(f(x0))} = ${poly([fp, p])}$`,
    ],
  };
});

export const DERIVATION_SKILLS: Skill[] = [puissance, racine, expComposee, seconde, inflexion, convexite, tangente];
