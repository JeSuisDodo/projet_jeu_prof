import type { Level, Skill } from '../types';
import type { Rng } from '../rng';
import { choiceTex, gcd, num, par, poly, skill } from './outils';

/** 3e : développer, factoriser, identités remarquables, programmes de calcul. */

const coef = (rng: Rng, level: Level) => (level === 1 ? rng.int(1, 3) : level === 2 ? rng.nonZero(-4, 4) : rng.nonZero(-6, 6));
/** Facteur ax + b, avec « x » seul si a = 1. */
const aff = (a: number, b: number) => poly([a, b]);
/** « x », « 3x » ou « (-2x) » pour écrire un produit terme à terme. */
const mono = (a: number) => (a < 0 ? `(${poly([a, 0])})` : poly([a, 0]));

const simple = skill('3e-developper-simple', 'Développer avec la simple distributivité', (rng, level) => {
  const k = level === 1 ? rng.int(2, 6) : rng.nonZero(-7, 7);
  const a = coef(rng, level);
  const b = rng.nonZero(-9, 9);
  const withX = level === 3 && rng.next() < 0.6;
  const kx = withX ? poly([k, 0]) : String(k);
  const res = withX ? poly([k * a, k * b, 0]) : poly([k * a, k * b]);
  const decoys = withX
    ? [poly([k * a, b, 0]), poly([k * a, k * b]), poly([k * a, -k * b, 0]), poly([a, k * b, 0])]
    : [poly([k * a, b]), poly([k * a, -k * b]), poly([a, k * b]), poly([k + a, k * b])];
  return {
    prompt: `Développe $${kx}(${aff(a, b)})$.`,
    answer: choiceTex(rng, res, decoys, () => poly(withX ? [k * a, k * b + rng.nonZero(-3, 3), 0] : [k * a, k * b + rng.nonZero(-3, 3)])),
    hint: `$k(a + b) = ka + kb$ : multiplie chaque terme de la parenthèse par $${kx}$.`,
    correction: [`$${kx}(${aff(a, b)}) = ${withX ? mono(k) : par(k)} \\times ${mono(a)} + ${withX ? mono(k) : par(k)} \\times ${par(b)}$`, `$= ${res}$`],
  };
});

const double = skill('3e-developper-double', 'Développer avec la double distributivité', (rng, level) => {
  const a = coef(rng, level);
  const b = rng.nonZero(-7, 7);
  const c = coef(rng, level);
  const d = rng.nonZero(-7, 7);
  const A = a * c;
  const B = a * d + b * c;
  const C = b * d;
  return {
    prompt: `Développe et réduis $(${aff(a, b)})(${aff(c, d)})$.`,
    answer: choiceTex(rng, poly([A, B, C]), [poly([A, a * d - b * c, C]), poly([A, B, -C]), poly([A, 0, C]), poly([A, C]), poly([a + c, B, C])], () =>
      poly([A, B + rng.nonZero(-3, 3), C]),
    ),
    hint: '$(a + b)(c + d) = ac + ad + bc + bd$ : chaque terme de la première parenthèse multiplie chaque terme de la seconde.',
    correction: [
      `$(${aff(a, b)})(${aff(c, d)}) = ${mono(a)} \\times ${mono(c)} + ${mono(a)} \\times ${par(d)} + ${par(b)} \\times ${mono(c)} + ${par(b)} \\times ${par(d)}$`,
      `$= ${poly([A, 0, 0])} ${a * d < 0 ? '-' : '+'} ${Math.abs(a * d)}x ${b * c < 0 ? '-' : '+'} ${Math.abs(b * c)}x ${C < 0 ? '-' : '+'} ${Math.abs(C)}$`,
      `$= ${poly([A, B, C])}$`,
    ],
  };
});

