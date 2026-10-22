import type { Skill } from '../types';
import { binom, fact, fixedChoice, num, skill } from './util';

/** Chapitre « Combinatoire et dénombrement » (Terminale spécialité). */

const product = (n: number, k: number) => Array.from({ length: k }, (_, i) => n - i).join('\\times ');

const permutations = skill('tle-permutations', 'Compter les permutations', (rng, level) => {
  const n = rng.int(3, level === 1 ? 5 : 8);
  const what = rng.pick([
    `De combien de façons peut-on ranger ${n} livres différents sur une étagère ?`,
    `${n} coureurs finissent une course, sans ex æquo. Combien de classements sont possibles ?`,
    `Combien d’anagrammes (avec ou sans sens) a un mot de ${n} lettres toutes différentes ?`,
  ]);
  return {
    prompt: what,
    answer: num(fact(n)),
    hint: 'Ranger $n$ objets distincts : $n!$ façons.',
    correction: [`C’est le nombre de permutations de $${n}$ éléments : $${n}! = ${product(n, n)} = ${fact(n)}$.`],
  };
});

const uplets = skill('tle-k-uplets', 'Compter les k-uplets', (rng, level) => {
  const cases = [
    () => {
      const k = rng.int(3, level === 1 ? 4 : 6);
      return { prompt: `Combien de codes de ${k} chiffres (de 0 à 9, répétitions permises) existe-t-il ?`, n: 10, k };
    },
    () => {
      const k = rng.int(3, 8);
      return { prompt: `On lance ${k} fois une pièce et on note la suite des résultats (pile ou face). Combien de suites sont possibles ?`, n: 2, k };
    },
    () => {
      const k = rng.int(2, 4);
      return { prompt: `On lance ${k} fois un dé à 6 faces et on note les résultats dans l’ordre. Combien de résultats sont possibles ?`, n: 6, k };
    },
  ];
  const { prompt, n, k } = rng.pick(cases)();
  return {
    prompt,
    answer: num(n ** k),
    hint: 'Un $k$-uplet d’un ensemble à $n$ éléments : $n^k$ possibilités.',
    correction: [`Chaque position a $${n}$ choix, indépendamment : $${n}^{${k}} = ${n ** k}$.`],
  };
});

const arrangements = skill('tle-arrangements', 'Compter les arrangements', (rng, level) => {
  const n = rng.int(level === 1 ? 5 : 6, level === 1 ? 8 : 12);
  const k = rng.int(2, level === 1 ? 3 : 4);
  const value = fact(n) / fact(n - k);
  return {
    prompt: rng.pick([
      `Un club de ${n} membres élit ${k === 2 ? 'un président et un trésorier' : k === 3 ? 'un président, un trésorier et un secrétaire' : `${k} responsables à des postes différents`}. Combien de bureaux sont possibles ?`,
      `${n} chevaux prennent le départ. Combien d’arrivées sont possibles pour les ${k} premières places, dans l’ordre ?`,
    ]),
    answer: num(value),
    hint: 'Des $k$-uplets d’éléments distincts (l’ordre compte) : $\\frac{n!}{(n-k)!} = n(n-1)\\cdots(n-k+1)$.',
    correction: [`L’ordre compte et sans répétition : $${product(n, k)} = ${value}$.`],
  };
});

const combinaisons = skill('tle-combinaisons', 'Compter les combinaisons', (rng, level) => {
  const n = rng.int(level === 1 ? 4 : 6, level === 1 ? 8 : 15);
  const k = rng.int(2, Math.min(level === 1 ? 3 : 5, n - 1));
  const value = binom(n, k);
  return {
    prompt: rng.pick([
      `De combien de façons peut-on choisir ${k} élèves parmi ${n} pour former une équipe ?`,
      `Une main de ${k} cartes est tirée simultanément dans un paquet de ${n} cartes. Combien de mains sont possibles ?`,
    ]),
    answer: num(value),
    hint: 'L’ordre ne compte pas : $\\binom{n}{k} = \\frac{n!}{k!(n-k)!}$.',
    correction: [`$\\binom{${n}}{${k}} = \\frac{${product(n, k)}}{${k}!} = \\frac{${fact(n) / fact(n - k)}}{${fact(k)}} = ${value}$`],
  };
});

