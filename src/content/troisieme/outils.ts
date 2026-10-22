import type { CreatureDef, CreatureShape } from '../types';

/** Raccourci pour déclarer une créature de 3e (identifiant préfixé automatiquement). */
export const creature = (
  id: string,
  name: string,
  description: string,
  skills: string[],
  shape: CreatureShape,
  hue: number,
  symbol?: string,
): CreatureDef => ({ id: `3e-${id}`, name, description, skills, look: { shape, hue, symbol } });
