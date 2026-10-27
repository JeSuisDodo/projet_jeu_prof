import type { Skill } from '../types';
import { enrich, variant } from '../variantes';
import { F, affine, choiceTex, fixedChoice, num, numF, par, plus, poly, skill, tex } from './util';

/** Chapitre « Compléments sur la dérivation » et convexité (Terminale spécialité). */

const pw = (k: number) => (k === 1 ? '' : `^{${k}}`);

const puissance = skill('tle-derivee-composee', 'Dériver une puissance d’une fonction affine', (rng, level) => {
  const a = rng.nonZero(-3, 3);
  const b = rng.int(-4, 4);
  const n = rng.int(2, level === 1 ? 3 : 5);
  const x0 = rng.int(-2, 2);
  const inner = a * x0 + b;
  const value = n * a * inner ** (n - 1);
  return {
    prompt: `$f(x) = (${affine(a, b)})^{${n}}$. Calcule $f'(${x0})$.`,
    answer: num(value),
    hint: 'Si $f = u^n$, alors $f\' = n\\,u\'\\,u^{n-1}$.',
    correction: [
      `$f'(x) = ${n}\\times ${par(a)}\\times (${affine(a, b)})${pw(n - 1)}$`,
      `$f'(${x0}) = ${n * a}\\times ${par(inner)}${pw(n - 1)} = ${value}$`,
    ],
  };
});

const racine = skill('tle-derivee-racine', 'Dériver la racine d’une fonction', (rng) => {
  const a = rng.nonZero(-4, 6);
  const s = rng.int(1, 5);
  // On choisit x0 pour que a x0 + b = s².
  const x0 = rng.int(-3, 3);
  const b = s * s - a * x0;
  const value = F(a, 2 * s);
  return {
    prompt: `$f(x) = \\sqrt{${affine(a, b)}}$. Calcule $f'(${x0})$.`,
    answer: numF(value),
    hint: 'Si $f = \\sqrt{u}$, alors $f\' = \\frac{u\'}{2\\sqrt{u}}$.',
    correction: [
      `$f'(x) = \\frac{${a}}{2\\sqrt{${affine(a, b)}}}$`,
      `En $${x0}$ : $${a}\\times ${par(x0)}${plus(b)} = ${s * s}$, donc $f'(${x0}) = \\frac{${a}}{2\\times ${s}} = ${tex(value)}$.`,
    ],
  };
});

const expComposee = skill('tle-derivee-exp', 'Dériver une exponentielle composée', (rng, level) => {
  const a = rng.nonZero(-4, 4);
  const b = rng.int(-3, 3);
  const k = level === 1 ? 1 : rng.nonZero(-3, 3);
  const u = affine(a, b);
  const front = (c: number) => (c === 1 ? '' : c === -1 ? '-' : String(c));
  const correct = `f'(x) = ${front(k * a)}e^{${u}}`;
  return {
    prompt: `$f(x) = ${front(k)}e^{${u}}$. Quelle est sa dérivée ?`,
    answer: choiceTex(
      rng,
      correct,
      [`f'(x) = ${front(k)}e^{${u}}`, `f'(x) = ${front(k * a)}e^{${a}}`, `f'(x) = ${front(k)}(${u})e^{${poly([a, b - 1])}}`, `f'(x) = ${front(k * b || 1)}e^{${u}}`],
      () => `f'(x) = ${front(k * a + 1)}e^{${u}}`,
    ),
    hint: 'Si $f = e^u$, alors $f\' = u\'e^u$.',
    correction: [`$u(x) = ${u}$ et $u'(x) = ${a}$.`, `$${correct}$`],
  };
});

const seconde = skill('tle-derivee-seconde', 'Calculer une dérivée seconde', (rng, level) => {
  const c = [rng.nonZero(-3, 3), rng.int(-5, 5), rng.int(-5, 5), rng.int(-5, 5)];
  if (level === 3) c.unshift(rng.nonZero(-2, 2));
  const deg = c.length - 1;
  const d1 = c.slice(0, -1).map((v, i) => v * (deg - i));
  const d2 = d1.slice(0, -1).map((v, i) => v * (deg - 1 - i));
  const x0 = rng.int(-2, 2);
  const value = d2.reduce((s, v, i) => s + v * x0 ** (d2.length - 1 - i), 0);
  return {
    prompt: `$f(x) = ${poly(c)}$. Calcule $f''(${x0})$.`,
    answer: num(value),
    hint: 'Dérive deux fois de suite.',
    correction: [`$f'(x) = ${poly(d1)}$`, `$f''(x) = ${poly(d2)}$`, `$f''(${x0}) = ${value}$`],
  };
});

