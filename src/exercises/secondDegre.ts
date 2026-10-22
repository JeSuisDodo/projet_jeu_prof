import { frac, fracLatex, type Frac } from './fraction';
import { canonicalLatex, factoredLatex, paren, polyLatex } from './latex';
import type { Rng } from './rng';
import { type Exercise, type Level, type Skill, makeChoice } from './types';

/** Modèles d'exercices du chapitre « Second degré » (1re spécialité). */

interface Trinomial {
  a: number;
  b: number;
  c: number;
}

function leadingCoef(rng: Rng, level: Level): number {
  if (level === 1) return 1;
  if (level === 2) return rng.pick([-2, -1, 1, 2, 3]);
  return rng.pick([-4, -3, -2, -1, 2, 3, 4]);
}

const rootBound = (level: Level) => (level === 1 ? 5 : level === 2 ? 6 : 8);

const fromRoots = (a: number, r1: number, r2: number): Trinomial => ({ a, b: -a * (r1 + r2), c: a * r1 * r2 });

const fromVertex = (a: number, alpha: number, beta: number): Trinomial => ({
  a,
  b: -2 * a * alpha,
  c: a * alpha * alpha + beta,
});

function distinctRoots(rng: Rng, level: Level): [number, number] {
  const bound = rootBound(level);
  const r1 = rng.int(-bound, bound);
  let r2 = r1;
  while (r2 === r1) r2 = rng.int(-bound, bound);
  return r1 < r2 ? [r1, r2] : [r2, r1];
}

const define = (t: Trinomial) => `Soit $f(x) = ${polyLatex(t.a, t.b, t.c)}$.`;
const discriminant = (t: Trinomial) => t.b * t.b - 4 * t.a * t.c;

function deltaLine(t: Trinomial): string {
  const ac4 = 4 * t.a * t.c;
  return `$\\Delta = b^2 - 4ac = ${paren(t.b)}^2 - 4\\times ${paren(t.a)}\\times ${paren(t.c)} = ${t.b * t.b} ${ac4 > 0 ? '-' : '+'} ${Math.abs(ac4)} = ${discriminant(t)}$`;
}

function vertexLines(t: Trinomial, alpha: number, beta: number): string[] {
  return [
    `$\\alpha = -\\frac{b}{2a} = -\\frac{${t.b}}{${2 * t.a}} = ${alpha}$`,
    `$\\beta = f(\\alpha) = f(${alpha}) = ${beta}$`,
  ];
}

/** Lignes de correction donnant les racines à partir du discriminant. */
function rootLines(t: Trinomial): string[] {
  const delta = discriminant(t);
  const lines = [deltaLine(t)];
  if (delta < 0) {
    lines.push("$\\Delta < 0$ : l'équation n'a pas de solution réelle, $S = \\varnothing$.");
    return lines;
  }
  if (delta === 0) {
    lines.push(`$\\Delta = 0$ : une seule solution $x_0 = -\\frac{b}{2a} = ${fracLatex(frac(-t.b, 2 * t.a))}$.`);
    return lines;
  }
  const sq = Math.round(Math.sqrt(delta));
  const x1 = frac(-t.b - sq, 2 * t.a);
  const x2 = frac(-t.b + sq, 2 * t.a);
  lines.push(
    `$\\Delta > 0$ et $\\sqrt{\\Delta} = ${sq}$, donc deux solutions :`,
    `$x_1 = \\frac{-b - \\sqrt{\\Delta}}{2a} = \\frac{${-t.b} - ${sq}}{${2 * t.a}} = ${fracLatex(x1)}$`,
    `$x_2 = \\frac{-b + \\sqrt{\\Delta}}{2a} = \\frac{${-t.b} + ${sq}}{${2 * t.a}} = ${fracLatex(x2)}$`,
  );
  return lines;
}

