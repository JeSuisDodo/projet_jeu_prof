import { frac, fracLatex } from '../fraction';
import type { Rng } from '../rng';
import type { Level, Skill } from '../types';
import { variante, varier } from '../varier';
import { dec, fixedChoice, fracOf, par } from './outils';

/** Chapitre 4 de 2nde : géométrie dans le plan (repère, Pythagore, trigonométrie). */

/** Triplets pythagoriciens primitifs (a² + b² = c²). */
const TRIPLES: [number, number, number][] = [
  [3, 4, 5],
  [5, 12, 13],
  [8, 15, 17],
  [7, 24, 25],
  [20, 21, 29],
];

function triple(rng: Rng, level: Level): [number, number, number] {
  const [a, b, c] = rng.pick(level === 1 ? TRIPLES.slice(0, 1) : level === 2 ? TRIPLES.slice(0, 3) : TRIPLES);
  const k = level === 1 ? rng.int(1, 3) : rng.int(1, 2);
  return rng.next() < 0.5 ? [a * k, b * k, c * k] : [b * k, a * k, c * k];
}

const point = (rng: Rng, bound: number): [number, number] => [rng.int(-bound, bound), rng.int(-bound, bound)];
const P = (name: string, [x, y]: [number, number]) => `${name}(${dec(x)}\\,;\\,${dec(y)})`;

const milieu: Skill = {
  id: '2nde-milieu',
  name: 'Calculer les coordonnées d’un milieu',
  generate(rng, level) {
    const bound = level === 1 ? 6 : 10;
    const A = point(rng, bound);
    let B = point(rng, bound);
    // En niveau 1, le milieu a des coordonnées entières.
    if (level === 1) B = [B[0] + ((B[0] + A[0]) % 2 === 0 ? 0 : 1), B[1] + ((B[1] + A[1]) % 2 === 0 ? 0 : 1)];
    const mx = (A[0] + B[0]) / 2;
    const my = (A[1] + B[1]) / 2;
    return {
      skill: '2nde-milieu',
      level,
      prompt: `Dans un repère, on donne $${P('A', A)}$ et $${P('B', B)}$. Quelles sont les coordonnées du milieu $M$ de $[AB]$ ?`,
      answer: { kind: 'pair', values: [fracOf(mx), fracOf(my)], labels: ['x_M', 'y_M'] },
      hint: 'Le milieu a pour coordonnées les moyennes des coordonnées : $x_M = \\frac{x_A + x_B}{2}$.',
      correction: [
        `$x_M = \\frac{${A[0]} + ${par(B[0])}}{2} = ${dec(mx)}$`,
        `$y_M = \\frac{${A[1]} + ${par(B[1])}}{2} = ${dec(my)}$`,
      ],
    };
  },
};

const symetrique: Skill = {
  id: '2nde-symetrique',
  name: 'Retrouver une extrémité à partir du milieu',
  generate(rng, level) {
    const A = point(rng, level === 1 ? 5 : 9);
    const M = point(rng, level === 1 ? 5 : 9);
    const B: [number, number] = [2 * M[0] - A[0], 2 * M[1] - A[1]];
    return {
      skill: '2nde-symetrique',
      level,
      prompt: `$M$ est le milieu de $[AB]$, avec $${P('A', A)}$ et $${P('M', M)}$. Quelles sont les coordonnées de $B$ ?`,
      answer: { kind: 'pair', values: [frac(B[0]), frac(B[1])], labels: ['x_B', 'y_B'] },
      hint: '$x_M = \\frac{x_A + x_B}{2}$ donne $x_B = 2x_M - x_A$.',
      correction: [`$x_B = 2 \\times ${par(M[0])} - ${par(A[0])} = ${B[0]}$`, `$y_B = 2 \\times ${par(M[1])} - ${par(A[1])} = ${B[1]}$`],
    };
  },
};

const longueur: Skill = {
  id: '2nde-longueur',
  name: 'Calculer une distance dans un repère',
  generate(rng, level) {
    const [dx, dy, d] = triple(rng, level);
    const A = point(rng, 6);
    const sx = rng.sign();
    const sy = rng.sign();
    const B: [number, number] = [A[0] + sx * dx, A[1] + sy * dy];
    return {
      skill: '2nde-longueur',
      level,
      prompt: `Dans un repère orthonormé, on donne $${P('A', A)}$ et $${P('B', B)}$. Calcule la distance $AB$.`,
      answer: { kind: 'number', value: frac(d) },
      hint: '$AB = \\sqrt{(x_B - x_A)^2 + (y_B - y_A)^2}$',
      correction: [
        `$AB = \\sqrt{(${B[0]} - ${par(A[0])})^2 + (${B[1]} - ${par(A[1])})^2} = \\sqrt{${par(sx * dx)}^2 + ${par(sy * dy)}^2}$`,
        `$AB = \\sqrt{${dx * dx} + ${dy * dy}} = \\sqrt{${d * d}} = ${d}$`,
      ],
    };
  },
};

