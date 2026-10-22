import { frac } from '../fraction';
import type { Skill } from '../types';
import { reduite } from './droites';
import { fixedChoice, latexChoice, par, terms } from './outils';

/** Chapitre 7 de 2nde : positions relatives de droites, systèmes de deux équations. */

const POSITIONS = ['Sécantes', 'Strictement parallèles', 'Confondues'];

const eq = (m: number, p: number) => reduite(frac(m), frac(p));

const position: Skill = {
  id: '2nde-position-droites',
  name: 'Trouver la position de deux droites',
  generate(rng, level) {
    const m = rng.nonZero(-5, 5);
    const p = rng.int(-8, 8);
    const kind = rng.pick([0, 1, 2] as const);
    const m2 = kind === 0 ? m + rng.nonZero(-3, 3) : m;
    const p2 = kind === 1 ? p + rng.nonZero(-4, 4) : kind === 2 ? p : rng.int(-8, 8);
    // Niveau 3 : la seconde droite est donnée par une équation cartésienne (multipliée par k).
    const k = rng.pick([2, 3, -2]);
    const second = level === 3 ? `${terms([[k * m2, 'x'], [-k, 'y'], [k * p2, '']])} = 0` : eq(m2, p2);
    const lines = [
      ...(level === 3 ? [`La seconde équation équivaut à $${eq(m2, p2)}$ (on isole $y$).`] : []),
      `Coefficients directeurs : $${m}$ et $${m2}$.`,
      kind === 0
        ? 'Ils sont différents : les droites sont sécantes.'
        : kind === 1
          ? `Ils sont égaux mais les ordonnées à l'origine $${p}$ et $${p2}$ diffèrent : les droites sont strictement parallèles.`
          : "Mêmes coefficients directeurs et mêmes ordonnées à l'origine : les droites sont confondues.",
    ];
    return {
      skill: '2nde-position-droites',
      level,
      prompt: `Quelle est la position relative des droites $d_1 : ${eq(m, p)}$ et $d_2 : ${second}$ ?`,
      answer: fixedChoice(POSITIONS, kind),
      hint: 'Compare les coefficients directeurs, puis les ordonnées à l’origine.',
      correction: lines,
    };
  },
};

const intersection: Skill = {
  id: '2nde-intersection',
  name: 'Calculer le point d’intersection de deux droites',
  generate(rng, level) {
    const x = rng.int(-6, 6);
    const y = rng.int(-9, 9);
    const m1 = rng.nonZero(-4, 4);
    let m2 = m1;
    while (m2 === m1) m2 = rng.int(-4, 4);
    const p1 = y - m1 * x;
    const p2 = y - m2 * x;
    return {
      skill: '2nde-intersection',
      level,
      prompt: `Quelles sont les coordonnées du point d'intersection des droites $d_1 : ${eq(m1, p1)}$ et $d_2 : ${eq(m2, p2)}$ ?`,
      answer: { kind: 'pair', values: [frac(x), frac(y)], labels: ['x', 'y'] },
      hint: 'Au point d’intersection, les deux expressions de $y$ sont égales : résous cette équation en $x$.',
      correction: [
        `$${terms([[m1, 'x'], [p1, '']])} = ${terms([[m2, 'x'], [p2, '']])}$ donne $${terms([[m1 - m2, 'x']])} = ${p2 - p1}$, donc $x = ${x}$.`,
        `Puis $y = ${m1} \\times ${par(x)} ${p1 < 0 ? '-' : '+'} ${Math.abs(p1)} = ${y}$.`,
      ],
    };
  },
};

