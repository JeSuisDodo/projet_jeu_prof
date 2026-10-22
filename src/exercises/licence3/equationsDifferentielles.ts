import { frac } from '../fraction';
import type { Skill } from '../types';
import { F, choiceTex, combo, div, fixedChoice, numF, parF, skill, sub, tex } from './util';

/** Chapitre « Équations différentielles » (Licence 3). */

/** Membre de gauche « y'' + py' + qy ». */
const lhs2 = (p: number, q: number, v = 'y', d = "'") => {
  const rest = combo([
    [p, `${v}${d}`],
    [q, v],
  ]);
  return rest === '0' ? `${v}${d}${d}` : `${v}${d}${d}${rest.startsWith('-') ? ` - ${rest.slice(1)}` : ` + ${rest}`}`;
};

/** e^{rx}, vide si r = 0. */
const expo = (r: number, v = 'x') => (r === 0 ? '' : `e^{${r === 1 ? '' : r === -1 ? '-' : r}${v}}`);

/** Polynôme caractéristique r² + pr + q. */
const charPoly = (p: number, q: number) =>
  combo([
    [1, 'r^2'],
    [p, 'r'],
    [q, ''],
  ]);

/** Facteur (r - r₀). */
const factor = (r0: number) => (r0 === 0 ? 'r' : `(r ${r0 < 0 ? '+' : '-'} ${Math.abs(r0)})`);

const caracteristique = skill('l3-equation-caracteristique', 'Résoudre une équation linéaire d’ordre 2', (rng, level) => {
  if (level === 3) {
    const alpha = rng.int(-3, 3);
    const beta = rng.int(1, 4);
    const p = -2 * alpha;
    const q = alpha * alpha + beta * beta;
    const ex = expo(alpha);
    const b = beta === 1 ? '' : beta;
    const trig = `A\\cos(${b}x) + B\\sin(${b}x)`;
    const correct = alpha === 0 ? trig : `${ex}\\left(${trig}\\right)`;
    const exWrong = `e^{${beta === 1 ? '' : beta}x}`;
    return {
      prompt: `Quelle est la solution générale réelle de $${lhs2(p, q)} = 0$ ?`,
      answer: choiceTex(
        rng,
        correct,
        [
          `${exWrong}\\left(A\\cos(${alpha === 0 ? '' : Math.abs(alpha) === 1 ? '' : Math.abs(alpha)}x) + B\\sin(${alpha === 0 ? '' : Math.abs(alpha) === 1 ? '' : Math.abs(alpha)}x)\\right)`,
          `A${expo(alpha + beta)} + B${expo(alpha - beta)}`,
          `${ex}\\left(A\\cos(${beta * beta}x) + B\\sin(${beta * beta}x)\\right)`,
          `(Ax + B)${expo(alpha === 0 ? 1 : alpha)}`,
        ],
        () => `Ae^{${beta + 1}x}\\cos(x)`,
      ),
      hint: 'Équation caractéristique $r^2 + pr + q = 0$ ; racines complexes $\\alpha \\pm i\\beta$ : $y = e^{\\alpha x}(A\\cos \\beta x + B\\sin \\beta x)$.',
      correction: [`L’équation caractéristique $${charPoly(p, q)} = 0$ a pour racines $${alpha === 0 ? '' : alpha} \\pm ${beta === 1 ? '' : beta}i$.`, `Solution générale : $y = ${correct}$`],
    };
  }
  const r1 = rng.int(-4, 4);
  const r2 = level === 1 ? rng.int(-4, 4) : r1;
  const p = -(r1 + r2);
  const q = r1 * r2;
  const roots = r1 === r2 ? [F(r1)] : [F(r1), F(r2)];
  return {
    prompt: `Donne les racines de l’équation caractéristique de $${lhs2(p, q)} = 0$${r1 === r2 ? ' (racine double)' : ''}.`,
    answer: { kind: 'set', values: roots },
    hint: `Remplace $y = e^{rx}$ : $r^2 + pr + q = 0$.${level === 2 ? ' Une racine double $r_0$ donne $y = (Ax + B)e^{r_0x}$.' : ''}`,
    correction: [`$${charPoly(p, q)} = ${r1 === r2 ? `${factor(r1)}^2` : `${factor(r1)}${factor(r2)}`}$`, `Racine${r1 === r2 ? ' double' : 's'} : $${roots.map(tex).join('$ et $')}$`],
  };
});

