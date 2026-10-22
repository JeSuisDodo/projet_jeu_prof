import type { Skill } from '../types';
import { F, affine, fact, mul, num, numF, pairOf, par, plus, poly, skill, sub, tex } from './util';

/** Chapitre « Dérivabilité » (Licence 1). */

const deriveeComposee = skill('l1-derivee-composee', 'Dériver une composée', (rng, level) => {
  const a = rng.nonZero(-3, 3);
  const b = rng.int(-3, 3);
  const x0 = rng.int(-2, 2);
  if (level === 1) {
    const n = rng.int(2, 4);
    // f(x) = (ax + b)^n, f'(x0) = n a (a x0 + b)^{n−1}
    const value = n * a * (a * x0 + b) ** (n - 1);
    return {
      prompt: `$f(x) = (${affine(a, b)})^{${n}}$. Calcule $f'(${x0})$.`,
      answer: num(value),
      hint: '$(u^n)\' = n u\' u^{n-1}$.',
      correction: [`$f'(x) = ${n}\\times${par(a)}\\times(${affine(a, b)})^{${n - 1}}$`, `$f'(${x0}) = ${n * a}\\times${par(a * x0 + b)}^{${n - 1}} = ${value}$`],
    };
  }
  if (level === 2) {
    // f(x) = ln(x² + c), f'(x) = 2x/(x² + c)
    const c = rng.int(1, 6);
    const value = F(2 * x0, x0 * x0 + c);
    return {
      prompt: `$f(x) = \\ln(x^2 + ${c})$. Calcule $f'(${x0})$.`,
      answer: numF(value),
      hint: '$(\\ln u)\' = \\frac{u\'}{u}$.',
      correction: [`$f'(x) = \\dfrac{2x}{x^2 + ${c}}$`, `$f'(${x0}) = \\dfrac{${2 * x0}}{${x0 * x0 + c}} = ${tex(value)}$`],
    };
  }
  // f(x) = e^{x² + bx} · (ax + 1) en 0 : f'(0) = b + a.
  const p = [1, b, 0];
  return {
    prompt: `$f(x) = (${affine(a, 1)})\\,e^{${poly(p)}}$. Calcule $f'(0)$.`,
    answer: num(a + b),
    hint: '$(uv)\' = u\'v + uv\'$ et $(e^w)\' = w\'e^w$.',
    correction: [`$f'(x) = ${a}e^{${poly(p)}} + (${affine(a, 1)})(${affine(2, b)})e^{${poly(p)}}$`, `$f'(0) = ${a}${plus(b)} = ${a + b}$`],
  };
});

const deriveeNieme = skill('l1-derivee-nieme', 'Calculer une dérivée n-ième', (rng, level) => {
  const n = rng.int(3, 6);
  if (level === 1) {
    const a = rng.nonZero(-3, 3);
    return {
      prompt: `$f(x) = e^{${a === 1 ? '' : a === -1 ? '-' : a}x}$. Calcule $f^{(${n})}(0)$.`,
      answer: num(a ** n),
      hint: 'Chaque dérivation multiplie par le coefficient de $x$.',
      correction: [`$f^{(n)}(x) = ${par(a)}^n e^{${a}x}$, donc $f^{(${n})}(0) = ${par(a)}^{${n}} = ${a ** n}$.`],
    };
  }
  if (level === 2) {
    // 1/(1 − x) : f^(n)(0) = n!
    const kind = rng.int(0, 1);
    if (kind === 0)
      return {
        prompt: `$f(x) = \\dfrac{1}{1 - x}$. Calcule $f^{(${n})}(0)$.`,
        answer: num(fact(n)),
        hint: 'Calcule les premières dérivées et devine la forme générale : $f^{(n)}(x) = \\frac{n!}{(1-x)^{n+1}}$.',
        correction: [`$f^{(n)}(x) = \\dfrac{n!}{(1 - x)^{n+1}}$, donc $f^{(${n})}(0) = ${n}! = ${fact(n)}$.`],
      };
    const m = n + rng.int(0, 3);
    const value = fact(m) / fact(m - n);
    return {
      prompt: `$f(x) = x^{${m}}$. Calcule $f^{(${n})}(1)$.`,
      answer: num(value),
      hint: '$(x^m)^{(n)} = m(m-1)\\cdots(m-n+1)x^{m-n}$.',
      correction: [`$f^{(${n})}(1) = \\frac{${m}!}{${m - n}!} = ${value}$`],
    };
  }
  // Leibniz : (x² e^{ax})^{(n)}(0) = n(n−1) a^{n−2}
  const a = rng.nonZero(-2, 2);
  const value = n * (n - 1) * a ** (n - 2);
  return {
    prompt: `$f(x) = x^2 e^{${a === 1 ? '' : a === -1 ? '-' : a}x}$. Calcule $f^{(${n})}(0)$.`,
    answer: num(value),
    hint: 'Formule de Leibniz : $(uv)^{(n)} = \\sum_k \\binom{n}{k} u^{(k)} v^{(n-k)}$, avec $u = x^2$.',
    correction: [`En $0$, seul le terme $k = 2$ reste : $\\binom{${n}}{2}\\times 2\\times ${par(a)}^{${n - 2}}$.`, `$f^{(${n})}(0) = ${value}$`],
  };
});

