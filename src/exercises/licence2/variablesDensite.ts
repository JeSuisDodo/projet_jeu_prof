import type { Skill } from '../types';
import { F, choiceTex, div, fpow, mul, numF, skill, sub, tex } from './util';

/** Chapitre « Variables aléatoires à densité » (L2). */

const xk = (k: number) => (k === 1 ? 'x' : `x^{${k}}`);

const constante = skill('l2-constante-densite', 'Normaliser une densité', (rng, level) => {
  const k = rng.int(1, level === 1 ? 2 : 4);
  const a = rng.int(1, level === 1 ? 2 : 3);
  // ∫₀^a c x^k dx = c a^{k+1}/(k+1) = 1
  const c = F(k + 1, a ** (k + 1));
  return {
    prompt: `$f(x) = c\\,${xk(k)}$ sur $[0\\,;\\,${a}]$ et $f = 0$ ailleurs. Pour quelle valeur de $c$ la fonction $f$ est-elle une densité de probabilité ?`,
    answer: numF(c),
    hint: 'Une densité est positive et d’intégrale 1 sur $\\mathbb{R}$.',
    correction: [`$\\displaystyle\\int_0^{${a}} c\\,${xk(k)}\\,dx = c\\,\\frac{${a}^{${k + 1}}}{${k + 1}} = 1$`, `$c = ${tex(c)}$`],
  };
});

const esperance = skill('l2-esperance-densite', 'Calculer une espérance à densité', (rng, level) => {
  if (level === 1 && rng.next() < 0.5) {
    const a = rng.int(-4, 2);
    const b = a + rng.int(1, 6);
    const v = F(a + b, 2);
    return {
      prompt: `$X$ suit la loi uniforme sur $[${a}\\,;\\,${b}]$. Calcule $E(X)$.`,
      answer: numF(v),
      hint: 'La densité vaut $\\frac{1}{b - a}$ sur $[a\\,;\\,b]$ ; l’espérance est le milieu.',
      correction: [`$E(X) = \\dfrac{${a} + ${b < 0 ? `(${b})` : b}}{2} = ${tex(v)}$`],
    };
  }
  const k = rng.int(1, level === 3 ? 4 : 2);
  const a = level === 1 ? 1 : rng.int(1, 3);
  // f(x) = (k+1) x^k / a^{k+1} sur [0, a] ; E(X) = (k+1)a/(k+2)
  const v = F((k + 1) * a, k + 2);
  const c = F(k + 1, a ** (k + 1));
  return {
    prompt: `$X$ a pour densité $f(x) = ${tex(c)}\\,${xk(k)}$ sur $[0\\,;\\,${a}]$ (et $0$ ailleurs). Calcule $E(X)$.`,
    answer: numF(v),
    hint: '$E(X) = \\displaystyle\\int x f(x)\\,dx$',
    correction: [`$E(X) = \\displaystyle\\int_0^{${a}} ${tex(c)}\\,x^{${k + 1}}\\,dx = ${tex(c)}\\times\\frac{${a}^{${k + 2}}}{${k + 2}} = ${tex(v)}$`],
  };
});

const usuelles = skill('l2-lois-usuelles-densite', 'Espérance et variance des lois uniforme et exponentielle', (rng, level) => {
  if (rng.next() < 0.5) {
    const a = rng.int(-3, 2);
    const b = a + rng.int(1, 6);
    const v = F((b - a) ** 2, 12);
    return {
      prompt: `$X$ suit la loi uniforme sur $[${a}\\,;\\,${b}]$. Calcule $V(X)$.`,
      answer: numF(v),
      hint: 'Pour la loi uniforme sur $[a\\,;\\,b]$ : $V(X) = \\dfrac{(b - a)^2}{12}$.',
      correction: [`$V(X) = \\dfrac{${b - a}^2}{12} = ${tex(v)}$`],
    };
  }
  const l = rng.pick([F(1), F(2), F(3), F(1, 2), F(1, 4), F(2, 3)]);
  const askV = level > 1 && rng.next() < 0.5;
  const v = askV ? div(F(1), mul(l, l)) : div(F(1), l);
  return {
    prompt: `$X$ suit la loi exponentielle de paramètre $\\lambda = ${tex(l)}$. Calcule $${askV ? 'V(X)' : 'E(X)'}$.`,
    answer: numF(v),
    hint: 'Pour $X \\sim \\mathcal{E}(\\lambda)$ : $E(X) = \\frac{1}{\\lambda}$ et $V(X) = \\frac{1}{\\lambda^2}$.',
    correction: [`$${askV ? 'V(X) = \\dfrac{1}{\\lambda^2}' : 'E(X) = \\dfrac{1}{\\lambda}'} = ${tex(v)}$`],
  };
});

