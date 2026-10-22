import type { Rng } from '../rng';
import type { Skill } from '../types';
import { binom, fixedChoice, texChoice, num, setOf, setTex, skill } from './util';

/** Chapitre « Logique et ensembles » (Licence 1). */

const negations: [string, string, string[]][] = [
  ['\\forall x \\in \\mathbb{R},\\ f(x) > 0', '\\exists x \\in \\mathbb{R},\\ f(x) \\leq 0', ['\\exists x \\in \\mathbb{R},\\ f(x) < 0', '\\forall x \\in \\mathbb{R},\\ f(x) \\leq 0', '\\forall x \\in \\mathbb{R},\\ f(x) < 0']],
  ['\\exists x \\in \\mathbb{R},\\ f(x) = 0', '\\forall x \\in \\mathbb{R},\\ f(x) \\neq 0', ['\\exists x \\in \\mathbb{R},\\ f(x) \\neq 0', '\\forall x \\in \\mathbb{R},\\ f(x) = 0', '\\exists! x \\in \\mathbb{R},\\ f(x) \\neq 0']],
  ['\\forall x \\in \\mathbb{R},\\ \\exists y \\in \\mathbb{R},\\ y > x', '\\exists x \\in \\mathbb{R},\\ \\forall y \\in \\mathbb{R},\\ y \\leq x', ['\\forall x \\in \\mathbb{R},\\ \\exists y \\in \\mathbb{R},\\ y \\leq x', '\\exists x \\in \\mathbb{R},\\ \\forall y \\in \\mathbb{R},\\ y < x', '\\exists y \\in \\mathbb{R},\\ \\forall x \\in \\mathbb{R},\\ y > x']],
  ['\\exists M \\in \\mathbb{R},\\ \\forall n \\in \\mathbb{N},\\ u_n \\leq M', '\\forall M \\in \\mathbb{R},\\ \\exists n \\in \\mathbb{N},\\ u_n > M', ['\\forall M \\in \\mathbb{R},\\ \\exists n \\in \\mathbb{N},\\ u_n \\leq M', '\\exists M \\in \\mathbb{R},\\ \\forall n \\in \\mathbb{N},\\ u_n > M', '\\forall M \\in \\mathbb{R},\\ \\forall n \\in \\mathbb{N},\\ u_n > M']],
  ['\\forall \\varepsilon > 0,\\ \\exists N \\in \\mathbb{N},\\ \\forall n \\geq N,\\ |u_n| < \\varepsilon', '\\exists \\varepsilon > 0,\\ \\forall N \\in \\mathbb{N},\\ \\exists n \\geq N,\\ |u_n| \\geq \\varepsilon', ['\\exists \\varepsilon > 0,\\ \\forall N \\in \\mathbb{N},\\ \\forall n \\geq N,\\ |u_n| \\geq \\varepsilon', '\\forall \\varepsilon > 0,\\ \\exists N \\in \\mathbb{N},\\ \\forall n \\geq N,\\ |u_n| \\geq \\varepsilon', '\\exists \\varepsilon > 0,\\ \\forall N \\in \\mathbb{N},\\ \\exists n \\geq N,\\ |u_n| > \\varepsilon']],
  ['\\forall x \\in E,\\ (x \\in A \\Rightarrow x \\in B)', '\\exists x \\in E,\\ (x \\in A \\text{ et } x \\notin B)', ['\\exists x \\in E,\\ (x \\notin A \\Rightarrow x \\notin B)', '\\forall x \\in E,\\ (x \\in A \\text{ et } x \\notin B)', '\\exists x \\in E,\\ (x \\notin A \\text{ et } x \\in B)']],
  ['\\forall (x, y) \\in \\mathbb{R}^2,\\ (f(x) = f(y) \\Rightarrow x = y)', '\\exists (x, y) \\in \\mathbb{R}^2,\\ f(x) = f(y) \\text{ et } x \\neq y', ['\\exists (x, y) \\in \\mathbb{R}^2,\\ f(x) \\neq f(y) \\text{ et } x = y', '\\forall (x, y) \\in \\mathbb{R}^2,\\ (f(x) \\neq f(y) \\Rightarrow x \\neq y)', '\\exists (x, y) \\in \\mathbb{R}^2,\\ (x \\neq y \\Rightarrow f(x) = f(y))']],
];

const negation = skill('l1-negation-quantificateurs', 'Nier une phrase quantifiée', (rng, level) => {
  const pool = level === 1 ? negations.slice(0, 3) : level === 2 ? negations.slice(1, 6) : negations.slice(3);
  const [phrase, correct, decoys] = rng.pick(pool);
  return {
    prompt: `Quelle est la négation de la proposition $${phrase}$ ?`,
    answer: texChoice(rng, correct, decoys),
    hint: 'On échange $\\forall$ et $\\exists$, et on nie la propriété finale. La négation de $P \\Rightarrow Q$ est « $P$ et non $Q$ ».',
    correction: [`On échange les quantificateurs et on nie la fin : $${correct}$.`],
  };
});

