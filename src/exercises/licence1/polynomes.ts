import type { Skill } from '../types';
import { F, binom, div, mul, num, numF, pairOf, par, poly, setOf, skill, sub, tex } from './util';
import { enrichir } from '../licenceVariantes';
import { POLYNOMES_VARIANTES } from './variantes/polynomes';

/** Chapitre « Polynômes » (Licence 1). Coefficients du plus haut degré au terme constant. */

export const polyMul = (p: number[], q: number[]): number[] => {
  const out = Array(p.length + q.length - 1).fill(0);
  p.forEach((a, i) => q.forEach((b, j) => (out[i + j] += a * b)));
  return out;
};

const fromRoots = (lead: number, roots: number[]) => roots.reduce((acc, r) => polyMul(acc, [1, -r]), [lead]);

export const evalPoly = (p: number[], x: number) => p.reduce((s, c) => s * x + c, 0);

const P = (p: number[]) => poly(p, 'X');

const division = skill('l1-division-euclidienne', 'Effectuer une division euclidienne', (rng, level) => {
  if (level === 1) {
    const A = [rng.nonZero(-3, 3), rng.int(-5, 5), rng.int(-5, 5), rng.int(-5, 5)];
    const a = rng.nonZero(-3, 3);
    return {
      prompt: `Quel est le reste de la division euclidienne de $A = ${P(A)}$ par $X ${a < 0 ? '+' : '-'} ${Math.abs(a)}$ ?`,
      answer: num(evalPoly(A, a)),
      hint: 'Le reste de la division par $X - a$ est $A(a)$.',
      correction: [`$A(${a}) = ${evalPoly(A, a)}$`],
    };
  }
  // A = B Q + R avec B = X² + pX + q, Q de degré 1 ou 2, R = rX + s.
  const B = [1, rng.int(-3, 3), rng.nonZero(-3, 3)];
  const Q = level === 2 ? [rng.nonZero(-2, 2), rng.int(-3, 3)] : [rng.nonZero(-2, 2), rng.int(-3, 3), rng.int(-3, 3)];
  const r = rng.int(-4, 4);
  const s = rng.int(-4, 4);
  const BQ = polyMul(B, Q);
  const A = BQ.map((c, i) => c + (i === BQ.length - 2 ? r : i === BQ.length - 1 ? s : 0));
  return {
    prompt: `On divise $A = ${P(A)}$ par $B = ${P(B)}$. Le reste s’écrit $R = rX + s$ : donne $r$ et $s$.`,
    answer: pairOf(r, s, ['r', 's']),
    hint: 'Pose la division comme avec des entiers : on élimine le terme de plus haut degré à chaque étape.',
    correction: [`$A = (${P(B)})(${P(Q)})${r === 0 && s === 0 ? '' : P([r, s]).startsWith('-') ? ` - ${P([r, s]).slice(1)}` : ` + ${P([r, s])}`}$`, `$r = ${r}$ et $s = ${s}$`],
  };
});

const multiplicite = skill('l1-multiplicite', 'Trouver la multiplicité d’une racine', (rng, level) => {
  const a = rng.nonZero(-2, 2);
  const m = rng.int(1, level === 1 ? 2 : 3);
  let b = rng.int(-3, 3);
  while (b === a) b = rng.int(-3, 3);
  const others = level === 3 ? [b, b === 0 ? 1 : -b].filter((x) => x !== a) : [b];
  const p = fromRoots(1, [...Array(m).fill(a), ...others]);
  const d1 = p.slice(0, -1).map((c, i) => c * (p.length - 1 - i));
  return {
    prompt: `Quelle est la multiplicité de la racine $${a}$ du polynôme $${P(p)}$ ?`,
    answer: num(m),
    hint: '$a$ est racine de multiplicité $m$ si $P(a) = P\'(a) = \\cdots = P^{(m-1)}(a) = 0$ et $P^{(m)}(a) \\neq 0$.',
    correction: [`$P(${a}) = 0$ et $P'(${a}) = ${evalPoly(d1, a)}$.`, `En factorisant : $P = (X ${a < 0 ? '+' : '-'} ${Math.abs(a)})^{${m}} \\times Q$ avec $Q(${a}) \\neq 0$. Multiplicité $${m}$.`],
  };
});

const relations = skill('l1-relations-coefficients-racines', 'Relier coefficients et racines', (rng, level) => {
  const lead = level === 1 ? 1 : rng.nonZero(-3, 3);
  const roots = [rng.int(-4, 4), rng.int(-4, 4), rng.int(-4, 4)];
  const [a, b, c, d] = fromRoots(lead, roots);
  const s1 = F(-b, a);
  const s2 = F(c, a);
  const s3 = F(-d, a);
  const kinds = [
    { tex: 'x_1 + x_2 + x_3', value: s1, why: `$-\\frac{b}{a} = ${tex(s1)}$` },
    { tex: 'x_1 x_2 x_3', value: s3, why: `$-\\frac{d}{a} = ${tex(s3)}$` },
    { tex: 'x_1x_2 + x_1x_3 + x_2x_3', value: s2, why: `$\\frac{c}{a} = ${tex(s2)}$` },
    { tex: 'x_1^2 + x_2^2 + x_3^2', value: sub(mul(s1, s1), mul(F(2), s2)), why: `$\\sigma_1^2 - 2\\sigma_2 = ${tex(sub(mul(s1, s1), mul(F(2), s2)))}$` },
  ];
  const k = level === 3 ? rng.pick(kinds.slice(2)) : rng.pick(kinds.slice(0, 3));
  return {
    prompt: `On note $x_1, x_2, x_3$ les racines (comptées avec multiplicité) de $${P([a, b, c, d])}$. Calcule $${k.tex}$ sans calculer les racines.`,
    answer: numF(k.value),
    hint: 'Pour $aX^3 + bX^2 + cX + d$ : $\\sigma_1 = -\\frac{b}{a}$, $\\sigma_2 = \\frac{c}{a}$, $\\sigma_3 = -\\frac{d}{a}$.',
    correction: [k.why],
  };
});

