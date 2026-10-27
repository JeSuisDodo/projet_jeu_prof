import { frac, fracLatex } from '../fraction';
import type { Skill } from '../types';
import { enrich, variant } from '../variantes';
import { affine, dec, fixedChoice, fracInterval, interval, latexChoice, par, poly2 } from './outils';

/** Chapitre 9 de 2nde : étude graphique et algébrique de fonctions (images, antécédents, signes). */

const image: Skill = {
  id: '2nde-image',
  name: 'Calculer une image',
  generate(rng, level) {
    const a = rng.nonZero(-3, 3);
    const b = rng.int(-6, 6);
    const c = rng.int(-9, 9);
    const k = rng.int(-4, 4);
    if (level === 3) {
      // Fonction rationnelle : f(x) = (ax + b) / (x - d).
      const d = rng.int(-4, 4);
      let x = k;
      if (x === d) x = d + 1;
      const value = frac(a * x + b, x - d);
      const f = `\\frac{${affine(a, b)}}{${affine(1, -d)}}`;
      return {
        skill: '2nde-image',
        level,
        prompt: `Soit $f(x) = ${f}$. Calcule $f(${x})$.`,
        answer: { kind: 'number', value },
        hint: 'Remplace chaque $x$ par la valeur, au numérateur et au dénominateur.',
        correction: [`$f(${x}) = \\frac{${a} \\times ${par(x)} ${b < 0 ? '-' : '+'} ${Math.abs(b)}}{${par(x)} ${d > 0 ? '-' : '+'} ${Math.abs(d)}} = \\frac{${a * x + b}}{${x - d}} = ${fracLatex(value)}$`],
      };
    }
    const quad = level === 2;
    const value = quad ? a * k * k + b * k + c : a * k + c;
    const f = quad ? poly2(a, b, c) : affine(a, c);
    return {
      skill: '2nde-image',
      level,
      prompt: `Soit $f(x) = ${f}$. Calcule l'image de $${k}$ par $f$.`,
      answer: { kind: 'number', value: frac(value) },
      hint: 'L’image de $k$ est $f(k)$ : remplace $x$ par $k$.',
      correction: [
        quad
          ? `$f(${k}) = ${a} \\times ${par(k)}^2 ${b < 0 ? '-' : '+'} ${Math.abs(b)} \\times ${par(k)} ${c < 0 ? '-' : '+'} ${Math.abs(c)} = ${value}$`
          : `$f(${k}) = ${a} \\times ${par(k)} ${c < 0 ? '-' : '+'} ${Math.abs(c)} = ${value}$`,
      ],
    };
  },
};

const antecedentAffine: Skill = {
  id: '2nde-antecedent-affine',
  name: 'Trouver un antécédent par une fonction affine',
  generate(rng, level) {
    const a = level === 1 ? rng.nonZero(-5, 5) : rng.nonZero(-7, 7);
    const b = rng.int(-9, 9);
    const x = level === 3 ? frac(rng.nonZero(-9, 9), Math.abs(a)) : frac(rng.int(-6, 6));
    // y = a x + b, entier dans tous les cas.
    const y = (a * x.n) / x.d + b;
    return {
      skill: '2nde-antecedent-affine',
      level,
      prompt: `Soit $f(x) = ${affine(a, b)}$. Quel est l'antécédent de $${y}$ par $f$ ?`,
      answer: { kind: 'number', value: x },
      hint: 'Un antécédent de $y$ est un nombre $x$ tel que $f(x) = y$ : résous cette équation.',
      correction: [`$${affine(a, b)} = ${y}$`, `$${affine(a, 0)} = ${y - b}$`, `$x = \\frac{${y - b}}{${a}} = ${fracLatex(x)}$`],
    };
  },
};