const inflexion = skill('tle-point-inflexion', 'Trouver un point d’inflexion', (rng, level) => {
  const a = level === 1 ? 1 : rng.nonZero(-3, 3);
  // f''(x) = 6a x + 2b s'annule en -b/(3a) ; pour un résultat entier, on part de l'abscisse.
  const x0 = rng.int(-3, 3);
  const b = -3 * a * x0;
  const c = rng.int(-6, 6);
  const d = rng.int(-6, 6);
  return {
    prompt: `$f(x) = ${poly([a, b, c, d])}$. Quelle est l’abscisse de son point d’inflexion ?`,
    answer: num(x0),
    hint: 'Un point d’inflexion est un point où $f\'\'$ s’annule en changeant de signe.',
    correction: [
      `$f'(x) = ${poly([3 * a, 2 * b, c])}$ et $f''(x) = ${poly([6 * a, 2 * b])}$.`,
      `$f''(x) = 0 \\iff x = ${x0}$, et $f''$ (affine) change de signe en $${x0}$.`,
    ],
  };
});

const convexite = skill('tle-convexite', 'Étudier la convexité', (rng) => {
  const k = rng.int(-4, 4);
  const s = rng.pick([1, -1]);
  const fpp = `${s === 1 ? '' : '-'}(${poly([1, -k])})e^{x}`;
  const convexRight = s === 1;
  const options = [
    `Convexe sur $]-\\infty\\,;\\,${k}]$, concave sur $[${k}\\,;\\,+\\infty[$`,
    `Concave sur $]-\\infty\\,;\\,${k}]$, convexe sur $[${k}\\,;\\,+\\infty[$`,
    'Convexe sur $\\mathbb{R}$',
    'Concave sur $\\mathbb{R}$',
  ];
  return {
    prompt: `Pour tout réel $x$, $f''(x) = ${fpp}$. Que peut-on dire de la convexité de $f$ ?`,
    answer: fixedChoice(options, convexRight ? 1 : 0),
    hint: '$f$ est convexe là où $f\'\' \\geq 0$ et concave là où $f\'\' \\leq 0$. Ici $e^x > 0$.',
    correction: [
      `$e^x > 0$, donc $f''(x)$ a le signe de $${s === 1 ? '' : '-'}(${poly([1, -k])})$.`,
      convexRight
        ? `$f'' \\leq 0$ sur $]-\\infty\\,;\\,${k}]$ (concave) et $f'' \\geq 0$ sur $[${k}\\,;\\,+\\infty[$ (convexe).`
        : `$f'' \\geq 0$ sur $]-\\infty\\,;\\,${k}]$ (convexe) et $f'' \\leq 0$ sur $[${k}\\,;\\,+\\infty[$ (concave).`,
    ],
  };
});

const tangente = skill('tle-tangente', 'Équation d’une tangente', (rng, level) => {
  const c = [rng.nonZero(-2, 2), rng.int(-4, 4), rng.int(-4, 4)];
  if (level === 3) c.unshift(rng.nonZero(-1, 1));
  const deg = c.length - 1;
  const x0 = rng.int(-2, 2);
  const f = (x: number) => c.reduce((s, v, i) => s + v * x ** (deg - i), 0);
  const d1 = c.slice(0, -1).map((v, i) => v * (deg - i));
  const fp = d1.reduce((s, v, i) => s + v * x0 ** (d1.length - 1 - i), 0);
  const p = f(x0) - fp * x0;
  return {
    prompt: `$f(x) = ${poly(c)}$. La tangente à sa courbe en $${x0}$ a pour équation $y = mx + p$. Donne $m$ et $p$.`,
    answer: { kind: 'pair', values: [F(fp), F(p)], labels: ['m', 'p'] },
    hint: 'La tangente en $a$ a pour équation $y = f\'(a)(x - a) + f(a)$.',
    correction: [
      `$f'(x) = ${poly(d1)}$, donc $f'(${x0}) = ${fp}$ et $f(${x0}) = ${f(x0)}$.`,
      `$y = ${fp}(x - ${par(x0)})${plus(f(x0))} = ${poly([fp, p])}$`,
    ],
  };
});

const VF = ['Vrai', 'Faux'];
const front = (c: number) => (c === 1 ? '' : c === -1 ? '-' : String(c));
const decale = (c: number) => (c === 0 ? 'x' : `(${poly([1, c])})`);

