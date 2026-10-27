import { frac } from '../fraction';
import type { Rng } from '../rng';
import { type Level, type Skill, makeChoice } from '../types';
import { enrich, variant } from '../variantes';
import { dec, fixedChoice, interval, latexChoice } from './outils';

/** Chapitre 1 de 2nde : ensembles de nombres, intervalles, valeur absolue. */

const SETS = ['$\\mathbb{N}$', '$\\mathbb{Z}$', '$\\mathbb{D}$', '$\\mathbb{Q}$', '$\\mathbb{R}$'];
const SET_NAMES = ['des entiers naturels', 'des entiers relatifs', 'des nombres décimaux', 'des nombres rationnels', 'des nombres réels'];

interface Sample {
  latex: string;
  set: 0 | 1 | 2 | 3 | 4;
  why: string;
}

/** Une fraction irréductible est décimale si son dénominateur n'a que 2 et 5 comme facteurs premiers. */
function onlyTwosAndFives(d: number): boolean {
  while (d % 2 === 0) d /= 2;
  while (d % 5 === 0) d /= 5;
  return d === 1;
}

function sample(rng: Rng, level: Level): Sample {
  const kinds = level === 1 ? ['int', 'neg', 'dec', 'frac'] : level === 2 ? ['frac', 'sqrt', 'dec', 'neg', 'pi'] : ['frac', 'sqrt', 'negsqrt', 'pi', 'quot'];
  const kind = rng.pick(kinds);
  if (kind === 'int') {
    const n = rng.int(0, 99);
    return { latex: String(n), set: 0, why: `$${n}$ est un entier positif.` };
  }
  if (kind === 'neg') {
    const n = -rng.int(1, 60);
    return { latex: String(n), set: 1, why: `$${n}$ est un entier négatif : il n'est pas dans $\\mathbb{N}$.` };
  }
  if (kind === 'dec') {
    const v = (rng.sign() * rng.int(11, 999)) / rng.pick([10, 100]);
    if (Number.isInteger(v)) return sample(rng, level);
    return { latex: dec(v), set: 2, why: `$${dec(v)}$ s'écrit avec un nombre fini de chiffres après la virgule, mais n'est pas entier.` };
  }
  if (kind === 'pi') return { latex: '\\pi', set: 4, why: "$\\pi$ n'est pas rationnel : il est seulement réel." };
  if (kind === 'sqrt' || kind === 'negsqrt') {
    const square = rng.next() < 0.5;
    const k = square ? rng.int(2, 12) ** 2 : rng.pick([2, 3, 5, 6, 7, 8, 10, 11, 12, 15]);
    const neg = kind === 'negsqrt';
    const latex = `${neg ? '-' : ''}\\sqrt{${k}}`;
    if (!square) return { latex, set: 4, why: `$${k}$ n'est pas un carré parfait, donc $\\sqrt{${k}}$ est irrationnel.` };
    const r = Math.sqrt(k);
    return neg
      ? { latex, set: 1, why: `$${latex} = -${r}$, un entier négatif.` }
      : { latex, set: 0, why: `$\\sqrt{${k}} = ${r}$, un entier naturel.` };
  }
  // Fraction : on la réduit pour connaître sa vraie nature.
  const d = rng.pick(level === 1 ? [2, 3, 4, 5, 6] : [3, 4, 6, 7, 8, 9, 12, 20, 25, 40]);
  const n = rng.sign() * (kind === 'quot' ? d * rng.int(1, 6) : rng.int(1, 30));
  const f = frac(n, d);
  const latex = `${n < 0 ? '-' : ''}\\frac{${Math.abs(n)}}{${d}}`;
  if (f.d === 1)
    return f.n >= 0
      ? { latex, set: 0, why: `$${latex} = ${f.n}$, un entier naturel.` }
      : { latex, set: 1, why: `$${latex} = ${f.n}$, un entier négatif.` };
  if (onlyTwosAndFives(f.d)) {
    const v = f.n / f.d;
    return { latex, set: 2, why: `$${latex} = ${dec(v)}$ : son écriture décimale s'arrête.` };
  }
  return {
    latex,
    set: 3,
    why: `Sous forme irréductible, le dénominateur $${f.d}$ a un facteur premier autre que 2 et 5 : l'écriture décimale ne s'arrête pas.`,
  };
}

