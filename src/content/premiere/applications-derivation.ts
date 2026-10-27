import { frac, fracLatex } from '../../exercises/fraction';
import { paren, sumLatex } from '../../exercises/latex';
import type { Rng } from '../../exercises/rng';
import { type Answer, type Level, type Skill, makeChoice } from '../../exercises/types';
import { enrich, variant } from '../../exercises/variantes';
import type { ChapterDef } from '../types';
import { type Poly, polyDeriv, polyEval, polyTex } from './poly';

/** 1re spécialité, chapitre « Applications de la dérivation » : variations, extremums, optimisation. */

interface Cubic {
  f: Poly;
  /** f'(x) = 3k(x - α)(x - β), α < β. */
  k: 1 | -1;
  alpha: number;
  beta: number;
}

/** Fonction de degré 3 dont la dérivée a deux racines entières α < β (de même parité, pour des coefficients entiers). */
function cubic(rng: Rng, level: Level): Cubic {
  const k = level === 3 ? rng.sign() : 1;
  let alpha: number;
  let beta: number;
  if (level === 1) {
    beta = rng.int(1, 3);
    alpha = -beta;
  } else {
    alpha = rng.int(-4, 2);
    beta = alpha + 2 * rng.int(1, 3);
  }
  const r = rng.int(-6, 6);
  return { f: [r, 3 * k * alpha * beta, (-3 * k * (alpha + beta)) / 2, k], k, alpha, beta };
}

const derivLines = (c: Cubic) => [
  `$f'(x) = ${polyTex(polyDeriv(c.f))} = ${c.k === 1 ? '3' : '-3'}${c.alpha === 0 ? 'x' : `(x ${c.alpha < 0 ? '+' : '-'} ${Math.abs(c.alpha)})`}${c.beta === 0 ? 'x' : `(x ${c.beta < 0 ? '+' : '-'} ${Math.abs(c.beta)})`}$`,
];

const pointsCritiques: Skill = {
  id: '1re-points-critiques',
  name: 'Résoudre f′(x) = 0',
  generate(rng, level) {
    const c = cubic(rng, level);
    const d = polyDeriv(c.f);
    return {
      skill: this.id,
      level,
      prompt: `Soit $f(x) = ${polyTex(c.f)}$. Résous l'équation $f'(x) = 0$.`,
      answer: { kind: 'set', values: [frac(c.alpha), frac(c.beta)] },
      hint: 'Dérive, puis résous l’équation du second degré obtenue (discriminant ou factorisation).',
      correction: [
        `$f'(x) = ${polyTex(d)}$`,
        `$\\Delta = ${paren(d[1])}^2 - 4\\times ${paren(d[2])}\\times ${paren(d[0])} = ${d[1] * d[1] - 4 * d[2] * d[0]}$, d'où deux solutions : $${c.alpha}$ et $${c.beta}$.`,
      ],
    };
  },
};

const interval = (lo: string, hi: string, open: [boolean, boolean]) => `${open[0] ? ']' : '['}${lo}\\,;\\,${hi}${open[1] ? '[' : ']'}`;
const pattern = (up: boolean, a: number, b: number) => {
  const w = (u: boolean) => (u ? 'croissante' : 'décroissante');
  return `$f$ est ${w(up)} sur $${interval('-\\infty', String(a), [true, false])}$, ${w(!up)} sur $${interval(String(a), String(b), [false, false])}$ et ${w(up)} sur $${interval(String(b), '+\\infty', [false, true])}$.`;
};

