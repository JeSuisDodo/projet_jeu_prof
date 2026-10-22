import type { Rng } from '../rng';
import type { Level, Skill } from '../types';
import { latexChoice, num } from './outils';

/** 5e : enchaînement d'opérations, priorités et parenthèses. */

interface Calc {
  expr: string;
  value: number;
  steps: string[];
}

/** Calculs sans parenthèses : × et ÷ avant + et −. */
function sansParentheses(rng: Rng, level: Level): Calc {
  for (;;) {
    const form = level === 1 ? rng.int(0, 2) : level === 2 ? rng.int(3, 5) : rng.int(6, 7);
    const a = rng.int(2, level === 1 ? 20 : 40);
    const b = rng.int(2, 9);
    const c = rng.int(2, 9);
    const d = rng.int(2, 9);
    const e = rng.int(2, 15);
    let calc: Calc;
    switch (form) {
      case 0:
        calc = { expr: `${a} + ${b} \\times ${c}`, value: a + b * c, steps: [`${a} + ${b * c}`] };
        break;
      case 1:
        calc = { expr: `${a} \\times ${b} - ${c}`, value: a * b - c, steps: [`${a * b} - ${c}`] };
        break;
      case 2:
        calc = { expr: `${a} - ${b} \\times ${c}`, value: a - b * c, steps: [`${a} - ${b * c}`] };
        break;
      case 3:
        calc = { expr: `${a} + ${b} \\times ${c} - ${d}`, value: a + b * c - d, steps: [`${a} + ${b * c} - ${d}`, `${a + b * c} - ${d}`] };
        break;
      case 4:
        calc = { expr: `${a} \\times ${b} + ${c} \\times ${d}`, value: a * b + c * d, steps: [`${a * b} + ${c * d}`] };
        break;
      case 5:
        calc = { expr: `${a} - ${b * c} \\div ${c}`, value: a - b, steps: [`${a} - ${b}`] };
        break;
      case 6:
        calc = {
          expr: `${a} \\times ${b} - ${c * d} \\div ${d} + ${e}`,
          value: a * b - c + e,
          steps: [`${a * b} - ${c} + ${e}`, `${a * b - c} + ${e}`],
        };
        break;
      default:
        calc = {
          expr: `${a} + ${b} \\times ${c} - ${d} \\times ${e}`,
          value: a + b * c - d * e,
          steps: [`${a} + ${b * c} - ${d * e}`, `${a + b * c} - ${d * e}`],
        };
    }
    if (calc.value >= 0) return calc;
  }
}

/** Calculs avec parenthèses (et crochets au niveau 3). */
function avecParentheses(rng: Rng, level: Level): Calc {
  for (;;) {
    const a = rng.int(2, 12);
    const b = rng.int(2, 15);
    const c = rng.int(2, 15);
    const d = rng.int(2, 9);
    const e = rng.int(1, 9);
    const form = level === 1 ? rng.int(0, 1) : level === 2 ? rng.int(2, 3) : rng.int(4, 5);
    let calc: Calc;
    switch (form) {
      case 0:
        calc = { expr: `${a} \\times (${b} + ${c})`, value: a * (b + c), steps: [`${a} \\times ${b + c}`] };
        break;
      case 1:
        calc = { expr: `(${a + b} - ${a}) \\times ${d}`, value: b * d, steps: [`${b} \\times ${d}`] };
        break;
      case 2:
        calc = { expr: `(${a} + ${b}) \\times (${c} - ${d})`, value: (a + b) * (c - d), steps: [`${a + b} \\times ${c - d}`] };
        break;
      case 3:
        calc = { expr: `${b + c} - (${b} - ${e})`, value: c + e, steps: [`${b + c} - ${b - e}`] };
        break;
      case 4:
        calc = {
          expr: `${a} \\times [${b} + ${d} \\times (${c} - ${e})]`,
          value: a * (b + d * (c - e)),
          steps: [`${a} \\times [${b} + ${d} \\times ${c - e}]`, `${a} \\times [${b} + ${d * (c - e)}]`, `${a} \\times ${b + d * (c - e)}`],
        };
        break;
      default:
        calc = {
          expr: `${b * 4} - ${d} \\times (${c} - ${e}) + ${a}`,
          value: b * 4 - d * (c - e) + a,
          steps: [`${b * 4} - ${d} \\times ${c - e} + ${a}`, `${b * 4} - ${d * (c - e)} + ${a}`],
        };
    }
    // Pas de nombre négatif en cours de calcul (« -3 » s'écrit collé, l'opération « - 3 » avec espace).
    if (calc.value >= 0 && !calc.steps.some((s) => /-\d/.test(s))) return calc;
  }
}

