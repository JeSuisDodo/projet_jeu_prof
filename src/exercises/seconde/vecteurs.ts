import { frac, fracLatex } from '../fraction';
import type { Rng } from '../rng';
import { type Answer, type Level, type Skill, makeChoice } from '../types';
import { enrich, variant } from '../variantes';
import { fixedChoice, par } from './outils';

/** Chapitre 5 de 2nde : vecteurs et coordonnées. */

type Vec = [number, number];

const pt = (rng: Rng, level: Level): Vec => {
  const b = level === 1 ? 5 : 9;
  return [rng.int(-b, b), rng.int(-b, b)];
};
const P = (name: string, [x, y]: Vec) => `${name}(${x}\\,;\\,${y})`;
const V = (name: string, [x, y]: Vec) => `\\vec{${name}}\\begin{pmatrix}${x}\\\\${y}\\end{pmatrix}`;
const pair = ([x, y]: Vec, labels: [string, string]): Answer => ({ kind: 'pair', values: [frac(x), frac(y)], labels });

const coordonnees: Skill = {
  id: '2nde-coord-vecteur',
  name: 'Calculer les coordonnées d’un vecteur',
  generate(rng, level) {
    const A = pt(rng, level);
    const B = pt(rng, level);
    const AB: Vec = [B[0] - A[0], B[1] - A[1]];
    return {
      skill: '2nde-coord-vecteur',
      level,
      prompt: `On donne $${P('A', A)}$ et $${P('B', B)}$. Quelles sont les coordonnées du vecteur $\\overrightarrow{AB}$ ?`,
      answer: pair(AB, ['x', 'y']),
      hint: '$\\overrightarrow{AB}$ a pour coordonnées $(x_B - x_A\\,;\\,y_B - y_A)$ : l’arrivée moins le départ.',
      correction: [`$x = ${B[0]} - ${par(A[0])} = ${AB[0]}$`, `$y = ${B[1]} - ${par(A[1])} = ${AB[1]}$`],
    };
  },
};

const combinaison: Skill = {
  id: '2nde-combinaison',
  name: 'Additionner des vecteurs',
  generate(rng, level) {
    const u: Vec = [rng.int(-6, 6), rng.int(-6, 6)];
    const v: Vec = [rng.int(-6, 6), rng.int(-6, 6)];
    const k = level === 1 ? 1 : rng.pick([2, 3, -1, -2]);
    const m = level === 3 ? rng.pick([2, 3, -2, -3]) : rng.pick([1, -1]);
    const w: Vec = [k * u[0] + m * v[0], k * u[1] + m * v[1]];
    const term = (c: number, name: string, first: boolean) =>
      `${c < 0 ? '-' : first ? '' : '+'} ${Math.abs(c) === 1 ? '' : Math.abs(c)}\\vec{${name}}`;
    const expr = `${term(k, 'u', true)} ${term(m, 'v', false)}`;
    return {
      skill: '2nde-combinaison',
      level,
      prompt: `On donne $${V('u', u)}$ et $${V('v', v)}$. Quelles sont les coordonnées de $\\vec{w} = ${expr}$ ?`,
      answer: pair(w, ['x', 'y']),
      hint: 'On multiplie chaque coordonnée par le nombre, puis on additionne coordonnée par coordonnée.',
      correction: [
        `$x = ${par(k)} \\times ${par(u[0])} + ${par(m)} \\times ${par(v[0])} = ${w[0]}$`,
        `$y = ${par(k)} \\times ${par(u[1])} + ${par(m)} \\times ${par(v[1])} = ${w[1]}$`,
      ],
    };
  },
};

