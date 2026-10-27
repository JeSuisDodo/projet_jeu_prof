import { type Fait, type Variantes, qcmBanque, vraiFauxBanque } from '../../licenceVariantes';
import { F, num, numF, par, signed, sub, tex } from '../util';

/**
 * Variantes des chapitres d'analyse de L3 : topologie, mesure et intégration, Hilbert et Fourier,
 * analyse complexe (feuilles bibmath « Espaces vectoriels normés », « Intégrale de Lebesgue »,
 * « Séries de Fourier », « Fonctions holomorphes »).
 */

const TOPOLOGIE: Fait[] = [
  { s: 'Une réunion quelconque d’ouverts est un ouvert.', v: true, why: 'C’est un axiome de la topologie.' },
  { s: 'Une intersection quelconque d’ouverts est un ouvert.', v: false, why: '$\\bigcap_n \\left]-\\frac{1}{n}, \\frac{1}{n}\\right[ = \\{0\\}$ n’est pas ouvert.' },
  { s: 'Une partie qui n’est pas ouverte est fermée.', v: false, why: '$[0, 1[$ n’est ni ouverte ni fermée dans $\\mathbb{R}$.' },
  { s: '$\\mathbb{R}$ est à la fois ouvert et fermé dans $\\mathbb{R}$.', v: true, why: 'Son complémentaire $\\varnothing$ est ouvert.' },
  { s: 'Dans $\\mathbb{R}^n$, les compacts sont les fermés bornés.', v: true, why: 'C’est le théorème de Borel-Lebesgue (ou de Bolzano-Weierstrass).' },
  { s: 'Dans tout espace vectoriel normé, les fermés bornés sont compacts.', v: false, why: 'En dimension infinie, la boule unité fermée n’est jamais compacte (théorème de Riesz).' },
  { s: 'En dimension finie, toutes les normes sont équivalentes.', v: true, why: 'On compare chaque norme à $\\|\\cdot\\|_\\infty$ par compacité de la sphère.' },
  { s: 'Une fonction continue sur un compact y est uniformément continue.', v: true, why: 'C’est le théorème de Heine.' },
  { s: 'Une fonction lipschitzienne est uniformément continue.', v: true, why: '$|f(x) - f(y)| \\leq k|x - y|$ : on prend $\\eta = \\frac{\\varepsilon}{k}$.' },
  { s: '$x \\mapsto \\sqrt{x}$ est lipschitzienne sur $[0, 1]$.', v: false, why: '$\\frac{\\sqrt x - \\sqrt 0}{x - 0} = \\frac{1}{\\sqrt x}$ n’est pas borné près de $0$.' },
  { s: 'L’image d’un compact par une application continue est compacte.', v: true, why: 'On recouvre l’image et on remonte les ouverts par l’application.' },
  { s: '$\\mathbb{Q}$ est fermé dans $\\mathbb{R}$.', v: false, why: '$\\mathbb{Q}$ est dense : son adhérence est $\\mathbb{R} \\neq \\mathbb{Q}$.' },
];

