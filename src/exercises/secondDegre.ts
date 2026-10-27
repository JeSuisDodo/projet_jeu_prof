import { frac, fracLatex, type Frac } from './fraction';
import { canonicalLatex, factoredLatex, paren, polyLatex, sumLatex } from './latex';
import type { Rng } from './rng';
import { type Answer, type Exercise, type Level, type Skill, makeChoice } from './types';
import { type Variant, variant } from './variantes';

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

/* Variantes (voir ./variantes.ts), branchées par src/content/premiere/second-degre.ts. */

const vraiFaux = (b: boolean): Answer => ({ kind: 'choice', options: ['Vrai', 'Faux'], correct: b ? 0 : 1 });
const NB = ['Aucune', 'Une seule', 'Deux'];
const nbRacines = (delta: number) => (delta < 0 ? 0 : delta === 0 ? 1 : 2);

export const SECOND_DEGRE_VARIANTES: Record<string, Variant[]> = {
  image: [
    variant('antecedents', (rng, level) => {
      const a = leadingCoef(rng, level);
      const [r1, r2] = distinctRoots(rng, level);
      const k = rng.int(-9, 9);
      const t = fromRoots(a, r1, r2);
      t.c += k;
      return {
        prompt: `${define(t)} Résous l'équation $f(x) = ${k}$.`,
        answer: { kind: 'set', values: [frac(r1), frac(r2)] },
        hint: `Ramène-toi à $f(x) ${k < 0 ? '+' : '-'} ${Math.abs(k)} = 0$, puis résous.`,
        correction: [`$f(x) = ${k} \\iff ${polyLatex(a, t.b, t.c - k)} = 0 \\iff ${factoredLatex(a, r1, r2)} = 0$`, `$S = \\{${r1}\\,;\\,${r2}\\}$`],
      };
    }),
    variant('depuis-canonique', (rng, level) => {
      const a = leadingCoef(rng, level);
      const alpha = rng.int(-5, 5);
      const beta = rng.int(-9, 9);
      const k = rng.int(-4, 4);
      const value = a * (k - alpha) ** 2 + beta;
      return {
        prompt: `Soit $f(x) = ${canonicalLatex(a, alpha, beta)}$. Calcule $f(${k})$.`,
        answer: { kind: 'number', value: frac(value) },
        hint: 'Calcule d’abord la parenthèse, puis le carré.',
        correction: [`$f(${k}) = ${a === 1 ? '' : a === -1 ? '-' : `${a}\\times `}(${k} - ${paren(alpha)})^2 ${beta < 0 ? '-' : '+'} ${Math.abs(beta)} = ${value}$`],
      };
    }),
  ],
  discriminant: [
    variant('racine-double', (rng) => {
      const h = rng.nonZero(-6, 6);
      return {
        prompt: `Pour quelle valeur de $m$ l'équation $${sumLatex([[1, 'x^2'], [2 * h, 'x']])} + m = 0$ a-t-elle une seule solution ?`,
        answer: { kind: 'number', value: frac(h * h) },
        hint: 'Une seule solution quand $\\Delta = 0$.',
        correction: [`$\\Delta = ${paren(2 * h)}^2 - 4m = ${4 * h * h} - 4m$`, `$\\Delta = 0 \\iff m = ${h * h}$`],
      };
    }),
    variant('signes-contraires', (rng, level) => {
      const a = leadingCoef(rng, level);
      const b = rng.int(-9, 9);
      const c = rng.nonZero(-9, 9);
      const options = ['Oui, car $a$ et $c$ sont de signes contraires', 'Non, il faut calculer $\\Delta$'];
      return {
        prompt: `Sans calculer $\\Delta$, peut-on affirmer que l'équation $${polyLatex(a, b, c)} = 0$ a deux solutions ?`,
        answer: { kind: 'choice', options, correct: a * c < 0 ? 0 : 1 },
        hint: '$\\Delta = b^2 - 4ac$ : si $ac < 0$, que dire du signe de $-4ac$ ?',
        correction: [a * c < 0 ? `$ac = ${a * c} < 0$, donc $\\Delta = b^2 - 4ac > 0$ : deux solutions.` : `$ac = ${a * c} > 0$ : le signe de $\\Delta$ dépend de $b$, il faut le calculer.`],
      };
    }),
  ],
  'nb-solutions': [
    variant('parabole-droite', (rng) => {
      const b = rng.int(-6, 6);
      const c = rng.int(-6, 6);
      const m = rng.int(-6, 6);
      const p = rng.int(-9, 9);
      const delta = (b - m) ** 2 - 4 * (c - p);
      return {
        prompt: `En combien de points la parabole d'équation $y = ${polyLatex(1, b, c)}$ coupe-t-elle la droite d'équation $y = ${sumLatex([[m, 'x'], [p, '']]) || '0'}$ ?`,
        answer: { kind: 'choice', options: NB, correct: nbRacines(delta) },
        hint: 'Résous $x^2 + bx + c = mx + p$ : c’est une équation du second degré.',
        correction: [`$${polyLatex(1, b - m, c - p)} = 0$ a pour discriminant $\\Delta = ${delta}$ : ${NB[nbRacines(delta)].toLowerCase()} point${nbRacines(delta) > 1 ? 's' : ''} d'intersection.`],
      };
    }),
    variant('condition-sur-m', (rng) => {
      const h = rng.nonZero(-5, 5);
      const k = h * h;
      const opt = (op: string, v: number) => `$m ${op} ${v}$`;
      return {
        prompt: `À quelle condition sur $m$ l'équation $${sumLatex([[1, 'x^2'], [2 * h, 'x']])} + m = 0$ a-t-elle deux solutions ?`,
        answer: makeChoice(rng, opt('<', k), [opt('>', k), opt('=', k), opt('<', -k), opt('>', -k)], () => opt('<', 2 * k)),
        hint: 'Deux solutions quand $\\Delta > 0$.',
        correction: [`$\\Delta = ${4 * k} - 4m > 0 \\iff m < ${k}$`],
      };
    }),
  ],
  resoudre: [
    variant('rectangle', (rng) => {
      const l = rng.int(2, 12);
      const L = l + rng.int(1, 10);
      return {
        prompt: `Un rectangle a pour périmètre $${2 * (L + l)}$ cm et pour aire $${L * l}$ cm². Quelle est sa longueur (le plus grand côté), en cm ?`,
        answer: { kind: 'number', value: frac(L) },
        hint: `Les deux côtés ont pour somme $${L + l}$ et pour produit $${L * l}$ : ils sont solutions de $x^2 - ${L + l}x + ${L * l} = 0$.`,
        correction: [`$${polyLatex(1, -(L + l), L * l)} = 0$ a pour solutions $${l}$ et $${L}$ : la longueur vaut $${L}$ cm.`],
      };
    }),
    variant('entiers-consecutifs', (rng) => {
      const n = rng.int(3, 40);
      return {
        prompt: `Le produit de deux entiers naturels consécutifs vaut $${n * (n + 1)}$. Quel est le plus petit des deux ?`,
        answer: { kind: 'number', value: frac(n) },
        hint: 'Avec $n$ et $n + 1$ : résous $n^2 + n - ' + n * (n + 1) + ' = 0$.',
        correction: [`$${polyLatex(1, 1, -n * (n + 1))} = 0$ a pour solutions $${n}$ et $${-n - 1}$ ; on garde l'entier naturel $${n}$.`],
      };
    }),
    variant('bicarree', (rng) => {
      const p = rng.int(1, 4);
      let q = rng.int(1, 5);
      if (q === p) q++;
      const values = [-q, -p, p, q].sort((x, y) => x - y).map((v) => frac(v));
      return {
        prompt: `Résous dans $\\mathbb{R}$ l'équation $x^4 - ${p * p + q * q}x^2 + ${p * p * q * q} = 0$.`,
        answer: { kind: 'set', values },
        hint: 'Pose $X = x^2$ : on obtient une équation du second degré en $X$.',
        correction: [`$X^2 - ${p * p + q * q}X + ${p * p * q * q} = 0$ a pour solutions $X = ${p * p}$ et $X = ${q * q}$.`, `$x^2 = ${p * p}$ ou $x^2 = ${q * q}$ : $S = \\{${-q}\\,;\\,${-p}\\,;\\,${p}\\,;\\,${q}\\}$`],
      };
    }),
  ],
  sommet: [
    variant('depuis-racines', (rng, level) => {
      const a = leadingCoef(rng, level);
      const r1 = rng.int(-6, 4);
      const r2 = r1 + 2 * rng.int(1, 4);
      const alpha = (r1 + r2) / 2;
      const beta = a * (alpha - r1) * (alpha - r2);
      return {
        prompt: `Soit $f(x) = ${factoredLatex(a, r1, r2)}$. Donne les coordonnées du sommet $S(\\alpha\\,;\\,\\beta)$ de sa parabole.`,
        answer: { kind: 'pair', values: [frac(alpha), frac(beta)], labels: ['\\alpha', '\\beta'] },
        hint: 'Par symétrie, le sommet est à mi-chemin entre les deux racines.',
        correction: [`$\\alpha = \\frac{${r1} + ${paren(r2)}}{2} = ${alpha}$ et $\\beta = f(${alpha}) = ${beta}$`],
      };
    }),
    variant('axe-symetrie', (rng, level) => {
      const { alpha, t } = vertexParams(rng, level);
      return {
        prompt: `${define(t)} Sa parabole admet un axe de symétrie d'équation $x = k$. Que vaut $k$ ?`,
        answer: { kind: 'number', value: frac(alpha) },
        hint: 'L’axe de symétrie passe par le sommet : $k = -\\frac{b}{2a}$.',
        correction: [`$k = -\\frac{${t.b}}{${2 * t.a}} = ${alpha}$`],
      };
    }),
  ],
  'forme-canonique': [
    variant('completer-carre', (rng) => {
      const h = rng.nonZero(-7, 7);
      const c = rng.int(-9, 9);
      return {
        prompt: `On écrit $${polyLatex(1, 2 * h, c)} = (x ${h < 0 ? '-' : '+'} ${Math.abs(h)})^2 + k$. Que vaut $k$ ?`,
        answer: { kind: 'number', value: frac(c - h * h) },
        hint: `$(x ${h < 0 ? '-' : '+'} ${Math.abs(h)})^2 = ${polyLatex(1, 2 * h, h * h)}$.`,
        correction: [`$k = ${c} - ${h * h} = ${c - h * h}$`],
      };
    }),
    variant('developper', (rng, level) => {
      const { a, alpha, beta, t } = vertexParams(rng, level);
      const good = `$f(x) = ${polyLatex(a, t.b, t.c)}$`;
      return {
        prompt: `Soit $f(x) = ${canonicalLatex(a, alpha, beta)}$. Quelle est sa forme développée ?`,
        answer: makeChoice(rng, good, [polyLatex(a, -t.b, t.c), polyLatex(a, t.b, a * alpha * alpha - beta), polyLatex(a, t.b / 2, t.c), polyLatex(a, t.b, beta)].map((p) => `$f(x) = ${p}$`), () => `$f(x) = ${polyLatex(a, t.b, t.c + rng.nonZero(-3, 3))}$`),
        hint: 'Développe le carré avec $(x - \\alpha)^2 = x^2 - 2\\alpha x + \\alpha^2$.',
        correction: [`$f(x) = ${a === 1 ? '' : a === -1 ? '-' : a}(${polyLatex(1, -2 * alpha, alpha * alpha)}) ${beta < 0 ? '-' : '+'} ${Math.abs(beta)} = ${polyLatex(a, t.b, t.c)}$`],
      };
    }),
  ],
  factorisation: [
    variant('vrai-faux', (rng, level) => {
      const a = leadingCoef(rng, level);
      const [r1, r2] = distinctRoots(rng, level);
      const t = fromRoots(a, r1, r2);
      const ok = rng.next() < 0.5;
      const [k, s1, s2] = ok ? [a, r1, r2] : rng.pick([[a, -r1, -r2], [-a, r1, r2], [a, r1, r2 + 1]]);
      const shown = factoredLatex(k, s1, s2);
      // (x + 2)(x - 2) et (x - 2)(x + 2) sont le même trinôme : on compare les racines, pas les textes.
      const vrai = k === a && Math.min(s1, s2) === r1 && Math.max(s1, s2) === r2;
      return {
        prompt: `Vrai ou faux : pour tout réel $x$, $${polyLatex(t.a, t.b, t.c)} = ${shown}$.`,
        answer: vraiFaux(vrai),
        hint: 'Développe le membre de droite, ou vérifie avec une valeur de $x$.',
        correction: [`Les racines sont $${r1}$ et $${r2}$ et $a = ${a}$ : $${polyLatex(t.a, t.b, t.c)} = ${factoredLatex(a, r1, r2)}$. C'est ${vrai ? 'vrai' : 'faux'}.`],
      };
    }),
    variant('coefficient-par-un-point', (rng, level) => {
      const a = leadingCoef(rng, level);
      const [r1, r2] = distinctRoots(rng, level);
      let x0 = rng.int(-6, 6);
      while (x0 === r1 || x0 === r2) x0++;
      const y0 = a * (x0 - r1) * (x0 - r2);
      return {
        prompt: `Un trinôme $f(x) = a(x - x_1)(x - x_2)$ a pour racines $${r1}$ et $${r2}$, et $f(${x0}) = ${y0}$. Que vaut $a$ ?`,
        answer: { kind: 'number', value: frac(a) },
        hint: `Écris $f(${x0}) = a(${x0} - ${paren(r1)})(${x0} - ${paren(r2)})$.`,
        correction: [`$a \\times ${(x0 - r1) * (x0 - r2)} = ${y0}$, donc $a = ${a}$.`],
      };
    }),
  ],
  'autre-racine': [
    variant('somme-produit', (rng, level) => {
      const a = leadingCoef(rng, level);
      const [r1, r2] = distinctRoots(rng, level);
      const t = fromRoots(a, r1, r2);
      const somme = rng.next() < 0.5;
      const value = somme ? frac(-t.b, t.a) : frac(t.c, t.a);
      return {
        prompt: `Sans calculer ses racines, donne ${somme ? 'la somme' : 'le produit'} des deux solutions de l'équation $${polyLatex(t.a, t.b, t.c)} = 0$.`,
        answer: { kind: 'number', value },
        hint: somme ? 'La somme des racines vaut $-\\frac{b}{a}$.' : 'Le produit des racines vaut $\\frac{c}{a}$.',
        correction: [somme ? `$x_1 + x_2 = -\\frac{${t.b}}{${t.a}} = ${fracLatex(value)}$` : `$x_1 x_2 = \\frac{${t.c}}{${t.a}} = ${fracLatex(value)}$`],
      };
    }),
    variant('deux-nombres', (rng) => {
      const x = rng.int(-9, 9);
      let y = rng.int(-9, 9);
      if (y === x) y++;
      return {
        prompt: `Trouve deux nombres dont la somme vaut $${x + y}$ et le produit $${x * y}$.`,
        answer: { kind: 'set', values: [frac(Math.min(x, y)), frac(Math.max(x, y))] },
        hint: 'Ils sont solutions de $X^2 - SX + P = 0$.',
        correction: [`$${polyLatex(1, -(x + y), x * y).replace(/x/g, 'X')} = 0$ a pour solutions $${Math.min(x, y)}$ et $${Math.max(x, y)}$.`],
      };
    }),
  ],
  signe: [
    variant('toujours-positif', (rng, level) => {
      const a = leadingCoef(rng, level);
      const b = rng.int(-6, 6);
      const c = rng.int(-9, 9);
      const positif = rng.next() < 0.5;
      const delta = b * b - 4 * a * c;
      const ok = delta < 0 && (positif ? a > 0 : a < 0);
      return {
        prompt: `Vrai ou faux : pour tout réel $x$, $${polyLatex(a, b, c)} ${positif ? '>' : '<'} 0$.`,
        answer: vraiFaux(ok),
        hint: 'Un trinôme garde un signe constant quand $\\Delta < 0$ : celui de $a$.',
        correction: [`$\\Delta = ${delta}$ et $a = ${a}$ : ${ok ? `le trinôme est toujours du signe de $a$, c'est vrai` : delta < 0 ? `le trinôme est toujours du signe de $a$, donc c'est faux` : `le trinôme s'annule, c'est faux`}.`],
      };
    }),
    variant('entiers-solutions', (rng, level) => {
      const a = level === 1 ? 1 : rng.pick([1, 2, -1, -3]);
      const [r1, r2] = distinctRoots(rng, level);
      const t = fromRoots(a, r1, r2);
      const op = a > 0 ? '\\leq' : '\\geq';
      return {
        prompt: `Combien d'entiers $x$ vérifient $${polyLatex(t.a, t.b, t.c)} ${op} 0$ ?`,
        answer: { kind: 'number', value: frac(r2 - r1 + 1) },
        hint: 'Trouve les racines : l’inéquation est vérifiée entre elles.',
        correction: [`Les racines sont $${r1}$ et $${r2}$ ; les solutions sont les $x \\in [${r1}\\,;\\,${r2}]$, soit $${r2 - r1 + 1}$ entiers.`],
      };
    }),
  ],
  extremum: [
    variant('balle', (rng) => {
      const v = 10 * rng.int(1, 4);
      const h0 = rng.int(0, 3);
      const hmax = (v * v) / 20 + h0;
      return {
        prompt: `Une balle lancée verticalement est à la hauteur $h(t) = -5t^2 + ${v}t${h0 ? ` + ${h0}` : ''}$ (en m) au temps $t$ (en s). Quelle hauteur maximale atteint-elle ?`,
        answer: { kind: 'number', value: frac(hmax) },
        hint: 'Le maximum est atteint au sommet de la parabole, en $t = -\\frac{b}{2a}$.',
        correction: [`$t = \\frac{${v}}{10} = ${v / 10}$ s et $h(${v / 10}) = ${hmax}$ m.`],
      };
    }),
    variant('depuis-racines', (rng, level) => {
      const a = leadingCoef(rng, level);
      const r1 = rng.int(-6, 4);
      const r2 = r1 + 2 * rng.int(1, 4);
      const alpha = (r1 + r2) / 2;
      const beta = a * (alpha - r1) * (alpha - r2);
      return {
        prompt: `Soit $f(x) = ${factoredLatex(a, r1, r2)}$. Quelle est la valeur du ${a > 0 ? 'minimum' : 'maximum'} de $f$ sur $\\mathbb{R}$ ?`,
        answer: { kind: 'number', value: frac(beta) },
        hint: 'L’extremum est atteint au milieu des deux racines.',
        correction: [`Il est atteint en $${alpha}$ et vaut $f(${alpha}) = ${beta}$.`],
      };
    }),
  ],
};

export const skillById = (id: string): Skill => {
  const skill = SECOND_DEGRE_SKILLS.find((s) => s.id === id);
  if (!skill) throw new Error(`Compétence inconnue : ${id}`);
  return skill;
};

export type { Exercise };
