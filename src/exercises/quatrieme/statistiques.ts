import { frac } from '../fraction';
import type { Rng } from '../rng';
import type { Skill } from '../types';
import { dec, num, numDec, numF, skill, tex } from './util';

/** Chapitre « Statistiques » (4e) : moyenne, moyenne pondérée, médiane, étendue, fréquences. */

/** Série de n entiers dont la moyenne est un décimal à au plus une décimale. */
function series(rng: Rng, n: number, lo: number, hi: number): number[] {
  for (let guard = 0; guard < 100; guard++) {
    const xs = Array.from({ length: n }, () => rng.int(lo, hi));
    const s = xs.reduce((a, b) => a + b, 0);
    if ((s * 10) % n === 0) return xs;
  }
  const xs = Array.from({ length: n - 1 }, () => rng.int(lo, hi));
  const s = xs.reduce((a, b) => a + b, 0);
  return [...xs, n * Math.ceil(s / (n - 1)) - s];
}

const moyenne = skill('4e-moyenne', 'Calculer une moyenne', (rng, level) => {
  const n = rng.int(level === 1 ? 4 : 5, level === 3 ? 9 : 6);
  const xs = series(rng, n, level === 1 ? 5 : 0, 20);
  const s = xs.reduce((a, b) => a + b, 0);
  const m = s / n;
  return {
    prompt: `${rng.pick(['Voici les notes de Jade sur 20', 'Voici le nombre de buts marqués par match', 'Voici les températures relevées (en °C)'])} : ${xs.join(' ; ')}. Calcule la moyenne de cette série.`,
    answer: numDec(m),
    hint: 'Moyenne = somme des valeurs ÷ nombre de valeurs.',
    correction: [`Somme : $${xs.join(' + ')} = ${s}$.`, `Moyenne : $${s} \\div ${n} = ${dec(m)}$.`],
  };
});

const ponderee = skill('4e-moyenne-ponderee', 'Calculer une moyenne pondérée', (rng, level) => {
  for (let guard = 0; ; guard++) {
    const k = level === 1 ? 3 : 4;
    const values = Array.from({ length: k }, (_, i) => (level === 3 ? rng.int(8, 16) * 5 : 35 + 2 * i + rng.int(0, 1)));
    const uniq = [...new Set(values)].sort((a, b) => a - b);
    const counts = uniq.map(() => rng.int(1, level === 3 ? 12 : 8));
    const N = counts.reduce((a, b) => a + b, 0);
    const S = uniq.reduce((a, v, i) => a + v * counts[i], 0);
    if ((S * 10) % N !== 0 && guard < 60) continue;
    const m = frac(S, N);
    const decimalOk = (S * 10) % N === 0;
    const table = `\\begin{array}{|l|${'c|'.repeat(uniq.length)}} \\hline \\text{Valeur} & ${uniq.join(' & ')} \\\\ \\hline \\text{Effectif} & ${counts.join(' & ')} \\\\ \\hline \\end{array}`;
    return {
      prompt: `${level === 3 ? 'Prix (en €) de places de concert vendues' : 'Pointures des élèves d’un club'} : $${table}$ Calcule la moyenne de cette série${decimalOk ? '' : ' (valeur exacte, en fraction)'}.`,
      answer: decimalOk ? numDec(S / N) : numF(m),
      hint: 'Multiplie chaque valeur par son effectif, additionne, puis divise par l’effectif total.',
      correction: [`$${uniq.map((v, i) => `${v} \\times ${counts[i]}`).join(' + ')} = ${S}$ et l’effectif total est $${N}$.`, `Moyenne : $\\dfrac{${S}}{${N}} = ${decimalOk ? dec(S / N) : tex(m)}$.`],
    };
  }
});

const mediane = skill('4e-mediane', 'Trouver la médiane', (rng, level) => {
  const n = level === 1 ? rng.pick([5, 7]) : rng.int(6, 11);
  const xs = Array.from({ length: n }, () => rng.int(0, 30));
  const sorted = [...xs].sort((a, b) => a - b);
  const med = n % 2 === 1 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
  return {
    prompt: `Trouve la médiane de la série : ${xs.join(' ; ')}.`,
    answer: numDec(med),
    hint: 'Range d’abord les valeurs dans l’ordre croissant. La médiane partage la série en deux groupes de même effectif.',
    correction: [
      `Série rangée : ${sorted.join(' ; ')} (${n} valeurs).`,
      n % 2 === 1
        ? `L’effectif est impair : la médiane est la ${(n + 1) / 2}ᵉ valeur, soit $${med}$.`
        : `L’effectif est pair : la médiane est la moyenne des ${n / 2}ᵉ et ${n / 2 + 1}ᵉ valeurs, $\\dfrac{${sorted[n / 2 - 1]} + ${sorted[n / 2]}}{2} = ${dec(med)}$.`,
    ],
  };
});

const etendue = skill('4e-etendue', 'Calculer une étendue', (rng, level) => {
  const n = rng.int(5, 9);
  const negative = level >= 2;
  const xs = Array.from({ length: n }, () => (negative ? rng.int(-12, 25) : rng.int(0, 50)));
  const max = Math.max(...xs);
  const min = Math.min(...xs);
  return {
    prompt: `${negative ? 'Températures relevées à midi (en °C)' : 'Nombre de visiteurs par jour'} : ${xs.join(' ; ')}. Quelle est l’étendue de cette série ?`,
    answer: num(max - min),
    hint: 'Étendue = plus grande valeur − plus petite valeur.',
    correction: [`$${max} - ${min < 0 ? `(${min})` : min} = ${max - min}$`],
  };
});

const frequence = skill('4e-frequence', 'Calculer une fréquence en pourcentage', (rng, level) => {
  const total = rng.pick(level === 1 ? [10, 20, 25, 50] : level === 2 ? [20, 25, 40, 50, 80] : [16, 32, 40, 125, 200]);
  const part = rng.int(1, total - 1);
  const pct = (part * 100) / total;
  return {
    prompt: `Sur ${total} élèves interrogés, ${part} préfèrent le basket. Quelle est la fréquence de cette réponse, en pourcentage ?`,
    answer: numDec(pct),
    hint: 'Fréquence = effectif ÷ effectif total ; on multiplie par 100 pour l’avoir en pourcentage.',
    correction: [`$\\dfrac{${part}}{${total}} = ${dec(part / total)} = ${dec(pct)}\\,\\%$`],
  };
});

export const STATISTIQUES_SKILLS: Skill[] = [moyenne, ponderee, mediane, etendue, frequence];
