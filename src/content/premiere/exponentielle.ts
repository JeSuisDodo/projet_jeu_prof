import { frac, fracLatex } from '../../exercises/fraction';
import { paren, sumLatex } from '../../exercises/latex';
import { type Answer, type Skill, makeChoice } from '../../exercises/types';
import { enrich, variant } from '../../exercises/variantes';
import type { ChapterDef } from '../types';

/** 1re spécialité, chapitre « Fonction exponentielle ». */

/** e^{k} en LaTeX, avec e^1 = e et e^0 = 1. */
const ePow = (k: string) => (k === '1' ? 'e' : k === '0' ? '1' : `e^{${k}}`);

const proprietes: Skill = {
  id: '1re-exp-proprietes',
  name: 'Utiliser les propriétés de l’exponentielle',
  generate(rng, level) {
    const a = rng.nonZero(-6, 8);
    const b = rng.nonZero(-6, 6);
    const c = rng.nonZero(-5, 5);
    let expr: string;
    let k: number;
    let steps: string;
    if (level === 1) {
      expr = `${ePow(String(a))} \\times ${ePow(String(b))}`;
      k = a + b;
      steps = `$e^a \\times e^b = e^{a+b}$, donc l'exposant est $${a} + ${paren(b)} = ${k}$.`;
    } else if (level === 2) {
      expr = `\\frac{${ePow(String(a))} \\times ${ePow(String(b))}}{${ePow(String(c))}}`;
      k = a + b - c;
      steps = `$\\frac{e^a \\times e^b}{e^c} = e^{a+b-c}$, donc l'exposant est $${a} + ${paren(b)} - ${paren(c)} = ${k}$.`;
    } else {
      const n = rng.pick([2, 3, -2]);
      expr = `\\frac{\\left(${ePow(String(a))}\\right)^{${n}} \\times ${ePow(String(b))}}{${ePow(String(c))}}`;
      k = a * n + b - c;
      steps = `$(e^a)^n = e^{na}$, donc l'exposant est $${n}\\times ${paren(a)} + ${paren(b)} - ${paren(c)} = ${k}$.`;
    }
    return {
      skill: this.id,
      level,
      prompt: `Écris $${expr}$ sous la forme $e^k$. Que vaut $k$ ?`,
      answer: { kind: 'number', value: frac(k) },
      hint: '$e^a \\times e^b = e^{a+b}$, $\\frac{e^a}{e^b} = e^{a-b}$ et $(e^a)^n = e^{na}$.',
      correction: [steps],
    };
  },
};

const equation: Skill = {
  id: '1re-exp-equation',
  name: 'Résoudre une équation avec l’exponentielle',
  generate(rng, level) {
    // a x + b = c x + d, avec d choisi pour tomber sur x (entier, ou fraction de dénominateur a − c au niveau 3).
    const a = rng.nonZero(-4, 4);
    let c = level === 1 ? 0 : rng.int(-4, 4);
    if (a === c) c = a + 1;
    const x = level === 3 ? frac(rng.nonZero(-9, 9), a - c) : frac(rng.int(-6, 6));
    const b = rng.int(-8, 8);
    const d = ((a - c) * x.n) / x.d + b;
    const left = sumLatex([[a, 'x'], [b, '']]);
    const right = sumLatex([[c, 'x'], [d, '']]);
    return {
      skill: this.id,
      level,
      prompt: `Résous dans $\\mathbb{R}$ l'équation $e^{${left}} = ${ePow(right)}$.`,
      answer: { kind: 'set', values: [x] },
      hint: 'La fonction exponentielle est strictement croissante : $e^A = e^B \\iff A = B$.',
      correction: [`$e^{${left}} = ${ePow(right)} \\iff ${left} = ${right}$`, `$\\iff x = ${fracLatex(x)}$`],
    };
  },
};

