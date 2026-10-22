import type { Skill } from '../types';
import { dec, decimal, fixedChoice, nearTie, num, round, skill } from './outils';

/** 3e : volumes des solides usuels, conversions, sections et sphère. */

type Solide = 'pave' | 'cylindre' | 'cone' | 'pyramide' | 'boule';

const volume = skill('3e-volume', 'Calculer le volume d’un solide', (rng, level) => {
  const kinds: Solide[] = level === 1 ? ['pave', 'pyramide', 'cylindre'] : ['pave', 'cylindre', 'cone', 'pyramide', 'boule'];
  let kind: Solide;
  let a: number;
  let b: number;
  let h: number;
  let v: number;
  do {
    kind = rng.pick(kinds);
    a = rng.int(2, level === 3 ? 15 : 10);
    b = rng.int(2, 10);
    h = rng.int(2, 12) * (kind === 'pyramide' ? 3 : 1);
    v =
      kind === 'pave' ? a * b * h
      : kind === 'cylindre' ? Math.PI * a * a * h
      : kind === 'cone' ? (Math.PI * a * a * h) / 3
      : kind === 'pyramide' ? (a * b * h) / 3
      : (4 / 3) * Math.PI * a ** 3;
  } while (nearTie(v, 0));
  const exact = kind === 'pave' || kind === 'pyramide';
  const value = exact ? v : round(v);
  const data: Record<Solide, [string, string, string]> = {
    pave: [`un pavé droit de dimensions $${a}$ cm, $${b}$ cm et $${h}$ cm`, 'V = L \\times \\ell \\times h', `${a} \\times ${b} \\times ${h}`],
    cylindre: [`un cylindre de rayon $${a}$ cm et de hauteur $${h}$ cm`, 'V = \\pi r^2 h', `\\pi \\times ${a}^2 \\times ${h}`],
    cone: [`un cône de révolution de rayon $${a}$ cm et de hauteur $${h}$ cm`, 'V = \\frac{1}{3} \\pi r^2 h', `\\frac{1}{3} \\times \\pi \\times ${a}^2 \\times ${h}`],
    pyramide: [`une pyramide de base rectangulaire $${a}$ cm sur $${b}$ cm et de hauteur $${h}$ cm`, 'V = \\frac{1}{3} \\times \\mathcal{B} \\times h', `\\frac{1}{3} \\times ${a * b} \\times ${h}`],
    boule: [`une boule de rayon $${a}$ cm`, 'V = \\frac{4}{3} \\pi r^3', `\\frac{4}{3} \\times \\pi \\times ${a}^3`],
  };
  const [desc, formula, calc] = data[kind];
  return {
    prompt: `Calcule le volume ${desc.replace(/^une? /, (m) => (m === 'une ' ? 'd’une ' : 'd’un '))}, en cm³${exact ? '' : ', arrondi à l’unité'}.`,
    answer: num(value),
    hint: `$${formula}$`,
    correction: [`$${formula}$`, `$V = ${calc} ${exact ? '=' : '\\approx'} ${value}$ cm³`],
  };
});

const conversion = skill('3e-conversion-volume', 'Convertir des volumes et des contenances', (rng, level) => {
  const kind = rng.pick(level === 1 ? (['L-cm3', 'dm3-L'] as const) : (['L-cm3', 'm3-L', 'cm3-L', 'mL-cm3'] as const));
  const x = level === 3 ? rng.int(1, 99) / 10 : rng.int(1, 30);
  switch (kind) {
    case 'L-cm3':
      return { prompt: `Convertis $${dec(x)}$ L en cm³.`, answer: decimal(x * 1000), hint: '$1$ L $= 1$ dm³ $= 1\\,000$ cm³.', correction: [`$${dec(x)} \\times 1\\,000 = ${dec(x * 1000)}$ cm³`] };
    case 'dm3-L':
      return { prompt: `Convertis $${dec(x)}$ dm³ en L.`, answer: decimal(x), hint: '$1$ dm³ $= 1$ L.', correction: [`$${dec(x)}$ dm³ $= ${dec(x)}$ L`] };
    case 'm3-L':
      return { prompt: `Une piscine contient $${dec(x)}$ m³ d'eau. Combien de litres cela fait-il ?`, answer: decimal(x * 1000), hint: '$1$ m³ $= 1\\,000$ dm³ $= 1\\,000$ L.', correction: [`$${dec(x)} \\times 1\\,000 = ${dec(x * 1000)}$ L`] };
    case 'cm3-L': {
      const c = Math.round(x * 100);
      return { prompt: `Convertis $${c}$ cm³ en L.`, answer: decimal(c / 1000), hint: '$1\\,000$ cm³ $= 1$ L.', correction: [`$${c} \\div 1\\,000 = ${dec(c / 1000)}$ L`] };
    }
    case 'mL-cm3':
      return { prompt: `Une seringue contient $${dec(x)}$ mL. Quel est ce volume en cm³ ?`, answer: decimal(x), hint: '$1$ mL $= 1$ cm³.', correction: [`$${dec(x)}$ mL $= ${dec(x)}$ cm³`] };
  }
});

const SECTIONS: [string, string, string[]][] = [
  ['Un pavé droit est coupé par un plan parallèle à une face.', 'un rectangle', ['un triangle', 'un disque', 'un trapèze']],
  ['Un cylindre de révolution est coupé par un plan parallèle à sa base.', 'un disque', ['un rectangle', 'une ellipse', 'un triangle']],
  ['Un cylindre de révolution est coupé par un plan parallèle à son axe.', 'un rectangle', ['un disque', 'un triangle', 'un carré toujours']],
  ['Un cône de révolution est coupé par un plan parallèle à sa base.', 'un disque, réduction de la base', ['un triangle', 'un disque de même rayon que la base', 'un rectangle']],
  ['Une pyramide à base carrée est coupée par un plan parallèle à sa base.', 'un carré, réduction de la base', ['un triangle', 'un rectangle quelconque', 'un carré de même côté que la base']],
  ['Une sphère est coupée par un plan.', 'un cercle', ['un carré', 'un triangle', 'une droite']],
];

const section = skill('3e-section', 'Reconnaître la section d’un solide par un plan', (rng, level) => {
  const pool = level === 1 ? SECTIONS.slice(0, 3) : SECTIONS;
  const [ctx, right, wrong] = rng.pick(pool);
  const options = rng.shuffle([right, ...wrong]);
  return {
    prompt: `${ctx} Quelle est la nature de la section ?`,
    answer: fixedChoice(options, options.indexOf(right)),
    hint: 'Imagine qu’on coupe le solide avec une scie, puis regarde la forme de la face obtenue.',
    correction: [`La section est ${right}.`],
  };
});

const sphere = skill('3e-sphere', 'Calculer l’aire d’une sphère', (rng, level) => {
  let r: number;
  let v: number;
  do {
    r = rng.int(1, level === 1 ? 6 : 20);
    v = 4 * Math.PI * r * r;
  } while (nearTie(v, 0));
  const value = round(v);
  return {
    prompt: `Calcule l'aire d'une sphère de rayon $${r}$ cm, en cm², arrondie à l'unité.`,
    answer: num(value),
    hint: '$\\mathcal{A} = 4 \\pi r^2$',
    correction: [`$\\mathcal{A} = 4 \\times \\pi \\times ${r}^2 = ${4 * r * r}\\pi \\approx ${value}$ cm²`],
  };
});

export const ESPACE_3E: Skill[] = [volume, conversion, section, sphere];
