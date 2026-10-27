import { frac } from '../fraction';
import type { Rng } from '../rng';
import type { Skill } from '../types';
import { variante, varier } from '../varier';
import { affine, dec, distinctInts, fixedChoice, interval, latexChoice, par } from './outils';

/** Chapitre 10 de 2nde : sens de variation, extremums, tableaux de variations. */

const sensAffine: Skill = {
  id: '2nde-sens-affine',
  name: 'Trouver le sens de variation d’une fonction affine',
  generate(rng, level) {
    const a = level === 1 ? rng.nonZero(-5, 5) : rng.int(-5, 5);
    const b = rng.int(-9, 9);
    // En niveau 3, la fonction est écrite b + ax pour ne pas lire a trop vite.
    const f = level === 3 && b !== 0 ? `${b} ${a < 0 ? '-' : '+'} ${Math.abs(a) === 1 ? '' : Math.abs(a)}x` : affine(a, b);
    const shown = a === 0 ? `${b}` : f;
    const kind = a > 0 ? 0 : a < 0 ? 1 : 2;
    return {
      skill: '2nde-sens-affine',
      level,
      prompt: `Quel est le sens de variation sur $\\mathbb{R}$ de la fonction $f(x) = ${shown}$ ?`,
      answer: fixedChoice(['Croissante', 'Décroissante', 'Constante'], kind),
      hint: 'Une fonction affine $f(x) = ax + b$ est croissante si $a > 0$, décroissante si $a < 0$, constante si $a = 0$.',
      correction: [
        `Le coefficient de $x$ est $a = ${a}$.`,
        a > 0 ? '$a > 0$ : $f$ est croissante.' : a < 0 ? '$a < 0$ : $f$ est décroissante.' : '$a = 0$ : $f$ est constante.',
      ],
    };
  },
};

/** Tableau de variations en LaTeX : abscisses, valeurs et flèches. */
function table(xs: number[], ys: number[]): string {
  const top: string[] = [];
  const bottom: string[] = [];
  xs.forEach((x, i) => {
    top.push(String(x));
    bottom.push(String(ys[i]));
    if (i < xs.length - 1) {
      top.push('');
      bottom.push(ys[i + 1] > ys[i] ? '\\nearrow' : '\\searrow');
    }
  });
  const cols = 'c'.repeat(top.length);
  return `\\begin{array}{c|${cols}} x & ${top.join(' & ')} \\\\ \\hline f(x) & ${bottom.join(' & ')} \\end{array}`;
}

/** Valeurs alternées (monte, descend…) pour un tableau de variations crédible. */
function zigzag(rng: Rng, n: number, up: boolean): number[] {
  const ys = [rng.int(-6, 6)];
  for (let i = 1; i < n; i++) {
    const goUp = i % 2 === 1 ? up : !up;
    ys.push(ys[i - 1] + (goUp ? 1 : -1) * rng.int(2, 7));
  }
  return ys;
}

const extremumTableau: Skill = {
  id: '2nde-extremum-tableau',
  name: 'Lire un extremum dans un tableau de variations',
  generate(rng, level) {
    const n = level === 1 ? 3 : 4;
    const xs = distinctInts(rng, n, -8, 8).sort((p, q) => p - q);
    let ys = zigzag(rng, n, rng.next() < 0.5);
    // Toutes les valeurs différentes, pour qu'il n'y ait aucune ambiguïté.
    while (new Set(ys).size < n) ys = zigzag(rng, n, rng.next() < 0.5);
    const wantMax = rng.next() < 0.5;
    const value = wantMax ? Math.max(...ys) : Math.min(...ys);
    const at = xs[ys.indexOf(value)];
    return {
      skill: '2nde-extremum-tableau',
      level,
      prompt: `Voici le tableau de variations d'une fonction $f$ sur $[${xs[0]}\\,;\\,${xs[n - 1]}]$ : $${table(xs, ys)}$ Quel est le ${wantMax ? 'maximum' : 'minimum'} de $f$ sur cet intervalle ?`,
      answer: { kind: 'number', value: frac(value) },
      hint: `Compare toutes les valeurs ${wantMax ? 'au bout des flèches montantes' : 'au bout des flèches descendantes'} et aux bornes.`,
      correction: [
        `Les valeurs du tableau sont $${ys.join('$, $')}$.`,
        `Le ${wantMax ? 'maximum' : 'minimum'} est $${value}$, atteint en $x = ${at}$.`,
      ],
    };
  },
};

