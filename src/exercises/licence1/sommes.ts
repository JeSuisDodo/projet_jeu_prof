import type { Skill } from '../types';
import { F, add, binom, fpow, num, numF, par, skill, sub, tex } from './util';
import { enrichir } from '../licenceVariantes';
import { SOMMES_VARIANTES } from './variantes/sommes';

/** Chapitre « Sommes, produits et binôme » (Licence 1). */

const sommesUsuelles = skill('l1-sommes-usuelles', 'Calculer une somme usuelle', (rng, level) => {
  const n = rng.int(level === 3 ? 12 : 5, level === 1 ? 30 : 20);
  const kinds = [
    { tex: 'k', value: (m: number) => (m * (m + 1)) / 2, formula: '\\frac{n(n+1)}{2}' },
    { tex: 'k^2', value: (m: number) => (m * (m + 1) * (2 * m + 1)) / 6, formula: '\\frac{n(n+1)(2n+1)}{6}' },
    { tex: 'k^3', value: (m: number) => ((m * (m + 1)) / 2) ** 2, formula: '\\left(\\frac{n(n+1)}{2}\\right)^2' },
  ];
  const k = level === 1 ? kinds[0] : rng.pick(kinds.slice(1));
  if (level === 3) {
    const p = rng.int(3, 8);
    const v = k.value(n) - k.value(p - 1);
    return {
      prompt: `Calcule $\\displaystyle\\sum_{k=${p}}^{${n}} ${k.tex}$.`,
      answer: num(v),
      hint: `$\\sum_{k=1}^{n} ${k.tex} = ${k.formula}$ : retire les premiers termes.`,
      correction: [`$\\displaystyle\\sum_{k=${p}}^{${n}} ${k.tex} = \\sum_{k=1}^{${n}} ${k.tex} - \\sum_{k=1}^{${p - 1}} ${k.tex} = ${k.value(n)} - ${k.value(p - 1)} = ${v}$`],
    };
  }
  return {
    prompt: `Calcule $\\displaystyle\\sum_{k=1}^{${n}} ${k.tex}$.`,
    answer: num(k.value(n)),
    hint: `$\\sum_{k=1}^{n} ${k.tex} = ${k.formula}$.`,
    correction: [`Avec $n = ${n}$ : $${k.value(n)}$`],
  };
});

const geometrique = skill('l1-somme-geometrique', 'Calculer une somme géométrique', (rng, level) => {
  const q = level === 1 ? F(rng.int(2, 3)) : level === 2 ? F(rng.pick([-2, -3, 2, 3])) : F(rng.pick([1, -1, 1]), rng.int(2, 3));
  const n = rng.int(3, level === 3 ? 6 : 8);
  let s = F(0);
  for (let k = 0; k <= n; k++) s = add(s, fpow(q, k));
  const qt = tex(q);
  return {
    prompt: `Calcule $\\displaystyle\\sum_{k=0}^{${n}} ${par(q)}^k$.`,
    answer: numF(s),
    hint: 'Pour $q \\neq 1$ : $\\sum_{k=0}^{n} q^k = \\frac{1 - q^{n+1}}{1 - q}$.',
    correction: [`$\\dfrac{1 - ${q.n < 0 || q.d > 1 ? `\\left(${qt}\\right)` : qt}^{${n + 1}}}{1 - ${par(q)}} = \\dfrac{${tex(sub(F(1), fpow(q, n + 1)))}}{${tex(sub(F(1), q))}} = ${tex(s)}$`],
  };
});

const binome = skill('l1-binome-newton', 'Utiliser la formule du binôme', (rng, level) => {
  const n = rng.int(3, level === 1 ? 6 : 8);
  const a = level === 1 ? 1 : rng.nonZero(-3, 3);
  const b = rng.nonZero(-3, 3);
  const k = rng.int(1, n - 1);
  const coef = binom(n, k) * a ** k * b ** (n - k);
  const ax = a === 1 ? 'x' : a === -1 ? '-x' : `${a}x`;
  return {
    prompt: `Quel est le coefficient de $x^{${k}}$ dans le développement de $(${ax} ${b < 0 ? '-' : '+'} ${Math.abs(b)})^{${n}}$ ?`,
    answer: num(coef),
    hint: '$(u + v)^n = \\sum_k \\binom{n}{k} u^k v^{n-k}$.',
    correction: [`Le terme en $x^{${k}}$ est $\\binom{${n}}{${k}} (${ax})^{${k}} \\times ${par(b)}^{${n - k}}$.`, `Coefficient : $${binom(n, k)}\\times${par(a ** k)}\\times${par(b ** (n - k))} = ${coef}$`],
  };
});

