import type { Skill } from '../types';
import { F, bound, choiceTex, fixedChoice, num, numF, plus, poly, skill, sub, div, tex } from './util';

/** Chapitre « Limites de suites » (Terminale spécialité). */

const INF = ['+\\infty', '-\\infty'];

const quotient = skill('tle-limite-quotient', 'Lever une indétermination dans un quotient', (rng, level) => {
  const p = rng.int(1, level === 1 ? 2 : 3);
  const q = level === 1 ? p : rng.int(1, 3);
  const a = rng.nonZero(-5, 5);
  const c = rng.nonZero(-4, 6);
  const top = [a, ...Array.from({ length: p }, () => rng.int(-6, 6))];
  const bottom = [c, ...Array.from({ length: q }, () => rng.int(-6, 6))];
  let correct: string;
  let why: string;
  if (p === q) {
    correct = tex(F(a, c));
    why = `Même degré : la limite est le quotient des termes de plus haut degré, $\\frac{${a}}{${c}} = ${correct}$.`;
  } else if (p < q) {
    correct = '0';
    why = 'Le degré du numérateur est plus petit : le quotient tend vers $0$.';
  } else {
    correct = a / c > 0 ? '+\\infty' : '-\\infty';
    why = `Après factorisation, le quotient se comporte comme $\\frac{${a}}{${c}}n^{${p - q}}$, qui tend vers $${correct}$.`;
  }
  const answer = choiceTex(rng, correct, ['0', ...INF, tex(F(c, a)), tex(F(a))], () => tex(F(a + rng.nonZero(-3, 3), c)));
  return {
    prompt: `Quelle est la limite de $u_n = \\frac{${poly(top, 'n')}}{${poly(bottom, 'n')}}$ quand $n \\to +\\infty$ ?`,
    answer,
    hint: 'Factorise le numérateur et le dénominateur par leur terme de plus haut degré.',
    correction: [
      `$u_n = \\frac{${p === 1 ? "n" : `n^{${p}}`}\\left(${a} + \\dots\\right)}{${q === 1 ? "n" : `n^{${q}}`}\\left(${c} + \\dots\\right)}$, les termes « $\\dots$ » tendant vers $0$.`,
      why,
    ],
  };
});

const geometrique = skill('tle-limite-qn', 'Limite d’une suite géométrique', (rng, level) => {
  const qs = [F(3), F(2), F(1, 2), F(-1, 3), F(3, 2), F(-2), F(2, 5), F(1), F(-1), F(5, 4), F(4, 5)];
  const q = rng.pick(level === 1 ? qs.slice(0, 4) : qs);
  const c = level === 3 ? rng.nonZero(-4, 4) : 1;
  const d = level === 1 ? 0 : rng.int(-5, 5);
  const v = q.n / q.d;
  let correct: string;
  let rule: string;
  if (v === 1) {
    correct = String(c + d);
    rule = '$q = 1$ : $q^n = 1$ pour tout $n$.';
  } else if (v <= -1) {
    correct = '\\text{pas de limite}';
    rule = '$q \\leq -1$ : $q^n$ alterne de signe et n’a pas de limite.';
  } else if (Math.abs(v) < 1) {
    correct = String(d);
    rule = '$-1 < q < 1$ : $q^n \\to 0$.';
  } else {
    correct = c > 0 ? '+\\infty' : '-\\infty';
    rule = '$q > 1$ : $q^n \\to +\\infty$.';
  }
  const lead = c === 1 ? '' : c === -1 ? '-' : `${c}\\times`;
  const answer = choiceTex(rng, correct, ['0', ...INF, '\\text{pas de limite}', String(d), String(c + d)], () => String(d + rng.nonZero(-3, 3)));
  return {
    prompt: `Quelle est la limite de $u_n = ${lead}\\left(${tex(q)}\\right)^n${plus(d)}$ ?`,
    answer,
    hint: 'Compare la raison $q$ à $-1$ et à $1$.',
    correction: [rule, `Donc $\\lim u_n = ${correct}$.`],
  };
});

const pointFixe = skill('tle-limite-point-fixe', 'Trouver la limite d’une suite arithmético-géométrique', (rng, level) => {
  const a = rng.pick(level === 1 ? [F(1, 2)] : [F(1, 2), F(1, 3), F(2, 3), F(-1, 2), F(3, 4)]);
  const b = rng.nonZero(-9, 9);
  const l = div(F(b), sub(F(1), a));
  return {
    prompt: `On admet que la suite définie par $u_0 = ${rng.int(0, 9)}$ et $u_{n+1} = ${tex(a)}u_n${plus(b)}$ converge vers $\\ell$. Calcule $\\ell$.`,
    answer: numF(l),
    hint: 'La limite d’une telle suite vérifie $\\ell = f(\\ell)$ : passe à la limite dans la relation de récurrence.',
    correction: [`$\\ell = ${tex(a)}\\ell${plus(b)}$`, `$\\left(1 - ${tex(a).startsWith('-') ? `\\left(${tex(a)}\\right)` : tex(a)}\\right)\\ell = ${b}$, donc $\\ell = ${tex(l)}$.`],
  };
});