const variations: Skill = {
  id: '1re-variations',
  name: 'Déterminer les variations',
  generate(rng, level) {
    const c = cubic(rng, level);
    const up = c.k === 1;
    const good = pattern(up, c.alpha, c.beta);
    const decoys = [pattern(!up, c.alpha, c.beta), pattern(up, -c.beta, -c.alpha), pattern(up, c.alpha - 1, c.beta + 1), `$f$ est ${up ? 'croissante' : 'décroissante'} sur $\\mathbb{R}$.`];
    return {
      skill: this.id,
      level,
      prompt: `Soit $f(x) = ${polyTex(c.f)}$. Quelles sont ses variations ?`,
      answer: makeChoice(rng, good, decoys, () => pattern(!up, c.alpha + 1, c.beta + 2)),
      hint: 'Étudie le signe de $f\'(x)$ : un trinôme est du signe de son coefficient dominant à l’extérieur de ses racines.',
      correction: [
        ...derivLines(c),
        `$f'(x)$ est du signe de $${3 * c.k}$ à l'extérieur des racines $${c.alpha}$ et $${c.beta}$, et du signe contraire entre elles.`,
        good,
      ],
    };
  },
};

const extremum: Skill = {
  id: '1re-extremum-local',
  name: 'Trouver un extremum local',
  generate(rng, level) {
    const c = cubic(rng, level);
    const wantMax = rng.next() < 0.5;
    // k = 1 : maximum en α, minimum en β ; k = -1 : l'inverse.
    const at = (wantMax ? c.k === 1 : c.k === -1) ? c.alpha : c.beta;
    const value = polyEval(c.f, at);
    const word = wantMax ? 'maximum' : 'minimum';
    const askValue = level > 1;
    return {
      skill: this.id,
      level,
      prompt: `Soit $f(x) = ${polyTex(c.f)}$. ${askValue ? `Quelle est la valeur du ${word} local de $f$ ?` : `En quel nombre $f$ admet-elle un ${word} local ?`}`,
      answer: { kind: 'number', value: frac(askValue ? value : at) },
      hint: `Cherche où $f'$ s'annule en changeant de signe ; un ${word} correspond à un passage ${wantMax ? 'de + à −' : 'de − à +'}.`,
      correction: [
        ...derivLines(c),
        `$f'$ change de signe ${wantMax ? 'de + à −' : 'de − à +'} en $${at}$ : $f$ y admet un ${word} local.`,
        ...(askValue ? [`$f(${at}) = ${value}$`] : []),
      ],
    };
  },
};

const composee: Skill = {
  id: '1re-derivee-composee',
  name: 'Dériver f(ax + b)',
  generate(rng, level) {
    const a = rng.nonZero(-5, 5);
    const b = rng.nonZero(-6, 6);
    const inner = sumLatex([[a, 'x'], [b, '']]);
    const kind = level === 1 ? 'power' : rng.pick(['power', 'sqrt', 'inv'] as const);
    let f: string;
    let good: string;
    let decoys: string[];
    let rule: string;
    if (kind === 'power') {
      const n = level === 1 ? 2 : rng.pick([2, 3, 4]);
      f = `(${inner})^${n}`;
      good = `${n * a}(${inner})${n - 1 > 1 ? `^${n - 1}` : ''}`;
      decoys = [`${n}(${inner})${n - 1 > 1 ? `^${n - 1}` : ''}`, `${a}(${inner})^${n}`, `${n * a}(${inner})^${n}`];
      rule = `Si $g(x) = f(ax + b)$, alors $g'(x) = a\\,f'(ax + b)$ ; ici $f(X) = X^${n}$ et $f'(X) = ${n}X${n - 1 > 1 ? `^${n - 1}` : ''}$.`;
    } else if (kind === 'sqrt') {
      f = `\\sqrt{${inner}}`;
      good = `\\frac{${a}}{2\\sqrt{${inner}}}`;
      decoys = [`\\frac{1}{2\\sqrt{${inner}}}`, `\\frac{${a}}{\\sqrt{${inner}}}`, `${a}\\sqrt{${inner}}`];
      rule = 'Avec $f(X) = \\sqrt{X}$, $f\'(X) = \\frac{1}{2\\sqrt{X}}$, et on multiplie par $a$.';
    } else {
      f = `\\frac{1}{${inner}}`;
      good = `${a > 0 ? '-' : ''}\\frac{${Math.abs(a)}}{(${inner})^2}`;
      decoys = [`-\\frac{1}{(${inner})^2}`, `${a < 0 ? '-' : ''}\\frac{${Math.abs(a)}}{(${inner})^2}`, `\\frac{${a}}{${inner}}`];
      rule = 'Avec $f(X) = \\frac{1}{X}$, $f\'(X) = -\\frac{1}{X^2}$, et on multiplie par $a$.';
    }
    return {
      skill: this.id,
      level,
      prompt: `Soit $g(x) = ${f}$. Quelle est sa fonction dérivée ?`,
      answer: makeChoice(rng, `$g'(x) = ${good}$`, decoys.map((d) => `$g'(x) = ${d}$`), () => `$g'(x) = ${rng.int(2, 9)}(${inner})$`),
      hint: '$(f(ax + b))\' = a \\times f\'(ax + b)$ : n’oublie pas le facteur $a$.',
      correction: [rule, `$g'(x) = ${good}$`],
    };
  },
};