const image: Skill = {
  id: 'image',
  name: "Calculer l'image d'un nombre",
  generate(rng, level) {
    const t = { a: leadingCoef(rng, level), b: rng.int(-6, 6), c: rng.int(-9, 9) };
    const k = level === 1 ? rng.int(0, 3) : rng.nonZero(-4, 4);
    const value = t.a * k * k + t.b * k + t.c;
    const sub = `${t.a}\\times ${paren(k)}^2 ${t.b < 0 ? '-' : '+'} ${Math.abs(t.b)}\\times ${paren(k)} ${t.c < 0 ? '-' : '+'} ${Math.abs(t.c)}`;
    return {
      skill: 'image',
      level,
      prompt: `${define(t)} Calcule $f(${k})$.`,
      answer: { kind: 'number', value: frac(value) },
      hint: `Remplace chaque $x$ par $${paren(k)}$, en calculant le carré en premier.`,
      correction: [`$f(${k}) = ${sub}$`, `$f(${k}) = ${t.a * k * k} ${t.b * k < 0 ? '-' : '+'} ${Math.abs(t.b * k)} ${t.c < 0 ? '-' : '+'} ${Math.abs(t.c)} = ${value}$`],
    };
  },
};

const discriminantSkill: Skill = {
  id: 'discriminant',
  name: 'Calculer le discriminant',
  generate(rng, level) {
    const bound = level === 3 ? 9 : 7;
    const t = { a: leadingCoef(rng, level), b: rng.int(-bound, bound), c: rng.nonZero(-bound, bound) };
    return {
      skill: 'discriminant',
      level,
      prompt: `${define(t)} Calcule son discriminant $\\Delta$.`,
      answer: { kind: 'number', value: frac(discriminant(t)) },
      hint: 'Repère $a$, $b$ et $c$, puis applique $\\Delta = b^2 - 4ac$.',
      correction: [`On a $a = ${t.a}$, $b = ${t.b}$ et $c = ${t.c}$.`, deltaLine(t)],
    };
  },
};

const nbSolutions: Skill = {
  id: 'nb-solutions',
  name: 'Compter les solutions',
  generate(rng, level) {
    const count = rng.pick([0, 1, 2] as const);
    const a = leadingCoef(rng, level);
    const bound = rootBound(level);
    let t: Trinomial;
    if (count === 2) t = fromRoots(a, ...distinctRoots(rng, level));
    else if (count === 1) {
      const r = rng.int(-bound, bound);
      t = fromRoots(a, r, r);
    } else t = fromVertex(a, rng.int(-bound, bound), Math.sign(a) * rng.int(1, 6));
    const verdict = ["$\\Delta < 0$ : aucune solution réelle.", '$\\Delta = 0$ : une seule solution.', '$\\Delta > 0$ : deux solutions distinctes.'];
    return {
      skill: 'nb-solutions',
      level,
      prompt: `Combien de solutions réelles l'équation $${polyLatex(t.a, t.b, t.c)} = 0$ a-t-elle ?`,
      answer: { kind: 'choice', options: ['Aucune', 'Une seule', 'Deux'], correct: count },
      hint: 'Le signe du discriminant donne le nombre de solutions.',
      correction: [deltaLine(t), verdict[count]],
    };
  },
};

const resoudre: Skill = {
  id: 'resoudre',
  name: 'Résoudre une équation du second degré',
  generate(rng, level) {
    let t: Trinomial;
    let roots: Frac[];
    if (level === 3 && rng.next() < 0.25) {
      const a = leadingCoef(rng, level);
      t = fromVertex(a, rng.int(-4, 4), Math.sign(a) * rng.int(1, 5));
      roots = [];
    } else if (level === 3) {
      // s(px - q)(x - r) : une racine entière r et une racine fractionnaire q/p.
      const p = rng.pick([2, 3]);
      let q = 0;
      while (q % p === 0) q = rng.int(-7, 7);
      const r = rng.int(-5, 5);
      const s = rng.sign();
      t = { a: s * p, b: -s * (p * r + q), c: s * q * r };
      roots = [frac(q, p), frac(r)];
    } else {
      const [r1, r2] = distinctRoots(rng, level);
      t = fromRoots(leadingCoef(rng, level), r1, r2);
      roots = [frac(r1), frac(r2)];
    }
    return {
      skill: 'resoudre',
      level,
      prompt: `Résous dans $\\mathbb{R}$ l'équation $${polyLatex(t.a, t.b, t.c)} = 0$.`,
      answer: { kind: 'set', values: roots },
      hint: 'Calcule d\'abord $\\Delta = b^2 - 4ac$, puis applique les formules des racines.',
      correction: rootLines(t),
    };
  },
};

