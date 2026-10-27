import { frac, fracLatex } from '../fraction';
import type { Rng } from '../rng';
import type { Level, Skill } from '../types';
import { variante, varier } from '../varier';
import { affine, fixedChoice, latexChoice, par, poly2, terms } from './outils';

/** Chapitre 3 de 2nde : développer, factoriser, équations, puissances et racines carrées. */

const coef = (rng: Rng, level: Level) => (level === 1 ? rng.int(1, 3) : level === 2 ? rng.nonZero(-4, 4) : rng.nonZero(-6, 6));

const developper: Skill = {
  id: '2nde-developper',
  name: 'Développer un produit',
  generate(rng, level) {
    const a = coef(rng, level);
    const b = rng.nonZero(-7, 7);
    const c = coef(rng, level);
    const d = rng.nonZero(-7, 7);
    const A = a * c;
    const B = a * d + b * c;
    const C = b * d;
    return {
      skill: '2nde-developper',
      level,
      prompt: `Développe et réduis $(${affine(a, b)})(${affine(c, d)})$.`,
      answer: latexChoice(
        rng,
        poly2(A, B, C),
        [poly2(A, a * d - b * c, C), poly2(A, B, -C), poly2(A, 0, C), poly2(A, B + 2, C), poly2(a + c, B, C)],
        () => poly2(A, B + rng.nonZero(-3, 3), C),
      ),
      hint: 'Multiplie chaque terme de la première parenthèse par chaque terme de la seconde (double distributivité).',
      correction: [
        `$(${affine(a, b)})(${affine(c, d)}) = ${par(a)}x \\times ${par(c)}x + ${par(a)}x \\times ${par(d)} + ${par(b)} \\times ${par(c)}x + ${par(b)} \\times ${par(d)}$`,
        `$= ${poly2(A, 0, 0)} ${a * d < 0 ? '-' : '+'} ${Math.abs(a * d)}x ${b * c < 0 ? '-' : '+'} ${Math.abs(b * c)}x ${C < 0 ? '-' : '+'} ${Math.abs(C)}$`,
        `$= ${poly2(A, B, C)}$`,
      ],
    };
  },
};

const identite: Skill = {
  id: '2nde-identite',
  name: 'Utiliser une identité remarquable',
  generate(rng, level) {
    const a = level === 1 ? 1 : rng.int(1, level === 2 ? 3 : 5);
    const b = rng.int(1, level === 3 ? 9 : 6);
    const kind = rng.pick(['plus', 'moins', 'diff'] as const);
    const ax = a === 1 ? 'x' : `${a}x`;
    let expr: string;
    let correct: string;
    let decoys: string[];
    let rule: string;
    if (kind === 'diff') {
      expr = `(${ax} - ${b})(${ax} + ${b})`;
      correct = poly2(a * a, 0, -b * b);
      decoys = [poly2(a * a, 0, b * b), poly2(a * a, -2 * a * b, -b * b), poly2(a, 0, -b)];
      rule = '(a - b)(a + b) = a^2 - b^2';
    } else {
      const s = kind === 'plus' ? 1 : -1;
      expr = `(${ax} ${s > 0 ? '+' : '-'} ${b})^2`;
      correct = poly2(a * a, 2 * s * a * b, b * b);
      decoys = [poly2(a * a, 0, b * b), poly2(a * a, s * a * b, b * b), poly2(a * a, 2 * s * a * b, -b * b), poly2(a * a, -2 * s * a * b, b * b)];
      rule = s > 0 ? '(a + b)^2 = a^2 + 2ab + b^2' : '(a - b)^2 = a^2 - 2ab + b^2';
    }
    return {
      skill: '2nde-identite',
      level,
      prompt: `Développe $${expr}$.`,
      answer: latexChoice(rng, correct, decoys, () => poly2(a * a, rng.nonZero(-9, 9), b * b)),
      hint: 'Pense aux identités remarquables, et n’oublie pas le double produit.',
      correction: [`On utilise $${rule}$ avec $a = ${ax}$ et $b = ${b}$.`, `$${expr} = ${correct}$`],
    };
  },
};

