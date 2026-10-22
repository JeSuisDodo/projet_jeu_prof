import { type Frac, frac } from '../fraction';
import type { Rng } from '../rng';
import type { Answer, Level, Skill } from '../types';
import { type Draft, tex } from '../terminale/util';

/** Outils partagés par les chapitres de L2 (en plus de ceux de Terminale, réexportés). */

export * from '../terminale/util';

/** Retire les écritures maladroites produites par les valeurs particulières : « x^{1} », « \\frac{3}{1} ». */
export const tidy = (t: string) => t.replace(/([a-zA-Z)])\^\{1\}/g, '$1').replace(/\\d?frac\{([^{}]+)\}\{1\}(?![a-zA-Z])/g, '$1');

/** Comme `skill` de Terminale, avec un nettoyage des textes. */
export function skill(id: string, name: string, make: (rng: Rng, level: Level) => Draft): Skill {
  return {
    id,
    name,
    generate: (rng, level) => {
      const d = make(rng, level);
      const answer = d.answer.kind === 'choice' ? { ...d.answer, options: d.answer.options.map(tidy) } : d.answer;
      return { skill: id, level, prompt: tidy(d.prompt), hint: tidy(d.hint), correction: d.correction.map(tidy), answer };
    },
  };
}

export type Mat = number[][];

/** Matrice en LaTeX ; les coefficients peuvent être des entiers ou des fractions. */
export const mat = (m: (number | Frac)[][]) =>
  `\\begin{pmatrix}${m.map((row) => row.map((v) => (typeof v === 'number' ? String(v) : tex(v))).join(' & ')).join(' \\\\ ')}\\end{pmatrix}`;

export const matMul = (a: Mat, b: Mat): Mat => a.map((row) => b[0].map((_, j) => row.reduce((s, v, k) => s + v * b[k][j], 0)));

export const det2 = (m: Mat) => m[0][0] * m[1][1] - m[0][1] * m[1][0];

export const det3 = (m: Mat) =>
  m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);

export const trace = (m: Mat) => m.reduce((s, row, i) => s + row[i], 0);

/** Matrice 2×2 entière de déterminant 1 (et son inverse entier), pour fabriquer A = PDP⁻¹ à coefficients entiers. */
export function unimodular(rng: Rng, small = false): { P: Mat; Pinv: Mat } {
  const p = rng.int(small ? 0 : -1, small ? 1 : 2);
  const q = rng.pick(p === 0 ? [1, -1] : [1, -1, 0]);
  const P = [
    [1, p],
    [q, 1 + p * q],
  ];
  const Pinv = [
    [1 + p * q, -p],
    [-q, 1],
  ];
  return { P, Pinv };
}

/** A = P · diag(d) · P⁻¹, à coefficients entiers. */
export const conjugate = (P: Mat, Pinv: Mat, D: Mat) => matMul(matMul(P, D), Pinv);

export const diag = (values: number[]): Mat => values.map((v, i) => values.map((_, j) => (i === j ? v : 0)));

export const setOf = (values: (number | Frac)[]): Answer => {
  const fr = values.map((v) => (typeof v === 'number' ? frac(v) : v));
  return { kind: 'set', values: fr.filter((f, i) => fr.findIndex((g) => g.n === f.n && g.d === f.d) === i) };
};

export const pairOf = (a: number | Frac, b: number | Frac, labels: [string, string]): Answer => ({
  kind: 'pair',
  values: [typeof a === 'number' ? frac(a) : a, typeof b === 'number' ? frac(b) : b],
  labels,
});

/** Liste de valeurs en LaTeX : « 1, -2 et 3 ». */
export const listTex = (values: number[]) => (values.length === 1 ? String(values[0]) : `${values.slice(0, -1).join(', ')} \\text{ et } ${values[values.length - 1]}`);

/** Options fixes « convergente / divergente » partagées par les chapitres de séries et d'intégrales. */
export const NATURE = ['Convergente', 'Divergente'];

/** Somme de fractions en LaTeX, termes nuls omis : « \\frac{1}{3} - 2 + \\frac{1}{4} ». */
export function sumF(terms: Frac[]): string {
  let out = '';
  for (const t of terms) {
    if (t.n === 0) continue;
    const abs = tex(frac(Math.abs(t.n), t.d));
    out += out === '' ? (t.n < 0 ? `-${abs}` : abs) : ` ${t.n < 0 ? '-' : '+'} ${abs}`;
  }
  return out || '0';
}
