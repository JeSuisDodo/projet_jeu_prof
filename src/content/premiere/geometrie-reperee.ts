import { frac, fracLatex } from '../../exercises/fraction';
import { paren, sumLatex } from '../../exercises/latex';
import { type Answer, type Skill, makeChoice } from '../../exercises/types';
import { enrich, variant } from '../../exercises/variantes';
import type { ChapterDef } from '../types';

/** 1re spécialité, chapitre « Géométrie repérée » : vecteur normal, équations de droites et de cercles. */

const line = (a: number, b: number, c: number) => `${sumLatex([[a, 'x'], [b, 'y'], [c, '']])} = 0`;
const vecTex = (x: number, y: number) => `\\vec{n}\\begin{pmatrix} ${x} \\\\ ${y} \\end{pmatrix}`;
const point = (name: string, x: number, y: number) => `${name}(${x}\\,;\\,${y})`;
/** (x - a)² en LaTeX, réduit à x² quand a = 0. */
const square = (v: string, a: number) => (a === 0 ? `${v}^2` : `(${sumLatex([[1, v], [-a, '']])})^2`);

const normal: Skill = {
  id: '1re-geo-vecteur-normal',
  name: 'Lire un vecteur normal',
  generate(rng, level) {
    const a = rng.nonZero(-6, 6);
    const b = rng.nonZero(-6, 6);
    const c = rng.int(-9, 9);
    // Niveau 3 : on accepte un multiple du vecteur (a ; b).
    const k = level === 3 ? rng.pick([-1, 2, -2, 3]) : 1;
    const good = vecTex(k * a, k * b);
    // Aucun leurre ne doit être colinéaire à (a ; b), sinon il serait aussi normal.
    const pairs: [number, number][] = [[-b, a], [b, -a], [a, c], [b, a], [a + 1, b]];
    const decoys = pairs.filter(([x, y]) => x * b - y * a !== 0).map(([x, y]) => vecTex(x, y));
    return {
      skill: this.id,
      level,
      prompt: `Quel vecteur est normal à la droite $d : ${line(a, b, c)}$ ?`,
      answer: makeChoice(rng, `$${good}$`, decoys.map((d) => `$${d}$`), () => `$${vecTex(a, b + rng.nonZero(-3, 3))}$`),
      hint: 'La droite $ax + by + c = 0$ admet $\\vec{n}(a\\,;\\,b)$ comme vecteur normal (et $\\vec{u}(-b\\,;\\,a)$ comme vecteur directeur).',
      correction: [
        `Un vecteur normal à $d$ est $${vecTex(a, b)}$${k === 1 ? '.' : `, donc aussi tout vecteur colinéaire non nul comme $${good}$ (multiplié par $${k}$).`}`,
      ],
    };
  },
};

const equationNormale: Skill = {
  id: '1re-geo-equation-normale',
  name: 'Écrire l’équation d’une droite de vecteur normal donné',
  generate(rng, level) {
    const a = level === 1 ? rng.pick([1, 2, 3]) : rng.nonZero(-5, 5);
    const b = rng.nonZero(-5, 5);
    const x0 = rng.int(-6, 6);
    const y0 = rng.int(-6, 6);
    const c = -(a * x0 + b * y0);
    return {
      skill: this.id,
      level,
      prompt: `La droite $d$ passe par $${point('A', x0, y0)}$ et admet $${vecTex(a, b)}$ comme vecteur normal. Son équation s'écrit $${sumLatex([[a, 'x'], [b, 'y']])} + c = 0$. Que vaut $c$ ?`,
      answer: { kind: 'number', value: frac(c) },
      hint: 'Le point $A$ est sur la droite : remplace $x$ et $y$ par ses coordonnées.',
      correction: [`$${a} \\times ${paren(x0)} + ${paren(b)} \\times ${paren(y0)} + c = 0$`, `$${a * x0 + b * y0} + c = 0$, donc $c = ${c}$.`],
    };
  },
};

const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));

/** Équation de droite simplifiée : coefficients premiers entre eux, premier coefficient positif. */
function reduced(a: number, b: number, c: number): string {
  const g = gcd(gcd(a, b), c) * Math.sign(a || b);
  return line(a / g, b / g, c / g);
}

