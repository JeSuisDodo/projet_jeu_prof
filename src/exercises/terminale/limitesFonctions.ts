import type { Skill } from '../types';
import { F, choiceTex, plus, poly, skill, tex } from './util';

/** Chapitre « Limites de fonctions » (Terminale spécialité). */

const LIMITS = ['0', '+\\infty', '-\\infty', '1'];

const infini = skill('tle-limite-infini', 'Limite en l’infini d’une fonction rationnelle', (rng, level) => {
  const p = rng.int(1, 3);
  const q = level === 1 ? p : rng.int(1, 3);
  const a = rng.nonZero(-5, 5);
  const c = rng.nonZero(-4, 5);
  const toMinus = level === 3 && rng.next() < 0.5;
  const top = [a, ...Array.from({ length: p }, () => rng.int(-5, 5))];
  const bottom = [c, ...Array.from({ length: q }, () => rng.int(-5, 5))];
  let correct: string;
  if (p === q) correct = tex(F(a, c));
  else if (p < q) correct = '0';
  else {
    // a x^p / (c x^q) ~ (a/c) x^(p-q), dont le signe en -∞ dépend de la parité de p - q.
    const sign = Math.sign(a / c) * (toMinus && (p - q) % 2 === 1 ? -1 : 1);
    correct = sign > 0 ? '+\\infty' : '-\\infty';
  }
  const at = toMinus ? '-\\infty' : '+\\infty';
  return {
    prompt: `Quelle est la limite de $f(x) = \\frac{${poly(top)}}{${poly(bottom)}}$ quand $x \\to ${at}$ ?`,
    answer: choiceTex(rng, correct, [...LIMITS, tex(F(a, c)), tex(F(c, a))], () => tex(F(a + rng.nonZero(-3, 3), c))),
    hint: 'En l’infini, un quotient de polynômes a la même limite que le quotient de leurs termes de plus haut degré.',
    correction: [
      `En $${at}$, $f(x)$ a la même limite que $\\frac{${poly([a, ...Array(p).fill(0)])}}{${poly([c, ...Array(q).fill(0)])}}$.`,
      `Donc $\\lim f = ${correct}$.`,
    ],
  };
});

const croissances = skill('tle-croissances-comparees', 'Utiliser les croissances comparées', (rng) => {
  const n = rng.int(1, 4);
  const xn = n === 1 ? 'x' : `x^{${n}}`;
  const cases = [
    { expr: `\\frac{e^x}{${xn}}`, at: '+\\infty', lim: '+\\infty', why: `En $+\\infty$, l’exponentielle l’emporte sur $${xn}$.` },
    { expr: `${xn}e^{-x}`, at: '+\\infty', lim: '0', why: `$${xn}e^{-x} = \\frac{${xn}}{e^x}$ et l’exponentielle l’emporte.` },
    { expr: `${xn}e^{x}`, at: '-\\infty', lim: '0', why: 'En $-\\infty$, $x^n e^x \\to 0$ (croissances comparées).' },
    { expr: `\\frac{${xn}}{e^x}`, at: '+\\infty', lim: '0', why: 'L’exponentielle l’emporte sur toute puissance de $x$.' },
    { expr: `e^x - ${xn}`, at: '+\\infty', lim: '+\\infty', why: `$e^x - ${xn} = e^x\\left(1 - \\frac{${xn}}{e^x}\\right)$ et la parenthèse tend vers $1$.` },
  ];
  const c = rng.pick(cases);
  return {
    prompt: `Quelle est la limite de $${c.expr}$ quand $x \\to ${c.at}$ ?`,
    answer: choiceTex(rng, c.lim, LIMITS, () => '-\\infty'),
    hint: 'Croissances comparées : en $+\\infty$, $\\frac{e^x}{x^n} \\to +\\infty$ ; en $-\\infty$, $x^n e^x \\to 0$.',
    correction: [c.why, `Donc la limite vaut $${c.lim}$.`],
  };
});

const enA = skill('tle-limite-en-a', 'Limite en un point où le dénominateur s’annule', (rng, level) => {
  const a = rng.int(-5, 5);
  const k = rng.nonZero(-6, 6);
  const right = rng.next() < 0.5;
  const squared = level === 3 && rng.next() < 0.4;
  const denom = squared ? `(${poly([1, -a])})^2` : poly([1, -a]);
  const sign = squared ? Math.sign(k) : Math.sign(k) * (right ? 1 : -1);
  const correct = sign > 0 ? '+\\infty' : '-\\infty';
  const side = right ? '^+' : '^-';
  return {
    prompt: `Quelle est la limite de $f(x) = \\frac{${k}}{${denom}}$ quand $x \\to ${a}${squared ? '' : side}$ ?`,
    answer: choiceTex(rng, correct, LIMITS.slice(0, 3), () => String(k)),
    hint: 'Le numérateur tend vers une constante non nulle et le dénominateur vers $0$ : étudie le signe du dénominateur.',
    correction: [
      squared
        ? `Le dénominateur tend vers $0$ en restant positif (c’est un carré).`
        : `Quand $x \\to ${a}${side}$, $${denom}$ tend vers $0$ en restant ${right ? 'positif' : 'négatif'}.`,
      `Le numérateur vaut $${k}$, donc $\\lim f = ${correct}$.`,
    ],
  };
});

