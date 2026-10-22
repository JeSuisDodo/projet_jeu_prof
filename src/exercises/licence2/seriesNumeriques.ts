import type { Frac } from '../fraction';
import type { Rng } from '../rng';
import type { Skill } from '../types';
import { F, NATURE, add, choiceTex, div, fixedChoice, fpow, mul, numF, skill, sub, tex } from './util';

/** Chapitre « Séries numériques » (L2). */

const RATIOS = [F(1, 2), F(1, 3), F(2, 3), F(1, 4), F(3, 4), F(-1, 2), F(-1, 3), F(2, 5), F(-2, 3)];

const ptex = (q: Frac) => `\\left(${tex(q)}\\right)`;

const geometrique = skill('l2-serie-geometrique', 'Sommer une série géométrique', (rng, level) => {
  const q = rng.pick(level === 1 ? RATIOS.slice(0, 5) : RATIOS);
  const k = level === 1 ? 0 : rng.int(1, 3);
  if (level === 3 && rng.next() < 0.5) {
    // Σ n qⁿ⁻¹ = 1 / (1 − q)²
    const v = div(F(1), fpow(sub(F(1), q), 2));
    return {
      prompt: `Calcule $\\displaystyle\\sum_{n=1}^{+\\infty} n\\,${ptex(q)}^{n-1}$.`,
      answer: numF(v),
      hint: 'Dérive terme à terme $\\sum x^n = \\dfrac{1}{1 - x}$ pour $|x| < 1$ : $\\sum nx^{n-1} = \\dfrac{1}{(1 - x)^2}$.',
      correction: [`$\\dfrac{1}{\\left(1 - ${ptex(q)}\\right)^2} = \\dfrac{1}{${tex(fpow(sub(F(1), q), 2))}} = ${tex(v)}$`],
    };
  }
  const v = div(fpow(q, k), sub(F(1), q));
  return {
    prompt: `Calcule $\\displaystyle\\sum_{n=${k}}^{+\\infty} ${ptex(q)}^n$.`,
    answer: numF(v),
    hint: 'Pour $|q| < 1$ : $\\displaystyle\\sum_{n=k}^{+\\infty} q^n = \\dfrac{q^k}{1 - q}$ (premier terme sur un moins la raison).',
    correction: [`Premier terme : $${ptex(q)}^{${k}} = ${tex(fpow(q, k))}$`, `Somme : $\\dfrac{${tex(fpow(q, k))}}{1 - ${ptex(q)}} = ${tex(v)}$`],
  };
});

const telescopique = skill('l2-serie-telescopique', 'Sommer une série télescopique', (rng, level) => {
  const k = level === 1 ? 1 : rng.int(1, level === 2 ? 2 : 3);
  const a = level === 3 ? rng.int(1, 3) : 1;
  // Σ_{n≥1} 1/(n(n+k)) = (1/k)(1 + 1/2 + … + 1/k)
  let H = F(0);
  for (let i = 1; i <= k; i++) H = add(H, F(1, i));
  const v = mul(F(a, k), H);
  const coef = a === k ? '' : `\\dfrac{${a}}{${k}}`;
  return {
    prompt: `Calcule $\\displaystyle\\sum_{n=1}^{+\\infty} \\frac{${a}}{n(n + ${k})}$.`,
    answer: numF(v),
    hint: `Décompose : $\\dfrac{1}{n(n + ${k})} = \\dfrac{1}{${k}}\\left(\\dfrac{1}{n} - \\dfrac{1}{n + ${k}}\\right)$, puis observe ce qui se simplifie.`,
    correction: [
      `$\\dfrac{${a}}{n(n + ${k})} = ${coef}\\left(\\dfrac{1}{n} - \\dfrac{1}{n + ${k}}\\right)$`,
      `Les sommes partielles se télescopent : il reste $${coef}\\left(${Array.from({ length: k }, (_, i) => (i === 0 ? '1' : `\\frac{1}{${i + 1}}`)).join(' + ')}\\right) = ${tex(v)}$`,
    ],
  };
});

interface Term {
  tex: string;
  converges: boolean;
  why: string;
}

