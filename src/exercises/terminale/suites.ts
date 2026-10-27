import { frac } from '../fraction';
import type { Skill } from '../types';
import { enrich, variant } from '../variantes';
import { F, add, bound, div, choiceTex, fixedChoice, num, numF, par, plus, poly, skill, tex } from './util';

/** Chapitre « Suites et raisonnement par récurrence » (Terminale spécialité). */

const termeRecurrence = skill('tle-terme-recurrence', 'Calculer des termes d’une suite récurrente', (rng, level) => {
  const a = level === 1 ? rng.pick([2, 3]) : rng.pick([-2, 2, 3, -3]);
  const b = rng.int(-5, 5);
  const u0 = rng.int(-3, 4);
  const n = level === 3 ? 4 : 3;
  const terms = [u0];
  for (let i = 1; i <= n; i++) terms.push(a * terms[i - 1] + b);
  return {
    prompt: `On définit $u_0 = ${u0}$ et, pour tout $n \\in \\mathbb{N}$, $u_{n+1} = ${a}u_n${plus(b)}$. Calcule $u_${n}$.`,
    answer: num(terms[n]),
    hint: 'Calcule les termes un par un : $u_1$ à partir de $u_0$, puis $u_2$ à partir de $u_1$, etc.',
    correction: terms.slice(1).map((t, i) => `$u_${i + 1} = ${a}\\times ${par(terms[i])}${plus(b)} = ${t}$`),
  };
});

const sommeArith = skill('tle-somme-entiers', 'Sommer des termes consécutifs', (rng, level) => {
  const n = rng.int(bound(level, 10, 30, 60), bound(level, 20, 60, 120));
  if (level === 1) {
    const s = (n * (n + 1)) / 2;
    return {
      prompt: `Calcule $S = 1 + 2 + 3 + \\dots + ${n}$.`,
      answer: num(s),
      hint: 'Pour tout $n$, on a $1 + 2 + \\dots + n = \\frac{n(n+1)}{2}$ (cela se démontre par récurrence).',
      correction: [`$S = \\frac{${n}\\times ${n + 1}}{2} = ${s}$`],
    };
  }
  // Somme des termes u_0 … u_n d'une suite arithmétique.
  const u0 = rng.int(-5, 9);
  const r = rng.nonZero(-4, 5);
  const last = u0 + n * r;
  const s = ((n + 1) * (u0 + last)) / 2;
  return {
    prompt: `$(u_n)$ est arithmétique de premier terme $u_0 = ${u0}$ et de raison $r = ${r}$. Calcule $S = u_0 + u_1 + \\dots + u_{${n}}$.`,
    answer: num(s),
    hint: 'Somme = nombre de termes × (premier terme + dernier terme) / 2.',
    correction: [
      `Dernier terme : $u_{${n}} = u_0 + ${n}r = ${u0}${plus(n * r)} = ${last}$.`,
      `Il y a $${n + 1}$ termes, donc $S = ${n + 1}\\times\\frac{${u0}${plus(last)}}{2} = ${s}$.`,
    ],
  };
});

