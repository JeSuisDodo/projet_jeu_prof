import type { Frac } from '../fraction';
import type { Skill } from '../types';
import { F, add, binom, fixedChoice, fpow, mul, num, numF, par, skill, sub, tex } from './util';

/** Probabilités de Terminale : loi binomiale, puis sommes de variables aléatoires et concentration. */

const PROBAS = [F(1, 2), F(1, 3), F(2, 3), F(1, 4), F(3, 4), F(1, 5), F(2, 5), F(3, 5), F(1, 6)];

const ptex = (p: Frac) => tex(p);
const dec = (v: number) => String(Math.round(v * 10000) / 10000).replace('.', '{,}');

/* ---------- Succession d'épreuves indépendantes, loi binomiale ---------- */

const binomiale = skill('tle-binomiale-proba', 'Calculer P(X = k) pour une loi binomiale', (rng, level) => {
  const n = rng.int(3, level === 1 ? 4 : 6);
  const k = rng.int(0, n);
  const p = rng.pick(level === 1 ? [F(1, 2), F(1, 3)] : PROBAS);
  const q = sub(F(1), p);
  const value = mul(F(binom(n, k)), mul(fpow(p, k), fpow(q, n - k)));
  return {
    prompt: `$X$ suit la loi binomiale $\\mathcal{B}\\left(${n}\\,;\\,${ptex(p)}\\right)$. Calcule $P(X = ${k})$ (en fraction).`,
    answer: numF(value),
    hint: '$P(X = k) = \\binom{n}{k}p^k(1 - p)^{n-k}$',
    correction: [
      `$P(X = ${k}) = \\binom{${n}}{${k}}\\left(${ptex(p)}\\right)^{${k}}\\left(${ptex(q)}\\right)^{${n - k}}$`,
      `$= ${binom(n, k)}\\times ${tex(fpow(p, k))}\\times ${tex(fpow(q, n - k))} = ${tex(value)}$`,
    ],
  };
});

const esperance = skill('tle-binomiale-esperance', 'Espérance et variance d’une loi binomiale', (rng, level) => {
  const p = rng.pick(PROBAS);
  const n = p.d * rng.int(2, level === 1 ? 6 : 20);
  const askVar = level > 1 && rng.next() < 0.5;
  const E = mul(F(n), p);
  const V = mul(E, sub(F(1), p));
  return {
    prompt: `$X$ suit la loi $\\mathcal{B}\\left(${n}\\,;\\,${ptex(p)}\\right)$. Calcule ${askVar ? '$V(X)$' : '$E(X)$'}.`,
    answer: numF(askVar ? V : E),
    hint: '$E(X) = np$ et $V(X) = np(1 - p)$.',
    correction: askVar
      ? [`$V(X) = ${n}\\times ${ptex(p)}\\times ${ptex(sub(F(1), p))} = ${tex(V)}$`]
      : [`$E(X) = np = ${n}\\times ${ptex(p)} = ${tex(E)}$`],
  };
});

const auMoinsUn = skill('tle-au-moins-un', 'Calculer la probabilité d’au moins un succès', (rng, level) => {
  const n = rng.int(2, level === 1 ? 3 : 5);
  const p = rng.pick(PROBAS);
  const q = sub(F(1), p);
  const value = sub(F(1), fpow(q, n));
  return {
    prompt: `On répète ${n} fois, de façon indépendante, une épreuve dont la probabilité de succès est $${ptex(p)}$. Quelle est la probabilité d’obtenir au moins un succès ?`,
    answer: numF(value),
    hint: 'L’événement contraire de « au moins un succès » est « aucun succès ».',
    correction: [`$P(\\text{aucun succès}) = \\left(${ptex(q)}\\right)^{${n}} = ${tex(fpow(q, n))}$`, `$P(\\text{au moins un}) = 1 - ${tex(fpow(q, n))} = ${tex(value)}$`],
  };
});