const antecedentsCarre: Skill = {
  id: '2nde-antecedents-carre',
  name: 'Trouver les antécédents par une fonction du second degré',
  generate(rng, level) {
    // f(x) = (x - a)² + b ; antécédents de k : x = a ± √(k - b).
    const a = rng.int(-5, 5);
    const b = rng.int(-6, 6);
    const r = level === 1 ? rng.int(1, 4) : rng.int(0, 6);
    const none = level === 3 && rng.next() < 0.25;
    const k = none ? b - rng.int(1, 5) : b + r * r;
    const values = none ? [] : r === 0 ? [frac(a)] : [frac(a - r), frac(a + r)];
    const square = a === 0 ? 'x^2' : `(${affine(1, -a)})^2`;
    const f = `${square}${b === 0 ? '' : ` ${b < 0 ? '-' : '+'} ${Math.abs(b)}`}`;
    return {
      skill: '2nde-antecedents-carre',
      level,
      prompt: `Soit $f(x) = ${f}$. Quels sont les antécédents de $${k}$ par $f$ ?`,
      answer: { kind: 'set', values },
      hint: 'Résous $f(x) = k$ : isole le carré, puis pense à $X^2 = c$.',
      correction: none
        ? [`$${square} = ${k - b}$`, "Un carré n'est jamais négatif : aucun antécédent."]
        : r === 0
          ? [`$${square} = 0$`, `Un seul antécédent : $${a}$.`]
          : [`$${square} = ${r * r}$`, `$${affine(1, -a)} = ${r}$ ou $${affine(1, -a)} = -${r}$`, `Les antécédents sont $${a - r}$ et $${a + r}$.`],
    };
  },
};

/** Réels où ax + b est positif (ou négatif) : [-b/a ; +∞[ ou ]-∞ ; -b/a]. */
function affineSign(a: number, b: number, positive: boolean, strict: boolean): string {
  const root = frac(-b, a);
  const right = (a > 0) === positive;
  return right ? fracInterval(root, !strict, null, false) : fracInterval(null, false, root, !strict);
}

const signeAffine: Skill = {
  id: '2nde-signe-affine',
  name: 'Étudier le signe d’une fonction affine',
  generate(rng, level) {
    const a = level === 1 ? rng.pick([1, 2, 3, -1, -2]) : rng.nonZero(-6, 6);
    const b = level === 1 ? a * rng.int(-5, 5) : rng.int(-9, 9);
    const positive = rng.next() < 0.5;
    const strict = level === 3 ? rng.next() < 0.5 : true;
    const op = positive ? (strict ? '>' : '\\geq') : strict ? '<' : '\\leq';
    const correct = affineSign(a, b, positive, strict);
    const root = frac(-b, a);
    return {
      skill: '2nde-signe-affine',
      level,
      prompt: `Résous l'inéquation $${affine(a, b)} ${op} 0$.`,
      answer: latexChoice(
        rng,
        correct,
        [affineSign(a, b, !positive, strict), affineSign(-a, b, positive, strict), affineSign(a, b, positive, !strict), affineSign(a, -b, positive, strict)],
        () => fracInterval(frac(root.n + root.d, root.d), true, null, false),
      ),
      hint: 'Isole $x$. Attention : diviser par un nombre négatif change le sens de l’inégalité.',
      correction: [
        `$${affine(a, 0)} ${op} ${-b}$`,
        a < 0 ? `On divise par $${a} < 0$ : le sens de l'inégalité change.` : `On divise par $${a} > 0$.`,
        `$S = ${correct}$`,
      ],
    };
  },
};

