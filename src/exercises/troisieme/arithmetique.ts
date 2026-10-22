import { factorize, isPrime } from '../seconde/arithmetique';
import type { Skill } from '../types';
import { choiceTex, fixedChoice, gcd, lcm, num, skill } from './outils';

/** 3e : divisibilité, nombres premiers, décomposition, fractions irréductibles, problèmes de partage. */

const factorLatex = (f: [number, number][]) => f.map(([p, e]) => (e === 1 ? `${p}` : `${p}^{${e}}`)).join(' \\times ');

const CRITERES: Record<number, string> = {
  2: 'Un nombre est divisible par 2 si son chiffre des unités est 0, 2, 4, 6 ou 8.',
  3: 'Un nombre est divisible par 3 si la somme de ses chiffres est divisible par 3.',
  5: 'Un nombre est divisible par 5 si son chiffre des unités est 0 ou 5.',
  9: 'Un nombre est divisible par 9 si la somme de ses chiffres est divisible par 9.',
  10: 'Un nombre est divisible par 10 si son chiffre des unités est 0.',
};

const digitSum = (n: number) => String(n).split('').reduce((s, c) => s + Number(c), 0);

const divisibilite = skill('3e-divisibilite', 'Utiliser les critères de divisibilité', (rng, level) => {
  const d = level === 1 ? rng.pick([2, 5, 10]) : rng.pick([3, 9, 3, 9, 5]);
  const max = level === 1 ? 999 : level === 2 ? 9999 : 99999;
  const yes = rng.next() < 0.5;
  let n: number;
  do {
    n = rng.int(100, max);
    if (yes) n -= n % d;
    // Pour 9, un multiple de 3 non multiple de 9 est le piège le plus instructif.
    else if (d === 9 && level === 3) n = n - (n % 3) + (n % 9 === 0 ? 3 : 0);
  } while (n < 100 || (n % d === 0) !== yes);
  const s = digitSum(n);
  return {
    prompt: `Le nombre $${n}$ est-il divisible par $${d}$ ?`,
    answer: fixedChoice(['Oui', 'Non'], yes ? 0 : 1),
    hint: CRITERES[d],
    correction:
      d === 3 || d === 9
        ? [`Somme des chiffres : $${String(n).split('').join(' + ')} = ${s}$.`, `$${s}$ ${s % d === 0 ? 'est' : 'n’est pas'} divisible par $${d}$, donc $${n}$ ${yes ? 'est' : 'n’est pas'} divisible par $${d}$.`]
        : [`Le chiffre des unités de $${n}$ est $${n % 10}$.`, `Donc $${n}$ ${yes ? 'est' : 'n’est pas'} divisible par $${d}$.`],
  };
});

const premier = skill('3e-premier', 'Reconnaître un nombre premier', (rng, level) => {
  const max = level === 1 ? 50 : level === 2 ? 100 : 200;
  let n: number;
  if (rng.next() < 0.5) {
    do n = rng.int(2, max);
    while (!isPrime(n));
  } else if (level >= 2) {
    // Les impairs non premiers piègent davantage : 51, 57, 87, 91…
    do n = rng.int(9, max) | 1;
    while (isPrime(n));
  } else {
    do n = rng.int(4, max);
    while (isPrime(n));
  }
  const f = factorize(n);
  const d = f[0][0];
  return {
    prompt: `Le nombre $${n}$ est-il premier ?`,
    answer: fixedChoice(['Oui', 'Non'], isPrime(n) ? 0 : 1),
    hint: 'Un nombre premier a exactement deux diviseurs : 1 et lui-même. Essaie de le diviser par 2, 3, 5, 7, 11, 13…',
    correction: isPrime(n)
      ? [`Aucun des nombres premiers $2, 3, 5, 7, 11, 13$ (dont le carré ne dépasse pas $${n}$) ne divise $${n}$.`, `$${n}$ est premier.`]
      : [`$${n} = ${d} \\times ${n / d}$.`, `$${n}$ a d'autres diviseurs que 1 et lui-même : il n'est pas premier.`],
  };
});

function composite(rng: { pick: <T>(x: readonly T[]) => T; int: (a: number, b: number) => number }, primes: number[], max: number, count: number): number {
  let n = 1;
  for (let i = 0; i < count; i++) {
    const p = rng.pick(primes);
    if (n * p > max) break;
    n *= p;
  }
  return n < 6 ? 12 : n;
}

const decomposition = skill('3e-decomposition', 'Décomposer un nombre en produit de facteurs premiers', (rng, level) => {
  const primes = level === 1 ? [2, 3, 5] : level === 2 ? [2, 3, 5, 7] : [2, 3, 5, 7, 11];
  let n: number;
  do n = composite(rng, primes, level === 1 ? 200 : level === 2 ? 1000 : 3000, rng.int(3, level + 3));
  while (factorize(n).length < 2);
  const f = factorize(n);
  const correct = factorLatex(f);
  const decoys: string[] = [];
  f.forEach((_, i) => {
    const g = f.map((x) => [...x] as [number, number]);
    g[i][1] += 1;
    decoys.push(factorLatex(g));
  });
  // Un facteur non premier (4, 6, 9…) glissé dans le produit : la valeur est juste, mais ce n'est pas une décomposition.
  const big = f.find(([, e]) => e >= 2);
  if (big) decoys.push(factorLatex([[big[0] ** 2, 1], ...(big[1] > 2 ? [[big[0], big[1] - 2] as [number, number]] : []), ...f.filter((x) => x !== big)]));
  else decoys.push(`${f[0][0] * f[1][0]}${f.length > 2 ? ` \\times ${factorLatex(f.slice(2))}` : ''}`);
  return {
    prompt: `Quelle est la décomposition de $${n}$ en produit de facteurs premiers ?`,
    answer: choiceTex(rng, `${n} = ${correct}`, decoys.map((d) => `${n} = ${d}`), () => `${n} = ${factorLatex([[2, rng.int(1, 6)], [rng.pick([3, 7, 13]), 1]])}`),
    hint: 'Divise successivement par 2, puis 3, puis 5… tant que c’est possible. Tous les facteurs doivent être premiers.',
    correction: [`On divise par les plus petits nombres premiers possibles jusqu'à obtenir 1.`, `$${n} = ${correct}$`],
  };
});

