import type { Skill } from '../types';
import { bezout, gcd, mod, num, skill } from './util';
import { enrichir } from '../licenceVariantes';
import { ARITHMETIQUE_VARIANTES } from './variantes/arithmetique';

/** Chapitre « Arithmétique dans ℤ » (Licence 1). */

const pgcd = skill('l1-pgcd', 'Calculer un PGCD ou un PPCM', (rng, level) => {
  const g = rng.int(2, level === 1 ? 9 : 15);
  let p = rng.int(2, 12);
  let q = rng.int(2, 12);
  while (gcd(p, q) !== 1 || p === q) [p, q] = [rng.int(2, 12), rng.int(2, 12)];
  const a = g * p;
  const b = g * q;
  if (level === 3)
    return {
      prompt: `Calcule $\\operatorname{ppcm}(${a}, ${b})$.`,
      answer: num((a * b) / g),
      hint: '$\\operatorname{pgcd}(a, b) \\times \\operatorname{ppcm}(a, b) = ab$.',
      correction: [`$\\operatorname{pgcd}(${a}, ${b}) = ${g}$`, `$\\operatorname{ppcm} = \\frac{${a}\\times${b}}{${g}} = ${(a * b) / g}$`],
    };
  const steps: string[] = [];
  let [x, y] = [Math.max(a, b), Math.min(a, b)];
  while (y) {
    steps.push(`$${x} = ${Math.floor(x / y)}\\times${y} + ${x % y}$`);
    [x, y] = [y, x % y];
  }
  return {
    prompt: `Calcule $\\operatorname{pgcd}(${a}, ${b})$.`,
    answer: num(g),
    hint: 'Algorithme d’Euclide : $\\operatorname{pgcd}(a, b) = \\operatorname{pgcd}(b, r)$ où $r$ est le reste de $a$ par $b$.',
    correction: [...steps, `Le dernier reste non nul est $${g}$.`],
  };
});

const inverseModulaire = skill('l1-inverse-modulaire', 'Trouver un inverse modulo n', (rng, level) => {
  const n = rng.pick(level === 1 ? [5, 7, 11] : level === 2 ? [9, 13, 17, 19] : [23, 26, 29, 31, 37]);
  let a = rng.int(2, n - 1);
  while (gcd(a, n) !== 1) a = rng.int(2, n - 1);
  const [u] = bezout(a, n);
  const inv = mod(u, n);
  return {
    prompt: `Trouve l’entier $x \\in \\{0, \\dots, ${n - 1}\\}$ tel que $${a}x \\equiv 1 \\pmod{${n}}$.`,
    answer: num(inv),
    hint: 'Cherche une relation de Bézout $au + nv = 1$ : $u$ est un inverse de $a$ modulo $n$.',
    correction: [`$${a}\\times${inv} = ${a * inv} = ${Math.floor((a * inv) / n)}\\times${n} + 1$`, `Donc $x = ${inv}$.`],
  };
});

const bezoutSkill = skill('l1-bezout', 'Résoudre une équation de Bézout', (rng, level) => {
  let a = rng.int(5, level === 1 ? 20 : 40);
  let b = rng.int(5, level === 1 ? 20 : 40);
  while (gcd(a, b) !== 1 || a === b) [a, b] = [rng.int(5, 40), rng.int(5, 40)];
  const c = level === 3 ? rng.int(2, 6) : 1;
  const [u] = bezout(a, b);
  const u0 = mod(u * c, b);
  const v0 = (c - a * u0) / b;
  return {
    prompt: `On cherche des entiers $u, v$ tels que $${a}u + ${b}v = ${c}$. Donne la seule solution $u$ comprise entre $0$ et $${b - 1}$.`,
    answer: num(u0),
    hint: 'Remonte l’algorithme d’Euclide pour écrire $1$ comme combinaison de $a$ et $b$, puis ajuste $u$ modulo $b$.',
    correction: [`$${a}\\times${u0} + ${b}\\times${v0 < 0 ? `(${v0})` : v0} = ${c}$`, `Les solutions en $u$ sont $${u0} + ${b}k$ : la seule entre $0$ et $${b - 1}$ est $${u0}$.`],
  };
});

function powMod(a: number, k: number, n: number): number {
  let r = 1;
  let b = mod(a, n);
  while (k > 0) {
    if (k & 1) r = (r * b) % n;
    b = (b * b) % n;
    k >>= 1;
  }
  return r;
}

