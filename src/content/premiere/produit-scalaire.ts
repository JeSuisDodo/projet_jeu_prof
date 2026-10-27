import { frac, fracLatex } from '../../exercises/fraction';
import { paren } from '../../exercises/latex';
import { type Answer, type Skill, makeChoice } from '../../exercises/types';
import { enrich, variant } from '../../exercises/variantes';
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

const vraiFaux = (b: boolean): Answer => ({ kind: 'choice', options: ['Vrai', 'Faux'], correct: b ? 0 : 1 });
const pt = (name: string, x: number, y: number) => `${name}(${x}\\,;\\,${y})`;
const NATURE = ['aigu', 'droit', 'obtus'];
const nature = (dot: number) => (dot > 0 ? 0 : dot === 0 ? 1 : 2);

const coordonneesVariantes = [
  variant('points', (rng, level) => {
    const r = level === 1 ? 4 : 7;
    const [ax, ay, bx, by, cx, cy] = Array.from({ length: 6 }, () => rng.int(-r, r));
    const [u, v] = [[bx - ax, by - ay], [cx - ax, cy - ay]];
    const value = u[0] * v[0] + u[1] * v[1];
    return {
      prompt: `Dans un repère orthonormé, $${pt('A', ax, ay)}$, $${pt('B', bx, by)}$ et $${pt('C', cx, cy)}$. Calcule $\\overrightarrow{AB} \\cdot \\overrightarrow{AC}$.`,
      answer: { kind: 'number', value: frac(value) },
      hint: 'Calcule d’abord les coordonnées des deux vecteurs.',
      correction: [`$\\overrightarrow{AB}${coords(u[0], u[1])}$ et $\\overrightarrow{AC}${coords(v[0], v[1])}$.`, `$\\overrightarrow{AB} \\cdot \\overrightarrow{AC} = ${u[0]} \\times ${paren(v[0])} + ${paren(u[1])} \\times ${paren(v[1])} = ${value}$`],
    };
  }),
  variant('norme-somme', (rng) => {
    const [a, b, c, d] = [rng.int(-5, 5), rng.int(-5, 5), rng.int(-5, 5), rng.int(-5, 5)];
    const minus = rng.next() < 0.5;
    const [x, y] = minus ? [a - c, b - d] : [a + c, b + d];
    return {
      prompt: `Dans un repère orthonormé, $${vec('u')}${coords(a, b)}$ et $${vec('v')}${coords(c, d)}$. Calcule $\\|${vec('u')} ${minus ? '-' : '+'} ${vec('v')}\\|^2$.`,
      answer: { kind: 'number', value: frac(x * x + y * y) },
      hint: 'Calcule les coordonnées du vecteur, puis la somme des carrés.',
      correction: [`$${vec('u')} ${minus ? '-' : '+'} ${vec('v')}${coords(x, y)}$, donc $\\|${vec('u')} ${minus ? '-' : '+'} ${vec('v')}\\|^2 = ${paren(x)}^2 + ${paren(y)}^2 = ${x * x + y * y}$.`],
    };
  }),
  variant('vrai-faux-orthogonaux', (rng) => {
    const a = rng.int(-6, 6);
    const b = rng.nonZero(-6, 6);
    const k = rng.nonZero(-2, 2);
    const ok = rng.next() < 0.5;
    const [c, d] = ok ? [-k * b, k * a] : [-k * b + rng.nonZero(-2, 2), k * a];
    const dot = a * c + b * d;
    return {
      prompt: `Vrai ou faux : les vecteurs $${vec('u')}${coords(a, b)}$ et $${vec('v')}${coords(c, d)}$ sont orthogonaux.`,
      answer: vraiFaux(dot === 0),
      hint: 'Calcule leur produit scalaire.',
      correction: [`$${vec('u')} \\cdot ${vec('v')} = ${a} \\times ${paren(c)} + ${paren(b)} \\times ${paren(d)} = ${dot}$ : c'est ${dot === 0 ? 'vrai' : 'faux'}.`],
    };
  }),
];

