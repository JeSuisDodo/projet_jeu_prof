import { frac } from '../fraction';
import type { Rng } from '../rng';
import type { Level, Skill } from '../types';
import { enrich, variant } from '../variantes';
import { dec, fixedChoice, fracOf, par } from './outils';

/** Chapitre 12 de 2nde : statistique descriptive (moyenne, médiane, quartiles, étendue). */

const series = (rng: Rng, n: number, min: number, max: number) => Array.from({ length: n }, () => rng.int(min, max));
const list = (xs: number[]) => `$${xs.join('$ ; $')}$`;
const sorted = (xs: number[]) => [...xs].sort((a, b) => a - b);

export function median(xs: number[]): number {
  const s = sorted(xs);
  const n = s.length;
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
}

/** Quartiles au sens du programme : plus petite valeur de la série telle qu'au moins 25 % (75 %) des valeurs lui soient inférieures ou égales. */
export const quartile = (xs: number[], q: 1 | 3) => sorted(xs)[Math.ceil((q * xs.length) / 4) - 1];

const moyenne: Skill = {
  id: '2nde-moyenne',
  name: 'Calculer une moyenne',
  generate(rng, level) {
    const n = level === 1 ? rng.int(4, 5) : rng.int(5, 8);
    const xs = series(rng, n, level === 3 ? -5 : 0, 20);
    // La moyenne doit tomber juste (au plus deux décimales) : on ajuste la dernière note.
    const step = n === 4 || n === 5 || n === 8 ? 1 : n;
    const sum = xs.reduce((a, b) => a + b, 0);
    const extra = (step - (sum % step)) % step;
    xs[n - 1] += extra;
    const total = sum + extra;
    const mean = total / n;
    return {
      skill: '2nde-moyenne',
      level,
      prompt: `Calcule la moyenne de la série : ${list(xs)}.`,
      answer: { kind: 'number', value: frac(total, n) },
      hint: 'Moyenne = somme des valeurs ÷ nombre de valeurs.',
      correction: [`La somme vaut $${xs.map(par).join(' + ')} = ${total}$.`, `$\\bar{x} = \\frac{${total}}{${n}} = ${dec(mean)}$`],
    };
  },
};

const moyennePonderee: Skill = {
  id: '2nde-moyenne-ponderee',
  name: 'Calculer une moyenne pondérée',
  generate(rng, level) {
    const k = level === 1 ? 3 : 4;
    const values = sorted([...new Set(series(rng, k + 3, 0, 20))]).slice(0, k);
    while (values.length < k) values.push(values[values.length - 1] + 1);
    const counts = values.map(() => rng.int(1, level === 3 ? 12 : 6));
    const N = counts.reduce((a, b) => a + b, 0);
    // Total des effectifs ramené à un diviseur de 100 pour une moyenne décimale exacte.
    const target = [2, 4, 5, 10, 20, 25, 50].find((d) => d >= N) ?? 50;
    counts[counts.length - 1] += target - N;
    const total = values.reduce((acc, v, i) => acc + v * counts[i], 0);
    const table = `\\begin{array}{|c|${'c|'.repeat(k)}} \\hline \\text{Note} & ${values.join(' & ')} \\\\ \\hline \\text{Effectif} & ${counts.join(' & ')} \\\\ \\hline \\end{array}`;
    return {
      skill: '2nde-moyenne-ponderee',
      level,
      prompt: `Voici les notes d'un contrôle : $${table}$ Quelle est la moyenne de la classe ?`,
      answer: { kind: 'number', value: frac(total, target) },
      hint: 'Multiplie chaque note par son effectif, additionne, puis divise par l’effectif total.',
      correction: [
        `$${values.map((v, i) => `${v} \\times ${counts[i]}`).join(' + ')} = ${total}$, pour un effectif total de $${target}$.`,
        `$\\bar{x} = \\frac{${total}}{${target}} = ${dec(total / target)}$`,
      ],
    };
  },
};

