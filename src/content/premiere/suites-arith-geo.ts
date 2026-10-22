import { frac, fracLatex } from '../../exercises/fraction';
import { paren, sumLatex } from '../../exercises/latex';
import { type Skill, makeChoice } from '../../exercises/types';
import type { ChapterDef } from '../types';

/** 1re spécialité, chapitre « Suites arithmétiques et géométriques ». */

const arithTerme: Skill = {
  id: '1re-arith-terme',
  name: 'Terme d’une suite arithmétique',
  generate(rng, level) {
    const r = level === 1 ? rng.int(2, 9) : rng.nonZero(-12, 12);
    const p = level === 3 ? rng.int(1, 5) : 0;
    const up = rng.int(-20, 30);
    const n = rng.int(p + 5, level === 1 ? 15 : 40);
    const value = up + (n - p) * r;
    return {
      skill: this.id,
      level,
      prompt: `$(u_n)$ est la suite arithmétique de premier terme $u_{${p}} = ${up}$ et de raison $r = ${r}$. Calcule $u_{${n}}$.`,
      answer: { kind: 'number', value: frac(value) },
      hint: `Pour une suite arithmétique, $u_n = u_p + (n - p)r$.`,
      correction: [`$u_{${n}} = u_{${p}} + (${n} - ${p})\\times r = ${up} + ${n - p}\\times ${paren(r)} = ${value}$`],
    };
  },
};

const arithRaison: Skill = {
  id: '1re-arith-raison',
  name: 'Raison d’une suite arithmétique',
  generate(rng, level) {
    // Au niveau 3, la raison peut être une fraction : l'écart entre les rangs est alors un
    // multiple de son dénominateur, pour que les deux termes donnés soient entiers.
    const r = level === 3 ? frac(rng.nonZero(-9, 9), rng.pick([1, 2, 3, 4])) : frac(rng.nonZero(-8, 8));
    const k = level === 3 ? r.d * rng.int(1, 3) : rng.int(2, level === 1 ? 4 : 9);
    const p = rng.int(0, 6);
    const q = p + k;
    const upInt = rng.int(-15, 15);
    const uqInt = upInt + (k * r.n) / r.d;
    const value = r;
    return {
      skill: this.id,
      level,
      prompt: `$(u_n)$ est une suite arithmétique telle que $u_{${p}} = ${upInt}$ et $u_{${q}} = ${uqInt}$. Quelle est sa raison $r$ ?`,
      answer: { kind: 'number', value },
      hint: `Entre $u_{${p}}$ et $u_{${q}}$, on ajoute ${k} fois la raison.`,
      correction: [`$u_{${q}} = u_{${p}} + ${k}r$, donc $r = \\frac{u_{${q}} - u_{${p}}}{${k}} = \\frac{${uqInt} - ${paren(upInt)}}{${k}} = ${fracLatex(value)}$`],
    };
  },
};

const geoTerme: Skill = {
  id: '1re-geo-terme',
  name: 'Terme d’une suite géométrique',
  generate(rng, level) {
    const half = level === 3 && rng.next() < 0.4;
    const q = half ? frac(1, 2) : frac(level === 1 ? rng.pick([2, 3]) : rng.pick([2, 3, -2, -3]));
    const n = rng.int(3, level === 1 ? 5 : 6);
    const u0 = half ? rng.int(1, 5) * 2 ** n : rng.nonZero(-5, 5);
    const value = frac(u0 * q.n ** n, q.d ** n);
    return {
      skill: this.id,
      level,
      prompt: `$(u_n)$ est la suite géométrique de premier terme $u_0 = ${u0}$ et de raison $q = ${fracLatex(q)}$. Calcule $u_{${n}}$.`,
      answer: { kind: 'number', value },
      hint: 'Pour une suite géométrique, $u_n = u_0 \\times q^n$.',
      correction: [`$u_{${n}} = u_0 \\times q^{${n}} = ${u0} \\times \\left(${fracLatex(q)}\\right)^{${n}} = ${fracLatex(value)}$`],
    };
  },
};

