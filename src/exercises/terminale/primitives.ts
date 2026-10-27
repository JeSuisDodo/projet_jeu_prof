import type { Skill } from '../types';
import { enrich, variant } from '../variantes';
import { F, add, choiceTex, fixedChoice, mul, num, numF, plus, poly, skill, sub, tex } from './util';
import type { Frac } from '../fraction';

/** Chapitre « Primitives et équations différentielles » (Terminale spécialité). */

/** Primitive d'un polynôme à coefficients entiers (du plus haut degré au terme constant), constante nulle. */
export function primitiveCoefs(c: number[]): Frac[] {
  const deg = c.length - 1;
  return [...c.map((v, i) => F(v, deg - i + 1)), F(0)];
}

export const evalFrac = (coefs: Frac[], x: number) => coefs.reduce((s, v, i) => add(s, mul(v, F(x ** (coefs.length - 1 - i)))), F(0));

/** Polynôme à coefficients rationnels en LaTeX. */
export function polyFrac(coefs: Frac[], v = 'x'): string {
  let out = '';
  coefs.forEach((c, i) => {
    if (c.n === 0) return;
    const p = coefs.length - 1 - i;
    const abs = { n: Math.abs(c.n), d: c.d };
    const coef = p > 0 && abs.n === 1 && abs.d === 1 ? '' : tex(abs);
    const vp = p === 0 ? '' : p === 1 ? v : `${v}^{${p}}`;
    const sign = c.n < 0 ? (out ? ' - ' : '-') : out ? ' + ' : '';
    out += `${sign}${coef}${vp}`;
  });
  return out || '0';
}

const primitivePoly = skill('tle-primitive-polynome', 'Trouver la primitive qui vérifie une condition', (rng, level) => {
  const c = [rng.nonZero(-3, 3) * (level === 1 ? 2 : 1), rng.int(-5, 5)];
  if (level > 1) c.unshift(rng.nonZero(-2, 2) * 3);
  const P = primitiveCoefs(c);
  const y0 = rng.int(-5, 5);
  const x1 = rng.int(1, 3);
  // F(x) = P(x) + y0, de sorte que F(0) = y0.
  const value = add(evalFrac(P, x1), F(y0));
  return {
    prompt: `$F$ est la primitive de $f(x) = ${poly(c)}$ sur $\\mathbb{R}$ telle que $F(0) = ${y0}$. Calcule $F(${x1})$.`,
    answer: numF(value),
    hint: 'Une primitive de $x^n$ est $\\frac{x^{n+1}}{n+1}$ ; la constante se trouve avec la condition $F(0)$.',
    correction: [`$F(x) = ${polyFrac(P)} + k$ et $F(0) = k = ${y0}$.`, `$F(${x1}) = ${tex(evalFrac(P, x1))}${plus(y0)} = ${tex(value)}$`],
  };
});

const formes = skill('tle-primitive-forme', 'Reconnaître une forme usuelle de primitive', (rng) => {
  const a = rng.int(2, 6);
  const b = rng.int(1, 5);
  const cases = [
    { f: `${2 * a}xe^{${a}x^2}`, F: `e^{${a}x^2}`, d: [`${a}x^2e^{${a}x^2}`, `${2 * a}e^{${a}x^2}`, `\\frac{e^{${a}x^2}}{${a}}`] },
    { f: `\\frac{${a}}{${a}x + ${b}}`, F: `\\ln(${a}x + ${b})`, d: [`\\frac{1}{${a}}\\ln(${a}x + ${b})`, `${a}\\ln(${a}x + ${b})`, `-\\frac{${a}}{(${a}x + ${b})^2}`] },
    { f: `e^{${a}x}`, F: `\\frac{1}{${a}}e^{${a}x}`, d: [`${a}e^{${a}x}`, `e^{${a}x}`, `\\frac{1}{${a + 1}}e^{${a + 1}x}`] },
    { f: `${a}(${a}x + ${b})^{${b + 1}}`, F: `\\frac{(${a}x + ${b})^{${b + 2}}}{${b + 2}}`, d: [`(${a}x + ${b})^{${b + 2}}`, `\\frac{(${a}x + ${b})^{${b}}}{${b}}`, `${a}(${a}x + ${b})^{${b + 2}}`] },
    { f: `\\cos(${a}x)`, F: `\\frac{1}{${a}}\\sin(${a}x)`, d: [`${a}\\sin(${a}x)`, `-\\frac{1}{${a}}\\sin(${a}x)`, `\\sin(${a}x)`] },
    { f: `\\frac{${2 * a}x}{x^2 + ${b}}`, F: `${a}\\ln(x^2 + ${b})`, d: [`\\ln(x^2 + ${b})`, `${2 * a}\\ln(x^2 + ${b})`, `\\frac{${a}}{x^2 + ${b}}`] },
  ];
  const c = rng.pick(cases);
  return {
    prompt: `Quelle fonction est une primitive de $f(x) = ${c.f}$ ?`,
    answer: choiceTex(rng, `F(x) = ${c.F}`, c.d.map((d) => `F(x) = ${d}`), () => `F(x) = ${c.f}`),
    hint: 'Repère une forme $u\'e^u$, $\\frac{u\'}{u}$ ou $u\'u^n$, puis vérifie en dérivant ta réponse.',
    correction: [`On vérifie en dérivant : $\\left(${c.F}\\right)' = ${c.f}$.`],
  };
});

