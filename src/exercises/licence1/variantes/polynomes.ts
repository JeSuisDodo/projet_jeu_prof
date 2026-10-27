import { type Fait, type Variantes, qcmBanque, vraiFauxBanque } from '../../licenceVariantes';
import { F, fact, num, numF, pairOf, par, poly, setOf, tex } from '../util';

/** Variantes du chapitre « Polynômes » (feuilles bibmath « Polynômes » et « Fractions rationnelles »). */

const polyMul = (p: number[], q: number[]): number[] => {
  const out = Array(p.length + q.length - 1).fill(0);
  p.forEach((a, i) => q.forEach((b, j) => (out[i + j] += a * b)));
  return out;
};
const fromRoots = (lead: number, roots: number[]) => roots.reduce((acc, r) => polyMul(acc, [1, -r]), [lead]);
const evalPoly = (p: number[], x: number) => p.reduce((s, c) => s * x + c, 0);
const deriv = (p: number[]) => p.slice(0, -1).map((c, i) => c * (p.length - 1 - i));
const P = (p: number[]) => poly(p, 'X');
const fac = (a: number) => `(X ${a < 0 ? '+' : '-'} ${Math.abs(a)})`.replace('(X - 0)', 'X');

const COURS: Fait[] = [
  { s: '$\\deg(P + Q) = \\max(\\deg P, \\deg Q)$ pour tous polynômes $P, Q$.', v: false, why: 'Les termes dominants peuvent s’annuler : $(X^2 + 1) + (-X^2) = 1$. On a seulement $\\leq$.' },
  { s: '$\\deg(PQ) = \\deg P + \\deg Q$ pour tous polynômes $P, Q$ non nuls.', v: true, why: 'Le produit des coefficients dominants est non nul.' },
  { s: 'Un polynôme réel de degré impair a au moins une racine réelle.', v: true, why: 'Ses limites en $\\pm\\infty$ sont de signes opposés : théorème des valeurs intermédiaires.' },
  { s: 'Un polynôme réel de degré pair a au moins une racine réelle.', v: false, why: '$X^2 + 1$ n’en a aucune.' },
  { s: 'Un polynôme non nul de degré $n$ a au plus $n$ racines.', v: true, why: 'Chaque racine $a$ donne un facteur $X - a$, et les degrés s’additionnent.' },
  { s: '$a$ est racine au moins double de $P$ si et seulement si $P(a) = P\'(a) = 0$.', v: true, why: 'C’est la caractérisation de la multiplicité par les dérivées.' },
  { s: 'Si $P(a) = 0$ et $P\'(a) = 0$, alors $a$ est racine triple de $P$.', v: false, why: 'Seulement au moins double : $(X - a)^2$ vérifie les deux conditions.' },
  { s: 'Tout polynôme complexe non constant a une racine dans $\\mathbb{C}$.', v: true, why: 'C’est le théorème de d’Alembert-Gauss.' },
  { s: 'Les polynômes irréductibles de $\\mathbb{R}[X]$ sont exactement ceux de degré $1$.', v: false, why: 'Les polynômes de degré $2$ de discriminant négatif, comme $X^2 + 1$, sont aussi irréductibles.' },
  { s: 'Si $P$ est à coefficients réels et $P(i) = 0$, alors $X^2 + 1$ divise $P$.', v: true, why: '$-i$ est aussi racine, donc $(X - i)(X + i) = X^2 + 1$ divise $P$.' },
  { s: 'Le reste de la division de $P$ par $X - a$ est $P(a)$.', v: true, why: '$P = (X - a)Q + r$ et on évalue en $a$.' },
  { s: 'Si $P\'$ a une racine double, $P$ a forcément une racine triple.', v: false, why: '$P = X^3 + 1$ : $P\' = 3X^2$ a $0$ pour racine double, mais $P(0) = 1$.' },
];

