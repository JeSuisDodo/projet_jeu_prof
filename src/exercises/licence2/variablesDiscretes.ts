import { sumLatex } from '../latex';
import type { Frac } from '../fraction';
import type { Skill } from '../types';
import { F, add, choiceTex, div, fpow, mul, numF, par, skill, sub, sumF, tex } from './util';

/** Chapitre « Variables aléatoires discrètes » (L2). */

const PROBAS = [F(1, 2), F(1, 3), F(1, 4), F(2, 3), F(1, 5), F(2, 5), F(1, 6)];
const ptex = (p: Frac) => tex(p);
const paren = (p: Frac) => (p.d === 1 && p.n >= 0 ? tex(p) : `\\left(${tex(p)}\\right)`);

const geometrique = skill('l2-loi-geometrique', 'Utiliser la loi géométrique', (rng, level) => {
  const p = rng.pick(PROBAS);
  const q = sub(F(1), p);
  const k = rng.int(2, 4);
  const cases = [
    { ask: 'E(X)', v: div(F(1), p), why: `$E(X) = \\dfrac{1}{p} = ${tex(div(F(1), p))}$` },
    { ask: `P(X = ${k})`, v: mul(fpow(q, k - 1), p), why: `$P(X = ${k}) = (1 - p)^{${k - 1}}p = ${paren(q)}^{${k - 1}}\\times ${ptex(p)} = ${tex(mul(fpow(q, k - 1), p))}$` },
    { ask: `P(X > ${k})`, v: fpow(q, k), why: `$P(X > ${k}) = (1 - p)^{${k}} = ${paren(q)}^{${k}} = ${tex(fpow(q, k))}$ (les ${k} premiers essais sont des échecs).` },
    { ask: 'V(X)', v: div(q, mul(p, p)), why: `$V(X) = \\dfrac{1 - p}{p^2} = \\dfrac{${tex(q)}}{${tex(mul(p, p))}} = ${tex(div(q, mul(p, p)))}$` },
  ];
  const c = rng.pick(level === 1 ? cases.slice(0, 2) : cases);
  return {
    prompt: `$X$ suit la loi géométrique $\\mathcal{G}\\left(${ptex(p)}\\right)$ (rang du premier succès). Calcule $${c.ask}$.`,
    answer: numF(c.v),
    hint: '$P(X = k) = (1 - p)^{k-1}p$ pour $k \\geq 1$, $E(X) = \\frac{1}{p}$, $V(X) = \\frac{1 - p}{p^2}$.',
    correction: [c.why],
  };
});

const poisson = skill('l2-loi-poisson', 'Utiliser la loi de Poisson', (rng, level) => {
  const l = rng.pick([F(1), F(2), F(3), F(1, 2), F(3, 2), F(4)]);
  const a = rng.int(2, 4);
  const b = rng.nonZero(-3, 3);
  if (level === 1 && rng.next() < 0.5) {
    const k = rng.int(0, 3);
    const lam = tex(l);
    const fact = [1, 1, 2, 6][k];
    const correct = k === 0 ? `e^{-${lam}}` : `\\frac{${k === 1 ? lam : `\\left(${lam}\\right)^{${k}}`}}{${fact}}e^{-${lam}}`.replace('\\frac{' + lam + '}{1}', lam);
    return {
      prompt: `$X$ suit la loi de Poisson $\\mathcal{P}(${lam})$. Que vaut $P(X = ${k})$ ?`,
      answer: choiceTex(rng, correct, [`e^{${lam}}`, `1 - e^{-${lam}}`, `${lam}e^{-${lam}}`, `\\frac{e^{-${lam}}}{${k + 2}}`], () => `e^{-${k + 1}}`),
      hint: '$P(X = k) = e^{-\\lambda}\\dfrac{\\lambda^k}{k!}$',
      correction: [`$P(X = ${k}) = e^{-${lam}}\\dfrac{${paren(l)}^{${k}}}{${k}!} = ${correct}$`],
    };
  }
  const cases = [
    { ask: `E(${a}X ${b < 0 ? '-' : '+'} ${Math.abs(b)})`, v: add(mul(F(a), l), F(b)), why: `$E(X) = \\lambda = ${tex(l)}$, donc $E(${a}X ${b < 0 ? '-' : '+'} ${Math.abs(b)}) = ${a}\\times ${tex(l)} ${b < 0 ? '-' : '+'} ${Math.abs(b)}$` },
    { ask: `V(${a}X ${b < 0 ? '-' : '+'} ${Math.abs(b)})`, v: mul(F(a * a), l), why: `$V(X) = \\lambda = ${tex(l)}$, donc $V(${a}X ${b < 0 ? '-' : '+'} ${Math.abs(b)}) = ${a}^2\\times ${tex(l)}$` },
    { ask: 'E(X^2)', v: add(l, mul(l, l)), why: `$E(X^2) = V(X) + E(X)^2 = \\lambda + \\lambda^2 = ${sumF([l, mul(l, l)])}$` },
    { ask: 'E(X(X - 1))', v: mul(l, l), why: `$E(X(X - 1)) = \\lambda^2$ (on calcule $\\sum k(k - 1)e^{-\\lambda}\\frac{\\lambda^k}{k!}$).` },
  ];
  const c = rng.pick(level === 1 ? cases.slice(0, 2) : cases);
  return {
    prompt: `$X$ suit la loi de Poisson $\\mathcal{P}(${tex(l)})$. Calcule $${c.ask}$.`,
    answer: numF(c.v),
    hint: 'Pour $X \\sim \\mathcal{P}(\\lambda)$ : $E(X) = V(X) = \\lambda$.',
    correction: [c.why, `$= ${tex(c.v)}$`],
  };
});