const puissanceVariantes = [
  variant('inverse', (rng, level) => {
    const a = rng.nonZero(-3, 3);
    const b = rng.int(-4, 4);
    const n = rng.int(1, level === 1 ? 2 : 3);
    const c = rng.nonZero(-5, 5);
    let x0 = rng.int(-2, 2);
    if (a * x0 + b === 0) x0 += 1;
    const u = a * x0 + b;
    const value = F(-n * a * c, u ** (n + 1));
    return {
      prompt: `$f(x) = \\frac{${c}}{(${affine(a, b)})${pw(n)}}$. Calcule $f'(${x0})$ (fraction).`,
      answer: numF(value),
      hint: 'Écris $f = c\\,u^{-n}$ : $f\' = -n\\,c\\,u\'\\,u^{-n-1}$.',
      correction: [
        `$f'(x) = \\frac{${-n * a * c}}{(${affine(a, b)})^{${n + 1}}}$`,
        `$f'(${x0}) = \\frac{${-n * a * c}}{${par(u)}^{${n + 1}}} = ${tex(value)}$`,
      ],
    };
  }),
  variant('vrai-faux', (rng) => {
    const a = rng.pick([-3, -2, 2, 3]);
    const b = rng.int(-4, 4);
    const n = rng.int(2, 4);
    const forme = rng.int(0, 2);
    const u = affine(a, b);
    const claims = [`${n * a}(${u})${pw(n - 1)}`, `${n}(${u})${pw(n - 1)}`, `${n * a}(${u})${pw(n)}`];
    return {
      prompt: `$f(x) = (${u})^{${n}}$. Vrai ou faux : pour tout réel $x$, $f'(x) = ${claims[forme]}$.`,
      answer: fixedChoice(VF, forme === 0 ? 0 : 1),
      hint: '$(u^n)\' = n\\,u\'\\,u^{n-1}$ : n’oublie ni $u\'$ ni l’exposant $n - 1$.',
      correction: [`$u'(x) = ${a}$, donc $f'(x) = ${n}\\times ${par(a)}(${u})${pw(n - 1)} = ${claims[0]}$. C’est ${forme === 0 ? 'vrai' : 'faux'}.`],
    };
  }),
];

const racineVariantes = [
  variant('inverse', (rng) => {
    const a = rng.nonZero(-4, 6);
    const s = rng.int(1, 3);
    const x0 = rng.int(-3, 3);
    const b = s * s - a * x0;
    const value = F(-a, 2 * s ** 3);
    return {
      prompt: `$f(x) = \\frac{1}{\\sqrt{${affine(a, b)}}}$. Calcule $f'(${x0})$ (fraction).`,
      answer: numF(value),
      hint: 'Écris $f = u^{-1/2}$ : $f\' = -\\frac{u\'}{2u\\sqrt{u}}$.',
      correction: [`$f'(x) = -\\frac{${a}}{2(${affine(a, b)})\\sqrt{${affine(a, b)}}}$`, `En $${x0}$, $u = ${s * s}$ : $f'(${x0}) = -\\frac{${a}}{2\\times ${s * s}\\times ${s}} = ${tex(value)}$.`],
    };
  }),
  variant('carre', (rng) => {
    // x0² + c = s² avec (x0, s) tirés d'un triplet pythagoricien ou d'une différence de carrés.
    const [x0, s] = rng.pick([[3, 5], [4, 5], [6, 10], [8, 10], [5, 13], [12, 13], [2, 3], [1, 2], [3, 4], [2, 4]]);
    const signe = rng.pick([1, -1]);
    const c = s * s - x0 * x0;
    const value = F(signe * x0, s);
    return {
      prompt: `$f(x) = \\sqrt{x^2 + ${c}}$. Calcule $f'(${signe * x0})$ (fraction).`,
      answer: numF(value),
      hint: '$(\\sqrt{u})\' = \\frac{u\'}{2\\sqrt{u}}$ avec $u(x) = x^2 + c$.',
      correction: [`$f'(x) = \\frac{2x}{2\\sqrt{x^2 + ${c}}} = \\frac{x}{\\sqrt{x^2 + ${c}}}$`, `$f'(${signe * x0}) = \\frac{${signe * x0}}{\\sqrt{${s * s}}} = ${tex(value)}$`],
    };
  }),
];

