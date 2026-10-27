import { frac } from '../fraction';
import type { Rng } from '../rng';
import type { Level, Skill } from '../types';
import { enrich, variant } from '../variantes';
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

/* ---------- Variantes : d'autres façons de poser les mêmes notions ---------- */

const JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

const premierVariantes = [
  variant('plus-petit-diviseur', (rng, level) => {
    let n: number;
    do n = rng.int(level === 1 ? 20 : 100, level === 1 ? 99 : level === 2 ? 400 : 1500);
    while (isPrime(n));
    const d = smallestDivisor(n);
    return {
      prompt: `Quel est le plus petit diviseur premier de $${n}$ ?`,
      answer: { kind: 'number', value: frac(d) },
      hint: 'Teste les nombres premiers dans l’ordre : 2, 3, 5, 7, 11, 13…',
      correction: [`$${n} = ${d} \\times ${n / d}$ et aucun nombre premier plus petit que $${d}$ ne divise $${n}$.`, `Le plus petit diviseur premier est $${d}$.`],
    };
  }),
  variant('compter-premiers', (rng, level) => {
    const a = rng.int(level === 1 ? 1 : 20, level === 1 ? 30 : 80);
    const b = a + (level === 1 ? 10 : level === 2 ? 15 : 25);
    const primes: number[] = [];
    for (let k = a; k <= b; k++) if (isPrime(k)) primes.push(k);
    return {
      prompt: `Combien y a-t-il de nombres premiers compris entre $${a}$ et $${b}$ (au sens large) ?`,
      answer: { kind: 'number', value: frac(primes.length) },
      hint: 'Élimine les pairs, les multiples de 3, de 5, de 7… puis compte ce qui reste.',
      correction: [primes.length ? `Les nombres premiers de cet intervalle sont $${primes.join(' ; ')}$.` : 'Aucun nombre de cet intervalle n’est premier.', `Il y en a $${primes.length}$.`],
    };
  }),
  variant('raisonnement-faux', (rng, level) => {
    // « Ni pair, ni multiple de 3 ou de 5 » ne suffit pas : 49, 77, 91, 119…
    const pieges = level === 1 ? [49, 77, 91, 119] : [49, 77, 91, 119, 121, 133, 143, 161, 169, 187, 203, 209, 221];
    const prime = rng.next() < 0.4;
    let n = rng.pick(pieges);
    if (prime) do n = rng.int(31, level === 1 ? 120 : 230);
    while (!isPrime(n));
    const d = smallestDivisor(n);
    return {
      prompt: `Lina affirme : « $${n}$ n'est divisible ni par 2, ni par 3, ni par 5, donc il est premier. » Le nombre $${n}$ est-il premier ?`,
      answer: fixedChoice(['Oui', 'Non'], prime ? 0 : 1),
      hint: 'Il faut tester tous les nombres premiers $p$ tels que $p^2 \\leq n$, pas seulement 2, 3 et 5.',
      correction: prime
        ? [`On teste aussi 7, 11, 13… jusqu'à $\\sqrt{${n}}$ : aucun ne divise $${n}$.`, `$${n}$ est bien premier, même si le raisonnement de Lina était incomplet.`]
        : [`$${n} = ${d} \\times ${n / d}$ : il fallait tester $${d}$ aussi.`, `$${n}$ n'est pas premier.`],
    };
  }),
];

const decompositionVariantes = [
  variant('recomposer', (rng, level) => {
    const primes = level === 1 ? [2, 3, 5] : [2, 3, 5, 7, 11];
    const f: [number, number][] = rng
      .shuffle(primes)
      .slice(0, level === 1 ? 2 : 3)
      .sort((x, y) => x - y)
      .map((p) => [p, rng.int(1, p > 5 ? 1 : level === 3 ? 3 : 2)]);
    const n = f.reduce((acc, [p, e]) => acc * p ** e, 1);
    return {
      prompt: `Quel nombre a pour décomposition en facteurs premiers $${factorLatex(f)}$ ?`,
      answer: { kind: 'number', value: frac(n) },
      hint: 'Calcule chaque puissance, puis multiplie.',
      correction: [`$${f.map(([p, e]) => `${p ** e}`).join(' \\times ')} = ${n}$`],
    };
  }),
  variant('exposant', (rng, level) => {
    const n = composite(rng, level === 1 ? 2 : 3);
    const f = factorize(n);
    const [p, e] = rng.pick(f);
    return {
      prompt: `Dans la décomposition en facteurs premiers de $${n}$, quel est l'exposant de $${p}$ ?`,
      answer: { kind: 'number', value: frac(e) },
      hint: `Divise $${n}$ par $${p}$ autant de fois que possible.`,
      correction: [`$${n} = ${factorLatex(f)}$`, `L'exposant de $${p}$ est $${e}$.`],
    };
  }),
  variant('carre-parfait', (rng, level) => {
    // n = m² × k : par quel plus petit entier multiplier n pour obtenir un carré ?
    const k = rng.pick(level === 1 ? [2, 3, 5] : [2, 3, 5, 6, 7, 10, 15]);
    const m = rng.int(2, level === 1 ? 6 : 12);
    const n = m * m * k;
    return {
      prompt: `Par quel plus petit entier positif faut-il multiplier $${n}$ pour obtenir le carré d'un entier ?`,
      answer: { kind: 'number', value: frac(k) },
      hint: 'Dans un carré, chaque facteur premier apparaît avec un exposant pair.',
      correction: [`$${n} = ${factorLatex(factorize(n))}$`, `Il manque $${k}$ pour que tous les exposants soient pairs : $${n} \\times ${k} = ${n * k} = ${m * k}^2$.`],
    };
  }),
];

