import type { Rng } from './rng';
import { type Level, makeChoice } from './types';
import { type Draft, fixedChoice } from './terminale/util';
import type { Variant } from './variantes';

/**
 * Variantes des compétences de Licence, sur le mécanisme commun de `variantes.ts` : chaque chapitre
 * fournit une table « identifiant de compétence → formes supplémentaires », réunies ici en un
 * catalogue de variantes nommées (« forme-2 », « forme-3 »…, la forme d'origine étant la première).
 */

export type Maker = (rng: Rng, level: Level) => Draft;

/** Table « identifiant de compétence → variantes supplémentaires ». */
export type Variantes = Record<string, Maker[]>;

/** Réunit les tables d'un niveau en un catalogue ; `retouche` nettoie les textes (par exemple pour la L2). */
export function catalogue(tables: Variantes[], retouche: (d: Draft) => Draft = (d) => d): Record<string, Variant[]> {
  const out: Record<string, Variant[]> = {};
  for (const table of tables)
    for (const [id, makers] of Object.entries(table)) {
      const list = (out[id] ??= []);
      for (const make of makers) list.push({ name: `forme-${list.length + 2}`, make: (rng, level) => retouche(make(rng, level)) });
    }
  return out;
}

export const VRAI_FAUX = ['Vrai', 'Faux'];

/** Affirmation à juger vraie ou fausse, avec sa justification. */
export function vraiFaux(statement: string, truth: boolean, why: string[], hint = 'Cherche un contre-exemple, ou rappelle-toi le théorème du cours.'): Draft {
  return {
    prompt: `Vrai ou faux ? ${statement}`,
    answer: fixedChoice(VRAI_FAUX, truth ? 0 : 1),
    hint,
    correction: [truth ? 'Vrai.' : 'Faux.', ...why],
  };
}

/** Une affirmation de cours : son énoncé, sa valeur de vérité et sa justification. */
export interface Fait {
  s: string;
  v: boolean;
  why: string;
}

/** Tire une affirmation dans une banque et la fait juger vraie ou fausse. */
export const vraiFauxBanque = (rng: Rng, banque: readonly Fait[], hint?: string): Draft => {
  const f = rng.pick(banque);
  return vraiFaux(f.s, f.v, [f.why], hint);
};

/**
 * QCM « quelle affirmation est vraie ? » : une vraie et trois fausses tirées dans la banque
 * (ou l'inverse quand `chercherFausse` est vrai).
 */
export function qcmBanque(rng: Rng, banque: readonly Fait[], chercherFausse = false): Draft {
  const bons = banque.filter((f) => f.v !== chercherFausse);
  const mauvais = banque.filter((f) => f.v === chercherFausse);
  const juste = rng.pick(bons);
  const leurres = rng.shuffle(mauvais).slice(0, 3);
  return {
    prompt: chercherFausse ? 'Une seule de ces affirmations est fausse. Laquelle ?' : 'Une seule de ces affirmations est vraie. Laquelle ?',
    answer: makeChoice(rng, juste.s, leurres.map((f) => f.s), () => juste.s),
    hint: 'Teste chaque affirmation sur un exemple simple.',
    correction: [juste.why],
  };
}
