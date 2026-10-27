import { frac, fracLatex } from '../../exercises/fraction';
import type { Rng } from '../../exercises/rng';
import { type Answer, type Skill } from '../../exercises/types';
import { enrich, variant } from '../../exercises/variantes';
import type { ChapterDef } from '../types';

/** 1re spécialité, chapitre « Probabilités conditionnelles et indépendance ». */

/** n / scale en écriture décimale française (LaTeX). */
export const dec = (n: number, scale = 100) => String(Math.round((n / scale) * 1e8) / 1e8 + 0).replace('.', '{,}');

const P = (event: string, given?: string) => (given ? `P_{${given}}(${event})` : `P(${event})`);
const NOT_A = '\\overline{A}';
const NOT_B = '\\overline{B}';

/** Arbre pondéré en centièmes : P(A) = a, P_A(B) = b, P_Ā(B) = c. */
function tree(rng: Rng, level: number) {
  const step = level === 1 ? 10 : 5;
  const draw = () => step * rng.int(1, 100 / step - 1);
  return { a: draw(), b: draw(), c: draw() };
}

const treeText = (a: number, b: number, c: number) => `$${P('A')} = ${dec(a)}$, $${P('B', 'A')} = ${dec(b)}$ et $${P('B', NOT_A)} = ${dec(c)}$`;

const tableau: Skill = {
  id: '1re-proba-tableau',
  name: 'Lire une probabilité conditionnelle dans un tableau',
  generate(rng, level) {
    // Tableau croisé d'effectifs : élèves externes (A) ou demi-pensionnaires, qui font du sport (B) ou non.
    const nAB = rng.int(5, 60);
    const nAnB = rng.int(5, 60);
    const nnAB = rng.int(5, 60);
    const nnAnB = rng.int(5, 60);
    const inverse = level === 3;
    const total = nAB + nAnB + nnAB + nnAnB;
    const table = `\\begin{array}{|c|c|c|c|} \\hline & B & ${NOT_B} & \\text{Total} \\\\ \\hline A & ${nAB} & ${nAnB} & ${nAB + nAnB} \\\\ \\hline ${NOT_A} & ${nnAB} & ${nnAnB} & ${nnAB + nnAnB} \\\\ \\hline \\text{Total} & ${nAB + nnAB} & ${nAnB + nnAnB} & ${total} \\\\ \\hline \\end{array}`;
    const asked = level === 1 ? P('B', 'A') : inverse ? P('A', 'B') : P('B', NOT_A);
    const [num, den] = level === 1 ? [nAB, nAB + nAnB] : inverse ? [nAB, nAB + nnAB] : [nnAB, nnAB + nnAnB];
    const value = frac(num, den);
    return {
      skill: this.id,
      level,
      prompt: `On choisit au hasard une personne parmi les ${total} du tableau : $${table}$ Calcule $${asked}$ (sous forme de fraction).`,
      answer: { kind: 'number', value },
      hint: '$P_A(B)$ : on se restreint à la ligne (ou la colonne) de $A$, puis on compte ceux qui sont dans $B$.',
      correction: [`$${asked} = \\frac{${num}}{${den}}${value.d !== den ? ` = ${fracLatex(value)}` : ''}$`],
    };
  },
};

const intersection: Skill = {
  id: '1re-proba-intersection',
  name: 'Calculer la probabilité d’une intersection',
  generate(rng, level) {
    const { a, b } = tree(rng, level);
    const complement = level === 3;
    // Niveau 3 : P(A ∩ B̄) = P(A) × (1 − P_A(B)).
    const pb = complement ? 100 - b : b;
    const value = frac(a * pb, 10000);
    const target = complement ? `A \\cap ${NOT_B}` : 'A \\cap B';
    return {
      skill: this.id,
      level,
      prompt: `On sait que $${P('A')} = ${dec(a)}$ et $${P('B', 'A')} = ${dec(b)}$. Calcule $${P(target)}$.`,
      answer: { kind: 'number', value },
      hint: complement ? '$P_A(\\overline{B}) = 1 - P_A(B)$, puis $P(A \\cap \\overline{B}) = P(A) \\times P_A(\\overline{B})$.' : '$P(A \\cap B) = P(A) \\times P_A(B)$.',
      correction: [
        ...(complement ? [`$${P(NOT_B, 'A')} = 1 - ${dec(b)} = ${dec(pb)}$`] : []),
        `$${P(target)} = ${dec(a)} \\times ${dec(pb)} = ${dec(a * pb, 10000)}$`,
      ],
    };
  },
};

