import { type Fait, type Variantes, qcmBanque, vraiFaux, vraiFauxBanque } from '../../licenceVariantes';
import { F, affine, binom, div, fact, fixedChoice, num, numF, pairOf, par, plus, setOf, setTex, tex } from '../util';

/** Variantes du chapitre « Applications » (feuille bibmath « Ensembles, applications, relations »). */

const KINDS = ['Injective, pas surjective', 'Surjective, pas injective', 'Bijective', 'Ni injective, ni surjective'];
const kindIndex = (inj: boolean, surj: boolean) => (inj && surj ? 2 : inj ? 0 : surj ? 1 : 3);

const COMPOSITION: Fait[] = [
  { s: 'Si $g \\circ f$ est injective, alors $f$ est injective.', v: true, why: 'Si $f(x) = f(y)$, alors $g(f(x)) = g(f(y))$, donc $x = y$.' },
  { s: 'Si $g \\circ f$ est injective, alors $g$ est injective.', v: false, why: 'Avec $f : \\{0\\} \\to \\{0, 1\\}$, $f(0) = 0$, et $g$ constante, $g \\circ f$ est injective mais pas $g$.' },
  { s: 'Si $g \\circ f$ est surjective, alors $g$ est surjective.', v: true, why: 'Tout $z$ s’écrit $g(f(x))$, donc $z$ a l’antécédent $f(x)$ par $g$.' },
  { s: 'Si $g \\circ f$ est surjective, alors $f$ est surjective.', v: false, why: 'Avec $f : \\{0\\} \\to \\{0, 1\\}$ et $g$ constante sur un singleton, $g \\circ f$ est surjective mais pas $f$.' },
  { s: 'La composée de deux injections est une injection.', v: true, why: '$g(f(x)) = g(f(y)) \\Rightarrow f(x) = f(y) \\Rightarrow x = y$.' },
  { s: 'La composée de deux bijections est une bijection, de réciproque $f^{-1} \\circ g^{-1}$.', v: true, why: '$(g \\circ f)^{-1} = f^{-1} \\circ g^{-1}$ : l’ordre s’inverse.' },
  { s: 'La réciproque de $g \\circ f$ est $g^{-1} \\circ f^{-1}$.', v: false, why: 'C’est $f^{-1} \\circ g^{-1}$ : on défait d’abord $g$, puis $f$.' },
  { s: 'Une fonction strictement monotone sur un intervalle est injective.', v: true, why: 'Si $x < y$, alors $f(x) < f(y)$ (ou $>$), donc $f(x) \\neq f(y)$.' },
  { s: 'Une fonction injective de $\\mathbb{R}$ dans $\\mathbb{R}$ est forcément monotone.', v: false, why: 'Sans continuité, non : $f(x) = x$ sur $\\mathbb{Q}$ et $-x$ ailleurs est injective sans être monotone.' },
  { s: 'Une injection d’un ensemble fini $E$ dans lui-même est une bijection.', v: true, why: 'Les $|E|$ images sont distinctes, donc elles remplissent $E$.' },
  { s: 'Une injection de $\\mathbb{N}$ dans $\\mathbb{N}$ est une bijection.', v: false, why: '$n \\mapsto n + 1$ est injective mais $0$ n’est pas atteint.' },
  { s: 'Si $f \\circ f = \\mathrm{id}_E$, alors $f$ est bijective.', v: true, why: '$f$ est sa propre réciproque.' },
];