const perpendiculaire: Skill = {
  id: '1re-geo-perpendiculaire',
  name: 'Trouver une droite perpendiculaire',
  generate(rng, level) {
    // d : ax + by + c = 0 ; la perpendiculaire en A admet (a ; b) comme vecteur directeur, donc (-b ; a) comme normal.
    const a = rng.nonZero(-5, 5);
    const b = level === 1 ? 0 : rng.nonZero(-5, 5);
    const c = rng.int(-9, 9);
    const x0 = rng.int(-5, 5);
    const y0 = rng.int(-5, 5);
    const eq = (p: number, q: number) => reduced(p, q, -(p * x0 + q * y0));
    const good = eq(-b, a);
    const decoys = [eq(a, b), eq(b, a), reduced(-b, a, c)];
    return {
      skill: this.id,
      level,
      prompt: `Quelle est une équation de la droite perpendiculaire à $d : ${line(a, b, c)}$ passant par $${point('A', x0, y0)}$ ?`,
      answer: makeChoice(rng, `$${good}$`, decoys.map((d) => `$${d}$`), () => `$${eq(-b + rng.nonZero(-3, 3), a)}$`),
      hint: 'Le vecteur normal de $d$ est un vecteur directeur de la perpendiculaire.',
      correction: [
        `$\\vec{n}(${a}\\,;\\,${b})$ est normal à $d$, donc directeur de la perpendiculaire $\\Delta$, qui admet alors $(${-b}\\,;\\,${a})$ comme vecteur normal.`,
        `$\\Delta : ${sumLatex([[-b, 'x'], [a, 'y']])} + c = 0$ et $A \\in \\Delta$ donne $c = ${b * x0 - a * y0}$, d'où $\\Delta : ${line(-b, a, b * x0 - a * y0)}$${line(-b, a, b * x0 - a * y0) === good ? '' : `, soit en simplifiant $${good}$`}.`,
      ],
    };
  },
};

const cercleLecture: Skill = {
  id: '1re-geo-cercle-centre',
  name: 'Trouver le centre d’un cercle',
  generate(rng, level) {
    const a = rng.int(-6, 6);
    const b = rng.int(-6, 6);
    const r = rng.int(1, 7);
    if (level < 3) {
      return {
        skill: this.id,
        level,
        prompt: `Le cercle $\\mathcal{C}$ a pour équation $${square('x', a)} + ${square('y', b)} = ${r * r}$. Donne les coordonnées de son centre.`,
        answer: { kind: 'pair', values: [frac(a), frac(b)], labels: ['x', 'y'] },
        hint: 'Le cercle de centre $\\Omega(a\\,;\\,b)$ et de rayon $r$ a pour équation $(x - a)^2 + (y - b)^2 = r^2$.',
        correction: [`On lit $\\Omega(${a}\\,;\\,${b})$ et $r^2 = ${r * r}$, soit $r = ${r}$.`],
      };
    }
    // Forme développée : x² + y² - 2ax - 2by + (a² + b² - r²) = 0.
    const k = a * a + b * b - r * r;
    const eq = `${sumLatex([[1, 'x^2'], [1, 'y^2'], [-2 * a, 'x'], [-2 * b, 'y'], [k, '']])} = 0`;
    return {
      skill: this.id,
      level,
      prompt: `Le cercle $\\mathcal{C}$ a pour équation $${eq}$. Donne les coordonnées de son centre.`,
      answer: { kind: 'pair', values: [frac(a), frac(b)], labels: ['x', 'y'] },
      hint: 'Fais apparaître des carrés : $x^2 - 2ax = (x - a)^2 - a^2$.',
      correction: [
        `$${sumLatex([[1, 'x^2'], [-2 * a, 'x']])} = ${square('x', a)} - ${a * a}$ et $${sumLatex([[1, 'y^2'], [-2 * b, 'y']])} = ${square('y', b)} - ${b * b}$`,
        `Donc $\\mathcal{C} : ${square('x', a)} + ${square('y', b)} = ${r * r}$ : centre $\\Omega(${a}\\,;\\,${b})$, rayon $${r}$.`,
      ],
    };
  },
};