/** Calcul « de gauche à droite », sans respecter les priorités : l'erreur la plus fréquente. */
function leftToRight(expr: string): number {
  const tokens = expr.replace(/\\times/g, '*').replace(/\\div/g, '/').replace(/[()[\]]/g, ' ').split(/\s+/).filter(Boolean);
  let acc = Number(tokens[0]);
  for (let i = 1; i < tokens.length; i += 2) {
    const v = Number(tokens[i + 1]);
    const op = tokens[i];
    acc = op === '+' ? acc + v : op === '-' ? acc - v : op === '*' ? acc * v : acc / v;
  }
  return acc;
}

const priorites: Skill = {
  id: '5e-priorites',
  name: 'Respecter les priorités opératoires',
  generate(rng, level) {
    const { expr, value, steps } = sansParentheses(rng, level);
    const wrong = leftToRight(expr);
    return {
      skill: '5e-priorites',
      level,
      prompt: `Calcule $A = ${expr}$.`,
      answer: num(value),
      hint: 'Les multiplications et les divisions passent avant les additions et les soustractions.',
      correction: [
        ...steps.map((s) => `$A = ${s}$`),
        `$A = ${value}$`,
        ...(Number.isInteger(wrong) && wrong !== value ? [`Attention : calculer de gauche à droite donnerait $${wrong}$, ce qui est faux.`] : []),
      ],
    };
  },
};

const parentheses: Skill = {
  id: '5e-parentheses',
  name: 'Calculer avec des parenthèses',
  generate(rng, level) {
    const { expr, value, steps } = avecParentheses(rng, level);
    return {
      skill: '5e-parentheses',
      level,
      prompt: `Calcule $B = ${expr}$.`,
      answer: num(value),
      hint: level === 3 ? 'Commence par les parenthèses les plus intérieures, puis les crochets.' : 'On effectue d’abord les calculs entre parenthèses.',
      correction: [...steps.map((s) => `$B = ${s}$`), `$B = ${value}$`],
    };
  },
};

const quotient: Skill = {
  id: '5e-trait-fraction',
  name: 'Calculer avec un trait de fraction',
  generate(rng, level) {
    const q = rng.int(2, 12);
    let top: string;
    let bottom: string;
    let topValue: number;
    let den: number;
    if (level === 1) {
      den = rng.int(2, 9);
      topValue = q * den;
      const a = rng.int(1, topValue - 1);
      top = `${a} + ${topValue - a}`;
      bottom = `${den}`;
    } else if (level === 2) {
      den = rng.int(4, 15);
      const c = rng.int(1, den - 1);
      bottom = `${c} + ${den - c}`;
      topValue = q * den;
      top = `${den} \\times ${q}`;
      if (rng.next() < 0.5) {
        const a = rng.int(1, topValue - 1);
        top = `${topValue - a} + ${a}`;
      }
    } else {
      const e = rng.int(1, 9);
      den = rng.int(3, 9); // numérateur d'au moins 6, pour pouvoir y glisser un produit
      bottom = `${den + e} - ${e}`;
      topValue = q * den;
      let b: number;
      let c: number;
      do {
        b = rng.int(2, 9);
        c = rng.int(2, 9);
      } while (b * c >= topValue);
      top = `${topValue - b * c} + ${b} \\times ${c}`;
    }
    return {
      skill: '5e-trait-fraction',
      level,
      prompt: `Calcule $C = \\dfrac{${top}}{${bottom}}$.`,
      answer: num(q),
      hint: 'Le trait de fraction joue le rôle de parenthèses : calcule d’abord le numérateur et le dénominateur.',
      correction: [`$C = \\dfrac{${topValue}}{${den}}$`, `$C = ${topValue} \\div ${den} = ${q}$`],
    };
  },
};

interface Sentence {
  text: string;
  correct: string;
  decoys: string[];
}

