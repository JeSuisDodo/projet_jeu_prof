import type { Skill } from '../types';
import { F, NATURE, choiceTex, div, fact, fixedChoice, fpow, numF, skill, sub, tex } from './util';

/** Chapitre « Intégrales généralisées » (L2). */

const EXPONENTS = [F(1, 2), F(1), F(3, 2), F(2), F(1, 3), F(4, 3), F(3), F(2, 3)];

const tPow = (a: ReturnType<typeof F>) => (a.n === a.d ? 't' : `t^{${tex(a)}}`);

const riemann = skill('l2-integrale-riemann', 'Reconnaître une intégrale de Riemann', (rng, level) => {
  const a = rng.pick(level === 1 ? [F(1, 2), F(2), F(1), F(3)] : EXPONENTS);
  const atInfinity = level === 1 ? true : rng.next() < 0.5;
  const converges = atInfinity ? a.n > a.d : a.n < a.d;
  return {
    prompt: atInfinity
      ? `Quelle est la nature de $\\displaystyle\\int_1^{+\\infty} \\frac{dt}{${tPow(a)}}$ ?`
      : `Quelle est la nature de $\\displaystyle\\int_0^{1} \\frac{dt}{${tPow(a)}}$ ?`,
    answer: fixedChoice(NATURE, converges ? 0 : 1),
    hint: '$\\int_1^{+\\infty} \\frac{dt}{t^\\alpha}$ converge si et seulement si $\\alpha > 1$ ; $\\int_0^1 \\frac{dt}{t^\\alpha}$ converge si et seulement si $\\alpha < 1$.',
    correction: [`Intégrale de Riemann d’exposant $\\alpha = ${tex(a)}$ en $${atInfinity ? '+\\infty' : '0'}$ : ${converges ? 'convergente' : 'divergente'}.`],
  };
});

const puissance = skill('l2-integrale-puissance', 'Calculer une intégrale de Riemann convergente', (rng, level) => {
  const atInfinity = level === 1 || rng.next() < 0.5;
  const a = atInfinity ? rng.pick(level === 1 ? [F(2), F(3), F(4)] : [F(2), F(3), F(3, 2), F(5, 2), F(4, 3)]) : rng.pick([F(1, 2), F(1, 3), F(2, 3), F(3, 4)]);
  const c = level === 3 ? rng.int(2, 5) : 1;
  // ∫₁^∞ c t^{-a} dt = c/(a − 1) ; ∫₀¹ c t^{-a} dt = c/(1 − a)
  const v = div(F(c), atInfinity ? sub(a, F(1)) : sub(F(1), a));
  const e = sub(F(1), a);
  return {
    prompt: atInfinity
      ? `Calcule $\\displaystyle\\int_1^{+\\infty} \\frac{${c}}{${tPow(a)}}\\,dt$.`
      : `Calcule $\\displaystyle\\int_0^{1} \\frac{${c}}{${tPow(a)}}\\,dt$.`,
    answer: numF(v),
    hint: `Une primitive de $t^{-\\alpha}$ est $\\dfrac{t^{1-\\alpha}}{1 - \\alpha}$ ($\\alpha \\neq 1$) ; passe ensuite à la limite.`,
    correction: [
      `Une primitive de $t^{-${tex(a)}}$ est $\\dfrac{t^{${tex(e)}}}{${tex(e)}}$.`,
      atInfinity ? `Quand $X \\to +\\infty$, $X^{${tex(e)}} \\to 0$ : l’intégrale vaut $\\dfrac{${c}}{${tex(sub(a, F(1)))}} = ${tex(v)}$.` : `Quand $\\varepsilon \\to 0$, $\\varepsilon^{${tex(e)}} \\to 0$ : l’intégrale vaut $\\dfrac{${c}}{${tex(e)}} = ${tex(v)}$.`,
    ],
  };
});

const exponentielle = skill('l2-integrale-exponentielle', 'Intégrer une exponentielle sur [0, +∞[', (rng, level) => {
  const a = rng.pick([F(1), F(2), F(3), F(1, 2), F(1, 3)]);
  const n = level === 1 ? 0 : rng.int(1, level === 2 ? 1 : 3);
  // ∫₀^∞ tⁿ e^{-at} dt = n! / a^{n+1}
  const v = div(F(fact(n)), fpow(a, n + 1));
  const at = a.n === a.d ? 't' : `${tex(a)}t`;
  const tn = n === 0 ? '' : n === 1 ? 't\\,' : `t^{${n}}`;
  return {
    prompt: `Calcule $\\displaystyle\\int_0^{+\\infty} ${tn}e^{-${at}}\\,dt$.`,
    answer: numF(v),
    hint: n === 0 ? 'Une primitive de $e^{-at}$ est $-\\frac{1}{a}e^{-at}$.' : 'Intègre par parties (ou utilise $\\int_0^{+\\infty} t^n e^{-at}\\,dt = \\frac{n!}{a^{n+1}}$).',
    correction: n === 0 ? [`$\\left[-${a.n === a.d ? '' : `\\frac{1}{${tex(a)}}`}e^{-${at}}\\right]_0^{+\\infty} = ${tex(v)}$`] : [`Par ${n} intégration${n > 1 ? 's' : ''} par parties : $\\dfrac{${n}!}{${a.d === 1 ? tex(a) : `\\left(${tex(a)}\\right)`}^{${n + 1}}} = ${tex(v)}$`],
  };
});

