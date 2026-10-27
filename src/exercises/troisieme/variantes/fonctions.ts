import { choiceTex, dec, decimal, euros, fixedChoice, fl, fraction, makeChoice, par, poly, prenom, round, vraiFaux } from '../../college';
import { frac } from '../../fraction';
import type { Answer } from '../../types';
import type { Variant } from '../../variantes';

/** 3e : nouvelles formes pour les fonctions, la proportionnalité et les grandeurs composées. */

const pair = (a: number, b: number, labels: [string, string]): Answer => ({ kind: 'pair', values: [frac(Math.round(a * 1e6), 1e6), frac(Math.round(b * 1e6), 1e6)], labels });
const sg = (v: number) => `${v < 0 ? '-' : '+'} ${dec(Math.abs(v))}`;
const pct = (v: number) => `${dec(v)}\\,\\%`;

const IMAGE: Variant[] = [
  {
    name: 'carre-negatif',
    make: (rng, level) => {
      const a = level === 1 ? 1 : rng.nonZero(-3, 3);
      const c = rng.int(-9, 9);
      const x = -rng.int(1, level === 3 ? 6 : 4);
      const v = a * x * x + c;
      return {
        prompt: `Soit $f(x) = ${poly([a, 0, c])}$. Calcule $f(${x})$.`,
        answer: decimal(v),
        hint: 'Attention : $(-3)^2 = 9$, le carré d’un nombre négatif est positif.',
        correction: [`$f(${x}) = ${a === 1 ? '' : a === -1 ? '-' : `${a} \\times `}(${x})^2 ${c === 0 ? '' : sg(c)} = ${a === 1 ? '' : a === -1 ? '-' : `${a} \\times `}${x * x} ${c === 0 ? '' : sg(c)} = ${v}$`],
      };
    },
  },
  {
    name: 'tableur',
    make: (rng, level) => {
      const a = rng.int(2, 5);
      const b = rng.nonZero(-9, 9);
      const x = rng.int(level === 1 ? 1 : -5, 9);
      const squared = level >= 2 && rng.next() < 0.5;
      const v = squared ? a * x * x + b : a * x + b;
      const formula = squared ? `=${a}*A1^2${b < 0 ? '' : '+'}${b}` : `=${a}*A1${b < 0 ? '' : '+'}${b}`;
      return {
        prompt: `Dans un tableur, la cellule A1 contient $${x}$ et la cellule B1 contient la formule « ${formula} ». Quel nombre s’affiche dans B1 ?`,
        answer: decimal(v),
        hint: 'Remplace A1 par sa valeur ; « * » est la multiplication et « ^2 » le carré.',
        correction: [squared ? `$${a} \\times ${par(x)}^2 ${sg(b)} = ${a} \\times ${x * x} ${sg(b)} = ${v}$` : `$${a} \\times ${par(x)} ${sg(b)} = ${v}$`],
      };
    },
  },
];

const ANTECEDENT: Variant[] = [
  {
    name: 'lineaire',
    make: (rng, level) => {
      const a = level === 1 ? rng.int(2, 9) : rng.nonZero(-9, 9);
      const x = rng.int(level === 1 ? 1 : -9, 12);
      return {
        prompt: `Soit $f(x) = ${poly([a, 0])}$. Quel nombre a pour image $${a * x}$ par $f$ ?`,
        answer: decimal(x),
        hint: `Résous $${poly([a, 0])} = ${a * x}$.`,
        correction: [`$${poly([a, 0])} = ${a * x}$, donc $x = \\frac{${a * x}}{${a}} = ${x}$.`],
      };
    },
  },
  {
    name: 'carre',
    from: 2,
    make: (rng) => {
      const r = rng.int(1, 12);
      const c = rng.int(-10, 10);
      return {
        prompt: `Soit $f(x) = ${poly([1, 0, c])}$. Donne tous les antécédents de $${r * r + c}$ par $f$, séparés par « ; ».`,
        answer: { kind: 'set', values: [frac(r), frac(-r)] },
        hint: `Résous $x^2 ${c === 0 ? '' : sg(c)} = ${r * r + c}$, soit $x^2 = ${r * r}$.`,
        correction: [`$x^2 = ${r * r + c} ${sg(-c)} = ${r * r}$`, `$x = ${r}$ ou $x = -${r}$ : deux antécédents.`],
      };
    },
  },
];

