import type { Frac } from '../fraction';
import type { Skill } from '../types';
import { F, choiceTex, div, fixedChoice, fracSteps, numF, skill, sub, sumF, tex } from './util';

/** Chapitre « Statistique inférentielle » (Licence 3). */

const moments = skill('l3-moments-empiriques', 'Calculer une moyenne ou une variance empirique', (rng, level) => {
  const n = rng.int(4, level === 1 ? 6 : 5);
  const data = Array.from({ length: n }, () => rng.int(0, 12));
  const mean = F(data.reduce((s, x) => s + x, 0), n);
  if (level === 1) {
    return {
      prompt: `Calcule la moyenne empirique de l’échantillon $${data.join(' ;\\ ')}$.`,
      answer: numF(mean),
      hint: '$\\overline{x} = \\frac{1}{n}\\sum x_i$.',
      correction: [`$\\overline{x} = ${fracSteps(data.reduce((s, x) => s + x, 0), n)}$`],
    };
  }
  const ss = sumF(data.map((x) => { const d = sub(F(x), mean); return F(d.n * d.n, d.d * d.d); }));
  const corrected = level === 3;
  const value = div(ss, F(corrected ? n - 1 : n));
  return {
    prompt: `Calcule la variance empirique ${corrected ? 'corrigée (sans biais) $s^2 = \\frac{1}{n - 1}\\sum (x_i - \\overline{x})^2$' : '$\\frac{1}{n}\\sum (x_i - \\overline{x})^2$'} de l’échantillon $${data.join(' ;\\ ')}$.`,
    answer: numF(value),
    hint: 'Calcule d’abord la moyenne, puis la somme des carrés des écarts.',
    correction: [`$\\overline{x} = ${tex(mean)}$`, `$\\sum (x_i - \\overline{x})^2 = ${tex(ss)}$`, `Variance : $\\frac{${tex(ss)}}{${corrected ? n - 1 : n}} = ${tex(value)}$`],
  };
});

const ESTIMATEURS: [string, string, string[], string, number][] = [
  ['la variance $\\sigma^2$ d’un échantillon $X_1, \\dots, X_n$', '\\frac{1}{n - 1}\\sum (X_i - \\overline{X})^2', ['\\frac{1}{n}\\sum (X_i - \\overline{X})^2', '\\frac{1}{n + 1}\\sum (X_i - \\overline{X})^2', '\\sum (X_i - \\overline{X})^2'], 'Diviser par $n$ sous-estime la variance de $\\frac{n-1}{n}\\sigma^2$ en moyenne.', 1],
  ['l’espérance $m$ d’un échantillon $X_1, \\dots, X_n$', '\\overline{X}_n', ['\\frac{1}{n - 1}\\sum X_i', '\\max X_i', 'X_1^2'], '$E(\\overline{X}_n) = m$.', 1],
  ['$\\theta$ pour un échantillon de loi uniforme sur $[0, \\theta]$', '2\\overline{X}_n', ['\\overline{X}_n', '\\max X_i', '\\frac{\\overline{X}_n}{2}'], '$E(\\overline{X}_n) = \\frac{\\theta}{2}$, donc $E(2\\overline{X}_n) = \\theta$.', 2],
  ['$\\theta$ pour un échantillon de loi uniforme sur $[0, \\theta]$', '\\frac{n + 1}{n}\\max X_i', ['\\max X_i', '\\frac{n}{n + 1}\\max X_i', '\\overline{X}_n'], '$E(\\max X_i) = \\frac{n}{n + 1}\\theta$ : il faut corriger par $\\frac{n + 1}{n}$.', 3],
  ['$p$ pour un échantillon de loi de Bernoulli $\\mathcal{B}(p)$', '\\overline{X}_n', ['\\overline{X}_n^2', '1 - \\overline{X}_n', '\\frac{1}{\\overline{X}_n}'], '$E(\\overline{X}_n) = p$.', 1],
  ['$p^2$ pour un échantillon de loi de Bernoulli $\\mathcal{B}(p)$', '\\frac{n\\overline{X}_n^2 - \\overline{X}_n}{n - 1}', ['\\overline{X}_n^2', '\\overline{X}_n', '\\frac{n}{n - 1}\\overline{X}_n^2'], '$E(\\overline{X}_n^2) = p^2 + \\frac{p(1-p)}{n}$ : on corrige ce biais.', 3],
];

const biais = skill('l3-estimateur-sans-biais', 'Reconnaître un estimateur sans biais', (rng, level) => {
  const [target, correct, decoys, why] = rng.pick(ESTIMATEURS.filter(([, , , , l]) => l <= level));
  return {
    prompt: `Lequel de ces estimateurs de ${target} est sans biais ?`,
    answer: choiceTex(rng, correct, decoys, () => '0'),
    hint: 'Un estimateur $T$ de $\\theta$ est sans biais si $E(T) = \\theta$ pour toute valeur de $\\theta$.',
    correction: [why, `L’estimateur sans biais est $${correct}$.`],
  };
});

