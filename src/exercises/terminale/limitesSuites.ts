import type { Skill } from '../types';
import { enrich, variant } from '../variantes';
import { F, bound, choiceTex, div, fixedChoice, mul, num, numF, par, plus, poly, skill, sub, tex } from './util';

/** Chapitre « Limites de suites » (Terminale spécialité). */

const INF = ['+\\infty', '-\\infty'];

const quotient = skill('tle-limite-quotient', 'Lever une indétermination dans un quotient', (rng, level) => {
  const p = rng.int(1, level === 1 ? 2 : 3);
  const q = level === 1 ? p : rng.int(1, 3);
  const a = rng.nonZero(-5, 5);
  const c = rng.nonZero(-4, 6);
  const top = [a, ...Array.from({ length: p }, () => rng.int(-6, 6))];
  const bottom = [c, ...Array.from({ length: q }, () => rng.int(-6, 6))];
  let correct: string;
  let why: string;
  if (p === q) {
    correct = tex(F(a, c));
    why = `Même degré : la limite est le quotient des termes de plus haut degré, $\\frac{${a}}{${c}} = ${correct}$.`;
  } else if (p < q) {
    correct = '0';
    why = 'Le degré du numérateur est plus petit : le quotient tend vers $0$.';
  } else {
    correct = a / c > 0 ? '+\\infty' : '-\\infty';
    why = `Après factorisation, le quotient se comporte comme $\\frac{${a}}{${c}}n^{${p - q}}$, qui tend vers $${correct}$.`;
  }
  const answer = choiceTex(rng, correct, ['0', ...INF, tex(F(c, a)), tex(F(a))], () => tex(F(a + rng.nonZero(-3, 3), c)));
  return {
    prompt: `Quelle est la limite de $u_n = \\frac{${poly(top, 'n')}}{${poly(bottom, 'n')}}$ quand $n \\to +\\infty$ ?`,
    answer,
    hint: 'Factorise le numérateur et le dénominateur par leur terme de plus haut degré.',
    correction: [
      `$u_n = \\frac{${p === 1 ? "n" : `n^{${p}}`}\\left(${a} + \\dots\\right)}{${q === 1 ? "n" : `n^{${q}}`}\\left(${c} + \\dots\\right)}$, les termes « $\\dots$ » tendant vers $0$.`,
      why,
    ],
  };
});

const geometrique = skill('tle-limite-qn', 'Limite d’une suite géométrique', (rng, level) => {
  const qs = [F(3), F(2), F(1, 2), F(-1, 3), F(3, 2), F(-2), F(2, 5), F(1), F(-1), F(5, 4), F(4, 5)];
  const q = rng.pick(level === 1 ? qs.slice(0, 4) : qs);
  const c = level === 3 ? rng.nonZero(-4, 4) : 1;
  const d = level === 1 ? 0 : rng.int(-5, 5);
  const v = q.n / q.d;
  let correct: string;
  let rule: string;
  if (v === 1) {
    correct = String(c + d);
    rule = '$q = 1$ : $q^n = 1$ pour tout $n$.';
  } else if (v <= -1) {
    correct = '\\text{pas de limite}';
    rule = '$q \\leq -1$ : $q^n$ alterne de signe et n’a pas de limite.';
  } else if (Math.abs(v) < 1) {
    correct = String(d);
    rule = '$-1 < q < 1$ : $q^n \\to 0$.';
  } else {
    correct = c > 0 ? '+\\infty' : '-\\infty';
    rule = '$q > 1$ : $q^n \\to +\\infty$.';
  }
  const lead = c === 1 ? '' : c === -1 ? '-' : `${c}\\times`;
  const answer = choiceTex(rng, correct, ['0', ...INF, '\\text{pas de limite}', String(d), String(c + d)], () => String(d + rng.nonZero(-3, 3)));
  return {
    prompt: `Quelle est la limite de $u_n = ${lead}\\left(${tex(q)}\\right)^n${plus(d)}$ ?`,
    answer,
    hint: 'Compare la raison $q$ à $-1$ et à $1$.',
    correction: [rule, `Donc $\\lim u_n = ${correct}$.`],
  };
});