const totales: Skill = {
  id: '1re-proba-totales',
  name: 'Utiliser la formule des probabilités totales',
  generate(rng, level) {
    const { a, b, c } = tree(rng, level);
    const pB = a * b + (100 - a) * c;
    const negate = level === 3;
    const value = frac(negate ? 10000 - pB : pB, 10000);
    return {
      skill: this.id,
      level,
      prompt: `On sait que ${treeText(a, b, c)}. Calcule $${P(negate ? NOT_B : 'B')}$.`,
      answer: { kind: 'number', value },
      hint: '$A$ et $\\overline{A}$ forment une partition : $P(B) = P(A \\cap B) + P(\\overline{A} \\cap B)$.',
      correction: [
        `$${P('B')} = ${P('A')} \\times ${P('B', 'A')} + ${P(NOT_A)} \\times ${P('B', NOT_A)} = ${dec(a)} \\times ${dec(b)} + ${dec(100 - a)} \\times ${dec(c)} = ${dec(pB, 10000)}$`,
        ...(negate ? [`$${P(NOT_B)} = 1 - ${dec(pB, 10000)} = ${dec(10000 - pB, 10000)}$`] : []),
      ],
    };
  },
};

const inversion: Skill = {
  id: '1re-proba-inversion',
  name: 'Inverser un conditionnement',
  generate(rng, level) {
    const { a, b, c } = tree(rng, level);
    const ab = a * b;
    const pB = ab + (100 - a) * c;
    const value = frac(ab, pB);
    return {
      skill: this.id,
      level,
      prompt: `On sait que ${treeText(a, b, c)}. Calcule $${P('A', 'B')}$ (valeur exacte, sous forme de fraction).`,
      answer: { kind: 'number', value },
      hint: '$P_B(A) = \\frac{P(A \\cap B)}{P(B)}$ : calcule d’abord $P(B)$ avec les probabilités totales.',
      correction: [
        `$${P('A \\cap B')} = ${dec(a)} \\times ${dec(b)} = ${dec(ab, 10000)}$`,
        `$${P('B')} = ${dec(ab, 10000)} + ${dec(100 - a)} \\times ${dec(c)} = ${dec(pB, 10000)}$`,
        `$${P('A', 'B')} = \\frac{${dec(ab, 10000)}}{${dec(pB, 10000)}} = ${fracLatex(value)}$`,
      ],
    };
  },
};

const OUI_NON = ['Oui, A et B sont indépendants', 'Non, A et B ne sont pas indépendants'];

const independance: Skill = {
  id: '1re-proba-independance',
  name: 'Reconnaître des événements indépendants',
  generate(rng, level) {
    const a = 10 * rng.int(1, 9);
    const b = 10 * rng.int(1, 9);
    // P(A ∩ B) en dix-millièmes : a × b si indépendants, sinon une valeur voisine encore possible.
    let inter = a * b;
    if (rng.next() < 0.5) {
      const near = [-200, -100, 100, 200].map((d) => a * b + d).filter((v) => v > Math.max(0, 100 * (a + b) - 10000) && v < 100 * Math.min(a, b));
      if (near.length) inter = rng.pick(near);
    }
    const actually = inter === a * b;
    const given = level === 3 ? `$${P('A')} = ${dec(a)}$, $${P('B')} = ${dec(b)}$ et $${P('A \\cup B')} = ${dec(100 * a + 100 * b - inter, 10000)}$` : `$${P('A')} = ${dec(a)}$, $${P('B')} = ${dec(b)}$ et $${P('A \\cap B')} = ${dec(inter, 10000)}$`;
    return {
      skill: this.id,
      level,
      prompt: `On sait que ${given}. Les événements $A$ et $B$ sont-ils indépendants ?`,
      answer: { kind: 'choice', options: OUI_NON, correct: actually ? 0 : 1 },
      hint: '$A$ et $B$ sont indépendants si et seulement si $P(A \\cap B) = P(A) \\times P(B)$.',
      correction: [
        ...(level === 3 ? [`$${P('A \\cap B')} = ${P('A')} + ${P('B')} - ${P('A \\cup B')} = ${dec(inter, 10000)}$`] : []),
        `$${P('A')} \\times ${P('B')} = ${dec(a)} \\times ${dec(b)} = ${dec(a * b, 10000)}$, ${actually ? 'égal à' : 'différent de'} $${P('A \\cap B')} = ${dec(inter, 10000)}$ : ${actually ? 'ils sont indépendants' : 'ils ne sont pas indépendants'}.`,
      ],
    };
  },
};

