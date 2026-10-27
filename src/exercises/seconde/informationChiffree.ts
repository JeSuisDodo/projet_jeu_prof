import { frac } from '../fraction';
import type { Skill } from '../types';
import { enrich, variant } from '../variantes';
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

/* ---------- Variantes : d'autres façons de poser les mêmes notions ---------- */

const evolution = (t: number) => (t > 0 ? `une hausse de $${dec(t)}\\,\\%$` : `une baisse de $${dec(-t)}\\,\\%$`);

const proportionVariantes = [
  variant('effectif', (rng, level) => {
    let total: number;
    let pct: number;
    do {
      total = rng.pick(level === 1 ? [200, 400, 500, 1000] : [240, 360, 480, 750, 1200, 1500]);
      pct = rng.pick(level === 3 ? [2.5, 7.5, 12.5, 15, 35, 45] : [5, 10, 20, 25, 30, 40, 50, 60, 75]);
    } while (!Number.isInteger(r6((total * pct) / 100)));
    const part = r6((total * pct) / 100);
    return {
      prompt: `Un lycée compte $${total}$ élèves, dont $${dec(pct)}\\,\\%$ viennent au lycée à vélo. Combien d'élèves viennent à vélo ?`,
      answer: { kind: 'number', value: fracOf(part) },
      hint: 'Prendre $p\\,\\%$ d’une quantité, c’est la multiplier par $\\frac{p}{100}$.',
      correction: [`$${total} \\times \\frac{${dec(pct)}}{100} = ${part}$`],
    };
  }),
  variant('total', (rng, level) => {
    const pct = rng.pick(level === 1 ? [10, 20, 25, 50] : [4, 8, 12, 15, 30, 35, 40, 60]);
    const total = rng.pick([100, 200, 300, 400, 500, 600, 800, 1000, 1200]);
    const part = (total * pct) / 100;
    return {
      prompt: `$${part}$ joueurs d'un tournoi sont gauchers, ce qui représente $${pct}\\,\\%$ des inscrits. Combien y a-t-il d'inscrits ?`,
      answer: { kind: 'number', value: frac(total) },
      hint: 'Si $N$ est le nombre d’inscrits, alors $N \\times \\frac{' + pct + '}{100} = ' + part + '$.',
      correction: [`$N = \\frac{${part}}{${dec(pct / 100)}} = ${total}$`],
    };
  }),
];

const proportionDeProportionVariantes = [
  variant('retrouver', (rng) => {
    const p1 = rng.pick([20, 25, 40, 50, 80]);
    const p2 = rng.pick([10, 20, 25, 50, 60, 75]);
    const global = r6((p1 * p2) / 100);
    return {
      prompt: `Dans une entreprise, $${p1}\\,\\%$ des salariés sont cadres, et $${dec(global)}\\,\\%$ des salariés sont des cadres qui télétravaillent. Quel pourcentage des cadres télétravaille ?`,
      answer: { kind: 'number', value: frac(p2) },
      hint: 'La proportion globale est le produit des deux proportions : divise.',
      correction: [`$\\frac{${dec(global / 100)}}{${dec(p1 / 100)}} = ${dec(p2 / 100)}$`, `Soit $${p2}\\,\\%$ des cadres.`],
    };
  }),
  variant('effectif', (rng, level) => {
    let total: number;
    let p1: number;
    let p2: number;
    do {
      total = rng.pick([400, 800, 1000, 1200, 2000]);
      p1 = rng.pick([20, 25, 40, 50, 60]);
      p2 = rng.pick(level === 1 ? [10, 50] : [15, 30, 45, 75]);
    } while (!Number.isInteger(r6((total * p1 * p2) / 10000)));
    const n = r6((total * p1 * p2) / 10000);
    return {
      prompt: `Un festival accueille $${total}$ spectateurs. $${p1}\\,\\%$ d'entre eux campent sur place, et parmi les campeurs, $${p2}\\,\\%$ sont venus à vélo. Combien de spectateurs campent et sont venus à vélo ?`,
      answer: { kind: 'number', value: frac(n) },
      hint: 'Applique les deux pourcentages l’un après l’autre.',
      correction: [`Campeurs : $${total} \\times ${dec(p1 / 100)} = ${r6((total * p1) / 100)}$.`, `À vélo : $${r6((total * p1) / 100)} \\times ${dec(p2 / 100)} = ${n}$.`],
    };
  }),
];

