import type { Rng } from '../rng';
import type { Level, Skill } from '../types';
import { F, choiceTex, coords, cross, dot, fixedChoice, num, numF, par, plus, skill, tex } from './util';

/** Géométrie dans l'espace : trois chapitres de Terminale spécialité. */

type V = [number, number, number];

const randVec = (rng: Rng, b: number, nonZero = false): V => {
  for (;;) {
    const v: V = [rng.int(-b, b), rng.int(-b, b), rng.int(-b, b)];
    if (!nonZero || v.some((x) => x !== 0)) return v;
  }
};
const addV = (u: V, v: V): V => [u[0] + v[0], u[1] + v[1], u[2] + v[2]];
const scale = (k: number, u: V): V => [k * u[0], k * u[1], k * u[2]];
const isZero = (u: number[]) => u.every((x) => x === 0);
const vt = (u: readonly number[]) => coords(u);

/** Équation cartésienne ax + by + cz + d = 0. */
function planeTex(n: V, d: number): string {
  let out = '';
  (['x', 'y', 'z'] as const).forEach((name, i) => {
    const c = n[i];
    if (c === 0) return;
    const abs = Math.abs(c) === 1 ? '' : Math.abs(c);
    out += c < 0 ? (out ? ` - ${abs}${name}` : `-${abs}${name}`) : out ? ` + ${abs}${name}` : `${abs}${name}`;
  });
  return `${out}${plus(d)} = 0`;
}

/** Représentation paramétrique d'une droite passant par A, de vecteur directeur u. */
function paramTex(A: V, u: V, t = 't'): string {
  const row = (name: string, a: number, c: number) =>
    `${name} = ${c === 0 ? a : a === 0 ? `${c === 1 ? '' : c === -1 ? '-' : c}${t}` : `${a} ${c < 0 ? '-' : '+'} ${Math.abs(c) === 1 ? '' : Math.abs(c)}${t}`}`;
  return `\\begin{cases} ${row('x', A[0], u[0])} \\\\ ${row('y', A[1], u[1])} \\\\ ${row('z', A[2], u[2])} \\end{cases}`;
}

/** Terme c·name avec son signe, pour une somme : « 3t », « - t », « + 2t ». */
function term(c: number, name: string, first: boolean): string {
  if (c === 0) return first ? `0${name}` : '';
  const abs = Math.abs(c) === 1 ? '' : Math.abs(c);
  if (first) return `${c < 0 ? '-' : ''}${abs}${name}`;
  return ` ${c < 0 ? '-' : '+'} ${abs}${name}`;
}

const coordBound = (level: Level) => (level === 1 ? 4 : level === 2 ? 6 : 9);

/* ---------- Vecteurs, droites et plans de l'espace ---------- */

const vecteur = skill('tle-espace-vecteur', 'Calculer les coordonnées d’un vecteur', (rng, level) => {
  const A = randVec(rng, coordBound(level));
  const B = randVec(rng, coordBound(level));
  const AB: V = [B[0] - A[0], B[1] - A[1], B[2] - A[2]];
  return {
    prompt: `$A${vt(A)}$ et $B${vt(B)}$. Quelles sont les coordonnées de $\\overrightarrow{AB}$ ?`,
    answer: choiceTex(rng, vt(AB), [vt(scale(-1, AB)), vt(addV(A, B)), vt([AB[0], AB[1], -AB[2]])], () => vt([AB[0] + 1, AB[1], AB[2]])),
    hint: '$\\overrightarrow{AB}(x_B - x_A\\,;\\,y_B - y_A\\,;\\,z_B - z_A)$',
    correction: [`$\\overrightarrow{AB}(${B[0]} - ${par(A[0])}\\,;\\,${B[1]} - ${par(A[1])}\\,;\\,${B[2]} - ${par(A[2])}) = ${vt(AB)}$`],
  };
});

const milieu = skill('tle-espace-milieu', 'Calculer les coordonnées d’un milieu', (rng, level) => {
  const M = randVec(rng, coordBound(level));
  const h = randVec(rng, coordBound(level), true);
  const A = addV(M, scale(-1, h));
  const B = addV(M, h);
  return {
    prompt: `$A${vt(A)}$ et $B${vt(B)}$. Quelles sont les coordonnées du milieu $I$ de $[AB]$ ?`,
    answer: choiceTex(rng, vt(M), [vt(h), vt(scale(2, h)), vt(addV(A, B))], () => vt([M[0], M[1] + 1, M[2]])),
    hint: 'Les coordonnées du milieu sont les moyennes des coordonnées de $A$ et $B$.',
    correction: [`$x_I = \\frac{${A[0]}${plus(B[0])}}{2} = ${M[0]}$, $y_I = \\frac{${A[1]}${plus(B[1])}}{2} = ${M[1]}$, $z_I = \\frac{${A[2]}${plus(B[2])}}{2} = ${M[2]}$`],
  };
});

