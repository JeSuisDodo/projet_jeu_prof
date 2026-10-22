import { frac, fracLatex } from '../fraction';
import type { Rng } from '../rng';
import type { Level, Skill } from '../types';
import { affine, latexChoice, par, poly2, terms } from './outils';

/** Chapitre 3 de 2nde : développer, factoriser, équations, puissances et racines carrées. */

const coef = (rng: Rng, level: Level) => (level === 1 ? rng.int(1, 3) : level === 2 ? rng.nonZero(-4, 4) : rng.nonZero(-6, 6));

const developper: Skill = {
  id: '2nde-developper',
  name: 'Développer un produit',
  generate(rng, level) {
    const a = coef(rng, level);
    const b = rng.nonZero(-7, 7);
    const c = coef(rng, level);
    const d = rng.nonZero(-7, 7);
    const A = a * c;
    const B = a * d + b * c;
    const C = b * d;
    return {
      skill: '2nde-developper',
      level,
      prompt: `Développe et réduis $(${affine(a, b)})(${affine(c, d)})$.`,
      answer: latexChoice(
        rng,
        poly2(A, B, C),
        [poly2(A, a * d - b * c, C), poly2(A, B, -C), poly2(A, 0, C), poly2(A, B + 2, C), poly2(a + c, B, C)],
        () => poly2(A, B + rng.nonZero(-3, 3), C),
      ),
      hint: 'Multiplie chaque terme de la première parenthèse par chaque terme de la seconde (double distributivité).',
      correction: [
        `$(${affine(a, b)})(${affine(c, d)}) = ${par(a)}x \\times ${par(c)}x + ${par(a)}x \\times ${par(d)} + ${par(b)} \\times ${par(c)}x + ${par(b)} \\times ${par(d)}$`,
        `$= ${poly2(A, 0, 0)} ${a * d < 0 ? '-' : '+'} ${Math.abs(a * d)}x ${b * c < 0 ? '-' : '+'} ${Math.abs(b * c)}x ${C < 0 ? '-' : '+'} ${Math.abs(C)}$`,
        `$= ${poly2(A, B, C)}$`,
      ],
    };
  },
};

const identite: Skill = {
  id: '2nde-identite',
  name: 'Utiliser une identité remarquable',
  generate(rng, level) {
    const a = level === 1 ? 1 : rng.int(1, level === 2 ? 3 : 5);
    const b = rng.int(1, level === 3 ? 9 : 6);
    const kind = rng.pick(['plus', 'moins', 'diff'] as const);
    const ax = a === 1 ? 'x' : `${a}x`;
    let expr: string;
    let correct: string;
    let decoys: string[];
    let rule: string;
    if (kind === 'diff') {
      expr = `(${ax} - ${b})(${ax} + ${b})`;
      correct = poly2(a * a, 0, -b * b);
      decoys = [poly2(a * a, 0, b * b), poly2(a * a, -2 * a * b, -b * b), poly2(a, 0, -b)];
      rule = '(a - b)(a + b) = a^2 - b^2';
    } else {
      const s = kind === 'plus' ? 1 : -1;
      expr = `(${ax} ${s > 0 ? '+' : '-'} ${b})^2`;
      correct = poly2(a * a, 2 * s * a * b, b * b);
      decoys = [poly2(a * a, 0, b * b), poly2(a * a, s * a * b, b * b), poly2(a * a, 2 * s * a * b, -b * b), poly2(a * a, -2 * s * a * b, b * b)];
      rule = s > 0 ? '(a + b)^2 = a^2 + 2ab + b^2' : '(a - b)^2 = a^2 - 2ab + b^2';
    }
    return {
      skill: '2nde-identite',
      level,
      prompt: `Développe $${expr}$.`,
      answer: latexChoice(rng, correct, decoys, () => poly2(a * a, rng.nonZero(-9, 9), b * b)),
      hint: 'Pense aux identités remarquables, et n’oublie pas le double produit.',
      correction: [`On utilise $${rule}$ avec $a = ${ax}$ et $b = ${b}$.`, `$${expr} = ${correct}$`],
    };
  },
};

