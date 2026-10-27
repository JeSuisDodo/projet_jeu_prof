import type { Rng } from '../rng';
import type { Level, Skill } from '../types';
import { enrich, variant } from '../variantes';
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


/* ---------- Variantes ---------- */

const VF = ['Vrai', 'Faux'];
const sub3 = (u: V, v: V): V => [u[0] - v[0], u[1] - v[1], u[2] - v[2]];
const det3 = (u: V, v: V, w: V) => dot(cross(u, v) as V, w);
const vecName = (name: string, u: readonly number[]) => `\\vec ${name}${vt(u)}`;

const vecteurVariantes = [
  variant('retrouver-point', (rng, level) => {
    const A = randVec(rng, coordBound(level));
    const AB = randVec(rng, 5, true);
    const B = addV(A, AB);
    return {
      prompt: `$A${vt(A)}$ et $\\overrightarrow{AB}${vt(AB)}$. Quelles sont les coordonnées de $B$ ?`,
      answer: choiceTex(rng, vt(B), [vt(sub3(A, AB)), vt(sub3(AB, A)), vt(AB)], () => vt([B[0], B[1] + 1, B[2]])),
      hint: '$x_B = x_A + x_{\\overrightarrow{AB}}$, et de même pour $y$ et $z$.',
      correction: [`$B(${A[0]}${plus(AB[0])}\\,;\\,${A[1]}${plus(AB[1])}\\,;\\,${A[2]}${plus(AB[2])}) = ${vt(B)}$`],
    };
  }),
  variant('combinaison-lineaire', (rng) => {
    const u = randVec(rng, 4, true);
    const v = randVec(rng, 4, true);
    const a = rng.nonZero(-3, 3);
    const b = rng.nonZero(-3, 3);
    const w = addV(scale(a, u), scale(b, v));
    const nom = `${a === 1 ? '' : a === -1 ? '-' : a}\\vec u ${b < 0 ? '-' : '+'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}\\vec v`;
    return {
      prompt: `$${vecName('u', u)}$ et $${vecName('v', v)}$. Quelles sont les coordonnées de $${nom}$ ?`,
      answer: choiceTex(rng, vt(w), [vt(addV(scale(a, u), scale(-b, v))), vt(addV(scale(b, u), scale(a, v))), vt(addV(u, v))], () => vt([w[0] + 1, w[1], w[2]])),
      hint: 'Calcule coordonnée par coordonnée.',
      correction: [`$${nom}${vt(w)}$`],
    };
  }),
];

const milieuVariantes = [
  variant('symetrique', (rng, level) => {
    const A = randVec(rng, coordBound(level));
    const I = randVec(rng, coordBound(level));
    const B = sub3(scale(2, I), A);
    return {
      prompt: `$A${vt(A)}$ et $I${vt(I)}$. Quelles sont les coordonnées du symétrique $B$ de $A$ par rapport à $I$ ?`,
      answer: choiceTex(rng, vt(B), [vt(addV(A, I)), vt(sub3(I, A)), vt(sub3(A, scale(2, I)))], () => vt([B[0] + 1, B[1], B[2]])),
      hint: '$I$ est le milieu de $[AB]$ : $x_B = 2x_I - x_A$.',
      correction: [`$B(2\\times ${par(I[0])} - ${par(A[0])}\\,;\\,2\\times ${par(I[1])} - ${par(A[1])}\\,;\\,2\\times ${par(I[2])} - ${par(A[2])}) = ${vt(B)}$`],
    };
  }),
  variant('centre-gravite', (rng) => {
    const G = randVec(rng, 4);
    const A = randVec(rng, 5);
    const B = randVec(rng, 5);
    const C = sub3(scale(3, G), addV(A, B));
    return {
      prompt: `$A${vt(A)}$, $B${vt(B)}$ et $C${vt(C)}$. Quelles sont les coordonnées du centre de gravité $G$ du triangle $ABC$ ?`,
      answer: choiceTex(rng, vt(G), [vt(addV(addV(A, B), C)), vt(scale(-1, G)), vt([G[0], G[2], G[1]])], () => vt([G[0] + 1, G[1], G[2]])),
      hint: 'Les coordonnées de $G$ sont les moyennes de celles des trois sommets.',
      correction: [`$x_G = \\frac{${A[0]}${plus(B[0])}${plus(C[0])}}{3} = ${G[0]}$, et de même $y_G = ${G[1]}$, $z_G = ${G[2]}$.`],
    };
  }),
];