/** Tableau de signes d'un produit (ax + b)(cx + d) : l'ensemble où il est ≤ 0 ou ≥ 0. */
const signeProduit: Skill = {
  id: '2nde-signe-produit',
  name: 'Résoudre une inéquation produit',
  generate(rng, level) {
    const a = level === 1 ? 1 : rng.pick([1, -1, 2]);
    const c = level === 3 ? rng.pick([1, -1, 2, -2]) : 1;
    let r1 = rng.int(-6, 6);
    let r2 = r1;
    while (r2 === r1) r2 = rng.int(-6, 6);
    if (r1 > r2) [r1, r2] = [r2, r1];
    const swap = rng.next() < 0.5;
    const [p, q] = swap ? [r2, r1] : [r1, r2];
    const f1 = affine(a, -a * p);
    const f2 = affine(c, -c * q);
    // Le produit a le signe de a·c à l'extérieur des racines.
    const lead = a * c;
    const positive = rng.next() < 0.5;
    const op = positive ? '\\geq' : '\\leq';
    const between = interval(r1, true, r2, true);
    const outside = `${interval(null, false, r1, true)} \\cup ${interval(r2, true, null, false)}`;
    const correct = (lead > 0) === positive ? outside : between;
    return {
      skill: '2nde-signe-produit',
      level,
      prompt: `Résous l'inéquation $(${f1})(${f2}) ${op} 0$.`,
      answer: latexChoice(
        rng,
        correct,
        [correct === outside ? between : outside, interval(r1, false, r2, false), `${interval(null, false, r1, false)} \\cup ${interval(r2, false, null, false)}`, interval(-r2, true, -r1, true)],
        () => interval(r1 - 1, true, r2, true),
      ),
      hint: 'Dresse le tableau de signes : une ligne par facteur, puis la règle des signes.',
      correction: [
        `$${f1}$ s'annule en $${p}$ et $${f2}$ en $${q}$.`,
        `Le produit est du signe de $${a} \\times ${par(c)} = ${lead}$ à l'extérieur de $[${r1}\\,;\\,${r2}]$, et du signe contraire entre.`,
        `$S = ${correct}$`,
      ],
    };
  },
};

const domaine: Skill = {
  id: '2nde-domaine',
  name: 'Trouver l’ensemble de définition',
  generate(rng, level) {
    const a = rng.int(-7, 7);
    const kind = level === 1 ? 'inverse' : rng.pick(['inverse', 'racine'] as const);
    const shifted = affine(1, -a);
    let correct: string;
    let decoys: string[];
    let f: string;
    let why: string;
    if (kind === 'inverse') {
      f = `\\frac{1}{${shifted}}`;
      correct = `\\mathbb{R} \\setminus \\{${a}\\}`;
      decoys = [`\\mathbb{R} \\setminus \\{${-a}\\}`, interval(a, false, null, false), interval(a, true, null, false), '\\mathbb{R}'];
      why = `On ne peut pas diviser par 0 : $${shifted} \\neq 0$, soit $x \\neq ${a}$.`;
    } else {
      const neg = level === 3 && rng.next() < 0.5;
      const inside = neg ? affine(-1, a) : shifted;
      f = `\\sqrt{${inside}}`;
      correct = neg ? interval(null, false, a, true) : interval(a, true, null, false);
      decoys = [
        neg ? interval(a, true, null, false) : interval(null, false, a, true),
        neg ? interval(null, false, a, false) : interval(a, false, null, false),
        neg ? interval(null, false, -a, true) : interval(-a, true, null, false),
        `\\mathbb{R} \\setminus \\{${a}\\}`,
      ];
      why = `Une racine carrée n'existe que pour un nombre positif ou nul : $${inside} \\geq 0$.`;
    }
    return {
      skill: '2nde-domaine',
      level,
      prompt: `Quel est l'ensemble de définition de $f(x) = ${f}$ ?`,
      answer: latexChoice(rng, correct, decoys, () => interval(a + 1, true, null, false)),
      hint: 'Repère les valeurs interdites : division par zéro, racine d’un nombre négatif.',
      correction: [why, `$\\mathcal{D}_f = ${correct}$`],
    };
  },
};

/* ---------- Variantes : d'autres façons de poser les mêmes notions ---------- */

const SIGNES = ['Strictement positif', 'Nul', 'Strictement négatif'];
const signeIndex = (v: number) => (v > 0 ? 0 : v === 0 ? 1 : 2);

