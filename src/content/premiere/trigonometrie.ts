import { frac, fracLatex } from '../../exercises/fraction';
import { sumLatex } from '../../exercises/latex';
import type { Rng } from '../../exercises/rng';
import { type Answer, type Skill, makeChoice } from '../../exercises/types';
import { enrich, variant } from '../../exercises/variantes';
import type { ChapterDef } from '../types';

/** 1re spécialité, chapitre « Trigonométrie » : radian, cercle trigonométrique, cosinus et sinus. */

/** Le réel (n/d)π en LaTeX, fraction réduite : π/3 donne « \frac{\pi}{3} », -4π/2 donne « -2\pi ». */
export function piTex(n: number, d = 1): string {
  const f = frac(n, d);
  if (f.n === 0) return '0';
  const sign = f.n < 0 ? '-' : '';
  const num = Math.abs(f.n) === 1 ? '\\pi' : `${Math.abs(f.n)}\\pi`;
  return f.d === 1 ? `${sign}${num}` : `${sign}\\frac{${num}}{${f.d}}`;
}

const EXACT: [number, string][] = [
  [0, '0'],
  [0.5, '\\frac{1}{2}'],
  [Math.SQRT2 / 2, '\\frac{\\sqrt{2}}{2}'],
  [Math.sqrt(3) / 2, '\\frac{\\sqrt{3}}{2}'],
  [1, '1'],
];

/** Valeur exacte (remarquable) d'un réel calculé en flottant. */
export function exactTex(v: number): string {
  const [, tex] = EXACT.find(([x]) => Math.abs(Math.abs(v) - x) < 1e-9) ?? [0, '?'];
  return tex === '0' || v > 0 ? tex : `-${tex}`;
}

/** Les angles remarquables de [0 ; 2π[ en douzièmes de π : multiples de π/6 et de π/4. */
const TWELFTHS = Array.from({ length: 24 }, (_, k) => k).filter((k) => k % 2 === 0 || k % 3 === 0);

const rad = (twelfths: number) => (twelfths * Math.PI) / 12;
const trig = (fn: 'cos' | 'sin', twelfths: number) => (fn === 'cos' ? Math.cos : Math.sin)(rad(twelfths));

const conversion: Skill = {
  id: '1re-trigo-conversion',
  name: 'Convertir entre degrés et radians',
  generate(rng, level) {
    const pool = level === 1 ? [2, 3, 4, 6, 12] : level === 2 ? [2, 3, 4, 6, 8, 9, 10, 12] : TWELFTHS.filter((k) => k > 0);
    const k = rng.pick(pool);
    const deg = k * 15;
    const angle = piTex(k, 12);
    if (level === 1 || (level === 3 && rng.next() < 0.5)) {
      return {
        skill: this.id,
        level,
        prompt: `Convertis $${angle}$ radians en degrés.`,
        answer: { kind: 'number', value: frac(deg) },
        hint: '$\\pi$ radians correspondent à $180°$.',
        correction: [k === 12 ? '$\\pi$ radians correspondent à $180°$.' : `$${angle} = ${fracLatex(frac(k, 12))} \\times \\pi$, donc l'angle mesure $${fracLatex(frac(k, 12))} \\times 180° = ${deg}°$.`],
      };
    }
    const f = frac(k, 12);
    const decoys = [piTex(f.d, f.n), piTex(f.n, 2 * f.d), piTex(f.n + 1, f.d), piTex(2 * f.n, f.d)];
    return {
      skill: this.id,
      level,
      prompt: `Convertis $${deg}°$ en radians.`,
      answer: makeChoice(rng, `$${angle}$`, decoys.map((d) => `$${d}$`), () => `$${piTex(rng.int(1, 11), 6)}$`),
      hint: 'Multiplie par $\\frac{\\pi}{180}$, puis simplifie la fraction.',
      correction: [`$${deg} \\times \\frac{\\pi}{180} = ${angle}$`],
    };
  },
};

