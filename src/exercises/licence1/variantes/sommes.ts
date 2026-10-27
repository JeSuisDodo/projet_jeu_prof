import type { Variantes } from '../../licenceVariantes';
import { F, add, binom, fact, linComb, num, numF, par, tex } from '../util';

/** Variantes du chapitre « Sommes et coefficients binomiaux » (feuille bibmath « Calcul algébrique »). */

const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const sum = (xs: number[]) => xs.reduce((s, x) => s + x, 0);

export const SOMMES_VARIANTES: Variantes = {
  'l1-sommes-usuelles': [
    // Somme d'une expression affine.
    (rng, level) => {
      const a = rng.nonZero(-5, 5);
      const b = rng.int(-6, 6);
      const n = rng.int(5, level === 1 ? 20 : 60);
      const v = sum(range(1, n).map((k) => a * k + b));
      return {
        prompt: `Calcule $\\displaystyle\\sum_{k=1}^{${n}} (${linComb([[a, 'k'], [b, '']])})$.`,
        answer: num(v),
        hint: 'Sépare : $\\sum (ak + b) = a\\sum k + nb$, avec $\\sum_{k=1}^n k = \\frac{n(n+1)}{2}$.',
        correction: [`$${a} \\times \\frac{${n} \\times ${n + 1}}{2} + ${n} \\times ${par(b)} = ${a * (n * (n + 1)) / 2}${n * b === 0 ? '' : ` ${n * b < 0 ? '-' : '+'} ${Math.abs(n * b)}`} = ${v}$`],
      };
    },
    // Question inverse : trouver n.
    (rng, level) => {
      const n = rng.int(5, level === 1 ? 30 : 120);
      const odd = rng.next() < 0.4;
      const S = odd ? n * n : (n * (n + 1)) / 2;
      return {
        prompt: odd
          ? `On additionne les $n$ premiers entiers impairs : $1 + 3 + 5 + \\dots + (2n - 1) = ${S}$. Que vaut $n$ ?`
          : `Un escalier de cubes a $1$ cube sur la première marche, $2$ sur la deuxième, et ainsi de suite. Il utilise $${S}$ cubes en tout. Combien a-t-il de marches ?`,
        answer: num(n),
        hint: odd ? 'La somme des $n$ premiers impairs vaut $n^2$.' : 'Résous $\\frac{n(n+1)}{2} = S$.',
        correction: [odd ? `$n^2 = ${S}$, donc $n = ${n}$.` : `$\\frac{n(n+1)}{2} = ${S} \\iff n^2 + n - ${2 * S} = 0 \\iff n = ${n}$`],
      };
    },
    // Somme de k(k+1) ou de k³.
    (rng) => {
      const n = rng.int(4, 25);
      const cube = rng.next() < 0.5;
      const v = sum(range(1, n).map((k) => (cube ? k ** 3 : k * (k + 1))));
      return {
        prompt: `Calcule $\\displaystyle\\sum_{k=1}^{${n}} ${cube ? 'k^3' : 'k(k+1)'}$.`,
        answer: num(v),
        hint: cube ? '$\\sum_{k=1}^n k^3 = \\left(\\frac{n(n+1)}{2}\\right)^2$.' : '$k(k+1) = k^2 + k$, et $\\sum k^2 = \\frac{n(n+1)(2n+1)}{6}$.',
        correction: [cube ? `$\\left(\\frac{${n} \\times ${n + 1}}{2}\\right)^2 = ${v}$` : `$\\frac{${n}\\times${n + 1}\\times${2 * n + 1}}{6} + \\frac{${n}\\times${n + 1}}{2} = ${v}$ (ou $\\frac{n(n+1)(n+2)}{3}$)`],
      };
    },
  ],
  'l1-somme-geometrique': [
    // Problème concret : doublement.
    (rng, level) => {
      const q = level === 1 ? 2 : rng.pick([2, 3]);
      const n = rng.int(5, level === 1 ? 10 : 14);
      const v = (q ** (n + 1) - 1) / (q - 1);
      return {
        prompt: `Une rumeur se propage : le jour $0$, une personne la lance ; chaque jour, chaque nouvelle personne informée la répète à $${q}$ personnes qui ne la connaissaient pas. Combien de personnes la connaissent à la fin du jour $${n}$ ?`,
        answer: num(v),
        hint: `Le jour $k$, $${q}^k$ nouvelles personnes l’apprennent : somme géométrique.`,
        correction: [`$\\sum_{k=0}^{${n}} ${q}^k = \\frac{${q}^{${n + 1}} - 1}{${q} - 1} = ${v}$`],
      };
    },
    // Somme à partir de l'indice p.
    (rng, level) => {
      const q = rng.pick(level === 1 ? [2, 3] : [2, 3, -2]);
      const p = rng.int(1, 4);
      const n = p + rng.int(2, 6);
      const v = sum(range(p, n).map((k) => q ** k));
      return {
        prompt: `Calcule $\\displaystyle\\sum_{k=${p}}^{${n}} ${par(q)}^k$.`,
        answer: num(v),
        hint: 'Factorise par le premier terme : $\\sum_{k=p}^{n} q^k = q^p \\frac{1 - q^{n-p+1}}{1 - q}$.',
        correction: [`$${par(q)}^{${p}} \\times \\frac{1 - ${par(q)}^{${n - p + 1}}}{1 - ${par(q)}} = ${v}$`],
      };
    },
    // Raison 1/2 : somme fractionnaire.
    (rng) => {
      const d = rng.pick([2, 3]);
      const n = rng.int(3, 7);
      let s = F(0);
      for (let k = 0; k <= n; k++) s = add(s, F(1, d ** k));
      return {
        prompt: `Calcule $\\displaystyle\\sum_{k=0}^{${n}} \\frac{1}{${d}^k}$.`,
        answer: numF(s),
        hint: `Raison $q = \\frac{1}{${d}}$ : $\\frac{1 - q^{n+1}}{1 - q}$.`,
        correction: [`$\\dfrac{1 - (1/${d})^{${n + 1}}}{1 - 1/${d}} = ${tex(s)}$`],
      };
    },
  ],
  'l1-binome-newton': [
    // Terme constant de (x + 1/x)^n ou (x² + 1/x)^n.
    (rng, level) => {
      const sq = level > 1 && rng.next() < 0.5;
      const n = sq ? 3 * rng.int(1, 4) : 2 * rng.int(2, 6);
      const k = sq ? (2 * n) / 3 : n / 2;
      const c = rng.pick([1, 2]);
      const v = binom(n, k) * c ** k;
      return {
        prompt: `Quel est le terme constant (indépendant de $x$) du développement de $\\left(${sq ? 'x^2' : 'x'} + \\frac{${c}}{x}\\right)^{${n}}$ ?`,
        answer: num(v),
        hint: `Le terme général est $\\binom{${n}}{k} \\left(\\frac{${c}}{x}\\right)^k ${sq ? '(x^2)' : 'x'}^{${n} - k}$ : cherche $k$ pour que la puissance de $x$ soit nulle.`,
        correction: [sq ? `$2(${n} - k) - k = 0 \\iff k = ${k}$` : `$${n} - 2k = 0 \\iff k = ${k}$`, `Terme : $\\binom{${n}}{${k}}${c === 1 ? '' : ` \\times ${c}^{${k}}`} = ${v}$`],
      };
    },
    // Σ C(n,k) a^k = (1 + a)^n.
    (rng) => {
      const n = rng.int(3, 9);
      const a = rng.pick([2, 3, -1, -2, 4]);
      const v = (1 + a) ** n;
      return {
        prompt: `Calcule $\\displaystyle\\sum_{k=0}^{${n}} \\binom{${n}}{k} ${par(a)}^k$.`,
        answer: num(v),
        hint: 'Reconnais la formule du binôme $(1 + a)^n = \\sum \\binom{n}{k} a^k$.',
        correction: [`$(1 ${a < 0 ? '-' : '+'} ${Math.abs(a)})^{${n}} = ${v}$`],
      };
    },
    // Développer (a + b)^n en nombre : 11^n, 1.1^n…
    (rng) => {
      const n = rng.int(3, 6);
      const k = rng.int(1, n - 1);
      return {
        prompt: `Dans le développement de $(1 + x)^{${n}}(1 - x)$, quel est le coefficient de $x^{${k}}$ ?`,
        answer: num(binom(n, k) - binom(n, k - 1)),
        hint: 'Le coefficient de $x^k$ vaut $\\binom{n}{k} - \\binom{n}{k-1}$.',
        correction: [`$\\binom{${n}}{${k}} - \\binom{${n}}{${k - 1}} = ${binom(n, k)} - ${binom(n, k - 1)} = ${binom(n, k) - binom(n, k - 1)}$`],
      };
    },
  ],
  'l1-somme-binomiale': [
    (rng, level) => {
      const n = rng.int(3, level === 1 ? 8 : 12);
      const kinds = [
        { t: 'k\\binom{n}{k}', v: n * 2 ** (n - 1), why: `$k\\binom{n}{k} = n\\binom{n-1}{k-1}$, donc la somme vaut $n 2^{n-1} = ${n * 2 ** (n - 1)}$.` },
        { t: '\\binom{n}{k}^2', v: binom(2 * n, n), why: `Formule de Vandermonde : $\\sum \\binom{n}{k}^2 = \\binom{2n}{n} = ${binom(2 * n, n)}$.` },
        { t: '(-1)^k \\binom{n}{k}', v: 0, why: '$(1 - 1)^n = 0$ pour $n \\geq 1$.' },
      ];
      const k = rng.pick(kinds.slice(0, level === 1 ? 1 : 3));
      return {
        prompt: `Pour $n = ${n}$, calcule $\\displaystyle\\sum_{k=0}^{n} ${k.t}$.`,
        answer: num(k.v),
        hint: 'Pense à $(1 + x)^n$, à sa dérivée, ou à un dénombrement.',
        correction: [k.why],
      };
    },
    // Nombre de parties de cardinal pair.
    (rng) => {
      const n = rng.int(3, 12);
      const even = rng.next() < 0.5;
      return {
        prompt: `Un ensemble a $${n}$ éléments. Combien a-t-il de parties de cardinal ${even ? 'pair' : 'impair'} ?`,
        answer: num(2 ** (n - 1)),
        hint: 'Additionne et soustrais $(1 + 1)^n$ et $(1 - 1)^n$.',
        correction: [`$\\sum_{k \\text{ ${even ? 'pair' : 'impair'}}} \\binom{n}{k} = \\frac{2^n ${even ? '+' : '-'} 0}{2} = 2^{${n - 1}} = ${2 ** (n - 1)}$`],
      };
    },
    // Vandermonde concret.
    (rng) => {
      const m = rng.int(3, 8);
      const p = rng.int(3, 8);
      const r = rng.int(2, Math.min(m + p - 1, 6));
      return {
        prompt: `Un comité de $${r}$ personnes est choisi parmi $${m}$ étudiantes et $${p}$ étudiants. Combien de comités possibles en tout ? (Indication : $\\sum_k \\binom{${m}}{k}\\binom{${p}}{${r} - k}$.)`,
        answer: num(binom(m + p, r)),
        hint: 'Compter selon le nombre $k$ d’étudiantes revient à choisir directement $r$ personnes parmi $m + p$.',
        correction: [`$\\sum_k \\binom{${m}}{k}\\binom{${p}}{${r} - k} = \\binom{${m + p}}{${r}} = ${binom(m + p, r)}$ (Vandermonde).`],
      };
    },
  ],
  'l1-somme-telescopique': [
    // Produit télescopique.
    (rng) => {
      const n = rng.int(3, 40);
      return {
        prompt: `Calcule $\\displaystyle\\prod_{k=2}^{${n}} \\left(1 - \\frac{1}{k^2}\\right)$.`,
        answer: numF(F(n + 1, 2 * n)),
        hint: '$1 - \\frac{1}{k^2} = \\frac{(k-1)(k+1)}{k \\cdot k}$ : sépare en deux produits télescopiques.',
        correction: [`$\\prod \\frac{k-1}{k} = \\frac{1}{${n}}$ et $\\prod \\frac{k+1}{k} = \\frac{${n + 1}}{2}$`, `Le produit vaut $\\frac{${n + 1}}{${2 * n}}${tex(F(n + 1, 2 * n)) === `\\frac{${n + 1}}{${2 * n}}` ? '' : ` = ${tex(F(n + 1, 2 * n))}`}$`],
      };
    },
    // Σ k·k! = (n+1)! − 1.
    (rng) => {
      const n = rng.int(3, 9);
      return {
        prompt: `Calcule $\\displaystyle\\sum_{k=1}^{${n}} k \\cdot k!$.`,
        answer: num(fact(n + 1) - 1),
        hint: '$k \\cdot k! = (k+1)! - k!$.',
        correction: [`La somme télescope : $${n + 1}! - 1! = ${fact(n + 1) - 1}$`],
      };
    },
    // Σ (√(k+1) − √k) ou ln((k+1)/k).
    (rng) => {
      const m = rng.int(2, 15);
      if (rng.next() < 0.5)
        return {
          prompt: `Calcule $\\displaystyle\\sum_{k=0}^{${m * m - 1}} \\left(\\sqrt{k+1} - \\sqrt{k}\\right)$.`,
          answer: num(m),
          hint: 'Les termes se simplifient deux à deux.',
          correction: [`Il reste $\\sqrt{${m * m}} - \\sqrt{0} = ${m}$.`],
        };
      const n = rng.int(3, 50);
      return {
        prompt: `On a $\\displaystyle\\sum_{k=1}^{${n}} \\ln\\left(\\frac{k+1}{k}\\right) = \\ln N$. Que vaut l’entier $N$ ?`,
        answer: num(n + 1),
        hint: '$\\ln\\frac{k+1}{k} = \\ln(k+1) - \\ln k$.',
        correction: [`La somme télescope : $\\ln(${n + 1}) - \\ln 1 = \\ln ${n + 1}$`],
      };
    },
  ],
  'l1-somme-double': [
    (rng, level) => {
      const n = rng.int(3, level === 1 ? 6 : 12);
      const kinds: [string, (i: number, j: number) => number, (i: number, j: number) => boolean, string][] = [
        ['\\sum_{1 \\leq i, j \\leq n} ij', (i, j) => i * j, () => true, `$\\left(\\sum i\\right)\\left(\\sum j\\right) = \\left(\\frac{n(n+1)}{2}\\right)^2$`],
        ['\\sum_{1 \\leq i \\leq j \\leq n} 1', () => 1, (i, j) => i <= j, 'On compte les couples $i \\leq j$ : $\\frac{n(n+1)}{2}$.'],
        ['\\sum_{1 \\leq i, j \\leq n} \\min(i, j)', (i, j) => Math.min(i, j), () => true, 'Le minimum vaut $k$ pour $2(n - k) + 1$ couples : $\\sum_k k(2n - 2k + 1)$.'],
        ['\\sum_{1 \\leq i < j \\leq n} (i + j)', (i, j) => i + j, (i, j) => i < j, 'Chaque entier $k$ apparaît dans $n - 1$ couples : $(n - 1)\\frac{n(n+1)}{2}$.'],
        ['\\sum_{1 \\leq i, j \\leq n} (i + j)', (i, j) => i + j, () => true, '$2n \\sum_{k=1}^{n} k = n^2(n+1)$.'],
      ];
      const [t, f, keep, why] = rng.pick(level === 1 ? kinds.slice(0, 2) : kinds);
      let v = 0;
      for (let i = 1; i <= n; i++) for (let j = 1; j <= n; j++) if (keep(i, j)) v += f(i, j);
      return {
        prompt: `Pour $n = ${n}$, calcule $\\displaystyle${t}$.`,
        answer: num(v),
        hint: 'Somme d’abord sur un indice, à l’autre fixé, ou utilise une symétrie.',
        correction: [why, `Pour $n = ${n}$ : $${v}$`],
      };
    },
    // Tableau concret : table de multiplication.
    (rng) => {
      const n = rng.int(3, 10);
      const diag = rng.next() < 0.5;
      let v = 0;
      for (let i = 1; i <= n; i++) for (let j = 1; j <= n; j++) if (!diag || i === j) v += i * j;
      return {
        prompt: diag
          ? `Dans la table de multiplication de $1$ à $${n}$, quelle est la somme des nombres de la diagonale ($1\\times 1$, $2\\times 2$, …) ?`
          : `Quelle est la somme de tous les nombres de la table de multiplication de $1$ à $${n}$ (un tableau $${n} \\times ${n}$) ?`,
        answer: num(v),
        hint: diag ? '$\\sum k^2 = \\frac{n(n+1)(2n+1)}{6}$.' : '$\\sum_{i,j} ij = \\left(\\sum i\\right)^2$.',
        correction: [diag ? `$\\sum_{k=1}^{${n}} k^2 = ${v}$` : `$\\left(\\frac{${n}\\times${n + 1}}{2}\\right)^2 = ${v}$`],
      };
    },
  ],
};