const pct = (n: number) => `$${n}\\,\\%$`;
const vraiFaux = (b: boolean): Answer => ({ kind: 'choice', options: ['Vrai', 'Faux'], correct: b ? 0 : 1 });

const tableauVariantes = [
  variant('urne', (rng) => {
    const r = rng.int(4, 15);
    const b = rng.int(4, 15);
    const r1 = rng.int(1, r - 1);
    const b1 = rng.int(1, b - 1);
    const value = frac(r1, r1 + b1);
    return {
      prompt: `Une urne contient $${r}$ boules rouges, dont $${r1}$ portent un numéro pair, et $${b}$ boules bleues, dont $${b1}$ portent un numéro pair. On tire une boule au hasard : elle porte un numéro pair. Quelle est la probabilité qu'elle soit rouge ?`,
      answer: { kind: 'number', value },
      hint: 'On se restreint aux boules qui portent un numéro pair.',
      correction: [`Il y a $${r1} + ${b1} = ${r1 + b1}$ boules paires, dont $${r1}$ rouges : la probabilité vaut $\\frac{${r1}}{${r1 + b1}}${value.d !== r1 + b1 ? ` = ${fracLatex(value)}` : ''}$.`],
    };
  }),
  variant('effectifs', (rng) => {
    const nA = rng.int(20, 120);
    const nAB = rng.int(5, nA - 5);
    const nnA = rng.int(20, 120);
    const nnAB = rng.int(5, nnA - 5);
    const value = frac(nAB, nAB + nnAB);
    return {
      prompt: `Dans un lycée, $${nA}$ élèves sont internes, dont $${nAB}$ jouent d'un instrument ; parmi les $${nnA}$ autres élèves, $${nnAB}$ jouent d'un instrument. On choisit au hasard un élève qui joue d'un instrument. Quelle est la probabilité qu'il soit interne ?`,
      answer: { kind: 'number', value },
      hint: 'Compte d’abord tous les élèves qui jouent d’un instrument.',
      correction: [`$${nAB} + ${nnAB} = ${nAB + nnAB}$ élèves jouent d'un instrument, dont $${nAB}$ internes.`, `La probabilité vaut $\\frac{${nAB}}{${nAB + nnAB}}${value.d !== nAB + nnAB ? ` = ${fracLatex(value)}` : ''}$.`],
    };
  }),
  variant('vrai-faux', (rng) => {
    const nAB = rng.int(5, 60);
    const nAnB = rng.int(5, 60);
    const nnAB = rng.next() < 0.5 ? nAnB : rng.int(5, 60);
    const nnAnB = rng.int(5, 60);
    const total = nAB + nAnB + nnAB + nnAnB;
    const table = `\\begin{array}{|c|c|c|c|} \\hline & B & ${NOT_B} & \\text{Total} \\\\ \\hline A & ${nAB} & ${nAnB} & ${nAB + nAnB} \\\\ \\hline ${NOT_A} & ${nnAB} & ${nnAnB} & ${nnAB + nnAnB} \\\\ \\hline \\text{Total} & ${nAB + nnAB} & ${nAnB + nnAnB} & ${total} \\\\ \\hline \\end{array}`;
    const ok = nAB + nAnB === nAB + nnAB;
    return {
      prompt: `On choisit au hasard une personne du tableau : $${table}$ Vrai ou faux : $${P('B', 'A')} = ${P('A', 'B')}$.`,
      answer: vraiFaux(ok),
      hint: '$P_A(B)$ divise par l’effectif de $A$, $P_B(A)$ par celui de $B$.',
      correction: [`$${P('B', 'A')} = \\frac{${nAB}}{${nAB + nAnB}}$ et $${P('A', 'B')} = \\frac{${nAB}}{${nAB + nnAB}}$ : ${ok ? 'les dénominateurs sont égaux, c’est vrai' : 'c’est faux'}.`],
    };
  }),
];