const pointFixe = skill('tle-limite-point-fixe', 'Trouver la limite d’une suite arithmético-géométrique', (rng, level) => {
  const a = rng.pick(level === 1 ? [F(1, 2)] : [F(1, 2), F(1, 3), F(2, 3), F(-1, 2), F(3, 4)]);
  const b = rng.nonZero(-9, 9);
  const l = div(F(b), sub(F(1), a));
  return {
    prompt: `On admet que la suite définie par $u_0 = ${rng.int(0, 9)}$ et $u_{n+1} = ${tex(a)}u_n${plus(b)}$ converge vers $\\ell$. Calcule $\\ell$.`,
    answer: numF(l),
    hint: 'La limite d’une telle suite vérifie $\\ell = f(\\ell)$ : passe à la limite dans la relation de récurrence.',
    correction: [`$\\ell = ${tex(a)}\\ell${plus(b)}$`, `$\\left(1 - ${tex(a).startsWith('-') ? `\\left(${tex(a)}\\right)` : tex(a)}\\right)\\ell = ${b}$, donc $\\ell = ${tex(l)}$.`],
  };
});

const gendarmes = skill('tle-gendarmes', 'Utiliser le théorème des gendarmes', (rng, level) => {
  const c = rng.int(-6, 6);
  const k = rng.int(1, bound(level, 1, 3, 5));
  const osc = rng.pick(['(-1)^n', '\\cos(n)', '\\sin(n)']);
  const pow = level === 3 ? rng.pick(['n', 'n^2', '\\sqrt{n}']) : 'n';
  const sign = c === 0 ? '' : `${c} + `;
  return {
    prompt: `Pour $n \\geq 1$, $u_n = ${sign}\\frac{${k === 1 ? '' : k}${osc}}{${pow}}$. Quelle est la limite de $(u_n)$ ?`,
    answer: num(c),
    hint: `Encadre $${osc}$ entre $-1$ et $1$.`,
    correction: [
      `$-1 \\leq ${osc} \\leq 1$, donc $${c} - \\frac{${k}}{${pow}} \\leq u_n \\leq ${c} + \\frac{${k}}{${pow}}$.`,
      `Les deux suites qui encadrent tendent vers $${c}$ : par le théorème des gendarmes, $\\lim u_n = ${c}$.`,
    ],
  };
});

const seuil = skill('tle-seuil', 'Déterminer un rang à partir duquel on dépasse un seuil', (rng, level) => {
  const q = rng.pick(level === 1 ? [2] : [2, 3]);
  const u0 = rng.pick(level === 3 ? [3, 5, 7] : [1]);
  const s = rng.int(bound(level, 50, 200, 1000), bound(level, 900, 5000, 50000));
  let n = 0;
  while (u0 * q ** n <= s) n++;
  const lines = [`$u_{${n - 1}} = ${u0 * q ** (n - 1)} \\leq ${s}$`, `$u_{${n}} = ${u0 * q ** n} > ${s}$`];
  return {
    prompt: `$u_n = ${u0 === 1 ? '' : `${u0}\\times`}${q}^n$. Quel est le plus petit entier $n$ tel que $u_n > ${s}$ ?`,
    answer: num(n),
    hint: 'La suite est croissante : calcule les termes jusqu’à dépasser le seuil (c’est ce que fait l’algorithme de seuil).',
    correction: [...lines, `La suite est croissante, donc le rang cherché est $n = ${n}$.`],
  };
});

