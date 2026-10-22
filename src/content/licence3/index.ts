import type { GradeDef } from '../types';
import { TOPOLOGIE } from './topologie';
import { CALCUL_DIFFERENTIEL } from './calculDifferentiel';
import { EQUATIONS_DIFFERENTIELLES } from './equationsDifferentielles';
import { MESURE } from './mesure';
import { ANALYSE_COMPLEXE } from './analyseComplexe';
import { HILBERT_FOURIER } from './hilbertFourier';
import { GROUPES } from './groupes';
import { ANNEAUX } from './anneaux';
import { PROBABILITES } from './probabilites';
import { STATISTIQUE } from './statistique';
import { ANALYSE_NUMERIQUE } from './analyseNumerique';

/** Licence 3 de mathématiques : un fichier par grand cours dans ce dossier, ajouté à la liste ci-dessous. */
export const LICENCE3: GradeDef = {
  id: 'l3',
  name: 'Licence 3',
  stage: 'universite',
  island: 'Île des Théorèmes',
  chapters: [TOPOLOGIE, CALCUL_DIFFERENTIEL, EQUATIONS_DIFFERENTIELLES, MESURE, ANALYSE_COMPLEXE, HILBERT_FOURIER, GROUPES, ANNEAUX, PROBABILITES, STATISTIQUE, ANALYSE_NUMERIQUE],
};
