import type { Rng } from '../rng';
import type { Skill } from '../types';
import { F, affine, fact, fixedChoice, num, numF, par, plus, setOf, setTex, skill, tex } from './util';
import { enrichir } from '../licenceVariantes';
import { APPLICATIONS_VARIANTES } from './variantes/applications';

/** Chapitre « Applications » (Licence 1). */

const KINDS = ['Injective, pas surjective', 'Surjective, pas injective', 'Bijective', 'Ni injective, ni surjective'];
const kindIndex = (inj: boolean, surj: boolean) => (inj && surj ? 2 : inj ? 0 : surj ? 1 : 3);

const known: [string, boolean, boolean, string][] = [
  ['f : \\mathbb{R} \\to \\mathbb{R},\\ x \\mapsto x^2', false, false, '$f(-1) = f(1)$ et $-1$ n’a pas d’antécédent.'],
  ['f : \\mathbb{R}_+ \\to \\mathbb{R}_+,\\ x \\mapsto x^2', true, true, 'Sur $\\mathbb{R}_+$, la racine carrée est la réciproque.'],
  ['f : \\mathbb{R} \\to \\mathbb{R}_+,\\ x \\mapsto x^2', false, true, 'Tout $y \\geq 0$ vaut $(\\sqrt{y})^2$, mais $f(-1) = f(1)$.'],
  ['f : \\mathbb{R}_+ \\to \\mathbb{R},\\ x \\mapsto x^2', true, false, 'Strictement croissante sur $\\mathbb{R}_+$, mais $-1$ n’a pas d’antécédent.'],
  ['f : \\mathbb{R} \\to \\mathbb{R},\\ x \\mapsto e^x', true, false, 'Strictement croissante, mais à valeurs dans $]0\\,;+\\infty[$.'],
  ['f : \\mathbb{R} \\to ]0\\,;+\\infty[,\\ x \\mapsto e^x', true, true, 'Sa réciproque est $\\ln$.'],
  ['f : \\mathbb{R} \\to \\mathbb{R},\\ x \\mapsto x^3', true, true, 'Strictement croissante, de limites $\\mp\\infty$ : bijective (réciproque $\\sqrt[3]{\\cdot}$).'],
  ['f : \\mathbb{R} \\to [-1\\,;1],\\ x \\mapsto \\sin x', false, true, 'Toute valeur de $[-1\\,;1]$ est atteinte, mais $\\sin 0 = \\sin \\pi$.'],
  ['f : \\mathbb{N} \\to \\mathbb{N},\\ n \\mapsto 2n', true, false, 'Deux entiers distincts ont des doubles distincts, mais $1$ n’est pas pair.'],
  ['f : \\mathbb{N} \\to \\mathbb{N},\\ n \\mapsto \\lfloor n/2 \\rfloor', false, true, '$f(0) = f(1) = 0$, et $f(2m) = m$ pour tout $m$.'],
  ['f : \\mathbb{Z} \\to \\mathbb{Z},\\ n \\mapsto n + 1', true, true, 'Sa réciproque est $n \\mapsto n - 1$.'],
  ['f : \\mathbb{N} \\to \\mathbb{N},\\ n \\mapsto n + 1', true, false, '$0$ n’a pas d’antécédent dans $\\mathbb{N}$.'],
  ['f : \\mathbb{R}^2 \\to \\mathbb{R},\\ (x, y) \\mapsto x + y', false, true, '$f(1, 0) = f(0, 1)$, et $f(t, 0) = t$.'],
  ['f : \\mathbb{R} \\to \\mathbb{R}^2,\\ x \\mapsto (x, 2x)', true, false, 'La première coordonnée retrouve $x$, mais $(0, 1)$ n’est pas atteint.'],
];

function finiteMap(rng: Rng) {
  const n = rng.int(3, 4);
  const m = rng.int(3, 4);
  const values = Array.from({ length: n }, () => rng.int(1, m));
  const inj = new Set(values).size === n;
  const surj = new Set(values).size === m;
  return { n, m, values, inj, surj };
}

