import { frac, fracLatex } from '../../exercises/fraction';
import { paren, sumLatex } from '../../exercises/latex';
import { type Skill, makeChoice } from '../../exercises/types';
import { enrich, variant } from '../../exercises/variantes';
import type { ChapterDef } from '../types';

/** 1re spécialité, chapitre « Suites numériques » : modes de génération et sens de variation. */

const poly = (a: number, b: number, c: number, v = 'n') => sumLatex([[a, `${v}^2`], [b, v], [c, '']]);

const explicite: Skill = {
  id: '1re-suite-explicite',
  name: 'Calculer un terme (formule explicite)',
  generate(rng, level) {
    const a = level === 1 ? 0 : rng.nonZero(-3, 3);
    const b = rng.nonZero(-6, 6);
    const c = rng.int(-9, 9);
    const k = rng.int(level === 1 ? 0 : 2, level === 3 ? 10 : 6);
    const value = a * k * k + b * k + c;
    const sub = sumLatex([[a, `\\times ${k}^2`], [b, `\\times ${k}`], [c, '']], true);
    return {
      skill: this.id,
      level,
      prompt: `La suite $(u_n)$ est définie pour tout entier $n \\geq 0$ par $u_n = ${poly(a, b, c)}$. Calcule $u_{${k}}$.`,
      answer: { kind: 'number', value: frac(value) },
      hint: `Remplace $n$ par $${k}$ dans la formule.`,
      correction: [`$u_{${k}} = ${sub} = ${value}$`],
    };
  },
};

const recurrente: Skill = {
  id: '1re-suite-recurrente',
  name: 'Calculer des termes (récurrence)',
  generate(rng, level) {
    const a = level === 1 ? rng.pick([1, 2]) : level === 2 ? rng.pick([2, 3, -1]) : rng.pick([-2, 2, 3, -3]);
    const b = rng.nonZero(-5, 5);
    const u0 = rng.int(-4, 5);
    const target = level === 1 ? 2 : 3;
    const terms = [u0];
    for (let i = 0; i < target; i++) terms.push(a * terms[i] + b);
    const rule = sumLatex([[a, 'u_n'], [b, '']]);
    return {
      skill: this.id,
      level,
      prompt: `La suite $(u_n)$ est définie par $u_0 = ${u0}$ et, pour tout $n \\geq 0$, $u_{n+1} = ${rule}$. Calcule $u_{${target}}$.`,
      answer: { kind: 'number', value: frac(terms[target]) },
      hint: 'On ne peut pas sauter d’étape : calcule $u_1$, puis $u_2$…',
      correction: terms.slice(1).map((t, i) => `$u_{${i + 1}} = ${sumLatex([[a, `\\times ${paren(terms[i])}`], [b, '']], true)} = ${t}$`),
    };
  },
};

const suivant: Skill = {
  id: '1re-suite-suivant',
  name: 'Exprimer le terme suivant',
  generate(rng, level) {
    const a = level === 3 ? rng.pick([2, -1, 3]) : 1;
    const b = rng.int(-5, 5);
    const c = rng.int(-6, 6);
    // a(n+1)² + b(n+1) + c = a n² + (2a + b) n + (a + b + c)
    const good = poly(a, 2 * a + b, a + b + c);
    const decoys = [poly(a, b, c + 1), poly(a, b + 1, c + 1), poly(a, 2 * a + b, b + c), poly(a, a + b, a + b + c)];
    return {
      skill: this.id,
      level,
      prompt: `Pour tout entier $n$, $u_n = ${poly(a, b, c)}$. Quelle est l'expression de $u_{n+1}$ ?`,
      answer: makeChoice(rng, `$u_{n+1} = ${good}$`, decoys.map((d) => `$u_{n+1} = ${d}$`), () => `$u_{n+1} = ${poly(a, rng.int(-8, 8), rng.int(-8, 8))}$`),
      hint: 'Remplace chaque $n$ par $(n+1)$, puis développe $(n+1)^2 = n^2 + 2n + 1$.',
      correction: [
        `$u_{n+1} = ${sumLatex([[a, '(n+1)^2'], [b, '(n+1)'], [c, '']])}$`,
        `$u_{n+1} = ${sumLatex([[a, '(n^2 + 2n + 1)'], [b, 'n'], [b, ''], [c, '']])}$`,
        `$u_{n+1} = ${good}$`,
      ],
    };
  },
};

