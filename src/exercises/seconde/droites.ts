import { type Frac, frac, fracLatex } from '../fraction';
import type { Rng } from '../rng';
import type { Level, Skill } from '../types';
import { variante, varier } from '../varier';
import { dec, fixedChoice, fracOf, latexChoice, par, terms } from './outils';

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

/* ---------- Variantes : d'autres façons de poser les mêmes notions ---------- */

/** Deux relevés d'un tarif affine : prise en charge p et prix par km m. */
function tarif(rng: Rng, level: Level) {
  const m = level === 1 ? rng.int(1, 3) : rng.pick([1.5, 2, 2.5, 3, 1.2]);
  const p = rng.int(2, 8);
  const x1 = rng.int(2, 8);
  const x2 = x1 + rng.int(2, 10);
  return { m, p, x1, x2, y1: Math.round((p + m * x1) * 100) / 100, y2: Math.round((p + m * x2) * 100) / 100 };
}

const coefDirecteurVariantes = [
  variante('cartesienne', (rng, level) => {
    const a = rng.nonZero(-6, 6);
    const b = level === 1 ? rng.pick([1, -1]) : rng.nonZero(-5, 5);
    const c = rng.int(-9, 9);
    const m = frac(-a, b);
    return {
      prompt: `Quel est le coefficient directeur de la droite d'équation $${terms([[a, 'x'], [b, 'y'], [c, '']])} = 0$ ?`,
      answer: { kind: 'number', value: m },
      hint: 'Isole $y$ pour obtenir la forme $y = mx + p$.',
      correction: [`$${terms([[b, 'y']])} = ${terms([[-a, 'x'], [-c, '']])}$`, `Le coefficient directeur est $m = ${fracLatex(m)}$.`],
    };
  }),
  variante('taxi', (rng, level) => {
    const { m, x1, x2, y1, y2 } = tarif(rng, level);
    return {
      prompt: `Le prix d'une course de taxi est une fonction affine de la distance. Une course de $${x1}$ km coûte $${dec(y1)}$ € et une course de $${x2}$ km coûte $${dec(y2)}$ €. Quel est le prix d'un kilomètre, en € ?`,
      answer: { kind: 'number', value: fracOf(m) },
      hint: 'Le prix par kilomètre est le coefficient directeur : variation du prix ÷ variation de la distance.',
      correction: [`$m = \\frac{${dec(y2)} - ${dec(y1)}}{${x2} - ${x1}} = \\frac{${dec(y2 - y1)}}{${x2 - x1}} = ${dec(m)}$`],
    };
  }),
  variante('pente-route', (rng, level) => {
    const d = rng.pick([100, 200, 250, 400, 500]);
    const pct = rng.int(2, level === 1 ? 10 : 18);
    const h = (pct * d) / 100;
    return {
      prompt: `Une route monte de $${dec(h)}$ m pour $${d}$ m parcourus à l'horizontale. On la modélise par une droite : quel est son coefficient directeur ?`,
      answer: { kind: 'number', value: frac(pct, 100) },
      hint: 'Coefficient directeur = dénivelé ÷ déplacement horizontal.',
      correction: [`$m = \\frac{${dec(h)}}{${d}} = ${dec(pct / 100)}$`, `On dit aussi que la pente est de $${pct}\\,\\%$.`],
    };
  }),
];

const ordonneeOrigineVariantes = [
  variante('deux-points', (rng, level) => {
    const [A, B] = twoPoints(rng, level);
    const m = slopeOf(A, B);
    const p = frac(A[1] * m.d - m.n * A[0], m.d);
    return {
      prompt: `La droite $d$ passe par $${P('A', A)}$ et $${P('B', B)}$. Quelle est son ordonnée à l'origine ?`,
      answer: { kind: 'number', value: p },
      hint: 'Calcule le coefficient directeur, puis utilise $y_A = m x_A + p$.',
      correction: [`$m = ${fracLatex(m)}$`, `$p = y_A - m x_A = ${fracLatex(p)}$`],
    };
  }),
  variante('prise-en-charge', (rng, level) => {
    const { p, x1, x2, y1, y2 } = tarif(rng, level);
    return {
      prompt: `Le prix d'une course de taxi est une fonction affine de la distance. Une course de $${x1}$ km coûte $${dec(y1)}$ € et une course de $${x2}$ km coûte $${dec(y2)}$ €. Quel est le montant de la prise en charge (le prix pour $0$ km), en € ?`,
      answer: { kind: 'number', value: frac(p) },
      hint: 'Trouve d’abord le prix d’un kilomètre, puis retire-le autant de fois que nécessaire.',
      correction: [`Prix d'un kilomètre : $\\frac{${dec(y2)} - ${dec(y1)}}{${x2 - x1}} = ${dec((y2 - y1) / (x2 - x1))}$ €.`, `Prise en charge : $${dec(y1)} - ${dec((y2 - y1) / (x2 - x1))} \\times ${x1} = ${p}$ €.`],
    };
  }),
];

