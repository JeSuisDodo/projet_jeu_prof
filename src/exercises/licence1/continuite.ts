import type { Skill } from '../types';
import { F, affine, num, numF, par, plus, poly, skill, tex, texChoice } from './util';
import { enrichir } from '../licenceVariantes';
import { CONTINUITE_VARIANTES } from './variantes/continuite';

/** Chapitre « Limites et continuité » (Licence 1). */

/** (x − r) en LaTeX. */
const factor = (r: number) => (r === 0 ? 'x' : `(x ${r < 0 ? '+' : '-'} ${Math.abs(r)})`);

const formeIndeterminee = skill('l1-limite-forme-indeterminee', 'Lever une forme indéterminée 0/0', (rng, level) => {
  const a = rng.int(-4, 4);
  let b = rng.int(-4, 4);
  let c = rng.int(-4, 4);
  while (b === a) b = rng.int(-4, 4);
  while (c === a || c === b) c = rng.int(-4, 4);
  const k = level === 3 ? rng.nonZero(-3, 3) : 1;
  if (level === 1) {
    // (x² − a²)/(x − a) ou (x − a)(x − b)/(x − a)
    const top = [1, -(a + b), a * b];
    return {
      prompt: `Calcule $\\displaystyle\\lim_{x \\to ${a}} \\frac{${poly(top)}}{${affine(1, -a)}}$.`,
      answer: num(a - b),
      hint: `Le numérateur s’annule en $${a}$ : factorise-le par $${factor(a)}$.`,
      correction: [`$${poly(top)} = ${factor(a)}${factor(b)}$`, `Après simplification, la limite vaut $${a} ${b < 0 ? '+' : '-'} ${Math.abs(b)} = ${a - b}$.`],
    };
  }
  const top = [k, -k * (a + b), k * a * b];
  const bottom = [1, -(a + c), a * c];
  const value = F(k * (a - b), a - c);
  return {
    prompt: `Calcule $\\displaystyle\\lim_{x \\to ${a}} \\frac{${poly(top)}}{${poly(bottom)}}$.`,
    answer: numF(value),
    hint: `Numérateur et dénominateur s’annulent en $${a}$ : factorise-les par $${factor(a)}$.`,
    correction: [`$\\dfrac{${k === 1 ? '' : k === -1 ? '-' : k}${factor(a)}${factor(b)}}{${factor(a)}${factor(c)}} = \\dfrac{${k === 1 ? '' : k === -1 ? '-' : k}${factor(b)}}{${factor(c)}}$ pour $x \\neq ${a}$.`, `En $x = ${a}$ : $${tex(value)}$`],
  };
});

const limitesUsuelles = skill('l1-limites-usuelles', 'Utiliser les limites usuelles en 0', (rng, level) => {
  const a = rng.nonZero(-5, 5);
  const b = rng.nonZero(-5, 5);
  const ax = a === 1 ? 'x' : a === -1 ? '-x' : `${a}x`;
  const bx = b === 1 ? 'x' : b === -1 ? '-x' : `${b}x`;
  const kinds = [
    { tex: `\\frac{\\sin(${ax})}{${bx}}`, value: F(a, b), why: '$\\frac{\\sin u}{u} \\to 1$ quand $u \\to 0$.' },
    { tex: `\\frac{e^{${ax}} - 1}{${bx}}`, value: F(a, b), why: '$\\frac{e^u - 1}{u} \\to 1$ quand $u \\to 0$.' },
    { tex: `\\frac{\\ln(1 ${a < 0 ? '-' : '+'} ${Math.abs(a) === 1 ? '' : Math.abs(a)}x)}{${bx}}`, value: F(a, b), why: '$\\frac{\\ln(1 + u)}{u} \\to 1$ quand $u \\to 0$.' },
    { tex: `\\frac{1 - \\cos(${ax})}{x^2}`, value: F(a * a, 2), why: '$\\frac{1 - \\cos u}{u^2} \\to \\frac{1}{2}$ quand $u \\to 0$.' },
    { tex: `\\frac{\\tan(${ax})}{\\sin(${bx})}`, value: F(a, b), why: '$\\tan u \\sim u$ et $\\sin u \\sim u$ en $0$.' },
  ];
  const k = rng.pick(level === 1 ? kinds.slice(0, 2) : level === 2 ? kinds.slice(0, 4) : kinds.slice(2));
  return {
    prompt: `Calcule $\\displaystyle\\lim_{x \\to 0} ${k.tex}$.`,
    answer: numF(k.value),
    hint: 'Fais apparaître une limite usuelle : $\\frac{\\sin u}{u}$, $\\frac{e^u - 1}{u}$, $\\frac{\\ln(1+u)}{u}$, $\\frac{1 - \\cos u}{u^2}$.',
    correction: [k.why, `La limite vaut $${tex(k.value)}$.`],
  };
});