const cercleRayon: Skill = {
  id: '1re-geo-cercle-rayon',
  name: 'Écrire l’équation d’un cercle',
  generate(rng, level) {
    const a = rng.int(-5, 5);
    const b = rng.int(-5, 5);
    const px = rng.int(-6, 6);
    let py = rng.int(-6, 6);
    if (px === a && py === b) py += 1;
    const r2 = (px - a) ** 2 + (py - b) ** 2;
    if (level === 3) {
      // Cercle de diamètre [AB] : centre au milieu, r² = AB²/4.
      const bx = 2 * a - px;
      const by = 2 * b - py;
      return {
        skill: this.id,
        level,
        prompt: `Le cercle $\\mathcal{C}$ a pour diamètre $[AB]$ avec $${point('A', px, py)}$ et $${point('B', bx, by)}$. Son équation s'écrit $(x - a)^2 + (y - b)^2 = k$. Que vaut $k$ ?`,
        answer: { kind: 'number', value: frac(r2) },
        hint: 'Le centre est le milieu de $[AB]$, et le rayon vaut la moitié de $AB$.',
        correction: [`Le centre est $\\Omega(${a}\\,;\\,${b})$, milieu de $[AB]$.`, `$k = \\Omega A^2 = (${px} - ${paren(a)})^2 + (${py} - ${paren(b)})^2 = ${r2}$`],
      };
    }
    return {
      skill: this.id,
      level,
      prompt: `Le cercle $\\mathcal{C}$ a pour centre $${point('\\Omega', a, b)}$ et passe par $${point('A', px, py)}$. Son équation s'écrit $${square('x', a)} + ${square('y', b)} = k$. Que vaut $k$ ?`,
      answer: { kind: 'number', value: frac(r2) },
      hint: '$k$ est le carré du rayon, c’est-à-dire $\\Omega A^2$.',
      correction: [`$k = \\Omega A^2 = (${px} - ${paren(a)})^2 + (${py} - ${paren(b)})^2 = ${r2}$`],
    };
  },
};

const distance: Skill = {
  id: '1re-geo-distance-droite',
  name: 'Calculer une distance avec le projeté orthogonal',
  generate(rng, level) {
    // Projeté orthogonal de M sur d : ax + by + c = 0, avec (a ; b) choisi pour des calculs entiers.
    const [a, b] = rng.pick(level === 1 ? [[1, 0], [0, 1]] : [[3, 4], [4, 3], [-3, 4], [4, -3], [1, 0], [0, 1]]);
    const hx = rng.int(-5, 5);
    const hy = rng.int(-5, 5);
    const c = -(a * hx + b * hy);
    const t = rng.nonZero(-3, 3);
    const mx = hx + t * a;
    const my = hy + t * b;
    const norm = Math.hypot(a, b);
    const dist = Math.abs(t) * norm;
    return {
      skill: this.id,
      level,
      prompt: `Calcule la distance du point $${point('M', mx, my)}$ à la droite $d : ${line(a, b, c)}$.`,
      answer: { kind: 'number', value: frac(dist) },
      hint: 'Le projeté orthogonal $H$ de $M$ sur $d$ vérifie $\\overrightarrow{MH}$ colinéaire au vecteur normal $\\vec{n}(a\\,;\\,b)$ : cherche $H = M + t\\,\\vec{n}$ sur $d$.',
      correction: [
        `$H(${sumLatex([[mx, ''], [a, 't']])}\\,;\\,${sumLatex([[my, ''], [b, 't']])})$ est sur $d$ : on trouve $t = ${-t}$, donc $${point('H', hx, hy)}$.`,
        `$MH = \\sqrt{${paren(hx - mx)}^2 + ${paren(hy - my)}^2} = ${fracLatex(frac(dist))}$`,
      ],
    };
  },
};

