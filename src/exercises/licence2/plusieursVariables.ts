import { sumLatex } from '../latex';
import type { Rng } from '../rng';
import type { Skill } from '../types';
import { fixedChoice, num, pairOf, par, skill } from './util';

/** Chapitre « Fonctions de plusieurs variables » (L2). */

/** Polynôme en x, y : liste de termes c·x^i·y^j. */
type Poly2 = [number, number, number][];

const p2Tex = (p: Poly2) =>
  sumLatex(p.map(([c, i, j]) => [c, `${i === 0 ? '' : i === 1 ? 'x' : `x^{${i}}`}${j === 0 ? '' : j === 1 ? 'y' : `y^{${j}}`}`] as [number, string]));

const evalP = (p: Poly2, x: number, y: number) => p.reduce((s, [c, i, j]) => s + c * x ** i * y ** j, 0);
const dx = (p: Poly2): Poly2 => p.filter(([, i]) => i > 0).map(([c, i, j]) => [c * i, i - 1, j]);
const dy = (p: Poly2): Poly2 => p.filter(([, , j]) => j > 0).map(([c, i, j]) => [c * j, i, j - 1]);

function randomPoly(rng: Rng, level: number): Poly2 {
  const maxDeg = level === 1 ? 2 : 3;
  const terms: Poly2 = [];
  const seen = new Set<string>();
  const count = level === 1 ? 3 : 4;
  while (terms.length < count) {
    const i = rng.int(0, maxDeg);
    const j = rng.int(0, maxDeg - i);
    if (i + j === 0 || seen.has(`${i},${j}`)) continue;
    seen.add(`${i},${j}`);
    terms.push([rng.nonZero(-4, 4), i, j]);
  }
  // Au moins un terme qui dépend des deux variables.
  if (!terms.some(([, i, j]) => i > 0 && j > 0)) terms[terms.length - 1] = [rng.nonZero(-3, 3), 1, 1];
  return terms;
}

const partielle = skill('l2-derivee-partielle', 'Calculer une dérivée partielle', (rng, level) => {
  const p = randomPoly(rng, level);
  const [a, b] = [rng.int(-2, 2), rng.int(-2, 2)];
  const inX = rng.next() < 0.5;
  const d = inX ? dx(p) : dy(p);
  const v = evalP(d, a, b);
  const name = inX ? '\\frac{\\partial f}{\\partial x}' : '\\frac{\\partial f}{\\partial y}';
  return {
    prompt: `$f(x, y) = ${p2Tex(p)}$. Calcule $\\dfrac{\\partial f}{\\partial ${inX ? 'x' : 'y'}}(${a}, ${b})$.`,
    answer: num(v),
    hint: `Dérive par rapport à $${inX ? 'x' : 'y'}$ en considérant $${inX ? 'y' : 'x'}$ comme une constante.`,
    correction: [`$${name}(x, y) = ${p2Tex(d)}$`, `$${name}(${a}, ${b}) = ${v}$`],
  };
});

const gradient = skill('l2-gradient', 'Calculer un gradient', (rng, level) => {
  const p = randomPoly(rng, level);
  const [a, b] = [rng.int(-2, 2), rng.int(-2, 2)];
  const gx = evalP(dx(p), a, b);
  const gy = evalP(dy(p), a, b);
  return {
    prompt: `$f(x, y) = ${p2Tex(p)}$. Donne les coordonnées de $\\nabla f(${a}, ${b})$.`,
    answer: pairOf(gx, gy, ['∂f/∂x', '∂f/∂y']),
    hint: '$\\nabla f = \\left(\\dfrac{\\partial f}{\\partial x}, \\dfrac{\\partial f}{\\partial y}\\right)$',
    correction: [`$\\dfrac{\\partial f}{\\partial x} = ${p2Tex(dx(p))}$ et $\\dfrac{\\partial f}{\\partial y} = ${p2Tex(dy(p))}$`, `$\\nabla f(${a}, ${b}) = (${gx}\\,;\\,${gy})$`],
  };
});

/** f = αx² + βxy + γy² + cx + dy dont le point critique est (p, q). */
function quadratic(rng: Rng, level: number) {
  let al: number;
  let be: number;
  let ga: number;
  do {
    al = rng.nonZero(-3, 3);
    be = level === 1 ? 0 : rng.int(-3, 3);
    ga = rng.nonZero(-3, 3);
  } while (4 * al * ga - be * be === 0);
  const p = rng.int(-3, 3);
  const q = rng.int(-3, 3);
  const c = -(2 * al * p + be * q);
  const d = -(be * p + 2 * ga * q);
  const f: Poly2 = [
    [al, 2, 0],
    [be, 1, 1],
    [ga, 0, 2],
    [c, 1, 0],
    [d, 0, 1],
  ];
  return { al, be, ga, p, q, f };
}

