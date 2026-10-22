/** Nombre rationnel exact, toujours réduit et de dénominateur positif. */
export interface Frac {
  n: number;
  d: number;
}

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

export function frac(n: number, d = 1): Frac {
  if (d === 0) throw new Error('Dénominateur nul');
  if (d < 0) {
    n = -n;
    d = -d;
  }
  const g = gcd(n, d);
  return { n: n / g + 0, d: d / g };
}

export const fracEq = (a: Frac, b: Frac) => a.n === b.n && a.d === b.d;

export function fracLatex(f: Frac): string {
  if (f.d === 1) return String(f.n);
  return `${f.n < 0 ? '-' : ''}\\frac{${Math.abs(f.n)}}{${f.d}}`;
}

/** Lit une réponse d'élève : entier, décimal (point ou virgule) ou fraction « a/b ». */
export function parseFrac(raw: string): Frac | null {
  const s = raw.trim().replace(/\s+/g, '').replace(/[−–]/g, '-').replace(',', '.');
  const asFraction = /^([+-]?\d+)\/([+-]?\d+)$/.exec(s);
  if (asFraction) {
    const d = Number(asFraction[2]);
    return d === 0 ? null : frac(Number(asFraction[1]), d);
  }
  const asDecimal = /^([+-]?)(\d+)(?:\.(\d+))?$/.exec(s);
  if (asDecimal) {
    const decimals = asDecimal[3] ?? '';
    const scale = 10 ** decimals.length;
    const n = Number(asDecimal[2] + decimals) * (asDecimal[1] === '-' ? -1 : 1);
    return frac(n, scale);
  }
  return null;
}

/** Lit une liste de nombres séparés par « ; » (accolades et « x = » tolérés). Liste vide pour « aucune ». */
export function parseFracList(raw: string): Frac[] | null {
  const s = raw.trim().toLowerCase().replace(/[{}∅]/g, '').replace(/s\s*=/g, '');
  if (s === '' || /^aucun/.test(s) || s === 'vide') return [];
  const parts = s.split(/;|\bet\b|\bou\b/).map((p) => p.replace(/x_?\s*\d?\s*=/g, '').trim());
  const out: Frac[] = [];
  for (const p of parts) {
    if (p === '') continue;
    const f = parseFrac(p);
    if (!f) return null;
    out.push(f);
  }
  return out;
}
