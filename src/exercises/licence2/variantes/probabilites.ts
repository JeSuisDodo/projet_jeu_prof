import { type Fait, type Variantes, qcmBanque, vraiFauxBanque } from '../../licenceVariantes';
import { F, div, fpow, mul, num, numF, par, sub, tex } from '../util';

/**
 * Variantes des chapitres « Variables aléatoires discrètes » et « Variables à densité » de L2
 * (feuilles bibmath « Variables aléatoires discrètes », « Variables aléatoires à densité »).
 */

const DISCRETES: Fait[] = [
  { s: 'Si $X \\sim \\mathcal{G}(p)$, alors $E(X) = \\frac{1}{p}$.', v: true, why: 'On dérive la série géométrique : $\\sum k p(1 - p)^{k-1} = \\frac{1}{p}$.' },
  { s: 'Si $X \\sim \\mathcal{P}(\\lambda)$, alors $E(X) = V(X) = \\lambda$.', v: true, why: 'Calcul direct, ou dérivées de $G_X(t) = e^{\\lambda(t - 1)}$ en $1$.' },
  { s: 'La loi géométrique est sans mémoire : $P(X > m + n \\mid X > m) = P(X > n)$.', v: true, why: '$P(X > k) = (1 - p)^k$, et le quotient se simplifie.' },
  { s: '$V(X + Y) = V(X) + V(Y)$ pour toutes variables $X$ et $Y$.', v: false, why: 'Il faut ajouter $2\\,\\mathrm{Cov}(X, Y)$ ; avec $Y = X$, $V(2X) = 4V(X)$.' },
  { s: '$E(X + Y) = E(X) + E(Y)$, même si $X$ et $Y$ ne sont pas indépendantes.', v: true, why: 'L’espérance est linéaire, sans hypothèse d’indépendance.' },
  { s: 'Si $\\mathrm{Cov}(X, Y) = 0$, alors $X$ et $Y$ sont indépendantes.', v: false, why: '$X$ uniforme sur $\\{-1, 0, 1\\}$ et $Y = X^2$ : covariance nulle, pas indépendantes.' },
  { s: 'Si $X$ et $Y$ sont indépendantes, alors $E(XY) = E(X)E(Y)$.', v: true, why: 'La loi du couple est le produit des lois.' },
  { s: 'La somme de deux variables de Poisson indépendantes suit une loi de Poisson.', v: true, why: '$G_{X+Y} = G_XG_Y = e^{(\\lambda + \\mu)(t - 1)}$.' },
  { s: 'La fonction génératrice caractérise la loi d’une variable à valeurs dans $\\mathbb{N}$.', v: true, why: '$P(X = k) = \\frac{G_X^{(k)}(0)}{k!}$.' },
  { s: '$G_X(1) = E(X)$.', v: false, why: '$G_X(1) = \\sum P(X = k) = 1$ ; c’est $G_X\'(1)$ qui vaut $E(X)$.' },
  { s: '$V(aX + b) = a^2V(X)$.', v: true, why: 'La constante $b$ ne change pas la dispersion, et $a$ sort au carré.' },
  { s: 'La loi binomiale $\\mathcal{B}(n, \\frac{\\lambda}{n})$ tend vers la loi de Poisson $\\mathcal{P}(\\lambda)$.', v: true, why: 'C’est l’approximation de Poisson, pour les événements rares.' },
];

