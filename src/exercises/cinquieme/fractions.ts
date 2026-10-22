import { frac, fracLatex } from '../fraction';
import type { Rng } from '../rng';
import type { Skill } from '../types';
import { fixedChoice, gcd, latexChoice, num } from './outils';

/** 5e : égalité, simplification, comparaison et somme de fractions ; fraction d'une quantité. */

const fl = (n: number | string, d: number | string) => `\\dfrac{${n}}{${d}}`;

/** Fraction irréductible a/b avec 1 ≤ a, 2 ≤ b ≤ max. */
function irreducible(rng: Rng, max: number, proper = false): [number, number] {
  for (;;) {
    const b = rng.int(2, max);
    const a = rng.int(1, proper ? b - 1 : max + 3);
    if (gcd(a, b) === 1 && a !== b) return [a, b];
  }
}

const egalite: Skill = {
  id: '5e-fraction-egale',
  name: 'Compléter une égalité de fractions',
  generate(rng, level) {
    const [a, b] = irreducible(rng, level === 1 ? 9 : 12);
    const k = rng.int(2, level === 1 ? 5 : 12);
    const mode = level === 1 ? 0 : level === 2 ? rng.int(0, 1) : rng.int(2, 3);
    let prompt: string;
    let value: number;
    let steps: string[];
    if (mode === 0) {
      prompt = `$${fl(a, b)} = ${fl('\\ldots', b * k)}$`;
      value = a * k;
      steps = [`$${b} \\times ${k} = ${b * k}$ : on multiplie aussi le numérateur par $${k}$.`, `$${fl(a, b)} = ${fl(a * k, b * k)}$`];
    } else if (mode === 1) {
      prompt = `$${fl(a, b)} = ${fl(a * k, '\\ldots')}$`;
      value = b * k;
      steps = [`$${a} \\times ${k} = ${a * k}$ : on multiplie aussi le dénominateur par $${k}$.`, `$${fl(a, b)} = ${fl(a * k, b * k)}$`];
    } else if (mode === 2) {
      // On passe par la fraction simplifiée : 12/18 = …/15.
      const m = rng.int(2, 6);
      prompt = `$${fl(a * k, b * k)} = ${fl('\\ldots', b * m)}$`;
      value = a * m;
      steps = [`On simplifie : $${fl(a * k, b * k)} = ${fl(a, b)}$.`, `Puis $${fl(a, b)} = ${fl(a * m, b * m)}$.`];
    } else {
      prompt = `$${fl(a * k, '\\ldots')} = ${fl(a, b)}$`;
      value = b * k;
      steps = [`Pour passer de $${a}$ à $${a * k}$, on multiplie par $${k}$.`, `$${b} \\times ${k} = ${b * k}$ : $${fl(a * k, b * k)} = ${fl(a, b)}$`];
    }
    return {
      skill: '5e-fraction-egale',
      level,
      prompt: `Complète : ${prompt}.`,
      answer: num(value),
      hint: 'Une fraction ne change pas si on multiplie (ou divise) son numérateur et son dénominateur par un même nombre.',
      correction: steps,
    };
  },
};

const simplifier: Skill = {
  id: '5e-fraction-simplifier',
  name: 'Simplifier une fraction',
  generate(rng, level) {
    const [a, b] = irreducible(rng, level === 1 ? 7 : 11);
    const k = level === 1 ? rng.pick([2, 3, 5]) : level === 2 ? rng.pick([4, 6, 8, 9, 10]) : rng.pick([12, 14, 15, 18, 24]);
    const n = a * k;
    const d = b * k;
    // Leurres : simplification incomplète, fraction inversée, chiffres « barrés ».
    const part = [2, 3, 5].find((p) => k % p === 0 && p !== k);
    const decoys = [fl(b, a), fl(a + 1, b), fl(a, b + 1)];
    if (part) decoys.unshift(fl(n / part, d / part));
    return {
      skill: '5e-fraction-simplifier',
      level,
      prompt: `Quelle est la forme la plus simple de la fraction $${fl(n, d)}$ ?`,
      answer: latexChoice(rng, fl(a, b), decoys, () => fl(a + rng.int(2, 5), b)),
      hint: 'Cherche le plus grand nombre qui divise à la fois le numérateur et le dénominateur (pense aux critères de divisibilité).',
      correction: [`$${n} = ${k} \\times ${a}$ et $${d} = ${k} \\times ${b}$.`, `$${fl(n, d)} = ${fl(a, b)}$, qu'on ne peut plus simplifier.`],
    };
  },
};

