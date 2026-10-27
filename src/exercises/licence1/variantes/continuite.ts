import { type Fait, type Variantes, qcmBanque, vraiFauxBanque } from '../../licenceVariantes';
import { F, affine, num, numF, poly, tex, texChoice } from '../util';

/** Variantes du chapitre « Limites et continuité » (feuilles bibmath « Limites de fonctions, continuité » et « Comparaison des fonctions »). */

const mono = (c: number, v = 'x') => `${c === 1 ? '' : c === -1 ? '-' : c}${v}`;

const CONTINUITE: Fait[] = [
  { s: 'Si $f$ est continue sur $[a, b]$ avec $f(a) < 0 < f(b)$, alors $f$ s’annule sur $[a, b]$.', v: true, why: 'C’est le théorème des valeurs intermédiaires.' },
  { s: 'Une fonction continue sur $]0, 1]$ est bornée.', v: false, why: '$x \\mapsto \\frac{1}{x}$ est continue sur $]0, 1]$ mais non bornée.' },
  { s: 'Une fonction continue sur un segment $[a, b]$ est bornée et atteint ses bornes.', v: true, why: 'C’est le théorème des bornes atteintes.' },
  { s: 'Si $|f|$ est continue, alors $f$ est continue.', v: false, why: '$f = 1$ sur $\\mathbb{Q}$ et $-1$ ailleurs : $|f| = 1$ est continue, pas $f$.' },
  { s: 'Si $f$ est continue, alors $|f|$ est continue.', v: true, why: 'C’est la composée de $f$ et de la valeur absolue, continue.' },
  { s: 'Une fonction continue et injective sur un intervalle est strictement monotone.', v: true, why: 'Sinon, le théorème des valeurs intermédiaires fournirait deux antécédents d’une même valeur.' },
  { s: 'L’image d’un intervalle par une fonction continue est un intervalle.', v: true, why: 'C’est une forme du théorème des valeurs intermédiaires.' },
  { s: 'L’image d’un intervalle ouvert par une fonction continue est un intervalle ouvert.', v: false, why: '$x \\mapsto x^2$ envoie $]-1, 1[$ sur $[0, 1[$.' },
  { s: 'Une fonction monotone sur $\\mathbb{R}$ est continue.', v: false, why: 'La partie entière est croissante mais discontinue en chaque entier.' },
  { s: 'Si $f$ est continue en $a$ et $g$ continue en $f(a)$, alors $g \\circ f$ est continue en $a$.', v: true, why: 'C’est la continuité de la composée.' },
];

const EQUIVALENTS: Fait[] = [
  { s: '$\\sin x \\sim x$ quand $x \\to 0$.', v: true, why: '$\\frac{\\sin x}{x} \\to 1$.' },
  { s: '$1 - \\cos x \\sim \\frac{x^2}{2}$ quand $x \\to 0$.', v: true, why: '$\\frac{1 - \\cos x}{x^2} \\to \\frac{1}{2}$.' },
  { s: '$(1 + x)^\\alpha - 1 \\sim \\alpha x$ quand $x \\to 0$ ($\\alpha \\neq 0$).', v: true, why: 'C’est la dérivée de $(1 + x)^\\alpha$ en $0$.' },
  { s: 'Si $f \\sim g$ et $h \\sim k$, alors $f + h \\sim g + k$.', v: false, why: 'Contre-exemple en $+\\infty$ : $x + 1 \\sim x$ et $-x \\sim -x$, mais $1 \\not\\sim 0$. On ne somme pas les équivalents.' },
  { s: 'Si $f \\sim g$ et $h \\sim k$, alors $fh \\sim gk$.', v: true, why: 'Les équivalents se multiplient (et se divisent).' },
  { s: 'Si $f \\sim g$ en $+\\infty$, alors $e^f \\sim e^g$.', v: false, why: '$x + 1 \\sim x$ mais $\\frac{e^{x+1}}{e^x} = e \\not\\to 1$.' },
  { s: '$\\cos x \\sim 1$ quand $x \\to 0$.', v: true, why: '$\\cos x \\to 1 \\neq 0$, donc $\\cos x \\sim 1$.' },
  { s: '$\\cos x - 1 \\sim 0$ quand $x \\to 0$.', v: false, why: 'Être équivalent à $0$ signifie être nul au voisinage : on écrit $\\cos x - 1 \\sim -\\frac{x^2}{2}$.' },
  { s: '$\\ln(1 + x) \\sim x$ quand $x \\to 0$.', v: true, why: '$\\frac{\\ln(1 + x)}{x} \\to 1$.' },
  { s: '$\\tan x - \\sin x \\sim 0$ quand $x \\to 0$, car $\\tan x \\sim x$ et $\\sin x \\sim x$.', v: false, why: 'On ne soustrait pas des équivalents : en fait $\\tan x - \\sin x \\sim \\frac{x^3}{2}$.' },
];

