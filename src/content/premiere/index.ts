import type { GradeDef } from '../types';
import { APPLICATIONS_DERIVATION } from './applications-derivation';
import { DERIVATION } from './derivation';
import { EXPONENTIELLE } from './exponentielle';
import { GEOMETRIE_REPEREE } from './geometrie-reperee';
import { PROBABILITES_CONDITIONNELLES } from './probabilites-conditionnelles';
import { PRODUIT_SCALAIRE } from './produit-scalaire';
import { SECOND_DEGRE } from './second-degre';
import { SUITES_ARITH_GEO } from './suites-arith-geo';
import { SUITES_NUMERIQUES } from './suites-numeriques';
import { TRIGONOMETRIE } from './trigonometrie';
import { VARIABLES_ALEATOIRES } from './variables-aleatoires';

/** 1re spécialité : un fichier par chapitre dans ce dossier, ajouté à la liste ci-dessous. */
export const PREMIERE: GradeDef = {
  id: '1re-spe',
  name: '1re spécialité',
  stage: 'lycee',
  island: 'Île des Variations',
  chapters: [SECOND_DEGRE, SUITES_NUMERIQUES, SUITES_ARITH_GEO, DERIVATION, APPLICATIONS_DERIVATION, EXPONENTIELLE, TRIGONOMETRIE, PRODUIT_SCALAIRE, GEOMETRIE_REPEREE, PROBABILITES_CONDITIONNELLES, VARIABLES_ALEATOIRES],
};