const translation: Skill = {
  id: '2nde-translation',
  name: 'Trouver l’image par une translation',
  generate(rng, level) {
    const A = pt(rng, level);
    const B = pt(rng, level);
    const C = pt(rng, level);
    const D: Vec = [C[0] + B[0] - A[0], C[1] + B[1] - A[1]];
    return {
      skill: '2nde-translation',
      level,
      prompt: `On donne $${P('A', A)}$, $${P('B', B)}$ et $${P('C', C)}$. Quelles sont les coordonnées de $D$, image de $C$ par la translation de vecteur $\\overrightarrow{AB}$ ?`,
      answer: pair(D, ['x_D', 'y_D']),
      hint: '$D$ est l’image de $C$ quand $\\overrightarrow{CD} = \\overrightarrow{AB}$.',
      correction: [
        `$\\overrightarrow{AB}\\begin{pmatrix}${B[0] - A[0]}\\\\${B[1] - A[1]}\\end{pmatrix}$`,
        `$x_D = ${C[0]} + ${par(B[0] - A[0])} = ${D[0]}$ et $y_D = ${C[1]} + ${par(B[1] - A[1])} = ${D[1]}$`,
      ],
    };
  },
};

const parallelogramme: Skill = {
  id: '2nde-parallelogramme',
  name: 'Compléter un parallélogramme',
  generate(rng, level) {
    const A = pt(rng, level);
    const B = pt(rng, level);
    const C = pt(rng, level);
    // ABCD parallélogramme ⇔ AB→ = DC→ ⇔ D = A + C - B.
    const D: Vec = [A[0] + C[0] - B[0], A[1] + C[1] - B[1]];
    return {
      skill: '2nde-parallelogramme',
      level,
      prompt: `On donne $${P('A', A)}$, $${P('B', B)}$ et $${P('C', C)}$. Quelles sont les coordonnées de $D$ pour que $ABCD$ soit un parallélogramme ?`,
      answer: pair(D, ['x_D', 'y_D']),
      hint: '$ABCD$ est un parallélogramme si et seulement si $\\overrightarrow{AB} = \\overrightarrow{DC}$.',
      correction: [
        `$\\overrightarrow{AB} = \\overrightarrow{DC}$ donne $x_C - x_D = x_B - x_A$, donc $x_D = x_A + x_C - x_B$.`,
        `$x_D = ${A[0]} + ${par(C[0])} - ${par(B[0])} = ${D[0]}$ et $y_D = ${A[1]} + ${par(C[1])} - ${par(B[1])} = ${D[1]}$`,
      ],
    };
  },
};

const det = (u: Vec, v: Vec) => u[0] * v[1] - u[1] * v[0];

const colinearite: Skill = {
  id: '2nde-colinearite',
  name: 'Tester la colinéarité de deux vecteurs',
  generate(rng, level) {
    const u: Vec = [rng.nonZero(-6, 6), rng.nonZero(-6, 6)];
    const colin = rng.next() < 0.5;
    const k = level === 1 ? rng.pick([2, 3, -2]) : rng.pick([2, 3, -2, -3, 4]);
    let v: Vec = [k * u[0], k * u[1]];
    if (level === 3 && colin && u[0] % 2 === 0 && u[1] % 2 === 0) v = [u[0] / 2 * 3, u[1] / 2 * 3];
    if (!colin) v = [v[0], v[1] + rng.nonZero(-2, 2)];
    const d = det(u, v);
    return {
      skill: '2nde-colinearite',
      level,
      prompt: `Les vecteurs $${V('u', u)}$ et $${V('v', v)}$ sont-ils colinéaires ?`,
      answer: fixedChoice(['Oui', 'Non'], d === 0 ? 0 : 1),
      hint: '$\\vec{u}(x\\,;\\,y)$ et $\\vec{v}(x\'\\,;\\,y\')$ sont colinéaires si et seulement si $\\det(\\vec{u}, \\vec{v}) = xy\' - yx\' = 0$.',
      correction: [
        `$\\det(\\vec{u}, \\vec{v}) = ${par(u[0])} \\times ${par(v[1])} - ${par(u[1])} \\times ${par(v[0])} = ${u[0] * v[1]} - ${par(u[1] * v[0])} = ${d}$`,
        d === 0 ? 'Le déterminant est nul : les vecteurs sont colinéaires.' : "Le déterminant n'est pas nul : les vecteurs ne sont pas colinéaires.",
      ],
    };
  },
};