/** Terme général équivalent à 1/n^α (α rationnel) : on donne le terme, l'équivalent, la nature. */
function riemannTerm(rng: Rng, level: number): Term {
  const p = rng.int(0, 3);
  const q = p + rng.pick([0, 1, 2, 3]);
  const c = rng.int(1, 5);
  const sqrt = level > 1 && rng.pick([true, false]);
  const num = p === 0 ? '1' : p === 1 ? 'n' : `n^{${p}}`;
  // Exposant total : q − p (+ 1/2 si √n au dénominateur)
  const alpha = F(2 * (q - p) + (sqrt ? 1 : 0), 2);
  const den = `${q === 0 ? '' : q === 1 ? 'n' : `n^{${q}}`}${sqrt ? '\\sqrt{n}' : ''}`;
  const denom = den === '' ? `${c + 1}` : `${den} + ${c}`;
  const converges = alpha.n > alpha.d;
  if (alpha.n === 0)
    return { tex: `\\frac{${num}}{${denom}}`, converges: false, why: `Le terme général tend vers $${p === 0 && q === 0 ? `\\frac{1}{${c + 1}}` : '1'} \\neq 0$ : la série diverge grossièrement.` };
  return {
    tex: `\\frac{${num}}{${denom}}`,
    converges,
    why: `Le terme général est équivalent à $\\dfrac{1}{n^{${tex(alpha)}}}$ : série de Riemann ${converges ? `convergente ($${tex(alpha)} > 1$)` : `divergente ($${tex(alpha)} \\leq 1$)`}.`,
  };
}

const riemann = skill('l2-nature-riemann', 'Comparer à une série de Riemann', (rng, level) => {
  const t = riemannTerm(rng, level);
  return {
    prompt: `Quelle est la nature de la série $\\displaystyle\\sum_{n\\geq 1} ${t.tex}$ ?`,
    answer: fixedChoice(NATURE, t.converges ? 0 : 1),
    hint: 'Cherche un équivalent du terme général (positif) : $\\sum \\frac{1}{n^\\alpha}$ converge si et seulement si $\\alpha > 1$.',
    correction: [t.why],
  };
});

const equivalents = skill('l2-nature-equivalents', 'Utiliser des équivalents usuels', (rng, level) => {
  const alpha = rng.pick(level === 1 ? [F(1), F(2)] : [F(1, 2), F(1), F(3, 2), F(2), F(1, 3)]);
  const pw = alpha.n === alpha.d ? 'n' : `n^{${tex(alpha)}}`;
  const kinds = [
    { t: `\\ln\\left(1 + \\frac{1}{${pw}}\\right)`, eq: `\\frac{1}{${pw}}`, exp: alpha },
    { t: `\\sin\\left(\\frac{1}{${pw}}\\right)`, eq: `\\frac{1}{${pw}}`, exp: alpha },
    { t: `1 - \\cos\\left(\\frac{1}{${pw}}\\right)`, eq: `\\frac{1}{2n^{${tex(mul(F(2), alpha))}}}`, exp: mul(F(2), alpha) },
    { t: `e^{1/${pw}} - 1`, eq: `\\frac{1}{${pw}}`, exp: alpha },
  ];
  const k = rng.pick(kinds);
  const converges = k.exp.n > k.exp.d;
  return {
    prompt: `Quelle est la nature de la série $\\displaystyle\\sum_{n\\geq 1} \\left(${k.t}\\right)$ ?`,
    answer: fixedChoice(NATURE, converges ? 0 : 1),
    hint: 'Quand $u \\to 0$ : $\\ln(1 + u) \\sim u$, $\\sin u \\sim u$, $e^u - 1 \\sim u$ et $1 - \\cos u \\sim \\frac{u^2}{2}$.',
    correction: [`Le terme général est positif et équivalent à $${k.eq}$.`, `Série de Riemann d’exposant $${tex(k.exp)}$ : ${converges ? 'convergente' : 'divergente'}.`],
  };
});

