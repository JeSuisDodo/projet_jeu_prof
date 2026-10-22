import { frac, fracLatex } from '../fraction';
import type { Skill } from '../types';
import { dec, fixedChoice, fracOf } from './outils';

/** Chapitre 13 de 2nde : probabilités et échantillonnage. */

/** « a/b = forme simplifiée », sans répéter la fraction quand elle est déjà irréductible. */
function ratio(n: number, d: number): string {
  const f = fracLatex(frac(n, d));
  const raw = `\\frac{${n}}{${d}}`;
  return raw === f ? raw : `${raw} = ${f}`;
}

const urne: Skill = {
  id: '2nde-proba-simple',
  name: 'Calculer une probabilité simple',
  generate(rng, level) {
    const colors = ['rouges', 'bleues', 'vertes'];
    const counts = colors.map(() => rng.int(1, level === 1 ? 6 : 12));
    const total = counts.reduce((a, b) => a + b, 0);
    const i = rng.int(0, 2);
    const not = level === 3 && rng.next() < 0.5;
    const favorable = not ? total - counts[i] : counts[i];
    const p = frac(favorable, total);
    const color = colors[i].replace(/s$/, '');
    return {
      skill: '2nde-proba-simple',
      level,
      prompt: `Une urne contient $${counts[0]}$ boules rouges, $${counts[1]}$ bleues et $${counts[2]}$ vertes. On tire une boule au hasard. Quelle est la probabilité qu'elle ${not ? 'ne soit pas' : 'soit'} ${color} ?`,
      answer: { kind: 'number', value: p },
      hint: 'En situation d’équiprobabilité : $P(A) = \\frac{\\text{nombre d’issues favorables}}{\\text{nombre total d’issues}}$.',
      correction: [
        `Il y a $${total}$ boules en tout, dont $${favorable}$ ${not ? `qui ne sont pas ${colors[i]}` : colors[i]}.`,
        `$P = ${ratio(favorable, total)}$`,
      ],
    };
  },
};

const contraire: Skill = {
  id: '2nde-proba-contraire',
  name: 'Utiliser l’événement contraire',
  generate(rng, level) {
    const p = level === 1 ? rng.int(1, 9) / 10 : rng.int(1, 99) / 100;
    return {
      skill: '2nde-proba-contraire',
      level,
      prompt: `On sait que $P(A) = ${dec(p)}$. Que vaut $P(\\overline{A})$ ?`,
      answer: { kind: 'number', value: fracOf(1 - p) },
      hint: '$P(\\overline{A}) = 1 - P(A)$',
      correction: [`$P(\\overline{A}) = 1 - ${dec(p)} = ${dec(1 - p)}$`],
    };
  },
};

const reunion: Skill = {
  id: '2nde-proba-reunion',
  name: 'Calculer la probabilité d’une réunion',
  generate(rng, level) {
    // On tire P(A ∩ B) puis les deux probabilités, en centièmes.
    const inter = level === 1 ? 0 : rng.int(1, 20);
    const pa = inter + rng.int(5, 35);
    const pb = inter + rng.int(5, 35);
    const union = pa + pb - inter;
    const askInter = level === 3 && rng.next() < 0.5;
    const h = (v: number) => dec(v / 100);
    return {
      skill: '2nde-proba-reunion',
      level,
      prompt: askInter
        ? `On sait que $P(A) = ${h(pa)}$, $P(B) = ${h(pb)}$ et $P(A \\cup B) = ${h(union)}$. Que vaut $P(A \\cap B)$ ?`
        : inter === 0
          ? `$A$ et $B$ sont incompatibles, avec $P(A) = ${h(pa)}$ et $P(B) = ${h(pb)}$. Que vaut $P(A \\cup B)$ ?`
          : `On sait que $P(A) = ${h(pa)}$, $P(B) = ${h(pb)}$ et $P(A \\cap B) = ${h(inter)}$. Que vaut $P(A \\cup B)$ ?`,
      answer: { kind: 'number', value: frac(askInter ? inter : union, 100) },
      hint: '$P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$',
      correction: askInter
        ? [`$P(A \\cap B) = P(A) + P(B) - P(A \\cup B) = ${h(pa)} + ${h(pb)} - ${h(union)} = ${h(inter)}$`]
        : [`$P(A \\cup B) = ${h(pa)} + ${h(pb)} - ${h(inter)} = ${h(union)}$`],
    };
  },
};

