import { frac } from '../fraction';
import type { Skill } from '../types';
import { bound, fixedChoice, numF, par, poly, skill, tex } from './util';

/** Chapitre « Équations du premier degré » (4e). */

const signed = (v: number) => (v < 0 ? `- ${Math.abs(v)}` : `+ ${v}`);

const tester = skill('4e-tester-valeur', 'Tester si un nombre est solution', (rng, level) => {
  const a = rng.nonZero(-6, 6);
  const b = rng.nonZero(-9, 9);
  const c = rng.nonZero(-4, 4);
  const d = rng.nonZero(-9, 9);
  const x = rng.nonZero(-5, 5);
  const left = a * x + b;
  // Une fois sur deux, on ajuste d pour que x soit solution.
  const dd = rng.next() < 0.5 ? left - c * x : d;
  const right = level === 1 ? left + (dd === d ? rng.pick([0, 1, -2]) : 0) : c * x + dd;
  const rhs = level === 1 ? String(right) : poly([c, dd]);
  const ok = left === right;
  return {
    prompt: `Le nombre $${x}$ est-il solution de l’équation $${poly([a, b])} = ${rhs}$ ?`,
    answer: fixedChoice(['oui', 'non'], ok ? 0 : 1),
    hint: 'Remplace $x$ par ce nombre dans chaque membre et compare les deux résultats.',
    correction: [
      `Membre de gauche : $${a} \\times ${par(x)} ${signed(b)} = ${left}$.`,
      level === 1 ? `Membre de droite : $${right}$.` : `Membre de droite : $${c} \\times ${par(x)}${dd === 0 ? '' : ` ${signed(dd)}`} = ${right}$.`,
      ok ? 'Les deux membres sont égaux : oui, c’est une solution.' : 'Les deux membres sont différents : ce n’est pas une solution.',
    ],
  };
});

const simple = skill('4e-equation-simple', 'Résoudre ax + b = c', (rng, level) => {
  const a = level === 1 ? rng.int(2, 9) : rng.nonZero(-9, 9) || 3;
  const aa = Math.abs(a) === 1 ? a * 2 : a;
  const b = rng.nonZero(-15, 15);
  const sol = level === 3 ? frac(rng.nonZero(-12, 12), Math.abs(aa)) : frac(rng.nonZero(-9, 9));
  const c = frac(aa * sol.n + b * sol.d, sol.d);
  if (c.d !== 1) throw new Error('impossible');
  return {
    prompt: `Résous l’équation $${poly([aa, b])} = ${c.n}$.${level === 3 ? ' (Donne la solution sous forme de fraction si besoin.)' : ''}`,
    answer: numF(sol),
    hint: 'Isole $x$ : soustrais d’abord le nombre, puis divise par le coefficient de $x$.',
    correction: [`$${aa}x = ${c.n} ${signed(-b)} = ${c.n - b}$`, `$x = \\frac{${c.n - b}}{${aa}} = ${tex(sol)}$`],
  };
});

const deuxMembres = skill('4e-equation-deux-membres', 'Résoudre ax + b = cx + d', (rng, level) => {
  const a = rng.nonZero(-bound(level, 9, 9, 12), bound(level, 9, 9, 12));
  let c = rng.nonZero(-9, 9);
  if (c === a) c = a + rng.pick([-2, -1, 1, 2]) || a + 3;
  const k = a - c;
  const sol = level === 3 ? frac(rng.nonZero(-15, 15), k) : frac(rng.nonZero(-8, 8));
  // b et d entiers tels que (a - c) x = d - b.
  const b = rng.int(-12, 12);
  const dmb = frac(k * sol.n, sol.d);
  const d = b + dmb.n;
  const left = poly([a, b]);
  const right = poly([c, d]);
  return {
    prompt: `Résous l’équation $${left} = ${right}$.${level === 3 ? ' (Donne la solution sous forme de fraction si besoin.)' : ''}`,
    answer: numF(sol),
    hint: 'Regroupe les termes en $x$ dans un membre et les nombres dans l’autre.',
    correction: [`$${poly([a, 0])} ${c < 0 ? '+' : '-'} ${Math.abs(c) === 1 ? '' : Math.abs(c)}x = ${d} ${signed(-b)}$`, `$${poly([k, 0])} = ${d - b}$`, `$x = \\frac{${d - b}}{${k}} = ${tex(sol)}$`],
  };
});