const asymptotes = skill('tle-asymptotes', 'Trouver les asymptotes d’une courbe', (rng, level) => {
  const a = rng.int(-5, 5);
  const c = rng.int(-5, 5);
  const k = rng.nonZero(-6, 6);
  const expr = level === 1 ? `${c === 0 ? '' : `${c} + `}\\frac{${k}}{${poly([1, -a])}}` : `\\frac{${poly([c, k - a * c])}}{${poly([1, -a])}}`;
  return {
    prompt: `$f(x) = ${expr}$. Sa courbe a une asymptote verticale d’équation $x = a$ et une asymptote horizontale d’équation $y = b$. Donne $a$ et $b$.`,
    answer: { kind: 'pair', values: [F(a), F(c)], labels: ['a', 'b'] },
    hint: 'Asymptote verticale : là où le dénominateur s’annule. Horizontale : la limite de $f$ en $\\pm\\infty$.',
    correction: [
      ...(level === 1 ? [] : [`On peut écrire $f(x) = ${c} + \\frac{${k}}{${poly([1, -a])}}$.`]),
      `Quand $x \\to ${a}$, $f(x) \\to \\pm\\infty$ : asymptote verticale $x = ${a}$.`,
      `Quand $x \\to \\pm\\infty$, $\\frac{${k}}{${poly([1, -a])}} \\to 0$ donc $f(x) \\to ${c}$ : asymptote horizontale $y = ${c}$.`,
    ],
  };
});

const indeterminee = skill('tle-forme-indeterminee', 'Lever une forme indéterminée', (rng, level) => {
  const kind = rng.int(0, level === 1 ? 1 : 2);
  if (kind === 2) {
    // √(x + a) - √x = a / (√(x+a) + √x) → 0
    const a = rng.int(1, 9);
    return {
      prompt: `Quelle est la limite de $\\sqrt{x + ${a}} - \\sqrt{x}$ quand $x \\to +\\infty$ ?`,
      answer: choiceTex(rng, '0', LIMITS, () => String(a)),
      hint: 'Multiplie par la quantité conjuguée $\\sqrt{x + a} + \\sqrt{x}$.',
      correction: [
        `$\\sqrt{x + ${a}} - \\sqrt{x} = \\frac{(x + ${a}) - x}{\\sqrt{x + ${a}} + \\sqrt{x}} = \\frac{${a}}{\\sqrt{x + ${a}} + \\sqrt{x}}$`,
        'Le dénominateur tend vers $+\\infty$, donc la limite vaut $0$.',
      ],
    };
  }
  // a x^p + b x^(p-1) + … en +∞ : « ∞ - ∞ » quand a et b ont des signes contraires.
  const p = rng.int(2, 3);
  const a = rng.nonZero(-4, 4);
  const b = -Math.sign(a) * rng.int(1, 9);
  const coefs = [a, b, ...Array(p - 1).fill(0).map(() => rng.int(-5, 5))];
  const correct = a > 0 ? '+\\infty' : '-\\infty';
  return {
    prompt: `Quelle est la limite de $f(x) = ${poly(coefs)}$ quand $x \\to +\\infty$ ?`,
    answer: choiceTex(rng, correct, LIMITS, () => String(a)),
    hint: 'Factorise par le terme de plus haut degré.',
    correction: [
      `$f(x) = x^{${p}}\\left(${a}${plus(b)}\\frac{1}{x} + \\dots\\right)$ : la parenthèse tend vers $${a}$.`,
      `Donc $\\lim f = ${correct}$.`,
    ],
  };
});

const composition = skill('tle-limite-composee', 'Limite d’une fonction composée', (rng) => {
  const k = rng.int(1, 5);
  const cases = [
    { expr: `e^{-${k === 1 ? '' : k}x^2}`, at: '+\\infty', lim: '0', why: `$-${k === 1 ? '' : k}x^2 \\to -\\infty$ et $\\lim_{X \\to -\\infty} e^X = 0$.` },
    { expr: `e^{\\frac{${k}}{x}}`, at: '+\\infty', lim: '1', why: `$\\frac{${k}}{x} \\to 0$ et $e^0 = 1$.` },
    { expr: `\\sqrt{${k}x^2 + 1}`, at: '-\\infty', lim: '+\\infty', why: `$${k === 1 ? '' : k}x^2 + 1 \\to +\\infty$ et $\\lim_{X \\to +\\infty} \\sqrt{X} = +\\infty$.` },
    { expr: `e^{${k}x}`, at: '-\\infty', lim: '0', why: `$${k === 1 ? '' : k}x \\to -\\infty$ et $\\lim_{X \\to -\\infty} e^X = 0$.` },
    { expr: `\\frac{1}{e^{x} + ${k}}`, at: '-\\infty', lim: tex(F(1, k)), why: `$e^x \\to 0$ donc le dénominateur tend vers $${k}$.` },
  ];
  const c = rng.pick(cases);
  return {
    prompt: `Quelle est la limite de $${c.expr}$ quand $x \\to ${c.at}$ ?`,
    answer: choiceTex(rng, c.lim, [...LIMITS, tex(F(1, k))], () => String(k + 1)),
    hint: 'Cherche d’abord la limite de l’expression « intérieure », puis celle de la fonction « extérieure ».',
    correction: [c.why, `Donc la limite vaut $${c.lim}$.`],
  };
});

export const LIMITES_FONCTIONS_SKILLS: Skill[] = [infini, croissances, enA, asymptotes, indeterminee, composition];
