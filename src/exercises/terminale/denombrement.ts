import type { Skill } from '../types';
import { enrich, variant } from '../variantes';
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

const VF = ['Vrai', 'Faux'];
const arr = (n: number, k: number) => fact(n) / fact(n - k);
const PRENOMS = ['Alice', 'Bilal', 'Chloé', 'Dylan', 'Emma', 'Farid', 'Inès', 'Jules'];

const permutationsVariantes = [
  variant('contrainte', (rng) => {
    const n = rng.int(4, 6);
    const [a, b] = rng.shuffle([...PRENOMS]).slice(0, 2);
    const cote = rng.next() < 0.5;
    const value = cote ? 2 * fact(n - 1) : fact(n - 1);
    return {
      prompt: cote
        ? `${n} amis, dont ${a} et ${b}, s’alignent pour une photo. De combien de façons peuvent-ils se placer si ${a} et ${b} veulent être côte à côte ?`
        : `${n} amis, dont ${a}, s’alignent pour une photo. De combien de façons peuvent-ils se placer si ${a} se met tout à gauche ?`,
      answer: num(value),
      hint: cote ? 'Colle les deux amis en un seul « bloc » : on range alors $n - 1$ objets, et le bloc a deux sens.' : 'Une place est imposée : on range les autres.',
      correction: [cote ? `On range $${n - 1}$ objets (le bloc et les autres) : $${n - 1}!$, fois $2$ pour l’ordre dans le bloc : $${value}$.` : `Les $${n - 1}$ autres se rangent librement : $${n - 1}! = ${value}$.`],
    };
  }),
  variant('anagrammes-repetees', (rng) => {
    const mot = rng.pick(['ANANAS', 'BANANE', 'ELEVE', 'PAPA', 'COCO', 'MAMAN', 'RADAR', 'KAYAK', 'ALLEE', 'TOMATE', 'BALLE', 'NAGEUSE', 'CERISE']);
    const occ = [...new Set(mot)].map((l) => [...mot].filter((c) => c === l).length);
    const value = occ.reduce((v, k) => v / fact(k), fact(mot.length));
    const rep = occ.filter((k) => k > 1);
    return {
      prompt: `Combien d’anagrammes (avec ou sans sens) le mot ${mot} a-t-il ?`,
      answer: num(value),
      hint: 'Échanger deux lettres identiques ne change pas le mot : divise $n!$ par les factorielles des répétitions.',
      correction: [`$\\frac{${mot.length}!}{${rep.map((k) => `${k}!`).join('\\times ')}} = ${value}$`],
    };
  }),
];

const upletsVariantes = [
  variant('plaques', (rng) => {
    const l = rng.int(1, 3);
    const c = rng.int(1, 4);
    const value = 26 ** l * 10 ** c;
    return {
      prompt: `Un code est formé de ${l} lettre${l > 1 ? 's' : ''} (parmi 26) suivie${l > 1 ? 's' : ''} de ${c} chiffre${c > 1 ? 's' : ''} (de 0 à 9), avec répétitions permises. Combien de codes sont possibles ?`,
      answer: num(value),
      hint: 'Principe multiplicatif : multiplie le nombre de choix de chaque position.',
      correction: [`$26^{${l}}\\times 10^{${c}} = ${value}$`],
    };
  }),
  variant('au-moins-un', (rng) => {
    const k = rng.int(2, 4);
    const chiffre = rng.int(0, 9);
    const value = 10 ** k - 9 ** k;
    return {
      prompt: `Combien de codes de ${k} chiffres (de 0 à 9, répétitions permises) contiennent au moins une fois le chiffre ${chiffre} ?`,
      answer: num(value),
      hint: `Passe par le contraire : les codes sans aucun ${chiffre}.`,
      correction: [`Sans ${chiffre} : $9^{${k}} = ${9 ** k}$ codes, sur $10^{${k}} = ${10 ** k}$.`, `Au moins un ${chiffre} : $${10 ** k} - ${9 ** k} = ${value}$.`],
    };
  }),
];

