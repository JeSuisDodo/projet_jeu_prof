import { frac } from '../fraction';
import type { Skill } from '../types';
import { add, bound, div, fixedChoice, lcm, mul, numF, rawFrac, skill, sub, tex } from './util';

/** Chapitre « Fractions : calculs » (4e). */

/** Fraction d'énoncé, numérateur éventuellement négatif ; jamais réduite d'office. */
function pickFrac(rng: { int: (a: number, b: number) => number; nonZero: (a: number, b: number) => number }, maxD: number, negative: boolean) {
  const d = rng.int(2, maxD);
  let n = rng.int(1, d * 2 - 1);
  if (n % d === 0) n += 1;
  return { n: negative ? -n : n, d };
}

const somme = skill('4e-somme-fractions', 'Additionner et soustraire des fractions', (rng, level) => {
  let a;
  let b;
  if (level === 1) {
    const d = rng.int(2, 7);
    const k = rng.int(2, 4);
    a = pickFrac(rng, 9, false);
    a.d = d;
    if (a.n % d === 0) a.n += 1;
    b = { n: rng.int(1, 9), d: d * k };
  } else {
    a = pickFrac(rng, bound(level, 0, 7, 9), level === 3 && rng.next() < 0.5);
    b = pickFrac(rng, bound(level, 0, 7, 9), false);
    if (a.d === b.d) b.d += 1;
  }
  const minus = rng.next() < 0.5;
  const A = frac(a.n, a.d);
  const B = frac(b.n, b.d);
  const value = minus ? sub(A, B) : add(A, B);
  const D = lcm(a.d, b.d);
  const na = (a.n * D) / a.d;
  const nb = (b.n * D) / b.d;
  const op = minus ? '-' : '+';
  const res = minus ? na - nb : na + nb;
  return {
    prompt: `Calcule $${rawFrac(a.n, a.d)} ${op} ${rawFrac(b.n, b.d)}$ et donne le résultat sous forme de fraction (simplifiée si possible).`,
    answer: numF(value),
    hint: 'Mets d’abord les deux fractions au même dénominateur, puis additionne (ou soustrais) les numérateurs.',
    correction: [
      `Dénominateur commun : $${D}$.`,
      `$${rawFrac(a.n, a.d)} ${op} ${rawFrac(b.n, b.d)} = ${rawFrac(na, D)} ${op} ${rawFrac(nb, D)} = ${rawFrac(res, D)}${frac(res, D).d !== D ? ` = ${tex(value)}` : ''}$`,
    ],
  };
});

const produit = skill('4e-produit-fractions', 'Multiplier des fractions', (rng, level) => {
  const a = pickFrac(rng, bound(level, 6, 9, 9), level >= 2 && rng.next() < 0.5);
  const b = pickFrac(rng, bound(level, 6, 9, 12), level === 3 && rng.next() < 0.5);
  const value = mul(frac(a.n, a.d), frac(b.n, b.d));
  return {
    prompt: `Calcule $${rawFrac(a.n, a.d)} \\times ${b.n < 0 ? `\\left(${rawFrac(b.n, b.d)}\\right)` : rawFrac(b.n, b.d)}$ (résultat simplifié).`,
    answer: numF(value),
    hint: 'On multiplie les numérateurs entre eux et les dénominateurs entre eux, puis on simplifie.',
    correction: [`$\\frac{${a.n} \\times ${b.n < 0 ? `(${b.n})` : b.n}}{${a.d} \\times ${b.d}} = ${rawFrac(a.n * b.n, a.d * b.d)}${value.d !== a.d * b.d ? ` = ${tex(value)}` : ''}$`],
  };
});

const quotient = skill('4e-quotient-fractions', 'Diviser par une fraction', (rng, level) => {
  const a = pickFrac(rng, bound(level, 6, 9, 9), level === 3 && rng.next() < 0.5);
  const b = pickFrac(rng, bound(level, 6, 9, 9), level >= 2 && rng.next() < 0.4);
  const value = div(frac(a.n, a.d), frac(b.n, b.d));
  const inv = rawFrac(b.d * Math.sign(b.n), Math.abs(b.n));
  const wrap = (s: string, neg: boolean) => (neg ? `\\left(${s}\\right)` : s);
  return {
    prompt: `Calcule $${rawFrac(a.n, a.d)} \\div ${wrap(rawFrac(b.n, b.d), b.n < 0)}$ (résultat simplifié).`,
    answer: numF(value),
    hint: 'Diviser par une fraction, c’est multiplier par son inverse.',
    correction: [`$${rawFrac(a.n, a.d)} \\div ${wrap(rawFrac(b.n, b.d), b.n < 0)} = ${rawFrac(a.n, a.d)} \\times ${wrap(inv, b.n < 0)} = ${tex(value)}$`],
  };
});

