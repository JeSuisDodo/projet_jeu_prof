import type { Skill } from '../types';
import { enrich, variant } from '../variantes';
import { F, affine, choiceTex, fixedChoice, num, numF, par, plus, poly, skill, tex } from './util';

/** Chapitre « Fonction logarithme népérien » (Terminale spécialité). */

const simplifier = skill('tle-ln-proprietes', 'Utiliser les propriétés algébriques de ln', (rng, level) => {
  const a = rng.pick([2, 3, 5]);
  const p = rng.int(1, 4);
  const q = rng.int(1, 4);
  const r = rng.int(1, level === 1 ? 2 : 5);
  const sq = level === 3 && rng.next() < 0.5;
  // ln(a^p) + ln(a^q) - ln(a^r) (+ ln √a) = k ln a
  const k = sq ? F(2 * (p + q - r) + 1, 2) : F(p + q - r);
  const extra = sq ? ` + \\ln\\sqrt{${a}}` : '';
  return {
    prompt: `Écris $A = \\ln(${a ** p}) + \\ln(${a ** q}) - \\ln(${a ** r})${extra}$ sous la forme $k\\ln ${a}$. Donne $k$.`,
    answer: numF(k),
    hint: '$\\ln(ab) = \\ln a + \\ln b$, $\\ln\\frac{a}{b} = \\ln a - \\ln b$ et $\\ln(a^n) = n\\ln a$.',
    correction: [
      `$${a ** p} = ${a}^{${p}}$, $${a ** q} = ${a}^{${q}}$, $${a ** r} = ${a}^{${r}}$${sq ? ` et $\\sqrt{${a}} = ${a}^{\\frac{1}{2}}$` : ''}.`,
      `$A = ${p}\\ln ${a} + ${q}\\ln ${a} - ${r}\\ln ${a}${sq ? ` + \\frac{1}{2}\\ln ${a}` : ''} = ${k.n === 0 ? '0' : `${tex(k)}\\ln ${a}`}$`,
    ],
  };
});

const equation = skill('tle-ln-equation', 'Résoudre une équation avec ln', (rng, level) => {
  const a = rng.nonZero(-4, 5);
  const b = rng.int(-6, 6);
  const c = rng.int(1, 12);
  const x = F(c - b, a);
  if (level === 1) {
    return {
      prompt: `Résous dans $\\mathbb{R}$ : $\\ln(${affine(a, b)}) = \\ln(${c})$.`,
      answer: { kind: 'set', values: [x] },
      hint: '$\\ln$ est strictement croissante : $\\ln A = \\ln B \\iff A = B$ (avec $A > 0$).',
      correction: [`$${affine(a, b)} = ${c}$, donc $x = ${tex(x)}$, et alors $${affine(a, b)} = ${c} > 0$.`, `$S = \\{${tex(x)}\\}$`],
    };
  }
  // ln(x + p) + ln(x + q) = ln r, où (x + p)(x + q) - r = (x - s1)(x - s2) : s1 est dans le domaine, pas s2.
  const s1 = rng.int(1, 5);
  const s2 = rng.int(-6, -1);
  let p = 0;
  let q = 0;
  do {
    p = rng.int(1 - s1, 6);
    q = -s1 - s2 - p;
  } while (s1 + q <= 0 || s2 + p >= 0 || s2 + q >= 0);
  const r = (s1 + p) * (s1 + q);
  return {
    prompt: `Résous : $\\ln(${affine(1, p)}) + \\ln(${affine(1, q)}) = \\ln ${r}$.`,
    answer: { kind: 'set', values: [F(s1)] },
    hint: 'Cherche d’abord le domaine (les deux expressions doivent être $> 0$), puis regroupe les $\\ln$.',
    correction: [
      `Domaine : $x > ${Math.max(-p, -q)}$.`,
      `$\\ln\\big((${affine(1, p)})(${affine(1, q)})\\big) = \\ln ${r}$ donne $${poly([1, p + q, p * q - r])} = 0$.`,
      `Les racines sont $${s1}$ et $${s2}$ ; seule $${s1}$ est dans le domaine.`,
      `$S = \\{${s1}\\}$`,
    ],
  };
});

