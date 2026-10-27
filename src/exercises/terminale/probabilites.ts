import type { Frac } from '../fraction';
import type { Skill } from '../types';
import { enrich, variant } from '../variantes';
import { F, add, binom, choiceTex, div, fixedChoice, fpow, mul, num, numF, par, skill, sub, tex } from './util';

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


/* ---------- Variantes ---------- */

const VF = ['Vrai', 'Faux'];
const loiB = (n: number, p: Frac) => `\\mathcal{B}\\left(${n}\\,;\\,${ptex(p)}\\right)`;
const pk = (n: number, p: Frac, k: number) => mul(F(binom(n, k)), mul(fpow(p, k), fpow(sub(F(1), p), n - k)));
const centiemes = (c: number) => dec(c / 100);
const front = (c: number) => (c === 1 ? '' : c === -1 ? '-' : String(c));

const binomialeVariantes = [
  variant('au-plus-un', (rng) => {
    const n = rng.int(3, 6);
    const p = rng.pick(PROBAS);
    const value = add(pk(n, p, 0), pk(n, p, 1));
    return {
      prompt: `$X$ suit la loi $${loiB(n, p)}$. Calcule $P(X \\leq 1)$ (en fraction).`,
      answer: numF(value),
      hint: '$P(X \\leq 1) = P(X = 0) + P(X = 1)$.',
      correction: [`$P(X = 0) = ${tex(pk(n, p, 0))}$ et $P(X = 1) = ${tex(pk(n, p, 1))}$.`, `$P(X \\leq 1) = ${tex(value)}$`],
    };
  }),
  variant('de', (rng) => {
    const n = rng.int(2, 5);
    const k = rng.int(0, n);
    const face = rng.int(1, 6);
    const value = pk(n, F(1, 6), k);
    return {
      prompt: `On lance ${n} fois un dé équilibré. Quelle est la probabilité d’obtenir exactement ${k} fois le ${face} (en fraction) ?`,
      answer: numF(value),
      hint: `Le nombre de ${face} suit la loi binomiale de paramètres $n = ${n}$ et $p = \\frac{1}{6}$.`,
      correction: [`$\\binom{${n}}{${k}}\\left(\\frac{1}{6}\\right)^{${k}}\\left(\\frac{5}{6}\\right)^{${n - k}} = ${tex(value)}$`],
    };
  }),
];

const esperanceVariantes = [
  variant('retrouver-n', (rng) => {
    const p = rng.pick(PROBAS);
    const n = p.d * rng.int(2, 15);
    const E = mul(F(n), p);
    return {
      prompt: `$X$ suit une loi binomiale de paramètre $p = ${ptex(p)}$, et $E(X) = ${tex(E)}$. Quel est le nombre $n$ d’épreuves ?`,
      answer: num(n),
      hint: '$E(X) = np$, donc $n = \\frac{E(X)}{p}$.',
      correction: [`$n = ${tex(E)}\\div ${ptex(p)} = ${n}$`],
    };
  }),
  variant('ecart-type', (rng) => {
    const demi = rng.next() < 0.5;
    const k = rng.int(1, 5);
    const [n, p, sigma] = demi ? [4 * k * k, F(1, 2), k] : [25 * k * k, rng.pick([F(1, 5), F(4, 5)]), 2 * k];
    return {
      prompt: `$X$ suit la loi $${loiB(n, p)}$. Calcule l’écart-type $\\sigma(X)$.`,
      answer: num(sigma),
      hint: '$\\sigma(X) = \\sqrt{np(1 - p)}$.',
      correction: [`$V(X) = ${n}\\times ${ptex(p)}\\times ${ptex(sub(F(1), p))} = ${sigma * sigma}$, donc $\\sigma(X) = ${sigma}$.`],
    };
  }),
];

