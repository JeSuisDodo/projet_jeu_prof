import type { Skill } from '../types';
import { byLevel, decimal, fix, makeChoice, num, numAnswer, pairAnswer, prenom, skill, yesNo } from './outils';
import { roundTo } from './nombres';

/** Division euclidienne, multiples et diviseurs, critères de divisibilité, division décimale. */

const euclidienne: Skill = skill('division-euclidienne', 'Poser une division euclidienne', (rng, level) => {
  const b = byLevel(level, rng.int(2, 9), rng.int(6, 15), rng.int(12, 35));
  const q = byLevel(level, rng.int(3, 15), rng.int(10, 60), rng.int(20, 150));
  const r = rng.int(0, b - 1);
  const a = b * q + r;
  return {
    prompt: `Donne le quotient et le reste de la division euclidienne de $${num(a)}$ par $${b}$.`,
    answer: pairAnswer(q, r, ['Quotient', 'Reste']),
    hint: `Cherche combien de fois $${b}$ « va » dans $${num(a)}$ ; le reste doit être plus petit que $${b}$.`,
    correction: [`$${num(a)} = ${b} \\times ${q} + ${r}$ avec $${r} < ${b}$.`, `Quotient : $${q}$ ; reste : $${r}$.`],
  };
});

const multiples: Skill = skill('multiples', 'Reconnaître multiples et diviseurs', (rng, level) => {
  const k = byLevel(level, rng.int(3, 9), rng.int(6, 15), rng.int(11, 25));
  if (rng.next() < 0.5) {
    const good = k * rng.int(level === 1 ? 2 : 5, level === 1 ? 10 : 30);
    const near = (x: number) => (x % k === 0 ? x + 1 : x);
    const decoys = [near(good + 1), near(good - 1), near(good + Math.ceil(k / 2)), near(good + k + 2)];
    return {
      prompt: `Lequel de ces nombres est un multiple de $${k}$ ?`,
      answer: makeChoice(rng, `$${good}$`, decoys.map((d) => `$${d}$`), () => `$${near(good + rng.int(2, 3 * k))}$`),
      hint: `Un multiple de $${k}$ est un nombre de la table de $${k}$ : la division par $${k}$ tombe juste.`,
      correction: [`$${good} = ${k} \\times ${good / k}$ : c'est un multiple de $${k}$.`],
    };
  }
  const n = k * rng.int(2, level === 1 ? 9 : 12);
  const divisors: number[] = [];
  for (let d = 2; d < n; d++) if (n % d === 0) divisors.push(d);
  const good = rng.pick(divisors);
  const others: number[] = [];
  for (let d = 2; d < n && others.length < 6; d++) if (n % d !== 0) others.push(d);
  return {
    prompt: `Lequel de ces nombres est un diviseur de $${n}$ ?`,
    answer: makeChoice(rng, `$${good}$`, rng.shuffle(others).map((d) => `$${d}$`), () => `$${n + rng.int(1, 9)}$`),
    hint: `$d$ est un diviseur de $${n}$ si la division de $${n}$ par $d$ tombe juste.`,
    correction: [`$${n} = ${good} \\times ${n / good}$ : $${good}$ est un diviseur de $${n}$.`],
  };
});

/** Critères de divisibilité étudiés en 6e. */
const CRITERES: Record<number, string> = {
  2: 'Un nombre est divisible par 2 si son chiffre des unités est 0, 2, 4, 6 ou 8.',
  3: 'Un nombre est divisible par 3 si la somme de ses chiffres est divisible par 3.',
  4: 'Un nombre est divisible par 4 si le nombre formé par ses deux derniers chiffres est divisible par 4.',
  5: 'Un nombre est divisible par 5 si son chiffre des unités est 0 ou 5.',
  9: 'Un nombre est divisible par 9 si la somme de ses chiffres est divisible par 9.',
  10: 'Un nombre est divisible par 10 si son chiffre des unités est 0.',
};

const digitSum = (n: number) => String(n).split('').reduce((s, c) => s + Number(c), 0);