const inequation: Skill = {
  id: '1re-exp-inequation',
  name: 'Résoudre une inéquation avec l’exponentielle',
  generate(rng, level) {
    const a = level === 1 ? 1 : rng.nonZero(-3, 3);
    const b = rng.nonZero(-6, 6);
    const k = rng.int(-6, 6);
    const greater = rng.next() < 0.5;
    // e^{ax+b} > e^k  <=>  ax + b > k  <=>  x > (k-b)/a (sens inversé si a < 0).
    const bound = frac(k - b, a);
    const xGreater = greater === a > 0;
    const interval = (v: string, up: boolean) => `$S = ${up ? `\\left]${v}\\,;\\,+\\infty\\right[` : `\\left]-\\infty\\,;\\,${v}\\right[`}$`;
    const good = interval(fracLatex(bound), xGreater);
    const wrong = fracLatex(frac(k + b, a));
    const sign = greater ? '>' : '<';
    const left = sumLatex([[a, 'x'], [b, '']]);
    return {
      skill: this.id,
      level,
      prompt: `Résous dans $\\mathbb{R}$ l'inéquation $e^{${left}} ${sign} ${ePow(String(k))}$.`,
      answer: makeChoice(rng, good, [interval(fracLatex(bound), !xGreater), interval(wrong, xGreater), interval(wrong, !xGreater)], () => interval(String(rng.int(-9, 9)), rng.next() < 0.5)),
      hint: '$e^A < e^B \\iff A < B$ ; attention au signe du coefficient de $x$ quand tu divises.',
      correction: [
        `$e^{${left}} ${sign} ${ePow(String(k))} \\iff ${left} ${sign} ${k}$`,
        `$\\iff x ${xGreater ? '>' : '<'} ${fracLatex(bound)}$${a < 0 ? ' (on divise par un nombre négatif : le sens change)' : ''}`,
        good,
      ],
    };
  },
};

/** Coefficient devant une expression : 1 et −1 ne s'écrivent pas. */
const coef = (k: number) => (k === 1 ? '' : k === -1 ? '-' : String(k));

const derivee: Skill = {
  id: '1re-exp-derivee',
  name: 'Dériver avec l’exponentielle',
  generate(rng, level) {
    if (level === 1) {
      // c e^{kx} : f'(x) = kc e^{kx}.
      const k = rng.pick([-3, -2, -1, 2, 3, 4, 5]);
      const c = rng.nonZero(-4, 4);
      const ekx = `e^{${sumLatex([[k, 'x']])}}`;
      const goodTex = `${coef(k * c)}${ekx}`;
      return {
        skill: this.id,
        level,
        prompt: `Soit $f(x) = ${coef(c)}${ekx}$. Quelle est sa fonction dérivée ?`,
        answer: makeChoice(
          rng,
          `$f'(x) = ${goodTex}$`,
          [`$f'(x) = ${coef(c)}${ekx}$`, `$f'(x) = ${coef(k * c)}x${ekx}$`, `$f'(x) = ${coef(c)}e^{${sumLatex([[k, 'x'], [-1, '']])}}$`],
          () => `$f'(x) = ${coef(rng.nonZero(-9, 9))}${ekx}$`,
        ),
        hint: '$(e^{kx})\' = ke^{kx}$.',
        correction: [`$f'(x) = ${c}\\times ${paren(k)}${ekx} = ${goodTex}$`],
      };
    }
    // (ax + b) e^x : u'v + uv' = (ax + a + b) e^x.
    const a = rng.nonZero(-4, 4);
    const b = rng.int(-6, 6);
    const u = sumLatex([[a, 'x'], [b, '']]);
    const good = `(${sumLatex([[a, 'x'], [a + b, '']])})e^x`;
    const decoys = [`${coef(a)}e^x`, `(${u})e^x`, `(${sumLatex([[a, 'x'], [b - a, '']])})e^x`];
    return {
      skill: this.id,
      level,
      prompt: `Soit $f(x) = (${u})e^x$. Quelle est sa fonction dérivée ?`,
      answer: makeChoice(rng, `$f'(x) = ${good}$`, decoys.map((d) => `$f'(x) = ${d}$`), () => `$f'(x) = (${sumLatex([[a, 'x'], [rng.int(-9, 9), '']])})e^x$`),
      hint: '$(uv)\' = u\'v + uv\'$ avec $u(x) = ax + b$ et $v(x) = e^x$.',
      correction: [`$f'(x) = ${coef(a)}e^x + (${u})e^x = ${good}$`],
    };
  },
};