const comparaison = skill('tle-comparaison', 'Limite par comparaison', (rng) => {
  const up = rng.next() < 0.5;
  const k = rng.int(1, 5);
  const correct = up ? '+\\infty' : '-\\infty';
  const ineq = up ? `u_n \\geq ${k === 1 ? '' : k}n^2` : `u_n \\leq -${k === 1 ? '' : k}\\sqrt{n}`;
  return {
    prompt: `Pour tout $n$, $${ineq}$. Que peut-on dire de $(u_n)$ ?`,
    answer: fixedChoice(
      ['Elle tend vers $+\\infty$', 'Elle tend vers $-\\infty$', 'Elle converge vers $0$', 'On ne peut rien dire'],
      up ? 0 : 1,
    ),
    hint: 'Si $u_n \\geq v_n$ et $v_n \\to +\\infty$, alors $u_n \\to +\\infty$.',
    correction: [`La suite minorante (ou majorante) tend vers $${correct}$.`, `Par comparaison, $\\lim u_n = ${correct}$.`],
  };
});

const monotone = skill('tle-convergence-monotone', 'Utiliser le théorème de convergence monotone', (rng) => {
  const cases = [
    { text: 'croissante et majorée par $5$', correct: 0 },
    { text: 'décroissante et minorée par $0$', correct: 0 },
    { text: 'croissante et non majorée', correct: 1 },
    { text: 'décroissante et non minorée', correct: 2 },
  ];
  const c = rng.pick(cases);
  return {
    prompt: `La suite $(u_n)$ est ${c.text}. Que peut-on en déduire ?`,
    answer: fixedChoice(['Elle converge', 'Elle tend vers $+\\infty$', 'Elle tend vers $-\\infty$', 'On ne peut rien dire'], c.correct),
    hint: 'Toute suite croissante majorée (ou décroissante minorée) converge ; croissante non majorée, elle tend vers $+\\infty$.',
    correction: [
      ['Croissante et majorée : elle converge (théorème de convergence monotone), sa limite est au plus le majorant.',
        'Décroissante et minorée : elle converge (théorème de convergence monotone).',
        'Croissante et non majorée : elle tend vers $+\\infty$.',
        'Décroissante et non minorée : elle tend vers $-\\infty$.'][cases.indexOf(c)],
    ],
  };
});

const VF = ['Vrai', 'Faux'];
const decimal = (x: number) => String(x).replace('.', '{,}');

const quotientVariantes = [
  variant('conjuguee', (rng) => {
    const a = rng.nonZero(-9, 9);
    const b = rng.int(-5, 5);
    const value = F(a, 2);
    return {
      prompt: `Quelle est la limite de $u_n = \\sqrt{${poly([1, a, b === 0 ? 0 : b * b + Math.abs(a)], 'n')}} - n$ quand $n \\to +\\infty$ ? (Fraction.)`,
      answer: numF(value),
      hint: 'Multiplie et divise par la quantité conjuguée $\\sqrt{\\dots} + n$.',
      correction: [`$u_n = \\frac{${poly([a, b === 0 ? 0 : b * b + Math.abs(a)], 'n')}}{\\sqrt{\\dots} + n}$`, `En factorisant par $n$ : $u_n \\to \\frac{${a}}{2} = ${tex(value)}$.`],
    };
  }),
  variant('exponentielles', (rng) => {
    const [p, q] = rng.pick([[2, 3], [2, 5], [3, 4], [3, 5]]);
    const a = rng.nonZero(-5, 5);
    const b = rng.nonZero(-5, 5);
    const c = rng.nonZero(-5, 5);
    // d du signe de c : le dénominateur ne s'annule jamais.
    const d = Math.sign(c) * rng.int(1, 5);
    const value = F(a, c);
    const terme = (k: number, base: number, first: boolean) => `${first ? (k < 0 ? '-' : '') : k < 0 ? ' - ' : ' + '}${Math.abs(k) === 1 ? '' : `${Math.abs(k)}\\times `}${base}^n`;
    return {
      prompt: `Quelle est la limite de $u_n = \\frac{${terme(a, q, true)}${terme(b, p, false)}}{${terme(c, q, true)}${terme(d, p, false)}}$ ? (Fraction.)`,
      answer: numF(value),
      hint: `Factorise par $${q}^n$ : $\\left(\\frac{${p}}{${q}}\\right)^n \\to 0$.`,
      correction: [`$u_n = \\frac{${a} + ${par(b)}\\left(\\frac{${p}}{${q}}\\right)^n}{${c} + ${par(d)}\\left(\\frac{${p}}{${q}}\\right)^n} \\to ${tex(value)}$`],
    };
  }),
];