const colineaireVariantes = [
  variant('vrai-faux', (rng) => {
    const u = randVec(rng, 4, true);
    const k = rng.nonZero(-3, 3);
    const ok = rng.next() < 0.5;
    let v = scale(k, u);
    if (!ok) {
      const i = rng.int(0, 2);
      v = [...v] as V;
      v[i] += rng.nonZero(-2, 2);
    }
    const col = isZero(cross(u, v));
    return {
      prompt: `Vrai ou faux : $${vecName('u', u)}$ et $${vecName('v', v)}$ sont colinéaires.`,
      answer: fixedChoice(VF, col ? 0 : 1),
      hint: 'Cherche un réel $k$ tel que $\\vec v = k\\vec u$ et vérifie les trois coordonnées.',
      correction: [col ? `$\\vec v = ${k}\\vec u$ : c’est vrai.` : 'Aucun réel $k$ ne convient pour les trois coordonnées à la fois : c’est faux.'],
    };
  }),
  variant('alignes', (rng, level) => {
    const A = randVec(rng, coordBound(level));
    let u: V;
    do u = randVec(rng, 3, true);
    while (u[2] === 0 || (u[0] === 0 && u[1] === 0));
    const k = rng.nonZero(-3, 3);
    const B = addV(A, u);
    const C = addV(A, scale(k, u));
    return {
      prompt: `$A${vt(A)}$, $B${vt(B)}$ et $C(${C[0]}\\,;\\,${C[1]}\\,;\\,m)$. Pour quelle valeur de $m$ les points $A$, $B$, $C$ sont-ils alignés ?`,
      answer: num(C[2]),
      hint: '$A$, $B$, $C$ sont alignés si $\\overrightarrow{AC}$ est colinéaire à $\\overrightarrow{AB}$.',
      correction: [`$\\overrightarrow{AB}${vt(u)}$ ; les deux premières coordonnées de $\\overrightarrow{AC}$ donnent $k = ${k}$.`, `$m - ${par(A[2])} = ${k}\\times ${par(u[2])}$, donc $m = ${C[2]}$.`],
    };
  }),
];

const combinaisonVariantes = [
  variant('coplanaires-vrai-faux', (rng) => {
    let u: V;
    let v: V;
    do {
      u = randVec(rng, 3);
      v = randVec(rng, 3);
    } while (isZero(cross(u, v)));
    const ok = rng.next() < 0.5;
    let w = addV(scale(rng.nonZero(-2, 2), u), scale(rng.nonZero(-2, 2), v));
    if (!ok) w = addV(w, cross(u, v).map((x) => Math.sign(x)) as V);
    const cop = det3(u, v, w) === 0;
    return {
      prompt: `Vrai ou faux : les vecteurs $${vecName('u', u)}$, $${vecName('v', v)}$ et $${vecName('w', w)}$ sont coplanaires.`,
      answer: fixedChoice(VF, cop ? 0 : 1),
      hint: 'Cherche $\\alpha$ et $\\beta$ tels que $\\vec w = \\alpha\\vec u + \\beta\\vec v$ avec deux coordonnées, puis vérifie la troisième.',
      correction: [cop ? '$\\vec w$ s’écrit comme combinaison de $\\vec u$ et $\\vec v$ : c’est vrai.' : 'Le système n’a pas de solution : $\\vec w$ n’est pas combinaison de $\\vec u$ et $\\vec v$. C’est faux.'],
    };
  }),
  variant('parametre', (rng) => {
    for (;;) {
      const u = randVec(rng, 3);
      const v = randVec(rng, 3);
      const c = cross(u, v);
      if (c[2] === 0) continue;
      const w0 = rng.int(-5, 5);
      const w1 = rng.int(-5, 5);
      const m = F(-(c[0] * w0 + c[1] * w1), c[2]);
      return {
        prompt: `$${vecName('u', u)}$, $${vecName('v', v)}$ et $\\vec w(${w0}\\,;\\,${w1}\\,;\\,m)$. Pour quelle valeur de $m$ ces trois vecteurs sont-ils coplanaires ?`,
        answer: numF(m),
        hint: 'Écris $\\vec w = \\alpha\\vec u + \\beta\\vec v$ : trouve $\\alpha$ et $\\beta$ avec les deux premières coordonnées, puis déduis $m$.',
        correction: [`Les deux premières coordonnées déterminent $\\alpha$ et $\\beta$ ; la troisième donne $m = ${tex(m)}$.`],
      };
    }
  }),
];