const geoRaison: Skill = {
  id: '1re-geo-raison',
  name: 'Raison d’une suite géométrique',
  generate(rng, level) {
    if (level === 3) {
      // Deux termes de rangs n et n + 2, raison positive : q² = u_{n+2} / u_n.
      const q = rng.int(2, 5);
      const n = rng.int(1, 4);
      const un = rng.int(1, 6);
      const un2 = un * q * q;
      return {
        skill: this.id,
        level,
        prompt: `$(u_n)$ est une suite géométrique de raison $q > 0$ telle que $u_{${n}} = ${un}$ et $u_{${n + 2}} = ${un2}$. Quelle est sa raison $q$ ?`,
        answer: { kind: 'number', value: frac(q) },
        hint: `$u_{${n + 2}} = u_{${n}} \\times q^2$.`,
        correction: [`$q^2 = \\frac{u_{${n + 2}}}{u_{${n}}} = \\frac{${un2}}{${un}} = ${q * q}$`, `Comme $q > 0$, $q = \\sqrt{${q * q}} = ${q}$.`],
      };
    }
    const q = frac(rng.pick(level === 1 ? [2, 3, 4, 5] : [-3, -2, 2, 3, 5]), level === 2 && rng.next() < 0.3 ? 2 : 1);
    const u1 = rng.nonZero(-6, 6) * q.d;
    const u2 = (u1 * q.n) / q.d;
    return {
      skill: this.id,
      level,
      prompt: `$(u_n)$ est une suite géométrique telle que $u_1 = ${u1}$ et $u_2 = ${u2}$. Quelle est sa raison $q$ ?`,
      answer: { kind: 'number', value: q },
      hint: 'On passe d’un terme au suivant en multipliant par $q$.',
      correction: [`$q = \\frac{u_2}{u_1} = \\frac{${u2}}{${u1}} = ${fracLatex(q)}$`],
    };
  },
};

const arithSomme: Skill = {
  id: '1re-arith-somme',
  name: 'Somme de termes arithmétiques',
  generate(rng, level) {
    if (level === 1) {
      const n = rng.int(10, 100);
      const value = (n * (n + 1)) / 2;
      return {
        skill: this.id,
        level,
        prompt: `Calcule $S = 1 + 2 + 3 + \\dots + ${n}$.`,
        answer: { kind: 'number', value: frac(value) },
        hint: '$1 + 2 + \\dots + n = \\frac{n(n+1)}{2}$.',
        correction: [`$S = \\frac{${n}\\times ${n + 1}}{2} = ${value}$`],
      };
    }
    const u0 = rng.int(-10, 20);
    const r = rng.nonZero(-6, 8);
    const n = rng.int(5, level === 2 ? 15 : 30);
    const un = u0 + n * r;
    const value = ((n + 1) * (u0 + un)) / 2;
    return {
      skill: this.id,
      level,
      prompt: `$(u_n)$ est arithmétique, de premier terme $u_0 = ${u0}$ et de raison $${r}$. Calcule $S = u_0 + u_1 + \\dots + u_{${n}}$.`,
      answer: { kind: 'number', value: frac(value) },
      hint: 'Somme = nombre de termes × (premier terme + dernier terme) / 2.',
      correction: [
        `Dernier terme : $u_{${n}} = ${u0} + ${n}\\times ${paren(r)} = ${un}$, et il y a $${n + 1}$ termes.`,
        `$S = ${n + 1}\\times \\frac{${u0} + ${paren(un)}}{2} = ${value}$`,
      ],
    };
  },
};

const geoSomme: Skill = {
  id: '1re-geo-somme',
  name: 'Somme de termes géométriques',
  generate(rng, level) {
    const q = level === 1 ? 2 : rng.pick([2, 3, -2]);
    const n = rng.int(3, level === 3 ? 8 : 6);
    const u0 = level === 3 ? rng.nonZero(-4, 5) : 1;
    const value = (u0 * (q ** (n + 1) - 1)) / (q - 1);
    const terms = u0 === 1 ? `1 + ${q < 0 ? `(${q})` : q} + ${paren(q)}^2 + \\dots + ${paren(q)}^{${n}}` : `u_0 + u_1 + \\dots + u_{${n}}`;
    return {
      skill: this.id,
      level,
      prompt:
        u0 === 1
          ? `Calcule $S = ${terms}$.`
          : `$(u_n)$ est géométrique, de premier terme $u_0 = ${u0}$ et de raison $q = ${q}$. Calcule $S = ${terms}$.`,
      answer: { kind: 'number', value: frac(value) },
      hint: '$1 + q + \\dots + q^n = \\frac{q^{n+1} - 1}{q - 1}$ quand $q \\neq 1$.',
      correction: [`$S = ${u0 === 1 ? '' : `${u0}\\times `}\\frac{${paren(q)}^{${n + 1}} - 1}{${q} - 1} = ${u0 === 1 ? '' : `${u0}\\times `}\\frac{${q ** (n + 1) - 1}}{${q - 1}} = ${value}$`],
    };
  },
};

