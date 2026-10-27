import { dec, decimal, fixedChoice, makeChoice, ouiNon, round, vraiFaux } from '../../college';
import { frac } from '../../fraction';
import type { Rng } from '../../rng';
import { nearTie } from '../outils';
import type { Variant } from '../../variantes';

/** 3e : nouvelles formes pour Pythagore, Thalès, la trigonométrie, les transformations et l'espace. */

const TRIPLES: [number, number, number][] = [
  [3, 4, 5],
  [5, 12, 13],
  [8, 15, 17],
  [6, 8, 10],
  [7, 24, 25],
  [9, 12, 15],
  [20, 21, 29],
];

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

/** Tire une valeur à arrondir loin d'un « 5 » ambigu. */
function safe(_rng: Rng, make: () => number, digits: number): number {
  let v = make();
  for (let i = 0; i < 100 && nearTie(v, digits); i++) v = make();
  return v;
}

const HYPOTENUSE: Variant[] = [
  {
    name: 'diagonale-carre',
    make: (rng, level) => {
      const c = rng.int(2, level === 1 ? 10 : 25);
      const v = round(c * Math.SQRT2, 1);
      return {
        prompt: `Un carré a pour côté $${c}$ cm. Calcule la longueur de sa diagonale, arrondie au dixième de cm.`,
        answer: decimal(v),
        hint: 'La diagonale partage le carré en deux triangles rectangles isocèles.',
        correction: [`$d^2 = ${c}^2 + ${c}^2 = ${2 * c * c}$`, `$d = \\sqrt{${2 * c * c}} \\approx ${dec(v)}$ cm`],
      };
    },
  },
  {
    name: 'diagonale-pave',
    from: 3,
    make: (rng) => {
      let a = 0;
      let b = 0;
      let c = 0;
      const v = safe(rng, () => {
        a = rng.int(2, 12);
        b = rng.int(2, 12);
        c = rng.int(2, 12);
        return Math.sqrt(a * a + b * b + c * c);
      }, 1);
      return {
        prompt: `Un pavé droit mesure $${a}$ cm × $${b}$ cm × $${c}$ cm. Calcule la longueur de sa grande diagonale (d’un sommet au sommet opposé), arrondie au dixième de cm.`,
        answer: decimal(round(v, 1)),
        hint: 'Calcule d’abord la diagonale d’une face, puis applique à nouveau Pythagore dans un triangle rectangle « vertical ».',
        correction: [`Diagonale de la base : $d^2 = ${a}^2 + ${b}^2 = ${a * a + b * b}$.`, `Grande diagonale : $D^2 = d^2 + ${c}^2 = ${a * a + b * b + c * c}$.`, `$D = \\sqrt{${a * a + b * b + c * c}} \\approx ${dec(round(v, 1))}$ cm`],
      };
    },
  },
];

const COTE: Variant[] = [
  {
    name: 'hauteur-isocele',
    make: (rng, level) => {
      const [x, h, s] = rng.pick(TRIPLES.slice(0, level === 1 ? 2 : 6));
      const k = rng.pick([1, 2]);
      return {
        prompt: `Un triangle isocèle a deux côtés de $${s * k}$ cm et une base de $${2 * x * k}$ cm. Calcule sa hauteur issue du sommet principal, en cm.`,
        answer: decimal(h * k),
        hint: 'La hauteur coupe la base en son milieu : elle forme deux triangles rectangles.',
        correction: [`Demi-base : $${x * k}$ cm. Dans le triangle rectangle : $h^2 = ${s * k}^2 - ${x * k}^2 = ${(s * k) ** 2 - (x * k) ** 2}$.`, `$h = ${h * k}$ cm`],
      };
    },
  },
  {
    name: 'cote-rectangle',
    make: (rng) => {
      const [a, b, c] = rng.pick(TRIPLES);
      return {
        prompt: `Un rectangle a une diagonale de $${c}$ cm et une longueur de $${b}$ cm. Quelle est sa largeur, en cm ?`,
        answer: decimal(a),
        hint: 'La diagonale est l’hypoténuse d’un triangle rectangle formé par la longueur et la largeur.',
        correction: [`$\\ell^2 = ${c}^2 - ${b}^2 = ${c * c - b * b}$`, `$\\ell = ${a}$ cm`],
      };
    },
  },
];

