import { frac } from '../../fraction';
import { type Fait, type Variantes, qcmBanque, vraiFauxBanque } from '../../licenceVariantes';
import type { Rng } from '../../rng';
import { cx, cxAdd, cxAnswer, cxDiv, cxMul, cxTex, gcd, linComb, num, pairOf, poly, tex, texChoice } from '../util';

/** Variantes du chapitre « Nombres complexes » (feuille bibmath « Nombres complexes »). */

/** Angle k·π/12 ramené dans ]-π ; π], en LaTeX. */
const norm = (k: number) => {
  let m = ((k % 24) + 24) % 24;
  if (m > 12) m -= 24;
  return m;
};
export function angleTex(k: number): string {
  const m = norm(k);
  if (m === 0) return '0';
  const f = frac(Math.abs(m), 12);
  const sign = m < 0 ? '-' : '';
  if (f.n === 1 && f.d === 1) return `${sign}\\pi`;
  return `${sign}\\frac{${f.n === 1 ? '' : f.n}\\pi}{${f.d}}`;
}

/** Nombres d'argument connu (en douzièmes de π) et de module connu. */
const BASES: [string, number, string][] = [
  ['1 + i', 3, '\\sqrt{2}'],
  ['1 - i', -3, '\\sqrt{2}'],
  ['-1 + i', 9, '\\sqrt{2}'],
  ['\\sqrt{3} + i', 2, '2'],
  ['1 + i\\sqrt{3}', 4, '2'],
  ['-1 + i\\sqrt{3}', 8, '2'],
  ['\\sqrt{3} - i', -2, '2'],
  ['i', 6, '1'],
  ['-i', -6, '1'],
  ['-1', 12, '1'],
];

const MODULES: Fait[] = [
  { s: '$|z + w| = |z| + |w|$ pour tous complexes $z, w$.', v: false, why: 'Avec $z = 1$ et $w = -1$ : $|z + w| = 0$ mais $|z| + |w| = 2$. On a seulement l’inégalité triangulaire.' },
  { s: '$|zw| = |z|\\,|w|$ pour tous complexes $z, w$.', v: true, why: 'Le module est multiplicatif.' },
  { s: '$|\\overline{z}| = |z|$ pour tout complexe $z$.', v: true, why: '$a - ib$ et $a + ib$ ont le même module $\\sqrt{a^2 + b^2}$.' },
  { s: '$|z|^2 = z^2$ pour tout complexe $z$.', v: false, why: 'Pour $z = i$ : $|z|^2 = 1$ mais $z^2 = -1$. La bonne formule est $|z|^2 = z\\overline{z}$.' },
  { s: '$|z|^2 = z\\overline{z}$ pour tout complexe $z$.', v: true, why: '$(a + ib)(a - ib) = a^2 + b^2$.' },
  { s: '$\\big||z| - |w|\\big| \\leq |z - w|$ pour tous complexes $z, w$.', v: true, why: 'C’est la deuxième inégalité triangulaire.' },
  { s: 'Si $|z| = 1$, alors $\\frac{1}{z} = \\overline{z}$.', v: true, why: '$z\\overline{z} = |z|^2 = 1$.' },
  { s: '$|z + w|^2 = |z|^2 + |w|^2$ pour tous complexes $z, w$.', v: false, why: '$|z + w|^2 = |z|^2 + |w|^2 + 2\\,\\mathrm{Re}(z\\overline{w})$ : il manque le terme croisé (prends $z = w = 1$).' },
  { s: '$\\mathrm{Re}(z) \\leq |z|$ pour tout complexe $z$.', v: true, why: '$\\mathrm{Re}(z)^2 \\leq \\mathrm{Re}(z)^2 + \\mathrm{Im}(z)^2 = |z|^2$.' },
];

