import { frac } from '../fraction';
import type { Skill } from '../types';
import { makeChoice } from '../types';
import { fixedChoice, num, unit } from './outils';

/** 5e : symétrie centrale (construction par coordonnées, centre de symétrie, propriétés). */

const point = (name: string, x: number, y: number) => `${name}(${x}\\,;\\,${y})`;

const symOrigine: Skill = {
  id: '5e-symetrique-point',
  name: 'Trouver le symétrique d’un point',
  generate(rng, level) {
    const x = rng.nonZero(-8, 8);
    const y = rng.nonZero(-8, 8);
    if (level === 1) {
      return {
        skill: '5e-symetrique-point',
        level,
        prompt: `Dans un repère d'origine $O$, quelles sont les coordonnées du symétrique $A'$ du point $${point('A', x, y)}$ par rapport à $O$ ?`,
        answer: { kind: 'pair', values: [frac(-x), frac(-y)], labels: ["x_{A'}", "y_{A'}"] },
        hint: 'Par la symétrie de centre $O$, chaque coordonnée est changée en son opposé.',
        correction: [`$O$ est le milieu de $[AA']$ : les coordonnées de $A'$ sont les opposées de celles de $A$.`, `$${point("A'", -x, -y)}$`],
      };
    }
    const cx = rng.int(-4, 4);
    const cy = rng.int(-4, 4);
    const px = 2 * cx - x;
    const py = 2 * cy - y;
    return {
      skill: '5e-symetrique-point',
      level,
      prompt: `Quelles sont les coordonnées du symétrique $A'$ du point $${point('A', x, y)}$ par rapport au point $${point('I', cx, cy)}$ ?`,
      answer: { kind: 'pair', values: [frac(px), frac(py)], labels: ["x_{A'}", "y_{A'}"] },
      hint: 'Le centre $I$ est le milieu de $[AA\']$ : pour aller de $I$ à $A\'$, on fait le même déplacement que pour aller de $A$ à $I$.',
      correction: [
        `De $A$ à $I$ : $${cx - x >= 0 ? '+' : ''}${cx - x}$ en abscisse et $${cy - y >= 0 ? '+' : ''}${cy - y}$ en ordonnée.`,
        `On recommence à partir de $I$ : $${point("A'", px, py)}$.`,
      ],
    };
  },
};

const centre: Skill = {
  id: '5e-centre-symetrie',
  name: 'Trouver le centre d’une symétrie',
  generate(rng, level) {
    const cx = level === 1 ? rng.int(-5, 5) : rng.int(-10, 10) / (level === 3 ? 2 : 1);
    const cy = level === 1 ? rng.int(-5, 5) : rng.int(-10, 10) / (level === 3 ? 2 : 1);
    const x = rng.int(-8, 8);
    const y = rng.int(-8, 8);
    const px = 2 * cx - x;
    const py = 2 * cy - y;
    return {
      skill: '5e-centre-symetrie',
      level,
      prompt: `Le point $${point("B'", px, py)}$ est le symétrique du point $${point('B', x, y)}$ par une symétrie centrale. Quelles sont les coordonnées de son centre $I$ ?`,
      answer: { kind: 'pair', values: [frac(Math.round(cx * 2), 2), frac(Math.round(cy * 2), 2)], labels: ['x_I', 'y_I'] },
      hint: 'Le centre de symétrie est le milieu du segment $[BB\']$ : chaque coordonnée est la moyenne des deux.',
      correction: [`$x_I = \\dfrac{${x} + ${px < 0 ? `(${px})` : px}}{2} = ${String(cx).replace('.', '{,}')}$`, `$y_I = \\dfrac{${y} + ${py < 0 ? `(${py})` : py}}{2} = ${String(cy).replace('.', '{,}')}$`],
    };
  },
};

const AVEC = ['un parallélogramme', 'un rectangle', 'un losange', 'un carré', 'un cercle', 'un segment', 'un hexagone régulier'];
const SANS = ['un triangle équilatéral', 'un triangle isocèle', 'un trapèze quelconque', 'un demi-cercle', 'un pentagone régulier', 'un cerf-volant'];
const LETTRES_AVEC = ['H', 'I', 'N', 'O', 'S', 'X', 'Z'];
const LETTRES_SANS = ['A', 'B', 'C', 'D', 'E', 'K', 'M', 'T', 'U', 'V', 'W', 'Y'];