const comparerTableau: Skill = {
  id: '2nde-comparer-tableau',
  name: 'Comparer des images grâce aux variations',
  generate(rng, level) {
    const [lo, hi] = distinctInts(rng, 2, -8, 8).sort((p, q) => p - q);
    const increasing = rng.next() < 0.5;
    const span = hi - lo;
    // Deux décimaux distincts dans ]lo ; hi[.
    const a = lo + Math.round(rng.next() * span * 10) / 10;
    let b = a;
    while (b === a) b = lo + Math.round(rng.next() * span * 10) / 10;
    const fa = `f(${dec(a)})`;
    const fb = `f(${dec(b)})`;
    const smaller = (a < b) === increasing;
    return {
      skill: '2nde-comparer-tableau',
      level,
      prompt: `La fonction $f$ est ${increasing ? 'strictement croissante' : 'strictement décroissante'} sur $[${lo}\\,;\\,${hi}]$. Compare $${fa}$ et $${fb}$.`,
      answer: fixedChoice([`$${fa} < ${fb}$`, `$${fa} > ${fb}$`], smaller ? 0 : 1),
      hint: 'Une fonction croissante conserve l’ordre ; une fonction décroissante l’inverse.',
      correction: [
        `$${dec(a)} ${a < b ? '<' : '>'} ${dec(b)}$ et ces deux nombres sont dans $[${lo}\\,;\\,${hi}]$.`,
        `$f$ ${increasing ? 'conserve' : 'inverse'} l'ordre, donc $${fa} ${smaller ? '<' : '>'} ${fb}$.`,
      ],
    };
  },
};

const extremumAffine: Skill = {
  id: '2nde-extremum-affine',
  name: 'Trouver l’extremum d’une fonction affine sur un intervalle',
  generate(rng, level) {
    const a = rng.nonZero(-5, 5);
    const b = rng.int(-9, 9);
    const [lo, hi] = distinctInts(rng, 2, -6, 6).sort((p, q) => p - q);
    const wantMax = level === 1 ? true : rng.next() < 0.5;
    const at = (a > 0) === wantMax ? hi : lo;
    const value = a * at + b;
    return {
      skill: '2nde-extremum-affine',
      level,
      prompt: `Quel est le ${wantMax ? 'maximum' : 'minimum'} de $f(x) = ${affine(a, b)}$ sur $[${lo}\\,;\\,${hi}]$ ?`,
      answer: { kind: 'number', value: frac(value) },
      hint: 'Une fonction affine est monotone : son extremum sur un intervalle fermé est atteint à une borne.',
      correction: [
        `$a = ${a}$ : $f$ est ${a > 0 ? 'croissante' : 'décroissante'}, donc son ${wantMax ? 'maximum' : 'minimum'} est atteint en $x = ${at}$.`,
        `$f(${at}) = ${a} \\times ${par(at)} ${b < 0 ? '-' : '+'} ${Math.abs(b)} = ${value}$`,
      ],
    };
  },
};

/** f(x) = s(x - α)² + β */
function shifted(s: number, alpha: number, beta: number): string {
  const square = alpha === 0 ? 'x^2' : `(${affine(1, -alpha)})^2`;
  return `${s < 0 ? '-' : ''}${square}${beta === 0 ? '' : ` ${beta < 0 ? '-' : '+'} ${Math.abs(beta)}`}`;
}