const valeurs: Skill = {
  id: '1re-trigo-valeurs',
  name: 'Connaître les valeurs remarquables',
  generate(rng, level) {
    const fn = rng.pick(['cos', 'sin'] as const);
    const pool = level === 1 ? TWELFTHS.filter((k) => k <= 6) : level === 2 ? TWELFTHS.filter((k) => k <= 12) : TWELFTHS.map((k) => (k > 12 ? k - 24 : k));
    const k = rng.pick(pool);
    const v = trig(fn, k);
    const good = exactTex(v);
    const other = exactTex(trig(fn === 'cos' ? 'sin' : 'cos', k));
    const decoys = [exactTex(-v), other, exactTex(-trig(fn === 'cos' ? 'sin' : 'cos', k))];
    return {
      skill: this.id,
      level,
      prompt: `Quelle est la valeur exacte de $\\${fn}\\left(${piTex(k, 12)}\\right)$ ?`,
      answer: makeChoice(rng, `$${good}$`, decoys.map((d) => `$${d}$`), () => `$${exactTex(rng.pick([-1, 1]) * rng.pick(EXACT)[0])}$`),
      hint: 'Place le point sur le cercle trigonométrique : le cosinus est l’abscisse, le sinus l’ordonnée.',
      correction: [`Le point associé à $${piTex(k, 12)}$ a pour coordonnées $\\left(${exactTex(trig('cos', k))}\\,;\\,${exactTex(trig('sin', k))}\\right)$.`, `Donc $\\${fn}\\left(${piTex(k, 12)}\\right) = ${good}$.`],
    };
  },
};

/** Angles associés : f(arg) = cc·cos x + ss·sin x. */
const ASSOCIES: { fn: 'cos' | 'sin'; arg: string; cc: number; ss: number; level: number }[] = [
  { fn: 'cos', arg: '-x', cc: 1, ss: 0, level: 1 },
  { fn: 'sin', arg: '-x', cc: 0, ss: -1, level: 1 },
  { fn: 'cos', arg: '\\pi - x', cc: -1, ss: 0, level: 1 },
  { fn: 'sin', arg: '\\pi - x', cc: 0, ss: 1, level: 1 },
  { fn: 'cos', arg: '\\pi + x', cc: -1, ss: 0, level: 1 },
  { fn: 'sin', arg: '\\pi + x', cc: 0, ss: -1, level: 1 },
  { fn: 'cos', arg: '\\frac{\\pi}{2} - x', cc: 0, ss: 1, level: 2 },
  { fn: 'sin', arg: '\\frac{\\pi}{2} - x', cc: 1, ss: 0, level: 2 },
  { fn: 'cos', arg: '\\frac{\\pi}{2} + x', cc: 0, ss: -1, level: 2 },
  { fn: 'sin', arg: '\\frac{\\pi}{2} + x', cc: 1, ss: 0, level: 2 },
];

const combo = (cc: number, ss: number) => sumLatex([[cc, '\\cos x'], [ss, '\\sin x']]);

const associes: Skill = {
  id: '1re-trigo-associes',
  name: 'Utiliser les angles associés',
  generate(rng, level) {
    const pool = ASSOCIES.filter((a) => a.level <= Math.min(level, 2));
    const terms = level === 3 ? rng.shuffle(pool).slice(0, 2) : [rng.pick(pool)];
    const cc = terms.reduce((s, t) => s + t.cc, 0);
    const ss = terms.reduce((s, t) => s + t.ss, 0);
    const expr = terms.map((t) => `\\${t.fn}\\left(${t.arg}\\right)`).join(' + ');
    const good = combo(cc, ss);
    const decoys = level === 3 ? [combo(-cc, ss), combo(cc, -ss), combo(-cc, -ss), combo(ss, cc)] : [combo(-cc, -ss), combo(ss, cc), combo(-ss, -cc)];
    return {
      skill: this.id,
      level,
      prompt: `Simplifie, pour tout réel $x$ : $${expr}$.`,
      answer: makeChoice(rng, `$${good}$`, decoys.map((d) => `$${d}$`), () => `$${combo(rng.int(-2, 2), rng.int(-2, 2))}$`),
      hint: 'Place $x$ puis l’angle associé sur le cercle trigonométrique, et compare leurs coordonnées.',
      correction: [...terms.map((t) => `$\\${t.fn}\\left(${t.arg}\\right) = ${combo(t.cc, t.ss)}$`), ...(terms.length > 1 ? [`Donc $${expr} = ${good}$.`] : [])],
    };
  },
};