const injSurj = skill('l1-injective-surjective', 'Reconnaître une injection, une surjection', (rng, level) => {
  if (level === 1) {
    const { n, m, values, inj, surj } = finiteMap(rng);
    const letters = 'abcd';
    const table = values.map((v, i) => `f(${i + 1}) = ${letters[v - 1]}`).join(',\\ ');
    return {
      prompt: `$f : \\{1, \\dots, ${n}\\} \\to \\{${letters.slice(0, m).split('').join(', ')}\\}$ est définie par $${table}$. L’application $f$ est :`,
      answer: fixedChoice(KINDS, kindIndex(inj, surj)),
      hint: 'Injective : deux éléments n’ont jamais la même image. Surjective : chaque élément d’arrivée est atteint.',
      correction: [
        inj ? 'Les images sont toutes distinctes : $f$ est injective.' : 'Deux éléments ont la même image : $f$ n’est pas injective.',
        surj ? 'Chaque élément d’arrivée est atteint : $f$ est surjective.' : 'Un élément d’arrivée n’est pas atteint : $f$ n’est pas surjective.',
      ],
    };
  }
  const [f, inj, surj, why] = rng.pick(level === 2 ? known.slice(0, 8) : known.slice(4));
  return {
    prompt: `L’application $${f}$ est :`,
    answer: fixedChoice(KINDS, kindIndex(inj, surj)),
    hint: 'Pense à l’ensemble de départ et à l’ensemble d’arrivée : la même formule peut changer de nature.',
    correction: [why, `Elle est donc : ${KINDS[kindIndex(inj, surj)].toLowerCase()}.`],
  };
});

const imageDirecte = skill('l1-image-directe', 'Calculer une image directe ou réciproque', (rng, level) => {
  const a = rng.int(-3, -1);
  const b = rng.int(1, 3);
  const A = Array.from({ length: b - a + 1 }, (_, i) => a + i);
  const square = (x: number) => x * x;
  if (level === 1) {
    const image = [...new Set(A.map(square))];
    return {
      prompt: `$f : \\mathbb{Z} \\to \\mathbb{Z},\\ x \\mapsto x^2$. Donne les éléments de $f(A)$ pour $A = ${setTex(A)}$.`,
      answer: setOf(image),
      hint: '$f(A) = \\{f(x) \\mid x \\in A\\}$ : on calcule l’image de chaque élément, sans répéter les doublons.',
      correction: [`$f(A) = ${setTex(image)}$`],
    };
  }
  const c = rng.int(-2, 2);
  const g = (x: number) => x * x + c;
  const B = [rng.int(-3, 2) + c, c + 1, c + 4, c + 9, c + rng.pick([2, 3, 5])].filter((v, i, t) => t.indexOf(v) === i);
  const domain = Array.from({ length: 9 }, (_, i) => i - 4);
  const pre = domain.filter((x) => B.includes(g(x)));
  return {
    prompt: `$g : \\{-4, \\dots, 4\\} \\to \\mathbb{Z},\\ x \\mapsto x^2${plus(c)}$. Donne les éléments de l’image réciproque $g^{-1}(B)$ pour $B = ${setTex(B)}$.`,
    answer: setOf(pre),
    hint: '$g^{-1}(B) = \\{x \\mid g(x) \\in B\\}$ : on cherche tous les antécédents des éléments de $B$.',
    correction: [`On résout $x^2${plus(c)} = b$ pour chaque $b \\in B$, avec $-4 \\leq x \\leq 4$.`, `$g^{-1}(B) = ${setTex(pre)}$`],
  };
});

const composition = skill('l1-composition', 'Composer des applications', (rng, level) => {
  const a = rng.nonZero(-3, 3);
  const b = rng.int(-4, 4);
  const c = rng.nonZero(-3, 3);
  const d = rng.int(-4, 4);
  const x0 = rng.int(-3, 3);
  const f = (x: number) => a * x + b;
  if (level === 1) {
    const g = (x: number) => c * x + d;
    return {
      prompt: `$f(x) = ${affine(a, b)}$ et $g(x) = ${affine(c, d)}$. Calcule $(g \\circ f)(${x0})$.`,
      answer: num(g(f(x0))),
      hint: '$(g \\circ f)(x) = g(f(x))$ : on applique d’abord $f$.',
      correction: [`$f(${x0}) = ${f(x0)}$`, `$g(${f(x0)}) = ${g(f(x0))}$`],
    };
  }
  const g = (x: number) => x * x + d;
  if (level === 2)
    return {
      prompt: `$f(x) = ${affine(a, b)}$ et $g(x) = x^2${plus(d)}$. Calcule $(f \\circ g)(${x0}) - (g \\circ f)(${x0})$.`,
      answer: num(f(g(x0)) - g(f(x0))),
      hint: 'En général $f \\circ g \\neq g \\circ f$ : calcule les deux séparément.',
      correction: [`$(f\\circ g)(${x0}) = f(${g(x0)}) = ${f(g(x0))}$`, `$(g\\circ f)(${x0}) = g(${f(x0)}) = ${g(f(x0))}$`, `Différence : $${f(g(x0)) - g(f(x0))}$`],
    };
  // (g∘f)(x) = (ax + b)² + d : coefficient de x.
  return {
    prompt: `$f(x) = ${affine(a, b)}$ et $g(x) = x^2${plus(d)}$. On développe $(g \\circ f)(x) = \\alpha x^2 + \\beta x + \\gamma$. Que vaut $\\beta$ ?`,
    answer: num(2 * a * b),
    hint: '$(g\\circ f)(x) = (f(x))^2 + d$, puis identité remarquable.',
    correction: [`$(g\\circ f)(x) = (${affine(a, b)})^2${plus(d)} = ${a * a}x^2${plus(2 * a * b)}x${plus(b * b + d)}$`, `$\\beta = ${2 * a * b}$`],
  };
});

