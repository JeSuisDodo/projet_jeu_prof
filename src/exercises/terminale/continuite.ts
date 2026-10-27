import type { Skill } from '../types';
import { enrich, variant } from '../variantes';
import { F, fixedChoice, num, numF, par, plus, poly, skill, tex } from './util';

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

const VF = ['Vrai', 'Faux'];
const NB = ['0', '1', '2', '3'];
const decimal = (x: number) => String(x).replace('.', '{,}');

const tviVariantes = [
  variant('exponentielle', (rng) => {
    for (;;) {
      const q = rng.int(-25, 5);
      const g = (x: number) => Math.exp(x) + x + q;
      let k = -40;
      while (g(k + 1) <= 0) k++;
      if (Math.abs(g(k)) < 1e-9 || Math.abs(g(k + 1)) < 1e-9) continue;
      return {
        prompt: `$f(x) = e^x + x${plus(q)}$ est continue et strictement croissante sur $\\mathbb{R}$, et l’équation $f(x) = 0$ a une unique solution $\\alpha$. Trouve l’entier $k$ tel que $k < \\alpha < k + 1$.`,
        answer: num(k),
        hint: 'Calcule $f$ en quelques entiers et repère le changement de signe.',
        correction: [`$f(${k}) \\approx ${decimal(Number(g(k).toFixed(2)))} < 0$ et $f(${k + 1}) \\approx ${decimal(Number(g(k + 1).toFixed(2)))} > 0$ : $${k} < \\alpha < ${k + 1}$.`],
      };
    }
  }),
  variant('vrai-faux', (rng) => {
    const a = rng.int(-5, 2);
    const b = a + rng.int(1, 5);
    const fa = rng.nonZero(-9, 9);
    const fb = rng.next() < 0.5 ? -Math.sign(fa) * rng.int(1, 9) : Math.sign(fa) * rng.int(1, 9);
    const ok = fa * fb < 0;
    return {
      prompt: `$f$ est continue sur $[${a}\\,;\\,${b}]$, avec $f(${a}) = ${fa}$ et $f(${b}) = ${fb}$. Vrai ou faux : on peut affirmer que $f$ s’annule sur $[${a}\\,;\\,${b}]$.`,
      answer: fixedChoice(VF, ok ? 0 : 1),
      hint: 'Le théorème des valeurs intermédiaires s’applique si $0$ est entre $f(a)$ et $f(b)$.',
      correction: [ok ? `$0$ est entre $${fa}$ et $${fb}$ : d’après le TVI, $f$ s’annule. C’est vrai.` : `$${fa}$ et $${fb}$ sont de même signe : le TVI ne permet pas de conclure (f peut s’annuler ou non). C’est faux.`],
    };
  }),
];