const principale: Skill = {
  id: '1re-trigo-mesure-principale',
  name: 'Trouver la mesure principale',
  generate(rng, level) {
    // Mesure principale (m/d)π dans ]-π ; π], angle donné = (m/d)π + 2tπ.
    const d = rng.pick([2, 3, 4, 6]);
    const ms = Array.from({ length: 2 * d - 1 }, (_, i) => i - d + 1).filter((m) => m !== 0 && frac(m, d).d === d);
    const m = rng.pick(ms);
    const t = level === 1 ? 1 : (rng.next() < 0.5 ? -1 : 1) * rng.int(level === 2 ? 1 : 2, level === 2 ? 3 : 6);
    const n = m + 2 * t * d;
    const good = piTex(m, d);
    const decoys = [piTex(-m, d), piTex(m < 0 ? m + 2 * d : m - 2 * d, d), piTex(m > 0 ? m - d : m + d, d)];
    return {
      skill: this.id,
      level,
      prompt: `Quelle est la mesure principale (dans $]-\\pi\\,;\\,\\pi]$) de l'angle $${piTex(n, d)}$ ?`,
      answer: makeChoice(rng, `$${good}$`, decoys.map((x) => `$${x}$`), () => `$${piTex(rng.int(-5, 5), 6)}$`),
      hint: 'Ajoute ou retire des tours complets ($2\\pi$) jusqu’à tomber dans $]-\\pi\\,;\\,\\pi]$.',
      correction: [`$${piTex(n, d)} = ${good} ${t > 0 ? '+' : '-'} ${piTex(2 * Math.abs(t))}$, soit $${Math.abs(t)}$ tour${Math.abs(t) > 1 ? 's' : ''} complet${Math.abs(t) > 1 ? 's' : ''}.`, `La mesure principale est $${good}$.`],
    };
  },
};

const VALUES = [0, 0.5, Math.SQRT2 / 2, Math.sqrt(3) / 2, 1];

/** Solutions de fn(x) = v parmi les douzièmes de π de l'intervalle [start ; start + 24[. */
function solve(fn: 'cos' | 'sin', v: number, start: number): number[] {
  const out: number[] = [];
  for (let k = start; k < start + 24; k++) if (Math.abs(trig(fn, k) - v) < 1e-9) out.push(k);
  return out;
}

const setTex = (ks: number[]) => (ks.length ? `$S = \\left\\{${[...ks].sort((a, b) => a - b).map((k) => piTex(k, 12)).join('\\,;\\,')}\\right\\}$` : '$S = \\varnothing$');

const equation: Skill = {
  id: '1re-trigo-equation',
  name: 'Résoudre cos x = a ou sin x = a',
  generate(rng: Rng, level) {
    const fn = level === 1 ? 'cos' : rng.pick(['cos', 'sin'] as const);
    const v = (level === 1 ? 1 : rng.pick([-1, 1])) * rng.pick(VALUES);
    // Niveau 3 : intervalle ]-π ; π], soit les douzièmes de -11 à 12.
    const start = level === 3 ? -11 : 0;
    const interval = level === 3 ? ']-\\pi\\,;\\,\\pi]' : '[0\\,;\\,2\\pi[';
    const sols = solve(fn, v, start);
    const other = fn === 'cos' ? 'sin' : 'cos';
    const decoys = [setTex(solve(other, v, start)), setTex(solve(fn, -v, start)), setTex(sols.slice(0, 1)), setTex(sols.map((k) => -k))];
    return {
      skill: this.id,
      level,
      prompt: `Résous dans $${interval}$ l'équation $\\${fn} x = ${exactTex(v)}$.`,
      answer: makeChoice(rng, setTex(sols), decoys, () => setTex([rng.pick(TWELFTHS)])),
      hint: fn === 'cos' ? 'Trace la droite verticale d’abscisse donnée : elle coupe le cercle en (au plus) deux points.' : 'Trace la droite horizontale d’ordonnée donnée : elle coupe le cercle en (au plus) deux points.',
      correction: [
        `Sur le cercle trigonométrique, les points ${fn === 'cos' ? 'd’abscisse' : 'd’ordonnée'} $${exactTex(v)}$ correspondent, dans $${interval}$, à : ${sols.map((k) => `$${piTex(k, 12)}$`).join(' et ')}.`,
        setTex(sols),
      ],
    };
  },
};