const factoriser: Skill = {
  id: '2nde-factoriser',
  name: 'Factoriser une expression',
  generate(rng, level) {
    if (level === 1 || rng.next() < 0.4) {
      // a²x² - b² = (ax - b)(ax + b)
      const a = level === 1 ? 1 : rng.int(1, 5);
      const b = rng.int(1, 9);
      const ax = a === 1 ? 'x' : `${a}x`;
      const correct = `(${ax} - ${b})(${ax} + ${b})`;
      return {
        skill: '2nde-factoriser',
        level,
        prompt: `Factorise $${poly2(a * a, 0, -b * b)}$.`,
        answer: latexChoice(rng, correct, [`(${ax} - ${b})^2`, `(${ax} + ${b})^2`, `(${ax} - ${b * b})(${ax} + ${b * b})`, ...(a === 1 ? [] : [`${a * a}(x - ${b})(x + ${b})`])], () => `(${ax} - ${b + 1})(${ax} + ${b + 1})`),
        hint: 'Reconnais une différence de deux carrés : $a^2 - b^2 = (a - b)(a + b)$.',
        correction: [`$${poly2(a * a, 0, -b * b)} = ${a === 1 ? 'x' : `(${ax})`}^2 - ${b}^2$`, `$= ${correct}$`],
      };
    }
    // (x + p)(ax + b) + (x + p)(cx + d) = (x + p)((a + c)x + b + d)
    const p = rng.nonZero(-6, 6);
    const minus = level === 3 && rng.next() < 0.6;
    const a = rng.nonZero(-4, 4);
    const b = rng.nonZero(-6, 6);
    let c = a;
    // Le facteur restant doit garder un terme en x.
    while (c === (minus ? a : -a)) c = rng.nonZero(-4, 4);
    const d = rng.nonZero(-6, 6);
    const common = `(${affine(1, p)})`;
    const expr = `${common}(${affine(a, b)}) ${minus ? '-' : '+'} ${common}(${affine(c, d)})`;
    const c2 = minus ? -c : c;
    const d2 = minus ? -d : d;
    const correct = `${common}(${affine(a + c2, b + d2)})`;
    const wrongSign = `${common}(${affine(a + (minus ? c : -c), b + (minus ? d : -d))})`;
    return {
      skill: '2nde-factoriser',
      level,
      prompt: `Factorise $${expr}$.`,
      answer: latexChoice(
        rng,
        correct,
        [wrongSign, `${common}(${affine(a + c2, b - d2)})`, `${common}^2(${affine(a + c2, b + d2)})`, `(${affine(1, -p)})(${affine(a + c2, b + d2)})`],
        () => `${common}(${affine(a + c2 + rng.nonZero(-2, 2), b + d2)})`,
      ),
      hint: `Repère le facteur commun $${common}$, puis regroupe ce qui reste${minus ? ' en faisant attention au signe moins' : ''}.`,
      correction: [
        `Le facteur commun est $${common}$.`,
        `$${expr} = ${common}\\left[(${affine(a, b)}) ${minus ? '-' : '+'} (${affine(c, d)})\\right]$`,
        `$= ${correct}$`,
      ],
    };
  },
};

const equation1: Skill = {
  id: '2nde-equation-1',
  name: 'Résoudre une équation du premier degré',
  generate(rng, level) {
    // ax + b = cx + d, avec a ≠ c ; en niveau 3 la solution est une fraction.
    const a = rng.nonZero(-9, 9);
    const den = level === 3 ? rng.pick([2, 3, 4, 5]) : 1;
    const c = level === 1 ? 0 : a + den * rng.pick([-1, 1]) * (level === 3 ? 1 : rng.int(1, 3));
    let x = frac(rng.int(-9, 9));
    if (level === 3) while (x.d === 1) x = frac(rng.nonZero(-12, 12), den);
    const d = rng.int(-15, 15);
    // b = (c - a)x + d est entier car le dénominateur de x divise c - a.
    const b = ((c - a) * x.n) / x.d + d;
    const left = affine(a, b);
    const right = affine(c, d);
    return {
      skill: '2nde-equation-1',
      level,
      prompt: `Résous l'équation $${left} = ${right}$.`,
      answer: { kind: 'number', value: x },
      hint: 'Regroupe les termes en $x$ d’un côté et les nombres de l’autre, puis divise par le coefficient de $x$.',
      correction: [
        `On regroupe : $${terms([[a, 'x'], [-c, 'x']])} = ${terms([[d, ''], [-b, '']])}$`,
        `$${affine(a - c, 0)} = ${d - b}$`,
        `$x = \\frac{${d - b}}{${a - c}} = ${fracLatex(x)}$`,
      ],
    };
  },
};

const produitNul: Skill = {
  id: '2nde-produit-nul',
  name: 'Résoudre une équation produit nul',
  generate(rng, level) {
    const a = level === 1 ? 1 : rng.nonZero(-4, 4);
    const c = level === 1 ? 1 : rng.nonZero(-5, 5);
    const b = rng.nonZero(-9, 9);
    const d = rng.nonZero(-9, 9);
    const r1 = frac(-b, a);
    const r2 = frac(-d, c);
    const same = r1.n === r2.n && r1.d === r2.d;
    return {
      skill: '2nde-produit-nul',
      level,
      prompt: `Résous l'équation $(${affine(a, b)})(${affine(c, d)}) = 0$.`,
      answer: { kind: 'set', values: same ? [r1] : [r1, r2] },
      hint: 'Un produit est nul si et seulement si l’un au moins de ses facteurs est nul.',
      correction: [
        `$${affine(a, b)} = 0$ ou $${affine(c, d)} = 0$`,
        `$x = ${fracLatex(r1)}$ ou $x = ${fracLatex(r2)}$`,
        same ? `Les deux facteurs s'annulent pour la même valeur : $S = \\{${fracLatex(r1)}\\}$.` : `$S = \\{${fracLatex(r1)}\\,;\\,${fracLatex(r2)}\\}$`,
      ],
    };
  },
};