const pointDroiteVariantes = [
  variant('vrai-faux', (rng, level) => {
    const A = randVec(rng, coordBound(level));
    const u = randVec(rng, 3, true);
    const t = rng.nonZero(-3, 3);
    const ok = rng.next() < 0.5;
    const M = addV(A, scale(t, u));
    if (!ok) M[rng.int(0, 2)] += rng.nonZero(-2, 2);
    const sur = isZero(cross(u, sub3(M, A)));
    return {
      prompt: `La droite $d$ a pour représentation $${paramTex(A, u)}$, $t \\in \\mathbb{R}$. Vrai ou faux : le point $M${vt(M)}$ appartient à $d$.`,
      answer: fixedChoice(VF, sur ? 0 : 1),
      hint: 'Cherche $t$ avec une équation, puis vérifie les deux autres.',
      correction: [sur ? `$t = ${t}$ convient pour les trois équations : c’est vrai.` : 'Les trois équations ne donnent pas la même valeur de $t$ : c’est faux.'],
    };
  }),
  variant('point-de-parametre', (rng, level) => {
    const A = randVec(rng, coordBound(level));
    const u = randVec(rng, 3, true);
    const t = rng.nonZero(-3, 3);
    const M = addV(A, scale(t, u));
    return {
      prompt: `La droite $d$ a pour représentation $${paramTex(A, u)}$, $t \\in \\mathbb{R}$. Quel est le point de $d$ de paramètre $t = ${t}$ ?`,
      answer: choiceTex(rng, vt(M), [vt(sub3(A, scale(t, u))), vt(addV(u, scale(t, A))), vt(A)], () => vt([M[0], M[1], M[2] + 1])),
      hint: 'Remplace $t$ par sa valeur dans les trois lignes.',
      correction: [`$x = ${A[0]}${plus(t * u[0])} = ${M[0]}$, $y = ${M[1]}$, $z = ${M[2]}$.`],
    };
  }),
];

const ANGLES: [string, number, number][] = [
  ['0', 1, 1],
  ['\\frac{\\pi}{3}', 1, 2],
  ['\\frac{\\pi}{2}', 0, 1],
  ['\\frac{2\\pi}{3}', -1, 2],
  ['\\pi', -1, 1],
];

const produitScalaireVariantes = [
  variant('normes-angle', (rng) => {
    const a = rng.int(1, 8);
    const b = rng.int(1, 8);
    const [angle, cn, cd] = rng.pick(ANGLES);
    const value = F(a * b * cn, cd);
    return {
      prompt: `$\\|\\vec u\\| = ${a}$, $\\|\\vec v\\| = ${b}$ et l’angle entre $\\vec u$ et $\\vec v$ vaut $${angle}$. Calcule $\\vec u \\cdot \\vec v$.`,
      answer: numF(value),
      hint: '$\\vec u \\cdot \\vec v = \\|\\vec u\\|\\,\\|\\vec v\\|\\cos\\theta$.',
      correction: [`$\\vec u \\cdot \\vec v = ${a}\\times ${b}\\times\\cos\\left(${angle}\\right) = ${tex(value)}$`],
    };
  }),
  variant('points', (rng) => {
    const A = randVec(rng, 5);
    const B = randVec(rng, 5);
    const C = randVec(rng, 5);
    const value = dot(sub3(B, A), sub3(C, A));
    return {
      prompt: `$A${vt(A)}$, $B${vt(B)}$ et $C${vt(C)}$. Calcule $\\overrightarrow{AB} \\cdot \\overrightarrow{AC}$.`,
      answer: num(value),
      hint: 'Calcule d’abord les coordonnées des deux vecteurs.',
      correction: [`$\\overrightarrow{AB}${vt(sub3(B, A))}$ et $\\overrightarrow{AC}${vt(sub3(C, A))}$.`, `Produit scalaire : $${value}$.`],
    };
  }),
];

