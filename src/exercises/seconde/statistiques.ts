import { frac } from '../fraction';
import type { Rng } from '../rng';
import type { Level, Skill } from '../types';
import { dec, fracOf, par } from './outils';

/** Chapitre 12 de 2nde : statistique descriptive (moyenne, médiane, quartiles, étendue). */

const series = (rng: Rng, n: number, min: number, max: number) => Array.from({ length: n }, () => rng.int(min, max));
const list = (xs: number[]) => `$${xs.join('$ ; $')}$`;
const sorted = (xs: number[]) => [...xs].sort((a, b) => a - b);

export function median(xs: number[]): number {
  const s = sorted(xs);
  const n = s.length;
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
}

/** Quartiles au sens du programme : plus petite valeur de la série telle qu'au moins 25 % (75 %) des valeurs lui soient inférieures ou égales. */
export const quartile = (xs: number[], q: 1 | 3) => sorted(xs)[Math.ceil((q * xs.length) / 4) - 1];

const moyenne: Skill = {
  id: '2nde-moyenne',
  name: 'Calculer une moyenne',
  generate(rng, level) {
    const n = level === 1 ? rng.int(4, 5) : rng.int(5, 8);
    const xs = series(rng, n, level === 3 ? -5 : 0, 20);
    // La moyenne doit tomber juste (au plus deux décimales) : on ajuste la dernière note.
    const step = n === 4 || n === 5 || n === 8 ? 1 : n;
    const sum = xs.reduce((a, b) => a + b, 0);
    const extra = (step - (sum % step)) % step;
    xs[n - 1] += extra;
    const total = sum + extra;
    const mean = total / n;
    return {
      skill: '2nde-moyenne',
      level,
      prompt: `Calcule la moyenne de la série : ${list(xs)}.`,
      answer: { kind: 'number', value: frac(total, n) },
      hint: 'Moyenne = somme des valeurs ÷ nombre de valeurs.',
      correction: [`La somme vaut $${xs.map(par).join(' + ')} = ${total}$.`, `$\\bar{x} = \\frac{${total}}{${n}} = ${dec(mean)}$`],
    };
  },
};

const moyennePonderee: Skill = {
  id: '2nde-moyenne-ponderee',
  name: 'Calculer une moyenne pondérée',
  generate(rng, level) {
    const k = level === 1 ? 3 : 4;
    const values = sorted([...new Set(series(rng, k + 3, 0, 20))]).slice(0, k);
    while (values.length < k) values.push(values[values.length - 1] + 1);
    const counts = values.map(() => rng.int(1, level === 3 ? 12 : 6));
    const N = counts.reduce((a, b) => a + b, 0);
    // Total des effectifs ramené à un diviseur de 100 pour une moyenne décimale exacte.
    const target = [2, 4, 5, 10, 20, 25, 50].find((d) => d >= N) ?? 50;
    counts[counts.length - 1] += target - N;
    const total = values.reduce((acc, v, i) => acc + v * counts[i], 0);
    const table = `\\begin{array}{|c|${'c|'.repeat(k)}} \\hline \\text{Note} & ${values.join(' & ')} \\\\ \\hline \\text{Effectif} & ${counts.join(' & ')} \\\\ \\hline \\end{array}`;
    return {
      skill: '2nde-moyenne-ponderee',
      level,
      prompt: `Voici les notes d'un contrôle : $${table}$ Quelle est la moyenne de la classe ?`,
      answer: { kind: 'number', value: frac(total, target) },
      hint: 'Multiplie chaque note par son effectif, additionne, puis divise par l’effectif total.',
      correction: [
        `$${values.map((v, i) => `${v} \\times ${counts[i]}`).join(' + ')} = ${total}$, pour un effectif total de $${target}$.`,
        `$\\bar{x} = \\frac{${total}}{${target}} = ${dec(total / target)}$`,
      ],
    };
  },
};

const mediane: Skill = {
  id: '2nde-mediane',
  name: 'Trouver la médiane',
  generate(rng, level) {
    const n = level === 1 ? rng.pick([5, 7]) : rng.int(6, 10);
    const xs = series(rng, n, 0, 30);
    const m = median(xs);
    const s = sorted(xs);
    return {
      skill: '2nde-mediane',
      level,
      prompt: `Quelle est la médiane de la série : ${list(xs)} ?`,
      answer: { kind: 'number', value: fracOf(m) },
      hint: 'Range d’abord les valeurs dans l’ordre croissant. Avec un nombre pair de valeurs, la médiane est la moyenne des deux valeurs centrales.',
      correction: [
        `Série rangée : $${s.join(' ; ')}$ ($${n}$ valeurs).`,
        n % 2
          ? `La médiane est la $${(n + 1) / 2}$e valeur : $${m}$.`
          : `La médiane est la moyenne des $${n / 2}$e et $${n / 2 + 1}$e valeurs : $\\frac{${s[n / 2 - 1]} + ${s[n / 2]}}{2} = ${dec(m)}$.`,
      ],
    };
  },
};