const reciproque = skill('l1-reciproque', 'Calculer avec une bijection réciproque', (rng, level) => {
  if (level === 1) {
    const a = rng.nonZero(-5, 5);
    const b = rng.int(-6, 6);
    const y = rng.int(-8, 8);
    return {
      prompt: `$f : \\mathbb{R} \\to \\mathbb{R},\\ x \\mapsto ${affine(a, b)}$ est bijective. Calcule $f^{-1}(${y})$.`,
      answer: numF(F(y - b, a)),
      hint: 'On résout $f(x) = y$ en $x$.',
      correction: [`$${affine(a, b)} = ${y} \\iff x = \\frac{${y}${plus(-b)}}{${a}} = ${tex(F(y - b, a))}$`],
    };
  }
  // f(x) = (ax + b)/(cx + d), f⁻¹(y) = (dy - b)/(a - cy).
  let a: number, b: number, c: number, d: number;
  do {
    [a, b, c, d] = [rng.nonZero(-4, 4), rng.int(-4, 4), rng.nonZero(-3, 3), rng.int(-4, 4)];
  } while (a * d - b * c === 0);
  let y = rng.int(-4, 4);
  while (a - c * y === 0) y++;
  const value = F(d * y - b, a - c * y);
  return {
    prompt: `$f(x) = \\dfrac{${affine(a, b)}}{${affine(c, d)}}$ réalise une bijection de $\\mathbb{R}\\setminus\\{${tex(F(-d, c))}\\}$ sur $\\mathbb{R}\\setminus\\{${tex(F(a, c))}\\}$. Calcule $f^{-1}(${y})$.`,
    answer: numF(value),
    hint: 'Résous $\\frac{ax+b}{cx+d} = y$ : $ax + b = y(cx + d)$.',
    correction: [`$${affine(a, b)} = ${par(y)}(${affine(c, d)}) \\iff ${a - c * y === 1 ? '' : a - c * y === -1 ? '-' : a - c * y}x = ${d * y - b}$`, `$f^{-1}(${y}) = ${tex(value)}$`],
  };
});

const compterApplications = skill('l1-compter-applications', 'Compter des applications', (rng, level) => {
  const n = rng.int(2, 4);
  const p = n + rng.int(level === 3 ? 0 : 1, 3);
  const kinds = [
    { what: 'applications', value: p ** n, why: `Chaque élément de départ a $${p}$ images possibles : $${p}^{${n}}$.` },
    { what: 'injections', value: fact(p) / fact(p - n), why: `$${p}\\times${p - 1}${n > 2 ? '\\times\\dots' : ''}$ : $\\frac{${p}!}{${p - n}!}$.` },
    { what: 'bijections', value: fact(n), why: `$${n}!$ façons de permuter.` },
  ];
  const k = level === 1 ? kinds[0] : level === 2 ? kinds[1] : rng.pick(kinds);
  const same = k.what === 'bijections';
  return {
    prompt: same
      ? `Combien y a-t-il de bijections d’un ensemble à $${n}$ éléments dans lui-même ?`
      : `Combien y a-t-il d’${k.what} d’un ensemble à $${n}$ éléments dans un ensemble à $${p}$ éléments ?`,
    answer: num(k.value),
    hint: 'Applications : $p^n$. Injections : $\\frac{p!}{(p-n)!}$. Bijections d’un ensemble à $n$ éléments : $n!$.',
    correction: [k.why, `Réponse : $${k.value}$`],
  };
});

export const APPLICATIONS_SKILLS: Skill[] = enrichir([imageDirecte, composition, injSurj, reciproque, compterApplications], APPLICATIONS_VARIANTES);