const optimisation: Skill = {
  id: '1re-optimisation',
  name: 'Résoudre un problème d’optimisation',
  generate(rng, level) {
    if (level < 3) {
      // Bénéfice B(x) = -a x² + b x - c, maximal en x = b / (2a).
      const a = level === 1 ? 1 : rng.pick([1, 2, 5]);
      const best = rng.int(2, 12);
      const b = 2 * a * best;
      const c = rng.int(5, 40);
      return {
        skill: this.id,
        level,
        prompt: `Une entreprise fabrique $x$ centaines d'objets par jour. Son bénéfice, en milliers d'euros, est $B(x) = ${sumLatex([[-a, 'x^2'], [b, 'x'], [-c, '']])}$. Combien de centaines d'objets doit-elle fabriquer pour que le bénéfice soit maximal ?`,
        answer: { kind: 'number', value: frac(best) },
        hint: 'Le maximum est atteint là où $B\'(x)$ s’annule en passant de + à −.',
        correction: [`$B'(x) = ${sumLatex([[-2 * a, 'x'], [b, '']])}$`, `$B'(x) = 0 \\iff x = \\frac{${b}}{${2 * a}} = ${best}$ ; $B'$ est positive avant, négative après : le bénéfice est maximal pour $x = ${best}$.`],
      };
    }
    // Volume ou bénéfice de degré 3 : maximum en β sur [0 ; +∞[ (k = -1, α < 0 < β).
    const beta = rng.int(2, 6);
    const alpha = -beta - 2 * rng.int(0, 2);
    const k = -1;
    const f: Poly = [0, 3 * k * alpha * beta, (-3 * k * (alpha + beta)) / 2, k];
    return {
      skill: this.id,
      level,
      prompt: `Pour $x \\geq 0$, le bénéfice d'un artisan est $B(x) = ${polyTex(f)}$ (en centaines d'euros, $x$ en dizaines d'objets). Pour quelle valeur de $x$ est-il maximal ?`,
      answer: { kind: 'number', value: frac(beta) },
      hint: 'Résous $B\'(x) = 0$ et garde la solution positive où $B\'$ passe de + à −.',
      correction: [
        `$B'(x) = ${polyTex(polyDeriv(f))} = -3(x ${alpha < 0 ? '+' : '-'} ${Math.abs(alpha)})(x - ${beta})$`,
        `Sur $[0\\,;\\,+\\infty[$, $B'(x) > 0$ avant $${beta}$ et $B'(x) < 0$ après : le bénéfice est maximal pour $x = ${beta}$.`,
      ],
    };
  },
};

const vraiFaux = (b: boolean): Answer => ({ kind: 'choice', options: ['Vrai', 'Faux'], correct: b ? 0 : 1 });
const intervalle = (p: number, q: number) => `[${p}\\,;\\,${q}]`;