const auMoinsUnVariantes = [
  variant('seuil-n', (rng) => {
    const p = rng.pick([F(1, 2), F(1, 3), F(1, 4), F(1, 5), F(1, 6), F(1, 10)]);
    const [cible, ct] = rng.pick([[0.9, '0{,}9'], [0.95, '0{,}95'], [0.99, '0{,}99']] as const);
    const q = 1 - p.n / p.d;
    let n = 1;
    while (1 - q ** n < cible) n++;
    return {
      prompt: `Une épreuve réussit avec probabilité $${ptex(p)}$. Combien de fois au minimum faut-il la répéter (de façon indépendante) pour que la probabilité d’au moins un succès dépasse $${ct}$ ?`,
      answer: num(n),
      hint: 'Résous $1 - (1 - p)^n \\geq c$ avec le logarithme.',
      correction: [`$\\left(${ptex(sub(F(1), p))}\\right)^n \\leq ${dec(1 - cible)}$ donne $n \\geq \\frac{\\ln(${dec(1 - cible)})}{\\ln\\left(${ptex(sub(F(1), p))}\\right)} \\approx ${dec(Math.log(1 - cible) / Math.log(q))}$.`, `Il faut $n = ${n}$.`],
    };
  }),
  variant('au-moins-deux', (rng) => {
    const n = rng.int(3, 5);
    const p = rng.pick(PROBAS);
    const value = sub(F(1), add(pk(n, p, 0), pk(n, p, 1)));
    return {
      prompt: `On répète ${n} fois, de façon indépendante, une épreuve de probabilité de succès $${ptex(p)}$. Quelle est la probabilité d’obtenir au moins deux succès ?`,
      answer: numF(value),
      hint: 'Contraire : $0$ ou $1$ succès.',
      correction: [`$1 - P(X = 0) - P(X = 1) = 1 - ${tex(pk(n, p, 0))} - ${tex(pk(n, p, 1))} = ${tex(value)}$`],
    };
  }),
];

const reconnaitreVariantes = [
  variant('parametres', (rng) => {
    const cas = [
      () => {
        const r = rng.int(1, 6);
        const b = rng.int(2, 8);
        const k = rng.int(3, 10);
        return { text: `On tire avec remise ${k} boules dans une urne de ${r} rouges et ${b} noires ; $X$ compte les rouges.`, n: k, p: F(r, r + b) };
      },
      () => {
        const m = rng.int(3, 5);
        const k = rng.int(5, 20);
        return { text: `Un élève répond au hasard aux ${k} questions d’un QCM à ${m} choix (une seule bonne réponse) ; $X$ compte les bonnes réponses.`, n: k, p: F(1, m) };
      },
      () => {
        const k = rng.int(4, 12);
        return { text: `On lance ${k} fois un dé équilibré ; $X$ compte les résultats pairs.`, n: k, p: F(1, 2) };
      },
      () => {
        const k = rng.int(4, 12);
        const f = rng.int(1, 2);
        return { text: `On lance ${k} fois un dé équilibré ; $X$ compte les résultats supérieurs ou égaux à ${7 - f}.`, n: k, p: F(f, 6) };
      },
    ];
    const { text, n, p } = rng.pick(cas)();
    const q = sub(F(1), p);
    return {
      prompt: `${text} Quelle est la loi de $X$ ?`,
      answer: choiceTex(rng, loiB(n, p), [loiB(n, q), q.n === p.n && q.d === p.d ? loiB(n + 1, p) : loiB(p.d, F(1, n)), loiB(n, F(p.n, p.d + 1))], () => loiB(n + 1, p)),
      hint: 'Compte le nombre d’épreuves $n$, puis la probabilité $p$ du succès à chaque épreuve.',
      correction: [`$${n}$ épreuves indépendantes de probabilité de succès $${ptex(p)}$ : $X \\sim ${loiB(n, p)}$.`],
    };
  }),
  variant('vrai-faux', (rng) => {
    const n = rng.int(3, 6);
    const p = rng.pick(PROBAS);
    const q = sub(F(1), p);
    const cas: [string, Frac, Frac][] = [
      ['P(X = 0)', pk(n, p, 0), fpow(q, n)],
      ['P(X = 0)', pk(n, p, 0), fpow(p, n)],
      [`P(X = ${n})`, pk(n, p, n), fpow(p, n)],
      ['P(X \\geq 1)', sub(F(1), pk(n, p, 0)), sub(F(1), fpow(p, n))],
      ['P(X \\geq 1)', sub(F(1), pk(n, p, 0)), sub(F(1), fpow(q, n))],
      ['E(X)', mul(F(n), p), mul(F(n), p)],
      ['V(X)', mul(F(n), mul(p, q)), mul(F(n), p)],
      ['P(X = 1)', pk(n, p, 1), mul(p, fpow(q, n - 1))],
    ];
    const [lhs, vrai, annonce] = rng.pick(cas);
    const ok = vrai.n * annonce.d === annonce.n * vrai.d;
    return {
      prompt: `$X$ suit la loi $${loiB(n, p)}$. Vrai ou faux : $${lhs} = ${tex(annonce)}$.`,
      answer: fixedChoice(VF, ok ? 0 : 1),
      hint: '$P(X = k) = \\binom{n}{k}p^k(1 - p)^{n-k}$, $E(X) = np$, $V(X) = np(1 - p)$.',
      correction: [`$${lhs} = ${tex(vrai)}$ : c’est ${ok ? 'vrai' : 'faux'}.`],
    };
  }),
];