const nbSolutionsVariantes = [
  variant('decroissante-croissante', (rng) => {
    const a = rng.int(-6, -2);
    const b = rng.int(-1, 2);
    const c = rng.int(3, 7);
    const B = rng.int(-9, -4);
    const A = rng.int(-2, 6);
    const C = rng.int(-2, 6);
    const k = rng.pick([B - 1, B, rng.int(B + 1, Math.min(A, C) - 1), rng.int(Math.min(A, C) + 1, Math.max(A, C) + 2)].filter((v) => v !== A && v !== C));
    const count = (k < A && k > B ? 1 : 0) + (k > B && k < C ? 1 : 0) + (k === B ? 1 : 0);
    return {
      prompt: `$f$ est continue sur $[${a}\\,;\\,${c}]$, strictement décroissante sur $[${a}\\,;\\,${b}]$ de $f(${a}) = ${A}$ à $f(${b}) = ${B}$, puis strictement croissante sur $[${b}\\,;\\,${c}]$ jusqu’à $f(${c}) = ${C}$. Combien de solutions a l’équation $f(x) = ${k}$ ?`,
      answer: fixedChoice(NB, count),
      hint: 'Applique le TVI sur chaque intervalle de stricte monotonie.',
      correction: [`Sur $[${a}\\,;\\,${b}]$ : ${k < A && k >= B ? 'une solution' : 'aucune'} ; sur $]${b}\\,;\\,${c}]$ : ${k > B && k <= C ? 'une solution' : 'aucune'}. Total : $${count}$.`],
    };
  }),
  variant('monotone', (rng) => {
    const a = rng.int(-6, 0);
    const b = a + rng.int(2, 8);
    const A = rng.int(-9, 3);
    const B = A + rng.int(2, 12);
    const k = rng.int(A - 4, B + 4);
    const croissante = rng.next() < 0.5;
    const [fa, fb] = croissante ? [A, B] : [B, A];
    const count = k >= A && k <= B ? 1 : 0;
    return {
      prompt: `$f$ est continue et strictement ${croissante ? 'croissante' : 'décroissante'} sur $[${a}\\,;\\,${b}]$, avec $f(${a}) = ${fa}$ et $f(${b}) = ${fb}$. Combien de solutions l’équation $f(x) = ${k}$ a-t-elle sur $[${a}\\,;\\,${b}]$ ?`,
      answer: fixedChoice(NB, count),
      hint: 'Une fonction continue strictement monotone prend une seule fois chaque valeur comprise entre $f(a)$ et $f(b)$.',
      correction: [count ? `$${k}$ est entre $${A}$ et $${B}$ : une unique solution (corollaire du TVI).` : `$${k}$ n'est pas entre $${A}$ et $${B}$ : aucune solution.`],
    };
  }),
];

const dichotomieVariantes = [
  variant('nombre-etapes', (rng) => {
    const L = rng.pick([1, 2, 4]);
    const p = rng.int(1, 4);
    let n = 0;
    while (L / 2 ** n >= 10 ** -p) n++;
    return {
      prompt: `On applique la dichotomie à un intervalle de longueur $${L}$. Combien d’étapes faut-il au minimum pour obtenir un intervalle de longueur strictement inférieure à $10^{-${p}}$ ?`,
      answer: num(n),
      hint: 'Chaque étape divise la longueur par $2$ : cherche le plus petit $n$ tel que $\\frac{L}{2^n} < 10^{-p}$.',
      correction: [`$\\frac{${L}}{2^{${n - 1}}} \\geq 10^{-${p}}$ mais $\\frac{${L}}{2^{${n}}} < 10^{-${p}}$ : il faut $${n}$ étapes.`],
    };
  }),
  variant('deux-etapes', (rng) => {
    const a = rng.int(0, 4);
    const b = a + 2;
    const m1 = a + 1;
    const s1 = rng.pick([-1, 1]);
    const [lo, hi] = s1 > 0 ? [a, m1] : [m1, b];
    const m2 = (lo + hi) / 2;
    const s2 = rng.pick([-1, 1]);
    const [lo2, hi2] = s2 > 0 ? [lo, m2] : [m2, hi];
    const fmt = (x: number) => decimal(x);
    const options = [`$[${fmt(lo2)}\\,;\\,${fmt(hi2)}]$`, `$[${fmt(s2 > 0 ? m2 : lo)}\\,;\\,${fmt(s2 > 0 ? hi : m2)}]$`, `$[${fmt(a)}\\,;\\,${fmt(m1)}]$`, `$[${fmt(m1)}\\,;\\,${fmt(b)}]$`];
    const shuffled = rng.shuffle([...new Set(options)]);
    return {
      prompt: `$f$ est continue, $f(${a}) < 0$ et $f(${b}) > 0$. On calcule $f(${m1}) ${s1 > 0 ? '>' : '<'} 0$, puis $f(${fmt(m2)}) ${s2 > 0 ? '>' : '<'} 0$. Dans quel intervalle se trouve alors une solution de $f(x) = 0$ ?`,
      answer: { kind: 'choice', options: shuffled, correct: shuffled.indexOf(options[0]) },
      hint: 'À chaque étape, garde la moitié où $f$ change de signe.',
      correction: [`Après la première étape : $[${fmt(lo)}\\,;\\,${fmt(hi)}]$ ; après la seconde : $[${fmt(lo2)}\\,;\\,${fmt(hi2)}]$.`],
    };
  }),
];