const pythagore: Skill = {
  id: '2nde-pythagore',
  name: 'Appliquer le théorème de Pythagore',
  generate(rng, level) {
    const [a, b, c] = triple(rng, level);
    const findHyp = level === 1 || rng.next() < 0.5;
    const prompt = findHyp
      ? `Le triangle $ABC$ est rectangle en $A$, avec $AB = ${a}$ et $AC = ${b}$. Calcule $BC$.`
      : `Le triangle $ABC$ est rectangle en $A$, avec $BC = ${c}$ et $AB = ${a}$. Calcule $AC$.`;
    return {
      skill: '2nde-pythagore',
      level,
      prompt,
      answer: { kind: 'number', value: frac(findHyp ? c : b) },
      hint: 'Dans un triangle rectangle, le carré de l’hypoténuse est égal à la somme des carrés des deux autres côtés.',
      correction: findHyp
        ? [`$BC^2 = AB^2 + AC^2 = ${a * a} + ${b * b} = ${c * c}$`, `$BC = \\sqrt{${c * c}} = ${c}$`]
        : [`$AC^2 = BC^2 - AB^2 = ${c * c} - ${a * a} = ${b * b}$`, `$AC = \\sqrt{${b * b}} = ${b}$`],
    };
  },
};

const reciproque: Skill = {
  id: '2nde-reciproque',
  name: 'Reconnaître un triangle rectangle',
  generate(rng, level) {
    let [a, b, c] = triple(rng, level);
    const right = rng.next() < 0.5;
    if (!right) c += 1;
    const sides = rng.shuffle([a, b, c]);
    const big = Math.max(...sides);
    const [s1, s2] = sides.filter((s) => s !== big);
    const sum = s1 * s1 + s2 * s2;
    return {
      skill: '2nde-reciproque',
      level,
      prompt: `Un triangle a des côtés de longueurs $${sides.join('$, $')}$. Est-il rectangle ?`,
      answer: fixedChoice(['Oui', 'Non'], right ? 0 : 1),
      hint: 'Compare le carré du plus grand côté à la somme des carrés des deux autres.',
      correction: [
        `Le plus grand côté mesure $${big}$ : $${big}^2 = ${big * big}$.`,
        `$${s1}^2 + ${s2}^2 = ${s1 * s1} + ${s2 * s2} = ${sum}$.`,
        right ? "Les deux résultats sont égaux : d'après la réciproque du théorème de Pythagore, le triangle est rectangle." : "Les deux résultats sont différents : le triangle n'est pas rectangle.",
      ],
    };
  },
};

const trigo: Skill = {
  id: '2nde-trigo',
  name: 'Utiliser cosinus, sinus et tangente',
  generate(rng, level) {
    const [a, b, c] = triple(rng, level);
    // Triangle ABC rectangle en A : AB = a (côté adjacent à B), AC = b (opposé à B), BC = c.
    const fns = level === 1 ? (['\\cos'] as const) : level === 2 ? (['\\cos', '\\sin'] as const) : (['\\cos', '\\sin', '\\tan'] as const);
    const fn = rng.pick(fns);
    const ratio = fn === '\\cos' ? [a, c, 'AB', 'BC', 'adjacent', 'hypoténuse'] : fn === '\\sin' ? [b, c, 'AC', 'BC', 'opposé', 'hypoténuse'] : [b, a, 'AC', 'AB', 'opposé', 'adjacent'];
    const [n, d, nName, dName, nWord, dWord] = ratio as [number, number, string, string, string, string];
    const value = frac(n, d);
    return {
      skill: '2nde-trigo',
      level,
      prompt: `Le triangle $ABC$ est rectangle en $A$, avec $AB = ${a}$, $AC = ${b}$ et $BC = ${c}$. Calcule $${fn}(\\widehat{ABC})$ sous forme de fraction irréductible.`,
      answer: { kind: 'number', value },
      hint: 'CAH SOH TOA : cosinus = adjacent ÷ hypoténuse, sinus = opposé ÷ hypoténuse, tangente = opposé ÷ adjacent.',
      correction: [
        `Pour l'angle $\\widehat{ABC}$, le côté ${nWord} est $[${nName}]$ et ${dWord === 'hypoténuse' ? "l'hypoténuse" : 'le côté adjacent'} est $[${dName}]$.`,
        `$${fn}(\\widehat{ABC}) = \\frac{${nName}}{${dName}} = \\frac{${n}}{${d}} = ${fracLatex(value)}$`,
      ],
    };
  },
};

