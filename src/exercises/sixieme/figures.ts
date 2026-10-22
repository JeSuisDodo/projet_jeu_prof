import type { Skill } from '../types';
import { byLevel, decimal, fix, fixedChoice, makeChoice, num, numAnswer, skill, yesNo } from './outils';

/** Triangles et quadrilatères particuliers : nature, propriétés, vocabulaire. */

const TRIANGLES = ['Équilatéral', 'Isocèle (non équilatéral)', 'Rectangle', 'Quelconque'];

const natureTriangle: Skill = skill('nature-triangle', 'Reconnaître un triangle particulier', (rng, level) => {
  const kind = rng.int(0, level === 1 ? 1 : 3);
  const a = decimal(rng, 2, 9, level === 1 ? 0 : 1);
  let b = decimal(rng, 2, 9, level === 1 ? 0 : 1);
  let c = decimal(rng, 2, 9, level === 1 ? 0 : 1);
  while (b === a) b = fix(b + 0.5);
  // Le triangle doit exister : chaque côté plus petit que la somme des deux autres.
  while (c === a || c === b || c >= a + b || a >= b + c || b >= a + c) c = decimal(rng, Math.abs(a - b) + 0.5, a + b - 0.5, 1);
  if (kind === 2) {
    return {
      prompt: `Le triangle $RST$ a un angle $\\widehat{RST}$ de $90^\\circ$ et ses côtés mesurent $${num(a)}$ cm, $${num(b)}$ cm et une longueur différente. Quelle est sa nature ?`,
      answer: fixedChoice(TRIANGLES, 2),
      hint: 'Un triangle qui a un angle droit est un triangle rectangle.',
      correction: ['$\\widehat{RST} = 90^\\circ$ : le triangle $RST$ est rectangle en $S$.'],
    };
  }
  const sides = kind === 0 ? [a, a, a] : kind === 1 ? rng.shuffle([a, a, Math.min(b, fix(2 * a - 0.5))]) : [a, b, c];
  return {
    prompt: `Un triangle a des côtés de $${sides.map(num).join('$ cm, $')}$ cm et aucun angle droit. Quelle est sa nature ?`,
    answer: fixedChoice(TRIANGLES, kind),
    hint: 'Équilatéral : trois côtés de même longueur. Isocèle : (au moins) deux côtés de même longueur.',
    correction: [kind === 0 ? 'Ses trois côtés ont la même longueur : il est équilatéral.' : kind === 1 ? 'Il a exactement deux côtés de même longueur : il est isocèle.' : 'Ses trois côtés ont des longueurs différentes : il est quelconque.'],
  };
});

const QUADRIS = ['un rectangle', 'un losange', 'un carré', 'un quadrilatère quelconque'];

const proprietes: Skill = skill('quadrilateres', 'Reconnaître un quadrilatère particulier', (rng, level) => {
  const cases: [string, number][] = [
    ['quatre angles droits', 0],
    ['quatre côtés de même longueur', 1],
    ['quatre angles droits et quatre côtés de même longueur', 2],
    ['des diagonales de même longueur qui se coupent en leur milieu', 0],
    ['des diagonales perpendiculaires qui se coupent en leur milieu', 1],
    ['des diagonales de même longueur, perpendiculaires, qui se coupent en leur milieu', 2],
  ];
  const [text, good] = rng.pick(byLevel(level, cases.slice(0, 3), cases.slice(0, 5), cases.slice(2)));
  return {
    prompt: `Un quadrilatère a ${text}. Quel est le nom le plus précis de ce quadrilatère ?`,
    answer: makeChoice(rng, QUADRIS[good], QUADRIS.filter((_, i) => i !== good), () => 'un triangle'),
    hint: 'Rectangle : quatre angles droits. Losange : quatre côtés égaux. Carré : les deux à la fois.',
    correction: [`Un quadrilatère qui a ${text} est ${QUADRIS[good]}.`],
  };
});

const VRAI_FAUX: [string, boolean][] = [
  ['Un carré est un rectangle.', true],
  ['Un carré est un losange.', true],
  ['Un rectangle est un carré.', false],
  ['Un losange est un carré.', false],
  ['Les diagonales d’un rectangle ont la même longueur.', true],
  ['Les diagonales d’un losange sont perpendiculaires.', true],
  ['Les diagonales d’un rectangle sont toujours perpendiculaires.', false],
  ['Un triangle équilatéral est isocèle.', true],
  ['Un triangle isocèle est équilatéral.', false],
  ['Un triangle rectangle peut avoir deux angles droits.', false],
  ['Les côtés opposés d’un rectangle sont parallèles.', true],
  ['Les diagonales d’un losange ont toujours la même longueur.', false],
];