const variationsCarre: Skill = {
  id: '2nde-variations-carre',
  name: 'Trouver les variations de a(x − α)² + β',
  generate(rng, level) {
    const s = level === 1 ? 1 : rng.sign();
    const alpha = rng.int(-6, 6);
    const beta = rng.int(-9, 9);
    const wantUp = rng.next() < 0.5;
    const right = interval(alpha, true, null, false);
    const left = interval(null, false, alpha, true);
    // s > 0 : décroissante puis croissante ; s < 0 : l'inverse.
    const correct = (s > 0) === wantUp ? right : left;
    return {
      skill: '2nde-variations-carre',
      level,
      prompt: `Sur quel intervalle la fonction $f(x) = ${shifted(s, alpha, beta)}$ est-elle ${wantUp ? 'croissante' : 'décroissante'} ?`,
      answer: latexChoice(
        rng,
        correct,
        [correct === right ? left : right, interval(-alpha, true, null, false), interval(null, false, -alpha, true), interval(beta, true, null, false)],
        () => interval(alpha + 1, true, null, false),
      ),
      hint: 'Comme la fonction carré, elle change de sens en $x = \\alpha$, là où le carré s’annule.',
      correction: [
        `Le carré $${alpha === 0 ? 'x^2' : `(${affine(1, -alpha)})^2`}$ est minimal en $x = ${alpha}$.`,
        s > 0
          ? `$f$ est décroissante sur $${left}$ puis croissante sur $${right}$.`
          : `Avec le signe moins, $f$ est croissante sur $${left}$ puis décroissante sur $${right}$.`,
      ],
    };
  },
};

const extremumCarre: Skill = {
  id: '2nde-extremum-carre',
  name: 'Trouver l’extremum de a(x − α)² + β',
  generate(rng, level) {
    const s = level === 1 ? 1 : rng.sign();
    const alpha = rng.int(-6, 6);
    const beta = rng.int(-9, 9);
    return {
      skill: '2nde-extremum-carre',
      level,
      prompt: `La fonction $f(x) = ${shifted(s, alpha, beta)}$ admet un ${s > 0 ? 'minimum' : 'maximum'} sur $\\mathbb{R}$. Donne sa valeur et l'abscisse où il est atteint.`,
      answer: { kind: 'pair', values: [frac(beta), frac(alpha)], labels: [s > 0 ? '\\min' : '\\max', 'x'] },
      hint: 'Un carré est toujours positif ou nul, et il vaut 0 en un seul point.',
      correction: [
        `$${alpha === 0 ? 'x^2' : `(${affine(1, -alpha)})^2`} \\geq 0$ et il vaut 0 pour $x = ${alpha}$.`,
        s > 0 ? `Donc $f(x) \\geq ${beta}$, avec égalité en $x = ${alpha}$ : minimum $${beta}$.` : `Donc $f(x) \\leq ${beta}$, avec égalité en $x = ${alpha}$ : maximum $${beta}$.`,
      ],
    };
  },
};

/* ---------- Variantes : d'autres façons de poser les mêmes notions ---------- */

const SENS = ['Croissante', 'Décroissante', 'Constante'];

const sensAffineVariantes = [
  variante('deux-images', (rng) => {
    const x1 = rng.int(-6, 3);
    const x2 = x1 + rng.int(1, 6);
    const y1 = rng.int(-9, 9);
    const y2 = rng.next() < 0.1 ? y1 : y1 + rng.nonZero(-9, 9);
    const kind = y2 > y1 ? 0 : y2 < y1 ? 1 : 2;
    return {
      prompt: `$f$ est une fonction affine telle que $f(${x1}) = ${y1}$ et $f(${x2}) = ${y2}$. Quel est son sens de variation ?`,
      answer: fixedChoice(SENS, kind),
      hint: 'Le signe du coefficient directeur est celui de $\\frac{f(x_2) - f(x_1)}{x_2 - x_1}$.',
      correction: [`$a = \\frac{${y2} - ${par(y1)}}{${x2} - ${par(x1)}} = \\frac{${y2 - y1}}{${x2 - x1}}$`, kind === 0 ? '$a > 0$ : $f$ est croissante.' : kind === 1 ? '$a < 0$ : $f$ est décroissante.' : '$a = 0$ : $f$ est constante.'],
    };
  }),
  variante('comparer', (rng) => {
    const a = rng.nonZero(-5, 5);
    const b = rng.int(-9, 9);
    const u = rng.int(-200, 200) / 10;
    let v = u;
    while (v === u) v = rng.int(-200, 200) / 10;
    const fu = `f(${dec(u)})`;
    const fv = `f(${dec(v)})`;
    const smaller = a * u < a * v;
    return {
      prompt: `Soit $f(x) = ${affine(a, b)}$. Sans calculer, compare $${fu}$ et $${fv}$.`,
      answer: fixedChoice([`$${fu} < ${fv}$`, `$${fu} > ${fv}$`], smaller ? 0 : 1),
      hint: 'Trouve d’abord le sens de variation de $f$.',
      correction: [`$a = ${a}$ : $f$ est ${a > 0 ? 'croissante (elle conserve l’ordre)' : 'décroissante (elle inverse l’ordre)'}.`, `$${dec(u)} ${u < v ? '<' : '>'} ${dec(v)}$ donc $${fu} ${smaller ? '<' : '>'} ${fv}$.`],
    };
  }),
];

