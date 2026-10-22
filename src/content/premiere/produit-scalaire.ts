import { frac, fracLatex } from '../../exercises/fraction';
import { paren } from '../../exercises/latex';
import { type Skill, makeChoice } from '../../exercises/types';
import type { ChapterDef } from '../types';
import { piTex } from './trigonometrie';

/** 1re spécialité, chapitre « Produit scalaire ». */

const vec = (name: string) => `\\vec{${name}}`;
const coords = (x: number, y: number) => `\\begin{pmatrix} ${x} \\\\ ${y} \\end{pmatrix}`;

const coordonnees: Skill = {
  id: '1re-ps-coordonnees',
  name: 'Calculer un produit scalaire avec les coordonnées',
  generate(rng, level) {
    const r = level === 1 ? 5 : 9;
    const [a, b, c, d] = [rng.int(-r, r), rng.int(-r, r), rng.int(-r, r), rng.int(-r, r)];
    const value = a * c + b * d;
    return {
      skill: this.id,
      level,
      prompt: `Dans un repère orthonormé, $${vec('u')}${coords(a, b)}$ et $${vec('v')}${coords(c, d)}$. Calcule $${vec('u')} \\cdot ${vec('v')}$.`,
      answer: { kind: 'number', value: frac(value) },
      hint: 'Si $\\vec{u}(x\\,;\\,y)$ et $\\vec{v}(x\'\\,;\\,y\')$, alors $\\vec{u} \\cdot \\vec{v} = xx\' + yy\'$.',
      correction: [`$${vec('u')} \\cdot ${vec('v')} = ${a} \\times ${paren(c)} + ${paren(b)} \\times ${paren(d)} = ${value}$`],
    };
  },
};

/** Angles dont le cosinus est rationnel, en douzièmes de π, avec ce cosinus. */
const ANGLES: [number, number][] = [
  [0, 1],
  [4, 0.5],
  [6, 0],
  [8, -0.5],
  [12, -1],
];

/** Un cosinus rationnel, entre parenthèses s'il est négatif (facteur d'un produit). */
const cosTex = (cos: number) => (cos < 0 ? `\\left(${fracLatex(frac(cos * 2, 2))}\\right)` : fracLatex(frac(cos * 2, 2)));

const normeAngle: Skill = {
  id: '1re-ps-norme-angle',
  name: 'Utiliser normes et angle',
  generate(rng, level) {
    const nu = rng.int(1, level === 1 ? 5 : 9);
    const nv = rng.int(1, level === 1 ? 5 : 9);
    const [k, cos] = rng.pick(level === 1 ? ANGLES.slice(1, 4) : ANGLES);
    const value = frac(nu * nv * cos * 2, 2);
    const angle = piTex(k, 12);
    const dot = `${vec('u')} \\cdot ${vec('v')}`;
    if (level === 3) {
      // Retrouver l'angle à partir du produit scalaire.
      return {
        skill: this.id,
        level,
        prompt: `On sait que $\\|${vec('u')}\\| = ${nu}$, $\\|${vec('v')}\\| = ${nv}$ et $${dot} = ${fracLatex(value)}$. Quelle est une mesure de l'angle $(${vec('u')}, ${vec('v')})$ dans $[0\\,;\\,\\pi]$ ?`,
        answer: makeChoice(rng, `$${angle}$`, ANGLES.map(([a]) => `$${piTex(a, 12)}$`), () => `$${piTex(rng.pick([2, 3, 9, 10]), 12)}$`),
        hint: '$\\vec{u} \\cdot \\vec{v} = \\|\\vec{u}\\| \\times \\|\\vec{v}\\| \\times \\cos(\\vec{u}, \\vec{v})$ : calcule d’abord le cosinus.',
        correction: [`$\\cos(${vec('u')}, ${vec('v')}) = \\frac{${fracLatex(value)}}{${nu} \\times ${nv}} = ${fracLatex(frac(cos * 2, 2))}$`, `Donc l'angle mesure $${angle}$.`],
      };
    }
    return {
      skill: this.id,
      level,
      prompt: `On sait que $\\|${vec('u')}\\| = ${nu}$, $\\|${vec('v')}\\| = ${nv}$ et que l'angle $(${vec('u')}, ${vec('v')})$ mesure $${angle}$. Calcule $${dot}$.`,
      answer: { kind: 'number', value },
      hint: '$\\vec{u} \\cdot \\vec{v} = \\|\\vec{u}\\| \\times \\|\\vec{v}\\| \\times \\cos(\\vec{u}, \\vec{v})$.',
      correction: [`$${dot} = ${nu} \\times ${nv} \\times \\cos\\left(${angle}\\right) = ${nu} \\times ${nv} \\times ${cosTex(cos)} = ${fracLatex(value)}$`],
    };
  },
};

