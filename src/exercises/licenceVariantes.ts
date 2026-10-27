import type { Rng } from './rng';
import { type Level, type Skill, makeChoice } from './types';
import { type Draft, fixedChoice, skill } from './terminale/util';

/**
 * Variantes des compétences de Licence : chaque compétence garde son identifiant (sauvegarde)
 * et tire au hasard, à chaque exercice, sa forme d'origine ou l'une de ses variantes
 * (problème concret, question inverse, vrai/faux, erreur classique…).
 */

export type Maker = (rng: Rng, level: Level) => Draft;

/** Table « identifiant de compétence → variantes supplémentaires ». */
export type Variantes = Record<string, Maker[]>;

/** Compétence enrichie : `variants[0]` est la forme d'origine, les suivantes sont les nouvelles. */
export interface VariedSkill extends Skill {
  variants: Skill[];
}

type Wrap = (id: string, name: string, make: Maker) => Skill;

export function varier(base: Skill, extras: Maker[], wrap: Wrap = skill): VariedSkill {
  const variants = [base, ...extras.map((m) => wrap(base.id, base.name, m))];
  return { id: base.id, name: base.name, variants, generate: (rng, level) => rng.pick(variants).generate(rng, level) };
}

/** Ajoute à chaque compétence de la liste les variantes de la table (identifiants vérifiés). */
export function enrichir(skills: Skill[], table: Variantes, wrap: Wrap = skill): Skill[] {
  for (const id of Object.keys(table)) if (!skills.some((s) => s.id === id)) throw new Error(`Variantes pour une compétence inconnue : ${id}`);
  return skills.map((s) => (table[s.id]?.length ? varier(s, table[s.id], wrap) : s));
}

/** Forme d'origine d'une compétence, éventuellement enrichie. */
export const origine = (s: Skill): Skill => (s as Partial<VariedSkill>).variants?.[0] ?? s;

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
