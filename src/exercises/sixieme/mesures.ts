import type { Rng } from '../rng';
import type { Level, Skill } from '../types';
import { byLevel, decimal, fix, makeChoice, num, numAnswer, skill } from './outils';

/** Grandeurs et mesures : longueurs et périmètres, aires, volumes. */

const LENGTHS = ['km', 'hm', 'dam', 'm', 'dm', 'cm', 'mm'];

/** Conversion dans un tableau d'unités où chaque rang vaut `base` fois le suivant (10, 100 pour les aires…). */
function conversion(rng: Rng, level: Level, units: string[], base: number, suffix: string) {
  const span = byLevel(level, 1, 2, 3);
  let i: number;
  let j: number;
  do {
    i = rng.int(0, units.length - 1);
    j = rng.int(0, units.length - 1);
  } while (i === j || Math.abs(i - j) > span);
  const v = decimal(rng, 0.1, byLevel(level, 99, 999, 999), byLevel(level, rng.int(0, 1), rng.int(0, 2), rng.int(1, 3)));
  const factor = base ** (j - i);
  const r = fix(v * factor);
  const u = (k: number) => `${units[k]}${suffix}`;
  return {
    prompt: `Convertis : $${num(v)}$ ${u(i)} $= \\ldots$ ${u(j)}`,
    answer: numAnswer(r),
    hint: `Dans le tableau de conversion, chaque unité vaut $${base}$ fois la suivante${base > 10 ? ` (une colonne de ${String(base).length - 1} chiffres par unité)` : ''}.`,
    correction: [`De ${u(i)} en ${u(j)}, on ${j > i ? 'multiplie' : 'divise'} par $${num(base ** Math.abs(j - i))}$.`, `$${num(v)}$ ${u(i)} $= ${num(r)}$ ${u(j)}`],
  };
}

const convLongueur: Skill = skill('conversion-longueur', 'Convertir des longueurs', (rng, level) => conversion(rng, level, LENGTHS, 10, ''));

const perimetre: Skill = skill('perimetre-polygone', 'Calculer le périmètre d’un polygone', (rng, level) => {
  const kind = rng.pick(byLevel(level, ['carre', 'rectangle'], ['rectangle', 'triangle', 'carre'], ['triangle', 'rectangle', 'pentagone']));
  const d = level === 1 ? 0 : 1;
  if (kind === 'carre') {
    const c = decimal(rng, 1, 20, d);
    return {
      prompt: `Calcule le périmètre (en cm) d'un carré de côté $${num(c)}$ cm.`,
      answer: numAnswer(fix(4 * c)),
      hint: 'Le périmètre est la longueur du tour de la figure : un carré a quatre côtés égaux.',
      correction: [`$P = 4 \\times ${num(c)} = ${num(fix(4 * c))}$ cm.`],
    };
  }
  if (kind === 'rectangle') {
    const L = decimal(rng, 3, 25, d);
    const l = decimal(rng, 1, L, d);
    const mixed = level === 3;
    const Lmm = mixed ? fix(L * 10) : L;
    const P = fix(2 * (L + l));
    return {
      prompt: mixed
        ? `Calcule le périmètre (en cm) d'un rectangle de longueur $${num(Lmm)}$ mm et de largeur $${num(l)}$ cm.`
        : `Calcule le périmètre (en cm) d'un rectangle de longueur $${num(L)}$ cm et de largeur $${num(l)}$ cm.`,
      answer: numAnswer(P),
      hint: mixed ? 'Attention : convertis d’abord les longueurs dans la même unité.' : 'Le périmètre d’un rectangle est $2 \\times (L + \\ell)$.',
      correction: [...(mixed ? [`$${num(Lmm)}$ mm $= ${num(L)}$ cm.`] : []), `$P = 2 \\times (${num(L)} + ${num(l)}) = ${num(P)}$ cm.`],
    };
  }
  const n = kind === 'triangle' ? 3 : 5;
  const sides = Array.from({ length: n }, () => decimal(rng, 1, 12, d));
  const P = fix(sides.reduce((a, b) => a + b, 0));
  return {
    prompt: `Un ${kind === 'triangle' ? 'triangle' : 'pentagone'} a des côtés de $${sides.map(num).join('$ cm, $')}$ cm. Calcule son périmètre (en cm).`,
    answer: numAnswer(P),
    hint: 'Additionne les longueurs de tous les côtés.',
    correction: [`$P = ${sides.map(num).join(' + ')} = ${num(P)}$ cm.`],
  };
});

