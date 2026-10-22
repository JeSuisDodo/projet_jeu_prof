import type { Skill } from '../types';
import { bound, fixedChoice, num, par, skill } from './util';

/** Chapitre « Nombres relatifs : multiplication et division » (4e). */

const times = (xs: number[]) => xs.map(par).join(' \\times ');

const produit = skill('4e-produit-relatifs', 'Multiplier des nombres relatifs', (rng, level) => {
  const count = bound(level, 2, 3, 4);
  const max = bound(level, 9, 6, 5);
  const xs = Array.from({ length: count }, () => {
    const v = rng.nonZero(-max, max);
    return Math.abs(v) === 1 ? 2 * v : v;
  });
  if (!xs.some((x) => x < 0)) xs[0] = -Math.abs(xs[0]);
  const value = xs.reduce((p, x) => p * x, 1);
  const negatives = xs.filter((x) => x < 0).length;
  return {
    prompt: `Calcule $${times(xs)}$.`,
    answer: num(value),
    hint: 'Compte les facteurs négatifs : un nombre pair de signes « − » donne un produit positif, un nombre impair un produit négatif.',
    correction: [
      `Il y a ${negatives} facteur${negatives > 1 ? 's' : ''} négatif${negatives > 1 ? 's' : ''} : le produit est ${negatives % 2 === 0 ? 'positif' : 'négatif'}.`,
      `$${times(xs)} = ${value}$`,
    ],
  };
});

const quotient = skill('4e-quotient-relatifs', 'Diviser des nombres relatifs', (rng, level) => {
  const b = rng.nonZero(-bound(level, 9, 12, 15), bound(level, 9, 12, 15));
  const q = rng.nonZero(-bound(level, 9, 12, 20), bound(level, 9, 12, 20));
  const a = b * q;
  const asFrac = level === 3 && rng.next() < 0.5;
  return {
    prompt: asFrac ? `Calcule $\\dfrac{${a}}{${b}}$.` : `Calcule $${par(a)} \\div ${par(b)}$.`,
    answer: num(q),
    hint: 'Même règle des signes que pour la multiplication : deux nombres de même signe donnent un quotient positif.',
    correction: [
      `${(a < 0) === (b < 0) ? 'Les deux nombres ont le même signe : le quotient est positif.' : 'Les deux nombres sont de signes contraires : le quotient est négatif.'}`,
      `$${Math.abs(a)} \\div ${Math.abs(b)} = ${Math.abs(q)}$, donc le résultat est $${q}$.`,
    ],
  };
});

const signe = skill('4e-signe-produit', 'Trouver le signe d’un produit', (rng, level) => {
  const count = bound(level, 4, 5, 7);
  const xs = Array.from({ length: count }, () => {
    const v = rng.nonZero(-19, 19) + (level === 3 ? rng.int(1, 9) / 10 : 0);
    return Math.round(v * 10) / 10 || 1;
  });
  const negatives = xs.filter((x) => x < 0).length;
  const positive = negatives % 2 === 0;
  return {
    prompt: `Sans le calculer, quel est le signe du produit $${times(xs)}$ ?`,
    answer: fixedChoice(['positif', 'négatif'], positive ? 0 : 1),
    hint: 'Seul le nombre de facteurs négatifs compte.',
    correction: [`Il y a ${negatives} facteur${negatives > 1 ? 's' : ''} négatif${negatives > 1 ? 's' : ''}, nombre ${negatives % 2 === 0 ? 'pair' : 'impair'} : le produit est ${positive ? 'positif' : 'négatif'}.`],
  };
});

const priorites = skill('4e-priorites-relatifs', 'Calculer avec les priorités', (rng, level) => {
  const m = bound(level, 6, 9, 12);
  const a = rng.nonZero(-m, m);
  const b = rng.nonZero(-m, m);
  const c = rng.nonZero(-m, m);
  const forms = [
    () => ({ expr: `${a} + ${par(b)} \\times ${par(c)}`, steps: [`${a} + ${par(b * c)}`], value: a + b * c }),
    () => ({ expr: `${a} - ${par(b)} \\times ${par(c)}`, steps: [`${a} - ${par(b * c)}`], value: a - b * c }),
    () => ({ expr: `(${a} - ${par(b)}) \\times ${par(c)}`, steps: [`${par(a - b)} \\times ${par(c)}`], value: (a - b) * c }),
  ];
  if (level >= 2) {
    const d = rng.nonZero(-6, 6);
    forms.push(() => ({
      expr: `${a} \\times ${par(b)} - ${par(c * d)} \\div ${par(d)}`,
      steps: [`${par(a * b)} - ${par(c)}`],
      value: a * b - c,
    }));
  }
  if (level === 3)
    forms.push(() => ({
      expr: `${par(a)} \\times (${b} + ${par(c)}) - ${par(a)}`,
      steps: [`${par(a)} \\times ${par(b + c)} - ${par(a)}`, `${par(a * (b + c))} - ${par(a)}`],
      value: a * (b + c) - a,
    }));
  const f = rng.pick(forms)();
  return {
    prompt: `Calcule $A = ${f.expr}$.`,
    answer: num(f.value),
    hint: 'D’abord les parenthèses, puis les multiplications et divisions, enfin les additions et soustractions.',
    correction: [`$A = ${[f.expr, ...f.steps, String(f.value)].join(' = ')}$`],
  };
});

export const RELATIFS_SKILLS: Skill[] = [produit, quotient, signe, priorites];