const criteres: Skill = skill('criteres', 'Utiliser les critères de divisibilité', (rng, level) => {
  const d = rng.pick(byLevel(level, [2, 5, 10], [2, 3, 5, 9, 10], [3, 4, 9]));
  const yes = rng.next() < 0.5;
  const max = byLevel(level, 999, 9999, 99_999);
  let n: number;
  do n = rng.int(100, max);
  while ((n % d === 0) !== yes || (level === 3 && d === 9 && !yes && n % 3 !== 0));
  const why =
    d === 3 || d === 9
      ? `La somme des chiffres vaut $${String(n).split('').join(' + ')} = ${digitSum(n)}$, ${digitSum(n) % d === 0 ? '' : 'qui n’est pas '}divisible par $${d}$.`
      : d === 4
        ? `Le nombre formé par les deux derniers chiffres est $${n % 100}$, ${(n % 100) % 4 === 0 ? '' : 'qui n’est pas '}divisible par 4.`
        : `Le chiffre des unités est $${n % 10}$.`;
  return {
    prompt: `Le nombre $${num(n)}$ est-il divisible par $${d}$ ?`,
    answer: yesNo(yes),
    hint: CRITERES[d],
    correction: [why, `Donc $${num(n)}$ ${yes ? 'est' : 'n’est pas'} divisible par $${d}$.`],
  };
});

const decimale: Skill = skill('division-decimale', 'Effectuer une division décimale', (rng, level) => {
  const b = byLevel(level, rng.int(2, 5), rng.int(3, 9), rng.pick([4, 8, 12, 16, 25]));
  let q = byLevel(level, decimal(rng, 1, 30, 1), decimal(rng, 1, 50, 2), decimal(rng, 0.1, 20, 3));
  let a = fix(b * q);
  // Au niveau 3, le quotient doit vraiment avoir trois décimales et le dividende être « simple ».
  if (level === 3) {
    a = rng.int(1, 99);
    q = fix(a / b);
    while (Math.abs(q * 1000 - Math.round(q * 1000)) > 1e-6 || Number.isInteger(q)) {
      a = rng.int(1, 99);
      q = fix(a / b);
    }
  }
  return {
    prompt: `Calcule $${num(a)} \\div ${b}$.`,
    answer: numAnswer(q),
    hint: 'Pose la division ; quand tu abaisses le chiffre des dixièmes, place la virgule au quotient. Ajoute des zéros si la division ne tombe pas encore juste.',
    correction: [`$${num(a)} \\div ${b} = ${num(q)}$`, `Vérification : $${b} \\times ${num(q)} = ${num(a)}$.`],
  };
});

const approche: Skill = skill('quotient-approche', 'Donner un quotient approché', (rng, level) => {
  const b = rng.pick(byLevel(level, [3, 6, 7, 9], [3, 6, 7, 9, 11], [7, 11, 13, 17]));
  let a: number;
  do a = rng.int(b + 1, byLevel(level, 60, 200, 500));
  while (a % b === 0);
  const decimals = level === 1 ? 1 : rng.pick([1, 2]);
  const r = roundTo(a / b, decimals);
  return {
    prompt: `Donne l'arrondi ${decimals === 1 ? 'au dixième' : 'au centième'} du quotient $${a} \\div ${b}$.`,
    answer: numAnswer(r),
    hint: 'Pose la division avec un chiffre de plus que la précision demandée, puis arrondis.',
    correction: [`$${a} \\div ${b} \\approx ${num(Math.floor((a / b) * 10 ** (decimals + 1)) / 10 ** (decimals + 1))}\\ldots$`, `L'arrondi ${decimals === 1 ? 'au dixième' : 'au centième'} est $${num(r)}$.`],
  };
});

const problemes: Skill = skill('probleme-division', 'Résoudre un problème de partage', (rng, level) => {
  const who = prenom(rng);
  const size = rng.pick([6, 8, 10, 12, 15, 24]);
  let n: number;
  do n = rng.int(size * 3, size * byLevel(level, 8, 15, 30));
  while (n % size === 0);
  const full = Math.floor(n / size);
  const kind = level === 1 ? 'full' : rng.pick(['full', 'all', 'rest']);
  const [question, answer, why] =
    kind === 'full'
      ? [`Combien de boîtes peut-on remplir complètement ?`, full, `On peut remplir $${full}$ boîtes complètes.`]
      : kind === 'all'
        ? [`Combien de boîtes faut-il au minimum pour tout ranger ?`, full + 1, `Il faut $${full}$ boîtes pleines et une de plus pour les $${n - full * size}$ restants : $${full + 1}$ boîtes.`]
        : [`Combien en reste-t-il une fois les boîtes complètes remplies ?`, n - full * size, `Il en reste $${n - full * size}$.`];
  return {
    prompt: `${who} range $${n}$ œufs dans des boîtes de $${size}$. ${question}`,
    answer: numAnswer(answer),
    hint: `Effectue la division euclidienne de $${n}$ par $${size}$, puis réfléchis à ce que représentent le quotient et le reste.`,
    correction: [`$${n} = ${size} \\times ${full} + ${n - full * size}$`, why],
  };
});

export const DIVISION_SKILLS: Skill[] = [euclidienne, multiples, criteres, decimale, approche, problemes];