const RECIPROQUE: Variant[] = [
  {
    name: 'longueur-pour-rectangle',
    from: 2,
    make: (rng) => {
      const [a, b, c] = rng.pick(TRIPLES);
      return {
        prompt: `Dans le triangle $EFG$, $EF = ${a}$ cm et $FG = ${b}$ cm. Quelle longueur doit avoir $[EG]$ pour que le triangle soit rectangle en $F$ ?`,
        answer: decimal(c),
        hint: 'Rectangle en $F$ : l’hypoténuse est le côté opposé à $F$, c’est $[EG]$.',
        correction: [`Il faut $EG^2 = EF^2 + FG^2 = ${a * a} + ${b * b} = ${c * c}$.`, `$EG = ${c}$ cm`],
      };
    },
  },
  {
    name: 'corde-noeuds',
    make: (rng) => {
      const [a, b, c] = rng.pick([
        [3, 4, 5],
        [3, 4, 6],
        [4, 4, 5],
        [5, 12, 13],
        [6, 8, 10],
        [4, 5, 6],
      ]);
      const ok = a * a + b * b === c * c;
      return {
        prompt: `Pour tracer un angle droit, un maçon tend une corde à nœuds régulièrement espacés en un triangle de côtés $${a}$, $${b}$ et $${c}$ intervalles. Obtient-il un angle droit ?`,
        answer: ouiNon(ok),
        hint: 'Compare le carré du plus grand côté à la somme des carrés des deux autres.',
        correction: [`$${c}^2 = ${c * c}$ et $${a}^2 + ${b}^2 = ${a * a + b * b}$.`, ok ? 'Égalité : d’après la réciproque de Pythagore, le triangle est rectangle.' : 'Pas d’égalité : le triangle n’est pas rectangle.'],
      };
    },
  },
];

const PROBLEME_PYTHA: Variant[] = [
  {
    name: 'cerf-volant',
    make: (rng) => {
      const [a, b, c] = rng.pick(TRIPLES);
      const k = rng.pick([1, 2, 3]);
      return {
        prompt: `Le fil d’un cerf-volant, bien tendu, mesure $${c * k}$ m. Le cerf-volant est à la verticale d’un point situé à $${a * k}$ m de la main qui tient le fil. À quelle hauteur au-dessus de la main vole-t-il, en m ?`,
        answer: decimal(b * k),
        hint: 'Le fil est l’hypoténuse d’un triangle rectangle.',
        correction: [`$h^2 = ${c * k}^2 - ${a * k}^2 = ${(c * k) ** 2 - (a * k) ** 2}$`, `$h = ${b * k}$ m`],
      };
    },
  },
  {
    name: 'raccourci',
    make: (rng) => {
      const [a, b, c] = rng.pick(TRIPLES);
      const k = rng.pick([5, 10, 2]);
      return {
        prompt: `Un terrain rectangulaire mesure $${a * k}$ m sur $${b * k}$ m. Combien de mètres gagne-t-on en le traversant en diagonale plutôt qu’en longeant deux côtés ?`,
        answer: decimal((a + b - c) * k),
        hint: 'Calcule la diagonale avec Pythagore, puis compare-la à la somme des deux côtés.',
        correction: [`Diagonale : $\\sqrt{${a * k}^2 + ${b * k}^2} = \\sqrt{${(c * k) ** 2}} = ${c * k}$ m.`, `Gain : $${a * k} + ${b * k} - ${c * k} = ${(a + b - c) * k}$ m.`],
      };
    },
  },
  {
    name: 'ecran-pouces',
    from: 2,
    make: (rng) => {
      const [w, h, d] = rng.pick([
        [16, 12, 20],
        [32, 24, 40],
        [48, 36, 60],
        [24, 18, 30],
        [40, 30, 50],
      ]);
      const ask = rng.next() < 0.5;
      return {
        prompt: ask
          ? `Un écran mesure $${w}$ pouces de large et $${h}$ pouces de haut. Quelle est sa diagonale, en pouces ?`
          : `Un écran de $${d}$ pouces de diagonale mesure $${w}$ pouces de large. Quelle est sa hauteur, en pouces ?`,
        answer: decimal(ask ? d : h),
        hint: 'La taille d’un écran est la longueur de sa diagonale.',
        correction: ask ? [`$d^2 = ${w}^2 + ${h}^2 = ${d * d}$`, `$d = ${d}$ pouces`] : [`$h^2 = ${d}^2 - ${w}^2 = ${h * h}$`, `$h = ${h}$ pouces`],
      };
    },
  },
];

function thalesConfig(rng: Rng, level: number) {
  const [p, q] = rng.pick(level === 1 ? [[1, 2], [1, 3], [2, 3], [3, 4]] : [[2, 5], [3, 5], [3, 4], [4, 5], [5, 8], [3, 7]]);
  const ab = q * rng.int(1, 3);
  const ac = q * rng.int(1, 4);
  return { p, q, ab, ac, am: (ab * p) / q, an: (ac * p) / q };
}