const parties = skill('tle-parties', 'Compter les parties d’un ensemble', (rng) => {
  const n = rng.int(3, 10);
  return {
    prompt: `Une pizzeria propose ${n} garnitures. Combien de pizzas différentes peut-on composer (une pizza peut n’avoir aucune garniture) ?`,
    answer: num(2 ** n),
    hint: 'Pour chaque garniture : on la prend ou non.',
    correction: [`Chaque garniture est présente ou non : $2^{${n}} = ${2 ** n}$ parties.`],
  };
});

const condition = skill('tle-denombrement-condition', 'Dénombrer avec une contrainte', (rng, level) => {
  const n = rng.int(6, level === 1 ? 9 : 14);
  const k = rng.int(3, 5);
  const kind = rng.int(0, level === 1 ? 0 : 1);
  if (kind === 0) {
    const value = binom(n - 1, k - 1);
    return {
      prompt: `On choisit ${k} délégués parmi ${n} élèves, dont Léa. Combien de groupes contiennent Léa ?`,
      answer: num(value),
      hint: 'Léa est choisie : il reste à compléter le groupe parmi les autres.',
      correction: [`Il reste $${k - 1}$ places pour $${n - 1}$ élèves : $\\binom{${n - 1}}{${k - 1}} = ${value}$.`],
    };
  }
  const value = binom(n, k) - binom(n - 2, k);
  return {
    prompt: `On choisit ${k} élèves parmi ${n}, dont Léa et Malik. Combien de groupes contiennent au moins l’un des deux ?`,
    answer: num(value),
    hint: 'Passe par le contraire : groupes sans Léa ni Malik.',
    correction: [`Total : $\\binom{${n}}{${k}} = ${binom(n, k)}$. Sans les deux : $\\binom{${n - 2}}{${k}} = ${binom(n - 2, k)}$.`, `Au moins l’un des deux : $${binom(n, k)} - ${binom(n - 2, k)} = ${value}$.`],
  };
});

const modele = skill('tle-denombrement-modele', 'Choisir le bon modèle de dénombrement', (rng) => {
  const cases: [string, number][] = [
    ['Tirer successivement et avec remise 3 boules dans une urne de 10, en notant l’ordre.', 0],
    ['Attribuer l’or, l’argent et le bronze à 3 des 10 finalistes.', 1],
    ['Choisir 3 fruits parmi 10 pour une salade.', 2],
    ['Ranger 10 élèves en file indienne.', 3],
    ['Composer un mot de passe de 3 caractères parmi 10 symboles, répétitions permises.', 0],
    ['Tirer simultanément 3 cartes dans un paquet de 10.', 2],
    ['Asseoir 3 personnes sur 3 des 10 chaises numérotées d’une rangée.', 1],
  ];
  const [text, correct] = rng.pick(cases);
  const options = ['$10^3$ (3-uplets)', '$10\\times 9\\times 8$ (arrangements)', '$\\binom{10}{3}$ (combinaisons)', '$10!$ (permutations)'];
  const why = [
    'L’ordre compte et les répétitions sont permises : $3$-uplets, $10^3$.',
    'L’ordre compte, sans répétition : arrangements, $10\\times 9\\times 8$.',
    'L’ordre ne compte pas, sans répétition : combinaisons, $\\binom{10}{3}$.',
    'On ordonne tous les éléments : permutations, $10!$.',
  ];
  return {
    prompt: `Quel calcul donne le nombre de possibilités ? « ${text} »`,
    answer: fixedChoice(options, correct),
    hint: 'Deux questions : l’ordre compte-t-il ? Les répétitions sont-elles possibles ?',
    correction: [why[correct]],
  };
});

export const DENOMBREMENT_SKILLS: Skill[] = [permutations, uplets, arrangements, combinaisons, parties, condition, modele];