/** Couples (a, b) tels que (a² + ab + b²)/3 soit un carré : le c des accroissements finis pour x³ est rationnel. */
const CUBE_PAIRS: [number, number, number][] = [];
for (let a = -6; a <= 6; a++)
  for (let b = a + 1; b <= 7; b++) {
    const s = a * a + a * b + b * b;
    if (s % 3) continue;
    const c = Math.round(Math.sqrt(s / 3));
    if (c * c === s / 3 && c > a && c < b) CUBE_PAIRS.push([a, b, c]);
  }

const accroissementsFinis = skill('l1-accroissements-finis', 'Appliquer les accroissements finis', (rng, level) => {
  if (level < 3) {
    const p = rng.nonZero(-3, 3);
    const q = rng.int(-5, 5);
    const a = rng.int(-4, 2);
    const b = a + rng.int(1, 4);
    const fa = p * a * a + q * a;
    const fb = p * b * b + q * b;
    const c = F(a + b, 2);
    return {
      prompt: `$f(x) = ${poly([p, q, 0])}$ sur $[${a}\\,;${b}]$. Trouve le réel $c \\in\\ ]${a}\\,;${b}[$ tel que $f'(c) = \\dfrac{f(${b}) - f(${a})}{${b} - ${par(a)}}$.`,
      answer: numF(c),
      hint: 'Calcule le taux d’accroissement, puis résous $f\'(c) = $ ce taux.',
      correction: [`Taux : $\\dfrac{${fb} - ${par(fa)}}{${b - a}} = ${tex(F(fb - fa, b - a))}$`, `$f'(c) = ${2 * p}c${plus(q)} = ${tex(F(fb - fa, b - a))} \\iff c = ${tex(c)}$`],
    };
  }
  const [a, b, c] = rng.pick(CUBE_PAIRS);
  return {
    prompt: `$f(x) = x^3$ sur $[${a}\\,;${b}]$. Trouve le réel $c \\in\\ ]${a}\\,;${b}[$ tel que $f'(c) = \\dfrac{f(${b}) - f(${a})}{${b} - ${par(a)}}$.`,
    answer: num(c),
    hint: '$\\frac{b^3 - a^3}{b - a} = a^2 + ab + b^2$.',
    correction: [`$3c^2 = ${a * a + a * b + b * b}$, donc $c^2 = ${c * c}$.`, `Dans $]${a}\\,;${b}[$ : $c = ${c}$.`],
  };
});