const gendarmes = skill('tle-gendarmes', 'Utiliser le théorème des gendarmes', (rng, level) => {
  const c = rng.int(-6, 6);
  const k = rng.int(1, bound(level, 1, 3, 5));
  const osc = rng.pick(['(-1)^n', '\\cos(n)', '\\sin(n)']);
  const pow = level === 3 ? rng.pick(['n', 'n^2', '\\sqrt{n}']) : 'n';
  const sign = c === 0 ? '' : `${c} + `;
  return {
    prompt: `Pour $n \\geq 1$, $u_n = ${sign}\\frac{${k === 1 ? '' : k}${osc}}{${pow}}$. Quelle est la limite de $(u_n)$ ?`,
    answer: num(c),
    hint: `Encadre $${osc}$ entre $-1$ et $1$.`,
    correction: [
      `$-1 \\leq ${osc} \\leq 1$, donc $${c} - \\frac{${k}}{${pow}} \\leq u_n \\leq ${c} + \\frac{${k}}{${pow}}$.`,
      `Les deux suites qui encadrent tendent vers $${c}$ : par le théorème des gendarmes, $\\lim u_n = ${c}$.`,
    ],
  };
});

const seuil = skill('tle-seuil', 'Déterminer un rang à partir duquel on dépasse un seuil', (rng, level) => {
  const q = rng.pick(level === 1 ? [2] : [2, 3]);
  const u0 = rng.pick(level === 3 ? [3, 5, 7] : [1]);
  const s = rng.int(bound(level, 50, 200, 1000), bound(level, 900, 5000, 50000));
  let n = 0;
  while (u0 * q ** n <= s) n++;
  const lines = [`$u_{${n - 1}} = ${u0 * q ** (n - 1)} \\leq ${s}$`, `$u_{${n}} = ${u0 * q ** n} > ${s}$`];
  return {
    prompt: `$u_n = ${u0 === 1 ? '' : `${u0}\\times`}${q}^n$. Quel est le plus petit entier $n$ tel que $u_n > ${s}$ ?`,
    answer: num(n),
    hint: 'La suite est croissante : calcule les termes jusqu’à dépasser le seuil (c’est ce que fait l’algorithme de seuil).',
    correction: [...lines, `La suite est croissante, donc le rang cherché est $n = ${n}$.`],
  };
});

const comparaison = skill('tle-comparaison', 'Limite par comparaison', (rng) => {
  const up = rng.next() < 0.5;
  const k = rng.int(1, 5);
  const correct = up ? '+\\infty' : '-\\infty';
  const ineq = up ? `u_n \\geq ${k === 1 ? '' : k}n^2` : `u_n \\leq -${k === 1 ? '' : k}\\sqrt{n}`;
  return {
    prompt: `Pour tout $n$, $${ineq}$. Que peut-on dire de $(u_n)$ ?`,
    answer: fixedChoice(
      ['Elle tend vers $+\\infty$', 'Elle tend vers $-\\infty$', 'Elle converge vers $0$', 'On ne peut rien dire'],
      up ? 0 : 1,
    ),
    hint: 'Si $u_n \\geq v_n$ et $v_n \\to +\\infty$, alors $u_n \\to +\\infty$.',
    correction: [`La suite minorante (ou majorante) tend vers $${correct}$.`, `Par comparaison, $\\lim u_n = ${correct}$.`],
  };
});

const monotone = skill('tle-convergence-monotone', 'Utiliser le théorème de convergence monotone', (rng) => {
  const cases = [
    { text: 'croissante et majorée par $5$', correct: 0 },
    { text: 'décroissante et minorée par $0$', correct: 0 },
    { text: 'croissante et non majorée', correct: 1 },
    { text: 'décroissante et non minorée', correct: 2 },
  ];
  const c = rng.pick(cases);
  return {
    prompt: `La suite $(u_n)$ est ${c.text}. Que peut-on en déduire ?`,
    answer: fixedChoice(['Elle converge', 'Elle tend vers $+\\infty$', 'Elle tend vers $-\\infty$', 'On ne peut rien dire'], c.correct),
    hint: 'Toute suite croissante majorée (ou décroissante minorée) converge ; croissante non majorée, elle tend vers $+\\infty$.',
    correction: [
      ['Croissante et majorée : elle converge (théorème de convergence monotone), sa limite est au plus le majorant.',
        'Décroissante et minorée : elle converge (théorème de convergence monotone).',
        'Croissante et non majorée : elle tend vers $+\\infty$.',
        'Décroissante et non minorée : elle tend vers $-\\infty$.'][cases.indexOf(c)],
    ],
  };
});

export const LIMITES_SUITES_SKILLS: Skill[] = [quotient, geometrique, pointFixe, gendarmes, seuil, comparaison, monotone];
