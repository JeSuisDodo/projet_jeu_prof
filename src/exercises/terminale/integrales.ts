import type { Skill } from '../types';
import type { Rng } from '../rng';
import { enrich, variant } from '../variantes';
import { F, choiceTex, div, num, numF, par, plus, poly, skill, sub, tex } from './util';
import { evalFrac, polyFrac, primitiveCoefs } from './primitives';

/** Chapitre « Calcul intégral » (Terminale spécialité). */

function randomPoly(rng: Rng, deg: number): number[] {
  return [rng.nonZero(-3, 3), ...Array.from({ length: deg }, () => rng.int(-4, 4))];
}

const bounds = (rng: Rng) => {
  const a = rng.int(-2, 1);
  return [a, a + rng.int(1, 3)] as const;
};

const polynome = skill('tle-integrale-polynome', 'Calculer l’intégrale d’un polynôme', (rng, level) => {
  const c = randomPoly(rng, level === 1 ? 1 : 2);
  const [a, b] = bounds(rng);
  const P = primitiveCoefs(c);
  const value = sub(evalFrac(P, b), evalFrac(P, a));
  return {
    prompt: `Calcule $\\displaystyle\\int_{${a}}^{${b}} (${poly(c)})\\,dx$.`,
    answer: numF(value),
    hint: 'Trouve une primitive $F$, puis calcule $F(b) - F(a)$.',
    correction: [
      `Une primitive est $F(x) = ${polyFrac(P)}$.`,
      `$F(${b}) - F(${a}) = ${tex(evalFrac(P, b))} - ${tex(evalFrac(P, a)).startsWith('-') ? `\\left(${tex(evalFrac(P, a))}\\right)` : tex(evalFrac(P, a))} = ${tex(value)}$`,
    ],
  };
});

const ePow = (t: number) => (t === 1 ? 'e' : `e^{${t}}`);

const exponentielle = skill('tle-integrale-exp', 'Intégrer une exponentielle', (rng) => {
  const k = rng.int(1, 3);
  const b = rng.int(1, 2);
  const kx = k === 1 ? 'x' : `${k}x`;
  const factor = k === 1 ? '' : `\\frac{1}{${k}}`;
  const top = k * b;
  const correct = k === 1 ? `${ePow(top)} - 1` : `\\frac{${ePow(top)} - 1}{${k}}`;
  const decoys = [ePow(top), `${ePow(top)} + 1`, `${ePow(top + 1)} - 1`];
  if (k > 1) decoys.push(`${k}(${ePow(top)} - 1)`, `\\frac{${ePow(top)}}{${k}}`);
  return {
    prompt: `Calcule $\\displaystyle\\int_{0}^{${b}} e^{${kx}}\\,dx$.`,
    answer: choiceTex(rng, correct, decoys, () => `${ePow(top + 2)} - 1`),
    hint: `Une primitive de $e^{${kx}}$ est $${factor}e^{${kx}}$.`,
    correction: [`$\\left[${factor}e^{${kx}}\\right]_0^{${b}} = ${factor}${ePow(top)} - ${factor}e^0$`, `$= ${correct}$`],
  };
});

const moyenne = skill('tle-valeur-moyenne', 'Calculer une valeur moyenne', (rng, level) => {
  const c = randomPoly(rng, level === 1 ? 1 : 2);
  const [a, b] = bounds(rng);
  const P = primitiveCoefs(c);
  const integral = sub(evalFrac(P, b), evalFrac(P, a));
  const value = div(integral, F(b - a));
  return {
    prompt: `Quelle est la valeur moyenne de $f(x) = ${poly(c)}$ sur $[${a}\\,;\\,${b}]$ ?`,
    answer: numF(value),
    hint: 'Valeur moyenne : $\\mu = \\frac{1}{b - a}\\displaystyle\\int_a^b f(x)\\,dx$.',
    correction: [`$\\displaystyle\\int_{${a}}^{${b}} f(x)\\,dx = ${tex(integral)}$`, `$\\mu = \\frac{1}{${b - a}}\\times ${tex(integral).startsWith('-') ? `\\left(${tex(integral)}\\right)` : tex(integral)} = ${tex(value)}$`],
  };
});

