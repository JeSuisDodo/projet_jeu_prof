import { sumLatex } from '../../latex';
import { type Fait, type Variantes, qcmBanque, vraiFauxBanque } from '../../licenceVariantes';
import { F, add, div, fpow, mul, num, numF, par, sub, tex } from '../util';
import { pairOf } from '../../licence2/util';

/**
 * Variantes des chapitres « Calcul différentiel », « Équations différentielles » et « Analyse
 * numérique » de L3 (feuilles bibmath « Calcul différentiel », « Équations différentielles »,
 * « Analyse numérique »).
 */

const DIFFERENTIEL: Fait[] = [
  { s: 'Une application différentiable en un point y est continue.', v: true, why: '$f(a + h) = f(a) + df_a(h) + o(h) \\to f(a)$.' },
  { s: 'Une application linéaire $u$ sur $\\mathbb{R}^n$ est différentiable, et $du_a = u$ en tout point.', v: true, why: '$u(a + h) = u(a) + u(h)$ exactement.' },
  { s: 'Si $J_F(a)$ est inversible, $F$ est un difféomorphisme global.', v: false, why: 'Le théorème d’inversion locale ne donne qu’un difféomorphisme local : $(x, y) \\mapsto e^x(\\cos y, \\sin y)$ n’est pas injective.' },
  { s: 'La différentielle de $\\det$ en $I_n$ est la trace.', v: true, why: '$\\det(I_n + H) = 1 + \\mathrm{tr}\\,H + o(H)$.' },
  { s: 'La différentielle de $M \\mapsto M^2$ en $A$ est $H \\mapsto 2AH$.', v: false, why: '$(A + H)^2 = A^2 + AH + HA + H^2$ : c’est $H \\mapsto AH + HA$, différent de $2AH$ si $A$ et $H$ ne commutent pas.' },
  { s: 'Aux extrema de $f$ sous la contrainte $g = 0$ (avec $\\nabla g \\neq 0$), $\\nabla f$ et $\\nabla g$ sont colinéaires.', v: true, why: 'C’est le théorème des extrema liés (multiplicateur de Lagrange).' },
  { s: 'Le théorème des fonctions implicites demande $\\frac{\\partial F}{\\partial y}(a, b) \\neq 0$ pour exprimer $y$ en fonction de $x$.', v: true, why: 'C’est l’hypothèse d’inversibilité de la différentielle partielle.' },
  { s: 'La composée de deux applications différentiables a pour différentielle la somme des différentielles.', v: false, why: 'C’est la composée : $d(g \\circ f)_a = dg_{f(a)} \\circ df_a$.' },
];

const EQUADIFF: Fait[] = [
  { s: 'Le théorème de Cauchy-Lipschitz donne existence et unicité d’une solution maximale pour $y\' = f(t, y)$ avec $f$ localement lipschitzienne en $y$.', v: true, why: 'C’est l’énoncé du théorème.' },
  { s: '$y\' = 2\\sqrt{|y|}$, $y(0) = 0$ a une unique solution.', v: false, why: '$y = 0$ et $y = t^2$ (pour $t \\geq 0$) conviennent : $\\sqrt{|y|}$ n’est pas lipschitzienne en $0$.' },
  { s: 'Les solutions d’une équation linéaire $Y\' = A(t)Y$ forment un espace vectoriel de dimension $n$.', v: true, why: 'L’application $Y \\mapsto Y(t_0)$ est un isomorphisme sur $\\mathbb{R}^n$.' },
  { s: 'Les solutions d’une équation linéaire à coefficients continus sur $I$ sont définies sur tout $I$.', v: true, why: 'Pas d’explosion pour une équation linéaire (lemme de Grönwall).' },
  { s: 'Les solutions de $y\' = y^2$ sont définies sur $\\mathbb{R}$.', v: false, why: '$y = \\frac{1}{1 - t}$ explose en $t = 1$.' },
  { s: 'Si toutes les valeurs propres de $M$ ont une partie réelle $< 0$, toutes les solutions de $X\' = MX$ tendent vers $0$.', v: true, why: 'Les solutions sont combinaisons de $t^ke^{\\lambda t}$ avec $\\mathrm{Re}\\,\\lambda < 0$.' },
  { s: 'Deux solutions distinctes d’une équation de Cauchy-Lipschitz peuvent se croiser.', v: false, why: 'Au point de croisement, l’unicité serait contredite.' },
  { s: 'Toute solution de $X\' = MX$ s’écrit $X(t) = e^{tM}X(0)$.', v: true, why: '$\\frac{d}{dt}e^{tM} = Me^{tM}$ et unicité.' },
];

