import { sumLatex } from '../latex';
import type { Skill } from '../types';
import { F, add, det2, mat, mul, num, numF, skill, sub, sumF, tex } from './util';

/** Chapitre « Intégrales doubles » (L2). */

/** ∫_a^b t^k dt */
const intPow = (k: number, a: number, b: number) => sub(F(b ** (k + 1), k + 1), F(a ** (k + 1), k + 1));
const pw = (v: string, k: number) => (k === 0 ? '' : k === 1 ? v : `${v}^{${k}}`);

const rectangle = skill('l2-double-rectangle', 'Intégrer sur un rectangle (Fubini)', (rng, level) => {
  const p = rng.int(level === 1 ? 0 : 1, 2);
  const q = rng.int(1, level === 3 ? 3 : 2);
  const [a, b] = [0, rng.int(1, 3)];
  const [c, d] = level === 1 ? [0, rng.int(1, 2)] : [rng.int(-1, 0), rng.int(1, 2)];
  const Ix = intPow(p, a, b);
  const Iy = intPow(q, c, d);
  const v = mul(Ix, Iy);
  const integrand = `${pw('x', p)}${pw('y', q)}` || '1';
  return {
    prompt: `Calcule $\\displaystyle\\iint_D ${integrand}\\,dx\\,dy$ avec $D = [${a}\\,;\\,${b}]\\times[${c}\\,;\\,${d}]$.`,
    answer: numF(v),
    hint: 'Fubini : sur un rectangle, $\\iint g(x)h(y)\\,dx\\,dy = \\int g(x)\\,dx\\times\\int h(y)\\,dy$.',
    correction: [
      `$\\displaystyle\\int_{${a}}^{${b}} ${pw('x', p) || '1'}\\,dx = ${tex(Ix)}$ et $\\displaystyle\\int_{${c}}^{${d}} ${pw('y', q)}\\,dy = ${tex(Iy)}$`,
      `Produit : $${tex(Ix)}\\times ${tex(Iy).startsWith('-') ? `\\left(${tex(Iy)}\\right)` : tex(Iy)} = ${tex(v)}$`,
    ],
  };
});

const carre = skill('l2-double-polynome', 'Intégrer un polynôme sur le carré unité', (rng, level) => {
  const [a, b, c] = [rng.int(-4, 4), rng.int(-4, 4), level === 1 ? 0 : rng.nonZero(-4, 4)];
  const k = rng.int(-3, 3);
  // ∫∫_{[0,1]²} (ax + by + cxy + k) = a/2 + b/2 + c/4 + k
  const terms = [F(a, 2), F(b, 2), F(c, 4), F(k)];
  const v = terms.reduce(add, F(0));
  return {
    prompt: `Calcule $\\displaystyle\\iint_{[0,1]^2} (${sumLatex([
      [a, 'x'],
      [b, 'y'],
      [c, 'xy'],
      [k, ''],
    ])})\\,dx\\,dy$.`,
    answer: numF(v),
    hint: 'Par linéarité : $\\iint x = \\iint y = \\frac{1}{2}$, $\\iint xy = \\frac{1}{4}$ et $\\iint 1 = 1$ sur $[0,1]^2$.',
    correction: [`$${sumF(terms)} = ${tex(v)}$`],
  };
});

const triangle = skill('l2-double-triangle', 'Intégrer sur un triangle', (rng, level) => {
  const a = rng.int(1, level === 1 ? 2 : 3);
  const kinds = [
    { g: '1', v: F(a * a, 2), why: `C’est l’aire du triangle : $\\frac{${a}^2}{2}$.` },
    { g: 'x', v: F(a ** 3, 6), why: `$\\displaystyle\\int_0^{${a}} x(${a} - x)\\,dx = \\frac{${a}^3}{6}$` },
    { g: 'y', v: F(a ** 3, 6), why: `Par symétrie, comme pour $x$ : $\\frac{${a}^3}{6}$.` },
    { g: 'xy', v: F(a ** 4, 24), why: `$\\displaystyle\\int_0^{${a}} x\\frac{(${a} - x)^2}{2}\\,dx = \\frac{${a}^4}{24}$` },
  ];
  const k = rng.pick(level === 1 ? kinds.slice(0, 2) : kinds);
  return {
    prompt: `$T = \\{(x, y) : x \\geq 0,\\ y \\geq 0,\\ x + y \\leq ${a}\\}$. Calcule $\\displaystyle\\iint_T ${k.g}\\,dx\\,dy$.`,
    answer: numF(k.v),
    hint: `Intègre d’abord en $y$ de $0$ à $${a} - x$, puis en $x$ de $0$ à $${a}$.`,
    correction: [k.why, `$= ${tex(k.v)}$`],
  };
});

