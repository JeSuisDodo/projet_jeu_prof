import { NOUVELLES_5E } from '../../cinquieme/variantes/nouvelles';
import { NOUVELLES_4E } from '../../quatrieme/variantes/nouvelles';
import { GEOMETRIE_3E } from '../../troisieme/variantes/geometrie';
import { NOMBRES_3E } from '../../troisieme/variantes/nombres';
import { type Variant, mergeCatalogs, pickVariants } from '../../variantes';
import { NOUVELLES_6E } from './nouvelles';

/** Variantes des classes suivantes déjà au niveau de la 6e. */
const REPRISES_6E: Record<string, Variant[]> = {
  '6e-criteres': pickVariants(NOMBRES_3E, '3e-divisibilite', ['chiffre-manquant']),
  '6e-division-euclidienne': pickVariants(NOUVELLES_5E, '5e-division-euclidienne', ['calendrier', 'dividende']),
  '6e-calcul-mental': pickVariants(NOUVELLES_5E, '5e-calcul-astucieux', ['regrouper', 'presque-cent']),
  '6e-formule': pickVariants(NOUVELLES_5E, '5e-substituer', ['formule']),
  '6e-priorites': pickVariants(NOUVELLES_5E, '5e-priorites', ['erreur-classique']),
  '6e-aire-composee': pickVariants(NOUVELLES_5E, '5e-aire-composee', ['cadre']),
  '6e-volume-pave': pickVariants(NOUVELLES_5E, '5e-volume-pave', ['arete-cube']),
  '6e-fraction-quotient': pickVariants(NOUVELLES_5E, '5e-quotient', ['partage']),
  '6e-nature-triangle': pickVariants(NOUVELLES_5E, '5e-nature-triangle', ['cotes']),
  '6e-aire-triangle': pickVariants(NOUVELLES_5E, '5e-aire-triangle', ['hauteur']),
  '6e-perimetre-cercle': pickVariants(NOUVELLES_5E, '5e-perimetre-cercle', ['rayon', 'tours-de-roue']),
  '6e-cote-manquant': pickVariants(NOUVELLES_5E, '5e-parallelogramme-cotes', ['losange']),
  '6e-conversion-aire': pickVariants(NOUVELLES_5E, '5e-conversion-aires', ['hectares']),
  '6e-fractions-egales': pickVariants(NOUVELLES_5E, '5e-fraction-egale', ['vrai-faux']),
  '6e-conversion-volume': pickVariants(GEOMETRIE_3E, '3e-conversion-volume', ['verres', 'aquarium']),
  '6e-proportionnel-ou-pas': pickVariants(NOUVELLES_4E, '4e-reconnaitre-proportionnalite', ['situations']),
};

/** Toutes les variantes d'exercices de 6e, par identifiant de compétence. */
export const VARIANTES_6E = mergeCatalogs(REPRISES_6E, NOUVELLES_6E);