const normeVariantes = [
  variant('norme-vecteur', (rng) => {
    const [u, n] = pythagorean(rng);
    const k = rng.int(1, 3);
    const v = scale(k, u);
    return {
      prompt: `Calcule la norme du vecteur $${vecName('u', v)}$.`,
      answer: num(k * n),
      hint: '$\\|\\vec u\\| = \\sqrt{x^2 + y^2 + z^2}$',
      correction: [`$\\|\\vec u\\| = \\sqrt{${v.map((x) => `${par(x)}^2`).join(' + ')}} = \\sqrt{${(k * n) ** 2}} = ${k * n}$`],
    };
  }),
  variant('isocele', (rng) => {
    const A = randVec(rng, 4);
    const [h1] = pythagorean(rng);
    const ok = rng.next() < 0.5;
    const B = addV(A, h1);
    // C : même distance à A (permutation et signes de h1) ou distance différente.
    const h2 = (ok ? rng.shuffle([...h1]).map((x) => x * rng.sign()) : addV(h1, [rng.nonZero(-2, 2), 0, 0]).reverse()) as V;
    const C = addV(A, h2);
    const iso = dot(h1, h1) === dot(h2, h2);
    return {
      prompt: `$A${vt(A)}$, $B${vt(B)}$ et $C${vt(C)}$. Vrai ou faux : le triangle $ABC$ est isocèle en $A$.`,
      answer: fixedChoice(VF, iso ? 0 : 1),
      hint: 'Compare $AB^2$ et $AC^2$.',
      correction: [`$AB^2 = ${dot(h1, h1)}$ et $AC^2 = ${dot(h2, h2)}$ : c’est ${iso ? 'vrai' : 'faux'}.`],
    };
  }),
];

const orthogonalVariantes = [
  variant('vrai-faux', (rng) => {
    const u = randVec(rng, 4, true);
    const v = randVec(rng, 4, true);
    if (rng.next() < 0.5) {
      // Force l'orthogonalité en ajustant une coordonnée quand c'est possible.
      const i = u.findIndex((x) => Math.abs(x) === 1);
      const vi = -u[i] * (dot(u, v) - u[i] * v[i]);
      if (i >= 0 && v.some((x, j) => j !== i && x !== 0)) v[i] = vi;
    }
    const ok = dot(u, v) === 0;
    return {
      prompt: `Vrai ou faux : $${vecName('u', u)}$ et $${vecName('v', v)}$ sont orthogonaux.`,
      answer: fixedChoice(VF, ok ? 0 : 1),
      hint: 'Calcule le produit scalaire.',
      correction: [`$\\vec u \\cdot \\vec v = ${dot(u, v)}$ : c’est ${ok ? 'vrai' : 'faux'}.`],
    };
  }),
  variant('triangle-rectangle', (rng) => {
    const A = randVec(rng, 4);
    const u = randVec(rng, 3, true);
    let v = randVec(rng, 3, true);
    if (rng.next() < 0.5) {
      // v orthogonal à u : v = u × w pour un w quelconque.
      const w = randVec(rng, 2, true);
      const c = cross(u, w) as V;
      if (!isZero(c)) v = c;
    }
    const B = addV(A, u);
    const C = addV(A, v);
    const ok = dot(u, v) === 0;
    return {
      prompt: `$A${vt(A)}$, $B${vt(B)}$ et $C${vt(C)}$. Vrai ou faux : le triangle $ABC$ est rectangle en $A$.`,
      answer: fixedChoice(VF, ok ? 0 : 1),
      hint: 'Rectangle en $A$ $\\iff \\overrightarrow{AB} \\cdot \\overrightarrow{AC} = 0$.',
      correction: [`$\\overrightarrow{AB}${vt(u)}$, $\\overrightarrow{AC}${vt(v)}$ et $\\overrightarrow{AB} \\cdot \\overrightarrow{AC} = ${dot(u, v)}$ : c’est ${ok ? 'vrai' : 'faux'}.`],
    };
  }),
];

