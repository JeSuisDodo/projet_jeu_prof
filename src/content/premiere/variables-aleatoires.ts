import { frac, fracLatex } from '../../exercises/fraction';
import { paren } from '../../exercises/latex';
import type { Rng } from '../../exercises/rng';
import type { Skill } from '../../exercises/types';
import { enrich, variant } from '../../exercises/variantes';
import type { ChapterDef } from '../types';
import { dec } from './probabilites-conditionnelles';

/** 1re spécialité, chapitre « Variables aléatoires réelles » : loi, espérance, variance. */

/** Une loi : valeurs distinctes croissantes et probabilités en centièmes, de somme 100. */
function law(rng: Rng, size: number, range: number): { xs: number[]; ps: number[] } {
  const xs = rng.shuffle(Array.from({ length: 2 * range + 1 }, (_, i) => i - range)).slice(0, size).sort((a, b) => a - b);
  const cuts = rng.shuffle(Array.from({ length: 19 }, (_, i) => 5 * (i + 1))).slice(0, size - 1).sort((a, b) => a - b);
  const ps = [...cuts, 100].map((c, i) => c - (i === 0 ? 0 : cuts[i - 1]));
  return { xs, ps };
}

function lawTable(xs: number[], ps: (number | null)[]): string {
  const cols = 'c|'.repeat(xs.length);
  const row2 = ps.map((p) => (p === null ? 'p' : dec(p))).join(' & ');
  return `\\begin{array}{|c|${cols}} \\hline x_i & ${xs.join(' & ')} \\\\ \\hline P(X = x_i) & ${row2} \\\\ \\hline \\end{array}`;
}

const sizeFor = (level: number) => (level === 1 ? 3 : level === 2 ? 4 : 5);
const espSum = (xs: number[], ps: number[]) => xs.reduce((s, x, i) => s + x * ps[i], 0);

const manquante: Skill = {
  id: '1re-va-loi-manquante',
  name: 'Compléter une loi de probabilité',
  generate(rng, level) {
    const { xs, ps } = law(rng, sizeFor(level), 6);
    const hole = rng.int(0, xs.length - 1);
    const shown = ps.map((p, i) => (i === hole ? null : p));
    const known = ps.filter((_, i) => i !== hole);
    return {
      skill: this.id,
      level,
      prompt: `La variable aléatoire $X$ suit la loi : $${lawTable(xs, shown)}$ Que vaut $p$ ?`,
      answer: { kind: 'number', value: frac(ps[hole], 100) },
      hint: 'La somme des probabilités d’une loi vaut $1$.',
      correction: [`$p = 1 - (${known.map((p) => dec(p)).join(' + ')}) = ${dec(ps[hole])}$`],
    };
  },
};

const probabilite: Skill = {
  id: '1re-va-probabilite',
  name: 'Calculer une probabilité avec une loi',
  generate(rng, level) {
    const { xs, ps } = law(rng, sizeFor(level), 6);
    const k = rng.pick(xs.slice(1));
    const [op, keep] = rng.pick([
      ['\\geq', (x: number) => x >= k],
      ['<', (x: number) => x < k],
      ...(level > 1 ? ([['>', (x: number) => x > k], ['\\leq', (x: number) => x <= k]] as const) : []),
    ] as const);
    const idx = xs.map((x, i) => (keep(x) ? i : -1)).filter((i) => i >= 0);
    const total = idx.reduce((s, i) => s + ps[i], 0);
    return {
      skill: this.id,
      level,
      prompt: `La variable aléatoire $X$ suit la loi : $${lawTable(xs, ps)}$ Calcule $P(X ${op} ${k})$.`,
      answer: { kind: 'number', value: frac(total, 100) },
      hint: 'Additionne les probabilités des valeurs qui vérifient la condition.',
      correction: [`$P(X ${op} ${k}) = ${idx.length ? idx.map((i) => `P(X = ${xs[i]})`).join(' + ') : '0'} = ${idx.length > 1 ? `${idx.map((i) => dec(ps[i])).join(' + ')} = ` : ''}${dec(total)}$`],
    };
  },
};

