import type { Skill } from '../types';
import { terms } from '../seconde/outils';
import { dec, gcd, latexChoice, num, yesNo } from './outils';

/** 5e : introduction du calcul littéral (substituer, tester, réduire, distributivité simple). */

const affine = (a: number, b: number, v = 'x') => terms([[a, v], [b, '']]);

const substituer: Skill = {
  id: '5e-substituer',
  name: 'Calculer une expression pour une valeur',
  generate(rng, level) {
    const a = rng.int(2, 9);
    const b = rng.int(1, 12);
    const x = level === 3 ? rng.int(1, 9) + rng.pick([0.5, 0.2, 0.1]) : rng.int(level === 1 ? 1 : 2, level === 1 ? 6 : 12);
    const forms: [string, number, string][] = [
      [`${a}x + ${b}`, a * x + b, `${a} \\times ${dec(x)} + ${b}`],
      [`${a}x - ${b}`, a * x - b, `${a} \\times ${dec(x)} - ${b}`],
      [`${a}(x + ${b})`, a * (x + b), `${a} \\times (${dec(x)} + ${b})`],
      [`x^2 + ${b}`, x * x + b, `${dec(x)} \\times ${dec(x)} + ${b}`],
      [`${a}x^2 - x`, a * x * x - x, `${a} \\times ${dec(x)} \\times ${dec(x)} - ${dec(x)}`],
    ];
    const pool = level === 1 ? forms.slice(0, 3) : forms;
    let pick = rng.pick(pool);
    while (pick[1] < 0) pick = forms[0];
    const [expr, value, calc] = pick;
    return {
      skill: '5e-substituer',
      level,
      prompt: `Calcule $${expr}$ pour $x = ${dec(x)}$.`,
      answer: num(value),
      hint: 'Remplace chaque $x$ par sa valeur et rétablis les signes $\\times$ cachés.',
      correction: [`$${calc}$`, `$= ${dec(value)}$`],
    };
  },
};

const tester: Skill = {
  id: '5e-tester-egalite',
  name: 'Tester une égalité',
  generate(rng, level) {
    let a: number;
    let c: number;
    do {
      a = rng.int(1, 9);
      c = rng.int(1, 9);
    } while (a === c);
    const x0 = rng.int(1, level === 1 ? 5 : 9);
    const b = rng.int(-10, 15);
    const d = (a - c) * x0 + b;
    const yes = rng.next() < 0.5;
    const x = yes ? x0 : x0 + rng.pick([1, 2, -1].filter((k) => x0 + k > 0));
    const left = a * x + b;
    const right = c * x + d;
    const lhs = affine(a, b);
    const rhs = affine(c, d);
    return {
      skill: '5e-tester-egalite',
      level,
      prompt: `L'égalité $${lhs} = ${rhs}$ est-elle vraie pour $x = ${x}$ ?`,
      answer: yesNo(left === right),
      hint: 'Calcule séparément chaque membre de l’égalité pour cette valeur, puis compare les résultats.',
      correction: [
        `À gauche : $${a === 1 ? '' : `${a} \\times `}${x} ${b < 0 ? '-' : '+'} ${Math.abs(b)} = ${left}$`,
        `À droite : $${c === 1 ? '' : `${c} \\times `}${x} ${d < 0 ? '-' : '+'} ${Math.abs(d)} = ${right}$`,
        left === right ? `Les deux membres sont égaux : l'égalité est vraie pour $x = ${x}$.` : `$${left} \\neq ${right}$ : l'égalité est fausse pour $x = ${x}$.`,
      ],
    };
  },
};

const ecriture: Skill = {
  id: '5e-simplifier-ecriture',
  name: 'Simplifier l’écriture d’un produit',
  generate(rng, level) {
    const k = rng.int(2, 9);
    const [u, v] = rng.shuffle(['a', 'b', 'x', 'y', 't']).slice(0, 2);
    const cases: [string, string, string[]][] = [
      [`${k} \\times ${u}`, `${k}${u}`, [`${k} + ${u}`, `${u}^{${k}}`, `${k}${u}^2`]],
      [`${u} \\times ${u}`, `${u}^2`, [`2${u}`, `${u}${u}2`, `${u} + ${u}`]],
      [`${u} \\times ${k} \\times ${v}`, `${k}${u}${v}`, [`${k} + ${u}${v}`, `${k}${u} + ${v}`, `${u}${v}^{${k}}`]],
      [`${k} \\times ${u} \\times ${u}`, `${k}${u}^2`, [`${2 * k}${u}`, `(${k}${u})^2`, `${k} + ${u}^2`]],
      [`${u} \\times ${u} \\times ${u}`, `${u}^3`, [`3${u}`, `${u}^2 + ${u}`, `3${u}^3`]],
      [`${k} \\times ${u} \\times ${k + 1} \\times ${v}`, `${k * (k + 1)}${u}${v}`, [`${2 * k + 1}${u}${v}`, `${k}${u}${k + 1}${v}`, `${k * (k + 1)}${u} + ${v}`]],
    ];
    const pool = level === 1 ? cases.slice(0, 3) : level === 2 ? cases.slice(1, 5) : cases.slice(3);
    const [expr, correct, decoys] = rng.pick(pool);
    return {
      skill: '5e-simplifier-ecriture',
      level,
      prompt: `Quelle est l'écriture simplifiée de $${expr}$ ?`,
      answer: latexChoice(rng, correct, decoys, () => `${k + 1}${u}`),
      hint: 'On peut supprimer le signe $\\times$ devant une lettre ou une parenthèse ; $a \\times a$ s’écrit $a^2$.',
      correction: [`$${expr} = ${correct}$`],
    };
  },
};