const normalVariantes = [
  variant('plan-parallele', (rng, level) => {
    const n = randVec(rng, 4, true);
    const d = rng.int(-9, 9);
    const A = randVec(rng, coordBound(level));
    const d2 = -dot(n, A);
    return {
      prompt: `Quelle est une équation du plan parallèle à $\\mathcal{P} : ${planeTex(n, d)}$ passant par $A${vt(A)}$ ?`,
      answer: choiceTex(rng, planeTex(n, d2), [planeTex(n, -d2), planeTex(n, d), planeTex(n, d2 + 2)], () => planeTex(n, d2 + 1)),
      hint: 'Un plan parallèle a le même vecteur normal ; trouve $d$ avec le point $A$.',
      correction: [`Équation $${planeTex(n, 0).replace(' = 0', '')} + d = 0$ et $A$ dedans : $d = ${d2}$.`],
    };
  }),
  variant('orthogonal-a-deux', (rng) => {
    let u: V;
    let v: V;
    do {
      u = randVec(rng, 3);
      v = randVec(rng, 3);
    } while (isZero(cross(u, v)));
    const n = cross(u, v) as V;
    return {
      prompt: `Un plan est dirigé par $${vecName('u', u)}$ et $${vecName('v', v)}$. Quel vecteur lui est normal ?`,
      answer: choiceTex(rng, vecName('n', n), [vecName('n', addV(u, v)), vecName('n', [n[0], n[1], -n[2]]), vecName('n', [n[1], n[0], n[2]])], () => vecName('n', [n[0] + 1, n[1], n[2]])),
      hint: 'Un vecteur normal est orthogonal à $\\vec u$ et à $\\vec v$ : vérifie les deux produits scalaires.',
      correction: [`$\\vec n \\cdot \\vec u = 0$ et $\\vec n \\cdot \\vec v = 0$ pour $\\vec n${vt(n)}$.`],
    };
  }),
];

const equationPlanVariantes = [
  variant('point-vrai-faux', (rng, level) => {
    const n = randVec(rng, 4, true);
    const A = randVec(rng, coordBound(level));
    const ok = rng.next() < 0.5;
    const d = -dot(n, A) + (ok ? 0 : rng.nonZero(-4, 4));
    const vaut = dot(n, A) + d;
    return {
      prompt: `Vrai ou faux : le point $A${vt(A)}$ appartient au plan $\\mathcal{P} : ${planeTex(n, d)}$.`,
      answer: fixedChoice(VF, vaut === 0 ? 0 : 1),
      hint: 'Remplace $x$, $y$, $z$ par les coordonnées de $A$.',
      correction: [`On trouve $${vaut}$ : c’est ${vaut === 0 ? 'vrai' : 'faux'}.`],
    };
  }),
  variant('plan-mediateur', (rng, level) => {
    const A = randVec(rng, coordBound(level));
    const h = randVec(rng, 3, true);
    const B = addV(A, scale(2, h));
    const I = addV(A, h);
    const n = scale(2, h);
    const d = -dot(n, I);
    return {
      prompt: `$A${vt(A)}$ et $B${vt(B)}$. Le plan médiateur de $[AB]$ a pour équation $${planeTex(n, 0).replace(' = 0', '')} + d = 0$. Calcule $d$.`,
      answer: num(d),
      hint: 'Le plan médiateur est orthogonal à $(AB)$ et passe par le milieu de $[AB]$.',
      correction: [`Milieu $I${vt(I)}$ ; $\\overrightarrow{AB}${vt(n)}$ est normal au plan.`, `$${dot(n, I)} + d = 0$, donc $d = ${d}$.`],
    };
  }),
];