const PARTIE_ENTIERE: Fait[] = [
  { s: '$\\lfloor x + n \\rfloor = \\lfloor x \\rfloor + n$ pour tout réel $x$ et tout entier $n$.', v: true, why: '$\\lfloor x \\rfloor + n$ est un entier et $\\lfloor x \\rfloor + n \\leq x + n < \\lfloor x \\rfloor + n + 1$.' },
  { s: '$\\lfloor x + y \\rfloor = \\lfloor x \\rfloor + \\lfloor y \\rfloor$ pour tous réels $x, y$.', v: false, why: '$x = y = 0{,}5$ : $\\lfloor 1 \\rfloor = 1$ mais $0 + 0 = 0$.' },
  { s: '$\\lfloor -x \\rfloor = -\\lfloor x \\rfloor$ pour tout réel $x$.', v: false, why: '$\\lfloor -0{,}5 \\rfloor = -1$ alors que $-\\lfloor 0{,}5 \\rfloor = 0$.' },
  { s: '$x - 1 < \\lfloor x \\rfloor \\leq x$ pour tout réel $x$.', v: true, why: 'C’est la définition de la partie entière.' },
  { s: '$\\lfloor 2x \\rfloor \\geq 2\\lfloor x \\rfloor$ pour tout réel $x$.', v: true, why: '$2\\lfloor x \\rfloor$ est un entier inférieur à $2x$.' },
  { s: '$\\lfloor xy \\rfloor = \\lfloor x \\rfloor \\lfloor y \\rfloor$ pour tous réels positifs $x, y$.', v: false, why: '$x = y = 1{,}5$ : $\\lfloor 2{,}25 \\rfloor = 2$ mais $1 \\times 1 = 1$.' },
  { s: 'La fonction partie entière est continue à droite en tout point.', v: true, why: 'Elle est constante sur chaque $[n, n + 1[$.' },
];