const tauxEvolutionVariantes = [
  variant('depuis-coef', (rng, level) => {
    const t = rng.pick(level === 1 ? [10, 20, 50, -10, -20, -50] : [3, 7, 15, 35, -4, -15, -35, -62, 120]);
    const cm = r6(1 + t / 100);
    return {
      prompt: `Une quantité a été multipliée par $${dec(cm)}$. Quel est le taux d'évolution correspondant, en pourcentage ? (Négatif pour une baisse.)`,
      answer: { kind: 'number', value: fracOf(t) },
      hint: '$t = CM - 1$, puis on l’exprime en pourcentage.',
      correction: [`$t = ${dec(cm)} - 1 = ${dec(t / 100)}$`, `Soit $${dec(t)}\\,\\%$.`],
    };
  }),
  variant('multiple', (rng) => {
    const [mot, k] = rng.pick([
      ['a doublé', 2],
      ['a triplé', 3],
      ['a été multiplié par 5', 5],
      ['a été divisé par 2', 0.5],
      ['a été divisé par 4', 0.25],
      ['a été divisé par 5', 0.2],
    ] as const);
    const t = r6((k - 1) * 100);
    return {
      prompt: `En dix ans, le prix d'un appartement ${mot}. Quel est le taux d'évolution, en pourcentage ? (Négatif pour une baisse.)`,
      answer: { kind: 'number', value: fracOf(t) },
      hint: 'Écris le coefficient multiplicateur, puis $t = CM - 1$.',
      correction: [`$CM = ${dec(k)}$`, `$t = ${dec(k)} - 1 = ${dec(k - 1)}$, soit $${dec(t)}\\,\\%$.`],
    };
  }),
];

const coefVariantes = [
  variant('entre-deux-valeurs', (rng, level) => {
    const v0 = rng.pick([20, 40, 50, 80, 125, 200, 250]);
    const t = rng.pick(level === 1 ? [10, 20, 50, -10, -20, -50] : [4, 12, 35, 60, -5, -15, -30, -64]);
    const v1 = r6(v0 * (1 + t / 100));
    return {
      prompt: `Un abonnement passe de $${v0}$ € à $${dec(v1)}$ €. Par quel coefficient multiplicateur le prix a-t-il été multiplié ?`,
      answer: { kind: 'number', value: fracOf(r6(1 + t / 100)) },
      hint: '$CM = \\frac{\\text{valeur d’arrivée}}{\\text{valeur de départ}}$',
      correction: [`$CM = \\frac{${dec(v1)}}{${v0}} = ${dec(1 + t / 100)}$`],
    };
  }),
  variant('erreur', (rng) => {
    const t = rng.pick([5, 12, 20, 30, 45]);
    const juste = rng.next() < 0.4;
    const shown = juste ? r6(1 - t / 100) : rng.pick([r6(t / 100), r6(1 + t / 100), r6(-t / 100)]);
    return {
      prompt: `Pour baisser un prix de $${t}\\,\\%$, Inès le multiplie par $${dec(shown)}$. A-t-elle raison ?`,
      answer: fixedChoice(['Oui', 'Non'], juste ? 0 : 1),
      hint: 'Baisser de $t\\,\\%$, c’est multiplier par $1 - \\frac{t}{100}$.',
      correction: [`Le bon coefficient est $1 - ${dec(t / 100)} = ${dec(1 - t / 100)}$.`, juste ? 'Inès a raison.' : 'Inès se trompe.'],
    };
  }),
];

const successivesVariantes = [
  variant('hausse-puis-baisse', (rng) => {
    const t = rng.pick([10, 20, 25, 30, 40, 50]);
    const first = rng.sign();
    const cm = r6((1 + (first * t) / 100) * (1 - (first * t) / 100));
    const global = r6((cm - 1) * 100);
    return {
      prompt: `Un prix subit ${evolution(first * t)}, puis ${evolution(-first * t)}. Quel est le taux d'évolution global, en pourcentage ? (Négatif pour une baisse.)`,
      answer: { kind: 'number', value: fracOf(global) },
      hint: 'Piège classique : on ne revient pas au prix de départ ! Multiplie les coefficients.',
      correction: [`$CM = ${dec(1 + (first * t) / 100)} \\times ${dec(1 - (first * t) / 100)} = ${dec(cm)}$`, `Taux global : $${dec(global)}\\,\\%$, une baisse.`],
    };
  }),
  variant('trois-evolutions', (rng) => {
    const ts = [rng.pick([10, 20, 50]) * rng.sign(), rng.pick([10, 20, 25]) * rng.sign(), rng.pick([10, 20, 50]) * rng.sign()];
    const cm = r6(ts.reduce((acc, t) => acc * (1 + t / 100), 1));
    const global = r6((cm - 1) * 100);
    return {
      prompt: `Une action en bourse connaît ${evolution(ts[0])}, puis ${evolution(ts[1])}, puis ${evolution(ts[2])}. Quel est le taux d'évolution global, en pourcentage ? (Négatif pour une baisse.)`,
      answer: { kind: 'number', value: fracOf(global) },
      hint: 'Multiplie les trois coefficients multiplicateurs.',
      correction: [`$CM = ${ts.map((t) => dec(1 + t / 100)).join(' \\times ')} = ${dec(cm)}$`, `Soit $${dec(global)}\\,\\%$.`],
    };
  }),
  variant('vrai-faux', (rng) => {
    const t1 = rng.pick([10, 20, 30]);
    const t2 = rng.pick([10, 20, 30]);
    const sum = t1 + t2;
    const real = r6(((1 + t1 / 100) * (1 + t2 / 100) - 1) * 100);
    const juste = rng.next() < 0.3;
    const shown = juste ? real : sum;
    return {
      prompt: `Vrai ou faux : une hausse de $${t1}\\,\\%$ suivie d'une hausse de $${t2}\\,\\%$ correspond à une hausse globale de $${dec(shown)}\\,\\%$.`,
      answer: fixedChoice(['Vrai', 'Faux'], shown === real ? 0 : 1),
      hint: 'Les pourcentages successifs ne s’additionnent pas.',
      correction: [`$${dec(1 + t1 / 100)} \\times ${dec(1 + t2 / 100)} = ${dec(1 + real / 100)}$ : hausse globale de $${dec(real)}\\,\\%$.`, shown === real ? 'C’est vrai.' : 'C’est faux.'],
    };
  }),
];