const factoriser: Skill = {
  id: '2nde-factoriser',
  name: 'Factoriser une expression',
  generate(rng, level) {
    if (level === 1 || rng.next() < 0.4) {
      // a²x² - b² = (ax - b)(ax + b)
      const a = level === 1 ? 1 : rng.int(1, 5);
      const b = rng.int(1, 9);
      const ax = a === 1 ? 'x' : `${a}x`;
      const correct = `(${ax} - ${b})(${ax} + ${b})`;
      return {
        skill: '2nde-factoriser',
        level,
        prompt: `Factorise $${poly2(a * a, 0, -b * b)}$.`,
        answer: latexChoice(rng, correct, [`(${ax} - ${b})^2`, `(${ax} + ${b})^2`, `(${ax} - ${b * b})(${ax} + ${b * b})`, ...(a === 1 ? [] : [`${a * a}(x - ${b})(x + ${b})`])], () => `(${ax} - ${b + 1})(${ax} + ${b + 1})`),
        hint: 'Reconnais une différence de deux carrés : $a^2 - b^2 = (a - b)(a + b)$.',
        correction: [`$${poly2(a * a, 0, -b * b)} = ${a === 1 ? 'x' : `(${ax})`}^2 - ${b}^2$`, `$= ${correct}$`],
      };
    }
    // (x + p)(ax + b) + (x + p)(cx + d) = (x + p)((a + c)x + b + d)
    const p = rng.nonZero(-6, 6);
    const minus = level === 3 && rng.next() < 0.6;
    const a = rng.nonZero(-4, 4);
    const b = rng.nonZero(-6, 6);
    let c = a;
    // Le facteur restant doit garder un terme en x.
    while (c === (minus ? a : -a)) c = rng.nonZero(-4, 4);
    const d = rng.nonZero(-6, 6);
    const common = `(${affine(1, p)})`;
    const expr = `${common}(${affine(a, b)}) ${minus ? '-' : '+'} ${common}(${affine(c, d)})`;
    const c2 = minus ? -c : c;
    const d2 = minus ? -d : d;
    const correct = `${common}(${affine(a + c2, b + d2)})`;
    const wrongSign = `${common}(${affine(a + (minus ? c : -c), b + (minus ? d : -d))})`;
    return {
      skill: '2nde-factoriser',
      level,
      prompt: `Factorise $${expr}$.`,
      answer: latexChoice(
        rng,
        correct,
        [wrongSign, `${common}(${affine(a + c2, b - d2)})`, `${common}^2(${affine(a + c2, b + d2)})`, `(${affine(1, -p)})(${affine(a + c2, b + d2)})`],
        () => `${common}(${affine(a + c2 + rng.nonZero(-2, 2), b + d2)})`,
      ),
      hint: `Repère le facteur commun $${common}$, puis regroupe ce qui reste${minus ? ' en faisant attention au signe moins' : ''}.`,
      correction: [
        `Le facteur commun est $${common}$.`,
        `$${expr} = ${common}\\left[(${affine(a, b)}) ${minus ? '-' : '+'} (${affine(c, d)})\\right]$`,
        `$= ${correct}$`,
      ],
    };
  },
};

const equation1: Skill = {
  id: '2nde-equation-1',
  name: 'Résoudre une équation du premier degré',
  generate(rng, level) {
    // ax + b = cx + d, avec a ≠ c ; en niveau 3 la solution est une fraction.
    const a = rng.nonZero(-9, 9);
    const den = level === 3 ? rng.pick([2, 3, 4, 5]) : 1;
    const c = level === 1 ? 0 : a + den * rng.pick([-1, 1]) * (level === 3 ? 1 : rng.int(1, 3));
    let x = frac(rng.int(-9, 9));
    if (level === 3) while (x.d === 1) x = frac(rng.nonZero(-12, 12), den);
    const d = rng.int(-15, 15);
    // b = (c - a)x + d est entier car le dénominateur de x divise c - a.
    const b = ((c - a) * x.n) / x.d + d;
    const left = affine(a, b);
    const right = affine(c, d);
    return {
      skill: '2nde-equation-1',
      level,
      prompt: `Résous l'équation $${left} = ${right}$.`,
      answer: { kind: 'number', value: x },
      hint: 'Regroupe les termes en $x$ d’un côté et les nombres de l’autre, puis divise par le coefficient de $x$.',
      correction: [
        `On regroupe : $${terms([[a, 'x'], [-c, 'x']])} = ${terms([[d, ''], [-b, '']])}$`,
        `$${affine(a - c, 0)} = ${d - b}$`,
        `$x = \\frac{${d - b}}{${a - c}} = ${fracLatex(x)}$`,
      ],
    };
  },
};

const produitNul: Skill = {
  id: '2nde-produit-nul',
  name: 'Résoudre une équation produit nul',
  generate(rng, level) {
    const a = level === 1 ? 1 : rng.nonZero(-4, 4);
    const c = level === 1 ? 1 : rng.nonZero(-5, 5);
    const b = rng.nonZero(-9, 9);
    const d = rng.nonZero(-9, 9);
    const r1 = frac(-b, a);
    const r2 = frac(-d, c);
    const same = r1.n === r2.n && r1.d === r2.d;
    return {
      skill: '2nde-produit-nul',
      level,
      prompt: `Résous l'équation $(${affine(a, b)})(${affine(c, d)}) = 0$.`,
      answer: { kind: 'set', values: same ? [r1] : [r1, r2] },
      hint: 'Un produit est nul si et seulement si l’un au moins de ses facteurs est nul.',
      correction: [
        `$${affine(a, b)} = 0$ ou $${affine(c, d)} = 0$`,
        `$x = ${fracLatex(r1)}$ ou $x = ${fracLatex(r2)}$`,
        same ? `Les deux facteurs s'annulent pour la même valeur : $S = \\{${fracLatex(r1)}\\}$.` : `$S = \\{${fracLatex(r1)}\\,;\\,${fracLatex(r2)}\\}$`,
      ],
    };
  },
};