const NUMERIQUE: Fait[] = [
  { s: 'La méthode de Newton converge quadratiquement vers une racine simple, si on part assez près.', v: true, why: 'L’erreur vérifie $e_{n+1} \\approx \\frac{f\'\'}{2f\'}e_n^2$.' },
  { s: 'La dichotomie divise l’erreur par $2$ à chaque étape.', v: true, why: 'On garde la moitié de l’intervalle qui contient la racine.' },
  { s: 'La méthode de Newton converge toujours, quel que soit le point de départ.', v: false, why: 'Pour $\\arctan$, elle diverge si on part trop loin de $0$.' },
  { s: 'La méthode des trapèzes est exacte pour les polynômes de degré $\\leq 1$.', v: true, why: 'Sur chaque morceau, elle remplace $f$ par sa sécante.' },
  { s: 'La méthode de Simpson est exacte pour les polynômes de degré $\\leq 3$.', v: true, why: 'Elle est construite pour le degré $2$ et, par symétrie, est aussi exacte en degré $3$.' },
  { s: 'L’erreur de la méthode des rectangles composée est en $O(h^2)$.', v: false, why: 'Elle est en $O(h)$ ; c’est le point milieu qui est en $O(h^2)$.' },
  { s: 'Le schéma d’Euler explicite est d’ordre $1$.', v: true, why: 'L’erreur globale est en $O(h)$.' },
  { s: 'Par $n + 1$ points d’abscisses distinctes passe un unique polynôme de degré $\\leq n$.', v: true, why: 'C’est l’interpolation de Lagrange (Vandermonde inversible).' },
  { s: 'Augmenter le nombre de points équirépartis améliore toujours l’interpolation de Lagrange.', v: false, why: 'Le phénomène de Runge : pour $\\frac{1}{1 + 25x^2}$, l’erreur explose aux bords.' },
];

/** a x² + b xy + c y² + d. */
const q2 = (a: number, b: number, c: number, d = 0) => sumLatex([
  [a, 'x^2'],
  [b, 'xy'],
  [c, 'y^2'],
  [d, ''],
]);

const TRIPLES = [
  [3, 4, 5],
  [4, 3, 5],
  [5, 12, 13],
  [12, 5, 13],
  [6, 8, 10],
];

