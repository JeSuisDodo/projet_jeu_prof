import { frac, fracLatex } from '../fraction';
import type { Skill } from '../types';
import { byLevel, fixedChoice, fr, gcd, mathChoice, num, numAnswer, pairAnswer, prenom, skill } from './outils';

/** Fractions : partage, quotient, demi-droite graduée, égalités, comparaison à 1, fraction d'une quantité, sommes. */

const partage: Skill = skill('fraction-partage', 'Exprimer un partage par une fraction', (rng, level) => {
  const d = rng.int(3, byLevel(level, 8, 10, 12));
  const n = rng.int(1, d - 1);
  const who = prenom(rng);
  const [thing, ofThing, part] = rng.pick([
    ['une pizza', 'de la pizza', 'parts'],
    ['une tablette de chocolat', 'de la tablette', 'carrés'],
    ['un gâteau', 'du gâteau', 'parts'],
    ['une tarte', 'de la tarte', 'parts'],
  ]);
  const left = level === 3 && rng.next() < 0.6;
  const good = left ? fr(d - n, d) : fr(n, d);
  return {
    prompt: `On partage ${thing} en $${d}$ ${part} égales. ${who} en mange $${n}$. Quelle fraction ${ofThing} ${left ? 'reste-t-il' : 'a été mangée'} ?`,
    answer: mathChoice(rng, good, [left ? fr(n, d) : fr(d - n, d), fr(d, n), fr(n, d - n), fr(d, d - n)], () => fr(rng.int(1, 12), d + rng.int(1, 3))),
    hint: 'Le dénominateur indique en combien de parts égales on partage ; le numérateur, combien de parts on prend.',
    correction: left
      ? [`Il reste $${d} - ${n} = ${d - n}$ ${part} sur $${d}$.`, `Il reste $${good}$ ${ofThing}.`]
      : [`$${n}$ ${part} sur $${d}$ ont été mangées : c'est $${good}$ ${ofThing}.`],
  };
});

const quotient: Skill = skill('fraction-quotient', 'Voir une fraction comme un quotient', (rng, level) => {
  const b = rng.int(2, byLevel(level, 9, 12, 15));
  let a = rng.int(1, byLevel(level, 9, 20, 30));
  if (a % b === 0) a += 1;
  return {
    prompt: `Quel nombre, multiplié par $${b}$, donne $${a}$ ? Autrement dit, complète : $${b} \\times \\ldots = ${a}$.`,
    answer: mathChoice(rng, fr(a, b), [fr(b, a), fr(a + 1, b), `${a} \\times ${b}`, fr(a, a + b)], () => fr(a + rng.int(1, 5), b)),
    hint: `Par définition, $\\frac{a}{b}$ est le nombre qui, multiplié par $b$, donne $a$.`,
    correction: [`$${b} \\times ${fr(a, b)} = ${a}$`, `Le nombre cherché est le quotient $${fr(a, b)}$.`],
  };
});

/** Dénominateurs dont la fraction a une écriture décimale simple. */
const DECIMAL_DENOMS = [2, 4, 5, 10, 20, 25, 50, 100];

const versDecimal: Skill = skill('fraction-decimal', 'Donner l’écriture décimale d’une fraction', (rng, level) => {
  const d = rng.pick(byLevel(level, [2, 10, 100], [2, 4, 5, 10], DECIMAL_DENOMS));
  const n = rng.int(1, byLevel(level, 3 * d, 3 * d, 5 * d));
  const v = n / d;
  return {
    prompt: `Donne l'écriture décimale de $${fr(n, d)}$.`,
    answer: numAnswer(v),
    hint: `$${fr(n, d)}$ est le quotient de $${n}$ par $${d}$ : effectue la division (ou écris une fraction égale de dénominateur 10, 100…).`,
    correction: [`$${fr(n, d)} = ${n} \\div ${d} = ${num(v)}$`],
  };
});

const demiDroite: Skill = skill('fraction-demi-droite', 'Repérer une fraction sur une demi-droite graduée', (rng, level) => {
  const d = rng.int(2, byLevel(level, 5, 8, 10));
  const n = rng.int(1, byLevel(level, d - 1, 2 * d, 3 * d));
  return {
    prompt: `Sur une demi-droite graduée d'origine $O$, chaque unité est partagée en $${d}$ parts égales. Le point $M$ est placé $${n}$ graduations après $O$. Quelle est l'abscisse de $M$ (sous forme de fraction) ?`,
    answer: { kind: 'number', value: frac(n, d) },
    hint: `Une graduation représente $${fr(1, d)}$ d'unité.`,
    correction: [`Une graduation vaut $${fr(1, d)}$, donc $M$ a pour abscisse $${n} \\times ${fr(1, d)} = ${fr(n, d)}$${gcd(n, d) > 1 ? ` $= ${fracLatex(frac(n, d))}$` : ''}.`],
  };
});

const egales: Skill = skill('fractions-egales', 'Compléter une égalité de fractions', (rng, level) => {
  let a = rng.int(1, 9);
  let b = rng.int(2, 10);
  while (gcd(a, b) !== 1 || a === b) {
    a = rng.int(1, 9);
    b = rng.int(2, 10);
  }
  const k = rng.int(2, byLevel(level, 5, 9, 12));
  const simplify = level === 3 && rng.next() < 0.5;
  const missingTop = rng.next() < 0.5;
  const [left, right, ans] = simplify
    ? missingTop
      ? [fr(a * k, b * k), fr('\\ldots', b), a]
      : [fr(a * k, b * k), fr(a, '\\ldots'), b]
    : missingTop
      ? [fr(a, b), fr('\\ldots', b * k), a * k]
      : [fr(a, b), fr(a * k, '\\ldots'), b * k];
  return {
    prompt: `Complète : $${left} = ${right}$`,
    answer: numAnswer(ans),
    hint: 'Une fraction ne change pas quand on multiplie (ou divise) son numérateur et son dénominateur par un même nombre non nul.',
    correction: [simplify ? `On divise numérateur et dénominateur par $${k}$.` : `On multiplie numérateur et dénominateur par $${k}$.`, `Le nombre manquant est $${ans}$.`],
  };
});