const parametre = skill('l1-continuite-parametre', 'Rendre une fonction continue', (rng, level) => {
  const x0 = rng.int(-2, 2);
  const b = rng.int(-5, 5);
  const c = rng.int(-5, 5);
  if (level === 1) {
    // f(x) = x² + c si x < x0, ax + b si x ≥ x0 : a x0 + b = x0² + c.
    const x1 = x0 === 0 ? 1 : x0;
    const value = F(x1 * x1 + c - b, x1);
    return {
      prompt: `$f(x) = x^2${plus(c)}$ si $x < ${x1}$ et $f(x) = ax${plus(b)}$ si $x \\geq ${x1}$. Pour quelle valeur de $a$ la fonction $f$ est-elle continue sur $\\mathbb{R}$ ?`,
      answer: numF(value),
      hint: `Il faut que les deux expressions donnent la même valeur en $x = ${x1}$.`,
      correction: [`$${par(x1)}^2${plus(c)} = ${x1}a${plus(b)} \\iff a = ${tex(value)}$`],
    };
  }
  // Prolongement par continuité de (x² + px + q)/(x − r) en r.
  const r = rng.nonZero(-4, 4);
  const s = rng.int(-4, 4);
  const p = -(r + s);
  const q = r * s;
  const k = level === 3 ? rng.nonZero(-3, 3) : 1;
  return {
    prompt: `$f(x) = \\dfrac{${poly([k, k * p, k * q])}}{${affine(1, -r)}}$ est définie sur $\\mathbb{R}\\setminus\\{${r}\\}$. Par quelle valeur faut-il la prolonger en $${r}$ pour qu’elle soit continue ?`,
    answer: num(k * (r - s)),
    hint: `Factorise le numérateur par $${factor(r)}$.`,
    correction: [`$${poly([k, k * p, k * q])} = ${k === 1 ? '' : k === -1 ? '-' : k}${factor(r)}${factor(s)}$`, `$f(x) = ${k === 1 ? '' : k === -1 ? '-' : k}${factor(s)} \\to ${k * (r - s)}$ quand $x \\to ${r}$.`],
  };
});