const reciproqueVariantes = [
  variant('soldes', (rng, level) => {
    const [t, back] = rng.pick((level === 1 ? RECIPROQUES.slice(0, 4) : RECIPROQUES).filter(([x]) => x < 0));
    return {
      prompt: `Pendant les soldes, un magasin baisse ses prix de $${-t}\\,\\%$. Après les soldes, de quel pourcentage doit-il augmenter les prix soldés pour revenir aux prix d'origine ?`,
      answer: { kind: 'number', value: fracOf(back) },
      hint: 'Le coefficient de la hausse est l’inverse de celui de la baisse.',
      correction: [`$\\frac{1}{${dec(1 + t / 100)}} = ${dec(1 + back / 100)}$`, `Il faut une hausse de $${dec(back)}\\,\\%$ (et non de $${-t}\\,\\%$ !).`],
    };
  }),
  variant('vrai-faux', (rng, level) => {
    const [t, back] = rng.pick(level === 1 ? RECIPROQUES.slice(0, 4) : RECIPROQUES);
    const juste = rng.next() < 0.5;
    const shown = juste ? back : -t;
    return {
      prompt: `Vrai ou faux : après ${evolution(t)}, ${evolution(shown)} permet de revenir à la valeur de départ.`,
      answer: fixedChoice(['Vrai', 'Faux'], juste ? 0 : 1),
      hint: 'Multiplie les deux coefficients : on revient au départ si le produit vaut 1.',
      correction: [`$${dec(1 + t / 100)} \\times ${dec(1 + shown / 100)} = ${dec(r6((1 + t / 100) * (1 + shown / 100)))}$`, juste ? 'Le produit vaut 1 : c’est vrai.' : 'Le produit ne vaut pas 1 : c’est faux.'],
    };
  }),
];

const valeurFinaleVariantes = [
  variant('tva', (rng, level) => {
    const ht = rng.pick([15, 25, 40, 60, 85, 120, 150, 250, 400]);
    const ttc = r6(ht * 1.2);
    const inverse = level > 1 && rng.next() < 0.5;
    return {
      prompt: inverse ? `Un vélo coûte $${dec(ttc)}$ € TTC, avec une TVA de $20\\,\\%$. Quel est son prix hors taxes, en euros ?` : `Un vélo coûte $${ht}$ € hors taxes. Avec une TVA de $20\\,\\%$, quel est son prix TTC, en euros ?`,
      answer: { kind: 'number', value: fracOf(inverse ? ht : ttc) },
      hint: inverse ? 'Le prix TTC est le prix HT multiplié par $1{,}2$ : divise.' : 'Ajouter $20\\,\\%$, c’est multiplier par $1{,}2$.',
      correction: inverse ? [`$\\frac{${dec(ttc)}}{1{,}2} = ${ht}$ €`] : [`$${ht} \\times 1{,}2 = ${dec(ttc)}$ €`],
    };
  }),
  variant('deux-remises', (rng) => {
    const p = rng.pick([40, 50, 80, 100, 120, 200]);
    const r1 = rng.pick([10, 20, 30, 50]);
    const r2 = rng.pick([10, 20, 25, 50]);
    const final = r6(p * (1 - r1 / 100) * (1 - r2 / 100));
    return {
      prompt: `Un jeu vidéo à $${p}$ € bénéficie d'une remise de $${r1}\\,\\%$, puis d'une seconde remise de $${r2}\\,\\%$ sur le prix déjà réduit. Quel est son prix final, en euros ?`,
      answer: { kind: 'number', value: fracOf(final) },
      hint: 'Applique les deux coefficients multiplicateurs l’un après l’autre.',
      correction: [`$${p} \\times ${dec(1 - r1 / 100)} \\times ${dec(1 - r2 / 100)} = ${dec(final)}$ €`, `(Et non $${p} \\times ${dec(1 - (r1 + r2) / 100)}$ : les remises ne s'additionnent pas.)`],
    };
  }),
];

export const INFORMATION_CHIFFREE_SKILLS: Skill[] = [
  enrich(proportion, proportionVariantes),
  enrich(proportionDeProportion, proportionDeProportionVariantes),
  enrich(tauxEvolution, tauxEvolutionVariantes),
  enrich(coefMultiplicateur, coefVariantes),
  enrich(evolutionsSuccessives, successivesVariantes),
  enrich(reciproque, reciproqueVariantes),
  enrich(valeurFinale, valeurFinaleVariantes),
];