const sommeBinomiale = skill('l1-somme-binomiale', 'Calculer une somme de coefficients binomiaux', (rng, level) => {
  const n = rng.int(4, 9);
  const kinds = [
    { tex: '\\binom{n}{k}', value: 2 ** n, why: `C’est $(1 + 1)^{${n}} = 2^{${n}}$.` },
    { tex: '\\binom{n}{k} 2^k', value: 3 ** n, why: `C’est $(1 + 2)^{${n}} = 3^{${n}}$.` },
    { tex: '(-1)^k \\binom{n}{k}', value: 0, why: `C’est $(1 - 1)^{${n}} = 0$.` },
    { tex: 'k\\binom{n}{k}', value: n * 2 ** (n - 1), why: `$k\\binom{n}{k} = n\\binom{n-1}{k-1}$, donc la somme vaut $${n}\\times 2^{${n - 1}}$.` },
    { tex: '\\binom{n}{k} 3^{n-k}', value: 4 ** n, why: `C’est $(1 + 3)^{${n}} = 4^{${n}}$.` },
  ];
  const k = level === 1 ? kinds[0] : level === 2 ? rng.pick(kinds.slice(1, 3).concat(kinds[4])) : rng.pick(kinds.slice(1));
  return {
    prompt: `Calcule $\\displaystyle\\sum_{k=0}^{${n}} ${k.tex.replace(/\{n\}/g, `{${n}}`).replace(/\^\{n-k\}/, `^{${n}-k}`)}$.`,
    answer: num(k.value),
    hint: 'Reconnais la formule du binôme $(a + b)^n = \\sum_k \\binom{n}{k} a^k b^{n-k}$.',
    correction: [k.why, `Résultat : $${k.value}$`],
  };
});

const telescopique = skill('l1-somme-telescopique', 'Calculer une somme télescopique', (rng, level) => {
  const n = rng.int(4, 30);
  if (level < 3) {
    const v = F(n, n + 1);
    return {
      prompt: `Calcule $\\displaystyle\\sum_{k=1}^{${n}} \\frac{1}{k(k+1)}$.`,
      answer: numF(v),
      hint: '$\\frac{1}{k(k+1)} = \\frac{1}{k} - \\frac{1}{k+1}$ : les termes se simplifient deux à deux.',
      correction: [`La somme vaut $1 - \\frac{1}{${n + 1}} = ${tex(v)}$.`],
    };
  }
  // Σ 1/(k(k+2)) = ½ (1 + ½ − 1/(n+1) − 1/(n+2)).
  const v = sub(F(3, 4), add(F(1, 2 * (n + 1)), F(1, 2 * (n + 2))));
  return {
    prompt: `Calcule $\\displaystyle\\sum_{k=1}^{${n}} \\frac{1}{k(k+2)}$.`,
    answer: numF(v),
    hint: '$\\frac{1}{k(k+2)} = \\frac{1}{2}\\left(\\frac{1}{k} - \\frac{1}{k+2}\\right)$.',
    correction: [`Il reste $\\frac{1}{2}\\left(1 + \\frac{1}{2} - \\frac{1}{${n + 1}} - \\frac{1}{${n + 2}}\\right) = ${tex(v)}$.`],
  };
});

const doubleSomme = skill('l1-somme-double', 'Calculer une somme double', (rng, level) => {
  const n = rng.int(3, 10);
  const t = (n * (n + 1)) / 2;
  const kinds = [
    { tex: '\\sum_{1 \\leq i, j \\leq n} 1', value: n * n, why: `Il y a $${n}^2$ couples $(i, j)$.` },
    { tex: '\\sum_{1 \\leq i \\leq j \\leq n} 1', value: t, why: `Pour chaque $j$, il y a $j$ valeurs de $i$ : $\\sum_j j = ${t}$.` },
    { tex: '\\sum_{1 \\leq i, j \\leq n} ij', value: t * t, why: `La somme se factorise : $\\left(\\sum_i i\\right)\\left(\\sum_j j\\right) = ${t}^2$.` },
    { tex: '\\sum_{1 \\leq i, j \\leq n} (i + j)', value: n * n * (n + 1), why: `$\\sum_{i,j} i + \\sum_{i,j} j = 2n\\times\\frac{n(n+1)}{2} = ${n * n * (n + 1)}$.` },
    { tex: '\\sum_{1 \\leq i \\leq j \\leq n} i', value: (n * (n + 1) * (n + 2)) / 6, why: `$\\sum_j \\frac{j(j+1)}{2} = \\frac{n(n+1)(n+2)}{6} = ${(n * (n + 1) * (n + 2)) / 6}$.` },
  ];
  const k = level === 1 ? rng.pick(kinds.slice(0, 2)) : level === 2 ? rng.pick(kinds.slice(1, 4)) : rng.pick(kinds.slice(2));
  return {
    prompt: `Pour $n = ${n}$, calcule $\\displaystyle${k.tex}$.`,
    answer: num(k.value),
    hint: 'Somme d’abord sur un indice, l’autre fixé ; une somme de produits $a_i b_j$ se factorise.',
    correction: [k.why],
  };
});

export const SOMMES_SKILLS: Skill[] = enrichir([sommesUsuelles, geometrique, telescopique, binome, sommeBinomiale, doubleSomme], SOMMES_VARIANTES);
