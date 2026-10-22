import type { Frac } from '../fraction';
import type { Skill } from '../types';
import { F, fixedChoice, mul, numF, skill, tex } from './util';

/** Chapitre « Suites et séries de fonctions » (L2). */

const POINTS = [F(0), F(1, 2), F(1, 3), F(2), F(3), F(1), F(3, 2), F(2, 3)];

const limiteSimple = skill('l2-limite-simple', 'Calculer une limite simple', (rng, level) => {
  const x = rng.pick(POINTS);
  const families = [
    {
      f: '\\frac{nx}{1 + nx}',
      l: (t: Frac) => (t.n === 0 ? F(0) : F(1)),
      why: (t: Frac) => (t.n === 0 ? '$f_n(0) = 0$ pour tout $n$.' : `$f_n(${tex(t)}) = \\dfrac{n\\times ${tex(t)}}{1 + n\\times ${tex(t)}} \\to 1$`),
    },
    {
      f: '\\frac{nx^2 + 1}{n + x}',
      l: (t: Frac) => mul(t, t),
      why: (t: Frac) => `On divise par $n$ : $\\dfrac{${tex(mul(t, t))} + \\frac{1}{n}}{1 + \\frac{${tex(t)}}{n}} \\to ${tex(mul(t, t))}$`,
    },
    {
      f: '\\frac{nx + 2}{n + 1}',
      l: (t: Frac) => t,
      why: (t: Frac) => `On divise par $n$ : la limite vaut $${tex(t)}$.`,
    },
    {
      f: 'n\\,x\\,e^{-nx}',
      l: () => F(0),
      why: (t: Frac) => (t.n === 0 ? '$f_n(0) = 0$.' : `Croissances comparées : $n e^{-${tex(t)}n} \\to 0$.`),
    },
  ];
  const fam = rng.pick(level === 1 ? families.slice(0, 3) : families);
  const v = fam.l(x);
  return {
    prompt: `Pour $x \\geq 0$, $f_n(x) = ${fam.f}$. La suite $(f_n)$ converge simplement vers $f$. Calcule $f(${tex(x)})$.`,
    answer: numF(v),
    hint: 'Fixe $x$ et fais tendre $n$ vers $+\\infty$.',
    correction: [fam.why(x), `$f(${tex(x)}) = ${tex(v)}$`],
  };
});

const UNIF = ['Uniforme sur $I$', 'Simple, mais pas uniforme sur $I$'];

const uniforme = skill('l2-convergence-uniforme', 'Décider si la convergence est uniforme', (rng) => {
  const a = rng.pick([F(1, 2), F(1, 3), F(2, 3), F(3, 4)]);
  const cases = [
    { f: 'x^n', I: '[0\\,;\\,1]', u: false, why: 'La limite simple ($0$ sur $[0\\,;\\,1[$, $1$ en $1$) n’est pas continue : la convergence ne peut pas être uniforme.' },
    { f: 'x^n', I: `[0\\,;\\,${tex(a)}]`, u: true, why: `$\\sup |f_n| = \\left(${tex(a)}\\right)^n \\to 0$.` },
    { f: '\\frac{x}{n}', I: '[0\\,;\\,1]', u: true, why: '$\\sup |f_n| = \\frac{1}{n} \\to 0$.' },
    { f: '\\frac{x}{n}', I: '\\mathbb{R}', u: false, why: '$\\sup_{\\mathbb{R}} |f_n| = +\\infty$ pour tout $n$.' },
    { f: '\\frac{\\sin(nx)}{n}', I: '\\mathbb{R}', u: true, why: '$|f_n(x)| \\leq \\frac{1}{n}$ pour tout $x$.' },
    { f: 'nxe^{-nx}', I: '[0\\,;\\,+\\infty[', u: false, why: '$f_n\\left(\\frac{1}{n}\\right) = e^{-1}$ ne tend pas vers $0$.' },
    { f: 'nxe^{-nx}', I: '[1\\,;\\,+\\infty[', u: true, why: 'Pour $n \\geq 1$, $f_n$ décroît sur $[1\\,;\\,+\\infty[$ : $\\sup = ne^{-n} \\to 0$.' },
    { f: '\\frac{1}{1 + nx^2}', I: '\\mathbb{R}', u: false, why: 'La limite simple ($1$ en $0$, $0$ ailleurs) n’est pas continue.' },
    { f: '\\frac{1}{1 + nx^2}', I: '[1\\,;\\,+\\infty[', u: true, why: '$\\sup = \\frac{1}{1 + n} \\to 0$.' },
  ];
  const c = rng.pick(cases);
  return {
    prompt: `$f_n(x) = ${c.f}$ sur $I = ${c.I}$. La suite $(f_n)$ converge simplement : la convergence est-elle uniforme ?`,
    answer: fixedChoice(UNIF, c.u ? 0 : 1),
    hint: 'Calcule (ou majore) $\\sup_I |f_n - f|$ ; une limite uniforme de fonctions continues est continue.',
    correction: [c.why],
  };
});

