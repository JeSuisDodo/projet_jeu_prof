import type { Skill } from '../types';
import { F, add, affine, div, linComb, mul, num, numF, pairOf, par, plus, poly, skill, sub, tex } from './util';

/** Chapitre « Suites réelles » (Licence 1). */

/** « 3\cdot 2^n », « 2^n », « -2^n » : coefficient entier devant une puissance. */
const times = (k: number, power: string) => `${k === 1 ? '' : k === -1 ? '-' : `${k}\\cdot `}${power}`;

const limiteRationnelle = skill('l1-limite-suite', 'Calculer la limite d’une suite', (rng, level) => {
  if (level === 3) {
    // √(n² + an + b) − n → a/2
    const a = rng.nonZero(-6, 6);
    const b = rng.int(-5, 5);
    return {
      prompt: `Calcule $\\displaystyle\\lim_{n \\to +\\infty} \\left(\\sqrt{${poly([1, a, b], 'n')}} - n\\right)$.`,
      answer: numF(F(a, 2)),
      hint: 'Multiplie par la quantité conjuguée $\\sqrt{\\cdots} + n$.',
      correction: [
        `$\\sqrt{${poly([1, a, b], 'n')}} - n = \\dfrac{${poly([a, b], 'n')}}{\\sqrt{${poly([1, a, b], 'n')}} + n}$`,
        `On factorise par $n$ en haut et en bas : la limite vaut $\\frac{${a}}{2} = ${tex(F(a, 2))}$.`,
      ],
    };
  }
  const deg = level === 1 ? 1 : 2;
  const top = [rng.nonZero(-6, 6), ...Array.from({ length: deg }, () => rng.int(-6, 6))];
  const bottom = [rng.nonZero(-6, 6), ...Array.from({ length: deg }, () => rng.int(-6, 6))];
  const value = F(top[0], bottom[0]);
  return {
    prompt: `Calcule $\\displaystyle\\lim_{n \\to +\\infty} \\frac{${poly(top, 'n')}}{${poly(bottom, 'n')}}$.`,
    answer: numF(value),
    hint: 'Factorise numérateur et dénominateur par leur terme de plus haut degré.',
    correction: [`Les termes dominants sont $${poly([top[0], ...Array(deg).fill(0)], 'n')}$ et $${poly([bottom[0], ...Array(deg).fill(0)], 'n')}$.`, `La limite vaut $\\frac{${top[0]}}{${bottom[0]}} = ${tex(value)}$.`],
  };
});

const recurrenceOrdre2 = skill('l1-recurrence-lineaire-ordre2', 'Résoudre une récurrence linéaire d’ordre 2', (rng, level) => {
  let r1 = rng.nonZero(-3, 3);
  let r2 = rng.nonZero(-3, 3);
  while (r1 === r2) r2 = rng.nonZero(-3, 3);
  if (r1 > r2) [r1, r2] = [r2, r1];
  const lambda = rng.nonZero(-3, 3);
  const mu = rng.nonZero(-3, 3);
  const u0 = lambda + mu;
  const u1 = lambda * r1 + mu * r2;
  const a = r1 + r2;
  const b = -r1 * r2;
  const rec = `u_{n+2} = ${a === 0 ? '' : `${a === 1 ? '' : a === -1 ? '-' : a}u_{n+1}`}${a === 0 ? `${b === 1 ? '' : b === -1 ? '-' : b}u_n` : `${b < 0 ? ' - ' : ' + '}${Math.abs(b) === 1 ? '' : Math.abs(b)}u_n`}`;
  if (level === 1) {
    return {
      prompt: `$(u_n)$ vérifie $${rec}$. Quelles sont les racines de l’équation caractéristique ?`,
      answer: { kind: 'set', values: [F(r1), F(r2)] },
      hint: 'L’équation caractéristique de $u_{n+2} = au_{n+1} + bu_n$ est $r^2 = ar + b$.',
      correction: [`$r^2 ${a === 0 ? '' : `${a > 0 ? '-' : '+'} ${Math.abs(a) === 1 ? '' : Math.abs(a)}r`} ${b > 0 ? '-' : '+'} ${Math.abs(b)} = (r ${r1 < 0 ? '+' : '-'} ${Math.abs(r1)})(r ${r2 < 0 ? '+' : '-'} ${Math.abs(r2)})$`, `Racines : $${r1}$ et $${r2}$.`],
    };
  }
  return {
    prompt: `$(u_n)$ vérifie $${rec}$, avec $u_0 = ${u0}$ et $u_1 = ${u1}$. On écrit $u_n = \\lambda (${r1})^n + \\mu (${r2})^n$. Donne $\\lambda$ et $\\mu$.`,
    answer: pairOf(lambda, mu, ['\\lambda', '\\mu']),
    hint: 'Écris les conditions $u_0 = \\lambda + \\mu$ et $u_1 = \\lambda r_1 + \\mu r_2$, puis résous.',
    correction: [`$\\lambda + \\mu = ${u0}$ et $${linComb([[r1, '\\lambda'], [r2, '\\mu']])} = ${u1}$`, `$\\lambda = ${lambda}$, $\\mu = ${mu}$`],
  };
});

