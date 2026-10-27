import { type Fait, type Variantes, qcmBanque, vraiFauxBanque } from '../../licenceVariantes';
import { F, mul, num, numF, sub, tex } from '../util';

/**
 * Variantes des chapitres « Probabilités » et « Statistique » de L3
 * (feuilles bibmath « Convergence de variables aléatoires », « Estimation »).
 */

const PROBAS: Fait[] = [
  { s: 'La convergence presque sûre entraîne la convergence en probabilité.', v: true, why: 'Par convergence dominée appliquée aux indicatrices $\\mathbf{1}_{|X_n - X| > \\varepsilon}$.' },
  { s: 'La convergence en probabilité entraîne la convergence presque sûre.', v: false, why: 'Le « typewriter » (indicatrices d’intervalles qui balaient $[0, 1]$) converge en probabilité mais nulle part presque sûrement.' },
  { s: 'La convergence en probabilité entraîne la convergence en loi.', v: true, why: 'C’est la plus faible des convergences usuelles.' },
  { s: 'La convergence en loi vers une constante entraîne la convergence en probabilité.', v: true, why: 'C’est l’exception classique : la limite est déterministe.' },
  { s: 'La convergence dans $L^2$ entraîne la convergence en probabilité.', v: true, why: 'Inégalité de Markov appliquée à $|X_n - X|^2$.' },
  { s: 'La loi forte des grands nombres demande seulement que les $X_i$ soient intégrables, indépendantes et de même loi.', v: true, why: 'C’est l’énoncé de Kolmogorov.' },
  { s: 'Si $\\sum P(A_n) < +\\infty$, alors presque sûrement seul un nombre fini de $A_n$ se réalisent.', v: true, why: 'C’est le premier lemme de Borel-Cantelli, sans hypothèse d’indépendance.' },
  { s: 'Si $\\sum P(A_n) = +\\infty$, alors une infinité de $A_n$ se réalisent presque sûrement, même sans indépendance.', v: false, why: 'Avec $A_n = A$ fixé de probabilité $\\frac{1}{2}$, la probabilité vaut $\\frac{1}{2}$.' },
  { s: 'La fonction caractéristique d’une somme de variables indépendantes est le produit des fonctions caractéristiques.', v: true, why: '$E(e^{it(X + Y)}) = E(e^{itX})E(e^{itY})$ par indépendance.' },
  { s: '$|\\varphi_X(t)| \\leq 1$ pour tout $t$.', v: true, why: '$|E(e^{itX})| \\leq E(|e^{itX}|) = 1$.' },
  { s: '$E(E(X \\mid Y)) = E(X)$.', v: true, why: 'C’est la propriété de la tour (espérance totale).' },
  { s: 'Le théorème central limite demande que les $X_i$ aient une variance finie.', v: true, why: 'Sans variance finie, la renormalisation en $\\sqrt n$ ne convient plus.' },
];

const STATS: Fait[] = [
  { s: 'La moyenne empirique est un estimateur sans biais de l’espérance.', v: true, why: '$E(\\overline{X}_n) = \\frac{1}{n}\\sum E(X_i) = m$.' },
  { s: '$\\frac{1}{n}\\sum (X_i - \\overline{X}_n)^2$ est un estimateur sans biais de la variance.', v: false, why: 'Son espérance vaut $\\frac{n - 1}{n}\\sigma^2$ ; il faut diviser par $n - 1$.' },
  { s: 'Un estimateur sans biais dont la variance tend vers $0$ est convergent.', v: true, why: 'Par Bienaymé-Tchebychev.' },
  { s: 'Pour la loi uniforme sur $[0, \\theta]$, $\\max(X_i)$ est un estimateur sans biais de $\\theta$.', v: false, why: '$E(\\max X_i) = \\frac{n}{n + 1}\\theta$ : il sous-estime $\\theta$.' },
  { s: 'Un intervalle de confiance à $95\\,\\%$ contient le vrai paramètre avec probabilité $0{,}95$ avant l’observation.', v: true, why: 'C’est l’intervalle aléatoire qui a cette probabilité de recouvrir le paramètre.' },
  { s: 'Plus le niveau de confiance est élevé, plus l’intervalle est étroit.', v: false, why: 'C’est le contraire : demander plus de confiance élargit l’intervalle.' },
  { s: 'Quadrupler la taille de l’échantillon divise par $2$ la largeur de l’intervalle de confiance d’une moyenne.', v: true, why: 'La largeur est proportionnelle à $\\frac{\\sigma}{\\sqrt n}$.' },
  { s: 'Le risque de première espèce est la probabilité de rejeter $H_0$ alors qu’elle est vraie.', v: true, why: 'C’est sa définition ; on le fixe à $\\alpha$.' },
  { s: 'Ne pas rejeter $H_0$ prouve que $H_0$ est vraie.', v: false, why: 'On manque seulement de preuves contre $H_0$.' },
  { s: 'Pour la loi de Poisson, l’estimateur du maximum de vraisemblance de $\\lambda$ est la moyenne empirique.', v: true, why: 'La log-vraisemblance $\\sum x_i\\ln\\lambda - n\\lambda$ est maximale en $\\lambda = \\overline{x}$.' },
];