const intervalleVariantes = [
  variant('strictement-plus', (rng) => {
    const a = rng.int(10, 95);
    const k = rng.int(2, 9);
    return {
      prompt: `$X$ suit une loi binomiale et $P(X \\leq ${k}) \\approx ${centiemes(a)}$. Calcule $P(X > ${k})$.`,
      answer: numF(F(100 - a, 100)),
      hint: '$P(X > k) = 1 - P(X \\leq k)$.',
      correction: [`$P(X > ${k}) = 1 - ${centiemes(a)} = ${centiemes(100 - a)}$`],
    };
  }),
  variant('egalite', (rng) => {
    const a = rng.int(5, 60);
    const b = a + rng.int(5, 35);
    const k = rng.int(2, 9);
    return {
      prompt: `$X$ suit une loi binomiale, $P(X \\leq ${k - 1}) \\approx ${centiemes(a)}$ et $P(X \\leq ${k}) \\approx ${centiemes(b)}$. Calcule $P(X = ${k})$.`,
      answer: numF(F(b - a, 100)),
      hint: '$P(X = k) = P(X \\leq k) - P(X \\leq k - 1)$.',
      correction: [`$P(X = ${k}) = ${centiemes(b)} - ${centiemes(a)} = ${centiemes(b - a)}$`],
    };
  }),
];

const arbreVariantes = [
  variant('aucune', (rng) => {
    const p1 = rng.pick(PROBAS);
    const p2 = rng.pick(PROBAS);
    const value = mul(sub(F(1), p1), sub(F(1), p2));
    return {
      prompt: `Deux épreuves indépendantes réussissent avec les probabilités $${ptex(p1)}$ et $${ptex(p2)}$. Quelle est la probabilité qu’aucune des deux ne réussisse ?`,
      answer: numF(value),
      hint: 'Multiplie les probabilités d’échec.',
      correction: [`$${ptex(sub(F(1), p1))}\\times ${ptex(sub(F(1), p2))} = ${tex(value)}$`],
    };
  }),
  variant('trois-epreuves', (rng) => {
    const p = rng.pick(PROBAS);
    const k = rng.int(1, 2);
    const value = pk(3, p, k);
    return {
      prompt: `On répète trois fois, de façon indépendante, une épreuve de probabilité de succès $${ptex(p)}$. Quelle est la probabilité d’obtenir exactement ${k === 1 ? 'un succès' : 'deux succès'} ?`,
      answer: numF(value),
      hint: 'Dessine l’arbre : compte les chemins favorables, ils ont tous la même probabilité.',
      correction: [`$3$ chemins de probabilité $${tex(mul(fpow(p, k), fpow(sub(F(1), p), 3 - k)))}$ : $${tex(value)}$.`],
    };
  }),
];

const loiVariantes = [
  variant('jeu', (rng) => {
    const mise = rng.int(1, 5);
    const gain = rng.int(2, 12);
    const faces = rng.int(1, 3);
    // Gain net : gain - mise avec probabilité faces/6, sinon -mise.
    const E = sub(F(gain * faces, 6), F(mise));
    const signe = E.n > 0 ? 0 : E.n < 0 ? 1 : 2;
    return {
      prompt: `On mise ${mise} € pour lancer un dé équilibré ; on reçoit ${gain} € si le résultat est ${faces === 1 ? 'un 6' : `au moins ${7 - faces}`}, rien sinon. Le jeu est-il favorable au joueur ?`,
      answer: fixedChoice(['Favorable', 'Défavorable', 'Équitable'], signe),
      hint: 'Calcule l’espérance du gain net (gain reçu moins la mise).',
      correction: [`$E(G) = ${gain}\\times\\frac{${faces}}{6} - ${mise} = ${tex(E)}$ : jeu ${['favorable', 'défavorable', 'équitable'][signe]}.`],
    };
  }),
  variant('probabilite-manquante', (rng) => {
    const values = rng.shuffle([-2, -1, 0, 1, 2, 3, 5]).slice(0, 3).sort((a, b) => a - b);
    const p1 = rng.int(1, 6);
    const p2 = rng.int(1, 9 - p1);
    const p3 = 10 - p1 - p2;
    const i = rng.int(0, 2);
    const ps = [p1, p2, p3];
    const row = values.map((x, j) => `P(X = ${x}) = ${j === i ? 'p' : dec(ps[j] / 10)}`).join('$, $');
    return {
      prompt: `La loi de $X$ est : $${row}$. Calcule $p$.`,
      answer: numF(F(ps[i], 10)),
      hint: 'La somme des probabilités vaut $1$.',
      correction: [`$p = 1 - ${ps.filter((_, j) => j !== i).map((v) => dec(v / 10)).join(' - ')} = ${dec(ps[i] / 10)}$`],
    };
  }),
];

