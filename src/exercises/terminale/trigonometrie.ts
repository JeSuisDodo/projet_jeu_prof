import { frac } from '../fraction';
import type { Rng } from '../rng';
import type { Skill } from '../types';
import { enrich, variant } from '../variantes';
import { F, choiceTex, fixedChoice, num, numF, par, skill, tex } from './util';

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

const VF = ['Vrai', 'Faux'];
const front = (c: number) => (c === 1 ? '' : c === -1 ? '-' : String(c));
const kx = (k: number) => `${front(k)}x`;

const TAN: [number, string][] = [
  [0, '0'],
  [Math.sqrt(3) / 3, '\\frac{\\sqrt{3}}{3}'],
  [1, '1'],
  [Math.sqrt(3), '\\sqrt{3}'],
];
const tanExact = (v: number) => {
  const [, t] = TAN.reduce((best, cur) => (Math.abs(cur[0] - Math.abs(v)) < Math.abs(best[0] - Math.abs(v)) ? cur : best));
  return v < -1e-9 && t !== '0' ? `-${t}` : t;
};

const valeurVariantes = [
  variant('tangente', (rng) => {
    for (;;) {
      const d = rng.pick([6, 4, 3]);
      const k = rng.int(-d, d);
      const theta = (k * Math.PI) / d;
      if (Math.abs(Math.cos(theta)) < 1e-9) continue;
      const correct = tanExact(Math.tan(theta));
      const inverse = tanExact(1 / Math.tan(theta || 1));
      return {
        prompt: `Sachant que $\\tan x = \\frac{\\sin x}{\\cos x}$, quelle est la valeur exacte de $\\tan\\left(${angleTex(k, d)}\\right)$ ?`,
        answer: choiceTex(rng, correct, [inverse, correct === '0' ? '1' : correct.startsWith('-') ? correct.slice(1) : `-${correct}`, exact(Math.sin(theta))], () => rng.pick(TAN.map(([, t]) => t))),
        hint: 'Calcule le sinus et le cosinus de l’angle, puis leur quotient.',
        correction: [`$\\sin\\left(${angleTex(k, d)}\\right) = ${exact(Math.sin(theta))}$ et $\\cos\\left(${angleTex(k, d)}\\right) = ${exact(Math.cos(theta))}$.`, `$\\tan\\left(${angleTex(k, d)}\\right) = ${correct}$`],
      };
    }
  }),
  variant('retrouver-angle', (rng) => {
    const k = rng.int(0, 6);
    const theta = (k * Math.PI) / 6;
    const fn = rng.pick(['\\cos', '\\sin']);
    // Pour le sinus, on reste sur [-π/2 ; π/2] où il est bijectif.
    const angle = fn === '\\cos' ? angleTex(k, 6) : angleTex(k - 3, 6);
    const v = fn === '\\cos' ? exact(Math.cos(theta)) : exact(Math.sin(((k - 3) * Math.PI) / 6));
    const intervalle = fn === '\\cos' ? '[0\\,;\\,\\pi]' : '\\left[-\\frac{\\pi}{2}\\,;\\,\\frac{\\pi}{2}\\right]';
    const decoys = fn === '\\cos' ? [angleTex(6 - k, 6), angleTex(-k, 6), angleTex(3 - k, 6)] : [angleTex(3 - k, 6), angleTex(6 - k, 6), angleTex(k, 6)];
    return {
      prompt: `Quel réel $x$ de $${intervalle}$ vérifie $${fn} x = ${v}$ ?`,
      answer: choiceTex(rng, angle, decoys, () => angleTex(rng.int(-6, 6), 6)),
      hint: 'Sur cet intervalle, il n’y a qu’un seul point du cercle trigonométrique qui convient.',
      correction: [`$${fn}\\left(${angle}\\right) = ${v}$ et $${angle}$ est bien dans $${intervalle}$.`],
    };
  }),
];