const ensemble: Skill = {
  id: '2nde-ensemble',
  name: "Trouver le plus petit ensemble d'un nombre",
  generate(rng, level) {
    const s = sample(rng, level);
    return {
      skill: '2nde-ensemble',
      level,
      prompt: `Quel est le plus petit ensemble de nombres auquel appartient $${s.latex}$ ?`,
      answer: fixedChoice(SETS, s.set),
      hint: '$\\mathbb{N} \\subset \\mathbb{Z} \\subset \\mathbb{D} \\subset \\mathbb{Q} \\subset \\mathbb{R}$ : commence par simplifier le nombre.',
      correction: [s.why, `Le plus petit ensemble est donc celui ${SET_NAMES[s.set]}, ${SETS[s.set]}.`],
    };
  },
};

const intervalle: Skill = {
  id: '2nde-intervalle',
  name: 'Écrire un intervalle',
  generate(rng, level) {
    const a = rng.int(-9, 6);
    const b = a + rng.int(1, 8);
    const ops = ['<', '\\leq'] as const;
    const bounded = level === 1 ? rng.next() < 0.3 : rng.next() < 0.7;
    let inequality: string;
    let correct: string;
    let decoys: string[];
    if (bounded) {
      const lo = rng.pick(ops);
      const hi = rng.pick(ops);
      inequality = `${a} ${lo} x ${hi} ${b}`;
      const lc = lo === '\\leq';
      const hc = hi === '\\leq';
      correct = interval(a, lc, b, hc);
      decoys = [interval(a, !lc, b, hc), interval(a, lc, b, !hc), interval(a, !lc, b, !hc), interval(b, lc, a, hc)];
    } else {
      const op = rng.pick(['<', '\\leq', '>', '\\geq'] as const);
      inequality = `x ${op} ${a}`;
      const closed = op === '\\leq' || op === '\\geq';
      const above = op === '>' || op === '\\geq';
      const make = (up: boolean, cl: boolean) => (up ? interval(a, cl, null, false) : interval(null, false, a, cl));
      correct = make(above, closed);
      decoys = [make(above, !closed), make(!above, closed), make(!above, !closed)];
    }
    return {
      skill: '2nde-intervalle',
      level,
      prompt: `Quel intervalle correspond aux réels $x$ tels que $${inequality}$ ?`,
      answer: latexChoice(rng, correct, decoys, () => interval(a - 1, true, b, true)),
      hint: 'Un crochet tourné vers le nombre l’inclut ($\\leq$), un crochet tourné vers l’extérieur l’exclut ($<$). Du côté de l’infini, le crochet est toujours ouvert.',
      correction: [`Les réels $x$ tels que $${inequality}$ forment l'intervalle $${correct}$.`],
    };
  },
};

const distance: Skill = {
  id: '2nde-distance-abs',
  name: 'Calculer une valeur absolue',
  generate(rng, level) {
    const bound = level === 1 ? 10 : 20;
    const a = level === 3 ? rng.int(-30, 30) / 2 : rng.int(-bound, bound);
    let b = a;
    while (b === a) b = level === 3 ? rng.int(-30, 30) / 2 : rng.int(-bound, bound);
    const d = Math.abs(a - b);
    const diff = `${dec(a)} - ${b < 0 ? `(${dec(b)})` : dec(b)}`;
    return {
      skill: '2nde-distance-abs',
      level,
      prompt: `Calcule la distance entre $${dec(a)}$ et $${dec(b)}$ sur la droite des réels, c'est-à-dire $|${diff}|$.`,
      answer: { kind: 'number', value: frac(Math.round(d * 2), 2) },
      hint: '$|x|$ est $x$ sans son signe : une distance est toujours positive.',
      correction: [`$${diff} = ${dec(a - b)}$`, `$|${dec(a - b)}| = ${dec(d)}$`],
    };
  },
};