const tableau: Skill = {
  id: '2nde-tableau-double',
  name: 'Lire un tableau à double entrée',
  generate(rng, level) {
    const c = [rng.int(5, 40), rng.int(5, 40), rng.int(5, 40), rng.int(5, 40)];
    const [fl, fn, gl, gn] = c;
    const total = fl + fn + gl + gn;
    const table = `\\begin{array}{|l|c|c|c|} \\hline & \\text{Latin} & \\text{Pas latin} & \\text{Total} \\\\ \\hline \\text{Filles} & ${fl} & ${fn} & ${fl + fn} \\\\ \\hline \\text{Garçons} & ${gl} & ${gn} & ${gl + gn} \\\\ \\hline \\text{Total} & ${fl + gl} & ${fn + gn} & ${total} \\\\ \\hline \\end{array}`;
    const questions = [
      { q: 'soit une fille', fav: fl + fn, why: 'filles' },
      { q: 'fasse du latin', fav: fl + gl, why: 'latinistes' },
      { q: 'soit une fille qui fait du latin', fav: fl, why: 'filles latinistes' },
      { q: 'soit un garçon qui ne fait pas de latin', fav: gn, why: 'garçons non latinistes' },
      { q: 'soit une fille ou fasse du latin', fav: fl + fn + gl, why: 'filles ou latinistes' },
    ];
    const pool = level === 1 ? questions.slice(0, 2) : level === 2 ? questions.slice(0, 4) : questions;
    const pick = rng.pick(pool);
    const p = frac(pick.fav, total);
    return {
      skill: '2nde-tableau-double',
      level,
      prompt: `Dans un lycée, on a relevé qui fait du latin : $${table}$ On choisit un élève au hasard. Quelle est la probabilité qu'il ${pick.q} ?`,
      answer: { kind: 'number', value: p },
      hint: 'Repère dans le tableau le nombre d’élèves concernés, puis divise par l’effectif total.',
      correction: [`Il y a $${pick.fav}$ ${pick.why} sur $${total}$ élèves.`, `$P = ${ratio(pick.fav, total)}$`],
    };
  },
};

const des: Skill = {
  id: '2nde-deux-des',
  name: 'Lancer deux dés',
  generate(rng, level) {
    const kind = level === 1 ? 'somme' : rng.pick(['somme', 'double', 'produit'] as const);
    let fav = 0;
    let event: string;
    if (kind === 'somme') {
      const s = rng.int(2, 12);
      event = `la somme des deux dés soit égale à $${s}$`;
      for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (a + b === s) fav++;
    } else if (kind === 'double') {
      event = 'les deux dés donnent le même nombre';
      fav = 6;
    } else {
      const parity = rng.next() < 0.5;
      event = `le produit des deux dés soit ${parity ? 'pair' : 'impair'}`;
      for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if ((a * b) % 2 === (parity ? 0 : 1)) fav++;
    }
    const p = frac(fav, 36);
    return {
      skill: '2nde-deux-des',
      level,
      prompt: `On lance deux dés équilibrés à six faces. Quelle est la probabilité que ${event} ?`,
      answer: { kind: 'number', value: p },
      hint: 'Il y a $6 \\times 6 = 36$ issues équiprobables : dresse le tableau des 36 couples.',
      correction: [`Sur les $36$ couples possibles, $${fav}$ réalisent l'événement.`, `$P = ${ratio(fav, 36)}$`],
    };
  },
};

const echantillon: Skill = {
  id: '2nde-echantillonnage',
  name: 'Juger un échantillon',
  generate(rng, level) {
    const n = rng.pick([100, 400, 625, 2500]);
    const margin = 1 / Math.sqrt(n);
    const p = rng.pick([0.2, 0.3, 0.4, 0.5, 0.6]);
    if (level === 1) {
      const k = Math.round(n * rng.int(10, 70) / 100);
      return {
        skill: '2nde-echantillonnage',
        level,
        prompt: `Sur un échantillon de $${n}$ graines plantées, $${k}$ ont germé. Quelle est la fréquence de germination ?`,
        answer: { kind: 'number', value: frac(k, n) },
        hint: 'Fréquence = effectif ÷ taille de l’échantillon.',
        correction: [`$f = \\frac{${k}}{${n}} = ${dec(k / n)}$`],
      };
    }
    const conform = rng.next() < 0.5;
    // Fréquence observée, en centièmes, nettement dedans ou dehors de [p - 1/√n ; p + 1/√n].
    const offset = conform ? rng.int(0, Math.floor(margin * 100) - 1) : Math.ceil(margin * 100) + rng.int(1, 6);
    const f = Math.round((p + rng.sign() * offset / 100) * 100) / 100;
    const k = Math.round(f * n);
    return {
      skill: '2nde-echantillonnage',
      level,
      prompt: `Un fabricant affirme que $${dec(p * 100)}\\,\\%$ de ses ampoules durent plus de 5 ans. Sur un échantillon de $${n}$ ampoules, $${k}$ ont duré plus de 5 ans. Au seuil de 95 %, cet échantillon est-il compatible avec l'affirmation ?`,
      answer: fixedChoice(['Oui', 'Non'], conform ? 0 : 1),
      hint: 'Pour un échantillon de taille $n$, environ 95 % des fréquences observées tombent dans $\\left[p - \\frac{1}{\\sqrt{n}}\\,;\\,p + \\frac{1}{\\sqrt{n}}\\right]$.',
      correction: [
        `$f = \\frac{${k}}{${n}} = ${dec(k / n)}$ et $\\frac{1}{\\sqrt{${n}}} = ${dec(margin)}$.`,
        `L'intervalle est $[${dec(p - margin)}\\,;\\,${dec(p + margin)}]$.`,
        conform ? `$${dec(k / n)}$ est dans l'intervalle : l'échantillon est compatible.` : `$${dec(k / n)}$ est en dehors : l'affirmation est mise en doute.`,
      ],
    };
  },
};

export const PROBABILITES_SKILLS: Skill[] = [urne, contraire, reunion, tableau, des, echantillon];
