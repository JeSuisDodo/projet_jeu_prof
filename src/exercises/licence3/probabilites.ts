import type { Skill } from '../types';
import { F, choiceTex, div, fixedChoice, fracSteps, num, numF, skill, tex } from './util';

/** Chapitre « Probabilités » (Licence 3) : convergences, théorèmes limites, inégalités, conditionnement. */

/** « - m » ou « + |m| » après la variable centrée. */
const centre = (m: number) => (m === 0 ? '' : m < 0 ? ` + ${-m}` : ` - ${m}`);

const tcl = skill('l3-tcl', 'Appliquer le théorème central limite', (rng, level) => {
  const n = rng.pick([25, 50, 100, 200, 400]);
  const m = rng.int(-3, 6);
  const v = rng.int(1, 9);
  if (level === 3) {
    const value = F(v, n);
    return {
      prompt: `$X_1, \\dots, X_{${n}}$ sont indépendantes, de même loi, d’espérance $${m}$ et de variance $${v}$. D’après le TCL, $\\overline{X}_{${n}}$ suit approximativement $\\mathcal{N}(\\mu, s^2)$. Donne $s^2$.`,
      answer: numF(value),
      hint: '$V(\\overline{X}_n) = \\frac{\\sigma^2}{n}$.',
      correction: [`$s^2 = ${fracSteps(v, n)}$`],
    };
  }
  const askMean = level === 1;
  return {
    prompt: `$X_1, \\dots, X_{${n}}$ sont indépendantes, de même loi, d’espérance $${m}$ et de variance $${v}$. D’après le TCL, $S = X_1 + \\dots + X_{${n}}$ suit approximativement $\\mathcal{N}(\\mu, s^2)$. Donne $${askMean ? '\\mu' : 's^2'}$.`,
    answer: num(askMean ? n * m : n * v),
    hint: 'Pour une somme de variables indépendantes, les espérances et les variances s’ajoutent.',
    correction: [askMean ? `$\\mu = ${n}\\times ${m < 0 ? `(${m})` : m} = ${n * m}$` : `$s^2 = ${n}\\times ${v} = ${n * v}$`],
  };
});

const bienayme = skill('l3-bienayme-tchebychev', 'Majorer avec Bienaymé-Tchebychev', (rng, level) => {
  const v = rng.int(1, 9);
  const a = rng.int(2, 6);
  const m = rng.int(-5, 10);
  if (level === 3) {
    const n = rng.pick([10, 20, 50, 100]);
    const value = F(v, n * a * a);
    return {
      prompt: `$X_1, \\dots, X_{${n}}$ sont indépendantes, de même loi, d’espérance $${m}$ et de variance $${v}$. Quelle majoration de $P\\left(\\left|\\overline{X}_{${n}}${centre(m)}\\right| \\geq ${a}\\right)$ donne Bienaymé-Tchebychev ?`,
      answer: numF(value),
      hint: '$P(|Y - E(Y)| \\geq a) \\leq \\frac{V(Y)}{a^2}$ avec $V(\\overline{X}_n) = \\frac{\\sigma^2}{n}$.',
      correction: [`$V(\\overline{X}_{${n}}) = \\frac{${v}}{${n}}$`, `Majoration : $\\frac{${v}}{${n}\\times ${a * a}} = ${tex(value)}$`],
    };
  }
  const value = F(v, a * a);
  return {
    prompt: `$X$ a pour espérance $${m}$ et pour variance $${v}$. Quelle majoration de $P(|X${centre(m)}| \\geq ${a})$ donne l’inégalité de Bienaymé-Tchebychev ?`,
    answer: numF(value),
    hint: '$P(|X - E(X)| \\geq a) \\leq \\frac{V(X)}{a^2}$.',
    correction: [`$\\frac{${v}}{${a}^2} = ${fracSteps(v, a * a)}$`],
  };
});

