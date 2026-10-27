import { type Fait, type Variantes, qcmBanque, vraiFauxBanque } from '../../licenceVariantes';
import { F, NATURE, add, div, fact, fixedChoice, fpow, mul, num, numF, par, sub, tex } from '../util';

/**
 * Variantes des chapitres d'analyse de L2 : séries numériques, intégrales généralisées, suites et
 * séries de fonctions, séries entières (feuilles bibmath « Séries numériques », « Intégrales
 * impropres », « Suites et séries de fonctions », « Séries entières »).
 */

const SERIES: Fait[] = [
  { s: 'Si $u_n \\to 0$, alors $\\sum u_n$ converge.', v: false, why: 'La série harmonique $\\sum \\frac{1}{n}$ diverge alors que $\\frac{1}{n} \\to 0$.' },
  { s: 'Si $\\sum u_n$ converge, alors $u_n \\to 0$.', v: true, why: '$u_n = S_n - S_{n-1}$ tend vers $S - S = 0$.' },
  { s: '$\\sum \\frac{1}{n^\\alpha}$ converge si et seulement si $\\alpha > 1$.', v: true, why: 'C’est le critère de Riemann.' },
  { s: 'Si $u_n \\sim v_n$ avec $v_n > 0$, alors $\\sum u_n$ et $\\sum v_n$ sont de même nature.', v: true, why: 'Les deux séries sont alors à termes positifs à partir d’un rang, et on compare.' },
  { s: 'Si $u_n \\sim v_n$, alors $\\sum u_n$ et $\\sum v_n$ sont toujours de même nature, même si les signes varient.', v: false, why: '$\\frac{(-1)^n}{\\sqrt n}$ et $\\frac{(-1)^n}{\\sqrt n} + \\frac{1}{n}$ sont équivalents ; la première converge, la seconde diverge.' },
  { s: '$\\sum \\frac{(-1)^n}{n}$ converge.', v: true, why: 'Critère des séries alternées : $\\frac{1}{n}$ décroît vers $0$.' },
  { s: '$\\sum \\frac{(-1)^n}{n}$ converge absolument.', v: false, why: '$\\sum \\frac{1}{n}$ diverge.' },
  { s: 'Une série absolument convergente est convergente.', v: true, why: 'C’est la complétude de $\\mathbb{R}$ (critère de Cauchy).' },
  { s: 'Si $\\left|\\frac{u_{n+1}}{u_n}\\right| \\to 1$, la série $\\sum u_n$ diverge.', v: false, why: 'On ne peut pas conclure : $\\sum \\frac{1}{n^2}$ converge et le rapport tend vers $1$.' },
  { s: '$\\sum \\frac{1}{n \\ln n}$ converge.', v: false, why: 'Par comparaison série-intégrale avec $\\ln(\\ln x)$, qui tend vers $+\\infty$.' },
  { s: '$\\sum \\frac{1}{n^2}$ vaut $\\frac{\\pi^2}{6}$.', v: true, why: 'C’est le problème de Bâle, résolu par Euler.' },
  { s: '$\\sum \\frac{n!}{n^n}$ converge.', v: true, why: 'D’Alembert : le rapport tend vers $\\frac{1}{e} < 1$.' },
];