const puissances: Skill = {
  id: '2nde-puissances',
  name: 'Calculer avec des puissances',
  generate(rng, level) {
    const base = rng.pick([2, 3, 5, 10]);
    const m = rng.int(level === 1 ? 1 : -5, 8);
    const n = rng.int(level === 1 ? 1 : -5, 8);
    const p = level === 1 ? 0 : rng.int(-4, 6);
    const q = level === 3 ? rng.pick([2, 3]) : 1;
    const k = (m + n - p) * q;
    const e = (v: number) => (v < 0 ? `{${v}}` : `${v}`);
    const inner = p === 0 ? `${base}^${e(m)} \\times ${base}^${e(n)}` : `\\frac{${base}^${e(m)} \\times ${base}^${e(n)}}{${base}^${e(p)}}`;
    const expr = q === 1 ? inner : `\\left(${inner}\\right)^${q}`;
    return {
      skill: '2nde-puissances',
      level,
      prompt: `On a $${expr} = ${base}^k$. Que vaut $k$ ?`,
      answer: { kind: 'number', value: frac(k) },
      hint: '$a^m \\times a^n = a^{m+n}$, $\\frac{a^m}{a^p} = a^{m-p}$ et $(a^m)^q = a^{mq}$.',
      correction: [
        `Au numérateur : $${base}^{${m} + ${par(n)}} = ${base}^{${m + n}}$.`,
        ...(p === 0 ? [] : [`On divise : $${base}^{${m + n} - ${par(p)}} = ${base}^{${m + n - p}}$.`]),
        ...(q === 1 ? [] : [`Puis la puissance : $(${base}^{${m + n - p}})^${q} = ${base}^{${k}}$.`]),
        `Donc $k = ${k}$.`,
      ],
    };
  },
};

const racines: Skill = {
  id: '2nde-racines',
  name: 'Simplifier une racine carrée',
  generate(rng, level) {
    const b = rng.pick(level === 1 ? [2, 3, 5] : [2, 3, 5, 6, 7, 10]);
    const a = rng.int(2, level === 1 ? 5 : level === 2 ? 7 : 12);
    const n = a * a * b;
    return {
      skill: '2nde-racines',
      level,
      prompt: `Écris $\\sqrt{${n}}$ sous la forme $a\\sqrt{b}$, avec $a$ et $b$ entiers et $b$ le plus petit possible.`,
      answer: { kind: 'pair', values: [frac(a), frac(b)], labels: ['a', 'b'] },
      hint: `Cherche le plus grand carré parfait qui divise $${n}$, puis utilise $\\sqrt{xy} = \\sqrt{x}\\sqrt{y}$.`,
      correction: [`$${n} = ${a * a} \\times ${b}$ et $${a * a} = ${a}^2$.`, `$\\sqrt{${n}} = \\sqrt{${a * a}} \\times \\sqrt{${b}} = ${a}\\sqrt{${b}}$`],
    };
  },
};

const fractions: Skill = {
  id: '2nde-fractions',
  name: 'Calculer avec des fractions',
  generate(rng, level) {
    const d1 = rng.int(2, level === 1 ? 6 : 9);
    let d2 = rng.int(2, level === 1 ? 6 : 9);
    if (level === 1) d2 = d1 * rng.int(1, 2);
    const n1 = rng.nonZero(-9, 9);
    const n2 = rng.nonZero(-9, 9);
    const op = level === 3 ? rng.pick(['+', '-', '\\times', '\\div'] as const) : rng.pick(['+', '-'] as const);
    let result;
    let steps: string[];
    const raw = (n: number, d: number) => `${n < 0 ? '-' : ''}\\frac{${Math.abs(n)}}{${d}}`;
    const f1 = raw(n1, d1);
    if (op === '+' || op === '-') {
      const s = op === '+' ? 1 : -1;
      result = frac(n1 * d2 + s * n2 * d1, d1 * d2);
      steps = [`On met au même dénominateur, puis on ${op === '+' ? 'additionne' : 'soustrait'} les numérateurs.`];
    } else if (op === '\\times') {
      result = frac(n1 * n2, d1 * d2);
      steps = ['On multiplie les numérateurs entre eux et les dénominateurs entre eux.'];
    } else {
      result = frac(n1 * d2, d1 * n2);
      steps = ['Diviser, c’est multiplier par l’inverse.'];
    }
    const second = n2 < 0 ? `\\left(${raw(n2, d2)}\\right)` : raw(n2, d2);
    return {
      skill: '2nde-fractions',
      level,
      prompt: `Calcule $${f1} ${op} ${second}$ et donne le résultat sous forme irréductible.`,
      answer: { kind: 'number', value: result },
      hint: op === '+' || op === '-' ? 'Mets les deux fractions au même dénominateur.' : 'Pense à simplifier à la fin.',
      correction: [...steps, `$${f1} ${op} ${second} = ${fracLatex(result)}$`],
    };
  },
};

