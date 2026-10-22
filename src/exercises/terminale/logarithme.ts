import type { Skill } from '../types';
import { F, affine, choiceTex, num, numF, plus, poly, skill, tex } from './util';

/** Chapitre « Fonction logarithme népérien » (Terminale spécialité). */

const simplifier = skill('tle-ln-proprietes', 'Utiliser les propriétés algébriques de ln', (rng, level) => {
  const a = rng.pick([2, 3, 5]);
  const p = rng.int(1, 4);
  const q = rng.int(1, 4);
  const r = rng.int(1, level === 1 ? 2 : 5);
  const sq = level === 3 && rng.next() < 0.5;
  // ln(a^p) + ln(a^q) - ln(a^r) (+ ln √a) = k ln a
  const k = sq ? F(2 * (p + q - r) + 1, 2) : F(p + q - r);
  const extra = sq ? ` + \\ln\\sqrt{${a}}` : '';
  return {
    prompt: `Écris $A = \\ln(${a ** p}) + \\ln(${a ** q}) - \\ln(${a ** r})${extra}$ sous la forme $k\\ln ${a}$. Donne $k$.`,
    answer: numF(k),
    hint: '$\\ln(ab) = \\ln a + \\ln b$, $\\ln\\frac{a}{b} = \\ln a - \\ln b$ et $\\ln(a^n) = n\\ln a$.',
    correction: [
      `$${a ** p} = ${a}^{${p}}$, $${a ** q} = ${a}^{${q}}$, $${a ** r} = ${a}^{${r}}$${sq ? ` et $\\sqrt{${a}} = ${a}^{\\frac{1}{2}}$` : ''}.`,
      `$A = ${p}\\ln ${a} + ${q}\\ln ${a} - ${r}\\ln ${a}${sq ? ` + \\frac{1}{2}\\ln ${a}` : ''} = ${k.n === 0 ? '0' : `${tex(k)}\\ln ${a}`}$`,
    ],
  };
});

const equation = skill('tle-ln-equation', 'Résoudre une équation avec ln', (rng, level) => {
  const a = rng.nonZero(-4, 5);
  const b = rng.int(-6, 6);
  const c = rng.int(1, 12);
  const x = F(c - b, a);
  if (level === 1) {
    return {
      prompt: `Résous dans $\\mathbb{R}$ : $\\ln(${affine(a, b)}) = \\ln(${c})$.`,
      answer: { kind: 'set', values: [x] },
      hint: '$\\ln$ est strictement croissante : $\\ln A = \\ln B \\iff A = B$ (avec $A > 0$).',
      correction: [`$${affine(a, b)} = ${c}$, donc $x = ${tex(x)}$, et alors $${affine(a, b)} = ${c} > 0$.`, `$S = \\{${tex(x)}\\}$`],
    };
  }
  // ln(x + p) + ln(x + q) = ln r, où (x + p)(x + q) - r = (x - s1)(x - s2) : s1 est dans le domaine, pas s2.
  const s1 = rng.int(1, 5);
  const s2 = rng.int(-6, -1);
  let p = 0;
  let q = 0;
  do {
    p = rng.int(1 - s1, 6);
    q = -s1 - s2 - p;
  } while (s1 + q <= 0 || s2 + p >= 0 || s2 + q >= 0);
  const r = (s1 + p) * (s1 + q);
  return {
    prompt: `Résous : $\\ln(${affine(1, p)}) + \\ln(${affine(1, q)}) = \\ln ${r}$.`,
    answer: { kind: 'set', values: [F(s1)] },
    hint: 'Cherche d’abord le domaine (les deux expressions doivent être $> 0$), puis regroupe les $\\ln$.',
    correction: [
      `Domaine : $x > ${Math.max(-p, -q)}$.`,
      `$\\ln\\big((${affine(1, p)})(${affine(1, q)})\\big) = \\ln ${r}$ donne $${poly([1, p + q, p * q - r])} = 0$.`,
      `Les racines sont $${s1}$ et $${s2}$ ; seule $${s1}$ est dans le domaine.`,
      `$S = \\{${s1}\\}$`,
    ],
  };
});

const expLn = skill('tle-exp-equation', 'Résoudre une équation avec l’exponentielle', (rng, level) => {
  const a = level === 1 ? 1 : rng.nonZero(-3, 3);
  const b = rng.int(-4, 4);
  const c = rng.pick([2, 3, 5, 7, 10]);
  const lnc = `\\ln ${c}`;
  const num_ = b === 0 ? lnc : `${lnc}${plus(-b)}`;
  const fmt = (top: string, d: number) => (d === 1 ? top : d === -1 ? `-(${top})` : `\\frac{${top}}{${d}}`);
  const correct = fmt(num_, a);
  return {
    prompt: `Résous $e^{${affine(a, b)}} = ${c}$. Quelle est la solution ?`,
    answer: choiceTex(
      rng,
      `x = ${correct}`,
      [`x = ${fmt(b === 0 ? lnc : `${lnc}${plus(b)}`, a)}`, `x = ${fmt(`e^{${c}}${plus(-b)}`, a)}`, `x = ${fmt(`${c}${plus(-b)}`, a)}`, `x = ${fmt(num_, -a)}`],
      () => `x = \\frac{${num_}}{${a + 1}}`,
    ),
    hint: '$e^X = c \\iff X = \\ln c$ (pour $c > 0$).',
    correction: [`$${affine(a, b)} = ${lnc}$`, `$x = ${correct}$`],
  };
});

