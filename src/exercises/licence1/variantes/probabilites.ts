import { type Fait, type Variantes, qcmBanque, vraiFaux, vraiFauxBanque } from '../../licenceVariantes';
import { F, add, binom, div, fact, fixedChoice, fpow, mul, num, numF, pairOf, sub, tex } from '../util';

/** Variantes du chapitre « Probabilités » (feuilles bibmath « Dénombrement », « Probabilités sur un univers fini », « Variables aléatoires finies »). */

const pct = (n: number) => F(n, 100);
const DICE = Array.from({ length: 36 }, (_, i) => [Math.floor(i / 6) + 1, (i % 6) + 1]);

const PROBAS: Fait[] = [
  { s: '$P_A(B) = P_B(A)$ pour tous événements $A, B$ de probabilité non nulle.', v: false, why: '$P_A(B) = \\frac{P(A \\cap B)}{P(A)}$ et $P_B(A) = \\frac{P(A \\cap B)}{P(B)}$ diffèrent si $P(A) \\neq P(B)$.' },
  { s: 'Deux événements incompatibles de probabilités non nulles ne sont pas indépendants.', v: true, why: '$P(A \\cap B) = 0 \\neq P(A)P(B)$.' },
  { s: 'Si $A$ et $B$ sont indépendants, $A$ et $\\bar B$ le sont aussi.', v: true, why: '$P(A \\cap \\bar B) = P(A) - P(A)P(B) = P(A)P(\\bar B)$.' },
  { s: '$P(A \\cup B) = P(A) + P(B)$ pour tous événements $A, B$.', v: false, why: 'Il faut retirer $P(A \\cap B)$ ; l’égalité n’est vraie que pour des événements incompatibles.' },
  { s: '$E(X + Y) = E(X) + E(Y)$ pour toutes variables aléatoires $X, Y$.', v: true, why: 'L’espérance est linéaire, sans hypothèse d’indépendance.' },
  { s: '$V(X + Y) = V(X) + V(Y)$ pour toutes variables aléatoires $X, Y$.', v: false, why: 'Il faut ajouter $2\\operatorname{Cov}(X, Y)$ ; l’égalité vaut pour des variables indépendantes.' },
  { s: '$V(aX + b) = a^2V(X)$.', v: true, why: 'Ajouter une constante ne change pas la dispersion ; multiplier par $a$ la multiplie par $a^2$.' },
  { s: '$V(-X) = -V(X)$.', v: false, why: '$V(-X) = (-1)^2V(X) = V(X)$ : une variance est positive.' },
  { s: '$E(XY) = E(X)E(Y)$ pour toutes variables aléatoires $X, Y$.', v: false, why: 'Avec $Y = X$ de loi uniforme sur $\\{-1, 1\\}$ : $E(X^2) = 1 \\neq 0 = E(X)^2$.' },
  { s: 'Les événements $A_1, \\dots, A_n$ forment un système complet si, et seulement si, $P(A_1) + \\dots + P(A_n) = 1$.', v: false, why: 'Il faut qu’ils soient deux à deux incompatibles et de réunion $\\Omega$ ; la somme des probabilités ne suffit pas.' },
];

