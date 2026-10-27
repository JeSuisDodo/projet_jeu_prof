import { NOUVELLES_4E } from '../../quatrieme/variantes/nouvelles';
import { ALGEBRE_3E } from '../../troisieme/variantes/algebre';
import { DONNEES_3E } from '../../troisieme/variantes/donnees';
import { FONCTIONS_3E } from '../../troisieme/variantes/fonctions';
import { GEOMETRIE_3E } from '../../troisieme/variantes/geometrie';
import { NOMBRES_3E } from '../../troisieme/variantes/nombres';
import { type Variant, pickVariants, mergeCatalogs } from '../../variantes';
import { NOUVELLES_5E } from './nouvelles';

/** Variantes de 3e et de 4e déjà au niveau de la 5e. */
const REPRISES_5E: Record<string, Variant[]> = {
  '5e-divisibilite': pickVariants(NOMBRES_3E, '3e-divisibilite', ['chiffre-manquant', 'vrai-faux']),
  '5e-premier': pickVariants(NOMBRES_3E, '3e-premier', ['compter', 'plus-petit-diviseur']),
  '5e-diviseurs': pickVariants(NOUVELLES_4E, '4e-liste-diviseurs', ['compter', 'communs']),
  '5e-multiples': pickVariants(NOMBRES_3E, '3e-multiples-communs', ['piles']),
  '5e-fraction-comparer': pickVariants(NOUVELLES_4E, '4e-comparer-fractions', ['la-plus-grande']),
  '5e-fraction-somme': pickVariants(NOUVELLES_4E, '4e-somme-fractions', ['entier-plus-fraction']),
  '5e-fraction-quantite': pickVariants(NOUVELLES_4E, '4e-fraction-de', ['retrouver-total']),
  '5e-substituer': pickVariants(FONCTIONS_3E, '3e-image', ['tableur']),
  '5e-tester-egalite': pickVariants(NOUVELLES_4E, '4e-tester-valeur', ['deux-membres']),
  '5e-simplifier-ecriture': pickVariants(NOUVELLES_4E, '4e-reduire', ['vrai-faux']),
  '5e-reduire': pickVariants(NOUVELLES_4E, '4e-reduire', ['perimetre']),
  '5e-programme-calcul': pickVariants(ALGEBRE_3E, '3e-programme-calcul', ['retrouver-depart']),
  '5e-relatifs-probleme': pickVariants(NOUVELLES_4E, '4e-priorites-relatifs', ['temperatures']),
  '5e-proba-vocabulaire': pickVariants(NOUVELLES_4E, '4e-proba-vocabulaire', ['vrai-faux']),
  '5e-proba-de': pickVariants(DONNEES_3E, '3e-proba-de', ['multiple']),
  '5e-proba-urne': pickVariants(DONNEES_3E, '3e-proba-urne', ['composition', 'ajouter']),
  '5e-proba-contraire': pickVariants(DONNEES_3E, '3e-proba-contraire', ['pourcentage']),
  '5e-proba-comparer': pickVariants(DONNEES_3E, '3e-proba-de', ['equitable']),
  '5e-reconnaitre-proportionnalite': pickVariants(NOUVELLES_4E, '4e-reconnaitre-proportionnalite', ['situations']),
  '5e-quatrieme-proportionnelle': pickVariants(FONCTIONS_3E, '3e-quatrieme-proportionnelle', ['recette']),
  '5e-pourcentage': pickVariants(FONCTIONS_3E, '3e-pourcentage', ['taux']),
  '5e-ratio': pickVariants(FONCTIONS_3E, '3e-ratio', ['simplifier', 'total']),
  '5e-echelle': pickVariants(NOUVELLES_4E, '4e-echelle', ['distance-sur-carte']),
  '5e-conversion-volumes': pickVariants(GEOMETRIE_3E, '3e-conversion-volume', ['verres']),
  '5e-contenance': pickVariants(GEOMETRIE_3E, '3e-conversion-volume', ['aquarium']),
  '5e-symetrique-point': pickVariants(NOUVELLES_4E, '4e-symetrie-centrale', ['trouver-centre']),
  '5e-effectif': pickVariants(DONNEES_3E, '3e-frequence', ['effectif']),
  '5e-frequence': pickVariants(DONNEES_3E, '3e-frequence', ['decimale']),
  '5e-moyenne': pickVariants(DONNEES_3E, '3e-moyenne', ['note-manquante']),
  '5e-moyenne-ponderee': pickVariants(DONNEES_3E, '3e-moyenne-ponderee', ['tableau-effectifs']),
  '5e-etendue': pickVariants(DONNEES_3E, '3e-etendue', ['valeur-manquante']),
  '5e-algo-polygone': pickVariants(DONNEES_3E, '3e-algo-figure', ['nombre-cotes']),
  '5e-algo-variable': pickVariants(DONNEES_3E, '3e-algo-boucle', ['tant-que', 'somme']),
  '5e-algo-condition': pickVariants(DONNEES_3E, '3e-algo-condition', ['tarif']),
};

/** Toutes les variantes d'exercices de 5e, par identifiant de compétence. */
export const VARIANTES_5E = mergeCatalogs(REPRISES_5E, NOUVELLES_5E);
