import type { Skill } from '../types';
import { evalFrac, polyFrac, primitiveCoefs } from '../terminale/primitives';
import { F, fixedChoice, num, numF, poly, skill, sub, tex, times } from './util';

/** Chapitre « Mesure et intégrale de Lebesgue » (Licence 3). */

const iv = (a: number, b: number) => `[${a}\\,;\\,${b}]`;

const lebesgue = skill('l3-mesure-lebesgue', 'Calculer une mesure de Lebesgue', (rng, level) => {
  const a = rng.int(-5, 2);
  const b = a + rng.int(1, 4);
  if (level === 1) {
    const c = b + rng.int(1, 3);
    const d = c + rng.int(1, 4);
    return {
      prompt: `Calcule $\\lambda\\left(${iv(a, b)} \\cup ${iv(c, d)}\\right)$.`,
      answer: num(b - a + d - c),
      hint: 'Les intervalles sont disjoints : la mesure est additive.',
      correction: [`$\\lambda = (${b} - ${a < 0 ? `(${a})` : a}) + (${d} - ${c < 0 ? `(${c})` : c}) = ${b - a + d - c}$`],
    };
  }
  if (level === 2) {
    const c = rng.int(a + 1, b);
    const d = Math.max(b, c) + rng.int(1, 3);
    return {
      prompt: `Calcule $\\lambda\\left(${iv(a, b)} \\cup ${iv(c, d)}\\right)$.`,
      answer: num(d - a),
      hint: 'Les intervalles se chevauchent : réunis-les d’abord en un seul intervalle.',
      correction: [`La réunion est $${iv(a, d)}$.`, `$\\lambda = ${d - a}$`],
    };
  }
  const variants: [string, number, string][] = [
    [`${iv(a, b)} \\setminus \\mathbb{Q}`, b - a, '$\\mathbb{Q}$ est dénombrable, donc de mesure nulle.'],
    [`${iv(a, b)} \\cup \\mathbb{Z}`, b - a, '$\\mathbb{Z}$ est dénombrable, donc de mesure nulle.'],
    [`${iv(a, b)} \\cup K`, b - a, 'L’ensemble de Cantor $K$ est de mesure nulle (il reste $(2/3)^n$ après $n$ étapes).'],
  ];
  const [set, value, why] = rng.pick(variants);
  return {
    prompt: `Calcule $\\lambda\\left(${set}\\right)$${set.includes('K') ? ' où $K$ est l’ensemble triadique de Cantor' : ''}.`,
    answer: num(value),
    hint: 'Une partie dénombrable est de mesure nulle ; ajouter ou retirer une partie négligeable ne change pas la mesure.',
    correction: [why, `$\\lambda = ${value}$`],
  };
});

const etagee = skill('l3-fonction-etagee', 'Intégrer une fonction étagée', (rng, level) => {
  const count = level + 1;
  let x = rng.int(-3, 0);
  const parts: [number, number, number][] = [];
  for (let i = 0; i < count; i++) {
    const y = x + rng.int(1, 3);
    parts.push([rng.nonZero(-4, 5), x, y]);
    x = y + (level === 3 ? rng.int(0, 2) : 0);
  }
  const total = parts.reduce((s, [c, a, b]) => s + c * (b - a), 0);
  const f = parts.map(([c, a, b], i) => `${i === 0 ? (c < 0 ? '-' : '') : c < 0 ? ' - ' : ' + '}${Math.abs(c) === 1 ? '' : Math.abs(c)}\\mathbf{1}_{[${a};${b}[}`).join('');
  return {
    prompt: `Calcule $\\displaystyle\\int_{\\mathbb{R}} f\\,d\\lambda$ pour $f = ${f}$.`,
    answer: num(total),
    hint: '$\\int \\sum c_i \\mathbf{1}_{A_i}\\,d\\lambda = \\sum c_i\\,\\lambda(A_i)$.',
    correction: [`$\\int f\\,d\\lambda = ${parts.map(([c, a, b]) => times(c, b - a)).join(' + ').replace(/\+ -/g, '- ')} = ${total}$`],
  };
});