const arrangementsVariantes = [
  variant('mots-distincts', (rng) => {
    const n = rng.int(4, 8);
    const k = rng.int(2, Math.min(4, n - 1));
    const lettres = 'ABCDEFGH'.slice(0, n).split('');
    return {
      prompt: `Avec les lettres ${lettres.join(', ')}, combien de « mots » de ${k} lettres toutes différentes peut-on écrire ?`,
      answer: num(arr(n, k)),
      hint: 'L’ordre compte et pas de répétition : arrangements.',
      correction: [`$${product(n, k)} = ${arr(n, k)}$`],
    };
  }),
  variant('chiffres-distincts', (rng) => {
    const k = rng.int(2, 4);
    const value = 9 * arr(9, k - 1);
    return {
      prompt: `Combien de nombres de ${k} chiffres (le premier chiffre n’étant pas 0) ont tous leurs chiffres différents ?`,
      answer: num(value),
      hint: 'Commence par le premier chiffre, qui ne peut pas être 0.',
      correction: [`Premier chiffre : $9$ choix ; puis ${k - 1 === 1 ? '$9$ choix' : `$${product(9, k - 1)}$`} pour les suivants.`, `Total : $${value}$.`],
    };
  }),
];

const combinaisonsVariantes = [
  variant('poignees-de-main', (rng) => {
    const n = rng.int(4, 20);
    return {
      prompt: `${n} personnes se serrent toutes la main, une fois par paire. Combien de poignées de main sont échangées ?`,
      answer: num(binom(n, 2)),
      hint: 'Une poignée de main correspond à une paire de personnes : l’ordre ne compte pas.',
      correction: [`$\\binom{${n}}{2} = \\frac{${n}\\times ${n - 1}}{2} = ${binom(n, 2)}$`],
    };
  }),
  variant('pascal', (rng) => {
    const n = rng.int(5, 12);
    const k = rng.int(1, n - 2);
    const [A, B] = [binom(n, k), binom(n, k + 1)];
    return {
      prompt: `Sachant que $\\binom{${n}}{${k}} = ${A}$ et $\\binom{${n}}{${k + 1}} = ${B}$, calcule $\\binom{${n + 1}}{${k + 1}}$.`,
      answer: num(A + B),
      hint: 'Relation de Pascal : $\\binom{n}{k} + \\binom{n}{k+1} = \\binom{n+1}{k+1}$.',
      correction: [`$\\binom{${n + 1}}{${k + 1}} = ${A} + ${B} = ${A + B}$`],
    };
  }),
];

const partiesVariantes = [
  variant('non-vide', (rng) => {
    const n = rng.int(3, 10);
    return {
      prompt: `Un glacier propose ${n} parfums. Combien de coupes différentes peut-on composer avec au moins un parfum (chaque parfum au plus une fois) ?`,
      answer: num(2 ** n - 1),
      hint: 'Compte toutes les parties, puis retire la partie vide.',
      correction: [`$2^{${n}} - 1 = ${2 ** n - 1}$`],
    };
  }),
  variant('avec-element', (rng) => {
    const n = rng.int(3, 10);
    return {
      prompt: `Une pizzeria propose ${n} garnitures, dont le fromage. Combien de pizzas différentes contiennent du fromage ?`,
      answer: num(2 ** (n - 1)),
      hint: 'Le fromage est imposé : on choisit librement parmi les autres garnitures.',
      correction: [`Les $${n - 1}$ autres garnitures sont prises ou non : $2^{${n - 1}} = ${2 ** (n - 1)}$.`],
    };
  }),
];

const conditionVariantes = [
  variant('mixte', (rng) => {
    const g = rng.int(4, 9);
    const b = rng.int(4, 9);
    const kg = rng.int(1, 3);
    const kb = rng.int(1, 3);
    const value = binom(g, kg) * binom(b, kb);
    return {
      prompt: `Une classe compte ${g} filles et ${b} garçons. Combien d’équipes de ${kg} fille${kg > 1 ? 's' : ''} et ${kb} garçon${kb > 1 ? 's' : ''} peut-on former ?`,
      answer: num(value),
      hint: 'Choisis les filles, puis les garçons, et multiplie.',
      correction: [`$\\binom{${g}}{${kg}}\\times\\binom{${b}}{${kb}} = ${binom(g, kg)}\\times ${binom(b, kb)} = ${value}$`],
    };
  }),
  variant('pas-ensemble', (rng) => {
    const n = rng.int(6, 12);
    const k = rng.int(3, 5);
    const value = binom(n, k) - binom(n - 2, k - 2);
    return {
      prompt: `On choisit ${k} élèves parmi ${n}, dont Léa et Malik, qui refusent d’être ensemble. Combien de groupes sont possibles ?`,
      answer: num(value),
      hint: 'Retire du total les groupes qui contiennent à la fois Léa et Malik.',
      correction: [`Total : $\\binom{${n}}{${k}} = ${binom(n, k)}$. Avec les deux : $\\binom{${n - 2}}{${k - 2}} = ${binom(n - 2, k - 2)}$.`, `$${binom(n, k)} - ${binom(n - 2, k - 2)} = ${value}$`],
    };
  }),
];