const expLn = skill('tle-exp-equation', 'Résoudre une équation avec l’exponentielle', (rng, level) => {
  const a = level === 1 ? 1 : rng.nonZero(-3, 3);
  const b = rng.int(-4, 4);
  const c = rng.pick([2, 3, 5, 7, 10]);
  const lnc = `\\ln ${c}`;
  const num_ = b === 0 ? lnc : `${lnc}${plus(-b)}`;
  const fmt = (top: string, d: number) => (d === 1 ? top : d === -1 ? `-(${top})` : `\\frac{${top}}{${d}}`);
  const correct = fmt(num_, a);
  return {
    prompt: `Résous $e^{${affine(a, b)}} = ${c}$. Quelle est la solution ?`,
    answer: choiceTex(
      rng,
      `x = ${correct}`,
      [`x = ${fmt(b === 0 ? lnc : `${lnc}${plus(b)}`, a)}`, `x = ${fmt(`e^{${c}}${plus(-b)}`, a)}`, `x = ${fmt(`${c}${plus(-b)}`, a)}`, `x = ${fmt(num_, -a)}`],
      () => `x = \\frac{${num_}}{${a + 1}}`,
    ),
    hint: '$e^X = c \\iff X = \\ln c$ (pour $c > 0$).',
    correction: [`$${affine(a, b)} = ${lnc}$`, `$x = ${correct}$`],
  };
});

const derivee = skill('tle-ln-derivee', 'Dériver ln(u)', (rng) => {
  const a = rng.nonZero(-4, 5);
  const x0 = rng.int(-2, 3);
  let b = rng.int(-5, 5);
  if (a * x0 + b <= 0) b = 1 - a * x0 + rng.int(0, 4);
  const value = F(a, a * x0 + b);
  return {
    prompt: `$f(x) = \\ln(${affine(a, b)})$. Calcule $f'(${x0})$.`,
    answer: numF(value),
    hint: 'Si $f = \\ln u$, alors $f\' = \\frac{u\'}{u}$.',
    correction: [`$f'(x) = \\frac{${a}}{${affine(a, b)}}$`, `$f'(${x0}) = \\frac{${a}}{${a * x0 + b}}${value.d === a * x0 + b && value.n === a ? '' : ` = ${tex(value)}`}$`],
  };
});

const limites = skill('tle-ln-limites', 'Limites avec ln', (rng) => {
  const n = rng.int(1, 3);
  const xn = n === 1 ? 'x' : `x^{${n}}`;
  const cases = [
    { expr: '\\ln x', at: '0^+', lim: '-\\infty', why: 'Limite de référence : $\\lim_{x \\to 0^+} \\ln x = -\\infty$.' },
    { expr: '\\ln x', at: '+\\infty', lim: '+\\infty', why: 'Limite de référence : $\\lim_{x \\to +\\infty} \\ln x = +\\infty$.' },
    { expr: `\\frac{\\ln x}{${xn}}`, at: '+\\infty', lim: '0', why: `Croissances comparées : $${xn}$ l’emporte sur $\\ln x$.` },
    { expr: `${xn}\\ln x`, at: '0^+', lim: '0', why: `Croissances comparées : $${xn}\\ln x \\to 0$ en $0^+$.` },
    { expr: '\\frac{\\ln(1 + x)}{x}', at: '0', lim: '1', why: 'C’est le taux d’accroissement de $\\ln$ en $1$ : il tend vers $\\ln\'(1) = 1$.' },
    { expr: `x - \\ln x`, at: '+\\infty', lim: '+\\infty', why: '$x - \\ln x = x\\left(1 - \\frac{\\ln x}{x}\\right)$ et la parenthèse tend vers $1$.' },
  ];
  const c = rng.pick(cases);
  return {
    prompt: `Quelle est la limite de $${c.expr}$ quand $x \\to ${c.at}$ ?`,
    answer: choiceTex(rng, c.lim, ['0', '1', '+\\infty', '-\\infty'], () => 'e'),
    hint: 'Pense aux limites de référence et aux croissances comparées.',
    correction: [c.why],
  };
});

