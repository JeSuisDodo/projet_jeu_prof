import type { Skill } from '../types';
import { fixedChoice, num, par, plus, poly, skill } from './util';

/** Chapitre « Continuité » : théorème des valeurs intermédiaires, dichotomie, suites u_{n+1} = f(u_n). */

const tvi = skill('tle-tvi-encadrement', 'Encadrer une solution avec le TVI', (rng, level) => {
  // f(x) = x³ + p x + q avec p > 0 : strictement croissante, une seule racine, non entière.
  for (;;) {
    const p = rng.int(1, level === 1 ? 3 : 6);
    const q = rng.int(-30, 30);
    const f = (x: number) => x ** 3 + p * x + q;
    let k = -10;
    while (f(k + 1) <= 0) k++;
    if (f(k) === 0 || f(k + 1) === 0) continue;
    return {
      prompt: `$f(x) = ${poly([1, 0, p, q])}$ est continue et strictement croissante sur $\\mathbb{R}$. L’équation $f(x) = 0$ a une unique solution $\\alpha$. Trouve l’entier $k$ tel que $k < \\alpha < k + 1$.`,
      answer: num(k),
      hint: 'Cherche deux entiers consécutifs où $f$ change de signe.',
      correction: [
        `$f(${k}) = ${f(k)} < 0$ et $f(${k + 1}) = ${f(k + 1)} > 0$.`,
        `$f$ est continue et strictement croissante : d’après le théorème des valeurs intermédiaires, $${k} < \\alpha < ${k + 1}$, donc $k = ${k}$.`,
      ],
    };
  }
});

const nbSolutions = skill('tle-tvi-tableau', 'Compter les solutions avec un tableau de variations', (rng) => {
  // f croissante de A à B sur [a, b], puis décroissante de B à C sur [b, c].
  const a = rng.int(-6, -2);
  const b = rng.int(-1, 2);
  const c = rng.int(3, 7);
  const B = rng.int(4, 9);
  const A = rng.int(-6, 2);
  const C = rng.int(-6, 2);
  const k = rng.pick([B + 1, B, rng.int(Math.max(A, C) + 1, B - 1), rng.int(Math.min(A, C), Math.max(A, C) - 1)].filter((v) => v !== A && v !== C));
  const count = (k > A && k < B ? 1 : 0) + (k < B && k > C ? 1 : 0) + (k === B ? 1 : 0);
  return {
    prompt: `$f$ est continue sur $[${a}\\,;\\,${c}]$, strictement croissante sur $[${a}\\,;\\,${b}]$ de $f(${a}) = ${A}$ à $f(${b}) = ${B}$, puis strictement décroissante sur $[${b}\\,;\\,${c}]$ jusqu’à $f(${c}) = ${C}$. Combien de solutions a l’équation $f(x) = ${k}$ ?`,
    answer: fixedChoice(['0', '1', '2', '3'], count),
    hint: 'Applique le théorème des valeurs intermédiaires sur chaque intervalle où $f$ est strictement monotone.',
    correction: [
      `Sur $[${a}\\,;\\,${b}]$, $f$ prend chaque valeur entre $${A}$ et $${B}$ une seule fois : ${k >= A && k <= B ? `$${k}$ est atteint une fois` : `$${k}$ n’est pas atteint`}.`,
      `Sur $[${b}\\,;\\,${c}]$, $f$ prend chaque valeur entre $${C}$ et $${B}$ une seule fois : ${k >= C && k < B ? `$${k}$ est atteint une fois` : k === B ? `$${k}$ n’est atteint qu’en $${b}$, déjà compté` : `$${k}$ n’est pas atteint`}.`,
      `Au total : $${count}$ solution${count > 1 ? 's' : ''}.`,
    ],
  };
});