const colineaire = skill('tle-espace-colineaires', 'Rendre deux vecteurs colinéaires', (rng, level) => {
  let u: V;
  do u = randVec(rng, 4);
  while (u[0] === 0 || u[2] === 0);
  const k = level === 1 ? rng.nonZero(-3, 3) : rng.pick([F(1, 2), F(-1, 2), F(3, 2), F(2), F(-3), F(-2, 3)]);
  const kf = typeof k === 'number' ? F(k) : k;
  const v0 = F(kf.n * u[0], kf.d);
  const v1 = F(kf.n * u[1], kf.d);
  const z = F(kf.n * u[2], kf.d);
  return {
    prompt: `$\\vec u${vt(u)}$ et $\\vec v(${tex(v0)}\\,;\\,${tex(v1)}\\,;\\,z)$. Quelle valeur de $z$ rend $\\vec u$ et $\\vec v$ colinéaires ?`,
    answer: numF(z),
    hint: 'Colinéaires : il existe $k$ tel que $\\vec v = k\\vec u$. Trouve $k$ avec la première coordonnée.',
    correction: [`$k = \\frac{${tex(v0)}}{${u[0]}} = ${tex(kf)}$`, `$z = ${tex(kf)}\\times ${par(u[2])} = ${tex(z)}$`],
  };
});

const combinaison = skill('tle-espace-combinaison', 'Décomposer un vecteur', (rng, level) => {
  let u: V;
  let v: V;
  do {
    u = randVec(rng, 3);
    v = randVec(rng, 3);
  } while (isZero(cross(u, v)));
  const a = rng.nonZero(-3, 3);
  const b = level === 1 ? rng.int(1, 2) : rng.nonZero(-3, 3);
  const w = addV(scale(a, u), scale(b, v));
  return {
    prompt: `$\\vec u${vt(u)}$, $\\vec v${vt(v)}$ et $\\vec w${vt(w)}$. Trouve les réels $\\alpha$ et $\\beta$ tels que $\\vec w = \\alpha\\vec u + \\beta\\vec v$.`,
    answer: { kind: 'pair', values: [F(a), F(b)], labels: ['\\alpha', '\\beta'] },
    hint: 'Écris le système des trois coordonnées et résous-le avec deux équations, puis vérifie la troisième.',
    correction: [
      `On résout $\\begin{cases} ${[0, 1, 2].map((i) => `${u[i] === 0 ? term(v[i], '\\beta', true) : term(u[i], '\\alpha', true) + term(v[i], '\\beta', false)} = ${w[i]}`).join(' \\\\ ')} \\end{cases}$`,
      `On trouve $\\alpha = ${a}$ et $\\beta = ${b}$ : $\\vec u$, $\\vec v$, $\\vec w$ sont coplanaires.`,
    ],
  };
});

const pointDroite = skill('tle-espace-point-droite', 'Trouver le paramètre d’un point d’une droite', (rng, level) => {
  const A = randVec(rng, coordBound(level));
  const u = randVec(rng, 3, true);
  const t = rng.nonZero(-4, 4);
  const M = addV(A, scale(t, u));
  return {
    prompt: `La droite $d$ a pour représentation $${paramTex(A, u)}$, $t \\in \\mathbb{R}$. Le point $M${vt(M)}$ est sur $d$. Pour quelle valeur de $t$ ?`,
    answer: num(t),
    hint: 'Remplace $x$, $y$, $z$ par les coordonnées de $M$ et résous une des équations (avec un coefficient de $t$ non nul).',
    correction: [
      ...[0, 1, 2]
        .filter((i) => u[i] !== 0)
        .slice(0, 2)
        .map((i) => `$${M[i]} = ${A[i]}${term(u[i], 't', false)}$ donne $t = ${t}$.`),
      'Toutes les équations donnent la même valeur : $M \\in d$.',
    ],
  };
});

export const VECTEURS_ESPACE_SKILLS: Skill[] = [vecteur, milieu, colineaire, combinaison, pointDroite];

/* ---------- Orthogonalité et distances dans l'espace ---------- */

