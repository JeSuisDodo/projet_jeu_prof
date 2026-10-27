import { frac, fracLatex } from '../fraction';
import type { Skill } from '../types';
import { enrich, variant } from '../variantes';
import { dec, fixedChoice, fracInterval, interval, latexChoice, par } from './outils';

/** Chapitre 8 de 2nde : fonctions de référence (carré, inverse, racine carrée, cube). */

const carreEquation: Skill = {
  id: '2nde-carre-equation',
  name: 'Résoudre x² = k',
  generate(rng, level) {
    const r = rng.int(level === 1 ? 1 : 0, level === 3 ? 15 : 10);
    const negative = level > 1 && rng.next() < 0.25;
    const k = negative ? -rng.int(1, 30) : r * r;
    const values = k < 0 ? [] : k === 0 ? [frac(0)] : [frac(-r), frac(r)];
    return {
      skill: '2nde-carre-equation',
      level,
      prompt: `Résous dans $\\mathbb{R}$ l'équation $x^2 = ${k}$.`,
      answer: { kind: 'set', values },
      hint: 'Un carré est toujours positif ; si $k > 0$, l’équation $x^2 = k$ a deux solutions opposées.',
      correction:
        k < 0
          ? ["Un carré n'est jamais négatif : $S = \\varnothing$."]
          : k === 0
            ? ['$x^2 = 0$ seulement pour $x = 0$.']
            : [`$x^2 = ${k}$ équivaut à $x = \\sqrt{${k}}$ ou $x = -\\sqrt{${k}}$.`, `$S = \\{-${r}\\,;\\,${r}\\}$`],
    };
  },
};

const carreInequation: Skill = {
  id: '2nde-carre-inequation',
  name: 'Résoudre x² < k ou x² > k',
  generate(rng, level) {
    const r = rng.int(1, level === 1 ? 5 : 10);
    const k = r * r;
    const op = rng.pick(level === 1 ? (['<', '>'] as const) : (['<', '>', '\\leq', '\\geq'] as const));
    const closed = op === '\\leq' || op === '\\geq';
    const below = op === '<' || op === '\\leq';
    const inside = interval(-r, closed, r, closed);
    const outside = `${interval(null, false, -r, closed)} \\cup ${interval(r, closed, null, false)}`;
    const correct = below ? inside : outside;
    return {
      skill: '2nde-carre-inequation',
      level,
      prompt: `Résous dans $\\mathbb{R}$ l'inéquation $x^2 ${op} ${k}$.`,
      answer: latexChoice(
        rng,
        correct,
        [below ? outside : inside, interval(null, false, r, closed), interval(r, closed, null, false), interval(-k, closed, k, closed)],
        () => interval(0, closed, r, closed),
      ),
      hint: `Sur la courbe de la fonction carré, repère les points d'ordonnée $${k}$ : ils ont pour abscisses $-${r}$ et $${r}$.`,
      correction: [
        `$x^2 = ${k}$ pour $x = -${r}$ ou $x = ${r}$.`,
        below ? `La parabole est sous la droite $y = ${k}$ entre ces deux valeurs.` : `La parabole est au-dessus de la droite $y = ${k}$ à l'extérieur de ces deux valeurs.`,
        `$S = ${correct}$`,
      ],
    };
  },
};

interface RefFn {
  name: string;
  latex: (v: string) => string;
  apply: (v: number) => number;
  /** Intervalles où la fonction est monotone : on tire a et b dans le même. */
  domains: { lo: number; hi: number; increasing: boolean; label: string }[];
}

const REF: RefFn[] = [
  {
    name: 'carré',
    latex: (v) => `(${v})^2`,
    apply: (v) => v * v,
    domains: [
      { lo: 0.1, hi: 9, increasing: true, label: `croissante sur $${interval(0, true, null, false)}$` },
      { lo: -9, hi: -0.1, increasing: false, label: `décroissante sur $${interval(null, false, 0, true)}$` },
    ],
  },
  {
    name: 'inverse',
    latex: (v) => `\\frac{1}{${v}}`,
    apply: (v) => 1 / v,
    domains: [
      { lo: 0.1, hi: 9, increasing: false, label: `décroissante sur $${interval(0, false, null, false)}$` },
      { lo: -9, hi: -0.1, increasing: false, label: `décroissante sur $${interval(null, false, 0, false)}$` },
    ],
  },
  {
    name: 'racine carrée',
    latex: (v) => `\\sqrt{${v}}`,
    apply: Math.sqrt,
    domains: [{ lo: 0.1, hi: 9, increasing: true, label: `croissante sur $${interval(0, true, null, false)}$` }],
  },
  {
    name: 'cube',
    latex: (v) => `(${v})^3`,
    apply: (v) => v ** 3,
    domains: [{ lo: -9, hi: 9, increasing: true, label: 'croissante sur $\\mathbb{R}$' }],
  },
];