/** Tableau de variations à n valeurs toutes distinctes. */
function tableauDistinct(rng: Rng, n: number) {
  const xs = distinctInts(rng, n, -8, 8).sort((p, q) => p - q);
  let ys = zigzag(rng, n, rng.next() < 0.5);
  while (new Set(ys).size < n) ys = zigzag(rng, n, rng.next() < 0.5);
  return { xs, ys };
}

const extremumTableauVariantes = [
  variante('nombre-solutions', (rng, level) => {
    const { xs, ys } = tableauDistinct(rng, level === 1 ? 3 : 4);
    let k = rng.int(Math.min(...ys), Math.max(...ys));
    while (ys.includes(k)) k++;
    let count = 0;
    for (let i = 0; i + 1 < ys.length; i++) if ((ys[i] - k) * (ys[i + 1] - k) < 0) count++;
    return {
      prompt: `Voici le tableau de variations d'une fonction $f$ continue sur $[${xs[0]}\\,;\\,${xs[xs.length - 1]}]$ : $${table(xs, ys)}$ Combien de solutions l'équation $f(x) = ${k}$ a-t-elle sur cet intervalle ?`,
      answer: { kind: 'number', value: frac(count) },
      hint: `Sur chaque flèche, $f$ est strictement monotone : regarde si $${k}$ est entre les deux valeurs aux extrémités de la flèche.`,
      correction: [`On compte les flèches qui « traversent » la valeur $${k}$.`, `Il y a $${count}$ solution${count > 1 ? 's' : ''}.`],
    };
  }),
  variante('ou-atteint', (rng, level) => {
    const { xs, ys } = tableauDistinct(rng, level === 1 ? 3 : 4);
    const wantMax = rng.next() < 0.5;
    const value = wantMax ? Math.max(...ys) : Math.min(...ys);
    return {
      prompt: `Voici le tableau de variations d'une fonction $f$ : $${table(xs, ys)}$ En quelle valeur de $x$ le ${wantMax ? 'maximum' : 'minimum'} de $f$ est-il atteint ?`,
      answer: { kind: 'number', value: frac(xs[ys.indexOf(value)]) },
      hint: 'Repère la valeur extrême dans la ligne de $f(x)$, puis lis l’abscisse au-dessus.',
      correction: [`Le ${wantMax ? 'maximum' : 'minimum'} vaut $${value}$, atteint en $x = ${xs[ys.indexOf(value)]}$.`],
    };
  }),
];