const OPTIONS = ['Croissante', 'Décroissante', 'Ni croissante ni décroissante'];

const variation: Skill = {
  id: '1re-suite-variation',
  name: 'Étudier le sens de variation',
  generate(rng, level) {
    // u_n = a n² + b n + c, donc u_{n+1} - u_n = 2a n + (a + b).
    let a = 0;
    let b = 0;
    if (level === 1) b = rng.nonZero(-6, 6);
    else {
      a = rng.nonZero(-3, 3);
      const mixed = level === 3 && rng.next() < 0.4;
      // Pour n ≥ 0, le signe de 2an + a + b est constant si a + b a le signe de a.
      b = mixed ? -a * rng.int(3, 6) : a > 0 ? rng.int(-a + 1, 6) : rng.int(-6, -a - 1);
    }
    const c = rng.int(-8, 8);
    const d0 = a + b;
    const correct = a === 0 ? (b > 0 ? 0 : 1) : Math.sign(d0) === Math.sign(a) || d0 === 0 ? (a > 0 ? 0 : 1) : 2;
    const diff = sumLatex([[2 * a, 'n'], [d0, '']]);
    const verdict =
      correct === 2
        ? `Cette différence change de signe (elle vaut $${d0}$ pour $n = 0$ et a le signe de $${2 * a}n$ pour $n$ grand) : la suite n'est ni croissante ni décroissante.`
        : `Pour tout $n \\geq 0$, $${diff} ${correct === 0 ? '> 0' : '< 0'}$ : la suite est ${correct === 0 ? 'croissante' : 'décroissante'}.`;
    return {
      skill: this.id,
      level,
      prompt: `Pour tout entier $n \\geq 0$, $u_n = ${poly(a, b, c)}$. Quel est le sens de variation de la suite $(u_n)$ ?`,
      answer: { kind: 'choice', options: OPTIONS, correct },
      hint: 'Calcule $u_{n+1} - u_n$ et étudie son signe pour $n \\geq 0$.',
      correction: [`$u_{n+1} - u_n = ${diff}$`, verdict],
    };
  },
};

const seuil: Skill = {
  id: '1re-suite-seuil',
  name: 'Déterminer un seuil',
  generate(rng, level) {
    const geometric = level > 1 && rng.next() < 0.6;
    const u0 = geometric ? rng.int(1, 5) : rng.int(-10, 20);
    const step = geometric ? rng.pick([2, 3]) : rng.int(2, 9);
    const target = geometric ? u0 * step ** rng.int(3, 6) + rng.int(1, 30) : u0 + step * rng.int(4, 15) + rng.int(0, step - 1);
    const terms = [u0];
    while (terms[terms.length - 1] <= target) {
      const last = terms[terms.length - 1];
      terms.push(geometric ? last * step : last + step);
    }
    const n = terms.length - 1;
    const rule = geometric ? `${step}u_n` : `u_n + ${step}`;
    const correction = geometric
      ? [terms.map((t, i) => `$u_{${i}} = ${t}$`).join(', '), `$u_{${n - 1}} = ${terms[n - 1]} \\leq ${target}$ et $u_{${n}} = ${terms[n]} > ${target}$ : le seuil est $n = ${n}$.`]
      : [
          `La suite est arithmétique de raison $${step}$ : $u_n = ${u0} + ${step}n$.`,
          `$${u0} + ${step}n > ${target} \\iff n > \\frac{${target - u0}}{${step}}$, et le plus petit entier qui convient est $n = ${n}$.`,
        ];
    return {
      skill: this.id,
      level,
      prompt: `La suite $(u_n)$ est définie par $u_0 = ${u0}$ et $u_{n+1} = ${rule}$. Quel est le plus petit entier $n$ tel que $u_n > ${target}$ ?`,
      answer: { kind: 'number', value: frac(n) },
      hint: geometric ? 'Calcule les termes successifs jusqu’à dépasser le seuil.' : 'Écris $u_n$ en fonction de $n$, puis résous l’inéquation.',
      correction,
    };
  },
};