const mediane: Skill = {
  id: '2nde-mediane',
  name: 'Trouver la médiane',
  generate(rng, level) {
    const n = level === 1 ? rng.pick([5, 7]) : rng.int(6, 10);
    const xs = series(rng, n, 0, 30);
    const m = median(xs);
    const s = sorted(xs);
    return {
      skill: '2nde-mediane',
      level,
      prompt: `Quelle est la médiane de la série : ${list(xs)} ?`,
      answer: { kind: 'number', value: fracOf(m) },
      hint: 'Range d’abord les valeurs dans l’ordre croissant. Avec un nombre pair de valeurs, la médiane est la moyenne des deux valeurs centrales.',
      correction: [
        `Série rangée : $${s.join(' ; ')}$ ($${n}$ valeurs).`,
        n % 2
          ? `La médiane est la $${(n + 1) / 2}$e valeur : $${m}$.`
          : `La médiane est la moyenne des $${n / 2}$e et $${n / 2 + 1}$e valeurs : $\\frac{${s[n / 2 - 1]} + ${s[n / 2]}}{2} = ${dec(m)}$.`,
      ],
    };
  },
};

const quartiles: Skill = {
  id: '2nde-quartiles',
  name: 'Trouver un quartile',
  generate(rng, level) {
    const n = level === 1 ? rng.pick([8, 12]) : rng.int(7, 13);
    const xs = series(rng, n, 0, 40);
    const q = rng.pick([1, 3] as const);
    const rank = Math.ceil((q * n) / 4);
    const value = quartile(xs, q);
    return {
      skill: '2nde-quartiles',
      level,
      prompt: `Quel est le ${q === 1 ? 'premier' : 'troisième'} quartile $Q_${q}$ de la série : ${list(xs)} ?`,
      answer: { kind: 'number', value: frac(value) },
      hint: `$Q_${q}$ est la plus petite valeur de la série telle qu'au moins $${q * 25}\\,\\%$ des valeurs lui soient inférieures ou égales.`,
      correction: [
        `Série rangée : $${sorted(xs).join(' ; ')}$ ($${n}$ valeurs).`,
        `$\\frac{${q === 1 ? '' : '3 \\times '}${n}}{4} = ${dec((q * n) / 4)}$, on prend donc la $${rank}$e valeur : $Q_${q} = ${value}$.`,
      ],
    };
  },
};

const dispersion: Skill = {
  id: '2nde-etendue',
  name: 'Calculer l’étendue ou l’écart interquartile',
  generate(rng, level) {
    const n = rng.int(8, 12);
    const xs = series(rng, n, 0, 50);
    const interq = level > 1 && rng.next() < 0.5;
    const s = sorted(xs);
    const q1 = quartile(xs, 1);
    const q3 = quartile(xs, 3);
    const value = interq ? q3 - q1 : s[n - 1] - s[0];
    return {
      skill: '2nde-etendue',
      level,
      prompt: `Calcule ${interq ? "l'écart interquartile $Q_3 - Q_1$" : "l'étendue"} de la série : ${list(xs)}.`,
      answer: { kind: 'number', value: frac(value) },
      hint: interq ? 'Trouve $Q_1$ et $Q_3$ sur la série rangée, puis fais la différence.' : 'Étendue = plus grande valeur − plus petite valeur.',
      correction: interq
        ? [`Série rangée : $${s.join(' ; ')}$.`, `$Q_1 = ${q1}$ et $Q_3 = ${q3}$, donc $Q_3 - Q_1 = ${value}$.`]
        : [`La plus grande valeur est $${s[n - 1]}$ et la plus petite $${s[0]}$.`, `Étendue : $${s[n - 1]} - ${s[0]} = ${value}$.`],
    };
  },
};

const moyenneTransformee: Skill = {
  id: '2nde-moyenne-transformee',
  name: 'Transformer une série',
  generate(rng, level: Level) {
    const mean = rng.int(8, 15) + (level === 3 ? rng.pick([0, 0.5]) : 0);
    const a = level === 1 ? 1 : rng.pick([2, 3, 0.5, 1.5]);
    const b = rng.nonZero(-4, 6);
    const result = Math.round((a * mean + b) * 100) / 100;
    const transfo = a === 1 ? `on ajoute $${b}$ points à chaque note` : `on multiplie chaque note par $${dec(a)}$ puis on ajoute $${b}$`;
    return {
      skill: '2nde-moyenne-transformee',
      level,
      prompt: `La moyenne d'une série de notes est $${dec(mean)}$. Si ${transfo}, quelle est la nouvelle moyenne ?`,
      answer: { kind: 'number', value: fracOf(result) },
      hint: 'Si on transforme chaque valeur par $ax + b$, la moyenne est transformée de la même façon.',
      correction: [`Nouvelle moyenne : $${a === 1 ? '' : `${dec(a)} \\times `}${dec(mean)} ${b < 0 ? '-' : '+'} ${Math.abs(b)} = ${dec(result)}$`],
    };
  },
};