const orthogonal: Skill = {
  id: '1re-ps-orthogonal',
  name: 'Trouver un vecteur orthogonal',
  generate(rng, level) {
    // u(m ; a) et v(b ; c) orthogonaux : mb + ac = 0.
    const b = rng.nonZero(-6, 6);
    const c = rng.nonZero(-6, 6);
    const a = level === 1 ? b * rng.nonZero(-3, 3) : rng.nonZero(-6, 6);
    const m = frac(-a * c, b);
    return {
      skill: this.id,
      level,
      prompt: `Dans un repère orthonormé, $${vec('u')}\\begin{pmatrix} m \\\\ ${a} \\end{pmatrix}$ et $${vec('v')}${coords(b, c)}$. Pour quelle valeur de $m$ ces vecteurs sont-ils orthogonaux ?`,
      answer: { kind: 'number', value: m },
      hint: 'Deux vecteurs sont orthogonaux si et seulement si leur produit scalaire est nul.',
      correction: [`$${vec('u')} \\cdot ${vec('v')} = ${b}m + ${paren(a)} \\times ${paren(c)} = ${b}m ${a * c < 0 ? '-' : '+'} ${Math.abs(a * c)}$`, `$${b}m ${a * c < 0 ? '-' : '+'} ${Math.abs(a * c)} = 0 \\iff m = ${fracLatex(m)}$`],
    };
  },
};

const alKashi: Skill = {
  id: '1re-ps-al-kashi',
  name: 'Appliquer la formule d’Al-Kashi',
  generate(rng, level) {
    const b = rng.int(2, level === 1 ? 6 : 10);
    const c = rng.int(2, level === 1 ? 6 : 10);
    const [k, cos] = rng.pick(level === 1 ? [ANGLES[2]] : level === 2 ? [ANGLES[1], ANGLES[3]] : ANGLES.slice(1, 4));
    const value = b * b + c * c - 2 * b * c * cos;
    return {
      skill: this.id,
      level,
      prompt: `Dans le triangle $ABC$, $AB = ${c}$, $AC = ${b}$ et $\\widehat{BAC} = ${piTex(k, 12)}$. Calcule $BC^2$.`,
      answer: { kind: 'number', value: frac(value) },
      hint: 'Al-Kashi : $BC^2 = AB^2 + AC^2 - 2 \\times AB \\times AC \\times \\cos\\widehat{BAC}$.',
      correction: [`$BC^2 = ${c}^2 + ${b}^2 - 2 \\times ${c} \\times ${b} \\times ${cosTex(cos)} = ${value}$`],
    };
  },
};

const polarisation: Skill = {
  id: '1re-ps-polarisation',
  name: 'Utiliser les normes (polarisation)',
  generate(rng, level) {
    const nu = rng.int(1, 8);
    const nv = rng.int(1, 8);
    const minus = level === 3 && rng.next() < 0.5;
    // Choisir le produit scalaire puis en déduire la norme de la somme (ou de la différence).
    const p = rng.int(-nu * nv + 1, nu * nv - 1);
    const sq = nu * nu + nv * nv + (minus ? -2 : 2) * p;
    const op = minus ? '-' : '+';
    const dot = `${vec('u')} \\cdot ${vec('v')}`;
    return {
      skill: this.id,
      level,
      prompt: `On sait que $\\|${vec('u')}\\| = ${nu}$, $\\|${vec('v')}\\| = ${nv}$ et $\\|${vec('u')} ${op} ${vec('v')}\\|^2 = ${sq}$. Calcule $${dot}$.`,
      answer: { kind: 'number', value: frac(p) },
      hint: `$\\|\\vec{u} ${op} \\vec{v}\\|^2 = \\|\\vec{u}\\|^2 ${op} 2\\,\\vec{u} \\cdot \\vec{v} + \\|\\vec{v}\\|^2$.`,
      correction: [
        `$${sq} = ${nu}^2 ${op} 2\\,${dot} + ${nv}^2 = ${nu * nu + nv * nv} ${op} 2\\,${dot}$`,
        `Donc $${dot} = ${minus ? `\\frac{${nu * nu + nv * nv} - ${paren(sq)}}{2}` : `\\frac{${sq} - ${nu * nu + nv * nv}}{2}`} = ${p}$.`,
      ],
    };
  },
};