const perimetreCercle: Skill = skill('perimetre-cercle', 'Calculer la longueur d’un cercle', (rng, level) => {
  const r = rng.int(1, byLevel(level, 10, 20, 30));
  const useDiameter = level === 1 || rng.next() < 0.4;
  const half = level === 3 && rng.next() < 0.4;
  const full = fix(2 * r * 3.14);
  const value = half ? fix(full / 2) : full;
  return {
    prompt: `${half ? 'Calcule la longueur d’un demi-cercle' : 'Calcule le périmètre d’un cercle'} de ${useDiameter ? `diamètre $${2 * r}$` : `rayon $${r}$`} cm, en prenant $\\pi \\approx 3{,}14$ (en cm).`,
    answer: numAnswer(value),
    hint: 'Le périmètre d’un cercle est $\\pi \\times D$, ou $2 \\times \\pi \\times r$.',
    correction: [`$P \\approx 3{,}14 \\times ${2 * r} = ${num(full)}$ cm.`, ...(half ? [`Le demi-cercle mesure $${num(full)} \\div 2 = ${num(value)}$ cm.`] : [])],
  };
});

const coteManquant: Skill = skill('cote-manquant', 'Retrouver un côté à partir du périmètre', (rng, level) => {
  const d = level === 1 ? 0 : 1;
  if (level === 1 || rng.next() < 0.3) {
    const c = decimal(rng, 1, 25, d);
    return {
      prompt: `Un carré a un périmètre de $${num(fix(4 * c))}$ cm. Quelle est la longueur de son côté (en cm) ?`,
      answer: numAnswer(c),
      hint: 'Le périmètre d’un carré, c’est quatre fois son côté.',
      correction: [`$${num(fix(4 * c))} \\div 4 = ${num(c)}$ cm.`],
    };
  }
  const L = decimal(rng, 4, 30, d);
  const l = decimal(rng, 1, L - 0.5, d);
  const P = fix(2 * (L + l));
  return {
    prompt: `Un rectangle a un périmètre de $${num(P)}$ cm et une longueur de $${num(L)}$ cm. Quelle est sa largeur (en cm) ?`,
    answer: numAnswer(l),
    hint: 'La moitié du périmètre est égale à la longueur plus la largeur.',
    correction: [`Demi-périmètre : $${num(P)} \\div 2 = ${num(fix(L + l))}$ cm.`, `Largeur : $${num(fix(L + l))} - ${num(L)} = ${num(l)}$ cm.`],
  };
});

const AREAS = ['km', 'hm', 'dam', 'm', 'dm', 'cm', 'mm'];

const convAire: Skill = skill('conversion-aire', 'Convertir des aires', (rng, level) => {
  if (level === 3 && rng.next() < 0.4) {
    const ha = decimal(rng, 0.1, 50, rng.int(0, 2));
    return {
      prompt: `Convertis : $${num(ha)}$ ha $= \\ldots$ m²`,
      answer: numAnswer(fix(ha * 10_000)),
      hint: 'Un hectare est l’aire d’un carré de $100$ m de côté : $1$ ha $= 10\\,000$ m².',
      correction: [`$${num(ha)} \\times 10\\,000 = ${num(fix(ha * 10_000))}$ m².`],
    };
  }
  return conversion(rng, level === 3 ? 2 : 1, AREAS, 100, '²');
});

