import { frac, fracLatex } from '../fraction';
import type { Skill } from '../types';
import { dec, fixedChoice, interval, latexChoice } from './outils';

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

export const FONCTIONS_REFERENCE_SKILLS: Skill[] = [carreEquation, carreInequation, comparer, inverseEquation, racineEquation, cube];