const EQUATIONS: Fait[] = [
  { s: 'Une équation $az^2 + bz + c = 0$ à coefficients réels et de discriminant négatif a deux solutions complexes conjuguées.', v: true, why: 'Elles valent $\\frac{-b \\pm i\\sqrt{-\\Delta}}{2a}$.' },
  { s: 'Une équation du second degré à coefficients complexes peut n’avoir aucune solution dans $\\mathbb{C}$.', v: false, why: 'Tout complexe a deux racines carrées (ou une seule s’il est nul) : il y a toujours une ou deux solutions.' },
  { s: 'Si $z_1$ et $z_2$ sont les racines de $z^2 + pz + q$, alors $z_1 + z_2 = -p$ et $z_1 z_2 = q$.', v: true, why: '$(z - z_1)(z - z_2) = z^2 - (z_1 + z_2)z + z_1 z_2$.' },
  { s: 'L’équation $z^2 = -4$ n’a pas de solution.', v: false, why: 'Dans $\\mathbb{C}$, $z = 2i$ et $z = -2i$ conviennent.' },
  { s: 'Tout complexe non nul a exactement deux racines carrées, opposées.', v: true, why: 'Si $w^2 = z$, les solutions de $u^2 = z$ sont $\\pm w$.' },
  { s: 'Pour un complexe $z$, on peut écrire $\\sqrt{z}$ comme pour un réel positif, avec $\\sqrt{zw} = \\sqrt{z}\\sqrt{w}$.', v: false, why: 'Il n’y a pas de racine carrée « privilégiée » dans $\\mathbb{C}$ : $-1 = i \\cdot i = \\sqrt{-1}\\sqrt{-1}$ mènerait à $-1 = \\sqrt{1} = 1$.' },
  { s: 'Si un polynôme à coefficients réels a pour racine $2 + i$, il a aussi pour racine $2 - i$.', v: true, why: 'On conjugue l’égalité $P(2 + i) = 0$, les coefficients étant réels.' },
];

const choiceAngle = (rng: Rng, k: number) => texChoice(rng, angleTex(k), [angleTex(k + 12), angleTex(-k), angleTex(k + 6), angleTex(k - 6), angleTex(k + 3)]);