const rationnelle = skill('l2-integrale-rationnelle', 'Calculer une intégrale généralisée de fraction rationnelle', (rng, level) => {
  if (level === 1 || rng.next() < 0.5) {
    const a = rng.int(1, 4);
    const correct = a === 1 ? '\\frac{\\pi}{2}' : `\\frac{\\pi}{${2 * a}}`;
    return {
      prompt: `Calcule $\\displaystyle\\int_0^{+\\infty} \\frac{dt}{t^2 + ${a * a}}$.`,
      answer: choiceTex(rng, correct, ['\\pi', `\\frac{\\pi}{${4 * a}}`, a === 1 ? '2\\pi' : `\\frac{${a}\\pi}{2}`, '+\\infty'], () => `\\frac{\\pi}{${2 * a + 1}}`),
      hint: 'Une primitive de $\\dfrac{1}{t^2 + a^2}$ est $\\dfrac{1}{a}\\arctan\\dfrac{t}{a}$.',
      correction: [
        a === 1
          ? `$\\left[\\arctan t\\right]_0^{+\\infty} = ${correct}$`
          : `$\\left[\\frac{1}{${a}}\\arctan\\frac{t}{${a}}\\right]_0^{+\\infty} = \\frac{1}{${a}}\\times\\frac{\\pi}{2} = ${correct}$`,
      ],
    };
  }
  const k = rng.int(1, 3);
  const correct = k === 1 ? '\\ln 2' : `\\frac{\\ln ${k + 1}}{${k}}`;
  return {
    prompt: `Calcule $\\displaystyle\\int_1^{+\\infty} \\frac{dt}{t(t + ${k})}$.`,
    answer: choiceTex(rng, correct, [`\\ln ${k + 1}`, `\\frac{1}{${k}}`, '+\\infty', `\\frac{\\ln ${k}}{${k + 1}}`, `${k}\\ln ${k + 1}`], () => `\\ln ${k + 2}`),
    hint: `Décompose en éléments simples : $\\dfrac{1}{t(t + ${k})} = \\dfrac{1}{${k}}\\left(\\dfrac{1}{t} - \\dfrac{1}{t + ${k}}\\right)$.`,
    correction: [`$\\displaystyle\\int_1^{X} \\frac{dt}{t(t + ${k})} = \\frac{1}{${k}}\\left[\\ln\\frac{t}{t + ${k}}\\right]_1^{X} = \\frac{1}{${k}}\\left(\\ln\\frac{X}{X + ${k}} + \\ln ${k + 1}\\right)$`, `Quand $X \\to +\\infty$ : $${correct}$`],
  };
});

const comparaison = skill('l2-integrale-nature-equivalent', 'Étudier la nature par équivalent', (rng, level) => {
  const p = rng.int(0, 3);
  const q = p + rng.pick([0, 1, 2, 3]);
  const c = rng.int(1, 4);
  const sqrt = level > 1 && rng.next() < 0.5;
  const num = p === 0 ? '1' : p === 1 ? 't' : `t^{${p}}`;
  const den = `${q === 0 ? '' : q === 1 ? 't' : `t^{${q}}`}${sqrt ? '\\sqrt{t}' : ''}`;
  const alpha = F(2 * (q - p) + (sqrt ? 1 : 0), 2);
  const converges = alpha.n > alpha.d;
  return {
    prompt: `Quelle est la nature de $\\displaystyle\\int_1^{+\\infty} \\frac{${num}}{${den === '' ? String(c + 1) : `${den} + ${c}`}}\\,dt$ ?`,
    answer: fixedChoice(NATURE, converges ? 0 : 1),
    hint: 'Pour une fonction positive, cherche un équivalent en $+\\infty$ de la forme $\\frac{1}{t^\\alpha}$.',
    correction:
      alpha.n === 0
        ? [`En $+\\infty$, la fonction tend vers $${p === 0 && q === 0 ? `\\frac{1}{${c + 1}}` : '1'} > 0$ : l’intégrale diverge.`]
        : [`En $+\\infty$, la fonction (positive) est équivalente à $\\dfrac{1}{t^{${tex(alpha)}}}$.`, `Riemann : ${converges ? `convergente car $${tex(alpha)} > 1$` : `divergente car $${tex(alpha)} \\leq 1$`}.`],
  };
});

export const INTEGRALES_GENERALISEES_SKILLS: Skill[] = [riemann, puissance, exponentielle, rationnelle, comparaison];