const generatrice = skill('l2-fonction-generatrice', 'Exploiter une fonction génératrice', (rng, level) => {
  // G(t) = (a + bt + ct²)/s
  let a: number;
  let b: number;
  let c: number;
  do [a, b, c] = [rng.int(0, 4), rng.int(0, 4), rng.int(1, 4)];
  while (a + b + c < 2);
  const s = a + b + c;
  const G = `\\frac{${sumLatex([
    [a, ''],
    [b, 't'],
    [c, 't^2'],
  ])}}{${s}}`;
  const E = F(b + 2 * c, s);
  if (level === 1) {
    const k = rng.int(0, 2);
    return {
      prompt: `La fonction génératrice de $X$ est $G_X(t) = ${G}$. Calcule $P(X = ${k})$.`,
      answer: numF(F([a, b, c][k], s)),
      hint: '$G_X(t) = \\sum P(X = k)\\,t^k$ : $P(X = k)$ est le coefficient de $t^k$.',
      correction: [`Coefficient de $t^{${k}}$ : $${tex(F([a, b, c][k], s))}$`],
    };
  }
  if (level === 2)
    return {
      prompt: `La fonction génératrice de $X$ est $G_X(t) = ${G}$. Calcule $E(X)$.`,
      answer: numF(E),
      hint: '$E(X) = G_X\'(1)$',
      correction: [`$G_X'(t) = \\frac{${sumLatex([[b, ''], [2 * c, 't']])}}{${s}}$`, `$E(X) = G_X'(1) = ${tex(E)}$`],
    };
  // V(X) = G''(1) + G'(1) − G'(1)²
  const G2 = F(2 * c, s);
  const V = sub(add(G2, E), mul(E, E));
  return {
    prompt: `La fonction génératrice de $X$ est $G_X(t) = ${G}$. Calcule $V(X)$.`,
    answer: numF(V),
    hint: '$V(X) = G_X\'\'(1) + G_X\'(1) - G_X\'(1)^2$',
    correction: [`$G_X'(1) = ${tex(E)}$ et $G_X''(1) = ${tex(G2)}$`, `$V(X) = ${tex(G2)} + ${tex(E)} - \\left(${tex(E)}\\right)^2 = ${tex(V)}$`],
  };
});

