import { type Fait, type Variantes, qcmBanque, vraiFauxBanque } from '../../licenceVariantes';
import { divisors, gcd, lcm, mod, modInverse, num, phi } from '../util';

/**
 * Variantes des chapitres « Groupes » et « Anneaux et corps » de L3
 * (feuilles bibmath « Groupes », « Groupe symétrique », « Arithmétique modulaire », « Corps finis »).
 */

const GROUPES: Fait[] = [
  { s: 'Tout groupe d’ordre premier est cyclique.', v: true, why: 'Par Lagrange, tout élément différent du neutre engendre le groupe.' },
  { s: 'Tout groupe cyclique est abélien.', v: true, why: '$g^ag^b = g^{a+b} = g^bg^a$.' },
  { s: 'Tout groupe abélien est cyclique.', v: false, why: '$\\mathbb{Z}/2\\mathbb{Z} \\times \\mathbb{Z}/2\\mathbb{Z}$ est abélien sans élément d’ordre $4$.' },
  { s: 'L’ordre d’un élément divise l’ordre d’un groupe fini.', v: true, why: 'C’est l’ordre du sous-groupe qu’il engendre ; on applique Lagrange.' },
  { s: 'Si $d$ divise l’ordre de $G$, alors $G$ a un sous-groupe d’ordre $d$.', v: false, why: 'Le groupe alterné $\\mathfrak{A}_4$, d’ordre $12$, n’a pas de sous-groupe d’ordre $6$.' },
  { s: '$\\mathfrak{S}_3$ est abélien.', v: false, why: '$(1\\,2)(1\\,3) = (1\\,3\\,2)$ mais $(1\\,3)(1\\,2) = (1\\,2\\,3)$.' },
  { s: 'Toute permutation est un produit de transpositions.', v: true, why: 'Les transpositions engendrent $\\mathfrak{S}_n$.' },
  { s: 'La signature est un morphisme de $\\mathfrak{S}_n$ dans $\\{-1, 1\\}$.', v: true, why: '$\\varepsilon(\\sigma\\tau) = \\varepsilon(\\sigma)\\varepsilon(\\tau)$.' },
  { s: 'Un cycle de longueur $k$ a pour signature $(-1)^k$.', v: false, why: 'Il s’écrit avec $k - 1$ transpositions : sa signature est $(-1)^{k-1}$.' },
  { s: '$\\mathbb{Z}/m\\mathbb{Z} \\times \\mathbb{Z}/n\\mathbb{Z}$ est cyclique si et seulement si $m$ et $n$ sont premiers entre eux.', v: true, why: 'C’est le lemme chinois ; sinon l’ordre maximal est $\\mathrm{ppcm}(m, n) < mn$.' },
  { s: 'Le noyau d’un morphisme de groupes est un sous-groupe distingué.', v: true, why: 'Si $f(h) = e$, alors $f(ghg^{-1}) = f(g)f(g)^{-1} = e$.' },
  { s: 'Un sous-groupe d’un groupe cyclique est cyclique.', v: true, why: 'Il est engendré par la plus petite puissance positive du générateur qu’il contient.' },
  { s: '$\\mathfrak{S}_n$ a $n^2$ éléments.', v: false, why: 'Il a $n!$ éléments.' },
];