const distancePlanVariantes = [
  variant('depuis-origine', (rng) => {
    const [n, norm] = pythagorean(rng);
    const d = rng.nonZero(-20, 20);
    const value = F(Math.abs(d), norm);
    return {
      prompt: `Calcule la distance de l’origine $O$ au plan $\\mathcal{P} : ${planeTex(n, d)}$ (fraction).`,
      answer: numF(value),
      hint: '$d(O, \\mathcal{P}) = \\frac{|d|}{\\sqrt{a^2 + b^2 + c^2}}$',
      correction: [`$\\|\\vec n\\| = ${norm}$, donc la distance vaut $\\frac{${Math.abs(d)}}{${norm}} = ${tex(value)}$.`],
    };
  }),
  variant('projete', (rng) => {
    const n = randVec(rng, 2, true);
    const H = randVec(rng, 4);
    const k = rng.nonZero(-2, 2);
    const M = addV(H, scale(k, n));
    const d = -dot(n, H);
    return {
      prompt: `Quelles sont les coordonnées du projeté orthogonal $H$ de $M${vt(M)}$ sur le plan $\\mathcal{P} : ${planeTex(n, d)}$ ?`,
      answer: choiceTex(rng, vt(H), [vt(addV(M, scale(k, n))), vt(sub3(H, n)), vt(M)], () => vt([H[0] + 1, H[1], H[2]])),
      hint: '$H$ est sur la droite passant par $M$ dirigée par $\\vec n$ : $H = M + t\\vec n$, et $H \\in \\mathcal{P}$.',
      correction: [`$H = M + t\\vec n$ avec $\\vec n${vt(n)}$ ; en remplaçant dans l’équation, $t = ${-k}$.`, `$H${vt(H)}$`],
    };
  }),
];

const representationVariantes = [
  variant('vecteur-directeur', (rng, level) => {
    const A = randVec(rng, coordBound(level));
    const u = randVec(rng, 3, true);
    const k = rng.pick([-2, -1, 2, 3]);
    return {
      prompt: `La droite $d$ a pour représentation $${paramTex(A, u)}$, $t \\in \\mathbb{R}$. Quel vecteur dirige $d$ ?`,
      answer: choiceTex(rng, vecName('w', scale(k, u)), [vecName('w', A), vecName('w', addV(A, u)), vecName('w', [u[0], u[1], u[2] + 1])], () => vecName('w', [u[0] + 1, u[1], u[2]])),
      hint: 'Les coefficients de $t$ donnent un vecteur directeur ; tout vecteur colinéaire non nul convient aussi.',
      correction: [`$\\vec u${vt(u)}$ dirige $d$, et $\\vec w = ${k}\\vec u$ aussi.`],
    };
  }),
  variant('parallele', (rng, level) => {
    const A = randVec(rng, coordBound(level));
    const B = addV(A, randVec(rng, 3, true));
    const C = randVec(rng, coordBound(level));
    const u = sub3(B, A);
    return {
      prompt: `$A${vt(A)}$, $B${vt(B)}$ et $C${vt(C)}$. Quelle est une représentation paramétrique de la droite passant par $C$ et parallèle à $(AB)$ ?`,
      answer: choiceTex(rng, paramTex(C, u), [paramTex(A, u), paramTex(C, sub3(C, A)), paramTex(u, C)], () => paramTex(C, addV(u, [1, 0, 0]))),
      hint: 'Elle passe par $C$ et a le même vecteur directeur $\\overrightarrow{AB}$.',
      correction: [`$\\overrightarrow{AB}${vt(u)}$ : $${paramTex(C, u)}$`],
    };
  }),
];