const normeInfinie = skill('l2-norme-infinie', 'Calculer une norme uniforme', (rng, level) => {
  const k = rng.int(2, level === 1 ? 4 : 6);
  const n = k * k;
  if (level === 1 || rng.next() < 0.5) {
    // f_n(x) = nx/(1 + n²x²) : maximum 1/2 en x = 1/n
    const c = rng.int(1, 4);
    return {
      prompt: `$f_n(x) = \\dfrac{${c === 1 ? '' : c}nx}{1 + n^2x^2}$ sur $[0\\,;\\,+\\infty[$. Calcule $\\|f_{${n}}\\|_\\infty$.`,
      answer: numF(F(c, 2)),
      hint: 'Étudie les variations : la dérivée s’annule en $x = \\frac{1}{n}$.',
      correction: ['$f_n\'(x) = ' + `${c === 1 ? '' : c}` + 'n\\dfrac{1 - n^2x^2}{(1 + n^2x^2)^2}$ s’annule en $x = \\frac{1}{n}$.', `$\\|f_n\\|_\\infty = f_n\\left(\\frac{1}{n}\\right) = \\dfrac{${c}}{2}$ : la convergence vers $0$ n’est pas uniforme.`],
    };
  }
  // f_n(x) = x/(n + x²) : maximum 1/(2√n) en x = √n
  const v = F(1, 2 * k);
  return {
    prompt: `$f_n(x) = \\dfrac{x}{n + x^2}$ sur $[0\\,;\\,+\\infty[$. Calcule $\\|f_{${n}}\\|_\\infty$.`,
    answer: numF(v),
    hint: 'Étudie les variations : la dérivée s’annule en $x = \\sqrt{n}$.',
    correction: ['$f_n\'(x) = \\dfrac{n - x^2}{(n + x^2)^2}$ s’annule en $x = \\sqrt{n}$.', `$\\|f_{${n}}\\|_\\infty = \\dfrac{\\sqrt{${n}}}{${n} + ${n}} = \\dfrac{1}{2\\sqrt{${n}}} = ${tex(v)}$`],
  };
});

const NORMALE = ['Converge normalement sur $\\mathbb{R}$', 'Ne converge pas normalement sur $\\mathbb{R}$'];

const normale = skill('l2-convergence-normale', 'Reconnaître une convergence normale', (rng, level) => {
  const alpha = rng.pick(level === 1 ? [F(1), F(2), F(3)] : [F(1, 2), F(1), F(3, 2), F(2), F(4, 3)]);
  const fn = rng.pick(['\\sin(nx)', '\\cos(nx)', '\\cos^2(nx)']);
  const pw = alpha.n === alpha.d ? 'n' : `n^{${tex(alpha)}}`;
  const ok = alpha.n > alpha.d;
  return {
    prompt: `La série de fonctions $\\displaystyle\\sum_{n\\geq 1} \\frac{${fn}}{${pw}}$ converge-t-elle normalement sur $\\mathbb{R}$ ?`,
    answer: fixedChoice(NORMALE, ok ? 0 : 1),
    hint: 'Convergence normale : $\\sum \\|f_n\\|_\\infty$ converge.',
    correction: [`$\\|f_n\\|_\\infty = \\dfrac{1}{${pw}}$ (atteint), et $\\sum \\dfrac{1}{${pw}}$ ${ok ? 'converge' : 'diverge'} (Riemann).`],
  };
});

const interversion = skill('l2-limite-integrale', 'Intervertir limite et intégrale', (rng, level) => {
  const k = rng.int(1, level === 1 ? 2 : 4);
  const a = rng.int(1, 5);
  const b = rng.int(1, 4);
  const c = level === 3 ? rng.int(2, 3) : 1;
  // f_n(x) = (c n x^k + a)/(n + b) → c x^k uniformément sur [0, 1]
  const v = F(c, k + 1);
  const xk = k === 1 ? 'x' : `x^{${k}}`;
  return {
    prompt: `$f_n(x) = \\dfrac{${c === 1 ? '' : c}n${xk} + ${a}}{n + ${b}}$ sur $[0\\,;\\,1]$. Calcule $\\displaystyle\\lim_{n\\to+\\infty} \\int_0^1 f_n(x)\\,dx$.`,
    answer: numF(v),
    hint: 'La convergence est uniforme sur le segment $[0\\,;\\,1]$ : on peut intervertir limite et intégrale.',
    correction: [
      `$f_n \\to f$ avec $f(x) = ${c === 1 ? '' : c}${xk}$, uniformément sur $[0\\,;\\,1]$ ($\\|f_n - f\\|_\\infty \\leq \\frac{${a} + ${b * c}}{n + ${b}}$).`,
      `$\\displaystyle\\lim \\int_0^1 f_n = \\int_0^1 ${c === 1 ? '' : c}${xk}\\,dx = ${tex(v)}$`,
    ],
  };
});

export const SUITES_FONCTIONS_SKILLS: Skill[] = [limiteSimple, uniforme, normeInfinie, normale, interversion];
