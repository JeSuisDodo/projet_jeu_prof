import { frac, fracLatex } from '../fraction';
import type { Skill } from '../types';
import { enrich, variant } from '../variantes';
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

/* ---------- Variantes : d'autres façons de poser les mêmes notions ---------- */

const systemeLatex = (a: number, b: number, e: number, c: number, d: number, f: number, x = 'x', y = 'y') =>
  `\\begin{cases} ${terms([[a, x], [b, y]])} = ${e} \\\\ ${terms([[c, x], [d, y]])} = ${f} \\end{cases}`;

const positionVariantes = [
  variant('parametre', (rng) => {
    const k = rng.nonZero(-6, 6);
    const p = rng.int(-8, 8);
    const q = p + rng.nonZero(-5, 5);
    return {
      prompt: `Pour quelle valeur de $m$ la droite $d_m : y = mx ${q < 0 ? '-' : '+'} ${Math.abs(q)}$ est-elle parallèle à $d : ${eq(k, p)}$ ?`,
      answer: { kind: 'number', value: frac(k) },
      hint: 'Deux droites sont parallèles si et seulement si elles ont le même coefficient directeur.',
      correction: [`Il faut $m = ${k}$ (les ordonnées à l'origine, différentes, rendent les droites strictement parallèles).`],
    };
  }),
  variant('cartesiennes', (rng) => {
    const a = rng.nonZero(-5, 5);
    const b = rng.nonZero(-5, 5);
    const c = rng.int(-9, 9);
    const kind = rng.pick([0, 1, 2] as const);
    const k = rng.pick([2, 3, -1, -2]);
    let [a2, b2, c2] = [k * a, k * b, k * c];
    if (kind === 0) b2 += rng.nonZero(-2, 2);
    if (kind === 1) c2 += rng.nonZero(-4, 4);
    const eq1 = `${terms([[a, 'x'], [b, 'y'], [c, '']])} = 0`;
    const eq2 = `${terms([[a2, 'x'], [b2, 'y'], [c2, '']])} = 0`;
    return {
      prompt: `Quelle est la position relative des droites $d_1 : ${eq1}$ et $d_2 : ${eq2}$ ?`,
      answer: fixedChoice(POSITIONS, kind),
      hint: 'Compare les vecteurs directeurs $(-b\\,;\\,a)$ : sont-ils colinéaires ? Si oui, teste un point.',
      correction: [
        `$${par(a)} \\times ${par(b2)} - ${par(b)} \\times ${par(a2)} = ${a * b2 - b * a2}$`,
        kind === 0 ? 'Ce n’est pas nul : les droites sont sécantes.' : kind === 1 ? `C'est nul, mais $d_2$ n'est pas $d_1$ multipliée par $${k}$ : strictement parallèles.` : `$d_2$ est $d_1$ multipliée par $${k}$ : les droites sont confondues.`,
      ],
    };
  }),
];

const intersectionVariantes = [
  variant('axe-abscisses', (rng, level) => {
    const m = level === 1 ? rng.pick([1, -1, 2, -2]) : rng.nonZero(-5, 5);
    const x = level === 3 ? frac(rng.nonZero(-9, 9), Math.abs(m)) : frac(rng.int(-6, 6));
    const p = frac(-m * x.n, x.d);
    return {
      prompt: `En quel point la droite $${reduite(frac(m), p)}$ coupe-t-elle l'axe des abscisses ?`,
      answer: { kind: 'pair', values: [x, frac(0)], labels: ['x', 'y'] },
      hint: 'Sur l’axe des abscisses, $y = 0$.',
      correction: [`$${terms([[m, 'x']])} ${p.n < 0 ? '-' : '+'} ${fracLatex(frac(Math.abs(p.n), p.d))} = 0$ donne $x = ${fracLatex(x)}$.`, `Le point est $(${fracLatex(x)}\\,;\\,0)$.`],
    };
  }),
  variant('verifier-point', (rng) => {
    const x = rng.int(-6, 6);
    const y = rng.int(-9, 9);
    const m1 = rng.nonZero(-4, 4);
    let m2 = m1;
    while (m2 === m1) m2 = rng.int(-4, 4);
    const juste = rng.next() < 0.5;
    const shown: [number, number] = juste ? [x, y] : [x, y + rng.nonZero(-3, 3)];
    return {
      prompt: `Le point $I(${shown[0]}\\,;\\,${shown[1]})$ est-il le point d'intersection des droites $d_1 : ${eq(m1, y - m1 * x)}$ et $d_2 : ${eq(m2, y - m2 * x)}$ ?`,
      answer: fixedChoice(['Oui', 'Non'], juste ? 0 : 1),
      hint: 'Il suffit de vérifier que $I$ est sur les deux droites.',
      correction: [`En $x = ${shown[0]}$ : $d_1$ donne $y = ${y}$ et $d_2$ donne $y = ${y}$.`, juste ? '$I$ est sur les deux droites : c’est le point d’intersection.' : `$I$ n'a pas la bonne ordonnée : ce n'est pas le point d'intersection.`],
    };
  }),
];

