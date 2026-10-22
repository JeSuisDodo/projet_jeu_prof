import type { Skill } from '../types';
import { bound, dec, decText, fixedChoice, numDec, skill } from './util';

/** Chapitre « Proportionnalité » (4e) : quatrième proportionnelle, pourcentages, échelles. */

const quatrieme = skill('4e-quatrieme-proportionnelle', 'Calculer une quatrième proportionnelle', (rng, level) => {
  const a = rng.int(2, bound(level, 9, 15, 25));
  const unit = level === 1 ? rng.int(2, 9) : rng.int(3, 40) / (level === 2 ? 2 : 4);
  const b = Math.round(a * unit * 100) / 100;
  const c = rng.int(2, bound(level, 12, 20, 40));
  const value = Math.round(unit * c * 100) / 100;
  const ctx = rng.pick([
    { q: `${a} cahiers coûtent ${decText(b)} €. Combien coûtent ${c} cahiers, en euros ?`, u: '€', x1: a, x2: c },
    { q: `Pour ${a} personnes, une recette demande ${decText(b)} dL de lait. Combien de dL de lait faut-il pour ${c} personnes ?`, u: 'dL', x1: a, x2: c },
    { q: `Une voiture consomme ${decText(b)} L d’essence pour ${a * 10} km. Combien consomme-t-elle pour ${c * 10} km, en litres ?`, u: 'L', x1: a * 10, x2: c * 10 },
  ]);
  return {
    prompt: ctx.q,
    answer: numDec(value),
    hint: 'Les grandeurs sont proportionnelles : utilise le produit en croix ou passe par l’unité.',
    correction: [`$\\dfrac{${dec(b)} \\times ${ctx.x2}}{${ctx.x1}} = ${dec(value)}$ ${ctx.u}`],
  };
});

const pourcentageDe = skill('4e-pourcentage', 'Appliquer un pourcentage', (rng, level) => {
  const p = rng.pick(level === 1 ? [10, 20, 25, 50, 75] : level === 2 ? [5, 15, 30, 40, 60, 12] : [3, 7, 17, 35, 45, 85]);
  const n = level === 1 ? rng.int(2, 30) * 4 : rng.int(10, 200) * (level === 3 ? 1 : 5);
  const value = (p * n) / 100;
  return {
    prompt: rng.pick([
      `Dans un collège de ${n} élèves, ${p} % viennent à vélo. Combien d’élèves viennent à vélo ?`,
      `Calcule ${p} % de ${n}.`,
      `Un club de ${n} adhérents compte ${p} % de licenciés en compétition. Combien sont en compétition ?`,
    ]),
    answer: numDec(value),
    hint: `Prendre $${p}\\,\\%$ d’un nombre, c’est le multiplier par $\\frac{${p}}{100}$.`,
    correction: [`$\\frac{${p}}{100} \\times ${n} = ${dec(value)}$`],
  };
});

const evolution = skill('4e-evolution', 'Augmenter ou diminuer d’un pourcentage', (rng, level) => {
  const p = rng.pick(level === 1 ? [10, 20, 50] : level === 2 ? [5, 15, 25, 30] : [4, 12, 35, 8, 18]);
  const price = level === 1 ? rng.int(2, 30) * 10 : rng.int(4, 80) * 5;
  const up = rng.next() < 0.5;
  const change = (p * price) / 100;
  const value = up ? price + change : price - change;
  return {
    prompt: up ? `Un abonnement à ${price} € augmente de ${p} %. Quel est son nouveau prix, en euros ?` : `Un jeu à ${price} € est soldé à −${p} %. Quel est son prix soldé, en euros ?`,
    answer: numDec(value),
    hint: `Calcule d’abord ${p} % du prix, puis ${up ? 'ajoute-le' : 'retire-le'}.`,
    correction: [`${up ? 'Augmentation' : 'Remise'} : $\\frac{${p}}{100} \\times ${price} = ${dec(change)}$ €.`, `Nouveau prix : $${price} ${up ? '+' : '-'} ${dec(change)} = ${dec(value)}$ €.`],
  };
});

const tableau = skill('4e-reconnaitre-proportionnalite', 'Reconnaître une situation de proportionnalité', (rng, level) => {
  const k = level === 1 ? rng.int(2, 9) : rng.int(3, 30) / 2;
  const xs = [rng.int(1, 4), rng.int(5, 8), rng.int(9, 12)];
  const ys = xs.map((x) => Math.round(x * k * 100) / 100);
  const prop = rng.next() < 0.5;
  if (!prop) {
    const i = rng.int(0, 2);
    ys[i] = Math.round((ys[i] + rng.pick([1, -1, 2]) * (level === 3 ? 0.5 : 1)) * 100) / 100;
  }
  const ratios = xs.map((x, i) => `\\frac{${dec(ys[i])}}{${x}} ${Math.abs(ys[i] / x - Math.round((ys[i] / x) * 1000) / 1000) < 1e-9 ? '=' : '\\approx'} ${dec(Math.round((ys[i] / x) * 1000) / 1000)}`);
  const table = `\\begin{array}{|c|c|c|c|} \\hline x & ${xs.join(' & ')} \\\\ \\hline y & ${ys.map(dec).join(' & ')} \\\\ \\hline \\end{array}`;
  return {
    prompt: `Ce tableau est-il un tableau de proportionnalité ? $${table}$`,
    answer: fixedChoice(['oui', 'non'], prop ? 0 : 1),
    hint: 'Calcule les quotients $\\frac{y}{x}$ : ils doivent être tous égaux.',
    correction: [`$${ratios.join(' \\quad ')}$`, prop ? `Les quotients sont tous égaux à $${dec(k)}$ : c’est un tableau de proportionnalité.` : 'Les quotients ne sont pas tous égaux : ce n’est pas un tableau de proportionnalité.'],
  };
});

const echelle = skill('4e-echelle', 'Utiliser une échelle', (rng, level) => {
  const scale = rng.pick(level === 1 ? [100, 1000, 10000] : [25000, 50000, 200000, 250]);
  const cm = level === 3 ? rng.int(11, 99) / 10 : rng.int(2, 15);
  const realCm = cm * scale;
  const unit = realCm >= 100000 ? 'km' : 'm';
  const value = unit === 'km' ? realCm / 100000 : realCm / 100;
  if (level === 3 && rng.next() < 0.5) {
    return {
      prompt: `Sur une carte, ${decText(cm)} cm représentent ${decText(value)} ${unit} en réalité. Quelle est l’échelle $\\frac{1}{n}$ de la carte ? Donne $n$.`,
      answer: numDec(scale),
      hint: `Convertis d’abord la distance réelle en cm, puis divise par la distance sur la carte.`,
      correction: [`$${dec(value)}\\ \\mathrm{${unit}} = ${dec(realCm)}\\ \\mathrm{cm}$`, `$n = ${dec(realCm)} \\div ${dec(cm)} = ${scale}$`],
    };
  }
  return {
    prompt: `Sur une carte à l’échelle $\\frac{1}{${scale}}$, deux villages sont à ${decText(cm)} cm l’un de l’autre. Quelle est la distance réelle, en ${unit} ?`,
    answer: numDec(value),
    hint: `À cette échelle, 1 cm sur la carte représente ${scale} cm en réalité.`,
    correction: [`$${dec(cm)} \\times ${scale} = ${dec(realCm)}\\ \\mathrm{cm} = ${dec(value)}\\ \\mathrm{${unit}}$`],
  };
});

export const PROPORTIONNALITE_SKILLS: Skill[] = [quatrieme, pourcentageDe, evolution, tableau, echelle];
