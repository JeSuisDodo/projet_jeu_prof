import type { Skill } from '../types';
import { F, add, binom, div, fpow, mul, numF, skill, sub, tex } from './util';
import { enrichir } from '../licenceVariantes';
import { PROBABILITES_VARIANTES } from './variantes/probabilites';

/** Chapitre « Probabilités sur un univers fini » (Licence 1). */

const tirages = skill('l1-proba-denombrement', 'Calculer une probabilité par dénombrement', (rng, level) => {
  const r = rng.int(3, 7);
  const b = rng.int(3, 7);
  const k = level === 1 ? 2 : 3;
  const j = rng.int(level === 1 ? 0 : 1, k);
  const p = F(binom(r, j) * binom(b, k - j), binom(r + b, k));
  return {
    prompt: `Une urne contient $${r}$ boules rouges et $${b}$ boules bleues. On tire simultanément $${k}$ boules. Quelle est la probabilité d’obtenir exactement $${j}$ boule${j > 1 ? 's' : ''} rouge${j > 1 ? 's' : ''} ?`,
    answer: numF(p),
    hint: 'Équiprobabilité : nombre de tirages favorables divisé par $\\binom{N}{k}$.',
    correction: [`$\\dfrac{\\binom{${r}}{${j}}\\binom{${b}}{${k - j}}}{\\binom{${r + b}}{${k}}} = \\dfrac{${binom(r, j) * binom(b, k - j)}}{${binom(r + b, k)}} = ${tex(p)}$`],
  };
});

const pct = (n: number) => F(n, 100);

const bayes = skill('l1-proba-bayes', 'Utiliser les probabilités totales et la formule de Bayes', (rng, level) => {
  const pA = pct(rng.pick([10, 20, 25, 30, 40, 50, 60]));
  const pBA = pct(rng.pick([50, 60, 70, 80, 90]));
  const pBnA = pct(rng.pick([5, 10, 20, 30, 40]));
  const pB = add(mul(pA, pBA), mul(sub(F(1), pA), pBnA));
  const story = `Une machine produit des pièces : $${tex(pA)}$ d’entre elles viennent de l’atelier $A$, les autres de l’atelier $\\bar A$. Une pièce de $A$ est conforme avec probabilité $${tex(pBA)}$, une pièce de $\\bar A$ avec probabilité $${tex(pBnA)}$. On note $B$ l’événement « la pièce est conforme ».`;
  if (level === 1)
    return {
      prompt: `${story} Quelle est la probabilité qu’une pièce prise au hasard soit conforme ?`,
      answer: numF(pB),
      hint: 'Formule des probabilités totales : $P(B) = P(A)P_A(B) + P(\\bar A)P_{\\bar A}(B)$.',
      correction: [`$P(B) = ${tex(pA)}\\times${tex(pBA)} + ${tex(sub(F(1), pA))}\\times${tex(pBnA)} = ${tex(pB)}$`],
    };
  const post = div(mul(pA, pBA), pB);
  if (level === 2)
    return {
      prompt: `${story} Une pièce est conforme. Quelle est la probabilité qu’elle vienne de l’atelier $A$ ?`,
      answer: numF(post),
      hint: 'Formule de Bayes : $P_B(A) = \\dfrac{P(A)P_A(B)}{P(B)}$.',
      correction: [`$P(B) = ${tex(pB)}$`, `$P_B(A) = \\dfrac{${tex(mul(pA, pBA))}}{${tex(pB)}} = ${tex(post)}$`],
    };
  const pnB = sub(F(1), pB);
  const postN = div(mul(pA, sub(F(1), pBA)), pnB);
  return {
    prompt: `${story} Une pièce n’est pas conforme. Quelle est la probabilité qu’elle vienne de l’atelier $A$ ?`,
    answer: numF(postN),
    hint: 'Bayes avec l’événement contraire : $P_{\\bar B}(A) = \\dfrac{P(A)P_A(\\bar B)}{P(\\bar B)}$.',
    correction: [`$P(\\bar B) = 1 - ${tex(pB)} = ${tex(pnB)}$`, `$P_{\\bar B}(A) = \\dfrac{${tex(pA)}\\times${tex(sub(F(1), pBA))}}{${tex(pnB)}} = ${tex(postN)}$`],
  };
});

const independance = skill('l1-proba-independance', 'Utiliser l’indépendance', (rng, level) => {
  const pA = F(rng.int(1, 4), rng.pick([5, 6]));
  const pB = F(rng.int(1, 3), rng.pick([4, 5]));
  const inter = mul(pA, pB);
  const union = sub(add(pA, pB), inter);
  if (level === 1)
    return {
      prompt: `$A$ et $B$ sont indépendants, $P(A) = ${tex(pA)}$ et $P(B) = ${tex(pB)}$. Calcule $P(A \\cap B)$.`,
      answer: numF(inter),
      hint: 'Indépendance : $P(A\\cap B) = P(A)P(B)$.',
      correction: [`$${tex(pA)}\\times${tex(pB)} = ${tex(inter)}$`],
    };
  if (level === 2)
    return {
      prompt: `$A$ et $B$ sont indépendants, $P(A) = ${tex(pA)}$ et $P(B) = ${tex(pB)}$. Calcule $P(A \\cup B)$.`,
      answer: numF(union),
      hint: '$P(A\\cup B) = P(A) + P(B) - P(A\\cap B)$, et $P(A\\cap B) = P(A)P(B)$.',
      correction: [`$${tex(pA)} + ${tex(pB)} - ${tex(inter)} = ${tex(union)}$`],
    };
  // n épreuves indépendantes : P(au moins un succès) = 1 − (1 − p)^n.
  const p = F(1, rng.int(2, 6));
  const n = rng.int(2, 4);
  const v = sub(F(1), fpow(sub(F(1), p), n));
  return {
    prompt: `On lance $${n}$ fois de façon indépendante une épreuve qui réussit avec probabilité $${tex(p)}$. Quelle est la probabilité d’au moins une réussite ?`,
    answer: numF(v),
    hint: 'Passe par l’événement contraire : aucune réussite.',
    correction: [`$1 - \\left(${tex(sub(F(1), p))}\\right)^{${n}} = ${tex(v)}$`],
  };
});

