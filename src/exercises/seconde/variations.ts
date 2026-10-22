import { frac } from '../fraction';
import type { Rng } from '../rng';
import type { Skill } from '../types';
import { affine, dec, distinctInts, fixedChoice, interval, latexChoice, par } from './outils';

/** Chapitre 10 de 2nde : sens de variation, extremums, tableaux de variations. */

const sensAffine: Skill = {
  id: '2nde-sens-affine',
  name: 'Trouver le sens de variation d’une fonction affine',
  generate(rng, level) {
    const a = level === 1 ? rng.nonZero(-5, 5) : rng.int(-5, 5);
    const b = rng.int(-9, 9);
    // En niveau 3, la fonction est écrite b + ax pour ne pas lire a trop vite.
    const f = level === 3 && b !== 0 ? `${b} ${a < 0 ? '-' : '+'} ${Math.abs(a) === 1 ? '' : Math.abs(a)}x` : affine(a, b);
    const shown = a === 0 ? `${b}` : f;
    const kind = a > 0 ? 0 : a < 0 ? 1 : 2;
    return {
      skill: '2nde-sens-affine',
      level,
      prompt: `Quel est le sens de variation sur $\\mathbb{R}$ de la fonction $f(x) = ${shown}$ ?`,
      answer: fixedChoice(['Croissante', 'Décroissante', 'Constante'], kind),
      hint: 'Une fonction affine $f(x) = ax + b$ est croissante si $a > 0$, décroissante si $a < 0$, constante si $a = 0$.',
      correction: [
        `Le coefficient de $x$ est $a = ${a}$.`,
        a > 0 ? '$a > 0$ : $f$ est croissante.' : a < 0 ? '$a < 0$ : $f$ est décroissante.' : '$a = 0$ : $f$ est constante.',
      ],
    };
  },
};

/** Tableau de variations en LaTeX : abscisses, valeurs et flèches. */
function table(xs: number[], ys: number[]): string {
  const top: string[] = [];
  const bottom: string[] = [];
  xs.forEach((x, i) => {
    top.push(String(x));
    bottom.push(String(ys[i]));
    if (i < xs.length - 1) {
      top.push('');
      bottom.push(ys[i + 1] > ys[i] ? '\\nearrow' : '\\searrow');
    }
  });
  const cols = 'c'.repeat(top.length);
  return `\\begin{array}{c|${cols}} x & ${top.join(' & ')} \\\\ \\hline f(x) & ${bottom.join(' & ')} \\end{array}`;
}

/** Valeurs alternées (monte, descend…) pour un tableau de variations crédible. */
function zigzag(rng: Rng, n: number, up: boolean): number[] {
  const ys = [rng.int(-6, 6)];
  for (let i = 1; i < n; i++) {
    const goUp = i % 2 === 1 ? up : !up;
    ys.push(ys[i - 1] + (goUp ? 1 : -1) * rng.int(2, 7));
  }
  return ys;
}

const extremumTableau: Skill = {
  id: '2nde-extremum-tableau',
  name: 'Lire un extremum dans un tableau de variations',
  generate(rng, level) {
    const n = level === 1 ? 3 : 4;
    const xs = distinctInts(rng, n, -8, 8).sort((p, q) => p - q);
    let ys = zigzag(rng, n, rng.next() < 0.5);
    // Toutes les valeurs différentes, pour qu'il n'y ait aucune ambiguïté.
    while (new Set(ys).size < n) ys = zigzag(rng, n, rng.next() < 0.5);
    const wantMax = rng.next() < 0.5;
    const value = wantMax ? Math.max(...ys) : Math.min(...ys);
    const at = xs[ys.indexOf(value)];
    return {
      skill: '2nde-extremum-tableau',
      level,
      prompt: `Voici le tableau de variations d'une fonction $f$ sur $[${xs[0]}\\,;\\,${xs[n - 1]}]$ : $${table(xs, ys)}$ Quel est le ${wantMax ? 'maximum' : 'minimum'} de $f$ sur cet intervalle ?`,
      answer: { kind: 'number', value: frac(value) },
      hint: `Compare toutes les valeurs ${wantMax ? 'au bout des flèches montantes' : 'au bout des flèches descendantes'} et aux bornes.`,
      correction: [
        `Les valeurs du tableau sont $${ys.join('$, $')}$.`,
        `Le ${wantMax ? 'maximum' : 'minimum'} est $${value}$, atteint en $x = ${at}$.`,
      ],
    };
  },
};

const comparerTableau: Skill = {
  id: '2nde-comparer-tableau',
  name: 'Comparer des images grâce aux variations',
  generate(rng, level) {
    const [lo, hi] = distinctInts(rng, 2, -8, 8).sort((p, q) => p - q);
    const increasing = rng.next() < 0.5;
    const span = hi - lo;
    // Deux décimaux distincts dans ]lo ; hi[.
    const a = lo + Math.round(rng.next() * span * 10) / 10;
    let b = a;
    while (b === a) b = lo + Math.round(rng.next() * span * 10) / 10;
    const fa = `f(${dec(a)})`;
    const fb = `f(${dec(b)})`;
    const smaller = (a < b) === increasing;
    return {
      skill: '2nde-comparer-tableau',
      level,
      prompt: `La fonction $f$ est ${increasing ? 'strictement croissante' : 'strictement décroissante'} sur $[${lo}\\,;\\,${hi}]$. Compare $${fa}$ et $${fb}$.`,
      answer: fixedChoice([`$${fa} < ${fb}$`, `$${fa} > ${fb}$`], smaller ? 0 : 1),
      hint: 'Une fonction croissante conserve l’ordre ; une fonction décroissante l’inverse.',
      correction: [
        `$${dec(a)} ${a < b ? '<' : '>'} ${dec(b)}$ et ces deux nombres sont dans $[${lo}\\,;\\,${hi}]$.`,
        `$f$ ${increasing ? 'conserve' : 'inverse'} l'ordre, donc $${fa} ${smaller ? '<' : '>'} ${fb}$.`,
      ],
    };
  },
};

