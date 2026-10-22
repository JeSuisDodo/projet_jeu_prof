import type { Skill } from '../types';
import { byLevel, decimal, distinctInts, fix, num, numAnswer, skill, table, yesNo } from './outils';

/** Proportionnalité : tableaux, quatrième proportionnelle, pourcentages, échelles. */

const reconnaitre: Skill = skill('tableau-proportionnalite', 'Reconnaître un tableau de proportionnalité', (rng, level) => {
  const k = level === 1 ? rng.int(2, 9) : level === 2 ? decimal(rng, 1.5, 9, 1) : decimal(rng, 0.5, 4, 2);
  const xs = distinctInts(rng, 4, 1, byLevel(level, 10, 15, 20)).sort((a, b) => a - b);
  const ys = xs.map((x) => fix(x * k));
  const yes = rng.next() < 0.5;
  if (!yes) {
    // Une seule case fausse, de peu : il faut vérifier chaque colonne.
    const i = rng.int(1, xs.length - 1);
    ys[i] = fix(ys[i] + rng.pick([1, -1, 0.5, 2]));
    if (ys[i] <= 0) ys[i] = fix(ys[i] + 3);
  }
  const ratios = xs.map((x, i) => fix(ys[i] / x));
  return {
    prompt: `Ce tableau est-il un tableau de proportionnalité ? $${table([xs.map(num), ys.map(num)])}$`,
    answer: yesNo(yes),
    hint: 'Calcule, pour chaque colonne, le quotient du nombre du bas par celui du haut : ils doivent tous être égaux.',
    correction: yes
      ? [`Pour chaque colonne, on multiplie par $${num(k)}$ : c'est un tableau de proportionnalité.`]
      : [`Les quotients ne sont pas tous égaux (par exemple $${num(ys[0])} \\div ${num(xs[0])} = ${num(ratios[0])}$ mais une autre colonne donne un résultat différent) : ce n'est pas un tableau de proportionnalité.`],
  };
});

const quatrieme: Skill = skill('quatrieme-proportionnelle', 'Calculer une quatrième proportionnelle', (rng, level) => {
  const unit = byLevel(level, rng.int(2, 9), decimal(rng, 0.5, 6, 2), decimal(rng, 0.2, 5, 2));
  const a = rng.int(2, byLevel(level, 5, 8, 9));
  let b = rng.int(2, byLevel(level, 10, 15, 25));
  if (b === a) b += 1;
  const pa = fix(a * unit);
  const pb = fix(b * unit);
  const [stuff, u] = rng.pick([
    ['kg de pommes', '€'],
    ['L de jus', '€'],
    ['mètres de tissu', '€'],
    ['cahiers', '€'],
  ]);
  const recipe = level >= 2 && rng.next() < 0.4;
  if (recipe) {
    const p1 = rng.pick([2, 4, 6]);
    let p2 = rng.pick([3, 5, 8, 9, 10]);
    if (p2 === p1) p2 += 1;
    const g = rng.int(2, 9) * 30;
    const res = fix((g / p1) * p2);
    return {
      prompt: `Une recette pour $${p1}$ personnes demande $${g}$ g de farine. Quelle masse de farine (en g) faut-il pour $${p2}$ personnes ?`,
      answer: numAnswer(res),
      hint: 'Cherche d’abord la quantité pour une personne, puis multiplie.',
      correction: [`Pour une personne : $${g} \\div ${p1} = ${num(g / p1)}$ g.`, `Pour $${p2}$ personnes : $${num(g / p1)} \\times ${p2} = ${num(res)}$ g.`],
    };
  }
  return {
    prompt: `$${a}$ ${stuff} coûtent $${num(pa)}$ ${u}. Combien coûtent $${b}$ ${stuff} (en €) ?`,
    answer: numAnswer(pb),
    hint: 'Le prix est proportionnel à la quantité : passe par le prix d’une unité.',
    correction: [`Une unité coûte $${num(pa)} \\div ${a} = ${num(unit)}$ €.`, `$${b} \\times ${num(unit)} = ${num(pb)}$ € .`],
  };
});

const coefficient: Skill = skill('coefficient', 'Compléter un tableau de proportionnalité', (rng, level) => {
  const k = byLevel(level, rng.int(2, 9), decimal(rng, 1.5, 6, 1), decimal(rng, 0.2, 3, 2));
  const xs = distinctInts(rng, 3, 1, 12).sort((a, b) => a - b);
  const ys = xs.map((x) => fix(x * k));
  const askCoef = rng.next() < 0.3;
  const i = rng.int(1, xs.length - 1);
  const top = level === 3 && rng.next() < 0.5;
  const shownX = xs.map((x, j) => (!askCoef && top && j === i ? '?' : num(x)));
  const shownY = ys.map((y, j) => (!askCoef && !top && j === i ? '?' : num(y)));
  return {
    prompt: askCoef
      ? `Dans ce tableau de proportionnalité, par quel nombre multiplie-t-on la première ligne pour obtenir la seconde ? $${table([shownX, shownY])}$`
      : `Ce tableau est un tableau de proportionnalité. Quel nombre remplace le point d'interrogation ? $${table([shownX, shownY])}$`,
    answer: numAnswer(askCoef ? k : top ? xs[i] : ys[i]),
    hint: `Le coefficient de proportionnalité s'obtient en divisant un nombre de la seconde ligne par le nombre au-dessus.`,
    correction: [
      `Coefficient : $${num(ys[0])} \\div ${num(xs[0])} = ${num(k)}$.`,
      askCoef ? `On multiplie par $${num(k)}$.` : top ? `$${num(ys[i])} \\div ${num(k)} = ${num(xs[i])}$` : `$${num(xs[i])} \\times ${num(k)} = ${num(ys[i])}$`,
    ],
  };
});