const geometriqueVariantes = [
  variant('somme-infinie', (rng) => {
    const q = rng.pick([F(1, 2), F(1, 3), F(2, 3), F(-1, 2), F(3, 4), F(-1, 3)]);
    const value = div(F(1), sub(F(1), q));
    return {
      prompt: `Quelle est la limite de $S_n = 1 + ${tex(q).startsWith('-') ? `\\left(${tex(q)}\\right)` : tex(q)} + \\dots + \\left(${tex(q)}\\right)^n$ quand $n \\to +\\infty$ ? (Fraction.)`,
      answer: numF(value),
      hint: '$S_n = \\frac{1 - q^{n+1}}{1 - q}$, et $q^{n+1} \\to 0$ quand $-1 < q < 1$.',
      correction: [`$S_n = \\frac{1 - q^{n+1}}{1 - q} \\to \\frac{1}{1 - ${par(q)}} = ${tex(value)}$`],
    };
  }),
  variant('vrai-faux', (rng) => {
    const q = rng.pick([F(3), F(2), F(1, 2), F(-1, 3), F(3, 2), F(-2), F(1), F(-1), F(5, 4), F(4, 5), F(-3, 2)]);
    const v = q.n / q.d;
    const ok = v > -1 && v <= 1;
    return {
      prompt: `Vrai ou faux : la suite $\\left(\\left(${tex(q)}\\right)^n\\right)$ converge.`,
      answer: fixedChoice(VF, ok ? 0 : 1),
      hint: '$(q^n)$ converge si et seulement si $-1 < q \\leq 1$.',
      correction: [ok ? `$-1 < ${tex(q)} \\leq 1$ : la suite converge (vers ${v === 1 ? '$1$' : '$0$'}). C'est vrai.` : `$${tex(q)}$ n'est pas dans $]-1\\,;\\,1]$ : pas de limite finie. C'est faux.`],
    };
  }),
];

const pointFixeVariantes = [
  variant('racine', (rng) => {
    const l = rng.int(2, 6);
    const a = rng.int(1, l);
    const b = l * l - a * l;
    return {
      prompt: `On admet que la suite définie par $u_0 = 1$ et $u_{n+1} = \\sqrt{${poly([a, b], 'u_n')}}$ converge vers un réel $\\ell > 0$. Calcule $\\ell$.`,
      answer: num(l),
      hint: 'Passe à la limite : $\\ell = \\sqrt{a\\ell + b}$, donc $\\ell^2 = a\\ell + b$ avec $\\ell > 0$.',
      correction: [`$\\ell^2 = ${poly([a, b], '\\ell')}$, soit $${poly([1, -a, -b], '\\ell')} = 0$.`, `Les solutions sont $${l}$ et $${a - l}$ ; comme $\\ell > 0$, $\\ell = ${l}$.`],
    };
  }),
  variant('retrouver-b', (rng) => {
    const a = rng.pick([F(1, 2), F(1, 3), F(2, 3), F(-1, 2), F(3, 4)]);
    const l = F(rng.nonZero(-9, 9));
    const b = mul(l, sub(F(1), a));
    return {
      prompt: `La suite définie par $u_{n+1} = ${tex(a)}u_n + b$ converge vers $${tex(l)}$. Que vaut $b$ ? (Fraction.)`,
      answer: numF(b),
      hint: 'La limite vérifie $\\ell = a\\ell + b$.',
      correction: [`$b = \\ell - ${tex(a).startsWith('-') ? `\\left(${tex(a)}\\right)` : tex(a)}\\ell = ${tex(b)}$`],
    };
  }),
];