const comparer: Skill = {
  id: '2nde-comparer-images',
  name: 'Comparer des images sans calculatrice',
  generate(rng, level) {
    const fns = level === 1 ? REF.slice(0, 1) : level === 2 ? REF.slice(0, 3) : REF;
    const f = rng.pick(fns);
    const dom = rng.pick(f.domains);
    // Deux décimaux distincts du même intervalle de monotonie.
    const pickIn = () => Math.round((dom.lo + rng.next() * (dom.hi - dom.lo)) * 100) / 100 || dom.lo;
    const a = pickIn();
    let b = a;
    while (Math.abs(b - a) < 0.01) b = pickIn();
    const smaller = f.apply(a) < f.apply(b);
    const A = f.latex(dec(a));
    const B = f.latex(dec(b));
    return {
      skill: '2nde-comparer-images',
      level,
      prompt: `Sans calculer, compare $${A}$ et $${B}$.`,
      answer: fixedChoice([`$${A} < ${B}$`, `$${A} > ${B}$`], smaller ? 0 : 1),
      hint: `Pense au sens de variation de la fonction ${f.name}.`,
      correction: [
        `La fonction ${f.name} est ${dom.label}, et $${dec(a)}$ et $${dec(b)}$ sont dans cet intervalle.`,
        `$${dec(a)} ${a < b ? '<' : '>'} ${dec(b)}$, donc $${A} ${smaller ? '<' : '>'} ${B}$ (${dom.increasing ? 'une fonction croissante conserve l’ordre' : 'une fonction décroissante inverse l’ordre'}).`,
      ],
    };
  },
};

const inverseEquation: Skill = {
  id: '2nde-inverse-equation',
  name: 'Résoudre 1/x = k',
  generate(rng, level) {
    const n = rng.nonZero(-9, 9);
    const d = level === 1 ? 1 : rng.int(1, 7);
    const k = frac(n, d);
    const x = frac(k.d, k.n);
    return {
      skill: '2nde-inverse-equation',
      level,
      prompt: `Résous l'équation $\\frac{1}{x} = ${fracLatex(k)}$.`,
      answer: { kind: 'number', value: x },
      hint: 'La solution de $\\frac{1}{x} = k$ (avec $k \\neq 0$) est l’inverse de $k$.',
      correction: [`$\\frac{1}{x} = ${fracLatex(k)}$ équivaut à $x = \\frac{1}{${fracLatex(k)}} = ${fracLatex(x)}$.`],
    };
  },
};

const racineEquation: Skill = {
  id: '2nde-racine-equation',
  name: 'Résoudre √x = k',
  generate(rng, level) {
    const k = level === 1 ? rng.int(0, 10) : rng.next() < 0.2 ? -rng.int(1, 9) : rng.int(0, level === 3 ? 20 : 12);
    return {
      skill: '2nde-racine-equation',
      level,
      prompt: `Résous dans $\\mathbb{R}$ l'équation $\\sqrt{x} = ${k}$.`,
      answer: { kind: 'set', values: k < 0 ? [] : [frac(k * k)] },
      hint: 'Une racine carrée est toujours positive ; si $k \\geq 0$, $\\sqrt{x} = k$ équivaut à $x = k^2$.',
      correction: k < 0 ? ["Une racine carrée n'est jamais négative : $S = \\varnothing$."] : [`$\\sqrt{x} = ${k}$ équivaut à $x = ${k}^2 = ${k * k}$.`],
    };
  },
};