const vraiFaux = (b: boolean): Answer => ({ kind: 'choice', options: ['Vrai', 'Faux'], correct: b ? 0 : 1 });
const dirTex = (x: number, y: number) => `\\vec{u}\\begin{pmatrix} ${x} \\\\ ${y} \\end{pmatrix}`;
/** Coefficients de la deuxième droite : multiples de (p ; q), sans être nuls tous les deux. */
const multiple = (k: number, p: number, q: number): [number, number] => [k * p, k * q];

const normalVariantes = [
  variant('vecteur-directeur', (rng) => {
    const a = rng.nonZero(-6, 6);
    const b = rng.nonZero(-6, 6);
    const c = rng.int(-9, 9);
    const pairs: [number, number][] = [[a, b], [b, a], [b, -a], [a, -b], [-a, b]];
    const decoys = pairs.filter(([x, y]) => x * a + y * b !== 0).map(([x, y]) => `$${dirTex(x, y)}$`);
    return {
      prompt: `Quel vecteur est un vecteur directeur de la droite $d : ${line(a, b, c)}$ ?`,
      answer: makeChoice(rng, `$${dirTex(-b, a)}$`, decoys, () => `$${dirTex(-b + rng.nonZero(-3, 3), a)}$`),
      hint: 'La droite $ax + by + c = 0$ admet $\\vec{u}(-b\\,;\\,a)$ comme vecteur directeur.',
      correction: [`$\\vec{u}(${-b}\\,;\\,${a})$ dirige $d$ ; il est bien orthogonal à $\\vec{n}(${a}\\,;\\,${b})$ : $${paren(-b)}\\times ${paren(a)} + ${paren(a)}\\times ${paren(b)} = 0$.`],
    };
  }),
  variant('vrai-faux', (rng) => {
    const a = rng.nonZero(-5, 5);
    const b = rng.nonZero(-5, 5);
    const c = rng.int(-9, 9);
    const ok = rng.next() < 0.5;
    const [p, q] = ok ? multiple(rng.pick([-2, -1, 2, 3]), a, b) : rng.pick([[-b, a], [b, a], [a, b + rng.nonZero(-2, 2)]] as [number, number][]);
    const colineaire = p * b - q * a === 0;
    return {
      prompt: `Vrai ou faux : le vecteur $${vecTex(p, q)}$ est normal à la droite $d : ${line(a, b, c)}$.`,
      answer: vraiFaux(colineaire),
      hint: `Un vecteur normal à $d$ est colinéaire à $(${a}\\,;\\,${b})$.`,
      correction: [`$${paren(p)}\\times ${paren(b)} - ${paren(q)}\\times ${paren(a)} = ${p * b - q * a}$ : ${colineaire ? `les vecteurs sont colinéaires, c'est vrai` : `ils ne sont pas colinéaires, c'est faux`}.`],
    };
  }),
  variant('parametre', (rng) => {
    const a = rng.nonZero(-5, 5);
    const b = rng.nonZero(-5, 5);
    const c = rng.int(-9, 9);
    const k = rng.pick([-2, -1, 2, 3]);
    return {
      prompt: `Pour quelle valeur de $m$ le vecteur $\\vec{n}\\begin{pmatrix} m \\\\ ${k * b} \\end{pmatrix}$ est-il normal à la droite $d : ${line(a, b, c)}$ ?`,
      answer: { kind: 'number', value: frac(k * a) },
      hint: `$\\vec{n}$ doit être colinéaire à $(${a}\\,;\\,${b})$.`,
      correction: [`$${k * b} = ${k}\\times ${paren(b)}$, donc $m = ${k}\\times ${paren(a)} = ${k * a}$.`],
    };
  }),
];