const aireRectangle: Skill = skill('aire-rectangle', 'Calculer l’aire d’un rectangle ou d’un carré', (rng, level) => {
  const d = byLevel(level, 0, 1, 1);
  const square = rng.next() < 0.35;
  const L = decimal(rng, 2, byLevel(level, 12, 20, 30), d);
  const l = square ? L : decimal(rng, 1, L, d);
  const A = fix(L * l);
  return {
    prompt: square ? `Calcule l'aire (en cm²) d'un carré de côté $${num(L)}$ cm.` : `Calcule l'aire (en cm²) d'un rectangle de longueur $${num(L)}$ cm et de largeur $${num(l)}$ cm.`,
    answer: numAnswer(A),
    hint: square ? 'Aire d’un carré : côté × côté.' : 'Aire d’un rectangle : longueur × largeur.',
    correction: [`$${num(L)} \\times ${num(l)} = ${num(A)}$ cm².`],
  };
});

const aireTriangle: Skill = skill('aire-triangle', 'Calculer l’aire d’un triangle', (rng, level) => {
  const b = decimal(rng, 2, 20, level === 3 ? 1 : 0);
  const h = decimal(rng, 2, 15, level === 3 ? 1 : 0);
  const A = fix((b * h) / 2);
  const right = level === 1;
  return {
    prompt: right
      ? `Un triangle $ABC$ est rectangle en $A$, avec $AB = ${num(b)}$ cm et $AC = ${num(h)}$ cm. Calcule son aire (en cm²).`
      : `Un triangle a un côté de $${num(b)}$ cm, et la hauteur relative à ce côté mesure $${num(h)}$ cm. Calcule son aire (en cm²).`,
    answer: numAnswer(A),
    hint: right ? 'Un triangle rectangle est la moitié d’un rectangle.' : 'Aire d’un triangle : $\\frac{\\text{côté} \\times \\text{hauteur relative}}{2}$.',
    correction: [`$\\frac{${num(b)} \\times ${num(h)}}{2} = ${num(A)}$ cm².`],
  };
});

const aireDisque: Skill = skill('aire-disque', 'Calculer l’aire d’un disque', (rng, level) => {
  const r = rng.int(1, byLevel(level, 5, 10, 20));
  const diam = level === 3 && rng.next() < 0.5;
  const A = fix(3.14 * r * r);
  return {
    prompt: `Calcule l'aire (en cm²) d'un disque de ${diam ? `diamètre $${2 * r}$` : `rayon $${r}$`} cm, en prenant $\\pi \\approx 3{,}14$.`,
    answer: numAnswer(A),
    hint: 'Aire d’un disque : $\\pi \\times r \\times r$. Attention à bien utiliser le rayon.',
    correction: [...(diam ? [`Le rayon vaut $${2 * r} \\div 2 = ${r}$ cm.`] : []), `$A \\approx 3{,}14 \\times ${r} \\times ${r} = ${num(A)}$ cm².`],
  };
});

