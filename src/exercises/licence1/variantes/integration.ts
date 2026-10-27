import type { Frac } from '../../fraction';
import { type Fait, type Variantes, qcmBanque, vraiFauxBanque } from '../../licenceVariantes';
import { F, add, affine, mul, num, numF, pairOf, par, poly, tex, texChoice } from '../util';

/** Variantes du chapitre « Intégration » (feuilles bibmath « Calcul de primitives » et « Intégrale sur un segment »). */

const INTEGRALES: Fait[] = [
  { s: '$\\displaystyle\\int_a^b f(x)g(x)\\,dx = \\int_a^b f(x)\\,dx \\times \\int_a^b g(x)\\,dx$.', v: false, why: 'Sur $[0, 1]$ avec $f = g = x$ : $\\frac{1}{3} \\neq \\frac{1}{4}$.' },
  { s: '$\\displaystyle\\int_a^b (\\lambda f + g) = \\lambda \\int_a^b f + \\int_a^b g$.', v: true, why: 'L’intégrale est linéaire.' },
  { s: 'Si $f \\geq 0$ sur $[a, b]$ (avec $a \\leq b$), alors $\\int_a^b f \\geq 0$.', v: true, why: 'C’est la positivité de l’intégrale.' },
  { s: 'Si $f$ est continue, positive sur $[a, b]$ et $\\int_a^b f = 0$, alors $f = 0$ sur $[a, b]$.', v: true, why: 'Sinon $f$ serait strictement positive sur un petit intervalle, d’intégrale strictement positive.' },
  { s: 'Si $\\int_a^b f = 0$, alors $f = 0$ sur $[a, b]$.', v: false, why: '$\\int_{-1}^{1} x\\,dx = 0$ alors que $x \\mapsto x$ n’est pas nulle.' },
  { s: 'Toute fonction continue sur un intervalle admet une primitive.', v: true, why: '$x \\mapsto \\int_a^x f(t)\\,dt$ en est une (théorème fondamental de l’analyse).' },
  { s: '$\\left|\\int_a^b f\\right| \\leq \\int_a^b |f|$ pour $a \\leq b$.', v: true, why: 'C’est l’inégalité triangulaire intégrale.' },
  { s: 'Si $f$ est impaire et continue, $\\int_{-a}^{a} f = 0$.', v: true, why: 'Le changement de variable $t = -x$ donne $I = -I$.' },
  { s: 'La dérivée de $x \\mapsto \\int_0^{x^2} f(t)\\,dt$ est $f(x^2)$.', v: false, why: 'Il faut dériver la composée : $2x f(x^2)$.' },
  { s: 'Deux primitives d’une même fonction sur un intervalle diffèrent d’une constante.', v: true, why: 'Leur différence a une dérivée nulle sur un intervalle.' },
];

/** Polynôme intégré exactement : ∫_a^b Σ c_k x^k. */
export const integratePoly = (coefs: number[], a: number, b: number): Frac => {
  let s = F(0);
  const n = coefs.length - 1;
  coefs.forEach((c, i) => {
    const k = n - i;
    s = add(s, F(c * (b ** (k + 1) - a ** (k + 1)), k + 1));
  });
  return s;
};

