import type { Skill } from '../types';
import { bound, choiceTex, gcd, num, par, poly, skill } from './util';

/** Chapitre « Calcul littéral » (4e) : réduire, substituer, développer, factoriser. */

const signed = (v: number) => (v < 0 ? `- ${Math.abs(v)}` : `+ ${v}`);
/** Terme en x entouré de parenthèses s'il est négatif : « 3x », « (-2x) ». */
const parX = (c: number) => (c < 0 ? `(${termX(c, true)})` : termX(c, true));

/** Terme « 3x », « -x », « + 5x » écrit à la suite. */
const termX = (c: number, first: boolean, v = 'x') => {
  const abs = Math.abs(c) === 1 ? '' : String(Math.abs(c));
  if (first) return `${c < 0 ? '-' : ''}${abs}${v}`;
  return `${c < 0 ? '-' : '+'} ${abs}${v}`;
};

const reduire = skill('4e-reduire', 'Réduire une expression', (rng, level) => {
  const m = bound(level, 9, 12, 15);
  const a = rng.nonZero(-m, m);
  const b = rng.nonZero(-m, m);
  const c = rng.nonZero(-m, m);
  const d = rng.nonZero(-m, m);
  if (level === 3) {
    // a x² + b x + c - (d x² - x + e)
    const e = rng.nonZero(-m, m);
    const expr = `${poly([a, b, c])} - (${poly([d, -1, e])})`;
    const res = [a - d, b + 1, c - e];
    return {
      prompt: `Réduis $A = ${expr}$.`,
      answer: choiceTex(rng, poly(res), [poly([a + d, b - 1, c + e]), poly([a - d, b - 1, c - e]), poly([a - d, b + 1, c + e])], () => poly([a - d + rng.nonZero(-2, 2), b + 1, c - e])),
      hint: 'Un signe « − » devant une parenthèse change le signe de chaque terme à l’intérieur.',
      correction: [`$A = ${poly([a, b, c])} ${termX(-d, false, 'x^2')} + x ${signed(-e)}$`, `$A = ${poly(res)}$`],
    };
  }
  const expr = `${termX(a, true)} ${signed(b)} ${termX(c, false)} ${signed(d)}`;
  const res = poly([a + c, b + d]);
  return {
    prompt: `Réduis $A = ${expr}$.`,
    answer: choiceTex(rng, res, [poly([a + c + b + d, 0]), poly([a + c, b - d]), poly([a - c, b + d]), poly([a * c, b + d])], () => poly([a + c + rng.nonZero(-3, 3), b + d])),
    hint: 'On regroupe les termes en $x$ entre eux et les nombres entre eux.',
    correction: [`Termes en $x$ : $${a} ${signed(c)} = ${a + c}$. Nombres : $${b} ${signed(d)} = ${b + d}$.`, `$A = ${res}$`],
  };
});

const substituer = skill('4e-substituer', 'Calculer une expression pour une valeur', (rng, level) => {
  const x = level === 1 ? rng.int(1, 6) : rng.nonZero(-5, 5);
  if (level === 1) {
    const a = rng.int(2, 9);
    const b = rng.nonZero(-9, 9);
    return {
      prompt: `Calcule $${poly([a, b])}$ pour $x = ${x}$.`,
      answer: num(a * x + b),
      hint: 'Remplace $x$ par sa valeur, en écrivant le signe $\\times$ qui était sous-entendu.',
      correction: [`$${a} \\times ${par(x)} ${signed(b)} = ${a * x} ${signed(b)} = ${a * x + b}$`],
    };
  }
  const a = rng.nonZero(-4, 4);
  const b = rng.nonZero(-6, 6);
  const c = rng.nonZero(-9, 9);
  const value = a * x * x + b * x + c;
  return {
    prompt: `Calcule $${poly([a, b, c])}$ pour $x = ${x}$.`,
    answer: num(value),
    hint: `Attention : $x^2 = ${par(x)}^2$ est toujours positif. Calcule le carré avant de multiplier.`,
    correction: [`$${a} \\times ${par(x)}^2 ${signed(b)} \\times ${par(x)} ${signed(c)} = ${a} \\times ${x * x} ${signed(b * x)} ${signed(c)} = ${value}$`],
  };
});

