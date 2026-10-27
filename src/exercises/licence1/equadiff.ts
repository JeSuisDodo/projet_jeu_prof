import type { Skill } from '../types';
import { F, div, linComb, numF, pairOf, setOf, skill, sub, tex, texChoice } from './util';

/** Chapitre « Équations différentielles linéaires » (Licence 1). */

const lhs = linComb;

const ordre1 = skill('l1-ed-ordre1', 'Résoudre une équation différentielle d’ordre 1', (rng, level) => {
  const a = rng.nonZero(-4, 4);
  const b = level === 1 ? 0 : rng.nonZero(-6, 6);
  const y0 = rng.int(-5, 5);
  // y' + a y = b : y = b/a + C e^{−ax}, y(0) = y0 ⇒ C = y0 − b/a.
  const K = F(b, a);
  const C = sub(F(y0), K);
  const ax = -a === 1 ? 'x' : -a === -1 ? '-x' : `${-a}x`;
  return {
    prompt: `On résout $${lhs([[1, "y'"], [a, 'y']])} = ${b}$ avec $y(0) = ${y0}$. La solution s’écrit $y(x) = K + Ce^{${ax}}$ : donne $K$ et $C$.`,
    answer: pairOf(K, C, ['K', 'C']),
    hint: 'Solution générale : une solution particulière constante plus $Ce^{-ax}$ ; la condition initiale fixe $C$.',
    correction: [`Solution constante : $${a === 1 ? '' : a === -1 ? '-' : a}K = ${b}$, donc $K = ${tex(K)}$.`, `$y(0) = K + C = ${y0}$, donc $C = ${tex(C)}$.`],
  };
});

const caracteristique = skill('l1-ed-equation-caracteristique', 'Écrire l’équation caractéristique', (rng, level) => {
  const r1 = rng.int(-4, 4);
  let r2 = rng.int(-4, 4);
  if (level === 1) while (r2 === r1) r2 = rng.int(-4, 4);
  const p = -(r1 + r2);
  const q = r1 * r2;
  return {
    prompt: `Quelles sont les racines de l’équation caractéristique de $${lhs([[1, "y''"], [p, "y'"], [q, 'y']])} = 0$ ?`,
    answer: setOf([...new Set([r1, r2])]),
    hint: 'L’équation caractéristique de $y\'\' + py\' + qy = 0$ est $r^2 + pr + q = 0$.',
    correction: [`$${lhs([[1, 'r^2'], [p, 'r'], [q, '']]) || '0'} = 0$ a pour racines $${[...new Set([r1, r2])].sort((x, y) => x - y).join('$ et $')}$.`],
  };
});

const ordre2 = skill('l1-ed-ordre2-conditions', 'Résoudre une équation d’ordre 2 avec conditions initiales', (rng, level) => {
  const r1 = rng.int(-3, 2);
  const r2 = r1 + rng.int(1, 3);
  const lambda = rng.nonZero(-3, 3);
  const mu = level === 1 ? rng.int(-3, 3) : rng.nonZero(-4, 4);
  const y0 = lambda + mu;
  const y1 = lambda * r1 + mu * r2;
  const e = (r: number) => (r === 0 ? '' : `e^{${r === 1 ? '' : r === -1 ? '-' : r}x}`);
  return {
    prompt: `$${lhs([[1, "y''"], [-(r1 + r2), "y'"], [r1 * r2, 'y']])} = 0$, $y(0) = ${y0}$ et $y'(0) = ${y1}$. On écrit $y = \\lambda ${e(r1)} + \\mu ${e(r2)}$ : donne $\\lambda$ et $\\mu$.`,
    answer: pairOf(lambda, mu, ['\\lambda', '\\mu']),
    hint: '$y(0) = \\lambda + \\mu$ et $y\'(0) = \\lambda r_1 + \\mu r_2$.',
    correction: [`Racines caractéristiques : $${r1}$ et $${r2}$.`, `$\\lambda + \\mu = ${y0}$ et $${linComb([[r1, '\\lambda'], [r2, '\\mu']])} = ${y1}$`, `$\\lambda = ${lambda}$, $\\mu = ${mu}$`],
  };
});