const imageVariantes = [
  variant('programme', (rng, level) => {
    const a = rng.nonZero(-6, 6);
    const b = rng.int(1, 12);
    const k = rng.int(-6, 6);
    const square = level > 1;
    const value = square ? (k + a) ** 2 - b : 2 * (k + a) - b;
    return {
      prompt: `Programme de calcul : on choisit un nombre, on ${a > 0 ? `ajoute $${a}$` : `soustrait $${-a}$`}, on ${square ? 'met le résultat au carré' : 'multiplie le résultat par $2$'}, puis on soustrait $${b}$. Quel résultat obtient-on en choisissant $${k}$ ?`,
      answer: { kind: 'number', value: frac(value) },
      hint: 'Applique les étapes dans l’ordre, sans en sauter.',
      correction: [`$${k} ${a > 0 ? '+' : '-'} ${Math.abs(a)} = ${k + a}$`, square ? `$${par(k + a)}^2 = ${(k + a) ** 2}$` : `$2 \\times ${par(k + a)} = ${2 * (k + a)}$`, `$${square ? (k + a) ** 2 : 2 * (k + a)} - ${b} = ${value}$`],
    };
  }),
  variant('sur-la-courbe', (rng, level) => {
    const a = rng.nonZero(-3, 3);
    const b = rng.int(-5, 5);
    const c = rng.int(-6, 6);
    const k = rng.int(-4, 4);
    const fk = level === 1 ? a * k + c : a * k * k + b * k + c;
    const on = rng.next() < 0.5;
    const y = on ? fk : fk + rng.nonZero(-4, 4);
    const f = level === 1 ? affine(a, c) : poly2(a, b, c);
    return {
      prompt: `Soit $f(x) = ${f}$. Le point $A(${k}\\,;\\,${y})$ appartient-il à la courbe de $f$ ?`,
      answer: fixedChoice(['Oui', 'Non'], on ? 0 : 1),
      hint: '$A$ est sur la courbe si et seulement si $f(x_A) = y_A$.',
      correction: [`$f(${k}) = ${fk}$`, on ? `C'est bien $y_A$ : $A$ est sur la courbe.` : `$${fk} \\neq ${y}$ : $A$ n'est pas sur la courbe.`],
    };
  }),
  variant('cout', (rng, level) => {
    const fixe = rng.int(5, 40) * 10;
    const u = rng.int(2, level === 1 ? 9 : 25);
    const q = rng.int(10, 120);
    const quad = level === 3;
    const value = quad ? q * q / 10 + u * q + fixe : u * q + fixe;
    const C = quad ? `0{,}1x^2 + ${u}x + ${fixe}` : `${u}x + ${fixe}`;
    return {
      prompt: `Le coût de fabrication de $x$ objets est $C(x) = ${C}$ euros. Combien coûte la fabrication de $${q}$ objets, en euros ?`,
      answer: { kind: 'number', value: frac(Math.round(value * 10), 10) },
      hint: `Calcule $C(${q})$.`,
      correction: [`$C(${q}) = ${quad ? `0{,}1 \\times ${q}^2 + ` : ''}${u} \\times ${q} + ${fixe} = ${dec(value)}$`],
    };
  }),
];

const antecedentAffineVariantes = [
  variant('location', (rng, level) => {
    const a = rng.int(2, level === 1 ? 6 : 12);
    const b = rng.int(3, 20);
    const h = rng.int(1, 12);
    const prix = a * h + b;
    return {
      prompt: `La location d'un vélo coûte $f(x) = ${a}x + ${b}$ euros pour $x$ heures. Pendant combien d'heures peut-on le louer avec $${prix}$ € ?`,
      answer: { kind: 'number', value: frac(h) },
      hint: `Cherche l'antécédent de $${prix}$ : résous $f(x) = ${prix}$.`,
      correction: [`$${a}x + ${b} = ${prix}$`, `$${a}x = ${prix - b}$`, `$x = ${h}$`],
    };
  }),
  variant('tableau', (rng) => {
    const a = rng.nonZero(-4, 4);
    const b = rng.int(-6, 6);
    const xs = [-2, -1, 0, 1, 2, 3];
    const k = rng.pick(xs);
    const row = xs.map((x) => a * x + b);
    return {
      prompt: `Voici un tableau de valeurs de $f$ : $${xs.map((x, i) => `f(${x}) = ${row[i]}`).join(' ; ')}$. Quel est l'antécédent de $${a * k + b}$ par $f$ ?`,
      answer: { kind: 'number', value: frac(k) },
      hint: 'Cherche, dans la ligne des images, la valeur demandée, puis lis le $x$ correspondant.',
      correction: [`$f(${k}) = ${a * k + b}$, donc l'antécédent est $${k}$.`],
    };
  }),
];

