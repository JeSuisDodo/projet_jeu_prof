import { type Fait, type Variantes, qcmBanque, vraiFaux, vraiFauxBanque } from '../../licenceVariantes';
import { F, conjugate, det2, det3, diag, fixedChoice, mat, matMul, num, numF, pairOf, par, poly, setOf, tex, trace, unimodular } from '../util';

/**
 * Variantes des chapitres d'algèbre linéaire de L2 : déterminants, éléments propres, diagonalisation
 * (feuilles bibmath « Groupe symétrique et déterminant », « Réduction des endomorphismes »).
 */

const ORD = ['première', 'deuxième', 'troisième'];

const DETERMINANTS: Fait[] = [
  { s: 'Échanger deux lignes d’une matrice change son déterminant en son opposé.', v: true, why: 'Le déterminant est alterné.' },
  { s: 'Ajouter à une ligne un multiple d’une autre ligne ne change pas le déterminant.', v: true, why: 'Par linéarité, on ajoute un déterminant à deux lignes proportionnelles, donc nul.' },
  { s: 'Multiplier une ligne par $3$ multiplie le déterminant par $3$.', v: true, why: 'Le déterminant est linéaire par rapport à chaque ligne.' },
  { s: '$\\det(3A) = 3\\det A$ pour $A \\in \\mathcal{M}_n(\\mathbb{R})$, $n \\geq 2$.', v: false, why: 'Chacune des $n$ lignes est multipliée par $3$ : $\\det(3A) = 3^n\\det A$.' },
  { s: '$\\det(A + B) = \\det A + \\det B$.', v: false, why: '$\\det(I_2 + I_2) = 4 \\neq 2$.' },
  { s: '$\\det({}^tA) = \\det A$.', v: true, why: 'Le déterminant est invariant par transposition.' },
  { s: 'Si deux colonnes de $A$ sont égales, $\\det A = 0$.', v: true, why: 'Le déterminant est alterné : les colonnes sont liées.' },
  { s: 'Si $\\det A = 0$, alors $A$ a une ligne nulle.', v: false, why: '$\\begin{pmatrix}1 & 1 \\\\ 1 & 1\\end{pmatrix}$ a un déterminant nul sans ligne nulle.' },
  { s: 'Si $A$ est antisymétrique de taille $3$, alors $\\det A = 0$.', v: true, why: '$\\det A = \\det({}^tA) = \\det(-A) = (-1)^3\\det A$.' },
  { s: 'Deux matrices semblables ont le même déterminant.', v: true, why: '$\\det(P^{-1}AP) = \\det P^{-1}\\det A\\det P = \\det A$.' },
];

const REDUCTION: Fait[] = [
  { s: 'Une matrice de $\\mathcal{M}_n(\\mathbb{R})$ qui a $n$ valeurs propres distinctes est diagonalisable.', v: true, why: 'Les vecteurs propres associés forment une famille libre de $n$ vecteurs.' },
  { s: 'Une matrice diagonalisable a forcément des valeurs propres distinctes.', v: false, why: '$I_n$ est diagonale, avec une seule valeur propre.' },
  { s: 'Toute matrice symétrique réelle est diagonalisable.', v: true, why: 'C’est le théorème spectral.' },
  { s: '$\\begin{pmatrix}1 & 1 \\\\ 0 & 1\\end{pmatrix}$ est diagonalisable.', v: false, why: 'Sa seule valeur propre est $1$ et $E_1$ est de dimension $1 < 2$.' },
  { s: 'Une matrice et sa transposée ont le même polynôme caractéristique.', v: true, why: '$\\det({}^tA - XI) = \\det({}^t(A - XI)) = \\det(A - XI)$.' },
  { s: '$0$ est valeur propre de $A$ si et seulement si $A$ n’est pas inversible.', v: true, why: '$\\ker A \\neq \\{0\\} \\iff \\det A = 0$.' },
  { s: 'Si $\\lambda$ est valeur propre de $A$, alors $\\lambda^2$ est valeur propre de $A^2$.', v: true, why: 'Si $Av = \\lambda v$, alors $A^2v = \\lambda^2v$.' },
  { s: 'Les valeurs propres de $A + B$ sont les sommes d’une valeur propre de $A$ et d’une de $B$.', v: false, why: 'Avec $A = \\begin{pmatrix}0 & 1 \\\\ 0 & 0\\end{pmatrix}$, $B = {}^tA$ : $A$, $B$ n’ont que $0$ mais $A + B$ a $\\pm 1$.' },
  { s: 'La somme des valeurs propres (avec multiplicité, dans $\\mathbb{C}$) est égale à la trace.', v: true, why: 'Coefficient de $X^{n-1}$ dans le polynôme caractéristique.' },
  { s: 'Une matrice nilpotente non nulle est diagonalisable.', v: false, why: 'Sa seule valeur propre est $0$ ; diagonalisable, elle serait nulle.' },
  { s: 'Une matrice de rotation d’angle $\\frac{\\pi}{2}$ est diagonalisable dans $\\mathbb{R}$.', v: false, why: 'Son polynôme caractéristique $X^2 + 1$ n’a pas de racine réelle.' },
  { s: 'Si $A^2 = A$, alors $A$ est diagonalisable.', v: true, why: '$X^2 - X = X(X - 1)$ est scindé à racines simples et annule $A$.' },
];