const TABLEAU: Variant[] = [
  {
    name: 'retrouver-formule',
    make: (rng, level) => {
      const a = level === 1 ? rng.int(2, 5) : rng.nonZero(-5, 5);
      const b = rng.nonZero(-6, 6);
      const xs = [0, 1, 2, 3];
      const row = xs.map((x) => a * x + b);
      const table = `\\begin{array}{|c|c|c|c|c|}\\hline x & ${xs.join(' & ')} \\\\ \\hline f(x) & ${row.join(' & ')} \\\\ \\hline\\end{array}`;
      return {
        prompt: `Voici un tableau de valeurs : $${table}$ Quelle formule peut définir $f$ ?`,
        answer: choiceTex(rng, `f(x) = ${poly([a, b])}`, [`f(x) = ${poly([b, a])}`, `f(x) = ${poly([a + b, 0])}`, `f(x) = ${poly([a, -b])}`, `f(x) = ${poly([-a, b])}`], () => `f(x) = ${poly([a + 1, b])}`),
        hint: '$f(0)$ donne le nombre seul ; l’écart entre deux images consécutives donne le coefficient de $x$.',
        correction: [`$f(0) = ${b}$ et les images augmentent de $${a}$ quand $x$ augmente de $1$.`, `$f(x) = ${poly([a, b])}$ convient : $f(3) = ${row[3]}$.`],
      };
    },
  },
];

const VOCABULAIRE: Variant[] = [
  {
    name: 'notation',
    make: (rng) => {
      const x = rng.int(-9, 9);
      const y = rng.int(-9, 9);
      const ask = rng.pick(['image', 'antecedent'] as const);
      return {
        prompt: `On sait que $f : ${x} \\mapsto ${y}$. ${ask === 'image' ? `Quelle est l’image de $${x}$ par $f$ ?` : `Donne un antécédent de $${y}$ par $f$.`}`,
        answer: decimal(ask === 'image' ? y : x),
        hint: '$f : a \\mapsto b$ signifie $f(a) = b$ : $b$ est l’image de $a$, et $a$ est un antécédent de $b$.',
        correction: [`$f(${x}) = ${y}$ : l’image de $${x}$ est $${y}$, et $${x}$ est un antécédent de $${y}$.`],
      };
    },
  },
  {
    name: 'vrai-faux',
    make: (rng) => {
      const items: [string, boolean, string][] = [
        ['Un nombre peut avoir plusieurs images par une même fonction.', false, 'Une fonction associe à chaque nombre une seule image.'],
        ['Un nombre peut avoir plusieurs antécédents par une même fonction.', true, 'Par exemple, avec $f(x) = x^2$, $4$ a deux antécédents : $2$ et $-2$.'],
        ['Un nombre peut n’avoir aucun antécédent.', true, 'Avec $f(x) = x^2$, $-1$ n’a aucun antécédent.'],
        ['Si $f(2) = 5$, alors $2$ est l’image de $5$.', false, '$5$ est l’image de $2$, et $2$ est un antécédent de $5$.'],
        ['Si $f(2) = 5$, le point $(2\\,;\\,5)$ est sur la courbe de $f$.', true, 'La courbe est formée des points $(x\\,;\\,f(x))$.'],
        ['Si $f(2) = 5$, le point $(5\\,;\\,2)$ est sur la courbe de $f$.', false, 'L’abscisse est le nombre de départ, l’ordonnée son image : c’est $(2\\,;\\,5)$.'],
      ];
      const [t, ok, why] = rng.pick(items);
      return { prompt: `Vrai ou faux ? ${t}`, answer: vraiFaux(ok), hint: 'Image : on part de $x$ et on calcule $f(x)$. Antécédent : on cherche $x$.', correction: [`${ok ? 'Vrai' : 'Faux'}. ${why}`] };
    },
  },
];