const irreductible = skill('3e-irreductible', 'Rendre une fraction irréductible', (rng, level) => {
  const bound = level === 1 ? 9 : level === 2 ? 15 : 25;
  let p: number;
  let q: number;
  do {
    p = rng.int(1, bound);
    q = rng.int(2, bound);
  } while (gcd(p, q) !== 1 || p === q);
  const k = level === 1 ? rng.pick([2, 3, 5]) : rng.pick([4, 6, 8, 9, 12, 15, 18]);
  const n = p * k;
  const d = q * k;
  const partial = [2, 3, 5].find((s) => k % s === 0 && k !== s);
  const decoys = [`\\frac{${q}}{${p}}`, `\\frac{${p + 1}}{${q}}`, `\\frac{${p}}{${q + 1}}`];
  if (partial) decoys.unshift(`\\frac{${n / partial}}{${d / partial}}`);
  return {
    prompt: `Quelle est la forme irréductible de $\\frac{${n}}{${d}}$ ?`,
    answer: choiceTex(rng, `\\frac{${p}}{${q}}`, decoys, () => `\\frac{${p + rng.int(2, 4)}}{${q}}`),
    hint: 'Décompose le numérateur et le dénominateur en facteurs premiers, puis simplifie par les facteurs communs.',
    correction: [
      `$${n} = ${factorLatex(factorize(n))}$ et $${d} = ${factorLatex(factorize(d))}$.`,
      `$\\frac{${n}}{${d}} = \\frac{${p} \\times ${k}}{${q} \\times ${k}} = \\frac{${p}}{${q}}$`,
    ],
  };
});

const BOUQUETS: [string, string, string][] = [
  ['roses', 'tulipes', 'bouquets'],
  ['billes rouges', 'billes bleues', 'sachets'],
  ['croissants', 'pains au chocolat', 'paniers'],
  ['cartes « dragon »', 'cartes « licorne »', 'paquets'],
];

const partage = skill('3e-partage', 'Résoudre un problème de partage (plus grand diviseur commun)', (rng, level) => {
  const g = level === 1 ? rng.pick([2, 3, 4, 5, 6]) : level === 2 ? rng.pick([6, 8, 9, 12, 14, 15]) : rng.pick([12, 14, 15, 16, 18, 21, 24]);
  let p: number;
  let q: number;
  do {
    p = rng.int(2, level === 3 ? 13 : 9);
    q = rng.int(2, level === 3 ? 13 : 9);
  } while (gcd(p, q) !== 1 || p === q);
  const [x, y, box] = rng.pick(BOUQUETS);
  const a = g * p;
  const b = g * q;
  return {
    prompt: `On veut répartir $${a}$ ${x} et $${b}$ ${y} en ${box} identiques, en utilisant tout. Combien de ${box} au maximum peut-on faire ?`,
    answer: num(g),
    hint: `Le nombre de ${box} doit diviser $${a}$ et $${b}$ : cherche leur plus grand diviseur commun.`,
    correction: [
      `$${a} = ${factorLatex(factorize(a))}$ et $${b} = ${factorLatex(factorize(b))}$.`,
      `Le plus grand diviseur commun est $${g}$ : $${g}$ ${box}, chacun avec $${p}$ ${x} et $${q}$ ${y}.`,
    ],
  };
});

const multiples = skill('3e-multiples-communs', 'Trouver un multiple commun (rendez-vous périodiques)', (rng, level) => {
  const pool = level === 1 ? [4, 6, 8, 10, 12] : level === 2 ? [6, 8, 9, 10, 12, 15, 18] : [12, 14, 15, 18, 20, 21, 24, 28];
  let a: number;
  let b: number;
  do {
    a = rng.pick(pool);
    b = rng.pick(pool);
  } while (a >= b || b % a === 0);
  const m = lcm(a, b);
  return {
    prompt: `Deux phares s'allument en même temps. Le premier clignote toutes les $${a}$ secondes, le second toutes les $${b}$ secondes. Au bout de combien de secondes s'allumeront-ils de nouveau ensemble ?`,
    answer: num(m),
    hint: `Cherche le plus petit nombre non nul qui est à la fois multiple de $${a}$ et de $${b}$.`,
    correction: [
      `Multiples de $${b}$ : $${[1, 2, 3, 4, 5].map((k) => k * b).filter((v) => v <= m).join(' ; ')}$…`,
      `Le premier qui est aussi multiple de $${a}$ est $${m} = ${m / a} \\times ${a}$.`,
      `Ils se rallument ensemble au bout de $${m}$ secondes.`,
    ],
  };
});

export const ARITHMETIQUE_3E: Skill[] = [divisibilite, premier, decomposition, irreductible, partage, multiples];
