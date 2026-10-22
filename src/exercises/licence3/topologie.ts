import type { Skill } from '../types';
import { F, choiceTex, fixedChoice, num, numF, skill, tex } from './util';

/** Chapitre « Espaces métriques et topologie » (Licence 3). */

const fmtVec = (v: number[]) => `(${v.join(',\\,')})`;

/** Vecteurs dont la norme euclidienne est entière. */
const PYTHAGORE: [number[], number][] = [
  [[3, 4], 5],
  [[6, 8], 10],
  [[5, 12], 13],
  [[2, 3, 6], 7],
  [[1, 4, 8], 9],
  [[4, 4, 7], 9],
  [[2, 6, 9], 11],
  [[1, 2, 2], 3],
];

const normes = skill('l3-normes', 'Calculer les normes usuelles d’un vecteur', (rng, level) => {
  if (level === 3) {
    const [base, n2] = rng.pick(PYTHAGORE);
    const v = rng.shuffle(base).map((x) => x * rng.sign());
    return {
      prompt: `Dans $\\mathbb{R}^{${v.length}}$, calcule $\\|x\\|_2$ pour $x = ${fmtVec(v)}$.`,
      answer: num(n2),
      hint: '$\\|x\\|_2 = \\sqrt{x_1^2 + \\dots + x_n^2}$.',
      correction: [`$\\|x\\|_2 = \\sqrt{${v.map((x) => `${x < 0 ? `(${x})` : x}^2`).join(' + ')}} = \\sqrt{${n2 * n2}} = ${n2}$`],
    };
  }
  const n = rng.int(3, 5);
  const v = Array.from({ length: n }, () => rng.int(-9, 9));
  if (!v.some((x) => x !== 0)) v[0] = 1;
  const inf = Math.max(...v.map(Math.abs));
  const one = v.reduce((s, x) => s + Math.abs(x), 0);
  const isOne = level === 2;
  return {
    prompt: `Dans $\\mathbb{R}^{${n}}$, calcule $\\|x\\|_${isOne ? '1' : '\\infty'}$ pour $x = ${fmtVec(v)}$.`,
    answer: num(isOne ? one : inf),
    hint: isOne ? '$\\|x\\|_1$ est la somme des valeurs absolues des coordonnées.' : '$\\|x\\|_\\infty$ est la plus grande valeur absolue des coordonnées.',
    correction: isOne
      ? [`$\\|x\\|_1 = ${v.map((x) => Math.abs(x)).join(' + ')} = ${one}$`]
      : [`$\\|x\\|_\\infty = \\max(${v.map((x) => Math.abs(x)).join(',\\,')}) = ${inf}$`],
  };
});

const interval = (a: number, b: number) => `[${a}\\,;\\,${b}]`;

const distance = skill('l3-distance-ensemble', 'Calculer la distance d’un point à une partie', (rng, level) => {
  const a = rng.int(-6, 2);
  const b = a + rng.int(1, 4);
  if (level === 1) {
    const x = rng.pick([a - rng.int(1, 5), b + rng.int(1, 5)]);
    const d = x < a ? a - x : x - b;
    return {
      prompt: `Dans $\\mathbb{R}$ muni de $|\\cdot|$, calcule $d(${x}, A)$ avec $A = ${interval(a, b)}$.`,
      answer: num(d),
      hint: '$d(x, A) = \\inf_{a \\in A} |x - a|$ : cherche le point de $A$ le plus proche.',
      correction: [`Le point de $A$ le plus proche de $${x}$ est $${x < a ? a : b}$.`, `$d(${x}, A) = ${d}$`],
    };
  }
  if (level === 2) {
    const c = b + rng.int(3, 6);
    const e = c + rng.int(1, 3);
    const x = rng.int(b + 1, c - 1);
    const d = Math.min(x - b, c - x);
    return {
      prompt: `Calcule $d(${x}, A)$ avec $A = ${interval(a, b)} \\cup ${interval(c, e)}$.`,
      answer: num(d),
      hint: 'Calcule la distance à chacun des deux intervalles et garde la plus petite.',
      correction: [`$d(${x}, ${interval(a, b)}) = ${x - b}$ et $d(${x}, ${interval(c, e)}) = ${c - x}$.`, `$d(${x}, A) = \\min(${x - b},\\,${c - x}) = ${d}$`],
    };
  }
  // Diamètre d'une réunion d'un intervalle ouvert et d'un point.
  const p = rng.pick([a - rng.int(1, 4), b + rng.int(1, 4)]);
  const diam = Math.max(b, p) - Math.min(a, p);
  return {
    prompt: `Calcule le diamètre de $A = \\left]${a}\\,;\\,${b}\\right[ \\cup \\{${p}\\}$.`,
    answer: num(diam),
    hint: '$\\operatorname{diam} A = \\sup_{x, y \\in A} |x - y|$ ; une borne supérieure n’est pas forcément atteinte.',
    correction: [`Les points de $A$ s’étendent de $${Math.min(a, p)}$ à $${Math.max(b, p)}$ (bornes atteintes ou approchées).`, `$\\operatorname{diam} A = ${Math.max(b, p)} - ${Math.min(a, p) < 0 ? `(${Math.min(a, p)})` : Math.min(a, p)} = ${diam}$`],
  };
});

