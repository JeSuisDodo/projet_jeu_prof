import type { Frac } from '../fraction';
import type { Skill } from '../types';
import { F, choiceTex, div, fact, fixedChoice, fpow, mul, numF, skill, sub, tex } from './util';

/** Chapitre « Séries entières » (L2). */

const rayon = skill('l2-rayon-convergence', 'Trouver un rayon de convergence', (rng, level) => {
  const families = [
    () => {
      const a = rng.pick([F(2), F(3), F(1, 2), F(1, 3), F(4), F(2, 3)]);
      return { t: `${a.d === 1 ? tex(a) : `\\left(${tex(a)}\\right)`}^n x^n`, R: div(F(1), a), why: `$\\dfrac{|a_{n+1}|}{|a_n|} = ${tex(a)}$, donc $R = \\dfrac{1}{${tex(a)}}$.` };
    },
    () => {
      const b = rng.int(2, 5);
      const k = rng.int(1, 3);
      return { t: `\\frac{n^{${k}}}{${b}^n}x^n`, R: F(b), why: `$\\dfrac{|a_{n+1}|}{|a_n|} = \\left(\\dfrac{n + 1}{n}\\right)^{${k}}\\dfrac{1}{${b}} \\to \\dfrac{1}{${b}}$, donc $R = ${b}$.` };
    },
    () => {
      const r = rng.int(2, 3);
      const b = r * r;
      return { t: `\\frac{x^{2n}}{${b}^n}`, R: F(r), why: `Avec $u_n = \\frac{x^{2n}}{${b}^n}$ : $\\dfrac{|u_{n+1}|}{|u_n|} = \\dfrac{x^2}{${b}} < 1 \\iff |x| < ${r}$, donc $R = ${r}$.` };
    },
    () => {
      const a = rng.int(2, 4);
      return { t: `\\frac{${a}^n}{n^2 + 1}x^n`, R: F(1, a), why: `$\\dfrac{|a_{n+1}|}{|a_n|} \\to ${a}$, donc $R = \\dfrac{1}{${a}}$.` };
    },
  ];
  const f = rng.pick(level === 1 ? families.slice(0, 2) : families)();
  return {
    prompt: `Calcule le rayon de convergence $R$ de la série entière $\\displaystyle\\sum_{n\\geq 0} ${f.t}$.`,
    answer: numF(f.R),
    hint: 'Règle de d’Alembert : si $\\left|\\frac{a_{n+1}}{a_n}\\right| \\to \\ell$, alors $R = \\frac{1}{\\ell}$.',
    correction: [f.why],
  };
});

const POINTS = [F(1, 2), F(1, 3), F(-1, 2), F(1, 4), F(2, 3), F(-1, 3), F(3, 4)];

const somme = skill('l2-somme-serie-entiere', 'Calculer la somme d’une série entière', (rng, level) => {
  const x = rng.pick(POINTS);
  const one = sub(F(1), x);
  const kinds = [
    { s: 'x^n', f: '\\frac{1}{1 - x}', v: div(F(1), one) },
    { s: '(n + 1)x^n', f: '\\frac{1}{(1 - x)^2}', v: div(F(1), fpow(one, 2)) },
    { s: 'nx^n', f: '\\frac{x}{(1 - x)^2}', v: div(x, fpow(one, 2)) },
    { s: 'x^{2n}', f: '\\frac{1}{1 - x^2}', v: div(F(1), sub(F(1), mul(x, x))) },
  ];
  const k = rng.pick(level === 1 ? kinds.slice(0, 1).concat(kinds[3]) : kinds);
  const xt = `\\left(${tex(x)}\\right)`;
  return {
    prompt: `On admet que $\\displaystyle\\sum_{n\\geq 0} ${k.s} = ${k.f}$ pour $|x| < 1$. Calcule $\\displaystyle\\sum_{n=0}^{+\\infty} ${k.s.replace(/x/g, xt)}$.`,
    answer: numF(k.v),
    hint: 'Remplace $x$ par sa valeur dans la somme.',
    correction: [`$${k.f.replace(/x/g, xt)} = ${tex(k.v)}$`],
  };
});

/** Coefficient binomial généralisé α(α − 1)…(α − k + 1)/k!. */
function genBinom(alpha: Frac, k: number): Frac {
  let v = F(1);
  for (let i = 0; i < k; i++) v = mul(v, sub(alpha, F(i)));
  return div(v, F(fact(k)));
}

