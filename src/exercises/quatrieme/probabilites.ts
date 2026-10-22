import { frac } from '../fraction';
import type { Skill } from '../types';
import { dec, fixedChoice, numDec, numF, skill, tex } from './util';

/** Chapitre « Probabilités » (4e) : équiprobabilité, événement contraire, vocabulaire. */

const fracHint = 'Si les issues sont équiprobables : $P = \\dfrac{\\text{nombre d’issues favorables}}{\\text{nombre total d’issues}}$.';

const urne = skill('4e-proba-urne', 'Calculer une probabilité dans une urne', (rng, level) => {
  const colors = ['rouges', 'bleues', 'vertes', 'jaunes'];
  const k = level === 1 ? 2 : 3;
  const counts = Array.from({ length: k }, () => rng.int(1, level === 3 ? 15 : 9));
  const total = counts.reduce((a, b) => a + b, 0);
  const i = rng.int(0, k - 1);
  const notColor = level === 3 && rng.next() < 0.5;
  const fav = notColor ? total - counts[i] : counts[i];
  const p = frac(fav, total);
  const desc = counts.map((c, j) => `${c} boule${c > 1 ? 's' : ''} ${c > 1 ? colors[j] : colors[j].slice(0, -1)}`).join(', ').replace(/, ([^,]*)$/, ' et $1');
  return {
    prompt: `Une urne contient ${desc}, indiscernables au toucher. On tire une boule au hasard. Quelle est la probabilité qu’elle ${notColor ? 'ne soit pas' : 'soit'} ${colors[i].slice(0, -1)} ? (fraction ou décimal)`,
    answer: numF(p),
    hint: fracHint,
    correction: [`Il y a ${total} boules en tout, dont ${fav} favorable${fav > 1 ? 's' : ''} : $P = \\dfrac{${fav}}{${total}}${p.d !== total ? ` = ${tex(p)}` : ''}$.`],
  };
});

const de = skill('4e-proba-de', 'Calculer une probabilité avec un dé', (rng, level) => {
  const faces = level === 1 ? 6 : rng.pick([6, 8, 10, 12, 20]);
  const events = [
    { name: 'un nombre pair', test: (x: number) => x % 2 === 0 },
    { name: 'un multiple de 3', test: (x: number) => x % 3 === 0 },
    { name: `un nombre supérieur ou égal à ${Math.ceil(faces / 2) + 1}`, test: (x: number) => x >= Math.ceil(faces / 2) + 1 },
    { name: 'un nombre premier', test: (x: number) => [2, 3, 5, 7, 11, 13, 17, 19].includes(x) },
  ];
  if (level === 3) events.push({ name: 'un diviseur de 12', test: (x: number) => 12 % x === 0 });
  const e = rng.pick(level === 1 ? events.slice(0, 3) : events);
  const fav = Array.from({ length: faces }, (_, i) => i + 1).filter(e.test);
  const p = frac(fav.length, faces);
  return {
    prompt: `On lance un dé équilibré à ${faces} faces numérotées de 1 à ${faces}. Quelle est la probabilité d’obtenir ${e.name} ? (fraction ou décimal)`,
    answer: numF(p),
    hint: fracHint,
    correction: [`Issues favorables : ${fav.join(' ; ')}, soit ${fav.length} sur ${faces}.`, `$P = \\dfrac{${fav.length}}{${faces}}${p.d !== faces ? ` = ${tex(p)}` : ''}$`],
  };
});

