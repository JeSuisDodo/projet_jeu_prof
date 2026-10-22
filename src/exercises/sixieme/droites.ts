import type { Skill } from '../types';
import { byLevel, decimal, fix, fixedChoice, makeChoice, num, numAnswer, skill } from './outils';

/** Droites, segments, demi-droites, parallèles et perpendiculaires, cercles. */

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'M', 'N', 'R', 'S', 'T'];

const notations: Skill = skill('notations', 'Utiliser les notations de géométrie', (rng, level) => {
  const [p, q] = rng.shuffle(LETTERS).slice(0, 2);
  const all = {
    droite: `$(${p}${q})$`,
    segment: `$[${p}${q}]$`,
    demi: `$[${p}${q})$`,
    demiInv: `$[${q}${p})$`,
    longueur: `$${p}${q}$`,
  };
  const cases: [string, string][] = [
    [`la droite passant par $${p}$ et $${q}$`, all.droite],
    [`le segment d'extrémités $${p}$ et $${q}$`, all.segment],
    [`la longueur du segment d'extrémités $${p}$ et $${q}$`, all.longueur],
    [`la demi-droite d'origine $${p}$ passant par $${q}$`, all.demi],
    [`la demi-droite d'origine $${q}$ passant par $${p}$`, all.demiInv],
  ];
  const [text, good] = rng.pick(byLevel(level, cases.slice(0, 3), cases.slice(0, 4), cases));
  return {
    prompt: `Comment note-t-on ${text} ?`,
    answer: makeChoice(rng, good, Object.values(all).filter((x) => x !== good), () => `$${q}${p}$`),
    hint: 'Parenthèses : la droite ; crochets : le segment ; un crochet et une parenthèse : la demi-droite (le crochet du côté de l’origine) ; sans rien : la longueur.',
    correction: [`On note ${text} : ${good}.`],
  };
});

const alignes: Skill = skill('points-alignes', 'Calculer une longueur sur un segment', (rng, level) => {
  const ab = decimal(rng, 1, 12, level === 1 ? 0 : 1);
  const bc = decimal(rng, 1, 12, level === 1 ? 0 : 1);
  const ac = fix(ab + bc);
  if (level === 3 && rng.next() < 0.6) {
    return {
      prompt: `Les points $A$, $B$ et $C$ sont alignés dans cet ordre. $AC = ${num(ac)}$ cm et $AB = ${num(ab)}$ cm. Calcule $BC$ (en cm).`,
      answer: numAnswer(bc),
      hint: '$B$ est entre $A$ et $C$, donc $AB + BC = AC$.',
      correction: [`$BC = AC - AB = ${num(ac)} - ${num(ab)} = ${num(bc)}$ cm.`],
    };
  }
  return {
    prompt: `Le point $B$ appartient au segment $[AC]$. $AB = ${num(ab)}$ cm et $BC = ${num(bc)}$ cm. Calcule $AC$ (en cm).`,
    answer: numAnswer(ac),
    hint: 'Si $B$ est sur le segment $[AC]$, alors $AB + BC = AC$.',
    correction: [`$AC = AB + BC = ${num(ab)} + ${num(bc)} = ${num(ac)}$ cm.`],
  };
});

const milieu: Skill = skill('milieu', 'Utiliser le milieu d’un segment', (rng, level) => {
  const half = decimal(rng, 1, 15, level === 1 ? 0 : level === 2 ? 1 : 2);
  const full = fix(2 * half);
  const askHalf = rng.next() < 0.5;
  return {
    prompt: askHalf
      ? `$I$ est le milieu du segment $[AB]$ et $AB = ${num(full)}$ cm. Calcule $AI$ (en cm).`
      : `$I$ est le milieu du segment $[AB]$ et $IB = ${num(half)}$ cm. Calcule $AB$ (en cm).`,
    answer: numAnswer(askHalf ? half : full),
    hint: 'Le milieu partage le segment en deux segments de même longueur : $AI = IB = \\frac{AB}{2}$.',
    correction: [askHalf ? `$AI = ${num(full)} \\div 2 = ${num(half)}$ cm.` : `$AB = 2 \\times ${num(half)} = ${num(full)}$ cm.`],
  };
});

const POSITIONS = ['Elles sont parallèles', 'Elles sont perpendiculaires', 'On ne peut pas conclure'];

