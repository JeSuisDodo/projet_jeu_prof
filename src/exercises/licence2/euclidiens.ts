import type { Skill } from '../types';
import { F, add, choiceTex, coords, dot, mul, numF, pairOf, poly, skill, sub, sumF, tex } from './util';

/** Chapitre « Espaces préhilbertiens et euclidiens » (L2). */

const integral = skill('l2-produit-scalaire-integrale', 'Calculer un produit scalaire intégral', (rng, level) => {
  // ⟨P, Q⟩ = ∫₀¹ P(t)Q(t) dt avec P = at + b, Q = ct + d.
  const [a, b, c, d] = [rng.nonZero(-3, 3), rng.int(-3, 3), rng.nonZero(-3, 3), rng.int(-3, 3)];
  const useQ = level > 1;
  const [qc, qd] = useQ ? [c, d] : [a, b];
  // (at + b)(ct + d) = ac t² + (ad + bc) t + bd
  const coefs = [a * qc, a * qd + b * qc, b * qd];
  const value = add(add(F(coefs[0], 3), F(coefs[1], 2)), F(coefs[2]));
  const P = poly([a, b], 't');
  const Q = poly([qc, qd], 't');
  return {
    prompt: useQ
      ? `Sur $\\mathbb{R}[t]$, $\\langle P, Q\\rangle = \\displaystyle\\int_0^1 P(t)Q(t)\\,dt$. Calcule $\\langle P, Q\\rangle$ pour $P = ${P}$ et $Q = ${Q}$.`
      : `Sur $\\mathbb{R}[t]$, $\\langle P, Q\\rangle = \\displaystyle\\int_0^1 P(t)Q(t)\\,dt$. Calcule $\\|P\\|^2$ pour $P = ${P}$.`,
    answer: numF(value),
    hint: 'Développe le produit, puis intègre terme à terme : $\\int_0^1 t^k\\,dt = \\frac{1}{k + 1}$.',
    correction: [`$P(t)Q(t) = ${poly(coefs, 't')}$`, `$\\displaystyle\\int_0^1 (${poly(coefs, 't')})\\,dt = ${sumF([F(coefs[0], 3), F(coefs[1], 2), F(coefs[2])])} = ${tex(value)}$`],
  };
});

const orthogonal = skill('l2-orthogonalite-parametre', 'Rendre deux vecteurs orthogonaux', (rng, level) => {
  const u = [rng.int(-3, 3), rng.int(-3, 3), rng.nonZero(-3, 3)];
  const v = [rng.int(-3, 3), rng.int(-3, 3)];
  const w = level === 3 ? [1, 2, 3] : [1, 1, 1];
  // ⟨u, (v₀, v₁, a)⟩_w = w₀u₀v₀ + w₁u₁v₁ + w₂u₂a = 0
  const s = w[0] * u[0] * v[0] + w[1] * u[1] * v[1];
  const a = F(-s, w[2] * u[2]);
  const weighted = level === 3;
  return {
    prompt: weighted
      ? `Dans $\\mathbb{R}^3$, $\\langle x, y\\rangle = x_1y_1 + 2x_2y_2 + 3x_3y_3$. Pour quelle valeur de $a$ les vecteurs $u = ${coords(u)}$ et $v = (${v[0]}\\,;\\,${v[1]}\\,;\\,a)$ sont-ils orthogonaux ?`
      : `Dans $\\mathbb{R}^3$ muni du produit scalaire usuel, pour quelle valeur de $a$ les vecteurs $u = ${coords(u)}$ et $v = (${v[0]}\\,;\\,${v[1]}\\,;\\,a)$ sont-ils orthogonaux ?`,
    answer: numF(a),
    hint: 'Deux vecteurs sont orthogonaux quand leur produit scalaire est nul.',
    correction: [`$\\langle u, v\\rangle = ${s} ${w[2] * u[2] < 0 ? '-' : '+'} ${Math.abs(w[2] * u[2])}a = 0$`, `$a = ${tex(a)}$`],
  };
});

