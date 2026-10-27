import { type Fait, type Variantes, qcmBanque, vraiFaux, vraiFauxBanque } from '../../licenceVariantes';
import { F, add, affine, div, mul, num, numF, pairOf, par, plus, sub, tex, texChoice } from '../util';

/** Variantes du chapitre « Suites réelles » (feuille bibmath « Suites de nombres réels ou complexes »). */

const SUITES: Fait[] = [
  { s: 'Toute suite convergente est bornée.', v: true, why: 'À partir d’un rang, $|u_n - \\ell| < 1$ ; les premiers termes sont en nombre fini.' },
  { s: 'Toute suite bornée est convergente.', v: false, why: '$(-1)^n$ est bornée mais diverge.' },
  { s: 'Toute suite croissante et majorée converge.', v: true, why: 'C’est le théorème de la limite monotone.' },
  { s: 'Si $u_{n+1} - u_n \\to 0$, alors $(u_n)$ converge.', v: false, why: '$u_n = \\ln n$ : $u_{n+1} - u_n = \\ln(1 + 1/n) \\to 0$ mais $u_n \\to +\\infty$.' },
  { s: 'Si $(u_{2n})$ et $(u_{2n+1})$ convergent vers la même limite $\\ell$, alors $(u_n)$ converge vers $\\ell$.', v: true, why: 'Les deux suites extraites recouvrent tous les indices.' },
  { s: 'Si $(u_{2n})$ et $(u_{2n+1})$ convergent, alors $(u_n)$ converge.', v: false, why: '$(-1)^n$ : les deux suites extraites sont constantes, de limites différentes.' },
  { s: 'Si $u_n \\to \\ell$ et $u_n > 0$ pour tout $n$, alors $\\ell > 0$.', v: false, why: '$u_n = 1/n > 0$ tend vers $0$ : les inégalités strictes deviennent larges à la limite.' },
  { s: 'Si $(u_n)$ est croissante et $(v_n)$ décroissante avec $v_n - u_n \\to 0$, elles convergent vers la même limite.', v: true, why: 'Ce sont des suites adjacentes.' },
  { s: 'Si $u_n \\to +\\infty$, alors $(u_n)$ est croissante à partir d’un certain rang.', v: false, why: '$u_n = n + 2(-1)^n$ tend vers $+\\infty$ sans être monotone.' },
  { s: 'Si $|u_n| \\to 0$, alors $u_n \\to 0$.', v: true, why: '$|u_n - 0| = |u_n|$.' },
  { s: 'Si $|u_n| \\to 1$, alors $(u_n)$ converge.', v: false, why: '$(-1)^n$ a pour valeur absolue $1$ mais diverge.' },
  { s: 'Si $u_n \\leq v_n \\leq w_n$ avec $u_n \\to \\ell$ et $w_n \\to \\ell$, alors $v_n \\to \\ell$.', v: true, why: 'C’est le théorème des gendarmes.' },
];

/** u_{n+1} = a·u_n + b, termes jusqu'à k. */
const iterate = (a: ReturnType<typeof F>, b: number, u0: number, k: number) => {
  let u = F(u0);
  for (let i = 0; i < k; i++) u = add(mul(a, u), F(b));
  return u;
};