const parametre: Skill = {
  id: '2nde-colineaire-m',
  name: 'Trouver un paramètre de colinéarité',
  generate(rng, level) {
    // u(a ; b) et v(c ; m) colinéaires ⇔ a m - b c = 0 ⇔ m = bc / a.
    const a = rng.nonZero(-6, 6);
    const b = rng.nonZero(-6, 6);
    const c = level === 1 ? a * rng.pick([2, 3, -1]) : rng.nonZero(-9, 9);
    const m = frac(b * c, a);
    return {
      skill: '2nde-colineaire-m',
      level,
      prompt: `Pour quelle valeur de $m$ les vecteurs $${V('u', [a, b])}$ et $\\vec{v}\\begin{pmatrix}${c}\\\\m\\end{pmatrix}$ sont-ils colinéaires ?`,
      answer: { kind: 'number', value: m },
      hint: 'Écris que le déterminant $\\det(\\vec{u}, \\vec{v})$ est nul, puis résous en $m$.',
      correction: [
        `$\\det(\\vec{u}, \\vec{v}) = ${par(a)} \\times m - ${par(b)} \\times ${par(c)} = ${a}m ${-b * c < 0 ? '-' : '+'} ${Math.abs(b * c)}$`,
        `$${a}m ${-b * c < 0 ? '-' : '+'} ${Math.abs(b * c)} = 0$ donne $m = \\frac{${b * c}}{${a}} = ${fracLatex(m)}$`,
      ],
    };
  },
};

/* ---------- Variantes : d'autres façons de poser les mêmes notions ---------- */

const ouiNon = (b: boolean) => fixedChoice(['Oui', 'Non'], b ? 0 : 1);
const LETTRES = ['A', 'B', 'C', 'D', 'E', 'F', 'M', 'N', 'P', 'R', 'S', 'T'];

const coordonneesVariantes = [
  variant('extremite', (rng, level) => {
    const A = pt(rng, level);
    const u: Vec = [rng.int(-6, 6), rng.int(-6, 6)];
    return {
      prompt: `On donne $${P('A', A)}$ et $${V('u', u)}$. Quelles sont les coordonnées du point $B$ tel que $\\overrightarrow{AB} = \\vec{u}$ ?`,
      answer: pair([A[0] + u[0], A[1] + u[1]], ['x_B', 'y_B']),
      hint: '$x_B - x_A = x_{\\vec{u}}$, donc $x_B = x_A + x_{\\vec{u}}$.',
      correction: [`$x_B = ${A[0]} + ${par(u[0])} = ${A[0] + u[0]}$ et $y_B = ${A[1]} + ${par(u[1])} = ${A[1] + u[1]}$`],
    };
  }),
  variant('egalite', (rng, level) => {
    const A = pt(rng, level);
    const B = pt(rng, level);
    const C = pt(rng, level);
    const same = rng.next() < 0.5;
    const D: Vec = same ? [C[0] + B[0] - A[0], C[1] + B[1] - A[1]] : [C[0] + B[0] - A[0] + rng.nonZero(-2, 2), C[1] + B[1] - A[1]];
    return {
      prompt: `On donne $${P('A', A)}$, $${P('B', B)}$, $${P('C', C)}$ et $${P('D', D)}$. A-t-on $\\overrightarrow{AB} = \\overrightarrow{CD}$ ?`,
      answer: ouiNon(same),
      hint: 'Deux vecteurs sont égaux s’ils ont les mêmes coordonnées.',
      correction: [`$\\overrightarrow{AB}(${B[0] - A[0]}\\,;\\,${B[1] - A[1]})$ et $\\overrightarrow{CD}(${D[0] - C[0]}\\,;\\,${D[1] - C[1]})$.`, same ? 'Mêmes coordonnées : les vecteurs sont égaux.' : 'Coordonnées différentes : les vecteurs ne sont pas égaux.'],
    };
  }),
];

