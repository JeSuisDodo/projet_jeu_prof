import { frac, fracLatex } from '../../exercises/fraction';
import { paren, sumLatex } from '../../exercises/latex';
import { type Skill, makeChoice } from '../../exercises/types';
import { enrich, variant } from '../../exercises/variantes';
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

/** n / 100 en écriture décimale française. */
const dec = (n: number, scale = 100) => String(Math.round((n / scale) * 1e8) / 1e8).replace('.', '{,}');

const arithTermeVariantes = [
  variant('salaire', (rng) => {
    const s0 = 50 * rng.int(30, 60);
    const r = 10 * rng.int(3, 15);
    const n = rng.int(3, 15);
    return {
      prompt: `Un salarié gagne $${s0}$ € par mois la première année, puis son salaire mensuel augmente de $${r}$ € chaque année. Quel est son salaire mensuel la ${n}e année ?`,
      answer: { kind: 'number', value: frac(s0 + (n - 1) * r) },
      hint: 'Les salaires forment une suite arithmétique : entre la 1re et la ' + n + 'e année, il y a ' + (n - 1) + ' augmentations.',
      correction: [`$s_{${n}} = ${s0} + ${n - 1}\\times ${r} = ${s0 + (n - 1) * r}$ €`],
    };
  }),
  variant('rang', (rng, level) => {
    const u0 = rng.int(-20, 30);
    const r = level === 1 ? rng.int(2, 9) : rng.nonZero(-9, 9);
    const n = rng.int(5, 60);
    return {
      prompt: `$(u_n)$ est la suite arithmétique de premier terme $u_0 = ${u0}$ et de raison $${r}$. Pour quelle valeur de $n$ a-t-on $u_n = ${u0 + n * r}$ ?`,
      answer: { kind: 'number', value: frac(n) },
      hint: 'Écris $u_n = u_0 + nr$ puis résous l’équation d’inconnue $n$.',
      correction: [`$${u0} + ${paren(r)}n = ${u0 + n * r} \\iff n = \\frac{${u0 + n * r} - ${paren(u0)}}{${r}} = ${n}$`],
    };
  }),
  variant('premier-terme', (rng) => {
    const u0 = rng.int(-20, 30);
    const r = rng.nonZero(-9, 9);
    const n = rng.int(4, 30);
    return {
      prompt: `$(u_n)$ est une suite arithmétique de raison $${r}$ telle que $u_{${n}} = ${u0 + n * r}$. Calcule $u_0$.`,
      answer: { kind: 'number', value: frac(u0) },
      hint: `$u_{${n}} = u_0 + ${n}r$ : isole $u_0$.`,
      correction: [`$u_0 = u_{${n}} - ${n}\\times ${paren(r)} = ${u0 + n * r} - ${paren(n * r)} = ${u0}$`],
    };
  }),
];

const arithRaisonVariantes = [
  variant('theatre', (rng) => {
    const a = rng.int(10, 25);
    const r = rng.int(1, 4);
    const k = rng.int(5, 25);
    return {
      prompt: `Dans un théâtre, le premier rang compte $${a}$ places et chaque rang compte le même nombre de places de plus que le précédent. Le ${k}e rang compte $${a + (k - 1) * r}$ places. Combien de places ajoute-t-on d'un rang au suivant ?`,
      answer: { kind: 'number', value: frac(r) },
      hint: `Du 1er au ${k}e rang, on ajoute ${k - 1} fois la même quantité.`,
      correction: [`$r = \\frac{${a + (k - 1) * r} - ${a}}{${k - 1}} = ${r}$`],
    };
  }),
  variant('trois-termes', (rng) => {
    const x = rng.int(-15, 20);
    const r = rng.nonZero(-9, 9);
    return {
      prompt: `Les nombres $${x - r}$, $x$ et $${x + r}$ sont, dans cet ordre, trois termes consécutifs d'une suite arithmétique. Que vaut $x$ ?`,
      answer: { kind: 'number', value: frac(x) },
      hint: 'Le terme du milieu est la moyenne de ses deux voisins.',
      correction: [`$x - ${paren(x - r)} = ${x + r} - x$, donc $x = \\frac{${x - r} + ${paren(x + r)}}{2} = ${x}$.`],
    };
  }),
];