const seuil = skill('tle-ln-seuil', 'Trouver un seuil avec ln', (rng, level) => {
  // Plus petit n tel que q^n < s, q dans ]0 ; 1[.
  const q = rng.pick(level === 1 ? [F(1, 2)] : [F(1, 2), F(9, 10), F(3, 4), F(4, 5), F(2, 3)]);
  const s = rng.pick(level === 3 ? [0.001, 0.0001, 0.01] : [0.1, 0.01, 0.05]);
  const qv = q.n / q.d;
  let n = 0;
  while (qv ** n >= s) n++;
  const st = String(s).replace('.', '{,}');
  return {
    prompt: `Quel est le plus petit entier $n$ tel que $\\left(${tex(q)}\\right)^n < ${st}$ ?`,
    answer: num(n),
    hint: 'Applique $\\ln$ (croissante) : $n\\ln q < \\ln s$, et attention, $\\ln q < 0$ change le sens de l’inégalité.',
    correction: [
      `$n\\ln\\left(${tex(q)}\\right) < \\ln(${st})$`,
      `$\\ln\\left(${tex(q)}\\right) < 0$, donc $n > \\frac{\\ln(${st})}{\\ln\\left(${tex(q)}\\right)} \\approx ${(Math.log(s) / Math.log(qv)).toFixed(2).replace('.', '{,}')}$.`,
      `Le plus petit entier est $n = ${n}$.`,
    ],
  };
});

const variations = skill('tle-ln-variations', 'Étudier les variations d’une fonction avec ln', (rng) => {
  const k = rng.int(1, 9);
  return {
    prompt: `$f(x) = x - ${k === 1 ? '' : k}\\ln x$ sur $]0\\,;\\,+\\infty[$. En quelle valeur $f$ atteint-elle son minimum ?`,
    answer: num(k),
    hint: 'Calcule $f\'(x)$ et étudie son signe.',
    correction: [
      `$f'(x) = 1 - \\frac{${k}}{x} = \\frac{x - ${k}}{x}$`,
      `$f' < 0$ sur $]0\\,;\\,${k}[$ et $f' > 0$ sur $]${k}\\,;\\,+\\infty[$ : minimum en $x = ${k}$.`,
    ],
  };
});

const VF = ['Vrai', 'Faux'];
const INF = ['$+\\infty$', '$-\\infty$', '$0$', '$1$'];
/** Coefficient devant une expression : « 3x », « -x », « x ». */
const coef = (c: number, e: string) => `${c === 1 ? '' : c === -1 ? '-' : c}${e}`;
/** Terme ajouté : « + 3e^x », « - e^x ». */
const terme = (c: number, e: string) => (c === 0 ? '' : ` ${c < 0 ? '-' : '+'} ${Math.abs(c) === 1 ? '' : Math.abs(c)}${e}`);

