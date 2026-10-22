import { sumLatex } from '../../exercises/latex';

/** Polynôme à coefficients entiers, du degré 0 au degré le plus haut : [c0, c1, c2, c3]. */
export type Poly = number[];

export const polyEval = (p: Poly, x: number) => p.reduce((acc, c, i) => acc + c * x ** i, 0);

export const polyDeriv = (p: Poly): Poly => p.slice(1).map((c, i) => c * (i + 1));

/** LaTeX du polynôme, puissances décroissantes : 2x^3 - x + 4. */
export function polyTex(p: Poly, v = 'x'): string {
  const terms: [number, string][] = [];
  for (let i = p.length - 1; i >= 0; i--) terms.push([p[i] ?? 0, i === 0 ? '' : i === 1 ? v : `${v}^${i}`]);
  return sumLatex(terms);
}

/** Droite y = mx + p en LaTeX. */
export const lineTex = (m: number, p: number) => `y = ${sumLatex([[m, 'x'], [p, '']])}`;
