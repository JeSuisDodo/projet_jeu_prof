import type { GradeDef } from '../types';
import { enrichChapters } from '../../exercises/variantes';
import { VARIANTES_L1 } from '../../exercises/licence1/variantes';
import { LOGIQUE } from './logique';
import { APPLICATIONS } from './applications';
import { ARITHMETIQUE } from './arithmetique';
import { COMPLEXES } from './complexes';
import { SOMMES } from './sommes';
import { POLYNOMES } from './polynomes';
import { SUITES } from './suites';
import { CONTINUITE } from './continuite';
import { DERIVABILITE } from './derivabilite';
import { DL } from './dl';
import { INTEGRATION } from './integration';
import { EQUADIFF } from './equadiff';
import { SYSTEMES } from './systemes';
import { MATRICES } from './matrices';
import { ESPACES } from './espaces';
import { APPLICATIONS_LINEAIRES } from './applications-lineaires';
import { PROBABILITES } from './probabilites';

/** Licence 1 de mathématiques : un fichier par chapitre dans ce dossier, ajouté à la liste ci-dessous. */
export const LICENCE1: GradeDef = {
  id: 'l1',
  name: 'Licence 1',
  stage: 'universite',
  island: 'Île des Fondements',
  chapters: enrichChapters([LOGIQUE, APPLICATIONS, ARITHMETIQUE, COMPLEXES, SOMMES, POLYNOMES, SUITES, CONTINUITE, DERIVABILITE, DL, INTEGRATION, EQUADIFF, SYSTEMES, MATRICES, ESPACES, APPLICATIONS_LINEAIRES, PROBABILITES], VARIANTES_L1),
};
