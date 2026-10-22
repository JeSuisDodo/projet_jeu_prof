import type { Skill } from '../types';
import type { Rng } from '../rng';
import { F, choiceTex, div, num, numF, plus, poly, skill, sub, tex } from './util';
import { evalFrac, polyFrac, primitiveCoefs } from './primitives';

/** Chapitre « Calcul intégral » (Terminale spécialité). */

function randomPoly(rng: Rng, deg: number): number[] {
  return [rng.nonZero(-3, 3), ...Array.from({ length: deg }, () => rng.int(-4, 4))];
}

const bounds = (rng: Rng) => {
  const a = rng.int(-2, 1);
  return [a, a + rng.int(1, 3)] as const;
};

const polynome = skill('tle-integrale-polynome', 'Calculer l’intégrale d’un polynôme', (rng, level) => {
  const c = randomPoly(rng, level === 1 ? 1 : 2);
  const [a, b] = bounds(rng);
  const P = primitiveCoefs(c);
  const value = sub(evalFrac(P, b), evalFrac(P, a));
  return {
    prompt: `Calcule $\\displaystyle\\int_{${a}}^{${b}} (${poly(c)})\\,dx$.`,
    answer: numF(value),
    hint: 'Trouve une primitive $F$, puis calcule $F(b) - F(a)$.',
    correction: [
      `Une primitive est $F(x) = ${polyFrac(P)}$.`,
      `$F(${b}) - F(${a}) = ${tex(evalFrac(P, b))} - ${tex(evalFrac(P, a)).startsWith('-') ? `\\left(${tex(evalFrac(P, a))}\\right)` : tex(evalFrac(P, a))} = ${tex(value)}$`,
    ],
  };
});

const ePow = (t: number) => (t === 1 ? 'e' : `e^{${t}}`);

const exponentielle = skill('tle-integrale-exp', 'Intégrer une exponentielle', (rng) => {
  const k = rng.int(1, 3);
  const b = rng.int(1, 2);
  const kx = k === 1 ? 'x' : `${k}x`;
  const factor = k === 1 ? '' : `\\frac{1}{${k}}`;
  const top = k * b;
  const correct = k === 1 ? `${ePow(top)} - 1` : `\\frac{${ePow(top)} - 1}{${k}}`;
  const decoys = [ePow(top), `${ePow(top)} + 1`, `${ePow(top + 1)} - 1`];
  if (k > 1) decoys.push(`${k}(${ePow(top)} - 1)`, `\\frac{${ePow(top)}}{${k}}`);
  return {
    prompt: `Calcule $\\displaystyle\\int_{0}^{${b}} e^{${kx}}\\,dx$.`,
    answer: choiceTex(rng, correct, decoys, () => `${ePow(top + 2)} - 1`),
    hint: `Une primitive de $e^{${kx}}$ est $${factor}e^{${kx}}$.`,
    correction: [`$\\left[${factor}e^{${kx}}\\right]_0^{${b}} = ${factor}${ePow(top)} - ${factor}e^0$`, `$= ${correct}$`],
  };
});

const moyenne = skill('tle-valeur-moyenne', 'Calculer une valeur moyenne', (rng, level) => {
  const c = randomPoly(rng, level === 1 ? 1 : 2);
  const [a, b] = bounds(rng);
  const P = primitiveCoefs(c);
  const integral = sub(evalFrac(P, b), evalFrac(P, a));
  const value = div(integral, F(b - a));
  return {
    prompt: `Quelle est la valeur moyenne de $f(x) = ${poly(c)}$ sur $[${a}\\,;\\,${b}]$ ?`,
    answer: numF(value),
    hint: 'Valeur moyenne : $\\mu = \\frac{1}{b - a}\\displaystyle\\int_a^b f(x)\\,dx$.',
    correction: [`$\\displaystyle\\int_{${a}}^{${b}} f(x)\\,dx = ${tex(integral)}$`, `$\\mu = \\frac{1}{${b - a}}\\times ${tex(integral).startsWith('-') ? `\\left(${tex(integral)}\\right)` : tex(integral)} = ${tex(value)}$`],
  };
});