function vertexParams(rng: Rng, level: Level) {
  const a = leadingCoef(rng, level);
  const alpha = rng.nonZero(-4, 4);
  const beta = rng.int(-7, 7);
  return { a, alpha, beta, t: fromVertex(a, alpha, beta) };
}

const sommet: Skill = {
  id: 'sommet',
  name: 'Trouver le sommet de la parabole',
  generate(rng, level) {
    const { alpha, beta, t } = vertexParams(rng, level);
    return {
      skill: 'sommet',
      level,
      prompt: `${define(t)} Donne les coordonnées du sommet $S(\\alpha\\,;\\,\\beta)$ de sa parabole.`,
      answer: { kind: 'pair', values: [frac(alpha), frac(beta)], labels: ['\\alpha', '\\beta'] },
      hint: "L'abscisse du sommet est $\\alpha = -\\frac{b}{2a}$, et son ordonnée est $f(\\alpha)$.",
      correction: [...vertexLines(t, alpha, beta), `Le sommet est $S(${alpha}\\,;\\,${beta})$.`],
    };
  },
};

const formeCanonique: Skill = {
  id: 'forme-canonique',
  name: 'Reconnaître la forme canonique',
  generate(rng, level) {
    const { a, alpha, beta, t } = vertexParams(rng, level);
    const wrap = (s: string) => `$${s}$`;
    const answer = makeChoice(
      rng,
      wrap(canonicalLatex(a, alpha, beta)),
      [
        wrap(canonicalLatex(a, -alpha, beta)),
        wrap(canonicalLatex(a, alpha, -beta)),
        wrap(canonicalLatex(a, -alpha, -beta)),
        wrap(canonicalLatex(a, beta, alpha)),
      ],
      () => wrap(canonicalLatex(a, alpha + rng.nonZero(-2, 2), beta)),
    );
    return {
      skill: 'forme-canonique',
      level,
      prompt: `${define(t)} Quelle est sa forme canonique ?`,
      answer,
      hint: 'La forme canonique est $a(x - \\alpha)^2 + \\beta$ avec $\\alpha = -\\frac{b}{2a}$.',
      correction: [...vertexLines(t, alpha, beta), `Donc $f(x) = ${canonicalLatex(a, alpha, beta)}$.`],
    };
  },
};

const factorisation: Skill = {
  id: 'factorisation',
  name: 'Factoriser un trinôme',
  generate(rng, level) {
    const a = leadingCoef(rng, level);
    const [r1, r2] = distinctRoots(rng, level);
    const t = fromRoots(a, r1, r2);
    // Un leurre ne doit pas être la bonne réponse écrite dans l'autre ordre, comme (x + 5)(x - 5).
    const sameRoots = (p: number, q: number) => (p === r1 && q === r2) || (p === r2 && q === r1);
    const wrap = (p: number, q: number) => `$f(x) = ${factoredLatex(a, p, q)}$`;
    const decoys: [number, number][] = [
      [-r1, -r2],
      [r1, -r2],
      [-r1, r2],
      [r1, r1],
      [r2, r2],
    ];
    const answer = makeChoice(
      rng,
      wrap(r1, r2),
      decoys.filter(([p, q]) => !sameRoots(p, q)).map(([p, q]) => wrap(p, q)),
      () => wrap(r1 + rng.nonZero(-2, 2), r2),
    );
    return {
      skill: 'factorisation',
      level,
      prompt: `${define(t)} Quelle est sa forme factorisée ?`,
      answer,
      hint: 'Si $f$ a deux racines $x_1$ et $x_2$, alors $f(x) = a(x - x_1)(x - x_2)$.',
      correction: [...rootLines(t), `Donc $f(x) = ${factoredLatex(a, r1, r2)}$.`],
    };
  },
};

const autreRacine: Skill = {
  id: 'autre-racine',
  name: 'Trouver la seconde racine',
  generate(rng, level) {
    const a = leadingCoef(rng, level);
    const bound = rootBound(level);
    const r1 = rng.nonZero(-bound, bound);
    let r2 = r1;
    while (r2 === r1) r2 = rng.int(-bound, bound);
    const t = fromRoots(a, r1, r2);
    return {
      skill: 'autre-racine',
      level,
      prompt: `${define(t)} Sachant que $${r1}$ est une racine de $f$, trouve l'autre racine.`,
      answer: { kind: 'number', value: frac(r2) },
      hint: 'Le produit des racines vaut $x_1 x_2 = \\frac{c}{a}$.',
      correction: [
        `Le produit des racines vaut $x_1 x_2 = \\frac{c}{a} = \\frac{${t.c}}{${t.a}} = ${fracLatex(frac(t.c, t.a))}$.`,
        `Avec $x_1 = ${r1}$ : $x_2 = \\frac{${fracLatex(frac(t.c, t.a))}}{${paren(r1)}} = ${r2}$.`,
      ],
    };
  },
};