const absEquation: Skill = {
  id: '2nde-abs-equation',
  name: 'Résoudre |x - a| = r',
  generate(rng, level) {
    const a = rng.int(-8, 8);
    const r = level === 1 ? rng.int(1, 6) : rng.int(-2, 9);
    const inside = a === 0 ? 'x' : `x ${a > 0 ? '-' : '+'} ${Math.abs(a)}`;
    const values = r < 0 ? [] : r === 0 ? [frac(a)] : [frac(a - r), frac(a + r)];
    const lines =
      r < 0
        ? ["Une valeur absolue est toujours positive : il n'y a pas de solution, $S = \\varnothing$."]
        : r === 0
          ? [`$|${inside}| = 0$ seulement si $x = ${a}$.`]
          : [
              `$|${inside}| = ${r}$ signifie que $x$ est à la distance $${r}$ de $${a}$.`,
              `Donc $x = ${a} - ${r} = ${a - r}$ ou $x = ${a} + ${r} = ${a + r}$.`,
            ];
    return {
      skill: '2nde-abs-equation',
      level,
      prompt: `Résous dans $\\mathbb{R}$ l'équation $|${inside}| = ${r}$.`,
      answer: { kind: 'set', values },
      hint: '$|x - a| = r$ : $x$ est à la distance $r$ de $a$, de chaque côté.',
      correction: lines,
    };
  },
};

interface Bound {
  v: number;
  closed: boolean;
}

const interUnion: Skill = {
  id: '2nde-inter-union',
  name: 'Intersection et réunion d’intervalles',
  generate(rng, level) {
    // a < c < b < d : les intervalles [a ; b] et [c ; d] se chevauchent.
    const a = rng.int(-9, 0);
    const c = a + rng.int(1, 4);
    const b = c + rng.int(1, 4);
    const d = b + rng.int(1, 4);
    const closed = () => (level === 1 ? true : rng.next() < 0.5);
    const A: Bound = { v: a, closed: closed() };
    const B: Bound = { v: b, closed: closed() };
    const C: Bound = { v: c, closed: closed() };
    const D: Bound = { v: d, closed: closed() };
    const I = interval(A.v, A.closed, B.v, B.closed);
    const J = interval(C.v, C.closed, D.v, D.closed);
    const inter = level > 1 ? rng.next() < 0.5 : true;
    const interRes = interval(C.v, C.closed, B.v, B.closed);
    const unionRes = interval(A.v, A.closed, D.v, D.closed);
    const correct = inter ? interRes : unionRes;
    const decoys = inter
      ? [unionRes, interval(A.v, A.closed, C.v, !C.closed), interval(C.v, !C.closed, B.v, !B.closed), interval(B.v, B.closed, D.v, D.closed)]
      : [interRes, interval(A.v, !A.closed, D.v, !D.closed), interval(A.v, A.closed, B.v, B.closed), interval(C.v, C.closed, D.v, D.closed)];
    return {
      skill: '2nde-inter-union',
      level,
      prompt: `On pose $I = ${I}$ et $J = ${J}$. Que vaut $I ${inter ? '\\cap' : '\\cup'} J$ ?`,
      answer: latexChoice(rng, correct, decoys, () => interval(a - 1, true, d + 1, true)),
      hint: inter
        ? "L'intersection contient les réels qui sont à la fois dans $I$ et dans $J$."
        : 'La réunion contient les réels qui sont dans $I$, dans $J$, ou dans les deux.',
      correction: [
        `Sur la droite des réels, $I$ va de $${a}$ à $${b}$ et $J$ de $${c}$ à $${d}$ : ils se chevauchent entre $${c}$ et $${b}$.`,
        `$I ${inter ? '\\cap' : '\\cup'} J = ${correct}$`,
      ],
    };
  },
};