/* ---------- Variantes : d'autres façons de poser les mêmes notions ---------- */

/** Tableau valeurs / effectifs. */
const tableauEffectifs = (values: number[], counts: number[], label = 'Valeur') =>
  `\\begin{array}{|c|${'c|'.repeat(values.length)}} \\hline \\text{${label}} & ${values.join(' & ')} \\\\ \\hline \\text{Effectif} & ${counts.join(' & ')} \\\\ \\hline \\end{array}`;

/** Série « dépliée » à partir d'un tableau d'effectifs. */
const deplier = (values: number[], counts: number[]) => values.flatMap((v, i) => Array<number>(counts[i]).fill(v));

const moyenneVariantes = [
  variant('note-manquante', (rng, level) => {
    const n = level === 1 ? 4 : rng.int(4, 6);
    const mean = rng.int(8, 15);
    let xs: number[];
    let x: number;
    // La note oubliée doit être une vraie note, entre 0 et 20.
    do {
      xs = series(rng, n - 1, mean - 6, Math.min(20, mean + 6));
      x = mean * n - xs.reduce((a, b) => a + b, 0);
    } while (x < 0 || x > 20);
    return {
      prompt: `Léa a eu les notes ${list(xs)} et une dernière note qu'elle a oubliée. Sa moyenne sur ces $${n}$ notes est exactement $${mean}$. Quelle est la note oubliée ?`,
      answer: { kind: 'number', value: frac(x) },
      hint: `La somme des $${n}$ notes vaut $${n} \\times ${mean}$.`,
      correction: [`Somme totale : $${n} \\times ${mean} = ${n * mean}$.`, `Note oubliée : $${n * mean} - ${xs.reduce((a, b) => a + b, 0)} = ${x}$.`],
    };
  }),
  variant('ajout', (rng, level) => {
    const n = rng.pick([4, 9, 19, 24]);
    const mean = rng.int(9, 14);
    const extra = rng.int(0, 20);
    const total = n * mean + extra;
    return {
      prompt: `La moyenne de $${n}$ élèves à un contrôle est $${mean}$. Un ${level === 3 ? 'retardataire' : 'nouvel élève'} passe le contrôle et obtient $${extra}$. Quelle est la nouvelle moyenne des $${n + 1}$ élèves ?`,
      answer: { kind: 'number', value: frac(total, n + 1) },
      hint: 'Retrouve la somme des notes, ajoute la nouvelle, puis divise par le nouvel effectif.',
      correction: [`Somme : $${n} \\times ${mean} + ${extra} = ${total}$.`, `Moyenne : $\\frac{${total}}{${n + 1}} = ${dec(total / (n + 1))}$`],
    };
  }),
];

const ponderee = [
  variant('coefficients', (rng, level) => {
    const k = level === 1 ? 2 : 3;
    const notes = series(rng, k, 4, 20);
    let coefs = series(rng, k, 1, 4);
    let C = coefs.reduce((a, b) => a + b, 0);
    // Total des coefficients diviseur de 100 : moyenne décimale exacte.
    while (![2, 4, 5, 10, 20].includes(C)) {
      coefs = series(rng, k, 1, 4);
      C = coefs.reduce((a, b) => a + b, 0);
    }
    const total = notes.reduce((acc, v, i) => acc + v * coefs[i], 0);
    return {
      prompt: `Au bac blanc, Malo a obtenu ${notes.map((v, i) => `$${v}$ (coefficient $${coefs[i]}$)`).join(', ')}. Quelle est sa moyenne ?`,
      answer: { kind: 'number', value: frac(total, C) },
      hint: 'Chaque note compte autant de fois que son coefficient.',
      correction: [`$${notes.map((v, i) => `${v} \\times ${coefs[i]}`).join(' + ')} = ${total}$`, `$\\frac{${total}}{${C}} = ${dec(total / C)}$`],
    };
  }),
  variant('note-necessaire', (rng) => {
    let C: number;
    let c: number;
    let target: number;
    let x: number;
    let mNum: number;
    // m C + x c = target (C + c) : la moyenne actuelle m doit être une note décimale simple.
    do {
      C = rng.pick([2, 3, 4, 5, 6]);
      c = rng.pick([1, 2, 3]);
      target = rng.int(10, 14);
      x = rng.int(8, 20);
      mNum = target * (C + c) - x * c;
    } while (mNum < 0 || mNum > 20 * C || (mNum * 100) % C !== 0);
    return {
      prompt: `Sami a pour l'instant $${dec(mNum / C)}$ de moyenne, pour un total de coefficients de $${C}$. Quelle note doit-il avoir au prochain contrôle, de coefficient $${c}$, pour finir avec exactement $${target}$ de moyenne ?`,
      answer: { kind: 'number', value: frac(x) },
      hint: 'Écris la nouvelle moyenne pondérée en fonction de la note $x$ inconnue.',
      correction: [`$\\frac{${dec(mNum / C)} \\times ${C} + ${c}x}{${C + c}} = ${target}$`, `$${c}x = ${target * (C + c)} - ${mNum}$, donc $x = ${x}$.`],
    };
  }),
];

