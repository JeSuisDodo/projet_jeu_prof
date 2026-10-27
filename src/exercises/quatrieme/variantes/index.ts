import { ALGEBRE_3E } from '../../troisieme/variantes/algebre';
import { DONNEES_3E } from '../../troisieme/variantes/donnees';
import { FONCTIONS_3E } from '../../troisieme/variantes/fonctions';
import { GEOMETRIE_3E } from '../../troisieme/variantes/geometrie';
import { NOMBRES_3E } from '../../troisieme/variantes/nombres';
import type { Variant } from '../../variantes';
import { NOUVELLES_4E } from './nouvelles';

/** Garde certaines variantes d'une compétence de 3e, déjà au niveau de la 4e. */
const from3e = (catalog: Record<string, Variant[]>, id: string, names: string[]): Variant[] => {
  const all = catalog[id];
  return names.map((n) => {
    const v = all.find((x) => x.name === n);
    if (!v) throw new Error(`Variante de 3e absente : ${id} / ${n}`);
    return v;
  });
};

const REPRISES_4E: Record<string, Variant[]> = {
  '4e-nombre-premier': from3e(NOMBRES_3E, '3e-premier', ['compter', 'plus-petit-diviseur', 'piege-impair']),
  '4e-criteres-divisibilite': from3e(NOMBRES_3E, '3e-divisibilite', ['chiffre-manquant', 'vrai-faux', 'diviseurs-communs']),
  '4e-decomposition': from3e(NOMBRES_3E, '3e-decomposition', ['recomposer', 'nombre-diviseurs']),
  '4e-multiple-commun': from3e(NOMBRES_3E, '3e-multiples-communs', ['engrenage', 'piles']),
  '4e-puissance-entier': from3e(NOMBRES_3E, '3e-puissance-calcul', ['signe', 'comparer']),
  '4e-regles-puissances-10': from3e(NOMBRES_3E, '3e-puissance-calcul', ['puissance-de-dix']),
  '4e-notation-scientifique': from3e(NOMBRES_3E, '3e-notation-scientifique', ['grandeur-reelle', 'produit']),
  '4e-substituer': from3e(FONCTIONS_3E, '3e-image', ['tableur', 'carre-negatif']),
  '4e-developper-simple': from3e(ALGEBRE_3E, '3e-developper-simple', ['deux-produits', 'erreur-signe']),
  '4e-double-distributivite': from3e(ALGEBRE_3E, '3e-developper-double', ['coefficient', 'aire-rectangle']),
  '4e-factoriser': from3e(ALGEBRE_3E, '3e-factoriser', ['facteur-x', 'plus-grand-facteur']),
  '4e-equation-simple': from3e(ALGEBRE_3E, '3e-equation', ['fraction']),
  '4e-equation-deux-membres': from3e(ALGEBRE_3E, '3e-equation', ['egalite-expressions']),
  '4e-equation-parentheses': from3e(ALGEBRE_3E, '3e-equation', ['deux-parentheses']),
  '4e-mise-en-equation': from3e(ALGEBRE_3E, '3e-mise-en-equation', ['rencontre', 'livres', 'consommations']),
  '4e-conversion-volumes': from3e(GEOMETRIE_3E, '3e-conversion-volume', ['verres', 'aquarium']),
  '4e-hypotenuse': from3e(GEOMETRIE_3E, '3e-pythagore-hypotenuse', ['diagonale-carre']),
  '4e-cote-angle-droit': from3e(GEOMETRIE_3E, '3e-pythagore-cote', ['hauteur-isocele', 'cote-rectangle']),
  '4e-reciproque-pythagore': from3e(GEOMETRIE_3E, '3e-pythagore-reciproque', ['longueur-pour-rectangle', 'corde-noeuds']),
  '4e-pythagore-probleme': from3e(GEOMETRIE_3E, '3e-pythagore-probleme', ['cerf-volant', 'raccourci', 'ecran-pouces']),
  '4e-thales-longueur': from3e(GEOMETRIE_3E, '3e-thales-longueur', ['segment-restant', 'par-difference']),
  '4e-thales-egalite': from3e(GEOMETRIE_3E, '3e-thales-rapports', ['valeur-rapport']),
  '4e-agrandissement-reduction': from3e(GEOMETRIE_3E, '3e-agrandissement', ['aire-vers-longueur', 'maquette']),
  '4e-quatrieme-proportionnelle': from3e(FONCTIONS_3E, '3e-quatrieme-proportionnelle', ['recette', 'produit-en-croix']),
  '4e-pourcentage': from3e(FONCTIONS_3E, '3e-pourcentage', ['taux', 'total']),
  '4e-evolution': from3e(FONCTIONS_3E, '3e-evolution', ['taux-evolution']),
  '4e-vitesse-moyenne': from3e(FONCTIONS_3E, '3e-vitesse', ['aller-retour']),
  '4e-distance-parcourue': from3e(FONCTIONS_3E, '3e-vitesse', ['distance']),
  '4e-duree-trajet': from3e(FONCTIONS_3E, '3e-duree', ['heure-arrivee']),
  '4e-conversion-vitesse': from3e(FONCTIONS_3E, '3e-conversion-vitesse', ['plus-rapide', 'par-minute']),
  '4e-grandeur-composee': from3e(FONCTIONS_3E, '3e-debit', ['deux-robinets', 'conversion']),
  '4e-moyenne': from3e(DONNEES_3E, '3e-moyenne', ['note-manquante', 'ajout-valeur']),
  '4e-moyenne-ponderee': from3e(DONNEES_3E, '3e-moyenne-ponderee', ['tableau-effectifs']),
  '4e-mediane': from3e(DONNEES_3E, '3e-mediane', ['effectif-pair', 'mediane-ou-moyenne']),
  '4e-etendue': from3e(DONNEES_3E, '3e-etendue', ['valeur-manquante']),
  '4e-frequence': from3e(DONNEES_3E, '3e-frequence', ['effectif', 'decimale']),
  '4e-proba-urne': from3e(DONNEES_3E, '3e-proba-urne', ['composition', 'ajouter']),
  '4e-proba-de': from3e(DONNEES_3E, '3e-proba-de', ['multiple', 'equitable']),
  '4e-evenement-contraire': from3e(DONNEES_3E, '3e-proba-contraire', ['pourcentage']),
};

/** Toutes les variantes d'exercices de 4e, par identifiant de compétence. */
export const VARIANTES_4E: Record<string, Variant[]> = Object.fromEntries(
  [...new Set([...Object.keys(REPRISES_4E), ...Object.keys(NOUVELLES_4E)])].map((id) => [id, [...(REPRISES_4E[id] ?? []), ...(NOUVELLES_4E[id] ?? [])]]),
);