const MESURE: Fait[] = [
  { s: 'Toute partie dénombrable de $\\mathbb{R}$ est de mesure de Lebesgue nulle.', v: true, why: 'Par $\\sigma$-additivité, chaque singleton étant de mesure nulle.' },
  { s: 'Une partie de mesure de Lebesgue nulle est dénombrable.', v: false, why: 'L’ensemble triadique de Cantor est de mesure nulle et non dénombrable.' },
  { s: 'L’indicatrice de $\\mathbb{Q} \\cap [0, 1]$ est intégrable au sens de Riemann.', v: false, why: 'Toute somme de Darboux supérieure vaut $1$, toute inférieure $0$.' },
  { s: 'L’indicatrice de $\\mathbb{Q} \\cap [0, 1]$ est intégrable au sens de Lebesgue, d’intégrale nulle.', v: true, why: '$\\mathbb{Q} \\cap [0, 1]$ est dénombrable, donc de mesure nulle.' },
  { s: 'Si $f_n \\to f$ presque partout et $|f_n| \\leq g$ intégrable, alors $\\int f_n \\to \\int f$.', v: true, why: 'C’est le théorème de convergence dominée.' },
  { s: 'Si $f_n \\to f$ simplement, alors $\\int f_n \\to \\int f$.', v: false, why: '$f_n = n\\mathbf{1}_{]0, \\frac{1}{n}[}$ tend vers $0$, mais $\\int f_n = 1$.' },
  { s: 'Pour $f_n \\geq 0$ croissante, $\\int \\lim f_n = \\lim \\int f_n$.', v: true, why: 'C’est le théorème de convergence monotone (Beppo Levi).' },
  { s: 'Le lemme de Fatou donne $\\int \\liminf f_n \\leq \\liminf \\int f_n$ pour $f_n \\geq 0$.', v: true, why: 'On applique la convergence monotone à $\\inf_{k \\geq n} f_k$.' },
  { s: '$x \\mapsto \\frac{\\sin x}{x}$ est intégrable au sens de Lebesgue sur $[1, +\\infty[$.', v: false, why: '$\\int |\\frac{\\sin x}{x}|$ diverge ; seule l’intégrale impropre converge.' },
  { s: 'Une tribu est stable par réunion dénombrable.', v: true, why: 'C’est dans la définition d’une tribu.' },
  { s: 'Fubini s’applique toujours à une fonction mesurable sur $[0, 1]^2$, même de signe quelconque.', v: false, why: 'Il faut l’intégrabilité (ou la positivité, avec Tonelli).' },
];

const FOURIER: Fait[] = [
  { s: 'Si $f$ est $2\\pi$-périodique et paire, ses coefficients $b_n$ sont nuls.', v: true, why: '$t \\mapsto f(t)\\sin(nt)$ est impaire.' },
  { s: 'Si $f$ est $2\\pi$-périodique et impaire, ses coefficients $a_n$ sont nuls.', v: true, why: '$t \\mapsto f(t)\\cos(nt)$ est impaire.' },
  { s: 'Les coefficients de Fourier d’une fonction continue par morceaux tendent vers $0$.', v: true, why: 'C’est le lemme de Riemann-Lebesgue.' },
  { s: 'La série de Fourier d’une fonction continue converge toujours simplement vers elle.', v: false, why: 'Il existe des fonctions continues dont la série de Fourier diverge en un point.' },
  { s: 'Si $f$ est $\\mathcal{C}^1$ par morceaux et continue, sa série de Fourier converge normalement vers $f$.', v: true, why: 'Ses coefficients vérifient $\\sum (|a_n| + |b_n|) < +\\infty$.' },
  { s: 'Au point de discontinuité d’une fonction $\\mathcal{C}^1$ par morceaux, la série de Fourier converge vers la moyenne des limites à gauche et à droite.', v: true, why: 'C’est le théorème de Dirichlet.' },
  { s: '$(e^{inx})_{n \\in \\mathbb{Z}}$ est une famille orthonormée de $L^2$ pour $\\langle f, g\\rangle = \\frac{1}{2\\pi}\\int_0^{2\\pi} f\\bar g$.', v: true, why: '$\\frac{1}{2\\pi}\\int_0^{2\\pi} e^{i(n - m)x}\\,dx = \\delta_{nm}$.' },
  { s: 'La projection orthogonale sur un sous-espace fermé d’un espace de Hilbert est le point le plus proche.', v: true, why: 'C’est le théorème de projection.' },
  { s: 'Dans un espace de Hilbert, toute suite bornée a une sous-suite convergente en norme.', v: false, why: 'Une suite orthonormée $(e_n)$ vérifie $\\|e_n - e_m\\| = \\sqrt 2$.' },
  { s: '$\\sum_{n \\geq 1} \\frac{1}{n^2} = \\frac{\\pi^2}{6}$ se démontre avec Parseval appliqué à $x \\mapsto x$ sur $]-\\pi, \\pi[$.', v: true, why: 'Les coefficients $b_n = \\frac{2(-1)^{n+1}}{n}$ donnent $\\sum \\frac{4}{n^2} = \\frac{2\\pi^2}{3}$.' },
];

