import type { Skill } from '../types';
import { choiceTex, dec, fraction, num, par, skill } from './outils';

/** 3e : puissances, notation scientifique, racines carrées. */

const calcul = skill('3e-puissance-calcul', 'Calculer une puissance', (rng, level) => {
  const a = level === 1 ? rng.int(2, 5) : rng.nonZero(-5, 5);
  const n = level === 3 && rng.next() < 0.5 ? -rng.int(1, 3) : rng.int(2, a === 2 || a === -2 ? 6 : 4);
  const base = a === 1 || a === -1 ? (a < 0 ? -3 : 3) : a;
  const value = n >= 0 ? base ** n : 1;
  const den = n < 0 ? base ** -n : 1;
  const expr = `${par(base)}^{${n}}`;
  const prod = Array.from({ length: Math.abs(n) }, () => par(base)).join(' \\times ');
  return {
    prompt: `Calcule $${expr}$.${n < 0 ? ' Donne le résultat sous forme de fraction.' : ''}`,
    answer: fraction(value, den),
    hint: n < 0 ? `$a^{-n} = \\frac{1}{a^n}$` : `$a^n$ est le produit de $n$ facteurs égaux à $a$. Attention au signe si $a$ est négatif.`,
    correction:
      n < 0
        ? [`$${expr} = \\frac{1}{${par(base)}^{${-n}}} = \\frac{1}{${prod}}$`, `$= ${den < 0 ? `-\\frac{1}{${-den}}` : `\\frac{1}{${den}}`}$`]
        : [`$${expr} = ${prod} = ${value}$`],
  };
});

const regles = skill('3e-regles-puissances', 'Utiliser les règles de calcul sur les puissances', (rng, level) => {
  const a = rng.pick(level === 1 ? [10] : [2, 3, 5, 7, 10]);
  const m = level === 3 ? rng.nonZero(-6, 8) : rng.int(2, 8);
  const p = level === 3 ? rng.nonZero(-5, 6) : rng.int(2, 6);
  const kind = rng.pick(['produit', 'quotient', 'puissance'] as const);
  const [expr, exp, rule] =
    kind === 'produit'
      ? [`${a}^{${m}} \\times ${a}^{${p}}`, m + p, `a^m \\times a^p = a^{m + p}`]
      : kind === 'quotient'
        ? [`\\frac{${a}^{${m}}}{${a}^{${p}}}`, m - p, `\\frac{a^m}{a^p} = a^{m - p}`]
        : [`\\left(${a}^{${m}}\\right)^{${p}}`, m * p, `\\left(a^m\\right)^p = a^{m \\times p}`];
  return {
    prompt: `On écrit $${expr} = ${a}^{n}$. Quelle est la valeur de $n$ ?`,
    answer: num(exp),
    hint: `$${rule}$`,
    correction: [`$${rule}$`, `$${expr} = ${a}^{${exp}}$, donc $n = ${exp}$.`],
  };
});

/** Écriture décimale d'un nombre m × 10^e (m a au plus 3 chiffres significatifs). */
function plain(m: number, e: number): string {
  const digits = String(Math.round(m * 100));
  const intDigits = 1 + e;
  const full = intDigits <= 0 ? '0'.repeat(1 - intDigits) + digits : digits.padEnd(intDigits, '0');
  const point = Math.max(1, intDigits);
  let int = full.slice(0, point);
  let frac = full.slice(point).replace(/0+$/, '');
  int = int.replace(/^0+(?=\d)/, '');
  // Espaces fines tous les trois chiffres pour la lisibilité.
  int = int.replace(/\B(?=(\d{3})+(?!\d))/g, '\\,');
  frac = frac.replace(/(\d{3})(?=\d)/g, '$1\\,');
  return frac ? `${int}{,}${frac}` : int;
}

const sci = (m: number, e: number) => `${dec(m)} \\times 10^{${e}}`;

