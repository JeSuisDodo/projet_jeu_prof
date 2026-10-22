import { frac } from '../fraction';
import type { Skill } from '../types';
import { bound, dec, decText, fixedChoice, num, numF, pair, par, skill } from './util';

/** Chapitre « Puissances » (4e). */

const puissanceEntier = skill('4e-puissance-entier', 'Calculer une puissance', (rng, level) => {
  const base = level === 1 ? rng.int(2, 5) : rng.nonZero(-5, 5) || 2;
  const b = Math.abs(base) === 1 ? base * 2 : base;
  const n = rng.int(2, bound(level, 3, 4, 5));
  // Piège classique du niveau 3 : −a^n n'est pas (−a)^n.
  const trap = level === 3 && rng.next() < 0.4 && b < 0;
  const value = trap ? -(Math.abs(b) ** n) : b ** n;
  const written = trap ? `-${Math.abs(b)}^{${n}}` : `${par(b)}^{${n}}`;
  const factors = Array.from({ length: n }, () => (trap ? Math.abs(b) : par(b))).join(' \\times ');
  return {
    prompt: `Calcule $${written}$.`,
    answer: num(value),
    hint: trap ? 'Attention : l’exposant ne porte que sur le nombre juste avant lui, pas sur le signe « − ».' : '$a^n$ est le produit de $n$ facteurs égaux à $a$.',
    correction: [trap ? `$${written} = -(${factors}) = ${value}$` : `$${written} = ${factors} = ${value}$`],
  };
});

const regles10 = skill('4e-regles-puissances-10', 'Calculer avec les puissances de 10', (rng, level) => {
  const m = bound(level, 6, 9, 12);
  const a = level === 1 ? rng.int(1, m) : rng.nonZero(-m, m);
  const b = level === 1 ? rng.int(1, m) : rng.nonZero(-m, m);
  const forms = [
    { expr: `10^{${a}} \\times 10^{${b}}`, n: a + b, rule: `10^{${a}} \\times 10^{${b}} = 10^{${a} + ${par(b)}}` },
    { expr: `\\dfrac{10^{${a}}}{10^{${b}}}`, n: a - b, rule: `\\dfrac{10^{${a}}}{10^{${b}}} = 10^{${a} - ${par(b)}}` },
  ];
  if (level >= 2) {
    const k = rng.int(2, 4);
    forms.push({ expr: `\\left(10^{${a}}\\right)^{${k}}`, n: a * k, rule: `\\left(10^{${a}}\\right)^{${k}} = 10^{${par(a)} \\times ${k}}` });
  }
  if (level === 3) {
    const c = rng.nonZero(-6, 6);
    forms.push({
      expr: `\\dfrac{10^{${a}} \\times 10^{${b}}}{10^{${c}}}`,
      n: a + b - c,
      rule: `\\dfrac{10^{${a + b}}}{10^{${c}}} = 10^{${a + b} - ${par(c)}}`,
    });
  }
  const f = rng.pick(forms);
  return {
    prompt: `Écris $${f.expr}$ sous la forme $10^{n}$. Que vaut $n$ ?`,
    answer: num(f.n),
    hint: 'On ajoute les exposants pour un produit, on les soustrait pour un quotient, on les multiplie pour une puissance de puissance.',
    correction: [`$${f.rule} = 10^{${f.n}}$, donc $n = ${f.n}$.`],
  };
});

const exposantNegatif = skill('4e-exposant-negatif', 'Comprendre les exposants négatifs', (rng, level) => {
  if (level === 1 || rng.next() < 0.4) {
    const n = rng.int(1, bound(level, 3, 5, 6));
    const v = 10 ** -n;
    return {
      prompt: `Donne l’écriture décimale de $10^{-${n}}$.`,
      answer: numF(frac(1, 10 ** n)),
      hint: '$10^{-n} = \\frac{1}{10^n}$ : un 1 placé au $n$-ième rang après la virgule.',
      correction: [`$10^{-${n}} = \\frac{1}{10^{${n}}} = ${dec(v)}$`],
    };
  }
  const base = rng.int(2, level === 2 ? 3 : 5);
  const n = rng.int(1, level === 2 ? 3 : 4);
  return {
    prompt: `Écris $${base}^{-${n}}$ sous la forme d’une fraction.`,
    answer: numF(frac(1, base ** n)),
    hint: 'Pour $a \\neq 0$ : $a^{-n} = \\frac{1}{a^n}$.',
    correction: [`$${base}^{-${n}} = \\frac{1}{${base}^{${n}}} = \\frac{1}{${base ** n}}$`],
  };
});