const etUn: Skill = skill('fraction-et-un', 'Comparer une fraction à 1', (rng, level) => {
  const d = rng.int(2, byLevel(level, 9, 15, 30));
  const kind = rng.int(0, 2);
  const n = kind === 0 ? rng.int(1, d - 1) : kind === 1 ? d : rng.int(d + 1, 2 * d + 3);
  return {
    prompt: `Comment se situe la fraction $${fr(n, d)}$ par rapport à $1$ ?`,
    answer: fixedChoice(['Elle est plus petite que 1', 'Elle est égale à 1', 'Elle est plus grande que 1'], kind),
    hint: 'Compare le numérateur et le dénominateur : $\\frac{d}{d} = 1$.',
    correction: [`$${n} ${['<', '=', '>'][kind]} ${d}$, donc $${fr(n, d)} ${['<', '=', '>'][kind]} 1$.`],
  };
});

const encadrer: Skill = skill('encadrer-fraction', 'Encadrer une fraction entre deux entiers', (rng, level) => {
  const d = rng.int(2, byLevel(level, 5, 9, 15));
  let n = rng.int(d + 1, d * byLevel(level, 4, 8, 12));
  if (n % d === 0) n += 1;
  const q = Math.floor(n / d);
  return {
    prompt: `Encadre $${fr(n, d)}$ entre deux nombres entiers consécutifs : $\\ldots < ${fr(n, d)} < \\ldots$`,
    answer: pairAnswer(q, q + 1, ['Entier de gauche', 'Entier de droite']),
    hint: `Cherche dans la table de $${d}$ les deux multiples qui entourent $${n}$.`,
    correction: [`$${n} = ${d} \\times ${q} + ${n - d * q}$, donc $${fr(n, d)} = ${q} + ${fr(n - d * q, d)}$.`, `$${q} < ${fr(n, d)} < ${q + 1}$`],
  };
});

const quantite: Skill = skill('fraction-quantite', 'Prendre une fraction d’une quantité', (rng, level) => {
  const d = rng.pick(byLevel(level, [2, 3, 4, 5], [3, 4, 5, 6, 8, 10], [4, 6, 7, 8, 9, 12]));
  const n = level === 1 ? 1 : rng.int(1, d - 1 + (level === 3 ? d : 0));
  const unit = rng.int(2, byLevel(level, 10, 15, 25));
  const total = d * unit;
  const res = n * unit;
  const story = n > d ? `Calcule $${fr(n, d)}$ de $${total}$.` : rng.pick([
    `Dans un club de $${total}$ élèves, les $${fr(n, d)}$ font du football. Combien d'élèves font du football ?`,
    `Un sac contient $${total}$ billes ; les $${fr(n, d)}$ sont bleues. Combien y a-t-il de billes bleues ?`,
    `Un livre a $${total}$ pages. On en a lu les $${fr(n, d)}$. Combien de pages a-t-on lues ?`,
    `Calcule $${fr(n, d)}$ de $${total}$.`,
  ]);
  return {
    prompt: story,
    answer: numAnswer(res),
    hint: `Prendre $${fr(n, d)}$ d'une quantité, c'est la partager en $${d}$ puis prendre $${n}$ part${n > 1 ? 's' : ''}.`,
    correction: [`$${total} \\div ${d} = ${unit}$`, `$${n} \\times ${unit} = ${res}$`],
  };
});

const somme: Skill = skill('somme-fractions', 'Additionner ou soustraire des fractions', (rng, level) => {
  const d = rng.int(3, byLevel(level, 9, 12, 8));
  const k = level === 3 ? rng.int(2, 4) : 1;
  const d2 = d * k;
  const a = rng.int(1, 2 * d);
  const b = rng.int(1, 2 * d2);
  const minus = level >= 2 && rng.next() < 0.5 && a * k > b;
  const top = minus ? a * k - b : a * k + b;
  const result = frac(top, d2);
  return {
    prompt: `Calcule $${fr(a, d)} ${minus ? '-' : '+'} ${fr(b, d2)}$ (tu peux donner une fraction ou un décimal).`,
    answer: { kind: 'number', value: result },
    hint: k > 1 ? `Écris d'abord $${fr(a, d)}$ avec le dénominateur $${d2}$.` : 'Les dénominateurs sont égaux : on ajoute (ou on soustrait) les numérateurs et on garde le dénominateur.',
    correction: [
      ...(k > 1 ? [`$${fr(a, d)} = ${fr(a * k, d2)}$`] : []),
      `$${fr(a * k, d2)} ${minus ? '-' : '+'} ${fr(b, d2)} = ${fr(top, d2)}$${gcd(top, d2) > 1 ? ` $= ${fracLatex(result)}$` : ''}`,
    ],
  };
});

export const FRACTIONS_SKILLS: Skill[] = [partage, quotient, versDecimal, demiDroite, egales, etUn, encadrer, quantite, somme];