const variations: Skill = {
  id: '1re-exp-extremum',
  name: 'Étudier une fonction avec l’exponentielle',
  generate(rng, level) {
    // f(x) = k(x - a) e^x : f'(x) = k(x - a + 1) e^x, extremum en x = a - 1.
    const a = rng.int(-4, 5);
    const k = level === 3 ? rng.pick([1, -1]) : 1;
    const inner = sumLatex([[k, 'x'], [-k * a, '']]);
    const deriv = sumLatex([[k, 'x'], [k - k * a, '']]);
    const at = a - 1;
    const word = k === 1 ? 'minimum' : 'maximum';
    return {
      skill: this.id,
      level,
      prompt: `Soit $f(x) = (${inner})e^x$. En quel nombre $f$ atteint-elle son ${word} ?`,
      answer: { kind: 'number', value: frac(at) },
      hint: 'Dérive, puis cherche où $f\'$ s’annule : $e^x$ est toujours strictement positif.',
      correction: [
        `$f'(x) = ${coef(k)}e^x + (${inner})e^x = (${deriv})e^x$`,
        `Comme $e^x > 0$, $f'(x)$ a le signe de $${deriv}$, qui s'annule en $${at}$ en passant ${k === 1 ? 'de − à +' : 'de + à −'} : ${word} en $x = ${at}$.`,
      ],
    };
  },
};

const vraiFaux = (b: boolean): Answer => ({ kind: 'choice', options: ['Vrai', 'Faux'], correct: b ? 0 : 1 });

