import { type Fait, type Variantes, qcmBanque, vraiFaux, vraiFauxBanque } from '../../licenceVariantes';
import { F, fixedChoice, num, numF, poly, randomMatrix, rank, setOf, tex, vec } from '../util';

/** Variantes du chapitre « Espaces vectoriels » (feuilles bibmath « Espaces vectoriels » et « Dimension finie »). */

const ESPACES: Fait[] = [
  { s: 'Une famille de $4$ vecteurs de $\\mathbb{R}^3$ est toujours liée.', v: true, why: 'Une famille libre de $\\mathbb{R}^3$ a au plus $3$ vecteurs.' },
  { s: 'Une famille de $3$ vecteurs de $\\mathbb{R}^3$ est toujours une base.', v: false, why: 'Elle peut être liée, par exemple si deux vecteurs sont égaux.' },
  { s: 'Une famille libre de $n$ vecteurs d’un espace de dimension $n$ est une base.', v: true, why: 'Une famille libre maximale est génératrice.' },
  { s: 'La réunion de deux sous-espaces vectoriels est un sous-espace vectoriel.', v: false, why: 'Dans $\\mathbb{R}^2$, la réunion des deux axes ne contient pas $(1, 0) + (0, 1)$.' },
  { s: 'L’intersection de deux sous-espaces vectoriels est un sous-espace vectoriel.', v: true, why: 'Elle contient $0$ et est stable par combinaison linéaire.' },
  { s: '$\\mathbb{C}$, vu comme $\\mathbb{R}$-espace vectoriel, est de dimension $2$.', v: true, why: '$(1, i)$ en est une base.' },
  { s: '$\\mathbb{R}[X]$ est de dimension finie.', v: false, why: 'La famille $(1, X, X^2, \\dots)$ est libre et infinie.' },
  { s: 'Toute sous-famille d’une famille libre est libre.', v: true, why: 'Une relation sur la sous-famille en est une sur la famille.' },
  { s: 'Toute sur-famille d’une famille libre est libre.', v: false, why: 'Ajouter le vecteur nul rend la famille liée.' },
  { s: 'Une famille contenant le vecteur nul est liée.', v: true, why: '$1 \\cdot 0 = 0$ est une relation non triviale.' },
  { s: 'Si $F \\cap G = \\{0\\}$ et $\\dim F + \\dim G = \\dim E$, alors $F$ et $G$ sont supplémentaires.', v: true, why: 'Par la formule de Grassmann, $\\dim(F + G) = \\dim E$.' },
  { s: 'Deux sous-espaces de dimension $2$ de $\\mathbb{R}^3$ ont toujours une intersection non nulle.', v: true, why: '$\\dim(F \\cap G) = 2 + 2 - \\dim(F + G) \\geq 4 - 3 = 1$.' },
];

const FONCTIONS: [string, boolean, string][] = [
  ['(\\cos, \\sin)', true, 'Si $a\\cos + b\\sin = 0$, on évalue en $0$ puis en $\\frac{\\pi}{2}$ : $a = b = 0$.'],
  ['(1, \\cos^2, \\sin^2)', false, '$\\cos^2 + \\sin^2 - 1 = 0$.'],
  ['(x \\mapsto e^x, x \\mapsto e^{2x})', true, 'Si $ae^x + be^{2x} = 0$, on divise par $e^{2x}$ et on fait tendre $x$ vers $+\\infty$ : $b = 0$, puis $a = 0$.'],
  ['(1, \\cos(2\\,\\cdot), \\cos^2)', false, '$\\cos(2x) = 2\\cos^2 x - 1$.'],
  ['(x \\mapsto |x|, x \\mapsto x)', true, 'En $x = 1$ et $x = -1$ : $a + b = 0$ et $a - b = 0$.'],
  ['(1, X - 1, (X - 1)^2)', true, 'Ce sont des polynômes de degrés échelonnés $0, 1, 2$.'],
  ['(X^2 + X, X^2 - X, X)', false, '$(X^2 + X) - (X^2 - X) - 2X = 0$.'],
];

