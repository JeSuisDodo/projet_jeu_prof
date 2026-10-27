import type { Frac } from '../fraction';
import type { Rng } from '../rng';
import type { Skill } from '../types';
import { F, add, fact, mul, numF, skill, tex, texChoice } from './util';
import { enrichir } from '../licenceVariantes';
import { DL_VARIANTES } from './variantes/dl';

/** Chapitre « Développements limités » (Licence 1). Séries tronquées : coefficients de x⁰ à x⁵. */

const ORDER = 5;
type Series = Frac[];

const zero = (): Series => Array.from({ length: ORDER + 1 }, () => F(0));
const seriesMul = (s: Series, t: Series): Series => {
  const out = zero();
  for (let i = 0; i <= ORDER; i++) for (let j = 0; i + j <= ORDER; j++) out[i + j] = add(out[i + j], mul(s[i], t[j]));
  return out;
};
const scale = (s: Series, k: Frac): Series => s.map((c) => mul(c, k));

/** Fonctions usuelles composées avec u = a·x. */
interface Usual {
  tex: (u: string) => string;
  coef: (k: number) => Frac;
}

const USUALS: Record<string, Usual> = {
  exp: { tex: (u) => `e^{${u}}`, coef: (k) => F(1, fact(k)) },
  ln: { tex: (u) => `\\ln(1 + ${u})`, coef: (k) => (k === 0 ? F(0) : F(k % 2 ? 1 : -1, k)) },
  geo: { tex: (u) => `\\dfrac{1}{1 - ${u}}`, coef: () => F(1) },
  sin: { tex: (u) => `\\sin(${u})`, coef: (k) => (k % 2 ? F((k - 1) % 4 ? -1 : 1, fact(k)) : F(0)) },
  cos: { tex: (u) => `\\cos(${u})`, coef: (k) => (k % 2 ? F(0) : F(k % 4 ? -1 : 1, fact(k))) },
  sqrt: {
    tex: (u) => `\\sqrt{1 + ${u}}`,
    coef: (k) => {
      // Coefficient binomial généralisé (1/2 choisir k).
      let c = F(1);
      for (let i = 0; i < k; i++) c = mul(c, F(1 - 2 * i, 2 * (i + 1)));
      return c;
    },
  },
};

/** Série de f(a·x). */
const usual = (name: string, a: number): Series => zero().map((_, k) => mul(USUALS[name].coef(k), F(a ** k)));

const uTex = (a: number) => (a === 1 ? 'x' : a === -1 ? '-x' : `${a}x`);
/** Dans ln(1 + u), sqrt(1 + u) : « 1 - 2x » plutôt que « 1 + -2x ». */
const usualTex = (name: string, a: number) => USUALS[name].tex(uTex(a)).replace('+ -', '- ').replace('- -', '+ ');

const term = (c: Frac, k: number, first: boolean) => {
  if (c.n === 0) return '';
  const abs = F(Math.abs(c.n), c.d);
  const body = k === 0 ? tex(abs) : `${abs.n === 1 && abs.d === 1 ? '' : tex(abs)}x${k === 1 ? '' : `^{${k}}`}`;
  return `${c.n < 0 ? (first ? '-' : ' - ') : first ? '' : ' + '}${body}`;
};

/** Partie régulière d’un DL jusqu’à l’ordre n. */
export function seriesTex(s: Series, n: number): string {
  let out = '';
  for (let k = 0; k <= n; k++) out += term(s[k], k, out === '');
  return out || '0';
}

const pickUsual = (rng: Rng, level: number) => rng.pick(level === 1 ? ['exp', 'geo', 'ln'] : ['exp', 'geo', 'ln', 'sin', 'cos', 'sqrt']);

const dlUsuel = skill('l1-dl-usuel', 'Utiliser un développement limité usuel', (rng, level) => {
  const name = pickUsual(rng, level);
  const a = level === 1 ? 1 : rng.nonZero(-3, 3);
  const s = usual(name, a);
  let k = rng.int(1, level === 3 ? 4 : 3);
  if (name === 'sin' && k % 2 === 0) k++;
  if (name === 'cos' && k % 2 === 1) k++;
  return {
    prompt: `Quel est le coefficient de $x^{${k}}$ dans le développement limité en $0$ de $${usualTex(name, a)}$ ?`,
    answer: numF(s[k]),
    hint: 'Pars du DL usuel en $u$, puis remplace $u$ par $ax$ : le coefficient de $x^k$ est multiplié par $a^k$.',
    correction: [`$${usualTex(name, a)} = ${seriesTex(s, k)} + o(x^{${k}})$`, `Coefficient de $x^{${k}}$ : $${tex(s[k])}$`],
  };
});

const dlProduit = skill('l1-dl-produit', 'Multiplier des développements limités', (rng, level) => {
  const [n1, n2] = rng.shuffle(level === 1 ? ['exp', 'geo', 'ln'] : ['exp', 'geo', 'ln', 'sin', 'cos', 'sqrt']).slice(0, 2);
  const a = level === 3 ? rng.nonZero(-2, 2) : 1;
  const s = seriesMul(usual(n1, 1), usual(n2, a));
  const k = level === 1 ? 2 : rng.int(2, 3);
  return {
    prompt: `Quel est le coefficient de $x^{${k}}$ dans le développement limité en $0$ de $${usualTex(n1, 1)}\\,${usualTex(n2, a)}$ ?`,
    answer: numF(s[k]),
    hint: 'Multiplie les deux DL à l’ordre voulu et ne garde que les termes de degré au plus $k$.',
    correction: [`$${usualTex(n1, 1)} = ${seriesTex(usual(n1, 1), k)} + o(x^{${k}})$`, `$${usualTex(n2, a)} = ${seriesTex(usual(n2, a), k)} + o(x^{${k}})$`, `Produit : $${seriesTex(s, k)} + o(x^{${k}})$, coefficient $${tex(s[k])}$.`],
  };
});