export const COMPLEXES_VARIANTES: Variantes = {
  'l1-forme-algebrique': [
    // Inverse d'un complexe.
    (rng) => {
      const z = cx(rng.int(-5, 5), rng.nonZero(-5, 5));
      const inv = cxDiv(cx(1, 0), z);
      const n2 = z.re.n ** 2 + z.im.n ** 2;
      return {
        prompt: `Écris $\\dfrac{1}{${cxTex(z)}}$ sous forme algébrique.`,
        answer: cxAnswer(inv),
        hint: 'Multiplie en haut et en bas par le conjugué : $\\frac{1}{z} = \\frac{\\overline{z}}{|z|^2}$.',
        correction: [`$|z|^2 = ${n2}$`, `$\\frac{1}{z} = \\frac{${cxTex(cx(z.re, frac(-z.im.n)))}}{${n2}} = ${cxTex(inv)}$`],
      };
    },
    // z + k·z̄ = w.
    (rng) => {
      const k = rng.pick([-3, -2, 2, 3]);
      const x = rng.int(-5, 5);
      const y = rng.nonZero(-5, 5);
      const w = cx((1 + k) * x, (1 - k) * y);
      return {
        prompt: `Trouve le complexe $z$ tel que $z ${k < 0 ? '-' : '+'} ${Math.abs(k)}\\,\\overline{z} = ${cxTex(w)}$.`,
        answer: cxAnswer(cx(x, y)),
        hint: 'Pose $z = x + iy$ et identifie parties réelles et imaginaires.',
        correction: [`Avec $z = x + iy$ : $${linComb([[1 + k, 'x']])} = ${tex(w.re)}$ et $${linComb([[1 - k, 'y']])} = ${tex(w.im)}$`, `$x = ${x}$, $y = ${y}$ : $z = ${cxTex(cx(x, y))}$`],
      };
    },
    // Équation du premier degré az + b = c.
    (rng) => {
      const a = cx(rng.int(-3, 3), rng.nonZero(-3, 3));
      const z = cx(rng.int(-4, 4), rng.int(-4, 4));
      const b = cx(rng.int(-5, 5), rng.int(-5, 5));
      const c = cxAdd(cxMul(a, z), b);
      return {
        prompt: `Résous dans $\\mathbb{C}$ : $(${cxTex(a)})z + ${cxTex(b).startsWith('-') ? `(${cxTex(b)})` : cxTex(b)} = ${cxTex(c)}$.`,
        answer: cxAnswer(z),
        hint: '$z = \\frac{c - b}{a}$, puis multiplie par le conjugué de $a$.',
        correction: [`$z = \\dfrac{${cxTex(cxAdd(c, cx(frac(-b.re.n, b.re.d), frac(-b.im.n, b.im.d))))}}{${cxTex(a)}} = ${cxTex(z)}$`],
      };
    },
  ],
  'l1-module': [
    (rng) => vraiFauxBanque(rng, MODULES),
    (rng) => qcmBanque(rng, MODULES, rng.next() < 0.5),
    // Distance entre deux points du plan complexe.
    (rng) => {
      const TRIPLES: [number, number, number][] = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15]];
      const [p, q, r] = rng.pick(TRIPLES);
      const a = cx(rng.int(-5, 5), rng.int(-5, 5));
      const sx = rng.sign();
      const sy = rng.sign();
      const b = cxAdd(a, rng.next() < 0.5 ? cx(sx * p, sy * q) : cx(sx * q, sy * p));
      return {
        prompt: `Dans le plan complexe, $A$ et $B$ ont pour affixes $${cxTex(a)}$ et $${cxTex(b)}$. Calcule la distance $AB$.`,
        answer: num(r),
        hint: '$AB = |z_B - z_A|$.',
        correction: [`$z_B - z_A = ${cxTex(cxAdd(b, cx(frac(-a.re.n), frac(-a.im.n))))}$`, `$AB = \\sqrt{${p * p} + ${q * q}} = ${r}$`],
      };
    },
  ],
  'l1-argument': [
    // Argument d'un produit ou d'un quotient.
    (rng) => {
      const [z1, k1] = rng.pick(BASES);
      let [z2, k2] = rng.pick(BASES);
      while (z2 === z1) [z2, k2] = rng.pick(BASES);
      const quotient = rng.next() < 0.5;
      const k = quotient ? k1 - k2 : k1 + k2;
      return {
        prompt: `Quel est l’argument principal de $${quotient ? `\\dfrac{${z1}}{${z2}}` : `(${z1})(${z2})`}$ ?`,
        answer: choiceAngle(rng, k),
        hint: `$\\arg(zw) = \\arg z + \\arg w$ et $\\arg\\frac{z}{w} = \\arg z - \\arg w$ (modulo $2\\pi$).`,
        correction: [`$\\arg(${z1}) = ${angleTex(k1)}$ et $\\arg(${z2}) = ${angleTex(k2)}$`, `L’argument cherché vaut $${angleTex(k)}$ (modulo $2\\pi$).`],
      };
    },
    // Argument d'une puissance.
    (rng, level) => {
      const [z, k1] = rng.pick(BASES.slice(0, 7));
      const n = rng.int(2, level === 3 ? 15 : 6);
      return {
        prompt: `Quel est l’argument principal de $(${z})^{${n}}$ ?`,
        answer: choiceAngle(rng, n * k1),
        hint: '$\\arg(z^n) = n \\arg z$, ramené dans $]-\\pi\\,;\\pi]$.',
        correction: [`$\\arg(${z}) = ${angleTex(k1)}$`, `$${n} \\times ${angleTex(k1)}$ se ramène à $${angleTex(n * k1)}$.`],
      };
    },
    // Conjugué et opposé.
    (rng) => {
      const [z, k] = rng.pick(BASES);
      const what = rng.pick(['conj', 'opp', 'inv'] as const);
      const kk = what === 'opp' ? k + 12 : -k;
      const t = { conj: `\\overline{${z}}`, opp: `-(${z})`, inv: `\\dfrac{1}{${z}}` }[what];
      return {
        prompt: `On sait que $\\arg(${z}) = ${angleTex(k)}$. Quel est l’argument principal de $${t}$ ?`,
        answer: choiceAngle(rng, kk),
        hint: 'Conjuguer ou inverser change l’argument en son opposé ; changer de signe ajoute $\\pi$.',
        correction: [`L’argument vaut $${angleTex(kk)}$.`],
      };
    },
  ],
  'l1-puissance-complexe': [
    // Plus petit n tel que z^n soit réel (positif).
    (rng) => {
      const [z, k] = rng.pick(BASES.slice(0, 7));
      const positive = rng.next() < 0.5;
      let n = 1;
      while (norm(n * k) !== 0 && !(norm(n * k) === 12 && !positive)) n++;
      return {
        prompt: `Quel est le plus petit entier $n \\geq 1$ tel que $(${z})^n$ soit un réel${positive ? ' strictement positif' : ''} ?`,
        answer: num(n),
        hint: `$z^n$ est réel quand $n \\arg z$ est multiple de $\\pi$, réel positif quand c’est un multiple de $2\\pi$.`,
        correction: [`$\\arg(${z}) = ${angleTex(k)}$, donc $\\arg(z^n) = n \\times ${angleTex(k)}$.`, `Le plus petit $n$ qui convient est $${n}$.`],
      };
    },
    // Somme des puissances de i.
    (rng) => {
      const n = rng.int(5, 60);
      let re = 0;
      let im = 0;
      for (let k = 0; k <= n; k++) [re, im] = [re + [1, 0, -1, 0][k % 4], im + [0, 1, 0, -1][k % 4]];
      return {
        prompt: `Calcule $\\displaystyle\\sum_{k=0}^{${n}} i^k$ sous forme algébrique.`,
        answer: cxAnswer(cx(re, im)),
        hint: 'Les puissances de $i$ se répètent par blocs de $4$ de somme nulle : $1 + i - 1 - i = 0$.',
        correction: [`$${n + 1} = 4 \\times ${Math.floor((n + 1) / 4)} + ${(n + 1) % 4}$ : il reste les $${(n + 1) % 4}$ premiers termes.`, `La somme vaut $${cxTex(cx(re, im))}$.`],
      };
    },
    // Racines de l'unité communes.
    (rng) => {
      const n = rng.int(4, 24);
      const m = rng.int(4, 24);
      const g = gcd(n, m);
      return {
        prompt: `Combien de complexes sont à la fois racines $${n}$-ièmes et racines $${m}$-ièmes de l’unité ?`,
        answer: num(g),
        hint: '$z^n = 1$ et $z^m = 1$ entraînent $z^{\\operatorname{pgcd}(n, m)} = 1$ (Bézout).',
        correction: [`Ce sont les racines $${g}$-ièmes de l’unité, avec $${g} = \\operatorname{pgcd}(${n}, ${m})$ : il y en a $${g}$.`],
      };
    },
  ],
  'l1-racine-carree-complexe': [
    // z² = -k² ou z² = 2m²i.
    (rng) => {
      const m = rng.int(1, 7);
      if (rng.next() < 0.5)
        return {
          prompt: `Résous $z^2 = ${-m * m}$ dans $\\mathbb{C}$ et donne la solution de partie imaginaire positive.`,
          answer: cxAnswer(cx(0, m)),
          hint: '$(ik)^2 = -k^2$.',
          correction: [`$z^2 = (${m === 1 ? '' : m}i)^2$, donc $z = \\pm ${m === 1 ? '' : m}i$.`],
        };
      const s = rng.sign();
      return {
        prompt: `Les racines carrées de $${s < 0 ? '-' : ''}${2 * m * m}i$ sont $\\pm w$. Donne celle de partie réelle positive.`,
        answer: cxAnswer(cx(m, s * m)),
        hint: 'Cherche $w = a + ib$ avec $a^2 - b^2 = 0$ et $2ab = \\pm 2m^2$.',
        correction: [`$(${cxTex(cx(m, s * m))})^2 = ${m * m} - ${m * m} ${s < 0 ? '-' : '+'} ${2 * m * m}i$`, `$w = ${cxTex(cx(m, s * m))}$`],
      };
    },
    // Question inverse : carré d'un complexe.
    (rng) => {
      const w = cx(rng.int(-6, 6), rng.nonZero(-6, 6));
      const z = cxMul(w, w);
      return {
        prompt: `$${cxTex(w)}$ est une racine carrée d’un complexe $z$. Écris $z$ sous forme algébrique.`,
        answer: cxAnswer(z),
        hint: '$z = w^2 = (a + ib)^2 = a^2 - b^2 + 2iab$.',
        correction: [`$z = ${cxTex(z)}$`],
      };
    },
    (rng) => vraiFauxBanque(rng, EQUATIONS),
  ],
  'l1-equation-second-degre-complexe': [
    // Équation de racines données.
    (rng) => {
      const a = rng.int(-4, 4);
      const b = rng.int(1, 5);
      return {
        prompt: `On cherche une équation $z^2 + pz + q = 0$ à coefficients réels dont $${cxTex(cx(a, b))}$ est solution. Donne $p$ et $q$.`,
        answer: pairOf(-2 * a, a * a + b * b, ['p', 'q']),
        hint: 'L’autre solution est le conjugué ; utilise somme et produit des racines.',
        correction: [`Somme : $2 \\times ${a < 0 ? `(${a})` : a} = ${2 * a}$, produit : $${a * a} + ${b * b} = ${a * a + b * b}$.`, `$p = ${-2 * a}$ et $q = ${a * a + b * b}$`],
      };
    },
    // Somme et produit des racines (coefficients complexes).
    (rng) => {
      const s = cx(rng.int(-4, 4), rng.int(-4, 4));
      const p = cx(rng.int(-6, 6), rng.int(-6, 6));
      const ask = rng.pick(['somme', 'produit'] as const);
      const negS = cx(frac(-s.re.n), frac(-s.im.n));
      return {
        prompt: `On note $z_1, z_2$ les solutions de $z^2 + (${cxTex(negS)})z + (${cxTex(p)}) = 0$. Calcule ${ask === 'somme' ? '$z_1 + z_2$' : '$z_1 z_2$'}.`,
        answer: cxAnswer(ask === 'somme' ? s : p),
        hint: 'Pour $z^2 + bz + c$ : $z_1 + z_2 = -b$ et $z_1 z_2 = c$.',
        correction: [`$z_1 + z_2 = ${cxTex(s)}$ et $z_1 z_2 = ${cxTex(p)}$.`],
      };
    },
    (rng) => qcmBanque(rng, EQUATIONS, rng.next() < 0.5),
    // Partie réelle commune des racines.
    (rng) => {
      const a = rng.int(1, 3);
      const r = rng.int(-4, 4);
      const beta = rng.int(1, 4);
      return {
        prompt: `Les solutions de $${poly([a, -2 * a * r, a * (r * r + beta * beta)], 'z')} = 0$ ont la même partie réelle. Laquelle ?`,
        answer: num(r),
        hint: 'Avec $\\Delta < 0$, les racines sont $\\frac{-b \\pm i\\sqrt{-\\Delta}}{2a}$ : la partie réelle vaut $-\\frac{b}{2a}$.',
        correction: [`$\\Delta = ${4 * a * a * r * r} - ${4 * a * a * (r * r + beta * beta)} = ${-4 * a * a * beta * beta} < 0$`, `$-\\frac{b}{2a} = \\frac{${2 * a * r}}{${2 * a}} = ${r}$, et les racines sont $${r} \\pm ${beta === 1 ? '' : beta}i$.`],
      };
    },
  ],
};

export const BANQUES_COMPLEXES = { MODULES, EQUATIONS };
