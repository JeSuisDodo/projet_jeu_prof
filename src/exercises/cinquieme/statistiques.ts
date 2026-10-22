import { frac } from '../fraction';
import type { Rng } from '../rng';
import type { Skill } from '../types';
import { dec, decFrac, distinctInts, num } from './outils';

/** 5e : effectifs, fréquences, moyenne (simple et pondérée), étendue. */

/** Répartit `total` en `k` effectifs non nuls. */
function split(rng: Rng, total: number, k: number): number[] {
  const out = Array(k).fill(1);
  for (let i = k; i < total; i++) out[rng.int(0, k - 1)]++;
  return out;
}

const table = (head: string, values: (number | string)[], effectifs: number[]) =>
  `$\\begin{array}{|c|${'c|'.repeat(values.length)}}\\hline \\text{${head}} & ${values.join(' & ')} \\\\ \\hline \\text{Effectif} & ${effectifs.join(' & ')} \\\\ \\hline \\end{array}$`;

const effectif: Skill = {
  id: '5e-effectif',
  name: 'Lire des effectifs',
  generate(rng, level) {
    const k = level === 1 ? 4 : 5;
    const total = rng.int(15, level === 1 ? 30 : 60);
    const eff = split(rng, total, k);
    const notes = Array.from({ length: k }, (_, i) => 10 + i * 2);
    if (level === 1) {
      return {
        skill: '5e-effectif',
        level,
        prompt: `Voici les notes d'une classe : ${table('Note', notes, eff)} Combien d'élèves y a-t-il dans la classe ?`,
        answer: num(total),
        hint: 'L’effectif total est la somme de tous les effectifs.',
        correction: [`$${eff.join(' + ')} = ${total}$`, `Il y a $${total}$ élèves.`],
      };
    }
    const threshold = notes[rng.int(1, k - 2)];
    const atLeast = eff.filter((_, i) => notes[i] >= threshold);
    const count = atLeast.reduce((a, b) => a + b, 0);
    return {
      skill: '5e-effectif',
      level,
      prompt: `Voici les notes d'une classe : ${table('Note', notes, eff)} Combien d'élèves ont une note supérieure ou égale à $${threshold}$ ?`,
      answer: num(count),
      hint: `Additionne les effectifs des notes $${threshold}$ et plus.`,
      correction: [`$${atLeast.join(' + ')} = ${count}$`],
    };
  },
};

const frequence: Skill = {
  id: '5e-frequence',
  name: 'Calculer une fréquence',
  generate(rng, level) {
    const total = level === 1 ? rng.pick([10, 20, 50, 100]) : rng.pick([20, 25, 40, 50, 80, 200]);
    const part = rng.int(1, total - 1);
    const sport = rng.pick(['le football', 'la natation', 'le basket', 'la danse', 'le judo']);
    const percent = frac(part * 100, total);
    if (level === 1) {
      return {
        skill: '5e-frequence',
        level,
        prompt: `Sur $${total}$ élèves interrogés, $${part}$ préfèrent ${sport}. Quelle est la fréquence de ce choix ? (en écriture décimale)`,
        answer: { kind: 'number', value: frac(part, total) },
        hint: 'Fréquence = effectif de la valeur ÷ effectif total.',
        correction: [`$\\dfrac{${part}}{${total}} = ${decFrac(frac(part, total))}$`],
      };
    }
    return {
      skill: '5e-frequence',
      level,
      prompt: `Sur $${total}$ élèves interrogés, $${part}$ préfèrent ${sport}. Quel pourcentage des élèves cela représente-t-il ?`,
      answer: { kind: 'number', value: percent },
      hint: 'Calcule la fréquence, puis multiplie-la par 100 pour obtenir un pourcentage.',
      correction: [`Fréquence : $\\dfrac{${part}}{${total}} = ${decFrac(frac(part, total))}$`, `Soit $${decFrac(percent)}\\,\\%$.`],
    };
  },
};

const moyenne: Skill = {
  id: '5e-moyenne',
  name: 'Calculer une moyenne',
  generate(rng, level) {
    const n = level === 1 ? rng.pick([2, 4, 5]) : rng.pick([4, 5, 8]);
    const xs = Array.from({ length: n }, () => (level === 3 ? rng.int(10, 40) / 2 : rng.int(5, 20)));
    const sum = xs.reduce((a, b) => a + b, 0);
    const mean = frac(Math.round(sum * 2), 2 * n);
    return {
      skill: '5e-moyenne',
      level,
      prompt: `Léo a obtenu les notes suivantes : $${xs.map(dec).join(' \\; ; \\; ')}$. Quelle est sa moyenne ?`,
      answer: { kind: 'number', value: mean },
      hint: 'Additionne toutes les notes, puis divise par le nombre de notes.',
      correction: [`$${xs.map(dec).join(' + ')} = ${dec(sum)}$`, `$${dec(sum)} \\div ${n} = ${decFrac(mean)}$`],
    };
  },
};

const ponderee: Skill = {
  id: '5e-moyenne-ponderee',
  name: 'Calculer une moyenne à partir d’un tableau',
  generate(rng, level) {
    const total = level === 1 ? rng.pick([10, 20]) : rng.pick([20, 25, 40, 50]);
    const k = level === 1 ? 3 : level === 2 ? 4 : 5;
    const uniq = distinctInts(rng, k, 0, level === 3 ? 12 : 8).sort((a, b) => a - b);
    const eff = split(rng, total, uniq.length);
    const sum = uniq.reduce((s, v, i) => s + v * eff[i], 0);
    const mean = frac(sum, total);
    return {
      skill: '5e-moyenne-ponderee',
      level,
      prompt: `On a demandé à des élèves combien de livres ils ont lus cet été : ${table('Livres', uniq, eff)} Quel est le nombre moyen de livres lus ?`,
      answer: { kind: 'number', value: mean },
      hint: 'Multiplie chaque valeur par son effectif, additionne, puis divise par l’effectif total.',
      correction: [`$${uniq.map((v, i) => `${v} \\times ${eff[i]}`).join(' + ')} = ${sum}$`, `Effectif total : $${total}$.`, `$${sum} \\div ${total} = ${decFrac(mean)}$`],
    };
  },
};

const etendue: Skill = {
  id: '5e-etendue',
  name: 'Calculer une étendue',
  generate(rng, level) {
    const n = level === 1 ? 5 : 7;
    const xs = Array.from({ length: n }, () => (level === 3 ? rng.int(-80, 150) / 10 : rng.int(level === 1 ? 0 : -8, 30)));
    const lo = Math.min(...xs);
    const hi = Math.max(...xs);
    const range = Math.round((hi - lo) * 10) / 10;
    return {
      skill: '5e-etendue',
      level,
      prompt: `Voici les températures relevées (en °C) : $${xs.map(dec).join(' \\; ; \\; ')}$. Quelle est l'étendue de cette série ?`,
      answer: num(range),
      hint: 'L’étendue est la différence entre la plus grande et la plus petite valeur.',
      correction: [`Plus grande valeur : $${dec(hi)}$ ; plus petite : $${dec(lo)}$.`, `$${dec(hi)} - ${lo < 0 ? `(${dec(lo)})` : dec(lo)} = ${dec(range)}$`],
    };
  },
};

export const STATISTIQUES_SKILLS: Skill[] = [effectif, frequence, moyenne, ponderee, etendue];