export const PROBABILITES_L3_VARIANTES: Variantes = {
  'l3-tcl': [
    // Taille d'échantillon pour un écart type de la moyenne donné.
    (rng) => {
      const e = rng.pick([1, 2, 5]);
      const k = rng.int(2, 10);
      const sigma = e * k;
      return {
        prompt: `Des mesures indépendantes ont un écart type $\\sigma = ${sigma}$. Combien en faut-il au minimum pour que l’écart type de leur moyenne $\\overline{X}_n$ soit au plus $${e}$ ?`,
        answer: num(k * k),
        hint: 'L’écart type de $\\overline{X}_n$ vaut $\\frac{\\sigma}{\\sqrt n}$.',
        correction: [`$\\frac{${sigma}}{\\sqrt n} \\leq ${e} \\iff \\sqrt n \\geq ${k} \\iff n \\geq ${k * k}$`],
      };
    },
    (rng) => vraiFauxBanque(rng, PROBAS),
  ],
  'l3-bienayme-tchebychev': [
    // Taille minimale garantie par Bienaymé-Tchebychev.
    (rng) => {
      const v = rng.int(1, 9);
      const a = rng.pick([F(1, 2), F(1, 10), F(1, 5), F(1)]);
      const alpha = rng.pick([F(1, 10), F(1, 20), F(1, 100), F(1, 4)]);
      // v/(n a²) ≤ α ⇔ n ≥ v/(α a²)
      const bound = F(v * alpha.d * a.d * a.d, alpha.n * a.n * a.n);
      const n = Math.ceil(bound.n / bound.d);
      return {
        prompt: `Les $X_i$ sont indépendantes, de variance $${v}$. Quelle est la plus petite taille $n$ pour laquelle Bienaymé-Tchebychev garantit $P\\left(|\\overline{X}_n - m| \\geq ${tex(a)}\\right) \\leq ${tex(alpha)}$ ?`,
        answer: num(n),
        hint: '$P(|\\overline{X}_n - m| \\geq a) \\leq \\dfrac{V(X_1)}{na^2}$.',
        correction: [`Il faut $\\dfrac{${v}}{n \\times ${tex(mul(a, a))}} \\leq ${tex(alpha)}$, soit $n \\geq ${tex(bound)}$.`, `$n = ${n}$`],
      };
    },
    (rng) => qcmBanque(rng, PROBAS),
  ],
  'l3-modes-convergence': [(rng) => qcmBanque(rng, PROBAS), (rng) => qcmBanque(rng, PROBAS, true)],
  'l3-fonction-caracteristique': [
    // Loi binomiale reconnue par sa fonction caractéristique.
    (rng) => {
      const n = rng.int(2, 10);
      const p = rng.pick([F(1, 2), F(1, 3), F(2, 3), F(1, 4), F(3, 4), F(1, 5)]);
      const q = sub(F(1), p);
      const askV = rng.next() < 0.5;
      const v = askV ? mul(mul(F(n), p), q) : mul(F(n), p);
      return {
        prompt: `$X$ a pour fonction caractéristique $\\varphi_X(t) = \\left(${tex(q)} + ${tex(p)}\\,e^{it}\\right)^{${n}}$. Donne $${askV ? 'V(X)' : 'E(X)'}$.`,
        answer: numF(v),
        hint: 'C’est la fonction caractéristique d’une somme de Bernoulli indépendantes : $\\mathcal{B}(n, p)$.',
        correction: [`$X \\sim \\mathcal{B}\\left(${n}, ${tex(p)}\\right)$`, `$${askV ? 'V(X) = np(1 - p)' : 'E(X) = np'} = ${tex(v)}$`],
      };
    },
    (rng) => vraiFauxBanque(rng, PROBAS),
  ],
  'l3-esperance-conditionnelle': [
    // Dé : E(X | X > k).
    (rng) => {
      const n = rng.pick([6, 8, 10, 12, 20]);
      const k = rng.int(1, n - 2);
      const v = F(k + 1 + n, 2);
      return {
        prompt: `On lance un dé équilibré à $${n}$ faces ; $X$ est le résultat. Calcule $E(X \\mid X > ${k})$.`,
        answer: numF(v),
        hint: `Sachant $X > ${k}$, $X$ est uniforme sur $\\{${k + 1}, \\dots, ${n}\\}$.`,
        correction: [`Moyenne de $${k + 1}$ à $${n}$ : $\\frac{${k + 1} + ${n}}{2} = ${tex(v)}$`],
      };
    },
    (rng) => qcmBanque(rng, PROBAS, true),
  ],
  'l3-borel-cantelli': [(rng) => vraiFauxBanque(rng, PROBAS), (rng) => qcmBanque(rng, PROBAS)],
  'l3-moments-empiriques': [
    // Question inverse : la valeur manquante.
    (rng) => {
      const n = rng.int(4, 7);
      const data = Array.from({ length: n - 1 }, () => rng.int(0, 20));
      const x = rng.int(0, 20);
      const total = data.reduce((s, v) => s + v, 0) + x;
      const m = F(total, n);
      return {
        prompt: `Un échantillon de $${n}$ valeurs a pour moyenne $${tex(m)}$. On connaît $${n - 1}$ d’entre elles : $${data.join(' ;\\ ')}$. Quelle est la dernière ?`,
        answer: num(x),
        hint: 'La somme des valeurs vaut $n \\times \\overline{x}$.',
        correction: [`Somme totale : $${n} \\times ${tex(m)} = ${total}$`, `Valeur manquante : $${total} - ${total - x} = ${x}$`],
      };
    },
    (rng) => vraiFauxBanque(rng, STATS),
  ],
  'l3-estimateur-sans-biais': [(rng) => vraiFauxBanque(rng, STATS), (rng) => qcmBanque(rng, STATS)],
  'l3-maximum-vraisemblance': [
    // Loi uniforme sur [0, θ] : l'EMV est le maximum.
    (rng) => {
      const data = Array.from({ length: rng.int(4, 7) }, () => rng.int(1, 30));
      return {
        prompt: `On observe l’échantillon $${data.join(' ;\\ ')}$ d’une loi uniforme sur $[0\\,;\\,\\theta]$. Donne l’estimation de $\\theta$ par maximum de vraisemblance.`,
        answer: num(Math.max(...data)),
        hint: 'La vraisemblance vaut $\\theta^{-n}$ si $\\theta \\geq \\max x_i$, et $0$ sinon : elle décroît en $\\theta$.',
        correction: [`$\\hat\\theta = \\max x_i = ${Math.max(...data)}$`],
      };
    },
    (rng) => qcmBanque(rng, STATS, true),
  ],
  'l3-intervalle-confiance': [
    // Largeur de l'intervalle à 95 % : 2 × 1,96 σ/√n.
    (rng) => {
      const r = rng.int(2, 10);
      const sigma = rng.int(1, 10);
      const w = F(392 * sigma, 100 * r);
      return {
        prompt: `On estime une moyenne sur un échantillon de taille $${r * r}$ d’une loi normale d’écart type connu $\\sigma = ${sigma}$. Quelle est la largeur de l’intervalle de confiance à $95\\,\\%$ (avec $1{,}96$) ?`,
        answer: numF(w),
        hint: 'L’intervalle est $\\left[\\overline{x} - 1{,}96\\frac{\\sigma}{\\sqrt n}\\,;\\,\\overline{x} + 1{,}96\\frac{\\sigma}{\\sqrt n}\\right]$.',
        correction: [`Largeur : $2 \\times 1{,}96 \\times \\frac{${sigma}}{${r}} = ${tex(w)}$`],
      };
    },
    (rng) => vraiFauxBanque(rng, STATS),
  ],
  'l3-test-hypothese': [(rng) => vraiFauxBanque(rng, STATS), (rng) => qcmBanque(rng, STATS, true)],
};

export const BANQUES_PROBABILITES_L3 = { PROBAS, STATS };