const combinaisonVariantes = [
  variant('chasles', (rng) => {
    const [x, y, z] = rng.shuffle(LETTRES).slice(0, 3);
    const kind = rng.pick(['somme', 'difference'] as const);
    // AB + BC = AC ; AB - AC = CB.
    const expr = kind === 'somme' ? `\\overrightarrow{${x}${y}} + \\overrightarrow{${y}${z}}` : `\\overrightarrow{${x}${y}} - \\overrightarrow{${x}${z}}`;
    const correct = kind === 'somme' ? `\\overrightarrow{${x}${z}}` : `\\overrightarrow{${z}${y}}`;
    const v = (a: string, b: string) => `$\\overrightarrow{${a}${b}}$`;
    return {
      prompt: `Simplifie $${expr}$.`,
      answer: makeChoice(rng, `$${correct}$`, [v(z, x), v(y, z), v(x, y), v(y, x), v(x, z), v(z, y), '$\\vec{0}$'], () => '$\\vec{0}$'),
      hint: 'Relation de Chasles : $\\overrightarrow{AB} + \\overrightarrow{BC} = \\overrightarrow{AC}$. Et $-\\overrightarrow{AC} = \\overrightarrow{CA}$.',
      correction: kind === 'somme' ? [`$${expr} = ${correct}$ (relation de Chasles).`] : [`$${expr} = \\overrightarrow{${z}${x}} + \\overrightarrow{${x}${y}} = ${correct}$`],
    };
  }),
  variant('vecteur-manquant', (rng) => {
    const u: Vec = [rng.int(-6, 6), rng.int(-6, 6)];
    const v: Vec = [rng.int(-6, 6), rng.int(-6, 6)];
    const w: Vec = [u[0] + v[0], u[1] + v[1]];
    return {
      prompt: `On donne $${V('u', u)}$ et $${V('w', w)}$. Quelles sont les coordonnées du vecteur $\\vec{v}$ tel que $\\vec{u} + \\vec{v} = \\vec{w}$ ?`,
      answer: pair(v, ['x', 'y']),
      hint: '$\\vec{v} = \\vec{w} - \\vec{u}$',
      correction: [`$\\vec{v}(${w[0]} - ${par(u[0])}\\,;\\,${w[1]} - ${par(u[1])}) = (${v[0]}\\,;\\,${v[1]})$`],
    };
  }),
];

const translationVariantes = [
  variant('antecedent', (rng, level) => {
    const A = pt(rng, level);
    const B = pt(rng, level);
    const D = pt(rng, level);
    const C: Vec = [D[0] - (B[0] - A[0]), D[1] - (B[1] - A[1])];
    return {
      prompt: `On donne $${P('A', A)}$, $${P('B', B)}$ et $${P('D', D)}$. Quel point $C$ a pour image $D$ par la translation de vecteur $\\overrightarrow{AB}$ ?`,
      answer: pair(C, ['x_C', 'y_C']),
      hint: '$\\overrightarrow{CD} = \\overrightarrow{AB}$, donc $C = D - \\overrightarrow{AB}$.',
      correction: [`$\\overrightarrow{AB}(${B[0] - A[0]}\\,;\\,${B[1] - A[1]})$`, `$x_C = ${D[0]} - ${par(B[0] - A[0])} = ${C[0]}$ et $y_C = ${D[1]} - ${par(B[1] - A[1])} = ${C[1]}$`],
    };
  }),
  variant('vecteur', (rng, level) => {
    const A = pt(rng, level);
    const A2 = pt(rng, level);
    return {
      prompt: `Une translation transforme $${P('A', A)}$ en $${P("A'", A2)}$. Quelles sont les coordonnées de son vecteur ?`,
      answer: pair([A2[0] - A[0], A2[1] - A[1]], ['x', 'y']),
      hint: "Le vecteur de la translation est $\\overrightarrow{AA'}$.",
      correction: [`$\\overrightarrow{AA'}(${A2[0]} - ${par(A[0])}\\,;\\,${A2[1]} - ${par(A[1])}) = (${A2[0] - A[0]}\\,;\\,${A2[1] - A[1]})$`],
    };
  }),
];

