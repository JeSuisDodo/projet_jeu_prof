import { frac, fracLatex } from '../../exercises/fraction';
import { paren, sumLatex } from '../../exercises/latex';
import { type Skill, makeChoice } from '../../exercises/types';
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

export const GEOMETRIE_REPEREE: ChapterDef = {
  id: '1re-geometrie-reperee',
  title: 'Géométrie repérée',
  region: 'Sommets du Repère',
  theme: 'neige',
  skills: [normal, equationNormale, perpendiculaire, cercleLecture, cercleRayon, distance],
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
