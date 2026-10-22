import { frac, fracLatex } from '../fraction';
import type { Rng } from '../rng';
import type { Answer, Level, Skill } from '../types';
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

export const VECTEURS_SKILLS: Skill[] = [coordonnees, combinaison, translation, parallelogramme, colinearite, parametre];