const identites = skill('3e-identites', 'Développer avec une identité remarquable', (rng, level) => {
  const a = level === 1 ? 1 : rng.int(1, level === 2 ? 3 : 5);
  const b = rng.int(1, level === 3 ? 9 : 6);
  const kind = rng.pick(['plus', 'moins', 'diff'] as const);
  const ax = poly([a, 0]);
  if (kind === 'diff') {
    return {
      prompt: `Développe $(${ax} - ${b})(${ax} + ${b})$.`,
      answer: choiceTex(rng, poly([a * a, 0, -b * b]), [poly([a * a, 0, b * b]), poly([a * a, -2 * a * b, -b * b]), poly([a, 0, -b]), poly([a * a, 2 * a * b, -b * b])], () =>
        poly([a * a, 0, -b * b - rng.int(1, 5)]),
      ),
      hint: '$(a - b)(a + b) = a^2 - b^2$',
      correction: ['$(a - b)(a + b) = a^2 - b^2$', `$(${ax} - ${b})(${ax} + ${b}) = (${ax})^2 - ${b}^2 = ${poly([a * a, 0, -b * b])}$`],
    };
  }
  const s = kind === 'plus' ? 1 : -1;
  const res = poly([a * a, 2 * s * a * b, b * b]);
  return {
    prompt: `Développe $(${ax} ${s > 0 ? '+' : '-'} ${b})^2$.`,
    answer: choiceTex(rng, res, [poly([a * a, 0, b * b]), poly([a * a, s * a * b, b * b]), poly([a * a, 2 * s * a * b, -b * b]), poly([a, 2 * s * a * b, b * b])], () =>
      poly([a * a, 2 * s * a * b + rng.nonZero(-4, 4), b * b]),
    ),
    hint: s > 0 ? '$(a + b)^2 = a^2 + 2ab + b^2$' : '$(a - b)^2 = a^2 - 2ab + b^2$',
    correction: [
      s > 0 ? '$(a + b)^2 = a^2 + 2ab + b^2$' : '$(a - b)^2 = a^2 - 2ab + b^2$',
      `$(${ax})^2 ${s > 0 ? '+' : '-'} 2 \\times ${ax === 'x' ? 'x' : `${a}x`} \\times ${b} + ${b}^2 = ${res}$`,
    ],
  };
});

const facteurCommun = skill('3e-factoriser', 'Factoriser avec un facteur commun', (rng, level) => {
  if (level === 3) {
    // (ax + b)(cx + d) + (ax + b)(ex + f) = (ax + b)((c + e)x + d + f)
    const a = rng.int(1, 3);
    const b = rng.nonZero(-6, 6);
    const c = rng.int(1, 4);
    const d = rng.nonZero(-6, 6);
    const e = (c + rng.int(0, 2)) % 4 + 1;
    const f = rng.pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6].filter((v) => v !== d));
    const sub = rng.next() < 0.5;
    const second = sub ? poly([c - e, d - f]) : poly([c + e, d + f]);
    const wrong = sub ? poly([c + e, d + f]) : poly([c - e, d - f]);
    return {
      prompt: `Factorise $(${aff(a, b)})(${aff(c, d)}) ${sub ? '-' : '+'} (${aff(a, b)})(${aff(e, f)})$.`,
      answer: choiceTex(rng, `(${aff(a, b)})(${second})`, [`(${aff(a, b)})(${wrong})`, `(${aff(a, b)})(${poly([c * e, d * f])})`, `(${aff(a, b)})^2(${second})`, `(${aff(a, b)})(${poly([c + e, d - f])})`], () =>
        `(${aff(a, b)})(${poly([c + e + rng.int(1, 3), d + f])})`,
      ),
      hint: `Le facteur commun est $(${aff(a, b)})$. Attention au signe devant la seconde parenthèse.`,
      correction: [
        `$= (${aff(a, b)})\\left[(${aff(c, d)}) ${sub ? '-' : '+'} (${aff(e, f)})\\right]$`,
        `$= (${aff(a, b)})(${second})$`,
      ],
    };
  }
  const k = rng.int(2, level === 1 ? 6 : 9);
  const withX = level === 2;
  // k·x·(p x + q) ou k·(p x + q), avec p et q premiers entre eux pour que k soit bien le plus grand facteur.
  let pp: number;
  let qq: number;
  do {
    pp = rng.int(1, 7);
    qq = rng.nonZero(-9, 9);
  } while (gcd(pp, qq) !== 1);
  const expanded = withX ? poly([k * pp, k * qq, 0]) : poly([k * pp, k * qq]);
  const out = withX ? `${k}x(${aff(pp, qq)})` : `${k}(${aff(pp, qq)})`;
  return {
    prompt: `Factorise au maximum $${expanded}$.`,
    answer: choiceTex(
      rng,
      out,
      withX
        ? [`${k}(${poly([pp, qq, 0])})`, `x(${poly([k * pp, k * qq])})`, `${k}x(${aff(pp, -qq)})`, `${k}x(${aff(pp, k * qq)})`]
        : [`${k}(${aff(pp, -qq)})`, `${k}(${aff(k * pp, qq)})`, `${k}x(${aff(pp, qq)})`, `${k * pp}(x ${qq < 0 ? '-' : '+'} ${Math.abs(qq)})`],
      () => `${k}(${aff(pp + rng.int(1, 3), qq)})`,
    ),
    hint: 'Cherche le plus grand facteur commun à tous les termes (nombre et, s’il y en a, $x$), puis mets-le devant la parenthèse.',
    correction: [`Le facteur commun est $${withX ? `${k}x` : k}$.`, `$${expanded} = ${out}$`],
  };
});

