import { type Fait, type Variantes, qcmBanque, vraiFauxBanque } from '../../licenceVariantes';
import { F, affine, fact, num, numF, pairOf, par, plus, poly, tex } from '../util';

/** Variantes du chapitre « Dérivabilité » (feuilles bibmath « Dérivabilité » et « Fonctions convexes »). */

const mono = (c: number, v = 'x') => `${c === 1 ? '' : c === -1 ? '-' : c}${v}`;

const DERIVABILITE: Fait[] = [
  { s: 'Une fonction dérivable en $a$ est continue en $a$.', v: true, why: '$f(x) - f(a) = (x - a)\\frac{f(x) - f(a)}{x - a} \\to 0 \\times f\'(a) = 0$.' },
  { s: 'Une fonction continue en $a$ est dérivable en $a$.', v: false, why: '$x \\mapsto |x|$ est continue en $0$ mais pas dérivable.' },
  { s: 'Si $f\'(a) = 0$, alors $f$ admet un extremum local en $a$.', v: false, why: '$x \\mapsto x^3$ : $f\'(0) = 0$ mais $0$ n’est pas un extremum.' },
  { s: 'Si $f$ dérivable sur $]a, b[$ admet un extremum local en $c \\in\\ ]a, b[$, alors $f\'(c) = 0$.', v: true, why: 'Le taux d’accroissement change de signe de part et d’autre de $c$.' },
  { s: 'Si $f$ est continue sur $[a, b]$, dérivable sur $]a, b[$ et $f(a) = f(b)$, il existe $c \\in\\ ]a, b[$ tel que $f\'(c) = 0$.', v: true, why: 'C’est le théorème de Rolle.' },
  { s: 'Si $f\' > 0$ sur $\\mathbb{R}^*$, alors $f$ est croissante sur $\\mathbb{R}^*$.', v: false, why: '$x \\mapsto -\\frac{1}{x}$ : dérivée positive, mais $f(-1) = 1 > f(1) = -1$. $\\mathbb{R}^*$ n’est pas un intervalle.' },
  { s: 'Si $|f\'| \\leq k$ sur un intervalle $I$, alors $|f(x) - f(y)| \\leq k|x - y|$ sur $I$.', v: true, why: 'C’est l’inégalité des accroissements finis.' },
  { s: 'Si $f$ est dérivable sur $\\mathbb{R}$, alors $f\'$ est continue.', v: false, why: '$x^2 \\sin\\frac{1}{x}$ (prolongée par $0$) est dérivable, mais sa dérivée n’a pas de limite en $0$.' },
  { s: 'Une fonction dérivable et paire a une dérivée impaire.', v: true, why: 'On dérive $f(-x) = f(x)$ : $-f\'(-x) = f\'(x)$.' },
  { s: 'Si $f$ et $g$ sont dérivables, $(fg)\' = f\'g\'$.', v: false, why: '$(fg)\' = f\'g + fg\'$ : avec $f = g = x$, $(x^2)\' = 2x \\neq 1$.' },
  { s: 'Si $f$ est convexe et dérivable, sa courbe est au-dessus de ses tangentes.', v: true, why: 'C’est une caractérisation des fonctions convexes dérivables.' },
];

/** Tangentes en des points « ronds » : (f, x0, pente, ordonnée à l'origine). */
const TANGENTES = (k: number): [string, string, ReturnType<typeof F>, ReturnType<typeof F>][] => [
  [`e^{${mono(k)}}`, '0', F(k), F(1)],
  [`\\ln(1 ${k < 0 ? '-' : '+'} ${mono(Math.abs(k))})`, '0', F(k), F(0)],
  [`\\sin(${mono(k)})`, '0', F(k), F(0)],
  [`\\sqrt{x}`, String(k * k), F(1, 2 * Math.abs(k)), F(Math.abs(k), 2)],
  [`\\frac{1}{x}`, String(k), F(-1, k * k), F(2, k)],
  ['\\ln x', '1', F(1), F(-1)],
];