const geoTermeVariantes = [
  variant('interets', (rng) => {
    const t = rng.pick([10, 20, 50]);
    const n = rng.int(2, 3);
    const c = 1000 * rng.int(1, 5);
    const value = frac(c * (100 + t) ** n, 100 ** n);
    return {
      prompt: `On place $${c}$ € à intérêts composés au taux annuel de $${t}\\,\\%$. De quel capital dispose-t-on au bout de ${n} ans ?`,
      answer: { kind: 'number', value },
      hint: `Chaque année, le capital est multiplié par $1 + \\frac{${t}}{100}$.`,
      correction: [`$C_${n} = ${c}\\times ${dec(100 + t)}^${n} = ${fracLatex(value).replace('.', '{,}')}$ €`],
    };
  }),
  variant('premier-terme', (rng) => {
    const q = rng.pick([2, 3, -2, -3]);
    const n = rng.int(2, 5);
    const u0 = rng.nonZero(-6, 6);
    return {
      prompt: `$(u_n)$ est une suite géométrique de raison $${q}$ telle que $u_{${n}} = ${u0 * q ** n}$. Calcule $u_0$.`,
      answer: { kind: 'number', value: frac(u0) },
      hint: `$u_{${n}} = u_0 \\times q^{${n}}$ : divise.`,
      correction: [`$u_0 = \\frac{${u0 * q ** n}}{${paren(q)}^{${n}}} = \\frac{${u0 * q ** n}}{${q ** n}} = ${u0}$`],
    };
  }),
];

const geoRaisonVariantes = [
  variant('pourcentage', (rng) => {
    const t = rng.pick([2, 3, 4, 5, 8, 10, 12, 15, 20, 25]);
    const hausse = rng.next() < 0.5;
    const q = hausse ? 100 + t : 100 - t;
    return {
      prompt: `Une population ${hausse ? 'augmente' : 'diminue'} de $${t}\\,\\%$ chaque année. Les effectifs successifs forment une suite géométrique : quelle est sa raison ? (Réponse décimale.)`,
      answer: { kind: 'number', value: frac(q, 100) },
      hint: `${hausse ? 'Augmenter' : 'Diminuer'} de $${t}\\,\\%$, c'est multiplier par $1 ${hausse ? '+' : '-'} \\frac{${t}}{100}$.`,
      correction: [`$q = 1 ${hausse ? '+' : '-'} ${dec(t)} = ${dec(q)}$`],
    };
  }),
  variant('trois-termes', (rng) => {
    const u = rng.int(1, 6);
    const q = rng.int(2, 5);
    return {
      prompt: `Les nombres positifs $${u}$, $x$ et $${u * q * q}$ sont, dans cet ordre, trois termes consécutifs d'une suite géométrique. Que vaut $x$ ?`,
      answer: { kind: 'number', value: frac(u * q) },
      hint: 'Le carré du terme du milieu est le produit de ses deux voisins.',
      correction: [`$x^2 = ${u}\\times ${u * q * q} = ${u * u * q * q}$ et $x > 0$, donc $x = ${u * q}$.`],
    };
  }),
];

const arithSommeVariantes = [
  variant('impairs', (rng) => {
    const n = rng.int(5, 60);
    return {
      prompt: `Calcule $S = 1 + 3 + 5 + \\dots + ${2 * n - 1}$.`,
      answer: { kind: 'number', value: frac(n * n) },
      hint: 'Compte les termes, puis utilise : nombre de termes × (premier + dernier) / 2.',
      correction: [`Il y a $${n}$ termes : $S = ${n}\\times \\frac{1 + ${2 * n - 1}}{2} = ${n * n}$.`],
    };
  }),
  variant('theatre', (rng) => {
    const a = rng.int(10, 25);
    const r = rng.int(1, 4);
    const k = rng.int(5, 25);
    const total = (k * (2 * a + (k - 1) * r)) / 2;
    return {
      prompt: `Dans un théâtre, le premier rang compte $${a}$ places et chaque rang compte $${r}$ place${r > 1 ? 's' : ''} de plus que le précédent. Combien de places y a-t-il en tout sur les $${k}$ rangs ?`,
      answer: { kind: 'number', value: frac(total) },
      hint: 'Calcule le nombre de places du dernier rang, puis la somme des termes.',
      correction: [`Le dernier rang compte $${a} + ${k - 1}\\times ${r} = ${a + (k - 1) * r}$ places.`, `Total : $${k}\\times \\frac{${a} + ${a + (k - 1) * r}}{2} = ${total}$`],
    };
  }),
];

