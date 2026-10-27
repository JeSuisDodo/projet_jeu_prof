import { frac, fracLatex } from '../../exercises/fraction';
import { paren, sumLatex } from '../../exercises/latex';
import type { Rng } from '../../exercises/rng';
import { type Answer, type Level, type Skill, makeChoice } from '../../exercises/types';
import { enrich, variant } from '../../exercises/variantes';
import type { ChapterDef } from '../types';
import { type Poly, lineTex, polyDeriv, polyEval, polyTex } from './poly';

/** 1re spécialité, chapitre « Dérivation » : taux de variation, nombre dérivé, tangente, fonctions dérivées. */

/** Polynôme de degré 2 (niveau 1) ou 3 (niveaux 2 et 3). */
function randomPoly(rng: Rng, level: Level): Poly {
  const top = level === 1 ? 2 : 3;
  const p: Poly = [rng.int(-9, 9), rng.int(-6, 6), rng.int(-4, 4)];
  if (top === 3) p.push(rng.nonZero(-3, 3));
  else if (p[2] === 0) p[2] = rng.nonZero(-3, 3);
  return p;
}

const taux: Skill = {
  id: '1re-taux-variation',
  name: 'Calculer un taux de variation',
  generate(rng, level) {
    const p: Poly = [rng.int(-5, 5), rng.int(-4, 4), level === 1 ? 1 : rng.nonZero(-3, 3)];
    const a = rng.int(-3, 3);
    const h = level === 3 ? rng.nonZero(-3, 3) : rng.int(1, 3);
    const fa = polyEval(p, a);
    const fah = polyEval(p, a + h);
    const value = frac(fah - fa, h);
    return {
      skill: this.id,
      level,
      prompt: `Soit $f(x) = ${polyTex(p)}$. Calcule le taux de variation de $f$ entre $${a}$ et $${a + h}$, c'est-à-dire $\\frac{f(${a + h}) - f(${a})}{${a + h} - ${paren(a)}}$.`,
      answer: { kind: 'number', value },
      hint: 'Calcule les deux images, puis divise leur différence par l’écart entre les deux nombres.',
      correction: [
        `$f(${a + h}) = ${fah}$ et $f(${a}) = ${fa}$.`,
        `$\\frac{${fah} - ${paren(fa)}}{${h}} = ${fracLatex(value)}$`,
      ],
    };
  },
};

const penteTangente: Skill = {
  id: '1re-derive-tangente',
  name: 'Nombre dérivé et coefficient directeur',
  generate(rng, level) {
    const xa = rng.int(-4, 4);
    const ya = rng.int(-5, 5);
    const m = level === 3 ? frac(rng.nonZero(-6, 6), rng.pick([2, 3])) : frac(rng.nonZero(-5, 5));
    const dx = m.d * rng.int(1, 3) * rng.sign();
    const xb = xa + dx;
    const yb = ya + (dx * m.n) / m.d;
    return {
      skill: this.id,
      level,
      prompt: `La tangente à la courbe de $f$ au point $A(${xa}\\,;\\,${ya})$ passe aussi par $B(${xb}\\,;\\,${yb})$. Que vaut $f'(${xa})$ ?`,
      answer: { kind: 'number', value: m },
      hint: '$f\'(a)$ est le coefficient directeur de la tangente au point d’abscisse $a$.',
      correction: [`$f'(${xa}) = \\frac{y_B - y_A}{x_B - x_A} = \\frac{${yb} - ${paren(ya)}}{${xb} - ${paren(xa)}} = ${fracLatex(m)}$`],
    };
  },
};

const nombreDerive: Skill = {
  id: '1re-nombre-derive',
  name: 'Calculer un nombre dérivé',
  generate(rng, level) {
    const p = randomPoly(rng, level);
    const d = polyDeriv(p);
    const a = rng.int(-3, 3);
    const value = polyEval(d, a);
    return {
      skill: this.id,
      level,
      prompt: `Soit $f(x) = ${polyTex(p)}$. Calcule $f'(${a})$.`,
      answer: { kind: 'number', value: frac(value) },
      hint: 'Dérive d’abord : $(x^n)\' = nx^{n-1}$, puis remplace $x$.',
      correction: [`$f'(x) = ${polyTex(d)}$`, `$f'(${a}) = ${value}$`],
    };
  },
};