const equationReduiteVariantes = [
  variante('coef-et-point', (rng, level) => {
    const m = level === 3 ? frac(rng.nonZero(-5, 5), rng.pick([2, 3])) : frac(rng.nonZero(-5, 5));
    const xA = m.d * rng.int(-3, 3);
    const yA = rng.int(-8, 8);
    const p = frac(yA * m.d - m.n * xA, m.d);
    const correct = reduite(m, p);
    return {
      prompt: `Quelle est l'équation réduite de la droite de coefficient directeur $${fracLatex(m)}$ passant par $${P('A', [xA, yA])}$ ?`,
      answer: latexChoice(rng, correct, [reduite(m, frac(yA)), reduite(frac(-m.n, m.d), p), reduite(m, frac(-p.n, p.d)), reduite(frac(yA), m)], () => reduite(m, frac(p.n + rng.nonZero(-3, 3) * p.d, p.d))),
      hint: 'Écris $y = mx + p$, puis trouve $p$ grâce aux coordonnées de $A$.',
      correction: [`$${yA} = ${fracLatex(m)} \\times ${par(xA)} + p$ donc $p = ${fracLatex(p)}$.`, `$${correct}$`],
    };
  }),
  variante('parallele-axe', (rng) => {
    const A: Pt = [rng.nonZero(-7, 7), rng.nonZero(-7, 7)];
    if (A[0] === A[1]) A[1] = -A[1];
    const axe = rng.pick(['abscisses', 'ordonnées'] as const);
    const correct = axe === 'abscisses' ? `y = ${A[1]}` : `x = ${A[0]}`;
    return {
      prompt: `Quelle est l'équation de la droite parallèle à l'axe des ${axe} passant par $${P('A', A)}$ ?`,
      answer: latexChoice(rng, correct, [`y = ${A[0]}`, `x = ${A[1]}`, axe === 'abscisses' ? `x = ${A[0]}` : `y = ${A[1]}`], () => `y = ${A[1] + 1}`),
      hint: axe === 'abscisses' ? 'Sur une droite horizontale, tous les points ont la même ordonnée.' : 'Sur une droite verticale, tous les points ont la même abscisse.',
      correction: [axe === 'abscisses' ? `Tous les points ont pour ordonnée $${A[1]}$ : $${correct}$.` : `Tous les points ont pour abscisse $${A[0]}$ : $${correct}$.`],
    };
  }),
];

const appartenanceVariantes = [
  variante('trouver-ordonnee', (rng, level) => {
    const m = level === 3 ? frac(rng.nonZero(-5, 5), 2) : frac(rng.nonZero(-5, 5));
    const p = rng.int(-9, 9);
    const x = rng.int(-6, 6) * m.d;
    const y = frac(m.n * x + p * m.d, m.d);
    return {
      prompt: `Le point $C$ d'abscisse $${x}$ appartient à la droite $${reduite(m, frac(p))}$. Quelle est son ordonnée ?`,
      answer: { kind: 'number', value: y },
      hint: 'Remplace $x$ par l’abscisse de $C$ dans l’équation.',
      correction: [`$y_C = ${fracLatex(m)} \\times ${par(x)} ${p < 0 ? '-' : '+'} ${Math.abs(p)} = ${fracLatex(y)}$`],
    };
  }),
  variante('trouver-abscisse', (rng, level) => {
    const m = rng.nonZero(-5, 5);
    const p = rng.int(-9, 9);
    const x = level === 3 ? frac(rng.nonZero(-9, 9), Math.abs(m)) : frac(rng.int(-6, 6));
    const y = (m * x.n) / x.d + p;
    return {
      prompt: `Le point $D$ d'ordonnée $${y}$ appartient à la droite $${reduite(frac(m), frac(p))}$. Quelle est son abscisse ?`,
      answer: { kind: 'number', value: x },
      hint: 'Remplace $y$ par l’ordonnée de $D$ et résous l’équation d’inconnue $x$.',
      correction: [`$${y} = ${terms([[m, 'x'], [p, '']])}$`, `$x = \\frac{${y - p}}{${m}} = ${fracLatex(x)}$`],
    };
  }),
];