function sentences(a: number, b: number, c: number, d: number): Sentence[] {
  return [
    {
      text: `la somme de ${a} et du produit de ${b} par ${c}`,
      correct: `${a} + ${b} \\times ${c}`,
      decoys: [`(${a} + ${b}) \\times ${c}`, `${a} \\times ${b} + ${c}`, `${a} + ${b} + ${c}`],
    },
    {
      text: `le produit de ${a} par la somme de ${b} et ${c}`,
      correct: `${a} \\times (${b} + ${c})`,
      decoys: [`${a} \\times ${b} + ${c}`, `${a} + ${b} \\times ${c}`, `${a} \\times (${b} - ${c})`],
    },
    {
      text: `la différence entre ${a * c + b} et le quotient de ${b * c} par ${c}`,
      correct: `${a * c + b} - ${b * c} \\div ${c}`,
      decoys: [`(${a * c + b} - ${b * c}) \\div ${c}`, `${b * c} \\div ${c} - ${a * c + b}`, `${a * c + b} \\div ${b * c} - ${c}`],
    },
    {
      text: `le quotient de la somme de ${a} et ${b} par ${c}`,
      correct: `(${a} + ${b}) \\div ${c}`,
      decoys: [`${a} + ${b} \\div ${c}`, `${a} \\div (${b} + ${c})`, `${c} \\div (${a} + ${b})`],
    },
    {
      text: `le produit de la somme de ${a} et ${b} par la différence de ${c + d} et ${d}`,
      correct: `(${a} + ${b}) \\times (${c + d} - ${d})`,
      decoys: [`${a} + ${b} \\times ${c + d} - ${d}`, `(${a} + ${b}) \\times ${c + d} - ${d}`, `${a} + ${b} \\times (${c + d} - ${d})`],
    },
    {
      text: `la somme du produit de ${a} par ${b} et du produit de ${c} par ${d}`,
      correct: `${a} \\times ${b} + ${c} \\times ${d}`,
      decoys: [`${a} \\times (${b} + ${c}) \\times ${d}`, `(${a} + ${b}) \\times (${c} + ${d})`, `${a} + ${b} \\times ${c} + ${d}`],
    },
  ];
}

const traduire: Skill = {
  id: '5e-traduire-phrase',
  name: 'Traduire une phrase par un calcul',
  generate(rng, level) {
    const [a, b, c, d] = rng.shuffle([2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 4);
    const all = sentences(a, b, c, d);
    const pool = level === 1 ? all.slice(0, 2) : level === 2 ? all.slice(0, 4) : all.slice(2);
    const s = rng.pick(pool);
    return {
      skill: '5e-traduire-phrase',
      level,
      prompt: `Quel calcul correspond à la phrase : « ${s.text} » ?`,
      answer: latexChoice(rng, s.correct, s.decoys, () => `${a} \\times ${b} \\times ${c}`),
      hint: 'Repère la dernière opération effectuée : c’est elle qui donne son nom au calcul (somme, différence, produit ou quotient).',
      correction: [`La phrase se traduit par $${s.correct}$.`, 'Les parenthèses servent à calculer d’abord la somme ou la différence demandée.'],
    };
  },
};

const astucieux: Skill = {
  id: '5e-calcul-astucieux',
  name: 'Calculer astucieusement (distributivité)',
  generate(rng, level) {
    const k = rng.int(level === 1 ? 3 : 12, level === 1 ? 19 : 49);
    let expr: string;
    let steps: string[];
    let value: number;
    const form = level === 1 ? rng.pick([0, 1]) : level === 2 ? rng.pick([2, 3]) : rng.pick([4, 5]);
    if (form === 0) {
      expr = `${k} \\times 11`;
      steps = [`${k} \\times (10 + 1)`, `${k} \\times 10 + ${k} \\times 1`, `${10 * k} + ${k}`];
      value = 11 * k;
    } else if (form === 1) {
      expr = `${k} \\times 9`;
      steps = [`${k} \\times (10 - 1)`, `${k} \\times 10 - ${k} \\times 1`, `${10 * k} - ${k}`];
      value = 9 * k;
    } else if (form === 2) {
      const b = rng.int(2, 8);
      expr = `${k} \\times ${b} + ${k} \\times ${10 - b}`;
      steps = [`${k} \\times (${b} + ${10 - b})`, `${k} \\times 10`];
      value = 10 * k;
    } else if (form === 3) {
      expr = `${k} \\times 101`;
      steps = [`${k} \\times (100 + 1)`, `${100 * k} + ${k}`];
      value = 101 * k;
    } else if (form === 4) {
      expr = `${k} \\times 99`;
      steps = [`${k} \\times (100 - 1)`, `${100 * k} - ${k}`];
      value = 99 * k;
    } else {
      const b = rng.int(2, 40);
      expr = `${k} \\times ${b + 100} - ${k} \\times ${b}`;
      steps = [`${k} \\times (${b + 100} - ${b})`, `${k} \\times 100`];
      value = 100 * k;
    }
    return {
      skill: '5e-calcul-astucieux',
      level,
      prompt: `Calcule astucieusement $D = ${expr}$.`,
      answer: num(value),
      hint: 'Utilise la distributivité : $k \\times (a + b) = k \\times a + k \\times b$.',
      correction: [...steps.map((s) => `$D = ${s}$`), `$D = ${value}$`],
    };
  },
};

export const PRIORITES_SKILLS: Skill[] = [priorites, parentheses, quotient, traduire, astucieux];
