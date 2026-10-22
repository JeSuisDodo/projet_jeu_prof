import type { Rng } from '../rng';
import type { Skill } from '../types';
import { divisors, fixedChoice, gcd, lcm, makeChoiceNum, num, phi, skill } from './util';

/** Chapitre « Groupes » (Licence 3). */

/** Permutation aléatoire de {1, …, n} découpée en cycles disjoints (les points fixes sont omis). */
function randomCycles(rng: Rng, n: number): number[][] {
  const perm = rng.shuffle(Array.from({ length: n }, (_, i) => i + 1));
  const cycles: number[][] = [];
  let i = 0;
  while (i < n) {
    const len = Math.min(n - i, rng.int(1, 4));
    cycles.push(perm.slice(i, i + len));
    i += len;
  }
  return cycles;
}

const cycleTex = (cycles: number[][]) =>
  cycles
    .filter((c) => c.length > 1)
    .map((c) => `(${c.join('\\ ')})`)
    .join('') || '\\mathrm{id}';

/** Écriture en deux lignes d'une permutation donnée par ses cycles. */
function twoLines(cycles: number[][], n: number): string {
  const img = Array.from({ length: n + 1 }, (_, i) => i);
  for (const c of cycles) c.forEach((x, i) => (img[x] = c[(i + 1) % c.length]));
  const top = Array.from({ length: n }, (_, i) => i + 1);
  return `\\begin{pmatrix} ${top.join(' & ')} \\\\ ${top.map((x) => img[x]).join(' & ')} \\end{pmatrix}`;
}

const ordreZn = skill('l3-ordre-zn', 'Trouver l’ordre d’un élément de $\\mathbb{Z}/n\\mathbb{Z}$', (rng, level) => {
  const n = rng.pick(level === 1 ? [6, 8, 10, 12] : level === 2 ? [12, 15, 18, 20, 24] : [24, 30, 36, 42, 45, 60]);
  const a = rng.int(1, n - 1);
  const d = gcd(a, n);
  return {
    prompt: `Quel est l’ordre de $\\bar{${a}}$ dans le groupe additif $\\mathbb{Z}/${n}\\mathbb{Z}$ ?`,
    answer: num(n / d),
    hint: 'L’ordre de $\\bar a$ dans $\\mathbb{Z}/n\\mathbb{Z}$ est $\\frac{n}{\\operatorname{pgcd}(a, n)}$.',
    correction: [`$\\operatorname{pgcd}(${a}, ${n}) = ${d}$`, `Ordre : $\\frac{${n}}{${d}} = ${n / d}$`],
  };
});

const ordrePermutation = skill('l3-ordre-permutation', 'Trouver l’ordre d’une permutation', (rng, level) => {
  const n = level === 1 ? rng.int(4, 6) : rng.int(6, 9);
  let cycles = randomCycles(rng, n);
  while (cycles.every((c) => c.length === 1)) cycles = randomCycles(rng, n);
  const order = cycles.reduce((m, c) => lcm(m, c.length), 1);
  const lens = cycles.filter((c) => c.length > 1).map((c) => c.length);
  return {
    prompt: `Quel est l’ordre de $\\sigma = ${level === 3 ? twoLines(cycles, n) : cycleTex(cycles)}$ dans $\\mathfrak{S}_{${n}}$ ?`,
    answer: num(order),
    hint: `${level === 3 ? 'Décompose d’abord $\\sigma$ en cycles disjoints. ' : ''}L’ordre est le PPCM des longueurs des cycles disjoints.`,
    correction: [
      ...(level === 3 ? [`$\\sigma = ${cycleTex(cycles)}$`] : []),
      `Longueurs des cycles : ${lens.join(', ')}.`,
      `Ordre : $\\operatorname{ppcm}(${lens.join(', ')}) = ${order}$`,
    ],
  };
});

const signature = skill('l3-signature', 'Calculer une signature', (rng, level) => {
  const n = rng.int(4, 8);
  let cycles = randomCycles(rng, n);
  while (cycles.every((c) => c.length === 1)) cycles = randomCycles(rng, n);
  const lens = cycles.filter((c) => c.length > 1).map((c) => c.length);
  const transpositions = lens.reduce((s, k) => s + k - 1, 0);
  const eps = transpositions % 2 === 0 ? 1 : -1;
  return {
    prompt: `Quelle est la signature de $\\sigma = ${level === 3 ? twoLines(cycles, n) : cycleTex(cycles)}$ ? (Réponds $1$ ou $-1$.)`,
    answer: num(eps),
    hint: 'Un cycle de longueur $k$ est un produit de $k - 1$ transpositions, de signature $(-1)^{k-1}$.',
    correction: [
      ...(level === 3 ? [`$\\sigma = ${cycleTex(cycles)}$`] : []),
      `Nombre de transpositions : $${lens.length > 1 ? `${lens.map((k) => k - 1).join(' + ')} = ` : ''}${transpositions}$.`,
      `$\\varepsilon(\\sigma) = (-1)^{${transpositions}} = ${eps}$`,
    ],
  };
});