const comparerTableauVariantes = [
  variante('sans-conclusion', (rng) => {
    const lo = rng.int(-8, -3);
    const m = lo + rng.int(2, 4);
    const hi = m + rng.int(2, 4);
    const up = rng.next() < 0.5;
    const a = lo + rng.int(1, m - lo - 1) + 0.5 * rng.int(0, 1);
    const b = m + rng.int(1, hi - m - 1) + 0.5 * rng.int(0, 1);
    const fa = `f(${dec(a)})`;
    const fb = `f(${dec(b)})`;
    return {
      prompt: `La fonction $f$ est ${up ? 'croissante' : 'décroissante'} sur $[${lo}\\,;\\,${m}]$ puis ${up ? 'décroissante' : 'croissante'} sur $[${m}\\,;\\,${hi}]$. Que peut-on dire de $${fa}$ et $${fb}$ ?`,
      answer: fixedChoice([`$${fa} < ${fb}$`, `$${fa} > ${fb}$`, 'On ne peut pas conclure'], 2),
      hint: 'Les deux nombres sont-ils dans le même intervalle de monotonie ?',
      correction: [`$${dec(a)}$ et $${dec(b)}$ sont de part et d'autre de $${m}$, où $f$ change de sens.`, 'Sans autre information, on ne peut pas comparer leurs images.'],
    };
  }),
  variante('tableau', (rng) => {
    const { xs, ys } = tableauDistinct(rng, 4);
    const i = rng.int(0, 2);
    const span = xs[i + 1] - xs[i];
    const a = xs[i] + Math.round(rng.next() * span * 10) / 10;
    let b = a;
    while (b === a) b = xs[i] + Math.round(rng.next() * span * 10) / 10;
    const increasing = ys[i + 1] > ys[i];
    const fa = `f(${dec(a)})`;
    const fb = `f(${dec(b)})`;
    const smaller = (a < b) === increasing;
    return {
      prompt: `Voici le tableau de variations d'une fonction $f$ : $${table(xs, ys)}$ Compare $${fa}$ et $${fb}$.`,
      answer: fixedChoice([`$${fa} < ${fb}$`, `$${fa} > ${fb}$`], smaller ? 0 : 1),
      hint: 'Repère sur quelle flèche se trouvent les deux nombres.',
      correction: [`$${dec(a)}$ et $${dec(b)}$ sont dans $[${xs[i]}\\,;\\,${xs[i + 1]}]$, où $f$ est ${increasing ? 'croissante' : 'décroissante'}.`, `Donc $${fa} ${smaller ? '<' : '>'} ${fb}$.`],
    };
  }),
];

const extremumAffineVariantes = [
  variante('image-intervalle', (rng) => {
    const a = rng.nonZero(-5, 5);
    const b = rng.int(-9, 9);
    const [lo, hi] = distinctInts(rng, 2, -6, 6).sort((p, q) => p - q);
    const [ylo, yhi] = [a * lo + b, a * hi + b].sort((p, q) => p - q);
    const correct = interval(ylo, true, yhi, true);
    return {
      prompt: `Soit $f(x) = ${affine(a, b)}$. Quand $x$ parcourt $[${lo}\\,;\\,${hi}]$, dans quel intervalle se trouve $f(x)$ ?`,
      answer: latexChoice(rng, correct, [interval(lo, true, hi, true), interval(ylo - a, true, yhi - a, true), interval(Math.min(lo, ylo), true, Math.max(hi, yhi), true)], () => interval(ylo - 1, true, yhi + 1, true)),
      hint: 'Une fonction affine est monotone : les valeurs extrêmes sont les images des bornes.',
      correction: [`$f(${lo}) = ${a * lo + b}$ et $f(${hi}) = ${a * hi + b}$.`, `Donc $f(x) \\in ${correct}$.`],
    };
  }),
  variante('concret', (rng) => {
    const a = -rng.int(1, 4);
    const b = rng.int(15, 40);
    const h = rng.int(3, 8);
    return {
      prompt: `Pendant une randonnée, la température (en °C) à l'altitude $x$ (en km) est $T(x) = ${affine(a * 2, b)}$, pour $x$ entre $0$ et $${h}$. Quelle est la température minimale rencontrée ?`,
      answer: { kind: 'number', value: frac(2 * a * h + b) },
      hint: 'La fonction est décroissante : le minimum est atteint à la plus grande altitude.',
      correction: [`$T$ est décroissante (coefficient $${2 * a} < 0$), donc le minimum est $T(${h}) = ${2 * a * h + b}$ °C.`],
    };
  }),
];