const aire = skill('tle-aire-entre-courbes', 'Calculer une aire entre deux courbes', (rng, level) => {
  // f - g = k (x - r1)(r2 - x) ≥ 0 entre r1 et r2 ; aire = k (r2 - r1)³ / 6.
  const r1 = rng.int(-3, 1);
  const r2 = r1 + rng.int(1, 3);
  const k = level === 1 ? 1 : rng.int(1, 3);
  const g = [rng.int(-2, 2), rng.int(-3, 3), rng.int(-3, 3)];
  const diff = [-k, k * (r1 + r2), -k * r1 * r2];
  const f = g.map((v, i) => v + diff[i]);
  const value = F(k * (r2 - r1) ** 3, 6);
  return {
    prompt: `$f(x) = ${poly(f)}$ et $g(x) = ${poly(g)}$. Les courbes se coupent en $x = ${r1}$ et $x = ${r2}$, et $f \\geq g$ entre les deux. Calcule l’aire entre les courbes.`,
    answer: numF(value),
    hint: 'Aire $= \\displaystyle\\int_{x_1}^{x_2} (f(x) - g(x))\\,dx$ quand $f \\geq g$.',
    correction: [
      `$f(x) - g(x) = ${poly(diff)}$`,
      `Une primitive est $${polyFrac(primitiveCoefs(diff))}$.`,
      `$\\displaystyle\\int_{${r1}}^{${r2}} (f - g)\\,dx = ${tex(value)}$ unités d’aire.`,
    ],
  };
});

const linearite = skill('tle-integrale-linearite', 'Utiliser la linéarité et la relation de Chasles', (rng, level) => {
  const I = rng.int(-6, 9);
  const J = rng.int(-6, 9);
  const a = rng.nonZero(-3, 4);
  const b = rng.nonZero(-3, 4);
  if (level === 3 && rng.next() < 0.5) {
    return {
      prompt: `$\\displaystyle\\int_0^{2} f(x)\\,dx = ${I}$ et $\\displaystyle\\int_2^{5} f(x)\\,dx = ${J}$. Calcule $\\displaystyle\\int_0^{5} ${a === 1 ? '' : a}f(x)\\,dx$.`,
      answer: num(a * (I + J)),
      hint: 'Relation de Chasles : $\\int_a^b + \\int_b^c = \\int_a^c$.',
      correction: [`$\\displaystyle\\int_0^5 f = ${I}${plus(J)} = ${I + J}$`, `Par linéarité : $${a}\\times ${I + J < 0 ? `(${I + J})` : I + J} = ${a * (I + J)}$`],
    };
  }
  return {
    prompt: `$\\displaystyle\\int_0^{1} f(x)\\,dx = ${I}$ et $\\displaystyle\\int_0^{1} g(x)\\,dx = ${J}$. Calcule $\\displaystyle\\int_0^{1} (${a === 1 ? '' : a === -1 ? '-' : a}f(x)${b < 0 ? ' - ' : ' + '}${Math.abs(b) === 1 ? '' : Math.abs(b)}g(x))\\,dx$.`,
    answer: num(a * I + b * J),
    hint: 'Linéarité : $\\int (af + bg) = a\\int f + b\\int g$.',
    correction: [`$${a}\\times ${I < 0 ? `(${I})` : I}${b < 0 ? ' - ' : ' + '}${Math.abs(b)}\\times ${J < 0 ? `(${J})` : J} = ${a * I + b * J}$`],
  };
});

const ipp = skill('tle-integration-parties', 'Intégrer par parties', (rng) => {
  // ∫_0^k x e^x dx = (k - 1)e^k + 1
  const k = rng.int(1, 3);
  const lead = k === 1 ? '' : String(k);
  const correct = k === 1 ? '1' : `${k === 2 ? '' : k - 1}${ePow(k)} + 1`;
  return {
    prompt: `Calcule $\\displaystyle\\int_0^{${k}} xe^x\\,dx$.`,
    answer: choiceTex(rng, correct, [`${lead}${ePow(k)}`, `${lead}${ePow(k)} - 1`, `${ePow(k)} - 1`, `${k + 1}${ePow(k)} - 1`], () => `${k + 1}${ePow(k)} + 1`),
    hint: 'Pose $u = x$ et $v\' = e^x$ : $\\int uv\' = [uv] - \\int u\'v$.',
    correction: [
      `$u = x$, $u' = 1$, $v = e^x$.`,
      `$\\displaystyle\\int_0^{${k}} xe^x\\,dx = \\left[xe^x\\right]_0^{${k}} - \\int_0^{${k}} e^x\\,dx = ${lead}${ePow(k)} - (${ePow(k)} - 1)$`,
      `$= ${correct}$`,
    ],
  };
});

const front = (c: number) => (c === 1 ? '' : c === -1 ? '-' : String(c));
const integ = (a: number | string, b: number | string, f: string) => `\\displaystyle\\int_{${a}}^{${b}} ${f}\\,dx`;

