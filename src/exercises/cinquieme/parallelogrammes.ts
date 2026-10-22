import type { Skill } from '../types';
import { dec, deg, fixedChoice, num, unit, yesNo } from './outils';

/** 5e : propriétés du parallélogramme (côtés, angles, diagonales) et parallélogrammes particuliers. */

const NAMES = ['ABCD', 'EFGH', 'MNOP', 'RSTU', 'KLMN'];

const angles: Skill = {
  id: '5e-parallelogramme-angles',
  name: 'Calculer les angles d’un parallélogramme',
  generate(rng, level) {
    const [A, B, C, D] = rng.pick(NAMES).split('');
    const x = level === 1 ? rng.int(4, 16) * 10 : rng.int(20, 160);
    const ask = level === 1 ? rng.pick(['oppose', 'consecutif']) : rng.pick(['oppose', 'consecutif', 'consecutif']);
    const opposite = ask === 'oppose';
    const value = opposite ? x : 180 - x;
    const target = opposite ? `\\widehat{${B}${C}${D}}` : `\\widehat{${A}${B}${C}}`;
    if (level === 3 && rng.next() < 0.5) {
      // Somme des quatre angles.
      return {
        skill: '5e-parallelogramme-angles',
        level,
        prompt: `$${A}${B}${C}${D}$ est un parallélogramme avec $\\widehat{${D}${A}${B}} = ${deg(x)}$. Combien vaut la somme $\\widehat{${A}${B}${C}} + \\widehat{${B}${C}${D}}$ (en degrés) ?`,
        answer: num(180),
        hint: 'Les angles opposés sont égaux et deux angles consécutifs sont supplémentaires.',
        correction: [`$\\widehat{${A}${B}${C}} = 180 - ${x} = ${180 - x}$ et $\\widehat{${B}${C}${D}} = ${x}$.`, `La somme vaut $${180 - x} + ${x} = 180$.`],
      };
    }
    return {
      skill: '5e-parallelogramme-angles',
      level,
      prompt: `$${A}${B}${C}${D}$ est un parallélogramme avec $\\widehat{${D}${A}${B}} = ${deg(x)}$. Combien mesure $${target}$ (en degrés) ?`,
      answer: num(value),
      hint: 'Dans un parallélogramme, les angles opposés sont égaux et deux angles consécutifs sont supplémentaires.',
      correction: opposite
        ? [`$${target}$ est opposé à $\\widehat{${D}${A}${B}}$ : ils sont égaux.`, `$${target} = ${deg(x)}$`]
        : [`$${target}$ et $\\widehat{${D}${A}${B}}$ sont consécutifs : ils sont supplémentaires.`, `$${target} = 180 - ${x} = ${deg(value)}$`],
    };
  },
};

const cotes: Skill = {
  id: '5e-parallelogramme-cotes',
  name: 'Utiliser les côtés d’un parallélogramme',
  generate(rng, level) {
    const [A, B, C, D] = rng.pick(NAMES).split('');
    const ab = level === 3 ? rng.int(20, 120) / 10 : rng.int(3, 15);
    const bc = level === 3 ? rng.int(20, 120) / 10 : rng.int(2, 12);
    const per = Math.round(2 * (ab + bc) * 10) / 10;
    if (level === 1) {
      return {
        skill: '5e-parallelogramme-cotes',
        level,
        prompt: `$${A}${B}${C}${D}$ est un parallélogramme avec $${A}${B} = ${unit(ab, 'cm')}$ et $${B}${C} = ${unit(bc, 'cm')}$. Combien mesure $${C}${D}$ (en cm) ?`,
        answer: num(ab),
        hint: 'Les côtés opposés d’un parallélogramme ont la même longueur.',
        correction: [`$[${C}${D}]$ est opposé à $[${A}${B}]$ : $${C}${D} = ${A}${B} = ${unit(ab, 'cm')}$.`],
      };
    }
    if (rng.next() < 0.5) {
      return {
        skill: '5e-parallelogramme-cotes',
        level,
        prompt: `$${A}${B}${C}${D}$ est un parallélogramme avec $${A}${B} = ${unit(ab, 'cm')}$ et $${B}${C} = ${unit(bc, 'cm')}$. Quel est son périmètre (en cm) ?`,
        answer: num(per),
        hint: 'Les côtés opposés ont la même longueur : le périmètre vaut $2 \\times (AB + BC)$.',
        correction: [`$2 \\times (${dec(ab)} + ${dec(bc)}) = ${dec(per)}$`, `Le périmètre est $${unit(per, 'cm')}$.`],
      };
    }
    return {
      skill: '5e-parallelogramme-cotes',
      level,
      prompt: `$${A}${B}${C}${D}$ est un parallélogramme de périmètre $${unit(per, 'cm')}$ avec $${A}${B} = ${unit(ab, 'cm')}$. Combien mesure $${B}${C}$ (en cm) ?`,
      answer: num(bc),
      hint: 'Le demi-périmètre vaut $AB + BC$.',
      correction: [`Demi-périmètre : $${dec(per)} \\div 2 = ${dec(per / 2)}$`, `$${B}${C} = ${dec(per / 2)} - ${dec(ab)} = ${dec(bc)}$`],
    };
  },
};