/* ---------- Variantes : d'autres façons de poser les mêmes notions ---------- */

type Pt = [number, number];
const d2 = (A: Pt, B: Pt) => (B[0] - A[0]) ** 2 + (B[1] - A[1]) ** 2;

const milieuVariantes = [
  variante('est-milieu', (rng, level) => {
    const A = point(rng, 8);
    const half: Pt = [rng.int(-5, 5), rng.int(-5, 5)];
    const B: Pt = [A[0] + 2 * half[0], A[1] + 2 * half[1]];
    const juste = rng.next() < 0.5;
    const M: Pt = [A[0] + half[0], A[1] + half[1]];
    if (!juste) M[rng.int(0, 1)] += rng.nonZero(-2, 2) * (level === 1 ? 1 : 0.5) * 2;
    return {
      prompt: `On donne $${P('A', A)}$, $${P('B', B)}$ et $${P('M', M)}$. Le point $M$ est-il le milieu de $[AB]$ ?`,
      answer: fixedChoice(['Oui', 'Non'], juste ? 0 : 1),
      hint: 'Calcule les coordonnées du milieu de $[AB]$ et compare.',
      correction: [`Le milieu de $[AB]$ a pour coordonnées $(${dec(A[0] + half[0])}\\,;\\,${dec(A[1] + half[1])})$.`, juste ? 'C’est bien $M$.' : 'Ce n’est pas $M$.'],
    };
  }),
  variante('centre-parallelogramme', (rng, level) => {
    const A = point(rng, level === 1 ? 6 : 9);
    let C = point(rng, level === 1 ? 6 : 9);
    if (level === 1) C = [C[0] + ((C[0] + A[0]) % 2 === 0 ? 0 : 1), C[1] + ((C[1] + A[1]) % 2 === 0 ? 0 : 1)];
    return {
      prompt: `$ABCD$ est un parallélogramme, avec $${P('A', A)}$ et $${P('C', C)}$. Quelles sont les coordonnées de son centre $O$ ?`,
      answer: { kind: 'pair', values: [fracOf((A[0] + C[0]) / 2), fracOf((A[1] + C[1]) / 2)], labels: ['x_O', 'y_O'] },
      hint: 'Les diagonales d’un parallélogramme se coupent en leur milieu.',
      correction: [`$O$ est le milieu de la diagonale $[AC]$.`, `$O(${dec((A[0] + C[0]) / 2)}\\,;\\,${dec((A[1] + C[1]) / 2)})$`],
    };
  }),
];

const symetriqueVariantes = [
  variante('symetrique-point', (rng, level) => {
    const A = point(rng, level === 1 ? 5 : 9);
    const C = point(rng, level === 1 ? 5 : 9);
    const S: Pt = [2 * C[0] - A[0], 2 * C[1] - A[1]];
    return {
      prompt: `Quelles sont les coordonnées du symétrique $A'$ de $${P('A', A)}$ par rapport au point $${P('C', C)}$ ?`,
      answer: { kind: 'pair', values: [frac(S[0]), frac(S[1])], labels: ["x_{A'}", "y_{A'}"] },
      hint: '$C$ est le milieu de $[AA\']$.',
      correction: [`$x_{A'} = 2 \\times ${par(C[0])} - ${par(A[0])} = ${S[0]}$`, `$y_{A'} = 2 \\times ${par(C[1])} - ${par(A[1])} = ${S[1]}$`],
    };
  }),
  variante('quatrieme-sommet', (rng) => {
    const A = point(rng, 7);
    const B = point(rng, 7);
    let C = point(rng, 7);
    if ((B[0] - A[0]) * (C[1] - A[1]) === (B[1] - A[1]) * (C[0] - A[0])) C = [C[0] + 1, C[1] + 3];
    const D: Pt = [A[0] + C[0] - B[0], A[1] + C[1] - B[1]];
    return {
      prompt: `$ABCD$ est un parallélogramme, avec $${P('A', A)}$, $${P('B', B)}$ et $${P('C', C)}$. Quelles sont les coordonnées de $D$ ?`,
      answer: { kind: 'pair', values: [frac(D[0]), frac(D[1])], labels: ['x_D', 'y_D'] },
      hint: 'Les diagonales $[AC]$ et $[BD]$ ont le même milieu.',
      correction: [`Le milieu de $[AC]$ est aussi celui de $[BD]$ : $x_D = x_A + x_C - x_B$ et $y_D = y_A + y_C - y_B$.`, `$D(${D[0]}\\,;\\,${D[1]})$`],
    };
  }),
];