const deriveeVariantes = [
  variant('valeur', (rng) => {
    const a = rng.nonZero(-4, 4);
    const b = rng.int(1, 4);
    const c = rng.nonZero(-5, 5);
    const value = a * b * (b % 2 === 0 ? 1 : -1);
    return {
      prompt: `$f(x) = ${front(a)}\\sin(${kx(b)}) ${c < 0 ? '-' : '+'} ${front(Math.abs(c))}\\cos(x)$. Calcule $f'(\\pi)$.`,
      answer: num(value),
      hint: '$(\\sin(bx))\' = b\\cos(bx)$ et $\\cos\' = -\\sin$ ; puis $\\sin\\pi = 0$ et $\\cos(b\\pi) = (-1)^b$.',
      correction: [`$f'(x) = ${a * b}\\cos(${kx(b)}) ${c < 0 ? '+' : '-'} ${front(Math.abs(c))}\\sin(x)$`, `$f'(\\pi) = ${a * b}\\times (${b % 2 === 0 ? 1 : -1}) - ${c < 0 ? `(${c})` : c}\\times 0 = ${value}$`],
    };
  }),
  variant('produit', (rng) => {
    const a = rng.nonZero(-5, 5);
    const b = rng.nonZero(-5, 5);
    const enZero = rng.next() < 0.5;
    const u = `${front(a)}x ${b < 0 ? '-' : '+'} ${Math.abs(b)}`;
    return {
      prompt: `$f(x) = (${u})\\sin(x)$. Calcule $f'\\left(${enZero ? '0' : '\\frac{\\pi}{2}'}\\right)$.`,
      answer: num(enZero ? b : a),
      hint: '$(uv)\' = u\'v + uv\'$ avec $\\sin\' = \\cos$.',
      correction: [`$f'(x) = ${front(a)}\\sin(x) + (${u})\\cos(x)$`, enZero ? `$f'(0) = 0 + ${par(b)}\\times 1 = ${b}$` : `$f'\\left(\\frac{\\pi}{2}\\right) = ${a}\\times 1 + \\ldots\\times 0 = ${a}$`],
    };
  }),
];

const periodeVariantes = [
  variant('fraction', (rng) => {
    const k = rng.int(2, 5);
    const fn = rng.pick(['\\cos', '\\sin']);
    const correct = `${2 * k}\\pi`;
    return {
      prompt: `Quelle est la plus petite période de $f(x) = ${fn}\\left(\\frac{x}{${k}}\\right)$ ?`,
      answer: choiceTex(rng, correct, ['2\\pi', angleTex(2, k), `${k}\\pi`, angleTex(1, k)], () => `${4 * k}\\pi`),
      hint: `Cherche $T$ tel que $\\frac{x + T}{${k}} = \\frac{x}{${k}} + 2\\pi$.`,
      correction: [`$\\frac{T}{${k}} = 2\\pi$ donne $T = ${correct}$.`],
    };
  }),
  variant('vrai-faux', (rng) => {
    const k = rng.int(2, 6);
    const fn = rng.pick(['\\cos', '\\sin']);
    const m = rng.pick([1, 2, 3]);
    const ok = rng.next() < 0.5;
    // Vrai : un multiple de 2π/k ; faux : π/k (demi-période), qui n'est jamais une période de sin(kx) ou cos(kx).
    const T = ok ? angleTex(2 * m, k) : angleTex(1, k);
    return {
      prompt: `Vrai ou faux : $${T}$ est une période de $f(x) = ${fn}(${k}x)$.`,
      answer: fixedChoice(VF, ok ? 0 : 1),
      hint: `Les périodes de $f$ sont les multiples de $\\frac{2\\pi}{${k}}$.`,
      correction: [ok ? `$${T} = ${m}\\times\\frac{2\\pi}{${k}}$ : c’est vrai.` : `$f(x + ${T}) = ${fn}(${k}x + \\pi) = -${fn}(${k}x)$ : c’est faux.`],
    };
  }),
];

/** Fonction somme de deux termes de parité connue : 0 paire, 1 impaire, 2 ni l'un ni l'autre. */
function combinaison(rng: Rng) {
  const k = rng.int(2, 4);
  const paires = ['\\cos(x)', `\\cos(${k}x)`, 'x^2', `x\\sin(${k}x)`, '1'];
  const impaires = ['\\sin(x)', `\\sin(${k}x)`, 'x', 'x^3', `x\\cos(${k}x)`];
  const type = rng.int(0, 2);
  const [t1, t2] = type === 0 ? rng.shuffle([...paires]).slice(0, 2) : type === 1 ? rng.shuffle([...impaires]).slice(0, 2) : rng.shuffle([rng.pick(paires), rng.pick(impaires)]);
  const c = rng.nonZero(-4, 4);
  const terme = t2 === '1' ? `${c < 0 ? '-' : '+'} ${Math.abs(c)}` : `${c < 0 ? '-' : '+'} ${front(Math.abs(c))}${t2}`;
  const debut = t1 === '1' ? String(rng.int(2, 5)) : t1;
  return { expr: `${debut} ${terme}`, type };
}

