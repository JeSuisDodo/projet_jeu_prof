import type { Skill } from '../types';
import { byLevel, decimal, fix, fr, makeChoice, num, numAnswer, pairAnswer, skill } from './outils';

/** Nombres entiers et décimaux : numération, écriture en lettres, comparaison, encadrement, arrondi. */

/** Rangs, de la position −3 (millièmes) à 6 (millions). */
const RANKS: Record<number, [string, string]> = {
  [-3]: ['millièmes', 'millièmes'],
  [-2]: ['centièmes', 'centièmes'],
  [-1]: ['dixièmes', 'dixièmes'],
  0: ['unités', 'unités'],
  1: ['dizaines', 'dizaines'],
  2: ['centaines', 'centaines'],
  3: ['unités de mille', 'milliers'],
  4: ['dizaines de mille', 'dizaines de mille'],
  5: ['centaines de mille', 'centaines de mille'],
  6: ['millions', 'millions'],
};

/** Chiffre du rang `r` (0 = unités) d'un nombre ayant au plus 3 décimales. */
export function digitAt(v: number, r: number): number {
  const n = Math.round(v * 1000);
  return Math.floor(n / 10 ** (r + 3)) % 10;
}

const chiffreRang: Skill = skill('chiffre-rang', 'Trouver le chiffre d’un rang', (rng, level) => {
  const intDigits = byLevel(level, rng.int(3, 4), rng.int(5, 7), rng.int(4, 7));
  const decs = byLevel(level, 0, rng.int(1, 2), rng.int(2, 3));
  // Tous les chiffres distincts du voisin pour que l'erreur de rang se voie.
  let v: number;
  do v = decimal(rng, 10 ** (intDigits - 1), 10 ** intDigits - 1, decs);
  while (decs > 0 && digitAt(v, -decs) === 0);
  if (level === 3 && rng.next() < 0.5) {
    // « Combien de dizaines en tout » : on garde tout ce qui est à gauche du rang.
    const r = rng.int(1, Math.min(3, intDigits - 1));
    const name = RANKS[r][1];
    const total = Math.floor(Math.round(v * 1000) / 10 ** (r + 3));
    return {
      prompt: `Combien y a-t-il de ${name} en tout dans $${num(v)}$ ?`,
      answer: numAnswer(total),
      hint: `Le nombre de ${name} s'obtient en gardant tous les chiffres jusqu'à celui des ${name}, et en oubliant ceux qui sont à droite.`,
      correction: [`Dans $${num(v)}$, on garde les chiffres jusqu'au rang des ${name} : il y a $${num(total)}$ ${name} en tout.`],
    };
  }
  const r = rng.int(-decs, intDigits - 1);
  const d = digitAt(v, r);
  return {
    prompt: `Quel est le chiffre des ${RANKS[r][0]} dans le nombre $${num(v)}$ ?`,
    answer: numAnswer(d),
    hint: 'Pars de la virgule (ou du chiffre des unités) : à gauche les unités, dizaines, centaines… ; à droite les dixièmes, centièmes, millièmes.',
    correction: [`Dans $${num(v)}$, le chiffre des ${RANKS[r][0]} est $${d}$.`],
  };
});

const UNITS = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize'];
const TENS = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante'];

/** Nombre de 0 à 99 en lettres (orthographe rectifiée : des traits d'union partout). */
function below100(n: number): string {
  if (n <= 16) return UNITS[n];
  if (n < 20) return `dix-${UNITS[n - 10]}`;
  const t = Math.floor(n / 10);
  const u = n % 10;
  if (t === 7 || t === 9) {
    const base = t === 7 ? 'soixante' : 'quatre-vingt';
    return `${base}${t === 7 && u === 1 ? '-et-' : '-'}${below100(10 + u)}`;
  }
  if (t === 8) return u === 0 ? 'quatre-vingts' : `quatre-vingt-${UNITS[u]}`;
  if (u === 0) return TENS[t];
  return `${TENS[t]}${u === 1 ? '-et-' : '-'}${UNITS[u]}`;
}

function below1000(n: number): string {
  const c = Math.floor(n / 100);
  const rest = n % 100;
  if (c === 0) return below100(rest);
  const head = c === 1 ? 'cent' : `${UNITS[c]}-cent${rest === 0 ? 's' : ''}`;
  return rest === 0 ? head : `${head}-${below100(rest)}`;
}