const expVariantes = [
  variant('produit', (rng) => {
    const a = rng.nonZero(-4, 4);
    const b = rng.int(-5, 5);
    const k = rng.nonZero(-3, 3);
    return {
      prompt: `$f(x) = (${affine(a, b)})e^{${front(k)}x}$. Calcule $f'(0)$.`,
      answer: num(a + b * k),
      hint: 'Dérivée d’un produit : $(uv)\' = u\'v + uv\'$, avec $(e^{kx})\' = ke^{kx}$.',
      correction: [`$f'(x) = ${a}e^{${front(k)}x} + (${affine(a, b)})\\times ${par(k)}e^{${front(k)}x}$`, `$f'(0) = ${a}${plus(b * k)} = ${a + b * k}$`],
    };
  }),
  variant('carre', (rng) => {
    const p = rng.nonZero(-4, 4);
    const x0 = rng.pick([0, -p]);
    const value = 2 * x0 + p;
    return {
      prompt: `$f(x) = e^{${poly([1, p, 0])}}$. Calcule $f'(${x0})$.`,
      answer: num(value),
      hint: '$(e^u)\' = u\'e^u$ ; calcule aussi $u$ au point demandé.',
      correction: [`$f'(x) = (${poly([2, p])})e^{${poly([1, p, 0])}}$`, `En $${x0}$, l’exposant vaut $0$ : $f'(${x0}) = ${value}\\times e^0 = ${value}$.`],
    };
  }),
];

const secondeVariantes = [
  variant('exponentielle', (rng) => {
    const a = rng.nonZero(-3, 3);
    const c = rng.int(-4, 4);
    const value = 2 * a + a * a * c;
    return {
      prompt: `$f(x) = ${decale(c)}e^{${front(a)}x}$. Calcule $f''(0)$.`,
      answer: num(value),
      hint: 'Dérive le produit deux fois ; $(e^{ax})\' = ae^{ax}$.',
      correction: [
        `$f'(x) = (${poly([a, 1 + a * c])})e^{${front(a)}x}$`,
        `$f''(x) = (${poly([a * a, a + a * (1 + a * c)])})e^{${front(a)}x}$`,
        `$f''(0) = ${value}$`,
      ],
    };
  }),
  variant('retrouver-coefficient', (rng) => {
    const m = rng.nonZero(-3, 3);
    const b = rng.nonZero(-5, 5);
    const c = rng.int(-5, 5);
    const x0 = rng.nonZero(-2, 2);
    const v = 6 * m * x0 + 2 * b;
    return {
      prompt: `$f(x) = mx^3${poly([b, c, 0]).startsWith('-') ? ' ' : ' + '}${poly([b, c, 0]).replace(/^-/, '- ')}$ où $m$ est un réel, et $f''(${x0}) = ${v}$. Calcule $m$.`,
      answer: num(m),
      hint: 'Calcule $f\'\'(x)$ en fonction de $m$, puis résous l’équation.',
      correction: [`$f''(x) = 6mx${plus(2 * b)}$`, `$6m\\times ${par(x0)}${plus(2 * b)} = ${v}$ donc $m = ${m}$.`],
    };
  }),
];

const inflexionVariantes = [
  variant('ordonnee', (rng, level) => {
    const a = level === 1 ? 1 : rng.nonZero(-2, 2);
    const x0 = rng.int(-2, 2);
    const b = -3 * a * x0;
    const c = rng.int(-6, 6);
    const d = rng.int(-6, 6);
    const y0 = a * x0 ** 3 + b * x0 ** 2 + c * x0 + d;
    return {
      prompt: `$f(x) = ${poly([a, b, c, d])}$. Quelle est l’ordonnée de son point d’inflexion ?`,
      answer: num(y0),
      hint: 'Cherche d’abord l’abscisse où $f\'\'$ s’annule en changeant de signe, puis calcule son image.',
      correction: [`$f''(x) = ${poly([6 * a, 2 * b])}$ s’annule en $${x0}$ en changeant de signe.`, `$f(${x0}) = ${y0}$.`],
    };
  }),
  variant('vrai-faux', (rng) => {
    const p = rng.int(-4, 4);
    const k = rng.int(1, 3);
    const signe = rng.pick(['', '-']);
    const ok = k % 2 === 1;
    return {
      prompt: `Pour tout réel $x$, $f''(x) = ${signe}${decale(-p)}${pw(k)}e^{x}$. Vrai ou faux : la courbe de $f$ a un point d’inflexion d’abscisse $${p}$.`,
      answer: fixedChoice(VF, ok ? 0 : 1),
      hint: 'Il ne suffit pas que $f\'\'$ s’annule : il faut qu’elle change de signe.',
      correction: [ok ? `$f''$ s’annule en $${p}$ en changeant de signe (puissance impaire) : c’est vrai.` : `$f''$ s’annule en $${p}$ mais garde le même signe (carré) : c’est faux.`],
    };
  }),
];

