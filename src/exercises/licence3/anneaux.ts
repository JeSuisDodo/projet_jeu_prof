import type { Skill } from '../types';
import { combo, fixedChoice, gcd, lcm, mod, modInverse, num, phi, skill } from './util';

/** Chapitre « Anneaux et corps » (Licence 3). */

const PREMIERS = [5, 7, 11, 13, 17, 19, 23];

const inverse = skill('l3-inverse-modulaire', 'Calculer un inverse modulaire', (rng, level) => {
  const n = level === 1 ? rng.pick([5, 7, 11]) : level === 2 ? rng.pick([13, 17, 19, 23]) : rng.pick([20, 21, 26, 27, 28, 33, 35]);
  let a = rng.int(2, n - 1);
  while (gcd(a, n) !== 1) a = rng.int(2, n - 1);
  const inv = modInverse(a, n);
  return {
    prompt: `Donne l’inverse de $\\bar{${a}}$ dans $\\mathbb{Z}/${n}\\mathbb{Z}$ (un entier entre $0$ et $${n - 1}$).`,
    answer: num(inv),
    hint: `Cherche $u$ tel que $${a}u \\equiv 1 \\pmod{${n}}$ (relation de Bézout ou essais successifs).`,
    correction: [`$${a}\\times ${inv} = ${a * inv} = ${Math.floor((a * inv) / n)}\\times ${n} + 1$`, `Donc $\\bar{${a}}^{-1} = \\bar{${inv}}$.`],
  };
});

const euler = skill('l3-indicatrice-euler', 'Calculer l’indicatrice d’Euler', (rng, level) => {
  const n = rng.pick(level === 1 ? [7, 9, 10, 12, 13] : level === 2 ? [15, 16, 18, 20, 21, 25, 27] : [36, 45, 48, 60, 72, 84, 100]);
  const value = phi(n);
  return {
    prompt: `Combien d’éléments inversibles l’anneau $\\mathbb{Z}/${n}\\mathbb{Z}$ possède-t-il ?`,
    answer: num(value),
    hint: '$\\bar a$ est inversible si et seulement si $\\operatorname{pgcd}(a, n) = 1$ ; $\\varphi(n) = n\\prod_{p \\mid n}\\left(1 - \\frac{1}{p}\\right)$.',
    correction: [`$\\varphi(${n}) = ${value}$`],
  };
});

const chinois = skill('l3-restes-chinois', 'Résoudre un système de congruences', (rng, level) => {
  const pairs = level === 1 ? [[2, 3], [3, 4], [2, 5], [3, 5]] : level === 2 ? [[4, 5], [5, 7], [3, 7], [4, 9]] : [[7, 9], [8, 9], [5, 11], [7, 10]];
  const [m, n] = rng.pick(pairs);
  const x = rng.int(0, m * n - 1);
  const a = x % m;
  const b = x % n;
  return {
    prompt: `Trouve le plus petit entier $x \\geq 0$ tel que $x \\equiv ${a} \\pmod{${m}}$ et $x \\equiv ${b} \\pmod{${n}}$.`,
    answer: num(x),
    hint: `Lemme chinois : $${m}$ et $${n}$ sont premiers entre eux, il y a une unique solution modulo $${m * n}$.`,
    correction: [`Les entiers $\\equiv ${b} \\pmod{${n}}$ : $${[0, 1, 2, 3].map((k) => b + k * n).join(', ')}, \\dots$`, `Le premier qui vaut $${a}$ modulo $${m}$ est $${x}$.`],
  };
});

const ideaux = skill('l3-ideaux-z', 'Calculer avec les idéaux de $\\mathbb{Z}$', (rng, level) => {
  const g = rng.int(2, 6);
  const a = g * rng.int(2, 7);
  let b = g * rng.int(2, 7);
  if (b === a) b += g;
  const sum = level === 1 || (level === 2 && rng.next() < 0.5);
  const value = sum ? gcd(a, b) : lcm(a, b);
  return {
    prompt: `$${a}\\mathbb{Z} ${sum ? '+' : '\\cap'} ${b}\\mathbb{Z} = d\\mathbb{Z}$ avec $d > 0$. Donne $d$.`,
    answer: num(value),
    hint: sum ? 'La somme de deux idéaux de $\\mathbb{Z}$ est engendrée par le PGCD (Bézout).' : 'L’intersection de deux idéaux de $\\mathbb{Z}$ est engendrée par le PPCM.',
    correction: [`$d = \\operatorname{${sum ? 'pgcd' : 'ppcm'}}(${a}, ${b}) = ${value}$`],
  };
});