const arithmeticoGeometrique = skill('l1-suite-arithmetico-geometrique', 'Étudier une suite arithmético-géométrique', (rng, level) => {
  const a = level === 1 ? F(1, 2) : F(rng.pick([1, -1, 2, -2]), rng.pick([3, 5]));
  const b = rng.nonZero(-6, 6);
  const l = div(F(b), sub(F(1), a));
  const u0 = rng.int(-5, 5);
  if (level < 3)
    return {
      prompt: `$u_0 = ${u0}$ et $u_{n+1} = ${tex(a)}\\,u_n${plus(b)}$. Vers quelle limite converge $(u_n)$ ?`,
      answer: numF(l),
      hint: 'La limite $\\ell$ vérifie $\\ell = a\\ell + b$ (et $|a| < 1$ assure la convergence).',
      correction: [`$\\ell = ${tex(a)}\\ell${plus(b)} \\iff \\ell = \\frac{${b}}{1 - ${par(a)}} = ${tex(l)}$`, `$u_n - \\ell = (${tex(a)})^n(u_0 - \\ell) \\to 0$.`],
    };
  // u_n = ℓ + aⁿ(u0 − ℓ).
  const c = sub(F(u0), l);
  const value = add(l, mul(mul(a, a), c));
  return {
    prompt: `$u_0 = ${u0}$ et $u_{n+1} = ${tex(a)}\\,u_n${plus(b)}$. On écrit $u_n = \\ell + K\\left(${tex(a)}\\right)^n$. Que vaut $K$ ?`,
    answer: numF(c),
    hint: 'Le point fixe $\\ell$ vérifie $\\ell = a\\ell + b$, et $(u_n - \\ell)$ est géométrique de raison $a$.',
    correction: [`$\\ell = ${tex(l)}$`, `$K = u_0 - \\ell = ${tex(c)}$ (et par exemple $u_2 = ${tex(value)}$).`],
  };
});

const geometriqueQuotient = skill('l1-limite-quotient-geometrique', 'Comparer des suites géométriques', (rng, level) => {
  const bases = rng.shuffle([2, 3, 4, 5]).slice(0, 3).sort((x, y) => x - y);
  const [p, q, r] = bases;
  const a = rng.nonZero(-4, 4);
  const b = rng.nonZero(1, 5);
  const c = rng.int(-3, 3);
  if (level === 1) {
    return {
      prompt: `Calcule $\\displaystyle\\lim_{n \\to +\\infty} \\frac{${times(a, `${q}^n`)}${plus(c)}}{${times(b, `${q}^n`)} + ${p}^n}$.`,
      answer: numF(F(a, b)),
      hint: `Divise en haut et en bas par $${q}^n$ : $\\left(\\frac{${p}}{${q}}\\right)^n \\to 0$.`,
      correction: [`Après division par $${q}^n$ : $\\dfrac{${a}${c === 0 ? '' : ` ${c < 0 ? '-' : '+'} ${Math.abs(c)}/${q}^n`}}{${b} + (${p}/${q})^n} \\to ${tex(F(a, b))}$`],
    };
  }
  return {
    prompt: `Calcule $\\displaystyle\\lim_{n \\to +\\infty} \\frac{${p}^n ${a < 0 ? '-' : '+'} ${times(Math.abs(a), `${r}^{n+1}`)}}{${q}^n + ${times(b, `${r}^n`)}}$.`,
    answer: numF(F(a * r, b)),
    hint: `Le terme dominant est $${r}^n$ : divise tout par $${r}^n$.`,
    correction: [`$${times(a, `${r}^{n+1}`)} = ${a * r}\\cdot ${r}^n$, et $\\left(\\frac{${p}}{${r}}\\right)^n, \\left(\\frac{${q}}{${r}}\\right)^n \\to 0$.`, `Limite : $\\frac{${a * r}}{${b}} = ${tex(F(a * r, b))}$`],
  };
});

const seuil = skill('l1-seuil-convergence', 'Trouver un rang à partir duquel une suite est proche de sa limite', (rng, level) => {
  const a = rng.int(1, 4);
  const c = rng.int(1, 4);
  const delta = rng.nonZero(-3, 3);
  const b = a * c + delta;
  const k = level === 1 ? rng.int(1, 2) : rng.int(2, 4);
  // |u_n − a| = |δ|/(n + c) < 10^{-k} ⇔ n > |δ|·10^k − c.
  const n0 = Math.abs(delta) * 10 ** k - c + 1;
  return {
    prompt: `$u_n = \\dfrac{${affine(a, b, 'n')}}{n + ${c}}$ converge vers $${a}$. Quel est le plus petit entier $n$ tel que $|u_n - ${a}| < 10^{-${k}}$ ?`,
    answer: num(n0),
    hint: 'Calcule $u_n - a$ sous forme d’une seule fraction, puis résous l’inégalité.',
    correction: [`$u_n - ${a} = \\dfrac{${delta}}{n + ${c}}$`, `$\\dfrac{${Math.abs(delta)}}{n + ${c}} < 10^{-${k}} \\iff n > ${Math.abs(delta) * 10 ** k - c}$, donc $n = ${n0}$.`],
  };
});

export const SUITES_SKILLS: Skill[] = [limiteRationnelle, arithmeticoGeometrique, recurrenceOrdre2, geometriqueQuotient, seuil];