const pointsCritiquesVariantes = [
  variant('parametre', (rng) => {
    // f(x) = x³ + m x² + c x, f'(r) = 3r² + 2mr + c = 0.
    const r = rng.nonZero(-3, 3);
    const m = rng.nonZero(-4, 4);
    const c = -3 * r * r - 2 * m * r;
    return {
      prompt: `On pose $f(x) = x^3 + mx^2 ${c < 0 ? '-' : '+'} ${Math.abs(c)}x$, où $m$ est un réel. Pour quelle valeur de $m$ la tangente à la courbe de $f$ au point d'abscisse $${r}$ est-elle horizontale ?`,
      answer: { kind: 'number', value: frac(m) },
      hint: `Tangente horizontale : $f'(${r}) = 0$. Exprime $f'(x)$ en fonction de $m$.`,
      correction: [`$f'(x) = 3x^2 + 2mx ${c < 0 ? '-' : '+'} ${Math.abs(c)}$`, `$f'(${r}) = ${3 * r * r} ${2 * r < 0 ? '-' : '+'} ${Math.abs(2 * r)}m ${c < 0 ? '-' : '+'} ${Math.abs(c)} = 0 \\iff m = ${m}$`],
    };
  }),
  variant('nombre-tangentes-horizontales', (rng, level) => {
    // f'(x) = 3x² + 2bx + c : on choisit le signe du discriminant.
    const cas = rng.int(0, 2);
    const b = 3 * rng.int(-2, 2);
    let c: number;
    if (cas === 2) c = rng.int(-9, (b * b) / 3 - 1);
    else if (cas === 1) c = (b * b) / 3;
    else c = rng.int((b * b) / 3 + 1, (b * b) / 3 + 9);
    const p: Poly = [rng.int(-6, 6), c, b, 1];
    const d = polyDeriv(p);
    const delta = d[1] * d[1] - 4 * d[2] * d[0];
    return {
      prompt: `Soit $f(x) = ${polyTex(level === 3 ? p.map((v) => -v) : p)}$. En combien de points la courbe de $f$ admet-elle une tangente horizontale ?`,
      answer: { kind: 'number', value: frac(cas) },
      hint: 'Compte les solutions de $f\'(x) = 0$ avec le discriminant.',
      correction: [`$f'(x) = ${polyTex(level === 3 ? d.map((v) => -v) : d)}$`, `$\\Delta = ${delta}$ : ${delta > 0 ? 'deux solutions' : delta === 0 ? 'une seule solution' : 'aucune solution'}, donc ${cas} point${cas > 1 ? 's' : ''}.`],
    };
  }),
  variant('vrai-faux-extremum', (rng) => {
    const a = rng.int(-3, 3);
    const b = rng.int(-5, 5);
    const cube = rng.next() < 0.5;
    // (x - a)³ + b ou (x - a)² + b, développés.
    const p: Poly = cube ? [-a * a * a + b, 3 * a * a, -3 * a, 1] : [a * a + b, -2 * a, 1];
    return {
      prompt: `Soit $f(x) = ${polyTex(p)}$. On a $f'(${a}) = 0$. Vrai ou faux : $f$ admet un extremum local en $${a}$.`,
      answer: vraiFaux(!cube),
      hint: 'Un extremum demande que $f\'$ change de signe, pas seulement qu’elle s’annule.',
      correction: [
        `$f'(x) = ${polyTex(polyDeriv(p))} = ${cube ? '3' : '2'}${a === 0 ? 'x' : `(x ${a < 0 ? '+' : '-'} ${Math.abs(a)})`}${cube ? '^2' : ''}$`,
        cube ? `$f'(x) \\geq 0$ des deux côtés de $${a}$ : $f$ est croissante, pas d'extremum. C'est faux.` : `$f'$ passe de − à + en $${a}$ : minimum local. C'est vrai.`,
      ],
    };
  }),
];