type Formula = { tex: string; value: (v: Record<string, boolean>) => boolean; parts?: [Formula, Formula] };

const atoms: Formula[] = ['P', 'Q', 'R'].map((p) => ({ tex: p, value: (v) => v[p] }));
const not = (f: Formula): Formula => ({ tex: `\\lnot ${f.tex.length > 1 ? `(${f.tex})` : f.tex}`, value: (v) => !f.value(v) });
const bin = (op: 'et' | 'ou' | 'imp' | 'eq', a: Formula, b: Formula): Formula => {
  const wrap = (f: Formula) => (f.tex.length > 1 && !f.tex.startsWith('\\lnot') ? `(${f.tex})` : f.tex);
  const sym = { et: '\\land', ou: '\\lor', imp: '\\Rightarrow', eq: '\\Leftrightarrow' }[op];
  const fn = {
    et: (x: boolean, y: boolean) => x && y,
    ou: (x: boolean, y: boolean) => x || y,
    imp: (x: boolean, y: boolean) => !x || y,
    eq: (x: boolean, y: boolean) => x === y,
  }[op];
  return { tex: `${wrap(a)} ${sym} ${wrap(b)}`, value: (v) => fn(a.value(v), b.value(v)), parts: [a, b] };
};

function randomFormula(rng: Rng, depth: number, vars: Formula[]): Formula {
  if (depth === 0) return rng.next() < 0.25 ? not(rng.pick(vars)) : rng.pick(vars);
  const op = rng.pick(['et', 'ou', 'imp', 'imp', 'eq'] as const);
  const f = bin(op, randomFormula(rng, depth - 1, vars), randomFormula(rng, rng.int(0, depth - 1), vars));
  return rng.next() < 0.2 ? not(f) : f;
}

const tableVerite = skill('l1-table-verite', 'Évaluer une proposition logique', (rng, level) => {
  const vars = level === 1 ? atoms.slice(0, 2) : atoms;
  const values = { P: rng.next() < 0.5, Q: rng.next() < 0.5, R: rng.next() < 0.5 };
  let f = randomFormula(rng, level === 1 ? 1 : 2, vars);
  // Évite les formules dégénérées comme « Q ∧ Q ».
  while (f.parts && f.parts[0].tex === f.parts[1].tex) f = randomFormula(rng, level === 1 ? 1 : 2, vars);
  const truth = f.value(values);
  const word = (b: boolean) => (b ? 'vraie' : 'fausse');
  const given = vars.map((x) => `$${x.tex}$ est ${word(values[x.tex as 'P'])}`).join(', ');
  return {
    prompt: `On sait que ${given}. La proposition $${f.tex}$ est-elle vraie ou fausse ?`,
    answer: fixedChoice(['Vraie', 'Fausse'], truth ? 0 : 1),
    hint: '$P \\Rightarrow Q$ n’est fausse que si $P$ est vraie et $Q$ fausse ; $P \\Leftrightarrow Q$ est vraie quand $P$ et $Q$ ont la même valeur.',
    correction: f.parts
      ? [`$${f.parts[0].tex}$ est ${word(f.parts[0].value(values))} et $${f.parts[1].tex}$ est ${word(f.parts[1].value(values))}.`, `La proposition est donc ${word(truth)}.`]
      : [`La proposition est ${word(truth)}.`],
  };
});

const cardinalUnion = skill('l1-cardinal-union', 'Dénombrer une réunion (crible)', (rng, level) => {
  if (level === 3) {
    const [a, b, c] = [rng.int(20, 40), rng.int(20, 40), rng.int(15, 35)];
    const abc = rng.int(2, 5);
    const [ab, ac, bc] = [abc + rng.int(2, 8), abc + rng.int(2, 8), abc + rng.int(2, 8)];
    const total = a + b + c - ab - ac - bc + abc;
    return {
      prompt: `Dans une promotion, $${a}$ étudiants font de l’anglais, $${b}$ de l’espagnol et $${c}$ de l’allemand. $${ab}$ font anglais et espagnol, $${ac}$ anglais et allemand, $${bc}$ espagnol et allemand, et $${abc}$ les trois. Combien d’étudiants font au moins une langue ?`,
      answer: num(total),
      hint: 'Formule du crible : $|A\\cup B\\cup C| = |A|+|B|+|C| - |A\\cap B| - |A\\cap C| - |B\\cap C| + |A\\cap B\\cap C|$.',
      correction: [`$${a} + ${b} + ${c} - ${ab} - ${ac} - ${bc} + ${abc} = ${total}$`],
    };
  }
  const inter = rng.int(2, 12);
  const a = inter + rng.int(3, 20);
  const b = inter + rng.int(3, 20);
  if (level === 2) {
    return {
      prompt: `$A$ et $B$ sont deux ensembles finis avec $|A| = ${a}$, $|B| = ${b}$ et $|A \\cup B| = ${a + b - inter}$. Que vaut $|A \\cap B|$ ?`,
      answer: num(inter),
      hint: '$|A\\cup B| = |A| + |B| - |A\\cap B|$.',
      correction: [`$|A\\cap B| = ${a} + ${b} - ${a + b - inter} = ${inter}$`],
    };
  }
  return {
    prompt: `$A$ et $B$ sont deux ensembles finis avec $|A| = ${a}$, $|B| = ${b}$ et $|A \\cap B| = ${inter}$. Que vaut $|A \\cup B|$ ?`,
    answer: num(a + b - inter),
    hint: 'Les éléments de $A \\cap B$ sont comptés deux fois dans $|A| + |B|$.',
    correction: [`$|A\\cup B| = ${a} + ${b} - ${inter} = ${a + b - inter}$`],
  };
});

