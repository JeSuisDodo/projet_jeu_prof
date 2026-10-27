import { dec, decimal, fixedChoice, fl, fraction, gcd, makeChoice, ouiNon, par, prenom, vraiFaux } from '../../college';
import { frac } from '../../fraction';
import type { Answer } from '../../types';
import type { Variant } from '../../variantes';

/** 5e : variantes propres au programme de 5e (d'autres sont reprises de la 3e et de la 4e, voir index.ts). */

const pair = (a: number, b: number, labels: [string, string]): Answer => ({ kind: 'pair', values: [frac(Math.round(a * 1e6), 1e6), frac(Math.round(b * 1e6), 1e6)], labels });
const deg = (v: number) => `${dec(v)}^\\circ`;
const fr = (n: number, d: number) => `\\frac{${n}}{${d}}`;
const vf = (items: [string, boolean, string][], hint: string): Variant['make'] => (rng) => {
  const [t, ok, why] = rng.pick(items);
  return { prompt: `Vrai ou faux ? ${t}`, answer: vraiFaux(ok), hint, correction: [`${ok ? 'Vrai' : 'Faux'}. ${why}`] };
};

export const NOUVELLES_5E: Record<string, Variant[]> = {
  '5e-somme-angles': [
    {
      name: 'double',
      from: 2,
      make: (rng) => {
        const b = rng.int(15, 50);
        const c = 180 - 3 * b;
        return {
          prompt: `Dans le triangle $ABC$, l’angle $\\widehat{A}$ est le double de l’angle $\\widehat{B}$, et $\\widehat{C} = ${deg(c)}$. Combien mesure $\\widehat{B}$, en degrés ?`,
          answer: decimal(b),
          hint: 'La somme des angles d’un triangle vaut $180^\\circ$ : $\\widehat{A} + \\widehat{B} = 180^\\circ - \\widehat{C}$, et $\\widehat{A} + \\widehat{B}$ vaut trois fois $\\widehat{B}$.',
          correction: [`$\\widehat{A} + \\widehat{B} = 180 - ${c} = ${180 - c}^\\circ$.`, `$3 \\times \\widehat{B} = ${180 - c}$, donc $\\widehat{B} = ${deg(b)}$ (et $\\widehat{A} = ${deg(2 * b)}$).`],
        };
      },
    },
    {
      name: 'vrai-faux',
      make: vf(
        [
          ['Un triangle peut avoir deux angles obtus.', false, 'Deux angles obtus dépassent déjà $180^\\circ$ à eux deux.'],
          ['Un triangle peut avoir deux angles droits.', false, 'Le troisième angle vaudrait $0^\\circ$.'],
          ['Dans un triangle rectangle, les deux angles aigus ont pour somme $90^\\circ$.', true, '$180^\\circ - 90^\\circ = 90^\\circ$.'],
          ['Un triangle peut avoir trois angles aigus.', true, 'Par exemple un triangle équilatéral : trois angles de $60^\\circ$.'],
          ['Un triangle peut avoir des angles de $50^\\circ$, $60^\\circ$ et $80^\\circ$.', false, '$50 + 60 + 80 = 190 \\neq 180$.'],
          ['Un triangle peut avoir des angles de $35^\\circ$, $55^\\circ$ et $90^\\circ$.', true, '$35 + 55 + 90 = 180$.'],
        ],
        'La somme des trois angles d’un triangle vaut toujours $180^\\circ$.',
      ),
    },
  ],
  '5e-angles-isocele': [
    {
      name: 'rectangle-isocele',
      make: (rng) => {
        const [A, B, C] = rng.pick([['A', 'B', 'C'], ['E', 'F', 'G'], ['R', 'S', 'T']]);
        return {
          prompt: `Le triangle $${A}${B}${C}$ est rectangle et isocèle en $${A}$. Combien mesure l’angle $\\widehat{${A}${B}${C}}$, en degrés ?`,
          answer: decimal(45),
          hint: 'Les deux angles à la base d’un triangle isocèle sont égaux, et ici l’angle au sommet est droit.',
          correction: [`$\\widehat{${B}} = \\widehat{${C}} = \\frac{180 - 90}{2} = 45^\\circ$`],
        };
      },
    },
  ],
  '5e-inegalite-triangulaire': [
    {
      name: 'aplati',
      make: (rng) => {
        const a = rng.int(2, 9);
        const b = rng.int(2, 9);
        const kind = rng.pick(['aplati', 'triangle', 'impossible'] as const);
        const c = kind === 'aplati' ? a + b : kind === 'triangle' ? a + b - rng.int(1, Math.min(a, b) - 1 || 1) : a + b + rng.int(1, 4);
        const ok = c < a + b ? 0 : c === a + b ? 1 : 2;
        return {
          prompt: `On place trois points $A$, $B$, $C$ avec $AB = ${a}$ cm, $BC = ${b}$ cm et $AC = ${c}$ cm. Que peut-on dire ?`,
          answer: fixedChoice(['On obtient un vrai triangle', 'Les trois points sont alignés (triangle aplati)', 'C’est impossible'], ok),
          hint: 'Compare le plus grand côté à la somme des deux autres.',
          correction: [`$AB + BC = ${a + b}$ et $AC = ${c}$.`, ok === 0 ? `$${c} < ${a + b}$ : c’est un triangle.` : ok === 1 ? `$${c} = ${a + b}$ : $B$ est sur le segment $[AC]$, le triangle est aplati.` : `$${c} > ${a + b}$ : impossible de placer les points.`],
        };
      },
    },
  ],
  '5e-nature-triangle': [
    {
      name: 'cotes',
      make: (rng) => {
        const kind = rng.pick(['equi', 'iso', 'quel'] as const);
        const a = rng.int(3, 9);
        const sides = kind === 'equi' ? [a, a, a] : kind === 'iso' ? rng.shuffle([a, a, a + rng.pick([-2, -1, 1, 2])]) : rng.shuffle([a, a + 1, a + 2]);
        return {
          prompt: `Un triangle a des côtés de $${sides[0]}$ cm, $${sides[1]}$ cm et $${sides[2]}$ cm. Quelle est sa nature ?`,
          answer: fixedChoice(['Équilatéral', 'Isocèle (non équilatéral)', 'Quelconque'], kind === 'equi' ? 0 : kind === 'iso' ? 1 : 2),
          hint: 'Compte combien de côtés ont la même longueur.',
          correction: [kind === 'equi' ? 'Trois côtés égaux : équilatéral.' : kind === 'iso' ? 'Exactement deux côtés égaux : isocèle.' : 'Trois longueurs différentes : quelconque.'],
        };
      },
    },
  ],
  '5e-longueur-possible': [
    {
      name: 'plus-grand-entier',
      make: (rng) => {
        const a = rng.int(2, 12);
        const b = rng.int(2, 12);
        return {
          prompt: `Deux côtés d’un triangle (non aplati) mesurent $${a}$ cm et $${b}$ cm. Quelle est la plus grande longueur entière, en cm, possible pour le troisième côté ?`,
          answer: decimal(a + b - 1),
          hint: 'Le troisième côté doit être strictement plus petit que la somme des deux autres.',
          correction: [`Il faut $c < ${a} + ${b} = ${a + b}$ : la plus grande valeur entière est $${a + b - 1}$ cm.`],
        };
      },
    },
  ],
  '5e-relatifs-comparer': [
    {
      name: 'entiers-entre',
      make: (rng) => {
        const a = rng.int(-15, 0);
        const b = rng.int(a + 2, 12);
        return {
          prompt: `Combien y a-t-il de nombres entiers strictement compris entre $${a}$ et $${b}$ ?`,
          answer: decimal(b - a - 1),
          hint: 'Écris-les sur une droite graduée, sans compter les deux bornes.',
          correction: [`De $${a + 1}$ à $${b - 1}$ : $${b - 1} - ${par(a + 1)} + 1 = ${b - a - 1}$ entiers.`],
        };
      },
    },
  ],
  '5e-relatifs-addition': [
    {
      name: 'terme-manquant',
      make: (rng) => {
        const a = rng.int(-12, 12);
        const x = rng.nonZero(-12, 12);
        return {
          prompt: `Complète : $${par(a)} + \\ldots = ${a + x}$.`,
          answer: decimal(x),
          hint: 'Cherche ce qu’il faut ajouter : c’est la différence entre le résultat et le premier terme.',
          correction: [`$${a + x} - ${par(a)} = ${x}$`],
        };
      },
    },
  ],
  '5e-relatifs-soustraction': [
    {
      name: 'ecart-altitudes',
      make: (rng) => {
        const low = -rng.int(10, 400);
        const high = rng.int(50, 4800);
        return {
          prompt: `Le point le plus bas d’une grotte est à l’altitude $${low}$ m et le sommet de la montagne voisine à $${high}$ m. Quel est le dénivelé entre les deux, en m ?`,
          answer: decimal(high - low),
          hint: 'Le dénivelé est la différence « altitude haute − altitude basse ».',
          correction: [`$${high} - ${par(low)} = ${high} + ${-low} = ${high - low}$ m`],
        };
      },
    },
  ],
  '5e-relatifs-somme': [
    {
      name: 'compte',
      make: (rng) => {
        const start = rng.int(-50, 100);
        const ops = Array.from({ length: 3 }, () => rng.nonZero(-80, 80));
        const v = ops.reduce((s, x) => s + x, start);
        return {
          prompt: `Le solde d’un compte est de $${start}$ €. On effectue trois opérations : ${ops.map((o) => (o > 0 ? `un dépôt de $${o}$ €` : `un retrait de $${-o}$ €`)).join(', ')}. Quel est le nouveau solde, en € ?`,
          answer: decimal(v),
          hint: 'Un dépôt s’ajoute, un retrait se soustrait.',
          correction: [`$${start} ${ops.map((o) => (o > 0 ? `+ ${o}` : `- ${-o}`)).join(' ')} = ${v}$ €`],
        };
      },
    },
  ],
  '5e-reperage': [
    {
      name: 'milieu',
      from: 2,
      make: (rng) => {
        const [mx, my] = [rng.int(-6, 6), rng.int(-6, 6)];
        const [dx, dy] = [rng.int(-5, 5), rng.int(-5, 5)];
        const A = [mx - dx, my - dy];
        const B = [mx + dx, my + dy];
        return {
          prompt: `Dans un repère, $A(${A[0]}\\,;\\,${A[1]})$ et $B(${B[0]}\\,;\\,${B[1]})$. Quelles sont les coordonnées du milieu $M$ de $[AB]$ ?`,
          answer: pair(mx, my, ['x', 'y']),
          hint: 'Chaque coordonnée du milieu est la moyenne des coordonnées des extrémités.',
          correction: [`$x_M = \\frac{${A[0]} + ${par(B[0])}}{2} = ${mx}$ et $y_M = \\frac{${A[1]} + ${par(B[1])}}{2} = ${my}$`],
        };
      },
    },
    {
      name: 'distance-horizontale',
      make: (rng) => {
        const y = rng.int(-5, 5);
        const xa = rng.int(-9, 3);
        const xb = rng.int(xa + 1, 10);
        return {
          prompt: `Dans un repère d’unité $1$ cm, $A(${xa}\\,;\\,${y})$ et $B(${xb}\\,;\\,${y})$. Quelle est la longueur $AB$, en cm ?`,
          answer: decimal(xb - xa),
          hint: 'Les deux points ont la même ordonnée : la distance est l’écart entre les abscisses.',
          correction: [`$AB = ${xb} - ${par(xa)} = ${xb - xa}$ cm`],
        };
      },
    },
  ],
  '5e-fraction-egale': [
    {
      name: 'vrai-faux',
      make: (rng) => {
        const a = rng.int(1, 6);
        const b = rng.int(a + 1, 9);
        const k = rng.int(2, 5);
        return vf(
          [
            [`$${fr(a, b)} = ${fr(a * k, b * k)}$`, true, `On multiplie le numérateur et le dénominateur par $${k}$.`],
            [`$${fr(a, b)} = ${fr(a + k, b + k)}$`, false, 'Ajouter le même nombre en haut et en bas change la fraction.'],
            [`$${fr(a * k, b * k)} = ${fr(a, b)}$`, true, `On divise en haut et en bas par $${k}$.`],
            [`$${fr(a, b)} = ${fr(a * k, b)}$`, false, 'Il faut multiplier le numérateur ET le dénominateur.'],
          ],
          'Une fraction ne change pas quand on multiplie (ou divise) son numérateur et son dénominateur par un même nombre non nul.',
        )(rng, 1);
      },
    },
  ],
  '5e-fraction-simplifier': [
    {
      name: 'simplifiable',
      make: (rng) => {
        const yes = rng.next() < 0.5;
        let n: number;
        let d: number;
        do {
          n = rng.int(2, 40);
          d = rng.int(n + 1, 60);
        } while ((gcd(n, d) > 1) !== yes);
        return {
          prompt: `Peut-on simplifier la fraction $${fr(n, d)}$ ?`,
          answer: ouiNon(yes),
          hint: 'Cherche un diviseur commun (autre que $1$) au numérateur et au dénominateur.',
          correction: [yes ? `$${n}$ et $${d}$ sont divisibles par $${gcd(n, d)}$ : $${fr(n, d)} = ${fl(n, d)}$.` : `$${n}$ et $${d}$ n’ont pas d’autre diviseur commun que $1$ : on ne peut pas simplifier.`],
        };
      },
    },
  ],
  '5e-quotient': [
    {
      name: 'partage',
      make: (rng) => {
        const p = rng.int(2, 9);
        let n: number;
        do n = rng.int(2, 9);
        while (n === p || p % n === 0);
        return {
          prompt: `On partage équitablement $${p}$ pizzas entre $${n}$ amis. Quelle part de pizza reçoit chacun ? (donne une fraction)`,
          answer: fraction(p, n),
          hint: 'Partager $a$ en $b$ parts égales donne $\\frac{a}{b}$.',
          correction: [`Chacun reçoit $${p} \\div ${n} = ${fl(p, n)}$ pizza.`],
        };
      },
    },
  ],
  '5e-substituer': [
    {
      name: 'formule',
      make: (rng) => {
        const L = rng.int(3, 20);
        const l = rng.int(1, L - 1);
        const kind = rng.pick(['P', 'A'] as const);
        return {
          prompt: kind === 'P' ? `Le périmètre d’un rectangle est donné par $P = 2 \\times (L + \\ell)$. Calcule $P$ pour $L = ${L}$ cm et $\\ell = ${l}$ cm.` : `L’aire d’un rectangle est donnée par $A = L \\times \\ell$. Calcule $A$ pour $L = ${L}$ cm et $\\ell = ${l}$ cm.`,
          answer: decimal(kind === 'P' ? 2 * (L + l) : L * l),
          hint: 'Remplace chaque lettre par sa valeur.',
          correction: [kind === 'P' ? `$P = 2 \\times (${L} + ${l}) = ${2 * (L + l)}$ cm` : `$A = ${L} \\times ${l} = ${L * l}$ cm²`],
        };
      },
    },
  ],
  '5e-developper': [
    {
      name: 'aire-decoupee',
      make: (rng) => {
        const k = rng.int(2, 9);
        const a = rng.int(1, 9);
        return {
          prompt: `Un rectangle a pour largeur $${k}$ et pour longueur $x + ${a}$. Son aire s’écrit $px + q$ : donne $p$ et $q$.`,
          answer: pair(k, k * a, ['p', 'q']),
          hint: 'L’aire vaut $' + k + '(x + ' + a + ')$ : développe.',
          correction: [`$${k}(x + ${a}) = ${k}x + ${k * a}$`],
        };
      },
    },
  ],
  '5e-factoriser': [
    {
      name: 'nombre-manquant',
      make: (rng) => {
        const k = rng.int(2, 9);
        const b = rng.int(1, 9);
        return {
          prompt: `Complète : $${k}x + ${k * b} = ${k}(x + \\ldots)$.`,
          answer: decimal(b),
          hint: `Divise le nombre $${k * b}$ par le facteur commun $${k}$.`,
          correction: [`$${k * b} = ${k} \\times ${b}$, donc $${k}x + ${k * b} = ${k}(x + ${b})$.`],
        };
      },
    },
  ],
  '5e-complementaire-supplementaire': [
    {
      name: 'egaux',
      make: (rng) => {
        const supp = rng.next() < 0.5;
        return {
          prompt: `Deux angles égaux sont ${supp ? 'supplémentaires' : 'complémentaires'}. Combien mesure chacun, en degrés ?`,
          answer: decimal(supp ? 90 : 45),
          hint: supp ? 'Deux angles supplémentaires ont pour somme $180^\\circ$.' : 'Deux angles complémentaires ont pour somme $90^\\circ$.',
          correction: [supp ? '$180 \\div 2 = 90^\\circ$' : '$90 \\div 2 = 45^\\circ$'],
        };
      },
    },
    {
      name: 'multiple',
      from: 2,
      make: (rng) => {
        const k = rng.pick([2, 3, 4, 5]);
        const supp = rng.next() < 0.5;
        const total = supp ? 180 : 90;
        return {
          prompt: `Un angle et son ${supp ? 'supplémentaire' : 'complémentaire'} : le second mesure $${k}$ fois le premier. Combien mesure le premier, en degrés ?`,
          answer: decimal(total / (k + 1)),
          hint: `Le premier plus $${k}$ fois le premier font $${total}^\\circ$.`,
          correction: [`$${k + 1} \\times x = ${total}$, donc $x = ${dec(total / (k + 1))}^\\circ$.`],
        };
      },
    },
  ],
  '5e-angles-opposes': [
    {
      name: 'vrai-faux',
      make: vf(
        [
          ['Deux angles opposés par le sommet ont la même mesure.', true, 'C’est une propriété des angles opposés par le sommet.'],
          ['Deux angles adjacents ont toujours la même mesure.', false, 'Adjacents signifie seulement qu’ils ont un côté commun et le même sommet.'],
          ['Deux droites sécantes forment quatre angles dont la somme vaut $360^\\circ$.', true, 'Ils font le tour complet du point d’intersection.'],
          ['Si deux droites sécantes forment un angle de $40^\\circ$, elles forment aussi un angle de $140^\\circ$.', true, '$180 - 40 = 140$ : l’angle voisin est supplémentaire.'],
          ['Deux angles opposés par le sommet sont toujours supplémentaires.', false, 'Ils sont égaux ; ils ne sont supplémentaires que s’ils sont droits.'],
        ],
        'Deux droites sécantes forment deux paires d’angles opposés par le sommet, égaux deux à deux.',
      ),
    },
  ],
  '5e-angles-paralleles': [
    {
      name: 'vrai-faux',
      make: vf(
        [
          ['Si deux droites parallèles sont coupées par une sécante, deux angles alternes-internes sont égaux.', true, 'C’est la propriété des angles alternes-internes.'],
          ['Si deux droites parallèles sont coupées par une sécante, deux angles correspondants sont égaux.', true, 'C’est la propriété des angles correspondants.'],
          ['Deux angles alternes-internes sont toujours égaux, même si les droites ne sont pas parallèles.', false, 'L’égalité n’est vraie que si les droites sont parallèles.'],
          ['Deux angles correspondants sont du même côté de la sécante.', true, 'Ils occupent la même position à chaque intersection.'],
          ['Deux angles alternes-internes sont du même côté de la sécante.', false, 'Ils sont de part et d’autre de la sécante, entre les deux droites.'],
        ],
        'Alternes-internes : de part et d’autre de la sécante, entre les droites. Correspondants : même position à chaque intersection.',
      ),
    },
  ],
  '5e-aire-triangle': [
    {
      name: 'hauteur',
      from: 2,
      make: (rng) => {
        const b = rng.int(2, 15);
        const h = rng.int(2, 15);
        return {
          prompt: `Un triangle a une aire de $${dec((b * h) / 2)}$ cm² et une base de $${b}$ cm. Quelle est la hauteur relative à cette base, en cm ?`,
          answer: decimal(h),
          hint: '$A = \\frac{b \\times h}{2}$, donc $h = \\frac{2A}{b}$.',
          correction: [`$h = \\frac{2 \\times ${dec((b * h) / 2)}}{${b}} = \\frac{${b * h}}{${b}} = ${h}$ cm`],
        };
      },
    },
  ],
  '5e-aire-parallelogramme': [
    {
      name: 'base',
      from: 2,
      make: (rng) => {
        const b = rng.int(2, 15);
        const h = rng.int(2, 12);
        return {
          prompt: `Un parallélogramme a une aire de $${b * h}$ cm² et une hauteur de $${h}$ cm. Quelle est la longueur de la base correspondante, en cm ?`,
          answer: decimal(b),
          hint: '$A = b \\times h$, donc $b = \\frac{A}{h}$.',
          correction: [`$b = \\frac{${b * h}}{${h}} = ${b}$ cm`],
        };
      },
    },
  ],
  '5e-perimetre-cercle': [
    {
      name: 'rayon',
      make: (rng) => {
        const r = rng.int(1, 20);
        return {
          prompt: `Un cercle a une longueur de $${2 * r}\\pi$ cm. Quel est son rayon, en cm ?`,
          answer: decimal(r),
          hint: '$L = 2\\pi r$',
          correction: [`$2\\pi r = ${2 * r}\\pi$, donc $r = ${r}$ cm.`],
        };
      },
    },
    {
      name: 'tours-de-roue',
      from: 2,
      make: (rng) => {
        const d = rng.pick([50, 60, 70]);
        const n = rng.int(10, 100);
        const L = (n * d * 3.14) / 100;
        return {
          prompt: `Une roue de vélo a un diamètre de $${d}$ cm. Quelle distance, en m, parcourt le vélo quand la roue fait $${n}$ tours ? (avec $\\pi \\approx 3{,}14$)`,
          answer: decimal(L),
          hint: 'À chaque tour, le vélo avance de la longueur du cercle : $\\pi \\times d$.',
          correction: [`Un tour : $3{,}14 \\times ${d} = ${dec(3.14 * d)}$ cm.`, `$${n}$ tours : $${dec(n * 3.14 * d)}$ cm $= ${dec(L)}$ m`],
        };
      },
    },
  ],
  '5e-aire-disque': [
    {
      name: 'demi-disque',
      make: (rng) => {
        const r = rng.int(1, 10);
        return {
          prompt: `Quelle est l’aire d’un demi-disque de rayon $${r}$ cm ? Elle s’écrit $k\\pi$ cm² : donne $k$${(r * r) % 2 ? ' (en écriture décimale)' : ''}.`,
          answer: decimal((r * r) / 2),
          hint: 'Aire du disque : $\\pi r^2$ ; on en prend la moitié.',
          correction: [`$\\frac{\\pi \\times ${r}^2}{2} = ${dec((r * r) / 2)}\\pi$ cm²`],
        };
      },
    },
  ],
  '5e-conversion-aires': [
    {
      name: 'hectares',
      make: (rng) => {
        const up = rng.next() < 0.5;
        const v = up ? rng.int(1, 30) / rng.pick([1, 2, 10]) : rng.int(1, 90) * 1000;
        return {
          prompt: up ? `Un champ mesure $${dec(v)}$ ha. Quelle est son aire en m² ? ($1$ ha $= 10\\,000$ m²)` : `Un parc mesure $${v}$ m². Quelle est son aire en hectares ? ($1$ ha $= 10\\,000$ m²)`,
          answer: decimal(up ? v * 10000 : v / 10000),
          hint: '$1$ ha est l’aire d’un carré de $100$ m de côté.',
          correction: [up ? `$${dec(v)} \\times 10\\,000 = ${dec(v * 10000)}$ m²` : `$${v} \\div 10\\,000 = ${dec(v / 10000)}$ ha`],
        };
      },
    },
  ],
  '5e-aire-composee': [
    {
      name: 'cadre',
      make: (rng) => {
        const L = rng.int(10, 30);
        const l = rng.int(8, L);
        const e = rng.int(1, 3);
        const inner = (L - 2 * e) * (l - 2 * e);
        return {
          prompt: `Un cadre photo rectangulaire mesure $${L}$ cm sur $${l}$ cm. Sa bordure a partout une largeur de $${e}$ cm. Quelle est l’aire de la bordure, en cm² ?`,
          answer: decimal(L * l - inner),
          hint: 'Aire du grand rectangle moins aire de la photo (le rectangle intérieur).',
          correction: [`Photo : $(${L} - ${2 * e}) \\times (${l} - ${2 * e}) = ${L - 2 * e} \\times ${l - 2 * e} = ${inner}$ cm².`, `Bordure : $${L * l} - ${inner} = ${L * l - inner}$ cm²`],
        };
      },
    },
  ],
  '5e-volume-pave': [
    {
      name: 'arete-cube',
      from: 2,
      make: (rng) => {
        const a = rng.int(2, 10);
        return {
          prompt: `Un cube a un volume de $${a ** 3}$ cm³. Quelle est la longueur de son arête, en cm ?`,
          answer: decimal(a),
          hint: 'Cherche le nombre qui, multiplié trois fois par lui-même, donne le volume.',
          correction: [`$${a} \\times ${a} \\times ${a} = ${a ** 3}$ : l’arête mesure $${a}$ cm.`],
        };
      },
    },
    {
      name: 'hauteur',
      make: (rng) => {
        const [L, l, h] = [rng.int(2, 12), rng.int(2, 10), rng.int(2, 10)];
        return {
          prompt: `Un pavé droit a un volume de $${L * l * h}$ cm³, une longueur de $${L}$ cm et une largeur de $${l}$ cm. Quelle est sa hauteur, en cm ?`,
          answer: decimal(h),
          hint: '$V = L \\times \\ell \\times h$ : divise le volume par l’aire de la base.',
          correction: [`Base : $${L} \\times ${l} = ${L * l}$ cm².`, `$h = ${L * l * h} \\div ${L * l} = ${h}$ cm`],
        };
      },
    },
  ],
  '5e-volume-prisme': [
    {
      name: 'hauteur',
      from: 2,
      make: (rng) => {
        const B = rng.int(4, 30);
        const h = rng.int(2, 12);
        return {
          prompt: `Un prisme droit a un volume de $${B * h}$ cm³ et une base d’aire $${B}$ cm². Quelle est sa hauteur, en cm ?`,
          answer: decimal(h),
          hint: '$V = \\text{aire de la base} \\times h$',
          correction: [`$h = ${B * h} \\div ${B} = ${h}$ cm`],
        };
      },
    },
  ],
  '5e-volume-cylindre': [
    {
      name: 'en-pi',
      make: (rng) => {
        const r = rng.int(1, 6);
        const h = rng.int(1, 12);
        return {
          prompt: `Un cylindre a un rayon de $${r}$ cm et une hauteur de $${h}$ cm. Son volume s’écrit $k\\pi$ cm³ : donne $k$.`,
          answer: decimal(r * r * h),
          hint: '$V = \\pi r^2 h$',
          correction: [`$V = \\pi \\times ${r}^2 \\times ${h} = ${r * r * h}\\pi$ cm³`],
        };
      },
    },
  ],
  '5e-division-euclidienne': [
    {
      name: 'dividende',
      make: (rng) => {
        const b = rng.int(2, 12);
        const q = rng.int(2, 30);
        const r = rng.int(0, b - 1);
        return {
          prompt: `Dans une division euclidienne, le diviseur est $${b}$, le quotient $${q}$ et le reste $${r}$. Quel est le dividende ?`,
          answer: decimal(b * q + r),
          hint: 'Dividende $=$ diviseur $\\times$ quotient $+$ reste.',
          correction: [`$${b} \\times ${q} + ${r} = ${b * q + r}$`],
        };
      },
    },
    {
      name: 'calendrier',
      from: 2,
      make: (rng) => {
        const days = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
        const d0 = rng.int(0, 6);
        const n = rng.int(10, 200);
        const d = (d0 + n) % 7;
        return {
          prompt: `Aujourd’hui, nous sommes ${days[d0]}. Quel jour serons-nous dans $${n}$ jours ?`,
          answer: makeChoice(rng, days[d], days.filter((x) => x !== days[d]), () => days[0]),
          hint: 'Toutes les semaines ($7$ jours), on retombe sur le même jour : regarde le reste de la division par $7$.',
          correction: [`$${n} = 7 \\times ${Math.floor(n / 7)} + ${n % 7}$ : on avance de $${n % 7}$ jour${n % 7 > 1 ? 's' : ''} à partir de ${days[d0]}, soit ${days[d]}.`],
        };
      },
    },
  ],
  '5e-priorites': [
    {
      name: 'erreur-classique',
      make: (rng) => {
        const [a, b, c] = [rng.int(2, 9), rng.int(2, 9), rng.int(2, 9)];
        const good = a + b * c;
        return {
          prompt: `${prenom(rng)} calcule $${a} + ${b} \\times ${c}$ et trouve $${(a + b) * c}$. Quel est le bon résultat ?`,
          answer: decimal(good),
          hint: 'La multiplication est prioritaire sur l’addition.',
          correction: [`$${a} + ${b} \\times ${c} = ${a} + ${b * c} = ${good}$ (et non $${(a + b) * c}$).`],
        };
      },
    },
  ],
  '5e-trait-fraction': [
    {
      name: 'moyenne-deux',
      make: (rng) => {
        const a = rng.int(2, 20);
        const b = rng.int(2, 20);
        return {
          prompt: `Calcule $\\dfrac{${a} + ${b}}{2}$.`,
          answer: decimal((a + b) / 2),
          hint: 'Le trait de fraction agit comme des parenthèses : calcule d’abord le numérateur.',
          correction: [`$\\dfrac{${a + b}}{2} = ${dec((a + b) / 2)}$`],
        };
      },
    },
  ],
  '5e-calcul-astucieux': [
    {
      name: 'regrouper',
      make: (rng) => {
        const [p, q] = rng.pick([[25, 4], [50, 2], [20, 5], [125, 8], [4, 25]]);
        const x = rng.int(3, 99);
        return {
          prompt: `Calcule astucieusement $${p} \\times ${x} \\times ${q}$.`,
          answer: decimal(p * q * x),
          hint: `Commence par $${p} \\times ${q}$.`,
          correction: [`$${p} \\times ${q} = ${p * q}$, puis $${p * q} \\times ${x} = ${p * q * x}$.`],
        };
      },
    },
    {
      name: 'presque-cent',
      from: 2,
      make: (rng) => {
        const m = rng.pick([99, 101, 98, 102, 999]);
        const x = rng.int(3, 45);
        const base = m > 500 ? 1000 : 100;
        return {
          prompt: `Calcule astucieusement $${m} \\times ${x}$.`,
          answer: decimal(m * x),
          hint: `$${m} = ${base} ${m < base ? '-' : '+'} ${Math.abs(base - m)}$ : utilise la distributivité.`,
          correction: [`$${m} \\times ${x} = ${base} \\times ${x} ${m < base ? '-' : '+'} ${Math.abs(base - m)} \\times ${x} = ${base * x} ${m < base ? '-' : '+'} ${Math.abs(base - m) * x} = ${m * x}$`],
        };
      },
    },
  ],
  '5e-centre-symetrie': [
    {
      name: 'lettres',
      make: (rng) => {
        const yes = ['H', 'I', 'N', 'O', 'S', 'X', 'Z'];
        const no = ['A', 'B', 'C', 'E', 'K', 'L', 'T', 'V', 'W', 'Y', 'D', 'M'];
        const letter = rng.next() < 0.5 ? rng.pick(yes) : rng.pick(no);
        const ok = yes.includes(letter);
        return {
          prompt: `La lettre majuscule « ${letter} » (écrite en capitale d’imprimerie simple) a-t-elle un centre de symétrie ?`,
          answer: ouiNon(ok),
          hint: 'Fais tourner la lettre d’un demi-tour : retrouve-t-on la même lettre ?',
          correction: [ok ? `Oui : après un demi-tour, « ${letter} » est inchangée.` : `Non : après un demi-tour, « ${letter} » ne se superpose pas à elle-même.`],
        };
      },
    },
  ],
  '5e-proprietes-symetrie': [
    {
      name: 'vrai-faux',
      make: vf(
        [
          ['La symétrie centrale conserve les longueurs.', true, 'Le symétrique d’un segment a la même longueur.'],
          ['Le symétrique d’une droite par une symétrie centrale est une droite parallèle.', true, 'Une droite et son image par une symétrie centrale sont parallèles.'],
          ['La symétrie centrale change la mesure des angles.', false, 'Elle conserve les angles.'],
          ['Le centre de symétrie est le milieu du segment qui joint un point à son symétrique.', true, 'C’est la définition du symétrique par rapport à un point.'],
          ['La symétrie centrale conserve les aires.', true, 'Elle conserve longueurs et angles, donc les aires.'],
          ['Par une symétrie centrale, un cercle a pour image un cercle de rayon double.', false, 'L’image est un cercle de même rayon.'],
        ],
        'La symétrie centrale est un demi-tour : elle conserve longueurs, angles et aires.',
      ),
    },
  ],
  '5e-parallelogramme-angles': [
    {
      name: 'somme',
      make: (rng) => {
        const x = rng.int(30, 150);
        return {
          prompt: `Dans un parallélogramme, un angle mesure $${deg(x)}$. Quelle est la somme des quatre angles, en degrés ?`,
          answer: decimal(360),
          hint: 'Un quadrilatère se découpe en deux triangles.',
          correction: ['La somme des angles d’un quadrilatère vaut $2 \\times 180 = 360^\\circ$, quelle que soit la mesure donnée.'],
        };
      },
    },
  ],
  '5e-parallelogramme-cotes': [
    {
      name: 'losange',
      make: (rng) => {
        const p = rng.int(3, 25) * 4;
        return {
          prompt: `Un losange a un périmètre de $${p}$ cm. Combien mesure chacun de ses côtés, en cm ?`,
          answer: decimal(p / 4),
          hint: 'Les quatre côtés d’un losange ont la même longueur.',
          correction: [`$${p} \\div 4 = ${p / 4}$ cm`],
        };
      },
    },
  ],
  '5e-parallelogrammes-particuliers': [
    {
      name: 'vrai-faux',
      make: vf(
        [
          ['Un carré est un losange.', true, 'Ses quatre côtés sont égaux.'],
          ['Un losange est un carré.', false, 'Un losange n’a pas forcément d’angle droit.'],
          ['Un rectangle a des diagonales de même longueur.', true, 'C’est une propriété du rectangle.'],
          ['Les diagonales d’un losange sont perpendiculaires.', true, 'C’est une propriété du losange.'],
          ['Les diagonales d’un parallélogramme quelconque sont perpendiculaires.', false, 'Seulement si c’est un losange.'],
          ['Un carré est un rectangle.', true, 'Il a quatre angles droits.'],
          ['Un parallélogramme qui a un angle droit est un rectangle.', true, 'Ses angles consécutifs sont supplémentaires : tous valent $90^\\circ$.'],
        ],
        'Rectangle : angles droits, diagonales égales. Losange : côtés égaux, diagonales perpendiculaires. Carré : les deux.',
      ),
    },
  ],
};