const variationsVariantes = [
  variant('croissante-sur', (rng, level) => {
    const c = cubic(rng, level);
    const p = rng.int(-6, 4);
    const q = p + rng.int(1, 3);
    const inc = (x: number) => polyEval(polyDeriv(c.f), x) >= 0;
    // f' est un trinôme : il suffit de regarder les bornes et le sommet s'il est dans l'intervalle.
    const sommet = (c.alpha + c.beta) / 2;
    const ok = inc(p) && inc(q) && (sommet < p || sommet > q || inc(sommet));
    return {
      prompt: `Soit $f(x) = ${polyTex(c.f)}$. Vrai ou faux : $f$ est croissante sur $${intervalle(p, q)}$.`,
      answer: vraiFaux(ok),
      hint: `Étudie le signe de $f'$ sur l'intervalle : ses racines sont-elles dedans ?`,
      correction: [...derivLines(c), ok ? `$f'(x) \\geq 0$ sur $${intervalle(p, q)}$ : c'est vrai.` : `$f'$ prend des valeurs négatives sur $${intervalle(p, q)}$ : c'est faux.`],
    };
  }),
  variant('second-degre', (rng, level) => {
    const a = level === 1 ? rng.pick([1, -1]) : rng.nonZero(-3, 3);
    const h = rng.int(-5, 5);
    const p: Poly = [rng.int(-8, 8), -2 * a * h, a];
    const up = a > 0;
    const inter = (left: boolean) => (left ? `$\\mathopen{]}-\\infty\\,;\\,${h}]$` : `$[${h}\\,;\\,+\\infty\\mathclose{[}$`);
    const good = inter(!up);
    return {
      prompt: `Soit $f(x) = ${polyTex(p)}$. Sur quel intervalle $f$ est-elle croissante ?`,
      answer: makeChoice(rng, good, [inter(up), `$[${-h}\\,;\\,+\\infty\\mathclose{[}$`, `$\\mathopen{]}-\\infty\\,;\\,${-h}]$`, '$\\mathbb{R}$'], () => `$[${h + 1}\\,;\\,+\\infty\\mathclose{[}$`),
      hint: '$f\'(x)$ est affine : cherche où elle est positive.',
      correction: [`$f'(x) = ${polyTex(polyDeriv(p))}$, qui s'annule en $${h}$.`, `$f'(x) \\geq 0$ ${up ? `pour $x \\geq ${h}$` : `pour $x \\leq ${h}$`} : $f$ est croissante sur ${good}.`],
    };
  }),
  variant('signe-derivee', (rng, level) => {
    const c = cubic(rng, level);
    let x0: number;
    do x0 = rng.int(c.alpha - 3, c.beta + 3);
    while (x0 === c.alpha || x0 === c.beta);
    const v = polyEval(polyDeriv(c.f), x0);
    const good = v > 0 ? 'croissante' : 'décroissante';
    return {
      prompt: `Soit $f(x) = ${polyTex(c.f)}$. On calcule $f'(${x0}) = ${v}$. Au voisinage de $${x0}$, $f$ est :`,
      answer: { kind: 'choice', options: ['croissante', 'décroissante', 'constante'], correct: v > 0 ? 0 : 1 },
      hint: 'Le signe du nombre dérivé donne le sens de variation autour du point.',
      correction: [`$f'(${x0}) ${v > 0 ? '>' : '<'} 0$ : $f$ est ${good} au voisinage de $${x0}$.`],
    };
  }),
];

