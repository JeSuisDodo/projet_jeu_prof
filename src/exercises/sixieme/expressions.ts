import type { Rng } from '../rng';
import type { Level, Skill } from '../types';
import { byLevel, decimal, fix, makeChoice, num, numAnswer, skill, yesNo } from './outils';

/** Calculs en ligne : priorités opératoires, parenthèses, traduction d'un programme, formules, nombre manquant. */

interface Expr {
  latex: string;
  value: number;
  steps: string[];
}

/** Expressions sans parenthèses : la multiplication (ou la division) passe avant. */
function sansParentheses(rng: Rng, level: Level): Expr {
  const a = rng.int(2, byLevel(level, 20, 50, 99));
  const b = rng.int(2, 9);
  const c = rng.int(2, 12);
  const d = rng.int(2, 9);
  const forms: Expr[] = [
    { latex: `${a} + ${b} \\times ${c}`, value: a + b * c, steps: [`${a} + ${b * c}`] },
    { latex: `${b} \\times ${c} + ${a}`, value: b * c + a, steps: [`${b * c} + ${a}`] },
    { latex: `${a + b * c} - ${b} \\times ${c}`, value: a, steps: [`${a + b * c} - ${b * c}`] },
  ];
  if (level >= 2) {
    forms.push(
      { latex: `${a} + ${b * c} \\div ${b}`, value: a + c, steps: [`${a} + ${c}`] },
      { latex: `${b} \\times ${c} - ${d} \\times ${b}`, value: b * c - d * b, steps: [`${b * c} - ${d * b}`] },
    );
  }
  if (level === 3) {
    forms.push(
      { latex: `${a} - ${b} \\times ${c} + ${d}`, value: a - b * c + d, steps: [`${a} - ${b * c} + ${d}`] },
      { latex: `${b * c * d} \\div ${c} \\div ${d}`, value: b, steps: [`${b * d} \\div ${d}`] },
    );
  }
  // Pas de nombre négatif en 6e, ni dans le résultat ni en cours de calcul.
  const ok = forms.filter((f) => f.value >= 0 && f.steps.every((step) => !/^(\d+) - (\d+)/.test(step) || Number(step.split(' - ')[0]) >= Number(step.split(' - ')[1].split(' ')[0])));
  return rng.pick(ok);
}

const priorites: Skill = skill('priorites', 'Appliquer les priorités opératoires', (rng, level) => {
  const e = sansParentheses(rng, level);
  return {
    prompt: `Calcule $${e.latex}$.`,
    answer: numAnswer(e.value),
    hint: 'Sans parenthèses, on effectue d’abord les multiplications et les divisions, puis les additions et soustractions de gauche à droite.',
    correction: [`$${e.latex} = ${e.steps.join(' = ')} = ${num(e.value)}$`],
  };
});

const parentheses: Skill = skill('parentheses', 'Calculer avec des parenthèses', (rng, level) => {
  const a = rng.int(2, 12);
  const b = rng.int(2, 12);
  const c = rng.int(2, 9);
  const d = rng.int(1, 20);
  const forms: Expr[] = [
    { latex: `(${a} + ${b}) \\times ${c}`, value: (a + b) * c, steps: [`${a + b} \\times ${c}`] },
    { latex: `${c} \\times (${a + b} - ${b})`, value: c * a, steps: [`${c} \\times ${a}`] },
  ];
  if (level >= 2)
    forms.push(
      { latex: `${d} + (${a} + ${b}) \\times ${c}`, value: d + (a + b) * c, steps: [`${d} + ${a + b} \\times ${c}`, `${d} + ${(a + b) * c}`] },
      { latex: `(${a * c} + ${b * c}) \\div ${c}`, value: a + b, steps: [`${a * c + b * c} \\div ${c}`] },
    );
  if (level === 3)
    forms.push(
      { latex: `${c} \\times [${d} + (${a} + ${b}) \\times 2]`, value: c * (d + (a + b) * 2), steps: [`${c} \\times [${d} + ${a + b} \\times 2]`, `${c} \\times [${d} + ${2 * (a + b)}]`, `${c} \\times ${d + 2 * (a + b)}`] },
      { latex: `(${a + b} - ${b}) \\times (${c} + ${d})`, value: a * (c + d), steps: [`${a} \\times ${c + d}`] },
    );
  const e = rng.pick(forms);
  return {
    prompt: `Calcule $${e.latex}$.`,
    answer: numAnswer(e.value),
    hint: 'On commence par les calculs entre parenthèses (les plus intérieures d’abord), puis on applique les priorités.',
    correction: [`$${e.latex} = ${e.steps.join(' = ')} = ${num(e.value)}$`],
  };
});