/** Vecteurs du rectangle ABCD (A(0;0), B(L;0), C(L;l), D(0;l)) en fonction de L et l. */
const RECT: Record<string, [number, number, number, number]> = {
  AB: [1, 0, 0, 0],
  AD: [0, 0, 0, 1],
  AC: [1, 0, 0, 1],
  BD: [-1, 0, 0, 1],
  CB: [0, 0, 0, -1],
  DC: [1, 0, 0, 0],
  CA: [-1, 0, 0, -1],
  BC: [0, 0, 0, 1],
};

const figure: Skill = {
  id: '1re-ps-figure',
  name: 'Calculer un produit scalaire dans une figure',
  generate(rng, level) {
    const L = rng.int(2, 8);
    const l = level === 1 ? L : rng.int(2, 8);
    const names = Object.keys(RECT);
    const pool = level === 1 ? ['AB', 'AD', 'AC', 'DC', 'BC'] : names;
    const [p, q] = rng.shuffle(pool).slice(0, 2);
    const at = (n: string): [number, number] => [RECT[n][0] * L, RECT[n][3] * l];
    const [x1, y1] = at(p);
    const [x2, y2] = at(q);
    const value = x1 * x2 + y1 * y2;
    const shape = L === l ? `le carré $ABCD$ de côté $${L}$` : `le rectangle $ABCD$ avec $AB = ${L}$ et $AD = ${l}$`;
    return {
      skill: this.id,
      level,
      prompt: `On considère ${shape}. Calcule $\\overrightarrow{${p}} \\cdot \\overrightarrow{${q}}$.`,
      answer: { kind: 'number', value: frac(value) },
      hint: 'Place-toi dans le repère orthonormé d’origine $A$, d’axes $(AB)$ et $(AD)$, puis utilise les coordonnées.',
      correction: [
        `Avec $A(0\\,;\\,0)$, $B(${L}\\,;\\,0)$, $C(${L}\\,;\\,${l})$ et $D(0\\,;\\,${l})$ : $\\overrightarrow{${p}}${coords(x1, y1)}$ et $\\overrightarrow{${q}}${coords(x2, y2)}$.`,
        `$\\overrightarrow{${p}} \\cdot \\overrightarrow{${q}} = ${x1} \\times ${paren(x2)} + ${paren(y1)} \\times ${paren(y2)} = ${value}$`,
      ],
    };
  },
};

export const PRODUIT_SCALAIRE: ChapterDef = {
  id: '1re-produit-scalaire',
  title: 'Produit scalaire',
  region: 'Grottes de Cristal',
  theme: 'cristal',
  terrain: 'canyon',
  skills: [coordonnees, normeAngle, orthogonal, alKashi, polarisation, figure],
  creatures: [
    {
      id: '1re-scalaron',
      name: 'Scalaron',
      description: 'Un petit cristal qui multiplie les abscisses, puis les ordonnées, et additionne le tout.',
      skills: ['1re-ps-coordonnees'],
      look: { shape: 'blob', hue: 180, symbol: '·' },
    },
    {
      id: '1re-prismouche',
      name: 'Prismouche',
      description: 'Une mouche aux ailes de prisme : elle se repère dans les rectangles et les carrés de la grotte.',
      skills: ['1re-ps-figure', '1re-ps-coordonnees'],
      look: { shape: 'insecte', hue: 165, symbol: '▭' },
    },
    {
      id: '1re-orthogonix',
      name: 'Orthogonix',
      description: 'Un oiseau qui ne vole qu’à angle droit : quand le produit scalaire est nul, il est chez lui.',
      skills: ['1re-ps-orthogonal', '1re-ps-coordonnees'],
      look: { shape: 'oiseau', hue: 195, symbol: '⊥' },
    },
    {
      id: '1re-cosinyx',
      name: 'Cosinyx',
      description: 'Un spectre de quartz qui mesure les normes et l’angle entre deux flèches.',
      skills: ['1re-ps-norme-angle', '1re-ps-polarisation'],
      look: { shape: 'spectre', hue: 270, symbol: 'θ' },
    },
    {
      id: '1re-kashilith',
      name: 'Kashilith',
      description: 'Une bête de cristal qui connaît deux côtés et un angle, et en déduit le troisième côté.',
      skills: ['1re-ps-al-kashi', '1re-ps-norme-angle'],
      look: { shape: 'bete', hue: 150, symbol: '△' },
    },
  ],
  boss: {
    id: '1re-scalaritan',
    name: 'Scalaritan',
    description: 'Le gardien des grottes, un colosse de cristal qui projette chaque vecteur sur un autre.',
    skills: ['1re-ps-coordonnees', '1re-ps-norme-angle', '1re-ps-orthogonal', '1re-ps-al-kashi', '1re-ps-polarisation', '1re-ps-figure'],
    look: { shape: 'golem', hue: 185, symbol: '·' },
  },
};
