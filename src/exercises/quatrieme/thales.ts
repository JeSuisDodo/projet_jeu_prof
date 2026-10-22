import { frac } from '../fraction';
import type { Skill } from '../types';
import { choiceTex, dec, numDec, numF, skill, tex } from './util';

/** Chapitre « Triangles semblables et théorème de Thalès » (4e, configuration des triangles emboîtés). */

/**
 * Triangle ABC, M sur [AB], N sur [AC], (MN) parallèle à (BC). Coefficient de réduction k = AM/AB.
 * Les longueurs sont choisies pour que toutes les réponses soient décimales.
 */
function configuration(rng: { pick: <T>(x: readonly T[]) => T; int: (a: number, b: number) => number }, level: 1 | 2 | 3) {
  const k = rng.pick(level === 1 ? [0.5, 0.25, 0.75] : level === 2 ? [0.4, 0.6, 0.2, 0.8, 0.5] : [0.3, 0.7, 0.4, 0.6, 0.75, 0.35]);
  const AB = rng.int(2, 12) * (level === 1 ? 4 : 5);
  const AC = rng.int(2, 12) * (level === 1 ? 4 : 5);
  const BC = rng.int(2, 12) * (level === 1 ? 4 : 5);
  const r = (v: number) => Math.round(v * 1000) / 1000;
  return { k, AB, AC, BC, AM: r(k * AB), AN: r(k * AC), MN: r(k * BC) };
}

const longueur = skill('4e-thales-longueur', 'Calculer une longueur avec Thalès', (rng, level) => {
  const c = configuration(rng, level);
  const intro = `Dans le triangle $ABC$, $M$ est sur $[AB]$ et $N$ sur $[AC]$, avec $(MN) \\parallel (BC)$.`;
  const cases = [
    {
      given: `$AM = ${dec(c.AM)}$ cm, $AB = ${dec(c.AB)}$ cm et $BC = ${dec(c.BC)}$ cm`,
      ask: 'MN',
      value: c.MN,
      corr: `$MN = \\dfrac{AM \\times BC}{AB} = \\dfrac{${dec(c.AM)} \\times ${dec(c.BC)}}{${dec(c.AB)}} = ${dec(c.MN)}$ cm`,
    },
    {
      given: `$AM = ${dec(c.AM)}$ cm, $AB = ${dec(c.AB)}$ cm et $AC = ${dec(c.AC)}$ cm`,
      ask: 'AN',
      value: c.AN,
      corr: `$AN = \\dfrac{AM \\times AC}{AB} = \\dfrac{${dec(c.AM)} \\times ${dec(c.AC)}}{${dec(c.AB)}} = ${dec(c.AN)}$ cm`,
    },
    {
      given: `$AN = ${dec(c.AN)}$ cm, $AC = ${dec(c.AC)}$ cm et $MN = ${dec(c.MN)}$ cm`,
      ask: 'BC',
      value: c.BC,
      corr: `$BC = \\dfrac{MN \\times AC}{AN} = \\dfrac{${dec(c.MN)} \\times ${dec(c.AC)}}{${dec(c.AN)}} = ${dec(c.BC)}$ cm`,
    },
  ];
  const pick = rng.pick(level === 1 ? cases.slice(0, 2) : cases);
  return {
    prompt: `${intro} On donne ${pick.given}. Calcule $${pick.ask}$, en cm.`,
    answer: numDec(pick.value),
    hint: 'Les triangles $AMN$ et $ABC$ ont des côtés proportionnels : $\\dfrac{AM}{AB} = \\dfrac{AN}{AC} = \\dfrac{MN}{BC}$.',
    correction: ['D’après le théorème de Thalès, $\\dfrac{AM}{AB} = \\dfrac{AN}{AC} = \\dfrac{MN}{BC}$.', pick.corr],
  };
});

const egalite = skill('4e-thales-egalite', 'Écrire les rapports égaux', (rng) => {
  const [A, B, C, M, N] = rng.pick([
    ['A', 'B', 'C', 'M', 'N'],
    ['R', 'S', 'T', 'U', 'V'],
    ['O', 'E', 'F', 'G', 'H'],
  ]);
  const correct = `\\dfrac{${A}${M}}{${A}${B}} = \\dfrac{${A}${N}}{${A}${C}} = \\dfrac{${M}${N}}{${B}${C}}`;
  const decoys = [
    `\\dfrac{${A}${M}}{${M}${B}} = \\dfrac{${A}${N}}{${N}${C}} = \\dfrac{${M}${N}}{${B}${C}}`,
    `\\dfrac{${A}${M}}{${A}${C}} = \\dfrac{${A}${N}}{${A}${B}} = \\dfrac{${M}${N}}{${B}${C}}`,
    `\\dfrac{${A}${B}}{${A}${M}} = \\dfrac{${A}${N}}{${A}${C}} = \\dfrac{${M}${N}}{${B}${C}}`,
  ];
  return {
    prompt: `Dans le triangle $${A}${B}${C}$, $${M} \\in [${A}${B}]$, $${N} \\in [${A}${C}]$ et $(${M}${N}) \\parallel (${B}${C})$. Quelle égalité donne le théorème de Thalès ?`,
    answer: choiceTex(rng, correct, decoys, () => `\\dfrac{${A}${M}}{${A}${B}} = \\dfrac{${M}${N}}{${A}${C}}`),
    hint: 'Les côtés du petit triangle sont au numérateur, les côtés correspondants du grand triangle au dénominateur.',
    correction: [`Les triangles $${A}${M}${N}$ et $${A}${B}${C}$ sont en configuration de Thalès : $${correct}$.`],
  };
});