const pourcentage: Skill = skill('pourcentage', 'Appliquer un pourcentage', (rng, level) => {
  const p = rng.pick(byLevel(level, [10, 25, 50, 100], [5, 10, 20, 25, 50, 75], [12, 15, 30, 35, 40, 60, 85]));
  const total = byLevel(level, rng.int(1, 20) * 4 * 10, rng.int(1, 40) * 20, rng.int(2, 60) * 20);
  const res = fix((p * total) / 100);
  const ctx = rng.pick([`Dans un collège de $${total}$ élèves, $${p}\\,\\%$ sont demi-pensionnaires. Combien d'élèves sont demi-pensionnaires ?`, `Calcule $${p}\\,\\%$ de $${total}$.`, `Un jeu coûte $${total}$ €. Pendant les soldes, on obtient $${p}\\,\\%$ de réduction. Quel est le montant de la réduction (en €) ?`]);
  return {
    prompt: ctx,
    answer: numAnswer(res),
    hint: `Prendre $${p}\\,\\%$, c'est multiplier par $\\frac{${p}}{100}$.`,
    correction: [`$${total} \\times \\frac{${p}}{100} = ${num((total * p) / 100)}$`],
  };
});

const echelle: Skill = skill('echelle', 'Utiliser une échelle', (rng, level) => {
  if (level === 1) {
    const s = rng.pick([50, 100, 200]);
    const cm = rng.int(2, 15);
    const real = (cm * s) / 100;
    return {
      prompt: `Sur un plan à l'échelle $\\frac{1}{${s}}$, une pièce mesure $${cm}$ cm de long. Quelle est sa longueur réelle (en m) ?`,
      answer: numAnswer(real),
      hint: `À l'échelle $\\frac{1}{${s}}$, $1$ cm sur le plan représente $${s}$ cm en réalité.`,
      correction: [`$${cm} \\times ${s} = ${num(cm * s)}$ cm $= ${num(real)}$ m.`],
    };
  }
  const s = rng.pick([10_000, 25_000, 50_000, 100_000]);
  const cm = level === 2 ? rng.int(2, 12) : decimal(rng, 1, 15, 1);
  const real = fix((cm * s) / 100_000);
  const reverse = level === 3 && rng.next() < 0.5;
  if (reverse) {
    return {
      prompt: `Sur une carte à l'échelle $\\frac{1}{${num(s)}}$, quelle longueur (en cm) représente une distance réelle de $${num(real)}$ km ?`,
      answer: numAnswer(cm),
      hint: `Convertis d'abord la distance réelle en cm ($1$ km $= 100\\,000$ cm), puis divise par $${num(s)}$.`,
      correction: [`$${num(real)}$ km $= ${num(real * 100_000)}$ cm.`, `$${num(real * 100_000)} \\div ${num(s)} = ${num(cm)}$ cm.`],
    };
  }
  return {
    prompt: `Sur une carte à l'échelle $\\frac{1}{${num(s)}}$, deux villages sont à $${num(cm)}$ cm l'un de l'autre. Quelle est la distance réelle (en km) ?`,
    answer: numAnswer(real),
    hint: `$1$ cm sur la carte représente $${num(s)}$ cm en réalité ; et $1$ km $= 100\\,000$ cm.`,
    correction: [`$${num(cm)} \\times ${num(s)} = ${num(cm * s)}$ cm.`, `$${num(cm * s)}$ cm $= ${num(real)}$ km.`],
  };
});

const SITUATIONS: [string, boolean][] = [
  ['Le prix payé et le nombre de baguettes achetées (même prix pour chaque baguette).', true],
  ['La taille d’un enfant et son âge.', false],
  ['Le périmètre d’un carré et la longueur de son côté.', true],
  ['La quantité de farine et le nombre de crêpes réalisées avec la même recette.', true],
  ['La note d’un élève et le temps passé à réviser.', false],
  ['La distance parcourue à vitesse constante et la durée du trajet.', true],
  ['L’aire d’un carré et la longueur de son côté.', false],
  ['Le prix d’un taxi (prise en charge de 4 € plus 1 € par km) et la distance parcourue.', false],
  ['La masse de pommes et leur prix (même prix au kilo).', true],
  ['La pointure d’une personne et sa taille.', false],
];

const situation: Skill = skill('proportionnel-ou-pas', 'Reconnaître une situation de proportionnalité', (rng, level) => {
  const pool = byLevel(level, SITUATIONS.slice(0, 6), SITUATIONS.slice(0, 8), SITUATIONS);
  const [text, yes] = rng.pick(pool);
  return {
    prompt: `Ces deux grandeurs sont-elles proportionnelles ? ${text}`,
    answer: yesNo(yes),
    hint: `Demande-toi : si l'une double, l'autre double-t-elle aussi ?`,
    correction: [yes ? 'Oui : quand l’une est multipliée par un nombre, l’autre est multipliée par le même nombre.' : 'Non : doubler l’une ne double pas forcément l’autre.'],
  };
});

export const PROPORTIONNALITE_SKILLS: Skill[] = [reconnaitre, quatrieme, coefficient, pourcentage, echelle, situation];