const dominee = skill('l3-convergence-dominee', 'Appliquer la convergence dominée', (rng, level) => {
  if (level === 3) {
    const bank: [string, string, string][] = [
      ['\\int_0^1 x^n\\,dx', '0', '$x^n \\to 0$ pour $x \\in [0\\,;\\,1[$, dominée par $1$.'],
      ['\\int_0^1 \\left(1 + \\frac{x}{n}\\right)^n dx', 'e - 1', '$\\left(1 + \\frac{x}{n}\\right)^n \\to e^x$, dominée par $e^x$ (ou par $e$).'],
      ['\\int_0^{+\\infty} e^{-nx}\\,dx', '0', 'Calcul direct : l’intégrale vaut $\\frac{1}{n}$ (convergence dominée sur $[1, +\\infty[$ par $e^{-x}$).'],
      ['\\int_0^{\\pi/2} \\sin^n x\\,dx', '0', '$\\sin^n x \\to 0$ sauf en $\\frac{\\pi}{2}$ (point négligeable), dominée par $1$.'],
      ['\\int_0^{+\\infty} \\frac{dx}{(1 + x^2)\\left(1 + \\frac{x}{n}\\right)}', '\\frac{\\pi}{2}', 'La fonction tend vers $\\frac{1}{1 + x^2}$, dominée par elle-même.'],
    ];
    const [integral, limit, why] = rng.pick(bank);
    const all = ['0', '1', 'e - 1', '\\frac{\\pi}{2}', '+\\infty', 'e'];
    const options = rng.shuffle([limit, ...rng.shuffle(all.filter((o) => o !== limit)).slice(0, 3)]).map((o) => `$${o}$`);
    return {
      prompt: `Calcule $\\displaystyle\\lim_{n \\to +\\infty} ${integral}$.`,
      answer: fixedChoice(options, options.indexOf(`$${limit}$`)),
      hint: 'Trouve la limite simple de l’intégrande et une fonction intégrable qui le domine pour tout $n$.',
      correction: [why, `La limite vaut $${limit}$.`],
    };
  }
  // f_n(x) = P(x) · n / (n + x) sur [0, a], dominée par |P|.
  const c = [rng.nonZero(-3, 3), rng.int(-3, 3), ...(level === 2 ? [rng.int(-3, 3)] : [])];
  const a = rng.int(1, 3);
  const P = primitiveCoefs(c);
  const value = sub(evalFrac(P, a), evalFrac(P, 0));
  return {
    prompt: `Calcule $\\displaystyle\\lim_{n \\to +\\infty} \\int_0^{${a}} (${poly(c)})\\,\\frac{n}{n + x}\\,dx$.`,
    answer: numF(value),
    hint: 'Pour $x$ fixé, $\\frac{n}{n + x} \\to 1$, et $\\left|f_n(x)\\right| \\leq |P(x)|$ qui est intégrable sur le segment.',
    correction: [
      `Par convergence dominée, la limite est $\\int_0^{${a}} (${poly(c)})\\,dx$.`,
      `Une primitive est $${polyFrac(P)}$, d’où la limite $${tex(value)}$.`,
    ],
  };
});