const longueurVariantes = [
  variante('carre-distance', (rng, level) => {
    const A = point(rng, level === 1 ? 5 : 9);
    let B = point(rng, level === 1 ? 5 : 9);
    if (B[0] === A[0] && B[1] === A[1]) B = [A[0] + 1, A[1] + 2];
    return {
      prompt: `On donne $${P('A', A)}$ et $${P('B', B)}$ dans un repère orthonormé. Calcule $AB^2$.`,
      answer: { kind: 'number', value: frac(d2(A, B)) },
      hint: '$AB^2 = (x_B - x_A)^2 + (y_B - y_A)^2$',
      correction: [`$AB^2 = ${par(B[0] - A[0])}^2 + ${par(B[1] - A[1])}^2 = ${d2(A, B)}$`],
    };
  }),
  variante('isocele', (rng) => {
    const A = point(rng, 4);
    // B et C à la même distance de A (ou presque) : (u ; v) et (v ; -u), ou un léger décalage.
    const u = rng.nonZero(-5, 5);
    const v = rng.nonZero(-5, 5);
    const B: Pt = [A[0] + u, A[1] + v];
    const iso = rng.next() < 0.5;
    const C: Pt = iso ? [A[0] + rng.sign() * v, A[1] - rng.sign() * u] : [A[0] + v + 1, A[1] - u];
    // Ni confondu avec B, ni aligné avec A et B : on prend alors la rotation d'un quart de tour.
    if (u * (C[1] - A[1]) === v * (C[0] - A[0])) [C[0], C[1]] = [A[0] + v, A[1] - u];
    const ok = d2(A, B) === d2(A, C);
    return {
      prompt: `On donne $${P('A', A)}$, $${P('B', B)}$ et $${P('C', C)}$ dans un repère orthonormé. Le triangle $ABC$ est-il isocèle en $A$ ?`,
      answer: fixedChoice(['Oui', 'Non'], ok ? 0 : 1),
      hint: 'Compare $AB^2$ et $AC^2$ (pas besoin des racines).',
      correction: [`$AB^2 = ${d2(A, B)}$ et $AC^2 = ${d2(A, C)}$.`, ok ? 'Les deux longueurs sont égales : le triangle est isocèle en $A$.' : 'Les longueurs sont différentes : il n’est pas isocèle en $A$.'],
    };
  }),
  variante('cercle', (rng, level) => {
    const [dx, dy, r] = triple(rng, level);
    const C = point(rng, 5);
    const on = rng.next() < 0.5;
    const M: Pt = [C[0] + rng.sign() * dx, C[1] + rng.sign() * dy + (on ? 0 : rng.pick([-1, 1]))];
    const ok = d2(C, M) === r * r;
    return {
      prompt: `Le point $${P('M', M)}$ est-il sur le cercle de centre $${P('C', C)}$ et de rayon $${r}$ ?`,
      answer: fixedChoice(['Oui', 'Non'], ok ? 0 : 1),
      hint: '$M$ est sur le cercle si et seulement si $CM = r$, c’est-à-dire $CM^2 = r^2$.',
      correction: [`$CM^2 = ${d2(C, M)}$ et $r^2 = ${r * r}$.`, ok ? '$M$ est sur le cercle.' : '$M$ n’est pas sur le cercle.'],
    };
  }),
];

const pythagoreVariantes = [
  variante('echelle', (rng, level) => {
    const [a, b, c] = triple(rng, level);
    const [pied, haut] = a < b ? [a, b] : [b, a];
    const k = c > 10 ? 10 : 1;
    return {
      prompt: `Une échelle de $${dec(c / k)}$ m est appuyée contre un mur vertical. Son pied est à $${dec(pied / k)}$ m du mur. À quelle hauteur arrive le haut de l'échelle, en m ?`,
      answer: { kind: 'number', value: fracOf(haut / k) },
      hint: 'Le mur, le sol et l’échelle forment un triangle rectangle : l’échelle est l’hypoténuse.',
      correction: [`$h^2 = ${dec(c / k)}^2 - ${dec(pied / k)}^2 = ${dec((c * c - pied * pied) / (k * k))}$`, `$h = ${dec(haut / k)}$ m`],
    };
  }),
  variante('diagonale', (rng, level) => {
    const [a, b, c] = triple(rng, level);
    return {
      prompt: `Un terrain rectangulaire mesure $${a}$ m sur $${b}$ m. Quelle est la longueur de sa diagonale, en m ?`,
      answer: { kind: 'number', value: frac(c) },
      hint: 'La diagonale coupe le rectangle en deux triangles rectangles.',
      correction: [`$d^2 = ${a}^2 + ${b}^2 = ${a * a + b * b}$`, `$d = ${c}$ m`],
    };
  }),
];