const intersectionVariantes = [
  variant('point', (rng, level) => {
    for (;;) {
      const A = randVec(rng, coordBound(level));
      const u = randVec(rng, 3, true);
      const n = randVec(rng, 3, true);
      if (dot(n, u) === 0) continue;
      const t = rng.nonZero(-3, 3);
      const I = addV(A, scale(t, u));
      const d = -dot(n, I);
      return {
        prompt: `Quelles sont les coordonnées du point d’intersection de $d : ${paramTex(A, u)}$ ($t \\in \\mathbb{R}$) et du plan $\\mathcal{P} : ${planeTex(n, d)}$ ?`,
        answer: choiceTex(rng, vt(I), [vt(A), vt(sub3(A, scale(t, u))), vt(scale(t, u))], () => vt([I[0], I[1] + 1, I[2]])),
        hint: 'Remplace $x$, $y$, $z$ dans l’équation du plan, trouve $t$, puis calcule le point.',
        correction: [`On trouve $t = ${t}$, d’où $I${vt(I)}$.`],
      };
    }
  }),
  variant('axe', (rng) => {
    const n = randVec(rng, 4, true);
    const i = rng.int(0, 2);
    if (n[i] === 0) n[i] = rng.nonZero(-4, 4);
    const d = rng.nonZero(-12, 12);
    const value = F(-d, n[i]);
    const axe = ['(Ox)', '(Oy)', '(Oz)'][i];
    const coord = ['x', 'y', 'z'][i];
    return {
      prompt: `Le plan $\\mathcal{P} : ${planeTex(n, d)}$ coupe l’axe $${axe}$ en un point. Quelle est sa coordonnée $${coord}$ (fraction) ?`,
      answer: numF(value),
      hint: `Sur l’axe $${axe}$, les deux autres coordonnées sont nulles.`,
      correction: [`$${n[i]}${coord}${plus(d)} = 0$, donc $${coord} = ${tex(value)}$.`],
    };
  }),
];

const PLANS = ['Parallèles distincts', 'Confondus', 'Sécants'];

const positionVariantes = [
  variant('vrai-faux-parallele', (rng, level) => {
    const n = randVec(rng, 3, true);
    const A = randVec(rng, coordBound(level));
    const par0 = rng.next() < 0.5;
    let u: V;
    do u = randVec(rng, 3, true);
    while ((dot(n, u) === 0) !== par0);
    const d = -dot(n, A) + rng.int(-4, 4);
    return {
      prompt: `Vrai ou faux : la droite $d : ${paramTex(A, u)}$ est parallèle au plan $\\mathcal{P} : ${planeTex(n, d)}$ (éventuellement incluse dedans).`,
      answer: fixedChoice(VF, par0 ? 0 : 1),
      hint: '$d$ est parallèle à $\\mathcal{P}$ si son vecteur directeur est orthogonal au vecteur normal.',
      correction: [`$\\vec u \\cdot \\vec n = ${dot(n, u)}$ : c’est ${par0 ? 'vrai' : 'faux'}.`],
    };
  }),
  variant('deux-plans', (rng) => {
    const n = randVec(rng, 3, true);
    const d = rng.int(-6, 6);
    const kind = rng.int(0, 2);
    const k = rng.pick([-2, -1, 2, 3]);
    let n2 = scale(k, n);
    let d2 = k * d + (kind === 0 ? rng.nonZero(-3, 3) : 0);
    if (kind === 2) {
      do n2 = randVec(rng, 3, true);
      while (isZero(cross(n, n2)));
      d2 = rng.int(-6, 6);
    }
    return {
      prompt: `Quelle est la position relative des plans $\\mathcal{P} : ${planeTex(n, d)}$ et $\\mathcal{Q} : ${planeTex(n2, d2)}$ ?`,
      answer: fixedChoice(PLANS, kind),
      hint: 'Compare les vecteurs normaux ; s’ils sont colinéaires, compare aussi les équations.',
      correction: [kind === 2 ? 'Les vecteurs normaux ne sont pas colinéaires : les plans sont sécants (selon une droite).' : `$\\vec n_{\\mathcal{Q}} = ${k}\\vec n_{\\mathcal{P}}$ : plans parallèles, ${kind === 1 ? 'et les équations sont proportionnelles : confondus' : 'mais les équations ne sont pas proportionnelles : distincts'}.`],
    };
  }),
];

