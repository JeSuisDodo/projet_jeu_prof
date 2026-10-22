import type { Skill } from '../types';
import { byLevel, decimal, deg, makeChoice, num, numAnswer, skill } from './outils';

/** Symétrie axiale : quadrillage, axes de symétrie des figures, propriétés, médiatrice. */

const COLS = 'ABCDEFGHIJKL';

const quadrillage: Skill = skill('symetrique-quadrillage', 'Construire un symétrique sur un quadrillage', (rng, level) => {
  // Les cases sont repérées comme à la bataille navale : une lettre (colonne) et un numéro (ligne).
  const vertical = level === 1 ? true : rng.next() < 0.5;
  const axis = rng.int(3, 8); // l'axe passe entre la colonne (ou ligne) n° axis et la suivante (indices 1 à 12)
  let k: number;
  do k = rng.int(1, 12);
  while (k === axis || k === axis + 1 || 2 * axis + 1 - k < 1 || 2 * axis + 1 - k > 12 || Math.abs(k - axis) > byLevel(level, 3, 5, 6));
  const image = 2 * axis + 1 - k;
  const other = rng.int(1, 12);
  const label = ([along, across]: [number, number]) => (vertical ? `${COLS[along - 1]}${across}` : `${COLS[across - 1]}${along}`);
  const inside = ([x, y]: [number, number]) => x >= 1 && x <= 12 && y >= 1 && y <= 12;
  const start = label([k, other]);
  const good = label([image, other]);
  // Erreurs classiques : une case de trop ou de moins, ou symétrie par rapport à l'autre direction.
  const bad = ([[image + 1, other], [image - 1, other], [k, 13 - other], [image, 13 - other]] as [number, number][]).filter(inside).map(label);
  const axisText = vertical
    ? `la ligne verticale qui sépare les colonnes ${COLS[axis - 1]} et ${COLS[axis]}`
    : `la ligne horizontale qui sépare les lignes ${axis} et ${axis + 1}`;
  const between = k <= axis ? axis - k : k - axis - 1;
  return {
    prompt: `Sur un quadrillage, les colonnes sont nommées de A à L et les lignes numérotées de 1 à 12. L'axe de symétrie est ${axisText}. Quelle case est la symétrique de la case ${start} ?`,
    answer: makeChoice(rng, good, bad, () => label([rng.int(1, 12), rng.int(1, 12)])),
    hint: 'Compte de combien de cases la case de départ est éloignée de l’axe : la symétrique est à la même distance, de l’autre côté.',
    correction: [`Entre ${start} et l'axe, il y a $${between}$ case${between > 1 ? 's' : ''}.`, `La symétrique est à la même distance, de l'autre côté de l'axe : ${good}.`],
  };
});

const AXES: [string, number][] = [
  ['un carré', 4],
  ['un rectangle (qui n’est pas un carré)', 2],
  ['un losange (qui n’est pas un carré)', 2],
  ['un triangle équilatéral', 3],
  ['un triangle isocèle (non équilatéral)', 1],
  ['un triangle quelconque', 0],
  ['un segment', 2],
  ['la lettre majuscule H', 2],
  ['la lettre majuscule A', 1],
  ['la lettre majuscule N', 0],
  ['un hexagone régulier', 6],
  ['un pentagone régulier', 5],
  ['la lettre majuscule E', 1],
  ['un octogone régulier', 8],
];

const axes: Skill = skill('axes-symetrie', 'Compter les axes de symétrie d’une figure', (rng, level) => {
  const [text, n] = rng.pick(byLevel(level, AXES.slice(0, 6), AXES.slice(0, 10), AXES.slice(3)));
  return {
    prompt: `Combien d'axes de symétrie possède ${text} ?`,
    answer: numAnswer(n),
    hint: 'Un axe de symétrie partage la figure en deux parties qui se superposent par pliage.',
    correction: [`${text.charAt(0).toUpperCase()}${text.slice(1)} a $${n}$ axe${n > 1 ? 's' : ''} de symétrie.`],
  };
});