const ANNEAUX: Fait[] = [
  { s: '$\\mathbb{Z}/n\\mathbb{Z}$ est un corps si et seulement si $n$ est premier.', v: true, why: 'Si $n = ab$ avec $1 < a, b < n$, $\\bar a\\bar b = 0$ ; si $n$ est premier, Bézout donne les inverses.' },
  { s: '$\\bar{a}$ est inversible dans $\\mathbb{Z}/n\\mathbb{Z}$ si et seulement si $a$ et $n$ sont premiers entre eux.', v: true, why: 'C’est le théorème de Bézout : $au + nv = 1$.' },
  { s: 'Dans $\\mathbb{Z}/n\\mathbb{Z}$, $\\bar a\\bar b = 0$ entraîne $\\bar a = 0$ ou $\\bar b = 0$.', v: false, why: 'Dans $\\mathbb{Z}/6\\mathbb{Z}$, $\\bar 2 \\times \\bar 3 = \\bar 0$.' },
  { s: 'Si $p$ est premier et $p \\nmid a$, alors $a^{p-1} \\equiv 1 \\pmod p$.', v: true, why: 'C’est le petit théorème de Fermat.' },
  { s: 'Si $a^{n-1} \\equiv 1 \\pmod n$ pour un $a$, alors $n$ est premier.', v: false, why: '$2^{340} \\equiv 1 \\pmod{341}$ alors que $341 = 11 \\times 31$.' },
  { s: 'Tout corps fini a pour cardinal une puissance d’un nombre premier.', v: true, why: 'C’est un espace vectoriel sur son sous-corps premier $\\mathbb{F}_p$.' },
  { s: 'Il existe un corps à $6$ éléments.', v: false, why: '$6$ n’est pas une puissance d’un nombre premier.' },
  { s: 'Le groupe multiplicatif d’un corps fini est cyclique.', v: true, why: 'Un sous-groupe fini de $K^*$ est cyclique.' },
  { s: 'Tout idéal de $\\mathbb{Z}$ est de la forme $n\\mathbb{Z}$.', v: true, why: 'On prend pour $n$ le plus petit élément positif non nul (division euclidienne).' },
  { s: 'Un polynôme de degré $3$ sans racine dans un corps $K$ est irréductible sur $K$.', v: true, why: 'Une factorisation aurait un facteur de degré $1$, donc une racine.' },
  { s: 'Un polynôme de degré $4$ sans racine dans $K$ est irréductible sur $K$.', v: false, why: '$(X^2 + 1)^2$ n’a pas de racine réelle mais n’est pas irréductible sur $\\mathbb{R}$.' },
  { s: '$\\mathbb{F}_4 = \\mathbb{Z}/4\\mathbb{Z}$.', v: false, why: '$\\mathbb{Z}/4\\mathbb{Z}$ n’est pas un corps : $\\bar 2^2 = \\bar 0$.' },
];

/** Ordre maximal d'un élément de 𝔖ₙ (fonction de Landau), n = 1 … 10. */
const LANDAU = [1, 2, 3, 4, 6, 6, 12, 15, 20, 30];

const PREMIERS = [5, 7, 11, 13, 17, 19, 23];