const puissances: Skill = {
  id: '2nde-puissances',
  name: 'Calculer avec des puissances',
  generate(rng, level) {
    const base = rng.pick([2, 3, 5, 10]);
    const m = rng.int(level === 1 ? 1 : -5, 8);
    const n = rng.int(level === 1 ? 1 : -5, 8);
    const p = level === 1 ? 0 : rng.int(-4, 6);
    const q = level === 3 ? rng.pick([2, 3]) : 1;
    const k = (m + n - p) * q;
    const e = (v: number) => (v < 0 ? `{${v}}` : `${v}`);
    const inner = p === 0 ? `${base}^${e(m)} \\times ${base}^${e(n)}` : `\\frac{${base}^${e(m)} \\times ${base}^${e(n)}}{${base}^${e(p)}}`;
    const expr = q === 1 ? inner : `\\left(${inner}\\right)^${q}`;
    return {
      skill: '2nde-puissances',
      level,
      prompt: `On a $${expr} = ${base}^k$. Que vaut $k$ ?`,
      answer: { kind: 'number', value: frac(k) },
      hint: '$a^m \\times a^n = a^{m+n}$, $\\frac{a^m}{a^p} = a^{m-p}$ et $(a^m)^q = a^{mq}$.',
      correction: [
        `Au numérateur : $${base}^{${m} + ${par(n)}} = ${base}^{${m + n}}$.`,
        ...(p === 0 ? [] : [`On divise : $${base}^{${m + n} - ${par(p)}} = ${base}^{${m + n - p}}$.`]),
        ...(q === 1 ? [] : [`Puis la puissance : $(${base}^{${m + n - p}})^${q} = ${base}^{${k}}$.`]),
        `Donc $k = ${k}$.`,
      ],
    };
  },
};

const racines: Skill = {
  id: '2nde-racines',
  name: 'Simplifier une racine carrée',
  generate(rng, level) {
    const b = rng.pick(level === 1 ? [2, 3, 5] : [2, 3, 5, 6, 7, 10]);
    const a = rng.int(2, level === 1 ? 5 : level === 2 ? 7 : 12);
    const n = a * a * b;
    return {
      skill: '2nde-racines',
      level,
      prompt: `Écris $\\sqrt{${n}}$ sous la forme $a\\sqrt{b}$, avec $a$ et $b$ entiers et $b$ le plus petit possible.`,
      answer: { kind: 'pair', values: [frac(a), frac(b)], labels: ['a', 'b'] },
      hint: `Cherche le plus grand carré parfait qui divise $${n}$, puis utilise $\\sqrt{xy} = \\sqrt{x}\\sqrt{y}$.`,
      correction: [`$${n} = ${a * a} \\times ${b}$ et $${a * a} = ${a}^2$.`, `$\\sqrt{${n}} = \\sqrt{${a * a}} \\times \\sqrt{${b}} = ${a}\\sqrt{${b}}$`],
    };
  },
};

const fractions: Skill = {
  id: '2nde-fractions',
  name: 'Calculer avec des fractions',
  generate(rng, level) {
    const d1 = rng.int(2, level === 1 ? 6 : 9);
    let d2 = rng.int(2, level === 1 ? 6 : 9);
    if (level === 1) d2 = d1 * rng.int(1, 2);
    const n1 = rng.nonZero(-9, 9);
    const n2 = rng.nonZero(-9, 9);
    const op = level === 3 ? rng.pick(['+', '-', '\\times', '\\div'] as const) : rng.pick(['+', '-'] as const);
    let result;
    let steps: string[];
    const raw = (n: number, d: number) => `${n < 0 ? '-' : ''}\\frac{${Math.abs(n)}}{${d}}`;
    const f1 = raw(n1, d1);
    if (op === '+' || op === '-') {
      const s = op === '+' ? 1 : -1;
      result = frac(n1 * d2 + s * n2 * d1, d1 * d2);
      steps = [`On met au même dénominateur, puis on ${op === '+' ? 'additionne' : 'soustrait'} les numérateurs.`];
    } else if (op === '\\times') {
      result = frac(n1 * n2, d1 * d2);
      steps = ['On multiplie les numérateurs entre eux et les dénominateurs entre eux.'];
    } else {
      result = frac(n1 * d2, d1 * n2);
      steps = ['Diviser, c’est multiplier par l’inverse.'];
    }
    const second = n2 < 0 ? `\\left(${raw(n2, d2)}\\right)` : raw(n2, d2);
    return {
      skill: '2nde-fractions',
      level,
      prompt: `Calcule $${f1} ${op} ${second}$ et donne le résultat sous forme irréductible.`,
      answer: { kind: 'number', value: result },
      hint: op === '+' || op === '-' ? 'Mets les deux fractions au même dénominateur.' : 'Pense à simplifier à la fin.',
      correction: [...steps, `$${f1} ${op} ${second} = ${fracLatex(result)}$`],
    };
  },
};

export const CALCUL_LITTERAL_SKILLS: Skill[] = [developper, identite, factoriser, equation1, produitNul, puissances, racines, fractions];
