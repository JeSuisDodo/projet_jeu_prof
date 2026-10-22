import { type Frac, frac } from '../fraction';
import type { Skill } from '../types';
import { dec, decFrac, num, unit } from './outils';

/** 5e : volumes du pavé, du prisme droit et du cylindre ; conversions de volumes et contenances. */

const pave: Skill = {
  id: '5e-volume-pave',
  name: 'Calculer le volume d’un pavé droit',
  generate(rng, level) {
    const [L, l, h] = [rng.int(2, 12), rng.int(2, 10), rng.int(1, 9)].map((v) => (level === 3 ? v + 0.5 : v));
    const cube = level === 1 && rng.next() < 0.4;
    const V = cube ? L * L * L : L * l * h;
    return {
      skill: '5e-volume-pave',
      level,
      prompt: cube ? `Quel est le volume (en cm³) d'un cube d'arête $${unit(L, 'cm')}$ ?` : `Quel est le volume (en cm³) d'un pavé droit de dimensions $${unit(L, 'cm')}$, $${unit(l, 'cm')}$ et $${unit(h, 'cm')}$ ?`,
      answer: num(V),
      hint: cube ? 'Volume d’un cube $= c \\times c \\times c$.' : 'Volume d’un pavé $= \\text{longueur} \\times \\text{largeur} \\times \\text{hauteur}$.',
      correction: [`$${cube ? `${L} \\times ${L} \\times ${L}` : `${dec(L)} \\times ${dec(l)} \\times ${dec(h)}`} = ${dec(V)}$`, `Le volume est $${unit(V, 'cm')}^3$.`],
    };
  },
};

const prisme: Skill = {
  id: '5e-volume-prisme',
  name: 'Calculer le volume d’un prisme droit',
  generate(rng, level) {
    const h = rng.int(2, 15);
    if (level === 1) {
      const base = rng.int(3, 40);
      return {
        skill: '5e-volume-prisme',
        level,
        prompt: `Un prisme droit a une base d'aire $${unit(base, 'cm')}^2$ et une hauteur de $${unit(h, 'cm')}$. Quel est son volume (en cm³) ?`,
        answer: num(base * h),
        hint: 'Volume d’un prisme droit $= \\text{aire de la base} \\times \\text{hauteur}$.',
        correction: [`$${base} \\times ${h} = ${base * h}$`, `Le volume est $${unit(base * h, 'cm')}^3$.`],
      };
    }
    const a = rng.int(2, 10);
    let b = rng.int(2, 10);
    if (level === 2 && (a * b) % 2) b++;
    const base = (a * b) / 2;
    const V = base * h;
    return {
      skill: '5e-volume-prisme',
      level,
      prompt: `Un prisme droit a pour base un triangle rectangle dont les côtés de l'angle droit mesurent $${unit(a, 'cm')}$ et $${unit(b, 'cm')}$. Sa hauteur est $${unit(h, 'cm')}$. Quel est son volume (en cm³) ?`,
      answer: num(V),
      hint: 'Calcule d’abord l’aire du triangle de base, puis multiplie par la hauteur du prisme.',
      correction: [`Aire de la base : $\\dfrac{${a} \\times ${b}}{2} = ${dec(base)}$ cm².`, `Volume : $${dec(base)} \\times ${h} = ${dec(V)}$ cm³.`],
    };
  },
};

const cylindre: Skill = {
  id: '5e-volume-cylindre',
  name: 'Calculer le volume d’un cylindre',
  generate(rng, level) {
    const r = rng.int(1, level === 1 ? 5 : 10);
    const h = rng.int(2, level === 3 ? 30 : 12);
    const diameter = level === 3 && rng.next() < 0.5;
    const base = Math.round(3.14 * r * r * 100) / 100;
    const V = Math.round(base * h * 100) / 100;
    return {
      skill: '5e-volume-cylindre',
      level,
      prompt: `Un cylindre a pour ${diameter ? `diamètre $${unit(2 * r, 'cm')}$` : `rayon $${unit(r, 'cm')}$`} et pour hauteur $${unit(h, 'cm')}$. Calcule son volume en cm³, avec $\\pi \\approx 3{,}14$.`,
      answer: num(V),
      hint: 'Volume d’un cylindre $= \\pi \\times r \\times r \\times \\text{hauteur}$.',
      correction: [...(diameter ? [`Le rayon vaut $${2 * r} \\div 2 = ${r}$ cm.`] : []), `Aire de la base : $3{,}14 \\times ${r} \\times ${r} = ${dec(base)}$ cm².`, `Volume : $${dec(base)} \\times ${h} = ${dec(V)}$ cm³.`],
    };
  },
};