const dalembert = skill('l2-critere-dalembert', 'Appliquer la règle de d’Alembert', (rng, level) => {
  const families = [
    () => {
      const q = rng.pick([F(1, 2), F(2, 3), F(3, 2), F(1, 3), F(3, 4), F(5, 2)]);
      const k = rng.int(1, 3);
      return { t: `n^{${k}}\\left(${tex(q)}\\right)^n`, l: q, why: `$\\dfrac{u_{n+1}}{u_n} = \\left(\\dfrac{n + 1}{n}\\right)^{${k}}\\times ${tex(q)} \\to ${tex(q)}$` };
    },
    () => {
      const a = rng.int(2, 5);
      return { t: `\\frac{${a}^n}{n!}`, l: F(0), why: `$\\dfrac{u_{n+1}}{u_n} = \\dfrac{${a}}{n + 1} \\to 0$` };
    },
    () => ({ t: '\\frac{(n!)^2}{(2n)!}', l: F(1, 4), why: '$\\dfrac{u_{n+1}}{u_n} = \\dfrac{(n + 1)^2}{(2n + 1)(2n + 2)} \\to \\dfrac{1}{4}$' }),
    () => {
      const a = rng.int(2, 4);
      return { t: `\\frac{n!}{${a}^n\\,n^{2}}`, l: F(-1), why: `$\\dfrac{u_{n+1}}{u_n} = \\dfrac{n + 1}{${a}}\\left(\\dfrac{n}{n + 1}\\right)^2 \\to +\\infty$` };
    },
  ];
  const f = rng.pick(level === 1 ? [families[0], families[1]] : families)();
  if (f.l.n < 0) {
    return {
      prompt: `Quelle est la nature de la série $\\displaystyle\\sum_{n\\geq 1} ${f.t}$ ?`,
      answer: fixedChoice(NATURE, 1),
      hint: 'Règle de d’Alembert : si $\\frac{u_{n+1}}{u_n} \\to \\ell > 1$ (ou $+\\infty$), la série diverge.',
      correction: [f.why, 'Le rapport tend vers $+\\infty > 1$ : la série diverge (grossièrement).'],
    };
  }
  return {
    prompt: `Pour $u_n = ${f.t}$, calcule $\\ell = \\displaystyle\\lim_{n\\to+\\infty} \\frac{u_{n+1}}{u_n}$.`,
    answer: numF(f.l),
    hint: 'Simplifie le quotient $\\frac{u_{n+1}}{u_n}$ avant de passer à la limite. Si $\\ell < 1$, la série converge ; si $\\ell > 1$, elle diverge.',
    correction: [f.why, f.l.n < f.l.d ? `$\\ell = ${tex(f.l)} < 1$ : la série converge.` : `$\\ell = ${tex(f.l)} > 1$ : la série diverge.`],
  };
});

const exponentielle = skill('l2-serie-exponentielle', 'Reconnaître une série exponentielle', (rng, level) => {
  const k = rng.pick(level === 1 ? [1, 2, 3] : [-1, 2, 3, -2]);
  const kTex = k < 0 ? `(${k})` : String(k);
  const kn = k === 1 ? '1' : `${kTex}^n`;
  const e = (x: number) => (x === 1 ? 'e' : `e^{${x}}`);
  const ke = (c: number, x: number) => (c === 1 ? e(x) : c === -1 ? `-${e(x)}` : `${c}${e(x)}`);
  if (level === 3 && rng.next() < 0.5) {
    // Σ n kⁿ / n! = k eᵏ
    return {
      prompt: `Calcule $\\displaystyle\\sum_{n=0}^{+\\infty} \\frac{n\\,${kTex}^n}{n!}$.`,
      answer: choiceTex(rng, ke(k, k), [e(k), ke(-k, k), e(k + 1), ke(k, k - 1)], () => ke(k, k + 1)),
      hint: 'Pour $n \\geq 1$ : $\\dfrac{n}{n!} = \\dfrac{1}{(n - 1)!}$, puis réindexe.',
      correction: [`$\\displaystyle\\sum_{n\\geq 1} \\frac{${kTex}^n}{(n - 1)!} = ${kTex}\\sum_{m\\geq 0} \\frac{${kTex}^m}{m!} = ${ke(k, k)}$`],
    };
  }
  return {
    prompt: `Calcule $\\displaystyle\\sum_{n=0}^{+\\infty} \\frac{${kn}}{n!}$.`,
    answer: choiceTex(rng, e(k), [e(-k), `${e(k)} - 1`, ke(k, 1), e(k + 1)], () => `${e(k)} + 1`),
    hint: 'Pour tout réel $x$ : $\\displaystyle\\sum_{n=0}^{+\\infty} \\frac{x^n}{n!} = e^x$.',
    correction: [`C’est la série exponentielle en $x = ${k}$ : la somme vaut $${e(k)}$.`],
  };
});

export const SERIES_NUMERIQUES_SKILLS: Skill[] = [geometrique, telescopique, riemann, equivalents, dalembert, exponentielle];
