import type { Skill } from '../types';
import { byLevel, decimal, decimalsOf, fix, makeChoice, num, numAnswer, prenom, skill } from './outils';

/** Addition, soustraction et multiplication de nombres entiers et décimaux. */

const addition: Skill = skill('addition', 'Additionner des décimaux', (rng, level) => {
  const values = byLevel(
    level,
    [decimal(rng, 1, 99, 1), decimal(rng, 1, 99, 1)],
    [decimal(rng, 1, 999, 2), decimal(rng, 1, 99, rng.pick([0, 1]))],
    [decimal(rng, 1, 999, 2), decimal(rng, 1, 99, 3), decimal(rng, 1, 99, 1)],
  );
  const sum = fix(values.reduce((a, b) => a + b, 0));
  return {
    prompt: `Calcule $${values.map(num).join(' + ')}$.`,
    answer: numAnswer(sum),
    hint: 'Pose l’addition en alignant les virgules (unités sous unités, dixièmes sous dixièmes…). Ajoute des zéros si besoin.',
    correction: [`$${values.map(num).join(' + ')} = ${num(sum)}$`],
  };
});

const soustraction: Skill = skill('soustraction', 'Soustraire des décimaux', (rng, level) => {
  let a = byLevel(level, decimal(rng, 20, 99, 1), decimal(rng, 50, 999, rng.pick([1, 2])), rng.int(5, 100));
  const b = byLevel(level, decimal(rng, 1, 19, 1), decimal(rng, 1, 49, 2), decimal(rng, 1, 4.9, rng.pick([2, 3])));
  if (a <= b) a = fix(a + b);
  const diff = fix(a - b);
  return {
    prompt: `Calcule $${num(a)} - ${num(b)}$.`,
    answer: numAnswer(diff),
    hint: `Aligne les virgules ; écris $${num(a)}$ avec autant de décimales que $${num(b)}$ en ajoutant des zéros.`,
    correction: [`$${num(a)} - ${num(b)} = ${num(diff)}$`, `Vérification : $${num(diff)} + ${num(b)} = ${num(a)}$.`],
  };
});

const multiplication: Skill = skill('multiplication', 'Multiplier des décimaux', (rng, level) => {
  const a = byLevel(level, rng.int(12, 99), decimal(rng, 1, 99, rng.pick([1, 2])), decimal(rng, 1, 30, rng.pick([1, 2])));
  const b = byLevel(level, rng.int(3, 9), rng.int(3, 25), decimal(rng, 1, 9.9, 1));
  const p = fix(a * b);
  const da = decimalsOf(a);
  const db = decimalsOf(b);
  return {
    prompt: `Calcule $${num(a)} \\times ${num(b)}$.`,
    answer: numAnswer(p),
    hint: 'Multiplie sans t’occuper des virgules, puis place la virgule : le résultat a autant de chiffres après la virgule que les deux facteurs réunis.',
    correction:
      da + db === 0
        ? [`$${num(a)} \\times ${num(b)} = ${num(p)}$`]
        : [
            `Sans les virgules : $${Math.round(a * 10 ** da)} \\times ${Math.round(b * 10 ** db)} = ${num(Math.round(a * 10 ** da) * Math.round(b * 10 ** db))}$.`,
            `Il faut $${da + db}$ chiffre${da + db > 1 ? 's' : ''} après la virgule : $${num(a)} \\times ${num(b)} = ${num(p)}$.`,
          ],
  };
});

const fois10: Skill = skill('fois-10', 'Multiplier ou diviser par 10, 100, 1 000, 0,1…', (rng, level) => {
  const v = decimal(rng, 0.1, 999, rng.int(0, 3));
  const ops = byLevel(
    level,
    [{ op: '\\times', k: rng.pick([10, 100, 1000]) }],
    [{ op: rng.pick(['\\times', '\\div']), k: rng.pick([10, 100, 1000]) }],
    [{ op: '\\times', k: rng.pick([0.1, 0.01, 0.001]) }, { op: '\\div', k: rng.pick([10, 100, 1000]) }],
  );
  const { op, k } = rng.pick(ops);
  const r = fix(op === '\\times' ? v * k : v / k);
  const shift = String(k >= 1 ? k : Math.round(1 / k)).length - 1;
  const right = op === '\\times' && k >= 1;
  return {
    prompt: `Calcule $${num(v)} ${op} ${num(k)}$.`,
    answer: numAnswer(r),
    hint: k < 1 ? `Multiplier par $${num(k)}$, c'est diviser par $${num(Math.round(1 / k))}$.` : 'Chaque chiffre change de rang : la virgule se déplace d’autant de rangs qu’il y a de zéros.',
    correction: [`Les chiffres se décalent de $${shift}$ rang${shift > 1 ? 's' : ''} vers la ${right ? 'gauche' : 'droite'}.`, `$${num(v)} ${op} ${num(k)} = ${num(r)}$`],
  };
});

/** Arrondi à un seul chiffre significatif : 398 → 400, 21 → 20. */
export function oneDigit(v: number): number {
  const p = 10 ** Math.floor(Math.log10(v));
  return Math.round(v / p) * p;
}