const POINT_COURBE: Variant[] = [
  {
    name: 'ordonnee',
    make: (rng, level) => {
      const a = level === 1 ? rng.int(1, 5) : rng.nonZero(-5, 5);
      const b = rng.int(-9, 9);
      const x = rng.int(-6, 6);
      return {
        prompt: `Le point $A(${x}\\,;\\,y)$ appartient à la droite d’équation $y = ${poly([a, b])}$. Quelle est son ordonnée $y$ ?`,
        answer: decimal(a * x + b),
        hint: 'Remplace $x$ par l’abscisse du point.',
        correction: [`$y = ${a === 1 ? '' : a === -1 ? '-' : `${a} \\times `}${par(x)} ${b === 0 ? '' : sg(b)} = ${a * x + b}$`],
      };
    },
  },
  {
    name: 'quel-point',
    from: 2,
    make: (rng) => {
      const a = rng.nonZero(-4, 4);
      const b = rng.int(-6, 6);
      const x = rng.int(-4, 4);
      const y = a * x + b;
      const pt = (p: number, q: number) => `$(${p}\\,;\\,${q})$`;
      return {
        prompt: `Lequel de ces points est sur la courbe de $f(x) = ${poly([a, b])}$ ?`,
        answer: makeChoice(rng, pt(x, y), [pt(y, x), pt(x, y + 1), pt(x, -y), pt(-x, y)].filter((p) => p !== pt(x, y)), () => pt(x + 1, y)),
        hint: 'Un point $(x\\,;\\,y)$ est sur la courbe si $y = f(x)$.',
        correction: [`$f(${x}) = ${y}$, donc le point $(${x}\\,;\\,${y})$ est sur la courbe.`],
      };
    },
  },
];

const LINEAIRE: Variant[] = [
  {
    name: 'pourcentage',
    make: (rng) => {
      const t = rng.pick([5, 10, 15, 20, 25, 30, 40, 50, 12, 8]);
      const up = rng.next() < 0.5;
      return {
        prompt: `${up ? 'Augmenter' : 'Diminuer'} un prix de $${t}\\,\\%$ revient à lui appliquer une fonction linéaire. Quel est son coefficient ?`,
        answer: decimal(1 + (up ? t : -t) / 100),
        hint: `${up ? 'Augmenter' : 'Diminuer'} de $t\\,\\%$, c’est multiplier par $1 ${up ? '+' : '-'} \\frac{t}{100}$.`,
        correction: [`$1 ${up ? '+' : '-'} \\frac{${t}}{100} = ${dec(1 + (up ? t : -t) / 100)}$`],
      };
    },
  },
  {
    name: 'autre-image',
    make: (rng, level) => {
      const a = level === 1 ? rng.int(2, 6) : rng.nonZero(-6, 6);
      const x1 = rng.int(1, 6);
      const x2 = rng.int(2, 12);
      return {
        prompt: `$f$ est une fonction linéaire telle que $f(${x1}) = ${a * x1}$. Calcule $f(${x2})$.`,
        answer: decimal(a * x2),
        hint: 'Trouve d’abord le coefficient $a$ : $f(x) = ax$.',
        correction: [`$a = \\frac{${a * x1}}{${x1}} = ${a}$, donc $f(x) = ${poly([a, 0])}$.`, `$f(${x2}) = ${a * x2}$`],
      };
    },
  },
];

const DEUX_POINTS: Variant[] = [
  {
    name: 'coefficient',
    make: (rng, level) => {
      const x1 = rng.int(-5, 3);
      const x2 = x1 + rng.int(1, 5);
      const y1 = rng.int(-9, 9);
      const y2 = level === 1 ? y1 + (x2 - x1) * rng.nonZero(-4, 4) : rng.int(-12, 12);
      return {
        prompt: `$f$ est une fonction affine avec $f(${x1}) = ${y1}$ et $f(${x2}) = ${y2}$. Quel est son coefficient directeur ?${level >= 2 ? ' (fraction acceptée)' : ''}`,
        answer: fraction(y2 - y1, x2 - x1),
        hint: '$a = \\frac{f(x_2) - f(x_1)}{x_2 - x_1}$',
        correction: [`$a = \\frac{${y2} - ${par(y1)}}{${x2} - ${par(x1)}} = \\frac{${y2 - y1}}{${x2 - x1}} = ${fl(y2 - y1, x2 - x1)}$`],
      };
    },
  },
  {
    name: 'taxi',
    from: 2,
    make: (rng) => {
      const charge = rng.int(2, 6) + rng.pick([0, 0.5]);
      const parKm = rng.pick([1, 1.2, 1.5, 2, 0.8]);
      const k1 = rng.int(3, 10);
      const k2 = k1 + rng.int(2, 10);
      const p1 = round(charge + parKm * k1, 2);
      const p2 = round(charge + parKm * k2, 2);
      return {
        prompt: `Un taxi facture une prise en charge fixe et un prix par kilomètre. Une course de $${k1}$ km coûte $${euros(p1)}$ € et une course de $${k2}$ km coûte $${euros(p2)}$ €. Donne le prix par kilomètre $a$ et la prise en charge $b$, en €.`,
        answer: pair(parKm, charge, ['a', 'b']),
        hint: 'Le prix est une fonction affine de la distance : $p(x) = ax + b$.',
        correction: [`$a = \\frac{${euros(p2)} - ${euros(p1)}}{${k2} - ${k1}} = ${dec(parKm)}$ €/km`, `$b = ${euros(p1)} - ${dec(parKm)} \\times ${k1} = ${dec(charge)}$ €`],
      };
    },
  },
];