const INTEGRALES: Fait[] = [
  { s: '$\\int_1^{+\\infty} \\frac{dt}{t^\\alpha}$ converge si et seulement si $\\alpha > 1$.', v: true, why: 'Une primitive de $t^{-\\alpha}$ est $\\frac{t^{1 - \\alpha}}{1 - \\alpha}$ ($\\alpha \\neq 1$), et $\\ln t$ pour $\\alpha = 1$.' },
  { s: '$\\int_0^1 \\frac{dt}{t^\\alpha}$ converge si et seulement si $\\alpha > 1$.', v: false, why: 'En $0$, c’est l’inverse : elle converge si et seulement si $\\alpha < 1$.' },
  { s: 'Si $\\int_0^{+\\infty} f$ converge, alors $f(t) \\to 0$ en $+\\infty$.', v: false, why: 'Des pics de hauteur $1$ de plus en plus étroits donnent une intégrale convergente sans limite nulle.' },
  { s: '$\\int_0^{+\\infty} e^{-t}\\,dt = 1$.', v: true, why: '$\\left[-e^{-t}\\right]_0^{+\\infty} = 0 - (-1) = 1$.' },
  { s: '$\\int_0^1 \\ln t\\,dt$ converge.', v: true, why: '$\\left[t\\ln t - t\\right]_0^1 = -1$ car $t \\ln t \\to 0$.' },
  { s: '$\\int_1^{+\\infty} \\frac{\\sin t}{t^2}\\,dt$ converge absolument.', v: true, why: '$\\left|\\frac{\\sin t}{t^2}\\right| \\leq \\frac{1}{t^2}$, intégrable sur $[1, +\\infty[$.' },
  { s: '$\\int_0^{+\\infty} \\frac{dt}{1 + t^2} = \\frac{\\pi}{2}$.', v: true, why: '$\\left[\\arctan t\\right]_0^{+\\infty} = \\frac{\\pi}{2}$.' },
  { s: 'Si $0 \\leq f \\leq g$ et $\\int g$ diverge, alors $\\int f$ diverge.', v: false, why: 'C’est le contraire : la divergence de la plus petite entraîne celle de la plus grande.' },
  { s: '$\\int_2^{+\\infty} \\frac{dt}{t \\ln t}$ converge.', v: false, why: 'Une primitive est $\\ln(\\ln t)$, qui tend vers $+\\infty$.' },
  { s: 'Si $f \\geq 0$ et $f(t) \\sim \\frac{1}{t^2}$ en $+\\infty$, alors $\\int_1^{+\\infty} f$ converge.', v: true, why: 'Comparaison par équivalents de fonctions positives avec une intégrale de Riemann.' },
  { s: '$\\Gamma(n + 1) = \\int_0^{+\\infty} t^n e^{-t}\\,dt = n!$.', v: true, why: 'Par intégrations par parties successives : $\\Gamma(x + 1) = x\\Gamma(x)$.' },
];

const FONCTIONS: Fait[] = [
  { s: 'La convergence uniforme entraîne la convergence simple.', v: true, why: '$|f_n(x) - f(x)| \\leq \\|f_n - f\\|_\\infty$ pour tout $x$.' },
  { s: 'La convergence simple entraîne la convergence uniforme.', v: false, why: '$x^n$ converge simplement sur $[0, 1]$ vers une fonction discontinue, pas uniformément.' },
  { s: 'Une limite uniforme de fonctions continues est continue.', v: true, why: 'C’est le théorème de continuité, par un argument en $\\frac{\\varepsilon}{3}$.' },
  { s: 'Une limite simple de fonctions continues est continue.', v: false, why: '$x^n$ sur $[0, 1]$ : la limite vaut $0$ sur $[0, 1[$ et $1$ en $1$.' },
  { s: 'Si $f_n \\to f$ uniformément sur $[a, b]$, alors $\\int_a^b f_n \\to \\int_a^b f$.', v: true, why: '$\\left|\\int_a^b (f_n - f)\\right| \\leq (b - a)\\|f_n - f\\|_\\infty$.' },
  { s: 'La convergence normale d’une série de fonctions entraîne sa convergence uniforme.', v: true, why: 'Le reste est majoré par $\\sum_{k > n} \\|u_k\\|_\\infty$, qui tend vers $0$.' },
  { s: 'La convergence uniforme d’une série de fonctions entraîne sa convergence normale.', v: false, why: '$\\sum \\frac{(-1)^n}{n}$ (fonctions constantes) converge uniformément mais pas normalement.' },
  { s: 'Si $f_n \\to f$ uniformément et les $f_n$ sont dérivables, alors $f$ est dérivable.', v: false, why: '$\\sqrt{x^2 + \\frac{1}{n}}$ converge uniformément vers $|x|$, non dérivable en $0$.' },
  { s: '$f_n(x) = \\frac{x}{n}$ converge uniformément vers $0$ sur $\\mathbb{R}$.', v: false, why: '$\\sup_{\\mathbb{R}} \\left|\\frac{x}{n}\\right| = +\\infty$ ; la convergence n’est uniforme que sur les bornés.' },
  { s: '$f_n(x) = \\frac{\\sin(nx)}{n}$ converge uniformément vers $0$ sur $\\mathbb{R}$.', v: true, why: '$\\|f_n\\|_\\infty = \\frac{1}{n} \\to 0$.' },
];

