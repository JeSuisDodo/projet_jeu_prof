import { dec, decimal, fixedChoice, fraction, makeChoice, ouiNon, prenom, vraiFaux } from '../../college';
import { frac } from '../../fraction';
import type { Answer } from '../../types';
import type { Variant } from '../../variantes';

/** 6e : variantes propres au programme de 6e (d'autres sont reprises des classes suivantes, voir index.ts). */

const pair = (a: number, b: number, labels: [string, string]): Answer => ({ kind: 'pair', values: [frac(Math.round(a * 1e6), 1e6), frac(Math.round(b * 1e6), 1e6)], labels });
const deg = (v: number) => `${dec(v)}^\\circ`;
const fr = (n: number, d: number) => `\\frac{${n}}{${d}}`;
const hm = (t: number) => `${Math.floor(t / 60) % 24}\\text{ h }${String(t % 60).padStart(2, '0')}`;
const vf = (items: [string, boolean, string][], hint: string): Variant['make'] => (rng) => {
  const [t, ok, why] = rng.pick(items);
  return { prompt: `Vrai ou faux ? ${t}`, answer: vraiFaux(ok), hint, correction: [`${ok ? 'Vrai' : 'Faux'}. ${why}`] };
};

export const NOUVELLES_6E: Record<string, Variant[]> = {
  '6e-nature-angle': [
    {
      name: 'vrai-faux',
      make: vf(
        [
          ['Un angle obtus mesure plus de $90^\\circ$ et moins de $180^\\circ$.', true, 'C’est la définition d’un angle obtus.'],
          ['Un angle de $90^\\circ$ est aigu.', false, 'Il est droit ; un angle aigu mesure moins de $90^\\circ$.'],
          ['Un angle plat mesure $180^\\circ$.', true, 'Ses deux côtés forment une droite.'],
          ['Un angle de $95^\\circ$ est aigu.', false, '$95 > 90$ : il est obtus.'],
          ['Un angle aigu mesure entre $0^\\circ$ et $90^\\circ$.', true, 'C’est la définition d’un angle aigu.'],
          ['Deux angles droits forment ensemble un angle plat.', true, '$90 + 90 = 180$.'],
        ],
        'Aigu : moins de $90^\\circ$ ; droit : $90^\\circ$ ; obtus : entre $90^\\circ$ et $180^\\circ$ ; plat : $180^\\circ$.',
      ),
    },
  ],
  '6e-angles-adjacents': [
    {
      name: 'droit-partage',
      from: 2,
      make: (rng) => {
        const k = rng.pick([2, 4, 5, 8, 9]);
        const small = 90 / (k + 1);
        return {
          prompt: `Un angle droit est partagé en deux angles adjacents ; l’un est $${k}$ fois plus grand que l’autre. Combien mesure le plus petit, en degrés ?`,
          answer: decimal(small),
          hint: `Le petit angle et $${k}$ fois le petit angle font $90^\\circ$ : cela fait $${k + 1}$ petits angles.`,
          correction: [`$90 \\div ${k + 1} = ${deg(small)}$ (et le grand mesure $${deg(k * small)}$).`],
        };
      },
    },
  ],
  '6e-fraction-tour': [
    {
      name: 'vers-fraction',
      make: (rng) => {
        const [n, d] = rng.pick([[1, 4], [1, 2], [3, 4], [1, 3], [1, 6], [1, 8], [2, 3], [1, 12]]);
        return {
          prompt: `Un angle mesure $${deg((360 * n) / d)}$. Quelle fraction de tour représente-t-il ?`,
          answer: fraction(n, d),
          hint: 'Un tour complet mesure $360^\\circ$ : divise la mesure par $360$.',
          correction: [`$\\frac{${(360 * n) / d}}{360} = ${fr(n, d)}$ de tour`],
        };
      },
    },
  ],
  '6e-bissectrice': [
    {
      name: 'angle-entier',
      make: (rng) => {
        const half = rng.int(10, 85);
        return {
          prompt: `La bissectrice de l’angle $\\widehat{xOy}$ le partage en deux angles de $${deg(half)}$. Combien mesure $\\widehat{xOy}$, en degrés ?`,
          answer: decimal(2 * half),
          hint: 'La bissectrice partage un angle en deux angles égaux.',
          correction: [`$\\widehat{xOy} = 2 \\times ${half} = ${deg(2 * half)}$`],
        };
      },
    },
  ],
  '6e-multiples': [
    {
      name: 'compter',
      make: (rng, level) => {
        const k = rng.int(2, level === 1 ? 5 : 12);
        const n = rng.int(20, level === 1 ? 50 : 150);
        return {
          prompt: `Combien y a-t-il de multiples de $${k}$ compris entre $1$ et $${n}$ ?`,
          answer: decimal(Math.floor(n / k)),
          hint: `Les multiples de $${k}$ sont $${k}$, $${2 * k}$, $${3 * k}$… : combien de fois $${k}$ « va-t-il » dans $${n}$ ?`,
          correction: [`$${n} = ${k} \\times ${Math.floor(n / k)} + ${n % k}$ : il y a $${Math.floor(n / k)}$ multiples.`],
        };
      },
    },
  ],
  '6e-division-decimale': [
    {
      name: 'partage-argent',
      make: (rng) => {
        const n = rng.pick([2, 4, 5, 8]);
        const part = rng.int(20, 400) / 4;
        return {
          prompt: `${n} amis se partagent équitablement $${dec(part * n)}$ €. Combien reçoit chacun, en € ?`,
          answer: decimal(part),
          hint: `Divise la somme par $${n}$.`,
          correction: [`$${dec(part * n)} \\div ${n} = ${dec(part)}$ €`],
        };
      },
    },
  ],
  '6e-quotient-approche': [
    {
      name: 'bus',
      make: (rng) => {
        const c = rng.pick([30, 45, 50, 55, 60]);
        let n: number;
        do n = rng.int(c + 1, 6 * c);
        while (n % c === 0);
        return {
          prompt: `$${n}$ élèves partent en sortie. Chaque car a $${c}$ places. Combien de cars faut-il au minimum ?`,
          answer: decimal(Math.ceil(n / c)),
          hint: 'Il faut assez de cars pour tout le monde : on arrondit le quotient à l’unité supérieure.',
          correction: [`$${n} \\div ${c} \\approx ${dec(Math.round((n / c) * 100) / 100)}$ : $${Math.floor(n / c)}$ cars ne suffisent pas, il en faut $${Math.ceil(n / c)}$.`],
        };
      },
    },
  ],
  '6e-probleme-division': [
    {
      name: 'reste',
      make: (rng) => {
        const b = rng.pick([6, 8, 10, 12, 24]);
        const n = rng.int(b + 1, 20 * b);
        const who = prenom(rng);
        return {
          prompt: `${who} range $${n}$ biscuits dans des paquets de $${b}$. Combien de biscuits restera-t-il hors des paquets complets ?`,
          answer: decimal(n % b),
          hint: 'C’est le reste de la division euclidienne.',
          correction: [`$${n} = ${b} \\times ${Math.floor(n / b)} + ${n % b}$ : il reste $${n % b}$ biscuit${n % b > 1 ? 's' : ''}.`],
        };
      },
    },
  ],
  '6e-diagramme-circulaire': [
    {
      name: 'angle',
      make: (rng) => {
        const total = rng.pick([20, 24, 30, 36, 40, 60]);
        let e: number;
        do e = rng.int(1, total - 1);
        while (((360 * e) / total) % 1 !== 0);
        return {
          prompt: `Sur $${total}$ élèves, $${e}$ viennent à pied. Dans un diagramme circulaire, quel angle doit avoir le secteur « à pied », en degrés ?`,
          answer: decimal((360 * e) / total),
          hint: 'Le disque entier ($360^\\circ$) représente tous les élèves : l’angle est proportionnel à l’effectif.',
          correction: [`Un élève correspond à $360 \\div ${total} = ${dec(360 / total)}^\\circ$.`, `$${e} \\times ${dec(360 / total)} = ${deg((360 * e) / total)}$`],
        };
      },
    },
  ],
  '6e-milieu': [
    {
      name: 'longueur-totale',
      make: (rng) => {
        const half = rng.int(2, 60) / (rng.next() < 0.5 ? 1 : 2);
        return {
          prompt: `$I$ est le milieu du segment $[AB]$ et $IB = ${dec(half)}$ cm. Combien mesure $AB$, en cm ?`,
          answer: decimal(2 * half),
          hint: 'Le milieu partage le segment en deux segments de même longueur.',
          correction: [`$AB = 2 \\times ${dec(half)} = ${dec(2 * half)}$ cm`],
        };
      },
    },
  ],
  '6e-vocabulaire-cercle': [
    {
      name: 'vrai-faux',
      make: vf(
        [
          ['Le diamètre d’un cercle mesure le double de son rayon.', true, '$d = 2r$.'],
          ['Une corde passe toujours par le centre du cercle.', false, 'Seule une corde particulière, le diamètre, passe par le centre.'],
          ['Tous les points d’un cercle sont à la même distance du centre.', true, 'C’est la définition du cercle.'],
          ['Un diamètre est une corde.', true, 'C’est une corde qui passe par le centre.'],
          ['Le rayon est la plus longue corde du cercle.', false, 'La plus longue corde est le diamètre.'],
        ],
        'Rayon : du centre à un point du cercle. Corde : entre deux points du cercle. Diamètre : corde passant par le centre.',
      ),
    },
  ],
  '6e-convertir-duree': [
    {
      name: 'secondes',
      make: (rng) => {
        const total = rng.int(61, 1000);
        return {
          prompt: `Convertis $${total}$ s en minutes et secondes.`,
          answer: pair(Math.floor(total / 60), total % 60, ['min', 's']),
          hint: '$1$ min $= 60$ s : divise par $60$.',
          correction: [`$${total} = 60 \\times ${Math.floor(total / 60)} + ${total % 60}$ : $${Math.floor(total / 60)}$ min $${total % 60}$ s.`],
        };
      },
    },
  ],
  '6e-calcul-duree': [
    {
      name: 'nuit',
      from: 2,
      make: (rng) => {
        const start = rng.int(20, 23) * 60 + rng.pick([0, 15, 20, 30, 45, 50]);
        const end = rng.int(0, 8) * 60 + rng.pick([0, 10, 15, 30, 40, 45]);
        const d = 24 * 60 - start + end;
        return {
          prompt: `${prenom(rng)} se couche à $${hm(start)}$ et se lève à $${hm(end)}$ le lendemain. Combien de temps dort-on ainsi ? Donne les heures et les minutes.`,
          answer: pair(Math.floor(d / 60), d % 60, ['h', 'min']),
          hint: 'Calcule le temps jusqu’à minuit, puis ajoute le temps après minuit.',
          correction: [`Jusqu’à minuit : $${hm(24 * 60 - start).replace(/^0\\text\{ h \}/, '0\\text{ h }')}$ ; après minuit : $${hm(end)}$.`, `Total : $${Math.floor(d / 60)}$ h $${d % 60}$ min.`],
        };
      },
    },
  ],
  '6e-heure-arrivee': [
    {
      name: 'heure-depart',
      make: (rng) => {
        const end = rng.int(9, 20) * 60 + rng.pick([0, 5, 10, 20, 30, 45, 50]);
        const length = rng.int(20, 200);
        const start = end - length;
        return {
          prompt: `Un bus arrive à $${hm(end)}$ après un trajet de $${length}$ min. À quelle heure est-il parti ? Donne les heures et les minutes.`,
          answer: pair(Math.floor(start / 60), start % 60, ['h', 'min']),
          hint: 'Retire la durée du trajet à l’heure d’arrivée.',
          correction: [`$${length}$ min $= ${Math.floor(length / 60)}$ h $${length % 60}$ min.`, `Départ : $${hm(start)}$.`],
        };
      },
    },
  ],
  '6e-duree-decimale': [
    {
      name: 'vers-heures-minutes',
      make: (rng) => {
        const q = rng.pick([0.25, 0.5, 0.75, 0.1, 0.2, 0.4]);
        const h = rng.int(0, 5) + q;
        return {
          prompt: `Écris $${dec(h)}$ h en heures et minutes.`,
          answer: pair(Math.floor(h), Math.round((h % 1) * 60), ['h', 'min']),
          hint: '$0{,}1$ h $= 6$ min, $0{,}25$ h $= 15$ min, $0{,}5$ h $= 30$ min.',
          correction: [`$${dec(h % 1)}$ h $= ${dec(h % 1)} \\times 60 = ${Math.round((h % 1) * 60)}$ min, donc $${dec(h)}$ h $= ${Math.floor(h)}$ h $${Math.round((h % 1) * 60)}$ min.`],
        };
      },
    },
  ],
  '6e-somme-durees': [
    {
      name: 'difference',
      make: (rng) => {
        const a = rng.int(60, 300);
        const b = rng.int(10, a - 5);
        return {
          prompt: `Un film dure $${Math.floor(a / 60)}$ h $${a % 60}$ min. On en a regardé $${Math.floor(b / 60)}$ h $${b % 60}$ min. Combien de minutes reste-t-il ?`,
          answer: decimal(a - b),
          hint: 'Convertis les deux durées en minutes, puis soustrais.',
          correction: [`$${a} - ${b} = ${a - b}$ min`],
        };
      },
    },
  ],
  '6e-parentheses': [
    {
      name: 'placer',
      from: 2,
      make: (rng) => {
        const [a, b, c] = [rng.int(2, 9), rng.int(2, 9), rng.int(2, 9)];
        const target = (a + b) * c;
        const opts = [`$(${a} + ${b}) \\times ${c}$`, `$${a} + (${b} \\times ${c})$`, `$${a} + ${b} \\times ${c}$`];
        return {
          prompt: `Quel calcul donne $${target}$ ?`,
          answer: makeChoice(rng, opts[0], opts.slice(1), () => `$${a} \\times ${b} + ${c}$`),
          hint: 'Sans parenthèses, la multiplication passe avant l’addition.',
          correction: [`$(${a} + ${b}) \\times ${c} = ${a + b} \\times ${c} = ${target}$, alors que $${a} + ${b} \\times ${c} = ${a + b * c}$.`],
        };
      },
    },
  ],
  '6e-nombre-manquant': [
    {
      name: 'facteur',
      make: (rng, level) => {
        const a = rng.int(2, level === 1 ? 9 : 25);
        const x = rng.int(2, level === 1 ? 10 : 40);
        return {
          prompt: `Complète : $${a} \\times \\ldots = ${a * x}$.`,
          answer: decimal(x),
          hint: `Divise $${a * x}$ par $${a}$.`,
          correction: [`$${a * x} \\div ${a} = ${x}$`],
        };
      },
    },
  ],
  '6e-quadrilateres': [
    {
      name: 'vrai-faux',
      make: vf(
        [
          ['Un carré est un rectangle particulier.', true, 'Il a quatre angles droits.'],
          ['Un rectangle a ses quatre côtés de même longueur.', false, 'Seul un rectangle qui est un carré a ses quatre côtés égaux.'],
          ['Un losange a ses quatre côtés de même longueur.', true, 'C’est la définition du losange.'],
          ['Un carré est un losange particulier.', true, 'Ses quatre côtés sont égaux.'],
          ['Un losange a toujours quatre angles droits.', false, 'Seul le carré est un losange à angles droits.'],
        ],
        'Rectangle : quatre angles droits. Losange : quatre côtés égaux. Carré : les deux à la fois.',
      ),
    },
  ],
  '6e-vocabulaire-quadrilatere': [
    {
      name: 'nom-polygone',
      make: (rng) => {
        const names: [number, string][] = [
          [3, 'Triangle'],
          [4, 'Quadrilatère'],
          [5, 'Pentagone'],
          [6, 'Hexagone'],
          [8, 'Octogone'],
        ];
        const [n, good] = rng.pick(names);
        return {
          prompt: `Comment s’appelle un polygone à $${n}$ côtés ?`,
          answer: makeChoice(rng, good, names.filter(([m]) => m !== n).map(([, w]) => w), () => 'Décagone'),
          hint: 'Tri- : 3, quadri- : 4, penta- : 5, hexa- : 6, octo- : 8.',
          correction: [`Un polygone à $${n}$ côtés est un ${good.toLowerCase()}.`],
        };
      },
    },
  ],
  '6e-fraction-decimal': [
    {
      name: 'vers-fraction',
      make: (rng) => {
        const v = rng.pick([0.5, 0.25, 0.75, 0.2, 0.4, 0.6, 0.8, 0.1, 0.3, 1.5, 2.5]);
        return {
          prompt: `Écris $${dec(v)}$ sous la forme d’une fraction (simplifiée si possible).`,
          answer: { kind: 'number', value: frac(Math.round(v * 100), 100) },
          hint: 'Écris d’abord le nombre en dixièmes ou en centièmes, puis simplifie.',
          correction: [`$${dec(v)} = \\frac{${Math.round(v * 100)}}{100}$, que l’on peut simplifier.`],
        };
      },
    },
  ],
  '6e-fraction-et-un': [
    {
      name: 'plus-grande-que-un',
      make: (rng) => {
        const d = rng.int(3, 9);
        const big = d + rng.int(1, 5);
        const opts = [`$${fr(big, d)}$`, `$${fr(d - 1, d)}$`, `$${fr(1, d)}$`, `$${fr(d - 2, d)}$`];
        return {
          prompt: 'Laquelle de ces fractions est plus grande que $1$ ?',
          answer: makeChoice(rng, opts[0], opts.slice(1), () => `$${fr(d, d + 1)}$`),
          hint: 'Une fraction est plus grande que $1$ quand son numérateur est plus grand que son dénominateur.',
          correction: [`$${big} > ${d}$, donc $${fr(big, d)} > 1$.`],
        };
      },
    },
  ],
  '6e-conversion-longueur': [
    {
      name: 'situation',
      make: (rng) => {
        const cases: [string, number, string, number][] = [
          ['Un marathon mesure', 42.195, 'km. Combien cela fait-il de mètres ?', 1000],
          ['Une fourmi mesure', 4, 'mm. Combien cela fait-il de centimètres ?', 0.1],
          ['La tour Eiffel mesure environ', 330, 'm. Combien cela fait-il de kilomètres ?', 0.001],
          ['Une feuille A4 mesure', 29.7, 'cm de haut. Combien cela fait-il de millimètres ?', 10],
          ['Une piscine olympique mesure', 50, 'm. Combien cela fait-il de centimètres ?', 100],
        ];
        const [a, v, b, f] = rng.pick(cases);
        return {
          prompt: `${a} $${dec(v)}$ ${b}`,
          answer: decimal(v * f),
          hint: 'Utilise un tableau de conversion : km, hm, dam, m, dm, cm, mm.',
          correction: [`$${dec(v)} \\times ${dec(f)} = ${dec(v * f)}$`],
        };
      },
    },
  ],
  '6e-perimetre-polygone': [
    {
      name: 'regulier',
      make: (rng) => {
        const [n, name] = rng.pick([[5, 'pentagone'], [6, 'hexagone'], [8, 'octogone'], [3, 'triangle équilatéral']] as [number, string][]);
        const c = rng.int(2, 20) / (rng.next() < 0.5 ? 1 : 2);
        return {
          prompt: `Un ${name}${name.startsWith('triangle') ? '' : ' régulier'} a des côtés de $${dec(c)}$ cm. Quel est son périmètre, en cm ?`,
          answer: decimal(n * c),
          hint: `Ses $${n}$ côtés ont la même longueur.`,
          correction: [`$${n} \\times ${dec(c)} = ${dec(n * c)}$ cm`],
        };
      },
    },
  ],
  '6e-aire-rectangle': [
    {
      name: 'cote-depuis-aire',
      from: 2,
      make: (rng) => {
        const L = rng.int(2, 15);
        const l = rng.int(2, 12);
        return {
          prompt: `Un rectangle a une aire de $${L * l}$ cm² et une largeur de $${l}$ cm. Quelle est sa longueur, en cm ?`,
          answer: decimal(L),
          hint: 'Aire $=$ longueur $\\times$ largeur : divise l’aire par la largeur.',
          correction: [`$${L * l} \\div ${l} = ${L}$ cm`],
        };
      },
    },
    {
      name: 'carrelage',
      make: (rng) => {
        const L = rng.int(2, 8);
        const l = rng.int(2, 6);
        const c = rng.pick([20, 25, 50]);
        const n = ((L * 100) / c) * ((l * 100) / c);
        return {
          prompt: `Une pièce rectangulaire mesure $${L}$ m sur $${l}$ m. Combien faut-il de carreaux carrés de $${c}$ cm de côté pour couvrir le sol ?`,
          answer: decimal(n),
          hint: 'Compte combien de carreaux tiennent dans la longueur, puis dans la largeur.',
          correction: [`Longueur : $${L * 100} \\div ${c} = ${(L * 100) / c}$ carreaux ; largeur : $${l * 100} \\div ${c} = ${(l * 100) / c}$ carreaux.`, `$${(L * 100) / c} \\times ${(l * 100) / c} = ${n}$ carreaux`],
        };
      },
    },
  ],
  '6e-reconnaitre-solide': [
    {
      name: 'vrai-faux',
      make: vf(
        [
          ['Un cube est un pavé droit particulier.', true, 'Ses six faces sont des carrés.'],
          ['Un cylindre a des arêtes droites.', false, 'Il a deux bords circulaires, pas d’arête droite.'],
          ['Une pyramide à base carrée a $5$ faces.', true, 'La base carrée et $4$ faces triangulaires.'],
          ['Une boule a des faces planes.', false, 'Sa surface est entièrement courbe.'],
          ['Un pavé droit a $6$ faces rectangulaires.', true, 'Elles sont opposées deux à deux.'],
          ['Un cône a deux bases.', false, 'Il a une seule base, un disque, et un sommet.'],
        ],
        'Pense à la forme des faces : planes (polygones) ou courbes.',
      ),
    },
  ],
  '6e-elements-solide': [
    {
      name: 'prisme',
      from: 2,
      make: (rng) => {
        const n = rng.int(3, 8);
        const what = rng.pick(['faces', 'arêtes', 'sommets'] as const);
        const v = what === 'faces' ? n + 2 : what === 'arêtes' ? 3 * n : 2 * n;
        const names: Record<number, string> = { 3: 'triangle', 4: 'quadrilatère', 5: 'pentagone', 6: 'hexagone', 7: 'heptagone', 8: 'octogone' };
        return {
          prompt: `Combien ${what === 'arêtes' ? 'd’arêtes' : `de ${what}`} a un prisme droit dont la base est un ${names[n]} ?`,
          answer: decimal(v),
          hint: `Les deux bases ont $${n}$ côtés chacune ; elles sont reliées par des faces rectangulaires.`,
          correction: [what === 'faces' ? `$2$ bases $+ ${n}$ faces latérales $= ${v}$ faces.` : what === 'arêtes' ? `$${n}$ arêtes sur chaque base $+ ${n}$ arêtes latérales $= ${v}$ arêtes.` : `$${n}$ sommets sur chaque base : $${v}$ sommets.`],
        };
      },
    },
  ],
  '6e-volume-pave': [
    {
      name: 'petits-cubes',
      make: (rng) => {
        const [L, l, h] = [rng.int(2, 8), rng.int(2, 6), rng.int(2, 6)];
        return {
          prompt: `Combien de petits cubes de $1$ cm d’arête faut-il pour remplir une boîte en forme de pavé de $${L}$ cm × $${l}$ cm × $${h}$ cm ?`,
          answer: decimal(L * l * h),
          hint: 'Compte les cubes d’une couche, puis multiplie par le nombre de couches.',
          correction: [`Une couche : $${L} \\times ${l} = ${L * l}$ cubes ; $${h}$ couches : $${L * l * h}$ cubes.`],
        };
      },
    },
  ],
  '6e-comparer': [
    {
      name: 'piege-chiffres',
      make: (rng) => {
        const e = rng.int(0, 20);
        const a = e + rng.int(1, 9) / 10;
        const b = e + (rng.int(1, 9) * 10 + rng.int(1, 9)) / 100;
        const bigger = a > b ? a : b;
        return {
          prompt: `Lequel est le plus grand : $${dec(a)}$ ou $${dec(b)}$ ?`,
          answer: fixedChoice([`$${dec(a)}$`, `$${dec(b)}$`, 'Ils sont égaux'], bigger === a ? 0 : 1),
          hint: 'Compare chiffre par chiffre à partir de la virgule (dixièmes, puis centièmes) ; un nombre avec plus de chiffres n’est pas forcément plus grand.',
          correction: [`$${dec(a)} = ${dec(a).replace(/\{,\}(\d)$/, '{,}$10')}$ et $${dec(b)}$ : le plus grand est $${dec(bigger)}$.`],
        };
      },
    },
  ],
  '6e-arrondir': [
    {
      name: 'prix',
      make: (rng) => {
        const m = rng.int(100, 5000) * 10 + rng.int(1, 9);
        const r = Math.round(m / 10) / 100;
        return {
          prompt: `Un prix calculé vaut $${dec(m / 1000)}$ €. Arrondis-le au centime près.`,
          answer: decimal(r),
          hint: 'Regarde le chiffre des millièmes : $5$ ou plus, on arrondit au-dessus.',
          correction: [`Arrondi au centième : $${dec(r)}$ €.`],
        };
      },
    },
  ],
  '6e-soustraction': [
    {
      name: 'rendu-monnaie',
      make: (rng) => {
        const price = rng.int(105, 4990) / 100;
        const paid = price < 10 ? 10 : price < 20 ? 20 : 50;
        return {
          prompt: `${prenom(rng)} paie un achat de $${dec(price)}$ € avec un billet de $${paid}$ €. Combien lui rend-on, en € ?`,
          answer: decimal(Math.round((paid - price) * 100) / 100),
          hint: 'Rendu $=$ somme donnée $-$ prix.',
          correction: [`$${paid} - ${dec(price)} = ${dec(Math.round((paid - price) * 100) / 100)}$ €`],
        };
      },
    },
  ],
  '6e-multiplication': [
    {
      name: 'prix-au-kilo',
      make: (rng) => {
        const p = rng.int(15, 90) / 10;
        const m = rng.pick([0.5, 1.5, 2, 2.5, 0.8, 1.2]);
        return {
          prompt: `Des pommes coûtent $${dec(p)}$ € le kilo. Combien coûtent $${dec(m)}$ kg de pommes, en € ?`,
          answer: decimal(Math.round(p * m * 100) / 100),
          hint: 'Multiplie le prix d’un kilo par la masse.',
          correction: [`$${dec(p)} \\times ${dec(m)} = ${dec(Math.round(p * m * 100) / 100)}$ €`],
        };
      },
    },
  ],
  '6e-ordre-grandeur': [
    {
      name: 'courses',
      make: (rng) => {
        const prices = Array.from({ length: 4 }, () => rng.int(150, 2000) / 100);
        const total = prices.reduce((s, x) => s + x, 0);
        const budget = Math.round(total / 10) * 10 + rng.pick([-10, 10]);
        const ok = total <= budget;
        return {
          prompt: `${prenom(rng)} a $${budget}$ € et achète des articles à $${prices.map(dec).join('$ €, $')}$ €. Sans poser l’opération, a-t-on assez d’argent ?`,
          answer: ouiNon(ok),
          hint: 'Arrondis chaque prix à l’unité pour estimer le total.',
          correction: [`Estimation : environ $${prices.map((x) => Math.round(x)).join(' + ')} = ${prices.reduce((s, x) => s + Math.round(x), 0)}$ €. Total exact : $${dec(Math.round(total * 100) / 100)}$ €.`, ok ? 'La somme suffit.' : 'La somme ne suffit pas.'],
        };
      },
    },
  ],
  '6e-tableau-proportionnalite': [
    {
      name: 'coefficient',
      make: (rng) => {
        const k = rng.pick([2, 3, 4, 5, 1.5, 2.5, 0.5]);
        const xs = [rng.int(1, 4), rng.int(5, 8), rng.int(9, 12)];
        return {
          prompt: `Ce tableau est un tableau de proportionnalité : $\\begin{array}{|c|c|c|c|}\\hline ${xs.join(' & ')} & \\ldots \\\\ \\hline ${xs.map((x) => dec(x * k)).join(' & ')} & \\ldots \\\\ \\hline\\end{array}$ Par quel nombre multiplie-t-on la première ligne pour obtenir la seconde ?`,
          answer: decimal(k),
          hint: 'Divise un nombre de la seconde ligne par le nombre correspondant de la première.',
          correction: [`$${dec(xs[0] * k)} \\div ${xs[0]} = ${dec(k)}$`],
        };
      },
    },
  ],
  '6e-pourcentage': [
    {
      name: 'reduction',
      make: (rng) => {
        const p = rng.pick([20, 40, 50, 60, 80, 100, 120, 150]);
        const t = rng.pick([10, 20, 25, 50]);
        return {
          prompt: `Un jeu coûte $${p}$ € ; on bénéficie d’une réduction de $${t}\\,\\%$. Combien paie-t-on, en € ?`,
          answer: decimal((p * (100 - t)) / 100),
          hint: `Calcule d’abord la réduction : $${t}\\,\\%$ de $${p}$.`,
          correction: [`Réduction : $${p} \\times ${t} \\div 100 = ${dec((p * t) / 100)}$ €.`, `Prix payé : $${p} - ${dec((p * t) / 100)} = ${dec((p * (100 - t)) / 100)}$ €`],
        };
      },
    },
  ],
  '6e-axes-symetrie': [
    {
      name: 'lettres',
      make: (rng) => {
        const letters: [string, number][] = [
          ['A', 1],
          ['B', 1],
          ['C', 1],
          ['E', 1],
          ['F', 0],
          ['G', 0],
          ['H', 2],
          ['I', 2],
          ['M', 1],
          ['N', 0],
          ['O', 2],
          ['T', 1],
          ['X', 2],
          ['Z', 0],
        ];
        const [l, n] = rng.pick(letters);
        return {
          prompt: `Combien d’axes de symétrie possède la lettre majuscule « ${l} » (écrite en capitale d’imprimerie simple, le O étant un ovale) ?`,
          answer: decimal(n),
          hint: 'Cherche une droite verticale, puis une droite horizontale, qui partagent la lettre en deux moitiés superposables par pliage.',
          correction: [n === 0 ? `« ${l} » n’a aucun axe de symétrie.` : n === 1 ? `« ${l} » a un seul axe de symétrie.` : `« ${l} » a deux axes de symétrie (vertical et horizontal).`],
        };
      },
    },
  ],
  '6e-conservation': [
    {
      name: 'vrai-faux',
      make: vf(
        [
          ['La symétrie axiale conserve les longueurs.', true, 'Une figure et son symétrique se superposent par pliage.'],
          ['La symétrie axiale conserve les angles.', true, 'Une figure et son symétrique se superposent par pliage.'],
          ['Le symétrique d’un cercle est un cercle de même rayon.', true, 'Les longueurs sont conservées.'],
          ['Le symétrique d’un segment de $5$ cm mesure $10$ cm.', false, 'Il mesure aussi $5$ cm.'],
          ['Un point situé sur l’axe est son propre symétrique.', true, 'Il ne bouge pas quand on plie.'],
          ['Le symétrique d’une droite parallèle à l’axe est perpendiculaire à l’axe.', false, 'Il est aussi parallèle à l’axe.'],
        ],
        'Plier le long de l’axe superpose la figure et son symétrique.',
      ),
    },
  ],
  '6e-mediatrice': [
    {
      name: 'vrai-faux',
      make: vf(
        [
          ['La médiatrice d’un segment passe par son milieu.', true, 'C’est la droite perpendiculaire au segment en son milieu.'],
          ['La médiatrice d’un segment lui est parallèle.', false, 'Elle lui est perpendiculaire.'],
          ['Tout point de la médiatrice de $[AB]$ est à égale distance de $A$ et de $B$.', true, 'C’est la propriété de la médiatrice.'],
          ['Un segment a deux médiatrices.', false, 'Il en a une seule.'],
        ],
        'La médiatrice de $[AB]$ est la droite perpendiculaire à $[AB]$ en son milieu.',
      ),
    },
  ],
};
