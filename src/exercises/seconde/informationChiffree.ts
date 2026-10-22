import type { Skill } from '../types';
import { dec, fixedChoice, fracOf } from './outils';

/** Chapitre 11 de 2nde : proportions, taux d'évolution, coefficients multiplicateurs. */

/** Arrondi d'affichage : évite les 0,30000000000000004. */
const r6 = (v: number) => Math.round(v * 1e6) / 1e6;

const proportion: Skill = {
  id: '2nde-proportion',
  name: 'Calculer une proportion en pourcentage',
  generate(rng, level) {
    const total = rng.pick(level === 1 ? [20, 25, 50, 200] : [40, 80, 125, 250, 400, 500, 800]);
    const pct = rng.pick(level === 3 ? [2.5, 7.5, 12.5, 15, 35, 62.5, 85] : [5, 10, 15, 20, 30, 40, 45, 60, 75, 80]);
    const part = r6((total * pct) / 100);
    if (!Number.isInteger(part)) return proportion.generate(rng, level);
    const ctx = rng.pick([
      ['élèves du lycée', 'sont demi-pensionnaires'],
      ['spectateurs', 'sont venus en train'],
      ['arbres de la forêt', 'sont des chênes'],
      ['joueurs inscrits', 'ont terminé la partie'],
    ]);
    return {
      skill: '2nde-proportion',
      level,
      prompt: `Sur $${total}$ ${ctx[0]}, $${part}$ ${ctx[1]}. Quelle proportion cela représente-t-il, en pourcentage ?`,
      answer: { kind: 'number', value: fracOf(pct) },
      hint: 'Proportion = effectif de la partie ÷ effectif total, puis on multiplie par 100.',
      correction: [`$p = \\frac{${part}}{${total}} = ${dec(pct / 100)}$`, `Soit $${dec(pct)}\\,\\%$.`],
    };
  },
};

const proportionDeProportion: Skill = {
  id: '2nde-proportion-proportion',
  name: 'Calculer une proportion de proportion',
  generate(rng, level) {
    const p1 = rng.pick([20, 25, 40, 50, 60, 75, 80]);
    const p2 = rng.pick(level === 1 ? [10, 20, 50] : [15, 30, 40, 45, 60, 70]);
    const result = r6((p1 * p2) / 100);
    return {
      skill: '2nde-proportion-proportion',
      level,
      prompt: `Dans un club, $${p1}\\,\\%$ des membres jouent au basket, et parmi eux $${p2}\\,\\%$ sont des filles. Quel pourcentage des membres du club sont des basketteuses ?`,
      answer: { kind: 'number', value: fracOf(result) },
      hint: 'Pour une proportion de proportion, on multiplie les proportions.',
      correction: [`$${dec(p1 / 100)} \\times ${dec(p2 / 100)} = ${dec(result / 100)}$`, `Soit $${dec(result)}\\,\\%$ des membres.`],
    };
  },
};

/** Taux d'évolution « agréables » : départ et arrivée entiers. */
const tauxEvolution: Skill = {
  id: '2nde-taux-evolution',
  name: 'Calculer un taux d’évolution',
  generate(rng, level) {
    const v0 = rng.pick(level === 1 ? [50, 100, 200, 400] : [40, 80, 120, 160, 250, 320, 500]);
    const t = rng.pick(level === 3 ? [-37.5, -12.5, 12.5, 62.5, -25, 75, 150] : [-50, -40, -25, -20, -10, 5, 10, 20, 25, 30, 50]);
    const v1 = r6(v0 * (1 + t / 100));
    if (!Number.isInteger(v1)) return tauxEvolution.generate(rng, level);
    return {
      skill: '2nde-taux-evolution',
      level,
      prompt: `Le prix d'un article passe de $${v0}$ € à $${v1}$ €. Quel est le taux d'évolution, en pourcentage ? (Négatif pour une baisse.)`,
      answer: { kind: 'number', value: fracOf(t) },
      hint: 'Taux = (valeur d’arrivée − valeur de départ) ÷ valeur de départ.',
      correction: [`$t = \\frac{${v1} - ${v0}}{${v0}} = \\frac{${r6(v1 - v0)}}{${v0}} = ${dec(t / 100)}$`, `Soit $${dec(t)}\\,\\%$.`],
    };
  },
};

const coefMultiplicateur: Skill = {
  id: '2nde-coef-multiplicateur',
  name: 'Utiliser un coefficient multiplicateur',
  generate(rng, level) {
    const t = rng.pick([3, 5, 8, 12, 15, 20, 25, 30, 40, 60]) * rng.sign();
    const cm = r6(1 + t / 100);
    if (level === 1) {
      return {
        skill: '2nde-coef-multiplicateur',
        level,
        prompt: `Quel est le coefficient multiplicateur associé à ${t > 0 ? 'une hausse' : 'une baisse'} de $${Math.abs(t)}\\,\\%$ ?`,
        answer: { kind: 'number', value: fracOf(cm) },
        hint: 'Augmenter de $t\\,\\%$ revient à multiplier par $1 + \\frac{t}{100}$ ; baisser de $t\\,\\%$, par $1 - \\frac{t}{100}$.',
        correction: [`$CM = 1 ${t > 0 ? '+' : '-'} \\frac{${Math.abs(t)}}{100} = ${dec(cm)}$`],
      };
    }
    // Lecture inverse : un coefficient donne une hausse ou une baisse.
    const options = [`Hausse de $${Math.abs(t)}\\,\\%$`, `Baisse de $${Math.abs(t)}\\,\\%$`, `Hausse de $${dec(cm * 100)}\\,\\%$`, `Baisse de $${dec(100 - Math.abs(t))}\\,\\%$`];
    const unique = [...new Set(options)];
    return {
      skill: '2nde-coef-multiplicateur',
      level,
      prompt: `Multiplier une quantité par $${dec(cm)}$ revient à…`,
      answer: fixedChoice(unique, t > 0 ? 0 : 1),
      hint: 'Compare le coefficient à 1 : au-dessus, c’est une hausse ; en dessous, une baisse.',
      correction: [`$${dec(cm)} = 1 ${t > 0 ? '+' : '-'} ${dec(Math.abs(t) / 100)}$`, `C'est ${t > 0 ? 'une hausse' : 'une baisse'} de $${Math.abs(t)}\\,\\%$.`],
    };
  },
};

