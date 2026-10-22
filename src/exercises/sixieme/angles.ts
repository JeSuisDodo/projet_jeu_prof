import type { Skill } from '../types';
import { byLevel, deg, distinctInts, fixedChoice, fr, makeChoice, num, numAnswer, skill } from './outils';

/** Angles : vocabulaire, nature, angles adjacents, horloge et fractions de tour, bissectrice. */

const NATURES = ['Aigu', 'Droit', 'Obtus', 'Plat'];

const nature: Skill = skill('nature-angle', 'Reconnaître la nature d’un angle', (rng, level) => {
  const kind = rng.int(0, 3);
  const a = kind === 1 ? 90 : kind === 3 ? 180 : kind === 0 ? rng.int(byLevel(level, 10, 60, 80), 89) : rng.int(91, byLevel(level, 170, 130, 100));
  return {
    prompt: `Un angle mesure $${deg(a)}$. Quelle est sa nature ?`,
    answer: fixedChoice(NATURES, kind),
    hint: 'Aigu : entre $0^\\circ$ et $90^\\circ$ ; droit : $90^\\circ$ ; obtus : entre $90^\\circ$ et $180^\\circ$ ; plat : $180^\\circ$.',
    correction: [`$${deg(a)}$ : l'angle est ${NATURES[kind].toLowerCase()}.`],
  };
});

const sommet: Skill = skill('notation-angle', 'Lire la notation d’un angle', (rng, level) => {
  const [p, s, q] = rng.shuffle(['A', 'B', 'C', 'E', 'O', 'R', 'S', 'T', 'U']).slice(0, 3);
  if (level === 1 || rng.next() < 0.5) {
    return {
      prompt: `Quel est le sommet de l'angle $\\widehat{${p}${s}${q}}$ ?`,
      answer: makeChoice(rng, `$${s}$`, [`$${p}$`, `$${q}$`], () => '$O$'),
      hint: 'Dans la notation $\\widehat{xOy}$, la lettre du milieu est le sommet.',
      correction: [`La lettre du milieu est $${s}$ : c'est le sommet de l'angle.`],
    };
  }
  return {
    prompt: `Quels sont les côtés de l'angle $\\widehat{${p}${s}${q}}$ ?`,
    answer: makeChoice(rng, `$[${s}${p})$ et $[${s}${q})$`, [`$[${p}${s})$ et $[${q}${s})$`, `$[${s}${p}]$ et $[${s}${q}]$`, `$(${p}${q})$ et $(${s}${q})$`], () => `$[${p}${q})$ et $[${q}${p})$`),
    hint: 'Les côtés d’un angle sont deux demi-droites qui ont pour origine le sommet.',
    correction: [`Le sommet est $${s}$ ; les côtés sont les demi-droites $[${s}${p})$ et $[${s}${q})$.`],
  };
});

const adjacents: Skill = skill('angles-adjacents', 'Calculer un angle avec des angles adjacents', (rng, level) => {
  const total = rng.pick(byLevel(level, [90, 180], [90, 180], [180, 360]));
  if (level === 3 && total === 360) {
    const [a, b] = distinctInts(rng, 2, 40, 150);
    const c = 360 - a - b;
    return {
      prompt: `Trois angles de même sommet $O$ font à eux trois un tour complet. Deux d'entre eux mesurent $${deg(a)}$ et $${deg(b)}$. Combien mesure le troisième (en degrés) ?`,
      answer: numAnswer(c),
      hint: 'Un tour complet mesure $360^\\circ$.',
      correction: [`$360 - ${a} - ${b} = ${c}$, donc le troisième angle mesure $${deg(c)}$.`],
    };
  }
  const a = rng.int(10, total - 10);
  const b = total - a;
  const name = total === 90 ? 'un angle droit' : 'un angle plat';
  return {
    prompt: `Les angles $\\widehat{xOy}$ et $\\widehat{yOz}$ sont adjacents et forment ensemble ${name}. $\\widehat{xOy} = ${deg(a)}$. Combien mesure $\\widehat{yOz}$ (en degrés) ?`,
    answer: numAnswer(b),
    hint: `${total === 90 ? 'Un angle droit' : 'Un angle plat'} mesure $${deg(total)}$.`,
    correction: [`$\\widehat{yOz} = ${total} - ${a} = ${b}$, soit $${deg(b)}$.`],
  };
});

const tour: Skill = skill('fraction-tour', 'Mesurer un angle en fraction de tour', (rng, level) => {
  if (level === 1 || rng.next() < 0.5) {
    const h = rng.int(1, byLevel(level, 6, 11, 11));
    const angle = Math.min(h, 12 - h) * 30;
    return {
      prompt: `Quel angle (en degrés) forment les aiguilles d'une horloge à $${h}$ h pile ?`,
      answer: numAnswer(angle),
      hint: 'Le cadran (un tour, $360^\\circ$) est partagé en 12 heures : entre deux heures, il y a $30^\\circ$. On donne le plus petit angle.',
      correction: [`Il y a $${Math.min(h, 12 - h)}$ intervalles d'une heure entre les aiguilles : $${Math.min(h, 12 - h)} \\times 30 = ${angle}$, soit $${deg(angle)}$.`],
    };
  }
  const [n, d] = rng.pick(byLevel(level, [[1, 4]], [[1, 4], [1, 2], [3, 4], [1, 3]], [[1, 6], [1, 8], [2, 3], [3, 8], [5, 6], [1, 12]]) as [number, number][]);
  const angle = (360 * n) / d;
  return {
    prompt: `Combien de degrés mesure un angle de $${fr(n, d)}$ de tour ?`,
    answer: numAnswer(angle),
    hint: 'Un tour complet mesure $360^\\circ$.',
    correction: [`$${fr(n, d)} \\times 360 = ${angle}$, soit $${deg(angle)}$.`],
  };
});

const bissectrice: Skill = skill('bissectrice', 'Utiliser la bissectrice d’un angle', (rng, level) => {
  const half = rng.int(byLevel(level, 10, 12, 20), byLevel(level, 45, 80, 89)) + (level === 3 && rng.next() < 0.5 ? 0.5 : 0);
  const full = half * 2;
  const askHalf = rng.next() < 0.6;
  return {
    prompt: askHalf
      ? `La demi-droite $[Oz)$ est la bissectrice de l'angle $\\widehat{xOy}$, qui mesure $${deg(full)}$. Combien mesure $\\widehat{xOz}$ (en degrés) ?`
      : `La demi-droite $[Oz)$ est la bissectrice de l'angle $\\widehat{xOy}$ et $\\widehat{xOz} = ${deg(half)}$. Combien mesure $\\widehat{xOy}$ (en degrés) ?`,
    answer: numAnswer(askHalf ? half : full),
    hint: 'La bissectrice partage un angle en deux angles adjacents de même mesure.',
    correction: [askHalf ? `$${num(full)} \\div 2 = ${num(half)}$` : `$2 \\times ${num(half)} = ${num(full)}$`],
  };
});

export const ANGLES_SKILLS: Skill[] = [nature, sommet, adjacents, tour, bissectrice];
