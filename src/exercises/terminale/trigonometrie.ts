import { frac } from '../fraction';
import type { Skill } from '../types';
import { choiceTex, fixedChoice, skill } from './util';

/** Chapitre « Fonctions sinus et cosinus » (Terminale spécialité). */

/** kπ/d en LaTeX, réduit. */
export function angleTex(k: number, d: number): string {
  const f = frac(k, d);
  if (f.n === 0) return '0';
  const sign = f.n < 0 ? '-' : '';
  const top = Math.abs(f.n) === 1 ? '\\pi' : `${Math.abs(f.n)}\\pi`;
  return f.d === 1 ? `${sign}${top}` : `${sign}\\frac{${top}}{${f.d}}`;
}

const VALUES: [number, string][] = [
  [0, '0'],
  [0.5, '\\frac{1}{2}'],
  [Math.SQRT2 / 2, '\\frac{\\sqrt{2}}{2}'],
  [Math.sqrt(3) / 2, '\\frac{\\sqrt{3}}{2}'],
  [1, '1'],
];

/** Valeur exacte d'un cosinus ou sinus remarquable. */
export function exact(v: number): string {
  const [, t] = VALUES.reduce((best, cur) => (Math.abs(cur[0] - Math.abs(v)) < Math.abs(best[0] - Math.abs(v)) ? cur : best));
  return v < -1e-9 && t !== '0' ? `-${t}` : t;
}

const ALL_VALUES = VALUES.flatMap(([, t]) => (t === '0' ? [t] : [t, `-${t}`]));

const valeur = skill('tle-trigo-valeurs', 'Connaître les valeurs remarquables', (rng, level) => {
  const d = rng.pick([6, 4, 3, 2]);
  const k = level === 1 ? rng.int(0, d) : rng.int(-2 * d, 2 * d);
  const fn = rng.pick(['\\cos', '\\sin']);
  const theta = (k * Math.PI) / d;
  const v = fn === '\\cos' ? Math.cos(theta) : Math.sin(theta);
  const correct = exact(v);
  const other = exact(fn === '\\cos' ? Math.sin(theta) : Math.cos(theta));
  const opposite = correct === '0' ? '1' : correct.startsWith('-') ? correct.slice(1) : `-${correct}`;
  return {
    prompt: `Quelle est la valeur exacte de $${fn}\\left(${angleTex(k, d)}\\right)$ ?`,
    answer: choiceTex(rng, correct, [other, opposite], () => rng.pick(ALL_VALUES)),
    hint: 'Place l’angle sur le cercle trigonométrique et repère l’angle associé entre $0$ et $\\frac{\\pi}{2}$.',
    correction: [`Sur le cercle trigonométrique, le point associé à $${angleTex(k, d)}$ a pour ${fn === '\\cos' ? 'abscisse' : 'ordonnée'} $${correct}$.`, `$${fn}\\left(${angleTex(k, d)}\\right) = ${correct}$`],
  };
});

const derivee = skill('tle-trigo-derivee', 'Dériver sin(ax) et cos(ax)', (rng, level) => {
  const a = level === 1 ? rng.int(2, 5) : rng.nonZero(-5, 5);
  const fn = rng.pick(['\\cos', '\\sin']);
  const inner = `${a === 1 ? '' : a === -1 ? '-' : a}x`;
  const front = (c: number) => (c === 1 ? '' : c === -1 ? '-' : String(c));
  const other = fn === '\\cos' ? '\\sin' : '\\cos';
  const factor = fn === '\\cos' ? -a : a;
  const correct = `f'(x) = ${front(factor)}${other}(${inner})`;
  return {
    prompt: `$f(x) = ${fn}(${inner})$. Quelle est sa dérivée ?`,
    answer: choiceTex(
      rng,
      correct,
      [`f'(x) = ${front(-factor)}${other}(${inner})`, `f'(x) = ${front(factor / a || 1)}${other}(${inner})`, `f'(x) = ${front(factor)}${fn}(${inner})`, `f'(x) = ${front(-factor)}${fn}(${inner})`],
      () => `f'(x) = ${front(factor + 1)}${other}(${inner})`,
    ),
    hint: '$\\cos\' = -\\sin$, $\\sin\' = \\cos$, et $(f(ax))\' = a f\'(ax)$.',
    correction: [`$${fn}'(X) = ${fn === '\\cos' ? '-\\sin X' : '\\cos X'}$ et la dérivée de $${inner}$ vaut $${a}$.`, `$${correct}$`],
  };
});

const periode = skill('tle-trigo-periode', 'Trouver la période', (rng) => {
  const k = rng.int(2, 6);
  const fn = rng.pick(['\\cos', '\\sin']);
  const correct = angleTex(2, k);
  return {
    prompt: `Quelle est la plus petite période de $f(x) = ${fn}(${k}x)$ ?`,
    answer: choiceTex(rng, correct, ['2\\pi', angleTex(1, k), `${2 * k}\\pi`, angleTex(4, k)], () => angleTex(1, k + 1)),
    hint: `$${fn}$ est $2\\pi$-périodique : cherche $T$ tel que $${k}(x + T) = ${k}x + 2\\pi$.`,
    correction: [`$f(x + T) = ${fn}(${k}x + ${k}T)$ et $${k}T = 2\\pi$ donne $T = ${correct}$.`],
  };
});

