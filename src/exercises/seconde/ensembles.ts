import { frac } from '../fraction';
import type { Rng } from '../rng';
import type { Level, Skill } from '../types';
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

export const ENSEMBLES_SKILLS: Skill[] = [ensemble, intervalle, distance, absEquation, interUnion];