const THALES_LONGUEUR: Variant[] = [
  {
    name: 'par-difference',
    from: 2,
    make: (rng, level) => {
      const c = thalesConfig(rng, level);
      const nc = c.ac - c.an;
      return {
        prompt: `$M$ est sur $[AB]$, $N$ est sur $[AC]$ et $(MN) \\parallel (BC)$. On donne $AM = ${dec(c.am)}$ cm, $AN = ${dec(c.an)}$ cm et $NC = ${dec(nc)}$ cm. Calcule $AB$, en cm.`,
        answer: decimal(c.ab),
        hint: 'Calcule d’abord $AC = AN + NC$, puis applique le théorème de Thalès.',
        correction: [`$AC = ${dec(c.an)} + ${dec(nc)} = ${dec(c.ac)}$ cm.`, `$\\frac{AM}{AB} = \\frac{AN}{AC}$, donc $AB = \\frac{AM \\times AC}{AN} = \\frac{${dec(c.am)} \\times ${dec(c.ac)}}{${dec(c.an)}} = ${dec(c.ab)}$ cm.`],
      };
    },
  },
  {
    name: 'segment-restant',
    make: (rng, level) => {
      const c = thalesConfig(rng, level);
      return {
        prompt: `$M$ est sur $[AB]$, $N$ est sur $[AC]$ et $(MN) \\parallel (BC)$. On donne $AB = ${dec(c.ab)}$ cm, $AC = ${dec(c.ac)}$ cm et $AN = ${dec(c.an)}$ cm. Calcule $MB$, en cm.`,
        answer: decimal(c.ab - c.am),
        hint: 'Calcule $AM$ avec Thalès, puis $MB = AB - AM$.',
        correction: [`$AM = \\frac{AB \\times AN}{AC} = \\frac{${dec(c.ab)} \\times ${dec(c.an)}}{${dec(c.ac)}} = ${dec(c.am)}$ cm.`, `$MB = ${dec(c.ab)} - ${dec(c.am)} = ${dec(c.ab - c.am)}$ cm.`],
      };
    },
  },
];

const THALES_RAPPORTS: Variant[] = [
  {
    name: 'valeur-rapport',
    make: (rng, level) => {
      const c = thalesConfig(rng, level);
      return {
        prompt: `$M$ est sur $[AB]$, $N$ est sur $[AC]$ et $(MN) \\parallel (BC)$, avec $AM = ${dec(c.am)}$ cm et $AB = ${dec(c.ab)}$ cm. Que vaut le rapport $\\frac{AN}{AC}$ ? (fraction acceptée)`,
        answer: { kind: 'number', value: frac(c.p, c.q) },
        hint: 'Les rapports de Thalès sont égaux : $\\frac{AN}{AC} = \\frac{AM}{AB}$.',
        correction: [`$\\frac{AN}{AC} = \\frac{AM}{AB} = \\frac{${dec(c.am)}}{${dec(c.ab)}} = \\frac{${c.p}}{${c.q}}$`],
      };
    },
  },
];

const THALES_RECIPROQUE: Variant[] = [
  {
    name: 'longueur-pour-parallele',
    make: (rng, level) => {
      const c = thalesConfig(rng, level);
      return {
        prompt: `Les points $A$, $M$, $B$ sont alignés dans cet ordre, ainsi que $A$, $N$, $C$. On donne $AM = ${dec(c.am)}$ cm, $AB = ${dec(c.ab)}$ cm et $AC = ${dec(c.ac)}$ cm. Quelle doit être la longueur $AN$, en cm, pour que $(MN)$ et $(BC)$ soient parallèles ?`,
        answer: decimal(c.an),
        hint: 'D’après la réciproque de Thalès, il faut $\\frac{AN}{AC} = \\frac{AM}{AB}$.',
        correction: [`$AN = \\frac{AM \\times AC}{AB} = \\frac{${dec(c.am)} \\times ${dec(c.ac)}}{${dec(c.ab)}} = ${dec(c.an)}$ cm`],
      };
    },
  },
];