const gendarmesVariantes = [
  variant('somme', (rng) => {
    const a = rng.int(1, 6);
    return {
      prompt: `Pour $n \\geq 1$, $u_n = \\sum_{k=1}^{n} \\frac{${a}n}{n^2 + k}$. Quelle est la limite de $(u_n)$ ?`,
      answer: num(a),
      hint: 'Encadre chaque terme : $\\frac{an}{n^2 + n} \\leq \\frac{an}{n^2 + k} \\leq \\frac{an}{n^2 + 1}$.',
      correction: [`$\\frac{${a}n^2}{n^2 + n} \\leq u_n \\leq \\frac{${a}n^2}{n^2 + 1}$, et les deux bornes tendent vers $${a}$.`, `Par le théorème des gendarmes, $\\lim u_n = ${a}$.`],
    };
  }),
  variant('encadrement', (rng) => {
    const a = rng.nonZero(-6, 6);
    const b = rng.int(1, 5);
    const c = rng.int(1, 5);
    return {
      prompt: `Pour tout $n \\geq 1$, $\\frac{${poly([a, -b], 'n')}}{n + ${c}} \\leq u_n \\leq \\frac{${poly([a, b], 'n')}}{n}$. Quelle est la limite de $(u_n)$ ?`,
      answer: num(a),
      hint: 'Calcule les limites des deux suites qui encadrent.',
      correction: [`Les deux bornes tendent vers $${a}$ : par le théorème des gendarmes, $\\lim u_n = ${a}$.`],
    };
  }),
];

const seuilVariantes = [
  variant('decroissante', (rng) => {
    const u0 = rng.int(1, 9) * 10;
    const s = rng.pick([0.1, 0.01, 0.001]);
    let n = 0;
    while (u0 * 0.5 ** n >= s) n++;
    return {
      prompt: `$u_n = ${u0}\\times \\left(\\frac{1}{2}\\right)^n$. Quel est le plus petit entier $n$ tel que $u_n < ${decimal(s)}$ ?`,
      answer: num(n),
      hint: 'La suite est décroissante : cherche le premier terme sous le seuil (ou résous avec le logarithme).',
      correction: [`$u_{${n - 1}} \\approx ${decimal(Number((u0 * 0.5 ** (n - 1)).toPrecision(3)))} \\geq ${decimal(s)}$ et $u_{${n}} \\approx ${decimal(Number((u0 * 0.5 ** n).toPrecision(3)))} < ${decimal(s)}$ : $n = ${n}$.`],
    };
  }),
  variant('arithmetique', (rng) => {
    const u0 = rng.int(-20, 20);
    const r = rng.int(2, 9);
    const s = u0 + rng.int(20, 300);
    const n = Math.floor((s - u0) / r) + 1;
    return {
      prompt: `$u_n = ${poly([r, u0], 'n')}$. Quel est le plus petit entier $n$ tel que $u_n > ${s}$ ?`,
      answer: num(n),
      hint: 'Résous l’inéquation d’inconnue $n$.',
      correction: [`$${poly([r, u0], 'n')} > ${s} \\iff n > \\frac{${s - u0}}{${r}}$, donc $n = ${n}$.`],
    };
  }),
];

const COMPARAISON = ['Elle tend vers $+\\infty$', 'Elle tend vers $-\\infty$', 'Elle converge vers $0$', 'On ne peut rien dire'];