/** Facteurs de base et leur parité (1 : paire, -1 : impaire). */
const FACTORS: [string, number][] = [
  ['x', -1],
  ['x^2', 1],
  ['x^3', -1],
  ['\\cos x', 1],
  ['\\sin x', -1],
];
const PARITY = ['Paire', 'Impaire', 'Ni paire ni impaire'];
const parityIndex = (p: number) => (p === 1 ? 0 : p === -1 ? 1 : 2);

function product(rng: Rng, n: number): [string, number] {
  // Un polynôme au plus, placé en tête, suivi de fonctions trigonométriques distinctes.
  const poly = rng.shuffle(FACTORS.slice(0, 3)).slice(0, 1);
  const trigs = FACTORS.slice(3);
  const picked = n === 1 ? [rng.pick(FACTORS)] : [poly[0], rng.pick(trigs)];
  return [picked.map(([t]) => t).join(''), picked.reduce((s, [, p]) => s * p, 1)];
}

const parite: Skill = {
  id: '1re-trigo-parite',
  name: 'Étudier la parité d’une fonction',
  generate(rng, level) {
    const c = rng.nonZero(-5, 5);
    const [t1, p1] = product(rng, level === 1 ? 1 : 2);
    let expr = sumLatex([[c, t1]]);
    let parity = p1;
    const lines = [`$x \\mapsto ${t1}$ est ${p1 === 1 ? 'paire' : 'impaire'} (on remplace $x$ par $-x$ et on utilise $\\cos(-x) = \\cos x$, $\\sin(-x) = -\\sin x$).`];
    if (level === 3) {
      const c2 = rng.nonZero(-5, 5);
      let t2: string;
      let p2: number;
      do [t2, p2] = product(rng, rng.pick([1, 2])); while (t2 === t1);
      expr = sumLatex([[c, t1], [c2, t2]]);
      parity = p1 === p2 ? p1 : 0;
      lines.push(`$x \\mapsto ${t2}$ est ${p2 === 1 ? 'paire' : 'impaire'}.`);
      lines.push(p1 === p2 ? `Somme de deux fonctions ${p1 === 1 ? 'paires' : 'impaires'} : $f$ est ${p1 === 1 ? 'paire' : 'impaire'}.` : `Une partie paire et une partie impaire non nulles : $f$ n'est ni paire ni impaire (par exemple $f(-x) \\neq f(x)$ et $f(-x) \\neq -f(x)$ en général).`);
    } else {
      lines.push(`Donc $f(-x) = ${parity === 1 ? 'f(x)' : '-f(x)'}$ : $f$ est ${parity === 1 ? 'paire' : 'impaire'}.`);
    }
    return {
      skill: this.id,
      level,
      prompt: `Soit $f$ la fonction définie sur $\\mathbb{R}$ par $f(x) = ${expr}$. Quelle est sa parité ?`,
      answer: { kind: 'choice', options: PARITY, correct: parityIndex(parity) },
      hint: 'Calcule $f(-x)$ et compare avec $f(x)$ et $-f(x)$.',
      correction: lines,
    };
  },
};

const vraiFaux = (b: boolean): Answer => ({ kind: 'choice', options: ['Vrai', 'Faux'], correct: b ? 0 : 1 });
/** Triplets pythagoriciens : cos x = a/c et sin x = b/c. */
const TRIPLETS: [number, number, number][] = [
  [3, 4, 5],
  [4, 3, 5],
  [5, 12, 13],
  [12, 5, 13],
  [8, 15, 17],
];

const conversionVariantes = [
  variant('longueur-arc', (rng) => {
    const R = rng.int(2, 9);
    const L = rng.int(1, 20);
    const value = frac(L, R);
    return {
      prompt: `Sur un cercle de rayon $${R}$ cm, un arc mesure $${L}$ cm. Quelle est, en radians, la mesure de l'angle au centre qui l'intercepte ? (Fraction.)`,
      answer: { kind: 'number', value },
      hint: 'Un angle de $\\theta$ radians intercepte un arc de longueur $R\\theta$.',
      correction: [`$\\theta = \\frac{L}{R} = \\frac{${L}}{${R}}${value.d !== R ? ` = ${fracLatex(value)}` : ''}$ rad`],
    };
  }),
  variant('horloge', (rng) => {
    const t = 5 * rng.int(1, 11);
    const good = piTex(t, 30);
    return {
      prompt: `En $${t}$ minutes, de quel angle (en radians) tourne la grande aiguille d'une horloge ?`,
      answer: makeChoice(rng, `$${good}$`, [piTex(t, 60), piTex(t, 15), piTex(t, 180), piTex(t, 6)].map((d) => `$${d}$`), () => `$${piTex(t + 5, 30)}$`),
      hint: 'En $60$ minutes, la grande aiguille fait un tour complet, soit $2\\pi$ radians.',
      correction: [`$\\frac{${t}}{60} \\times 2\\pi = ${good}$`],
    };
  }),
];

