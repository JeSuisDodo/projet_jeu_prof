import { type Frac, frac } from './fraction';

/**
 * Calcul exact d'une expression rationnelle tapée par l'élève : « 4! », « 4×3×2×1 », « 2^10 »,
 * « (3+1)/2 », « C(5,2) », « 2 parmi 5 ». Renvoie null si l'expression est illisible ou
 * sort des entiers exacts du navigateur.
 */

const SUP: Record<string, string> = {
  '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-',
};

const safe = (f: Frac) => Number.isSafeInteger(f.n) && Number.isSafeInteger(f.d);

function mul(a: Frac, b: Frac): Frac {
  return frac(a.n * b.n, a.d * b.d);
}

function add(a: Frac, b: Frac): Frac {
  return frac(a.n * b.d + b.n * a.d, a.d * b.d);
}

function pow(a: Frac, e: Frac): Frac | null {
  if (e.d !== 1 || Math.abs(e.n) > 64) return null;
  if (a.n === 0 && e.n < 0) return null;
  let out = frac(1);
  for (let i = 0; i < Math.abs(e.n); i++) {
    out = mul(out, a);
    if (!safe(out)) return null;
  }
  return e.n < 0 ? frac(out.d, out.n) : out;
}

function factorial(a: Frac): Frac | null {
  if (a.d !== 1 || a.n < 0 || a.n > 18) return null;
  let out = 1;
  for (let i = 2; i <= a.n; i++) out *= i;
  return frac(out);
}

function binomial(n: Frac, k: Frac): Frac | null {
  if (n.d !== 1 || k.d !== 1 || n.n < 0 || n.n > 60) return null;
  if (k.n < 0 || k.n > n.n) return frac(0);
  let out = 1;
  for (let i = 1; i <= k.n; i++) out = (out * (n.n - k.n + i)) / i;
  return frac(Math.round(out));
}

function arrangements(n: Frac, k: Frac): Frac | null {
  if (n.d !== 1 || k.d !== 1 || n.n < 0 || k.n < 0 || n.n > 60) return null;
  if (k.n > n.n) return frac(0);
  let out = 1;
  for (let i = 0; i < k.n; i++) out *= n.n - i;
  return frac(out);
}

class Parser {
  private i = 0;
  constructor(private readonly s: string) {}

  private peek(): string {
    return this.s[this.i] ?? '';
  }

  private eat(c: string): boolean {
    if (this.s.startsWith(c, this.i)) {
      this.i += c.length;
      return true;
    }
    return false;
  }

  parse(): Frac | null {
    const v = this.expr(false);
    return v && this.i === this.s.length && safe(v) ? v : null;
  }

  private expr(inArgs: boolean): Frac | null {
    let v = this.term(inArgs);
    while (v) {
      if (this.eat('+')) {
        const r = this.term(inArgs);
        v = r && add(v, r);
      } else if (this.eat('-')) {
        const r = this.term(inArgs);
        v = r && add(v, frac(-r.n, r.d));
      } else break;
      if (v && !safe(v)) return null;
    }
    return v;
  }