const scientifique = skill('3e-notation-scientifique', 'Écrire un nombre en notation scientifique', (rng, level) => {
  const m = level === 1 ? rng.int(11, 99) / 10 : rng.int(101, 999) / 100;
  const e = level === 1 ? rng.int(2, 6) : level === 2 ? rng.nonZero(-5, 7) : rng.pick([-8, -7, -6, -5, 6, 7, 8, 9]);
  const n = plain(m, e);
  const decoys = [sci(m, -e), `${dec(m * 10)} \\times 10^{${e - 1}}`, sci(m, e + 1), sci(m, e - 1), `${dec(m / 10)} \\times 10^{${e + 1}}`];
  return {
    prompt: `Quelle est la notation scientifique de $${n}$ ?`,
    answer: choiceTex(rng, sci(m, e), decoys, () => sci(m, e + rng.nonZero(-3, 3))),
    hint: 'Notation scientifique : $a \\times 10^n$ avec $1 \\leq a < 10$. Compte de combien de rangs la virgule se déplace.',
    correction: [
      `On place la virgule après le premier chiffre non nul : $${dec(m)}$.`,
      e > 0 ? `La virgule s'est déplacée de $${e}$ rangs vers la gauche, donc l'exposant est $${e}$.` : `La virgule s'est déplacée de $${-e}$ rangs vers la droite, donc l'exposant est $${e}$.`,
      `$${n} = ${sci(m, e)}$`,
    ],
  };
});

const racine = skill('3e-racine-carree', 'Calculer une racine carrée', (rng, level) => {
  if (level === 3 && rng.next() < 0.5) {
    const c = rng.int(4, 25);
    return {
      prompt: `Un carré a une aire de $${c * c}$ m². Quelle est la longueur de son côté, en m ?`,
      answer: num(c),
      hint: 'L’aire d’un carré de côté $c$ vaut $c^2$ : le côté est la racine carrée de l’aire.',
      correction: [`$c^2 = ${c * c}$ et $c > 0$, donc $c = \\sqrt{${c * c}} = ${c}$ m.`],
    };
  }
  if (level >= 2 && rng.next() < 0.5) {
    const r = rng.int(1, 9);
    const k = rng.pick([10, 100]);
    const v = r / k;
    const sq = (r * r) / (k * k);
    return {
      prompt: `Calcule $\\sqrt{${dec(sq)}}$.`,
      answer: fraction(r, k),
      hint: 'Cherche le nombre positif dont le carré est égal au nombre sous la racine.',
      correction: [`$${dec(v)}^2 = ${dec(sq)}$ et $${dec(v)} > 0$.`, `Donc $\\sqrt{${dec(sq)}} = ${dec(v)}$.`],
    };
  }
  const r = level === 1 ? rng.int(2, 12) : rng.int(11, 20);
  return {
    prompt: `Calcule $\\sqrt{${r * r}}$.`,
    answer: num(r),
    hint: 'Cherche le nombre positif dont le carré est égal au nombre sous la racine.',
    correction: [`$${r}^2 = ${r * r}$ et $${r} > 0$, donc $\\sqrt{${r * r}} = ${r}$.`],
  };
});

const priorites = skill('3e-puissances-priorites', 'Calculer avec des puissances et des priorités', (rng, level) => {
  const a = rng.int(2, level === 1 ? 5 : 9);
  const b = rng.int(2, 4);
  const c = rng.nonZero(-6, 6);
  const sq = level === 1 ? 2 : rng.pick([2, 3]);
  const neg = level === 3 && rng.next() < 0.5;
  // -a² se lit -(a²) : c'est l'erreur classique visée au niveau 3.
  const head = neg ? `-${a}^{${sq}}` : `${a}^{${sq}}`;
  const pw = (neg ? -1 : 1) * a ** sq;
  const value = pw + b * c;
  return {
    prompt: `Calcule $${head} + ${b} \\times ${par(c)}$.`,
    answer: num(value),
    hint: 'Priorités : d’abord les puissances, puis les multiplications, enfin les additions. Et $-a^2 = -(a^2)$.',
    correction: [`$${head} = ${pw}$ et $${b} \\times ${par(c)} = ${b * c}$.`, `$${pw} + ${par(b * c)} = ${value}$`],
  };
});

export const PUISSANCES_3E: Skill[] = [calcul, regles, scientifique, racine, priorites];