const couple = skill('l2-couple-discret', 'Exploiter la loi d’un couple', (rng, level) => {
  // Table de (X, Y) à valeurs dans {0, 1}² en douzièmes.
  let cells: number[];
  do cells = [rng.int(1, 5), rng.int(1, 5), rng.int(1, 5)];
  while (cells[0] + cells[1] + cells[2] >= 12);
  cells.push(12 - cells[0] - cells[1] - cells[2]);
  const [p00, p01, p10, p11] = cells.map((c) => F(c, 12));
  const PX1 = add(p10, p11);
  const PY1 = add(p01, p11);
  const EXY = p11;
  const cov = sub(EXY, mul(PX1, PY1));
  const table = `\\begin{array}{c|cc} & Y = 0 & Y = 1 \\\\ \\hline X = 0 & ${tex(p00)} & ${tex(p01)} \\\\ X = 1 & ${tex(p10)} & ${tex(p11)}\\end{array}`;
  const cases = [
    { ask: 'P(X = 1)', v: PX1, why: `$P(X = 1) = ${tex(p10)} + ${tex(p11)} = ${tex(PX1)}$` },
    { ask: 'E(XY)', v: EXY, why: `$XY$ vaut 1 seulement si $X = Y = 1$ : $E(XY) = ${tex(p11)}$` },
    { ask: '\\mathrm{Cov}(X, Y)', v: cov, why: `$\\mathrm{Cov}(X, Y) = E(XY) - E(X)E(Y) = ${tex(EXY)} - ${tex(PX1)}\\times ${tex(PY1)} = ${tex(cov)}$` },
  ];
  const c = level === 1 ? cases[0] : level === 2 ? rng.pick(cases.slice(0, 2)) : cases[2];
  return {
    prompt: `La loi du couple $(X, Y)$ est donnée par le tableau $${table}$. Calcule $${c.ask}$.`,
    answer: numF(c.v),
    hint: 'Les lois marginales s’obtiennent en sommant les lignes (ou les colonnes) ; $\\mathrm{Cov}(X, Y) = E(XY) - E(X)E(Y)$.',
    correction: [c.why],
  };
});

const somme = skill('l2-somme-independantes', 'Sommer des variables indépendantes', (rng, level) => {
  const kind = rng.pick(level === 1 ? ['poisson', 'binomiale'] : ['poisson', 'binomiale', 'variance']);
  if (kind === 'poisson') {
    const [l, m] = [rng.int(1, 4), rng.int(1, 4)];
    return {
      prompt: `$X \\sim \\mathcal{P}(${l})$ et $Y \\sim \\mathcal{P}(${m})$ sont indépendantes. $X + Y$ suit une loi de Poisson : quel est son paramètre ?`,
      answer: numF(F(l + m)),
      hint: 'La somme de deux variables de Poisson indépendantes suit une loi de Poisson (les paramètres s’ajoutent) ; on le voit avec les fonctions génératrices.',
      correction: [`$G_{X+Y}(t) = e^{${l}(t - 1)}e^{${m}(t - 1)} = e^{${l + m}(t - 1)}$ : $X + Y \\sim \\mathcal{P}(${l + m})$.`],
    };
  }
  if (kind === 'binomiale') {
    const p = rng.pick(PROBAS);
    const [n, m] = [rng.int(2, 8), rng.int(2, 8)];
    const V = mul(F(n + m), mul(p, sub(F(1), p)));
    return {
      prompt: `$X \\sim \\mathcal{B}\\left(${n}, ${ptex(p)}\\right)$ et $Y \\sim \\mathcal{B}\\left(${m}, ${ptex(p)}\\right)$ sont indépendantes. Calcule $V(X + Y)$.`,
      answer: numF(V),
      hint: '$X + Y \\sim \\mathcal{B}(n + m, p)$, ou bien : la variance d’une somme de variables indépendantes est la somme des variances.',
      correction: [`$X + Y \\sim \\mathcal{B}\\left(${n + m}, ${ptex(p)}\\right)$`, `$V(X + Y) = ${n + m}\\times ${ptex(p)}\\times ${tex(sub(F(1), p))} = ${tex(V)}$`],
    };
  }
  const [vx, vy] = [rng.int(1, 6), rng.int(1, 6)];
  const [a, b] = [rng.nonZero(-3, 3), rng.nonZero(-3, 3)];
  const V = a * a * vx + b * b * vy;
  return {
    prompt: `$X$ et $Y$ sont indépendantes, avec $V(X) = ${vx}$ et $V(Y) = ${vy}$. Calcule $V(${sumLatex([
      [a, 'X'],
      [b, 'Y'],
    ])})$.`,
    answer: numF(F(V)),
    hint: 'Si $X$ et $Y$ sont indépendantes : $V(aX + bY) = a^2V(X) + b^2V(Y)$.',
    correction: [`$V = ${par(a)}^2\\times ${vx} + ${par(b)}^2\\times ${vy} = ${V}$`],
  };
});

export const VARIABLES_DISCRETES_SKILLS: Skill[] = [geometrique, poisson, generatrice, couple, somme];