const affine = skill('l3-ordre1-affine', 'Résoudre $y\' = ay + b$', (rng, level) => {
  const a = rng.nonZero(-4, -1) * (level === 3 ? rng.sign() : 1);
  const b = rng.nonZero(-6, 6);
  const eq = div(F(-b), F(a));
  const lhs = `y' = ${combo([
    [a, 'y'],
    [b, ''],
  ])}`;
  if (level === 1) {
    return {
      prompt: `Toutes les solutions de $${lhs}$ convergent vers la même limite en $+\\infty$. Laquelle ?`,
      answer: numF(eq),
      hint: 'Les solutions sont $y = Ce^{at} - \\frac{b}{a}$ ; avec $a < 0$, l’exponentielle tend vers $0$.',
      correction: [`Solution constante : $0 = ${a}y ${b < 0 ? '-' : '+'} ${Math.abs(b)}$, donc $y = ${tex(eq)}$.`, `Comme $${a} < 0$, $Ce^{${a}t} \\to 0$ : limite $${tex(eq)}$.`],
    };
  }
  const y0 = rng.int(-5, 5);
  const C = sub(F(y0), eq);
  return {
    prompt: `La solution de $${lhs}$ avec $y(0) = ${y0}$ s’écrit $y(t) = Ce^{${a}t} + K$. Donne $C$.`,
    answer: numF(C),
    hint: '$K$ est la solution constante, puis $C = y(0) - K$.',
    correction: [`Solution constante : $K = -\\frac{${b}}{${a}} = ${tex(eq)}$.`, `$C = ${y0} - ${parF(eq)} = ${tex(C)}$`],
  };
});

const cauchyOrdre2 = skill('l3-probleme-cauchy-ordre2', 'Résoudre un problème de Cauchy d’ordre 2', (rng, level) => {
  const r1 = rng.int(-3, 3);
  let r2 = rng.int(-3, 3);
  if (r2 === r1) r2 = r1 + rng.pick([1, 2]);
  const p = -(r1 + r2);
  const q = r1 * r2;
  const y0 = rng.int(-4, 4);
  const v0 = rng.int(-6, 6);
  const A = frac(v0 - r2 * y0, r1 - r2);
  const B = sub(F(y0), A);
  const e = (r: number) => expo(r, 't');
  const eq = `${lhs2(p, q)} = 0`;
  const both = level === 3;
  return {
    prompt: `On résout $${eq}$ avec $y(0) = ${y0}$ et $y'(0) = ${v0}$. La solution s’écrit $y(t) = A${e(r1)} + B${e(r2)}$. ${both ? 'Donne $A$ et $B$.' : 'Donne $A$.'}`,
    answer: both ? { kind: 'pair', values: [A, B], labels: ['A', 'B'] } : numF(A),
    hint: 'Écris $y(0) = A + B$ et $y\'(0) = r_1A + r_2B$, puis résous le système.',
    correction: [`$A + B = ${y0}$ et $${combo([
        [r1, 'A'],
        [r2, 'B'],
      ])} = ${v0}$.`, `$A = \\frac{${v0} - (${r2})\\times(${y0})}{${r1} - (${r2})} = ${tex(A)}$ et $B = ${tex(B)}$.`],
  };
});