const THALES_PROBLEME: Variant[] = [
  {
    name: 'riviere',
    make: (rng) => {
      // Visée : AB = largeur (inconnue), BD = recul, DE parallèle à AB.
      // Triangles CDE et CBA : CD/CB = DE/BA, avec CB = m × CD.
      const CD = rng.int(2, 8);
      const m = rng.int(3, 8);
      const BD = CD * (m - 1);
      const DE = rng.int(2, 6);
      const AB = DE * m;
      return {
        prompt: `Pour mesurer la largeur $AB$ d’une rivière, on plante des piquets : $C$, $D$ et $B$ sont alignés le long de la rive, $D$ entre $C$ et $B$, avec $CD = ${dec(CD)}$ m et $DB = ${BD}$ m. Le point $E$ est tel que $(DE) \\parallel (BA)$ et $C$, $E$, $A$ alignés, avec $DE = ${DE}$ m. Calcule la largeur $AB$, en m.`,
        answer: decimal(AB),
        hint: 'Les triangles $CDE$ et $CBA$ sont en configuration de Thalès : $\\frac{CD}{CB} = \\frac{DE}{BA}$.',
        correction: [`$CB = ${dec(CD)} + ${BD} = ${dec(CD + BD)}$ m.`, `$AB = \\frac{DE \\times CB}{CD} = \\frac{${DE} \\times ${dec(CD + BD)}}{${dec(CD)}} = ${dec(AB)}$ m.`],
      };
    },
  },
  {
    name: 'pyramide',
    from: 2,
    make: (rng) => {
      const baton = rng.pick([1, 2]);
      let ombreB = 0;
      let demi = 0;
      let ombreP = 0;
      const H = safe(rng, () => {
        ombreB = rng.pick([1.5, 2, 2.5, 0.8]) * baton;
        demi = rng.pick([115, 100, 80, 60]);
        ombreP = rng.pick([100, 80, 120, 50, 60]);
        return ((demi + ombreP) * baton) / ombreB;
      }, 0);
      return {
        prompt: `Comme Thalès en Égypte : au même instant, un bâton vertical de $${baton}$ m a une ombre de $${dec(ombreB)}$ m, et l’ombre d’une pyramide dépasse sa base de $${ombreP}$ m. Le sommet est à la verticale du centre, à $${demi}$ m du bord de l’ombre au pied de la pyramide. Quelle est la hauteur de la pyramide, en m (arrondie à l’unité) ?`,
        answer: decimal(Math.round(H)),
        hint: 'L’ombre de la pyramide se mesure depuis le pied de sa hauteur : demi-côté de la base plus partie qui dépasse.',
        correction: [`Ombre totale depuis le centre : $${demi} + ${ombreP} = ${demi + ombreP}$ m.`, `$\\frac{H}{${demi + ombreP}} = \\frac{${baton}}{${dec(ombreB)}}$, donc $H = ${dec(round(H, 2))} \\approx ${Math.round(H)}$ m.`],
      };
    },
  },
];

const TRIGO_FORMULE: Variant[] = [
  {
    name: 'nommer-cote',
    make: (rng) => {
      const [A, B, C] = rng.pick([['A', 'B', 'C'], ['E', 'F', 'G'], ['R', 'S', 'T']]);
      const ask = rng.pick(['hyp', 'opp', 'adj'] as const);
      const right = { hyp: `[${B}${C}]`, opp: `[${A}${C}]`, adj: `[${A}${B}]` };
      const label = { hyp: 'l’hypoténuse', opp: `le côté opposé à l’angle $\\widehat{${A}${B}${C}}$`, adj: `le côté adjacent à l’angle $\\widehat{${A}${B}${C}}$` };
      return {
        prompt: `Le triangle $${A}${B}${C}$ est rectangle en $${A}$. Quel est ${label[ask]} ?`,
        answer: fixedChoice([`$${right.hyp}$`, `$${right.opp}$`, `$${right.adj}$`], ask === 'hyp' ? 0 : ask === 'opp' ? 1 : 2),
        hint: 'L’hypoténuse est en face de l’angle droit ; le côté opposé est en face de l’angle ; l’adjacent le touche sans être l’hypoténuse.',
        correction: [`Hypoténuse : $${right.hyp}$ ; côté opposé à $\\widehat{${B}}$ : $${right.opp}$ ; côté adjacent : $${right.adj}$.`],
      };
    },
  },
  {
    name: 'valeur-impossible',
    from: 2,
    make: (rng) => {
      const v = rng.pick([1.2, 1.5, 2, 0.5, 0.8, 0.3, 1.1]);
      const fn = rng.pick(['\\cos', '\\sin'] as const);
      const ok = v <= 1;
      return {
        prompt: `Dans un triangle rectangle, peut-on avoir $${fn} \\widehat{B} = ${dec(v)}$ pour un angle aigu $\\widehat{B}$ ?`,
        answer: ouiNon(ok),
        hint: 'Le cosinus et le sinus d’un angle aigu sont des quotients d’un côté par l’hypoténuse, le plus grand côté.',
        correction: [ok ? `Oui : $${dec(v)}$ est entre $0$ et $1$.` : `Non : $${dec(v)} > 1$, or un côté de l’angle droit est toujours plus court que l’hypoténuse.`],
      };
    },
  },
];

