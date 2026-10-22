import { frac } from '../fraction';
import type { Skill } from '../types';
import { dec, decText, num, numDec, numF, skill, tex } from './util';

/** Chapitre « Pyramides et cônes » (4e) : volumes, conversions, description des solides. */

const pyramide = skill('4e-volume-pyramide', 'Calculer le volume d’une pyramide', (rng, level) => {
  const square = level === 1 || rng.next() < 0.4;
  const a = rng.int(2, level === 3 ? 15 : 10);
  const b = square ? a : rng.int(2, 12);
  // Hauteur multiple de 3 aux niveaux 1-2 pour un volume entier.
  const h = level === 3 ? rng.int(2, 20) : rng.int(1, 6) * 3;
  const B = a * b;
  const V = frac(B * h, 3);
  return {
    prompt: `Une pyramide a pour base un ${square ? `carré de côté ${a} cm` : `rectangle de ${a} cm sur ${b} cm`} et pour hauteur ${h} cm. Calcule son volume, en cm³${V.d === 1 ? '' : ' (valeur exacte, en fraction)'}.`,
    answer: numF(V),
    hint: '$V = \\dfrac{\\text{aire de la base} \\times \\text{hauteur}}{3}$',
    correction: [`Aire de la base : $${a} \\times ${b} = ${B}$ cm².`, `$V = \\dfrac{${B} \\times ${h}}{3} = ${tex(V)}$ cm³`],
  };
});

const cone = skill('4e-volume-cone', 'Calculer le volume d’un cône', (rng, level) => {
  const r = rng.int(1, level === 1 ? 6 : 10);
  const h = level === 1 ? rng.int(1, 5) * 3 : rng.int(2, 15);
  const k = frac(r * r * h, 3);
  return {
    prompt: `Un cône de révolution a un rayon de base de ${r} cm et une hauteur de ${h} cm. Son volume s’écrit $k\\pi$ cm³. Que vaut $k$${k.d === 1 ? '' : ' (en fraction)'} ?`,
    answer: numF(k),
    hint: '$V = \\dfrac{\\pi r^2 \\times h}{3}$',
    correction: [`$V = \\dfrac{\\pi \\times ${r}^2 \\times ${h}}{3} = \\dfrac{${r * r * h}\\pi}{3} = ${k.d === 1 ? `${k.n}\\pi` : `\\dfrac{${k.n}\\pi}{${k.d}}`}$ cm³, donc $k = ${tex(k)}$.`],
  };
});

const UNITS = ['mm^3', 'cm^3', 'dm^3', 'm^3'];

const conversion = skill('4e-conversion-volumes', 'Convertir des volumes et des contenances', (rng, level) => {
  const cases = [
    () => {
      const v = level === 1 ? rng.int(1, 9) * 1000 : rng.int(1, 999) * 10;
      return { q: `Convertis ${v} cm³ en litres.`, value: v / 1000, corr: `$1\\ \\mathrm{L} = 1\\ \\mathrm{dm}^3 = 1\\,000\\ \\mathrm{cm}^3$, donc $${v}\\ \\mathrm{cm}^3 = ${dec(v / 1000)}\\ \\mathrm{L}$.` };
    },
    () => {
      const v = level === 1 ? rng.int(1, 9) : rng.int(1, 99) / 10;
      return { q: `Convertis ${decText(v)} m³ en litres.`, value: v * 1000, corr: `$1\\ \\mathrm{m}^3 = 1\\,000\\ \\mathrm{dm}^3 = 1\\,000\\ \\mathrm{L}$, donc $${dec(v)}\\ \\mathrm{m}^3 = ${dec(v * 1000)}\\ \\mathrm{L}$.` };
    },
    () => {
      const v = rng.int(1, 50) * (level === 1 ? 10 : 1);
      return { q: `Convertis ${v} cL en cm³.`, value: v * 10, corr: `$1\\ \\mathrm{cL} = 10\\ \\mathrm{cm}^3$ (car $1\\ \\mathrm{mL} = 1\\ \\mathrm{cm}^3$), donc $${v}\\ \\mathrm{cL} = ${v * 10}\\ \\mathrm{cm}^3$.` };
    },
  ];
  if (level >= 2)
    cases.push(() => {
      // Unités voisines, ou deux rangs vers une unité plus petite (résultat jamais trop petit).
      const from = rng.int(0, 3);
      const to = from === 0 ? 1 : from === 3 ? rng.pick([1, 2]) : rng.pick([from - 1, from + 1, Math.max(from - 2, 0)]);
      const v = rng.int(1, 99) / (level === 3 ? 10 : 1);
      const value = Math.round(v * 1000 ** (from - to) * 1e6) / 1e6;
      return {
        q: `Convertis ${decText(v)} ${UNITS[from].replace('^3', '³')} en ${UNITS[to].replace('^3', '³')}.`,
        value,
        corr: `Chaque unité de volume vaut 1 000 fois la suivante : $${dec(v)}\\ \\mathrm{${UNITS[from].replace('^3', '')}}^3 = ${dec(value)}\\ \\mathrm{${UNITS[to].replace('^3', '')}}^3$.`,
      };
    });
  const c = rng.pick(cases)();
  return { prompt: c.q, answer: numDec(c.value), hint: '$1\\ \\mathrm{dm}^3 = 1\\ \\mathrm{L}$ et $1\\ \\mathrm{cm}^3 = 1\\ \\mathrm{mL}$. Entre deux unités de volume voisines, on multiplie ou divise par 1 000.', correction: [c.corr] };
});

const POLYGONS = [
  { n: 3, name: 'triangulaire' },
  { n: 4, name: 'carrée' },
  { n: 5, name: 'pentagonale' },
  { n: 6, name: 'hexagonale' },
  { n: 8, name: 'octogonale' },
];

const description = skill('4e-decrire-pyramide', 'Décrire une pyramide', (rng, level) => {
  const p = rng.pick(level === 1 ? POLYGONS.slice(0, 2) : POLYGONS);
  const what = rng.pick(level === 1 ? ['faces', 'sommets'] : ['faces', 'sommets', 'arêtes']);
  const value = what === 'arêtes' ? 2 * p.n : p.n + 1;
  return {
    prompt: `Combien une pyramide à base ${p.name} a-t-elle de ${what} ?`,
    answer: num(value),
    hint: 'Une pyramide a une base (un polygone à $n$ côtés), un sommet principal et des faces latérales triangulaires.',
    correction: [
      what === 'faces'
        ? `La base plus ${p.n} faces latérales triangulaires : $1 + ${p.n} = ${value}$ faces.`
        : what === 'sommets'
          ? `Les ${p.n} sommets de la base plus le sommet principal : $${p.n} + 1 = ${value}$ sommets.`
          : `${p.n} arêtes sur la base et ${p.n} arêtes latérales : $2 \\times ${p.n} = ${value}$ arêtes.`,
    ],
  };
});

export const ESPACE_SKILLS: Skill[] = [pyramide, cone, conversion, description];