/* ---------- Variantes : d'autres façons de poser les mêmes notions ---------- */

const ensembleVariantes = [
  variant('vrai-faux', (rng, level) => {
    const s = sample(rng, level);
    const k = rng.int(0, 4);
    const juste = s.set <= k;
    return {
      prompt: `Vrai ou faux : $${s.latex} \\in ${SETS[k].replace(/\$/g, '')}$.`,
      answer: fixedChoice(['Vrai', 'Faux'], juste ? 0 : 1),
      hint: '$\\mathbb{N} \\subset \\mathbb{Z} \\subset \\mathbb{D} \\subset \\mathbb{Q} \\subset \\mathbb{R}$ : trouve d’abord le plus petit ensemble qui contient ce nombre.',
      correction: [s.why, `Le plus petit ensemble qui le contient est ${SETS[s.set]}, donc l'affirmation est ${juste ? 'vraie' : 'fausse'}.`],
    };
  }),
  variant('intrus', (rng, level) => {
    // Trois nombres d'un ensemble, un intrus qui n'y est pas.
    const k = rng.pick(level === 1 ? ([1, 2] as const) : ([1, 2, 3] as const));
    const inside: Sample[] = [];
    let outside: Sample | null = null;
    let guard = 0;
    while ((inside.length < 3 || !outside) && guard++ < 200) {
      const s = sample(rng, rng.pick([1, 2, 3] as Level[]));
      if (s.set <= k && inside.length < 3 && !inside.some((t) => t.latex === s.latex)) inside.push(s);
      else if (s.set > k && !outside) outside = s;
    }
    if (!outside) outside = { latex: '\\pi', set: 4, why: "$\\pi$ n'est pas rationnel." };
    while (inside.length < 3) inside.push({ latex: String(inside.length + 2), set: 0, why: '' });
    const correct = `$${outside.latex}$`;
    return {
      prompt: `Lequel de ces nombres n'appartient pas à ${SETS[k]} ?`,
      answer: makeChoice(
        rng,
        correct,
        inside.map((s) => `$${s.latex}$`),
        () => `$${rng.int(0, 50)}$`,
      ),
      hint: 'Simplifie chaque nombre avant de décider.',
      correction: [outside.why, `C'est donc $${outside.latex}$ qui n'est pas dans ${SETS[k]}.`],
    };
  }),
];

const intervalleVariantes = [
  variant('appartient', (rng, level) => {
    const a = rng.int(-9, 4);
    const b = a + rng.int(2, 8);
    const lc = rng.next() < 0.5;
    const hc = rng.next() < 0.5;
    // On teste souvent une borne : c'est là que se cachent les erreurs.
    const x = rng.pick(level === 1 ? [a + 1, b + 1, a - 1] : [a, b, a + 1, b + 1, a - 1]);
    const inside = (x > a || (x === a && lc)) && (x < b || (x === b && hc));
    const I = interval(a, lc, b, hc);
    return {
      prompt: `Le nombre $${x}$ appartient-il à l'intervalle $${I}$ ?`,
      answer: fixedChoice(['Oui', 'Non'], inside ? 0 : 1),
      hint: 'Regarde la place du nombre par rapport aux bornes, et le sens des crochets.',
      correction: [x === a || x === b ? `$${x}$ est une borne : ${(x === a ? lc : hc) ? 'le crochet est fermé, elle est incluse' : 'le crochet est ouvert, elle est exclue'}.` : `$${x}$ est ${inside ? 'entre' : 'en dehors de'} $${a}$ et $${b}$.`, inside ? `Donc $${x} \\in ${I}$.` : `Donc $${x} \\notin ${I}$.`],
    };
  }),
  variant('vers-inegalite', (rng) => {
    const a = rng.int(-9, 4);
    const b = a + rng.int(1, 8);
    const lc = rng.next() < 0.5;
    const hc = rng.next() < 0.5;
    const op = (c: boolean) => (c ? '\\leq' : '<');
    const ineq = (l: boolean, h: boolean) => `${a} ${op(l)} x ${op(h)} ${b}`;
    return {
      prompt: `Quel encadrement traduit $x \\in ${interval(a, lc, b, hc)}$ ?`,
      answer: latexChoice(rng, ineq(lc, hc), [ineq(!lc, hc), ineq(lc, !hc), ineq(!lc, !hc), `${b} ${op(lc)} x ${op(hc)} ${a}`], () => `${a - 1} \\leq x \\leq ${b}`),
      hint: 'Crochet fermé : la borne est incluse ($\\leq$). Crochet ouvert : elle est exclue ($<$).',
      correction: [`$x \\in ${interval(a, lc, b, hc)}$ signifie $${ineq(lc, hc)}$.`],
    };
  }),
  variant('compter-entiers', (rng, level) => {
    const a = rng.int(-12, 5);
    const b = a + rng.int(1, level === 1 ? 6 : 15);
    const lc = level === 1 ? true : rng.next() < 0.5;
    const hc = level === 1 ? true : rng.next() < 0.5;
    const n = b - a + 1 - (lc ? 0 : 1) - (hc ? 0 : 1);
    return {
      prompt: `Combien d'entiers relatifs appartiennent à l'intervalle $${interval(a, lc, b, hc)}$ ?`,
      answer: { kind: 'number', value: frac(n) },
      hint: 'Compte les entiers de la plus petite borne à la plus grande, puis retire les bornes exclues.',
      correction: [`De $${a}$ à $${b}$, il y a $${b - a + 1}$ entiers.`, `${lc && hc ? 'Les deux bornes sont incluses' : 'On retire les bornes exclues'} : $${n}$ entiers.`],
    };
  }),
];