const normeAngleVariantes = [
  variant('nature-angle', (rng) => {
    const nu = rng.int(1, 9);
    const nv = rng.int(1, 9);
    const dot = rng.next() < 0.25 ? 0 : rng.int(-nu * nv + 1, nu * nv - 1);
    return {
      prompt: `On sait que $\\|${vec('u')}\\| = ${nu}$, $\\|${vec('v')}\\| = ${nv}$ et $${vec('u')} \\cdot ${vec('v')} = ${dot}$. L'angle géométrique entre $${vec('u')}$ et $${vec('v')}$ est :`,
      answer: { kind: 'choice', options: NATURE, correct: nature(dot) },
      hint: 'Le produit scalaire a le signe du cosinus de l’angle.',
      correction: [`$\\cos(${vec('u')}, ${vec('v')}) = \\frac{${dot}}{${nu * nv}}$ est ${dot > 0 ? 'positif : l’angle est aigu' : dot === 0 ? 'nul : l’angle est droit' : 'négatif : l’angle est obtus'}.`],
    };
  }),
  variant('cosinus', (rng) => {
    const nu = rng.int(1, 9);
    const nv = rng.int(1, 9);
    const dot = rng.int(-nu * nv, nu * nv);
    const value = frac(dot, nu * nv);
    return {
      prompt: `On sait que $\\|${vec('u')}\\| = ${nu}$, $\\|${vec('v')}\\| = ${nv}$ et $${vec('u')} \\cdot ${vec('v')} = ${dot}$. Calcule $\\cos(${vec('u')}, ${vec('v')})$ (fraction).`,
      answer: { kind: 'number', value },
      hint: '$\\cos(\\vec{u}, \\vec{v}) = \\frac{\\vec{u} \\cdot \\vec{v}}{\\|\\vec{u}\\| \\times \\|\\vec{v}\\|}$.',
      correction: [`$\\cos(${vec('u')}, ${vec('v')}) = \\frac{${dot}}{${nu} \\times ${nv}} = ${fracLatex(value)}$`],
    };
  }),
  variant('norme-inconnue', (rng) => {
    const nu = rng.int(1, 9);
    const nv = rng.int(1, 9);
    const [k, cos] = rng.pick([ANGLES[0], ANGLES[1], ANGLES[3], ANGLES[4]]);
    const dot = frac(nu * nv * cos * 2, 2);
    return {
      prompt: `On sait que $\\|${vec('v')}\\| = ${nv}$, que l'angle $(${vec('u')}, ${vec('v')})$ mesure $${piTex(k, 12)}$ et que $${vec('u')} \\cdot ${vec('v')} = ${fracLatex(dot)}$. Calcule $\\|${vec('u')}\\|$.`,
      answer: { kind: 'number', value: frac(nu) },
      hint: 'Isole $\\|\\vec{u}\\|$ dans $\\vec{u} \\cdot \\vec{v} = \\|\\vec{u}\\| \\times \\|\\vec{v}\\| \\times \\cos(\\vec{u}, \\vec{v})$.',
      correction: [`$${fracLatex(dot)} = \\|${vec('u')}\\| \\times ${nv} \\times ${cosTex(cos)}$, donc $\\|${vec('u')}\\| = ${nu}$.`],
    };
  }),
];

const orthogonalVariantes = [
  variant('triangle-rectangle', (rng) => {
    const [ax, ay] = [rng.int(-5, 5), rng.int(-5, 5)];
    let [dx, dy] = [rng.int(-4, 4), rng.int(-4, 4)];
    if (dx === 0 && dy === 0) dx = 1;
    const k = rng.pick([-2, -1, 1, 2]);
    const ok = rng.next() < 0.5;
    const [ex, ey] = ok ? [-k * dy, k * dx] : [-k * dy + rng.nonZero(-2, 2), k * dx];
    const dot = dx * ex + dy * ey;
    return {
      prompt: `Vrai ou faux : le triangle de sommets $${pt('A', ax, ay)}$, $${pt('B', ax + dx, ay + dy)}$ et $${pt('C', ax + ex, ay + ey)}$ est rectangle en $A$.`,
      answer: vraiFaux(dot === 0),
      hint: 'Il est rectangle en $A$ si et seulement si $\\overrightarrow{AB} \\cdot \\overrightarrow{AC} = 0$.',
      correction: [`$\\overrightarrow{AB}${coords(dx, dy)}$, $\\overrightarrow{AC}${coords(ex, ey)}$ et $\\overrightarrow{AB} \\cdot \\overrightarrow{AC} = ${dot}$ : c'est ${dot === 0 ? 'vrai' : 'faux'}.`],
    };
  }),
  variant('deux-valeurs', (rng) => {
    const k = rng.int(1, 6);
    const a = rng.pick([1, k, k * k].filter((v, i, t) => t.indexOf(v) === i));
    const b = -(k * k) / a;
    const values = [frac(-k), frac(k)];
    return {
      prompt: `Dans un repère orthonormé, $${vec('u')}\\begin{pmatrix} m \\\\ ${a} \\end{pmatrix}$ et $${vec('v')}\\begin{pmatrix} m \\\\ ${b} \\end{pmatrix}$. Pour quelles valeurs de $m$ ces vecteurs sont-ils orthogonaux ?`,
      answer: { kind: 'set', values },
      hint: 'Écris que le produit scalaire est nul : on obtient une équation du second degré.',
      correction: [`$${vec('u')} \\cdot ${vec('v')} = m^2 ${a * b < 0 ? '-' : '+'} ${Math.abs(a * b)}$`, `$m^2 = ${k * k} \\iff m = -${k}$ ou $m = ${k}$`],
    };
  }),
];

