import { type Frac, frac } from '../fraction';
import type { Rng } from '../rng';
import type { Level, Skill } from '../types';
import { dec, decFrac, num, unit } from './outils';

/** 5e : aires du triangle, du parallélogramme et du disque, périmètre du cercle, conversions d'aires. */

const PI = '\\pi \\approx 3{,}14';

const mesure = (rng: Rng, level: Level, min: number, max: number) => (level === 3 ? rng.int(min * 10, max * 10) / 10 : rng.int(min, max));

const triangle: Skill = {
  id: '5e-aire-triangle',
  name: 'Calculer l’aire d’un triangle',
  generate(rng, level) {
    const b = mesure(rng, level, 2, 15);
    let h = mesure(rng, level, 2, 12);
    if (level === 1 && (b * h) % 2) h++;
    const area = (b * h) / 2;
    const right = level === 1;
    return {
      skill: '5e-aire-triangle',
      level,
      prompt: right
        ? `Un triangle $ABC$ est rectangle en $A$ avec $AB = ${unit(b, 'cm')}$ et $AC = ${unit(h, 'cm')}$. Quelle est son aire (en cm²) ?`
        : `Dans le triangle $ABC$, le côté $[BC]$ mesure $${unit(b, 'cm')}$ et la hauteur issue de $A$ mesure $${unit(h, 'cm')}$. Quelle est l'aire du triangle (en cm²) ?`,
      answer: num(area),
      hint: 'Aire d’un triangle $= \\dfrac{\\text{base} \\times \\text{hauteur}}{2}$.',
      correction: [`$\\dfrac{${dec(b)} \\times ${dec(h)}}{2} = \\dfrac{${dec(b * h)}}{2} = ${dec(area)}$`, `L'aire est $${unit(area, 'cm')}^2$.`],
    };
  },
};

const parallelogramme: Skill = {
  id: '5e-aire-parallelogramme',
  name: 'Calculer l’aire d’un parallélogramme',
  generate(rng, level) {
    const b = mesure(rng, level, 3, 15);
    const h = mesure(rng, level, 2, 10);
    const side = Math.round((h + rng.int(1, 5) + (level === 3 ? 0.5 : 0)) * 10) / 10;
    const area = Math.round(b * h * 100) / 100;
    return {
      skill: '5e-aire-parallelogramme',
      level,
      prompt:
        level === 1
          ? `Un parallélogramme a un côté de $${unit(b, 'cm')}$ et une hauteur relative à ce côté de $${unit(h, 'cm')}$. Quelle est son aire (en cm²) ?`
          : `$ABCD$ est un parallélogramme avec $AB = ${unit(b, 'cm')}$, $AD = ${unit(side, 'cm')}$, et la hauteur relative à $[AB]$ mesure $${unit(h, 'cm')}$. Quelle est son aire (en cm²) ?`,
      answer: num(area),
      hint: 'Aire d’un parallélogramme $= \\text{côté} \\times \\text{hauteur relative à ce côté}$.',
      correction: [...(level === 1 ? [] : [`La longueur $AD$ ne sert pas : on utilise $[AB]$ et sa hauteur.`]), `$${dec(b)} \\times ${dec(h)} = ${dec(area)}$`, `L'aire est $${unit(area, 'cm')}^2$.`],
    };
  },
};

const cercle: Skill = {
  id: '5e-perimetre-cercle',
  name: 'Calculer le périmètre d’un cercle',
  generate(rng, level) {
    const r = level === 3 ? rng.int(5, 80) / 10 : rng.int(1, level === 1 ? 10 : 25);
    const diameter = level >= 2 && rng.next() < 0.5;
    const p = Math.round(2 * 3.14 * r * 1000) / 1000;
    return {
      skill: '5e-perimetre-cercle',
      level,
      prompt: `Un cercle a pour ${diameter ? `diamètre $${unit(2 * r, 'cm')}$` : `rayon $${unit(r, 'cm')}$`}. Calcule son périmètre en cm, avec $${PI}$.`,
      answer: num(p),
      hint: 'Périmètre d’un cercle $= 2 \\times \\pi \\times \\text{rayon} = \\pi \\times \\text{diamètre}$.',
      correction: [`$${diameter ? `3{,}14 \\times ${dec(2 * r)}` : `2 \\times 3{,}14 \\times ${dec(r)}`} = ${dec(p)}$`, `Le périmètre est d'environ $${unit(p, 'cm')}$.`],
    };
  },
};

const disque: Skill = {
  id: '5e-aire-disque',
  name: 'Calculer l’aire d’un disque',
  generate(rng, level) {
    const r = level === 3 ? rng.int(5, 60) / 10 : rng.int(1, level === 1 ? 10 : 20);
    const diameter = level >= 2 && rng.next() < 0.5;
    const a = Math.round(3.14 * r * r * 10000) / 10000;
    return {
      skill: '5e-aire-disque',
      level,
      prompt: `Un disque a pour ${diameter ? `diamètre $${unit(2 * r, 'cm')}$` : `rayon $${unit(r, 'cm')}$`}. Calcule son aire en cm², avec $${PI}$.`,
      answer: num(a),
      hint: 'Aire d’un disque $= \\pi \\times \\text{rayon} \\times \\text{rayon}$.',
      correction: [...(diameter ? [`Le rayon vaut $${dec(2 * r)} \\div 2 = ${dec(r)}$ cm.`] : []), `$3{,}14 \\times ${dec(r)} \\times ${dec(r)} = ${dec(a)}$`, `L'aire est d'environ $${unit(a, 'cm')}^2$.`],
    };
  },
};

