import { frac, fracLatex } from '../fraction';
import type { Skill } from '../types';
import { affine, fracInterval, interval, latexChoice, par, poly2 } from './outils';

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

export const ETUDE_FONCTIONS_SKILLS: Skill[] = [image, antecedentAffine, antecedentsCarre, signeAffine, signeProduit, domaine];