const nature: Skill = {
  id: '1re-suite-nature',
  name: 'Reconnaître une suite arithmétique ou géométrique',
  generate(rng, level) {
    const kind = rng.pick(['arith', 'geo', 'ni'] as const);
    const r = rng.nonZero(-7, 7);
    const q = rng.pick([2, 3, 5, -2]);
    const c = rng.nonZero(-6, 6);
    let def: string;
    let good: string;
    let why: string;
    const recursive = level > 1 && rng.next() < 0.5;
    if (kind === 'arith') {
      def = recursive ? `u_0 = ${c}` + ` \\text{ et } u_{n+1} = ${sumLatex([[1, 'u_n'], [r, '']])}` : `u_n = ${sumLatex([[r, 'n'], [c, '']])}`;
      good = `Arithmétique de raison $${r}$`;
      why = recursive ? `On ajoute $${r}$ à chaque rang.` : `$u_{n+1} - u_n = ${r}$ pour tout $n$ : la différence est constante.`;
    } else if (kind === 'geo') {
      def = recursive ? `u_0 = ${c} \\text{ et } u_{n+1} = ${q}u_n` : `u_n = ${c}\\times ${paren(q)}^n`;
      good = `Géométrique de raison $${q}$`;
      why = recursive ? `On multiplie par $${q}$ à chaque rang.` : `$\\frac{u_{n+1}}{u_n} = ${q}$ pour tout $n$ : le quotient est constant.`;
    } else {
      const a = rng.nonZero(-3, 3);
      // u_{n+1} = q u_n + r est constante si u_0 = r / (1 - q) : on l'évite.
      if (c * (1 - q) === r) return this.generate(rng, level);
      def = level === 3 ? `u_0 = ${c} \\text{ et } u_{n+1} = ${sumLatex([[q, 'u_n'], [r, '']])}` : `u_n = ${sumLatex([[a, 'n^2'], [c, '']])}`;
      good = 'Ni arithmétique ni géométrique';
      why =
        level === 3
          ? 'On multiplie puis on ajoute : ni la différence ni le quotient de deux termes consécutifs ne sont constants.'
          : `$u_1 - u_0 = ${a}$ mais $u_2 - u_1 = ${3 * a}$ : la différence n’est pas constante, et le quotient non plus.`;
    }
    const decoys = [`Arithmétique de raison $${r}$`, `Géométrique de raison $${q}$`, 'Ni arithmétique ni géométrique', `Arithmétique de raison $${c}$`, `Géométrique de raison $${c}$`];
    return {
      skill: this.id,
      level,
      prompt: `On définit la suite $(u_n)$ par $${def}$. Quelle est sa nature ?`,
      answer: makeChoice(rng, good, decoys, () => `Arithmétique de raison $${rng.int(-9, 9)}$`),
      hint: 'Compare $u_{n+1}$ à $u_n$ : leur différence est-elle constante ? leur quotient ?',
      correction: [why, `Réponse : ${good.charAt(0).toLowerCase()}${good.slice(1)}.`],
    };
  },
};

export const SUITES_ARITH_GEO: ChapterDef = {
  id: '1re-suites-arith-geo',
  title: 'Suites arithmétiques et géométriques',
  region: 'Côte des Progressions',
  theme: 'plage',
  skills: [arithTerme, arithRaison, geoTerme, geoRaison, arithSomme, geoSomme, nature],
  creatures: [
    {
      id: '1re-arithmo',
      name: 'Arithmo',
      description: 'Un poisson régulier : il ajoute toujours la même distance à chaque battement de nageoire.',
      skills: ['1re-arith-terme', '1re-arith-raison'],
      look: { shape: 'poisson', hue: 185, symbol: '+r' },
    },
    {
      id: '1re-geometrix',
      name: 'Géométrix',
      description: 'Un crabe qui multiplie ses pinces par la même raison à chaque mue.',
      skills: ['1re-geo-terme', '1re-geo-raison'],
      look: { shape: 'insecte', hue: 5, symbol: '×q' },
    },
    {
      id: '1re-mimetis',
      name: 'Mimétis',
      description: 'Il imite toutes les suites. Saurez-vous reconnaître sa vraie nature ?',
      skills: ['1re-suite-nature', '1re-arith-terme', '1re-geo-terme'],
      look: { shape: 'blob', hue: 280, symbol: '?' },
    },
    {
      id: '1re-goelette',
      name: 'Goélette',
      description: 'Un oiseau de mer qui compte les vagues et retrouve la raison de chaque marée.',
      skills: ['1re-arith-raison', '1re-geo-raison', '1re-suite-nature'],
      look: { shape: 'oiseau', hue: 210, symbol: 'r' },
    },
    {
      id: '1re-sommarin',
      name: 'Sommarin',
      description: 'Un esprit des embruns qui additionne tous les termes, du premier au dernier.',
      skills: ['1re-arith-somme', '1re-geo-somme'],
      look: { shape: 'spectre', hue: 170, symbol: 'Σ' },
    },
  ],
  boss: {
    id: '1re-progressaure',
    name: 'Progressaure',
    description: 'Le gardien de la côte, taillé dans le corail : il connaît toutes les progressions.',
    skills: ['1re-arith-terme', '1re-arith-raison', '1re-geo-terme', '1re-geo-raison', '1re-arith-somme', '1re-geo-somme', '1re-suite-nature'],
    look: { shape: 'golem', hue: 190, symbol: 'Σ' },
  },
};