const reciproqueVariantes = [
  variante('repere', (rng) => {
    const A = point(rng, 4);
    const u = rng.nonZero(-4, 4);
    const v = rng.nonZero(-4, 4);
    const k = rng.pick([1, 2, -1]);
    const right = rng.next() < 0.5;
    const B: Pt = [A[0] + u, A[1] + v];
    const C: Pt = right ? [A[0] - k * v, A[1] + k * u] : [A[0] - k * v + 1, A[1] + k * u];
    const s = d2(A, B) + d2(A, C);
    const ok = s === d2(B, C);
    return {
      prompt: `On donne $${P('A', A)}$, $${P('B', B)}$ et $${P('C', C)}$ dans un repère orthonormé. Le triangle $ABC$ est-il rectangle en $A$ ?`,
      answer: fixedChoice(['Oui', 'Non'], ok ? 0 : 1),
      hint: 'Calcule $AB^2$, $AC^2$ et $BC^2$, puis utilise la réciproque du théorème de Pythagore.',
      correction: [`$AB^2 + AC^2 = ${d2(A, B)} + ${d2(A, C)} = ${s}$ et $BC^2 = ${d2(B, C)}$.`, ok ? 'Il y a égalité : le triangle est rectangle en $A$.' : 'Pas d’égalité : le triangle n’est pas rectangle en $A$.'],
    };
  }),
  variante('troisieme-cote', (rng, level) => {
    const [a, b, c] = triple(rng, level);
    return {
      prompt: `Deux côtés d'un triangle mesurent $${a}$ cm et $${b}$ cm. Combien doit mesurer le plus grand côté pour que le triangle soit rectangle ?`,
      answer: { kind: 'number', value: frac(c) },
      hint: 'Le plus grand côté est l’hypoténuse : son carré est la somme des deux autres carrés.',
      correction: [`$${a}^2 + ${b}^2 = ${a * a + b * b} = ${c}^2$`, `Il doit mesurer $${c}$ cm.`],
    };
  }),
];

const trigoVariantes = [
  variante('longueur', (rng, level) => {
    const [a, b, c] = triple(rng, level);
    const useSin = level > 1 && rng.next() < 0.5;
    const ratio = useSin ? frac(b, c) : frac(a, c);
    return {
      prompt: `Le triangle $ABC$ est rectangle en $A$, avec $BC = ${c}$ et $${useSin ? '\\sin' : '\\cos'}(\\widehat{ABC}) = ${fracLatex(ratio)}$. Calcule $${useSin ? 'AC' : 'AB'}$.`,
      answer: { kind: 'number', value: frac(useSin ? b : a) },
      hint: useSin ? '$\\sin(\\widehat{ABC}) = \\frac{AC}{BC}$' : '$\\cos(\\widehat{ABC}) = \\frac{AB}{BC}$',
      correction: [`$${useSin ? 'AC' : 'AB'} = BC \\times ${useSin ? '\\sin' : '\\cos'}(\\widehat{ABC}) = ${c} \\times ${fracLatex(ratio)} = ${useSin ? b : a}$`],
    };
  }),
  variante('hauteur-arbre', (rng, level) => {
    const d = rng.pick([5, 8, 10, 12, 15, 20]);
    const t = rng.pick(level === 1 ? [0.5, 1, 1.5, 2] : [0.4, 0.6, 0.75, 1.2, 1.25, 1.6]);
    const h = d * t;
    return {
      prompt: `Pour mesurer un arbre, Zoé se place à $${d}$ m de son pied, sur un sol horizontal. Elle vise le sommet : la tangente de l'angle de visée (depuis le sol) vaut $${dec(t)}$. Quelle est la hauteur de l'arbre, en m ?`,
      answer: { kind: 'number', value: fracOf(h) },
      hint: 'tangente = côté opposé ÷ côté adjacent.',
      correction: [`$\\tan(\\alpha) = \\frac{h}{${d}}$, donc $h = ${d} \\times ${dec(t)} = ${dec(h)}$ m.`],
    };
  }),
];

export const GEOMETRIE_PLAN_SKILLS: Skill[] = [
  varier(milieu, milieuVariantes),
  varier(symetrique, symetriqueVariantes),
  varier(longueur, longueurVariantes),
  varier(pythagore, pythagoreVariantes),
  varier(reciproque, reciproqueVariantes),
  varier(trigo, trigoVariantes),
];