const esperance: Skill = {
  id: '1re-va-esperance',
  name: 'Calculer une espérance',
  generate(rng, level) {
    const { xs, ps } = law(rng, sizeFor(level), level === 1 ? 5 : 10);
    const e = espSum(xs, ps);
    return {
      skill: this.id,
      level,
      prompt: `La variable aléatoire $X$ suit la loi : $${lawTable(xs, ps)}$ Calcule $E(X)$.`,
      answer: { kind: 'number', value: frac(e, 100) },
      hint: '$E(X) = \\sum x_i \\, P(X = x_i)$.',
      correction: [`$E(X) = ${xs.map((x, i) => `${paren(x)} \\times ${dec(ps[i])}`).join(' + ')} = ${dec(e)}$`],
    };
  },
};

const variance: Skill = {
  id: '1re-va-variance',
  name: 'Calculer une variance',
  generate(rng, level) {
    // Des valeurs proches de 0 et des probabilités en dixièmes ou quarts pour garder des calculs raisonnables.
    const { xs } = law(rng, level === 3 ? 3 : 2, 4);
    const ps = xs.length === 2 ? rng.pick([[50, 50], [25, 75], [75, 25], [20, 80], [40, 60]]) : rng.pick([[25, 50, 25], [20, 30, 50], [50, 25, 25], [10, 60, 30]]);
    const e = espSum(xs, ps); // en centièmes
    const e2 = xs.reduce((s, x, i) => s + x * x * ps[i], 0); // en centièmes
    // V = E(X²) − E(X)² = e2/100 − e²/10000.
    const v = frac(100 * e2 - e * e, 10000);
    return {
      skill: this.id,
      level,
      prompt: `La variable aléatoire $X$ suit la loi : $${lawTable(xs, ps)}$ Calcule $V(X)$.`,
      answer: { kind: 'number', value: v },
      hint: 'Calcule $E(X)$, puis $V(X) = E(X^2) - E(X)^2$ (ou $\\sum P(X = x_i)\\,(x_i - E(X))^2$).',
      correction: [
        `$E(X) = ${dec(e)}$ et $E(X^2) = ${xs.map((x, i) => `${paren(x)}^2 \\times ${dec(ps[i])}`).join(' + ')} = ${dec(e2)}$`,
        `$V(X) = ${dec(e2)} - ${e < 0 ? `(${dec(e)})` : dec(e)}^2 = ${dec(100 * e2 - e * e, 10000)}$`,
      ],
    };
  },
};

const lineaire: Skill = {
  id: '1re-va-linearite',
  name: 'Utiliser la linéarité de l’espérance',
  generate(rng, level) {
    const a = rng.nonZero(-5, 5);
    const b = rng.nonZero(-10, 10);
    const e = rng.int(-20, 20);
    const v = rng.int(1, 9);
    const y = `${a === 1 ? '' : a === -1 ? '-' : a}X ${b < 0 ? '-' : '+'} ${Math.abs(b)}`;
    const askVariance = level === 3 && rng.next() < 0.5;
    const value = askVariance ? a * a * v : a * e + b;
    return {
      skill: this.id,
      level,
      prompt: `On sait que $E(X) = ${e}$ et $V(X) = ${v}$. On pose $Y = ${y}$. Calcule $${askVariance ? 'V(Y)' : 'E(Y)'}$.`,
      answer: { kind: 'number', value: frac(value) },
      hint: askVariance ? '$V(aX + b) = a^2\\,V(X)$ : la constante ne change pas la dispersion.' : '$E(aX + b) = a\\,E(X) + b$.',
      correction: [askVariance ? `$V(Y) = ${paren(a)}^2 \\times ${v} = ${value}$` : `$E(Y) = ${a} \\times ${paren(e)} ${b < 0 ? '-' : '+'} ${Math.abs(b)} = ${value}$`],
    };
  },
};

