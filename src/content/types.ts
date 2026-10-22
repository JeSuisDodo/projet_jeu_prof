import type { Skill } from '../exercises/types';

/**
 * Contrat d'un niveau du jeu. Chaque classe est une île, chaque chapitre du manuel une région
 * de cette île, avec ses créatures (chacune porte une ou plusieurs compétences) et son gardien.
 *
 * Le moteur (carte, combats, carnet, sauvegarde) ne dépend que de ces types : pour ajouter du
 * contenu, il suffit d'écrire un `ChapterDef` dans `src/content/<classe>/` et de l'ajouter à la
 * liste `chapters` du `GradeDef` de la classe.
 */

export type GradeId = '2nde' | '1re-spe' | 'tle-spe';

/** Ambiance graphique d'une région : couleurs du sol, de la végétation, du « liquide » et des particules. */
export type ThemeId =
  | 'volcan' // lave, braises
  | 'prairie' // eau claire, papillons
  | 'foret' // rivière sombre, feuilles
  | 'neige' // eau glacée, flocons
  | 'desert' // sables mouvants, poussière
  | 'marais' // eau verte, bulles
  | 'cristal' // lac violet, éclats
  | 'plage' // mer, embruns
  | 'automne' // rivière, feuilles rousses
  | 'nuit'; // eau étoilée, lucioles

/** Silhouette de base d'une créature, dessinée par le jeu (pas besoin d'image). */
export type CreatureShape = 'blob' | 'oiseau' | 'bete' | 'plante' | 'golem' | 'poisson' | 'spectre' | 'insecte';

export interface CreatureLook {
  shape: CreatureShape;
  /** Teinte principale, de 0 à 360 (0 rouge, 120 vert, 220 bleu, 280 violet). */
  hue: number;
  /** Un à trois caractères dessinés sur la créature, rappel du chapitre : « Δ », « π », « f′ », « u₀ », « % ». */
  symbol?: string;
}

export interface CreatureDef {
  /** Identifiant unique dans tout le jeu (sert à la sauvegarde) : préfixer par la classe, ex. « 2nde-affinou ». */
  id: string;
  name: string;
  /** Une ou deux phrases pour le carnet, en lien avec la notion. */
  description: string;
  /** Identifiants des compétences (Skill.id) que la créature pose en combat. */
  skills: string[];
  look: CreatureLook;
  /** Dessin SVG fait main (viewBox 0 0 120 120), prioritaire sur `look`. Facultatif. */
  svg?: string;
}

export interface ChapterDef {
  /** Identifiant unique, préfixé par la classe : « 2nde-fonctions-affines ». */
  id: string;
  /** Titre du chapitre tel qu'au programme : « Fonctions affines ». */
  title: string;
  /** Nom de la région dans le jeu : « Prairie des Affines ». */
  region: string;
  theme: ThemeId;
  /** Compétences du chapitre. Leurs `id` doivent être uniques dans tout le jeu (préfixer aussi). */
  skills: Skill[];
  /**
   * 3 à 6 créatures sauvages, de la plus simple à la plus difficile : les premières peuplent les
   * herbes du sud (niveau 1), les dernières celles du nord (niveau 3).
   */
  creatures: CreatureDef[];
  /** Gardien de la région : il pose des questions de niveau 3 sur ses compétences (souvent toutes). */
  boss: CreatureDef;
  /** Répliques de la gardienne à l'arrivée dans la région (facultatif, sinon un texte générique). */
  guide?: string[];
}

export interface GradeDef {
  id: GradeId;
  /** « Seconde », « 1re spécialité », « Terminale spécialité ». */
  name: string;
  /** Nom de l'île : « Île des Fondations ». */
  island: string;
  /** Chapitres dans l'ordre du manuel. Une classe sans chapitre apparaît « Bientôt » à l'accueil. */
  chapters: ChapterDef[];
}