const reduire: Skill = {
  id: '5e-reduire',
  name: 'Réduire une expression',
  generate(rng, level) {
    if (level === 1) {
      const [a, b] = [rng.int(1, 9), rng.int(1, 9)];
      const minus = rng.next() < 0.4 && a > b;
      const r = minus ? a - b : a + b;
      const expr = `${a}x ${minus ? '-' : '+'} ${b}x`;
      return {
        skill: '5e-reduire',
        level,
        prompt: `Réduis l'expression $${expr}$.`,
        answer: latexChoice(rng, affine(r, 0), [`${a * b}x`, `${r}x^2`, minus ? `${a + b}x` : `${a + b + 1}x`], () => `${r + 2}x`),
        hint: `On regroupe les termes en $x$ : $a x + b x = (a + b) x$.`,
        correction: [`$${expr} = (${a} ${minus ? '-' : '+'} ${b})x = ${affine(r, 0)}$`],
      };
    }
    if (level === 2) {
      const a = rng.int(2, 9);
      const b = rng.int(1, 9);
      const c = rng.int(1, 9);
      const d = rng.int(1, 9) * rng.sign();
      const expr = `${a}x + ${b} + ${c}x ${d < 0 ? '-' : '+'} ${Math.abs(d)}`;
      const correct = affine(a + c, b + d);
      return {
        skill: '5e-reduire',
        level,
        prompt: `Réduis l'expression $${expr}$.`,
        answer: latexChoice(rng, correct, [`${a + b + c + d}x`, affine(a + c, b - d), `${a + c}x^2 ${b + d < 0 ? '-' : '+'} ${Math.abs(b + d)}`, affine(a * c, b + d)], () => affine(a + c + 1, b + d)),
        hint: 'Regroupe les termes en $x$ entre eux, et les nombres entre eux. On ne mélange pas les deux.',
        correction: [`$${expr} = ${a}x + ${c}x + ${b} ${d < 0 ? '-' : '+'} ${Math.abs(d)}$`, `$= ${correct}$`],
      };
    }
    const a = rng.int(1, 6);
    const b = rng.int(2, 9);
    const c = rng.int(1, 6);
    const e = rng.int(1, b - 1);
    const expr = `${a === 1 ? '' : a}x^2 + ${b}x + ${c === 1 ? '' : c}x^2 - ${e}x`;
    const correct = terms([[a + c, 'x^2'], [b - e, 'x']]);
    return {
      skill: '5e-reduire',
      level,
      prompt: `Réduis l'expression $${expr}$.`,
      answer: latexChoice(rng, correct, [terms([[a + c + b - e, 'x^2']]), terms([[a + c + b - e, 'x^3']]), terms([[a + c, 'x^2'], [b + e, 'x']]), terms([[a * c, 'x^2'], [b - e, 'x']])], () => terms([[a + c + 1, 'x^2'], [b - e, 'x']])),
      hint: 'Les termes en $x^2$ et les termes en $x$ ne se regroupent pas ensemble.',
      correction: [`$${expr} = (${a} + ${c})x^2 + (${b} - ${e})x$`, `$= ${correct}$`],
    };
  },
};