const jeu: Skill = {
  id: '1re-va-jeu',
  name: 'Étudier un jeu',
  generate(rng, level) {
    // Une urne de n boules : r rouges (gain g1), v vertes (gain g2), le reste perd tout.
    const n = rng.pick([10, 12, 20]);
    const r = rng.int(1, 3);
    const v = rng.int(2, 5);
    const g1 = rng.pick([10, 15, 20, 30]);
    const g2 = rng.pick([2, 3, 4, 5]);
    const fair = frac(r * g1 + v * g2, n);
    const mise = rng.int(1, 5);
    const asksFair = level === 3;
    const value = asksFair ? fair : frac(r * g1 + v * g2 - n * mise, n);
    const rules = `Une urne contient ${n} boules : ${r} rouge${r > 1 ? 's' : ''}, ${v} vertes et ${n - r - v} noires. On tire une boule au hasard : une rouge rapporte ${g1} €, une verte ${g2} €, une noire rien.`;
    return {
      skill: this.id,
      level,
      prompt: asksFair
        ? `${rules} Quelle mise (en €) faut-il demander pour que le jeu soit équitable ? (valeur exacte)`
        : `${rules} La partie coûte ${mise} €. Soit $G$ le gain algébrique du joueur (gain moins mise). Calcule $E(G)$ (valeur exacte).`,
      answer: { kind: 'number', value },
      hint: asksFair ? 'Le jeu est équitable quand la mise est égale à l’espérance de ce que l’on gagne.' : 'Écris la loi de $G$ (chaque gain moins la mise), puis calcule son espérance.',
      correction: asksFair
        ? [`Espérance du gain avant mise : $${g1} \\times \\frac{${r}}{${n}} + ${g2} \\times \\frac{${v}}{${n}} = ${fracLatex(fair)}$`, `Le jeu est équitable pour une mise de $${fracLatex(fair)}$ €.`]
        : [
            `$G$ prend les valeurs $${g1 - mise}$, $${g2 - mise}$ et $${-mise}$ avec les probabilités $\\frac{${r}}{${n}}$, $\\frac{${v}}{${n}}$ et $\\frac{${n - r - v}}{${n}}$.`,
            `$E(G) = ${g1 - mise} \\times \\frac{${r}}{${n}} + ${paren(g2 - mise)} \\times \\frac{${v}}{${n}} + (${-mise}) \\times \\frac{${n - r - v}}{${n}} = ${fracLatex(value)}$`,
          ],
    };
  },
};

const binom = (n: number, k: number): number => (k === 0 ? 1 : (binom(n, k - 1) * (n - k + 1)) / k);

const manquanteVariantes = [
  variant('valeur-inconnue', (rng, level) => {
    const { xs, ps } = law(rng, sizeFor(level), 6);
    const hole = rng.int(0, xs.length - 1);
    const e = espSum(xs, ps);
    const cols = 'c|'.repeat(xs.length);
    const table = `\\begin{array}{|c|${cols}} \\hline x_i & ${xs.map((x, i) => (i === hole ? 'a' : x)).join(' & ')} \\\\ \\hline P(X = x_i) & ${ps.map((p) => dec(p)).join(' & ')} \\\\ \\hline \\end{array}`;
    return {
      prompt: `La variable aléatoire $X$ suit la loi : $${table}$ On sait que $E(X) = ${dec(e)}$. Que vaut $a$ ?`,
      answer: { kind: 'number', value: frac(xs[hole]) },
      hint: 'Écris $E(X)$ avec l’inconnue $a$, puis résous l’équation.',
      correction: [`$${xs.map((x, i) => `${i === hole ? 'a' : paren(x)} \\times ${dec(ps[i])}`).join(' + ')} = ${dec(e)}$`, `$${dec(ps[hole])}\\,a = ${dec(e - (e - xs[hole] * ps[hole]))}$, donc $a = ${xs[hole]}$.`],
    };
  }),
  variant('proportionnelles', (rng, level) => {
    const size = sizeFor(level);
    const xs = Array.from({ length: size }, (_, i) => i + 1);
    const cs = xs.map(() => rng.int(1, 4));
    const total = cs.reduce((a, b) => a + b, 0);
    const cols = 'c|'.repeat(size);
    const table = `\\begin{array}{|c|${cols}} \\hline x_i & ${xs.join(' & ')} \\\\ \\hline P(X = x_i) & ${cs.map((c) => (c === 1 ? 'p' : `${c}p`)).join(' & ')} \\\\ \\hline \\end{array}`;
    const value = frac(1, total);
    return {
      prompt: `La variable aléatoire $X$ suit la loi : $${table}$ Que vaut $p$ ? (Fraction.)`,
      answer: { kind: 'number', value },
      hint: 'La somme des probabilités vaut $1$.',
      correction: [`$${cs.map((c) => (c === 1 ? 'p' : `${c}p`)).join(' + ')} = ${total}p = 1$, donc $p = ${fracLatex(value)}$.`],
    };
  }),
];