const proprietesVariantes = [
  variant('vrai-faux', (rng) => {
    const a = rng.int(2, 6);
    const b = rng.int(2, 6);
    const n = rng.int(2, 4);
    const cas = rng.pick([
      { tex: `e^{${a}} + e^{${b}} = e^{${a + b}}`, ok: false, why: 'une somme d’exponentielles ne se simplifie pas : seul le produit donne $e^{a+b}$.' },
      { tex: `e^{${a}} \\times e^{${b}} = e^{${a * b}}`, ok: a * b === a + b, why: `$e^a \\times e^b = e^{a+b} = e^{${a + b}}$.` },
      { tex: `\\left(e^{${a}}\\right)^{${n}} = e^{${n * a}}`, ok: true, why: '$(e^a)^n = e^{na}$.' },
      { tex: `e^{-${a}} = \\frac{1}{e^{${a}}}`, ok: true, why: '$e^{-a} = \\frac{1}{e^a}$.' },
      { tex: `\\frac{e^{${a}}}{e^{${b}}} = e^{${a - b}}`, ok: true, why: '$\\frac{e^a}{e^b} = e^{a-b}$.' },
      { tex: `e^{-${a}} = -e^{${a}}`, ok: false, why: '$e^{-a} = \\frac{1}{e^a}$, qui est positif.' },
      { tex: `\\left(e^{${a}}\\right)^{2} = e^{${a * a}}`, ok: a === 2, why: `$(e^a)^2 = e^{2a} = e^{${2 * a}}$.` },
    ]);
    return {
      prompt: `Vrai ou faux : $${cas.tex}$.`,
      answer: vraiFaux(cas.ok),
      hint: '$e^a \\times e^b = e^{a+b}$, $\\frac{e^a}{e^b} = e^{a-b}$, $(e^a)^n = e^{na}$ et $e^{-a} = \\frac{1}{e^a}$.',
      correction: [`C'est ${cas.ok ? 'vrai' : 'faux'} : ${cas.why}`],
    };
  }),
  variant('exposant-inconnu', (rng, level) => {
    const a = rng.nonZero(-5, 6);
    const k = rng.nonZero(-6, 6);
    const n = level === 1 ? 1 : rng.pick([2, 3]);
    const c = a + n * k;
    const lhs = n === 1 ? `${ePow(String(a))} \\times e^{k}` : `${ePow(String(a))} \\times \\left(e^{k}\\right)^{${n}}`;
    return {
      prompt: `Quel nombre $k$ vérifie $${lhs} = ${ePow(String(c))}$ ?`,
      answer: { kind: 'number', value: frac(k) },
      hint: 'Écris le membre de gauche sous la forme $e^{\\dots}$ puis égale les exposants.',
      correction: [`$${lhs} = e^{${a} + ${n === 1 ? '' : n}k}$`, `$${a} + ${n === 1 ? '' : n}k = ${c} \\iff k = ${k}$`],
    };
  }),
  variant('simplifier-en-x', (rng, level) => {
    const a = rng.nonZero(-3, 3);
    const n = level === 1 ? 1 : rng.pick([2, 3]);
    const b = rng.nonZero(-3, 3);
    // (e^{x + a})^n × e^{bx} = e^{(n + b)x + na}
    const inner = sumLatex([[1, 'x'], [a, '']]);
    const expr = `${n === 1 ? `e^{${inner}}` : `\\left(e^{${inner}}\\right)^{${n}}`} \\times e^{${sumLatex([[b, 'x']])}}`;
    const exp = (p: number, q: number) => (p === 0 && q === 0 ? '$A(x) = 1$' : `$A(x) = e^{${sumLatex([[p, 'x'], [q, '']])}}$`);
    return {
      prompt: `Simplifie $A(x) = ${expr}$.`,
      answer: makeChoice(rng, exp(n + b, n * a), [exp(n * b, n * a), exp(1 + b, n * a), exp(n + b, a), exp(n * (1 + b), n * a)], () => exp(n + b + rng.nonZero(-2, 2), n * a)),
      hint: '$(e^u)^n = e^{nu}$ puis $e^u \\times e^v = e^{u+v}$.',
      correction: [`$A(x) = e^{${n === 1 ? inner : `${n}(${inner})`} + ${paren(b)}x}$`, exp(n + b, n * a)],
    };
  }),
];

const equationVariantes = [
  variant('produit-nul', (rng, level) => {
    const a = rng.nonZero(-4, 4);
    const x = level === 3 ? frac(rng.nonZero(-9, 9), a) : frac(rng.int(-6, 6));
    const b = (-a * x.n) / x.d;
    const k = level === 1 ? 1 : rng.nonZero(-3, 3);
    const u = sumLatex([[a, 'x'], [b, '']]);
    const ekx = `e^{${sumLatex([[k, 'x']])}}`;
    return {
      prompt: `Résous dans $\\mathbb{R}$ l'équation $(${u})${ekx} = 0$.`,
      answer: { kind: 'set', values: [x] },
      hint: 'Un produit est nul si l’un des facteurs est nul, et une exponentielle ne s’annule jamais.',
      correction: [`Comme $${ekx} > 0$, l'équation équivaut à $${u} = 0$, soit $x = ${fracLatex(x)}$.`],
    };
  }),
  variant('second-degre', (rng) => {
    const r1 = rng.int(-5, 4);
    const r2 = r1 + rng.int(0, 5);
    // x² = (r1 + r2) x - r1 r2
    const rhs = sumLatex([[r1 + r2, 'x'], [-r1 * r2, '']]);
    const values = r1 === r2 ? [frac(r1)] : [frac(r1), frac(r2)];
    return {
      prompt: `Résous dans $\\mathbb{R}$ l'équation $e^{x^2} = ${ePow(rhs)}$.`,
      answer: { kind: 'set', values },
      hint: '$e^A = e^B \\iff A = B$ : on obtient une équation du second degré.',
      correction: [`$e^{x^2} = ${ePow(rhs)} \\iff ${sumLatex([[1, 'x^2'], [-(r1 + r2), 'x'], [r1 * r2, '']])} = 0$`, r1 === r2 ? `Racine double : $x = ${r1}$.` : `Les solutions sont $${r1}$ et $${r2}$.`],
    };
  }),
  variant('inverse', (rng) => {
    const a = rng.nonZero(-4, 4);
    const x = frac(rng.nonZero(-6, 6));
    const b = (-a * x.n) / x.d;
    return {
      prompt: `Résous dans $\\mathbb{R}$ l'équation $\\frac{1}{e^{${sumLatex([[a, 'x']])}}} = ${ePow(String(b))}$.`,
      answer: { kind: 'set', values: [x] },
      hint: '$\\frac{1}{e^u} = e^{-u}$.',
      correction: [`$\\frac{1}{e^{${sumLatex([[a, 'x']])}}} = e^{${sumLatex([[-a, 'x']])}}$, donc $${sumLatex([[-a, 'x']])} = ${b}$ et $x = ${fracLatex(x)}$.`],
    };
  }),
];