const alKashiVariantes = [
  variant('cosinus-angle', (rng) => {
    const b = rng.int(2, 9);
    const c = rng.int(2, 9);
    const a = rng.int(Math.abs(b - c) + 1, b + c - 1);
    const value = frac(b * b + c * c - a * a, 2 * b * c);
    return {
      prompt: `Dans le triangle $ABC$, $AB = ${c}$, $AC = ${b}$ et $BC = ${a}$. Calcule $\\cos\\widehat{BAC}$ (fraction).`,
      answer: { kind: 'number', value },
      hint: 'Isole le cosinus dans la formule d’Al-Kashi.',
      correction: [`$\\cos\\widehat{BAC} = \\frac{AB^2 + AC^2 - BC^2}{2 \\times AB \\times AC} = \\frac{${c * c} + ${b * b} - ${a * a}}{${2 * b * c}} = ${fracLatex(value)}$`],
    };
  }),
  variant('nature-triangle', (rng) => {
    let [a, b, c]: number[] = [];
    if (rng.next() < 0.3) {
      const [p, q, r] = rng.pick([[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17]]);
      [b, c, a] = rng.next() < 0.5 ? [p, q, r] : [q, p, r];
    } else {
      b = rng.int(2, 9);
      c = rng.int(2, 9);
      a = rng.int(Math.abs(b - c) + 1, b + c - 1);
    }
    const d = b * b + c * c - a * a;
    return {
      prompt: `Dans le triangle $ABC$, $AB = ${c}$, $AC = ${b}$ et $BC = ${a}$. L'angle $\\widehat{BAC}$ est :`,
      answer: { kind: 'choice', options: NATURE, correct: nature(d) },
      hint: 'Avec Al-Kashi, le signe de $\\cos\\widehat{BAC}$ est celui de $AB^2 + AC^2 - BC^2$.',
      correction: [`$AB^2 + AC^2 - BC^2 = ${c * c} + ${b * b} - ${a * a} = ${d}$ : l'angle est ${NATURE[nature(d)]}.`],
    };
  }),
];

const polarisationVariantes = [
  variant('somme-et-difference', (rng) => {
    const nu = rng.int(1, 8);
    const nv = rng.int(1, 8);
    const p = rng.int(-nu * nv + 1, nu * nv - 1);
    const s2 = nu * nu + nv * nv;
    return {
      prompt: `On sait que $\\|${vec('u')} + ${vec('v')}\\|^2 = ${s2 + 2 * p}$ et $\\|${vec('u')} - ${vec('v')}\\|^2 = ${s2 - 2 * p}$. Calcule $${vec('u')} \\cdot ${vec('v')}$.`,
      answer: { kind: 'number', value: frac(p) },
      hint: 'Soustrais les deux développements : $\\|\\vec{u} + \\vec{v}\\|^2 - \\|\\vec{u} - \\vec{v}\\|^2 = 4\\,\\vec{u} \\cdot \\vec{v}$.',
      correction: [`$4\\,${vec('u')} \\cdot ${vec('v')} = ${s2 + 2 * p} - ${paren(s2 - 2 * p)} = ${4 * p}$, donc $${vec('u')} \\cdot ${vec('v')} = ${p}$.`],
    };
  }),
  variant('norme-de-la-somme', (rng) => {
    const nu = rng.int(1, 8);
    const nv = rng.int(1, 8);
    const p = rng.int(-nu * nv + 1, nu * nv - 1);
    const minus = rng.next() < 0.5;
    const op = minus ? '-' : '+';
    const value = nu * nu + nv * nv + (minus ? -2 : 2) * p;
    return {
      prompt: `On sait que $\\|${vec('u')}\\| = ${nu}$, $\\|${vec('v')}\\| = ${nv}$ et $${vec('u')} \\cdot ${vec('v')} = ${p}$. Calcule $\\|${vec('u')} ${op} ${vec('v')}\\|^2$.`,
      answer: { kind: 'number', value: frac(value) },
      hint: `$\\|\\vec{u} ${op} \\vec{v}\\|^2 = \\|\\vec{u}\\|^2 ${op} 2\\,\\vec{u} \\cdot \\vec{v} + \\|\\vec{v}\\|^2$.`,
      correction: [`$\\|${vec('u')} ${op} ${vec('v')}\\|^2 = ${nu * nu} ${op} 2 \\times ${paren(p)} + ${nv * nv} = ${value}$`],
    };
  }),
];