export const DERIVABILITE_VARIANTES: Variantes = {
  'l1-derivee-composee': [
    // Dérivée d'un quotient de fonctions affines.
    (rng) => {
      let a: number, b: number, c: number, d: number;
      do [a, b, c, d] = [rng.nonZero(-4, 4), rng.int(-4, 4), rng.nonZero(-3, 3), rng.int(-4, 4)];
      while (a * d - b * c === 0);
      let x0 = rng.int(-3, 3);
      while (c * x0 + d === 0) x0++;
      const v = F(a * d - b * c, (c * x0 + d) ** 2);
      return {
        prompt: `$f(x) = \\dfrac{${affine(a, b)}}{${affine(c, d)}}$. Calcule $f'(${x0})$.`,
        answer: numF(v),
        hint: '$\\left(\\frac{u}{v}\\right)\' = \\frac{u\'v - uv\'}{v^2}$ ; ici $f\'(x) = \\frac{ad - bc}{(cx + d)^2}$.',
        correction: [`$f'(x) = \\dfrac{${a * d - b * c}}{(${affine(c, d)})^2}$`, `$f'(${x0}) = \\frac{${a * d - b * c}}{${(c * x0 + d) ** 2}} = ${tex(v)}$`],
      };
    },
    // Dérivée d'une bijection réciproque.
    (rng) => {
      const k = rng.int(1, 4);
      const c = rng.int(-5, 5);
      const t = rng.int(-2, 2);
      const y = t ** 3 + k * t + c;
      const v = F(1, 3 * t * t + k);
      return {
        prompt: `$f(x) = x^3 + ${mono(k)}${plus(c)}$ est une bijection de $\\mathbb{R}$ sur $\\mathbb{R}$. Calcule $(f^{-1})'(${y})$.`,
        answer: numF(v),
        hint: '$(f^{-1})\'(y) = \\frac{1}{f\'(f^{-1}(y))}$ : trouve d’abord l’antécédent de $y$.',
        correction: [`$f(${t}) = ${y}$, donc $f^{-1}(${y}) = ${t}$.`, `$(f^{-1})'(${y}) = \\frac{1}{f'(${t})} = \\frac{1}{${3 * t * t + k}}$`],
      };
    },
    // Racine d'un trinôme.
    (rng) => {
      const [p, q, r] = rng.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 6, 10]]);
      // f(x) = √(x² + q²) en x = p : f' = p / r.
      const s = rng.pick([1, -1]);
      return {
        prompt: `$f(x) = \\sqrt{x^2 + ${q * q}}$. Calcule $f'(${s * p})$.`,
        answer: numF(F(s * p, r)),
        hint: '$(\\sqrt{u})\' = \\frac{u\'}{2\\sqrt{u}}$.',
        correction: [`$f'(x) = \\frac{x}{\\sqrt{x^2 + ${q * q}}}$`, `$f'(${s * p}) = \\frac{${s * p}}{${r}} = ${tex(F(s * p, r))}$`],
      };
    },
  ],
  'l1-derivee-nieme': [
    // Leibniz : (x e^{ax})^{(n)}(0) = n a^{n−1}.
    (rng) => {
      const a = rng.nonZero(-3, 3);
      const n = rng.int(2, 8);
      return {
        prompt: `$f(x) = x\\,e^{${mono(a)}}$. Calcule $f^{(${n})}(0)$.`,
        answer: num(n * a ** (n - 1)),
        hint: 'Formule de Leibniz : seuls deux termes survivent, car les dérivées de $x$ s’annulent dès l’ordre $2$.',
        correction: [`$f^{(n)}(x) = x\\,a^n e^{ax} + n\\,a^{n-1}e^{ax}$`, `$f^{(${n})}(0) = ${n} \\times ${par(a)}^{${n - 1}} = ${n * a ** (n - 1)}$`],
      };
    },
    // sin, cos.
    (rng) => {
      const a = rng.nonZero(-3, 3);
      const n = rng.int(1, 9);
      const cos = rng.next() < 0.5;
      // sin^{(n)}(0) = sin(nπ/2) ; cos^{(n)}(0) = cos(nπ/2).
      const s = cos ? [1, 0, -1, 0][n % 4] : [0, 1, 0, -1][n % 4];
      const v = s * a ** n;
      return {
        prompt: `$f(x) = \\${cos ? 'cos' : 'sin'}(${mono(a)})$. Calcule $f^{(${n})}(0)$.`,
        answer: num(v),
        hint: `Chaque dérivation multiplie par $${a}$ et décale d’un quart de tour : $\\${cos ? 'cos' : 'sin'}^{(n)}(x) = \\${cos ? 'cos' : 'sin'}\\left(x + n\\frac{\\pi}{2}\\right)$.`,
        correction: [`$f^{(${n})}(x) = ${par(a)}^{${n}}\\${cos ? 'cos' : 'sin'}\\left(${mono(a)} + \\frac{${n}\\pi}{2}\\right)$`, `$f^{(${n})}(0) = ${v}$`],
      };
    },
    // ln(1 + x).
    (rng) => {
      const n = rng.int(1, 7);
      const v = (n % 2 ? 1 : -1) * fact(n - 1);
      return {
        prompt: `$f(x) = \\ln(1 + x)$. Calcule $f^{(${n})}(0)$.`,
        answer: num(v),
        hint: '$f\'(x) = (1 + x)^{-1}$, puis dérive la puissance.',
        correction: [`$f^{(n)}(x) = \\frac{(-1)^{n-1}(n-1)!}{(1 + x)^n}$`, `$f^{(${n})}(0) = ${v}$`],
      };
    },
  ],
  'l1-accroissements-finis': [
    (rng) => vraiFauxBanque(rng, DERIVABILITE),
    (rng) => qcmBanque(rng, DERIVABILITE, rng.next() < 0.5),
    // Rolle sur un trinôme (x − a)(x − b).
    (rng) => {
      const a = rng.int(-6, 3);
      const b = a + rng.int(1, 6);
      const k = rng.nonZero(-3, 3);
      return {
        prompt: `$f(x) = ${k === 1 ? '' : k === -1 ? '-' : k}(${affine(1, -a)})(${affine(1, -b)})$ vérifie $f(${a}) = f(${b}) = 0$. Trouve le réel $c$ donné par le théorème de Rolle.`.replace('(x - 0)', 'x').replace('(x)', 'x'),
        answer: numF(F(a + b, 2)),
        hint: 'Résous $f\'(c) = 0$.',
        correction: [`$f'(x) = ${k === 1 ? '' : k === -1 ? '-' : k}(2x - ${par(a + b)})$`, `$c = \\frac{${a} + ${par(b)}}{2} = ${tex(F(a + b, 2))}$`],
      };
    },
    // Constante de Lipschitz de x² sur un segment.
    (rng) => {
      const a = rng.int(-5, 3);
      const b = a + rng.int(1, 5);
      const k = 2 * Math.max(Math.abs(a), Math.abs(b));
      return {
        prompt: `Quel est le plus petit réel $k$ tel que $|x^2 - y^2| \\leq k|x - y|$ pour tous $x, y \\in [${a}\\,;${b}]$ ?`,
        answer: num(k),
        hint: 'Inégalité des accroissements finis : $k = \\sup |f\'|$ sur le segment.',
        correction: [`$|f'(x)| = 2|x| \\leq 2\\max(${Math.abs(a)}, ${Math.abs(b)}) = ${k}$, atteint au bord.`],
      };
    },
  ],
  'l1-tangente': [
    // Tangente horizontale ou parallèle à une droite.
    (rng) => {
      const b = rng.int(-8, 8);
      const c = rng.int(-5, 5);
      const m = rng.int(-6, 6);
      return {
        prompt: `En quel point d’abscisse $x$ la tangente à la courbe de $f(x) = ${poly([1, b, c])}$ est-elle parallèle à la droite $y = ${m === 0 ? '0' : mono(m)}${m === 0 ? '' : ' + 1'}$ ?`,
        answer: numF(F(m - b, 2)),
        hint: 'Deux droites sont parallèles quand elles ont la même pente : résous $f\'(x) = m$.',
        correction: [`$f'(x) = ${affine(2, b)} = ${m}$`, `$x = ${tex(F(m - b, 2))}$`],
      };
    },
    // Tangentes usuelles.
    (rng) => {
      const k = rng.pick([1, 2, 3, -1, -2]);
      const [f, x0, m, p] = rng.pick(TANGENTES(k));
      return {
        prompt: `Donne la pente $m$ et l’ordonnée à l’origine $p$ de la tangente en $${x0}$ à la courbe de $f(x) = ${f}$.`,
        answer: pairOf(m, p, ['m', 'p']),
        hint: 'La tangente en $a$ est $y = f\'(a)(x - a) + f(a)$.',
        correction: [`$m = f'(${x0}) = ${tex(m)}$`, `$p = f(${x0}) - m \\times ${x0} = ${tex(p)}$`],
      };
    },
    // Tangente passant par l'origine.
    (rng) => {
      const c = rng.int(1, 9) ** 2;
      // f(x) = x² + c : tangente en a passe par O ⟺ a² = c.
      return {
        prompt: `On cherche les tangentes à la courbe de $f(x) = x^2 + ${c}$ qui passent par l’origine. Donne l’abscisse positive du point de contact.`,
        answer: num(Math.sqrt(c)),
        hint: 'La tangente en $a$ passe par $O$ si $0 = f\'(a)(0 - a) + f(a)$.',
        correction: [`$-2a^2 + a^2 + ${c} = 0 \\iff a^2 = ${c}$`, `$a = ${Math.sqrt(c)}$`],
      };
    },
  ],
  'l1-extremum-local': [
    // Optimisation concrète : rectangle ou boîte.
    (rng) => {
      if (rng.next() < 0.5) {
        const P = 4 * rng.int(3, 30);
        return {
          prompt: `Un enclos rectangulaire a un périmètre de $${P}$ m. Quelle est son aire maximale (en m²) ?`,
          answer: num((P / 4) ** 2),
          hint: 'Avec des côtés $x$ et $\\frac{P}{2} - x$, maximise $A(x) = x\\left(\\frac{P}{2} - x\\right)$.',
          correction: [`$A'(x) = ${P / 2} - 2x = 0$ pour $x = ${P / 4}$ : c’est un carré.`, `Aire maximale : $${P / 4}^2 = ${(P / 4) ** 2}$`],
        };
      }
      const a = 6 * rng.int(1, 8);
      return {
        prompt: `Dans une feuille carrée de côté $${a}$ cm, on découpe un carré de côté $x$ à chaque coin pour plier une boîte sans couvercle. Pour quel $x$ (en cm) le volume est-il maximal ?`,
        answer: num(a / 6),
        hint: `$V(x) = x(${a} - 2x)^2$ sur $]0\\,;${a / 2}[$.`,
        correction: [`$V'(x) = (${a} - 2x)(${a} - 6x)$`, `Sur $]0\\,;${a / 2}[$, $V'$ s’annule en $x = ${a / 6}$ et change de signe : maximum.`],
      };
    },
    // Minimum de x + k/x sur ]0 ; +∞[.
    (rng) => {
      const m = rng.int(1, 9);
      const k = m * m;
      const askValue = rng.next() < 0.5;
      return {
        prompt: `$f(x) = x + \\frac{${k}}{x}$ sur $]0\\,;+\\infty[$. ${askValue ? 'Quel est son minimum ?' : 'En quel $x$ atteint-elle son minimum ?'}`,
        answer: num(askValue ? 2 * m : m),
        hint: '$f\'(x) = 1 - \\frac{k}{x^2}$.',
        correction: [`$f'(x) = 0 \\iff x = ${m}$, et $f'$ passe de négative à positive.`, `Minimum : $f(${m}) = ${2 * m}$`],
      };
    },
    // Nature d'un point critique par la dérivée seconde.
    (rng) => {
      const a = rng.nonZero(-3, 3);
      const roots = [rng.int(-3, 0), rng.int(1, 3)];
      // f(x) = a(x³/3 − (r1 + r2)x²/2 + r1r2 x) + b : f' = a(x − r1)(x − r2).
      const which = rng.pick([0, 1]);
      const second = a * (2 * roots[which] - roots[0] - roots[1]);
      const isMax = second < 0;
      return {
        prompt: `$f$ est dérivable deux fois avec $f'(x) = ${a === 1 ? '' : a === -1 ? '-' : a}(${affine(1, -roots[0])})(${affine(1, -roots[1])})$. En $x = ${roots[which]}$, $f$ admet :`.replace('(x - 0)', 'x').replace('(x)', 'x'),
        answer: { kind: 'choice', options: ['Un maximum local', 'Un minimum local', 'Ni l’un ni l’autre'], correct: isMax ? 0 : 1 },
        hint: '$f\'(a) = 0$ et $f\'\'(a) < 0$ donnent un maximum local ; $f\'\'(a) > 0$ un minimum local.',
        correction: [`$f''(${roots[which]}) = ${second}$`, isMax ? 'Négatif : maximum local.' : 'Positif : minimum local.'],
      };
    },
  ],
};

export const BANQUES_DERIVABILITE = { DERIVABILITE };