const reconnaitre = skill('tle-binomiale-modele', 'Reconnaître une loi binomiale', (rng) => {
  const n = rng.int(5, 20);
  const cases: { text: string; ok: boolean; why: string }[] = [
    { text: `On lance ${n} fois un dé équilibré et $X$ compte le nombre de 6.`, ok: true, why: `${n} épreuves identiques et indépendantes, succès « obtenir 6 » de probabilité $\\frac{1}{6}$ : $X \\sim \\mathcal{B}\\left(${n}\\,;\\,\\frac{1}{6}\\right)$.` },
    { text: `On tire avec remise ${n} boules dans une urne contenant 3 rouges et 7 noires ; $X$ compte les rouges.`, ok: true, why: `Tirages avec remise, donc indépendants, de probabilité $\\frac{3}{10}$ : $X \\sim \\mathcal{B}\\left(${n}\\,;\\,\\frac{3}{10}\\right)$.` },
    { text: 'On tire sans remise 5 boules dans une urne contenant 3 rouges et 7 noires ; $X$ compte les rouges.', ok: false, why: 'Sans remise, les tirages ne sont pas indépendants : ce n’est pas une loi binomiale.' },
    { text: 'On lance un dé jusqu’à obtenir un 6 ; $X$ compte le nombre de lancers.', ok: false, why: 'Le nombre d’épreuves n’est pas fixé à l’avance : ce n’est pas une loi binomiale.' },
    { text: `${n} élèves répondent au hasard à une question à 4 choix ; $X$ compte les bonnes réponses.`, ok: true, why: `${n} épreuves indépendantes de succès $\\frac{1}{4}$ : $X \\sim \\mathcal{B}\\left(${n}\\,;\\,\\frac{1}{4}\\right)$.` },
    { text: 'On lance 10 fois un dé ; $X$ est la somme des résultats.', ok: false, why: 'Une loi binomiale compte des succès ; ici $X$ additionne des valeurs de 1 à 6.' },
  ];
  const c = rng.pick(cases);
  return {
    prompt: `${c.text} $X$ suit-elle une loi binomiale ?`,
    answer: fixedChoice(['Oui', 'Non'], c.ok ? 0 : 1),
    hint: 'Il faut un nombre fixé d’épreuves de Bernoulli identiques et indépendantes, et $X$ doit compter les succès.',
    correction: [c.why],
  };
});

const intervalle = skill('tle-binomiale-cumul', 'Utiliser les probabilités cumulées', (rng) => {
  const a = rng.int(10, 40) / 100;
  const b = Math.round((a + rng.int(20, 50) / 100) * 100) / 100;
  const k = rng.int(3, 8);
  const askAtLeast = rng.next() < 0.5;
  const value = askAtLeast ? 1 - a : b - a;
  return {
    prompt: askAtLeast
      ? `$X$ suit une loi binomiale et $P(X \\leq ${k - 1}) \\approx ${dec(a)}$. Calcule $P(X \\geq ${k})$.`
      : `$X$ suit une loi binomiale, $P(X \\leq ${k}) \\approx ${dec(a)}$ et $P(X \\leq ${k + 3}) \\approx ${dec(b)}$. Calcule $P(${k + 1} \\leq X \\leq ${k + 3})$.`,
    answer: numF(F(Math.round(value * 100), 100)),
    hint: askAtLeast ? '$P(X \\geq k) = 1 - P(X \\leq k - 1)$' : '$P(a < X \\leq b) = P(X \\leq b) - P(X \\leq a)$',
    correction: [
      askAtLeast
        ? `$P(X \\geq ${k}) = 1 - P(X \\leq ${k - 1}) = 1 - ${dec(a)} = ${dec(value)}$`
        : `$P(${k + 1} \\leq X \\leq ${k + 3}) = P(X \\leq ${k + 3}) - P(X \\leq ${k}) = ${dec(b)} - ${dec(a)} = ${dec(value)}$`,
    ],
  };
});