const polynomeVariantes = [
  variant('inverse-carre', (rng) => {
    const a = rng.nonZero(-6, 6);
    const b = rng.int(2, 6);
    const value = F(a * (b - 1), b);
    return {
      prompt: `Calcule $${integ(1, b, `\\frac{${a}}{x^2}`)}$ (fraction).`,
      answer: numF(value),
      hint: 'Une primitive de $\\frac{1}{x^2}$ est $-\\frac{1}{x}$.',
      correction: [`$\\left[-\\frac{${a}}{x}\\right]_1^{${b}} = ${tex(F(-a, b))} + ${par(a)} = ${tex(value)}$`],
    };
  }),
  variant('retrouver-borne', (rng) => {
    const t = rng.int(1, 5);
    const c = rng.int(-t, 5);
    const V = t * t + c * t;
    return {
      prompt: `Trouve le réel $t > 0$ tel que $${integ(0, 't', `(${poly([2, c])})`)} = ${V}$.`,
      answer: num(t),
      hint: 'Calcule l’intégrale en fonction de $t$, puis résous l’équation du second degré obtenue.',
      correction: [`$${integ(0, 't', `(${poly([2, c])})`)} = ${poly([1, c, 0], 't')}$.`, `$${poly([1, c, -V], 't')} = 0$ a pour solution positive $t = ${t}$.`],
    };
  }),
];

const exponentielleVariantes = [
  variant('borne-ln', (rng) => {
    const k = rng.int(2, 9);
    const m = rng.nonZero(-4, 4);
    return {
      prompt: `Calcule $${integ(0, `\\ln ${k}`, `${front(m)}e^x`)}$.`,
      answer: num(m * (k - 1)),
      hint: '$e^{\\ln k} = k$.',
      correction: [`$\\left[${front(m)}e^x\\right]_0^{\\ln ${k}} = ${m}\\times ${k} - ${par(m)}\\times 1 = ${m * (k - 1)}$`],
    };
  }),
  variant('exp-negative', (rng) => {
    const b = rng.int(1, 3);
    const p = b === 1 ? 'e^{-1}' : `e^{-${b}}`;
    return {
      prompt: `Calcule $${integ(0, b, 'e^{-x}')}$.`,
      answer: choiceTex(rng, `1 - ${p}`, [`${p} - 1`, `1 + ${p}`, `${ePow(b)} - 1`], () => p),
      hint: 'Une primitive de $e^{-x}$ est $-e^{-x}$ : attention au signe.',
      correction: [`$\\left[-e^{-x}\\right]_0^{${b}} = -${p} - (-1) = 1 - ${p}$`],
    };
  }),
];

const moyenneVariantes = [
  variant('retrouver-integrale', (rng) => {
    const a = rng.int(-3, 2);
    const b = a + rng.int(1, 5);
    const mu = rng.nonZero(-7, 7);
    return {
      prompt: `La valeur moyenne d’une fonction continue $f$ sur $[${a}\\,;\\,${b}]$ vaut $${mu}$. Calcule $${integ(a, b, 'f(x)')}$.`,
      answer: num(mu * (b - a)),
      hint: '$\\mu = \\frac{1}{b - a}\\displaystyle\\int_a^b f$, donc $\\displaystyle\\int_a^b f = (b - a)\\mu$.',
      correction: [`$${integ(a, b, 'f(x)')} = ${b - a}\\times ${par(mu)} = ${mu * (b - a)}$`],
    };
  }),
  variant('inverse-carre', (rng) => {
    const a = rng.nonZero(-6, 6);
    const b = rng.int(2, 6);
    const value = F(a, b);
    return {
      prompt: `Quelle est la valeur moyenne de $f(x) = \\frac{${a}}{x^2}$ sur $[1\\,;\\,${b}]$ (fraction) ?`,
      answer: numF(value),
      hint: 'Calcule l’intégrale avec la primitive $-\\frac{1}{x}$, puis divise par la longueur de l’intervalle.',
      correction: [`$${integ(1, b, 'f(x)')} = ${tex(F(a * (b - 1), b))}$`, `$\\mu = \\frac{1}{${b - 1}}\\times ${tex(F(a * (b - 1), b))} = ${tex(value)}$`],
    };
  }),
];