const equationNormaleVariantes = [
  variant('mediatrice', (rng) => {
    const ax = rng.int(-6, 6);
    const ay = rng.int(-6, 6);
    let dx: number;
    let dy: number;
    do {
      dx = 2 * rng.int(-3, 3);
      dy = 2 * rng.int(-3, 3);
    } while (dx === 0 && dy === 0);
    const [mx, my] = [ax + dx / 2, ay + dy / 2];
    const c = -(dx * mx + dy * my);
    return {
      prompt: `Soit $${point('A', ax, ay)}$ et $${point('B', ax + dx, ay + dy)}$. La médiatrice de $[AB]$ a une équation de la forme $${sumLatex([[dx, 'x'], [dy, 'y']])} + c = 0$. Que vaut $c$ ?`,
      answer: { kind: 'number', value: frac(c) },
      hint: 'La médiatrice passe par le milieu de $[AB]$ et admet $\\overrightarrow{AB}$ comme vecteur normal.',
      correction: [`Le milieu de $[AB]$ est $${point('I', mx, my)}$.`, `$${dx}\\times ${paren(mx)} + ${paren(dy)}\\times ${paren(my)} + c = 0$, donc $c = ${c}$.`],
    };
  }),
  variant('tangente-cercle', (rng) => {
    const ox = rng.int(-4, 4);
    const oy = rng.int(-4, 4);
    let nx: number;
    let ny: number;
    do {
      nx = rng.int(-4, 4);
      ny = rng.int(-4, 4);
    } while (nx === 0 && ny === 0);
    const [px, py] = [ox + nx, oy + ny];
    const c = -(nx * px + ny * py);
    return {
      prompt: `Le point $${point('A', px, py)}$ est sur le cercle de centre $${point('\\Omega', ox, oy)}$. La tangente au cercle en $A$ a une équation de la forme $${sumLatex([[nx, 'x'], [ny, 'y']])} + c = 0$. Que vaut $c$ ?`,
      answer: { kind: 'number', value: frac(c) },
      hint: 'La tangente en $A$ est perpendiculaire au rayon : $\\overrightarrow{\\Omega A}$ est un vecteur normal.',
      correction: [`$\\overrightarrow{\\Omega A}(${nx}\\,;\\,${ny})$ est normal à la tangente.`, `$A$ est sur la tangente : $${nx}\\times ${paren(px)} + ${paren(ny)}\\times ${paren(py)} + c = 0$, donc $c = ${c}$.`],
    };
  }),
  variant('point-sur-droite', (rng) => {
    const a = rng.nonZero(-5, 5);
    const b = rng.pick([-1, 1, 2, -2]);
    const x0 = rng.int(-6, 6);
    const y0 = rng.int(-6, 6);
    const c = -(a * x0 + b * y0);
    return {
      prompt: `Le point $A(${x0}\\,;\\,y)$ appartient à la droite $d : ${line(a, b, c)}$. Que vaut $y$ ?`,
      answer: { kind: 'number', value: frac(y0) },
      hint: 'Remplace $x$ par l’abscisse de $A$ et résous l’équation d’inconnue $y$.',
      correction: [`$${a}\\times ${paren(x0)} ${b < 0 ? '-' : '+'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}y${c === 0 ? '' : ` ${c < 0 ? '-' : '+'} ${Math.abs(c)}`} = 0 \\iff y = ${y0}$`],
    };
  }),
];

const perpendiculaireVariantes = [
  variant('vrai-faux', (rng) => {
    const a = rng.nonZero(-5, 5);
    const b = rng.nonZero(-5, 5);
    const ok = rng.next() < 0.5;
    const [p, q] = ok ? multiple(rng.pick([-2, -1, 1, 2]), -b, a) : rng.pick([[a, b], [b, a], [-b + 1, a]] as [number, number][]);
    const scal = a * p + b * q;
    return {
      prompt: `Vrai ou faux : les droites $d : ${line(a, b, rng.int(-9, 9))}$ et $d' : ${line(p, q, rng.int(-9, 9))}$ sont perpendiculaires.`,
      answer: vraiFaux(scal === 0),
      hint: 'Deux droites sont perpendiculaires quand leurs vecteurs normaux sont orthogonaux.',
      correction: [`$\\vec{n}(${a}\\,;\\,${b})$ et $\\vec{n'}(${p}\\,;\\,${q})$ : $${paren(a)}\\times ${paren(p)} + ${paren(b)}\\times ${paren(q)} = ${scal}$, donc c'est ${scal === 0 ? 'vrai' : 'faux'}.`],
    };
  }),
  variant('parametre', (rng) => {
    const a = rng.nonZero(-5, 5);
    const b = rng.int(-5, 5);
    const k = rng.pick([-2, -1, 1, 2, 3]);
    const [m, q] = [-k * b, k * a];
    const r = rng.int(-9, 9);
    return {
      prompt: `Pour quelle valeur de $m$ la droite $d' : mx ${q < 0 ? '-' : '+'} ${Math.abs(q)}y${r === 0 ? '' : ` ${r < 0 ? '-' : '+'} ${Math.abs(r)}`} = 0$ est-elle perpendiculaire à $d : ${line(a, b, rng.int(-9, 9))}$ ?`,
      answer: { kind: 'number', value: frac(m) },
      hint: 'Les vecteurs normaux $(m\\,;\\,' + q + ')$ et $(' + a + '\\,;\\,' + b + ')$ doivent être orthogonaux.',
      correction: [`$${paren(a)}m + ${paren(b)}\\times ${paren(q)} = 0 \\iff m = ${m}$`],
    };
  }),
];

