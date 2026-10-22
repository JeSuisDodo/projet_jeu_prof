import type { Skill } from '../types';
import { choiceTex, dec, decimal, fixedChoice, skill } from './outils';

/** 3e : théorème de Thalès (configuration emboîtée ou « papillon ») et sa réciproque. */

/** Rapport k et longueurs « propres » : AM = k·AB avec des décimaux à un chiffre au plus. */
function config(rng: { pick: <T>(x: readonly T[]) => T; int: (a: number, b: number) => number }, level: number) {
  const [p, q] = rng.pick(level === 1 ? [[1, 2], [1, 3], [2, 3], [3, 4]] : [[2, 5], [3, 5], [3, 4], [4, 5], [5, 8], [3, 7], [5, 6]]);
  const ab = q * rng.int(1, level === 3 ? 4 : 3);
  const ac = q * rng.int(1, 4) * (level === 1 ? 1 : 0.5);
  const bc = q * rng.int(1, 5) * 0.5;
  const k = p / q;
  return { k, p, q, ab, ac, bc, am: ab * k, an: ac * k, mn: bc * k };
}

const longueur = skill('3e-thales-longueur', 'Calculer une longueur avec le théorème de Thalès', (rng, level) => {
  const c = config(rng, level);
  const papillon = level === 3 && rng.next() < 0.5;
  const where = papillon
    ? `Les droites $(BM)$ et $(CN)$ se coupent en $A$, et $(BC) \\parallel (MN)$.`
    : `$M$ est sur $[AB]$, $N$ est sur $[AC]$ et $(MN) \\parallel (BC)$.`;
  const ask = rng.pick(['an', 'mn', 'ab'] as const);
  const known: [string, number][] =
    ask === 'an'
      ? [['AM', c.am], ['AB', c.ab], ['AC', c.ac]]
      : ask === 'mn'
        ? [['AM', c.am], ['AB', c.ab], ['BC', c.bc]]
        : [['AM', c.am], ['AN', c.an], ['AC', c.ac]];
  const target = ask === 'an' ? ['AN', c.an] : ask === 'mn' ? ['MN', c.mn] : ['AB', c.ab];
  const formula =
    ask === 'an'
      ? `AN = \\frac{AM \\times AC}{AB} = \\frac{${dec(c.am)} \\times ${dec(c.ac)}}{${dec(c.ab)}}`
      : ask === 'mn'
        ? `MN = \\frac{AM \\times BC}{AB} = \\frac{${dec(c.am)} \\times ${dec(c.bc)}}{${dec(c.ab)}}`
        : `AB = \\frac{AM \\times AC}{AN} = \\frac{${dec(c.am)} \\times ${dec(c.ac)}}{${dec(c.an)}}`;
  return {
    prompt: `${where} On donne ${known.map(([n, v]) => `$${n} = ${dec(v)}$ cm`).join(', ')}. Calcule $${target[0]}$, en cm.`,
    answer: decimal(target[1] as number),
    hint: 'D’après le théorème de Thalès : $\\frac{AM}{AB} = \\frac{AN}{AC} = \\frac{MN}{BC}$. Garde les deux rapports utiles, puis fais un produit en croix.',
    correction: [`D'après le théorème de Thalès : $\\frac{AM}{AB} = \\frac{AN}{AC} = \\frac{MN}{BC}$.`, `$${formula} = ${dec(target[1] as number)}$ cm`],
  };
});

