import { frac, fracLatex } from '../fraction';
import type { Skill } from '../types';
import { dec, decimal, fixedChoice, gcd, num, skill } from './outils';

/** 3e : statistiques (moyenne, moyenne pondérée, médiane, étendue, fréquences) et probabilités. */

export function median(values: number[]): number {
  const s = [...values].sort((a, b) => a - b);
  const n = s.length;
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
}

const listTex = (v: number[]) => v.map((x) => dec(x)).join(' \\,;\\, ');

const moyenne = skill('3e-moyenne', 'Calculer une moyenne', (rng, level) => {
  const n = level === 1 ? rng.int(3, 5) : rng.int(5, 8);
  let values: number[];
  do values = Array.from({ length: n }, () => rng.int(level === 3 ? 0 : 5, 20));
  while (level < 3 && (values.reduce((s, x) => s + x, 0) * 10) % n !== 0);
  const sum = values.reduce((s, x) => s + x, 0);
  const exact = (sum * 10) % n === 0;
  const m = exact ? sum / n : Math.round((sum * 10) / n) / 10;
  return {
    prompt: `Voici les notes de Léa : $${listTex(values)}$. Quelle est sa moyenne${exact ? '' : ', arrondie au dixième'} ?`,
    answer: decimal(m),
    hint: 'Moyenne = somme des valeurs ÷ nombre de valeurs.',
    correction: [`Somme : $${values.join(' + ')} = ${sum}$.`, `Moyenne : $\\frac{${sum}}{${n}} ${exact ? '=' : '\\approx'} ${dec(m)}$`],
  };
});

const ponderee = skill('3e-moyenne-ponderee', 'Calculer une moyenne pondérée', (rng, level) => {
  const k = level === 1 ? 3 : rng.int(3, 5);
  let vals: number[];
  let coefs: number[];
  let sum: number;
  let total: number;
  do {
    vals = Array.from({ length: k }, () => rng.int(6, 19));
    coefs = Array.from({ length: k }, () => rng.int(1, level === 3 ? 6 : 4));
    sum = vals.reduce((s, v, i) => s + v * coefs[i], 0);
    total = coefs.reduce((s, c) => s + c, 0);
  } while ((sum * 10) % total !== 0 && level < 3);
  const exact = (sum * 10) % total === 0;
  const m = exact ? sum / total : Math.round((sum * 10) / total) / 10;
  const table = `\\begin{array}{|c|${'c|'.repeat(k)}}\\hline \\text{Note} & ${vals.join(' & ')} \\\\ \\hline \\text{Coefficient} & ${coefs.join(' & ')} \\\\ \\hline\\end{array}`;
  return {
    prompt: `Voici les notes de Tom et leurs coefficients : $${table}$ Quelle est sa moyenne${exact ? '' : ', arrondie au dixième'} ?`,
    answer: decimal(m),
    hint: 'Multiplie chaque note par son coefficient, additionne, puis divise par la somme des coefficients.',
    correction: [
      `$${vals.map((v, i) => `${v} \\times ${coefs[i]}`).join(' + ')} = ${sum}$`,
      `Somme des coefficients : $${total}$.`,
      `Moyenne : $\\frac{${sum}}{${total}} ${exact ? '=' : '\\approx'} ${dec(m)}$`,
    ],
  };
});

const mediane = skill('3e-mediane', 'Déterminer une médiane', (rng, level) => {
  const n = level === 1 ? rng.pick([5, 7]) : rng.int(6, 11);
  const values = Array.from({ length: n }, () => rng.int(level === 3 ? 100 : 1, level === 3 ? 200 : 30));
  const med = median(values);
  const sorted = [...values].sort((a, b) => a - b);
  return {
    prompt: `Quelle est la médiane de cette série : $${listTex(values)}$ ?`,
    answer: decimal(med),
    hint: 'Range les valeurs dans l’ordre croissant : la médiane partage la série en deux groupes de même effectif.',
    correction: [
      `Série rangée : $${listTex(sorted)}$ (${n} valeurs).`,
      n % 2 ? `La médiane est la $${(n + 1) / 2}$e valeur : $${dec(med)}$.` : `La médiane est la moyenne des $${n / 2}$e et $${n / 2 + 1}$e valeurs : $\\frac{${sorted[n / 2 - 1]} + ${sorted[n / 2]}}{2} = ${dec(med)}$.`,
    ],
  };
});