const diagonales: Skill = {
  id: '5e-parallelogramme-diagonales',
  name: 'Utiliser les diagonales d’un parallélogramme',
  generate(rng, level) {
    const [A, B, C, D] = rng.pick(NAMES).split('');
    const full = level === 1 ? rng.int(2, 12) * 2 : rng.int(5, 40);
    const half = full / 2;
    const fromFull = level === 1 ? true : rng.next() < 0.5;
    const intro = `$${A}${B}${C}${D}$ est un parallélogramme de centre $O$`;
    if (fromFull)
      return {
        skill: '5e-parallelogramme-diagonales',
        level,
        prompt: `${intro} et $${A}${C} = ${unit(full, 'cm')}$. Combien mesure $${A}O$ (en cm) ?`,
        answer: num(half),
        hint: 'Les diagonales d’un parallélogramme se coupent en leur milieu.',
        correction: [`$O$ est le milieu de $[${A}${C}]$.`, `$${A}O = ${full} \\div 2 = ${dec(half)}$ cm`],
      };
    return {
      skill: '5e-parallelogramme-diagonales',
      level,
      prompt: `${intro} et $O${D} = ${unit(half, 'cm')}$. Combien mesure la diagonale $[${B}${D}]$ (en cm) ?`,
      answer: num(full),
      hint: 'Les diagonales d’un parallélogramme se coupent en leur milieu.',
      correction: [`$O$ est le milieu de $[${B}${D}]$, donc $${B}O = O${D}$.`, `$${B}${D} = 2 \\times ${dec(half)} = ${full}$ cm`],
    };
  },
};

const PROPRIETES: [string, boolean][] = [
  ['ses diagonales se coupent en leur milieu', true],
  ['ses côtés opposés sont parallèles deux à deux', true],
  ['ses côtés opposés ont la même longueur deux à deux (et il n’est pas croisé)', true],
  ['deux de ses côtés opposés sont parallèles et de même longueur (et il n’est pas croisé)', true],
  ['deux de ses côtés opposés sont parallèles', false],
  ['ses diagonales sont perpendiculaires', false],
  ['ses diagonales ont la même longueur', false],
  ['il a deux angles droits', false],
];

const reconnaitre: Skill = {
  id: '5e-reconnaitre-parallelogramme',
  name: 'Reconnaître un parallélogramme',
  generate(rng, level) {
    const pool = level === 1 ? PROPRIETES.slice(0, 2).concat(PROPRIETES.slice(4, 6)) : PROPRIETES;
    const [text, yes] = rng.pick(pool);
    return {
      skill: '5e-reconnaitre-parallelogramme',
      level,
      prompt: `Un quadrilatère vérifie : « ${text} ». Est-on sûr que c'est un parallélogramme ?`,
      answer: yesNo(yes),
      hint: 'Un quadrilatère est un parallélogramme si ses diagonales ont le même milieu, ou si ses côtés opposés sont parallèles (ou de même longueur) deux à deux.',
      correction: yes ? ['C’est une propriété caractéristique du parallélogramme.', 'Oui, c’est forcément un parallélogramme.'] : ['Un trapèze, un cerf-volant ou un quadrilatère quelconque peut vérifier cette propriété.', 'Non, ce n’est pas forcément un parallélogramme.'],
    };
  },
};

const PARTICULIERS: [string, number][] = [
  ['ses diagonales ont la même longueur', 0],
  ['il a un angle droit', 0],
  ['ses diagonales sont perpendiculaires', 1],
  ['deux de ses côtés consécutifs ont la même longueur', 1],
  ['ses diagonales sont perpendiculaires et de même longueur', 2],
  ['il a un angle droit et deux côtés consécutifs de même longueur', 2],
  ['ses côtés opposés ont la même longueur', 3],
];

const particuliers: Skill = {
  id: '5e-parallelogrammes-particuliers',
  name: 'Reconnaître un rectangle, un losange ou un carré',
  generate(rng, level) {
    const pool = level === 1 ? PARTICULIERS.slice(0, 4) : PARTICULIERS;
    const [text, kind] = rng.pick(pool);
    const options = ['Un rectangle', 'Un losange', 'Un carré', 'Rien de plus : un parallélogramme'];
    return {
      skill: '5e-parallelogrammes-particuliers',
      level,
      prompt: `Un parallélogramme vérifie : « ${text} ». Que peut-on en conclure ?`,
      answer: fixedChoice(options, kind),
      hint: 'Diagonales de même longueur ou angle droit : rectangle. Diagonales perpendiculaires ou côtés consécutifs égaux : losange. Les deux : carré.',
      correction: [kind === 3 ? 'Tout parallélogramme a ses côtés opposés de même longueur : on ne peut rien conclure de plus.' : `C'est ${options[kind].toLowerCase()}.`],
    };
  },
};

export const PARALLELOGRAMMES_SKILLS: Skill[] = [angles, cotes, diagonales, reconnaitre, particuliers];