const projection = skill('l2-projection-orthogonale', 'Projeter orthogonalement sur une droite', (rng, level) => {
  const u = [rng.int(-2, 2), rng.int(-2, 2), rng.nonZero(-2, 2)];
  const v = [rng.int(-3, 3), rng.int(-3, 3), rng.int(-3, 3)];
  const uv = dot(u, v);
  const uu = dot(u, u);
  const c = F(uv, uu);
  if (level === 3) {
    const dist2 = sub(F(dot(v, v)), F(uv * uv, uu));
    return {
      prompt: `Dans $\\mathbb{R}^3$ euclidien usuel, $D = \\mathrm{Vect}(u)$ avec $u = ${coords(u)}$, et $v = ${coords(v)}$. Calcule $d(v, D)^2$.`,
      answer: numF(dist2),
      hint: 'Pythagore : $d(v, D)^2 = \\|v\\|^2 - \\|p_D(v)\\|^2 = \\|v\\|^2 - \\dfrac{\\langle u, v\\rangle^2}{\\|u\\|^2}$.',
      correction: [`$\\langle u, v\\rangle = ${uv}$, $\\|u\\|^2 = ${uu}$, $\\|v\\|^2 = ${dot(v, v)}$`, `$d(v, D)^2 = ${dot(v, v)} - \\dfrac{${uv * uv}}{${uu}} = ${tex(dist2)}$`],
    };
  }
  return {
    prompt: `Dans $\\mathbb{R}^3$ euclidien usuel, $u = ${coords(u)}$ et $v = ${coords(v)}$. Le projeté orthogonal de $v$ sur $\\mathrm{Vect}(u)$ s’écrit $\\lambda u$ : donne $\\lambda$.`,
    answer: numF(c),
    hint: '$p(v) = \\dfrac{\\langle u, v\\rangle}{\\|u\\|^2}\\,u$',
    correction: [`$\\langle u, v\\rangle = ${uv}$ et $\\|u\\|^2 = ${uu}$`, `$\\lambda = \\dfrac{${uv}}{${uu}} = ${tex(c)}$`],
  };
});

const gramSchmidt = skill('l2-gram-schmidt', 'Orthogonaliser avec Gram-Schmidt', (rng, level) => {
  const b = level === 1 ? 2 : 4;
  let u1: number[];
  let u2: number[];
  do {
    u1 = [rng.int(-b, b), rng.int(-b, b)];
    u2 = [rng.int(-b, b), rng.int(-b, b)];
  } while (dot(u1, u1) === 0 || u1[0] * u2[1] - u1[1] * u2[0] === 0);
  const c = F(dot(u1, u2), dot(u1, u1));
  const e2 = [sub(F(u2[0]), mul(c, F(u1[0]))), sub(F(u2[1]), mul(c, F(u1[1])))];
  return {
    prompt: `Dans $\\mathbb{R}^2$ euclidien usuel, on orthogonalise $(u_1, u_2)$ avec $u_1 = ${coords(u1)}$ et $u_2 = ${coords(u2)}$ : $v_2 = u_2 - \\dfrac{\\langle u_2, u_1\\rangle}{\\|u_1\\|^2}u_1$. Donne les coordonnées de $v_2$.`,
    answer: pairOf(e2[0], e2[1], ['x', 'y']),
    hint: 'On retire à $u_2$ sa composante selon $u_1$.',
    correction: [`$\\langle u_2, u_1\\rangle = ${dot(u1, u2)}$ et $\\|u_1\\|^2 = ${dot(u1, u1)}$`, `$v_2 = ${coords(u2)} - ${tex(c).startsWith('-') ? `\\left(${tex(c)}\\right)` : tex(c)}${coords(u1)} = (${tex(e2[0])}\\,;\\,${tex(e2[1])})$`],
  };
});

const TRIPLES = [
  [3, 4, 5],
  [5, 12, 13],
  [8, 15, 17],
];

const orthogonale = skill('l2-matrice-orthogonale', 'Reconnaître une matrice orthogonale', (rng) => {
  const [a, b, c] = rng.pick(TRIPLES);
  const p = `\\frac{${a}}{${c}}`;
  const q = `\\frac{${b}}{${c}}`;
  const m = (x: string[][]) => `\\begin{pmatrix} ${x[0].join(' & ')} \\\\ ${x[1].join(' & ')}\\end{pmatrix}`;
  const good = rng.pick([
    m([[p, `-${q}`], [q, p]]),
    m([[p, q], [q, `-${p}`]]),
    m([[q, p], [`-${p}`, q]]),
  ]);
  return {
    prompt: 'Laquelle de ces matrices est orthogonale ?',
    answer: choiceTex(rng, good, [m([[p, q], [q, p]]), m([[p, `-${q}`], [`-${q}`, p]]), m([[p, p], [q, `-${q}`]]), m([[q, q], [p, `-${p}`]])], () => m([[p, '0'], ['0', q]])),
    hint: 'Une matrice est orthogonale quand ses colonnes forment une base orthonormée : colonnes de norme 1 et orthogonales.',
    correction: [`Les colonnes de $${good}$ sont de norme 1 car $${a}^2 + ${b}^2 = ${c}^2$, et leur produit scalaire est nul.`],
  };
});

export const EUCLIDIENS_SKILLS: Skill[] = [integral, orthogonal, projection, gramSchmidt, orthogonale];
