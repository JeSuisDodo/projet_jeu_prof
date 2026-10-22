import { frac, fracLatex } from '../../exercises/fraction';
import { paren, sumLatex } from '../../exercises/latex';
import { type Skill, makeChoice } from '../../exercises/types';
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

export const EXPONENTIELLE: ChapterDef = {
  id: '1re-exponentielle',
  title: 'Fonction exponentielle',
  region: 'Désert Exponentiel',
  theme: 'desert',
  skills: [proprietes, equation, inequation, derivee, variations],
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