const aireComposee: Skill = skill('aire-composee', 'Calculer l’aire d’une figure composée', (rng, level) => {
  const L = rng.int(6, byLevel(level, 12, 15, 20));
  const l = rng.int(4, L);
  const c = rng.int(1, Math.min(l, L) - 2);
  const kind = byLevel(level, 'trou', rng.pick(['trou', 'toit']), rng.pick(['toit', 'demi']));
  if (kind === 'trou') {
    const A = L * l - c * c;
    return {
      prompt: `Dans un rectangle de $${L}$ m sur $${l}$ m, on découpe un carré de $${c}$ m de côté. Quelle est l'aire de la partie restante (en m²) ?`,
      answer: numAnswer(A),
      hint: 'Calcule l’aire du rectangle, puis enlève celle du carré.',
      correction: [`$${L} \\times ${l} - ${c} \\times ${c} = ${L * l} - ${c * c} = ${A}$ m².`],
    };
  }
  if (kind === 'toit') {
    const h = rng.int(2, 8);
    const A = fix(L * l + (L * h) / 2);
    return {
      prompt: `La façade d'une maison est formée d'un rectangle de $${L}$ m sur $${l}$ m surmonté d'un triangle de base $${L}$ m et de hauteur $${h}$ m. Quelle est l'aire de la façade (en m²) ?`,
      answer: numAnswer(A),
      hint: 'Additionne l’aire du rectangle et celle du triangle.',
      correction: [`Rectangle : $${L} \\times ${l} = ${L * l}$ m².`, `Triangle : $\\frac{${L} \\times ${h}}{2} = ${num((L * h) / 2)}$ m².`, `Total : $${num(A)}$ m².`],
    };
  }
  const r = rng.int(1, 5);
  const side = 2 * r;
  const A = fix(side * l + (3.14 * r * r) / 2);
  return {
    prompt: `Une figure est formée d'un rectangle de $${side}$ cm sur $${l}$ cm et d'un demi-disque de diamètre $${side}$ cm collé sur un côté de $${side}$ cm. Calcule son aire en prenant $\\pi \\approx 3{,}14$ (en cm²).`,
    answer: numAnswer(A),
    hint: 'Aire du demi-disque : la moitié de $\\pi \\times r \\times r$.',
    correction: [`Rectangle : $${side} \\times ${l} = ${side * l}$ cm².`, `Demi-disque : $3{,}14 \\times ${r} \\times ${r} \\div 2 = ${num((3.14 * r * r) / 2)}$ cm².`, `Total : $${num(A)}$ cm².`],
  };
});

const SOLIDES: [string, string][] = [
  ['Il a 6 faces qui sont toutes des carrés.', 'un cube'],
  ['Il a 6 faces rectangulaires.', 'un pavé droit'],
  ['Il a deux faces qui sont des disques et une face courbe.', 'un cylindre'],
  ['Il a une base en forme de disque et un sommet.', 'un cône'],
  ['Il a une base carrée et 4 faces triangulaires qui se rejoignent en un sommet.', 'une pyramide'],
  ['Tous ses points sont à la même distance de son centre.', 'une boule'],
];

const reconnaitreSolide: Skill = skill('reconnaitre-solide', 'Reconnaître un solide', (rng, level) => {
  const [text, good] = rng.pick(byLevel(level, SOLIDES.slice(0, 3), SOLIDES.slice(0, 5), SOLIDES));
  return {
    prompt: `Quel solide est décrit ? « ${text} »`,
    answer: makeChoice(rng, good, SOLIDES.map(([, n]) => n).filter((n) => n !== good), () => 'un prisme'),
    hint: 'Pense aux faces : planes ou courbes, rectangulaires, carrées, triangulaires, en disque ?',
    correction: [`C'est ${good}.`],
  };
});

const ELEMENTS: [string, string, number][] = [
  ['faces', 'un pavé droit', 6],
  ['arêtes', 'un pavé droit', 12],
  ['sommets', 'un pavé droit', 8],
  ['faces', 'un cube', 6],
  ['arêtes', 'un cube', 12],
  ['sommets', 'un cube', 8],
  ['faces', 'une pyramide à base carrée', 5],
  ['arêtes', 'une pyramide à base carrée', 8],
  ['sommets', 'une pyramide à base carrée', 5],
];

const elements: Skill = skill('elements-solide', 'Compter faces, arêtes et sommets', (rng, level) => {
  const [what, solid, n] = rng.pick(byLevel(level, ELEMENTS.slice(0, 6), ELEMENTS.slice(0, 6), ELEMENTS));
  return {
    prompt: `Combien ${what === 'arêtes' ? 'd’' : 'de '}${what} ${solid} a-t-${solid.startsWith('une') ? 'elle' : 'il'} ?`,
    answer: numAnswer(n),
    hint: 'Une face est une surface plane ; une arête est le segment où deux faces se rencontrent ; un sommet est un « coin ».',
    correction: [`${solid.charAt(0).toUpperCase()}${solid.slice(1)} a $${n}$ ${what}.`],
  };
});