const variationsCarreVariantes = [
  variante('sur-un-intervalle', (rng, level) => {
    const s = level === 1 ? 1 : rng.sign();
    const alpha = rng.int(-6, 6);
    const beta = rng.int(-9, 9);
    const right = rng.next() < 0.5;
    const p = right ? alpha + rng.int(0, 3) : alpha - rng.int(4, 7);
    const q = p + rng.int(1, 3);
    const up = (s > 0) === right;
    return {
      prompt: `Sur l'intervalle $[${p}\\,;\\,${q}]$, la fonction $f(x) = ${shifted(s, alpha, beta)}$ est-elle croissante ou décroissante ?`,
      answer: fixedChoice(['Croissante', 'Décroissante'], up ? 0 : 1),
      hint: `Situe l'intervalle par rapport à $${alpha}$, là où $f$ change de sens.`,
      correction: [`$[${p}\\,;\\,${q}]$ est ${right ? 'à droite' : 'à gauche'} de $${alpha}$.`, `$f$ y est ${up ? 'croissante' : 'décroissante'}.`],
    };
  }),
  variante('forme-developpee', (rng) => {
    const alpha = rng.int(-6, 6);
    const c = rng.int(-9, 9);
    // x² - 2αx + c = (x - α)² + c - α²
    const f = `x^2 ${alpha === 0 ? '' : `${alpha > 0 ? '-' : '+'} ${2 * Math.abs(alpha)}x `}${c === 0 ? '' : `${c < 0 ? '-' : '+'} ${Math.abs(c)}`}`.trim();
    return {
      prompt: `On admet que $f(x) = ${f}$ s'écrit $(x - \\alpha)^2 + \\beta$. En quelle valeur de $x$ la fonction $f$ change-t-elle de sens de variation ?`,
      answer: { kind: 'number', value: frac(alpha) },
      hint: 'Développe $(x - \\alpha)^2 = x^2 - 2\\alpha x + \\alpha^2$ et identifie le coefficient de $x$.',
      correction: [`$-2\\alpha = ${-2 * alpha}$, donc $\\alpha = ${alpha}$.`, `$f(x) = ${shifted(1, alpha, c - alpha * alpha)}$ change de sens en $x = ${alpha}$.`],
    };
  }),
];

const extremumCarreVariantes = [
  variante('balle', (rng) => {
    const t0 = rng.int(1, 4);
    const hmax = rng.int(6, 25);
    const k = rng.pick([1, 2, 5]);
    const f = `-${k === 1 ? '' : k}(t - ${t0})^2 + ${hmax}`;
    return {
      prompt: `La hauteur (en m) d'une balle lancée en l'air est $h(t) = ${f}$, où $t$ est le temps en secondes. Quelle hauteur maximale atteint-elle ?`,
      answer: { kind: 'number', value: frac(hmax) },
      hint: 'Le terme $-' + (k === 1 ? '' : k) + '(t - ' + t0 + ')^2$ est toujours négatif ou nul.',
      correction: [`$h(t) \\leq ${hmax}$, avec égalité pour $t = ${t0}$.`, `La hauteur maximale est $${hmax}$ m, atteinte au bout de $${t0}$ s.`],
    };
  }),
  variante('vrai-faux', (rng, level) => {
    const s = level === 1 ? 1 : rng.sign();
    const alpha = rng.int(-6, 6);
    const beta = rng.int(-9, 9);
    const k = beta + rng.int(-3, 3);
    const juste = s > 0 ? k <= beta : k >= beta;
    return {
      prompt: `Vrai ou faux : pour tout réel $x$, $${shifted(s, alpha, beta)} ${s > 0 ? '\\geq' : '\\leq'} ${k}$.`,
      answer: fixedChoice(['Vrai', 'Faux'], juste ? 0 : 1),
      hint: `Cherche l'extremum de la fonction.`,
      correction: [`La fonction a pour ${s > 0 ? 'minimum' : 'maximum'} $${beta}$, atteint en $x = ${alpha}$.`, juste ? 'L’inégalité est vraie pour tout $x$.' : `Elle est fausse : en $x = ${alpha}$, on obtient $${beta}$.`],
    };
  }),
];

export const VARIATIONS_SKILLS: Skill[] = [
  varier(sensAffine, sensAffineVariantes),
  varier(extremumTableau, extremumTableauVariantes),
  varier(comparerTableau, comparerTableauVariantes),
  varier(extremumAffine, extremumAffineVariantes),
  varier(variationsCarre, variationsCarreVariantes),
  varier(extremumCarre, extremumCarreVariantes),
];