const valeursVariantes = [
  variant('sinus-carre', (rng) => {
    const [a, b, c] = rng.pick(TRIPLETS);
    const fn = rng.pick(['cos', 'sin'] as const);
    const [given, other] = fn === 'cos' ? [a, b] : [b, a];
    const value = frac(other * other, c * c);
    const autre = fn === 'cos' ? 'sin' : 'cos';
    return {
      prompt: `On sait que $\\${fn} x = \\frac{${given}}{${c}}$. Calcule $\\${autre}^2 x$ (fraction).`,
      answer: { kind: 'number', value },
      hint: 'Pour tout réel $x$, $\\cos^2 x + \\sin^2 x = 1$.',
      correction: [`$\\${autre}^2 x = 1 - \\left(\\frac{${given}}{${c}}\\right)^2 = 1 - \\frac{${given * given}}{${c * c}} = ${fracLatex(value)}$`],
    };
  }),
  variant('vrai-faux', (rng, level) => {
    const fn = rng.pick(['cos', 'sin'] as const);
    const pool = level === 1 ? TWELFTHS.filter((k) => k <= 6) : TWELFTHS.filter((k) => k <= 12);
    const k = rng.pick(pool);
    const v = trig(fn, k);
    const shown = rng.next() < 0.5 ? v : rng.pick([-v, trig(fn === 'cos' ? 'sin' : 'cos', k)]);
    const ok = Math.abs(shown - v) < 1e-9;
    return {
      prompt: `Vrai ou faux : $\\${fn}\\left(${piTex(k, 12)}\\right) = ${exactTex(shown)}$.`,
      answer: vraiFaux(ok),
      hint: 'Place le point sur le cercle trigonométrique.',
      correction: [`$\\${fn}\\left(${piTex(k, 12)}\\right) = ${exactTex(v)}$ : c'est ${ok ? 'vrai' : 'faux'}.`],
    };
  }),
];

const associesVariantes = [
  variant('valeur', (rng, level) => {
    const [a, b, c] = rng.pick(TRIPLETS);
    const t = rng.pick(ASSOCIES.filter((x) => x.level <= Math.min(level, 2)));
    const value = frac(t.cc * a + t.ss * b, c);
    return {
      prompt: `On sait que $\\cos x = \\frac{${a}}{${c}}$ et $\\sin x = \\frac{${b}}{${c}}$. Que vaut $\\${t.fn}\\left(${t.arg}\\right)$ ? (Fraction.)`,
      answer: { kind: 'number', value },
      hint: 'Utilise les formules des angles associés.',
      correction: [`$\\${t.fn}\\left(${t.arg}\\right) = ${combo(t.cc, t.ss)} = ${fracLatex(value)}$`],
    };
  }),
  variant('vrai-faux', (rng, level) => {
    const t = rng.pick(ASSOCIES.filter((x) => x.level <= Math.min(level, 2)));
    const ok = rng.next() < 0.5;
    const [cc, ss] = ok ? [t.cc, t.ss] : rng.pick([[-t.cc, -t.ss], [t.ss, t.cc], [-t.ss, -t.cc]].filter(([p, q]) => p !== t.cc || q !== t.ss)) ?? [-t.cc, -t.ss];
    const good = cc === t.cc && ss === t.ss;
    return {
      prompt: `Vrai ou faux : pour tout réel $x$, $\\${t.fn}\\left(${t.arg}\\right) = ${combo(cc, ss)}$.`,
      answer: vraiFaux(good),
      hint: 'Place $x$ et l’angle associé sur le cercle trigonométrique.',
      correction: [`$\\${t.fn}\\left(${t.arg}\\right) = ${combo(t.cc, t.ss)}$ : c'est ${good ? 'vrai' : 'faux'}.`],
    };
  }),
];