const inequationVariantes = [
  variant('vrai-faux', (rng) => {
    const a = rng.nonZero(-4, 4);
    const b = rng.int(-5, 5);
    const k = rng.nonZero(-3, 3);
    const m = rng.pick([1, 2, 3]);
    const cas = rng.pick([
      { tex: `pour tout réel $x$, $e^{${sumLatex([[a, 'x'], [b, '']])}} > 0$`, ok: true, why: 'une exponentielle est toujours strictement positive.' },
      { tex: `pour tout $x \\geq 0$, $e^{${sumLatex([[k, 'x']])}} \\geq 1$`, ok: k > 0, why: k > 0 ? `si $x \\geq 0$, alors $${sumLatex([[k, 'x']])} \\geq 0$ donc $e^{${sumLatex([[k, 'x']])}} \\geq e^0 = 1$.` : `pour $x = 1$, $e^{${k}} < 1$.` },
      { tex: `pour tout $x \\geq 0$, $e^{${sumLatex([[k, 'x']])}} \\leq 1$`, ok: k < 0, why: k < 0 ? `si $x \\geq 0$, alors $${sumLatex([[k, 'x']])} \\leq 0$ donc $e^{${sumLatex([[k, 'x']])}} \\leq 1$.` : `pour $x = 1$, $e^{${k}} > 1$.` },
      { tex: `pour tout réel $x$, $e^{x} \\geq ${sumLatex([[m, 'x']])}$`, ok: m < 3, why: m < 3 ? `la fonction $x \\mapsto e^x - ${sumLatex([[m, 'x']])}$ a pour minimum ${m === 1 ? '$0$ (en $x = 0$)' : '$2 - 2\\ln 2 > 0$'}.` : 'pour $x = 1{,}1$, $e^{1{,}1} \\approx 3{,}004 < 3{,}3$.' },
      { tex: `pour tout réel $x$, $e^{x^2} \\geq 1$`, ok: true, why: '$x^2 \\geq 0$ donc $e^{x^2} \\geq e^0 = 1$.' },
    ]);
    return {
      prompt: `Vrai ou faux : ${cas.tex}.`,
      answer: vraiFaux(cas.ok),
      hint: 'L’exponentielle est strictement positive et croissante : compare les exposants, ou cherche un contre-exemple.',
      correction: [`C'est ${cas.ok ? 'vrai' : 'faux'} : ${cas.why}`],
    };
  }),
  variant('plus-petit-entier', (rng) => {
    const a = rng.int(1, 4);
    const b = rng.int(-6, 6);
    const c = rng.int(-6, 9);
    // a n + b > c  <=>  n > (c - b) / a
    const n = Math.floor((c - b) / a) + 1;
    return {
      prompt: `Quel est le plus petit entier $n$ tel que $e^{${sumLatex([[a, 'n'], [b, '']])}} > ${ePow(String(c))}$ ?`,
      answer: { kind: 'number', value: frac(n) },
      hint: 'Compare les exposants, puis cherche le premier entier qui convient.',
      correction: [`$e^{${sumLatex([[a, 'n'], [b, '']])}} > ${ePow(String(c))} \\iff ${sumLatex([[a, 'n'], [b, '']])} > ${c} \\iff n > ${fracLatex(frac(c - b, a))}$`, `Le plus petit entier qui convient est $${n}$.`],
    };
  }),
];