const COEFFICIENTS: Variant[] = [
  {
    name: 'forme-cachee',
    from: 2,
    make: (rng) => {
      const k = rng.nonZero(-5, 5);
      const m = rng.nonZero(-5, 5);
      const n = rng.int(-9, 9);
      return {
        prompt: `Soit $f(x) = ${k}(x ${sg(-m)}) ${n === 0 ? '' : sg(n)}$. On écrit $f(x) = ax + b$ : donne $a$ et $b$.`,
        answer: pair(k, -k * m + n, ['a', 'b']),
        hint: 'Développe, puis réduis.',
        correction: [`$f(x) = ${poly([k, -k * m])} ${n === 0 ? '' : sg(n)} = ${poly([k, -k * m + n])}$`],
      };
    },
  },
  {
    name: 'sens-variation',
    make: (rng) => {
      const a = rng.pick([rng.nonZero(-6, 6), 0]);
      const b = rng.nonZero(-9, 9);
      const expr = a === 0 ? String(b) : rng.next() < 0.5 ? poly([a, b]) : `${b} ${a < 0 ? '-' : '+'} ${Math.abs(a) === 1 ? '' : Math.abs(a)}x`;
      return {
        prompt: `La fonction $f(x) = ${expr}$ est-elle croissante, décroissante ou constante ?`,
        answer: fixedChoice(['Croissante', 'Décroissante', 'Constante'], a > 0 ? 0 : a < 0 ? 1 : 2),
        hint: 'Regarde le signe du coefficient de $x$.',
        correction: [a === 0 ? 'Il n’y a pas de terme en $x$ : la fonction est constante.' : `Le coefficient de $x$ vaut $${a}$, ${a > 0 ? 'positif : la fonction est croissante' : 'négatif : la fonction est décroissante'}.`],
      };
    },
  },
];

const RECONNAITRE: Variant[] = [
  {
    name: 'vrai-faux',
    make: (rng) => {
      const a = rng.int(1, 6);
      const items: [string, boolean, string][] = [
        [`f(x) = (x + ${a})^2 - x^2`, true, `En développant : $f(x) = ${2 * a}x + ${a * a}$.`],
        [`f(x) = x(x + ${a})`, false, `$f(x) = x^2 + ${a}x$ contient un terme en $x^2$.`],
        [`f(x) = \\frac{${a}}{x}`, false, 'Le $x$ est au dénominateur.'],
        [`f(x) = \\frac{x + ${a}}{5}`, true, `$f(x) = \\frac{1}{5}x + \\frac{${a}}{5}$.`],
        [`f(x) = ${a}`, true, 'Une fonction constante est affine, avec $a = 0$.'],
        [`f(x) = \\sqrt{x} + ${a}`, false, '$\\sqrt{x}$ n’est pas de la forme $ax$.'],
        [`f(x) = (x - ${a})(x + ${a}) - x^2`, true, `En développant : $f(x) = -${a * a}$, constante.`],
      ];
      const [f, ok, why] = rng.pick(items);
      return { prompt: `Vrai ou faux : la fonction $${f}$ est affine.`, answer: vraiFaux(ok), hint: 'Développe et réduis : une fonction affine s’écrit $ax + b$.', correction: [`${ok ? 'Vrai' : 'Faux'}. ${why}`] };
    },
  },
];