const centreVariantes = [
  variant('rayon', (rng, level) => {
    const a = rng.int(-6, 6);
    const b = rng.int(-6, 6);
    const r = rng.int(1, 7);
    const k = a * a + b * b - r * r;
    const eq = level === 1 ? `${square('x', a)} + ${square('y', b)} = ${r * r}` : `${sumLatex([[1, 'x^2'], [1, 'y^2'], [-2 * a, 'x'], [-2 * b, 'y'], [k, '']])} = 0`;
    return {
      prompt: `Le cercle $\\mathcal{C}$ a pour équation $${eq}$. Quel est son rayon ?`,
      answer: { kind: 'number', value: frac(r) },
      hint: 'Mets l’équation sous la forme $(x - a)^2 + (y - b)^2 = r^2$.',
      correction: [`$\\mathcal{C} : ${square('x', a)} + ${square('y', b)} = ${r * r}$, donc $r = \\sqrt{${r * r}} = ${r}$.`],
    };
  }),
  variant('point-sur-cercle', (rng) => {
    const a = rng.int(-5, 5);
    const b = rng.int(-5, 5);
    const [dx, dy, r] = rng.pick([[3, 4, 5], [0, 2, 2], [4, 3, 5], [0, 3, 3], [6, 8, 10], [5, 12, 13]]);
    const sx = rng.sign();
    const sy = rng.sign();
    const ok = rng.next() < 0.5;
    const [px, py] = [a + sx * dx, b + sy * dy + (ok ? 0 : rng.pick([-1, 1]))];
    const d2 = (px - a) ** 2 + (py - b) ** 2;
    return {
      prompt: `Vrai ou faux : le point $${point('A', px, py)}$ appartient au cercle d'équation $${square('x', a)} + ${square('y', b)} = ${r * r}$.`,
      answer: vraiFaux(d2 === r * r),
      hint: 'Remplace $x$ et $y$ par les coordonnées de $A$.',
      correction: [`$(${px} - ${paren(a)})^2 + (${py} - ${paren(b)})^2 = ${d2}$, ${d2 === r * r ? `égal à $${r * r}$ : c'est vrai` : `différent de $${r * r}$ : c'est faux`}.`],
    };
  }),
  variant('est-un-cercle', (rng) => {
    const a = rng.int(-5, 5);
    const b = rng.int(-5, 5);
    const r2 = rng.pick([-9, -4, -1, 0, 1, 4, 9, 16, 25, 2, 5]);
    const k = a * a + b * b - r2;
    const eq = `${sumLatex([[1, 'x^2'], [1, 'y^2'], [-2 * a, 'x'], [-2 * b, 'y'], [k, '']])} = 0`;
    return {
      prompt: `Vrai ou faux : l'ensemble des points $M(x\\,;\\,y)$ tels que $${eq}$ est un cercle.`,
      answer: vraiFaux(r2 > 0),
      hint: 'Fais apparaître $(x - a)^2 + (y - b)^2$ et regarde le signe du membre de droite.',
      correction: [
        `L'équation équivaut à $${square('x', a)} + ${square('y', b)} = ${r2}$.`,
        r2 > 0 ? `$${r2} > 0$ : c'est le cercle de centre $(${a}\\,;\\,${b})$ et de rayon $\\sqrt{${r2}}$. C'est vrai.` : r2 === 0 ? `Seul le point $(${a}\\,;\\,${b})$ convient : ce n'est pas un cercle. C'est faux.` : `Une somme de carrés ne peut pas valoir $${r2}$ : l'ensemble est vide. C'est faux.`,
      ],
    };
  }),
];

