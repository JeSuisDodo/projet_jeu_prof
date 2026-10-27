import { sumLatex } from '../../latex';
import { type Fait, type Variantes, qcmBanque, vraiFauxBanque } from '../../licenceVariantes';
import { F, coords, dot, mat, num, numF, pairOf, par, sub, tex } from '../util';

/**
 * Variantes des chapitres « Espaces euclidiens » et « Formes quadratiques » de L2
 * (feuilles bibmath « Espaces préhilbertiens », « Formes quadratiques »).
 */

const VARS = ['x', 'y', 'z'];

const EUCLIDIENS: Fait[] = [
  { s: 'Dans un espace euclidien, toute famille orthogonale de vecteurs non nuls est libre.', v: true, why: 'On fait le produit scalaire d’une combinaison nulle avec chaque vecteur.' },
  { s: 'Toute famille libre est orthogonale.', v: false, why: '$(1, 0)$ et $(1, 1)$ sont libres sans être orthogonaux.' },
  { s: 'Pour tous $u$, $v$ : $|\\langle u, v\\rangle| \\leq \\|u\\|\\,\\|v\\|$.', v: true, why: 'C’est l’inégalité de Cauchy-Schwarz.' },
  { s: 'Si $\\langle u, v\\rangle = 0$, alors $\\|u + v\\|^2 = \\|u\\|^2 + \\|v\\|^2$.', v: true, why: 'C’est le théorème de Pythagore : le terme $2\\langle u, v\\rangle$ disparaît.' },
  { s: '$\\|u + v\\| = \\|u\\| + \\|v\\|$ pour tous vecteurs $u$, $v$.', v: false, why: 'Seulement si $u$ et $v$ sont positivement liés ; sinon l’inégalité est stricte.' },
  { s: 'L’orthogonal d’un sous-espace $F$ de dimension $p$ dans un espace de dimension $n$ est de dimension $n - p$.', v: true, why: 'En dimension finie, $E = F \\oplus F^\\perp$.' },
  { s: 'Le projeté orthogonal $p_F(v)$ est le point de $F$ le plus proche de $v$.', v: true, why: 'Pythagore : $\\|v - w\\|^2 = \\|v - p_F(v)\\|^2 + \\|p_F(v) - w\\|^2$ pour $w \\in F$.' },
  { s: 'Une matrice orthogonale a un déterminant égal à $1$.', v: false, why: 'Son déterminant vaut $1$ ou $-1$ : une symétrie orthogonale a un déterminant $-1$.' },
  { s: 'Si $A$ est orthogonale, alors $A^{-1} = {}^tA$.', v: true, why: 'C’est la définition : ${}^tA\\,A = I_n$.' },
  { s: 'Le produit de deux matrices orthogonales est orthogonal.', v: true, why: '${}^t(AB)AB = {}^tB\\,{}^tA\\,A\\,B = I_n$.' },
  { s: 'La somme de deux matrices orthogonales est orthogonale.', v: false, why: '$I_2 + I_2 = 2I_2$ n’est pas orthogonale.' },
  { s: '$(f, g) \\mapsto \\int_0^1 f(t)g(t)\\,dt$ est un produit scalaire sur $\\mathcal{C}([0, 1], \\mathbb{R})$.', v: true, why: 'Bilinéaire, symétrique, positive, et définie car une fonction continue positive d’intégrale nulle est nulle.' },
  { s: '$(P, Q) \\mapsto P(0)Q(0)$ est un produit scalaire sur $\\mathbb{R}[X]$.', v: false, why: 'Il n’est pas défini : $\\langle X, X\\rangle = 0$ alors que $X \\neq 0$.' },
  { s: 'Toute famille orthonormée d’un espace euclidien se complète en une base orthonormée.', v: true, why: 'On complète en base puis on applique Gram-Schmidt.' },
];