const exponentielle = skill('tle-equadiff-homogene', 'Résoudre y′ = ay avec une condition initiale', (rng, level) => {
  const a = level === 1 ? rng.int(2, 4) : rng.nonZero(-4, 4);
  const k = rng.nonZero(-5, 6);
  const front = (c: number) => (c === 1 ? '' : c === -1 ? '-' : String(c));
  const ax = `${front(a)}x`;
  const correct = `y(x) = ${front(k)}e^{${ax}}`;
  return {
    prompt: `Quelle est la solution de $y' = ${front(a)}y$ telle que $y(0) = ${k}$ ?`,
    answer: choiceTex(
      rng,
      correct,
      [`y(x) = ${front(a)}e^{${front(k)}x}`, `y(x) = ${front(k)}e^{${front(-a)}x}`, `y(x) = e^{${ax}}${plus(k - 1)}`, `y(x) = ${front(k * a)}e^{${ax}}`],
      () => `y(x) = ${front(k + 1)}e^{${ax}}`,
    ),
    hint: 'Les solutions de $y\' = ay$ sont les fonctions $x \\mapsto Ce^{ax}$.',
    correction: [`$y(x) = Ce^{${ax}}$ et $y(0) = C = ${k}$.`, `$${correct}$`],
  };
});

const constante = skill('tle-equadiff-constante', 'Trouver la solution constante de y′ = ay + b', (rng) => {
  const a = rng.nonZero(-5, 5);
  const b = rng.nonZero(-9, 9);
  const c = F(-b, a);
  return {
    prompt: `Quelle est la solution constante de l’équation différentielle $y' = ${a === 1 ? '' : a === -1 ? '-' : a}y${plus(b)}$ ?`,
    answer: numF(c),
    hint: 'Une fonction constante a une dérivée nulle : résous $0 = ay + b$.',
    correction: [`$0 = ${a}y${plus(b)}$ donne $y = -\\frac{b}{a} = ${tex(c)}$.`],
  };
});

const generale = skill('tle-equadiff-generale', 'Donner les solutions de y′ = ay + b', (rng) => {
  const a = rng.nonZero(-4, 4);
  const p = rng.nonZero(-5, 5);
  const b = -a * p; // p = -b/a est la solution particulière constante
  const front = (c: number) => (c === 1 ? '' : c === -1 ? '-' : String(c));
  const ax = `${front(a)}x`;
  const correct = `y(x) = Ce^{${ax}}${plus(p)}`;
  return {
    prompt: `Quelles sont les solutions sur $\\mathbb{R}$ de $y' = ${front(a)}y${plus(b)}$ ? ($C$ est une constante réelle.)`,
    answer: choiceTex(
      rng,
      correct,
      [`y(x) = Ce^{${ax}}${plus(-p)}`, `y(x) = Ce^{${front(-a)}x}${plus(p)}`, `y(x) = Ce^{${ax}}${plus(b)}`, `y(x) = Ce^{${front(b)}x}${plus(a)}`],
      () => `y(x) = Ce^{${ax}}${plus(p + 1)}`,
    ),
    hint: 'Solution générale = solution générale de $y\' = ay$ + une solution particulière (la constante $-\\frac{b}{a}$).',
    correction: [`Solution constante : $0 = ${a}y${plus(b)}$, soit $y = ${p}$.`, `Solutions de $y' = ${front(a)}y$ : $Ce^{${ax}}$.`, `Donc $${correct}$.`],
  };
});

