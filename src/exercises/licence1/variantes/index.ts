import { catalogue } from '../../licenceVariantes';
import { APPLICATIONS_VARIANTES } from './applications';
import { APPLICATIONS_LINEAIRES_VARIANTES } from './applicationsLineaires';
import { ARITHMETIQUE_VARIANTES } from './arithmetique';
import { COMPLEXES_VARIANTES } from './complexes';
import { CONTINUITE_VARIANTES } from './continuite';
import { DERIVABILITE_VARIANTES } from './derivabilite';
import { DL_VARIANTES } from './dl';
import { EQUADIFF_VARIANTES } from './equadiff';
import { ESPACES_VARIANTES } from './espaces';
import { INTEGRATION_VARIANTES } from './integration';
import { LOGIQUE_VARIANTES } from './logique';
import { MATRICES_VARIANTES } from './matrices';
import { POLYNOMES_VARIANTES } from './polynomes';
import { PROBABILITES_VARIANTES } from './probabilites';
import { SOMMES_VARIANTES } from './sommes';
import { SUITES_VARIANTES } from './suites';
import { SYSTEMES_VARIANTES } from './systemes';

/** Variantes d'exercices de Licence 1 (voir src/exercises/variantes.ts), un fichier par chapitre. */
export const VARIANTES_L1 = catalogue([
  LOGIQUE_VARIANTES,
  APPLICATIONS_VARIANTES,
  ARITHMETIQUE_VARIANTES,
  COMPLEXES_VARIANTES,
  SOMMES_VARIANTES,
  POLYNOMES_VARIANTES,
  SUITES_VARIANTES,
  CONTINUITE_VARIANTES,
  DERIVABILITE_VARIANTES,
  DL_VARIANTES,
  INTEGRATION_VARIANTES,
  EQUADIFF_VARIANTES,
  SYSTEMES_VARIANTES,
  MATRICES_VARIANTES,
  ESPACES_VARIANTES,
  APPLICATIONS_LINEAIRES_VARIANTES,
  PROBABILITES_VARIANTES,
]);