const distanceVariantes = [
  variant('temperatures', (rng, level) => {
    const t1 = -rng.int(1, level === 1 ? 10 : 25);
    const t2 = rng.int(level === 1 ? 1 : -5, 20);
    return {
      prompt: `Un matin, il fait $${t1}$ °C ; l'après-midi, il fait $${t2}$ °C. De combien de degrés la température a-t-elle varié (écart, sans signe) ?`,
      answer: { kind: 'number', value: frac(Math.abs(t2 - t1)) },
      hint: 'L’écart entre deux nombres est la valeur absolue de leur différence.',
      correction: [`$|${t2} - (${t1})| = |${t2 - t1}| = ${Math.abs(t2 - t1)}$`],
    };
  }),
  variant('expression', (rng, level) => {
    const a = rng.nonZero(-12, 12);
    const b = rng.nonZero(-12, 12);
    const kind = level === 1 ? 'somme' : rng.pick(['somme', 'difference', 'produit'] as const);
    const value = kind === 'somme' ? Math.abs(a) + Math.abs(b) : kind === 'difference' ? Math.abs(a) - Math.abs(b) : Math.abs(a) * Math.abs(b);
    const op = kind === 'somme' ? '+' : kind === 'difference' ? '-' : '\\times';
    return {
      prompt: `Calcule $|${a}| ${op} |${b}|$.`,
      answer: { kind: 'number', value: frac(value) },
      hint: 'Calcule d’abord chaque valeur absolue (toujours positive), puis l’opération.',
      correction: [`$|${a}| = ${Math.abs(a)}$ et $|${b}| = ${Math.abs(b)}$.`, `$${Math.abs(a)} ${op} ${Math.abs(b)} = ${value}$`],
    };
  }),
];