/** Vecteurs à norme entière (quadruplets pythagoriciens). */
const PYTHAGOREAN: [V, number][] = [
  [[1, 2, 2], 3],
  [[2, 3, 6], 7],
  [[1, 4, 8], 9],
  [[4, 4, 7], 9],
  [[2, 6, 9], 11],
  [[2, 10, 11], 15],
  [[0, 3, 4], 5],
  [[2, 2, 1], 3],
];

function pythagorean(rng: Rng): [V, number] {
  const [base, norm] = rng.pick(PYTHAGOREAN);
  const perm = rng.shuffle(base) as V;
  return [perm.map((x) => x * rng.sign()) as V, norm];
}

const produitScalaire = skill('tle-produit-scalaire', 'Calculer un produit scalaire', (rng, level) => {
  const u = randVec(rng, coordBound(level));
  const v = randVec(rng, coordBound(level));
  const p = dot(u, v);
  return {
    prompt: `$\\vec u${vt(u)}$ et $\\vec v${vt(v)}$. Calcule $\\vec u \\cdot \\vec v$.`,
    answer: num(p),
    hint: '$\\vec u \\cdot \\vec v = xx\' + yy\' + zz\'$',
    correction: [`$\\vec u \\cdot \\vec v = ${u[0]}\\times ${par(v[0])} + ${par(u[1])}\\times ${par(v[1])} + ${par(u[2])}\\times ${par(v[2])} = ${p}$`],
  };
});

const norme = skill('tle-norme', 'Calculer une norme ou une distance', (rng) => {
  const [h, n] = pythagorean(rng);
  const A = randVec(rng, 5);
  const B = addV(A, h);
  return {
    prompt: `$A${vt(A)}$ et $B${vt(B)}$. Calcule la distance $AB$.`,
    answer: num(n),
    hint: '$AB = \\sqrt{(x_B - x_A)^2 + (y_B - y_A)^2 + (z_B - z_A)^2}$',
    correction: [`$\\overrightarrow{AB}${vt(h)}$`, `$AB = \\sqrt{${h.map((x) => `${par(x)}^2`).join(' + ')}} = \\sqrt{${n * n}} = ${n}$`],
  };
});

const orthogonal = skill('tle-orthogonalite', 'Rendre deux vecteurs orthogonaux', (rng) => {
  let u: V;
  do u = randVec(rng, 4);
  while (u[2] === 0);
  const v0 = rng.int(-5, 5);
  const v1 = rng.int(-5, 5);
  const m = F(-(u[0] * v0 + u[1] * v1), u[2]);
  return {
    prompt: `$\\vec u${vt(u)}$ et $\\vec v(${v0}\\,;\\,${v1}\\,;\\,m)$. Pour quelle valeur de $m$ sont-ils orthogonaux ?`,
    answer: numF(m),
    hint: 'Orthogonaux $\\iff \\vec u \\cdot \\vec v = 0$.',
    correction: [`$\\vec u \\cdot \\vec v = ${u[0] * v0}${plus(u[1] * v1)} ${u[2] < 0 ? '-' : '+'} ${Math.abs(u[2]) === 1 ? '' : Math.abs(u[2])}m = 0$`, `$m = ${tex(m)}$`],
  };
});

const normal = skill('tle-vecteur-normal', 'Lire un vecteur normal à un plan', (rng, level) => {
  const n = randVec(rng, coordBound(level), true);
  const d = rng.int(-9, 9);
  return {
    prompt: `Quel vecteur est normal au plan $\\mathcal{P} : ${planeTex(n, d)}$ ?`,
    answer: choiceTex(
      rng,
      `\\vec n${vt(n)}`,
      [`\\vec n${vt([n[0], n[1], d])}`, `\\vec n${vt([n[1], n[0], n[2]])}`, `\\vec n${vt([n[0], n[2], n[1]])}`, `\\vec n${vt([-n[0], n[1], n[2]])}`],
      () => `\\vec n${vt([n[0] + 1, n[1], n[2]])}`,
    ),
    hint: 'Le plan $ax + by + cz + d = 0$ a pour vecteur normal $\\vec n(a\\,;\\,b\\,;\\,c)$.',
    correction: [`Les coefficients de $x$, $y$, $z$ donnent $\\vec n${vt(n)}$.`],
  };
});

const equationPlan = skill('tle-equation-plan', 'Trouver l’équation d’un plan', (rng, level) => {
  const n = randVec(rng, coordBound(level) - 1, true);
  const A = randVec(rng, coordBound(level));
  const d = -dot(n, A);
  return {
    prompt: `Le plan $\\mathcal{P}$ passe par $A${vt(A)}$ et a pour vecteur normal $\\vec n${vt(n)}$. Son équation est $${planeTex(n, 0).replace(' = 0', '')} + d = 0$. Calcule $d$.`,
    answer: num(d),
    hint: '$A$ est dans le plan : ses coordonnées vérifient l’équation.',
    correction: [`$${n[0]}\\times ${par(A[0])} + ${par(n[1])}\\times ${par(A[1])} + ${par(n[2])}\\times ${par(A[2])} + d = 0$`, `$${dot(n, A)} + d = 0$, donc $d = ${d}$.`],
  };
});