const antecedentsCarreVariantes = [
  variant('combien', (rng) => {
    const a = rng.int(-5, 5);
    const b = rng.int(-6, 6);
    const kind = rng.pick([0, 1, 2, 2]);
    const k = kind === 0 ? b - rng.int(1, 6) : kind === 1 ? b : b + rng.int(1, 20);
    const square = a === 0 ? 'x^2' : `(${affine(1, -a)})^2`;
    return {
      prompt: `Soit $f(x) = ${square}${b === 0 ? '' : ` ${b < 0 ? '-' : '+'} ${Math.abs(b)}`}$. Combien le nombre $${k}$ a-t-il d'antécédents par $f$ ?`,
      answer: { kind: 'number', value: frac(kind) },
      hint: `Le minimum de $f$ est $${b}$ : compare $${k}$ à ce minimum.`,
      correction: [`$f(x) = ${k}$ équivaut à $${square} = ${k - b}$.`, kind === 0 ? 'Un carré n’est jamais négatif : aucun antécédent.' : kind === 1 ? 'Un carré est nul en un seul point : un antécédent.' : 'Un nombre strictement positif est le carré de deux nombres opposés : deux antécédents.'],
    };
  }),
  variant('forme-factorisee', (rng, level) => {
    const p = rng.int(-6, 6);
    let q = rng.int(-6, 6);
    if (level === 1 && q === p) q = p + 2;
    const f = `(${affine(1, -p)})(${affine(1, -q)})`;
    return {
      prompt: `Soit $f(x) = ${f}$. Quels sont les antécédents de $0$ par $f$ ?`,
      answer: { kind: 'set', values: p === q ? [frac(p)] : [frac(p), frac(q)] },
      hint: 'Un produit est nul si et seulement si l’un de ses facteurs est nul.',
      correction: [`$${f} = 0$ équivaut à $x = ${p}$ ou $x = ${q}$.`],
    };
  }),
];

const signeAffineVariantes = [
  variant('signe-en-un-point', (rng) => {
    const a = rng.nonZero(-6, 6);
    const b = rng.int(-9, 9);
    const k = rng.next() < 0.2 && b % a === 0 ? -b / a : rng.int(-6, 6);
    const v = a * k + b;
    return {
      prompt: `Soit $f(x) = ${affine(a, b)}$. Quel est le signe de $f(${k})$ ?`,
      answer: fixedChoice(SIGNES, signeIndex(v)),
      hint: 'Calcule $f(' + k + ')$, ou compare $' + k + '$ à la valeur qui annule $f$.',
      correction: [`$f(${k}) = ${v}$`, `C'est ${['strictement positif', 'nul', 'strictement négatif'][signeIndex(v)]}.`],
    };
  }),
  variant('benefice', (rng, level) => {
    const p = rng.int(3, level === 1 ? 10 : 25);
    const fixe = rng.int(20, 400);
    // B(x) = p x - fixe > 0 ⇔ x > fixe / p ; on cherche le plus petit entier.
    const n = Math.floor(fixe / p) + 1;
    return {
      prompt: `Un artisan vend des objets : son bénéfice est $B(x) = ${p}x - ${fixe}$ euros pour $x$ objets vendus. Combien d'objets doit-il vendre au minimum pour que son bénéfice soit strictement positif ?`,
      answer: { kind: 'number', value: frac(n) },
      hint: 'Résous $B(x) > 0$, puis prends le plus petit entier qui convient.',
      correction: [`$${p}x - ${fixe} > 0 \\iff x > \\frac{${fixe}}{${p}}$`, `$\\frac{${fixe}}{${p}} \\approx ${dec(Math.round((fixe / p) * 100) / 100)}$ : il faut au moins $${n}$ objets.`],
    };
  }),
];