const parties = skill('l1-parties', 'Compter des parties d’un ensemble', (rng, level) => {
  const n = rng.int(3, level === 1 ? 6 : 8);
  if (level === 1)
    return {
      prompt: `Un ensemble $E$ a $${n}$ éléments. Combien l’ensemble $\\mathcal{P}(E)$ de ses parties a-t-il d’éléments ?`,
      answer: num(2 ** n),
      hint: 'Pour chaque élément, on choisit s’il est dans la partie ou non.',
      correction: [`$|\\mathcal{P}(E)| = 2^{${n}} = ${2 ** n}$`],
    };
  if (level === 2) {
    const k = rng.int(2, n - 1);
    return {
      prompt: `Un ensemble $E$ a $${n}$ éléments. Combien a-t-il de parties à $${k}$ éléments ?`,
      answer: num(binom(n, k)),
      hint: 'C’est un coefficient binomial $\\binom{n}{k}$.',
      correction: [`$\\binom{${n}}{${k}} = ${binom(n, k)}$`],
    };
  }
  const p = rng.int(2, 3);
  const q = rng.int(2, 3);
  return {
    prompt: `$|A| = ${p}$ et $|B| = ${q}$. Combien l’ensemble $\\mathcal{P}(A \\times B)$ a-t-il d’éléments ?`,
    answer: num(2 ** (p * q)),
    hint: '$|A \\times B| = |A| \\times |B|$, puis $|\\mathcal{P}(F)| = 2^{|F|}$.',
    correction: [`$|A \\times B| = ${p * q}$, donc $|\\mathcal{P}(A\\times B)| = 2^{${p * q}} = ${2 ** (p * q)}$.`],
  };
});

const operations = skill('l1-operations-ensembles', 'Calculer avec des ensembles', (rng, level) => {
  const universe = Array.from({ length: 10 }, (_, i) => i + 1);
  const pick = () => universe.filter(() => rng.next() < 0.45);
  let A = pick();
  let B = pick();
  while (A.length < 2) A = pick();
  while (B.length < 2) B = pick();
  const inA = (x: number) => A.includes(x);
  const inB = (x: number) => B.includes(x);
  const ops = [
    { tex: 'A \\cap B', test: (x: number) => inA(x) && inB(x), hint: 'Les éléments communs à $A$ et $B$.' },
    { tex: 'A \\setminus B', test: (x: number) => inA(x) && !inB(x), hint: 'Les éléments de $A$ qui ne sont pas dans $B$.' },
    { tex: 'B \\setminus A', test: (x: number) => inB(x) && !inA(x), hint: 'Les éléments de $B$ qui ne sont pas dans $A$.' },
    { tex: 'A \\,\\Delta\\, B', test: (x: number) => inA(x) !== inB(x), hint: 'Différence symétrique : les éléments dans un seul des deux ensembles.' },
    { tex: '\\overline{A \\cup B}', test: (x: number) => !inA(x) && !inB(x), hint: 'Le complémentaire dans $E$ : ni dans $A$, ni dans $B$.' },
    { tex: '\\overline{A} \\cap B', test: (x: number) => !inA(x) && inB(x), hint: '$\\overline{A}\\cap B = B \\setminus A$.' },
  ];
  const op = rng.pick(level === 1 ? ops.slice(0, 2) : level === 2 ? ops.slice(0, 4) : ops.slice(3));
  const result = universe.filter(op.test);
  return {
    prompt: `Dans $E = \\{1, \\dots, 10\\}$, on pose $A = ${setTex(A)}$ et $B = ${setTex(B)}$. Donne les éléments de $${op.tex}$.`,
    answer: setOf(result),
    hint: op.hint,
    correction: [`$${op.tex} = ${setTex(result)}$`],
  };
});

export const LOGIQUE_SKILLS: Skill[] = [tableVerite, negation, operations, cardinalUnion, parties];