const DENSITE: Fait[] = [
  { s: 'Une densité de probabilité est toujours inférieure ou égale à $1$.', v: false, why: 'La densité de la loi uniforme sur $[0, \\frac{1}{2}]$ vaut $2$.' },
  { s: 'Si $X$ est à densité, alors $P(X = a) = 0$ pour tout réel $a$.', v: true, why: '$P(X = a) = \\int_a^a f = 0$.' },
  { s: 'La fonction de répartition d’une variable à densité est continue.', v: true, why: '$F(x) = \\int_{-\\infty}^x f$ est continue en $x$.' },
  { s: 'Si $X \\sim \\mathcal{E}(\\lambda)$, alors $E(X) = \\lambda$.', v: false, why: '$E(X) = \\frac{1}{\\lambda}$.' },
  { s: 'La loi exponentielle est sans mémoire.', v: true, why: '$P(X > s + t \\mid X > s) = \\frac{e^{-\\lambda(s + t)}}{e^{-\\lambda s}} = e^{-\\lambda t}$.' },
  { s: 'Si $X \\sim \\mathcal{U}([a, b])$, alors $V(X) = \\frac{(b - a)^2}{12}$.', v: true, why: '$E(X^2) - E(X)^2 = \\frac{a^2 + ab + b^2}{3} - \\frac{(a + b)^2}{4}$.' },
  { s: 'Si $X \\sim \\mathcal{N}(0, 1)$, alors $aX + b \\sim \\mathcal{N}(b, a^2)$ pour $a \\neq 0$.', v: true, why: 'Changement de variable affine dans la densité gaussienne.' },
  { s: 'Toute variable à densité admet une espérance.', v: false, why: 'La loi de Cauchy, de densité $\\frac{1}{\\pi(1 + x^2)}$, n’en a pas.' },
  { s: 'La densité est la dérivée de la fonction de répartition là où celle-ci est dérivable.', v: true, why: 'Théorème fondamental de l’analyse appliqué à $F(x) = \\int_{-\\infty}^x f$.' },
  { s: 'Si $X$ suit une loi uniforme sur $[0, 1]$, alors $X^2$ suit aussi une loi uniforme sur $[0, 1]$.', v: false, why: '$P(X^2 \\leq \\frac{1}{4}) = P(X \\leq \\frac{1}{2}) = \\frac{1}{2} \\neq \\frac{1}{4}$.' },
];