const parallelogrammeVariantes = [
  variant('est-parallelogramme', (rng, level) => {
    const A = pt(rng, level);
    const B = pt(rng, level);
    const C = pt(rng, level);
    const yes = rng.next() < 0.5;
    const D: Vec = [A[0] + C[0] - B[0] + (yes ? 0 : rng.nonZero(-2, 2)), A[1] + C[1] - B[1]];
    const ok = B[0] - A[0] === C[0] - D[0] && B[1] - A[1] === C[1] - D[1];
    return {
      prompt: `$ABCD$ est-il un parallélogramme, avec $${P('A', A)}$, $${P('B', B)}$, $${P('C', C)}$ et $${P('D', D)}$ ?`,
      answer: ouiNon(ok),
      hint: 'Compare $\\overrightarrow{AB}$ et $\\overrightarrow{DC}$.',
      correction: [`$\\overrightarrow{AB}(${B[0] - A[0]}\\,;\\,${B[1] - A[1]})$ et $\\overrightarrow{DC}(${C[0] - D[0]}\\,;\\,${C[1] - D[1]})$.`, ok ? 'Ils sont égaux : $ABCD$ est un parallélogramme (éventuellement aplati).' : 'Ils sont différents : ce n’est pas un parallélogramme.'],
    };
  }),
  variant('sommet-B', (rng, level) => {
    const A = pt(rng, level);
    const C = pt(rng, level);
    const D = pt(rng, level);
    const B: Vec = [A[0] + C[0] - D[0], A[1] + C[1] - D[1]];
    return {
      prompt: `On donne $${P('A', A)}$, $${P('C', C)}$ et $${P('D', D)}$. Quelles sont les coordonnées de $B$ pour que $ABCD$ soit un parallélogramme ?`,
      answer: pair(B, ['x_B', 'y_B']),
      hint: '$\\overrightarrow{AB} = \\overrightarrow{DC}$',
      correction: [`$x_B = x_A + x_C - x_D = ${B[0]}$ et $y_B = y_A + y_C - y_D = ${B[1]}$`],
    };
  }),
];

