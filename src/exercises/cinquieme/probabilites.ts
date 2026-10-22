import { frac } from '../fraction';
import type { Skill } from '../types';
import { decFrac, fixedChoice } from './outils';

/** 5e : vocabulaire des probabilités, situations d'équiprobabilité, événement contraire. */

const fl = (n: number, d: number) => `\\dfrac{${n}}{${d}}`;

const s = (n: number) => (n > 1 ? 's' : '');

/** « $1$ boule rouge », « $3$ boules bleues ». */
const balls = (n: number, color: string) => `$${n}$ ${n === 1 ? 'boule' : 'boules'} ${color}${s(n)}`;

const jetons = (win: number, lose: number) => `$${win}$ jeton${s(win)} gagnant${s(win)} et $${lose}$ perdant${s(lose)}`;

interface DieEvent {
  text: string;
  test: (k: number) => boolean;
}

const dieEvents = (faces: number): DieEvent[] => [
  { text: 'un nombre pair', test: (k) => k % 2 === 0 },
  { text: 'un multiple de 3', test: (k) => k % 3 === 0 },
  { text: 'un nombre premier', test: (k) => k > 1 && [...Array(k).keys()].slice(2).every((d) => k % d !== 0) },
  { text: `un nombre supérieur ou égal à ${Math.ceil(faces / 2) + 1}`, test: (k) => k >= Math.ceil(faces / 2) + 1 },
  { text: 'un nombre strictement inférieur à 3', test: (k) => k < 3 },
  { text: 'un diviseur de 12', test: (k) => 12 % k === 0 },
];

const vocabulaire: Skill = {
  id: '5e-proba-vocabulaire',
  name: 'Reconnaître un événement certain ou impossible',
  generate(rng, level) {
    const faces = level === 1 ? 6 : rng.pick([6, 8, 12]);
    const events: [string, number][] = [
      [`obtenir ${faces + rng.int(1, 4)}`, 1],
      ['obtenir 0', 1],
      [`obtenir un nombre inférieur ou égal à ${faces}`, 0],
      ['obtenir un nombre entier', 0],
      [`obtenir ${rng.int(1, faces)}`, 2],
      ['obtenir un nombre pair', 2],
      ['obtenir un nombre négatif', 1],
      [`obtenir un nombre strictement supérieur à ${faces}`, 1],
      ['obtenir un nombre plus grand que 0', 0],
      [`obtenir un multiple de ${faces}`, 2],
    ];
    const pool = level === 1 ? events.slice(0, 6) : events;
    const [text, kind] = rng.pick(pool);
    const words = ['certain', 'impossible', 'possible, mais pas certain'];
    return {
      skill: '5e-proba-vocabulaire',
      level,
      prompt: `On lance un dé équilibré à $${faces}$ faces numérotées de $1$ à $${faces}$. L'événement « ${text} » est :`,
      answer: fixedChoice(['Certain', 'Impossible', 'Possible, mais pas certain'], kind),
      hint: 'Un événement certain se réalise toujours ; un événement impossible ne se réalise jamais.',
      correction: [`Les issues possibles sont $1$, $2$, …, $${faces}$.`, `L'événement « ${text} » est ${words[kind]}.`],
    };
  },
};

const de: Skill = {
  id: '5e-proba-de',
  name: 'Calculer une probabilité avec un dé',
  generate(rng, level) {
    const faces = level === 1 ? 6 : rng.pick([6, 8, 10, 12]);
    const pool = dieEvents(faces).filter((e) => {
      const n = Array.from({ length: faces }, (_, i) => i + 1).filter(e.test).length;
      return n > 0 && n < faces;
    });
    const ev = rng.pick(level === 1 ? pool.slice(0, 2) : pool);
    const good = Array.from({ length: faces }, (_, i) => i + 1).filter(ev.test);
    const p = frac(good.length, faces);
    return {
      skill: '5e-proba-de',
      level,
      prompt: `On lance un dé équilibré à $${faces}$ faces numérotées de $1$ à $${faces}$. Quelle est la probabilité d'obtenir ${ev.text} ?`,
      answer: { kind: 'number', value: p },
      hint: 'Toutes les faces ont la même chance de sortir : probabilité = nombre d’issues favorables ÷ nombre d’issues possibles.',
      correction: [`Issues favorables : $${good.join(' ; ')}$, soit $${good.length}$ issues sur $${faces}$.`, `$p = ${fl(good.length, faces)}${p.d !== faces ? ` = ${fl(p.n, p.d)}` : ''}$`],
    };
  },
};

const urne: Skill = {
  id: '5e-proba-urne',
  name: 'Calculer une probabilité avec une urne',
  generate(rng, level) {
    const r = rng.int(1, level === 1 ? 6 : 12);
    const b = rng.int(1, level === 1 ? 6 : 12);
    const v = level === 1 ? 0 : rng.int(1, 10);
    const total = r + b + v;
    const colors = v ? `${balls(r, 'rouge')}, ${balls(b, 'bleue')} et ${balls(v, 'verte')}` : `${balls(r, 'rouge')} et ${balls(b, 'bleue')}`;
    if (level === 3 && rng.next() < 0.6) {
      const notGreen = r + b;
      const p = frac(notGreen, total);
      return {
        skill: '5e-proba-urne',
        level,
        prompt: `Une urne contient ${colors}, indiscernables au toucher. On tire une boule au hasard. Quelle est la probabilité qu'elle ne soit pas verte ?`,
        answer: { kind: 'number', value: p },
        hint: 'Compte les boules qui ne sont pas vertes.',
        correction: [`Boules non vertes : $${r} + ${b} = ${notGreen}$ sur $${total}$.`, `$p = ${fl(notGreen, total)}${p.d !== total ? ` = ${fl(p.n, p.d)}` : ''}$`],
      };
    }
    const asked = rng.pick(v ? ['rouge', 'bleue', 'verte'] : ['rouge', 'bleue']);
    const count = asked === 'rouge' ? r : asked === 'bleue' ? b : v;
    const p = frac(count, total);
    return {
      skill: '5e-proba-urne',
      level,
      prompt: `Une urne contient ${colors}, indiscernables au toucher. On tire une boule au hasard. Quelle est la probabilité de tirer une boule ${asked} ?`,
      answer: { kind: 'number', value: p },
      hint: 'Probabilité = nombre de boules de la couleur ÷ nombre total de boules.',
      correction: [`Il y a $${total}$ boules dont $${count}$ ${asked}${count > 1 ? 's' : ''}.`, `$p = ${fl(count, total)}${p.d !== total ? ` = ${fl(p.n, p.d)}` : ''}$`],
    };
  },
};