const vraiFaux: Skill = skill('vrai-faux-figures', 'Connaître les propriétés des figures', (rng, level) => {
  const [text, truth] = rng.pick(byLevel(level, VRAI_FAUX.slice(0, 4), VRAI_FAUX.slice(0, 9), VRAI_FAUX));
  return {
    prompt: `Vrai ou faux ? ${text} (« Oui » si c'est toujours vrai.)`,
    answer: yesNo(truth),
    hint: 'Pense aux définitions : un carré a toutes les propriétés du rectangle et du losange.',
    correction: [truth ? `Vrai : ${text.charAt(0).toLowerCase()}${text.slice(1)}` : `Faux : ce n'est pas toujours le cas.`],
  };
});

const isocele: Skill = skill('isocele-longueur', 'Calculer une longueur dans un triangle particulier', (rng, level) => {
  const kind = byLevel(level, rng.pick(['equi', 'iso']), 'iso', rng.pick(['iso', 'base']));
  if (kind === 'equi') {
    const s = decimal(rng, 2, 15, level === 1 ? 0 : 1);
    return {
      prompt: `Un triangle équilatéral a un périmètre de $${num(fix(3 * s))}$ cm. Quelle est la longueur d'un côté (en cm) ?`,
      answer: numAnswer(s),
      hint: 'Les trois côtés d’un triangle équilatéral ont la même longueur.',
      correction: [`$${num(fix(3 * s))} \\div 3 = ${num(s)}$ cm.`],
    };
  }
  const ab = decimal(rng, 3, 12, level === 3 ? 1 : 0);
  const bc = decimal(rng, 1, 2 * ab - 1, level === 3 ? 1 : 0);
  const p = fix(2 * ab + bc);
  if (kind === 'base') {
    return {
      prompt: `$ABC$ est un triangle isocèle en $A$ de périmètre $${num(p)}$ cm, avec $BC = ${num(bc)}$ cm. Calcule $AB$ (en cm).`,
      answer: numAnswer(ab),
      hint: 'Isocèle en $A$ : $AB = AC$.',
      correction: [`$AB + AC = ${num(p)} - ${num(bc)} = ${num(fix(p - bc))}$`, `$AB = ${num(fix(p - bc))} \\div 2 = ${num(ab)}$ cm.`],
    };
  }
  return {
    prompt: `$ABC$ est un triangle isocèle en $A$ avec $AB = ${num(ab)}$ cm et $BC = ${num(bc)}$ cm. Calcule son périmètre (en cm).`,
    answer: numAnswer(p),
    hint: 'Isocèle en $A$ : $AB = AC$.',
    correction: [`$AC = AB = ${num(ab)}$ cm.`, `$P = ${num(ab)} + ${num(ab)} + ${num(bc)} = ${num(p)}$ cm.`],
  };
});

const vocabulaire: Skill = skill('vocabulaire-quadrilatere', 'Connaître le vocabulaire des polygones', (rng, level) => {
  const pts = ['A', 'B', 'C', 'D'];
  const i = rng.int(0, 3);
  const s = (a: number, b: number) => `[${pts[a % 4]}${pts[b % 4]}]`;
  const cases: [string, string, string[]][] = [
    [`le côté opposé au côté $${s(i, i + 1)}$`, `$${s(i + 2, i + 3)}$`, [`$${s(i + 1, i + 2)}$`, `$${s(i, i + 2)}$`, `$${s(i + 3, i)}$`]],
    [`une diagonale passant par $${pts[i]}$`, `$${s(i, i + 2)}$`, [`$${s(i, i + 1)}$`, `$${s(i + 3, i)}$`, `$${s(i + 1, i + 2)}$`]],
    [`un côté consécutif au côté $${s(i, i + 1)}$`, rng.pick([`$${s(i + 1, i + 2)}$`, `$${s(i + 3, i)}$`]), [`$${s(i + 2, i + 3)}$`, `$${s(i, i + 2)}$`, `$${s(i + 1, i + 3)}$`]],
  ];
  const [text, good, bad] = rng.pick(byLevel(level, cases.slice(0, 1), cases.slice(0, 2), cases));
  return {
    prompt: `Dans le quadrilatère $ABCD$, quel segment est ${text} ?`,
    answer: makeChoice(rng, good, bad, () => '$[AA]$'),
    hint: 'Les sommets se suivent dans l’ordre $A$, $B$, $C$, $D$. Une diagonale relie deux sommets non consécutifs.',
    correction: [`Dans $ABCD$, ${text} est ${good}.`],
  };
});

export const FIGURES_SKILLS: Skill[] = [natureTriangle, proprietes, vraiFaux, isocele, vocabulaire];