const cercleRayonVariantes = [
  variant('tangent-axe', (rng) => {
    const a = rng.nonZero(-6, 6);
    const b = rng.nonZero(-6, 6);
    const abscisses = rng.next() < 0.5;
    const r2 = abscisses ? b * b : a * a;
    return {
      prompt: `Le cercle $\\mathcal{C}$ de centre $${point('\\Omega', a, b)}$ est tangent à l'axe des ${abscisses ? 'abscisses' : 'ordonnées'}. Son équation s'écrit $${square('x', a)} + ${square('y', b)} = k$. Que vaut $k$ ?`,
      answer: { kind: 'number', value: frac(r2) },
      hint: `Le rayon est la distance du centre à l'axe des ${abscisses ? 'abscisses' : 'ordonnées'}.`,
      correction: [`Le rayon vaut $|${abscisses ? b : a}| = ${Math.abs(abscisses ? b : a)}$, donc $k = ${r2}$.`],
    };
  }),
  variant('centre-diametre', (rng) => {
    const a = rng.int(-5, 5);
    const b = rng.int(-5, 5);
    const px = rng.int(-6, 6);
    const py = rng.int(-6, 6);
    return {
      prompt: `Le cercle $\\mathcal{C}$ a pour diamètre $[AB]$ avec $${point('A', px, py)}$ et $${point('B', 2 * a - px, 2 * b - py)}$. Donne les coordonnées de son centre.`,
      answer: { kind: 'pair', values: [frac(a), frac(b)], labels: ['x', 'y'] },
      hint: 'Le centre est le milieu du diamètre.',
      correction: [`$\\Omega\\left(\\frac{${px} + ${paren(2 * a - px)}}{2}\\,;\\,\\frac{${py} + ${paren(2 * b - py)}}{2}\\right) = (${a}\\,;\\,${b})$`],
    };
  }),
  variant('intersection-axe', (rng) => {
    const a = rng.int(-5, 5);
    const b = rng.int(-6, 6);
    const r = rng.int(1, 6);
    const n = Math.abs(b) < r ? 2 : Math.abs(b) === r ? 1 : 0;
    return {
      prompt: `En combien de points le cercle d'équation $${square('x', a)} + ${square('y', b)} = ${r * r}$ coupe-t-il l'axe des abscisses ?`,
      answer: { kind: 'number', value: frac(n) },
      hint: 'Sur l’axe des abscisses, $y = 0$ : compte les solutions de l’équation obtenue.',
      correction: [`Avec $y = 0$ : $${square('x', a)} = ${r * r - b * b}$, ${n === 2 ? 'deux solutions' : n === 1 ? 'une seule solution (le cercle est tangent à l’axe)' : 'aucune solution'}.`],
    };
  }),
];

