import { type Frac, frac, fracLatex } from '../fraction';
import type { Rng } from '../rng';
import type { Level, Skill } from '../types';
import { fixedChoice, latexChoice, par, terms } from './outils';

/** Chapitre 6 de 2nde : équations de droites. */

/** y = mx + p en LaTeX, m et p rationnels. */
export function reduite(m: Frac, p: Frac): string {
  const parts: string[] = [];
  if (m.n !== 0) {
    const abs = fracLatex({ n: Math.abs(m.n), d: m.d });
    parts.push(`${m.n < 0 ? '-' : ''}${abs === '1' ? '' : abs}x`);
  }
  if (p.n !== 0 || parts.length === 0) {
    const abs = fracLatex({ n: Math.abs(p.n), d: p.d });
    parts.push(parts.length === 0 ? `${p.n < 0 ? '-' : ''}${abs}` : `${p.n < 0 ? '-' : '+'} ${abs}`);
  }
  return `y = ${parts.join(' ')}`;
}

type Pt = [number, number];
const P = (name: string, [x, y]: Pt) => `${name}(${x}\\,;\\,${y})`;

/** Deux points d'abscisses distinctes ; en niveau 1 et 2, la pente est entière. */
function twoPoints(rng: Rng, level: Level): [Pt, Pt] {
  const xA = rng.int(-6, 6);
  let xB = xA;
  while (xB === xA) xB = rng.int(-6, 6);
  const yA = rng.int(-8, 8);
  if (level < 3) {
    const m = rng.int(-4, 4);
    return [
      [xA, yA],
      [xB, yA + m * (xB - xA)],
    ];
  }
  return [
    [xA, yA],
    [xB, rng.int(-8, 8)],
  ];
}

const slopeOf = (A: Pt, B: Pt) => frac(B[1] - A[1], B[0] - A[0]);

const coefDirecteur: Skill = {
  id: '2nde-coef-directeur',
  name: 'Calculer un coefficient directeur',
  generate(rng, level) {
    const [A, B] = twoPoints(rng, level);
    const m = slopeOf(A, B);
    return {
      skill: '2nde-coef-directeur',
      level,
      prompt: `Quel est le coefficient directeur de la droite $(AB)$, avec $${P('A', A)}$ et $${P('B', B)}$ ?`,
      answer: { kind: 'number', value: m },
      hint: '$m = \\frac{y_B - y_A}{x_B - x_A}$',
      correction: [`$m = \\frac{${B[1]} - ${par(A[1])}}{${B[0]} - ${par(A[0])}} = \\frac{${B[1] - A[1]}}{${B[0] - A[0]}} = ${fracLatex(m)}$`],
    };
  },
};

const ordonneeOrigine: Skill = {
  id: '2nde-ordonnee-origine',
  name: 'Trouver l’ordonnée à l’origine',
  generate(rng, level) {
    const m = level === 3 ? frac(rng.nonZero(-5, 5), rng.pick([1, 2, 3])) : frac(rng.nonZero(-5, 5));
    const xA = level === 3 ? m.d * rng.int(-3, 3) : rng.int(-5, 5);
    const yA = rng.int(-9, 9);
    // p = yA - m xA, entier car m.d divise xA.
    const p = frac(yA * m.d - m.n * xA, m.d);
    return {
      skill: '2nde-ordonnee-origine',
      level,
      prompt: `La droite $d$ a pour coefficient directeur $${fracLatex(m)}$ et passe par $${P('A', [xA, yA])}$. Quelle est son ordonnée à l'origine $p$ ?`,
      answer: { kind: 'number', value: p },
      hint: '$A$ est sur la droite : ses coordonnées vérifient $y_A = m x_A + p$.',
      correction: [
        `$${yA} = ${fracLatex(m)} \\times ${par(xA)} + p$`,
        `$p = ${yA} - ${fracLatex(frac(m.n * xA, m.d)).replace(/^(-.*)$/, '($1)')} = ${fracLatex(p)}$`,
      ],
    };
  },
};

const equationReduite: Skill = {
  id: '2nde-equation-reduite',
  name: 'Trouver l’équation réduite d’une droite',
  generate(rng, level) {
    const [A, B] = twoPoints(rng, level);
    const vertical = level === 3 && rng.next() < 0.15;
    if (vertical) {
      B[0] = A[0];
      if (B[1] === A[1]) B[1] += rng.pick([-3, 3]);
    }
    if (vertical) {
      const correct = `x = ${A[0]}`;
      return {
        skill: '2nde-equation-reduite',
        level,
        prompt: `Quelle est l'équation réduite de la droite $(AB)$, avec $${P('A', A)}$ et $${P('B', B)}$ ?`,
        answer: latexChoice(rng, correct, [`y = ${A[0]}`, `y = ${A[1]}`, `x = ${B[1]}`], () => `x = ${A[0] + rng.nonZero(-3, 3)}`),
        hint: 'Regarde les abscisses des deux points.',
        correction: [`$A$ et $B$ ont la même abscisse $${A[0]}$ : la droite est parallèle à l'axe des ordonnées.`, `Son équation est $${correct}$.`],
      };
    }
    const m = slopeOf(A, B);
    const p = frac(A[1] * m.d - m.n * A[0], m.d);
    const correct = reduite(m, p);
    const minusM = frac(-m.n, m.d);
    const inv = m.n === 0 ? frac(1) : frac(m.d, m.n);
    return {
      skill: '2nde-equation-reduite',
      level,
      prompt: `Quelle est l'équation réduite de la droite $(AB)$, avec $${P('A', A)}$ et $${P('B', B)}$ ?`,
      answer: latexChoice(
        rng,
        correct,
        [reduite(minusM, p), reduite(inv, p), reduite(m, frac(-p.n, p.d)), reduite(m, frac(A[1])), reduite(p, m)],
        () => reduite(m, frac(p.n + rng.nonZero(-3, 3) * p.d, p.d)),
      ),
      hint: 'Calcule d’abord le coefficient directeur $m$, puis $p$ en utilisant les coordonnées de $A$.',
      correction: [
        `$m = \\frac{${B[1]} - ${par(A[1])}}{${B[0]} - ${par(A[0])}} = ${fracLatex(m)}$`,
        `$p = y_A - m x_A = ${A[1]} - ${m.n < 0 ? `\\left(${fracLatex(m)}\\right)` : fracLatex(m)} \\times ${par(A[0])} = ${fracLatex(p)}$`,
        `Donc $(AB) : ${correct}$.`,
      ],
    };
  },
};

