import { type Fait, type Variantes, vraiFaux, vraiFauxBanque } from '../../licenceVariantes';
import { binom, fixedChoice, gcd, mod, num, setOf, setTex } from '../util';

/** Variantes du chapitre « Arithmétique dans ℤ » (feuille bibmath « Arithmétique »). */

const lcm = (a: number, b: number) => (a / gcd(a, b)) * b;
const divisorsOf = (n: number) => Array.from({ length: n }, (_, i) => i + 1).filter((d) => n % d === 0);
const powMod = (a: number, k: number, n: number) => {
  let r = 1 % n;
  let b = mod(a, n);
  while (k > 0) {
    if (k & 1) r = (r * b) % n;
    b = (b * b) % n;
    k >>= 1;
  }
  return r;
};
const coprimePair = (rng: { int: (a: number, b: number) => number }, lo: number, hi: number) => {
  let p = rng.int(lo, hi);
  let q = rng.int(lo, hi);
  while (gcd(p, q) !== 1 || p === q) [p, q] = [rng.int(lo, hi), rng.int(lo, hi)];
  return [p, q];
};
/** « 3n - 5 », « n + 2 », « n ». */
const lin = (k: number, c: number) => `${k === 1 ? '' : k}n${c === 0 ? '' : ` ${c < 0 ? '-' : '+'} ${Math.abs(c)}`}`;
const DAYS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

const VALUATIONS: Fait[] = [
  { s: '$v_p(ab) = v_p(a) + v_p(b)$ pour tous entiers $a, b$ non nuls.', v: true, why: 'Les exposants de $p$ s’additionnent dans un produit.' },
  { s: '$v_p(a + b) = v_p(a) + v_p(b)$ pour tous entiers $a, b$ non nuls.', v: false, why: 'Avec $p = 2$ : $v_2(1 + 1) = 1$ alors que $v_2(1) + v_2(1) = 0$.' },
  { s: '$v_p(a + b) \\geq \\min(v_p(a), v_p(b))$ quand $a + b \\neq 0$.', v: true, why: '$p^{\\min}$ divise $a$ et $b$, donc leur somme.' },
  { s: '$a$ divise $b$ si et seulement si $v_p(a) \\leq v_p(b)$ pour tout premier $p$.', v: true, why: 'C’est la lecture de la divisibilité sur les décompositions en facteurs premiers (pour $a, b > 0$).' },
  { s: '$v_p(\\operatorname{pgcd}(a, b)) = \\max(v_p(a), v_p(b))$.', v: false, why: 'C’est le minimum pour le pgcd ; le maximum correspond au ppcm.' },
  { s: '$n$ est un carré parfait si et seulement si toutes ses valuations sont paires.', v: true, why: '$n = m^2$ double tous les exposants, et réciproquement.' },
];