const TRIGO_LONGUEUR: Variant[] = [
  {
    name: 'echelle',
    make: (rng) => {
      let L = 0;
      let a = 0;
      const v = safe(rng, () => {
        L = rng.int(3, 8);
        a = rng.pick([60, 65, 70, 75, 80]);
        return L * Math.sin(rad(a));
      }, 1);
      return {
        prompt: `Une échelle de $${L}$ m est posée contre un mur vertical ; elle fait un angle de $${a}^\\circ$ avec le sol. À quelle hauteur touche-t-elle le mur ? Arrondis au dixième de m.`,
        answer: decimal(round(v, 1)),
        hint: 'L’échelle est l’hypoténuse ; la hauteur est le côté opposé à l’angle avec le sol.',
        correction: [`$\\sin ${a}^\\circ = \\frac{h}{${L}}$`, `$h = ${L} \\times \\sin ${a}^\\circ \\approx ${dec(round(v, 1))}$ m`],
      };
    },
  },
  {
    name: 'hauteur-arbre',
    from: 2,
    make: (rng) => {
      let d = 0;
      let a = 0;
      const eye = rng.pick([1.5, 1.6, 1.7]);
      const v = safe(rng, () => {
        d = rng.int(8, 30);
        a = rng.int(25, 55);
        return eye + d * Math.tan(rad(a));
      }, 1);
      return {
        prompt: `Debout à $${d}$ m du pied d’un arbre, on voit son sommet sous un angle de $${a}^\\circ$ au-dessus de l’horizontale ; les yeux sont à $${dec(eye)}$ m du sol. Quelle est la hauteur de l’arbre, arrondie au dixième de m ?`,
        answer: decimal(round(v, 1)),
        hint: 'Dans le triangle rectangle formé par le regard, $\\tan$ relie l’angle, le côté opposé (partie de l’arbre au-dessus des yeux) et le côté adjacent (distance).',
        correction: [`Partie au-dessus des yeux : $${d} \\times \\tan ${a}^\\circ \\approx ${dec(round(d * Math.tan(rad(a)), 2))}$ m.`, `Hauteur : $${dec(eye)} + ${dec(round(d * Math.tan(rad(a)), 2))} \\approx ${dec(round(v, 1))}$ m.`],
      };
    },
  },
];

const TRIGO_ANGLE: Variant[] = [
  {
    name: 'pente',
    make: (rng) => {
      let p = 0;
      const v = safe(rng, () => {
        p = rng.pick([5, 8, 10, 12, 15, 20, 25]);
        return deg(Math.atan(p / 100));
      }, 0);
      return {
        prompt: `Un panneau indique une route en pente à $${p}\\,\\%$ : on monte de $${p}$ m pour $100$ m parcourus à l’horizontale. Quel angle la route fait-elle avec l’horizontale, arrondi au degré ?`,
        answer: decimal(round(v)),
        hint: '$\\tan \\alpha = \\frac{\\text{dénivelé}}{\\text{distance horizontale}}$',
        correction: [`$\\tan \\alpha = \\frac{${p}}{100} = ${dec(p / 100)}$`, `$\\alpha \\approx ${round(v)}^\\circ$`],
      };
    },
  },
  {
    name: 'rampe',
    from: 2,
    make: (rng) => {
      let L = 0;
      let h = 0;
      const v = safe(rng, () => {
        L = rng.int(3, 12);
        h = rng.int(1, 9) / 10 + rng.int(0, 1);
        return deg(Math.asin(h / L));
      }, 0);
      return {
        prompt: `Une rampe d’accès de $${L}$ m de long permet de monter de $${dec(h)}$ m. Quel angle fait-elle avec le sol, arrondi au degré ?`,
        answer: decimal(round(v)),
        hint: 'La rampe est l’hypoténuse, la hauteur le côté opposé : utilise le sinus.',
        correction: [`$\\sin \\alpha = \\frac{${dec(h)}}{${L}}$`, `$\\alpha \\approx ${round(v)}^\\circ$`],
      };
    },
  },
];