const polaire = skill('l2-coordonnees-polaires', 'Passer en coordonnées polaires', (rng, level) => {
  const R = rng.int(1, 3);
  if (level === 1) {
    // ∬_{disque} (x² + y²) = πR⁴/2
    const v = F(R ** 4, 2);
    return {
      prompt: `$D$ est le disque de centre $O$ et de rayon $${R}$. On a $\\displaystyle\\iint_D (x^2 + y^2)\\,dx\\,dy = k\\pi$ : donne $k$.`,
      answer: numF(v),
      hint: 'En polaires : $dx\\,dy = r\\,dr\\,d\\theta$ et $x^2 + y^2 = r^2$.',
      correction: [`$\\displaystyle\\int_0^{2\\pi}\\int_0^{${R}} r^2\\,r\\,dr\\,d\\theta = 2\\pi\\times\\frac{${R}^4}{4} = ${tex(v)}\\pi$`],
    };
  }
  const R1 = rng.int(1, 2);
  const R2 = R1 + rng.int(1, 2);
  const m = rng.int(0, level === 3 ? 2 : 1);
  // ∬_{R1 ≤ r ≤ R2} (x² + y²)^m = 2π (R2^{2m+2} − R1^{2m+2}) / (2m + 2)
  const v = F(R2 ** (2 * m + 2) - R1 ** (2 * m + 2), m + 1);
  const g = m === 0 ? '1' : m === 1 ? '(x^2 + y^2)' : `(x^2 + y^2)^{${m}}`;
  return {
    prompt: `$C = \\{(x, y) : ${R1 * R1} \\leq x^2 + y^2 \\leq ${R2 * R2}\\}$. On a $\\displaystyle\\iint_C ${g}\\,dx\\,dy = k\\pi$ : donne $k$.`,
    answer: numF(v),
    hint: 'En polaires, la couronne devient $' + `${R1} \\leq r \\leq ${R2}` + '$, $0 \\leq \\theta \\leq 2\\pi$, et $dx\\,dy = r\\,dr\\,d\\theta$.',
    correction: [`$\\displaystyle 2\\pi\\int_{${R1}}^{${R2}} r^{${2 * m + 1}}\\,dr = 2\\pi\\,\\frac{${R2}^{${2 * m + 2}} - ${R1}^{${2 * m + 2}}}{${2 * m + 2}} = ${tex(v)}\\pi$`],
  };
});

const jacobien = skill('l2-jacobien', 'Changer de variables avec le jacobien', (rng, level) => {
  let M: number[][];
  do M = [
    [rng.int(-3, 3), rng.int(-3, 3)],
    [rng.int(-3, 3), rng.int(-3, 3)],
  ];
  while (det2(M) === 0);
  const J = det2(M);
  if (level === 1)
    return {
      prompt: `Calcule le jacobien de $\\varphi(u, v) = (${sumLatex([[M[0][0], 'u'], [M[0][1], 'v']])},\\ ${sumLatex([[M[1][0], 'u'], [M[1][1], 'v']])})$.`,
      answer: num(J),
      hint: 'Le jacobien est le déterminant de la matrice des dérivées partielles.',
      correction: [`$J_\\varphi = \\det${mat(M)} = ${J}$`],
    };
  const s = rng.int(1, 3);
  // Aire de φ([0, s]²) = |J| s²
  const v = F(Math.abs(J) * s * s);
  return {
    prompt: `$\\varphi(u, v) = (${sumLatex([[M[0][0], 'u'], [M[0][1], 'v']])},\\ ${sumLatex([[M[1][0], 'u'], [M[1][1], 'v']])})$. Quelle est l’aire de l’image $\\varphi([0, ${s}]^2)$ ?`,
    answer: numF(v),
    hint: 'Aire de $\\varphi(\\Delta) = \\displaystyle\\iint_\\Delta |J_\\varphi(u, v)|\\,du\\,dv$.',
    correction: [`$J_\\varphi = ${J}$`, `Aire $= |${J}|\\times ${s}^2 = ${tex(v)}$`],
  };
});

export const INTEGRALES_DOUBLES_SKILLS: Skill[] = [rectangle, carre, triangle, polaire, jacobien];