export const PROBABILITES_VARIANTES: Variantes = {
  'l1-proba-denombrement': [
    // Somme de deux dés.
    (rng) => {
      const s = rng.int(2, 12);
      const count = DICE.filter(([a, b]) => a + b === s).length;
      return {
        prompt: `On lance deux dés équilibrés à six faces. Quelle est la probabilité que la somme vaille $${s}$ ?`,
        answer: numF(F(count, 36)),
        hint: 'Il y a $36$ couples équiprobables : compte ceux qui conviennent.',
        correction: [`$${count}$ couples donnent $${s}$ : $\\frac{${count}}{36} = ${tex(F(count, 36))}$`],
      };
    },
    // Anniversaires : mois tous différents.
    (rng) => {
      const n = rng.int(2, 5);
      const p = F(fact(12) / fact(12 - n), 12 ** n);
      return {
        prompt: `$${n}$ personnes sont nées un mois choisi au hasard, uniformément et indépendamment. Quelle est la probabilité qu’elles soient toutes nées des mois différents ?`,
        answer: numF(p),
        hint: 'Cas favorables : arrangements de $n$ mois parmi $12$ ; cas possibles : $12^n$.',
        correction: [`$\\dfrac{12 \\times 11 ${n > 2 ? '\\times \\dots ' : ''}\\times ${13 - n}}{12^{${n}}} = ${tex(p)}$`.replace('12 \\times 11 \\times 11', '12 \\times 11')],
      };
    },
    // Jeu de 32 cartes.
    (rng) => {
      const k = rng.int(2, 3);
      const kind = rng.pick([
        ['des as', 4],
        ['des cœurs', 8],
        ['des figures (valet, dame ou roi)', 12],
      ] as const);
      const p = F(binom(kind[1], k), binom(32, k));
      return {
        prompt: `On tire simultanément $${k}$ cartes d’un jeu de $32$. Quelle est la probabilité de n’obtenir que ${kind[0]} ?`,
        answer: numF(p),
        hint: 'Rapport de deux coefficients binomiaux.',
        correction: [`$\\dfrac{\\binom{${kind[1]}}{${k}}}{\\binom{32}{${k}}} = \\dfrac{${binom(kind[1], k)}}{${binom(32, k)}} = ${tex(p)}$`],
      };
    },
  ],
  'l1-proba-bayes': [
    // Test médical.
    (rng) => {
      const prev = pct(rng.pick([1, 2, 5, 10]));
      const sens = pct(rng.pick([90, 95, 99]));
      const spec = pct(rng.pick([90, 95, 98, 99]));
      const pos = add(mul(prev, sens), mul(sub(F(1), prev), sub(F(1), spec)));
      const post = div(mul(prev, sens), pos);
      return {
        prompt: `Une maladie touche $${tex(prev)}$ de la population. Un test est positif chez un malade avec probabilité $${tex(sens)}$, et négatif chez un non-malade avec probabilité $${tex(spec)}$. Une personne est testée positive : quelle est la probabilité qu’elle soit malade ?`,
        answer: numF(post),
        hint: 'Bayes : $P_T(M) = \\frac{P(M)P_M(T)}{P(T)}$, avec $P(T)$ par les probabilités totales.',
        correction: [`$P(T) = ${tex(prev)}\\times${tex(sens)} + ${tex(sub(F(1), prev))}\\times${tex(sub(F(1), spec))} = ${tex(pos)}$`, `$P_T(M) = ${tex(post)}$ : souvent bien plus faible qu’on ne le croit !`],
      };
    },
    // Deux urnes.
    (rng) => {
      const [r1, b1, r2, b2] = [rng.int(1, 6), rng.int(1, 6), rng.int(1, 6), rng.int(1, 6)];
      const pr = add(mul(F(1, 2), F(r1, r1 + b1)), mul(F(1, 2), F(r2, r2 + b2)));
      const post = div(mul(F(1, 2), F(r1, r1 + b1)), pr);
      const ask = rng.next() < 0.5;
      return {
        prompt: `L’urne $U_1$ contient $${r1}$ rouges et $${b1}$ bleues, l’urne $U_2$ contient $${r2}$ rouges et $${b2}$ bleues. On choisit une urne à pile ou face puis on tire une boule. ${ask ? 'Quelle est la probabilité de tirer une rouge ?' : 'La boule est rouge : quelle est la probabilité qu’elle vienne de $U_1$ ?'}`,
        answer: numF(ask ? pr : post),
        hint: 'Arbre : probabilités totales, puis Bayes.',
        correction: [`$P(R) = \\frac{1}{2}\\times\\frac{${r1}}{${r1 + b1}} + \\frac{1}{2}\\times\\frac{${r2}}{${r2 + b2}} = ${tex(pr)}$`, ...(ask ? [] : [`$P_R(U_1) = \\frac{\\frac{1}{2}\\times\\frac{${r1}}{${r1 + b1}}}{${tex(pr)}} = ${tex(post)}$`])],
      };
    },
    (rng) => vraiFauxBanque(rng, PROBAS),
  ],
  'l1-proba-independance': [
    // Indépendance sur deux dés, par dénombrement.
    (rng) => {
      const events: [string, (a: number, b: number) => boolean][] = [
        ['« le premier dé est pair »', (a) => a % 2 === 0],
        ['« la somme est paire »', (a, b) => (a + b) % 2 === 0],
        ['« la somme vaut $7$ »', (a, b) => a + b === 7],
        ['« le second dé donne $6$ »', (_, b) => b === 6],
        ['« la somme vaut $8$ »', (a, b) => a + b === 8],
        ['« les deux dés sont égaux »', (a, b) => a === b],
        ['« le premier dé donne $1$ »', (a) => a === 1],
      ];
      const [A, B] = rng.shuffle(events).slice(0, 2);
      const pa = DICE.filter(([a, b]) => A[1](a, b)).length;
      const pb = DICE.filter(([a, b]) => B[1](a, b)).length;
      const pab = DICE.filter(([a, b]) => A[1](a, b) && B[1](a, b)).length;
      const indep = pab * 36 === pa * pb;
      return {
        prompt: `On lance deux dés équilibrés. Les événements $A$ = ${A[0]} et $B$ = ${B[0]} sont-ils indépendants ?`,
        answer: fixedChoice(['Indépendants', 'Pas indépendants'], indep ? 0 : 1),
        hint: 'Compare $P(A \\cap B)$ et $P(A)P(B)$ en comptant les couples.',
        correction: [`$P(A) = \\frac{${pa}}{36}$, $P(B) = \\frac{${pb}}{36}$, $P(A \\cap B) = \\frac{${pab}}{36}$`, indep ? '$P(A \\cap B) = P(A)P(B)$ : indépendants.' : '$P(A \\cap B) \\neq P(A)P(B)$ : pas indépendants.'],
      };
    },
    // Question inverse : P(B) à partir de P(A ∪ B).
    (rng) => {
      const pa = F(rng.int(1, 4), 5);
      const pb = F(rng.int(1, 3), 4);
      const pu = sub(add(pa, pb), mul(pa, pb));
      return {
        prompt: `$A$ et $B$ sont indépendants, $P(A) = ${tex(pa)}$ et $P(A \\cup B) = ${tex(pu)}$. Calcule $P(B)$.`,
        answer: numF(pb),
        hint: '$P(A \\cup B) = P(A) + P(B) - P(A)P(B) = P(A) + P(B)(1 - P(A))$.',
        correction: [`$P(B) = \\dfrac{${tex(pu)} - ${tex(pa)}}{1 - ${tex(pa)}} = ${tex(pb)}$`],
      };
    },
    (rng) => qcmBanque(rng, PROBAS, rng.next() < 0.5),
  ],
  'l1-esperance-variance': [
    // Jeu de hasard : gain moyen.
    (rng) => {
      const n = rng.pick([6, 8, 10, 12]);
      const win = rng.int(2, 6);
      const g = rng.int(5, 20);
      const c = rng.int(1, 5);
      const E = sub(mul(F(win, n), F(g)), F(c));
      return {
        prompt: `On paie $${c}$ € pour lancer un dé équilibré à $${n}$ faces. Si le résultat est parmi les $${win}$ plus grands, on gagne $${g}$ €. Quelle est l’espérance du gain net (en €) ?`,
        answer: numF(E),
        hint: 'Gain net : $G = g\\mathbb{1}_{\\text{gagné}} - c$, et $E(G) = g\\,P(\\text{gagné}) - c$.',
        correction: [`$E(G) = ${g}\\times\\frac{${win}}{${n}} - ${c} = ${tex(E)}$`, E.n > 0 ? 'Le jeu est favorable au joueur.' : E.n === 0 ? 'Le jeu est équitable.' : 'Le jeu est défavorable au joueur.'],
      };
    },
    // Linéarité et variance de aX + b.
    (rng) => {
      const a = rng.nonZero(-4, 4);
      const b = rng.int(-6, 6);
      const ex = rng.int(-5, 5);
      const vx = rng.int(1, 9);
      const askV = rng.next() < 0.5;
      return {
        prompt: `$E(X) = ${ex}$ et $V(X) = ${vx}$. Calcule ${askV ? `$V(${a === 1 ? '' : a === -1 ? '-' : a}X ${b < 0 ? '-' : '+'} ${Math.abs(b)})$` : `$E(${a === 1 ? '' : a === -1 ? '-' : a}X ${b < 0 ? '-' : '+'} ${Math.abs(b)})$`}.`,
        answer: num(askV ? a * a * vx : a * ex + b),
        hint: '$E(aX + b) = aE(X) + b$ et $V(aX + b) = a^2V(X)$.',
        correction: [askV ? `$V = ${a}^2 \\times ${vx} = ${a * a * vx}$`.replace(`${a}^2`, a < 0 ? `(${a})^2` : `${a}^2`) : `$E = ${a}\\times${ex < 0 ? `(${ex})` : ex} ${b < 0 ? '-' : '+'} ${Math.abs(b)} = ${a * ex + b}$`],
      };
    },
    // Dé équilibré : E et V.
    (rng) => {
      const n = rng.int(2, 12);
      const askV = rng.next() < 0.5;
      const E = F(n + 1, 2);
      const V = F(n * n - 1, 12);
      return {
        prompt: `$X$ suit la loi uniforme sur $\\{1, \\dots, ${n}\\}$. Calcule ${askV ? '$V(X)$' : '$E(X)$'}.`,
        answer: numF(askV ? V : E),
        hint: '$E(X) = \\frac{n+1}{2}$ et $V(X) = \\frac{n^2 - 1}{12}$.',
        correction: [askV ? `$V(X) = \\frac{${n}^2 - 1}{12} = ${tex(V)}$` : `$E(X) = \\frac{${n} + 1}{2} = ${tex(E)}$`],
      };
    },
  ],
  'l1-loi-binomiale': [
    // QCM au hasard.
    (rng) => {
      const n = rng.int(4, 8);
      const c = rng.pick([2, 4]);
      const k = rng.int(0, Math.min(3, n));
      const p = mul(F(binom(n, k)), mul(fpow(F(1, c), k), fpow(F(c - 1, c), n - k)));
      return {
        prompt: `Un QCM a $${n}$ questions à $${c}$ réponses, dont une seule juste. Un candidat répond au hasard. Quelle est la probabilité qu’il ait exactement $${k}$ bonne${k > 1 ? 's' : ''} réponse${k > 1 ? 's' : ''} ?`,
        answer: numF(p),
        hint: `Le nombre de bonnes réponses suit $\\mathcal{B}\\left(${n}, \\frac{1}{${c}}\\right)$.`,
        correction: [`$\\binom{${n}}{${k}}\\left(\\frac{1}{${c}}\\right)^{${k}}\\left(\\frac{${c - 1}}{${c}}\\right)^{${n - k}} = ${tex(p)}$`],
      };
    },
    // Paramètres à partir de E et V.
    (rng) => {
      const n = rng.int(4, 40);
      const p = rng.pick([F(1, 2), F(1, 4), F(1, 5), F(3, 4), F(2, 5)]);
      const E = mul(F(n), p);
      const V = mul(E, sub(F(1), p));
      return {
        prompt: `$X$ suit une loi binomiale $\\mathcal{B}(n, p)$ avec $E(X) = ${tex(E)}$ et $V(X) = ${tex(V)}$. Donne $n$ et $p$.`,
        answer: pairOf(n, p, ['n', 'p']),
        hint: '$\\frac{V(X)}{E(X)} = 1 - p$.',
        correction: [`$1 - p = \\frac{${tex(V)}}{${tex(E)}} = ${tex(sub(F(1), p))}$, donc $p = ${tex(p)}$ et $n = \\frac{E(X)}{p} = ${n}$.`],
      };
    },
    // Nombre minimal d'essais.
    (rng) => {
      const q = rng.pick([F(1, 2), F(2, 3), F(3, 4), F(5, 6), F(9, 10)]);
      const target = rng.pick([F(9, 10), F(19, 20), F(99, 100)]);
      let n = 1;
      while (1 - (q.n / q.d) ** n < target.n / target.d) n++;
      const p = sub(F(1), q);
      return {
        prompt: `Une épreuve réussit avec probabilité $${tex(p)}$. Combien faut-il au minimum d’essais indépendants pour que la probabilité d’au moins une réussite dépasse $${tex(target)}$ ?`,
        answer: num(n),
        hint: '$P(\\text{au moins une}) = 1 - (1 - p)^n$ : résous $(1 - p)^n \\leq 1 - \\text{seuil}$.',
        correction: [`$1 - \\left(${tex(q)}\\right)^{${n - 1}} < ${tex(target)} \\leq 1 - \\left(${tex(q)}\\right)^{${n}}$`, `Il faut $n = ${n}$ essais.`],
      };
    },
    // Vrai/faux : reconnaître une loi binomiale.
    (rng) => {
      const pool: [string, boolean, string][] = [
        ['On lance $10$ fois une pièce équilibrée ; $X$ compte les piles. $X$ suit une loi binomiale.', true, 'Répétition de $10$ épreuves de Bernoulli indépendantes et identiques : $\\mathcal{B}(10, \\frac{1}{2})$.'],
        ['On tire sans remise $3$ boules d’une urne de $5$ rouges et $5$ bleues ; $X$ compte les rouges. $X$ suit une loi binomiale.', false, 'Sans remise, les tirages ne sont pas indépendants : c’est une loi hypergéométrique.'],
        ['On tire avec remise $3$ boules d’une urne de $5$ rouges et $5$ bleues ; $X$ compte les rouges. $X$ suit une loi binomiale.', true, 'Avec remise, les tirages sont indépendants : $\\mathcal{B}(3, \\frac{1}{2})$.'],
        ['On lance un dé jusqu’à obtenir $6$ ; $X$ compte les lancers. $X$ suit une loi binomiale.', false, 'Le nombre d’épreuves n’est pas fixé : c’est une loi géométrique.'],
        ['$X$ suit $\\mathcal{B}(n, p)$ ; alors $n - X$ suit $\\mathcal{B}(n, 1 - p)$.', true, '$n - X$ compte les échecs.'],
      ];
      const [s, v, why] = rng.pick(pool);
      return vraiFaux(s, v, [why], 'Une loi binomiale compte les succès dans un nombre fixé d’épreuves de Bernoulli indépendantes et de même paramètre.');
    },
  ],
};

export const BANQUES_PROBABILITES = { PROBAS };
