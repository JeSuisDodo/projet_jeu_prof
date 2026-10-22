import { type Frac, fracEq, parseFrac, parseFracLists } from './fraction';
import type { Rng } from './rng';

/** Difficulté d'une créature : 1 = nombres simples, 3 = coefficients et racines plus délicats. */
export type Level = 1 | 2 | 3;

export type Answer =
  | { kind: 'number'; value: Frac }
  /** Ensemble de solutions, sans ordre ; vide quand il n'y en a pas. */
  | { kind: 'set'; values: Frac[] }
  /** Couple ordonné, par exemple les coordonnées du sommet. */
  | { kind: 'pair'; values: [Frac, Frac]; labels: [string, string] }
  | { kind: 'choice'; options: string[]; correct: number };

/** Les textes peuvent contenir du LaTeX entre $…$. */
export interface Exercise {
  skill: string;
  level: Level;
  prompt: string;
  answer: Answer;
  hint: string;
  correction: string[];
}

export interface Skill {
  id: string;
  name: string;
  generate: (rng: Rng, level: Level) => Exercise;
}

/** Une réponse saisie : texte libre, ou index de l'option choisie pour un QCM. */
export type Response = string | number | [string, string];

export function checkAnswer(answer: Answer, response: Response): boolean {
  switch (answer.kind) {
    case 'number': {
      const f = typeof response === 'string' ? parseFrac(response) : null;
      return f !== null && fracEq(f, answer.value);
    }
    case 'set': {
      if (typeof response !== 'string') return false;
      const expected = answer.values;
      // L'ordre et les doublons ne comptent pas ; une seule lecture correcte suffit.
      return parseFracLists(response).some((list) => {
        const unique = list.filter((f, i) => list.findIndex((g) => fracEq(f, g)) === i);
        return unique.length === expected.length && expected.every((e) => unique.some((u) => fracEq(u, e)));
      });
    }
    case 'pair': {
      if (!Array.isArray(response)) return false;
      return response.every((r, i) => {
        const f = parseFrac(r);
        return f !== null && fracEq(f, answer.values[i]);
      });
    }
    case 'choice':
      return response === answer.correct;
  }
}

/** Place la bonne option parmi des leurres distincts (4 options au total). */
export function makeChoice(rng: Rng, correct: string, decoys: string[], filler: () => string): Answer {
  const pool = [...new Set(decoys)].filter((d) => d !== correct);
  let guard = 0;
  while (pool.length < 3 && guard++ < 50) {
    const extra = filler();
    if (extra !== correct && !pool.includes(extra)) pool.push(extra);
  }
  const options = rng.shuffle([correct, ...rng.shuffle(pool).slice(0, 3)]);
  return { kind: 'choice', options, correct: options.indexOf(correct) };
}
