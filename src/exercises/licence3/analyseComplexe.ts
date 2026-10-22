import type { Skill } from '../types';
import { F, add, choiceTex, div, fact, num, numF, skill, tex } from './util';

/** Chapitre « Analyse complexe » (Licence 3). */

/** (z - a) en LaTeX. */
const zMinus = (a: number) => (a === 0 ? 'z' : `(z ${a < 0 ? '+' : '-'} ${Math.abs(a)})`);

const residuSimple = skill('l3-residu-pole-simple', 'Calculer un résidu en un pôle simple', (rng, level) => {
  const a = rng.int(-3, 3);
  let b = rng.int(-3, 3);
  if (b === a) b = a + rng.pick([1, 2]);
  let c = level === 1 ? 0 : rng.int(-3, 3);
  // Le numérateur ne doit pas s'annuler en a (sinon a n'est pas un pôle).
  if (a + c === 0) c += 1;
  const k = rng.nonZero(1, 4);
  // Résidu en a de (z + c) / ((z - a)(z - b)) ou k / ((z - a)(z - b)).
  const numer = level === 1 ? String(k) : c === 0 ? 'z' : `z ${c < 0 ? '-' : '+'} ${Math.abs(c)}`;
  const top = level === 1 ? k : a + c;
  const value = div(F(top), F(a - b));
  return {
    prompt: `Calcule le résidu de $f(z) = \\dfrac{${numer}}{${zMinus(a)}${zMinus(b)}}$ en $z = ${a}$.`,
    answer: numF(value),
    hint: 'En un pôle simple $a$ : $\\operatorname{Res}(f, a) = \\lim_{z \\to a} (z - a)f(z)$.',
    correction: [`$(z - a)f(z) = \\dfrac{${numer}}{${zMinus(b)}}$, qu’on évalue en $z = ${a}$.`, `$\\operatorname{Res}(f, ${a}) = \\frac{${top}}{${a - b}} = ${tex(value)}$`],
  };
});

const integraleResidus = skill('l3-theoreme-residus', 'Calculer une intégrale avec le théorème des résidus', (rng, level) => {
  const R = rng.int(2, 4);
  const inside = rng.int(-(R - 1), R - 1);
  const outside = rng.sign() * rng.int(R + 1, R + 3);
  const both = level === 3 && rng.next() < 0.5;
  const b = both ? rng.pick([inside + 1, inside - 1].filter((x) => Math.abs(x) < R)) : outside;
  // ∮ 1/((z - a)(z - b)) : résidus 1/(a - b) et 1/(b - a).
  const resA = div(F(1), F(inside - b));
  const resB = div(F(1), F(b - inside));
  const k = both ? add(resA, resB) : resA;
  return {
    prompt: `On note $I = \\displaystyle\\oint_{|z| = ${R}} \\frac{dz}{${zMinus(inside)}${zMinus(b)}}$ (cercle parcouru une fois dans le sens direct). On a $I = 2i\\pi\\,k$ : donne $k$.`,
    answer: numF(k),
    hint: '$I = 2i\\pi \\sum \\operatorname{Res}$ sur les pôles situés à l’intérieur du cercle.',
    correction: [
      both ? `Les deux pôles $${inside}$ et $${b}$ sont dans le disque.` : `Seul le pôle $${inside}$ est dans le disque ($|${b}| > ${R}$).`,
      both
        ? `Résidus : $${tex(resA)}$ et $${tex(resB)}$, de somme $${tex(k)}$.`
        : `$\\operatorname{Res} = \\frac{1}{${inside} - ${b < 0 ? `(${b})` : b}} = ${tex(k)}$`,
      `$k = ${tex(k)}$`,
    ],
  };
});

const rayon = skill('l3-rayon-convergence', 'Trouver un rayon de convergence', (rng, level) => {
  if (level === 3) {
    const s = rng.int(2, 4);
    const p = rng.int(0, 2);
    return {
      prompt: `Rayon de convergence de $\\displaystyle\\sum_{n \\geq 1} ${p === 0 ? '' : p === 1 ? 'n\\,' : `n^{${p}}\\,`}${s * s}^n z^{2n}$ ?`,
      answer: numF(F(1, s)),
      hint: 'Pose $w = z^2$ : la série en $w$ a un rayon $\\rho$, donc la série en $z$ a pour rayon $\\sqrt{\\rho}$.',
      correction: [`En $w = z^2$, le rayon est $\\frac{1}{${s * s}}$ (règle de d’Alembert).`, `Rayon en $z$ : $\\sqrt{\\frac{1}{${s * s}}} = \\frac{1}{${s}}$`],
    };
  }
  const p = rng.int(1, 5);
  const q = rng.int(1, 5);
  const ratio = F(p, q);
  const m = level === 2 ? rng.int(1, 3) : 0;
  const coef = ratio.d === 1 ? `${ratio.n}^n` : `\\left(${tex(ratio)}\\right)^n`;
  const R = div(F(1), ratio);
  return {
    prompt: `Rayon de convergence de $\\displaystyle\\sum_{n \\geq 1} ${m === 0 ? '' : m === 1 ? 'n\\,' : `n^{${m}}\\,`}${coef} z^n$ ?`,
    answer: numF(R),
    hint: 'Règle de d’Alembert : $R = \\lim \\left|\\frac{a_n}{a_{n+1}}\\right|$ ; un facteur polynomial en $n$ ne change pas le rayon.',
    correction: [`$\\left|\\frac{a_{n+1}}{a_n}\\right| \\to ${tex(ratio)}$.`, `$R = ${tex(R)}$`],
  };
});