const intersectionVariantes = [
  variant('situation', (rng, level) => {
    const { a, b } = tree(rng, level);
    const value = frac(a * b, 10000);
    return {
      prompt: `Dans une entreprise, ${pct(a)} des salariés sont cadres et, parmi les cadres, ${pct(b)} parlent couramment anglais. On choisit un salarié au hasard. Quelle est la probabilité qu'il soit cadre et parle couramment anglais ? (Réponse décimale.)`,
      answer: { kind: 'number', value },
      hint: 'C’est une intersection : $P(C \\cap L) = P(C) \\times P_C(L)$.',
      correction: [`$P(C \\cap L) = ${dec(a)} \\times ${dec(b)} = ${dec(a * b, 10000)}$`],
    };
  }),
  variant('retrouver-conditionnelle', (rng, level) => {
    const { a, b } = tree(rng, level);
    return {
      prompt: `On sait que $${P('A')} = ${dec(a)}$ et $${P('A \\cap B')} = ${dec(a * b, 10000)}$. Calcule $${P('B', 'A')}$.`,
      answer: { kind: 'number', value: frac(b, 100) },
      hint: '$P_A(B) = \\frac{P(A \\cap B)}{P(A)}$.',
      correction: [`$${P('B', 'A')} = \\frac{${dec(a * b, 10000)}}{${dec(a)}} = ${dec(b)}$`],
    };
  }),
  variant('retrouver-pa', (rng, level) => {
    const { a, b } = tree(rng, level);
    return {
      prompt: `On sait que $${P('B', 'A')} = ${dec(b)}$ et $${P('A \\cap B')} = ${dec(a * b, 10000)}$. Calcule $${P('A')}$.`,
      answer: { kind: 'number', value: frac(a, 100) },
      hint: '$P(A \\cap B) = P(A) \\times P_A(B)$ : divise.',
      correction: [`$${P('A')} = \\frac{${dec(a * b, 10000)}}{${dec(b)}} = ${dec(a)}$`],
    };
  }),
];

/** Trois machines : parts de production (en %, somme 100) et taux de défaut (en %). */
function machines(rng: Rng) {
  const p1 = 10 * rng.int(2, 5);
  const p2 = 10 * rng.int(1, 8 - p1 / 10);
  const p = [p1, p2, 100 - p1 - p2];
  const d = p.map(() => rng.int(1, 9));
  return { p, d, total: p.reduce((s, v, i) => s + v * d[i], 0) };
}
const machinesText = (p: number[], d: number[]) =>
  `Une usine fabrique des pièces sur trois machines : la machine 1 en produit ${pct(p[0])}, la machine 2 ${pct(p[1])} et la machine 3 le reste. Les taux de pièces défectueuses sont respectivement ${pct(d[0])}, ${pct(d[1])} et ${pct(d[2])}.`;

const totalesVariantes = [
  variant('depistage', (rng, level) => {
    const { a, b, c } = tree(rng, level);
    const pB = a * b + (100 - a) * c;
    return {
      prompt: `Une maladie touche ${pct(a)} d'une population. Un test est positif chez ${pct(b)} des malades et chez ${pct(c)} des personnes saines. On teste une personne au hasard : quelle est la probabilité que le test soit positif ? (Réponse décimale.)`,
      answer: { kind: 'number', value: frac(pB, 10000) },
      hint: 'Probabilités totales avec la partition malade / sain.',
      correction: [`$P(T) = ${dec(a)} \\times ${dec(b)} + ${dec(100 - a)} \\times ${dec(c)} = ${dec(pB, 10000)}$`],
    };
  }),
  variant('trois-machines', (rng) => {
    const { p, d, total } = machines(rng);
    return {
      prompt: `${machinesText(p, d)} On prend une pièce au hasard : quelle est la probabilité qu'elle soit défectueuse ? (Réponse décimale.)`,
      answer: { kind: 'number', value: frac(total, 10000) },
      hint: 'Les trois machines forment une partition : additionne les trois branches.',
      correction: [`$P(D) = ${p.map((v, i) => `${dec(v)} \\times ${dec(d[i])}`).join(' + ')} = ${dec(total, 10000)}$`],
    };
  }),
  variant('retrouver-branche', (rng, level) => {
    const { a, b, c } = tree(rng, level);
    const pB = a * b + (100 - a) * c;
    return {
      prompt: `On sait que $${P('A')} = ${dec(a)}$, $${P('B', 'A')} = ${dec(b)}$ et $${P('B')} = ${dec(pB, 10000)}$. Calcule $${P('B', NOT_A)}$.`,
      answer: { kind: 'number', value: frac(c, 100) },
      hint: 'Écris la formule des probabilités totales et isole l’inconnue.',
      correction: [`$${dec(pB, 10000)} = ${dec(a)} \\times ${dec(b)} + ${dec(100 - a)} \\times ${P('B', NOT_A)}$`, `$${P('B', NOT_A)} = \\frac{${dec(pB - a * b, 10000)}}{${dec(100 - a)}} = ${dec(c)}$`],
    };
  }),
];