const diviseursVariantes = [
  variant('rectangles', (rng, level) => {
    const n = level === 1 ? rng.pick([12, 18, 20, 24, 30, 36]) : composite(rng, 2);
    let count = 0;
    for (let d = 1; d * d <= n; d++) if (n % d === 0) count++;
    return {
      prompt: `On veut dessiner un rectangle d'aire $${n}$ carreaux, avec des côtés entiers (un rectangle $2 \\times 3$ et un rectangle $3 \\times 2$ comptent pour un seul). Combien de rectangles différents peut-on dessiner ?`,
      answer: { kind: 'number', value: frac(count) },
      hint: 'Les côtés forment une paire de diviseurs dont le produit vaut l’aire.',
      correction: [`Il faut $l \\times L = ${n}$ avec $l \\leq L$ : on cherche les diviseurs $l$ tels que $l^2 \\leq ${n}$.`, `On trouve $${count}$ rectangles.`],
    };
  }),
  variant('plus-grand-diviseur', (rng, level) => {
    const n = composite(rng, level);
    const d = n / smallestDivisor(n);
    return {
      prompt: `Quel est le plus grand diviseur de $${n}$ strictement plus petit que $${n}$ ?`,
      answer: { kind: 'number', value: frac(d) },
      hint: 'Le plus grand diviseur propre s’obtient en divisant par le plus petit diviseur premier.',
      correction: [`Le plus petit diviseur premier de $${n}$ est $${smallestDivisor(n)}$.`, `$${n} \\div ${smallestDivisor(n)} = ${d}$`],
    };
  }),
];

const irreductibleVariantes = [
  variant('est-irreductible', (rng, level) => {
    const bound = level === 1 ? 30 : level === 2 ? 90 : 300;
    const n = rng.int(2, bound);
    let d = rng.int(2, bound);
    if (d === n) d++;
    const g = gcd(n, d);
    return {
      prompt: `La fraction $\\frac{${n}}{${d}}$ est-elle irréductible ?`,
      answer: fixedChoice(['Oui', 'Non'], g === 1 ? 0 : 1),
      hint: 'Elle est irréductible si le numérateur et le dénominateur n’ont aucun diviseur commun autre que 1.',
      correction: g === 1 ? [`$${n}$ et $${d}$ n'ont pas de diviseur commun autre que 1.`, 'La fraction est irréductible.'] : [`$${n}$ et $${d}$ sont tous deux divisibles par $${g}$.`, `$\\frac{${n}}{${d}} = \\frac{${n / g}}{${d / g}}$ : elle n'est pas irréductible.`],
    };
  }),
  variant('completer', (rng, level) => {
    let p: number;
    let q: number;
    do {
      p = rng.int(1, level === 1 ? 7 : 12);
      q = rng.int(2, level === 1 ? 9 : 15);
    } while (gcd(p, q) !== 1);
    const k = rng.int(2, level === 3 ? 15 : 8);
    return {
      prompt: `Complète l'égalité $\\frac{${p}}{${q}} = \\frac{\\ldots}{${q * k}}$.`,
      answer: { kind: 'number', value: frac(p * k) },
      hint: 'On passe d’un dénominateur à l’autre en multipliant par le même nombre en haut et en bas.',
      correction: [`$${q * k} = ${q} \\times ${k}$, donc on multiplie aussi le numérateur par $${k}$.`, `$\\frac{${p}}{${q}} = \\frac{${p * k}}{${q * k}}$`],
    };
  }),
];