const dichotomie = skill('tle-dichotomie', 'Faire une étape de dichotomie', (rng) => {
  const a = rng.int(0, 4);
  const b = a + rng.pick([1, 2]);
  const m = (a + b) / 2;
  const sign = rng.pick([-1, 1]);
  const fm = sign * rng.pick([0.3, 0.7, 1.2, 2.5]);
  const left = fm > 0; // f(a) < 0 < f(b) : si f(m) > 0, la racine est à gauche.
  const ms = String(m).replace('.', '{,}');
  const options = [`$[${a}\\,;\\,${ms}]$`, `$[${ms}\\,;\\,${b}]$`, `$[${a}\\,;\\,${b}]$`, 'On ne peut pas savoir'];
  return {
    prompt: `$f$ est continue, $f(${a}) < 0$ et $f(${b}) > 0$. On calcule $f(${ms}) = ${String(fm).replace('.', '{,}')}$. Dans quel intervalle la dichotomie poursuit-elle la recherche d’une solution de $f(x) = 0$ ?`,
    answer: fixedChoice(options, left ? 0 : 1),
    hint: 'On garde la moitié de l’intervalle aux bornes de laquelle $f$ change de signe.',
    correction: [
      left
        ? `$f(${a}) < 0 < f(${ms})$ : $f$ change de signe sur $[${a}\\,;\\,${ms}]$.`
        : `$f(${ms}) < 0 < f(${b})$ : $f$ change de signe sur $[${ms}\\,;\\,${b}]$.`,
      'Le théorème des valeurs intermédiaires garantit une solution dans cet intervalle.',
    ],
  };
});

const morceaux = skill('tle-continuite-morceaux', 'Rendre continue une fonction définie par morceaux', (rng, level) => {
  const k = rng.int(-3, 3);
  const a = rng.nonZero(-4, 4);
  const b = rng.int(-5, 5);
  const p = level === 1 ? 1 : rng.nonZero(-2, 2);
  const left = a * k + b;
  // À droite : p x² + m, continue en k si p k² + m = a k + b.
  const m = left - p * k * k;
  return {
    prompt: `$f(x) = ${poly([a, b])}$ si $x < ${k}$ et $f(x) = ${poly([p, 0, 0])} + m$ si $x \\geq ${k}$. Quelle valeur de $m$ rend $f$ continue en $${k}$ ?`,
    answer: num(m),
    hint: `Les deux expressions doivent donner la même valeur en $x = ${k}$.`,
    correction: [
      `À gauche : $\\lim_{x \\to ${k}^-} f(x) = ${a}\\times ${par(k)}${plus(b)} = ${left}$.`,
      `À droite : $f(${k}) = ${p}\\times ${par(k)}^2 + m = ${p * k * k} + m$.`,
      `Continuité : $${p * k * k} + m = ${left}$, donc $m = ${m}$.`,
    ],
  };
});

const pointFixe = skill('tle-suite-point-fixe', 'Limite d’une suite définie par une fonction continue', (rng, level) => {
  if (level === 1) {
    const m = rng.int(2, 9);
    return {
      prompt: `$u_0 = 1$ et $u_{n+1} = \\sqrt{${m}u_n}$. On admet que $(u_n)$ converge vers $\\ell > 0$. Calcule $\\ell$.`,
      answer: num(m),
      hint: '$f(x) = \\sqrt{' + m + 'x}$ est continue : la limite vérifie $\\ell = f(\\ell)$.',
      correction: [`$\\ell = \\sqrt{${m}\\ell}$ donc $\\ell^2 = ${m}\\ell$.`, `Comme $\\ell > 0$, $\\ell = ${m}$.`],
    };
  }
  // u_{n+1} = √(u_n + c) avec c = ℓ² - ℓ.
  const l = rng.int(2, 6);
  const c = l * l - l;
  return {
    prompt: `$u_0 = 0$ et $u_{n+1} = \\sqrt{u_n + ${c}}$. On admet que $(u_n)$ converge vers $\\ell \\geq 0$. Calcule $\\ell$.`,
    answer: num(l),
    hint: 'La fonction $x \\mapsto \\sqrt{x + c}$ est continue : $\\ell$ vérifie $\\ell = \\sqrt{\\ell + c}$.',
    correction: [
      `$\\ell = \\sqrt{\\ell + ${c}}$ donc $\\ell^2 - \\ell - ${c} = 0$.`,
      `$\\Delta = 1 + ${4 * c} = ${1 + 4 * c} = ${2 * l - 1}^2$ : $\\ell = ${l}$ ou $\\ell = ${1 - l}$.`,
      `Comme $\\ell \\geq 0$, $\\ell = ${l}$.`,
    ],
  };
});

export const CONTINUITE_SKILLS: Skill[] = [tvi, nbSolutions, dichotomie, morceaux, pointFixe];
