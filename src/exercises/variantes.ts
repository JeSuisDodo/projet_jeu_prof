import type { Rng } from './rng';
import type { Exercise, Level, Skill } from './types';

/**
 * Variantes d'exercices : une compétence peut poser sa question sous plusieurs formes (problème
 * concret, question inverse, vrai ou faux, erreur à trouver…). `generate` tire une forme au sort
 * parmi celles permises au niveau, la forme d'origine comprise. Les identifiants ne changent pas,
 * la sauvegarde n'est donc pas touchée.
 */

export type Draft = Omit<Exercise, 'skill' | 'level'>;

export interface Variant {
  /** Nom court, unique dans la compétence (sert aux tests). */
  name: string;
  /** Niveau à partir duquel la variante peut sortir (1 par défaut). */
  from?: Level;
  make: (rng: Rng, level: Level) => Draft;
}

/** Raccourci pour écrire une variante : `variant('nom', (rng, level) => ({ … }))`. */
export const variant = (name: string, make: Variant['make'], from?: Level): Variant => ({ name, make, from });

/** Ajoute des variantes à une compétence existante. */
export function enrich(base: Skill, variants: Variant[]): Skill {
  const forms = [
    // Appel lié à `base` : certains générateurs lisent `this.id`.
    { name: 'origine', from: 1 as Level, generate: (rng: Rng, level: Level) => base.generate(rng, level) },
    ...variants.map((v) => ({
      name: v.name,
      from: v.from ?? 1,
      generate: (rng: Rng, level: Level): Exercise => ({ skill: base.id, level, ...v.make(rng, level) }),
    })),
  ];
  return {
    ...base,
    variants: forms,
    generate: (rng, level) => rng.pick(forms.filter((f) => f.from <= level)).generate(rng, level),
  };
}

/** Applique un catalogue `{ identifiant de compétence: variantes }` à une liste de compétences. */
export function enrichAll(skills: Skill[], catalog: Record<string, Variant[]>): Skill[] {
  return skills.map((s) => (catalog[s.id] ? enrich(s, catalog[s.id]) : s));
}

/** Vérifie que chaque entrée du catalogue porte sur une compétence existante (appelé par les tests). */
export const unknownIds = (skills: Skill[], catalog: Record<string, Variant[]>): string[] =>
  Object.keys(catalog).filter((id) => !skills.some((s) => s.id === id));

/** Forme d'origine d'une compétence (pour les tests qui relisent son énoncé). */
export function baseOf(skill: Skill): Skill {
  return skill.variants ? { ...skill, generate: skill.variants[0].generate } : skill;
}

/** Une forme précise d'une compétence. */
export function variantOf(skill: Skill, name: string): (rng: Rng, level: Level) => Exercise {
  const v = skill.variants?.find((x) => x.name === name);
  if (!v) throw new Error(`Variante inconnue : ${skill.id} / ${name}`);
  return v.generate;
}

/** Enrichit les compétences de chaque chapitre ; une entrée du catalogue sans compétence est une erreur. */
export function enrichChapters<C extends { skills: Skill[] }>(chapters: C[], catalog: Record<string, Variant[]>): C[] {
  const unknown = unknownIds(chapters.flatMap((c) => c.skills), catalog);
  if (unknown.length) throw new Error(`Variantes pour des compétences inconnues : ${unknown.join(', ')}`);
  return chapters.map((c) => ({ ...c, skills: enrichAll(c.skills, catalog) }));
}

/** Reprend certaines variantes d'un catalogue (par exemple celles de 3e pour la 4e). */
export function pickVariants(catalog: Record<string, Variant[]>, id: string, names: string[]): Variant[] {
  return names.map((n) => {
    const v = catalog[id]?.find((x) => x.name === n);
    if (!v) throw new Error(`Variante absente : ${id} / ${n}`);
    return v;
  });
}

/** Réunit plusieurs catalogues, compétence par compétence. */
export function mergeCatalogs(...catalogs: Record<string, Variant[]>[]): Record<string, Variant[]> {
  const out: Record<string, Variant[]> = {};
  for (const c of catalogs) for (const [id, vs] of Object.entries(c)) out[id] = [...(out[id] ?? []), ...vs];
  return out;
}