export const ALGEBRE_L2_VARIANTES: Variantes = {
  'l2-det-2x2': [
    // Aire d'un parallélogramme.
    (rng) => {
      let u: number[];
      let v: number[];
      do {
        u = [rng.int(-5, 5), rng.int(-5, 5)];
        v = [rng.int(-5, 5), rng.int(-5, 5)];
      } while (u[0] * v[1] - u[1] * v[0] === 0);
      const d = u[0] * v[1] - u[1] * v[0];
      const tri = rng.next() < 0.4;
      return {
        prompt: tri
          ? `Quelle est l’aire du triangle $OAB$ avec $A(${u[0]}, ${u[1]})$ et $B(${v[0]}, ${v[1]})$ ?`
          : `Quelle est l’aire du parallélogramme construit sur $\\vec u = (${u[0]}, ${u[1]})$ et $\\vec v = (${v[0]}, ${v[1]})$ ?`,
        answer: numF(F(Math.abs(d), tri ? 2 : 1)),
        hint: 'L’aire du parallélogramme est $|\\det(\\vec u, \\vec v)|$ ; celle du triangle en est la moitié.',
        correction: [`$\\det = ${u[0]}\\times${par(v[1])} - ${par(u[1])}\\times${par(v[0])} = ${d}$`, `Aire : $${tex(F(Math.abs(d), tri ? 2 : 1))}$`],
      };
    },
    (rng) => vraiFauxBanque(rng, DETERMINANTS),
  ],
  'l2-det-3x3': [
    // Volume d'un parallélépipède.
    (rng) => {
      let M: number[][];
      do M = Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => rng.int(-3, 3)));
      while (det3(M) === 0);
      const d = det3(M);
      return {
        prompt: `Quel est le volume du parallélépipède construit sur $\\vec u = (${M[0].join(', ')})$, $\\vec v = (${M[1].join(', ')})$ et $\\vec w = (${M[2].join(', ')})$ ?`,
        answer: num(Math.abs(d)),
        hint: 'Le volume est la valeur absolue du déterminant des trois vecteurs.',
        correction: [`$\\det(\\vec u, \\vec v, \\vec w) = ${d}$`, `Volume : $${Math.abs(d)}$`],
      };
    },
    // Matrice à lignes liées : le déterminant est nul.
    (rng) => {
      const a = [rng.int(-4, 4), rng.int(-4, 4), rng.int(-4, 4)];
      const b = [rng.int(-4, 4), rng.int(-4, 4), rng.int(-4, 4)];
      const k = rng.nonZero(-2, 2);
      const l = rng.nonZero(-2, 2);
      const c = a.map((x, i) => k * x + l * b[i]);
      const rows = rng.shuffle([a, b, c]);
      return {
        prompt: `Calcule le déterminant de $${mat(rows)}$ (cherche une astuce avant de développer).`,
        answer: num(det3(rows)),
        hint: 'Une ligne est-elle combinaison linéaire des deux autres ?',
        correction: [`L’une des lignes vaut ${k === 1 ? '' : `$${k}$ fois `}une autre ${l < 0 ? 'moins' : 'plus'} ${Math.abs(l) === 1 ? '' : `$${Math.abs(l)}$ fois `}la troisième.`, 'Les lignes sont liées : le déterminant est nul.'],
      };
    },
    // Déterminant triangulaire par blocs.
    (rng) => {
      const A = [[rng.int(-4, 4), rng.int(-4, 4)], [rng.int(-4, 4), rng.int(-4, 4)]];
      const c = rng.nonZero(-4, 4);
      const M = [[A[0][0], A[0][1], rng.int(-5, 5)], [A[1][0], A[1][1], rng.int(-5, 5)], [0, 0, c]];
      return {
        prompt: `Calcule le déterminant de $${mat(M)}$.`,
        answer: num(det3(M)),
        hint: 'Développe selon la dernière ligne.',
        correction: [`$\\det = ${par(c)} \\times ${par(det2(A))} = ${det3(M)}$`],
      };
    },
  ],
  'l2-det-proprietes': [
    // Opérations élémentaires.
    (rng) => {
      const d = rng.nonZero(-6, 6);
      const k = rng.pick([2, 3, -1, -2]);
      const ops = [
        { t: 'en échangeant ses deux premières lignes', v: -d, why: 'Un échange change le signe.' },
        { t: `en ajoutant à sa première ligne $${k}$ fois la deuxième`, v: d, why: 'Une transvection ne change pas le déterminant.' },
        { t: `en multipliant sa troisième ligne par $${k}$`, v: k * d, why: `Linéarité par rapport à la troisième ligne : facteur $${k}$.` },
        { t: 'en permutant circulairement ses trois lignes', v: d, why: 'Une permutation circulaire de $3$ éléments est paire (deux échanges).' },
        { t: `en multipliant toute la matrice par $${k}$`, v: k ** 3 * d, why: `Chacune des trois lignes est multipliée : $${par(k)}^3$.` },
      ];
      const o = rng.pick(ops);
      return {
        prompt: `$A \\in \\mathcal{M}_3(\\mathbb{R})$ a pour déterminant $${d}$. On obtient $B$ ${o.t}. Que vaut $\\det B$ ?`,
        answer: num(o.v),
        hint: 'Le déterminant est multilinéaire et alterné par rapport aux lignes.',
        correction: [o.why, `$\\det B = ${o.v}$`],
      };
    },
    (rng) => qcmBanque(rng, DETERMINANTS, rng.next() < 0.5),
  ],
  'l2-det-parametre': [
    // (m − 1)²(m + 2).
    (rng) => {
      const a = rng.int(1, 3);
      // [[m, a, a], [a, m, a], [a, a, m]] : det = (m − a)²(m + 2a).
      return {
        prompt: `Pour quelles valeurs de $m$ la matrice $${mat([[0, a, a], [a, 0, a], [a, a, 0]]).replace(/^\\begin\{pmatrix\}0/, '\\begin{pmatrix}m').replace(/ & 0 & /, ' & m & ').replace(/ & 0\\end/, ' & m\\end')}$ n’est-elle pas inversible ?`,
        answer: setOf([a, -2 * a]),
        hint: 'Ajoute toutes les colonnes à la première, puis factorise.',
        correction: [`$\\det = (m + ${2 * a})(m - ${a})^2$`, `Non inversible pour $m \\in \\{${a}\\,;\\,${-2 * a}\\}$.`],
      };
    },
    // [[m, k], [k, m]].
    (rng) => {
      const k = rng.int(1, 7);
      const s = rng.int(-3, 3);
      return {
        prompt: `Pour quelles valeurs de $m$ la matrice $\\begin{pmatrix}${poly([1, s], 'm')} & ${k} \\\\ ${k} & ${poly([1, s], 'm')}\\end{pmatrix}$ n’est-elle pas inversible ?`,
        answer: setOf([k - s, -k - s]),
        hint: '$\\det = (m + s)^2 - k^2$ : différence de deux carrés.',
        correction: [`$(${poly([1, s], 'm')})^2 = ${k * k} \\iff ${poly([1, s], 'm')} = \\pm ${k}$`, `$m \\in \\{${k - s}\\,;\\,${-k - s}\\}$`],
      };
    },
  ],
  'l2-det-inverse': [
    // Cramer.
    (rng) => {
      let A: number[][];
      do A = [[rng.int(-4, 4), rng.int(-4, 4)], [rng.int(-4, 4), rng.int(-4, 4)]];
      while (det2(A) === 0);
      const b = [rng.int(-6, 6), rng.int(-6, 6)];
      const d = det2(A);
      const askX = rng.next() < 0.5;
      const dx = det2([[b[0], A[0][1]], [b[1], A[1][1]]]);
      const dy = det2([[A[0][0], b[0]], [A[1][0], b[1]]]);
      const lin = (r: number[]) => `${poly([r[0], 0])} ${r[1] < 0 ? '-' : '+'} ${Math.abs(r[1]) === 1 ? '' : Math.abs(r[1])}y`.replace(/^0 [+-] /, (m) => (m.includes('-') ? '-' : '')).replace(/ [+-] 0y$/, '');
      return {
        prompt: `Avec les formules de Cramer, résous $\\begin{cases} ${lin(A[0])} &= ${b[0]} \\\\ ${lin(A[1])} &= ${b[1]} \\end{cases}$ et donne $${askX ? 'x' : 'y'}$.`,
        answer: numF(F(askX ? dx : dy, d)),
        hint: `$${askX ? 'x' : 'y'} = \\frac{\\det A_${askX ? 'x' : 'y'}}{\\det A}$, où l’on remplace la colonne ${askX ? 'de $x$' : 'de $y$'} par le second membre.`,
        correction: [`$\\det A = ${d}$, $\\det A_${askX ? 'x' : 'y'} = ${askX ? dx : dy}$`, `$${askX ? 'x' : 'y'} = ${tex(F(askX ? dx : dy, d))}$`],
      };
    },
    // det(A⁻¹), det(adj).
    (rng) => {
      const d = rng.nonZero(-6, 6);
      const n = rng.int(2, 4);
      const askCom = rng.next() < 0.5;
      // det(com A) = det(A)^{n−1}.
      return {
        prompt: askCom ? `$A \\in \\mathcal{M}_${n}(\\mathbb{R})$ a pour déterminant $${d}$. Calcule $\\det(\\mathrm{com}\\,A)$.` : `$A \\in \\mathcal{M}_${n}(\\mathbb{R})$ a pour déterminant $${d}$. Calcule $\\det(A^{-1})$.`,
        answer: numF(askCom ? F(d ** (n - 1)) : F(1, d)),
        hint: askCom ? '$A\\,{}^t\\mathrm{com}(A) = \\det(A)I_n$ : prends le déterminant.' : '$\\det(A)\\det(A^{-1}) = \\det I = 1$.',
        correction: [askCom ? `$\\det(A)\\det(\\mathrm{com}\\,A) = \\det(A)^{${n}}$, donc $\\det(\\mathrm{com}\\,A) = ${par(d)}^{${n - 1}} = ${d ** (n - 1)}$` : `$\\det(A^{-1}) = ${tex(F(1, d))}$`],
      };
    },
  ],
  'l2-det-vandermonde': [
    // Paramètre qui annule un Vandermonde.
    (rng) => {
      const a = rng.int(-3, 2);
      const b = a + rng.int(1, 3);
      return {
        prompt: `Pour quelles valeurs de $m$ le déterminant $\\begin{vmatrix} 1 & 1 & 1 \\\\ ${a} & ${b} & m \\\\ ${a * a} & ${b * b} & m^2\\end{vmatrix}$ est-il nul ?`,
        answer: setOf([a, b]),
        hint: 'C’est un Vandermonde : il vaut $(b - a)(m - a)(m - b)$.',
        correction: [`$\\det = ${b - a}(m - ${par(a)})(m - ${par(b)})$`, `Nul pour $m \\in \\{${a}\\,;\\,${b}\\}$.`],
      };
    },
    // Interpolation de Lagrange : unicité.
    (rng) => {
      const xs = rng.shuffle([-2, -1, 0, 1, 2, 3]).slice(0, 3);
      const distinct = rng.next() < 0.6;
      if (!distinct) xs[2] = xs[0];
      return vraiFaux(
        `Il existe un unique polynôme $P$ de degré au plus $2$ tel que $P(${xs[0]}) = 1$, $P(${xs[1]}) = 2$ et $P(${xs[2]}) = ${distinct ? 3 : 4}$.`,
        distinct,
        [distinct ? 'Les abscisses sont distinctes : le système a pour déterminant un Vandermonde non nul.' : `On impose deux valeurs différentes en $${xs[0]}$ : c’est impossible.`],
        'Le système linéaire en les coefficients de $P$ a pour matrice un Vandermonde.',
      );
    },
  ],
  'l2-polynome-caracteristique': [
    // Trace et déterminant d'une 3 × 3.
    (rng) => {
      const M = Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => rng.int(-3, 3)));
      const askTr = rng.next() < 0.5;
      return {
        prompt: `$\\chi_A(X) = \\det(XI_3 - A) = X^3 + aX^2 + bX + c$ pour $A = ${mat(M)}$. Que vaut $${askTr ? 'a' : 'c'}$ ?`,
        answer: num(askTr ? -trace(M) : -det3(M)),
        hint: 'Pour une matrice $3 \\times 3$ : $a = -\\mathrm{tr}(A)$ et $c = -\\det A$.',
        correction: [askTr ? `$a = -\\mathrm{tr}(A) = ${-trace(M)}$` : `$c = \\chi_A(0) = \\det(-A) = -\\det A = ${-det3(M)}$`],
      };
    },
    (rng) => vraiFauxBanque(rng, REDUCTION),
  ],
  'l2-valeurs-propres-2x2': [
    // Matrice symétrique [[a, b], [b, a]].
    (rng) => {
      const a = rng.int(-4, 4);
      const b = rng.nonZero(-4, 4);
      return {
        prompt: `Quelles sont les valeurs propres de $${mat([[a, b], [b, a]])}$ ?`,
        answer: setOf([a + b, a - b]),
        hint: 'Teste les vecteurs $(1, 1)$ et $(1, -1)$.',
        correction: [`$A(1, 1) = ${a + b}(1, 1)$ et $A(1, -1) = ${a - b}(1, -1)$`],
      };
    },
    // Rang 1.
    (rng) => {
      const u = [rng.int(-3, 3), rng.nonZero(-3, 3)];
      const v = [rng.nonZero(-3, 3), rng.int(-3, 3)];
      const M = u.map((x) => v.map((y) => x * y));
      const t = trace(M);
      return {
        prompt: `Quelles sont les valeurs propres de $${mat(M)}$ ?`,
        answer: setOf(t === 0 ? [0] : [0, t]),
        hint: 'La matrice est de rang $1$ : $0$ est valeur propre, et l’autre vaut la trace.',
        correction: [`Les lignes sont proportionnelles : $\\det = 0$.`, `L’autre valeur propre est $\\mathrm{tr}(A) = ${t}$.`],
      };
    },
  ],
  'l2-valeurs-propres-triangulaire': [
    // Valeurs propres de A² ou A⁻¹ d'une triangulaire.
    (rng) => {
      const d = rng.shuffle([-3, -2, -1, 1, 2, 3]).slice(0, 3);
      const T = [[d[0], rng.int(-4, 4), rng.int(-4, 4)], [0, d[1], rng.int(-4, 4)], [0, 0, d[2]]];
      const sq = rng.next() < 0.5;
      return {
        prompt: `Quelles sont les valeurs propres de $${sq ? 'T^2' : 'T^{-1}'}$ pour $T = ${mat(T)}$ ?`,
        answer: setOf(d.map((x) => (sq ? F(x * x) : F(1, x)))),
        hint: `$${sq ? 'T^2' : 'T^{-1}'}$ est encore triangulaire ; ses coefficients diagonaux sont ${sq ? 'les carrés' : 'les inverses'} de ceux de $T$.`,
        correction: [`$\\{${d.map((x) => (sq ? x * x : tex(F(1, x)))).join(',\\,')}\\}$`],
      };
    },
    // Multiplicité.
    (rng) => {
      const l = rng.int(-3, 3);
      const other = l + rng.nonZero(-2, 2);
      const T = [[l, rng.int(-3, 3), rng.int(-3, 3)], [0, other, rng.int(-3, 3)], [0, 0, l]];
      return {
        prompt: `Quelle est la multiplicité de $${l}$ comme racine du polynôme caractéristique de $${mat(T)}$ ?`,
        answer: num(2),
        hint: 'Le polynôme caractéristique d’une matrice triangulaire se lit sur la diagonale.',
        correction: [`$\\chi(X) = (X - ${par(l)})^2(X - ${par(other)})$ : multiplicité $2$.`],
      };
    },
  ],
  'l2-vecteur-propre': [
    // Compléter un vecteur propre.
    (rng) => {
      const { P, Pinv } = unimodular(rng);
      const l1 = rng.int(-3, 3);
      let l2 = rng.int(-3, 3);
      while (l2 === l1) l2 = rng.int(-3, 3);
      const A = conjugate(P, Pinv, diag([l1, l2]));
      const v = [P[0][0], P[1][0]];
      return {
        prompt: `$A = ${mat(A)}$. Le vecteur $${mat([[v[0]], [v[1]]])}$ est propre. Pour quelle valeur propre ?`,
        answer: num(l1),
        hint: 'Calcule $Av$ et compare à $v$.',
        correction: [`$Av = ${mat(matMul(A, [[v[0]], [v[1]]]))} = ${l1}\\,v$`],
      };
    },
    // Vrai/faux : vecteur propre ou non.
    (rng) => {
      const A = [[rng.int(-3, 3), rng.int(-3, 3)], [rng.int(-3, 3), rng.int(-3, 3)]];
      const v = [rng.int(-2, 2), rng.nonZero(-2, 2)];
      const Av = [A[0][0] * v[0] + A[0][1] * v[1], A[1][0] * v[0] + A[1][1] * v[1]];
      const propre = Av[0] * v[1] - Av[1] * v[0] === 0;
      return vraiFaux(`$${mat([[v[0]], [v[1]]])}$ est un vecteur propre de $${mat(A)}$.`, propre, [`$Av = ${mat([[Av[0]], [Av[1]]])}$, ${propre ? 'colinéaire' : 'non colinéaire'} à $v$.`], 'Un vecteur non nul est propre si $Av$ est colinéaire à $v$.');
    },
  ],
  'l2-trace-det-vp': [
    // 2 × 2 : valeurs propres par somme et produit.
    (rng) => {
      const l1 = rng.int(-5, 5);
      const l2 = rng.int(-5, 5);
      return {
        prompt: `Une matrice $A \\in \\mathcal{M}_2(\\mathbb{R})$ vérifie $\\mathrm{tr}(A) = ${l1 + l2}$ et $\\det A = ${l1 * l2}$. Quelles sont ses valeurs propres ?`,
        answer: setOf([l1, l2]),
        hint: 'Ce sont les racines de $X^2 - \\mathrm{tr}(A)X + \\det A$.',
        correction: [`$X^2 ${-(l1 + l2) < 0 ? '-' : '+'} ${Math.abs(l1 + l2)}X ${l1 * l2 < 0 ? '-' : '+'} ${Math.abs(l1 * l2)} = (X - ${par(l1)})(X - ${par(l2)})$`],
      };
    },
    // Trace et déterminant à partir du spectre.
    (rng) => {
      const sp = [rng.int(-3, 3), rng.int(-3, 3), rng.int(-3, 3)];
      const k = rng.int(2, 3);
      const askDet = rng.next() < 0.5;
      const v = askDet ? sp.reduce((p, x) => p * x ** k, 1) : sp.reduce((s, x) => s + x ** k, 0);
      return {
        prompt: `$A \\in \\mathcal{M}_3(\\mathbb{R})$ a pour valeurs propres $${sp.join(', ')}$ (avec multiplicité). Calcule $${askDet ? `\\det(A^{${k}})` : `\\mathrm{tr}(A^{${k}})`}$.`,
        answer: num(v),
        hint: `Les valeurs propres de $A^{${k}}$ sont les $\\lambda^{${k}}$.`,
        correction: [`$${sp.map((x) => `${par(x)}^{${k}}`).join(askDet ? ' \\times ' : ' + ')} = ${v}$`],
      };
    },
  ],
  'l2-spectre-polynome': [
    // Spectre de A⁻¹ ou de A + cI.
    (rng) => {
      const sp = rng.shuffle([-3, -2, -1, 1, 2, 4]).slice(0, 3);
      const inv = rng.next() < 0.5;
      const c = rng.nonZero(-3, 3);
      return {
        prompt: `Le spectre de $A$ est $\\{${sp.join('\\,;\\,')}\\}$. Quel est le spectre de $${inv ? 'A^{-1}' : `A ${c < 0 ? '-' : '+'} ${Math.abs(c)}I`}$ ?`,
        answer: setOf(sp.map((x) => (inv ? F(1, x) : F(x + c)))),
        hint: inv ? 'Si $Av = \\lambda v$, alors $A^{-1}v = \\frac{1}{\\lambda}v$.' : 'Si $Av = \\lambda v$, alors $(A + cI)v = (\\lambda + c)v$.',
        correction: [`$\\{${sp.map((x) => (inv ? tex(F(1, x)) : x + c)).join('\\,;\\,')}\\}$`],
      };
    },
    // Polynôme annulateur.
    (rng) => {
      const a = rng.int(-3, 2);
      const b = a + rng.int(1, 3);
      return {
        prompt: `$A$ vérifie $${poly([1, -(a + b), a * b], 'A')} = 0$. Quelles valeurs peuvent être valeurs propres de $A$ ?`.replace(' = 0$', a * b === 0 ? ' = 0$' : 'I = 0$'),
        answer: setOf([a, b]),
        hint: 'Toute valeur propre est racine d’un polynôme annulateur.',
        correction: [`Si $Av = \\lambda v$, alors $(\\lambda - ${par(a)})(\\lambda - ${par(b)})v = 0$.`, `Les valeurs propres possibles sont $${a}$ et $${b}$.`],
      };
    },
  ],
  'l2-diagonalisable': [
    (rng) => vraiFauxBanque(rng, REDUCTION),
    (rng) => qcmBanque(rng, REDUCTION, rng.next() < 0.5),
    // Triangulaire 2 × 2 : diagonalisable selon les coefficients.
    (rng) => {
      const a = rng.int(-3, 3);
      const d = rng.next() < 0.5 ? a : a + rng.nonZero(-2, 2);
      const b = rng.int(-3, 3);
      const ok = a !== d || b === 0;
      return {
        prompt: `La matrice $${mat([[a, b], [0, d]])}$ est-elle diagonalisable dans $\\mathbb{R}$ ?`,
        answer: fixedChoice(['Oui', 'Non'], ok ? 0 : 1),
        hint: 'Valeurs propres distinctes : oui. Une seule valeur propre : seulement si la matrice est déjà diagonale.',
        correction: [a !== d ? 'Deux valeurs propres distinctes : diagonalisable.' : b === 0 ? 'Elle est déjà diagonale.' : `Seule valeur propre $${a}$, et $A \\neq ${a}I$ : non diagonalisable.`],
      };
    },
  ],
  'l2-dim-sous-espace-propre': [
    // Rang de A − λI pour une matrice pleine.
    (rng) => {
      const n = rng.int(2, 4);
      const l = rng.int(-2, 3);
      const J = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? l + 1 : 1)));
      // J = (l)I + U où U pleine de 1 : valeurs propres l (mult. n − 1) et l + n.
      return {
        prompt: `$A = ${mat(J)}$. Quelle est la dimension du sous-espace propre $E_{${l}}(A)$ ?`,
        answer: num(n - 1),
        hint: `$A - ${par(l)}I$ est la matrice pleine de $1$ : quel est son rang ?`,
        correction: [`$A - ${par(l)}I$ est de rang $1$, donc $\\dim E_{${l}} = ${n} - 1 = ${n - 1}$.`],
      };
    },
    // Encadrement par la multiplicité.
    (rng) => {
      const m = rng.int(1, 4);
      const d = rng.int(1, m);
      return vraiFaux(
        `Une valeur propre de multiplicité algébrique $${m}$ peut avoir un sous-espace propre de dimension $${d === m ? m + 1 : d}$.`,
        d !== m,
        [`On a toujours $1 \\leq \\dim E_\\lambda \\leq ${m}$ (la multiplicité).`],
        '$1 \\leq \\dim E_\\lambda \\leq m(\\lambda)$.',
      );
    },
  ],
  'l2-puissance-matrice': [
    // Projecteur et symétrie.
    (rng) => {
      const { P, Pinv } = unimodular(rng, true);
      const sym = rng.next() < 0.5;
      const A = conjugate(P, Pinv, diag(sym ? [1, -1] : [1, 0]));
      const n = rng.int(sym ? 3 : 2, 30);
      const An = sym && n % 2 === 0 ? [[1, 0], [0, 1]] : A;
      const [i, j] = [rng.int(0, 1), rng.int(0, 1)];
      return {
        prompt: `$A = ${mat(A)}$ vérifie $A^2 = ${sym ? 'I' : 'A'}$. Quel est le coefficient ${ORD[i]} ligne, ${ORD[j]} colonne de $A^{${n}}$ ?`,
        answer: num(An[i][j]),
        hint: sym ? '$A^n = I$ si $n$ est pair, $A$ si $n$ est impair.' : 'Par récurrence, $A^n = A$ pour $n \\geq 1$.',
        correction: [`$A^{${n}} = ${sym && n % 2 === 0 ? 'I' : 'A'}$`],
      };
    },
    // Limite de A^n.
    (rng) => {
      const { P, Pinv } = unimodular(rng, true);
      const A2 = conjugate(P, Pinv, diag([2, 1]));
      const L = conjugate(P, Pinv, diag([1, 0]));
      const [i, j] = [rng.int(0, 1), rng.int(0, 1)];
      // A = (1/2)·A2 a pour valeurs propres 1 et 1/2.
      return {
        prompt: `$A = \\frac{1}{2}${mat(A2)}$ a pour valeurs propres $1$ et $\\frac{1}{2}$. Vers quoi tend le coefficient ${ORD[i]} ligne, ${ORD[j]} colonne de $A^n$ ?`,
        answer: num(L[i][j]),
        hint: '$A^n = P\\,\\mathrm{diag}(1, 2^{-n})P^{-1} \\to P\\,\\mathrm{diag}(1, 0)P^{-1}$.',
        correction: [`$\\lim A^n = ${mat(L)}$`],
      };
    },
  ],
  'l2-suite-recurrente-lineaire': [
    // Système couplé.
    (rng) => {
      const a = rng.int(1, 3);
      const b = rng.int(1, 3);
      const x0 = rng.int(0, 3);
      const y0 = rng.int(0, 3);
      const n = rng.int(3, 6);
      let [x, y] = [x0, y0];
      for (let k = 0; k < n; k++) [x, y] = [a * x + b * y, b * x + a * y];
      return {
        prompt: `$x_{n+1} = ${a === 1 ? '' : a}x_n + ${b === 1 ? '' : b}y_n$ et $y_{n+1} = ${b === 1 ? '' : b}x_n + ${a === 1 ? '' : a}y_n$, avec $x_0 = ${x0}$, $y_0 = ${y0}$. Calcule $x_{${n}} + y_{${n}}$.`,
        answer: num(x + y),
        hint: `$s_n = x_n + y_n$ est géométrique de raison $${a + b}$.`,
        correction: [`$s_{n+1} = ${a + b}s_n$, donc $s_{${n}} = ${a + b}^{${n}} \\times ${x0 + y0} = ${x + y}$`],
      };
    },
    // Matrice compagnon.
    (rng) => {
      const a = rng.int(-3, 3);
      const b = rng.int(-3, 3);
      return {
        prompt: `On écrit $u_{n+2} = ${a}u_{n+1} ${b < 0 ? '-' : '+'} ${Math.abs(b)}u_n$ sous la forme $X_{n+1} = AX_n$ avec $X_n = \\begin{pmatrix}u_{n+1} \\\\ u_n\\end{pmatrix}$. Donne $\\mathrm{tr}(A)$ et $\\det A$.`,
        answer: pairOf(a, -b, ['\\mathrm{tr}(A)', '\\det A']),
        hint: `$A = \\begin{pmatrix}a & b \\\\ 1 & 0\\end{pmatrix}$.`,
        correction: [`$A = ${mat([[a, b], [1, 0]])}$ : trace $${a}$, déterminant $${-b}$.`],
      };
    },
  ],
  'l2-cayley-hamilton': [
    // A³ en fonction de A et I.
    (rng) => {
      const A = [[rng.int(-2, 3), rng.int(-2, 2)], [rng.int(-2, 2), rng.int(-2, 3)]];
      const t = trace(A);
      const d = det2(A);
      // A² = tA − dI ; A³ = tA² − dA = (t² − d)A − tdI.
      return {
        prompt: `$A = ${mat(A)}$. D’après Cayley-Hamilton, $A^3 = pA + qI$. Donne $p$ et $q$.`,
        answer: pairOf(t * t - d, -t * d, ['p', 'q']),
        hint: '$A^2 = \\mathrm{tr}(A)A - \\det(A)I$, puis multiplie par $A$.',
        correction: [`$A^2 = ${t}A ${-d < 0 ? '-' : '+'} ${Math.abs(d)}I$`, `$A^3 = ${t}A^2 ${-d < 0 ? '-' : '+'} ${Math.abs(d)}A = ${t * t - d}A ${-t * d < 0 ? '-' : '+'} ${Math.abs(t * d)}I$`],
      };
    },
    // Inverse par Cayley-Hamilton.
    (rng) => {
      let A: number[][];
      do A = [[rng.int(-2, 3), rng.int(-2, 2)], [rng.int(-2, 2), rng.int(-2, 3)]];
      while (det2(A) === 0);
      const t = trace(A);
      const d = det2(A);
      return {
        prompt: `$A = ${mat(A)}$. D’après Cayley-Hamilton, $A^{-1} = pA + qI$. Donne $p$ et $q$.`,
        answer: pairOf(F(-1, d), F(t, d), ['p', 'q']),
        hint: '$A^2 - \\mathrm{tr}(A)A + \\det(A)I = 0$ : multiplie par $A^{-1}$.',
        correction: [`$A - ${par(t)}I + ${par(d)}A^{-1} = 0$`, `$A^{-1} = ${tex(F(-1, d))}A + ${tex(F(t, d)).startsWith('-') ? `(${tex(F(t, d))})` : tex(F(t, d))}I$`],
      };
    },
  ],
};

export const BANQUES_ALGEBRE_L2 = { DETERMINANTS, REDUCTION };