const ordreGrandeur: Skill = skill('ordre-grandeur', 'Trouver un ordre de grandeur', (rng, level) => {
  const a = byLevel(level, rng.int(11, 99), rng.int(101, 999), rng.int(1001, 9999));
  const b = byLevel(level, rng.int(2, 9), rng.int(11, 99), rng.int(11, 99));
  const ra = oneDigit(a);
  const rb = oneDigit(b);
  const est = ra * rb;
  return {
    prompt: `Quel est le meilleur ordre de grandeur de $${num(a)} \\times ${num(b)}$ ?`,
    answer: makeChoice(rng, `$${num(est)}$`, [est * 10, est / 10, est * 100].map((x) => `$${num(x)}$`), () => `$${num(est * rng.int(2, 5))}$`),
    hint: 'Remplace chaque facteur par un nombre rond proche (un seul chiffre non nul), puis calcule mentalement.',
    correction: [`$${num(a)} \\approx ${num(ra)}$ et $${num(b)} \\approx ${num(rb)}$.`, `$${num(ra)} \\times ${num(rb)} = ${num(est)}$`],
  };
});

const calculMental: Skill = skill('calcul-mental', 'Calculer astucieusement', (rng, level) => {
  if (level === 1) {
    const a = rng.int(11, 89);
    const b = 100 - a;
    const c = rng.int(12, 89);
    const terms = rng.shuffle([a, b, c]);
    return {
      prompt: `Calcule mentalement $${terms.join(' + ')}$.`,
      answer: numAnswer(a + b + c),
      hint: 'Regroupe deux termes qui font un nombre rond.',
      correction: [`$${a} + ${b} = 100$`, `$100 + ${c} = ${100 + c}$`],
    };
  }
  if (level === 2) {
    const [x, y] = rng.pick([[4, 25], [2, 50], [5, 20], [8, 125], [2, 5]]);
    const c = rng.int(3, 49);
    const terms = rng.shuffle([x, y, c]);
    return {
      prompt: `Calcule mentalement $${terms.join(' \\times ')}$.`,
      answer: numAnswer(x * y * c),
      hint: 'Dans un produit, on peut changer l’ordre des facteurs : cherche deux facteurs dont le produit est rond.',
      correction: [`$${x} \\times ${y} = ${x * y}$`, `$${x * y} \\times ${c} = ${num(x * y * c)}$`],
    };
  }
  const k = rng.pick([99, 101, 98, 102, 999, 1001]);
  const n = rng.int(12, 89);
  const round = k > 500 ? 1000 : 100;
  const gap = k - round;
  return {
    prompt: `Calcule mentalement $${n} \\times ${k}$.`,
    answer: numAnswer(n * k),
    hint: `$${k} = ${round} ${gap > 0 ? '+' : '-'} ${Math.abs(gap)}$ : multiplie par $${round}$, puis corrige.`,
    correction: [
      `$${n} \\times ${k} = ${n} \\times ${round} ${gap > 0 ? '+' : '-'} ${n} \\times ${Math.abs(gap)}$`,
      `$= ${num(n * round)} ${gap > 0 ? '+' : '-'} ${n * Math.abs(gap)} = ${num(n * k)}$`,
    ],
  };
});

const probleme: Skill = skill('probleme-achats', 'Résoudre un problème d’achats', (rng, level) => {
  const who = prenom(rng);
  const plural = rng.pick(['cahiers', 'stylos', 'croissants', 'tickets de bus', 'classeurs']);
  const n = rng.int(2, byLevel(level, 5, 6, 9));
  const price = decimal(rng, 0.5, byLevel(level, 4, 6, 9), byLevel(level, 1, 2, 2));
  const total1 = fix(n * price);
  if (level === 1) {
    return {
      prompt: `${who} achète $${n}$ ${plural} à $${num(price)}$ € l'un. Quel est le prix total à payer (en €) ?`,
      answer: numAnswer(total1),
      hint: 'Le prix total est le nombre d’articles multiplié par le prix d’un article.',
      correction: [`$${n} \\times ${num(price)} = ${num(total1)}$ : cela coûte $${num(total1)}$ €.`],
    };
  }
  const extra = decimal(rng, 1, 9, 2);
  const total = fix(total1 + extra);
  const bill = [5, 10, 20, 50, 100].find((x) => x > total)!;
  const change = fix(bill - total);
  return {
    prompt: `${who} achète $${n}$ ${plural} à $${num(price)}$ € l'un et un livre à $${num(extra)}$ €. ${level === 3 ? `On lui rend la monnaie sur un billet de $${bill}$ €. Combien lui rend-on (en €) ?` : 'Quel est le prix total à payer (en €) ?'}`,
    answer: numAnswer(level === 3 ? change : total),
    hint: level === 3 ? 'Calcule d’abord le prix total, puis la différence avec le billet.' : `Commence par le prix des ${plural}, puis ajoute le livre.`,
    correction: [
      `Les ${plural} : $${n} \\times ${num(price)} = ${num(total1)}$ €.`,
      `Total : $${num(total1)} + ${num(extra)} = ${num(total)}$ €.`,
      ...(level === 3 ? [`Monnaie : $${bill} - ${num(total)} = ${num(change)}$ €.`] : []),
    ],
  };
});

export const OPERATIONS_SKILLS: Skill[] = [addition, soustraction, multiplication, fois10, ordreGrandeur, calculMental, probleme];