const medianeVariantes = [
  variant('tableau', (rng, level) => {
    const values = sorted([...new Set(series(rng, 8, 0, 20))]).slice(0, level === 1 ? 4 : 5);
    const counts = values.map(() => rng.int(1, level === 1 ? 4 : 8));
    const m = median(deplier(values, counts));
    return {
      prompt: `Voici une série statistique : $${tableauEffectifs(values, counts)}$ Quelle est sa médiane ?`,
      answer: { kind: 'number', value: fracOf(m) },
      hint: 'Calcule l’effectif total, puis repère la (ou les) valeur(s) du milieu grâce aux effectifs cumulés.',
      correction: [`Effectif total : $${counts.reduce((a, b) => a + b, 0)}$.`, `La médiane vaut $${dec(m)}$.`],
    };
  }),
  variant('moyenne-ou-mediane', (rng) => {
    const xs = series(rng, rng.pick([5, 7]), 0, 20);
    // Une valeur extrême tire la moyenne mais pas la médiane.
    xs[0] = rng.pick([60, 80, 100]);
    const m = median(xs);
    const mean = xs.reduce((a, b) => a + b, 0) / xs.length;
    return {
      prompt: `Pour la série ${list(xs)}, lequel de ces deux nombres est le plus grand : la moyenne ou la médiane ?`,
      answer: fixedChoice(['La moyenne', 'La médiane', 'Ils sont égaux'], mean > m ? 0 : mean < m ? 1 : 2),
      hint: 'Une valeur très grande influence beaucoup la moyenne, mais pas la médiane.',
      correction: [`Médiane : $${dec(m)}$. Moyenne : $${dec(Math.round(mean * 100) / 100)}$${Number.isInteger(mean * 100) ? '' : ' environ'}.`, mean > m ? 'La moyenne est plus grande, tirée par la valeur extrême.' : mean < m ? 'La médiane est plus grande.' : 'Elles sont égales.'],
    };
  }),
];

const quartilesVariantes = [
  variant('tableau', (rng, level) => {
    const values = sorted([...new Set(series(rng, 8, 0, 20))]).slice(0, 4);
    const counts = values.map(() => rng.int(1, level === 1 ? 5 : 9));
    const q = rng.pick([1, 3] as const);
    const v = quartile(deplier(values, counts), q);
    return {
      prompt: `Voici une série statistique : $${tableauEffectifs(values, counts)}$ Quel est son ${q === 1 ? 'premier' : 'troisième'} quartile ?`,
      answer: { kind: 'number', value: frac(v) },
      hint: `Calcule $\\frac{${q === 1 ? '' : '3'}N}{4}$, arrondis à l'entier supérieur, puis lis la valeur de ce rang avec les effectifs cumulés.`,
      correction: [`Effectif total : $N = ${counts.reduce((a, b) => a + b, 0)}$.`, `$Q_${q} = ${v}$`],
    };
  }),
  variant('interpretation', (rng) => {
    const q = rng.pick([1, 3] as const);
    const v = rng.int(8, 15);
    const opts = ['$25\\,\\%$', '$50\\,\\%$', '$75\\,\\%$', '$100\\,\\%$'];
    return {
      prompt: `Dans une classe, le ${q === 1 ? 'premier' : 'troisième'} quartile des notes est $${v}$. Au moins quel pourcentage des élèves a une note inférieure ou égale à $${v}$ ?`,
      answer: fixedChoice(opts, q === 1 ? 0 : 2),
      hint: 'Les quartiles partagent la série en quatre parts d’effectifs (environ) égaux.',
      correction: [`Par définition, au moins $${q * 25}\\,\\%$ des valeurs sont inférieures ou égales à $Q_${q}$.`],
    };
  }),
];