const morceauxVariantes = [
  variant('exponentielle', (rng) => {
    const k = rng.nonZero(-3, 3);
    const a = rng.nonZero(-4, 4);
    const b = rng.int(-6, 6);
    return {
      prompt: `$f(x) = e^{${k === 1 ? '' : k === -1 ? '-' : k}x} + m$ si $x < 0$ et $f(x) = ${poly([a, b])}$ si $x \\geq 0$. Quelle valeur de $m$ rend $f$ continue en $0$ ?`,
      answer: num(b - 1),
      hint: 'En $0$, $e^{kx}$ tend vers $e^0 = 1$.',
      correction: [`À gauche, $f(x) \\to 1 + m$ ; $f(0) = ${b}$.`, `$1 + m = ${b}$, donc $m = ${b - 1}$.`],
    };
  }),
  variant('vrai-faux', (rng) => {
    const k = rng.int(-3, 3);
    const a = rng.nonZero(-4, 4);
    const b = rng.int(-6, 6);
    const c = rng.nonZero(-4, 4);
    const ok = rng.next() < 0.5;
    const d = ok ? a * k + b - c * k : a * k + b - c * k + rng.nonZero(-3, 3);
    const vrai = a * k + b === c * k + d;
    return {
      prompt: `$f(x) = ${poly([a, b])}$ si $x < ${k}$ et $f(x) = ${poly([c, d])}$ si $x \\geq ${k}$. Vrai ou faux : $f$ est continue en $${k}$.`,
      answer: fixedChoice(VF, vrai ? 0 : 1),
      hint: `Compare la limite à gauche en $${k}$ et la valeur $f(${k})$.`,
      correction: [`À gauche : $${a * k + b}$ ; $f(${k}) = ${c * k + d}$. C’est ${vrai ? 'vrai' : 'faux'}.`],
    };
  }),
];

const pointFixeVariantes = [
  variant('homographique', (rng) => {
    // f(x) = (ax + b)/(x + 1) a pour points fixes ℓ et r ; |f'(ℓ)| = |r + 1|/(ℓ + 1) < 1 pour que la suite converge.
    const l = rng.int(2, 5);
    const r = -rng.int(1, Math.min(4, l));
    const a = l + r + 1;
    const b = -l * r;
    return {
      prompt: `$u_0 = 1$ et $u_{n+1} = \\frac{${poly([a, b], 'u_n')}}{u_n + 1}$. On admet que $(u_n)$ converge vers un réel $\\ell > 0$. Calcule $\\ell$.`,
      answer: num(l),
      hint: 'La fonction $x \\mapsto \\frac{ax + b}{x + 1}$ est continue sur $[0\\,;\\,+\\infty[$ : $\\ell = f(\\ell)$.',
      correction: [`$\\ell(\\ell + 1) = ${poly([a, b], '\\ell')}$, soit $${poly([1, 1 - a, -b], '\\ell')} = 0$.`, `Les solutions sont $${l}$ et $${r}$ ; comme $\\ell > 0$, $\\ell = ${l}$.`],
    };
  }),
  variant('moyenne', (rng) => {
    const c = rng.int(1, 9);
    const k = rng.pick([2, 3, 4]);
    const value = F(c, k - 1);
    return {
      prompt: `$u_0 = 0$ et $u_{n+1} = \\frac{u_n + ${c}}{${k}}$. On admet que $(u_n)$ converge vers $\\ell$. Calcule $\\ell$ (fraction).`,
      answer: numF(value),
      hint: 'Passe à la limite : $\\ell = \\frac{\\ell + c}{k}$.',
      correction: [`$${k}\\ell = \\ell + ${c}$, donc $\\ell = ${tex(value)}$.`],
    };
  }),
];

export const CONTINUITE_SKILLS: Skill[] = [
  enrich(tvi, tviVariantes),
  enrich(nbSolutions, nbSolutionsVariantes),
  enrich(dichotomie, dichotomieVariantes),
  enrich(morceaux, morceauxVariantes),
  enrich(pointFixe, pointFixeVariantes),
];