const ENTIERES: Fait[] = [
  { s: 'Une série entière converge normalement sur tout disque fermé de rayon $r < R$.', v: true, why: 'On majore $|a_nz^n|$ par $|a_n|r^n$, terme d’une série convergente.' },
  { s: 'Une série entière converge toujours sur le cercle $|z| = R$.', v: false, why: '$\\sum z^n$ ($R = 1$) diverge en tout point du cercle unité.' },
  { s: 'Une série entière et sa série dérivée ont le même rayon de convergence.', v: true, why: 'Multiplier $a_n$ par $n$ ne change pas le rayon (règle d’Hadamard).' },
  { s: '$\\sum \\frac{x^n}{n!}$ a un rayon de convergence infini.', v: true, why: 'D’Alembert : $\\frac{1}{n + 1} \\to 0$. Sa somme est $e^x$.' },
  { s: '$\\ln(1 + x) = \\sum_{n \\geq 1} \\frac{(-1)^{n+1}x^n}{n}$ pour $|x| < 1$.', v: true, why: 'On intègre $\\frac{1}{1 + x} = \\sum (-1)^nx^n$ terme à terme.' },
  { s: '$\\sum n!\\,x^n$ a un rayon de convergence égal à $1$.', v: false, why: 'D’Alembert : $(n + 1)|x| \\to +\\infty$ dès que $x \\neq 0$, donc $R = 0$.' },
  { s: 'Si $|a_n| \\leq |b_n|$, le rayon de $\\sum a_nx^n$ est au moins celui de $\\sum b_nx^n$.', v: true, why: 'La convergence absolue de $\\sum b_nx^n$ entraîne celle de $\\sum a_nx^n$.' },
  { s: 'La somme d’une série entière est de classe $\\mathcal{C}^\\infty$ sur $]-R, R[$.', v: true, why: 'On dérive terme à terme autant de fois qu’on veut.' },
  { s: '$\\cos x = \\sum_{n \\geq 0} \\frac{(-1)^n x^{2n}}{(2n)!}$ pour tout réel $x$.', v: true, why: 'C’est la partie réelle de $e^{ix}$.' },
  { s: '$\\frac{1}{1 - x} = \\sum x^n$ pour tout réel $x \\neq 1$.', v: false, why: 'Seulement pour $|x| < 1$ : en $x = 2$, la série diverge.' },
];

/** Écriture d'une fraction entre parenthèses dans une puissance. */
const ptex = (q: { n: number; d: number }) => (q.d === 1 && q.n >= 0 ? tex(q) : `\\left(${tex(q)}\\right)`);

/** Fraction p/q de valeur absolue < 1, non nulle. */
function petite(rng: { int: (a: number, b: number) => number; nonZero: (a: number, b: number) => number }) {
  const d = rng.int(2, 5);
  return F(rng.nonZero(-(d - 1), d - 1), d);
}