const generateurs = skill('l3-generateurs-cycliques', 'Compter les générateurs d’un groupe cyclique', (rng, level) => {
  const n = rng.pick(level === 1 ? [5, 6, 7, 8, 9, 10] : level === 2 ? [12, 14, 15, 16, 18, 20] : [24, 30, 36, 40, 45, 60]);
  const count = phi(n);
  return {
    prompt: `Combien le groupe cyclique $\\mathbb{Z}/${n}\\mathbb{Z}$ a-t-il de générateurs ?`,
    answer: num(count),
    hint: '$\\bar a$ engendre $\\mathbb{Z}/n\\mathbb{Z}$ si et seulement si $\\operatorname{pgcd}(a, n) = 1$ : il y en a $\\varphi(n)$.',
    correction: [`$\\varphi(${n}) = ${count}$ : c’est le nombre d’entiers de $1$ à $${n}$ premiers avec $${n}$.`],
  };
});

const lagrange = skill('l3-lagrange', 'Utiliser le théorème de Lagrange', (rng, level) => {
  const n = rng.pick(level === 1 ? [12, 18, 20] : level === 2 ? [24, 30, 36, 40] : [48, 60, 72, 84]);
  const divs = divisors(n).filter((d) => d > 1);
  const nonDivs = Array.from({ length: n - 2 }, (_, i) => i + 2).filter((d) => n % d !== 0 && d < n);
  const wrong = rng.pick(nonDivs);
  return {
    prompt: `$G$ est un groupe d’ordre $${n}$. Lequel de ces nombres ne peut pas être l’ordre d’un sous-groupe de $G$ ?`,
    answer: makeChoiceNum(rng, wrong, rng.shuffle(divs).slice(0, 3)),
    hint: 'Théorème de Lagrange : l’ordre d’un sous-groupe divise l’ordre du groupe.',
    correction: [`$${wrong}$ ne divise pas $${n}$ : aucun sous-groupe ne peut avoir cet ordre.`],
  };
});

const produit = skill('l3-groupe-produit', 'Étudier un produit de groupes cycliques', (rng, level) => {
  const m = rng.int(2, 9);
  const n = rng.int(2, 9);
  if (level === 3) {
    const cyclic = gcd(m, n) === 1;
    return {
      prompt: `Le groupe $\\mathbb{Z}/${m}\\mathbb{Z} \\times \\mathbb{Z}/${n}\\mathbb{Z}$ est-il cyclique ?`,
      answer: fixedChoice(['Oui', 'Non'], cyclic ? 0 : 1),
      hint: 'Lemme chinois : $\\mathbb{Z}/m \\times \\mathbb{Z}/n \\simeq \\mathbb{Z}/mn$ si et seulement si $\\operatorname{pgcd}(m, n) = 1$.',
      correction: [`$\\operatorname{pgcd}(${m}, ${n}) = ${gcd(m, n)}$`, cyclic ? `Il est isomorphe à $\\mathbb{Z}/${m * n}\\mathbb{Z}$ : cyclique.` : `Tout élément est d’ordre au plus $\\operatorname{ppcm}(${m}, ${n}) = ${lcm(m, n)} < ${m * n}$ : pas cyclique.`],
    };
  }
  const a = rng.int(1, m - 1);
  const b = rng.int(level === 1 ? 0 : 1, n - 1);
  const oa = m / gcd(a, m);
  const ob = n / gcd(b, n);
  const order = lcm(oa, ob);
  return {
    prompt: `Quel est l’ordre de $(\\bar{${a}}, \\bar{${b}})$ dans $\\mathbb{Z}/${m}\\mathbb{Z} \\times \\mathbb{Z}/${n}\\mathbb{Z}$ ?`,
    answer: num(order),
    hint: 'L’ordre d’un couple est le PPCM des ordres de ses composantes.',
    correction: [`Ordre de $\\bar{${a}}$ : $${oa}$ ; ordre de $\\bar{${b}}$ : $${ob}$.`, `Ordre du couple : $\\operatorname{ppcm}(${oa}, ${ob}) = ${order}$`],
  };
});

export const GROUPES_SKILLS: Skill[] = [ordreZn, ordrePermutation, signature, generateurs, lagrange, produit];