const paralleles: Skill = skill('paralleles-perpendiculaires', 'Utiliser parallèles et perpendiculaires', (rng, level) => {
  const rel = () => rng.pick(['par', 'perp'] as const);
  const r1 = level === 1 ? 'perp' : rel();
  const r2 = level === 1 ? 'perp' : rel();
  const sym = (r: 'par' | 'perp') => (r === 'par' ? '\\parallel' : '\\perp');
  const result = r1 === r2 ? 0 : 1;
  const rule =
    r1 === 'par' && r2 === 'par'
      ? 'Si deux droites sont parallèles à une même troisième, alors elles sont parallèles entre elles.'
      : r1 === 'perp' && r2 === 'perp'
        ? 'Si deux droites sont perpendiculaires à une même troisième, alors elles sont parallèles entre elles.'
        : 'Si deux droites sont parallèles, toute droite perpendiculaire à l’une est perpendiculaire à l’autre.';
  return {
    prompt: `On sait que $(d_1) ${sym(r1)} (d_2)$ et $(d_2) ${sym(r2)} (d_3)$. Que peut-on dire des droites $(d_1)$ et $(d_3)$ ?`,
    answer: fixedChoice(POSITIONS, result),
    hint: 'Fais un schéma à main levée avec les trois droites.',
    correction: [rule, `Donc $(d_1) ${result === 0 ? '\\parallel' : '\\perp'} (d_3)$.`],
  };
});

const cercle: Skill = skill('cercle', 'Utiliser rayon et diamètre d’un cercle', (rng, level) => {
  const r = decimal(rng, 1, 12, level === 1 ? 0 : 1);
  const d = fix(2 * r);
  const kind = byLevel(level, rng.pick(['rayon', 'diametre']), rng.pick(['rayon', 'diametre', 'point']), rng.pick(['point', 'position']));
  if (kind === 'position') {
    const dist = fix(r + rng.pick([-1, 0, 1]) * decimal(rng, 0.2, Math.max(0.2, r - 0.5), 1));
    const where = dist < r ? 0 : dist === r ? 1 : 2;
    return {
      prompt: `Un cercle a pour centre $O$ et pour diamètre $${num(d)}$ cm. Le point $M$ est tel que $OM = ${num(dist)}$ cm. Où se trouve $M$ ?`,
      answer: fixedChoice(['À l’intérieur du cercle', 'Sur le cercle', 'À l’extérieur du cercle'], where),
      hint: 'Compare la distance $OM$ au rayon du cercle.',
      correction: [`Le rayon vaut $${num(d)} \\div 2 = ${num(r)}$ cm.`, `$OM ${['<', '=', '>'][where]} ${num(r)}$ : $M$ est ${['à l’intérieur du cercle', 'sur le cercle', 'à l’extérieur du cercle'][where]}.`],
    };
  }
  if (kind === 'point') {
    return {
      prompt: `Le point $M$ est sur le cercle de centre $O$ et de diamètre $${num(d)}$ cm. Quelle est la longueur $OM$ (en cm) ?`,
      answer: numAnswer(r),
      hint: 'Tous les points du cercle sont à la même distance du centre : le rayon.',
      correction: [`$OM$ est un rayon : $OM = ${num(d)} \\div 2 = ${num(r)}$ cm.`],
    };
  }
  const askRadius = kind === 'rayon';
  return {
    prompt: askRadius ? `Un cercle a pour diamètre $${num(d)}$ cm. Quel est son rayon (en cm) ?` : `Un cercle a pour rayon $${num(r)}$ cm. Quel est son diamètre (en cm) ?`,
    answer: numAnswer(askRadius ? r : d),
    hint: 'Le diamètre est le double du rayon.',
    correction: [askRadius ? `$${num(d)} \\div 2 = ${num(r)}$ cm.` : `$2 \\times ${num(r)} = ${num(d)}$ cm.`],
  };
});

const vocabulaire: Skill = skill('vocabulaire-cercle', 'Connaître le vocabulaire du cercle', (rng, level) => {
  const cases: [string, string][] = [
    ['Un segment qui joint le centre à un point du cercle est', 'un rayon'],
    ['Un segment qui joint deux points du cercle en passant par le centre est', 'un diamètre'],
    ['Un segment qui joint deux points du cercle sans passer par le centre est', 'une corde'],
    ['Une portion de cercle comprise entre deux de ses points est', 'un arc de cercle'],
  ];
  const [text, good] = rng.pick(byLevel(level, cases.slice(0, 2), cases.slice(0, 3), cases));
  return {
    prompt: `${text} :`,
    answer: makeChoice(rng, good, ['un rayon', 'un diamètre', 'une corde', 'un arc de cercle', 'le centre'].filter((x) => x !== good), () => 'une droite'),
    hint: 'Un diamètre est une corde particulière : celle qui passe par le centre.',
    correction: [`${text} ${good}.`],
  };
});

export const DROITES_SKILLS: Skill[] = [notations, alignes, milieu, paralleles, cercle, vocabulaire];
