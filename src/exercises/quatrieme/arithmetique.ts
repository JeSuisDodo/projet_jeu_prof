import { frac } from '../fraction';
import type { Rng } from '../rng';
import type { Answer, Skill } from '../types';
import { bound, divisors, isPrime, lcm, makeChoice, num, skill } from './util';

/** Chapitre « Nombres premiers et divisibilité » (4e). */

/** Nombres composés qui « ressemblent » à des premiers (impairs, sans facteur 2 ni 5 évident). */
function trickyComposite(rng: Rng, max: number): number {
  for (let guard = 0; guard < 200; guard++) {
    const p = rng.pick([3, 7, 11, 13, 17]);
    const q = rng.pick([3, 7, 11, 13, 17, 19, 23]);
    if (p * q <= max) return p * q;
  }
  return 91;
}

const premier = skill('4e-nombre-premier', 'Reconnaître un nombre premier', (rng, level) => {
  const max = bound(level, 50, 120, 250);
  const primes = Array.from({ length: max }, (_, i) => i).filter((n) => n > 10 && isPrime(n));
  const p = rng.pick(primes);
  const decoys = [trickyComposite(rng, max), trickyComposite(rng, max), level === 1 ? rng.int(5, max / 2) * 2 : trickyComposite(rng, max)];
  return {
    prompt: 'Lequel de ces nombres est premier ?',
    answer: makeChoice(rng, String(p), decoys.map(String), () => String(trickyComposite(rng, max))),
    hint: 'Un nombre premier a exactement deux diviseurs : 1 et lui-même. Teste la division par 2, 3, 5, 7, 11, 13…',
    correction: [
      `${p} n’est divisible par aucun nombre premier inférieur ou égal à $\\sqrt{${p}}$ : il est premier.`,
      ...[...new Set(decoys)].map((d) => {
        const f = divisors(d).find((x) => x > 1)!;
        return `$${d} = ${f} \\times ${d / f}$ n’est pas premier.`;
      }),
    ],
  };
});

const listeDiviseurs = skill('4e-liste-diviseurs', 'Lister les diviseurs d’un nombre', (rng, level) => {
  const pool = Array.from({ length: bound(level, 30, 60, 100) }, (_, i) => i + 1).filter((n) => n >= 6 && divisors(n).length >= bound(level, 3, 4, 6));
  const n = rng.pick(pool);
  const ds = divisors(n);
  const pairs: string[] = [];
  for (const d of ds) if (d * d <= n) pairs.push(`$${n} = ${d} \\times ${n / d}$`);
  const answer: Answer = { kind: 'set', values: ds.map((d) => frac(d)) };
  return {
    prompt: `Donne tous les diviseurs de ${n}, séparés par des points-virgules.`,
    answer,
    hint: 'Cherche les produits de deux entiers égaux à ce nombre, en commençant par $1 \\times n$.',
    correction: [pairs.join(', '), `Diviseurs de ${n} : ${ds.join(' ; ')}.`],
  };
});

const CRITERIA: Record<number, string> = {
  2: 'son chiffre des unités est pair',
  3: 'la somme de ses chiffres est divisible par 3',
  4: 'le nombre formé par ses deux derniers chiffres est divisible par 4',
  5: 'son chiffre des unités est 0 ou 5',
  9: 'la somme de ses chiffres est divisible par 9',
  10: 'son chiffre des unités est 0',
};

const digitSum = (n: number) => String(n).split('').reduce((s, c) => s + Number(c), 0);