const AFFINE_IMAGE: Variant[] = [
  {
    name: 'forfait',
    make: (rng) => {
      const abo = rng.int(5, 20);
      const prix = rng.pick([0.1, 0.2, 0.15, 0.05, 0.25]);
      const n = rng.int(2, 30) * 10;
      const total = round(abo + prix * n, 2);
      return {
        prompt: `Un forfait téléphonique coûte $${abo}$ € par mois, plus $${euros(prix)}$ € par minute de hors-forfait. Combien paie-t-on, en €, pour $${n}$ minutes de hors-forfait ?`,
        answer: decimal(total),
        hint: 'Le prix est $p(x) = ' + dec(prix) + 'x + ' + abo + '$ pour $x$ minutes.',
        correction: [`$p(${n}) = ${dec(prix)} \\times ${n} + ${abo} = ${euros(total)}$ €`],
      };
    },
  },
  {
    name: 'budget',
    from: 2,
    make: (rng) => {
      const fixe = rng.int(3, 15);
      const unit = rng.pick([2, 2.5, 3, 4, 1.5]);
      const budget = fixe + unit * rng.int(5, 20) + rng.pick([0, 1, 0.5]);
      const n = Math.floor((budget - fixe) / unit + 1e-9);
      return {
        prompt: `Une entrée au parc coûte $${fixe}$ € et chaque tour de manège $${euros(unit)}$ €. ${prenom(rng)} a $${euros(budget)}$ €. Combien de tours de manège au maximum peut-on faire avec cette somme ?`,
        answer: decimal(n),
        hint: `Résous $${fixe} + ${dec(unit)}n \\leq ${dec(budget)}$.`,
        correction: [`$${dec(unit)}n \\leq ${dec(budget - fixe)}$, donc $n \\leq ${dec(round((budget - fixe) / unit, 3))}$${Number.isInteger((budget - fixe) / unit) ? '' : '\\ldots'}.`, `Au maximum $${n}$ tours.`],
      };
    },
  },
];

const QUATRIEME_PROP: Variant[] = [
  {
    name: 'recette',
    make: (rng, level) => {
      const p1 = rng.pick([4, 6, 8]);
      const p2 = rng.pick(level === 1 ? [p1 * 2, p1 / 2] : [2, 3, 5, 10, 12].filter((x) => x !== p1));
      const g = rng.pick([100, 120, 150, 200, 250, 300]);
      const v = (g * p2) / p1;
      const ingr = rng.pick(['de farine', 'de sucre', 'de chocolat', 'de beurre']);
      return {
        prompt: `Une recette pour $${p1}$ personnes demande $${g}$ g ${ingr}. Quelle masse ${ingr}, en g, faut-il pour $${p2}$ personnes ?`,
        answer: decimal(v),
        hint: 'Passe par une personne, ou utilise un produit en croix.',
        correction: [`Pour une personne : $${g} \\div ${p1} = ${dec(g / p1)}$ g.`, `Pour $${p2}$ : $${dec(g / p1)} \\times ${p2} = ${dec(v)}$ g.`],
      };
    },
  },
  {
    name: 'produit-en-croix',
    from: 2,
    make: (rng) => {
      const b = rng.int(2, 12);
      const c = rng.int(2, 12);
      const k = rng.int(1, 9);
      const a = c * k;
      // x / a = b / c  →  x = a b / c = k b
      return {
        prompt: `Trouve $x$ tel que $\\frac{x}{${a}} = \\frac{${b}}{${c}}$.`,
        answer: decimal(k * b),
        hint: 'Produit en croix : $x \\times ' + c + ' = ' + a + ' \\times ' + b + '$.',
        correction: [`$x = \\frac{${a} \\times ${b}}{${c}} = ${k * b}$`],
      };
    },
  },
];

const POURCENTAGE: Variant[] = [
  {
    name: 'taux',
    make: (rng) => {
      const total = rng.pick([20, 25, 40, 50, 80, 200, 400, 500]);
      const t = rng.pick([5, 10, 15, 20, 25, 30, 40, 60, 75]);
      const part = (total * t) / 100;
      return {
        prompt: `Dans un club de $${total}$ adhérents, $${dec(part)}$ ont moins de 15 ans. Quel pourcentage des adhérents cela représente-t-il ?`,
        answer: decimal(t),
        hint: 'Pourcentage $= \\frac{\\text{partie}}{\\text{total}} \\times 100$.',
        correction: [`$\\frac{${dec(part)}}{${total}} \\times 100 = ${t}$ : cela fait $${t}\\,\\%$.`],
      };
    },
  },
  {
    name: 'total',
    from: 2,
    make: (rng) => {
      const t = rng.pick([10, 20, 25, 40, 5, 15, 30]);
      const total = rng.int(4, 40) * 20;
      const part = (total * t) / 100;
      return {
        prompt: `$${t}\\,\\%$ des élèves d’un collège viennent à vélo, soit $${dec(part)}$ élèves. Combien d’élèves compte le collège ?`,
        answer: decimal(total),
        hint: `$${t}\\,\\%$ du total vaut $${dec(part)}$ : divise par $${dec(t / 100)}$.`,
        correction: [`Total $\\times ${dec(t / 100)} = ${dec(part)}$`, `Total $= ${dec(part)} \\div ${dec(t / 100)} = ${total}$`],
      };
    },
  },
];