export const ALGEBRE_L3_VARIANTES: Variantes = {
  'l3-ordre-zn': [
    // Nombre d'éléments d'un ordre donné.
    (rng, level) => {
      const n = rng.pick(level === 1 ? [6, 8, 10, 12] : [12, 18, 20, 24, 30, 36]);
      const d = rng.pick(divisors(n).filter((x) => x > 1));
      return {
        prompt: `Combien d’éléments d’ordre exactement $${d}$ le groupe $\\mathbb{Z}/${n}\\mathbb{Z}$ possède-t-il ?`,
        answer: num(phi(d)),
        hint: 'Dans un groupe cyclique d’ordre $n$, il y a un seul sous-groupe d’ordre $d$ (pour $d \\mid n$), cyclique : il contient $\\varphi(d)$ générateurs.',
        correction: [`$${d}$ divise $${n}$ : il y a $\\varphi(${d}) = ${phi(d)}$ éléments d’ordre $${d}$.`],
      };
    },
    (rng) => vraiFauxBanque(rng, GROUPES),
  ],
  'l3-ordre-permutation': [
    // Ordre maximal dans 𝔖ₙ, ou ordre à partir de la décomposition en cycles.
    (rng, level) => {
      if (level === 1 || rng.next() < 0.5) {
        const lengths = Array.from({ length: rng.int(2, 3) }, () => rng.int(2, 6));
        const o = lengths.reduce(lcm, 1);
        return {
          prompt: `Une permutation $\\sigma$ se décompose en cycles à supports disjoints de longueurs $${lengths.join(',\\ ')}$. Quel est son ordre ?`,
          answer: num(o),
          hint: 'L’ordre d’un produit de cycles disjoints est le PPCM de leurs longueurs.',
          correction: [`$\\mathrm{ppcm}(${lengths.join(', ')}) = ${o}$`],
        };
      }
      const n = rng.int(4, 10);
      return {
        prompt: `Quel est le plus grand ordre possible d’un élément de $\\mathfrak{S}_{${n}}$ ?`,
        answer: num(LANDAU[n - 1]),
        hint: 'Cherche des longueurs de cycles de somme au plus $n$ dont le PPCM est le plus grand possible.',
        correction: [`Le maximum est $${LANDAU[n - 1]}$ (fonction de Landau).`],
      };
    },
    (rng) => qcmBanque(rng, GROUPES),
  ],
  'l3-signature': [
    // Nombre d'inversions d'une permutation en ligne.
    (rng, level) => {
      const n = level === 1 ? 4 : 5;
      const s = rng.shuffle(Array.from({ length: n }, (_, i) => i + 1));
      let inv = 0;
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (s[i] > s[j]) inv++;
      return {
        prompt: `Combien d’inversions la permutation $\\sigma = \\begin{pmatrix}${Array.from({ length: n }, (_, i) => i + 1).join(' & ')} \\\\ ${s.join(' & ')}\\end{pmatrix}$ a-t-elle ?`,
        answer: num(inv),
        hint: 'Une inversion est un couple $i < j$ avec $\\sigma(i) > \\sigma(j)$. La signature vaut $(-1)^{\\text{nombre d’inversions}}$.',
        correction: [`On compte $${inv}$ inversions, donc $\\varepsilon(\\sigma) = ${inv % 2 === 0 ? 1 : -1}$.`],
      };
    },
    (rng) => vraiFauxBanque(rng, GROUPES),
  ],
  'l3-generateurs-cycliques': [
    // Générateurs de (ℤ/pℤ)*.
    (rng) => {
      const p = rng.pick(PREMIERS);
      return {
        prompt: `Le groupe multiplicatif $(\\mathbb{Z}/${p}\\mathbb{Z})^*$ est cyclique. Combien a-t-il de générateurs ?`,
        answer: num(phi(p - 1)),
        hint: `Il est cyclique d’ordre $${p - 1}$ : ses générateurs sont au nombre de $\\varphi(${p - 1})$.`,
        correction: [`$\\varphi(${p - 1}) = ${phi(p - 1)}$`],
      };
    },
    (rng) => qcmBanque(rng, GROUPES, true),
  ],
  'l3-lagrange': [
    // Indice d'un sous-groupe.
    (rng) => {
      const h = rng.int(2, 12);
      const k = rng.int(2, 10);
      return {
        prompt: `$G$ est un groupe d’ordre $${h * k}$ et $H$ un sous-groupe d’ordre $${h}$. Combien $H$ a-t-il de classes à gauche dans $G$ ?`,
        answer: num(k),
        hint: 'Les classes à gauche $gH$ partitionnent $G$ et ont toutes $|H|$ éléments.',
        correction: [`$[G : H] = \\frac{${h * k}}{${h}} = ${k}$`],
      };
    },
    (rng) => vraiFauxBanque(rng, GROUPES),
  ],
  'l3-groupe-produit': [
    // Ordre maximal d'un élément d'un produit.
    (rng) => {
      const m = rng.int(2, 12);
      const n = rng.int(2, 12);
      return {
        prompt: `Quel est le plus grand ordre d’un élément de $\\mathbb{Z}/${m}\\mathbb{Z} \\times \\mathbb{Z}/${n}\\mathbb{Z}$ ?`,
        answer: num(lcm(m, n)),
        hint: 'L’ordre de $(x, y)$ est le PPCM des ordres de $x$ et de $y$ ; prends des générateurs.',
        correction: [`$\\mathrm{ppcm}(${m}, ${n}) = ${lcm(m, n)}$, atteint en $(\\bar 1, \\bar 1)$.`],
      };
    },
    (rng) => qcmBanque(rng, GROUPES),
  ],
  'l3-inverse-modulaire': [
    // Équation ax ≡ b (mod n).
    (rng, level) => {
      const n = rng.pick(level === 1 ? [7, 9, 10, 11] : [13, 15, 17, 19, 21, 23, 26]);
      let a = rng.int(2, n - 1);
      while (gcd(a, n) !== 1) a = rng.int(2, n - 1);
      const b = rng.int(1, n - 1);
      const x = mod(modInverse(a, n) * b, n);
      return {
        prompt: `Résous $${a}x \\equiv ${b} \\pmod{${n}}$ : donne la solution $x$ comprise entre $0$ et $${n - 1}$.`,
        answer: num(x),
        hint: `Multiplie par l’inverse de $${a}$ modulo $${n}$.`,
        correction: [`L’inverse de $${a}$ modulo $${n}$ est $${modInverse(a, n)}$.`, `$x \\equiv ${modInverse(a, n)} \\times ${b} \\equiv ${x} \\pmod{${n}}$`],
      };
    },
    (rng) => vraiFauxBanque(rng, ANNEAUX),
  ],
  'l3-indicatrice-euler': [
    // Théorème d'Euler pour réduire une grande puissance.
    (rng) => {
      const n = rng.pick([7, 9, 10, 11, 12, 13, 14, 15]);
      let a = rng.int(2, n - 1);
      while (gcd(a, n) !== 1) a = rng.int(2, n - 1);
      const f = phi(n);
      const e = f * rng.int(10, 40) + rng.int(0, f - 1);
      let r = 1;
      for (let i = 0; i < e % f; i++) r = (r * a) % n;
      return {
        prompt: `Calcule le reste de la division de $${a}^{${e}}$ par $${n}$.`,
        answer: num(r),
        hint: `Théorème d’Euler : $${a}^{\\varphi(${n})} \\equiv 1 \\pmod{${n}}$.`,
        correction: [`$\\varphi(${n}) = ${f}$ et $${e} = ${f} \\times ${Math.floor(e / f)} + ${e % f}$`, `$${a}^{${e}} \\equiv ${a}^{${e % f}} \\equiv ${r} \\pmod{${n}}$`],
      };
    },
    (rng) => qcmBanque(rng, ANNEAUX),
  ],
  'l3-restes-chinois': [
    // Problème : le panier d'œufs.
    (rng) => {
      const [m1, m2, m3] = rng.pick([
        [2, 3, 5],
        [3, 4, 5],
        [3, 5, 7],
        [2, 5, 7],
        [4, 5, 7],
      ]);
      const N = rng.int(1, m1 * m2 * m3 - 1);
      return {
        prompt: `Une fermière range ses œufs par paquets de $${m1}$ : il en reste $${N % m1}$. Par paquets de $${m2}$, il en reste $${N % m2}$ ; par paquets de $${m3}$, il en reste $${N % m3}$. Elle a moins de $${m1 * m2 * m3}$ œufs (et au moins un). Combien en a-t-elle ?`,
        answer: num(N),
        hint: `Les modules sont premiers entre eux deux à deux : il y a une seule solution modulo $${m1 * m2 * m3}$.`,
        correction: [`$x \\equiv ${N % m1} \\pmod{${m1}}$, $x \\equiv ${N % m2} \\pmod{${m2}}$, $x \\equiv ${N % m3} \\pmod{${m3}}$`, `Restes chinois : $x = ${N}$.`],
      };
    },
    (rng) => vraiFauxBanque(rng, ANNEAUX),
  ],
  'l3-ideaux-z': [
    // Idéaux de ℤ/nℤ.
    (rng) => {
      const n = rng.int(6, 60);
      const d = divisors(n);
      return {
        prompt: `Combien l’anneau $\\mathbb{Z}/${n}\\mathbb{Z}$ a-t-il d’idéaux ?`,
        answer: num(d.length),
        hint: 'Les idéaux de $\\mathbb{Z}/n\\mathbb{Z}$ correspondent aux idéaux $d\\mathbb{Z}$ de $\\mathbb{Z}$ contenant $n\\mathbb{Z}$, c’est-à-dire aux diviseurs $d$ de $n$.',
        correction: [`Diviseurs de $${n}$ : $${d.join(', ')}$`, `$${d.length}$ idéaux.`],
      };
    },
    (rng) => qcmBanque(rng, ANNEAUX, true),
  ],
  'l3-racines-fp': [
    // Racines carrées modulo p.
    (rng) => {
      const p = rng.pick(PREMIERS);
      const a = rng.int(1, p - 1);
      const sols = Array.from({ length: p }, (_, x) => x).filter((x) => (x * x) % p === a);
      return {
        prompt: `Combien l’équation $x^2 = \\bar{${a}}$ a-t-elle de solutions dans $\\mathbb{F}_{${p}}$ ?`,
        answer: num(sols.length),
        hint: 'Dans un corps, un polynôme de degré $2$ a au plus $2$ racines ; si $x$ convient, $-x$ aussi. Liste les carrés.',
        correction: [sols.length ? `Solutions : $${sols.join('$ et $')}$.` : `$${a}$ n’est pas un carré modulo $${p}$ : aucune solution.`],
      };
    },
    (rng) => vraiFauxBanque(rng, ANNEAUX),
  ],
  'l3-corps-fini': [
    // Polynômes unitaires irréductibles de degré 2 sur 𝔽ₚ.
    (rng) => {
      const p = rng.pick([2, 3, 5, 7, 11]);
      return {
        prompt: `Combien y a-t-il de polynômes unitaires irréductibles de degré $2$ dans $\\mathbb{F}_{${p}}[X]$ ?`,
        answer: num((p * p - p) / 2),
        hint: 'Compte les unitaires de degré $2$ ($p^2$), puis retire ceux qui se factorisent : $(X - a)(X - b)$ avec $a \\leq b$.',
        correction: [`Réductibles : $\\frac{${p}(${p} + 1)}{2} = ${(p * (p + 1)) / 2}$`, `Irréductibles : $${p * p} - ${(p * (p + 1)) / 2} = ${(p * p - p) / 2}$`],
      };
    },
    (rng) => qcmBanque(rng, ANNEAUX),
  ],
};

export const BANQUES_ALGEBRE_L3 = { GROUPES, ANNEAUX };
