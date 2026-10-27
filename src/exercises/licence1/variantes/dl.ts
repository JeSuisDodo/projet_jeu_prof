import type { Frac } from '../../fraction';
import { type Fait, type Variantes, vraiFauxBanque } from '../../licenceVariantes';
import { F, add, fact, fixedChoice, mul, num, numF, par, sub, tex, texChoice } from '../util';

/** Variantes du chapitre « Développements limités » (feuille bibmath « Développements limités »). */

const ORDER = 6;
export type Series = Frac[];
const zero = (): Series => Array.from({ length: ORDER + 1 }, () => F(0));
export const sMul = (s: Series, t: Series): Series => {
  const out = zero();
  for (let i = 0; i <= ORDER; i++) for (let j = 0; i + j <= ORDER; j++) out[i + j] = add(out[i + j], mul(s[i], t[j]));
  return out;
};
const sAdd = (s: Series, t: Series): Series => s.map((c, i) => add(c, t[i]));
const sSub = (s: Series, t: Series): Series => s.map((c, i) => sub(c, t[i]));
const sScale = (s: Series, k: Frac): Series => s.map((c) => mul(c, k));
/** Coefficients d'une fonction usuelle f(u) en u = 0 (outer) ; g doit vérifier g(0) = 0. */
const OUTER: Record<string, (k: number) => Frac> = {
  exp: (k) => F(1, fact(k)),
  ln: (k) => (k === 0 ? F(0) : F(k % 2 ? 1 : -1, k)),
  geo: () => F(1),
  sin: (k) => (k % 2 ? F((k - 1) % 4 ? -1 : 1, fact(k)) : F(0)),
  cos: (k) => (k % 2 ? F(0) : F(k % 4 ? -1 : 1, fact(k))),
  sqrt: (k) => {
    let c = F(1);
    for (let i = 0; i < k; i++) c = mul(c, F(1 - 2 * i, 2 * (i + 1)));
    return c;
  },
};
/** Série de f(a·x). */
export const usual = (name: string, a = 1): Series => zero().map((_, k) => mul(OUTER[name](k), F(a ** k)));
/** Série de f(g(x)), avec g(0) = 0. */
export function compose(name: string, g: Series): Series {
  let out = zero();
  let power = zero();
  power[0] = F(1);
  for (let k = 0; k <= ORDER; k++) {
    out = sAdd(out, sScale(power, OUTER[name](k)));
    power = sMul(power, g);
  }
  return out;
}

const uTex = (a: number) => (a === 1 ? 'x' : a === -1 ? '-x' : `${a}x`);
const TEX: Record<string, (u: string) => string> = {
  exp: (u) => `e^{${u}}`,
  ln: (u) => `\\ln(1 + ${u})`.replace('+ -', '- '),
  geo: (u) => `\\frac{1}{1 - ${u}}`.replace('- -', '+ '),
  sin: (u) => `\\sin(${u})`,
  cos: (u) => `\\cos(${u})`,
  sqrt: (u) => `\\sqrt{1 + ${u}}`.replace('+ -', '- '),
};

/** Premier indice non nul d'une série. */
const valuation = (s: Series) => s.findIndex((c) => c.n !== 0);

const monoTex = (c: Frac, k: number) => {
  const abs = F(Math.abs(c.n), c.d);
  const coef = abs.n === 1 && abs.d === 1 && k > 0 ? '' : tex(abs);
  return `${c.n < 0 ? '-' : ''}${coef}${k === 0 ? '' : k === 1 ? 'x' : `x^{${k}}`}`;
};

/** Partie régulière jusqu'à l'ordre n, termes nuls omis. */
const seriesTex = (s: Series, n: number) =>
  s
    .slice(0, n + 1)
    .map((c, i) => (c.n === 0 ? '' : monoTex(c, i)))
    .filter(Boolean)
    .join(' + ')
    .replace(/\+ -/g, '- ') || '0';