const COMPLEXE: Fait[] = [
  { s: '$z \\mapsto \\bar z$ est holomorphe sur $\\mathbb{C}$.', v: false, why: 'Avec $P = x$, $Q = -y$, Cauchy-Riemann demande $1 = -1$.' },
  { s: 'Une fonction holomorphe sur $\\mathbb{C}$ et bornée est constante.', v: true, why: 'C’est le théorème de Liouville.' },
  { s: 'Une fonction holomorphe est développable en série entière au voisinage de chaque point.', v: true, why: 'C’est une conséquence de la formule de Cauchy.' },
  { s: 'Les zéros d’une fonction holomorphe non nulle sur un ouvert connexe sont isolés.', v: true, why: 'C’est le principe des zéros isolés.' },
  { s: 'Le module d’une fonction holomorphe non constante peut atteindre son maximum à l’intérieur du domaine.', v: false, why: 'Principe du maximum : le maximum est atteint au bord.' },
  { s: '$z \\mapsto |z|^2$ est holomorphe sur $\\mathbb{C}$.', v: false, why: 'Elle ne vérifie Cauchy-Riemann qu’en $0$.' },
  { s: '$\\oint_{|z| = 1} \\frac{dz}{z} = 2i\\pi$.', v: true, why: 'Avec $z = e^{it}$ : $\\int_0^{2\\pi} i\\,dt = 2i\\pi$.' },
  { s: '$\\oint_{|z| = 1} \\frac{dz}{z^2} = 2i\\pi$.', v: false, why: '$\\frac{1}{z^2}$ a une primitive $-\\frac{1}{z}$ sur $\\mathbb{C}^*$ : l’intégrale est nulle.' },
  { s: 'Une fonction entière qui ne prend jamais la valeur $0$ s’écrit $e^g$ avec $g$ entière.', v: true, why: '$\\mathbb{C}$ est simplement connexe, donc $\\frac{f\'}{f}$ a une primitive.' },
  { s: '$e^z$ est surjective de $\\mathbb{C}$ sur $\\mathbb{C}$.', v: false, why: 'Elle ne prend jamais la valeur $0$.' },
];

const TRIPLES = [
  [3, 4, 5],
  [6, 8, 10],
  [5, 12, 13],
  [8, 6, 10],
];

/** z − a (ou z + |a|, ou z). */
const zMoins = (a: number) => (a === 0 ? 'z' : a > 0 ? `z - ${a}` : `z + ${-a}`);