const derivePoly: Skill = {
  id: '1re-derivee-polynome',
  name: 'Dériver un polynôme',
  generate(rng, level) {
    const p = randomPoly(rng, level);
    const good = polyTex(polyDeriv(p));
    // Erreurs classiques : oublier de multiplier par l'exposant, garder la puissance, garder la constante.
    const noFactor = polyTex(p.slice(1));
    const keepPower = polyTex([0, ...p.slice(1).map((c, i) => c * (i + 1))]);
    const d = polyDeriv(p);
    const keepConst = polyTex([d[0] + p[0], ...d.slice(1)]);
    return {
      skill: this.id,
      level,
      prompt: `Soit $f(x) = ${polyTex(p)}$. Quelle est sa fonction dérivée ?`,
      answer: makeChoice(rng, `$f'(x) = ${good}$`, [noFactor, keepPower, keepConst].map((d) => `$f'(x) = ${d}$`), () => `$f'(x) = ${polyTex(randomPoly(rng, 1).slice(0, p.length - 1))}$`),
      hint: '$(x^n)\' = nx^{n-1}$, et la dérivée d’une constante est nulle.',
      correction: [`$f'(x) = ${good}$`],
    };
  },
};

const tangente: Skill = {
  id: '1re-tangente',
  name: 'Équation d’une tangente',
  generate(rng, level) {
    const p = randomPoly(rng, level);
    const a = rng.int(-2, 2);
    const fa = polyEval(p, a);
    const m = polyEval(polyDeriv(p), a);
    const q = fa - m * a;
    return {
      skill: this.id,
      level,
      prompt: `Soit $f(x) = ${polyTex(p)}$. Donne l'équation réduite $y = mx + p$ de la tangente à sa courbe au point d'abscisse $${a}$.`,
      answer: { kind: 'pair', values: [frac(m), frac(q)], labels: ['m', 'p'] },
      hint: 'La tangente en $a$ a pour équation $y = f\'(a)(x - a) + f(a)$.',
      correction: [
        `$f(${a}) = ${fa}$ et $f'(x) = ${polyTex(polyDeriv(p))}$, donc $f'(${a}) = ${m}$.`,
        `$y = ${m}(x - ${paren(a)}) + ${paren(fa)}$, soit $${lineTex(m, q)}$.`,
      ],
    };
  },
};