const pariteVariantes = [
  variant('combinaison', (rng) => {
    const { expr, type } = combinaison(rng);
    return {
      prompt: `$f(x) = ${expr}$, définie sur $\\mathbb{R}$. Est-elle paire, impaire ou ni l’un ni l’autre ?`,
      answer: fixedChoice(['Paire', 'Impaire', 'Ni paire ni impaire'], type),
      hint: 'Repère la parité de chaque terme : $\\cos$, $x^2$ et les constantes sont paires ; $\\sin$, $x$ et $x^3$ sont impaires.',
      correction: [['Les deux termes sont pairs : $f$ est paire.', 'Les deux termes sont impairs : $f$ est impaire.', 'Un terme pair et un terme impair non nul : $f$ n’est ni paire ni impaire.'][type]],
    };
  }),
  variant('symetrie', (rng) => {
    const { expr, type } = combinaison(rng);
    return {
      prompt: `$f(x) = ${expr}$. Par rapport à quoi la courbe de $f$ est-elle symétrique ?`,
      answer: fixedChoice(['L’axe des ordonnées', 'L’origine du repère', 'Ni l’un ni l’autre'], type),
      hint: 'Courbe symétrique par rapport à l’axe des ordonnées : $f$ paire ; par rapport à l’origine : $f$ impaire.',
      correction: [['$f(-x) = f(x)$ : $f$ est paire, symétrie par rapport à l’axe des ordonnées.', '$f(-x) = -f(x)$ : $f$ est impaire, symétrie par rapport à l’origine.', '$f$ n’est ni paire ni impaire : pas de symétrie de ce type.'][type]],
    };
  }),
];

const equationVariantes = [
  variant('nombre-solutions', (rng) => {
    const fn = rng.pick(['\\cos', '\\sin']);
    const [v, nb] = rng.pick([['0', 2], ['1', 1], ['-1', 1], ['\\frac{1}{2}', 2], ['-\\frac{\\sqrt{3}}{2}', 2], ['\\frac{3}{2}', 0], ['-2', 0]] as [string, number][]);
    const tours = rng.pick([1, 2]);
    const count = nb * tours;
    return {
      prompt: `Combien l’équation $${fn} x = ${v}$ a-t-elle de solutions dans $[0\\,;\\,${2 * tours}\\pi[$ ?`,
      answer: num(count),
      hint: 'Sur un tour de cercle, une droite horizontale (sinus) ou verticale (cosinus) coupe le cercle en 0, 1 ou 2 points.',
      correction: [nb === 0 ? `$${fn}$ prend ses valeurs dans $[-1\\,;\\,1]$ : aucune solution.` : `Sur un tour, $${nb}$ solution${nb > 1 ? 's' : ''} ; sur $${tours}$ tour${tours > 1 ? 's' : ''}, $${count}$.`],
    };
  }),
  variant('angle-multiple', (rng) => {
    const k = rng.int(1, 4);
    const fn = rng.pick(['\\cos', '\\sin']);
    return {
      prompt: `Combien l’équation $${fn}(${kx(k)}) = 0$ a-t-elle de solutions dans $[0\\,;\\,2\\pi[$ ?`,
      answer: num(2 * k),
      hint: `Pose $X = ${kx(k)}$ : quand $x$ parcourt $[0\\,;\\,2\\pi[$, $X$ parcourt $[0\\,;\\,${2 * k}\\pi[$.`,
      correction: [`$${fn} X = 0$ a deux solutions par tour, et $X$ fait $${k}$ tour${k > 1 ? 's' : ''} : $${2 * k}$ solutions.`],
    };
  }),
];

const limiteVariantes = [
  variant('quotient-sinus', (rng) => {
    const a = rng.int(1, 9);
    let b = rng.int(2, 9);
    if (b === a) b++;
    const value = F(a, b);
    return {
      prompt: `Calcule $\\lim_{x \\to 0} \\frac{\\sin(${kx(a)})}{\\sin(${b}x)}$ (fraction).`,
      answer: numF(value),
      hint: 'Écris le quotient comme $\\frac{\\sin(ax)}{ax}\\times\\frac{bx}{\\sin(bx)}\\times\\frac{a}{b}$.',
      correction: [`Les deux premiers facteurs tendent vers $1$ : la limite vaut $${tex(value)}$.`],
    };
  }),
  variant('inverse', (rng) => {
    const m = rng.nonZero(-5, 5);
    const k = rng.int(2, 9);
    const value = F(m, k);
    return {
      prompt: `Calcule $\\lim_{x \\to 0} \\frac{${front(m)}x}{\\sin(${k}x)}$ (fraction).`,
      answer: numF(value),
      hint: '$\\frac{x}{\\sin(kx)} = \\frac{1}{k}\\times\\frac{kx}{\\sin(kx)}$.',
      correction: [`$\\frac{${front(m)}x}{\\sin(${k}x)} = \\frac{${m}}{${k}}\\times\\frac{${k}x}{\\sin(${k}x)}$, et le second facteur tend vers $1$.`, `Limite : $${tex(value)}$.`],
    };
  }),
];

export const TRIGONOMETRIE_SKILLS: Skill[] = [
  enrich(valeur, valeurVariantes),
  enrich(derivee, deriveeVariantes),
  enrich(periode, periodeVariantes),
  enrich(parite, pariteVariantes),
  enrich(equation, equationVariantes),
  enrich(limite, limiteVariantes),
];
