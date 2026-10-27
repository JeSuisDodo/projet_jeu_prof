import type { GradeDef } from '../types';
import { enrichChapters } from '../../exercises/variantes';
import { VARIANTES_L2 } from '../../exercises/licence2/variantes';
import { DETERMINANTS } from './determinants';
import { ELEMENTS_PROPRES } from './elementsPropres';
import { DIAGONALISATION } from './diagonalisation';
import { EUCLIDIENS } from './euclidiens';
import { FORMES_QUADRATIQUES } from './formesQuadratiques';
import { SERIES_NUMERIQUES } from './seriesNumeriques';
import { INTEGRALES_GENERALISEES } from './integralesGeneralisees';
import { SUITES_FONCTIONS } from './suitesFonctions';
import { SERIES_ENTIERES } from './seriesEntieres';
import { PLUSIEURS_VARIABLES } from './plusieursVariables';
import { INTEGRALES_DOUBLES } from './integralesDoubles';
import { VARIABLES_DISCRETES } from './variablesDiscretes';
import { VARIABLES_DENSITE } from './variablesDensite';

/** Licence 2 de mathématiques : un fichier par chapitre dans ce dossier, ajouté à la liste ci-dessous. */
export const LICENCE2: GradeDef = {
  id: 'l2',
  name: 'Licence 2',
  stage: 'universite',
  island: 'Île des Valeurs propres',
  chapters: enrichChapters([DETERMINANTS, ELEMENTS_PROPRES, DIAGONALISATION, EUCLIDIENS, FORMES_QUADRATIQUES, SERIES_NUMERIQUES, INTEGRALES_GENERALISEES, SUITES_FONCTIONS, SERIES_ENTIERES, PLUSIEURS_VARIABLES, INTEGRALES_DOUBLES, VARIABLES_DISCRETES, VARIABLES_DENSITE], VARIANTES_L2),
};