const developper: Skill = {
  id: '5e-developper',
  name: 'Développer avec la distributivité simple',
  generate(rng, level) {
    const k = rng.int(2, 9);
    const a = level === 1 ? 1 : rng.int(2, 7);
    const b = rng.int(1, 9);
    const minus = level > 1 && rng.next() < 0.5;
    const inner = `${a === 1 ? '' : a}x ${minus ? '-' : '+'} ${b}`;
    const correct = affine(k * a, minus ? -k * b : k * b);
    const decoys = [affine(k * a, minus ? -b : b), affine(a, minus ? -k * b : k * b), `${k * a + k * b}x`, affine(k + a, minus ? -k * b : k * b)];
    if (level === 3) {
      const c = rng.int(1, 9);
      const total = affine(k * a + c, minus ? -k * b : k * b);
      return {
        skill: '5e-developper',
        level,
        prompt: `Développe et réduis $${k}(${inner}) + ${c}x$.`,
        answer: latexChoice(rng, total, [affine(k * a + c, minus ? -b : b), affine(a + c, minus ? -k * b : k * b), affine(k * a, (minus ? -k * b : k * b) + c), `${k * a + c + k * b}x`], () => affine(k * a + c + 1, minus ? -k * b : k * b)),
        hint: 'Développe d’abord, puis regroupe les termes en $x$.',
        correction: [`$${k}(${inner}) + ${c}x = ${correct} + ${c}x$`, `$= ${total}$`],
      };
    }
    return {
      skill: '5e-developper',
      level,
      prompt: `Développe $${k}(${inner})$.`,
      answer: latexChoice(rng, correct, decoys, () => affine(k * a + 1, k * b)),
      hint: 'On multiplie chaque terme de la parenthèse : $k(a + b) = ka + kb$.',
      correction: [`$${k}(${inner}) = ${k} \\times ${a === 1 ? '' : `${a}`}x ${minus ? '-' : '+'} ${k} \\times ${b}$`, `$= ${correct}$`],
    };
  },
};

const factoriser: Skill = {
  id: '5e-factoriser',
  name: 'Factoriser avec la distributivité simple',
  generate(rng, level) {
    const k = rng.int(2, 9);
    let a: number;
    let b: number;
    // a et b premiers entre eux : le facteur k est alors le plus grand possible.
    do {
      a = level === 1 ? 1 : rng.int(1, 6);
      b = rng.int(1, 9);
    } while (gcd(a, b) !== 1 || (level === 3 && a === 1));
    const expr = affine(k * a, k * b);
    const inner = affine(a, b);
    const correct = `${k}(${inner})`;
    return {
      skill: '5e-factoriser',
      level,
      prompt: `Factorise $${expr}$.`,
      answer: latexChoice(rng, correct, [`${k}(${affine(k * a, b)})`, `${k}x(${affine(a, b)})`, `${k}(${affine(a, k * b)})`, `${k * a}(x + ${k * b})`], () => `${k + 1}(${inner})`),
      hint: `Cherche le facteur commun aux deux termes : ici, $${k}$.`,
      correction: [`$${expr} = ${k} \\times ${a === 1 ? '' : a}x + ${k} \\times ${b}$`, `$= ${correct}$`],
    };
  },
};

const programme: Skill = {
  id: '5e-programme-calcul',
  name: 'Utiliser un programme de calcul',
  generate(rng, level) {
    const m = rng.int(2, 6);
    const p = rng.int(1, 12);
    const q = rng.int(1, 9);
    const steps = level === 1 ? [`multiplier par ${m}`, `ajouter ${p}`] : [`ajouter ${p}`, `multiplier par ${m}`, `soustraire ${q}`];
    const run = (x: number) => (level === 1 ? x * m + p : (x + p) * m - q);
    const text = `« Choisir un nombre ; ${steps.join(' ; ')}. »`;
    if (level === 3) {
      const x = rng.int(1, 15);
      const r = run(x);
      return {
        skill: '5e-programme-calcul',
        level,
        prompt: `Voici un programme de calcul : ${text} On obtient $${r}$. Quel nombre a-t-on choisi au départ ?`,
        answer: num(x),
        hint: 'Remonte le programme à l’envers : chaque opération est remplacée par l’opération contraire.',
        correction: [`$${r} + ${q} = ${r + q}$, puis $${r + q} \\div ${m} = ${(r + q) / m}$, puis $${(r + q) / m} - ${p} = ${x}$.`, `On a choisi $${x}$. Vérification : $(${x} + ${p}) \\times ${m} - ${q} = ${r}$.`],
      };
    }
    const x = rng.int(1, level === 1 ? 10 : 20);
    const r = run(x);
    return {
      skill: '5e-programme-calcul',
      level,
      prompt: `Voici un programme de calcul : ${text} Quel résultat obtient-on en choisissant $${x}$ ?`,
      answer: num(r),
      hint: 'Applique les étapes une par une, dans l’ordre.',
      correction: level === 1 ? [`$${x} \\times ${m} = ${x * m}$`, `$${x * m} + ${p} = ${r}$`] : [`$${x} + ${p} = ${x + p}$`, `$${x + p} \\times ${m} = ${(x + p) * m}$`, `$${(x + p) * m} - ${q} = ${r}$`],
    };
  },
};

export const CALCUL_LITTERAL_SKILLS: Skill[] = [substituer, tester, ecriture, reduire, developper, factoriser, programme];