const contraire: Skill = {
  id: '5e-proba-contraire',
  name: 'Utiliser l’événement contraire',
  generate(rng, level) {
    const event = rng.pick(['il pleuve demain', 'le bus soit en retard', 'Nina gagne la partie', 'la flèche tombe sur le rouge']);
    if (level === 1) {
      const p = rng.int(1, 9) / 10;
      const q = frac(10 - p * 10, 10);
      return {
        skill: '5e-proba-contraire',
        level,
        prompt: `La probabilité que ${event} est $${decFrac(frac(p * 10, 10))}$. Quelle est la probabilité du contraire ?`,
        answer: { kind: 'number', value: q },
        hint: 'Un événement et son contraire ont des probabilités dont la somme vaut 1.',
        correction: [`$1 - ${decFrac(frac(p * 10, 10))} = ${decFrac(q)}$`],
      };
    }
    if (level === 2) {
      const d = rng.pick([3, 4, 5, 6, 7, 8, 9, 10, 12]);
      const n = rng.int(1, d - 1);
      const q = frac(d - n, d);
      return {
        skill: '5e-proba-contraire',
        level,
        prompt: `La probabilité que ${event} est $${fl(n, d)}$. Quelle est la probabilité que ce ne soit pas le cas ?`,
        answer: { kind: 'number', value: q },
        hint: 'Un événement et son contraire ont des probabilités dont la somme vaut 1.',
        correction: [`$1 - ${fl(n, d)} = ${fl(d, d)} - ${fl(n, d)} = ${fl(d - n, d)}$`],
      };
    }
    // Trois issues : rouge, bleu, vert sur une roue.
    const pr = rng.int(1, 6) * 5;
    const pb = rng.int(1, 12) * 5;
    const pv = 100 - pr - pb;
    return {
      skill: '5e-proba-contraire',
      level,
      prompt: `Une roue est partagée en secteurs rouges, bleus et verts. La probabilité d'obtenir rouge est $${decFrac(frac(pr, 100))}$, celle d'obtenir bleu est $${decFrac(frac(pb, 100))}$. Quelle est la probabilité d'obtenir vert ?`,
      answer: { kind: 'number', value: frac(pv, 100) },
      hint: 'La somme des probabilités de toutes les issues vaut 1.',
      correction: [`$1 - ${decFrac(frac(pr, 100))} - ${decFrac(frac(pb, 100))} = ${decFrac(frac(pv, 100))}$`],
    };
  },
};

const comparer: Skill = {
  id: '5e-proba-comparer',
  name: 'Comparer des chances',
  generate(rng, level) {
    for (;;) {
      const ra = rng.int(1, level === 1 ? 6 : 12);
      const ba = rng.int(1, level === 1 ? 6 : 12);
      let rb: number;
      let bb: number;
      if (level === 3 && rng.next() < 0.3) {
        // Même proportion, nombres différents : autant de chances.
        const k = rng.int(2, 3);
        rb = ra * k;
        bb = ba * k;
      } else {
        rb = rng.int(1, 15);
        bb = rng.int(1, 15);
      }
      const pa = frac(ra, ra + ba);
      const pb = frac(rb, rb + bb);
      const cmp = pa.n * pb.d - pb.n * pa.d;
      if (cmp === 0 && level < 3) continue;
      if (ra === rb && ba === bb) continue;
      return {
        skill: '5e-proba-comparer',
        level,
        prompt: `Le sac A contient ${jetons(ra, ba)}. Le sac B contient ${jetons(rb, bb)}. On tire un jeton au hasard : dans quel sac a-t-on le plus de chances de gagner ?`,
        answer: fixedChoice(['Le sac A', 'Le sac B', 'Autant de chances'], cmp > 0 ? 0 : cmp < 0 ? 1 : 2),
        hint: 'Compare les probabilités de gagner, pas le nombre de jetons gagnants.',
        correction: [
          `Sac A : $p = ${fl(ra, ra + ba)}$ ; sac B : $p = ${fl(rb, rb + bb)}$.`,
          `Au même dénominateur : $${fl(ra * (rb + bb), (ra + ba) * (rb + bb))}$ et $${fl(rb * (ra + ba), (ra + ba) * (rb + bb))}$.`,
          cmp > 0 ? 'On a plus de chances de gagner avec le sac A.' : cmp < 0 ? 'On a plus de chances de gagner avec le sac B.' : 'Les deux sacs donnent autant de chances.',
        ],
      };
    }
  },
};

export const PROBABILITES_SKILLS: Skill[] = [vocabulaire, de, urne, contraire, comparer];
