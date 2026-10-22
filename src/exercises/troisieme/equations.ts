import { frac, fracLatex } from '../fraction';
import { type Skill, makeChoice } from '../types';
import { fraction, num, poly, skill } from './outils';

/** 3e : équations du premier degré, équations produit nul, x² = a, inéquations, mise en équation. */

const aff = (a: number, b: number) => poly([a, b]);

const premierDegre = skill('3e-equation', 'Résoudre une équation du premier degré', (rng, level) => {
  // ax + b = cx + d, solution x = (d - b) / (a - c)
  let a: number;
  let c: number;
  do {
    a = rng.nonZero(-9, 9);
    c = level === 1 ? 0 : rng.int(-6, 6);
  } while (a === c);
  const b = rng.int(-12, 12);
  // Niveau 3 : solution fractionnaire, on ne part plus d'une solution entière.
  const num0 = level === 3 ? rng.nonZero(-15, 15) : (a - c) * rng.int(-8, 8);
  const d = b + num0;
  const left = aff(a, b);
  const right = c === 0 ? String(d) : aff(c, d);
  const sol = frac(num0, a - c);
  return {
    prompt: `Résous l'équation $${left} = ${right}$.${level === 3 ? ' Donne la solution sous forme de fraction si besoin.' : ''}`,
    answer: { kind: 'number', value: sol },
    hint: 'Regroupe les termes en $x$ d’un côté et les nombres de l’autre, puis divise par le coefficient de $x$.',
    correction: [
      c === 0 ? `$${poly([a, 0])} = ${d} ${b < 0 ? '+' : '-'} ${Math.abs(b)}$` : `$${poly([a, 0])} ${c < 0 ? '+' : '-'} ${poly([Math.abs(c), 0])} = ${d} ${b < 0 ? '+' : '-'} ${Math.abs(b)}$`,
      `$${poly([a - c, 0])} = ${num0}$`,
      `$x = \\frac{${num0}}{${a - c}} = ${fracLatex(sol)}$`,
    ],
  };
});

const produitNul = skill('3e-produit-nul', 'Résoudre une équation produit nul', (rng, level) => {
  const a = level === 1 ? 1 : rng.int(1, level === 2 ? 3 : 5);
  const b = rng.nonZero(-9, 9);
  const c = level === 3 ? rng.int(2, 5) : 1;
  const d = rng.nonZero(-9, 9);
  const s1 = frac(-b, a);
  const s2 = frac(-d, c);
  const values = s1.n * s2.d === s2.n * s1.d ? [s1] : [s1, s2];
  return {
    prompt: `Résous l'équation $(${aff(a, b)})(${aff(c, d)}) = 0$. Donne les solutions séparées par « ; ».`,
    answer: { kind: 'set', values },
    hint: 'Un produit est nul si et seulement si l’un au moins de ses facteurs est nul.',
    correction: [
      `$${aff(a, b)} = 0$ ou $${aff(c, d)} = 0$`,
      `$x = ${fracLatex(s1)}$ ou $x = ${fracLatex(s2)}$`,
      `Solutions : $${values.map(fracLatex).join('$ et $')}$.`,
    ],
  };
});

const carre = skill('3e-equation-carre', 'Résoudre une équation x² = a', (rng, level) => {
  const kind = level === 1 ? 'pos' : rng.pick(['pos', 'pos', 'pos', 'neg', 'zero'] as const);
  const r = rng.int(1, level === 3 ? 15 : 10);
  const k = level === 3 ? rng.int(1, 30) : 0;
  const a = kind === 'pos' ? r * r : kind === 'neg' ? -r * r : 0;
  // Au niveau 3, l'équation s'écrit x² + k = a + k.
  const eq = level === 3 && k ? `x^2 + ${k} = ${a + k}` : `x^2 = ${a}`;
  const values = kind === 'pos' ? [frac(-r), frac(r)] : kind === 'zero' ? [frac(0)] : [];
  return {
    prompt: `Résous l'équation $${eq}$. Donne les solutions séparées par « ; » (ou écris « aucune »).`,
    answer: { kind: 'set', values },
    hint: 'Si $a > 0$, l’équation $x^2 = a$ a deux solutions : $\\sqrt{a}$ et $-\\sqrt{a}$. Si $a < 0$, aucune : un carré est toujours positif.',
    correction: [
      ...(level === 3 && k ? [`$x^2 = ${a + k} - ${k} = ${a}$`] : []),
      kind === 'pos'
        ? `$${a} > 0$ : deux solutions, $x = \\sqrt{${a}} = ${r}$ ou $x = -\\sqrt{${a}} = -${r}$.`
        : kind === 'zero'
          ? '$x^2 = 0$ a une seule solution : $x = 0$.'
          : `Un carré est toujours positif, donc $x^2 = ${a}$ n'a aucune solution.`,
    ],
  };
});

