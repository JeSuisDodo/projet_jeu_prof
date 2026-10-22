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

/** Retire ce qui entoure souvent une réponse : guillemets, crochets, parenthèses, point final, « x = ». */
function clean(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[−–—]/g, '-')
    .replace(/[«»"“”„'‘’`´{}[\]()∅%€]/g, ' ')
    .replace(/\b[a-z]\s*_?\s*[0-9₀-₉]?\s*=/g, ' ')
    .replace(/[.\s]+$/, '')
    .trim();
}

/** Lit une réponse d'élève : entier, décimal (point ou virgule) ou fraction « a/b ». */
export function parseFrac(raw: string): Frac | null {
  const s = clean(raw).replace(/\s+/g, '').replace(',', '.');
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

function parseParts(parts: string[]): Frac[] | null {
  const out: Frac[] = [];
  for (const p of parts) {
    if (p.trim() === '') continue;
    const f = parseFrac(p);
    if (!f) return null;
    out.push(f);
  }
  return out;
}

/**
 * Toutes les façons raisonnables de lire une liste de solutions. Le séparateur conseillé est « ; »,
 * mais on accepte aussi « et », « ou », « / » entouré d'espaces, la virgule et les espaces.
 * « 2,5 » reste ambigu (2,5 ou {2 ; 5}) : les deux lectures sont proposées.
 */
export function parseFracLists(raw: string): Frac[][] {
  const s = clean(raw).replace(/\b(et|ou)\b|\s\/\s|\|/g, ';');
  if (s === '' || /^(aucun|vide|pas de solution|impossible)/.test(s)) return [[]];
  const splits = s.includes(';') ? [s.split(';')] : [[s], s.split(','), s.split(/\s+/), s.split(/[,\s]+/)];
  const lists: Frac[][] = [];
  for (const parts of splits) {
    const list = parseParts(parts);
    if (list && list.length > 0) lists.push(list);
  }
  return lists;
}

/** Première lecture d'une liste de solutions, ou null si rien n'est lisible. */
export function parseFracList(raw: string): Frac[] | null {
  return parseFracLists(raw)[0] ?? null;
}