const etendue = skill('3e-etendue', 'Calculer une étendue', (rng, level) => {
  const n = rng.int(5, 9);
  const values = Array.from({ length: n }, () => (level === 3 ? rng.int(-15, 25) : rng.int(2, 40)));
  const max = Math.max(...values);
  const min = Math.min(...values);
  const ctx = level === 3 ? 'les températures relevées (en °C)' : 'les scores obtenus à un jeu';
  return {
    prompt: `Voici ${ctx} : $${listTex(values)}$. Quelle est l'étendue de cette série ?`,
    answer: num(max - min),
    hint: 'Étendue = plus grande valeur − plus petite valeur.',
    correction: [`Plus grande valeur : $${max}$ ; plus petite : $${min}$.`, `Étendue : $${max} - ${min < 0 ? `(${min})` : min} = ${max - min}$`],
  };
});

const frequence = skill('3e-frequence', 'Calculer une fréquence en pourcentage', (rng, level) => {
  const total = rng.pick(level === 1 ? [20, 25, 50] : [20, 25, 40, 50, 80, 200, 250]);
  const e = rng.int(1, total - 1);
  const f = (e * 100) / total;
  return {
    prompt: `Dans ${total > 40 ? 'un collège' : 'une classe'}, $${e}$ élèves sur $${total}$ pratiquent un sport en club. Quelle est la fréquence de ces élèves, en % ?`,
    answer: decimal(f),
    hint: 'Fréquence = effectif ÷ effectif total ; multiplie par 100 pour l’avoir en %.',
    correction: [`$\\frac{${e}}{${total}} = ${dec(e / total)}$, soit $${dec(f)}\\,\\%$.`],
  };
});

export const STATISTIQUES_3E: Skill[] = [moyenne, ponderee, mediane, etendue, frequence];

/* ---------- Probabilités ---------- */

const pTex = (n: number, d: number) => fracLatex(frac(n, d));
const fracAnswer = (n: number, d: number) => ({ kind: 'number' as const, value: frac(n, d) });

const boules = (n: number, color: string) => `$${n}$ boule${n > 1 ? 's' : ''} ${color}${n > 1 ? 's' : ''}`;

const urne = skill('3e-proba-urne', 'Calculer une probabilité dans une urne', (rng, level) => {
  const r = rng.int(1, level === 1 ? 6 : 12);
  const b = rng.int(1, level === 1 ? 6 : 12);
  const v = level === 1 ? 0 : rng.int(1, 9);
  const total = r + b + v;
  const color = rng.pick(v ? (['rouge', 'bleue', 'verte'] as const) : (['rouge', 'bleue'] as const));
  const count = color === 'rouge' ? r : color === 'bleue' ? b : v;
  const not = level === 3 && rng.next() < 0.5;
  const favorable = not ? total - count : count;
  return {
    prompt: `Une urne contient ${v ? `${boules(r, 'rouge')}, ${boules(b, 'bleue')} et ${boules(v, 'verte')}` : `${boules(r, 'rouge')} et ${boules(b, 'bleue')}`}, indiscernables au toucher. On tire une boule au hasard. Quelle est la probabilité qu'elle ${not ? 'ne soit pas' : 'soit'} ${color} ? (Fraction acceptée.)`,
    answer: fracAnswer(favorable, total),
    hint: 'Situation d’équiprobabilité : $P = \\frac{\\text{nombre d’issues favorables}}{\\text{nombre total d’issues}}$.',
    correction: [`Il y a $${total}$ boules, dont $${favorable}$ ${not ? `qui ne ${favorable > 1 ? 'sont' : 'est'} pas ${color}${favorable > 1 ? 's' : ''}` : `${color}${favorable > 1 ? 's' : ''}`}.`, `$P = \\frac{${favorable}}{${total}}${gcd(favorable, total) > 1 ? ` = ${pTex(favorable, total)}` : ''}$`],
  };
});