export const SUITES_VARIANTES: Variantes = {
  'l1-limite-suite': [
    (rng) => vraiFauxBanque(rng, SUITES),
    (rng) => qcmBanque(rng, SUITES, rng.next() < 0.5),
    // (1 + a/n)^n → e^a.
    (rng, level) => {
      const a = rng.nonZero(-4, 4);
      const k = level === 3 ? rng.int(2, 3) : 1;
      const res = a * k;
      const e = (x: number) => (x === 0 ? '1' : x === 1 ? 'e' : `e^{${x}}`);
      return {
        prompt: `Calcule $\\displaystyle\\lim_{n \\to +\\infty} \\left(1 ${a < 0 ? '-' : '+'} \\frac{${Math.abs(a)}}{n}\\right)^{${k === 1 ? 'n' : `${k}n`}}$.`,
        answer: texChoice(rng, e(res), [e(-res), '1', '+\\infty', e(a + k), e(res + 1)]),
        hint: 'Écris $\\left(1 + \\frac{a}{n}\\right)^n = \\exp\\left(n \\ln\\left(1 + \\frac{a}{n}\\right)\\right)$ et $\\ln(1 + x) \\sim x$.',
        correction: [`$${k === 1 ? '' : k}n\\ln\\left(1 ${a < 0 ? '-' : '+'} \\frac{${Math.abs(a)}}{n}\\right) \\sim ${k === 1 ? '' : k}n \\times \\frac{${a}}{n} = ${res}$`, `La limite vaut $${e(res)}$ (et non $1$ : $1^\\infty$ est une forme indéterminée).`],
      };
    },
    // Encadrement : (an + b sin n)/(cn + d).
    (rng) => {
      const a = rng.nonZero(-6, 6);
      const b = rng.nonZero(1, 5);
      const c = rng.nonZero(1, 6);
      const d = rng.int(1, 6);
      const trig = rng.pick(['\\sin n', '\\cos n', '(-1)^n']);
      return {
        prompt: `Calcule $\\displaystyle\\lim_{n \\to +\\infty} \\frac{${a === 1 ? '' : a === -1 ? '-' : a}n + ${b === 1 ? '' : b}${trig}}{${affine(c, d, 'n')}}$.`,
        answer: numF(F(a, c)),
        hint: `$${trig}$ est borné : encadre le numérateur, ou divise tout par $n$.`,
        correction: [`$\\frac{${b === 1 ? '' : b}${trig}}{n} \\to 0$ car $|${trig}| \\leq 1$.`, `La limite vaut $\\frac{${a}}{${c}} = ${tex(F(a, c))}$.`],
      };
    },
    // Radicaux itérés u_{n+1} = √(a + u_n).
    (rng) => {
      const m = rng.int(2, 6);
      const a = m * (m - 1);
      return {
        prompt: `$u_0 = 0$ et $u_{n+1} = \\sqrt{${a} + u_n}$. On admet que $(u_n)$ converge. Quelle est sa limite ?`,
        answer: num(m),
        hint: 'La limite $\\ell \\geq 0$ vérifie $\\ell = \\sqrt{a + \\ell}$, soit $\\ell^2 - \\ell - a = 0$.',
        correction: [`$\\ell^2 - \\ell - ${a} = (\\ell - ${m})(\\ell + ${m - 1}) = 0$`, `Comme $\\ell \\geq 0$ : $\\ell = ${m}$.`],
      };
    },
  ],
  'l1-recurrence-lineaire-ordre2': [
    // Calcul de proche en proche (problème concret façon Fibonacci).
    (rng, level) => {
      const a = rng.pick([1, 2]);
      const b = rng.pick([1, 2, 3]);
      const u0 = rng.int(0, 3);
      const u1 = rng.int(1, 4);
      const k = rng.int(5, level === 1 ? 7 : 10);
      const u = [u0, u1];
      for (let i = 2; i <= k; i++) u.push(a * u[i - 1] + b * u[i - 2]);
      return {
        prompt: `Une colonie compte $u_0 = ${u0}$ puis $u_1 = ${u1}$ couples d’oiseaux, et chaque saison $u_{n+2} = ${a === 1 ? '' : a}u_{n+1} + ${b === 1 ? '' : b}u_n$. Calcule $u_{${k}}$.`,
        answer: num(u[k]),
        hint: 'Calcule les termes de proche en proche.',
        correction: [`$${u.map((x, i) => `u_{${i}} = ${x}`).join(',\\ ')}$`],
      };
    },
    // Racine double : u_n = (λ + μn) r^n.
    (rng) => {
      const r = rng.pick([1, 2, -1, -2]);
      const lambda = rng.int(-3, 3);
      const mu = rng.nonZero(-3, 3);
      const u0 = lambda;
      const u1 = (lambda + mu) * r;
      return {
        prompt: `$u_{n+2} = ${2 * r}u_{n+1} ${-r * r < 0 ? '-' : '+'} ${r * r === 1 ? '' : r * r}u_n$, $u_0 = ${u0}$ et $u_1 = ${u1}$. On écrit $u_n = (\\lambda + \\mu n)(${r})^n$. Donne $\\lambda$ et $\\mu$.`,
        answer: pairOf(lambda, mu, ['\\lambda', '\\mu']),
        hint: `L’équation caractéristique $(x ${r < 0 ? '+' : '-'} ${Math.abs(r)})^2 = 0$ a une racine double ; utilise $u_0$ puis $u_1$.`,
        correction: [`$u_0 = \\lambda = ${u0}$`, `$u_1 = (\\lambda + \\mu) \\times ${par(r)} = ${u1}$ donne $\\mu = ${mu}$`],
      };
    },
    // Question inverse : récurrence de racines données.
    (rng) => {
      let r1 = rng.nonZero(-4, 4);
      let r2 = rng.nonZero(-4, 4);
      while (r1 === r2) r2 = rng.nonZero(-4, 4);
      if (r1 > r2) [r1, r2] = [r2, r1];
      return {
        prompt: `On veut que toutes les suites $u_n = \\lambda (${r1})^n + \\mu (${r2})^n$ vérifient $u_{n+2} = au_{n+1} + bu_n$. Donne $a$ et $b$.`,
        answer: pairOf(r1 + r2, -r1 * r2, ['a', 'b']),
        hint: '$r_1$ et $r_2$ doivent être les racines de $x^2 = ax + b$.',
        correction: [`$(x ${r1 < 0 ? '+' : '-'} ${Math.abs(r1)})(x ${r2 < 0 ? '+' : '-'} ${Math.abs(r2)}) = x^2 - ${par(r1 + r2)}x + ${par(r1 * r2)}$`, `$a = ${r1 + r2}$ et $b = ${-r1 * r2}$`],
      };
    },
  ],
  'l1-suite-arithmetico-geometrique': [
    // Problème concret : population avec prélèvement.
    (rng) => {
      const pct = rng.pick([10, 20, 25, 50]);
      const a = F(100 - pct, 100);
      const b = rng.int(1, 9) * 100;
      const u0 = rng.int(1, 9) * 1000;
      const l = div(F(b), sub(F(1), a));
      return {
        prompt: `Un étang contient $${u0}$ poissons. Chaque année, $${pct}\\,\\%$ des poissons disparaissent, puis on en réintroduit $${b}$. Vers quel nombre de poissons la population se stabilise-t-elle ?`,
        answer: numF(l),
        hint: `$u_{n+1} = ${tex(a)}\\,u_n + ${b}$ : cherche le point fixe.`,
        correction: [`$\\ell = ${tex(a)}\\ell + ${b} \\iff \\ell = \\frac{${b}}{${tex(sub(F(1), a))}} = ${tex(l)}$`],
      };
    },
    // Terme de rang k.
    (rng, level) => {
      const a = rng.pick(level === 1 ? [2, 3] : [2, 3, -2, -1]);
      const b = rng.nonZero(-5, 5);
      const u0 = rng.int(-4, 4);
      const k = rng.int(3, level === 1 ? 5 : 8);
      const v = iterate(F(a), b, u0, k);
      const l = F(-b, a - 1);
      return {
        prompt: `$u_0 = ${u0}$ et $u_{n+1} = ${a}u_n${plus(b)}$. Calcule $u_{${k}}$.`,
        answer: numF(v),
        hint: `$v_n = u_n - \\ell$ est géométrique de raison $${a}$, avec $\\ell = \\frac{${-b}}{${a - 1}}$.`,
        correction: [`$\\ell = ${tex(l)}$ et $u_n = \\ell + ${par(a)}^n(u_0 - \\ell)$`, `$u_{${k}} = ${tex(v)}$`],
      };
    },
    // Monotonie.
    (rng) => {
      const a = F(1, rng.pick([2, 3, 4]));
      const b = rng.nonZero(-6, 6);
      const u0 = rng.int(-8, 8);
      const l = div(F(b), sub(F(1), a));
      const lv = l.n / l.d;
      if (u0 === lv)
        return vraiFaux(`La suite définie par $u_0 = ${u0}$ et $u_{n+1} = ${tex(a)}u_n${plus(b)}$ est constante.`, true, [`$u_0 = ${tex(l)}$ est le point fixe.`]);
      const croissante = u0 < lv;
      return vraiFaux(
        `La suite définie par $u_0 = ${u0}$ et $u_{n+1} = ${tex(a)}u_n${plus(b)}$ est croissante.`,
        croissante,
        [`Le point fixe est $\\ell = ${tex(l)}$ et $u_n - \\ell = (${tex(a)})^n(u_0 - \\ell)$.`, croissante ? '$u_0 < \\ell$ : la suite croît vers $\\ell$.' : '$u_0 > \\ell$ : la suite décroît vers $\\ell$.'],
        'Compare $u_0$ au point fixe $\\ell$.',
      );
    },
  ],
  'l1-limite-quotient-geometrique': [
    // (p^n + q^n)^{1/n} → max.
    (rng) => {
      const [p, q] = rng.shuffle([2, 3, 4, 5, 7]).slice(0, 2);
      return {
        prompt: `Calcule $\\displaystyle\\lim_{n \\to +\\infty} \\left(${p}^n + ${q}^n\\right)^{1/n}$.`,
        answer: num(Math.max(p, q)),
        hint: `Factorise par le plus grand : $(${Math.max(p, q)}^n)^{1/n}\\left(1 + \\left(\\frac{${Math.min(p, q)}}{${Math.max(p, q)}}\\right)^n\\right)^{1/n}$.`,
        correction: [`$${Math.max(p, q)} \\leq (${p}^n + ${q}^n)^{1/n} \\leq 2^{1/n} \\times ${Math.max(p, q)}$, et $2^{1/n} \\to 1$.`, `Limite : $${Math.max(p, q)}$`],
      };
    },
    // (p^n − q^n)/(p^n + q^n).
    (rng) => {
      const [p, q] = rng.shuffle([2, 3, 4, 5]).slice(0, 2);
      const v = p > q ? 1 : -1;
      return {
        prompt: `Calcule $\\displaystyle\\lim_{n \\to +\\infty} \\frac{${p}^n - ${q}^n}{${p}^n + ${q}^n}$.`,
        answer: num(v),
        hint: 'Divise en haut et en bas par la plus grande puissance.',
        correction: [`On divise par $${Math.max(p, q)}^n$ : $\\left(\\frac{${Math.min(p, q)}}{${Math.max(p, q)}}\\right)^n \\to 0$.`, `Limite : $${v}$`],
      };
    },
    // Croissances comparées.
    (rng) => {
      const facts: Fait[] = [
        { s: `$\\displaystyle\\lim_{n \\to +\\infty} \\frac{n^{${rng.int(2, 100)}}}{${rng.pick(['2', '1{,}01', '3'])}^n} = 0$.`, v: true, why: 'Une suite géométrique de raison $> 1$ l’emporte sur toute puissance de $n$.' },
        { s: `$\\displaystyle\\lim_{n \\to +\\infty} \\frac{${rng.int(2, 9)}^n}{n!} = 0$.`, v: true, why: 'La factorielle l’emporte sur toute suite géométrique.' },
        { s: '$\\displaystyle\\lim_{n \\to +\\infty} \\frac{n!}{n^n} = 0$.', v: true, why: '$\\frac{n!}{n^n} \\leq \\frac{1}{n}$.' },
        { s: `$\\displaystyle\\lim_{n \\to +\\infty} \\frac{(\\ln n)^{${rng.int(2, 50)}}}{n} = +\\infty$.`, v: false, why: 'Toute puissance du logarithme est négligeable devant $n$ : la limite est $0$.' },
        { s: `$\\displaystyle\\lim_{n \\to +\\infty} \\frac{n!}{${rng.int(2, 9)}^n} = 0$.`, v: false, why: 'C’est l’inverse : $n!$ l’emporte, la limite est $+\\infty$.' },
        { s: '$\\displaystyle\\lim_{n \\to +\\infty} n^{1/n} = 1$.', v: true, why: '$n^{1/n} = e^{\\ln n / n}$ et $\\frac{\\ln n}{n} \\to 0$.' },
        { s: '$\\displaystyle\\lim_{n \\to +\\infty} \\left(1 + \\frac{1}{n}\\right)^n = 1$.', v: false, why: 'La limite vaut $e$ : $1^\\infty$ est une forme indéterminée.' },
      ];
      const f = rng.pick(facts);
      return vraiFaux(f.s, f.v, [f.why], 'Hiérarchie : $\\ln n \\ll n^a \\ll q^n \\ll n! \\ll n^n$.');
    },
  ],
  'l1-seuil-convergence': [
    // Seuil géométrique.
    (rng, level) => {
      const q = rng.pick([2, 3, 10]);
      const k = rng.int(2, level === 1 ? 4 : 9);
      let n = 0;
      while (q ** n <= 10 ** k) n++;
      return {
        prompt: `Quel est le plus petit entier $n$ tel que $\\left(\\frac{1}{${q}}\\right)^n < 10^{-${k}}$ ?`,
        answer: num(n),
        hint: `Équivaut à $${q}^n > 10^{${k}}$ : passe au logarithme.`,
        correction: [`$n > \\frac{${k}\\ln 10}{\\ln ${q}} \\approx ${((k * Math.log(10)) / Math.log(q)).toFixed(2).replace('.', '{,}')}$`, `Donc $n = ${n}$.`],
      };
    },
    // Seuil de somme.
    (rng) => {
      const S = rng.int(50, 5000);
      let n = 0;
      while ((n * (n + 1)) / 2 <= S) n++;
      return {
        prompt: `Quel est le plus petit entier $n$ tel que $1 + 2 + \\dots + n > ${S}$ ?`,
        answer: num(n),
        hint: 'Résous $\\frac{n(n+1)}{2} > S$.',
        correction: [`$\\frac{${n - 1}\\times${n}}{2} = ${((n - 1) * n) / 2} \\leq ${S}$ et $\\frac{${n}\\times${n + 1}}{2} = ${(n * (n + 1)) / 2} > ${S}$`, `Donc $n = ${n}$.`],
      };
    },
    // Seuil factoriel.
    (rng) => {
      const k = rng.int(2, 12);
      let n = 1;
      let f = 1;
      while (f <= 10 ** k) {
        n++;
        f *= n;
      }
      return {
        prompt: `Quel est le plus petit entier $n$ tel que $n! > 10^{${k}}$ ?`,
        answer: num(n),
        hint: 'Calcule les factorielles successives.',
        correction: [`$${n - 1}! = ${f / n} \\leq 10^{${k}}$ et $${n}! = ${f} > 10^{${k}}$`],
      };
    },
  ],
};

export const BANQUES_SUITES = { SUITES };
