import type { Skill } from '../types';
import { dec, decimal, fixedChoice, skill } from './outils';

/** 3e : transformations du plan, homothéties, triangles semblables, agrandissements et réductions. */

const TRANSFOS = ['une symétrie axiale', 'une symétrie centrale', 'une translation', 'une rotation', 'une homothétie'];

const DESCRIPTIONS: [string, number][] = [
  ['La droite $(d)$ est la médiatrice de $[AA\']$ pour tout point $A$ et son image $A\'$.', 0],
  ['On « plie » la figure le long d’une droite : les deux parties se superposent.', 0],
  ['$O$ est le milieu de $[AA\']$ pour tout point $A$ et son image $A\'$.', 1],
  ['La figure fait un demi-tour autour du point $O$.', 1],
  ['La figure glisse, sans tourner, de $A$ vers $B$ : $\\overrightarrow{MM\'} = \\overrightarrow{AB}$ pour tout point $M$.', 2],
  ['Tous les points se déplacent dans la même direction, le même sens et de la même longueur.', 2],
  ['La figure tourne de $90^\\circ$ dans le sens inverse des aiguilles d’une montre autour de $O$.', 3],
  ['Pour tout point $M$, $OM\' = OM$ et $\\widehat{MOM\'} = 60^\\circ$, dans le même sens de rotation.', 3],
  ['$O$, $M$ et $M\'$ sont alignés, et $OM\' = 3 \\times OM$, du même côté de $O$.', 4],
  ['La figure est agrandie à partir du point $O$ : toutes les longueurs sont multipliées par $2$.', 4],
];

const reconnaitre = skill('3e-transformation', 'Reconnaître une transformation', (rng, level) => {
  const pool = level === 1 ? DESCRIPTIONS.filter(([, i]) => i < 3) : DESCRIPTIONS;
  const [text, i] = rng.pick(pool);
  const options = level === 1 ? TRANSFOS.slice(0, 3) : rng.shuffle(TRANSFOS).slice(0, 4);
  if (!options.includes(TRANSFOS[i])) options[rng.int(0, options.length - 1)] = TRANSFOS[i];
  const shuffled = rng.shuffle(options);
  return {
    prompt: `${text} De quelle transformation s'agit-il ?`,
    answer: fixedChoice(shuffled, shuffled.indexOf(TRANSFOS[i])),
    hint: 'Symétries : on retourne ou on fait un demi-tour ; translation : on glisse ; rotation : on tourne ; homothétie : on agrandit ou on réduit.',
    correction: [`C'est ${TRANSFOS[i]}.`, i === 4 ? 'Seule l’homothétie (de rapport différent de $1$ et $-1$) change les longueurs.' : 'Cette transformation conserve les longueurs, les angles et les aires.'],
  };
});

const homothetie = skill('3e-homothetie', 'Calculer une longueur image par une homothétie', (rng, level) => {
  const k = level === 1 ? rng.pick([2, 3, 0.5]) : level === 2 ? rng.pick([1.5, 2.5, 0.5, 4, 0.25]) : rng.pick([-2, -0.5, -3, 1.5, -1.5]);
  const l = rng.int(2, 12) * (Math.abs(k) < 1 ? 2 : 1);
  const v = Math.abs(k) * l;
  return {
    prompt: `Le segment $[AB]$ mesure $${l}$ cm. Quelle est la longueur de son image $[A'B']$ par une homothétie de rapport $${dec(k)}$, en cm ?`,
    answer: decimal(v),
    hint: 'Une homothétie de rapport $k$ multiplie les longueurs par $|k|$ (le signe indique seulement de quel côté du centre se trouve l’image).',
    correction: [`$A'B' = ${dec(Math.abs(k))} \\times ${l} = ${dec(v)}$ cm`, k < 0 ? 'Le rapport est négatif : la figure est aussi retournée de l’autre côté du centre.' : Math.abs(k) < 1 ? 'Le rapport est compris entre $0$ et $1$ : c’est une réduction.' : 'Le rapport est supérieur à $1$ : c’est un agrandissement.'],
  };
});

const airesVolumes = skill('3e-agrandissement', 'Effet d’un agrandissement sur les aires et les volumes', (rng, level) => {
  const k = level === 1 ? rng.pick([2, 3]) : rng.pick([2, 3, 0.5, 1.5, 4]);
  const what = level === 1 ? 'aire' : rng.pick(['aire', 'volume'] as const);
  const base = rng.int(2, 15) * (k === 0.5 ? 8 : k === 1.5 ? 8 : 1);
  const factor = what === 'aire' ? k * k : k * k * k;
  const v = base * factor;
  const unit = what === 'aire' ? 'cm²' : 'cm³';
  return {
    prompt:
      what === 'aire'
        ? `Une figure a une aire de $${base}$ ${unit}. On l'${k < 1 ? 'réduit' : 'agrandit'} : ses longueurs sont multipliées par $${dec(k)}$. Quelle est l'aire de la nouvelle figure, en ${unit} ?`
        : `Une maquette de solide a un volume de $${base}$ ${unit}. On l'${k < 1 ? 'réduit' : 'agrandit'} : ses longueurs sont multipliées par $${dec(k)}$. Quel est le nouveau volume, en ${unit} ?`,
    answer: decimal(v),
    hint: 'Si les longueurs sont multipliées par $k$, les aires sont multipliées par $k^2$ et les volumes par $k^3$.',
    correction: [`${what === 'aire' ? 'Les aires sont multipliées' : 'Les volumes sont multipliés'} par $${dec(k)}^${what === 'aire' ? 2 : 3} = ${dec(factor)}$.`, `$${base} \\times ${dec(factor)} = ${dec(v)}$ ${unit}`],
  };
});

const semblables = skill('3e-triangles-semblables', 'Utiliser des triangles semblables', (rng, level) => {
  const sides = rng.pick([
    [3, 4, 5],
    [4, 5, 6],
    [5, 6, 8],
    [2, 3, 4],
    [6, 7, 9],
  ]);
  const k = level === 1 ? rng.pick([2, 3]) : rng.pick([1.5, 2.5, 0.5, 4, 1.2]);
  const [a, b, c] = sides.map((x) => x * rng.int(1, 2));
  const i = rng.int(0, 2);
  const j = (i + 1 + rng.int(0, 1)) % 3;
  const small = [a, b, c];
  const big = small.map((x) => x * k);
  const L = ['EF', 'FG', 'EG'];
  const S = ['RS', 'ST', 'RT'];
  return {
    prompt: `Les triangles $EFG$ et $RST$ sont semblables ($E$ correspond à $R$, $F$ à $S$, $G$ à $T$). On a $EF = ${a}$, $FG = ${b}$, $EG = ${c}$ (en cm) et $${S[i]} = ${dec(big[i])}$ cm. Calcule $${S[j]}$, en cm.`,
    answer: decimal(big[j]),
    hint: 'Deux triangles semblables ont des côtés correspondants proportionnels : cherche le coefficient qui fait passer de $EFG$ à $RST$.',
    correction: [`Coefficient : $\\frac{${S[i]}}{${L[i]}} = \\frac{${dec(big[i])}}{${small[i]}} = ${dec(k)}$.`, `$${S[j]} = ${dec(k)} \\times ${L[j]} = ${dec(k)} \\times ${small[j]} = ${dec(big[j])}$ cm`],
  };
});

export const TRANSFORMATIONS_3E: Skill[] = [reconnaitre, homothetie, airesVolumes, semblables];
