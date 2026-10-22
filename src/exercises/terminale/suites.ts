import { frac } from '../fraction';
import type { Skill } from '../types';
import { F, bound, choiceTex, fixedChoice, num, numF, par, plus, poly, skill, tex } from './util';

/** Chapitre « Suites et raisonnement par récurrence » (Terminale spécialité). */

const termeRecurrence = skill('tle-terme-recurrence', 'Calculer des termes d’une suite récurrente', (rng, level) => {
  const a = level === 1 ? rng.pick([2, 3]) : rng.pick([-2, 2, 3, -3]);
  const b = rng.int(-5, 5);
  const u0 = rng.int(-3, 4);
  const n = level === 3 ? 4 : 3;
  const terms = [u0];
  for (let i = 1; i <= n; i++) terms.push(a * terms[i - 1] + b);
  return {
    prompt: `On définit $u_0 = ${u0}$ et, pour tout $n \\in \\mathbb{N}$, $u_{n+1} = ${a}u_n${plus(b)}$. Calcule $u_${n}$.`,
    answer: num(terms[n]),
    hint: 'Calcule les termes un par un : $u_1$ à partir de $u_0$, puis $u_2$ à partir de $u_1$, etc.',
    correction: terms.slice(1).map((t, i) => `$u_${i + 1} = ${a}\\times ${par(terms[i])}${plus(b)} = ${t}$`),
  };
});

const sommeArith = skill('tle-somme-entiers', 'Sommer des termes consécutifs', (rng, level) => {
  const n = rng.int(bound(level, 10, 30, 60), bound(level, 20, 60, 120));
  if (level === 1) {
    const s = (n * (n + 1)) / 2;
    return {
      prompt: `Calcule $S = 1 + 2 + 3 + \\dots + ${n}$.`,
      answer: num(s),
      hint: 'Pour tout $n$, on a $1 + 2 + \\dots + n = \\frac{n(n+1)}{2}$ (cela se démontre par récurrence).',
      correction: [`$S = \\frac{${n}\\times ${n + 1}}{2} = ${s}$`],
    };
  }
  // Somme des termes u_0 … u_n d'une suite arithmétique.
  const u0 = rng.int(-5, 9);
  const r = rng.nonZero(-4, 5);
  const last = u0 + n * r;
  const s = ((n + 1) * (u0 + last)) / 2;
  return {
    prompt: `$(u_n)$ est arithmétique de premier terme $u_0 = ${u0}$ et de raison $r = ${r}$. Calcule $S = u_0 + u_1 + \\dots + u_{${n}}$.`,
    answer: num(s),
    hint: 'Somme = nombre de termes × (premier terme + dernier terme) / 2.',
    correction: [
      `Dernier terme : $u_{${n}} = u_0 + ${n}r = ${u0}${plus(n * r)} = ${last}$.`,
      `Il y a $${n + 1}$ termes, donc $S = ${n + 1}\\times\\frac{${u0}${plus(last)}}{2} = ${s}$.`,
    ],
  };
});