const criteres = skill('4e-criteres-divisibilite', 'Utiliser les critères de divisibilité', (rng, level) => {
  const k = rng.pick(level === 1 ? [2, 5, 10, 3] : [3, 9, 4, 3, 9]);
  const max = bound(level, 999, 9999, 99999);
  let good = 0;
  while (good === 0) {
    const v = rng.int(100, max);
    if (v % k === 0) good = v;
  }
  // Leurres : non divisibles, mais proches (même parité, ou multiples de 3 quand on cherche 9).
  const decoys: string[] = [];
  for (let guard = 0; decoys.length < 3 && guard < 500; guard++) {
    const v = k === 9 && rng.next() < 0.5 ? rng.int(34, Math.floor(max / 3)) * 3 : rng.int(100, max);
    if (v % k !== 0 && !decoys.includes(String(v))) decoys.push(String(v));
  }
  return {
    prompt: `Lequel de ces nombres est divisible par ${k} ?`,
    answer: makeChoice(rng, String(good), decoys, () => String(good + 1)),
    hint: `Un nombre est divisible par ${k} si ${CRITERIA[k]}.`,
    correction: [
      k === 3 || k === 9 ? `Somme des chiffres de ${good} : $${String(good).split('').join(' + ')} = ${digitSum(good)}$, divisible par ${k}.` : `${good} est divisible par ${k} car ${CRITERIA[k]}.`,
      `$${good} = ${k} \\times ${good / k}$`,
    ],
  };
});

const decomposition = skill('4e-decomposition', 'Décomposer en facteurs premiers', (rng, level) => {
  const pool = level === 1 ? [2, 2, 3, 5] : level === 2 ? [2, 2, 3, 3, 5, 7] : [2, 3, 5, 7, 11, 13];
  const count = bound(level, 3, 4, 4);
  const factors = Array.from({ length: count }, () => rng.pick(pool)).sort((a, b) => a - b);
  const n = factors.reduce((p, x) => p * x, 1);
  const write = (fs: number[]) => {
    const counts = new Map<number, number>();
    for (const f of fs) counts.set(f, (counts.get(f) ?? 0) + 1);
    return [...counts].map(([p, e]) => (e === 1 ? String(p) : `${p}^{${e}}`)).join(' \\times ');
  };
  const correct = write(factors);
  // Leurres : un facteur non premier, un facteur oublié, un facteur de trop.
  const merged = factors.length > 1 ? [factors[0] * factors[1], ...factors.slice(2)].join(' \\times ') : `1 \\times ${n}`;
  const missing = write(factors.slice(1));
  const extra = write([...factors, 2].sort((a, b) => a - b));
  return {
    prompt: `Quelle est la décomposition de $${n}$ en produit de facteurs premiers ?`,
    answer: makeChoice(rng, `$${correct}$`, [`$${merged}$`, `$${missing}$`, `$${extra}$`], () => `$${write([...factors, 3])}$`),
    hint: 'Divise successivement par les nombres premiers 2, 3, 5, 7… tant que c’est possible.',
    correction: [`$${n} = ${factors.join(' \\times ')}${correct !== factors.join(' \\times ') ? ` = ${correct}` : ''}$, et tous ces facteurs sont premiers.`],
  };
});

const multipleCommun = skill('4e-multiple-commun', 'Trouver un multiple commun', (rng, level) => {
  const pairs = level === 1 ? [[4, 6], [6, 8], [6, 9], [10, 15], [4, 10]] : level === 2 ? [[12, 18], [8, 12], [9, 12], [15, 20], [14, 21]] : [[12, 20], [18, 24], [15, 25], [16, 24], [20, 30], [24, 36]];
  const [a, b] = rng.pick(pairs);
  const m = lcm(a, b);
  const multiples = (x: number) => Array.from({ length: m / x }, (_, i) => x * (i + 1)).join(', ');
  return {
    prompt: rng.pick([
      `Deux bus partent ensemble de la gare. Le premier repasse toutes les ${a} minutes, le second toutes les ${b} minutes. Dans combien de minutes repartiront-ils ensemble pour la première fois ?`,
      `Deux phares s’allument ensemble. L’un clignote toutes les ${a} secondes, l’autre toutes les ${b} secondes. Au bout de combien de secondes clignoteront-ils de nouveau ensemble ?`,
    ]),
    answer: num(m),
    hint: 'Cherche le plus petit multiple commun non nul aux deux nombres.',
    correction: [`Multiples de ${a} : ${multiples(a)}.`, `Multiples de ${b} : ${multiples(b)}.`, `Le premier commun est ${m}.`],
  };
});

export const ARITHMETIQUE_SKILLS: Skill[] = [premier, listeDiviseurs, criteres, decomposition, multipleCommun];
