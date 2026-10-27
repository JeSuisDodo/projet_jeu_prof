import type { Rng } from './rng';
import type { Exercise, Level, Skill } from './types';

/**
 * Variantes d'une compétence : autant de façons de poser la même notion (problème concret,
 * question inverse, vrai/faux, erreur classique à repérer…). L'identifiant de la compétence ne
 * change pas, la sauvegarde reste donc valable.
 */

export type Draft = Omit<Exercise, 'skill' | 'level'>;

export interface Variante {
  /** Nom court, unique dans la compétence (sert aux tests). */
  nom: string;
  make: (rng: Rng, level: Level) => Draft;
}

export interface SkillVarie extends Skill {
  variantes: Variante[];
}

export const variante = (nom: string, make: Variante['make']): Variante => ({ nom, make });

/**
 * Tire au hasard entre l'exercice d'origine et ses variantes, à parts égales.
 * Le tirage passe par le même `rng` : un exercice se rejoue toujours depuis sa graine.
 */
export function varier(base: Skill, variantes: Variante[]): SkillVarie {
  return {
    id: base.id,
    name: base.name,
    variantes,
    generate(rng, level) {
      const k = rng.int(0, variantes.length);
      if (k === variantes.length) return base.generate(rng, level);
      return { skill: base.id, level, ...variantes[k].make(rng, level) };
    },
  };
}

/** Une variante précise, pour les tests. */
export function genererVariante(skill: Skill, nom: string, rng: Rng, level: Level): Exercise {
  const v = (skill as SkillVarie).variantes?.find((x) => x.nom === nom);
  if (!v) throw new Error(`Variante inconnue : ${skill.id} / ${nom}`);
  return { skill: skill.id, level, ...v.make(rng, level) };
}