/* ---------- Variantes : d'autres façons de poser les mêmes notions ---------- */

const vraiFaux = (b: boolean) => fixedChoice(['Vrai', 'Faux'], b ? 0 : 1);

const developperVariantes = [
  variante('coefficient', (rng, level) => {
    const a = coef(rng, level);
    const b = rng.nonZero(-9, 9);
    const c = coef(rng, level);
    const d = rng.nonZero(-9, 9);
    const which = rng.pick(['x^2', 'x', 'constant'] as const);
    const value = which === 'x^2' ? a * c : which === 'x' ? a * d + b * c : b * d;
    return {
      prompt: `Sans tout développer, donne ${which === 'constant' ? 'le terme constant' : `le coefficient de $${which}$`} dans le développement de $(${affine(a, b)})(${affine(c, d)})$.`,
      answer: { kind: 'number', value: frac(value) },
      hint: which === 'x' ? 'Les termes en $x$ viennent de deux produits croisés : additionne-les.' : 'Un seul produit de deux termes donne ce terme-là.',
      correction: [
        which === 'x^2'
          ? `$${par(a)}x \\times ${par(c)}x = ${a * c}x^2$`
          : which === 'x'
            ? `$${par(a)}x \\times ${par(d)} + ${par(b)} \\times ${par(c)}x = ${a * d}x + ${par(b * c)}x = ${a * d + b * c}x$`
            : `$${par(b)} \\times ${par(d)} = ${b * d}$`,
        `La réponse est $${value}$.`,
      ],
    };
  }),
  variante('verifier-calcul', (rng, level) => {
    const a = coef(rng, level);
    const b = rng.nonZero(-7, 7);
    const c = coef(rng, level);
    const d = rng.nonZero(-7, 7);
    const B = a * d + b * c;
    const juste = rng.next() < 0.4;
    // Erreurs classiques : oubli d'un produit croisé, signe du terme constant.
    const faux = rng.pick([poly2(a * c, a * d, b * d), poly2(a * c, B, -b * d), poly2(a * c, b * c, b * d), poly2(a + c, B, b * d)].filter((p) => p !== poly2(a * c, B, b * d)));
    const shown = juste ? poly2(a * c, B, b * d) : faux;
    return {
      prompt: `Sami a écrit : $(${affine(a, b)})(${affine(c, d)}) = ${shown}$. Son développement est-il juste ?`,
      answer: vraiFaux(juste),
      hint: 'Refais la double distributivité : quatre produits, puis on réduit.',
      correction: [`$(${affine(a, b)})(${affine(c, d)}) = ${poly2(a * c, B, b * d)}$`, juste ? 'Sami a raison.' : 'Sami s’est trompé.'],
    };
  }),
  variante('aire-rectangle', (rng, level) => {
    const p = rng.int(1, 9);
    const q = level === 1 ? rng.int(1, 9) : rng.int(-5, 9) || 2;
    const k = level === 3 ? rng.int(2, 3) : 1;
    const A = k;
    const B = k * q + p;
    const C = p * q;
    const side1 = affine(k, p);
    const side2 = affine(1, q);
    return {
      prompt: `Un rectangle mesure $${side1}$ sur $${side2}$ (avec $x$ assez grand). Quelle est l'expression développée et réduite de son aire ?`,
      answer: latexChoice(rng, poly2(A, B, C), [poly2(A, B - p, C), poly2(A, 0, C), poly2(A + 1, B, C), affine(2 * (k + 1), 2 * (p + q))], () => poly2(A, B + rng.nonZero(-3, 3), C)),
      hint: 'L’aire d’un rectangle est longueur × largeur : développe le produit.',
      correction: [`$\\mathcal{A} = (${side1})(${side2})$`, `$= ${poly2(A, B, C)}$`],
    };
  }),
];