const NATURES = ['Ouvert', 'Fermé', 'Ni ouvert ni fermé', 'Ouvert et fermé'];

/** Parties de ℝ ou ℝ² avec leur nature (indice dans NATURES) et le niveau à partir duquel on les pose. */
const PARTIES: [string, number, number, string][] = [
  ['\\left]0\\,;\\,1\\right[', 0, 1, 'C’est un intervalle ouvert.'],
  ['[0\\,;\\,1]', 1, 1, 'Un segment est fermé ; il n’est pas ouvert car aucune boule centrée en $0$ n’y est incluse.'],
  ['[0\\,;\\,1[', 2, 1, 'Pas ouvert (rien autour de $0$), pas fermé ($1$ est limite de points de la partie).'],
  ['\\left]0\\,;\\,+\\infty\\right[', 0, 1, 'C’est un intervalle ouvert.'],
  ['[0\\,;\\,+\\infty[', 1, 1, 'Son complémentaire $\\left]-\\infty\\,;\\,0\\right[$ est ouvert.'],
  ['\\mathbb{R}', 3, 1, 'L’espace entier est à la fois ouvert et fermé.'],
  ['\\varnothing', 3, 2, 'Le vide est à la fois ouvert et fermé.'],
  ['\\mathbb{Z}', 1, 2, 'Son complémentaire, réunion d’intervalles ouverts $\\left]n\\,;\\,n+1\\right[$, est ouvert.'],
  ['\\mathbb{R} \\setminus \\mathbb{Z}', 0, 2, 'C’est une réunion d’intervalles ouverts.'],
  ['\\mathbb{Q}', 2, 3, '$\\mathbb{Q}$ et son complémentaire sont tous deux denses dans $\\mathbb{R}$.'],
  ['\\{1/n : n \\geq 1\\}', 2, 3, '$0$ est limite de $1/n$ mais n’appartient pas à la partie ; et aucun point n’est intérieur.'],
  ['\\{0\\} \\cup \\{1/n : n \\geq 1\\}', 1, 3, 'La seule limite manquante, $0$, a été ajoutée : la partie est fermée, mais pas ouverte.'],
  ['\\{(x, y) \\in \\mathbb{R}^2 : x^2 + y^2 < 1\\}', 0, 2, 'Image réciproque de $\\left]-\\infty\\,;\\,1\\right[$ par une fonction continue.'],
  ['\\{(x, y) \\in \\mathbb{R}^2 : xy = 1\\}', 1, 2, 'Image réciproque du fermé $\\{1\\}$ par la fonction continue $(x, y) \\mapsto xy$.'],
  ['\\{(x, y) \\in \\mathbb{R}^2 : x > 0,\\ y \\geq 0\\}', 2, 3, 'Le point $(1, 0)$ n’est pas intérieur, et $(0, 1)$ est limite de points de la partie sans en faire partie.'],
];

const ouvertFerme = skill('l3-ouvert-ferme', 'Reconnaître un ouvert, un fermé', (rng, level) => {
  const [set, nature, , why] = rng.pick(PARTIES.filter((p) => p[2] <= level));
  return {
    prompt: `La partie $${set}$ (pour la topologie usuelle) est :`,
    answer: fixedChoice(NATURES, nature),
    hint: 'Un fermé est une partie dont le complémentaire est ouvert, ou qui contient les limites de ses suites convergentes.',
    correction: [why, `Réponse : ${NATURES[nature].toLowerCase()}.`],
  };
});

const COMPACTS = ['[0\\,;\\,1]', '\\{0\\} \\cup \\{1/n : n \\geq 1\\}', '[0\\,;\\,1]^2', '\\{(x, y) : x^2 + y^2 = 1\\}', '\\{1, 2, 3\\}', '[-1\\,;\\,1] \\times \\{0\\}'];
const NON_COMPACTS: [string, number][] = [
  ['\\left]0\\,;\\,1\\right]', 1],
  ['\\mathbb{R}', 1],
  ['\\mathbb{Z}', 1],
  ['\\{1/n : n \\geq 1\\}', 2],
  ['[0\\,;\\,+\\infty[', 1],
  ['\\{(x, y) : x^2 + y^2 < 1\\}', 2],
  ['\\{(x, y) : xy = 1\\}', 2],
  ['\\mathbb{Q} \\cap [0\\,;\\,1]', 3],
  ['\\text{la boule unité fermée de } \\ell^\\infty', 3],
];