const probabiliteVariantes = [
  variant('somme-de-deux-des', (rng) => {
    const k = rng.int(3, 11);
    const op = rng.pick(['=', '\\geq', '\\leq'] as const);
    const ok = (s: number) => (op === '=' ? s === k : op === '\\geq' ? s >= k : s <= k);
    let count = 0;
    for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (ok(a + b)) count++;
    const value = frac(count, 36);
    return {
      prompt: `On lance deux dés équilibrés à six faces et on note $S$ la somme des résultats. Calcule $P(S ${op} ${k})$ (fraction).`,
      answer: { kind: 'number', value },
      hint: 'Il y a $36$ issues équiprobables : dresse un tableau à double entrée.',
      correction: [`$${count}$ issues sur $36$ conviennent : $P(S ${op} ${k}) = \\frac{${count}}{36}${value.d !== 36 ? ` = ${fracLatex(value)}` : ''}$`],
    };
  }),
  variant('pieces', (rng) => {
    const n = rng.pick([3, 4]);
    const k = rng.int(0, n);
    const auMoins = rng.next() < 0.5 && k > 0;
    let count = 0;
    for (let j = auMoins ? k : k; j <= (auMoins ? n : k); j++) count += binom(n, j);
    const value = frac(count, 2 ** n);
    return {
      prompt: `On lance ${n} fois une pièce équilibrée et on note $X$ le nombre de « pile ». Calcule $P(X ${auMoins ? '\\geq' : '='} ${k})$ (fraction).`,
      answer: { kind: 'number', value },
      hint: `Il y a $2^${n} = ${2 ** n}$ issues équiprobables ; compte celles qui conviennent (un arbre aide).`,
      correction: [`$${count}$ issues sur $${2 ** n}$ conviennent, donc la probabilité vaut $${fracLatex(value)}$.`],
    };
  }),
];

const esperanceVariantes = [
  variant('de', (rng) => {
    const g = rng.int(5, 20);
    const h = rng.int(1, 5);
    const a = rng.int(1, 6);
    const value = frac(g + 2 * h - 3 * a, 6);
    return {
      prompt: `On lance un dé équilibré. Avec un 6, on gagne $${g}$ € ; avec un 4 ou un 5, on gagne $${h}$ € ; sinon, on perd $${a}$ €. Soit $X$ le gain algébrique. Calcule $E(X)$ (fraction).`,
      answer: { kind: 'number', value },
      hint: 'Écris la loi de $X$ : trois valeurs, de probabilités $\\frac{1}{6}$, $\\frac{2}{6}$ et $\\frac{3}{6}$.',
      correction: [`$E(X) = ${g} \\times \\frac{1}{6} + ${h} \\times \\frac{2}{6} + (${-a}) \\times \\frac{3}{6} = ${fracLatex(value)}$`],
    };
  }),
  variant('assurance', (rng) => {
    const prime = 10 * rng.int(15, 60);
    const p1 = rng.int(1, 9);
    const c1 = 1000 * rng.int(1, 5);
    const p2 = rng.int(1, 4);
    const c2 = 1000 * rng.int(6, 20);
    // Gain de l'assureur, probabilités en centièmes.
    const e = 100 * prime - p1 * c1 - p2 * c2;
    return {
      prompt: `Un assureur encaisse une prime de $${prime}$ € par contrat. Il rembourse $${c1}$ € avec une probabilité de $${p1}\\,\\%$ et $${c2}$ € avec une probabilité de $${p2}\\,\\%$ ; le reste du temps, il ne rembourse rien. Quelle est l'espérance de son gain par contrat, en € ?`,
      answer: { kind: 'number', value: frac(e, 100) },
      hint: 'Gain = prime moins remboursement : calcule l’espérance des remboursements.',
      correction: [`$E(G) = ${prime} - ${c1} \\times ${dec(p1)} - ${c2} \\times ${dec(p2)} = ${dec(e)}$`],
    };
  }),
];

