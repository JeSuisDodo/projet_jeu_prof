import { frac, fracLatex } from '../fraction';
import type { Rng } from '../rng';
import type { Level, Skill } from '../types';
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

export const GEOMETRIE_PLAN_SKILLS: Skill[] = [milieu, symetrique, longueur, pythagore, reciproque, trigo];