const CONVERGENCES: [string, number, string, number][] = [
  ['La convergence presque sûre implique la convergence en probabilité.', 0, 'C’est une conséquence du théorème de convergence dominée.', 1],
  ['La convergence en probabilité implique la convergence en loi.', 0, 'Résultat du cours.', 1],
  ['La convergence en loi implique la convergence en probabilité.', 1, 'Faux en général : $X_n = -X$ avec $X$ de loi $\\mathcal{N}(0, 1)$ converge en loi vers $X$ mais pas en probabilité. (Vrai si la limite est constante.)', 1],
  ['La convergence dans $L^2$ implique la convergence en probabilité.', 0, 'Inégalité de Markov appliquée à $|X_n - X|^2$.', 2],
  ['La convergence en probabilité implique la convergence presque sûre.', 1, 'Faux : la « bosse glissante » converge en probabilité mais en aucun point. Vrai seulement pour une sous-suite.', 2],
  ['La convergence presque sûre implique la convergence dans $L^1$.', 1, 'Faux sans domination : $X_n = n\\mathbf{1}_{[0, 1/n]}$ sur $[0, 1]$ tend vers $0$ p.s. mais $E(X_n) = 1$.', 3],
  ['La convergence dans $L^2$ implique la convergence dans $L^1$.', 0, 'Cauchy-Schwarz : $E|X_n - X| \\leq \\sqrt{E|X_n - X|^2}$.', 3],
  ['La convergence en loi vers une constante implique la convergence en probabilité.', 0, 'Résultat du cours (la fonction de répartition limite saute en un seul point).', 3],
];

const convergences = skill('l3-modes-convergence', 'Comparer les modes de convergence', (rng, level) => {
  const [claim, truth, why] = rng.pick(CONVERGENCES.filter(([, , , l]) => l <= level));
  return {
    prompt: `Vrai ou faux ? ${claim}`,
    answer: fixedChoice(['Vrai', 'Faux'], truth),
    hint: 'Hiérarchie : p.s. ⇒ proba ⇒ loi, et $L^2$ ⇒ $L^1$ ⇒ proba ; les réciproques sont fausses en général.',
    correction: [why],
  };
});

const caracteristique = skill('l3-fonction-caracteristique', 'Exploiter une fonction caractéristique', (rng, level) => {
  const lambda = rng.int(1, 6);
  const n = rng.int(2, 9);
  const p = F(1, rng.int(2, 5));
  const mu = rng.int(-4, 4);
  const s2 = rng.int(1, 9);
  const laws: [string, string, string, number, string][] = [
    [`e^{${lambda}(e^{it} - 1)}`, `\\mathcal{P}(${lambda})`, 'E(X)', lambda, 'Pour la loi de Poisson, $E(X) = \\lambda$.'],
    [`\\left(1 - ${tex(p)} + ${tex(p)}e^{it}\\right)^{${n}}`, `\\mathcal{B}\\left(${n}, ${tex(p)}\\right)`, 'E(X)', 0, 'Pour la loi binomiale, $E(X) = np$.'],
    [`e^{${mu === 0 ? '-' : `${mu === 1 ? '' : mu === -1 ? '-' : mu}it - `}\\frac{${s2 === 1 ? '' : s2}t^2}{2}}`, `\\mathcal{N}(${mu}, ${s2})`, 'V(X)', s2, 'Pour la loi normale $\\mathcal{N}(\\mu, \\sigma^2)$, $\\varphi(t) = e^{i\\mu t - \\sigma^2t^2/2}$.'],
    [`\\frac{${lambda}}{${lambda} - it}`, `\\mathcal{E}(${lambda})`, 'E(X)', 0, 'Pour la loi exponentielle, $E(X) = \\frac{1}{\\lambda}$.'],
  ];
  const i = rng.int(0, laws.length - 1);
  const [phi, law, , , why] = laws[i];
  if (level < 3) {
    return {
      prompt: `$X$ a pour fonction caractéristique $\\varphi_X(t) = ${phi}$. Quelle est sa loi ?`,
      answer: choiceTex(
        rng,
        law,
        laws.filter((_, j) => j !== i).map(([, l]) => l),
        () => `\\mathcal{U}([0, ${lambda}])`,
      ),
      hint: 'La fonction caractéristique caractérise la loi : compare aux fonctions caractéristiques des lois usuelles.',
      correction: [why, `$X$ suit la loi $${law}$.`],
    };
  }
  const values: [string, ReturnType<typeof F>, string][] = [
    ['E(X)', F(lambda), `$\\varphi'(0) = i\\lambda$, donc $E(X) = ${lambda}$.`],
    ['E(X)', F(n * p.n, p.d), `$E(X) = \\frac{\\varphi'(0)}{i} = np = ${tex(F(n * p.n, p.d))}$.`],
    ['V(X)', F(s2), `$X \\sim \\mathcal{N}(${mu}, ${s2})$, donc $V(X) = ${s2}$.`],
    ['E(X)', div(F(1), F(lambda)), `$\\varphi'(0) = \\frac{i}{\\lambda}$, donc $E(X) = ${tex(F(1, lambda))}$.`],
  ];
  const [what, value, corr] = values[i];
  return {
    prompt: `$X$ a pour fonction caractéristique $\\varphi_X(t) = ${phi}$. Donne $${what}$.`,
    answer: numF(value),
    hint: '$E(X) = \\frac{\\varphi\'(0)}{i}$ et $E(X^2) = -\\varphi\'\'(0)$ ; ou reconnais la loi.',
    correction: [corr],
  };
});