const traduire: Skill = skill('traduire', 'Traduire une phrase par un calcul', (rng, level) => {
  const a = rng.int(2, 15);
  const b = rng.int(2, 9);
  const c = rng.int(2, 9);
  const cases = [
    { text: `la somme de $${a}$ et du produit de $${b}$ par $${c}$`, good: `${a} + ${b} \\times ${c}`, bad: [`(${a} + ${b}) \\times ${c}`, `${a} \\times ${b} + ${c}`, `${a} + ${b} + ${c}`] },
    { text: `le produit de la somme de $${a}$ et $${b}$ par $${c}$`, good: `(${a} + ${b}) \\times ${c}`, bad: [`${a} + ${b} \\times ${c}`, `${a} \\times ${b} + ${c}`, `${a} \\times (${b} + ${c})`] },
    { text: `la différence entre $${a + b * c}$ et le produit de $${b}$ par $${c}$`, good: `${a + b * c} - ${b} \\times ${c}`, bad: [`(${a + b * c} - ${b}) \\times ${c}`, `${b} \\times ${c} - ${a + b * c}`, `${a + b * c} - ${b} - ${c}`] },
    { text: `le quotient de la somme de $${a * c}$ et $${b * c}$ par $${c}$`, good: `(${a * c} + ${b * c}) \\div ${c}`, bad: [`${a * c} + ${b * c} \\div ${c}`, `${c} \\div (${a * c} + ${b * c})`, `${a * c} \\div ${c} + ${b * c}`] },
    { text: `le double de la somme de $${a}$ et $${b}$`, good: `2 \\times (${a} + ${b})`, bad: [`2 \\times ${a} + ${b}`, `${a} + ${b} \\times 2`, `(${a} + ${b}) \\div 2`] },
  ];
  const pool = byLevel(level, cases.slice(0, 2), cases.slice(0, 4), cases);
  const k = rng.pick(pool);
  return {
    prompt: `Quelle expression traduit la phrase : « ${k.text} » ?`,
    answer: makeChoice(rng, `$${k.good}$`, k.bad.map((x) => `$${x}$`), () => `$${a} \\times ${b} \\times ${c}$`),
    hint: 'Le dernier mot-clé de la phrase (somme, différence, produit, quotient) donne la dernière opération à effectuer.',
    correction: [`« ${k.text} » s'écrit $${k.good}$.`],
  };
});

const formule: Skill = skill('formule', 'Utiliser une formule', (rng, level) => {
  const forms = [
    () => {
      const L = decimal(rng, 3, 20, level === 1 ? 0 : 1);
      const l = decimal(rng, 1, L - 0.5, level === 1 ? 0 : 1);
      const P = fix(2 * (L + l));
      return { text: `Le périmètre d'un rectangle est donné par $P = 2 \\times (L + \\ell)$. Calcule $P$ pour $L = ${num(L)}$ cm et $\\ell = ${num(l)}$ cm (en cm).`, value: P, steps: [`P = 2 \\times (${num(L)} + ${num(l)}) = 2 \\times ${num(fix(L + l))} = ${num(P)}`] };
    },
    () => {
      const n = rng.int(2, 15);
      const p = decimal(rng, 1, 5, level === 1 ? 0 : 2);
      const f = rng.int(1, 5);
      const v = fix(n * p + f);
      return { text: `Un cinéma de plein air calcule le prix à payer avec la formule $\\text{prix} = ${num(p)} \\times n + ${f}$, où $n$ est le nombre de places. Quel est le prix (en €) pour $n = ${n}$ ?`, value: v, steps: [`${num(p)} \\times ${n} + ${f} = ${num(fix(n * p))} + ${f} = ${num(v)}`] };
    },
    () => {
      const c = decimal(rng, 2, 15, level === 3 ? 1 : 0);
      const v = fix(4 * c);
      return { text: `Le périmètre d'un carré de côté $c$ est $P = 4 \\times c$. Calcule $P$ pour $c = ${num(c)}$ m (en m).`, value: v, steps: [`P = 4 \\times ${num(c)} = ${num(v)}`] };
    },
  ];
  if (level === 3)
    forms.push(() => {
      const a = rng.int(2, 9);
      const b = rng.int(2, 9);
      const x = rng.int(2, 9);
      const v = a * x * x + b;
      return { text: `Calcule $${a} \\times x \\times x + ${b}$ pour $x = ${x}$.`, value: v, steps: [`${a} \\times ${x} \\times ${x} + ${b} = ${a * x * x} + ${b} = ${v}`] };
    });
  const f = rng.pick(forms)();
  return {
    prompt: f.text,
    answer: numAnswer(f.value),
    hint: 'Remplace chaque lettre par sa valeur, puis calcule en respectant les priorités.',
    correction: f.steps.map((s) => `$${s}$`),
  };
});