/** Entier de 0 à 999 999 999 en lettres, selon l'orthographe rectifiée de 1990. */
export function enLettres(n: number): string {
  if (n === 0) return 'zéro';
  const millions = Math.floor(n / 1e6);
  const thousands = Math.floor((n % 1e6) / 1000);
  const rest = n % 1000;
  const parts: string[] = [];
  if (millions) parts.push(millions === 1 ? 'un-million' : `${below1000(millions)}-millions`);
  if (thousands) {
    // « Cent » reste au singulier devant « mille » : deux-cent-mille.
    const t = thousands === 1 ? 'mille' : `${below1000(thousands).replace(/cents$/, 'cent').replace(/vingts$/, 'vingt')}-mille`;
    parts.push(t);
  }
  if (rest) parts.push(below1000(rest));
  return parts.join('-');
}

const lettres: Skill = skill('lettres', 'Passer des lettres aux chiffres', (rng, level) => {
  const n = byLevel(
    level,
    rng.int(101, 9999),
    rng.pick([rng.int(10_000, 999_999), rng.int(1, 99) * 1000 + rng.int(70, 99)]),
    rng.pick([rng.int(1, 9) * 1e6 + rng.int(0, 99) * 1000 + rng.int(70, 99), rng.int(100, 999) * 1000 + rng.int(0, 9) * 10, rng.int(1, 99) * 1e6 + rng.int(1, 999)]),
  );
  return {
    prompt: `Écris en chiffres le nombre « ${enLettres(n)} ».`,
    answer: numAnswer(n),
    hint: 'Découpe le nombre par classes : les millions, puis les milliers, puis les unités. Une classe absente donne trois zéros.',
    correction: [`« ${enLettres(n)} » s'écrit $${num(n)}$.`],
  };
});

const comparer: Skill = skill('comparer', 'Comparer des nombres décimaux', (rng, level) => {
  const int = rng.int(1, 30);
  // Les mêmes chiffres dans un ordre différent, et des longueurs différentes : les pièges classiques.
  const a = rng.int(1, 9);
  let b = rng.int(0, 9);
  while (b === a) b = rng.int(0, 9);
  const c = rng.int(1, 9);
  const raw = byLevel(
    level,
    [int + a / 10, int + b / 10, int + 1 + a / 10, int - 1 + b / 10],
    [int + a / 10, int + b / 10 + c / 100, int + a / 10 + c / 100, int + b / 10],
    [int + a / 10, int + a / 100, int + b / 10 + a / 100 + c / 1000, int + a / 10 + b / 1000, int + b / 100 + a / 1000],
  );
  const values = [...new Set(raw.map(fix))];
  const greatest = rng.next() < 0.5;
  const target = greatest ? Math.max(...values) : Math.min(...values);
  const sorted = [...values].sort((x, y) => x - y);
  return {
    prompt: `Quel est le plus ${greatest ? 'grand' : 'petit'} de ces nombres ?`,
    answer: makeChoice(rng, `$${num(target)}$`, values.filter((v) => v !== target).map((v) => `$${num(v)}$`), () => `$${num(int + rng.int(11, 99) / 100)}$`),
    hint: 'Compare d’abord les parties entières, puis les dixièmes, puis les centièmes… On peut ajouter des zéros à droite pour avoir autant de décimales.',
    correction: [`Dans l'ordre croissant : $${sorted.map(num).join(' < ')}$.`, `Le plus ${greatest ? 'grand' : 'petit'} est $${num(target)}$.`],
  };
});

const encadrer: Skill = skill('encadrer', 'Encadrer un décimal', (rng, level) => {
  const step = byLevel(level, 1, 0.1, rng.pick([0.1, 0.01]));
  const name = step === 1 ? 'à l’unité' : step === 0.1 ? 'au dixième' : 'au centième';
  const decs = step === 1 ? rng.int(1, 2) : step === 0.1 ? 2 : 3;
  let v: number;
  do v = decimal(rng, 1, 200, decs);
  while (Math.abs(fix(v / step) - Math.round(v / step)) < 1e-9);
  const lo = fix(Math.floor(fix(v / step)) * step);
  const hi = fix(lo + step);
  return {
    prompt: `Encadre $${num(v)}$ ${name} : $\\ldots < ${num(v)} < \\ldots$`,
    answer: pairAnswer(lo, hi, ['Nombre de gauche', 'Nombre de droite']),
    hint: `Les deux nombres cherchés sont consécutifs ${step === 1 ? 'entiers' : step === 0.1 ? 'avec un chiffre après la virgule' : 'avec deux chiffres après la virgule'}.`,
    correction: [`$${num(lo)} < ${num(v)} < ${num(hi)}$`],
  };
});