const COEF_MULT: Variant[] = [
  {
    name: 'lire-coefficient',
    make: (rng) => {
      const t = rng.pick([5, 10, 12, 15, 20, 25, 30, 40, 50, 60]);
      const up = rng.next() < 0.5;
      const k = 1 + (up ? t : -t) / 100;
      return {
        prompt: `Multiplier un prix par $${dec(k)}$ revient à l’augmenter ou à le diminuer d’un certain pourcentage. Lequel ? (Donne un nombre négatif pour une baisse.)`,
        answer: decimal(up ? t : -t),
        hint: 'Coefficient $1 + \\frac{t}{100}$ : hausse de $t\\,\\%$ ; coefficient $1 - \\frac{t}{100}$ : baisse de $t\\,\\%$.',
        correction: [`$${dec(k)} = 1 ${up ? '+' : '-'} ${dec(t / 100)}$ : c’est une ${up ? 'hausse' : 'baisse'} de $${t}\\,\\%$.`],
      };
    },
  },
];

const EVOLUTION: Variant[] = [
  {
    name: 'taux-evolution',
    make: (rng) => {
      const p = rng.pick([20, 40, 50, 80, 120, 200, 250]);
      const t = rng.pick([-50, -40, -25, -20, -10, -5, 5, 10, 15, 20, 25, 50]);
      const q = (p * (100 + t)) / 100;
      return {
        prompt: `Un prix passe de $${p}$ € à $${dec(q)}$ €. Quel est le taux d’évolution, en % ? (Donne un nombre négatif pour une baisse.)`,
        answer: decimal(t),
        hint: 'Taux $= \\frac{\\text{valeur finale} - \\text{valeur initiale}}{\\text{valeur initiale}} \\times 100$.',
        correction: [`$\\frac{${dec(q)} - ${p}}{${p}} \\times 100 = \\frac{${dec(q - p)}}{${p}} \\times 100 = ${t}$`, `Évolution : $${t > 0 ? '+' : ''}${t}\\,\\%$.`],
      };
    },
  },
];

const SUCCESSIVES: Variant[] = [
  {
    name: 'retour',
    from: 2,
    make: (rng) => {
      const [h, b] = rng.pick([
        [25, 20],
        [100, 50],
        [60, 37.5],
        [150, 60],
        [300, 75],
        [400, 80],
      ] as [number, number][]);
      return {
        prompt: `Un prix augmente de $${dec(h)}\\,\\%$. De quel pourcentage doit-il baisser pour revenir à sa valeur de départ ?`,
        answer: decimal(b),
        hint: 'Le coefficient de la baisse doit annuler celui de la hausse : $k_{\\text{baisse}} = \\frac{1}{k_{\\text{hausse}}}$.',
        correction: [`Coefficient de la hausse : $${dec(1 + h / 100)}$.`, `$\\frac{1}{${dec(1 + h / 100)}} = ${dec(1 - b / 100)}$, soit une baisse de $${pct(b)}$ (et non de $${pct(h)}$ !).`],
      };
    },
  },
  {
    name: 'deux-fois',
    make: (rng, level) => {
      const t = rng.pick(level === 1 ? [10, 20, 50] : [10, 20, 5, 30, 50]);
      const up = rng.next() < 0.6;
      const p = rng.pick([100, 200, 500, 1000]);
      const k = 1 + (up ? t : -t) / 100;
      const v = round(p * k * k, 2);
      return {
        prompt: `Une somme de $${p}$ € ${up ? 'augmente' : 'baisse'} de $${t}\\,\\%$ par an, deux années de suite. Combien vaut-elle au bout des deux ans, en € ?`,
        answer: decimal(v),
        hint: `On multiplie deux fois par le même coefficient $${dec(k)}$.`,
        correction: [`$${p} \\times ${dec(k)} \\times ${dec(k)} = ${p} \\times ${dec(round(k * k, 4))} = ${dec(v)}$ €`, `Ce n’est pas une évolution de $${2 * t}\\,\\%$.`],
      };
    },
  },
];