const identiteVariantes = [
  variante('calcul-mental', (rng, level) => {
    const base = rng.pick(level === 1 ? [10, 20, 30, 100] : [20, 30, 40, 50, 100, 1000]);
    const e = rng.int(1, level === 1 ? 2 : 4);
    const kind = rng.pick(['plus', 'moins', 'diff'] as const);
    const expr = kind === 'plus' ? `${base + e}^2` : kind === 'moins' ? `${base - e}^2` : `${base + e} \\times ${base - e}`;
    const value = kind === 'plus' ? (base + e) ** 2 : kind === 'moins' ? (base - e) ** 2 : base * base - e * e;
    const rule = kind === 'plus' ? `(${base} + ${e})^2 = ${base * base} + ${2 * base * e} + ${e * e}` : kind === 'moins' ? `(${base} - ${e})^2 = ${base * base} - ${2 * base * e} + ${e * e}` : `(${base} + ${e})(${base} - ${e}) = ${base * base} - ${e * e}`;
    return {
      prompt: `Calcule mentalement $${expr}$ grâce à une identité remarquable.`,
      answer: { kind: 'number', value: frac(value) },
      hint: `Écris le nombre autour de $${base}$, puis utilise une identité remarquable.`,
      correction: [`$${rule}$`, `$= ${value}$`],
    };
  }),
  variante('double-produit', (rng, level) => {
    const a = level === 1 ? 1 : rng.int(1, 4);
    const b = rng.int(1, 9);
    const s = rng.sign();
    const ax = a === 1 ? 'x' : `${a}x`;
    return {
      prompt: `Complète pour que l'égalité soit vraie pour tout $x$ : $${a * a === 1 ? '' : a * a}x^2 ${s > 0 ? '+' : '-'} \\ldots x + ${b * b} = (${ax} ${s > 0 ? '+' : '-'} ${b})^2$. Quel nombre manque-t-il (sans le signe) ?`,
      answer: { kind: 'number', value: frac(2 * a * b) },
      hint: 'C’est le double produit $2ab$.',
      correction: [`$2 \\times ${ax} \\times ${b} = ${2 * a * b}x$`, `Il manque $${2 * a * b}$.`],
    };
  }),
  variante('erreur-classique', (rng, level) => {
    const a = level === 1 ? 1 : rng.int(1, 3);
    const b = rng.int(1, 8);
    const ax = a === 1 ? 'x' : `${a}x`;
    const juste = rng.next() < 0.35;
    const shown = juste ? poly2(a * a, 2 * a * b, b * b) : rng.pick([poly2(a * a, 0, b * b), poly2(a * a, a * b, b * b), poly2(a, 2 * a * b, b * b)].filter((p) => p !== poly2(a * a, 2 * a * b, b * b)));
    return {
      prompt: `Vrai ou faux : pour tout réel $x$, $(${ax} + ${b})^2 = ${shown}$.`,
      answer: vraiFaux(juste),
      hint: `Teste avec $x = 1$, ou souviens-toi du double produit.`,
      correction: [`$(${ax} + ${b})^2 = ${poly2(a * a, 2 * a * b, b * b)}$`, juste ? 'C’est vrai.' : 'C’est faux : il ne faut pas oublier le double produit ni mettre au carré tout le terme en $x$.'],
    };
  }),
];

const factoriserVariantes = [
  variante('carre-parfait', (rng, level) => {
    const a = level === 1 ? 1 : rng.int(1, 3);
    const b = rng.int(1, 9);
    const s = rng.sign();
    const ax = a === 1 ? 'x' : `${a}x`;
    const correct = `(${ax} ${s > 0 ? '+' : '-'} ${b})^2`;
    return {
      prompt: `Factorise $${poly2(a * a, 2 * s * a * b, b * b)}$.`,
      answer: latexChoice(rng, correct, [`(${ax} ${s > 0 ? '-' : '+'} ${b})^2`, `(${ax} - ${b})(${ax} + ${b})`, `(${ax} ${s > 0 ? '+' : '-'} ${b * b})^2`, `(${ax} ${s > 0 ? '+' : '-'} ${2 * b})^2`], () => `(${ax} + ${b + rng.int(1, 3)})^2`),
      hint: 'Trois termes dont deux carrés : pense à $a^2 + 2ab + b^2$ ou $a^2 - 2ab + b^2$.',
      correction: [`$${poly2(a * a, 2 * s * a * b, b * b)} = (${ax})^2 ${s > 0 ? '+' : '-'} 2 \\times ${ax} \\times ${b} + ${b}^2$`, `$= ${correct}$`],
    };
  }),
  variante('facteur-x', (rng, level) => {
    const k = level === 1 ? 1 : rng.int(1, 4);
    const a = rng.nonZero(-5, 5);
    const b = rng.nonZero(-9, 9);
    // kx(ax + b) = k a x² + k b x
    const kx = k === 1 ? 'x' : `${k}x`;
    const correct = `${kx}(${affine(a, b)})`;
    return {
      prompt: `Factorise au maximum $${poly2(k * a, k * b, 0)}$.`,
      answer: latexChoice(
        rng,
        correct,
        [`x(${affine(k * a, k * b)})`, `${kx}(${affine(a, k * b)})`, `${kx}^2(${affine(a, b)})`, `${kx}(${affine(a, -b)})`].filter((o) => k !== 1 || o !== `x(${affine(k * a, k * b)})`),
        () => `${kx}(${affine(a + rng.nonZero(-2, 2), b)})`,
      ),
      hint: 'Les deux termes contiennent $x$, et leurs coefficients ont peut-être un diviseur commun.',
      correction: [`Le facteur commun est $${kx}$.`, `$${poly2(k * a, k * b, 0)} = ${correct}$`],
    };
  }),
];

