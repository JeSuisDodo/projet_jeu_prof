import type { Variant } from '../../variantes';
import { ALGEBRE_3E } from './algebre';
import { DONNEES_3E } from './donnees';
import { FONCTIONS_3E } from './fonctions';
import { GEOMETRIE_3E } from './geometrie';
import { NOMBRES_3E } from './nombres';

/** Toutes les variantes d'exercices de 3e, par identifiant de compétence. */
export const VARIANTES_3E: Record<string, Variant[]> = {
  ...NOMBRES_3E,
  ...ALGEBRE_3E,
  ...FONCTIONS_3E,
  ...GEOMETRIE_3E,
  ...DONNEES_3E,
};