  private term(inArgs: boolean): Frac | null {
    let v = this.unary(inArgs);
    while (v) {
      if (this.eat('*')) {
        const r = this.unary(inArgs);
        v = r && mul(v, r);
      } else if (this.eat('/')) {
        const r = this.unary(inArgs);
        v = r && r.n !== 0 ? mul(v, frac(r.d, r.n)) : null;
      } else if (/[0-9(a-z]/.test(this.peek())) {
        // Multiplication sous-entendue : 2(3+1), (2+1)(3+1), 3C(5,2).
        const r = this.unary(inArgs);
        v = r && mul(v, r);
      } else break;
      if (v && !safe(v)) return null;
    }
    return v;
  }

  private unary(inArgs: boolean): Frac | null {
    if (this.eat('-')) {
      const v = this.unary(inArgs);
      return v && frac(-v.n, v.d);
    }
    if (this.eat('+')) return this.unary(inArgs);
    return this.power(inArgs);
  }

  private power(inArgs: boolean): Frac | null {
    const base = this.postfix(inArgs);
    if (base && this.eat('^')) {
      const e = this.unary(inArgs);
      return e && pow(base, e);
    }
    return base;
  }

  private postfix(inArgs: boolean): Frac | null {
    let v = this.primary(inArgs);
    while (v && this.eat('!')) v = factorial(v);
    return v;
  }

  private primary(inArgs: boolean): Frac | null {
    if (this.eat('(')) {
      const v = this.expr(false);
      return v && this.eat(')') ? v : null;
    }
    const fn = /^(binom|comb|c|a)\(/.exec(this.s.slice(this.i));
    if (fn) {
      this.i += fn[0].length;
      const n = this.expr(true);
      if (!n || !(this.eat(',') || this.eat(';'))) return null;
      const k = this.expr(true);
      if (!k || !this.eat(')')) return null;
      return fn[1] === 'a' ? arrangements(n, k) : binomial(n, k);
    }
    // Dans les arguments d'une fonction, la virgule sépare ; ailleurs, c'est la virgule décimale.
    const m = (inArgs ? /^(\d+)(?:\.(\d+))?/ : /^(\d+)(?:[.,](\d+))?/).exec(this.s.slice(this.i));
    if (!m) return null;
    this.i += m[0].length;
    const decimals = m[2] ?? '';
    return frac(Number(m[1] + decimals), 10 ** decimals.length);
  }
}

/** Écriture homogène : opérateurs ASCII, puissances en « ^ », sans espaces. */
function normalize(raw: string, xIsTimes: boolean): string {
  let s = raw
    .toLowerCase()
    .replace(/[−–—]/g, '-')
    .replace(/[×·∙⋅]/g, '*')
    .replace(/[÷:]/g, '/')
    .replace(/\*\*/g, '^')
    .replace(/[[{]/g, '(')
    .replace(/[\]}]/g, ')')
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+/g, (sup) => `^(${[...sup].map((c) => SUP[c]).join('')})`)
    .replace(/(\d+)\s*parmi\s*(\d+)/g, 'c($2,$1)');
  // « 4x3x2x1 » : le x entre deux nombres est un signe de multiplication.
  if (xIsTimes) s = s.replace(/(\d|\))\s*x\s*(?=[\d(])/g, '$1*');
  return s.replace(/\s+/g, '');
}

export function evalExpression(raw: string): Frac | null {
  const s = normalize(raw, true);
  if (s === '' || s.length > 80) return null;
  return new Parser(s).parse();
}

/** Vrai si l'écriture contient une opération (et n'est donc pas un simple nombre ou une fraction a/b). */
export function isComputation(raw: string): boolean {
  const s = normalize(raw, true).replace(/^[+-]/, '');
  return !/^\d+(?:[.,]\d+)?(?:\/[+-]?\d+)?$/.test(s);
}

/** Traduit le LaTeX d'un énoncé en écriture lisible par evalExpression. */
function latexToPlain(tex: string): string {
  let s = tex
    .replace(/\\left|\\right|\\displaystyle/g, '')
    .replace(/\{,\}/g, '.')
    .replace(/\\[,;!: ]|~/g, '')
    .replace(/\\(?:times|cdot)/g, '*')
    .replace(/\\div/g, '/');
  // Fractions et coefficients binomiaux, des plus intérieurs aux plus extérieurs.
  for (let guard = 0; guard < 10; guard++) {
    const next = s
      .replace(/\\[dt]?frac\{([^{}]*)\}\{([^{}]*)\}/g, '(($1)/($2))')
      .replace(/\\[dt]?binom\{([^{}]*)\}\{([^{}]*)\}/g, 'c($1,$2)')
      .replace(/\^\{([^{}]*)\}/g, '^($1)');
    if (next === s) break;
    s = next;
  }
  return s;
}

/** Les calculs (avec opération) écrits dans l'énoncé, avec leur valeur exacte. */
function promptComputations(prompt: string): Frac[] {
  const out: Frac[] = [];
  for (const m of prompt.matchAll(/\$([^$]+)\$/g)) {
    for (const side of latexToPlain(m[1]).split(/=|<|>|\\[lg]eq?|\\approx/)) {
      if (/\\|[a-z]/i.test(side.replace(/\bc\(/g, ''))) continue;
      const s = normalize(side, false);
      if (!isComputation(s)) continue;
      const v = new Parser(s).parse();
      if (v) out.push(v);
    }
  }
  return out;
}

/**
 * Vrai si l'élève a recopié (ou réordonné) un calcul de l'énoncé au lieu de l'effectuer :
 * « 7×8 » à « Calcule 7×8 », « 3^-2 » à « Écris 3^-2 sous forme de fraction ».
 */
export function restatesPrompt(prompt: string, response: string): boolean {
  if (!isComputation(response)) return false;
  const v = evalExpression(response);
  if (!v) return false;
  return promptComputations(prompt).some((p) => p.n === v.n && p.d === v.d);
}
