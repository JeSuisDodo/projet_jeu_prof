import { dec, decimal, fixedChoice, fl, fraction, gcd, makeChoice, ouiNon, par, poly, prenom, vraiFaux } from '../../college';
import { frac } from '../../fraction';
import type { Answer } from '../../types';
import type { Variant } from '../../variantes';

/** 4e : variantes propres au programme de 4e (les autres sont reprises de la 3e, voir index.ts). */

const pair = (a: number, b: number, labels: [string, string]): Answer => ({ kind: 'pair', values: [frac(Math.round(a * 1e6), 1e6), frac(Math.round(b * 1e6), 1e6)], labels });
const sg = (v: number) => `${v < 0 ? '-' : '+'} ${dec(Math.abs(v))}`;
const fr = (n: number, d: number) => `${n < 0 ? '-' : ''}\\frac{${Math.abs(n)}}{${d}}`;
const pfr = (n: number, d: number) => (n < 0 ? `\\left(${fr(n, d)}\\right)` : fr(n, d));
const vf = (items: [string, boolean, string][], hint: string): Variant['make'] => (rng) => {
  const [t, ok, why] = rng.pick(items);
  return { prompt: `Vrai ou faux ? ${t}`, answer: vraiFaux(ok), hint, correction: [`${ok ? 'Vrai' : 'Faux'}. ${why}`] };
};

