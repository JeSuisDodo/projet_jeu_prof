import { frac } from '../fraction';
import type { Skill } from '../types';
import { latexChoice, num, yesNo } from './outils';

/** 5e : multiples, diviseurs, critères de divisibilité et nombres premiers. */

export function isPrime(n: number): boolean {
  if (n < 2) return false;
  for (let p = 2; p * p <= n; p++) if (n % p === 0) return false;
  return true;
}

export const divisors = (n: number): number[] => Array.from({ length: n }, (_, i) => i + 1).filter((d) => n % d === 0);

const digitSum = (n: number) => String(n).split('').reduce((s, c) => s + Number(c), 0);

const CRITERES: Record<number, (n: number) => string> = {
  2: (n) => `Son chiffre des unités est ${n % 10}${n % 2 === 0 ? ', un chiffre pair' : ', un chiffre impair'}.`,
  5: (n) => `Son chiffre des unités est ${n % 10} : un nombre est divisible par 5 s'il se termine par 0 ou 5.`,
  10: (n) => `Son chiffre des unités est ${n % 10} : un nombre est divisible par 10 s'il se termine par 0.`,
  3: (n) => `La somme de ses chiffres vaut ${digitSum(n)}, ${digitSum(n) % 3 === 0 ? 'qui est' : 'qui n’est pas'} un multiple de 3.`,
  9: (n) => `La somme de ses chiffres vaut ${digitSum(n)}, ${digitSum(n) % 9 === 0 ? 'qui est' : 'qui n’est pas'} un multiple de 9.`,
  4: (n) => `Le nombre formé par ses deux derniers chiffres, ${n % 100}, ${(n % 100) % 4 === 0 ? 'est' : 'n’est pas'} un multiple de 4.`,
};

const divisibilite: Skill = {
  id: '5e-divisibilite',
  name: 'Utiliser les critères de divisibilité',
  generate(rng, level) {
    const d = level === 1 ? rng.pick([2, 5, 10]) : level === 2 ? rng.pick([3, 9]) : rng.pick([3, 4, 9]);
    const max = level === 1 ? 999 : level === 2 ? 9999 : 99999;
    let n: number;
    if (rng.next() < 0.5) n = d * rng.int(Math.ceil(100 / d), Math.floor(max / d));
    else if (d === 9 && rng.next() < 0.6) n = 3 * rng.int(34, Math.floor(max / 3)); // multiple de 3, piège pour 9
    else n = rng.int(100, max);
    const yes = n % d === 0;
    return {
      skill: '5e-divisibilite',
      level,
      prompt: `Le nombre $${n}$ est-il divisible par $${d}$ ?`,
      answer: yesNo(yes),
      hint: d === 3 || d === 9 ? `Additionne les chiffres du nombre.` : d === 4 ? 'Regarde le nombre formé par les deux derniers chiffres.' : 'Regarde le chiffre des unités.',
      correction: [CRITERES[d](n), yes ? `Donc $${n}$ est divisible par $${d}$ : $${n} = ${d} \\times ${n / d}$.` : `Donc $${n}$ n'est pas divisible par $${d}$.`],
    };
  },
};

const premier: Skill = {
  id: '5e-premier',
  name: 'Reconnaître un nombre premier',
  generate(rng, level) {
    const max = level === 1 ? 30 : level === 2 ? 100 : 200;
    let n: number;
    if (rng.next() < 0.5) {
      do n = rng.int(2, max);
      while (!isPrime(n));
    } else if (level >= 2) {
      // Des nombres impairs qui « ont l'air » premiers : 51, 57, 87, 91…
      do n = rng.int(3, max);
      while (isPrime(n) || n % 2 === 0 || n % 5 === 0);
    } else {
      do n = rng.int(4, max);
      while (isPrime(n));
    }
    const prime = isPrime(n);
    const d = divisors(n).find((x) => x > 1)!;
    return {
      skill: '5e-premier',
      level,
      prompt: `Le nombre $${n}$ est-il un nombre premier ?`,
      answer: yesNo(prime),
      hint: 'Un nombre premier a exactement deux diviseurs : 1 et lui-même. Essaie de le diviser par 2, 3, 5, 7…',
      correction: prime
        ? [`Les seuls diviseurs de $${n}$ sont $1$ et $${n}$.`, `$${n}$ est premier.`]
        : [`$${n} = ${d} \\times ${n / d}$`, `$${n}$ a d'autres diviseurs que 1 et lui-même : il n'est pas premier.`],
    };
  },
};