const racines = skill('l1-racines-polynome', 'Trouver les racines d’un polynôme', (rng, level) => {
  const lead = level === 3 ? rng.pick([1, 2, -1]) : 1;
  const roots = level === 1 ? [rng.int(-5, 5), rng.int(-5, 5)] : [rng.int(-4, 4), rng.int(-4, 4), rng.int(-4, 4)];
  const p = fromRoots(lead, roots);
  const evident = roots.find((r) => Math.abs(r) <= 1) ?? roots[0];
  return {
    prompt: `Trouve toutes les racines réelles de $${P(p)}$.${level > 1 ? ' (Il y a une racine évidente.)' : ''}`,
    answer: setOf([...new Set(roots)]),
    hint: level === 1 ? 'Discriminant, ou somme et produit des racines.' : 'Teste $0$, $1$, $-1$, $2$… puis factorise par $X - a$.',
    correction: [
      level > 1 ? `$${evident}$ est racine, on factorise par $X ${evident < 0 ? '+' : '-'} ${Math.abs(evident)}$.` : `$${P(p)} = ${roots.map((r) => (r === 0 ? 'X' : `(X ${r < 0 ? '+' : '-'} ${Math.abs(r)})`)).join('')}$`,
      `Racines : $${[...new Set(roots)].sort((x, y) => x - y).join(',\\ ')}$`,
    ],
  };
});

const taylor = skill('l1-formule-taylor-polynome', 'Utiliser la formule de Taylor pour un polynôme', (rng, level) => {
  const p = [rng.nonZero(-3, 3), rng.int(-4, 4), rng.int(-4, 4), rng.int(-5, 5)];
  const a = rng.nonZero(-2, 2);
  const k = level === 1 ? 1 : rng.int(2, 3);
  // Coefficient de (X - a)^k : P^(k)(a) / k!.
  let d = p;
  for (let i = 0; i < k; i++) d = d.slice(0, -1).map((c, j) => c * (d.length - 1 - j));
  const value = div(F(evalPoly(d, a)), F(k === 1 ? 1 : k === 2 ? 2 : 6));
  return {
    prompt: `On écrit $P = ${P(p)}$ dans la base des $(X ${a < 0 ? '+' : '-'} ${Math.abs(a)})^k$. Quel est le coefficient de $(X ${a < 0 ? '+' : '-'} ${Math.abs(a)})^{${k}}$ ?`,
    answer: numF(value),
    hint: 'Formule de Taylor : $P = \\sum_k \\frac{P^{(k)}(a)}{k!}(X - a)^k$.',
    correction: [`$P^{(${k})} = ${P(d)}$, donc $P^{(${k})}(${a}) = ${evalPoly(d, a)}$.`, `Coefficient : $\\frac{${evalPoly(d, a)}}{${k}!} = ${tex(value)}$`],
  };
});

const degre = skill('l1-degre-coefficient', 'Trouver le degré et le coefficient dominant', (rng, level) => {
  const a = rng.nonZero(-3, 3);
  const n = rng.int(2, 4);
  const b = rng.nonZero(-3, 3);
  const m = rng.int(1, 3);
  if (level === 1) {
    return {
      prompt: `Quel est le degré de $(${P([a, rng.int(-3, 3), 1])})^{${n}} (${P([b, 1])})^{${m}}$ ?`,
      answer: num(2 * n + m),
      hint: '$\\deg(PQ) = \\deg P + \\deg Q$ et $\\deg(P^n) = n\\deg P$.',
      correction: [`$${n}\\times 2 + ${m}\\times 1 = ${2 * n + m}$`],
    };
  }
  // (aX + 1)^n − (a X)^n : le terme dominant disparaît, il reste n a^{n−1} X^{n−1}.
  const value = n * a ** (n - 1);
  return {
    prompt: `Quel est le coefficient dominant de $(${P([a, 1])})^{${n}} ${a ** n < 0 ? '+' : '-'} ${Math.abs(a ** n)}X^{${n}}$ ?`,
    answer: num(value),
    hint: 'Développe avec le binôme : le terme de plus haut degré se simplifie.',
    correction: [`$(${P([a, 1])})^{${n}} = ${par(a ** n)}X^{${n}} + \\binom{${n}}{1}${par(a ** (n - 1))}X^{${n - 1}} + \\cdots$`, `Il reste le terme en $X^{${n - 1}}$, de coefficient $${binom(n, 1)}\\times${par(a ** (n - 1))} = ${value}$.`],
  };
});

export const POLYNOMES_SKILLS: Skill[] = enrichir([division, racines, degre, multiplicite, relations, taylor], POLYNOMES_VARIANTES);