export const NOUVELLES_4E: Record<string, Variant[]> = {
  '4e-liste-diviseurs': [
    {
      name: 'compter',
      make: (rng, level) => {
        const n = rng.pick(level === 1 ? [12, 18, 20, 24, 30, 16, 28] : [36, 48, 60, 72, 84, 90, 96, 100]);
        const divs = Array.from({ length: n }, (_, i) => i + 1).filter((d) => n % d === 0);
        return {
          prompt: `Combien le nombre $${n}$ a-t-il de diviseurs (en comptant $1$ et $${n}$) ?`,
          answer: decimal(divs.length),
          hint: 'Cherche les diviseurs par paires : si $d$ divise $n$, alors $\\frac{n}{d}$ aussi.',
          correction: [`Diviseurs de $${n}$ : $${divs.join('$, $')}$.`, `Il y en a $${divs.length}$.`],
        };
      },
    },
    {
      name: 'communs',
      from: 2,
      make: (rng) => {
        const g = rng.pick([4, 6, 8, 9, 10, 12]);
        let a: number;
        let b: number;
        do {
          a = rng.int(2, 7);
          b = rng.int(2, 7);
        } while (a === b || gcd(a, b) !== 1);
        const common = Array.from({ length: g }, (_, i) => i + 1).filter((d) => g % d === 0);
        return {
          prompt: `Donne tous les diviseurs communs à $${a * g}$ et $${b * g}$, séparés par « ; ».`,
          answer: { kind: 'set', values: common.map((d) => frac(d)) },
          hint: 'Liste les diviseurs du plus petit nombre, puis garde ceux qui divisent aussi l’autre.',
          correction: [`Les diviseurs communs sont $${common.join('$, $')}$ (ce sont les diviseurs de $${g}$).`],
        };
      },
    },
  ],
  '4e-reduire': [
    {
      name: 'perimetre',
      make: (rng, level) => {
        const [a, b] = [rng.int(1, 5), rng.int(level === 1 ? 1 : -4, 9) || 1];
        const [c, d] = [rng.int(1, 4), rng.int(1, 9)];
        return {
          prompt: `Un rectangle a pour longueur $${poly([a, b])}$ et pour largeur $${poly([c, d])}$ (en cm). Son périmètre s’écrit $px + q$ : donne $p$ et $q$.`,
          answer: pair(2 * (a + c), 2 * (b + d), ['p', 'q']),
          hint: 'Périmètre $= 2 \\times (\\text{longueur} + \\text{largeur})$, puis réduis.',
          correction: [`$2(${poly([a, b])} + ${poly([c, d])}) = 2(${poly([a + c, b + d])}) = ${poly([2 * (a + c), 2 * (b + d)])}$`],
        };
      },
    },
    {
      name: 'vrai-faux',
      make: (rng) => {
        const a = rng.int(2, 6);
        const b = rng.int(2, 6);
        return vf(
          [
            [`$${a}x + ${b}x = ${a + b}x$`, true, 'On ajoute les coefficients des termes en $x$.'],
            [`$${a}x + ${b}x = ${a + b}x^2$`, false, `$${a}x + ${b}x = ${a + b}x$ : on additionne, on ne multiplie pas les $x$.`],
            [`$${a}x \\times ${b}x = ${a * b}x^2$`, true, `$${a} \\times ${b} = ${a * b}$ et $x \\times x = x^2$.`],
            [`$${a}x \\times ${b} = ${a * b}x$`, true, 'On multiplie les nombres entre eux.'],
            ['$x \\times x = 2x$', false, '$x \\times x = x^2$, alors que $x + x = 2x$.'],
            [`$${a} + ${b}x = ${a + b}x$`, false, 'Un nombre et un terme en $x$ ne se regroupent pas.'],
            [`$x^2 + x^2 = 2x^2$`, true, 'Deux termes en $x^2$ s’ajoutent.'],
          ],
          'Seuls les termes de même nature ($x$ avec $x$, $x^2$ avec $x^2$, nombres avec nombres) se regroupent.',
        )(rng, 1);
      },
    },
  ],
  '4e-substituer': [
    {
      name: 'deux-lettres',
      make: (rng, level) => {
        const [p, q] = [rng.int(2, 6), rng.nonZero(-5, 5)];
        const a = level === 1 ? rng.int(1, 9) : rng.int(-6, 6);
        const b = level === 1 ? rng.int(1, 9) : rng.int(-6, 6);
        const v = p * a - q * b;
        return {
          prompt: `Calcule $${p}a ${q < 0 ? '+' : '-'} ${Math.abs(q)}b$ pour $a = ${a}$ et $b = ${b}$.`,
          answer: decimal(v),
          hint: 'Remplace chaque lettre par sa valeur, entre parenthèses si elle est négative.',
          correction: [`$${p} \\times ${par(a)} ${q < 0 ? '+' : '-'} ${Math.abs(q)} \\times ${par(b)} = ${p * a} ${q < 0 ? '+' : '-'} ${par(Math.abs(q) * b)} = ${v}$`],
        };
      },
    },
  ],
  '4e-tester-valeur': [
    {
      name: 'deux-membres',
      make: (rng) => {
        const [a, b, c] = [rng.nonZero(-5, 6), rng.int(-9, 9), rng.nonZero(-5, 6)];
        const x = rng.int(-5, 6);
        const ok = rng.next() < 0.5;
        const d = a * x + b - c * x + (ok ? 0 : rng.nonZero(-3, 3));
        const l = a * x + b;
        const r = c * x + d;
        return {
          prompt: `Le nombre $${x}$ est-il solution de l’équation $${poly([a, b])} = ${poly([c, d])}$ ?`,
          answer: ouiNon(l === r),
          hint: 'Calcule séparément chaque membre pour cette valeur, puis compare.',
          correction: [`Membre de gauche : $${l}$. Membre de droite : $${r}$.`, l === r ? `Égaux : $${x}$ est solution.` : `Différents : $${x}$ n’est pas solution.`],
        };
      },
    },
    {
      name: 'quel-nombre',
      from: 2,
      make: (rng) => {
        const a = rng.int(2, 6);
        const x = rng.int(-6, 8);
        const b = rng.int(-9, 9);
        const c = a * x + b;
        return {
          prompt: `Lequel de ces nombres est solution de $${poly([a, b])} = ${c}$ ?`,
          answer: makeChoice(rng, `$${x}$`, [`$${-x}$`, `$${x + 1}$`, `$${c - b}$`, `$${c + b}$`, `$${x - 1}$`], () => `$${x + 2}$`),
          hint: 'Teste chaque proposition, ou résous l’équation.',
          correction: [`$${a} \\times ${par(x)} ${sg(b)} = ${c}$ : $${x}$ est solution.`],
        };
      },
    },
  ],
  '4e-volume-pyramide': [
    {
      name: 'hauteur',
      from: 2,
      make: (rng) => {
        const c = rng.int(2, 9);
        const h = rng.int(2, 12) * 3;
        const V = (c * c * h) / 3;
        return {
          prompt: `Une pyramide à base carrée de côté $${c}$ cm a un volume de $${V}$ cm³. Quelle est sa hauteur, en cm ?`,
          answer: decimal(h),
          hint: '$V = \\frac{1}{3} \\times \\text{aire de la base} \\times h$ : isole $h$.',
          correction: [`Aire de la base : $${c * c}$ cm².`, `$h = \\frac{3V}{\\text{base}} = \\frac{3 \\times ${V}}{${c * c}} = ${h}$ cm`],
        };
      },
    },
    {
      name: 'dans-le-pave',
      make: (rng) => {
        const [L, l, h] = [rng.int(2, 9), rng.int(2, 9), rng.int(3, 12)];
        return {
          prompt: `Un pavé droit de $${L}$ cm × $${l}$ cm × $${h}$ cm contient une pyramide de même base et de même hauteur. Quel est le volume de la pyramide, en cm³${(L * l * h) % 3 ? ' (fraction acceptée)' : ''} ?`,
          answer: fraction(L * l * h, 3),
          hint: 'La pyramide occupe le tiers du pavé de même base et de même hauteur.',
          correction: [`Pavé : $${L} \\times ${l} \\times ${h} = ${L * l * h}$ cm³.`, `Pyramide : $\\frac{${L * l * h}}{3} = ${fl(L * l * h, 3)}$ cm³`],
        };
      },
    },
  ],
  '4e-volume-cone': [
    {
      name: 'cornet',
      make: (rng) => {
        const r = rng.int(2, 5);
        const h = rng.int(6, 15);
        const v = (Math.PI * r * r * h) / 3;
        const rounded = Math.round(v);
        return {
          prompt: `Un cornet de glace a la forme d’un cône de rayon $${r}$ cm et de hauteur $${h}$ cm. Quel est son volume, arrondi au cm³ ?`,
          answer: decimal(rounded),
          hint: '$V = \\frac{1}{3}\\pi r^2 h$',
          correction: [`$V = \\frac{1}{3} \\times \\pi \\times ${r}^2 \\times ${h} = ${fl(r * r * h, 3)}\\pi \\approx ${rounded}$ cm³`],
        };
      },
    },
    {
      name: 'rapport-cylindre',
      from: 2,
      make: (rng) => {
        const V = rng.int(2, 30) * 3;
        return {
          prompt: `Un cylindre et un cône ont la même base et la même hauteur. Le cylindre a un volume de $${V}$ cm³. Quel est le volume du cône, en cm³ ?`,
          answer: decimal(V / 3),
          hint: 'Le cône a le tiers du volume du cylindre de même base et de même hauteur.',
          correction: [`$\\frac{${V}}{3} = ${V / 3}$ cm³`],
        };
      },
    },
  ],
  '4e-decrire-pyramide': [
    {
      name: 'retrouver-base',
      make: (rng) => {
        const n = rng.int(3, 10);
        const what = rng.pick(['arêtes', 'faces', 'sommets'] as const);
        const count = what === 'arêtes' ? 2 * n : n + 1;
        return {
          prompt: `Une pyramide a $${count}$ ${what}. Combien de côtés a sa base ?`,
          answer: decimal(n),
          hint: 'Pour une base à $n$ côtés : $n + 1$ faces, $n + 1$ sommets et $2n$ arêtes.',
          correction: [what === 'arêtes' ? `$2n = ${count}$, donc $n = ${n}$.` : `$n + 1 = ${count}$, donc $n = ${n}$.`],
        };
      },
    },
  ],
  '4e-somme-fractions': [
    {
      name: 'reste-du-gateau',
      make: (rng, level) => {
        const [d1, d2] = rng.pick(level === 1 ? [[2, 4], [3, 6], [4, 8], [2, 8]] : [[3, 4], [4, 6], [5, 10], [3, 5], [6, 8]]);
        const n1 = 1;
        const n2 = level === 3 ? rng.int(1, 2) : 1;
        const [a, b] = deuxPrenomsDistincts(rng);
        const m = (d1 * d2) / gcd(d1, d2);
        const rest = m - (n1 * m) / d1 - (n2 * m) / d2;
        return {
          prompt: `${a} mange $${fr(n1, d1)}$ d’un gâteau et ${b} en mange $${fr(n2, d2)}$. Quelle fraction du gâteau reste-t-il ?`,
          answer: fraction(rest, m),
          hint: 'Additionne ce qui est mangé (même dénominateur), puis retire le résultat de $1$.',
          correction: [`$${fr(n1, d1)} + ${fr(n2, d2)} = \\frac{${(n1 * m) / d1} + ${(n2 * m) / d2}}{${m}} = \\frac{${m - rest}}{${m}}$`, `Reste : $1 - \\frac{${m - rest}}{${m}} = ${fl(rest, m)}$`],
        };
      },
    },
    {
      name: 'entier-plus-fraction',
      make: (rng) => {
        const e = rng.int(1, 5);
        const d = rng.int(2, 9);
        const n = rng.int(1, d - 1);
        return {
          prompt: `Écris $${e} + ${fr(n, d)}$ sous la forme d’une seule fraction.`,
          answer: fraction(e * d + n, d),
          hint: `$${e} = \\frac{${e * d}}{${d}}$`,
          correction: [`$${e} + ${fr(n, d)} = \\frac{${e * d}}{${d}} + ${fr(n, d)} = ${fl(e * d + n, d)}$`],
        };
      },
    },
  ],
  '4e-produit-fractions': [
    {
      name: 'fraction-de-fraction',
      make: (rng) => {
        const [n1, d1] = rng.pick([[1, 2], [1, 3], [3, 4], [2, 5], [1, 4]]);
        const [n2, d2] = rng.pick([[2, 3], [3, 5], [4, 7], [5, 6], [3, 8]]);
        const words: Record<string, string> = { '1/2': 'la moitié', '1/3': 'le tiers', '1/4': 'le quart', '3/4': 'les trois quarts', '2/5': 'les deux cinquièmes' };
        return {
          prompt: `Dans un collège, $${fr(n2, d2)}$ des élèves sont demi-pensionnaires, et ${words[`${n1}/${d1}`]} d’entre eux prennent un dessert. Quelle fraction des élèves du collège prend un dessert ?`,
          answer: fraction(n1 * n2, d1 * d2),
          hint: 'Prendre une fraction d’une fraction, c’est multiplier.',
          correction: [`$${fr(n1, d1)} \\times ${fr(n2, d2)} = \\frac{${n1 * n2}}{${d1 * d2}} = ${fl(n1 * n2, d1 * d2)}$`],
        };
      },
    },
  ],
  '4e-quotient-fractions': [
    {
      name: 'combien-de-fois',
      make: (rng) => {
        const [n, d] = rng.pick([[3, 4], [1, 2], [1, 4], [2, 3], [3, 2], [1, 3]]);
        const k = rng.int(2, 9) * n;
        return {
          prompt: `Combien de bouteilles de $${fr(n, d)}$ L faut-il pour transvaser exactement $${k}$ L ?`,
          answer: decimal((k * d) / n),
          hint: `On cherche combien de fois $${fr(n, d)}$ va dans $${k}$ : c’est $${k} \\div ${fr(n, d)}$.`,
          correction: [`$${k} \\div ${fr(n, d)} = ${k} \\times ${fr(d, n)} = ${(k * d) / n}$ bouteilles`],
        };
      },
    },
    {
      name: 'inverse',
      make: (rng, level) => {
        const n = level === 1 ? rng.int(1, 9) : rng.nonZero(-9, 9);
        const d = rng.int(2, 9);
        return {
          prompt: `Quel est l’inverse de $${pfr(n, d).replace(/\\left\(|\\right\)/g, '')}$ ?`,
          answer: fraction(d, n),
          hint: 'L’inverse de $\\frac{a}{b}$ est $\\frac{b}{a}$ : leur produit vaut $1$.',
          correction: [`$${pfr(n, d)} \\times ${pfr(n < 0 ? -d : d, Math.abs(n))} = 1$, donc l’inverse est $${fl(d, n)}$.`],
        };
      },
    },
  ],
  '4e-fraction-de': [
    {
      name: 'retrouver-total',
      make: (rng) => {
        const [n, d] = rng.pick([[1, 2], [1, 3], [2, 3], [3, 4], [2, 5], [3, 5], [1, 4]]);
        const total = d * rng.int(3, 12);
        return {
          prompt: `Les $${fr(n, d)}$ d’une classe, soit $${(total * n) / d}$ élèves, sont externes. Combien la classe compte-t-elle d’élèves ?`,
          answer: decimal(total),
          hint: `$${fr(1, d)}$ de la classe représente $${(total * n) / d} \\div ${n}$ élèves.`,
          correction: [`$${fr(1, d)}$ de la classe : $${(total * n) / d} \\div ${n} = ${total / d}$ élèves.`, `Classe entière : $${total / d} \\times ${d} = ${total}$ élèves.`],
        };
      },
    },
  ],
  '4e-comparer-fractions': [
    {
      name: 'la-plus-grande',
      make: (rng) => {
        const d = rng.pick([12, 20, 24, 30]);
        const divs = [2, 3, 4, 5, 6, 10, 12].filter((x) => d % x === 0);
        const picked: [number, number][] = [];
        let guard = 0;
        while (picked.length < 4 && guard++ < 200) {
          const dd = rng.pick(divs);
          const nn = rng.int(1, dd - 1);
          if (gcd(nn, dd) === 1 && !picked.some(([a, b]) => a * dd === nn * b)) picked.push([nn, dd]);
        }
        const best = picked.reduce((m, p) => (p[0] / p[1] > m[0] / m[1] ? p : m));
        return {
          prompt: 'Laquelle de ces fractions est la plus grande ?',
          answer: makeChoice(rng, `$${fr(...best)}$`, picked.filter((p) => p !== best).map((p) => `$${fr(...p)}$`), () => '$0$'),
          hint: `Mets-les toutes au dénominateur $${d}$.`,
          correction: [picked.map(([a, b]) => `$${fr(a, b)} = \\frac{${(a * d) / b}}{${d}}$`).join(', '), `La plus grande est $${fr(...best)}$.`],
        };
      },
    },
  ],
  '4e-proba-cartes': [
    {
      name: 'ou',
      from: 2,
      make: (rng) => {
        const deck = rng.pick([32, 52]);
        const per = deck / 4;
        const fig = rng.pick(['roi', 'as', 'dame'] as const);
        const coul = rng.pick(['cœur', 'pique'] as const);
        const n = 4 + per - 1;
        return {
          prompt: `On tire une carte au hasard dans un jeu de $${deck}$ cartes. Quelle est la probabilité d’obtenir un ${fig} ou un ${coul} ?`,
          answer: fraction(n, deck),
          hint: `Compte les ${fig}s et les ${coul}s sans compter deux fois le ${fig} de ${coul}.`,
          correction: [`$4$ ${fig}s et $${per}$ ${coul}s, dont $1$ en commun : $4 + ${per} - 1 = ${n}$ cartes.`, `$P = \\frac{${n}}{${deck}} = ${fl(n, deck)}$`],
        };
      },
    },
    {
      name: 'carte-retiree',
      make: (rng) => {
        const k = rng.int(1, 3);
        return {
          prompt: `Dans un jeu de $32$ cartes, on retire $${k}$ as. On tire ensuite une carte au hasard parmi les cartes restantes. Quelle est la probabilité de tirer un as ?`,
          answer: fraction(4 - k, 32 - k),
          hint: 'Recompte le nombre d’as et le nombre total de cartes après le retrait.',
          correction: [`Il reste $${4 - k}$ as sur $${32 - k}$ cartes : $P = ${fl(4 - k, 32 - k)}$.`],
        };
      },
    },
  ],
  '4e-proba-vocabulaire': [
    {
      name: 'vrai-faux',
      make: vf(
        [
          ['Une probabilité peut valoir $1{,}2$.', false, 'Une probabilité est toujours comprise entre $0$ et $1$.'],
          ['Un événement impossible a une probabilité égale à $0$.', true, 'Aucune issue ne le réalise.'],
          ['Si $P(A) = 0{,}3$, alors $P(\\overline{A}) = 0{,}7$.', true, '$P(\\overline{A}) = 1 - P(A)$.'],
          ['Après cinq Pile de suite, Face a plus de chances de sortir au lancer suivant.', false, 'La pièce n’a pas de mémoire : la probabilité reste $\\frac{1}{2}$.'],
          ['La somme des probabilités de toutes les issues vaut $1$.', true, 'C’est vrai pour toute expérience aléatoire.'],
          ['Avec un dé équilibré, obtenir $6$ est moins probable qu’obtenir $1$.', false, 'Chaque face a la probabilité $\\frac{1}{6}$.'],
          ['Un événement certain a une probabilité égale à $1$.', true, 'Toutes les issues le réalisent.'],
        ],
        'Une probabilité est un nombre entre $0$ (impossible) et $1$ (certain).',
      ),
    },
  ],
  '4e-reconnaitre-proportionnalite': [
    {
      name: 'situations',
      make: vf(
        [
          ['Le prix payé est proportionnel au nombre de baguettes achetées (même prix unitaire).', true, 'Deux fois plus de baguettes coûtent deux fois plus cher.'],
          ['La taille d’un enfant est proportionnelle à son âge.', false, 'À 2 ans on ne mesure pas le double de sa taille à 1 an, et la croissance s’arrête.'],
          ['Le périmètre d’un carré est proportionnel à la longueur de son côté.', true, '$P = 4c$.'],
          ['L’aire d’un carré est proportionnelle à la longueur de son côté.', false, '$A = c^2$ : doubler le côté multiplie l’aire par $4$.'],
          ['La distance parcourue à vitesse constante est proportionnelle à la durée.', true, '$d = v \\times t$.'],
          ['Le prix d’une course en taxi (prise en charge + prix au km) est proportionnel à la distance.', false, 'La prise en charge s’ajoute : pour $0$ km, on paie déjà quelque chose.'],
          ['La longueur d’un cercle est proportionnelle à son rayon.', true, '$L = 2\\pi r$.'],
        ],
        'Deux grandeurs sont proportionnelles si l’on passe de l’une à l’autre en multipliant toujours par le même nombre.',
      ),
    },
  ],
  '4e-echelle': [
    {
      name: 'distance-sur-carte',
      make: (rng) => {
        const e = rng.pick([25000, 50000, 100000, 200000]);
        const km = rng.pick([1, 2, 3, 5, 10, 0.5]);
        const cm = (km * 100000) / e;
        return {
          prompt: `Sur une carte à l’échelle $\\frac{1}{${e}}$, quelle longueur, en cm, représente une distance réelle de $${dec(km)}$ km ?`,
          answer: decimal(cm),
          hint: 'Convertis la distance réelle en cm ($1$ km $= 100\\,000$ cm), puis divise par l’échelle.',
          correction: [`$${dec(km)}$ km $= ${dec(km * 100000)}$ cm.`, `$${dec(km * 100000)} \\div ${e} = ${dec(cm)}$ cm`],
        };
      },
    },
  ],
  '4e-regles-puissances-10': [
    {
      name: 'produit-quotient',
      make: (rng, level) => {
        const [a, b, c] = [rng.int(level === 1 ? 1 : -5, 9), rng.int(level === 1 ? 1 : -5, 9), rng.int(1, 6)];
        return {
          prompt: `On écrit $\\frac{10^{${a}} \\times 10^{${b}}}{10^{${c}}} = 10^{n}$. Que vaut $n$ ?`,
          answer: decimal(a + b - c),
          hint: 'On ajoute les exposants pour un produit, on les soustrait pour un quotient.',
          correction: [`$n = ${a} ${sg(b)} - ${c} = ${a + b - c}$`],
        };
      },
    },
  ],
  '4e-exposant-negatif': [
    {
      name: 'vrai-faux',
      make: (rng) => {
        const a = rng.int(2, 5);
        const n = rng.int(1, 3);
        return vf(
          [
            [`$${a}^{-${n}} = -${a ** n}$`, false, `$${a}^{-${n}} = \\frac{1}{${a}^{${n}}} = \\frac{1}{${a ** n}}$, un nombre positif.`],
            [`$${a}^{-${n}} = \\frac{1}{${a ** n}}$`, true, `$${a}^{-${n}} = \\frac{1}{${a}^{${n}}}$.`],
            [`$10^{-${n}} = ${(10 ** -n).toFixed(n).replace('.', '{,}')}$`, true, `Le $1$ est au rang des ${['dixièmes', 'centièmes', 'millièmes'][n - 1]}.`],
            [`$10^{-${n}}$ est un nombre négatif.`, false, `$10^{-${n}} = ${(10 ** -n).toFixed(n).replace('.', '{,}')}$, positif.`],
          ],
          '$a^{-n} = \\frac{1}{a^n}$ : un exposant négatif donne un inverse, pas un nombre négatif.',
        )(rng, 1);
      },
    },
  ],
  '4e-prefixes': [
    {
      name: 'stockage',
      make: (rng) => {
        const cases: [string, string, number, number][] = [
          ['Go', 'Mo', 1000, rng.int(2, 64)],
          ['To', 'Go', 1000, rng.int(1, 8)],
          ['Mo', 'ko', 1000, rng.int(2, 500)],
        ];
        const [big, small, f, k] = rng.pick(cases);
        return {
          prompt: `Une clé USB contient $${k}$ ${big}. Combien de ${small} cela fait-il ? (méga $= 10^6$, giga $= 10^9$, téra $= 10^{12}$, kilo $= 10^3$)`,
          answer: decimal(k * f),
          hint: `$1$ ${big} $= 1\\,000$ ${small}.`,
          correction: [`$${k} \\times 1\\,000 = ${k * f}$ ${small}`],
        };
      },
    },
  ],
  '4e-comparer-ecritures': [
    {
      name: 'le-plus-grand',
      make: (rng) => {
        const vals: [number, number][] = [];
        while (vals.length < 4) {
          const a = rng.int(1, 9) + rng.pick([0, 0.5, 0.2]);
          const n = rng.int(-3, 6);
          if (!vals.some(([x, m]) => x * 10 ** m === a * 10 ** n)) vals.push([a, n]);
        }
        const best = vals.reduce((m, v) => (v[0] * 10 ** v[1] > m[0] * 10 ** m[1] ? v : m));
        const t = ([a, n]: [number, number]) => `$${dec(a)} \\times 10^{${n}}$`;
        return {
          prompt: 'Lequel de ces nombres est le plus grand ?',
          answer: makeChoice(rng, t(best), vals.filter((v) => v !== best).map(t), () => '$0$'),
          hint: 'Compare d’abord les exposants (pour des écritures scientifiques), puis les nombres devant.',
          correction: [`Le plus grand est ${t(best)}.`],
        };
      },
    },
  ],
  '4e-produit-relatifs': [
    {
      name: 'facteur-manquant',
      make: (rng) => {
        const a = rng.nonZero(-9, 9);
        const x = rng.nonZero(-9, 9);
        return {
          prompt: `Complète : $${par(a)} \\times \\ldots = ${a * x}$.`,
          answer: decimal(x),
          hint: 'Cherche d’abord le signe (règle des signes), puis la distance à zéro.',
          correction: [`$${a * x} \\div ${par(a)} = ${x}$`],
        };
      },
    },
    {
      name: 'avec-zero',
      from: 2,
      make: (rng) => {
        const xs = Array.from({ length: 5 }, () => rng.nonZero(-9, 9));
        xs[rng.int(0, 4)] = 0;
        return {
          prompt: `Calcule $${xs.map(par).join(' \\times ')}$.`,
          answer: decimal(0),
          hint: 'Regarde bien tous les facteurs avant de calculer.',
          correction: ['Un des facteurs est nul : le produit vaut $0$.'],
        };
      },
    },
  ],
  '4e-quotient-relatifs': [
    {
      name: 'dividende-manquant',
      make: (rng) => {
        const b = rng.nonZero(-9, 9);
        const q = rng.nonZero(-9, 9);
        return {
          prompt: `Complète : $\\ldots \\div ${par(b)} = ${q}$.`,
          answer: decimal(b * q),
          hint: 'Le nombre cherché est le produit du diviseur par le quotient.',
          correction: [`$${par(b)} \\times ${par(q)} = ${b * q}$`],
        };
      },
    },
  ],
  '4e-signe-produit': [
    {
      name: 'nombre-negatifs',
      make: (rng) => {
        const n = rng.int(3, 9);
        const neg = rng.int(1, n);
        return {
          prompt: `Un produit de $${n}$ nombres non nuls contient exactement $${neg}$ facteur${neg > 1 ? 's' : ''} négatif${neg > 1 ? 's' : ''}. Quel est son signe ?`,
          answer: fixedChoice(['Positif', 'Négatif'], neg % 2 === 0 ? 0 : 1),
          hint: 'Un nombre pair de facteurs négatifs donne un produit positif.',
          correction: [`$${neg}$ est ${neg % 2 === 0 ? 'pair : le produit est positif' : 'impair : le produit est négatif'}.`],
        };
      },
    },
  ],
  '4e-priorites-relatifs': [
    {
      name: 'temperatures',
      make: (rng) => {
        const t0 = rng.int(-12, 5);
        const up = rng.int(3, 15);
        const down = rng.int(3, 18);
        const v = t0 + up - down;
        return {
          prompt: `Le matin, il fait $${t0}$ °C. La température monte de $${up}$ °C dans la journée, puis descend de $${down}$ °C la nuit. Quelle température fait-il la nuit, en °C ?`,
          answer: decimal(v),
          hint: 'Monter, c’est ajouter ; descendre, c’est soustraire.',
          correction: [`$${t0} + ${up} - ${down} = ${v}$ °C`],
        };
      },
    },
    {
      name: 'moins-devant-parenthese',
      from: 2,
      make: (rng) => {
        const [a, b, c, d] = [rng.int(-9, 9), rng.nonZero(-9, 9), rng.nonZero(-9, 9), rng.int(2, 5)];
        const v = a - (b - c) * d;
        return {
          prompt: `Calcule $${a} - (${b} - ${par(c)}) \\times ${d}$.`,
          answer: decimal(v),
          hint: 'Parenthèses d’abord, puis multiplication, puis soustraction.',
          correction: [`$${b} - ${par(c)} = ${b - c}$`, `$${par(b - c)} \\times ${d} = ${(b - c) * d}$`, `$${a} - ${par((b - c) * d)} = ${v}$`],
        };
      },
    },
  ],
  '4e-coefficient-semblables': [
    {
      name: 'perimetre',
      make: (rng) => {
        const k = rng.pick([2, 3, 1.5, 2.5, 0.5]);
        const [a, b, c] = [rng.int(3, 9), rng.int(3, 9), rng.int(3, 9)];
        const p = a + b + c;
        return {
          prompt: `Le triangle $DEF$ a des côtés de $${a}$, $${b}$ et $${c}$ cm. Le triangle $D'E'F'$, semblable, a des côtés ${k === 0.5 ? 'deux fois plus petits' : `$${dec(k)}$ fois plus grands`}. Quel est le périmètre de $D'E'F'$, en cm ?`,
          answer: decimal(p * k),
          hint: 'Toutes les longueurs, donc aussi le périmètre, sont multipliées par le même coefficient.',
          correction: [`Périmètre de $DEF$ : $${p}$ cm.`, `$${p} \\times ${dec(k)} = ${dec(p * k)}$ cm`],
        };
      },
    },
  ],
  '4e-translation': [
    {
      name: 'proprietes',
      make: vf(
        [
          ['Une translation conserve les longueurs.', true, 'La figure glisse sans se déformer.'],
          ['L’image d’une droite par une translation est une droite parallèle (ou confondue).', true, 'Une translation conserve la direction des droites.'],
          ['Une translation fait tourner la figure.', false, 'Elle la fait glisser, sans rotation.'],
          ['Une translation conserve les aires.', true, 'Longueurs et angles sont conservés, donc les aires aussi.'],
          ['Par une translation, un point peut être sa propre image.', false, 'Sauf la translation « nulle », chaque point bouge du même déplacement.'],
        ],
        'Une translation fait glisser toute la figure dans une même direction, d’une même longueur.',
      ),
    },
  ],
  '4e-symetrie-centrale': [
    {
      name: 'trouver-centre',
      make: (rng) => {
        const [ox, oy] = [rng.int(-5, 5), rng.int(-5, 5)];
        const [px, py] = [rng.int(-6, 6), rng.int(-6, 6)];
        const [qx, qy] = [2 * ox - px, 2 * oy - py];
        return {
          prompt: `$P'(${qx}\\,;\\,${qy})$ est l’image de $P(${px}\\,;\\,${py})$ par une symétrie centrale de centre $O$. Quelles sont les coordonnées de $O$ ?`,
          answer: pair(ox, oy, ['x', 'y']),
          hint: 'Le centre de symétrie est le milieu de $[PP\']$.',
          correction: [`$x_O = \\frac{${px} + ${par(qx)}}{2} = ${ox}$ et $y_O = \\frac{${py} + ${par(qy)}}{2} = ${oy}$`],
        };
      },
    },
  ],
  '4e-rotation': [
    {
      name: 'polygone-regulier',
      make: (rng) => {
        const n = rng.pick([3, 4, 5, 6, 8, 10, 12]);
        const names: Record<number, string> = { 3: 'triangle équilatéral', 4: 'carré', 5: 'pentagone régulier', 6: 'hexagone régulier', 8: 'octogone régulier', 10: 'décagone régulier', 12: 'dodécagone régulier' };
        return {
          prompt: `Quel est le plus petit angle (en degrés, non nul) d’une rotation de centre le centre d’un ${names[n]} qui le laisse globalement invariant ?`,
          answer: decimal(360 / n),
          hint: 'La rotation doit amener chaque sommet sur le sommet voisin.',
          correction: [`$360 \\div ${n} = ${dec(360 / n)}^\\circ$`],
        };
      },
    },
  ],
  '4e-reconnaitre-transformation': [
    {
      name: 'vrai-faux',
      make: vf(
        [
          ['Une symétrie centrale est une rotation de $180^\\circ$.', true, 'Faire un demi-tour autour du centre revient à prendre le symétrique.'],
          ['Une symétrie centrale conserve les longueurs.', true, 'C’est une isométrie.'],
          ['Une rotation conserve les angles.', true, 'C’est une isométrie.'],
          ['Par une rotation de centre $O$, le point $O$ change de place.', false, 'Le centre est le seul point fixe.'],
          ['Une symétrie centrale transforme une droite en une droite parallèle.', true, 'L’image d’une droite par une symétrie centrale lui est parallèle.'],
          ['Une rotation de $90^\\circ$ transforme une droite en une droite parallèle.', false, 'Elle la transforme en une droite perpendiculaire.'],
        ],
        'Translations, symétries et rotations conservent longueurs, angles et aires.',
      ),
    },
  ],
};

function deuxPrenomsDistincts(rng: Parameters<Variant['make']>[0]): [string, string] {
  const a = prenom(rng);
  let b = prenom(rng);
  while (b === a) b = prenom(rng);
  return [a, b];
}