const condition = skill('tle-equadiff-condition', 'Trouver la constante avec une condition initiale', (rng) => {
  // y' = a y + b, y(0) = y0 : y = (y0 - p) e^{ax} + p, avec p = -b/a. On demande C = y0 - p.
  const a = rng.nonZero(-3, 3);
  const p = rng.int(-6, 6);
  const b = -a * p;
  const y0 = rng.int(-6, 6);
  const C = y0 - p;
  const front = (c: number) => (c === 1 ? '' : c === -1 ? '-' : String(c));
  return {
    prompt: `Les solutions de $y' = ${front(a)}y${plus(b)}$ sont $y(x) = Ce^{${front(a)}x}${plus(p)}$. Quelle valeur de $C$ donne $y(0) = ${y0}$ ?`,
    answer: numF(F(C)),
    hint: 'Remplace $x$ par $0$ : $e^0 = 1$.',
    correction: [`$y(0) = C${plus(p)} = ${y0}$`, `$C = ${C}$`],
  };
});

const VF = ['Vrai', 'Faux'];
const front = (c: number) => (c === 1 ? '' : c === -1 ? '-' : String(c));
/** « - 3y », « + y » : terme ajouté. */
const terme = (c: number, e: string) => (c === 0 ? '' : ` ${c < 0 ? '-' : '+'} ${Math.abs(c) === 1 ? '' : Math.abs(c)}${e}`);

const primitivePolyVariantes = [
  variant('inverse-carre', (rng) => {
    const a = rng.nonZero(-6, 6);
    const y0 = rng.int(-5, 5);
    const x1 = rng.int(2, 5);
    // F(x) = -a/x + k avec F(1) = y0 : k = y0 + a.
    const value = add(F(-a, x1), F(y0 + a));
    return {
      prompt: `$F$ est la primitive de $f(x) = \\frac{${a}}{x^2}$ sur $]0\\,;\\,+\\infty[$ telle que $F(1) = ${y0}$. Calcule $F(${x1})$ (fraction).`,
      answer: numF(value),
      hint: 'Une primitive de $\\frac{1}{x^2}$ est $-\\frac{1}{x}$.',
      correction: [`$F(x) = -\\frac{${a}}{x} + k$ et $F(1) = ${-a} + k = ${y0}$, donc $k = ${y0 + a}$.`, `$F(${x1}) = ${tex(F(-a, x1))}${plus(y0 + a)} = ${tex(value)}$`],
    };
  }),
  variant('condition-ailleurs', (rng) => {
    const c = [rng.nonZero(-3, 3) * 3, rng.nonZero(-3, 3) * 2, rng.int(-5, 5)];
    const P = primitiveCoefs(c);
    const x1 = rng.pick([-1, 1, 2]);
    const y1 = rng.int(-6, 6);
    const value = sub(F(y1), evalFrac(P, x1));
    return {
      prompt: `$F$ est la primitive de $f(x) = ${poly(c)}$ sur $\\mathbb{R}$ telle que $F(${x1}) = ${y1}$. Calcule $F(0)$.`,
      answer: numF(value),
      hint: 'Écris $F(x) = (\\text{primitive sans constante}) + k$, puis trouve $k$ avec la condition.',
      correction: [`$F(x) = ${polyFrac(P)} + k$.`, `$F(${x1}) = ${tex(evalFrac(P, x1))} + k = ${y1}$, donc $k = ${tex(value)}$.`, `$F(0) = k = ${tex(value)}$`],
    };
  }),
];

/** Formes usuelles supplémentaires : f, sa primitive F et des leurres. */
function autresFormes(a: number, b: number) {
  return [
    { f: `\\sin(${a}x)`, F: `-\\frac{1}{${a}}\\cos(${a}x)`, d: [`\\frac{1}{${a}}\\cos(${a}x)`, `-${a}\\cos(${a}x)`, `\\cos(${a}x)`] },
    { f: `\\frac{${a}}{x^2}`, F: `-\\frac{${a}}{x}`, d: [`\\frac{${a}}{x}`, `${a}\\ln(x^2)`, `-\\frac{${2 * a}}{x^3}`] },
    { f: `\\frac{${a}}{\\sqrt{${a}x + ${b}}}`, F: `2\\sqrt{${a}x + ${b}}`, d: [`\\sqrt{${a}x + ${b}}`, `${2 * a}\\sqrt{${a}x + ${b}}`, `\\frac{1}{2}\\sqrt{${a}x + ${b}}`] },
    { f: `xe^{x^2}`, F: `\\frac{1}{2}e^{x^2}`, d: [`e^{x^2}`, `2e^{x^2}`, `\\frac{x^2}{2}e^{x^2}`] },
    { f: `\\frac{1}{x}${plus(a)}`, F: `\\ln(x)${terme(a, 'x')}`, d: [`-\\frac{1}{x^2}${terme(a, 'x')}`, `\\ln(x)${plus(a)}`, `\\frac{1}{x}${terme(a, 'x')}`] },
  ];
}