const simplifierVariantes = [
  variant('exponentielle', (rng) => {
    const p = rng.int(1, 6);
    const q = rng.int(1, 6);
    const r = rng.nonZero(-4, 4);
    const racine = rng.next() < 0.5;
    const k = racine ? F(2 * (p - q + r) + 1, 2) : F(p - q + r);
    return {
      prompt: `Calcule $A = \\ln(e^{${p}}) + \\ln(\\frac{1}{e^{${q}}})${r < 0 ? ' - ' : ' + '}${Math.abs(r) === 1 ? '' : Math.abs(r)}\\ln(e)${racine ? ' + \\ln(\\sqrt{e})' : ''}$.`,
      answer: numF(k),
      hint: '$\\ln(e^a) = a$, $\\ln\\frac{1}{b} = -\\ln b$ et $\\ln\\sqrt{e} = \\frac{1}{2}$.',
      correction: [`$A = ${p} - ${q}${plus(r)}${racine ? ' + \\frac{1}{2}' : ''} = ${tex(k)}$`],
    };
  }),
  variant('vrai-faux', (rng) => {
    const a = rng.int(2, 6);
    let b = rng.int(3, 7);
    if (b === a) b++;
    const n = rng.int(2, 4);
    const cas = [
      { s: `\\ln(${a * b}) = \\ln(${a}) + \\ln(${b})`, ok: true, why: '$\\ln(ab) = \\ln a + \\ln b$.' },
      { s: `\\ln(${a + b}) = \\ln(${a}) + \\ln(${b})`, ok: false, why: '$\\ln$ transforme les produits en sommes, pas les sommes : $\\ln(a + b) \\neq \\ln a + \\ln b$.' },
      { s: `\\ln(${a ** n}) = ${n}\\ln(${a})`, ok: true, why: '$\\ln(a^n) = n\\ln a$.' },
      { s: `\\ln(${a}) \\times \\ln(${b}) = \\ln(${a * b})`, ok: false, why: 'C’est la somme $\\ln a + \\ln b$ qui vaut $\\ln(ab)$, pas le produit.' },
      { s: `\\frac{\\ln(${a * b})}{\\ln(${b})} = \\ln(${a})`, ok: false, why: '$\\ln\\frac{x}{y} = \\ln x - \\ln y$, ce n’est pas un quotient de logarithmes.' },
      { s: `\\ln(${a * b}) - \\ln(${b}) = \\ln(${a})`, ok: true, why: '$\\ln x - \\ln y = \\ln\\frac{x}{y}$.' },
    ];
    const c = rng.pick(cas);
    return {
      prompt: `Vrai ou faux : $${c.s}$.`,
      answer: fixedChoice(VF, c.ok ? 0 : 1),
      hint: 'Rappelle-toi les propriétés de $\\ln$ : produit, quotient, puissance.',
      correction: [`${c.why} C’est ${c.ok ? 'vrai' : 'faux'}.`],
    };
  }),
];

const equationVariantes = [
  variant('ln-nul', (rng) => {
    const a = rng.nonZero(-4, 5);
    const b = rng.int(-6, 6);
    const x = F(1 - b, a);
    return {
      prompt: `Résous dans $\\mathbb{R}$ : $\\ln(${affine(a, b)}) = 0$.`,
      answer: { kind: 'set', values: [x] },
      hint: '$\\ln X = 0 \\iff X = 1$.',
      correction: [`$${affine(a, b)} = 1$, donc $x = ${tex(x)}$.`, `$S = \\{${tex(x)}\\}$`],
    };
  }),
  variant('carre', (rng) => {
    const c = rng.int(1, 9);
    return {
      prompt: `Résous dans $\\mathbb{R}$ : $\\ln(x^2) = \\ln(${c * c})$.`,
      answer: { kind: 'set', values: [F(-c), F(c)] },
      hint: '$\\ln(x^2)$ est défini pour tout $x \\neq 0$ : attention à ne pas perdre de solution en écrivant $2\\ln x$.',
      correction: [`Pour $x \\neq 0$ : $x^2 = ${c * c}$, donc $x = ${c}$ ou $x = ${-c}$.`, `$S = \\{${-c}\\,;\\,${c}\\}$`],
    };
  }),
];