const formeSolutions = skill('l1-ed-forme-solutions', 'Donner la forme des solutions', (rng, level) => {
  const kinds = [
    () => {
      const w = rng.int(1, 5);
      const wx = w === 1 ? 'x' : `${w}x`;
      return {
        eq: lhs([[1, "y''"], [w * w, 'y']]),
        correct: `A\\cos(${wx}) + B\\sin(${wx})`,
        decoys: [`Ae^{${wx}} + Be^{-${wx}}`, `(Ax + B)e^{${wx}}`, `A\\cos(${w * w}x) + B\\sin(${w * w}x)`],
        why: `Racines $\\pm ${w === 1 ? '' : w}i$.`,
      };
    },
    () => {
      const r = rng.nonZero(-3, 3);
      const rx = r === 1 ? 'x' : r === -1 ? '-x' : `${r}x`;
      return {
        eq: lhs([[1, "y''"], [-2 * r, "y'"], [r * r, 'y']]),
        correct: `(Ax + B)e^{${rx}}`,
        decoys: [`Ae^{${rx}} + Be^{${r === 1 ? '-x' : r === -1 ? 'x' : `${-r}x`}}`, `Ae^{${rx}}`, `A\\cos(${rx}) + B\\sin(${rx})`],
        why: `Racine double $${r}$.`,
      };
    },
    () => {
      const al = rng.nonZero(-2, 2);
      const be = rng.int(1, 3);
      const ax = al === 1 ? 'x' : al === -1 ? '-x' : `${al}x`;
      const bx = be === 1 ? 'x' : `${be}x`;
      return {
        eq: lhs([[1, "y''"], [-2 * al, "y'"], [al * al + be * be, 'y']]),
        correct: `e^{${ax}}\\left(A\\cos(${bx}) + B\\sin(${bx})\\right)`,
        decoys: [`e^{${bx}}\\left(A\\cos(${ax}) + B\\sin(${ax})\\right)`, `Ae^{${ax}} + Be^{${bx}}`, `(Ax + B)e^{${ax}}`],
        why: `Racines $${al} \\pm ${be === 1 ? '' : be}i$.`,
      };
    },
  ];
  const k = rng.pick(level === 1 ? kinds.slice(0, 1) : level === 2 ? kinds.slice(0, 2) : kinds)();
  return {
    prompt: `Quelle est la forme des solutions réelles de $${k.eq} = 0$ ($A, B$ réels) ?`,
    answer: texChoice(rng, k.correct, k.decoys),
    hint: 'Résous l’équation caractéristique : deux racines réelles, une racine double ou deux racines complexes conjuguées.',
    correction: [k.why, `Solutions : $y = ${k.correct}$`],
  };
});

const particuliere = skill('l1-ed-solution-particuliere', 'Trouver une solution particulière', (rng, level) => {
  const a = rng.nonZero(-4, 4);
  const m = rng.nonZero(-6, 6);
  const n = rng.int(-6, 6);
  if (level === 1) {
    const c = rng.nonZero(-8, 8);
    return {
      prompt: `Trouve la solution constante de $${lhs([[1, "y'"], [a, 'y']])} = ${c}$.`,
      answer: numF(F(c, a)),
      hint: 'Une constante $k$ a une dérivée nulle : $ak = c$.',
      correction: [`$${a}k = ${c}$, donc $k = ${tex(F(c, a))}$.`],
    };
  }
  // y' + a y = m x + n, y = p x + r : a p = m, p + a r = n.
  const p = F(m, a);
  const r = div(sub(F(n), p), F(a));
  return {
    prompt: `On cherche une solution $y = px + r$ de $${lhs([[1, "y'"], [a, 'y']])} = ${lhs([[m, 'x']])}${n === 0 ? '' : ` ${n < 0 ? '-' : '+'} ${Math.abs(n)}`}$. Donne $p$ et $r$.`,
    answer: pairOf(p, r, ['p', 'r']),
    hint: 'Remplace $y$ par $px + r$ et identifie les coefficients de $x$ et les constantes.',
    correction: [`$p + ${a < 0 ? `(${a})` : a}(px + r) = ${a < 0 ? `(${a})` : a}p\\,x + (p + ${a < 0 ? `(${a})` : a}r)$`, `$${a}p = ${m}$ donne $p = ${tex(p)}$, puis $p + ${a < 0 ? `(${a})` : a}r = ${n}$ donne $r = ${tex(r)}$.`],
  };
});

export const EQUADIFF_SKILLS: Skill[] = [ordre1, caracteristique, particuliere, formeSolutions, ordre2];
