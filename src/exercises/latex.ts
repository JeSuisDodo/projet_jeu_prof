import { type Frac, fracLatex } from './fraction';

function leading(a: number): string {
  return a === 1 ? '' : a === -1 ? '-' : String(a);
}

/** ax² + bx + c en LaTeX, coefficients entiers. */
export function polyLatex(a: number, b: number, c: number): string {
  let out = `${leading(a)}x^2`;
  if (b !== 0) out += ` ${b < 0 ? '-' : '+'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}x`;
  if (c !== 0) out += ` ${c < 0 ? '-' : '+'} ${Math.abs(c)}`;
  return out;
}

/** (x - r) en LaTeX, r entier ou rationnel. */
export function linearFactor(r: Frac | number): string {
  const f = typeof r === 'number' ? { n: r, d: 1 } : r;
  if (f.n === 0) return 'x';
  return `(x ${f.n > 0 ? '-' : '+'} ${fracLatex({ n: Math.abs(f.n), d: f.d })})`;
}

/** a(x - α)² + β */
export function canonicalLatex(a: number, alpha: number, beta: number): string {
  const square = alpha === 0 ? 'x^2' : `${linearFactor(alpha)}^2`;
  let out = `${leading(a)}${square}`;
  if (beta !== 0) out += ` ${beta < 0 ? '-' : '+'} ${Math.abs(beta)}`;
  return out;
}

/** a(x - r₁)(x - r₂) */
export function factoredLatex(a: number, r1: number, r2: number): string {
  if (r1 === r2) return `${leading(a)}${linearFactor(r1)}^2`;
  return `${leading(a)}${linearFactor(r1)}${linearFactor(r2)}`;
}

/** Nombre entre parenthèses s'il est négatif, pour les substitutions. */
export const paren = (v: number) => (v < 0 ? `(${v})` : String(v));