const conditionnelle = skill('l3-esperance-conditionnelle', 'Calculer une espérance conditionnelle', (rng, level) => {
  const xs = level === 1 ? [0, 1] : [0, 1, 2];
  const N = rng.pick([10, 12, 20]);
  // Poids entiers de la loi jointe P(X = x, Y = y) = w / N, avec au moins un poids non nul pour Y = 1.
  let w: number[][];
  do {
    let rest = N;
    w = xs.map(() => [0, 0]);
    const cells = xs.flatMap((_, i) => [
      [i, 0],
      [i, 1],
    ]);
    for (const [k, [i, j]] of cells.entries()) {
      const take = k === cells.length - 1 ? rest : rng.int(0, Math.min(rest, Math.ceil(N / 3)));
      w[i][j] = take;
      rest -= take;
    }
  } while (w.reduce((s, r) => s + r[1], 0) === 0);
  const pY = w.reduce((s, r) => s + r[1], 0);
  const top = xs.reduce((s, x, i) => s + x * w[i][1], 0);
  const value = F(top, pY);
  const table = `\\begin{array}{c|${xs.map(() => 'c').join('')}} & ${xs.map((x) => `X = ${x}`).join(' & ')} \\\\ \\hline Y = 0 & ${xs.map((_, i) => tex(F(w[i][0], N))).join(' & ')} \\\\ Y = 1 & ${xs.map((_, i) => tex(F(w[i][1], N))).join(' & ')} \\end{array}`;
  return {
    prompt: `La loi du couple $(X, Y)$ est donnée par le tableau $${table}$. Calcule $E(X \\mid Y = 1)$.`,
    answer: numF(value),
    hint: '$E(X \\mid Y = 1) = \\sum_x x\\,\\frac{P(X = x, Y = 1)}{P(Y = 1)}$.',
    correction: [`$P(Y = 1) = ${tex(F(pY, N))}$`, `$E(X \\mid Y = 1) = \\frac{${xs.map((x, i) => `${x}\\times ${tex(F(w[i][1], N))}`).join(' + ')}}{${tex(F(pY, N))}} = ${tex(value)}$`],
  };
});

const borelCantelli = skill('l3-borel-cantelli', 'Appliquer le lemme de Borel-Cantelli', (rng, level) => {
  const alpha = level === 1 ? rng.pick([F(2), F(3), F(1, 2), F(1)]) : rng.pick([F(3, 2), F(1, 2), F(2), F(1), F(5, 4), F(3, 4)]);
  const converge = alpha.n > alpha.d;
  const indep = level === 1 || converge || rng.next() < 0.6;
  const value = converge ? 0 : indep ? 1 : 2;
  const options = ['$0$', '$1$', 'On ne peut pas conclure'];
  return {
    prompt: `Les événements $A_n$ ${indep ? 'sont indépendants et ' : ''}vérifient $P(A_n) = \\frac{1}{n^{${tex(alpha)}}}$. Que vaut $P(\\limsup A_n)$, la probabilité qu’une infinité de $A_n$ se réalisent ?`,
    answer: fixedChoice(options, value),
    hint: 'Si $\\sum P(A_n) < \\infty$, $P(\\limsup A_n) = 0$. Si la série diverge et les $A_n$ sont indépendants, $P(\\limsup A_n) = 1$.',
    correction: [
      `$\\sum \\frac{1}{n^{${tex(alpha)}}}$ ${converge ? 'converge' : 'diverge'} (série de Riemann).`,
      converge ? 'Premier lemme de Borel-Cantelli : la probabilité vaut $0$.' : indep ? 'Second lemme (indépendance) : la probabilité vaut $1$.' : 'Sans indépendance, la divergence de la série ne suffit pas à conclure.',
    ],
  };
});

export const PROBABILITES_SKILLS: Skill[] = [tcl, bienayme, convergences, caracteristique, conditionnelle, borelCantelli];