const colineariteVariantes = [
  variant('alignes', (rng, level) => {
    const A = pt(rng, level);
    const u: Vec = [rng.nonZero(-4, 4), rng.int(-4, 4)];
    const k = rng.pick([2, 3, -1, -2]);
    const yes = rng.next() < 0.5;
    const B: Vec = [A[0] + u[0], A[1] + u[1]];
    const C: Vec = [A[0] + k * u[0], A[1] + k * u[1] + (yes ? 0 : rng.nonZero(-2, 2))];
    const d = det([B[0] - A[0], B[1] - A[1]], [C[0] - A[0], C[1] - A[1]]);
    return {
      prompt: `Les points $${P('A', A)}$, $${P('B', B)}$ et $${P('C', C)}$ sont-ils alignés ?`,
      answer: ouiNon(d === 0),
      hint: 'Teste la colinéarité de $\\overrightarrow{AB}$ et $\\overrightarrow{AC}$.',
      correction: [`$\\overrightarrow{AB}(${B[0] - A[0]}\\,;\\,${B[1] - A[1]})$, $\\overrightarrow{AC}(${C[0] - A[0]}\\,;\\,${C[1] - A[1]})$.`, `$\\det = ${d}$ : ${d === 0 ? 'les points sont alignés' : 'les points ne sont pas alignés'}.`],
    };
  }),
  variant('coefficient', (rng, level) => {
    const u: Vec = [rng.nonZero(-5, 5), rng.nonZero(-5, 5)];
    const k = level === 3 ? frac(rng.nonZero(-5, 5), 2) : frac(rng.pick([2, 3, -1, -2, -3, 4]));
    // v = k u, à coordonnées entières : en niveau 3, u est pair.
    if (k.d === 2) {
      u[0] *= 2;
      u[1] *= 2;
    }
    const v: Vec = [(k.n * u[0]) / k.d, (k.n * u[1]) / k.d];
    return {
      prompt: `Les vecteurs $${V('u', u)}$ et $${V('v', v)}$ sont colinéaires. Quel est le réel $k$ tel que $\\vec{v} = k\\vec{u}$ ?`,
      answer: { kind: 'number', value: k },
      hint: 'Divise une coordonnée de $\\vec{v}$ par la coordonnée correspondante de $\\vec{u}$.',
      correction: [`$k = \\frac{${v[0]}}{${u[0]}} = ${fracLatex(k)}$ (et on vérifie : $\\frac{${v[1]}}{${u[1]}} = ${fracLatex(k)}$).`],
    };
  }),
];

const parametreVariantes = [
  variant('alignement', (rng) => {
    const A: Vec = [rng.int(-5, 5), rng.int(-5, 5)];
    const u: Vec = [rng.nonZero(-3, 3), rng.nonZero(-4, 4)];
    const B: Vec = [A[0] + u[0], A[1] + u[1]];
    const t = rng.nonZero(-3, 3);
    // C = A + t u : on cache son ordonnée.
    const C: Vec = [A[0] + t * u[0], A[1] + t * u[1]];
    return {
      prompt: `Pour quelle valeur de $m$ les points $${P('A', A)}$, $${P('B', B)}$ et $C(${C[0]}\\,;\\,m)$ sont-ils alignés ?`,
      answer: { kind: 'number', value: frac(C[1]) },
      hint: 'Écris que $\\overrightarrow{AB}$ et $\\overrightarrow{AC}$ sont colinéaires (déterminant nul).',
      correction: [`$\\det(\\overrightarrow{AB}, \\overrightarrow{AC}) = ${par(u[0])}(m - ${par(A[1])}) - ${par(u[1])} \\times ${par(C[0] - A[0])} = 0$`, `$m = ${C[1]}$`],
    };
  }),
  variant('paralleles', (rng, level) => {
    const a = rng.nonZero(-6, 6);
    const b = rng.nonZero(-6, 6);
    const c = level === 1 ? a * rng.pick([2, -1]) : rng.nonZero(-9, 9);
    const m = frac(b * c, a);
    return {
      prompt: `On donne $\\overrightarrow{AB}\\begin{pmatrix}${a}\\\\${b}\\end{pmatrix}$ et $\\overrightarrow{CD}\\begin{pmatrix}${c}\\\\m\\end{pmatrix}$. Pour quelle valeur de $m$ les droites $(AB)$ et $(CD)$ sont-elles parallèles ?`,
      answer: { kind: 'number', value: m },
      hint: 'Deux droites sont parallèles si leurs vecteurs directeurs sont colinéaires.',
      correction: [`$${par(a)} \\times m - ${par(b)} \\times ${par(c)} = 0$`, `$m = ${fracLatex(m)}$`],
    };
  }),
];

export const VECTEURS_SKILLS: Skill[] = [
  enrich(coordonnees, coordonneesVariantes),
  enrich(combinaison, combinaisonVariantes),
  enrich(translation, translationVariantes),
  enrich(parallelogramme, parallelogrammeVariantes),
  enrich(colinearite, colineariteVariantes),
  enrich(parametre, parametreVariantes),
];