const racines = skill('l3-racines-fp', 'Chercher les racines d’un polynôme dans $\\mathbb{F}_p$', (rng, level) => {
  const p = level === 1 ? rng.pick([5, 7]) : rng.pick(PREMIERS);
  const b = rng.int(0, p - 1);
  const c = rng.int(1, p - 1);
  const roots = Array.from({ length: p }, (_, x) => x).filter((x) => mod(x * x + b * x + c, p) === 0);
  const P = combo([
    [1, 'X^2'],
    [b, 'X'],
    [c, ''],
  ]);
  if (level === 3) {
    const irreducible = roots.length === 0;
    return {
      prompt: `Le polynôme $${P}$ est-il irréductible dans $\\mathbb{F}_{${p}}[X]$ ?`,
      answer: fixedChoice(['Oui', 'Non'], irreducible ? 0 : 1),
      hint: 'Un polynôme de degré $2$ est irréductible sur un corps si et seulement s’il n’a pas de racine.',
      correction: [irreducible ? `Aucun élément de $\\mathbb{F}_{${p}}$ n’annule $${P}$ : il est irréductible.` : `$${roots[0]}$ est racine dans $\\mathbb{F}_{${p}}$ : le polynôme est réductible.`],
    };
  }
  return {
    prompt: `Combien le polynôme $${P}$ a-t-il de racines dans $\\mathbb{F}_{${p}}$ ?`,
    answer: num(roots.length),
    hint: `Teste les ${p} éléments, ou calcule le discriminant et regarde si c’est un carré modulo ${p}.`,
    correction: [roots.length ? `Racines : $${roots.join('$, $')}$.` : 'Aucune valeur ne l’annule.', `Il y a $${roots.length}$ racine${roots.length > 1 ? 's' : ''}.`],
  };
});

const corpsFini = skill('l3-corps-fini', 'Décrire un corps fini', (rng, level) => {
  const p = rng.pick([2, 3, 5, 7]);
  const d = rng.int(2, p === 2 ? 4 : 3);
  const q = p ** d;
  if (level === 1) {
    return {
      prompt: `$P \\in \\mathbb{F}_{${p}}[X]$ est irréductible de degré $${d}$. Combien d’éléments le corps $\\mathbb{F}_{${p}}[X]/(P)$ a-t-il ?`,
      answer: num(q),
      hint: 'Ses éléments sont les restes de la division par $P$ : des polynômes de degré $< d$.',
      correction: [`Il y a $${p}$ choix pour chacun des $${d}$ coefficients : $${p}^{${d}} = ${q}$ éléments.`],
    };
  }
  if (level === 2) {
    return {
      prompt: `Quel est l’ordre du groupe multiplicatif $\\mathbb{F}_{${q}}^{*}$ ?`,
      answer: num(q - 1),
      hint: 'Tous les éléments non nuls d’un corps sont inversibles.',
      correction: [`$|\\mathbb{F}_{${q}}^{*}| = ${q} - 1 = ${q - 1}$ (ce groupe est cyclique).`],
    };
  }
  const e = rng.pick([4, 6, 8, 9, 12]);
  const subs = Array.from({ length: e }, (_, i) => i + 1).filter((k) => e % k === 0);
  return {
    prompt: `Combien le corps $\\mathbb{F}_{${p}^{${e}}}$ a-t-il de sous-corps ?`,
    answer: num(subs.length),
    hint: '$\\mathbb{F}_{p^k}$ est un sous-corps de $\\mathbb{F}_{p^d}$ si et seulement si $k$ divise $d$.',
    correction: [`Diviseurs de $${e}$ : $${subs.join('$, $')}$.`, `Il y a $${subs.length}$ sous-corps.`],
  };
});

export const ANNEAUX_SKILLS: Skill[] = [inverse, euler, chinois, ideaux, racines, corpsFini];