const RATIO: Variant[] = [
  {
    name: 'simplifier',
    make: (rng) => {
      const a = rng.int(1, 6);
      let b: number;
      do b = rng.int(1, 9);
      while (b === a);
      const k = rng.int(2, 8);
      return {
        prompt: `Simplifie le ratio $${a * k} : ${b * k}$ en $${a} : n$. Que vaut $n$ ?`,
        answer: decimal(b),
        hint: 'Comme pour une fraction, divise les deux nombres par le même nombre.',
        correction: [`$${a * k} : ${b * k} = ${a} : ${b}$ (on divise par $${k}$).`],
      };
    },
  },
  {
    name: 'total',
    from: 2,
    make: (rng) => {
      const a = rng.int(1, 5);
      const b = rng.int(1, 6);
      const u = rng.int(3, 20) * 5;
      const [n1, n2] = [prenom(rng), 'son frère'];
      return {
        prompt: `${n1} et ${n2} se partagent une somme selon le ratio $${a} : ${b}$. ${n1} reçoit $${a * u}$ €. Quelle est la somme totale, en € ?`,
        answer: decimal((a + b) * u),
        hint: 'Trouve d’abord la valeur d’une « part ».',
        correction: [`Une part vaut $${a * u} \\div ${a} = ${u}$ €.`, `Total : $(${a} + ${b}) \\times ${u} = ${(a + b) * u}$ €.`],
      };
    },
  },
];

const VITESSE: Variant[] = [
  {
    name: 'aller-retour',
    from: 2,
    make: (rng) => {
      const [v1, v2, m] = rng.pick([
        [60, 40, 48],
        [30, 60, 40],
        [90, 60, 72],
        [20, 30, 24],
        [12, 6, 8],
        [120, 80, 96],
        [15, 10, 12],
      ]);
      const d = rng.pick([60, 120, 180, 240]);
      return {
        prompt: `Un cycliste fait l’aller de $${dec(d)}$ km à $${v1}$ km/h et le retour, par le même chemin, à $${v2}$ km/h. Quelle est sa vitesse moyenne sur l’aller-retour, en km/h ?`,
        answer: decimal(m),
        hint: 'Ce n’est pas la moyenne des deux vitesses : calcule la distance totale et la durée totale.',
        correction: [`Durées : $\\frac{${dec(d)}}{${v1}} = ${dec(d / v1)}$ h et $\\frac{${dec(d)}}{${v2}} = ${dec(d / v2)}$ h.`, `$v = \\frac{${dec(2 * d)}}{${dec(d / v1 + d / v2)}} = ${m}$ km/h (et non $${(v1 + v2) / 2}$ km/h).`],
      };
    },
  },
  {
    name: 'distance',
    make: (rng) => {
      const v = rng.pick([4, 5, 12, 15, 30, 50, 80, 90, 110, 130]);
      const t = rng.pick([15, 20, 30, 45, 90, 120, 150]);
      const d = (v * t) / 60;
      return {
        prompt: `On roule pendant $${t}$ min à $${v}$ km/h de moyenne. Quelle distance parcourt-on, en km ?`,
        answer: decimal(d),
        hint: 'Convertis la durée en heures : $d = v \\times t$.',
        correction: [`$${t}$ min $= ${dec(t / 60)}$ h`, `$d = ${v} \\times ${dec(t / 60)} = ${dec(d)}$ km`],
      };
    },
  },
];

const DUREE: Variant[] = [
  {
    name: 'heure-arrivee',
    make: (rng) => {
      const v = rng.pick([60, 80, 90, 100, 120]);
      const minutes = rng.pick([30, 45, 75, 90, 105, 120, 135, 150]);
      const d = (v * minutes) / 60;
      const h0 = rng.int(7, 16);
      const m0 = rng.pick([0, 10, 15, 20, 30, 40, 45, 50]);
      const end = h0 * 60 + m0 + minutes;
      return {
        prompt: `Une voiture part à $${h0}$ h $${String(m0).padStart(2, '0')}$ et roule à $${v}$ km/h de moyenne pendant $${dec(d)}$ km. À quelle heure arrive-t-elle ? Donne les heures et les minutes.`,
        answer: pair(Math.floor(end / 60), end % 60, ['h', 'min']),
        hint: 'Calcule la durée $t = \\frac{d}{v}$, convertis-la en heures et minutes, puis ajoute-la à l’heure de départ.',
        correction: [`$t = \\frac{${dec(d)}}{${v}} = ${dec(minutes / 60)}$ h, soit $${minutes}$ min.`, `Arrivée : $${Math.floor(end / 60)}$ h $${String(end % 60).padStart(2, '0')}$.`],
      };
    },
  },
];