const positionDroitesVariantes = [
  variant('orthogonales', (rng, level) => {
    const A = randVec(rng, coordBound(level));
    const B = randVec(rng, coordBound(level));
    const u = randVec(rng, 3, true);
    let v = randVec(rng, 3, true);
    if (rng.next() < 0.5) {
      const c = cross(u, randVec(rng, 2, true)) as V;
      if (!isZero(c)) v = c;
    }
    const ok = dot(u, v) === 0;
    return {
      prompt: `Vrai ou faux : les droites $d_1 : ${paramTex(A, u)}$ et $d_2 : ${paramTex(B, v, 's')}$ sont orthogonales.`,
      answer: fixedChoice(VF, ok ? 0 : 1),
      hint: 'Deux droites de l’espace sont orthogonales si leurs vecteurs directeurs le sont (elles ne se coupent pas forcément).',
      correction: [`$\\vec u \\cdot \\vec v = ${dot(u, v)}$ : c’est ${ok ? 'vrai' : 'faux'}.`],
    };
  }),
  variant('point-commun', (rng, level) => {
    for (;;) {
      const A = randVec(rng, coordBound(level));
      const u = randVec(rng, 3, true);
      const v = randVec(rng, 3, true);
      if (isZero(cross(u, v))) continue;
      const t = rng.nonZero(-3, 3);
      const P = addV(A, scale(t, u));
      const B = addV(P, scale(rng.nonZero(-2, 2), v));
      return {
        prompt: `Les droites $d_1 : ${paramTex(A, u)}$ et $d_2 : ${paramTex(B, v, 's')}$ ($t, s \\in \\mathbb{R}$) sont sécantes en $P$. Quelle valeur de $t$ correspond à $P$ sur $d_1$ ?`,
        answer: num(t),
        hint: 'Égale les coordonnées des deux représentations et résous le système en $t$ et $s$.',
        correction: [`Le système donne $t = ${t}$, d’où $P${vt(P)}$.`],
      };
    }
  }),
];

const coteVariantes = [
  variant('autre-coordonnee', (rng, level) => {
    const i = rng.int(0, 1);
    const n: V = [rng.int(-4, 4), rng.int(-4, 4), rng.nonZero(-4, 4)];
    n[i] = rng.pick([1, -1]);
    const M = randVec(rng, coordBound(level));
    const d = -dot(n, M);
    const nom = ['x', 'y'][i];
    const c = M.map((v, j) => (j === i ? nom : String(v)));
    return {
      prompt: `Le point $M(${c.join('\\,;\\,')})$ appartient au plan $\\mathcal{P} : ${planeTex(n, d)}$. Calcule $${nom}$.`,
      answer: num(M[i]),
      hint: 'Remplace les deux coordonnées connues dans l’équation, puis résous.',
      correction: [`On obtient une équation du premier degré en $${nom}$, de solution $${nom} = ${M[i]}$.`],
    };
  }),
  variant('point-sur-droite-et-plan', (rng, level) => {
    // Le point de d de paramètre t appartient au plan ; on demande sa cote.
    for (;;) {
      const A = randVec(rng, coordBound(level));
      const u = randVec(rng, 3, true);
      const n = randVec(rng, 3, true);
      if (dot(n, u) === 0) continue;
      const t = rng.nonZero(-3, 3);
      const I = addV(A, scale(t, u));
      const d = -dot(n, I);
      return {
        prompt: `La droite $d : ${paramTex(A, u)}$ ($t \\in \\mathbb{R}$) coupe le plan $\\mathcal{P} : ${planeTex(n, d)}$ en $I$. Calcule la cote $z_I$.`,
        answer: num(I[2]),
        hint: 'Trouve d’abord $t$ en remplaçant dans l’équation du plan.',
        correction: [`$t = ${t}$, donc $z_I = ${A[2]}${plus(t * u[2])} = ${I[2]}$.`],
      };
    }
  }),
];

export const VECTEURS_ESPACE_SKILLS: Skill[] = [
  enrich(vecteur, vecteurVariantes),
  enrich(milieu, milieuVariantes),
  enrich(colineaire, colineaireVariantes),
  enrich(combinaison, combinaisonVariantes),
  enrich(pointDroite, pointDroiteVariantes),
];

export const ORTHOGONALITE_SKILLS: Skill[] = [
  enrich(produitScalaire, produitScalaireVariantes),
  enrich(norme, normeVariantes),
  enrich(orthogonal, orthogonalVariantes),
  enrich(normal, normalVariantes),
  enrich(equationPlan, equationPlanVariantes),
  enrich(distancePlan, distancePlanVariantes),
];

export const PARAMETRIQUES_SKILLS: Skill[] = [
  enrich(representation, representationVariantes),
  enrich(intersection, intersectionVariantes),
  enrich(position, positionVariantes),
  enrich(positionDroites, positionDroitesVariantes),
  enrich(cote, coteVariantes),
];