export const CONTINUITE_VARIANTES: Variantes = {
  'l1-limite-forme-indeterminee': [
    // Quantité conjuguée.
    (rng) => {
      const a = rng.int(1, 6);
      const k = rng.int(1, 3);
      return {
        prompt: `Calcule $\\displaystyle\\lim_{x \\to 0} \\frac{\\sqrt{${mono(k)} + ${a * a}} - ${a}}{x}$.`,
        answer: numF(F(k, 2 * a)),
        hint: 'Multiplie en haut et en bas par la quantité conjuguée $\\sqrt{\\cdots} + a$.',
        correction: [`$\\dfrac{${mono(k)}}{x\\left(\\sqrt{${mono(k)} + ${a * a}} + ${a}\\right)} = \\dfrac{${k}}{\\sqrt{${mono(k)} + ${a * a}} + ${a}} \\to \\frac{${k}}{${2 * a}}$`, `Limite : $${tex(F(k, 2 * a))}$`],
      };
    },
    // (x^n − a^n)/(x − a).
    (rng) => {
      const a = rng.nonZero(-3, 3);
      const n = rng.int(2, 6);
      return {
        prompt: `Calcule $\\displaystyle\\lim_{x \\to ${a}} \\frac{x^{${n}} - ${a ** n < 0 ? `(${a ** n})` : a ** n}}{${affine(1, -a)}}$.`,
        answer: num(n * a ** (n - 1)),
        hint: 'C’est un taux d’accroissement : la dérivée de $x^n$ en $a$.',
        correction: [`$\\frac{x^n - a^n}{x - a} \\to n a^{n-1} = ${n} \\times ${a < 0 ? `(${a})` : a}^{${n - 1}} = ${n * a ** (n - 1)}$`],
      };
    },
    // Fraction rationnelle en +∞, même degré.
    (rng) => {
      const d = rng.int(2, 3);
      const top = [rng.nonZero(-6, 6), ...Array.from({ length: d }, () => rng.int(-5, 5))];
      const bottom = [rng.nonZero(-6, 6), ...Array.from({ length: d }, () => rng.int(-5, 5))];
      const inf = rng.pick(['+\\infty', '-\\infty']);
      return {
        prompt: `Calcule $\\displaystyle\\lim_{x \\to ${inf}} \\frac{${poly(top)}}{${poly(bottom)}}$.`,
        answer: numF(F(top[0], bottom[0])),
        hint: 'En l’infini, une fraction rationnelle se comporte comme le quotient de ses termes dominants.',
        correction: [`$\\frac{${poly([top[0], ...Array(d).fill(0)])}}{${poly([bottom[0], ...Array(d).fill(0)])}} = ${tex(F(top[0], bottom[0]))}$`],
      };
    },
  ],
  'l1-limites-usuelles': [
    // sin(ax)/sin(bx), (e^{ax} − e^{bx})/x.
    (rng) => {
      const a = rng.nonZero(-5, 5);
      let b = rng.nonZero(-5, 5);
      while (b === a) b = rng.nonZero(-5, 5);
      if (rng.next() < 0.5)
        return {
          prompt: `Calcule $\\displaystyle\\lim_{x \\to 0} \\frac{\\sin(${mono(a)})}{\\sin(${mono(b)})}$.`,
          answer: numF(F(a, b)),
          hint: '$\\sin u \\sim u$ en $0$.',
          correction: [`$\\frac{\\sin(${mono(a)})}{\\sin(${mono(b)})} \\sim \\frac{${mono(a)}}{${mono(b)}} = ${tex(F(a, b))}$`],
        };
      return {
        prompt: `Calcule $\\displaystyle\\lim_{x \\to 0} \\frac{e^{${mono(a)}} - e^{${mono(b)}}}{x}$.`,
        answer: num(a - b),
        hint: 'Écris $e^{ax} - e^{bx} = (e^{ax} - 1) - (e^{bx} - 1)$.',
        correction: [`$\\frac{e^{${mono(a)}} - 1}{x} \\to ${a}$ et $\\frac{e^{${mono(b)}} - 1}{x} \\to ${b}$`, `Limite : $${a - b}$`],
      };
    },
    // Limites usuelles en +∞ et en 0⁺, à reconnaître.
    (rng) => {
      const pool: [string, string, string[]][] = [
        ['\\lim_{x \\to 0^+} x \\ln x', '0', ['-\\infty', '1', '+\\infty']],
        ['\\lim_{x \\to +\\infty} \\frac{e^x}{x^{3}}', '+\\infty', ['0', '1', 'e']],
        ['\\lim_{x \\to +\\infty} \\frac{\\ln x}{\\sqrt{x}}', '0', ['+\\infty', '1', '\\frac{1}{2}']],
        ['\\lim_{x \\to 0^+} x^x', '1', ['0', 'e', '+\\infty']],
        ['\\lim_{x \\to +\\infty} x \\sin\\frac{1}{x}', '1', ['0', '+\\infty', '\\text{n’existe pas}']],
        ['\\lim_{x \\to +\\infty} \\left(1 + \\frac{1}{x}\\right)^x', 'e', ['1', '+\\infty', '0']],
        ['\\lim_{x \\to 0} x \\sin\\frac{1}{x}', '0', ['1', '\\text{n’existe pas}', '+\\infty']],
        ['\\lim_{x \\to -\\infty} x e^x', '0', ['-\\infty', '+\\infty', '-1']],
      ];
      const [l, correct, decoys] = rng.pick(pool);
      return {
        prompt: `Que vaut $\\displaystyle${l}$ ?`,
        answer: texChoice(rng, correct, decoys),
        hint: 'Croissances comparées : l’exponentielle l’emporte sur les puissances, qui l’emportent sur le logarithme.',
        correction: [`$${l} = ${correct}$`],
      };
    },
    (rng) => qcmBanque(rng, EQUIVALENTS, rng.next() < 0.5),
  ],
  'l1-continuite-parametre': [
    // Prolongement de sin(ax)/x, (e^{ax} − 1)/x, ln(1 + ax)/x.
    (rng) => {
      const a = rng.nonZero(-6, 6);
      const k = rng.pick([
        [`\\frac{\\sin(${mono(a)})}{x}`, F(a)],
        [`\\frac{e^{${mono(a)}} - 1}{x}`, F(a)],
        [`\\frac{1 - \\cos(${mono(a)})}{x^2}`, F(a * a, 2)],
      ] as const);
      return {
        prompt: `$f(x) = ${k[0]}$ pour $x \\neq 0$ et $f(0) = m$. Pour quelle valeur de $m$ la fonction $f$ est-elle continue en $0$ ?`,
        answer: numF(k[1]),
        hint: 'Il faut $m = \\lim_{x \\to 0} f(x)$ : utilise une limite usuelle.',
        correction: [`$\\lim_{x \\to 0} f(x) = ${tex(k[1])}$, donc $m = ${tex(k[1])}$.`],
      };
    },
    (rng) => vraiFauxBanque(rng, CONTINUITE),
    (rng) => qcmBanque(rng, CONTINUITE, rng.next() < 0.5),
  ],
  'l1-equivalents-simples': [
    // √(x² + ax) − x → a/2 en +∞.
    (rng) => {
      const a = rng.nonZero(-8, 8);
      return {
        prompt: `Calcule $\\displaystyle\\lim_{x \\to +\\infty} \\left(\\sqrt{x^2 ${a < 0 ? '-' : '+'} ${mono(Math.abs(a))}} - x\\right)$.`,
        answer: numF(F(a, 2)),
        hint: 'Quantité conjuguée : $\\sqrt{x^2 + ax} - x = \\frac{ax}{\\sqrt{x^2 + ax} + x}$.',
        correction: [`$\\frac{${mono(a)}}{\\sqrt{x^2 ${a < 0 ? '-' : '+'} ${mono(Math.abs(a))}} + x} \\sim \\frac{${mono(a)}}{2x} = ${tex(F(a, 2))}$`],
      };
    },
    (rng) => vraiFauxBanque(rng, EQUIVALENTS, 'On peut multiplier ou diviser des équivalents, mais ni les additionner ni les composer.'),
    // Équivalent d'un polynôme en 0 et en l'infini.
    (rng) => {
      const c = [rng.nonZero(-4, 4), rng.int(-4, 4), rng.nonZero(-4, 4), 0];
      const atInf = rng.next() < 0.5;
      const correct = atInf ? `${mono(c[0], 'x^3')}` : `${mono(c[2])}`;
      const decoys = atInf ? [mono(c[2]), mono(c[0], 'x^2'), mono(c[1] || 1, 'x^2')] : [mono(c[0], 'x^3'), mono(c[1] || 2, 'x^2'), String(c[2])];
      return {
        prompt: `Quel est un équivalent simple de $${poly(c)}$ quand $x \\to ${atInf ? '+\\infty' : '0'}$ ?`,
        answer: texChoice(rng, correct, decoys, () => mono(c[0] + 5, 'x^4')),
        hint: 'En $0$, c’est le terme de plus bas degré qui domine ; en l’infini, celui de plus haut degré.',
        correction: [`Le terme dominant est $${correct}$.`],
      };
    },
  ],
  'l1-partie-entiere': [
    (rng) => vraiFauxBanque(rng, PARTIE_ENTIERE),
    // Partie entière d'un négatif.
    (rng) => {
      const d = rng.int(2, 9);
      let m = rng.int(1, 60);
      while (m % d === 0) m = rng.int(1, 60);
      return {
        prompt: `Calcule $\\left\\lfloor -\\frac{${m}}{${d}} \\right\\rfloor$.`,
        answer: num(Math.floor(-m / d)),
        hint: 'La partie entière est le plus grand entier inférieur ou égal : attention au signe.',
        correction: [`$${Math.floor(-m / d)} \\leq -\\frac{${m}}{${d}} < ${Math.floor(-m / d) + 1}$`, `Donc $\\lfloor -\\frac{${m}}{${d}} \\rfloor = ${Math.floor(-m / d)}$ (et non $${-Math.floor(m / d)}$).`],
      };
    },
    // Somme de parties entières.
    (rng) => {
      const n = rng.int(5, 30);
      const sqrt = rng.next() < 0.5;
      let v = 0;
      for (let k = 1; k <= n; k++) v += sqrt ? Math.floor(Math.sqrt(k)) : Math.floor(k / 2);
      return {
        prompt: `Calcule $\\displaystyle\\sum_{k=1}^{${n}} ${sqrt ? '\\lfloor \\sqrt{k} \\rfloor' : '\\left\\lfloor \\frac{k}{2} \\right\\rfloor'}$.`,
        answer: num(v),
        hint: sqrt ? '$\\lfloor \\sqrt{k} \\rfloor = j$ pour $j^2 \\leq k < (j+1)^2$, soit $2j + 1$ valeurs de $k$.' : 'Regroupe les termes deux par deux : $\\lfloor \\frac{2j}{2} \\rfloor = \\lfloor \\frac{2j+1}{2} \\rfloor = j$.',
        correction: [`En regroupant les termes égaux, on trouve $${v}$.`],
      };
    },
  ],
};

export const BANQUES_CONTINUITE = { CONTINUITE, EQUIVALENTS, PARTIE_ENTIERE };
