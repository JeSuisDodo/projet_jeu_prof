import { frac } from '../fraction';
import type { Rng } from '../rng';
import type { Level, Skill } from '../types';
import { fixedChoice, gcd, latexChoice } from './outils';

/** Chapitre 2 de 2nde : multiples, diviseurs, nombres premiers. */

export function isPrime(n: number): boolean {
  if (n < 2) return false;
  for (let p = 2; p * p <= n; p++) if (n % p === 0) return false;
  return true;
}

/** Décomposition en facteurs premiers : [[2, 3], [5, 1]] pour 40. */
export function factorize(n: number): [number, number][] {
  const out: [number, number][] = [];
  for (let p = 2; p * p <= n; p++) {
    let e = 0;
    while (n % p === 0) {
      n /= p;
      e++;
    }
    if (e) out.push([p, e]);
  }
  if (n > 1) out.push([n, 1]);
  return out;
}

const factorLatex = (f: [number, number][]) => f.map(([p, e]) => (e === 1 ? `${p}` : `${p}^{${e}}`)).join(' \\times ');

const smallestDivisor = (n: number) => {
  for (let p = 2; p * p <= n; p++) if (n % p === 0) return p;
  return n;
};

const premier: Skill = {
  id: '2nde-premier',
  name: 'Reconnaître un nombre premier',
  generate(rng, level) {
    const max = level === 1 ? 50 : level === 2 ? 120 : 400;
    let n: number;
    if (rng.next() < 0.5) {
      do n = rng.int(11, max);
      while (!isPrime(n));
    } else if (level === 3) {
      // Produits de deux premiers « cachés » : 91 = 7 × 13, 221 = 13 × 17…
      const p = rng.pick([7, 11, 13, 17]);
      const q = rng.pick([7, 11, 13, 17, 19, 23]);
      n = p * q;
    } else {
      do n = rng.int(11, max);
      while (isPrime(n));
    }
    const prime = isPrime(n);
    const d = smallestDivisor(n);
    return {
      skill: '2nde-premier',
      level,
      prompt: `Le nombre $${n}$ est-il premier ?`,
      answer: fixedChoice(['Oui', 'Non'], prime ? 0 : 1),
      hint: 'Un nombre est premier s’il a exactement deux diviseurs : 1 et lui-même. Teste les nombres premiers dont le carré ne dépasse pas $n$.',
      correction: prime
        ? [`Aucun nombre premier $p$ avec $p^2 \\leq ${n}$ ne divise $${n}$.`, `Donc $${n}$ est premier.`]
        : [`$${n} = ${d} \\times ${n / d}$`, `$${n}$ a un diviseur autre que 1 et lui-même : il n'est pas premier.`],
    };
  },
};

function composite(rng: Rng, level: Level): number {
  const primes = level === 1 ? [2, 3, 5] : level === 2 ? [2, 3, 5, 7] : [2, 3, 5, 7, 11, 13];
  const max = level === 1 ? 200 : level === 2 ? 1000 : 5000;
  let n = 1;
  const count = level === 1 ? rng.int(2, 4) : rng.int(3, 6);
  for (let i = 0; i < count; i++) {
    const p = rng.pick(primes);
    if (n * p > max) break;
    n *= p;
  }
  return n < 4 ? 12 : n;
}

const decomposition: Skill = {
  id: '2nde-decomposition',
  name: 'Décomposer en facteurs premiers',
  generate(rng, level) {
    const n = composite(rng, level);
    const f = factorize(n);
    const correct = factorLatex(f);
    const decoys: string[] = [];
    // Exposant changé, facteur premier remplacé, ou facteur non premier glissé dans le produit.
    for (let i = 0; i < f.length; i++) {
      const g = f.map((x) => [...x] as [number, number]);
      g[i][1] += 1;
      decoys.push(factorLatex(g));
      if (g[i][1] > 2) {
        const h = f.map((x) => [...x] as [number, number]);
        h[i][1] -= 1;
        decoys.push(factorLatex(h));
      }
    }
    const big = f.find(([, e]) => e >= 2);
    if (big) {
      const rest = f.filter((x) => x !== big);
      decoys.push(factorLatex([[big[0] * big[0], 1], ...(big[1] > 2 ? [[big[0], big[1] - 2] as [number, number]] : []), ...rest]));
    }
    return {
      skill: '2nde-decomposition',
      level,
      prompt: `Quelle est la décomposition de $${n}$ en produit de facteurs premiers ?`,
      answer: latexChoice(rng, `${n} = ${correct}`, decoys.map((d) => `${n} = ${d}`), () => `${n} = ${factorLatex([[2, rng.int(1, 5)], [rng.pick([3, 7, 11]), 1]])}`),
      hint: 'Divise successivement par 2, puis 3, puis 5… tant que c’est possible. Tous les facteurs doivent être premiers.',
      correction: [`On divise par les plus petits nombres premiers possibles, jusqu'à obtenir 1.`, `$${n} = ${correct}$`],
    };
  },
};