const parentheses = skill('4e-equation-parentheses', 'Résoudre une équation avec parenthèses', (rng, level) => {
  const k = rng.nonZero(-bound(level, 5, 6, 8), bound(level, 5, 6, 8));
  const kk = Math.abs(k) === 1 ? 2 * k : k;
  const p = rng.nonZero(-9, 9);
  const sol = rng.nonZero(-9, 9);
  const c = level === 1 ? 0 : rng.nonZero(-4, 4);
  const cc = c === kk ? c + 1 : c;
  // kk(x + p) = cc x + r
  const r = kk * (sol + p) - cc * sol;
  const rhs = cc === 0 ? String(r) : poly([cc, r]);
  return {
    prompt: `Résous l’équation $${kk}(${poly([1, p])}) = ${rhs}$.`,
    answer: numF(frac(sol)),
    hint: 'Commence par développer le membre de gauche, puis résous comme d’habitude.',
    correction: [
      `$${poly([kk, kk * p])} = ${rhs}$`,
      cc === 0 ? `$${kk}x = ${r} ${signed(-kk * p)} = ${r - kk * p}$` : `$${poly([kk - cc, 0])} = ${r - kk * p}$`,
      ...(kk - cc === 1 ? [] : [`$x = \\frac{${r - kk * p}}{${kk - cc}} = ${sol}$`]),
    ],
  };
});

const miseEnEquation = skill('4e-mise-en-equation', 'Mettre un problème en équation', (rng, level) => {
  const cases = [
    () => {
      const x = rng.int(2, 20);
      const a = rng.int(2, 7);
      const b = rng.int(1, 20);
      return {
        prompt: `Je pense à un nombre. Je le multiplie par ${a}, puis j’ajoute ${b}. J’obtiens ${a * x + b}. Quel est ce nombre ?`,
        sol: x,
        corr: [`On note $x$ ce nombre : $${a}x + ${b} = ${a * x + b}$.`, `$${a}x = ${a * x}$, donc $x = ${x}$.`],
      };
    },
    () => {
      const x = rng.int(5, 40);
      const extra = rng.int(2, 15);
      const total = 2 * x + extra;
      return {
        prompt: `Léa et Hugo ont ${total} billes à eux deux. Hugo en a ${extra} de plus que Léa. Combien Léa a-t-elle de billes ?`,
        sol: x,
        corr: [`On note $x$ le nombre de billes de Léa : $x + (x + ${extra}) = ${total}$.`, `$2x = ${total - extra}$, donc $x = ${x}$.`],
      };
    },
    () => {
      const l = rng.int(3, 20);
      const extra = rng.int(1, 10);
      const per = 2 * (l + l + extra);
      return {
        prompt: `Un rectangle a une longueur qui dépasse sa largeur de ${extra} cm. Son périmètre est ${per} cm. Quelle est sa largeur, en cm ?`,
        sol: l,
        corr: [`On note $x$ la largeur : $2(x + x + ${extra}) = ${per}$.`, `$4x + ${2 * extra} = ${per}$, donc $4x = ${per - 2 * extra}$ et $x = ${l}$.`],
      };
    },
  ];
  if (level >= 2)
    cases.push(() => {
      const x = rng.int(3, 15);
      const a = rng.int(2, 5);
      const b = rng.int(1, 9);
      const c = rng.int(1, a - 1 || 1);
      const d = (a - c) * x + b;
      return {
        prompt: `Si on multiplie un nombre par ${a} et qu’on ajoute ${b}, on obtient le même résultat que si on le multiplie par ${c} et qu’on ajoute ${d}. Quel est ce nombre ?`,
        sol: x,
        corr: [`$${a}x + ${b} = ${c === 1 ? '' : c}x + ${d}$`, `$${a}x - ${c === 1 ? '' : c}x = ${d} - ${b}$, donc $${a - c === 1 ? '' : a - c}x = ${d - b}$${a - c === 1 ? '' : ` et $x = ${x}$`}.`],
      };
    });
  if (level === 3)
    cases.push(() => {
      const age = rng.int(10, 16);
      const years = rng.int(8, 16);
      const parent = 2 * (age + years) - years;
      return {
        prompt: `Sam a ${age} ans et sa mère ${parent} ans. Dans combien d’années sa mère aura-t-elle exactement le double de l’âge de Sam ?`,
        sol: years,
        corr: [`Dans $x$ ans : $${parent} + x = 2(${age} + x)$.`, `$${parent} + x = ${2 * age} + 2x$, donc $x = ${parent} - ${2 * age} = ${years}$.`],
      };
    });
  const c = rng.pick(cases)();
  return {
    prompt: c.prompt,
    answer: numF(frac(c.sol)),
    hint: 'Choisis l’inconnue $x$, traduis l’énoncé par une équation, puis résous-la.',
    correction: c.corr,
  };
});

export const EQUATIONS_SKILLS: Skill[] = [tester, simple, deuxMembres, parentheses, miseEnEquation];