const cube: Skill = {
  id: '2nde-cube-equation',
  name: 'Résoudre x³ = k',
  generate(rng, level) {
    const r = level === 1 ? rng.int(1, 5) : rng.nonZero(-6, 6);
    const d = level === 3 ? rng.pick([1, 2, 3, 5]) : 1;
    const x = frac(r, d);
    const k = frac(r ** 3, d ** 3);
    return {
      skill: '2nde-cube-equation',
      level,
      prompt: `Résous l'équation $x^3 = ${fracLatex(k)}$.`,
      answer: { kind: 'number', value: x },
      hint: 'La fonction cube est strictement croissante sur $\\mathbb{R}$ : l’équation a une seule solution. Cherche le nombre dont le cube vaut ce résultat.',
      correction: [`$(${fracLatex(x)})^3 = ${fracLatex(k)}$, et la fonction cube est strictement croissante : $x = ${fracLatex(x)}$ est l'unique solution.`],
    };
  },
};

/* ---------- Variantes : d'autres façons de poser les mêmes notions ---------- */

const decale = (a: number) => (a === 0 ? 'x' : `x ${a > 0 ? '-' : '+'} ${Math.abs(a)}`);

const carreEquationVariantes = [
  variant('aire-carre', (rng, level) => {
    const r = rng.int(2, level === 1 ? 12 : 30);
    return {
      prompt: `Un jardin carré a une aire de $${r * r}$ m². Combien mesure son côté, en m ?`,
      answer: { kind: 'number', value: frac(r) },
      hint: 'Le côté $c$ vérifie $c^2 = $ aire, et une longueur est positive.',
      correction: [`$c^2 = ${r * r}$ et $c > 0$, donc $c = \\sqrt{${r * r}} = ${r}$ m.`, `(La solution $-${r}$ de l'équation ne convient pas pour une longueur.)`],
    };
  }),
  variant('decale', (rng, level) => {
    const a = rng.nonZero(-6, 6);
    const r = rng.int(level === 1 ? 1 : 0, 8);
    const none = level === 3 && rng.next() < 0.25;
    const k = none ? -rng.int(1, 9) : r * r;
    const values = none ? [] : r === 0 ? [frac(a)] : [frac(a - r), frac(a + r)];
    return {
      prompt: `Résous dans $\\mathbb{R}$ l'équation $(${decale(a)})^2 = ${k}$.`,
      answer: { kind: 'set', values },
      hint: 'Pose $X = ' + decale(a) + '$ : tu retombes sur $X^2 = k$.',
      correction: none ? ['Un carré n’est jamais négatif : $S = \\varnothing$.'] : r === 0 ? [`$${decale(a)} = 0$, donc $x = ${a}$.`] : [`$${decale(a)} = ${r}$ ou $${decale(a)} = -${r}$`, `$x = ${a + r}$ ou $x = ${a - r}$`],
    };
  }),
];

const carreInequationVariantes = [
  variant('appartient', (rng, level) => {
    const r = rng.int(2, level === 1 ? 5 : 9);
    const k = r * r;
    const t = rng.pick([-r - 1, -r, -r + 1, r - 1, r, r + 1, 0]);
    const strict = rng.next() < 0.5;
    const op = strict ? '<' : '\\leq';
    const ok = strict ? t * t < k : t * t <= k;
    return {
      prompt: `Le nombre $${t}$ est-il solution de l'inéquation $x^2 ${op} ${k}$ ?`,
      answer: fixedChoice(['Oui', 'Non'], ok ? 0 : 1),
      hint: 'Calcule le carré du nombre (attention aux nombres négatifs) et compare.',
      correction: [`$${par(t)}^2 = ${t * t}$`, `$${t * t} ${ok ? op : strict ? '\\geq' : '>'} ${k}$ : ${ok ? 'c’est' : 'ce n’est pas'} une solution.`],
    };
  }),
  variant('encadrement', (rng, level) => {
    const a = -rng.int(1, level === 1 ? 4 : 7);
    const b = rng.int(1, level === 1 ? 4 : 7);
    const hi = Math.max(a * a, b * b);
    const enc = (lo: number, h: number) => `${lo} \\leq x^2 \\leq ${h}`;
    return {
      prompt: `On sait que $${a} \\leq x \\leq ${b}$. Quel est le meilleur encadrement de $x^2$ ?`,
      answer: latexChoice(rng, enc(0, hi), [enc(a * a, b * b), enc(b * b, a * a), enc(-hi, hi), enc(Math.min(a * a, b * b), hi)], () => enc(1, hi)),
      hint: 'Attention : $0$ est dans l’intervalle, et la fonction carré n’est pas monotone sur $\\mathbb{R}$.',
      correction: [`Sur $[${a}\\,;\\,0]$, $x^2$ va de $${a * a}$ à $0$ ; sur $[0\\,;\\,${b}]$, de $0$ à $${b * b}$.`, `Donc $${enc(0, hi)}$.`],
    };
  }),
];