const UNITS = ['km', 'hm', 'dam', 'm', 'dm', 'cm', 'mm'];

/** Conversion exacte : v (en dixièmes) d'une unité vers une autre, sur des puissances de 100. */
function convert(tenths: number, from: number, to: number): Frac {
  const shift = to - from;
  return shift >= 0 ? frac(tenths * 100 ** shift, 10) : frac(tenths, 10 * 100 ** -shift);
}

const conversion: Skill = {
  id: '5e-conversion-aires',
  name: 'Convertir des aires',
  generate(rng, level) {
    const gap = level === 1 ? 1 : level === 2 ? rng.pick([1, 2]) : rng.pick([2, 3]);
    const from = rng.int(0, UNITS.length - 1);
    const dir = from + gap <= UNITS.length - 1 && (from - gap < 0 || rng.next() < 0.5) ? 1 : -1;
    const to = from + dir * gap;
    const tenths = level === 1 ? rng.int(1, 30) * 10 : rng.int(1, 999);
    const value = convert(tenths, from, to);
    const start = frac(tenths, 10);
    return {
      skill: '5e-conversion-aires',
      level,
      prompt: `Convertis : $${decFrac(start)}\\text{ ${UNITS[from]}}^2 = \\ldots\\text{ ${UNITS[to]}}^2$.`,
      answer: { kind: 'number', value },
      hint: 'Pour les aires, on passe d’une unité à la suivante en multipliant (ou divisant) par 100.',
      correction: [
        `De $\\text{${UNITS[from]}}^2$ à $\\text{${UNITS[to]}}^2$, on ${dir > 0 ? 'multiplie' : 'divise'} par $${100 ** gap}$.`,
        `$${decFrac(start)}\\text{ ${UNITS[from]}}^2 = ${decFrac(value)}\\text{ ${UNITS[to]}}^2$`,
      ],
    };
  },
};

const composee: Skill = {
  id: '5e-aire-composee',
  name: 'Calculer l’aire d’une figure composée',
  generate(rng, level) {
    const L = rng.int(4, 12);
    const l = rng.int(2, 8);
    if (level === 1) {
      const h = rng.int(1, 4) * 2;
      const area = L * l + (L * h) / 2;
      return {
        skill: '5e-aire-composee',
        level,
        prompt: `Une maison dessinée est formée d'un rectangle de $${unit(L, 'cm')}$ sur $${unit(l, 'cm')}$ surmonté d'un toit triangulaire de base $${unit(L, 'cm')}$ et de hauteur $${unit(h, 'cm')}$. Quelle est l'aire totale (en cm²) ?`,
        answer: num(area),
        hint: 'Additionne l’aire du rectangle et celle du triangle.',
        correction: [`Rectangle : $${L} \\times ${l} = ${L * l}$ ; triangle : $\\dfrac{${L} \\times ${h}}{2} = ${(L * h) / 2}$.`, `Total : $${L * l} + ${(L * h) / 2} = ${area}$ cm².`],
      };
    }
    if (level === 2) {
      const c = rng.int(1, Math.min(L, l) - 1);
      const area = L * l - c * c;
      return {
        skill: '5e-aire-composee',
        level,
        prompt: `On découpe un carré de $${unit(c, 'cm')}$ de côté dans le coin d'un rectangle de $${unit(L, 'cm')}$ sur $${unit(l, 'cm')}$. Quelle est l'aire de la figure restante (en cm²) ?`,
        answer: num(area),
        hint: 'Soustrais l’aire du carré à celle du rectangle.',
        correction: [`$${L} \\times ${l} - ${c} \\times ${c} = ${L * l} - ${c * c} = ${area}$ cm²`],
      };
    }
    // Rectangle et demi-disque sur la largeur.
    const d = rng.pick([2, 4, 6, 8, 10]);
    const r = d / 2;
    const half = Math.round(((3.14 * r * r) / 2) * 1000) / 1000;
    const area = Math.round((L * d + half) * 1000) / 1000;
    return {
      skill: '5e-aire-composee',
      level,
      prompt: `Un terrain est formé d'un rectangle de $${unit(L, 'm')}$ sur $${unit(d, 'm')}$ et d'un demi-disque de diamètre $${unit(d, 'm')}$ collé sur la largeur. Quelle est son aire (en m²), avec $${PI}$ ?`,
      answer: num(area),
      hint: 'Aire du demi-disque $= \\dfrac{\\pi \\times r \\times r}{2}$, avec $r$ la moitié du diamètre.',
      correction: [`Rectangle : $${L} \\times ${d} = ${L * d}$ ; demi-disque : $\\dfrac{3{,}14 \\times ${r} \\times ${r}}{2} = ${dec(half)}$.`, `Total : $${L * d} + ${dec(half)} = ${dec(area)}$ m².`],
    };
  },
};

export const AIRES_SKILLS: Skill[] = [triangle, parallelogramme, cercle, disque, conversion, composee];