const equationVariantes = [
  variante('nombre-mystere', (rng, level) => {
    const a = rng.int(2, level === 1 ? 5 : 9);
    const b = rng.int(-15, 15) || 7;
    const x = level === 3 ? frac(rng.nonZero(-20, 20), 2) : frac(rng.int(-10, 15));
    const c = frac(a * x.n + b * x.d, x.d);
    return {
      prompt: `Je pense à un nombre. Je le multiplie par $${a}$, puis j'${b > 0 ? `ajoute $${b}$` : `enlève $${-b}$`}, et je trouve $${fracLatex(c)}$. Quel est ce nombre ?`,
      answer: { kind: 'number', value: x },
      hint: 'Appelle $x$ le nombre, écris l’équation, puis résous-la.',
      correction: [`$${a}x ${b > 0 ? '+' : '-'} ${Math.abs(b)} = ${fracLatex(c)}$`, `$${a}x = ${fracLatex(frac(c.n - b * c.d, c.d))}$`, `$x = ${fracLatex(x)}$`],
    };
  }),
  variante('tarifs', (rng, level) => {
    // Formule A : abonnement f + p par séance ; formule B : q par séance (q > p).
    const p = rng.int(2, level === 1 ? 5 : 9);
    const n = rng.int(level === 1 ? 4 : 6, level === 1 ? 12 : 30);
    const q = p + rng.int(1, 4);
    const f = (q - p) * n;
    return {
      prompt: `À la piscine, la formule A coûte $${f}$ € d'abonnement puis $${p}$ € par entrée ; la formule B coûte $${q}$ € par entrée, sans abonnement. Pour combien d'entrées les deux formules coûtent-elles le même prix ?`,
      answer: { kind: 'number', value: frac(n) },
      hint: 'Appelle $x$ le nombre d’entrées et écris le prix de chaque formule.',
      correction: [`$${f} + ${p}x = ${q}x$`, `$${f} = ${q - p}x$`, `$x = ${n}$`],
    };
  }),
  variante('est-solution', (rng, level) => {
    const a = rng.nonZero(-6, 6);
    let c = level === 1 ? 0 : rng.nonZero(-6, 6);
    if (c === a) c = a + 1;
    const x0 = rng.int(-6, 6);
    const d = rng.int(-12, 12);
    const b = (c - a) * x0 + d;
    const juste = rng.next() < 0.5;
    const test = juste ? x0 : x0 + rng.nonZero(-3, 3);
    return {
      prompt: `Le nombre $${test}$ est-il solution de l'équation $${affine(a, b)} = ${affine(c, d)}$ ?`,
      answer: fixedChoice(['Oui', 'Non'], juste ? 0 : 1),
      hint: 'Remplace $x$ par ce nombre dans chaque membre et compare.',
      correction: [
        `À gauche : $${a} \\times ${par(test)} ${b < 0 ? '-' : '+'} ${Math.abs(b)} = ${a * test + b}$. À droite : $${c} \\times ${par(test)} ${d < 0 ? '-' : '+'} ${Math.abs(d)} = ${c * test + d}$.`,
        juste ? 'Les deux membres sont égaux : c’est une solution.' : 'Les deux membres sont différents : ce n’est pas une solution.',
      ],
    };
  }),
];

const produitNulVariantes = [
  variante('facteur-commun', (rng, level) => {
    const a = level === 1 ? 1 : rng.nonZero(-4, 4);
    const k = rng.nonZero(-9, 9);
    // a x² = a k x ⇔ a x (x - k) = 0
    return {
      prompt: `Résous dans $\\mathbb{R}$ l'équation $${terms([[a, 'x^2']])} = ${terms([[a * k, 'x']])}$.`,
      answer: { kind: 'set', values: [frac(0), frac(k)] },
      hint: 'Ne divise surtout pas par $x$ : passe tout du même côté et factorise.',
      correction: [`$${poly2(a, -a * k, 0)} = 0$`, `$${a === 1 ? '' : a === -1 ? '-' : a}x(${affine(1, -k)}) = 0$`, `$x = 0$ ou $x = ${k}$.`],
    };
  }),
  variante('difference-carres', (rng, level) => {
    const p = rng.int(-6, 6);
    const b = rng.int(1, level === 1 ? 5 : 9);
    const inner = affine(1, p);
    return {
      prompt: `Résous dans $\\mathbb{R}$ l'équation $(${inner})^2 - ${b * b} = 0$.`,
      answer: { kind: 'set', values: [frac(-p - b), frac(-p + b)] },
      hint: 'Reconnais $A^2 - B^2 = (A - B)(A + B)$.',
      correction: [`$(${inner} - ${b})(${inner} + ${b}) = 0$`, `$x = ${-p + b}$ ou $x = ${-p - b}$.`],
    };
  }),
  variante('quotient-nul', (rng, level) => {
    const a = level === 1 ? 1 : rng.nonZero(-3, 3);
    const b = rng.nonZero(-9, 9);
    const c = rng.int(-6, 6);
    const root = frac(-b, a);
    const forbidden = root.d === 1 && root.n === c;
    const den = affine(1, -c);
    return {
      prompt: `Résous dans $\\mathbb{R}$ l'équation $\\frac{${affine(a, b)}}{${den}} = 0$.`,
      answer: { kind: 'set', values: forbidden ? [] : [root] },
      hint: 'Un quotient est nul quand son numérateur est nul… et que son dénominateur ne l’est pas.',
      correction: [`Valeur interdite : $x = ${c}$.`, `$${affine(a, b)} = 0$ donne $x = ${fracLatex(root)}$.`, forbidden ? 'C’est justement la valeur interdite : $S = \\varnothing$.' : `$S = \\{${fracLatex(root)}\\}$`],
    };
  }),
];