const signeProduitVariantes = [
  variant('quotient', (rng, level) => {
    let p = rng.int(-6, 6);
    let q = p;
    while (q === p) q = rng.int(-6, 6);
    const positive = level === 1 ? true : rng.next() < 0.5;
    const op = positive ? '\\geq' : '\\leq';
    // (x - p)/(x - q) : q est interdite, p est incluse.
    const lo = Math.min(p, q);
    const hi = Math.max(p, q);
    const between = interval(lo, lo === p, hi, hi === p);
    const outside = `${interval(null, false, lo, lo === p)} \\cup ${interval(hi, hi === p, null, false)}`;
    const correct = positive ? outside : between;
      const betweenFerme = interval(lo, true, hi, true);
      const outsideFerme = `${interval(null, false, lo, true)} \\cup ${interval(hi, true, null, false)}`;
      return {
        prompt: `Résous l'inéquation $\\frac{${affine(1, -p)}}{${affine(1, -q)}} ${op} 0$.`,
        answer: latexChoice(rng, correct, [positive ? between : outside, positive ? outsideFerme : betweenFerme, positive ? betweenFerme : outsideFerme, interval(-hi, true, -lo, true)], () => interval(lo - 1, true, hi, false)),
      hint: `Tableau de signes, et attention : $${q}$ est une valeur interdite.`,
      correction: [`Le quotient s'annule en $${p}$ et n'existe pas en $${q}$.`, `Il est positif à l'extérieur de ces deux valeurs, négatif entre.`, `$S = ${correct}$`],
    };
  }),
  variant('signe-en-un-point', (rng) => {
    const p = rng.int(-6, 6);
    const q = rng.int(-6, 6);
    const k = rng.int(-7, 7);
    const v = (k - p) * (k - q);
    return {
      prompt: `Quel est le signe de $(${affine(1, -p)})(${affine(1, -q)})$ pour $x = ${k}$ ?`,
      answer: fixedChoice(SIGNES, signeIndex(v)),
      hint: 'Cherche le signe de chaque facteur, puis applique la règle des signes.',
      correction: [`$${k} - ${par(p)} = ${k - p}$ et $${k} - ${par(q)} = ${k - q}$.`, `Le produit vaut $${v}$.`],
    };
  }),
];

const domaineVariantes = [
  variant('valeur-interdite', (rng, level) => {
    const a = rng.nonZero(-5, 5);
    const b = rng.int(-9, 9);
    const c = level === 1 ? 1 : rng.nonZero(-4, 4);
    const d = rng.int(-9, 9);
    const x = frac(-d, c);
    return {
      prompt: `Quelle est la valeur interdite de la fonction $f(x) = \\frac{${affine(a, b)}}{${affine(c, d)}}$ ?`,
      answer: { kind: 'number', value: x },
      hint: 'C’est la valeur qui annule le dénominateur.',
      correction: [`$${affine(c, d)} = 0 \\iff x = ${fracLatex(x)}$`],
    };
  }),
  variant('appartient', (rng) => {
    const a = rng.int(-7, 7);
    const k = a + rng.int(-4, 4);
    const kind = rng.pick(['racine', 'inverse'] as const);
    const ok = kind === 'racine' ? k >= a : k !== a;
    const f = kind === 'racine' ? `\\sqrt{${affine(1, -a)}}` : `\\frac{1}{${affine(1, -a)}}`;
    return {
      prompt: `Peut-on calculer $f(${k})$ pour $f(x) = ${f}$ ?`,
      answer: fixedChoice(['Oui', 'Non'], ok ? 0 : 1),
      hint: 'Calcule ce qu’il y a sous la racine ou au dénominateur.',
      correction: [`Pour $x = ${k}$ : $${affine(1, -a).replace(/x/g, `${par(k)}`)} = ${k - a}$.`, ok ? 'Le calcul est possible.' : kind === 'racine' ? 'On ne peut pas prendre la racine d’un nombre négatif.' : 'On ne peut pas diviser par 0.'],
    };
  }),
];

export const ETUDE_FONCTIONS_SKILLS: Skill[] = [
  enrich(image, imageVariantes),
  enrich(antecedentAffine, antecedentAffineVariantes),
  enrich(antecedentsCarre, antecedentsCarreVariantes),
  enrich(signeAffine, signeAffineVariantes),
  enrich(signeProduit, signeProduitVariantes),
  enrich(domaine, domaineVariantes),
];
