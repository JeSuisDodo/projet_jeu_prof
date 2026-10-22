import { frac } from '../../exercises/fraction';
import { paren, sumLatex } from '../../exercises/latex';
import type { Rng } from '../../exercises/rng';
import { type Level, type Skill, makeChoice } from '../../exercises/types';
import type { ChapterDef } from '../types';
import { type Poly, polyDeriv, polyEval, polyTex } from './poly';

/** 1re spécialité, chapitre « Applications de la dérivation » : variations, extremums, optimisation. */

interface Cubic {
  f: Poly;
  /** f'(x) = 3k(x - α)(x - β), α < β. */
  k: 1 | -1;
  alpha: number;
  beta: number;
}

/** Fonction de degré 3 dont la dérivée a deux racines entières α < β (de même parité, pour des coefficients entiers). */
function cubic(rng: Rng, level: Level): Cubic {
  const k = level === 3 ? rng.sign() : 1;
  let alpha: number;
  let beta: number;
  if (level === 1) {
    beta = rng.int(1, 3);
    alpha = -beta;
  } else {
    alpha = rng.int(-4, 2);
    beta = alpha + 2 * rng.int(1, 3);
  }
  const r = rng.int(-6, 6);
  return { f: [r, 3 * k * alpha * beta, (-3 * k * (alpha + beta)) / 2, k], k, alpha, beta };
}

const derivLines = (c: Cubic) => [
  `$f'(x) = ${polyTex(polyDeriv(c.f))} = ${c.k === 1 ? '3' : '-3'}${c.alpha === 0 ? 'x' : `(x ${c.alpha < 0 ? '+' : '-'} ${Math.abs(c.alpha)})`}${c.beta === 0 ? 'x' : `(x ${c.beta < 0 ? '+' : '-'} ${Math.abs(c.beta)})`}$`,
];

const pointsCritiques: Skill = {
  id: '1re-points-critiques',
  name: 'Résoudre f′(x) = 0',
  generate(rng, level) {
    const c = cubic(rng, level);
    const d = polyDeriv(c.f);
    return {
      skill: this.id,
      level,
      prompt: `Soit $f(x) = ${polyTex(c.f)}$. Résous l'équation $f'(x) = 0$.`,
      answer: { kind: 'set', values: [frac(c.alpha), frac(c.beta)] },
      hint: 'Dérive, puis résous l’équation du second degré obtenue (discriminant ou factorisation).',
      correction: [
        `$f'(x) = ${polyTex(d)}$`,
        `$\\Delta = ${paren(d[1])}^2 - 4\\times ${paren(d[2])}\\times ${paren(d[0])} = ${d[1] * d[1] - 4 * d[2] * d[0]}$, d'où deux solutions : $${c.alpha}$ et $${c.beta}$.`,
      ],
    };
  },
};

const interval = (lo: string, hi: string, open: [boolean, boolean]) => `${open[0] ? ']' : '['}${lo}\\,;\\,${hi}${open[1] ? '[' : ']'}`;
const pattern = (up: boolean, a: number, b: number) => {
  const w = (u: boolean) => (u ? 'croissante' : 'décroissante');
  return `$f$ est ${w(up)} sur $${interval('-\\infty', String(a), [true, false])}$, ${w(!up)} sur $${interval(String(a), String(b), [false, false])}$ et ${w(up)} sur $${interval(String(b), '+\\infty', [false, true])}$.`;
};

const variations: Skill = {
  id: '1re-variations',
  name: 'Déterminer les variations',
  generate(rng, level) {
    const c = cubic(rng, level);
    const up = c.k === 1;
    const good = pattern(up, c.alpha, c.beta);
    const decoys = [pattern(!up, c.alpha, c.beta), pattern(up, -c.beta, -c.alpha), pattern(up, c.alpha - 1, c.beta + 1), `$f$ est ${up ? 'croissante' : 'décroissante'} sur $\\mathbb{R}$.`];
    return {
      skill: this.id,
      level,
      prompt: `Soit $f(x) = ${polyTex(c.f)}$. Quelles sont ses variations ?`,
      answer: makeChoice(rng, good, decoys, () => pattern(!up, c.alpha + 1, c.beta + 2)),
      hint: 'Étudie le signe de $f\'(x)$ : un trinôme est du signe de son coefficient dominant à l’extérieur de ses racines.',
      correction: [
        ...derivLines(c),
        `$f'(x)$ est du signe de $${3 * c.k}$ à l'extérieur des racines $${c.alpha}$ et $${c.beta}$, et du signe contraire entre elles.`,
        good,
      ],
    };
  },
};

