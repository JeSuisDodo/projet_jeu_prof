import type { Rng } from '../rng';
import type { Level, Skill } from '../types';
import { F, combo, div, fixedChoice, minusT, num, numF, plusT, skill, tex, times } from './util';

/** Chapitre « Calcul différentiel » (Licence 3) : différentielle, jacobienne, inversion locale, fonctions implicites, extrema liés. */

/** Monôme c·x^i·y^j. */
type Term = [number, number, number];

const mono = (i: number, j: number) => `${i === 0 ? '' : i === 1 ? 'x' : `x^{${i}}`}${j === 0 ? '' : j === 1 ? 'y' : `y^{${j}}`}`;
export const polyTex = (p: Term[]) => combo(p.map(([c, i, j]) => [c, mono(i, j)]));
export const evalP = (p: Term[], x: number, y: number) => p.reduce((s, [c, i, j]) => s + c * x ** i * y ** j, 0);
export const dx = (p: Term[]): Term[] => p.filter(([, i]) => i > 0).map(([c, i, j]) => [c * i, i - 1, j]);
export const dy = (p: Term[]): Term[] => p.filter(([, , j]) => j > 0).map(([c, i, j]) => [c * j, i, j - 1]);

const MONOMES: [number, number][] = [
  [2, 0],
  [1, 1],
  [0, 2],
  [2, 1],
  [1, 2],
  [3, 0],
  [1, 0],
  [0, 1],
];

/** Polynôme de deux variables à quelques monômes distincts. */
function randomPoly(rng: Rng, level: Level, count = level + 1): Term[] {
  const pool = level === 1 ? MONOMES.filter(([i, j]) => i + j <= 2) : MONOMES;
  return rng
    .shuffle(pool)
    .slice(0, count)
    .map(([i, j]): Term => [rng.nonZero(-4, 4), i, j]);
}

const pt = (a: number, b: number) => `(${a}, ${b})`;

const differentielle = skill('l3-differentielle', 'Calculer une différentielle en un point', (rng, level) => {
  const p = randomPoly(rng, level);
  const a = rng.int(-2, 2);
  const b = rng.int(-2, 2);
  const h = rng.nonZero(-3, 3);
  const k = rng.nonZero(-3, 3);
  const fx = evalP(dx(p), a, b);
  const fy = evalP(dy(p), a, b);
  const value = fx * h + fy * k;
  return {
    prompt: `Soit $f(x, y) = ${polyTex(p)}$. Calcule $df_{${pt(a, b)}}(${h}, ${k})$.`,
    answer: num(value),
    hint: '$df_{(a,b)}(h, k) = \\frac{\\partial f}{\\partial x}(a,b)\\,h + \\frac{\\partial f}{\\partial y}(a,b)\\,k$.',
    correction: [
      `$\\frac{\\partial f}{\\partial x} = ${polyTex(dx(p))}$ et $\\frac{\\partial f}{\\partial y} = ${polyTex(dy(p))}$.`,
      `En $${pt(a, b)}$ : $\\frac{\\partial f}{\\partial x} = ${fx}$ et $\\frac{\\partial f}{\\partial y} = ${fy}$.`,
      `$df_{${pt(a, b)}}(${h}, ${k}) = ${times(fx, h)}${plusT(times(fy, k))} = ${value}$`,
    ],
  };
});

const jacobien = skill('l3-jacobien', 'Calculer un jacobien', (rng, level) => {
  const P = randomPoly(rng, level, level === 1 ? 2 : 3);
  const Q = randomPoly(rng, level, level === 1 ? 2 : 3);
  const a = rng.int(-2, 2);
  const b = rng.int(-2, 2);
  const m = [evalP(dx(P), a, b), evalP(dy(P), a, b), evalP(dx(Q), a, b), evalP(dy(Q), a, b)];
  const det = m[0] * m[3] - m[1] * m[2];
  return {
    prompt: `Soit $F(x, y) = \\left(${polyTex(P)},\\ ${polyTex(Q)}\\right)$. Calcule le jacobien $\\det J_F$ au point $${pt(a, b)}$.`,
    answer: num(det),
    hint: 'La matrice jacobienne a pour lignes les dérivées partielles de chaque composante.',
    correction: [
      `$J_F${pt(a, b)} = \\begin{pmatrix} ${m[0]} & ${m[1]} \\\\ ${m[2]} & ${m[3]} \\end{pmatrix}$`,
      `$\\det J_F = ${times(m[0], m[3])}${minusT(times(m[1], m[2]))} = ${det}$`,
    ],
  };
});