const intrus: Skill = {
  id: '5e-diviseurs',
  name: 'Trouver les diviseurs d’un nombre',
  generate(rng, level) {
    const pool = level === 1 ? [12, 18, 20, 24, 28, 30, 36, 40] : level === 2 ? [42, 45, 48, 54, 56, 60, 63, 72, 84, 90] : [96, 105, 108, 120, 126, 132, 144, 150, 168, 180];
    const n = rng.pick(pool);
    const divs = divisors(n).filter((d) => d > 1 && d < n);
    const asked = rng.next() < 0.5 ? 'est' : 'n-est';
    // Les non-diviseurs les plus trompeurs sont proches de vrais diviseurs.
    const near = [...new Set(divs.flatMap((d) => [d + 1, d - 1, d * 2]))].filter((x) => x > 1 && x < n && n % x !== 0);
    const list = divisors(n).join(' ; ');
    if (asked === 'est') {
      const correct = rng.pick(divs);
      return {
        skill: '5e-diviseurs',
        level,
        prompt: `Lequel de ces nombres est un diviseur de $${n}$ ?`,
        answer: latexChoice(rng, String(correct), rng.shuffle(near).slice(0, 3).map(String), () => String(rng.int(2, n - 1))),
        hint: `$d$ est un diviseur de $${n}$ si la division de $${n}$ par $d$ tombe juste.`,
        correction: [`$${n} = ${correct} \\times ${n / correct}$`, `Les diviseurs de $${n}$ sont : $${list}$.`],
      };
    }
    const wrong = rng.pick(near);
    return {
      skill: '5e-diviseurs',
      level,
      prompt: `Lequel de ces nombres n'est pas un diviseur de $${n}$ ?`,
      answer: latexChoice(rng, String(wrong), rng.shuffle(divs).slice(0, 3).map(String), () => String(rng.pick(divs))),
      hint: `Pour chaque nombre, cherche par quoi le multiplier pour obtenir $${n}$.`,
      correction: [`La division de $${n}$ par $${wrong}$ ne tombe pas juste : il reste $${n % wrong}$.`, `Les diviseurs de $${n}$ sont : $${list}$.`],
    };
  },
};

const euclide: Skill = {
  id: '5e-division-euclidienne',
  name: 'Effectuer une division euclidienne',
  generate(rng, level) {
    const b = level === 1 ? rng.int(2, 9) : level === 2 ? rng.int(11, 25) : rng.int(26, 99);
    const q = rng.int(level === 3 ? 10 : 3, level === 1 ? 20 : 60);
    const r = rng.int(0, b - 1);
    const a = b * q + r;
    const story = level === 3 && rng.next() < 0.5;
    return {
      skill: '5e-division-euclidienne',
      level,
      prompt: story
        ? `On range $${a}$ œufs dans des boîtes de $${b}$. Combien de boîtes pleines obtient-on ($q$), et combien d'œufs restent ($r$) ?`
        : `Effectue la division euclidienne de $${a}$ par $${b}$ : donne le quotient $q$ et le reste $r$.`,
      answer: { kind: 'pair', values: [frac(q), frac(r)], labels: ['q', 'r'] },
      hint: `Cherche le plus grand multiple de $${b}$ qui ne dépasse pas $${a}$. Le reste doit être plus petit que $${b}$.`,
      correction: [`$${a} = ${b} \\times ${q} + ${r}$ avec $${r} < ${b}$.`, `Le quotient est $${q}$ et le reste $${r}$.`],
    };
  },
};

const multiples: Skill = {
  id: '5e-multiples',
  name: 'Compter des multiples',
  generate(rng, level) {
    const k = level === 1 ? rng.pick([2, 3, 4, 5, 10]) : rng.int(6, 15);
    if (level < 3) {
      const m = rng.int(30, level === 1 ? 100 : 250);
      const count = Math.floor(m / k);
      return {
        skill: '5e-multiples',
        level,
        prompt: `Combien y a-t-il de multiples de $${k}$ compris entre $1$ et $${m}$ ?`,
        answer: num(count),
        hint: `Le plus grand multiple de $${k}$ inférieur ou égal à $${m}$ est $${k} \\times n$ : cherche $n$.`,
        correction: [`$${k} \\times ${count} = ${k * count} \\leq ${m}$ et $${k} \\times ${count + 1} = ${k * (count + 1)} > ${m}$.`, `Il y en a $${count}$ : $${k} \\times 1$, $${k} \\times 2$, …, $${k} \\times ${count}$.`],
      };
    }
    const lo = rng.int(20, 200);
    const hi = lo + rng.int(40, 300);
    const first = Math.ceil(lo / k);
    const last = Math.floor(hi / k);
    const count = last - first + 1;
    return {
      skill: '5e-multiples',
      level,
      prompt: `Combien y a-t-il de multiples de $${k}$ compris entre $${lo}$ et $${hi}$ (inclus) ?`,
      answer: num(count),
      hint: 'Cherche le premier et le dernier multiple de l’intervalle.',
      correction: [`Premier : $${k} \\times ${first} = ${k * first}$ ; dernier : $${k} \\times ${last} = ${k * last}$.`, `Il y en a $${last} - ${first} + 1 = ${count}$.`],
    };
  },
};

export const DIVISIBILITE_SKILLS: Skill[] = [divisibilite, premier, intrus, euclide, multiples];
