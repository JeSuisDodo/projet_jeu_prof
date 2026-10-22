import type { Skill } from '../../exercises/types';
import type { CreatureDef, CreatureLook } from '../types';

/** Raccourcis pour déclarer les créatures des chapitres de 4e. */

export const creature = (id: string, name: string, description: string, skills: string[], look: CreatureLook): CreatureDef => ({
  id,
  name,
  description,
  skills,
  look,
});

/** Le gardien pose toutes les compétences du chapitre. */
export const bossOf = (id: string, name: string, description: string, skills: Skill[], look: CreatureLook): CreatureDef =>
  creature(id, name, description, skills.map((s) => s.id), look);