const deriveeVariantes = [
  variant('nombre-derive-en-0', (rng) => {
    const a = rng.int(-4, 4);
    const b = rng.nonZero(-5, 5);
    const k = rng.nonZero(-3, 3);
    const u = sumLatex([[a, 'x'], [b, '']]);
    const ekx = k === 1 ? 'e^x' : `e^{${sumLatex([[k, 'x']])}}`;
    return {
      prompt: `Soit $f(x) = ${a === 0 ? coef(b) : `(${u})`}${ekx}$. Calcule $f'(0)$.`,
      answer: { kind: 'number', value: frac(a + k * b) },
      hint: 'Dérive le produit, puis remplace $x$ par $0$ en te souvenant que $e^0 = 1$.',
      correction: [`$f'(x) = ${a === 0 ? '' : `${coef(a)}${ekx} + `}${k === 1 ? '' : `${paren(k)}\\times `}${a === 0 ? coef(b) : `(${u})`}${ekx}$`, `$f'(0) = ${a} + ${paren(k)}\\times ${paren(b)} = ${a + k * b}$`],
    };
  }),
  variant('tangente-en-0', (rng) => {
    const c = rng.nonZero(-4, 4);
    const k = rng.nonZero(-3, 3);
    const d = rng.int(-5, 5);
    const ekx = k === 1 ? 'e^x' : `e^{${sumLatex([[k, 'x']])}}`;
    const line = (m: number, p: number) => `$y = ${sumLatex([[m, 'x'], [p, '']]) || '0'}$`;
    return {
      prompt: `Soit $f(x) = ${coef(c)}${ekx}${d === 0 ? '' : ` ${d < 0 ? '-' : '+'} ${Math.abs(d)}`}$. Quelle est l'équation de la tangente à sa courbe au point d'abscisse $0$ ?`,
      answer: makeChoice(rng, line(k * c, c + d), [line(c, c + d), line(k * c, d), line(k * c, c), line(k, c + d)], () => line(k * c + rng.nonZero(-3, 3), c + d)),
      hint: '$y = f\'(0)(x - 0) + f(0)$.',
      correction: [`$f(0) = ${c + d}$ et $f'(x) = ${coef(k * c)}${ekx}$, donc $f'(0) = ${k * c}$.`, line(k * c, c + d)],
    };
  }),
];