const developperSimple = skill('4e-developper-simple', 'Développer avec la simple distributivité', (rng, level) => {
  const k = rng.nonZero(-bound(level, 5, 9, 9), bound(level, 9, 9, 9));
  const k2 = Math.abs(k) === 1 ? 2 * k : k;
  const kk = level === 1 ? Math.abs(k2) : k2;
  const a = rng.nonZero(-6, 6);
  const b = rng.nonZero(-9, 9);
  const variable = level === 3 && rng.next() < 0.5;
  const factor = variable ? `${kk === 1 ? '' : kk === -1 ? '-' : kk}x` : String(kk);
  const pf = factor.startsWith('-') ? `(${factor})` : factor;
  const res = variable ? poly([kk * a, kk * b, 0]) : poly([kk * a, kk * b]);
  const decoy1 = variable ? poly([kk * a, b, 0]) : poly([kk * a, b]);
  const decoy2 = variable ? poly([kk * a, -kk * b, 0]) : poly([kk * a, -kk * b]);
  const decoy3 = variable ? poly([kk * a, kk * b]) : poly([a + kk, kk * b]);
  return {
    prompt: `Développe et réduis $${factor}(${poly([a, b])})$.`,
    answer: choiceTex(rng, res, [decoy1, decoy2, decoy3], () => poly([kk * a + rng.nonZero(-3, 3), kk * b])),
    hint: '$k(a + b) = k \\times a + k \\times b$ : le facteur multiplie chaque terme de la parenthèse.',
    correction: [`$${factor}(${poly([a, b])}) = ${factor} \\times ${parX(a)} + ${pf} \\times ${par(b)} = ${res}$`],
  };
});

const doubleDistributivite = skill('4e-double-distributivite', 'Développer avec la double distributivité', (rng, level) => {
  const m = bound(level, 6, 7, 9);
  const a = level === 1 ? 1 : rng.nonZero(-4, 4);
  const b = rng.nonZero(-m, m);
  const c = level === 1 ? 1 : rng.nonZero(-4, 4);
  const d = rng.nonZero(-m, m);
  const res = poly([a * c, a * d + b * c, b * d]);
  return {
    prompt: `Développe et réduis $(${poly([a, b])})(${poly([c, d])})$.`,
    answer: choiceTex(rng, res, [poly([a * c, b * d]), poly([a * c, a * d + b * c, -b * d]), poly([a * c, a * d - b * c, b * d]), poly([a + c, a * d + b * c, b * d])], () => poly([a * c, a * d + b * c + rng.nonZero(-3, 3), b * d])),
    hint: '$(a + b)(c + d) = ac + ad + bc + bd$ : chaque terme de la première parenthèse multiplie chaque terme de la seconde.',
    correction: [
      `$(${poly([a, b])})(${poly([c, d])}) = ${poly([a * c, 0, 0])} ${termX(a * d, false)} ${termX(b * c, false)} ${signed(b * d)}$`,
      `$= ${res}$`,
    ],
  };
});

const factoriser = skill('4e-factoriser', 'Factoriser par un facteur commun', (rng, level) => {
  const k = rng.int(2, bound(level, 6, 9, 9));
  let a = rng.nonZero(-7, 7);
  let b = rng.nonZero(-9, 9);
  const g = gcd(a, b);
  a /= g;
  b /= g;
  if (level === 3 && rng.next() < 0.5) {
    // k x² + m x = x (k x + m)
    const expr = poly([k * a, k * b, 0]);
    const res = `${k}x(${poly([a, b])})`;
    return {
      prompt: `Factorise au maximum $${expr}$.`,
      answer: choiceTex(rng, res, [`x(${poly([k * a, k * b])})`, `${k}(${poly([a, b, 0])})`, `${k}x(${poly([a, k * b])})`], () => `${k}x(${poly([a, b + rng.nonZero(-2, 2)])})`),
      hint: 'Cherche tout ce qui est commun aux deux termes : un nombre et une lettre.',
      correction: [`$${expr} = ${k}x \\times ${parX(a)} + ${k}x \\times ${par(b)} = ${res}$`],
    };
  }
  const expr = poly([k * a, k * b]);
  const res = `${k}(${poly([a, b])})`;
  return {
    prompt: `Factorise au maximum $${expr}$.`,
    answer: choiceTex(rng, res, [`${k}(${poly([k * a, b])})`, `${k}(${poly([a, k * b])})`, `${k * a}(x ${signed(b)})`], () => `${k}(${poly([a, b + rng.nonZero(-2, 2)])})`),
    hint: 'Cherche le plus grand nombre qui divise les deux coefficients.',
    correction: [`$${expr} = ${k} \\times ${parX(a)} + ${k} \\times ${par(b)} = ${res}$`],
  };
});

export const CALCUL_LITTERAL_SKILLS: Skill[] = [reduire, substituer, developperSimple, doubleDistributivite, factoriser];