const sommeGeom = skill('tle-somme-geometrique', 'Sommer des termes d’une suite géométrique', (rng, level) => {
  const q = level === 1 ? 2 : rng.pick([2, 3, -2]);
  const n = rng.int(bound(level, 4, 4, 5), bound(level, 7, 7, 8));
  const u0 = level === 3 ? rng.pick([1, 2, 3, 5]) : 1;
  const s = (u0 * (q ** (n + 1) - 1)) / (q - 1);
  const first = u0 === 1 ? '' : `${u0}\\times`;
  return {
    prompt: `Calcule $S = ${u0 === 1 ? '' : `${u0}(`}1 + ${par(q)} + ${par(q)}^2 + \\dots + ${par(q)}^{${n}}${u0 === 1 ? '' : ')'}$.`,
    answer: num(s),
    hint: 'Pour $q \\neq 1$ : $1 + q + \\dots + q^n = \\frac{q^{n+1} - 1}{q - 1}$.',
    correction: [
      `$S = ${first}\\frac{${par(q)}^{${n + 1}} - 1}{${par(q)} - 1} = ${first}\\frac{${q ** (n + 1)} - 1}{${q - 1}}$`,
      `$S = ${s}$`,
    ],
  };
});

const variation = skill('tle-sens-variation', 'Étudier le sens de variation d’une suite', (rng, level) => {
  // u_n = c·q^n + d : croissante si c(q - 1) > 0 (q > 0).
  const kind = rng.int(0, 2);
  const d = rng.int(-5, 5);
  if (kind === 2 && level > 1) {
    const c = rng.nonZero(-4, 4);
    const q = -rng.pick([2, 3]);
    return {
      prompt: `Pour tout $n \\in \\mathbb{N}$, $u_n = ${c === 1 ? '' : c === -1 ? '-' : c}(${q})^n${plus(d)}$. Quel est le sens de variation de $(u_n)$ ?`,
      answer: fixedChoice(['Croissante', 'Décroissante', 'Constante', 'Ni croissante ni décroissante'], 3),
      hint: 'Regarde le signe de $(-2)^n$ ou $(-3)^n$ selon la parité de $n$.',
      correction: [`$(${q})^n$ change de signe à chaque rang : les termes alternent, la suite n’est pas monotone.`],
    };
  }
  const c = rng.nonZero(-4, 4);
  const q = rng.pick(level === 1 ? [2, 3] : [2, 3, 5]);
  const diff = `u_{n+1} - u_n = ${c}\\times ${q}^{n+1} - ${par(c)}\\times ${q}^n = ${c * (q - 1)}\\times ${q}^n`;
  const up = c > 0;
  return {
    prompt: `Pour tout $n \\in \\mathbb{N}$, $u_n = ${c === 1 ? '' : c === -1 ? '-' : c}\\times ${q}^n${plus(d)}$. Quel est le sens de variation de $(u_n)$ ?`,
    answer: fixedChoice(['Croissante', 'Décroissante', 'Constante', 'Ni croissante ni décroissante'], up ? 0 : 1),
    hint: 'Étudie le signe de $u_{n+1} - u_n$.',
    correction: [`$${diff}$`, `Ce nombre est ${up ? 'positif' : 'négatif'} pour tout $n$ : la suite est ${up ? 'croissante' : 'décroissante'}.`],
  };
});

const heredite = skill('tle-heredite', 'Rédiger l’hérédité d’une récurrence', (rng) => {
  const a = rng.pick([2, 3, 5]);
  const b = rng.int(1, 6);
  // u_{n+1} = a u_n - (a-1)b avec u_0 = b + 1 : u_n = a^n + b.
  const c = (a - 1) * b;
  const prop = `u_n = ${a}^n + ${b}`;
  const propNext = `u_{n+1} = ${a}^{n+1} + ${b}`;
  const answer = choiceTex(
    rng,
    `\\text{Supposer } ${prop} \\text{ pour un } n \\text{, montrer } ${propNext}`,
    [
      `\\text{Supposer } ${propNext} \\text{, montrer } ${prop}`,
      `\\text{Supposer } ${prop} \\text{ pour tout } n \\text{, montrer } ${propNext}`,
      `\\text{Vérifier } u_0 = ${a}^0 + ${b} \\text{ seulement}`,
    ],
    () => `\\text{Montrer } u_{n+1} - u_n > 0`,
  );
  return {
    prompt: `On a $u_0 = ${b + 1}$ et $u_{n+1} = ${a}u_n - ${c}$. On veut prouver par récurrence que $${prop}$ pour tout $n$. Que fait-on dans l’hérédité ?`,
    answer,
    hint: 'L’hérédité montre que si la propriété est vraie à un rang $n$ fixé, elle est vraie au rang suivant.',
    correction: [
      `Hérédité : on suppose $${prop}$ pour un entier $n$ fixé (hypothèse de récurrence).`,
      `Alors $u_{n+1} = ${a}(${a}^n + ${b}) - ${c} = ${a}^{n+1} + ${a * b} - ${c} = ${a}^{n+1} + ${b}$.`,
      'La propriété est donc vraie au rang $n+1$.',
    ],
  };
});

const formuleExplicite = skill('tle-conjecture', 'Conjecturer une formule explicite', (rng, level) => {
  // u_{n+1} = u_n + (2a n + a + b), u_0 = c : u_n = a n² + b n + c.
  const a = level === 1 ? 1 : rng.pick([1, 2, 3]);
  const b = rng.int(-3, 3);
  const c = rng.int(-4, 4);
  const step = poly([2 * a, a + b], 'n');
  const correct = poly([a, b, c], 'n');
  const answer = choiceTex(
    rng,
    `u_n = ${correct}`,
    [`u_n = ${poly([a, b + 1, c], 'n')}`, `u_n = ${poly([2 * a, b, c], 'n')}`, `u_n = ${poly([a, -b, c], 'n')}`, `u_n = ${poly([a, b, c + a], 'n')}`],
    () => `u_n = ${poly([a, b, c + rng.nonZero(-3, 3)], 'n')}`,
  );
  const u = (n: number) => a * n * n + b * n + c;
  return {
    prompt: `On a $u_0 = ${c}$ et $u_{n+1} = u_n + (${step})$. Quelle formule explicite peut-on démontrer par récurrence ?`,
    answer,
    hint: 'Calcule $u_1$, $u_2$, $u_3$ et teste chaque formule.',
    correction: [
      `$u_1 = ${u(1)}$, $u_2 = ${u(2)}$, $u_3 = ${u(3)}$.`,
      `Seule $u_n = ${correct}$ redonne ces valeurs.`,
      `Hérédité : si $u_n = ${correct}$, alors $u_{n+1} = ${poly([a, 2 * a + b, a + b + c], 'n')}$, qui vaut bien $${a === 1 ? '' : a}(n+1)^2${b === 0 ? '' : `${b < 0 ? ' - ' : ' + '}${Math.abs(b) === 1 ? '' : Math.abs(b)}(n+1)`}${plus(c)}$.`,
    ],
  };
});

const terme = skill('tle-terme-geometrique', 'Exprimer le terme général', (rng, level) => {
  const qf = level === 1 ? F(rng.pick([2, 3])) : rng.pick([F(1, 2), F(3), F(-2), F(2, 3), F(-1, 2)]);
  const u0 = rng.nonZero(-4, 6);
  const n = rng.int(3, 5);
  const value = frac(u0 * qf.n ** n, qf.d ** n);
  return {
    prompt: `$(u_n)$ est géométrique de premier terme $u_0 = ${u0}$ et de raison $q = ${tex(qf)}$. Calcule $u_{${n}}$.`,
    answer: numF(value),
    hint: 'Pour une suite géométrique, $u_n = u_0 \\times q^n$.',
    correction: [`$u_{${n}} = ${u0}\\times \\left(${tex(qf)}\\right)^{${n}} = ${tex(value)}$`],
  };
});

export const SUITES_SKILLS: Skill[] = [termeRecurrence, sommeArith, sommeGeom, variation, heredite, formuleExplicite, terme];