const evolutionsSuccessives: Skill = {
  id: '2nde-evolutions-successives',
  name: 'Enchaîner deux évolutions',
  generate(rng, level) {
    const t1 = rng.pick([10, 20, 25, 30, 40, 50]) * (level === 1 ? 1 : rng.sign());
    const t2 = rng.pick([10, 20, 25, 30, 40, 50]) * rng.sign();
    const cm = r6((1 + t1 / 100) * (1 + t2 / 100));
    const t = r6((cm - 1) * 100);
    const word = (v: number) => (v > 0 ? `augmente de $${v}\\,\\%$` : `baisse de $${-v}\\,\\%$`);
    return {
      skill: '2nde-evolutions-successives',
      level,
      prompt: `Une population ${word(t1)}, puis ${word(t2)}. Quel est le taux d'évolution global, en pourcentage ? (Négatif pour une baisse.)`,
      answer: { kind: 'number', value: fracOf(t) },
      hint: 'Les coefficients multiplicateurs se multiplient ; les pourcentages ne s’additionnent pas !',
      correction: [
        `$CM = ${dec(1 + t1 / 100)} \\times ${dec(1 + t2 / 100)} = ${dec(cm)}$`,
        `$t = ${dec(cm)} - 1 = ${dec(cm - 1)}$, soit $${dec(t)}\\,\\%$.`,
      ],
    };
  },
};

/** Évolutions dont la réciproque tombe juste. */
const RECIPROQUES: [number, number][] = [
  [25, -20],
  [100, -50],
  [-20, 25],
  [-50, 100],
  [60, -37.5],
  [-75, 300],
  [150, -60],
  [300, -75],
  [400, -80],
  [-60, 150],
];

const reciproque: Skill = {
  id: '2nde-evolution-reciproque',
  name: 'Trouver l’évolution réciproque',
  generate(rng, level) {
    const [t, back] = rng.pick(level === 1 ? RECIPROQUES.slice(0, 4) : RECIPROQUES);
    const cm = r6(1 + t / 100);
    return {
      skill: '2nde-evolution-reciproque',
      level,
      prompt: `Après ${t > 0 ? 'une hausse' : 'une baisse'} de $${Math.abs(t)}\\,\\%$, quel taux d'évolution permet de revenir à la valeur de départ ? (En pourcentage, négatif pour une baisse.)`,
      answer: { kind: 'number', value: fracOf(back) },
      hint: 'Le coefficient réciproque est l’inverse du coefficient de départ : $\\frac{1}{CM}$.',
      correction: [
        `$CM = ${dec(cm)}$, donc $CM' = \\frac{1}{${dec(cm)}} = ${dec(1 + back / 100)}$.`,
        `Le taux réciproque est $${dec(1 + back / 100)} - 1 = ${dec(back / 100)}$, soit $${dec(back)}\\,\\%$.`,
      ],
    };
  },
};

const valeurFinale: Skill = {
  id: '2nde-valeur-finale',
  name: 'Appliquer un pourcentage',
  generate(rng, level) {
    const v0 = rng.pick([20, 40, 60, 80, 120, 150, 200, 250, 360, 480]);
    const t = rng.pick([5, 10, 15, 20, 25, 30, 40]) * (level === 1 ? 1 : rng.sign());
    const v1 = r6(v0 * (1 + t / 100));
    const backwards = level === 3;
    return {
      skill: '2nde-valeur-finale',
      level,
      prompt: backwards
        ? `Après ${t > 0 ? 'une hausse' : 'une baisse'} de $${Math.abs(t)}\\,\\%$, un article coûte $${dec(v1)}$ €. Quel était son prix avant cette évolution, en euros ?`
        : `Un article coûte $${v0}$ €. Quel est son prix, en euros, après ${t > 0 ? 'une hausse' : 'une baisse'} de $${Math.abs(t)}\\,\\%$ ?`,
      answer: { kind: 'number', value: fracOf(backwards ? v0 : v1) },
      hint: backwards ? 'On divise la valeur finale par le coefficient multiplicateur.' : 'On multiplie le prix par le coefficient multiplicateur $1 + \\frac{t}{100}$.',
      correction: backwards
        ? [`$CM = ${dec(1 + t / 100)}$`, `$\\frac{${dec(v1)}}{${dec(1 + t / 100)}} = ${v0}$ €`]
        : [`$CM = ${dec(1 + t / 100)}$`, `$${v0} \\times ${dec(1 + t / 100)} = ${dec(v1)}$ €`],
    };
  },
};

export const INFORMATION_CHIFFREE_SKILLS: Skill[] = [proportion, proportionDeProportion, tauxEvolution, coefMultiplicateur, evolutionsSuccessives, reciproque, valeurFinale];