const signe: Skill = {
  id: 'signe',
  name: "Résoudre une inéquation du second degré",
  generate(rng, level) {
    const a = level === 1 ? 1 : leadingCoef(rng, level);
    const [r1, r2] = distinctRoots(rng, level);
    const t = fromRoots(a, r1, r2);
    const symbols = level === 3 ? (['>', '<', '\\geq', '\\leq'] as const) : (['>', '<'] as const);
    const symbol = rng.pick(symbols);
    const wantPositive = symbol === '>' || symbol === '\\geq';
    const closed = symbol === '\\geq' || symbol === '\\leq';
    const outside = (cl: boolean) =>
      `$]-\\infty\\,;\\,${r1}${cl ? ']' : '['} \\cup ${cl ? '[' : ']'}${r2}\\,;\\,+\\infty[$`;
    const between = (cl: boolean) => `$${cl ? '[' : ']'}${r1}\\,;\\,${r2}${cl ? ']' : '['}$`;
    const correctIsOutside = a > 0 === wantPositive;
    const correct = correctIsOutside ? outside(closed) : between(closed);
    const answer = makeChoice(
      rng,
      correct,
      [outside(!closed), between(!closed), correctIsOutside ? between(closed) : outside(closed)],
      () => between(closed),
    );
    return {
      skill: 'signe',
      level,
      prompt: `${define(t)} Résous l'inéquation $f(x) ${symbol} 0$.`,
      answer,
      hint: 'Un trinôme est du signe de $a$ à l\'extérieur de ses racines, et du signe contraire entre elles.',
      correction: [
        ...rootLines(t),
        `$a = ${a}$ est ${a > 0 ? 'positif' : 'négatif'} : $f$ est ${a > 0 ? 'positive' : 'négative'} à l'extérieur des racines et ${a > 0 ? 'négative' : 'positive'} entre elles.`,
        `Donc $S = ${correct.slice(1, -1)}$.`,
      ],
    };
  },
};

const extremum: Skill = {
  id: 'extremum',
  name: "Trouver l'extremum",
  generate(rng, level) {
    const { a, alpha, beta, t } = vertexParams(rng, level);
    const kind = a > 0 ? 'Minimum' : 'Maximum';
    const other = a > 0 ? 'Maximum' : 'Minimum';
    const say = (k: string, value: number, at: number) => `${k} $${value}$ atteint en $x = ${at}$`;
    const answer = makeChoice(
      rng,
      say(kind, beta, alpha),
      [say(other, beta, alpha), say(kind, alpha, beta), say(kind, -beta, -alpha)],
      () => say(kind, beta + rng.nonZero(-3, 3), alpha),
    );
    return {
      skill: 'extremum',
      level,
      prompt: `${define(t)} Quel est l'extremum de $f$ sur $\\mathbb{R}$ ?`,
      answer,
      hint: 'Le sommet de la parabole donne l\'extremum ; le signe de $a$ dit si c\'est un minimum ou un maximum.',
      correction: [
        ...vertexLines(t, alpha, beta),
        `$a = ${a}$ est ${a > 0 ? 'positif : la parabole est tournée vers le haut, donc un minimum' : 'négatif : la parabole est tournée vers le bas, donc un maximum'}.`,
        `${kind} $${beta}$ atteint en $x = ${alpha}$.`,
      ],
    };
  },
};

export const SECOND_DEGRE_SKILLS: Skill[] = [
  image,
  discriminantSkill,
  nbSolutions,
  resoudre,
  sommet,
  formeCanonique,
  factorisation,
  autreRacine,
  signe,
  extremum,
];

export const skillById = (id: string): Skill => {
  const skill = SECOND_DEGRE_SKILLS.find((s) => s.id === id);
  if (!skill) throw new Error(`Compétence inconnue : ${id}`);
  return skill;
};

export type { Exercise };