const resteVariantes = [
  variant('jour-semaine', (rng, level) => {
    const start = rng.int(0, 6);
    const n = rng.int(level === 1 ? 8 : 30, level === 1 ? 40 : level === 2 ? 200 : 1000);
    const end = (start + n) % 7;
    return {
      prompt: `Aujourd'hui, nous sommes ${JOURS[start]}. Quel jour serons-nous dans $${n}$ jours ?`,
      answer: fixedChoice(
        JOURS.map((j) => j[0].toUpperCase() + j.slice(1)),
        end,
      ),
      hint: 'Les jours reviennent tous les 7 jours : cherche le reste de la division par 7.',
      correction: [`$${n} = 7 \\times ${Math.floor(n / 7)} + ${n % 7}$`, `On avance de $${n % 7}$ jour${n % 7 > 1 ? 's' : ''} à partir du ${JOURS[start]} : ce sera ${JOURS[end]}.`],
    };
  }),
  variant('dividende', (rng, level) => {
    const b = rng.int(level === 1 ? 3 : 7, level === 1 ? 9 : 25);
    const q = rng.int(3, level === 1 ? 12 : 60);
    const r = rng.int(1, b - 1);
    return {
      prompt: `Dans une division euclidienne, le diviseur est $${b}$, le quotient $${q}$ et le reste $${r}$. Quel est le nombre divisé ?`,
      answer: { kind: 'number', value: frac(b * q + r) },
      hint: 'Écris l’égalité de la division euclidienne : $a = b \\times q + r$.',
      correction: [`$a = ${b} \\times ${q} + ${r} = ${b * q + r}$`],
    };
  }),
  variant('boites', (rng, level) => {
    const b = rng.pick(level === 1 ? [6, 10, 12] : [6, 8, 12, 15, 24]);
    const n = rng.int(3 * b, level === 1 ? 12 * b : 60 * b);
    const full = Math.floor(n / b);
    const pleines = rng.next() < 0.5;
    return {
      prompt: `On range $${n}$ œufs dans des boîtes de $${b}$. ${pleines ? 'Combien de boîtes pleines obtient-on ?' : 'Combien d’œufs reste-t-il une fois toutes les boîtes pleines remplies ?'}`,
      answer: { kind: 'number', value: frac(pleines ? full : n % b) },
      hint: `Écris la division euclidienne de $${n}$ par $${b}$.`,
      correction: [`$${n} = ${b} \\times ${full} + ${n % b}$`, pleines ? `On remplit $${full}$ boîtes.` : `Il reste $${n % b}$ œuf${n % b > 1 ? 's' : ''}.`],
    };
  }),
];

const pgcdVariantes = [
  variant('carrelage', (rng, level) => {
    const g = rng.pick(level === 1 ? [5, 10, 20] : [6, 12, 15, 18, 24, 30, 40]);
    let p: number;
    let q: number;
    do {
      p = rng.int(2, level === 3 ? 17 : 11);
      q = rng.int(2, level === 3 ? 17 : 11);
    } while (gcd(p, q) !== 1 || p === q);
    return {
      prompt: `Une terrasse rectangulaire mesure $${g * p}$ cm sur $${g * q}$ cm. On veut la couvrir de dalles carrées identiques, sans les couper, les plus grandes possibles. Quel est le côté d'une dalle, en cm ?`,
      answer: { kind: 'number', value: frac(g) },
      hint: 'Le côté doit diviser la longueur et la largeur : c’est leur plus grand diviseur commun.',
      correction: [`On cherche le plus grand diviseur commun de $${g * p}$ et $${g * q}$.`, `C'est $${g}$ : il faut $${p} \\times ${q} = ${p * q}$ dalles.`],
    };
  }),
  variant('direct', (rng, level) => {
    const g = rng.int(2, level === 1 ? 9 : 30);
    let p: number;
    let q: number;
    do {
      p = rng.int(2, level === 1 ? 9 : 20);
      q = rng.int(2, level === 1 ? 9 : 20);
    } while (gcd(p, q) !== 1 || p === q);
    return {
      prompt: `Quel est le plus grand diviseur commun de $${g * p}$ et $${g * q}$ ?`,
      answer: { kind: 'number', value: frac(g) },
      hint: 'Décompose les deux nombres en facteurs premiers et garde les facteurs communs.',
      correction: [`$${g * p} = ${factorLatex(factorize(g * p))}$ et $${g * q} = ${factorLatex(factorize(g * q))}$.`, `Leur plus grand diviseur commun est $${g}$.`],
    };
  }),
];

export const ARITHMETIQUE_SKILLS: Skill[] = [
  enrich(premier, premierVariantes),
  enrich(decomposition, decompositionVariantes),
  enrich(nbDiviseurs, diviseursVariantes),
  enrich(irreductible, irreductibleVariantes),
  enrich(reste, resteVariantes),
  enrich(pgcd, pgcdVariantes),
];