const parite = skill('tle-trigo-parite', 'Étudier la parité', (rng) => {
  const cases: [string, number, string][] = [
    ['\\cos(2x)', 0, '$\\cos(-2x) = \\cos(2x)$ : $f$ est paire.'],
    ['x\\sin x', 0, '$(-x)\\sin(-x) = (-x)(-\\sin x) = x\\sin x$ : $f$ est paire.'],
    ['\\sin(3x)', 1, '$\\sin(-3x) = -\\sin(3x)$ : $f$ est impaire.'],
    ['x\\cos x', 1, '$(-x)\\cos(-x) = -x\\cos x$ : $f$ est impaire.'],
    ['\\sin x + \\cos x', 2, '$f(-x) = -\\sin x + \\cos x$, qui n’est égal ni à $f(x)$ ni à $-f(x)$ (prendre $x = \\frac{\\pi}{4}$).'],
    ['\\sin^2 x', 0, '$\\sin^2(-x) = (-\\sin x)^2 = \\sin^2 x$ : $f$ est paire.'],
    ['\\sin x\\cos x', 1, '$\\sin(-x)\\cos(-x) = -\\sin x\\cos x$ : $f$ est impaire.'],
  ];
  const [expr, correct, why] = rng.pick(cases);
  return {
    prompt: `$f(x) = ${expr}$, définie sur $\\mathbb{R}$. Est-elle paire, impaire ou ni l’un ni l’autre ?`,
    answer: fixedChoice(['Paire', 'Impaire', 'Ni paire ni impaire'], correct),
    hint: 'Calcule $f(-x)$ avec $\\cos(-x) = \\cos x$ et $\\sin(-x) = -\\sin x$.',
    correction: [why],
  };
});

const equation = skill('tle-trigo-equation', 'Résoudre une équation trigonométrique', (rng) => {
  const fn = rng.pick(['\\cos', '\\sin']);
  const target = rng.pick([
    { v: '\\frac{1}{2}', c: [1, 3], s: [1, 6] },
    { v: '\\frac{\\sqrt{2}}{2}', c: [1, 4], s: [1, 4] },
    { v: '\\frac{\\sqrt{3}}{2}', c: [1, 6], s: [1, 3] },
    { v: '-\\frac{1}{2}', c: [2, 3], s: [-1, 6] },
  ]);
  const [k, d] = fn === '\\cos' ? target.c : target.s;
  // Sur ]-π ; π] : cos x = cos θ ⟺ x = ±θ ; sin x = sin θ ⟺ x = θ ou x = π - θ.
  const sols = fn === '\\cos' ? [angleTex(-k, d), angleTex(k, d)] : [angleTex(k, d), angleTex(Math.sign(k) * d - k, d)];
  const set = (s: string[]) => `\\left\\{${s.join('\\,;\\,')}\\right\\}`;
  const correct = set(sols);
  const wrong1 = fn === '\\cos' ? set([angleTex(k, d), angleTex(d - k, d)]) : set([angleTex(-k, d), angleTex(k, d)]);
  return {
    prompt: `Résous $${fn} x = ${target.v}$ dans $]-\\pi\\,;\\,\\pi]$.`,
    answer: choiceTex(rng, `S = ${correct}`, [`S = ${wrong1}`, `S = \\left\\{${sols[0]}\\right\\}`, `S = ${set([angleTex(2 * k, d), angleTex(-2 * k, d)])}`], () => `S = \\left\\{${angleTex(k, d)}\\right\\}`),
    hint: 'Trace le cercle trigonométrique : deux points ont la bonne abscisse (cosinus) ou la bonne ordonnée (sinus).',
    correction: [
      `$${fn}\\left(${angleTex(k, d)}\\right) = ${target.v}$.`,
      fn === '\\cos' ? '$\\cos x = \\cos\\theta \\iff x = \\theta$ ou $x = -\\theta$ (modulo $2\\pi$).' : '$\\sin x = \\sin\\theta \\iff x = \\theta$ ou $x = \\pi - \\theta$ (modulo $2\\pi$).',
      `Dans $]-\\pi\\,;\\,\\pi]$ : $S = ${correct}$.`,
    ],
  };
});

const limite = skill('tle-trigo-limite', 'Utiliser la limite de sin(x)/x en 0', (rng, level) => {
  const k = rng.int(2, 9);
  const m = level === 1 ? 1 : rng.int(1, 4);
  const value = frac(k, m);
  return {
    prompt: `Calcule $\\lim_{x \\to 0} \\frac{\\sin(${k}x)}{${m === 1 ? '' : m}x}$.`,
    answer: { kind: 'number', value },
    hint: '$\\lim_{X \\to 0} \\frac{\\sin X}{X} = 1$ : fais apparaître $X = ' + k + 'x$.',
    correction: [
      `$\\frac{\\sin(${k}x)}{${m === 1 ? '' : m}x} = ${m === 1 ? k : `\\frac{${k}}{${m}}`}\\times\\frac{\\sin(${k}x)}{${k}x}$`,
      `Le second facteur tend vers $1$, donc la limite vaut $${m === 1 ? k : `\\frac{${k}}{${m}}`}$${value.d === m ? '' : `, soit $${value.d === 1 ? value.n : `\\frac{${value.n}}{${value.d}}`}$`}.`,
    ],
  };
});

export const TRIGONOMETRIE_SKILLS: Skill[] = [valeur, derivee, periode, parite, equation, limite];