const sommeGeom = skill('tle-somme-geometrique', 'Sommer des termes d’une suite géométrique', (rng, level) => {
  const q = level === 1 ? 2 : rng.pick([2, 3, -2]);
  const n = rng.int(bound(level, 4, 4, 5), bound(level, 7, 7, 8));
  const u0 = level === 3 ? rng.pick([1, 2, 3, 5]) : 1;
  const s = (u0 * (q ** (n + 1) - 1)) / (q - 1);
  const first = u0 === 1 ? '' : `${u0}\\times`;
  return {
    prompt: `Calcule $S = ${u0 === 1 ? '' : `${u0}(`}1 + ${par(q)} + ${par(q)}^2 + \\dots + ${par(q)}^{${n}}${u0 === 1 ? '' : ')'}$.`,
    answer: num(s),
    hint: 'Pour $q \\neq 1$ : $1 + q + \\dots + q^n = \\frac{q^{n+1} - 1}{q - 1}$.',
    correction: [
      `$S = ${first}\\frac{${par(q)}^{${n + 1}} - 1}{${par(q)} - 1} = ${first}\\frac{${q ** (n + 1)} - 1}{${q - 1}}$`,
      `$S = ${s}$`,
    ],
  };
});

const variation = skill('tle-sens-variation', 'Étudier le sens de variation d’une suite', (rng, level) => {
  // u_n = c·q^n + d : croissante si c(q - 1) > 0 (q > 0).
  const kind = rng.int(0, 2);
  const d = rng.int(-5, 5);
  if (kind === 2 && level > 1) {
    const c = rng.nonZero(-4, 4);
    const q = -rng.pick([2, 3]);
    return {
      prompt: `Pour tout $n \\in \\mathbb{N}$, $u_n = ${c === 1 ? '' : c === -1 ? '-' : c}(${q})^n${plus(d)}$. Quel est le sens de variation de $(u_n)$ ?`,
      answer: fixedChoice(['Croissante', 'Décroissante', 'Constante', 'Ni croissante ni décroissante'], 3),
      hint: 'Regarde le signe de $(-2)^n$ ou $(-3)^n$ selon la parité de $n$.',
      correction: [`$(${q})^n$ change de signe à chaque rang : les termes alternent, la suite n’est pas monotone.`],
    };
  }
  const c = rng.nonZero(-4, 4);
  const q = rng.pick(level === 1 ? [2, 3] : [2, 3, 5]);
  const diff = `u_{n+1} - u_n = ${c}\\times ${q}^{n+1} - ${par(c)}\\times ${q}^n = ${c * (q - 1)}\\times ${q}^n`;
  const up = c > 0;
  return {
    prompt: `Pour tout $n \\in \\mathbb{N}$, $u_n = ${c === 1 ? '' : c === -1 ? '-' : c}\\times ${q}^n${plus(d)}$. Quel est le sens de variation de $(u_n)$ ?`,
    answer: fixedChoice(['Croissante', 'Décroissante', 'Constante', 'Ni croissante ni décroissante'], up ? 0 : 1),
    hint: 'Étudie le signe de $u_{n+1} - u_n$.',
    correction: [`$${diff}$`, `Ce nombre est ${up ? 'positif' : 'négatif'} pour tout $n$ : la suite est ${up ? 'croissante' : 'décroissante'}.`],
  };
});

const heredite = skill('tle-heredite', 'Rédiger l’hérédité d’une récurrence', (rng) => {
  const a = rng.pick([2, 3, 5]);
  const b = rng.int(1, 6);
  // u_{n+1} = a u_n - (a-1)b avec u_0 = b + 1 : u_n = a^n + b.
  const c = (a - 1) * b;
  const prop = `u_n = ${a}^n + ${b}`;
  const propNext = `u_{n+1} = ${a}^{n+1} + ${b}`;
  const answer = choiceTex(
    rng,
    `\\text{Supposer } ${prop} \\text{ pour un } n \\text{, montrer } ${propNext}`,
    [
      `\\text{Supposer } ${propNext} \\text{, montrer } ${prop}`,
      `\\text{Supposer } ${prop} \\text{ pour tout } n \\text{, montrer } ${propNext}`,
      `\\text{Vérifier } u_0 = ${a}^0 + ${b} \\text{ seulement}`,
    ],
    () => `\\text{Montrer } u_{n+1} - u_n > 0`,
  );
  return {
    prompt: `On a $u_0 = ${b + 1}$ et $u_{n+1} = ${a}u_n - ${c}$. On veut prouver par récurrence que $${prop}$ pour tout $n$. Que fait-on dans l’hérédité ?`,
    answer,
    hint: 'L’hérédité montre que si la propriété est vraie à un rang $n$ fixé, elle est vraie au rang suivant.',
    correction: [
      `Hérédité : on suppose $${prop}$ pour un entier $n$ fixé (hypothèse de récurrence).`,
      `Alors $u_{n+1} = ${a}(${a}^n + ${b}) - ${c} = ${a}^{n+1} + ${a * b} - ${c} = ${a}^{n+1} + ${b}$.`,
      'La propriété est donc vraie au rang $n+1$.',
    ],
  };
});

const formuleExplicite = skill('tle-conjecture', 'Conjecturer une formule explicite', (rng, level) => {
  // u_{n+1} = u_n + (2a n + a + b), u_0 = c : u_n = a n² + b n + c.
  const a = level === 1 ? 1 : rng.pick([1, 2, 3]);
  const b = rng.int(-3, 3);
  const c = rng.int(-4, 4);
  const step = poly([2 * a, a + b], 'n');
  const correct = poly([a, b, c], 'n');
  const answer = choiceTex(
    rng,
    `u_n = ${correct}`,
    [`u_n = ${poly([a, b + 1, c], 'n')}`, `u_n = ${poly([2 * a, b, c], 'n')}`, `u_n = ${poly([a, -b, c], 'n')}`, `u_n = ${poly([a, b, c + a], 'n')}`],
    () => `u_n = ${poly([a, b, c + rng.nonZero(-3, 3)], 'n')}`,
  );
  const u = (n: number) => a * n * n + b * n + c;
  return {
    prompt: `On a $u_0 = ${c}$ et $u_{n+1} = u_n + (${step})$. Quelle formule explicite peut-on démontrer par récurrence ?`,
    answer,
    hint: 'Calcule $u_1$, $u_2$, $u_3$ et teste chaque formule.',
    correction: [
      `$u_1 = ${u(1)}$, $u_2 = ${u(2)}$, $u_3 = ${u(3)}$.`,
      `Seule $u_n = ${correct}$ redonne ces valeurs.`,
      `Hérédité : si $u_n = ${correct}$, alors $u_{n+1} = ${poly([a, 2 * a + b, a + b + c], 'n')}$, qui vaut bien $${a === 1 ? '' : a}(n+1)^2${b === 0 ? '' : `${b < 0 ? ' - ' : ' + '}${Math.abs(b) === 1 ? '' : Math.abs(b)}(n+1)`}${plus(c)}$.`,
    ],
  };
});

const terme = skill('tle-terme-geometrique', 'Exprimer le terme général', (rng, level) => {
  const qf = level === 1 ? F(rng.pick([2, 3])) : rng.pick([F(1, 2), F(3), F(-2), F(2, 3), F(-1, 2)]);
  const u0 = rng.nonZero(-4, 6);
  const n = rng.int(3, 5);
  const value = frac(u0 * qf.n ** n, qf.d ** n);
  return {
    prompt: `$(u_n)$ est géométrique de premier terme $u_0 = ${u0}$ et de raison $q = ${tex(qf)}$. Calcule $u_{${n}}$.`,
    answer: numF(value),
    hint: 'Pour une suite géométrique, $u_n = u_0 \\times q^n$.',
    correction: [`$u_{${n}} = ${u0}\\times \\left(${tex(qf)}\\right)^{${n}} = ${tex(value)}$`],
  };
});

const VARIATION = ['Croissante', 'Décroissante', 'Constante', 'Ni croissante ni décroissante'];

const termeRecurrenceVariantes = [
  variant('homographique', (rng) => {
    const a = rng.int(1, 4);
    const b = rng.int(1, 3);
    const u0 = rng.int(0, 4);
    let u = F(u0);
    const lines: string[] = [];
    for (let i = 1; i <= 3; i++) {
      u = div(F(a), add(u, F(b)));
      lines.push(`$u_${i} = ${tex(u)}$`);
    }
    return {
      prompt: `On définit $u_0 = ${u0}$ et, pour tout $n$, $u_{n+1} = \\frac{${a}}{u_n + ${b}}$. Calcule $u_3$ (fraction).`,
      answer: numF(u),
      hint: 'Calcule $u_1$, puis $u_2$, puis $u_3$, en gardant des fractions.',
      correction: lines,
    };
  }),
  variant('remonter', (rng) => {
    const a = rng.pick([2, -2, 3]);
    const b = rng.int(-5, 5);
    const u0 = rng.int(-4, 4);
    const terms = [u0];
    for (let i = 1; i <= 3; i++) terms.push(a * terms[i - 1] + b);
    return {
      prompt: `La suite $(u_n)$ vérifie $u_{n+1} = ${a}u_n${plus(b)}$ pour tout $n$, et $u_3 = ${terms[3]}$. Calcule $u_0$.`,
      answer: num(u0),
      hint: `Remonte : $u_n = \\frac{u_{n+1}${plus(-b)}}{${a}}$.`,
      correction: [`$u_2 = ${terms[2]}$, $u_1 = ${terms[1]}$, $u_0 = ${u0}$.`],
    };
  }),
  variant('avec-n', (rng) => {
    const u0 = rng.int(-5, 5);
    const k = rng.int(4, 8);
    const c = rng.int(-3, 3);
    const terms = [u0];
    for (let n = 0; n < k; n++) terms.push(terms[n] + 2 * n + c);
    return {
      prompt: `On définit $u_0 = ${u0}$ et, pour tout $n$, $u_{n+1} = u_n + ${poly([2, c], 'n')}$. Calcule $u_{${k}}$.`,
      answer: num(terms[k]),
      hint: 'Le terme ajouté dépend du rang : calcule-le à chaque étape.',
      correction: [terms.map((t, i) => `$u_${i === 0 ? 0 : `{${i}}`} = ${t}$`).join(', ')],
    };
  }),
];

const sommeArithVariantes = [
  variant('carres', (rng) => {
    const n = rng.int(4, 20);
    const s = (n * (n + 1) * (2 * n + 1)) / 6;
    return {
      prompt: `On admet (et on le démontre par récurrence) que $1^2 + 2^2 + \\dots + n^2 = \\frac{n(n+1)(2n+1)}{6}$. Calcule $1^2 + 2^2 + \\dots + ${n}^2$.`,
      answer: num(s),
      hint: `Remplace $n$ par $${n}$ dans la formule.`,
      correction: [`$\\frac{${n}\\times ${n + 1}\\times ${2 * n + 1}}{6} = ${s}$`],
    };
  }),
  variant('entre-deux-bornes', (rng) => {
    const p = rng.int(5, 40);
    const q = p + rng.int(5, 40);
    const s = ((q - p + 1) * (p + q)) / 2;
    return {
      prompt: `Calcule $S = ${p} + ${p + 1} + ${p + 2} + \\dots + ${q}$.`,
      answer: num(s),
      hint: 'Compte les termes, puis utilise : nombre de termes × (premier + dernier) / 2.',
      correction: [`Il y a $${q} - ${p} + 1 = ${q - p + 1}$ termes, donc $S = ${q - p + 1}\\times\\frac{${p} + ${q}}{2} = ${s}$.`],
    };
  }),
];

const sommeGeomVariantes = [
  variant('puissances-inverses', (rng) => {
    const q = rng.pick([2, 3]);
    const n = rng.int(3, 6);
    const value = frac(q ** (n + 1) - 1, (q - 1) * q ** n);
    return {
      prompt: `Calcule $S = 1 + \\frac{1}{${q}} + \\frac{1}{${q}^2} + \\dots + \\frac{1}{${q}^{${n}}}$ (fraction).`,
      answer: numF(value),
      hint: `Suite géométrique de raison $\\frac{1}{${q}}$ : $1 + r + \\dots + r^n = \\frac{1 - r^{n+1}}{1 - r}$.`,
      correction: [`$S = \\frac{1 - \\left(\\frac{1}{${q}}\\right)^{${n + 1}}}{1 - \\frac{1}{${q}}} = ${tex(value)}$`],
    };
  }),
  variant('retrouver-n', (rng) => {
    const q = rng.pick([2, 3]);
    const n = rng.int(3, 9);
    const s = (q ** (n + 1) - 1) / (q - 1);
    return {
      prompt: `On sait que $1 + ${q} + ${q}^2 + \\dots + ${q}^n = ${s}$. Que vaut $n$ ?`,
      answer: num(n),
      hint: `$1 + ${q} + \\dots + ${q}^n = \\frac{${q}^{n+1} - 1}{${q - 1}}$ : trouve la puissance de ${q} qui convient.`,
      correction: [`$\\frac{${q}^{n+1} - 1}{${q - 1}} = ${s} \\iff ${q}^{n+1} = ${q ** (n + 1)} \\iff n + 1 = ${n + 1}$, donc $n = ${n}$.`],
    };
  }),
];

const variationVariantes = [
  variant('quotient', (rng) => {
    const a = rng.int(-4, 5);
    const b = rng.int(-4, 5);
    const correct = a > b ? 0 : a < b ? 1 : 2;
    return {
      prompt: `Pour tout $n \\in \\mathbb{N}$, $u_n = \\frac{${poly([a, b], 'n')}}{n + 1}$. Quel est le sens de variation de $(u_n)$ ?`,
      answer: fixedChoice(VARIATION, correct),
      hint: 'Réduis $u_{n+1} - u_n$ au même dénominateur.',
      correction: [`$u_{n+1} - u_n = \\frac{${a - b}}{(n + 1)(n + 2)}$ : ${correct === 2 ? 'la suite est constante' : `la suite est ${VARIATION[correct].toLowerCase()}`}.`],
    };
  }),
  variant('difference', (rng) => {
    const kind = rng.int(0, 2);
    const k = rng.int(1, 4);
    const c = rng.int(1, 5);
    const expr = kind === 0 ? `(n - ${k})^2 + ${c}` : kind === 1 ? `-(${poly([1, k], 'n')})` : poly([1, -k], 'n');
    const correct = kind === 0 ? 0 : kind === 1 ? 1 : 3;
    return {
      prompt: `La suite $(u_n)$ vérifie, pour tout $n \\in \\mathbb{N}$, $u_{n+1} - u_n = ${expr}$. Quel est le sens de variation de $(u_n)$ ?`,
      answer: fixedChoice(VARIATION, correct),
      hint: 'Étudie le signe de cette expression pour tous les entiers $n \\geq 0$.',
      correction: [kind === 0 ? 'Un carré plus un nombre positif est strictement positif : croissante.' : kind === 1 ? `Pour $n \\geq 0$, $${poly([1, k], 'n')} > 0$ : la différence est négative, décroissante.` : `La différence vaut $${-k}$ en $n = 0$ et $1$ en $n = ${k + 1}$ : elle change de signe, la suite n'est pas monotone.`],
    };
  }),
];

const VF_RECURRENCE: [string, boolean, string][] = [
  ['si $P(0)$ est vraie et si $P$ est héréditaire, alors $P(n)$ est vraie pour tout $n \\in \\mathbb{N}$', true, 'c’est le principe de récurrence.'],
  ['si $P$ est héréditaire, alors $P(n)$ est vraie pour tout $n$', false, 'sans initialisation, rien ne démarre : « $n > n + 1$ » est héréditaire mais toujours fausse.'],
  ['si $P(0)$ et $P(1)$ sont vraies, alors $P(n)$ est vraie pour tout $n$', false, 'quelques cas vrais ne prouvent pas l’hérédité.'],
  ['dans l’hérédité, on suppose $P(n)$ vraie pour tout $n$', false, 'on la suppose pour un $n$ fixé : sinon on admettrait ce qu’on veut prouver.'],
  ['pour prouver $P(n)$ pour tout $n \\geq 3$, on peut initialiser au rang $3$', true, 'on initialise au premier rang concerné.'],
];

const herediteVariantes = [
  variant('initialisation', (rng) => {
    const a = rng.pick([2, 3, 5]);
    const b = rng.int(1, 6);
    const c = (a - 1) * b;
    const answer = choiceTex(
      rng,
      `\\text{Vérifier que } u_0 = ${a}^0 + ${b} = ${b + 1}`,
      [`\\text{Vérifier que } u_1 = ${a}u_0 - ${c}`, `\\text{Supposer } u_n = ${a}^n + ${b}`, `\\text{Vérifier que } u_0 = ${a} + ${b}`],
      () => `\\text{Calculer } u_{n+1} - u_n`,
    );
    return {
      prompt: `On a $u_0 = ${b + 1}$ et $u_{n+1} = ${a}u_n - ${c}$. On veut prouver par récurrence que $u_n = ${a}^n + ${b}$ pour tout $n$. Que fait-on à l’initialisation ?`,
      answer,
      hint: 'L’initialisation vérifie la propriété au premier rang.',
      correction: [`Au rang $0$ : $${a}^0 + ${b} = ${b + 1} = u_0$. La propriété est vraie au rang $0$.`],
    };
  }),
  variant('vrai-faux', (rng) => {
    const [texte, ok, why] = rng.pick(VF_RECURRENCE);
    return {
      prompt: `Vrai ou faux : ${texte}.`,
      answer: fixedChoice(['Vrai', 'Faux'], ok ? 0 : 1),
      hint: 'Une récurrence a deux étapes : l’initialisation et l’hérédité.',
      correction: [`C’est ${ok ? 'vrai' : 'faux'} : ${why}`],
    };
  }),
];

const formuleExpliciteVariantes = [
  variant('arithmetico-geometrique', (rng) => {
    const a = rng.pick([2, 3, -2]);
    const l = rng.nonZero(-4, 4);
    const c = rng.nonZero(-3, 3);
    const b = l * (1 - a);
    const u0 = c + l;
    const coef = (cc: number) => (cc === 1 ? '' : cc === -1 ? '-' : `${cc}\\times `);
    const f = (cc: number, aa: number, ll: number) => `u_n = ${coef(cc)}${aa < 0 ? `(${aa})` : aa}^n${plus(ll)}`;
    return {
      prompt: `On a $u_0 = ${u0}$ et $u_{n+1} = ${a}u_n${plus(b)}$. Quelle formule explicite peut-on démontrer par récurrence ?`,
      answer: choiceTex(rng, f(c, a, l), [f(u0, a, 0), f(c, a, -l), f(u0, a, l), f(c, a, b)], () => f(c + rng.nonZero(-2, 2), a, l)),
      hint: 'Calcule $u_1$ et $u_2$, puis teste chaque formule.',
      correction: [`$u_1 = ${a * u0 + b}$ et $u_2 = ${a * (a * u0 + b) + b}$.`, `Hérédité : si $${f(c, a, l)}$, alors $u_{n+1} = ${a}u_n${plus(b)} = ${coef(c)}${a < 0 ? `(${a})` : a}^{n+1}${plus(l)}$.`],
    };
  }),
  variant('grand-rang', (rng) => {
    const u0 = rng.int(-5, 5);
    const k = rng.int(10, 60);
    return {
      prompt: `On a $u_0 = ${u0}$ et $u_{n+1} = u_n + 2n + 1$. On démontre par récurrence que $u_n = n^2${plus(u0)}$. Calcule $u_{${k}}$.`,
      answer: num(k * k + u0),
      hint: 'Utilise la formule explicite plutôt que de calculer tous les termes.',
      correction: [`$u_{${k}} = ${k}^2${plus(u0)} = ${k * k + u0}$`],
    };
  }),
];

const termeVariantes = [
  variant('premier-terme', (rng) => {
    const q = rng.pick([2, 3, -2, -3]);
    const n = rng.int(2, 5);
    const u0 = rng.nonZero(-5, 5);
    return {
      prompt: `$(u_n)$ est géométrique de raison $q = ${q}$, et $u_{${n}} = ${u0 * q ** n}$. Calcule $u_0$.`,
      answer: num(u0),
      hint: `$u_{${n}} = u_0 \\times q^{${n}}$.`,
      correction: [`$u_0 = \\frac{${u0 * q ** n}}{${par(q)}^{${n}}} = ${u0}$`],
    };
  }),
  variant('terme-general', (rng) => {
    const q = rng.pick([2, 3, -2, 5]);
    const u1 = rng.nonZero(-5, 5);
    const g = (c: string, e: string) => `u_n = ${c}\\times ${par(q)}^{${e}}`;
    return {
      prompt: `$(u_n)$ est géométrique de raison $${q}$ et de premier terme $u_1 = ${u1}$ (la suite commence au rang $1$). Quel est son terme général ?`,
      answer: choiceTex(rng, g(String(u1), 'n-1'), [g(String(u1), 'n'), g(String(u1), 'n+1'), `u_n = ${u1} + ${par(q)}(n-1)`], () => g(String(u1 * q), 'n+1')),
      hint: 'Pour une suite géométrique, $u_n = u_p \\times q^{n - p}$.',
      correction: [`$u_n = u_1 \\times q^{n-1} = ${u1}\\times ${par(q)}^{n-1}$`],
    };
  }),
];

export const SUITES_SKILLS: Skill[] = [
  enrich(termeRecurrence, termeRecurrenceVariantes),
  enrich(sommeArith, sommeArithVariantes),
  enrich(sommeGeom, sommeGeomVariantes),
  enrich(variation, variationVariantes),
  enrich(heredite, herediteVariantes),
  enrich(formuleExplicite, formuleExpliciteVariantes),
  enrich(terme, termeVariantes),
];