const varianceVariantes = [
  variant('ecart-type', (rng) => {
    const m = rng.int(-10, 10);
    const a = rng.int(1, 9);
    return {
      prompt: `La variable aléatoire $X$ prend les valeurs $${m - a}$ et $${m + a}$, chacune avec la probabilité $\\frac{1}{2}$. Calcule son écart type $\\sigma(X)$.`,
      answer: { kind: 'number', value: frac(a) },
      hint: 'Calcule $E(X)$, puis $V(X) = \\sum P(X = x_i)(x_i - E(X))^2$ et $\\sigma(X) = \\sqrt{V(X)}$.',
      correction: [`$E(X) = ${m}$, $V(X) = \\frac{1}{2}\\times ${a}^2 + \\frac{1}{2}\\times ${a}^2 = ${a * a}$, donc $\\sigma(X) = ${a}$.`],
    };
  }),
  variant('koenig', (rng) => {
    const e = rng.int(-8, 8);
    const v = rng.int(1, 30);
    return {
      prompt: `On sait que $E(X) = ${e}$ et $E(X^2) = ${v + e * e}$. Calcule $V(X)$.`,
      answer: { kind: 'number', value: frac(v) },
      hint: '$V(X) = E(X^2) - E(X)^2$.',
      correction: [`$V(X) = ${v + e * e} - ${paren(e)}^2 = ${v}$`],
    };
  }),
];

const lineaireVariantes = [
  variant('retrouver-a', (rng) => {
    const a = rng.nonZero(-5, 5);
    const b = rng.int(-10, 10);
    const e = rng.nonZero(-9, 9);
    return {
      prompt: `On sait que $E(X) = ${e}$. On pose $Y = aX ${b < 0 ? '-' : '+'} ${Math.abs(b)}$ et on sait que $E(Y) = ${a * e + b}$. Que vaut $a$ ?`,
      answer: { kind: 'number', value: frac(a) },
      hint: '$E(aX + b) = a\\,E(X) + b$ : résous l’équation d’inconnue $a$.',
      correction: [`$${e}a ${b < 0 ? '-' : '+'} ${Math.abs(b)} = ${a * e + b} \\iff a = ${a}$`],
    };
  }),
  variant('temperatures', (rng) => {
    const e = rng.int(-10, 35);
    const v = rng.int(1, 25);
    const askV = rng.next() < 0.5;
    // F = 1,8 C + 32 ; E en dixièmes, V en centièmes.
    const value = askV ? frac(324 * v, 100) : frac(18 * e + 320, 10);
    return {
      prompt: `Une température $C$ en degrés Celsius a pour espérance $${e}$ et pour variance $${v}$. En degrés Fahrenheit, elle vaut $F = 1{,}8\\,C + 32$. Calcule $${askV ? 'V(F)' : 'E(F)'}$.`,
      answer: { kind: 'number', value },
      hint: askV ? '$V(aX + b) = a^2\\,V(X)$.' : '$E(aX + b) = a\\,E(X) + b$.',
      correction: [askV ? `$V(F) = 1{,}8^2 \\times ${v} = ${dec(324 * v, 100)}$` : `$E(F) = 1{,}8 \\times ${paren(e)} + 32 = ${dec(18 * e + 320, 10)}$`],
    };
  }),
];