const conservation: Skill = skill('conservation', 'Utiliser les propriétés de la symétrie', (rng, level) => {
  const kind = rng.pick(byLevel(level, ['longueur', 'angle'], ['longueur', 'angle', 'perimetre'], ['perimetre', 'aire', 'angle']));
  const v = decimal(rng, 2, 15, level === 1 ? 0 : 1);
  const [text, unit, why] =
    kind === 'longueur'
      ? [`Le segment $[AB]$ mesure $${num(v)}$ cm. Combien mesure son symétrique $[A'B']$ par rapport à une droite (en cm) ?`, num(v), 'La symétrie axiale conserve les longueurs.']
      : kind === 'angle'
        ? [`L'angle $\\widehat{ABC}$ mesure $${deg(Math.round(v * 10))}$. Combien mesure son symétrique $\\widehat{A'B'C'}$ (en degrés) ?`, num(Math.round(v * 10)), 'La symétrie axiale conserve les angles.']
        : kind === 'perimetre'
          ? [`Une figure a un périmètre de $${num(v)}$ cm. Quel est le périmètre de sa symétrique par rapport à une droite (en cm) ?`, num(v), 'La symétrie axiale conserve les longueurs, donc les périmètres.']
          : [`Une figure a une aire de $${num(v)}$ cm². Quelle est l'aire de sa symétrique par rapport à une droite (en cm²) ?`, num(v), 'La symétrie axiale conserve les aires.'];
  return {
    prompt: text,
    answer: numAnswer(kind === 'angle' ? Math.round(v * 10) : v),
    hint: 'Une figure et sa symétrique sont superposables par pliage le long de l’axe.',
    correction: [why, `La réponse est $${unit}$.`],
  };
});

const mediatrice: Skill = skill('mediatrice', 'Utiliser la médiatrice d’un segment', (rng, level) => {
  const kind = byLevel(level, 'milieu', rng.pick(['milieu', 'equidistant']), rng.pick(['equidistant', 'definition']));
  if (kind === 'definition') {
    const good = 'la médiatrice du segment $[AA\']$';
    return {
      prompt: `$A'$ est le symétrique du point $A$ par rapport à la droite $(d)$, avec $A$ hors de $(d)$. Que représente la droite $(d)$ ?`,
      answer: makeChoice(rng, good, ['la bissectrice du segment $[AA\']$', 'une parallèle à $(AA\')$', 'le milieu du segment $[AA\']$'], () => 'une diagonale'),
      hint: 'La droite $(d)$ est perpendiculaire à $[AA\']$ et passe par son milieu.',
      correction: [`$(d)$ est perpendiculaire à $[AA']$ en son milieu : c'est ${good}.`],
    };
  }
  const v = decimal(rng, 1.5, 12, level === 1 ? 0 : 1);
  if (kind === 'milieu') {
    const ab = Math.round(v * 2 * 10) / 10;
    return {
      prompt: `La médiatrice du segment $[AB]$ coupe ce segment en $I$. $AB = ${num(ab)}$ cm. Combien mesure $AI$ (en cm) ?`,
      answer: numAnswer(ab / 2),
      hint: 'La médiatrice passe par le milieu du segment.',
      correction: [`$I$ est le milieu de $[AB]$ : $AI = ${num(ab)} \\div 2 = ${num(ab / 2)}$ cm.`],
    };
  }
  return {
    prompt: `Le point $M$ est sur la médiatrice du segment $[AB]$ et $MA = ${num(v)}$ cm. Combien mesure $MB$ (en cm) ?`,
    answer: numAnswer(v),
    hint: 'Tout point de la médiatrice d’un segment est à égale distance des extrémités de ce segment.',
    correction: [`$M$ est sur la médiatrice de $[AB]$, donc $MB = MA = ${num(v)}$ cm.`],
  };
});

const surAxe: Skill = skill('point-sur-axe', 'Trouver le symétrique d’un point particulier', (rng, level) => {
  const cases: [string, number][] = [
    ['Le point $M$ est sur l’axe de symétrie $(d)$. Où est son symétrique ?', 0],
    ['Le point $M$ est à $3$ cm de l’axe $(d)$. À quelle distance de $(d)$ est son symétrique $M\'$ ?', 1],
    ['Le point $M$ n’est pas sur l’axe $(d)$. La droite $(MM\')$ et l’axe $(d)$ sont :', 2],
  ];
  const [text, k] = rng.pick(byLevel(level, cases.slice(0, 2), cases, cases.slice(1)));
  const options = [
    ['Il est confondu avec $M$', 'Il est sur une perpendiculaire à $(d)$ loin de $M$', 'Il n’existe pas'],
    ['À $3$ cm', 'À $6$ cm', 'À $1{,}5$ cm'],
    ['perpendiculaires', 'parallèles', 'confondues'],
  ][k];
  return {
    prompt: text,
    answer: makeChoice(rng, options[0], options.slice(1), () => 'On ne peut pas savoir'),
    hint: 'Le symétrique d’un point est à la même distance de l’axe, de l’autre côté, sur la perpendiculaire à l’axe.',
    correction: [['Un point de l’axe est son propre symétrique.', 'Un point et son symétrique sont à la même distance de l’axe : $3$ cm.', 'Le segment $[MM\']$ est perpendiculaire à l’axe.'][k]],
  };
});

export const SYMETRIE_SKILLS: Skill[] = [quadrillage, axes, conservation, mediatrice, surAxe];