const fractionDe = skill('4e-fraction-de', 'Prendre une fraction d’une quantité', (rng, level) => {
  const d = rng.pick(level === 1 ? [2, 3, 4, 5] : [3, 4, 5, 6, 8]);
  const n = rng.int(1, d - 1);
  const q = d * rng.int(level === 1 ? 2 : 5, level === 3 ? 40 : 15);
  const part = (q / d) * n;
  const rest = q - part;
  const d2s = [2, 3, 4].filter((x) => rest % x === 0);
  if (level === 3 && d2s.length > 0) {
    const d2 = rng.pick(d2s);
    return {
      prompt: `Sur ${q} € d’argent de poche, Noé dépense les $${rawFrac(n, d)}$ en livres, puis $${rawFrac(1, d2)}$ du reste en sorties. Combien d’euros dépense-t-il en sorties ?`,
      answer: numF(frac(rest, d2)),
      hint: 'Calcule d’abord ce qui reste après les livres, puis prends la fraction de ce reste.',
      correction: [`Livres : $${rawFrac(n, d)} \\times ${q} = ${part}$ €. Reste : $${q} - ${part} = ${rest}$ €.`, `Sorties : $${rawFrac(1, d2)} \\times ${rest} = ${rest / d2}$ €.`],
    };
  }
  const prompt = rng.pick([
    `Un collège compte ${q} élèves, dont les $${rawFrac(n, d)}$ sont demi-pensionnaires. Combien d’élèves sont demi-pensionnaires ?`,
    `Un trajet mesure ${q} km. Les $${rawFrac(n, d)}$ du trajet se font en train. Combien de kilomètres se font en train ?`,
    `Lina a ${q} cartes, dont les $${rawFrac(n, d)}$ sont rares. Combien a-t-elle de cartes rares ?`,
  ]);
  return {
    prompt,
    answer: numF(frac(part)),
    hint: `Prendre $\\frac{a}{b}$ d’une quantité, c’est la multiplier par $\\frac{a}{b}$ : on divise par $b$ puis on multiplie par $a$.`,
    correction: [`$${rawFrac(n, d)} \\times ${q} = ${q} \\div ${d} \\times ${n} = ${q / d} \\times ${n} = ${part}$`],
  };
});

const comparer = skill('4e-comparer-fractions', 'Comparer des fractions', (rng, level) => {
  let a = pickFrac(rng, bound(level, 6, 9, 12), level === 3 && rng.next() < 0.5);
  let b = pickFrac(rng, bound(level, 6, 9, 12), level === 3 && rng.next() < 0.5);
  if (level === 1) b = { n: rng.int(1, 3 * a.d), d: a.d * rng.int(2, 3) };
  if (rng.next() < 0.15) {
    const k = rng.int(2, 4);
    b = { n: a.n * k, d: a.d * k };
  }
  if (a.n === b.n && a.d === b.d) a = { n: a.n + 1, d: a.d };
  const A = frac(a.n, a.d);
  const B = frac(b.n, b.d);
  const diff = A.n * B.d - B.n * A.d;
  const D = lcm(a.d, b.d);
  return {
    prompt: `Compare $${rawFrac(a.n, a.d)}$ et $${rawFrac(b.n, b.d)}$ : quel symbole va entre les deux ?`,
    answer: fixedChoice(['<', '=', '>'], diff < 0 ? 0 : diff === 0 ? 1 : 2),
    hint: 'Mets les deux fractions au même dénominateur, puis compare les numérateurs.',
    correction: [
      `Au même dénominateur : $${rawFrac((a.n * D) / a.d, D)}$ et $${rawFrac((b.n * D) / b.d, D)}$.`,
      `Donc $${rawFrac(a.n, a.d)} ${diff < 0 ? '<' : diff === 0 ? '=' : '>'} ${rawFrac(b.n, b.d)}$.`,
    ],
  };
});

export const FRACTIONS_SKILLS: Skill[] = [somme, produit, quotient, fractionDe, comparer];