const contraire = skill('3e-proba-contraire', 'Utiliser l’événement contraire', (rng, level) => {
  const p = level === 1 ? rng.int(1, 9) / 10 : rng.int(1, 99) / 100;
  const asFrac = level === 3 && rng.next() < 0.5;
  const [n, d] = asFrac ? [rng.int(1, 11), 12] : [Math.round(p * 100), 100];
  const shown = asFrac ? pTex(n, d) : dec(p);
  const res = frac(d - n, d);
  return {
    prompt: `On sait que $P(A) = ${shown}$. Calcule $P(\\overline{A})$, la probabilité de l'événement contraire.`,
    answer: { kind: 'number', value: res },
    hint: '$P(\\overline{A}) = 1 - P(A)$',
    correction: [`$P(\\overline{A}) = 1 - ${shown} = ${asFrac ? fracLatex(res) : dec(1 - p)}$`],
  };
});

const de = skill('3e-proba-de', 'Calculer une probabilité avec un dé', (rng, level) => {
  const faces = level === 1 ? 6 : rng.pick([6, 8, 10, 12, 20]);
  const events: [string, (k: number) => boolean][] = [
    ['un nombre pair', (k) => k % 2 === 0],
    ['un multiple de 3', (k) => k % 3 === 0],
    ['un nombre premier', (k) => k > 1 && [2, 3, 5, 7, 11, 13, 17, 19].includes(k)],
    ['un nombre strictement supérieur à 4', (k) => k > 4],
    ['un diviseur de 12', (k) => 12 % k === 0],
  ];
  const [label, test] = rng.pick(level === 1 ? events.slice(0, 2) : events);
  const fav = Array.from({ length: faces }, (_, i) => i + 1).filter(test);
  return {
    prompt: `On lance un dé équilibré à $${faces}$ faces numérotées de $1$ à $${faces}$. Quelle est la probabilité d'obtenir ${label} ?`,
    answer: fracAnswer(fav.length, faces),
    hint: 'Liste les issues favorables, puis divise leur nombre par le nombre de faces.',
    correction: [`Issues favorables : $${fav.join(' ; ')}$, soit $${fav.length}$ issues sur $${faces}$.`, `$P = \\frac{${fav.length}}{${faces}}${gcd(fav.length, faces) > 1 ? ` = ${pTex(fav.length, faces)}` : ''}$`],
  };
});