const inversionVariantes = [
  variant('depistage', (rng, level) => {
    const { a, b, c } = tree(rng, level);
    const ab = a * b;
    const pB = ab + (100 - a) * c;
    const value = frac(ab, pB);
    return {
      prompt: `Une maladie touche ${pct(a)} d'une population. Un test est positif chez ${pct(b)} des malades et chez ${pct(c)} des personnes saines. Le test d'une personne est positif : quelle est la probabilité qu'elle soit malade ? (Fraction.)`,
      answer: { kind: 'number', value },
      hint: '$P_T(M) = \\frac{P(M \\cap T)}{P(T)}$, avec $P(T)$ par les probabilités totales.',
      correction: [`$P(M \\cap T) = ${dec(ab, 10000)}$ et $P(T) = ${dec(pB, 10000)}$.`, `$P_T(M) = \\frac{${dec(ab, 10000)}}{${dec(pB, 10000)}} = ${fracLatex(value)}$`],
    };
  }),
  variant('trois-machines', (rng) => {
    const { p, d, total } = machines(rng);
    const k = rng.int(0, 2);
    const value = frac(p[k] * d[k], total);
    return {
      prompt: `${machinesText(p, d)} Une pièce est défectueuse : quelle est la probabilité qu'elle vienne de la machine ${k + 1} ? (Fraction.)`,
      answer: { kind: 'number', value },
      hint: 'Calcule $P(D)$ par les probabilités totales, puis $P_D(M_k) = \\frac{P(M_k \\cap D)}{P(D)}$.',
      correction: [`$P(D) = ${dec(total, 10000)}$ et $P(M_${k + 1} \\cap D) = ${dec(p[k])} \\times ${dec(d[k])} = ${dec(p[k] * d[k], 10000)}$.`, `$P_D(M_${k + 1}) = ${fracLatex(value)}$`],
    };
  }),
];

const DE: [string, number[]][] = [
  ['« le nombre est pair »', [2, 4, 6]],
  ['« le nombre est un multiple de 3 »', [3, 6]],
  ['« le nombre est au plus 2 »', [1, 2]],
  ['« le nombre est au plus 4 »', [1, 2, 3, 4]],
  ['« le nombre est premier »', [2, 3, 5]],
  ['« le nombre est au moins 5 »', [5, 6]],
  ['« le nombre est impair »', [1, 3, 5]],
];