const dec = (x: number) => String(x).replace('.', '{,}');

const expliciteVariantes = [
  variant('fraction', (rng) => {
    const a = rng.nonZero(-5, 5);
    const b = rng.int(-6, 6);
    const c = rng.int(1, 5);
    const k = rng.int(0, 9);
    const value = frac(a * k + b, k + c);
    return {
      prompt: `Pour tout entier $n \\geq 0$, $u_n = \\frac{${sumLatex([[a, 'n'], [b, '']]) || '0'}}{n + ${c}}$. Calcule $u_{${k}}$ (fraction).`,
      answer: { kind: 'number', value },
      hint: `Remplace $n$ par $${k}$ au numérateur et au dénominateur.`,
      correction: [`$u_{${k}} = \\frac{${a * k + b}}{${k + c}} = ${fracLatex(value)}$`],
    };
  }),
  variant('retrouver-rang', (rng) => {
    const n = rng.int(2, 15);
    const b = rng.int(-n + 1, 8);
    const v = n * n + b * n;
    return {
      prompt: `Pour tout entier $n \\geq 0$, $u_n = ${poly(1, b, 0)}$. Pour quel entier $n$ a-t-on $u_n = ${v}$ ?`,
      answer: { kind: 'number', value: frac(n) },
      hint: 'Résous l’équation du second degré, et garde la solution entière positive.',
      correction: [`$${poly(1, b, -v)} = 0$ a pour solutions $${n}$ et $${-b - n}$ ; la seule qui convient est $n = ${n}$.`],
    };
  }),
  variant('somme-des-premiers', (rng) => {
    const a = rng.int(-2, 2);
    const b = rng.nonZero(-5, 5);
    const c = rng.int(-6, 6);
    const terms = [0, 1, 2, 3].map((k) => a * k * k + b * k + c);
    const total = terms.reduce((x, y) => x + y, 0);
    return {
      prompt: `Pour tout entier $n \\geq 0$, $u_n = ${poly(a, b, c)}$. Calcule $u_0 + u_1 + u_2 + u_3$.`,
      answer: { kind: 'number', value: frac(total) },
      hint: 'Calcule chacun des quatre termes, puis additionne.',
      correction: [`$u_0 = ${terms[0]}$, $u_1 = ${terms[1]}$, $u_2 = ${terms[2]}$, $u_3 = ${terms[3]}$ : la somme vaut $${total}$.`],
    };
  }),
];