const vecteurDirecteurVariantes = [
  variante('deux-points', (rng) => {
    const A: Pt = [rng.int(-6, 6), rng.int(-6, 6)];
    let B: Pt = [rng.int(-6, 6), rng.int(-6, 6)];
    if (B[0] === A[0] && B[1] === A[1]) B = [A[0] + 2, A[1] - 1];
    return {
      prompt: `Donne les coordonnées du vecteur directeur $\\overrightarrow{AB}$ de la droite $(AB)$, avec $${P('A', A)}$ et $${P('B', B)}$.`,
      answer: { kind: 'pair', values: [frac(B[0] - A[0]), frac(B[1] - A[1])], labels: ['x', 'y'] },
      hint: '$\\overrightarrow{AB}(x_B - x_A\\,;\\,y_B - y_A)$',
      correction: [`$\\overrightarrow{AB}(${B[0]} - ${par(A[0])}\\,;\\,${B[1]} - ${par(A[1])}) = (${B[0] - A[0]}\\,;\\,${B[1] - A[1]})$`],
    };
  }),
  variante('depuis-reduite', (rng, level) => {
    const m = level === 3 ? frac(rng.nonZero(-7, 7), rng.pick([2, 3])) : frac(rng.nonZero(-6, 6));
    const p = frac(rng.int(-9, 9));
    return {
      prompt: `La droite d'équation $${reduite(m, p)}$ a un vecteur directeur de la forme $\\vec{u}(1\\,;\\,k)$. Que vaut $k$ ?`,
      answer: { kind: 'number', value: m },
      hint: 'Quand $x$ augmente de 1, $y$ augmente du coefficient directeur.',
      correction: [`Un vecteur directeur de $y = mx + p$ est $\\vec{u}(1\\,;\\,m)$.`, `Ici $k = ${fracLatex(m)}$.`],
    };
  }),
];

const cartesienneVariantes = [
  variante('vers-cartesienne', (rng, level) => {
    const m = level === 1 ? frac(rng.nonZero(-5, 5)) : frac(rng.nonZero(-5, 5), rng.pick([1, 2, 3]));
    const p = frac(rng.int(-9, 9));
    // y = (n/d)x + p ⇔ n x - d y + d p = 0
    const a = m.n;
    const b = -m.d;
    const c = m.d * p.n;
    const eq = (x: number, y: number, z: number) => `${terms([[x, 'x'], [y, 'y'], [z, '']])} = 0`;
      // Un leurre proportionnel à (a ; b ; c) serait aussi une bonne réponse : on l'écarte.
      const leurres: [number, number, number][] = [[a, -b, c], [a, b, -c], [b, a, c], [a, b, c + 1]];
      const memeDroite = ([x, y, z]: [number, number, number]) => x * b === y * a && x * c === z * a && y * c === z * b;
      return {
        prompt: `Quelle équation cartésienne représente la droite d'équation réduite $${reduite(m, p)}$ ?`,
        answer: latexChoice(rng, eq(a, b, c), leurres.filter((l) => !memeDroite(l)).map((l) => eq(...l)), () => eq(a + 1, b, c)),
      hint: 'Multiplie par le dénominateur si besoin, puis passe tout du même côté.',
      correction: [`$${reduite(m, p)}$ équivaut à $${eq(a, b, c)}$.`],
    };
  }),
  variante('trouver-c', (rng) => {
    const a = rng.nonZero(-5, 5);
    const b = rng.nonZero(-5, 5);
    const A: Pt = [rng.int(-6, 6), rng.int(-6, 6)];
    const c = -(a * A[0] + b * A[1]);
    return {
      prompt: `Pour quelle valeur de $c$ la droite d'équation $${terms([[a, 'x'], [b, 'y']])} + c = 0$ passe-t-elle par $${P('A', A)}$ ?`,
      answer: { kind: 'number', value: frac(c) },
      hint: 'Remplace $x$ et $y$ par les coordonnées de $A$, puis résous en $c$.',
      correction: [`$${a} \\times ${par(A[0])} + ${par(b)} \\times ${par(A[1])} + c = 0$`, `$${a * A[0] + b * A[1]} + c = 0$ donc $c = ${c}$.`],
    };
  }),
];

export const DROITES_SKILLS: Skill[] = [
  varier(coefDirecteur, coefDirecteurVariantes),
  varier(ordonneeOrigine, ordonneeOrigineVariantes),
  varier(equationReduite, equationReduiteVariantes),
  varier(appartenance, appartenanceVariantes),
  varier(vecteurDirecteur, vecteurDirecteurVariantes),
  varier(cartesienneReduite, cartesienneVariantes),
];