const convexiteVariantes = [
  variant('polynome', (rng) => {
    const a = rng.nonZero(-2, 2);
    const k = rng.int(-3, 3);
    const b = -3 * a * k;
    const c = rng.int(-5, 5);
    const options = [
      `Convexe sur $]-\\infty\\,;\\,${k}]$, concave sur $[${k}\\,;\\,+\\infty[$`,
      `Concave sur $]-\\infty\\,;\\,${k}]$, convexe sur $[${k}\\,;\\,+\\infty[$`,
      'Convexe sur $\\mathbb{R}$',
      'Concave sur $\\mathbb{R}$',
    ];
    return {
      prompt: `$f(x) = ${poly([a, b, c, 0])}$. Que peut-on dire de la convexité de $f$ ?`,
      answer: fixedChoice(options, a > 0 ? 1 : 0),
      hint: 'Étudie le signe de $f\'\'$, qui est affine.',
      correction: [`$f''(x) = ${poly([6 * a, 2 * b])} = ${6 * a}${decale(-k)}$, du signe de $${a}$ à droite de $${k}$.`, a > 0 ? 'Concave puis convexe.' : 'Convexe puis concave.'],
    };
  }),
  variant('derivee-monotone', (rng) => {
    const k = rng.int(-4, 4);
    const croissanteAvant = rng.next() < 0.5;
    const options = [
      `Convexe sur $]-\\infty\\,;\\,${k}]$, concave sur $[${k}\\,;\\,+\\infty[$`,
      `Concave sur $]-\\infty\\,;\\,${k}]$, convexe sur $[${k}\\,;\\,+\\infty[$`,
      'Convexe sur $\\mathbb{R}$',
      'Concave sur $\\mathbb{R}$',
    ];
    return {
      prompt: `$f$ est dérivable sur $\\mathbb{R}$ et sa dérivée $f'$ est ${croissanteAvant ? 'croissante' : 'décroissante'} sur $]-\\infty\\,;\\,${k}]$ puis ${croissanteAvant ? 'décroissante' : 'croissante'} sur $[${k}\\,;\\,+\\infty[$. Que peut-on dire de la convexité de $f$ ?`,
      answer: fixedChoice(options, croissanteAvant ? 0 : 1),
      hint: '$f$ est convexe exactement là où $f\'$ est croissante.',
      correction: [croissanteAvant ? `$f'$ croissante puis décroissante : $f$ est convexe puis concave.` : `$f'$ décroissante puis croissante : $f$ est concave puis convexe.`],
    };
  }),
];

const tangenteVariantes = [
  variant('exponentielle', (rng) => {
    const a = rng.nonZero(-3, 3);
    const x0 = rng.int(-2, 2);
    const b = -a * x0;
    return {
      prompt: `$f(x) = e^{${affine(a, b)}}$. La tangente à sa courbe en $${x0}$ a pour équation $y = mx + p$. Donne $m$ et $p$.`,
      answer: { kind: 'pair', values: [F(a), F(1 - a * x0)], labels: ['m', 'p'] },
      hint: '$y = f\'(a)(x - a) + f(a)$ ; ici l’exposant s’annule au point demandé.',
      correction: [`$f(${x0}) = e^0 = 1$ et $f'(${x0}) = ${a}e^0 = ${a}$.`, `$y = ${a}(x - ${par(x0)}) + 1 = ${poly([a, 1 - a * x0])}$`],
    };
  }),
  variant('point-de-contact', (rng) => {
    const a = rng.nonZero(-3, 3);
    const b = rng.int(-6, 6);
    const c = rng.int(-6, 6);
    const x0 = rng.int(-4, 4);
    const m = 2 * a * x0 + b;
    return {
      prompt: `$f(x) = ${poly([a, b, c])}$. En quelle abscisse la tangente à sa courbe a-t-elle pour coefficient directeur $${m}$ ?`,
      answer: num(x0),
      hint: 'Le coefficient directeur de la tangente en $a$ est $f\'(a)$ : résous $f\'(a) = m$.',
      correction: [`$f'(x) = ${poly([2 * a, b])}$.`, `$${poly([2 * a, b])} = ${m} \\iff x = ${x0}$.`],
    };
  }),
];

export const DERIVATION_SKILLS: Skill[] = [
  enrich(puissance, puissanceVariantes),
  enrich(racine, racineVariantes),
  enrich(expComposee, expVariantes),
  enrich(seconde, secondeVariantes),
  enrich(inflexion, inflexionVariantes),
  enrich(convexite, convexiteVariantes),
  enrich(tangente, tangenteVariantes),
];