/** Sommets d'un triangle équilatéral, en unités (a/2 ; a√3/2). */
const EQUI: Record<string, [number, number]> = { A: [0, 0], B: [2, 0], C: [1, 1] };

const figureVariantes = [
  variant('triangle-equilateral', (rng) => {
    const a = 2 * rng.int(1, 5);
    const names = ['AB', 'AC', 'BC', 'BA', 'CA', 'CB'];
    const [p, q] = rng.shuffle(names).slice(0, 2);
    const v = (n: string) => [EQUI[n[1]][0] - EQUI[n[0]][0], EQUI[n[1]][1] - EQUI[n[0]][1]];
    const [u, w] = [v(p), v(q)];
    const value = ((u[0] * w[0] + 3 * u[1] * w[1]) * a * a) / 4;
    return {
      prompt: `$ABC$ est un triangle équilatéral de côté $${a}$. Calcule $\\overrightarrow{${p}} \\cdot \\overrightarrow{${q}}$.`,
      answer: { kind: 'number', value: frac(value) },
      hint: 'Utilise $\\vec{u} \\cdot \\vec{v} = \\|\\vec{u}\\| \\times \\|\\vec{v}\\| \\times \\cos(\\vec{u}, \\vec{v})$, en faisant attention au sens des vecteurs.',
      correction: [`Les deux vecteurs ont pour norme $${a}$ ; l'angle qu'ils forment a pour cosinus $${cosTex(value / (a * a))}$.`, `$\\overrightarrow{${p}} \\cdot \\overrightarrow{${q}} = ${a} \\times ${a} \\times ${cosTex(value / (a * a))} = ${value}$`],
    };
  }),
  variant('milieu', (rng) => {
    const L = 2 * rng.int(1, 4);
    const l = rng.int(2, 8);
    const P: Record<string, [number, number]> = { A: [0, 0], B: [L, 0], C: [L, l], D: [0, l], I: [L / 2, l] };
    const names = ['AI', 'IB', 'AB', 'AD', 'BI', 'IC', 'DI', 'AC'];
    const [p, q] = rng.shuffle(names).slice(0, 2);
    const v = (n: string) => [P[n[1]][0] - P[n[0]][0], P[n[1]][1] - P[n[0]][1]];
    const [u, w] = [v(p), v(q)];
    const value = u[0] * w[0] + u[1] * w[1];
    return {
      prompt: `$ABCD$ est un rectangle avec $AB = ${L}$ et $AD = ${l}$, et $I$ est le milieu de $[CD]$. Calcule $\\overrightarrow{${p}} \\cdot \\overrightarrow{${q}}$.`,
      answer: { kind: 'number', value: frac(value) },
      hint: 'Place-toi dans le repère d’origine $A$, d’axes $(AB)$ et $(AD)$.',
      correction: [`$A(0\\,;\\,0)$, $B(${L}\\,;\\,0)$, $C(${L}\\,;\\,${l})$, $D(0\\,;\\,${l})$ et $I(${L / 2}\\,;\\,${l})$.`, `$\\overrightarrow{${p}}${coords(u[0], u[1])}$, $\\overrightarrow{${q}}${coords(w[0], w[1])}$, produit scalaire : $${value}$.`],
    };
  }),
];

export const PRODUIT_SCALAIRE: ChapterDef = {
  id: '1re-produit-scalaire',
  title: 'Produit scalaire',
  region: 'Grottes de Cristal',
  theme: 'cristal',
  terrain: 'canyon',
  skills: [
    enrich(coordonnees, coordonneesVariantes),
    enrich(normeAngle, normeAngleVariantes),
    enrich(orthogonal, orthogonalVariantes),
    enrich(alKashi, alKashiVariantes),
    enrich(polarisation, polarisationVariantes),
    enrich(figure, figureVariantes),
  ],
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