const FORMES: Fait[] = [
  { s: 'Une forme quadratique définie positive est non dégénérée.', v: true, why: 'Si $q(x) > 0$ pour $x \\neq 0$, aucun vecteur non nul n’est dans le noyau.' },
  { s: 'Une forme quadratique non dégénérée est définie.', v: false, why: '$q(x, y) = x^2 - y^2$ est non dégénérée mais $q(1, 1) = 0$.' },
  { s: 'Les valeurs propres d’une matrice symétrique réelle sont réelles.', v: true, why: 'C’est une partie du théorème spectral.' },
  { s: 'Une matrice symétrique réelle est diagonalisable dans une base orthonormée.', v: true, why: 'C’est le théorème spectral.' },
  { s: 'Si la matrice d’une forme quadratique a tous ses coefficients positifs, la forme est positive.', v: false, why: '$q = x^2 + 4xy + y^2$ : $q(1, -1) = -2$.' },
  { s: '$q$ est définie positive si et seulement si toutes les valeurs propres de sa matrice sont strictement positives.', v: true, why: 'Dans une base orthonormée de vecteurs propres, $q = \\sum \\lambda_i x_i^2$.' },
  { s: 'La signature d’une forme quadratique ne dépend pas de la décomposition de Gauss choisie.', v: true, why: 'C’est la loi d’inertie de Sylvester.' },
  { s: 'Le rang d’une forme quadratique est égal à $p + q$ où $(p, q)$ est sa signature.', v: true, why: 'Le rang compte les carrés non nuls de la décomposition.' },
  { s: 'Pour une forme polaire $\\varphi$ : $\\varphi(x, y) = \\frac{1}{2}\\big(q(x + y) - q(x) - q(y)\\big)$.', v: true, why: 'On développe $q(x + y) = q(x) + 2\\varphi(x, y) + q(y)$.' },
  { s: 'Une forme quadratique positive qui s’annule en un vecteur non nul est nulle.', v: false, why: '$q = x^2$ sur $\\mathbb{R}^2$ s’annule en $(0, 1)$ sans être nulle.' },
  { s: '$q(x, y) = ax^2 + 2bxy + cy^2$ est définie positive si et seulement si $a > 0$ et $ac - b^2 > 0$.', v: true, why: 'C’est le critère des mineurs principaux en dimension 2.' },
  { s: '$q(x, y) = xy$ est de signature $(1, 1)$.', v: true, why: '$xy = \\frac{1}{4}(x + y)^2 - \\frac{1}{4}(x - y)^2$.' },
];

const qTex = (S: number[][]) => {
  const n = S.length;
  const terms: [number, string][] = [];
  for (let i = 0; i < n; i++) terms.push([S[i][i], `${VARS[i]}^2`]);
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) terms.push([2 * S[i][j], `${VARS[i]}${VARS[j]}`]);
  return sumLatex(terms);
};

const TRIPLES = [
  [3, 4, 5],
  [5, 12, 13],
  [8, 15, 17],
  [7, 24, 25],
];