const egalite = skill('3e-thales-rapports', 'Écrire l’égalité des rapports de Thalès', (rng, level) => {
  const letters = rng.pick([
    ['A', 'M', 'B', 'N', 'C'],
    ['O', 'E', 'F', 'G', 'H'],
    ['S', 'R', 'T', 'U', 'V'],
  ]);
  const [A, M, B, N, C] = letters;
  const papillon = level >= 2 && rng.next() < 0.5;
  const ctx = papillon
    ? `Les droites $(${B}${M})$ et $(${C}${N})$ se coupent en $${A}$, et $(${M}${N}) \\parallel (${B}${C})$.`
    : `$${M} \\in [${A}${B}]$, $${N} \\in [${A}${C}]$ et $(${M}${N}) \\parallel (${B}${C})$.`;
  const f = (x: string, y: string) => `\\frac{${x}}{${y}}`;
  const correct = `${f(A + M, A + B)} = ${f(A + N, A + C)} = ${f(M + N, B + C)}`;
  return {
    prompt: `${ctx} Quelle égalité est vraie ?`,
    answer: choiceTex(
      rng,
      correct,
      [
        `${f(A + M, M + B)} = ${f(A + N, N + C)} = ${f(M + N, B + C)}`,
        `${f(A + M, A + C)} = ${f(A + N, A + B)} = ${f(M + N, B + C)}`,
        `${f(A + M, A + B)} = ${f(A + C, A + N)} = ${f(M + N, B + C)}`,
        `${f(A + B, A + M)} = ${f(A + N, A + C)} = ${f(B + C, M + N)}`,
      ],
      () => `${f(M + B, A + B)} = ${f(N + C, A + C)} = ${f(M + N, B + C)}`,
    ),
    hint: 'Chaque rapport compare un côté du petit triangle au côté correspondant du grand, toujours dans le même ordre.',
    correction: [`Le petit triangle $${A}${M}${N}$ et le grand triangle $${A}${B}${C}$ ont leurs côtés proportionnels :`, `$${correct}$`],
  };
});

const reciproque = skill('3e-thales-reciproque', 'Démontrer que deux droites sont parallèles (ou non)', (rng, level) => {
  const c = config(rng, level);
  const parallel = rng.next() < 0.5;
  // Pour casser le parallélisme, on décale légèrement AN.
  const an = parallel ? c.an : c.an + (level === 3 ? 0.1 : rng.pick([0.5, 1]));
  const r1 = c.am / c.ab;
  const r2 = an / c.ac;
  const ok = Math.abs(r1 - r2) < 1e-9;
  return {
    prompt: `Les points $A$, $M$, $B$ sont alignés dans cet ordre, ainsi que $A$, $N$, $C$. On donne $AM = ${dec(c.am)}$, $AB = ${dec(c.ab)}$, $AN = ${dec(an)}$ et $AC = ${dec(c.ac)}$ (en cm). Les droites $(MN)$ et $(BC)$ sont-elles parallèles ?`,
    answer: fixedChoice(['Oui', 'Non'], ok ? 0 : 1),
    hint: 'Compare $\\frac{AM}{AB}$ et $\\frac{AN}{AC}$ (par exemple avec les produits en croix).',
    correction: [
      `$AM \\times AC = ${dec(c.am)} \\times ${dec(c.ac)} = ${dec(c.am * c.ac)}$ et $AB \\times AN = ${dec(c.ab)} \\times ${dec(an)} = ${dec(c.ab * an)}$.`,
      ok
        ? `Les produits sont égaux, donc $\\frac{AM}{AB} = \\frac{AN}{AC}$ : d'après la réciproque du théorème de Thalès, $(MN) \\parallel (BC)$.`
        : `Les produits sont différents, donc $\\frac{AM}{AB} \\neq \\frac{AN}{AC}$ : d'après le théorème de Thalès, les droites ne sont pas parallèles.`,
    ],
  };
});

const ombre = skill('3e-thales-probleme', 'Utiliser Thalès dans un problème', (rng, level) => {
  // Un bâton et un arbre : leurs ombres sont proportionnelles à leurs hauteurs.
  const h = rng.pick(level === 1 ? [1, 2] : [1.5, 2, 1.2, 0.8]);
  const s = rng.pick(level === 1 ? [2, 3, 4] : [1.5, 2.5, 3, 2, 1.6]);
  const k = rng.int(3, level === 3 ? 12 : 8);
  const H = h * k;
  const S = s * k;
  return {
    prompt: `Un bâton vertical de $${dec(h)}$ m a une ombre de $${dec(s)}$ m. Au même moment, l'ombre d'un arbre mesure $${dec(S)}$ m. Quelle est la hauteur de l'arbre, en m ?`,
    answer: decimal(H),
    hint: 'Les rayons du soleil sont parallèles : on a une configuration de Thalès, les hauteurs sont proportionnelles aux ombres.',
    correction: [`$\\frac{H}{${dec(h)}} = \\frac{${dec(S)}}{${dec(s)}}$`, `$H = \\frac{${dec(h)} \\times ${dec(S)}}{${dec(s)}} = ${dec(H)}$ m`],
  };
});

export const THALES_3E: Skill[] = [longueur, egalite, reciproque, ombre];