const TRANSFORMATION: Variant[] = [
  {
    name: 'vrai-faux',
    make: (rng) => {
      const items: [string, boolean, string][] = [
        ['Une translation conserve les longueurs.', true, 'La translation fait « glisser » la figure sans la déformer.'],
        ['Une homothétie de rapport $2$ conserve les longueurs.', false, 'Elle multiplie les longueurs par $2$.'],
        ['Une rotation conserve les angles.', true, 'Les isométries conservent longueurs, angles et aires.'],
        ['Une homothétie conserve les angles.', true, 'Elle agrandit ou réduit sans changer la forme.'],
        ['Une homothétie de rapport $-1$ est une symétrie centrale.', true, 'Chaque point est envoyé à la même distance, de l’autre côté du centre.'],
        ['Une homothétie de rapport $3$ multiplie les aires par $3$.', false, 'Les aires sont multipliées par $3^2 = 9$.'],
        ['Une symétrie axiale conserve les aires.', true, 'C’est une isométrie.'],
        ['Une homothétie de rapport $0{,}5$ est un agrandissement.', false, 'Un rapport compris entre $0$ et $1$ donne une réduction.'],
      ];
      const [t, ok, why] = rng.pick(items);
      return { prompt: `Vrai ou faux ? ${t}`, answer: vraiFaux(ok), hint: 'Translations, rotations et symétries conservent tout ; une homothétie de rapport $k$ multiplie les longueurs par $|k|$.', correction: [`${ok ? 'Vrai' : 'Faux'}. ${why}`] };
    },
  },
];

const HOMOTHETIE: Variant[] = [
  {
    name: 'rapport',
    make: (rng, level) => {
      const k = rng.pick(level === 1 ? [2, 3, 4] : [0.5, 1.5, 2.5, 3, 0.25]);
      const l = rng.int(2, 12) * 2;
      return {
        prompt: `Par une homothétie de rapport positif, un segment de $${l}$ cm a pour image un segment de $${dec(l * k)}$ cm. Quel est le rapport de l’homothétie ?`,
        answer: decimal(k),
        hint: 'Rapport $= \\frac{\\text{longueur image}}{\\text{longueur de départ}}$.',
        correction: [`$k = \\frac{${dec(l * k)}}{${l}} = ${dec(k)}$`],
      };
    },
  },
  {
    name: 'rapport-negatif',
    from: 2,
    make: (rng) => {
      const k = -rng.pick([2, 3, 0.5, 1.5]);
      const l = rng.int(2, 10) * 2;
      return {
        prompt: `Le segment $[AB]$ mesure $${l}$ cm. Quelle est la longueur de son image par l’homothétie de rapport $${dec(k)}$, en cm ?`,
        answer: decimal(Math.abs(k) * l),
        hint: 'Le signe du rapport indique de quel côté du centre est l’image ; les longueurs sont multipliées par $|k|$.',
        correction: [`$A'B' = |${dec(k)}| \\times ${l} = ${dec(Math.abs(k) * l)}$ cm`],
      };
    },
  },
];

const AGRANDISSEMENT: Variant[] = [
  {
    name: 'aire-vers-longueur',
    from: 2,
    make: (rng) => {
      const k = rng.pick([2, 3, 4, 5, 10]);
      const ask = rng.pick(['aire', 'volume'] as const);
      return {
        prompt: ask === 'aire' ? `Un agrandissement multiplie les aires par $${k * k}$. Par combien multiplie-t-il les longueurs ?` : `Un agrandissement multiplie les volumes par $${k ** 3}$. Par combien multiplie-t-il les longueurs ?`,
        answer: decimal(k),
        hint: 'Longueurs × $k$ ; aires × $k^2$ ; volumes × $k^3$.',
        correction: [ask === 'aire' ? `$k^2 = ${k * k}$, donc $k = ${k}$.` : `$k^3 = ${k ** 3}$, donc $k = ${k}$.`],
      };
    },
  },
  {
    name: 'maquette',
    make: (rng) => {
      const e = rng.pick([10, 20, 50, 100]);
      const v = rng.pick([2, 5, 8, 10, 3]);
      return {
        prompt: `Une maquette est à l’échelle $\\frac{1}{${e}}$. Son volume est de $${v}$ cm³. Quel est le volume réel, en cm³ ?`,
        answer: decimal(v * e ** 3),
        hint: 'Les longueurs réelles sont multipliées par $' + e + '$, donc les volumes par $' + e + '^3$.',
        correction: [`$${v} \\times ${e}^3 = ${v} \\times ${e ** 3} = ${v * e ** 3}$ cm³`],
      };
    },
  },
];