const recurrenteVariantes = [
  variant('remonter', (rng) => {
    const a = rng.pick([1, 2, -1, 3]);
    const b = rng.nonZero(-5, 5);
    const u0 = rng.int(-5, 5);
    const u1 = a * u0 + b;
    const u2 = a * u1 + b;
    return {
      prompt: `La suite $(u_n)$ vérifie, pour tout $n \\geq 0$, $u_{n+1} = ${sumLatex([[a, 'u_n'], [b, '']])}$, et $u_2 = ${u2}$. Calcule $u_0$.`,
      answer: { kind: 'number', value: frac(u0) },
      hint: 'Remonte : trouve d’abord $u_1$ à partir de $u_2$, puis $u_0$.',
      correction: [`$${sumLatex([[a, 'u_1'], [b, '']])} = ${u2}$ donne $u_1 = ${u1}$.`, `$${sumLatex([[a, 'u_0'], [b, '']])} = ${u1}$ donne $u_0 = ${u0}$.`],
    };
  }),
  variant('carre', (rng) => {
    const c = rng.int(-3, 3);
    const u0 = rng.int(-2, 2);
    const terms = [u0];
    for (let i = 0; i < 3; i++) terms.push(terms[i] ** 2 + c);
    return {
      prompt: `La suite $(u_n)$ est définie par $u_0 = ${u0}$ et $u_{n+1} = ${sumLatex([[1, 'u_n^2'], [c, '']])}$. Calcule $u_3$.`,
      answer: { kind: 'number', value: frac(terms[3]) },
      hint: 'Calcule $u_1$, puis $u_2$, puis $u_3$.',
      correction: terms.slice(1).map((v, i) => `$u_{${i + 1}} = ${paren(terms[i])}^2 ${c < 0 ? '-' : '+'} ${Math.abs(c)} = ${v}$`),
    };
  }),
  variant('fibonacci', (rng) => {
    const u0 = rng.int(-3, 5);
    const u1 = rng.int(-3, 5);
    const terms = [u0, u1];
    for (let i = 2; i <= 6; i++) terms.push(terms[i - 1] + terms[i - 2]);
    return {
      prompt: `La suite $(u_n)$ est définie par $u_0 = ${u0}$, $u_1 = ${u1}$ et, pour tout $n \\geq 0$, $u_{n+2} = u_{n+1} + u_n$. Calcule $u_6$.`,
      answer: { kind: 'number', value: frac(terms[6]) },
      hint: 'Chaque terme est la somme des deux précédents.',
      correction: [terms.map((v, i) => `$u_{${i}} = ${v}$`).join(', ')],
    };
  }),
];

const suivantVariantes = [
  variant('u-2n', (rng) => {
    const a = rng.nonZero(-3, 3);
    const b = rng.int(-5, 5);
    const c = rng.int(-6, 6);
    const good = poly(4 * a, 2 * b, c);
    const decoys = [poly(2 * a, 2 * b, c), poly(2 * a, 2 * b, 2 * c), poly(4 * a, 2 * b, 2 * c), poly(4 * a, b, c)];
    return {
      prompt: `Pour tout entier $n$, $u_n = ${poly(a, b, c)}$. Quelle est l'expression de $u_{2n}$ ?`,
      answer: makeChoice(rng, `$u_{2n} = ${good}$`, decoys.map((d) => `$u_{2n} = ${d}$`), () => `$u_{2n} = ${poly(4 * a, rng.int(-9, 9), c)}$`),
      hint: 'Remplace $n$ par $2n$ : attention, $(2n)^2 = 4n^2$.',
      correction: [`$u_{2n} = ${sumLatex([[a, '(2n)^2'], [b, '(2n)'], [c, '']])} = ${good}$`],
    };
  }),
  variant('difference', (rng) => {
    const a = rng.nonZero(-3, 3);
    const b = rng.int(-5, 5);
    const c = rng.int(-6, 6);
    const lin = (p: number, q: number) => sumLatex([[p, 'n'], [q, '']]) || '0';
    const good = lin(2 * a, a + b);
    return {
      prompt: `Pour tout entier $n$, $u_n = ${poly(a, b, c)}$. Que vaut $u_{n+1} - u_n$ ?`,
      answer: makeChoice(rng, `$${good}$`, [lin(2 * a, b), lin(a, a + b), lin(2 * a, a + b + c), lin(2 * a, a)].map((d) => `$${d}$`), () => `$${lin(2 * a, rng.int(-9, 9))}$`),
      hint: 'Développe $u_{n+1}$, puis soustrais $u_n$ : les termes en $n^2$ s’éliminent.',
      correction: [`$u_{n+1} = ${poly(a, 2 * a + b, a + b + c)}$`, `$u_{n+1} - u_n = ${good}$`],
    };
  }),
];