const CONVERSION_VITESSE: Variant[] = [
  {
    name: 'plus-rapide',
    make: (rng) => {
      const items: [string, number][] = [
        ['un guépard à $30$ m/s', 108],
        ['une voiture à $100$ km/h', 100],
        ['un cycliste à $8$ m/s', 28.8],
        ['un train à $250$ km/h', 250],
        ['un avion de tourisme à $60$ m/s', 216],
        ['un coureur à $10$ m/s', 36],
        ['un scooter à $45$ km/h', 45],
        ['un TGV à $90$ m/s', 324],
      ];
      const picked = rng.shuffle(items).slice(0, 3);
      const best = picked.reduce((m, p) => (p[1] > m[1] ? p : m));
      return {
        prompt: `Qui va le plus vite : ${picked.map((p) => p[0]).join(', ')} ?`,
        answer: makeChoice(rng, best[0].replace(/ à .*/, ''), picked.filter((p) => p !== best).map((p) => p[0].replace(/ à .*/, '')), () => 'aucun'),
        hint: 'Convertis tout dans la même unité : $1$ m/s $= 3{,}6$ km/h.',
        correction: [picked.map((p) => `${p[0].replace(/ à .*/, '')} : $${dec(p[1])}$ km/h`).join(' ; '), `Le plus rapide : ${best[0].replace(/ à .*/, '')}.`],
      };
    },
  },
  {
    name: 'par-minute',
    from: 2,
    make: (rng) => {
      const v = rng.pick([0.5, 1, 1.5, 2, 0.2, 0.25]);
      return {
        prompt: `Un véhicule parcourt $${dec(v)}$ km chaque minute. Quelle est sa vitesse en km/h ?`,
        answer: decimal(v * 60),
        hint: 'Une heure, c’est $60$ minutes.',
        correction: [`$${dec(v)} \\times 60 = ${dec(v * 60)}$ km/h`],
      };
    },
  },
];

const DEBIT: Variant[] = [
  {
    name: 'deux-robinets',
    from: 2,
    make: (rng) => {
      const q1 = rng.int(4, 15);
      const q2 = rng.int(4, 15);
      const t = rng.int(5, 30);
      return {
        prompt: `Une cuve de $${(q1 + q2) * t}$ L est remplie par deux robinets ouverts en même temps, de débits $${q1}$ L/min et $${q2}$ L/min. Combien de minutes faut-il ?`,
        answer: decimal(t),
        hint: 'Ensemble, les deux robinets ont un débit égal à la somme des débits.',
        correction: [`Débit total : $${q1} + ${q2} = ${q1 + q2}$ L/min.`, `$t = \\frac{${(q1 + q2) * t}}{${q1 + q2}} = ${t}$ min`],
      };
    },
  },
  {
    name: 'conversion',
    make: (rng) => {
      const q = rng.pick([3, 6, 1.2, 1.8, 12, 0.6]);
      return {
        prompt: `Une pompe a un débit de $${dec(q)}$ m³/h. Quel est ce débit en L/min ?`,
        answer: decimal((q * 1000) / 60),
        hint: '$1$ m³ $= 1\\,000$ L et $1$ h $= 60$ min.',
        correction: [`$${dec(q)}$ m³/h $= ${dec(q * 1000)}$ L/h $= \\frac{${dec(q * 1000)}}{60}$ L/min $= ${dec((q * 1000) / 60)}$ L/min`],
      };
    },
  },
];

export const FONCTIONS_3E: Record<string, Variant[]> = {
  '3e-image': IMAGE,
  '3e-antecedent': ANTECEDENT,
  '3e-tableau-valeurs': TABLEAU,
  '3e-vocabulaire-fonction': VOCABULAIRE,
  '3e-point-courbe': POINT_COURBE,
  '3e-lineaire': LINEAIRE,
  '3e-affine-deux-points': DEUX_POINTS,
  '3e-affine-coefficients': COEFFICIENTS,
  '3e-reconnaitre-affine': RECONNAITRE,
  '3e-affine-image': AFFINE_IMAGE,
  '3e-quatrieme-proportionnelle': QUATRIEME_PROP,
  '3e-pourcentage': POURCENTAGE,
  '3e-coefficient-multiplicateur': COEF_MULT,
  '3e-evolution': EVOLUTION,
  '3e-evolutions-successives': SUCCESSIVES,
  '3e-ratio': RATIO,
  '3e-vitesse': VITESSE,
  '3e-duree': DUREE,
  '3e-conversion-vitesse': CONVERSION_VITESSE,
  '3e-debit': DEBIT,
};