const comparer: Skill = {
  id: '5e-fraction-comparer',
  name: 'Comparer des fractions',
  generate(rng, level) {
    const symbols = ['$<$', '$>$', '$=$'];
    if (level === 1 && rng.next() < 0.5) {
      // Comparer à 1.
      const [a, b] = irreducible(rng, 12);
      const lt = a < b;
      return {
        skill: '5e-fraction-comparer',
        level,
        prompt: `Compare $${fl(a, b)}$ et $1$.`,
        answer: fixedChoice(symbols, lt ? 0 : 1),
        hint: 'Une fraction est plus petite que 1 si son numérateur est plus petit que son dénominateur.',
        correction: [`$${a} ${lt ? '<' : '>'} ${b}$ donc $${fl(a, b)} ${lt ? '<' : '>'} 1$.`],
      };
    }
    const b = rng.int(2, 9);
    const k = level === 1 ? 1 : rng.int(2, 5);
    const a = rng.int(1, 3 * b);
    let c: number;
    if (level === 3 && rng.next() < 0.3) c = a * k;
    else do c = rng.int(1, 3 * b * k);
    while (c === a * k && level < 3);
    const d = b * k;
    const left = a * k;
    const cmp = left < c ? 0 : left > c ? 1 : 2;
    const sym = ['<', '>', '='][cmp];
    const swap = rng.next() < 0.5;
    // On écrit parfois la fraction de plus grand dénominateur en premier.
    const [p, q] = swap ? [fl(c, d), fl(a, b)] : [fl(a, b), fl(c, d)];
    const correct = swap ? [1, 0, 2][cmp] : cmp;
    return {
      skill: '5e-fraction-comparer',
      level,
      prompt: `Compare $${p}$ et $${q}$.`,
      answer: fixedChoice(symbols, correct),
      hint: k === 1 ? 'Les deux fractions ont le même dénominateur : compare les numérateurs.' : 'Mets les deux fractions au même dénominateur, puis compare les numérateurs.',
      correction: [
        ...(k === 1 ? [] : [`$${fl(a, b)} = ${fl(left, d)}$`]),
        `$${left} ${sym} ${c}$ donc $${fl(a, b)} ${sym} ${fl(c, d)}$.`,
      ],
    };
  },
};

const somme: Skill = {
  id: '5e-fraction-somme',
  name: 'Additionner et soustraire des fractions',
  generate(rng, level) {
    const b = rng.int(2, 9);
    const k = level === 1 ? 1 : rng.int(2, 4);
    const d = b * k;
    const a = rng.int(1, 2 * b);
    let c = rng.int(1, 2 * d);
    const minus = level > 1 && rng.next() < 0.5;
    if (minus && c > a * k) c = rng.int(1, a * k);
    const top = minus ? a * k - c : a * k + c;
    const result = frac(top, d);
    const op = minus ? '-' : '+';
    if (level === 3 && rng.next() < 0.5) {
      // Un entier et une fraction : 2 + 3/4.
      const n = rng.int(1, 5);
      const [p, q] = irreducible(rng, 9, true);
      const neg = rng.next() < 0.5;
      const value = frac(neg ? n * q - p : n * q + p, q);
      return {
        skill: '5e-fraction-somme',
        level,
        prompt: `Calcule $${n} ${neg ? '-' : '+'} ${fl(p, q)}$ (sous forme de fraction).`,
        answer: { kind: 'number', value },
        hint: `Écris $${n}$ sous forme de fraction de dénominateur $${q}$.`,
        correction: [`$${n} = ${fl(n * q, q)}$`, `$${fl(n * q, q)} ${neg ? '-' : '+'} ${fl(p, q)} = ${fl(neg ? n * q - p : n * q + p, q)}$`],
      };
    }
    const lines = k === 1 ? [] : [`$${fl(a, b)} = ${fl(a * k, d)}$`];
    lines.push(`$${fl(a * k, d)} ${op} ${fl(c, d)} = ${fl(top, d)}$`);
    if (result.d !== d && top !== 0) lines.push(`$= ${fracLatex(result).replace('\\frac', '\\dfrac')}$`);
    return {
      skill: '5e-fraction-somme',
      level,
      prompt: `Calcule $${fl(a, b)} ${op} ${fl(c, d)}$.`,
      answer: { kind: 'number', value: result },
      hint: k === 1 ? 'Même dénominateur : on additionne (ou soustrait) les numérateurs et on garde le dénominateur.' : `Commence par écrire $${fl(a, b)}$ avec le dénominateur $${d}$.`,
      correction: lines,
    };
  },
};