const deuxEpreuves = skill('3e-proba-deux-epreuves', 'Calculer une probabilité sur deux épreuves', (rng, level) => {
  const kind = level === 1 ? 'pieces' : rng.pick(level === 2 ? (['pieces', 'avec'] as const) : (['avec', 'sans', 'des'] as const));
  if (kind === 'pieces') {
    const target = rng.pick(['deux fois Pile', 'deux fois Face', 'une fois Pile et une fois Face'] as const);
    const fav = target === 'une fois Pile et une fois Face' ? 2 : 1;
    return {
      prompt: `On lance deux fois une pièce équilibrée. Quelle est la probabilité d'obtenir ${target} ?`,
      answer: fracAnswer(fav, 4),
      hint: 'Il y a 4 issues équiprobables : PP, PF, FP, FF.',
      correction: [`Issues : PP, PF, FP, FF (4 issues).`, `Issues favorables : $${fav}$, donc $P = ${pTex(fav, 4)}$.`],
    };
  }
  if (kind === 'des') {
    const s = rng.int(2, 12);
    let fav = 0;
    for (let i = 1; i <= 6; i++) for (let j = 1; j <= 6; j++) if (i + j === s) fav++;
    return {
      prompt: `On lance deux dés équilibrés à 6 faces et on additionne les résultats. Quelle est la probabilité d'obtenir une somme égale à $${s}$ ?`,
      answer: fracAnswer(fav, 36),
      hint: 'Fais un tableau à double entrée : il y a $6 \\times 6 = 36$ issues équiprobables.',
      correction: [`Dans le tableau des $36$ issues, la somme $${s}$ apparaît $${fav}$ fois.`, `$P = \\frac{${fav}}{36}${gcd(fav, 36) > 1 ? ` = ${pTex(fav, 36)}` : ''}$`],
    };
  }
  const r = rng.int(2, 6);
  const b = rng.int(2, 6);
  const n = r + b;
  const replace = kind === 'avec';
  const num0 = replace ? r * r : r * (r - 1);
  const den = replace ? n * n : n * (n - 1);
  return {
    prompt: `Un sac contient $${r}$ jetons rouges et $${b}$ jetons bleus. On tire un jeton, ${replace ? 'on le remet dans le sac' : 'on le garde'}, puis on en tire un second. Quelle est la probabilité de tirer deux jetons rouges ?`,
    answer: fracAnswer(num0, den),
    hint: replace ? 'Les deux tirages sont identiques : on multiplie les probabilités le long de la branche de l’arbre.' : 'Après le premier tirage, il reste un jeton de moins (et un rouge de moins si on a tiré un rouge).',
    correction: [
      replace ? `$P = \\frac{${r}}{${n}} \\times \\frac{${r}}{${n}} = \\frac{${num0}}{${den}}$` : `$P = \\frac{${r}}{${n}} \\times \\frac{${r - 1}}{${n - 1}} = \\frac{${num0}}{${den}}$`,
      `$P = ${pTex(num0, den)}$`,
    ],
  };
});

const frequenceProba = skill('3e-proba-frequence', 'Distinguer fréquence observée et probabilité', (rng, level) => {
  const n = rng.pick(level === 1 ? [10, 20] : [20, 50, 100]);
  let k = rng.int(Math.round(n * 0.3), Math.round(n * 0.7));
  if (2 * k === n) k += 1;
  const big = level === 3;
  const options = [
    `$\\frac{1}{2}$`,
    `$\\frac{${k}}{${n}}$`,
    `$\\frac{${n - k}}{${n}}$`,
    `$\\frac{1}{${n}}$`,
  ];
  const ask = big ? 'Vers quel nombre la fréquence de Pile se rapproche-t-elle si on lance la pièce un très grand nombre de fois ?' : 'Quelle est la probabilité d’obtenir Pile au prochain lancer ?';
  const unique = [...new Set(options)];
  const shuffled = rng.shuffle(unique);
  return {
    prompt: `On lance $${n}$ fois une pièce équilibrée et on obtient $${k}$ fois Pile. ${ask}`,
    answer: fixedChoice(shuffled, shuffled.indexOf('$\\frac{1}{2}$')),
    hint: 'La fréquence observée varie d’une expérience à l’autre ; la probabilité, elle, ne dépend que de la pièce.',
    correction: [
      `La fréquence observée de Pile est $\\frac{${k}}{${n}}$, mais la pièce est équilibrée : la probabilité de Pile vaut $\\frac{1}{2}$.`,
      big ? 'Quand le nombre de lancers devient très grand, la fréquence se rapproche de la probabilité $\\frac{1}{2}$.' : 'Les lancers précédents n’influencent pas le suivant.',
    ],
  };
});

export const PROBABILITES_3E: Skill[] = [urne, de, contraire, deuxEpreuves, frequenceProba];