const volumePave: Skill = skill('volume-pave', 'Calculer le volume d’un pavé droit', (rng, level) => {
  const d = level === 3 ? 1 : 0;
  const cube = level === 1 && rng.next() < 0.4;
  const L = decimal(rng, 2, 12, d);
  const l = cube ? L : decimal(rng, 1, 10, d);
  const h = cube ? L : decimal(rng, 1, 10, d);
  const V = fix(L * l * h);
  if (level >= 2 && rng.next() < 0.35) {
    const Li = rng.int(2, 12);
    const li = rng.int(2, 10);
    const hi = rng.int(2, 10);
    return {
      prompt: `Un pavé droit a un volume de $${Li * li * hi}$ cm³, une longueur de $${Li}$ cm et une largeur de $${li}$ cm. Quelle est sa hauteur (en cm) ?`,
      answer: numAnswer(hi),
      hint: 'Volume = longueur × largeur × hauteur.',
      correction: [`$${Li} \\times ${li} = ${Li * li}$`, `$${Li * li * hi} \\div ${Li * li} = ${hi}$ cm.`],
    };
  }
  return {
    prompt: cube ? `Calcule le volume (en cm³) d'un cube d'arête $${num(L)}$ cm.` : `Calcule le volume (en cm³) d'un pavé droit de dimensions $${num(L)}$ cm, $${num(l)}$ cm et $${num(h)}$ cm.`,
    answer: numAnswer(V),
    hint: 'Volume d’un pavé droit : longueur × largeur × hauteur.',
    correction: [`$${num(L)} \\times ${num(l)} \\times ${num(h)} = ${num(V)}$ cm³.`],
  };
});

/** Unités de volume et de contenance, en cm³ (1 L = 1 dm³ = 1 000 cm³). */
const VOLUMES: [string, number][] = [
  ['m³', 1e6],
  ['dm³', 1000],
  ['L', 1000],
  ['dL', 100],
  ['cL', 10],
  ['cm³', 1],
  ['mL', 1],
];

const convVolume: Skill = skill('conversion-volume', 'Convertir volumes et contenances', (rng, level) => {
  const pool = byLevel(
    level,
    [['L', 'cL'], ['L', 'mL'], ['L', 'dL']],
    [['L', 'cm³'], ['dm³', 'L'], ['cL', 'mL'], ['mL', 'L'], ['cm³', 'mL']],
    [['m³', 'L'], ['cm³', 'L'], ['dm³', 'cm³'], ['L', 'm³'], ['mL', 'dL']],
  );
  const [from, to] = rng.pick(pool);
  const f = VOLUMES.find(([u]) => u === from)![1];
  const t = VOLUMES.find(([u]) => u === to)![1];
  const v = decimal(rng, 0.5, byLevel(level, 20, 500, 900), rng.int(0, 2));
  const r = fix((v * f) / t);
  return {
    prompt: `Convertis : $${num(v)}$ ${from} $= \\ldots$ ${to}`,
    answer: numAnswer(r),
    hint: 'Retiens : $1$ L $= 1$ dm³ $= 1\\,000$ cm³ et $1$ mL $= 1$ cm³.',
    correction: [`$${num(v)}$ ${from} $= ${num(r)}$ ${to}`],
  };
});

export const PERIMETRES_SKILLS: Skill[] = [convLongueur, perimetre, perimetreCercle, coteManquant];
export const AIRES_SKILLS: Skill[] = [convAire, aireRectangle, aireTriangle, aireDisque, aireComposee];
export const SOLIDES_SKILLS: Skill[] = [reconnaitreSolide, elements, volumePave, convVolume];