const expVariantes = [
  variant('deux-exponentielles', (rng) => {
    const x = rng.int(-4, 4);
    const a = rng.nonZero(-4, 4);
    let c = rng.nonZero(-4, 4);
    if (c === a) c = -a;
    const b = rng.int(-6, 6);
    const d = a * x + b - c * x;
    return {
      prompt: `Résous $e^{${affine(a, b)}} = e^{${affine(c, d)}}$. Donne la solution.`,
      answer: num(x),
      hint: '$\\exp$ est strictement croissante : $e^A = e^B \\iff A = B$.',
      correction: [`$${affine(a, b)} = ${affine(c, d)}$`, `$${a - c}x = ${d - b}$, donc $x = ${x}$.`],
    };
  }),
  variant('nombre-solutions', (rng) => {
    let p = rng.nonZero(-5, 5);
    let q = rng.nonZero(-5, 5);
    if (p === q) q = -q;
    if (p === q) p++;
    const s = p + q;
    const pr = p * q;
    const count = (p > 0 ? 1 : 0) + (q > 0 ? 1 : 0);
    return {
      prompt: `Combien de solutions réelles l’équation $e^{2x}${terme(-s, 'e^x')}${plus(pr)} = 0$ a-t-elle ?`,
      answer: fixedChoice(['0', '1', '2'], count),
      hint: 'Pose $X = e^x$ : l’équation devient du second degré, et seules les racines $X > 0$ donnent des solutions.',
      correction: [`Avec $X = e^x > 0$ : $${poly([1, -s, pr], 'X')} = (X${plus(-p)})(X${plus(-q)}) = 0$, donc $X = ${p}$ ou $X = ${q}$.`, `Seules les valeurs positives conviennent : $${count}$ solution${count > 1 ? 's' : ''}.`],
    };
  }),
];

const deriveeVariantes = [
  variant('ln-carre', (rng) => {
    const c = rng.int(1, 9);
    const x0 = rng.int(-3, 3);
    const value = F(2 * x0, x0 * x0 + c);
    return {
      prompt: `$f(x) = \\ln(x^2 + ${c})$. Calcule $f'(${x0})$ (fraction).`,
      answer: numF(value),
      hint: '$(\\ln u)\' = \\frac{u\'}{u}$ avec $u(x) = x^2 + c$.',
      correction: [`$f'(x) = \\frac{2x}{x^2 + ${c}}$`, `$f'(${x0}) = \\frac{${2 * x0}}{${x0 * x0 + c}} = ${tex(value)}$`],
    };
  }),
  variant('produit', (rng) => {
    const a = rng.nonZero(-4, 4);
    const b = rng.nonZero(-5, 5);
    return {
      prompt: `$f(x) = (${affine(a, b)})\\ln x$ sur $]0\\,;\\,+\\infty[$. Calcule $f'(1)$.`,
      answer: num(a + b),
      hint: '$(uv)\' = u\'v + uv\'$ et $\\ln 1 = 0$.',
      correction: [`$f'(x) = ${a}\\ln x + \\frac{${affine(a, b)}}{x}$`, `$f'(1) = 0 + ${par(a + b)} = ${a + b}$`],
    };
  }),
];

const limitesVariantes = [
  variant('polynome-ln', (rng) => {
    const a = rng.nonZero(-4, 4);
    const b = rng.nonZero(-9, 9);
    return {
      prompt: `Quelle est la limite de $${coef(a, 'x')}${terme(b, '\\ln x')}$ quand $x \\to +\\infty$ ?`,
      answer: fixedChoice(INF, a > 0 ? 0 : 1),
      hint: 'Factorise par $x$ : $\\frac{\\ln x}{x} \\to 0$.',
      correction: [`$= x\\left(${a}${b < 0 ? ' - ' : ' + '}${Math.abs(b)}\\frac{\\ln x}{x}\\right)$ et la parenthèse tend vers $${a}$ : la limite est $${a > 0 ? '+' : '-'}\\infty$.`],
    };
  }),
  variant('en-zero', (rng) => {
    const a = rng.nonZero(-5, 5);
    const b = rng.nonZero(-5, 5);
    return {
      prompt: `Quelle est la limite de $\\frac{${a}}{x}${terme(b, '\\ln x')}$ quand $x \\to 0^+$ ?`,
      answer: fixedChoice(INF, a > 0 ? 0 : 1),
      hint: 'Écris l’expression $\\frac{1}{x}(a + b\\,x\\ln x)$ : $x\\ln x \\to 0$ en $0^+$.',
      correction: [`$= \\frac{1}{x}\\left(${a}${b < 0 ? ' - ' : ' + '}${Math.abs(b)}x\\ln x\\right)$ ; la parenthèse tend vers $${a}$ et $\\frac{1}{x} \\to +\\infty$ : limite $${a > 0 ? '+' : '-'}\\infty$.`],
    };
  }),
];