const dispersionVariantes = [
  variant('valeur-manquante', (rng) => {
    const min = rng.int(0, 15);
    const e = rng.int(5, 30);
    const askMax = rng.next() < 0.5;
    return {
      prompt: askMax ? `L'étendue d'une série est $${e}$ et sa plus petite valeur est $${min}$. Quelle est sa plus grande valeur ?` : `L'étendue d'une série est $${e}$ et sa plus grande valeur est $${min + e}$. Quelle est sa plus petite valeur ?`,
      answer: { kind: 'number', value: frac(askMax ? min + e : min) },
      hint: 'Étendue = plus grande valeur − plus petite valeur.',
      correction: [askMax ? `$${min} + ${e} = ${min + e}$` : `$${min + e} - ${e} = ${min}$`],
    };
  }),
  variant('valeur-extreme', (rng) => {
    const n = rng.int(8, 12);
    const xs = series(rng, n, 0, 30);
    const s = sorted(xs);
    const big = s[n - 1] + rng.int(20, 60);
    const ys = [...s.slice(0, n - 1), big];
    const eiq = quartile(xs, 3) - quartile(xs, 1);
    const eiq2 = quartile(ys, 3) - quartile(ys, 1);
    const which = rng.pick(['l’étendue', 'l’écart interquartile'] as const);
    const changes = which === 'l’étendue' ? big - s[0] !== s[n - 1] - s[0] : eiq !== eiq2;
    return {
      prompt: `Dans la série ${list(s)}, on remplace la plus grande valeur $${s[n - 1]}$ par $${big}$. ${which === 'l’étendue' ? 'L’étendue' : 'L’écart interquartile'} change-t-il ?`,
      answer: fixedChoice(['Oui', 'Non'], changes ? 0 : 1),
      hint: 'L’étendue dépend des valeurs extrêmes ; les quartiles, non.',
      correction: which === 'l’étendue' ? [`Avant : $${s[n - 1] - s[0]}$ ; après : $${big - s[0]}$.`, 'L’étendue change.'] : [`$Q_1$ et $Q_3$ ne dépendent pas de la plus grande valeur : avant $${eiq}$, après $${eiq2}$.`, changes ? 'Il change.' : 'Il ne change pas.'],
    };
  }),
];

const transformeeVariantes = [
  variant('fahrenheit', (rng) => {
    const c = rng.pick([5, 10, 15, 20, 25, 30, -5, -10]);
    const f = Math.round((1.8 * c + 32) * 100) / 100;
    return {
      prompt: `La moyenne des températures d'une semaine est $${c}$ °C. Pour la convertir en degrés Fahrenheit, on multiplie par $1{,}8$ et on ajoute $32$. Quelle est la moyenne en °F ?`,
      answer: { kind: 'number', value: fracOf(f) },
      hint: 'La moyenne subit la même transformation que chaque valeur.',
      correction: [`$1{,}8 \\times ${par(c)} + 32 = ${dec(f)}$`],
    };
  }),
  variant('retrouver', (rng) => {
    const mean = rng.int(6, 14);
    const a = rng.pick([1, 2]);
    const b = rng.nonZero(-3, 5);
    const result = a * mean + b;
    return {
      prompt: `On ${a === 1 ? '' : 'multiplie chaque note par $2$ puis on '}${b > 0 ? `ajoute $${b}$` : `retire $${-b}$`} ${a === 1 ? 'points à chaque note' : 'points'}. La nouvelle moyenne est $${result}$. Quelle était la moyenne de départ ?`,
      answer: { kind: 'number', value: frac(mean) },
      hint: 'Fais les opérations inverses, dans l’ordre inverse.',
      correction: [`$${a === 1 ? '' : '2'}m ${b > 0 ? '+' : '-'} ${Math.abs(b)} = ${result}$`, `$m = ${mean}$`],
    };
  }),
];

export const STATISTIQUES_SKILLS: Skill[] = [
  enrich(moyenne, moyenneVariantes),
  enrich(moyennePonderee, ponderee),
  enrich(mediane, medianeVariantes),
  enrich(quartiles, quartilesVariantes),
  enrich(dispersion, dispersionVariantes),
  enrich(moyenneTransformee, transformeeVariantes),
];