/** Unités de volume, en cm³ : un litre vaut 1 dm³ = 1000 cm³ ; un millilitre vaut 1 cm³. */
const VOLUME_UNITS: [string, number][] = [
  ['\\text{m}^3', 1_000_000],
  ['\\text{dm}^3', 1000],
  ['\\text{cm}^3', 1],
  ['\\text{L}', 1000],
  ['\\text{dL}', 100],
  ['\\text{cL}', 10],
  ['\\text{mL}', 1],
  ['\\text{hL}', 100_000],
];

const conversion: Skill = {
  id: '5e-conversion-volumes',
  name: 'Convertir des volumes et des contenances',
  generate(rng, level) {
    const pairs: [number, number][] =
      level === 1
        ? [[3, 6], [3, 5], [1, 3], [3, 1]]
        : level === 2
          ? [[1, 2], [2, 1], [2, 6], [3, 2], [0, 1], [4, 6]]
          : [[0, 3], [0, 2], [2, 3], [7, 0], [5, 2], [6, 1], [0, 7]];
    const [i, j] = rng.pick(pairs);
    const [from, fromCm3] = VOLUME_UNITS[i];
    const [to, toCm3] = VOLUME_UNITS[j];
    const tenths = level === 1 ? rng.int(1, 20) * 10 : rng.int(1, 999);
    const value: Frac = frac(tenths * fromCm3, 10 * toCm3);
    return {
      skill: '5e-conversion-volumes',
      level,
      prompt: `Convertis : $${decFrac(frac(tenths, 10))}\\,${from} = \\ldots\\,${to}$.`,
      answer: { kind: 'number', value },
      hint: 'Retiens : $1\\text{ L} = 1\\text{ dm}^3 = 1000\\text{ cm}^3$ et $1\\text{ mL} = 1\\text{ cm}^3$. Entre deux unités de volume, on multiplie par 1000.',
      correction: [`$1\\,${from} = ${decFrac(frac(fromCm3, toCm3))}\\,${to}$`, `$${decFrac(frac(tenths, 10))}\\,${from} = ${decFrac(value)}\\,${to}$`],
    };
  },
};

const contenance: Skill = {
  id: '5e-contenance',
  name: 'Calculer la contenance d’un récipient',
  generate(rng, level) {
    const L = rng.int(2, 8) * 10;
    const l = rng.int(2, 6) * 10;
    const h = rng.int(2, 6) * 10;
    const cm3 = L * l * h;
    const fill = level === 3 ? rng.pick([2, 4, 5]) : 1;
    const liters = cm3 / 1000;
    if (level === 3) {
      const part = rng.int(1, fill - 1);
      const water = (liters * part) / fill;
      return {
        skill: '5e-contenance',
        level,
        prompt: `Un aquarium a la forme d'un pavé droit de $${L}\\text{ cm}$ sur $${l}\\text{ cm}$ et $${h}\\text{ cm}$ de haut. On le remplit aux $\\dfrac{${part}}{${fill}}$. Combien de litres d'eau contient-il ?`,
        answer: num(water),
        hint: 'Calcule le volume en cm³, convertis en litres ($1\\text{ L} = 1000\\text{ cm}^3$), puis prends la fraction demandée.',
        correction: [`$${L} \\times ${l} \\times ${h} = ${cm3}\\text{ cm}^3 = ${dec(liters)}\\text{ L}$`, `$\\dfrac{${part}}{${fill}} \\times ${dec(liters)} = ${dec(water)}\\text{ L}$`],
      };
    }
    return {
      skill: '5e-contenance',
      level,
      prompt: `Un aquarium a la forme d'un pavé droit de $${L}\\text{ cm}$ sur $${l}\\text{ cm}$ et $${h}\\text{ cm}$ de haut. Quelle est sa contenance en litres ?`,
      answer: num(liters),
      hint: level === 1 ? 'Calcule le volume en cm³, puis divise par 1000 : $1\\text{ L} = 1000\\text{ cm}^3$.' : 'Convertis d’abord les dimensions en dm : le volume en dm³ est directement la contenance en litres.',
      correction: [`$${L} \\times ${l} \\times ${h} = ${cm3}\\text{ cm}^3$`, `$${cm3}\\text{ cm}^3 = ${dec(liters)}\\text{ dm}^3 = ${dec(liters)}\\text{ L}$`],
    };
  },
};

export const VOLUMES_SKILLS: Skill[] = [pave, prisme, cylindre, conversion, contenance];