const jeuVariantes = [
  variant('gain-equitable', (rng) => {
    const n = rng.pick([10, 12, 20]);
    const v = rng.int(2, 5);
    const g2 = rng.pick([2, 3, 4, 5]);
    const g1 = rng.int(5, 40);
    const mise = frac(g1 + v * g2, n);
    return {
      prompt: `Une urne contient ${n} boules : 1 rouge, ${v} vertes et ${n - 1 - v} noires. On tire une boule : une verte rapporte $${g2}$ €, une noire rien. La partie coûte $${fracLatex(mise)}$ €. Combien doit rapporter la boule rouge pour que le jeu soit équitable ?`,
      answer: { kind: 'number', value: frac(g1) },
      hint: 'Équitable : l’espérance des gains (avant mise) égale la mise.',
      correction: [`$\\frac{g}{${n}} + \\frac{${v}\\times ${g2}}{${n}} = ${fracLatex(mise)} \\iff g = ${g1}$`],
    };
  }),
  variant('favorable', (rng) => {
    const n = rng.pick([10, 12, 20]);
    const r = rng.int(1, 3);
    const v = rng.int(2, 5);
    const g1 = rng.pick([10, 15, 20, 30]);
    const g2 = rng.pick([2, 3, 4, 5]);
    const total = r * g1 + v * g2;
    const mise = rng.next() < 0.2 && total % n === 0 ? total / n : rng.int(1, 8);
    const e = total - n * mise;
    const options = ['favorable au joueur', 'défavorable au joueur', 'équitable'];
    return {
      prompt: `Une urne contient ${n} boules : ${r} rouge${r > 1 ? 's' : ''}, ${v} vertes et ${n - r - v} noires. Une rouge rapporte $${g1}$ €, une verte $${g2}$ €, une noire rien ; la partie coûte $${mise}$ €. Le jeu est :`,
      answer: { kind: 'choice', options, correct: e > 0 ? 0 : e < 0 ? 1 : 2 },
      hint: 'Calcule l’espérance du gain algébrique et regarde son signe.',
      correction: [`$E(G) = \\frac{${r}\\times ${g1} + ${v}\\times ${g2}}{${n}} - ${mise} = ${fracLatex(frac(e, n))}$ : le jeu est ${options[e > 0 ? 0 : e < 0 ? 1 : 2]}.`],
    };
  }),
];

export const VARIABLES_ALEATOIRES: ChapterDef = {
  id: '1re-variables-aleatoires',
  title: 'Variables aléatoires',
  region: 'Plaine des Dés',
  theme: 'prairie',
  terrain: 'riviere',
  skills: [
    enrich(manquante, manquanteVariantes),
    enrich(probabilite, probabiliteVariantes),
    enrich(esperance, esperanceVariantes),
    enrich(variance, varianceVariantes),
    enrich(lineaire, lineaireVariantes),
    enrich(jeu, jeuVariantes),
  ],
  creatures: [
    {
      id: '1re-loilou',
      name: 'Loilou',
      description: 'Un louveteau qui range chaque valeur avec sa probabilité, et vérifie que le total fait 1.',
      skills: ['1re-va-loi-manquante', '1re-va-probabilite'],
      look: { shape: 'bete', hue: 60, symbol: 'X' },
    },
    {
      id: '1re-desmoiselle',
      name: 'Desmoiselle',
      description: 'Une libellule qui roule sur des dés et pèse chaque résultat.',
      skills: ['1re-va-probabilite', '1re-va-loi-manquante'],
      look: { shape: 'insecte', hue: 45, symbol: '6' },
    },
    {
      id: '1re-esperoule',
      name: 'Espéroule',
      description: 'Une boule qui roule toujours vers la moyenne : à long terme, elle sait ce qu’on gagne.',
      skills: ['1re-va-esperance', '1re-va-linearite'],
      look: { shape: 'blob', hue: 75, symbol: 'E' },
    },
    {
      id: '1re-dispersol',
      name: 'Dispersol',
      description: 'Un tournesol qui étale ses graines plus ou moins loin de son cœur : c’est sa variance.',
      skills: ['1re-va-variance', '1re-va-esperance'],
      look: { shape: 'plante', hue: 52, symbol: 'σ' },
    },
    {
      id: '1re-misaigle',
      name: 'Misaigle',
      description: 'Un aigle joueur qui ne mise que si le jeu est équitable.',
      skills: ['1re-va-jeu', '1re-va-linearite'],
      look: { shape: 'oiseau', hue: 35, symbol: '€' },
    },
  ],
  boss: {
    id: '1re-aleator',
    name: 'Aléator',
    description: 'Le gardien de la plaine, un colosse en forme de dé géant dont chaque face cache une valeur.',
    skills: ['1re-va-loi-manquante', '1re-va-probabilite', '1re-va-esperance', '1re-va-variance', '1re-va-linearite', '1re-va-jeu'],
    look: { shape: 'golem', hue: 55, symbol: '?' },
  },
};