const vraisemblance = skill('l3-maximum-vraisemblance', 'Calculer un estimateur du maximum de vraisemblance', (rng, level) => {
  const n = rng.int(5, 8);
  if (level === 1) {
    const data = Array.from({ length: n }, () => (rng.next() < 0.5 ? 1 : 0));
    const k = data.reduce((s: number, x) => s + x, 0);
    return {
      prompt: `On observe l’échantillon de Bernoulli $${data.join(' ;\\ ')}$. Donne l’estimation de $p$ par maximum de vraisemblance.`,
      answer: numF(F(k, n)),
      hint: 'La vraisemblance $p^k(1-p)^{n-k}$ est maximale en $p = \\frac{k}{n}$.',
      correction: [`$k = ${k}$ succès sur $n = ${n}$.`, `$\\hat p = ${tex(F(k, n))}$`],
    };
  }
  const data = Array.from({ length: n }, () => rng.int(1, 6));
  const s = data.reduce((a, x) => a + x, 0);
  const isExp = level === 3;
  const value = isExp ? F(n, s) : F(s, n);
  return {
    prompt: `On observe l’échantillon $${data.join(' ;\\ ')}$ d’une loi ${isExp ? 'exponentielle $\\mathcal{E}(\\lambda)$' : 'de Poisson $\\mathcal{P}(\\lambda)$'}. Donne l’estimation de $\\lambda$ par maximum de vraisemblance.`,
    answer: numF(value),
    hint: isExp ? 'La log-vraisemblance $n\\ln\\lambda - \\lambda\\sum x_i$ s’annule en dérivée pour $\\lambda = \\frac{1}{\\overline{x}}$.' : 'La log-vraisemblance $\\sum x_i \\ln\\lambda - n\\lambda + C$ est maximale en $\\lambda = \\overline{x}$.',
    correction: [`$\\sum x_i = ${s}$ et $n = ${n}$.`, `$\\hat\\lambda = ${isExp ? fracSteps(n, s) : fracSteps(s, n)}$`],
  };
});

/** Écriture décimale française d'une fraction décimale : « 12{,}5 ». */
const decimal = (f: Frac) => String(Math.round((f.n / f.d) * 10000) / 10000).replace('.', '{,}');

/** (σ, n) avec √n entier, pour un intervalle de confiance décimal. */
const PLANS: [number, number][] = [
  [2, 16],
  [3, 36],
  [5, 25],
  [4, 64],
  [10, 100],
  [6, 144],
  [5, 100],
];

const intervalle = skill('l3-intervalle-confiance', 'Construire un intervalle de confiance', (rng, level) => {
  const [sigma, n] = rng.pick(PLANS);
  const xbar = F(rng.int(50, 200), level === 1 ? 1 : 10);
  const half = F(196 * sigma, 100 * Math.sqrt(n));
  const lower = rng.next() < 0.5;
  const value = lower ? sub(xbar, half) : F(xbar.n * half.d + half.n * xbar.d, xbar.d * half.d);
  return {
    prompt: `Sur un échantillon de taille $${n}$ d’une loi normale d’écart type connu $\\sigma = ${sigma}$, on mesure $\\overline{x} = ${decimal(xbar)}$. Donne la borne ${lower ? 'inférieure' : 'supérieure'} de l’intervalle de confiance à $95\\,\\%$ (avec $1{,}96$).`,
    answer: numF(value),
    hint: 'Intervalle : $\\left[\\overline{x} - 1{,}96\\frac{\\sigma}{\\sqrt n}\\,;\\,\\overline{x} + 1{,}96\\frac{\\sigma}{\\sqrt n}\\right]$.',
    correction: [`$1{,}96\\times\\frac{${sigma}}{\\sqrt{${n}}} = ${decimal(half)}$`, `Borne ${lower ? 'inférieure' : 'supérieure'} : $${decimal(value)}$`],
  };
});

const test = skill('l3-test-hypothese', 'Conclure un test d’hypothèse', (rng, level) => {
  const [sigma, n] = rng.pick(PLANS);
  const mu0 = rng.int(10, 50);
  const se = sigma / Math.sqrt(n);
  // z choisi loin de 1,96 pour éviter les cas limites.
  const z = rng.pick([-3, -2.5, -1.5, -1, -0.5, 0.5, 1, 1.5, 2.5, 3]);
  const xbar = mu0 + z * se;
  const reject = Math.abs(z) > 1.96;
  const fmt = (x: number) => String(Math.round(x * 1000) / 1000).replace('.', '{,}');
  const bilateral = level < 3;
  const rejectUni = z > 1.645;
  return {
    prompt: bilateral
      ? `On teste $H_0 : \\mu = ${mu0}$ contre $H_1 : \\mu \\neq ${mu0}$ au niveau $5\\,\\%$, avec $\\sigma = ${sigma}$ connu et $n = ${n}$. On observe $\\overline{x} = ${fmt(xbar)}$. Conclusion ?`
      : `On teste $H_0 : \\mu = ${mu0}$ contre $H_1 : \\mu > ${mu0}$ au niveau $5\\,\\%$ (seuil $1{,}645$), avec $\\sigma = ${sigma}$ connu et $n = ${n}$. On observe $\\overline{x} = ${fmt(xbar)}$. Conclusion ?`,
    answer: fixedChoice(['On rejette $H_0$', 'On ne rejette pas $H_0$'], (bilateral ? reject : rejectUni) ? 0 : 1),
    hint: 'Calcule $z = \\frac{\\overline{x} - \\mu_0}{\\sigma/\\sqrt n}$ et compare-le au seuil ($1{,}96$ en bilatéral).',
    correction: [`$z = \\frac{${fmt(xbar)} - ${mu0}}{${sigma}/${Math.sqrt(n)}} = ${fmt(z)}$`, bilateral ? (reject ? '$|z| > 1{,}96$ : on rejette $H_0$.' : '$|z| \\leq 1{,}96$ : on ne rejette pas $H_0$.') : rejectUni ? '$z > 1{,}645$ : on rejette $H_0$.' : '$z \\leq 1{,}645$ : on ne rejette pas $H_0$.'],
  };
});

export const STATISTIQUE_SKILLS: Skill[] = [moments, biais, vraisemblance, intervalle, test];