export const PROBABILITES_L2_VARIANTES: Variantes = {
  'l2-loi-geometrique': [
    // Problème : attendre une face donnée d'un dé.
    (rng) => {
      const k = rng.pick([4, 6, 8, 10, 12, 20]);
      const askV = rng.next() < 0.5;
      const p = F(1, k);
      const v = askV ? div(sub(F(1), p), mul(p, p)) : F(k);
      return {
        prompt: `On lance un dé équilibré à $${k}$ faces jusqu’à obtenir la face $${k}$. $X$ est le nombre de lancers. Calcule $${askV ? 'V(X)' : 'E(X)'}$.`,
        answer: numF(v),
        hint: `$X$ suit la loi géométrique de paramètre $p = \\frac{1}{${k}}$ : $E(X) = \\frac{1}{p}$ et $V(X) = \\frac{1 - p}{p^2}$.`,
        correction: [`$p = \\frac{1}{${k}}$`, `$${askV ? 'V(X)' : 'E(X)'} = ${tex(v)}$`],
      };
    },
    // Question inverse : retrouver p à partir de P(X > n).
    (rng) => {
      const q = rng.pick([F(1, 2), F(2, 3), F(1, 3), F(3, 4), F(4, 5)]);
      const n = rng.int(1, 3);
      return {
        prompt: `$X$ suit une loi géométrique de paramètre $p$ et $P(X > ${n}) = ${tex(fpow(q, n))}$. Que vaut $p$ ?`,
        answer: numF(sub(F(1), q)),
        hint: '$P(X > n) = (1 - p)^n$ : il faut $n$ échecs de suite.',
        correction: [`$(1 - p)^{${n}} = ${tex(fpow(q, n))}$ donne $1 - p = ${tex(q)}$`, `$p = ${tex(sub(F(1), q))}$`],
      };
    },
    (rng) => vraiFauxBanque(rng, DISCRETES),
  ],
  'l2-loi-poisson': [
    // Question inverse : P(X = k) = P(X = k + 1) ⇒ λ = k + 1.
    (rng) => {
      const k = rng.int(0, 5);
      const r = rng.pick([F(1), F(2), F(1, 2), F(3), F(3, 2)]);
      // P(X = k + 1)/P(X = k) = λ/(k + 1) = r
      const lam = mul(r, F(k + 1));
      return {
        prompt: r.n === r.d
          ? `$X$ suit une loi de Poisson et $P(X = ${k}) = P(X = ${k + 1})$. Quel est le paramètre $\\lambda$ ?`
          : `$X$ suit une loi de Poisson et $P(X = ${k + 1}) = ${tex(r)}\\,P(X = ${k})$. Quel est le paramètre $\\lambda$ ?`,
        answer: numF(lam),
        hint: '$\\dfrac{P(X = k + 1)}{P(X = k)} = \\dfrac{\\lambda}{k + 1}$.',
        correction: [`$\\frac{\\lambda}{${k + 1}} = ${tex(r)}$`, `$\\lambda = ${tex(lam)}$`],
      };
    },
    (rng) => qcmBanque(rng, DISCRETES),
  ],
  'l2-fonction-generatrice': [
    // Reconnaître une loi binomiale à sa fonction génératrice.
    (rng) => {
      const n = rng.int(2, 8);
      const p = rng.pick([F(1, 2), F(1, 3), F(2, 3), F(1, 4), F(3, 4), F(2, 5)]);
      const q = sub(F(1), p);
      const ask = rng.int(0, 2);
      const v = ask === 0 ? mul(F(n), p) : ask === 1 ? fpow(q, n) : mul(mul(F(n), p), q);
      const what = ['E(X)', 'P(X = 0)', 'V(X)'][ask];
      return {
        prompt: `$G_X(t) = \\left(${tex(q)} + ${tex(p)}\\,t\\right)^{${n}}$. Calcule $${what}$.`,
        answer: numF(v),
        hint: ask === 1 ? '$P(X = 0) = G_X(0)$.' : `On reconnaît la loi $\\mathcal{B}(n, p)$ : $E(X) = np$ et $V(X) = np(1 - p)$.`,
        correction: [`$X \\sim \\mathcal{B}\\left(${n}, ${tex(p)}\\right)$`, `$${what} = ${tex(v)}$`],
      };
    },
    (rng) => vraiFauxBanque(rng, DISCRETES),
  ],
  'l2-couple-discret': [
    // Covariance et variance d'une somme.
    (rng) => {
      const [ex, ey] = [rng.int(-3, 4), rng.int(-3, 4)];
      const cov = rng.int(-3, 3);
      const exy = ex * ey + cov;
      const vx = rng.int(1, 6);
      const vy = rng.int(1, 6);
      const askV = rng.next() < 0.5;
      const vs = vx + vy + 2 * cov;
      if (askV && vs > 0)
        return {
          prompt: `$E(X) = ${ex}$, $E(Y) = ${ey}$, $E(XY) = ${exy}$, $V(X) = ${vx}$ et $V(Y) = ${vy}$. Calcule $V(X + Y)$.`,
          answer: num(vs),
          hint: '$V(X + Y) = V(X) + V(Y) + 2\\,\\mathrm{Cov}(X, Y)$ et $\\mathrm{Cov}(X, Y) = E(XY) - E(X)E(Y)$.',
          correction: [`$\\mathrm{Cov}(X, Y) = ${exy} - ${par(ex)}\\times${par(ey)} = ${cov}$`, `$V(X + Y) = ${vx} + ${vy} + 2\\times${par(cov)} = ${vs}$`],
        };
      return {
        prompt: `$E(X) = ${ex}$, $E(Y) = ${ey}$ et $E(XY) = ${exy}$. Calcule $\\mathrm{Cov}(X, Y)$.`,
        answer: num(cov),
        hint: '$\\mathrm{Cov}(X, Y) = E(XY) - E(X)E(Y)$.',
        correction: [`$\\mathrm{Cov}(X, Y) = ${exy} - ${par(ex)}\\times${par(ey)} = ${cov}$`],
      };
    },
    (rng) => qcmBanque(rng, DISCRETES, true),
  ],
  'l2-somme-independantes': [
    // Somme de dés.
    (rng) => {
      const n = rng.int(2, 10);
      const askV = rng.next() < 0.5;
      const v = askV ? F(35 * n, 12) : F(7 * n, 2);
      return {
        prompt: `On lance $${n}$ dés équilibrés à six faces et on note $S$ la somme des résultats. Calcule $${askV ? 'V(S)' : 'E(S)'}$.`,
        answer: numF(v),
        hint: 'Pour un dé : $E = \\frac{7}{2}$ et $V = \\frac{35}{12}$. Les dés sont indépendants.',
        correction: [askV ? `$V(S) = ${n} \\times \\frac{35}{12} = ${tex(v)}$` : `$E(S) = ${n} \\times \\frac{7}{2} = ${tex(v)}$`],
      };
    },
    (rng) => vraiFauxBanque(rng, DISCRETES),
  ],
  'l2-constante-densite': [
    // c/(1 + x)^m sur [0, +∞[ : c = m − 1 ; c e^{−a x} : c = a.
    (rng) => {
      const m = rng.int(2, 6);
      return {
        prompt: `$f(x) = \\dfrac{c}{(1 + x)^{${m}}}$ pour $x \\geq 0$ et $f(x) = 0$ sinon. Pour quelle valeur de $c$ la fonction $f$ est-elle une densité ?`,
        answer: num(m - 1),
        hint: 'L’intégrale de $f$ sur $\\mathbb{R}$ doit valoir $1$.',
        correction: [`$\\displaystyle\\int_0^{+\\infty} \\frac{dx}{(1 + x)^{${m}}} = \\frac{1}{${m - 1}}$`, `$c = ${m - 1}$`],
      };
    },
    (rng) => vraiFauxBanque(rng, DENSITE),
  ],
  'l2-esperance-densite': [
    // Loi de Pareto décalée : E(X) = 1/(m − 2).
    (rng) => {
      const m = rng.int(3, 7);
      return {
        prompt: `$X$ a pour densité $f(x) = \\dfrac{${m - 1}}{(1 + x)^{${m}}}$ sur $[0\\,;\\,+\\infty[$ (et $0$ ailleurs). Calcule $E(X)$.`,
        answer: numF(F(1, m - 2)),
        hint: `Calcule plutôt $E(1 + X) = \\int_0^{+\\infty} \\frac{${m - 1}}{(1 + x)^{${m - 1}}}\\,dx$.`,
        correction: [`$E(1 + X) = \\frac{${m - 1}}{${m - 2}}$`, `$E(X) = \\frac{${m - 1}}{${m - 2}} - 1 = ${tex(F(1, m - 2))}$`],
      };
    },
    (rng) => qcmBanque(rng, DENSITE),
  ],
  'l2-lois-usuelles-densite': [
    // Questions inverses sur les lois uniforme et exponentielle.
    (rng) => {
      if (rng.next() < 0.5) {
        const b = rng.int(1, 6) * (rng.next() < 0.5 ? 1 : 2);
        return {
          prompt: `$X$ suit la loi uniforme sur $[0\\,;\\,b]$ et $V(X) = ${tex(F(b * b, 12))}$. Que vaut $b$ ?`,
          answer: num(b),
          hint: '$V(X) = \\frac{(b - a)^2}{12}$ pour la loi uniforme sur $[a, b]$.',
          correction: [`$\\frac{b^2}{12} = ${tex(F(b * b, 12))}$, donc $b^2 = ${b * b}$`, `$b = ${b}$`],
        };
      }
      const m = rng.pick([F(2), F(5), F(1, 2), F(3, 4), F(10), F(2, 3)]);
      return {
        prompt: `Une durée de vie $X$ suit une loi exponentielle de moyenne $${tex(m)}$ an(s). Quel est son paramètre $\\lambda$ ?`,
        answer: numF(div(F(1), m)),
        hint: '$E(X) = \\frac{1}{\\lambda}$.',
        correction: [`$\\lambda = \\frac{1}{${tex(m)}} = ${tex(div(F(1), m))}$`],
      };
    },
    (rng) => vraiFauxBanque(rng, DENSITE),
  ],
  'l2-fonction-repartition': [
    // F(x) = 1 − x^{−m} sur [1, +∞[.
    (rng) => {
      const m = rng.int(1, 3);
      const t = rng.int(2, 5);
      const s = rng.int(t + 1, 8);
      const between = rng.next() < 0.5;
      const v = between ? sub(F(1, t ** m), F(1, s ** m)) : F(1, t ** m);
      const Fx = `1 - \\frac{1}{x^{${m}}}`;
      return {
        prompt: `$X$ a pour fonction de répartition $F(x) = ${Fx}$ pour $x \\geq 1$ (et $0$ avant). Calcule $${between ? `P(${t} < X \\leq ${s})` : `P(X > ${t})`}$.`,
        answer: numF(v),
        hint: between ? '$P(a < X \\leq b) = F(b) - F(a)$.' : '$P(X > t) = 1 - F(t)$.',
        correction: [between ? `$F(${s}) - F(${t}) = \\frac{1}{${t ** m}} - \\frac{1}{${s ** m}} = ${tex(v)}$` : `$1 - F(${t}) = \\frac{1}{${t}^{${m}}} = ${tex(v)}$`],
      };
    },
    (rng) => qcmBanque(rng, DENSITE, true),
  ],
  'l2-loi-exponentielle': [
    // Question inverse : P(X > t) = e^{−k} ⇒ λ = k/t.
    (rng) => {
      const t = rng.int(1, 6);
      const k = rng.int(1, 6);
      const l = F(k, t);
      return {
        prompt: `$X$ suit une loi exponentielle et $P(X > ${t}) = e^{-${k}}$. Quel est son paramètre $\\lambda$ ?`,
        answer: numF(l),
        hint: '$P(X > t) = e^{-\\lambda t}$.',
        correction: [`$e^{-${t === 1 ? '' : t}\\lambda} = e^{-${k}}$`, `$\\lambda = ${tex(l)}$`],
      };
    },
    (rng) => vraiFauxBanque(rng, DENSITE),
  ],
};

export const BANQUES_PROBABILITES_L2 = { DISCRETES, DENSITE };