const operations: Skill = {
  id: '1re-derivee-operations',
  name: 'Dériver un produit, un inverse ou un quotient',
  generate(rng, level) {
    if (level === 1) {
      const k = rng.nonZero(-6, 6);
      const sqrt = rng.next() < 0.5;
      const good = sqrt ? (k % 2 === 0 ? `\\frac{${k / 2}}{\\sqrt{x}}` : `\\frac{${k}}{2\\sqrt{x}}`) : `${k < 0 ? '' : '-'}\\frac{${Math.abs(k)}}{x^2}`;
      const decoys = sqrt
        ? [`\\frac{${k}}{\\sqrt{x}}`, `${k}\\sqrt{x}`, `\\frac{1}{2\\sqrt{${k}x}}`]
        : [`${k < 0 ? '-' : ''}\\frac{${Math.abs(k)}}{x^2}`, `\\frac{${k}}{2x}`, `${k}x^2`];
      return {
        skill: this.id,
        level,
        prompt: `Soit $f(x) = ${sqrt ? `${k === 1 ? '' : k === -1 ? '-' : k}\\sqrt{x}` : `\\frac{${k}}{x}`}$. Quelle est sa fonction dérivée ?`,
        answer: makeChoice(rng, `$f'(x) = ${good}$`, decoys.map((d) => `$f'(x) = ${d}$`), () => `$f'(x) = ${rng.int(2, 9)}x$`),
        hint: sqrt ? '$(\\sqrt{x})\' = \\frac{1}{2\\sqrt{x}}$.' : '$\\left(\\frac{1}{x}\\right)\' = -\\frac{1}{x^2}$.',
        correction: [`$f'(x) = ${good}$`],
      };
    }
    const [a, b, c, d] = [rng.nonZero(-4, 4), rng.nonZero(-6, 6), rng.nonZero(-4, 4), rng.nonZero(-6, 6)];
    const u = sumLatex([[a, 'x'], [b, '']]);
    const v = sumLatex([[c, 'x'], [d, '']]);
    if (level === 2 || a * d - b * c === 0) {
      // (ax + b)(cx + d) : u'v + uv' = 2ac x + (ad + bc).
      const good = sumLatex([[2 * a * c, 'x'], [a * d + b * c, '']]);
      const decoys = [String(a * c), sumLatex([[a * c, 'x'], [a * d + b * c, '']]), sumLatex([[2 * a * c, 'x'], [a * d - b * c, '']])];
      return {
        skill: this.id,
        level,
        prompt: `Soit $f(x) = (${u})(${v})$. Quelle est sa fonction dérivée ?`,
        answer: makeChoice(rng, `$f'(x) = ${good}$`, decoys.map((s) => `$f'(x) = ${s}$`), () => `$f'(x) = ${sumLatex([[rng.nonZero(-9, 9), 'x'], [rng.int(-9, 9), '']])}$`),
        hint: '$(uv)\' = u\'v + uv\'$.',
        correction: [
          `$u(x) = ${u}$, $u'(x) = ${a}$ ; $v(x) = ${v}$, $v'(x) = ${c}$.`,
          `$f'(x) = ${a}(${v}) + ${paren(c)}(${u}) = ${good}$`,
        ],
      };
    }
    // (ax + b)/(cx + d) : (u'v - uv')/v² = (ad - bc)/(cx + d)².
    const num = a * d - b * c;
    const good = `\\frac{${num}}{(${v})^2}`;
    const decoys = [`\\frac{${-num}}{(${v})^2}`, `\\frac{${num}}{${v}}`, `\\frac{${a}}{${c}}`];
    return {
      skill: this.id,
      level,
      prompt: `Soit $f(x) = \\frac{${u}}{${v}}$. Quelle est sa fonction dérivée ?`,
      answer: makeChoice(rng, `$f'(x) = ${good}$`, decoys.map((s) => `$f'(x) = ${s}$`), () => `$f'(x) = \\frac{${rng.nonZero(-20, 20)}}{(${v})^2}$`),
      hint: '$\\left(\\frac{u}{v}\\right)\' = \\frac{u\'v - uv\'}{v^2}$.',
      correction: [
        `$u'(x) = ${a}$ et $v'(x) = ${c}$.`,
        `$f'(x) = \\frac{${a}(${v}) - ${paren(c)}(${u})}{(${v})^2} = ${good}$`,
      ],
    };
  },
};

/* ---------- Variantes : d'autres façons de poser les mêmes notions ---------- */

const vraiFaux = (b: boolean): Answer => ({ kind: 'choice', options: ['Vrai', 'Faux'], correct: b ? 0 : 1 });

const tauxVariantes = [
  variant('vitesse-moyenne', (rng, level) => {
    const a = rng.int(1, level === 1 ? 3 : 5);
    const b = rng.int(0, 6);
    const t1 = rng.int(0, 4);
    const t2 = t1 + rng.int(1, 4);
    const d: Poly = [0, b, a];
    const v = frac(polyEval(d, t2) - polyEval(d, t1), t2 - t1);
    return {
      prompt: `Une bille roule : la distance parcourue après $t$ secondes est $d(t) = ${polyTex(d, 't')}$ mètres. Quelle est sa vitesse moyenne, en m/s, entre $t = ${t1}$ et $t = ${t2}$ ?`,
      answer: { kind: 'number', value: v },
      hint: 'La vitesse moyenne est le taux de variation de $d$ entre les deux instants.',
      correction: [`$d(${t2}) = ${polyEval(d, t2)}$ et $d(${t1}) = ${polyEval(d, t1)}$.`, `$\\frac{${polyEval(d, t2)} - ${polyEval(d, t1)}}{${t2} - ${t1}} = ${fracLatex(v)}$ m/s`],
    };
  }),
  variant('expression', (rng) => {
    const k = rng.nonZero(-4, 4);
    const c = rng.int(-6, 6);
    const f = polyTex([c, 0, k]);
    // (f(a + h) - f(a)) / h = k(2a + h)
    const good = sumLatex([[2 * k, 'a'], [k, 'h']]);
    return {
      prompt: `Soit $f(x) = ${f}$ et $h \\neq 0$. Que vaut le taux de variation $\\frac{f(a + h) - f(a)}{h}$ ?`,
      answer: makeChoice(rng, `$${good}$`, [sumLatex([[2 * k, 'a']]), sumLatex([[k, 'a'], [k, 'h']]), sumLatex([[2 * k, 'a'], [k, 'h'], [c, '']]), sumLatex([[k, 'a^2'], [k, 'h']])].map((s) => `$${s}$`), () => `$${sumLatex([[2 * k + 1, 'a'], [k, 'h']])}$`),
      hint: 'Développe $f(a + h)$, simplifie la différence, puis divise par $h$.',
      correction: [`$f(a + h) - f(a) = ${k === 1 ? '' : k === -1 ? '-' : k}\\left[(a + h)^2 - a^2\\right] = ${sumLatex([[2 * k, 'ah'], [k, 'h^2']])}$`, `En divisant par $h$ : $${good}$. Quand $h$ tend vers 0, on retrouve $f'(a) = ${sumLatex([[2 * k, 'a']])}$.`],
    };
  }),
];

