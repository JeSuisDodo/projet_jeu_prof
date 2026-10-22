import type { Skill } from '../types';
import { makeChoice, pair, par, skill } from './util';

/** Chapitre « Transformations du plan » (4e) : symétries, translation, rotation, dans un repère. */

const pt = (name: string, x: number, y: number) => `${name}(${x}\\,;\\,${y})`;
const XY: [string, string] = ['x', 'y'];

const translation = skill('4e-translation', 'Construire l’image par une translation', (rng, level) => {
  const m = level === 1 ? 5 : 9;
  const [ax, ay, bx, by, px, py] = Array.from({ length: 6 }, () => rng.int(-m, m));
  const dx = bx - ax;
  const dy = by - ay;
  return {
    prompt: `Dans un repère, $${pt('A', ax, ay)}$, $${pt('B', bx, by)}$ et $${pt('P', px, py)}$. Quelles sont les coordonnées de $P'$, image de $P$ par la translation qui transforme $A$ en $B$ ?`,
    answer: pair(px + dx, py + dy, XY),
    hint: 'La translation fait glisser chaque point du même déplacement que de $A$ à $B$ : même décalage horizontal, même décalage vertical.',
    correction: [
      `De $A$ à $B$ : on se déplace de $${dx}$ horizontalement et de $${dy}$ verticalement.`,
      `$P'$ a pour coordonnées $(${px} + ${par(dx)}\\,;\\,${py} + ${par(dy)}) = (${px + dx}\\,;\\,${py + dy})$.`,
    ],
  };
});

const symetrieCentrale = skill('4e-symetrie-centrale', 'Construire l’image par une symétrie centrale', (rng, level) => {
  const m = level === 1 ? 5 : 9;
  const [ox, oy] = level === 1 ? [0, 0] : [rng.int(-4, 4), rng.int(-4, 4)];
  const [px, py] = [rng.int(-m, m), rng.int(-m, m)];
  return {
    prompt: `Dans un repère, quelles sont les coordonnées de l’image de $${pt('P', px, py)}$ par la symétrie de centre $${pt('O', ox, oy)}$ ?`,
    answer: pair(2 * ox - px, 2 * oy - py, XY),
    hint: 'Le centre de symétrie est le milieu du segment qui joint un point à son image.',
    correction: [`$O$ est le milieu de $[PP']$ : $x' = 2 \\times ${par(ox)} - ${par(px)} = ${2 * ox - px}$ et $y' = 2 \\times ${par(oy)} - ${par(py)} = ${2 * oy - py}$.`],
  };
});

const rotation = skill('4e-rotation', 'Construire l’image par une rotation', (rng, level) => {
  const [px, py] = [rng.nonZero(-6, 6), rng.nonZero(-6, 6)];
  const angle = level === 1 ? 180 : rng.pick([90, -90, 180]);
  const [ox, oy] = level === 3 ? [rng.int(-3, 3), rng.int(-3, 3)] : [0, 0];
  const ux = px - ox;
  const uy = py - oy;
  const [rx, ry] = angle === 180 ? [-ux, -uy] : angle === 90 ? [-uy, ux] : [uy, -ux];
  const sens = angle === 90 ? 'de 90° dans le sens inverse des aiguilles d’une montre' : angle === -90 ? 'de 90° dans le sens des aiguilles d’une montre' : 'd’un demi-tour (180°)';
  return {
    prompt: `Dans un repère orthonormé, on fait tourner $${pt('P', px, py)}$ autour de $${pt('O', ox, oy)}$ ${sens}. Quelles sont les coordonnées de son image $P'$ ?`,
    answer: pair(ox + rx, oy + ry, XY),
    hint:
      angle === 180
        ? 'Un demi-tour autour de $O$, c’est la symétrie de centre $O$.'
        : 'Autour de l’origine, un quart de tour direct envoie $(x\\,;\\,y)$ sur $(-y\\,;\\,x)$, un quart de tour indirect sur $(y\\,;\\,-x)$.',
    correction: [
      ...(ox !== 0 || oy !== 0 ? [`Déplacement de $O$ à $P$ : $(${ux}\\,;\\,${uy})$. Après rotation, il devient $(${rx}\\,;\\,${ry})$.`] : []),
      `$P'(${ox + rx}\\,;\\,${oy + ry})$`,
    ],
  };
});

const FACTS = [
  { q: 'Une figure glisse, sans tourner ni se retourner, toujours dans la même direction, le même sens et de la même longueur. De quelle transformation s’agit-il ?', a: 0 },
  { q: 'Une figure tourne autour d’un point fixe d’un angle donné. De quelle transformation s’agit-il ?', a: 1 },
  { q: 'Une figure se retourne comme par pliage le long d’une droite. De quelle transformation s’agit-il ?', a: 2 },
  { q: 'Chaque point $M$ a pour image le point $M\'$ tel que $O$ est le milieu de $[MM\']$. De quelle transformation s’agit-il ?', a: 3 },
  { q: 'Une rotation de 180° autour d’un point $O$ est aussi…', a: 3 },
  { q: 'Les segments $[AA\']$, $[BB\']$ et $[CC\']$ sont parallèles et de même longueur, et $ABB\'A\'$ est un parallélogramme. $A\'B\'C\'$ est l’image de $ABC$ par…', a: 0 },
  { q: 'La droite $(d)$ est la médiatrice de $[MM\']$ pour tout point $M$ de la figure. L’image s’obtient par…', a: 2 },
];
const NAMES = ['une translation', 'une rotation', 'une symétrie axiale', 'une symétrie centrale'];

const reconnaitre = skill('4e-reconnaitre-transformation', 'Reconnaître une transformation', (rng, level) => {
  const f = rng.pick(level === 1 ? FACTS.slice(0, 4) : FACTS);
  return {
    prompt: f.q,
    answer: makeChoice(rng, NAMES[f.a], NAMES.filter((_, i) => i !== f.a), () => 'une homothétie'),
    hint: 'Translation : glissement. Rotation : on tourne autour d’un point. Symétrie axiale : pliage. Symétrie centrale : demi-tour.',
    correction: [`Il s’agit d’${NAMES[f.a]}.`],
  };
});

export const TRANSFORMATIONS_SKILLS: Skill[] = [translation, symetrieCentrale, rotation, reconnaitre];
