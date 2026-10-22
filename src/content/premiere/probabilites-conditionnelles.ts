import { frac, fracLatex } from '../../exercises/fraction';
import type { Rng } from '../../exercises/rng';
import type { Skill } from '../../exercises/types';
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

export const PROBABILITES_CONDITIONNELLES: ChapterDef = {
  id: '1re-probabilites-conditionnelles',
  title: 'Probabilités conditionnelles',
  region: 'Marais des Hasards',
  theme: 'marais',
  skills: [tableau, intersection, totales, inversion, independance],
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