const distancePlan = skill('tle-distance-point-plan', 'Calculer la distance d’un point à un plan', (rng) => {
  const [n, norm] = pythagorean(rng);
  const M = randVec(rng, 5);
  let d = rng.int(-9, 9);
  if (dot(n, M) + d === 0) d += rng.pick([-norm, norm]);
  const value = Math.abs(dot(n, M) + d);
  return {
    prompt: `Calcule la distance du point $M${vt(M)}$ au plan $\\mathcal{P} : ${planeTex(n, d)}$.`,
    answer: numF(F(value, norm)),
    hint: 'La distance vaut $MH$ où $H$ est le projeté orthogonal de $M$ : $\\frac{|ax_M + by_M + cz_M + d|}{\\sqrt{a^2 + b^2 + c^2}}$.',
    correction: [
      `$|${n[0]}\\times ${par(M[0])} + ${par(n[1])}\\times ${par(M[1])} + ${par(n[2])}\\times ${par(M[2])}${plus(d)}| = ${value}$`,
      `$\\|\\vec n\\| = \\sqrt{${n.map((x) => `${par(x)}^2`).join(' + ')}} = ${norm}$`,
      `Distance $= \\frac{${value}}{${norm}}${F(value, norm).d === norm ? '' : ` = ${tex(F(value, norm))}`}$`,
    ],
  };
});

export const ORTHOGONALITE_SKILLS: Skill[] = [produitScalaire, norme, orthogonal, normal, equationPlan, distancePlan];

/* ---------- Représentations paramétriques et équations cartésiennes ---------- */

const representation = skill('tle-representation-parametrique', 'Écrire une représentation paramétrique', (rng, level) => {
  const A = randVec(rng, coordBound(level));
  const B = addV(A, randVec(rng, 3, true));
  const u: V = [B[0] - A[0], B[1] - A[1], B[2] - A[2]];
  return {
    prompt: `Quelle est une représentation paramétrique de la droite $(AB)$ avec $A${vt(A)}$ et $B${vt(B)}$ ?`,
    answer: choiceTex(rng, paramTex(A, u), [paramTex(u, A), paramTex(A, B), paramTex(B, A)], () => paramTex(A, scale(-1, addV(u, [1, 0, 0])))),
    hint: 'La droite passe par $A$ et est dirigée par $\\overrightarrow{AB}$.',
    correction: [`$\\overrightarrow{AB}${vt(u)}$, donc $(AB)$ : $${paramTex(A, u)}$, $t \\in \\mathbb{R}$.`],
  };
});

const intersection = skill('tle-intersection-droite-plan', 'Intersection d’une droite et d’un plan', (rng, level) => {
  for (;;) {
    const A = randVec(rng, coordBound(level));
    const u = randVec(rng, 3, true);
    const n = randVec(rng, 3, true);
    const nu = dot(n, u);
    if (nu === 0) continue;
    const t = rng.nonZero(-3, 3);
    const I = addV(A, scale(t, u));
    const d = -dot(n, I);
    return {
      prompt: `$d : ${paramTex(A, u)}$ ($t \\in \\mathbb{R}$) coupe $\\mathcal{P} : ${planeTex(n, d)}$ en un point $I$. Quelle valeur de $t$ correspond à $I$ ? `,
      answer: num(t),
      hint: 'Remplace $x$, $y$, $z$ dans l’équation du plan par leurs expressions en fonction de $t$.',
      correction: [
        `On obtient $${dot(n, A) + d}${nu < 0 ? ' - ' : ' + '}${Math.abs(nu) === 1 ? '' : Math.abs(nu)}t = 0$.`,
        `Donc $t = ${t}$ et $I${vt(I)}$.`,
      ],
    };
  }
});