const differenceCarres = skill('3e-factoriser-identite', 'Factoriser une différence de deux carrés', (rng, level) => {
  const a = level === 1 ? 1 : rng.int(2, level === 2 ? 4 : 7);
  const b = rng.int(1, level === 1 ? 10 : 9);
  const ax = poly([a, 0]);
  const expr = poly([a * a, 0, -b * b]);
  return {
    prompt: `Factorise $${expr}$.`,
    answer: choiceTex(rng, `(${ax} - ${b})(${ax} + ${b})`, [`(${ax} - ${b})^2`, `(${ax} + ${b})^2`, `(${ax} - ${b * b})(${ax} + ${b * b})`, `(${poly([a * a, 0])} - ${b})(${poly([a * a, 0])} + ${b})`], () =>
      `(${ax} - ${b + rng.int(1, 3)})(${ax} + ${b})`,
    ),
    hint: '$a^2 - b^2 = (a - b)(a + b)$',
    correction: [`$${expr} = (${ax})^2 - ${b}^2$`, `$= (${ax} - ${b})(${ax} + ${b})$`],
  };
});

type Step = { text: string; apply: (v: number, x: number) => number; tex: (v: number, x: number) => string };

const programme = skill('3e-programme-calcul', 'Appliquer un programme de calcul', (rng, level) => {
  const a = rng.int(2, 9);
  const b = rng.int(2, 6);
  const c = rng.int(1, 9);
  const pool: Step[] = [
    { text: `ajouter $${a}$`, apply: (v) => v + a, tex: (v) => `${v} + ${a}` },
    { text: `multiplier par $${b}$`, apply: (v) => v * b, tex: (v) => `${par(v)} \\times ${b}` },
    { text: `soustraire $${c}$`, apply: (v) => v - c, tex: (v) => `${v} - ${c}` },
  ];
  const steps = level === 1 ? rng.shuffle(pool).slice(0, 2) : rng.shuffle(pool);
  if (level === 3) steps.push({ text: 'multiplier le résultat par le nombre de départ', apply: (v, x) => v * x, tex: (v, x) => `${par(v)} \\times ${par(x)}` });
  const x = level === 1 ? rng.int(1, 9) : rng.nonZero(-6, 8);
  let v = x;
  const lines: string[] = [];
  steps.forEach((s, i) => {
    const before = v;
    v = s.apply(v, x);
    lines.push(`(${i + 1}) ${s.text} : $${s.tex(before, x)} = ${v}$`);
  });
  return {
    prompt: `Programme de calcul : choisir un nombre, puis ${steps.map((s, i) => `(${i + 1}) ${s.text}`).join(', ')}. Quel résultat obtient-on en choisissant $${x}$ ?`,
    answer: num(v),
    hint: 'Applique les étapes une par une, dans l’ordre, en partant du nombre choisi.',
    correction: [`On part de $${x}$.`, ...lines, `Le résultat est $${v}$.`],
  };
});

export const CALCUL_LITTERAL_3E: Skill[] = [simple, double, identites, facteurCommun, differenceCarres, programme];