const congruence = skill('l1-congruences', 'Calculer un reste avec les congruences', (rng, level) => {
  const n = rng.pick(level === 1 ? [3, 4, 5, 9, 10] : [7, 11, 13]);
  let a = rng.int(2, 30) + (level === 3 ? 100 : 0);
  // Ni multiple de n, ni congru à 1 : le calcul serait immédiat.
  while (mod(a, n) <= 1) a++;
  const k = level === 1 ? rng.int(10, 50) : rng.int(50, 2026);
  const r = powMod(a, k, n);
  // Période de a modulo n, pour la correction.
  let period = 1;
  while (powMod(a, period, n) !== 1 && period <= n) period++;
  const cyclic = powMod(a, period, n) === 1;
  return {
    prompt: `Quel est le reste de la division euclidienne de $${a}^{${k}}$ par $${n}$ ?`,
    answer: num(r),
    hint: 'Réduis d’abord $a$ modulo $n$, puis cherche une puissance qui vaut $1$ modulo $n$.',
    correction: cyclic
      ? [`$${a} \\equiv ${mod(a, n)} \\pmod{${n}}$ et $${mod(a, n)}^{${period}} \\equiv 1 \\pmod{${n}}$.`, `$${k} = ${Math.floor(k / period)}\\times${period} + ${k % period}$, donc $${a}^{${k}} \\equiv ${mod(a, n)}^{${k % period}} \\equiv ${r} \\pmod{${n}}$.`]
      : [`$${a} \\equiv ${mod(a, n)} \\pmod{${n}}$, et les puissances finissent par valoir $${r}$ modulo $${n}$.`],
  };
});

const PRIMES = [2, 3, 5, 7, 11];

const diviseurs = skill('l1-diviseurs', 'Compter les diviseurs d’un entier', (rng, level) => {
  const ps = rng.shuffle(PRIMES).slice(0, level === 1 ? 2 : 3).sort((a, b) => a - b);
  const exps = ps.map(() => rng.int(1, level === 3 ? 4 : 3));
  const n = ps.reduce((s, p, i) => s * p ** exps[i], 1);
  const count = exps.reduce((s, e) => s * (e + 1), 1);
  const facto = ps.map((p, i) => (exps[i] === 1 ? `${p}` : `${p}^{${exps[i]}}`)).join('\\times');
  return {
    prompt: `Combien l’entier $${n}$ a-t-il de diviseurs positifs ?`,
    answer: num(count),
    hint: 'Si $n = p_1^{a_1}\\cdots p_k^{a_k}$, alors $n$ a $(a_1 + 1)\\cdots(a_k + 1)$ diviseurs positifs.',
    correction: [`$${n} = ${facto}$`, `Nombre de diviseurs : $${exps.map((e) => `(${e} + 1)`).join('')} = ${count}$`],
  };
});

const valuation = skill('l1-valuation', 'Calculer une valuation p-adique', (rng, level) => {
  const p = rng.pick(level === 1 ? [2, 3] : [2, 3, 5]);
  if (level === 1) {
    const e = rng.int(1, 6);
    let m = rng.int(1, 30);
    while (m % p === 0) m++;
    return {
      prompt: `Quel est l’exposant de $${p}$ dans la décomposition en facteurs premiers de $${p ** e * m}$ ?`,
      answer: num(e),
      hint: `Divise par $${p}$ tant que c’est possible.`,
      correction: [`$${p ** e * m} = ${p}^{${e}}\\times${m}$ et $${p}$ ne divise pas $${m}$.`],
    };
  }
  const n = rng.int(10, level === 2 ? 30 : 100);
  const terms: number[] = [];
  for (let q = p; q <= n; q *= p) terms.push(Math.floor(n / q));
  const v = terms.reduce((s, t) => s + t, 0);
  return {
    prompt: `Quel est l’exposant de $${p}$ dans la décomposition en facteurs premiers de $${n}!$ ?`,
    answer: num(v),
    hint: `Formule de Legendre : $v_p(n!) = \\lfloor n/p \\rfloor + \\lfloor n/p^2 \\rfloor + \\cdots$`,
    correction: [`$${terms.map((_, i) => `\\lfloor ${n}/${p ** (i + 1)} \\rfloor`).join(' + ')} = ${terms.join(' + ')} = ${v}$`],
  };
});

export const ARITHMETIQUE_SKILLS: Skill[] = enrichir([pgcd, congruence, diviseurs, inverseModulaire, bezoutSkill, valuation], ARITHMETIQUE_VARIANTES);