const SEMBLABLES: Variant[] = [
  {
    name: 'angles',
    make: (rng) => {
      const a = rng.int(30, 80);
      const b = rng.int(30, 140 - a);
      const c = 180 - a - b;
      const a2 = rng.next() < 0.5 ? c : c + rng.pick([-5, 5, 10]);
      const same = (x: number[], y: number[]) => [...x].sort((u, v) => u - v).join() === [...y].sort((u, v) => u - v).join();
      const yes = same([a, b, c], [b, a2, 180 - b - a2]);
      return {
        prompt: `Le triangle $ABC$ a des angles de $${a}^\\circ$ et $${b}^\\circ$. Le triangle $DEF$ a des angles de $${b}^\\circ$ et $${a2}^\\circ$. Ces triangles sont-ils semblables ?`,
        answer: ouiNon(yes),
        hint: 'Deux triangles sont semblables s’ils ont leurs trois angles égaux deux à deux. Calcule les angles manquants.',
        correction: [`Troisième angle de $ABC$ : $180 - ${a} - ${b} = ${c}^\\circ$ ; angles : $${a}^\\circ$, $${b}^\\circ$, $${c}^\\circ$.`, `Troisième angle de $DEF$ : $${180 - b - a2}^\\circ$.`, yes ? 'Les angles sont les mêmes : les triangles sont semblables.' : 'Les angles diffèrent : les triangles ne sont pas semblables.'],
      };
    },
  },
];

const VOLUME: Variant[] = [
  {
    name: 'boule',
    make: (rng, level) => {
      let r = 0;
      const v = safe(rng, () => {
        r = rng.int(1, level === 1 ? 5 : 12);
        return (4 / 3) * Math.PI * r ** 3;
      }, 0);
      return {
        prompt: `Calcule le volume d’une boule de rayon $${r}$ cm, en cm³, arrondi à l’unité.`,
        answer: decimal(Math.round(v)),
        hint: '$V = \\frac{4}{3}\\pi r^3$',
        correction: [`$V = \\frac{4}{3} \\times \\pi \\times ${r}^3 \\approx ${Math.round(v)}$ cm³`],
      };
    },
  },
  {
    name: 'compose',
    from: 3,
    make: (rng) => {
      let [r, h, hc] = [0, 0, 0];
      const v = safe(rng, () => {
        [r, h, hc] = [rng.int(2, 6), rng.int(4, 15), rng.int(2, 8)];
        return Math.PI * r * r * h + (Math.PI * r * r * hc) / 3;
      }, 0);
      return {
        prompt: `Un silo est formé d’un cylindre de rayon $${r}$ m et de hauteur $${h}$ m, surmonté d’un cône de même rayon et de hauteur $${hc}$ m. Calcule son volume, en m³, arrondi à l’unité.`,
        answer: decimal(Math.round(v)),
        hint: 'Additionne le volume du cylindre ($\\pi r^2 h$) et celui du cône ($\\frac{1}{3}\\pi r^2 h$).',
        correction: [`Cylindre : $\\pi \\times ${r}^2 \\times ${h} = ${r * r * h}\\pi$ ; cône : $\\frac{1}{3} \\pi \\times ${r}^2 \\times ${hc} = ${dec(round((r * r * hc) / 3, 3))}\\pi$.`, `Total $\\approx ${Math.round(v)}$ m³`],
      };
    },
  },
];

const CONVERSION: Variant[] = [
  {
    name: 'verres',
    make: (rng) => {
      const b = rng.pick([1, 1.5, 2, 0.75, 3]);
      const g = rng.pick([25, 20, 15, 10, 30]);
      const n = Math.floor((b * 100) / g + 1e-9);
      return {
        prompt: `Combien de verres de $${g}$ cL peut-on remplir entièrement avec une bouteille de $${dec(b)}$ L ?`,
        answer: decimal(n),
        hint: '$1$ L $= 100$ cL.',
        correction: [`$${dec(b)}$ L $= ${dec(b * 100)}$ cL.`, `$${dec(b * 100)} \\div ${g} = ${dec(round((b * 100) / g, 2))}$${Number.isInteger((b * 100) / g) ? '' : '\\ldots'} : on remplit $${n}$ verres.`],
      };
    },
  },
  {
    name: 'aquarium',
    from: 2,
    make: (rng) => {
      const [L, l, h] = [rng.int(4, 12) * 10, rng.int(2, 6) * 10, rng.int(2, 6) * 10];
      return {
        prompt: `Un aquarium en forme de pavé mesure $${L}$ cm × $${l}$ cm × $${h}$ cm. Combien de litres d’eau contient-il quand il est plein ?`,
        answer: decimal((L * l * h) / 1000),
        hint: 'Calcule le volume en cm³, puis $1$ L $= 1\\,000$ cm³.',
        correction: [`$V = ${L} \\times ${l} \\times ${h} = ${L * l * h}$ cm³`, `$= ${dec((L * l * h) / 1000)}$ L`],
      };
    },
  },
];