const systemeVariantes = [
  variant('achats', (rng, level) => {
    const x = rng.int(2, level === 1 ? 6 : 15);
    const y = rng.int(1, level === 1 ? 5 : 12);
    let a: number, b: number, c: number, d: number;
    do {
      a = rng.int(1, 5);
      b = rng.int(1, 5);
      c = rng.int(1, 5);
      d = rng.int(1, 5);
    } while (a * d - b * c === 0);
    return {
      prompt: `Au marché, $${a}$ kg de pommes et $${b}$ kg de poires coûtent $${a * x + b * y}$ € ; $${c}$ kg de pommes et $${d}$ kg de poires coûtent $${c * x + d * y}$ €. Quels sont les prix $x$ d'un kilo de pommes et $y$ d'un kilo de poires, en euros ?`,
      answer: { kind: 'pair', values: [frac(x), frac(y)], labels: ['x', 'y'] },
      hint: 'Écris un système de deux équations, puis résous-le.',
      correction: [`$${systemeLatex(a, b, a * x + b * y, c, d, c * x + d * y)}$`, `On trouve $x = ${x}$ € et $y = ${y}$ €.`],
    };
  }),
  variant('tetes-pattes', (rng, level) => {
    const poules = rng.int(2, level === 1 ? 10 : 40);
    const lapins = rng.int(2, level === 1 ? 10 : 40);
    return {
      prompt: `Dans une ferme, on compte $${poules + lapins}$ têtes et $${2 * poules + 4 * lapins}$ pattes, uniquement des poules et des lapins. Combien y a-t-il de poules $x$ et de lapins $y$ ?`,
      answer: { kind: 'pair', values: [frac(poules), frac(lapins)], labels: ['x', 'y'] },
      hint: 'Une équation pour les têtes, une pour les pattes.',
      correction: [`$${systemeLatex(1, 1, poules + lapins, 2, 4, 2 * poules + 4 * lapins)}$`, `En soustrayant deux fois la première : $2y = ${2 * lapins}$, donc $y = ${lapins}$ et $x = ${poules}$.`],
    };
  }),
];

const nbSolutionsVariantes = [
  variant('parametre', (rng) => {
    const a = rng.pick([1, 2, 3, -1, -2]);
    const b = rng.nonZero(-6, 6);
    const c = a * rng.nonZero(-4, 4);
    // a k - b c = 0 ⇔ k = b c / a, entier car a divise c.
    const k = (b * c) / a;
    const system = `\\begin{cases} ${terms([[a, 'x'], [b, 'y']])} = ${rng.int(-9, 9)} \\\\ ${terms([[c, 'x']])} + ky = ${rng.int(-9, 9)} \\end{cases}`;
    return {
      prompt: `Pour quelle valeur de $k$ le système $${system}$ n'a-t-il pas une unique solution ?`,
      answer: { kind: 'number', value: frac(k) },
      hint: 'Il n’y a pas une unique solution quand $ab\' - a\'b = 0$.',
      correction: [`$${par(a)} \\times k - ${par(b)} \\times ${par(c)} = 0$`, `$k = \\frac{${b * c}}{${a}} = ${k}$`],
    };
  }),
  variant('couple-solution', (rng, level) => {
    const x = rng.int(-6, 6);
    const y = rng.int(-6, 6);
    let a: number, b: number, c: number, d: number;
    do {
      a = rng.nonZero(-5, 5);
      b = rng.nonZero(-5, 5);
      c = rng.nonZero(-5, 5);
      d = rng.nonZero(-5, 5);
    } while (a * d - b * c === 0);
    const juste = rng.next() < 0.5;
    // Le piège : un couple qui vérifie seulement la première équation.
    const shown: [number, number] = juste ? [x, y] : level === 1 ? [y, x] : [x + b, y - a];
    const ok = a * shown[0] + b * shown[1] === a * x + b * y && c * shown[0] + d * shown[1] === c * x + d * y;
    return {
      prompt: `Le couple $(${shown[0]}\\,;\\,${shown[1]})$ est-il solution du système $${systemeLatex(a, b, a * x + b * y, c, d, c * x + d * y)}$ ?`,
      answer: fixedChoice(['Oui', 'Non'], ok ? 0 : 1),
      hint: 'Un couple est solution s’il vérifie les deux équations à la fois.',
      correction: [
        `Première équation : $${a} \\times ${par(shown[0])} + ${par(b)} \\times ${par(shown[1])} = ${a * shown[0] + b * shown[1]}$ (il faut $${a * x + b * y}$).`,
        `Seconde équation : $${c} \\times ${par(shown[0])} + ${par(d)} \\times ${par(shown[1])} = ${c * shown[0] + d * shown[1]}$ (il faut $${c * x + d * y}$).`,
        ok ? 'Les deux sont vérifiées : c’est une solution.' : 'Les deux ne sont pas vérifiées : ce n’est pas une solution.',
      ],
    };
  }),
];