export const ANALYSE_L2_VARIANTES: Variantes = {
  'l2-serie-geometrique': [
    // Question inverse : retrouver la raison.
    (rng) => {
      const q = petite(rng);
      const S = div(F(1), sub(F(1), q));
      return {
        prompt: `On sait que $\\displaystyle\\sum_{n=0}^{+\\infty} q^n = ${tex(S)}$. Que vaut $q$ ?`,
        answer: numF(q),
        hint: '$\\sum_{n \\geq 0} q^n = \\frac{1}{1 - q}$ pour $|q| < 1$ : isole $q$.',
        correction: [`$\\frac{1}{1 - q} = ${tex(S)}$ donne $1 - q = ${tex(div(F(1), S))}$`, `$q = ${tex(q)}$`],
      };
    },
    // Problème : la balle qui rebondit.
    (rng) => {
      const h = rng.pick([1, 2, 3, 4, 5, 6, 8, 10]);
      const r = rng.pick([F(1, 2), F(1, 3), F(2, 3), F(3, 4), F(2, 5), F(3, 5), F(4, 5)]);
      // h + 2(hr + hr² + …) = h + 2hr/(1 − r)
      const total = add(F(h), mul(F(2 * h), div(r, sub(F(1), r))));
      return {
        prompt: `Une balle est lâchée de $${h}$ m. À chaque rebond, elle remonte aux $${tex(r)}$ de sa hauteur précédente. Quelle distance totale (en m) parcourt-elle avant de s’immobiliser ?`,
        answer: numF(total),
        hint: 'Elle descend $h$, puis monte et redescend $hr$, puis $hr^2$… : $h + 2\\sum_{n \\geq 1} hr^n$.',
        correction: [`$D = ${h} + 2 \\times ${h} \\times \\dfrac{${tex(r)}}{1 - ${tex(r)}} = ${tex(total)}$ m`],
      };
    },
    (rng) => vraiFauxBanque(rng, SERIES),
  ],
  'l2-serie-telescopique': [
    // Somme partielle ou seuil d'une série télescopique.
    (rng, level) => {
      const k = rng.int(1, level === 1 ? 1 : 3);
      const N = rng.int(3, 20);
      // Σ_{n=1}^{N} k/(n(n+k)) = Σ_{n=1}^{N} (1/n − 1/(n+k)) = H_k − Σ_{j=N+1}^{N+k} 1/j
      let s = F(0);
      for (let j = 1; j <= k; j++) s = add(s, F(1, j));
      for (let j = N + 1; j <= N + k; j++) s = sub(s, F(1, j));
      return {
        prompt: `Calcule la somme partielle $S_{${N}} = \\displaystyle\\sum_{n=1}^{${N}} \\frac{${k}}{n(n + ${k})}$.`,
        answer: numF(s),
        hint: `Décompose : $\\frac{${k}}{n(n + ${k})} = \\frac{1}{n} - \\frac{1}{n + ${k}}$, puis repère ce qui se simplifie.`,
        correction: [`Il reste les ${k === 1 ? 'premier terme' : `${k} premiers termes`} positifs et les ${k === 1 ? 'dernier terme' : `${k} derniers termes`} négatifs.`, `$S_{${N}} = ${tex(s)}$`],
      };
    },
    (rng) => {
      const m = rng.pick([10, 20, 50, 100, 1000]);
      // S_N = 1 − 1/(N+1) ≥ 1 − 1/m ⇔ N + 1 ≥ m
      return {
        prompt: `$S_N = \\displaystyle\\sum_{n=1}^{N} \\frac{1}{n(n + 1)}$. Quel est le plus petit entier $N$ tel que $S_N \\geq 1 - \\frac{1}{${m}}$ ?`,
        answer: num(m - 1),
        hint: 'Télescopage : $S_N = 1 - \\frac{1}{N + 1}$.',
        correction: [`$S_N = 1 - \\frac{1}{N + 1} \\geq 1 - \\frac{1}{${m}} \\iff N + 1 \\geq ${m}$`, `$N = ${m - 1}$`],
      };
    },
  ],
  'l2-nature-riemann': [
    // Fraction rationnelle en n : nature par l'exposant de l'équivalent.
    (rng, level) => {
      const p = rng.int(0, 3);
      const q = rng.int(Math.max(p, 1), p + 3);
      const half = level > 1 && rng.next() < 0.5;
      const a = rng.int(1, 5);
      const b = rng.int(1, 5);
      const num0 = p === 0 ? String(a + 1) : `${p === 1 ? 'n' : `n^{${p}}`} + ${a}`;
      const den = `${q === 1 ? 'n' : `n^{${q}}`}${half ? '\\sqrt{n}' : ''} + ${b}`;
      const alpha = q - p + (half ? 0.5 : 0);
      const conv = alpha > 1;
      return {
        prompt: `Quelle est la nature de la série $\\displaystyle\\sum_{n\\geq 1} \\frac{${num0}}{${den}}$ ?`,
        answer: fixedChoice(NATURE, conv ? 0 : 1),
        hint: 'Trouve un équivalent $\\frac{1}{n^\\alpha}$ du terme général (positif), puis applique Riemann.',
        correction: [`Le terme général est équivalent à $\\frac{1}{n^{${half ? tex(F(2 * alpha, 2)) : alpha}}}$.`, conv ? `$${half ? tex(F(2 * alpha, 2)) : alpha} > 1$ : la série converge.` : `$${half ? tex(F(2 * alpha, 2)) : alpha} \\leq 1$ : la série diverge.`],
      };
    },
    (rng) => vraiFauxBanque(rng, SERIES),
  ],
  'l2-nature-equivalents': [(rng) => qcmBanque(rng, SERIES), (rng) => qcmBanque(rng, SERIES, true)],
  'l2-critere-dalembert': [
    // Limite du rapport pour u_n = n^p a^n / b^n.
    (rng) => {
      const p = rng.int(0, 4);
      const a = rng.int(2, 6);
      let b = rng.int(2, 6);
      if (b === a) b++;
      const l = F(a, b);
      return {
        prompt: `Pour $u_n = \\dfrac{${p === 0 ? '' : p === 1 ? 'n\\,' : `n^{${p}}\\,`}${a}^n}{${b}^n}$, calcule $\\ell = \\displaystyle\\lim_{n\\to+\\infty} \\frac{u_{n+1}}{u_n}$, puis conclus.`,
        answer: numF(l),
        hint: '$\\frac{u_{n+1}}{u_n} = \\left(\\frac{n + 1}{n}\\right)^p \\times \\frac{a}{b}$.',
        correction: [`$\\ell = \\frac{${a}}{${b}} = ${tex(l)}$`, a < b ? 'Comme $\\ell < 1$, la série converge.' : 'Comme $\\ell > 1$, la série diverge.'],
      };
    },
    // Factorielles : k^n / n! converge toujours ; n! / k^n diverge toujours.
    (rng) => {
      const k = rng.int(2, 9);
      const fois = rng.next() < 0.5;
      return {
        prompt: `Quelle est la nature de la série $\\displaystyle\\sum_{n\\geq 0} ${fois ? `\\frac{n!}{${k}^n}` : `\\frac{${k}^n}{n!}`}$ ?`,
        answer: fixedChoice(NATURE, fois ? 1 : 0),
        hint: 'Applique la règle de d’Alembert.',
        correction: fois ? [`$\\frac{u_{n+1}}{u_n} = \\frac{n + 1}{${k}} \\to +\\infty$ : la série diverge.`] : [`$\\frac{u_{n+1}}{u_n} = \\frac{${k}}{n + 1} \\to 0 < 1$ : la série converge (vers $e^{${k}}$).`],
      };
    },
  ],
  'l2-serie-exponentielle': [
    // Σ (an² + bn + c)/n! = (2a + b + c)e.
    (rng, level) => {
      const a = level === 1 ? 0 : rng.int(0, 3);
      const b = rng.int(1, 4);
      const c = rng.int(-3, 4);
      const k = 2 * a + b + c;
      const terms: string[] = [];
      if (a) terms.push(`${a === 1 ? '' : a}n^2`);
      terms.push(`${terms.length && b > 0 ? '+ ' : ''}${b === 1 ? '' : b}n`);
      if (c) terms.push(`${c > 0 ? '+' : '-'} ${Math.abs(c)}`);
      return {
        prompt: `On a $\\displaystyle\\sum_{n=0}^{+\\infty} \\frac{${terms.join(' ')}}{n!} = k\\,e$. Donne $k$.`,
        answer: num(k),
        hint: 'Écris $n^2 = n(n - 1) + n$, puis utilise $\\sum \\frac{n(n - 1)}{n!} = \\sum \\frac{n}{n!} = \\sum \\frac{1}{n!} = e$.',
        correction: ['$\\sum \\frac{n(n - 1)}{n!} = \\sum \\frac{n}{n!} = \\sum \\frac{1}{n!} = e$ et $n^2 = n(n - 1) + n$.', `$k = 2 \\times ${a} + ${b} + ${par(c)} = ${k}$`],
      };
    },
    (rng) => vraiFauxBanque(rng, SERIES),
  ],
  'l2-integrale-riemann': [
    (rng, level) => {
      const alpha = rng.pick(level === 1 ? [F(1, 2), F(2), F(3), F(1)] : [F(1, 2), F(3, 2), F(1, 3), F(4, 3), F(2), F(1), F(5, 2), F(2, 3)]);
      const enZero = rng.next() < 0.5;
      const a = alpha.n / alpha.d;
      const conv = enZero ? a < 1 : a > 1;
      const powT = alpha.d === 1 ? (alpha.n === 1 ? 't' : `t^{${alpha.n}}`) : alpha.d === 2 && alpha.n === 1 ? '\\sqrt{t}' : `t^{${tex(alpha)}}`;
      return {
        prompt: `Quelle est la nature de $\\displaystyle\\int_${enZero ? '0^1' : '1^{+\\infty}'} \\frac{dt}{${powT}}$ ?`,
        answer: fixedChoice(NATURE, conv ? 0 : 1),
        hint: enZero ? 'En $0$ : $\\int_0^1 \\frac{dt}{t^\\alpha}$ converge si et seulement si $\\alpha < 1$.' : 'En $+\\infty$ : $\\int_1^{+\\infty} \\frac{dt}{t^\\alpha}$ converge si et seulement si $\\alpha > 1$.',
        correction: [`$\\alpha = ${tex(alpha)}$ : ${conv ? 'convergente' : 'divergente'}.`],
      };
    },
    (rng) => vraiFauxBanque(rng, INTEGRALES),
  ],
  'l2-integrale-puissance': [
    // Question inverse : quel exposant donne une valeur imposée ?
    (rng) => {
      const v = rng.pick([F(1), F(2), F(3), F(1, 2), F(1, 3), F(3, 2), F(2, 3), F(4)]);
      // ∫₁^∞ t^{-α} dt = 1/(α − 1) = v ⇔ α = 1 + 1/v
      const alpha = add(F(1), div(F(1), v));
      return {
        prompt: `Pour quelle valeur de $\\alpha > 1$ a-t-on $\\displaystyle\\int_1^{+\\infty} \\frac{dt}{t^\\alpha} = ${tex(v)}$ ?`,
        answer: numF(alpha),
        hint: '$\\int_1^{+\\infty} t^{-\\alpha}\\,dt = \\frac{1}{\\alpha - 1}$ pour $\\alpha > 1$.',
        correction: [`$\\frac{1}{\\alpha - 1} = ${tex(v)}$ donne $\\alpha - 1 = ${tex(div(F(1), v))}$`, `$\\alpha = ${tex(alpha)}$`],
      };
    },
    (rng) => qcmBanque(rng, INTEGRALES),
  ],
  'l2-integrale-exponentielle': [
    // Fonction Gamma : ∫₀^∞ tⁿ e^{−at} dt = n!/a^{n+1}.
    (rng, level) => {
      const n = rng.int(1, level + 1);
      const a = rng.int(1, 3);
      const v = F(fact(n), a ** (n + 1));
      const tn = n === 1 ? 't' : `t^{${n}}`;
      return {
        prompt: `Calcule $\\displaystyle\\int_0^{+\\infty} ${tn}\\,e^{-${a === 1 ? '' : a}t}\\,dt$.`,
        answer: numF(v),
        hint: `Pose $u = ${a === 1 ? '' : a}t$ et utilise $\\int_0^{+\\infty} u^n e^{-u}\\,du = n!$.`,
        correction: [`$\\displaystyle\\int_0^{+\\infty} t^{${n}}e^{-${a}t}\\,dt = \\frac{${n}!}{${a}^{${n + 1}}} = ${tex(v)}$`],
      };
    },
    (rng) => vraiFauxBanque(rng, INTEGRALES),
  ],
  'l2-integrale-rationnelle': [
    // ∫₀^∞ dt/(t + a)^m = 1/((m − 1)a^{m−1}).
    (rng) => {
      const a = rng.int(1, 4);
      const m = rng.int(2, 4);
      const v = F(1, (m - 1) * a ** (m - 1));
      return {
        prompt: `Calcule $\\displaystyle\\int_0^{+\\infty} \\frac{dt}{(t + ${a})^{${m}}}$.`,
        answer: numF(v),
        hint: `Une primitive de $(t + a)^{-m}$ est $\\frac{(t + a)^{1 - m}}{1 - m}$.`,
        correction: [`$\\left[\\frac{-1}{${m - 1}(t + ${a})^{${m - 1}}}\\right]_0^{+\\infty} = \\frac{1}{${m - 1} \\times ${a}^{${m - 1}}} = ${tex(v)}$`],
      };
    },
    (rng) => qcmBanque(rng, INTEGRALES, true),
  ],
  'l2-integrale-nature-equivalent': [(rng) => vraiFauxBanque(rng, INTEGRALES), (rng) => qcmBanque(rng, INTEGRALES)],
  'l2-limite-simple': [
    // f_n(x) = (a n x² + b)/(c n + d) → a x²/c.
    (rng) => {
      const a = rng.nonZero(-3, 3);
      const b = rng.int(1, 5);
      const c = rng.int(1, 4);
      const d = rng.int(1, 5);
      const x = rng.int(-3, 3);
      const v = F(a * x * x, c);
      return {
        prompt: `$f_n(x) = \\dfrac{${a === 1 ? '' : a === -1 ? '-' : a}nx^2 + ${b}}{${c === 1 ? '' : c}n + ${d}}$ converge simplement sur $\\mathbb{R}$ vers $f$. Calcule $f(${x})$.`,
        answer: numF(v),
        hint: 'À $x$ fixé, divise numérateur et dénominateur par $n$.',
        correction: [`$f(x) = ${a === c ? '' : a === -c ? '-' : tex(F(a, c))}x^2$`, `$f(${x}) = ${tex(v)}$`],
      };
    },
    (rng) => vraiFauxBanque(rng, FONCTIONS),
  ],
  'l2-convergence-uniforme': [(rng) => vraiFauxBanque(rng, FONCTIONS), (rng) => qcmBanque(rng, FONCTIONS)],
  'l2-norme-infinie': [
    // sup de xⁿ(1 − x) sur [0, 1], atteint en n/(n + 1).
    (rng, level) => {
      const n = rng.int(1, level + 2);
      const v = F(n ** n, (n + 1) ** (n + 1));
      return {
        prompt: `$f_n(x) = x^{${n}}(1 - x)$ sur $[0\\,;\\,1]$. Calcule $\\|f_{${n}}\\|_\\infty$.`.replace('x^{1}', 'x'),
        answer: numF(v),
        hint: '$f_n\'(x) = x^{n-1}\\big(n - (n + 1)x\\big)$ : le maximum est atteint en $\\frac{n}{n + 1}$.',
        correction: [`Maximum en $x = \\frac{${n}}{${n + 1}}$`, `$\\|f_{${n}}\\|_\\infty = \\left(\\frac{${n}}{${n + 1}}\\right)^{${n}}\\frac{1}{${n + 1}} = ${tex(v)}$`],
      };
    },
    (rng) => qcmBanque(rng, FONCTIONS, true),
  ],
  'l2-convergence-normale': [
    // Σ x^n sur [−a, a] : normale si et seulement si a < 1 ; Σ cos(nx)/n^α : si et seulement si α > 1.
    (rng) => {
      const a = rng.pick([F(1, 2), F(2, 3), F(1), F(3, 4), F(3, 2)]);
      const ok = a.n < a.d;
      return {
        prompt: `La série de fonctions $\\displaystyle\\sum_{n\\geq 0} x^n$ converge-t-elle normalement sur $\\left[-${tex(a)}\\,;\\,${tex(a)}\\right]$ ?`,
        answer: fixedChoice(['Oui', 'Non'], ok ? 0 : 1),
        hint: 'Calcule $\\|x \\mapsto x^n\\|_\\infty$ sur l’intervalle, puis étudie la série de ces normes.',
        correction: [`$\\sup |x^n| = \\left(${tex(a)}\\right)^n$`, ok ? 'Série géométrique de raison $< 1$ : convergence normale.' : 'Ces normes ne tendent pas vers $0$ : pas de convergence normale.'],
      };
    },
    (rng) => vraiFauxBanque(rng, FONCTIONS),
  ],
  'l2-limite-integrale': [
    // Piège : n xⁿ → 0 simplement sur [0, 1[ mais son intégrale tend vers 1.
    (rng, level) => {
      const a = rng.nonZero(-3, 3);
      const b = rng.int(0, 3);
      const k = rng.int(1, level + 1);
      const v = add(F(a), F(b, k + 1));
      return {
        prompt: `Calcule $\\displaystyle\\lim_{n\\to+\\infty} \\int_0^1 \\left(${a === 1 ? '' : a === -1 ? '-' : a}n\\,x^n${b === 0 ? '' : ` + ${b === 1 ? '' : b}x^{${k}}`}\\right)dx$.`.replace('x^{1}', 'x'),
        answer: numF(v),
        hint: 'Calcule l’intégrale exactement avant de passer à la limite : ici, on ne peut pas intervertir.',
        correction: [`$\\displaystyle\\int_0^1 n\\,x^n\\,dx = \\frac{n}{n + 1} \\to 1$ (alors que $n\\,x^n \\to 0$ pour $x < 1$ : la convergence n’est pas uniforme).`, `Limite : $${a} + \\frac{${b}}{${k + 1}} = ${tex(v)}$`],
      };
    },
    (rng) => vraiFauxBanque(rng, FONCTIONS),
  ],
  'l2-rayon-convergence': [
    // Σ aⁿ x^{2n} : R = 1/√a ; Σ (aⁿ + bⁿ) xⁿ : R = 1/max.
    (rng) => {
      const k = rng.int(2, 5);
      if (rng.next() < 0.5)
        return {
          prompt: `Calcule le rayon de convergence de $\\displaystyle\\sum_{n\\geq 0} ${k * k}^n x^{2n}$.`,
          answer: numF(F(1, k)),
          hint: 'Pose $X = x^2$ : la série $\\sum a^n X^n$ converge pour $|X| < \\frac{1}{a}$.',
          correction: [`Convergence pour $${k * k}x^2 < 1$, soit $|x| < \\frac{1}{${k}}$.`, `$R = \\frac{1}{${k}}$`],
        };
      const j = rng.int(1, k - 1);
      return {
        prompt: `Calcule le rayon de convergence de $\\displaystyle\\sum_{n\\geq 0} (${j === 1 ? '1' : `${j}^n`} + ${k}^n)\\,x^n$.`,
        answer: numF(F(1, k)),
        hint: 'Le terme le plus grand impose le rayon : $j^n + k^n \\sim k^n$ si $j < k$.',
        correction: [`$${j}^n + ${k}^n \\sim ${k}^n$`, `$R = \\frac{1}{${k}}$`],
      };
    },
    (rng) => vraiFauxBanque(rng, ENTIERES),
  ],
  'l2-somme-serie-entiere': [
    // Σ (n+1)(n+2)/2 xⁿ = 1/(1 − x)³.
    (rng) => {
      const x = petite(rng);
      const v = div(F(1), fpow(sub(F(1), x), 3));
      return {
        prompt: `On admet que $\\displaystyle\\sum_{n\\geq 0} \\frac{(n + 1)(n + 2)}{2}x^n = \\frac{1}{(1 - x)^3}$ pour $|x| < 1$. Calcule $\\displaystyle\\sum_{n=0}^{+\\infty} \\frac{(n + 1)(n + 2)}{2}${ptex(x)}^n$.`,
        answer: numF(v),
        hint: 'Remplace $x$ par la valeur donnée dans la somme.',
        correction: [`$\\frac{1}{(1 - ${ptex(x)})^3} = \\frac{1}{\\left(${tex(sub(F(1), x))}\\right)^3} = ${tex(v)}$`],
      };
    },
    (rng) => qcmBanque(rng, ENTIERES),
  ],
  'l2-dse-coefficient': [
    // Produit de Cauchy : coefficient de xⁿ dans 1/((1 − ax)(1 − bx)).
    (rng, level) => {
      const a = rng.nonZero(-3, 3);
      let b = rng.nonZero(-3, 3);
      if (b === a) b = -a;
      const n = rng.int(2, level + 2);
      let c = 0;
      for (let k = 0; k <= n; k++) c += a ** k * b ** (n - k);
      const f = (t: number) => (t === 1 ? '1 - x' : t === -1 ? '1 + x' : t > 0 ? `1 - ${t}x` : `1 + ${-t}x`);
      return {
        prompt: `Donne le coefficient de $x^{${n}}$ dans le développement en série entière de $\\dfrac{1}{(${f(a)})(${f(b)})}$.`,
        answer: num(c),
        hint: 'Produit de Cauchy de $\\sum a^kx^k$ et $\\sum b^kx^k$ : le coefficient de $x^n$ est $\\sum_{k=0}^{n} a^kb^{n-k}$.',
        correction: [`$\\displaystyle\\sum_{k=0}^{${n}} (${a})^k(${b})^{${n}-k} = ${c}$`],
      };
    },
    (rng) => vraiFauxBanque(rng, ENTIERES),
  ],
  'l2-dse-usuels': [(rng) => vraiFauxBanque(rng, ENTIERES), (rng) => qcmBanque(rng, ENTIERES, true)],
  'l2-convergence-point': [
    // Bord du disque : Σ (x/R)ⁿ / n^α en x = ±R.
    (rng) => {
      const R = rng.int(1, 4);
      const alpha = rng.pick([0, 1, 2]);
      const signe = rng.sign();
      const conv = signe > 0 ? alpha > 1 : alpha > 0;
      const nPow = alpha === 0 ? '' : alpha === 1 ? 'n' : `n^{${alpha}}`;
      const den = [nPow, R === 1 ? '' : `${R}^n`].filter(Boolean).join('\\,');
      const coef = den === '' ? 'x^n' : `\\frac{x^n}{${den}}`;
      return {
        prompt: `La série entière $\\displaystyle\\sum_{n\\geq 1} ${coef}$ a pour rayon $R = ${R}$. Que fait-elle en $x = ${signe * R}$ ?`,
        answer: fixedChoice(NATURE, conv ? 0 : 1),
        hint: 'Remplace $x$ par sa valeur et reconnais une série de Riemann ou une série alternée.',
        correction: [
          alpha === 0
            ? 'Le terme général ne tend pas vers $0$ : divergence grossière.'
            : signe > 0
              ? `On obtient $\\sum \\frac{1}{n^{${alpha}}}$ : ${conv ? 'convergente' : 'divergente'} (Riemann).`
              : `On obtient $\\sum \\frac{(-1)^n}{n^{${alpha}}}$ : convergente (série alternée).`,
        ],
      };
    },
    (rng) => qcmBanque(rng, ENTIERES),
  ],
};

export const BANQUES_ANALYSE_L2 = { SERIES, INTEGRALES, FONCTIONS, ENTIERES };