const coefficient = skill('l2-dse-coefficient', 'Trouver un coefficient de développement en série entière', (rng, level) => {
  const k = rng.int(2, level === 1 ? 3 : 5);
  const a = rng.pick([2, 3, -1, -2, 1]);
  const at = a === 1 ? 'x' : a === -1 ? '-x' : `${a}x`;
  const ap = a < 0 ? `(${a})` : String(a);
  const oneMinus = a === 1 ? '1 - x' : a < 0 ? `1 + ${a === -1 ? '' : -a}x` : `1 - ${a}x`;
  const families = [
    { f: `\\frac{1}{${oneMinus}}`, v: F(a ** k), why: `$\\dfrac{1}{1 - u} = \\sum u^n$ avec $u = ${at}$ : $a_{${k}} = ${ap}^{${k}}$` },
    { f: `e^{${at}}`, v: F(a ** k, fact(k)), why: `$e^{u} = \\sum \\frac{u^n}{n!}$ avec $u = ${at}$ : $a_{${k}} = \\dfrac{${ap}^{${k}}}{${k}!}$` },
    { f: '\\ln(1 + x)', v: F((-1) ** (k + 1), k), why: `$\\ln(1 + x) = \\sum_{n\\geq 1} \\frac{(-1)^{n+1}}{n}x^n$ : $a_{${k}} = \\dfrac{(-1)^{${k + 1}}}{${k}}$` },
    { f: '\\frac{1}{(1 - x)^2}', v: F(k + 1), why: `$\\dfrac{1}{(1 - x)^2} = \\sum (n + 1)x^n$ : $a_{${k}} = ${k + 1}$` },
  ];
  if (level === 3 && rng.next() < 0.4) {
    const alpha = rng.pick([F(1, 2), F(-1, 2), F(1, 3), F(-2)]);
    const v = genBinom(alpha, k);
    return {
      prompt: `Donne le coefficient de $x^{${k}}$ dans le développement en série entière de $(1 + x)^{${tex(alpha)}}$.`,
      answer: numF(v),
      hint: '$(1 + x)^\\alpha = \\sum \\frac{\\alpha(\\alpha - 1)\\cdots(\\alpha - n + 1)}{n!}x^n$ pour $|x| < 1$.',
      correction: [`$a_{${k}} = \\dfrac{${Array.from({ length: k }, (_, i) => `\\left(${tex(sub(alpha, F(i)))}\\right)`).join('')}}{${k}!} = ${tex(v)}$`],
    };
  }
  const fam = rng.pick(level === 1 ? [families[0], families[1]] : families);
  return {
    prompt: `Donne le coefficient $a_{${k}}$ de $x^{${k}}$ dans le développement en série entière de $${fam.f}$.`,
    answer: numF(fam.v),
    hint: 'Pars d’un développement usuel ($\\frac{1}{1 - u}$, $e^u$, $\\ln(1 + x)$…) et substitue.',
    correction: [fam.why, `$a_{${k}} = ${tex(fam.v)}$`],
  };
});

const USUELLES = [
  { s: '\\sum_{n\\geq 0} \\frac{x^n}{n!}', f: 'e^x' },
  { s: '\\sum_{n\\geq 0} \\frac{(-1)^n x^{2n+1}}{(2n + 1)!}', f: '\\sin x' },
  { s: '\\sum_{n\\geq 0} \\frac{(-1)^n x^{2n}}{(2n)!}', f: '\\cos x' },
  { s: '\\sum_{n\\geq 0} \\frac{x^{2n}}{(2n)!}', f: '\\operatorname{ch} x' },
  { s: '\\sum_{n\\geq 0} \\frac{x^{2n+1}}{(2n + 1)!}', f: '\\operatorname{sh} x' },
  { s: '\\sum_{n\\geq 1} \\frac{(-1)^{n+1} x^n}{n}', f: '\\ln(1 + x)' },
  { s: '\\sum_{n\\geq 0} \\frac{(-1)^n x^{2n+1}}{2n + 1}', f: '\\arctan x' },
  { s: '\\sum_{n\\geq 1} \\frac{x^n}{n}', f: '-\\ln(1 - x)' },
];

const reconnaitre = skill('l2-dse-usuels', 'Reconnaître un développement usuel', (rng, level) => {
  const pool = level === 1 ? USUELLES.slice(0, 3) : USUELLES;
  const u = rng.pick(pool);
  return {
    prompt: `Quelle fonction a pour développement en série entière $\\displaystyle${u.s}$ ?`,
    answer: choiceTex(
      rng,
      u.f,
      USUELLES.filter((x) => x !== u).map((x) => x.f),
      () => 'e^{-x}',
    ),
    hint: 'Pense aux développements usuels : $e^x$, $\\cos$, $\\sin$, $\\operatorname{ch}$, $\\operatorname{sh}$, $\\ln(1 + x)$, $\\arctan$.',
    correction: [`$\\displaystyle${u.s} = ${u.f}$`],
  };
});

const CONV = ['Converge absolument', 'Diverge'];

const domaine = skill('l2-convergence-point', 'Savoir si une série entière converge en un point', (rng, level) => {
  const R = rng.pick([F(1), F(2), F(1, 2), F(3), F(1, 3)]);
  let x: Frac;
  do x = mul(R, rng.pick([F(1, 2), F(3, 2), F(-1, 2), F(2), F(-3, 2), F(1, 3), F(-2)]));
  while (Math.abs(x.n / x.d) === R.n / R.d);
  const inside = Math.abs(x.n / x.d) < R.n / R.d;
  const a = div(F(1), R);
  return {
    prompt: `La série entière $\\displaystyle\\sum ${level === 1 ? '' : 'n\\,'}\\left(${tex(a)}\\right)^n x^n$ a pour rayon $R = ${tex(R)}$. Que fait-elle en $x = ${tex(x)}$ ?`,
    answer: fixedChoice(CONV, inside ? 0 : 1),
    hint: 'Si $|x| < R$, la série converge absolument ; si $|x| > R$, son terme général ne tend pas vers $0$.',
    correction: [`$|x| = ${tex(F(Math.abs(x.n), x.d))} ${inside ? '<' : '>'} R = ${tex(R)}$ : la série ${inside ? 'converge absolument' : 'diverge (grossièrement)'}.`],
  };
});

export const SERIES_ENTIERES_SKILLS: Skill[] = [rayon, somme, coefficient, reconnaitre, domaine];