export const CALCUL_L3_VARIANTES: Variantes = {
  'l3-differentielle': [
    // Plan tangent : sa valeur en (0, 0).
    (rng) => {
      const [a, b, c, d] = [rng.int(-3, 3), rng.int(-3, 3), rng.int(-3, 3), rng.int(-5, 5)];
      const [x, y] = [rng.nonZero(-2, 2), rng.nonZero(-2, 2)];
      const f = a * x * x + b * x * y + c * y * y + d;
      const fx = 2 * a * x + b * y;
      const fy = b * x + 2 * c * y;
      const z0 = f - x * fx - y * fy;
      return {
        prompt: `Le plan tangent au graphe de $f(x, y) = ${q2(a, b, c, d)}$ au point d’abscisse $(${x}, ${y})$ a pour équation $z = \\alpha x + \\beta y + \\gamma$. Donne $\\gamma$.`,
        answer: num(z0),
        hint: '$z = f(a, b) + \\partial_xf(a, b)(x - a) + \\partial_yf(a, b)(y - b)$, puis prends $x = y = 0$.',
        correction: [`$f(${x}, ${y}) = ${f}$, $\\partial_xf = ${fx}$, $\\partial_yf = ${fy}$`, `$\\gamma = ${f} - ${par(x)}\\times${par(fx)} - ${par(y)}\\times${par(fy)} = ${z0}$`],
      };
    },
    (rng) => vraiFauxBanque(rng, DIFFERENTIEL),
  ],
  'l3-jacobien': [
    // Coordonnées elliptiques : (a r cos θ, b r sin θ), jacobien a b r.
    (rng) => {
      const a = rng.int(1, 4);
      const b = rng.int(1, 4);
      const r = rng.int(1, 5);
      const co = (k: number, t: string) => `${k === 1 ? '' : k}r\\${t}\\theta`;
      return {
        prompt: `Calcule le jacobien de $\\Phi(r, \\theta) = (${co(a, 'cos')},\\ ${co(b, 'sin')})$ au point $r = ${r}$ (pour tout $\\theta$).`,
        answer: num(a * b * r),
        hint: 'Écris la matrice des dérivées partielles et utilise $\\cos^2 + \\sin^2 = 1$.',
        correction: [`$\\det J = ${a}\\cos\\theta \\times ${b}r\\cos\\theta + ${a}r\\sin\\theta \\times ${b}\\sin\\theta = ${a * b}r$`, `En $r = ${r}$ : $${a * b * r}$`],
      };
    },
    (rng) => qcmBanque(rng, DIFFERENTIEL),
  ],
  'l3-inversion-locale': [
    // Jacobien de l'inverse local de (x + a y², y + b x²).
    (rng) => {
      const a = rng.nonZero(-2, 2);
      const b = rng.nonZero(-2, 2);
      let p: number;
      let q: number;
      do [p, q] = [rng.int(-2, 2), rng.int(-2, 2)];
      while (1 - 4 * a * b * p * q === 0);
      const J = 1 - 4 * a * b * p * q;
      const fp = [p + a * q * q, q + b * p * p];
      return {
        prompt: `$F(x, y) = (${sumLatex([[1, 'x'], [a, 'y^2']])},\\ ${sumLatex([[1, 'y'], [b, 'x^2']])})$ est un difféomorphisme local au voisinage de $(${p}, ${q})$. Calcule le jacobien de $F^{-1}$ au point $(${fp[0]}, ${fp[1]})$.`,
        answer: numF(F(1, J)),
        hint: '$J_{F^{-1}}(F(a)) = J_F(a)^{-1}$, donc les déterminants sont inverses.',
        correction: [`$\\det J_F(x, y) = ${sumLatex([[1, ''], [-4 * a * b, 'xy']])}$, qui vaut $${J}$ en $(${p}, ${q})$`, `Jacobien de $F^{-1}$ : $${tex(F(1, J))}$`],
      };
    },
    (rng) => vraiFauxBanque(rng, DIFFERENTIEL),
  ],
  'l3-fonctions-implicites': [
    // Cercle x² + y² = R² en un point pythagoricien.
    (rng) => {
      const [x0, y0, R] = rng.pick(TRIPLES);
      const sx = rng.sign();
      const sy = rng.sign();
      const v = F(-(sx * x0), sy * y0);
      return {
        prompt: `L’équation $x^2 + y^2 = ${R * R}$ définit, au voisinage de $(${sx * x0}, ${sy * y0})$, $y = \\varphi(x)$. Calcule $\\varphi'(${sx * x0})$.`,
        answer: numF(v),
        hint: 'Dérive $x^2 + \\varphi(x)^2 = R^2$ : $2x + 2\\varphi(x)\\varphi\'(x) = 0$.',
        correction: [`$\\varphi'(x) = -\\dfrac{x}{\\varphi(x)}$`, `$\\varphi'(${sx * x0}) = ${tex(v)}$`],
      };
    },
    (rng) => qcmBanque(rng, DIFFERENTIEL, true),
  ],
  'l3-extrema-lies': [
    // Maximum de xyz sous x + y + z = s.
    (rng) => {
      const k = rng.int(1, 5);
      const s = 3 * k;
      return {
        prompt: `Quel est le maximum de $xyz$ pour $x, y, z \\geq 0$ avec $x + y + z = ${s}$ ?`,
        answer: num(k ** 3),
        hint: 'Lagrange : $yz = xz = xy = \\lambda$ ; le maximum est atteint quand les trois sont égaux.',
        correction: [`$x = y = z = ${k}$`, `Maximum : $${k}^3 = ${k ** 3}$`],
      };
    },
    (rng) => vraiFauxBanque(rng, DIFFERENTIEL),
  ],
  'l3-differentielle-matricielle': [
    // d(tr M²)_A(H) = 2 tr(AH).
    (rng) => {
      const A = [
        [rng.int(-3, 3), rng.int(-3, 3)],
        [rng.int(-3, 3), rng.int(-3, 3)],
      ];
      const H = [
        [rng.int(-2, 2), rng.int(-2, 2)],
        [rng.int(-2, 2), rng.int(-2, 2)],
      ];
      const trAH = A[0][0] * H[0][0] + A[0][1] * H[1][0] + A[1][0] * H[0][1] + A[1][1] * H[1][1];
      const m = (M: number[][]) => `\\begin{pmatrix} ${M[0].join(' & ')} \\\\ ${M[1].join(' & ')}\\end{pmatrix}`;
      return {
        prompt: `Soit $f(M) = \\mathrm{tr}(M^2)$ sur $M_2(\\mathbb{R})$. Calcule $df_A(H)$ pour $A = ${m(A)}$ et $H = ${m(H)}$.`,
        answer: num(2 * trAH),
        hint: '$\\mathrm{tr}((A + H)^2) = \\mathrm{tr}(A^2) + \\mathrm{tr}(AH) + \\mathrm{tr}(HA) + \\dots$ et $\\mathrm{tr}(HA) = \\mathrm{tr}(AH)$.',
        correction: [`$df_A(H) = 2\\,\\mathrm{tr}(AH)$`, `$\\mathrm{tr}(AH) = ${trAH}$, donc $df_A(H) = ${2 * trAH}$`],
      };
    },
    (rng) => qcmBanque(rng, DIFFERENTIEL),
  ],
  'l3-equation-caracteristique': [
    // Question inverse : retrouver l'équation à partir des racines.
    (rng) => {
      const r1 = rng.int(-4, 4);
      const r2 = rng.next() < 0.3 ? r1 : rng.int(-4, 4);
      const p = -(r1 + r2);
      const q = r1 * r2;
      const e = (r: number) => (r === 0 ? '1' : `e^{${r === 1 ? '' : r === -1 ? '-' : r}t}`);
      const ex = (r: number) => (r === 0 ? '' : e(r));
      const sol = r1 === r2 ? `(A + Bt)${ex(r1)}` : `A${ex(r1)} + B${ex(r2)}`;
      return {
        prompt: `Les solutions de $y'' + py' + qy = 0$ sont les fonctions $y(t) = ${sol}$. Donne $p$ et $q$.`,
        answer: pairOf(p, q, ['p', 'q']),
        hint: 'Les exposants sont les racines de $r^2 + pr + q = 0$ : leur somme vaut $-p$ et leur produit $q$.',
        correction: [`Racines $${r1}$ et $${r2}$`, `$p = -(${r1} + ${par(r2)}) = ${p}$, $q = ${r1}\\times${par(r2)} = ${q}$`],
      };
    },
    (rng) => vraiFauxBanque(rng, EQUADIFF),
  ],
  'l3-ordre1-affine': [
    // y' = a y + b t : solution affine.
    (rng) => {
      const a = rng.nonZero(-4, 4);
      const b = rng.nonZero(-6, 6);
      const askB = rng.next() < 0.5;
      // (αt + β)' = α = a(αt + β) + bt ⇒ α = −b/a, β = α/a.
      const alpha = F(-b, a);
      const beta = div(alpha, F(a));
      return {
        prompt: `L’équation $y' = ${sumLatex([[a, 'y'], [b, 't']])}$ a une unique solution de la forme $y(t) = \\alpha t + \\beta$. Donne $${askB ? '\\beta' : '\\alpha'}$.`,
        answer: numF(askB ? beta : alpha),
        hint: 'Remplace $y$ par $\\alpha t + \\beta$ et identifie les coefficients de $t$ et les constantes.',
        correction: [`$\\alpha = ${a}(\\alpha t + \\beta) + ${par(b)}t$ : $${a}\\alpha + ${par(b)} = 0$ et $\\alpha = ${a}\\beta$`, `$\\alpha = ${tex(alpha)}$, $\\beta = ${tex(beta)}$`],
      };
    },
    (rng) => qcmBanque(rng, EQUADIFF),
  ],
  'l3-probleme-cauchy-ordre2': [
    // Oscillateur : carré de l'amplitude.
    (rng) => {
      const w = rng.int(1, 4);
      const A = rng.int(-4, 4);
      const B = rng.nonZero(-6, 6);
      const amp2 = add(F(A * A), F(B * B, w * w));
      const wt = w === 1 ? 't' : `${w}t`;
      return {
        prompt: `La solution de $y'' + ${w * w === 1 ? '' : w * w}y = 0$ avec $y(0) = ${A}$ et $y'(0) = ${B}$ s’écrit $y(t) = R\\cos(${w === 1 ? '' : w}t - \\phi)$ avec $R > 0$. Donne $R^2$.`,
        answer: numF(amp2),
        hint: `$y(t) = A\\cos(\\omega t) + \\frac{B}{\\omega}\\sin(\\omega t)$, et $R^2$ est la somme des carrés des deux coefficients.`,
        correction: [`$y(t) = ${A}\\cos(${wt}) ${B < 0 ? '-' : '+'} ${tex(F(Math.abs(B), w))}\\sin(${wt})$`, `$R^2 = ${A * A} + ${tex(F(B * B, w * w))} = ${tex(amp2)}$`],
      };
    },
    (rng) => vraiFauxBanque(rng, EQUADIFF),
  ],
  'l3-systeme-lineaire': [
    // Système triangulaire : taux de croissance dominant.
    (rng) => {
      const l1 = rng.int(-4, 4);
      let l2 = rng.int(-4, 4);
      if (l2 === l1) l2 = l1 + 1;
      const c = rng.int(-3, 3);
      return {
        prompt: `On résout $X' = MX$ avec $M = \\begin{pmatrix} ${l1} & ${c} \\\\ 0 & ${l2}\\end{pmatrix}$. Pour une donnée initiale générique, $\\|X(t)\\|$ se comporte comme $e^{\\mu t}$ en $+\\infty$. Donne $\\mu$.`,
        answer: num(Math.max(l1, l2)),
        hint: 'Les valeurs propres d’une matrice triangulaire sont ses coefficients diagonaux ; la plus grande impose la croissance.',
        correction: [`Valeurs propres $${l1}$ et $${l2}$`, `$\\mu = ${Math.max(l1, l2)}$`],
      };
    },
    (rng) => qcmBanque(rng, EQUADIFF, true),
  ],
  'l3-temps-explosion': [
    // y' = y³, y(0) = a : T = 1/(2a²).
    (rng) => {
      const a = rng.pick([F(1), F(2), F(1, 2), F(3), F(1, 3), F(3, 2)]);
      const T = div(F(1), mul(F(2), fpow(a, 2)));
      return {
        prompt: `La solution maximale de $y' = y^3$, $y(0) = ${tex(a)}$ est définie sur $\\left]-\\infty\\,;\\,T\\right[$. Donne $T$.`,
        answer: numF(T),
        hint: 'Sépare les variables : $\\frac{dy}{y^3} = dt$, donc $\\frac{1}{y^2} = \\frac{1}{y_0^2} - 2t$.',
        correction: [`$y(t) = \\dfrac{y_0}{\\sqrt{1 - 2y_0^2t}}$`, `$T = \\dfrac{1}{2y_0^2} = ${tex(T)}$`],
      };
    },
    (rng) => vraiFauxBanque(rng, EQUADIFF),
  ],
  'l3-solution-particuliere': [
    // y'' + p y' + q y = c t + d : solution affine αt + β.
    (rng) => {
      const p = rng.int(-3, 3);
      const q = rng.nonZero(-4, 4);
      const c = rng.nonZero(-6, 6);
      const d = rng.int(-6, 6);
      const alpha = F(c, q);
      const beta = div(sub(F(d), mul(F(p), alpha)), F(q));
      return {
        prompt: `Cherche une solution particulière de $y'' ${p === 0 ? '' : p < 0 ? `- ${p === -1 ? '' : -p}y'` : `+ ${p === 1 ? '' : p}y'`} ${q < 0 ? '-' : '+'} ${Math.abs(q) === 1 ? '' : Math.abs(q)}y = ${sumLatex([[c, 't'], [d, '']])}$ sous la forme $y_p(t) = \\alpha t + \\beta$. Donne $\\beta$.`,
        answer: numF(beta),
        hint: 'Avec $y_p = \\alpha t + \\beta$ : $y_p\' = \\alpha$, $y_p\'\' = 0$. Identifie les coefficients.',
        correction: [`$${q}\\alpha = ${c}$ donne $\\alpha = ${tex(alpha)}$`, `$${p}\\alpha + ${par(q)}\\beta = ${d}$ donne $\\beta = ${tex(beta)}$`],
      };
    },
    (rng) => qcmBanque(rng, EQUADIFF),
  ],
  'l3-methode-newton': [
    // Newton pour la racine cubique.
    (rng) => {
      const a = rng.int(2, 30);
      const x0 = F(rng.int(1, 4));
      // x₁ = x₀ − (x₀³ − a)/(3x₀²) = (2x₀³ + a)/(3x₀²)
      const x1 = div(add(mul(F(2), fpow(x0, 3)), F(a)), mul(F(3), fpow(x0, 2)));
      return {
        prompt: `On applique la méthode de Newton à $f(x) = x^3 - ${a}$ en partant de $x_0 = ${tex(x0)}$. Donne $x_1$ (fraction exacte).`,
        answer: numF(x1),
        hint: '$x_{n+1} = x_n - \\dfrac{f(x_n)}{f\'(x_n)} = \\dfrac{2x_n^3 + a}{3x_n^2}$.',
        correction: [`$x_1 = \\dfrac{2 \\times ${tex(x0)}^3 + ${a}}{3 \\times ${tex(x0)}^2} = ${tex(x1)}$`],
      };
    },
    (rng) => vraiFauxBanque(rng, NUMERIQUE),
  ],
  'l3-dichotomie': [(rng) => vraiFauxBanque(rng, NUMERIQUE), (rng) => qcmBanque(rng, NUMERIQUE)],
  'l3-quadrature': [
    // Simpson sur un seul intervalle, exact en degré 3.
    (rng) => {
      const b = rng.pick([2, 4, 6]);
      const c = [rng.int(-2, 2), rng.int(-3, 3), rng.int(-3, 3), rng.int(-4, 4)];
      if (c[0] === 0) c[0] = 1;
      const P = (x: number) => c[0] * x ** 3 + c[1] * x ** 2 + c[2] * x + c[3];
      const v = F(b * (P(0) + 4 * P(b / 2) + P(b)), 6);
      return {
        prompt: `On approche $\\displaystyle\\int_0^{${b}} P(x)\\,dx$, avec $P(x) = ${sumLatex([[c[0], 'x^3'], [c[1], 'x^2'], [c[2], 'x'], [c[3], '']])}$, par la méthode de Simpson sur le seul intervalle $[0\\,;\\,${b}]$. Quelle valeur obtient-on ?`,
        answer: numF(v),
        hint: 'Simpson : $\\frac{b - a}{6}\\left(f(a) + 4f\\left(\\frac{a + b}{2}\\right) + f(b)\\right)$, exact pour les polynômes de degré $\\leq 3$.',
        correction: [`$\\frac{${b}}{6}\\big(${P(0)} + 4\\times${par(P(b / 2))} + ${par(P(b))}\\big) = ${tex(v)}$ (c’est aussi la valeur exacte).`],
      };
    },
    (rng) => qcmBanque(rng, NUMERIQUE, true),
  ],
  'l3-interpolation-lagrange': [
    // Valeur d'un polynôme de base de Lagrange.
    (rng) => {
      const xs = rng.shuffle([-2, -1, 0, 1, 2, 3]).slice(0, 3).sort((u, v) => u - v);
      const i = rng.int(0, 2);
      let t = rng.int(-3, 4);
      while (xs.includes(t)) t++;
      let v = F(1);
      for (let j = 0; j < 3; j++) if (j !== i) v = mul(v, F(t - xs[j], xs[i] - xs[j]));
      return {
        prompt: `Les nœuds d’interpolation sont $${xs.join(',\\ ')}$. Calcule $L_{${i}}(${t})$, où $L_{${i}}$ est le polynôme de base de Lagrange qui vaut $1$ en $${xs[i]}$ et $0$ aux autres nœuds.`,
        answer: numF(v),
        hint: '$L_i(t) = \\prod_{j \\neq i} \\dfrac{t - x_j}{x_i - x_j}$.',
        correction: [`$L_{${i}}(${t}) = ${xs.filter((_, j) => j !== i).map((x) => `\\frac{${t} - ${par(x)}}{${xs[i]} - ${par(x)}}`).join(' \\times ')} = ${tex(v)}$`],
      };
    },
    (rng) => vraiFauxBanque(rng, NUMERIQUE),
  ],
  'l3-euler-explicite': [
    // Approximation de e par Euler : (1 + 1/n)ⁿ.
    (rng) => {
      const n = rng.int(2, 4);
      const v = fpow(F(n + 1, n), n);
      return {
        prompt: `On résout $y' = y$, $y(0) = 1$ par le schéma d’Euler explicite de pas $h = \\frac{1}{${n}}$. Quelle valeur approchée de $y(1) = e$ obtient-on ?`,
        answer: numF(v),
        hint: 'Euler : $y_{k+1} = y_k + h\\,y_k = (1 + h)y_k$.',
        correction: [`$y_{${n}} = \\left(1 + \\frac{1}{${n}}\\right)^{${n}} = ${tex(v)}$`],
      };
    },
    (rng) => qcmBanque(rng, NUMERIQUE),
  ],
  'l3-ordres-convergence': [(rng) => vraiFauxBanque(rng, NUMERIQUE), (rng) => qcmBanque(rng, NUMERIQUE, true)],
};

export const BANQUES_CALCUL_L3 = { DIFFERENTIEL, EQUADIFF, NUMERIQUE };