export const APPLICATIONS_VARIANTES: Variantes = {
  'l1-injective-surjective': [
    // n ↦ an + b de ℤ dans ℤ.
    (rng, level) => {
      const a = level === 1 ? rng.pick([1, -1, 2, 3]) : rng.pick([1, -1, 2, -2, 3, 0]);
      const b = rng.int(-5, 5);
      const inj = a !== 0;
      const surj = Math.abs(a) === 1;
      const why = a === 0 ? '$f$ est constante.' : surj ? `$f$ a pour réciproque $m \\mapsto ${affine(a, -a * b, 'm')}$.` : `Deux entiers distincts ont des images distinctes, mais $f(n)$ est toujours congru à $${((b % Math.abs(a)) + Math.abs(a)) % Math.abs(a)}$ modulo $${Math.abs(a)}$ : par exemple $${b + 1}$ n’est pas atteint.`;
      return {
        prompt: `L’application $f : \\mathbb{Z} \\to \\mathbb{Z},\\ n \\mapsto ${a === 0 ? String(b) : affine(a, b, 'n')}$ est :`,
        answer: fixedChoice(KINDS, kindIndex(inj, surj)),
        hint: 'Résous $f(n) = m$ : la solution doit être un entier pour tout $m$.',
        correction: [why, `Elle est donc : ${KINDS[kindIndex(inj, surj)].toLowerCase()}.`],
      };
    },
    // Principe des tiroirs.
    (rng, level) => {
      const n = rng.int(3, 9);
      const p = n + rng.int(-3, 3);
      const ask = rng.pick(level === 1 ? (['injection'] as const) : (['injection', 'surjection', 'bijection'] as const));
      const exists = ask === 'injection' ? n <= p : ask === 'surjection' ? n >= p : n === p;
      return vraiFaux(
        `Il existe une ${ask} d’un ensemble à $${n}$ éléments dans un ensemble à $${p}$ éléments.`,
        exists,
        [
          ask === 'injection'
            ? `Une injection exige $${n} \\leq ${p}$ (principe des tiroirs).`
            : ask === 'surjection'
              ? `Une surjection exige $${n} \\geq ${p}$ : il faut au moins autant d’éléments au départ qu’à l’arrivée.`
              : 'Une bijection exige le même nombre d’éléments des deux côtés.',
        ],
        'Principe des tiroirs : on ne range pas $n$ chaussettes dans moins de $n$ tiroirs sans en mettre deux ensemble.',
      );
    },
    (rng) => vraiFauxBanque(rng, COMPOSITION),
    (rng) => qcmBanque(rng, COMPOSITION, rng.next() < 0.5),
  ],
  'l1-image-directe': [
    // Image d'un segment par x ↦ x² + c.
    (rng, level) => {
      const a = rng.int(-5, 2);
      const b = rng.int(a + 1, 5);
      const c = level === 1 ? 0 : rng.int(-4, 4);
      const sq = (x: number) => x * x + c;
      const lo = a <= 0 && b >= 0 ? c : Math.min(sq(a), sq(b));
      const hi = Math.max(sq(a), sq(b));
      return {
        prompt: `$f(x) = x^2${plus(c)}$. L’image directe $f([${a}\\,;${b}])$ est un segment $[m\\,;M]$ : donne $m$ et $M$.`,
        answer: pairOf(lo, hi, ['m', 'M']),
        hint: '$x^2$ décroît sur $\\mathbb{R}_-$ et croît sur $\\mathbb{R}_+$ : attention si $0$ est dans l’intervalle.',
        correction: [
          a <= 0 && b >= 0 ? `$0 \\in [${a}\\,;${b}]$ : le minimum est $f(0) = ${c}$.` : `$f$ est monotone sur $[${a}\\,;${b}]$ : le minimum est $${lo}$.`,
          `Le maximum est $\\max(f(${a}), f(${b})) = ${hi}$.`,
        ],
      };
    },
    // Image réciproque d'un ensemble fini par n ↦ n mod k.
    (rng) => {
      const k = rng.int(3, 5);
      const r = rng.int(0, k - 1);
      const N = rng.int(10, 20);
      const pre = Array.from({ length: N + 1 }, (_, i) => i).filter((i) => i % k === r);
      return {
        prompt: `$g : \\{0, \\dots, ${N}\\} \\to \\{0, \\dots, ${k - 1}\\}$ associe à $n$ son reste dans la division par $${k}$. Donne les éléments de $g^{-1}(\\{${r}\\})$.`,
        answer: setOf(pre),
        hint: `Ce sont les entiers de la forme $${k}q + ${r}$.`,
        correction: [`$g^{-1}(\\{${r}\\}) = ${setTex(pre)}$`],
      };
    },
    // Nombre d'éléments de l'image par la valeur absolue ou le carré.
    (rng) => {
      const a = rng.int(-7, -1);
      const b = rng.int(1, 7);
      const square = rng.next() < 0.5;
      const img = new Set(Array.from({ length: b - a + 1 }, (_, i) => Math.abs(a + i)));
      return {
        prompt: `Combien d’éléments a l’image de $\\{${a}, \\dots, ${b}\\}$ par $x \\mapsto ${square ? 'x^2' : '|x|'}$ ?`,
        answer: num(img.size),
        hint: `$${square ? 'x^2' : '|x|'}$ prend la même valeur en $x$ et $-x$.`,
        correction: [`Les valeurs atteintes sont celles de $|x|$ pour $x$ de $0$ à $${Math.max(-a, b)}$ : $${img.size}$ valeurs.`],
      };
    },
  ],
  'l1-composition': [
    // Retrouver g affine telle que g ∘ f = h.
    (rng) => {
      const a = rng.nonZero(-4, 4);
      const b = rng.int(-5, 5);
      const p = rng.nonZero(-3, 3);
      const q = rng.int(-5, 5);
      // h = g ∘ f = p(ax + b) + q
      return {
        prompt: `$f(x) = ${affine(a, b)}$ et $g$ est affine : $g(y) = py + q$. On sait que $(g \\circ f)(x) = ${affine(p * a, p * b + q)}$. Donne $p$ et $q$.`,
        answer: pairOf(p, q, ['p', 'q']),
        hint: '$(g \\circ f)(x) = p(ax + b) + q$ : identifie les coefficients.',
        correction: [`$p \\times ${par(a)} = ${p * a}$ donc $p = ${p}$.`, `$p \\times ${par(b)} + q = ${p * b + q}$ donc $q = ${q}$.`],
      };
    },
    // Itérée f ∘ f ∘ f.
    (rng, level) => {
      const a = level === 1 ? rng.pick([1, 2, -1]) : rng.pick([2, -2, 3, -1]);
      const b = rng.int(-4, 4);
      const x0 = rng.int(-3, 3);
      const n = level === 3 ? 4 : 3;
      let v = x0;
      const steps: number[] = [];
      for (let i = 0; i < n; i++) {
        v = a * v + b;
        steps.push(v);
      }
      return {
        prompt: `$f(x) = ${affine(a, b)}$. Calcule $${Array(n).fill('f').join(' \\circ ')}\\,(${x0})$.`,
        answer: num(v),
        hint: 'Applique $f$ plusieurs fois de suite, en partant de la droite.',
        correction: [`$${steps.map((s, i) => `f^{${i + 1}}(${x0}) = ${s}`).join(',\\ ')}$`],
      };
    },
    // f ∘ g = g ∘ f ?
    (rng) => {
      const a = rng.nonZero(-3, 3);
      const b = rng.int(-4, 4);
      const c = rng.nonZero(-3, 3);
      const d = rng.int(-4, 4);
      const commute = a * d + b === c * b + d;
      return vraiFaux(
        `Avec $f(x) = ${affine(a, b)}$ et $g(x) = ${affine(c, d)}$, on a $f \\circ g = g \\circ f$.`,
        commute,
        [`$(f \\circ g)(x) = ${affine(a * c, a * d + b)}$ et $(g \\circ f)(x) = ${affine(c * a, c * b + d)}$.`, commute ? 'Les deux coïncident.' : 'Les termes constants diffèrent : la composition n’est pas commutative.'],
        'Calcule les deux composées et compare-les.',
      );
    },
  ],
  'l1-reciproque': [
    // Réciproque d'une fonction affine : coefficients.
    (rng) => {
      const a = rng.nonZero(-5, 5);
      const b = rng.int(-6, 6);
      return {
        prompt: `$f(x) = ${affine(a, b)}$ est une bijection de $\\mathbb{R}$ sur $\\mathbb{R}$, de réciproque $f^{-1}(y) = py + q$. Donne $p$ et $q$.`,
        answer: pairOf(F(1, a), F(-b, a), ['p', 'q']),
        hint: 'Résous $y = ax + b$ en $x$.',
        correction: [`$y = ${affine(a, b)} \\iff x = \\frac{y${plus(-b)}}{${a}}$`, `$p = ${tex(F(1, a))}$ et $q = ${tex(F(-b, a))}$`],
      };
    },
    // x ↦ x³ + c, ou (x + a)² + c sur [-a ; +∞[.
    (rng, level) => {
      const t = rng.int(-4, 4);
      const c = rng.int(-6, 6);
      if (level === 1 || rng.next() < 0.5) {
        const y = t ** 3 + c;
        return {
          prompt: `$f(x) = x^3${plus(c)}$ est bijective de $\\mathbb{R}$ dans $\\mathbb{R}$. Calcule $f^{-1}(${y})$.`,
          answer: num(t),
          hint: 'Résous $x^3 + c = y$ : $x = \\sqrt[3]{y - c}$.',
          correction: [`$x^3 = ${y}${plus(-c)} = ${t ** 3}$, donc $x = ${t}$.`],
        };
      }
      const a = rng.int(-4, 4);
      const s = rng.int(0, 5);
      const y = s * s + c;
      return {
        prompt: `$f(x) = (${affine(1, a)})^2${plus(c)}$ réalise une bijection de $[${-a}\\,;+\\infty[$ sur $[${c}\\,;+\\infty[$. Calcule $f^{-1}(${y})$.`,
        answer: num(s - a),
        hint: 'Sur cet intervalle, $x + a \\geq 0$ : on prend la racine positive.',
        correction: [`$(x${plus(a)})^2 = ${s * s}$ et $x${plus(a)} \\geq 0$, donc $x${plus(a)} = ${s}$ et $x = ${s - a}$.`],
      };
    },
    // Vrai/faux : f⁻¹ et 1/f (erreur classique).
    (rng) => {
      const a = rng.int(2, 5);
      const b = rng.int(1, 6);
      const y = rng.int(1, 10);
      const pre = div(F(y - b), F(a));
      const inv = F(1, a * y + b);
      return {
        prompt: `$f(x) = ${affine(a, b)}$. Un étudiant écrit « $f^{-1}(${y}) = \\frac{1}{f(${y})}$ ». Que vaut vraiment $f^{-1}(${y})$ ?`,
        answer: numF(pre),
        hint: '$f^{-1}$ désigne la bijection réciproque, pas l’inverse $1/f$.',
        correction: [`$\\frac{1}{f(${y})} = ${tex(inv)}$ n’a rien à voir.`, `$f(x) = ${y} \\iff x = \\frac{${y} - ${b}}{${a}} = ${tex(pre)}$`],
      };
    },
  ],
  'l1-compter-applications': [
    (rng, level) => {
      const n = rng.int(3, level === 1 ? 5 : 7);
      const p = rng.int(2, n);
      const kinds = [
        { q: `applications strictement croissantes de $\\{1, \\dots, ${p}\\}$ dans $\\{1, \\dots, ${n}\\}$`, v: binom(n, p), why: `Une telle application est déterminée par son image, une partie à $${p}$ éléments : $\\binom{${n}}{${p}}$.` },
        { q: `applications $f$ de $\\{1, \\dots, ${p}\\}$ dans $\\{1, \\dots, ${n}\\}$ telles que $f(1) = 1$`, v: n ** (p - 1), why: `$f(1)$ est imposé, les $${p - 1}$ autres images sont libres : $${n}^{${p - 1}}$.` },
        { q: `surjections de $\\{1, \\dots, ${n}\\}$ sur $\\{0, 1\\}$`, v: 2 ** n - 2, why: `On retire des $2^{${n}}$ applications les deux constantes : $2^{${n}} - 2$.` },
        { q: `bijections $f$ de $\\{1, \\dots, ${n}\\}$ dans lui-même telles que $f(1) = 1$`, v: fact(n - 1), why: `On permute librement les $${n - 1}$ autres : $${n - 1}!$.` },
      ];
      const k = rng.pick(level === 1 ? kinds.slice(0, 2) : kinds);
      return {
        prompt: `Combien y a-t-il d’${k.q} ?`,
        answer: num(k.v),
        hint: 'Décompose la construction en choix successifs.',
        correction: [k.why, `Réponse : $${k.v}$`],
      };
    },
    // Problème concret.
    (rng, level) => {
      const n = rng.int(3, 6);
      const p = rng.int(n, n + 3);
      const distinct = level > 1 && rng.next() < 0.6;
      const v = distinct ? fact(p) / fact(p - n) : p ** n;
      return {
        prompt: distinct
          ? `$${n}$ amis choisissent chacun une chambre dans un refuge qui en compte $${p}$, chacun dans une chambre différente. Combien de répartitions possibles ?`
          : `$${n}$ amis choisissent chacun l’un des $${p}$ sentiers de la montagne (plusieurs peuvent prendre le même). Combien de choix possibles ?`,
        answer: num(v),
        hint: distinct ? 'C’est une injection de l’ensemble des amis dans celui des chambres.' : 'C’est une application de l’ensemble des amis dans celui des sentiers.',
        correction: [distinct ? `Injections : $\\frac{${p}!}{${p - n}!} = ${v}$` : `Applications : $${p}^{${n}} = ${v}$`],
      };
    },
  ],
};

export const BANQUES_APPLICATIONS = { COMPOSITION };