const extremumVariantes = [
  variant('nature', (rng) => {
    const a = rng.int(-4, 4);
    const kind = rng.int(0, 2);
    const k = rng.pick([1, 2, 3]) * rng.sign();
    const b = a + rng.int(1, 4);
    const facteur = (r: number) => (r === 0 ? 'x' : `(x ${r < 0 ? '+' : '-'} ${Math.abs(r)})`);
    // 0 : k(x - a)(x - b) → en a : max si k > 0 ; 2 : k(x - a)² → ni l'un ni l'autre.
    const fp = kind === 2 ? `${k === 1 ? '' : k === -1 ? '-' : k}${facteur(a)}^2` : `${k === 1 ? '' : k === -1 ? '-' : k}${facteur(a)}${facteur(b)}`;
    const correct = kind === 2 ? 2 : k > 0 ? 0 : 1;
    return {
      prompt: `La dérivée d'une fonction $f$ est $f'(x) = ${fp}$. En $x = ${a}$, la fonction $f$ admet :`,
      answer: { kind: 'choice', options: ['un maximum local', 'un minimum local', 'ni maximum ni minimum'], correct },
      hint: `Regarde si $f'$ change de signe en $${a}$, et dans quel sens.`,
      correction: [
        kind === 2
          ? `$f'(x)$ garde le signe de $${k}$ des deux côtés de $${a}$ : pas de changement de signe, pas d'extremum.`
          : `Avant $${a}$, $f'(x)$ est du signe de $${k}$ ; entre $${a}$ et $${b}$, du signe contraire. $f'$ passe ${k > 0 ? 'de + à −' : 'de − à +'} : ${k > 0 ? 'maximum' : 'minimum'} local.`,
      ],
    };
  }),
  variant('second-degre', (rng, level) => {
    const a = level === 1 ? rng.pick([1, -1]) : rng.nonZero(-3, 3);
    const h = rng.int(-5, 5);
    const k = rng.int(-9, 9);
    const p: Poly = [a * h * h + k, -2 * a * h, a];
    const word = a > 0 ? 'minimum' : 'maximum';
    return {
      prompt: `Soit $f(x) = ${polyTex(p)}$. Quelle est la valeur du ${word} de $f$ sur $\\mathbb{R}$ ?`,
      answer: { kind: 'number', value: frac(k) },
      hint: 'Trouve où $f\'$ s’annule, puis calcule l’image de ce nombre.',
      correction: [`$f'(x) = ${polyTex(polyDeriv(p))}$ s'annule en $${h}$.`, `Le ${word} vaut $f(${h}) = ${k}$.`],
    };
  }),
  variant('sur-un-segment', (rng, level) => {
    const c = cubic(rng, level);
    const p = rng.int(c.alpha - 2, c.alpha);
    const q = rng.int(c.beta, c.beta + 2);
    const wantMax = rng.next() < 0.5;
    const cands = [p, q, c.alpha, c.beta].map((x) => polyEval(c.f, x));
    const value = wantMax ? Math.max(...cands) : Math.min(...cands);
    return {
      prompt: `Soit $f(x) = ${polyTex(c.f)}$. Quel est le ${wantMax ? 'maximum' : 'minimum'} de $f$ sur l'intervalle $${intervalle(p, q)}$ ?`,
      answer: { kind: 'number', value: frac(value) },
      hint: 'Compare les extremums locaux et les valeurs aux bornes de l’intervalle.',
      correction: [...derivLines(c), `$f(${p}) = ${cands[0]}$, $f(${c.alpha}) = ${cands[2]}$, $f(${c.beta}) = ${cands[3]}$, $f(${q}) = ${cands[1]}$.`, `Le ${wantMax ? 'maximum' : 'minimum'} sur $${intervalle(p, q)}$ vaut $${value}$.`],
    };
  }),
];

