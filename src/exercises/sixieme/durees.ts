import type { Skill } from '../types';
import { byLevel, fix, num, numAnswer, pairAnswer, prenom, skill } from './outils';

/** Durées et horaires : conversions, durée entre deux horaires, horaire d'arrivée, durées décimales. */

/** Horaire « 8 h 05 ». */
export const hm = (minutes: number): string => {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${h}\\text{ h }${String(m).padStart(2, '0')}`;
};

/** Durée « 2 h 15 min ». */
const duree = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}\\text{ min}`;
  return m === 0 ? `${h}\\text{ h}` : `${h}\\text{ h }${m}\\text{ min}`;
};

const convertir: Skill = skill('convertir-duree', 'Convertir des durées', (rng, level) => {
  const kind = byLevel(level, rng.pick(['hmin', 'minsec']), rng.pick(['hmin', 'minh']), rng.pick(['minh', 'jours']));
  if (kind === 'hmin') {
    const h = rng.int(1, 5);
    const m = rng.int(1, 59);
    return {
      prompt: `Combien de minutes y a-t-il dans $${duree(h * 60 + m)}$ ?`,
      answer: numAnswer(h * 60 + m),
      hint: '$1$ h $= 60$ min.',
      correction: [`$${h} \\times 60 + ${m} = ${h * 60 + m}$ min.`],
    };
  }
  if (kind === 'minsec') {
    const m = rng.int(1, 9);
    const s = rng.int(1, 59);
    return {
      prompt: `Combien de secondes y a-t-il dans $${m}\\text{ min }${s}\\text{ s}$ ?`,
      answer: numAnswer(m * 60 + s),
      hint: '$1$ min $= 60$ s.',
      correction: [`$${m} \\times 60 + ${s} = ${m * 60 + s}$ s.`],
    };
  }
  if (kind === 'jours') {
    const d = rng.int(1, 4);
    const h = rng.int(1, 23);
    return {
      prompt: `Combien d'heures y a-t-il dans $${d}$ jour${d > 1 ? 's' : ''} et $${h}$ h ?`,
      answer: numAnswer(d * 24 + h),
      hint: '$1$ jour $= 24$ h.',
      correction: [`$${d} \\times 24 + ${h} = ${d * 24 + h}$ h.`],
    };
  }
  const total = rng.int(61, 400);
  return {
    prompt: `Convertis $${total}$ min en heures et minutes.`,
    answer: pairAnswer(Math.floor(total / 60), total % 60, ['Heures', 'Minutes']),
    hint: `Cherche combien de fois $60$ va dans $${total}$ : c'est une division euclidienne.`,
    correction: [`$${total} = 60 \\times ${Math.floor(total / 60)} + ${total % 60}$`, `$${total}$ min $= ${duree(total)}$`],
  };
});

const calculDuree: Skill = skill('calcul-duree', 'Calculer une durée entre deux horaires', (rng, level) => {
  const start = rng.int(6 * 60, 18 * 60);
  const length = byLevel(level, rng.int(1, 6) * 15, rng.int(20, 180), rng.int(40, 300));
  const end = start + length;
  const who = prenom(rng);
  return {
    prompt: `${who} part à $${hm(start)}$ et arrive à $${hm(end)}$. Combien de minutes a duré le trajet ?`,
    answer: numAnswer(length),
    hint: `Compte d'abord jusqu'à l'heure pile suivante, puis les heures entières, puis les minutes restantes.`,
    correction: [`De $${hm(start)}$ à $${hm(end)}$, il s'écoule $${duree(length)}$, soit $${length}$ min.`],
  };
});

const arrivee: Skill = skill('heure-arrivee', 'Calculer un horaire d’arrivée', (rng, level) => {
  const start = rng.int(6 * 60, 18 * 60);
  const length = byLevel(level, rng.int(1, 8) * 10, rng.int(20, 150), rng.int(60, 330));
  const end = start + length;
  return {
    prompt: `Un train part à $${hm(start)}$. Le voyage dure $${duree(length)}$. À quelle heure arrive-t-il ?`,
    answer: pairAnswer(Math.floor(end / 60) % 24, end % 60, ['Heures', 'Minutes']),
    hint: 'Ajoute les heures, puis les minutes ; si les minutes dépassent 60, fais une heure de plus.',
    correction: [`$${hm(start)} + ${duree(length)} = ${hm(end)}$`],
  };
});

const decimale: Skill = skill('duree-decimale', 'Passer d’une durée décimale aux minutes', (rng, level) => {
  const pool: [number, number][] = byLevel(
    level,
    [[0.5, 30], [1.5, 90], [2.5, 150]],
    [[0.25, 15], [0.75, 45], [1.25, 75], [0.5, 30], [2.75, 165]],
    [[0.1, 6], [0.2, 12], [1.2, 72], [0.3, 18], [2.4, 144], [0.05, 3]],
  );
  const [hours, minutes] = rng.pick(pool);
  if (level >= 2 && rng.next() < 0.4) {
    return {
      prompt: `Écris $${minutes}$ min en heures, sous forme décimale.`,
      answer: numAnswer(hours),
      hint: `$1$ min $= \\frac{1}{60}$ h : divise par $60$.`,
      correction: [`$${minutes} \\div 60 = ${num(hours)}$ h.`],
    };
  }
  return {
    prompt: `Un film dure $${num(hours)}$ h. Combien de minutes cela fait-il ?`,
    answer: numAnswer(minutes),
    hint: `$${num(hours)}$ h, c'est $${num(hours)} \\times 60$ min. Attention : $${num(hours)}$ h n'est pas $${Math.floor(hours)}$ h $${Math.round(fix(hours - Math.floor(hours)) * 100)}$ min !`,
    correction: [`$${num(hours)} \\times 60 = ${minutes}$ min.`],
  };
});

const somme: Skill = skill('somme-durees', 'Additionner des durées', (rng, level) => {
  const n = byLevel(level, 2, 2, 3);
  const parts = Array.from({ length: n }, () => rng.int(byLevel(level, 10, 20, 25), byLevel(level, 50, 100, 140)));
  const total = parts.reduce((a, b) => a + b, 0);
  return {
    prompt: `Un élève fait ses devoirs en ${n} fois : $${parts.map(duree).join('$, $')}$. Combien de temps a-t-il travaillé en tout ?`,
    answer: pairAnswer(Math.floor(total / 60), total % 60, ['Heures', 'Minutes']),
    hint: 'Additionne les heures d’un côté, les minutes de l’autre, puis convertis 60 min en 1 h.',
    correction: [`En tout : $${total}$ min $= ${duree(total)}$.`],
  };
});

export const DUREES_SKILLS: Skill[] = [convertir, calculDuree, arrivee, decimale, somme];
