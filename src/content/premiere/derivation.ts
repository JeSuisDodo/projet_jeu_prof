import { frac, fracLatex } from '../../exercises/fraction';
import { paren, sumLatex } from '../../exercises/latex';
import type { Rng } from '../../exercises/rng';
import { type Level, type Skill, makeChoice } from '../../exercises/types';
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

export const DERIVATION: ChapterDef = {
  id: '1re-derivation',
  title: 'Dérivation',
  region: 'Forêt des Tangentes',
  theme: 'foret',
  skills: [taux, penteTangente, nombreDerive, derivePoly, tangente, operations],
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