const inversion = skill('l3-inversion-locale', 'Appliquer le théorème d’inversion locale', (rng) => {
  // F(x, y) = (x² + c y, x + d y), jacobien 2dx - c.
  const a = rng.nonZero(-3, 3);
  const b = rng.int(-3, 3);
  const d = rng.nonZero(-3, 3);
  const singular = rng.next() < 0.5;
  const c = singular ? 2 * a * d : rng.pick([2 * a * d + rng.nonZero(-3, 3), rng.nonZero(-5, 5)]);
  const det = 2 * a * d - c;
  const options = ['Oui, $F$ est un difféomorphisme local en ce point', 'Non, le jacobien y est nul'];
  return {
    prompt: `Soit $F(x, y) = \\left(x^2${c === 0 ? '' : c < 0 ? ` - ${c === -1 ? '' : -c}y` : ` + ${c === 1 ? '' : c}y`},\\ x${d < 0 ? ` - ${d === -1 ? '' : -d}y` : ` + ${d === 1 ? '' : d}y`}\\right)$. Le théorème d’inversion locale s’applique-t-il en $${pt(a, b)}$ ?`,
    answer: fixedChoice(options, det === 0 ? 1 : 0),
    hint: 'Il s’applique quand $F$ est $C^1$ et que $\\det J_F \\neq 0$ au point.',
    correction: [
      `$J_F(x, y) = \\begin{pmatrix} 2x & ${c} \\\\ 1 & ${d} \\end{pmatrix}$, donc $\\det J_F(x, y) = ${2 * d}x${c === 0 ? '' : c < 0 ? ` + ${-c}` : ` - ${c}`}$.`,
      `En $${pt(a, b)}$ : $\\det J_F = ${det}$${det === 0 ? ' : on ne peut pas appliquer le théorème.' : ' : $F$ est un difféomorphisme local au voisinage du point.'}`,
    ],
  };
});

const implicite = skill('l3-fonctions-implicites', 'Dériver une fonction implicite', (rng, level) => {
  let p: Term[];
  let a: number;
  let b: number;
  let fy: number;
  do {
    p = randomPoly(rng, level, level === 1 ? 2 : 3);
    a = rng.int(-2, 2);
    b = rng.int(-2, 2);
    fy = evalP(dy(p), a, b);
  } while (fy === 0);
  const c = evalP(p, a, b);
  const full: Term[] = c === 0 ? p : [...p, [-c, 0, 0]];
  const fx = evalP(dx(p), a, b);
  const value = div(F(-fx), F(fy));
  return {
    prompt: `L’équation $${polyTex(full)} = 0$ définit, au voisinage de $${pt(a, b)}$, $y = \\varphi(x)$ avec $\\varphi(${a}) = ${b}$. Calcule $\\varphi'(${a})$.`,
    answer: numF(value),
    hint: 'En dérivant $f(x, \\varphi(x)) = 0$ : $\\varphi\'(a) = -\\dfrac{\\partial_x f(a, b)}{\\partial_y f(a, b)}$.',
    correction: [
      `$\\partial_x f(${a}, ${b}) = ${fx}$ et $\\partial_y f(${a}, ${b}) = ${fy}$.`,
      `$\\varphi'(${a}) = -\\frac{${fx}}{${fy}} = ${tex(value)}$`,
    ],
  };
});

const TRIPLES: [number, number, number][] = [
  [3, 4, 5],
  [5, 12, 13],
  [6, 8, 10],
  [8, 6, 10],
  [4, 3, 5],
  [12, 5, 13],
];