const equivalent = skill('l1-equivalents-simples', 'Trouver un équivalent simple', (rng, level) => {
  const a = rng.nonZero(-4, 4);
  const b = rng.nonZero(-4, 4);
  const p = rng.int(1, 3);
  const q = p + rng.int(1, 2);
  const mono = (c: number, e: number) => `${c === 1 ? '' : c === -1 ? '-' : c}x${e === 1 ? '' : `^{${e}}`}`;
  const sum = `${mono(a, p)} ${b < 0 ? '-' : '+'} ${mono(Math.abs(b), q)}`;
  const atZero = level === 1 ? true : level === 2 ? false : rng.next() < 0.5;
  const correct = atZero ? mono(a, p) : mono(b, q);
  const other = atZero ? mono(b, q) : mono(a, p);
  if (level === 3 && rng.next() < 0.5) {
    const choices = ['x', 'x^2', '\\frac{x^2}{2}', '-\\frac{x^2}{2}', '\\frac{x^3}{6}', '-\\frac{x^3}{6}'];
    const pool: [string, string][] = [
      ['\\ln(1 + x) - x', '-\\frac{x^2}{2}'],
      ['e^x - 1 - x', '\\frac{x^2}{2}'],
      ['\\sin x - x', '-\\frac{x^3}{6}'],
      ['1 - \\cos x', '\\frac{x^2}{2}'],
      ['x - \\sin x', '\\frac{x^3}{6}'],
    ];
    const [f, eq] = rng.pick(pool);
    return {
      prompt: `Quel est un équivalent simple de $${f}$ quand $x \\to 0$ ?`,
      answer: texChoice(rng, eq, rng.shuffle(choices.filter((c) => c !== eq)).slice(0, 3)),
      hint: 'Utilise le premier terme non nul du développement limité.',
      correction: [`Le premier terme non nul du développement en $0$ donne $${f} \\sim ${eq}$.`],
    };
  }
  return {
    prompt: `Quel est un équivalent simple de $${sum}$ quand $x \\to ${atZero ? '0' : '+\\infty'}$ ?`,
    answer: texChoice(rng, correct, [other, atZero ? mono(-a, p) : mono(-b, q), mono(a, q), mono(b, p)], () => mono(rng.nonZero(-9, 9), rng.int(1, 5))),
    hint: atZero ? 'En $0$, c’est le terme de plus bas degré qui l’emporte.' : 'En $+\\infty$, c’est le terme de plus haut degré qui l’emporte.',
    correction: [`${atZero ? 'En $0$' : 'En $+\\infty$'}, $${other}$ est négligeable devant $${correct}$, donc $${sum} \\sim ${correct}$.`],
  };
});

const partieEntiere = skill('l1-partie-entiere', 'Manipuler la partie entière', (rng, level) => {
  if (level === 1) {
    const n = rng.int(-30, 30);
    const d = rng.int(2, 7);
    let m = n;
    while (m % d === 0) m = rng.int(-30, 30);
    return {
      prompt: `Calcule $\\left\\lfloor \\frac{${m}}{${d}} \\right\\rfloor$.`,
      answer: num(Math.floor(m / d)),
      hint: '$\\lfloor x \\rfloor$ est le plus grand entier inférieur ou égal à $x$ (attention aux négatifs).',
      correction: [`$${Math.floor(m / d)} \\leq \\frac{${m}}{${d}} < ${Math.floor(m / d) + 1}$`],
    };
  }
  const k = rng.int(2, 9);
  if (level === 2)
    return {
      prompt: `Calcule $\\displaystyle\\lim_{x \\to +\\infty} \\frac{\\lfloor ${k}x \\rfloor}{x}$.`,
      answer: num(k),
      hint: 'Encadre : $kx - 1 < \\lfloor kx \\rfloor \\leq kx$, puis divise par $x > 0$.',
      correction: [`$${k} - \\frac{1}{x} < \\frac{\\lfloor ${k}x \\rfloor}{x} \\leq ${k}$ : théorème des gendarmes, limite $${k}$.`],
    };
  return {
    prompt: `Calcule $\\displaystyle\\lim_{x \\to 0^+} x\\left\\lfloor \\frac{${k}}{x} \\right\\rfloor$.`,
    answer: num(k),
    hint: 'Encadre $\\lfloor u \\rfloor$ entre $u - 1$ et $u$ avec $u = \\frac{k}{x}$, puis multiplie par $x > 0$.',
    correction: [`$${k} - x < x\\left\\lfloor \\frac{${k}}{x} \\right\\rfloor \\leq ${k}$ : limite $${k}$ par les gendarmes.`],
  };
});

export const CONTINUITE_SKILLS: Skill[] = enrichir([formeIndeterminee, limitesUsuelles, parametre, equivalent, partieEntiere], CONTINUITE_VARIANTES);