/** Arrondi « au plus proche », la moitié vers le haut, sans erreur de virgule flottante. */
export function roundTo(v: number, decimals: number): number {
  const scale = 10 ** decimals;
  return fix(Math.floor(fix(v * scale) + 0.5) / scale);
}

const arrondir: Skill = skill('arrondir', 'Arrondir un décimal', (rng, level) => {
  const decimals = byLevel(level, 0, rng.pick([0, 1]), rng.pick([1, 2]));
  const name = ['à l’unité', 'au dixième', 'au centième'][decimals];
  const v = decimal(rng, 1, byLevel(level, 50, 200, 500), decimals + rng.int(1, 2));
  const r = roundTo(v, decimals);
  const next = digitAt(v, -decimals - 1);
  return {
    prompt: `Donne l'arrondi ${name} de $${num(v)}$.`,
    answer: numAnswer(r),
    hint: 'Regarde le chiffre juste après celui du rang demandé : de 0 à 4 on garde, de 5 à 9 on augmente de 1.',
    correction: [`Le chiffre suivant est $${next}$, ${next >= 5 ? 'donc on arrondit au-dessus' : 'donc on arrondit en dessous'}.`, `L'arrondi ${name} de $${num(v)}$ est $${num(r)}$.`],
  };
});

const demiDroite: Skill = skill('demi-droite', 'Lire une abscisse sur une demi-droite graduée', (rng, level) => {
  const parts = byLevel(level, 10, rng.pick([2, 4, 5, 10]), rng.pick([4, 5, 10]));
  const start = level === 3 ? decimal(rng, 1, 9, 1) : rng.int(0, 9);
  const unit = level === 3 ? 0.1 : 1;
  const k = rng.int(1, parts - 1 + (level === 3 ? 0 : parts));
  const step = fix(unit / parts);
  const x = fix(start + k * step);
  return {
    prompt: `Sur une demi-droite graduée, ${level === 3 ? `l'écart entre $${num(start)}$ et $${num(start + unit)}$` : 'chaque unité'} est partagé${level === 3 ? '' : 'e'} en $${parts}$ parts égales. Le point $A$ est placé $${k}$ graduations après le repère $${num(start)}$. Quelle est l'abscisse de $A$ ?`,
    answer: numAnswer(x),
    hint: `Une graduation vaut $${num(unit)} \\div ${parts} = ${num(step)}$.`,
    correction: [`Une graduation vaut $${num(step)}$.`, `$${num(start)} + ${k} \\times ${num(step)} = ${num(x)}$`],
  };
});

const fractionDecimale: Skill = skill('fraction-decimale', 'Passer d’une fraction décimale à l’écriture décimale', (rng, level) => {
  if (level === 1 || rng.next() < 0.5) {
    const d = byLevel(level, rng.pick([10, 100]), rng.pick([10, 100, 1000]), rng.pick([100, 1000]));
    const n = rng.int(level === 3 ? 1 : 11, byLevel(level, 999, 9999, 99_999));
    const v = fix(n / d);
    return {
      prompt: `Donne l'écriture décimale de $${fr(n, d)}$.`,
      answer: numAnswer(v),
      hint: `Diviser par $${num(d)}$, c'est décaler les chiffres de ${String(d).length - 1} rang${d > 10 ? 's' : ''} vers la droite.`,
      correction: [`$${fr(n, d)} = ${num(v)}$`],
    };
  }
  // Décomposition : 4 dizaines, 7 unités, 3 centièmes…
  const tens = rng.int(0, 9);
  const units = rng.int(1, 9);
  const tenths = level === 3 ? 0 : rng.int(1, 9);
  const hundredths = rng.int(1, 9);
  const thousandths = level === 3 ? rng.int(1, 9) : 0;
  const v = fix(tens * 10 + units + tenths / 10 + hundredths / 100 + thousandths / 1000);
  const pieces = [
    tens ? `$${tens} \\times 10$` : '',
    `$${units}$`,
    tenths ? `$${fr(tenths, 10)}$` : '',
    `$${fr(hundredths, 100)}$`,
    thousandths ? `$${fr(thousandths, 1000)}$` : '',
  ].filter(Boolean);
  return {
    prompt: `Quel nombre décimal est égal à ${pieces.join(' + ')} ?`,
    answer: numAnswer(v),
    hint: 'Place chaque chiffre à son rang : dizaines, unités, puis après la virgule dixièmes, centièmes, millièmes. Un rang vide reçoit un 0.',
    correction: [`${pieces.join(' + ')} $= ${num(v)}$`],
  };
});

export const NOMBRES_SKILLS: Skill[] = [chiffreRang, lettres, comparer, encadrer, arrondir, demiDroite, fractionDecimale];