const systeme = skill('l3-systeme-lineaire', 'Étudier un système différentiel linéaire', (rng, level) => {
  // M = P D P⁻¹ avec P = [[1, k], [0, 1]] : M = [[l1, k(l2 - l1)], [0, l2]] puis transposée éventuelle.
  const l1 = rng.nonZero(-4, 4);
  let l2 = rng.nonZero(-4, 4);
  if (level === 1) l2 = l1 < 0 ? rng.int(-4, -1) : rng.int(1, 4);
  const k = rng.int(-2, 2);
  let m = [l1, k * (l2 - l1), 0, l2];
  if (level >= 2 && rng.next() < 0.5) m = [l1, 0, k * (l2 - l1), l2];
  if (level === 3) {
    // Conjugaison par [[1, 0], [1, 1]] pour une matrice pleine.
    const [a, b, c, d] = m;
    m = [a + b, b, c + d - a - b, d - b];
  }
  const stable = l1 < 0 && l2 < 0;
  const options = ['Asymptotiquement stable', 'Instable', 'Stable mais pas asymptotiquement'];
  return {
    prompt: `On étudie $X' = MX$ avec $M = \\begin{pmatrix} ${m[0]} & ${m[1]} \\\\ ${m[2]} & ${m[3]} \\end{pmatrix}$. L’équilibre $X = 0$ est :`,
    answer: fixedChoice(options, stable ? 0 : 1),
    hint: 'Cherche les valeurs propres de $M$ : toutes de partie réelle $< 0$ donne la stabilité asymptotique, une seule $> 0$ rend l’équilibre instable.',
    correction: [
      `$\\operatorname{tr} M = ${l1 + l2}$ et $\\det M = ${l1 * l2}$ : les valeurs propres sont $${l1}$ et $${l2}$.`,
      stable ? 'Elles sont toutes deux négatives : asymptotiquement stable.' : 'Une valeur propre est positive : instable.',
    ],
  };
});

const explosion = skill('l3-temps-explosion', 'Trouver le temps d’explosion d’une solution', (rng, level) => {
  const k = level === 1 ? 1 : rng.int(1, 4);
  const a = level === 3 ? F(1, rng.int(2, 4)) : F(rng.int(1, 5));
  const T = div(F(1), F(k * a.n, a.d));
  return {
    prompt: `La solution maximale de $y' = ${k === 1 ? '' : k}y^2$, $y(0) = ${tex(a)}$ est définie sur $\\left]-\\infty\\,;\\,T\\right[$. Donne $T$.`,
    answer: numF(T),
    hint: 'Sépare les variables : $\\frac{y\'}{y^2} = k$, donc $-\\frac{1}{y} = kt + c$.',
    correction: [`$y(t) = \\frac{1}{\\frac{1}{y_0} - ${k === 1 ? '' : k}t}$, qui explose quand le dénominateur s’annule.`, k === 1 && a.d === 1 ? `$T = \\frac{1}{${tex(a)}}$` : `$T = \\frac{1}{${k === 1 ? '' : `${k}\\times `}${tex(a)}} = ${tex(T)}$`],
  };
});

const variation = skill('l3-solution-particuliere', 'Trouver une solution particulière', (rng, level) => {
  const a = rng.nonZero(-4, 4);
  let c = rng.nonZero(-3, 3);
  if (c === -a) c = c + (c > 0 ? 1 : -1) || 1;
  const b = rng.nonZero(-6, 6);
  const K = div(F(b), F(c + a));
  const second = level === 3;
  const eqL = `y' ${a < 0 ? '-' : '+'} ${Math.abs(a) === 1 ? '' : Math.abs(a)}y`;
  return {
    prompt: `Cherche une solution particulière de $${eqL} = ${b === 1 ? '' : b === -1 ? '-' : b}e^{${c === 1 ? '' : c === -1 ? '-' : c}t}$ sous la forme $y_p(t) = Ke^{${c === 1 ? '' : c === -1 ? '-' : c}t}$. Donne $K$.`,
    answer: numF(K),
    hint: 'Remplace $y_p$ dans l’équation : $cK + aK = b$.',
    correction: [`$${combo([
        [c, 'K'],
        [a, 'K'],
      ])} = ${b}$, donc $K = \\frac{${b}}{${c + a}} = ${tex(K)}$.`, ...(second ? [`Solution générale : $y = ${tex(K)}${expo(c, 't')} + C${expo(-a, 't')}$.`] : [])],
  };
});

export const EQUATIONS_DIFFERENTIELLES_SKILLS: Skill[] = [caracteristique, affine, cauchyOrdre2, systeme, explosion, variation];