const variationsVariantes = [
  variant('croissante-sur', (rng) => {
    const a = rng.nonZero(-3, 3);
    const b = rng.int(-5, 5);
    // f'(x) = (ax + a + b) e^x, qui s'annule en -(a + b) / a.
    const z = frac(-(a + b), a);
    const up = a > 0;
    const inter = (right: boolean, v: string) => (right ? `$[${v}\\,;\\,+\\infty\\mathclose{[}$` : `$\\mathopen{]}-\\infty\\,;\\,${v}]$`);
    const good = inter(up, fracLatex(z));
    const u = sumLatex([[a, 'x'], [b, '']]);
    return {
      prompt: `Soit $f(x) = (${u})e^x$. Sur quel intervalle $f$ est-elle croissante ?`,
      answer: makeChoice(rng, good, [inter(!up, fracLatex(z)), inter(up, fracLatex(frac(-b, a))), inter(!up, fracLatex(frac(-b, a)))], () => inter(up, String(rng.int(-9, 9)))),
      hint: '$f\'(x) = (ax + a + b)e^x$ a le signe de $ax + a + b$.',
      correction: [`$f'(x) = (${sumLatex([[a, 'x'], [a + b, '']])})e^x$`, `$f'(x) \\geq 0 \\iff ${sumLatex([[a, 'x'], [a + b, '']])} \\geq 0$ : $f$ est croissante sur ${good}.`],
    };
  }),
  variant('valeur-minimum', (rng) => {
    const a = rng.int(-3, 4);
    // f(x) = (x - a) e^x : minimum en a - 1, qui vaut -e^{a - 1}.
    const val = (k: number) => `$-${ePow(String(k))}$`;
    return {
      prompt: `Soit $f(x) = (${sumLatex([[1, 'x'], [-a, '']])})e^x$. Quelle est la valeur du minimum de $f$ ?`,
      answer: makeChoice(rng, val(a - 1), [val(a), `$${ePow(String(a - 1))}$`, `$${a - 1}$`, val(a + 1)], () => val(a - 2)),
      hint: 'Le minimum est atteint où $f\'$ s’annule ; calcule ensuite l’image de ce nombre.',
      correction: [`$f'(x) = (${sumLatex([[1, 'x'], [1 - a, '']])})e^x$ s'annule en $${a - 1}$ en passant de − à +.`, `$f(${a - 1}) = -1 \\times ${ePow(String(a - 1))} = ${val(a - 1).replace(/\$/g, '')}$`],
    };
  }),
];

export const EXPONENTIELLE: ChapterDef = {
  id: '1re-exponentielle',
  title: 'Fonction exponentielle',
  region: 'Désert Exponentiel',
  theme: 'desert',
  terrain: 'desert',
  skills: [
    enrich(proprietes, proprietesVariantes),
    enrich(equation, equationVariantes),
    enrich(inequation, inequationVariantes),
    enrich(derivee, deriveeVariantes),
    enrich(variations, variationsVariantes),
  ],
  creatures: [
    {
      id: '1re-expounet',
      name: 'Expounet',
      description: 'Un petit blob qui double de volume dès qu’on le regarde. Il adore additionner ses exposants.',
      skills: ['1re-exp-proprietes'],
      look: { shape: 'blob', hue: 38, symbol: 'eˣ' },
    },
    {
      id: '1re-scarabexp',
      name: 'Scarabexp',
      description: 'Un scarabée des sables qui ne garde que les exposants : e puissance A égale e puissance B, donc A égale B.',
      skills: ['1re-exp-equation', '1re-exp-proprietes'],
      look: { shape: 'insecte', hue: 30, symbol: '=' },
    },
    {
      id: '1re-dunelion',
      name: 'Dunelion',
      description: 'Un lion des dunes qui garde l’ordre des choses : l’exponentielle ne change jamais le sens d’une inégalité.',
      skills: ['1re-exp-inequation', '1re-exp-equation'],
      look: { shape: 'bete', hue: 42, symbol: '<' },
    },
    {
      id: '1re-mirageon',
      name: 'Mirageon',
      description: 'Un esprit de mirage, sa propre dérivée : on croit qu’il change, il reste le même.',
      skills: ['1re-exp-derivee', '1re-exp-extremum'],
      look: { shape: 'spectre', hue: 48, symbol: 'e' },
    },
  ],
  boss: {
    id: '1re-exponaute',
    name: 'Exponaute',
    description: 'Le gardien du désert, sculpté dans le grès, toujours strictement positif.',
    skills: ['1re-exp-proprietes', '1re-exp-equation', '1re-exp-inequation', '1re-exp-derivee', '1re-exp-extremum'],
    look: { shape: 'golem', hue: 35, symbol: 'e' },
  },
};