const quartiles: Skill = {
  id: '2nde-quartiles',
  name: 'Trouver un quartile',
  generate(rng, level) {
    const n = level === 1 ? rng.pick([8, 12]) : rng.int(7, 13);
    const xs = series(rng, n, 0, 40);
    const q = rng.pick([1, 3] as const);
    const rank = Math.ceil((q * n) / 4);
    const value = quartile(xs, q);
    return {
      skill: '2nde-quartiles',
      level,
      prompt: `Quel est le ${q === 1 ? 'premier' : 'troisième'} quartile $Q_${q}$ de la série : ${list(xs)} ?`,
      answer: { kind: 'number', value: frac(value) },
      hint: `$Q_${q}$ est la plus petite valeur de la série telle qu'au moins $${q * 25}\\,\\%$ des valeurs lui soient inférieures ou égales.`,
      correction: [
        `Série rangée : $${sorted(xs).join(' ; ')}$ ($${n}$ valeurs).`,
        `$\\frac{${q === 1 ? '' : '3 \\times '}${n}}{4} = ${dec((q * n) / 4)}$, on prend donc la $${rank}$e valeur : $Q_${q} = ${value}$.`,
      ],
    };
  },
};

const dispersion: Skill = {
  id: '2nde-etendue',
  name: 'Calculer l’étendue ou l’écart interquartile',
  generate(rng, level) {
    const n = rng.int(8, 12);
    const xs = series(rng, n, 0, 50);
    const interq = level > 1 && rng.next() < 0.5;
    const s = sorted(xs);
    const q1 = quartile(xs, 1);
    const q3 = quartile(xs, 3);
    const value = interq ? q3 - q1 : s[n - 1] - s[0];
    return {
      skill: '2nde-etendue',
      level,
      prompt: `Calcule ${interq ? "l'écart interquartile $Q_3 - Q_1$" : "l'étendue"} de la série : ${list(xs)}.`,
      answer: { kind: 'number', value: frac(value) },
      hint: interq ? 'Trouve $Q_1$ et $Q_3$ sur la série rangée, puis fais la différence.' : 'Étendue = plus grande valeur − plus petite valeur.',
      correction: interq
        ? [`Série rangée : $${s.join(' ; ')}$.`, `$Q_1 = ${q1}$ et $Q_3 = ${q3}$, donc $Q_3 - Q_1 = ${value}$.`]
        : [`La plus grande valeur est $${s[n - 1]}$ et la plus petite $${s[0]}$.`, `Étendue : $${s[n - 1]} - ${s[0]} = ${value}$.`],
    };
  },
};

const moyenneTransformee: Skill = {
  id: '2nde-moyenne-transformee',
  name: 'Transformer une série',
  generate(rng, level: Level) {
    const mean = rng.int(8, 15) + (level === 3 ? rng.pick([0, 0.5]) : 0);
    const a = level === 1 ? 1 : rng.pick([2, 3, 0.5, 1.5]);
    const b = rng.nonZero(-4, 6);
    const result = Math.round((a * mean + b) * 100) / 100;
    const transfo = a === 1 ? `on ajoute $${b}$ points à chaque note` : `on multiplie chaque note par $${dec(a)}$ puis on ajoute $${b}$`;
    return {
      skill: '2nde-moyenne-transformee',
      level,
      prompt: `La moyenne d'une série de notes est $${dec(mean)}$. Si ${transfo}, quelle est la nouvelle moyenne ?`,
      answer: { kind: 'number', value: fracOf(result) },
      hint: 'Si on transforme chaque valeur par $ax + b$, la moyenne est transformée de la même façon.',
      correction: [`Nouvelle moyenne : $${a === 1 ? '' : `${dec(a)} \\times `}${dec(mean)} ${b < 0 ? '-' : '+'} ${Math.abs(b)} = ${dec(result)}$`],
    };
  },
};

export const STATISTIQUES_SKILLS: Skill[] = [moyenne, moyennePonderee, mediane, quartiles, dispersion, moyenneTransformee];