export const ARITHMETIQUE_VARIANTES: Variantes = {
  'l1-pgcd': [
    // Problèmes concrets : carrelage (pgcd) et phares (ppcm).
    (rng, level) => {
      const g = rng.int(2, level === 1 ? 8 : 15);
      const [p, q] = coprimePair(rng, 2, 9);
      const [a, b] = [g * p, g * q];
      if (rng.next() < 0.5)
        return {
          prompt: `On veut carreler une pièce rectangulaire de $${a}$ dm sur $${b}$ dm avec des dalles carrées identiques, sans découpe, les plus grandes possible. Quel est le côté d’une dalle (en dm) ?`,
          answer: num(g),
          hint: 'Le côté doit diviser les deux dimensions : c’est un diviseur commun, le plus grand possible.',
          correction: [`$\\operatorname{pgcd}(${a}, ${b}) = ${g}$ : dalles de $${g}$ dm (il en faut $${p * q}$).`],
        };
      return {
        prompt: `Deux phares s’allument ensemble à minuit. L’un clignote toutes les $${a}$ secondes, l’autre toutes les $${b}$ secondes. Au bout de combien de secondes s’allumeront-ils de nouveau ensemble ?`,
        answer: num(lcm(a, b)),
        hint: 'Le moment cherché est un multiple commun des deux périodes, le plus petit possible.',
        correction: [`$\\operatorname{ppcm}(${a}, ${b}) = \\frac{${a} \\times ${b}}{\\operatorname{pgcd}(${a}, ${b})} = \\frac{${a * b}}{${g}} = ${lcm(a, b)}$`],
      };
    },
    // Question inverse : pgcd et ppcm connus.
    (rng) => {
      const g = rng.int(2, 12);
      const [p, q] = coprimePair(rng, 2, 9);
      const [a, b] = [g * p, g * q];
      return {
        prompt: `Deux entiers positifs ont pour pgcd $${g}$ et pour ppcm $${g * p * q}$. L’un vaut $${a}$ : combien vaut l’autre ?`,
        answer: num(b),
        hint: '$\\operatorname{pgcd}(a, b) \\times \\operatorname{ppcm}(a, b) = ab$.',
        correction: [`$b = \\frac{${g} \\times ${g * p * q}}{${a}} = ${b}$`],
      };
    },
    // pgcd de deux entiers consécutifs d'une forme donnée.
    (rng) => {
      const k = rng.int(2, 9);
      const n = rng.int(5, 60);
      const a = k * n + 1;
      const b = k * (n + 1) + 1;
      return {
        prompt: `Calcule $\\operatorname{pgcd}(${a}, ${b})$ (ce sont les valeurs de $${k}m + 1$ pour $m = ${n}$ et $m = ${n + 1}$).`,
        answer: num(gcd(a, b)),
        hint: 'Un diviseur commun divise aussi la différence des deux nombres.',
        correction: [`Un diviseur commun divise $${b} - ${a} = ${k}$, et aussi $${a} = ${k}\\times${n} + 1$, donc il divise $1$.`, `Le pgcd vaut $${gcd(a, b)}$.`],
      };
    },
  ],
  'l1-inverse-modulaire': [
    // Équation ax ≡ b mod n.
    (rng, level) => {
      const n = rng.pick(level === 1 ? [5, 7, 11] : [13, 17, 19, 23]);
      let a = rng.int(2, n - 1);
      while (gcd(a, n) !== 1) a = rng.int(2, n - 1);
      const b = rng.int(1, n - 1);
      let inv = 1;
      while ((a * inv) % n !== 1) inv++;
      const x = (inv * b) % n;
      return {
        prompt: `Trouve l’entier $x \\in \\{0, \\dots, ${n - 1}\\}$ tel que $${a}x \\equiv ${b} \\pmod{${n}}$.`,
        answer: num(x),
        hint: `Multiplie les deux membres par l’inverse de $${a}$ modulo $${n}$.`,
        correction: [`$${a} \\times ${inv} = ${a * inv} \\equiv 1 \\pmod{${n}}$`, `$x \\equiv ${inv} \\times ${b} = ${inv * b} \\equiv ${x} \\pmod{${n}}$`],
      };
    },
    // Inversible ou non ?
    (rng) => {
      const n = rng.pick([12, 14, 15, 18, 20, 21, 24, 25, 26, 27]);
      const a = rng.int(2, n - 1);
      const g = gcd(a, n);
      return vraiFaux(`$${a}$ est inversible modulo $${n}$.`, g === 1, [g === 1 ? `$\\operatorname{pgcd}(${a}, ${n}) = 1$ : par Bézout, $${a}$ est inversible.` : `$\\operatorname{pgcd}(${a}, ${n}) = ${g} \\neq 1$ : $${a}$ n’est pas inversible.`], '$a$ est inversible modulo $n$ si et seulement si $\\operatorname{pgcd}(a, n) = 1$.');
    },
    // Nombre d'inversibles (indicatrice d'Euler).
    (rng, level) => {
      const n = rng.int(level === 1 ? 6 : 10, level === 1 ? 12 : 30);
      const inv = Array.from({ length: n }, (_, i) => i).filter((k) => gcd(k, n) === 1);
      return {
        prompt: `Combien d’éléments de $\\{0, 1, \\dots, ${n - 1}\\}$ sont inversibles modulo $${n}$ ?`,
        answer: num(inv.length),
        hint: 'Compte les entiers premiers avec $n$ (c’est l’indicatrice d’Euler $\\varphi(n)$).',
        correction: [`Les inversibles sont $${setTex(inv)}$ : il y en a $${inv.length}$.`],
      };
    },
  ],
  'l1-bezout': [
    // L'équation a-t-elle des solutions ?
    (rng) => {
      const g = rng.int(2, 6);
      const [p, q] = coprimePair(rng, 2, 9);
      const [a, b] = [g * p, g * q];
      const c = rng.int(5, 60);
      return vraiFaux(`L’équation $${a}x + ${b}y = ${c}$ a des solutions entières.`, c % g === 0, [`$\\operatorname{pgcd}(${a}, ${b}) = ${g}$, qui ${c % g === 0 ? 'divise' : 'ne divise pas'} $${c}$.`], '$ax + by = c$ a des solutions entières si et seulement si $\\operatorname{pgcd}(a, b)$ divise $c$.');
    },
    // Restes chinois concrets.
    (rng, level) => {
      const [m1, m2] = level === 1 ? rng.pick([[3, 5], [4, 5], [3, 7]]) : coprimePair(rng, 5, 17);
      const r1 = rng.int(0, m1 - 1);
      const r2 = rng.int(0, m2 - 1);
      let N = 1;
      while (N % m1 !== r1 || N % m2 !== r2) N++;
      return {
        prompt: `Une bibliothécaire range ses livres : par piles de $${m1}$, il en reste $${r1}$ ; par piles de $${m2}$, il en reste $${r2}$. Quel est le plus petit nombre (non nul) de livres possible ?`,
        answer: num(N),
        hint: `On cherche $N \\equiv ${r1} \\pmod{${m1}}$ et $N \\equiv ${r2} \\pmod{${m2}}$ : écris $N = ${r1} + ${m1}k$ et résous en $k$.`,
        correction: [`Les solutions sont congrues modulo $${m1 * m2}$ (restes chinois).`, `La plus petite solution non nulle est $${N}$.`],
      };
    },
    // Nombre de solutions dans ℕ².
    (rng) => {
      const [a, b] = coprimePair(rng, 2, 7);
      const c = rng.int(a * b, 6 * a * b);
      const sols: [number, number][] = [];
      for (let x = 0; a * x <= c; x++) if ((c - a * x) % b === 0) sols.push([x, (c - a * x) / b]);
      return {
        prompt: `Combien de couples $(x, y)$ d’entiers naturels vérifient $${a}x + ${b}y = ${c}$ ?`,
        answer: num(sols.length),
        hint: 'Trouve une solution, puis les autres en ajoutant des multiples de $(b, -a)$, en restant positif.',
        correction: [sols.length ? `Les solutions sont $${sols.map(([x, y]) => `(${x}, ${y})`).join(', ')}$.` : 'Aucun couple ne convient.', `Il y en a $${sols.length}$.`],
      };
    },
  ],
  'l1-congruences': [
    // Dernier chiffre d'une puissance.
    (rng, level) => {
      const a = rng.int(2, level === 1 ? 9 : 99);
      const k = rng.int(10, 3000);
      const last = powMod(a, k, 10);
      return {
        prompt: `Quel est le chiffre des unités de $${a}^{${k}}$ ?`,
        answer: num(last),
        hint: 'C’est le reste modulo $10$ : les puissances de $a$ modulo $10$ sont périodiques.',
        correction: [`On cherche $${a}^{${k}} \\bmod 10$ : on trouve $${last}$.`],
      };
    },
    // Jour de la semaine.
    (rng) => {
      const start = rng.int(0, 6);
      const base = rng.pick([2, 3, 10]);
      const k = rng.int(5, 40);
      const shift = powMod(base, k, 7);
      const day = (start + shift) % 7;
      return {
        prompt: `Nous sommes ${DAYS[start]}. Quel jour de la semaine serons-nous dans $${base}^{${k}}$ jours ?`,
        answer: fixedChoice(DAYS.map((d) => d[0].toUpperCase() + d.slice(1)), day),
        hint: 'Seul compte le reste modulo $7$.',
        correction: [`$${base}^{${k}} \\equiv ${shift} \\pmod 7$`, `On avance de $${shift}$ jour${shift > 1 ? 's' : ''} : ${DAYS[day]}.`],
      };
    },
    // Restes possibles d'un carré.
    (rng, level) => {
      const m = rng.pick(level === 1 ? [3, 4, 5] : [7, 8, 9, 10]);
      const squares = [...new Set(Array.from({ length: m }, (_, x) => (x * x) % m))].sort((x, y) => x - y);
      return {
        prompt: `Quels sont les restes possibles de $n^2$ dans la division par $${m}$, quand $n$ décrit $\\mathbb{Z}$ ?`,
        answer: setOf(squares),
        hint: `Il suffit d’essayer $n = 0, 1, \\dots, ${m - 1}$.`,
        correction: [`$${Array.from({ length: m }, (_, x) => `${x}^2 \\equiv ${(x * x) % m}`).join(',\\ ')}$`, `Restes possibles : $${setTex(squares)}$`],
      };
    },
    // Reste par 9 ou 11 d'un grand nombre.
    (rng) => {
      const digits = Array.from({ length: rng.int(6, 9) }, (_, i) => (i === 0 ? rng.int(1, 9) : rng.int(0, 9)));
      const n = digits.join('');
      const by9 = rng.next() < 0.5;
      const r = by9 ? digits.reduce((s, d) => s + d, 0) % 9 : mod(digits.reduceRight((s, d, i) => s + ((digits.length - 1 - i) % 2 ? -d : d), 0), 11);
      return {
        prompt: `Quel est le reste de la division euclidienne de $${n}$ par $${by9 ? 9 : 11}$ ?`,
        answer: num(r),
        hint: by9 ? '$10 \\equiv 1 \\pmod 9$ : un entier est congru à la somme de ses chiffres.' : '$10 \\equiv -1 \\pmod{11}$ : somme alternée des chiffres, en partant des unités.',
        correction: [by9 ? `Somme des chiffres : $${digits.join(' + ')} = ${digits.reduce((s, d) => s + d, 0)}$, de reste $${r}$ modulo $9$.` : `La somme alternée des chiffres (unités en $+$) est congrue à $${r}$ modulo $11$.`],
      };
    },
  ],
  'l1-diviseurs': [
    // Somme des diviseurs.
    (rng, level) => {
      const n = rng.pick(level === 1 ? [12, 18, 20, 28, 30] : [36, 45, 48, 60, 72, 84, 90, 96, 100]);
      const ds = divisorsOf(n);
      const s = ds.reduce((x, y) => x + y, 0);
      return {
        prompt: `Calcule la somme des diviseurs positifs de $${n}$.`,
        answer: num(s),
        hint: 'Liste les diviseurs par paires $(d, n/d)$, ou utilise la décomposition en facteurs premiers.',
        correction: [`Diviseurs : $${ds.join(', ')}$`, `Somme : $${s}$${s === 2 * n ? ` ($${n}$ est parfait !)` : ''}`],
      };
    },
    // n − a divise bn − c.
    (rng) => {
      const a = rng.int(-5, 6);
      const b = rng.int(2, 4);
      let c = rng.int(-10, 20);
      while (b * a - c === 0 || Math.abs(b * a - c) > 12) c = rng.int(-10, 20);
      const r = b * a - c;
      const sols = divisorsOf(Math.abs(r)).flatMap((d) => [a + d, a - d]);
      return {
        prompt: `Donne tous les entiers $n \\in \\mathbb{Z}$ tels que $${lin(1, -a)}$ divise $${lin(b, -c)}$.`,
        answer: setOf(sols),
        hint: `$${lin(b, -c)} = ${b}(${lin(1, -a)}) ${r < 0 ? '-' : '+'} ${Math.abs(r)}$ : $${lin(1, -a)}$ doit diviser $${r}$.`,
        correction: [`Les diviseurs de $${r}$ sont $\\pm${divisorsOf(Math.abs(r)).join(', \\pm')}$.`, `Donc $n \\in ${setTex(sols)}$.`],
      };
    },
    // Plus petit entier ayant exactement d diviseurs.
    (rng) => {
      const d = rng.pick([4, 5, 6, 8, 9, 10, 12]);
      let n = 1;
      while (divisorsOf(n).length !== d) n++;
      return {
        prompt: `Quel est le plus petit entier positif qui a exactement $${d}$ diviseurs positifs ?`,
        answer: num(n),
        hint: 'Si $n = p_1^{a_1} \\cdots p_k^{a_k}$, il a $(a_1 + 1)\\cdots(a_k + 1)$ diviseurs : place les grands exposants sur les petits premiers.',
        correction: [`$${n}$ a pour diviseurs $${divisorsOf(n).join(', ')}$ : il y en a $${d}$, et aucun entier plus petit ne convient.`],
      };
    },
  ],
  'l1-valuation': [
    // Zéros à la fin de n!.
    (rng, level) => {
      const n = rng.int(level === 1 ? 10 : 30, level === 1 ? 30 : 200);
      let z = 0;
      for (let p = 5; p <= n; p *= 5) z += Math.floor(n / p);
      return {
        prompt: `Par combien de zéros se termine l’écriture décimale de $${n}!$ ?`,
        answer: num(z),
        hint: 'Chaque zéro vient d’un facteur $10 = 2 \\times 5$, et les facteurs $5$ sont les plus rares : formule de Legendre.',
        correction: [`$v_5(${n}!) = ${Array.from({ length: 4 }, (_, i) => 5 ** (i + 1)).filter((p) => p <= n).map((p) => `\\lfloor ${n}/${p} \\rfloor`).join(' + ')} = ${z}$`],
      };
    },
    (rng) => vraiFauxBanque(rng, VALUATIONS),
    // Valuation d'un coefficient binomial.
    (rng) => {
      const p = rng.pick([2, 3]);
      const n = rng.int(6, 20);
      const k = rng.int(1, n - 1);
      let c = BigInt(binom(n, k));
      let v = 0;
      while (c % BigInt(p) === 0n) {
        c /= BigInt(p);
        v++;
      }
      const leg = (m: number) => {
        let s = 0;
        for (let q = p; q <= m; q *= p) s += Math.floor(m / q);
        return s;
      };
      return {
        prompt: `Quel est l’exposant de $${p}$ dans la décomposition en facteurs premiers de $\\binom{${n}}{${k}}$ ?`,
        answer: num(v),
        hint: `$v_${p}\\binom{n}{k} = v_${p}(n!) - v_${p}(k!) - v_${p}((n-k)!)$, chacun par la formule de Legendre.`,
        correction: [`$v_${p}(${n}!) - v_${p}(${k}!) - v_${p}(${n - k}!) = ${leg(n)} - ${leg(k)} - ${leg(n - k)} = ${v}$`],
      };
    },
  ],
};
