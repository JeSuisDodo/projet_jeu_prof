import type { Skill } from '../types';
import { deg, fixedChoice, latexChoice, num, unit } from './outils';

/** 5e : somme des angles d'un triangle, triangles particuliers, inégalité triangulaire. */

const NAMES = ['ABC', 'DEF', 'RST', 'MNP', 'IJK', 'XYZ'];

const troisieme: Skill = {
  id: '5e-somme-angles',
  name: 'Utiliser la somme des angles d’un triangle',
  generate(rng, level) {
    const [A, B, C] = rng.pick(NAMES).split('');
    let a: number;
    let b: number;
    do {
      a = level === 1 ? rng.int(3, 12) * 5 : rng.int(15, 120);
      b = level === 1 ? rng.int(3, 12) * 5 : rng.int(15, 120);
    } while (a + b >= 175);
    const c = 180 - a - b;
    if (level === 3 && rng.next() < 0.5) {
      // Triangle rectangle : un seul angle donné.
      const x = rng.int(10, 80);
      return {
        skill: '5e-somme-angles',
        level,
        prompt: `Le triangle $${A}${B}${C}$ est rectangle en $${A}$ et $\\widehat{${A}${B}${C}} = ${deg(x)}$. Combien mesure $\\widehat{${A}${C}${B}}$ (en degrés) ?`,
        answer: num(90 - x),
        hint: 'Dans un triangle rectangle, les deux angles aigus ont une somme de $90^\\circ$.',
        correction: [`$\\widehat{${B}${A}${C}} = 90^\\circ$`, `$180 - 90 - ${x} = ${90 - x}$, donc $\\widehat{${A}${C}${B}} = ${deg(90 - x)}$.`],
      };
    }
    return {
      skill: '5e-somme-angles',
      level,
      prompt: `Dans le triangle $${A}${B}${C}$, $\\widehat{${B}${A}${C}} = ${deg(a)}$ et $\\widehat{${A}${B}${C}} = ${deg(b)}$. Combien mesure $\\widehat{${A}${C}${B}}$ (en degrés) ?`,
      answer: num(c),
      hint: 'La somme des angles d’un triangle vaut $180^\\circ$.',
      correction: [`$180 - ${a} - ${b} = ${c}$`, `$\\widehat{${A}${C}${B}} = ${deg(c)}$`],
    };
  },
};

const isocele: Skill = {
  id: '5e-angles-isocele',
  name: 'Calculer les angles d’un triangle isocèle',
  generate(rng, level) {
    const [A, B, C] = rng.pick(NAMES).split('');
    const fromApex = level === 1 ? true : rng.next() < 0.5;
    if (level === 3 && rng.next() < 0.3) {
      return {
        skill: '5e-angles-isocele',
        level,
        prompt: `Le triangle $${A}${B}${C}$ est équilatéral. Combien mesure l'angle $\\widehat{${A}${B}${C}}$ (en degrés) ?`,
        answer: num(60),
        hint: 'Les trois angles d’un triangle équilatéral sont égaux.',
        correction: ['$180 \\div 3 = 60$', `$\\widehat{${A}${B}${C}} = 60^\\circ$`],
      };
    }
    if (fromApex) {
      const apex = level === 1 ? rng.int(2, 16) * 10 : rng.int(10, 85) * 2;
      const base = (180 - apex) / 2;
      return {
        skill: '5e-angles-isocele',
        level,
        prompt: `Le triangle $${A}${B}${C}$ est isocèle en $${A}$ et $\\widehat{${B}${A}${C}} = ${deg(apex)}$. Combien mesure $\\widehat{${A}${B}${C}}$ (en degrés) ?`,
        answer: num(base),
        hint: 'Dans un triangle isocèle, les deux angles à la base sont égaux.',
        correction: [`$180 - ${apex} = ${180 - apex}$`, `$${180 - apex} \\div 2 = ${base}$, donc $\\widehat{${A}${B}${C}} = \\widehat{${A}${C}${B}} = ${deg(base)}$.`],
      };
    }
    const base = rng.int(10, 85);
    const apex = 180 - 2 * base;
    return {
      skill: '5e-angles-isocele',
      level,
      prompt: `Le triangle $${A}${B}${C}$ est isocèle en $${A}$ et $\\widehat{${A}${B}${C}} = ${deg(base)}$. Combien mesure $\\widehat{${B}${A}${C}}$ (en degrés) ?`,
      answer: num(apex),
      hint: 'Les deux angles à la base sont égaux : $\\widehat{ABC} = \\widehat{ACB}$.',
      correction: [`$\\widehat{${A}${C}${B}} = \\widehat{${A}${B}${C}} = ${deg(base)}$`, `$180 - 2 \\times ${base} = ${apex}$, donc $\\widehat{${B}${A}${C}} = ${deg(apex)}$.`],
    };
  },
};