const comparerVariantes = [
  variant('raisonnement-faux', (rng, level) => {
    const a = -rng.int(2, level === 1 ? 6 : 9);
    let b = rng.int(1, 9);
    if (b === -a) b++;
    const juste = a * a < b * b;
    return {
      prompt: `Un élève écrit : « $${a} < ${b}$, donc $(${a})^2 < ${b}^2$. » Sa conclusion est-elle vraie ?`,
      answer: fixedChoice(['Vrai', 'Faux'], juste ? 0 : 1),
      hint: 'La fonction carré ne conserve l’ordre que pour des nombres positifs. Calcule les deux carrés.',
      correction: [`$(${a})^2 = ${a * a}$ et $${b}^2 = ${b * b}$.`, juste ? 'La conclusion est vraie ici… mais le raisonnement est faux : la fonction carré n’est pas croissante sur $\\mathbb{R}$.' : 'La conclusion est fausse : la fonction carré n’est pas croissante sur $\\mathbb{R}$.'],
    };
  }),
  variant('encadrer-inverse', (rng, level) => {
    let a = rng.int(1, level === 1 ? 4 : 8);
    let b = rng.int(1, level === 1 ? 5 : 10);
    if (a === b) b++;
    if (a > b) [a, b] = [b, a];
    const neg = level === 3 && rng.next() < 0.5;
    const [lo, hi] = neg ? [-b, -a] : [a, b];
    const f = (v: number) => fracLatex(frac(1, v));
    const enc = (x: string, y: string) => `${x} < \\frac{1}{x} < ${y}`;
    return {
      prompt: `On sait que $${lo} < x < ${hi}$. Quel encadrement de $\\frac{1}{x}$ en déduit-on ?`,
      answer: latexChoice(rng, enc(f(hi), f(lo)), [enc(f(lo), f(hi)), enc(f(-lo), f(-hi)), enc(`${lo}`, `${hi}`)], () => enc('0', f(lo))),
      hint: 'La fonction inverse est décroissante sur chacun des intervalles où elle est définie : elle inverse l’ordre.',
      correction: [`$${lo}$ et $${hi}$ ont le même signe, et la fonction inverse est décroissante sur cet intervalle.`, `Donc $${enc(f(hi), f(lo))}$.`],
    };
  }),
];

const inverseVariantes = [
  variant('inequation', (rng, level) => {
    const k = frac(rng.int(1, 9), level === 1 ? 1 : rng.int(1, 4));
    const inv = frac(k.d, k.n);
    const above = rng.next() < 0.5;
    const correct = above ? fracInterval(frac(0), false, inv, false) : `${fracInterval(null, false, frac(0), false)} \\cup ${fracInterval(inv, false, null, false)}`;
    return {
      prompt: `Résous dans $\\mathbb{R}^*$ l'inéquation $\\frac{1}{x} ${above ? '>' : '<'} ${fracLatex(k)}$.`,
      answer: latexChoice(
        rng,
        correct,
        [above ? fracInterval(inv, false, null, false) : fracInterval(frac(0), false, inv, false), fracInterval(null, false, inv, false), fracInterval(frac(0), false, k, false), above ? `${fracInterval(null, false, frac(0), false)} \\cup ${fracInterval(inv, false, null, false)}` : fracInterval(inv, false, null, false)],
        () => fracInterval(frac(0), true, inv, true),
      ),
      hint: 'Trace la courbe de la fonction inverse et la droite horizontale $y = k$. N’oublie pas les $x$ négatifs.',
      correction: [`$\\frac{1}{x} = ${fracLatex(k)}$ pour $x = ${fracLatex(inv)}$.`, above ? `Pour $x < 0$, $\\frac{1}{x} < 0$ : aucune solution. Pour $x > 0$, il faut $x < ${fracLatex(inv)}$.` : `Tout $x < 0$ convient ($\\frac{1}{x} < 0$). Pour $x > 0$, il faut $x > ${fracLatex(inv)}$.`, `$S = ${correct}$`],
    };
  }),
  variant('decale', (rng, level) => {
    const a = rng.nonZero(-6, 6);
    const k = frac(rng.nonZero(-6, 6), level === 1 ? 1 : rng.int(1, 3));
    const x = frac(a * k.n + k.d, k.n);
    return {
      prompt: `Résous l'équation $\\frac{1}{${decale(a)}} = ${fracLatex(k)}$.`,
      answer: { kind: 'number', value: x },
      hint: 'Le dénominateur est l’inverse du membre de droite.',
      correction: [`$${decale(a)} = ${fracLatex(frac(k.d, k.n))}$`, `$x = ${fracLatex(x)}$`],
    };
  }),
];