const variationVariantes = [
  variant('geometrique', (rng) => {
    const c = rng.nonZero(-5, 5);
    const [qTex, q] = rng.pick([['2', 2], ['3', 3], ['\\frac{1}{2}', 0.5], ['\\frac{1}{3}', 1 / 3], ['(-2)', -2]] as [string, number][]);
    const correct = q < 0 ? 2 : (c > 0) === (q > 1) ? 0 : 1;
    return {
      prompt: `Pour tout entier $n \\geq 0$, $u_n = ${c === 1 ? '' : c === -1 ? '-' : `${c}\\times `}${qTex}^n$. Quel est le sens de variation de la suite $(u_n)$ ?`,
      answer: { kind: 'choice', options: OPTIONS, correct },
      hint: '$u_{n+1} - u_n = u_n(q - 1)$ : étudie le signe de chaque facteur.',
      correction: [
        q < 0 ? 'La raison est négative : les termes changent de signe à chaque rang, la suite n’est pas monotone.' : `$u_{n+1} - u_n = ${c}\\times ${qTex}^n \\times (${qTex} - 1)$, qui est ${correct === 0 ? 'positif' : 'négatif'} : la suite est ${correct === 0 ? 'croissante' : 'décroissante'}.`,
      ],
    };
  }),
  variant('quotient', (rng) => {
    const c = rng.int(-5, 5);
    const k = rng.nonZero(-6, 6);
    const d = rng.int(1, 4);
    const correct = k < 0 ? 0 : 1;
    return {
      prompt: `Pour tout entier $n \\geq 0$, $u_n = ${c === 0 ? '' : `${c} ${k < 0 ? '-' : '+'} `}${c === 0 && k < 0 ? '-' : ''}\\frac{${Math.abs(k)}}{n + ${d}}$. Quel est le sens de variation de la suite $(u_n)$ ?`,
      answer: { kind: 'choice', options: OPTIONS, correct },
      hint: 'Quand $n$ augmente, $\\frac{1}{n + d}$ diminue.',
      correction: [`$\\frac{${Math.abs(k)}}{n + ${d}}$ diminue quand $n$ augmente ; ${k > 0 ? 'on l’ajoute' : 'on le retranche'}, donc la suite est ${correct === 0 ? 'croissante' : 'décroissante'}.`],
    };
  }),
  variant('recurrence', (rng) => {
    const kind = rng.int(0, 2);
    const k = rng.int(1, 5);
    const u0 = rng.int(-5, 5);
    const ajout = kind === 0 ? sumLatex([[1, 'n^2'], [k, '']]) : kind === 1 ? `(n + ${k})^2` : sumLatex([[1, 'n'], [-k, '']]);
    const op = kind === 1 ? '-' : '+';
    return {
      prompt: `La suite $(u_n)$ est définie par $u_0 = ${u0}$ et $u_{n+1} = u_n ${op} ${kind === 2 ? `(${ajout})` : ajout}$. Quel est le sens de variation de la suite $(u_n)$ ?`,
      answer: { kind: 'choice', options: OPTIONS, correct: kind },
      hint: 'Exprime $u_{n+1} - u_n$ et étudie son signe.',
      correction: [
        kind === 0 ? `$u_{n+1} - u_n = ${ajout} > 0$ : la suite est croissante.` : kind === 1 ? `$u_{n+1} - u_n = -(n + ${k})^2 < 0$ : la suite est décroissante.` : `$u_{n+1} - u_n = ${ajout}$ est négatif pour $n < ${k}$ et positif pour $n > ${k}$ : la suite n'est pas monotone.`,
      ],
    };
  }),
];