const lineaireVariantes = [
  variant('retrouver-b', (rng) => {
    const EX = rng.int(-5, 9);
    const a = rng.nonZero(-4, 5);
    const b = rng.int(-9, 9);
    return {
      prompt: `$E(X) = ${EX}$ et $E(${front(a)}X + b) = ${a * EX + b}$. Calcule $b$.`,
      answer: num(b),
      hint: '$E(aX + b) = aE(X) + b$.',
      correction: [`$${a}\\times ${par(EX)} + b = ${a * EX + b}$, donc $b = ${b}$.`],
    };
  }),
  variant('difference', (rng) => {
    const EX = rng.int(-5, 9);
    const EY = rng.int(-5, 9);
    const a = rng.int(1, 4);
    const b = rng.int(1, 4);
    const value = a * EX - b * EY;
    return {
      prompt: `$E(X) = ${EX}$ et $E(Y) = ${EY}$. Calcule $E(${front(a)}X - ${front(b)}Y)$.`,
      answer: num(value),
      hint: 'L’espérance est linéaire, même pour une différence.',
      correction: [`$${a}\\times ${par(EX)} - ${b}\\times ${par(EY)} = ${value}$`],
    };
  }),
];

const varianceVariantes = [
  variant('ecart-type', (rng) => {
    const s = rng.int(1, 9);
    const a = rng.nonZero(-5, 5);
    const b = rng.int(-6, 6);
    return {
      prompt: `$\\sigma(X) = ${s}$. Calcule $\\sigma(${front(a)}X${b === 0 ? '' : b < 0 ? ` - ${-b}` : ` + ${b}`})$.`,
      answer: num(Math.abs(a) * s),
      hint: '$\\sigma(aX + b) = |a|\\,\\sigma(X)$ : un écart-type est toujours positif.',
      correction: [`$\\sigma = |${a}|\\times ${s} = ${Math.abs(a) * s}$`],
    };
  }),
  variant('difference', (rng) => {
    const VX = rng.int(1, 9);
    const VY = rng.int(1, 9);
    return {
      prompt: `$X$ et $Y$ sont indépendantes, $V(X) = ${VX}$ et $V(Y) = ${VY}$. Calcule $V(X - Y)$.`,
      answer: num(VX + VY),
      hint: '$V(X - Y) = V(X) + (-1)^2V(Y)$ : les variances s’ajoutent.',
      correction: [`$V(X - Y) = ${VX} + ${VY} = ${VX + VY}$ (et non $${VX - VY}$).`],
    };
  }),
];

const moyenneVariantes = [
  variant('somme', (rng) => {
    const E = rng.int(-5, 20);
    const V = rng.int(1, 10);
    const n = rng.pick([5, 10, 20, 50, 100]);
    const askVar = rng.next() < 0.5;
    return {
      prompt: `$X_1, \\dots, X_{${n}}$ sont indépendantes, de même loi que $X$, avec $E(X) = ${E}$ et $V(X) = ${V}$. On pose $S = X_1 + \\dots + X_{${n}}$. Calcule ${askVar ? '$V(S)$' : '$E(S)$'}.`,
      answer: num(askVar ? n * V : n * E),
      hint: '$E(S) = nE(X)$ et, par indépendance, $V(S) = nV(X)$.',
      correction: [askVar ? `$V(S) = ${n}\\times ${V} = ${n * V}$` : `$E(S) = ${n}\\times ${par(E)} = ${n * E}$`],
    };
  }),
  variant('ecart-type', (rng) => {
    const s = rng.int(1, 12);
    const r = rng.int(2, 10);
    const n = r * r;
    const value = F(s, r);
    return {
      prompt: `$X_1, \\dots, X_{${n}}$ sont indépendantes, de même loi que $X$, avec $\\sigma(X) = ${s}$. Calcule l’écart-type de la moyenne $M = \\frac{X_1 + \\dots + X_{${n}}}{${n}}$ (fraction).`,
      answer: numF(value),
      hint: '$\\sigma(M) = \\frac{\\sigma(X)}{\\sqrt{n}}$.',
      correction: [`$\\sigma(M) = \\frac{${s}}{\\sqrt{${n}}} = ${tex(value)}$`],
    };
  }),
];

