import type { Skill } from '../types';
import { choiceTex, dec, decimal, deg, nearTie, num, rad, round, skill } from './outils';

/** 3e : cosinus, sinus et tangente d'un angle aigu dans un triangle rectangle. */

type Fn = 'cos' | 'sin' | 'tan';
const NAME: Record<Fn, string> = { cos: '\\cos', sin: '\\sin', tan: '\\tan' };
const F: Record<Fn, (x: number) => number> = { cos: Math.cos, sin: Math.sin, tan: Math.tan };
const RULE = '$\\cos = \\frac{\\text{adjacent}}{\\text{hypoténuse}}$, $\\sin = \\frac{\\text{opposé}}{\\text{hypoténuse}}$, $\\tan = \\frac{\\text{opposé}}{\\text{adjacent}}$';

/** Triangle ABC rectangle en A, angle étudié en B : adjacent AB, opposé AC, hypoténuse BC. */
const SIDES = { adj: 'AB', opp: 'AC', hyp: 'BC' };

const formule = skill('3e-trigo-formule', 'Choisir la bonne formule de trigonométrie', (rng, level) => {
  const fn = rng.pick(['cos', 'sin', 'tan'] as const);
  // Au niveau 3, l'angle étudié est en C : les rôles d'adjacent et d'opposé s'échangent.
  const atC = level === 3 && rng.next() < 0.5;
  const adj = atC ? 'AC' : 'AB';
  const opp = atC ? 'AB' : 'AC';
  const hyp = 'BC';
  const angle = atC ? '\\widehat{ACB}' : '\\widehat{ABC}';
  const fr = (a: string, b: string) => `\\frac{${a}}{${b}}`;
  const right = fn === 'cos' ? fr(adj, hyp) : fn === 'sin' ? fr(opp, hyp) : fr(opp, adj);
  const all = [fr(adj, hyp), fr(opp, hyp), fr(opp, adj), fr(adj, opp), fr(hyp, adj), fr(hyp, opp)];
  return {
    prompt: `Le triangle $ABC$ est rectangle en $A$. Que vaut $${NAME[fn]} ${angle}$ ?`,
    answer: choiceTex(rng, `${NAME[fn]} ${angle} = ${right}`, all.map((x) => `${NAME[fn]} ${angle} = ${x}`), () => `${NAME[fn]} ${angle} = ${fr(adj, adj)}`),
    hint: `${RULE}. L'hypoténuse est le côté opposé à l'angle droit.`,
    correction: [`Pour l'angle $${angle}$ : côté adjacent $[${adj}]$, côté opposé $[${opp}]$, hypoténuse $[${hyp}]$.`, `$${NAME[fn]} ${angle} = ${right}$`],
  };
});

const longueur = skill('3e-trigo-longueur', 'Calculer une longueur avec la trigonométrie', (rng, level) => {
  let fn: Fn;
  let angle: number;
  let known: number;
  let unknownIsDenominator: boolean;
  let value: number;
  do {
    fn = rng.pick(['cos', 'sin', 'tan'] as const);
    angle = rng.int(level === 1 ? 3 : 2, level === 1 ? 6 : 7) * 10 + (level === 3 ? rng.int(1, 9) : 0);
    known = rng.int(3, 15) + (level === 1 ? 0 : rng.pick([0, 0.5]));
    unknownIsDenominator = level === 3 && rng.next() < 0.5;
    const r = F[fn](rad(angle));
    value = unknownIsDenominator ? known / r : known * r;
  } while (nearTie(value, 1));
  const [num, den] = fn === 'cos' ? ['adj', 'hyp'] : fn === 'sin' ? ['opp', 'hyp'] : ['opp', 'adj'];
  const knownSide = unknownIsDenominator ? SIDES[num as keyof typeof SIDES] : SIDES[den as keyof typeof SIDES];
  const askSide = unknownIsDenominator ? SIDES[den as keyof typeof SIDES] : SIDES[num as keyof typeof SIDES];
  const rounded = round(value, 1);
  return {
    prompt: `Le triangle $ABC$ est rectangle en $A$, avec $\\widehat{ABC} = ${angle}^\\circ$ et $${knownSide} = ${dec(known)}$ cm. Calcule $${askSide}$, arrondie au dixième de cm.`,
    answer: decimal(rounded),
    hint: `${RULE}. Repère les deux côtés en jeu par rapport à l'angle $\\widehat{ABC}$.`,
    correction: [
      `$${NAME[fn]} \\widehat{ABC} = \\frac{${SIDES[num as keyof typeof SIDES]}}{${SIDES[den as keyof typeof SIDES]}}$`,
      unknownIsDenominator
        ? `$${askSide} = \\frac{${dec(known)}}{${NAME[fn]} ${angle}^\\circ} \\approx ${dec(rounded)}$ cm`
        : `$${askSide} = ${dec(known)} \\times ${NAME[fn]} ${angle}^\\circ \\approx ${dec(rounded)}$ cm`,
    ],
  };
});

const angle = skill('3e-trigo-angle', 'Calculer un angle avec la trigonométrie', (rng, level) => {
  let fn: Fn;
  let a: number;
  let b: number;
  let value: number;
  do {
    fn = level === 1 ? 'cos' : rng.pick(['cos', 'sin', 'tan'] as const);
    a = rng.int(2, 12);
    b = fn === 'tan' ? rng.int(2, 12) : a + rng.int(1, 10);
    const r = a / b;
    value = deg(fn === 'cos' ? Math.acos(r) : fn === 'sin' ? Math.asin(r) : Math.atan(r));
  } while (nearTie(value, 0));
  const [top, bottom] = fn === 'cos' ? ['AB', 'BC'] : fn === 'sin' ? ['AC', 'BC'] : ['AC', 'AB'];
  const inv = fn === 'cos' ? '\\arccos' : fn === 'sin' ? '\\arcsin' : '\\arctan';
  return {
    prompt: `Le triangle $ABC$ est rectangle en $A$, avec $${top} = ${a}$ cm et $${bottom} = ${b}$ cm. Calcule $\\widehat{ABC}$, arrondi au degré.`,
    answer: num(round(value)),
    hint: `${RULE}. Puis utilise la touche « ${fn}⁻¹ » (ou « Arc${fn} ») de la calculatrice.`,
    correction: [
      `$${NAME[fn]} \\widehat{ABC} = \\frac{${top}}{${bottom}} = \\frac{${a}}{${b}}$`,
      `$\\widehat{ABC} = ${inv}\\left(\\frac{${a}}{${b}}\\right) \\approx ${round(value)}^\\circ$`,
    ],
  };
});

export const TRIGONOMETRIE_3E: Skill[] = [formule, longueur, angle];