const figure: Skill = {
  id: '5e-figure-centre',
  name: 'Reconnaître une figure ayant un centre de symétrie',
  generate(rng, level) {
    const letters = level >= 2 && rng.next() < 0.5;
    const [yes, no] = letters ? [LETTRES_AVEC, LETTRES_SANS] : [AVEC, SANS];
    // Au niveau 3, on demande parfois l'intrus : la seule figure SANS centre.
    const intrus = level === 3 && rng.next() < 0.5;
    const correct = rng.pick(intrus ? no : yes);
    const decoys = rng.shuffle(intrus ? yes : no).slice(0, 3);
    const wrap = (s: string) => (letters ? `La lettre ${s}` : s[0].toUpperCase() + s.slice(1));
    return {
      skill: '5e-figure-centre',
      level,
      prompt: intrus ? `Laquelle de ces figures n'a pas de centre de symétrie ?` : `Laquelle de ces figures a un centre de symétrie ?`,
      answer: makeChoice(rng, wrap(correct), decoys.map(wrap), () => wrap(rng.pick(intrus ? yes : no))),
      hint: 'Une figure a un centre de symétrie si elle se superpose à elle-même après un demi-tour autour de ce point.',
      correction: [intrus ? `${wrap(correct)} : après un demi-tour, la figure ne se superpose jamais à elle-même.` : `${wrap(correct)} : après un demi-tour autour de son centre, la figure se superpose à elle-même.`],
    };
  },
};

const PROPRIETES: [string, string, string[]][] = [
  ['L’image d’une droite par une symétrie centrale est', 'une droite parallèle', ['une droite perpendiculaire', 'une droite sécante quelconque', 'un segment']],
  ['L’image d’un segment par une symétrie centrale est', 'un segment de même longueur', ['un segment deux fois plus long', 'un segment perpendiculaire', 'une demi-droite']],
  ['L’image d’un cercle de rayon 3 cm par une symétrie centrale est', 'un cercle de rayon 3 cm', ['un cercle de rayon 6 cm', 'un demi-cercle', 'un cercle de rayon 1,5 cm']],
  ['Par une symétrie centrale, un angle de 40° a pour image', 'un angle de 40°', ['un angle de 140°', 'un angle de 80°', 'un angle de 320°']],
  ['Par une symétrie centrale, une figure d’aire 12 cm² a pour image', 'une figure d’aire 12 cm²', ['une figure d’aire 24 cm²', 'une figure d’aire 6 cm²', 'une figure d’aire 48 cm²']],
];

const proprietes: Skill = {
  id: '5e-proprietes-symetrie',
  name: 'Utiliser les propriétés de la symétrie centrale',
  generate(rng, level) {
    if (level === 1) {
      const len = rng.int(20, 120) / 10;
      return {
        skill: '5e-proprietes-symetrie',
        level,
        prompt: `Le segment $[AB]$ mesure $${unit(len, 'cm')}$. Son symétrique $[A'B']$ par rapport à un point $O$ mesure (en cm) :`,
        answer: num(len),
        hint: 'La symétrie centrale conserve les longueurs.',
        correction: [`La symétrie centrale conserve les longueurs : $A'B' = AB = ${unit(len, 'cm')}$.`],
      };
    }
    const [text, correct, decoys] = rng.pick(PROPRIETES);
    const options = rng.shuffle([correct, ...decoys]);
    return {
      skill: '5e-proprietes-symetrie',
      level,
      prompt: `${text} :`,
      answer: fixedChoice(options, options.indexOf(correct)),
      hint: 'La symétrie centrale conserve les longueurs, les angles et les aires ; elle transforme une droite en une droite parallèle.',
      correction: [`${text} ${correct}.`],
    };
  },
};

export const SYMETRIE_SKILLS: Skill[] = [symOrigine, centre, figure, proprietes];