const critique = skill('l2-point-critique', 'Trouver un point critique', (rng, level) => {
  const { p, q, f } = quadratic(rng, level);
  return {
    prompt: `Donne les coordonnées de l’unique point critique de $f(x, y) = ${p2Tex(f)}$.`,
    answer: pairOf(p, q, ['x', 'y']),
    hint: 'Un point critique annule le gradient : résous $\\frac{\\partial f}{\\partial x} = 0$ et $\\frac{\\partial f}{\\partial y} = 0$.',
    correction: [`$\\dfrac{\\partial f}{\\partial x} = ${p2Tex(dx(f))} = 0$ et $\\dfrac{\\partial f}{\\partial y} = ${p2Tex(dy(f))} = 0$`, `Solution : $(${p}\\,;\\,${q})$`],
  };
});

const NATURES = ['Minimum local', 'Maximum local', 'Point col (selle)', 'On ne peut pas conclure'];

const nature = skill('l2-nature-point-critique', 'Déterminer la nature d’un point critique', (rng, level) => {
  const { al, be, ga, p, q, f } = quadratic(rng, level);
  const [r, s, t] = [2 * al, be, 2 * ga];
  const delta = r * t - s * s;
  const kind = delta < 0 ? 2 : r > 0 ? 0 : 1;
  return {
    prompt: `$f(x, y) = ${p2Tex(f)}$ a un point critique en $(${p}, ${q})$. Quelle est sa nature ?`,
    answer: fixedChoice(NATURES, kind),
    hint: 'Avec $r = \\frac{\\partial^2 f}{\\partial x^2}$, $s = \\frac{\\partial^2 f}{\\partial x\\partial y}$, $t = \\frac{\\partial^2 f}{\\partial y^2}$ : $rt - s^2 > 0$ donne un extremum (minimum si $r > 0$), $rt - s^2 < 0$ un col.',
    correction: [`$r = ${r}$, $s = ${s}$, $t = ${t}$, donc $rt - s^2 = ${delta}$.`, `${NATURES[kind]}.`],
  };
});

const directionnelle = skill('l2-derivee-directionnelle', 'Dériver le long d’une courbe ou d’une direction', (rng, level) => {
  const p = randomPoly(rng, level);
  const [a, b] = [rng.int(-2, 2), rng.int(-2, 2)];
  const gx = evalP(dx(p), a, b);
  const gy = evalP(dy(p), a, b);
  if (level === 3) {
    // g(t) = f(a + ut, b + wt) : g′(0) = u ∂f/∂x + w ∂f/∂y
    const u = rng.nonZero(-3, 3);
    const w = rng.nonZero(-3, 3);
    return {
      prompt: `$f(x, y) = ${p2Tex(p)}$ et $g(t) = f(${sumLatex([[a, ''], [u, 't']])}, ${sumLatex([[b, ''], [w, 't']])})$. Calcule $g'(0)$.`,
      answer: num(u * gx + w * gy),
      hint: 'Règle de la chaîne : $g\'(t) = x\'(t)\\frac{\\partial f}{\\partial x} + y\'(t)\\frac{\\partial f}{\\partial y}$.',
      correction: [`$\\nabla f(${a}, ${b}) = (${gx}\\,;\\,${gy})$`, `$g'(0) = ${u}\\times ${par(gx)} + ${par(w)}\\times ${par(gy)} = ${u * gx + w * gy}$`],
    };
  }
  const h = rng.int(-2, 2);
  const k = rng.nonZero(-2, 2);
  return {
    prompt: `$f(x, y) = ${p2Tex(p)}$. Calcule la différentielle $df_{(${a}, ${b})}(${h}, ${k})$.`,
    answer: num(h * gx + k * gy),
    hint: '$df_{(a,b)}(h, k) = h\\,\\frac{\\partial f}{\\partial x}(a, b) + k\\,\\frac{\\partial f}{\\partial y}(a, b)$',
    correction: [`$\\nabla f(${a}, ${b}) = (${gx}\\,;\\,${gy})$`, `$df(${h}, ${k}) = ${par(h)}\\times ${par(gx)} + ${par(k)}\\times ${par(gy)} = ${h * gx + k * gy}$`],
  };
});

export const PLUSIEURS_VARIABLES_SKILLS: Skill[] = [partielle, gradient, critique, nature, directionnelle];