const penteVariantes = [
  variant('lire-equation', (rng, level) => {
    const m = level === 3 ? frac(rng.nonZero(-7, 7), rng.pick([2, 3])) : frac(rng.nonZero(-6, 6));
    const a = rng.int(-4, 4);
    const p = rng.int(-9, 9);
    const mTex = fracLatex(m);
    const line = `y = ${m.n === m.d ? '' : m.n === -m.d ? '-' : mTex}x${p === 0 ? '' : ` ${p < 0 ? '-' : '+'} ${Math.abs(p)}`}`;
    return {
      prompt: `La tangente à la courbe de $f$ au point d'abscisse $${a}$ a pour équation $${line}$. Que vaut $f'(${a})$ ?`,
      answer: { kind: 'number', value: m },
      hint: 'Le nombre dérivé est le coefficient directeur de la tangente.',
      correction: [`$f'(${a})$ est le coefficient directeur de la tangente : $f'(${a}) = ${mTex}$.`],
    };
  }),
  variant('tangente-horizontale', (rng, level) => {
    const a = level === 1 ? 1 : rng.nonZero(-3, 3);
    const x0 = level === 3 ? frac(rng.nonZero(-9, 9), 2) : frac(rng.int(-5, 5));
    // f(x) = a x² + b x + c avec f'(x0) = 0 : b = -2 a x0.
    const b = (-2 * a * x0.n) / x0.d;
    const p: Poly = [rng.int(-9, 9), b, a];
    return {
      prompt: `Soit $f(x) = ${polyTex(p)}$. En quelle abscisse la tangente à la courbe de $f$ est-elle horizontale ?`,
      answer: { kind: 'number', value: x0 },
      hint: 'Une tangente horizontale a un coefficient directeur nul : résous $f\'(x) = 0$.',
      correction: [`$f'(x) = ${polyTex(polyDeriv(p))}$`, `$f'(x) = 0 \\iff x = ${fracLatex(x0)}$`],
    };
  }),
];

const nombreDeriveVariantes = [
  variant('vitesse-instantanee', (rng, level) => {
    const d: Poly = [0, rng.int(0, 8), rng.int(1, 5), ...(level === 3 ? [rng.int(1, 2)] : [])];
    const t = rng.int(1, 5);
    const v = polyEval(polyDeriv(d), t);
    return {
      prompt: `La position d'un mobile (en m) à l'instant $t$ (en s) est $d(t) = ${polyTex(d, 't')}$. Quelle est sa vitesse instantanée à $t = ${t}$, en m/s ?`,
      answer: { kind: 'number', value: frac(v) },
      hint: 'La vitesse instantanée est le nombre dérivé $d\'(t)$.',
      correction: [`$d'(t) = ${polyTex(polyDeriv(d), 't')}$`, `$d'(${t}) = ${v}$ m/s`],
    };
  }),
  variant('retrouver-coefficient', (rng, level) => {
    const a = rng.nonZero(-5, 5);
    const b = rng.nonZero(-6, 6);
    const x0 = rng.nonZero(level === 1 ? 1 : -3, 3);
    const k = 2 * a * x0 + b;
    return {
      prompt: `Soit $f(x) = ax^2 ${b < 0 ? '-' : '+'} ${Math.abs(b)}x$, où $a$ est un réel. On sait que $f'(${x0}) = ${k}$. Que vaut $a$ ?`,
      answer: { kind: 'number', value: frac(a) },
      hint: 'Exprime $f\'(x)$ en fonction de $a$, puis remplace $x$.',
      correction: [`$f'(x) = 2ax ${b < 0 ? '-' : '+'} ${Math.abs(b)}$, donc $f'(${x0}) = ${2 * x0}a ${b < 0 ? '-' : '+'} ${Math.abs(b)}$.`, `$${2 * x0}a ${b < 0 ? '-' : '+'} ${Math.abs(b)} = ${k}$ donne $a = ${a}$.`],
    };
  }),
];