const extremaLies = skill('l3-extrema-lies', 'Trouver un extremum sous contrainte', (rng, level) => {
  if (level === 1) {
    const s = rng.int(2, 12);
    const value = F(s * s, 4);
    return {
      prompt: `Quel est le maximum de $f(x, y) = xy$ sous la contrainte $x + y = ${s}$ ?`,
      answer: numF(value),
      hint: 'Multiplicateur de Lagrange : $\\nabla f = \\lambda \\nabla g$, soit $y = \\lambda$ et $x = \\lambda$.',
      correction: [`Les conditions de Lagrange donnent $x = y$, donc $x = y = ${tex(F(s, 2))}$.`, `Maximum : $${tex(F(s, 2))}\\times ${tex(F(s, 2))} = ${tex(value)}$`],
    };
  }
  const [p, q, n] = rng.pick(TRIPLES);
  const sp = p * rng.sign();
  const sq = q * rng.sign();
  if (level === 2) {
    const r = rng.int(1, 4);
    const lin = combo([
      [sp, 'x'],
      [sq, 'y'],
    ]);
    return {
      prompt: `Quel est le maximum de $f(x, y) = ${lin}$ sur le cercle $x^2 + y^2 = ${r * r}$ ?`,
      answer: num(r * n),
      hint: 'Le gradient de $f$ doit être colinéaire au rayon : le maximum est atteint en $r\\,\\frac{(a, b)}{\\|(a, b)\\|}$.',
      correction: [
        `$\\nabla f = (${sp}, ${sq})$ de norme $\\sqrt{${p * p} + ${q * q}} = ${n}$.`,
        `Le maximum vaut $r\\,\\|\\nabla f\\| = ${r}\\times ${n} = ${r * n}$ (inégalité de Cauchy-Schwarz).`,
      ],
    };
  }
  const c = rng.nonZero(-9, 9);
  const value = F(c * c, n * n);
  return {
    prompt: `Quel est le minimum de $x^2 + y^2$ sous la contrainte $${combo([
      [sp, 'x'],
      [sq, 'y'],
    ])} = ${c}$ ?`,
    answer: numF(value),
    hint: 'C’est le carré de la distance de l’origine à une droite.',
    correction: [`Distance de $O$ à la droite : $\\frac{|${c}|}{\\sqrt{${p * p} + ${q * q}}} = \\frac{${Math.abs(c)}}{${n}}$.`, `Minimum : $${tex(value)}$`],
  };
});

const mat = (m: number[]) => `\\begin{pmatrix} ${m[0]} & ${m[1]} \\\\ ${m[2]} & ${m[3]} \\end{pmatrix}`;

const differentielleMatrice = skill('l3-differentielle-matricielle', 'Différentier une application matricielle', (rng, level) => {
  const A = Array.from({ length: 4 }, () => rng.int(-3, 3));
  const H = Array.from({ length: 4 }, () => rng.int(-2, 2));
  if (level === 3) {
    const value = A[0] * H[3] + A[3] * H[0] - A[1] * H[2] - A[2] * H[1];
    return {
      prompt: `Soit $\\det : M_2(\\mathbb{R}) \\to \\mathbb{R}$. Calcule $d(\\det)_A(H)$ pour $A = ${mat(A)}$ et $H = ${mat(H)}$.`,
      answer: num(value),
      hint: '$d(\\det)_A(H) = \\operatorname{tr}(\\operatorname{com}(A)^\\top H)$ ; en taille 2 : $a_{11}h_{22} + a_{22}h_{11} - a_{12}h_{21} - a_{21}h_{12}$.',
      correction: [`$d(\\det)_A(H) = ${times(A[0], H[3])}${plusT(times(A[3], H[0]))}${minusT(times(A[1], H[2]))}${minusT(times(A[2], H[1]))} = ${value}$`],
    };
  }
  // f(M) = M², df_A(H) = AH + HA ; on demande le coefficient (1, 1).
  const AH = A[0] * H[0] + A[1] * H[2];
  const HA = H[0] * A[0] + H[1] * A[2];
  return {
    prompt: `Soit $f(M) = M^2$ sur $M_2(\\mathbb{R})$, $A = ${mat(A)}$ et $H = ${mat(H)}$. Donne le coefficient en position $(1, 1)$ de $df_A(H)$.`,
    answer: num(AH + HA),
    hint: '$(A + H)^2 = A^2 + AH + HA + H^2$ : la différentielle est $df_A(H) = AH + HA$ (attention, $AH \\neq HA$ en général).',
    correction: [`$(AH)_{11} = ${times(A[0], H[0])}${plusT(times(A[1], H[2]))} = ${AH}$ et $(HA)_{11} = ${times(H[0], A[0])}${plusT(times(H[1], A[2]))} = ${HA}$.`, `Coefficient : $${AH} + ${HA < 0 ? `(${HA})` : HA} = ${AH + HA}$`],
  };
});

export const CALCUL_DIFFERENTIEL_SKILLS: Skill[] = [differentielle, jacobien, inversion, implicite, extremaLies, differentielleMatrice];