const racineVariantes = [
  variant('inequation', (rng, level) => {
    const k = rng.int(1, level === 1 ? 6 : 12);
    const below = rng.next() < 0.5;
    const correct = below ? interval(0, true, k * k, false) : interval(k * k, false, null, false);
    return {
      prompt: `Résous dans $${interval(0, true, null, false)}$ l'inéquation $\\sqrt{x} ${below ? '<' : '>'} ${k}$.`,
      answer: latexChoice(rng, correct, [below ? interval(0, true, k, false) : interval(k, false, null, false), below ? interval(null, false, k * k, false) : interval(k * k, true, null, false), below ? interval(k * k, false, null, false) : interval(0, true, k * k, false)], () => interval(0, true, 2 * k, false)),
      hint: 'La fonction racine carrée est croissante sur $[0\\,;\\,+\\infty[$ : elle conserve l’ordre.',
      correction: [`$\\sqrt{x} = ${k}$ pour $x = ${k * k}$.`, `$S = ${correct}$`],
    };
  }),
  variant('decale', (rng, level) => {
    const a = rng.nonZero(-9, 9);
    const k = level === 1 ? rng.int(1, 8) : rng.int(-2, 9);
    return {
      prompt: `Résous dans $\\mathbb{R}$ l'équation $\\sqrt{${decale(a)}} = ${k}$.`,
      answer: { kind: 'set', values: k < 0 ? [] : [frac(k * k + a)] },
      hint: 'Si $k \\geq 0$, $\\sqrt{X} = k$ équivaut à $X = k^2$.',
      correction: k < 0 ? ['Une racine carrée n’est jamais négative : $S = \\varnothing$.'] : [`$${decale(a)} = ${k * k}$`, `$x = ${k * k + a}$`],
    };
  }),
];

const cubeVariantes = [
  variant('volume', (rng, level) => {
    const r = rng.int(2, level === 1 ? 6 : 12);
    return {
      prompt: `Une boîte cubique a un volume de $${r ** 3}$ cm³. Quelle est la longueur de son arête, en cm ?`,
      answer: { kind: 'number', value: frac(r) },
      hint: 'L’arête $a$ vérifie $a^3 = $ volume.',
      correction: [`$a^3 = ${r ** 3}$ et $${r}^3 = ${r ** 3}$, donc $a = ${r}$ cm.`],
    };
  }),
  variant('comparer', (rng) => {
    const a = (rng.sign() * rng.int(1, 60)) / 10;
    let b = a;
    while (b === a) b = Math.round((a + rng.nonZero(-9, 9) / 10) * 10) / 10;
    const A = `(${dec(a)})^3`;
    const B = `(${dec(b)})^3`;
    return {
      prompt: `Sans calculer, compare $${A}$ et $${B}$.`,
      answer: fixedChoice([`$${A} < ${B}$`, `$${A} > ${B}$`], a < b ? 0 : 1),
      hint: 'La fonction cube est croissante sur $\\mathbb{R}$, même pour les nombres négatifs.',
      correction: [`$${dec(a)} ${a < b ? '<' : '>'} ${dec(b)}$ et la fonction cube est croissante sur $\\mathbb{R}$.`, `Donc $${A} ${a < b ? '<' : '>'} ${B}$.`],
    };
  }),
];

export const FONCTIONS_REFERENCE_SKILLS: Skill[] = [
  enrich(carreEquation, carreEquationVariantes),
  enrich(carreInequation, carreInequationVariantes),
  enrich(comparer, comparerVariantes),
  enrich(inverseEquation, inverseVariantes),
  enrich(racineEquation, racineVariantes),
  enrich(cube, cubeVariantes),
];