const seuilVariantes = [
  variant('croissance', (rng) => {
    const q = rng.pick([F(11, 10), F(3, 2), F(6, 5), F(5, 4), F(21, 20)]);
    const s = rng.pick([2, 3, 5, 10]);
    const qv = q.n / q.d;
    let n = 0;
    while (qv ** n <= s) n++;
    return {
      prompt: `Quel est le plus petit entier $n$ tel que $\\left(${tex(q)}\\right)^n > ${s}$ ?`,
      answer: num(n),
      hint: 'Applique $\\ln$ : $n\\ln q > \\ln s$, avec $\\ln q > 0$ ici.',
      correction: [`$n > \\frac{\\ln ${s}}{\\ln\\left(${tex(q)}\\right)} \\approx ${(Math.log(s) / Math.log(qv)).toFixed(2).replace('.', '{,}')}$`, `Le plus petit entier est $n = ${n}$.`],
    };
  }),
  variant('pourcentage', (rng) => {
    const t = rng.pick([5, 10, 15, 20, 25, 30]);
    const [frac, texte] = rng.pick([[0.5, 'la moitié'], [0.25, 'le quart'], [0.1, 'le dixième']] as const);
    const q = 1 - t / 100;
    let n = 0;
    while (q ** n >= frac) n++;
    return {
      prompt: `La masse d’un produit radioactif diminue de $${t}\\,\\%$ par an. Au bout de combien d’années entières devient-elle inférieure à ${texte} de sa masse initiale ?`,
      answer: num(n),
      hint: `Cherche le plus petit $n$ tel que $${String(q).replace('.', '{,}')}^n < ${String(frac).replace('.', '{,}')}$, en appliquant $\\ln$.`,
      correction: [`$n > \\frac{\\ln(${String(frac).replace('.', '{,}')})}{\\ln(${String(q).replace('.', '{,}')})} \\approx ${(Math.log(frac) / Math.log(q)).toFixed(2).replace('.', '{,}')}$`, `Il faut $${n}$ ans.`],
    };
  }),
];

const variationsVariantes = [
  variant('maximum', (rng) => {
    const a = rng.int(1, 9);
    return {
      prompt: `$f(x) = \\ln x${terme(-a, 'x')}$ sur $]0\\,;\\,+\\infty[$. En quelle valeur $f$ atteint-elle son maximum (fraction) ?`,
      answer: numF(F(1, a)),
      hint: 'Calcule $f\'(x)$ et étudie son signe.',
      correction: [`$f'(x) = \\frac{1}{x} - ${a} = \\frac{${poly([-a, 1])}}{x}$`, `$f'$ est positive puis négative, et s’annule en $${tex(F(1, a))}$ : c’est le maximum.`],
    };
  }),
  variant('carre', (rng) => {
    const a = rng.int(1, 3);
    const s = rng.int(1, 4);
    const b = 2 * a * s * s;
    return {
      prompt: `$f(x) = ${coef(a, 'x^2')} - ${b}\\ln x$ sur $]0\\,;\\,+\\infty[$. En quelle valeur $f$ atteint-elle son minimum ?`,
      answer: num(s),
      hint: 'Calcule $f\'(x)$, mets-la au même dénominateur et étudie son signe.',
      correction: [`$f'(x) = ${2 * a}x - \\frac{${b}}{x} = \\frac{${2 * a}(x^2 - ${s * s})}{x}$`, `Sur $]0\\,;\\,+\\infty[$, $f'$ s’annule en $${s}$ en passant du négatif au positif : minimum en $x = ${s}$.`],
    };
  }),
];

export const LOGARITHME_SKILLS: Skill[] = [
  enrich(simplifier, simplifierVariantes),
  enrich(equation, equationVariantes),
  enrich(expLn, expVariantes),
  enrich(derivee, deriveeVariantes),
  enrich(limites, limitesVariantes),
  enrich(seuil, seuilVariantes),
  enrich(variations, variationsVariantes),
];