export const ESPACES_VARIANTES: Variantes = {
  'l1-famille-libre': [
    // Familles de fonctions.
    (rng) => {
      const [f, libre, why] = rng.pick(FONCTIONS);
      return {
        prompt: `Dans l’espace des fonctions de $\\mathbb{R}$ dans $\\mathbb{R}$ (ou des polynômes), la famille $${f}$ est-elle libre ou liée ?`,
        answer: fixedChoice(['Libre', 'Liée'], libre ? 0 : 1),
        hint: 'Cherche une relation évidente ; sinon, évalue en des points bien choisis.',
        correction: [why],
      };
    },
    (rng) => vraiFauxBanque(rng, ESPACES),
    // Sous-espace ou non ?
    (rng) => {
      const c = rng.int(-2, 2);
      const pool: [string, boolean, string][] = [
        [`\\{(x, y, z) \\mid x + y + z = ${c}\\}`, c === 0, c === 0 ? 'C’est le noyau d’une forme linéaire.' : 'Il ne contient pas le vecteur nul.'],
        ['\\{(x, y) \\mid xy = 0\\}', false, '$(1, 0)$ et $(0, 1)$ y sont, pas leur somme.'],
        ['\\{(x, y, z) \\mid x = 2y \\text{ et } z = 0\\}', true, 'Intersection de deux noyaux de formes linéaires.'],
        ['\\{(x, y) \\mid x^2 = y^2\\}', false, '$(1, 1)$ et $(1, -1)$ y sont, pas leur somme $(2, 0)$.'],
        ['\\{(x, y) \\mid x \\geq 0\\}', false, 'Il n’est pas stable par multiplication par $-1$.'],
        ['\\{P \\in \\mathbb{R}_3[X] \\mid P(1) = 0\\}', true, 'C’est le noyau de $P \\mapsto P(1)$, linéaire.'],
        ['\\{P \\in \\mathbb{R}_3[X] \\mid P(0) = 1\\}', false, 'Il ne contient pas le polynôme nul.'],
        ['\\{f \\in \\mathcal{C}(\\mathbb{R}) \\mid f(0) = f(1)\\}', true, 'C’est le noyau de $f \\mapsto f(1) - f(0)$.'],
      ];
      const [set, v, why] = rng.pick(pool);
      return vraiFaux(`$${set}$ est un sous-espace vectoriel.`, v, [why], 'Un sous-espace contient $0$ et est stable par combinaison linéaire.');
    },
  ],
  'l1-famille-parametre': [
    // Deux vecteurs colinéaires dans ℝ².
    (rng) => {
      const a = rng.nonZero(-5, 5);
      const b = rng.nonZero(-5, 5);
      const c = rng.int(-6, 6);
      // (a, m) et (b, c) colinéaires : ac − mb = 0.
      return {
        prompt: `Pour quelle valeur de $m$ les vecteurs $\\begin{pmatrix}${a}\\\\m\\end{pmatrix}$ et $${vec([b, c])}$ sont-ils colinéaires ?`,
        answer: numF(F(a * c, b)),
        hint: '$(a, m)$ et $(b, c)$ sont colinéaires si et seulement si $ac - mb = 0$.',
        correction: [`$${a} \\times ${c < 0 ? `(${c})` : c} - ${b < 0 ? `(${b})` : b}m = 0 \\iff m = ${tex(F(a * c, b))}$`],
      };
    },
    // (1, m), (m, k²) liés pour m = ±k.
    (rng) => {
      const k = rng.int(1, 6);
      return {
        prompt: `Pour quelles valeurs de $m$ la famille $\\left(\\begin{pmatrix}1\\\\m\\end{pmatrix}, \\begin{pmatrix}m\\\\${k * k}\\end{pmatrix}\\right)$ est-elle liée ?`,
        answer: setOf([k, -k]),
        hint: 'Annule le déterminant.',
        correction: [`$\\det = ${k * k} - m^2 = 0 \\iff m = \\pm ${k}$`],
      };
    },
    // Polynômes dépendant d'un paramètre.
    (rng) => {
      const a = rng.nonZero(-4, 4);
      const b = rng.nonZero(-4, 4);
      // (X + a, X + b, X² + mX + ab)... plus simple : (X + a, mX + b) liée ⟺ b = ma.
      const m = F(b, a);
      return {
        prompt: `Dans $\\mathbb{R}_1[X]$, pour quelle valeur de $m$ la famille $(${poly([1, a], 'X')}, mX ${b < 0 ? '-' : '+'} ${Math.abs(b)})$ est-elle liée ?`,
        answer: numF(m),
        hint: 'Deux vecteurs forment une famille liée quand ils sont proportionnels.',
        correction: [`$mX ${b < 0 ? '-' : '+'} ${Math.abs(b)} = m(X ${a < 0 ? '-' : '+'} ${Math.abs(a)})$ impose $${a}m = ${b}$, donc $m = ${tex(m)}$.`],
      };
    },
  ],
  'l1-coordonnees-base': [
    // Base échelonnée de ℝ³.
    (rng) => {
      const w = [rng.int(-6, 6), rng.int(-6, 6), rng.int(-6, 6)];
      const coords = [w[0] - w[1], w[1] - w[2], w[2]];
      const i = rng.int(0, 2);
      return {
        prompt: `Dans la base $e_1 = ${vec([1, 0, 0])}$, $e_2 = ${vec([1, 1, 0])}$, $e_3 = ${vec([1, 1, 1])}$ de $\\mathbb{R}^3$, quelle est la ${['première', 'deuxième', 'troisième'][i]} coordonnée de $w = ${vec(w)}$ ?`,
        answer: num(coords[i]),
        hint: 'Écris $w = ae_1 + be_2 + ce_3$ et remonte depuis la dernière coordonnée.',
        correction: [`$c = ${w[2]}$, $b + c = ${w[1]}$, $a + b + c = ${w[0]}$`, `Coordonnées : $(${coords.join(', ')})$`],
      };
    },
    // Base (1, X − a, (X − a)²).
    (rng) => {
      const p = [rng.nonZero(-3, 3), rng.int(-4, 4), rng.int(-4, 4)];
      const a = rng.nonZero(-2, 2);
      // P(X) = c0 + c1(X − a) + c2(X − a)² : c2 = p0, c1 = P'(a), c0 = P(a).
      const c = [p[0] * a * a + p[1] * a + p[2], 2 * p[0] * a + p[1], p[0]];
      const k = rng.int(0, 2);
      return {
        prompt: `Dans la base $(1, X ${a < 0 ? '+' : '-'} ${Math.abs(a)}, (X ${a < 0 ? '+' : '-'} ${Math.abs(a)})^2)$ de $\\mathbb{R}_2[X]$, quelle est la coordonnée de $P = ${poly(p, 'X')}$ sur ${['$1$', `$X ${a < 0 ? '+' : '-'} ${Math.abs(a)}$`, `$(X ${a < 0 ? '+' : '-'} ${Math.abs(a)})^2$`][k]} ?`,
        answer: num(c[k]),
        hint: 'Formule de Taylor : les coordonnées sont $P(a)$, $P\'(a)$ et $\\frac{P\'\'(a)}{2}$.',
        correction: [`$P(${a}) = ${c[0]}$, $P'(${a}) = ${c[1]}$, $\\frac{P''(${a})}{2} = ${c[2]}$`],
      };
    },
  ],
  'l1-dimension-sous-espace': [
    // Espaces de matrices.
    (rng) => {
      const n = rng.int(2, 5);
      const kinds = [
        { t: 'des matrices symétriques de taille ' + n, v: (n * (n + 1)) / 2, why: `On choisit les coefficients sur et au-dessus de la diagonale : $\\frac{${n}\\times${n + 1}}{2}$.` },
        { t: 'des matrices antisymétriques de taille ' + n, v: (n * (n - 1)) / 2, why: `Diagonale nulle, on choisit les coefficients au-dessus : $\\frac{${n}\\times${n - 1}}{2}$.` },
        { t: 'des matrices de taille ' + n + ' de trace nulle', v: n * n - 1, why: `Noyau de la trace, forme linéaire non nulle : $${n * n} - 1$.` },
        { t: 'des matrices triangulaires supérieures de taille ' + n, v: (n * (n + 1)) / 2, why: `Coefficients sur et au-dessus de la diagonale : $\\frac{${n}\\times${n + 1}}{2}$.` },
        { t: `des polynômes $P \\in \\mathbb{R}_{${n}}[X]$ tels que $P(1) = 0$`, v: n, why: `Noyau de $P \\mapsto P(1)$ sur un espace de dimension $${n + 1}$ : $${n}$.` },
      ];
      const k = rng.pick(kinds);
      return {
        prompt: `Quelle est la dimension de l’espace ${k.t} ?`,
        answer: num(k.v),
        hint: 'Compte les paramètres libres, ou utilise le théorème du rang.',
        correction: [k.why],
      };
    },
    // Dimension d'un sous-espace engendré.
    (rng) => {
      const n = rng.int(3, 4);
      const base = randomMatrix(rng, 2, n, 2);
      const vs = [...base, base[0].map((x, i) => x + base[1][i]), base[0].map((x) => 2 * x)];
      const r = rank(vs);
      return {
        prompt: `Quelle est la dimension du sous-espace de $\\mathbb{R}^${n}$ engendré par $${vs.map((v) => vec(v)).join(', ')}$ ?`,
        answer: num(r),
        hint: 'C’est le rang de la famille : élimine les vecteurs combinaisons des autres.',
        correction: [`Les deux derniers vecteurs sont $u_1 + u_2$ et $2u_1$.`, `La dimension vaut $${r}$.`],
      };
    },
    // Grassmann inverse.
    (rng) => {
      const f = rng.int(2, 6);
      const g = rng.int(2, 6);
      const s = rng.int(Math.max(f, g), f + g);
      return {
        prompt: `$F$ et $G$ sont des sous-espaces de dimensions $${f}$ et $${g}$, et $\\dim(F + G) = ${s}$. Quelle est la dimension de $F \\cap G$ ?`,
        answer: num(f + g - s),
        hint: 'Formule de Grassmann : $\\dim(F + G) = \\dim F + \\dim G - \\dim(F \\cap G)$.',
        correction: [`$\\dim(F \\cap G) = ${f} + ${g} - ${s} = ${f + g - s}$`],
      };
    },
  ],
  'l1-dimensions-usuelles': [
    (rng) => qcmBanque(rng, ESPACES, rng.next() < 0.5),
    (rng) => {
      const n = rng.int(2, 5);
      const p = rng.int(2, 5);
      const kinds = [
        { t: `\\mathcal{L}(\\mathbb{R}^${n}, \\mathbb{R}^${p})`, v: n * p, why: `Isomorphe à $\\mathcal{M}_{${p},${n}}(\\mathbb{R})$ : $${n * p}$.` },
        { t: `\\mathbb{C}^${n}`, v: 2 * n, why: `Comme $\\mathbb{R}$-espace : chaque coordonnée complexe compte pour $2$, soit $${2 * n}$.`, extra: ' vu comme $\\mathbb{R}$-espace vectoriel' },
        { t: `\\mathbb{R}_{${n}}[X] \\times \\mathbb{R}^${p}`, v: n + 1 + p, why: `$${n + 1} + ${p} = ${n + 1 + p}$` },
        { t: `\\mathcal{M}_{${n}}(\\mathbb{C})`, v: 2 * n * n, why: `Comme $\\mathbb{R}$-espace : $2 \\times ${n * n}$.`, extra: ' vu comme $\\mathbb{R}$-espace vectoriel' },
      ];
      const k = rng.pick(kinds);
      return {
        prompt: `Quelle est la dimension de $${k.t}$${k.extra ?? ''} ?`,
        answer: num(k.v),
        hint: 'Exhibe une base, ou utilise $\\dim(E \\times F) = \\dim E + \\dim F$.',
        correction: [k.why],
      };
    },
  ],
};

export const BANQUES_ESPACES = { ESPACES };