const derivee = skill('tle-ln-derivee', 'Dériver ln(u)', (rng) => {
  const a = rng.nonZero(-4, 5);
  const x0 = rng.int(-2, 3);
  let b = rng.int(-5, 5);
  if (a * x0 + b <= 0) b = 1 - a * x0 + rng.int(0, 4);
  const value = F(a, a * x0 + b);
  return {
    prompt: `$f(x) = \\ln(${affine(a, b)})$. Calcule $f'(${x0})$.`,
    answer: numF(value),
    hint: 'Si $f = \\ln u$, alors $f\' = \\frac{u\'}{u}$.',
    correction: [`$f'(x) = \\frac{${a}}{${affine(a, b)}}$`, `$f'(${x0}) = \\frac{${a}}{${a * x0 + b}}${value.d === a * x0 + b && value.n === a ? '' : ` = ${tex(value)}`}$`],
  };
});

const limites = skill('tle-ln-limites', 'Limites avec ln', (rng) => {
  const n = rng.int(1, 3);
  const xn = n === 1 ? 'x' : `x^{${n}}`;
  const cases = [
    { expr: '\\ln x', at: '0^+', lim: '-\\infty', why: 'Limite de référence : $\\lim_{x \\to 0^+} \\ln x = -\\infty$.' },
    { expr: '\\ln x', at: '+\\infty', lim: '+\\infty', why: 'Limite de référence : $\\lim_{x \\to +\\infty} \\ln x = +\\infty$.' },
    { expr: `\\frac{\\ln x}{${xn}}`, at: '+\\infty', lim: '0', why: `Croissances comparées : $${xn}$ l’emporte sur $\\ln x$.` },
    { expr: `${xn}\\ln x`, at: '0^+', lim: '0', why: `Croissances comparées : $${xn}\\ln x \\to 0$ en $0^+$.` },
    { expr: '\\frac{\\ln(1 + x)}{x}', at: '0', lim: '1', why: 'C’est le taux d’accroissement de $\\ln$ en $1$ : il tend vers $\\ln\'(1) = 1$.' },
    { expr: `x - \\ln x`, at: '+\\infty', lim: '+\\infty', why: '$x - \\ln x = x\\left(1 - \\frac{\\ln x}{x}\\right)$ et la parenthèse tend vers $1$.' },
  ];
  const c = rng.pick(cases);
  return {
    prompt: `Quelle est la limite de $${c.expr}$ quand $x \\to ${c.at}$ ?`,
    answer: choiceTex(rng, c.lim, ['0', '1', '+\\infty', '-\\infty'], () => 'e'),
    hint: 'Pense aux limites de référence et aux croissances comparées.',
    correction: [c.why],
  };
});

const seuil = skill('tle-ln-seuil', 'Trouver un seuil avec ln', (rng, level) => {
  // Plus petit n tel que q^n < s, q dans ]0 ; 1[.
  const q = rng.pick(level === 1 ? [F(1, 2)] : [F(1, 2), F(9, 10), F(3, 4), F(4, 5), F(2, 3)]);
  const s = rng.pick(level === 3 ? [0.001, 0.0001, 0.01] : [0.1, 0.01, 0.05]);
  const qv = q.n / q.d;
  let n = 0;
  while (qv ** n >= s) n++;
  const st = String(s).replace('.', '{,}');
  return {
    prompt: `Quel est le plus petit entier $n$ tel que $\\left(${tex(q)}\\right)^n < ${st}$ ?`,
    answer: num(n),
    hint: 'Applique $\\ln$ (croissante) : $n\\ln q < \\ln s$, et attention, $\\ln q < 0$ change le sens de l’inégalité.',
    correction: [
      `$n\\ln\\left(${tex(q)}\\right) < \\ln(${st})$`,
      `$\\ln\\left(${tex(q)}\\right) < 0$, donc $n > \\frac{\\ln(${st})}{\\ln\\left(${tex(q)}\\right)} \\approx ${(Math.log(s) / Math.log(qv)).toFixed(2).replace('.', '{,}')}$.`,
      `Le plus petit entier est $n = ${n}$.`,
    ],
  };
});

const variations = skill('tle-ln-variations', 'Étudier les variations d’une fonction avec ln', (rng) => {
  const k = rng.int(1, 9);
  return {
    prompt: `$f(x) = x - ${k === 1 ? '' : k}\\ln x$ sur $]0\\,;\\,+\\infty[$. En quelle valeur $f$ atteint-elle son minimum ?`,
    answer: num(k),
    hint: 'Calcule $f\'(x)$ et étudie son signe.',
    correction: [
      `$f'(x) = 1 - \\frac{${k}}{x} = \\frac{x - ${k}}{x}$`,
      `$f' < 0$ sur $]0\\,;\\,${k}[$ et $f' > 0$ sur $]${k}\\,;\\,+\\infty[$ : minimum en $x = ${k}$.`,
    ],
  };
});

export const LOGARITHME_SKILLS: Skill[] = [simplifier, equation, expLn, derivee, limites, seuil, variations];