const seuilVariantes = [
  variant('algorithme', (rng) => {
    const baisse = rng.next() < 0.5;
    const u0 = baisse ? 100 * rng.int(5, 50) : rng.int(1, 9);
    const q = baisse ? 0.5 : rng.pick([2, 3]);
    const S = baisse ? rng.int(2, 40) : rng.int(50, 2000);
    let u = u0;
    let n = 0;
    while (baisse ? u > S : u < S) {
      u *= q;
      n++;
    }
    return {
      prompt: `On exécute l'algorithme suivant : $u \\leftarrow ${u0}$ et $n \\leftarrow 0$ ; tant que $u ${baisse ? '>' : '<'} ${S}$, $u \\leftarrow ${dec(q)}u$ et $n \\leftarrow n + 1$. Quelle est la valeur de $n$ à la fin ?`,
      answer: { kind: 'number', value: frac(n) },
      hint: 'Fais tourner l’algorithme à la main en notant $u$ et $n$ à chaque tour.',
      correction: [`L'algorithme s'arrête dès que $u ${baisse ? '\\leq' : '\\geq'} ${S}$, ici pour $u = ${dec(u)}$ : $n = ${n}$.`],
    };
  }),
  variant('doublement', (rng) => {
    const t = rng.pick([5, 10, 15, 20, 25, 30, 50]);
    let n = 0;
    while ((1 + t / 100) ** n <= 2) n++;
    return {
      prompt: `Un capital est placé à intérêts composés au taux annuel de $${t}\\,\\%$. Au bout de combien d'années aura-t-il plus que doublé ?`,
      answer: { kind: 'number', value: frac(n) },
      hint: `Cherche le plus petit entier $n$ tel que $${dec(1 + t / 100)}^n > 2$.`,
      correction: [`$${dec(1 + t / 100)}^{${n - 1}} \\approx ${dec(Math.round((1 + t / 100) ** (n - 1) * 1000) / 1000)} \\leq 2$ et $${dec(1 + t / 100)}^{${n}} \\approx ${dec(Math.round((1 + t / 100) ** n * 1000) / 1000)} > 2$ : il faut $${n}$ ans.`],
    };
  }),
];

export const SUITES_NUMERIQUES: ChapterDef = {
  id: '1re-suites-numeriques',
  title: 'Suites numériques',
  region: 'Prairie des Suites',
  theme: 'prairie',
  terrain: 'lac',
  skills: [
    enrich(explicite, expliciteVariantes),
    enrich(recurrente, recurrenteVariantes),
    enrich(suivant, suivantVariantes),
    enrich(variation, variationVariantes),
    enrich(seuil, seuilVariantes),
  ],
  creatures: [
    {
      id: '1re-suivanou',
      name: 'Suivanou',
      description: 'Un petit être qui avance d’un pas à chaque rang. Donne-lui un rang, il te rend le terme.',
      skills: ['1re-suite-explicite'],
      look: { shape: 'blob', hue: 95, symbol: 'uₙ' },
    },
    {
      id: '1re-termelot',
      name: 'Termelot',
      description: 'Un poisson qui nage de terme en terme sans jamais en oublier un.',
      skills: ['1re-suite-explicite', '1re-suite-recurrente'],
      look: { shape: 'poisson', hue: 200, symbol: 'u₀' },
    },
    {
      id: '1re-recurrenard',
      name: 'Récurrenard',
      description: 'Ce renard rusé ne connaît que le terme d’avant : pour aller loin, il faut tout recalculer.',
      skills: ['1re-suite-recurrente', '1re-suite-suivant'],
      look: { shape: 'bete', hue: 28, symbol: 'n+1' },
    },
    {
      id: '1re-croissaline',
      name: 'Croissaline',
      description: 'Une fleur qui grandit chaque jour… ou qui fane, selon le signe de la différence entre deux termes.',
      skills: ['1re-suite-variation', '1re-suite-suivant'],
      look: { shape: 'plante', hue: 330, symbol: '↗' },
    },
    {
      id: '1re-seuillon',
      name: 'Seuillon',
      description: 'Un scarabée qui guette le premier rang où la suite franchit la ligne.',
      skills: ['1re-suite-seuil', '1re-suite-variation'],
      look: { shape: 'insecte', hue: 50, symbol: '>' },
    },
  ],
  boss: {
    id: '1re-recursaure',
    name: 'Récursaure',
    description: 'Le gardien de la prairie : un colosse dont chaque pierre est posée sur la précédente.',
    skills: ['1re-suite-explicite', '1re-suite-recurrente', '1re-suite-suivant', '1re-suite-variation', '1re-suite-seuil'],
    look: { shape: 'golem', hue: 110, symbol: '∞' },
  },
};