const arbre = skill('tle-epreuves-independantes', 'Probabilité sur une succession d’épreuves', (rng) => {
  const p1 = rng.pick(PROBAS);
  const p2 = rng.pick(PROBAS);
  const both = rng.next() < 0.5;
  const value = both ? mul(p1, p2) : add(mul(p1, sub(F(1), p2)), mul(sub(F(1), p1), p2));
  return {
    prompt: `Deux épreuves indépendantes : la première réussit avec probabilité $${ptex(p1)}$, la seconde avec probabilité $${ptex(p2)}$. Quelle est la probabilité ${both ? 'que les deux réussissent' : 'qu’exactement une des deux réussisse'} ?`,
    answer: numF(value),
    hint: 'Pour des épreuves indépendantes, on multiplie les probabilités le long d’un chemin de l’arbre, et on additionne les chemins.',
    correction: both
      ? [`$${ptex(p1)}\\times ${ptex(p2)} = ${tex(value)}$`]
      : [`$${ptex(p1)}\\times ${ptex(sub(F(1), p2))} + ${ptex(sub(F(1), p1))}\\times ${ptex(p2)} = ${tex(value)}$`],
  };
});

export const BINOMIALE_SKILLS: Skill[] = [binomiale, esperance, auMoinsUn, reconnaitre, intervalle, arbre];

/* ---------- Sommes de variables aléatoires, concentration, loi des grands nombres ---------- */

const loi = skill('tle-esperance-loi', 'Calculer une espérance à partir d’une loi', (rng, level) => {
  const values = rng.shuffle([-3, -2, -1, 0, 1, 2, 4, 5, 10]).slice(0, level === 1 ? 3 : 4).sort((a, b) => a - b);
  // Probabilités en dixièmes, somme 10.
  const parts: number[] = [];
  let left = 10;
  values.forEach((_, i) => {
    const v = i === values.length - 1 ? left : rng.int(1, left - (values.length - 1 - i));
    parts.push(v);
    left -= v;
  });
  const E = F(values.reduce((s, x, i) => s + x * parts[i], 0), 10);
  const row = values.map((x, i) => `P(X = ${x}) = ${dec(parts[i] / 10)}`).join('$, $');
  return {
    prompt: `La loi de $X$ est : $${row}$. Calcule $E(X)$.`,
    answer: numF(E),
    hint: '$E(X) = \\sum x_i\\,P(X = x_i)$',
    correction: [`$E(X) = ${values.map((x, i) => `${par(x)}\\times ${dec(parts[i] / 10)}`).join(' + ')} = ${tex(E).includes('frac') ? dec(E.n / E.d) : tex(E)}$`],
  };
});

const lineaire = skill('tle-esperance-lineaire', 'Utiliser la linéarité de l’espérance', (rng, level) => {
  const EX = rng.int(-5, 9);
  const EY = rng.int(-5, 9);
  const a = rng.nonZero(-4, 5);
  const b = rng.int(-6, 6);
  const sum = level > 1 && rng.next() < 0.5;
  const value = sum ? a * EX + EY : a * EX + b;
  const expr = sum ? `${a === 1 ? '' : a === -1 ? '-' : a}X + Y` : `${a === 1 ? '' : a === -1 ? '-' : a}X${b === 0 ? '' : b < 0 ? ` - ${-b}` : ` + ${b}`}`;
  return {
    prompt: sum ? `$E(X) = ${EX}$ et $E(Y) = ${EY}$. Calcule $E(${expr})$.` : `$E(X) = ${EX}$. Calcule $E(${expr})$.`,
    answer: num(value),
    hint: '$E(aX + b) = aE(X) + b$ et $E(X + Y) = E(X) + E(Y)$.',
    correction: [sum ? `$E(${expr}) = ${a}\\times ${par(EX)} + ${par(EY)} = ${value}$` : `$E(${expr}) = ${a}\\times ${par(EX)}${b === 0 ? '' : b < 0 ? ` - ${-b}` : ` + ${b}`} = ${value}$`],
  };
});

const variance = skill('tle-variance-somme', 'Calculer une variance', (rng, level) => {
  const VX = rng.int(1, 9);
  const VY = rng.int(1, 9);
  const a = rng.nonZero(-4, 4);
  const b = rng.int(-6, 6);
  const sum = level > 1 && rng.next() < 0.5;
  const value = sum ? a * a * VX + VY : a * a * VX;
  const ax = `${a === 1 ? '' : a === -1 ? '-' : a}X`;
  return {
    prompt: sum
      ? `$X$ et $Y$ sont indépendantes, $V(X) = ${VX}$ et $V(Y) = ${VY}$. Calcule $V(${ax} + Y)$.`
      : `$V(X) = ${VX}$. Calcule $V(${ax}${b === 0 ? '' : b < 0 ? ` - ${-b}` : ` + ${b}`})$.`,
    answer: num(value),
    hint: '$V(aX + b) = a^2V(X)$ ; si $X$ et $Y$ sont indépendantes, $V(X + Y) = V(X) + V(Y)$.',
    correction: [sum ? `$V(${ax} + Y) = ${par(a)}^2\\times ${VX} + ${VY} = ${value}$` : `$${par(a)}^2\\times ${VX} = ${value}$ (la constante ne change pas la variance).`],
  };
});