const esperance = skill('l1-esperance-variance', 'Calculer une espérance ou une variance', (rng, level) => {
  const values = rng.shuffle([-2, -1, 0, 1, 2, 3, 4, 5]).slice(0, 3).sort((a, b) => a - b);
  const weights = [rng.int(1, 4), rng.int(1, 4), rng.int(1, 4)];
  const total = weights.reduce((s, w) => s + w, 0);
  const probs = weights.map((w) => F(w, total));
  const E = probs.reduce((s, p, i) => add(s, mul(p, F(values[i]))), F(0));
  const E2 = probs.reduce((s, p, i) => add(s, mul(p, F(values[i] ** 2))), F(0));
  const V = sub(E2, mul(E, E));
  const table = `\\begin{array}{c|ccc} k & ${values.join(' & ')} \\\\ \\hline P(X = k) & ${probs.map(tex).join(' & ')} \\end{array}`;
  const askVar = level === 3;
  if (level === 2) {
    const a = rng.nonZero(-3, 3);
    const b = rng.int(-5, 5);
    const v = add(mul(F(a), E), F(b));
    return {
      prompt: `$X$ suit la loi $${table}$. Calcule $E(${a === 1 ? '' : a === -1 ? '-' : a}X ${b < 0 ? '-' : '+'} ${Math.abs(b)})$.`,
      answer: numF(v),
      hint: 'Linéarité : $E(aX + b) = aE(X) + b$.',
      correction: [`$E(X) = ${tex(E)}$`, `$E(${a === 1 ? '' : a === -1 ? '-' : a}X ${b < 0 ? '-' : '+'} ${Math.abs(b)}) = ${a}\\times ${E.n < 0 ? `\\left(${tex(E)}\\right)` : tex(E)} + ${b < 0 ? `(${b})` : b} = ${tex(v)}$`],
    };
  }
  return {
    prompt: `$X$ suit la loi $${table}$. Calcule ${askVar ? '$V(X)$' : '$E(X)$'}.`,
    answer: numF(askVar ? V : E),
    hint: askVar ? 'Formule de König-Huygens : $V(X) = E(X^2) - E(X)^2$.' : '$E(X) = \\sum_k k\\,P(X = k)$.',
    correction: askVar ? [`$E(X) = ${tex(E)}$ et $E(X^2) = ${tex(E2)}$`, `$V(X) = ${tex(E2)} - \\left(${tex(E)}\\right)^2 = ${tex(V)}$`] : [`$E(X) = ${values.map((v, i) => `${v < 0 ? `(${v})` : v}\\times${tex(probs[i])}`).join(' + ')} = ${tex(E)}$`],
  };
});

const binomiale = skill('l1-loi-binomiale', 'Utiliser la loi binomiale', (rng, level) => {
  const n = rng.int(3, level === 1 ? 5 : 8);
  const p = level === 1 ? F(1, 2) : F(1, rng.int(3, 6));
  const k = rng.int(0, n);
  const value = mul(F(binom(n, k)), mul(fpow(p, k), fpow(sub(F(1), p), n - k)));
  if (level === 3 && rng.next() < 0.5)
    return {
      prompt: `$X$ suit la loi binomiale $\\mathcal{B}\\left(${n}, ${tex(p)}\\right)$. Calcule $V(X)$.`,
      answer: numF(mul(F(n), mul(p, sub(F(1), p)))),
      hint: 'Pour $\\mathcal{B}(n, p)$ : $E(X) = np$ et $V(X) = np(1-p)$.',
      correction: [`$V(X) = ${n}\\times${tex(p)}\\times${tex(sub(F(1), p))} = ${tex(mul(F(n), mul(p, sub(F(1), p))))}$`],
    };
  return {
    prompt: `$X$ suit la loi binomiale $\\mathcal{B}\\left(${n}, ${tex(p)}\\right)$. Calcule $P(X = ${k})$.`,
    answer: numF(value),
    hint: '$P(X = k) = \\binom{n}{k}p^k(1-p)^{n-k}$.',
    correction: [`$\\binom{${n}}{${k}}\\left(${tex(p)}\\right)^{${k}}\\left(${tex(sub(F(1), p))}\\right)^{${n - k}} = ${tex(value)}$`],
  };
});

export const PROBABILITES_SKILLS: Skill[] = enrichir([tirages, independance, esperance, bayes, binomiale], PROBABILITES_VARIANTES);