const extremum: Skill = {
  id: '1re-extremum-local',
  name: 'Trouver un extremum local',
  generate(rng, level) {
    const c = cubic(rng, level);
    const wantMax = rng.next() < 0.5;
    // k = 1 : maximum en α, minimum en β ; k = -1 : l'inverse.
    const at = (wantMax ? c.k === 1 : c.k === -1) ? c.alpha : c.beta;
    const value = polyEval(c.f, at);
    const word = wantMax ? 'maximum' : 'minimum';
    const askValue = level > 1;
    return {
      skill: this.id,
      level,
      prompt: `Soit $f(x) = ${polyTex(c.f)}$. ${askValue ? `Quelle est la valeur du ${word} local de $f$ ?` : `En quel nombre $f$ admet-elle un ${word} local ?`}`,
      answer: { kind: 'number', value: frac(askValue ? value : at) },
      hint: `Cherche où $f'$ s'annule en changeant de signe ; un ${word} correspond à un passage ${wantMax ? 'de + à −' : 'de − à +'}.`,
      correction: [
        ...derivLines(c),
        `$f'$ change de signe ${wantMax ? 'de + à −' : 'de − à +'} en $${at}$ : $f$ y admet un ${word} local.`,
        ...(askValue ? [`$f(${at}) = ${value}$`] : []),
      ],
    };
  },
};

const composee: Skill = {
  id: '1re-derivee-composee',
  name: 'Dériver f(ax + b)',
  generate(rng, level) {
    const a = rng.nonZero(-5, 5);
    const b = rng.nonZero(-6, 6);
    const inner = sumLatex([[a, 'x'], [b, '']]);
    const kind = level === 1 ? 'power' : rng.pick(['power', 'sqrt', 'inv'] as const);
    let f: string;
    let good: string;
    let decoys: string[];
    let rule: string;
    if (kind === 'power') {
      const n = level === 1 ? 2 : rng.pick([2, 3, 4]);
      f = `(${inner})^${n}`;
      good = `${n * a}(${inner})${n - 1 > 1 ? `^${n - 1}` : ''}`;
      decoys = [`${n}(${inner})${n - 1 > 1 ? `^${n - 1}` : ''}`, `${a}(${inner})^${n}`, `${n * a}(${inner})^${n}`];
      rule = `Si $g(x) = f(ax + b)$, alors $g'(x) = a\\,f'(ax + b)$ ; ici $f(X) = X^${n}$ et $f'(X) = ${n}X${n - 1 > 1 ? `^${n - 1}` : ''}$.`;
    } else if (kind === 'sqrt') {
      f = `\\sqrt{${inner}}`;
      good = `\\frac{${a}}{2\\sqrt{${inner}}}`;
      decoys = [`\\frac{1}{2\\sqrt{${inner}}}`, `\\frac{${a}}{\\sqrt{${inner}}}`, `${a}\\sqrt{${inner}}`];
      rule = 'Avec $f(X) = \\sqrt{X}$, $f\'(X) = \\frac{1}{2\\sqrt{X}}$, et on multiplie par $a$.';
    } else {
      f = `\\frac{1}{${inner}}`;
      good = `${a > 0 ? '-' : ''}\\frac{${Math.abs(a)}}{(${inner})^2}`;
      decoys = [`-\\frac{1}{(${inner})^2}`, `${a < 0 ? '-' : ''}\\frac{${Math.abs(a)}}{(${inner})^2}`, `\\frac{${a}}{${inner}}`];
      rule = 'Avec $f(X) = \\frac{1}{X}$, $f\'(X) = -\\frac{1}{X^2}$, et on multiplie par $a$.';
    }
    return {
      skill: this.id,
      level,
      prompt: `Soit $g(x) = ${f}$. Quelle est sa fonction dérivée ?`,
      answer: makeChoice(rng, `$g'(x) = ${good}$`, decoys.map((d) => `$g'(x) = ${d}$`), () => `$g'(x) = ${rng.int(2, 9)}(${inner})$`),
      hint: '$(f(ax + b))\' = a \\times f\'(ax + b)$ : n’oublie pas le facteur $a$.',
      correction: [rule, `$g'(x) = ${good}$`],
    };
  },
};