const compact = skill('l3-compact', 'Reconnaître une partie compacte', (rng, level) => {
  const correct = rng.pick(COMPACTS);
  const decoys = NON_COMPACTS.filter(([, l]) => l <= level).map(([s]) => s);
  return {
    prompt: 'Laquelle de ces parties est compacte ?',
    answer: choiceTex(rng, correct, rng.shuffle(decoys).slice(0, 3), () => '\\mathbb{N}'),
    hint: 'En dimension finie, les compacts sont exactement les parties fermées et bornées (Borel-Lebesgue, Bolzano-Weierstrass).',
    correction: [`$${correct}$ est fermée et bornée dans un espace de dimension finie : elle est compacte.`, 'Les autres ne sont pas bornées, ou pas fermées, ou vivent en dimension infinie (la boule unité n’y est jamais compacte, théorème de Riesz).'],
  };
});

const equivalence = skill('l3-equivalence-normes', 'Comparer des normes équivalentes', (rng, level) => {
  const n = rng.int(2, 9);
  const cases: [string, string, string, string[]][] = [
    ['\\|x\\|_1', '\\|x\\|_\\infty', `${n}`, ['1', `\\sqrt{${n}}`, `${n * n}`]],
    ['\\|x\\|_2', '\\|x\\|_\\infty', `\\sqrt{${n}}`, ['1', `${n}`, `\\frac{1}{${n}}`]],
    ['\\|x\\|_1', '\\|x\\|_2', `\\sqrt{${n}}`, ['1', `${n}`, `${n * n}`]],
    ['\\|x\\|_\\infty', '\\|x\\|_1', '1', [`${n}`, `\\sqrt{${n}}`, `\\frac{1}{${n}}`]],
  ];
  const [big, small, c, decoys] = level === 1 ? cases[rng.pick([0, 3])] : rng.pick(cases);
  return {
    prompt: `Sur $\\mathbb{R}^{${n}}$, quelle est la plus petite constante $C$ telle que $${big} \\leq C\\,${small}$ pour tout $x$ ?`,
    answer: choiceTex(rng, c, decoys, () => `${n + 1}`),
    hint: 'Teste les vecteurs extrêmes : $x = (1, 0, \\dots, 0)$ et $x = (1, 1, \\dots, 1)$.',
    correction: [
      `Pour $x = (1, \\dots, 1)$ : $\\|x\\|_1 = ${n}$, $\\|x\\|_2 = \\sqrt{${n}}$, $\\|x\\|_\\infty = 1$ ; pour $x = (1, 0, \\dots, 0)$ les trois normes valent $1$.`,
      `L’inégalité est vraie avec $C = ${c}$ et cette constante est atteinte : $C = ${c}$.`,
    ],
  };
});

const lipschitz = skill('l3-lipschitz', 'Trouver une constante de Lipschitz', (rng, level) => {
  if (level === 1) {
    const a = rng.nonZero(-9, 9);
    const b = rng.int(-5, 5);
    return {
      prompt: `Quelle est la meilleure constante de Lipschitz de $f(x) = ${a === 1 ? '' : a === -1 ? '-' : a}x${b === 0 ? '' : b < 0 ? ` - ${-b}` : ` + ${b}`}$ sur $\\mathbb{R}$ ?`,
      answer: num(Math.abs(a)),
      hint: '$|f(x) - f(y)| = |a|\\,|x - y|$.',
      correction: [`$|f(x) - f(y)| = ${Math.abs(a)}|x - y|$ : la meilleure constante est $${Math.abs(a)}$.`],
    };
  }
  if (level === 2) {
    const k = rng.int(2, 7);
    const c = rng.int(1, 4);
    return {
      prompt: `Quelle est la meilleure constante de Lipschitz de $f(x) = ${c === 1 ? '' : c}\\sin(${k}x)$ sur $\\mathbb{R}$ ?`,
      answer: num(c * k),
      hint: 'Pour $f$ dérivable, la meilleure constante est $\\sup |f\'|$ (inégalité des accroissements finis).',
      correction: [`$f'(x) = ${c * k}\\cos(${k}x)$ et $\\sup |f'| = ${c * k}$.`],
    };
  }
  const a = rng.int(-4, 1);
  const b = a + rng.int(1, 4);
  const m = Math.max(Math.abs(a), Math.abs(b));
  const half = rng.int(1, 3);
  const L = F(2 * m, half);
  return {
    prompt: `Quelle est la meilleure constante de Lipschitz de $f(x) = ${half === 1 ? '' : `\\frac{1}{${half}}`}x^2$ sur $[${a}\\,;\\,${b}]$ ?`,
    answer: numF(L),
    hint: 'C’est $\\sup |f\'|$ sur l’intervalle.',
    correction: [`$f'(x) = ${tex(F(2, half))}x$ et $\\sup_{[${a};${b}]} |x| = ${m}$.`, `Meilleure constante : $${tex(L)}$`],
  };
});

export const TOPOLOGIE_SKILLS: Skill[] = [normes, distance, ouvertFerme, compact, equivalence, lipschitz];