const aire = skill('tle-aire-entre-courbes', 'Calculer une aire entre deux courbes', (rng, level) => {
  // f - g = k (x - r1)(r2 - x) ≥ 0 entre r1 et r2 ; aire = k (r2 - r1)³ / 6.
  const r1 = rng.int(-3, 1);
  const r2 = r1 + rng.int(1, 3);
  const k = level === 1 ? 1 : rng.int(1, 3);
  const g = [rng.int(-2, 2), rng.int(-3, 3), rng.int(-3, 3)];
  const diff = [-k, k * (r1 + r2), -k * r1 * r2];
  const f = g.map((v, i) => v + diff[i]);
  const value = F(k * (r2 - r1) ** 3, 6);
  return {
    prompt: `$f(x) = ${poly(f)}$ et $g(x) = ${poly(g)}$. Les courbes se coupent en $x = ${r1}$ et $x = ${r2}$, et $f \\geq g$ entre les deux. Calcule l’aire entre les courbes.`,
    answer: numF(value),
    hint: 'Aire $= \\displaystyle\\int_{x_1}^{x_2} (f(x) - g(x))\\,dx$ quand $f \\geq g$.',
    correction: [
      `$f(x) - g(x) = ${poly(diff)}$`,
      `Une primitive est $${polyFrac(primitiveCoefs(diff))}$.`,
      `$\\displaystyle\\int_{${r1}}^{${r2}} (f - g)\\,dx = ${tex(value)}$ unités d’aire.`,
    ],
  };
});

const linearite = skill('tle-integrale-linearite', 'Utiliser la linéarité et la relation de Chasles', (rng, level) => {
  const I = rng.int(-6, 9);
  const J = rng.int(-6, 9);
  const a = rng.nonZero(-3, 4);
  const b = rng.nonZero(-3, 4);
  if (level === 3 && rng.next() < 0.5) {
    return {
      prompt: `$\\displaystyle\\int_0^{2} f(x)\\,dx = ${I}$ et $\\displaystyle\\int_2^{5} f(x)\\,dx = ${J}$. Calcule $\\displaystyle\\int_0^{5} ${a === 1 ? '' : a}f(x)\\,dx$.`,
      answer: num(a * (I + J)),
      hint: 'Relation de Chasles : $\\int_a^b + \\int_b^c = \\int_a^c$.',
      correction: [`$\\displaystyle\\int_0^5 f = ${I}${plus(J)} = ${I + J}$`, `Par linéarité : $${a}\\times ${I + J < 0 ? `(${I + J})` : I + J} = ${a * (I + J)}$`],
    };
  }
  return {
    prompt: `$\\displaystyle\\int_0^{1} f(x)\\,dx = ${I}$ et $\\displaystyle\\int_0^{1} g(x)\\,dx = ${J}$. Calcule $\\displaystyle\\int_0^{1} (${a === 1 ? '' : a === -1 ? '-' : a}f(x)${b < 0 ? ' - ' : ' + '}${Math.abs(b) === 1 ? '' : Math.abs(b)}g(x))\\,dx$.`,
    answer: num(a * I + b * J),
    hint: 'Linéarité : $\\int (af + bg) = a\\int f + b\\int g$.',
    correction: [`$${a}\\times ${I < 0 ? `(${I})` : I}${b < 0 ? ' - ' : ' + '}${Math.abs(b)}\\times ${J < 0 ? `(${J})` : J} = ${a * I + b * J}$`],
  };
});

const ipp = skill('tle-integration-parties', 'Intégrer par parties', (rng) => {
  // ∫_0^k x e^x dx = (k - 1)e^k + 1
  const k = rng.int(1, 3);
  const lead = k === 1 ? '' : String(k);
  const correct = k === 1 ? '1' : `${k === 2 ? '' : k - 1}${ePow(k)} + 1`;
  return {
    prompt: `Calcule $\\displaystyle\\int_0^{${k}} xe^x\\,dx$.`,
    answer: choiceTex(rng, correct, [`${lead}${ePow(k)}`, `${lead}${ePow(k)} - 1`, `${ePow(k)} - 1`, `${k + 1}${ePow(k)} - 1`], () => `${k + 1}${ePow(k)} + 1`),
    hint: 'Pose $u = x$ et $v\' = e^x$ : $\\int uv\' = [uv] - \\int u\'v$.',
    correction: [
      `$u = x$, $u' = 1$, $v = e^x$.`,
      `$\\displaystyle\\int_0^{${k}} xe^x\\,dx = \\left[xe^x\\right]_0^{${k}} - \\int_0^{${k}} e^x\\,dx = ${lead}${ePow(k)} - (${ePow(k)} - 1)$`,
      `$= ${correct}$`,
    ],
  };
});

export const INTEGRALES_SKILLS: Skill[] = [polynome, exponentielle, moyenne, aire, linearite, ipp];