const formesVariantes = [
  variant('autres-formes', (rng) => {
    const c = rng.pick(autresFormes(rng.int(2, 6), rng.int(1, 5)));
    return {
      prompt: `Quelle fonction est une primitive de $f(x) = ${c.f}$ sur $]0\\,;\\,+\\infty[$ ?`,
      answer: choiceTex(rng, `F(x) = ${c.F}`, c.d.map((d) => `F(x) = ${d}`), () => `F(x) = ${c.f}`),
      hint: 'Vérifie chaque proposition en la dérivant.',
      correction: [`On vérifie en dérivant : $\\left(${c.F}\\right)' = ${c.f}$.`],
    };
  }),
  variant('verifier', (rng) => {
    const c = rng.pick(autresFormes(rng.int(2, 6), rng.int(1, 5)));
    const ok = rng.next() < 0.5;
    const G = ok ? c.F : rng.pick(c.d);
    return {
      prompt: `Vrai ou faux : $F(x) = ${G}$ est une primitive de $f(x) = ${c.f}$ sur $]0\\,;\\,+\\infty[$.`,
      answer: fixedChoice(VF, ok ? 0 : 1),
      hint: 'Dérive $F$ et compare avec $f$.',
      correction: [ok ? `$F'(x) = ${c.f}$ : c’est vrai.` : `Une primitive de $f$ est $${c.F}$ ; la dérivée de $${G}$ n’est pas $f$. C’est faux.`],
    };
  }),
];

const exponentielleVariantes = [
  variant('derivee-en-zero', (rng) => {
    const a = rng.nonZero(-5, 5);
    const k = rng.nonZero(-6, 6);
    return {
      prompt: `$f$ est la solution de $y' = ${front(a)}y$ telle que $f(0) = ${k}$. Calcule $f'(0)$.`,
      answer: num(a * k),
      hint: 'Pas besoin de résoudre : l’équation donne directement $f\'(0)$ en fonction de $f(0)$.',
      correction: [`$f'(0) = ${a}\\times f(0) = ${a}\\times ${k < 0 ? `(${k})` : k} = ${a * k}$`],
    };
  }),
  variant('vrai-faux', (rng) => {
    const a = rng.nonZero(-4, 4);
    const c = rng.nonZero(-5, 5);
    const ok = rng.next() < 0.5;
    const b = ok ? a : rng.pick([-a, c === a ? a + 1 : c, a + 1].filter((v) => v !== a && v !== 0));
    return {
      prompt: `Vrai ou faux : la fonction $y(x) = ${front(c)}e^{${front(b)}x}$ est solution de $y' = ${front(a)}y$.`,
      answer: fixedChoice(VF, ok ? 0 : 1),
      hint: 'Les solutions de $y\' = ay$ sont les $Ce^{ax}$, quel que soit $C$.',
      correction: [ok ? `$y'(x) = ${a * c}e^{${front(b)}x} = ${a}y(x)$ : c’est vrai.` : `$y'(x) = ${b * c}e^{${front(b)}x} = ${b}y(x)$, pas $${a}y(x)$ : c’est faux.`],
    };
  }),
];