const DLS: Fait[] = [
  { s: '$e^x = 1 + x + \\frac{x^2}{2} + o(x^2)$ en $0$.', v: true, why: 'Formule de Taylor-Young : les coefficients sont $\\frac{1}{k!}$.' },
  { s: '$\\ln(1 + x) = x + \\frac{x^2}{2} + o(x^2)$ en $0$.', v: false, why: 'Le signe alterne : $\\ln(1 + x) = x - \\frac{x^2}{2} + o(x^2)$.' },
  { s: '$\\cos x = 1 - \\frac{x^2}{2} + \\frac{x^4}{24} + o(x^4)$ en $0$.', v: true, why: 'Coefficients $\\frac{(-1)^k}{(2k)!}$.' },
  { s: '$\\sin x = x - \\frac{x^3}{3} + o(x^3)$ en $0$.', v: false, why: 'C’est $\\sin x = x - \\frac{x^3}{6} + o(x^3)$ : on divise par $3! = 6$.' },
  { s: '$\\frac{1}{1 + x} = 1 - x + x^2 + o(x^2)$ en $0$.', v: true, why: 'Série géométrique de raison $-x$.' },
  { s: '$\\sqrt{1 + x} = 1 + \\frac{x}{2} - \\frac{x^2}{8} + o(x^2)$ en $0$.', v: true, why: '$(1 + x)^{1/2}$ : coefficients $\\frac{1}{2}$ et $\\frac{\\frac12 \\cdot (-\\frac12)}{2} = -\\frac{1}{8}$.' },
  { s: '$\\tan x = x + \\frac{x^3}{3} + o(x^3)$ en $0$.', v: true, why: 'Par exemple en divisant le DL de $\\sin$ par celui de $\\cos$.' },
  { s: '$\\arctan x = x - \\frac{x^3}{3} + o(x^3)$ en $0$.', v: true, why: 'On intègre $\\frac{1}{1 + x^2} = 1 - x^2 + o(x^2)$.' },
  { s: '$\\sqrt{1 + x} = 1 + \\frac{x}{2} + \\frac{x^2}{4} + o(x^2)$ en $0$.', v: false, why: 'Le coefficient de $x^2$ vaut $-\\frac{1}{8}$.' },
  { s: 'Si $f(x) = 1 + 2x + o(x)$, alors $f(x) = 1 + 2x + 5x^2 + o(x)$.', v: true, why: '$5x^2 = o(x)$ : un DL à l’ordre $1$ ne dit rien sur le terme en $x^2$.' },
  { s: 'Une fonction qui a un DL à l’ordre $2$ en $0$ est deux fois dérivable en $0$.', v: false, why: '$x^3 \\sin\\frac{1}{x}$ (prolongée par $0$) a un DL d’ordre $2$ nul, mais n’est pas deux fois dérivable en $0$.' },
];