const geoSommeVariantes = [
  variant('grains', (rng) => {
    const q = rng.pick([2, 3]);
    const a = rng.int(1, 5);
    const n = rng.int(4, 10);
    const total = (a * (q ** n - 1)) / (q - 1);
    return {
      prompt: `Le premier jour, on dépose $${a}$ grain${a > 1 ? 's' : ''} de riz, puis chaque jour ${q === 2 ? 'deux' : 'trois'} fois plus que la veille. Combien de grains a-t-on déposés en tout au bout de ${n} jours ?`,
      answer: { kind: 'number', value: frac(total) },
      hint: 'C’est la somme des $n$ premiers termes d’une suite géométrique.',
      correction: [`$S = ${a}\\times \\frac{${q}^{${n}} - 1}{${q} - 1} = ${total}$`],
    };
  }),
  variant('moities', (rng) => {
    const n = rng.int(3, 8);
    const value = frac(2 ** (n + 1) - 1, 2 ** n);
    return {
      prompt: `Calcule $S = 1 + \\frac{1}{2} + \\frac{1}{4} + \\dots + \\frac{1}{${2 ** n}}$ (fraction).`,
      answer: { kind: 'number', value },
      hint: 'Suite géométrique de raison $\\frac{1}{2}$ : $1 + q + \\dots + q^n = \\frac{1 - q^{n+1}}{1 - q}$.',
      correction: [`$S = \\frac{1 - \\left(\\frac{1}{2}\\right)^{${n + 1}}}{1 - \\frac{1}{2}} = 2 - \\frac{1}{${2 ** n}} = ${fracLatex(value)}$`],
    };
  }),
];

const natureVariantes = [
  variant('premiers-termes', (rng) => {
    const kind = rng.int(0, 2);
    const a = rng.nonZero(-6, 9);
    const r = rng.nonZero(-7, 7);
    const q = rng.pick([2, 3, -2]);
    const terms = kind === 0 ? [0, 1, 2, 3].map((i) => a + i * r) : kind === 1 ? [0, 1, 2, 3].map((i) => a * q ** i) : [0, 1, 2, 3].map((i) => a + r * i * i);
    const options = ['Arithmétique', 'Géométrique', 'Ni l’une ni l’autre'];
    return {
      prompt: `Les quatre premiers termes d'une suite sont $${terms.join('$, $')}$. Si elle continue de la même façon, elle peut être :`,
      answer: { kind: 'choice', options, correct: kind },
      hint: 'Calcule les différences, puis les quotients, entre termes consécutifs.',
      correction: [
        kind === 0 ? `On ajoute $${r}$ à chaque fois : arithmétique.` : kind === 1 ? `On multiplie par $${q}$ à chaque fois : géométrique.` : `Les différences valent $${r}$, $${3 * r}$, $${5 * r}$ : pas constantes, et les quotients non plus.`,
      ],
    };
  }),
  variant('suite-auxiliaire', (rng) => {
    const q = rng.pick([2, 3, -1, -2, 4]);
    const c = rng.nonZero(-6, 6);
    const r = c * (1 - q);
    return {
      prompt: `On pose $u_0 = ${c + rng.nonZero(-5, 5)}$ et $u_{n+1} = ${sumLatex([[q, 'u_n'], [r, '']])}$. Pour quelle valeur de $c$ la suite $v_n = u_n - c$ est-elle géométrique ?`,
      answer: { kind: 'number', value: frac(c) },
      hint: 'Cherche $c$ tel que $c = qc + r$ : on a alors $v_{n+1} = q\\,v_n$.',
      correction: [`$v_{n+1} = u_{n+1} - c = ${sumLatex([[q, 'u_n'], [r, '']])} - c$, qui vaut $${q}v_n$ quand $c = ${q}c ${r < 0 ? '-' : '+'} ${Math.abs(r)}$, soit $c = ${c}$.`],
    };
  }),
];

export const SUITES_ARITH_GEO: ChapterDef = {
  id: '1re-suites-arith-geo',
  title: 'Suites arithmétiques et géométriques',
  region: 'Côte des Progressions',
  theme: 'plage',
  terrain: 'cote',
  skills: [
    enrich(arithTerme, arithTermeVariantes),
    enrich(arithRaison, arithRaisonVariantes),
    enrich(geoTerme, geoTermeVariantes),
    enrich(geoRaison, geoRaisonVariantes),
    enrich(arithSomme, arithSommeVariantes),
    enrich(geoSomme, geoSommeVariantes),
    enrich(nature, natureVariantes),
  ],
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
