import type { GradeDef } from '../types';
import { AIRES } from './aires';
import { ANGLES } from './angles';
import { CALCUL_LITTERAL } from './calcul-litteral';
import { DIVISIBILITE } from './divisibilite';
import { FRACTIONS } from './fractions';
import { PARALLELOGRAMMES } from './parallelogrammes';
import { PRIORITES } from './priorites';
import { PROBABILITES } from './probabilites';
import { PROGRAMMATION } from './programmation';
import { PROPORTIONNALITE } from './proportionnalite';
import { RELATIFS } from './relatifs';
import { STATISTIQUES } from './statistiques';
import { SYMETRIE } from './symetrie';
import { TRIANGLES } from './triangles';
import { VOLUMES } from './volumes';

/** 5e (cycle 4) : un fichier par chapitre dans ce dossier, dans l'ordre d'une progression annuelle. */
export const CINQUIEME: GradeDef = {
  id: '5e',
  name: '5e',
  stage: 'college',
  island: 'Île des Explorateurs',
  chapters: [
    PRIORITES,
    RELATIFS,
    DIVISIBILITE,
    FRACTIONS,
    CALCUL_LITTERAL,
    PROPORTIONNALITE,
    STATISTIQUES,
    PROBABILITES,
    TRIANGLES,
    ANGLES,
    PARALLELOGRAMMES,
    SYMETRIE,
    AIRES,
    VOLUMES,
    PROGRAMMATION,
  ],
};