const composeeVariantes = [
  variant('nombre-derive', (rng, level) => {
    const a = rng.nonZero(-3, 3);
    const b = rng.int(-4, 4);
    const n = level === 1 ? 2 : rng.pick([2, 3]);
    const x0 = rng.int(-2, 2);
    const u = a * x0 + b;
    const inner = sumLatex([[a, 'x'], [b, '']]);
    return {
      prompt: `Soit $g(x) = (${inner})^${n}$. Calcule $g'(${x0})$.`,
      answer: { kind: 'number', value: frac(n * a * u ** (n - 1)) },
      hint: '$g\'(x) = a \\times n(ax + b)^{n - 1}$, puis remplace $x$.',
      correction: [`$g'(x) = ${n * a}(${inner})${n > 2 ? `^${n - 1}` : ''}$`, `$g'(${x0}) = ${n * a}\\times ${paren(u)}${n > 2 ? `^${n - 1}` : ''} = ${n * a * u ** (n - 1)}$`],
    };
  }),
  variant('vrai-faux', (rng, level) => {
    const a = rng.next() < 0.4 ? 1 : rng.pick([2, 3, 4, 5, -1, -2, -3]);
    const b = rng.nonZero(-6, 6);
    const n = level === 1 ? 2 : rng.pick([2, 3, 4]);
    const inner = sumLatex([[a, 'x'], [b, '']]);
    const shown = `${n}(${inner})${n > 2 ? `^${n - 1}` : ''}`;
    return {
      prompt: `Vrai ou faux : la dérivée de $g(x) = (${inner})^${n}$ est $g'(x) = ${shown}$.`,
      answer: vraiFaux(a === 1),
      hint: 'Pense au facteur $a$ dans $(f(ax + b))\' = a\\,f\'(ax + b)$.',
      correction: [`$g'(x) = ${a === 1 ? '' : `${a}\\times `}${shown}${a === 1 ? '' : ` = ${n * a}(${inner})${n > 2 ? `^${n - 1}` : ''}`}$ : c'est ${a === 1 ? 'vrai' : 'faux'}.`],
    };
  }),
  variant('racine-en-un-point', (rng) => {
    const a = rng.pick([1, 2, 3, 4, 5]);
    const r = rng.int(1, 5);
    const x0 = rng.int(-3, 3);
    const b = r * r - a * x0;
    const inner = sumLatex([[a, 'x'], [b, '']]);
    const value = frac(a, 2 * r);
    return {
      prompt: `Soit $g(x) = \\sqrt{${inner}}$. Calcule $g'(${x0})$.`,
      answer: { kind: 'number', value },
      hint: '$g\'(x) = \\frac{a}{2\\sqrt{ax + b}}$.',
      correction: [`$g'(x) = \\frac{${a}}{2\\sqrt{${inner}}}$`, `$g'(${x0}) = \\frac{${a}}{2\\sqrt{${r * r}}} = ${fracLatex(value)}$`],
    };
  }),
];