const constanteVariantes = [
  variant('verifier', (rng) => {
    const a = rng.nonZero(-5, 5);
    const v = rng.nonZero(-5, 5);
    const ok = rng.next() < 0.5;
    const b = ok ? -a * v : rng.pick([a * v, -a * v + rng.nonZero(-3, 3)]);
    return {
      prompt: `Vrai ou faux : la fonction constante $y = ${v}$ est solution de $y' = ${front(a)}y${plus(b)}$.`,
      answer: fixedChoice(VF, ok ? 0 : 1),
      hint: 'Pour une constante, $y\' = 0$ : vérifie si $ay + b = 0$.',
      correction: [`$${a}\\times ${v < 0 ? `(${v})` : v}${plus(b)} = ${a * v + b}$ : c’est ${ok ? 'vrai' : 'faux'}.`],
    };
  }),
  variant('forme-developpee', (rng) => {
    const p = rng.int(1, 4);
    const q = rng.nonZero(-6, 6);
    const r = rng.nonZero(-12, 12);
    const value = F(r, q);
    return {
      prompt: `Quelle est la solution constante de l’équation différentielle $${front(p)}y'${terme(q, 'y')} = ${r}$ ?`,
      answer: numF(value),
      hint: 'Pour une fonction constante, $y\' = 0$.',
      correction: [`$${q}y = ${r}$, donc $y = ${tex(value)}$.`],
    };
  }),
];

const generaleVariantes = [
  variant('forme-developpee', (rng) => {
    const a = rng.nonZero(-4, 4);
    const p = rng.nonZero(-5, 5);
    const b = -a * p;
    const ax = `${front(a)}x`;
    const correct = `y(x) = Ce^{${ax}}${plus(p)}`;
    return {
      prompt: `Quelles sont les solutions sur $\\mathbb{R}$ de $y'${terme(-a, 'y')} = ${b}$ ? ($C$ est une constante réelle.)`,
      answer: choiceTex(rng, correct, [`y(x) = Ce^{${front(-a)}x}${plus(p)}`, `y(x) = Ce^{${ax}}${plus(-p)}`, `y(x) = Ce^{${ax}}${plus(b)}`], () => `y(x) = Ce^{${ax}}${plus(p + 1)}`),
      hint: `Réécris l’équation sous la forme $y' = ay + b$.`,
      correction: [`$y' = ${front(a)}y${plus(b)}$ : solution constante $${p}$.`, `$${correct}$`],
    };
  }),
  variant('homogene-signe', (rng) => {
    const a = rng.nonZero(-5, 5);
    const correct = `y(x) = Ce^{${front(-a)}x}`;
    return {
      prompt: `Quelles sont les solutions sur $\\mathbb{R}$ de $y'${terme(a, 'y')} = 0$ ? ($C$ est une constante réelle.)`,
      answer: choiceTex(rng, correct, [`y(x) = Ce^{${front(a)}x}`, `y(x) = e^{${front(-a)}x} + C`, `y(x) = Ce^{${front(-a)}x}${plus(a)}`], () => `y(x) = Ce^{x}`),
      hint: `L’équation s’écrit $y' = ${front(-a)}y$.`,
      correction: [`$y' = ${front(-a)}y$, donc $${correct}$.`],
    };
  }),
];

const conditionVariantes = [
  variant('derivee-initiale', (rng) => {
    const a = rng.nonZero(-4, 4);
    const p = rng.int(-6, 6);
    const v = rng.nonZero(-9, 9);
    const value = F(v, a);
    return {
      prompt: `Les solutions de $y' = ${front(a)}y${plus(-a * p)}$ sont $y(x) = Ce^{${front(a)}x}${plus(p)}$. Quelle valeur de $C$ donne $y'(0) = ${v}$ (fraction) ?`,
      answer: numF(value),
      hint: 'Dérive : $y\'(x) = aCe^{ax}$, puis remplace $x$ par $0$.',
      correction: [`$y'(0) = ${a}C = ${v}$`, `$C = ${tex(value)}$`],
    };
  }),
  variant('limite', (rng) => {
    const a = -rng.int(1, 4);
    const p = rng.nonZero(-8, 8);
    const C = rng.nonZero(-6, 6);
    return {
      prompt: `$y(x) = ${front(C)}e^{${front(a)}x}${plus(p)}$ est solution de $y' = ${front(a)}y${plus(-a * p)}$. Quelle est la limite de $y(x)$ quand $x \\to +\\infty$ ?`,
      answer: num(p),
      hint: `Comme $${a} < 0$, $e^{${front(a)}x} \\to 0$.`,
      correction: [`$e^{${front(a)}x} \\to 0$, donc $y(x) \\to ${p}$ : la solution tend vers la solution constante.`],
    };
  }),
];

export const PRIMITIVES_SKILLS: Skill[] = [
  enrich(primitivePoly, primitivePolyVariantes),
  enrich(formes, formesVariantes),
  enrich(exponentielle, exponentielleVariantes),
  enrich(constante, constanteVariantes),
  enrich(generale, generaleVariantes),
  enrich(condition, conditionVariantes),
];