const moyenne = skill('tle-moyenne-echantillon', 'Espérance et variance d’une moyenne d’échantillon', (rng) => {
  const E = rng.int(-5, 20);
  const n = rng.pick([4, 5, 10, 20, 25, 50, 100]);
  const V = rng.int(1, 10) * rng.pick([1, 2, 5]);
  const askVar = rng.next() < 0.6;
  return {
    prompt: `$X_1, \\dots, X_{${n}}$ sont indépendantes, de même loi que $X$, avec $E(X) = ${E}$ et $V(X) = ${V}$. On pose $M = \\frac{X_1 + \\dots + X_{${n}}}{${n}}$. Calcule ${askVar ? '$V(M)$' : '$E(M)$'}.`,
    answer: askVar ? numF(F(V, n)) : num(E),
    hint: '$E(M) = E(X)$ et $V(M) = \\frac{V(X)}{n}$.',
    correction: [askVar ? `$V(M) = \\frac{${V}}{${n}} = ${tex(F(V, n))}$` : `$E(M) = E(X) = ${E}$`],
  };
});

const bienayme = skill('tle-bienayme-tchebychev', 'Appliquer l’inégalité de Bienaymé-Tchebychev', (rng) => {
  const V = rng.int(1, 12);
  const delta = rng.int(2, 6);
  const bound = F(V, delta * delta);
  const E = rng.int(0, 20);
  const clipped = bound.n >= bound.d;
  return {
    prompt: `$E(X) = ${E}$ et $V(X) = ${V}$. Quel majorant de $P(|X - ${E}| \\geq ${delta})$ donne l’inégalité de Bienaymé-Tchebychev ?`,
    answer: numF(bound),
    hint: '$P(|X - E(X)| \\geq \\delta) \\leq \\frac{V(X)}{\\delta^2}$',
    correction: [`$\\frac{V(X)}{\\delta^2} = \\frac{${V}}{${delta * delta}} = ${tex(bound)}$${clipped ? ' (majorant peu utile ici, car $\\geq 1$).' : '.'}`],
  };
});

const concentration = skill('tle-concentration', 'Trouver une taille d’échantillon (concentration)', (rng) => {
  // P(|M - μ| ≥ δ) ≤ V / (n δ²) ≤ α  ⟺  n ≥ V / (α δ²)
  const V = rng.pick([1, 2, 4, 5, 9, 10]);
  const delta = rng.pick([F(1, 10), F(1, 5), F(1, 2), F(1)]);
  const alpha = rng.pick([F(1, 20), F(1, 10), F(1, 100), F(1, 4)]);
  const bound = F(V * delta.d * delta.d * alpha.d, delta.n * delta.n * alpha.n);
  const n = Math.ceil(bound.n / bound.d);
  return {
    prompt: `$V(X) = ${V}$. On veut, d’après l’inégalité de concentration, $P(|M_n - E(X)| \\geq ${tex(delta)}) \\leq ${tex(alpha)}$. Quel est le plus petit $n$ qui le garantit ?`,
    answer: num(n),
    hint: 'Inégalité de concentration : $P(|M_n - \\mu| \\geq \\delta) \\leq \\frac{V(X)}{n\\delta^2}$.',
    correction: [
      `Il suffit que $\\frac{${V}}{n\\times\\left(${tex(delta)}\\right)^2} \\leq ${tex(alpha)}$, soit $n \\geq ${tex(bound)}$.`,
      `Le plus petit entier est $n = ${n}$.`,
    ],
  };
});

export const SOMMES_VA_SKILLS: Skill[] = [loi, lineaire, variance, moyenne, bienayme, concentration];