const tangente = skill('l1-tangente', 'Trouver l’équation d’une tangente', (rng, level) => {
  const x0 = rng.int(-2, 2);
  if (level === 1) {
    const p = [rng.nonZero(-2, 2), rng.int(-3, 3), rng.int(-3, 3), rng.int(-4, 4)];
    const f = (x: number) => p.reduce((s, c) => s * x + c, 0);
    const m = 3 * p[0] * x0 * x0 + 2 * p[1] * x0 + p[2];
    const k = f(x0) - m * x0;
    return {
      prompt: `Donne la pente $m$ et l’ordonnée à l’origine $p$ de la tangente en $${x0}$ à la courbe de $f(x) = ${poly(p)}$.`,
      answer: pairOf(m, k, ['m', 'p']),
      hint: 'Tangente : $y = f\'(x_0)(x - x_0) + f(x_0)$.',
      correction: [`$f(${x0}) = ${f(x0)}$, $f'(${x0}) = ${m}$`, `$y = ${m}(x ${x0 < 0 ? '+' : '-'} ${Math.abs(x0)}) ${f(x0) < 0 ? '-' : '+'} ${Math.abs(f(x0))}$, soit $m = ${m}$ et $p = ${k}$.`],
    };
  }
  // f(x) = (ax + b)/(x + d) en x0.
  const a = rng.nonZero(-3, 3);
  const d = rng.int(-3, 3) + (rng.next() < 0.5 ? 3 : -3);
  let b = rng.int(-4, 4);
  while (a * d - b === 0) b++;
  const x1 = x0 + d === 0 ? x0 + 1 : x0;
  const fx = F(a * x1 + b, x1 + d);
  const m = F(a * d - b, (x1 + d) ** 2);
  const k = sub(fx, mul(m, F(x1)));
  return {
    prompt: `Donne la pente $m$ et l’ordonnée à l’origine $p$ de la tangente en $${x1}$ à la courbe de $f(x) = \\dfrac{${affine(a, b)}}{${affine(1, d)}}$.`,
    answer: pairOf(m, k, ['m', 'p']),
    hint: '$\\left(\\frac{u}{v}\\right)\' = \\frac{u\'v - uv\'}{v^2}$, puis $y = f\'(x_0)(x - x_0) + f(x_0)$.',
    correction: [`$f'(x) = \\dfrac{${a * d - b}}{(${affine(1, d)})^2}$, donc $m = f'(${x1}) = ${tex(m)}$ et $f(${x1}) = ${tex(fx)}$.`, `$p = f(${x1}) - ${par(x1)}\\,m = ${tex(k)}$`],
  };
});

const extremum = skill('l1-extremum-local', 'Trouver un extremum local', (rng, level) => {
  // f' = 3(x − r1)(x − r2) avec r1 + r2 pair : f(x) = x³ − (3/2)(r1 + r2)x² + 3 r1 r2 x + c.
  const r1 = rng.int(-4, 3);
  const r2 = r1 + 2 * rng.int(1, 3);
  const c = rng.int(-5, 5);
  const p = [1, (-3 * (r1 + r2)) / 2, 3 * r1 * r2, c];
  const f = (x: number) => p.reduce((s, v) => s * x + v, 0);
  const askMin = level === 1 ? true : rng.next() < 0.5;
  const askValue = level === 3;
  const x = askMin ? r2 : r1;
  return {
    prompt: askValue
      ? `$f(x) = ${poly(p)}$. Quelle est la valeur du ${askMin ? 'minimum' : 'maximum'} local de $f$ ?`
      : `$f(x) = ${poly(p)}$. En quel réel $f$ admet-elle un ${askMin ? 'minimum' : 'maximum'} local ?`,
    answer: num(askValue ? f(x) : x),
    hint: 'Annule $f\'$ et étudie son signe : un minimum local quand $f\'$ passe de $-$ à $+$.',
    correction: [`$f'(x) = 3x^2${plus(p[1] * 2)}x${plus(p[2])} = 3${r1 === 0 ? 'x' : `(x ${r1 < 0 ? '+' : '-'} ${Math.abs(r1)})`}${r2 === 0 ? 'x' : `(x ${r2 < 0 ? '+' : '-'} ${Math.abs(r2)})`}$`, `$f'$ est positive, puis négative entre $${r1}$ et $${r2}$, puis positive : maximum local en $${r1}$, minimum local en $${r2}$.`, ...(askValue ? [`$f(${x}) = ${f(x)}$`] : [])],
  };
});

export const DERIVABILITE_SKILLS: Skill[] = [deriveeComposee, tangente, extremum, deriveeNieme, accroissementsFinis];