const absEquationVariantes = [
  variant('en-mots', (rng, level) => {
    const a = rng.int(-8, 8);
    const r = rng.int(1, level === 1 ? 6 : 10);
    return {
      prompt: `Quels sont les réels situés à une distance de $${r}$ du nombre $${a}$ ?`,
      answer: { kind: 'set', values: [frac(a - r), frac(a + r)] },
      hint: 'Pars de $' + a + '$ et avance de $' + r + '$ dans chaque sens sur la droite des réels.',
      correction: [`$${a} - ${r} = ${a - r}$ et $${a} + ${r} = ${a + r}$.`],
    };
  }),
  variant('inequation', (rng, level) => {
    const a = rng.int(-8, 8);
    const r = rng.int(1, level === 1 ? 5 : 9);
    const inside = a === 0 ? 'x' : `x ${a > 0 ? '-' : '+'} ${Math.abs(a)}`;
    const below = level === 1 || rng.next() < 0.6;
    const strict = rng.next() < 0.5;
    const op = below ? (strict ? '<' : '\\leq') : strict ? '>' : '\\geq';
    const between = interval(a - r, !strict, a + r, !strict);
    const out = `${interval(null, false, a - r, !strict)} \\cup ${interval(a + r, !strict, null, false)}`;
    const correct = below ? between : out;
    return {
      prompt: `Résous dans $\\mathbb{R}$ l'inéquation $|${inside}| ${op} ${r}$.`,
      answer: latexChoice(rng, correct, [below ? out : between, interval(-r, !strict, r, !strict), interval(a - r, strict, a + r, strict), interval(-a - r, !strict, -a + r, !strict)], () => interval(a, true, a + r, true)),
      hint: `$|x - a| ${below ? '\\leq' : '\\geq'} r$ : $x$ est à une distance de $a$ ${below ? 'au plus' : 'au moins'} égale à $r$.`,
      correction: [`On cherche les réels dont la distance à $${a}$ est ${below ? 'inférieure' : 'supérieure'} ${strict ? 'strictement ' : 'ou égale '}à $${r}$.`, `$S = ${correct}$`],
    };
  }),
];

const interUnionVariantes = [
  variant('disjoints', (rng) => {
    const a = rng.int(-9, -2);
    const b = a + rng.int(1, 4);
    const c = b + rng.int(1, 3);
    const d = c + rng.int(1, 4);
    const I = interval(a, true, b, true);
    const J = interval(c, rng.next() < 0.5, d, true);
    return {
      prompt: `On pose $I = ${I}$ et $J = ${J}$. Que vaut $I \\cap J$ ?`,
      answer: latexChoice(rng, '\\varnothing', [interval(b, true, c, true), interval(a, true, d, true), `\\{${b}\\,;\\,${c}\\}`], () => interval(a, true, c, true)),
      hint: 'Place les deux intervalles sur une même droite graduée : ont-ils des réels en commun ?',
      correction: [`$I$ s'arrête en $${b}$ et $J$ commence en $${c} > ${b}$ : aucun réel n'est dans les deux.`, '$I \\cap J = \\varnothing$'],
    };
  }),
  variant('inclus', (rng) => {
    const a = rng.int(-9, -1);
    const c = a + rng.int(1, 3);
    const d = c + rng.int(1, 4);
    const b = d + rng.int(1, 4);
    const I = interval(a, true, b, rng.next() < 0.5);
    const J = interval(c, rng.next() < 0.5, d, rng.next() < 0.5);
    const inter = rng.next() < 0.5;
    const correct = inter ? J : I;
    return {
      prompt: `On pose $I = ${I}$ et $J = ${J}$. Que vaut $I ${inter ? '\\cap' : '\\cup'} J$ ?`,
      answer: latexChoice(rng, correct, [inter ? I : J, interval(a, true, d, true), interval(c, true, b, true), '\\varnothing'], () => interval(a - 1, true, b, true)),
      hint: 'Remarque que l’un des intervalles est entièrement contenu dans l’autre.',
      correction: [`$J \\subset I$ : tous les réels de $J$ sont aussi dans $I$.`, inter ? `L'intersection est le plus petit : $I \\cap J = ${J}$.` : `La réunion est le plus grand : $I \\cup J = ${I}$.`],
    };
  }),
];

export const ENSEMBLES_SKILLS: Skill[] = [
  enrich(ensemble, ensembleVariantes),
  enrich(intervalle, intervalleVariantes),
  enrich(distance, distanceVariantes),
  enrich(absEquation, absEquationVariantes),
  enrich(interUnion, interUnionVariantes),
];