const modeleVariantes = [
  variant('autres-situations', (rng) => {
    const N = rng.int(5, 12);
    const K = rng.int(2, Math.min(4, N - 1));
    const cases: [string, number][] = [
      [`Lancer ${K} fois un dé à ${N} faces et noter les résultats dans l’ordre.`, 0],
      [`Colorier ${K} cases alignées avec ${N} couleurs, une couleur pouvant servir plusieurs fois.`, 0],
      [`Attribuer ${K} prix différents à ${K} des ${N} candidats d’un concours.`, 1],
      [`Écrire un code de ${K} lettres toutes différentes, choisies parmi ${N}.`, 1],
      [`Emporter ${K} livres choisis parmi ${N} pour les vacances.`, 2],
      [`Tirer simultanément ${K} boules dans une urne qui en contient ${N}.`, 2],
      [`Ranger ${N} tableaux différents côte à côte sur un mur.`, 3],
    ];
    const [text, correct] = rng.pick(cases);
    const options = [`$${N}^{${K}}$`, `$${product(N, K)}$`, `$\\binom{${N}}{${K}}$`, `$${N}!$`];
    return {
      prompt: `Quel calcul donne le nombre de possibilités ? « ${text} »`,
      answer: fixedChoice(options, correct),
      hint: 'L’ordre compte-t-il ? Les répétitions sont-elles possibles ? Range-t-on tous les éléments ?',
      correction: [['Ordre et répétitions : $K$-uplets.', 'Ordre, sans répétition : arrangements.', 'Sans ordre ni répétition : combinaisons.', 'On ordonne tous les éléments : permutations.'][correct]],
    };
  }),
  variant('vrai-faux-formule', (rng) => {
    const n = rng.int(5, 10);
    const k = rng.int(2, n - 3);
    const b = (p: number, q: number) => `\\binom{${p}}{${q}}`;
    const cas: [string, number, number][] = [
      [`${b(n, k)} = ${b(n, n - k)}`, binom(n, k), binom(n, n - k)],
      [`${b(n, k)} = \\frac{${n}!}{${k}!}`, binom(n, k), fact(n) / fact(k)],
      [`${b(n, k)} + ${b(n, k + 1)} = ${b(n + 1, k + 1)}`, binom(n, k) + binom(n, k + 1), binom(n + 1, k + 1)],
      [`${b(n, k)} + ${b(n, k + 1)} = ${b(n, k + 2)}`, binom(n, k) + binom(n, k + 1), binom(n, k + 2)],
      [`${b(n, k)} = ${b(n - 1, k - 1)} + ${b(n - 1, k)}`, binom(n, k), binom(n - 1, k - 1) + binom(n - 1, k)],
      [`${b(n, k)}\\times ${k}! = \\frac{${n}!}{${n - k}!}`, binom(n, k) * fact(k), fact(n) / fact(n - k)],
      [`${b(2 * n, 2)} = 2${b(n, 2)}`, binom(2 * n, 2), 2 * binom(n, 2)],
    ];
    const [s2, g, d] = rng.pick(cas);
    const ok = g === d;
    return {
      prompt: `Vrai ou faux : $${s2}$.`,
      answer: fixedChoice(VF, ok ? 0 : 1),
      hint: 'Pense aux propriétés des coefficients binomiaux (symétrie, relation de Pascal), ou calcule les deux membres.',
      correction: [`Membre de gauche : $${g}$ ; membre de droite : $${d}$. C’est ${ok ? 'vrai' : 'faux'}.`],
    };
  }),
];

export const DENOMBREMENT_SKILLS: Skill[] = [
  enrich(permutations, permutationsVariantes),
  enrich(uplets, upletsVariantes),
  enrich(arrangements, arrangementsVariantes),
  enrich(combinaisons, combinaisonsVariantes),
  enrich(parties, partiesVariantes),
  enrich(condition, conditionVariantes),
  enrich(modele, modeleVariantes),
];