const agrandissement = skill('4e-agrandissement-reduction', 'Agrandir ou réduire : longueurs, aires, volumes', (rng, level) => {
  const k = rng.pick(level === 1 ? [2, 3, 0.5, 4] : [2, 3, 1.5, 0.5, 0.2, 2.5]);
  const kind = level === 1 ? 'longueur' : rng.pick(level === 2 ? ['longueur', 'aire'] : ['aire', 'volume', 'aire']);
  const base = rng.int(2, 20) * (k < 1 ? 10 : 1);
  const power = kind === 'longueur' ? 1 : kind === 'aire' ? 2 : 3;
  const factor = Math.round(k ** power * 1e6) / 1e6;
  const value = Math.round(base * factor * 1e6) / 1e6;
  const unit = kind === 'longueur' ? 'cm' : kind === 'aire' ? 'cm²' : 'cm³';
  const what = kind === 'longueur' ? 'Un côté de la figure mesure' : kind === 'aire' ? 'La figure a une aire de' : 'Le solide a un volume de';
  return {
    prompt: `On ${k > 1 ? 'agrandit' : 'réduit'} une figure à l’échelle $k = ${dec(k)}$. ${what} ${base} ${unit}. Que devient ${kind === 'volume' ? 'ce' : 'cette'} ${kind}, en ${unit} ?`,
    answer: numDec(value),
    hint: 'Dans un agrandissement ou une réduction de rapport $k$, les longueurs sont multipliées par $k$, les aires par $k^2$, les volumes par $k^3$.',
    correction: [`${kind[0].toUpperCase() + kind.slice(1)} : on multiplie par $${power === 1 ? dec(k) : `${dec(k)}^{${power}} = ${dec(factor)}`}$.`, `$${base} \\times ${dec(factor)} = ${dec(value)}$ ${unit}`],
  };
});

const coefficient = skill('4e-coefficient-semblables', 'Trouver le rapport de deux triangles semblables', (rng, level) => {
  const sides = [rng.int(2, 9), rng.int(3, 10), rng.int(4, 12)].sort((a, b) => a - b);
  if (sides[0] + sides[1] <= sides[2]) sides[2] = sides[0] + sides[1] - 1;
  const k = level === 1 ? rng.int(2, 4) : rng.pick([frac(3, 2), frac(5, 2), frac(1, 2), frac(2, 3), frac(4, 3), frac(3, 4)]);
  const K = typeof k === 'number' ? frac(k) : k;
  // On choisit des côtés multiples du dénominateur pour que l'image soit entière.
  const s = sides.map((x) => x * K.d);
  const t = s.map((x) => (x * K.n) / K.d);
  const i = rng.int(0, 2);
  return {
    prompt: `Les triangles $DEF$ et $D'E'F'$ sont semblables : $DE = ${s[0]}$, $EF = ${s[1]}$, $DF = ${s[2]}$ et $D'E' = ${t[0]}$, $E'F' = ${t[1]}$, $D'F' = ${t[2]}$ (en cm). Par quel nombre $k$ multiplie-t-on les longueurs de $DEF$ pour obtenir celles de $D'E'F'$ ?${level >= 2 ? ' (Fraction ou décimal.)' : ''}`,
    answer: numF(K),
    hint: "Divise une longueur de $D'E'F'$ par la longueur correspondante de $DEF$.",
    correction: [`$k = \\dfrac{${['D\'E\'', 'E\'F\'', 'D\'F\''][i]}}{${['DE', 'EF', 'DF'][i]}} = \\dfrac{${t[i]}}{${s[i]}} = ${tex(K)}$${[2, 4, 5].includes(K.d) ? ` (soit $${dec(K.n / K.d)}$)` : ''}`],
  };
});

export const THALES_SKILLS: Skill[] = [longueur, egalite, agrandissement, coefficient];