const puissancesVariantes = [
  variante('ecriture-scientifique', (rng, level) => {
    let m = rng.int(11, 99);
    if (m % 10 === 0) m++;
    const digits = String(m);
    // Le nombre vaut m × 10^shift, soit d,d × 10^(shift + 1).
    const shift = rng.int(level === 1 ? 0 : -9, level === 1 ? 5 : 8);
    let written: string;
    if (shift >= 0) written = (digits + '0'.repeat(shift)).replace(/\B(?=(\d{3})+(?!\d))/g, '\\,');
    else if (shift === -1) written = `${digits[0]}{,}${digits[1]}`;
    else written = `0{,}${'0'.repeat(-shift - 2)}${digits}`;
    return {
      prompt: `On écrit $${written}$ en notation scientifique sous la forme $${digits[0]}{,}${digits[1]} \\times 10^n$. Que vaut $n$ ?`,
      answer: { kind: 'number', value: frac(shift + 1) },
      hint: 'Compte de combien de rangs il faut déplacer la virgule pour n’avoir qu’un chiffre non nul avant elle.',
      correction: [`$${written} = ${digits[0]}{,}${digits[1]} \\times 10^{${shift + 1}}$`, `Donc $n = ${shift + 1}$.`],
    };
  }),
  variante('vrai-faux', (rng, level) => {
    const a = rng.pick([2, 3, 5, 10]);
    const m = rng.int(2, level === 1 ? 4 : 6);
    const n = rng.int(2, level === 1 ? 4 : 6);
    const kind = rng.pick(['produit', 'puissance', 'somme', 'quotient'] as const);
    let shown: string;
    let juste: boolean;
    let rule: string;
    if (kind === 'produit') {
      juste = rng.next() < 0.5;
      shown = `${a}^{${m}} \\times ${a}^{${n}} = ${a}^{${juste ? m + n : m * n}}`;
      rule = 'a^m \\times a^n = a^{m+n}';
      if (m + n === m * n) juste = true;
    } else if (kind === 'puissance') {
      juste = rng.next() < 0.5;
      shown = `(${a}^{${m}})^{${n}} = ${a}^{${juste ? m * n : m + n}}`;
      rule = '(a^m)^n = a^{mn}';
      if (m + n === m * n) juste = true;
    } else if (kind === 'somme') {
      juste = false;
      shown = `${a}^{${m}} + ${a}^{${n}} = ${a}^{${m + n}}`;
      rule = 'il n’y a pas de règle pour une somme de puissances';
    } else {
      juste = rng.next() < 0.5;
      // Erreur classique : diviser les exposants au lieu de les soustraire.
      juste = rng.next() < 0.5 || n * (m - 1) === m;
      shown = `\\frac{${a}^{${m * n}}}{${a}^{${n}}} = ${a}^{${juste ? n * (m - 1) : m}}`;
      rule = '\\frac{a^m}{a^n} = a^{m-n}';
    }
    return {
      prompt: `Vrai ou faux : $${shown}$.`,
      answer: vraiFaux(juste),
      hint: 'Rappelle-toi les règles : $a^m \\times a^n = a^{m+n}$, $(a^m)^n = a^{mn}$, $\\frac{a^m}{a^n} = a^{m-n}$.',
      correction: [kind === 'somme' ? `Faux : ${rule} (par exemple $${a}^{${m}} + ${a}^{${n}} = ${a ** m + a ** n}$).` : `On utilise $${rule}$.`, juste ? 'L’égalité est vraie.' : 'L’égalité est fausse.'],
    };
  }),
];