const principaleVariantes = [
  variant('degres', (rng) => {
    const m = rng.int(-179, 180);
    const t = rng.nonZero(-3, 3);
    return {
      prompt: `Quelle est la mesure principale, en degrés (dans $]-180\\,;\\,180]$), d'un angle de $${m + 360 * t}°$ ?`,
      answer: { kind: 'number', value: frac(m) },
      hint: 'Ajoute ou retire des tours complets de $360°$.',
      correction: [`$${m + 360 * t} ${t > 0 ? '-' : '+'} ${360 * Math.abs(t)} = ${m}$, donc la mesure principale est $${m}°$.`],
    };
  }),
  variant('meme-point', (rng) => {
    const d = rng.pick([2, 3, 4, 6]);
    const m = rng.int(-d + 1, d);
    const t = rng.nonZero(-3, 3);
    const ok = rng.next() < 0.5;
    const n2 = m + (ok ? 2 * t * d : (2 * t + 1) * d);
    return {
      prompt: `Vrai ou faux : les réels $${piTex(m, d)}$ et $${piTex(n2, d)}$ repèrent le même point du cercle trigonométrique.`,
      answer: vraiFaux(ok),
      hint: 'Deux réels repèrent le même point quand leur différence est un multiple de $2\\pi$.',
      correction: [`$${piTex(n2, d)} - ${m < 0 ? `\\left(${piTex(m, d)}\\right)` : piTex(m, d)} = ${piTex(n2 - m, d)}$, ${ok ? `soit $${t}$ tour${Math.abs(t) > 1 ? 's' : ''} : c'est vrai` : `qui n'est pas un multiple de $2\\pi$ : c'est faux`}.`],
    };
  }),
];

const equationVariantes = [
  variant('nombre-solutions', (rng) => {
    const fn = rng.pick(['cos', 'sin'] as const);
    const [v, tex] = rng.pick([...VALUES.map((x) => [x, exactTex(x)]), ...VALUES.map((x) => [-x, exactTex(-x)]), [1.5, '\\frac{3}{2}'], [-2, '-2'], [Math.SQRT2, '\\sqrt{2}']] as [number, string][]);
    const n = solve(fn, v, 0).length;
    return {
      prompt: `Combien de solutions l'équation $\\${fn} x = ${tex}$ a-t-elle dans $[0\\,;\\,2\\pi[$ ?`,
      answer: { kind: 'number', value: frac(n) },
      hint: `${fn === 'cos' ? 'Le cosinus' : 'Le sinus'} est compris entre $-1$ et $1$ ; trace la droite ${fn === 'cos' ? 'verticale' : 'horizontale'} correspondante.`,
      correction: [Math.abs(v) > 1 ? `$${tex}$ n'est pas dans $[-1\\,;\\,1]$ : aucune solution.` : `Solutions : ${solve(fn, v, 0).map((k) => `$${piTex(k, 12)}$`).join(' et ')}, soit $${n}$.`],
    };
  }),
  variant('verifier', (rng) => {
    const fn = rng.pick(['cos', 'sin'] as const);
    const k = rng.pick(TWELFTHS);
    const v = rng.next() < 0.5 ? trig(fn, k) : rng.pick(VALUES) * rng.pick([-1, 1]);
    const ok = Math.abs(trig(fn, k) - v) < 1e-9;
    return {
      prompt: `Vrai ou faux : $${piTex(k, 12)}$ est solution de l'équation $\\${fn} x = ${exactTex(v)}$.`,
      answer: vraiFaux(ok),
      hint: 'Calcule la valeur exacte au point proposé.',
      correction: [`$\\${fn}\\left(${piTex(k, 12)}\\right) = ${exactTex(trig(fn, k))}$ : c'est ${ok ? 'vrai' : 'faux'}.`],
    };
  }),
];

const pariteVariantes = [
  variant('image-opposee', (rng) => {
    const paire = rng.next() < 0.5;
    const a = rng.int(1, 9);
    const b = rng.nonZero(-9, 9);
    return {
      prompt: `$f$ est une fonction ${paire ? 'paire' : 'impaire'} définie sur $\\mathbb{R}$ et $f(${a}) = ${b}$. Que vaut $f(${-a})$ ?`,
      answer: { kind: 'number', value: frac(paire ? b : -b) },
      hint: paire ? 'Une fonction paire vérifie $f(-x) = f(x)$.' : 'Une fonction impaire vérifie $f(-x) = -f(x)$.',
      correction: [`$f(${-a}) = ${paire ? `f(${a})` : `-f(${a})`} = ${paire ? b : -b}$`],
    };
  }),
  variant('symetrie', (rng) => {
    const paire = rng.next() < 0.5;
    const options = ['l’axe des ordonnées', 'l’origine du repère', 'l’axe des abscisses'];
    return {
      prompt: `La courbe représentative d'une fonction ${paire ? 'paire' : 'impaire'}, dans un repère orthogonal, est symétrique par rapport à :`,
      answer: { kind: 'choice', options, correct: paire ? 0 : 1 },
      hint: 'Compare les points $(x\\,;\\,f(x))$ et $(-x\\,;\\,f(-x))$.',
      correction: [paire ? '$(x\\,;\\,f(x))$ et $(-x\\,;\\,f(x))$ sont symétriques par rapport à l’axe des ordonnées.' : '$(x\\,;\\,f(x))$ et $(-x\\,;\\,-f(x))$ sont symétriques par rapport à l’origine.'],
    };
  }),
];

export const TRIGONOMETRIE: ChapterDef = {
  id: '1re-trigonometrie',
  title: 'Trigonométrie',
  region: 'Nuit du Cercle',
  theme: 'nuit',
  terrain: 'lac',
  skills: [
    enrich(conversion, conversionVariantes),
    enrich(valeurs, valeursVariantes),
    enrich(associes, associesVariantes),
    enrich(principale, principaleVariantes),
    enrich(equation, equationVariantes),
    enrich(parite, pariteVariantes),
  ],
  creatures: [
    {
      id: '1re-radianne',
      name: 'Radianne',
      description: 'Une chouette qui mesure les angles en longueur d’arc : pour elle, un demi-tour vaut pi.',
      skills: ['1re-trigo-conversion'],
      look: { shape: 'oiseau', hue: 230, symbol: 'π' },
    },
    {
      id: '1re-cosinelle',
      name: 'Cosinelle',
      description: 'Une coccinelle lumineuse qui connaît par cœur les coordonnées des points du cercle.',
      skills: ['1re-trigo-valeurs', '1re-trigo-conversion'],
      look: { shape: 'insecte', hue: 0, symbol: 'cos' },
    },
    {
      id: '1re-tourbillune',
      name: 'Tourbillune',
      description: 'Un poisson qui tourne en rond dans le ciel : quel que soit le nombre de tours, il revient au même point.',
      skills: ['1re-trigo-mesure-principale', '1re-trigo-conversion'],
      look: { shape: 'poisson', hue: 250, symbol: '2π' },
    },
    {
      id: '1re-lunassoc',
      name: 'Lunassoc',
      description: 'Un esprit lunaire qui voit chaque angle et son reflet : symétriques, opposés ou complémentaires.',
      skills: ['1re-trigo-associes', '1re-trigo-valeurs'],
      look: { shape: 'spectre', hue: 210, symbol: '☾' },
    },
    {
      id: '1re-sinusoir',
      name: 'Sinusoir',
      description: 'Une fleur nocturne qui ne s’ouvre qu’aux angles dont le sinus ou le cosinus vaut la bonne valeur.',
      skills: ['1re-trigo-equation', '1re-trigo-valeurs'],
      look: { shape: 'plante', hue: 280, symbol: 'sin' },
    },
    {
      id: '1re-paritou',
      name: 'Paritou',
      description: 'Une bête au pelage symétrique : elle sait si une courbe se reflète dans l’axe ou autour de l’origine.',
      skills: ['1re-trigo-parite', '1re-trigo-associes'],
      look: { shape: 'bete', hue: 190, symbol: '±' },
    },
  ],
  boss: {
    id: '1re-trigonox',
    name: 'Trigonox',
    description: 'Le gardien de la nuit, un colosse d’obsidienne gravé du cercle trigonométrique.',
    skills: ['1re-trigo-conversion', '1re-trigo-valeurs', '1re-trigo-associes', '1re-trigo-mesure-principale', '1re-trigo-equation', '1re-trigo-parite'],
    look: { shape: 'golem', hue: 240, symbol: '◯' },
  },
};