const inegalite: Skill = {
  id: '5e-inegalite-triangulaire',
  name: 'Utiliser l’inégalité triangulaire',
  generate(rng, level) {
    const [A, B, C] = rng.pick(NAMES).split('');
    const scale = level === 1 ? 1 : 10;
    const a = rng.int(2, 9) * scale + (level === 3 ? rng.int(0, 9) : 0);
    const b = rng.int(2, 9) * scale + (level === 3 ? rng.int(0, 9) : 0);
    const kind = level === 1 ? rng.pick([0, 1]) : rng.pick([0, 1, 2]);
    const c = kind === 0 ? a + b - rng.int(1, Math.min(a, b) - 1) : kind === 1 ? a + b + rng.int(1, 5) : a + b;
    const sides = [a, b, c].map((x) => x / (level === 1 ? 1 : 10));
    const [x, y, z] = rng.shuffle(sides);
    const longest = Math.max(x, y, z);
    const others = [x, y, z].filter((_, i, arr) => arr.indexOf(longest) !== i);
    const sum = Math.round((others[0] + others[1]) * 10) / 10;
    const options = ['Oui, un vrai triangle', 'Non, c’est impossible', 'Oui, mais il est aplati'];
    return {
      skill: '5e-inegalite-triangulaire',
      level,
      prompt: `Peut-on construire un triangle $${A}${B}${C}$ avec $${A}${B} = ${unit(x, 'cm')}$, $${B}${C} = ${unit(y, 'cm')}$ et $${A}${C} = ${unit(z, 'cm')}$ ?`,
      answer: fixedChoice(level === 1 ? options.slice(0, 2) : options, kind === 0 ? 0 : kind === 1 ? 1 : 2),
      hint: 'Compare la plus grande longueur à la somme des deux autres.',
      correction: [
        `Plus grande longueur : $${unit(longest, 'cm')}$ ; somme des deux autres : $${unit(sum, 'cm')}$.`,
        kind === 0
          ? `$${unit(longest, 'cm')} < ${unit(sum, 'cm')}$ : le triangle est constructible.`
          : kind === 1
            ? `$${unit(longest, 'cm')} > ${unit(sum, 'cm')}$ : le triangle n'est pas constructible.`
            : `$${unit(longest, 'cm')} = ${unit(sum, 'cm')}$ : les trois points sont alignés, le triangle est aplati.`,
      ],
    };
  },
};

const nature: Skill = {
  id: '5e-nature-triangle',
  name: 'Trouver la nature d’un triangle à partir de ses angles',
  generate(rng, level) {
    const [A, B, C] = rng.pick(NAMES).split('');
    let pick: number;
    let a: number;
    let b: number;
    for (;;) {
      const kinds: [number, number][] = [
        [90, rng.int(10, 80)], // rectangle
        [rng.int(10, 80) * 2, 0], // isocèle (le second angle est calculé)
        [60, 60], // équilatéral
        [90, 45], // isocèle rectangle
      ];
      pick = level === 1 ? rng.pick([0, 2]) : rng.int(0, 4);
      if (pick === 4) {
        a = rng.int(20, 100);
        b = rng.int(20, 100);
        const c = 180 - a - b;
        if (c > 5 && a !== b && b !== c && a !== c && a !== 90 && b !== 90 && c !== 90) break;
        continue;
      }
      [a, b] = kinds[pick];
      if (pick === 1) {
        if (a === 60 || a === 90) continue;
        b = (180 - a) / 2;
      }
      if (pick === 0 && b === 45) continue;
      break;
    }
    const c = 180 - a - b;
    const options = ['Rectangle', 'Isocèle', 'Équilatéral', 'Isocèle et rectangle', 'Quelconque'];
    const reason = [
      `Un angle mesure $90^\\circ$ et les deux autres sont différents.`,
      `Deux angles sont égaux : le triangle est isocèle.`,
      `Les trois angles mesurent $60^\\circ$.`,
      `Un angle droit et deux angles égaux de $45^\\circ$.`,
      `Les trois angles sont différents et aucun n'est droit.`,
    ][pick];
    const [x, y] = rng.shuffle([a, b]);
    return {
      skill: '5e-nature-triangle',
      level,
      prompt: `Dans le triangle $${A}${B}${C}$, $\\widehat{${A}} = ${deg(x)}$ et $\\widehat{${B}} = ${deg(y)}$. Quelle est la nature du triangle ?`,
      answer: fixedChoice(options, pick),
      hint: 'Calcule d’abord le troisième angle avec la somme $180^\\circ$.',
      correction: [`$\\widehat{${C}} = 180 - ${x} - ${y} = ${deg(c)}$`, reason],
    };
  },
};

const longueur: Skill = {
  id: '5e-longueur-possible',
  name: 'Trouver une longueur possible du troisième côté',
  generate(rng, level) {
    const a = rng.int(3, 12);
    const b = rng.int(a + 1, a + 10);
    const lo = b - a;
    const hi = a + b;
    const good = rng.int(lo + 1, hi - 1);
    const decoys = [lo, hi, hi + rng.int(1, 4), Math.max(1, lo - rng.int(1, 2))].filter((v) => v !== good && v > 0);
    return {
      skill: '5e-longueur-possible',
      level,
      prompt: `Dans un triangle (non aplati), deux côtés mesurent $${unit(a, 'cm')}$ et $${unit(b, 'cm')}$. Quelle longueur le troisième côté peut-il avoir ?`,
      answer: latexChoice(rng, unit(good, 'cm'), decoys.map((v) => unit(v, 'cm')), () => unit(hi + rng.int(5, 9), 'cm')),
      hint: 'Le troisième côté doit être plus petit que la somme des deux autres côtés, et plus grand que leur différence.',
      correction: [`Il faut $${b} - ${a} < \\ell < ${a} + ${b}$, c'est-à-dire $${lo} < \\ell < ${hi}$.`, `Seule $${unit(good, 'cm')}$ convient.`],
    };
  },
};

export const TRIANGLES_SKILLS: Skill[] = [troisieme, isocele, inegalite, nature, longueur];