const bienaymeVariantes = [
  variant('minorant', (rng) => {
    const delta = rng.int(3, 8);
    const V = rng.int(1, delta * delta - 1);
    const E = rng.int(0, 20);
    const value = sub(F(1), F(V, delta * delta));
    return {
      prompt: `$E(X) = ${E}$ et $V(X) = ${V}$. Quel minorant de $P(${E - delta} < X < ${E + delta})$ donne l’inégalité de Bienaymé-Tchebychev ?`,
      answer: numF(value),
      hint: `$${E - delta} < X < ${E + delta} \\iff |X - ${E}| < ${delta}$ : passe à l’événement contraire.`,
      correction: [`$P(|X - ${E}| \\geq ${delta}) \\leq \\frac{${V}}{${delta * delta}}$, donc $P(|X - ${E}| < ${delta}) \\geq 1 - \\frac{${V}}{${delta * delta}} = ${tex(value)}$.`],
    };
  }),
  variant('ecart', (rng) => {
    const s = rng.int(1, 5);
    const k = rng.int(2, 5);
    const E = rng.int(0, 20);
    const value = F(1, k * k);
    return {
      prompt: `$E(X) = ${E}$ et $\\sigma(X) = ${s}$. Quel majorant de $P(|X - ${E}| \\geq ${k * s})$ donne l’inégalité de Bienaymé-Tchebychev (fraction) ?`,
      answer: numF(value),
      hint: 'Ici $\\delta = k\\sigma$ : le majorant vaut $\\frac{\\sigma^2}{(k\\sigma)^2} = \\frac{1}{k^2}$.',
      correction: [`$\\frac{V(X)}{\\delta^2} = \\frac{${s * s}}{${(k * s) ** 2}} = ${tex(value)}$`],
    };
  }),
];

const concentrationVariantes = [
  variant('majorant', (rng) => {
    const V = rng.pick([1, 2, 4, 5, 9, 10]);
    const n = rng.pick([10, 50, 100, 200, 400, 1000]);
    const delta = rng.pick([F(1, 10), F(1, 5), F(1, 2), F(1)]);
    const value = div(F(V), mul(F(n), mul(delta, delta)));
    return {
      prompt: `$V(X) = ${V}$ et $M_n$ est la moyenne d’un échantillon de taille $n = ${n}$. Quel majorant de $P(|M_n - E(X)| \\geq ${tex(delta)})$ donne l’inégalité de concentration (fraction) ?`,
      answer: numF(value),
      hint: '$P(|M_n - \\mu| \\geq \\delta) \\leq \\frac{V(X)}{n\\delta^2}$.',
      correction: [`$\\frac{${V}}{${n}\\times\\left(${tex(delta)}\\right)^2} = ${tex(value)}$`],
    };
  }),
  variant('frequence', (rng) => {
    // Pour une variable de Bernoulli, V(X) = p(1 - p) ≤ 1/4.
    const delta = rng.pick([F(1, 10), F(1, 20), F(1, 5)]);
    const alpha = rng.pick([F(1, 20), F(1, 10), F(1, 4)]);
    const bound = div(F(1, 4), mul(alpha, mul(delta, delta)));
    const n = Math.ceil(bound.n / bound.d);
    return {
      prompt: `On estime une proportion inconnue $p$ par la fréquence $F_n$ observée sur $n$ tirages indépendants. Sachant que $p(1 - p) \\leq \\frac{1}{4}$, quel est le plus petit $n$ qui garantit, par l’inégalité de concentration, $P(|F_n - p| \\geq ${tex(delta)}) \\leq ${tex(alpha)}$ ?`,
      answer: num(n),
      hint: 'Majore $V$ par $\\frac{1}{4}$ dans $\\frac{V}{n\\delta^2} \\leq \\alpha$.',
      correction: [`Il suffit que $\\frac{1}{4n\\left(${tex(delta)}\\right)^2} \\leq ${tex(alpha)}$, soit $n \\geq ${tex(bound)}$.`, `Le plus petit entier est $n = ${n}$.`],
    };
  }),
];

export const BINOMIALE_SKILLS: Skill[] = [
  enrich(binomiale, binomialeVariantes),
  enrich(esperance, esperanceVariantes),
  enrich(auMoinsUn, auMoinsUnVariantes),
  enrich(reconnaitre, reconnaitreVariantes),
  enrich(intervalle, intervalleVariantes),
  enrich(arbre, arbreVariantes),
];

export const SOMMES_VA_SKILLS: Skill[] = [
  enrich(loi, loiVariantes),
  enrich(lineaire, lineaireVariantes),
  enrich(variance, varianceVariantes),
  enrich(moyenne, moyenneVariantes),
  enrich(bienayme, bienaymeVariantes),
  enrich(concentration, concentrationVariantes),
];