export const INTEGRATION_VARIANTES: Variantes = {
  'l1-integration-parties': [
    // ∫_0^1 x(1 − x)^n dx = 1/((n+1)(n+2)).
    (rng) => {
      const n = rng.int(2, 9);
      return {
        prompt: `Calcule $\\displaystyle\\int_0^1 x(1 - x)^{${n}}\\,dx$.`,
        answer: numF(F(1, (n + 1) * (n + 2))),
        hint: `Pose $u = x$ et $v' = (1 - x)^{${n}}$, donc $v = -\\frac{(1 - x)^{${n + 1}}}{${n + 1}}$.`,
        correction: [`$\\left[-\\frac{x(1 - x)^{${n + 1}}}{${n + 1}}\\right]_0^1 + \\frac{1}{${n + 1}}\\displaystyle\\int_0^1 (1 - x)^{${n + 1}}dx = 0 + \\frac{1}{${n + 1}\\times${n + 2}}$`, `$= ${tex(F(1, (n + 1) * (n + 2)))}$`],
      };
    },
    // Intégrales à valeur entière ou en π.
    (rng) => {
      const pool: [string, string, string[], string][] = [
        ['\\int_0^{\\pi} x\\cos x\\,dx', '-2', ['2', '0', '\\pi'], '$[x\\sin x]_0^\\pi - \\int_0^\\pi \\sin x\\,dx = 0 - 2$'],
        ['\\int_0^{\\pi/2} x\\sin x\\,dx', '1', ['\\frac{\\pi}{2}', '0', '-1'], '$[-x\\cos x]_0^{\\pi/2} + \\int_0^{\\pi/2} \\cos x\\,dx = 0 + 1$'],
        ['\\int_0^1 x e^x\\,dx', '1', ['e', 'e - 1', '0'], '$[xe^x]_0^1 - \\int_0^1 e^x\\,dx = e - (e - 1)$'],
        ['\\int_0^1 \\ln(1 + x)\\,dx', '2\\ln 2 - 1', ['\\ln 2', '1 - \\ln 2', '2\\ln 2'], '$[(1 + x)\\ln(1 + x) - x]_0^1 = 2\\ln 2 - 1$'],
        ['\\int_0^1 \\arctan x\\,dx', '\\frac{\\pi}{4} - \\frac{\\ln 2}{2}', ['\\frac{\\pi}{4}', '\\frac{\\pi}{4} + \\frac{\\ln 2}{2}', '\\frac{\\ln 2}{2}'], '$[x\\arctan x]_0^1 - \\int_0^1 \\frac{x}{1 + x^2}dx = \\frac{\\pi}{4} - \\frac{\\ln 2}{2}$'],
        ['\\int_0^{\\pi} x^2\\sin x\\,dx', '\\pi^2 - 4', ['\\pi^2', '\\pi^2 + 4', '4 - \\pi^2'], 'Deux intégrations par parties : $\\pi^2 - 2\\int_0^\\pi x\\cos x\\,dx = \\pi^2 - 4$.'],
      ];
      const [t, c, d, why] = rng.pick(pool);
      return {
        prompt: `Calcule $\\displaystyle${t}$.`,
        answer: texChoice(rng, c, d),
        hint: 'Dérive le facteur qui se simplifie (polynôme, logarithme, arctangente) et intègre l’autre.',
        correction: [why],
      };
    },
    // Relation de récurrence : I_n = ∫_0^1 x^n e^x dx.
    (rng) => {
      const forms: [string, string, string[]][] = [
        ['I_n = \\displaystyle\\int_0^1 x^n e^x\\,dx', 'I_n = e - nI_{n-1}', ['I_n = e + nI_{n-1}', 'I_n = nI_{n-1}', 'I_n = e - I_{n-1}']],
        ['I_n = \\displaystyle\\int_1^e (\\ln x)^n\\,dx', 'I_n = e - nI_{n-1}', ['I_n = e + nI_{n-1}', 'I_n = 1 - nI_{n-1}', 'I_n = nI_{n-1} - e']],
        ['W_n = \\displaystyle\\int_0^{\\pi/2} \\sin^n x\\,dx', 'W_n = \\frac{n-1}{n}W_{n-2}', ['W_n = \\frac{n}{n-1}W_{n-2}', 'W_n = (n-1)W_{n-2}', 'W_n = \\frac{1}{n}W_{n-1}']],
      ];
      const [def, c, d] = rng.pick(forms);
      return {
        prompt: `On pose $${def}$ ($n \\geq ${c.startsWith('W') ? 2 : 1}$). Quelle relation donne une intégration par parties ?`,
        answer: texChoice(rng, c, d),
        hint: 'Dérive la puissance $n$-ième, intègre le reste.',
        correction: [`On obtient $${c}$.`],
      };
    },
  ],
  'l1-changement-variable': [
    // ∫_0^a x√(x² + c²) dx avec a² + c² = r².
    (rng) => {
      const [a, c, r] = rng.pick([[3, 4, 5], [4, 3, 5], [6, 8, 10], [8, 6, 10], [5, 12, 13], [12, 5, 13]]);
      const v = F(r ** 3 - c ** 3, 3);
      return {
        prompt: `Calcule $\\displaystyle\\int_0^{${a}} x\\sqrt{x^2 + ${c * c}}\\,dx$.`,
        answer: numF(v),
        hint: 'Pose $u = x^2 + c^2$, $du = 2x\\,dx$.',
        correction: [`$\\frac{1}{2}\\displaystyle\\int_{${c * c}}^{${r * r}} \\sqrt{u}\\,du = \\frac{1}{3}\\left[u^{3/2}\\right]_{${c * c}}^{${r * r}} = \\frac{${r ** 3} - ${c ** 3}}{3}$`, `$= ${tex(v)}$`],
      };
    },
    // ∫_1^{e^k} (ln x)^n / x dx = k^{n+1}/(n+1).
    (rng) => {
      const k = rng.int(1, 3);
      const n = rng.int(1, 4);
      const v = F(k ** (n + 1), n + 1);
      return {
        prompt: `Calcule $\\displaystyle\\int_1^{${k === 1 ? 'e' : `e^{${k}}`}} \\frac{(\\ln x)^{${n}}}{x}\\,dx$.`,
        answer: numF(v),
        hint: 'Pose $u = \\ln x$, $du = \\frac{dx}{x}$.',
        correction: [`$\\displaystyle\\int_0^{${k}} u^{${n}}\\,du = \\frac{${k}^{${n + 1}}}{${n + 1}} = ${tex(v)}$`],
      };
    },
    // ∫_0^{π/2} sin^n x cos x dx = 1/(n+1).
    (rng) => {
      const n = rng.int(1, 9);
      const swap = rng.next() < 0.5;
      return {
        prompt: `Calcule $\\displaystyle\\int_0^{\\pi/2} ${swap ? `\\cos^{${n}} x\\,\\sin x` : `\\sin^{${n}} x\\,\\cos x`}\\,dx$.`,
        answer: numF(F(1, n + 1)),
        hint: swap ? 'Pose $u = \\cos x$, $du = -\\sin x\\,dx$.' : 'Pose $u = \\sin x$, $du = \\cos x\\,dx$.',
        correction: [`$\\displaystyle\\int_0^1 u^{${n}}\\,du = \\frac{1}{${n + 1}}$`],
      };
    },
  ],
  'l1-elements-simples': [
    // Trois pôles simples.
    (rng) => {
      const roots = rng.shuffle([-3, -2, -1, 0, 1, 2, 3]).slice(0, 3);
      const [a, b, c] = roots;
      const A = F(1, (a - b) * (a - c));
      const fac = (r: number) => (r === 0 ? 'x' : `(${affine(1, -r)})`);
      return {
        prompt: `On écrit $\\dfrac{1}{${fac(a)}${fac(b)}${fac(c)}} = \\dfrac{A}{${a === 0 ? 'x' : affine(1, -a)}} + \\dfrac{B}{${b === 0 ? 'x' : affine(1, -b)}} + \\dfrac{C}{${c === 0 ? 'x' : affine(1, -c)}}$. Que vaut $A$ ?`,
        answer: numF(A),
        hint: `Multiplie par $${a === 0 ? 'x' : affine(1, -a)}$ puis évalue en $x = ${a}$.`,
        correction: [`$A = \\dfrac{1}{(${a} - ${par(b)})(${a} - ${par(c)})} = ${tex(A)}$`],
      };
    },
    // Pôle double : (px + q)/(x − a)² = A/(x − a) + B/(x − a)².
    (rng) => {
      const a = rng.nonZero(-4, 4);
      const p = rng.nonZero(-5, 5);
      const q = rng.int(-6, 6);
      return {
        prompt: `On écrit $\\dfrac{${affine(p, q)}}{(${affine(1, -a)})^2} = \\dfrac{A}{${affine(1, -a)}} + \\dfrac{B}{(${affine(1, -a)})^2}$. Donne $A$ et $B$.`,
        answer: pairOf(p, p * a + q, ['A', 'B']),
        hint: `Écris $${affine(p, q)} = ${p}(${affine(1, -a)}) + \\dots$`,
        correction: [`$${affine(p, q)} = ${p}(${affine(1, -a)})${p * a + q === 0 ? '' : ` ${p * a + q < 0 ? '-' : '+'} ${Math.abs(p * a + q)}`}$`, `$A = ${p}$ et $B = ${p * a + q}$`],
      };
    },
    // Partie entière d'une fraction : (x² + bx + c)/(x − a) = x + d + R/(x − a).
    (rng) => {
      const a = rng.nonZero(-4, 4);
      const b = rng.int(-5, 5);
      const c = rng.int(-6, 6);
      const R = a * a + b * a + c;
      const d = a + b;
      const askR = rng.next() < 0.5;
      return {
        prompt: `On écrit $\\dfrac{${poly([1, b, c])}}{${affine(1, -a)}} = x + d + \\dfrac{R}{${affine(1, -a)}}$. Que vaut ${askR ? '$R$' : '$d$'} ?`,
        answer: num(askR ? R : d),
        hint: 'Effectue la division euclidienne du numérateur par $x - a$ ; $R$ est la valeur du numérateur en $a$.',
        correction: [`$${poly([1, b, c])} = (${affine(1, -a)})(${affine(1, d)})${R === 0 ? '' : ` ${R < 0 ? '-' : '+'} ${Math.abs(R)}`}$`, `$d = ${d}$ et $R = ${R}$`],
      };
    },
  ],
  'l1-sommes-riemann': [
    // (1/n) Σ (a + b k/n)^2 → ∫_0^1 (a + bx)^2.
    (rng) => {
      const a = rng.int(0, 3);
      const b = rng.nonZero(-3, 3);
      const v = integratePoly([b * b, 2 * a * b, a * a], 0, 1);
      return {
        prompt: `Calcule $\\displaystyle\\lim_{n \\to +\\infty} \\frac{1}{n}\\sum_{k=1}^{n} \\left(${a === 0 ? '' : `${a} ${b < 0 ? '-' : '+'} `}${a === 0 && b < 0 ? '-' : ''}${Math.abs(b) === 1 ? '' : Math.abs(b)}\\frac{k}{n}\\right)^2$.`,
        answer: numF(v),
        hint: `C’est une somme de Riemann de $x \\mapsto (${affine(b, a)})^2$ sur $[0, 1]$.`,
        correction: [`$\\displaystyle\\int_0^1 (${affine(b, a)})^2\\,dx = ${tex(v)}$`],
      };
    },
    // Σ k^p / n^{p+1} → 1/(p+1).
    (rng) => {
      const p = rng.int(1, 6);
      return {
        prompt: `Calcule $\\displaystyle\\lim_{n \\to +\\infty} \\frac{1}{n^{${p + 1}}}\\sum_{k=1}^{n} k^{${p}}$.`,
        answer: numF(F(1, p + 1)),
        hint: `Écris $\\frac{1}{n}\\sum \\left(\\frac{k}{n}\\right)^{${p}}$.`,
        correction: [`$\\displaystyle\\int_0^1 x^{${p}}\\,dx = \\frac{1}{${p + 1}}$`],
      };
    },
    // Sommes de Riemann célèbres.
    (rng) => {
      const pool: [string, string, string[], string][] = [
        ['\\sum_{k=1}^{n} \\frac{1}{n + k}', '\\ln 2', ['1', '0', '\\frac{1}{2}'], '$\\frac{1}{n}\\sum \\frac{1}{1 + k/n} \\to \\int_0^1 \\frac{dx}{1 + x} = \\ln 2$'],
        ['\\sum_{k=1}^{n} \\frac{n}{n^2 + k^2}', '\\frac{\\pi}{4}', ['1', '\\ln 2', '\\frac{\\pi}{2}'], '$\\frac{1}{n}\\sum \\frac{1}{1 + (k/n)^2} \\to \\int_0^1 \\frac{dx}{1 + x^2} = \\frac{\\pi}{4}$'],
        ['\\frac{1}{n}\\sum_{k=1}^{n} \\ln\\left(1 + \\frac{k}{n}\\right)', '2\\ln 2 - 1', ['\\ln 2', '0', '1'], '$\\int_0^1 \\ln(1 + x)\\,dx = 2\\ln 2 - 1$'],
        ['\\frac{1}{n}\\sum_{k=1}^{n} e^{k/n}', 'e - 1', ['e', '1', 'e + 1'], '$\\int_0^1 e^x\\,dx = e - 1$'],
      ];
      const [t, c, d, why] = rng.pick(pool);
      return {
        prompt: `Calcule $\\displaystyle\\lim_{n \\to +\\infty} ${t}$.`,
        answer: texChoice(rng, c, d),
        hint: 'Fais apparaître $\\frac{1}{n}\\sum f\\left(\\frac{k}{n}\\right)$.',
        correction: [why],
      };
    },
  ],
  'l1-primitives-usuelles': [
    (rng) => vraiFauxBanque(rng, INTEGRALES),
    (rng) => qcmBanque(rng, INTEGRALES, rng.next() < 0.5),
    // Valeur moyenne d'un polynôme.
    (rng) => {
      const a = rng.int(-3, 1);
      const b = a + rng.int(1, 4);
      const c = [rng.int(-3, 3), rng.int(-4, 4), rng.int(-4, 4)];
      const I = integratePoly(c, a, b);
      const m = mul(I, F(1, b - a));
      return {
        prompt: `Quelle est la valeur moyenne de $f(x) = ${poly(c)}$ sur $[${a}\\,;${b}]$ ?`,
        answer: numF(m),
        hint: 'Valeur moyenne : $\\frac{1}{b - a}\\int_a^b f$.',
        correction: [`$\\displaystyle\\int_{${a}}^{${b}} f = ${tex(I)}$`, `Moyenne : $\\frac{${tex(I)}}{${b - a}} = ${tex(m)}$`],
      };
    },
    // Primitive à reconnaître.
    (rng) => {
      const pool: [string, string, string[]][] = [
        ['x e^{x^2}', '\\frac{1}{2}e^{x^2}', ['e^{x^2}', '2e^{x^2}', 'x^2 e^{x^2}']],
        ['\\tan x', '-\\ln|\\cos x|', ['\\ln|\\cos x|', '\\frac{1}{\\cos^2 x}', '\\ln|\\sin x|']],
        ['\\frac{1}{x\\ln x}', '\\ln|\\ln x|', ['\\frac{1}{\\ln x}', '\\ln x', '\\frac{(\\ln x)^2}{2}']],
        ['\\frac{1}{1 + x^2}', '\\arctan x', ['\\ln(1 + x^2)', '\\frac{1}{x + x^3/3}', '\\arcsin x']],
        ['\\frac{x}{1 + x^2}', '\\frac{1}{2}\\ln(1 + x^2)', ['\\arctan x', '\\ln(1 + x^2)', '\\frac{x^2}{2}\\arctan x']],
        ['\\frac{1}{\\sqrt{1 - x^2}}', '\\arcsin x', ['\\arccos x', '\\sqrt{1 - x^2}', '\\arctan x']],
        ['\\cos x\\,e^{\\sin x}', 'e^{\\sin x}', ['\\sin x\\,e^{\\sin x}', 'e^{\\cos x}', '-e^{\\sin x}']],
        ['\\frac{\\ln x}{x}', '\\frac{(\\ln x)^2}{2}', ['\\ln(\\ln x)', '\\frac{1}{x}', 'x\\ln x - x']],
      ];
      const [f, c, d] = rng.pick(pool);
      return {
        prompt: `Quelle est une primitive de $${f}$ (sur un intervalle où elle est définie) ?`,
        answer: texChoice(rng, c, d),
        hint: 'Cherche une forme $u\'\\,g(u)$ : la primitive est alors $G(u)$.',
        correction: [`$\\left(${c}\\right)' = ${f}$`],
      };
    },
  ],
};

export const BANQUES_INTEGRATION = { INTEGRALES };