export const EUCLIDIENS_L2_VARIANTES: Variantes = {
  'l2-produit-scalaire-integrale': [
    // Produit scalaire de deux monômes, sur [0, 1] ou sur [−1, 1].
    (rng, level) => {
      const p = rng.int(0, level + 2);
      const q = rng.int(1, level + 2);
      const sym = level > 1 && rng.next() < 0.5;
      const k = p + q;
      const value = sym ? (k % 2 === 0 ? F(2, k + 1) : F(0)) : F(1, k + 1);
      const a = sym ? -1 : 0;
      return {
        prompt: `Sur $\\mathbb{R}[t]$, $\\langle P, Q\\rangle = \\displaystyle\\int_{${a}}^1 P(t)Q(t)\\,dt$. Calcule $\\langle t^{${p}}, t^{${q}}\\rangle$.`,
        answer: numF(value),
        hint: sym ? 'Sur $[-1, 1]$, l’intégrale d’une puissance impaire est nulle.' : '$\\int_0^1 t^k\\,dt = \\frac{1}{k + 1}$.',
        correction: [`$\\langle t^{${p}}, t^{${q}}\\rangle = \\displaystyle\\int_{${a}}^1 t^{${k}}\\,dt = ${tex(value)}$`],
      };
    },
    (rng) => vraiFauxBanque(rng, EUCLIDIENS),
  ],
  'l2-orthogonalite-parametre': [
    // Rendre t^p + a orthogonal à t^q pour ∫₀¹.
    (rng, level) => {
      const p = rng.int(1, level + 1);
      const q = rng.int(0, level);
      // 1/(p+q+1) + a/(q+1) = 0
      const a = F(-(q + 1), p + q + 1);
      return {
        prompt: `Sur $\\mathbb{R}[t]$ muni de $\\langle P, Q\\rangle = \\displaystyle\\int_0^1 P(t)Q(t)\\,dt$, pour quelle valeur de $a$ le polynôme $t^{${p}} + a$ est-il orthogonal à $t^{${q}}$ ?`,
        answer: numF(a),
        hint: 'Écris $\\langle t^p + a, t^q\\rangle = 0$ et intègre terme à terme.',
        correction: [`$\\displaystyle\\int_0^1 (t^{${p + q}} + a\\,t^{${q}})\\,dt = \\frac{1}{${p + q + 1}} + \\frac{a}{${q + 1}} = 0$`, `$a = ${tex(a)}$`],
      };
    },
    (rng) => qcmBanque(rng, EUCLIDIENS),
  ],
  'l2-projection-orthogonale': [
    // Distance d'un point à un plan vectoriel.
    (rng) => {
      const n = [rng.int(-2, 2), rng.int(-2, 2), rng.nonZero(-2, 2)];
      const v = [rng.int(-3, 3), rng.int(-3, 3), rng.int(-3, 3)];
      const nv = dot(n, v);
      const nn = dot(n, n);
      const d2 = F(nv * nv, nn);
      return {
        prompt: `Dans $\\mathbb{R}^3$ euclidien usuel, $P$ est le plan d’équation $${sumLatex([[n[0], 'x'], [n[1], 'y'], [n[2], 'z']])} = 0$ et $v = ${coords(v)}$. Calcule $d(v, P)^2$.`,
        answer: numF(d2),
        hint: 'La distance au plan est la norme du projeté sur la normale $n$ : $d(v, P) = \\dfrac{|\\langle n, v\\rangle|}{\\|n\\|}$.',
        correction: [`$n = ${coords(n)}$, $\\langle n, v\\rangle = ${nv}$, $\\|n\\|^2 = ${nn}$`, `$d(v, P)^2 = \\dfrac{${nv * nv}}{${nn}} = ${tex(d2)}$`],
      };
    },
    (rng) => vraiFauxBanque(rng, EUCLIDIENS),
  ],
  'l2-gram-schmidt': [
    // Norme au carré du deuxième vecteur orthogonalisé.
    (rng, level) => {
      const b = level === 1 ? 2 : 3;
      let u1: number[];
      let u2: number[];
      do {
        u1 = [rng.int(-b, b), rng.int(-b, b), rng.int(-b, b)];
        u2 = [rng.int(-b, b), rng.int(-b, b), rng.int(-b, b)];
      } while (dot(u1, u1) === 0 || dot(u1, u2) === 0 || dot(u1, u2) ** 2 === dot(u1, u1) * dot(u2, u2));
      const n2 = sub(F(dot(u2, u2)), F(dot(u1, u2) ** 2, dot(u1, u1)));
      return {
        prompt: `Dans $\\mathbb{R}^3$ euclidien usuel, on orthogonalise $(u_1, u_2)$ avec $u_1 = ${coords(u1)}$ et $u_2 = ${coords(u2)}$ par Gram-Schmidt. Calcule $\\|v_2\\|^2$, où $v_2 = u_2 - \\dfrac{\\langle u_2, u_1\\rangle}{\\|u_1\\|^2}u_1$.`,
        answer: numF(n2),
        hint: 'Pythagore : $\\|v_2\\|^2 = \\|u_2\\|^2 - \\dfrac{\\langle u_2, u_1\\rangle^2}{\\|u_1\\|^2}$.',
        correction: [`$\\langle u_2, u_1\\rangle = ${dot(u1, u2)}$, $\\|u_1\\|^2 = ${dot(u1, u1)}$, $\\|u_2\\|^2 = ${dot(u2, u2)}$`, `$\\|v_2\\|^2 = ${dot(u2, u2)} - \\dfrac{${dot(u1, u2) ** 2}}{${dot(u1, u1)}} = ${tex(n2)}$`],
      };
    },
    (rng) => qcmBanque(rng, EUCLIDIENS, true),
  ],
  'l2-matrice-orthogonale': [
    // Compléter une matrice de rotation ou de symétrie.
    (rng) => {
      const [a, b, c] = rng.pick(TRIPLES);
      const rotation = rng.next() < 0.5;
      const s = rng.sign();
      // Rotation : [[a, −sb], [sb, a]] / c ; symétrie : [[a, sb], [sb, −a]] / c.
      const value = F(rotation ? -s * b : -a, c);
      const shown = rotation ? `\\begin{pmatrix}\\frac{${a}}{${c}} & x \\\\ ${tex(F(s * b, c))} & \\frac{${a}}{${c}}\\end{pmatrix}` : `\\begin{pmatrix}\\frac{${a}}{${c}} & ${tex(F(s * b, c))} \\\\ ${tex(F(s * b, c))} & x\\end{pmatrix}`;
      return {
        prompt: `Pour quelle valeur de $x$ la matrice $${shown}$ est-elle orthogonale ${rotation ? '(de déterminant $1$)' : '(de déterminant $-1$)'} ?`,
        answer: numF(value),
        hint: 'Les colonnes doivent être unitaires et orthogonales, et le signe du déterminant fixe le dernier choix.',
        correction: [`$${a}^2 + ${b}^2 = ${c}^2$ : chaque colonne est unitaire si $|x| = ${tex(F(Math.abs(value.n), value.d))}$.`, `L’orthogonalité des colonnes (et le déterminant) impose $x = ${tex(value)}$.`],
      };
    },
    (rng) => vraiFauxBanque(rng, EUCLIDIENS),
  ],
  'l2-matrice-forme-quadratique': [
    // Question inverse : de la matrice à la forme.
    (rng, level) => {
      const n = level === 1 ? 2 : 3;
      const S = Array.from({ length: n }, () => Array(n).fill(0));
      for (let i = 0; i < n; i++)
        for (let j = i; j < n; j++) {
          const v = i === j ? rng.int(-4, 4) : rng.nonZero(-4, 4);
          S[i][j] = v;
          S[j][i] = v;
        }
      const i = rng.int(0, n - 2);
      const j = rng.int(i + 1, n - 1);
      return {
        prompt: `La forme quadratique $q$ sur $\\mathbb{R}^${n}$ a pour matrice $S = ${mat(S)}$. Quel est le coefficient de $${VARS[i]}${VARS[j]}$ dans $q(${VARS.slice(0, n).join(', ')})$ ?`,
        answer: num(2 * S[i][j]),
        hint: '$q(X) = {}^tX\\,S\\,X$ : le terme $x_ix_j$ reçoit $S_{ij} + S_{ji} = 2S_{ij}$.',
        correction: [`$q = ${qTex(S)}$`, `Coefficient de $${VARS[i]}${VARS[j]}$ : $2 \\times ${par(S[i][j])} = ${2 * S[i][j]}$`],
      };
    },
    (rng) => vraiFauxBanque(rng, FORMES),
  ],
  'l2-forme-polaire': [
    // Identité de polarisation.
    (rng) => {
      const qu = rng.int(-6, 9);
      const qv = rng.int(-6, 9);
      const quv = rng.int(-10, 15);
      const phi = F(quv - qu - qv, 2);
      const moins = rng.next() < 0.5;
      // Variante q(u − v) : q(u − v) = q(u) − 2φ + q(v).
      const quMv = qu + qv - (quv - qu - qv);
      return {
        prompt: moins
          ? `$q$ est une forme quadratique de forme polaire $\\varphi$, avec $q(u) = ${qu}$, $q(v) = ${qv}$ et $q(u - v) = ${quMv}$. Calcule $\\varphi(u, v)$.`
          : `$q$ est une forme quadratique de forme polaire $\\varphi$, avec $q(u) = ${qu}$, $q(v) = ${qv}$ et $q(u + v) = ${quv}$. Calcule $\\varphi(u, v)$.`,
        answer: numF(phi),
        hint: moins ? '$q(u - v) = q(u) - 2\\varphi(u, v) + q(v)$.' : '$q(u + v) = q(u) + 2\\varphi(u, v) + q(v)$.',
        correction: moins
          ? [`$\\varphi(u, v) = \\frac{1}{2}\\big(q(u) + q(v) - q(u - v)\\big) = \\frac{1}{2}(${qu} + ${par(qv)} - ${par(quMv)}) = ${tex(phi)}$`]
          : [`$\\varphi(u, v) = \\frac{1}{2}\\big(q(u + v) - q(u) - q(v)\\big) = \\frac{1}{2}(${quv} - ${par(qu)} - ${par(qv)}) = ${tex(phi)}$`],
      };
    },
    (rng) => qcmBanque(rng, FORMES),
  ],
  'l2-signature': [
    // Signature à partir du spectre.
    (rng, level) => {
      const n = level === 1 ? 2 : 3;
      const vps = Array.from({ length: n }, () => rng.int(-5, 5));
      const p = vps.filter((x) => x > 0).length;
      const q = vps.filter((x) => x < 0).length;
      return {
        prompt: `La matrice symétrique d’une forme quadratique $Q$ sur $\\mathbb{R}^${n}$ a pour valeurs propres $${vps.join(',\\ ')}$. Donne la signature $(p, q)$ de $Q$.`,
        answer: pairOf(p, q, ['p', 'q']),
        hint: 'Dans une base orthonormée de vecteurs propres, $Q = \\sum \\lambda_i x_i^2$ : on compte les valeurs propres positives et négatives.',
        correction: [`$${p}$ valeur(s) propre(s) $> 0$, $${q}$ valeur(s) propre(s) $< 0$ : signature $(${p}, ${q})$.`],
      };
    },
    (rng) => vraiFauxBanque(rng, FORMES),
  ],
  'l2-forme-definie-positive': [
    // Seuil du paramètre pour être définie positive.
    (rng, level) => {
      const a = rng.int(1, level + 2);
      const b = rng.nonZero(-4, 4);
      // ac − b² > 0 ⇔ c > b²/a
      const c = Math.floor((b * b) / a) + 1;
      return {
        prompt: `Quel est le plus petit entier $c$ pour lequel $q(x, y) = ${a === 1 ? '' : a}x^2 ${b < 0 ? '-' : '+'} ${Math.abs(2 * b)}xy + cy^2$ est définie positive ?`,
        answer: num(c),
        hint: 'Avec $S = \\begin{pmatrix} a & b \\\\ b & c\\end{pmatrix}$ et $a > 0$ : définie positive si et seulement si $ac - b^2 > 0$.',
        correction: [`$S = \\begin{pmatrix} ${a} & ${b} \\\\ ${b} & c\\end{pmatrix}$, il faut $${a}c - ${b * b} > 0$, soit $c > ${tex(F(b * b, a))}$.`, `Le plus petit entier est $${c}$.`],
      };
    },
    (rng) => qcmBanque(rng, FORMES, true),
  ],
  'l2-vp-symetrique': [
    // Vecteur propre connu de S = [[a, b], [b, a]].
    (rng) => {
      const a = rng.int(-5, 5);
      const b = rng.nonZero(-4, 4);
      const e = rng.sign();
      const lambda = a + e * b;
      const v = e > 0 ? '\\begin{pmatrix}1 \\\\ 1\\end{pmatrix}' : '\\begin{pmatrix}1 \\\\ -1\\end{pmatrix}';
      return {
        prompt: `Sachant que $${v}$ est vecteur propre de $S = ${mat([[a, b], [b, a]])}$, quelle est la valeur propre associée ?`,
        answer: num(lambda),
        hint: 'Calcule le produit de $S$ par ce vecteur et compare au vecteur de départ.',
        correction: [`$S${v} = ${mat([[a + e * b], [e * (a + e * b)]])} = ${lambda}${v}$`, `L’autre valeur propre est $${a - e * b}$ (même trace $${2 * a}$).`],
      };
    },
    (rng) => vraiFauxBanque(rng, FORMES),
  ],
};

export const BANQUES_EUCLIDIENS_L2 = { EUCLIDIENS, FORMES };