const contraire = skill('4e-evenement-contraire', 'Utiliser l’événement contraire', (rng, level) => {
  if (level === 1 || rng.next() < 0.5) {
    const p = rng.int(1, 99) / 100;
    return {
      prompt: `La probabilité qu’il pleuve demain est $${dec(p)}$. Quelle est la probabilité qu’il ne pleuve pas ?`,
      answer: numDec(1 - p),
      hint: 'La probabilité de l’événement contraire est $1 - P(A)$.',
      correction: [`$1 - ${dec(p)} = ${dec(Math.round((1 - p) * 100) / 100)}$`],
    };
  }
  const p1 = rng.int(5, 40) / 100;
  const p2 = rng.int(5, 40) / 100;
  const p3 = Math.round((1 - p1 - p2) * 100) / 100;
  return {
    prompt: `Une roue de loterie a trois zones : rouge, bleue et verte. $P(\\text{rouge}) = ${dec(p1)}$ et $P(\\text{bleue}) = ${dec(p2)}$. Quelle est la probabilité de tomber sur la zone verte ?`,
    answer: numDec(p3),
    hint: 'La somme des probabilités de toutes les issues vaut 1.',
    correction: [`$P(\\text{verte}) = 1 - ${dec(p1)} - ${dec(p2)} = ${dec(p3)}$`],
  };
});

const cartes = skill('4e-proba-cartes', 'Calculer une probabilité avec un jeu de cartes', (rng, level) => {
  const deck = level === 1 ? 32 : rng.pick([32, 52]);
  const ranks = deck / 4;
  const events = [
    { name: 'un cœur', fav: ranks, why: `${ranks} cœurs sur ${deck} cartes` },
    { name: 'un roi', fav: 4, why: `4 rois sur ${deck} cartes` },
    { name: 'une carte rouge', fav: deck / 2, why: `${deck / 2} cartes rouges (cœur ou carreau)` },
    { name: 'une figure (valet, dame ou roi)', fav: 12, why: `3 figures par couleur, soit 12 figures` },
    { name: 'un as noir', fav: 2, why: '2 as noirs (pique et trèfle)' },
  ];
  if (level === 3) events.push({ name: 'un cœur ou un roi', fav: ranks + 3, why: `${ranks} cœurs et 3 autres rois (le roi de cœur n’est compté qu’une fois)` });
  const e = rng.pick(level === 1 ? events.slice(0, 3) : events);
  const p = frac(e.fav, deck);
  return {
    prompt: `On tire une carte au hasard dans un jeu de ${deck} cartes. Quelle est la probabilité d’obtenir ${e.name} ? (fraction ou décimal)`,
    answer: numF(p),
    hint: `Un jeu de ${deck} cartes a 4 couleurs (pique, cœur, carreau, trèfle) de ${ranks} cartes chacune.`,
    correction: [`Il y a ${e.why}.`, `$P = \\dfrac{${e.fav}}{${deck}} = ${tex(p)}$`],
  };
});

const vocabulaire = skill('4e-proba-vocabulaire', 'Comprendre le vocabulaire des probabilités', (rng, level) => {
  const facts = [
    { q: 'On lance un dé à 6 faces. L’événement « obtenir 7 » est…', a: 0 },
    { q: 'On lance un dé à 6 faces. L’événement « obtenir un nombre entre 1 et 6 » est…', a: 1 },
    { q: 'On lance un dé à 6 faces. L’événement « obtenir 3 » est…', a: 2 },
    { q: 'Une probabilité égale à $0$ correspond à un événement…', a: 0 },
    { q: 'Une probabilité égale à $1$ correspond à un événement…', a: 1 },
  ];
  if (level >= 2) {
    const p = rng.int(1, 9) / 10;
    facts.push({ q: `Un événement a une probabilité de $${dec(p)}$. Il est…`, a: 2 });
  }
  const f = rng.pick(facts);
  const options = ['impossible', 'certain', 'possible mais pas certain'];
  return {
    prompt: f.q,
    answer: fixedChoice(options, f.a),
    hint: 'Une probabilité est toujours entre 0 (impossible) et 1 (certain).',
    correction: [`Il est ${options[f.a]}.`],
  };
});

export const PROBABILITES_SKILLS: Skill[] = [urne, de, contraire, cartes, vocabulaire];