const systeme: Skill = {
  id: '2nde-systeme',
  name: 'Résoudre un système de deux équations',
  generate(rng, level) {
    const x = rng.int(-6, 6);
    const y = rng.int(-6, 6);
    const bound = level === 1 ? 3 : 6;
    let a: number, b: number, c: number, d: number;
    do {
      a = level === 1 ? 1 : rng.nonZero(-bound, bound);
      b = rng.nonZero(-bound, bound);
      c = rng.nonZero(-bound, bound);
      d = level === 1 ? rng.pick([1, -1]) : rng.nonZero(-bound, bound);
    } while (a * d - b * c === 0);
    const e = a * x + b * y;
    const f = c * x + d * y;
    const system = `\\begin{cases} ${terms([[a, 'x'], [b, 'y']])} = ${e} \\\\ ${terms([[c, 'x'], [d, 'y']])} = ${f} \\end{cases}`;
    return {
      skill: '2nde-systeme',
      level,
      prompt: `Résous le système $${system}$`,
      answer: { kind: 'pair', values: [frac(x), frac(y)], labels: ['x', 'y'] },
      hint: 'Par substitution (isole une inconnue dans une équation) ou par combinaison (élimine une inconnue).',
      correction: [
        `Le déterminant $${par(a)} \\times ${par(d)} - ${par(b)} \\times ${par(c)} = ${a * d - b * c}$ n'est pas nul : une seule solution.`,
        `On élimine une inconnue, on trouve $x = ${x}$, puis en remplaçant : $y = ${y}$.`,
        `Vérification : $${a} \\times ${par(x)} + ${par(b)} \\times ${par(y)} = ${e}$ et $${c} \\times ${par(x)} + ${par(d)} \\times ${par(y)} = ${f}$.`,
      ],
    };
  },
};

const nbSolutions: Skill = {
  id: '2nde-systeme-nb',
  name: 'Compter les solutions d’un système',
  generate(rng, level) {
    const a = rng.nonZero(-5, 5);
    const b = rng.nonZero(-5, 5);
    const e = rng.int(-9, 9);
    const kind = rng.pick([0, 1, 2] as const);
    const k = rng.pick([2, 3, -2, -1]);
    let c = k * a;
    let d = k * b;
    let f = k * e;
    if (kind === 0) d += rng.nonZero(-2, 2);
    if (kind === 1) f += rng.nonZero(-3, 3);
    if (level === 1 && kind === 0) [c, d, f] = [b, -a, rng.int(-9, 9)];
    const det = a * d - b * c;
    const system = `\\begin{cases} ${terms([[a, 'x'], [b, 'y']])} = ${e} \\\\ ${terms([[c, 'x'], [d, 'y']])} = ${f} \\end{cases}`;
    return {
      skill: '2nde-systeme-nb',
      level,
      prompt: `Combien de couples $(x\\,;\\,y)$ sont solutions du système $${system}$ ?`,
      answer: fixedChoice(['Un seul', 'Aucun', 'Une infinité'], kind),
      hint: 'Calcule $ab\' - a\'b$ : s’il n’est pas nul, il y a une seule solution. Sinon, compare les deux équations.',
      correction: [
        `$${par(a)} \\times ${par(d)} - ${par(b)} \\times ${par(c)} = ${det}$`,
        kind === 0
          ? "Le déterminant n'est pas nul : les droites sont sécantes, une seule solution."
          : kind === 1
            ? `Le déterminant est nul et la seconde équation est la première multipliée par $${k}$, sauf le second membre : droites parallèles, aucune solution.`
            : `La seconde équation est la première multipliée par $${k}$ : droites confondues, une infinité de solutions.`,
      ],
    };
  },
};

const parallele: Skill = {
  id: '2nde-parallele-point',
  name: 'Tracer la parallèle passant par un point',
  generate(rng, level) {
    const m = level === 3 ? rng.nonZero(-5, 5) : rng.nonZero(-3, 3);
    const p = rng.int(-6, 6);
    const x = rng.int(-5, 5);
    const y = rng.int(-9, 9);
    const q = y - m * x;
    const correct = eq(m, q);
    return {
      skill: '2nde-parallele-point',
      level,
      prompt: `Quelle est l'équation de la droite parallèle à $d : ${eq(m, p)}$ passant par $A(${x}\\,;\\,${y})$ ?`,
      answer: latexChoice(rng, correct, [eq(m, p), eq(-m, y + m * x), eq(m, y + m * x), eq(m, y)], () => eq(m, q + rng.nonZero(-3, 3))),
      hint: 'Deux droites parallèles ont le même coefficient directeur.',
      correction: [
        `La parallèle a le même coefficient directeur $${m}$ : son équation est $y = ${m}x + q$.`,
        `$A$ est dessus : $${y} = ${m} \\times ${par(x)} + q$, donc $q = ${q}$.`,
        `$${correct}$`,
      ],
    };
  },
};

export const POSITIONS_SKILLS: Skill[] = [position, intersection, systeme, nbSolutions, parallele];