const distanceVariantes = [
  variant('projete', (rng, level) => {
    const [a, b] = rng.pick(level === 1 ? [[1, 0], [0, 1]] : [[3, 4], [4, 3], [-3, 4], [4, -3], [1, 2], [2, -1], [1, 1]]);
    const hx = rng.int(-5, 5);
    const hy = rng.int(-5, 5);
    const c = -(a * hx + b * hy);
    const t = rng.nonZero(-3, 3);
    return {
      prompt: `Donne les coordonnées du projeté orthogonal $H$ du point $${point('M', hx + t * a, hy + t * b)}$ sur la droite $d : ${line(a, b, c)}$.`,
      answer: { kind: 'pair', values: [frac(hx), frac(hy)], labels: ['x', 'y'] },
      hint: '$H = M + t\\,\\vec{n}$, avec $t$ choisi pour que $H$ soit sur $d$.',
      correction: [`$H(${sumLatex([[hx + t * a, ''], [a, 't']])}\\,;\\,${sumLatex([[hy + t * b, ''], [b, 't']])})$ est sur $d$ pour $t = ${-t}$ : $${point('H', hx, hy)}$.`],
    };
  }),
  variant('droites-paralleles', (rng) => {
    const [a, b, n] = rng.pick([[3, 4, 5], [4, 3, 5], [-3, 4, 5], [1, 0, 1], [0, 1, 1], [5, 12, 13]]);
    const c = rng.int(-9, 9);
    const s = rng.nonZero(-3, 3);
    return {
      prompt: `Les droites $d : ${line(a, b, c)}$ et $d' : ${line(a, b, c + s * n)}$ sont parallèles. Quelle distance les sépare ?`,
      answer: { kind: 'number', value: frac(Math.abs(s)) },
      hint: 'Prends un point de $d$ et calcule sa distance à $d\'$ avec la formule $\\frac{|ax + by + c|}{\\sqrt{a^2 + b^2}}$.',
      correction: [`La distance vaut $\\frac{|${c + s * n} - ${paren(c)}|}{\\sqrt{${a * a + b * b}}} = \\frac{${Math.abs(s * n)}}{${n}} = ${Math.abs(s)}$.`],
    };
  }),
];

export const GEOMETRIE_REPEREE: ChapterDef = {
  id: '1re-geometrie-reperee',
  title: 'Géométrie repérée',
  region: 'Sommets du Repère',
  theme: 'neige',
  terrain: 'montagne',
  skills: [
    enrich(normal, normalVariantes),
    enrich(equationNormale, equationNormaleVariantes),
    enrich(perpendiculaire, perpendiculaireVariantes),
    enrich(cercleLecture, centreVariantes),
    enrich(cercleRayon, cercleRayonVariantes),
    enrich(distance, distanceVariantes),
  ],
  creatures: [
    {
      id: '1re-normalou',
      name: 'Normalou',
      description: 'Un petit flocon qui se tient toujours bien droit, perpendiculaire à sa piste.',
      skills: ['1re-geo-vecteur-normal'],
      look: { shape: 'blob', hue: 200, symbol: 'n' },
    },
    {
      id: '1re-equaneige',
      name: 'Équaneige',
      description: 'Un oiseau des cimes qui trace des droites dans la neige à partir d’un point et d’un vecteur.',
      skills: ['1re-geo-equation-normale', '1re-geo-vecteur-normal'],
      look: { shape: 'oiseau', hue: 210, symbol: '/' },
    },
    {
      id: '1re-perpendine',
      name: 'Perpendine',
      description: 'Une plante gelée dont chaque branche pousse à angle droit de la précédente.',
      skills: ['1re-geo-perpendiculaire', '1re-geo-equation-normale'],
      look: { shape: 'plante', hue: 175, symbol: '⊥' },
    },
    {
      id: '1re-cerclion',
      name: 'Cerclion',
      description: 'Un esprit des neiges qui dessine des cercles parfaits autour de son centre.',
      skills: ['1re-geo-cercle-centre', '1re-geo-cercle-rayon'],
      look: { shape: 'spectre', hue: 220, symbol: '○' },
    },
    {
      id: '1re-projetours',
      name: 'Projetours',
      description: 'Un ours polaire qui trouve toujours le chemin le plus court jusqu’à la piste.',
      skills: ['1re-geo-distance-droite', '1re-geo-cercle-rayon'],
      look: { shape: 'bete', hue: 205, symbol: 'H' },
    },
  ],
  boss: {
    id: '1re-reperog',
    name: 'Repérog',
    description: 'Le gardien des sommets, un géant de glace qui connaît les coordonnées de chaque cristal.',
    skills: ['1re-geo-vecteur-normal', '1re-geo-equation-normale', '1re-geo-perpendiculaire', '1re-geo-cercle-centre', '1re-geo-cercle-rayon', '1re-geo-distance-droite'],
    look: { shape: 'golem', hue: 210, symbol: '⌖' },
  },
};