const HOLO = ['z^2 + 3z', 'e^{z}', '\\sin z', 'z^3 - iz', 'e^{iz}', '\\cos(2z)'];
const NON_HOLO: [string, number][] = [
  ['\\bar z', 1],
  ['|z|^2', 1],
  ['\\operatorname{Re} z', 1],
  ['z\\,\\bar z', 2],
  ['\\operatorname{Im}(z^2)', 2],
  ['x^2 + y^2 + 2ixy', 3],
  ['x + 2iy', 3],
  ['e^{\\bar z}', 2],
];

const holomorphe = skill('l3-holomorphie', 'Reconnaître une fonction holomorphe', (rng, level) => {
  const correct = level === 3 ? rng.pick(['x^2 - y^2 + 2ixy', 'e^x(\\cos y + i\\sin y)', 'x + iy']) : rng.pick(HOLO);
  const decoys = NON_HOLO.filter(([, l]) => l <= level).map(([s]) => s);
  return {
    prompt: `Laquelle de ces fonctions de $z = x + iy$ est holomorphe sur $\\mathbb{C}$ ?`,
    answer: choiceTex(rng, correct, rng.shuffle(decoys).slice(0, 3), () => '|z|'),
    hint: 'Conditions de Cauchy-Riemann : $\\partial_x u = \\partial_y v$ et $\\partial_y u = -\\partial_x v$. Une fonction qui dépend de $\\bar z$ ne l’est pas.',
    correction: [`$${correct}$ vérifie les conditions de Cauchy-Riemann (c’est une fonction de $z$ seul).`, 'Les autres dépendent de $\\bar z$ : elles ne sont pas $\\mathbb{C}$-dérivables, sauf peut-être en quelques points.'],
  };
});

const ordreZero = skill('l3-ordre-zero', 'Trouver l’ordre d’un zéro', (rng, level) => {
  const k = rng.int(2, 4);
  const bank: [string, number, string][] = [
    [`z^{${k}}\\sin z`, k + 1, `$\\sin z = z - \\frac{z^3}{6} + \\dots$ a un zéro simple, multiplié par $z^{${k}}$.`],
    [`\\sin(z^{${k}})`, k, `$\\sin(z^{${k}}) = z^{${k}} - \\dots$`],
    [`(e^z - 1)^{${k}}`, k, '$e^z - 1 = z + \\frac{z^2}{2} + \\dots$ a un zéro simple.'],
  ];
  if (level >= 2)
    bank.push(
      ['\\sin z - z', 3, '$\\sin z - z = -\\frac{z^3}{6} + \\dots$'],
      ['1 - \\cos z', 2, '$1 - \\cos z = \\frac{z^2}{2} - \\dots$'],
      ['e^z - 1 - z', 2, '$e^z - 1 - z = \\frac{z^2}{2} + \\dots$'],
    );
  if (level === 3)
    bank.push(
      [`z^{${k}}(1 - \\cos z)`, k + 2, `$1 - \\cos z$ a un zéro d’ordre $2$, multiplié par $z^{${k}}$.`],
      ['\\sin z - z\\cos z', 3, '$\\sin z - z\\cos z = \\left(z - \\frac{z^3}{6}\\right) - \\left(z - \\frac{z^3}{2}\\right) + \\dots = \\frac{z^3}{3} + \\dots$'],
      ['\\tan z - \\sin z', 3, '$\\tan z - \\sin z = \\left(z + \\frac{z^3}{3}\\right) - \\left(z - \\frac{z^3}{6}\\right) + \\dots = \\frac{z^3}{2} + \\dots$'],
    );
  const [f, order, why] = rng.pick(bank);
  return {
    prompt: `Quel est l’ordre du zéro en $0$ de $f(z) = ${f}$ ?`,
    answer: num(order),
    hint: 'Développe en série entière autour de $0$ : l’ordre est l’indice du premier coefficient non nul.',
    correction: [why, `Ordre : $${order}$`],
  };
});

const residuExp = skill('l3-residu-pole-multiple', 'Calculer un résidu en un pôle multiple', (rng, level) => {
  const k = rng.int(2, level === 1 ? 3 : 4);
  const a = level === 1 ? 1 : rng.nonZero(-3, 3);
  const value = F(a ** (k - 1), fact(k - 1));
  const az = a === 1 ? 'z' : a === -1 ? '-z' : `${a}z`;
  return {
    prompt: `Calcule le résidu de $f(z) = \\dfrac{e^{${az}}}{z^{${k}}}$ en $0$.`,
    answer: numF(value),
    hint: 'Le résidu est le coefficient de $\\frac{1}{z}$ dans le développement de Laurent : cherche le terme en $z^{k-1}$ de $e^{az}$.',
    correction: [`$e^{${az}} = \\sum \\frac{${a === 1 ? '' : a < 0 ? `(${a})^n` : `${a}^n`}z^n}{n!}$ ; le terme en $z^{${k - 1}}$ a pour coefficient $\\frac{${a === 1 ? 1 : a < 0 ? `(${a})^{${k - 1}}` : `${a}^{${k - 1}}`}}{${k - 1}!}$.`, `$\\operatorname{Res}(f, 0) = ${tex(value)}$`],
  };
});

export const ANALYSE_COMPLEXE_SKILLS: Skill[] = [residuSimple, integraleResidus, rayon, holomorphe, ordreZero, residuExp];