export const ANALYSE_L3_VARIANTES: Variantes = {
  'l3-normes': [
    // Question inverse : normaliser un vecteur.
    (rng) => {
      const u = [rng.nonZero(-4, 4), rng.int(-4, 4), rng.int(-4, 4)];
      const un = rng.next() < 0.5;
      const n = un ? u.reduce((s, x) => s + Math.abs(x), 0) : Math.max(...u.map(Math.abs));
      const vec = `(${u.map((x) => (x === 0 ? '0' : signed(x, 't', true))).join(',\\ ')})`;
      return {
        prompt: `Pour quelle valeur de $t > 0$ le vecteur $${vec}$ est-il de norme $1$ pour $\\|\\cdot\\|_${un ? '1' : '\\infty'}$ ?`,
        answer: numF(F(1, n)),
        hint: `$\\|t\\,u\\| = t\\,\\|u\\|$ pour $t > 0$ : calcule $\\|u\\|_${un ? '1' : '\\infty'}$.`,
        correction: [`$\\|u\\|_${un ? '1' : '\\infty'} = ${n}$`, `$t = \\frac{1}{${n}}$`],
      };
    },
    (rng) => vraiFauxBanque(rng, TOPOLOGIE),
  ],
  'l3-distance-ensemble': [
    // Distance à un cercle, ou distance à ℤ.
    (rng) => {
      if (rng.next() < 0.5) {
        const [a, b, c] = rng.pick(TRIPLES);
        let R = rng.int(1, 15);
        if (R === c) R++;
        return {
          prompt: `Dans $\\mathbb{R}^2$ euclidien, calcule la distance du point $(${a * rng.sign()}, ${b})$ au cercle de centre $O$ et de rayon $${R}$.`,
          answer: num(Math.abs(c - R)),
          hint: 'Le point du cercle le plus proche est sur la demi-droite issue de $O$ passant par le point.',
          correction: [`Le point est à distance $${c}$ de $O$.`, `$d = |${c} - ${R}| = ${Math.abs(c - R)}$`],
        };
      }
      const q = rng.int(3, 9);
      const p = rng.int(-30, 30);
      const r = ((p % q) + q) % q;
      const d = F(Math.min(r, q - r), q);
      return {
        prompt: `Calcule la distance de $${tex(F(p, q))}$ à $\\mathbb{Z}$ dans $\\mathbb{R}$.`,
        answer: numF(d),
        hint: 'C’est l’écart à l’entier le plus proche.',
        correction: [`L’entier le plus proche est à distance $${tex(d)}$.`],
      };
    },
    (rng) => qcmBanque(rng, TOPOLOGIE),
  ],
  'l3-ouvert-ferme': [(rng) => vraiFauxBanque(rng, TOPOLOGIE), (rng) => qcmBanque(rng, TOPOLOGIE, true)],
  'l3-compact': [(rng) => qcmBanque(rng, TOPOLOGIE), (rng) => vraiFauxBanque(rng, TOPOLOGIE)],
  'l3-equivalence-normes': [
    // Rapport de deux normes sur un vecteur précis.
    (rng) => {
      const v: number[] = Array.from({ length: rng.int(2, 4) }, () => rng.int(-5, 5));
      if (!v.some((x) => x !== 0)) v[0] = 1;
      const n1 = v.reduce((s, x) => s + Math.abs(x), 0);
      const ninf = Math.max(...v.map(Math.abs));
      return {
        prompt: `Pour $x = (${v.join(',\\ ')})$, calcule le rapport $\\dfrac{\\|x\\|_1}{\\|x\\|_\\infty}$.`,
        answer: numF(F(n1, ninf)),
        hint: 'Ce rapport est toujours entre $1$ et la dimension $n$.',
        correction: [`$\\|x\\|_1 = ${n1}$, $\\|x\\|_\\infty = ${ninf}$`, `Rapport : $${tex(F(n1, ninf))}$`],
      };
    },
    (rng) => vraiFauxBanque(rng, TOPOLOGIE),
  ],
  'l3-lipschitz': [
    // c x³ sur [−a, a] : constante 3|c|a².
    (rng) => {
      const c = rng.nonZero(-3, 3);
      const a = rng.int(1, 4);
      return {
        prompt: `Quelle est la meilleure constante de Lipschitz de $f(x) = ${c === 1 ? '' : c === -1 ? '-' : c}x^3$ sur $[-${a}\\,;\\,${a}]$ ?`,
        answer: num(3 * Math.abs(c) * a * a),
        hint: 'Pour $f$ dérivable sur un intervalle, la meilleure constante est $\\sup |f\'|$.',
        correction: [`$|f'(x)| = ${3 * Math.abs(c)}x^2 \\leq ${3 * Math.abs(c)} \\times ${a * a}$`, `$k = ${3 * Math.abs(c) * a * a}$`],
      };
    },
    (rng) => qcmBanque(rng, TOPOLOGIE),
  ],
  'l3-mesure-lebesgue': [
    // Points de [0, N] dont la partie fractionnaire est petite.
    (rng) => {
      const N = rng.int(1, 9);
      const t = rng.pick([F(1, 2), F(1, 3), F(1, 4), F(2, 5), F(3, 4), F(1, 10)]);
      const v = F(N * t.n, t.d);
      return {
        prompt: `Calcule $\\lambda\\left(\\{x \\in [0\\,;\\,${N}] : x - \\lfloor x\\rfloor < ${tex(t)}\\}\\right)$.`,
        answer: numF(v),
        hint: 'Sur chaque intervalle $[k, k + 1[$, l’ensemble est $[k, k + t[$.',
        correction: [`$${N}$ intervalles de longueur $${tex(t)}$ : $${tex(v)}$`],
      };
    },
    (rng) => vraiFauxBanque(rng, MESURE),
  ],
  'l3-fonction-etagee': [
    // La partie entière est étagée sur [0, N].
    (rng) => {
      const N = rng.int(2, 12);
      const c = rng.nonZero(-3, 3);
      const v = (c * N * (N - 1)) / 2;
      return {
        prompt: `Calcule $\\displaystyle\\int_{[0\\,;\\,${N}]} ${c === 1 ? '' : c === -1 ? '-' : c}\\lfloor x\\rfloor\\,d\\lambda(x)$.`,
        answer: num(v),
        hint: 'Sur $[k, k + 1[$, $\\lfloor x\\rfloor = k$ : c’est une fonction étagée.',
        correction: [`$\\displaystyle\\int = ${c === 1 ? '' : `${c}\\times`}(0 + 1 + \\dots + ${N - 1}) = ${v}$`],
      };
    },
    (rng) => qcmBanque(rng, MESURE),
  ],
  'l3-convergence-dominee': [
    // lim ∫₀^a b x^k · nx/(1 + nx) dx = b a^{k+1}/(k + 1).
    (rng) => {
      const a = rng.int(1, 3);
      const b = rng.int(1, 5);
      const k = rng.int(0, 3);
      const v = F(b * a ** (k + 1), k + 1);
      const xk = k === 0 ? '' : k === 1 ? 'x' : `x^{${k}}`;
      return {
        prompt: `Calcule $\\displaystyle\\lim_{n \\to +\\infty} \\int_0^{${a}} ${b === 1 && k > 0 ? '' : b}${xk}\\,\\frac{nx}{1 + nx}\\,dx$.`,
        answer: numF(v),
        hint: 'Pour $x > 0$, $\\frac{nx}{1 + nx} \\to 1$, et l’intégrande est dominé par la fonction sans ce facteur.',
        correction: [`Convergence dominée : la limite est $\\displaystyle\\int_0^{${a}} ${b === 1 && k > 0 ? '' : b}${xk}\\,dx = ${tex(v)}$`],
      };
    },
    (rng) => vraiFauxBanque(rng, MESURE),
  ],
  'l3-fubini': [
    // ∬_{0 ≤ y ≤ x ≤ a} x^k = a^{k+2}/(k + 2).
    (rng) => {
      const a = rng.int(1, 3);
      const k = rng.int(1, 3);
      const v = F(a ** (k + 2), k + 2);
      return {
        prompt: `Calcule $\\displaystyle\\iint_{\\{0 \\leq y \\leq x \\leq ${a}\\}} ${k === 1 ? 'x' : `x^{${k}}`}\\,dx\\,dy$.`,
        answer: numF(v),
        hint: 'Intègre d’abord en $y$ (de $0$ à $x$), puis en $x$.',
        correction: [`$\\displaystyle\\int_0^{${a}} x^{${k}} \\times x\\,dx = \\frac{${a}^{${k + 2}}}{${k + 2}} = ${tex(v)}$`],
      };
    },
    (rng) => qcmBanque(rng, MESURE, true),
  ],
  'l3-integrabilite-riemann': [(rng) => vraiFauxBanque(rng, MESURE), (rng) => qcmBanque(rng, MESURE)],
  'l3-tribu-engendree': [
    // k parties disjointes qui ne recouvrent pas Ω : k + 1 atomes.
    (rng) => {
      const k = rng.int(2, 6);
      return {
        prompt: `$A_1, \\dots, A_{${k}}$ sont des parties non vides et deux à deux disjointes de $\\Omega$, dont la réunion n’est pas $\\Omega$. Combien d’éléments a la tribu qu’elles engendrent ?`,
        answer: num(2 ** (k + 1)),
        hint: 'Les atomes sont les $A_i$ et le complémentaire de leur réunion. La tribu est formée des réunions d’atomes.',
        correction: [`$${k + 1}$ atomes, donc $2^{${k + 1}} = ${2 ** (k + 1)}$ éléments.`],
      };
    },
    (rng) => vraiFauxBanque(rng, MESURE),
  ],
  'l3-coefficients-fourier': [
    // Linéarisation : a cos²(kx) ou a sin²(kx).
    (rng) => {
      const a = rng.nonZero(-6, 6);
      const k = rng.int(1, 4);
      const cos = rng.next() < 0.5;
      const askConst = rng.next() < 0.5;
      const v = F(askConst ? a : cos ? a : -a, 2);
      const fn = `${a === 1 ? '' : a === -1 ? '-' : a}\\${cos ? 'cos' : 'sin'}^2(${k === 1 ? '' : k}x)`;
      return {
        prompt: `$f(x) = ${fn}$ s’écrit $c + d\\cos(${2 * k}x)$. Donne $${askConst ? 'c' : 'd'}$.`,
        answer: numF(v),
        hint: cos ? '$\\cos^2 u = \\frac{1 + \\cos(2u)}{2}$' : '$\\sin^2 u = \\frac{1 - \\cos(2u)}{2}$',
        correction: [`$f(x) = ${tex(F(a, 2))} ${(cos ? a : -a) < 0 ? '-' : '+'} ${tex(F(Math.abs(a), 2))}\\cos(${2 * k}x)$`, `$${askConst ? 'c' : 'd'} = ${tex(v)}$`],
      };
    },
    (rng) => vraiFauxBanque(rng, FOURIER),
  ],
  'l3-parseval': [
    // Polynôme trigonométrique : moyenne de |f|².
    (rng) => {
      const a = rng.int(-4, 4);
      const b = rng.nonZero(-4, 4);
      const c = rng.nonZero(-4, 4);
      const [m, n] = [rng.int(1, 3), rng.int(1, 3)];
      const v = F(2 * a * a + b * b + c * c, 2);
      return {
        prompt: `Calcule $\\displaystyle\\frac{1}{2\\pi}\\int_0^{2\\pi} |f(x)|^2\\,dx$ pour $f(x) = ${a === 0 ? '' : a}${signed(b, `\\cos(${m === 1 ? '' : m}x)`, a === 0)}${signed(c, `\\sin(${n === 1 ? '' : n}x)`)}$.`,
        answer: numF(v),
        hint: 'Parseval : $\\frac{1}{2\\pi}\\int_0^{2\\pi} |f|^2 = a_0^2 + \\frac{1}{2}\\sum (a_n^2 + b_n^2)$.',
        correction: [`$${par(a)}^2 + \\frac{${b * b} + ${c * c}}{2} = ${tex(v)}$`],
      };
    },
    (rng) => qcmBanque(rng, FOURIER),
  ],
  'l3-produit-scalaire-l2': [
    // Orthogonalité des cosinus.
    (rng) => {
      const m = rng.int(0, 4);
      const n = rng.next() < 0.5 ? m : rng.int(0, 4);
      const v = m !== n ? 0 : m === 0 ? 2 : 1;
      return {
        prompt: `Calcule $\\displaystyle\\frac{1}{\\pi}\\int_0^{2\\pi} \\cos(${m}x)\\cos(${n}x)\\,dx$.`,
        answer: num(v),
        hint: '$\\cos a\\cos b = \\frac{1}{2}\\big(\\cos(a + b) + \\cos(a - b)\\big)$ ; l’intégrale de $\\cos(px)$ sur une période est nulle si $p \\neq 0$.',
        correction: [m !== n ? 'Les deux fréquences diffèrent : intégrale nulle.' : m === 0 ? '$\\frac{1}{\\pi} \\times 2\\pi = 2$' : `$\\frac{1}{\\pi}\\int_0^{2\\pi} \\cos^2(${m}x)\\,dx = \\frac{1}{\\pi} \\times \\pi = 1$`],
      };
    },
    (rng) => vraiFauxBanque(rng, FOURIER),
  ],
  'l3-projection-orthogonale': [
    // Distance de x^k aux constantes dans L²([0, 1]).
    (rng) => {
      const k = rng.int(1, 4);
      const v = sub(F(1, 2 * k + 1), F(1, (k + 1) ** 2));
      return {
        prompt: `Dans $L^2([0\\,;\\,1])$, calcule le carré de la distance de $f(x) = ${k === 1 ? 'x' : `x^{${k}}`}$ au sous-espace des fonctions constantes.`,
        answer: numF(v),
        hint: 'Le projeté est la moyenne $c = \\int_0^1 f$ ; Pythagore donne $d^2 = \\|f\\|^2 - c^2$.',
        correction: [`$c = \\frac{1}{${k + 1}}$, $\\|f\\|^2 = \\frac{1}{${2 * k + 1}}$`, `$d^2 = \\frac{1}{${2 * k + 1}} - \\frac{1}{${(k + 1) ** 2}} = ${tex(v)}$`],
      };
    },
    (rng) => qcmBanque(rng, FOURIER, true),
  ],
  'l3-sommes-fourier': [(rng) => vraiFauxBanque(rng, FOURIER), (rng) => qcmBanque(rng, FOURIER)],
  'l3-residu-pole-simple': [
    // Résidu de P(z)/(z − a).
    (rng) => {
      const a = rng.nonZero(-3, 3);
      const p = rng.int(1, 3);
      const c = rng.int(-5, 5);
      const v = a ** (p + 1) + c;
      return {
        prompt: `Calcule le résidu de $f(z) = \\dfrac{z^{${p + 1}}${c === 0 ? '' : c > 0 ? ` + ${c}` : ` - ${-c}`}}{${zMoins(a)}}$ en $z = ${a}$.`,
        answer: num(v),
        hint: 'Pour un pôle simple de $\\frac{g(z)}{z - a}$ avec $g$ holomorphe, le résidu est $g(a)$.',
        correction: [`$\\mathrm{Res}(f, ${a}) = ${par(a)}^{${p + 1}}${c === 0 ? '' : c > 0 ? ` + ${c}` : ` - ${-c}`} = ${v}$`],
      };
    },
    (rng) => vraiFauxBanque(rng, COMPLEXE),
  ],
  'l3-theoreme-residus': [
    // Formule de Cauchy : ∮ P(z)/(z − a) dz = 2iπ P(a) si a est à l'intérieur.
    (rng) => {
      const a = rng.nonZero(-4, 4);
      const R = rng.int(1, 5);
      const c = rng.int(-3, 3);
      const inside = Math.abs(a) < R;
      const v = inside ? a * a + c : 0;
      const P = `z^2${c === 0 ? '' : c > 0 ? ` + ${c}` : ` - ${-c}`}`;
      return {
        prompt: `On note $I = \\displaystyle\\oint_{|z| = ${R}} \\frac{${P}}{${zMoins(a)}}\\,dz$ (sens direct). On a $I = 2i\\pi\\,k$ : donne $k$.`,
        answer: num(v),
        hint: 'Le seul pôle est en $a$ : regarde s’il est à l’intérieur du cercle.',
        correction: inside ? [`$|${a}| < ${R}$ : $k = \\mathrm{Res} = ${par(a)}^2${c === 0 ? '' : c > 0 ? ` + ${c}` : ` - ${-c}`} = ${v}$`] : [`$|${a}| \\geq ${R}$ : la fonction est holomorphe sur le disque, $k = 0$.`],
      };
    },
    (rng) => qcmBanque(rng, COMPLEXE),
  ],
  'l3-rayon-convergence': [
    // Σ zⁿ/(n² aⁿ) : R = a.
    (rng) => {
      const a = rng.int(2, 9);
      const p = rng.int(0, 3);
      return {
        prompt: `Rayon de convergence de $\\displaystyle\\sum_{n \\geq 1} \\frac{z^n}{${p === 0 ? '' : p === 1 ? 'n\\,' : `n^{${p}}\\,`}${a}^n}$ ?`,
        answer: num(a),
        hint: 'Le facteur polynomial en $n$ ne change pas le rayon ; applique d’Alembert.',
        correction: [`$\\left|\\frac{u_{n+1}}{u_n}\\right| \\to \\frac{|z|}{${a}}$`, `$R = ${a}$`],
      };
    },
    (rng) => vraiFauxBanque(rng, COMPLEXE),
  ],
  'l3-holomorphie': [(rng) => vraiFauxBanque(rng, COMPLEXE), (rng) => qcmBanque(rng, COMPLEXE, true)],
  'l3-ordre-zero': [
    // zᵖ(e^z − 1)^m : ordre p + m ; e^{zᵏ} − 1 − zᵏ : ordre 2k.
    (rng) => {
      if (rng.next() < 0.5) {
        const k = rng.int(1, 4);
        const zk = k === 1 ? 'z' : `z^{${k}}`;
        return {
          prompt: `Quel est l’ordre du zéro en $0$ de $f(z) = e^{${zk}} - 1 - ${zk}$ ?`,
          answer: num(2 * k),
          hint: '$e^u - 1 - u = \\frac{u^2}{2} + \\dots$',
          correction: [`$f(z) = \\frac{z^{${2 * k}}}{2} + \\dots$ : ordre $${2 * k}$.`],
        };
      }
      const p = rng.int(0, 3);
      const m = rng.int(1, 3);
      return {
        prompt: `Quel est l’ordre du zéro en $0$ de $f(z) = ${p === 0 ? '' : p === 1 ? 'z' : `z^{${p}}`}(e^z - 1)${m === 1 ? '' : `^{${m}}`}$ ?`,
        answer: num(p + m),
        hint: '$e^z - 1 = z + \\dots$ a un zéro simple en $0$ ; les ordres s’ajoutent dans un produit.',
        correction: [`$f(z) = z^{${p + m}}(1 + \\dots)$ : ordre $${p + m}$.`],
      };
    },
    (rng) => qcmBanque(rng, COMPLEXE),
  ],
  'l3-residu-pole-multiple': [
    // Res(1/(zᵏ(1 − az)), 0) = a^{k−1}.
    (rng) => {
      const k = rng.int(2, 4);
      const a = rng.nonZero(-3, 3);
      const v = a ** (k - 1);
      const den = a === 1 ? '1 - z' : a === -1 ? '1 + z' : a > 0 ? `1 - ${a}z` : `1 + ${-a}z`;
      return {
        prompt: `Calcule le résidu en $0$ de $f(z) = \\dfrac{1}{z^{${k}}(${den})}$.`,
        answer: num(v),
        hint: 'Développe $\\frac{1}{1 - az} = \\sum a^nz^n$ et cherche le coefficient de $\\frac{1}{z}$.',
        correction: [`Le coefficient de $z^{${k - 1}}$ dans $\\sum a^nz^n$ est $${par(a)}^{${k - 1}} = ${v}$.`],
      };
    },
    (rng) => vraiFauxBanque(rng, COMPLEXE),
  ],
};

export const BANQUES_ANALYSE_L3 = { TOPOLOGIE, MESURE, FOURIER, COMPLEXE };