const derivePolyVariantes = [
  variant('vrai-faux', (rng, level) => {
    const k = rng.nonZero(-6, 6);
    const n = rng.int(2, level === 1 ? 3 : 6);
    const juste = rng.next() < 0.4;
    // Erreurs : garder l'exposant, oublier de multiplier, diminuer l'exposant de 2.
    const shown = juste ? [k * n, n - 1] : rng.pick([[k * n, n], [k, n - 1], [k * (n - 1), n - 1]]);
    const wrongIsRight = shown[0] === k * n && shown[1] === n - 1;
    return {
      prompt: `Vrai ou faux : la dérivée de $f(x) = ${polyTex([...Array(n).fill(0), k])}$ est $f'(x) = ${polyTex([...Array(shown[1]).fill(0), shown[0]])}$.`,
      answer: vraiFaux(wrongIsRight),
      hint: '$(kx^n)\' = knx^{n-1}$',
      correction: [`$f'(x) = ${k} \\times ${n} x^{${n - 1}} = ${polyTex([...Array(n - 1).fill(0), k * n])}$`, wrongIsRight ? 'C’est vrai.' : 'C’est faux.'],
    };
  }),
  variant('retrouver-f', (rng, level) => {
    const p = randomPoly(rng, level);
    p[0] = 0;
    const d = polyDeriv(p);
    const good = polyTex(p);
    const wrongNoDiv = polyTex([0, ...d.map((c) => c)]);
    const wrongDeriv = polyTex(polyDeriv(d));
    return {
      prompt: `Laquelle de ces fonctions a pour dérivée $f'(x) = ${polyTex(d)}$ ?`,
      answer: makeChoice(rng, `$f(x) = ${good}$`, [wrongNoDiv, wrongDeriv, polyTex([0, ...d.slice(0, -1), 0, d[d.length - 1]])].filter((s) => s !== good).map((s) => `$f(x) = ${s}$`), () => `$f(x) = ${polyTex([0, ...d.map((c) => c + 1)])}$`),
      hint: 'Dérive chaque proposition et compare.',
      correction: [`$(${good})' = ${polyTex(d)}$`],
    };
  }),
];

const tangenteVariantes = [
  variant('ordonnee-origine', (rng, level) => {
    const p = randomPoly(rng, level);
    const a = rng.nonZero(-2, 2);
    const fa = polyEval(p, a);
    const m = polyEval(polyDeriv(p), a);
    return {
      prompt: `Soit $f(x) = ${polyTex(p)}$. En quel point la tangente à la courbe de $f$ en $x = ${a}$ coupe-t-elle l'axe des ordonnées ? Donne son ordonnée.`,
      answer: { kind: 'number', value: frac(fa - m * a) },
      hint: 'Écris l’équation de la tangente, puis prends $x = 0$.',
      correction: [`$f(${a}) = ${fa}$ et $f'(${a}) = ${m}$.`, `$y = ${m}(x - ${paren(a)}) + ${paren(fa)}$ ; en $x = 0$ : $y = ${fa - m * a}$.`],
    };
  }),
  variant('parallele', (rng, level) => {
    const a = level === 1 ? 1 : rng.nonZero(-3, 3);
    const b = rng.int(-6, 6);
    const x0 = rng.int(-4, 4);
    const m = 2 * a * x0 + b;
    const p: Poly = [rng.int(-9, 9), b, a];
    return {
      prompt: `Soit $f(x) = ${polyTex(p)}$. En quelle abscisse la tangente à sa courbe est-elle parallèle à la droite $${lineTex(m, rng.int(-5, 5))}$ ?`,
      answer: { kind: 'number', value: frac(x0) },
      hint: 'Deux droites parallèles ont le même coefficient directeur : résous $f\'(x) = ' + m + '$.',
      correction: [`$f'(x) = ${polyTex(polyDeriv(p))}$`, `$${polyTex(polyDeriv(p))} = ${m} \\iff x = ${x0}$`],
    };
  }),
];