const quantite: Skill = {
  id: '5e-fraction-quantite',
  name: 'Prendre une fraction d’une quantité',
  generate(rng, level) {
    const [a, b] = irreducible(rng, level === 1 ? 5 : 10, true);
    const n = b * rng.int(2, level === 1 ? 10 : 30);
    const value = (a * n) / b;
    const steps = [`$${n} \\div ${b} = ${n / b}$`, `$${n / b} \\times ${a} = ${value}$`];
    if (level === 3) {
      const ctx = rng.pick([
        [`Dans un collège de $${n * 4}$ élèves, les $${fl(a, b)}$ sont demi-pensionnaires. Combien d'élèves sont demi-pensionnaires ?`, n * 4],
        [`Un randonneur doit parcourir $${n}\\text{ km}$. Il en a déjà fait les $${fl(a, b)}$. Combien de kilomètres lui reste-t-il ?`, -n],
      ] as [string, number][]);
      const [text, total] = ctx;
      const N = Math.abs(total);
      const part = (a * N) / b;
      const answer = total > 0 ? part : N - part;
      return {
        skill: '5e-fraction-quantite',
        level,
        prompt: text,
        answer: num(answer),
        hint: 'Prendre les $\\frac{a}{b}$ d’une quantité, c’est la diviser par $b$ puis multiplier par $a$.',
        correction: [`$${fl(a, b)} \\times ${N} = ${N} \\div ${b} \\times ${a} = ${part}$`, ...(total > 0 ? [] : [`Il reste $${N} - ${part} = ${answer}$.`])],
      };
    }
    return {
      skill: '5e-fraction-quantite',
      level,
      prompt: `Calcule les $${fl(a, b)}$ de $${n}$.`,
      answer: num(value),
      hint: `Divise $${n}$ par $${b}$, puis multiplie le résultat par $${a}$.`,
      correction: steps,
    };
  },
};

const quotient: Skill = {
  id: '5e-quotient',
  name: 'Comprendre une fraction comme un quotient',
  generate(rng, level) {
    const [a, b] = irreducible(rng, level === 1 ? 9 : 15);
    if (level === 1) {
      const d = rng.pick([2, 4, 5, 10]);
      const n = rng.int(1, 4 * d);
      return {
        skill: '5e-quotient',
        level,
        prompt: `Donne l'écriture décimale de $${fl(n, d)}$.`,
        answer: { kind: 'number', value: frac(n, d) },
        hint: `$${fl(n, d)} = ${n} \\div ${d}$`,
        correction: [`$${fl(n, d)} = ${n} \\div ${d} = ${String(n / d).replace('.', '{,}')}$`],
      };
    }
    const reverse = level === 3 && rng.next() < 0.5;
    return {
      skill: '5e-quotient',
      level,
      prompt: reverse ? `Par quel nombre faut-il multiplier $${a}$ pour obtenir $${b}$ ? (donne une fraction)` : `Quel nombre multiplié par $${b}$ donne $${a}$ ? (donne une fraction)`,
      answer: { kind: 'number', value: reverse ? frac(b, a) : frac(a, b) },
      hint: 'Le quotient de $a$ par $b$ est le nombre qui, multiplié par $b$, donne $a$ : c’est $\\frac{a}{b}$.',
      correction: reverse ? [`$${a} \\times ${fl(b, a)} = ${b}$`, `Le nombre cherché est $${fl(b, a)}$.`] : [`$${b} \\times ${fl(a, b)} = ${a}$`, `Le nombre cherché est $${fl(a, b)}$.`],
    };
  },
};

export const FRACTIONS_SKILLS: Skill[] = [egalite, simplifier, comparer, somme, quantite, quotient];