const notationScientifique = skill('4e-notation-scientifique', 'Écrire en notation scientifique', (rng, level) => {
  const digits = rng.int(2, bound(level, 2, 3, 4));
  const mantissaInt = rng.int(10 ** (digits - 1), 10 ** digits - 1);
  const a = mantissaInt / 10 ** (digits - 1);
  const n = level === 1 ? rng.int(2, 6) : level === 2 ? rng.pick([-4, -3, -2, 3, 4, 5, 6, 7]) : rng.pick([-7, -6, -5, -3, 5, 8, 9]);
  const value = a * 10 ** n;
  const shown = n >= 0 ? decText(value) : (mantissaInt / 10 ** (digits - 1 - n)).toFixed(digits - 1 - n).replace('.', ',');
  // Niveau 3 : le nombre de départ est déjà un produit par une puissance de 10 mal écrite.
  if (level === 3 && rng.next() < 0.5) {
    const shift = rng.pick([1, 2]);
    const big = mantissaInt / 10 ** (digits - 1 - shift);
    return {
      prompt: `Écris $${dec(big)} \\times 10^{${n - shift}}$ en notation scientifique $a \\times 10^{n}$, avec $1 \\leq a < 10$.`,
      answer: pair(frac(mantissaInt, 10 ** (digits - 1)), frac(n), ['a', 'n']),
      hint: 'Écris d’abord le premier nombre en notation scientifique, puis ajoute les exposants.',
      correction: [`$${dec(big)} = ${dec(a)} \\times 10^{${shift}}$`, `donc $${dec(big)} \\times 10^{${n - shift}} = ${dec(a)} \\times 10^{${shift} + ${par(n - shift)}} = ${dec(a)} \\times 10^{${n}}$.`],
    };
  }
  return {
    prompt: `Écris $${shown.replace(',', '{,}')}$ en notation scientifique $a \\times 10^{n}$, avec $1 \\leq a < 10$.`,
    answer: pair(frac(mantissaInt, 10 ** (digits - 1)), frac(n), ['a', 'n']),
    hint: 'Place la virgule juste après le premier chiffre non nul, puis compte de combien de rangs elle s’est déplacée.',
    correction: [`$${shown.replace(',', '{,}')} = ${dec(a)} \\times 10^{${n}}$ : la virgule s’est déplacée de ${Math.abs(n)} rang${Math.abs(n) > 1 ? 's' : ''} vers la ${n > 0 ? 'gauche' : 'droite'}.`],
  };
});

const PREFIXES = [
  { name: 'giga', sym: 'G', n: 9 },
  { name: 'méga', sym: 'M', n: 6 },
  { name: 'kilo', sym: 'k', n: 3 },
  { name: 'milli', sym: 'm', n: -3 },
  { name: 'micro', sym: '\\mu ', n: -6 },
  { name: 'nano', sym: 'n', n: -9 },
];

const prefixes = skill('4e-prefixes', 'Utiliser les préfixes (kilo, méga, micro…)', (rng, level) => {
  const pool = level === 1 ? PREFIXES.filter((p) => Math.abs(p.n) === 3 || p.n === 6) : PREFIXES;
  const p = rng.pick(pool);
  const unit = rng.pick([
    { u: 'm', word: 'mètre' },
    { u: 'g', word: 'gramme' },
    { u: 'o', word: 'octet' },
    { u: 'W', word: 'watt' },
  ]);
  if (level === 3) {
    const k = rng.int(2, 9);
    return {
      prompt: `Un appareil indique $${k}\\ \\mathrm{${p.sym}${unit.u}}$ (${p.name}${unit.word}s). On écrit cette mesure $${k} \\times 10^{n}\\ \\mathrm{${unit.u}}$ : que vaut $n$ ?`,
      answer: num(p.n),
      hint: `Le préfixe ${p.name} correspond à une puissance de 10.`,
      correction: [`${p.name[0].toUpperCase() + p.name.slice(1)} $= 10^{${p.n}}$, donc $${k}\\ \\mathrm{${p.sym}${unit.u}} = ${k} \\times 10^{${p.n}}\\ \\mathrm{${unit.u}}$.`],
    };
  }
  return {
    prompt: `$1\\ \\mathrm{${p.sym}${unit.u}}$ (un ${p.name}${unit.word}) $= 10^{n}\\ \\mathrm{${unit.u}}$. Que vaut $n$ ?`,
    answer: num(p.n),
    hint: 'kilo = mille, méga = un million, giga = un milliard ; milli = un millième, micro = un millionième, nano = un milliardième.',
    correction: [`Le préfixe ${p.name} vaut $10^{${p.n}}$ : $1\\ \\mathrm{${p.sym}${unit.u}} = 10^{${p.n}}\\ \\mathrm{${unit.u}}$.`],
  };
});

const comparerPuissances = skill('4e-comparer-ecritures', 'Comparer des nombres écrits avec des puissances de 10', (rng, level) => {
  const a1 = rng.int(11, 99) / 10;
  const n1 = rng.int(-6, 9);
  const shift = rng.pick(level === 1 ? [1, 2] : [-1, 1, 2]);
  const a2 = level === 1 ? rng.int(11, 99) / 10 : (rng.int(11, 99) / 10) * 10 ** shift;
  const n2 = level === 1 ? n1 + rng.pick([-1, 1]) : n1 - shift + rng.pick([0, 0, 1, -1]);
  const v1 = a1 * 10 ** n1;
  const v2 = a2 * 10 ** n2;
  const diff = Math.abs(v1 - v2) < 1e-12 * Math.max(Math.abs(v1), Math.abs(v2)) ? 0 : v1 - v2;
  const sci2 = a2 / 10 ** Math.floor(Math.log10(a2) + 1e-9);
  const n2s = n2 + Math.floor(Math.log10(a2) + 1e-9);
  return {
    prompt: `Compare $A = ${dec(a1)} \\times 10^{${n1}}$ et $B = ${dec(a2)} \\times 10^{${n2}}$.`,
    answer: fixedChoice(['$A < B$', '$A = B$', '$A > B$'], diff < 0 ? 0 : diff === 0 ? 1 : 2),
    hint: 'Écris les deux nombres en notation scientifique : on compare d’abord les exposants, puis les nombres devant.',
    correction: [
      `En notation scientifique, $B = ${dec(Math.round(sci2 * 1e6) / 1e6)} \\times 10^{${n2s}}$.`,
      `Donc $A ${diff < 0 ? '<' : diff === 0 ? '=' : '>'} B$.`,
    ],
  };
});

export const PUISSANCES_SKILLS: Skill[] = [puissanceEntier, regles10, exposantNegatif, notationScientifique, prefixes, comparerPuissances];