const fubini = skill('l3-fubini', 'Calculer une intégrale double avec Fubini', (rng, level) => {
  if (level === 3) {
    const a = rng.int(1, 3);
    const c = rng.int(1, 4);
    const value = F(c * a ** 3, 6);
    return {
      prompt: `Calcule $\\displaystyle\\iint_{\\{0 \\leq y \\leq x \\leq ${a}\\}} ${c === 1 ? '' : c}y\\,dx\\,dy$.`,
      answer: numF(value),
      hint: 'Intègre d’abord en $y$ de $0$ à $x$, puis en $x$ de $0$ à $a$.',
      correction: [`$\\int_0^x ${c === 1 ? '' : c}y\\,dy = ${tex(F(c, 2))}x^2$`, `$\\int_0^{${a}} ${tex(F(c, 2))}x^2\\,dx = ${tex(F(c, 6))}\\times ${a ** 3} = ${tex(value)}$`],
    };
  }
  const a = rng.int(1, 3);
  const b = rng.int(1, 3);
  const p = rng.int(0, level === 1 ? 1 : 3);
  const q = rng.int(level === 1 ? 0 : 1, level === 1 ? 1 : 2);
  const Ix = F(a ** (p + 1), p + 1);
  const Iy = F(b ** (q + 1), q + 1);
  const value = F(Ix.n * Iy.n, Ix.d * Iy.d);
  const m = (v: string, k: number) => (k === 0 ? '' : k === 1 ? v : `${v}^{${k}}`);
  const f = `${m('x', p)}${m('y', q)}` || '1';
  return {
    prompt: `Calcule $\\displaystyle\\iint_{[0;${a}]\\times[0;${b}]} ${f}\\,dx\\,dy$.`,
    answer: numF(value),
    hint: 'Fubini-Tonelli (fonction positive) : l’intégrale d’un produit $g(x)h(y)$ sur un pavé est le produit des intégrales.',
    correction: [`$\\int_0^{${a}} ${m('x', p) || '1'}\\,dx = ${tex(Ix)}$ et $\\int_0^{${b}} ${m('y', q) || '1'}\\,dy = ${tex(Iy)}$.`, `Produit : $${tex(value)}$`],
  };
});

const riemann = skill('l3-integrabilite-riemann', 'Reconnaître une fonction intégrable', (rng, level) => {
  const den = level === 1 ? rng.int(1, 2) : rng.int(1, 4);
  let numer = rng.int(1, 3 * den);
  if (numer === den) numer += 1;
  const alpha = F(numer, den);
  const atInfinity = level === 3 ? rng.next() < 0.5 : rng.next() < 0.7;
  const ok = atInfinity ? alpha.n > alpha.d : alpha.n < alpha.d;
  const domain = atInfinity ? '[1\\,;\\,+\\infty[' : '\\left]0\\,;\\,1\\right]';
  return {
    prompt: `La fonction $x \\mapsto \\dfrac{1}{x^{${tex(alpha)}}}$ est-elle intégrable (au sens de Lebesgue) sur $${domain}$ ?`,
    answer: fixedChoice(['Oui', 'Non'], ok ? 0 : 1),
    hint: 'Critère de Riemann : $\\frac{1}{x^\\alpha}$ est intégrable en $+\\infty$ si et seulement si $\\alpha > 1$, en $0$ si et seulement si $\\alpha < 1$.',
    correction: [`Ici $\\alpha = ${tex(alpha)} ${alpha.n > alpha.d ? '> 1' : '< 1'}$, donc la fonction ${ok ? 'est' : 'n’est pas'} intégrable sur $${domain}$.`],
  };
});

const tribu = skill('l3-tribu-engendree', 'Compter les éléments d’une tribu engendrée', (rng, level) => {
  if (level === 1) {
    const k = rng.int(2, 6);
    return {
      prompt: `$\\Omega$ est partagé en ${k} parties non vides et disjointes. Combien d’éléments a la tribu engendrée par cette partition ?`,
      answer: num(2 ** k),
      hint: 'Chaque élément de la tribu est une réunion de parties de la partition.',
      correction: [`On choisit librement quelles parties réunir : $2^{${k}} = ${2 ** k}$ éléments.`],
    };
  }
  const k = level === 2 ? 2 : rng.int(2, 3);
  const atoms = 2 ** k;
  return {
    prompt: `$A_1, \\dots, A_{${k}}$ sont des parties de $\\Omega$ « en position générale » (toutes les intersections $B_1 \\cap \\dots \\cap B_{${k}}$, avec $B_i = A_i$ ou son complémentaire, sont non vides). Combien d’éléments a la tribu engendrée par $A_1, \\dots, A_{${k}}$ ?`,
    answer: num(2 ** atoms),
    hint: 'Les atomes de la tribu sont les intersections $B_1 \\cap \\dots \\cap B_k$.',
    correction: [`Il y a $2^{${k}} = ${atoms}$ atomes.`, `La tribu compte $2^{${atoms}} = ${2 ** atoms}$ éléments.`],
  };
});

export const MESURE_SKILLS: Skill[] = [lebesgue, etagee, dominee, fubini, riemann, tribu];