const dlLimite = skill('l1-dl-limite', 'Calculer une limite avec un développement limité', (rng, level) => {
  const name = pickUsual(rng, level);
  const a = level === 3 ? rng.nonZero(-3, 3) : 1;
  const s = usual(name, a);
  // Ordre k : premier coefficient non nul à partir de 2 (ou 3 pour sin).
  let k = name === 'sin' ? 3 : 2;
  if (level === 3 && name !== 'sin' && name !== 'cos' && rng.next() < 0.5) k = 3;
  const head = seriesTex(s, k - 1);
  return {
    prompt: `Calcule $\\displaystyle\\lim_{x \\to 0} \\frac{${usualTex(name, a)} - (${head})}{x^{${k}}}$.`,
    answer: numF(s[k]),
    hint: `Écris le DL à l’ordre $${k}$ : les premiers termes se simplifient.`,
    correction: [`$${usualTex(name, a)} = ${seriesTex(s, k)} + o(x^{${k}})$`, `Le quotient tend vers le coefficient de $x^{${k}}$ : $${tex(s[k])}$.`],
  };
});

const dlComposition = skill('l1-dl-composition', 'Composer des développements limités', (rng, level) => {
  // e^{u}, 1/(1 − u) ou ln(1 + u) avec u = DL d’une fonction usuelle nulle en 0.
  const inner = rng.pick(level === 1 ? ['sin', 'ln'] : ['sin', 'ln', 'exp-1', 'sqrt-1']);
  const outer = rng.pick(level === 1 ? ['exp', 'geo'] : ['exp', 'geo', 'ln']);
  const u = inner === 'exp-1' ? usual('exp', 1).map((c, i) => (i === 0 ? F(0) : c)) : inner === 'sqrt-1' ? usual('sqrt', 1).map((c, i) => (i === 0 ? F(0) : c)) : usual(inner, 1);
  const innerTex = { sin: '\\sin x', ln: '\\ln(1 + x)', 'exp-1': '(e^x - 1)', 'sqrt-1': '(\\sqrt{1 + x} - 1)' }[inner]!;
  let result = zero();
  let power = zero();
  power[0] = F(1);
  for (let j = 0; j <= ORDER; j++) {
    result = result.map((c, i) => add(c, mul(USUALS[outer].coef(j), power[i])));
    power = seriesMul(power, u);
  }
  const k = level === 3 ? 3 : 2;
  const outerTex = { exp: `e^{${innerTex}}`, geo: `\\dfrac{1}{1 - ${innerTex}}`, ln: `\\ln(1 + ${innerTex})` }[outer]!;
  return {
    prompt: `Quel est le coefficient de $x^{${k}}$ dans le développement limité en $0$ de $${outerTex}$ ?`,
    answer: numF(result[k]),
    hint: 'Pose $u$ égal à la fonction intérieure ($u \\to 0$), écris le DL de l’extérieure en $u$, puis remplace $u$ par son DL.',
    correction: [`$u = ${seriesTex(u, k)} + o(x^{${k}})$`, `En développant et en ne gardant que les termes de degré au plus $${k}$ : $${seriesTex(result, k)} + o(x^{${k}})$.`, `Coefficient : $${tex(result[k])}$`],
  };
});

const equivalentDl = skill('l1-dl-equivalent', 'Trouver un équivalent grâce aux DL', (rng, level) => {
  // f − g où f et g ont le même début de DL.
  const pairs: [string, Series][] = [
    ['\\sin x - x', usual('sin', 1).map((c, i) => (i === 1 ? F(0) : c))],
    ['e^x - 1 - x', usual('exp', 1).map((c, i) => (i < 2 ? F(0) : c))],
    ['\\ln(1 + x) - x', usual('ln', 1).map((c, i) => (i === 1 ? F(0) : c))],
    ['\\cos x - 1', usual('cos', 1).map((c, i) => (i === 0 ? F(0) : c))],
    ['\\dfrac{1}{1 - x} - e^x', usual('geo', 1).map((c, i) => add(c, mul(F(-1), USUALS.exp.coef(i))))],
    ['\\sqrt{1 + x} - 1 - \\dfrac{x}{2}', usual('sqrt', 1).map((c, i) => (i < 2 ? F(0) : c))],
    ['e^x - \\cos x - x', zero().map((_, i) => add(USUALS.exp.coef(i), add(mul(F(-1), USUALS.cos.coef(i)), F(i === 1 ? -1 : 0))))],
  ];
  const [f, s] = rng.pick(level === 1 ? pairs.slice(0, 4) : pairs);
  const k = s.findIndex((c) => c.n !== 0);
  const correct = term(s[k], k, true);
  const decoys = [term(scale(s, F(-1))[k], k, true), term(s[k], k + 1, true), term(F(1), k, true), term(s[k], Math.max(1, k - 1), true)];
  return {
    prompt: `Quel est un équivalent simple de $${f}$ quand $x \\to 0$ ?`,
    answer: texChoice(rng, correct, decoys, () => term(F(rng.nonZero(-3, 3), rng.pick([2, 3, 6])), rng.int(1, 4), true)),
    hint: 'Écris le DL : l’équivalent est le premier terme non nul.',
    correction: [`$${f} = ${seriesTex(s, k)} + o(x^{${k}})$`, `Donc $${f} \\sim ${correct}$.`],
  };
});

export const DL_SKILLS: Skill[] = enrichir([dlUsuel, dlLimite, equivalentDl, dlProduit, dlComposition], DL_VARIANTES);