const appartenance: Skill = {
  id: '2nde-point-droite',
  name: 'Vérifier qu’un point est sur une droite',
  generate(rng, level) {
    const m = rng.nonZero(-5, 5);
    const p = rng.int(-9, 9);
    const x = rng.int(-6, 6);
    const on = rng.next() < 0.5;
    const y = m * x + p + (on ? 0 : rng.nonZero(-3, 3));
    const eq = level === 3 ? `${terms([[m, 'x'], [-1, 'y'], [p, '']])} = 0` : `y = ${terms([[m, 'x'], [p, '']])}`;
    return {
      skill: '2nde-point-droite',
      level,
      prompt: `Le point $${P('C', [x, y])}$ appartient-il à la droite d'équation $${eq}$ ?`,
      answer: fixedChoice(['Oui', 'Non'], on ? 0 : 1),
      hint: 'Remplace $x$ et $y$ par les coordonnées du point, et regarde si l’égalité est vraie.',
      correction: [
        `$${m} \\times ${par(x)} ${p < 0 ? '-' : '+'} ${Math.abs(p)} = ${m * x + p}$`,
        on ? `On trouve bien $y_C = ${y}$ : le point est sur la droite.` : `On trouve $${m * x + p} \\neq ${y}$ : le point n'est pas sur la droite.`,
      ],
    };
  },
};

const vecteurDirecteur: Skill = {
  id: '2nde-vecteur-directeur',
  name: 'Trouver un vecteur directeur',
  generate(rng, level) {
    const a = rng.nonZero(-6, 6);
    const b = rng.nonZero(-6, 6);
    const c = rng.int(-9, 9);
    // ax + by + c = 0 a pour vecteur directeur (-b ; a).
    const k = level === 1 ? 1 : rng.pick([1, -1, 2]);
    const good: [number, number] = [-b * k, a * k];
    const V = ([x, y]: [number, number]) => `\\vec{u}\\begin{pmatrix}${x}\\\\${y}\\end{pmatrix}`;
    const colinear = ([x, y]: [number, number]) => x * a + y * b === 0;
    const candidates: [number, number][] = [
      [a, b],
      [b, a],
      [-b, -a],
      [b, -a + 1],
      [a, -b],
    ];
    return {
      skill: '2nde-vecteur-directeur',
      level,
      prompt: `Lequel de ces vecteurs est un vecteur directeur de la droite d'équation $${terms([[a, 'x'], [b, 'y'], [c, '']])} = 0$ ?`,
      answer: latexChoice(
        rng,
        V(good),
        candidates.filter((v) => !colinear(v)).map(V),
        () => V([rng.nonZero(-6, 6), rng.nonZero(-6, 6)]),
      ),
      hint: 'La droite d’équation $ax + by + c = 0$ a pour vecteur directeur $\\vec{u}(-b\\,;\\,a)$, ou tout vecteur colinéaire.',
      correction: [
        `Ici $a = ${a}$ et $b = ${b}$ : $(-b\\,;\\,a) = (${-b}\\,;\\,${a})$ est un vecteur directeur.`,
        k === 1 ? `C'est $${V(good)}$.` : `$${V(good)}$ lui est colinéaire (on a multiplié par $${k}$), c'est donc aussi un vecteur directeur.`,
      ],
    };
  },
};

const cartesienneReduite: Skill = {
  id: '2nde-cartesienne-reduite',
  name: 'Passer d’une équation cartésienne à la réduite',
  generate(rng, level) {
    const b = level === 1 ? rng.pick([1, -1]) : rng.nonZero(-4, 4);
    const a = rng.nonZero(-6, 6);
    const c = rng.int(-9, 9);
    // ax + by + c = 0 ⇔ y = -a/b x - c/b
    const m = frac(-a, b);
    const p = frac(-c, b);
    const correct = reduite(m, p);
    return {
      skill: '2nde-cartesienne-reduite',
      level,
      prompt: `Quelle est l'équation réduite de la droite d'équation cartésienne $${terms([[a, 'x'], [b, 'y'], [c, '']])} = 0$ ?`,
      answer: latexChoice(
        rng,
        correct,
        [reduite(frac(a, b), p), reduite(m, frac(c, b)), reduite(frac(a, b), frac(c, b)), reduite(frac(-b, a), p), reduite(frac(-a), frac(-c))],
        () => reduite(m, frac(p.n + p.d, p.d)),
      ),
      hint: 'Isole $y$ : passe les autres termes de l’autre côté, puis divise par le coefficient de $y$.',
      correction: [
        `$${terms([[b, 'y']])} = ${terms([[-a, 'x'], [-c, '']])}$`,
        `$${correct}$`,
      ],
    };
  },
};

export const DROITES_SKILLS: Skill[] = [coefDirecteur, ordonneeOrigine, equationReduite, appartenance, vecteurDirecteur, cartesienneReduite];