const optimisationVariantes = [
  variant('enclos', (rng) => {
    const x = rng.int(3, 30);
    const L = 4 * x;
    return {
      prompt: `Un éleveur dispose de $${L}$ m de grillage pour clôturer un enclos rectangulaire le long d'un mur (le mur ferme un côté). Il note $x$ la longueur des deux côtés perpendiculaires au mur. Pour quelle valeur de $x$, en m, l'aire est-elle maximale ?`,
      answer: { kind: 'number', value: frac(x) },
      hint: `Le troisième côté mesure $${L} - 2x$ ; dérive l'aire $A(x) = x(${L} - 2x)$.`,
      correction: [`$A(x) = x(${L} - 2x) = -2x^2 + ${L}x$, donc $A'(x) = -4x + ${L}$.`, `$A'(x) = 0 \\iff x = ${x}$, et $A'$ passe de + à − : l'aire est maximale pour $x = ${x}$ m.`],
    };
  }),
  variant('boite', (rng) => {
    const x = rng.int(1, 8);
    const c = 6 * x;
    return {
      prompt: `Dans une plaque carrée de $${c}$ cm de côté, on découpe aux quatre coins un carré de côté $x$ cm, puis on replie les bords pour former une boîte sans couvercle. Son volume est $V(x) = x(${c} - 2x)^2$. Pour quelle valeur de $x$ est-il maximal ?`,
      answer: { kind: 'number', value: frac(x) },
      hint: 'Développe $V(x)$, dérive, puis résous $V\'(x) = 0$ en gardant une solution entre $0$ et la moitié du côté.',
      correction: [`$V(x) = 4x^3 - ${4 * c}x^2 + ${c * c}x$ et $V'(x) = 12x^2 - ${8 * c}x + ${c * c} = 12(x - ${x})(x - ${3 * x})$.`, `Sur $]0\\,;\\,${c / 2}[$, $V'$ passe de + à − en $${x}$ : le volume est maximal pour $x = ${x}$ cm.`],
    };
  }),
  variant('produit-maximal', (rng) => {
    const half = rng.int(2, 25);
    const S = 2 * half;
    return {
      prompt: `On cherche deux nombres positifs dont la somme vaut $${S}$ et dont le produit est le plus grand possible. Quel est ce produit maximal ?`,
      answer: { kind: 'number', value: frac(half * half) },
      hint: `Si l'un vaut $x$, l'autre vaut $${S} - x$ ; dérive $P(x) = x(${S} - x)$.`,
      correction: [`$P(x) = ${S}x - x^2$ et $P'(x) = ${S} - 2x$, nul en $x = ${half}$.`, `Le produit maximal est $${half}\\times ${half} = ${half * half}$.`],
    };
  }),
];

export const APPLICATIONS_DERIVATION: ChapterDef = {
  id: '1re-applications-derivation',
  title: 'Applications de la dérivation',
  region: 'Vallée des Variations',
  theme: 'automne',
  terrain: 'riviere',
  skills: [
    enrich(pointsCritiques, pointsCritiquesVariantes),
    enrich(variations, variationsVariantes),
    enrich(extremum, extremumVariantes),
    enrich(composee, composeeVariantes),
    enrich(optimisation, optimisationVariantes),
  ],
  creatures: [
    {
      id: '1re-critix',
      name: 'Critix',
      description: 'Un insecte qui s’arrête net partout où la dérivée s’annule.',
      skills: ['1re-points-critiques'],
      look: { shape: 'insecte', hue: 35, symbol: '0' },
    },
    {
      id: '1re-varioline',
      name: 'Varioline',
      description: 'Une plante grimpante qui monte, redescend, puis remonte, en suivant le signe de f′.',
      skills: ['1re-variations', '1re-points-critiques'],
      look: { shape: 'plante', hue: 20, symbol: '↗↘' },
    },
    {
      id: '1re-affinard',
      name: 'Affinard',
      description: 'Un renard qui se cache dans une fonction affine : pour le dériver, n’oublie pas le facteur a.',
      skills: ['1re-derivee-composee'],
      look: { shape: 'bete', hue: 15, symbol: 'ax+b' },
    },
    {
      id: '1re-extremoufle',
      name: 'Extrémoufle',
      description: 'Une boule de poils qui dort toujours au sommet d’une bosse ou au fond d’un creux.',
      skills: ['1re-extremum-local', '1re-variations'],
      look: { shape: 'blob', hue: 45, symbol: 'max' },
    },
    {
      id: '1re-optimouette',
      name: 'Optimouette',
      description: 'Une mouette commerçante qui cherche toujours le meilleur bénéfice.',
      skills: ['1re-optimisation', '1re-extremum-local'],
      look: { shape: 'oiseau', hue: 50, symbol: '€' },
    },
  ],
  boss: {
    id: '1re-variatitan',
    name: 'Variatitan',
    description: 'Le gardien de la vallée, fait de roches empilées en montées et descentes.',
    skills: ['1re-points-critiques', '1re-variations', '1re-extremum-local', '1re-derivee-composee', '1re-optimisation'],
    look: { shape: 'golem', hue: 25, symbol: '±' },
  },
};