const testEgalite: Skill = skill('test-egalite', 'Tester une égalité', (rng, level) => {
  const a = rng.int(2, 9);
  const b = rng.int(1, 20);
  const x = rng.int(1, byLevel(level, 9, 12, 15));
  const forms = [{ left: `${a} \\times x + ${b}`, val: a * x + b, calc: `${a} \\times ${x} + ${b} = ${a * x} + ${b} = ${a * x + b}` }];
  if (level === 3) forms.push({ left: `${a} \\times (x + ${b})`, val: a * (x + b), calc: `${a} \\times (${x} + ${b}) = ${a} \\times ${x + b} = ${a * (x + b)}` });
  const f = rng.pick(forms);
  const r = rng.next() < 0.5 ? f.val : f.val + rng.pick([a, -a, 1, -1, 2]);
  const yes = f.val === r;
  return {
    prompt: `L'égalité $${f.left} = ${r}$ est-elle vraie pour $x = ${x}$ ?`,
    answer: yesNo(yes),
    hint: 'Remplace $x$ par sa valeur dans le membre de gauche et compare avec le membre de droite.',
    correction: [`Pour $x = ${x}$ : $${f.calc}$.`, yes ? `On trouve bien $${r}$ : l'égalité est vraie.` : `On trouve $${f.val}$ et non $${r}$ : l'égalité est fausse.`],
  };
});

const manquant: Skill = skill('nombre-manquant', 'Trouver un nombre manquant', (rng, level) => {
  const kinds = byLevel(level, ['+', '×'], ['+', '-', '×'], ['+', '-', '×', '÷']);
  const kind = rng.pick(kinds);
  const x = level === 1 ? rng.int(2, 12) : kind === '×' || kind === '÷' ? rng.int(2, 15) : decimal(rng, 1, 30, level === 3 ? 2 : 1);
  const b = kind === '×' || kind === '÷' ? rng.int(2, 12) : level === 1 ? rng.int(3, 40) : decimal(rng, 1, 20, 1);
  const [eq, why] =
    kind === '+'
      ? [`\\ldots + ${num(b)} = ${num(fix(x + b))}`, `${num(fix(x + b))} - ${num(b)} = ${num(x)}`]
      : kind === '-'
        ? [`\\ldots - ${num(b)} = ${num(x)}`, `${num(x)} + ${num(b)} = ${num(fix(x + b))}`]
        : kind === '×'
          ? [`${num(b)} \\times \\ldots = ${num(b * x)}`, `${num(b * x)} \\div ${num(b)} = ${num(x)}`]
          : [`\\ldots \\div ${num(b)} = ${num(x)}`, `${num(x)} \\times ${num(b)} = ${num(b * x)}`];
  const ans = kind === '-' ? fix(x + b) : kind === '÷' ? b * x : x;
  return {
    prompt: `Complète : $${eq}$`,
    answer: numAnswer(ans),
    hint: 'Utilise l’opération inverse : l’addition et la soustraction se « défont » mutuellement, de même que la multiplication et la division.',
    correction: [`$${why}$`, `Le nombre manquant est $${num(ans)}$.`],
  };
});

export const EXPRESSIONS_SKILLS: Skill[] = [priorites, parentheses, traduire, formule, testEgalite, manquant];
