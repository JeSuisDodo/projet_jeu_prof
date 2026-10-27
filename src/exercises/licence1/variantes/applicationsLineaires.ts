import { type Fait, type Variantes, qcmBanque, vraiFaux, vraiFauxBanque } from '../../licenceVariantes';
import { F, binom, mat, matMul, num, numF, pairOf, poly, tex, vec } from '../util';

/** Variantes du chapitre « Applications linéaires » (feuilles bibmath « Applications linéaires » et « Matrices et applications linéaires »). */

const ORD = ['première', 'deuxième', 'troisième'];

const LINEAIRES: Fait[] = [
  { s: 'Un endomorphisme d’un espace de dimension finie est injectif si et seulement s’il est surjectif.', v: true, why: 'Théorème du rang : $\\dim \\ker f = 0 \\iff \\operatorname{rg} f = \\dim E$.' },
  { s: 'Une application linéaire de $\\mathbb{R}^3$ dans $\\mathbb{R}^2$ peut être injective.', v: false, why: 'Son rang est au plus $2$, donc son noyau est de dimension au moins $1$.' },
  { s: 'Une application linéaire de $\\mathbb{R}^2$ dans $\\mathbb{R}^3$ peut être surjective.', v: false, why: 'Son rang est au plus $2 < 3$.' },
  { s: 'Une application linéaire envoie $0$ sur $0$.', v: true, why: '$f(0) = f(0 + 0) = 2f(0)$.' },
  { s: 'Le noyau d’une application linéaire est un sous-espace vectoriel.', v: true, why: 'C’est l’image réciproque de $\\{0\\}$, stable par combinaison linéaire.' },
  { s: 'Une application linéaire est injective si et seulement si son noyau est réduit à $\\{0\\}$.', v: true, why: '$f(x) = f(y) \\iff x - y \\in \\ker f$.' },
  { s: 'L’image d’une famille libre par une application linéaire est libre.', v: false, why: 'L’application nulle envoie toute famille sur des vecteurs nuls.' },
  { s: 'L’image d’une famille génératrice de $E$ engendre $\\operatorname{Im} f$.', v: true, why: 'Tout $f(x)$ est combinaison des images des générateurs.' },
  { s: 'Deux matrices semblables ont la même trace et le même déterminant.', v: true, why: '$\\operatorname{tr}(P^{-1}AP) = \\operatorname{tr}A$ et $\\det(P^{-1}AP) = \\det A$.' },
  { s: 'Deux matrices de même trace et même déterminant sont semblables.', v: false, why: '$I_2$ et $\\begin{pmatrix}1 & 1 \\\\ 0 & 1\\end{pmatrix}$ ont trace $2$ et déterminant $1$, mais seule $I_2$ est semblable à $I_2$.' },
  { s: 'Si $f \\circ f = 0$, alors $\\operatorname{Im} f \\subset \\ker f$.', v: true, why: '$f(f(x)) = 0$ pour tout $x$.' },
];

const LINEAIRE_OU_NON: [string, boolean, string][] = [
  ['f(x, y) = (2x - y, 3y)', true, 'Chaque coordonnée est une combinaison linéaire de $x$ et $y$.'],
  ['f(x, y) = (x + y, xy)', false, '$f(2, 2) = (4, 4) \\neq 2f(1, 1) = (4, 2)$.'],
  ['f(x, y) = (x + 1, y)', false, '$f(0, 0) = (1, 0) \\neq 0$.'],
  ['f(P) = XP\'', true, '$(\\lambda P + Q)\' = \\lambda P\' + Q\'$, puis on multiplie par $X$.'],
  ['f(P) = P^2', false, '$f(2P) = 4P^2 \\neq 2f(P)$ dès que $P \\neq 0$.'],
  ['f(g) = g(0) + g(1)', true, 'L’évaluation en un point est linéaire.'],
  ['f(x, y, z) = |x| + y', false, '$f(-1, 0, 0) = 1 \\neq -f(1, 0, 0)$.'],
  ['f(M) = {}^tM - M', true, 'La transposition est linéaire.'],
  ['f(M) = \\det M \\text{ (sur } \\mathcal{M}_2(\\mathbb{R}))', false, '$\\det(2M) = 4\\det M$.'],
];