const comparaisonVariantes = [
  variant('conclusion', (rng) => {
    const k = rng.int(1, 6);
    const cas = rng.pick([
      [`u_n \\geq ${k === 1 ? '' : k}\\sqrt{n}`, 0],
      [`u_n \\leq ${k}`, 3],
      [`u_n \\geq -${k === 1 ? '' : k}n`, 3],
      [`u_n \\leq ${k} - n^2`, 1],
      [`u_n \\geq n + (-1)^n \\times ${k}`, 0],
    ] as [string, number][]);
    return {
      prompt: `Pour tout $n$, $${cas[0]}$. Que peut-on dire de $(u_n)$ ?`,
      answer: fixedChoice(COMPARAISON, cas[1]),
      hint: 'La comparaison ne conclut que si la borne tend vers $+\\infty$ (minoration) ou $-\\infty$ (majoration).',
      correction: [cas[1] === 3 ? 'La borne ne tend pas vers l’infini dans le bon sens : on ne peut rien conclure.' : `La borne tend vers $${cas[1] === 0 ? '+' : '-'}\\infty$, donc $(u_n)$ aussi.`],
    };
  }),
  variant('vrai-faux', (rng) => {
    const [texte, ok, why] = rng.pick([
      ['si $u_n \\geq v_n$ et $v_n \\to +\\infty$, alors $u_n \\to +\\infty$', true, 'c’est le théorème de comparaison.'],
      ['si $u_n \\leq v_n$ et $v_n \\to +\\infty$, alors $u_n \\to +\\infty$', false, '$u_n = -n$ et $v_n = n$ forment un contre-exemple.'],
      ['si $u_n \\leq v_n$ et $u_n \\to +\\infty$, alors $v_n \\to +\\infty$', true, 'c’est le théorème de comparaison, appliqué à $v_n$.'],
      ['si $u_n \\geq 0$ pour tout $n$, alors $(u_n)$ converge', false, '$u_n = n$ est positive et tend vers $+\\infty$.'],
    ] as [string, boolean, string][]);
    return {
      prompt: `Vrai ou faux : ${texte}.`,
      answer: fixedChoice(VF, ok ? 0 : 1),
      hint: 'Cherche un contre-exemple simple avant de conclure.',
      correction: [`C'est ${ok ? 'vrai' : 'faux'} : ${why}`],
    };
  }),
];

const monotoneVariantes = [
  variant('exemple', (rng) => {
    const M = rng.int(-5, 9);
    const k = rng.int(1, 9);
    const croissante = rng.next() < 0.5;
    return {
      prompt: `Pour tout $n$, $u_n = ${M} ${croissante ? '-' : '+'} \\frac{${k}}{n + 1}$. La suite est ${croissante ? 'croissante et majorée' : 'décroissante et minorée'} : vers quelle limite converge-t-elle ?`,
      answer: num(M),
      hint: '$\\frac{1}{n + 1} \\to 0$.',
      correction: [`$\\frac{${k}}{n + 1} \\to 0$, donc $u_n \\to ${M}$.`],
    };
  }),
  variant('vrai-faux', (rng) => {
    const M = rng.int(1, 9);
    const [texte, ok, why] = rng.pick([
      [`une suite croissante majorée par $${M}$ converge vers $${M}$`, false, `elle converge vers une limite $\\ell \\leq ${M}$, pas forcément $${M}$ : $u_n = -\\frac{1}{n+1}$ converge vers $0$.`],
      [`une suite croissante majorée par $${M}$ converge vers une limite $\\ell \\leq ${M}$`, true, 'c’est le théorème de convergence monotone.'],
      ['une suite convergente est monotone', false, '$u_n = \\frac{(-1)^n}{n+1}$ converge vers $0$ sans être monotone.'],
      ['une suite croissante non majorée tend vers $+\\infty$', true, 'c’est un résultat du cours.'],
    ] as [string, boolean, string][]);
    return {
      prompt: `Vrai ou faux : ${texte}.`,
      answer: fixedChoice(VF, ok ? 0 : 1),
      hint: 'Le théorème de convergence monotone assure l’existence de la limite, pas sa valeur.',
      correction: [`C'est ${ok ? 'vrai' : 'faux'} : ${why}`],
    };
  }),
];

export const LIMITES_SUITES_SKILLS: Skill[] = [
  enrich(quotient, quotientVariantes),
  enrich(geometrique, geometriqueVariantes),
  enrich(pointFixe, pointFixeVariantes),
  enrich(gendarmes, gendarmesVariantes),
  enrich(seuil, seuilVariantes),
  enrich(comparaison, comparaisonVariantes),
  enrich(monotone, monotoneVariantes),
];