const SECTION: Variant[] = [
  {
    name: 'rayon-section-sphere',
    from: 2,
    make: (rng) => {
      const [a, b, c] = rng.pick(TRIPLES);
      return {
        prompt: `Une sphère de centre $O$ et de rayon $${c}$ cm est coupée par un plan situé à $${a}$ cm de $O$. Quel est le rayon du cercle de section, en cm ?`,
        answer: decimal(b),
        hint: 'Le centre de la sphère, le centre du cercle et un point du cercle forment un triangle rectangle.',
        correction: [`$r^2 = ${c}^2 - ${a}^2 = ${c * c - a * a}$`, `$r = ${b}$ cm`],
      };
    },
  },
  {
    name: 'nature',
    make: (rng) => {
      const items: [string, string, string[]][] = [
        ['un cylindre coupé par un plan parallèle à sa base', 'un disque', ['un rectangle', 'un triangle', 'un carré']],
        ['un cylindre coupé par un plan parallèle à son axe', 'un rectangle', ['un disque', 'un triangle', 'un cercle']],
        ['un cône coupé par un plan parallèle à sa base', 'un disque', ['un triangle', 'un rectangle', 'un carré']],
        ['une pyramide à base carrée coupée par un plan parallèle à sa base', 'un carré', ['un triangle', 'un disque', 'un rectangle non carré']],
        ['un cube coupé par un plan parallèle à une face', 'un carré', ['un triangle', 'un disque', 'un losange non carré']],
        ['une sphère coupée par un plan', 'un cercle (ou un point)', ['un carré', 'une ellipse', 'un rectangle']],
      ];
      const [what, good, bad] = rng.pick(items);
      return {
        prompt: `Quelle est la section de ${what} ?`,
        answer: makeChoice(rng, good, bad, () => 'un pentagone'),
        hint: 'Une section parallèle à la base reproduit la forme de la base (en plus petit pour un cône ou une pyramide).',
        correction: [`La section de ${what} est ${good}.`],
      };
    },
  },
];

const SPHERE: Variant[] = [
  {
    name: 'depuis-diametre',
    make: (rng) => {
      let d = 0;
      const v = safe(rng, () => {
        d = rng.int(2, 15) * 2;
        return 4 * Math.PI * (d / 2) ** 2;
      }, 0);
      return {
        prompt: `Un ballon sphérique a un diamètre de $${d}$ cm. Calcule l’aire de sa surface, en cm², arrondie à l’unité.`,
        answer: decimal(Math.round(v)),
        hint: 'Prends le rayon (moitié du diamètre), puis $A = 4\\pi r^2$.',
        correction: [`$r = ${d / 2}$ cm`, `$A = 4 \\times \\pi \\times ${d / 2}^2 = ${d * d}\\pi \\approx ${Math.round(v)}$ cm²`],
      };
    },
  },
  {
    name: 'rayon-depuis-aire',
    from: 3,
    make: (rng) => {
      const r = rng.int(1, 12);
      return {
        prompt: `Une sphère a une aire de $${4 * r * r}\\pi$ cm². Quel est son rayon, en cm ?`,
        answer: decimal(r),
        hint: 'Résous $4\\pi r^2 = ' + 4 * r * r + '\\pi$.',
        correction: [`$4\\pi r^2 = ${4 * r * r}\\pi$, donc $r^2 = ${r * r}$ et $r = ${r}$ cm.`],
      };
    },
  },
];

export const GEOMETRIE_3E: Record<string, Variant[]> = {
  '3e-pythagore-hypotenuse': HYPOTENUSE,
  '3e-pythagore-cote': COTE,
  '3e-pythagore-reciproque': RECIPROQUE,
  '3e-pythagore-probleme': PROBLEME_PYTHA,
  '3e-thales-longueur': THALES_LONGUEUR,
  '3e-thales-rapports': THALES_RAPPORTS,
  '3e-thales-reciproque': THALES_RECIPROQUE,
  '3e-thales-probleme': THALES_PROBLEME,
  '3e-trigo-formule': TRIGO_FORMULE,
  '3e-trigo-longueur': TRIGO_LONGUEUR,
  '3e-trigo-angle': TRIGO_ANGLE,
  '3e-transformation': TRANSFORMATION,
  '3e-homothetie': HOMOTHETIE,
  '3e-agrandissement': AGRANDISSEMENT,
  '3e-triangles-semblables': SEMBLABLES,
  '3e-volume': VOLUME,
  '3e-conversion-volume': CONVERSION,
  '3e-section': SECTION,
  '3e-sphere': SPHERE,
};