export const APPLICATIONS_LINEAIRES_VARIANTES: Variantes = {
  'l1-image-vecteur': [
    // f(e1), f(e2) connus.
    (rng) => {
      const u = [rng.int(-4, 4), rng.int(-4, 4)];
      const v = [rng.int(-4, 4), rng.int(-4, 4)];
      const a = rng.nonZero(-3, 3);
      const b = rng.nonZero(-3, 3);
      const w = [a * u[0] + b * v[0], a * u[1] + b * v[1]];
      return {
        prompt: `$f$ est linéaire de $\\mathbb{R}^2$ dans $\\mathbb{R}^2$, avec $f(e_1) = ${vec(u)}$ et $f(e_2) = ${vec(v)}$. Calcule $f(${a}e_1 ${b < 0 ? '-' : '+'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}e_2)$ : donne ses deux coordonnées.`,
        answer: pairOf(w[0], w[1], ['x', 'y']),
        hint: 'Par linéarité, $f(ae_1 + be_2) = af(e_1) + bf(e_2)$.',
        correction: [`$${a}${vec(u)} ${b < 0 ? '-' : '+'} ${Math.abs(b)}${vec(v)} = ${vec(w)}$`],
      };
    },
    // Linéaire ou non ?
    (rng) => {
      const [f, v, why] = rng.pick(LINEAIRE_OU_NON);
      return vraiFaux(`L’application $${f}$ est linéaire.`, v, [why], 'Vérifie $f(\\lambda x + y) = \\lambda f(x) + f(y)$, ou cherche un contre-exemple (par exemple $f(0) \\neq 0$).');
    },
    // Image d'un polynôme par P ↦ P(X + 1) ou P ↦ P'.
    (rng) => {
      const p = [rng.nonZero(-3, 3), rng.int(-4, 4), rng.int(-4, 4)];
      const shift = rng.next() < 0.5;
      const img = shift ? [p[0], 2 * p[0] + p[1], p[0] + p[1] + p[2]] : [0, 2 * p[0], p[1]];
      const k = rng.int(shift ? 0 : 1, 2);
      return {
        prompt: `$f : P \\mapsto ${shift ? 'P(X + 1)' : "P'"}$ sur $\\mathbb{R}_2[X]$. Quel est ${['le coefficient de $X^2$', 'le coefficient de $X$', 'le terme constant'][k]} de $f(${poly(p, 'X')})$ ?`,
        answer: num(img[k]),
        hint: shift ? 'Développe $a(X + 1)^2 + b(X + 1) + c$.' : 'Dérive terme à terme.',
        correction: [`$f(P) = ${poly(img.slice(shift ? 0 : 1), 'X')}$`],
      };
    },
  ],
  'l1-rang-noyau': [
    // Théorème du rang.
    (rng) => {
      const n = rng.int(2, 8);
      const r = rng.int(0, n);
      const askKer = rng.next() < 0.5;
      return {
        prompt: askKer
          ? `$f$ est linéaire de $\\mathbb{R}^${n}$ dans $\\mathbb{R}^{${n + rng.int(0, 3)}}$, de rang $${r}$. Quelle est la dimension de $\\ker f$ ?`
          : `$f$ est linéaire de $\\mathbb{R}^${n}$ dans un espace de dimension finie, et $\\dim \\ker f = ${n - r}$. Quel est le rang de $f$ ?`,
        answer: num(askKer ? n - r : r),
        hint: 'Théorème du rang : $\\dim E = \\dim \\ker f + \\operatorname{rg} f$.',
        correction: [`$${n} = ${n - r} + ${r}$`],
      };
    },
    (rng) => vraiFauxBanque(rng, LINEAIRES),
    // Dérivation sur ℝ_n[X].
    (rng) => {
      const n = rng.int(2, 7);
      const k = rng.int(1, Math.min(3, n));
      const askKer = rng.next() < 0.5;
      return {
        prompt: `$D_${k} : P \\mapsto P^{(${k})}$ sur $\\mathbb{R}_{${n}}[X]$. Quel est ${askKer ? 'la dimension de son noyau' : 'son rang'} ?`,
        answer: num(askKer ? k : n + 1 - k),
        hint: `Le noyau est formé des polynômes de degré $< ${k}$.`,
        correction: [`$\\ker D_${k} = \\mathbb{R}_{${k - 1}}[X]$, de dimension $${k}$.`, `Rang : $${n + 1} - ${k} = ${n + 1 - k}$`],
      };
    },
  ],
  'l1-matrice-application': [
    // Transformations géométriques du plan.
    (rng) => {
      const pool: [string, number[][]][] = [
        ['la rotation d’angle $\\frac{\\pi}{2}$', [[0, -1], [1, 0]]],
        ['la rotation d’angle $\\pi$', [[-1, 0], [0, -1]]],
        ['la symétrie par rapport à l’axe des abscisses', [[1, 0], [0, -1]]],
        ['la symétrie par rapport à la droite $y = x$', [[0, 1], [1, 0]]],
        ['la projection sur l’axe des abscisses parallèlement à l’axe des ordonnées', [[1, 0], [0, 0]]],
        ['l’homothétie de rapport $3$', [[3, 0], [0, 3]]],
        ['la rotation d’angle $-\\frac{\\pi}{2}$', [[0, 1], [-1, 0]]],
      ];
      const [name, M] = rng.pick(pool);
      const [i, j] = [rng.int(0, 1), rng.int(0, 1)];
      return {
        prompt: `Quel est le coefficient ${ORD[i]} ligne, ${ORD[j]} colonne de la matrice, dans la base canonique, de ${name} ?`,
        answer: num(M[i][j]),
        hint: 'Les colonnes sont les images de $e_1 = (1, 0)$ et $e_2 = (0, 1)$.',
        correction: [`La matrice est $${mat(M)}$.`],
      };
    },
    // P ↦ P(X + 1) sur ℝ_n[X].
    (rng) => {
      const n = rng.int(2, 4);
      const i = rng.int(0, n);
      const j = rng.int(i, n);
      return {
        prompt: `$f : P \\mapsto P(X + 1)$ sur $\\mathbb{R}_{${n}}[X]$, base $(1, X, \\dots, X^{${n}})$. Quel est le coefficient de la matrice de $f$ en ligne $${i + 1}$, colonne $${j + 1}$ ?`,
        answer: num(binom(j, i)),
        hint: 'La colonne $j + 1$ contient les coordonnées de $(X + 1)^j$.',
        correction: [`$(X + 1)^{${j}}$ a pour coefficient de $X^{${i}}$ : $\\binom{${j}}{${i}} = ${binom(j, i)}$`],
      };
    },
    // Matrice d'une composée.
    (rng) => {
      const A = [[rng.int(-3, 3), rng.int(-3, 3)], [rng.int(-3, 3), rng.int(-3, 3)]];
      const B = [[rng.int(-3, 3), rng.int(-3, 3)], [rng.int(-3, 3), rng.int(-3, 3)]];
      const C = matMul(A, B);
      const [i, j] = [rng.int(0, 1), rng.int(0, 1)];
      return {
        prompt: `$f$ et $g$ ont pour matrices $A = ${mat(A)}$ et $B = ${mat(B)}$ dans la base canonique. Quel est le coefficient ${ORD[i]} ligne, ${ORD[j]} colonne de la matrice de $f \\circ g$ ?`,
        answer: num(C[i][j]),
        hint: 'La matrice de $f \\circ g$ est $AB$ (dans cet ordre).',
        correction: [`$AB = ${mat(C)}$`],
      };
    },
  ],
  'l1-changement-base': [
    // Coordonnées anciennes à partir des nouvelles.
    (rng) => {
      const P = [[rng.int(-2, 2), rng.int(-2, 2)], [rng.int(-2, 2), rng.int(-2, 2)]];
      while (P[0][0] * P[1][1] - P[0][1] * P[1][0] === 0) P[1][1]++;
      const X = [rng.int(-4, 4), rng.int(-4, 4)];
      const Y = [P[0][0] * X[0] + P[0][1] * X[1], P[1][0] * X[0] + P[1][1] * X[1]];
      return {
        prompt: `La nouvelle base $(e'_1, e'_2)$ a pour matrice de passage $P = ${mat(P)}$ depuis la base canonique. Un vecteur a pour coordonnées $${vec(X)}$ dans la nouvelle base. Donne ses coordonnées dans la base canonique.`,
        answer: pairOf(Y[0], Y[1], ['x', 'y']),
        hint: 'Les colonnes de $P$ sont les $e\'_j$ : anciennes coordonnées $= P \\times$ nouvelles.',
        correction: [`$${mat(P)}${vec(X)} = ${vec(Y)}$`],
      };
    },
    (rng) => qcmBanque(rng, LINEAIRES, rng.next() < 0.5),
    // Invariants de similitude.
    (rng) => {
      const A = [[rng.int(-4, 4), rng.int(-4, 4)], [rng.int(-4, 4), rng.int(-4, 4)]];
      const askDet = rng.next() < 0.5;
      const v = askDet ? A[0][0] * A[1][1] - A[0][1] * A[1][0] : A[0][0] + A[1][1];
      return {
        prompt: `Un endomorphisme $u$ a pour matrice $${mat(A)}$ dans une base $\\mathcal{B}$, et $B$ dans une autre base $\\mathcal{B}'$. Que vaut ${askDet ? '$\\det B$' : '$\\operatorname{tr} B$'} ?`,
        answer: num(v),
        hint: '$B = P^{-1}AP$ : la trace et le déterminant ne dépendent pas de la base.',
        correction: [`${askDet ? '$\\det B = \\det A' : '$\\operatorname{tr} B = \\operatorname{tr} A'} = ${v}$`],
      };
    },
  ],
  'l1-noyau-forme-lineaire': [
    // Formes linéaires sur ℝ_2[X].
    (rng) => {
      const b = rng.int(-5, 5);
      const kind = rng.pick(['eval', 'int'] as const);
      const t = rng.int(-2, 3);
      const c = kind === 'eval' ? F(-(t * t) - b * t) : F(-1, 3);
      return {
        prompt:
          kind === 'eval'
            ? `$\\varphi(P) = P(${t})$ sur $\\mathbb{R}_2[X]$. Pour quelle valeur de $c$ le polynôme $${poly([1, b, 0], 'X')} + c$ est-il dans le noyau de $\\varphi$ ?`
            : '$\\varphi(P) = \\displaystyle\\int_0^1 P(t)\\,dt$ sur $\\mathbb{R}_2[X]$. Pour quelle valeur de $c$ le polynôme $X^2 + c$ est-il dans le noyau de $\\varphi$ ?',
        answer: numF(c),
        hint: 'Il faut $\\varphi(P) = 0$.',
        correction: [kind === 'eval' ? `$${t * t + b * t} + c = 0$, donc $c = ${tex(c)}$.` : '$\\frac{1}{3} + c = 0$, donc $c = -\\frac{1}{3}$.'],
      };
    },
    // Dimension du noyau d'une forme linéaire non nulle.
    (rng) => {
      const n = rng.int(2, 6);
      const where = rng.pick([`\\mathbb{R}^{${n}}`, `\\mathbb{R}_{${n - 1}}[X]`, `\\mathcal{M}_{${n}}(\\mathbb{R})`]);
      const dim = where.startsWith('\\mathcal') ? n * n : n;
      return {
        prompt: `$\\varphi$ est une forme linéaire non nulle sur $${where}$. Quelle est la dimension de son noyau (un hyperplan) ?`,
        answer: num(dim - 1),
        hint: 'Une forme linéaire non nulle est de rang $1$.',
        correction: [`$\\dim \\ker \\varphi = ${dim} - 1 = ${dim - 1}$`],
      };
    },
  ],
};

export const BANQUES_APPLICATIONS_LINEAIRES = { LINEAIRES };