export const DL_VARIANTES: Variantes = {
  'l1-dl-usuel': [
    (rng) => vraiFauxBanque(rng, DLS, 'Retrouve les coefficients par la formule de Taylor : $\\frac{f^{(k)}(0)}{k!}$.'),
    // DL en 1 de 1/x ou de ln x.
    (rng) => {
      const k = rng.int(1, 5);
      const ln = rng.next() < 0.5;
      const v = ln ? F(k % 2 ? 1 : -1, k) : F(k % 2 ? -1 : 1);
      return {
        prompt: `Quel est le coefficient de $(x - 1)^{${k}}$ dans le développement limité en $1$ de $${ln ? '\\ln x' : '\\frac{1}{x}'}$ ?`,
        answer: numF(v),
        hint: `Pose $h = x - 1$ : $${ln ? '\\ln x = \\ln(1 + h)' : '\\frac{1}{x} = \\frac{1}{1 + h}'}$, puis DL en $h = 0$.`,
        correction: [ln ? `$\\ln(1 + h) = h - \\frac{h^2}{2} + \\frac{h^3}{3} - \\dots$` : '$\\frac{1}{1 + h} = 1 - h + h^2 - h^3 + \\dots$', `Coefficient : $${tex(v)}$`],
      };
    },
    // (1 + x)^α.
    (rng) => {
      const alpha = rng.pick([F(-1), F(-2), F(1, 3), F(-1, 2), F(3, 2), F(5)]);
      const k = rng.int(2, 3);
      let c = F(1);
      for (let i = 0; i < k; i++) c = mul(c, F(alpha.n - i * alpha.d, alpha.d * (i + 1)));
      return {
        prompt: `Quel est le coefficient de $x^{${k}}$ dans le développement limité en $0$ de $(1 + x)^{${tex(alpha)}}$ ?`,
        answer: numF(c),
        hint: '$(1 + x)^\\alpha = 1 + \\alpha x + \\frac{\\alpha(\\alpha - 1)}{2}x^2 + \\frac{\\alpha(\\alpha-1)(\\alpha-2)}{6}x^3 + o(x^3)$.',
        correction: [`$\\frac{\\alpha(\\alpha - 1)${k === 3 ? '(\\alpha - 2)' : ''}}{${fact(k)}}$ avec $\\alpha = ${tex(alpha)}$ : $${tex(c)}$`],
      };
    },
  ],
  'l1-dl-produit': [
    // (1 + bx)·f(ax).
    (rng) => {
      const name = rng.pick(['exp', 'ln', 'geo', 'sin', 'cos']);
      const a = rng.pick([1, 2, -1]);
      const b = rng.nonZero(-3, 3);
      const k = rng.int(2, 3);
      const p = zero();
      p[0] = F(1);
      p[1] = F(b);
      const s = sMul(p, usual(name, a));
      return {
        prompt: `Quel est le coefficient de $x^{${k}}$ dans le développement limité en $0$ de $(1 ${b < 0 ? '-' : '+'} ${uTex(Math.abs(b))})\\,${TEX[name](uTex(a))}$ ?`,
        answer: numF(s[k]),
        hint: 'Le coefficient de $x^k$ dans $(1 + bx)f(x)$ vaut $c_k + b\\,c_{k-1}$.',
        correction: [`$${tex(usual(name, a)[k])} + ${b < 0 ? `(${b})` : b} \\times ${usual(name, a)[k - 1].n < 0 ? `\\left(${tex(usual(name, a)[k - 1])}\\right)` : tex(usual(name, a)[k - 1])} = ${tex(s[k])}$`],
      };
    },
    // Somme ou différence de deux DL.
    (rng) => {
      const pairs: [string, string][] = [['exp', 'cos'], ['exp', 'geo'], ['sin', 'ln'], ['geo', 'cos'], ['exp', 'sqrt']];
      const [f, g] = rng.pick(pairs);
      const s = sSub(usual(f), usual(g));
      const k = valuation(s);
      return {
        prompt: `Le développement limité en $0$ de $${TEX[f]('x')} - ${TEX[g]('x')}$ commence par $c\\,x^{k}$ avec $c \\neq 0$. Donne $c$.`,
        answer: numF(s[k]),
        hint: 'Soustrais les deux DL terme à terme jusqu’au premier coefficient non nul.',
        correction: [`$${TEX[f]('x')} - ${TEX[g]('x')} = ${monoTex(s[k], k)} + o(x^{${k}})$`],
      };
    },
    // e^{ax} e^{bx} = e^{(a+b)x}.
    (rng) => {
      const a = rng.nonZero(-3, 3);
      const b = rng.nonZero(-3, 3);
      const k = rng.int(2, 4);
      const v = F((a + b) ** k, fact(k));
      return {
        prompt: `Quel est le coefficient de $x^{${k}}$ dans le développement limité en $0$ de $e^{${uTex(a)}}\\,e^{${uTex(b)}}$ ?`,
        answer: numF(v),
        hint: 'Avant de multiplier des DL, simplifie : $e^{ax}e^{bx} = e^{(a+b)x}$.',
        correction: [`$e^{${uTex(a + b) === '0x' ? '0' : uTex(a + b)}}$ : coefficient $\\frac{${par(a + b)}^{${k}}}{${k}!} = ${tex(v)}$`],
      };
    },
  ],
  'l1-dl-limite': [
    (rng) => {
      const a = rng.nonZero(-3, 3);
      const pool: [string, Frac][] = [
        [`\\frac{e^{${uTex(a)}} - 1 - ${uTex(a)}}{x^2}`.replace('- -', '+ '), F(a * a, 2)],
        [`\\frac{\\sin(${uTex(a)}) - ${uTex(a)}}{x^3}`.replace('- -', '+ '), F(-(a ** 3), 6)],
        [`\\frac{${TEX.ln(uTex(a))} - ${uTex(a)}}{x^2}`.replace('- -', '+ '), F(-a * a, 2)],
        [`\\frac{\\cos(${uTex(a)}) - 1}{x^2}`, F(-a * a, 2)],
        ['\\frac{1}{x} - \\frac{1}{\\sin x}', F(0)],
        ['\\frac{1}{x} - \\frac{1}{e^x - 1}', F(1, 2)],
        ['\\frac{1}{x^2} - \\frac{1}{\\sin^2 x}', F(-1, 3)],
        ['\\frac{x - \\sin x}{x - \\tan x}', F(-1, 2)],
      ];
      const [t, v] = rng.pick(pool);
      return {
        prompt: `Calcule $\\displaystyle\\lim_{x \\to 0} ${t}$.`,
        answer: numF(v),
        hint: 'Remplace chaque fonction par son DL à un ordre suffisant, puis simplifie.',
        correction: [`Avec les DL usuels, l’expression tend vers $${tex(v)}$.`],
      };
    },
    // (1 + a/x)^x en +∞ via DL : écrire e^{x ln(1 + a/x)}.
    (rng) => {
      const a = rng.nonZero(-3, 3);
      // x²(ln(1 + a/x) − a/x) → −a²/2.
      return {
        prompt: `Calcule $\\displaystyle\\lim_{x \\to +\\infty} x^2\\left(\\ln\\left(1 ${a < 0 ? '-' : '+'} \\frac{${Math.abs(a)}}{x}\\right) ${a < 0 ? '+' : '-'} \\frac{${Math.abs(a)}}{x}\\right)$.`,
        answer: numF(F(-a * a, 2)),
        hint: 'Pose $h = \\frac{1}{x} \\to 0$ et utilise $\\ln(1 + u) = u - \\frac{u^2}{2} + o(u^2)$.',
        correction: [`$\\ln(1 + ah) - ah = -\\frac{a^2h^2}{2} + o(h^2)$`, `Limite : $${tex(F(-a * a, 2))}$`],
      };
    },
  ],
  'l1-dl-composition': [
    (rng, level) => {
      const outer = rng.pick(['exp', 'ln', 'geo', 'sqrt']);
      const inners: [string, Series][] = [
        ['\\sin x', usual('sin')],
        ['e^x - 1', sSub(usual('exp'), (() => { const z = zero(); z[0] = F(1); return z; })())],
        ['\\ln(1 + x)', usual('ln')],
        ['x + x^2', (() => { const z = zero(); z[1] = F(1); z[2] = F(1); return z; })()],
      ];
      const [innerTex, g] = rng.pick(inners);
      const s = compose(outer, g);
      const k = level === 1 ? 2 : 3;
      return {
        prompt: `Quel est le coefficient de $x^{${k}}$ dans le développement limité en $0$ de $${TEX[outer](innerTex === 'x + x^2' ? '(x + x^2)' : innerTex).replace('1 + e^x - 1', 'e^x').replace('1 - e^x - 1', '2 - e^x')}$ ?`,
        answer: numF(s[k]),
        hint: 'Remplace $u$ par le DL de la fonction intérieure (qui tend vers $0$) dans le DL de la fonction extérieure, et ne garde que les termes de degré au plus $k$.',
        correction: [`Le développement commence par $${seriesTex(s, k)} + o(x^{${k}})$.`, `Coefficient de $x^{${k}}$ : $${tex(s[k])}$`],
      };
    },
    // cos(sin x), e^{cos x − 1}…
    (rng) => {
      const pool: [string, Series][] = [
        ['e^{\\cos x - 1}', compose('exp', sSub(usual('cos'), (() => { const z = zero(); z[0] = F(1); return z; })()))],
        ['\\ln(\\cos x)', compose('ln', sSub(usual('cos'), (() => { const z = zero(); z[0] = F(1); return z; })()))],
        ['\\sqrt{\\cos x}', compose('sqrt', sSub(usual('cos'), (() => { const z = zero(); z[0] = F(1); return z; })()))],
        ['\\frac{1}{\\cos x}', compose('geo', sSub((() => { const z = zero(); z[0] = F(1); return z; })(), usual('cos')))],
      ];
      const [t, s] = rng.pick(pool);
      const k = rng.pick([2, 4]);
      return {
        prompt: `Quel est le coefficient de $x^{${k}}$ dans le développement limité en $0$ de $${t}$ ?`,
        answer: numF(s[k]),
        hint: 'Écris $\\cos x = 1 + u$ avec $u = -\\frac{x^2}{2} + \\frac{x^4}{24} + o(x^4)$, puis compose.',
        correction: [`$${t} = ${seriesTex(s, 4)} + o(x^4)$`],
      };
    },
  ],
  'l1-dl-equivalent': [
    // Ordre du premier terme non nul.
    (rng) => {
      const pool: [string, Series][] = [
        ['\\sin x - x\\cos x', sSub(usual('sin'), sMul((() => { const z = zero(); z[1] = F(1); return z; })(), usual('cos')))],
        ['e^x - 1 - x', sSub(usual('exp'), (() => { const z = zero(); z[0] = F(1); z[1] = F(1); return z; })())],
        ['\\ln(1 + x) - \\sin x', sSub(usual('ln'), usual('sin'))],
        ['\\cos x - 1 + \\frac{x^2}{2}', sAdd(usual('cos'), (() => { const z = zero(); z[0] = F(-1); z[2] = F(1, 2); return z; })())],
        ['e^x - \\frac{1}{1 - x}', sSub(usual('exp'), usual('geo'))],
        ['\\sin x - \\ln(1 + x)', sSub(usual('sin'), usual('ln'))],
        ['x - \\sin x', sSub((() => { const z = zero(); z[1] = F(1); return z; })(), usual('sin'))],
      ];
      const [t, s] = rng.pick(pool);
      const k = valuation(s);
      const askCoef = rng.next() < 0.5;
      return {
        prompt: askCoef ? `$${t} \\sim c\\,x^k$ quand $x \\to 0$. Donne $c$.` : `$${t} \\sim c\\,x^k$ quand $x \\to 0$ (avec $c \\neq 0$). Donne $k$.`,
        answer: askCoef ? numF(s[k]) : num(k),
        hint: 'Fais un DL et garde le premier terme non nul.',
        correction: [`$${t} = ${monoTex(s[k], k)} + o(x^{${k}})$`],
      };
    },
    // Position de la courbe par rapport à sa tangente en 0.
    (rng) => {
      const pool: [string, Series][] = [
        ['e^x', usual('exp')],
        ['\\ln(1 + x)', usual('ln')],
        ['\\frac{1}{1 - x}', usual('geo')],
        ['\\cos x', usual('cos')],
        ['\\sqrt{1 + x}', usual('sqrt')],
        ['e^{-x}', usual('exp', -1)],
        ['\\ln(1 - x)', usual('ln', -1)],
      ];
      const [t, s] = rng.pick(pool);
      const above = s[2].n > 0;
      return {
        prompt: `Au voisinage de $0$, la courbe de $f(x) = ${t}$ est-elle au-dessus ou en dessous de sa tangente en $0$ ?`,
        answer: fixedChoice(['Au-dessus', 'En dessous'], above ? 0 : 1),
        hint: 'Le signe de $f(x) - (f(0) + f\'(0)x)$ est celui du premier terme suivant du DL.',
        correction: [`$f(x) - (${monoTex(s[0], 0)}${s[1].n === 0 ? '' : ` ${s[1].n < 0 ? '-' : '+'} ${monoTex(F(Math.abs(s[1].n), s[1].d), 1)}`}) = ${monoTex(s[2], 2)} + o(x^2)$`, above ? 'Positif près de $0$ : au-dessus.' : 'Négatif près de $0$ : en dessous.'],
      };
    },
    // QCM d'équivalents.
    (rng) => {
      const pool: [string, string, string[]][] = [
        ['\\tan x - \\sin x', '\\frac{x^3}{2}', ['0', 'x^3', '\\frac{x^3}{6}']],
        ['e^x - 1 - x', '\\frac{x^2}{2}', ['x', '0', 'x^2']],
        ['x - \\ln(1 + x)', '\\frac{x^2}{2}', ['-\\frac{x^2}{2}', 'x', '0']],
        ['1 - \\cos(2x)', '2x^2', ['\\frac{x^2}{2}', '4x^2', 'x^2']],
        ['\\sqrt{1 + x} - 1', '\\frac{x}{2}', ['x', '\\sqrt{x}', '\\frac{x}{4}']],
        ['\\sin(x^2)', 'x^2', ['x', '2x', '\\sin^2 x']],
      ];
      const [f, c, d] = rng.pick(pool);
      return {
        prompt: `Quel est un équivalent de $${f}$ quand $x \\to 0$ ?`,
        answer: texChoice(rng, c, d),
        hint: 'Un équivalent n’est jamais $0$ : pousse le DL jusqu’au premier terme non nul.',
        correction: [`$${f} \\sim ${c}$`],
      };
    },
  ],
};

export const BANQUES_DL = { DLS };