const racinesVariantes = [
  variante('somme', (rng, level) => {
    const b = rng.pick([2, 3, 5, 7]);
    const p = rng.int(1, level === 1 ? 4 : 6);
    const q = rng.int(1, level === 1 ? 4 : 6);
    const s = level === 1 ? 1 : rng.sign();
    const k = p + s * q;
    return {
      prompt: `Écris $\\sqrt{${p * p * b}} ${s > 0 ? '+' : '-'} \\sqrt{${q * q * b}}$ sous la forme $k\\sqrt{${b}}$. Que vaut $k$ ?`,
      answer: { kind: 'number', value: frac(k) },
      hint: `Simplifie chaque racine pour faire apparaître $\\sqrt{${b}}$.`,
      correction: [`$\\sqrt{${p * p * b}} = ${p}\\sqrt{${b}}$ et $\\sqrt{${q * q * b}} = ${q}\\sqrt{${b}}$.`, `$${p}\\sqrt{${b}} ${s > 0 ? '+' : '-'} ${q}\\sqrt{${b}} = ${k}\\sqrt{${b}}$`],
    };
  }),
  variante('produit', (rng, level) => {
    const b = rng.pick([2, 3, 5, 6, 7]);
    const p = rng.int(1, level === 1 ? 3 : 6);
    const q = rng.int(1, level === 1 ? 3 : 6);
    return {
      prompt: `Calcule $\\sqrt{${p * p * b}} \\times \\sqrt{${q * q * b}}$.`,
      answer: { kind: 'number', value: frac(p * q * b) },
      hint: '$\\sqrt{a} \\times \\sqrt{b} = \\sqrt{ab}$ pour $a$ et $b$ positifs.',
      correction: [`$\\sqrt{${p * p * b} \\times ${q * q * b}} = \\sqrt{${p * p * q * q * b * b}} = ${p * q * b}$`],
    };
  }),
  variante('vrai-faux', (rng, level) => {
    const [a, b] = rng.pick(
      level === 1
        ? [
            [9, 16],
            [36, 64],
            [4, 9],
          ]
        : [
            [9, 16],
            [36, 64],
            [25, 144],
            [4, 9],
            [16, 49],
          ],
    );
    const kind = rng.pick(['somme', 'produit', 'quotient'] as const);
    const ra = Math.sqrt(a);
    const rb = Math.sqrt(b);
    const shown = kind === 'somme' ? `\\sqrt{${a} + ${b}} = \\sqrt{${a}} + \\sqrt{${b}}` : kind === 'produit' ? `\\sqrt{${a} \\times ${b}} = \\sqrt{${a}} \\times \\sqrt{${b}}` : `\\sqrt{\\frac{${a}}{${b}}} = \\frac{\\sqrt{${a}}}{\\sqrt{${b}}}`;
    const juste = kind !== 'somme';
    return {
      prompt: `Vrai ou faux : $${shown}$.`,
      answer: vraiFaux(juste),
      hint: 'Calcule chaque membre : ce sont des carrés parfaits.',
      correction:
        kind === 'somme'
          ? [`$\\sqrt{${a + b}} ${Number.isInteger(Math.sqrt(a + b)) ? `= ${Math.sqrt(a + b)}` : ''}$ mais $\\sqrt{${a}} + \\sqrt{${b}} = ${ra + rb}$.`, 'Faux : la racine d’une somme n’est pas la somme des racines.']
          : [`Les deux membres valent $${kind === 'produit' ? ra * rb : fracLatex(frac(ra, rb))}$.`, 'Vrai : la racine se comporte bien avec les produits et les quotients.'],
    };
  }),
];

const fractionsVariantes = [
  variante('reste', (rng, level) => {
    const d1 = rng.pick([2, 3, 4, 5]);
    const d2 = rng.pick(level === 1 ? [2, 3] : [2, 3, 4, 5]);
    const left = frac((d1 - 1) * (d2 - 1), d1 * d2);
    return {
      prompt: `Un randonneur parcourt le premier jour $\\frac{1}{${d1}}$ du trajet, puis le deuxième jour $\\frac{1}{${d2}}$ de ce qu'il lui restait. Quelle fraction du trajet lui reste-t-il à parcourir ?`,
      answer: { kind: 'number', value: left },
      hint: 'Après le premier jour, il reste $1 - \\frac{1}{' + d1 + '}$ du trajet ; le deuxième jour enlève une fraction de ce reste.',
      correction: [`Après le premier jour, il reste $\\frac{${d1 - 1}}{${d1}}$.`, `Le deuxième jour, il en garde $\\frac{${d2 - 1}}{${d2}}$ : $\\frac{${d1 - 1}}{${d1}} \\times \\frac{${d2 - 1}}{${d2}} = ${fracLatex(left)}$`],
    };
  }),
  variante('terme-manquant', (rng, level) => {
    const b = rng.int(2, level === 1 ? 6 : 9);
    const d = rng.int(2, level === 1 ? 6 : 9);
    const a = rng.nonZero(-7, 7);
    const c = rng.nonZero(-7, 7);
    const x = frac(c * b - a * d, b * d);
    const fa = `${a < 0 ? '-' : ''}\\frac{${Math.abs(a)}}{${b}}`;
    const fc = `${c < 0 ? '-' : ''}\\frac{${Math.abs(c)}}{${d}}`;
    return {
      prompt: `Quel nombre faut-il ajouter à $${fa}$ pour obtenir $${fc}$ ? Donne-le sous forme irréductible.`,
      answer: { kind: 'number', value: x },
      hint: 'Résous $' + fa + ' + x = ' + fc + '$ : $x$ est une différence.',
      correction: [`$x = ${fc} - ${a < 0 ? `\\left(${fa}\\right)` : fa}$`, `$x = ${fracLatex(x)}$`],
    };
  }),
];

export const CALCUL_LITTERAL_SKILLS: Skill[] = [
  varier(developper, developperVariantes),
  varier(identite, identiteVariantes),
  varier(factoriser, factoriserVariantes),
  varier(equation1, equationVariantes),
  varier(produitNul, produitNulVariantes),
  varier(puissances, puissancesVariantes),
  varier(racines, racinesVariantes),
  varier(fractions, fractionsVariantes),
];