const aireVariantes = [
  variant('sous-courbe', (rng) => {
    const r1 = rng.int(-3, 1);
    const r2 = r1 + rng.int(1, 4);
    const k = rng.int(1, 3);
    const f = [-k, k * (r1 + r2), -k * r1 * r2];
    const value = F(k * (r2 - r1) ** 3, 6);
    return {
      prompt: `$f(x) = ${poly(f)}$ est positive sur $[${r1}\\,;\\,${r2}]$. Calcule l’aire du domaine compris entre sa courbe, l’axe des abscisses et les droites $x = ${r1}$ et $x = ${r2}$.`,
      answer: numF(value),
      hint: 'Pour une fonction positive, l’aire est $\\displaystyle\\int_a^b f(x)\\,dx$.',
      correction: [`Une primitive est $${polyFrac(primitiveCoefs(f))}$.`, `Aire $= ${tex(value)}$ unités d’aire.`],
    };
  }),
  variant('fonction-negative', (rng) => {
    const p = rng.int(1, 3) * 3;
    const q = rng.int(1, 5);
    const b = rng.int(1, 3);
    const value = F((p * b ** 3) / 3 + q * b);
    return {
      prompt: `$f(x) = ${poly([-p, 0, -q])}$ est négative sur $[0\\,;\\,${b}]$. Calcule l’aire du domaine compris entre sa courbe, l’axe des abscisses et les droites $x = 0$ et $x = ${b}$.`,
      answer: numF(value),
      hint: 'Pour une fonction négative, l’aire est $-\\displaystyle\\int_a^b f(x)\\,dx$ : une aire est toujours positive.',
      correction: [`$${integ(0, b, 'f(x)')} = \\left[${polyFrac(primitiveCoefs([-p, 0, -q]))}\\right]_0^{${b}} = ${tex(F(-value.n, value.d))}$`, `Aire $= ${tex(value)}$ unités d’aire.`],
    };
  }),
];

const lineariteVariantes = [
  variant('chasles-difference', (rng) => {
    const c = rng.int(1, 4);
    const d = c + rng.int(1, 4);
    const I = rng.int(-9, 9);
    const J = rng.int(-9, 9);
    return {
      prompt: `$${integ(0, d, 'f(x)')} = ${I}$ et $${integ(0, c, 'f(x)')} = ${J}$. Calcule $${integ(c, d, 'f(x)')}$.`,
      answer: num(I - J),
      hint: 'Chasles : $\\int_0^c + \\int_c^d = \\int_0^d$.',
      correction: [`$${integ(c, d, 'f(x)')} = ${I} - ${par(J)} = ${I - J}$`],
    };
  }),
  variant('bornes-inversees', (rng) => {
    const a = rng.int(-2, 2);
    const b = a + rng.int(1, 4);
    const I = rng.nonZero(-9, 9);
    const k = rng.nonZero(-4, 4);
    return {
      prompt: `$${integ(a, b, 'f(x)')} = ${I}$. Calcule $${integ(b, a, `${front(k)}f(x)`)}$.`,
      answer: num(-k * I),
      hint: 'Échanger les bornes change le signe : $\\int_b^a f = -\\int_a^b f$.',
      correction: [`$${integ(b, a, `${front(k)}f(x)`)} = -${par(k)}\\times ${par(I)} = ${-k * I}$`],
    };
  }),
];

const ippVariantes = [
  variant('affine-exp', (rng) => {
    const a = rng.nonZero(-3, 3);
    let b = rng.nonZero(-3, 3);
    if (a + b === 0) b = a;
    // ∫_0^1 (ax + b)e^x dx = [(ax + b)e^x]_0^1 - a(e - 1) = b(e - 1) + a.
    const correct = `${front(b)}e${plus(a - b)}`;
    return {
      prompt: `Calcule $${integ(0, 1, `(${poly([a, b])})e^x`)}$.`,
      answer: choiceTex(rng, correct, [`${front(a + b)}e${plus(-b)}`, `${front(a + b)}e${plus(a - b)}`, `${front(b)}e${plus(-b)}`, `${front(b)}e${plus(a + b)}`], () => `${front(b + 1)}e${plus(a - b)}`),
      hint: 'Pose $u = ax + b$ et $v\' = e^x$.',
      correction: [`$\\left[(${poly([a, b])})e^x\\right]_0^1 - ${integ(0, 1, `${a}e^x`)}$`, `$= ${front(a + b)}e - ${par(b)} - ${par(a)}(e - 1) = ${correct}$`],
    };
  }),
  variant('logarithme', (rng) => {
    const k = rng.nonZero(-6, 6);
    return {
      prompt: `Calcule $${integ(1, 'e', `${front(k)}\\ln x`)}$.`,
      answer: num(k),
      hint: 'Intègre par parties avec $u = \\ln x$ et $v\' = 1$ : une primitive de $\\ln x$ est $x\\ln x - x$.',
      correction: [`$${integ(1, 'e', '\\ln x')} = \\left[x\\ln x - x\\right]_1^e = (e - e) - (0 - 1) = 1$`, `Par linéarité, l’intégrale vaut $${k}$.`],
    };
  }),
];

export const INTEGRALES_SKILLS: Skill[] = [
  enrich(polynome, polynomeVariantes),
  enrich(exponentielle, exponentielleVariantes),
  enrich(moyenne, moyenneVariantes),
  enrich(aire, aireVariantes),
  enrich(linearite, lineariteVariantes),
  enrich(ipp, ippVariantes),
];