const extremumAffine: Skill = {
  id: '2nde-extremum-affine',
  name: 'Trouver l’extremum d’une fonction affine sur un intervalle',
  generate(rng, level) {
    const a = rng.nonZero(-5, 5);
    const b = rng.int(-9, 9);
    const [lo, hi] = distinctInts(rng, 2, -6, 6).sort((p, q) => p - q);
    const wantMax = level === 1 ? true : rng.next() < 0.5;
    const at = (a > 0) === wantMax ? hi : lo;
    const value = a * at + b;
    return {
      skill: '2nde-extremum-affine',
      level,
      prompt: `Quel est le ${wantMax ? 'maximum' : 'minimum'} de $f(x) = ${affine(a, b)}$ sur $[${lo}\\,;\\,${hi}]$ ?`,
      answer: { kind: 'number', value: frac(value) },
      hint: 'Une fonction affine est monotone : son extremum sur un intervalle fermé est atteint à une borne.',
      correction: [
        `$a = ${a}$ : $f$ est ${a > 0 ? 'croissante' : 'décroissante'}, donc son ${wantMax ? 'maximum' : 'minimum'} est atteint en $x = ${at}$.`,
        `$f(${at}) = ${a} \\times ${par(at)} ${b < 0 ? '-' : '+'} ${Math.abs(b)} = ${value}$`,
      ],
    };
  },
};

/** f(x) = s(x - α)² + β */
function shifted(s: number, alpha: number, beta: number): string {
  const square = alpha === 0 ? 'x^2' : `(${affine(1, -alpha)})^2`;
  return `${s < 0 ? '-' : ''}${square}${beta === 0 ? '' : ` ${beta < 0 ? '-' : '+'} ${Math.abs(beta)}`}`;
}

const variationsCarre: Skill = {
  id: '2nde-variations-carre',
  name: 'Trouver les variations de a(x − α)² + β',
  generate(rng, level) {
    const s = level === 1 ? 1 : rng.sign();
    const alpha = rng.int(-6, 6);
    const beta = rng.int(-9, 9);
    const wantUp = rng.next() < 0.5;
    const right = interval(alpha, true, null, false);
    const left = interval(null, false, alpha, true);
    // s > 0 : décroissante puis croissante ; s < 0 : l'inverse.
    const correct = (s > 0) === wantUp ? right : left;
    return {
      skill: '2nde-variations-carre',
      level,
      prompt: `Sur quel intervalle la fonction $f(x) = ${shifted(s, alpha, beta)}$ est-elle ${wantUp ? 'croissante' : 'décroissante'} ?`,
      answer: latexChoice(
        rng,
        correct,
        [correct === right ? left : right, interval(-alpha, true, null, false), interval(null, false, -alpha, true), interval(beta, true, null, false)],
        () => interval(alpha + 1, true, null, false),
      ),
      hint: 'Comme la fonction carré, elle change de sens en $x = \\alpha$, là où le carré s’annule.',
      correction: [
        `Le carré $${alpha === 0 ? 'x^2' : `(${affine(1, -alpha)})^2`}$ est minimal en $x = ${alpha}$.`,
        s > 0
          ? `$f$ est décroissante sur $${left}$ puis croissante sur $${right}$.`
          : `Avec le signe moins, $f$ est croissante sur $${left}$ puis décroissante sur $${right}$.`,
      ],
    };
  },
};

const extremumCarre: Skill = {
  id: '2nde-extremum-carre',
  name: 'Trouver l’extremum de a(x − α)² + β',
  generate(rng, level) {
    const s = level === 1 ? 1 : rng.sign();
    const alpha = rng.int(-6, 6);
    const beta = rng.int(-9, 9);
    return {
      skill: '2nde-extremum-carre',
      level,
      prompt: `La fonction $f(x) = ${shifted(s, alpha, beta)}$ admet un ${s > 0 ? 'minimum' : 'maximum'} sur $\\mathbb{R}$. Donne sa valeur et l'abscisse où il est atteint.`,
      answer: { kind: 'pair', values: [frac(beta), frac(alpha)], labels: [s > 0 ? '\\min' : '\\max', 'x'] },
      hint: 'Un carré est toujours positif ou nul, et il vaut 0 en un seul point.',
      correction: [
        `$${alpha === 0 ? 'x^2' : `(${affine(1, -alpha)})^2`} \\geq 0$ et il vaut 0 pour $x = ${alpha}$.`,
        s > 0 ? `Donc $f(x) \\geq ${beta}$, avec égalité en $x = ${alpha}$ : minimum $${beta}$.` : `Donc $f(x) \\leq ${beta}$, avec égalité en $x = ${alpha}$ : maximum $${beta}$.`,
      ],
    };
  },
};

export const VARIATIONS_SKILLS: Skill[] = [sensAffine, extremumTableau, comparerTableau, extremumAffine, variationsCarre, extremumCarre];