const position = skill('tle-position-droite-plan', 'Position relative d’une droite et d’un plan', (rng, level) => {
  const n = randVec(rng, 3, true);
  const A = randVec(rng, coordBound(level));
  let u: V;
  const kind = rng.int(0, 2); // 0 sécante, 1 strictement parallèle, 2 incluse
  do u = randVec(rng, 3, true);
  while ((dot(n, u) === 0) !== (kind > 0));
  const d = -dot(n, A) + (kind === 1 ? rng.nonZero(-5, 5) : 0);
  const nu = dot(n, u);
  return {
    prompt: `Quelle est la position de $d : ${paramTex(A, u)}$ par rapport au plan $\\mathcal{P} : ${planeTex(n, d)}$ ?`,
    answer: fixedChoice(['Sécante à $\\mathcal{P}$', 'Strictement parallèle à $\\mathcal{P}$', 'Incluse dans $\\mathcal{P}$'], kind),
    hint: 'Compare le vecteur directeur de $d$ au vecteur normal du plan, puis teste un point de $d$.',
    correction: [
      `$\\vec u${vt(u)}$, $\\vec n${vt(n)}$ et $\\vec u \\cdot \\vec n = ${nu}$.`,
      kind === 0
        ? '$\\vec u \\cdot \\vec n \\neq 0$ : la droite coupe le plan en un point.'
        : `$\\vec u \\cdot \\vec n = 0$ : $d$ est parallèle à $\\mathcal{P}$. Le point $A${vt(A)}$ de $d$ ${kind === 2 ? 'vérifie' : 'ne vérifie pas'} l’équation de $\\mathcal{P}$ : $d$ est ${kind === 2 ? 'incluse dans le plan' : 'strictement parallèle au plan'}.`,
    ],
  };
});

const positionDroites = skill('tle-position-droites', 'Position relative de deux droites', (rng, level) => {
  const kind = rng.int(0, 2); // 0 parallèles, 1 sécantes, 2 non coplanaires
  const A = randVec(rng, coordBound(level));
  const u = randVec(rng, 3, true);
  let v: V;
  let B: V;
  for (;;) {
    if (kind === 0) {
      v = scale(rng.pick([-2, -1, 2]), u);
      B = addV(A, randVec(rng, 3, true));
      if (!isZero(cross(u, [B[0] - A[0], B[1] - A[1], B[2] - A[2]]))) break;
    } else {
      v = randVec(rng, 3, true);
      if (isZero(cross(u, v))) continue;
      const P = addV(A, scale(rng.int(-2, 2), u));
      B = addV(P, scale(rng.nonZero(-2, 2), v));
      if (kind === 2) B = addV(B, randVec(rng, 2, true));
      const mixed = dot([B[0] - A[0], B[1] - A[1], B[2] - A[2]], cross(u, v));
      if ((mixed === 0) === (kind === 1)) break;
    }
  }
  return {
    prompt: `$d_1 : ${paramTex(A, u)}$ et $d_2 : ${paramTex(B, v, 's')}$ ($t, s \\in \\mathbb{R}$). Quelle est leur position relative ?`,
    answer: fixedChoice(['Parallèles', 'Sécantes', 'Non coplanaires'], kind),
    hint: 'Les vecteurs directeurs sont-ils colinéaires ? Sinon, le système $d_1 = d_2$ a-t-il une solution ?',
    correction: [
      kind === 0
        ? `$\\vec v${vt(v)}$ est colinéaire à $\\vec u${vt(u)}$ : les droites sont parallèles (et distinctes, car $B \\notin d_1$).`
        : `$\\vec u${vt(u)}$ et $\\vec v${vt(v)}$ ne sont pas colinéaires.`,
      ...(kind === 0 ? [] : [kind === 1 ? 'Le système formé par les deux représentations a une solution : les droites sont sécantes.' : 'Le système formé par les deux représentations n’a pas de solution : les droites sont non coplanaires.']),
    ],
  };
});

const cote = skill('tle-point-plan', 'Trouver un point d’un plan', (rng, level) => {
  const n: V = [rng.int(-4, 4), rng.int(-4, 4), rng.pick([1, -1])];
  const x = rng.int(-coordBound(level), coordBound(level));
  const y = rng.int(-coordBound(level), coordBound(level));
  const z = rng.int(-6, 6);
  const d = -(n[0] * x + n[1] * y + n[2] * z);
  return {
    prompt: `Le point $M(${x}\\,;\\,${y}\\,;\\,z)$ appartient au plan $\\mathcal{P} : ${planeTex(n, d)}$. Calcule $z$.`,
    answer: num(z),
    hint: 'Remplace $x$ et $y$ dans l’équation, puis résous en $z$.',
    correction: [`$${n[0] * x + n[1] * y + d}${n[2] < 0 ? ' - ' : ' + '}z = 0$`, `$z = ${z}$`],
  };
});

export const PARAMETRIQUES_SKILLS: Skill[] = [representation, intersection, position, positionDroites, cote];