const SIGNS = ['<', '>', '\\leq', '\\geq'] as const;
const flip = { '<': '>', '>': '<', '\\leq': '\\geq', '\\geq': '\\leq' } as const;

const inequation = skill('3e-inequation', 'Résoudre une inéquation du premier degré', (rng, level) => {
  const a = level === 1 ? rng.int(2, 6) : rng.nonZero(-6, 6);
  const sign = rng.pick(SIGNS);
  const x0 = rng.int(-6, 6);
  const b = rng.int(-10, 10);
  const c = a * x0 + b;
  const res = a > 0 ? sign : flip[sign];
  const opt = (s: string, v: number) => `$x ${s} ${v}$`;
  const answer = makeChoice(rng, opt(res, x0), [opt(flip[res], x0), opt(res, -x0), opt(res, c - b), opt(flip[res], c - b), opt(res, c)], () => opt(res, x0 + rng.nonZero(-3, 3)));
  return {
    prompt: `Résous l'inéquation $${aff(a, b)} ${sign} ${c}$.`,
    answer,
    hint: 'Comme pour une équation, mais quand on divise (ou multiplie) par un nombre négatif, on change le sens de l’inégalité.',
    correction: [
      `$${poly([a, 0])} ${sign} ${c} ${b < 0 ? '+' : '-'} ${Math.abs(b)}$, soit $${poly([a, 0])} ${sign} ${c - b}$.`,
      a > 0 ? `On divise par $${a}$, positif : le sens ne change pas.` : `On divise par $${a}$, négatif : le sens de l'inégalité change.`,
      `$x ${res} ${x0}$`,
    ],
  };
});

const miseEnEquation = skill('3e-mise-en-equation', 'Mettre un problème en équation', (rng, level) => {
  const kind = level === 1 ? 'nombre' : rng.pick(['nombre', 'rectangle', 'ages'] as const);
  if (kind === 'rectangle') {
    const l = rng.int(3, 15);
    const e = rng.int(2, 9);
    const P = 2 * (l + l + e);
    return {
      prompt: `Un rectangle a une longueur qui dépasse sa largeur de $${e}$ cm. Son périmètre est de $${P}$ cm. Quelle est sa largeur, en cm ?`,
      answer: num(l),
      hint: 'Appelle $x$ la largeur : la longueur vaut $x + ' + e + '$ et le périmètre $2(x + x + ' + e + ')$.',
      correction: [`$2(x + x + ${e}) = ${P}$`, `$4x + ${2 * e} = ${P}$, donc $4x = ${P - 2 * e}$.`, `$x = ${l}$ : la largeur mesure $${l}$ cm.`],
    };
  }
  if (kind === 'ages') {
    const child = rng.int(4, 14);
    const k = rng.pick([3, 4]);
    const sum = child * (k + 1);
    return {
      prompt: `Une mère a $${k}$ fois l'âge de sa fille. À elles deux, elles ont $${sum}$ ans. Quel est l'âge de la fille ?`,
      answer: num(child),
      hint: `Appelle $x$ l'âge de la fille : la mère a $${k}x$ ans.`,
      correction: [`$x + ${k}x = ${sum}$`, `$${k + 1}x = ${sum}$`, `$x = ${child}$ : la fille a $${child}$ ans.`],
    };
  }
  const x = level === 3 ? rng.int(-9, 15) : rng.int(1, 15);
  const a = rng.int(2, 7);
  const b = rng.int(1, 20);
  const r = a * x + b;
  return {
    prompt: `Je pense à un nombre. Je le multiplie par $${a}$, puis j'ajoute $${b}$ : j'obtiens $${r}$. Quel est ce nombre ?`,
    answer: fraction(x),
    hint: `Appelle $x$ le nombre : l'énoncé donne l'équation $${a}x + ${b} = ${r}$.`,
    correction: [`$${a}x + ${b} = ${r}$`, `$${a}x = ${r - b}$`, `$x = ${x}$`],
  };
});

export const EQUATIONS_3E: Skill[] = [premierDegre, produitNul, carre, inequation, miseEnEquation];