const paralleleVariantes = [
  variant('cartesienne', (rng) => {
    const a = rng.nonZero(-5, 5);
    const b = rng.nonZero(-5, 5);
    const c = rng.int(-9, 9);
    const A: [number, number] = [rng.int(-6, 6), rng.int(-6, 6)];
    const c2 = -(a * A[0] + b * A[1]);
    return {
      prompt: `La droite $d'$ est parallèle à $d : ${terms([[a, 'x'], [b, 'y'], [c, '']])} = 0$ et passe par $A(${A[0]}\\,;\\,${A[1]})$. Elle a une équation de la forme $${terms([[a, 'x'], [b, 'y']])} + c' = 0$. Que vaut $c'$ ?`,
      answer: { kind: 'number', value: frac(c2) },
      hint: 'Remplace $x$ et $y$ par les coordonnées de $A$.',
      correction: [`$${a} \\times ${par(A[0])} + ${par(b)} \\times ${par(A[1])} + c' = 0$`, `$c' = ${c2}$`],
    };
  }),
  variant('quatre-points', (rng) => {
    const A: [number, number] = [rng.int(-6, 6), rng.int(-6, 6)];
    const u: [number, number] = [rng.nonZero(-4, 4), rng.int(-4, 4)];
    const k = rng.pick([2, -1, 3, -2]);
    const C: [number, number] = [A[0] + rng.int(1, 5), A[1] + rng.nonZero(-5, 5)];
    const par_ = rng.next() < 0.5;
    const B: [number, number] = [A[0] + u[0], A[1] + u[1]];
    const D: [number, number] = par_ ? [C[0] + k * u[0], C[1] + k * u[1]] : [C[0] + k * u[0], C[1] + k * u[1] + rng.nonZero(-2, 2)];
    const ok = (B[0] - A[0]) * (D[1] - C[1]) === (B[1] - A[1]) * (D[0] - C[0]);
    const pt = (n: string, p: [number, number]) => `${n}(${p[0]}\\,;\\,${p[1]})`;
    return {
      prompt: `Les droites $(AB)$ et $(CD)$ sont-elles parallèles, avec $${pt('A', A)}$, $${pt('B', B)}$, $${pt('C', C)}$ et $${pt('D', D)}$ ?`,
      answer: fixedChoice(['Oui', 'Non'], ok ? 0 : 1),
      hint: 'Teste la colinéarité de $\\overrightarrow{AB}$ et $\\overrightarrow{CD}$.',
      correction: [`$\\overrightarrow{AB}(${B[0] - A[0]}\\,;\\,${B[1] - A[1]})$ et $\\overrightarrow{CD}(${D[0] - C[0]}\\,;\\,${D[1] - C[1]})$.`, `$${par(B[0] - A[0])} \\times ${par(D[1] - C[1])} - ${par(B[1] - A[1])} \\times ${par(D[0] - C[0])} = ${(B[0] - A[0]) * (D[1] - C[1]) - (B[1] - A[1]) * (D[0] - C[0])}$`, ok ? 'Les vecteurs sont colinéaires : les droites sont parallèles.' : 'Ils ne sont pas colinéaires : les droites sont sécantes.'],
    };
  }),
];

export const POSITIONS_SKILLS: Skill[] = [
  enrich(position, positionVariantes),
  enrich(intersection, intersectionVariantes),
  enrich(systeme, systemeVariantes),
  enrich(nbSolutions, nbSolutionsVariantes),
  enrich(parallele, paralleleVariantes),
];