const operationsVariantes = [
  variant('produit-en-un-point', (rng) => {
    const [a, b, c, d] = [rng.nonZero(-4, 4), rng.nonZero(-6, 6), rng.nonZero(-4, 4), rng.nonZero(-6, 6)];
    const k = rng.int(-3, 3);
    const u = sumLatex([[a, 'x'], [b, '']]);
    const v = sumLatex([[c, 'x'], [d, '']]);
    const value = a * (c * k + d) + c * (a * k + b);
    return {
      prompt: `Soit $f(x) = (${u})(${v})$. Calcule $f'(${k})$.`,
      answer: { kind: 'number', value: frac(value) },
      hint: '$(uv)\' = u\'v + uv\'$, puis remplace $x$.',
      correction: [`$f'(x) = ${a}(${v}) + ${paren(c)}(${u})$`, `$f'(${k}) = ${a} \\times ${paren(c * k + d)} + ${paren(c)} \\times ${paren(a * k + b)} = ${value}$`],
    };
  }),
  variant('inverse-en-un-point', (rng) => {
    const a = rng.nonZero(-3, 3);
    const b = rng.int(-5, 5);
    let k = rng.int(-3, 3);
    if (a * k + b === 0) k++;
    const v = a * k + b;
    // (1/v)' = -v'/v²
    const value = frac(-a, v * v);
    return {
      prompt: `Soit $f(x) = \\frac{1}{${sumLatex([[a, 'x'], [b, '']])}}$. Calcule $f'(${k})$.`,
      answer: { kind: 'number', value },
      hint: '$\\left(\\frac{1}{v}\\right)\' = -\\frac{v\'}{v^2}$',
      correction: [`$f'(x) = -\\frac{${a}}{(${sumLatex([[a, 'x'], [b, '']])})^2}$`, `$f'(${k}) = -\\frac{${a}}{${paren(v)}^2} = ${fracLatex(value)}$`],
    };
  }),
];

export const DERIVATION: ChapterDef = {
  id: '1re-derivation',
  title: 'Dérivation',
  region: 'Forêt des Tangentes',
  theme: 'foret',
  terrain: 'foret',
  skills: [
    enrich(taux, tauxVariantes),
    enrich(penteTangente, penteVariantes),
    enrich(nombreDerive, nombreDeriveVariantes),
    enrich(derivePoly, derivePolyVariantes),
    enrich(tangente, tangenteVariantes),
    enrich(operations, operationsVariantes),
  ],
  creatures: [
    {
      id: '1re-tauxinet',
      name: 'Tauxinet',
      description: 'Un scarabée qui mesure la pente entre deux brindilles, puis rapproche ses pattes.',
      skills: ['1re-taux-variation', '1re-derive-tangente'],
      look: { shape: 'insecte', hue: 85, symbol: 'Δ' },
    },
    {
      id: '1re-penteloup',
      name: 'Penteloup',
      description: 'Il dévale les courbes en suivant toujours la pente de la tangente.',
      skills: ['1re-derive-tangente', '1re-nombre-derive'],
      look: { shape: 'bete', hue: 140, symbol: 'm' },
    },
    {
      id: '1re-derivelle',
      name: 'Dérivelle',
      description: 'Une fleur dont chaque pétale perd une puissance quand on la cueille.',
      skills: ['1re-derivee-polynome', '1re-nombre-derive'],
      look: { shape: 'plante', hue: 160, symbol: 'f′' },
    },
    {
      id: '1re-tangentin',
      name: 'Tangentin',
      description: 'Un oiseau qui frôle la courbe en un seul point sans jamais la traverser… ou presque.',
      skills: ['1re-tangente', '1re-nombre-derive'],
      look: { shape: 'oiseau', hue: 100, symbol: 'T' },
    },
    {
      id: '1re-uvulon',
      name: 'Uvulon',
      description: 'Un esprit double, mi-u mi-v : pour le dériver, il faut traiter ses deux moitiés.',
      skills: ['1re-derivee-operations', '1re-derivee-polynome'],
      look: { shape: 'spectre', hue: 125, symbol: 'u/v' },
    },
  ],
  boss: {
    id: '1re-derivator',
    name: 'Dérivator',
    description: 'Le gardien de la forêt, couvert de mousse : il connaît la pente de chaque chemin.',
    skills: ['1re-taux-variation', '1re-derive-tangente', '1re-nombre-derive', '1re-derivee-polynome', '1re-tangente', '1re-derivee-operations'],
    look: { shape: 'golem', hue: 130, symbol: 'f′' },
  },
};