export const POLYNOMES_VARIANTES: Variantes = {
  'l1-division-euclidienne': [
    // Reste de X^n par (X − a)(X − b).
    (rng, level) => {
      let a = rng.int(-2, 2);
      let b = rng.int(-2, 2);
      while (a === b) [a, b] = [rng.int(-2, 2), rng.int(-2, 2)];
      if (a > b) [a, b] = [b, a];
      const n = rng.int(3, level === 1 ? 8 : 12);
      const r = (b ** n - a ** n) / (b - a);
      const s = a ** n - r * a;
      return {
        prompt: `Quel est le reste de la division euclidienne de $X^{${n}}$ par $${P(polyMul([1, -a], [1, -b]))}$ ? Il s’écrit $rX + s$ : donne $r$ et $s$.`,
        answer: pairOf(r, s, ['r', 's']),
        hint: `Écris $X^{${n}} = (X ${a < 0 ? '+' : '-'} ${Math.abs(a)})(X ${b < 0 ? '+' : '-'} ${Math.abs(b)})Q + rX + s$ et évalue en $${a}$ et $${b}$.`.replace('(X - 0)', 'X'),
        correction: [`$${a === 0 ? 's' : `${par(a)}r + s`} = ${a ** n}$ et $${b === 0 ? 's' : `${par(b)}r + s`} = ${b ** n}$`, `$r = ${r}$ et $s = ${s}$`],
      };
    },
    // Paramètre pour que X − a divise P.
    (rng) => {
      const a = rng.nonZero(-3, 3);
      const c = rng.int(-6, 6);
      const k = rng.nonZero(-3, 3);
      // X³ + kX² + mX + c divisible par X − a ⟺ a³ + k a² + m a + c = 0.
      const m = F(-(a ** 3 + k * a * a + c), a);
      return {
        prompt: `Pour quelle valeur de $m$ le polynôme $X^3 ${k < 0 ? '-' : '+'} ${Math.abs(k) === 1 ? '' : Math.abs(k)}X^2 + mX${c === 0 ? '' : ` ${c < 0 ? '-' : '+'} ${Math.abs(c)}`}$ est-il divisible par $${fac(a)}$ ?`,
        answer: numF(m),
        hint: '$X - a$ divise $P$ si et seulement si $P(a) = 0$.',
        correction: [`$P(${a}) = ${a ** 3 + k * a * a + c} ${a < 0 ? '-' : '+'} ${Math.abs(a) === 1 ? '' : Math.abs(a)}m = 0$`, `$m = ${tex(m)}$`],
      };
    },
    // Quotient par X − a (Horner) : coefficient constant du quotient.
    (rng) => {
      const a = rng.nonZero(-3, 3);
      const Q = [rng.nonZero(-3, 3), rng.int(-4, 4), rng.int(-4, 4)];
      const r = rng.int(-5, 5);
      const A = polyMul(Q, [1, -a]);
      A[A.length - 1] += r;
      return {
        prompt: `On divise $A = ${P(A)}$ par $${fac(a)}$. Quel est le terme constant du quotient ?`,
        answer: num(Q[2]),
        hint: 'Utilise le schéma de Horner, ou pose la division.',
        correction: [`$A = ${fac(a)}(${P(Q)})${r === 0 ? '' : ` ${r < 0 ? '-' : '+'} ${Math.abs(r)}`}$`, `Le terme constant du quotient est $${Q[2]}$.`],
      };
    },
  ],
  'l1-multiplicite': [
    // X³ + pX + q a une racine double a.
    (rng) => {
      const a = rng.nonZero(-3, 3);
      return {
        prompt: `Trouve $p$ et $q$ pour que $${a}$ soit racine double de $X^3 + pX + q$.`,
        answer: pairOf(-3 * a * a, 2 * a ** 3, ['p', 'q']),
        hint: 'Écris $P(a) = 0$ et $P\'(a) = 0$.',
        correction: [`$P\'(${a}) = ${3 * a * a} + p = 0$ donne $p = ${-3 * a * a}$.`, `$P(${a}) = ${a ** 3} ${-3 * a * a * a < 0 ? '-' : '+'} ${Math.abs(3 * a ** 3)} + q = 0$ donne $q = ${2 * a ** 3}$.`],
      };
    },
    // Multiplicité dans une forme factorisée piégeuse.
    (rng) => {
      const a = rng.int(1, 3);
      const m = rng.int(1, 4);
      const k = rng.int(1, 3);
      return {
        prompt: `Quelle est la multiplicité de la racine $${a}$ dans $P = (X - ${a})^{${m}}\\,(X^2 - ${a * a})^{${k}}$ ?`,
        answer: num(m + k),
        hint: `$X^2 - ${a * a} = (X - ${a})(X + ${a})$.`,
        correction: [`$P = (X - ${a})^{${m + k}}(X + ${a})^{${k}}$ : multiplicité $${m + k}$.`],
      };
    },
    (rng) => vraiFauxBanque(rng, COURS),
  ],
  'l1-relations-coefficients-racines': [
    // Deux nombres de somme et produit donnés.
    (rng) => {
      const x = rng.int(-9, 9);
      let y = rng.int(-9, 9);
      while (y === x) y = rng.int(-9, 9);
      return {
        prompt: `Trouve deux nombres dont la somme vaut $${x + y}$ et le produit $${x * y}$.`,
        answer: setOf([x, y]),
        hint: 'Ce sont les racines de $X^2 - SX + P$.',
        correction: [`$${P([1, -(x + y), x * y])} = ${fac(x)}${fac(y)}$`, `Les nombres sont $${x}$ et $${y}$.`],
      };
    },
    // Somme des carrés ou des inverses des racines d'un trinôme.
    (rng) => {
      const b = rng.int(-7, 7);
      const c = rng.nonZero(-6, 6);
      const squares = rng.next() < 0.5;
      const v = squares ? F(b * b - 2 * c) : F(-b, c);
      return {
        prompt: `On note $x_1, x_2$ les racines (complexes) de $${P([1, b, c])}$. Calcule $${squares ? 'x_1^2 + x_2^2' : '\\frac{1}{x_1} + \\frac{1}{x_2}'}$.`,
        answer: numF(v),
        hint: `$x_1 + x_2 = ${-b}$ et $x_1x_2 = ${c}$. ${squares ? '$x_1^2 + x_2^2 = (x_1 + x_2)^2 - 2x_1x_2$.' : '$\\frac{1}{x_1} + \\frac{1}{x_2} = \\frac{x_1 + x_2}{x_1x_2}$.'}`,
        correction: [squares ? `$${par(-b)}^2 - 2 \\times ${par(c)} = ${tex(v)}$` : `$\\frac{${-b}}{${c}} = ${tex(v)}$`],
      };
    },
    // Une racine connue : trouver les autres.
    (rng) => {
      const roots = rng.shuffle([-4, -3, -2, -1, 1, 2, 3, 4]).slice(0, 3);
      const p = fromRoots(1, roots);
      return {
        prompt: `$${roots[0]}$ est racine de $${P(p)}$. Donne toutes ses racines.`,
        answer: setOf(roots),
        hint: `Factorise par $${fac(roots[0])}$ (ou utilise somme et produit des deux autres racines).`,
        correction: [`$${P(p)} = ${fac(roots[0])}(${P(fromRoots(1, roots.slice(1)))})$`, `Racines : $${roots.join(', ')}$`],
      };
    },
  ],
  'l1-racines-polynome': [
    // Racines rationnelles : (aX − b)(X − c).
    (rng) => {
      const a = rng.pick([2, 3]);
      let b = rng.nonZero(-5, 5);
      while (b % a === 0) b = rng.nonZero(-5, 5);
      const c = rng.int(-4, 4);
      const p = polyMul([a, -b], [1, -c]);
      return {
        prompt: `Trouve toutes les racines de $${P(p)}$.`,
        answer: setOf([F(b, a), c]),
        hint: 'Discriminant, ou racine évidente puis somme et produit.',
        correction: [`$${P(p)} = (${P([a, -b])})${fac(c)}$`, `Racines : $${tex(F(b, a))}$ et $${c}$`],
      };
    },
    // Nombre de racines réelles d'un polynôme bicarré.
    (rng) => {
      const u = rng.int(-4, 9);
      let v = rng.int(-4, 9);
      while (v === u) v = rng.int(-4, 9);
      const roots = new Set<number>();
      for (const t of [u, v]) if (t >= 0) [Math.sqrt(t), -Math.sqrt(t)].forEach((x) => roots.add(x));
      const p = polyMul([1, 0, -u], [1, 0, -v]);
      return {
        prompt: `Combien le polynôme $${P(p)}$ a-t-il de racines réelles distinctes ?`,
        answer: num(roots.size),
        hint: 'Pose $Y = X^2$ : on obtient un trinôme en $Y$, puis on ne garde que $Y \\geq 0$.',
        correction: [`En $Y = X^2$ : racines $Y = ${u}$ et $Y = ${v}$.`, `Chaque $Y > 0$ donne deux racines, $Y = 0$ une seule, $Y < 0$ aucune : $${roots.size}$ racines.`],
      };
    },
    (rng) => qcmBanque(rng, COURS, rng.next() < 0.5),
  ],
  'l1-formule-taylor-polynome': [
    // Dérivée k-ième en a.
    (rng) => {
      const p = [rng.nonZero(-3, 3), rng.int(-4, 4), rng.int(-4, 4), rng.int(-4, 4)];
      const a = rng.int(-2, 2);
      const k = rng.int(1, 3);
      let d = p;
      for (let i = 0; i < k; i++) d = deriv(d);
      const v = evalPoly(d, a);
      return {
        prompt: `$P = ${P(p)}$. Calcule $P^{(${k})}(${a})$.`,
        answer: num(v),
        hint: 'Dérive $k$ fois, puis évalue.',
        correction: [`$P^{(${k})} = ${P(d)}$`, `$P^{(${k})}(${a}) = ${v}$`],
      };
    },
    // Retrouver P à partir de P(a), P'(a), P''(a).
    (rng) => {
      const a = rng.int(-2, 2);
      const [v0, v1, v2] = [rng.int(-5, 5), rng.int(-5, 5), 2 * rng.nonZero(-3, 3)];
      const b = a + rng.nonZero(-2, 2);
      const h = b - a;
      const value = v0 + v1 * h + (v2 / 2) * h * h;
      return {
        prompt: `$P$ est un polynôme de degré $2$ tel que $P(${a}) = ${v0}$, $P'(${a}) = ${v1}$ et $P''(${a}) = ${v2}$. Calcule $P(${b})$.`,
        answer: num(value),
        hint: 'Formule de Taylor : $P(X) = P(a) + P\'(a)(X - a) + \\frac{P\'\'(a)}{2}(X - a)^2$.',
        correction: [`$P(${b}) = ${v0} + ${par(v1)} \\times ${par(h)} + \\frac{${v2}}{2} \\times ${par(h)}^2 = ${value}$`],
      };
    },
    // Coefficient de (X − a)^k via P^{(k)}(a)/k!.
    (rng) => {
      const n = rng.int(3, 6);
      const a = rng.nonZero(-2, 2);
      const k = rng.int(1, n - 1);
      // P = X^n : P^{(k)}(a)/k! = C(n, k) a^{n−k}.
      const v = (fact(n) / (fact(k) * fact(n - k))) * a ** (n - k);
      return {
        prompt: `On écrit $X^{${n}} = \\sum_k c_k (X ${a < 0 ? '+' : '-'} ${Math.abs(a)})^k$. Que vaut $c_{${k}}$ ?`,
        answer: num(v),
        hint: '$c_k = \\frac{P^{(k)}(a)}{k!}$, ou écris $X = (X - a) + a$ et développe.',
        correction: [`$c_{${k}} = \\binom{${n}}{${k}} ${par(a)}^{${n - k}} = ${v}$`],
      };
    },
  ],
  'l1-degre-coefficient': [
    // P(X + 1) − P(X).
    (rng) => {
      const n = rng.int(2, 7);
      const a = rng.nonZero(-4, 4);
      const askLead = rng.next() < 0.5;
      return {
        prompt: `$P$ est de degré $${n}$, de coefficient dominant $${a}$. Quel est ${askLead ? 'le coefficient dominant' : 'le degré'} de $P(X + 1) - P(X)$ ?`,
        answer: num(askLead ? n * a : n - 1),
        hint: '$(X + 1)^n - X^n = nX^{n-1} + \\dots$ : le terme de degré $n$ disparaît.',
        correction: [`$P(X + 1) - P(X) = ${n * a}X^{${n - 1}} + \\dots$ : degré $${n - 1}$, coefficient dominant $${n * a}$.`],
      };
    },
    // Composée P ∘ Q.
    (rng) => {
      const p = rng.int(2, 4);
      const q = rng.int(2, 4);
      const a = rng.nonZero(-3, 3);
      const b = rng.nonZero(-2, 2);
      const askLead = rng.next() < 0.5;
      return {
        prompt: `$P = ${a === 1 ? '' : a === -1 ? '-' : a}X^{${p}} + X$ et $Q = ${b === 1 ? '' : b === -1 ? '-' : b}X^{${q}} - 1$. Quel est ${askLead ? 'le coefficient dominant' : 'le degré'} de $P \\circ Q$ ?`,
        answer: num(askLead ? a * b ** p : p * q),
        hint: '$\\deg(P \\circ Q) = \\deg P \\times \\deg Q$, et le coefficient dominant vaut $a b^{\\deg P}$.',
        correction: [`$P(Q) = ${a}(${b}X^{${q}} + \\dots)^{${p}} + \\dots = ${a * b ** p}X^{${p * q}} + \\dots$`],
      };
    },
    (rng) => vraiFauxBanque(rng, COURS),
  ],
};

export const BANQUES_POLYNOMES = { COURS };