const repartition = skill('l2-fonction-repartition', 'Utiliser la fonction de répartition', (rng, level) => {
  const k = rng.int(1, level === 1 ? 1 : 3);
  const a = rng.int(1, 3);
  const x0 = F(rng.int(1, 2 * a - 1), 2);
  // F(x) = (x/a)^{k+1} sur [0, a]
  const Fx = fpow(div(x0, F(a)), k + 1);
  const c = F(k + 1, a ** (k + 1));
  const between = level === 3;
  const value = between ? sub(F(1), Fx) : Fx;
  return {
    prompt: `$X$ a pour densité $f(x) = ${tex(c)}\\,${xk(k)}$ sur $[0\\,;\\,${a}]$ (et $0$ ailleurs). Calcule $P(X ${between ? '>' : '\\leq'} ${tex(x0)})$.`,
    answer: numF(value),
    hint: `Sur $[0\\,;\\,${a}]$, la fonction de répartition vaut $F(x) = \\displaystyle\\int_0^x f(t)\\,dt = \\left(\\frac{x}{${a}}\\right)^{${k + 1}}$.`,
    correction: [`$F(${tex(x0)}) = \\left(${tex(div(x0, F(a)))}\\right)^{${k + 1}} = ${tex(Fx)}$`, ...(between ? [`$P(X > ${tex(x0)}) = 1 - F(${tex(x0)}) = ${tex(value)}$`] : [])],
  };
});

const exponentielle = skill('l2-loi-exponentielle', 'Calculer avec la loi exponentielle', (rng, level) => {
  const l = rng.int(1, 3);
  const s = rng.int(1, 3);
  const t = rng.int(1, 4);
  const lt = (x: number) => (l * x === 1 ? 'e^{-1}' : `e^{-${l * x}}`);
  if (level === 3) {
    return {
      prompt: `$X$ suit la loi exponentielle de paramètre $${l}$. Que vaut $P(X > ${s + t} \\mid X > ${s})$ ?`,
      answer: choiceTex(rng, lt(t), [lt(s + t), lt(s), `1 - ${lt(t)}`, `\\frac{${t}}{${s + t}}`], () => lt(t + 1)),
      hint: 'La loi exponentielle est sans mémoire : $P(X > s + t \\mid X > s) = P(X > t)$.',
      correction: [`$\\dfrac{P(X > ${s + t})}{P(X > ${s})} = \\dfrac{${lt(s + t)}}{${lt(s)}} = ${lt(t)}$`],
    };
  }
  const above = level === 1 || rng.next() < 0.5;
  const correct = above ? lt(t) : `1 - ${lt(t)}`;
  return {
    prompt: `$X$ suit la loi exponentielle de paramètre $${l}$. Que vaut $P(X ${above ? '>' : '\\leq'} ${t})$ ?`,
    answer: choiceTex(rng, correct, [above ? `1 - ${lt(t)}` : lt(t), `e^{${l * t}}`, `${l + 1}${lt(t)}`, `e^{-${t}}`, `\\frac{1}{${l * t}}`], () => lt(t + 1)),
    hint: 'Pour $X \\sim \\mathcal{E}(\\lambda)$ et $t \\geq 0$ : $P(X > t) = e^{-\\lambda t}$.',
    correction: [`$P(X > ${t}) = e^{-${l}\\times ${t}} = ${lt(t)}$`, ...(above ? [] : [`$P(X \\leq ${t}) = 1 - ${lt(t)}$`])],
  };
});

export const VARIABLES_DENSITE_SKILLS: Skill[] = [constante, esperance, usuelles, repartition, exponentielle];