const nbDiviseurs: Skill = {
  id: '2nde-diviseurs',
  name: 'Compter les diviseurs',
  generate(rng, level) {
    const n = level === 1 ? rng.pick([6, 8, 10, 12, 14, 15, 18, 20, 21, 24, 28, 30]) : composite(rng, level === 2 ? 1 : 2);
    const divisors: number[] = [];
    for (let d = 1; d <= n; d++) if (n % d === 0) divisors.push(d);
    const f = factorize(n);
    return {
      skill: '2nde-diviseurs',
      level,
      prompt: `Combien le nombre $${n}$ a-t-il de diviseurs positifs (1 et $${n}$ compris) ?`,
      answer: { kind: 'number', value: frac(divisors.length) },
      hint: 'Cherche les diviseurs par paires : si $d$ divise $n$, alors $\\frac{n}{d}$ aussi.',
      correction: [
        divisors.length <= 24 ? `Les diviseurs de $${n}$ sont : $${divisors.join(' ; ')}$.` : `$${n} = ${factorLatex(f)}$`,
        `Avec $${n} = ${factorLatex(f)}$, le nombre de diviseurs est $${f.map(([, e]) => `(${e} + 1)`).join(' \\times ')} = ${divisors.length}$.`,
      ],
    };
  },
};

const irreductible: Skill = {
  id: '2nde-irreductible',
  name: 'Rendre une fraction irréductible',
  generate(rng, level) {
    const bound = level === 1 ? 9 : level === 2 ? 15 : 30;
    let p: number;
    let q: number;
    do {
      p = rng.int(1, bound);
      q = rng.int(2, bound);
    } while (gcd(p, q) !== 1 || p === q);
    const k = level === 1 ? rng.pick([2, 3, 5]) : rng.pick([4, 6, 9, 12, 14, 15, 18]);
    const n = p * k;
    const d = q * k;
    // Une simplification incomplète a la bonne valeur mais n'est pas irréductible.
    const partial = [2, 3, 5, 7].find((s) => k % s === 0 && k !== s);
    const decoys = [`\\frac{${q}}{${p}}`, `\\frac{${p + 1}}{${q}}`, `\\frac{${p}}{${q + 1}}`];
    if (partial) decoys.unshift(`\\frac{${n / partial}}{${d / partial}}`);
    return {
      skill: '2nde-irreductible',
      level,
      prompt: `Quelle est la forme irréductible de $\\frac{${n}}{${d}}$ ?`,
      answer: latexChoice(rng, `\\frac{${p}}{${q}}`, decoys, () => `\\frac{${p + rng.int(2, 4)}}{${q}}`),
      hint: 'Divise le numérateur et le dénominateur par leur plus grand diviseur commun.',
      correction: [
        `Le plus grand diviseur commun de $${n}$ et $${d}$ est $${k}$.`,
        `$\\frac{${n}}{${d}} = \\frac{${n} \\div ${k}}{${d} \\div ${k}} = \\frac{${p}}{${q}}$`,
      ],
    };
  },
};

const reste: Skill = {
  id: '2nde-reste',
  name: 'Trouver le reste d’une division euclidienne',
  generate(rng, level) {
    const b = level === 1 ? rng.int(2, 9) : level === 2 ? rng.int(6, 15) : rng.int(11, 30);
    const q = level === 1 ? rng.int(2, 12) : rng.int(5, 40);
    const r = rng.int(0, b - 1);
    const a = b * q + r;
    return {
      skill: '2nde-reste',
      level,
      prompt: `Quel est le reste de la division euclidienne de $${a}$ par $${b}$ ?`,
      answer: { kind: 'number', value: frac(r) },
      hint: `Cherche le plus grand multiple de $${b}$ inférieur ou égal à $${a}$.`,
      correction: [`$${a} = ${b} \\times ${q} + ${r}$ avec $0 \\leq ${r} < ${b}$.`, `Le reste est $${r}$.`],
    };
  },
};

const pgcd: Skill = {
  id: '2nde-pgcd',
  name: 'Trouver le plus grand diviseur commun',
  generate(rng, level) {
    const g = level === 1 ? rng.pick([2, 3, 4, 5, 6]) : rng.pick([6, 8, 9, 12, 14, 15, 18, 21, 24]);
    let p: number;
    let q: number;
    do {
      p = rng.int(2, level === 3 ? 13 : 9);
      q = rng.int(2, level === 3 ? 13 : 9);
    } while (gcd(p, q) !== 1 || p === q);
    const a = g * p;
    const b = g * q;
    return {
      skill: '2nde-pgcd',
      level,
      prompt: `Un pâtissier veut répartir $${a}$ macarons et $${b}$ chouquettes dans des boîtes identiques, sans rien laisser. Combien de boîtes au maximum peut-il remplir ?`,
      answer: { kind: 'number', value: frac(g) },
      hint: 'Le nombre de boîtes doit diviser les deux quantités : cherche leur plus grand diviseur commun.',
      correction: [
        `$${a} = ${factorLatex(factorize(a))}$ et $${b} = ${factorLatex(factorize(b))}$.`,
        `Leur plus grand diviseur commun est $${g}$ : $${g}$ boîtes de $${p}$ macarons et $${q}$ chouquettes.`,
      ],
    };
  },
};

export const ARITHMETIQUE_SKILLS: Skill[] = [premier, decomposition, nbDiviseurs, irreductible, reste, pgcd];