const independanceVariantes = [
  variant('reunion', (rng, level) => {
    const step = level === 1 ? 10 : 5;
    const a = step * rng.int(1, 100 / step - 1);
    const b = step * rng.int(1, 100 / step - 1);
    const u = 100 * (a + b) - a * b;
    return {
      prompt: `Les événements $A$ et $B$ sont indépendants, avec $${P('A')} = ${dec(a)}$ et $${P('B')} = ${dec(b)}$. Calcule $${P('A \\cup B')}$.`,
      answer: { kind: 'number', value: frac(u, 10000) },
      hint: '$P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$, et ici $P(A \\cap B) = P(A) \\times P(B)$.',
      correction: [`$${P('A \\cap B')} = ${dec(a * b, 10000)}$`, `$${P('A \\cup B')} = ${dec(a)} + ${dec(b)} - ${dec(a * b, 10000)} = ${dec(u, 10000)}$`],
    };
  }),
  variant('contraire', (rng, level) => {
    const step = level === 1 ? 10 : 5;
    const a = step * rng.int(1, 100 / step - 1);
    const b = step * rng.int(1, 100 / step - 1);
    return {
      prompt: `Les événements $A$ et $B$ sont indépendants, avec $${P('A')} = ${dec(a)}$ et $${P('B')} = ${dec(b)}$. Calcule $${P(`A \\cap ${NOT_B}`)}$.`,
      answer: { kind: 'number', value: frac(a * (100 - b), 10000) },
      hint: 'Si $A$ et $B$ sont indépendants, $A$ et $\\overline{B}$ le sont aussi.',
      correction: [`$${P(`A \\cap ${NOT_B}`)} = ${dec(a)} \\times (1 - ${dec(b)}) = ${dec(a * (100 - b), 10000)}$`],
    };
  }),
  variant('de', (rng) => {
    const i = rng.int(0, DE.length - 1);
    let j: number;
    do j = rng.int(0, DE.length - 1);
    while (j === i);
    const [[ta, A], [tb, B]] = [DE[i], DE[j]];
    const AB = A.filter((v) => B.includes(v));
    // P(A ∩ B) = |A ∩ B| / 6 et P(A) P(B) = |A| |B| / 36.
    const ok = 6 * AB.length === A.length * B.length;
    const set = (v: number[]) => (v.length ? `\\{${v.join(' ; ')}\\}` : '\\varnothing');
    return {
      prompt: `On lance un dé équilibré à six faces. $A$ est l'événement ${ta} et $B$ l'événement ${tb}. Les événements $A$ et $B$ sont-ils indépendants ?`,
      answer: { kind: 'choice', options: OUI_NON, correct: ok ? 0 : 1 },
      hint: 'Compare $P(A \\cap B)$ et $P(A) \\times P(B)$.',
      correction: [`$A = ${set(A)}$, $B = ${set(B)}$ et $A \\cap B = ${set(AB)}$.`, `$${P('A \\cap B')} = ${fracLatex(frac(AB.length, 6))}$ et $${P('A')} \\times ${P('B')} = ${fracLatex(frac(A.length, 6))} \\times ${fracLatex(frac(B.length, 6))} = ${fracLatex(frac(A.length * B.length, 36))}$ : ${ok ? 'ils sont indépendants' : 'ils ne sont pas indépendants'}.`],
    };
  }),
];

export const PROBABILITES_CONDITIONNELLES: ChapterDef = {
  id: '1re-probabilites-conditionnelles',
  title: 'Probabilités conditionnelles',
  region: 'Marais des Hasards',
  theme: 'marais',
  terrain: 'marais',
  skills: [
    enrich(tableau, tableauVariantes),
    enrich(intersection, intersectionVariantes),
    enrich(totales, totalesVariantes),
    enrich(inversion, inversionVariantes),
    enrich(independance, independanceVariantes),
  ],
  creatures: [
    {
      id: '1re-tableauve',
      name: 'Tableauve',
      description: 'Une grenouille qui saute de case en case dans les tableaux croisés.',
      skills: ['1re-proba-tableau'],
      look: { shape: 'blob', hue: 120, symbol: '▦' },
    },
    {
      id: '1re-branchelle',
      name: 'Branchelle',
      description: 'Une plante des marais qui pousse en arbre pondéré : on multiplie le long des branches.',
      skills: ['1re-proba-intersection', '1re-proba-tableau'],
      look: { shape: 'plante', hue: 100, symbol: '∩' },
    },
    {
      id: '1re-totalibri',
      name: 'Totalibri',
      description: 'Un petit oiseau qui additionne tous les chemins menant au même nid.',
      skills: ['1re-proba-totales', '1re-proba-intersection'],
      look: { shape: 'oiseau', hue: 80, symbol: 'Σ' },
    },
    {
      id: '1re-bayeslyre',
      name: 'Bayeslyre',
      description: 'Un spectre des brumes qui remonte le temps : il sait que B est arrivé et se demande si A l’a causé.',
      skills: ['1re-proba-inversion', '1re-proba-totales'],
      look: { shape: 'spectre', hue: 140, symbol: '?' },
    },
    {
      id: '1re-indepanda',
      name: 'Indépanda',
      description: 'Une bête paisible que rien n’influence : ce qui arrive aux autres ne change pas ses chances.',
      skills: ['1re-proba-independance', '1re-proba-intersection'],
      look: { shape: 'bete', hue: 90, symbol: '×' },
    },
  ],
  boss: {
    id: '1re-hasardon',
    name: 'Hasardon',
    description: 'Le gardien du marais, un colosse de vase et de racines dont chaque branche porte une probabilité.',
    skills: ['1re-proba-tableau', '1re-proba-intersection', '1re-proba-totales', '1re-proba-inversion', '1re-proba-independance'],
    look: { shape: 'golem', hue: 110, symbol: 'P' },
  },
};