const optimisation: Skill = {
  id: '1re-optimisation',
  name: 'Résoudre un problème d’optimisation',
  generate(rng, level) {
    if (level < 3) {
      // Bénéfice B(x) = -a x² + b x - c, maximal en x = b / (2a).
      const a = level === 1 ? 1 : rng.pick([1, 2, 5]);
      const best = rng.int(2, 12);
      const b = 2 * a * best;
      const c = rng.int(5, 40);
      return {
        skill: this.id,
        level,
        prompt: `Une entreprise fabrique $x$ centaines d'objets par jour. Son bénéfice, en milliers d'euros, est $B(x) = ${sumLatex([[-a, 'x^2'], [b, 'x'], [-c, '']])}$. Combien de centaines d'objets doit-elle fabriquer pour que le bénéfice soit maximal ?`,
        answer: { kind: 'number', value: frac(best) },
        hint: 'Le maximum est atteint là où $B\'(x)$ s’annule en passant de + à −.',
        correction: [`$B'(x) = ${sumLatex([[-2 * a, 'x'], [b, '']])}$`, `$B'(x) = 0 \\iff x = \\frac{${b}}{${2 * a}} = ${best}$ ; $B'$ est positive avant, négative après : le bénéfice est maximal pour $x = ${best}$.`],
      };
    }
    // Volume ou bénéfice de degré 3 : maximum en β sur [0 ; +∞[ (k = -1, α < 0 < β).
    const beta = rng.int(2, 6);
    const alpha = -beta - 2 * rng.int(0, 2);
    const k = -1;
    const f: Poly = [0, 3 * k * alpha * beta, (-3 * k * (alpha + beta)) / 2, k];
    return {
      skill: this.id,
      level,
      prompt: `Pour $x \\geq 0$, le bénéfice d'un artisan est $B(x) = ${polyTex(f)}$ (en centaines d'euros, $x$ en dizaines d'objets). Pour quelle valeur de $x$ est-il maximal ?`,
      answer: { kind: 'number', value: frac(beta) },
      hint: 'Résous $B\'(x) = 0$ et garde la solution positive où $B\'$ passe de + à −.',
      correction: [
        `$B'(x) = ${polyTex(polyDeriv(f))} = -3(x ${alpha < 0 ? '+' : '-'} ${Math.abs(alpha)})(x - ${beta})$`,
        `Sur $[0\\,;\\,+\\infty[$, $B'(x) > 0$ avant $${beta}$ et $B'(x) < 0$ après : le bénéfice est maximal pour $x = ${beta}$.`,
      ],
    };
  },
};

export const APPLICATIONS_DERIVATION: ChapterDef = {
  id: '1re-applications-derivation',
  title: 'Applications de la dérivation',
  region: 'Vallée des Variations',
  theme: 'automne',
  terrain: 'riviere',
  skills: [pointsCritiques, variations, extremum, composee, optimisation],
  creatures: [
    {
      id: '1re-critix',
      name: 'Critix',
      description: 'Un insecte qui s’arrête net partout où la dérivée s’annule.',
      skills: ['1re-points-critiques'],
      look: { shape: 'insecte', hue: 35, symbol: '0' },
    },
    {
      id: '1re-varioline',
      name: 'Varioline',
      description: 'Une plante grimpante qui monte, redescend, puis remonte, en suivant le signe de f′.',
      skills: ['1re-variations', '1re-points-critiques'],
      look: { shape: 'plante', hue: 20, symbol: '↗↘' },
    },
    {
      id: '1re-affinard',
      name: 'Affinard',
      description: 'Un renard qui se cache dans une fonction affine : pour le dériver, n’oublie pas le facteur a.',
      skills: ['1re-derivee-composee'],
      look: { shape: 'bete', hue: 15, symbol: 'ax+b' },
    },
    {
      id: '1re-extremoufle',
      name: 'Extrémoufle',
      description: 'Une boule de poils qui dort toujours au sommet d’une bosse ou au fond d’un creux.',
      skills: ['1re-extremum-local', '1re-variations'],
      look: { shape: 'blob', hue: 45, symbol: 'max' },
    },
    {
      id: '1re-optimouette',
      name: 'Optimouette',
      description: 'Une mouette commerçante qui cherche toujours le meilleur bénéfice.',
      skills: ['1re-optimisation', '1re-extremum-local'],
      look: { shape: 'oiseau', hue: 50, symbol: '€' },
    },
  ],
  boss: {
    id: '1re-variatitan',
    name: 'Variatitan',
    description: 'Le gardien de la vallée, fait de roches empilées en montées et descentes.',
    skills: ['1re-points-critiques', '1re-variations', '1re-extremum-local', '1re-derivee-composee', '1re-optimisation'],
    look: { shape: 'golem', hue: 25, symbol: '±' },
  },
};
